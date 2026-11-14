const multer = require("multer");
module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0, parts: 2 },
  fileFilter(req, file, callback) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      const error = new Error("Formato de imagem não permitido: use JPEG, PNG ou WebP");
      error.statusCode = 400;
      return callback(error);
    }
    callback(null, true);
  }
});
