// 32-o'yin: savollarni yasash (sof mantiq, ekransiz).
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const py = (root.QK && root.QK.python) || require("../../umumiy/js/python/python.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  const MAX_LINES = 8;
  const WORDS = ["qabila", "python", "maktab", "daftar", "quyosh", "kitob"];

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

  // ---------- 1-bosqich: range(n) ----------
  const SIMPLE = [
    (rnd) => "for i in range(" + int(rnd, 3, 6) + "):\n    print(i)",
    (rnd) => "for i in range(" + int(rnd, 3, 5) + "):\n    print(i * " + int(rnd, 2, 5) + ")",
    (rnd) => "for i in range(" + int(rnd, 3, 5) + "):\n    print(i + " + int(rnd, 1, 9) + ")",
    (rnd) => 'for i in range(' + int(rnd, 2, 4) + '):\n    print("' + pick(WORDS, rnd) + '")',
    // ---- 2026-10-02 (zina 1–2): ikki qiymat bir satrda, sikldan keyingi satr, toʻplovchi ----
    zinali(1, (rnd) => "for i in range(" + int(rnd, 3, 5) + "):\n    print(i, i * i)"),
    zinali(1, (rnd) => "for i in range(" + int(rnd, 3, 5) + "):\n    print(i * " + int(rnd, 2, 4) + " + 1)\nprint(i)"),
    zinali(2, (rnd) => "s = " + int(rnd, 1, 5) + "\nfor i in range(" + int(rnd, 3, 6) + "):\n    s = s + i\n    print(s)"),
    zinali(2, (rnd) => 'soz = ""\nfor i in range(' + int(rnd, 3, 5) + '):\n    soz = soz + str(i)\nprint(soz, len(soz))'),
  ];

  function rangeTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const code = zinadan(SIMPLE, tier, rnd)(rnd);
      return safe(code) ? codeTask("natija", code, { kind: "range" }) : null;
    }, prev, rr);
  }

  // ---------- 2-bosqich: chegaralar, qadam va satr bo'ylab ----------
  const BOUNDS = [
    (rnd) => {
      const a = int(rnd, 1, 4);
      return "for i in range(" + a + ", " + (a + int(rnd, 3, 5)) + "):\n    print(i)";
    },
    (rnd) => {
      const a = int(rnd, 0, 3);
      const step = int(rnd, 2, 3);
      return "for i in range(" + a + ", " + (a + step * int(rnd, 3, 5)) + ", " + step + "):\n    print(i)";
    },
    (rnd) => {
      const a = int(rnd, 6, 12);
      return "for i in range(" + a + ", 0, -" + int(rnd, 2, 3) + "):\n    print(i)";
    },
    (rnd) => {
      const word = pick(WORDS, rnd);
      return 'for harf in "' + word + '":\n    print(harf)';
    },
    (rnd) => {
      const n = int(rnd, 4, 9);
      return "soni = 0\nfor i in range(" + n + "):\n    soni += 1\nprint(soni)";
    },
    // ---- 2026-10-02 (zina 1–2): oxiri qadamga toʻgʻri kelmaydigan range, shartli sanash, break ----
    zinali(1, (rnd) => {
      const a = int(rnd, 1, 4);
      const step = int(rnd, 3, 4);
      return "for i in range(" + a + ", " + (a + step * int(rnd, 2, 4) + int(rnd, 1, step - 1)) + ", " + step + "):\n    print(i)";
    }),
    zinali(1, (rnd) => {
      const a = int(rnd, 2, 9);
      const b = a + int(rnd, 6, 14);
      return "soni = 0\nfor i in range(" + a + ", " + b + "):\n    if i % 3 == 0:\n        soni += 1\nprint(soni)";
    }),
    zinali(2, (rnd) => {
      const a = int(rnd, 10, 20);
      return "soni = 0\nfor i in range(" + a + ", " + int(rnd, 0, 3) + ", -" + int(rnd, 2, 4) + "):\n    soni += 1\nprint(soni, i)";
    }),
    zinali(2, (rnd) => {
      const k = int(rnd, 3, 6);
      return "for i in range(1, 20):\n    if i * i > " + (k * k + int(rnd, 1, 2 * k)) + ":\n        break\n    print(i)\nprint(i)";
    }),
    zinali(2, (rnd) => {
      const word = pick(WORDS, rnd);
      return 'soni = 0\nfor harf in "' + word + '":\n    if harf in "aeiou":\n        continue\n    soni += 1\nprint(soni)';
    }),
  ];

  function boundTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const code = zinadan(BOUNDS, tier, rnd)(rnd);
      return safe(code) ? codeTask("natija", code, { kind: "chegara" }) : null;
    }, prev, rr);
  }

  // ---------- 3-bosqich: ichma-ich sikl va naqsh ----------
  const NESTED = [
    (rnd) => {
      const n = int(rnd, 3, 5);
      return "for i in range(1, " + n + "):\n    print(\"*\" * i)";
    },
    (rnd) => {
      const n = int(rnd, 2, 4);
      const m = int(rnd, 2, 3);
      return "soni = 0\nfor i in range(" + n + "):\n    for j in range(" + m + "):\n        soni += 1\nprint(soni)";
    },
    (rnd) => {
      const n = int(rnd, 2, 4);
      return "for i in range(1, " + n + "):\n    for j in range(1, 3):\n        print(i, j)";
    },
    (rnd) => {
      const n = int(rnd, 3, 5);
      const k = int(rnd, 2, 4);
      return "for i in range(1, " + n + "):\n    print(" + k + " * i)";
    },
    // ---- 2026-10-02 (zina 1–2): ichki sikl chegarasi tashqi hisoblagichga bog'liq, continue ----
    zinali(1, (rnd) => {
      // Uchburchak juftliklar: j har doim i dan katta
      const n = int(rnd, 3, 4);
      return "for i in range(" + n + "):\n    for j in range(i + 1, " + n + "):\n        print(i, j)";
    }),
    zinali(1, (rnd) => {
      const n = int(rnd, 3, 5);
      return "soni = 0\nfor i in range(" + n + "):\n    for j in range(i):\n        soni += 1\nprint(soni)";
    }),
    zinali(2, (rnd) => {
      const n = int(rnd, 3, 5);
      return "soni = 0\nfor i in range(" + n + "):\n    for j in range(" + n + "):\n        if i == j:\n            continue\n        soni += 1\nprint(soni)";
    }),
    zinali(2, (rnd) => {
      const n = int(rnd, 3, 4);
      return 'for i in range(1, ' + (n + 1) + '):\n    satr = ""\n    for j in range(i):\n        satr = satr + str(j)\n    print(satr)';
    }),
    zinali(2, (rnd) => {
      const n = int(rnd, 3, 5);
      const k = int(rnd, 3, 5);
      return "soni = 0\nfor i in range(1, " + (n + 1) + "):\n    for j in range(1, " + (n + 1) + "):\n        if i + j == " + k + ":\n            soni += 1\nprint(soni)";
    }),
  ];

  function nestedTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const code = zinadan(NESTED, tier, rnd)(rnd);
      return safe(code) ? codeTask("natija", code, { kind: "ichma-ich" }) : null;
    }, prev, rr);
  }

  const WRITE_KINDS = [
    {
      id: "jadval-qatori",
      what: "Bitta son kiritiladi. Shu sonning 1 dan 5 gacha koʻpaytmalarini har satrda bittadan chiqar.",
      solution: "n = int(input())\nfor i in range(1, 6):\n    print(n * i)",
      tests: [["3"], ["7"], ["1"], ["10"]],
    },
    {
      id: "uchburchak",
      what: "Bitta son kiritiladi. Shuncha satrli uchburchak chiz: birinchi satrda 1 ta yulduzcha, keyingisida 2 ta va hokazo.",
      solution: 'n = int(input())\nfor i in range(1, n + 1):\n    print("*" * i)',
      tests: [["4"], ["1"], ["6"], ["2"]],
    },
    {
      id: "oraliq-yigindi",
      what: "Ikkita son kiritiladi: a va b. a dan b gacha (ikkalasi ham kiradi) sonlar yigʻindisini chiqar.",
      solution: "a = int(input())\nb = int(input())\ns = 0\nfor i in range(a, b + 1):\n    s += i\nprint(s)",
      tests: [["1", "5"], ["3", "3"], ["10", "20"], ["0", "1"]],
    },
    {
      id: "unlilar",
      what: "Bitta soʻz kiritiladi. Unda nechta unli harf (a, e, i, o, u) borligini chiqar.",
      solution: 'soz = input()\nsoni = 0\nfor harf in soz:\n    if harf in "aeiou":\n        soni += 1\nprint(soni)',
      tests: [["qabila"], ["python"], ["aeiou"], ["kkk"]],
    },
    {
      id: "juftlar-soni",
      what: "Bitta son kiritiladi. 1 dan shu songacha (uning oʻzi ham kiradi) nechta juft son borligini chiqar.",
      solution: "n = int(input())\nsoni = 0\nfor i in range(1, n + 1):\n    if i % 2 == 0:\n        soni += 1\nprint(soni)",
      tests: [["10"], ["1"], ["7"], ["100"]],
    },
    // ---- 2026-10-02: to'rt yangi masala (zina 1–2) ----
    {
      id: "uchga-bolinuvchi", tier: 1,
      what: "Ikkita son kiritiladi: a va b. a dan b gacha (ikkalasi ham kiradi) nechta son 3 ga qoldiqsiz boʻlinishini chiqar.",
      solution: "a = int(input())\nb = int(input())\nsoni = 0\nfor i in range(a, b + 1):\n    if i % 3 == 0:\n        soni += 1\nprint(soni)",
      tests: [["1", "10"], ["3", "3"], ["4", "5"], ["0", "9"], ["7", "30"]],
    },
    {
      id: "teskari-uchburchak", tier: 1,
      what: "Bitta son kiritiladi. Teskari uchburchak chiz: birinchi satrda shuncha yulduzcha, keyingisida bitta kam va hokazo — oxirgi satrda 1 ta.",
      solution: 'n = int(input())\nfor i in range(n, 0, -1):\n    print("*" * i)',
      tests: [["4"], ["1"], ["6"], ["2"]],
    },
    {
      id: "jadval", tier: 2,
      what: "Bitta son n kiritiladi. n × n koʻpaytirish jadvalini chiqar: i-satrda i × 1, i × 2, …, i × n sonlari boʻsh joy bilan ajratilgan.",
      solution: 'n = int(input())\nfor i in range(1, n + 1):\n    satr = ""\n    for j in range(1, n + 1):\n        satr = satr + str(i * j) + " "\n    print(satr)',
      tests: [["3"], ["1"], ["5"], ["2"]],
    },
    {
      id: "juftliklar", tier: 2,
      what: "Ikkita son kiritiladi: n va k. 1 dan n gacha sonlardan nechta juftlik (birinchisi ikkinchisidan kichik) yigʻindisi aynan k boʻlishini chiqar.",
      solution: "n = int(input())\nk = int(input())\nsoni = 0\nfor i in range(1, n + 1):\n    for j in range(i + 1, n + 1):\n        if i + j == k:\n            soni += 1\nprint(soni)",
      tests: [["5", "6"], ["4", "8"], ["10", "11"], ["1", "2"], ["6", "7"], ["4", "4"]],
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
        tests: kind.tests.map((stdin) => ({ stdin })),
      };
    }, prev, rr);
  }

  function stage3Task(r, prev, tier) {
    const rr = r || Math.random;
    const wantWrite = prev ? prev.type !== "kod-yoz" : rr() < 0.5;
    return wantWrite ? writeTask(rr, prev, tier) : nestedTask(rr, prev, tier);
  }

  const api = { MAX_LINES, WORDS, SIMPLE, BOUNDS, NESTED, WRITE_KINDS, rangeTask, boundTask, nestedTask, writeTask, stage3Task };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
