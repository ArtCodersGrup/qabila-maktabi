// Offline rejim: service worker'ni ro'yxatdan o'tkazadi.
// file:// bilan ochilganda brauzer buni qo'llamaydi — jim o'tkazib yuboriladi.
(function (root) {
  "use strict";

  if (!/^https?:/.test(root.location.protocol) || !("serviceWorker" in root.navigator)) return;

  // Sayt ildizi: o'yin sahifasi .../oyinlar/NN-nomi/ ichida bo'lishi mumkin
  const path = root.location.pathname;
  const at = path.indexOf("/oyinlar/");
  const base = at >= 0 ? path.slice(0, at + 1) : path.replace(/[^/]*$/, "");

  root.addEventListener("load", () => {
    root.navigator.serviceWorker.register(base + "sw.js", { scope: base }).catch(() => {});
  });
})(window);
