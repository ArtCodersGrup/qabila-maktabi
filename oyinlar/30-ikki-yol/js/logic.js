// 30-o'yin: savollarni yasash (sof mantiq, ekransiz).
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

  const codeTask = (type, code, extra) => Object.assign({ id: type + ":" + code, type, code, solution: code }, extra);

  // Qiyinlik zinasi (QOIDALAR 4.3): 0 — birinchi javoblar, 1 — o'rta, 2 — oxirgi va qiyin rejim.
  // Zina berilmasa (testlar) — hammasidan teng.
  const zina = (tier) => (tier == null ? 2 : Math.max(0, Math.min(2, tier)));

  function zinadan(list, tier, rnd) {
    if (tier == null) return pick(list, rnd);
    const t = zina(tier);
    const mos = list.filter((x) => (x.tier || 0) <= t);
    const ayni = mos.filter((x) => (x.tier || 0) === t);
    return ayni.length && rnd() < 0.6 ? pick(ayni, rnd) : pick(mos, rnd);
  }

  // ---------- 1-bosqich: if / else va otstup ----------
  const CASES = [
    { name: "yosh", low: "kichik", high: "katta", min: 5, max: 20 },
    { name: "ball", low: "oʻtmadi", high: "oʻtdi", min: 20, max: 100 },
    { name: "narx", low: "arzon", high: "qimmat", min: 10, max: 90 },
    { name: "bulut", low: "quyoshli", high: "bulutli", min: 0, max: 10 },
  ];

  // 2026-10-02: uch shakl — oddiy (bitta shart), "and" (ikki shart birga) va ichma-ich if.
  // Qiymat ko'pincha chegaraning o'zida yoki yonida olinadi: >= va > farqi shu yerda ko'rinadi.
  const IF_SHAKLLAR = [{ id: "oddiy", tier: 0 }, { id: "and", tier: 1 }, { id: "ichma-ich", tier: 2 }];

  function ifTask(r, prev, tier) {
    const rr = r || Math.random;
    const t = zina(tier);
    return pickNew((rnd) => {
      const c = pick(CASES, rnd);
      const shakl = zinadan(IF_SHAKLLAR, tier, rnd).id;
      // Blokdan keyin doim bajariladigan satr — otstup darsi
      const tail = rnd() < 0.5 ? '\nprint("tamom")' : "";
      const yaqin = (limit) => (t > 0 && rnd() < 0.5 ? limit + int(rnd, -1, 1) : int(rnd, c.min, c.max));
      if (shakl === "oddiy") {
        const limit = int(rnd, c.min + 2, c.max - 2);
        const value = yaqin(limit);
        const op = pick([">=", ">", "<", "<=", "==", "!="], rnd);
        const code = c.name + " = " + value + "\nif " + c.name + " " + op + " " + limit + ":\n"
          + '    print("' + c.high + '")\nelse:\n    print("' + c.low + '")' + tail;
        return codeTask("natija", code, { kind: "if", shakl });
      }
      // Ikki chegara: past < yuqori
      const past = int(rnd, c.min + 1, c.min + Math.floor((c.max - c.min) / 2) - 1);
      const yuqori = int(rnd, past + 2, c.max - 1);
      const value = yaqin(rnd() < 0.5 ? past : yuqori);
      if (shakl === "and") {
        const code = c.name + " = " + value + "\nif " + c.name + " >= " + past + " and " + c.name + " < " + yuqori + ":\n"
          + '    print("oʻrtada")\nelse:\n    print("chetda")' + tail;
        return codeTask("natija", code, { kind: "if", shakl });
      }
      const code = c.name + " = " + value + "\nif " + c.name + " >= " + past + ":\n"
        + "    if " + c.name + " >= " + yuqori + ":\n"
        + '        print("' + c.high + '")\n    else:\n        print("oʻrtacha")\nelse:\n    print("' + c.low + '")' + tail;
      return codeTask("natija", code, { kind: "if", shakl });
    }, prev, rr);
  }

  // ---------- 2-bosqich: elif zanjiri va mantiqiy ifoda ----------
  function elifTask(r, prev, tier) {
    const rr = r || Math.random;
    const t = zina(tier);
    return pickNew((rnd) => {
      const a = int(rnd, 80, 92);
      const b = int(rnd, 60, 75);
      const c = int(rnd, 35, 55);
      // 2026-10-02: yuqori zinalarda ball ko'pincha chegaraning o'zi yoki undan bitta kam
      const ball = t > 0 && rnd() < 0.6 ? pick([a, b, c], rnd) - int(rnd, 0, 1) : int(rnd, 0, 100);
      const code = "ball = " + ball + "\nif ball >= " + a + ":\n    print(5)\nelif ball >= " + b
        + ":\n    print(4)\nelif ball >= " + c + ":\n    print(3)\nelse:\n    print(2)";
      return codeTask("natija", code, { kind: "elif" });
    }, prev, rr);
  }

  const BOOL_SHAPES = [
    (rnd, x) => ({ text: "x > " + int(rnd, 2, 9) + " and x < " + int(rnd, 10, 20) }),
    (rnd, x) => ({ text: "x < " + int(rnd, 2, 9) + " or x > " + int(rnd, 10, 20) }),
    (rnd, x) => ({ text: "not x == " + int(rnd, 2, 20) }),
    (rnd, x) => ({ text: int(rnd, 0, 5) + " < x < " + int(rnd, 10, 20) }),
    (rnd, x) => ({ text: "x % 2 == 0 and x > " + int(rnd, 2, 9) }),
  ];
  // ---- 2026-10-02: not + qavs, uch shart, or ichida and (zina 1–2) ----
  const mantiq = (tier, fn) => Object.assign(fn, { tier });
  BOOL_SHAPES.push(
    mantiq(1, (rnd) => ({ text: "not (x > " + int(rnd, 2, 9) + " and x < " + int(rnd, 10, 20) + ")" })),
    mantiq(1, (rnd) => ({ text: "x % 3 == 0 or x % 5 == 0" })),
    mantiq(2, (rnd) => ({ text: "x > " + int(rnd, 2, 9) + " and not x == " + int(rnd, 10, 20) + " or x == 1" })),
    mantiq(2, (rnd) => ({ text: "x < " + int(rnd, 3, 8) + " or x > " + int(rnd, 12, 18) + " and x % 2 == 0" })),
    mantiq(2, (rnd) => ({ text: "not x % 2 == 0 and " + int(rnd, 3, 8) + " <= x <= " + int(rnd, 12, 18) })),
  );

  function boolTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const x = int(rnd, 1, 20);
      const shape = zinadan(BOOL_SHAPES, tier, rnd)(rnd, x);
      const code = "x = " + x + "\nprint(" + shape.text + ")";
      const result = py.run(code);
      if (result.error) return null;
      return codeTask("natija", code, { kind: "bool" });
    }, prev, rr);
  }

  // 2-bosqichda ikki xil savol aralash keladi
  function stage2Task(r, prev, tier) {
    const rr = r || Math.random;
    const wantBool = prev ? prev.kind !== "bool" : rr() < 0.5;
    return wantBool ? boolTask(rr, prev, tier) : elifTask(rr, prev, tier);
  }

  // ---------- 3-bosqich: xato ovi va kod yozish ----------
  const BROKEN = [
    {
      kind: "teng",
      why: "solishtirish uchun ikkita teng kerak (==)",
      make: (good) => good.replace(" == ", " = "),
      need: (good) => good.includes(" == "),
    },
    {
      kind: "ikki-nuqta",
      why: "shart satri ikki nuqta bilan tugaydi",
      make: (good) => good.replace(/:\n/, "\n"),
      need: () => true,
    },
    {
      kind: "otstup",
      why: "shartga tegishli satr ichkariga suriladi",
      make: (good) => good.replace(/\n {4}/, "\n"),
      need: () => true,
    },
    {
      kind: "else-shart",
      why: "else ga shart yozilmaydi",
      make: (good) => good.replace("else:", "else x > 0:"),
      need: (good) => good.includes("else:"),
    },
    // ---- 2026-10-02: xato dasturning oxirida ham bo'lishi mumkin ----
    {
      kind: "else-nuqta",
      why: "else dan keyin ham ikki nuqta kerak",
      make: (good) => good.replace("else:", "else"),
      need: (good) => good.includes("else:"),
    },
    {
      kind: "else-otstup",
      why: "else ga tegishli satr ham ichkariga suriladi",
      make: (good) => good.replace(/else:\n {4}/, "else:\n"),
      need: (good) => good.includes("else:"),
    },
  ];

  // 2026-10-02: bitta shablon (x == limit) o'rniga uchta — bola kodni yodlab olmaydi.
  // Zina: 0 — teng/teng emas; 1 — + oraliq (and); 2 — + elif zanjiri.
  const FIX_SHABLONLAR = [
    (x, a) => "x = " + x + "\nif x == " + a + ':\n    print("teng")\nelse:\n    print("teng emas")',
    (x, a, b) => "x = " + x + "\nif x >= " + a + " and x < " + (a + b) + ':\n    print("ichida")\nelse:\n    print("tashqarida")',
    (x, a) => "x = " + x + "\nif x > " + a + ':\n    print("katta")\nelif x == ' + a + ':\n    print("teng")\nelse:\n    print("kichik")',
  ];

  function fixTask(r, prev, tier) {
    const rr = r || Math.random;
    const nechta = tier == null ? FIX_SHABLONLAR.length : zina(tier) + 1;
    return pickNew((rnd) => {
      const x = int(rnd, 2, 20);
      const limit = int(rnd, 2, 20);
      const shablon = int(rnd, 0, nechta - 1);
      const good = FIX_SHABLONLAR[shablon](x, limit, int(rnd, 3, 9));
      const broken = pick(BROKEN, rnd);
      if (!broken.need(good)) return null;
      const code = broken.make(good);
      if (code === good) return null;
      return { id: "xato:" + broken.kind + ":" + shablon + ":" + x + ":" + limit, type: "xato-top", kind: broken.kind, shablon, why: broken.why, code, solution: good };
    }, prev, rr);
  }

  const WRITE_KINDS = [
    {
      id: "juft-toq",
      what: "Bitta son kiritiladi. Juft boʻlsa juft, aks holda toq deb yoz.",
      solution: 'n = int(input())\nif n % 2 == 0:\n    print("juft")\nelse:\n    print("toq")',
      tests: [["4"], ["7"], ["0"], ["15"]],
    },
    {
      id: "eng-katta",
      what: "Uchta son kiritiladi. Eng kattasini chiqar.",
      solution: "a = int(input())\nb = int(input())\nc = int(input())\nbest = a\nif b > best:\n    best = b\nif c > best:\n    best = c\nprint(best)",
      tests: [["3", "9", "5"], ["10", "2", "7"], ["4", "4", "1"], ["1", "2", "3"]],
    },
    {
      id: "oraliq",
      what: "Bitta son kiritiladi. 10 dan 20 gacha boʻlsa (10 va 20 ham kiradi) ha, aks holda yoʻq deb yoz.",
      solution: 'n = int(input())\nif 10 <= n <= 20:\n    print("ha")\nelse:\n    print("yoʻq")',
      tests: [["15"], ["10"], ["20"], ["9"], ["21"]],
    },
    {
      id: "baho",
      what: "Ball kiritiladi. 90 dan boshlab 5, 70 dan boshlab 4, 50 dan boshlab 3, aks holda 2 chiqar.",
      solution: "ball = int(input())\nif ball >= 90:\n    print(5)\nelif ball >= 70:\n    print(4)\nelif ball >= 50:\n    print(3)\nelse:\n    print(2)",
      tests: [["95"], ["70"], ["55"], ["20"], ["89"]],
    },
    // ---- 2026-10-02: to'rt yangi masala (zina 1–2): ikki-uch shart birga ----
    {
      id: "uch-besh", tier: 1,
      what: "Bitta son kiritiladi. U 3 ga ham, 5 ga ham qoldiqsiz boʻlinsa ha, aks holda yoʻq deb yoz.",
      solution: 'n = int(input())\nif n % 3 == 0 and n % 5 == 0:\n    print("ha")\nelse:\n    print("yoʻq")',
      tests: [["15"], ["9"], ["10"], ["30"], ["0"], ["7"]],
    },
    {
      id: "osish", tier: 1,
      what: "Uchta son kiritiladi. Har keyingisi oldingisidan katta boʻlsa (qatʼiy oʻsish tartibi) ha, aks holda yoʻq deb yoz.",
      solution: 'a = int(input())\nb = int(input())\nc = int(input())\nif a < b and b < c:\n    print("ha")\nelse:\n    print("yoʻq")',
      tests: [["1", "2", "3"], ["1", "3", "2"], ["2", "2", "3"], ["3", "2", "1"], ["-5", "0", "5"], ["1", "5", "5"]],
    },
    {
      id: "uchburchak", tier: 2,
      what: "Uchta kesma uzunligi kiritiladi. Ulardan uchburchak yasab boʻlsa ha, aks holda yoʻq deb yoz. (Har ikki tomon yigʻindisi uchinchisidan katta boʻlishi kerak.)",
      solution: 'a = int(input())\nb = int(input())\nc = int(input())\nif a + b > c and a + c > b and b + c > a:\n    print("ha")\nelse:\n    print("yoʻq")',
      tests: [["3", "4", "5"], ["1", "2", "3"], ["10", "1", "1"], ["1", "10", "1"], ["1", "1", "10"], ["5", "5", "5"]],
    },
    {
      id: "kabisa", tier: 2,
      what: "Yil kiritiladi. Kabisa yili boʻlsa kabisa, aks holda oddiy deb yoz. Qoida: yil 400 ga boʻlinsa — kabisa; boʻlmasa, 100 ga boʻlinsa — oddiy; boʻlmasa, 4 ga boʻlinsa — kabisa; qolganlari — oddiy.",
      solution: 'yil = int(input())\nif yil % 400 == 0:\n    print("kabisa")\nelif yil % 100 == 0:\n    print("oddiy")\nelif yil % 4 == 0:\n    print("kabisa")\nelse:\n    print("oddiy")',
      tests: [["2024"], ["1900"], ["2000"], ["2023"], ["2100"], ["1996"]],
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
    return wantWrite ? writeTask(rr, prev, tier) : fixTask(rr, prev, tier);
  }

  const api = { CASES, BOOL_SHAPES, BROKEN, WRITE_KINDS, IF_SHAKLLAR, FIX_SHABLONLAR, ifTask, elifTask, boolTask, stage2Task, fixTask, writeTask, stage3Task };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
