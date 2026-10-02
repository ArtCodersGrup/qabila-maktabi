// 45-o'yin mantiqi: Dirixle printsipi — kafolat haqiqatan buzilmasligini tekshiramiz.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const S = require("../../umumiy/js/sanash.js");
const K = require("../../umumiy/js/kod.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
const each = (make, n, seed) => {
  const r = rngFrom(seed || 45);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

// O'yinning asosiy da'vosi: HAR QANDAY joylashda eng to'la quti kafolatdan kam bo'lmaydi
test("hamma joylashuvlar tekshirildi: eng to'la quti hech qachon kafolatdan kam emas", () => {
  const hammasi = (n, k) => S.variantlar(Array.from({ length: n }, () => Array.from({ length: k }, (_, i) => i)));
  for (const [n, k] of [[5, 4], [4, 3], [7, 3], [6, 2]]) {
    let engKichik = Infinity;
    for (const joylash of hammasi(n, k)) {
      const qutilar = L.joyBosh(k);
      for (const q of joylash) qutilar[q] += 1;
      engKichik = Math.min(engKichik, L.engTola(qutilar));
    }
    // Eng "tekis" joylash ham kafolatni buzolmaydi — va aynan unga teng bo'ladi
    assert.equal(engKichik, L.kafolat(n, k), `${n} narsa, ${k} quti`);
  }
});

test("kafolat: n ≤ k bo'lsa 1, n = k + 1 bo'lsa 2", () => {
  assert.equal(L.kafolat(4, 4), 1);
  assert.equal(L.kafolat(5, 4), 2);
  assert.equal(L.kafolat(13, 12), 2);
  assert.equal(L.kafolat(25, 12), 3);
  assert.equal(L.kafolat(100, 7), 15);
  for (let k = 1; k <= 12; k++) {
    for (let n = 1; n <= 40; n++) {
      const g = L.kafolat(n, k);
      // Ta'rif bo'yicha: (g−1)·k < n ≤ g·k
      assert.ok((g - 1) * k < n && n <= g * k, `n=${n}, k=${k}, g=${g}`);
    }
  }
});

test("kerak: k·(m−1) + 1", () => {
  assert.equal(L.kerak(3, 2), 4);
  assert.equal(L.kerak(5, 2), 6);
  assert.equal(L.kerak(4, 3), 9);
  // k·(m−1) ta olinganda hali kafolat yo'q, bittasi qo'shilsa — bor
  for (let k = 2; k <= 8; k++) {
    for (let m = 2; m <= 4; m++) {
      const n = L.kerak(k, m);
      assert.equal(L.kafolat(n, k), m, `k=${k}, m=${m}`);
      assert.ok(L.kafolat(n - 1, k) < m, `k=${k}, m=${m}: bittasi kam bo'lsa kafolat bo'lmasligi kerak`);
    }
  }
});

test("Dirixle savollari: javob kafolatga teng va 2 dan kichik emas", () => {
  for (const t of each(L.dirixleTask, 40, 3)) {
    assert.equal(t.javob, L.kafolat(t.n, t.k), t.matn);
    assert.ok(t.javob >= 2, t.matn + " — kafolat yoʻq savol berilmasligi kerak");
    assert.ok(t.nega.length > 25, t.id);
  }
});

// 2026-10-02: quti yashirin boʻlgan savollar
test("yashirin qutili savollar: javob kafolatga teng, zina bilan ochiladi", () => {
  const r = rngFrom(17);
  let prev = null;
  for (let k = 0; k < 40; k++) {
    prev = L.dirixleTask(r, prev, 0);
    assert.ok(!/qoldigʻi|inglizcha|365/.test(prev.matn), "birinchi zinada faqat eski savollar: " + prev.matn);
  }
  const matnlar = [];
  for (let k = 0; k < 120; k++) {
    prev = L.dirixleTask(r, prev, 2);
    matnlar.push(prev.matn);
    assert.equal(prev.javob, L.kafolat(prev.n, prev.k), prev.matn);
    assert.ok(prev.javob >= 2, prev.matn);
    assert.ok(!/qoldiqga|harfga ga|kunga ga/.test(prev.nega), prev.nega);
  }
  assert.ok(matnlar.some((m) => m.includes("ayirmasi")), "ayirma savoli chiqmadi");
  assert.ok(matnlar.some((m) => m.includes("365")), "tugʻilgan kun savoli chiqmadi");
  // Ayirma savolining asosi: qoldigʻi bir xil ikki sonning ayirmasi k ga boʻlinadi — sinab koʻramiz
  for (const [a, b, k] of [[17, 3, 7], [100, 45, 5], [9, 0, 9], [-4, 11, 5]]) {
    assert.equal((((a % k) + k) % k) === (((b % k) + k) % k), (a - b) % k === 0, `${a}, ${b}, ${k}`);
  }
  // 366 oʻquvchi → 2; 731 → 3 (365 × 2 = 730 dan bitta ortiq)
  assert.equal(L.kafolat(366, 365), 2);
  assert.equal(L.kafolat(730, 365), 2);
  assert.equal(L.kafolat(731, 365), 3);
});

test("'kamida nechta kerak' yangi savollari: turlar soni matnda yashirin", () => {
  const r = rngFrom(23);
  let prev = null;
  const matnlar = [];
  for (let k = 0; k < 120; k++) {
    prev = L.kerakTask(r, prev, 2);
    matnlar.push(prev.matn);
    assert.equal(prev.javob, L.kerak(prev.k, prev.m), prev.matn);
    // Kafolat aynan shu sonda paydo boʻladi: bitta kam boʻlsa — yoʻq
    assert.equal(L.kafolat(prev.javob, prev.k), prev.m, prev.matn);
    assert.ok(L.kafolat(prev.javob - 1, prev.k) < prev.m, prev.matn);
  }
  assert.ok(matnlar.some((m) => m.includes("Ayirmasi")), "ayirma savoli chiqmadi");
  assert.ok(matnlar.some((m) => m.includes("mast")), "karta savoli chiqmadi");
  prev = null;
  for (let k = 0; k < 30; k++) { prev = L.kerakTask(r, prev, 0); assert.ok(!/oyda|Hafta|Ayirmasi|mast|raqami/.test(prev.matn), prev.matn); }
});

test("yangi kod masalalari: kerak(k, m) va bir_xil_qoldiq(sonlar, k)", () => {
  const vazifa = (id) => {
    const w = L.WRITE.find((x) => x.id === id);
    return { type: "kod-yoz", solution: w.solution, tail: w.tail, tests: w.tests.map((stdin) => ({ stdin })) };
  };
  for (const [k, m] of [[4, 2], [3, 3], [12, 2], [1, 5], [7, 1], [10, 4]]) {
    assert.deepEqual(K.expectedFor(vazifa("kerak"), { stdin: [String(k), String(m)] }), [String(L.kerak(k, m))]);
  }
  // k × m (bitta ortiq) va k × (m − 1) (bitta kam) yechimlar yiqiladi
  assert.equal(K.check(vazifa("kerak"), "def kerak(k, m):\n    return k * m").ok, false);
  assert.equal(K.check(vazifa("kerak"), "def kerak(k, m):\n    return k * (m - 1)").ok, false);
  // bir_xil_qoldiq: 7 ta son 0…6 — hali yoʻq; sakkizinchisi qoʻshilsa — albatta bor (Dirixle)
  assert.deepEqual(K.expectedFor(vazifa("juftlik-bormi"), { stdin: ["0 1 2 3 4 5 6", "7"] }), ["False"]);
  assert.deepEqual(K.expectedFor(vazifa("juftlik-bormi"), { stdin: ["0 1 2 3 4 5 6 14", "7"] }), ["True"]);
  // "Sonlar soni k dan koʻp boʻlsa True" deb yozilgan yechim "5 10 / 5" da yiqiladi (2 ta son, 5 ta quti — lekin qoldiq bir xil)
  assert.equal(K.check(vazifa("juftlik-bormi"), "def bir_xil_qoldiq(sonlar, k):\n    return len(sonlar) > k").ok, false);
});

test("'kamida nechta olish kerak' savollari", () => {
  for (const t of each(L.kerakTask, 30, 7)) {
    assert.equal(t.javob, L.kerak(t.k, t.m), t.matn);
    assert.ok(t.m >= 2 && t.k >= 2);
    assert.equal(t.hisob, t.k + " × " + (t.m - 1) + " + 1 = " + t.javob);
  }
});

test("kod masalasi: dastur qutilarni to'g'ri sanaydi", () => {
  for (const t of each(L.kodTask, 16, 11)) {
    assert.deepEqual(K.expectedFor(t), t.kutilgan, t.id);
    assert.equal(t.javob, L.engTola(t.qutilar));
    // O'lchangan natija kafolatdan kam bo'lishi mumkin emas
    assert.ok(t.javob >= L.kafolat(t.n, t.k), t.id);
  }
});

test("namunali yechimlar hamma testdan o'tadi", () => {
  for (const w of L.WRITE) {
    const task = { type: "kod-yoz", what: w.what, solution: w.solution, tail: w.tail, tests: w.tests.map((stdin) => ({ stdin })) };
    assert.equal(K.check(task, w.solution).ok, true, w.id);
  }
});

test("tipik xato yechimlar o'tmaydi", () => {
  const w = L.WRITE[0];
  const task = { type: "kod-yoz", what: w.what, solution: w.solution, tail: w.tail, tests: w.tests.map((stdin) => ({ stdin })) };
  // Oddiy bo'lish — pastga yumalatadi
  assert.equal(K.check(task, "def kafolat(n, k):\n    return n // k").ok, false);
  // Bo'lmasdan qaytarish
  assert.equal(K.check(task, "def kafolat(n, k):\n    return n - k").ok, false);
});

test("hamma joylashuvni sinash mumkin emasligi — k^n", () => {
  for (const s of L.SINOV) assert.equal(s.variant, BigInt(s.k) ** BigInt(s.n), `${s.n}, ${s.k}`);
  assert.equal(L.SINOV[0].variant, 1024n);
  assert.ok(L.SINOV[2].variant > 10n ** 19n, "20 kaptar, 10 uya — sinab koʻrib boʻlmaydi");
});

test("ketma-ket savollar takrorlanmaydi", () => {
  for (const make of [L.dirixleTask, L.kerakTask, L.kodTask, L.writeTask]) {
    const list = each(make, 12, 19);
    for (let k = 1; k < list.length; k++) assert.notEqual(list[k].id, list[k - 1].id);
  }
});

test("ko'rinadigan matnlarda to'g'ri tutuq belgisi", () => {
  const matnlar = [];
  const r = rngFrom(5);
  for (let k = 0; k < 25; k++) {
    const d = L.dirixleTask(r, null);
    const t = L.kerakTask(r, null);
    matnlar.push(d.matn, d.nega, t.matn, t.nega);
  }
  for (const w of L.WRITE) matnlar.push(w.what);
  for (const m of matnlar) assert.ok(!/['’`´]/.test(m), "notoʻgʻri belgi: " + m);
});
