const adminState = { token: localStorage.getItem("oneBasiqAdminToken") || "", products: [], orders: [], customers: [] };
const A = id => document.getElementById(id);
const adminApi = async (url,options={}) => {
  const headers = {"Content-Type":"application/json",...(options.headers||{})};
  if (adminState.token) headers.Authorization = `Bearer ${adminState.token}`;
  const response = await fetch(url,{...options,headers});
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Erro");
  return data;
};
const moneyA = value => Number(value).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const showApp = () => { A("loginScreen").classList.add("hidden"); A("adminApp").classList.remove("hidden"); loadDashboard(); };
const showLogin = () => { A("loginScreen").classList.remove("hidden"); A("adminApp").classList.add("hidden"); };
A("adminLogin").addEventListener("submit",async event => {
  event.preventDefault();
  try {
    const response = await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:A("adminEmail").value,password:A("adminPassword").value})});
    const data = await response.json();
    if (!response.ok || data.user?.role !== "admin") throw new Error("Acesso administrativo inválido");
    adminState.token = data.token; localStorage.setItem("oneBasiqAdminToken",adminState.token); showApp();
  } catch(error) { A("adminError").textContent = error.message; }
});
A("adminLogout").addEventListener("click",() => { adminState.token=""; localStorage.removeItem("oneBasiqAdminToken"); showLogin(); });
document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click",() => switchView(button.dataset.view)));
function switchView(view){
  document.querySelectorAll("[data-view]").forEach(item => item.classList.toggle("active",item.dataset.view === view));
  document.querySelectorAll(".view").forEach(item => item.classList.toggle("active",item.id === `view-${view}`));
  const titles = {dashboard:"Dashboard",orders:"Pedidos",products:"Produtos",customers:"Clientes",payments:"Pagamentos"};
  A("viewTitle").textContent = titles[view];
  if (view === "orders") loadOrders();
  if (view === "products") loadProducts();
  if (view === "customers") loadCustomers();
}
async function loadDashboard(){
  try {
    const data = await adminApi("/api/admin/dashboard");
    A("metricSales").textContent = moneyA(data.sales);
    A("metricOrders").textContent = data.orders;
    A("metricCustomers").textContent = data.customers;
    A("metricProducts").textContent = data.products;
  } catch { showLogin(); }
}
async function loadOrders(){
  adminState.orders = await adminApi("/api/admin/orders");
  A("ordersTable").innerHTML = adminState.orders.map(order => `<tr><td>${order.id.slice(0,8).toUpperCase()}</td><td>${order.customer_name}<br><small>${order.customer_email}</small></td><td>${moneyA(order.total)}</td><td><span class="status">${order.payment_status}</span></td><td><select data-order-status="${order.id}">${["pending","confirmed","processing","shipped","delivered","cancelled"].map(status => `<option ${status===order.status?"selected":""}>${status}</option>`).join("")}</select></td><td>${new Date(order.created_at).toLocaleString("pt-BR")}</td></tr>`).join("");
  A("ordersTable").querySelectorAll("[data-order-status]").forEach(select => select.addEventListener("change",async event => { await adminApi(`/api/admin/orders/${event.target.dataset.orderStatus}`,{method:"PATCH",body:JSON.stringify({status:event.target.value})}); }));
}
async function loadProducts(){
  adminState.products = await adminApi("/api/admin/products");
  A("productsTable").innerHTML = adminState.products.map(p => `<tr><td><img class="product-thumb" src="${p.image_url}" alt=""></td><td>${p.name}<br><small>${p.sku}</small></td><td>${p.color}</td><td>${moneyA(p.price)}</td><td>${p.stock}</td><td><button class="action" data-edit="${p.id}">EDITAR</button><button class="action" data-delete="${p.id}">DESATIVAR</button></td></tr>`).join("");
  A("productsTable").querySelectorAll("[data-edit]").forEach(button => button.addEventListener("click",() => editProduct(button.dataset.edit)));
  A("productsTable").querySelectorAll("[data-delete]").forEach(button => button.addEventListener("click",async () => { if(confirm("Desativar este produto?")) { await adminApi(`/api/admin/products/${button.dataset.delete}`,{method:"DELETE"}); loadProducts(); loadDashboard(); } }));
}
function clearProductForm(){ ["pId","pSku","pName","pColor","pCategory","pPrice","pStock","pImage","pUrl","pDescription","pSizes"].forEach(id => A(id).value=""); }
function editProduct(id){
  const p = adminState.products.find(item => item.id === id); if (!p) return;
  A("pId").value=p.id; A("pSku").value=p.sku; A("pName").value=p.name; A("pColor").value=p.color; A("pCategory").value=p.category; A("pPrice").value=p.price; A("pStock").value=p.stock; A("pImage").value=p.image_url; A("pUrl").value=p.product_url || ""; A("pDescription").value=p.description; A("pSizes").value=(p.sizes||[]).join(",");
  A("productForm").classList.remove("hidden");
}
A("newProduct").addEventListener("click",() => { clearProductForm(); A("productForm").classList.remove("hidden"); });
A("cancelProduct").addEventListener("click",() => A("productForm").classList.add("hidden"));
A("saveProduct").addEventListener("click",async () => {
  const body = {sku:A("pSku").value,name:A("pName").value,color:A("pColor").value,category:A("pCategory").value,price:Number(A("pPrice").value),stock:Number(A("pStock").value),image_url:A("pImage").value,product_url:A("pUrl").value,description:A("pDescription").value,sizes:A("pSizes").value.split(",").map(item=>item.trim()).filter(Boolean),measurements:[]};
  const id=A("pId").value;
  await adminApi(id ? `/api/admin/products/${id}` : "/api/admin/products",{method:id?"PUT":"POST",body:JSON.stringify(body)});
  A("productForm").classList.add("hidden"); loadProducts(); loadDashboard();
});
async function loadCustomers(){
  adminState.customers = await adminApi("/api/admin/customers");
  A("customersTable").innerHTML = adminState.customers.map(c => `<tr><td>${c.name}</td><td>${c.email}</td><td>${c.phone || "—"}</td><td><span class="status">${c.active ? "Ativo" : "Bloqueado"}</span></td><td><button class="action" data-customer="${c.id}" data-active="${!c.active}">${c.active ? "BLOQUEAR" : "ATIVAR"}</button></td></tr>`).join("");
  A("customersTable").querySelectorAll("[data-customer]").forEach(button => button.addEventListener("click",async () => { await adminApi(`/api/admin/customers/${button.dataset.customer}`,{method:"PATCH",body:JSON.stringify({active:button.dataset.active === "true"})}); loadCustomers(); }));
}
if (adminState.token) showApp();
