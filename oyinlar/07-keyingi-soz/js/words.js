// Keyingi so'z — sof hisob: qabila gaplari, juftliklar jadvali, gap yasash, topshiriqlar.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  // Qabila gaplari (har biri 3 ta so'z)
  const BASE = [
    ["bola", "olov", "yoqdi"],
    ["bola", "suv", "ichdi"],
    ["bola", "olov", "koʻrdi"],
    ["ovchi", "olov", "yoqdi"],
    ["ovchi", "suv", "ichdi"],
    ["qabila", "olov", "yoqdi"],
    ["qabila", "suv", "ichdi"],
  ];
  // 3-bosqichda qo'shiladigan matn
  const EXTRA = [
    ["ovchi", "togʻga", "chiqdi"],
    ["bola", "togʻga", "chiqdi"],
    ["qabila", "ovga", "chiqdi"],
    ["ovchi", "ovga", "chiqdi"],
  ];
  const ALL = BASE.concat(EXTRA);

  // Juftliklar jadvali: { soʻz: { keyingi soʻz: soni } }
  function table(sentences) {
    const out = {};
    for (const sentence of sentences) {
      for (let i = 0; i + 1 < sentence.length; i++) {
        const w = sentence[i];
        out[w] = out[w] || {};
        out[w][sentence[i + 1]] = (out[w][sentence[i + 1]] || 0) + 1;
      }
    }
    return out;
  }

  // Bir so'zdan keyin kelganlar: ko'pdan kamga (teng bo'lsa alifbo tartibida)
  function nextList(t, word) {
    const row = t[word] || {};
    return Object.keys(row)
      .map((w) => ({ word: w, n: row[w] }))
      .sort((a, b) => b.n - a.n || (a.word < b.word ? -1 : 1));
  }

  const best = (t, word) => (nextList(t, word)[0] || {}).word;
  const total = (t, word) => nextList(t, word).reduce((sum, item) => sum + item.n, 0);
  const starters = (sentences) => [...new Set(sentences.map((s) => s[0]))];
  const vocabulary = (sentences) => [...new Set([].concat.apply([], sentences))];

  // Ehtimol bilan keyingi so'z: ko'p uchragani ko'proq chiqadi
  function sample(t, word, rng) {
    const list = nextList(t, word);
    if (!list.length) return null;
    let r = (rng || Math.random)() * total(t, word);
    for (const item of list) {
      r -= item.n;
      if (r < 0) return item.word;
    }
    return list[list.length - 1].word;
  }

  // Gap yasash: random — ehtimol bilan, aks holda doim eng ko'p uchragani
  function write(t, start, opts) {
    const o = opts || {};
    const words = [start];
    for (let k = 0; k < (o.maxLen || 5); k++) {
      const last = words[words.length - 1];
      const next = o.random ? sample(t, last, o.rng) : best(t, last);
      if (!next) break;
      words.push(next);
    }
    return words;
  }

  // Robot shu gapni yoza oladimi: hamma juftlik jadvalda bo'lsin (starts berilsa — gap boshi ham)
  function canWrite(t, words, starts) {
    if (starts && !starts.includes(words[0])) return false;
    for (let i = 1; i < words.length; i++) {
      const row = t[words[i - 1]];
      if (!row || !row[words[i]]) return false;
    }
    return true;
  }

  const randInt = (lo, hi, rng) => lo + Math.floor(rng() * (hi - lo + 1));
  const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

  function shuffle(arr, rng) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  // "{so'z} dan keyin eng ko'p qaysi so'z kelgan?" — javob yagona bo'lsin
  function makeBestTask(sentences, prev, rng) {
    rng = rng || Math.random;
    const t = table(sentences);
    const words = Object.keys(t).filter((w) => {
      const list = nextList(t, w);
      return list.length >= 2 && list[0].n > list[1].n;
    });
    for (;;) {
      const word = pick(words, rng);
      if (prev && prev.word === word && words.length > 1) continue;
      const list = nextList(t, word);
      const others = vocabulary(sentences).filter((w) => w !== word && !list.some((x) => x.word === w));
      const options = shuffle(list.map((x) => x.word).concat(others.length ? [pick(others, rng)] : []), rng);
      return { type: "best", word, options, answer: options.indexOf(list[0].word), counts: list };
    }
  }

  // "Qaysi gapni robot yoza oladi?" — uch gapdan bittasi jadvaldan yasaladi
  function makeSentenceTask(sentences, prev, rng) {
    rng = rng || Math.random;
    const t = table(sentences);
    const starts = starters(sentences);
    const vocab = vocabulary(sentences);
    for (;;) {
      const good = write(t, pick(starts, rng), { random: true, rng, maxLen: 2 });
      if (good.length !== 3) continue;
      if (prev && prev.type === "sentence" && prev.options[prev.answer].join(" ") === good.join(" ")) continue;
      const bad = [];
      for (let guard = 0; guard < 200 && bad.length < 2; guard++) {
        const candidate = [pick(starts, rng), pick(vocab, rng), pick(vocab, rng)];
        if (canWrite(t, candidate, starts)) continue;
        if (candidate.join(" ") === good.join(" ")) continue;
        if (bad.some((b) => b.join(" ") === candidate.join(" "))) continue;
        bad.push(candidate);
      }
      if (bad.length < 2) continue;
      const options = shuffle([good].concat(bad), rng);
      return { type: "sentence", options, answer: options.findIndex((s) => s.join(" ") === good.join(" ")) };
    }
  }

  // "{so'z} dan keyin nima kelishi mumkin?" — bittasi jadvalda bor
  function makeFollowTask(sentences, prev, rng) {
    rng = rng || Math.random;
    const t = table(sentences);
    const vocab = vocabulary(sentences);
    for (;;) {
      const word = pick(Object.keys(t), rng);
      if (prev && prev.type === "follow" && prev.word === word) continue;
      const list = nextList(t, word);
      const good = pick(list, rng).word;
      const others = vocab.filter((w) => w !== word && w !== good && !list.some((x) => x.word === w));
      if (others.length < 2) continue;
      const wrong = shuffle(others, rng).slice(0, 2);
      const options = shuffle([good].concat(wrong), rng);
      return { type: "follow", word, options, answer: options.indexOf(good) };
    }
  }

  // 3-bosqich mashqi: avval gap, keyin keyingi so'z, keyin tasodifiy
  function makeStage3Task(sentences, k, prev, rng) {
    rng = rng || Math.random;
    const useSentence = k === 0 ? true : k === 1 ? false : rng() < 0.5;
    return useSentence ? makeSentenceTask(sentences, prev, rng) : makeFollowTask(sentences, prev, rng);
  }

  const api = {
    BASE, EXTRA, ALL,
    table, nextList, best, total, starters, vocabulary, sample, write, canWrite,
    makeBestTask, makeSentenceTask, makeFollowTask, makeStage3Task,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.words = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
