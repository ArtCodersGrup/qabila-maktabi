// 45-o'yin: Dirixle printsipi (kaptarxona qoidasi) — sof mantiq.
// Blokning oxirgi o'yini: sanash o'rniga ISBOT.
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const S = (root.QK && root.QK.sanash) || require("../../umumiy/js/sanash.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  function pickNew(make, prev, r) {
    for (let k = 0; k < 40; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  // Qiyinlik zinasi (QOIDALAR 4.3): 0 — birinchi javoblar, 1 — o'rta, 2 — oxirgi va qiyin rejim.
  // Zina berilmasa (testlar) — hammasidan teng.
  function zinadan(list, tier, rnd) {
    if (tier == null) return pick(list, rnd);
    const t = Math.max(0, Math.min(2, tier));
    const mos = list.filter((x) => (x.tier || 0) <= t);
    const ayni = mos.filter((x) => (x.tier || 0) === t);
    return ayni.length && rnd() < 0.6 ? pick(ayni, rnd) : pick(mos, rnd);
  }
  const zinali = (tier, fn) => Object.assign(fn, { tier });

  // ---------- 1-bosqich: kaptarlarni uyalarga joylash ----------
  // Bola o'zi joylaydi; har qanday joylashda ham bitta uyada 2 ta bo'lib qoladi
  const UYA = 4;
  const KAPTAR = 5;

  // Joylashuv: uyalardagi kaptarlar soni. Eng to'lasi — Dirixle javobi
  const engTola = (uyalar) => Math.max(...uyalar);
  const joyBosh = (k) => Array.from({ length: k }, () => 0);

  // n ta narsa k ta qutida: eng to'la qutida kamida shuncha bo'ladi
  const kafolat = (n, k) => S.dirixle(n, k);

  const DIRIXLE_SAVOL = [
    (r) => { const n = int(r, 13, 30); return { n, k: 12, matn: n + " ta bola bor. Kamida nechtasi bir oyda tugʻilgan?", quti: "oy" }; },
    (r) => { const n = int(r, 8, 30); return { n, k: 7, matn: n + " ta bola bor. Kamida nechtasi hafta bir kunida tugʻilgan?", quti: "hafta kuni" }; },
    (r) => { const n = int(r, 6, 24); return { n, k: 5, matn: n + " ta xat " + 5 + " ta qutiga tashlandi. Eng toʻla qutida kamida nechta xat bor?", quti: "quti" }; },
    (r) => { const n = int(r, 11, 40); return { n, k: 10, matn: n + " ta sonning oxirgi raqamiga qaraymiz. Kamida nechtasining oxirgi raqami bir xil?", quti: "raqam" }; },
    (r) => { const n = int(r, 4, 20), k = int(r, 2, 4); return { n, k, matn: n + " ta kaptar " + k + " ta uyaga qoʻndi. Eng toʻla uyada kamida nechta kaptar bor?", quti: "uya" }; },
    // ---- 2026-10-02 (zina 1–2): QUTI YASHIRIN — bola qutilar nima ekanini oʻzi topadi ----
    zinali(1, (r) => { const k = int(r, 3, 9), n = int(r, k + 1, 4 * k);
      return { n, k, matn: n + " ta butun son berilgan. Kamida nechtasining " + k + " ga boʻlgandagi qoldigʻi bir xil?", quti: "qoldiq", qutiga: "qoldiqqa",
        ishora: k + " ga boʻlganda nechta xil qoldiq chiqishi mumkin? Oʻsha qoldiqlar — qutilar." }; }),
    zinali(1, (r) => { const n = int(r, 27, 80);
      return { n, k: 26, matn: n + " ta inglizcha soʻz bor (alifboda 26 harf). Kamida nechtasi bir xil harf bilan boshlanadi?", quti: "harf", qutiga: "harfga",
        ishora: "Qutilar — alifbo harflari. Soʻzlar — kaptarlar." }; }),
    zinali(2, (r) => { const k = int(r, 3, 7), n = int(r, k + 1, 3 * k);
      return { n, k, matn: n + " ta butun son berilgan. Ularning ichida ayirmasi " + k + " ga boʻlinadigan sonlar toʻdasi bor (hammasining qoldigʻi bir xil). Bunday toʻdada kamida nechta son boʻlishi kafolatlangan?", quti: "qoldiq", qutiga: "qoldiqqa",
        ishora: "Ikki sonning ayirmasi " + k + " ga boʻlinadi — demak ularning " + k + " ga boʻlgandagi qoldigʻi bir xil. Nechta xil qoldiq bor?" }; }),
    zinali(2, (r) => { const n = int(r, 366, 1100);
      return { n, k: 365, matn: "Maktabda " + n + " ta oʻquvchi bor (yil — 365 kun). Kamida nechtasining tugʻilgan kuni bir xil?", quti: "kun", qutiga: "kunga",
        ishora: "Qutilar — yilning kunlari (365 ta). Oʻquvchilar — kaptarlar." }; }),
  ];

  function dirixleTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const s = zinadan(DIRIXLE_SAVOL, tier, rnd)(rnd);
      const javob = kafolat(s.n, s.k);
      if (javob < 2) return null; // kafolat yo'q bo'lsa savolning ma'nosi yo'q
      return { id: "dirixle:" + s.matn, tur: "dirixle", n: s.n, k: s.k, javob,
        matn: s.matn,
        hisob: s.n + " ÷ " + s.k + " → kamida " + javob,
        ishora: s.ishora,
        nega: "Har " + (s.qutiga || s.quti + "ga") + " " + (javob - 1) + " tadan boʻlsa, " + s.k * (javob - 1)
          + " ta boʻlardi. Bizda " + s.n + " ta — demak biror joyda " + javob + " ta bor." };
    }, prev, rr);
  }

  // ---------- 2-bosqich: teskari savol — kamida nechta olish kerak ----------
  // k xil tur bor; m ta bir xilini kafolatlash uchun k·(m−1)+1 ta olish kerak
  const kerak = (k, m) => k * (m - 1) + 1;

  const KERAK_SAVOL = [
    (r) => { const k = int(r, 2, 5); return { k, m: 2, matn: "Qorongʻi xonada " + k + " xil rangdagi paypoqlar aralash yotibdi. Bir xil juft chiqishi uchun kamida nechta olish kerak?" }; },
    (r) => { const k = int(r, 3, 6), m = int(r, 2, 3); return { k, m, matn: "Qutida " + k + " xil rangdagi sharlar bor. Bir xil rangdan " + m + " ta chiqishi uchun kamida nechta olish kerak?" }; },
    (r) => { const k = int(r, 4, 8); return { k, m: 2, matn: k + " xil mevadan ixtiyoriy olinadi. Ikkitasi bir xil boʻlishi uchun kamida nechta olish kerak?" }; },
    // ---- 2026-10-02 (zina 1–2): turlar soni matnda toʻgʻridan-toʻgʻri aytilmagan ----
    zinali(1, (r) => { const m = int(r, 2, 4);
      return { k: 12, m, matn: "Sinfda bir oyda tugʻilgan " + m + " ta bola albatta topilishi uchun sinfda kamida nechta bola boʻlishi kerak?" }; }),
    zinali(1, (r) => { const m = int(r, 2, 4);
      return { k: 7, m, matn: "Hafta kunlaridan birida tugʻilgan " + m + " ta bola albatta topilishi uchun kamida nechta bola kerak?" }; }),
    zinali(2, (r) => { const k = int(r, 3, 9);
      return { k, m: 2, matn: "Ayirmasi " + k + " ga boʻlinadigan ikkita son albatta topilishi uchun kamida nechta butun son olish kerak?" }; }),
    zinali(2, (r) => { const m = int(r, 3, 5);
      return { k: 4, m, matn: "Kartalar toʻplamida 4 xil belgi (mast) bor. Bir xil belgili " + m + " ta karta albatta chiqishi uchun kamida nechta karta olish kerak?" }; }),
    zinali(2, (r) => { const m = int(r, 2, 3);
      return { k: 10, m, matn: "Oxirgi raqami bir xil boʻlgan " + m + " ta son albatta topilishi uchun kamida nechta butun son olish kerak?" }; }),
  ];

  function kerakTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const s = zinadan(KERAK_SAVOL, tier, rnd)(rnd);
      const javob = kerak(s.k, s.m);
      return { id: "kerak:" + s.matn, tur: "kerak", k: s.k, m: s.m, javob, matn: s.matn,
        hisob: s.k + " × " + (s.m - 1) + " + 1 = " + javob,
        nega: "Eng yomon holatda har turdan " + (s.m - 1) + " tadan chiqadi — bu " + s.k * (s.m - 1)
          + " ta. Yana bittasi albatta takrorlanadi." };
    }, prev, rr);
  }

  // ---------- 3-bosqich: kod ----------
  // Qutilarga taqsimlash va eng to'lasini topish
  const qutiKod = (sonlar, k) => "sonlar = [" + sonlar.join(", ") + "]\nqutilar = [0] * " + k
    + "\nfor x in sonlar:\n    qutilar[x % " + k + "] += 1\nprint(qutilar)\nprint(max(qutilar))";

  function kodTask(r, prev, tier) {
    const rr = r || Math.random;
    const qoshimcha = tier == null ? 0 : Math.max(0, Math.min(2, tier)); // zina bilan sonlar koʻpayadi
    return pickNew((rnd) => {
      const k = int(rnd, 3, 5);
      const n = int(rnd, k + 2 + qoshimcha, k + 5 + qoshimcha);
      const sonlar = Array.from({ length: n }, () => int(rnd, 1, 30));
      const qutilar = joyBosh(k);
      for (const x of sonlar) qutilar[x % k] += 1;
      return { id: "kod:" + sonlar.join("-") + ":" + k, tur: "natija", type: "natija",
        code: qutiKod(sonlar, k), solution: qutiKod(sonlar, k),
        n, k, qutilar, javob: engTola(qutilar),
        kutilgan: ["[" + qutilar.join(", ") + "]", String(engTola(qutilar))],
        hisob: n + " ta son, " + k + " ta quti → eng toʻlasida " + engTola(qutilar) + " ta (kafolat: " + kafolat(n, k) + ")" };
    }, prev, rr);
  }

  const WRITE = [
    {
      id: "kafolat",
      what: "kafolat(n, k) — n ta narsa k ta qutiga joylansa, eng toʻla qutida kamida nechta boʻladi? (Boʻlishni yuqoriga yumalat: (n + k − 1) // k.)",
      solution: "def kafolat(n, k):\n    return (n + k - 1) // k",
      tail: "print(kafolat(int(input()), int(input())))",
      tests: [["13", "12"], ["25", "12"], ["4", "4"], ["100", "7"], ["1", "5"]],
    },
    {
      id: "engtola",
      what: "eng_tola(sonlar, k) — har sonni k ga boʻlgandagi qoldiq boʻyicha qutiga sol va eng toʻla qutidagi sonni qaytar.",
      solution: "def eng_tola(sonlar, k):\n    qutilar = [0] * k\n    for x in sonlar:\n        qutilar[x % k] += 1\n    return max(qutilar)",
      tail: "a = []\nfor s in input().split():\n    a.append(int(s))\nprint(eng_tola(a, int(input())))",
      tests: [["3 7 11 2 9 14 5", "5"], ["1 2 3", "3"], ["4 4 4 4", "2"]],
    },
    // ---- 2026-10-02: ikki yangi masala (zina 1–2) ----
    {
      id: "kerak", tier: 1,
      what: "kerak(k, m) — k xil tur bor. Bir xil turdan m tasi albatta chiqishi uchun kamida nechta olish kerakligini qaytar. (Eng yomon holat: har turdan m − 1 tadan chiqadi, keyin yana bitta.)",
      solution: "def kerak(k, m):\n    return k * (m - 1) + 1",
      tail: "print(kerak(int(input()), int(input())))",
      tests: [["4", "2"], ["3", "3"], ["12", "2"], ["1", "5"], ["7", "1"], ["10", "4"]],
    },
    {
      id: "juftlik-bormi", tier: 2,
      what: "bir_xil_qoldiq(sonlar, k) — roʻyxatda k ga boʻlgandagi qoldigʻi bir xil boʻlgan ikkita son boʻlsa True, aks holda False qaytar. (Qoldiqlar boʻyicha qutilarga sol va biror qutida 2 ta bor-yoʻqligini tekshir.)",
      solution: "def bir_xil_qoldiq(sonlar, k):\n    qutilar = [0] * k\n    for x in sonlar:\n        qutilar[x % k] += 1\n    return max(qutilar) >= 2",
      tail: "a = []\nfor s in input().split():\n    a.append(int(s))\nprint(bir_xil_qoldiq(a, int(input())))",
      tests: [["1 2 3", "3"], ["1 2 3 4", "3"], ["5 10", "5"], ["7", "2"], ["0 1 2 3 4 5 6", "7"], ["0 1 2 3 4 5 6 14", "7"]],
    },
  ];

  function writeTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const w = zinadan(WRITE, tier, rnd);
      return { id: "yoz:" + w.id, tur: "yoz", type: "kod-yoz", what: w.what, solution: w.solution, tail: w.tail,
        tests: w.tests.map((stdin) => ({ stdin })) };
    }, prev, rr);
  }

  // Nega isbot kerak: hamma joylashuvni sinab ko'rish — k^n ta variant
  const SINOV = [{ n: 5, k: 4 }, { n: 10, k: 5 }, { n: 20, k: 10 }].map(({ n, k }) => ({ n, k, variant: S.takrorli(k, n) }));

  const api = { UYA, KAPTAR, joyBosh, engTola, kafolat, kerak, DIRIXLE_SAVOL, KERAK_SAVOL, WRITE, SINOV,
    qutiKod, dirixleTask, kerakTask, kodTask, writeTask };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
