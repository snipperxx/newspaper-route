// 旧地址的离线缓存：注销自己，让设备去新地址（不删缓存：同域名下新 Wortkarten 和送报 App 也在用）
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.registration.unregister()));
