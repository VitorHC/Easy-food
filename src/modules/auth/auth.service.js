const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../../database/prisma");

const imageService = require("../shared/image.service");

const JWT_SECRET = process.env.JWT_SECRET;

// Cadastro: guarda o usuÃƒÂ¡rio com a senha em hash
async function register({ name, email, password }) {
  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hash }
  });

  // Nunca devolvemos a senha
  return { id: user.id, name: user.name, email: user.email, imageUrl: user.imageUrl };
}

// Login: confere o e-mail, compara a senha e gera o token
async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return null; // usuÃƒÂ¡rio nÃƒÂ£o existe
  }

  const senhaConfere = await bcrypt.compare(password, user.password);

  if (!senhaConfere) {
    return null; // senha errada
  }

  // Gera o token com o id e email do usuÃƒÂ¡rio, vÃƒÂ¡lido por 1 dia
  const token = jwt.sign(
    { sub: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { token, user: { id: user.id, name: user.name, email: user.email, imageUrl: user.imageUrl } };
}

async function profile(id) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, imageUrl: true }
  });
}
async function uploadProfileImage(id, buffer) {
  const user = await profile(id);
  if (!user) throw Object.assign(new Error("Conta não encontrada"), { statusCode: 401 });
  const imageUrl = await imageService.optimizeImage(buffer, "profiles");
  let updated;
  try {
    updated = await prisma.user.update({
      where: { id }, data: { imageUrl },
      select: { id: true, name: true, email: true, imageUrl: true }
    });
  } catch (error) {
    await imageService.removeImage(imageUrl).catch(() => {});
    throw error;
  }
  await imageService.removeImage(user.imageUrl).catch(error => console.error("Falha ao remover foto anterior:", error.message));
  return updated;
}
module.exports = { register, login, profile, uploadProfileImage };
