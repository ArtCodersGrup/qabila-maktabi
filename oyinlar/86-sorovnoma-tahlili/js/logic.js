// «Amaliy: soʻrovnoma tahlili» (IX sinf, 14-dars): mini loyiha masalalari va tekshiruv — sof mantiq, ekransiz.
// Node'da test qilinadi: tests/logic.test.js
// Generatorlar: (prev, rng, tier) — ketma-ket takrorlanmaydi, tier 0/1/2.
// Tekshiruv matnni solishtirmaydi — bolaning kodi bir nechta YASHIRIN ma'lumot to'plamida bajariladi:
//   1- va 3-bosqich: kod boshidagi «nom = [...]» satrlari boshqa to'plam bilan almashtiriladi (swapData);
//   2-bosqich: funksiya har xil ro'yxatlar bilan chaqiriladi (print(chaqiruv)).
// Har holda chiqish namunali yechimniki bilan solishtiriladi.
(function (root) {
  "use strict";

  const py = (root.QK && root.QK.python) || require("../../umumiy/js/python/python.js");
  const K = (root.QK && root.QK.kod) || require("../../umumiy/js/kod.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const code = (...lines) => lines.join("\n");
  const LIMITS = { maxSteps: 300000, maxOutput: 200 };

  function lit(v) {
    if (Array.isArray(v)) return "[" + v.map(lit).join(", ") + "]";
    if (typeof v === "string") return JSON.stringify(v);
    return String(v);
  }
  const ints = (r, n, a, b) => Array.from({ length: n }, () => int(r, a, b));
  function shuffle(list, r) {
    const a = list.slice();
    for (let k = a.length - 1; k > 0; k--) {
      const j = Math.floor(r() * (k + 1));
      [a[k], a[j]] = [a[j], a[k]];
    }
    return a;
  }
  // list dan n ta har xil element
  const sample = (list, n, r) => shuffle(list, r).slice(0, n);

  function zinadan(list, tier, rnd) {
    if (tier == null) return pick(list, rnd);
    const t = Math.max(0, Math.min(2, tier));
    const mos = list.filter((x) => (x.tier || 0) <= t);
    const ayni = mos.filter((x) => (x.tier || 0) === t);
    return ayni.length && rnd() < 0.6 ? pick(ayni, rnd) : pick(mos, rnd);
  }

  // Ketma-ket ikki masala bir xil turda bo'lmaydi (ma'lumot boshqa bo'lsa ham)
  function pickNew(make, prev, r) {
    let task = null;
    for (let k = 0; k < 60; k++) {
      task = make(r);
      if (task && (!prev || task.kind !== prev.kind)) return task;
    }
    return task;
  }

  // ---------- So'rovnoma maydonlari ----------
  // lo…hi — to'g'ri qiymat oralig'i (ikkalasi ham kiradi); gen — odatdagi javoblar; bad — uchraydigan xato qiymatlar
  const FIELDS = {
    yoshlar: { name: "yoshlar", nima: "yosh", lo: 10, hi: 18, gen: [13, 16], bad: [-4, 0, 150, 99, 41, -15, 5, 115] },
    uyqu_soatlari: { name: "uyqu_soatlari", nima: "uyqu soati", lo: 1, hi: 24, gen: [5, 10], bad: [-2, 0, 30, 99, -8, 48, 77] },
    baholar: { name: "baholar", nima: "baho", lo: 1, hi: 5, gen: [3, 5], bad: [0, 6, 55, -4, 10, 44, 33] },
    boylar: { name: "boylar", nima: "boʻy (sm)", lo: 100, hi: 220, gen: [150, 185], bad: [0, 17, 1650, -160, 999, 16, 1700] },
    ekran_vaqti: { name: "ekran_vaqti", nima: "kunlik ekran vaqti (soat)", lo: 0, hi: 24, gen: [1, 8], bad: [-1, 25, 40, -5, 100, 60] },
  };
  const FANLAR = ["matematika", "fizika", "informatika", "tarix", "biologiya", "kimyo", "adabiyot", "geografiya"];
  const oraliqMatn = (f) => f.lo + " dan " + f.hi + " gacha (" + f.lo + " va " + f.hi + " ham kiradi)";

  // Sonli javoblar: nGood ta to'g'ri + nBad ta xato qiymat, aralash tartibda (birinchi element doim to'g'ri — o'qishga qulay)
  function mixed(r, f, nGood, nBad) {
    const good = ints(r, nGood, f.gen[0], f.gen[1]);
    const bad = sample(f.bad, nBad, r);
    const rest = shuffle(good.slice(1).concat(bad), r);
    return [good[0]].concat(rest);
  }
  // Chegaradagi qiymatlar: lo va hi — to'g'ri, lo−1 va hi+1 — xato («>» va «>=» farqini ushlaydi)
  const boundary = (r, f) => shuffle([f.lo, f.hi, f.lo - 1, f.hi + 1].concat(ints(r, 2, f.gen[0], f.gen[1])), r);
  const allBad = (r, f) => sample(f.bad, 3, r);
  const allGood = (r, f) => ints(r, 4, f.gen[0], f.gen[1]);

  // Sevimli fan javoblari: counts — har fan necha marta; blanks — bo'sh javoblar ("" va boshqalar)
  function votes(r, counts, blanks) {
    const fanlar = sample(FANLAR, counts.length, r);
    const out = [];
    counts.forEach((n, k) => { for (let j = 0; j < n; j++) out.push(fanlar[k]); });
    return shuffle(out.concat(blanks || []), r);
  }

  // Bir xil javobning har xil yozilishi: "fizika" → "FIZIKA" / "Fizika" / "fizika"
  function registr(s, r) {
    const p = r();
    if (!s) return s;
    return p < 0.3 ? s.toUpperCase() : p < 0.6 ? s[0].toUpperCase() + s.slice(1) : s;
  }

  // ---------- Ma'lumot satrlarini almashtirish ----------
  const dataLines = (data) => Object.keys(data).map((name) => name + " = " + lit(data[name])).join("\n");

  // Kod boshidagi «nom = [...]» satrlarini boshqa to'plam bilan almashtiradi. Satr topilmasa — null.
  function swapData(src, data) {
    let out = String(src == null ? "" : src);
    for (const name of Object.keys(data)) {
      const re = new RegExp("^" + name + "[ \\t]*=[ \\t]*\\[[^\\n]*$", "m");
      if (!re.test(out)) return null;
      out = out.replace(re, () => name + " = " + lit(data[name]));
    }
    return out;
  }

  const run = (src) => py.run(src, LIMITS);
  const typing = (error) => !!error && ["SyntaxError", "IndentationError", "NotYet"].includes(error.type);

  // 1- va 3-bosqich: har to'plamda bajarib, namunali yechim chiqishi bilan solishtirish
  function checkData(task, answer) {
    const src = String(answer == null ? "" : answer);
    if (!src.trim()) return { ok: false, kind: "bosh", hint: "Avval kodni yoz, keyin ishga tushir." };
    for (let k = 0; k < task.tests.length; k++) {
      const data = task.tests[k];
      const mine = swapData(src, data);
      if (mine === null) {
        return { ok: false, kind: "malumot", hint: "Maʼlumot satri («" + Object.keys(data).join(" = [...]», «") + " = [...]») joyida va bir satrda tursin — sinov uni boshqa maʼlumot bilan almashtiradi." };
      }
      const want = run(swapData(task.solution, data));
      if (want.error) throw new Error("namunali yechim xato berdi: " + want.error.text);
      const got = run(mine);
      const qayerda = k === 0 ? "Koʻrinib turgan maʼlumotda" : "Yashirin sinovda (" + dataLines(data).replace(/\n/g, "; ") + ")";
      if (got.error) return { ok: false, kind: "xato", error: got.error, data, hidden: k > 0, hint: qayerda + ": " + got.error.text };
      if (!K.sameOutput(want.output, got.output)) {
        const expected = K.normalize(want.output);
        const lines = K.normalize(got.output);
        return {
          ok: false, kind: "chiqish", data, hidden: k > 0, expected, got: lines,
          hint: qayerda + " kutilgan: " + expected.join(" / ") + "; sendan: " + (lines.join(" / ") || "(hech narsa)"),
        };
      }
    }
    return { ok: true };
  }

  // 2-bosqich: funksiyani chaqiruvlar bilan tekshirish
  const trimEnd = (text) => String(text == null ? "" : text).replace(/\s*$/, "");
  const withCalls = (src, calls) => trimEnd(src) + "\n" + calls.map((c) => "print(" + c + ")").join("\n");

  function checkCalls(task, answer) {
    if (!String(answer == null ? "" : answer).trim()) return { ok: false, kind: "bosh", hint: "Avval kodni yoz, keyin ishga tushir." };
    for (const call of task.tests) {
      const want = run(withCalls(task.solution, [call]));
      if (want.error) throw new Error("namunali yechim xato berdi: " + call + " — " + want.error.text);
      const got = run(withCalls(answer, [call]));
      if (got.error) return { ok: false, kind: "xato", error: got.error, call, hint: call + " — " + got.error.text };
      if (!K.sameOutput(want.output, got.output)) {
        const expected = K.normalize(want.output);
        const lines = K.normalize(got.output);
        return { ok: false, kind: "chiqish", call, expected, got: lines, hint: call + " → kutilgan: " + expected.join(" / ") + ", sendan: " + (lines.join(" / ") || "(hech narsa)") };
      }
    }
    return { ok: true };
  }

  const check = (task, answer) => (task.type === "funksiya" ? checkCalls(task, answer) : checkData(task, answer));

  // Ma'lumot masalasini yig'ish: tests[0] — ekranda ko'rinadigan to'plam
  function dataTask(type, kind, tier, o) {
    const visible = o.tests[0];
    const starter = dataLines(visible) + "\n" + (o.prefix ? "\n" + o.prefix + "\n" : "") + "\n";
    const solution = dataLines(visible) + "\n" + (o.prefix ? "\n" + o.prefix + "\n" : "") + "\n" + o.body;
    const task = { id: type + ":" + kind + ":" + Object.keys(visible).join("+"), type, kind, tier, what: o.what, question: o.question, tip: o.tip, starter, solution, tests: o.tests };
    const r = run(solution);
    if (r.error) throw new Error(kind + ": namunali yechim xato berdi — " + r.error.text);
    task.lines = r.output; // «Shunday chiqishi kerak» — ko'rinadigan to'plam uchun
    return task;
  }

  // ---------- Sahnalarda ko'rsatiladigan namunalar (testda har biri bajariladi) ----------
  const SAMPLES = {
    iflos: {
      code: code("yoshlar = [15, 14, -3, 16, 150, 15]", "print(sum(yoshlar) / len(yoshlar))"),
      out: ["34.5"],
    },
    tozalash: {
      code: code("yoshlar = [15, -3, 150, 16]", "toza = []", "for y in yoshlar:", "    if y >= 10 and y <= 18:", "        toza.append(y)", "print(toza)"),
      out: ["[15, 16]"],
    },
    toza_ortacha: {
      code: code("yoshlar = [15, 14, -3, 16, 150, 15]", "toza = []", "for y in yoshlar:", "    if y >= 10 and y <= 18:", "        toza.append(y)",
        "print(toza)", "print(sum(toza) / len(toza))"),
      out: ["[15, 14, 16, 15]", "15.0"],
    },
    funksiya: {
      code: code("def ortacha(royxat):", "    return sum(royxat) / len(royxat)", "", "print(ortacha([8, 7, 9, 6]))", "print(ortacha([15, 14, 16, 15]))"),
      out: ["7.5", "15.0"],
    },
    moda: {
      code: code("def sanash(royxat, qiymat):", "    soni = 0", "    for x in royxat:", "        if x == qiymat:", "            soni += 1", "    return soni", "",
        'fanlar = ["fizika", "tarix", "fizika", "kimyo"]', 'print(sanash(fanlar, "fizika"))', 'print(sanash(fanlar, "biologiya"))'),
      out: ["2", "0"],
    },
    loyiha: {
      code: code("uyqu_soatlari = [8, 7, 99, 6, 9, -2]", "",
        "def ortacha(royxat):", "    return sum(royxat) / len(royxat)", "",
        "toza = []", "for x in uyqu_soatlari:", "    if x >= 1 and x <= 24:", "        toza.append(x)", "m = ortacha(toza)",
        'print("Javoblar:", len(toza))', "print(\"O'rtacha:\", m)", "if m >= 8:", '    print("Xulosa: yetarli")', "else:", '    print("Xulosa: kam")'),
      out: ["Javoblar: 4", "O'rtacha: 7.5", "Xulosa: kam"],
    },
  };

  // ---------- 1-bosqich: tozalash (for + if) ----------
  const keepBody = (f, v) => code("toza = []", "for x in " + f.name + ":", "    if x >= " + f.lo + " and x <= " + f.hi + ":", "        toza.append(x)", "print(toza)") + (v || "");
  const one = (f, list) => ({ [f.name]: list });

  const CLEAN = [
    {
      id: "oraliq", tier: 0,
      make(r) {
        const f = FIELDS[pick(["yoshlar", "uyqu_soatlari", "baholar"], r)];
        return {
          what: "Toʻgʻri " + f.nima + ": " + oraliqMatn(f) + ". Faqat toʻgʻri qiymatlarni toza roʻyxatiga yigʻ va print(toza) bilan chiqar.",
          tip: "boʻsh toza = [] roʻyxatidan boshla; for har qiymatni koʻradi, if oraliqni tekshiradi, append qoʻshadi",
          body: keepBody(f),
          tests: [one(f, mixed(r, f, int(r, 4, 5), 2)), one(f, boundary(r, f)), one(f, allBad(r, f)), one(f, allGood(r, f)), one(f, mixed(r, f, 3, 3))],
        };
      },
    },
    {
      id: "bosh", tier: 0,
      make(r) {
        const data = (counts, blanks) => ({ sevimli_fan: votes(r, counts, blanks) });
        return {
          what: 'Baʼzi oʻquvchilar savolni javobsiz qoldirgan — bu boʻsh satr "". Boʻsh boʻlmagan javoblarni toza roʻyxatiga yigʻ va print(toza) bilan chiqar.',
          tip: 'boʻsh satr bilan solishtirish: if x != ""',
          body: code("toza = []", "for x in sevimli_fan:", '    if x != "":', "        toza.append(x)", "print(toza)"),
          tests: [data([2, 2, 1], ["", ""]), data([1, 1], []), data([], ["", "", ""]), data([3, 1], [""]), data([1, 2, 2], ["", "", ""])],
        };
      },
    },
    {
      id: "sanab", tier: 1,
      make(r) {
        const f = FIELDS[pick(["boylar", "ekran_vaqti", "yoshlar"], r)];
        return {
          what: "Toʻgʻri " + f.nima + ": " + oraliqMatn(f) + ". Birinchi satrda toza roʻyxatni, ikkinchi satrda nechta javob olib tashlanganini chiqar.",
          tip: "olib tashlanganlar soni — ikki roʻyxat uzunligining farqi: len(...) − len(toza)",
          body: keepBody(f, "\nprint(len(" + f.name + ") - len(toza))"),
          tests: [one(f, mixed(r, f, 4, 3)), one(f, boundary(r, f)), one(f, allGood(r, f)), one(f, allBad(r, f)), one(f, mixed(r, f, 5, 1))],
        };
      },
    },
    {
      id: "xatolar", tier: 1,
      make(r) {
        const f = FIELDS[pick(["uyqu_soatlari", "baholar", "boylar"], r)];
        return {
          what: "Oʻchirishdan oldin xato javoblarni koʻrib chiqamiz. Toʻgʻri " + f.nima + ": " + oraliqMatn(f) + ". Oraliqdan TASHQARIDAGI qiymatlarni xato roʻyxatiga yigʻ va print(xato) bilan chiqar.",
          tip: "tashqarida — yaʼni pastki chegaradan kichik YOKI yuqori chegaradan katta: or",
          body: code("xato = []", "for x in " + f.name + ":", "    if x < " + f.lo + " or x > " + f.hi + ":", "        xato.append(x)", "print(xato)"),
          tests: [one(f, mixed(r, f, 4, 3)), one(f, boundary(r, f)), one(f, allGood(r, f)), one(f, allBad(r, f)), one(f, mixed(r, f, 3, 2))],
        };
      },
    },
    {
      id: "belgi", tier: 1,
      make(r) {
        const data = (counts, blanks) => ({ sevimli_fan: votes(r, counts, blanks) });
        return {
          what: 'Javobsiz qolgan savol ikki xil yozilgan: boʻsh satr "" va "?". Ikkalasini ham olib tashla, qolganini toza roʻyxatiga yigʻ va print(toza) bilan chiqar.',
          tip: 'javob "" ham emas, "?" ham emas boʻlsa qoladi: ikki shart and bilan',
          body: code("toza = []", "for x in sevimli_fan:", '    if x != "" and x != "?":', "        toza.append(x)", "print(toza)"),
          tests: [data([2, 1, 2], ["", "?"]), data([1, 1], ["?", "?"]), data([2], [""]), data([], ["", "?", ""]), data([1, 3], []), data([2, 2], ["?", "", "?"])],
        };
      },
    },
    {
      id: "juft", tier: 2,
      make(r) {
        const a = FIELDS.yoshlar, b = FIELDS.uyqu_soatlari;
        // Qatorlar: har o'quvchining yoshi va uyqusi bir xil indeksda; xato har ikki ustunda uchraydi
        const rows = (n, badA, badB) => {
          const ya = ints(r, n, a.gen[0], a.gen[1]);
          const ub = ints(r, n, b.gen[0], b.gen[1]);
          sample(Array.from({ length: n - 1 }, (_, k) => k + 1), badA + badB, r).forEach((at, k) => {
            if (k < badA) ya[at] = pick(a.bad, r); else ub[at] = pick(b.bad, r);
          });
          return { yoshlar: ya, uyqu_soatlari: ub };
        };
        return {
          what: "Har oʻquvchining javobi ikki roʻyxatda bir xil indeksda turadi. Yosh " + oraliqMatn(a) + ", uyqu " + oraliqMatn(b) +
            " boʻlishi kerak. Ikkala qiymati ham toʻgʻri oʻquvchilarni qoldir: avval print(toza_yosh), keyin print(toza_uyqu).",
          tip: "indeks boʻylab yur: for i in range(len(yoshlar)) — va yoshlar[i] hamda uyqu_soatlari[i] ni birga tekshir",
          body: code("toza_yosh = []", "toza_uyqu = []", "for i in range(len(yoshlar)):",
            "    if yoshlar[i] >= " + a.lo + " and yoshlar[i] <= " + a.hi + " and uyqu_soatlari[i] >= " + b.lo + " and uyqu_soatlari[i] <= " + b.hi + ":",
            "        toza_yosh.append(yoshlar[i])", "        toza_uyqu.append(uyqu_soatlari[i])", "print(toza_yosh)", "print(toza_uyqu)"),
          tests: [rows(6, 1, 1), rows(5, 2, 0), rows(5, 0, 2), rows(4, 0, 0), { yoshlar: [10, 18, 9, 19, 14], uyqu_soatlari: [1, 24, 8, 8, 0] }, rows(7, 2, 2)],
        };
      },
    },
    {
      id: "registr", tier: 2,
      make(r) {
        // Bir xil javob har xil yozilgan: "Fizika", "FIZIKA", "fizika"
        const data = (counts, blanks) => ({
          sevimli_fan: votes(r, counts, blanks).map((x) => registr(x, r)),
        });
        return {
          what: 'Bir xil javob har xil yozilgan: "Fizika", "FIZIKA", "fizika". Boʻsh "" javoblarni olib tashla, qolganini kichik harfga oʻtkazib toza roʻyxatiga yigʻ va print(toza) bilan chiqar.',
          tip: "satrni kichik harfga oʻtkazish: x.lower()",
          body: code("toza = []", "for x in sevimli_fan:", '    if x != "":', "        toza.append(x.lower())", "print(toza)"),
          tests: [data([2, 2, 1], [""]), { sevimli_fan: ["FIZIKA", "", "Fizika", "fizika"] }, data([3, 2], ["", ""]), data([1, 1, 1], []), data([], ["", ""])],
        };
      },
    },
    {
      id: "takror", tier: 2,
      make(r) {
        // Ba'zi o'quvchilar so'rovnomani ikki marta topshirgan: javob raqami takrorlanadi
        const ids = (n, dup) => {
          const base = sample(Array.from({ length: 30 }, (_, k) => 101 + k), n, r);
          const out = base.slice();
          for (let k = 0; k < dup; k++) out.splice(int(r, 1, out.length), 0, pick(base, r));
          return { javob_id: out };
        };
        return {
          what: "Baʼzi oʻquvchilar soʻrovnomani ikki marta topshirgan — javob raqami takrorlangan. Har raqamni faqat birinchi uchraganida toza roʻyxatiga qoʻsh va print(toza) bilan chiqar.",
          tip: "raqam toza ichida hali yoʻq boʻlsagina qoʻsh: if x not in toza",
          body: code("toza = []", "for x in javob_id:", "    if x not in toza:", "        toza.append(x)", "print(toza)"),
          tests: [ids(5, 2), ids(4, 0), { javob_id: [107, 107, 107] }, ids(6, 3), { javob_id: [112, 105, 112, 105, 120, 112] }],
        };
      },
    },
  ];

  function cleanTask(prev, rng, tier) {
    const rr = rng || Math.random;
    return pickNew((rnd) => {
      const kind = zinadan(CLEAN, tier, rnd);
      return dataTask("tozala", kind.id, kind.tier, kind.make(rnd));
    }, prev, rr);
  }

  // ---------- 2-bosqich: yordamchi funksiyalar ----------
  const fanRoyxat = (r, counts) => votes(r, counts, []);
  // O'rtacha «chiroyli» chiqishi uchun uzunlik 1, 2, 4, 5 yoki 8
  const UZUNLIK = [2, 4, 5, 8];

  const FUNCS = [
    {
      id: "ortacha", tier: 0,
      what: "ortacha(royxat) funksiyasini yoz: roʻyxatdagi sonlarning oʻrta arifmetigini qaytarsin.",
      starter: "def ortacha(royxat):\n    ",
      solution: code("def ortacha(royxat):", "    return sum(royxat) / len(royxat)"),
      calls: (r) => ["ortacha([8, 7, 9, 6])", "ortacha(" + lit(ints(r, pick(UZUNLIK, r), 13, 16)) + ")", "ortacha([7])", "ortacha(" + lit(ints(r, 5, 3, 5)) + ")", "ortacha([6.5, 7.5])", "ortacha([0, 0, 4, 8])"],
    },
    {
      id: "sanash", tier: 0,
      what: "sanash(royxat, qiymat) funksiyasini yoz: qiymat roʻyxatda necha marta uchrashini qaytarsin.",
      starter: "def sanash(royxat, qiymat):\n    ",
      solution: code("def sanash(royxat, qiymat):", "    soni = 0", "    for x in royxat:", "        if x == qiymat:", "            soni += 1", "    return soni"),
      calls: (r) => {
        const a = fanRoyxat(r, [3, 2, 1]);
        return ["sanash(" + lit(a) + ", " + lit(a[0]) + ")", "sanash([5, 4, 5, 5, 3], 5)", 'sanash(["tarix", "kimyo"], "fizika")', "sanash([], 4)", "sanash(" + lit(ints(r, 8, 3, 5)) + ", 4)", 'sanash(["fizika"], "fizika")'];
      },
    },
    {
      id: "oraliq", tier: 0,
      what: "oraliq(royxat) funksiyasini yoz: eng katta va eng kichik qiymat ayirmasini qaytarsin (javoblar qanchalik tarqoqligini koʻrsatadi).",
      starter: "def oraliq(royxat):\n    ",
      solution: code("def oraliq(royxat):", "    return max(royxat) - min(royxat)"),
      calls: (r) => ["oraliq([8, 7, 9, 6])", "oraliq(" + lit(ints(r, 5, 150, 185)) + ")", "oraliq([14])", "oraliq([5, 5, 5])", "oraliq(" + lit(ints(r, 6, 1, 10)) + ")", "oraliq([-3, 4])"],
    },
    {
      id: "tozala", tier: 1,
      what: "tozala(royxat, past, yuqori) funksiyasini yoz: past dan yuqori gacha (ikkalasi ham kiradi) boʻlgan qiymatlardan YANGI roʻyxat tuzib qaytarsin.",
      starter: "def tozala(royxat, past, yuqori):\n    ",
      solution: code("def tozala(royxat, past, yuqori):", "    toza = []", "    for x in royxat:", "        if x >= past and x <= yuqori:", "            toza.append(x)", "    return toza"),
      calls: (r) => ["tozala([15, 14, -3, 16, 150], 10, 18)", "tozala(" + lit(mixed(r, FIELDS.uyqu_soatlari, 4, 2)) + ", 1, 24)", "tozala([10, 18, 9, 19], 10, 18)", "tozala([99, -1], 1, 5)", "tozala([], 0, 24)", "tozala(" + lit(mixed(r, FIELDS.baholar, 4, 2)) + ", 1, 5)"],
    },
    {
      id: "ulush", tier: 1,
      what: "sanash(royxat, qiymat) va ulush(royxat, qiymat) funksiyalarini yoz: ikkinchisi qiymat roʻyxatning qancha qismini tashkil qilishini qaytarsin (soni / jami) va sanash dan foydalansin.",
      starter: "def sanash(royxat, qiymat):\n    \n\ndef ulush(royxat, qiymat):\n    ",
      solution: code("def sanash(royxat, qiymat):", "    soni = 0", "    for x in royxat:", "        if x == qiymat:", "            soni += 1", "    return soni", "",
        "def ulush(royxat, qiymat):", "    return sanash(royxat, qiymat) / len(royxat)"),
      calls: (r) => {
        const a = fanRoyxat(r, [2, 1, 1]);
        return ["ulush(" + lit(a) + ", " + lit(a[0]) + ")", "ulush([5, 4, 5, 5, 3], 5)", 'ulush(["tarix", "kimyo"], "fizika")', 'ulush(["fizika"], "fizika")', "ulush([1, 0, 0, 0, 1, 0, 0, 0], 1)", "ulush([4, 4, 3, 4, 5], 4)"];
      },
    },
    {
      id: "nechta-kam", tier: 1,
      what: "nechta_kam(royxat, chegara) funksiyasini yoz: chegaradan qatʼiy kichik qiymatlar sonini qaytarsin (masalan, 8 soatdan kam uxlaganlar).",
      starter: "def nechta_kam(royxat, chegara):\n    ",
      solution: code("def nechta_kam(royxat, chegara):", "    soni = 0", "    for x in royxat:", "        if x < chegara:", "            soni += 1", "    return soni"),
      calls: (r) => ["nechta_kam([8, 7, 9, 6], 8)", "nechta_kam(" + lit(ints(r, 7, 5, 10)) + ", 8)", "nechta_kam([8, 8], 8)", "nechta_kam([], 3)", "nechta_kam([1, 2, 3], 10)", "nechta_kam(" + lit(ints(r, 6, 13, 16)) + ", 15)"],
    },
    {
      id: "eng-kop", tier: 2,
      what: "sanash(royxat, qiymat) va eng_kop(royxat) funksiyalarini yoz: ikkinchisi roʻyxatda eng koʻp uchraydigan qiymatni — modani (mode) qaytarsin va sanash dan foydalansin. Sinovlarda bunday qiymat bitta.",
      starter: "def sanash(royxat, qiymat):\n    \n\ndef eng_kop(royxat):\n    ",
      solution: code("def sanash(royxat, qiymat):", "    soni = 0", "    for x in royxat:", "        if x == qiymat:", "            soni += 1", "    return soni", "",
        "def eng_kop(royxat):", "    eng = royxat[0]", "    for x in royxat:", "        if sanash(royxat, x) > sanash(royxat, eng):", "            eng = x", "    return eng"),
      calls: (r) => {
        const a = fanRoyxat(r, [3, 2, 1]);
        const b = fanRoyxat(r, [1, 2, 4]);
        return ["eng_kop(" + lit(a) + ")", "eng_kop([5, 4, 5, 3, 5])", "eng_kop(" + lit(b) + ")", 'eng_kop(["tarix"])', "eng_kop([9, 3, 3])", "eng_kop([2, 7, 7, 2, 7, 1])"];
      },
    },
    {
      id: "ortacha-bosh", tier: 2,
      what: "ortacha(royxat) funksiyasini yoz: sonlarning oʻrta arifmetigini qaytarsin. Tozalashdan keyin roʻyxat boʻsh qolishi mumkin — bunda 0 qaytarsin (nolga boʻlish xatosi chiqmasin).",
      starter: "def ortacha(royxat):\n    ",
      solution: code("def ortacha(royxat):", "    if len(royxat) == 0:", "        return 0", "    return sum(royxat) / len(royxat)"),
      calls: (r) => ["ortacha([8, 7, 9, 6])", "ortacha([])", "ortacha(" + lit(ints(r, pick(UZUNLIK, r), 5, 10)) + ")", "ortacha([7])", "ortacha([0, 0])", "ortacha(" + lit(ints(r, 5, 13, 16)) + ")"],
    },
    {
      id: "mediana", tier: 2,
      what: "mediana(royxat) funksiyasini yoz: saralangan roʻyxatning oʻrtadagi elementini qaytarsin; elementlar soni juft boʻlsa — ikki oʻrtadagining oʻrtachasini. Saralash: sorted(royxat).",
      starter: "def mediana(royxat):\n    ",
      solution: code("def mediana(royxat):", "    a = sorted(royxat)", "    n = len(a)", "    if n % 2 == 1:", "        return a[n // 2]", "    return (a[n // 2 - 1] + a[n // 2]) / 2"),
      calls: (r) => ["mediana([7, 9, 6])", "mediana([8, 6, 9, 7])", "mediana(" + lit(ints(r, 5, 5, 10)) + ")", "mediana([4])", "mediana([150, 8, 7, 6, 9])", "mediana(" + lit(ints(r, 6, 13, 16)) + ")", "mediana([5, 8])"],
    },
    {
      id: "ortachadan-past", tier: 2,
      what: "ortacha(royxat) va ortachadan_past(royxat) funksiyalarini yoz: ikkinchisi oʻrtachadan qatʼiy kichik qiymatlar sonini qaytarsin va ortacha dan foydalansin.",
      starter: "def ortacha(royxat):\n    return sum(royxat) / len(royxat)\n\ndef ortachadan_past(royxat):\n    ",
      solution: code("def ortacha(royxat):", "    return sum(royxat) / len(royxat)", "", "def ortachadan_past(royxat):", "    m = ortacha(royxat)", "    soni = 0",
        "    for x in royxat:", "        if x < m:", "            soni += 1", "    return soni"),
      calls: (r) => ["ortachadan_past([8, 7, 9, 6])", "ortachadan_past([5, 5, 5])", "ortachadan_past([1, 1, 10])", "ortachadan_past([7])", "ortachadan_past(" + lit(ints(r, 6, 5, 10)) + ")", "ortachadan_past(" + lit(ints(r, 5, 150, 185)) + ")"],
    },
  ];

  const SHOWN = 2;

  function funcTask(prev, rng, tier) {
    const rr = rng || Math.random;
    return pickNew((rnd) => {
      const kind = zinadan(FUNCS, tier, rnd);
      const tests = kind.calls(rnd);
      return { id: "funksiya:" + kind.id, type: "funksiya", kind: kind.id, tier: kind.tier, what: kind.what, code: kind.starter, solution: kind.solution, show: tests.slice(0, SHOWN), tests };
    }, prev, rr);
  }

  // ---------- 3-bosqich: xulosa — to'liq mini loyiha ----------
  // 2-bosqichda yozilgan funksiyalar muharrirda tayyor turadi — endi ular qayta ishlatiladi
  const HELPERS = {
    ortacha: code("def ortacha(royxat):", "    return sum(royxat) / len(royxat)"),
    sanash: code("def sanash(royxat, qiymat):", "    soni = 0", "    for x in royxat:", "        if x == qiymat:", "            soni += 1", "    return soni"),
    eng_kop: code("def eng_kop(royxat):", "    eng = royxat[0]", "    for x in royxat:", "        if sanash(royxat, x) > sanash(royxat, eng):", "            eng = x", "    return eng"),
  };
  const helpers = (...names) => names.map((n) => HELPERS[n]).join("\n\n");

  // Namunali yechimni shu to'plamda bajarib, oxirgi satrni (xulosani) qaytaradi
  const verdict = (prefix, body, data) => {
    const r = run(dataLines(data) + "\n\n" + prefix + "\n\n" + body);
    if (r.error) throw new Error("namunali yechim xato berdi: " + r.error.text);
    return r.output[r.output.length - 1];
  };

  // gen(rnd) dan xulosasi `want` ga teng to'plam chiqquncha qayta yasaydi; chiqmasa — oxirgisi
  function until(r, gen, prefix, body, want) {
    let data = null;
    for (let k = 0; k < 80; k++) {
      data = gen(r);
      if (want == null || verdict(prefix, body, data) === want) return data;
    }
    return data;
  }

  // Har xulosa kamida bir sinovda uchraydi: aks holda doim bitta javobni chiqaradigan kod o'tib ketardi
  const withVerdicts = (r, gen, prefix, body, wants, extra) =>
    [until(r, gen, prefix, body, null)].concat(wants.map((w) => until(r, gen, prefix, body, w)), extra || []);

  const cleanLines = (f, from, to) => [to + " = []", "for x in " + from + ":", "    if x >= " + f.lo + " and x <= " + f.hi + ":", "        " + to + ".append(x)"];
  const GOOD_N = [4, 5, 8]; // o'rtacha uzun kasrsiz chiqadi

  const REPORT = [
    {
      id: "uyqu", tier: 0,
      make(r) {
        const f = FIELDS.uyqu_soatlari;
        const prefix = helpers("ortacha");
        const body = code(...cleanLines(f, f.name, "toza"), "m = ortacha(toza)", 'print("Javoblar:", len(toza))', "print(\"O'rtacha:\", m)",
          "if m >= 8:", '    print("Xulosa: yetarli")', "else:", '    print("Xulosa: kam")');
        const gen = (rnd) => {
          const lo = pick([5, 6, 7], rnd);
          const good = ints(rnd, pick(GOOD_N, rnd), lo, lo + 3);
          return one(f, [good[0]].concat(shuffle(good.slice(1).concat(sample(f.bad, int(rnd, 1, 3), rnd)), rnd)));
        };
        return {
          question: "Savol: sinf oʻrtacha kamida 8 soat uxlaydimi?",
          what: "Toʻgʻri javob: " + oraliqMatn(f) + ". Tozala, soʻng uch satr chiqar: toʻgʻri javoblar soni, ularning oʻrtachasi va xulosa — oʻrtacha 8 dan kichik boʻlmasa «yetarli», aks holda «kam».",
          tip: "ortacha funksiyasi tayyor — uni toza roʻyxat bilan chaqir; xulosa if / else bilan",
          prefix, body,
          tests: withVerdicts(r, gen, prefix, body, ["Xulosa: yetarli", "Xulosa: kam"], [one(f, [8, 1, 24, 0, 25, 8, 7]), one(f, [8, 8, 99, 8, 8])]),
        };
      },
    },
    {
      id: "ekran", tier: 0,
      make(r) {
        const f = FIELDS.ekran_vaqti;
        const prefix = helpers("ortacha");
        const body = code(...cleanLines(f, f.name, "toza"), "m = ortacha(toza)", 'print("Javoblar:", len(toza))', "print(\"O'rtacha:\", m)",
          "if m > 3:", '    print("Xulosa: ha")', "else:", "    print(\"Xulosa: yo'q\")");
        const gen = (rnd) => {
          const lo = pick([1, 2, 3], rnd);
          const good = ints(rnd, pick(GOOD_N, rnd), lo, lo + 3);
          return one(f, [good[0]].concat(shuffle(good.slice(1).concat(sample(f.bad, int(rnd, 1, 3), rnd)), rnd)));
        };
        return {
          question: "Savol: sinf kuniga oʻrtacha 3 soatdan koʻp vaqtni ekran oldida oʻtkazadimi?",
          what: "Toʻgʻri javob: " + oraliqMatn(f) + ". Tozala, soʻng uch satr chiqar: toʻgʻri javoblar soni, oʻrtachasi va xulosa — oʻrtacha 3 dan katta boʻlsa «ha», aks holda «yoʻq».",
          tip: "aynan 3.0 chiqsa — bu «3 dan koʻp» emas; shartga qara",
          prefix, body,
          tests: withVerdicts(r, gen, prefix, body, ["Xulosa: ha", "Xulosa: yo'q"], [one(f, [3, 3, 40, 3, 3]), one(f, [0, 24, -1, 25, 0, 0])]),
        };
      },
    },
    {
      id: "fan", tier: 0,
      make(r) {
        const prefix = helpers("sanash", "eng_kop");
        const body = code("toza = []", "for x in sevimli_fan:", '    if x != "":', "        toza.append(x)", "fan = eng_kop(toza)",
          'print("Javoblar:", len(toza))', 'print("Eng sevimli fan:", fan)', 'print("Ovozlar:", sanash(toza, fan))');
        const data = (counts, blanks) => ({ sevimli_fan: votes(r, counts, blanks) });
        return {
          question: "Savol: sinfning eng sevimli fani qaysi va uni necha kishi tanlagan?",
          what: 'Javobsiz qolganlar — boʻsh satr "". Ularni olib tashla, soʻng uch satr chiqar: javoblar soni, eng koʻp tanlangan fan va uning ovozlari soni.',
          tip: "sanash va eng_kop tayyor — ularni toza roʻyxat bilan chaqir",
          prefix, body,
          // Uchinchi to'plamda bo'sh javob eng ko'p: tozalanmagan kod «eng sevimli fan» deb bo'sh satrni chiqaradi
          tests: [data([4, 2, 1], ["", ""]), data([1, 3, 2], [""]), data([2, 1], ["", "", ""]), data([1, 1, 5], []), data([3], ["", ""])],
        };
      },
    },
    {
      id: "kattalar", tier: 1,
      make(r) {
        const f = FIELDS.yoshlar;
        const prefix = "";
        const body = code(...cleanLines(f, f.name, "toza"), "katta = 0", "for x in toza:", "    if x >= 15:", "        katta += 1",
          'print("Javoblar:", len(toza))', 'print("15 va undan katta:", katta)', "if katta * 2 > len(toza):", '    print("Xulosa: ha")', "else:", "    print(\"Xulosa: yo'q\")");
        const gen = (rnd) => one(f, mixed(rnd, f, int(rnd, 4, 7), int(rnd, 1, 3)));
        return {
          question: "Savol: soʻrovda qatnashganlarning yarmidan koʻpi 15 yoshda yoki undan kattami?",
          what: "Toʻgʻri yosh: " + oraliqMatn(f) + ". Tozala, soʻng uch satr chiqar: toʻgʻri javoblar soni, 15 va undan katta yoshdagilar soni va xulosa — ular yarmidan koʻp boʻlsa «ha», aks holda «yoʻq».",
          tip: "ikkinchi hisoblagich faqat toza roʻyxat boʻylab yuradi; aynan yarmi — bu «yarmidan koʻp» emas",
          prefix, body,
          tests: withVerdicts(r, gen, prefix, body, ["Xulosa: ha", "Xulosa: yo'q"], [one(f, [15, 14, 150, 15, 14]), one(f, [18, 10, 19, 9, 15])]),
        };
      },
    },
    {
      id: "boy", tier: 1,
      make(r) {
        const f = FIELDS.boylar;
        const prefix = "";
        const body = code(...cleanLines(f, f.name, "toza"), "farq = max(toza) - min(toza)", 'print("Javoblar:", len(toza))', 'print("Farq:", farq)',
          "if farq > 30:", '    print("Xulosa: ha")', "else:", "    print(\"Xulosa: yo'q\")");
        const gen = (rnd) => {
          const lo = int(rnd, 150, 160);
          const good = ints(rnd, int(rnd, 4, 6), lo, lo + pick([18, 28, 34], rnd));
          return one(f, [good[0]].concat(shuffle(good.slice(1).concat(sample(f.bad, int(rnd, 1, 2), rnd)), rnd)));
        };
        return {
          question: "Savol: sinfdagi eng past va eng baland oʻquvchi boʻyi orasidagi farq 30 sm dan oshadimi?",
          what: "Toʻgʻri boʻy: " + oraliqMatn(f) + " sm. Tozala, soʻng uch satr chiqar: toʻgʻri javoblar soni, eng katta va eng kichik boʻy farqi va xulosa — farq 30 dan katta boʻlsa «ha», aks holda «yoʻq».",
          tip: "max(toza) va min(toza); tozalanmagan roʻyxatda 1650 yoki 0 kabi qiymatlar farqni buzadi",
          prefix, body,
          tests: withVerdicts(r, gen, prefix, body, ["Xulosa: ha", "Xulosa: yo'q"], [one(f, [150, 180, 99, 221, 165]), one(f, [100, 220, 160])]),
        };
      },
    },
    {
      id: "fan-ulush", tier: 1,
      make(r) {
        const fan = pick(["informatika", "matematika", "fizika"], r);
        const prefix = helpers("sanash");
        const body = code("toza = []", "for x in sevimli_fan:", '    if x != "":', "        toza.append(x)", "soni = sanash(toza, " + lit(fan) + ")",
          'print("Javoblar:", len(toza))', 'print("Tanlaganlar:", soni)', "if soni * 3 >= len(toza):", '    print("Xulosa: ha")', "else:", "    print(\"Xulosa: yo'q\")");
        // Tanlangan fan + ikki boshqa fan + bo'sh javoblar
        const gen = (rnd) => {
          const boshqa = sample(FANLAR.filter((x) => x !== fan), 2, rnd);
          const list = [];
          [[fan, int(rnd, 0, 4)], [boshqa[0], int(rnd, 1, 4)], [boshqa[1], int(rnd, 1, 3)], ["", int(rnd, 1, 3)]].forEach(([s, n]) => { for (let k = 0; k < n; k++) list.push(s); });
          return { sevimli_fan: shuffle(list, rnd) };
        };
        return {
          question: "Savol: javob berganlarning kamida uchdan biri «" + fan + "» fanini tanlaganmi?",
          what: 'Javobsiz qolganlar — boʻsh satr "". Ularni olib tashla, soʻng uch satr chiqar: javoblar soni, "' + fan + '" ni tanlaganlar soni va xulosa — ular javoblarning uchdan biridan kam boʻlmasa «ha», aks holda «yoʻq».',
          tip: "kasrsiz solishtirish: soni * 3 >= jami; jami — tozalangan javoblar soni, boʻsh javoblar hisobga kirmaydi",
          prefix, body,
          tests: withVerdicts(r, gen, prefix, body, ["Xulosa: ha", "Xulosa: yo'q"], [{ sevimli_fan: [fan, "tarix", "", "kimyo", "", ""] }, { sevimli_fan: ["tarix", "", "kimyo", "tarix"] }]),
        };
      },
    },
    {
      id: "ikki-sinf", tier: 2,
      make(r) {
        const f = FIELDS.uyqu_soatlari;
        const prefix = helpers("ortacha");
        const body = code("def tozala(royxat):", "    toza = []", "    for x in royxat:", "        if x >= " + f.lo + " and x <= " + f.hi + ":", "            toza.append(x)", "    return toza", "",
          "a = ortacha(tozala(uyqu_a))", "b = ortacha(tozala(uyqu_b))", 'print("9-A:", a)', 'print("9-B:", b)',
          "if a > b:", '    print("Xulosa: 9-A")', "elif b > a:", '    print("Xulosa: 9-B")', "else:", '    print("Xulosa: teng")');
        const col = (rnd) => {
          const lo = pick([5, 6, 7], rnd);
          const good = ints(rnd, pick(GOOD_N, rnd), lo, lo + 3);
          return [good[0]].concat(shuffle(good.slice(1).concat(sample(f.bad, int(rnd, 1, 2), rnd)), rnd));
        };
        const gen = (rnd) => ({ uyqu_a: col(rnd), uyqu_b: col(rnd) });
        return {
          question: "Savol: qaysi sinf oʻrtacha koʻproq uxlaydi — 9-A yoki 9-B?",
          what: "Ikkala roʻyxatda ham xato qiymatlar bor; toʻgʻri javob: " + oraliqMatn(f) + ". Uch satr chiqar: 9-A oʻrtachasi, 9-B oʻrtachasi va xulosa — koʻproq uxlaydigan sinf nomi yoki «teng».",
          tip: "tozalash ikki marta kerak — uni tozala(royxat) funksiyasiga chiqar va ikki roʻyxat bilan chaqir",
          prefix, body,
          tests: withVerdicts(r, gen, prefix, body, ["Xulosa: 9-A", "Xulosa: 9-B"], [{ uyqu_a: [8, 7, 99, 6, 7], uyqu_b: [7, -2, 7, 0] }, { uyqu_a: [1, 24, 0, 25], uyqu_b: [12, 14, 48] }]),
        };
      },
    },
    {
      id: "uyqu-baho", tier: 2,
      make(r) {
        const u = FIELDS.uyqu_soatlari, b = FIELDS.baholar;
        const prefix = helpers("ortacha");
        const body = code("kop = []", "kam = []", "for i in range(len(uyqu_soatlari)):", "    u = uyqu_soatlari[i]", "    b = baholar[i]",
          "    if u >= " + u.lo + " and u <= " + u.hi + " and b >= " + b.lo + " and b <= " + b.hi + ":", "        if u >= 8:", "            kop.append(b)", "        else:", "            kam.append(b)",
          'print("8+ soat:", ortacha(kop))', 'print("8 dan kam:", ortacha(kam))', "if ortacha(kop) > ortacha(kam):", '    print("Xulosa: ha")', "else:", "    print(\"Xulosa: yo'q\")");
        // Ikki guruh ham bo'sh emas; xato qatorlar har ikki ustunda
        const gen = (rnd) => {
          const rows = [];
          const nk = pick([2, 4, 5], rnd), nm = pick([2, 4, 5], rnd);
          for (let k = 0; k < nk; k++) rows.push([int(rnd, 8, 10), int(rnd, 3, 5)]);
          for (let k = 0; k < nm; k++) rows.push([int(rnd, 5, 7), int(rnd, 3, 5)]);
          rows.push([pick(u.bad, rnd), int(rnd, 3, 5)]);
          rows.push([int(rnd, 5, 10), pick(b.bad, rnd)]);
          const mix = [rows[0]].concat(shuffle(rows.slice(1), rnd));
          return { uyqu_soatlari: mix.map((x) => x[0]), baholar: mix.map((x) => x[1]) };
        };
        return {
          question: "Savol: kamida 8 soat uxlaydiganlarning oʻrtacha bahosi qolganlarnikidan yuqorimi?",
          what: "Har oʻquvchining uyqusi va bahosi bir xil indeksda. Uyqu " + oraliqMatn(u) + ", baho " + oraliqMatn(b) + " boʻlmasa — oʻquvchi hisobga olinmaydi. Uch satr chiqar: 8 va undan koʻp soat uxlaganlarning oʻrtacha bahosi, qolganlarniki va xulosa — birinchisi katta boʻlsa «ha», aks holda «yoʻq».",
          tip: "indeks boʻylab yur va bahoni ikki roʻyxatdan biriga qoʻsh: uyqu 8 dan kichik boʻlmasa — birinchisiga, aks holda ikkinchisiga",
          prefix, body,
          tests: withVerdicts(r, gen, prefix, body, ["Xulosa: ha", "Xulosa: yo'q"], [{ uyqu_soatlari: [8, 7, 24, 1, 0, 9], baholar: [4, 4, 5, 3, 5, 6] }]),
        };
      },
    },
    {
      id: "fan-registr", tier: 2,
      make(r) {
        const prefix = helpers("sanash", "eng_kop");
        const body = code("toza = []", "for x in sevimli_fan:", '    if x != "":', "        toza.append(x.lower())", "fan = eng_kop(toza)",
          'print("Javoblar:", len(toza))', 'print("Eng sevimli fan:", fan)', 'print("Ovozlar:", sanash(toza, fan))');
        const data = (counts, blanks) => ({
          sevimli_fan: votes(r, counts, blanks).map((x) => registr(x, r)),
        });
        return {
          question: "Savol: sinfning eng sevimli fani qaysi va uni necha kishi tanlagan?",
          what: 'Javoblar har xil yozilgan ("Fizika", "FIZIKA", "fizika") va baʼzilari boʻsh "". Boʻshlarini olib tashla, qolganini kichik harfga oʻtkaz, soʻng uch satr chiqar: javoblar soni, eng koʻp tanlangan fan (kichik harfda) va uning ovozlari soni.',
          tip: "append qilishdan oldin x.lower(); aks holda «Fizika» va «fizika» alohida sanaladi",
          prefix, body,
          tests: [data([4, 2, 1], [""]), { sevimli_fan: ["tarix", "Fizika", "tarix", "FIZIKA", "", "fizika"] }, data([1, 3, 2], ["", ""]), data([2, 1], ["", "", ""]), { sevimli_fan: ["KIMYO", "Kimyo", "tarix", "Tarix", "kimyo"] }],
        };
      },
    },
  ];

  function reportTask(prev, rng, tier) {
    const rr = rng || Math.random;
    return pickNew((rnd) => {
      const kind = zinadan(REPORT, tier, rnd);
      return dataTask("xulosa", kind.id, kind.tier, kind.make(rnd));
    }, prev, rr);
  }

  const api = {
    FIELDS, FANLAR, SAMPLES, CLEAN, FUNCS, REPORT, HELPERS, SHOWN,
    lit, dataLines, swapData, withCalls, typing, check, checkData, checkCalls,
    cleanTask, funcTask, reportTask,
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
