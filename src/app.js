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

app.use(require("./modules/dishes/dish.routes"));
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.code === "LIMIT_FILE_SIZE" ? 413
    : error.name === "MulterError" ? 400 : error.statusCode || error.status || 500;
  if (status >= 500) console.error("Falha na requisição:", error.message);
  res.status(status).json({ error: status === 413 ? "Arquivo excede o limite de 5 MB"
    : status >= 500 ? "Erro interno do servidor" : error.message });
});
module.exports = app;
