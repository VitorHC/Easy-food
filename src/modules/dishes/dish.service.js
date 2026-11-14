const prisma = require("../../database/prisma");
const imageService = require("../shared/image.service");

function notFound(message) {
  return Object.assign(new Error(message), { statusCode: 404 });
}
function parseId(value) {
  const id = Number(value);
  if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(id) || id < 1 || id > 2147483647) throw Object.assign(new Error("Identificador inválido"), { statusCode: 400 });
  return id;
}
async function requireRestaurant(id) {
  const record = await prisma.restaurant.findUnique({ where: { id } });
  if (!record) throw notFound("Restaurante não encontrado");
  return record;
}
function authorize(record, userId) {
  if (record.ownerId !== userId) throw Object.assign(new Error("Somente o proprietário pode gerenciar este cardápio"), { statusCode: 403 });
}
async function getDish(id) {
  const dish = await prisma.dish.findUnique({ where: { id: parseId(id) } });
  if (!dish) throw notFound("Prato não encontrado");
  return dish;
}
async function ownedDish(id, userId) {
  const dish = await getDish(id);
  authorize(await requireRestaurant(dish.restaurantId), userId);
  return dish;
}
async function updateDish(id, data, userId) {
  const dish = await ownedDish(id, userId);
  return prisma.dish.update({ where: { id: dish.id }, data });
}
async function deleteDish(id, userId) {
  const dish = await ownedDish(id, userId);
  await prisma.dish.delete({ where: { id: dish.id } });
  await imageService.removeImage(dish.imageUrl).catch(error => console.error("Falha ao remover imagem:", error.message));
}
async function createDish(restaurantId, { name, category, description, price }, userId) {
  authorize(await requireRestaurant(restaurantId), userId);
  return prisma.dish.create({ data: { name, category, description, price, restaurantId } });
}
async function listDishes(restaurantId) {
  await requireRestaurant(restaurantId);
  return prisma.dish.findMany({ where: { restaurantId }, orderBy: { id: "asc" } });
}
async function uploadDishImage(id, buffer, userId) {
  const dish = await ownedDish(id, userId);
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
module.exports = { createDish, listDishes, uploadDishImage, getDish, updateDish, deleteDish, parseId };
