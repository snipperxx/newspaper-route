// 离线缓存：App 本身先用缓存；路线数据先联网（拿最新），没网用缓存；地图瓦片看过的存下来
const V = "songbao2-v5";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js",
  "https://cdn.jsdelivr.net/npm/leaflet-rotate@0.2.8/dist/leaflet-rotate.js"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  // 同域名下还有 Wortkarten：只清自己的旧版本缓存
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("songbao") && k !== V).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.hostname === "nominatim.openstreetmap.org") return;
  if (u.pathname.endsWith("data.enc.json")) {
    e.respondWith(fetch(e.request, { cache: "no-cache" }).then((r) => { const c = r.clone(); caches.open(V).then((x) => x.put("data.enc.json", c)); return r; })
      .catch(() => caches.match("data.enc.json")));
  } else if (u.hostname === "tile.openstreetmap.org") {
    e.respondWith(caches.open("tiles").then((c) => c.match(e.request).then((hit) => hit ||
      fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; }))));
  } else if (u.pathname.endsWith("/") || u.pathname.endsWith("index.html")) {
    // 页面本身：先联网拿新版本，没网用缓存
    e.respondWith(fetch(e.request, { cache: "no-cache" }).then((r) => { const c = r.clone(); caches.open(V).then((x) => x.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("index.html"))));
  } else {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
  }
});
