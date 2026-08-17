const state = { products: [], cart: JSON.parse(localStorage.getItem("oneBasiqCart") || "[]"), selected: null, size: null, token: localStorage.getItem("oneBasiqToken") || "" };
const $ = id => document.getElementById(id);
const money = value => Number(value).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const api = async (url, options = {}) => {
  const headers = {"Content-Type":"application/json",...(options.headers || {})};
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const response = await fetch(url,{...options,headers});
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Erro de comunicação");
  return data;
};
const toast = message => { $("toast").textContent = message; $("toast").classList.add("show"); setTimeout(() => $("toast").classList.remove("show"),2800); };
const open = id => { $(id).classList.add("active"); document.body.classList.add("lock"); };
const close = id => { $(id).classList.remove("active"); if (!document.querySelector(".modal.active")) document.body.classList.remove("lock"); };
document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click",() => close(button.dataset.close)));
document.querySelectorAll(".modal").forEach(modal => modal.addEventListener("click",event => { if (event.target === modal) close(modal.id); }));
document.addEventListener("keydown",event => { if (event.key === "Escape") document.querySelectorAll(".modal.active").forEach(modal => close(modal.id)); });
$("menuToggle").addEventListener("click",() => $("nav").classList.toggle("active"));
$("cartButton").addEventListener("click",() => { renderCart(); open("cartModal"); });
$("accountButton").addEventListener("click",() => { renderAccount(); open("accountModal"); });

function saveCart(){ localStorage.setItem("oneBasiqCart",JSON.stringify(state.cart)); $("cartCount").textContent = state.cart.reduce((sum,item) => sum + item.quantity,0); }
function renderProducts(){
  const groups = { masculina:"masculinaGrid",regatas:"regatasGrid",moletom:"moletomGrid","moletom-canguru":"canguruGrid" };
  Object.entries(groups).forEach(([category,id]) => {
    const target = $(id);
    const items = state.products.filter(item => item.category === category);
    target.innerHTML = items.map(item => `<article class="product-card" data-id="${item.id}"><div class="product-image"><img src="${item.image_url}" alt="${item.name} - ${item.color}" loading="lazy"></div><div class="product-card-body"><h3>${item.name}</h3><p>${item.color}</p><strong class="price">${money(item.price)}</strong><button class="choose">ESCOLHER TAMANHO</button></div></article>`).join("");
    target.querySelectorAll(".product-card").forEach(card => card.addEventListener("click",() => openProduct(card.dataset.id)));
  });
}
function openProduct(id){
  const product = state.products.find(item => item.id === id);
  if (!product) return;
  state.selected = product;
  state.size = null;
  $("modalImage").src = product.image_url;
  $("modalImage").alt = `${product.name} - ${product.color}`;
  $("modalCategory").textContent = product.category;
  $("modalName").textContent = product.name;
  $("modalPrice").textContent = money(product.price);
  $("modalColor").textContent = product.color;
  $("modalDescription").textContent = product.description;
  $("modalProducts").innerHTML = state.products.filter(item => item.category === product.category).map(item => `<button class="selector ${item.id === product.id ? "active" : ""}" data-product="${item.id}">${item.color}</button>`).join("");
  $("modalProducts").querySelectorAll("[data-product]").forEach(button => button.addEventListener("click",() => openProduct(button.dataset.product)));
  $("modalSizes").innerHTML = (product.sizes || []).map(size => `<button class="selector" data-size="${size}">${size}</button>`).join("");
  $("modalSizes").querySelectorAll("[data-size]").forEach(button => button.addEventListener("click",() => { state.size = button.dataset.size; $("modalSizes").querySelectorAll(".selector").forEach(item => item.classList.remove("active")); button.classList.add("active"); }));
  const rows = product.measurements || [];
  $("modalMeasurements").innerHTML = rows.length ? `<table class="measurements"><thead><tr><th>Tam.</th><th>Comp.</th><th>Largura</th><th>${rows[0].length > 3 ? "Manga" : ""}</th></tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table>` : "";
  $("productUrl").classList.toggle("hidden",!product.product_url);
  $("productUrl").href = product.product_url || "#";
  $("qty").value = 1;
  open("productModal");
}
$("qtyMinus").addEventListener("click",() => $("qty").value = Math.max(1,Number($("qty").value || 1)-1));
$("qtyPlus").addEventListener("click",() => $("qty").value = Math.min(20,Number($("qty").value || 1)+1));
$("addCart").addEventListener("click",() => {
  if (!state.size) return toast("Selecione um tamanho.");
  const existing = state.cart.find(item => item.productId === state.selected.id && item.size === state.size);
  const quantity = Math.max(1,Math.min(20,Number($("qty").value || 1)));
  if (existing) existing.quantity += quantity;
  else state.cart.push({productId:state.selected.id,name:state.selected.name,color:state.selected.color,price:Number(state.selected.price),image_url:state.selected.image_url,size:state.size,quantity});
  saveCart(); close("productModal"); toast("Produto adicionado ao carrinho.");
});
function totals(){ const subtotal = state.cart.reduce((sum,item) => sum + item.price * item.quantity,0); const shipping = subtotal === 0 || subtotal >= 499 ? 0 : 29.9; return {subtotal,shipping,total:subtotal+shipping}; }
function renderCart(){
  if (!state.cart.length) { $("cartContent").innerHTML = "<p>Seu carrinho está vazio.</p>"; return; }
  const totalsData = totals();
  $("cartContent").innerHTML = state.cart.map((item,index) => `<div class="cart-row"><img src="${item.image_url}" alt=""><div><h4>${item.name}</h4><p>${item.color} · Tamanho ${item.size}</p><p>${money(item.price)} · ${item.quantity} unidade(s)</p><button data-remove="${index}">REMOVER</button></div><strong>${money(item.price * item.quantity)}</strong></div>`).join("") + `<div class="cart-summary"><div class="summary-line"><span>Subtotal</span><strong>${money(totalsData.subtotal)}</strong></div><div class="summary-line"><span>Frete</span><strong>${totalsData.shipping ? money(totalsData.shipping) : "GRÁTIS"}</strong></div><div class="summary-line total"><span>Total</span><strong>${money(totalsData.total)}</strong></div><button class="primary" id="goCheckout">FINALIZAR COMPRA</button></div>`;
  $("cartContent").querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click",() => { state.cart.splice(Number(button.dataset.remove),1); saveCart(); renderCart(); }));
  $("goCheckout").addEventListener("click",() => { close("cartModal"); prepareCheckout(); open("checkoutModal"); });
}
function prepareCheckout(){
  const user = localStorage.getItem("oneBasiqUser");
  if (user) {
    const data = JSON.parse(user);
    $("checkoutName").value = data.name || "";
    $("checkoutEmail").value = data.email || "";
    $("checkoutCpf").value = data.cpf || "";
    $("checkoutPhone").value = data.phone || "";
  }
  const t = totals();
  $("checkoutSummary").innerHTML = `<div class="summary-line"><span>Subtotal</span><strong>${money(t.subtotal)}</strong></div><div class="summary-line"><span>Frete</span><strong>${t.shipping ? money(t.shipping) : "GRÁTIS"}</strong></div><div class="summary-line total"><span>Total</span><strong>${money(t.total)}</strong></div>`;
}
$("checkoutForm").addEventListener("submit",async event => {
  event.preventDefault();
  try {
    const customer = {name:$("checkoutName").value,email:$("checkoutEmail").value,cpf:$("checkoutCpf").value,phone:$("checkoutPhone").value};
    const shippingAddress = {zipCode:$("zip").value,street:$("street").value,number:$("number").value,complement:$("complement").value,neighborhood:$("neighborhood").value,city:$("city").value,state:$("state").value.toUpperCase()};
    const order = await api("/api/orders",{method:"POST",body:JSON.stringify({customer,items:state.cart,shippingAddress,paymentMethod:"mercado_pago"})});
    const preference = await api("/api/payments/mercado-pago/preference",{method:"POST",body:JSON.stringify({orderId:order.orderId})});
    localStorage.removeItem("oneBasiqCart"); state.cart = []; saveCart(); window.location.href = preference.init_point || preference.sandbox_init_point;
  } catch (error) { toast(error.message); }
});

async function login(event){
  event.preventDefault();
  try {
    const data = await api("/api/auth/login",{method:"POST",body:JSON.stringify({email:$("loginEmail").value,password:$("loginPassword").value})});
    state.token = data.token; localStorage.setItem("oneBasiqToken",state.token); localStorage.setItem("oneBasiqUser",JSON.stringify(data.user)); renderAccount(); toast("Login realizado.");
  } catch (error) { toast(error.message); }
}
async function register(event){
  event.preventDefault();
  try {
    const data = await api("/api/auth/register",{method:"POST",body:JSON.stringify({name:$("registerName").value,email:$("registerEmail").value,password:$("registerPassword").value,cpf:$("registerCpf").value,phone:$("registerPhone").value})});
    state.token = data.token; localStorage.setItem("oneBasiqToken",state.token); localStorage.setItem("oneBasiqUser",JSON.stringify(data.user)); renderAccount(); toast("Conta criada.");
  } catch (error) { toast(error.message); }
}
$("loginForm").addEventListener("submit",login);
$("registerForm").addEventListener("submit",register);
document.querySelectorAll("[data-auth-tab]").forEach(button => button.addEventListener("click",() => {
  document.querySelectorAll("[data-auth-tab]").forEach(item => item.classList.toggle("active",item === button));
  $("loginForm").classList.toggle("hidden",button.dataset.authTab !== "login");
  $("registerForm").classList.toggle("hidden",button.dataset.authTab !== "register");
}));
function renderAccount(){
  const user = JSON.parse(localStorage.getItem("oneBasiqUser") || "null");
  $("accountState").innerHTML = user ? `<div class="description"><strong>${user.name}</strong><p>${user.email}</p><button class="secondary" id="logout">SAIR</button></div>` : "";
  $("logout")?.addEventListener("click",() => { state.token=""; localStorage.removeItem("oneBasiqToken"); localStorage.removeItem("oneBasiqUser"); renderAccount(); toast("Sessão encerrada."); });
}
async function init(){
  try { state.products = await api("/api/products"); renderProducts(); saveCart(); } catch { toast("Não foi possível carregar a loja."); }
  const params = new URLSearchParams(location.search);
  if (params.get("payment")) toast(params.get("payment") === "success" ? "Pagamento aprovado." : params.get("payment") === "pending" ? "Pagamento pendente." : "Pagamento não aprovado.");
}
init();
