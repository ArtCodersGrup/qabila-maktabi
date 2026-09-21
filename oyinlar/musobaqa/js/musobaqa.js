// Musobaqa holati (DIZAYN 2-bo'lim): navbat, shaxmat soati, 3 ta yurak, bir martalik o'tkazish,
// raund oxirigacha o'ynash va natija. Taymer yo'q — vaqtni ekran kodi tick(ms) bilan beradi.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const HEARTS = 3;
  const other = (side) => (side === "left" ? "right" : "left");

  // nextPair() → [boshlovchining savoli, ikkinchisining savoli] yoki null (savollar tugadi)
  // check(savol, javob) → bool
  function create({ seconds, starter, nextPair, check }) {
    const player = () => ({ time: seconds * 1000, hearts: HEARTS, skipUsed: false });
    const m = {
      players: { left: player(), right: player() },
      starter,
      turn: starter,
      round: 0,
      half: 0,
      pair: null,
      question: null,
      phase: "ask", // ask — savol, shown — javob ko'rsatilmoqda, over — tugadi
      waitingOut: null, // raund oxirini kutayotgan, yuragi tugagan o'yinchi
      history: [],
      result: null,
    };

    function finish(winner, reason) {
      m.phase = "over";
      m.result = { winner, loser: winner ? other(winner) : null, reason };
    }

    // Kim ko'proq narsaga ega: teng bo'lsa null
    function better(key) {
      const a = m.players.left[key];
      const b = m.players.right[key];
      return a === b ? null : a > b ? "left" : "right";
    }

    function newRound() {
      const pair = nextPair();
      if (!pair) {
        finish(better("hearts") || better("time"), "exhausted");
        return;
      }
      m.round++;
      m.half = 0;
      m.pair = pair;
      m.turn = starter;
      m.question = pair[0];
      m.phase = "ask";
    }

    function record(result, given) {
      m.history.push({ side: m.turn, round: m.round, question: m.question, given, result });
      m.phase = "shown";
    }

    // Vaqt o'tdi. true — shu tick musobaqani tugatdi.
    m.tick = (ms) => {
      if (m.phase !== "ask") return false;
      const p = m.players[m.turn];
      p.time = Math.max(0, p.time - ms);
      if (p.time > 0) return false;
      // Boshlovchi yuragi tugab, raund oxirini kutyapti — ikkalasi ham chiqdi, vaqti ko'p qolgan yutadi
      if (m.waitingOut) finish(better("time"), "both");
      else finish(other(m.turn), "time");
      return true;
    };

    // true/false — to'g'ri/xato; null — hozir javob qabul qilinmaydi
    m.answer = (value) => {
      if (m.phase !== "ask") return null;
      const ok = !!check(m.question, value);
      if (!ok) m.players[m.turn].hearts--;
      record(ok ? "correct" : "wrong", value);
      return ok;
    };

    m.skip = () => {
      const p = m.players[m.turn];
      if (m.phase !== "ask" || p.skipUsed) return false;
      p.skipUsed = true;
      record("skip", null);
      return true;
    };

    // Javob ko'rsatib bo'lingach: navbat raqibga yoki yangi raund, yoki natija
    m.next = () => {
      if (m.phase !== "shown") return;
      const cur = m.turn;
      const out = m.players[cur].hearts === 0;
      if (m.half === 0) {
        if (out) m.waitingOut = cur; // raund oxirigacha: ikkinchisi o'z savoliga javob beradi
        m.half = 1;
        m.turn = other(cur);
        m.question = m.pair[1];
        m.phase = "ask";
        return;
      }
      const firstOut = m.waitingOut !== null;
      if (out && firstOut) finish(better("time"), "both");
      else if (out) finish(other(cur), "hearts");
      else if (firstOut) finish(cur, "hearts");
      else newRound();
    };

    newRound();
    if (m.phase === "over") m.question = null;
    return m;
  }

  function stats(m, side) {
    const mine = m.history.filter((h) => h.side === side);
    const count = (r) => mine.filter((h) => h.result === r).length;
    return { correct: count("correct"), wrong: count("wrong"), skipped: count("skip") };
  }

  const api = { HEARTS, other, create, stats };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.musobaqa = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
