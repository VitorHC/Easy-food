const restaurantService = require("./restaurant.service");
const { validateRestaurant } = require("./restaurant.validation");

async function list(req, res) {
  try {
    const restaurants = await restaurantService.listRestaurants();
    return res.json(restaurants);
  } catch (error) {
    console.error("Falha na consulta de restaurantes:", error.message);
    return res.status(500).json({ error: "Não foi possível consultar os restaurantes." });
  }
}

async function create(req, res) {
  const result = validateRestaurant(req.body);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  try {
    const restaurant = await restaurantService.createRestaurant(result.data);
    return res.status(201).json(restaurant);
  } catch (error) {
    console.error("Falha no cadastro de restaurante:", error.message);
    return res.status(500).json({ error: "Não foi possível cadastrar o restaurante." });
  }
}

module.exports = { list, create };
