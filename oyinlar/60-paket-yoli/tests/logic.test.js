// 60-o'yin: paket yo'li — to'r, eng qisqa yo'l, uzilgan sim, so'rovlar va navbat.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
function each(make, count, tier, seed) {
  const r = rngFrom(seed || 60);
  const out = [];
  let prev = null;
  for (let k = 0; k < count; k++) {
    prev = make(r, prev, tier);
    out.push(prev);
  }
  return out;
}

test("qo'shnilar va BFS: qo'lda tekshirilgan kichik to'r", () => {
  const simlar = [L.sim(0, 1), L.sim(1, 2), L.sim(2, 6), L.sim(0, 4), L.sim(4, 5), L.sim(5, 6)];
  assert.deepEqual(L.qoshnilar(simlar, 1), [0, 2]);
  assert.equal(L.masofa(simlar, 0, 6), 3);
  assert.equal(L.bfs(simlar, 0, 6).yol.length, 4);
  assert.equal(L.masofa(simlar, 0, 3), -1, "3-tugunga sim yo'q");
  assert.equal(L.simNomi(L.sim(5, 1)), "B–F");
  assert.equal(L.tolaSimlar().length, 17, "4×3 to'rda 17 ta yonma-yon sim");
});

test("tasodifiy to'r doim bog'langan, 12 tugundan oshmaydi, 3–5 sim olingan", () => {
  const r = rngFrom(2);
  for (let k = 0; k < 300; k++) {
    const t = L.tor(r);
    assert.equal(t.tugunlar.length, 12);
    assert.ok(L.boglanganmi(t.simlar, t.tugunlar));
    assert.equal(new Set(t.simlar).size, t.simlar.length);
    const toliq = 17 + L.QIYA.reduce((m, q) => Math.max(m, q.length), 0);
    assert.ok(t.simlar.length <= toliq - 3 && t.simlar.length >= 12, String(t.simlar.length));
  }
});

test("qadamlar: javob — BFS masofasi, tier oralig'ida; yo'l haqiqatan simlardan o'tadi", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.qadamTask, 60, tier)) {
      const [min, max] = L.ORALIQ[tier];
      assert.ok(t.javob >= min && t.javob <= max, `${tier}: ${t.javob}`);
      assert.equal(t.javob, L.masofa(t.tor.simlar, t.a, t.b));
      for (let i = 1; i < t.yol.length; i++) assert.ok(t.tor.simlar.includes(L.sim(t.yol[i - 1], t.yol[i])));
    }
  }
});

const variantli = (tasks) => {
  for (const t of tasks) {
    assert.equal(t.variantlar.length, 4, t.id);
    assert.equal(new Set(t.variantlar).size, 4, t.id);
    assert.ok(t.variantlar.includes(t.javob), t.id);
  }
};

test("keyingi qadam: javob yagona qo'shni, variantlarda qo'shni bo'lmagan tugun ham bor", () => {
  for (const tier of [0, 1, 2]) {
    const list = each(L.keyingiTask, 50, tier);
    variantli(list);
    for (const t of list) {
      const d = L.masofa(t.tor.simlar, t.a, t.b);
      const q = L.qoshnilar(t.tor.simlar, t.a);
      const yaxshi = q.filter((x) => L.masofa(t.tor.simlar, x, t.b) === d - 1).map(L.harf);
      assert.deepEqual(yaxshi, [t.javob], t.id);
      assert.ok(t.variantlar.some((v) => !q.map(L.harf).includes(v)), "begona tugun bor");
    }
  }
});

test("sim uzildi: uzilgan sim eski yo'lda edi, yangi masofa to'g'ri va yo'l bor", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.uzildiTask, 50, tier)) {
      const qolgan = t.tor.simlar.filter((s) => !t.uzilgan.includes(s));
      assert.equal(t.javob, L.masofa(qolgan, t.a, t.b));
      assert.ok(t.javob >= t.eski);
      assert.equal(t.uzilgan.length, tier === 2 ? 2 : 1);
    }
  }
});

test("qaysi sim: javob yagona va yo'lni haqiqatan uzaytiradi", () => {
  for (const tier of [0, 1, 2]) {
    const list = each(L.qaysiTask, 40, tier);
    variantli(list);
    for (const t of list) {
      const eng = Math.max(...t.baho.map((x) => x.d));
      assert.equal(t.baho.filter((x) => x.d === eng).length, 1);
      assert.ok(eng > t.eski);
      assert.equal(L.simNomi(t.baho.find((x) => x.d === eng).s), t.javob);
    }
  }
});

test("yetadimi (tier 2): javob haqiqiy holatga mos, ba'zan yo'l butunlay uziladi", () => {
  let yoq = 0;
  const list = each(L.yetadimiTask, 120, 2);
  variantli(list);
  for (const t of list) {
    const qolgan = t.tor.simlar.filter((s) => !t.uzilgan.includes(s));
    const d = L.masofa(qolgan, t.a, t.b);
    assert.equal(t.javob, d < 0 ? L.YOQ : `Ha — ${d} qadam`);
    if (d < 0) yoq++;
  }
  assert.ok(yoq > 10 && yoq < 110, `yo'q holatlari: ${yoq}`);
  assert.equal(L.yetadimiTask(rngFrom(1), null, 1).tur, "uzildi");
});

test("so'rovlar, kelmagan fayl va navbat", () => {
  for (const [tier, min, max] of [[0, 2, 3], [1, 4, 5], [2, 6, 7]]) {
    for (const t of each(L.sorovTask, 40, tier)) {
      assert.ok(t.javob >= min && t.javob <= max);
      assert.equal(t.fayllar[0].id, "sahifa");
    }
  }
  variantli(each(L.kelmadiTask, 40, 1));
  assert.equal(L.kutish(4, 1), 4);
  assert.equal(L.kutish(5, 2), 3);
  assert.equal(L.kutish(6, 2), 3);
  for (const t of each(L.navbatTask, 60, 2)) assert.equal(t.tezlik, 2);
});

test("ketma-ket bir xil misol chiqmaydi va bosqich navbati aylanadi", () => {
  for (const make of [L.qadamTask, L.uzildiTask, L.sorovTask, L.navbatTask, L.kelmadiTask]) {
    const list = each(make, 40, 1);
    for (let i = 1; i < list.length; i++) assert.notEqual(list[i].id, list[i - 1].id);
  }
  const r = rngFrom(9);
  assert.deepEqual([0, 1].map((n) => L.bosqich1Task(r, null, n, 0).tur), ["qadam", "keyingi"]);
  assert.deepEqual([0, 1, 2].map((n) => L.bosqich2Task(r, null, n, 2).tur), ["uzildi", "qaysi", "yetadimi"]);
  assert.deepEqual([0, 1, 2].map((n) => L.bosqich3Task(r, null, n, 0).tur), ["sorov", "kelmadi", "navbat"]);
});
