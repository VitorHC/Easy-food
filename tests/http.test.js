const { test } = require("node:test");
const assert = require("node:assert/strict");
process.env.JWT_SECRET = "unit-test-only-secret";
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const prisma = require("../src/database/prisma");
test("HTTP: página, proteção JWT e validação sem gravar no banco", async () => {
 const server = app.listen(0, "127.0.0.1");
 await new Promise(resolve => server.once("listening", resolve));
 const base = "http://127.0.0.1:" + server.address().port;
 try {
  const page = await fetch(base); assert.equal(page.status, 200); assert.match(await page.text(), /Seu próximo/);
  const post = body => fetch(base + "/restaurants", {method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+jwt.sign({sub:1},process.env.JWT_SECRET)},body:JSON.stringify(body)});
  assert.equal((await fetch(base+"/restaurants",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"})).status,401);
  for(const body of [{name:" ",category:"Pizza"},{name:"Teste",category:"Pizza",rating:6},{name:"Teste",category:"Pizza",rating:"4.5"}]) assert.equal((await post(body)).status,400);
  assert.equal((await fetch(base+"/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:"Teste",email:"invalido",password:"curta"})})).status,400);
 } finally {await new Promise(resolve=>server.close(resolve)); await prisma.$disconnect();}
});
