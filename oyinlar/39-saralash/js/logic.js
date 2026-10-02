// 39-o'yin: saralash — pufakcha va tanlash (sof mantiq).
// Qadamlarni talqinchi sanaydi (py.run().steps); o'lchovda ro'yxat bitta satrda beriladi,
// shunda faqat SARALASH qadamlari o'lchanadi (38-o'yindagi xatoni takrorlamaslik uchun).
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const py = (root.QK && root.QK.python) || require("../../umumiy/js/python/python.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  function pickNew(make, prev, r) {
    for (let k = 0; k < 40; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  // ---------- Pufakcha saralash: har qadam yozib boriladi ----------
  // Qadam: { holat, i, almashdi } — holat qiyoslashdan OLDINGI ro'yxat
  function pufakQadamlar(royxat) {
    const a = royxat.slice();
    const qadamlar = [];
    for (let oxir = a.length - 1; oxir > 0; oxir--) {
      for (let i = 0; i < oxir; i++) {
        const almashdi = a[i] > a[i + 1];
        qadamlar.push({ holat: a.slice(), i, almashdi });
        if (almashdi) {
          const t = a[i];
          a[i] = a[i + 1];
          a[i + 1] = t;
        }
      }
    }
    return { qadamlar, natija: a };
  }

  // ---------- Tanlash saralashi ----------
  // Qadam: { holat, boshi, engKichik } — har o'tishda eng kichigi topiladi va boshiga qo'yiladi
  function tanlashQadamlar(royxat) {
    const a = royxat.slice();
    const qadamlar = [];
    for (let boshi = 0; boshi < a.length - 1; boshi++) {
      let eng = boshi;
      for (let i = boshi + 1; i < a.length; i++) if (a[i] < a[eng]) eng = i;
      qadamlar.push({ holat: a.slice(), boshi, engKichik: eng, almashdi: eng !== boshi });
      if (eng !== boshi) {
        const t = a[boshi];
        a[boshi] = a[eng];
        a[eng] = t;
      }
    }
    return { qadamlar, natija: a };
  }

  // ---------- O'lchov ----------
  const literal = (list) => "a = [" + list.join(", ") + "]\n";
  // Eng yomon holat: teskari tartibdagi ro'yxat
  const teskari = (n) => {
    const out = [];
    for (let k = n; k >= 1; k--) out.push(k);
    return out;
  };

  const PUFAK_TANA = "for oxir in range(len(a) - 1, 0, -1):\n    for i in range(oxir):\n        if a[i] > a[i + 1]:\n            b = a[i]\n            a[i] = a[i + 1]\n            a[i + 1] = b\nprint(a[0], a[len(a) - 1])";
  const TANLASH_TANA = "for boshi in range(len(a) - 1):\n    eng = boshi\n    for i in range(boshi + 1, len(a)):\n        if a[i] < a[eng]:\n            eng = i\n    b = a[boshi]\n    a[boshi] = a[eng]\n    a[eng] = b\nprint(a[0], a[len(a) - 1])";

  const olcha = (kod) => {
    const r = py.run(kod, { maxSteps: 3000000 });
    return { qadam: r.steps, chiqish: r.output, xato: r.error };
  };

  function jadval(olchamlar) {
    return (olchamlar || [5, 10, 20, 40]).map((n) => {
      const list = teskari(n);
      return {
        n,
        pufak: olcha(literal(list) + PUFAK_TANA).qadam,
        tanlash: olcha(literal(list) + TANLASH_TANA).qadam,
      };
    });
  }

  // Qiyinlik zinasi (QOIDALAR 4.3): 0 — birinchi javoblar, 1 — o'rta, 2 — oxirgi va qiyin rejim.
  // Zina berilmasa (testlar) — eng qiyini.
  const zina = (tier) => (tier == null ? 2 : Math.max(0, Math.min(2, tier)));

  // Zinaga qarab ro'yxatdan tanlash: har elementning `tier` i — u qaysi zinadan boshlab chiqishi.
  // Zina berilmasa — hammasidan teng; berilsa — ko'pincha (60%) aynan shu zinaning masalalari.
  function zinadan(list, tier, rnd) {
    if (tier == null) return pick(list, rnd);
    const t = zina(tier);
    const mos = list.filter((x) => (x.tier || 0) <= t);
    const ayni = mos.filter((x) => (x.tier || 0) === t);
    return ayni.length && rnd() < 0.6 ? pick(ayni, rnd) : pick(mos, rnd);
  }

  // Takrorlanmaydigan tasodifiy sonlar (1 … 20)
  function tasodifRoyxat(rnd, n) {
    const list = [];
    while (list.length < n) {
      const v = int(rnd, 1, 20);
      if (!list.includes(v)) list.push(v);
    }
    return list;
  }

  // Bitta to'liq o'tish: qaysi juftliklar almashdi va ro'yxat qanday bo'ldi
  function birOtish(royxat) {
    const a = royxat.slice();
    const almashishlar = [];
    for (let i = 0; i < a.length - 1; i++) {
      if (a[i] > a[i + 1]) {
        almashishlar.push([a[i], a[i + 1]]);
        const t = a[i];
        a[i] = a[i + 1];
        a[i + 1] = t;
      }
    }
    return { natija: a, almashishlar };
  }

  // ---------- 1-bosqich: bir o'tishda nechta almashtirish bo'ladi ----------
  // 2026-10-02: oldin savol "almashtiramizmi? ha / yo'q" edi — taxmin bilan o'tardi (QOIDALAR 4.3:
  // 2 variantli savol yolg'iz kelmaydi). Endi javob — son: bola o'tishni xayolan to'liq bajaradi.
  const ALMASH_UZUNLIK = [[4, 5], [5, 6], [6, 7]];

  function almashTask(r, prev, tier) {
    const rr = r || Math.random;
    const [kam, kop] = ALMASH_UZUNLIK[zina(tier)];
    return pickNew((rnd) => {
      const list = tasodifRoyxat(rnd, int(rnd, kam, kop));
      const o = birOtish(list);
      return {
        id: "almash:" + list.join("-"),
        tur: "almash", holat: list,
        javob: o.almashishlar.length, almashishlar: o.almashishlar, natija: o.natija,
      };
    }, prev, rr);
  }

  // ---------- 2-bosqich: bir o'tishdan keyin ro'yxat qanday ----------
  const OTISH_UZUNLIK = [[4, 4], [4, 5], [5, 6]];

  function otishTask(r, prev, tier) {
    const rr = r || Math.random;
    const [kam, kop] = OTISH_UZUNLIK[zina(tier)];
    return pickNew((rnd) => {
      const list = tasodifRoyxat(rnd, int(rnd, kam, kop));
      // Bitta to'liq o'tish (eng kattasi oxiriga chiqadi)
      const a = birOtish(list).natija;
      if (String(a) === String(list)) return null; // hech nima o'zgarmasa, savol zerikarli
      return { id: "otish:" + list.join("-"), tur: "otish", holat: list, javob: a };
    }, prev, rr);
  }

  // ---------- 3-bosqich: kod yozish ----------
  // Sinov satri: ro'yxat o'qiladi, sarala() chaqiriladi, natija bitta qatorda chiqariladi
  const TAIL = "s = input().split()\na = []\nfor t in s:\n    a.append(int(t))\nsarala(a)\nchiqish = str(a[0])\nfor i in range(1, len(a)):\n    chiqish = chiqish + \" \" + str(a[i])\nprint(chiqish)";

  const WRITE = [
    {
      id: "pufak",
      what: "sarala(a) funksiyasini yoz: roʻyxatni pufakcha usulida oʻsish tartibida saralasin. Funksiya hech nima qaytarmaydi — roʻyxatning oʻzini oʻzgartiradi.",
      solution: "def sarala(a):\n    for oxir in range(len(a) - 1, 0, -1):\n        for i in range(oxir):\n            if a[i] > a[i + 1]:\n                b = a[i]\n                a[i] = a[i + 1]\n                a[i + 1] = b",
      tail: TAIL,
      tests: [["5 2 9 1"], ["3"], ["1 2 3"], ["9 8 7 6 5"], ["4 4 2"]],
    },
    {
      id: "tanlash",
      what: "sarala(a) funksiyasini tanlash usulida yoz: har safar qolganidan eng kichigini topib, oldinga qoʻy.",
      solution: "def sarala(a):\n    for boshi in range(len(a) - 1):\n        eng = boshi\n        for i in range(boshi + 1, len(a)):\n            if a[i] < a[eng]:\n                eng = i\n        b = a[boshi]\n        a[boshi] = a[eng]\n        a[eng] = b",
      tail: TAIL,
      tests: [["5 2 9 1"], ["3"], ["1 2 3"], ["9 8 7 6 5"], ["4 4 2"]],
    },
    {
      id: "kamayish", tier: 1,
      what: "sarala(a) funksiyasini yoz: roʻyxatni KAMAYISH tartibida saralasin (eng kattasi boshida). Tayyor sorted() dan foydalanma — oʻzing almashtir.",
      solution: "def sarala(a):\n    for oxir in range(len(a) - 1, 0, -1):\n        for i in range(oxir):\n            if a[i] < a[i + 1]:\n                b = a[i]\n                a[i] = a[i + 1]\n                a[i + 1] = b",
      tail: TAIL,
      tests: [["5 2 9 1"], ["3"], ["1 2 3"], ["9 8 7 6 5"], ["4 4 2"], ["-3 0 -7 2"]],
    },
    {
      id: "almashishlar", tier: 2,
      what: "almashishlar(a) funksiyasini yoz: roʻyxatni pufakcha usulida (faqat qoʻshni juftliklarni almashtirib) oʻsish tartibida saralasin va jami nechta almashtirish qilganini qaytarsin.",
      solution: "def almashishlar(a):\n    soni = 0\n    for oxir in range(len(a) - 1, 0, -1):\n        for i in range(oxir):\n            if a[i] > a[i + 1]:\n                b = a[i]\n                a[i] = a[i + 1]\n                a[i + 1] = b\n                soni += 1\n    return soni",
      tail: "s = input().split()\na = []\nfor t in s:\n    a.append(int(t))\nprint(almashishlar(a))",
      tests: [["5 2 9 1"], ["3"], ["1 2 3"], ["9 8 7 6 5"], ["4 4 2"], ["2 1"]],
    },
  ];

  function writeTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const w = zinadan(WRITE, tier, rnd);
      return {
        id: "yoz:" + w.id, tur: "yoz", type: "kod-yoz",
        what: w.what, solution: w.solution, tail: w.tail,
        tests: w.tests.map((stdin) => ({ stdin })),
      };
    }, prev, rr);
  }

  const api = {
    pufakQadamlar, tanlashQadamlar, literal, teskari, PUFAK_TANA, TANLASH_TANA,
    olcha, jadval, birOtish, almashTask, otishTask, writeTask, WRITE,
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
