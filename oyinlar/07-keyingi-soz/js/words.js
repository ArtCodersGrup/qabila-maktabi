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
  // Mashq uchun gaplar banki (2026-10-02): 20 ta gap. Har misolda undan 7–9 tasi tasodifiy olinadi —
  // jadval har safar boshqacha chiqadi, yodlab bo'lmaydi. Ko'rsatish qismi BASE / EXTRA bilan qoladi.
  const BANK = ALL.concat([
    ["bola", "baliq", "tutdi"],
    ["ovchi", "baliq", "tutdi"],
    ["ovchi", "baliq", "koʻrdi"],
    ["qabila", "baliq", "yedi"],
    ["bola", "non", "yedi"],
    ["qabila", "non", "yedi"],
    ["ona", "non", "yopdi"],
    ["ona", "olov", "yoqdi"],
    ["ona", "suv", "ichdi"],
  ]);
  const CORPUS_SIZE = [7, 8, 9]; // qiyinlik zinasi bo'yicha gaplar soni

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

  const tierOf = (tier) => Math.max(0, Math.min(2, tier || 0));
  const sameSentence = (a, b) => a.join(" ") === b.join(" ");

  // "Eng ko'p kelgan so'z" yagona bo'lgan so'zlar (kamida 2 xil davomi bor)
  function clearWords(t) {
    return Object.keys(t).filter((w) => {
      const list = nextList(t, w);
      return list.length >= 2 && list[0].n > list[1].n;
    });
  }

  // Bankdan tasodifiy matn: zina bo'yicha 7 / 8 / 9 ta gap. Kamida 2 ta so'zda "eng ko'p" yagona,
  // kamida 3 xil gap boshi bo'ladi — savollar xilma-xil chiqishi uchun.
  function makeCorpus(rng, tier) {
    rng = rng || Math.random;
    for (;;) {
      const sentences = shuffle(BANK, rng).slice(0, CORPUS_SIZE[tierOf(tier)]);
      if (clearWords(table(sentences)).length < 2 || starters(sentences).length < 3) continue;
      return sentences;
    }
  }

  // to'g'ri javob + chalg'ituvchilar → 4 ta variant (aralashtirilgan)
  function fourOptions(good, others, extras, rng) {
    const picked = shuffle(others, rng).slice(0, 3);
    for (const w of shuffle(extras, rng)) {
      if (picked.length >= 3) break;
      if (w !== good && !picked.includes(w)) picked.push(w);
    }
    return shuffle([good].concat(picked), rng);
  }

  // "{so'z} dan keyin eng ko'p qaysi so'z kelgan?" — javob yagona, 4 variant (davomlari + chalg'ituvchilar).
  // sentences berilmasa — bankdan tasodifiy matn (har misolda yangi). tier 1, 2: so'zning kamida 3 xil davomi bor.
  function makeBestTask(sentences, prev, rng, tier) {
    rng = rng || Math.random;
    for (;;) {
      const corpus = sentences || makeCorpus(rng, tier);
      const t = table(corpus);
      let words = clearWords(t);
      if (!sentences && tierOf(tier) >= 1) words = words.filter((w) => nextList(t, w).length >= 3);
      if (!words.length) continue;
      const word = pick(words, rng);
      if (prev && prev.word === word && (words.length > 1 || !sentences)) continue;
      const list = nextList(t, word);
      const good = list[0].word;
      const extras = vocabulary(corpus).filter((w) => w !== word && !list.some((x) => x.word === w));
      const options = fourOptions(good, list.slice(1).map((x) => x.word), extras, rng);
      return { type: "best", sentences: corpus, word, options, answer: options.indexOf(good), counts: list, tier: tierOf(tier) };
    }
  }

  // 2-bosqich: "Robot {so'z} dan boshlab har safar eng ko'p uchraganini tanlasa, qaysi gap chiqadi?" — 4 ta gap.
  // Bola jadvalda ikki qadam yuradi: boshlovchi so'z qatori → eng ko'pi → o'sha so'zning qatori → eng ko'pi.
  // Chalg'ituvchilar — jadvalda bor, lekin "eng ko'pi" bo'lmagan yo'llar (yetmasa — jadvalda yo'q gaplar).
  function makeGreedyTask(sentences, prev, rng, tier) {
    rng = rng || Math.random;
    for (let attempt = 0; ; attempt++) {
      const corpus = sentences || makeCorpus(rng, tier);
      const t = table(corpus);
      const start = pick(starters(corpus), rng);
      const first = nextList(t, start);
      if (first.length < 2 || first[0].n === first[1].n) continue;
      const second = nextList(t, first[0].word);
      if (!second.length || (second.length > 1 && second[0].n === second[1].n)) continue;
      const good = [start, first[0].word, second[0].word];
      // Qat'iy matnda yagona to'g'ri gap bo'lishi mumkin — shunda takrorga yo'l qo'yiladi (cheksiz aylanmasin)
      if (prev && prev.type === "greedy" && sameSentence(prev.options[prev.answer], good) && attempt < 200) continue;
      const paths = [];
      for (const a of first) {
        for (const b of nextList(t, a.word)) {
          const path = [start, a.word, b.word];
          if (!sameSentence(path, good)) paths.push(path);
        }
      }
      const bad = shuffle(paths, rng).slice(0, 3);
      const vocab = vocabulary(corpus);
      // Yo'llar yetmasa: boshi jadvalda bor, oxiri yo'q gaplar ("deyarli to'g'ri" ko'rinadi)
      for (let guard = 0; guard < 300 && bad.length < 3; guard++) {
        const candidate = [start, pick(first, rng).word, pick(vocab, rng)];
        if (canWrite(t, candidate) || candidate[2] === candidate[1] || candidate[2] === start) continue;
        if (bad.some((b) => sameSentence(b, candidate))) continue;
        bad.push(candidate);
      }
      if (bad.length < 3) continue;
      const options = shuffle([good].concat(bad), rng);
      const rows = [start];
      options.forEach((s) => { if (t[s[1]] && !rows.includes(s[1])) rows.push(s[1]); });
      return {
        type: "greedy", sentences: corpus, start, options, rows,
        answer: options.findIndex((s) => sameSentence(s, good)), tier: tierOf(tier),
      };
    }
  }

  // "Qaysi gapni robot yoza oladi?" — to'rt gapdan bittasi jadvaldan yasaladi.
  // tier 0: noto'g'ri gaplar tasodifiy; tier 1, 2: "deyarli to'g'ri" — bitta juftligi jadvalda bor, ikkinchisi yo'q.
  function makeSentenceTask(sentences, prev, rng, tier) {
    rng = rng || Math.random;
    const near = tierOf(tier) >= 1;
    for (;;) {
      const corpus = sentences || makeCorpus(rng, tier);
      const t = table(corpus);
      const starts = starters(corpus);
      const vocab = vocabulary(corpus);
      const good = write(t, pick(starts, rng), { random: true, rng, maxLen: 2 });
      if (good.length !== 3) continue;
      if (prev && prev.type === "sentence" && sameSentence(prev.options[prev.answer], good)) continue;
      const bad = [];
      for (let guard = 0; guard < 400 && bad.length < 3; guard++) {
        const candidate = [pick(starts, rng), pick(vocab, rng), pick(vocab, rng)];
        if (canWrite(t, candidate, starts)) continue;
        const firstOk = canWrite(t, candidate.slice(0, 2));
        const secondOk = canWrite(t, candidate.slice(1));
        if (near && firstOk === secondOk) continue; // aynan bitta juftlik jadvalda bo'lsin
        if (bad.some((b) => sameSentence(b, candidate))) continue;
        bad.push(candidate);
      }
      if (bad.length < 3) continue;
      const options = shuffle([good].concat(bad), rng);
      return {
        type: "sentence", sentences: corpus, options,
        answer: options.findIndex((s) => sameSentence(s, good)), tier: tierOf(tier),
      };
    }
  }

  // "{so'z} dan keyin nima kelishi mumkin?" — 4 variantdan bittasi jadvalda bor
  function makeFollowTask(sentences, prev, rng, tier) {
    rng = rng || Math.random;
    for (;;) {
      const corpus = sentences || makeCorpus(rng, tier);
      const t = table(corpus);
      const vocab = vocabulary(corpus);
      const word = pick(Object.keys(t), rng);
      if (prev && prev.type === "follow" && prev.word === word) continue;
      const list = nextList(t, word);
      const good = pick(list, rng).word;
      const others = vocab.filter((w) => w !== word && w !== good && !list.some((x) => x.word === w));
      if (others.length < 3) continue;
      const options = shuffle([good].concat(shuffle(others, rng).slice(0, 3)), rng);
      return { type: "follow", sentences: corpus, word, options, answer: options.indexOf(good), tier: tierOf(tier) };
    }
  }

  // 3-bosqich mashqi: avval gap, keyin keyingi so'z, keyin tasodifiy
  function makeStage3Task(sentences, k, prev, rng, tier) {
    rng = rng || Math.random;
    const useSentence = k === 0 ? true : k === 1 ? false : rng() < 0.5;
    return useSentence ? makeSentenceTask(sentences, prev, rng, tier) : makeFollowTask(sentences, prev, rng, tier);
  }

  const api = {
    BASE, EXTRA, ALL, BANK, CORPUS_SIZE,
    table, nextList, best, total, starters, vocabulary, sample, write, canWrite, clearWords, makeCorpus,
    makeBestTask, makeGreedyTask, makeSentenceTask, makeFollowTask, makeStage3Task,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.words = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
