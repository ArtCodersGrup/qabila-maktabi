// 38-o'yin: izlash — "son o'yladim" o'yini, chiziqli va ikkilik izlash (sof mantiq).
// Qadamlar sonini talqinchi sanaydi (py.run().steps) — jadval shundan yasaladi.
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const py = (root.QK && root.QK.python) || require("../../umumiy/js/python/python.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  const CHEK = 100; // "son o'yladim" o'yinining chegarasi: 1 dan 100 gacha

  function pickNew(make, prev, r) {
    for (let k = 0; k < 40; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  // ---------- "Son o'yladim" o'yini ----------
  // Bola taxmin qiladi: javob "katta" (o'ylangani kattaroq), "kichik" yoki "topdi"
  function javob(son, taxmin) {
    if (taxmin === son) return "topdi";
    return taxmin < son ? "katta" : "kichik";
  }

  // Kompyuterning taxmini: oraliqning o'rtasi (ikkilik izlash)
  const yarmi = (chap, ong) => Math.floor((chap + ong) / 2);

  // Oraliqni javobga qarab toraytirish
  function torayt(chap, ong, taxmin, j) {
    if (j === "katta") return { chap: taxmin + 1, ong };
    if (j === "kichik") return { chap, ong: taxmin - 1 };
    return { chap: taxmin, ong: taxmin };
  }

  // 1 dan n gacha oraliqda eng yomon holatda nechta savol kerak.
  // k ta savol bilan eng ko'pi 2^k − 1 ta sonni ajratish mumkin.
  function kerakliSavol(n) {
    let savol = 0;
    let qamrov = 0;
    while (qamrov < n) {
      savol++;
      qamrov = qamrov * 2 + 1;
    }
    return Math.max(1, savol);
  }

  // ---------- Izlash kodlari va o'lchov ----------
  // Ro'yxat BITTA satrda beriladi: [0, 1, 2, …].
  // Sabab: ro'yxatni siklda yasasak, o'sha qadamlar ikkala usulga ham qo'shilib,
  // izlashning farqini yashirib qo'yadi. Biz faqat IZLASH qadamlarini o'lchaymiz.
  function royxat(n) {
    const sonlar = [];
    for (let k = 0; k < n; k++) sonlar.push(k);
    return "a = [" + sonlar.join(", ") + "]\n";
  }

  const CHIZIQLI_TANA = "joy = -1\nfor i in range(len(a)):\n    if a[i] == x:\n        joy = i\nprint(joy)";
  const IKKILIK_TANA = "chap = 0\nong = len(a) - 1\njoy = -1\nwhile chap <= ong:\n    orta = (chap + ong) // 2\n    if a[orta] == x:\n        joy = orta\n        chap = ong + 1\n    elif a[orta] < x:\n        chap = orta + 1\n    else:\n        ong = orta - 1\nprint(joy)";

  const CHIZIQLI = (n, x) => royxat(n) + "x = " + x + "\n" + CHIZIQLI_TANA;
  const IKKILIK = (n, x) => royxat(n) + "x = " + x + "\n" + IKKILIK_TANA;

  const olcha = (kod) => {
    const r = py.run(kod, { maxSteps: 2000000 });
    return { qadam: r.steps, chiqish: r.output, xato: r.error };
  };

  // Jadval uchun: har xil n da ikkala usulning qadamlari (eng yomon holat — oxirgi element)
  function jadval(olchamlar) {
    return (olchamlar || [10, 20, 40, 80]).map((n) => {
      const x = n - 1;
      return { n, chiziqli: olcha(CHIZIQLI(n, x)).qadam, ikkilik: olcha(IKKILIK(n, x)).qadam };
    });
  }

  // ---------- 2-bosqich: kodni o'qish ----------
  // O'qish savollari uchun qisqa, o'sish tartibidagi ro'yxat
  function sonlar(rnd, n) {
    const out = [];
    let v = int(rnd, 1, 5);
    for (let k = 0; k < n; k++) {
      out.push(v);
      v += int(rnd, 1, 4);
    }
    return out;
  }
  const literal = (list) => "a = [" + list.join(", ") + "]\n";

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

  // 2026-10-02: izlashning QADAMLARINI kuzatadigan kodlar — javobni "natija −1 yoki indeks" deb taxmin qilib bo'lmaydi
  // Chiziqli izlash topgach to'xtaydi va nechta solishtirish qilganini aytadi
  const CHIZIQLI_SANOQ = "soni = 0\nfor i in range(len(a)):\n    soni += 1\n    if a[i] == x:\n        break\nprint(soni)";
  // Ikkilik izlash nechta marta o'rtaga qaraganini aytadi
  const IKKILIK_SANOQ = "chap = 0\nong = len(a) - 1\nsoni = 0\nwhile chap <= ong:\n    orta = (chap + ong) // 2\n    soni += 1\n    if a[orta] == x:\n        chap = ong + 1\n    elif a[orta] < x:\n        chap = orta + 1\n    else:\n        ong = orta - 1\nprint(soni)";
  // Ikkilik izlash qaragan har indeksni chiqaradi (bir necha satr)
  const IKKILIK_IZ = "chap = 0\nong = len(a) - 1\nwhile chap <= ong:\n    orta = (chap + ong) // 2\n    print(orta)\n    if a[orta] == x:\n        chap = ong + 1\n    elif a[orta] < x:\n        chap = orta + 1\n    else:\n        ong = orta - 1";

  // Ro'yxatda bor yoki yo'q son (yo'q bo'lsa — ikki qo'shni orasidagi yoki chetdan tashqaridagi)
  function nishon(rnd, list) {
    if (rnd() < 0.7) return list[int(rnd, 0, list.length - 1)];
    const yoq = [];
    for (let v = list[0] - 1; v <= list[list.length - 1] + 1; v++) if (!list.includes(v)) yoq.push(v);
    return pick(yoq, rnd);
  }

  const OQISH = [
    (rnd) => {
      const list = sonlar(rnd, int(rnd, 4, 6));
      const x = list[int(rnd, 0, list.length - 1)];
      return { kod: literal(list) + "x = " + x + "\n" + CHIZIQLI_TANA, savol: "Kod nima chiqaradi?", id: "chiziqli:" + list.join("-") + ":" + x };
    },
    (rnd) => {
      const list = sonlar(rnd, int(rnd, 4, 6));
      const x = list[list.length - 1] + int(rnd, 1, 3);
      return { kod: literal(list) + "x = " + x + "\n" + CHIZIQLI_TANA, savol: "Roʻyxatda bunday son bormi? Kod nima chiqaradi?", id: "yoq:" + list.join("-") };
    },
    (rnd) => {
      const list = sonlar(rnd, int(rnd, 5, 7));
      const x = list[int(rnd, 0, list.length - 1)];
      return { kod: literal(list) + "x = " + x + "\n" + IKKILIK_TANA, savol: "Ikkilik izlash nima chiqaradi?", id: "ikkilik:" + list.join("-") + ":" + x };
    },
    // ---- 2026-10-02 (zina 1–2): qadamlarni yurgizish ----
    zinali(1, (rnd) => {
      const list = sonlar(rnd, int(rnd, 6, 8));
      const x = nishon(rnd, list);
      return { kod: literal(list) + "x = " + x + "\n" + CHIZIQLI_SANOQ, savol: "Chiziqli izlash nechta solishtirish qiladi?", id: "chiziqli-sanoq:" + list.join("-") + ":" + x };
    }),
    zinali(1, (rnd) => {
      const list = sonlar(rnd, int(rnd, 7, 10));
      const x = nishon(rnd, list);
      return { kod: literal(list) + "x = " + x + "\n" + IKKILIK_SANOQ, savol: "Ikkilik izlash necha marta oʻrtaga qaraydi?", id: "ikkilik-sanoq:" + list.join("-") + ":" + x };
    }),
    zinali(2, (rnd) => {
      const list = sonlar(rnd, int(rnd, 7, 10));
      const x = nishon(rnd, list);
      return { kod: literal(list) + "x = " + x + "\n" + IKKILIK_IZ, savol: "Ikkilik izlash qaysi indekslarga qaraydi? Har birini alohida qatorga yoz.", id: "ikkilik-iz:" + list.join("-") + ":" + x, kop: true };
    }),
  ];

  function oqishTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const o = zinadan(OQISH, tier, rnd)(rnd);
      const res = olcha(o.kod);
      // Odatda javob bitta satr; "iz" savolida — qaralgan indekslar (2–4 satr)
      if (res.xato) return null;
      if (o.kop ? (res.chiqish.length < 2 || res.chiqish.length > 4) : res.chiqish.length !== 1) return null;
      return { id: o.id, tur: "oqi", type: "natija", code: o.kod, solution: o.kod, savol: o.savol };
    }, prev, rr);
  }

  // ---------- 3-bosqich: kod yozish ----------
  const TAIL = "s = input().split()\na = []\nfor t in s:\n    a.append(int(t))\nx = int(input())\nprint(izla(a, x))";

  const WRITE = [
    {
      id: "chiziqli",
      what: "izla(a, x) funksiyasini yoz: roʻyxatdagi x ning oʻrnini (indeksini) qaytarsin, topilmasa −1. Roʻyxatni boshidan oxirigacha koʻrib chiq.",
      solution: "def izla(a, x):\n    for i in range(len(a)):\n        if a[i] == x:\n            return i\n    return -1",
      tail: TAIL,
      tests: [["3 7 9 12", "9"], ["3 7 9 12", "3"], ["3 7 9 12", "5"], ["5", "5"], ["1 2 3 4 5", "5"]],
    },
    {
      id: "ikkilik",
      what: "izla(a, x) funksiyasini yoz, lekin endi ikkilik izlash bilan: roʻyxat oʻsish tartibida berilgan, har qadamda oʻrtasiga qara va yarmini tashlab yubor. Topilmasa −1.",
      solution: "def izla(a, x):\n    chap = 0\n    ong = len(a) - 1\n    while chap <= ong:\n        orta = (chap + ong) // 2\n        if a[orta] == x:\n            return orta\n        elif a[orta] < x:\n            chap = orta + 1\n        else:\n            ong = orta - 1\n    return -1",
      tail: TAIL,
      tests: [["1 3 5 7 9 11", "7"], ["1 3 5 7 9 11", "1"], ["1 3 5 7 9 11", "11"], ["1 3 5 7 9 11", "4"], ["5", "5"]],
    },
    // ---- 2026-10-02: ikki yangi masala (zina 1–2). Ro'yxat o'sish tartibida, takrorlar bo'lishi mumkin ----
    {
      id: "necha-marta", tier: 1,
      what: "sana(a, x) funksiyasini yoz: oʻsish tartibidagi a roʻyxatida x necha marta uchrashini qaytarsin (uchramasa 0).",
      solution: "def sana(a, x):\n    soni = 0\n    for y in a:\n        if y == x:\n            soni += 1\n    return soni",
      tail: "s = input().split()\na = []\nfor t in s:\n    a.append(int(t))\nx = int(input())\nprint(sana(a, x))",
      tests: [["1 2 2 2 5", "2"], ["1 2 3", "4"], ["7", "7"], ["1 1 1 1", "1"], ["2 4 4 9 9 9", "9"], ["3 5 8", "1"]],
    },
    {
      id: "birinchi", tier: 2,
      what: "birinchi(a, x) funksiyasini yoz: oʻsish tartibidagi a roʻyxatida x dan KICHIK BOʻLMAGAN birinchi sonning indeksini qaytarsin. Bunday son boʻlmasa — roʻyxat uzunligini. Ikkilik izlash bilan yozishga urin.",
      solution: "def birinchi(a, x):\n    chap = 0\n    ong = len(a)\n    while chap < ong:\n        orta = (chap + ong) // 2\n        if a[orta] < x:\n            chap = orta + 1\n        else:\n            ong = orta\n    return chap",
      tail: "s = input().split()\na = []\nfor t in s:\n    a.append(int(t))\nx = int(input())\nprint(birinchi(a, x))",
      tests: [["1 3 5 7", "4"], ["1 3 5 7", "9"], ["5", "5"], ["2 2 2 5", "2"], ["1 3", "0"], ["1 3 5 7", "7"], ["4", "9"]],
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

  const api = { CHEK, javob, yarmi, torayt, kerakliSavol, royxat, CHIZIQLI_TANA, IKKILIK_TANA, CHIZIQLI, IKKILIK, olcha, jadval, oqishTask, writeTask, WRITE, OQISH,
    CHIZIQLI_SANOQ, IKKILIK_SANOQ, IKKILIK_IZ };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
