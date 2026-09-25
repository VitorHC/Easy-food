const restaurantService = require("./restaurant.service");

async function  list(req, res) {
    try {
    const restaurantes = await restaurantService.listRestaurants();
    res.json(restaurantes);
  } catch (error) {
    console.error("Erro ao buscar restaurantes:", error.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
    
}


async function create(req,res) {
    const { name, category, rating = 0 } = req.body || {};

  if (typeof name !== "string" || !name.trim() || name.trim().length > 150 || typeof category !== "string" || !category.trim() || category.trim().length > 100) {
    return res.status(400).json({ error: "Nome e categoria sÃ£o obrigatÃ³rios" });
  }

  if (typeof rating !== "number" || !Number.isFinite(rating) || rating < 0 || rating > 5) {
    return res.status(400).json({ error: "A avaliação deve ser um número entre 0 e 5" });
  }

  try {
    const restaurant = await restaurantService.createRestaurant({
      name: name.trim(),
      category: category.trim(),
      rating: rating || 0
    });

    res.status(201).json(restaurant);
  } catch (error) {
    console.error("Erro ao cadastrar restaurante:", error.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
    
}

module.exports = {list, create};