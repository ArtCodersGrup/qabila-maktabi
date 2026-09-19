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
  const PRACTICE = ["KITOB", "QUSH", "CHOY", "TONG", "GʻOZ", "SHAMOL", "BULUT", "OLMA"];
  // 2-bosqich (shifrlash): birinchisi har doim XOʻP, keyin tasodifiy
  const FIRST_REPLY = "XOʻP";
  const REPLIES = ["TAYYOR", "RAHMAT", "SALOM", "KELING"];
  // 3-bosqich (kalitsiz ochish)
  const CRACK = ["SALOM", "DOʻST", "QUYOSH", "YULDUZ"];

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

  // Mashq misoli: ro'yxatdan so'z (oldingisidan boshqa), kalit 1–6 (xatdagi 3 dan boshqa)
  function makeExercise(list, prev, rng) {
    rng = rng || Math.random;
    const word = pickOther(list, prev && prev.word, rng);
    let key = randInt(rng, 1, 5);
    if (key >= FIRST_KEY) key += 1; // 1, 2, 4, 5, 6
    return { word, key };
  }

  // Kalitsiz ochish: so'z (oldingisidan boshqa), kalit 4–9
  function makeCrack(prev, rng) {
    rng = rng || Math.random;
    return { word: pickOther(CRACK, prev && prev.word, rng), key: randInt(rng, 4, 9) };
  }

  const api = {
    ALPHABET, FIRST_KEY, LETTERS, PRACTICE, FIRST_REPLY, REPLIES, CRACK,
    tokenize, wrapKey, shift, encrypt, decrypt, checkLetters, pickLetter, makeExercise, makeCrack,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.caesar = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
