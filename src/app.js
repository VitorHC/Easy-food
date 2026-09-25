const express = require("express");
const cors = require("cors");
const path = require("path");

const restaurantRoutes = require("./modules/restaurants/restaurant.routes");
const authRoutes = require("./modules/auth/auth.routes");

const app = express();
const publicDirectory = path.resolve(__dirname, "..", "public");

app.use(cors());
app.use(express.json());
app.use(express.static(publicDirectory));

app.use("/auth", authRoutes);
app.use("/restaurants", restaurantRoutes);

module.exports = app;
