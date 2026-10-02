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

  // 1-bosqich xabarlari: [0] — 1-to'plamdan, [1] — 2-to'plamdan, [2] — 3-to'plamdan (kamida bitta yangi harf).
  // 2026-10-02: har to'plamga 8 ta so'z qo'shildi; 3-to'plam so'zlari qiyin rejimda chiqadi.
  const WORDS = [
    ["OTA", "ONA", "NON", "MEN", "NIMA", "OLMA", "LOLA", "ASAL", "TAOM", "SOAT", "ILON", "ISM",
      "TIL", "SON", "TOM", "OLTIN", "LIMON", "OLAM", "INSON", "OILA"],
    ["KUN", "TUN", "SUT", "RASM", "KALIT", "KOSA", "TOSH", "SHER", "MUSHUK", "RAHMAT",
      "KEMA", "HUNAR", "TURNA", "ESHIK", "KARAM", "SHAHAR", "TERAK", "SUMKA"],
    ["KITOB", "DARYO", "QUYOSH", "YULDUZ", "BODOM", "XABAR", "VAQT", "BAYRAM", "QOVUN", "DALA"],
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
    // 2026-10-02: uzunroq javoblar (yuqori zina uchun)
    { q: "Qishda osmondan nima yogʻadi?", a: "QOR" },
    { q: "Qoʻling nechta?", a: "IKKI" },
    { q: "Maktabda kim dars beradi?", a: "USTOZ" },
    { q: "Daryoda nima suzadi?", a: "BALIQ" },
    { q: "Uyga nima orqali kiriladi?", a: "ESHIK" },
    { q: "Daftarga nima bilan yozasan?", a: "QALAM" },
    { q: "Kutubxonada nimani oʻqiysan?", a: "KITOB" },
    { q: "Kunduzi osmonda nima porlaydi?", a: "QUYOSH" },
    { q: "Tunda osmonda mayda boʻlib nima yonadi?", a: "YULDUZ" },
  ];

  const MAX_SYMBOLS = 40;
  const UNIT_MS = 120;
  const MIN_UNIT_MS = 60;
  const PEEK_MS = 4000; // yashirin qo'llanmaga "qarab olish" vaqti

  const tierOf = (tier) => Math.max(0, Math.min(2, tier || 0));

  // "Tinglash" tezligi: har to'g'ri javobdan keyin signal 15 ms ga qisqaradi (120 → 60 ms)
  const unitFor = (correct) => Math.max(MIN_UNIT_MS, UNIT_MS - 15 * Math.max(0, correct || 0));

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

  // Bola harflar orasiga "harf oraligʻi" qo'yishni unutgandek ko'rinsa — true
  // (guruhlar soni harflardan kam, lekin belgilar yetarlicha terilgan, YOKI bitta guruh 4 belgidan uzun)
  function missingGap(target, symbols) {
    const groups = parseTyped(symbols);
    const wantSymbols = encodeWord(target).join("").length;
    const typedSymbols = symbols.replace(/ /g, "").length;
    const fewerGroups = groups.length < target.length;
    const longGroup = groups.some((g) => g.length > 4);
    return (fewerGroups && typedSymbols >= wantSymbols) || longGroup;
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

  // Qo'llanmadagi harflar darajasi (nechta to'plam ochiq): 2-to'g'ri javobdan keyin 2-to'plam,
  // 4-to'g'ri javobdan keyin 3-to'plam. Zina (tier) berilsa — undan: tier 0 → 1, tier 1 → 2, tier 2 (qiyin rejim) → 3.
  function readLevel(correct, tier) {
    if (tier !== undefined && tier !== null) return tierOf(tier) + 1;
    return correct >= 4 ? 3 : correct >= 2 ? 2 : 1;
  }

  // 1-bosqich xabari: correct — shu paytgacha to'g'ri o'qilganlar soni.
  // 0 → SALOM (u xato bo'lsa — 1-to'plamdan), keyin joriy darajadagi to'plamdan (oldingisidan boshqa)
  function pickMessage(correct, prev, rng, tier) {
    const level = readLevel(correct, tier);
    if (level === 1 && correct === 0 && prev !== FIRST_WORD) return FIRST_WORD;
    return pickFrom(WORDS[level - 1], (w) => w === prev, rng);
  }

  // Qo'llanmada nechta (boshidan) to'plamning kodlari yashirin — bola ularni yoddan o'qiydi (QOIDALAR 4.3):
  // 1–2-javob — hammasi ko'rinadi; 3-javob — eski to'plamlar yashirin, yangi ochilgani ko'rinadi;
  // 4-javobdan — hammasi yashirin. Qiyin rejimda (tier 2) 3-javobdan hammasi yashirin.
  // Yashirin kodlarga "qarab olish" mumkin (PEEK_MS), 1-xato maslahati ularni butunlay ochadi.
  function hiddenSets(correct, tier) {
    if (correct < 2) return 0;
    const level = readLevel(correct, tier);
    if (tierOf(tier) === 2 || correct >= 3) return level;
    return level - 1;
  }

  // 1-bosqich mashqi: xabar, ochiq to'plamlar, yashirin to'plamlar va "Tinglash" tezligi
  function makeReadTask(correct, prev, rng, tier) {
    const level = readLevel(correct, tier);
    return {
      word: pickMessage(correct, prev && prev.word, rng, tier),
      level,
      hidden: hiddenSets(correct, tier),
      unit: unitFor(correct),
    };
  }

  // 2-bosqich topshiriqlari zina bo'yicha: javob uzunligi tier 0 — 2–3 harf, tier 1 — 4–5, tier 2 — 5–6
  const TASK_LEN = [[2, 3], [4, 5], [5, 6]];
  const tasksFor = (tier) => TASKS.filter((t) => t.a.length >= TASK_LEN[tierOf(tier)][0] && t.a.length <= TASK_LEN[tierOf(tier)][1]);

  function pickTask(prev, rng, tier) {
    return pickFrom(tasksFor(tier), (t) => !!prev && t.a === prev.a, rng);
  }

  // 2-bosqich mashqi: topshiriq + qo'llanma yashirinmi (2-to'g'ri javobdan keyin — yoddan yoki qarab olib)
  function makeWriteTask(correct, prev, rng, tier) {
    const t = pickTask(prev, rng, tier);
    return { q: t.q, a: t.a, hide: correct >= 2 };
  }

  const api = {
    CODES, SETS, FIRST_WORD, LAST_WORD, WORDS, TASKS, MAX_SYMBOLS, UNIT_MS, MIN_UNIT_MS, PEEK_MS, TASK_LEN,
    lettersUpTo, encodeWord, decodeCode, parseTyped, checkTyped, checkRead, missingGap,
    addSymbol, removeSymbol, beepPlan, unitFor, pickMessage, readLevel, hiddenSets, makeReadTask,
    tasksFor, pickTask, makeWriteTask,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.morse = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
