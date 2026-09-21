// Offline rejim: sayt fayllari keshlanadi. Bola saytni bir marta ochsa, keyin internetsiz ham oʻynay oladi.
// Yangi fayl qoʻshilsa, FILES roʻyxatiga ham qoʻshiladi — buni bosh/tests/offline.test.js tekshiradi.
const VERSION = "v5";
const CACHE = "qabila-maktabi-" + VERSION;

const FILES = [
  "./",
  "index.html",
  "manifest.json",
  "bosh/style.css",
  "bosh/icon.svg",
  "bosh/icon-192.png",
  "bosh/icon-512.png",
  "bosh/js/bosh-art.js",
  "bosh/js/bosh.js",
  "oyinlar/umumiy/css/asos.css",
  "oyinlar/umumiy/fonts/Nunito.woff2",
  "oyinlar/umumiy/js/app.js",
  "oyinlar/umumiy/js/art.js",
  "oyinlar/umumiy/js/offline.js",
  "oyinlar/umumiy/js/practice.js",
  "oyinlar/umumiy/js/sound.js",
  "oyinlar/umumiy/js/storage.js",
  "oyinlar/umumiy/js/ui.js",
  "oyinlar/01-qabila-kodlari/",
  "oyinlar/01-qabila-kodlari/index.html",
  "oyinlar/01-qabila-kodlari/css/style.css",
  "oyinlar/01-qabila-kodlari/js/game-art.js",
  "oyinlar/01-qabila-kodlari/js/logic.js",
  "oyinlar/01-qabila-kodlari/js/main.js",
  "oyinlar/01-qabila-kodlari/js/scenes/common.js",
  "oyinlar/01-qabila-kodlari/js/scenes/final.js",
  "oyinlar/01-qabila-kodlari/js/scenes/stage1.js",
  "oyinlar/01-qabila-kodlari/js/scenes/stage2.js",
  "oyinlar/01-qabila-kodlari/js/scenes/stage3.js",
  "oyinlar/02-qabila-morzesi/",
  "oyinlar/02-qabila-morzesi/index.html",
  "oyinlar/02-qabila-morzesi/css/style.css",
  "oyinlar/02-qabila-morzesi/js/game-art.js",
  "oyinlar/02-qabila-morzesi/js/main.js",
  "oyinlar/02-qabila-morzesi/js/morse-ui.js",
  "oyinlar/02-qabila-morzesi/js/morse.js",
  "oyinlar/02-qabila-morzesi/js/scenes/common.js",
  "oyinlar/02-qabila-morzesi/js/scenes/final.js",
  "oyinlar/02-qabila-morzesi/js/scenes/stage1.js",
  "oyinlar/02-qabila-morzesi/js/scenes/stage2.js",
  "oyinlar/02-qabila-morzesi/js/scenes/stage3.js",
  "oyinlar/03-sezar-maktubi/",
  "oyinlar/03-sezar-maktubi/index.html",
  "oyinlar/03-sezar-maktubi/css/style.css",
  "oyinlar/03-sezar-maktubi/js/caesar-ui.js",
  "oyinlar/03-sezar-maktubi/js/caesar.js",
  "oyinlar/03-sezar-maktubi/js/game-art.js",
  "oyinlar/03-sezar-maktubi/js/main.js",
  "oyinlar/03-sezar-maktubi/js/scenes/common.js",
  "oyinlar/03-sezar-maktubi/js/scenes/final.js",
  "oyinlar/03-sezar-maktubi/js/scenes/stage1.js",
  "oyinlar/03-sezar-maktubi/js/scenes/stage2.js",
  "oyinlar/03-sezar-maktubi/js/scenes/stage3.js",
  "oyinlar/04-qabila-chiroqlari/",
  "oyinlar/04-qabila-chiroqlari/index.html",
  "oyinlar/04-qabila-chiroqlari/css/style.css",
  "oyinlar/04-qabila-chiroqlari/js/game-art.js",
  "oyinlar/04-qabila-chiroqlari/js/lamps-ui.js",
  "oyinlar/04-qabila-chiroqlari/js/lamps.js",
  "oyinlar/04-qabila-chiroqlari/js/main.js",
  "oyinlar/04-qabila-chiroqlari/js/scenes/common.js",
  "oyinlar/04-qabila-chiroqlari/js/scenes/final.js",
  "oyinlar/04-qabila-chiroqlari/js/scenes/stage1.js",
  "oyinlar/04-qabila-chiroqlari/js/scenes/stage2.js",
  "oyinlar/04-qabila-chiroqlari/js/scenes/stage3.js",
  "oyinlar/05-rim-toshi/",
  "oyinlar/05-rim-toshi/index.html",
  "oyinlar/05-rim-toshi/css/style.css",
  "oyinlar/05-rim-toshi/js/game-art.js",
  "oyinlar/05-rim-toshi/js/main.js",
  "oyinlar/05-rim-toshi/js/roman-ui.js",
  "oyinlar/05-rim-toshi/js/roman.js",
  "oyinlar/05-rim-toshi/js/scenes/common.js",
  "oyinlar/05-rim-toshi/js/scenes/final.js",
  "oyinlar/05-rim-toshi/js/scenes/stage1.js",
  "oyinlar/05-rim-toshi/js/scenes/stage2.js",
  "oyinlar/05-rim-toshi/js/scenes/stage3.js",
  "oyinlar/06-robotni-orgatamiz/",
  "oyinlar/06-robotni-orgatamiz/index.html",
  "oyinlar/06-robotni-orgatamiz/css/style.css",
  "oyinlar/06-robotni-orgatamiz/js/game-art.js",
  "oyinlar/06-robotni-orgatamiz/js/learn-ui.js",
  "oyinlar/06-robotni-orgatamiz/js/learn.js",
  "oyinlar/06-robotni-orgatamiz/js/main.js",
  "oyinlar/06-robotni-orgatamiz/js/scenes/common.js",
  "oyinlar/06-robotni-orgatamiz/js/scenes/final.js",
  "oyinlar/06-robotni-orgatamiz/js/scenes/stage1.js",
  "oyinlar/06-robotni-orgatamiz/js/scenes/stage2.js",
  "oyinlar/06-robotni-orgatamiz/js/scenes/stage3.js",
  "oyinlar/07-keyingi-soz/",
  "oyinlar/07-keyingi-soz/index.html",
  "oyinlar/07-keyingi-soz/css/style.css",
  "oyinlar/07-keyingi-soz/js/game-art.js",
  "oyinlar/07-keyingi-soz/js/main.js",
  "oyinlar/07-keyingi-soz/js/scenes/common.js",
  "oyinlar/07-keyingi-soz/js/scenes/final.js",
  "oyinlar/07-keyingi-soz/js/scenes/stage1.js",
  "oyinlar/07-keyingi-soz/js/scenes/stage2.js",
  "oyinlar/07-keyingi-soz/js/scenes/stage3.js",
  "oyinlar/07-keyingi-soz/js/words-ui.js",
  "oyinlar/07-keyingi-soz/js/words.js",
  "oyinlar/08-sehrli-qutilar/",
  "oyinlar/08-sehrli-qutilar/index.html",
  "oyinlar/08-sehrli-qutilar/css/style.css",
  "oyinlar/08-sehrli-qutilar/js/boxes-ui.js",
  "oyinlar/08-sehrli-qutilar/js/boxes.js",
  "oyinlar/08-sehrli-qutilar/js/game-art.js",
  "oyinlar/08-sehrli-qutilar/js/main.js",
  "oyinlar/08-sehrli-qutilar/js/scenes/common.js",
  "oyinlar/08-sehrli-qutilar/js/scenes/final.js",
  "oyinlar/08-sehrli-qutilar/js/scenes/stage1.js",
  "oyinlar/08-sehrli-qutilar/js/scenes/stage2.js",
  "oyinlar/08-sehrli-qutilar/js/scenes/stage3.js",
  "oyinlar/09-qoida-yoki-misol/",
  "oyinlar/09-qoida-yoki-misol/index.html",
  "oyinlar/09-qoida-yoki-misol/css/style.css",
  "oyinlar/09-qoida-yoki-misol/js/game-art.js",
  "oyinlar/09-qoida-yoki-misol/js/main.js",
  "oyinlar/09-qoida-yoki-misol/js/rules-ui.js",
  "oyinlar/09-qoida-yoki-misol/js/rules.js",
  "oyinlar/09-qoida-yoki-misol/js/scenes/common.js",
  "oyinlar/09-qoida-yoki-misol/js/scenes/final.js",
  "oyinlar/09-qoida-yoki-misol/js/scenes/stage1.js",
  "oyinlar/09-qoida-yoki-misol/js/scenes/stage2.js",
  "oyinlar/09-qoida-yoki-misol/js/scenes/stage3.js",
  "oyinlar/10-robot-korishi/",
  "oyinlar/10-robot-korishi/index.html",
  "oyinlar/10-robot-korishi/css/style.css",
  "oyinlar/10-robot-korishi/js/game-art.js",
  "oyinlar/10-robot-korishi/js/main.js",
  "oyinlar/10-robot-korishi/js/scenes/common.js",
  "oyinlar/10-robot-korishi/js/scenes/final.js",
  "oyinlar/10-robot-korishi/js/scenes/stage1.js",
  "oyinlar/10-robot-korishi/js/scenes/stage2.js",
  "oyinlar/10-robot-korishi/js/scenes/stage3.js",
  "oyinlar/10-robot-korishi/js/vision-ui.js",
  "oyinlar/10-robot-korishi/js/vision.js",
  "oyinlar/11-kop-qatlamli-tarmoq/",
  "oyinlar/11-kop-qatlamli-tarmoq/index.html",
  "oyinlar/11-kop-qatlamli-tarmoq/css/style.css",
  "oyinlar/11-kop-qatlamli-tarmoq/js/game-art.js",
  "oyinlar/11-kop-qatlamli-tarmoq/js/main.js",
  "oyinlar/11-kop-qatlamli-tarmoq/js/neural-ui.js",
  "oyinlar/11-kop-qatlamli-tarmoq/js/neural.js",
  "oyinlar/11-kop-qatlamli-tarmoq/js/scenes/common.js",
  "oyinlar/11-kop-qatlamli-tarmoq/js/scenes/final.js",
  "oyinlar/11-kop-qatlamli-tarmoq/js/scenes/stage1.js",
  "oyinlar/11-kop-qatlamli-tarmoq/js/scenes/stage2.js",
  "oyinlar/11-kop-qatlamli-tarmoq/js/scenes/stage3.js",
  "oyinlar/12-ai-xaritasi/",
  "oyinlar/12-ai-xaritasi/index.html",
  "oyinlar/12-ai-xaritasi/css/style.css",
  "oyinlar/12-ai-xaritasi/js/atlas-ui.js",
  "oyinlar/12-ai-xaritasi/js/atlas.js",
  "oyinlar/12-ai-xaritasi/js/game-art.js",
  "oyinlar/12-ai-xaritasi/js/main.js",
  "oyinlar/12-ai-xaritasi/js/scenes/common.js",
  "oyinlar/12-ai-xaritasi/js/scenes/final.js",
  "oyinlar/12-ai-xaritasi/js/scenes/stage1.js",
  "oyinlar/12-ai-xaritasi/js/scenes/stage2.js",
  "oyinlar/12-ai-xaritasi/js/scenes/stage3.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Avval keshdan beramiz (tez va internetsiz ishlaydi), orqa fonda yangilaymiz
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  if (new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE).then((cache) => cache.match(request).then((hit) => {
      const fresh = fetch(request)
        .then((response) => {
          if (response && response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => hit || (request.mode === "navigate" ? cache.match("index.html") : undefined));
      return hit || fresh;
    }))
  );
});
