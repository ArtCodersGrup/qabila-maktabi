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

test("makeBestTask: yagona eng ko'p javob, 4 variant, takrorlanmaydi", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = W.makeBestTask(W.BASE, prev);
    const list = W.nextList(T, task.word);
    assert.ok(list.length >= 2, task.word);
    assert.ok(list[0].n > list[1].n, "javob yagona emas");
    assert.equal(task.options[task.answer], list[0].word);
    assert.equal(new Set(task.options).size, task.options.length);
    assert.equal(task.options.length, 4, "kamida 4 variant");
    assert.ok(!task.options.includes(task.word));
    if (prev) assert.notEqual(task.word, prev.word);
    prev = task;
  }
});

test("gaplar banki: 20 ta, 3 so'zdan, takrorsiz; ko'rsatish matni (BASE, EXTRA) bank ichida", () => {
  assert.equal(W.BANK.length, 20);
  assert.equal(new Set(W.BANK.map((s) => s.join(" "))).size, 20);
  for (const s of W.BANK) {
    assert.equal(s.length, 3);
    for (const w of s) assert.ok(!/[`']/.test(w), `oʻ/gʻ U+02BB bilan yozilsin: ${w}`);
  }
  for (const s of W.ALL) assert.ok(W.BANK.includes(s));
  assert.ok(W.starters(W.BANK).length >= 4);
  assert.ok(W.vocabulary(W.BANK).length >= 15);
});

test("makeCorpus: zina bo'yicha 7 / 8 / 9 ta gap, har safar boshqacha, savol tuzishga yaroqli", () => {
  assert.deepEqual(W.CORPUS_SIZE, [7, 8, 9]);
  for (const tier of [0, 1, 2]) {
    const seen = new Set();
    for (let i = 0; i < 200; i++) {
      const corpus = W.makeCorpus(Math.random, tier);
      assert.equal(corpus.length, W.CORPUS_SIZE[tier]);
      assert.equal(new Set(corpus).size, corpus.length, "gap takrorlandi");
      for (const s of corpus) assert.ok(W.BANK.includes(s));
      assert.ok(W.clearWords(W.table(corpus)).length >= 2);
      assert.ok(W.starters(corpus).length >= 3);
      seen.add(corpus.map((s) => s.join(" ")).sort().join("|"));
    }
    assert.ok(seen.size > 150, `tier ${tier}: matnlar takrorlanyapti (${seen.size})`);
  }
});

test("makeBestTask (tasodifiy matn): javob shu matn jadvaliga mos, 4 variant, so'z takrorlanmaydi", () => {
  for (const tier of [0, 1, 2]) {
    let prev = null;
    for (let i = 0; i < 200; i++) {
      const task = W.makeBestTask(null, prev, Math.random, tier);
      assert.equal(task.sentences.length, W.CORPUS_SIZE[tier]);
      const list = W.nextList(W.table(task.sentences), task.word);
      assert.ok(list.length >= (tier === 0 ? 2 : 3), `tier ${tier}: davomlar kam`);
      assert.ok(list[0].n > list[1].n, "javob yagona emas");
      assert.equal(task.options[task.answer], list[0].word);
      assert.equal(task.options.length, 4, "kamida 4 variant");
      assert.equal(new Set(task.options).size, 4);
      if (prev) assert.notEqual(task.word, prev.word);
      prev = task;
    }
  }
});

test("makeGreedyTask: 4 ta gapdan faqat bittasi — har qadamda eng ko'p uchraganini tanlash natijasi", () => {
  for (const tier of [0, 1, 2]) {
    let prev = null;
    for (let i = 0; i < 150; i++) {
      const task = W.makeGreedyTask(null, prev, Math.random, tier);
      const t = W.table(task.sentences);
      assert.equal(task.options.length, 4, "kamida 4 variant");
      assert.equal(new Set(task.options.map((s) => s.join(" "))).size, 4, "gap takrorlandi");
      const good = task.options[task.answer];
      assert.deepEqual(good, W.write(t, task.start, { maxLen: 2 }), "to'g'ri javob — robotning gapi");
      assert.ok(task.options.every((s) => s[0] === task.start && s.length === 3), "hamma gap bir so'zdan boshlanadi");
      // Har qadamda eng ko'pi yagona: ikkilanish yo'q
      const first = W.nextList(t, task.start);
      assert.ok(first.length >= 2 && first[0].n > first[1].n);
      const second = W.nextList(t, good[1]);
      assert.ok(second.length === 1 || second[0].n > second[1].n);
      assert.equal(task.rows[0], task.start);
      assert.ok(task.rows.includes(good[1]), "kerakli qator jadvalda ko'rsatiladi");
      if (prev) assert.notDeepEqual(good, prev.options[prev.answer]);
      prev = task;
    }
  }
  // Qat'iy matnda (BASE) yagona to'g'ri gap bor — generator osilib qolmaydi
  let prev = null;
  for (let i = 0; i < 20; i++) prev = W.makeGreedyTask(W.BASE, prev);
  assert.deepEqual(prev.options[prev.answer], ["bola", "olov", "yoqdi"]);
});

test("makeSentenceTask: to'rt gapdan faqat bittasini robot yoza oladi", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = W.makeSentenceTask(W.ALL, prev);
    assert.equal(task.options.length, 4, "kamida 4 variant");
    const ok = task.options.filter((s) => W.canWrite(TALL, s, W.starters(W.ALL)));
    assert.equal(ok.length, 1, task.options.map((s) => s.join(" ")).join(" | "));
    assert.deepEqual(task.options[task.answer], ok[0]);
    if (prev) assert.notDeepEqual(task.options[task.answer], prev.options[prev.answer]);
    prev = task;
  }
});

test("makeSentenceTask (tasodifiy matn): tier 1, 2 da noto'g'ri gaplar «deyarli to'g'ri» — bitta juftligi jadvalda bor", () => {
  for (const tier of [0, 1, 2]) {
    let prev = null;
    let nearCount = 0;
    let total = 0;
    for (let i = 0; i < 150; i++) {
      const task = W.makeSentenceTask(null, prev, Math.random, tier);
      const t = W.table(task.sentences);
      const starts = W.starters(task.sentences);
      assert.equal(task.options.length, 4);
      assert.equal(new Set(task.options.map((s) => s.join(" "))).size, 4);
      task.options.forEach((s, k) => {
        const ok = W.canWrite(t, s, starts);
        assert.equal(ok, k === task.answer, s.join(" "));
        if (k === task.answer) return;
        total++;
        if (W.canWrite(t, s.slice(0, 2)) !== W.canWrite(t, s.slice(1))) nearCount++;
      });
      prev = task;
    }
    if (tier >= 1) assert.equal(nearCount, total, `tier ${tier}: har bir noto'g'ri gapda aynan bitta juftlik to'g'ri bo'lishi kerak`);
  }
});

test("makeFollowTask: javob — jadvalda bor so'z, qolgan uchtasi yo'q", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = W.makeFollowTask(W.ALL, prev);
    const row = TALL[task.word] || {};
    assert.ok(row[task.options[task.answer]], "javob juftlikda yo'q");
    task.options.forEach((w, k) => {
      if (k !== task.answer) assert.ok(!row[w], `${task.word} → ${w} bor ekan`);
    });
    assert.equal(new Set(task.options).size, 4, "kamida 4 variant");
    if (prev) assert.notEqual(task.word, prev.word);
    prev = task;
  }
  for (let i = 0; i < 200; i++) {
    const task = W.makeFollowTask(null, prev, Math.random, i % 3);
    const row = W.table(task.sentences)[task.word];
    assert.equal(task.options.filter((w) => row[w]).length, 1, "faqat bitta variant jadvalda bor");
    assert.equal(task.options.length, 4);
    prev = task;
  }
});

test("makeStage3Task: avval gap, keyin keyingi so'z; turlar aralashsa ham ishlaydi", () => {
  assert.equal(W.makeStage3Task(W.ALL, 0, null).type, "sentence");
  assert.equal(W.makeStage3Task(W.ALL, 1, null).type, "follow");
  let prev = null;
  for (let i = 0; i < 300; i++) {
    const task = W.makeStage3Task(null, i % 3, prev, Math.random, i % 3); // oldingi vazifa boshqa turdagi bo'lishi mumkin
    assert.ok(task.type === "sentence" || task.type === "follow");
    assert.equal(task.options.length, 4);
    assert.equal(task.tier, i % 3);
    assert.equal(task.sentences.length, W.CORPUS_SIZE[i % 3]);
    prev = task;
  }
});
