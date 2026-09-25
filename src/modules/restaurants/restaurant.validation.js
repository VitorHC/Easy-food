const FIELD_LIMITS = { name: 150, category: 100 };

// Retorna dados normalizados ou uma mensagem específica para o formulário.
function validateRestaurant(input = {}) {
  const { name, category, rating = 0 } = input ?? {};
  const fields = { name, category };
  const labels = { name: "Nome", category: "Categoria" };

  for (const [field, maximum] of Object.entries(FIELD_LIMITS)) {
    const value = fields[field];
    if (typeof value !== "string" || !value.trim()) {
      return { error: labels[field] + " é obrigatório." };
    }
    fields[field] = value.trim();
    if (fields[field].length > maximum) {
      return { error: labels[field] + " deve ter no máximo " + maximum + " caracteres." };
    }
  }

  if (typeof rating !== "number" || !Number.isFinite(rating) || rating < 0 || rating > 5) {
    return { error: "A avaliação deve ser um número entre 0 e 5." };
  }

  return { data: { ...fields, rating } };
}

module.exports = { validateRestaurant };
