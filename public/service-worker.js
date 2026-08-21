
const CACHE_NAME = 'google-maps-cache-v1';
const urlsToCache = [
  '/',
  '/en/client', // Path ของหน้าเว็บหลัก
  'https://maps.googleapis.com/maps/api/staticmap?center=13.7563,100.5018&zoom=12&size=600x400&key=AIzaSyC_SQ7_3nIKgEsMWlP685Ymyv-2tHABMIo' // URL ของ Static Map ที่ต้องการ Cache
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});