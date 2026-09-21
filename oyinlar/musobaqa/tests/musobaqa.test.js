// Musobaqa holati: navbat, soat, yuraklar, o'tkazish, raund oxiri va natija (DIZAYN 2-bo'lim).
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const win = {};
loadScript(path.join(__dirname, "../js/musobaqa.js"), win);
const M = win.QK.musobaqa;

// Soxta savollar: har raundda juft, javobi "ok"; limit — nechta raunddan keyin tugaydi
function makeMatch({ seconds = 60, starter = "left", limit = Infinity } = {}) {
  let n = 0;
  const nextPair = () => (n >= limit ? null : (n++, [{ key: `r${n}a`, answer: "ok" }, { key: `r${n}b`, answer: "ok" }]));
  return M.create({ seconds, starter, nextPair, check: (q, v) => v === q.answer });
}

// Joriy o'yinchi javob beradi va keyingisiga o'tiladi
const right = (m) => { m.answer("ok"); m.next(); };
const wrong = (m) => { m.answer("xato"); m.next(); };

test("boshlanish: boshlovchi navbatda, 3 yurak, to'liq vaqt, 1-raund", () => {
  const m = makeMatch({ starter: "right" });
  assert.equal(m.turn, "right");
  assert.equal(m.phase, "ask");
  assert.equal(m.round, 1);
  assert.equal(m.half, 0);
  assert.equal(m.question.key, "r1a");
  for (const side of ["left", "right"]) {
    assert.equal(m.players[side].hearts, 3);
    assert.equal(m.players[side].time, 60000);
    assert.equal(m.players[side].skipUsed, false);
  }
});

test("soat faqat navbatdagi o'yinchida va faqat savol paytida yuradi", () => {
  const m = makeMatch();
  m.tick(1500);
  assert.equal(m.players.left.time, 58500);
  assert.equal(m.players.right.time, 60000);
  m.answer("ok");
  m.tick(5000); // to'g'ri javob ko'rsatilmoqda — soat to'xtagan
  assert.equal(m.players.left.time, 58500);
  m.next();
  m.tick(1000);
  assert.equal(m.players.right.time, 59000);
  assert.equal(m.players.left.time, 58500);
});

test("raund: juft savol navbat bilan, keyin yangi raund boshlovchidan", () => {
  const m = makeMatch();
  assert.equal(m.question.key, "r1a");
  right(m);
  assert.equal(m.turn, "right");
  assert.equal(m.half, 1);
  assert.equal(m.question.key, "r1b");
  right(m);
  assert.equal(m.turn, "left");
  assert.equal(m.round, 2);
  assert.equal(m.half, 0);
  assert.equal(m.question.key, "r2a");
});

test("xato javob bitta yurakni oladi, to'g'risi olmaydi; tarix yoziladi", () => {
  const m = makeMatch();
  assert.equal(m.answer("xato"), false);
  assert.equal(m.players.left.hearts, 2);
  m.next();
  assert.equal(m.answer("ok"), true);
  assert.equal(m.players.right.hearts, 3);
  assert.deepEqual(m.history.map((h) => [h.side, h.result, h.given]), [["left", "wrong", "xato"], ["right", "correct", "ok"]]);
  assert.equal(m.history[0].question.key, "r1a");
});

test("o'tkazish: bir marta, yuraksiz, navbat raqibga", () => {
  const m = makeMatch();
  assert.equal(m.skip(), true);
  assert.equal(m.players.left.hearts, 3);
  assert.equal(m.players.left.skipUsed, true);
  assert.equal(m.phase, "shown");
  m.next();
  assert.equal(m.turn, "right");
  right(m);
  assert.equal(m.skip(), false, "ikkinchi marta o'tkazib bo'lmaydi");
  assert.equal(m.phase, "ask");
  assert.equal(m.history[0].result, "skip");
});

test("vaqti tugagan darhol yutqazadi", () => {
  const m = makeMatch({ seconds: 10 });
  assert.equal(m.tick(9999), false);
  assert.equal(m.tick(5), true);
  assert.equal(m.players.left.time, 0);
  assert.equal(m.phase, "over");
  assert.deepEqual(m.result, { winner: "right", loser: "left", reason: "time" });
  assert.equal(m.tick(1000), false, "tugagandan keyin soat yurmaydi");
});

test("ikkinchi o'yinchining yuragi tugasa — darhol yutqazadi", () => {
  const m = makeMatch();
  for (let k = 0; k < 3; k++) { right(m); wrong(m); }
  assert.equal(m.phase, "over");
  assert.deepEqual(m.result, { winner: "left", loser: "right", reason: "hearts" });
});

test("boshlovchining yuragi tugasa — raund oxirigacha: ikkinchisi javob beradi", () => {
  const m = makeMatch();
  for (let k = 0; k < 2; k++) { wrong(m); right(m); }
  wrong(m); // chap: 0 yurak
  assert.equal(m.phase, "ask");
  assert.equal(m.turn, "right");
  assert.equal(m.waitingOut, "left");
  right(m);
  assert.deepEqual(m.result, { winner: "right", loser: "left", reason: "hearts" });
});

test("raund oxiri: ikkinchisi xato qilsa ham, yuragi qolgan bo'lsa yutadi", () => {
  const m = makeMatch();
  for (let k = 0; k < 2; k++) { wrong(m); right(m); }
  wrong(m);
  wrong(m); // o'ng: 2 yurak qoldi
  assert.deepEqual(m.result, { winner: "right", loser: "left", reason: "hearts" });
});

test("ikkalasining ham yuragi tugasa — vaqti ko'p qolgan yutadi", () => {
  const m = makeMatch();
  for (let k = 0; k < 2; k++) { m.tick(1000); wrong(m); m.tick(3000); wrong(m); }
  m.tick(1000);
  wrong(m);
  m.tick(3000);
  wrong(m);
  assert.equal(m.result.reason, "both");
  assert.equal(m.result.winner, "left"); // chap 3 s, o'ng 9 s sarfladi
  assert.equal(m.result.loser, "right");
});

test("boshlovchi chiqqach, ikkinchisining vaqti tugasa — boshlovchi yutadi (vaqti ko'p)", () => {
  const m = makeMatch({ seconds: 20 });
  for (let k = 0; k < 3; k++) { wrong(m); if (k < 2) right(m); }
  assert.equal(m.turn, "right");
  assert.equal(m.tick(20000), true);
  assert.deepEqual(m.result, { winner: "left", loser: "right", reason: "both" });
});

test("ikkalasi chiqib, vaqt teng — durang", () => {
  const m = makeMatch();
  for (let k = 0; k < 3; k++) { wrong(m); wrong(m); }
  assert.deepEqual(m.result, { winner: null, loser: null, reason: "both" });
});

test("savollar tugasa: yuragi ko'p qolgan, keyin vaqti ko'p qolgan yutadi", () => {
  let m = makeMatch({ limit: 1 });
  right(m);
  wrong(m);
  assert.deepEqual(m.result, { winner: "left", loser: "right", reason: "exhausted" });

  m = makeMatch({ limit: 1 });
  m.tick(5000);
  right(m);
  m.tick(1000);
  right(m);
  assert.deepEqual(m.result, { winner: "right", loser: "left", reason: "exhausted" });

  m = makeMatch({ limit: 1 });
  right(m);
  right(m);
  assert.deepEqual(m.result, { winner: null, loser: null, reason: "exhausted" });
});

test("savol bo'lmasa, musobaqa darhol tugaydi (durang)", () => {
  const m = makeMatch({ limit: 0 });
  assert.equal(m.phase, "over");
  assert.equal(m.result.reason, "exhausted");
  assert.equal(m.question, null);
});

test("noto'g'ri paytdagi amallar e'tiborsiz qoldiriladi", () => {
  const m = makeMatch();
  m.next(); // savol paytida "keyingi" yo'q
  assert.equal(m.phase, "ask");
  assert.equal(m.question.key, "r1a");
  m.answer("ok");
  assert.equal(m.answer("xato"), null, "ko'rsatish paytida ikkinchi javob yo'q");
  assert.equal(m.skip(), false);
  assert.equal(m.players.left.hearts, 3);
  assert.equal(m.history.length, 1);
});

test("statistika: to'g'ri, xato, o'tkazilgan", () => {
  const m = makeMatch();
  right(m);
  wrong(m);
  m.skip();
  m.next();
  right(m);
  assert.deepEqual(M.stats(m, "left"), { correct: 1, wrong: 0, skipped: 1 });
  assert.deepEqual(M.stats(m, "right"), { correct: 1, wrong: 1, skipped: 0 });
});
