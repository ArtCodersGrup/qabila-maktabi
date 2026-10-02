// Mashq sikli (scenes/common.js → exercises) testi: soxta ekran, haqiqiy umumiy/js/practice.js va logic.js.
// Tekshiradi: bosqichga qarab 4 / 5 / 6 ta to'g'ri javob, qiyinlik zinasi (tier) generatorga uzatilishi,
// xato javob hisoblanmasligi, qiyin rejimda 7 ta javob va doim tier 2.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");
const logic = require("../js/logic.js");

// answers(ex, urinish) → bola kiritadigan son
function makeWindow(answers) {
  const log = { progress: [], said: [], hints: 0, solutions: 0, shown: [] };
  const win = { QK: { logic, sound: { play: () => {} }, art: {} } };
  let attempt = 0;
  win.QK.ui = {
    settle: (executor) => new Promise((resolve) => executor(resolve)),
    setProgress: (total, filled) => log.progress.push([total, filled]),
    hideProgress: () => {},
    clearControl: () => {},
    pose: () => {},
    toast: () => {},
    say: (who, text) => { log.said.push(text); return Promise.resolve(); },
    askNumber: () => Promise.resolve(answers(win.QK.current, attempt++)),
  };
  loadScript(path.join(__dirname, "../../umumiy/js/practice.js"), win);
  loadScript(path.join(__dirname, "../js/scenes/common.js"), win);
  const spec = {
    show: (ex) => { attempt = 0; log.shown.push(ex); },
    hint: () => { log.hints++; },
    solution: () => { log.solutions++; },
    praise: (ex) => `javob ${ex.answer}`,
  };
  return { win, log, spec };
}

test("exercises: bosqichga qarab 4 / 5 / 6 ta to'g'ri javob, tier 0 → 1 → 2", async () => {
  for (const stage of [1, 2, 3]) {
    const { win, log, spec } = makeWindow((ex) => ex.answer);
    win.QK.practice.setStage(stage, false);
    await win.QK.common.exercises(stage, spec);
    const need = [4, 5, 6][stage - 1];
    assert.equal(log.shown.length, need, `${stage}-bosqich: misollar soni`);
    assert.deepEqual(log.progress[0], [need, 0]);
    assert.deepEqual(log.progress[log.progress.length - 1], [need, need]);
    assert.deepEqual(log.shown.map((ex) => ex.tier), [0, 0, 1, 1, 2, 2].slice(0, need), "qiyinlik zinasi");
    assert.ok(log.shown.every((ex) => ex.stage === stage));
    assert.equal(log.hints + log.solutions, 0);
    assert.equal(win.QK.practice.stars(), 3);
    assert.ok(log.said.some((t) => t.includes("javob ")), "maqtovda misol izohi bo'lishi kerak");
  }
});

test("exercises: 1-xato — maslahat, 2-xato — yechim; xato misol hisoblanmaydi", async () => {
  // Birinchi misolda ikki marta xato, ikkinchisida bir marta xato, qolganlari to'g'ri
  let n = 0;
  const { win, log, spec } = makeWindow((ex, attempt) => {
    if (attempt === 0) n++;
    if (n === 1) return ex.answer + 1;
    if (n === 2 && attempt === 0) return ex.answer + 1;
    return ex.answer;
  });
  win.QK.practice.setStage(1, false);
  await win.QK.common.exercises(1, spec);
  assert.equal(log.shown.length, 5, "xato qilingan misol o'rniga yangisi berilishi kerak");
  assert.equal(log.hints, 2);
  assert.equal(log.solutions, 1);
  assert.equal(win.QK.practice.stars(), 1, "yechim ko'rsatildi — 1 yulduz");
  for (let k = 1; k < log.shown.length; k++) {
    assert.notEqual(logic.exerciseKey(log.shown[k]), logic.exerciseKey(log.shown[k - 1]), "ketma-ket bir xil misol");
  }
});

test("exercises: qiyin rejim — 7 ta javob, doim tier 2, bitta urinish (maslahatsiz)", async () => {
  let first = true;
  const { win, log, spec } = makeWindow((ex) => {
    if (first) { first = false; return ex.answer + 1; }
    return ex.answer;
  });
  win.QK.practice.setStage(3, true);
  await win.QK.common.exercises(3, spec);
  assert.equal(log.shown.length, 8);
  assert.ok(log.shown.every((ex) => ex.tier === 2));
  assert.equal(log.hints, 0, "qiyin rejimda maslahat yo'q");
  assert.equal(log.solutions, 1);
});
