// Sehrli qutilar — sof hisob: toshlar o'yini, munchoqli qutilar, mukofot, o'qitish, topshiriqlar.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const START = 7;   // boshlang'ich toshlar
  const MOVES = [1, 2];
  const BEADS = 2;   // har qutidagi boshlang'ich munchoqlar
  const COLORS = { 1: "kok", 2: "sariq" }; // 1 ta ol — ko'k, 2 ta ol — sariq

  const legalMoves = (n) => MOVES.filter((m) => m <= n);
  const isWin = (n, move) => n - move === 0;

  // Yutuqli yurish: raqibga 3 ga karrali qoldirish (3 ga karrali holatda — yo'q)
  const winningMove = (n) => (n % 3 === 0 ? null : n % 3);

  // Har holat uchun bitta quti, har yurish uchun teng munchoq
  function newBoxes(start) {
    const boxes = {};
    for (let n = 1; n <= (start || START); n++) {
      boxes[n] = {};
      for (const move of legalMoves(n)) boxes[n][move] = BEADS;
    }
    return boxes;
  }

  // Munchoqlar soniga mos tasodifiy tanlov
  function pickMove(boxes, n, rng) {
    const box = boxes[n] || {};
    const moves = Object.keys(box).map(Number).filter((m) => box[m] > 0);
    if (!moves.length) return legalMoves(n)[0];
    const total = moves.reduce((sum, m) => sum + box[m], 0);
    let r = (rng || Math.random)() * total;
    for (const move of moves) {
      r -= box[move];
      if (r < 0) return move;
    }
    return moves[moves.length - 1];
  }

  const randomOpponent = (n, rng) => {
    const moves = legalMoves(n);
    return moves[Math.floor((rng || Math.random)() * moves.length)];
  };

  // Tajribali murabbiy: yutuqli yurishni biladi (robotning xatosi darrov jazolanadi)
  const smartOpponent = (n, rng) => winningMove(n) || randomOpponent(n, rng);

  // Bitta o'yin: robot birinchi yuradi. history — faqat robotning yurishlari.
  function playGame(boxes, rng, opponent) {
    let n = START;
    const history = [];
    let robotTurn = true;
    for (;;) {
      if (robotTurn) {
        const move = pickMove(boxes, n, rng);
        history.push({ n, move });
        n -= move;
        if (n === 0) return { history, won: true };
      } else {
        n -= (opponent || randomOpponent)(n, rng);
        if (n === 0) return { history, won: false };
      }
      robotTurn = !robotTurn;
    }
  }

  // Mukofot: yutsa +1 munchoq, yutqazsa −1 (kamida 1 qoladi)
  function reward(boxes, history, won) {
    for (const step of history) {
      const box = boxes[step.n];
      if (!box) continue;
      if (won) box[step.move] += 1;
      else box[step.move] = Math.max(1, box[step.move] - 1);
    }
    return boxes;
  }

  // N ta o'yin: har birida mukofot beriladi. Natija — yutuqlar ro'yxati.
  function trainGames(boxes, rounds, rng, opponent) {
    const results = [];
    for (let k = 0; k < rounds; k++) {
      const game = playGame(boxes, rng, opponent);
      reward(boxes, game.history, game.won);
      results.push(game.won);
    }
    return results;
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

  // ---------- Mashq generatorlari (2026-10-02: qiyinlik zinasi, hamma savolda 4 variant) ----------
  const tierOf = (tier) => Math.max(0, Math.min(2, tier || 0));
  // Mashqda stoldagi toshlar soni zina bo'yicha kattalashadi (ko'rsatish qismida START = 7 qoladi)
  const STONES = [[2, 7], [3, 9], [5, 12]];
  const START_RANGE = [5, 12];

  // To'g'ri son + chalg'ituvchilar (avval nomzodlar, keyin qo'shni sonlar) — jami 4 ta, takrorsiz, min dan kichik emas
  function numberOptions(answer, candidates, rng, min) {
    const lo = min === undefined ? 0 : min;
    const out = [answer];
    const add = (v) => { if (out.length < 4 && v >= lo && !out.includes(v)) out.push(v); };
    candidates.forEach(add);
    for (let d = 1; out.length < 4; d++) {
      add(answer + d);
      add(answer - d);
    }
    return shuffle(out, rng);
  }

  // "Hozir {n} tosh qoldi — robot qaysi qutini ochadi?" — 4 variant.
  // tier 0: boshqa variantlar tasodifiy; tier 1, 2: qo'shni sonlar (aniq sanash kerak), toshlar 9 / 12 tagacha.
  function makeBoxTask(prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    const [lo, hi] = STONES[t];
    for (;;) {
      const n = randInt(Math.max(2, lo), hi, rng);
      if (prev && prev.type === "box" && prev.n === n) continue;
      let options;
      if (t === 0) {
        const others = [];
        for (let x = 1; x <= hi; x++) if (x !== n) others.push(x);
        options = shuffle([n].concat(shuffle(others, rng).slice(0, 3)), rng);
      } else {
        options = numberOptions(n, shuffle([n - 1, n + 1, n - 2, n + 2], rng), rng, 1);
      }
      return { type: "box", n, options, answer: options.indexOf(n), tier: t };
    }
  }

  // "Stolda {n} ta tosh. Robot {rang} munchoq tortdi. Stolda nechta tosh qoladi?" — ikki qadam:
  // rang → nechta oladi, keyin ayirish. 4 variant.
  function makeLeftTask(prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    const [lo, hi] = STONES[t];
    for (;;) {
      const n = randInt(Math.max(3, lo), hi, rng);
      const move = pick(MOVES, rng);
      if (prev && prev.type === "left" && prev.n === n && prev.move === move) continue;
      const answer = n - move;
      const options = numberOptions(answer, [n - (3 - move), n, n - 3], rng, 0);
      return { type: "left", n, move, color: COLORS[move], options, answer: options.indexOf(answer), left: answer, tier: t };
    }
  }

  // "Robot {n} li qutidan {rang} tortdi va yutdi / yutqazdi. Endi qutida nechta {rang} munchoq bo'ladi?"
  // ask "pulled" — tortilgan rang (yutsa +1, yutqazsa −1, lekin kamida 1); "other" — boshqa rang (o'zgarmaydi).
  // Munchoqlar soni: tier 0 — 2..5, tier 1 — 1..6, tier 2 — 1..8 (1 ta qolgan holat ham chiqadi).
  const BEAD_RANGE = [[2, 5], [1, 6], [1, 8]];
  function makeCountTask(prev, rng, tier, ask) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    const [lo, hi] = BEAD_RANGE[t];
    for (;;) {
      const blue = randInt(lo, hi, rng);
      const yellow = randInt(lo, hi, rng);
      if (blue === yellow) continue; // ikki rang soni har xil — "boshqa rang" bilan chalkashmasin
      const move = pick(MOVES, rng);
      const won = rng() < 0.5;
      const what = ask || (t >= 1 && rng() < 0.4 ? "other" : "pulled");
      const n = randInt(2, START, rng);
      if (prev && prev.type === "count" && prev.blue === blue && prev.yellow === yellow && prev.move === move && prev.won === won) continue;
      const before = { 1: blue, 2: yellow };
      const after = { 1: blue, 2: yellow };
      after[move] = won ? before[move] + 1 : Math.max(1, before[move] - 1);
      const askMove = what === "pulled" ? move : 3 - move;
      const value = after[askMove];
      const options = numberOptions(value, [before[askMove] + 1, before[askMove] - 1, before[askMove], before[3 - askMove]], rng, 0);
      return {
        type: "count", n, blue, yellow, move, color: COLORS[move], won, ask: what,
        askMove, askColor: COLORS[askMove], after, options, answer: options.indexOf(value), value, tier: t,
        kept: after[move] === before[move], // yutqazdi, lekin qutida 1 ta edi — olinmaydi
      };
    }
  }

  // "Yutqazdi. {n} li qutida {rang} munchoq tortgan edi — qaysisi olinadi?" — 4 variant
  function makeUsedTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const n = randInt(2, 7, rng);
      const color = pick(["kok", "sariq"], rng);
      if (prev && prev.type === "used" && prev.n === n && prev.color === color) continue;
      const options = shuffle(["kok", "sariq", "ikkalasi", "hech"], rng);
      return { type: "used", n, color, options, answer: options.indexOf(color) };
    }
  }

  // "Qaysi qutida robot {1 | 2} ta olishi eng ehtimoli katta?" — 4 ta quti, munchoqlar ulushi solishtiriladi.
  // tier 0: to'g'ri qutida kerakli rang soni ham eng ko'p; tier 1, 2: tuzoq — boshqa qutida shu rang ko'proq,
  // lekin ulushi kichikroq (son emas, ulush muhim).
  function makeRatioTask(prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    const share = (b) => b.target / (b.target + b.other);
    for (;;) {
      const move = pick(MOVES, rng);
      const best = { target: randInt(3, t === 0 ? 6 : 5, rng), other: randInt(1, 2, rng) };
      if (share(best) < 0.66) continue;
      const others = [];
      for (let guard = 0; guard < 200 && others.length < 3; guard++) {
        const o = { target: randInt(1, 7, rng), other: randInt(1, 7, rng) };
        if (share(o) > 0.55 || share(best) - share(o) < 0.15) continue;
        if (t === 0 && o.target >= best.target) continue;
        if (others.some((x) => x.target === o.target && x.other === o.other)) continue;
        others.push(o);
      }
      if (others.length < 3) continue;
      // tuzoq: bitta chalg'ituvchida kerakli rang soni to'g'ri qutidagidan kam emas
      if (t >= 1 && !others.some((o) => o.target >= best.target)) continue;
      const ns = shuffle([2, 3, 4, 5, 6, 7], rng).slice(0, 4).sort((a, b) => b - a);
      const list = shuffle([best].concat(others), rng);
      const options = list.map((b, i) => ({
        n: ns[i],
        blue: move === 1 ? b.target : b.other,
        yellow: move === 1 ? b.other : b.target,
      }));
      const answer = list.indexOf(best);
      if (prev && prev.type === "ratio" && prev.move === move && prev.options[prev.answer].blue === options[answer].blue
        && prev.options[prev.answer].yellow === options[answer].yellow) continue;
      return { type: "ratio", move, color: COLORS[move], options, answer, tier: t };
    }
  }

  // "{n} tosh qolganda nechta olsa yutadi?" — ikki qadam: yurish (1 / 2) va "nega?" (4 ta sabab).
  // Ikkalasi to'g'ri bo'lsagina hisoblanadi. Toshlar: tier 0 — 2..7, tier 1 — 4..10, tier 2 — 7..11.
  const STRATEGY_N = [[2, 4, 5, 7], [4, 5, 7, 8, 10], [7, 8, 10, 11]];
  function makeStrategyTask(prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    for (;;) {
      const n = pick(STRATEGY_N[t], rng);
      if (prev && prev.type === "strategy" && prev.n === n) continue;
      const move = winningMove(n);
      const whys = shuffle(["good", "bad", "more", "fast"], rng);
      return { type: "strategy", n, answer: move, options: [1, 2], left: n - move, wrongLeft: n - (3 - move), whys, whyIndex: whys.indexOf("good"), tier: t };
    }
  }

  // "Robotni yut!" — haqiqiy o'yin: bola birinchi yuradi, robot xatosiz o'ynaydi. Yutish — to'g'ri javob.
  // Toshlar soni 3 ga karrali emas (aks holda birinchi yurgan yuta olmaydi): tier 0 — 4, 5, 7; tier 1 — 5, 7, 8; tier 2 — 8, 10, 11.
  const BEAT_N = [[4, 5, 7], [5, 7, 8], [8, 10, 11]];
  function makeBeatTask(prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    for (;;) {
      const n = pick(BEAT_N[t], rng);
      if (prev && prev.type === "beat" && prev.n === n) continue;
      return { type: "beat", n, first: winningMove(n), tier: t };
    }
  }

  // "Robotni yut" o'yinini hisobda o'ynab ko'rish: childMove(n) — bolaning yurishi. true — bola yutdi.
  function perfectGame(start, childMove, rng) {
    let n = start;
    for (;;) {
      n -= childMove(n);
      if (n <= 0) return true;
      n -= smartOpponent(n, rng);
      if (n <= 0) return false;
    }
  }

  const makeStage1Task = (k, prev, rng, tier) => {
    rng = rng || Math.random;
    const useBox = k === 0 ? true : k === 1 ? false : rng() < 0.5;
    return useBox ? makeBoxTask(prev, rng, tier) : makeLeftTask(prev, rng, tier);
  };

  const makeStage2Task = (k, prev, rng, tier) => {
    rng = rng || Math.random;
    if (k === 0) return makeCountTask(prev, rng, tier, "pulled");
    if (k === 1) return makeUsedTask(prev, rng);
    return makeCountTask(prev, rng, tier);
  };

  // 3-bosqich tartibi: ulush → strategiya → robotni yut → strategiya → robotni yut → robotni yut (yarmi — haqiqiy o'yin)
  const STAGE3_ORDER = ["ratio", "strategy", "beat", "strategy", "beat", "beat"];
  const makeStage3Task = (k, prev, rng, tier) => {
    rng = rng || Math.random;
    const type = STAGE3_ORDER[k % STAGE3_ORDER.length];
    if (type === "ratio") return makeRatioTask(prev, rng, tier);
    if (type === "strategy") return makeStrategyTask(prev, rng, tier);
    return makeBeatTask(prev, rng, tier);
  };

  const api = {
    START, MOVES, BEADS, COLORS, STONES, START_RANGE, BEAD_RANGE, STRATEGY_N, BEAT_N, STAGE3_ORDER,
    legalMoves, isWin, winningMove, newBoxes, pickMove, randomOpponent, smartOpponent, playGame, reward, trainGames,
    numberOptions, makeBoxTask, makeLeftTask, makeCountTask, makeUsedTask, makeRatioTask, makeStrategyTask,
    makeBeatTask, perfectGame, makeStage1Task, makeStage2Task, makeStage3Task,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.boxes = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
