// 64-o'yin «Robot sanaydi»: o'zgaruvchi — qadam = 0, qadam + 1, takror qadam marta (sof mantiq).
// Bloklar va bajarish umumiy dvigateldan: umumiy/js/blok.js. Node'da test: tests/logic.test.js
(function (root) {
  "use strict";

  const B = (root.QK && root.QK.blok) || require("../../umumiy/js/blok.js");
  const { yur, takror, toki, qoy, qosh, randInt, pick, TESKARI } = B;

  const MAX_W = 8;
  const MAX_H = 6;
  const yonlarDan = (yurishlar) => [...new Set(yurishlar)];

  // Dasturni "gulxanga e'tibor bermasdan" sanash: qutida nima bo'lishi kerak (o'qib topiladigan javob)
  function oddiySanoq(dastur) {
    let v = 0;
    let yurish = 0;
    const royxat = (list) => {
      for (const b of list) {
        if (b.t === "yur") yurish++;
        else if (b.t === "qoy") v = b.n || 0;
        else if (b.t === "qosh") v++;
        else if (b.t === "takror") for (let k = 0; k < b.n; k++) royxat(b.ichi);
      }
    };
    royxat(dastur);
    return { qiymat: v, yurish };
  }

  // =====================================================================
  // 1-bosqich: Kuzat — tayyor dastur, oxirida qutida qanday son?
  // =====================================================================
  // Bo'laklar: har biri bloklar + yurishlar. Yo'l o'zini kesmaydi, maydon ≤ 8×6.
  const yonTanla = (oldingi, rng) => pick(B.YONLAR.filter((y) => !oldingi || y !== TESKARI[oldingi]), rng);
  const perp = (yon, rng) => pick(yon === "right" || yon === "left" ? ["up", "down"] : ["right", "left"], rng);

  const BOLAK = {
    // → qadam+1
    tekis: (d) => ({ bloklar: [yur(d), qosh()], yurish: [d] }),
    // → → qadam+1 — yurish ikkita, qo'shish bitta (qadam — yurishlar soni emas, qo'shishlar soni)
    tekis2: (d) => ({ bloklar: [yur(d), yur(d), qosh()], yurish: [d, d] }),
    // takror n [→, qadam+1]
    takror: (d, rng, tier) => {
      const n = randInt(2, tier === 0 ? 3 : 4, rng);
      return { bloklar: [takror(n, [yur(d), qosh()])], yurish: Array(n).fill(d) };
    },
    // takror n [→] — qutiga tegmaydi (tuzoq)
    bekor: (d, rng) => {
      const n = randInt(2, 3, rng);
      return { bloklar: [takror(n, [yur(d)])], yurish: Array(n).fill(d) };
    },
    // takror n [qadam+1] — yurishsiz qo'shish
    faqatQosh: (d, rng) => {
      const n = randInt(2, 4, rng);
      return { bloklar: [takror(n, [qosh()])], yurish: [] };
    },
    // takror n [→, qadam+1, qadam+1] — har safar ikkita
    ikki: (d, rng) => {
      const n = randInt(2, 3, rng);
      return { bloklar: [takror(n, [yur(d), qosh(), qosh()])], yurish: Array(n).fill(d) };
    },
    // takror a [ takror b [→, qadam+1], ↓ ] — ichma-ich: a × b
    ichma: (d, rng) => {
      const a = randInt(2, 3, rng);
      const b = randInt(2, 3, rng);
      const d2 = perp(d, rng);
      const yurish = [];
      for (let k = 0; k < a; k++) yurish.push(...Array(b).fill(d), d2);
      return { bloklar: [takror(a, [takror(b, [yur(d), qosh()]), yur(d2)])], yurish };
    },
    // qadam = 0 — qutini yana nolga qo'yish (o'rtada)
    nol: () => ({ bloklar: [qoy(0)], yurish: [] }),
  };

  const KUZAT_TURLAR = [
    { turlar: ["tekis", "tekis", "takror"], soni: [2, 3], kerak: ["takror"] },
    { turlar: ["tekis", "tekis2", "takror", "bekor", "faqatQosh"], soni: [3, 3], kerak: ["takror"] },
    { turlar: ["takror", "ikki", "ichma", "bekor", "faqatQosh", "tekis2"], soni: [3, 4], kerak: ["ichma", "ikki"] },
  ];
  const JAVOB_ORALIQ = [[2, 8], [4, 14], [6, 20]];

  function yasaKuzat(rng, tier) {
    const t = KUZAT_TURLAR[tier];
    const nechta = randInt(t.soni[0], t.soni[1], rng);
    const turlar = [];
    for (let k = 0; k < nechta; k++) turlar.push(pick(t.turlar, rng));
    // Kerakli turdan kamida bittasi bo'lsin (1–2: takror ichida qadam+1; 3: ichma-ich yoki ikkitalik)
    if (!turlar.some((x) => t.kerak.includes(x))) turlar[randInt(0, nechta - 1, rng)] = pick(t.kerak, rng);
    // 3-tierda ba'zan o'rtada "qadam = 0" (qiymat yo'qoladi, keyin yana sanaladi)
    if (tier === 2 && rng() < 0.4) turlar.splice(randInt(1, 2, rng), 0, "nol");
    const dastur = [qoy(0)];
    const yurishlar = [];
    let oldingi = null;
    for (const tur of turlar) {
      const d = yonTanla(oldingi, rng);
      const bolak = BOLAK[tur](d, rng, tier);
      dastur.push(...bolak.bloklar);
      yurishlar.push(...bolak.yurish);
      if (bolak.yurish.length) oldingi = bolak.yurish[bolak.yurish.length - 1];
    }
    // Oxirgi qadam — gulxanga (undan keyin qadam+1 bo'lsa, robot gulxanda to'xtab, uni bajarmasdi)
    const oxirgi = yonTanla(oldingi, rng);
    dastur.push(yur(oxirgi));
    yurishlar.push(oxirgi);

    // Yo'l o'zini kesmasin, maydonga sig'sin
    const kataklar = B.iz(yurishlar).map((c) => c.x + "," + c.y);
    if (new Set(kataklar).size !== kataklar.length) return null;
    const f = B.yoldanMaydon(yurishlar, true);
    if (f.w > MAX_W || f.h > MAX_H) return null;

    const r = B.bajar(f, dastur);
    const oddiy = oddiySanoq(dastur);
    if (r.status !== "goal" || r.path.length !== yurishlar.length + 1 || r.qiymat !== oddiy.qiymat) return null;
    const [lo, hi] = JAVOB_ORALIQ[tier];
    if (r.qiymat < lo || r.qiymat > hi) return null;
    // Javob yurishlar soniga teng bo'lsa — robotning qadamlarini sanash yetib qoladi; 1-tierdan oshsa bunga yo'l qo'ymaymiz
    if (tier > 0 && r.qiymat === yurishlar.length) return null;
    return { id: "kuzat:" + JSON.stringify(dastur), f, dastur, javob: r.qiymat, yurgiz: tier === 0 };
  }

  // =====================================================================
  // 2–3-bosqich: o'lcha va qaytar — robot toshgacha sanaydi, keyin shuncha yuradi
  // =====================================================================
  // Kanonik shakl (→ o'lchash, ↓ qaytish), keyin aks ettirish / burish bilan boshqa yo'nalishlar.
  // Har shakl oxirida bitta "burilish" qadami bor: gulxan sanoq bilan yurilgan yo'lning davomida emas.
  // Aks holda "… boʻsh ekan takrorla" yoki chekka robotni gulxanga o'zi olib borardi — sanoqsiz yechim chiqardi.
  const R = "right";
  const Lf = "left";
  const U = "up";
  const Dn = "down";
  const SHAKL = {
    // olcha: L → (toshgacha), L ↓, bitta →. Gulxan toshning ostida.
    olcha: {
      L: [2, 4],
      yasa: (L) => ({
        start: { x: 0, y: 0 }, tosh: { x: L + 1, y: 0 }, w: L + 2, h: L + 2,
        yechim: [qoy(0), toki(R, [yur(R), qosh()]), takror("qadam", [yur(Dn)]), yur(R)],
      }),
      matn: "Toshgacha nechta qadam boʻlsa, gulxan shuncha qator narida. Robot avval sanasin, keyin shuncha yursin.",
    },
    // zina: L →, keyin takror qadam [↓, ←], bitta ←
    zina: {
      L: [2, 4],
      yasa: (L) => ({
        start: { x: 1, y: 0 }, tosh: { x: L + 2, y: 0 }, w: L + 3, h: L + 2,
        yechim: [qoy(0), toki(R, [yur(R), qosh()]), takror("qadam", [yur(Dn), yur(Lf)]), yur(Lf)],
      }),
      matn: "Toshgacha sana, keyin shuncha pogʻona zinapoyadan yur.",
    },
    // ikki barobar: L ↓ (toshgacha), takror qadam [→, →], bitta ↓
    ikki: {
      L: [2, 3],
      yasa: (L) => ({
        start: { x: 0, y: 0 }, tosh: { x: 0, y: L + 1 }, w: 2 * L + 2, h: L + 2,
        yechim: [qoy(0), toki(Dn, [yur(Dn), qosh()]), takror("qadam", [yur(R), yur(R)]), yur(Dn)],
      }),
      matn: "Toshgacha sana. Gulxan ikki barobar uzoqda!",
    },
    // burchak: L →, L ↓, L ←, bitta ↑ — qadam ikki marta ishlatiladi.
    // Gulxan "tokchada": yonida qo'shimcha tosh — bir qator kam tushgan robot ← yo'lida gulxanga yetib qolmasin.
    burchak: {
      L: [2, 4],
      yasa: (L) => ({
        start: { x: 1, y: 0 }, tosh: { x: L + 2, y: 0 }, qoshimcha: [{ x: 2, y: L - 1 }], w: L + 3, h: L + 2,
        yechim: [qoy(0), toki(R, [yur(R), qosh()]), takror("qadam", [yur(Dn)]), takror("qadam", [yur(Lf)]), yur(U)],
      }),
      matn: "Toshgacha sana. Keyin shuncha qadam bir tomonga, yana shuncha — boshqa tomonga.",
    },
  };

  // Yo'nalish almashtirish: flipX (→↔←), flipY (↓↔↑), trans (x↔y, →↔↓)
  function yonAlmash(yon, o) {
    let y = yon;
    if (o.trans) y = { right: "down", down: "right", left: "up", up: "left" }[y];
    if (o.flipX && (y === "right" || y === "left")) y = TESKARI[y];
    if (o.flipY && (y === "up" || y === "down")) y = TESKARI[y];
    return y;
  }
  function dasturAlmash(dastur, o) {
    return dastur.map((b) => {
      const n = B.nusxa(b);
      if (n.yon) n.yon = yonAlmash(n.yon, o);
      if (n.ichi) n.ichi = dasturAlmash(n.ichi, o);
      return n;
    });
  }
  // Kanonik maydonni aylantirish: avval trans, keyin aks ettirish
  function maydonAlmash(k, goal, o) {
    let w = k.w;
    let h = k.h;
    let joy = (c) => ({ x: c.x, y: c.y });
    if (o.trans) { [w, h] = [h, w]; joy = (c) => ({ x: c.y, y: c.x }); }
    const tx = (c) => {
      const p = joy(c);
      return { x: o.flipX ? w - 1 - p.x : p.x, y: o.flipY ? h - 1 - p.y : p.y };
    };
    return B.maydon(tx(k.start), tx(goal), [k.tosh, ...(k.qoshimcha || [])].map(tx), w, h);
  }

  // Kanonik yechimni yurib, gulxan joyini topish (kanonik maydonda)
  function kanonikMaydon(k) {
    const f = B.maydon(k.start, { x: -9, y: -9 }, [k.tosh, ...(k.qoshimcha || [])], k.w, k.h);
    const r = B.bajar(f, k.yechim);
    if (r.status !== "end") return null; // kanonik shakl xato bo'lsa
    return r.at;
  }

  // Sanoqsiz "aldash" dasturlari: har "takror qadam" o'rniga aniq son (1..9) yoki "… boʻsh ekan takrorla" (4 tomon)
  function aldashlar(yechim) {
    const joylar = yechim.map((b, i) => (b.t === "takror" && b.n === "qadam" ? i : -1)).filter((i) => i >= 0);
    const variant = (b) => [
      ...Array.from({ length: 9 }, (_, k) => takror(k + 1, B.nusxa(b.ichi))),
      ...B.YONLAR.map((y) => toki(y, B.nusxa(b.ichi))),
    ];
    const out = [];
    const rek = (k, joriy) => {
      if (k === joylar.length) {
        if (joriy.some((b, i) => b !== yechim[i])) out.push(joriy.slice());
        return;
      }
      const i = joylar[k];
      rek(k + 1, joriy);
      for (const v of variant(yechim[i])) {
        const prev = joriy[i];
        joriy[i] = v;
        rek(k + 1, joriy);
        joriy[i] = prev;
      }
    };
    rek(0, yechim.slice());
    return out;
  }
  // Tugmalar: yechimdagi yo'nalishlar (birinchisi — o'lchash tomoni, "… boʻsh ekan" shu tomonga qo'yiladi),
  // keyin bloklar; "takror" (aniq son) — chalg'ituvchi: u bir maydonda yiqiladi
  function bloklarUchun(yechim) {
    const yonlar = [];
    const yig = (list) => list.forEach((b) => { if (b.yon) yonlar.push(b.yon); if (b.ichi) yig(b.ichi); });
    yig(yechim);
    return [...yonlarDan(yonlar), "toki", "takror", "qoy", "qosh", "takrorQadam"];
  }
  const hammasida = (maydonlar, dastur) => maydonlar.every((f) => B.bajar(f, dastur).status === "goal");

  const OLCHA_SHAKLLAR = [["olcha"], ["olcha"], ["olcha"]];
  const SANOQ_SHAKLLAR = [["burchak"], ["burchak", "zina"], ["zina", "ikki", "burchak"]];

  function yasaOlchov(shakllar, rng, tier) {
    const nom = pick(shakllar[tier], rng);
    const s = SHAKL[nom];
    const hi = tier === 0 ? Math.min(3, s.L[1]) : s.L[1];
    const L1 = randInt(s.L[0], hi, rng);
    const L2 = randInt(s.L[0], hi, rng);
    if (L1 === L2) return null;
    const o = {
      flipX: tier >= 1 && rng() < 0.5,
      flipY: tier >= 2 && rng() < 0.5,
      trans: tier >= 2 && rng() < 0.3,
    };
    const maydonlar = [];
    let yechim = null;
    for (const L of [L1, L2]) {
      const k = s.yasa(L);
      const goal = kanonikMaydon(k);
      if (!goal) return null;
      const f = maydonAlmash(k, goal, o);
      if (f.w > MAX_W || f.h > MAX_H) return null;
      maydonlar.push(f);
      yechim = dasturAlmash(k.yechim, o);
    }
    if (!hammasida(maydonlar, yechim)) return null;
    // Qulf: sanoqsiz dastur ikkala maydondan birdan o'tmasin
    if (aldashlar(yechim).some((d) => hammasida(maydonlar, d))) return null;
    return {
      id: `${nom}:${o.flipX ? 1 : 0}${o.flipY ? 1 : 0}${o.trans ? 1 : 0}:${L1}-${L2}`,
      shakl: nom,
      matn: s.matn,
      maydonlar,
      bloklar: bloklarUchun(yechim),
      maxBlok: B.soni(yechim) + 1,
      yechim,
      quti: true,
      maslahat: "Toshgacha masofa har maydonda boshqa. Robot sanagan «qadam» sonini takrorda ishlat.",
    };
  }

  // =====================================================================
  // Qotirilgan namunalar (ko'rsatuv sahnalari) va zaxira
  // =====================================================================
  const KORSATUV = {
    // 1-bosqich: 1 + 3 = 4
    kuzat: (() => {
      const dastur = [qoy(0), yur(R), qosh(), takror(3, [yur(Dn), qosh()]), yur(R)];
      return { id: "korsatuv-kuzat", f: B.yoldanMaydon([R, Dn, Dn, Dn, R], true), dastur, javob: 4, yurgiz: true };
    })(),
    // 2-bosqich: ikki maydon (L = 2 va 3); aniq son bittasida ishlaydi
    olcha: (() => {
      const maydonlar = [2, 3].map((L) => {
        const k = SHAKL.olcha.yasa(L);
        return maydonAlmash(k, kanonikMaydon(k), {});
      });
      return {
        maydonlar,
        sonli: [qoy(0), toki(R, [yur(R), qosh()]), takror(2, [yur(Dn)]), yur(R)],
        yechim: SHAKL.olcha.yasa(2).yechim,
      };
    })(),
  };

  function zaxira(bosqich) {
    if (bosqich === "kuzat") return KORSATUV.kuzat;
    const nom = bosqich === "olcha" ? "olcha" : "burchak";
    const s = SHAKL[nom];
    const maydonlar = [2, 3].map((L) => { const k = s.yasa(L); return maydonAlmash(k, kanonikMaydon(k), {}); });
    const yechim = s.yasa(2).yechim;
    return {
      id: "zaxira:" + nom, shakl: nom, matn: s.matn, maydonlar,
      bloklar: bloklarUchun(yechim),
      maxBlok: B.soni(yechim) + 1, yechim, quti: true,
      maslahat: "Toshgacha masofa har maydonda boshqa. Robot sanagan «qadam» sonini takrorda ishlat.",
    };
  }

  const YASOVCHI = {
    kuzat: yasaKuzat,
    olcha: (rng, tier) => yasaOlchov(OLCHA_SHAKLLAR, rng, tier),
    sanoq: (rng, tier) => yasaOlchov(SANOQ_SHAKLLAR, rng, tier),
  };
  const BOSQICH = { 1: "kuzat", 2: "olcha", 3: "sanoq" };

  // Yangi vazifa: oldingisining aynan o'zi emas (QOIDALAR 4.3). bosqich — 1/2/3 yoki "kuzat"/"olcha"/"sanoq".
  function yasa(bosqich, prev, rng, tier) {
    const nom = BOSQICH[bosqich] || bosqich;
    rng = rng || Math.random;
    tier = Math.max(0, Math.min(2, tier || 0));
    for (let k = 0; k < 500; k++) {
      const level = YASOVCHI[nom](rng, tier);
      if (level && (!prev || prev.id !== level.id)) return level;
    }
    const z = zaxira(nom);
    return prev && prev.id === z.id ? { ...z, id: z.id + ":2" } : z;
  }

  const api = { yasa, oddiySanoq, aldashlar, hammasida, SHAKL, KORSATUV, MAX_W, MAX_H };
  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
