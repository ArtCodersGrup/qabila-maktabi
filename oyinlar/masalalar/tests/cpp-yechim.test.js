// Masalalarni C++ da ham yechsa bo'ladimi — tests/cpp-yechimlar.js dagi yechimlar
// har bir testda ishga tushiriladi va 100% bo'lishi kerak.
// Kutilgan javob bankdagi Python yechimidan hisoblanadi — ya'ni ikki til bir xil javob beradi.
const test = require("node:test");
const assert = require("node:assert/strict");
const B = require("../js/baho.js");
const R = require("../js/royxat.js");
const { YECHIMLAR } = require("./cpp-yechimlar.js");

const bittasi = (id) => R.bittasi(id);

test("C++ yechimlari bank testlaridan to'liq o'tadi", () => {
  for (const y of YECHIMLAR) {
    const masala = bittasi(y.id);
    assert.ok(masala, y.id + ": bunday masala yo'q");
    const task = R.vazifa(masala);
    const b = B.baho(task, y.kod, "cpp");
    const yiqilgan = b.birinchiYiqilgan;
    assert.equal(b.toliq, true, y.id + ": " + b.foiz + "% — "
      + (yiqilgan ? (yiqilgan.error ? yiqilgan.error.text + " | " + yiqilgan.error.hint
        : "kirish " + JSON.stringify(yiqilgan.kirish) + " → kutilgan " + JSON.stringify(yiqilgan.kutilgan)
          + ", chiqqan " + JSON.stringify(yiqilgan.chiqqan)) : ""));
  }
});

test("buzilgan C++ yechimi to'liq ball olmaydi", () => {
  const y = YECHIMLAR[0];
  const task = R.vazifa(bittasi(y.id));
  const buzuq = y.kod.replace("a + b", "a - b");
  assert.equal(B.baho(task, buzuq, "cpp").toliq, false);
  // Kompilyatsiya xatosi ham ushlanadi va bolaga tushunarli xabar chiqadi
  const xato = B.baho(task, y.kod.replace(";", ""), "cpp");
  assert.equal(xato.toliq, false);
  assert.ok(xato.birinchiYiqilgan.error, "xato xabari bo'lishi kerak");
  assert.match(xato.birinchiYiqilgan.error.hint, /./);
});

test("har daraja uchun kamida bitta C++ yechimi bor", () => {
  const darajalar = new Set(YECHIMLAR.map((y) => bittasi(y.id).daraja));
  assert.ok(darajalar.size >= 3, "darajalar: " + [...darajalar].join(", "));
  assert.ok(YECHIMLAR.length >= 20, "yechimlar soni: " + YECHIMLAR.length);
});
