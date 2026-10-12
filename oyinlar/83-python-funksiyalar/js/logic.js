// «Funksiyalar» (IX sinf, 11-dars): savollar va tekshiruv — sof mantiq, ekransiz.
// Node'da test qilinadi: tests/logic.test.js
// Generatorlar: (prev, rng, tier) — ketma-ket takrorlanmaydi, tier 0/1/2.
// Funksiya yozish va tuzatish masalalari matn bilan emas, CHAQIRUVLAR bilan tekshiriladi:
// bolaning kodidan keyin print(chaqiruv) qo'shiladi va chiqish namunali yechimniki bilan solishtiriladi.
(function (root) {
  "use strict";

  const py = (root.QK && root.QK.python) || require("../../umumiy/js/python/python.js");
  const K = (root.QK && root.QK.kod) || require("../../umumiy/js/kod.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const code = (...lines) => lines.join("\n");

  const MAX_LINES = 4;
  const LIMITS = { maxSteps: 200000, maxOutput: 200 };

  // Python literali: ro'yxat, satr, son
  function lit(v) {
    if (Array.isArray(v)) return "[" + v.map(lit).join(", ") + "]";
    if (typeof v === "string") return JSON.stringify(v);
    return String(v);
  }

  // n ta butun son (takrorlanishi mumkin)
  const ints = (r, n, a, b) => Array.from({ length: n }, () => int(r, a, b));
  // n ta har xil butun son
  function distinct(r, n, a, b) {
    const out = [];
    while (out.length < n) {
      const v = int(r, a, b);
      if (!out.includes(v)) out.push(v);
    }
    return out;
  }

  // Qiyinlik zinasi (QOIDALAR 4.3): 0 — birinchi javob, 1 — o'rta, 2 — oxirgi va qiyin rejim.
  // Zina berilmasa (testlar) — hammasidan teng.
  function zinadan(list, tier, rnd) {
    if (tier == null) return pick(list, rnd);
    const t = Math.max(0, Math.min(2, tier));
    const mos = list.filter((x) => (x.tier || 0) <= t);
    const ayni = mos.filter((x) => (x.tier || 0) === t);
    return ayni.length && rnd() < 0.6 ? pick(ayni, rnd) : pick(mos, rnd);
  }

  function pickNew(make, prev, r) {
    let task = null;
    for (let k = 0; k < 60; k++) {
      task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return task || make(r);
  }

  // ---------- Chaqiruvlar bilan tekshirish ----------
  const trimEnd = (text) => String(text == null ? "" : text).replace(/\s*$/, "");
  const withCalls = (src, calls) => trimEnd(src) + "\n" + calls.map((c) => "print(" + c + ")").join("\n");
  const runCall = (src, call) => py.run(withCalls(src, [call]), LIMITS);

  // Terishdagi xato (QOIDALAR 4.4): urinish sanalmaydi — bola tuzatib, yana ishga tushiradi
  const typing = (error) => !!error && ["SyntaxError", "IndentationError", "NotYet"].includes(error.type);

  function check(task, answer) {
    if (!String(answer == null ? "" : answer).trim()) {
      return { ok: false, kind: "bosh", hint: "Avval kodni yoz, keyin ishga tushir." };
    }
    for (const call of task.tests) {
      const want = runCall(task.solution, call);
      if (want.error) throw new Error("namunali yechim xato berdi: " + call + " — " + want.error.text);
      const got = runCall(answer, call);
      if (got.error) {
        return { ok: false, kind: "xato", error: got.error, call, hint: call + " — " + got.error.text };
      }
      if (!K.sameOutput(want.output, got.output)) {
        const expected = K.normalize(want.output);
        const mine = K.normalize(got.output);
        return {
          ok: false, kind: "chiqish", call, expected, got: mine,
          hint: call + " → kutilgan: " + expected.join(" / ") + ", sendan: " + (mine.join(" / ") || "(hech narsa)"),
        };
      }
    }
    return { ok: true };
  }

  // ---------- Sahnalarda ko'rsatiladigan namunalar (testda har biri bajariladi) ----------
  const SAMPLES = {
    birinchi: {
      code: code("def aniqlik(togri, jami):", "    return togri / jami", "", "a = aniqlik(18, 20)", "print(a)", "print(aniqlik(45, 50))"),
      out: ["0.9", "0.9"],
    },
    parametr: {
      code: code("def masofa(a, b):", "    return abs(a - b)", "", "print(masofa(3, 10))", "print(masofa(10, 3))", "print(masofa(2.5, 4))"),
      out: ["7", "7", "1.5"],
    },
    print_return: {
      code: code("def aniqlik(togri, jami):", "    print(togri / jami)", "", "a = aniqlik(18, 20)", "print(a)"),
      out: ["0.9", "None"],
    },
    buzuq: {
      code: code("def ortacha(royxat):", "    yigindi = sum(royxat)", "    yigindi / len(royxat)", "", "print(ortacha([4, 5, 3]))"),
      out: ["None"],
    },
    sinov: {
      code: code("def eng_katta(royxat):", "    eng = 0", "    for x in royxat:", "        if x > eng:", "            eng = x", "    return eng", "",
        "print(eng_katta([4, 9, 2]))", "print(eng_katta([-5, -2, -9]))"),
      out: ["9", "0"],
    },
    qayta: {
      code: code("def ortacha(royxat):", "    return sum(royxat) / len(royxat)", "",
        "def farq(a, b):", "    return abs(ortacha(a) - ortacha(b))", "",
        "print(ortacha([4, 5, 3]))", "print(farq([4, 5, 3], [2, 4]))"),
      out: ["4.0", "1.0"],
    },
  };

  // ---------- 1-bosqich: natijani ayt ----------
  const zinali = (tier, fn) => Object.assign(fn, { tier });
  // Aniq ikkilik kasrlar — chiqishda 0.30000000000000004 kabi "dum" bo'lmaydi
  const ULUSH = [[3, 4], [1, 2], [1, 4], [7, 8], [5, 8], [3, 8]];

  const READ = [
    (r) => {
      const a = ints(r, 4, 2, 9);
      return code("def ortacha(royxat):", "    return sum(royxat) / len(royxat)", "", "print(ortacha(" + lit(a) + "))");
    },
    (r) => {
      const j1 = pick([10, 20], r), j2 = pick([4, 5], r);
      return code("def aniqlik(togri, jami):", "    return togri / jami", "",
        "print(aniqlik(" + int(r, j1 / 2, j1 - 1) + ", " + j1 + "))", "print(aniqlik(" + int(r, 1, j2) + ", " + j2 + "))");
    },
    (r) => {
      const [a, b] = distinct(r, 2, 1, 15);
      return code("def masofa(a, b):", "    return abs(a - b)", "", "print(masofa(" + a + ", " + b + "), masofa(" + b + ", " + a + "))");
    },
    (r) => {
      const p = [pick([0.6, 0.7, 0.9], r), pick([0.1, 0.2, 0.4], r), 0.5];
      const order = pick([[0, 1, 2], [1, 2, 0], [2, 0, 1]], r).map((k) => p[k]);
      return code("def tasnif(ehtimol):", "    if ehtimol >= 0.5:", '        return "spam"', '    return "oddiy"', "",
        "for p in " + lit(order) + ":", "    print(tasnif(p))");
    },
    (r) => {
      const [q, j] = pick(ULUSH, r);
      return code("def foiz(qism, jami):", "    return 100 * qism / jami", "", "print(foiz(" + q + ", " + j + "))", "print(foiz(" + j + ", " + j + "))");
    },
    // ---- zina 1: print va return farqi, argumentlar tartibi, return to'xtatadi, funksiya ichida funksiya ----
    zinali(1, (r) => {
      const j = pick([10, 20], r);
      return code("def aniqlik(togri, jami):", "    print(togri / jami)", "", "natija = aniqlik(" + int(r, j / 2, j - 1) + ", " + j + ")", "print(natija)");
    }),
    zinali(1, (r) => {
      const [a, b] = distinct(r, 2, 2, 12);
      return code("def xato(bashorat, haqiqiy):", "    return bashorat - haqiqiy", "", "x = " + a, "y = " + b, "print(xato(x, y), xato(y, x))");
    }),
    zinali(1, (r) => {
      const a = int(r, 86, 99), b = int(r, 71, 85), c = int(r, 40, 70);
      const order = pick([[a, b, c], [c, a, b], [b, c, a]], r);
      return code("def baho(ball):", "    if ball >= 86:", "        return 5", "    if ball >= 71:", "        return 4", "    return 3", "",
        "print(baho(" + order[0] + "), baho(" + order[1] + "), baho(" + order[2] + "))");
    }),
    zinali(1, (r) => {
      const a = distinct(r, 4, 1, 30);
      const b = distinct(r, 3, 1, 9).map((x) => -x);
      return code("def eng_katta(royxat):", "    eng = royxat[0]", "    for x in royxat:", "        if x > eng:", "            eng = x", "    return eng", "",
        "print(eng_katta(" + lit(a) + "), eng_katta(" + lit(b) + "))");
    }),
    zinali(1, (r) => {
      const [t, j] = pick(ULUSH, r);
      return code("def aniqlik(togri, jami):", "    return togri / jami", "", "def xato_ulushi(togri, jami):", "    return 1 - aniqlik(togri, jami)", "",
        "print(xato_ulushi(" + t + ", " + j + "))");
    }),
    zinali(1, (r) => {
      const a = ints(r, 4, 2, 9), b = ints(r, 2, 2, 9);
      return code("def ortacha(royxat):", "    return sum(royxat) / len(royxat)", "", "a = ortacha(" + lit(a) + ")", "b = ortacha(" + lit(b) + ")", "print(a, b, a > b)");
    }),
    // ---- zina 2: lokal o'zgaruvchi, ro'yxat parametri, erta return, Evklid masofasi, eng yaqin namuna ----
    zinali(2, (r) => {
      const p = pick([0.6, 0.7], r);
      return code("chegara = 0.5", "", "def tasnif(ehtimol):", "    chegara = 0.8", "    if ehtimol >= chegara:", "        return 1", "    return 0", "",
        "print(tasnif(" + p + "), chegara)");
    }),
    zinali(2, (r) => {
      const a = ints(r, 2, 3, 5);
      return code("def qosh(royxat, x):", "    royxat.append(x)", "    return len(royxat)", "", "baholar = " + lit(a), "n = qosh(baholar, " + int(r, 2, 5) + ")", "print(n, baholar)");
    }),
    zinali(2, (r) => {
      const javob = ints(r, 4, 0, 1);
      const bashorat = javob.slice();
      const k = int(r, 1, 3);
      bashorat[k] = 1 - bashorat[k];
      if (k < 3 && r() < 0.5) bashorat[3] = 1 - bashorat[3];
      return code("def birinchi_xato(bashorat, javob):", "    for i in range(len(javob)):", "        if bashorat[i] != javob[i]:", "            return i", "    return -1", "",
        "print(birinchi_xato(" + lit(bashorat) + ", " + lit(javob) + "))", "print(birinchi_xato([1, 0], [1, 0]))");
    }),
    zinali(2, (r) => {
      const [dx, dy] = pick([[3, 4], [4, 3], [6, 8], [5, 12]], r);
      const x = int(r, 0, 4), y = int(r, 0, 4), d = int(r, 2, 9);
      return code("def masofa(a, b):", "    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5", "",
        "print(masofa(" + lit([x, y]) + ", " + lit([x + dx, y + dy]) + "))", "print(masofa(" + lit([x, y]) + ", " + lit([x, y + d]) + "))");
    }),
    zinali(2, (r) => {
      // Eng yaqin namuna yagona bo'lsin
      for (;;) {
        const n = distinct(r, 3, 1, 20);
        const x = int(r, 1, 20);
        const d = n.map((v) => Math.abs(v - x)).sort((p, q) => p - q);
        if (d[0] === d[1] || n.includes(x)) continue;
        return code("def masofa(a, b):", "    return abs(a - b)", "", "def eng_yaqin(x, namunalar):", "    eng = namunalar[0]", "    for n in namunalar:",
          "        if masofa(x, n) < masofa(x, eng):", "            eng = n", "    return eng", "", "print(eng_yaqin(" + x + ", " + lit(n) + "))");
      }
    }),
    zinali(2, (r) => {
      const javob = ints(r, 4, 0, 1);
      const bashorat = javob.map((v) => (r() < 0.4 ? 1 - v : v));
      return code("def aniqlik(bashorat, javob):", "    togri = 0", "    for i in range(len(javob)):", "        if bashorat[i] == javob[i]:", "            togri += 1",
        "    return togri / len(javob)", "", "print(aniqlik(" + lit(bashorat) + ", " + lit(javob) + "))");
    }),
  ];

  // Chiqish qisqa va "dum"siz (0.30000000000000004 kabi kasrlar chiqmaydi)
  function safeRead(src) {
    const r = py.run(src, LIMITS);
    if (r.error || r.output.length === 0 || r.output.length > MAX_LINES) return null;
    if (r.output.some((line) => /\.\d{4,}/.test(line))) return null;
    return r;
  }

  function readTask(prev, rng, tier) {
    const rr = rng || Math.random;
    return pickNew((rnd) => {
      const src = zinadan(READ, tier, rnd)(rnd);
      return safeRead(src) ? { id: "natija:" + src, type: "natija", code: src, solution: src } : null;
    }, prev, rr);
  }

  // ---------- 2-bosqich: funksiyani tuzat ----------
  // code — xatoli funksiya, solution — tuzatilgani, calls(rnd) — sinov chaqiruvlari (birinchi ikkitasi ekranda ko'rinadi)
  const FIX = [
    {
      id: "ikki-nuqta", tier: 0,
      what: "aniqlik(togri, jami) — toʻgʻri javoblar ulushini qaytaradi: togri / jami.",
      why: "def satrining oxiriga qara — funksiya sarlavhasi qanday belgi bilan tugaydi",
      code: code("def aniqlik(togri, jami)", "    return togri / jami"),
      solution: code("def aniqlik(togri, jami):", "    return togri / jami"),
      calls: (r) => ["aniqlik(18, 20)", "aniqlik(3, 4)", "aniqlik(0, 5)", "aniqlik(" + int(r, 1, 7) + ", 8)"],
    },
    {
      id: "return-yoq", tier: 0,
      what: "ortacha(royxat) — roʻyxatdagi sonlarning oʻrta arifmetigini qaytaradi.",
      why: "natija hisoblanadi, lekin funksiyadan tashqariga chiqmaydi — None qayerdan kelganini oʻyla",
      code: code("def ortacha(royxat):", "    yigindi = sum(royxat)", "    yigindi / len(royxat)"),
      solution: code("def ortacha(royxat):", "    yigindi = sum(royxat)", "    return yigindi / len(royxat)"),
      calls: (r) => ["ortacha([4, 5, 3])", "ortacha(" + lit(ints(r, 4, 1, 9)) + ")", "ortacha([7])", "ortacha([-2, 2])"],
    },
    {
      id: "print-return", tier: 0,
      what: "masofa(a, b) — ikki son orasidagi masofani qaytaradi: |a − b|.",
      why: "chiqishdagi ortiqcha None ga qara: funksiya qiymatni ekranga yozadi, lekin qaytarmaydi",
      code: code("def masofa(a, b):", "    print(abs(a - b))"),
      solution: code("def masofa(a, b):", "    return abs(a - b)"),
      calls: (r) => ["masofa(3, 10)", "masofa(10, 3)", "masofa(" + int(r, -9, -1) + ", " + int(r, 1, 9) + ")", "masofa(6, 6)"],
    },
    {
      id: "otstup", tier: 0,
      what: "foiz(qism, jami) — qism jamining necha foizi ekanini qaytaradi: 100 * qism / jami.",
      why: "funksiya tanasi def dan 4 boʻshliq ichkarida yoziladi",
      code: code("def foiz(qism, jami):", "return 100 * qism / jami"),
      solution: code("def foiz(qism, jami):", "    return 100 * qism / jami"),
      calls: () => ["foiz(3, 4)", "foiz(1, 2)", "foiz(5, 5)", "foiz(0, 8)"],
    },
    {
      id: "nom", tier: 0,
      what: "aniqlik(togri, jami) — toʻgʻri javoblar ulushini qaytaradi. Sinov uni aynan shu nom bilan chaqiradi.",
      why: "NameError — chaqiruvdagi nom bilan def dagi nomni harfma-harf solishtir",
      code: code("def aniqlk(togri, jami):", "    return togri / jami"),
      solution: code("def aniqlik(togri, jami):", "    return togri / jami"),
      calls: (r) => ["aniqlik(9, 10)", "aniqlik(1, 4)", "aniqlik(" + int(r, 1, 4) + ", 5)", "aniqlik(8, 8)"],
    },
    {
      id: "tartib", tier: 1,
      what: "aniqlik(togri, jami) — toʻgʻri javoblar ulushini qaytaradi; natija 0 dan 1 gacha boʻladi.",
      why: "natija 1 dan katta chiqyapti — nima nimaga boʻlinayotganiga qara",
      code: code("def aniqlik(togri, jami):", "    return jami / togri"),
      solution: code("def aniqlik(togri, jami):", "    return togri / jami"),
      calls: (r) => ["aniqlik(4, 5)", "aniqlik(1, 2)", "aniqlik(0, 5)", "aniqlik(" + int(r, 1, 3) + ", 4)", "aniqlik(10, 10)"],
    },
    {
      id: "tashqi", tier: 1,
      what: "ortacha(royxat) — oʻziga berilgan roʻyxatning oʻrtachasini qaytaradi (qaysi roʻyxat berilsa, oʻshaniki).",
      why: "ikkinchi chaqiruvda ham birinchi javob chiqyapti — funksiya parametrni ishlatyaptimi yoki tashqi oʻzgaruvchinimi",
      code: code("baholar = [5, 4, 3]", "", "def ortacha(royxat):", "    return sum(baholar) / len(baholar)"),
      solution: code("baholar = [5, 4, 3]", "", "def ortacha(royxat):", "    return sum(royxat) / len(royxat)"),
      calls: (r) => ["ortacha(baholar)", "ortacha([2, 4])", "ortacha(" + lit(ints(r, 4, 6, 9)) + ")", "ortacha([10])"],
    },
    {
      id: "erta-return", tier: 1,
      what: "yigindi(royxat) — roʻyxatdagi hamma sonlar yigʻindisini qaytaradi.",
      why: "faqat birinchi element qaytyapti — return qaysi otstupda turganiga qara",
      code: code("def yigindi(royxat):", "    s = 0", "    for x in royxat:", "        s += x", "        return s"),
      solution: code("def yigindi(royxat):", "    s = 0", "    for x in royxat:", "        s += x", "    return s"),
      calls: (r) => ["yigindi([4, 5, 3])", "yigindi(" + lit(ints(r, 4, 1, 9)) + ")", "yigindi([7])", "yigindi([-1, 1, 6])"],
    },
    {
      id: "abs-yoq", tier: 1,
      what: "masofa(a, b) — ikki son orasidagi masofani qaytaradi. Masofa manfiy boʻlmaydi.",
      why: "a < b boʻlgan chaqiruvni sinab koʻr — natija ishorasiga qara",
      code: code("def masofa(a, b):", "    return a - b"),
      solution: code("def masofa(a, b):", "    return abs(a - b)"),
      calls: (r) => ["masofa(10, 3)", "masofa(3, 10)", "masofa(" + int(r, 1, 5) + ", " + int(r, 6, 12) + ")", "masofa(-4, -1)", "masofa(5, 5)"],
    },
    {
      id: "eng-nol", tier: 2,
      what: "eng_katta(royxat) — roʻyxatdagi eng katta sonni qaytaradi (roʻyxatda manfiy sonlar ham boʻlishi mumkin, masalan qishki harorat).",
      why: "hamma qiymat manfiy boʻlsa nima qaytadi? Boshlangʻich qiymatga qara",
      code: code("def eng_katta(royxat):", "    eng = 0", "    for x in royxat:", "        if x > eng:", "            eng = x", "    return eng"),
      solution: code("def eng_katta(royxat):", "    eng = royxat[0]", "    for x in royxat:", "        if x > eng:", "            eng = x", "    return eng"),
      calls: (r) => ["eng_katta([4, 9, 2])", "eng_katta([-5, -2, -9])", "eng_katta(" + lit(distinct(r, 4, 1, 40)) + ")", "eng_katta([-7])", "eng_katta([0, -3])"],
    },
    {
      id: "qotgan-son", tier: 2,
      what: "ortacha(royxat) — istalgan uzunlikdagi roʻyxatning oʻrtachasini qaytaradi.",
      why: "5 ta elementli roʻyxatda toʻgʻri, boshqasida xato — boʻluvchi qayerdan olinganiga qara",
      code: code("def ortacha(royxat):", "    return sum(royxat) / 5"),
      solution: code("def ortacha(royxat):", "    return sum(royxat) / len(royxat)"),
      calls: (r) => ["ortacha([4, 5, 3, 5, 3])", "ortacha([4, 6])", "ortacha(" + lit(ints(r, 4, 1, 9)) + ")", "ortacha([10])"],
    },
    {
      id: "sanash-teng", tier: 2,
      what: "sanash(royxat, qiymat) — qiymat roʻyxatda necha marta uchrashini qaytaradi.",
      why: "javob hech qachon 1 dan oshmayapti — hisoblagich qanday oʻzgarayotganiga qara",
      code: code("def sanash(royxat, qiymat):", "    soni = 0", "    for x in royxat:", "        if x == qiymat:", "            soni = 1", "    return soni"),
      solution: code("def sanash(royxat, qiymat):", "    soni = 0", "    for x in royxat:", "        if x == qiymat:", "            soni += 1", "    return soni"),
      calls: () => ['sanash(["it", "mushuk", "it", "it"], "it")', 'sanash(["it", "mushuk"], "mushuk")', "sanash([1, 0, 1, 1, 0], 1)", 'sanash(["it"], "qush")', "sanash([5, 5], 5)"],
    },
    {
      id: "oxirgi", tier: 2,
      what: "eng_katta(royxat) — roʻyxatdagi eng katta sonni qaytaradi.",
      why: "eng katta son oxirida tursa topilmayapti — sikl nechta elementni koʻrib chiqadi",
      code: code("def eng_katta(royxat):", "    eng = royxat[0]", "    for i in range(len(royxat) - 1):", "        if royxat[i] > eng:", "            eng = royxat[i]", "    return eng"),
      solution: code("def eng_katta(royxat):", "    eng = royxat[0]", "    for i in range(len(royxat)):", "        if royxat[i] > eng:", "            eng = royxat[i]", "    return eng"),
      calls: (r) => {
        const a = distinct(r, 3, 1, 20);
        return ["eng_katta([4, 9, 2])", "eng_katta([4, 2, 9])", "eng_katta(" + lit(a.concat([25 + int(r, 0, 9)])) + ")", "eng_katta([3])", "eng_katta([-1, -5, 0])"];
      },
    },
    {
      id: "chegara", tier: 2,
      what: 'tasnif(ehtimol, chegara) — ehtimol chegaradan kichik boʻlmasa "spam", aks holda "oddiy" qaytaradi.',
      why: "ehtimol chegaraga aynan teng boʻlgan chaqiruvni sinab koʻr",
      code: code("def tasnif(ehtimol, chegara):", "    if ehtimol > chegara:", '        return "spam"', '    return "oddiy"'),
      solution: code("def tasnif(ehtimol, chegara):", "    if ehtimol >= chegara:", '        return "spam"', '    return "oddiy"'),
      calls: () => ["tasnif(0.9, 0.5)", "tasnif(0.5, 0.5)", "tasnif(0.2, 0.5)", "tasnif(0.8, 0.8)", "tasnif(0.7, 0.8)"],
    },
    {
      id: "zanjir", tier: 2,
      what: "farq(a, b) — ikki roʻyxat oʻrtachalari orasidagi masofani qaytaradi; u ortacha(royxat) dan foydalanadi.",
      why: "xato farq ichida chiqyapti, lekin sabab boshqa funksiyada — ortacha nima qaytaradi",
      code: code("def ortacha(royxat):", "    natija = sum(royxat) / len(royxat)", "", "def farq(a, b):", "    return abs(ortacha(a) - ortacha(b))"),
      solution: code("def ortacha(royxat):", "    natija = sum(royxat) / len(royxat)", "    return natija", "", "def farq(a, b):", "    return abs(ortacha(a) - ortacha(b))"),
      calls: (r) => ["farq([4, 5, 3], [2, 4])", "farq([1, 3], [6, 8])", "farq(" + lit(ints(r, 2, 1, 9)) + ", " + lit(ints(r, 4, 1, 9)) + ")", "farq([5], [5])"],
    },
  ];

  // ---------- 3-bosqich: o'zing yoz ----------
  // starter — muharrirda tayyor turadigan sarlavha; calls(rnd) — sinov chaqiruvlari (birinchi ikkitasi ko'rinadi)
  const WRITE = [
    {
      id: "aniqlik", tier: 0,
      what: "aniqlik(togri, jami) funksiyasini yoz: toʻgʻri javoblar ulushini qaytarsin — togri / jami.",
      starter: "def aniqlik(togri, jami):\n    ",
      solution: code("def aniqlik(togri, jami):", "    return togri / jami"),
      calls: (r) => ["aniqlik(18, 20)", "aniqlik(3, 4)", "aniqlik(0, 5)", "aniqlik(7, 7)", "aniqlik(" + int(r, 1, 9) + ", 10)", "aniqlik(1, 8)"],
    },
    {
      id: "masofa", tier: 0,
      what: "masofa(a, b) funksiyasini yoz: ikki son orasidagi masofani qaytarsin (manfiy boʻlmaydi).",
      starter: "def masofa(a, b):\n    ",
      solution: code("def masofa(a, b):", "    return abs(a - b)"),
      calls: (r) => ["masofa(3, 10)", "masofa(10, 3)", "masofa(-4, 5)", "masofa(6, 6)", "masofa(2.5, 1)", "masofa(" + int(r, 1, 20) + ", " + int(r, 21, 40) + ")"],
    },
    {
      id: "ortacha", tier: 0,
      what: "ortacha(royxat) funksiyasini yoz: roʻyxatdagi sonlarning oʻrta arifmetigini qaytarsin (yigʻindi / soni).",
      starter: "def ortacha(royxat):\n    ",
      solution: code("def ortacha(royxat):", "    return sum(royxat) / len(royxat)"),
      calls: (r) => ["ortacha([4, 5, 3])", "ortacha(" + lit(ints(r, 4, 1, 9)) + ")", "ortacha([7])", "ortacha([-2, 2])", "ortacha(" + lit(ints(r, 5, 10, 30)) + ")", "ortacha([0.5, 1.5])"],
    },
    {
      id: "foiz", tier: 0,
      what: "foiz(qism, jami) funksiyasini yoz: qism jamining necha foizi ekanini qaytarsin — 100 * qism / jami.",
      starter: "def foiz(qism, jami):\n    ",
      solution: code("def foiz(qism, jami):", "    return 100 * qism / jami"),
      // Choraklar: 100 * q / j va q / j * 100 bir xil chiqadi (testda tekshiriladi)
      calls: () => ["foiz(3, 4)", "foiz(1, 2)", "foiz(5, 5)", "foiz(0, 8)", "foiz(1, 4)", "foiz(6, 8)"],
    },
    {
      id: "kvadrat-xato", tier: 0,
      what: "kvadrat_xato(bashorat, haqiqiy) funksiyasini yoz: bashorat va haqiqiy qiymat ayirmasining kvadratini qaytarsin.",
      starter: "def kvadrat_xato(bashorat, haqiqiy):\n    ",
      solution: code("def kvadrat_xato(bashorat, haqiqiy):", "    return (bashorat - haqiqiy) ** 2"),
      calls: (r) => ["kvadrat_xato(7, 10)", "kvadrat_xato(10, 7)", "kvadrat_xato(5, 5)", "kvadrat_xato(-2, 3)", "kvadrat_xato(" + int(r, 1, 9) + ", " + int(r, 10, 15) + ")", "kvadrat_xato(1.5, 1)"],
    },
    {
      id: "eng-katta", tier: 1,
      what: "eng_katta(royxat) funksiyasini yoz: roʻyxatdagi eng katta sonni qaytarsin. Roʻyxatda manfiy sonlar ham boʻlishi mumkin.",
      starter: "def eng_katta(royxat):\n    ",
      solution: code("def eng_katta(royxat):", "    eng = royxat[0]", "    for x in royxat:", "        if x > eng:", "            eng = x", "    return eng"),
      calls: (r) => ["eng_katta([4, 9, 2])", "eng_katta([-5, -2, -9])", "eng_katta([3])", "eng_katta([1, 2, 8])", "eng_katta(" + lit(distinct(r, 5, -20, 40)) + ")", "eng_katta([6, 6])"],
    },
    {
      id: "sanash", tier: 1,
      what: "sanash(royxat, qiymat) funksiyasini yoz: qiymat roʻyxatda necha marta uchrashini qaytarsin.",
      starter: "def sanash(royxat, qiymat):\n    ",
      solution: code("def sanash(royxat, qiymat):", "    soni = 0", "    for x in royxat:", "        if x == qiymat:", "            soni += 1", "    return soni"),
      calls: (r) => ['sanash(["it", "mushuk", "it"], "it")', "sanash([1, 0, 1, 1], 0)", 'sanash(["it"], "qush")', "sanash([], 5)", "sanash(" + lit(ints(r, 6, 0, 1)) + ", 1)", "sanash([5, 5, 5], 5)"],
    },
    {
      id: "tasnif", tier: 1,
      what: 'tasnif(ehtimol, chegara) funksiyasini yoz: ehtimol chegaradan kichik boʻlmasa "spam", aks holda "oddiy" qaytarsin.',
      starter: "def tasnif(ehtimol, chegara):\n    ",
      solution: code("def tasnif(ehtimol, chegara):", "    if ehtimol >= chegara:", '        return "spam"', '    return "oddiy"'),
      calls: () => ["tasnif(0.9, 0.5)", "tasnif(0.2, 0.5)", "tasnif(0.5, 0.5)", "tasnif(0.7, 0.8)", "tasnif(0.8, 0.8)", "tasnif(0.1, 0)"],
    },
    {
      id: "oraliq", tier: 1,
      what: "oraliq(royxat) funksiyasini yoz: eng katta va eng kichik qiymat ayirmasini qaytarsin.",
      starter: "def oraliq(royxat):\n    ",
      solution: code("def oraliq(royxat):", "    return max(royxat) - min(royxat)"),
      calls: (r) => ["oraliq([4, 9, 2])", "oraliq([7])", "oraliq([-5, 5])", "oraliq(" + lit(distinct(r, 5, 1, 50)) + ")", "oraliq([3, 3, 3])", "oraliq([-8, -2])"],
    },
    {
      id: "masofa-2d", tier: 2,
      what: "masofa(a, b) funksiyasini yoz: a va b — tekislikdagi nuqtalar, [x, y] roʻyxatlari. Evklid masofasini qaytarsin: ayirmalar kvadratlari yigʻindisining ildizi (ildiz — ** 0.5).",
      starter: "def masofa(a, b):\n    ",
      solution: code("def masofa(a, b):", "    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5"),
      calls: (r) => {
        const x = int(r, 1, 5), y = int(r, 1, 5);
        return ["masofa([0, 0], [3, 4])", "masofa([1, 2], [1, 7])", "masofa([5, 5], [5, 5])", "masofa(" + lit([x, y]) + ", " + lit([x + 6, y + 8]) + ")", "masofa([4, 1], [0, 4])", "masofa([-5, 0], [0, 12])"];
      },
    },
    {
      id: "eng-yaqin", tier: 2,
      what: "masofa(a, b) va eng_yaqin(x, namunalar) funksiyalarini yoz: ikkinchisi namunalar roʻyxatidan x ga eng yaqin sonni qaytarsin va masofa dan foydalansin.",
      starter: "def masofa(a, b):\n    return abs(a - b)\n\ndef eng_yaqin(x, namunalar):\n    ",
      solution: code("def masofa(a, b):", "    return abs(a - b)", "", "def eng_yaqin(x, namunalar):", "    eng = namunalar[0]", "    for n in namunalar:",
        "        if masofa(x, n) < masofa(x, eng):", "            eng = n", "    return eng"),
      calls: (r) => {
        const base = int(r, 20, 30);
        return ["eng_yaqin(7, [2, 6, 11])", "eng_yaqin(10, [1, 20, 12])", "eng_yaqin(5, [9])", "eng_yaqin(-3, [4, -1, -10])", "eng_yaqin(" + base + ", " + lit([base - 7, base + 2, base + 5]) + ")", "eng_yaqin(8, [1, 2, 8])"];
      },
    },
    {
      id: "aniqlik-royxat", tier: 2,
      what: "aniqlik(bashorat, javob) funksiyasini yoz: ikki roʻyxat bir xil uzunlikda. Bir xil oʻrindagi elementlari mos kelganlar ulushini qaytarsin (moslar soni / jami).",
      starter: "def aniqlik(bashorat, javob):\n    ",
      solution: code("def aniqlik(bashorat, javob):", "    togri = 0", "    for i in range(len(javob)):", "        if bashorat[i] == javob[i]:", "            togri += 1", "    return togri / len(javob)"),
      calls: (r) => {
        const j = ints(r, 5, 0, 1);
        const b = j.map((v) => (r() < 0.4 ? 1 - v : v));
        return ["aniqlik([1, 0, 1, 1], [1, 1, 1, 0])", 'aniqlik(["it", "it"], ["it", "mushuk"])', "aniqlik([1, 0], [1, 0])", "aniqlik([0, 0, 0, 0], [1, 1, 1, 1])", "aniqlik(" + lit(b) + ", " + lit(j) + ")", "aniqlik([1], [1])"];
      },
    },
    {
      id: "ortachadan-katta", tier: 2,
      what: "ortacha(royxat) va ortachadan_katta(royxat) funksiyalarini yoz: ikkinchisi oʻrtachadan qatʼiy katta elementlar sonini qaytarsin va ortacha dan foydalansin.",
      starter: "def ortacha(royxat):\n    return sum(royxat) / len(royxat)\n\ndef ortachadan_katta(royxat):\n    ",
      solution: code("def ortacha(royxat):", "    return sum(royxat) / len(royxat)", "", "def ortachadan_katta(royxat):", "    m = ortacha(royxat)", "    soni = 0",
        "    for x in royxat:", "        if x > m:", "            soni += 1", "    return soni"),
      calls: (r) => ["ortachadan_katta([4, 5, 3])", "ortachadan_katta([1, 1, 10])", "ortachadan_katta([5, 5, 5])", "ortachadan_katta([7])", "ortachadan_katta(" + lit(ints(r, 6, 1, 20)) + ")", "ortachadan_katta([-4, -2, 0, 2])"],
    },
    {
      id: "ortacha-xato", tier: 2,
      what: "ortacha_xato(bashorat, haqiqiy) funksiyasini yoz: ikki roʻyxat bir xil uzunlikda. Mos elementlar orasidagi masofalarning (|ayirma|) oʻrtachasini qaytarsin.",
      starter: "def ortacha_xato(bashorat, haqiqiy):\n    ",
      solution: code("def ortacha_xato(bashorat, haqiqiy):", "    s = 0", "    for i in range(len(haqiqiy)):", "        s += abs(bashorat[i] - haqiqiy[i])", "    return s / len(haqiqiy)"),
      calls: (r) => ["ortacha_xato([3, 5], [5, 5])", "ortacha_xato([10, 2, 7, 1], [8, 4, 7, 3])", "ortacha_xato([4], [9])", "ortacha_xato([1, 2], [1, 2])", "ortacha_xato(" + lit(ints(r, 4, 1, 9)) + ", " + lit(ints(r, 4, 1, 9)) + ")", "ortacha_xato([-2, 2], [2, -2])"],
    },
  ];

  const SHOWN = 2; // ekranda ko'rinadigan sinov chaqiruvlari soni

  function bankTask(bank, type, prev, rng, tier) {
    const rr = rng || Math.random;
    return pickNew((rnd) => {
      const kind = zinadan(bank, tier, rnd);
      const tests = kind.calls(rnd);
      return {
        id: type + ":" + kind.id, type, kind: kind.id, tier: kind.tier,
        what: kind.what, why: kind.why,
        code: kind.code || kind.starter, solution: kind.solution,
        show: tests.slice(0, SHOWN), tests,
      };
    }, prev, rr);
  }

  const fixTask = (prev, rng, tier) => bankTask(FIX, "tuzat", prev, rng, tier);
  const writeTask = (prev, rng, tier) => bankTask(WRITE, "yoz", prev, rng, tier);

  const api = { MAX_LINES, SHOWN, SAMPLES, READ, FIX, WRITE, lit, withCalls, typing, check, readTask, fixTask, writeTask };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
