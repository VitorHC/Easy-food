const prisma = require("../../database/prisma");
const imageService = require("../shared/image.service");

function notFound(message) {
  return Object.assign(new Error(message), { statusCode: 404 });
}
async function requireRestaurant(id) {
  if (!await prisma.restaurant.findUnique({ where: { id } })) throw notFound("Restaurante não encontrado");
}
async function createDish(restaurantId, { name, description, price }) {
  await requireRestaurant(restaurantId);
  return prisma.dish.create({ data: { name, description, price, restaurantId } });
}
async function listDishes(restaurantId) {
  await requireRestaurant(restaurantId);
  return prisma.dish.findMany({ where: { restaurantId }, orderBy: { id: "asc" } });
}
async function uploadDishImage(id, buffer) {
  const dish = await prisma.dish.findUnique({ where: { id } });
  if (!dish) throw notFound("Prato não encontrado");
  const imageUrl = await imageService.optimizeImage(buffer);
  let updated;
  try {
    updated = await prisma.dish.update({ where: { id }, data: { imageUrl } });
  } catch (error) {
    await imageService.removeImage(imageUrl).catch(() => {});
    throw error;
  }
  await imageService.removeImage(dish.imageUrl).catch(error => console.error("Falha ao remover imagem anterior:", error.message));
  return updated;
}
module.exports = { createDish, listDishes, uploadDishImage };
