// Oʻn barmoq — sof mantiq: klaviatura qatorlari, qaysi tugmani qaysi barmoq bosadi, ʻ belgilari,
// yozish sessiyasi, aniqlik va tezlik, matnlar va poyga. Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const PASS = 90; // qator "to'g'ri" — aniqlik kamida 90% (DIZAYN, qarorlar)
  const OKINA = "ʻ"; // ekrandagi to'g'ri belgi (QOIDALAR 2)
  const APOSTROPHES = ["'", "`", "’", "‘", "ʻ", "ʼ"]; // klaviaturada ʻ o'rniga shulardan biri bosiladi

  // AQSh (QWERTY) klaviaturasi: ekrandagi tugmalar — kichik harf yoki belgi
  const ROWS = {
    top: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    home: ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
    bottom: ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
  };

  // Barmoqlar: l/r — chap/o'ng qo'l; p — jimjiloq, r — nomsiz, m — o'rta, i — ko'rsatkich; th — bosh barmoqlar
  const FINGERS = ["lp", "lr", "lm", "li", "th", "ri", "rm", "rr", "rp"];
  const FINGER = {
    q: "lp", a: "lp", z: "lp", "shift-l": "lp",
    w: "lr", s: "lr", x: "lr",
    e: "lm", d: "lm", c: "lm",
    r: "li", f: "li", v: "li", t: "li", g: "li", b: "li",
    y: "ri", h: "ri", n: "ri", u: "ri", j: "ri", m: "ri",
    i: "rm", k: "rm", ",": "rm",
    o: "rr", l: "rr", ".": "rr",
    p: "rp", ";": "rp", "'": "rp", "/": "rp", "shift-r": "rp",
    " ": "th",
  };

  const isApostrophe = (k) => APOSTROPHES.includes(k);
  const isUpper = (ch) => ch !== ch.toLowerCase();

  // Belgi → ekran klaviaturasidagi tugma ("ʻ" → "'", "Q" → "q"); klaviaturada yo'q bo'lsa — null
  function keyOf(ch) {
    if (isApostrophe(ch)) return "'";
    const k = ch.toLowerCase();
    return FINGER[k] && k.length === 1 ? k : null;
  }

  function fingerOf(ch) {
    if (ch === "shift-l" || ch === "shift-r") return FINGER[ch];
    const k = keyOf(ch);
    return k ? FINGER[k] : null;
  }

  // Katta harf: Shift'ni boshqa qo'lning jimjilog'i bosadi
  function shiftFor(ch) {
    if (!isUpper(ch)) return null;
    const f = fingerOf(ch);
    if (!f) return null;
    return f[0] === "l" ? "shift-r" : "shift-l";
  }

  // Kutilgan belgi va bosilgan tugma mosmi
  const same = (expected, key) => (isApostrophe(expected) ? isApostrophe(key) : key === expected);

  // Klaviatura hodisasidan belgi: harf/belgi/probel yoki null (Shift, Enter, strelka...)
  function keyFrom({ key, code }) {
    if (key === "Dead") { // AQSh-xalqaro klaviaturada ' va ` "o'lik" tugma bo'ladi
      if (code === "Quote") return "'";
      if (code === "Backquote") return "`";
      return null;
    }
    return typeof key === "string" && [...key].length === 1 ? key : null;
  }

  const isCyrillic = (k) => /[Ѐ-ӿ]/.test(k);

  // Xato emas, ogohlantirish: klaviatura rus tilida yoki Caps Lock yoqilgan
  function warning(expected, key, capsLock) {
    if (isCyrillic(key)) return "cyrillic";
    if (capsLock && key !== expected && key.toLowerCase() === expected.toLowerCase()) return "caps";
    return null;
  }

  // Har bosqichda o'rganilgan tugmalar
  function allowed(stage) {
    const keys = [...ROWS.home, " "];
    if (stage >= 2) keys.push(...ROWS.top);
    if (stage >= 3) keys.push(...ROWS.bottom.filter((k) => k !== "/"), "shift-l", "shift-r");
    return new Set(keys);
  }

  // Matn faqat shu bosqichgacha o'rganilgan tugmalardan iboratmi (katta harf — 3-bosqichdan)
  function fits(text, stage) {
    const keys = allowed(stage);
    return [...text].every((ch) => {
      const k = keyOf(ch);
      if (!k || !keys.has(k)) return false;
      return !isUpper(ch) || stage >= 3;
    });
  }

  // ---------- Matnlar ----------
  // Faqat asosiy qator harflari: a s d f g h j k l va ʻ
  const HOME_WORDS = [
    "dala", "salla", "gala", "jadal", "shakl", "saf", "jahl", "dalda", "falak", "kalla",
    "hal", "aks", "sadaf", "gʻalla", "jagʻ", "shagʻal", "dagʻal", "hafsala", "lak", "sal",
  ];
  // Asosiy va yuqori qator harflari (pastki qator — z x c v b n m — yo'q)
  const TOP_WORDS = [
    "ota", "qor", "daryo", "yoʻl", "qush", "tuya", "gul", "oʻrik", "shaftoli", "uy",
    "tosh", "quyosh", "osh", "patir", "qishloq", "hayot", "doʻst", "sayohat", "shoir", "daftar",
    "ertak", "qoʻshiq", "sariq", "yashil", "togʻ", "qoʻl", "oyoq", "oila", "oʻqish", "hikoya",
    "tulki", "quloq", "hosil", "sut", "piyola", "qatiq", "gilos", "ari", "qirgʻoq", "joʻja",
    "sher", "eshik", "stol",
  ];
  // O'zbek maqollari: hamma harf, katta harf, vergul va nuqta
  const PROVERBS = [
    "Oʻqigan oʻzar, oʻqimagan toʻzar.",
    "Aql yoshda emas, boshda.",
    "Bir yigitga yetmish hunar oz.",
    "Sabr tagi sariq oltin.",
    "Hunarli kishi och qolmas.",
    "Yaxshi soʻz jon ozigʻi.",
    "Ishlagan tishlar.",
    "Bugungi ishni ertaga qoldirma.",
    "Ilmsiz bir yashar, ilmli ming yashar.",
    "Yolgʻonning umri qisqa.",
    "Doʻst boshga, dushman oyoqqa qaraydi.",
    "Suv keltirgan xor, koʻza sindirgan aziz.",
    "Kattaga hurmatda, kichikka izzatda boʻl.",
    "Mehnatning tagi rohat.",
    "Bilagi zoʻr birni yiqar, bilimi zoʻr mingni yiqar.",
  ];

  // Kichik mashqlar (ko'rsatish): har biridan oldin oqsoqol bitta gap aytadi (DIZAYN 6–8)
  const DRILLS = {
    1: [
      { text: "fff jjj fjfj", say: "Koʻrsatkich barmoqlar: F va J." },
      { text: "ddd kkk dkdk", say: "Oʻrta barmoqlar: D va K." },
      { text: "sss lll slsl", say: "Nomsiz barmoqlar: S va L." },
      { text: "aaa ʻʻʻ aʻaʻ", say: "Jimjiloqlar: A va ʻ. ʻ — ; ning yonidagi tugma, uni ham oʻng jimjiloq bosadi." },
      { text: "fgf jhj fgf jhj", say: "Koʻrsatkich barmoq yonga choʻziladi: G va H. Keyin joyiga qaytadi!" },
      { text: "ha hal sal dala", say: "Endi birinchi soʻzlar! Soʻzlar orasida — Probel." },
    ],
    2: [
      { text: "ded kik ded kik", say: "Oʻrta barmoq yuqoriga chiqadi: E va I." },
      { text: "frf juj frf juj", say: "Koʻrsatkich barmoq: R va U." },
      { text: "ftf jyj ftf jyj", say: "Koʻrsatkich barmoq biroz yonga: T va Y." },
      { text: "sws lol sws lol", say: "Nomsiz barmoqlar: W va O." },
      { text: "aqa ppp aqa ppp", say: "Jimjiloqlar: Q va P." },
      { text: "oʻt toʻp yoʻl togʻ", say: "Oʻ harfi — ikki tugma: O va ʻ. Gʻ ham shunday." },
    ],
    3: [
      { text: "fvf jmj fvf jmj", say: "Endi barmoq pastga tushadi. Koʻrsatkich: V va M." },
      { text: "fbf jnj fbf jnj", say: "Koʻrsatkich barmoq pastga va yonga: B va N." },
      { text: "dcd k,k dcd k,k", say: "Oʻrta barmoqlar: C va vergul." },
      { text: "sxs l.l sxs l.l", say: "Nomsiz barmoqlar: X va nuqta." },
      { text: "aza aza zaza", say: "Chap jimjiloq: Z." },
      { text: "Ali Lola Sanam", say: "Katta harf: bir qoʻl jimjilogʻi Shift ni bosib turadi, ikkinchi qoʻl harfni bosadi." },
      { text: "Salom, Ali.", say: "Gap katta harf bilan boshlanadi, oxirida — nuqta." },
    ],
  };

  // ---------- Qator va poyga matnlari ----------
  function pick(list, rng) {
    return list[Math.floor(rng() * list.length)];
  }

  // n ta har xil so'z, tasodifiy tartibda
  function words(list, n, rng) {
    const pool = list.slice();
    const out = [];
    while (out.length < n) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
    return out.join(" ");
  }

  function fresh(make, prev) {
    for (;;) {
      const text = make();
      if (text !== prev) return text;
    }
  }

  // Mashq qatori: 1-bosqich — 4 ta asosiy qator so'zi, 2 — 4 ta so'z, 3 — maqol
  function makeLine(stage, prev, rng) {
    rng = rng || Math.random;
    if (stage === 3) return fresh(() => pick(PROVERBS, rng), prev);
    return fresh(() => words(stage === 1 ? HOME_WORDS : TOP_WORDS, 4, rng), prev);
  }

  const RACE_LEVELS = [
    { id: "home", title: "Asosiy qator" },
    { id: "words", title: "Soʻzlar" },
    { id: "proverb", title: "Maqol" },
  ];

  function raceText(level, prev, rng) {
    rng = rng || Math.random;
    if (level === "proverb") return fresh(() => pick(PROVERBS, rng), prev);
    return fresh(() => words(level === "home" ? HOME_WORDS : TOP_WORDS, 5, rng), prev);
  }

  // ---------- Yozish sessiyasi ----------
  // start — vaqt hisobining boshi (poygada: "boshla!" lahzasi); berilmasa — birinchi bosish
  function session(text, start) {
    const chars = [...text];
    const s = { text, chars, pos: 0, strokes: 0, times: [], start: start == null ? null : start, end: null };
    s.next = () => chars[s.pos];
    s.done = () => s.pos >= chars.length;
    // key — bitta belgi (keyFrom natijasi); "skip" — hisoblanmaydi
    s.press = (key, t) => {
      if (s.done() || !key) return "skip";
      if (s.start == null) s.start = t;
      s.strokes++;
      if (!same(chars[s.pos], key)) return "wrong";
      s.pos++;
      s.times.push(t - s.start);
      if (s.done()) {
        s.end = t;
        return "done";
      }
      return "ok";
    };
    return s;
  }

  function stats(s) {
    const len = s.pos;
    const accuracy = s.strokes ? Math.floor((len * 100) / s.strokes) : 100;
    // Tugamagan sessiyada — oxirgi to'g'ri belgigacha
    const ms = s.start == null ? 0 : s.end != null ? s.end - s.start : s.times[s.times.length - 1] || 0;
    const cpm = ms > 0 ? Math.round((len * 60000) / ms) : 0;
    return { accuracy, ms, cpm, seconds: Math.round(ms / 100) / 10, strokes: s.strokes, chars: len };
  }

  const passed = (st) => st.accuracy >= PASS;

  // Poyga: aniqligi 90% dan past bo'lgan yuta olmaydi; ikkalasi o'tsa — tezrog'i (matn bir xil)
  function raceResult(a, b) {
    const okA = passed(a);
    const okB = passed(b);
    if (!okA && !okB) return { winner: null, reason: "low" };
    if (okA !== okB) return { winner: okA ? "left" : "right", reason: "accuracy" };
    if (a.ms === b.ms) return { winner: null, reason: "draw" };
    return { winner: a.ms < b.ms ? "left" : "right", reason: "faster" };
  }

  // Soya: birinchi o'yinchi ms vaqtgacha nechta belgi yozgan edi
  const ghostAt = (times, ms) => times.filter((t) => t <= ms).length;

  const api = {
    PASS, OKINA, ROWS, FINGERS, HOME_WORDS, TOP_WORDS, PROVERBS, DRILLS, RACE_LEVELS,
    isApostrophe, isUpper, keyOf, fingerOf, shiftFor, same, keyFrom, isCyrillic, warning,
    allowed, fits, makeLine, raceText, session, stats, passed, raceResult, ghostAt,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.typing = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
