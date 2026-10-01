// 50-o'yin: parol kuchi — variantlar soni, topish vaqti va baho.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const S = require("../../umumiy/js/sanash.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
const each = (make, n, seed) => {
  const r = rngFrom(seed || 50);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("tahlil: alifbo o'lchami ishlatilgan belgi turlaridan yig'iladi", () => {
  assert.equal(L.tahlil("1234").alifbo, 10);
  assert.equal(L.tahlil("abcd").alifbo, 26);
  assert.equal(L.tahlil("abc123").alifbo, 36);
  assert.equal(L.tahlil("Abc123").alifbo, 62);
  assert.equal(L.tahlil("Abc123!").alifbo, 94);
  assert.equal(L.tahlil("ikki soz").alifbo, 58, "boʻsh joy ham belgi hisoblanadi");
  assert.equal(L.tahlil("abcd").variant, S.takrorli(26, 4));
});

test("vaqt: variantlar soni tezlikka bo'linadi", () => {
  assert.equal(L.vaqt(1000000n, 1000000n), 1n);
  assert.equal(L.vaqt(S.takrorli(26, 6), 1000000n), 308n);
  // Kuchli uskuna ming marta tez
  assert.equal(L.vaqt(S.takrorli(26, 8), 1000000000n) * 1000n <= L.vaqt(S.takrorli(26, 8), 1000000n) * 1001n, true);
});

test("vaqtMatni: eng mos birlikni tanlaydi", () => {
  assert.equal(L.vaqtMatni(0n), "bir soniyadan kam");
  assert.equal(L.vaqtMatni(45n), "45 soniya");
  assert.equal(L.vaqtMatni(300n), "5 daqiqa");
  assert.equal(L.vaqtMatni(7200n), "2 soat");
  assert.equal(L.vaqtMatni(172800n), "2 kun");
  assert.equal(L.vaqtMatni(31536000n * 5n), "5 yil");
  assert.equal(L.vaqtMatni(31536000n * 5000n), "5 ming yil");
  assert.equal(L.vaqtMatni(31536000n * 5000000n), "5 million yil");
  assert.equal(L.vaqtMatni(L.KOINOT * 2n), "koinot yoshidan ham koʻp");
});

// O'yinning asosiy xabari: uzunlik murakkablikdan kuchliroq
test("uzun oddiy parol qisqa murakkabdan kuchli", () => {
  const qisqaMurakkab = L.baho("Qq1!5z");     // 6 ta belgi, 4 xil tur
  const uzunOddiy = L.baho("kitobjavonstol"); // 14 ta kichik harf
  assert.equal(qisqaMurakkab.daraja, "oʻrtacha");
  assert.equal(uzunOddiy.daraja, "kuchli");
  assert.ok(uzunOddiy.sek > qisqaMurakkab.sek * 1000000n, "uzun parol ancha koʻp vaqt talab qiladi");
});

test("lug'at: ism, mashhur so'z va yil — uzunligidan qat'i nazar zaif", () => {
  for (const p of ["Anvar2010", "salom123", "qwerty", "2007", "P@rol1", "iloveyou"]) {
    assert.equal(L.baho(p).daraja, "zaif", p);
  }
  assert.equal(L.lugatda("Anvar2010"), "ism");
  assert.equal(L.lugatda("2007"), "yil");
  assert.equal(L.lugatda("qizil chashma"), null);
  // Hiyla almashtirishlar yordam bermaydi
  assert.equal(L.soddalashtir("P@ss1"), "pass");
  assert.equal(L.soddalashtir("Anvar2010"), "anvar");
  assert.equal(L.soddalashtir("$al0m"), "salom");
});

test("variant savollari: javob a^i ga teng", () => {
  for (const t of each(L.variantTask, 20, 3)) {
    assert.equal(t.javob, S.takrorli(t.alifbo, t.uzunlik));
    assert.ok(t.javob <= 20000n, "javobni raqam klaviaturasida yozib boʻlishi kerak: " + t.javob);
    assert.ok(t.hisob.includes("^"), t.hisob);
  }
});

test("vaqt savollari: to'rtta variant, to'g'risi ichida va takrorsiz", () => {
  for (const t of each(L.vaqtTask, 24, 7)) {
    assert.ok(t.variantlar.length >= 3 && t.variantlar.length <= 4, t.id);
    assert.equal(new Set(t.variantlar).size, t.variantlar.length, "variantlar takrorlanmasin: " + t.variantlar);
    assert.ok(t.variantlar.includes(t.javob), t.id);
    assert.equal(t.javob, L.vaqtMatni(t.sek));
  }
  // To'g'ri javob har xil joylarda turadi
  const joylar = new Set(each(L.vaqtTask, 24, 11).map((t) => t.variantlar.indexOf(t.javob)));
  assert.ok(joylar.size >= 3, "javob aralashtirilmayapti: " + [...joylar]);
});

test("qiyos savollari: kuchli parol to'g'ri tanlangan", () => {
  for (const t of each(L.qiyosTask, 20, 13)) {
    assert.equal(t.variantlar.length, 2);
    assert.ok(t.variantlar.includes(t.javob), t.id);
    const boshqa = t.variantlar.find((p) => p !== t.javob);
    const a = L.baho(t.javob);
    const b = L.baho(boshqa);
    const tartib = { zaif: 0, "oʻrtacha": 1, kuchli: 2 };
    assert.ok(tartib[a.daraja] > tartib[b.daraja], t.javob + " (" + a.daraja + ") ↔ " + boshqa + " (" + b.daraja + ")");
    assert.ok(t.nega.length > 20);
  }
});

test("baho savollari: javob uch darajadan biri", () => {
  for (const t of each(L.bahoTask, 20, 17)) {
    assert.ok(L.DARAJALAR.includes(t.javob), t.parol + " → " + t.javob);
    assert.equal(t.javob, L.baho(t.parol).daraja);
    assert.ok(t.nega.length > 20, t.parol);
  }
  // Har uch daraja ham uchraydi
  const darajalar = new Set(L.PAROLLAR.map((p) => L.baho(p).daraja));
  assert.equal(darajalar.size, 3, [...darajalar].join(","));
});

test("ibora so'zlari: kamida 10 ta, hammasi har xil", () => {
  assert.ok(L.SOZLAR.length >= 10);
  assert.equal(new Set(L.SOZLAR).size, L.SOZLAR.length);
  // To'rt so'zli ibora — kuchli parol
  const ibora = L.SOZLAR.slice(0, 4).join(" ");
  assert.equal(L.baho(ibora).daraja, "kuchli", ibora);
});

test("ketma-ket savollar takrorlanmaydi", () => {
  for (const make of [L.variantTask, L.vaqtTask, L.qiyosTask, L.bahoTask]) {
    const list = each(make, 10, 23);
    for (let k = 1; k < list.length; k++) assert.notEqual(list[k].id, list[k - 1].id);
  }
});

test("ko'rinadigan matnlarda to'g'ri tutuq belgisi", () => {
  const matnlar = [];
  const r = rngFrom(9);
  for (let k = 0; k < 15; k++) {
    matnlar.push(L.variantTask(r, null).matn, L.vaqtTask(r, null).matn, L.qiyosTask(r, null).nega, L.bahoTask(r, null).nega);
  }
  for (const t of L.TURLAR) matnlar.push(t.nom);
  for (const m of matnlar) assert.ok(!/['’`´]/.test(m), "notoʻgʻri belgi: " + m);
});
