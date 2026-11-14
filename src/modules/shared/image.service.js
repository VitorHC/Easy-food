const sharp = require("sharp");
const path = require("node:path");
const fs = require("node:fs/promises");
const { randomUUID } = require("node:crypto");
const root = path.resolve(__dirname, "../../../uploads");

async function optimizeImage(buffer, folder = "dishes") {
  if (!["dishes", "profiles"].includes(folder)) throw new Error("Destino de imagem inválido");
  const directory = path.join(root, folder);
  let optimized;
  try {
    const image = sharp(buffer, { limitInputPixels: 40000000 });
    const metadata = await image.metadata();
    if (!["jpeg", "png", "webp"].includes(metadata.format)) throw new Error("Formato invÃ¡lido");
    optimized = await image.rotate().resize({ width: 800, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
  } catch {
    const error = new Error("Imagem invÃ¡lida ou excede o limite de processamento");
    error.statusCode = 400;
    throw error;
  }
  await fs.mkdir(directory, { recursive: true });
  const filename = `${randomUUID()}.webp`;
  await fs.writeFile(path.join(directory, filename), optimized);
  return `/uploads/${folder}/${filename}`;
}

async function removeImage(imageUrl) {
  const match = /^\/uploads\/(dishes|profiles)\/([a-f0-9-]+\.webp)$/.exec(imageUrl || "");
  if (!match) return;
  await fs.rm(path.join(root, match[1], match[2]), { force: true });
}
module.exports = { optimizeImage, removeImage };
