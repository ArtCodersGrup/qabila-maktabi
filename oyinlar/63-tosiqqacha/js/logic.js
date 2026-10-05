// 63-o'yin «To'siqqacha»: while sikli — "→ bo'sh ekan takrorla" (toki) va "gulxanga yetguncha" (sof mantiq).
// Har vazifada ikki maydon: yo'lak uzunligi / zinapoya shakli har xil, shuning uchun aniq sonli dastur
// bittasida yiqiladi. Bloklar va bajarish umumiy dvigateldan: umumiy/js/blok.js
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const B = (root.QK && root.QK.blok) || require("../../umumiy/js/blok.js");
  const D = (root.QK && root.QK.dastur) || require("../../umumiy/js/dastur.js");

  const { yur, toki, agar, gulxangacha, kop, randInt, pick, TESKARI } = B;
  const MAX_W = 8;
  const MAX_H = 6;

  const gorizontal = (yon) => yon === "right" || yon === "left";
  const tik = (yon) => (gorizontal(yon) ? ["up", "down"] : ["right", "left"]); // perpendikulyar yonlar

  // Bo'laklar [[yon, uzunlik], ...] → tor yo'l maydoni (yo'ldan boshqa hamma katak tosh).
  // Yo'l yagona bo'lmasa yoki maydon katta bo'lsa — null.
  function yolMaydon(bolaklar) {
    const yurishlar = [];
    for (const [yon, n] of bolaklar) for (let k = 0; k < n; k++) yurishlar.push(yon);
    const f = B.torYol(yurishlar);
    if (!f || f.w > MAX_W || f.h > MAX_H) return null;
    return f;
  }

  // Qotirilgan (sezgisiz) dastur ikkala maydonda ishlay oladimi? Maydonlar robot bo'yicha ustma-ust qo'yiladi:
  // ikkalasida ham bo'sh kataklar orqali biror gulxanga yetib bo'lsa — yur/takror bilan yechib bo'ladi.
  // (Bir maydon gulxanga yetsa, dastur unda to'xtaydi — qolgan buyruqlar faqat ikkinchisiga ishlaydi.)
  function qotirilganYolYoq(maydonlar) {
    const boshmi = (f, dx, dy) => {
      const c = { x: f.robot.x + dx, y: f.robot.y + dy };
      return D.inside(f, c) && !D.isWall(f, c);
    };
    const gulxanmi = (dx, dy) => maydonlar.some((f) => f.goal.x - f.robot.x === dx && f.goal.y - f.robot.y === dy);
    const seen = new Set(["0,0"]);
    let navbat = [[0, 0]];
    while (navbat.length) {
      const keyingi = [];
      for (const [x, y] of navbat) {
        for (const yon of B.YONLAR) {
          const nx = x + D.DIRS[yon].dx;
          const ny = y + D.DIRS[yon].dy;
          const k = nx + "," + ny;
          if (seen.has(k) || !maydonlar.every((f) => boshmi(f, nx, ny))) continue;
          if (gulxanmi(nx, ny)) return false;
          seen.add(k);
          keyingi.push([nx, ny]);
        }
      }
      navbat = keyingi;
    }
    return true;
  }

  // Ikki xil son (a ≠ b) [min, max] oralig'idan
  function ikkiXil(min, max, rng) {
    const a = randInt(min, max, rng);
    let b = randInt(min, max - 1, rng);
    if (b >= a) b++;
    return [a, b];
  }

  // Ikki maydon tayyor bo'lgach: namunali yechim ikkalasida ishlaydimi va sezgisiz yo'l yo'qmi
  function yaroqli(maydonlar, yechim) {
    if (maydonlar.some((f) => !f)) return false;
    if (maydonlar[0].id === maydonlar[1].id) return false;
    if (!maydonlar.every((f) => B.bajar(f, yechim).status === "goal")) return false;
    return qotirilganYolYoq(maydonlar);
  }

  const tokiYur = (yon) => toki(yon, [yur(yon)]);
  // Yo'nalish tugmalari aralash tartibda (birinchisi — yangi blokning boshlang'ich yoni)
  function aralash(list, rng) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  const MASLAHAT = {
    tosiq: "Yoʻlak har maydonda boshqa uzunlikda. Robot sonni bilmaydi — u faqat oldinga qaray oladi.",
    gulxan: "Robot gulxanga yetguncha nima qilishi kerak — har qadamda qaysi tomon boʻsh?",
    birga: "Bitta pogʻonani qanday yurasan? Oʻshani gulxanga yetguncha takrorla.",
  };

  // ---------- 1-bosqich: to'siqqacha ----------
  // tier 0: yo'lak (L har xil) + burilib 1–2 qadam; tier 1: L shakli (ikki toki); tier 2: uch bo'lak.
  // Har yo'lakdan keyin burilish bor, gulxan oxirgi burilishdan keyin (dum qadam).
  function tosiqLevel(yonlar, uzunA, uzunB, dum, tier) {
    const bolak = (uzun) => yonlar.slice(0, uzun.length).map((yon, i) => [yon, uzun[i]]).concat(dum ? [[yonlar[uzun.length], dum]] : []);
    const maydonlar = [yolMaydon(bolak(uzunA)), yolMaydon(bolak(uzunB))];
    const yechim = uzunA.map((_, i) => tokiYur(yonlar[i])).concat(dum ? kop(yonlar[uzunA.length], dum) : []);
    return {
      id: `tosiq:${yonlar.join("")}:${uzunA.join("")}-${uzunB.join("")}:${dum}`,
      matn: tier === 0 ? "Yoʻlak oxirigacha yur, keyin burilib gulxanga bor. Bitta dastur ikkala maydonda ishlasin."
        : tier === 1 ? "Ikki yoʻlak ketma-ket, uzunligi har maydonda boshqa. Bitta dastur ikkalasida ishlasin."
          : "Uch boʻlakli yoʻl, har maydonda boshqa uzunlikda. Bitta dastur ikkalasida ishlasin.",
      maydonlar,
      bloklar: [...new Set(yonlar.slice(0, uzunA.length + (dum ? 1 : 0)))],
      yechim,
      maxBlok: B.soni(yechim) + 1,
      maslahat: MASLAHAT.tosiq,
    };
  }

  function yasaTosiq(rng, tier) {
    const d1 = pick(B.YONLAR, rng);
    const d2 = pick(tik(d1), rng);
    const d3 = pick(tik(d2), rng);
    const d4 = pick(tik(d3), rng);
    const yonlar = [d1, d2, d3, d4];
    const chek = (yon) => (gorizontal(yon) ? MAX_W - 1 : MAX_H - 1);
    let uzunA;
    let uzunB;
    // Oxirgi yo'lakdan keyin ham burilish bor: aks holda oxirgi toki o'rniga "takror (eng uzun)" ham
    // o'tib ketardi — gulxanga yetgach dastur to'xtaydi, ortiqcha qadamlar sezilmaydi
    const dum = tier === 0 ? randInt(1, 2, rng) : 1;
    if (tier === 0) {
      const [a, b] = ikkiXil(2, Math.min(6, chek(d1)), rng);
      uzunA = [a];
      uzunB = [b];
    } else {
      const n = tier === 1 ? 2 : 3;
      uzunA = [];
      uzunB = [];
      for (let i = 0; i < n; i++) {
        const [a, b] = ikkiXil(2, Math.min(i === 0 ? 5 : 4, chek(yonlar[i])), rng);
        uzunA.push(a);
        uzunB.push(b);
      }
    }
    const level = tosiqLevel(yonlar, uzunA, uzunB, dum, tier);
    if (!yaroqli(level.maydonlar, level.yechim)) return null;
    level.bloklar = aralash(level.bloklar, rng).concat(["takror", "toki"]);
    if (rng() < 0.5) level.maydonlar.reverse();
    return level;
  }

  // ---------- Zinapoya (2- va 3-bosqich) ----------
  // pogonalar: [[en, balandlik], ...] — d1 tomonga "en" qadam, d2 tomonga "balandlik" qadam
  const zinaMaydon = (d1, d2, pogonalar) => yolMaydon(pogonalar.flatMap(([en, bal]) => [[d1, en], [d2, bal]]));
  const zinaKalit = (p) => p.map(([e, b]) => e + "x" + b).join(".");

  // 2-bosqich: har maydonda bir xil pog'onalar, lekin eni/balandligi va soni maydonlarda boshqacha
  function gulxanLevel(d1, d2, pA, pB) {
    const yechim = [gulxangacha([agar(d1, [yur(d1)], [yur(d2)])])];
    return {
      id: `gulxan:${d1}${d2}:${zinaKalit(pA)}-${zinaKalit(pB)}`,
      matn: "Ikki zinapoya: pogʻonalari va soni har xil. Robot gulxanga yetguncha takrorlasin.",
      maydonlar: [zinaMaydon(d1, d2, pA), zinaMaydon(d1, d2, pB)],
      bloklar: [d1, d2, "agar", "toki", "gulxangacha"],
      yechim,
      maxBlok: B.soni(yechim) + 1,
      maslahat: MASLAHAT.gulxan,
    };
  }

  function yasaGulxan(rng, tier) {
    const d1 = pick(B.YONLAR, rng);
    const d2 = pick(tik(d1), rng);
    const bitta = () => {
      const en = randInt(1, 3, rng);
      const bal = tier === 0 ? 1 : randInt(1, 2, rng);
      const n = tier === 2 ? randInt(3, 4, rng) : randInt(2, tier === 0 ? 3 : 4, rng);
      return Array.from({ length: n }, () => [en, bal]);
    };
    const pA = bitta();
    const pB = bitta();
    if (zinaKalit(pA) === zinaKalit(pB)) return null;
    // tier 2: zinapoya uzunroq — kamida bitta maydonda 8+ qadam
    if (tier === 2 && Math.max(...[pA, pB].map((p) => p.reduce((s, [e, b]) => s + e + b, 0))) < 8) return null;
    const level = gulxanLevel(d1, d2, pA, pB);
    if (!yaroqli(level.maydonlar, level.yechim)) return null;
    level.bloklar = aralash([d1, d2], rng).concat(["agar", "toki", "gulxangacha"]);
    return level;
  }

  // 3-bosqich: gulxangacha ichida toki — har pog'ona eni boshqacha
  function birgaLevel(d1, d2, pA, pB) {
    const yechim = [gulxangacha([tokiYur(d1), yur(d2)])];
    return {
      id: `birga:${d1}${d2}:${zinaKalit(pA)}-${zinaKalit(pB)}`,
      matn: "Pogʻonalar eni har xil. Bitta dastur ikkala zinapoyada ham ishlasin.",
      maydonlar: [zinaMaydon(d1, d2, pA), zinaMaydon(d1, d2, pB)],
      bloklar: [d1, d2, "toki", "gulxangacha"],
      yechim,
      maxBlok: B.soni(yechim) + 1,
      maslahat: MASLAHAT.birga,
    };
  }

  function yasaBirga(rng, tier) {
    const d1 = pick(B.YONLAR, rng);
    const d2 = pick(tik(d1), rng);
    const bitta = () => {
      const n = tier === 0 ? 2 : tier === 1 ? randInt(2, 3, rng) : 3;
      // Har pog'ona eni boshqa: 1..4 dan n tasi aralash tartibda
      return aralash([1, 2, 3, 4], rng).slice(0, n).map((en) => [en, tier === 2 ? randInt(1, 2, rng) : 1]);
    };
    const pA = bitta();
    const pB = bitta();
    if (zinaKalit(pA) === zinaKalit(pB)) return null;
    const level = birgaLevel(d1, d2, pA, pB);
    if (!yaroqli(level.maydonlar, level.yechim)) return null;
    level.bloklar = aralash([d1, d2], rng).concat(["toki", "gulxangacha"]);
    return level;
  }

  const YASOVCHI = { tosiq: yasaTosiq, gulxan: yasaGulxan, birga: yasaBirga };

  // ---------- Ko'rsatuv uchun qotirilgan namunalar ----------
  const KORSATUV = {
    // 3 va 5 katakli yo'lak, burilib bitta qadam: "takror 3 [→]" birinchisida ishlaydi, ikkinchisida yo'q
    tosiq: tosiqLevel(["right", "down"], [3], [5], 1, 0),
    // 2×1 pog'ona ikki marta (6 qadam) va 1×1 pog'ona to'rt marta (8 qadam)
    gulxan: gulxanLevel("right", "down", [[2, 1], [2, 1]], [[1, 1], [1, 1], [1, 1], [1, 1]]),
    birga: birgaLevel("right", "down", [[1, 1], [3, 1]], [[2, 1], [1, 1], [3, 1]]),
  };
  KORSATUV.tosiq.sodda = [B.takror(3, [yur("right")]), yur("down")];
  // takror soni birinchi maydonning qadamlariga teng — ikkinchisida gulxanga yetmay to'xtaydi
  KORSATUV.gulxan.sodda = [B.takror(6, [agar("right", [yur("right")], [yur("down")])])];

  // Yangi vazifa: oldingisining aynan o'zi emas (QOIDALAR 4.3). tier — qiyinlik zinasi (0 / 1 / 2).
  function yasa(bosqich, prev, rng, tier) {
    rng = rng || Math.random;
    tier = tier || 0;
    for (let k = 0; k < 500; k++) {
      const level = YASOVCHI[bosqich](rng, tier);
      if (level && (!prev || prev.id !== level.id)) return level;
    }
    // Tasodif omadsiz kelsa (amalda bo'lmaydi): qotirilgan namuna yoki uning maydonlari almashgani
    const z = Object.assign({}, KORSATUV[bosqich]);
    if (prev && prev.id === z.id) {
      z.id += ":2";
      z.maydonlar = z.maydonlar.slice().reverse();
    }
    return z;
  }

  const api = { MAX_W, MAX_H, MASLAHAT, KORSATUV, yolMaydon, zinaMaydon, qotirilganYolYoq, yaroqli, yasa };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
