// Garde le hub sur l'appareil pour l'ouvrir sans réseau.
const C = "hub-maison-160a2325ec";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-180.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(C).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C && k.startsWith("hub-maison-")).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    // Réseau d'abord (pour recevoir les mises à jour), copie locale si pas de réseau.
    e.respondWith(fetch(r).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(C).then((c) => c.put(r, cp)); } return res; })
      .catch(() => caches.match(r, { ignoreSearch: true }).then((m) => m || caches.match("./"))));
    return;
  }
  if (/^(fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com)$/.test(u.host)) {
    e.respondWith(caches.match(r).then((m) => m || fetch(r).then((res) => { const cp = res.clone(); caches.open(C).then((c) => c.put(r, cp)); return res; })));
  }
});
