// 53-o'yin: xato ovi — tayyor dasturdagi xatoni topish va tuzatish (sof mantiq).
// Maydon va bajarish — umumiy/js/dastur.js. Node'da test: tests/logic.test.js
(function (root) {
  "use strict";

  const D = (root.QK && root.QK.dastur) || require("../../umumiy/js/dastur.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];

  function pickNew(make, prev, r) {
    for (let k = 0; k < 2000; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return Object.assign({ tur: "top" }, VAZIFALAR.top[0]); // amalda bo'lmaydi
  }

  const maydon = (robot, goal, walls, w, h) => D.field({ w: w || 5, h: h || 5, robot, goal, walls: walls || [] });

  // Har vazifa: maydon, XATO dastur, to'g'ri dastur va xato qaysi buyruqda ekani.
  // "xatoIndeks" — birinchi noto'g'ri buyruq o'rni (0 dan).
  const VAZIFALAR = {
    top: [
      {
        id: "chekka",
        matn: "Robot gulxanga bormay, boshqa joyda toʻxtab qoldi. Qaysi buyruq xato?",
        maydon: () => maydon({ x: 0, y: 2 }, { x: 3, y: 2 }),
        dastur: ["right", "up", "right", "right"],
        togri: ["right", "right", "right"],
        xatoIndeks: 1,
        ishora: "Robot yuqoriga ketdi — lekin gulxan oʻsha qatorda edi.",
      },
      {
        id: "tosh",
        matn: "Robot toshga urildi. Qaysi buyruq xato?",
        maydon: () => maydon({ x: 0, y: 0 }, { x: 2, y: 2 }, [{ x: 1, y: 0 }]),
        dastur: ["right", "right", "down", "down"],
        togri: ["down", "down", "right", "right"],
        xatoIndeks: 0,
        ishora: "Birinchi qadamdayoq oldinda tosh bor edi.",
      },
      {
        id: "kalta",
        matn: "Robot toʻxtab qoldi — gulxanga yetmadi. Qaysi joyda buyruq yetishmaydi?",
        maydon: () => maydon({ x: 0, y: 1 }, { x: 3, y: 1 }),
        dastur: ["right", "right"],
        togri: ["right", "right", "right"],
        xatoIndeks: 2,
        ishora: "Buyruqlar tugadi, lekin yoʻl tugamadi.",
      },
    ],
    tuzat: [
      {
        id: "burilish",
        matn: "Dasturni tuzat: robot gulxanga yetsin.",
        maydon: () => maydon({ x: 0, y: 0 }, { x: 2, y: 2 }),
        dastur: ["right", "right", "up", "up"],
        togri: ["right", "right", "down", "down"],
        xatoIndeks: 2,
        ishora: "Gulxan pastda — yuqoriga emas, pastga yurish kerak.",
      },
      {
        id: "ortiqcha",
        matn: "Dastur ishlaydi, lekin ortiqcha qadamlar bor. Qisqaroq yoz.",
        maydon: () => maydon({ x: 1, y: 1 }, { x: 3, y: 1 }),
        dastur: ["up", "right", "down", "right"],
        togri: ["right", "right"],
        xatoIndeks: 0,
        qisqa: true,
        ishora: "Gulxan oʻsha qatorda — yuqoriga chiqib, qaytib tushish shart emas.",
      },
      {
        id: "aylanma",
        matn: "Toshni aylanib oʻtish kerak. Dasturni tuzat.",
        maydon: () => maydon({ x: 0, y: 2 }, { x: 2, y: 2 }, [{ x: 1, y: 2 }]),
        dastur: ["right", "right"],
        togri: ["up", "right", "right", "down"],
        xatoIndeks: 0,
        ishora: "Toʻgʻri yoʻlda tosh bor — tepadan yoki pastdan aylanib oʻt.",
      },
    ],
  };

  // Dasturning natijasi: "goal" — yetdi, "wall"/"edge" — urildi, "end" — buyruq tugadi
  const natija = (f, dastur) => D.run(f, dastur);
  const togrimi = (f, dastur) => D.run(f, dastur).status === "goal";

  // Qaysi buyruqda to'xtadi (xato indeksi) — "end" bo'lsa dastur oxiri
  function xatoJoyi(f, dastur) {
    const r = D.run(f, dastur);
    if (r.status === "goal") return -1;
    return r.status === "end" ? dastur.length : r.used;
  }

  // Bolaning dasturi: yetdimi va (kerak bo'lsa) qisqami
  const XATO_MATNI = {
    wall: "Toshga urildi.",
    edge: "Maydon chekkasiga urildi.",
    end: "Buyruqlar tugadi, gulxanga yetmadi.",
  };

  function tekshir(v, f, dastur) {
    const r = D.run(f, dastur);
    if (r.status !== "goal") return { ok: false, sabab: XATO_MATNI[r.status] || "Gulxanga yetmadi." };
    if (v.qisqa) {
      const eng = D.solve(f).length;
      if (dastur.length > eng) {
        return { ok: false, sabab: "Gulxanga yetdi, lekin ortiqcha qadam bor: " + eng + " ta buyruq yetarli." };
      }
    }
    return { ok: true };
  }

  // ---------- Vazifa generatori (2026-10-02): tasodifiy maydon + eng qisqa yo'l + bitta buyruqni buzish ----------
  // Avval 3 + 3 ta qotirilgan vazifa bor edi — qayta o'ynaganda aynan o'shalar chiqardi.
  const TESKARI = { right: "left", left: "right", up: "down", down: "up" };
  const oq = (dir) => D.DIRS[dir].arrow;
  // Maydon chegaralari tier bo'yicha (QOIDALAR 4.3): yo'l uzayadi, toshlar ko'payadi
  const MAYDON = [
    { walls: 1, min: 3, max: 4, needTurn: true },
    { walls: 2, min: 4, max: 5, needTurn: true },
    { walls: 3, min: 5, max: 7, needTurn: true },
  ];
  const BUZISH = ["almashtir", "qosh", "ochir"];
  const UZUNLIK = 8; // dastur ro'yxatiga sig'adigan eng ko'p buyruq

  // To'g'ri dasturni buzish. joy — xato turgan o'rin (ochir da — dastur oxiri, "+" katagi)
  function buz(togri, tur, r) {
    const dastur = togri.slice();
    if (tur === "ochir") {
      const olingan = dastur.pop();
      return { dastur, joy: dastur.length, izoh: "Oxirida " + oq(olingan) + " yetishmaydi." };
    }
    if (tur === "qosh") {
      const joy = Math.floor(r() * (dastur.length + 1));
      const ortiqcha = pick(D.ORDER, r);
      dastur.splice(joy, 0, ortiqcha);
      return { dastur, joy, izoh: (joy + 1) + "-buyruq ortiqcha: " + oq(ortiqcha) + " kerak emas." };
    }
    const joy = Math.floor(r() * dastur.length);
    const yomon = pick(D.ORDER.filter((d) => d !== dastur[joy]), r);
    const izoh = (joy + 1) + "-buyruq xato: " + oq(yomon) + " emas, " + oq(dastur[joy]) + " kerak.";
    dastur[joy] = yomon;
    return { dastur, joy, izoh };
  }

  // Bitta tahrir bilan tuzatsa bo'ladigan o'rinlar: buyruqni almashtirish yoki o'chirish (0…n−1),
  // oxiriga bitta buyruq qo'shish (n). "Xatoni top" savolida bu to'plam aynan bitta o'rin bo'lishi shart.
  function tuzatishJoylari(f, dastur) {
    const joylar = new Set();
    for (let j = 0; j < dastur.length; j++) {
      const ochirilgan = dastur.slice(0, j).concat(dastur.slice(j + 1));
      if (togrimi(f, ochirilgan)) joylar.add(j);
      for (const d of D.ORDER) {
        if (d === dastur[j]) continue;
        const nusxa = dastur.slice();
        nusxa[j] = d;
        if (togrimi(f, nusxa)) joylar.add(j);
      }
    }
    for (const d of D.ORDER) if (togrimi(f, dastur.concat([d]))) joylar.add(dastur.length);
    return [...joylar].sort((x, y) => x - y);
  }

  const TOP_MATN = {
    wall: "Robot toshga urildi. Qaysi buyruq xato?",
    edge: "Robot maydon chekkasiga urildi. Qaysi buyruq xato?",
    end: "Robot gulxanga yetmay toʻxtab qoldi. Qaysi buyruq xato — yoki oxirida buyruq yetishmaydimi?",
  };
  const TOP_ISHORA = "«Yurgizib koʻr»ni bos va robotni kuzat: u qaysi buyruqdan boshlab toʻgʻri yoʻldan chiqdi?";

  // 1-bosqich: xato buyruqni top. Xato o'rni yagona (boshqa buyruqni o'zgartirib tuzatib bo'lmaydi).
  function yasaTop(rnd, tier) {
    const f = D.randomField(MAYDON[tier], null, rnd);
    const togri = D.solve(f);
    const b = buz(togri, pick(BUZISH, rnd), rnd);
    // Kamida 3 buyruq + "+" katagi = kamida 4 variant (QOIDALAR 4.3)
    if (togrimi(f, b.dastur) || b.dastur.length > UZUNLIK || b.dastur.length < 3) return null;
    const joylar = tuzatishJoylari(f, b.dastur);
    if (joylar.length !== 1 || joylar[0] !== b.joy) return null;
    return {
      id: "top:" + f.id + ":" + b.dastur.join(","), tur: "top", yasama: true,
      matn: TOP_MATN[D.run(f, b.dastur).status], maydon: () => f,
      dastur: b.dastur, togri, xatoIndeks: b.joy, ishora: TOP_ISHORA, izoh: b.izoh,
    };
  }

  // Ortiqcha qadam: yo'l ustida "borib-qaytish" (dastur ishlaydi, lekin 2 buyruq uzun)
  function ortiqchaQosh(f, togri, rnd) {
    for (let k = 0; k < 20; k++) {
      const joy = Math.floor(rnd() * togri.length);
      const yon = pick(D.ORDER, rnd);
      const dastur = togri.slice(0, joy).concat([yon, TESKARI[yon]], togri.slice(joy));
      if (dastur.length <= UZUNLIK && D.run(f, dastur).status === "goal" && D.run(f, dastur).used === dastur.length) return dastur;
    }
    return null;
  }

  // 2-bosqich: dasturni tuzat. tier 0 — bitta xato; tier 1 — bitta xato yoki ortiqcha qadam;
  // tier 2 — ikkita xato va eng qisqa dastur talab qilinadi (qisqa).
  function yasaTuzat(rnd, tier) {
    const f = D.randomField(MAYDON[tier], null, rnd);
    const togri = D.solve(f);
    if (tier > 0 && rnd() < 0.3) {
      const dastur = ortiqchaQosh(f, togri, rnd);
      if (!dastur) return null;
      return {
        id: "tuzat:" + f.id + ":" + dastur.join(","), tur: "tuzat", yasama: true, qisqa: true,
        matn: "Dastur ishlaydi, lekin ortiqcha qadamlar bor. Qisqaroq yoz.", maydon: () => f,
        dastur, togri, xatoIndeks: 0,
        ishora: "Eng qisqa yoʻlda nechta buyruq borligini sanab koʻr — borib-qaytish kerak emas.",
      };
    }
    let dastur = buz(togri, pick(BUZISH, rnd), rnd).dastur;
    if (tier === 2) dastur = buz(dastur, pick(["almashtir", "qosh"], rnd), rnd).dastur;
    if (togrimi(f, dastur) || dastur.length > UZUNLIK || dastur.length < 2) return null;
    // tier 2: haqiqatan ikkita xato — bitta tahrir bilan tuzatib bo'lmaydi
    if (tier === 2 && tuzatishJoylari(f, dastur).length) return null;
    return {
      id: "tuzat:" + f.id + ":" + dastur.join(","), tur: "tuzat", yasama: true, qisqa: tier === 2,
      matn: tier === 2 ? "Dasturda ikkita xato bor. Tuzat — eng qisqa yoʻl bilan." : "Dasturda xato bor. Tuzat: robot gulxanga yetsin.",
      maydon: () => f, dastur, togri, xatoIndeks: xatoJoyi(f, dastur),
      ishora: "Ishga tushirib koʻr: robot qayerda adashdi? Oʻsha buyruqdan boshlab qayta yoz.",
    };
  }

  // "Tuzat" da tier 0 da qo'lda yozilgan namunalar ham aralashadi (har uchinchi vazifa atrofida).
  // "Top" da faqat yasalgan vazifalar: qo'lda yozilganlarida xato o'rni yagona emas
  // (masalan ➡ ⬆ ➡ ➡ ni oxiriga ⬇ qo'shib ham tuzatsa bo'ladi) yoki variantlar 4 tadan kam.
  function vazifa(tur, yasash, r, prev, tier) {
    const rr = r || Math.random;
    const t = tier || 0;
    return pickNew((rnd) => (tur === "tuzat" && t === 0 && rnd() < 0.3
      ? Object.assign({ tur }, pick(VAZIFALAR[tur], rnd))
      : yasash(rnd, t)), prev, rr);
  }
  const topTask = (r, prev, tier) => vazifa("top", yasaTop, r, prev, tier);
  const tuzatTask = (r, prev, tier) => vazifa("tuzat", yasaTuzat, r, prev, tier);

  const api = { VAZIFALAR, XATO_MATNI, MAYDON, BUZISH, UZUNLIK, maydon, natija, togrimi, xatoJoyi, tekshir,
    buz, tuzatishJoylari, ortiqchaQosh, yasaTop, yasaTuzat, topTask, tuzatTask };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
