const V='af-v1';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin) return; // never touch orders / Apps Script
  if(r.mode==='navigate'){e.respondWith(fetch(r).catch(()=>caches.match('/')));return;}
  if(/^\/(assets|products|brand)\//.test(u.pathname)||/\.(woff2?|png|webp|css|js)$/.test(u.pathname)){
    e.respondWith(caches.open(V).then(c=>c.match(r).then(h=>h||fetch(r).then(n=>{if(n.ok)c.put(r,n.clone());return n;}))));
  }
});
