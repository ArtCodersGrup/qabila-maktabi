// 62-o'yin «Oʻz buyrugʻim»: funksiya — ★ (va ●) buyrug'ini yasash va chaqirish (sof mantiq).
// Bloklar, bajarish va sanash umumiy dvigateldan: umumiy/js/blok.js
// Node'da test qilinadi: tests/logic.test.js
//
// Vazifa: tor yo'l (B.torYol) — bir xil bo'lak (naqsh) yo'lda bir necha marta keladi, oraliqlari har xil.
// Shuning uchun faqat o'q + takror bilan blok chegarasiga sig'maydi (B.ixchamNarx > maxBlok) — ★ kerak.
(function (root) {
  "use strict";

  const B = (root.QK && root.QK.blok) || require("../../umumiy/js/blok.js");

  const W_MAX = 8;
  const H_MAX = 6;
  const TAKROR_MAX = 9; // quruvchidagi takror soni 2..9

  // ---------- Naqshlar katalogi (oldinga — o'ngga; keyin 8 ta burilish/ko'zgu bilan) ----------
  // Do'nglik: yon tomonga chiqib, qaytib tushadi (oraliq faqat oldinga). Tepasi kamida 2 katak (↑↑→↓↓ da yorliq bo'ladi). Zina: ikki tomonga (oraliq ikkalasidan biri).
  const DONGLIK = [
    ["up", "right", "down"],
    ["up", "right", "right", "down"],
    ["right", "up", "right", "down"],
    ["up", "right", "down", "right"],
    ["up", "up", "right", "right", "down", "down"],
  ];
  const ZINA = [
    ["right", "down"],
    ["right", "right", "down"],
    ["right", "down", "right"],
    ["down", "right", "right"],
    ["right", "down", "down"],
    ["right", "right", "down", "down"],
    ["right", "down", "right", "right"],
    ["right", "right", "down", "right", "down"],
    ["right", "down", "down", "right", "down"],
    ["down", "right", "right", "down", "right"],
  ];

  // Yo'nalishlarni almashtirish: burish (soat yo'nalishida) va ko'zgu
  const BURISH = { right: "down", down: "left", left: "up", up: "right" };
  const KOZGU = { right: "left", left: "right", up: "up", down: "down" };
  const SIMMETRIYA = [];
  for (let k = 0; k < 4; k++) {
    for (const oyna of [false, true]) {
      SIMMETRIYA.push((yon) => {
        let y = oyna ? KOZGU[yon] : yon;
        for (let r = 0; r < k; r++) y = BURISH[y];
        return y;
      });
    }
  }

  // Naqshning o'zi davriy bo'lmasin (→↓→↓ = takror 2 [→↓]) — aks holda ★ shart emas
  const davriymi = (s) => {
    for (let p = 1; p <= s.length / 2; p++) {
      if (s.length % p) continue;
      if (s.every((x, i) => x === s[i % p])) return true;
    }
    return false;
  };

  // Oraliq qaysi tomonga: naqshda bor, teskarisi yo'q yo'nalish (do'nglikda — faqat oldinga)
  const oraliqYonlari = (naqsh) => B.YONLAR.filter((y) => naqsh.includes(y) && !naqsh.includes(B.TESKARI[y]));

  // ---------- Asosiy dasturni ixchamlash (takror bilan) ----------
  // Tokenlar: yo'nalish ("right"…) yoki chaqiruv ("@yulduz"). B.ixchamNarx kabi DP, lekin dasturning o'zini qaytaradi.
  // Teng narxda takrorsiz variant tanlanadi.
  function ixcham(tokenlar) {
    const n = tokenlar.length;
    if (!n) return [];
    const narx = Array.from({ length: n }, () => new Array(n + 1).fill(0));
    const tanlov = Array.from({ length: n }, () => new Array(n + 1).fill(null));
    const davriy = (i, j, p) => {
      for (let k = i + p; k < j; k++) if (tokenlar[k] !== tokenlar[k - p]) return false;
      return true;
    };
    for (let len = 1; len <= n; len++) {
      for (let i = 0; i + len <= n; i++) {
        const j = i + len;
        if (len === 1) { narx[i][j] = 1; continue; }
        let best = Infinity;
        let t = null;
        for (let k = i + 1; k < j; k++) {
          const c = narx[i][k] + narx[k][j];
          if (c < best) { best = c; t = { bol: k }; }
        }
        for (let p = 1; p <= len / 2; p++) {
          if (len % p || len / p > TAKROR_MAX) continue;
          if (davriy(i, j, p) && 1 + narx[i][i + p] < best) { best = 1 + narx[i][i + p]; t = { davr: p }; }
        }
        narx[i][j] = best;
        tanlov[i][j] = t;
      }
    }
    const blok = (tok) => (tok[0] === "@" ? B.chaqir(tok.slice(1)) : B.yur(tok));
    function tikla(i, j) {
      if (j - i === 1) return [blok(tokenlar[i])];
      const t = tanlov[i][j];
      if (t.bol) return tikla(i, t.bol).concat(tikla(t.bol, j));
      return [B.takror((j - i) / t.davr, tikla(i, i + t.davr))];
    }
    return tikla(0, n);
  }

  // Sodda yozuv: chaqiruvlar ketma-ket, oraliq 1 — bitta o'q, 2–3 — takror (oraliq takrori)
  function sodda(tartib, oraliqlar, d) {
    const out = [];
    const oraliq = (g) => {
      if (g === 1) out.push(B.yur(d));
      else if (g >= 2) out.push(B.takror(g, [B.yur(d)]));
    };
    oraliq(oraliqlar[0]);
    tartib.forEach((nom, i) => {
      out.push(B.chaqir(nom));
      oraliq(oraliqlar[i + 1]);
    });
    return out;
  }

  // Tez tekshiruv (torYol dan oldin): yo'l o'zini kesmaydi va 8×6 ga sig'adi
  function sigadimi(yurishlar) {
    const k = B.iz(yurishlar);
    if (new Set(k.map((c) => c.x + "," + c.y)).size !== k.length) return false;
    const xs = k.map((c) => c.x);
    const ys = k.map((c) => c.y);
    return Math.max(...xs) - Math.min(...xs) < W_MAX && Math.max(...ys) - Math.min(...ys) < H_MAX;
  }

  const MATN = {
    tayyor: "★ tayyor. Yoʻlni ★ va oʻqlar bilan yoz.",
    yasa: "Yoʻldagi bir xil boʻlakni top va ★ ichiga yigʻ.",
    ikki: "Yoʻlda ikki xil boʻlak bor: biri ★ ichiga, biri ● ichiga.",
  };
  const MASLAHAT = {
    tayyor: "Yoʻlda ★ shakli necha marta keladi? Orasidagi qadamlarni oʻqlar bilan qoʻy.",
    yasa: "Yoʻlda bir xil boʻlak necha marta takrorlanadi? Oʻsha boʻlakni ★ ichiga yigʻ.",
    ikki: "Yoʻldagi ikki xil boʻlakni top. Birini ★ ichiga, ikkinchisini ● ichiga yigʻ.",
  };
  const PAD_TARTIB = ["left", "up", "down", "right"];

  // Naqshlar, tartib va oraliqlardan vazifa. null — shart bajarilmadi (maydon katta, yorliq bor, ★ shart emas...).
  // naqshlar: { yulduz: [...], doira?: [...] }; tartib: ["yulduz","doira",...]; oraliqlar: tartib.length + 1 ta son
  // Asosiy dasturda chaqiruvlarni takror bilan qisqartirish kerak bo'lgan vazifalar chiqarilmaydi (yechim — sodda yozuv).
  function qur(bosqich, naqshlar, tartib, oraliqlar, d) {
    const yurishlar = [];
    const tokenlar = [];
    const oraliq = (g) => {
      for (let k = 0; k < g; k++) { yurishlar.push(d); tokenlar.push(d); }
    };
    oraliq(oraliqlar[0]);
    tartib.forEach((nom, i) => {
      yurishlar.push(...naqshlar[nom]);
      tokenlar.push("@" + nom);
      oraliq(oraliqlar[i + 1]);
    });
    if (!sigadimi(yurishlar)) return null;
    const f = B.torYol(yurishlar);
    if (!f || f.w > W_MAX || f.h > H_MAX) return null;

    const oddiy = sodda(tartib, oraliqlar, d);
    const eng = ixcham(tokenlar);
    const fn = {};
    for (const nom of Object.keys(naqshlar)) fn[nom] = naqshlar[nom].map((y) => B.yur(y));
    const oddiyNarx = B.soni(oddiy, fn);
    const engNarx = B.soni(eng, fn);
    if (engNarx < oddiyNarx) return null;
    const yechim = oddiy;
    const maxBlok = B.soni(yechim, fn);
    // Qulf: funksiyasiz (faqat o'q + takror) sig'maydi
    if (B.ixchamNarx(yurishlar) <= maxBlok) return null;

    const turlar = new Set(yurishlar);
    const bloklar = PAD_TARTIB.filter((y) => turlar.has(y)).concat("takror", Object.keys(naqshlar));
    const level = {
      id: [bosqich, d, ...Object.keys(naqshlar).map((nom) => naqshlar[nom].map((y) => y[0]).join("")),
        tartib.map((nom) => nom[0]).join(""), oraliqlar.join("")].join(":"),
      matn: MATN[bosqich],
      maslahat: MASLAHAT[bosqich],
      maydonlar: [f],
      bloklar,
      maxBlok,
      yechim,
      yurishlar,
      naqshlar,
      tartib,
      oraliqlar,
    };
    if (bosqich === "tayyor") {
      level.fn = B.nusxa(fn);
      level.qulf = ["yulduz"];
    } else {
      level.fn = {};
      for (const nom of Object.keys(naqshlar)) level.fn[nom] = [];
      level.yechimFn = fn;
    }
    return level;
  }

  // ---------- Generator ----------
  // 8×6 maydon juda tor: tasodifiy oraliqlarning ko'pchiligida yo'l sig'maydi yoki ★ foyda bermaydi.
  // Shuning uchun naqsh (va yo'nalish) tasodifiy tanlanadi, uning uchun MOS oraliqlar to'liq sanab chiqiladi
  // (bir marta, keshda saqlanadi) va ulardan biri tasodifiy olinadi.
  const KESH = new Map();
  function moslar(kalit, sanash) {
    if (!KESH.has(kalit)) KESH.set(kalit, sanash());
    return KESH.get(kalit);
  }
  // n ta oraliq, har biri 0..max, kamida ikkitasi har xil
  function hammaOraliq(n, max) {
    const out = [];
    const asos = max + 1;
    for (let m = 0; m < asos ** n; m++) {
      const o = [];
      let x = m;
      for (let i = 0; i < n; i++) { o.push(x % asos); x = Math.floor(x / asos); }
      if (harXilmi(o)) out.push(o);
    }
    return out;
  }
  const harXilmi = (oraliqlar) => new Set(oraliqlar).size >= 2;

  const tasodifNaqsh = (rng, uzunlik) => {
    const list = DONGLIK.concat(ZINA).filter((s) => uzunlik.includes(s.length));
    const naqsh = B.pick(list, rng).map(B.pick(SIMMETRIYA, rng));
    return davriymi(naqsh) ? null : naqsh;
  };

  // 1–2-bosqich: bitta naqsh k marta. tier 0: k = 2; tier 1–2: k = 3 tez-tez (8×6 ga k = 4 sig'maydi — DIZAYN.md).
  function yasaBitta(bosqich, rng, tier) {
    const k = tier === 0 ? 2 : rng() < (tier === 1 ? 0.5 : 0.75) ? 3 : 2;
    // k = 3 da faqat 3 qadamli zina sig'adi; k = 2 da tier 0 — qisqa naqsh, keyin uzunroq
    const uzunlik = k === 3 ? [3] : tier === 0 ? [3, 4] : [4, 5, 6];
    for (let urinish = 0; urinish < 80; urinish++) {
      const naqsh = tasodifNaqsh(rng, uzunlik);
      if (!naqsh) continue;
      const yonlar = oraliqYonlari(naqsh);
      if (!yonlar.length) continue;
      const d = B.pick(yonlar, rng);
      const tartib = Array(k).fill("yulduz");
      const list = moslar(`1|${naqsh.join()}|${d}|${k}`,
        () => hammaOraliq(k + 1, 3).filter((o) => qur("yasa", { yulduz: naqsh }, tartib, o, d)));
      if (list.length) return qur(bosqich, { yulduz: naqsh }, tartib, B.pick(list, rng), d);
    }
    return null;
  }

  // 3-bosqich: ikki naqsh aralash, har biri kamida 2 marta. Juftlar oldindan qidirib topilgan
  // (oraliq o'ngga; ishlaganda 8 simmetriyadan biri qo'llanadi). Harflar: r — o'ng, l — chap, u — yuqori, d — past.
  const JUFTLAR = [
    "urrd|ru:YDDY", "urrd|dr:YDDY,YDYD", "urrd|ddr:YDDY,YDYD", "urrd|ruu:YDDY",
    "drru|rd:YDDY", "drru|ur:YDDY,YDYD", "drru|uur:YDDY,YDYD", "drru|rdd:YDDY",
    "uurrdd|ru:YDDY", "uurrdd|dr:YDDY,YDYD", "ddrruu|rd:YDDY", "ddrruu|ur:YDDY,YDYD",
    "rd|drru:YDYD,DYYD", "rd|ddrruu:YDYD,DYYD", "rd|rru:YDYD", "rd|uur:DYDYY",
    "rd|ruu:YDYD", "rd|rruu:YDYD,DYYD", "ru|urrd:YDYD,DYYD", "ru|uurrdd:YDYD,DYYD",
    "ru|rrd:YDYD", "ru|ddr:DYDYY", "ru|rdd:YDYD", "ru|rrdd:YDYD,DYYD",
    "ur|drru:DYYD", "ur|ddrruu:DYYD", "ur|ddr:YDYD", "ur|rdr:YDYD",
    "ur|rdd:YDYD,YYDYD,YDYYD,YDDYD,YDYDD", "ur|ddrr:DYYD", "dr|urrd:DYYD", "dr|uurrdd:DYYD",
    "dr|uur:YDYD", "dr|rur:YDYD", "dr|ruu:YDYD,YYDYD,YDYYD,YDDYD,YDYDD", "dr|uurr:DYYD",
    "uur|drru:DYYD", "uur|rd:YDYD,YYDYD,YDYYD,YDDYD,YDYDD", "uur|dr:YDYD", "uur|ddr:YDYD",
    "uur|rdr:YDYD", "uur|rdd:YDYD,YYDYD,YDYYD,YDDYD,YDYDD", "uur|ddrr:DYYD", "ddr|urrd:DYYD",
    "ddr|ru:YDYD,YYDYD,YDYYD,YDDYD,YDYDD", "ddr|ur:YDYD", "ddr|uur:YDYD", "ddr|rur:YDYD",
    "ddr|ruu:YDYD,YYDYD,YDYYD,YDDYD,YDYDD", "ddr|uurr:DYYD", "rdr|ru:YDYD", "rdr|ruu:YDYD",
    "rur|rd:YDYD", "rur|rdd:YDYD", "drr|ur:YDYD", "drr|uur:YDYD",
    "urr|dr:YDYD", "urr|ddr:YDYD", "ruu|urrd:YDYD,DYYD", "ruu|rd:YDYD",
    "ruu|dr:DYDYY", "ruu|rrd:YDYD", "ruu|ddr:DYDYY", "ruu|rdd:YDYD",
    "ruu|rrdd:YDYD,DYYD", "rdd|drru:YDYD,DYYD", "rdd|ru:YDYD", "rdd|ur:DYDYY",
    "rdd|rru:YDYD", "rdd|uur:DYDYY", "rdd|ruu:YDYD", "rdd|rruu:YDYD,DYYD",
    "rrdd|ru:YDDY", "rrdd|ruu:YDDY", "rruu|rd:YDDY", "rruu|rdd:YDDY",
    "uurr|dr:YDDY,YDYD", "uurr|ddr:YDDY,YDYD", "ddrr|ur:YDDY,YDYD", "ddrr|uur:YDDY,YDYD",
  ];
  const HARF = { r: "right", l: "left", u: "up", d: "down" };
  // Tartib: Y — ★, D — ●. tier 0 — 4 chaqiruv, tier 1 — 4 yoki 5, tier 2 — 5 chaqiruv (agar juft uchun bor bo'lsa)
  const JUFT5 = JUFTLAR.filter((j) => /[YD]{5}/.test(j));
  function yasaIkki(rng, tier) {
    for (let urinish = 0; urinish < 80; urinish++) {
      // 5 chaqiruvli shakl faqat ayrim juftlarda sig'adi: tier 2 — doim, tier 1 — yarmida shulardan
      const uzun = tier === 2 || (tier === 1 && rng() < 0.5);
      const [juft, shakllar] = B.pick(uzun ? JUFT5 : JUFTLAR, rng).split(":");
      const mos = shakllar.split(",").filter((s) => s.length === (uzun ? 5 : 4));
      if (!mos.length) continue;
      const shakl = B.pick(mos, rng);
      const [ka, kb] = juft.split("|");
      const sim = B.pick(SIMMETRIYA, rng);
      const naqshlar = { yulduz: [...ka].map((c) => sim(HARF[c])), doira: [...kb].map((c) => sim(HARF[c])) };
      const d = sim("right");
      const tartib = [...shakl].map((c) => (c === "Y" ? "yulduz" : "doira"));
      const list = moslar(`3|${naqshlar.yulduz.join()}|${naqshlar.doira.join()}|${d}|${shakl}`,
        () => hammaOraliq(tartib.length + 1, 3).filter((o) => qur("ikki", naqshlar, tartib, o, d)));
      if (list.length) return qur("ikki", naqshlar, tartib, B.pick(list, rng), d);
    }
    return null;
  }

  const YASOVCHI = {
    tayyor: (rng, tier) => yasaBitta("tayyor", rng, tier),
    yasa: (rng, tier) => yasaBitta("yasa", rng, tier),
    ikki: yasaIkki,
  };

  // Zaxira: tasodif omadsiz kelsa (amalda bo'lmaydi). Qat'iy urug' bilan yasaladi.
  function urugli(seed) {
    let s = seed;
    return () => {
      s = (s * 1103515245 + 12345) % 2147483648;
      return s / 2147483648;
    };
  }
  const zaxira = {};
  function zaxiraOl(bosqich) {
    if (!zaxira[bosqich]) {
      const rng = urugli(62 + bosqich.length);
      const list = [];
      for (let k = 0; k < 200 && list.length < 2; k++) {
        const l = YASOVCHI[bosqich](rng, 0);
        if (l && !list.some((x) => x.id === l.id)) list.push(l);
      }
      zaxira[bosqich] = list;
    }
    return zaxira[bosqich];
  }

  // Yangi vazifa: oldingisining aynan o'zi emas (QOIDALAR 4.3). tier — qiyinlik zinasi (0 / 1 / 2).
  function yasa(bosqich, prev, rng, tier) {
    rng = rng || Math.random;
    tier = tier || 0;
    for (let k = 0; k < 500; k++) {
      const level = YASOVCHI[bosqich](rng, tier);
      if (level && (!prev || (prev.id !== level.id && prev.maydonlar[0].id !== level.maydonlar[0].id))) return level;
    }
    const list = zaxiraOl(bosqich);
    return list.find((l) => !prev || l.id !== prev.id) || list[0];
  }

  // ---------- Ko'rsatuv uchun qotirilgan vazifalar ----------
  const KORSATUV = {
    // ★ = ↑→→↓ ikki marta, oraliqlar 1, 2, 0: o'qlar bilan 11 blok, ★ bilan 9 — faqat ★ bilan sig'adi
    tayyor: qur("tayyor", { yulduz: ["up", "right", "right", "down"] }, ["yulduz", "yulduz"], [1, 2, 0], "right"),
    // ★ = ↓↓→ (pastga tushish), ● = →↑↑ (yuqoriga chiqish) — arra tishlari: ★ ● ★ ●, o'rtada 2 qadam
    ikki: qur("ikki", { yulduz: ["down", "down", "right"], doira: ["right", "up", "up"] },
      ["yulduz", "doira", "yulduz", "doira"], [0, 0, 2, 0, 0], "right"),
  };

  // Faqat o'qlar bilan yozilgan dastur (ko'rsatuvda: "chegaraga sig'maydi")
  const oqlarBilan = (level) => level.yurishlar.map((y) => B.yur(y));

  const api = {
    W_MAX, H_MAX, DONGLIK, ZINA, SIMMETRIYA, JUFTLAR, MATN, MASLAHAT,
    davriymi, oraliqYonlari, ixcham, sodda, qur, yasa, KORSATUV, oqlarBilan, zaxiraOl,
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
