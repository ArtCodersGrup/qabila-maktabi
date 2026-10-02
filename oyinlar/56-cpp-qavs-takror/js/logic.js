// 56-o'yin: C++ bloki — shart va sikl (CPP-BLOK.md, mavzular 5 va 6).
// Sof mantiq, ekransiz. Node'da test qilinadi: tests/logic.test.js
//
// Har misolning chiqishi shu yerda hisoblanadi, yadroda va haqiqiy g++ da tekshiriladi.
(function (root) {
  "use strict";

  const C = root.QK && root.QK.cpp && root.QK.cpp.dastur ? root.QK.cpp : require("../../umumiy/js/cpp.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  function aralash(list, r) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function pickNew(make, prev, r) {
    for (let k = 0; k < 60; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  // Qiyinlik zinasi (QOIDALAR 4.3): 0 — birinchi javoblar, 1 — o'rta, 2 — oxirgi va qiyin rejim.
  // Zina berilmasa (testlar, parity namunalari) — hammasidan teng.
  function zinadan(list, tier, rnd) {
    if (tier == null) return pick(list, rnd);
    const t = Math.max(0, Math.min(2, tier));
    const mos = list.filter((x) => (x.tier || 0) <= t);
    const ayni = mos.filter((x) => (x.tier || 0) === t);
    return ayni.length && rnd() < 0.6 ? pick(ayni, rnd) : pick(mos, rnd);
  }

  // ---------- 1-bosqich: qavs blok yasaydi ----------

  // Qavssiz if: faqat KEYINGI BITTA satr shartga tegishli bo'ladi.
  // Otstup chiroyli ko'rinadi, lekin C++ uni hisobga olmaydi.
  // 2026-10-02 (zina 2): "osilgan else" — qavssiz ichma-ich if da else ENG YAQIN if ga tegishli bo'ladi,
  // otstup esa uni birinchi if ning jufti qilib ko'rsatadi.
  function osilganElseTask(rnd) {
    const x = int(rnd, 1, 12);
    const past = int(rnd, 2, 4);
    const yuqori = int(rnd, 7, 9);
    const tana = [
      "int x = " + x + ";",
      "if (x > " + past + ")",
      "    if (x > " + yuqori + ")",
      '        cout << "katta\\n";',
      "else",
      '    cout << "kichik\\n";',
      'cout << "tamom\\n";',
    ];
    const chiqish = x > yuqori ? ["katta", "tamom"] : x > past ? ["kichik", "tamom"] : ["tamom"];
    return {
      id: "osilgan:" + x + ":" + past + ":" + yuqori, tur: "natija", kind: "osilgan", kod: C.dastur(tana), chiqish,
      savol: "Bu dastur nima chiqaradi? Har satrni alohida qatorga yoz.",
      nega: "Qavs yoʻq: else eng yaqin if ga — yaʼni ICHKI if (x > " + yuqori + ") ga tegishli. Otstup uni tashqi if ning jufti "
        + "qilib koʻrsatadi, lekin C++ otstupga qaramaydi. x " + past + " dan katta boʻlmasa, hech narsa chiqmaydi.",
    };
  }

  function qavsTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      if ((tier == null || tier >= 2) && rnd() < 0.4) return osilganElseTask(rnd);
      const x = int(rnd, 1, 10);
      const chegara = int(rnd, 3, 8);
      const katta = x > chegara;
      const tana = [
        "int x = " + x + ";",
        "if (x > " + chegara + ")",
        '    cout << "katta\\n";',
        '    cout << "tekshirdim\\n";',
      ];
      const chiqish = katta ? ["katta", "tekshirdim"] : ["tekshirdim"];
      return {
        id: "qavs:" + x + ":" + chegara, tur: "natija", kod: C.dastur(tana), chiqish,
        savol: "Bu dastur nima chiqaradi? Har satrni alohida qatorga yoz.",
        nega: "Qavs yoʻq boʻlsa, if ga faqat KEYINGI BITTA satr tegishli boʻladi. "
          + "Ikkinchi cout — sikldan tashqarida, u har doim bajariladi. Otstup C++ uchun hech narsa anglatmaydi.",
      };
    }, prev, rr);
  }

  // "=" va "==" farqi: tayinlash shart sifatida ham ishlaydi va hamisha rost bo'ladi
  function tengTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const x = int(rnd, 1, 9);
      const nishon = int(rnd, 1, 9);
      if (x === nishon) return null; // farqi ko'rinmaydi
      const bitta = rnd() < 0.5;
      const shart = bitta ? "x = " + nishon : "x == " + nishon;
      const kod = C.dastur(["int x = " + x + ";", "if (" + shart + ") {", '    cout << "rost\\n";', "} else {",
        '    cout << "yolgʻon\\n";', "}", C.chiqar("x")]);
      // "=" — tayinlash: shart doim rost (nishon != 0), x ham o'zgaradi
      const chiqish = bitta ? ["rost", String(nishon)] : ["yolgʻon", String(x)];
      return {
        id: "teng:" + (bitta ? "bir" : "ikki") + ":" + x + ":" + nishon, tur: "natija", kod, chiqish,
        savol: "Bu dastur nima chiqaradi?",
        nega: bitta
          ? "Bitta = — bu solishtirish emas, TAYINLASH. x ga " + nishon + " yozildi va shart rost boʻlib qoldi."
          : "Ikkita == — solishtirish. " + x + " va " + nishon + " teng emas, shuning uchun else bajarildi.",
      };
    }, prev, rr);
  }

  const bosqich1Task = (prev, correct, tier) => ((correct || 0) % 2 === 0 ? qavsTask(null, prev, tier) : tengTask(null, prev));

  // ---------- 2-bosqich: sikl ----------

  // for ning uch qismi: boshi, sharti, qadami
  const SIKLLAR = [
    { id: "osha", yasa: (a, b) => ({ bosh: "int i = " + a, shart: "i <= " + b, qadam: "i++", sonlar: ket(a, b, 1) }) },
    { id: "kamay", yasa: (a, b) => ({ bosh: "int i = " + b, shart: "i >= " + a, qadam: "i--", sonlar: ket(b, a, -1) }) },
    { id: "ikki", yasa: (a, b) => ({ bosh: "int i = " + a, shart: "i <= " + b, qadam: "i += 2", sonlar: ket(a, b, 2) }) },
    // ---- 2026-10-02 (zina 1–2): qat'iy shart (<), uchtadan kamayish, ikki barobar o'sish ----
    { id: "qatiy", tier: 1, yasa: (a, b) => ({ bosh: "int i = " + a, shart: "i < " + b, qadam: "i++", sonlar: ket(a, b - 1, 1) }) },
    { id: "uchtadan", tier: 1, yasa: (a, b) => ({ bosh: "int i = " + (b + 6), shart: "i > " + a, qadam: "i -= 3", sonlar: ket(b + 6, a + 1, -3) }) },
    { id: "ikkilanish", tier: 2, yasa: (a, b) => ({ bosh: "int i = " + a, shart: "i <= " + (b * 4), qadam: "i *= 2", sonlar: ikkilab(a, b * 4) }) },
  ];

  function ikkilab(a, b) {
    const out = [];
    for (let i = a; i <= b; i *= 2) out.push(i);
    return out;
  }

  function ket(a, b, qadam) {
    const out = [];
    if (qadam > 0) for (let i = a; i <= b; i += qadam) out.push(i);
    else for (let i = a; i >= b; i += qadam) out.push(i);
    return out;
  }

  function siklTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const t = zinadan(SIKLLAR, tier, rnd);
      const a = int(rnd, 1, 4);
      const b = int(rnd, a + 2, a + 6);
      const s = t.yasa(a, b);
      if (!s.sonlar.length) return null;
      const kod = C.dastur(["for (" + s.bosh + "; " + s.shart + "; " + s.qadam + ") {",
        '    cout << i << " ";', "}", 'cout << "\\n";']);
      return {
        id: "sikl:" + t.id + ":" + a + ":" + b, tur: "natija", kod, chiqish: [s.sonlar.join(" ") + " "],
        savol: "Bu sikl nima chiqaradi?",
        nega: "for ning uch qismi: boshi (" + s.bosh + "), sharti (" + s.shart + ") va qadami (" + s.qadam + "). "
          + "Shart rost boʻlguncha tana bajariladi.",
      };
    }, prev, rr);
  }

  // Sikl ichida yig'ish — olimpiadadagi eng ko'p uchraydigan naqsh
  // 2026-10-02 (zina 1–2): toq sonlar yig'indisi (qadam 2), continue, break (sikldan keyingi i)
  const YIGISH_TURLARI = [{ id: "yigindi", tier: 0 }, { id: "kopaytma", tier: 0 }, { id: "juft", tier: 0 },
    { id: "toq", tier: 1 }, { id: "continue", tier: 2 }, { id: "break", tier: 2 }];

  function yigindiTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const n = int(rnd, 4, 9);
      const tur = zinadan(YIGISH_TURLARI, tier, rnd).id;
      let tana;
      let javob;
      if (tur === "toq") {
        tana = ["int s = 0;", "for (int i = 1; i <= " + n + "; i += 2) s += i;", C.chiqar("s")];
        javob = ket(1, n, 2).reduce((a, b) => a + b, 0);
      } else if (tur === "continue") {
        tana = ["int s = 0;", "for (int i = 1; i <= " + n + "; i++) {", "    if (i % 3 == 0) continue;", "    s += i;", "}", C.chiqar("s")];
        javob = ket(1, n, 1).filter((i) => i % 3 !== 0).reduce((a, b) => a + b, 0);
      } else if (tur === "break") {
        const chegara = n * 3;
        tana = ["int s = 0;", "int i = 1;", "while (true) {", "    s += i;", "    if (s > " + chegara + ") break;", "    i++;", "}",
          C.chiqar('i << " " << s')];
        let s = 0;
        let i = 1;
        for (;;) { s += i; if (s > chegara) break; i++; }
        javob = i + " " + s;
      } else if (tur === "yigindi") {
        tana = ["int s = 0;", "for (int i = 1; i <= " + n + "; i++) s += i;", C.chiqar("s")];
        javob = (n * (n + 1)) / 2;
      } else if (tur === "kopaytma") {
        tana = ["int p = 1;", "for (int i = 1; i <= " + n + "; i++) p *= i;", C.chiqar("p")];
        javob = ket(1, n, 1).reduce((a, b) => a * b, 1);
      } else {
        tana = ["int k = 0;", "for (int i = 1; i <= " + n + "; i++) if (i % 2 == 0) k++;", C.chiqar("k")];
        javob = Math.floor(n / 2);
      }
      return {
        id: "yig:" + tur + ":" + n, tur: "natija", kod: C.dastur(tana), chiqish: [String(javob)],
        savol: "Bu dastur nima chiqaradi?",
        nega: "Sikl ichida bitta oʻzgaruvchi toʻplanib boradi — yigʻindi, koʻpaytma yoki sanoq shunday hisoblanadi.",
      };
    }, prev, rr);
  }

  const bosqich2Task = (prev, correct, tier) => ((correct || 0) % 2 === 0 ? siklTask(null, prev, tier) : yigindiTask(null, prev, tier));

  // ---------- 3-bosqich: sikldagi xatolar va kod yozish ----------

  const XATOLAR = [
    {
      id: "nuqta-vergul", kod: ["for (int i = 1; i <= 3; i++);", '    cout << i << " ";'],
      javob: "Sikl tanasi boʻsh qolgan",
      nega: "for dan keyin darhol ; qoʻyilgan — sikl boʻsh aylanadi, cout esa sikldan tashqarida qoladi "
        + "(va i tanilmaydi).",
    },
    {
      id: "kam", kod: ["int n = 5;", "for (int i = 1; i < n; i++)", '    cout << i << " ";'],
      javob: "Bir marta kam aylanadi",
      nega: "1 dan n gacha kerak boʻlsa, shart i <= n boʻladi. i < n bilan oxirgi qadam tushib qoladi.",
    },
    {
      id: "toxtamaydi", kod: ["int i = 1;", "while (i <= 5) {", '    cout << i << " ";', "}"],
      javob: "Sikl hech qachon tugamaydi",
      nega: "i hech qayerda oshmayapti — shart doim rost. while ichida qadamni oʻzing yozishing kerak.",
    },
    {
      id: "qavssiz", kod: ["for (int i = 1; i <= 3; i++)", '    cout << i;', '    cout << " ";'],
      javob: "Faqat birinchi satr sikl ichida",
      nega: "Qavs yoʻq: siklga faqat keyingi bitta satr tegishli. Ikkinchi cout sikl tugagach bir marta ishlaydi.",
    },
    // ---- 2026-10-02: yana to'rt xato (jami 8) — ikkinchi aylanishda takror chiqmasin ----
    {
      id: "teskari-qadam", tier: 1, kod: ["for (int i = 1; i <= 5; i--) {", '    cout << i << " ";', "}"],
      javob: "Hisoblagich notoʻgʻri tomonga ketyapti",
      nega: "i kamayib boryapti (i--), shart esa i <= 5 — u doim rost. Oʻsish kerak edi: i++.",
    },
    {
      id: "almashtirish", tier: 1, kod: ["int s = 0;", "for (int i = 1; i <= 4; i++) {", "    s = i;", "}", C.chiqar("s")],
      javob: "Yigʻish oʻrniga qiymat almashtirilyapti",
      nega: "s = i har safar eski qiymatni oʻchirib yuboradi: oxirida s = 4 qoladi. Yigʻish uchun s += i kerak (javob 10).",
    },
    {
      id: "boshlanmagan", tier: 2, kod: ["int s;", "for (int i = 1; i <= 3; i++) {", "    s += i;", "}", C.chiqar("s")],
      javob: "Oʻzgaruvchiga boshlangʻich qiymat berilmagan",
      nega: "int s; — ichida tasodifiy «axlat» son turadi. C++ uni nolga tenglab bermaydi: int s = 0; deb yozish shart.",
    },
    {
      id: "shartda-tayinlash", tier: 2, kod: ["int i = 0;", "while (i = 3) {", '    cout << i << " ";', "    i++;", "}"],
      javob: "Shartda == oʻrniga = yozilgan",
      nega: "i = 3 — solishtirish emas, tayinlash: har aylanishda i yana 3 boʻladi va shart rost chiqadi. Sikl toʻxtamaydi.",
    },
  ];

  function xatoTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const x = zinadan(XATOLAR, tier, rnd);
      // To'rt variant: to'g'ri javob va tasodifiy uchta boshqa xato nomi
      const boshqalar = aralash(XATOLAR.filter((y) => y.id !== x.id).map((y) => y.javob), rnd).slice(0, 3);
      return {
        id: "xato:" + x.id, tur: "xato", kod: C.dastur(x.kod),
        savol: "Bu dasturda xato bor. Qanaqa xato?",
        javob: x.javob,
        variantlar: aralash([x.javob].concat(boshqalar), rnd),
        yolYoriq: "Siklni xayolan bir marta aylantir: i qanday oʻzgaradi va tanaga nima kiradi?",
        nega: x.nega,
      };
    }, prev, rr);
  }

  const QOLIP = C.BOSH + "\n    \n" + C.OXIR;

  const YOZISHLAR = [
    {
      id: "yigindi", savol: "n ni oʻqib, 1 dan n gacha sonlar yigʻindisini chiqar.",
      sinovlar: [{ kirish: ["5"], chiqish: ["15"] }, { kirish: ["100"], chiqish: ["5050"] }],
      yechim: C.dastur(["int n;", "cin >> n;", "int s = 0;", "for (int i = 1; i <= n; i++) {", "    s += i;", "}", C.chiqar("s")]),
      yolYoriq: "Yigʻindini 0 dan boshla, sikl ichida s += i deb qoʻsh.",
    },
    {
      id: "eng-katta", savol: "n ta sonni oʻqib, eng kattasini chiqar.",
      sinovlar: [{ kirish: ["5", "3 9 2 7 5"], chiqish: ["9"] }, { kirish: ["3", "-4 -9 -1"], chiqish: ["-1"] }],
      yechim: C.dastur(["int n;", "cin >> n;", "int eng;", "cin >> eng;", "for (int i = 1; i < n; i++) {",
        "    int x;", "    cin >> x;", "    if (x > eng) eng = x;", "}", C.chiqar("eng")]),
      yolYoriq: "Birinchi sonni «eng katta» deb ol, keyingilarini u bilan solishtir. Nolni boshlangʻich qilib olma — manfiy sonlar bor.",
    },
    {
      id: "juftlar", savol: "n ta sonni oʻqib, nechtasi juft ekanini chiqar.",
      sinovlar: [{ kirish: ["6", "1 2 3 4 5 6"], chiqish: ["3"] }, { kirish: ["4", "7 7 7 8"], chiqish: ["1"] }],
      yechim: C.dastur(["int n;", "cin >> n;", "int k = 0;", "for (int i = 0; i < n; i++) {", "    int x;",
        "    cin >> x;", "    if (x % 2 == 0) k++;", "}", C.chiqar("k")]),
      yolYoriq: "Juftlik sharti: x % 2 == 0.",
    },
    {
      id: "jadval", savol: "n ni oʻqib, koʻpaytirish jadvalining n-qatorini chiqar: har satrda «n x i = natija».",
      sinovlar: [{ kirish: ["3"], chiqish: ["3 x 1 = 3", "3 x 2 = 6", "3 x 3 = 9", "3 x 4 = 12", "3 x 5 = 15"] }],
      yechim: C.dastur(["int n;", "cin >> n;", "for (int i = 1; i <= 5; i++) {",
        '    cout << n << " x " << i << " = " << n * i << "\\n";', "}"]),
      yolYoriq: "Bitta cout ichida matn va sonlar navbat bilan yoziladi: n << \" x \" << i << …",
    },
    // ---- 2026-10-02: to'rt yangi masala (zina 1–2). Hammasi yadroda ham, g++ da ham tekshirilgan ----
    {
      id: "faktorial", tier: 1, savol: "n ni oʻqib (n ≤ 12), n! ni chiqar: 1 × 2 × … × n. 0! = 1.",
      sinovlar: [{ kirish: ["5"], chiqish: ["120"] }, { kirish: ["1"], chiqish: ["1"] }, { kirish: ["10"], chiqish: ["3628800"] }, { kirish: ["0"], chiqish: ["1"] }],
      yechim: C.dastur(["int n;", "cin >> n;", "int f = 1;", "for (int i = 2; i <= n; i++) {", "    f *= i;", "}", C.chiqar("f")]),
      yolYoriq: "Koʻpaytmani 1 dan boshla (0 dan emas — aks holda hammasi nol boʻladi).",
    },
    {
      id: "raqamlar", tier: 1, savol: "Musbat son n ni oʻqib, raqamlari yigʻindisini chiqar.",
      sinovlar: [{ kirish: ["5382"], chiqish: ["18"] }, { kirish: ["7"], chiqish: ["7"] }, { kirish: ["1000"], chiqish: ["1"] }, { kirish: ["999"], chiqish: ["27"] }],
      yechim: C.dastur(["int n;", "cin >> n;", "int s = 0;", "while (n > 0) {", "    s += n % 10;", "    n = n / 10;", "}", C.chiqar("s")]),
      yolYoriq: "Oxirgi raqam — n % 10; uni olib tashlash — n / 10. Son tugaguncha takrorla (while).",
    },
    {
      id: "tub", tier: 2, savol: "n ni oʻqi. U tub son boʻlsa «tub», aks holda «tub emas» deb yoz. (1 — tub emas, 2 — tub.)",
      sinovlar: [{ kirish: ["7"], chiqish: ["tub"] }, { kirish: ["1"], chiqish: ["tub emas"] }, { kirish: ["25"], chiqish: ["tub emas"] },
        { kirish: ["2"], chiqish: ["tub"] }, { kirish: ["97"], chiqish: ["tub"] }, { kirish: ["49"], chiqish: ["tub emas"] }],
      yechim: C.dastur(["int n;", "cin >> n;", "bool tub = n >= 2;", "for (int d = 2; d * d <= n; d++) {",
        "    if (n % d == 0) tub = false;", "}", "if (tub) {", '    cout << "tub\\n";', "} else {", '    cout << "tub emas\\n";', "}"]),
      yolYoriq: "2 dan boshlab boʻluvchi qidir. Topilsa — tub emas. 1 ni alohida oʻyla: uning boʻluvchisi topilmaydi, lekin u tub emas.",
    },
    {
      id: "ekub", tier: 2, savol: "Ikki musbat sonni oʻqib, eng katta umumiy boʻluvchisini chiqar.",
      sinovlar: [{ kirish: ["12 18"], chiqish: ["6"] }, { kirish: ["17 5"], chiqish: ["1"] }, { kirish: ["100 25"], chiqish: ["25"] }, { kirish: ["7 7"], chiqish: ["7"] }],
      yechim: C.dastur(["int a, b;", "cin >> a >> b;", "while (b != 0) {", "    int t = a % b;", "    a = b;", "    b = t;", "}", C.chiqar("a")]),
      yolYoriq: "Kattasini kichigiga boʻlgandagi qoldiq bilan almashtirib bor — qoldiq 0 boʻlganda toʻxta. Yoki: ikkalasini ham boʻladigan eng katta sonni sikl bilan qidir.",
    },
  ];

  function yozTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const y = zinadan(YOZISHLAR, tier, rnd);
      return Object.assign({ tur: "yoz", qolip: QOLIP, rows: 9 }, y, { id: "yoz:" + y.id });
    }, prev, rr);
  }

  const bosqich3Task = (prev, correct, tier) => ((correct || 0) % 2 === 0 ? xatoTask(null, prev, tier) : yozTask(null, prev, tier));

  // ---------- Parity testi uchun namunalar ----------
  function namunalar(soni) {
    let seed = 20261002;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    const out = [];
    const korilgan = new Set();
    for (const y of YOZISHLAR) {
      for (const sinov of y.sinovlar) {
        out.push({ id: "yechim:" + y.id + ":" + sinov.kirish.join("|"), kod: y.yechim, kirish: sinov.kirish, chiqish: sinov.chiqish });
      }
    }
    const yasovchilar = [qavsTask, tengTask, siklTask, yigindiTask];
    // Yechimlardan TASHQARI yana `soni` ta yasalgan misol (yechimlar ko'paygani uchun alohida sanaladi)
    const kerak = out.length + (soni || 24);
    let prev = null;
    for (let k = 0; out.length < kerak && k < (soni || 24) * 10; k++) {
      const task = yasovchilar[k % yasovchilar.length](rnd, prev);
      prev = task;
      if (!task || korilgan.has(task.id)) continue;
      korilgan.add(task.id);
      out.push({ id: task.id, kod: task.kod, kirish: [], chiqish: task.chiqish });
    }
    return out;
  }

  const api = {
    SIKLLAR, XATOLAR, YOZISHLAR, QOLIP, ket,
    qavsTask, tengTask, siklTask, yigindiTask, xatoTask, yozTask,
    bosqich1Task, bosqich2Task, bosqich3Task, namunalar,
  };
  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
