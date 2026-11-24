/* DREI KAMPF stable offline worker v1. Normally no changes between game releases. */
'use strict';
const base=new URL(self.registration.scope),entry=new URL('index.html',base);
const cacheName='drei-kampf-release-v1:'+base.pathname;
const valid=v=>typeof v==='string'&&/^\d{1,6}\.\d{1,6}\.\d{1,6}$/.test(v);
const cmp=(a,b)=>{const x=a.split('.').map(Number),y=b.split('.').map(Number);for(let i=0;i<3;i++)if(x[i]!==y[i])return x[i]-y[i];return 0};
self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);
 if(e.request.method!=='GET'||u.origin!==base.origin||e.request.mode!=='navigate'||![base.pathname,entry.pathname].includes(u.pathname))return;
 e.respondWith((async()=>{
  try{
   const cache=await caches.open(cacheName);
   const keys=(await cache.keys()).map(k=>({k,u:new URL(k.url)})).filter(x=>x.u.origin===entry.origin&&x.u.pathname===entry.pathname&&valid(x.u.searchParams.get('__dk_cached'))).sort((a,b)=>cmp(b.u.searchParams.get('__dk_cached'),a.u.searchParams.get('__dk_cached')));
   for(const item of keys){const hit=await cache.match(item.k);if(hit)return hit}
  }catch{}
  // Only an empty cache requires a network navigation. Never intercept manifest or validation fetches.
  try{return await fetch(e.request,{cache:'no-store'})}catch{return new Response('初回のオンライン起動が必要です。通信に接続して再度開いてください。',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})}
 })());
});
