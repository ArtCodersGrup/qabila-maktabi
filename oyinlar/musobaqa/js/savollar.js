// Musobaqa savollari (DIZAYN 4-bo'lim): 6 mavzu × 3 qiyinlik. Har tur tasodifiy savol yasaydi,
// deck() esa raund uchun juft savol beradi: bir xil tur va qiyinlik, sonlari boshqa, takrorsiz.
// Mavjud o'yinlar mantiqi qayta ishlatiladi: QK.sanoq, roman, caesar, morse, neural, atlas, bytes, units, typing.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const QK = () => root.QK;

  const TOPICS = [
    { id: "kod", title: "Kodlash va shifrlash" },
    { id: "ikkilik", title: "Ikkilik kod" },
    { id: "olchov", title: "Axborot oʻlchovi" },
    { id: "sanoq", title: "Sanoq tizimlari" },
    { id: "ai", title: "Sunʼiy intellekt" },
    { id: "klaviatura", title: "Klaviatura" },
  ];
  const LEVELS = [
    { id: 1, title: "Oson" },
    { id: 2, title: "Oʻrta" },
    { id: 3, title: "Qiyin" },
  ];

  // ---------- Yordamchilar ----------
  const ri = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  function shuffle(rng, list) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // To'g'ri javob + boshqalari (takrorsiz), n tagacha, aralashtirilgan
  function withOptions(rng, answer, wrongs, n = 4) {
    const out = [answer];
    for (const w of wrongs) if (out.length < n && w != null && !out.includes(w)) out.push(w);
    return shuffle(rng, out);
  }

  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const sup = (n) => [...String(n)].map((d) => SUP[+d]).join("");
  const times = (a, i) => Array(i).fill(a).join(" × ");
  const upToText = (i) => {
    const nums = Array.from({ length: i }, (_, k) => k + 1);
    return `${nums.slice(0, -1).join(", ")} yoki ${i}`;
  };
  const signed = (w) => (w < 0 ? `−${-w}` : `+${w}`);

  const num = (maxLen) => ({ type: "num", maxLen });
  const keys = (list, maxLen) => ({ type: "keys", keys: list, maxLen });
  const choice = (options) => ({ type: "choice", options });
  const big = (text) => ({ type: "big", text });

  const DIGIT_KEYS = (b) => QK().sanoq.DIGITS.slice(0, b).split("");

  // ======================================================================
  // 1. Kodlash va shifrlash (1–3-o'yinlar)
  // ======================================================================

  const EXACT_2 = [[4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 2], [4, 3], [3, 4], [2, 5], [2, 6]];
  const UPTO_2 = [[2, 2], [2, 3], [3, 2], [3, 3], [4, 2], [4, 3], [5, 2], [2, 4], [2, 5], [6, 2], [7, 2], [8, 2], [9, 2]];

  const sozlar = {
    topic: "kod",
    levels: [1, 2, 3],
    make(level, rng) {
      if (level === 3) {
        const i = pick(rng, [2, 3]);
        const p = i === 2 ? ri(rng, 5, 60) : ri(rng, 9, 100);
        let a = 2;
        while (a ** i < p) a++;
        return {
          id: `p${p}i${i}`,
          data: { type: "min", p, i },
          text: `${p} kishiga har xil ism kerak. Har ism aynan ${i} harfli. Alifboda eng kamida nechta harf boʻlishi kerak?`,
          input: num(2),
          answer: String(a),
          explain: `${a - 1}${sup(i)} = ${(a - 1) ** i} — kam, ${a}${sup(i)} = ${a ** i} — yetadi.`,
        };
      }
      const upTo = level === 2 && rng() < 0.5;
      const [a, i] = level === 1 ? pick(rng, [[2, 2], [2, 3], [3, 2], [3, 3], [2, 4]]) : pick(rng, upTo ? UPTO_2 : EXACT_2);
      if (upTo) {
        const terms = Array.from({ length: i }, (_, k) => a ** (k + 1));
        const total = terms.reduce((s, x) => s + x, 0);
        return {
          id: `u${a}i${i}`,
          data: { type: "upto", a, i },
          text: `Alifboda ${a} ta harf bor. ${i} harfgacha (${upToText(i)} harfli) nechta soʻz bor?`,
          input: num(3),
          answer: String(total),
          explain: `${terms.join(" + ")} = ${total}`,
        };
      }
      return {
        id: `e${a}i${i}`,
        data: { type: "exact", a, i },
        text: `Alifboda ${a} ta harf bor. Aynan ${i} harfli nechta soʻz bor?`,
        input: num(3),
        answer: String(a ** i),
        explain: `${times(a, i)} = ${a ** i}`,
      };
    },
  };

  // Morze: faqat lotin harflari (xalqaro jadvalda Oʻ, Gʻ yo'q; Sh — S va H)
  const MORSE_WORDS = {
    1: ["OTA", "ONA", "NON", "MEN", "OSH", "SUV", "SUT", "KUN", "TUN", "ISM", "QOR", "TUZ", "QIZ", "BIZ", "SIZ", "YOZ"],
    2: ["NIMA", "OLMA", "LOLA", "ASAL", "TAOM", "SOAT", "ILON", "RASM", "KOSA", "BOLA", "QUSH", "SHER", "TOSH", "ANOR", "UZUM", "OYNA", "DALA"],
    3: ["KALIT", "SALOM", "BULUT", "KITOB", "OSMON", "DARYO", "QALAM", "TULKI", "SABZI", "QAYIQ", "LIMON", "BANAN"],
  };
  const morseText = (code) => code.replace(/\./g, "·").replace(/-/g, "—");

  const morze = {
    topic: "kod",
    levels: [1, 2, 3],
    make(level, rng, fresh) {
      const { CODES } = QK().morse;
      const list = MORSE_WORDS[level];
      const pool = list.filter(fresh);
      if (!pool.length) return null;
      const word = pick(rng, pool);
      const options = withOptions(rng, word, shuffle(rng, list));
      const letters = [...new Set(options.join(""))].sort();
      return {
        id: word,
        data: { word },
        text: "Morze xabarini oʻqi. Qoʻllanma yordam beradi.",
        blocks: [
          { type: "morse", groups: [...word].map((ch) => CODES[ch]) },
          { type: "guide", items: letters.map((l) => [l, CODES[l]]) },
        ],
        input: choice(options),
        answer: word,
        explain: [...word].map((ch) => `${ch} ${morseText(CODES[ch])}`).join(" · "),
      };
    },
  };

  // Sezar: 29 harfli alifbo, aylana (Ng dan keyin A)
  const CAESAR_WORDS = ["KITOB", "QUSH", "CHOY", "TONG", "GʻOZ", "SHAMOL", "BULUT", "OLMA", "SALOM", "DOʻST", "QUYOSH", "YULDUZ", "TAYYOR", "RAHMAT", "KELING", "OSMON", "DARYO"];

  // Harfdan boshlab k qadam (k manfiy — orqaga): "B → D → E"
  function caesarPath(letter, k) {
    const { shift } = QK().caesar;
    const steps = [letter];
    for (let s = 1; s <= Math.abs(k); s++) steps.push(shift(letter, Math.sign(k) * s));
    return steps.join(" → ");
  }

  const sezar = {
    topic: "kod",
    levels: [1, 2, 3],
    make(level, rng) {
      const { ALPHABET, shift, tokenize, encrypt } = QK().caesar;
      const strip = (mark) => ({ type: "strip", letters: ALPHABET, mark });
      if (level === 1) {
        const k = ri(rng, 1, 3);
        const i = ri(rng, 0, ALPHABET.length - 1 - k);
        const letter = ALPHABET[i];
        const answer = ALPHABET[i + k];
        return {
          id: `f${letter}${k}`,
          data: { dir: 1, letter, k },
          text: `Sezar shifri, kalit ${k}. ${letter} harfini shifrla: ${k} ta oldinga sur.`,
          blocks: [strip(letter)],
          input: choice(withOptions(rng, answer, [shift(letter, k + 1), shift(letter, k - 1), shift(letter, -k)])),
          answer,
          explain: caesarPath(letter, k),
        };
      }
      if (level === 2) {
        const k = ri(rng, 1, 5);
        const letter = pick(rng, ALPHABET);
        const answer = shift(letter, -k);
        return {
          id: `b${letter}${k}`,
          data: { dir: -1, letter, k },
          text: `Kalit ${k}. Shifrlangan harf — ${letter}. Asl harf qaysi? ${k} ta orqaga sur.`,
          blocks: [strip(letter)],
          input: choice(withOptions(rng, answer, [shift(letter, k), shift(letter, -k + 1), shift(letter, -k - 1)])),
          answer,
          explain: caesarPath(letter, -k),
        };
      }
      if (rng() < 0.5) {
        const k = ri(rng, 1, 6);
        const plain = pick(rng, ALPHABET);
        const enc = shift(plain, k);
        return {
          id: `k${plain}${k}`,
          data: { plain, enc },
          text: `Asl harf ${plain}, shifrlangani — ${enc}. Kalit nechchi?`,
          blocks: [strip(plain)],
          input: num(2),
          answer: String(k),
          explain: `${caesarPath(plain, k)}: ${k} qadam.`,
        };
      }
      const k = ri(rng, 1, 5);
      const word = pick(rng, CAESAR_WORDS);
      const tokens = tokenize(word);
      const enc = encrypt(tokens, k);
      const sameLen = CAESAR_WORDS.filter((w) => w !== word && tokenize(w).length === tokens.length);
      const rest = CAESAR_WORDS.filter((w) => w !== word && !sameLen.includes(w));
      return {
        id: `w${word}${k}`,
        data: { word, k, enc },
        text: `Kalit ${k}. Shifrlangan soʻzni och: har harfni ${k} ta orqaga sur.`,
        blocks: [{ type: "tiles", items: enc }, strip(null)],
        input: choice(withOptions(rng, word, shuffle(rng, sameLen).concat(shuffle(rng, rest)))),
        answer: word,
        explain: enc.map((t, j) => `${t} → ${tokens[j]}`).join(", "),
      };
    },
  };

  // ======================================================================
  // 2. Ikkilik kod (4-o'yin)
  // ======================================================================

  const THINGS = [["29 ta harf", 29], ["10 ta raqam", 10], ["12 ta oy", 12], ["7 ta hafta kuni", 7], ["20 ta hayvon", 20],
    ["50 ta soʻz", 50], ["30 ta oʻquvchi", 30], ["60 ta daqiqa", 60], ["100 ta rang", 100], ["5 ta rang", 5]];

  const naqsh = {
    topic: "ikkilik",
    levels: [1, 2, 3],
    make(level, rng) {
      if (level === 3) {
        const [name, n] = pick(rng, THINGS);
        const color = rng() < 0.5;
        const states = color ? 3 : 2;
        let k = 1;
        while (states ** k < n) k++;
        return {
          id: `m${n}${states}`,
          data: { type: "min", n, states },
          text: `${name} uchun eng kamida nechta ${color ? "rangli" : "oddiy"} chiroq kerak?` +
            (color ? " (Rangli: oʻchiq, sariq yoki koʻk.)" : " (Oddiy: yoniq yoki oʻchiq.)"),
          input: num(2),
          answer: String(k),
          explain: `${states}${sup(k - 1)} = ${states ** (k - 1)} — kam, ${states}${sup(k)} = ${states ** k} — yetadi.`,
        };
      }
      const color = level === 2 && rng() < 0.5;
      const n = level === 1 ? ri(rng, 2, 4) : color ? ri(rng, 2, 4) : ri(rng, 5, 7);
      const states = color ? 3 : 2;
      return {
        id: `${states}^${n}`,
        data: { type: "count", n, states },
        text: color
          ? `${n} ta rangli chiroq: har biri oʻchiq, sariq yoki koʻk. Nechta har xil naqsh bor?`
          : `${n} ta chiroq: har biri yoniq yoki oʻchiq. Nechta har xil naqsh bor?`,
        input: num(3),
        answer: String(states ** n),
        explain: n <= 4 ? `${times(states, n)} = ${states ** n}` : `${states}${sup(n)} = ${states ** n}`,
      };
    },
  };

  // Ikkilik yoyilmasi: 13 → "8 + 4 + 1"
  function binaryParts(n) {
    const parts = [];
    for (let p = 64; p >= 1; p /= 2) if (n & p) parts.push(p);
    return parts.join(" + ");
  }

  const BIN_RANGE = { 1: [1, 15], 2: [8, 31], 3: [16, 63] };
  const PLACES = (len) => [8, 4, 2, 1].slice(4 - len);

  const ikkilikdan = {
    topic: "ikkilik",
    levels: [1, 2, 3],
    make(level, rng) {
      const { toBase, fmt } = QK().sanoq;
      const n = ri(rng, ...BIN_RANGE[level]);
      const s = level === 1 ? toBase(n, 2).padStart(n < 8 ? 3 : 4, "0") : toBase(n, 2);
      const blocks = [big(fmt(s, 2))];
      if (level === 1) blocks.push({ type: "places", items: PLACES(s.length) });
      return {
        id: String(n),
        data: { s },
        text: "Ikkilik sonni oʻnlikka oʻtkaz.",
        blocks,
        input: num(2),
        answer: String(n),
        explain: `${fmt(s, 2)} = ${binaryParts(n)} = ${n}`,
      };
    },
  };

  const ikkilikka = {
    topic: "ikkilik",
    levels: [1, 2, 3],
    make(level, rng) {
      const { toBase, fmt } = QK().sanoq;
      const n = ri(rng, Math.max(2, BIN_RANGE[level][0]), BIN_RANGE[level][1]);
      const answer = toBase(n, 2);
      const blocks = [big(`${n} → ?₂`)];
      if (level === 1) blocks.push({ type: "places", items: PLACES(4) });
      return {
        id: String(n),
        data: { n },
        text: `${n} ni ikkilikda yoz.`,
        blocks,
        input: keys(["0", "1"], 7),
        clean: true,
        answer,
        explain: `${n} = ${binaryParts(n)} → ${fmt(answer, 2)}`,
      };
    },
  };

  // ======================================================================
  // 3. Axborot o'lchovi (13–16-o'yinlar)
  // ======================================================================

  const bayt = {
    topic: "olchov",
    levels: [1, 2, 3],
    make(level, rng) {
      const r = rng();
      if (level === 1) {
        if (r < 0.5) {
          const n = ri(rng, 2, 10);
          return { id: `b${n}`, data: { n, from: "bayt" }, text: `${n} bayt — necha bit?`, input: num(3), answer: String(8 * n), explain: `1 bayt = 8 bit. ${n} × 8 = ${8 * n}` };
        }
        const n = ri(rng, 1, 10);
        return { id: `t${n}`, data: { n, from: "bit" }, text: `${8 * n} bit — necha bayt?`, input: num(3), answer: String(n), explain: `8 bit = 1 bayt. ${8 * n} : 8 = ${n}` };
      }
      if (level === 2) {
        if (r < 0.5) {
          const n = ri(rng, 1, 4);
          return { id: `k${n}`, data: { n, from: "Kbayt" }, text: `${n} Kbayt — necha bayt?`, input: num(4), answer: String(1024 * n), explain: `1 Kbayt = 1024 bayt. ${n} × 1024 = ${1024 * n}` };
        }
        const msg = pick(rng, QK().bytes.MESSAGES);
        return {
          id: `m${msg}`,
          data: { msg },
          text: "Bu matn necha bayt? Har belgi — 1 bayt (boʻsh joy va tinish belgilari ham).",
          blocks: [{ type: "chars", text: msg }],
          input: num(3),
          answer: String(msg.length),
          explain: `${msg.length} ta belgi → ${msg.length} bayt`,
        };
      }
      if (r < 1 / 3) {
        const n = ri(rng, 1, 4);
        return { id: `M${n}`, data: { n, from: "Mbayt" }, text: `${n} Mbayt — necha Kbayt?`, input: num(4), answer: String(1024 * n), explain: `1 Mbayt = 1024 Kbayt. ${n} × 1024 = ${1024 * n}` };
      }
      if (r < 2 / 3) {
        const n = ri(rng, 2, 8);
        return { id: `K${n}`, data: { n, from: "bayt→Kbayt" }, text: `${1024 * n} bayt — necha Kbayt?`, input: num(2), answer: String(n), explain: `${1024 * n} : 1024 = ${n}` };
      }
      const n = ri(rng, 11, 50);
      return { id: `B${n}`, data: { n, from: "bit→bayt" }, text: `${8 * n} bit — necha bayt?`, input: num(2), answer: String(n), explain: `${8 * n} : 8 = ${n}` };
    },
  };

  // w × h, har ikkisi lo..hi oralig'ida, ko'paytma cond ni qanoatlantiradi
  function sizeWhere(rng, lo, hi, cond) {
    for (;;) {
      const w = ri(rng, lo, hi);
      const h = ri(rng, lo, hi);
      if (cond(w * h)) return [w, h];
    }
  }
  const BITS_FOR = { 2: 1, 4: 2, 8: 3, 16: 4, 256: 8 };

  const piksel = {
    topic: "olchov",
    levels: [1, 2, 3],
    make(level, rng) {
      const r = rng();
      if (level === 1) {
        const [w, h] = sizeWhere(rng, 2, 10, () => true);
        return {
          id: `a${w}x${h}`,
          data: { w, h, bpp: 1, unit: "bit" },
          text: `Oq-qora rasm: ${w} × ${h} piksel. Har piksel — 1 bit. Rasm necha bit?`,
          blocks: [{ type: "grid", w, h }],
          input: num(3),
          answer: String(w * h),
          explain: `${w} × ${h} = ${w * h} bit`,
        };
      }
      if (level === 2) {
        if (r < 0.6) {
          const [w, h] = sizeWhere(rng, 2, 16, (p) => p % 8 === 0 && p <= 128);
          return {
            id: `b${w}x${h}`,
            data: { w, h, bpp: 1, unit: "bayt" },
            text: `Oq-qora rasm: ${w} × ${h} piksel. Rasm necha bayt?`,
            input: num(3),
            answer: String((w * h) / 8),
            explain: `${w} × ${h} = ${w * h} bit, ${w * h} : 8 = ${(w * h) / 8} bayt`,
          };
        }
        const c = pick(rng, [2, 4, 8, 16, 256]);
        return {
          id: `c${c}`,
          data: { colors: c },
          text: `Rasmda ${c} xil rang bor. Har pikselga eng kamida necha bit kerak?`,
          input: num(1),
          answer: String(BITS_FOR[c]),
          explain: `2${sup(BITS_FOR[c])} = ${c} → ${BITS_FOR[c]} bit`,
        };
      }
      if (r < 0.5) {
        const [w, h] = sizeWhere(rng, 2, 6, () => true);
        return {
          id: `r${w}x${h}`,
          data: { w, h, bpp: 24, unit: "bayt" },
          text: `Rangli rasm: ${w} × ${h} piksel. Har piksel — 3 bayt. Rasm necha bayt?`,
          input: num(3),
          answer: String(w * h * 3),
          explain: `${w} × ${h} × 3 = ${w * h * 3} bayt`,
        };
      }
      const c = pick(rng, [4, 16]);
      const k = BITS_FOR[c];
      const [w, h] = sizeWhere(rng, 2, 5, (p) => p * k <= 100);
      return {
        id: `p${c}:${w}x${h}`,
        data: { w, h, bpp: k, unit: "bit" },
        text: `${c} xil rangli rasm: ${w} × ${h} piksel. Rasm necha bit?`,
        input: num(3),
        answer: String(w * h * k),
        explain: `${c} rang → ${k} bit. ${w} × ${h} × ${k} = ${w * h * k} bit`,
      };
    },
  };

  const kadr = {
    topic: "olchov",
    levels: [1, 2, 3],
    make(level, rng) {
      if (level === 1) {
        const fps = pick(rng, [5, 10, 12]);
        const s = ri(rng, 2, Math.min(8, Math.floor(100 / fps)));
        return {
          id: `f${fps}s${s}`,
          data: { fps, s, ask: "frames" },
          text: `Multfilmda 1 soniyada ${fps} ta kadr. ${s} soniyada nechta kadr?`,
          input: num(3),
          answer: String(fps * s),
          explain: `${fps} × ${s} = ${fps * s}`,
        };
      }
      if (level === 2) {
        const s = ri(rng, 2, 4);
        if (rng() < 0.5) {
          return { id: `F${s}`, data: { fps: 24, s, ask: "frames" }, text: `Multfilmda 1 soniyada 24 ta kadr. ${s} soniyada nechta kadr?`, input: num(3), answer: String(24 * s), explain: `24 × ${s} = ${24 * s}` };
        }
        return { id: `S${s}`, data: { fps: 24, s, ask: "seconds" }, text: `1 soniyada 24 ta kadr. ${24 * s} ta kadr — necha soniya?`, input: num(2), answer: String(s), explain: `${24 * s} : 24 = ${s}` };
      }
      if (rng() < 0.5) {
        const k = ri(rng, 3, 9);
        const n = pick(rng, [10, 12, 20, 24]);
        return { id: `k${k}n${n}`, data: { k, n }, text: `1 kadr — ${k} Kbayt. ${n} ta kadr necha Kbayt?`, input: num(3), answer: String(k * n), explain: `${k} × ${n} = ${k * n} Kbayt` };
      }
      for (;;) {
        const fps = pick(rng, [2, 4, 5, 10]);
        const k = ri(rng, 1, 4);
        const s = ri(rng, 2, 5);
        if (fps * k * s > 100) continue;
        return {
          id: `v${fps}:${k}:${s}`,
          data: { fps, k, s },
          text: `1 soniyada ${fps} ta kadr, 1 kadr — ${k} Kbayt. ${s} soniyalik video necha Kbayt?`,
          input: num(3),
          answer: String(fps * k * s),
          explain: `${fps} × ${s} = ${fps * s} kadr, ${fps * s} × ${k} = ${fps * k * s} Kbayt`,
        };
      }
    },
  };

  const label = (x) => `${x.n} ${x.unit}`;

  const birlik = {
    topic: "olchov",
    levels: [1, 2, 3],
    make(level, rng) {
      const { UNITS, compare, toBits } = QK().units;
      if (level === 1) {
        const r = rng();
        if (r < 1 / 3) {
          const i = ri(rng, 0, 4);
          return {
            id: `n${i}`,
            data: { type: "next", i },
            text: `${UNITS[i]}dan keyingi kattaroq birlik qaysi?`,
            input: choice(withOptions(rng, UNITS[i + 1], shuffle(rng, UNITS.filter((u) => u !== UNITS[i])))),
            answer: UNITS[i + 1],
            explain: UNITS.join(" → "),
          };
        }
        if (r < 2 / 3) {
          const i = ri(rng, 1, 5);
          const answer = i === 1 ? "8" : "1024";
          return {
            id: `f${i}`,
            data: { type: "factor", i },
            text: `1 ${UNITS[i]} — necha ${UNITS[i - 1]}?`,
            input: choice(["8", "10", "1000", "1024"]),
            answer,
            explain: `1 ${UNITS[i]} = ${answer} ${UNITS[i - 1]}`,
          };
        }
        const four = shuffle(rng, UNITS).slice(0, 4);
        const answer = UNITS[Math.max(...four.map((u) => UNITS.indexOf(u)))];
        return {
          id: `o${four.slice().sort().join(",")}`,
          data: { type: "largest" },
          text: "Qaysi birlik eng katta?",
          input: choice(four),
          answer,
          explain: UNITS.join(" → "),
        };
      }
      let a;
      let b;
      if (level === 2) {
        if (rng() < 0.5) {
          const bi = ri(rng, 2, 5);
          a = { n: ri(rng, 1, 9), unit: UNITS[bi] };
          b = { n: 100 * ri(rng, 1, 9), unit: UNITS[bi - 1] };
        } else {
          const n = ri(rng, 1, 10);
          a = { n, unit: "bayt" };
          b = { n: 8 * n + pick(rng, [-6, -4, -2, 2, 4, 6]), unit: "bit" };
          if (b.n <= 0) b.n = 8 * n + 4;
        }
      } else {
        const bi = ri(rng, 2, 5);
        const k = ri(rng, 1, 3);
        a = { n: k, unit: UNITS[bi] };
        b = { n: pick(rng, [1000 * k, 1000 * k + 500, 1024 * k]), unit: UNITS[bi - 1] };
      }
      const [x, y] = rng() < 0.5 ? [a, b] : [b, a];
      const cmp = compare(x, y);
      const answer = cmp > 0 ? label(x) : cmp < 0 ? label(y) : "Teng";
      const options = level === 3 ? [label(x), label(y), "Teng"] : [label(x), label(y)];
      const inSmall = toBits(a.n, a.unit) / toBits(1, b.unit); // a — katta birlikda, b — kichigida
      return {
        id: `${label(x)}|${label(y)}`,
        data: { x, y },
        text: "Qaysi biri katta?",
        blocks: [big(`${label(x)}   ?   ${label(y)}`)],
        input: choice(options),
        answer,
        explain: `${label(a)} = ${inSmall} ${b.unit}` + (cmp === 0 ? " → teng" : ` → ${answer} katta`),
      };
    },
  };

  // ======================================================================
  // 4. Sanoq tizimlari (5, 17–22-o'yinlar)
  // ======================================================================

  const ROMAN_RANGE = { 1: [2, 20], 2: [21, 50], 3: [51, 100] };

  // 44 → "XL + IV = 40 + 4"; bitta qism bo'lsa — null
  function romanParts(n) {
    const { toRoman } = QK().roman;
    const parts = [Math.floor(n / 10) * 10, n % 10].filter((p) => p > 0 && p < 100);
    if (n === 100 || parts.length < 2) return null;
    return { roman: parts.map(toRoman).join(" + "), arabic: parts.join(" + ") };
  }

  const rimOqish = {
    topic: "sanoq",
    levels: [1, 2, 3],
    make(level, rng) {
      const { toRoman } = QK().roman;
      const n = ri(rng, ...ROMAN_RANGE[level]);
      const r = toRoman(n);
      const p = romanParts(n);
      return {
        id: String(n),
        data: { n },
        text: "Rim sonini oʻqi.",
        blocks: [big(r)],
        input: num(3),
        answer: String(n),
        explain: p ? `${r} = ${p.roman} = ${p.arabic} = ${n}` : `${r} = ${n}`,
      };
    },
  };

  const rimYozish = {
    topic: "sanoq",
    levels: [1, 2, 3],
    make(level, rng) {
      const { toRoman, KEYS } = QK().roman;
      const n = ri(rng, ...ROMAN_RANGE[level]);
      const r = toRoman(n);
      const p = romanParts(n);
      return {
        id: String(n),
        data: { n },
        text: `${n} ni Rim raqamlarida yoz.`,
        blocks: [big(String(n))],
        input: keys(KEYS.slice(), 9),
        answer: r,
        explain: p ? `${n} = ${p.arabic} → ${p.roman} = ${r}` : `${n} = ${r}`,
      };
    },
  };

  // b-lik son: k xonali, bosh raqam 0 emas
  function randomBaseNumber(rng, b, k) {
    let s = QK().sanoq.DIGITS[ri(rng, 1, b - 1)];
    for (let j = 1; j < k; j++) s += QK().sanoq.DIGITS[ri(rng, 0, b - 1)];
    return s;
  }

  // "213" 8-likda → "2·64 + 1·8 + 3"
  function expandText(s, b) {
    const { expand } = QK().sanoq;
    return expand(s, b).map((d) => (d.place === 1 ? String(d.value) : `${d.value}·${d.place}`)).join(" + ");
  }

  const onlikka = {
    topic: "sanoq",
    levels: [1, 2, 3],
    make(level, rng) {
      const { fromBase, fmt } = QK().sanoq;
      let b;
      let s;
      if (level === 1) {
        b = ri(rng, 3, 8);
        s = randomBaseNumber(rng, b, 2);
      } else if (level === 2) {
        b = ri(rng, 3, 6);
        s = randomBaseNumber(rng, b, 3);
      } else if (rng() < 0.5) {
        b = 16;
        do s = randomBaseNumber(rng, 16, 2); while (!/[A-F]/.test(s));
      } else {
        b = ri(rng, 7, 8);
        s = randomBaseNumber(rng, b, 3);
      }
      const n = fromBase(s, b);
      const letters = [...new Set(s)].filter((ch) => /[A-F]/.test(ch)).map((ch) => `${ch} = ${QK().sanoq.digitValue(ch)}`);
      return {
        id: `${s}_${b}`,
        data: { s, b },
        text: "Oʻnlikka oʻtkaz.",
        blocks: [big(fmt(s, b))],
        input: num(3),
        answer: String(n),
        explain: `${fmt(s, b)} = ${expandText(s, b)} = ${n}` + (letters.length ? ` (${letters.join(", ")})` : ""),
      };
    },
  };

  const onlikdan = {
    topic: "sanoq",
    levels: [1, 2, 3],
    make(level, rng) {
      const { toBase, fmt, DIGITS } = QK().sanoq;
      let b;
      let n;
      if (level === 1) {
        b = ri(rng, 3, 5);
        n = ri(rng, b, Math.min(24, b * b - 1));
      } else if (level === 2) {
        b = rng() < 0.5 ? 2 : ri(rng, 6, 8);
        n = b === 2 ? ri(rng, 16, 31) : ri(rng, b, Math.min(63, b * b - 1));
      } else {
        b = 16;
        n = ri(rng, 16, 255);
      }
      const answer = toBase(n, b);
      const q = Math.floor(n / b);
      const r = n % b;
      const explain = b === 2
        ? `${n} = ${binaryParts(n)} → ${fmt(answer, 2)}`
        : `${n} = ${q}·${b} + ${r} → ${fmt(answer, b)}` + (b === 16 && (q > 9 || r > 9) ? ` (10–15 → A–F)` : "");
      return {
        id: `${n}_${b}`,
        data: { n, b },
        text: `${n} ni ${b}-likda yoz.`,
        blocks: [big(`${n} → ?${QK().sanoq.sub(b)}`)],
        input: keys(DIGITS.slice(0, b).split(""), b === 2 ? 6 : 3),
        clean: true,
        answer,
        explain,
      };
    },
  };

  const tizim = {
    topic: "sanoq",
    levels: [1, 2, 3],
    make(level, rng) {
      const { toBase, fmt } = QK().sanoq;
      if (level === 1) {
        const d = ri(rng, 2, 9);
        const len = ri(rng, 3, 4);
        let s;
        do {
          s = String(ri(rng, 1, d));
          for (let j = 1; j < len; j++) s += String(ri(rng, 0, d));
        } while (!s.includes(String(d)));
        return {
          id: s,
          data: { s },
          text: `${s} soni eng kamida necha-lik tizimda yozilgan?`,
          blocks: [big(s)],
          input: num(2),
          answer: String(d + 1),
          explain: `Eng katta raqam — ${d}, demak asos kamida ${d + 1}.`,
        };
      }
      if (level === 2) {
        const b = ri(rng, 3, 9);
        const x = ri(rng, 1, b - 1);
        const y = ri(rng, b - x, b - 1);
        const r = x + y - b;
        return {
          id: `${x}+${y}=1${r}`,
          data: { x, y, r },
          text: `Qaysi tizimda ${x} + ${y} = 1${r}?`,
          blocks: [big(`${x} + ${y} = 1${r}`)],
          input: num(1),
          answer: String(b),
          explain: `${x} + ${y} = ${x + y} = ${b} + ${r} → ${b}-lik. 10 — asosning oʻzi.`,
        };
      }
      const b = rng() < 0.4 ? 2 : ri(rng, 3, 9);
      const [lo, hi] = b === 2 ? [2, 15] : [b, b * b - 1];
      const x = ri(rng, lo, hi);
      const y = ri(rng, lo, hi);
      const X = toBase(x, b);
      const Y = toBase(y, b);
      const answer = toBase(x + y, b);
      return {
        id: `${X}+${Y}_${b}`,
        data: { X, Y, b },
        text: "Qoʻshib, javobni oʻsha tizimda yoz.",
        blocks: [big(`${fmt(X, b)} + ${fmt(Y, b)} = ?`)],
        input: keys(DIGIT_KEYS(b), 6),
        clean: true,
        answer,
        explain: `${fmt(answer, b)}. Tekshiramiz: ${x} + ${y} = ${x + y} ✓`,
      };
    },
  };

  // ======================================================================
  // 5. Sun'iy intellekt (6–12-o'yinlar)
  // ======================================================================

  // [tasdiq, to'g'rimi, izoh]
  const FACTS = [
    ["Kalkulyator — sunʼiy intellekt.", false, "Kalkulyator — oddiy dastur: odam yozgan qoidani bajaradi."],
    ["Budilnik misollardan oʻrganadi.", false, "Budilnik oddiy qoida bilan ishlaydi: soat kelsa — jiringlaydi."],
    ["Mashinali oʻrganishda qoida yozilmaydi: mashina misollardan oʻrganadi.", true, "Shuning uchun unga koʻp misol kerak."],
    ["Mashinali oʻrganish — sunʼiy intellektning bir qismi.", true, "ML doirasi AI doirasining ichida."],
    ["Chuqur oʻrganish koʻp qatlamli neyron tarmoq bilan qilinadi.", true, "Koʻp qatlam — chuqur tarmoq."],
    ["Chatbot soʻzlarning maʼnosini odamdek tushunadi.", false, "Robot maʼnoni bilmaydi: u qaysi soʻzdan keyin qaysi soʻz kelishini sanaydi."],
    ["Chatbot ishonch bilan xato javob yozishi mumkin.", true, "Shuning uchun uning javobini tekshirish kerak."],
    ["Chatbot keyingi soʻzni oʻqigan matnlariga qarab tanlaydi.", true, "U soʻz juftlarini sanab oʻrganadi."],
    ["Robot yutqazsa, tanlagan yurishiga munchoq qoʻshiladi.", false, "Yutqazsa — munchoq olinadi, yutsa — qoʻshiladi."],
    ["Robot yutsa, tanlagan yurishiga munchoq qoʻshiladi.", true, "Mukofot: yutsa +1, yutqazsa −1."],
    ["Mukofot notoʻgʻri qoʻyilsa, robot notoʻgʻri narsani oʻrganadi.", true, "Robot nimaga mukofot berilsa, shuni oʻrganadi."],
    ["Mashinani u koʻrmagan misollarda sinash kerak.", true, "Bu — sinov maʼlumoti."],
    ["Misollar bir tomonlama boʻlsa, mashina xato qilishi mumkin.", true, "Masalan, faqat oq mushuklarni koʻrgan mashina qora mushukni tanimaydi."],
    ["Muhim ishda oxirgi qarorni odam tekshirishi kerak.", true, "Mashina xato qilishi mumkin."],
    ["Kompyuter uchun rasm — sonlar yozilgan kataklar (piksellar).", true, "Har katak — son."],
    ["Rasm biroz surilsa ham, shablon usuli uni doim toʻgʻri taniydi.", false, "Rasm surilsa, piksellar boshqacha boʻladi va shablon adashadi."],
    ["Bitta neyron har qanday ishni bajara oladi.", false, "Baʼzi ishga ikki qatlam kerak."],
    ["Neyronda +1 ogʻirlik yonishga yordam beradi, −1 xalaqit beradi.", true, "Yigʻindi chegaradan kam boʻlmasa — neyron yonadi."],
    ["Kompyuter koʻrish — bu usul emas, vazifa.", true, "Uni qoida bilan ham, misollar bilan ham yechish mumkin."],
    ["Eng yaqin misol usulida mashina yangi narsani eng oʻxshash misolga qarab aniqlaydi.", true, "Yangi narsa eng yaqin misol bilan bir guruhga tushadi."],
    ["Oddiy dasturga qoidani odam yozib beradi.", true, "Mashinali oʻrganishda esa qoidani mashina misollardan topadi."],
  ];

  const togri = {
    topic: "ai",
    levels: [1],
    make(level, rng, fresh) {
      const pool = FACTS.filter((f) => fresh(f[0]));
      if (!pool.length) return null;
      const [text, ok, note] = pick(rng, pool);
      const answer = ok ? "Toʻgʻri" : "Notoʻgʻri";
      return {
        id: text,
        data: { ok },
        text: `Toʻgʻrimi? «${text}»`,
        input: choice(["Toʻgʻri", "Notoʻgʻri"]),
        answer,
        explain: `${answer}. ${note}`,
      };
    },
  };

  const aimi = {
    topic: "ai",
    levels: [1],
    make(level, rng, fresh) {
      const pool = QK().atlas.EXAMPLES.filter((e) => fresh(e.text));
      if (!pool.length) return null;
      const e = pick(rng, pool);
      const answer = e.zone === "plain" ? "Yoʻq" : "Ha";
      return {
        id: e.text,
        data: { zone: e.zone },
        text: `«${e.text}» — sunʼiy intellektmi?`,
        input: choice(["Ha", "Yoʻq"]),
        answer,
        explain: `${answer}. ${e.why}`,
      };
    },
  };

  const neyron = {
    topic: "ai",
    levels: [1, 2, 3],
    make(level, rng) {
      const { weightedSum, fire } = QK().neural;
      for (;;) {
        const count = level === 2 ? ri(rng, 2, 3) : ri(rng, level === 1 ? 2 : 3, 4);
        const inputs = Array.from({ length: count }, () => (rng() < 0.6 ? 1 : 0));
        const weights = inputs.map(() => (level === 1 ? 1 : level === 2 ? pick(rng, [1, 1, -1]) : pick(rng, [-1, 1, 2, 3])));
        if (level === 2 && !weights.includes(-1)) continue;
        const sum = weightedSum(inputs, weights);
        const terms = inputs.map((x, j) => `${x}·(${signed(weights[j])})`).join(" + ");
        if (level === 3) {
          if (sum < 0 || !inputs.includes(1)) continue;
          return {
            id: `${inputs.join("")}|${weights.join(",")}`,
            data: { inputs, weights },
            text: "Neyron yigʻindisi nechchi? Yoniq kirish — 1, oʻchiq — 0.",
            blocks: [{ type: "neuron", inputs, weights }],
            input: num(2),
            answer: String(sum),
            explain: `${terms} = ${sum}`,
          };
        }
        const threshold = ri(rng, 1, level === 1 ? count : 2);
        const on = fire(inputs, weights, threshold);
        return {
          id: `${inputs.join("")}|${weights.join(",")}|${threshold}`,
          data: { inputs, weights, threshold },
          text: "Neyron yonadimi? Yoniq kirish — 1, oʻchiq — 0.",
          blocks: [{ type: "neuron", inputs, weights, threshold }],
          input: choice(["Ha", "Yoʻq"]),
          answer: on ? "Ha" : "Yoʻq",
          explain: `Yigʻindi: ${terms} = ${sum}. ${sum} ${on ? "≥" : "<"} ${threshold} → ${on ? "yonadi" : "yonmaydi"}.`,
        };
      }
    },
  };

  const xarita = {
    topic: "ai",
    levels: [2, 3],
    make(level, rng, fresh) {
      const { EXAMPLES, DEFS, JOBS, ZONES, TASKS, zoneName, taskName } = QK().atlas;
      const items = level === 2
        ? EXAMPLES.map((e) => ({ id: `e${e.text}`, kind: "example", e })).concat(DEFS.map((d) => ({ id: `d${d.text}`, kind: "def", d })))
        : JOBS.map((j) => ({ id: `j${j.text}`, kind: "job", j })).concat(EXAMPLES.map((e) => ({ id: `e${e.text}`, kind: "example", e })));
      const pool = items.filter((it) => fresh(it.id));
      if (!pool.length) return null;
      const it = pick(rng, pool);
      if (it.kind === "job") {
        return {
          id: it.id,
          data: { task: it.j.task },
          text: `«${it.j.text}» — bu qaysi vazifa?`,
          input: choice(TASKS.map((t) => t.name)),
          answer: taskName(it.j.task),
          explain: `${it.j.text} — ${taskName(it.j.task)}.`,
        };
      }
      if (it.kind === "def") {
        return {
          id: it.id,
          data: { zone: it.d.circle },
          text: `Bu qaysi doira haqida? «${it.d.text}»`,
          input: choice(ZONES.filter((z) => z.id !== "plain").map((z) => z.name)),
          answer: zoneName(it.d.circle),
          explain: `${zoneName(it.d.circle)}: ${ZONES.find((z) => z.id === it.d.circle).def}`,
        };
      }
      return {
        id: it.id,
        data: { zone: it.e.zone },
        text: `«${it.e.text}» — xaritaning qayerida?`,
        input: choice(ZONES.map((z) => z.name)),
        answer: zoneName(it.e.zone),
        explain: `${zoneName(it.e.zone)}. ${it.e.why}`,
      };
    },
  };

  // Qabila gaplari: ega + (narsa + fe'l). Fe'l narsaga mos keladi.
  const SUBJECTS = ["bola", "ovchi", "qabila", "ona", "ota"];
  const OBJECTS = { olov: ["yoqdi", "koʻrdi"], suv: ["ichdi", "koʻrdi"], non: ["yedi", "koʻrdi"], ovga: ["chiqdi"], "togʻga": ["chiqdi"] };

  function pairCount(sentences, a, b) {
    let c = 0;
    for (const s of sentences) for (let j = 0; j + 1 < s.length; j++) if (s[j] === a && s[j + 1] === b) c++;
    return c;
  }
  function nextCounts(sentences, w) {
    const out = {};
    for (const s of sentences) for (let j = 0; j + 1 < s.length; j++) if (s[j] === w) out[s[j + 1]] = (out[s[j + 1]] || 0) + 1;
    return out;
  }

  const keyingi = {
    topic: "ai",
    levels: [2, 3],
    make(level, rng) {
      for (;;) {
        const n = level === 2 ? 4 : 6;
        const sentences = Array.from({ length: n }, () => {
          const obj = pick(rng, Object.keys(OBJECTS));
          return [pick(rng, SUBJECTS), obj, pick(rng, OBJECTS[obj])];
        });
        const lines = sentences.map((s) => s.join(" "));
        if (new Set(lines).size < n - 1) continue; // bir xil gaplar ko'p bo'lmasin
        const id = lines.join("|");
        if (level === 3 && rng() < 0.5) {
          const s = pick(rng, sentences);
          const j = ri(rng, 0, 1);
          const [a, b] = [s[j], s[j + 1]];
          const c = pairCount(sentences, a, b);
          return {
            id: `${id}#${a} ${b}`,
            data: { sentences, a, b },
            text: `Robot shu gaplarni oʻqidi. «${a} ${b}» juftligi necha marta uchradi?`,
            blocks: [{ type: "lines", items: lines }],
            input: num(1),
            answer: String(c),
            explain: `«${a} ${b}» — ${c} marta.`,
          };
        }
        // Keyingi so'z: eng ko'p uchragani yagona bo'lsin, kamida 2 xil davomi bor
        const words = shuffle(rng, [...new Set(sentences.flatMap((s) => (level === 2 ? [s[0]] : [s[0], s[1]])))]);
        for (const w of words) {
          const counts = nextCounts(sentences, w);
          const list = Object.entries(counts).sort((p, q) => q[1] - p[1]);
          if (list.length < 2 || list[0][1] === list[1][1]) continue;
          const answer = list[0][0];
          return {
            id: `${id}#${w}`,
            data: { sentences, w },
            text: `Robot shu gaplarni oʻqidi. «${w}» dan keyin qaysi soʻzni yozadi?`,
            blocks: [{ type: "lines", items: lines }],
            input: choice(shuffle(rng, list.map((p) => p[0]))),
            answer,
            explain: list.map(([x, c]) => `«${w} ${x}» — ${c} marta`).join(", ") + ". Robot eng koʻpini tanlaydi.",
          };
        }
      }
    },
  };

  // ======================================================================
  // 6. Klaviatura (23-o'yin: o'n barmoq; tezkor tugmalar)
  // ======================================================================

  const FINGER_NAMES = {
    lp: "Chap jimjiloq", lr: "Chap nomsiz", lm: "Chap oʻrta", li: "Chap koʻrsatkich",
    ri: "Oʻng koʻrsatkich", rm: "Oʻng oʻrta", rr: "Oʻng nomsiz", rp: "Oʻng jimjiloq", th: "Bosh barmoq",
  };
  const FINGER_ORDER = ["lp", "lr", "lm", "li", "ri", "rm", "rr", "rp"];
  const ROW_NAMES = { top: "Yuqori qator", home: "Asosiy qator", bottom: "Pastki qator" };
  const LETTERS = (row) => QK().typing.ROWS[row].filter((k) => /^[a-z]$/.test(k));
  const rowOf = (k) => Object.keys(ROW_NAMES).find((row) => QK().typing.ROWS[row].includes(k));

  // Qaysi barmoq: 1 — asosiy qator, 2 — yuqori va pastki qator
  const barmoq = {
    topic: "klaviatura",
    levels: [1, 2],
    make(level, rng, fresh) {
      const { fingerOf } = QK().typing;
      const pool = (level === 1 ? LETTERS("home") : LETTERS("top").concat(LETTERS("bottom"))).filter(fresh);
      if (!pool.length) return null;
      const key = pick(rng, pool);
      const f = fingerOf(key);
      const i = FINGER_ORDER.indexOf(f);
      const mirror = FINGER_ORDER[7 - i]; // boshqa qo'ldagi xuddi shu barmoq
      const near = [FINGER_ORDER[i - 1], FINGER_ORDER[i + 1]].filter((x) => x && x[0] === f[0]);
      const answer = FINGER_NAMES[f];
      return {
        id: key,
        data: { key },
        text: `${key.toUpperCase()} tugmasini qaysi barmoq bosadi?`,
        blocks: [big(key.toUpperCase())],
        input: choice(withOptions(rng, answer, [mirror, ...shuffle(rng, near), "th"].map((x) => FINGER_NAMES[x]))),
        answer,
        explain: `${key.toUpperCase()} — ${answer.toLowerCase()} barmoq.`,
      };
    },
  };

  const qator = {
    topic: "klaviatura",
    levels: [1],
    make(level, rng, fresh) {
      const pool = ["top", "home", "bottom"].flatMap(LETTERS).filter(fresh);
      if (!pool.length) return null;
      const key = pick(rng, pool);
      const answer = ROW_NAMES[rowOf(key)];
      return {
        id: key,
        data: { key },
        text: `${key.toUpperCase()} harfi klaviaturaning qaysi qatorida?`,
        blocks: [big(key.toUpperCase())],
        input: choice(Object.values(ROW_NAMES)),
        answer,
        explain: `${key.toUpperCase()} — ${answer.toLowerCase()}da.`,
      };
    },
  };

  // O'zbekcha harflar: ikki tugma bilan (ʻ — klaviaturadagi apostrof tugmasi)
  const TWO_KEYS = [
    { letter: "Oʻ", answer: "O + ʻ", wrong: ["O + Shift", "U + ʻ", "O + ;"] },
    { letter: "Gʻ", answer: "G + ʻ", wrong: ["G + Shift", "Q + ʻ", "G + H"] },
    { letter: "Sh", answer: "S + H", wrong: ["S + Shift", "C + H", "S + ʻ"] },
    { letter: "Ch", answer: "C + H", wrong: ["S + H", "C + ʻ", "K + H"] },
    { letter: "Ng", answer: "N + G", wrong: ["G + N", "N + ʻ", "M + G"] },
  ];

  const ikkiTugma = {
    topic: "klaviatura",
    levels: [1],
    make(level, rng, fresh) {
      const pool = TWO_KEYS.filter((t) => fresh(t.letter));
      if (!pool.length) return null;
      const t = pick(rng, pool);
      return {
        id: t.letter,
        data: { letter: t.letter },
        text: `${t.letter} harfi klaviaturada qanday yoziladi?`,
        blocks: [big(t.letter)],
        input: choice(withOptions(rng, t.answer, t.wrong)),
        answer: t.answer,
        explain: `${t.letter} — ikki tugma: ${t.answer}.`,
      };
    },
  };

  const shiftQaysi = {
    topic: "klaviatura",
    levels: [2],
    make(level, rng, fresh) {
      const { fingerOf, shiftFor } = QK().typing;
      const pool = ["top", "home", "bottom"].flatMap(LETTERS).filter(fresh);
      if (!pool.length) return null;
      const key = pick(rng, pool);
      const letter = key.toUpperCase();
      const answer = shiftFor(letter) === "shift-l" ? "Chap Shift" : "Oʻng Shift";
      const hand = fingerOf(key)[0] === "l" ? "chap" : "oʻng";
      return {
        id: key,
        data: { key },
        text: `Katta ${letter} yozish uchun qaysi Shift ni bosasan?`,
        blocks: [big(letter)],
        input: choice(["Chap Shift", "Oʻng Shift"]),
        answer,
        explain: `${letter} — ${hand} qoʻlda. Shift ni boshqa qoʻl bosadi: ${answer.toLowerCase().replace("shift", "Shift")}.`,
      };
    },
  };

  // Aniqlik: to'g'ri belgilar : hamma bosishlar × 100 (butun son chiqadiganlari)
  const ACCURACY = [];
  for (const s of [10, 20, 25, 50]) {
    for (let c = Math.ceil(s * 0.7); c <= s; c++) if ((c * 100) % s === 0) ACCURACY.push([c, s]);
  }

  const aniqlik = {
    topic: "klaviatura",
    levels: [3],
    make(level, rng, fresh) {
      const pool = ACCURACY.filter(([c, s]) => fresh(`${c}/${s}`));
      if (!pool.length) return null;
      const [c, s] = pick(rng, pool);
      const a = (c * 100) / s;
      return {
        id: `${c}/${s}`,
        data: { c, s },
        text: `Qatorda ${c} ta belgi bor edi. Sen tugmalarni ${s} marta bosding. Aniqliging necha foiz?`,
        input: num(3),
        answer: String(a),
        explain: `${c} : ${s} × 100 = ${a}%${a >= 90 ? " — qator oʻtadi." : " — 90% dan past, qator oʻtmaydi."}`,
      };
    },
  };

  // Tezlik: belgilar × 60 : soniyalar (butun son)
  const SPEED = [];
  for (const sec of [10, 15, 20, 30]) {
    for (let c = 10; (c * 60) / sec <= 180; c += 5) SPEED.push([c, sec]);
  }

  const tezlik = {
    topic: "klaviatura",
    levels: [3],
    make(level, rng, fresh) {
      const pool = SPEED.filter(([c, sec]) => fresh(`${c}/${sec}`));
      if (!pool.length) return null;
      const [c, sec] = pick(rng, pool);
      const cpm = (c * 60) / sec;
      return {
        id: `${c}/${sec}`,
        data: { c, sec },
        text: `Sen ${sec} soniyada ${c} ta belgi yozding. Tezliging — 1 daqiqada nechta belgi?`,
        input: num(3),
        answer: String(cpm),
        explain: `1 daqiqa = 60 soniya = ${60 / sec} × ${sec} soniya. ${c} × ${60 / sec} = ${cpm} belgi/daqiqa.`,
      };
    },
  };

  // Poyga g'olibi (23-o'yin qoidasi): aniqligi 90% dan past yuta olmaydi, keyin — kim tezroq
  const poyga = {
    topic: "klaviatura",
    levels: [3],
    make(level, rng) {
      const { raceResult } = QK().typing;
      for (;;) {
        const a = { accuracy: pick(rng, [80, 85, 88, 90, 92, 95, 98, 100]), ms: ri(rng, 8, 20) * 1000 };
        const b = { accuracy: pick(rng, [80, 85, 88, 90, 92, 95, 98, 100]), ms: ri(rng, 8, 20) * 1000 };
        const r = raceResult(a, b);
        if (r.reason === "draw") continue;
        const answer = r.winner === "left" ? "Oy" : r.winner === "right" ? "Quyosh" : "Hech kim";
        const why = r.reason === "low" ? "Ikkalasining ham aniqligi 90% dan past."
          : r.reason === "accuracy" ? `${r.winner === "left" ? "Quyosh" : "Oy"}ning aniqligi 90% dan past.`
            : `Ikkalasi ham aniq yozdi, ${answer} tezroq.`;
        return {
          id: `${a.accuracy}:${a.ms}|${b.accuracy}:${b.ms}`,
          data: { a, b },
          text: `Poyga. Oy: aniqlik ${a.accuracy}%, ${a.ms / 1000} soniya. Quyosh: aniqlik ${b.accuracy}%, ${b.ms / 1000} soniya. Kim yutdi?`,
          input: choice(["Oy", "Quyosh", "Hech kim"]),
          answer,
          explain: `${answer}. ${why}`,
        };
      }
    },
  };

  // Tezkor tugmalar (Windows; Mac'da Ctrl o'rniga ⌘). Tekislash — Word dasturida.
  const SHORTCUTS = [
    { keys: "Ctrl + C", act: "Nusxa olish", level: 1 },
    { keys: "Ctrl + V", act: "Qoʻyish", level: 1 },
    { keys: "Ctrl + Z", act: "Bekor qilish", level: 1 },
    { keys: "Ctrl + S", act: "Saqlash", level: 1 },
    { keys: "Ctrl + X", act: "Kesib olish", level: 2 },
    { keys: "Ctrl + A", act: "Hammasini belgilash", level: 2 },
    { keys: "Ctrl + P", act: "Chop etish", level: 2 },
    { keys: "Ctrl + F", act: "Qidirish", level: 2 },
    { keys: "Ctrl + Y", act: "Bekor qilinganni qaytarish", level: 2 },
    { keys: "Ctrl + B", act: "Qalin qilish", level: 3 },
    { keys: "Ctrl + I", act: "Kursiv (qiya) qilish", level: 3 },
    { keys: "Ctrl + U", act: "Tagiga chizish", level: 3 },
    { keys: "Ctrl + E", act: "Markazga tekislash", level: 3 },
    { keys: "Ctrl + L", act: "Chapga tekislash", level: 3 },
    { keys: "Ctrl + R", act: "Oʻngga tekislash", level: 3 },
  ];
  // Chalg'ituvchi variantlar: avval shu qiyinlikdagilar, keyin qolganlari
  const others = (rng, s, level) => shuffle(rng, SHORTCUTS.filter((x) => x !== s && x.level === level))
    .concat(shuffle(rng, SHORTCUTS.filter((x) => x !== s && x.level !== level)));

  const tezkorNima = {
    topic: "klaviatura",
    levels: [1, 2, 3],
    make(level, rng, fresh) {
      const pool = SHORTCUTS.filter((s) => s.level === level && fresh(s.keys));
      if (!pool.length) return null;
      const s = pick(rng, pool);
      return {
        id: s.keys,
        data: { keys: s.keys },
        text: `${s.keys} nima qiladi?`,
        blocks: [big(s.keys)],
        input: choice(withOptions(rng, s.act, others(rng, s, level).map((x) => x.act))),
        answer: s.act,
        explain: `${s.keys} — ${s.act.toLowerCase()}.`,
      };
    },
  };

  const tezkorQaysi = {
    topic: "klaviatura",
    levels: [1, 2, 3],
    make(level, rng, fresh) {
      const pool = SHORTCUTS.filter((s) => s.level === level && fresh(s.act));
      if (!pool.length) return null;
      const s = pick(rng, pool);
      return {
        id: s.act,
        data: { act: s.act },
        text: `«${s.act}» uchun qaysi tezkor tugmalar?`,
        input: choice(withOptions(rng, s.keys, others(rng, s, level).map((x) => x.keys))),
        answer: s.keys,
        explain: `${s.act} — ${s.keys}.`,
      };
    },
  };

  // Vaziyat: nima qilasan? (2 — bitta tugma, 3 — ikki tugma ketma-ket)
  const SITUATIONS = [
    { level: 2, text: "Adashib gapni oʻchirib yubording. Uni qanday qaytarasan?", answer: "Ctrl + Z", wrong: ["Ctrl + S", "Ctrl + V", "Ctrl + A"] },
    { level: 2, text: "Ishing yoʻqolib qolmasin. Nima qilasan?", answer: "Ctrl + S", wrong: ["Ctrl + Z", "Ctrl + P", "Ctrl + C"] },
    { level: 2, text: "Uzun matndan «qabila» soʻzini topmoqchisan.", answer: "Ctrl + F", wrong: ["Ctrl + A", "Ctrl + P", "Ctrl + E"] },
    { level: 2, text: "Mac kompyuterida Ctrl oʻrniga qaysi tugma bosiladi?", answer: "⌘ (Command)", wrong: ["Shift", "Alt", "Fn"] },
    { level: 3, text: "Soʻzni bir joydan olib, boshqa joyga koʻchirmoqchisan.", answer: "Ctrl + X, keyin Ctrl + V", wrong: ["Ctrl + C, keyin Ctrl + Z", "Ctrl + V, keyin Ctrl + X", "Ctrl + A, keyin Ctrl + S"] },
    { level: 3, text: "Gapdan nusxa olib, pastda yana bir marta yozmoqchisan.", answer: "Ctrl + C, keyin Ctrl + V", wrong: ["Ctrl + X, keyin Ctrl + Z", "Ctrl + V, keyin Ctrl + C", "Ctrl + C, keyin Ctrl + S"] },
    { level: 3, text: "Butun matnni qalin qilmoqchisan.", answer: "Ctrl + A, keyin Ctrl + B", wrong: ["Ctrl + B, keyin Ctrl + A", "Ctrl + A, keyin Ctrl + I", "Ctrl + S, keyin Ctrl + B"] },
    { level: 3, text: "Wordʼda sarlavhani belgilab, oʻrtaga qoʻymoqchisan.", answer: "Ctrl + E", wrong: ["Ctrl + L", "Ctrl + R", "Ctrl + C"] },
  ];

  const vaziyat = {
    topic: "klaviatura",
    levels: [2, 3],
    make(level, rng, fresh) {
      const pool = SITUATIONS.filter((s) => s.level === level && fresh(s.text));
      if (!pool.length) return null;
      const s = pick(rng, pool);
      return {
        id: s.text,
        data: { text: s.text },
        text: s.text,
        input: choice(withOptions(rng, s.answer, s.wrong)),
        answer: s.answer,
        explain: `${s.answer}.`,
      };
    },
  };

  // ======================================================================
  // Turlar, tekshirish va juft savollar
  // ======================================================================

  const KINDS = {
    sozlar, morze, sezar,
    naqsh, ikkilikdan, ikkilikka,
    bayt, piksel, kadr, birlik,
    rimOqish, rimYozish, onlikka, onlikdan, tizim,
    togri, aimi, neyron, xarita, keyingi,
    barmoq, qator, ikkiTugma, shiftQaysi, aniqlik, tezlik, poyga, tezkorNima, tezkorQaysi, vaziyat,
  };

  const kindsOf = (topic, level) => Object.keys(KINDS).filter((k) => KINDS[k].topic === topic && KINDS[k].levels.includes(level));

  // Bitta savol. fresh(id) — shu savol hali berilmaganmi (ro'yxatli turlar uchun). null — tugadi.
  function make(kind, level, rng, fresh) {
    const def = KINDS[kind];
    const q = def.make(level, rng || Math.random, fresh || (() => true));
    if (!q) return null;
    const { id, ...rest } = q;
    return Object.assign({ kind, topic: def.topic, level, key: `${kind}:${level}:${id}`, blocks: [] }, rest);
  }

  function check(q, value) {
    const v = String(value == null ? "" : value).trim().toUpperCase();
    if (q.clean) return QK().sanoq.clean(v) === q.answer;
    if (q.input.type === "num") return v !== "" && String(Number(v)) === q.answer;
    return v === q.answer.toUpperCase();
  }

  // Musobaqa uchun savollar dastasi: next() → [savol, savol] yoki null
  function deck({ topics, levels, rng }) {
    rng = rng || Math.random;
    const used = new Set();
    const dead = new Set(); // "tur:daraja" — savollari tugagan
    let prevKind = null;
    let last = [];

    function attempt(kind, level) {
      const out = [];
      const prefix = `${kind}:${level}:`;
      const fresh = (id) => !used.has(prefix + id) && !out.some((q) => q.key === prefix + id);
      for (let t = 0; t < 80 && out.length < 2; t++) {
        const q = make(kind, level, rng, fresh);
        if (!q) break;
        if (fresh(q.key.slice(prefix.length))) out.push(q);
      }
      if (out.length < 2) {
        dead.add(kind + ":" + level);
        return null;
      }
      out.forEach((q) => used.add(q.key));
      return out;
    }

    function find() {
      for (const topic of shuffle(rng, topics)) {
        for (const level of shuffle(rng, levels)) {
          const kinds = shuffle(rng, kindsOf(topic, level).filter((k) => !dead.has(k + ":" + level)));
          kinds.sort((a, b) => (a === prevKind) - (b === prevKind)); // oldingi tur — eng oxirida
          for (const kind of kinds) {
            const pair = attempt(kind, level);
            if (pair) {
              prevKind = kind;
              return pair;
            }
          }
        }
      }
      return null;
    }

    // Hamma savol ishlatilgan bo'lsa — dasta qaytadan aralashtiriladi (oxirgi juft darhol takrorlanmaydi)
    function next() {
      let pair = find();
      if (!pair && used.size > last.length) {
        used.clear();
        dead.clear();
        last.forEach((k) => used.add(k));
        pair = find();
      }
      if (pair) last = pair.map((q) => q.key);
      return pair;
    }

    return { next, used };
  }

  const topicTitle = (id) => (TOPICS.find((t) => t.id === id) || {}).title;
  const levelTitle = (id) => (LEVELS.find((l) => l.id === id) || {}).title;

  const api = { TOPICS, LEVELS, KINDS, FACTS, MORSE_WORDS, SHORTCUTS, TWO_KEYS, SITUATIONS, FINGER_NAMES, kindsOf, make, check, deck, topicTitle, levelTitle };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.savollar = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
