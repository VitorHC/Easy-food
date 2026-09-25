const $ = (id) => document.getElementById(id);
let restaurants = [];
let limit = 6;
let authMode = 'login';
let pendingRestaurant = false;
let token = sessionStorage.getItem('easyfood-token');
let user = null;

function message(id, text) { $(id).textContent = text; }
function toast(text) { message('toast', text); $('toast').hidden = false; clearTimeout(toast.timer); toast.timer = setTimeout(() => $('toast').hidden = true, 4500); }
function account() { $('account-button').textContent = user ? 'Sair · ' + user.name.split(' ')[0] : 'Entrar ↗'; }
function logout() { token = null; user = null; sessionStorage.removeItem('easyfood-token'); account(); }
async function request(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...options.headers } });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401 && token) logout();
    throw new Error(data.error || 'Não foi possível concluir. Tente novamente.');
  }
  return data;
}
function setAuthMode(mode) {
  authMode = mode;
  $('name-field').hidden = mode !== 'register';
  $('user-name').required = mode === 'register';
  $('password').autocomplete = mode === 'register' ? 'new-password' : 'current-password';
  $('auth-submit').textContent = mode === 'register' ? 'Criar minha conta' : 'Entrar';
  $('login-tab').classList.toggle('active', mode === 'login');
  $('register-tab').classList.toggle('active', mode === 'register');
  message('auth-message', '');
}
function openRestaurant() {
  if (!token) { pendingRestaurant = true; setAuthMode('login'); $('auth-dialog').showModal(); return; }
  message('restaurant-message', '');
  $('restaurant-dialog').showModal();
}
function render() {
  const term = $('search').value.trim().toLocaleLowerCase('pt-BR');
  const category = $('category').value;
  const filtered = restaurants.filter(r => (!category || r.category === category) && r.name.toLocaleLowerCase('pt-BR').includes(term));
  $('result-count').textContent = filtered.length + (filtered.length === 1 ? ' restaurante' : ' restaurantes');
  const list = $('restaurant-list');
  list.replaceChildren();
  if (!filtered.length) {
    const p = document.createElement('p'); p.className = 'state'; p.textContent = restaurants.length ? 'Nenhum resultado. Experimente outra busca ou categoria.' : 'O primeiro sabor pode ser o seu. Cadastre um restaurante!'; list.append(p);
  }
  const palette = ['#e9e4d2', '#e4e9dc', '#f2dfd1', '#e3e9ec'];
  filtered.slice(0, limit).forEach((r, i) => {
    const card = document.createElement('article'); card.className = 'card';
    // Only static markup goes through innerHTML. Database values use textContent.
    card.innerHTML = '<div class="card-art"><span class="card-number"></span><span class="dish" aria-hidden="true"></span></div><div class="card-content"><div class="card-top"><h3></h3><span class="rating"></span></div><div class="card-bottom"><span class="tag"></span><span class="card-mark" aria-hidden="true">✳</span></div></div>';
    card.style.setProperty('--card-color', palette[i % palette.length]);
    const cat = (r.category || '').toLowerCase();
    const emoji = /pizza/.test(cat) ? '🍕' : /burger|hamb/.test(cat) ? '🍔' : /japon|sushi/.test(cat) ? '🍣' : /pão|padar/.test(cat) ? '🥐' : /dog/.test(cat) ? '🌭' : /saud|veg/.test(cat) ? '🥗' : /churras/.test(cat) ? '🥩' : /italian/.test(cat) ? '🍝' : /mexic/.test(cat) ? '🌮' : /frutos/.test(cat) ? '🦐' : /doces/.test(cat) ? '🍰' : /cafet/.test(cat) ? '☕' : /árabe/.test(cat) ? '🧆' : /brasileir/.test(cat) ? '🍛' : '🍽️';
    card.querySelector('.dish').textContent = emoji;
    card.querySelector('.card-number').textContent = 'DESCOBERTA ' + String(i + 1).padStart(2, '0');
    card.querySelector('h3').textContent = r.name;
    card.querySelector('.tag').textContent = r.category || 'Outros sabores';
    card.querySelector('.rating').textContent = r.rating == null ? 'Sem nota' : '★ ' + Number(r.rating).toFixed(1).replace('.', ',');
    list.append(card);
  });
  $('load-more').hidden = filtered.length <= limit;
}
async function loadRestaurants() {
  try {
    restaurants = await request('/restaurants');
    if (!Array.isArray(restaurants)) throw new Error('Resposta inesperada do servidor.');
    const selected = $('category').value;
    $('category').replaceChildren(new Option('Todas as categorias', ''));
    [...new Set(restaurants.map(r => r.category).filter(Boolean))].sort((a,b) => a.localeCompare(b)).forEach(c => $('category').add(new Option(c,c)));
    $('category').value = selected;
    render();
  } catch (error) {
    const p = document.createElement('div'); p.className = 'state';
    const text = document.createElement('p'); text.textContent = 'Não foi possível carregar os restaurantes. Tente novamente em instantes.';
    const retry = document.createElement('button'); retry.className = 'button outline'; retry.textContent = 'Tentar novamente'; retry.onclick = loadRestaurants;
    p.append(text, retry); $('restaurant-list').replaceChildren(p); $('load-more').hidden = true;
    message('result-count', 'Consulta indisponível');
  }
}
$('search').addEventListener('input', () => { limit = 6; render(); });
$('category').addEventListener('change', () => { limit = 6; render(); });
$('load-more').onclick = () => { limit += 6; render(); };
$('add-button').onclick = openRestaurant;
$('invite-button').onclick = openRestaurant;
$('account-button').onclick = () => {
  if (user) { logout(); toast('Você saiu da sua conta.'); }
  else { pendingRestaurant = false; setAuthMode('login'); $('auth-dialog').showModal(); }
};
$('login-tab').onclick = () => setAuthMode('login');
$('register-tab').onclick = () => setAuthMode('register');
document.querySelectorAll('[data-close]').forEach(button => button.onclick = () => $(button.dataset.close).close());
$('auth-dialog').addEventListener('close', () => { $('auth-form').reset(); message('auth-message', ''); });
$('auth-form').addEventListener('submit', async event => {
  event.preventDefault();
  const button = $('auth-submit'); button.disabled = true; message('auth-message', '');
  const email = $('email').value.trim(); const password = $('password').value;
  try {
    if (authMode === 'register') {
      await request('/auth/register', { method: 'POST', body: JSON.stringify({ name: $('user-name').value.trim(), email, password }) });
      setAuthMode('login');
      message('auth-message', 'Conta criada. Entrando…');
    }
    const result = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    token = result.token; user = result.user; sessionStorage.setItem('easyfood-token', token); account();
    $('auth-dialog').close(); toast('Bem-vindo, ' + user.name + '!');
    if (pendingRestaurant) { pendingRestaurant = false; openRestaurant(); }
  } catch (error) { message('auth-message', error.message === 'Failed to fetch' ? 'Sem conexão com o servidor. Tente novamente.' : error.message); }
  finally { button.disabled = false; }
});
$('restaurant-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget; const button = form.querySelector('button'); button.disabled = true;
  message('restaurant-message', '');
  const data = new FormData(form);
  try {
    await request('/restaurants', { method: 'POST', body: JSON.stringify({ name: data.get('name').trim(), category: data.get('category').trim(), rating: Number(data.get('rating')) }) });
    form.reset(); $('restaurant-dialog').close(); $('search').value = ''; $('category').value = ''; limit = 6;
    await loadRestaurants(); toast('Restaurante publicado. Uma nova descoberta no guia!'); $('explorar').scrollIntoView();
  } catch (error) {
    if (!token) { $('restaurant-dialog').close(); openRestaurant(); message('auth-message', 'Sua sessão expirou. Entre novamente para publicar.'); }
    else message('restaurant-message', error.message === 'Failed to fetch' ? 'Sem conexão com o servidor. Tente novamente.' : error.message);
  } finally { button.disabled = false; }
});
async function init() {
  if (token) {
    try { const result = await request('/auth/me'); user = result.user; }
    catch { logout(); }
  }
  account(); await loadRestaurants();
}
init();
