// 36-o'yin: algoritmning xossalari va ikki yechimni solishtirish (sof mantiq).
// Qadamlar sonini talqinchining o'zi sanaydi: py.run(kod).steps
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

  // ---------- Beshta xossa ----------
  const XOSSALAR = [
    { id: "tushunarlilik", nom: "Tushunarlilik", izoh: "Har buyruq bajaruvchi tushunadigan boʻlishi kerak." },
    { id: "aniqlik", nom: "Aniqlik", izoh: "Har qadam faqat bitta xil tushunilishi kerak — “bir oz” degani yaramaydi." },
    { id: "diskretlik", nom: "Diskretlik", izoh: "Ish qadamlarga boʻlinadi va ular birin-ketin bajariladi." },
    { id: "natijaviylik", nom: "Natijaviylik", izoh: "Chekli qadamdan keyin natija chiqishi kerak — toʻxtamasa, algoritm emas." },
    { id: "ommaviylik", nom: "Ommaviylik", izoh: "Bir turdagi hamma masalaga yaraydi, faqat bitta songa emas." },
  ];
  const xossaById = (id) => XOSSALAR.find((x) => x.id === id) || XOSSALAR[0];

  // ---------- Kundalik algoritmlar: bitta xossasi buzilgan ----------
  const BUZUQ = [
    {
      id: "tuz", nom: "Sho'rva",
      qadamlar: ["Suv quy", "Qaynat", "Bir oz tuz sol", "Sabzavot sol", "10 daqiqa pishir"],
      buzuq: 2, xossa: "aniqlik",
      nega: "“Bir oz” — har kim har xil tushunadi. Necha qoshiq ekanini aytish kerak.",
      tuzatilgan: "Bir choy qoshiq tuz sol",
    },
    {
      id: "chiroyli", nom: "Rasm chizish",
      qadamlar: ["Qogʻoz ol", "Qalam ol", "Toʻrtburchakni chiroyli chiz", "Ranglab qoʻy"],
      buzuq: 2, xossa: "tushunarlilik",
      nega: "“Chiroyli” — buyruq emas. Bajaruvchi nima qilishini bilmaydi.",
      tuzatilgan: "Tomoni 5 sm boʻlgan kvadrat chiz",
    },
    {
      id: "qaynash", nom: "Choy damlash",
      qadamlar: ["Suv quy", "Olovni yoq", "Suv qaynaguncha kut", "Qaynamasa, yana kut", "Choy sol"],
      buzuq: 3, xossa: "natijaviylik",
      nega: "Bu qadam hech qachon tugamaydi — algoritm toʻxtashi kerak.",
      tuzatilgan: "Suv qaynasa, olovni oʻchir",
    },
    {
      id: "bitta-son", nom: "Kvadratni topish",
      qadamlar: ["Sonni ol", "Agar son 5 boʻlsa, javob 25", "Javobni ayt"],
      buzuq: 1, xossa: "ommaviylik",
      nega: "Faqat bitta son uchun ishlaydi. Algoritm har qanday son uchun yarashi kerak.",
      tuzatilgan: "Sonni oʻziga koʻpaytir",
    },
    {
      id: "barobar", nom: "Uyni yigʻishtirish",
      qadamlar: ["Hammasini bir vaqtda qil: supur, yuv, joyla", "Chiqib ket"],
      buzuq: 0, xossa: "diskretlik",
      nega: "Ish alohida qadamlarga boʻlinmagan. Har qadam birin-ketin bajariladi.",
      tuzatilgan: "Avval supur, keyin yuv, keyin joyla",
    },
    {
      id: "yol", nom: "Yoʻl koʻrsatma",
      qadamlar: ["Koʻchaga chiq", "Biroz yur", "Katta binoni koʻrsang, burilib ket"],
      buzuq: 1, xossa: "aniqlik",
      nega: "“Biroz” va “katta bino” aniq emas. Qadam soni va yoʻnalish kerak.",
      tuzatilgan: "200 metr toʻgʻri yur",
    },
    {
      id: "sanash", nom: "Sonlarni sanash",
      qadamlar: ["Hisoblagichni 0 qil", "Sonlarni koʻzdan kechir", "Yaxshi sonlarni sana", "Natijani ayt"],
      buzuq: 2, xossa: "tushunarlilik",
      nega: "“Yaxshi son” nima ekani aytilmagan — bajaruvchi buni bilmaydi.",
      tuzatilgan: "Juft sonlarni sana",
    },
  ];

  function xossaTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const b = pick(BUZUQ, rnd);
      return Object.assign({ tur: "xossa" }, b);
    }, prev, rr);
  }

  // ---------- Bir masala — ikki yechim ----------
  // Har juftlik: bir xil javob, boshqa qadam soni
  const JUFTLAR = [
    {
      id: "yigindi",
      savol: "1 dan n gacha yigʻindi",
      n: 100,
      a: { nom: "Sikl bilan", kod: "s = 0\nfor i in range(1, 101):\n    s += i\nprint(s)" },
      b: { nom: "Formula bilan", kod: "n = 100\nprint(n * (n + 1) // 2)" },
    },
    {
      id: "juftlar",
      savol: "1 dan 50 gacha nechta juft son bor",
      n: 50,
      a: { nom: "Hammasini sanab", kod: "soni = 0\nfor i in range(1, 51):\n    if i % 2 == 0:\n        soni += 1\nprint(soni)" },
      b: { nom: "Boʻlib", kod: "print(50 // 2)" },
    },
    {
      id: "kopaytma",
      savol: "5 ni 8 ga koʻpaytirish",
      n: 8,
      a: { nom: "Qoʻshib chiqib", kod: "s = 0\nfor i in range(8):\n    s += 5\nprint(s)" },
      b: { nom: "Koʻpaytirib", kod: "print(5 * 8)" },
    },
    {
      id: "kvadratlar",
      savol: "1 dan 20 gacha kvadratlar yigʻindisi",
      n: 20,
      a: { nom: "Sikl bilan", kod: "s = 0\nfor i in range(1, 21):\n    s += i * i\nprint(s)" },
      b: { nom: "Formula bilan", kod: "n = 20\nprint(n * (n + 1) * (2 * n + 1) // 6)" },
    },
  ];

  // Qadamlarni talqinchi sanaydi
  function olcha(kod) {
    const r = py.run(kod, { maxSteps: 1000000 });
    return { qadam: r.steps, chiqish: r.output, xato: r.error };
  }

  function juftTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const j = pick(JUFTLAR, rnd);
      const a = olcha(j.a.kod);
      const b = olcha(j.b.kod);
      if (a.xato || b.xato) return null;
      if (String(a.chiqish) !== String(b.chiqish)) return null; // javob bir xil boʻlishi shart
      if (a.qadam === b.qadam) return null;
      return Object.assign({ tur: "juft", id: j.id, javob: b.qadam < a.qadam ? "b" : "a", olchov: { a: a.qadam, b: b.qadam }, natija: a.chiqish[0] }, j);
    }, prev, rr);
  }

  // ---------- Kodda buzilgan xossa ----------
  const KODLAR = [
    {
      id: "cheksiz", xossa: "natijaviylik",
      kod: "i = 1\nwhile i <= 5:\n    print(i)",
      nega: "Hisoblagich oʻzgarmaydi — sikl hech qachon toʻxtamaydi.",
      yechim: "i = 1\nwhile i <= 5:\n    print(i)\n    i += 1",
      tests: [{ stdin: [], out: ["1", "2", "3", "4", "5"] }],
      what: "Bu kod 1 dan 5 gacha chiqarishi kerak, lekin toʻxtamaydi. Tuzat.",
    },
    {
      id: "faqat-uch", xossa: "ommaviylik",
      kod: 'n = int(input())\nif n == 3:\n    print(9)',
      nega: "Faqat 3 uchun ishlaydi. Boshqa son kiritilsa, hech narsa chiqmaydi.",
      yechim: "n = int(input())\nprint(n * n)",
      tests: [{ stdin: ["3"], out: ["9"] }, { stdin: ["7"], out: ["49"] }, { stdin: ["0"], out: ["0"] }],
      what: "Bu kod kiritilgan sonning kvadratini chiqarishi kerak. Hozir faqat bitta songa ishlaydi — tuzat.",
    },
    {
      id: "nol-bolish", xossa: "natijaviylik",
      kod: "n = int(input())\nprint(100 // n)",
      nega: "n nol boʻlsa, dastur xato bilan toʻxtaydi — natija chiqmaydi.",
      yechim: 'n = int(input())\nif n == 0:\n    print(0)\nelse:\n    print(100 // n)',
      tests: [{ stdin: ["4"], out: ["25"] }, { stdin: ["0"], out: ["0"] }, { stdin: ["3"], out: ["33"] }],
      what: "Bu kod 100 ni kiritilgan songa boʻlishi kerak. Nol kiritilsa yiqilib qoladi — nol uchun 0 chiqarsin.",
    },
  ];

  function kodTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => Object.assign({ tur: "kod" }, pick(KODLAR, rnd)), prev, rr);
  }

  // 3-bosqichda navbat bilan: xossani top / kodni tuzat
  function stage3Task(r, prev) {
    const rr = r || Math.random;
    const k = kodTask(rr, prev && prev.tur === "tuzat" ? null : prev);
    const wantFix = prev ? prev.tur !== "tuzat" : rr() < 0.5;
    return Object.assign({}, k, { tur: wantFix ? "tuzat" : "kod", id: (wantFix ? "tuzat:" : "kod:") + k.id });
  }

  const api = { XOSSALAR, xossaById, BUZUQ, JUFTLAR, KODLAR, olcha, xossaTask, juftTask, kodTask, stage3Task };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
