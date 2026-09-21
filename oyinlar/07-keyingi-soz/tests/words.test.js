// words.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const W = require("../js/words.js");

const T = W.table(W.BASE);
const TALL = W.table(W.ALL);

test("matn: gaplar 3 so'zdan, qo'shimcha matn base ustiga qo'shiladi", () => {
  assert.equal(W.BASE.length, 7);
  assert.equal(W.EXTRA.length, 4);
  assert.deepEqual(W.ALL, W.BASE.concat(W.EXTRA));
  for (const s of W.ALL) assert.equal(s.length, 3, s.join(" "));
});

test("table: juftliklar to'g'ri sanaladi", () => {
  assert.deepEqual(T["olov"], { yoqdi: 3, "koʻrdi": 1 });
  assert.deepEqual(T["bola"], { olov: 2, suv: 1 });
  assert.deepEqual(T["suv"], { ichdi: 3 });
  assert.equal(T["yoqdi"], undefined, "gap oxiridan keyin juftlik yo'q");
  assert.deepEqual(TALL["ovchi"], { olov: 1, suv: 1, "togʻga": 1, ovga: 1 });
  assert.deepEqual(TALL["ovga"], { chiqdi: 2 });
});

test("nextList: ko'pdan kamga, teng bo'lsa alifbo bo'yicha", () => {
  assert.deepEqual(W.nextList(T, "bola"), [{ word: "olov", n: 2 }, { word: "suv", n: 1 }]);
  assert.deepEqual(W.nextList(T, "ovchi").map((x) => x.word), ["olov", "suv"]);
  assert.deepEqual(W.nextList(T, "yoqdi"), []);
  assert.equal(W.best(T, "olov"), "yoqdi");
  assert.equal(W.total(T, "olov"), 4);
  assert.deepEqual(W.starters(W.BASE), ["bola", "ovchi", "qabila"]);
});

test("write: eng ko'pini tanlaganda doim bir xil gap", () => {
  assert.deepEqual(W.write(T, "bola"), ["bola", "olov", "yoqdi"]);
  assert.deepEqual(W.write(T, "qabila"), ["qabila", "olov", "yoqdi"]);
  assert.deepEqual(W.write(T, "suv"), ["suv", "ichdi"]);
});

test("sample: ko'p uchragan so'z ko'proq chiqadi, lekin boshqasi ham chiqadi", () => {
  const seen = {};
  for (let i = 0; i < 3000; i++) {
    const w = W.sample(T, "olov", Math.random);
    seen[w] = (seen[w] || 0) + 1;
  }
  assert.ok(seen["yoqdi"] > seen["koʻrdi"], "ko'p uchragani kamroq chiqdi");
  assert.ok(seen["koʻrdi"] > 200, "kam uchragani umuman chiqmadi");
  assert.equal(W.sample(T, "yoqdi", Math.random), null);
});

test("write (tasodifiy): faqat jadvaldagi juftliklardan yasaladi", () => {
  for (let i = 0; i < 300; i++) {
    const start = W.starters(W.ALL)[i % 3];
    const s = W.write(TALL, start, { random: true });
    assert.ok(s.length >= 2, s.join(" "));
    assert.ok(W.canWrite(TALL, s), s.join(" "));
  }
});

test("canWrite: mavjud bo'lmagan juftlik — yo'q", () => {
  assert.equal(W.canWrite(T, ["bola", "olov", "yoqdi"]), true);
  assert.equal(W.canWrite(T, ["bola", "ichdi"]), false);
  assert.equal(W.canWrite(T, ["olov", "suv", "ichdi"]), false);
  assert.equal(W.canWrite(T, ["bola", "suv", "ichdi"], W.starters(W.BASE)), true);
  assert.equal(W.canWrite(T, ["suv", "ichdi"], W.starters(W.BASE)), false, "gap boshi bo'la olmaydi");
});

test("makeBestTask: yagona eng ko'p javob, variantlar takrorlanmaydi", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = W.makeBestTask(W.BASE, prev);
    const list = W.nextList(T, task.word);
    assert.ok(list.length >= 2, task.word);
    assert.ok(list[0].n > list[1].n, "javob yagona emas");
    assert.equal(task.options[task.answer], list[0].word);
    assert.equal(new Set(task.options).size, task.options.length);
    assert.ok(task.options.length >= 3);
    if (prev) assert.notEqual(task.word, prev.word);
    prev = task;
  }
});

test("makeSentenceTask: uch gapdan faqat bittasini robot yoza oladi", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = W.makeSentenceTask(W.ALL, prev);
    assert.equal(task.options.length, 3);
    const ok = task.options.filter((s) => W.canWrite(TALL, s, W.starters(W.ALL)));
    assert.equal(ok.length, 1, task.options.map((s) => s.join(" ")).join(" | "));
    assert.deepEqual(task.options[task.answer], ok[0]);
    prev = task;
  }
});

test("makeFollowTask: javob — jadvalda bor so'z, qolganlari yo'q", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = W.makeFollowTask(W.ALL, prev);
    const row = TALL[task.word] || {};
    assert.ok(row[task.options[task.answer]], "javob juftlikda yo'q");
    task.options.forEach((w, k) => {
      if (k !== task.answer) assert.ok(!row[w], `${task.word} → ${w} bor ekan`);
    });
    assert.equal(new Set(task.options).size, 3);
    prev = task;
  }
});

test("makeStage3Task: avval gap, keyin keyingi so'z; turlar aralashsa ham ishlaydi", () => {
  assert.equal(W.makeStage3Task(W.ALL, 0, null).type, "sentence");
  assert.equal(W.makeStage3Task(W.ALL, 1, null).type, "follow");
  let prev = null;
  for (let i = 0; i < 300; i++) {
    const task = W.makeStage3Task(W.ALL, i % 3, prev); // oldingi vazifa boshqa turdagi bo'lishi mumkin
    assert.ok(task.type === "sentence" || task.type === "follow");
    assert.equal(task.options.length, 3);
    prev = task;
  }
});
