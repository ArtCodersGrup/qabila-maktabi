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
// Butun raund: res — har tomon to'g'ri (1) yoki xato (0) javob beradi; ms — har tomon qancha vaqt o'ylaydi
function round(m, res, ms) {
  for (let k = 0; k < 2 && m.phase === "ask"; k++) {
    if (ms) m.tick(ms[m.turn]);
    if (res[m.turn]) right(m);
    else wrong(m);
  }
}

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

test("raund: juft savol navbat bilan; raund boshlovchisi almashadi (O'ng, Chap | Chap, O'ng | …)", () => {
  const m = makeMatch({ starter: "right" });
  assert.equal(m.question.key, "r1a");
  right(m);
  assert.equal(m.turn, "left");
  assert.equal(m.half, 1);
  assert.equal(m.question.key, "r1b");
  right(m);
  assert.equal(m.round, 2);
  assert.equal(m.half, 0);
  assert.equal(m.turn, "left", "2-raundni chap boshlaydi");
  assert.equal(m.question.key, "r2a");
  right(m);
  assert.equal(m.turn, "right");
  right(m);
  assert.equal(m.round, 3);
  assert.equal(m.turn, "right", "3-raundni yana o'ng boshlaydi");
  const order = m.history.map((h) => h.side);
  assert.deepEqual(order, ["right", "left", "left", "right"]);
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
  assert.equal(m.turn, "right", "2-raundni o'ng boshlaydi");
  right(m);
  assert.equal(m.turn, "left");
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
  // Vaqt tugagan savol natija ro'yxatiga tushadi (statistikaga emas)
  assert.deepEqual(m.history.map((h) => [h.side, h.result, h.question.key]), [["left", "time", "r1a"]]);
  assert.deepEqual(M.stats(m, "left"), { correct: 0, wrong: 0, skipped: 0 });
});

test("ikkinchi o'yinchining yuragi tugasa — darhol yutqazadi", () => {
  const m = makeMatch();
  for (let k = 0; k < 3; k++) round(m, { left: 1, right: 0 });
  assert.equal(m.round, 3);
  assert.equal(m.phase, "over", "3-raundda o'ng ikkinchi bo'lib oxirgi yuragini yo'qotdi");
  assert.deepEqual(m.result, { winner: "left", loser: "right", reason: "hearts" });
});

test("boshlovchining yuragi tugasa — raund oxirigacha: ikkinchisi javob beradi", () => {
  const m = makeMatch();
  for (let k = 0; k < 2; k++) round(m, { left: 0, right: 1 });
  assert.equal(m.turn, "left", "3-raundni chap boshlaydi");
  wrong(m); // chap: 0 yurak
  assert.equal(m.phase, "ask");
  assert.equal(m.turn, "right");
  assert.equal(m.waitingOut, "left");
  right(m);
  assert.deepEqual(m.result, { winner: "right", loser: "left", reason: "hearts" });
});

test("raund oxiri: ikkinchisi xato qilsa ham, yuragi qolgan bo'lsa yutadi", () => {
  const m = makeMatch();
  for (let k = 0; k < 2; k++) round(m, { left: 0, right: 1 });
  wrong(m);
  wrong(m); // o'ng: 2 yurak qoldi
  assert.deepEqual(m.result, { winner: "right", loser: "left", reason: "hearts" });
});

test("ikkalasining ham yuragi tugasa — vaqti ko'p qolgan yutadi", () => {
  const m = makeMatch();
  for (let k = 0; k < 3; k++) round(m, { left: 0, right: 0 }, { left: 1000, right: 3000 });
  assert.equal(m.result.reason, "both");
  assert.equal(m.result.winner, "left"); // chap 3 s, o'ng 9 s sarfladi
  assert.equal(m.result.loser, "right");
});

test("boshlovchi chiqqach, ikkinchisining vaqti tugasa — boshlovchi yutadi (vaqti ko'p)", () => {
  const m = makeMatch({ seconds: 20 });
  for (let k = 0; k < 2; k++) round(m, { left: 0, right: 1 });
  wrong(m); // 3-raund: chap boshlaydi va oxirgi yuragini yo'qotadi
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
  right(m); // 1-raund: chap
  wrong(m); // o'ng
  m.skip(); // 2-raund: o'ng boshlaydi
  m.next();
  right(m); // chap
  assert.deepEqual(M.stats(m, "left"), { correct: 2, wrong: 0, skipped: 0 });
  assert.deepEqual(M.stats(m, "right"), { correct: 0, wrong: 1, skipped: 1 });
});
