// תמיכה בעבודה בלי אינטרנט לאפליקציית המלאי של עמקה.
// קודם מהרשת (כדי שעדכונים יופיעו מיד), ומהמטמון כגיבוי כשאין חיבור.
// נרשם עם scope של אפליקציית המלאי בלבד, כך שהוא לא נוגע באתר של הלקוחות.
const CACHE='amka-inv-v3';
const PAGE='./panel-x7k2-stock.html';
const SHELL=[PAGE,'./stock.webmanifest','./images/stock-icon-192.png','./images/stock-icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('amka-inv-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request, url=new URL(req.url);
  // רק קבצים מהאתר עצמו. הסנכרון מול השרת (ונתוני המלאי) תמיד הולך לרשת ולא נשמר במטמון.
  if(req.method!=='GET'||url.origin!==self.location.origin) return;
  e.respondWith(
    fetch(req).then(res=>{
      if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}
      return res;
    }).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match(PAGE)))
  );
});
