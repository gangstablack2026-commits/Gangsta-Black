/* Gangsta Black - Look style storefront (HTML/CSS/JS)
   - Seasons: Winter / Summer
   - Winter subcats: pants, hoodies, tracksuits
   - Summer subcats: pants, tshirts, tracksuits
   - Orders saved in localStorage: STORAGE_KEYS.orders
*/

const SHIPPING_FEE = 2;

// localStorage keys
const STORAGE_KEYS = {
  products: 'gb_products',
  orders: 'gb_orders',
  contact: 'gb_contact',
  adminPass: 'gb_admin_pass'
};

const Remote = window.GBStore || { enabled:false };

// Small helper to generate ids (good enough for localStorage)
function uid(){
  return `gb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`;
}

const state = {
  lang: 'en',
  season: 'winter',
  subcat: 'all',
  saleOnly: false,
  cart: [],
  selected: null,
  imgIndex: 0,
  selectedSize: 'M',
};

// Seed demo products (first run only) using local assets
// NOTE: The store runs fully client-side. Products are stored in localStorage.
if (!localStorage.getItem(STORAGE_KEYS.products)) {
  const demo = [
    {
      id: uid(),
      name: 'Luxury Black Hoodie',
      nameAr: 'هودي أسود فاخر',
      price: 45,
      season: 'winter',
      subcat: 'hoodies',
      description: 'Premium black hoodie. Limited edition.',
      descriptionAr: 'هودي أسود خامة ممتازة. إصدار محدود.',
      images: ['assets/1.png','assets/3.png'],
      featured: true,
      sliderSlot: 1
    },
    {
      id: uid(),
      name: 'Blue Streetwear Hoodie',
      nameAr: 'هودي أزرق ستريت',
      price: 45,
      season: 'winter',
      subcat: 'hoodies',
      description: 'Soft blue hoodie with GB branding.',
      descriptionAr: 'هودي أزرق ناعم مع شعار GB.',
      images: ['assets/2.png'],
      featured: true,
      sliderSlot: 2
    },
    {
      id: uid(),
      name: 'Logo Black Tracksuit',
      nameAr: 'ترنج أسود لوغو',
      price: 42,
      season: 'winter',
      subcat: 'tracksuits',
      description: 'Black tracksuit with bold logo.',
      descriptionAr: 'ترنج أسود مع لوغو واضح.',
      images: ['assets/3.png','assets/1.png'],
      featured: true,
      sliderSlot: 3
    }
  ];
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(demo));
}


// Products are managed from the hidden admin panel URL. Storefront reads from localStorage.
// (If you later connect Firebase, replace these helpers accordingly.)
function loadProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.products);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products || []));
}

// Start empty by default (no demo products)
const ADMIN = {
  brand: 'Gangsta Black',
  email: 'gangsta.black2026@gmail.com',
  phone2: '0791506540',
  whatsapp: '0799691748', // customer support + order notifications
  whatsappIntl: '962799691748', // wa.me format (Jordan)
};

// Allow Admin panel to update contact info
function applyContactFromStorage(){
  try{
    const raw = localStorage.getItem(STORAGE_KEYS.contact);
    if(raw){
      const c = JSON.parse(raw);
      if(c.email) ADMIN.email = c.email;
      if(c.phone2) ADMIN.phone2 = c.phone2;
      if(c.whatsapp){
        ADMIN.whatsapp = c.whatsapp;
        // Convert 079... -> 96279... for wa.me
        if(/^0\d{9}$/.test(c.whatsapp)){
          ADMIN.whatsappIntl = `962${c.whatsapp.slice(1)}`;
        }
      }
    }
  }catch{}
}

applyContactFromStorage();

function formatMoney(v){
  const n = Number(v||0);
  return `${n.toFixed(2)} JOD`;
}

function orderToMessage(order){
  const lines = [];
  lines.push(`${ADMIN.brand} - New Order ✅`);
  lines.push(`Order: ${order.id}`);
  lines.push(`Name: ${order.name}`);
  lines.push(`Phone: ${order.phone}`);
  lines.push(`Phone2: ${order.phone2}`);
  lines.push(`City: ${order.city}`);
  lines.push(`Address: ${order.address}`);
  if(order.notes) lines.push(`Notes: ${order.notes}`);
  lines.push('--- Items ---');
  order.items.forEach(it=>{
    const q = Number(it.quantity ?? it.qty ?? 1);
    const sz = (it.size || 'M');
    lines.push(`• ${state.lang==='ar' ? (it.nameAr||it.name) : it.name} [${t('size')}: ${sz}] ×${q} = ${formatMoney((Number(it.price)||0)*q)}`);
  });
  lines.push('---');
  lines.push(`Shipping: ${formatMoney(SHIPPING_FEE)}`);
  lines.push(`Total: ${formatMoney(order.total)}`);
  return lines.join('\n');
}

function notifyAdmin(order){
  // 1) Save locally (admin panel can see it)
  // 2) Open WhatsApp with prefilled message (best "no-backend" solution)
  const msg = encodeURIComponent(orderToMessage(order));
  const url = `https://wa.me/${ADMIN.whatsappIntl}?text=${msg}`;
  // Open in new tab/window (may be blocked if popup blockers; still works often on mobile)
  window.open(url, '_blank');
}

let PRODUCTS = loadProducts();


const I18N = {
  en: {
    brand: 'GANGSTA BLACK',
    tagline: 'Luxury Streetwear',
    home: 'Home',
    shop: 'Shop',
    checkout: 'Checkout',
    contact: 'Contact',
    phone2Label: 'Backup Phone',
    cart: 'My Cart',
    cod: 'COD',
    detail: 'Detail',
    price: 'Price',
    size: 'Size',
    buyNow: 'Buy Now',
    discover: 'Discover',
    subtitle: 'Limited drops • Street luxury',
    trending: 'TRENDING',
    popular: 'Popular',
    sale: 'SALE',
    deals: 'Deals',
    product: 'PRODUCT',
    drops: 'Drops',
    popularProducts: 'POPULAR PRODUCTS',
    explore: 'EXPLORE',
    winter: 'WINTER',
    summer: 'SUMMER',
    all: 'ALL',
    pants: 'PANTS',
    hoodies: 'HOODIES',
    tracksuits: 'TRACKSUITS',
    tshirts: 'T-SHIRTS',
    subtotal: 'Sub total',
    shipping: 'Delivery (All Jordan)',
    total: 'Total',
    clear: 'Clear Cart',
    continueShop: 'Continue Shopping',
    placeOrder: 'Confirm Order (COD)',
    codNote: 'Payment on delivery • Inspection available',
    emptyCart: 'Your cart is empty',
    phoneHint: 'Phone format: 07XXXXXXXX',
    phoneLabel: 'Phone',
    orderPlaced: 'Order placed ✅',
    copied: 'Copied!',
    shareCopied: 'Product link copied!',
  },
  ar: {
    brand: 'جانقستا بلاك',
    tagline: 'ستريت فاخر',
    home: 'الرئيسية',
    shop: 'المتجر',
    checkout: 'الدفع',
    contact: 'تواصل',
    phone2Label: 'هاتف احتياطي',
    cart: 'سلة المشتريات',
    cod: 'كاش',
    detail: 'تفاصيل',
    price: 'السعر',
    size: 'المقاس',
    buyNow: 'اشتري الآن',
    discover: 'اكتشف',
    subtitle: 'إصدارات محدودة • ستريت فاخر',
    trending: 'ترند',
    popular: 'الأكثر طلباً',
    sale: 'تخفيض',
    deals: 'عروض',
    product: 'منتج',
    drops: 'إصدارات',
    popularProducts: 'منتجات مشهورة',
    explore: 'تصفح',
    winter: 'شتوي',
    summer: 'صيفي',
    all: 'الكل',
    pants: 'بناطيل',
    hoodies: 'هوديز',
    tracksuits: 'ترنج',
    tshirts: 'بلايز',
    subtotal: 'المجموع',
    shipping: 'التوصيل (الأردن)',
    total: 'المجموع الكلي',
    clear: 'تفريغ السلة',
    continueShop: 'كمل تسوق',
    placeOrder: 'تأكيد الطلب (كاش)',
    codNote: 'الدفع عند الاستلام • معاينة قبل الاستلام',
    emptyCart: 'السلة فارغة',
    phoneHint: 'صيغة الهاتف: 07XXXXXXXX',
    phoneLabel: 'هاتف',
    orderPlaced: 'تم إرسال الطلب ✅',
    copied: 'تم النسخ!',
    shareCopied: 'تم نسخ الرابط!',
  }
};

// Elements
const els = {
  body: document.body,

  // menu
  openMenu: document.getElementById('openMenu'),
  closeMenu: document.getElementById('closeMenu'),
  menuDrawer: document.getElementById('menuDrawer'),
  menuOverlay: document.getElementById('menuOverlay'),

  // cart
  openCart: document.getElementById('openCart'),
  openCart2: document.getElementById('openCart2'),
  closeCart: document.getElementById('closeCart'),
  cartDrawer: document.getElementById('cartDrawer'),
  cartOverlay: document.getElementById('cartOverlay'),
  cartItems: document.getElementById('cartItems'),
  cartSummary: document.getElementById('cartSummary'),
  subtotal: document.getElementById('subtotal'),
  shipping: document.getElementById('shipping'),
  total: document.getElementById('total'),
  clearCart: document.getElementById('clearCart'),
  goCheckout: document.getElementById('goCheckout'),
  cartBadge: document.getElementById('cartBadge'),
  miniBadge: document.getElementById('miniBadge'),

  // products
  productsGrid: document.getElementById('productsGrid'),
  shopGrid: document.getElementById('shopGrid'),
  countChip: document.getElementById('countChip'),
  seasonTabs: document.getElementById('seasonTabs'),
  subcatPills: document.getElementById('subcatPills'),

  // hero slider
  heroTrack: document.getElementById('heroTrack'),
  heroDots: document.getElementById('heroDots'),
  heroPrev: document.getElementById('heroPrev'),
  heroNext: document.getElementById('heroNext'),
  discoverSlots: document.getElementById('discoverSlots'),

  // product modal
  productModal: document.getElementById('productModal'),
  productBackdrop: document.getElementById('productBackdrop'),
  closeProduct: document.getElementById('closeProduct'),
  shareBtn: document.getElementById('shareBtn'),
  productImage: document.getElementById('productImage'),
  prevImg: document.getElementById('prevImg'),
  nextImg: document.getElementById('nextImg'),
  dots: document.getElementById('dots'),
  salePill: document.getElementById('salePill'),
  productTitle: document.getElementById('productTitle'),
  productDesc: document.getElementById('productDesc'),
  productPrice: document.getElementById('productPrice'),
  productOldPrice: document.getElementById('productOldPrice'),
  addToCartBtn: document.getElementById('addToCartBtn'),
  sizeSelect: document.getElementById('sizeSelect'),

  // checkout
  checkoutEmpty: document.getElementById('checkoutEmpty'),
  checkoutBox: document.getElementById('checkoutBox'),
  checkoutSummary: document.getElementById('checkoutSummary'),
  checkoutForm: document.getElementById('checkoutForm'),
  name: document.getElementById('name'),
  phone: document.getElementById('phone'),
  phone2: document.getElementById('phone2'),
  city: document.getElementById('city'),
  address: document.getElementById('address'),
  notes: document.getElementById('notes'),
  emptyText: document.getElementById('emptyText'),
  phoneHint: document.getElementById('phoneHint'),

  // lang
  toggleLang: document.getElementById('toggleLang'),

  // toast
  toast: document.getElementById('toast'),
};

let heroIndex = 0;
let heroTimer = null;

function t(key){
  return (I18N[state.lang] && I18N[state.lang][key]) || key;
}

function setDir(){
  const rtl = state.lang === 'ar';
  els.body.setAttribute('dir', rtl ? 'rtl' : 'ltr');
  els.toggleLang.textContent = rtl ? 'EN' : 'AR';
}

function applyI18n(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  // placeholders
  els.name.placeholder = state.lang === 'ar' ? 'الاسم الكامل' : 'Full Name';
  els.phone.placeholder = state.lang === 'ar' ? 'الهاتف (07XXXXXXXX)' : 'Phone (07XXXXXXXX)';
  els.phone2.placeholder = state.lang === 'ar' ? 'هاتف احتياطي' : 'Backup Phone';
  els.city.placeholder = state.lang === 'ar' ? 'المدينة' : 'City';
  els.address.placeholder = state.lang === 'ar' ? 'العنوان الكامل' : 'Full Address';
  els.notes.placeholder = state.lang === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (optional)';
  els.emptyText.textContent = t('emptyCart');
  els.phoneHint.textContent = t('phoneHint');
}

function applyContact(){
  // Email
  const emailEl = document.querySelector('a.infoCard[href^="mailto:"]');
  if(emailEl){
    emailEl.href = `mailto:${ADMIN.email}`;
    const txt = emailEl.querySelector('.muted');
    if(txt) txt.textContent = ADMIN.email;
  }
  // Backup phone
  const phoneCards = [...document.querySelectorAll('a.infoCard[href^="tel:"]')];
  if(phoneCards[0]) phoneCards[0].href = `tel:${ADMIN.whatsapp}`;
  if(phoneCards[0]){
    const t = phoneCards[0].querySelector('.muted');
    if(t) t.textContent = ADMIN.whatsapp;
  }
  if(phoneCards[1]){
    phoneCards[1].href = `tel:${ADMIN.phone2}`;
    const t = phoneCards[1].querySelector('.muted');
    if(t) t.textContent = ADMIN.phone2;
  }
  // WhatsApp
  const wa = [...document.querySelectorAll('a.infoCard[href^="https://wa.me"]')][0];
  if(wa){
    wa.href = `https://wa.me/${ADMIN.whatsappIntl}`;
    const t = wa.querySelector('.muted');
    if(t) t.textContent = ADMIN.whatsapp;
  }
}

function showToast(msg){
  els.toast.textContent = msg;
  els.toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>els.toast.classList.remove('show'), 1600);
}

function lockScroll(on){
  document.documentElement.style.overflow = on ? 'hidden' : '';
  document.body.style.overflow = on ? 'hidden' : '';
}

function openDrawer(which){
  if(which==='menu'){
    els.menuOverlay.hidden = false;
    els.menuDrawer.classList.add('open');
    els.menuDrawer.setAttribute('aria-hidden','false');
  }
  if(which==='cart'){
    els.cartOverlay.hidden = false;
    els.cartDrawer.classList.add('open');
    els.cartDrawer.setAttribute('aria-hidden','false');
  }
  lockScroll(true);
}
function closeDrawer(which){
  if(which==='menu'){
    els.menuOverlay.hidden = true;
    els.menuDrawer.classList.remove('open');
    els.menuDrawer.setAttribute('aria-hidden','true');
  }
  if(which==='cart'){
    els.cartOverlay.hidden = true;
    els.cartDrawer.classList.remove('open');
    els.cartDrawer.setAttribute('aria-hidden','true');
  }
  lockScroll(false);
}

function formatJOD(n){
  return `${Number(n).toFixed(2)} JOD`;
}

function cartCount(){
  return state.cart.reduce((s,it)=>s+it.qty,0);
}
function cartTotal(){
  return state.cart.reduce((s,it)=>s + it.price*it.qty, 0);
}

function updateBadges(){
  const c = cartCount();
  els.cartBadge.hidden = c===0;
  els.miniBadge.hidden = c===0;
  els.cartBadge.textContent = String(c);
  els.miniBadge.textContent = String(c);
}

function addToCart(prod, size){
  const sz = (size || state.selectedSize || "M").toUpperCase();
  const key = `${prod.id}|${sz}`;
  const hit = state.cart.find(x=>x.key===key);
  if(hit) hit.qty += 1;
  else state.cart.push({key, id: prod.id, size: sz, name: prod.name, nameAr: prod.nameAr, price: prod.price, images: prod.images, qty: 1});
  updateBadges();
  renderCart();
  renderCheckout();
  showToast(state.lang === 'ar' ? 'تمت الإضافة للسلة ✅' : 'Added to cart ✅');
}

function changeQty(key, delta){
  const it = state.cart.find(x=>x.key===key);
  if(!it) return;
  it.qty = Math.max(1, it.qty + delta);
  updateBadges();
  renderCart();
  renderCheckout();
}
function removeItem(key){
  state.cart = state.cart.filter(x=>x.key!==key);
  updateBadges();
  renderCart();
  renderCheckout();
}
function clearCart(){
  state.cart = [];
  updateBadges();
  renderCart();
  renderCheckout();
}

function renderAll(){
  renderSeasonTabs();
  renderSubcats();
  renderHeroSlider();
  renderDiscoverSlots();
  renderPopular();
  renderShop();
  renderCart();
  renderCheckout();
  renderProductModal();
}

function getSlotProduct(n){
  return PRODUCTS.find(p => Number(p.sliderSlot||0) === Number(n)) || null;
}

function renderDiscoverSlots(){
  if(!els.discoverSlots) return;
  els.discoverSlots.innerHTML = '';

  const makeCard = (slot)=>{
    const p = getSlotProduct(slot);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'slotCard';

    const title = p ? (state.lang==='ar' ? (p.nameAr||p.name) : (p.name||p.nameAr)) : (state.lang==='ar' ? 'منتج' : 'Product');
    const price = p?.price ? formatJOD(p.price) : '';
    const img = p?.images?.[0] || 'assets/logo.jpg';

    card.innerHTML = `
      <img class="slotCard__img" src="${img}" alt="${escapeHtml(title)}" />
      <div class="slotCard__shade"></div>
      <div class="slotBadge">${slot}</div>
      <div class="slotCard__meta">
        <div class="slotCard__title">${escapeHtml(title)}</div>
        <div class="slotCard__price muted">${price}</div>
      </div>
    `;

    card.addEventListener('click', ()=>{
      if(p) openProduct(p);
      else scrollToSection('#shop');
    });

    return card;
  };

  els.discoverSlots.appendChild(makeCard(1));
  els.discoverSlots.appendChild(makeCard(2));
  els.discoverSlots.appendChild(makeCard(3));

  if(window.lucide) window.lucide.createIcons();
}

function getHeroProducts(){
  // Pick up to 3 products assigned from Admin via sliderSlot (1..3)
  const arr = PRODUCTS
    .filter(p => Number(p.sliderSlot||0) > 0)
    .sort((a,b)=>Number(a.sliderSlot||0)-Number(b.sliderSlot||0));
  return arr.slice(0,3);
}

function renderHeroSlider(){
  if(!els.heroTrack || !els.heroDots) return;
  const heroes = getHeroProducts();
  els.heroTrack.innerHTML = '';
  els.heroDots.innerHTML = '';

  // If admin has not chosen any items yet, show a simple placeholder
  const list = heroes.length ? heroes : [{
    id:'_placeholder',
    name:'Top Tracksuits',
    nameAr:'أفضل الترنج',
    price:0,
    originalPrice:null,
    images:['assets/logo.jpg'],
    season:'winter',
    subcat:'tracksuits',
    featured:false,
  }];

  list.forEach((p, idx)=>{
    const slide = document.createElement('div');
    slide.className = 'heroSlide';
    const name = state.lang==='ar' ? (p.nameAr||p.name) : (p.name||p.nameAr);
    const kicker = state.lang==='ar' ? 'ترنج' : 'TRACKSUIT';
    slide.innerHTML = `
      <img class="heroSlide__img" src="${p.images?.[0] || 'assets/logo.jpg'}" alt="${escapeHtml(name)}">
      <div class="heroSlide__meta">
        <div class="heroSlide__kicker muted">${kicker}</div>
        <div class="heroSlide__title">${escapeHtml(name)}</div>
        <div class="heroSlide__price">
          <span class="p">${p.price ? formatJOD(p.price) : ''}</span>
          ${p.originalPrice ? `<span class="o">${formatJOD(p.originalPrice)}</span>` : ''}
        </div>
      </div>
    `;
    if(p.id !== '_placeholder'){
      slide.addEventListener('click', ()=>openProduct(p));
    }
    els.heroTrack.appendChild(slide);

    if(heroes.length){
      const dot = document.createElement('button');
      dot.className = 'heroDot' + (idx===heroIndex ? ' heroDot--active' : '');
      dot.addEventListener('click', ()=>{
        heroIndex = idx;
        syncHero();
        restartHeroTimer();
      });
      els.heroDots.appendChild(dot);
    }
  });

  const max = Math.max(0, heroes.length - 1);
  heroIndex = Math.min(heroIndex, max);
  syncHero();

  // nav handlers
  els.heroPrev?.addEventListener('click', (e)=>{
    e.preventDefault();
    const len = heroes.length || 1;
    heroIndex = (heroIndex - 1 + len) % len;
    syncHero();
    restartHeroTimer();
  });
  els.heroNext?.addEventListener('click', (e)=>{
    e.preventDefault();
    const len = heroes.length || 1;
    heroIndex = (heroIndex + 1) % len;
    syncHero();
    restartHeroTimer();
  });

  restartHeroTimer();

  if(window.lucide) window.lucide.createIcons();
}

function syncHero(){
  if(!els.heroTrack) return;
  els.heroTrack.style.transform = `translateX(${-heroIndex*100}%)`;
  const dots = Array.from(els.heroDots?.children||[]);
  dots.forEach((d,i)=>d.classList.toggle('heroDot--active', i===heroIndex));
}

function restartHeroTimer(){
  if(heroTimer) clearInterval(heroTimer);
  const heroes = getHeroProducts();
  if(heroes.length <= 1) return;
  heroTimer = setInterval(()=>{
    heroIndex = (heroIndex + 1) % heroes.length;
    syncHero();
  }, 3200);
}

function renderCart(){
  els.cartItems.innerHTML = '';
  if(state.cart.length === 0){
    els.cartItems.innerHTML = `<div class="empty"><p class="muted">${t('emptyCart')}</p></div>`;
    els.cartSummary.hidden = true;
    return;
  }

  const frag = document.createDocumentFragment();
  state.cart.forEach(it=>{
    const row = document.createElement('div');
    row.className = 'cartItem';
    row.innerHTML = `
      <img src="${it.images[0]}" alt="">
      <div class="cartItem__main">
        <p class="cartItem__name">${state.lang==='ar' ? it.nameAr : it.name}</p>
        <div class="muted tiny">${formatJOD(it.price)} • <span class="sizePill">${t("size")}: ${escapeHtml(it.size||"M")}</span></div>
        <div class="qtyRow">
          <button class="qtyBtn" data-act="dec" aria-label="decrease"><i data-lucide="minus"></i></button>
          <strong style="min-width:26px;text-align:center">${it.qty}</strong>
          <button class="qtyBtn" data-act="inc" aria-label="increase"><i data-lucide="plus"></i></button>
          <button class="trashBtn" data-act="del" aria-label="remove"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
    `;
    row.querySelector('[data-act="dec"]').addEventListener('click', ()=>changeQty(it.key,-1));
    row.querySelector('[data-act="inc"]').addEventListener('click', ()=>changeQty(it.key,1));
    row.querySelector('[data-act="del"]').addEventListener('click', ()=>removeItem(it.key));
    frag.appendChild(row);
  });
  els.cartItems.appendChild(frag);

  const sub = cartTotal();
  els.subtotal.textContent = formatJOD(sub);
  els.shipping.textContent = formatJOD(SHIPPING_FEE);
  els.total.textContent = formatJOD(sub + SHIPPING_FEE);
  els.cartSummary.hidden = false;

  // refresh icons
  if(window.lucide) window.lucide.createIcons();
}

function productCard(prod){
  const div = document.createElement('div');
  div.className = 'cardP';
  const name = state.lang==='ar' ? prod.nameAr : prod.name;
  div.innerHTML = `
    <div class="cardP__img">
      <img src="${prod.images[0]}" alt="${escapeHtml(name)}">
    </div>
    <div class="cardP__body">
      <div class="cardP__name">${escapeHtml(name)}</div>
      <div class="cardP__meta">
        <div class="price">${prod.price} JOD</div>
        ${prod.originalPrice ? `<div class="priceOld">${prod.originalPrice} JOD</div>` : `<div class="priceOld" style="opacity:0">.</div>`}
      </div>
    </div>
  `;
  div.addEventListener('click', ()=>openProduct(prod.id));
  return div;
}

function renderPopular(){
  const featured = PRODUCTS.filter(p=>p.featured).slice(0,4);
  els.productsGrid.innerHTML = '';
  if(featured.length === 0){
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.innerHTML = `<div class="empty__title">${state.lang==='ar' ? 'لا توجد منتجات مضافة بعد' : 'No products yet'}</div>
      <div class="empty__text">${state.lang==='ar' ? 'لا يوجد منتجات بعد.' : 'No products yet.'}</div>
      `;
    els.productsGrid.appendChild(empty);
    return;
  }
  featured.forEach(p=>els.productsGrid.appendChild(productCard(p)));
}

function subcatsForSeason(season){
  if(season==='winter'){
    return ['all','pants','hoodies','tracksuits'];
  }
  return ['all','pants','tshirts','tracksuits'];
}

function renderSeasonTabs(){
  const tabs = [
    {key:'winter', label:t('winter')},
    {key:'summer', label:t('summer')},
  ];
  els.seasonTabs.innerHTML = '';
  tabs.forEach(tab=>{
    const b = document.createElement('button');
    b.className = 'segbtn' + (state.season===tab.key ? ' active' : '');
    b.textContent = tab.label;
    b.addEventListener('click', ()=>{
      state.season = tab.key;
      state.subcat = 'all';
      state.saleOnly = false;
      renderSeasonTabs();
      renderSubcats();
      renderShop();
    });
    els.seasonTabs.appendChild(b);
  });
}

function renderSubcats(){
  const subs = subcatsForSeason(state.season);
  els.subcatPills.innerHTML = '';
  subs.forEach(sc=>{
    const b = document.createElement('button');
    b.className = 'pill' + (state.subcat===sc ? ' active' : '');
    b.textContent = t(sc);
    b.addEventListener('click', ()=>{
      state.subcat = sc;
      renderSubcats();
      renderShop();
    });
    els.subcatPills.appendChild(b);
  });
}

function renderShop(){
  let list = PRODUCTS.filter(p=>p.season===state.season);
  if(state.subcat !== 'all'){
    list = list.filter(p=>p.subcat===state.subcat);
  }
  if(state.saleOnly){
    list = list.filter(p=>p.originalPrice);
  }

  els.shopGrid.innerHTML = '';
  list.forEach(p=>els.shopGrid.appendChild(productCard(p)));
  els.countChip.textContent = `${list.length} ${state.lang==='ar' ? 'منتج' : 'items'}`;
}

function openProduct(id){
  const prod = PRODUCTS.find(p=>p.id===id);
  if(!prod) return;
  state.selected = prod;
  state.imgIndex = 0;
  state.selectedSize = 'M';
  if(els.sizeSelect) els.sizeSelect.value = state.selectedSize;
  renderProductModal();
  els.productModal.hidden = false;
  els.productModal.setAttribute('aria-hidden','false');
  lockScroll(true);
}

function closeProduct(){
  els.productModal.hidden = true;
  els.productModal.setAttribute('aria-hidden','true');
  lockScroll(false);
}

function renderProductModal(){
  const p = state.selected;
  if(!p) return;
  const name = state.lang==='ar' ? p.nameAr : p.name;
  const desc = state.lang==='ar' ? p.descriptionAr : p.description;

  els.productTitle.textContent = name;
  els.productDesc.textContent = desc;
  els.productPrice.textContent = `${p.price} JOD`;
  if(p.originalPrice){
    els.productOldPrice.hidden = false;
    els.productOldPrice.textContent = `${p.originalPrice} JOD`;
    els.salePill.hidden = false;
    els.salePill.textContent = t('sale');
  }else{
    els.productOldPrice.hidden = true;
    els.salePill.hidden = true;
  }

  // image
  els.productImage.src = p.images[state.imgIndex];
  els.productImage.alt = name;

  // dots
  els.dots.innerHTML = '';
  if(p.images.length > 1){
    p.images.forEach((_,i)=>{
      const d = document.createElement('button');
      d.className = 'dotBtn' + (i===state.imgIndex ? ' active' : '');
      d.addEventListener('click', ()=>{
        state.imgIndex = i;
        renderProductModal();
      });
      els.dots.appendChild(d);
    });
    els.prevImg.style.display = '';
    els.nextImg.style.display = '';
  }else{
    els.prevImg.style.display = 'none';
    els.nextImg.style.display = 'none';
  }

  if(window.lucide) window.lucide.createIcons();
}

function nextImage(dir){
  const p = state.selected;
  if(!p || p.images.length<=1) return;
  state.imgIndex = (state.imgIndex + dir + p.images.length) % p.images.length;
  renderProductModal();
}

function renderCheckout(){
  const empty = state.cart.length === 0;
  els.checkoutEmpty.hidden = !empty;
  els.checkoutBox.hidden = empty;

  if(empty) return;

  const sub = cartTotal();
  const total = sub + SHIPPING_FEE;

  els.checkoutSummary.innerHTML = `
    ${state.cart.map(it=>`
      <div class="row" style="margin:6px 0">
        <span class="muted">${escapeHtml(state.lang==='ar' ? it.nameAr : it.name)} (${t("size")}: ${escapeHtml(it.size||"M")}) × ${it.qty}</span>
        <strong>${formatJOD(it.price*it.qty)}</strong>
      </div>
    `).join('')}
    <div class="row" style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">
      <span class="muted">${t('subtotal')}</span>
      <strong>${formatJOD(sub)}</strong>
    </div>
    <div class="row" style="margin-top:6px">
      <span class="muted">${t('shipping')}</span>
      <strong>${formatJOD(SHIPPING_FEE)}</strong>
    </div>
    <div class="row row--total" style="margin-top:10px">
      <span>${t('total')}</span>
      <strong class="primary">${formatJOD(total)}</strong>
    </div>
  `;
}

function saveOrder(order){
  const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.orders) || '[]');
  orders.push(order);
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
  // send to shared store (if configured) so admin can see all customer orders
  if(Remote.enabled) Remote.appendOrder(order);
}

function handleCheckout(e){
  e.preventDefault();
  if(state.cart.length === 0){
    showToast(t('emptyCart'));
    return;
  }
  const phoneRegex = /^07\d{8}$/;
  if(!phoneRegex.test(els.phone.value.trim()) || !phoneRegex.test(els.phone2.value.trim())){
    showToast(state.lang==='ar' ? 'صيغة الهاتف خاطئة' : 'Invalid phone');
    return;
  }

  const orderId = 'GB' + Date.now().toString().slice(-8);
  const order = {
    id: orderId,
    name: els.name.value.trim(),
    phone: els.phone.value.trim(),
    phone2: els.phone2.value.trim(),
    city: els.city.value.trim(),
    address: els.address.value.trim(),
    notes: els.notes.value.trim(),
    items: state.cart.map(it=>({
      ...it,
      quantity: it.qty, // for admin/whatsapp compatibility
    })),
    total: cartTotal() + SHIPPING_FEE,
    timestamp: Date.now(),
    status: 'pending',
  };
  saveOrder(order);
  notifyAdmin(order);

  // clear + reset form
  clearCart();
  els.checkoutForm.reset();

  // Instead of popup: toast only (as you requested earlier)
  showToast(t('orderPlaced'));

  // back to top (smooth)
  window.scrollTo({top:0, behavior:'smooth'});
}

/* Utilities */
function escapeHtml(str){
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#039;");
}

/* Scroll handling for buttons that have data-scroll */
function bindScrollButtons(){
  document.querySelectorAll('[data-scroll]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const target = btn.getAttribute('data-scroll');
      if(target === '#shop' && btn.getAttribute('data-filter') === 'sale'){
        state.saleOnly = true;
        // also jump to shop and render
        renderShop();
      }else{
        state.saleOnly = false;
      }
      const el = document.querySelector(target);
      if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
      // bottom nav active
      setActiveBottom(target);
      closeDrawer('menu');
    });
  });
}

function setActiveBottom(hash){
  document.querySelectorAll('.bottomNav__item').forEach(b=>b.classList.remove('active'));
  const items = Array.from(document.querySelectorAll('.bottomNav__item'));
  const map = {
    '#home': 0,
    '#shop': 1,
    '#checkout': 1,
    '#contact': 3,
  };
  const idx = map[hash] ?? 0;
  if(items[idx]) items[idx].classList.add('active');
}

/* Share */
async function shareProduct(){
  const p = state.selected;
  if(!p) return;
  const url = `${location.origin}${location.pathname}#p=${encodeURIComponent(p.id)}`;
  try{
    await navigator.clipboard.writeText(url);
    showToast(t('shareCopied'));
  }catch{
    showToast(t('copied'));
  }
}

/* Init */
async function init(){
  // restore from URL hash product open
  const m = location.hash.match(/p=([^&]+)/);
  if(m){
    const pid = decodeURIComponent(m[1]);
    setTimeout(()=>openProduct(pid), 250);
  }

  setDir();
  applyI18n();
  applyContact();

  // load products from Admin (localStorage)
  PRODUCTS = loadProducts();
  renderAll();

  // Drawer events
  els.openMenu.addEventListener('click', ()=>openDrawer('menu'));
  els.closeMenu.addEventListener('click', ()=>closeDrawer('menu'));
  els.menuOverlay.addEventListener('click', ()=>closeDrawer('menu'));

  els.openCart.addEventListener('click', ()=>openDrawer('cart'));
  els.openCart2.addEventListener('click', ()=>openDrawer('cart'));
  els.closeCart.addEventListener('click', ()=>closeDrawer('cart'));
  els.cartOverlay.addEventListener('click', ()=>closeDrawer('cart'));

  els.clearCart.addEventListener('click', ()=>clearCart());
  els.goCheckout.addEventListener('click', ()=>{
    closeDrawer('cart');
    document.querySelector('#checkout')?.scrollIntoView({behavior:'smooth'});
    setActiveBottom('#checkout');
  });

  // lang
  els.toggleLang.addEventListener('click', ()=>{
    state.lang = state.lang === 'en' ? 'ar' : 'en';
    setDir();
    applyI18n();
    renderAll();
    updateBadges();
    if(window.lucide) window.lucide.createIcons();
  });

  // product modal events
  els.productBackdrop.addEventListener('click', closeProduct);
  els.closeProduct.addEventListener('click', closeProduct);
  els.prevImg.addEventListener('click', ()=>nextImage(-1));
  els.nextImg.addEventListener('click', ()=>nextImage(1));
    if(els.sizeSelect){
    els.sizeSelect.addEventListener('change', ()=>{
      state.selectedSize = els.sizeSelect.value || 'M';
    });
  }
els.addToCartBtn.addEventListener('click', ()=>{
    if(state.selected) addToCart(state.selected, state.selectedSize);
    closeProduct();
  });
  els.shareBtn.addEventListener('click', shareProduct);

  // checkout
  els.checkoutForm.addEventListener('submit', handleCheckout);

  // Remote sync (if configured): pull latest, then start polling
  if(Remote.enabled){
    await Remote.pullToCache();
    Remote.startPolling();
    window.addEventListener('gb_store_updated', ()=>{
      applyContactFromStorage();
      PRODUCTS = loadProducts();
      renderAll();
      updateBadges();
      if(window.lucide) window.lucide.createIcons();
    });
  }

  // load products (local cache)
  PRODUCTS = loadProducts();

  // render UI
  renderAll();
  updateBadges();
  bindScrollButtons();

  // Bottom nav scroll buttons
  document.querySelectorAll('.bottomNav__item[data-scroll]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const target = btn.getAttribute('data-scroll');
      if(target){
        document.querySelector(target)?.scrollIntoView({behavior:'smooth', block:'start'});
        setActiveBottom(target);
      }
    });
  });

  // lucide
  if(window.lucide) window.lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', init);


window.addEventListener('focus', ()=>{
  applyContactFromStorage();
  PRODUCTS = loadProducts();
  renderAll();
  updateBadges();
  if(window.lucide) window.lucide.createIcons();
});

window.addEventListener('storage', (e)=>{
  if(e.key === STORAGE_KEYS.products){
    PRODUCTS = loadProducts();
    renderAll();
    if(window.lucide) window.lucide.createIcons();
  }
  if(e.key === 'gb_contact'){
    applyContactFromStorage();
    applyContact();
  }
});
