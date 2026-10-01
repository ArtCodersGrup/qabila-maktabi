// 55-o'yin: C++ bloki — tur va chegara (CPP-BLOK.md, mavzular 3 va 4).
// Sof mantiq, ekransiz. Node'da test qilinadi: tests/logic.test.js
//
// Misollarning chiqishi shu yerda BigInt bilan hisoblanadi va haqiqiy g++ bilan solishtiriladi
// (oyinlar/umumiy/tests/cpp-parity.test.js). Bola yozadigan kod esa yadroda ishlaydi.
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

  // ---------- Chegaralar ----------
  const INT_MAX = 2147483647n;
  const INT_MIN = -2147483648n;
  const LL_MAX = 9223372036854775807n;

  // 32 va 64 bitga qirqish: toshib ketgan son aynan shunday ko'rinadi
  const qirq = (x, bit) => {
    const mod = 1n << bit;
    let r = ((x % mod) + mod) % mod;
    if (r >= mod / 2n) r -= mod;
    return r;
  };
  const int32 = (x) => qirq(x, 32n);
  const int64 = (x) => qirq(x, 64n);
  const sigadi = (x) => x >= INT_MIN && x <= INT_MAX;

  // ---------- 1-bosqich: son cheksiz emas ----------
  // Dastur matematik javobni emas, QIRQILGAN javobni chiqaradi — va xato bermaydi
  const TOSHISH = [
    { id: "qosh", tana: (a) => ["int a = " + a + ";", C.chiqar("a + a")], hisob: (a) => int32(a + a), matem: (a) => a + a,
      arg: [2000000000n, 1500000000n, 1234567890n], izoh: "ikki marta qoʻshilganda" },
    { id: "kopayt", tana: (a) => ["int a = " + a + ";", C.chiqar("a * a")], hisob: (a) => int32(a * a), matem: (a) => a * a,
      arg: [100000n, 50000n, 70000n], izoh: "koʻpaytirilganda" },
    { id: "max", tana: (a) => ["int a = " + a + ";", C.chiqar("a + 1")], hisob: (a) => int32(a + 1n), matem: (a) => a + 1n,
      arg: [2147483647n], izoh: "eng katta int ga 1 qoʻshilganda" },
  ];

  function toshishTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const t = pick(TOSHISH, rnd);
      const a = pick(t.arg, rnd);
      const haqiqiy = t.hisob(a);
      const matem = t.matem(a);
      if (haqiqiy === matem) return null; // toshmagan bo'lsa, savolning maʼnosi yo'q
      const soxta = [String(matem), "0", "Xato beradi va toʻxtaydi"];
      return {
        id: "toshish:" + t.id + ":" + a, tur: "toshish", kod: C.dastur(t.tana(a)),
        chiqish: [String(haqiqiy)],
        savol: "Bu dastur nima chiqaradi?",
        javob: String(haqiqiy),
        variantlar: aralash([String(haqiqiy), ...soxta], rnd),
        yolYoriq: "int ichiga −2 147 483 648 dan 2 147 483 647 gacha son sigʻadi. Undan katta son qaytib boshidan sanaydi.",
        nega: "Matematik javob " + matem + ", lekin int ga sigʻmaydi: " + t.izoh + " son qirqiladi va "
          + haqiqiy + " chiqadi. Dastur xato bermaydi — javob jim buziladi.",
      };
    }, prev, rr);
  }

  // long long bilan o'sha hisob to'g'ri chiqadi
  function tuzatishTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const t = pick(TOSHISH.filter((x) => x.id !== "max"), rnd);
      const a = pick(t.arg, rnd);
      const togri = t.matem(a);
      const tana = t.tana(a).map((s) => s.replace(/^int /, "long long "));
      return {
        id: "tuzat:" + t.id + ":" + a, tur: "natija", kod: C.dastur(tana), chiqish: [String(togri)],
        savol: "Endi tur long long. Nima chiqadi? (javobni yoz)",
        nega: "long long ga ±9·10¹⁸ gacha son sigʻadi — bu hisob unga bemalol sigʻadi.",
      };
    }, prev, rr);
  }

  const bosqich1Task = (prev, correct) => ((correct || 0) % 2 === 0 ? toshishTask(null, prev) : tuzatishTask(null, prev));

  // ---------- 2-bosqich: bo'lish tuzog'i ----------
  const BOLISH = [
    { id: "butun", ifoda: (a, b) => a + " / " + b, hisob: (a, b) => String(Math.trunc(a / b)),
      nega: "Ikkala son ham butun boʻlsa, boʻlish ham butun boʻladi: kasr qismi tashlanadi." },
    { id: "kasr", ifoda: (a, b) => a + " / " + b + ".0", hisob: (a, b) => kasrMatn(a, b),
      nega: "Bittasi kasr boʻlsa (2.0), natija ham kasr boʻladi." },
    { id: "qoldiq", ifoda: (a, b) => a + " % " + b, hisob: (a, b) => String(a % b),
      nega: "% — boʻlishdan qolgan qoldiq." },
    { id: "manfiy", ifoda: (a, b) => "-" + a + " / " + b, hisob: (a, b) => String(-Math.trunc(a / b)),
      nega: "Manfiy sonni boʻlganda C++ nolga tomon yaxlitlaydi: −7 / 2 = −3 (Pythonda −4)." },
    { id: "manfiy-qoldiq", ifoda: (a, b) => "-" + a + " % " + b, hisob: (a, b) => String(-(a % b)),
      nega: "Qoldiqning ishorasi boʻlinuvchiniki: −7 % 3 = −1 (Pythonda 2)." },
  ];

  // 6 ta ahamiyatli raqam — cout shunday chiqaradi
  function kasrMatn(a, b) {
    const x = a / b;
    if (Number.isInteger(x)) return String(x);
    let s = x.toPrecision(6).replace(/0+$/, "").replace(/\.$/, "");
    return s;
  }

  function bolishTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const t = pick(BOLISH, rnd);
      const b = int(rnd, 2, 9);
      const a = int(rnd, b + 1, 40);
      if (a % b === 0) return null; // kasr qismi bo'lmasa, tuzoq ko'rinmaydi
      const javob = t.hisob(a, b);
      return {
        id: "bolish:" + t.id + ":" + a + ":" + b, tur: "natija",
        kod: C.dastur([C.chiqar(t.ifoda(a, b))]), chiqish: [javob],
        savol: "Bu dastur nima chiqaradi?",
        nega: t.nega,
      };
    }, prev, rr);
  }

  // int ga kasr qiymat berilsa, kasr qismi tashlanadi
  function qirqishTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const butun = int(rnd, 2, 19);
      const kasr = butun + "." + int(rnd, 1, 9);
      const manfiy = rnd() < 0.4;
      const qiymat = (manfiy ? "-" : "") + kasr;
      const javob = (manfiy ? "-" : "") + butun;
      return {
        id: "qirqish:" + qiymat, tur: "natija",
        kod: C.dastur(["int a = " + qiymat + ";", C.chiqar("a")]), chiqish: [javob],
        savol: "Bu dastur nima chiqaradi?",
        nega: "int ga kasr son tushsa, kasr qismi tashlanadi — yaxlitlanmaydi.",
      };
    }, prev, rr);
  }

  const bosqich2Task = (prev, correct) => ((correct || 0) % 3 === 2 ? qirqishTask(null, prev) : bolishTask(null, prev));

  // ---------- 3-bosqich: qaysi tur kerak ----------
  const INT_YETADI = "int yetadi";
  const LL_KERAK = "long long kerak";
  const DOUBLE_KERAK = "double kerak";

  const VAZIFALAR = [
    { id: "yigindi-katta", matn: "n ta son beriladi (n ≤ 100 000), har biri 10⁹ gacha. Yigʻindisini chiqarish kerak.",
      javob: LL_KERAK, nega: "Eng katta yigʻindi 10⁵ × 10⁹ = 10¹⁴ — int ga sigʻmaydi (int chegarasi ~2·10⁹)." },
    { id: "yigindi-kichik", matn: "n ta son beriladi (n ≤ 1000), har biri 1000 gacha. Yigʻindisini chiqarish kerak.",
      javob: INT_YETADI, nega: "Eng katta yigʻindi 10³ × 10³ = 10⁶ — int ga bemalol sigʻadi." },
    { id: "kopaytma", matn: "Ikkita son beriladi, har biri 100 000 gacha. Koʻpaytmasini chiqarish kerak.",
      javob: LL_KERAK, nega: "10⁵ × 10⁵ = 10¹⁰ — int ga sigʻmaydi." },
    { id: "ortacha", matn: "n ta sonning oʻrtachasini 2 xona aniqlikda chiqarish kerak.",
      javob: DOUBLE_KERAK, nega: "Oʻrtacha kasr son boʻladi: butun boʻlish kasr qismini tashlab yuboradi." },
    { id: "faktorial", matn: "n! ni hisoblash kerak (n ≤ 20).",
      javob: LL_KERAK, nega: "13! = 6 227 020 800 — allaqachon int dan katta. 20! esa long long ga zoʻrgʻa sigʻadi." },
    { id: "sanash", matn: "Massivda nechta juft son borligini sanash kerak (n ≤ 10⁶).",
      javob: INT_YETADI, nega: "Javob n dan oshmaydi: 10⁶ — int ga bemalol sigʻadi." },
    { id: "kvadratlar", matn: "1 dan n gacha sonlar kvadratlarining yigʻindisi (n ≤ 10⁵).",
      javob: LL_KERAK, nega: "Yigʻindi ≈ n³/3 ≈ 3·10¹⁴ — int ga sigʻmaydi." },
    { id: "narx", matn: "Mahsulot narxini 3 ga boʻlib, kasri bilan chiqarish kerak.",
      javob: DOUBLE_KERAK, nega: "Butun boʻlish kasrni yoʻqotadi — kasr kerak boʻlsa, double olinadi." },
  ];

  function turTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const v = pick(VAZIFALAR, rnd);
      return {
        id: "tur:" + v.id, tur: "tur", savol: v.matn, javob: v.javob,
        variantlar: [INT_YETADI, LL_KERAK, DOUBLE_KERAK],
        yolYoriq: "Eng katta javobni taxmin qil: u 2·10⁹ dan oshsa — long long; kasr kerak boʻlsa — double.",
        nega: v.nega,
      };
    }, prev, rr);
  }

  // Bola o'zi yozadi: to'g'ri tur tanlanmasa, javob jim buziladi
  const QOLIP = C.BOSH + "\n    \n" + C.OXIR;

  const YOZISHLAR = [
    {
      id: "yigindi", savol: "n ta sonni oʻqib, yigʻindisini chiqar. Sonlar katta — turni toʻgʻri tanla!",
      sinovlar: [
        { kirish: ["3", "2000000000 2000000000 2000000000"], chiqish: ["6000000000"] },
        { kirish: ["2", "5 7"], chiqish: ["12"] },
      ],
      yechim: C.dastur(["int n;", "cin >> n;", "long long s = 0;", "for (int i = 0; i < n; i++) {",
        "    long long x;", "    cin >> x;", "    s += x;", "}", C.chiqar("s")]),
      yolYoriq: "Yigʻindi 6 milliardgacha boradi — int ga sigʻmaydi.",
    },
    {
      id: "kopaytma", savol: "Ikki sonni oʻqib, koʻpaytmasini chiqar (sonlar 100 000 gacha).",
      sinovlar: [{ kirish: ["100000 100000"], chiqish: ["10000000000"] }, { kirish: ["12 12"], chiqish: ["144"] }],
      yechim: C.dastur(["long long a, b;", "cin >> a >> b;", C.chiqar("a * b")]),
      yolYoriq: "10⁵ × 10⁵ = 10¹⁰ — long long kerak.",
    },
    {
      id: "ortacha", savol: "Ikki sonni oʻqib, oʻrtachasini chiqar (kasri bilan).",
      sinovlar: [{ kirish: ["7 8"], chiqish: ["7.5"] }, { kirish: ["4 6"], chiqish: ["5"] }],
      yechim: C.dastur(["double a, b;", "cin >> a >> b;", C.chiqar("(a + b) / 2")]),
      yolYoriq: "Butun boʻlish kasrni tashlaydi — double ishlat.",
    },
  ];

  function yozTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const y = pick(YOZISHLAR, rnd);
      return Object.assign({ tur: "yoz", qolip: QOLIP, rows: 8 }, y, { id: "yoz:" + y.id });
    }, prev, rr);
  }

  const bosqich3Task = (prev, correct) => ((correct || 0) % 2 === 0 ? turTask(null, prev) : yozTask(null, prev));

  // ---------- Parity testi uchun namunalar ----------
  function namunalar(soni) {
    let seed = 777;
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
    let prev = null;
    const yasovchilar = [toshishTask, tuzatishTask, bolishTask, qirqishTask];
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
    INT_MAX, INT_MIN, LL_MAX, int32, int64, sigadi, kasrMatn,
    TOSHISH, BOLISH, VAZIFALAR, YOZISHLAR, QOLIP, INT_YETADI, LL_KERAK, DOUBLE_KERAK,
    toshishTask, tuzatishTask, bolishTask, qirqishTask, turTask, yozTask,
    bosqich1Task, bosqich2Task, bosqich3Task, namunalar,
  };
  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
