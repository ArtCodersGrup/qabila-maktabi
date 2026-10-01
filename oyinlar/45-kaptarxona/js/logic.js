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
  ];

  function dirixleTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const s = pick(DIRIXLE_SAVOL, rnd)(rnd);
      const javob = kafolat(s.n, s.k);
      if (javob < 2) return null; // kafolat yo'q bo'lsa savolning ma'nosi yo'q
      return { id: "dirixle:" + s.matn, tur: "dirixle", n: s.n, k: s.k, javob,
        matn: s.matn,
        hisob: s.n + " ÷ " + s.k + " → kamida " + javob,
        nega: "Har " + s.quti + "ga " + (javob - 1) + " tadan boʻlsa, " + s.k * (javob - 1)
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
  ];

  function kerakTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const s = pick(KERAK_SAVOL, rnd)(rnd);
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

  function kodTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const k = int(rnd, 3, 5);
      const n = int(rnd, k + 2, k + 5);
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
  ];

  function writeTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const w = pick(WRITE, rnd);
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
