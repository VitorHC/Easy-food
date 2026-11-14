const authService = require("./auth.service");

async function register(req, res) {
  const { name, email, password } = req.body || {};

  if (typeof name !== "string" || !name.trim() || name.trim().length > 150 || typeof email !== "string" || email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || typeof password !== "string" || password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    return res.status(400).json({ error: "Nome, e-mail e senha sÃƒÆ’Ã‚Â£o obrigatÃƒÆ’Ã‚Â³rios" });
  }

  try {
    const user = await authService.register({ name: name.trim(), email: email.trim().toLowerCase(), password });
    res.status(201).json(user);
  } catch (error) {
    // Erro comum: e-mail duplicado (violaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o do @unique)
    if (error.code === "P2002") {
      return res.status(409).json({ error: "E-mail jÃƒÆ’Ã‚Â¡ cadastrado" });
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function login(req, res) {
  const { email, password } = req.body || {};

  if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
    return res.status(400).json({ error: "E-mail e senha sÃƒÆ’Ã‚Â£o obrigatÃƒÆ’Ã‚Â³rios" });
  }

  try {
    const result = await authService.login({ email: email.trim().toLowerCase(), password });

    if (!result) {
      return res.status(401).json({ error: "Credenciais invÃƒÆ’Ã‚Â¡lidas" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function me(req, res) {
  try {
    const user = await authService.profile(req.user.id);
    if (!user) return res.status(401).json({ error: "Conta nÃ£o encontrada" });
    res.json({ user });
  } catch {
    res.status(500).json({ error: "NÃ£o foi possÃ­vel consultar sua conta" });
  }
}
async function uploadImage(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: "Nenhuma imagem enviada" });
    const user = await authService.uploadProfileImage(req.user.id, req.file.buffer);
    res.json({ user });
  } catch (error) { next(error); }
}
module.exports = { register, login, me, uploadImage };