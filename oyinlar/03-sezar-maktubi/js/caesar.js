// Sezar maktubi — sof hisob: o'zbek lotin alifbosi, surish, so'zlar va tekshirish. Node'da test qilinadi.
(function (root) {
  "use strict";

  // O'zbek lotin alifbosi tartibida 29 ta harf. Oʻ, Gʻ, Sh, Ch, Ng — bitta harf (ekranda bitta katak).
  const ALPHABET = [
    "A", "B", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
    "U", "V", "X", "Y", "Z", "Oʻ", "Gʻ", "Sh", "Ch", "Ng",
  ];
  const N = ALPHABET.length;

  const FIRST_KEY = 3; // Sezar harflarni 3 ga surgan (Svetoniy)

  // Sezar xatlari (1-bosqich), kalit 3
  const LETTERS = [
    "XATNI HECH KIM OʻQIMASIN",
    "ERTAGA TONGDA YOʻLGA CHIQAMIZ",
    "DOʻSTLARIM SIZGA ISHONAMAN",
    "QOʻSHIN DARYO BOʻYIDA KUTSIN",
  ];
  // 1-bosqich mashqi (ochish)
  // 2026-10-02: banklar kengaydi (8 → 15, 4 → 10, 4 → 10) — qayta o'ynaganda boshqa so'zlar chiqsin
  const PRACTICE = [
    "KITOB", "QUSH", "CHOY", "TONG", "GʻOZ", "SHAMOL", "BULUT", "OLMA",
    "DARYO", "QALAM", "BOLA", "TOSH", "YOʻL", "ANOR", "QUYON",
  ];
  // 2-bosqich (shifrlash): birinchisi har doim XOʻP, keyin tasodifiy
  const FIRST_REPLY = "XOʻP";
  const REPLIES = ["TAYYOR", "RAHMAT", "SALOM", "KELING", "BORAMIZ", "KUTAMIZ", "YAXSHI", "MAYLI", "ALBATTA", "XAYR"];
  // 3-bosqich (kalitsiz ochish)
  // Kamida 4 harfli so'zlar: qisqa so'z boshqa kalitda ham tasodifan ma'noli chiqib qolishi mumkin
  const CRACK = ["SALOM", "DOʻST", "QUYOSH", "YULDUZ", "DARAXT", "BAHOR", "OSMON", "GULZOR", "MAKTAB", "CHIROQ"];

  // Katta harflar bilan yozilgan so'zni harflarga ajratish: "SH" → "Sh", "Oʻ" → "Oʻ"
  const DIGRAPHS = { "Oʻ": "Oʻ", "Gʻ": "Gʻ", SH: "Sh", CH: "Ch", NG: "Ng" };

  function tokenize(word) {
    const out = [];
    for (let k = 0; k < word.length; ) {
      const two = word.slice(k, k + 2);
      if (DIGRAPHS[two]) {
        out.push(DIGRAPHS[two]);
        k += 2;
      } else {
        out.push(word[k]);
        k += 1;
      }
    }
    return out;
  }

  const wrapKey = (k) => ((k % N) + N) % N;

  // Harfni k ta oldinga surish (k manfiy — orqaga). Alifbo aylana: Ng dan keyin A.
  const shift = (letter, k) => ALPHABET[wrapKey(ALPHABET.indexOf(letter) + k)];
  const encrypt = (tokens, key) => tokens.map((t) => shift(t, key));
  const decrypt = (tokens, key) => tokens.map((t) => shift(t, -key));

  // Noto'g'ri kataklar indekslari
  function checkLetters(expected, given) {
    const wrong = [];
    expected.forEach((t, k) => {
      if (given[k] !== t) wrong.push(k);
    });
    return wrong;
  }

  const randInt = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
  const pickOther = (list, prev, rng) => {
    const pool = list.filter((x) => x !== prev);
    return pool[Math.floor(rng() * pool.length)];
  };

  // Xat: oldingisidan boshqa (qayta o'ynaganda ketma-ket takrorlanmaydi)
  const pickLetter = (rng, prev) => pickOther(LETTERS, prev, rng || Math.random);

  const tierOf = (tier) => Math.max(0, Math.min(2, tier || 0));
  // Kalit chegaralari qiyinlik zinasi bo'yicha (QOIDALAR 4.3): katta kalitda alifbo aylanadi (Ng dan keyin A)
  const KEY_RANGES = [[1, 6], [7, 14], [15, 28]];
  // Pastki qator yashirin bo'lganda bola harfni o'zi suradi — kalit kichik bo'lishi kerak
  const BLIND_KEYS = [[1, 2, 4], [1, 2, 4], [1, 2, 4, 5]];

  // Mashq misoli: ro'yxatdan so'z (oldingisidan boshqa). Kalit zina bo'yicha:
  // tier 0 — 1–6 (xatdagi 3 dan boshqa), tier 1 — 7–14, tier 2 — 15–28.
  // blind — jadvalning pastki qatori yashirin (bola yoddan suradi): kalit 1, 2, 4 (tier 2 da 5 ham).
  function makeExercise(list, prev, rng, tier, blind) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    const word = pickOther(list, prev && prev.word, rng);
    if (blind) {
      const keys = BLIND_KEYS[t];
      return { word, key: keys[Math.floor(rng() * keys.length)], blind: true, tier: t };
    }
    let key;
    if (t === 0) {
      key = randInt(rng, 1, 5);
      if (key >= FIRST_KEY) key += 1; // 1, 2, 4, 5, 6
    } else {
      key = randInt(rng, KEY_RANGES[t][0], KEY_RANGES[t][1]);
    }
    return { word, key, blind: false, tier: t };
  }

  // Mashq rejasi: `correct` — shu paytgacha nechta to'g'ri javob, `visible` — jadval ko'rinib turadigan
  // misollar soni. Avval zina o'sadi (0 → 1 → 2), `visible` tadan keyin pastki qator yashiriladi (blind).
  // Qiyin rejimda (tier 2) ko'rinadigan misollar ham darhol eng katta kalitlar bilan keladi.
  function makePlanned(list, prev, correct, tier, visible, rng) {
    if (correct >= visible) return makeExercise(list, prev, rng, tier, true);
    return makeExercise(list, prev, rng, tierOf(tier) === 2 ? 2 : Math.min(correct, 2), false);
  }

  // Kalitsiz ochish: so'z (oldingisidan boshqa). Kalit daraja bo'yicha uzoqlashadi:
  // 0 — 4–9, 1 — 10–15, 2 — 16–21, 3 — 22–27 (orqaga «−» bilan yaqinroq ekanini bola o'zi topadi).
  const CRACK_RANGES = [[4, 9], [10, 15], [16, 21], [22, 27]];
  function makeCrack(prev, rng, level) {
    rng = rng || Math.random;
    const [lo, hi] = CRACK_RANGES[Math.max(0, Math.min(CRACK_RANGES.length - 1, level || 0))];
    return { word: pickOther(CRACK, prev && prev.word, rng), key: randInt(rng, lo, hi) };
  }

  // Kalitsiz ochish darajasi: oddiy rejimda 0, 1, 2, 3; qiyin rejimda (tier 2) darhol 2 va 3
  const crackLevel = (correct, tier) => (tierOf(tier) === 2 && correct < 2 ? correct + 2 : Math.min(correct, 3));

  const api = {
    ALPHABET, FIRST_KEY, LETTERS, PRACTICE, FIRST_REPLY, REPLIES, CRACK, KEY_RANGES, BLIND_KEYS, CRACK_RANGES,
    tokenize, wrapKey, shift, encrypt, decrypt, checkLetters, pickLetter,
    makeExercise, makePlanned, makeCrack, crackLevel,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.caesar = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
