// vision.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const V = require("../js/vision.js");

test("to'r va shablonlar: 6×6, olti xil shakl, kataklar soni hammasida har xil", () => {
  assert.equal(V.SIZE, 6);
  assert.deepEqual(V.NAMES, ["kvadrat", "uchburchak", "krest", "T", "doira", "chiziq"]);
  for (const name of V.NAMES) {
    const grid = V.TEMPLATES[name];
    assert.equal(grid.length, 36, name);
    assert.ok(grid.every((c) => c === 0 || c === 1), name);
  }
  assert.deepEqual(V.NAMES.map((n) => V.filled(V.TEMPLATES[n])), [32, 24, 20, 16, 12, 8]);
  // Har ikki shablon bir-biridan kamida 8 katak bilan farq qiladi — shovqin ularni chalkashtirmaydi
  for (const a of V.NAMES) {
    for (const b of V.NAMES) {
      if (a !== b) assert.ok(V.matchScore(V.TEMPLATES[a], V.TEMPLATES[b]) <= 28, `${a} va ${b} juda oʻxshash`);
    }
  }
});

test("matchScore: bir xil rasmda 36, farq qilganda kamayadi", () => {
  assert.equal(V.matchScore(V.TEMPLATES.krest, V.TEMPLATES.krest), 36);
  assert.ok(V.matchScore(V.TEMPLATES.krest, V.TEMPLATES.kvadrat) < 36);
  const one = V.TEMPLATES.krest.slice();
  one[0] = one[0] ? 0 : 1;
  assert.equal(V.matchScore(V.TEMPLATES.krest, one), 35);
});

test("shift: rasm suriladi, chetdagi kataklar yo'qoladi", () => {
  const grid = new Array(36).fill(0);
  grid[0] = 1;   // chap-yuqori
  grid[35] = 1;  // o'ng-past
  const right = V.shift(grid, 1, 0);
  assert.equal(right[1], 1, "o'ngga surilmadi");
  assert.equal(right[0], 0);
  assert.equal(V.filled(right), 1, "o'ng chekkadagi katak yo'qolishi kerak");
  const down = V.shift(grid, 0, 1);
  assert.equal(down[6], 1);
});

test("bestMatch: eng ko'p mos kelgan shablon", () => {
  const best = V.bestMatch(V.TEMPLATES.uchburchak);
  assert.equal(best.name, "uchburchak");
  assert.equal(best.score, 36);
  assert.equal(best.list.length, 6);
  assert.ok(best.list[0].score >= best.list[1].score);
});

test("byFeature: bo'yalgan kataklar soniga eng yaqin shablon", () => {
  assert.equal(V.byFeature(V.TEMPLATES.krest), "krest");
  assert.equal(V.byFeature(V.shift(V.TEMPLATES.krest, 1, 0)), "krest", "surilganda ham belgi ishlaydi");
  assert.equal(V.byFeature(V.TEMPLATES.kvadrat), "kvadrat");
});

test("addNoise: aytilgancha katak o'zgaradi", () => {
  const noisy = V.addNoise(V.TEMPLATES.krest, 4, Math.random);
  assert.equal(V.matchScore(V.TEMPLATES.krest, noisy), 32);
});

const diffCells = (a, b) => 36 - V.matchScore(a, b);

test("makeReadTask: 4 variantdan bittasi to'g'ri, takrorlanmaydi", () => {
  for (const tier of [0, 1, 2]) {
    let prev = null;
    for (let i = 0; i < 200; i++) {
      const task = V.makeReadTask(prev, Math.random, tier);
      assert.equal(task.options.length, 4, "kamida 4 variant");
      assert.deepEqual(task.options[task.answer], task.image);
      assert.equal(new Set(task.options.map((g) => g.join(""))).size, 4, "variantlar takrorlandi");
      if (prev) assert.notEqual(task.image.join(""), prev.image.join(""));
      prev = task;
    }
  }
});

test("makeReadTask: tier bilan shovqin ortadi (1–3 → 2–4 → 3–5), tier 2 da o'xshash variant bor", () => {
  const range = [[1, 3], [2, 4], [3, 5]];
  for (const tier of [0, 1, 2]) {
    const seen = new Set();
    for (let i = 0; i < 300; i++) {
      const task = V.makeReadTask(null, Math.random, tier);
      const noise = diffCells(task.image, V.TEMPLATES[task.truth]);
      assert.ok(noise >= range[tier][0] && noise <= range[tier][1], `tier ${tier}: shovqin ${noise}`);
      seen.add(noise);
      // Shu shablondan yasalgan variantlar: tier 0, 1 da faqat javobning o'zi, tier 2 da yana bitta "egizak"
      const twins = task.sources.filter((n) => n === task.truth).length;
      assert.equal(twins, tier === 2 ? 2 : 1, `tier ${tier}: oʻxshash variantlar ${twins}`);
      assert.equal(task.sources[task.answer], task.truth);
      task.options.forEach((g, k) => {
        const d = diffCells(g, V.TEMPLATES[task.sources[k]]);
        assert.ok(d >= range[tier][0] && d <= range[tier][1], `variant shovqini ${d}`);
      });
    }
    assert.equal(seen.size, 3, `tier ${tier}: shovqinning hamma qiymati chiqishi kerak`);
  }
});

test("makeMatchTask: robot shablon bilan to'g'ri javob topadi, oltala shakl ham chiqadi", () => {
  for (const tier of [0, 1, 2]) {
    let prev = null;
    const seen = new Set();
    for (let i = 0; i < 300; i++) {
      const task = V.makeMatchTask(prev, Math.random, tier);
      const best = V.bestMatch(task.image);
      assert.equal(best.name, task.answer);
      assert.ok(best.list[0].score - best.list[1].score >= (tier === 2 ? 2 : 3), "javob ikkilanarli");
      assert.equal(task.options.length, tier === 2 ? 6 : 4, `tier ${tier}: variantlar soni`);
      assert.ok(task.options.includes(task.answer), "to'g'ri javob variantlarda yo'q");
      assert.equal(new Set(task.options).size, task.options.length);
      if (tier < 2) {
        // Chalg'ituvchilar — eng o'xshash shablonlar: ikkinchi o'rindagi shablon albatta variantlarda
        assert.ok(task.options.includes(best.list[1].name), "eng yaqin raqib variantlarda yo'q");
      }
      if (prev) assert.notEqual(task.answer, prev.answer, "ketma-ket bir xil shakl");
      seen.add(task.answer);
      prev = task;
    }
    assert.equal(seen.size, 6, "oltala shakl ham chiqishi kerak");
  }
});

test("makeMatchTask: tier bilan shovqin ortadi (2–4 → 3–6 → 4–7)", () => {
  const range = [[2, 4], [3, 6], [4, 7]];
  for (const tier of [0, 1, 2]) {
    let max = 0;
    for (let i = 0; i < 300; i++) {
      const task = V.makeMatchTask(null, Math.random, tier);
      const noise = diffCells(task.image, V.TEMPLATES[task.answer]);
      assert.ok(noise >= range[tier][0] && noise <= range[tier][1], `tier ${tier}: shovqin ${noise}`);
      max = Math.max(max, noise);
    }
    assert.equal(max, range[tier][1], `tier ${tier}: eng katta shovqin chiqmadi`);
  }
});

test("makeMethodTask: 4 javob, javob ikkala usulning haqiqiy natijasiga mos", () => {
  for (const tier of [0, 1, 2]) {
    let prev = null;
    const seen = new Set();
    const shapes = new Set();
    for (let i = 0; i < 400; i++) {
      const task = V.makeMethodTask(prev, Math.random, tier);
      assert.deepEqual(task.options, ["shablon", "belgi", "ikkalasi", "hech"], "kamida 4 variant");
      const byPixels = V.bestMatch(task.image).name === task.truth;
      const byFeature = V.byFeature(task.image) === task.truth;
      const expected = byPixels && byFeature ? "ikkalasi" : byPixels ? "shablon" : byFeature ? "belgi" : "hech";
      assert.equal(task.answer, expected);
      assert.equal(task.byPixels, V.bestMatch(task.image).name);
      assert.equal(task.byFeature, V.byFeature(task.image));
      assert.ok(V.NAMES.includes(task.truth));
      // Mulohaza qoidasi: "surildi" deyilgan rasmda shablon adashadi, surilmaganda — topadi
      assert.equal(byPixels, !task.changed.startsWith("surildi"), `${task.changed}: shablon ${byPixels}`);
      if (prev) assert.ok(!(prev.truth === task.truth && prev.answer === task.answer), "ketma-ket bir xil misol");
      seen.add(task.answer);
      shapes.add(task.truth);
      prev = task;
    }
    assert.deepEqual([...seen].sort(), tier === 0 ? ["belgi", "shablon"] : ["belgi", "hech", "ikkalasi", "shablon"], `tier ${tier}`);
    assert.ok(shapes.size >= 5, `tier ${tier}: shakllar xilma-xil emas (${shapes.size})`);
  }
});

test("makeMethodTask: tier 2 da ko'proq katak qo'shiladi (8 tagacha)", () => {
  const maxAdded = (tier) => {
    let max = 0;
    for (let i = 0; i < 600; i++) {
      const task = V.makeMethodTask(null, Math.random, tier);
      if (task.changed !== "kataklar qoʻshildi") continue;
      max = Math.max(max, V.filled(task.image) - V.filled(V.TEMPLATES[task.truth]));
    }
    return max;
  };
  assert.ok(maxAdded(0) <= 5);
  assert.ok(maxAdded(2) > 5 && maxAdded(2) <= 8);
});

test("DEMO_SHIFT: namoyishda shablon adashadi, belgi to'g'ri topadi", () => {
  const d = V.DEMO_SHIFT;
  const moved = V.shift(V.TEMPLATES[d.name], d.dx, d.dy);
  assert.notEqual(V.bestMatch(moved).name, d.name, "shablon adashishi kerak");
  assert.equal(V.byFeature(moved), d.name, "belgi to'g'ri topishi kerak");
});
