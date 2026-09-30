// Yozuv poygasining onlayn xonasi: qurilmalar o'rtasida nima yuboriladi.
// Qoida: erkin matn (ism, chat, yoziladigan matn) tarmoqqa CHIQMAYDI — faqat sonlar va qisqa kalit so'zlar.
// Matn urug' (son) bilan yuboriladi, har qurilma uni o'zi yasaydi: bir xil urug' — bir xil matn.
(function (root) {
  "use strict";

  const node = typeof module !== "undefined" && module.exports;
  const P = node ? require("./poyga.js") : root.QK.yozuvPoyga;
  const TY = node ? require("../../23-on-barmoq/js/typing.js") : root.QK.typing;

  const TYPES = ["lobbi", "holat", "kirdi", "qadam"];
  // Matn yasash qoidasining versiyasi. So'zlar soni yoki so'z ro'yxatlari o'zgarsa — OSHIRILADI.
  // Sababi: matn tarmoqqa chiqmaydi, har qurilma uni koddan yasaydi. Qurilmada sayt nusxasi eski
  // bo'lsa, matn boshqacha bo'ladi va poyga jimgina buziladi (kim kam so'z yozgan — o'sha yutadi).
  const MATN_V = 2;
  const HOST_JIM = 20000; // boshlovchidan shuncha vaqt xabar kelmasa — u uzilgan
  const JAMI_MAX = 900; // matn belgilarining oqilona chegarasi (50 ta so'z ≈ 300–400 belgi)

  // O'yinchining yashirin raqami: ism emas, faqat shu qurilmani tanish uchun (uzilsa — o'sha joyidan)
  function kimlik(rng) {
    const r = rng || Math.random;
    let s = "";
    for (let k = 0; k < 6; k++) s += "abcdefghjkmnpqrstuvwxyz23456789"[Math.floor(r() * 31)];
    return s;
  }

  // Bir xil urug' — bir xil tasodif ketma-ketligi (Lehmer). Shuning uchun matn hamma qurilmada bir xil.
  function seedRng(urug) {
    let s = Math.abs(Math.floor(urug)) % 2147483647;
    if (s <= 0) s = 1;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  const urugYasa = (rng) => 1 + Math.floor((rng || Math.random)() * 9999998);
  const matnYasa = (tur, urug) => TY.raceText(P.turById(tur).id, null, seedRng(urug), P.SOZLAR);

  // ---------- Boshlovchi → hamma ----------
  const lobbi = (s) => {
    const list = P.tartib(s);
    return { v: MATN_V, ids: list.map((p) => p.id), qah: list.map((p) => p.qahramon) };
  };

  // Holat: reyting tartibida (birinchi — yetakchi). Pog'ona yuborilmaydi — har qurilma o'zi hisoblaydi.
  function paket(s) {
    const r = P.tartib(s);
    return {
      v: MATN_V,
      tur: s.tur,
      urug: s.urug,
      jami: s.jami,
      ids: r.map((p) => p.id),
      qah: r.map((p) => p.qahramon),
      bel: r.map((p) => p.bel),
      orin: r.map((p) => p.orin),
      ms: r.map((p) => p.ms),
      cpm: r.map((p) => p.cpm),
      aniq: r.map((p) => p.aniq),
      bosh: s.boshlandi ? 1 : 0,
      tugadi: s.tugadi ? 1 : 0,
    };
  }

  // Paket to'g'rimi: uzunliklari teng, sonlari son, 12 kishidan oshmagan, matn turi bor
  function yaxshiPaket(p) {
    if (!p || typeof p !== "object" || !Array.isArray(p.ids)) return false;
    if (!p.ids.length || p.ids.length > P.MAX_ODAM) return false;
    const n = p.ids.length;
    const royxat = ["qah", "bel", "orin", "ms", "cpm", "aniq"];
    if (!royxat.every((k) => Array.isArray(p[k]) && p[k].length === n)) return false;
    const sonli = ["bel", "orin", "ms", "cpm", "aniq"];
    if (!sonli.every((k) => p[k].every((v) => typeof v === "number" && v >= 0 && v < 1e7))) return false;
    if (typeof p.jami !== "number" || p.jami < 0 || p.jami > JAMI_MAX) return false;
    if (typeof p.urug !== "number" || p.urug < 0) return false;
    return !!P.TURLAR.find((t) => t.id === p.tur);
  }

  // Qurilmadagi sayt nusxasi boshlovchiniki bilan bir xilmi
  const versiyaMos = (p) => !!p && p.v === MATN_V;

  // Matn haqiqatan bir xilmi: versiya bir xil va shu urug'dan yasalgan matn uzunligi mos.
  // Mos kelmasa — qurilmada eski nusxa ochilgan, poygaga kirmaslik kerak.
  function matnMos(p) {
    if (!versiyaMos(p)) return false;
    if (typeof p.urug !== "number" || typeof p.jami !== "number" || !p.jami) return false;
    if (!P.TURLAR.find((t) => t.id === p.tur)) return false;
    try {
      return [...matnYasa(p.tur, p.urug)].length === p.jami;
    } catch (e) {
      return false;
    }
  }

  // ---------- Paketdan ekran uchun holat ----------
  function holat(p, now) {
    const t = P.turById(p.tur);
    const s = {
      tur: t.id, urug: p.urug, tog: t.tog, pogona: t.pogona, jami: p.jami,
      boshlandi: !!p.bosh, boshlangan: now, tugadi: !!p.tugadi, keldi: 0, oyinchilar: {},
    };
    p.ids.forEach((id, k) => {
      s.oyinchilar[id] = {
        id,
        qahramon: p.qah[k],
        bel: p.bel[k],
        pogona: P.pogonaOf(p.bel[k], p.jami, t.pogona),
        orin: p.orin[k],
        ms: p.ms[k],
        cpm: p.cpm[k],
        aniq: p.aniq[k],
        oxirgi: now,
        // Tog' sahnasi shu maydonlarni kutadi; bu o'yinda chiqib ketish ham, pauza ham yo'q
        chiqdi: false,
        pauzaGacha: 0,
      };
      s.keldi = Math.max(s.keldi, p.orin[k]);
    });
    return s;
  }

  const api = { TYPES, MATN_V, HOST_JIM, JAMI_MAX, kimlik, seedRng, urugYasa, matnYasa, lobbi, paket, yaxshiPaket, versiyaMos, matnMos, holat };

  if (node) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.yozuvProtokol = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
