// 48-o'yin: mantiq kodda — True/False, and, or, not (sof mantiq).
// Hamma qiymat talqinchining o'zida hisoblanadi (qo'lda yozilmaydi): tests/logic.test.js
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

  // Ifodaning qiymati — Pythonning o'zi hisoblaydi
  function qiymat(ifoda, ozgaruvchilar) {
    const bosh = Object.entries(ozgaruvchilar || {}).map(([k, v]) => k + " = " + v).join("\n");
    const r = py.run((bosh ? bosh + "\n" : "") + "print(" + ifoda + ")", { maxSteps: 20000 });
    if (r.error) return { xato: r.error.text };
    return { qiymat: r.out.trim() };
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

  function aralash(list, rnd) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  const RY = (v) => (v ? "True" : "False");
  // Ifodada qaysi o'zgaruvchilar bor (a, b, c) — so'z chegarasi bilan: "and" ichidagi "a" hisoblanmaydi
  const nomlarIchida = (ifoda) => ["a", "b", "c"].filter((n) => new RegExp("\\b" + n + "\\b").test(ifoda));

  // Rostlik jadvali: ifodadagi o'zgaruvchilarning hamma holati uchun qiymat (2, 4 yoki 8 qator)
  function jadval(ifoda, nomlar) {
    const [a, b, c] = nomlar || ["a", "b", "c"];
    const borB = new RegExp("\\b" + b + "\\b").test(ifoda);
    const borC = !!c && new RegExp("\\b" + c + "\\b").test(ifoda);
    const qatorlar = [];
    for (const av of [true, false]) {
      for (const bv of borB ? [true, false] : [true]) {
        for (const cv of borC ? [true, false] : [true]) {
          const vars = {};
          vars[a] = RY(av);
          if (borB) vars[b] = RY(bv);
          if (borC) vars[c] = RY(cv);
          const q = qiymat(ifoda, vars);
          const qator = { a: av, b: bv, natija: q.qiymat === "True" };
          if (borC) qator.c = cv;
          qatorlar.push(qator);
        }
      }
    }
    return qatorlar;
  }

  // ---------- 1-bosqich: solishtirish True yoki False beradi ----------
  const AMALLAR = [">", "<", ">=", "<=", "==", "!="];

  // 2026-10-02: oldin savol bitta solishtirish edi — "True / False" ikki tugma, 50% taxmin.
  // Endi bitta print ichida UCHTA solishtirish: javob — uchta True/False (8 xil kombinatsiya),
  // hammasi to'g'ri bo'lsagina hisoblanadi.
  // Murakkab chap tomonlar yuqori zinalarda qo'shiladi (amal avval hisoblanadi, keyin solishtiriladi)
  const CHAPLAR = [
    { tier: 0, matn: "a" },
    { tier: 1, matn: "a + 1" },
    { tier: 1, matn: "a % 2" },
    { tier: 2, matn: "a * 2" },
    { tier: 2, matn: "a - b" },
  ];
  const SON_CHEGARA = [[1, 20], [1, 30], [-9, 20]];

  function solishtirTask(r, prev, tier) {
    const rr = r || Math.random;
    const t = zina(tier);
    return pickNew((rnd) => {
      const [kam, kop] = SON_CHEGARA[t];
      const a = int(rnd, kam, kop);
      // Teng sonlar ham uchrasin: == va >= ning farqi shu yerda ko'rinadi
      const b = rnd() < 0.25 ? a : int(rnd, kam, kop);
      const amallar = aralash(AMALLAR, rnd).slice(0, 3);
      const mos = CHAPLAR.filter((c) => c.tier <= t);
      const ifodalar = amallar.map((amal, k) => {
        // Birinchi ifoda doim sodda (a amal b); qolganlari zinaga qarab murakkablashadi
        const chap = k === 0 || t === 0 ? "a" : pick(mos, rnd).matn;
        // Qoldiq faqat "teng / teng emas" bilan so'raladi (a % 2 < 0 kabi ma'nosiz savol chiqmasin)
        if (chap === "a % 2") return chap + " " + (amal === "!=" ? "!=" : "==") + " " + int(rnd, 0, 1);
        if (chap === "a - b") return chap + " " + amal + " " + int(rnd, 0, 3);
        return chap + " " + amal + " b";
      });
      const kod = "a = " + a + "\nb = " + b + "\nprint(" + ifodalar.join(", ") + ")";
      const res = py.run(kod, { maxSteps: 20000 });
      if (res.error) return null;
      const javoblar = res.out.trim().split(" ");
      if (javoblar.length !== 3) return null;
      return { id: "sol:" + kod, tur: "solishtir", kod, a, b, ifodalar, javoblar, javob: javoblar.join(" "),
        // ekranda har ifoda alohida qatorda so'raladi
        qatorlar: ifodalar,
        matn: "Bu print uchta javob chiqaradi. Har biri nima?",
        nega: "Har solishtirishni alohida hisobla: avval a va b oʻrniga sonlarni qoʻy. "
          + "== — «tengmi?», != — «teng emasmi?», >= — «katta yoki teng».",
        hisob: ifodalar.map((f, k) => f + " → " + javoblar[k]).join(";  ") };
    }, prev, rr);
  }

  // ---------- 2-bosqich: and, or, not ----------
  const IFODALAR = [
    "a and b", "a or b", "not a", "a and not b", "not a or b", "not (a and b)", "not a and not b",
  ];
  // Murakkab ifodalar (2026-10-02, faqat oxirgi zinada): uch o'zgaruvchi, qavs va amallar tartibi
  // (and or dan oldin bajariladi), De Morgan tengligi
  const IFODALAR_UCH = [
    "(a or b) and not c", "a and (b or c)", "not a or (b and c)", "a or b and c",
    "(not (a or b)) == (not a and not b)", "(a and b) or (not a and c)",
  ];

  // Ifoda o'zgaruvchilarining hamma holatlari: [{ a: "True", b: "False" }, …]
  function holatlarHammasi(ifoda) {
    const nomlar = nomlarIchida(ifoda);
    const out = [];
    for (let m = 0; m < 2 ** nomlar.length; m++) {
      const vars = {};
      nomlar.forEach((n, k) => { vars[n] = RY(!((m >> k) & 1)); });
      out.push(vars);
    }
    return out;
  }

  // 2026-10-02: bitta holat uchun True/False (50% taxmin) o'rniga — IKKI holat birga so'raladi
  // (4 xil kombinatsiya); oxirgi zinada uch o'zgaruvchili ifodalar keladi.
  function ifodaTask(r, prev, tier) {
    const rr = r || Math.random;
    const t = zina(tier);
    return pickNew((rnd) => {
      const sodda = t === 0 ? IFODALAR.slice(0, 4) : IFODALAR;
      const ifoda = t === 2 && rnd() < 0.6 ? pick(IFODALAR_UCH, rnd) : pick(sodda, rnd);
      const ikkita = aralash(holatlarHammasi(ifoda), rnd).slice(0, 2);
      const holatlar = ikkita.map((vars) => ({ vars, javob: qiymat(ifoda, vars).qiymat }));
      if (holatlar.some((x) => x.javob !== "True" && x.javob !== "False")) return null;
      const javoblar = holatlar.map((x) => x.javob);
      const yozuv = (vars) => Object.entries(vars).map(([k, v]) => k + " = " + v).join(", ");
      return { id: "if:" + ifoda + ":" + holatlar.map((x) => yozuv(x.vars)).join("|"), tur: "ifoda", ifoda,
        holatlar, javoblar, javob: javoblar.join(" "),
        // birinchi holat — eski maydonlar bilan mos (vars)
        vars: holatlar[0].vars,
        qatorlar: holatlar.map((x) => yozuv(x.vars)),
        matn: ifoda + " — har holatda nimaga teng?",
        nega: "VA (and) — ikkalasi ham rost boʻlsa; YOKI (or) — kamida bittasi; EMAS (not) — teskarisi. "
          + "Avval qavs ichi, keyin not, keyin and, eng oxirida or.",
        hisob: holatlar.map((x) => yozuv(x.vars) + " → " + x.javob).join(";  ") };
    }, prev, rr);
  }

  // Hayotiy gap → qaysi amal kerak
  const GAPLAR = [
    { matn: "Kinoga kirish uchun yosh 12 dan katta BOʻLISHI va bilet boʻlishi kerak.", javob: "and" },
    { matn: "Chegirma bor: oʻquvchiga YOKI nafaqaxoʻrga.", javob: "or" },
    { matn: "Ertaga dam olish: shanba YOKI yakshanba.", javob: "or" },
    { matn: "Parol toʻgʻri boʻlsa VA hisob bloklangan boʻlMAsa — kirasan.", javob: "and not" },
    { matn: "Yomgʻir yogʻmasa — sayrga chiqamiz.", javob: "not" },
    { matn: "Joy band EMAS boʻlsa, oʻtirish mumkin.", javob: "not" },
    { matn: "Oʻyinga kirish: aʼzo boʻlish va taklif boʻlishi shart.", javob: "and" },
    // 2026-10-02: toʻrtinchi variant — ikki amal birga (QOIDALAR 4.3: kamida 4 variant)
    { matn: "Dam olish kuni boʻlsa VA yomgʻir yogʻMAsa — sayrga chiqamiz.", javob: "and not" },
    { matn: "Uy vazifasi tayyor boʻlsa VA soat kech boʻlMAsa — oʻyin oʻynaysan.", javob: "and not" },
    { matn: "Kutubxonaga aʼzolar YOKI oʻqituvchilar kiradi.", javob: "or" },
  ];
  const GAP_VARIANTLAR = ["and", "or", "not", "and not"];

  function gapTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const g = pick(GAPLAR, rnd);
      return Object.assign({ tur: "gap", id: "gap:" + g.matn }, g);
    }, prev, rr);
  }

  // ---------- 3-bosqich: shartni kodda yozish ----------
  const KOD = [
    { id: "ikki-shart", kod: "yosh = 14\nbilet = True\nprint(yosh >= 12 and bilet)" },
    { id: "oraliq", kod: "x = 7\nprint(x > 5 and x < 10)" },
    { id: "teskari", kod: "band = False\nprint(not band)" },
    { id: "yoki", kod: "kun = \"shanba\"\nprint(kun == \"shanba\" or kun == \"yakshanba\")" },
    { id: "juft", kod: "n = 9\nprint(n % 2 == 0 or n > 5)" },
    // 2026-10-02: uch shartli va ikki satrli chiqishlar
    { id: "tartib", tier: 1, kod: "a = True\nb = False\nc = False\nprint(a or b and c)\nprint((a or b) and c)" },
    { id: "demorgan", tier: 1, kod: "x = 4\nprint(not (x > 3 and x < 10))\nprint(x <= 3 or x >= 10)" },
    { id: "kabisa", tier: 2, kod: "yil = 1900\nprint(yil % 4 == 0 and yil % 100 != 0 or yil % 400 == 0)" },
    { id: "uch-shart", tier: 2, kod: "yosh = 15\nbilet = True\nband = True\nprint(yosh >= 12 and bilet and not band)\nprint(yosh < 12 or bilet or band)" },
    { id: "zanjir", tier: 2, kod: "x = 10\nprint(5 < x <= 10, x != 10 or x == 10, not x > 10)" },
  ];

  function kodTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const k = zinadan(KOD, tier, rnd);
      return { id: "kod:" + k.id, tur: "natija", type: "natija", code: k.kod, solution: k.kod };
    }, prev, rr);
  }

  const WRITE = [
    {
      id: "mumkin",
      what: "mumkin(yosh, bilet) — yosh 12 dan kichik boʻlmasa VA bilet bor boʻlsa True qaytar.",
      solution: "def mumkin(yosh, bilet):\n    return yosh >= 12 and bilet",
      tail: "print(mumkin(int(input()), input() == \"ha\"))",
      tests: [["14", "ha"], ["11", "ha"], ["14", "yoq"], ["12", "ha"]],
    },
    {
      id: "oraliqda",
      what: "oraliqda(x) — x 10 dan katta VA 20 dan kichik boʻlsa True qaytar.",
      solution: "def oraliqda(x):\n    return x > 10 and x < 20",
      tail: "print(oraliqda(int(input())))",
      tests: [["15"], ["10"], ["20"], ["3"], ["19"]],
    },
    {
      id: "dam",
      what: "dam(kun) — kun «shanba» YOKI «yakshanba» boʻlsa True qaytar.",
      solution: "def dam(kun):\n    return kun == \"shanba\" or kun == \"yakshanba\"",
      tail: "print(dam(input()))",
      tests: [["shanba"], ["yakshanba"], ["dushanba"], ["juma"]],
    },
    {
      id: "toq",
      what: "toq(n) — n juft EMAS boʻlsa True qaytar (not bilan yoz).",
      solution: "def toq(n):\n    return not n % 2 == 0",
      tail: "print(toq(int(input())))",
      tests: [["7"], ["8"], ["0"], ["13"]],
    },
    // 2026-10-02: uch amal aralash keladigan masalalar
    {
      id: "kabisa", tier: 1,
      what: "kabisa(yil) — yil kabisa boʻlsa True qaytar. Qoida: 4 ga boʻlinadi VA 100 ga boʻlinmaydi, YOKI 400 ga boʻlinadi.",
      solution: "def kabisa(yil):\n    return (yil % 4 == 0 and yil % 100 != 0) or yil % 400 == 0",
      tail: "print(kabisa(int(input())))",
      tests: [["2024"], ["1900"], ["2000"], ["2023"], ["2100"], ["1600"]],
    },
    {
      id: "uchburchak", tier: 2,
      what: "uchburchak(a, b, c) — uchta kesmadan uchburchak yasab boʻlsa True qaytar: har ikki tomon yigʻindisi uchinchisidan katta boʻlishi kerak.",
      solution: "def uchburchak(a, b, c):\n    return a + b > c and a + c > b and b + c > a",
      tail: "print(uchburchak(int(input()), int(input()), int(input())))",
      tests: [["3", "4", "5"], ["1", "2", "3"], ["10", "1", "1"], ["1", "10", "1"], ["1", "1", "10"], ["5", "5", "5"]],
    },
    {
      id: "faqat-bittasi", tier: 2,
      what: "faqat_bittasi(a, b) — ikki sondan AYNAN bittasi juft boʻlsa True qaytar (ikkalasi juft yoki ikkalasi toq boʻlsa — False).",
      solution: "def faqat_bittasi(a, b):\n    return (a % 2 == 0 and not b % 2 == 0) or (not a % 2 == 0 and b % 2 == 0)",
      tail: "print(faqat_bittasi(int(input()), int(input())))",
      tests: [["2", "3"], ["3", "2"], ["2", "4"], ["1", "3"], ["0", "7"]],
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

  const api = { AMALLAR, IFODALAR, IFODALAR_UCH, GAPLAR, GAP_VARIANTLAR, KOD, WRITE, qiymat, jadval, holatlarHammasi,
    solishtirTask, ifodaTask, gapTask, kodTask, writeTask };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
