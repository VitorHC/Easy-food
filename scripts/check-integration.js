require("dotenv").config({quiet:true});
const assert = require("node:assert/strict");
const {spawn} = require("node:child_process");
const {once} = require("node:events");
const net = require("node:net");
const prisma = require("../src/database/prisma");
let child, userId, restaurantId;
async function start() {
 const socket=net.createServer();socket.listen(0,"127.0.0.1");await once(socket,"listening");const port=socket.address().port;await new Promise(r=>socket.close(r));
 child=spawn(process.execPath,["server.js"],{cwd:require("node:path").join(__dirname,".."),env:{...process.env,PORT:String(port)},stdio:["ignore","pipe","pipe"],windowsHide:true});
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error("Servidor não iniciou")),10000);child.stdout.on("data",b=>{if(b.toString().includes("rodando")){clearTimeout(timer);resolve();}});child.once("exit",()=>{clearTimeout(timer);reject(new Error("Servidor encerrou"));});});
 return "http://127.0.0.1:"+port;
}
async function stop(){if(child&&child.exitCode===null){const done=once(child,"exit");child.kill();await done;}child=null;}
(async()=>{
 const email="integration-"+require("node:crypto").randomUUID()+"@example.test";
 const password="Test-only-password-93!";
 let base=await start();
 async function request(path,body,token){const r=await fetch(base+path,{method:body?"POST":"GET",headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()};}
 try{
  let r=await request("/auth/register",{name:"Teste temporário",email,password});assert.equal(r.status,201);userId=r.data.id;assert.equal(r.data.password,undefined);
  assert.equal((await request("/auth/register",{name:"Teste",email,password})).status,409);
  assert.equal((await request("/auth/login",{email,password:"incorreta"})).status,401);
  r=await request("/auth/login",{email,password});assert.equal(r.status,200);const token=r.data.token;
  assert.equal((await request("/auth/me",null,token)).data.user.name,"Teste temporário");
  r=await request("/restaurants",{name:"Teste persistência "+email,category:"Teste",rating:4.3},token);assert.equal(r.status,201);restaurantId=r.data.id;
  await stop();base=await start();
  r=await request("/restaurants");assert.equal(r.status,200);assert.ok(r.data.some(x=>x.id===restaurantId));
  console.log("PASS: cadastro, duplicidade, senha incorreta, login, sessão, POST autenticado e persistência após reiniciar o processo.");
 }finally{
  await stop();
  if(restaurantId)await prisma.restaurant.delete({where:{id:restaurantId}});
  if(userId)await prisma.user.delete({where:{id:userId}});
  await prisma.$disconnect();
  console.log("Registros temporários removidos.");
 }
})().catch(async e=>{console.error(e.message);await stop();await prisma.$disconnect();process.exitCode=1;});
