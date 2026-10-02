// 34-o'yin: savollarni yasash (sof mantiq, ekransiz).
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const py = (root.QK && root.QK.python) || require("../../umumiy/js/python/python.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  const NAMES = ["Anvar", "Dilnoza", "Sardor", "Malika"];
  const MAX_LINES = 6;

  function pickNew(make, prev, r) {
    for (let k = 0; k < 40; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  const codeTask = (type, code, extra) => Object.assign({ id: type + ":" + code, type, code, solution: code }, extra);

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

  function safe(code, maxLines) {
    const r = py.run(code, { maxSteps: 100000 });
    if (r.error) return null;
    if (r.output.length === 0 || r.output.length > (maxLines || MAX_LINES)) return null;
    return r;
  }

  // ---------- 1-bosqich: chaqiruv va parametr ----------
  const CALLS = [
    (rnd) => {
      const n = int(rnd, 2, 4);
      return "def salom():\n    print(\"Salom!\")\n\n" + Array.from({ length: n }, () => "salom()").join("\n");
    },
    (rnd) => {
      const a = pick(NAMES, rnd);
      const b = pick(NAMES, rnd);
      return 'def salom(ism):\n    print("Salom,", ism)\n\nsalom("' + a + '")\nsalom("' + b + '")';
    },
    (rnd) => {
      const k = int(rnd, 2, 9);
      return "def kvadrat(n):\n    print(n * n)\n\nkvadrat(" + k + ")\nkvadrat(" + (k + 1) + ")";
    },
    (rnd) => {
      const a = int(rnd, 2, 9);
      const b = int(rnd, 2, 9);
      return "def qosh(a, b):\n    print(a + b)\n\nqosh(" + a + ", " + b + ")\nqosh(" + b + ", " + a + ")";
    },
    // ---- 2026-10-02 (zina 1–2): argumentlar tartibi, siklda chaqirish, funksiya ichidan funksiya ----
    zinali(1, (rnd) => {
      const x = int(rnd, 2, 9);
      const y = int(rnd, 10, 20);
      return "def ayir(a, b):\n    print(a - b)\n\nx = " + x + "\ny = " + y + "\nayir(y, x)\nayir(x, y)";
    }),
    zinali(1, (rnd) => {
      const n = int(rnd, 3, 4);
      return 'def chiz(n):\n    print("*" * n)\n\nfor i in range(1, ' + (n + 1) + "):\n    chiz(i)";
    }),
    zinali(2, (rnd) => {
      const name = pick(NAMES, rnd);
      return 'def bosh():\n    print("boshi")\n    orta()\n    print("oxiri")\n\ndef orta():\n    print("' + name + '")\n\nbosh()';
    }),
    zinali(2, (rnd) => {
      const k = int(rnd, 2, 5);
      return "def jadval(n, marta):\n    for i in range(1, marta + 1):\n        print(n * i)\n\njadval(" + k + ", 3)\njadval(3, 2)";
    }),
  ];

  function callTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const code = zinadan(CALLS, tier, rnd)(rnd);
      return safe(code) ? codeTask("natija", code, { kind: "chaqiruv" }) : null;
    }, prev, rr);
  }

  // ---------- 2-bosqich: return, None va lokal o'zgaruvchi ----------
  const RETURNS = [
    (rnd) => {
      const k = int(rnd, 2, 9);
      return "def kvadrat(n):\n    return n * n\n\nx = kvadrat(" + k + ")\nprint(x)\nprint(kvadrat(x))";
    },
    (rnd) => {
      const k = int(rnd, 2, 9);
      return "def kvadrat(n):\n    print(n * n)\n\nx = kvadrat(" + k + ")\nprint(x)";
    },
    (rnd) => {
      const k = int(rnd, 2, 9);
      return "def sinov(n):\n    return n + 1\n    print(\"bu satr bajarilmaydi\")\n\nprint(sinov(" + k + "))";
    },
    (rnd) => {
      const a = int(rnd, 2, 9);
      const b = int(rnd, 10, 20);
      return "def kattasi(a, b):\n    if a > b:\n        return a\n    return b\n\nprint(kattasi(" + a + ", " + b + "), kattasi(" + b + ", " + a + "))";
    },
    (rnd) => {
      const k = int(rnd, 2, 9);
      return "x = " + k + "\n\ndef oshir(x):\n    x = x + 1\n    return x\n\nprint(oshir(x), x)";
    },
    // ---- 2026-10-02 (zina 1–2): ichma-ich chaqiruv, rekursiya, ro'yxatni o'zgartirish, erta return ----
    zinali(1, (rnd) => {
      const k = int(rnd, 2, 9);
      return "def ikkilantir(n):\n    return n * 2\n\nprint(ikkilantir(ikkilantir(" + k + ")) + 1)";
    }),
    zinali(1, (rnd) => {
      const a = int(rnd, 2, 5);
      const b = int(rnd, 2, 5);
      return "def kvadrat(n):\n    return n * n\n\ndef yigindi(a, b):\n    return kvadrat(a) + kvadrat(b)\n\nprint(yigindi(" + a + ", " + b + "))";
    }),
    zinali(2, (rnd) => {
      // Rekursiya: funksiya o'zini chaqiradi (chuqurlik 5 dan oshmaydi)
      const k = int(rnd, 3, 5);
      return "def fakt(n):\n    if n <= 1:\n        return 1\n    return n * fakt(n - 1)\n\nprint(fakt(" + k + "))";
    }),
    zinali(2, (rnd) => {
      // Ro'yxat parametr orqali o'zgaradi: son qutisidan farqli, ro'yxat nusxalanmaydi
      const x = int(rnd, 3, 9);
      return "def qosh(r):\n    r.append(" + x + ")\n\na = [1, 2]\nqosh(a)\nqosh(a)\nprint(a, len(a))";
    }),
    zinali(2, (rnd) => {
      const a = [int(rnd, 1, 4) * 2 + 1, int(rnd, 1, 4) * 2 + 1, int(rnd, 1, 9) * 2, int(rnd, 1, 9) * 2];
      return "def birinchi_juft(a):\n    for x in a:\n        if x % 2 == 0:\n            return x\n    return -1\n\nprint(birinchi_juft([" + a.join(", ") + "]), birinchi_juft([1, 3]))";
    }),
    zinali(2, (rnd) => {
      const k = int(rnd, 2, 4);
      return "def sana(n):\n    if n > 0:\n        print(n)\n        sana(n - 1)\n\nsana(" + k + ')\nprint("tamom")';
    }),
  ];

  function returnTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const code = zinadan(RETURNS, tier, rnd)(rnd);
      return safe(code) ? codeTask("natija", code, { kind: "return" }) : null;
    }, prev, rr);
  }

  // ---------- 3-bosqich: funksiya yozish (sinov satri bilan) ----------
  const WRITE_KINDS = [
    {
      id: "eng-katta",
      what: "eng_katta(a, b) funksiyasini yoz: ikki sondan kattasini qaytarsin. Chaqirishni sayt oʻzi bajaradi.",
      solution: "def eng_katta(a, b):\n    if a > b:\n        return a\n    return b",
      tail: "a = int(input())\nb = int(input())\nprint(eng_katta(a, b))",
      tests: [["3", "9"], ["10", "2"], ["5", "5"], ["-3", "-8"]],
    },
    {
      id: "juftmi",
      what: "juftmi(n) funksiyasini yoz: son juft boʻlsa True, aks holda False qaytarsin.",
      solution: "def juftmi(n):\n    return n % 2 == 0",
      tail: "print(juftmi(int(input())))",
      tests: [["4"], ["7"], ["0"], ["15"]],
    },
    {
      id: "raqamlar-yigindisi",
      what: "raqamlar_yigindisi(n) funksiyasini yoz: sonning raqamlari yigʻindisini qaytarsin.",
      solution: "def raqamlar_yigindisi(n):\n    s = 0\n    while n > 0:\n        s += n % 10\n        n = n // 10\n    return s",
      tail: "print(raqamlar_yigindisi(int(input())))",
      tests: [["5382"], ["7"], ["100"], ["999"]],
    },
    {
      id: "kvadratlar",
      what: "kvadrat(n) va kvadratlar_yigindisi(n) funksiyalarini yoz: ikkinchisi 1 dan n gacha kvadratlar yigʻindisini qaytarsin va kvadrat(n) dan foydalansin.",
      solution: "def kvadrat(n):\n    return n * n\n\ndef kvadratlar_yigindisi(n):\n    s = 0\n    for i in range(1, n + 1):\n        s += kvadrat(i)\n    return s",
      tail: "print(kvadratlar_yigindisi(int(input())))",
      tests: [["3"], ["1"], ["5"], ["10"]],
    },
    {
      id: "unlilar",
      what: "unlilar(soz) funksiyasini yoz: soʻzdagi unli harflar (a, e, i, o, u) sonini qaytarsin.",
      solution: 'def unlilar(soz):\n    soni = 0\n    for harf in soz:\n        if harf in "aeiou":\n            soni += 1\n    return soni',
      tail: "print(unlilar(input()))",
      tests: [["qabila"], ["python"], ["aeiou"], ["kkk"]],
    },
    // ---- 2026-10-02: to'rt yangi funksiya (zina 1–2) ----
    {
      id: "palindrom", tier: 1,
      what: "palindrom(s) funksiyasini yoz: soʻz chapdan ham, oʻngdan ham bir xil oʻqilsa True, aks holda False qaytarsin.",
      solution: "def palindrom(s):\n    for i in range(len(s)):\n        if s[i] != s[len(s) - 1 - i]:\n            return False\n    return True",
      tail: "print(palindrom(input()))",
      tests: [["abba"], ["salom"], ["a"], ["abca"], ["kiyik"]],
    },
    {
      id: "tub", tier: 1,
      what: "tub(n) funksiyasini yoz: n tub son boʻlsa (faqat 1 ga va oʻziga boʻlinsa) True, aks holda False qaytarsin. 0 va 1 — tub emas.",
      solution: "def tub(n):\n    if n < 2:\n        return False\n    d = 2\n    while d * d <= n:\n        if n % d == 0:\n            return False\n        d += 1\n    return True",
      tail: "print(tub(int(input())))",
      tests: [["7"], ["1"], ["2"], ["25"], ["49"], ["97"], ["0"]],
    },
    {
      id: "ekub", tier: 2,
      what: "ekub(a, b) funksiyasini yoz: ikki musbat sonning eng katta umumiy boʻluvchisini qaytarsin.",
      solution: "def ekub(a, b):\n    while b != 0:\n        a, b = b, a % b\n    return a",
      tail: "print(ekub(int(input()), int(input())))",
      tests: [["12", "18"], ["17", "5"], ["100", "25"], ["7", "7"], ["1", "1000"]],
    },
    {
      id: "nechta-tub", tier: 2,
      what: "tub(n) va nechta_tub(a) funksiyalarini yoz: ikkinchisi a roʻyxatida nechta tub son borligini qaytarsin va tub(n) dan foydalansin.",
      solution: "def tub(n):\n    if n < 2:\n        return False\n    for d in range(2, n):\n        if n % d == 0:\n            return False\n    return True\n\ndef nechta_tub(a):\n    soni = 0\n    for x in a:\n        if tub(x):\n            soni += 1\n    return soni",
      tail: "a = []\nfor s in input().split():\n    a.append(int(s))\nprint(nechta_tub(a))",
      tests: [["2 3 4 5 6"], ["1"], ["9 15 21"], ["2"], ["97 1 25 13"]],
    },
    {
      id: "daraja", tier: 2,
      what: "daraja(a, n) funksiyasini yoz: a ning n-darajasini qaytarsin (n ≥ 0; daraja(a, 0) = 1). ** amalidan foydalanma — sikl yoki rekursiya bilan yoz.",
      solution: "def daraja(a, n):\n    if n == 0:\n        return 1\n    return a * daraja(a, n - 1)",
      tail: "print(daraja(int(input()), int(input())))",
      tests: [["2", "10"], ["5", "0"], ["3", "4"], ["1", "50"], ["-2", "3"]],
    },
  ];

  function writeTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const kind = zinadan(WRITE_KINDS, tier, rnd);
      return {
        id: "yoz:" + kind.id,
        type: "kod-yoz",
        what: kind.what,
        solution: kind.solution,
        tail: kind.tail,
        tests: kind.tests.map((stdin) => ({ stdin })),
      };
    }, prev, rr);
  }

  const api = { NAMES, MAX_LINES, CALLS, RETURNS, WRITE_KINDS, callTask, returnTask, writeTask };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
