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

  // 5–8 ko'rinishi sinovi (asos.css oxiridagi bo'lim): ?korinish=daftar — faqat shu sahifada ko'rsatadi,
  // tanlov esa localStorage da (korinish.html sahifasidagi «Shuni tanlayman»). "asl" — hozirgi ko'rinish.
  const KORINISH_KALIT = "qabila:korinish:v1";
  const KORINISHLAR = ["daftar", "sxema", "doska"];

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

  function korinishOqi() {
    try {
      const v = root.localStorage.getItem(KORINISH_KALIT);
      return KORINISHLAR.includes(v) ? v : null;
    } catch (e) {
      return null;
    }
  }

  function korinishYoz(id) {
    try {
      if (KORINISHLAR.includes(id)) root.localStorage.setItem(KORINISH_KALIT, id);
      else root.localStorage.removeItem(KORINISH_KALIT);
    } catch (e) { /* xotira yopiq */ }
  }

  // URL dagi ?korinish= (faqat shu sahifa) ustun, keyin saqlangan tanlov
  function korinish() {
    let p = null;
    try { p = new URLSearchParams((root.location && root.location.search) || "").get("korinish"); } catch (e) { p = null; }
    if (p === "asl") return null;
    if (KORINISHLAR.includes(p)) return p;
    return korinishOqi();
  }

  function korinishQoy() {
    if (!el) return;
    const k = korinish();
    if (k) el.setAttribute("data-korinish", k);
    else el.removeAttribute("data-korinish");
  }

  // "hammasi" va tanlov yo'q — atributsiz, ya'ni bolalar ko'rinishi
  function qolla() {
    korinishQoy();
    if (!el || yozilgan) return;
    const id = oqi();
    const katta = id === "orta" || id === "yuqori";
    if (id && id !== "hammasi") el.setAttribute("data-toifa", id);
    else el.removeAttribute("data-toifa");
    const meta = root.document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", katta ? KATTA_FON : BOLA_FON);
  }

  root.QK = root.QK || {};
  root.QK.toifa = { KALIT, IDS, oqi, yoz, qolla, KORINISHLAR, korinish, korinishYoz };
  qolla();
})(window);
