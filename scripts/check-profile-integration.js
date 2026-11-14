require("dotenv").config({ quiet: true });
const assert = require("node:assert/strict");
const { once } = require("node:events");
const { randomUUID } = require("node:crypto");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");
const prisma = require("../src/database/prisma");
const images = require("../src/modules/shared/image.service");
const app = require("../src/app");
(async () => {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  const password = "Temporary-password-93!";
  const users = [], files = [];
  async function json(route, body) {
    return fetch(base + route, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  }
  async function upload(buffer, type, token, extra = {}) {
    const body = new FormData();
    if (buffer) body.append("image", new Blob([buffer], { type }), "test-image");
    return fetch(base + "/auth/me/image" + (extra.query || ""), { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body });
  }
  try {
    for (let index = 0; index < 2; index++) {
      const email = `profile-${randomUUID()}@example.test`;
      const response = await json("/auth/register", { name: "Teste perfil", email, password });
      assert.equal(response.status, 201);
      users.push(await response.json());
    }
    const response = await json("/auth/login", { email: users[0].email, password });
    const { token } = await response.json();
    assert.ok(token);
    assert.equal((await upload(Buffer.from("test"), "text/plain")).status, 401);
    assert.equal((await upload(null, "image/png", token)).status, 400);
    assert.equal((await upload(Buffer.from("text"), "text/plain", token)).status, 400);
    assert.equal((await upload(Buffer.from("fake"), "image/png", token)).status, 400);
    assert.equal((await upload(Buffer.alloc(5 * 1024 * 1024 + 1), "image/png", token)).status, 413);
    const missingToken = jwt.sign({ sub: 2147483647 }, process.env.JWT_SECRET);
    const original = await sharp({ create: { width: 1200, height: 900, channels: 3, background: "green" } }).png().toBuffer();
    assert.equal((await upload(original, "image/png", missingToken)).status, 401);
    const result = await upload(original, "image/png", token, { query: `?userId=${users[1].id}` });
    assert.equal(result.status, 200);
    const { user } = await result.json();
    files.push(user.imageUrl);
    assert.equal(user.id, users[0].id);
    assert.equal(user.password, undefined);
    assert.match(user.imageUrl, /^\/uploads\/profiles\//);
    assert.equal((await prisma.user.findUnique({ where: { id: users[1].id } })).imageUrl, null);
    const profile = await fetch(base + "/auth/me", { headers: { Authorization: `Bearer ${token}` } });
    assert.equal((await profile.json()).user.imageUrl, user.imageUrl);
    const login = await (await json("/auth/login", { email: users[0].email, password })).json();
    assert.equal(login.user.imageUrl, user.imageUrl);
    const image = await fetch(base + user.imageUrl); assert.equal(image.status, 200);
    const metadata = await sharp(Buffer.from(await image.arrayBuffer())).metadata();
    assert.equal(metadata.width, 800); assert.equal(metadata.format, "webp");
    assert.equal((await upload(Buffer.from("fake"), "image/png", token)).status, 400);
    assert.equal((await prisma.user.findUnique({ where: { id: users[0].id } })).imageUrl, user.imageUrl);
    const replacement = await upload(original, "image/png", token); assert.equal(replacement.status, 200);
    files.push((await replacement.json()).user.imageUrl);
    assert.equal((await fetch(base + user.imageUrl)).status, 404);
    console.log("PASS: perfil do JWT, isolamento entre usuários, otimização, consulta/login, URL pública, substituição e preservação da foto após falha.");
  } finally {
    await new Promise(resolve => server.close(resolve));
    for (const user of users) await prisma.user.delete({ where: { id: user.id } });
    for (const file of files) await images.removeImage(file);
    await prisma.$disconnect();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
