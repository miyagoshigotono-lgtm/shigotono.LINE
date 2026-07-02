const CACHE = 'miyago-v1';
const ASSETS = [
  './chuki_line.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// インストール時：静的ファイルをキャッシュ
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// アクティベート時：古いキャッシュ削除
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// フェッチ時：GAS通信はネットワーク優先、それ以外はキャッシュ優先
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // GAS・LINE APIはキャッシュしない（常にネットワーク）
  if (url.includes('script.google.com') || url.includes('api.line.me')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // 静的ファイルはキャッシュ優先
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
