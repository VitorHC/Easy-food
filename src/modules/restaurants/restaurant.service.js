const prisma = require("../../database/prisma");
const emailService = require("../shared/email.service");
function listRestaurants() { return prisma.restaurant.findMany(); }
async function createRestaurant({ name, category, rating = 0 }, user) {
  const restaurant = await prisma.restaurant.create({ data: { name, category, rating, ownerId: user.id } });
  const notifications = [
<<<<<<< HEAD
    { to: process.env.EMAIL_TO, subject: `Bem-vindo à EasyFood, ${name}!`, header: `Olá, ${name}!`, body: `Seu restaurante foi cadastrado com sucesso. Categoria: ${category}.` },
=======
    { to: user.email, subject: `Bem-vindo à EasyFood, ${name}!`, header: `Olá, ${name}!`, body: `Seu restaurante foi cadastrado com sucesso. Categoria: ${category}.` },
>>>>>>> 19ed80166fd21a947dd7279905826d12644088b9
    { to: process.env.EMAIL_COMMERCIAL_TO, subject: `Novo restaurante cadastrado: ${name}`, header: "Novo restaurante na plataforma", body: `Nome: ${name}\nCategoria: ${category}\nAvaliação: ${rating}` }
  ];
  for (const notification of notifications) {
    if (!notification.to) continue;
    try { await emailService.sendEmail({ ...notification, toName: name, footer: "Equipe EasyFood" }); }
    catch (error) { console.error("Falha no envio de e-mail (cadastro preservado):", error.message); }
  }
  try { await require("../shared/activity.service").log("RESTAURANT_CREATED", `Restaurante: ${restaurant.name}; ID: ${restaurant.id}`); }
  catch (error) { console.error("Falha ao registrar atividade:", error.message); }
  return restaurant;
}
module.exports = { listRestaurants, createRestaurant };
