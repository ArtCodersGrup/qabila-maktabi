// Toifa — o'quvchi tanlagan sinf guruhi: boshlangich (1–4), orta (5–8), yuqori (9–11); "hammasi" — o'qituvchi.
// <head> da ulanadi (bosh sahifa va asboblar): tanlovni <html data-toifa> ga sahifa chizilishidan OLDIN
// qo'yadi — sahifa avval bolalar ko'rinishida chiqib, keyin almashmaydi.
// O'yin sahifalarida atribut faylning o'zida yozilgan (o'yinning o'z toifasi) — unga tegilmaydi.
(function (root) {
  "use strict";

  const KALIT = "qabila:toifa:v2";
  const ESKI = "qabila:toifa:v1"; // yosh bo'yicha (8–11 / 12–16) edi — sinflarga to'g'ri kelmaydi
  const IDS = ["boshlangich", "orta", "yuqori", "hammasi"];
  const BOLA_FON = "#FFF6E5";
  const KATTA_FON = "#FBFAF7"; // asos.css dagi kattalar --fon bilan bir xil

  const el = root.document ? root.document.documentElement : null;
  const yozilgan = !!(el && el.hasAttribute("data-toifa"));

  function oqi() {
    try {
      const v = root.localStorage.getItem(KALIT);
      return IDS.includes(v) ? v : null;
    } catch (e) {
      return null;
    }
  }

  function yoz(id) {
    try {
      if (IDS.includes(id)) root.localStorage.setItem(KALIT, id);
      else root.localStorage.removeItem(KALIT);
      root.localStorage.removeItem(ESKI);
    } catch (e) { /* xotira yopiq — tanlov faqat shu sahifada amal qiladi */ }
  }

  // "hammasi" va tanlov yo'q — atributsiz, ya'ni bolalar ko'rinishi
  function qolla() {
    if (!el || yozilgan) return;
    const id = oqi();
    const katta = id === "orta" || id === "yuqori";
    if (id && id !== "hammasi") el.setAttribute("data-toifa", id);
    else el.removeAttribute("data-toifa");
    const meta = root.document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", katta ? KATTA_FON : BOLA_FON);
  }

  root.QK = root.QK || {};
  root.QK.toifa = { KALIT, IDS, oqi, yoz, qolla };
  qolla();
})(window);
