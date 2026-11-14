const $ = (id) => document.getElementById(id);
let restaurants = [];
let limit = 6;
let authMode = 'login';
let pendingRestaurant = false;
let token = sessionStorage.getItem('easyfood-token');
let user = null;

function message(id, text) { $(id).textContent = text; }
function toast(text) { message('toast', text); $('toast').hidden = false; clearTimeout(toast.timer); toast.timer = setTimeout(() => $('toast').hidden = true, 4500); }
function account() { $('profile-button').hidden = !user; $('account-button').textContent = user ? 'Sair · ' + user.name.split(' ')[0] : 'Entrar ↗'; }
function logout() { if ($('menu-dialog').open) $('menu-dialog').close(); if ($('profile-dialog').open) $('profile-dialog').close(); token = null; user = null; sessionStorage.removeItem('easyfood-token'); account(); }
async function request(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: 'Bearer ' + token } : {}), ...options.headers } });
  const data = response.status === 204 ? null : await response.json();
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
    const menuButton = document.createElement('button'); menuButton.type = 'button'; menuButton.className = 'text-button menu-button'; menuButton.textContent = 'Ver cardápio →'; menuButton.onclick = () => openMenu(r);
    card.querySelector('.card-content').append(menuButton);
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
let selectedRestaurant = null;
let menuVersion = 0;
function canManageMenu() { return user && selectedRestaurant && selectedRestaurant.ownerId === user.id; }
function resetDishForm() { $('dish-form').reset(); $('dish-form').hidden = true; message('dish-message', ''); }
async function openMenu(restaurant) {
  selectedRestaurant = restaurant;
  $('menu-title').textContent = 'Cardápio · ' + restaurant.name;
  resetDishForm();
  $('menu-dialog').showModal();
  await loadMenu();
}
async function loadMenu() {
  const version = ++menuVersion;
  message('menu-message', '');
  $('new-dish').hidden = !canManageMenu();
  $('dish-list').replaceChildren();
  try {
    const dishes = await request('/restaurants/' + selectedRestaurant.id + '/dishes');
    if (version !== menuVersion || !$('menu-dialog').open) return;
    if (!dishes.length) message('menu-message', 'Este restaurante ainda não tem pratos cadastrados.');
    for (const dish of dishes) {
      const card = document.createElement('article'); card.className = 'menu-item';
      if (dish.imageUrl) { const img = document.createElement('img'); img.src = dish.imageUrl; img.alt = dish.name; img.loading = 'lazy'; card.append(img); }
      const title = document.createElement('h3'); title.textContent = dish.name;
      const info = document.createElement('p'); info.textContent = dish.category + ' · ' + Number(dish.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const description = document.createElement('p'); description.textContent = dish.description;
      card.append(title, info, description);
      if (canManageMenu()) {
        const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'text-button'; edit.textContent = 'Editar';
        edit.onclick = () => { const form = $('dish-form'); form.hidden = false; for (const field of ['id','name','category','description','price']) form.elements[field].value = dish[field]; $('dish-form-title').textContent = 'Editar prato'; message('dish-message', ''); form.elements.name.focus(); };
        const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'text-button'; remove.textContent = 'Excluir';
        remove.onclick = async () => { if (!confirm('Excluir o prato ' + dish.name + '?')) return; remove.disabled = true; try { await request('/dishes/' + dish.id, { method: 'DELETE' }); resetDishForm(); await loadMenu(); } catch (error) { message('menu-message', error.message); } finally { remove.disabled = false; } };
        const uploadForm = document.createElement('form'); const label = document.createElement('label'); label.textContent = 'Foto do prato';
        const input = document.createElement('input'); input.type = 'file'; input.name = 'image'; input.accept = 'image/jpeg,image/png,image/webp'; input.required = true;
        const submit = document.createElement('button'); submit.className = 'button small'; submit.textContent = 'Salvar foto'; label.append(input); uploadForm.append(label, submit);
        uploadForm.onsubmit = async event => { event.preventDefault(); submit.disabled = true; try { validateImage(input.files[0]); await request('/dishes/' + dish.id + '/image', { method: 'POST', body: new FormData(uploadForm) }); await loadMenu(); } catch (error) { message('menu-message', error.message); } finally { submit.disabled = false; } };
        card.append(edit, remove, uploadForm);
      }
      $('dish-list').append(card);
    }
  } catch (error) { message('menu-message', error.message); }
}
$('menu-dialog').addEventListener('close', () => { menuVersion++; resetDishForm(); });
$('new-dish').onclick = () => { resetDishForm(); $('dish-form').hidden = false; $('dish-form-title').textContent = 'Novo prato'; $('dish-form').elements.name.focus(); };
$('cancel-dish').onclick = resetDishForm;
$('dish-form').onsubmit = async event => {
  event.preventDefault(); const form = event.currentTarget; const submit = form.querySelector('button'); submit.disabled = true;
  const data = new FormData(form); const id = data.get('id');
  try {
    await request(id ? '/dishes/' + id : '/restaurants/' + selectedRestaurant.id + '/dishes', { method: id ? 'PUT' : 'POST', body: JSON.stringify({ name: data.get('name'), category: data.get('category'), description: data.get('description'), price: Number(data.get('price')) }) });
    resetDishForm(); await loadMenu(); toast('Prato salvo. Você já pode adicionar uma foto.');
  } catch (error) { message('dish-message', error.message); } finally { submit.disabled = false; }
};
function validateImage(file) {
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Escolha uma imagem JPEG, PNG ou WebP.');
  if (file.size > 5 * 1024 * 1024) throw new Error('A imagem deve ter até 5 MB.');
}
function renderProfile() {
  $('profile-name').textContent = user.name + ' · ' + user.email;
  $('profile-image').hidden = !user.imageUrl;
  if (user.imageUrl) $('profile-image').src = user.imageUrl; else $('profile-image').removeAttribute('src');
}
$('profile-button').onclick = () => { if (!user) return; renderProfile(); message('profile-message', ''); $('profile-form').reset(); $('profile-dialog').showModal(); };
$('profile-form').onsubmit = async event => {
  event.preventDefault(); const form = event.currentTarget; const button = form.querySelector('button'); button.disabled = true;
  try { validateImage(form.elements.image.files[0]); const result = await request('/auth/me/image', { method: 'POST', body: new FormData(form) }); user = result.user; renderProfile(); form.reset(); message('profile-message', 'Foto atualizada.'); }
  catch (error) { message('profile-message', error.message); } finally { button.disabled = false; }
};
init();
