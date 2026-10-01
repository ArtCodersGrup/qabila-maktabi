// Kichik C++: dasturni ISHGA TUSHIRISHDAN OLDIN tekshirish.
//
// Nega kerak: blokning asosiy darsi — "C++ xatoni ishdan oldin topadi". Agar e'lon qilinmagan
// nom faqat o'sha satrga yetganda xato bersa, bola avval bir necha satr chiqishni ko'radi va
// dars yolg'on bo'lib qoladi. Shuning uchun nomlar oldindan tekshiriladi — g++ dagidek.
//
// Hozir tekshiriladi: e'lon qilinmagan nom va bitta blokda ikki marta e'lon.
(function (root) {
  "use strict";

  const E = (root.QK && root.QK.cppEngine && root.QK.cppEngine.errors) || require("./errors.js");

  function tekshir(dastur) {
    const stek = [new Map()];
    const bormi = (nom) => stek.some((m) => m.has(nom));
    const qosh = (nom, node) => {
      if (stek[stek.length - 1].has(nom)) throw E.qaytaElon(nom, node);
      stek[stek.length - 1].set(nom, true);
    };

    function ifoda(node) {
      if (!node || typeof node !== "object") return;
      switch (node.k) {
        case "nom":
          if (!bormi(node.nom)) throw E.tanilmagan(node.nom, node);
          return;
        case "indeks":
          ifoda(node.obj);
          ifoda(node.indeks);
          return;
        case "uzunlik": ifoda(node.obj); return;
        case "bir": ifoda(node.ifoda); return;
        case "oldin": case "keyin": ifoda(node.maqsad); return;
        case "ikki": ifoda(node.chap); ifoda(node.ong); return;
        case "tayinlash": ifoda(node.maqsad); ifoda(node.qiymat); return;
        case "royxat": for (const x of node.elementlar) ifoda(x); return;
        default: return; // son, matn, belgi, bool
      }
    }

    function buyruq(node) {
      switch (node.k) {
        case "blok":
          stek.push(new Map());
          for (const s of node.tana) buyruq(s);
          stek.pop();
          return;
        case "elon":
          for (const e of node.elonlar) {
            if (e.boyi) ifoda(e.boyi);
            if (e.qiymat) ifoda(e.qiymat); // o'zidan oldin: int a = a; xato beradi
            qosh(e.nom, e.line ? e : node);
          }
          return;
        case "ifoda": ifoda(node.ifoda); return;
        case "chiqar": case "oqi":
          for (const q of node.qismlar) if (q.k !== "endl") ifoda(q);
          return;
        case "agar":
          ifoda(node.shart);
          buyruq(node.tana);
          if (node.aks) buyruq(node.aks);
          return;
        case "toki": ifoda(node.shart); buyruq(node.tana); return;
        case "takror":
          stek.push(new Map()); // for (int i = …) — i faqat sikl ichida
          if (node.bosh) buyruq(node.bosh);
          if (node.shart) ifoda(node.shart);
          if (node.qadam) ifoda(node.qadam);
          buyruq(node.tana);
          stek.pop();
          return;
        case "qaytar": if (node.ifoda) ifoda(node.ifoda); return;
        default: return; // bosh, uz, davom
      }
    }

    buyruq(dastur.tana);
    return dastur;
  }

  const api = { tekshir };
  root.QK = root.QK || {};
  root.QK.cppEngine = Object.assign(root.QK.cppEngine || {}, { semantika: api });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
