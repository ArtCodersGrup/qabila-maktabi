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

  // "Hozir {n} tosh qoldi — robot qaysi qutini ochadi?"
  function makeBoxTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const n = randInt(2, 7, rng);
      if (prev && prev.n === n) continue;
      const others = [1, 2, 3, 4, 5, 6, 7].filter((x) => x !== n);
      const options = shuffle([n].concat(shuffle(others, rng).slice(0, 2)), rng);
      return { type: "box", n, options, answer: options.indexOf(n) };
    }
  }

  // "Robot {rang} munchoq tortdi — nechta tosh oladi?"
  function makeBeadTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const move = pick([1, 2], rng);
      if (prev && prev.type === "bead" && prev.answer === move) continue;
      return { type: "bead", color: COLORS[move], answer: move, options: [1, 2] };
    }
  }

  // "Robot yutdi/yutqazdi — munchoqlarga nima bo'ladi?"
  function makeRewardTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const won = rng() < 0.5;
      if (prev && prev.type === "reward" && prev.won === won) continue;
      const options = shuffle(["qoʻshiladi", "olinadi", "oʻzgarmaydi"], rng);
      return { type: "reward", won, options, answer: options.indexOf(won ? "qoʻshiladi" : "olinadi") };
    }
  }

  // "Yutqazdi. {n} li qutida {rang} munchoq tortgan edi — qaysisi olinadi?"
  function makeUsedTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const n = randInt(2, 7, rng);
      const color = pick(["kok", "sariq"], rng);
      if (prev && prev.type === "used" && prev.n === n && prev.color === color) continue;
      const options = shuffle(["kok", "sariq", "ikkalasi"], rng);
      return { type: "used", n, color, options, answer: options.indexOf(color) };
    }
  }

  // "Qutida ko'k {a} ta, sariq {b} ta — robot ko'pincha nima qiladi?"
  function makeReadTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const blue = randInt(1, 8, rng);
      const yellow = randInt(1, 8, rng);
      if (blue === yellow) continue;
      if (prev && prev.type === "read" && prev.blue === blue && prev.yellow === yellow) continue;
      return { type: "read", blue, yellow, answer: blue > yellow ? 1 : 2, options: [1, 2] };
    }
  }

  // "{n} tosh qolganda nechta olsa yutadi?"
  function makeStrategyTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const n = pick([2, 4, 5, 7], rng);
      if (prev && prev.type === "strategy" && prev.n === n) continue;
      return { type: "strategy", n, answer: winningMove(n), options: [1, 2] };
    }
  }

  const makeStage1Task = (k, prev, rng) => {
    rng = rng || Math.random;
    const useBox = k === 0 ? true : k === 1 ? false : rng() < 0.5;
    return useBox ? makeBoxTask(prev, rng) : makeBeadTask(prev, rng);
  };

  const makeStage2Task = (k, prev, rng) => {
    rng = rng || Math.random;
    const useReward = k === 0 ? true : k === 1 ? false : rng() < 0.5;
    return useReward ? makeRewardTask(prev, rng) : makeUsedTask(prev, rng);
  };

  const makeStage3Task = (k, prev, rng) => {
    rng = rng || Math.random;
    const useRead = k === 0 ? true : k === 1 ? false : rng() < 0.5;
    return useRead ? makeReadTask(prev, rng) : makeStrategyTask(prev, rng);
  };

  const api = {
    START, MOVES, BEADS, COLORS,
    legalMoves, isWin, winningMove, newBoxes, pickMove, randomOpponent, smartOpponent, playGame, reward, trainGames,
    makeBoxTask, makeBeadTask, makeRewardTask, makeUsedTask, makeReadTask, makeStrategyTask,
    makeStage1Task, makeStage2Task, makeStage3Task,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.boxes = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
