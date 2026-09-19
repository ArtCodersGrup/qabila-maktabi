// Qabila Morzesi — sof hisob: Morze kodlari, so'zlar, topshiriqlar va tekshirish.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  // Xalqaro Morze alifbosi: "." — nuqta, "-" — chiziq
  const CODES = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..",
    J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
    S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  };

  // Harflar to'plamlari — qo'llanmada asta-sekin ochiladi (DIZAYN 4-bo'lim)
  const SETS = [
    ["A", "E", "I", "L", "M", "N", "O", "S", "T"],
    ["H", "K", "R", "U"],
    ["B", "D", "Q", "V", "X", "Y", "Z"],
  ];

  const FIRST_WORD = "SALOM";
  const LAST_WORD = "XAYR";

  // 1-bosqich xabarlari: [0] — 1-to'plamdan, [1] — 2-to'plamdan (kamida bitta yangi harf)
  const WORDS = [
    ["OTA", "ONA", "NON", "MEN", "NIMA", "OLMA", "LOLA", "ASAL", "TAOM", "SOAT", "ILON", "ISM"],
    ["KUN", "TUN", "SUT", "RASM", "KALIT", "KOSA", "TOSH", "SHER", "MUSHUK", "RAHMAT"],
  ];

  // 2-bosqich topshiriqlari: q — qabila savoli, a — bola teradigan javob
  const TASKS = [
    { q: "Kim Morzeni oʻrganyapti?", a: "MEN" },
    { q: "Kechasi osmonda nima chiqadi?", a: "OY" },
    { q: "Morze senga yoqdimi?", a: "HA" },
    { q: "Tushlikka nima yeding?", a: "OSH" },
    { q: "Chanqasang nima ichasan?", a: "SUV" },
    { q: "Mushuk nima ichadi?", a: "SUT" },
    { q: "Nonvoy nima yopadi?", a: "NON" },
    { q: "Quyosh chiqsa kun boʻladimi yoki tun?", a: "KUN" },
    { q: "Sen kimsan?", a: "BOLA" },
    { q: "Osmonda nima uchadi?", a: "QUSH" },
    { q: "Qaysi faslda eng issiq?", a: "YOZ" },
    { q: "Tovuq nima yeydi?", a: "DON" },
  ];

  const MAX_SYMBOLS = 40;
  const UNIT_MS = 120;

  // 1..level to'plamlarining harflari, alifbo tartibida
  function lettersUpTo(level) {
    return SETS.slice(0, level).flat().sort();
  }

  const encodeWord = (word) => [...word].map((ch) => CODES[ch]);

  function decodeCode(code) {
    for (const [letter, c] of Object.entries(CODES)) if (c === code) return letter;
    return "?";
  }

  // Terilgan belgilar ("." "-" " ") → harf kodlari; ortiqcha oraliqlar hisobga olinmaydi
  const parseTyped = (symbols) => symbols.split(" ").filter(Boolean);

  // Bola terganini tekshirish: har bir guruh o'qiladi, noto'g'ri (yoki yetishmayotgan) guruhlar indekslari
  function checkTyped(target, symbols) {
    const want = encodeWord(target);
    const groups = parseTyped(symbols);
    const read = groups.map(decodeCode).join("");
    const wrong = [];
    const n = Math.max(want.length, groups.length);
    for (let k = 0; k < n; k++) if (groups[k] !== want[k]) wrong.push(k);
    return { ok: wrong.length === 0, groups, read, wrong };
  }

  // Bola o'qigan harflarni tekshirish: noto'g'ri kataklar indekslari
  function checkRead(word, letters) {
    const wrong = [];
    [...word].forEach((ch, k) => {
      if (letters[k] !== ch) wrong.push(k);
    });
    return wrong;
  }

  // Terishga belgi qo'shish: oraliq boshida va ketma-ket ikki marta yozilmaydi, 40 belgidan oshmaydi
  function addSymbol(symbols, sym) {
    if (symbols.length >= MAX_SYMBOLS) return symbols;
    if (sym === " " && (symbols === "" || symbols.endsWith(" "))) return symbols;
    return symbols + sym;
  }

  const removeSymbol = (symbols) => symbols.slice(0, -1);

  // "Tinglash" rejasi: har bir belgi uchun { on, off, group } (ms).
  // Nuqta 1, chiziq 3 birlik; belgilar orasida 1, harf oxirida 3 birlik pauza.
  function beepPlan(codes, unit) {
    unit = unit || UNIT_MS;
    const plan = [];
    codes.forEach((code, group) => {
      [...code].forEach((sym, k) => {
        const last = k === code.length - 1;
        plan.push({ on: (sym === "." ? 1 : 3) * unit, off: (last ? 3 : 1) * unit, group });
      });
    });
    return plan;
  }

  // Ro'yxatdan tasodifiy, oldingisidan farqli element
  function pickFrom(list, isSame, rng) {
    const pool = list.filter((x) => !isSame(x));
    return pool[Math.floor((rng || Math.random)() * pool.length)];
  }

  // 1-bosqich xabari: correct — shu paytgacha to'g'ri o'qilganlar soni.
  // 0 → SALOM (u xato bo'lsa — 1-to'plamdan), 1 → 1-to'plam, 2 → 2-to'plam
  function pickMessage(correct, prev, rng) {
    if (correct === 0 && prev !== FIRST_WORD) return FIRST_WORD;
    return pickFrom(WORDS[correct >= 2 ? 1 : 0], (w) => w === prev, rng);
  }

  // Qo'llanmadagi harflar darajasi: 2-to'g'ri javobdan keyin 2-to'plam ochiladi
  const readLevel = (correct) => (correct >= 2 ? 2 : 1);

  function pickTask(prev, rng) {
    return pickFrom(TASKS, (t) => !!prev && t.a === prev.a, rng);
  }

  const api = {
    CODES, SETS, FIRST_WORD, LAST_WORD, WORDS, TASKS, MAX_SYMBOLS, UNIT_MS,
    lettersUpTo, encodeWord, decodeCode, parseTyped, checkTyped, checkRead,
    addSymbol, removeSymbol, beepPlan, pickMessage, readLevel, pickTask,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.morse = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
