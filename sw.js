const V='nos-v4',FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','icon-badge.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;
 e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))))});
self.addEventListener('notificationclick',e=>{e.notification.close();const url=new URL((e.notification.data&&e.notification.data.url)||'./',self.registration.scope).href;
 e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){if('focus' in c){c.navigate&&c.navigate(url);return c.focus()}}return self.clients.openWindow(url)}))});
function idb(){return new Promise((res,rej)=>{const r=indexedDB.open('nos-sw',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function remind(){try{const db=await idb(),st=await new Promise(r=>{const q=db.transaction('kv').objectStore('kv').get('state');q.onsuccess=()=>r(q.result);q.onerror=()=>r(null)});if(!st)return;
 const n=new Date(),cur=n.getHours()*60+n.getMinutes(),dow=n.getDay(),key=n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0');
 const shown=await self.registration.getNotifications();
 for(const r of st.rem||[]){if(!r.on||!(r.days||[]).includes(dow))continue;const [h,m]=r.time.split(':').map(Number),rm=h*60+m;if(rm>cur||cur-rm>90)continue;const tag='sw'+r.id+key;if(shown.some(x=>x.tag===tag))continue;
  const g=(st.goals||[]).find(x=>x.id===r.goal);if(g&&(key<g.start||key>g.end))continue;
  await self.registration.showNotification(g?g.name:'NeuroOrbitSynapse',{body:r.msg||'Time to fire your neuron',tag,icon:'icon-192.png',badge:'icon-badge.png',vibrate:[120,60,120],data:{url:'./'+(g?'?goal='+encodeURIComponent(g.id):'')}})}}catch(e){}}
self.addEventListener('periodicsync',e=>{if(e.tag==='nos-remind')e.waitUntil(remind())});
