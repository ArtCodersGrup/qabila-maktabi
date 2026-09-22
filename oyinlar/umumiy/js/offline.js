// Offline rejim: service worker'ni ro'yxatdan o'tkazadi.
// file:// bilan ochilganda brauzer buni qo'llamaydi — jim o'tkazib yuboriladi.
(function (root) {
  "use strict";

  if (!/^https?:/.test(root.location.protocol) || !("serviceWorker" in root.navigator)) return;

  // Sayt ildizi: o'yin sahifasi .../oyinlar/NN-nomi/ ichida bo'lishi mumkin
  const path = root.location.pathname;
  const at = path.indexOf("/oyinlar/");
  const base = at >= 0 ? path.slice(0, at + 1) : path.replace(/[^/]*$/, "");

  // Yangi versiya o'rnatilib, sahifani o'z qo'liga olsa — bosh sahifa bir marta o'zi yangilanadi.
  // O'yin ichida yangilanmaydi (bola o'ynab turgan joyini yo'qotmasin): yangisi keyingi ochishda ko'rinadi.
  const onSiteHome = at < 0;
  const hadController = !!root.navigator.serviceWorker.controller; // birinchi o'rnatishda yangilash shart emas
  let reloaded = false;
  root.navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!onSiteHome || !hadController || reloaded) return;
    reloaded = true;
    root.location.reload();
  });

  root.addEventListener("load", () => {
    root.navigator.serviceWorker.register(base + "sw.js", { scope: base }).catch(() => {});
  });
})(window);
