const prisma = require("../../database/prisma");

function listRestaurants() {
  return prisma.restaurant.findMany();
}

function createRestaurant({ name, category, rating = 0 }) {
  return prisma.restaurant.create({
    data: { name, category, rating }
  });
}

module.exports = { listRestaurants, createRestaurant };
