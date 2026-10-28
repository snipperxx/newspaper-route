// 旧地址的离线缓存：清掉自己，让设备去新地址
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(caches.keys()
  .then((ks) => Promise.all(ks.filter((k) => k.startsWith("wortkarten") || k.startsWith("wk-")).map((k) => caches.delete(k))))
  .then(() => self.registration.unregister())));
