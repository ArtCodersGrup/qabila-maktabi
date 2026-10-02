// 28-o'yin: savollarni yasash (sof mantiq, ekransiz).
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const py = (root.QK && root.QK.python) || require("../../umumiy/js/python/python.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  // Javob chegarasi. 2026-10-02: 12–16 yosh uchun 200 → 500; zina bilan o'sadi (200 → 350 → 500)
  const MAX = 500;
  const MAX_ZINA = [200, 350, MAX];
  // 1-bosqichda bo'linuvchi: 99 gacha → 299 gacha → 999 gacha (uch xonali sonlar)
  const BOLINUVCHI_ZINA = [99, 299, 999];

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

  function pickNew(make, prev, r) {
    for (let k = 0; k < 40; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  const codeTask = (type, code, extra) => Object.assign({ id: type + ":" + code, type, code, solution: code }, extra);

  // ---------- 1-bosqich: //, % va / ----------
  function divisionTask(r, prev, tier) {
    const rr = r || Math.random;
    const eng = BOLINUVCHI_ZINA[zina(tier)];
    return pickNew((rnd) => {
      const b = int(rnd, 2, 9);
      // Yuqori zinalarda sonlarning yarmi katta oraliqdan (99 dan yuqori) olinadi
      const a = eng > 99 && rnd() < 0.5 ? int(rnd, 100, eng) : int(rnd, b + 1, Math.min(eng, 99));
      const op = pick(["//", "%", "/"], rnd);
      // "/" da javob juda uzun kasr bo'lmasin: bir xonali kasrgacha
      if (op === "/" && (a * 10) % b !== 0) return null;
      return codeTask("natija", "print(" + a + " " + op + " " + b + ")", { op, a, b });
    }, prev, rr);
  }

  // ---------- 2-bosqich: amallar tartibi ----------
  // Shakl funksiyasining `tier` xossasi — u qaysi zinadan boshlab chiqishi (yo'q bo'lsa 0)
  const SHAPES = [
    (rnd) => {
      const a = int(rnd, 2, 9), b = int(rnd, 2, 9), c = int(rnd, 2, 9);
      return { text: a + " + " + b + " * " + c, hint: "avval koʻpaytirish" };
    },
    (rnd) => {
      const a = int(rnd, 2, 9), b = int(rnd, 2, 9), c = int(rnd, 2, 9);
      return { text: "(" + a + " + " + b + ") * " + c, hint: "avval qavs" };
    },
    (rnd) => {
      const a = int(rnd, 20, 99), b = int(rnd, 2, 9), c = int(rnd, 2, 9);
      return { text: a + " - " + b + " * " + c, hint: "avval koʻpaytirish" };
    },
    (rnd) => {
      const a = int(rnd, 20, 99), b = int(rnd, 2, 9), c = int(rnd, 2, 9);
      return { text: a + " // " + b + " + " + c, hint: "avval butun boʻlinma" };
    },
    (rnd) => {
      const a = int(rnd, 20, 99), b = int(rnd, 2, 9), c = int(rnd, 2, 9);
      return { text: a + " % " + b + " * " + c, hint: "% va * chapdan oʻngga" };
    },
    (rnd) => {
      const a = int(rnd, 2, 5), b = int(rnd, 2, 3), c = int(rnd, 2, 9);
      return { text: a + " ** " + b + " + " + c, hint: "avval daraja" };
    },
    (rnd) => {
      const a = int(rnd, 2, 9), b = int(rnd, 2, 9), c = int(rnd, 2, 9);
      return { text: a + " * " + b + " - " + c + " * " + int(rnd, 2, 9), hint: "ikkala koʻpaytirish avval" };
    },
  ];
  // ---- 2026-10-02: to'rt amalli va manfiy sonli shakllar ----
  const shakl = (tier, fn) => Object.assign(fn, { tier });
  SHAPES.push(
    shakl(1, (rnd) => {
      const a = int(rnd, 10, 40), b = int(rnd, 2, 9), c = int(rnd, 2, 9), d = int(rnd, 2, 9);
      return { text: a + " + " + b + " * " + c + " - " + d, hint: "avval koʻpaytirish, keyin chapdan oʻngga" };
    }),
    shakl(1, (rnd) => {
      const a = int(rnd, 10, 30), b = int(rnd, 2, 9), c = int(rnd, 2, 9), d = int(rnd, 2, 9);
      return { text: "(" + a + " - " + b + ") * (" + c + " + " + d + ")", hint: "avval ikkala qavs" };
    }),
    shakl(2, (rnd) => {
      const a = int(rnd, 12, 40), b = int(rnd, 3, 9), c = int(rnd, 2, 5), d = int(rnd, 2, 9);
      return { text: a + " * " + b + " // " + c + " + " + d, hint: "* va // chapdan oʻngga, + eng oxirida" };
    }),
    shakl(2, (rnd) => {
      const a = int(rnd, 2, 5), b = int(rnd, 2, 3), c = int(rnd, 2, 9), d = int(rnd, 2, 9);
      return { text: a + " ** " + b + " * " + c + " % " + d, hint: "avval daraja, keyin * va % chapdan oʻngga" };
    }),
    // Manfiy son: Pythonda // pastga yumalaydi, % esa manfiy bo'lmaydi (boshqa tillarda boshqacha!)
    shakl(2, (rnd) => {
      const a = int(rnd, 7, 30), b = int(rnd, 2, 5);
      return a % b === 0 ? null : { text: "-" + a + " // " + b, manfiy: true, hint: "// pastga yumalaydi: −7 // 2 = −4 (−3 emas)" };
    }),
    shakl(2, (rnd) => {
      const a = int(rnd, 7, 30), b = int(rnd, 2, 5);
      return a % b === 0 ? null : { text: "-" + a + " % " + b, manfiy: true, hint: "qoldiq manfiy boʻlmaydi: −7 % 3 = 2, chunki −7 = 3 × (−3) + 2" };
    }),
  );

  function orderTask(r, prev, tier) {
    const rr = r || Math.random;
    const chegara = MAX_ZINA[zina(tier)];
    return pickNew((rnd) => {
      const shape = zinadan(SHAPES, tier, rnd)(rnd);
      if (!shape) return null;
      const code = "print(" + shape.text + ")";
      const result = py.run(code);
      if (result.error) return null;
      const value = Number(result.output[0]);
      // Javob manfiy bo'lishi faqat "manfiy" shakllarda mumkin
      if (!Number.isInteger(value) || Math.abs(value) > chegara || (value < 0 && !shape.manfiy)) return null;
      return codeTask("natija", code, { hint: shape.hint, manfiy: !!shape.manfiy });
    }, prev, rr);
  }

  // ---------- 3-bosqich: hisoblaydigan dastur ----------
  // Matn va sonni + bilan qo'shish — eng ko'p uchraydigan xato
  function fixTask(r, prev, tier) {
    const rr = r || Math.random;
    const eng = BOLINUVCHI_ZINA[zina(tier)];
    return pickNew((rnd) => {
      const a = int(rnd, 20, eng);
      const b = int(rnd, 2, 9);
      const op = pick(["//", "%"], rnd);
      const label = op === "//" ? "nechtadan" : "ortgani";
      const good = "x = " + a + " " + op + " " + b + '\nprint("' + label + ':", x)';
      const bad = "x = " + a + " " + op + " " + b + '\nprint("' + label + ': " + x)';
      return { id: "xato:" + bad, type: "xato-top", code: bad, solution: good, why: "matn va sonni + bilan qoʻshib boʻlmaydi" };
    }, prev, rr);
  }

  const WRITE_KINDS = [
    {
      id: "oxirgi-raqam",
      what: "Bitta son kiritiladi. Uning oxirgi raqamini chiqar.",
      solution: "n = int(input())\nprint(n % 10)",
      tests: [["7"], ["42"], ["1305"]],
    },
    {
      id: "soat-daqiqa",
      what: "Daqiqalar soni kiritiladi. Necha soat va necha daqiqa ekanini shu tartibda ikki satrda chiqar.",
      solution: "n = int(input())\nprint(n // 60)\nprint(n % 60)",
      tests: [["135"], ["59"], ["600"]],
    },
    {
      id: "bolinma-qoldiq",
      what: "Ikkita son kiritiladi. Birinchisini ikkinchisiga boʻlgandagi butun qismini va qoldigʻini shu tartibda chiqar.",
      solution: "a = int(input())\nb = int(input())\nprint(a // b)\nprint(a % b)",
      tests: [["17", "5"], ["100", "7"], ["9", "3"]],
    },
    {
      id: "kvadrat",
      what: "Bitta son kiritiladi. Uning kvadratini va kubini shu tartibda chiqar.",
      solution: "n = int(input())\nprint(n ** 2)\nprint(n ** 3)",
      tests: [["3"], ["12"], ["25"]],
    },
    // ---- 2026-10-02: uch yangi masala (zina 1–2) ----
    {
      id: "orta-raqam", tier: 1,
      what: "Uch xonali son kiritiladi. Uning oʻrtadagi (oʻnlar xonasidagi) raqamini chiqar.",
      solution: "n = int(input())\nprint(n // 10 % 10)",
      tests: [["472"], ["105"], ["990"], ["111"]],
    },
    {
      id: "tosh-bolish", tier: 1,
      what: "Ikkita son kiritiladi: n ta tosh va k ta bola. Toshlar teng boʻlinadi. Har bolaga nechtadan tegishini va nechta tosh ortib qolishini shu tartibda chiqar.",
      solution: "n = int(input())\nk = int(input())\nprint(n // k)\nprint(n % k)",
      tests: [["17", "5"], ["20", "4"], ["3", "7"], ["100", "9"]],
    },
    {
      id: "sekund", tier: 2,
      what: "Sekundlar soni kiritiladi. Bu necha soat, necha daqiqa va necha sekund ekanini shu tartibda uch satrda chiqar.",
      solution: "n = int(input())\nprint(n // 3600)\nprint(n % 3600 // 60)\nprint(n % 60)",
      tests: [["3725"], ["59"], ["3600"], ["86399"], ["60"]],
    },
    {
      id: "yuzlik", tier: 2,
      what: "Bitta son kiritiladi (100 dan katta). Uning oxirgi ikki raqamini olib tashlab, qolgan qismini va olib tashlangan qismini shu tartibda chiqar (masalan 4725 → 47 va 25).",
      solution: "n = int(input())\nprint(n // 100)\nprint(n % 100)",
      tests: [["4725"], ["100"], ["905"], ["12345"]],
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

  const api = { MAX, MAX_ZINA, BOLINUVCHI_ZINA, SHAPES, WRITE_KINDS, divisionTask, orderTask, fixTask, writeTask, stage3Task };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
