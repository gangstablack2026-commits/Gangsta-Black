/*
  Shared store layer.

  - If REMOTE_STORE_URL is empty, the site keeps working with localStorage only.
  - If REMOTE_STORE_URL is set, we:
      * pull remote data and cache it into localStorage keys used by the site
      * push updates from admin (products/orders/contact) to the remote
      * optionally poll for changes so everyone stays in sync

  Remote API contract (simple):
    GET  REMOTE_STORE_URL
      -> { products:[], orders:[], contact:{}, updatedAt:number }

    POST REMOTE_STORE_URL
      body: { token?:string, action:"setProducts"|"setOrders"|"setContact"|"appendOrder", payload:any }
      -> { ok:true, updatedAt:number }
*/

(function(){
  const LS_KEYS = {
    products: 'gb_products',
    orders: 'gb_orders',
    contact: 'gb_contact',
    meta: 'gb_remote_meta'
  };

  const url = (window.REMOTE_STORE_URL || '').trim();
  const token = (window.REMOTE_STORE_TOKEN || '').trim();
  const pollMs = Number(window.REMOTE_STORE_POLL_MS || 5000);

  function safeJsonParse(s, fallback){
    try{ return JSON.parse(s); }catch{ return fallback; }
  }

  function getMeta(){
    return safeJsonParse(localStorage.getItem(LS_KEYS.meta) || '{"updatedAt":0}', {updatedAt:0});
  }
  function setMeta(meta){
    localStorage.setItem(LS_KEYS.meta, JSON.stringify(meta||{updatedAt:0}));
  }

  function setIfArray(key, arr){
    if(Array.isArray(arr)) localStorage.setItem(key, JSON.stringify(arr));
  }
  function setIfObj(key, obj){
    if(obj && typeof obj === 'object') localStorage.setItem(key, JSON.stringify(obj));
  }

  async function remoteGet(){
    if(!url) return null;
    try{
      const res = await fetch(url, { method: 'GET', cache: 'no-store' });
      if(!res.ok) return null;
      const data = await res.json();
      return data && typeof data === 'object' ? data : null;
    }catch{ return null; }
  }

  async function remotePost(action, payload){
    if(!url) return { ok:false };
    try{
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token || undefined, action, payload })
      });
      if(!res.ok) return { ok:false };
      const data = await res.json().catch(()=>({ok:true}));
      return data && typeof data === 'object' ? data : { ok:true };
    }catch{ return { ok:false }; }
  }

  async function pullToCache(){
    const data = await remoteGet();
    if(!data) return false;

    const meta = getMeta();
    const remoteUpdatedAt = Number(data.updatedAt || 0);
    const hasLocal = !!localStorage.getItem(LS_KEYS.products);
    if(remoteUpdatedAt && (remoteUpdatedAt <= Number(meta.updatedAt||0)) && hasLocal) {
      return false;
    }

    setIfArray(LS_KEYS.products, data.products || []);
    setIfArray(LS_KEYS.orders, data.orders || []);
    setIfObj(LS_KEYS.contact, data.contact || {});
    setMeta({ updatedAt: remoteUpdatedAt || Date.now() });
    window.dispatchEvent(new CustomEvent('gb_store_updated', { detail: { source: 'remote', updatedAt: remoteUpdatedAt } }));
    return true;
  }

  async function pushProducts(products){
    const r = await remotePost('setProducts', products || []);
    if(r && r.ok!==false) setMeta({ updatedAt: Number(r.updatedAt||Date.now()) });
    return r;
  }

  async function pushOrders(orders){
    const r = await remotePost('setOrders', orders || []);
    if(r && r.ok!==false) setMeta({ updatedAt: Number(r.updatedAt||Date.now()) });
    return r;
  }

  async function pushContact(contact){
    const r = await remotePost('setContact', contact || {});
    if(r && r.ok!==false) setMeta({ updatedAt: Number(r.updatedAt||Date.now()) });
    return r;
  }

  async function appendOrder(order){
    const r = await remotePost('appendOrder', order || {});
    if(r && r.ok!==false) setMeta({ updatedAt: Number(r.updatedAt||Date.now()) });
    return r;
  }

  let pollTimer = null;
  function startPolling(){
    if(!url) return;
    stopPolling();
    pollTimer = setInterval(()=>{ pullToCache(); }, Math.max(2000, pollMs||5000));
  }
  function stopPolling(){
    if(pollTimer){ clearInterval(pollTimer); pollTimer = null; }
  }

  window.GBStore = {
    enabled: !!url,
    pullToCache,
    startPolling,
    stopPolling,
    pushProducts,
    pushOrders,
    pushContact,
    appendOrder,
  };
})();
