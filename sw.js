/* 우리 가족 일정 — 홈 화면 앱용 서비스 워커
   같은 주소의 파일만 다루고, 항상 인터넷의 최신 파일을 먼저 받아요.
   인터넷이 끊겼을 때만 마지막으로 받아 둔 화면을 보여 줘요. */
const CACHE = "family-v1";
self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // 구글 로그인·저장소 요청은 건드리지 않음
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("./")))
  );
});
