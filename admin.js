/* Gangsta Black Admin (localStorage)
   - Products: gb_products
   - Orders:   gb_orders
   - Admin pass: gb_admin_pass (default 1234)
*/

const KEYS = {
  products: 'gb_products',
  orders: 'gb_orders',
  pass: 'gb_admin_pass',
  contact: 'gb_contact',
};

const DEFAULT_PASS = '1234';

const Remote = window.GBStore || { enabled:false };

const els = {
  loginCard: document.getElementById('loginCard'),
  adminApp: document.getElementById('adminApp'),
  loginForm: document.getElementById('loginForm'),
  adminPass: document.getElementById('adminPass'),
  btnLogout: document.getElementById('btnLogout'),
  btnNew: document.getElementById('btnNew'),
  btnRefresh: document.getElementById('btnRefresh'),

  // tabs
  sideBtns: Array.from(document.querySelectorAll('.sideBtn[data-tab]')),
  tabProducts: document.getElementById('tab-products'),
  tabOrders: document.getElementById('tab-orders'),
  tabSettings: document.getElementById('tab-settings'),
  ordersBadge: document.getElementById('ordersBadge'),

  // filters
  filterSeason: document.getElementById('filterSeason'),
  filterSubcat: document.getElementById('filterSubcat'),
  search: document.getElementById('search'),

  // tables
  productsTableBody: document.querySelector('#productsTable tbody'),
  productsEmpty: document.getElementById('productsEmpty'),

  filterStatus: document.getElementById('filterStatus'),
  ordersTableBody: document.querySelector('#ordersTable tbody'),
  ordersEmpty: document.getElementById('ordersEmpty'),
  orderDetail: document.getElementById('orderDetail'),
  btnExport: document.getElementById('btnExport'),
  btnClearOrders: document.getElementById('btnClearOrders'),

  // settings
  setEmail: document.getElementById('setEmail'),
  setPhone2: document.getElementById('setPhone2'),
  setWhats: document.getElementById('setWhats'),
  btnSaveContact: document.getElementById('btnSaveContact'),
  passForm: document.getElementById('passForm'),
  oldPass: document.getElementById('oldPass'),
  newPass: document.getElementById('newPass'),

  // editor modal
  editorModal: document.getElementById('editorModal'),
  editorOverlay: document.getElementById('editorOverlay'),
  btnCloseEditor: document.getElementById('btnCloseEditor'),
  editorTitle: document.getElementById('editorTitle'),
  btnSaveProduct: document.getElementById('btnSaveProduct'),
  btnDeleteProduct: document.getElementById('btnDeleteProduct'),

  pSeason: document.getElementById('pSeason'),
  pSubcat: document.getElementById('pSubcat'),
  pName: document.getElementById('pName'),
  pNameAr: document.getElementById('pNameAr'),
  pPrice: document.getElementById('pPrice'),
  pOrig: document.getElementById('pOrig'),
  pDesc: document.getElementById('pDesc'),
  pDescAr: document.getElementById('pDescAr'),
  pFeatured: document.getElementById('pFeatured'),
  pSliderSlot: document.getElementById('pSliderSlot'),
  imagesList: document.getElementById('imagesList'),
  imageFiles: document.getElementById('imageFiles'),
  btnPickImages: document.getElementById('btnPickImages'),
  btnAddImage: document.getElementById('btnAddImage'),
};

let products = [];
let orders = [];
let editingId = null;

function getPass(){
  return localStorage.getItem(KEYS.pass) || DEFAULT_PASS;
}

function setPass(v){
  localStorage.setItem(KEYS.pass, v);
}

function loadProducts(){
  try{
    const raw = localStorage.getItem(KEYS.products);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  }catch{ return []; }
}

function saveProducts(){
  localStorage.setItem(KEYS.products, JSON.stringify(products));
  // push to shared store (if configured)
  if(Remote.enabled) Remote.pushProducts(products);
}

function loadOrders(){
  try{
    const raw = localStorage.getItem(KEYS.orders);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  }catch{ return []; }
}

function saveOrders(){
  localStorage.setItem(KEYS.orders, JSON.stringify(orders));
  // push to shared store (if configured)
  if(Remote.enabled) Remote.pushOrders(orders);
}

function money(v){
  const n = Number(v||0);
  return n.toFixed(2) + ' JOD';
}

function uid(){
  return 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,7);
}

function readFileAsDataURL(file){
  return new Promise((resolve)=>{
    try{
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    }catch{
      resolve('');
    }
  });
}

function showTab(key){
  els.sideBtns.forEach(b=>b.classList.toggle('sideBtn--active', b.dataset.tab===key));
  els.tabProducts.hidden = key!=='products';
  els.tabOrders.hidden = key!=='orders';
  els.tabSettings.hidden = key!=='settings';
  els.orderDetail.hidden = true;
}

async function refresh(){
  // always try to pull latest remote data first
  if(Remote.enabled) await Remote.pullToCache();
  products = loadProducts();
  orders = loadOrders();
  renderProducts();
  renderOrders();
  updateBadges();
  if(window.lucide) window.lucide.createIcons();
}

function updateBadges(){
  const pending = orders.filter(o=>o.status==='pending').length;
  els.ordersBadge.textContent = String(pending);
}

function matchesProduct(p){
  const fs = els.filterSeason.value;
  const fc = els.filterSubcat.value;
  const q = (els.search.value||'').trim().toLowerCase();

  if(fs!=='all' && p.season!==fs) return false;
  if(fc!=='all' && p.subcat!==fc) return false;
  if(q){
    const s = ((p.name||'') + ' ' + (p.nameAr||'')).toLowerCase();
    if(!s.includes(q)) return false;
  }
  return true;
}

function renderProducts(){
  const list = products.filter(matchesProduct);
  els.productsTableBody.innerHTML = '';
  els.productsEmpty.hidden = list.length !== 0;

  list.forEach(p=>{
    const tr = document.createElement('tr');
    const img = (p.images && p.images[0]) ? p.images[0] : '';
    const disc = p.originalPrice ? Math.max(0, (1 - (Number(p.price||0)/Number(p.originalPrice||1))) * 100) : 0;

    tr.innerHTML = `
      <td>${img ? `<img class="thumb" src="${img}" alt="">` : `<div class="thumb"></div>`}</td>
      <td><b>${p.name || '—'}</b><div style="opacity:.7;font-size:12px">${p.nameAr||''}</div></td>
      <td>${p.season}</td>
      <td>${p.subcat}</td>
      <td>${money(p.price)}</td>
      <td>${p.originalPrice ? `<span style="opacity:.8">-${disc.toFixed(0)}%</span>` : `—`}</td>
      <td>${p.featured ? 'Yes' : 'No'}</td>
      <td>
        <button class="pill" data-edit="${p.id}"><i data-lucide="pencil"></i><span>Edit</span></button>
      </td>
    `;
    els.productsTableBody.appendChild(tr);
  });

  els.productsTableBody.querySelectorAll('[data-edit]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-edit');
      openEditor(id);
    });
  });
}

function renderOrders(){
  const status = els.filterStatus.value;
  let list = [...orders].sort((a,b)=>b.timestamp - a.timestamp);
  if(status!=='all') list = list.filter(o=>o.status===status);

  els.ordersTableBody.innerHTML = '';
  els.ordersEmpty.hidden = list.length !== 0;

  list.forEach(o=>{
    const tr = document.createElement('tr');
    const t = new Date(o.timestamp || Date.now());
    tr.innerHTML = `
      <td><b>${o.id}</b><div style="opacity:.7;font-size:12px">${o.items?.length||0} items</div></td>
      <td>${o.name||''}</td>
      <td>${o.phone||''}</td>
      <td>${o.city||''}</td>
      <td>${money(o.total)}</td>
      <td>
        <select class="select" data-status="${o.id}">
          <option value="pending" ${o.status==='pending'?'selected':''}>pending</option>
          <option value="confirmed" ${o.status==='confirmed'?'selected':''}>confirmed</option>
          <option value="delivered" ${o.status==='delivered'?'selected':''}>delivered</option>
          <option value="canceled" ${o.status==='canceled'?'selected':''}>canceled</option>
        </select>
      </td>
      <td>${t.toLocaleString()}</td>
      <td>
        <button class="pill" data-view="${o.id}"><i data-lucide="eye"></i><span>View</span></button>
        <button class="pill pill--danger" data-del="${o.id}"><i data-lucide="trash-2"></i><span>Delete</span></button>
      </td>
    `;
    els.ordersTableBody.appendChild(tr);
  });

  els.ordersTableBody.querySelectorAll('[data-status]').forEach(sel=>{
    sel.addEventListener('change', ()=>{
      const id = sel.getAttribute('data-status');
      const o = orders.find(x=>x.id===id);
      if(!o) return;
      o.status = sel.value;
      saveOrders();
      updateBadges();
    });
  });

  els.ordersTableBody.querySelectorAll('[data-view]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-view');
      viewOrder(id);
    });
  });

  els.ordersTableBody.querySelectorAll('[data-del]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-del');
      if(!confirm('Delete this order?')) return;
      orders = orders.filter(o=>o.id!==id);
      saveOrders();
      renderOrders();
      updateBadges();
    });
  });
}

function viewOrder(id){
  const o = orders.find(x=>x.id===id);
  if(!o) return;
  const t = new Date(o.timestamp||Date.now());
  const itemsHtml = (o.items||[]).map(it=>{
    const name = it.name || it.nameAr || 'Item';
    const q = Number(it.quantity ?? it.qty ?? 1);
    const sz = String(it.size || 'M');
    const img = (it.images && it.images[0]) ? it.images[0] : '';
    const lineTotal = (Number(it.price)||0) * q;
    return `
      <div class="odItem">
        ${img ? `<img class="odImg" src="${img}" alt="">` : `<div class="odImg odImg--ph"></div>`}
        <div class="odInfo">
          <div><b>${name}</b></div>
          <div style="opacity:.75;font-size:12px">Size: <b>${sz}</b> • Qty: <b>${q}</b> • ${money(lineTotal)}</div>
        </div>
      </div>
    `;
  }).join('');

  els.orderDetail.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap">
      <div><b>Order:</b> ${o.id}</div>
      <div style="opacity:.75">${t.toLocaleString()}</div>
    </div>
    <div style="margin-top:8px"><b>Name:</b> ${o.name||''}</div>
    <div><b>Phone:</b> ${o.phone||''}</div>
    <div><b>Phone2:</b> ${o.phone2||''}</div>
    <div><b>City:</b> ${o.city||''}</div>
    <div><b>Address:</b> ${o.address||''}</div>
    ${o.notes ? `<div><b>Notes:</b> ${o.notes}</div>` : ''}
    <div style="margin-top:10px"><b>Items</b></div>
    <div style="margin-top:6px">${itemsHtml}</div>
    <div style="margin-top:10px"><b>Total:</b> ${money(o.total)}</div>
  `;
  els.orderDetail.hidden = false;
  els.orderDetail.scrollIntoView({behavior:'smooth', block:'start'});
}

function openEditor(id){
  editingId = id || null;
  const p = id ? products.find(x=>x.id===id) : null;

  els.editorTitle.textContent = p ? 'Edit Product' : 'New Product';
  els.btnDeleteProduct.style.display = p ? 'inline-flex' : 'none';

  els.pSeason.value = p?.season || 'winter';
  els.pSubcat.value = p?.subcat || 'pants';
  els.pName.value = p?.name || '';
  els.pNameAr.value = p?.nameAr || '';
  els.pPrice.value = p?.price ?? '';
  els.pOrig.value = p?.originalPrice ?? '';
  els.pDesc.value = p?.description || '';
  els.pDescAr.value = p?.descriptionAr || '';
  els.pFeatured.value = String(!!p?.featured);
  els.pSliderSlot.value = String(Number(p?.sliderSlot || 0));

  renderImages(p?.images || []);

  els.editorModal.hidden = false;
  els.editorModal.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
  if(window.lucide) window.lucide.createIcons();
}

function closeEditor(){
  els.editorModal.hidden = true;
  els.editorModal.setAttribute('aria-hidden','true');
  document.body.style.overflow = 'auto';
}

function renderImages(images){
  const list = Array.isArray(images) ? images.slice(0,10) : [];
  if(list.length === 0) list.push('');
  els.imagesList.innerHTML = '';
  list.forEach((url, idx)=>{
    const row = document.createElement('div');
    row.className = 'imgRow';

    const isData = typeof url === 'string' && url.startsWith('data:image');
    const preview = (url && url.trim()) ? url : '';
    const label = isData ? '📷 Device image' : '';

    row.innerHTML = `
      ${isData ? `
        <div style="display:flex;gap:10px;align-items:center">
          <img src="${preview}" alt="" style="width:54px;height:54px;border-radius:14px;object-fit:cover;border:1px solid rgba(255,255,255,.12)" />
          <div style="display:flex;flex-direction:column;gap:4px;min-width:0">
            <div style="font-weight:800">${label}</div>
            <input class="input" data-img-label="${idx}" readonly value="Saved in browser" />
          </div>
          <input type="hidden" data-img="${idx}" value="${url || ''}">
        </div>
      ` : `
        <input class="input" data-img="${idx}" placeholder="https://..." value="${url || ''}">
      `}
      <button class="iconBtnMini" type="button" data-remove="${idx}" title="Remove"><i data-lucide="minus"></i></button>
    `;
    els.imagesList.appendChild(row);
  });

  els.imagesList.querySelectorAll('[data-remove]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = Number(btn.getAttribute('data-remove'));
      const urls = getImages();
      urls.splice(idx,1);
      renderImages(urls);
      if(window.lucide) window.lucide.createIcons();
    });
  });
}

function getImages(){
  const inputs = Array.from(els.imagesList.querySelectorAll('input[data-img]'));
  const urls = inputs.map(i=>i.value.trim()).filter(Boolean);
  return urls.slice(0,10);
}

function collectProduct(){
  const season = els.pSeason.value;
  const subcat = els.pSubcat.value;

  const p = {
    id: editingId || uid(),
    season,
    subcat,
    name: els.pName.value.trim(),
    nameAr: els.pNameAr.value.trim(),
    price: Number(els.pPrice.value || 0),
    originalPrice: els.pOrig.value ? Number(els.pOrig.value) : undefined,
    description: els.pDesc.value.trim(),
    descriptionAr: els.pDescAr.value.trim(),
    featured: els.pFeatured.value === 'true',
    sliderSlot: Number(els.pSliderSlot.value || 0),
    images: getImages(),
  };

  if(p.images.length === 0){
    alert('Add at least 1 image URL');
    return null;
  }
  if(!p.name && !p.nameAr){
    alert('Add product name (EN or AR)');
    return null;
  }
  return p;
}

function saveProduct(){
  const p = collectProduct();
  if(!p) return;

  const idx = products.findIndex(x=>x.id===p.id);
  if(idx >= 0) products[idx] = p;
  else products.unshift(p);

  saveProducts();
  closeEditor();
  renderProducts();
  alert('Saved ✅');
}

function deleteProduct(){
  if(!editingId) return;
  if(!confirm('Delete this product?')) return;
  products = products.filter(p=>p.id!==editingId);
  saveProducts();
  closeEditor();
  renderProducts();
}

function ensureAuth(){
  // Password removed per request (static site). Admin panel is always accessible.
  els.loginCard.hidden = true;
  els.adminApp.hidden = false;
  return true;
}

function login(pass){
  ensureAuth();
  refresh();
  return true;
}

function logout(){
  ensureAuth();
}

function exportOrders(){
  const blob = new Blob([JSON.stringify(orders, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gb_orders.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function loadContact(){
  try{
    const raw = localStorage.getItem(KEYS.contact);
    const c = raw ? JSON.parse(raw) : null;
    if(c){
      els.setEmail.value = c.email || els.setEmail.value;
      els.setPhone2.value = c.phone2 || els.setPhone2.value;
      els.setWhats.value = c.whatsapp || els.setWhats.value;
    }
  }catch{}
}

function saveContact(){
  const c = {
    email: els.setEmail.value.trim(),
    phone2: els.setPhone2.value.trim(),
    whatsapp: els.setWhats.value.trim(),
  };
  localStorage.setItem(KEYS.contact, JSON.stringify(c));
  if(Remote.enabled) Remote.pushContact(c);
  alert('Saved ✅');
}

function bind(){
  // login removed

  // tabs
  els.sideBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      showTab(btn.dataset.tab);
    });
  });

  els.btnLogout.style.display = 'none';
  els.btnNew.addEventListener('click', ()=>openEditor(null));
  els.btnRefresh.addEventListener('click', refresh);

  // filters
  ['change','input'].forEach(ev=>{
    els.filterSeason.addEventListener(ev, renderProducts);
    els.filterSubcat.addEventListener(ev, renderProducts);
    els.search.addEventListener(ev, renderProducts);
    els.filterStatus.addEventListener(ev, renderOrders);
  });

  // editor
  els.editorOverlay.addEventListener('click', closeEditor);
  els.btnCloseEditor.addEventListener('click', closeEditor);
  els.btnSaveProduct.addEventListener('click', saveProduct);
  els.btnDeleteProduct.addEventListener('click', deleteProduct);

  // pick images from device
  els.btnPickImages?.addEventListener('click', ()=>{
    els.imageFiles?.click();
  });
  els.imageFiles?.addEventListener('change', async ()=>{
    const files = Array.from(els.imageFiles.files || []);
    if(files.length === 0) return;
    let urls = getImages();
    for(const f of files){
      if(urls.length >= 10) break;
      // Basic guard: very large images will bloat localStorage
      if(f.size > 2.5 * 1024 * 1024){
        alert(`Image “${f.name}” is too large (max 2.5MB). Please resize/compress it, or upload to hosting and use URL.`);
        continue;
      }
      const dataUrl = await readFileAsDataURL(f);
      if(dataUrl) urls.push(dataUrl);
    }
    // Clear input so picking same file again triggers change
    els.imageFiles.value = '';
    renderImages(urls);
    if(window.lucide) window.lucide.createIcons();
  });
  els.btnAddImage.addEventListener('click', ()=>{
    const urls = getImages();
    if(urls.length >= 10){
      alert('Max 10 images');
      return;
    }
    urls.push('');
    renderImages(urls);
    if(window.lucide) window.lucide.createIcons();
  });

  // orders actions
  els.btnExport.addEventListener('click', exportOrders);
  els.btnClearOrders.addEventListener('click', ()=>{
    if(!confirm('Clear ALL orders?')) return;
    orders = [];
    saveOrders();
    renderOrders();
    updateBadges();
  });

  // settings
  els.btnSaveContact.addEventListener('click', saveContact);
  els.passForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const oldP = els.oldPass.value;
    const newP = els.newPass.value;
    if(oldP !== getPass()){
      alert('Wrong current password');
      return;
    }
    if((newP||'').length < 4){
      alert('Password too short');
      return;
    }
    setPass(newP);
    els.oldPass.value = '';
    els.newPass.value = '';
    alert('Password changed ✅');
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  bind();
  ensureAuth();
  loadContact();
  if(Remote.enabled){
    Remote.startPolling();
    window.addEventListener('gb_store_updated', ()=>{ refresh(); });
  }
  refresh();
  if(window.lucide) window.lucide.createIcons();
});
