// Masalalar ro'yxati: qidiruv, filtr va sahifalash.
const test = require("node:test");
const assert = require("node:assert/strict");
const R = require("../js/royxat.js");
const bank = require("../js/bank.js");

const hammasi = R.hammasi();

test("bankdagi hamma masala bitta ro'yxatda, daraja belgisi bilan", () => {
  const jami = bank.LEVELS.reduce((n, l) => n + l.problems.length, 0);
  assert.equal(hammasi.length, jami);
  assert.ok(hammasi.every((p) => p.daraja && p.darajaNom && p.title && p.rating));
  assert.equal(new Set(hammasi.map((p) => p.id)).size, jami, "id lar takrorlanmaydi");
});

test("ro'yxat qiyinlik bo'yicha tartiblangan", () => {
  for (let k = 1; k < hammasi.length; k++) {
    assert.ok(hammasi[k].rating >= hammasi[k - 1].rating, hammasi[k].id);
  }
});

test("sahifada 10 tadan", () => {
  assert.equal(R.SAHIFADA, 10);
  const s1 = R.sahifa(hammasi, 1);
  assert.equal(s1.items.length, 10);
  assert.equal(s1.sahifa, 1);
  assert.equal(s1.jami, hammasi.length);
  assert.equal(s1.sahifalar, Math.ceil(hammasi.length / 10));
  const oxirgi = R.sahifa(hammasi, s1.sahifalar);
  assert.ok(oxirgi.items.length >= 1 && oxirgi.items.length <= 10);
  // Sahifalar bir-birini takrorlamaydi va hammasini qamrab oladi
  const yigilgan = [];
  for (let k = 1; k <= s1.sahifalar; k++) yigilgan.push(...R.sahifa(hammasi, k).items.map((p) => p.id));
  assert.deepEqual(yigilgan, hammasi.map((p) => p.id));
});

test("sahifa chegaradan chiqmaydi", () => {
  assert.equal(R.sahifa(hammasi, 0).sahifa, 1);
  assert.equal(R.sahifa(hammasi, -5).sahifa, 1);
  assert.equal(R.sahifa(hammasi, 999).sahifa, R.sahifa(hammasi, 1).sahifalar);
  assert.equal(R.sahifa([], 1).sahifalar, 1);
  assert.equal(R.sahifa([], 1).items.length, 0);
});

test("qidiruv: nom, teg, manba kodi va qiyinlik bo'yicha", () => {
  const nomdan = R.filtr(hammasi, { qidiruv: "tarvuz" });
  assert.equal(nomdan.length, 1);
  assert.equal(nomdan[0].id, "cf-tarvuz");
  assert.ok(R.filtr(hammasi, { qidiruv: "4A" }).some((p) => p.manba && p.manba.kod === "4A"));
  assert.ok(R.filtr(hammasi, { qidiruv: "satr" }).every((p) => JSON.stringify(p).toLowerCase().includes("satr")));
  assert.equal(R.filtr(hammasi, { qidiruv: "bunday masala yoq" }).length, 0);
});

test("qidiruv katta-kichik harfga qaramaydi va bir nechta so'zni qo'llaydi", () => {
  assert.equal(R.filtr(hammasi, { qidiruv: "TARVUZ" }).length, 1);
  assert.equal(R.filtr(hammasi, { qidiruv: "tarvuz boʻlish" }).length, 1);
});

test("filtr: daraja, teg va qiyinlik", () => {
  const cf = R.filtr(hammasi, { daraja: "cf" });
  assert.equal(cf.length, bank.CF.length);
  assert.ok(cf.every((p) => p.rating >= 800 && p.rating <= 1200));
  const satr = R.filtr(hammasi, { teg: "satr" });
  assert.ok(satr.length > 0 && satr.every((p) => p.tags.includes("satr")));
  const q800 = R.filtr(hammasi, { qiyinlik: 800 });
  assert.ok(q800.length > 0 && q800.every((p) => p.rating === 800));
  assert.deepEqual(R.filtr(hammasi, { qiyinlik: "800" }), q800, "satr ko'rinishidagi qiymat ham ishlaydi");
  // Yangi "Olimpiada" darajasi filtrda va masalada ko'rinadi
  const olimpiada = R.filtr(hammasi, { daraja: "olimpiada" });
  assert.equal(olimpiada.length, bank.OLIMPIADA.length);
  assert.ok(olimpiada.every((p) => p.darajaNom === "Olimpiada" && p.rating >= 700 && p.rating <= 1400));
  assert.ok(R.darajalar().some((d) => d.id === "olimpiada" && d.nom === "Olimpiada"));
});

test("qiyinlik chegarasi: «500+» — 500 va undan yuqori", () => {
  for (const chegara of R.QIYINLIK_CHEGARALARI) {
    const r = R.filtr(hammasi, { qiyinlik: chegara + "+" });
    assert.equal(r.length, hammasi.filter((p) => p.rating >= chegara).length, chegara + "+");
    assert.ok(r.length > 0 && r.every((p) => p.rating >= chegara));
  }
  assert.equal(R.qiyinlikMos(500, "500+"), true);
  assert.equal(R.qiyinlikMos(450, "500+"), false);
  assert.equal(R.qiyinlikMos(450, ""), true);
  assert.equal(R.qiyinlikMos(800, "800"), true);
  assert.equal(R.qiyinlikMos(900, "800"), false);
  // Tanlovlar: avval chegaralar, keyin aniq reytinglar
  const tanlov = R.qiyinlikTanlovlari();
  assert.deepEqual(tanlov.slice(0, 3).map((q) => q.id), ["500+", "800+", "1000+"]);
  assert.equal(tanlov[0].nom, "Qiyinlik: 500+");
  assert.deepEqual(tanlov.slice(3).map((q) => q.id), R.qiyinliklar().map(String));
});

test("standart filtr «Qiyinlik: 500+»: birinchi sahifada oson masalalar turmaydi", () => {
  assert.equal(R.STANDART_QIYINLIK, "500+");
  const f = R.standartFiltr();
  assert.deepEqual(f, { qidiruv: "", daraja: "", teg: "", qiyinlik: "500+", holat: "", sahifa: 1 });
  const list = R.filtr(hammasi, f);
  assert.ok(list.every((p) => p.rating >= 500));
  const birinchi = R.sahifa(list, 1).items;
  assert.equal(birinchi.length, 10);
  assert.ok(!birinchi.some((p) => p.id === "yigindi"), "«Ikki son yigʻindisi» birinchi sahifada");
  assert.ok(birinchi.every((p) => p.daraja !== "oson"), "oson darajadagi masala birinchi sahifada");
  // Standart filtrda ham olimpiada masalalari bor, oson masalalar esa yo'qolmagan — "Tozalash" bilan ko'rinadi
  assert.ok(list.some((p) => p.daraja === "olimpiada"));
  const tozalangan = R.filtr(hammasi, { qidiruv: "", daraja: "", teg: "", qiyinlik: "", holat: "" });
  assert.equal(tozalangan.length, hammasi.length);
  assert.equal(tozalangan[0].rating, 100);
});

test("saqlangan filtr tekshiriladi: bankda yo'q qiymat bo'sh ro'yxatga olib kelmaydi", () => {
  assert.deepEqual(R.tozaFiltr({ daraja: "olimpiada", teg: "satr", qiyinlik: "800+", holat: "yechilmagan" }),
    { daraja: "olimpiada", teg: "satr", qiyinlik: "800+", holat: "yechilmagan" });
  assert.deepEqual(R.tozaFiltr({ daraja: "eski-daraja", teg: "yoq-teg", qiyinlik: "777", holat: "boshqa" }),
    { daraja: "", teg: "", qiyinlik: "", holat: "" });
  // Bola "Tozalash" ni bosgan: bo'sh qiyinlik saqlangan — standart filtr qaytib kelmaydi
  assert.deepEqual(R.tozaFiltr({ daraja: "", teg: "", qiyinlik: "", holat: "" }), { daraja: "", teg: "", qiyinlik: "", holat: "" });
  assert.deepEqual(R.tozaFiltr(null), { daraja: "", teg: "", qiyinlik: "", holat: "" });
  assert.equal(R.tozaFiltr({ qiyinlik: "1200" }).qiyinlik, "1200");
});

test("vazifa(): namuna + yashirin testlar, masalaning qadam chegarasi uzatiladi", () => {
  const p = R.bittasi("oraliq-sorovlar");
  const v = R.vazifa(p);
  assert.equal(v.tests.length, p.tests.length + 1);
  assert.deepEqual(v.tests[0], { stdin: p.namuna.stdin, out: p.namuna.out });
  assert.equal(v.qadam, 200000);
  assert.equal(R.vazifa(R.bittasi("yigindi")).qadam, null);
});

test("filtr: yechilgan va yechilmagan", () => {
  const holat = { "cf-tarvuz": { foiz: 100, yechilgan: true }, kvadrat: { foiz: 50, yechilgan: false } };
  const yechilgan = R.filtr(hammasi, { holat: "yechilgan" }, holat);
  assert.deepEqual(yechilgan.map((p) => p.id), ["cf-tarvuz"]);
  const yechilmagan = R.filtr(hammasi, { holat: "yechilmagan" }, holat);
  assert.ok(!yechilmagan.some((p) => p.id === "cf-tarvuz"));
  assert.ok(yechilmagan.some((p) => p.id === "kvadrat"), "chala yechilgani ham ro'yxatda qoladi");
});

test("filtrlar birga ishlaydi", () => {
  const r = R.filtr(hammasi, { daraja: "cf", teg: "matematika", qidiruv: "fil" });
  assert.equal(r.length, 1);
  assert.equal(r[0].id, "cf-fil");
});

test("filtr tanlovlari bankdan olinadi", () => {
  assert.deepEqual(R.darajalar().map((d) => d.id), bank.LEVELS.map((l) => l.id));
  assert.ok(R.teglar().every((t) => bank.TAGS.includes(t)));
  assert.ok(R.qiyinliklar().includes(800));
  assert.deepEqual(R.qiyinliklar(), [...R.qiyinliklar()].sort((a, b) => a - b));
});

test("bittasi(): id bo'yicha masala topiladi", () => {
  assert.equal(R.bittasi("cf-domino").title, "Nechta domino sigʻadi");
  assert.equal(R.bittasi("yoq-masala"), null);
});
