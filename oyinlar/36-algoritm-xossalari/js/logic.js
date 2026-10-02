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
      id: "tuz", nom: "Shoʻrva",
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
    // ---- 2026-10-02: yana 7 ta (jami 14) — ikkinchi aylanishda ham takror chiqmasin ----
    {
      id: "tez", nom: "Yugurish mashqi",
      qadamlar: ["Maydonga chiq", "Tezroq yugur", "Toʻxta"],
      buzuq: 1, xossa: "aniqlik",
      nega: "“Tezroq” — qancha tez? Masofa ham, vaqt ham aytilmagan: har kim har xil bajaradi.",
      tuzatilgan: "400 metrni 2 daqiqada yugur",
    },
    {
      id: "kayfiyat", nom: "Robotga buyruq",
      qadamlar: ["Oldinga 3 qadam yur", "Oʻngga buril", "Kayfiyatga qarab davom et"],
      buzuq: 2, xossa: "tushunarlilik",
      nega: "Robotda kayfiyat yoʻq — u bu buyruqni tushunmaydi. Bajaruvchi biladigan buyruq kerak.",
      tuzatilgan: "Oldinga 2 qadam yur",
    },
    {
      id: "tanga", nom: "Tanga tashlash",
      qadamlar: ["Tangani tashla", "Natijani yoz", "Bitta tashlashda gerb ham, raqam ham tushmaguncha 1-qadamga qayt"],
      buzuq: 2, xossa: "natijaviylik",
      nega: "Bitta tashlashda ikkalasi birga tushmaydi — bu shart hech qachon bajarilmaydi, algoritm tugamaydi.",
      tuzatilgan: "Gerb tushmaguncha 1-qadamga qayt",
    },
    {
      id: "juft-uchta", nom: "Juft-toqni aniqlash",
      qadamlar: ["Sonni ol", "Agar son 2, 4 yoki 6 boʻlsa — “juft” de", "Aks holda — “toq” de"],
      buzuq: 1, xossa: "ommaviylik",
      nega: "Faqat uchta son uchun toʻgʻri: 8 ni “toq” deydi. Har qanday songa yaraydigan qoida kerak.",
      tuzatilgan: "Agar son 2 ga qoldiqsiz boʻlinsa — “juft” de",
    },
    {
      id: "tuxum", nom: "Tuxum pishirish",
      qadamlar: ["Tovani qizdir va shu vaqtning oʻzida tuxumni chaq, tuz sep, aralashtir", "Likopchaga sol"],
      buzuq: 0, xossa: "diskretlik",
      nega: "Toʻrt ish bitta qadamga tiqilgan. Algoritm alohida, ketma-ket qadamlardan iborat boʻladi.",
      tuzatilgan: "Tovani qizdir. Keyin tuxumni chaq. Keyin tuz sep. Keyin aralashtir",
    },
    {
      id: "ortacha", nom: "Oʻrtachani topish",
      qadamlar: ["Uchta sonni ol", "Ularni qoʻsh", "Yigʻindini kerakli songa boʻl", "Javobni ayt"],
      buzuq: 2, xossa: "aniqlik",
      nega: "“Kerakli son” — qaysi son? Qadam faqat bitta xil tushunilishi kerak.",
      tuzatilgan: "Yigʻindini 3 ga boʻl",
    },
    {
      id: "sanoq-qotgan", nom: "10 gacha sanash",
      qadamlar: ["Hisoblagichni 1 qil", "Hisoblagichni ayt", "Hisoblagich 10 ga teng boʻlmaguncha 2-qadamga qayt"],
      buzuq: 2, xossa: "natijaviylik",
      nega: "Hisoblagich hech qayerda oshmaydi — u doim 1 boʻlib qoladi, takror tugamaydi.",
      tuzatilgan: "Hisoblagichga 1 qoʻsh; u 10 dan oshmaguncha 2-qadamga qayt",
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
    // ---- 2026-10-02: ikkalasi ham sikl — "sikl bor / yo'q" ga qarab topib bo'lmaydi (zina 1–2) ----
    {
      id: "izlash-break", tier: 1,
      savol: "Roʻyxatda 7 bormi",
      a: { nom: "Oxirigacha qarab", kod: "a = [4, 9, 7, 1, 8, 3, 6, 2, 5, 10, 12, 11]\nbor = False\nfor x in a:\n    if x == 7:\n        bor = True\nprint(bor)" },
      b: { nom: "Topgach toʻxtab", kod: "a = [4, 9, 7, 1, 8, 3, 6, 2, 5, 10, 12, 11]\nbor = False\nfor x in a:\n    if x == 7:\n        bor = True\n        break\nprint(bor)" },
    },
    {
      id: "juft-qadam", tier: 1,
      savol: "1 dan 40 gacha juft sonlar yigʻindisi",
      a: { nom: "Har sonni tekshirib", kod: "s = 0\nfor i in range(1, 41):\n    if i % 2 == 0:\n        s += i\nprint(s)" },
      b: { nom: "Ikkitadan sakrab", kod: "s = 0\nfor i in range(2, 41, 2):\n    s += i\nprint(s)" },
    },
    {
      id: "tub", tier: 2,
      savol: "97 tub sonmi",
      a: { nom: "Hamma sonni sinab", kod: "n = 97\ntub = True\nfor d in range(2, n):\n    if n % d == 0:\n        tub = False\nprint(tub)" },
      b: { nom: "Ildizgacha sinab", kod: "n = 97\ntub = True\nd = 2\nwhile d * d <= n:\n    if n % d == 0:\n        tub = False\n    d += 1\nprint(tub)" },
    },
    // Teng juftliklar: kod boshqacha yozilgan, lekin sikl bir xil marta aylanadi — javob "teng"
    {
      id: "teng-range", tier: 1, teng: true,
      savol: "12 marta 3 ni qoʻshish",
      a: { nom: "range(12)", kod: "s = 0\nfor i in range(12):\n    s += 3\nprint(s)" },
      b: { nom: "range(1, 13)", kod: "s = 0\nfor i in range(1, 13):\n    s += 3\nprint(s)" },
    },
    {
      id: "teng-qadam", tier: 2, teng: true,
      savol: "10, 20, 30, 40, 50 sonlarining yigʻindisi",
      a: { nom: "Roʻyxat boʻylab", kod: "s = 0\nfor x in [10, 20, 30, 40, 50]:\n    s += x\nprint(s)" },
      b: { nom: "Qadam bilan", kod: "s = 0\nfor x in range(10, 51, 10):\n    s += x\nprint(s)" },
    },
  ];

  // Qadamlarni talqinchi sanaydi
  function olcha(kod) {
    const r = py.run(kod, { maxSteps: 1000000 });
    return { qadam: r.steps, chiqish: r.output, xato: r.error };
  }

  // Sikl tanasi necha marta bajarildi: kuzatuvda (trace) sikldan keyingi satr necha marta uchragani.
  // Kodda sikl bo'lmasa (formula) — 0.
  function aylanish(kod) {
    const satrlar = kod.split("\n");
    const sikl = satrlar.findIndex((s) => /^(for|while) /.test(s));
    if (sikl < 0) return 0;
    const iz = py.trace(kod, { maxStates: 5000 });
    return iz.states.filter((s) => s.line === sikl + 2).length;
  }

  const zina = (tier) => (tier == null ? 2 : Math.max(0, Math.min(2, tier)));

  // 2026-10-02: oldin tejamli yechim DOIM ikkinchi tugmada edi va tanlov ikkita edi (50% taxmin).
  // Endi: (1) yechimlar tasodifiy tartibda; (2) uchinchi javob — "ikkalasi teng" (rostdan teng juftliklar bor);
  // (3) juft savol — ko'proq aylanadigan sikl necha marta aylanadi (son). Ikkalasi to'g'ri bo'lsa hisoblanadi.
  function juftTask(r, prev, tier) {
    const rr = r || Math.random;
    const t = zina(tier);
    return pickNew((rnd) => {
      const mos = JUFTLAR.filter((x) => (x.tier || 0) <= t);
      const ayni = mos.filter((x) => (x.tier || 0) === t);
      const j = tier != null && ayni.length && rnd() < 0.6 ? pick(ayni, rnd) : pick(mos, rnd);
      const almash = rnd() < 0.5;
      const birinchi = almash ? j.b : j.a;
      const ikkinchi = almash ? j.a : j.b;
      const a = olcha(birinchi.kod);
      const b = olcha(ikkinchi.kod);
      if (a.xato || b.xato) return null;
      if (String(a.chiqish) !== String(b.chiqish)) return null; // javob bir xil boʻlishi shart
      const ayl = { a: aylanish(birinchi.kod), b: aylanish(ikkinchi.kod) };
      return {
        tur: "juft", id: j.id, savol: j.savol, n: j.n, a: birinchi, b: ikkinchi,
        javob: a.qadam === b.qadam ? "teng" : b.qadam < a.qadam ? "b" : "a",
        olchov: { a: a.qadam, b: b.qadam }, natija: a.chiqish[0],
        aylanish: ayl, sekin: Math.max(ayl.a, ayl.b),
      };
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
    // ---- 2026-10-02: uchta yangi kod ----
    {
      id: "ortacha", xossa: "ommaviylik",
      kod: "a = int(input())\nb = int(input())\nprint((a + b) // 2)",
      nega: "Yigʻindi toq boʻlsa, // kasr qismini tashlab yuboradi: 3 va 4 uchun 3 chiqadi. Faqat “qulay” sonlarda toʻgʻri.",
      yechim: "a = int(input())\nb = int(input())\nprint((a + b) / 2)",
      tests: [{ stdin: ["3", "4"], out: ["3.5"] }, { stdin: ["4", "6"], out: ["5.0"] }, { stdin: ["7", "7"], out: ["7.0"] }],
      what: "Bu kod ikki sonning oʻrtachasini chiqarishi kerak (3 va 4 uchun 3.5, 4 va 6 uchun 5.0). Hozir ayrim sonlardagina toʻgʻri — tuzat.",
    },
    {
      id: "matn-son", xossa: "natijaviylik",
      kod: "n = input()\nprint(n + 1)",
      nega: "input() matn qaytaradi. Matnga son qoʻshib boʻlmaydi — dastur xato bilan toʻxtaydi, natija chiqmaydi.",
      yechim: "n = int(input())\nprint(n + 1)",
      tests: [{ stdin: ["5"], out: ["6"] }, { stdin: ["0"], out: ["1"] }, { stdin: ["-3"], out: ["-2"] }],
      what: "Bu kod kiritilgan songa 1 qoʻshib chiqarishi kerak, lekin natija oʻrniga xato chiqadi. Tuzat.",
    },
    {
      id: "toq-cheksiz", xossa: "natijaviylik",
      kod: "n = int(input())\nwhile n != 0:\n    n -= 2\nprint(\"tamom\")",
      nega: "Toq son 2 tadan kamaysa, nolga hech qachon teng boʻlmaydi: 7, 5, 3, 1, −1, −3 … — sikl toʻxtamaydi.",
      yechim: "n = int(input())\nwhile n > 0:\n    n -= 2\nprint(\"tamom\")",
      tests: [{ stdin: ["6"], out: ["tamom"] }, { stdin: ["7"], out: ["tamom"] }, { stdin: ["0"], out: ["tamom"] }],
      what: "Bu kod n ni 2 tadan kamaytirib, tugagach «tamom» deyishi kerak. Juft sonda ishlaydi, toq sonda toʻxtamaydi — tuzat.",
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

  const api = { XOSSALAR, xossaById, BUZUQ, JUFTLAR, KODLAR, olcha, aylanish, xossaTask, juftTask, kodTask, stage3Task };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
