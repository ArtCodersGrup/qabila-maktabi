// 33-o'yin: savollarni yasash (sof mantiq, ekransiz).
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const py = (root.QK && root.QK.python) || require("../../umumiy/js/python/python.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  const MAX_LINES = 6;
  const WORDS = ["qabila", "python", "maktab", "daftar", "quyosh", "kitob", "dastur"];

  function pickNew(make, prev, r) {
    for (let k = 0; k < 40; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  const codeTask = (type, code, extra) => Object.assign({ id: type + ":" + code, type, code, solution: code }, extra);

  function safe(code, stdin, maxLines) {
    const r = py.run(code, { stdin, maxSteps: 100000 });
    if (r.error) return null;
    if (r.output.length === 0 || r.output.length > (maxLines || MAX_LINES)) return null;
    return r;
  }

  // Qiyinlik zinasi (QOIDALAR 4.3): 0 — birinchi javoblar, 1 — o'rta, 2 — oxirgi va qiyin rejim.
  // Zina berilmasa (testlar) — eng qiyini.
  const zina = (tier) => (tier == null ? 2 : Math.max(0, Math.min(2, tier)));

  function zinadan(list, tier, rnd) {
    if (tier == null) return pick(list, rnd);
    const t = zina(tier);
    const mos = list.filter((x) => (x.tier || 0) <= t);
    const ayni = mos.filter((x) => (x.tier || 0) === t);
    return ayni.length && rnd() < 0.6 ? pick(ayni, rnd) : pick(mos, rnd);
  }
  const zinali = (tier, fn) => Object.assign(fn, { tier });

  // Ro'yxat zina bilan uzayadi va sonlar oralig'i kengayadi (2026-10-02):
  //   0 — 3–5 ta son, 1…20;   1 — 4–6 ta, 1…30;   2 — 4–7 ta, −9…30 (manfiy sonlar ham)
  const ROYXAT_ZINA = [
    { soni: [3, 5], qiymat: [1, 20] },
    { soni: [4, 6], qiymat: [1, 30] },
    { soni: [4, 7], qiymat: [-9, 30] },
  ];

  // Tasodifiy kichik ro'yxat, sonlar takrorlanmaydi. zina berilmasa — 3–5 ta son, 1–20 oralig'ida.
  function numbers(rnd, count, tier) {
    const z = ROYXAT_ZINA[tier == null ? 0 : zina(tier)];
    const n = count || int(rnd, z.soni[0], z.soni[1]);
    const out = [];
    while (out.length < n) {
      const v = int(rnd, z.qiymat[0], z.qiymat[1]);
      if (!out.includes(v)) out.push(v);
    }
    return out;
  }

  const listLiteral = (nums) => "[" + nums.join(", ") + "]";

  // ---------- 1-bosqich: indeks, len, append ----------
  const BASIC = [
    (rnd, t) => {
      const nums = numbers(rnd, 0, t);
      return "a = " + listLiteral(nums) + "\nprint(a[0], a[" + (nums.length - 1) + "], len(a))";
    },
    (rnd, t) => {
      const nums = numbers(rnd, 0, t);
      return "a = " + listLiteral(nums) + "\nprint(a[-1], a[-2])";
    },
    (rnd, t) => {
      const nums = numbers(rnd, 0, t);
      const k = int(rnd, 0, nums.length - 1);
      return "a = " + listLiteral(nums) + "\na[" + k + "] = " + int(rnd, 21, 40) + "\nprint(a)";
    },
    (rnd, t) => {
      const nums = numbers(rnd, 3, t);
      return "a = " + listLiteral(nums) + "\na.append(" + int(rnd, 21, 40) + ")\nprint(a, len(a))";
    },
    (rnd, t) => {
      const nums = numbers(rnd, 0, t);
      return "a = " + listLiteral(nums) + "\nprint(sum(a), max(a), min(a))";
    },
    // ---- 2026-10-02 (zina 1–2): ikki nom — bitta ro'yxat, pop, chetlarni almashtirish ----
    zinali(1, (rnd, t) => {
      const nums = numbers(rnd, 0, t);
      return "a = " + listLiteral(nums) + "\nx = a.pop()\nprint(x, len(a), a[-1])";
    }),
    zinali(1, (rnd, t) => {
      const nums = numbers(rnd, 0, t);
      return "a = " + listLiteral(nums) + "\nprint(a[len(a) - 1] == a[-1], a[len(a) - 2])";
    }),
    zinali(2, (rnd, t) => {
      // b = a nusxa olmaydi: ikkala nom bitta ro'yxatga qaraydi
      const nums = numbers(rnd, 3, t);
      return "a = " + listLiteral(nums) + "\nb = a\nb.append(" + int(rnd, 31, 40) + ")\nb[0] = 0\nprint(a, len(a))";
    }),
    zinali(2, (rnd, t) => {
      const nums = numbers(rnd, 4, t);
      return "a = " + listLiteral(nums) + "\na[0], a[-1] = a[-1], a[0]\nprint(a)";
    }),
    zinali(2, (rnd, t) => {
      const nums = numbers(rnd, 0, t);
      return "a = " + listLiteral(nums) + "\nprint(max(a) - min(a), a[-1] - a[0], sorted(a)[1])";
    }),
  ];

  function listTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd, t) => {
      const code = zinadan(BASIC, tier, rnd)(rnd, zina(tier));
      return safe(code) ? codeTask("natija", code, { kind: "royxat" }) : null;
    }, prev, rr);
  }

  // ---------- 2-bosqich: bo'ylab yurish va kesish ----------
  const WALK = [
    (rnd, t) => {
      const nums = numbers(rnd, 0, t);
      return "a = " + listLiteral(nums) + "\ns = 0\nfor x in a:\n    s += x\nprint(s)";
    },
    (rnd, t) => {
      const nums = numbers(rnd, 0, t);
      return "a = " + listLiteral(nums) + "\nbest = a[0]\nfor x in a:\n    if x > best:\n        best = x\nprint(best)";
    },
    (rnd, t) => {
      const nums = numbers(rnd, 0, t);
      return "a = " + listLiteral(nums) + "\nsoni = 0\nfor x in a:\n    if x % 2 == 0:\n        soni += 1\nprint(soni)";
    },
    (rnd, t) => {
      const nums = numbers(rnd, 5, t);
      const from = int(rnd, 0, 2);
      return "a = " + listLiteral(nums) + "\nprint(a[" + from + ":" + (from + 2) + "])";
    },
    (rnd, t) => {
      const nums = numbers(rnd, 4, t);
      return "a = " + listLiteral(nums) + "\nprint(a[:2], a[2:])";
    },
    (rnd, t) => {
      const nums = numbers(rnd, 4, t);
      return "a = " + listLiteral(nums) + "\nfor i in range(len(a)):\n    print(i, a[i])";
    },
    // ---- 2026-10-02 (zina 1–2): qo'shnilarni solishtirish, indeksni izlash, "best = 0" tuzog'i ----
    zinali(1, (rnd, t) => {
      const nums = numbers(rnd, 0, t);
      return "a = " + listLiteral(nums) + "\nsoni = 0\nfor i in range(1, len(a)):\n    if a[i] > a[i - 1]:\n        soni += 1\nprint(soni)";
    }),
    zinali(1, (rnd, t) => {
      const nums = numbers(rnd, 0, t);
      return "a = " + listLiteral(nums) + "\neng = 0\nfor i in range(len(a)):\n    if a[i] > a[eng]:\n        eng = i\nprint(eng, a[eng])";
    }),
    zinali(2, (rnd) => {
      // Hamma son manfiy: 0 dan boshlangan "eng katta" hech qachon o'zgarmaydi
      const nums = numbers(rnd, int(rnd, 3, 5), 0).map((v) => -v);
      return "a = " + listLiteral(nums) + "\nbest = 0\nfor x in a:\n    if x > best:\n        best = x\nprint(best, max(a))";
    }),
    zinali(2, (rnd, t) => {
      const nums = numbers(rnd, 0, t);
      return "a = " + listLiteral(nums) + "\nb = []\nfor x in a:\n    if x % 2 == 0:\n        b.append(x * 2)\nprint(b, len(b))";
    }),
    zinali(2, (rnd, t) => {
      const nums = numbers(rnd, 6, t);
      return "a = " + listLiteral(nums) + "\nprint(a[1:-1], a[-2:], len(a[2:5]))";
    }),
  ];

  function walkTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd, t) => {
      const code = zinadan(WALK, tier, rnd)(rnd, zina(tier));
      return safe(code) ? codeTask("natija", code, { kind: "boylab" }) : null;
    }, prev, rr);
  }

  // ---------- 3-bosqich: satr ----------
  const STRINGS = [
    (rnd) => {
      const w = pick(WORDS, rnd);
      return 's = "' + w + '"\nprint(s[0], s[-1], len(s))';
    },
    (rnd) => {
      const w = pick(WORDS, rnd);
      return 's = "' + w + '"\nprint(s[1:4], s[:3], s[3:])';
    },
    (rnd) => {
      const w = pick(WORDS, rnd);
      return 's = "' + w + '"\nsoni = 0\nfor harf in s:\n    if harf in "aeiou":\n        soni += 1\nprint(soni)';
    },
    (rnd) => {
      const w = pick(WORDS, rnd);
      return 's = "' + w + '"\nt = ""\nfor harf in s:\n    t = harf + t\nprint(t)';
    },
    (rnd) => {
      const w = pick(WORDS, rnd);
      return 's = "' + w + '"\nprint(s.upper(), s.count("a"))';
    },
    // ---- 2026-10-02 (zina 1–2): manfiy kesish, in, split, satrni solishtirish ----
    zinali(1, (rnd) => {
      const w = pick(WORDS, rnd);
      return 's = "' + w + '"\nprint(s[-2:], s[len(s) - 1], "a" in s)';
    }),
    zinali(1, (rnd) => {
      const w = pick(WORDS, rnd);
      return 's = "' + w + '"\nt = ""\nfor harf in s:\n    if harf not in "aeiou":\n        t = t + harf\nprint(t, len(t))';
    }),
    zinali(2, (rnd) => {
      const a = pick(WORDS, rnd);
      const b = pick(WORDS, rnd);
      return 's = "' + a + " " + b + '"\nsozlar = s.split()\nprint(len(s), len(sozlar), sozlar[-1][0])';
    }),
    zinali(2, (rnd) => {
      const w = pick(WORDS, rnd);
      return 's = "' + w + '"\nsoni = 0\nfor i in range(1, len(s)):\n    if s[i] > s[i - 1]:\n        soni += 1\nprint(soni)';
    }),
    zinali(2, (rnd) => {
      const w = pick(WORDS, rnd);
      return 's = "' + w + '"\nprint(sorted(s)[0], s[1:-1], s * 2 == s + s)';
    }),
  ];

  function stringTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const code = zinadan(STRINGS, tier, rnd)(rnd);
      return safe(code) ? codeTask("natija", code, { kind: "satr" }) : null;
    }, prev, rr);
  }

  const WRITE_KINDS = [
    {
      id: "yigindi",
      what: "Bitta satrda bir nechta son kiritiladi (orasi boʻsh joy bilan). Ularning yigʻindisini chiqar.",
      solution: "a = input().split()\ns = 0\nfor x in a:\n    s += int(x)\nprint(s)",
      tests: [["3 5 7"], ["10"], ["1 1 1 1 1"], ["100 200"]],
    },
    {
      id: "eng-katta",
      what: "Bitta satrda bir nechta son kiritiladi. Eng kattasini chiqar.",
      solution: "a = input().split()\nbest = int(a[0])\nfor x in a:\n    if int(x) > best:\n        best = int(x)\nprint(best)",
      tests: [["3 9 5"], ["7"], ["10 2 8 4"], ["5 5 5"]],
    },
    {
      id: "juftlar",
      what: "Bitta satrda bir nechta son kiritiladi. Nechtasi juft ekanini chiqar.",
      solution: "a = input().split()\nsoni = 0\nfor x in a:\n    if int(x) % 2 == 0:\n        soni += 1\nprint(soni)",
      tests: [["1 2 3 4"], ["7"], ["2 4 6"], ["1 3 5"]],
    },
    {
      id: "teskari-soz",
      what: "Bitta soʻz kiritiladi. Uni teskari yozib chiqar.",
      solution: 'soz = input()\nt = ""\nfor harf in soz:\n    t = harf + t\nprint(t)',
      tests: [["qabila"], ["a"], ["python"], ["abba"]],
    },
    {
      id: "ikkinchi-katta",
      what: "Bitta satrda bir nechta har xil son kiritiladi. Ikkinchi eng kattasini chiqar.",
      solution: "a = input().split()\nb = []\nfor x in a:\n    b.append(int(x))\nb = sorted(b)\nprint(b[len(b) - 2])",
      tests: [["3 9 5"], ["10 2"], ["1 7 4 9 2"], ["100 50 75"]],
    },
    // ---- 2026-10-02: to'rt yangi masala (zina 1–2) ----
    {
      id: "eng-katta-indeks", tier: 1,
      what: "Bitta satrda bir nechta son kiritiladi. Eng kattasi nechanchi oʻrinda turganini chiqar (oʻrinlar 0 dan sanaladi; bir nechta boʻlsa — birinchisi).",
      solution: "a = input().split()\neng = 0\nfor i in range(len(a)):\n    if int(a[i]) > int(a[eng]):\n        eng = i\nprint(eng)",
      tests: [["3 9 5"], ["7"], ["4 4 2"], ["-3 -1 -2"], ["1 2 10"]],
    },
    {
      id: "qoshni-teng", tier: 1,
      what: "Bitta satrda bir nechta son kiritiladi. Yonma-yon turgan ikkita bir xil son boʻlsa ha, aks holda yoʻq deb yoz.",
      solution: 'a = input().split()\njavob = "yoʻq"\nfor i in range(1, len(a)):\n    if a[i] == a[i - 1]:\n        javob = "ha"\nprint(javob)',
      tests: [["1 2 2 3"], ["7"], ["1 2 1 2"], ["5 5"], ["3 1 4 4"], ["2 2 9 1"]],
    },
    {
      id: "anagramma", tier: 2,
      what: "Ikki satrda ikkita soʻz kiritiladi. Ular bir xil harflardan tuzilgan boʻlsa (harflar soni ham bir xil) ha, aks holda yoʻq deb yoz.",
      solution: 'a = input()\nb = input()\nif sorted(a) == sorted(b):\n    print("ha")\nelse:\n    print("yoʻq")',
      tests: [["olma", "moal"], ["kitob", "botik"], ["a", "a"], ["ab", "abb"], ["qalam", "qalin"], ["aab", "abb"]],
    },
    {
      id: "ikkinchi-har-xil", tier: 2,
      what: "Bitta satrda bir nechta son kiritiladi (takrorlanishi mumkin, lekin kamida ikki xil son bor). Eng kattasidan kichik boʻlgan sonlarning eng kattasini chiqar (masalan 9 9 7 4 → 7).",
      solution: "a = input().split()\nb = []\nfor x in a:\n    b.append(int(x))\neng = max(b)\nikkinchi = min(b)\nfor x in b:\n    if x < eng and x > ikkinchi:\n        ikkinchi = x\nprint(ikkinchi)",
      tests: [["5 5 3"], ["1 7 7 4 9 9"], ["10 2"], ["-1 -5 -1"], ["3 9 5"]],
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
    return wantWrite ? writeTask(rr, prev, tier) : stringTask(rr, prev, tier);
  }

  const api = { MAX_LINES, WORDS, ROYXAT_ZINA, BASIC, WALK, STRINGS, WRITE_KINDS, numbers, listTask, walkTask, stringTask, writeTask, stage3Task };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
