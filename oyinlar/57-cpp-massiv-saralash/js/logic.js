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

  // ---------- 1-bosqich: massiv ----------
  const sonlar = (rnd, n, a, b) => Array.from({ length: n }, () => int(rnd, a, b));

  function massivTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const tur = pick(["yigindi", "eng-katta", "teskari", "indeks"], rnd);
      const n = int(rnd, 4, 6);
      const a = sonlar(rnd, n, 1, 20);
      const elon = ["int a[" + n + "] = {" + a.join(", ") + "};"];
      let tana;
      let chiqish;
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

  function chegaraTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const n = int(rnd, 3, 5);
      const chet = pick([n, n + 1], rnd);
      const tana = ["int a[" + n + "];", "for (int i = 0; i < " + n + "; i++) a[i] = i;", "a[" + chet + "] = 100;",
        C.chiqar('"tayyor"')];
      return {
        id: "chegara:" + n + ":" + chet, tur: "chegara", kod: C.dastur(tana),
        savol: "Massivda " + n + " ta katak bor (a[0] … a[" + (n - 1) + "]), dastur esa a[" + chet + "] ga yozyapti. Nima boʻladi?",
        javob: CHEGARA_JAVOB,
        variantlar: aralash([CHEGARA_JAVOB, "Dastur xato berib toʻxtaydi",
          "Massiv oʻzi kattalashadi", "Kompilyator yozishga ruxsat bermaydi"], rnd),
        yolYoriq: "C++ massiv chegarasini tekshirmaydi — tezlik uchun.",
        nega: "C++ da bu «aniqlanmagan xatti-harakat»: dastur ishlayveradi, lekin begona joyga yozadi. "
          + "Javob toʻgʻri ham chiqishi mumkin, buzuq ham — shuning uchun bu eng yomon xato turi. "
          + "Oʻyin ichida uni ataylab toʻxtatamiz.",
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
  ];

  function massivYozTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const y = pick(MASSIV_YOZISH, rnd);
      return Object.assign({ tur: "yoz", qolip: QOLIP, rows: 9 }, y, { id: "yoz:" + y.id });
    }, prev, rr);
  }

  const bosqich1Task = (prev, correct) => {
    const n = (correct || 0) % 3;
    if (n === 0) return massivTask(null, prev);
    if (n === 1) return chegaraTask(null, prev);
    return massivYozTask(null, prev);
  };

  // ---------- 2-bosqich: satr ----------
  const SOZLAR = ["salom", "qabila", "dastur", "olimpiada", "kompyuter", "maktab", "daftar", "quyosh"];
  const UNLILAR = "aeiou";

  function satrTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const s = pick(SOZLAR, rnd);
      const tur = pick(["uzunlik", "belgi", "unli", "teskari"], rnd);
      const elon = ['string s = "' + s + '";'];
      let tana;
      let chiqish;
      if (tur === "uzunlik") {
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
  ];

  function satrYozTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const y = pick(SATR_YOZISH, rnd);
      return Object.assign({ tur: "yoz", qolip: QOLIP, rows: 9 }, y, { id: "yoz:" + y.id });
    }, prev, rr);
  }

  const bosqich2Task = (prev, correct) => ((correct || 0) % 2 === 0 ? satrTask(null, prev) : satrYozTask(null, prev));

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
    const yasovchilar = [massivTask, satrTask, vectorTask];
    let prev = null;
    for (let k = 0; out.length < (soni || 24) && k < (soni || 24) * 10; k++) {
      const task = yasovchilar[k % yasovchilar.length](rnd, prev);
      prev = task;
      if (!task || korilgan.has(task.id)) continue;
      korilgan.add(task.id);
      out.push({ id: task.id, kod: task.kod, kirish: [], chiqish: task.chiqish });
    }
    return out;
  }

  const api = {
    SOZLAR, MASSIV_YOZISH, SATR_YOZISH, FARQLAR, QOLIP, CHEGARA_JAVOB, vDastur,
    massivTask, chegaraTask, massivYozTask, satrTask, satrYozTask, vectorTask, farqTask,
    bosqich1Task, bosqich2Task, bosqich3Task, namunalar,
  };
  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
