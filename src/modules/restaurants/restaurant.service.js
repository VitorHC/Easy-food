const prisma = require("../../database/prisma");
const emailService = require("../shared/email.service");
function listRestaurants() { return prisma.restaurant.findMany(); }
async function createRestaurant({ name, category, rating = 0 }) {
  const restaurant = await prisma.restaurant.create({ data: { name, category, rating } });
  const notifications = [
    { to: process.env.EMAIL_TEST_TO, subject: `Bem-vindo à EasyFood, ${name}!`, header: `Olá, ${name}!`, body: `Seu restaurante foi cadastrado com sucesso. Categoria: ${category}.` },
    { to: process.env.EMAIL_COMMERCIAL_TO, subject: `Novo restaurante cadastrado: ${name}`, header: "Novo restaurante na plataforma", body: `Nome: ${name}\nCategoria: ${category}\nAvaliação: ${rating}` }
  ];
  for (const notification of notifications) {
    if (!notification.to) continue;
    try { await emailService.sendEmail({ ...notification, toName: name, footer: "Equipe EasyFood" }); }
    catch (error) { console.error("Falha no envio de e-mail (cadastro preservado):", error.message); }
  }
  return restaurant;
}
module.exports = { listRestaurants, createRestaurant };
