require("dotenv").config({ quiet: true });
const assert = require("node:assert/strict");
const { once } = require("node:events");
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");
const prisma = require("../src/database/prisma");
const emailService = require("../src/modules/shared/email.service");
const imageService = require("../src/modules/shared/image.service");
const app = require("../src/app");

(async () => {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  const owner = await prisma.user.create({ data: { name: "Teste cardápio", email: `menu-${require("node:crypto").randomUUID()}@example.test`, password: "not-used-test-hash" } });
  const other = await prisma.user.create({ data: { name: "Outra conta", email: `menu-${require("node:crypto").randomUUID()}@example.test`, password: "not-used-test-hash" } });
  const otherToken = jwt.sign({ sub: other.id, email: other.email }, process.env.JWT_SECRET);
  const token = jwt.sign({ sub: owner.id, email: owner.email }, process.env.JWT_SECRET, { expiresIn: "5m" });
  const authorization = `Bearer ${token}`;
  let restaurantId, dishId, imageUrl;
  const originalSend = emailService.sendEmail;
  const originalTestTo = process.env.EMAIL_TO;
  const originalCommercialTo = process.env.EMAIL_COMMERCIAL_TO;
  const notices = [];
  emailService.sendEmail = async message => { notices.push(message); throw new Error("Falha simulada"); };
  process.env.EMAIL_TO = "test@example.test";
  process.env.EMAIL_COMMERCIAL_TO = "commercial@example.test";
  async function post(url, data, authenticated = true) {
    return fetch(base + url, { method: "POST", headers: { "Content-Type": "application/json", ...(authenticated ? { authorization } : {}) }, body: JSON.stringify(data) });
  }
  async function upload(bytes, type = "image/png", authenticated = true, id = dishId) {
    const body = new FormData();
    if (bytes) body.append("image", new Blob([bytes], { type }), "image.png");
    return fetch(base + `/dishes/${id}/image`, { method: "POST", headers: authenticated ? { authorization } : {}, body });
  }
  try {
    let response = await post("/restaurants", { name: "Teste pratos " + Date.now(), category: "Teste", rating: 4 });
    assert.equal(response.status, 201);
    restaurantId = (await response.json()).id;
    assert.equal(notices.length, 2);
    assert.equal(notices[0].to, owner.email);
    assert.ok(await prisma.activity.findFirst({ where: { action: "RESTAURANT_CREATED", details: { endsWith: `ID: ${restaurantId}` } } }));
    assert.equal((await prisma.restaurant.findUnique({ where: { id: restaurantId } })).ownerId, owner.id);
    assert.notEqual(notices[0].subject, notices[1].subject);
    assert.ok(await prisma.restaurant.findUnique({ where: { id: restaurantId } }));
    const route = `/restaurants/${restaurantId}/dishes`;
    const data = { name: "Pizza", description: "Tomate e queijo", category: "Pizza", price: 49.90 };
    assert.equal((await post(route, data, false)).status, 401);
    for (const invalid of [{ ...data, name: " " }, { ...data, price: -1 }, { ...data, price: "49.90" }, { ...data, price: 1.234 }, { ...data, description: null }]) {
      assert.equal((await post(route, invalid)).status, 400);
    }
    assert.equal((await post("/restaurants/abc/dishes", data)).status, 400);
    assert.equal((await post("/restaurants/2147483647/dishes", data)).status, 404);
    response = await post(route, data);
    assert.equal(response.status, 201);
    const dish = await response.json(); dishId = dish.id;
    assert.equal(dish.imageUrl, null);
    assert.equal(dish.category, "Pizza");
    assert.equal((await (await fetch(base + `/dishes/${dishId}`)).json()).id, dishId);
    for (const [url, method, body] of [[route, "POST", data], [`/dishes/${dishId}`, "PUT", data], [`/dishes/${dishId}`, "DELETE", null]]) {
      assert.equal((await fetch(base + url, { method, headers: { Authorization: `Bearer ${otherToken}`, "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) })).status, 403);
    }
    const edited = await fetch(base + `/dishes/${dishId}`, { method: "PUT", headers: { authorization, "Content-Type": "application/json" }, body: JSON.stringify({ ...data, name: "Pizza atualizada" }) });
    assert.equal(edited.status, 200); assert.equal((await edited.json()).name, "Pizza atualizada");
    assert.equal(Number(dish.price), 49.9); assert.equal(dish.restaurantId, restaurantId);
    assert.ok((await (await fetch(base + route)).json()).some(item => item.id === dishId));
    assert.equal((await upload(null)).status, 400);
    assert.equal((await upload(Buffer.from("texto"), "text/plain")).status, 400);
    assert.equal((await upload(Buffer.from("imagem falsa"))).status, 400);
    assert.equal((await upload(Buffer.alloc(5 * 1024 * 1024 + 1))).status, 413);
    assert.equal((await upload(Buffer.from("texto"), "text/plain", false)).status, 401);
    assert.equal((await upload(Buffer.from("texto"), "image/png", true, 2147483647)).status, 404);
    assert.equal((await prisma.dish.findUnique({ where: { id: dishId } })).imageUrl, null);
    const original = await sharp({ create: { width: 1600, height: 1000, channels: 3, background: "orange" } }).png().toBuffer();
    response = await upload(original); assert.equal(response.status, 200);
    imageUrl = (await response.json()).imageUrl;
    const image = await fetch(base + imageUrl); assert.equal(image.status, 200);
    const bytes = Buffer.from(await image.arrayBuffer());
    const metadata = await sharp(bytes).metadata();
    assert.equal(metadata.format, "webp"); assert.equal(metadata.width, 800); assert.equal(metadata.height, 500);
    console.log(JSON.stringify({ original: { format: "png", bytes: original.length, width: 1600, height: 1000 }, optimized: { format: metadata.format, bytes: bytes.length, width: metadata.width, height: metadata.height } }));
    assert.equal((await (await fetch(base + route)).json())[0].imageUrl, imageUrl);
    const forbiddenUpload = new FormData(); forbiddenUpload.append("image", new Blob([original], { type: "image/png" }), "image.png");
    assert.equal((await fetch(base + `/dishes/${dishId}/image`, { method: "POST", headers: { Authorization: `Bearer ${otherToken}` }, body: forbiddenUpload })).status, 403);
    const previousUrl = imageUrl;
    response = await upload(original); assert.equal(response.status, 200);
    imageUrl = (await response.json()).imageUrl;
    await assert.rejects(fs.access(path.resolve(__dirname, "..", previousUrl.slice(1))));
    assert.equal((await fetch(base + `/dishes/${dishId}`, { method: "DELETE", headers: { authorization } })).status, 204);
    assert.equal((await fetch(base + `/dishes/${dishId}`)).status, 404);
    assert.equal((await fetch(base + imageUrl)).status, 404);
    dishId = null;
    console.log("PASS: CRUD e categoria, autorização por proprietário, consulta com imagem e exclusão do arquivo.");
    console.log("PASS: duas notificações com falha preservam cadastro; pratos, JWT, validação, consulta, imagem pública, substituição e falhas de upload.");
  } finally {
    emailService.sendEmail = originalSend;
    for (const [key, value] of [["EMAIL_TO", originalTestTo], ["EMAIL_COMMERCIAL_TO", originalCommercialTo]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    await new Promise(resolve => server.close(resolve));
    if (dishId) await prisma.dish.delete({ where: { id: dishId } });
    if (restaurantId) await prisma.activity.deleteMany({ where: { action: "RESTAURANT_CREATED", details: { endsWith: `ID: ${restaurantId}` } } });
    if (restaurantId) await prisma.restaurant.delete({ where: { id: restaurantId } });
    if (imageUrl) await imageService.removeImage(imageUrl);
    await prisma.user.deleteMany({ where: { id: { in: [owner.id, other.id] } } });
    await prisma.$disconnect();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
