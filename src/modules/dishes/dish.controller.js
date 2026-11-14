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
async function create(req, res, next) {
  try {
    const id = parseId(req.params.restaurantId);
    const { name, description, price } = req.body || {};
    if (typeof name !== "string" || !name.trim() || name.trim().length > 150 ||
        typeof description !== "string" || !description.trim() || description.length > 5000 ||
        typeof price !== "number" || !Number.isFinite(price) || price <= 0 || price > 99999999.99 ||
        Math.abs(price * 100 - Math.round(price * 100)) > 0.000001) {
      return res.status(400).json({ error: "Informe nome, descrição e preço positivo com até duas casas decimais" });
    }
    res.status(201).json(await service.createDish(id, { name: name.trim(), description: description.trim(), price }));
  } catch (error) { next(error); }
}
async function uploadImage(req, res, next) {
  try {
    const id = parseId(req.params.dishId);
    if (!req.file) return res.status(400).json({ error: "Nenhuma imagem enviada" });
    res.json(await service.uploadDishImage(id, req.file.buffer));
  } catch (error) { next(error); }
}
module.exports = { list, create, uploadImage };
