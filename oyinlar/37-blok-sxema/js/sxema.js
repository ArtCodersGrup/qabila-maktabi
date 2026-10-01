// 37-o'yin: blok-sxema modeli va undan Python kodi yasash (sof mantiq).
// Sxema — bloklar ro'yxati. Shart va siklning ichiga ODDIY bloklar qo'yiladi (bitta darajali ichma-ichlik):
// maktab dasturidagi mavzular shu bilan qoplanadi, UI esa sodda qoladi.
// Ekran bilan ishlamaydi, Node'da test qilinadi: tests/sxema.test.js
(function (root) {
  "use strict";

  // Blok turlari: shakli (ekran uchun) va ichiga blok olishi
  const TURLAR = [
    { id: "boshla", nom: "Boshlash", shakl: "oval", sodda: true },
    { id: "kirit", nom: "Kiritish", shakl: "yon", sodda: true },
    { id: "amal", nom: "Amal", shakl: "tort", sodda: true },
    { id: "chiqar", nom: "Chiqarish", shakl: "yon", sodda: true },
    { id: "shart", nom: "Shart", shakl: "romb", sodda: false },
    { id: "sikl", nom: "Takror", shakl: "tort-qavs", sodda: false },
    { id: "tugat", nom: "Tugash", shakl: "oval", sodda: true },
  ];
  const turById = (id) => TURLAR.find((t) => t.id === id) || null;
  const SODDA = TURLAR.filter((t) => t.sodda && t.id !== "boshla" && t.id !== "tugat").map((t) => t.id);

  const bosh = (s) => "    ".repeat(Math.max(0, s));

  // Sxemadan Python kodi. daraja — otstup chuqurligi.
  function kodYasa(bloklar, daraja) {
    const d = daraja || 0;
    const satrlar = [];
    for (const b of bloklar || []) {
      if (!b || !b.tur) continue;
      if (b.tur === "boshla" || b.tur === "tugat") continue; // sxemada bor, kodda yo'q
      if (b.tur === "shart") {
        satrlar.push(bosh(d) + "if " + b.kod + ":");
        const ha = kodYasa(b.ha, d + 1);
        satrlar.push(ha.length ? ha : bosh(d + 1) + "pass");
        const yoq = kodYasa(b.yoq, d + 1);
        if (yoq.length) {
          satrlar.push(bosh(d) + "else:");
          satrlar.push(yoq);
        }
        continue;
      }
      if (b.tur === "sikl") {
        satrlar.push(bosh(d) + b.kod + ":");
        const tana = kodYasa(b.tana, d + 1);
        satrlar.push(tana.length ? tana : bosh(d + 1) + "pass");
        continue;
      }
      satrlar.push(bosh(d) + b.kod);
    }
    return satrlar.join("\n");
  }

  // Sxema to'g'ri yig'ilganmi (bolaga tushunarli sabab bilan)
  function tekshir(bloklar) {
    const list = bloklar || [];
    const ish = list.filter((b) => b.tur !== "boshla" && b.tur !== "tugat");
    if (!ish.length) return { ok: false, sabab: "Sxema boʻsh — bloklarni qoʻy." };
    const chiqar = (bl) => bl.some((b) => b.tur === "chiqar"
      || (b.tur === "shart" && (chiqar(b.ha || []) || chiqar(b.yoq || [])))
      || (b.tur === "sikl" && chiqar(b.tana || [])));
    if (!chiqar(ish)) return { ok: false, sabab: "Natija chiqarilmagan — “Chiqarish” bloki kerak." };
    for (const b of ish) {
      if (b.tur === "shart" && !(b.ha || []).length && !(b.yoq || []).length) {
        return { ok: false, sabab: "Shartning ichi boʻsh — “ha” tomoniga blok qoʻy." };
      }
      if (b.tur === "sikl" && !(b.tana || []).length) {
        return { ok: false, sabab: "Takror ichi boʻsh — qaytariladigan blok qoʻy." };
      }
    }
    return { ok: true };
  }

  // Sxemadagi bloklar soni (ichidagilari bilan)
  function soni(bloklar) {
    let n = 0;
    for (const b of bloklar || []) {
      n += 1;
      if (b.tur === "shart") n += soni(b.ha) + soni(b.yoq);
      if (b.tur === "sikl") n += soni(b.tana);
    }
    return n;
  }

  const api = { TURLAR, SODDA, turById, kodYasa, tekshir, soni };

  root.QK = root.QK || {};
  root.QK.sxema = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
