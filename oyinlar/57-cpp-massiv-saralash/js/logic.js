// 57-o'yin: C++ bloki — massiv, satr, vector va sort (CPP-BLOK.md, mavzular 7–9 va 11).
// Sof mantiq, ekransiz. Node'da test qilinadi: tests/logic.test.js
//
// Massiv va satr — bola YOZADI (yadroda ishlaydi).
// vector va sort — faqat O'QILADI: yadroda yo'q, lekin misollarning chiqishi
// haqiqiy g++ bilan tekshiriladi (umumiy/tests/cpp-parity.test.js).
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
  // Zina berilmasa (testlar, parity namunalari) — eng qiyini.
  const zina = (tier) => (tier == null ? 2 : Math.max(0, Math.min(2, tier)));

  function zinadan(list, tier, rnd) {
    if (tier == null) return pick(list, rnd);
    const t = zina(tier);
    const mos = list.filter((x) => (x.tier || 0) <= t);
    const ayni = mos.filter((x) => (x.tier || 0) === t);
    return ayni.length && rnd() < 0.6 ? pick(ayni, rnd) : pick(mos, rnd);
  }

  // ---------- 1-bosqich: massiv ----------
  const sonlar = (rnd, n, a, b) => Array.from({ length: n }, () => int(rnd, a, b));

  // 2026-10-02: zina bilan massiv uzayadi (4–5 → 5–6 → 6–8), oxirgi zinada manfiy sonlar va
  // uch yangi tur keladi: juftlar soni, o'sgan joylar soni, chetlarni almashtirish.
  const MASSIV_TURLARI = [
    { id: "yigindi", tier: 0 }, { id: "eng-katta", tier: 0 }, { id: "teskari", tier: 0 }, { id: "indeks", tier: 0 },
    { id: "juftlar", tier: 1 }, { id: "osgan", tier: 2 }, { id: "almashtir", tier: 2 },
  ];
  const MASSIV_UZUNLIK = [[4, 5], [5, 6], [6, 8]];

  function massivTask(r, prev, tier) {
    const rr = r || Math.random;
    const t = zina(tier);
    return pickNew((rnd) => {
      const tur = zinadan(MASSIV_TURLARI, tier, rnd).id;
      const n = int(rnd, MASSIV_UZUNLIK[t][0], MASSIV_UZUNLIK[t][1]);
      const a = sonlar(rnd, n, t === 2 ? -9 : 1, t === 0 ? 20 : 30);
      const elon = ["int a[" + n + "] = {" + a.join(", ") + "};"];
      let tana;
      let chiqish;
      if (tur === "juftlar") {
        tana = elon.concat(["int k = 0;", "for (int i = 0; i < " + n + "; i++) if (a[i] % 2 == 0) k++;", C.chiqar("k")]);
        chiqish = [String(a.filter((x) => x % 2 === 0).length)];
      } else if (tur === "osgan") {
        // Qo'shnisidan katta bo'lgan kataklar soni: sikl 1 dan boshlanadi (a[i - 1] bor bo'lishi uchun)
        tana = elon.concat(["int k = 0;", "for (int i = 1; i < " + n + "; i++) if (a[i] > a[i - 1]) k++;", C.chiqar("k")]);
        chiqish = [String(a.filter((x, i) => i > 0 && x > a[i - 1]).length)];
      } else if (tur === "almashtir") {
        tana = elon.concat(["int t = a[0];", "a[0] = a[" + (n - 1) + "];", "a[" + (n - 1) + "] = t;",
          "for (int i = 0; i < " + n + "; i++) cout << a[i] << \" \";", 'cout << "\\n";']);
        const b = a.slice();
        b[0] = a[n - 1];
        b[n - 1] = a[0];
        chiqish = [b.join(" ") + " "];
      } else
      if (tur === "yigindi") {
        tana = elon.concat(["int s = 0;", "for (int i = 0; i < " + n + "; i++) s += a[i];", C.chiqar("s")]);
        chiqish = [String(a.reduce((x, y) => x + y, 0))];
      } else if (tur === "eng-katta") {
        tana = elon.concat(["int m = a[0];", "for (int i = 1; i < " + n + "; i++) if (a[i] > m) m = a[i];", C.chiqar("m")]);
        chiqish = [String(Math.max(...a))];
      } else if (tur === "teskari") {
        tana = elon.concat(["for (int i = " + (n - 1) + "; i >= 0; i--) cout << a[i] << \" \";", 'cout << "\\n";']);
        chiqish = [a.slice().reverse().join(" ") + " "];
      } else {
        const i = int(rnd, 0, n - 1);
        const j = int(rnd, 0, n - 1);
        tana = elon.concat([C.chiqar("a[" + i + "] << \" \" << a[" + j + "]")]);
        chiqish = [a[i] + " " + a[j]];
      }
      return {
        id: "massiv:" + tur + ":" + a.join("-"), tur: "natija", kod: C.dastur(tana), chiqish,
        savol: "Bu dastur nima chiqaradi?",
        nega: "Massivning birinchi katagi a[0], oxirgisi a[" + (n - 1) + "] — indeks noldan boshlanadi.",
      };
    }, prev, rr);
  }

  // Chegaradan chiqish — C++ da aniqlanmagan xatti-harakat.
  // Buni dasturda ko'rsatib bo'lmaydi (har kompilyatorda har xil), shuning uchun savol — tanlov.
  const CHEGARA_JAVOB = "Dastur toʻxtamaydi, lekin javob buzilishi mumkin";
  const ICHIDA_JAVOB = "Hammasi joyida — yozilgan kataklar massiv ichida";
  const CHEGARA_VARIANTLAR = [CHEGARA_JAVOB, ICHIDA_JAVOB, "Dastur xato berib toʻxtaydi", "Massiv oʻzi kattalashadi"];

  // 2026-10-02: oldin javob DOIM bir xil edi (CHEGARA_JAVOB) — bola o'qimasdan bosardi.
  // Endi dastur ba'zan chegaradan chiqadi, ba'zan yo'q (oxirgi katak a[n − 1], sikl sharti i < n):
  // bola indeksni massiv bo'yi bilan o'zi solishtiradi. Savol matni javobni aytmaydi.
  //   yozuv — bitta katakka yozish: a[n − 1] (ichida), a[n], a[n + 1] (tashqarida)
  //   sikl  — to'ldiruvchi siklning sharti: i < n (ichida) yoki i <= n (bitta ortiq)
  //   surish — a[i + 1] = a[i]: sikl n − 1 gacha (ichida) yoki n gacha (tashqarida)
  const CHEGARA_TURLARI = [{ id: "yozuv", tier: 0 }, { id: "sikl", tier: 1 }, { id: "surish", tier: 2 }];

  function chegaraTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const tur = zinadan(CHEGARA_TURLARI, tier, rnd).id;
      const n = int(rnd, 3, 6);
      const chiqadi = rnd() < 0.5;
      let tana;
      let oxirgi; // dastur yozadigan eng katta indeks
      if (tur === "yozuv") {
        oxirgi = chiqadi ? pick([n, n + 1], rnd) : n - 1;
        tana = ["int a[" + n + "];", "for (int i = 0; i < " + n + "; i++) a[i] = i;", "a[" + oxirgi + "] = 100;"];
      } else if (tur === "sikl") {
        oxirgi = chiqadi ? n : n - 1;
        tana = ["int a[" + n + "];", "for (int i = 0; i " + (chiqadi ? "<=" : "<") + " " + n + "; i++) a[i] = i * 2;"];
      } else {
        oxirgi = chiqadi ? n : n - 1;
        tana = ["int a[" + n + "];", "a[0] = 1;",
          "for (int i = 0; i < " + (chiqadi ? n : n - 1) + "; i++) a[i + 1] = a[i] + 1;"];
      }
      tana.push(C.chiqar('"tayyor"'));
      return {
        id: "chegara:" + tur + ":" + n + ":" + oxirgi, tur: "chegara", kind: tur, chiqadi, n, oxirgi, kod: C.dastur(tana),
        savol: "Massivda " + n + " ta katak bor. Dastur qaysi kataklarga yozyapti — va nima boʻladi?",
        javob: chiqadi ? CHEGARA_JAVOB : ICHIDA_JAVOB,
        variantlar: aralash(CHEGARA_VARIANTLAR, rnd),
        yolYoriq: "Massivning oxirgi katagi qaysi indeksda? Dastur yozadigan eng katta indeksni top va shu bilan solishtir.",
        nega: chiqadi
          ? "Kataklar a[0] … a[" + (n - 1) + "], dastur esa a[" + oxirgi + "] ga ham yozyapti. C++ da bu «aniqlanmagan xatti-harakat»: "
            + "dastur ishlayveradi, lekin begona joyga yozadi. Javob toʻgʻri ham chiqishi mumkin, buzuq ham — "
            + "shuning uchun bu eng yomon xato turi. Oʻyin ichida uni ataylab toʻxtatamiz."
          : "Kataklar a[0] … a[" + (n - 1) + "]. Dastur yozgan eng katta indeks — " + oxirgi
            + ": bu oxirgi katak, chegaradan chiqilmadi.",
      };
    }, prev, rr);
  }

  const QOLIP = C.BOSH + "\n    \n" + C.OXIR;

  const MASSIV_YOZISH = [
    {
      id: "teskari", savol: "n ta sonni oʻqib, teskari tartibda chiqar (orasida boʻshliq bilan).",
      sinovlar: [{ kirish: ["5", "1 2 3 4 5"], chiqish: ["5 4 3 2 1 "] }, { kirish: ["3", "7 8 9"], chiqish: ["9 8 7 "] }],
      yechim: C.dastur(["int n;", "cin >> n;", "int a[100];", "for (int i = 0; i < n; i++) cin >> a[i];",
        "for (int i = n - 1; i >= 0; i--) cout << a[i] << \" \";", 'cout << "\\n";']),
      yolYoriq: "Avval hammasini massivga oʻqi, keyin oxiridan boshiga qarab chiqar.",
    },
    {
      id: "ortachadan-katta", savol: "n ta sonni oʻqib, oʻrtachadan katta nechtasi borligini chiqar.",
      sinovlar: [{ kirish: ["5", "1 2 3 4 10"], chiqish: ["1"] }, { kirish: ["4", "10 10 10 10"], chiqish: ["0"] }],
      yechim: C.dastur(["int n;", "cin >> n;", "int a[100];", "long long s = 0;",
        "for (int i = 0; i < n; i++) {", "    cin >> a[i];", "    s += a[i];", "}",
        "int k = 0;", "for (int i = 0; i < n; i++) if (a[i] * n > s) k++;", C.chiqar("k")]),
      yolYoriq: "Oʻrtachani bilish uchun avval hammasini oʻqish kerak — demak sonlarni saqlab qoʻyish shart.",
    },
    // 2026-10-02: uch yangi masala (zina 1–2)
    {
      id: "eng-katta-indeks", tier: 1,
      savol: "n ta sonni oʻqib, eng kattasi nechanchi katakda turganini chiqar (kataklar 0 dan sanaladi; bir nechta boʻlsa — birinchisi).",
      sinovlar: [{ kirish: ["5", "3 9 2 7 5"], chiqish: ["1"] }, { kirish: ["4", "3 9 2 9"], chiqish: ["1"] },
        { kirish: ["3", "-4 -9 -1"], chiqish: ["2"] }, { kirish: ["1", "7"], chiqish: ["0"] }],
      yechim: C.dastur(["int n;", "cin >> n;", "int a[100];", "for (int i = 0; i < n; i++) cin >> a[i];",
        "int eng = 0;", "for (int i = 1; i < n; i++) {", "    if (a[i] > a[eng]) eng = i;", "}", C.chiqar("eng")]),
      yolYoriq: "Qiymatni emas, indeksni eslab qol: eng = 0 dan boshla va a[i] ni a[eng] bilan solishtir.",
    },
    {
      id: "ikkinchi-katta", tier: 2,
      savol: "n ta har xil sonni oʻqib (n kamida 2), ikkinchi eng kattasini chiqar.",
      sinovlar: [{ kirish: ["5", "3 9 2 7 5"], chiqish: ["7"] }, { kirish: ["2", "10 20"], chiqish: ["10"] },
        { kirish: ["3", "-4 -9 -1"], chiqish: ["-4"] }, { kirish: ["4", "8 1 9 5"], chiqish: ["8"] }],
      yechim: C.dastur(["int n;", "cin >> n;", "int a[100];", "for (int i = 0; i < n; i++) cin >> a[i];",
        "int bir = a[0];", "int ikki = a[1];", "if (ikki > bir) {", "    bir = a[1];", "    ikki = a[0];", "}",
        "for (int i = 2; i < n; i++) {", "    if (a[i] > bir) {", "        ikki = bir;", "        bir = a[i];",
        "    } else if (a[i] > ikki) {", "        ikki = a[i];", "    }", "}", C.chiqar("ikki")]),
      yolYoriq: "Ikkita oʻzgaruvchi tut: eng kattasi va undan keyingisi. Yangi son eng kattadan oshsa — eskisi ikkinchiga tushadi.",
    },
    {
      id: "pufakcha", tier: 2,
      savol: "n ta sonni oʻqib, pufakcha usulida oʻsish tartibida saralab chiqar (orasida boʻshliq bilan).",
      sinovlar: [{ kirish: ["5", "5 2 9 1 7"], chiqish: ["1 2 5 7 9 "] }, { kirish: ["3", "3 3 1"], chiqish: ["1 3 3 "] },
        { kirish: ["1", "4"], chiqish: ["4 "] }, { kirish: ["4", "-2 0 -7 5"], chiqish: ["-7 -2 0 5 "] }],
      yechim: C.dastur(["int n;", "cin >> n;", "int a[100];", "for (int i = 0; i < n; i++) cin >> a[i];",
        "for (int oxir = n - 1; oxir > 0; oxir--) {", "    for (int i = 0; i < oxir; i++) {",
        "        if (a[i] > a[i + 1]) {", "            int t = a[i];", "            a[i] = a[i + 1];",
        "            a[i + 1] = t;", "        }", "    }", "}",
        "for (int i = 0; i < n; i++) cout << a[i] << \" \";", 'cout << "\\n";']),
      yolYoriq: "Ikki qavat sikl: ichkisi qoʻshni kataklarni solishtiradi (a[i] va a[i + 1]) — shuning uchun i oxirgi katakkacha bormaydi.",
    },
  ];

  function massivYozTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const y = zinadan(MASSIV_YOZISH, tier, rnd);
      return Object.assign({ tur: "yoz", qolip: QOLIP, rows: 9 }, y, { id: "yoz:" + y.id });
    }, prev, rr);
  }

  const bosqich1Task = (prev, correct, tier) => {
    const n = (correct || 0) % 3;
    if (n === 0) return massivTask(null, prev, tier);
    if (n === 1) return chegaraTask(null, prev, tier);
    return massivYozTask(null, prev, tier);
  };

  // ---------- 2-bosqich: satr ----------
  const SOZLAR = ["salom", "qabila", "dastur", "olimpiada", "kompyuter", "maktab", "daftar", "quyosh"];
  const UNLILAR = "aeiou";

  // 2026-10-02: zina 1 — oxirgi harflar; zina 2 — birinchi harf necha marta, qo'shilgan satr uzunligi
  const SATR_TURLARI = [
    { id: "uzunlik", tier: 0 }, { id: "belgi", tier: 0 }, { id: "unli", tier: 0 }, { id: "teskari", tier: 0 },
    { id: "oxirgi", tier: 1 }, { id: "sanash", tier: 2 }, { id: "qoshish", tier: 2 },
  ];

  function satrTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const s = pick(SOZLAR, rnd);
      const tur = zinadan(SATR_TURLARI, tier, rnd).id;
      const elon = ['string s = "' + s + '";'];
      let tana;
      let chiqish;
      if (tur === "oxirgi") {
        tana = elon.concat([C.chiqar("s[s.size() - 1] << s[s.size() - 2]")]);
        chiqish = [s[s.length - 1] + s[s.length - 2]];
      } else if (tur === "sanash") {
        tana = elon.concat(["int k = 0;", "for (int i = 0; i < s.size(); i++) {", "    if (s[i] == s[0]) k++;", "}", C.chiqar("k")]);
        chiqish = [String([...s].filter((ch) => ch === s[0]).length)];
      } else if (tur === "qoshish") {
        const t = pick(SOZLAR.filter((x) => x !== s), rnd);
        tana = elon.concat(['string t = "' + t + '";', "string u = s + t;", C.chiqar("u.size() << \" \" << u[" + s.length + "]")]);
        chiqish = [(s.length + t.length) + " " + t[0]];
      } else if (tur === "uzunlik") {
        tana = elon.concat([C.chiqar("s.size()")]);
        chiqish = [String(s.length)];
      } else if (tur === "belgi") {
        const i = int(rnd, 0, s.length - 1);
        tana = elon.concat([C.chiqar("s[" + i + "]")]);
        chiqish = [s[i]];
      } else if (tur === "unli") {
        tana = elon.concat(["int k = 0;",
          "for (int i = 0; i < s.size(); i++) {",
          "    if (s[i] == 'a' || s[i] == 'e' || s[i] == 'i' || s[i] == 'o' || s[i] == 'u') k++;",
          "}", C.chiqar("k")]);
        chiqish = [String([...s].filter((ch) => UNLILAR.includes(ch)).length)];
      } else {
        tana = elon.concat(["for (int i = s.size() - 1; i >= 0; i--) cout << s[i];", 'cout << "\\n";']);
        chiqish = [[...s].reverse().join("")];
      }
      return {
        id: "satr:" + tur + ":" + s, tur: "natija", kod: C.dastur(tana, { string: true }), chiqish,
        savol: "Bu dastur nima chiqaradi?",
        nega: "Satr ham massivga oʻxshaydi: s[0] — birinchi harf, s.size() — uzunligi. "
          + "Pythondagidek kesib olish (s[1:4]) C++ da yoʻq — indeks bilan ishlanadi.",
      };
    }, prev, rr);
  }

  const SATR_YOZISH = [
    {
      id: "unlilar", savol: "Bitta soʻzni oʻqib, unli harflar sonini chiqar (a, e, i, o, u).",
      sinovlar: [{ kirish: ["qabila"], chiqish: ["3"] }, { kirish: ["kitob"], chiqish: ["2"] }],
      yechim: C.dastur(["string s;", "cin >> s;", "int k = 0;", "for (int i = 0; i < s.size(); i++) {",
        "    if (s[i] == 'a' || s[i] == 'e' || s[i] == 'i' || s[i] == 'o' || s[i] == 'u') k++;", "}", C.chiqar("k")],
      { string: true }),
      yolYoriq: "Har harfni beshta unli bilan solishtir: s[i] == 'a' || s[i] == 'e' || …",
    },
    {
      id: "teskari-soz", savol: "Bitta soʻzni oʻqib, teskari yozib chiqar.",
      sinovlar: [{ kirish: ["salom"], chiqish: ["molas"] }, { kirish: ["abc"], chiqish: ["cba"] }],
      yechim: C.dastur(["string s;", "cin >> s;", "for (int i = s.size() - 1; i >= 0; i--) cout << s[i];",
        'cout << "\\n";'], { string: true }),
      yolYoriq: "Oxirgi harfning indeksi s.size() - 1.",
    },
    // 2026-10-02: ikki yangi masala (zina 1–2)
    {
      id: "harf-sanash", tier: 1,
      savol: "Bitta soʻz va bitta harf oʻqiladi (orasida boʻshliq). Shu harf soʻzda necha marta uchrashini chiqar.",
      sinovlar: [{ kirish: ["qabila a"], chiqish: ["2"] }, { kirish: ["kitob z"], chiqish: ["0"] },
        { kirish: ["aaaa a"], chiqish: ["4"] }, { kirish: ["dastur r"], chiqish: ["1"] }],
      yechim: C.dastur(["string s, h;", "cin >> s >> h;", "int k = 0;", "for (int i = 0; i < s.size(); i++) {",
        "    if (s[i] == h[0]) k++;", "}", C.chiqar("k")], { string: true }),
      yolYoriq: "Harfni ham string qilib oʻqish mumkin: uning birinchi belgisi — h[0].",
    },
    {
      id: "palindrom", tier: 2,
      savol: "Bitta soʻzni oʻqi. Chapdan ham, oʻngdan ham bir xil oʻqilsa «palindrom», aks holda «palindrom emas» deb yoz.",
      sinovlar: [{ kirish: ["abba"], chiqish: ["palindrom"] }, { kirish: ["salom"], chiqish: ["palindrom emas"] },
        { kirish: ["a"], chiqish: ["palindrom"] }, { kirish: ["abca"], chiqish: ["palindrom emas"] },
        { kirish: ["kiyik"], chiqish: ["palindrom"] }],
      yechim: C.dastur(["string s;", "cin >> s;", "int n = s.size();", "bool ok = true;",
        "for (int i = 0; i < n; i++) {", "    if (s[i] != s[n - 1 - i]) ok = false;", "}",
        "if (ok) {", '    cout << "palindrom\\n";', "} else {", '    cout << "palindrom emas\\n";', "}"], { string: true }),
      yolYoriq: "s[i] ning «oynadagi» jufti — s[n - 1 - i]. Bitta juftlik mos kelmasa ham — palindrom emas.",
    },
  ];

  function satrYozTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const y = zinadan(SATR_YOZISH, tier, rnd);
      return Object.assign({ tur: "yoz", qolip: QOLIP, rows: 9 }, y, { id: "yoz:" + y.id });
    }, prev, rr);
  }

  const bosqich2Task = (prev, correct, tier) => ((correct || 0) % 2 === 0 ? satrTask(null, prev, tier) : satrYozTask(null, prev, tier));

  // ---------- 3-bosqich: vector va sort (faqat o'qish) ----------
  // Bu dasturlar YADRODA ISHLAMAYDI. Chiqishlari g++ bilan tekshiriladi.
  const VBOSH = "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {";

  const vDastur = (satrlar) => VBOSH + "\n" + satrlar.map((s) => "    " + s).join("\n") + "\n    return 0;\n}";

  function vectorTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const n = int(rnd, 4, 6);
      const a = sonlar(rnd, n, 1, 30);
      const tur = pick(["push", "sort", "sort-teskari", "eng"], rnd);
      let tana;
      let chiqish;
      if (tur === "push") {
        tana = ["vector<int> v;"].concat(a.map((x) => "v.push_back(" + x + ");"))
          .concat([C.chiqar("v.size()"), C.chiqar("v[0] << \" \" << v[" + (n - 1) + "]")]);
        chiqish = [String(n), a[0] + " " + a[n - 1]];
      } else if (tur === "sort") {
        tana = ["vector<int> v = {" + a.join(", ") + "};", "sort(v.begin(), v.end());",
          "for (int i = 0; i < v.size(); i++) cout << v[i] << \" \";", 'cout << "\\n";'];
        chiqish = [a.slice().sort((x, y) => x - y).join(" ") + " "];
      } else if (tur === "sort-teskari") {
        tana = ["vector<int> v = {" + a.join(", ") + "};", "sort(v.rbegin(), v.rend());",
          "for (int i = 0; i < v.size(); i++) cout << v[i] << \" \";", 'cout << "\\n";'];
        chiqish = [a.slice().sort((x, y) => y - x).join(" ") + " "];
      } else {
        tana = ["vector<int> v = {" + a.join(", ") + "};", "sort(v.begin(), v.end());",
          C.chiqar("v[0] << \" \" << v[v.size() - 1]")];
        const s = a.slice().sort((x, y) => x - y);
        chiqish = [s[0] + " " + s[s.length - 1]];
      }
      return {
        id: "vector:" + tur + ":" + a.join("-"), tur: "natija", kod: vDastur(tana), chiqish, yadroda: false,
        savol: "Bu dastur nima chiqaradi?",
        nega: tur === "push"
          ? "vector boʻyi oʻsadigan massiv: push_back qoʻshadi, size() nechtaligini aytadi."
          : "sort(v.begin(), v.end()) — oʻsish tartibida saralaydi. rbegin/rend esa kamayish tartibida.",
      };
    }, prev, rr);
  }

  const FARQLAR = [
    {
      id: "boyi", savol: "Massiv (int a[100]) va vector orasidagi asosiy farq nima?",
      javob: "vector ning boʻyi ish paytida oʻsadi, massivniki — yoʻq",
      soxta: ["vector tezroq ishlaydi", "massivda faqat butun son saqlanadi", "vector ni saralab boʻlmaydi"],
      nega: "Massivning boʻyi eʼlonda qotiriladi. vector esa push_back bilan oʻsaveradi.",
    },
    {
      id: "sort", savol: "vector ni oʻsish tartibida saralash uchun qaysi satr yoziladi?",
      javob: "sort(v.begin(), v.end());",
      soxta: ["sort(v);", "v.sort();", "sorted(v);"],
      nega: "C++ da sort ga ikkita chegara beriladi: qayerdan va qayergacha.",
    },
    {
      id: "teskari", savol: "Kamayish tartibida saralash uchun-chi?",
      javob: "sort(v.rbegin(), v.rend());",
      soxta: ["sort(v.end(), v.begin());", "sort(v.begin(), v.end(), reverse);", "unsort(v);"],
      nega: "rbegin va rend — teskari tomondan qaraydigan chegaralar.",
    },
    {
      id: "qoshish", savol: "vector ga yangi son qanday qoʻshiladi?",
      javob: "v.push_back(x);",
      soxta: ["v.add(x);", "v.append(x);", "v[v.size()] = x;"],
      nega: "Pythondagi append ning C++ dagi nomi — push_back.",
    },
  ];

  function farqTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const f = pick(FARQLAR, rnd);
      return {
        id: "farq:" + f.id, tur: "farq", savol: f.savol, javob: f.javob,
        variantlar: aralash([f.javob, ...f.soxta], rnd),
        yolYoriq: "Esla: sort ga chegaralar beriladi, qoʻshish esa push_back bilan boʻladi.",
        nega: f.nega,
      };
    }, prev, rr);
  }

  const bosqich3Task = (prev, correct) => ((correct || 0) % 2 === 0 ? vectorTask(null, prev) : farqTask(null, prev));

  // ---------- Parity testi uchun namunalar ----------
  function namunalar(soni) {
    let seed = 5757;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    const out = [];
    const korilgan = new Set();
    for (const y of MASSIV_YOZISH.concat(SATR_YOZISH)) {
      for (const sinov of y.sinovlar) {
        out.push({ id: "yechim:" + y.id + ":" + sinov.kirish.join("|"), kod: y.yechim, kirish: sinov.kirish, chiqish: sinov.chiqish });
      }
    }
    // Yechimlardan TASHQARI yana `soni` ta yasalgan misol (yechimlar ko'paygani uchun alohida sanaladi)
    const yasovchilar = [massivTask, satrTask, vectorTask];
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
    SOZLAR, MASSIV_YOZISH, SATR_YOZISH, FARQLAR, QOLIP, CHEGARA_JAVOB, ICHIDA_JAVOB, CHEGARA_VARIANTLAR,
    MASSIV_TURLARI, SATR_TURLARI, vDastur,
    massivTask, chegaraTask, massivYozTask, satrTask, satrYozTask, vectorTask, farqTask,
    bosqich1Task, bosqich2Task, bosqich3Task, namunalar,
  };
  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
