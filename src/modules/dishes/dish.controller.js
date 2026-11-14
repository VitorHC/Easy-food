const service = require("./dish.service");
function parseId(value) {
  const id = Number(value);
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(id) || id < 1 || id > 2147483647) {
    throw Object.assign(new Error("Identificador inválido"), { statusCode: 400 });
  }
  return id;
}
async function list(req, res, next) {
  try { res.json(await service.listDishes(parseId(req.params.restaurantId))); } catch (error) { next(error); }
}
function validate(data = {}) {
  const { name, category, description, price } = data || {};
  if (typeof name !== "string" || !name.trim() || name.trim().length > 150 ||
      typeof category !== "string" || !category.trim() || category.trim().length > 100 ||
      typeof description !== "string" || !description.trim() || description.length > 5000 ||
      typeof price !== "number" || !Number.isFinite(price) || price < 0 || price > 99999999.99 ||
      Math.abs(price * 100 - Math.round(price * 100)) > 0.000001) throw Object.assign(new Error("Informe nome, categoria, descrição e preço não negativo com até duas casas decimais"), { statusCode: 400 });
  return { name: name.trim(), category: category.trim(), description: description.trim(), price };
}
async function create(req, res, next) {
  try { res.status(201).json(await service.createDish(parseId(req.params.restaurantId), validate(req.body), req.user.id)); } catch (error) { next(error); }
}
async function getById(req, res, next) {
  try { res.json(await service.getDish(parseId(req.params.dishId))); } catch (error) { next(error); }
}
async function update(req, res, next) {
  try { res.json(await service.updateDish(parseId(req.params.dishId), validate(req.body), req.user.id)); } catch (error) { next(error); }
}
async function remove(req, res, next) {
  try { await service.deleteDish(parseId(req.params.dishId), req.user.id); res.status(204).end(); } catch (error) { next(error); }
}
async function uploadImage(req, res, next) {
  try {
    const id = parseId(req.params.dishId);
    if (!req.file) return res.status(400).json({ error: "Nenhuma imagem enviada" });
    res.json(await service.uploadDishImage(id, req.file.buffer, req.user.id));
  } catch (error) { next(error); }
}
module.exports = { list, create, uploadImage, getById, update, remove };
