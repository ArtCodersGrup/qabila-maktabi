// Bolaning holati: foiz, yechilgani, ochilgan yashirin testlar va filtr tanlovi.
// Brauzer xotirasi o'rniga oddiy soxta localStorage ishlatiladi.
const test = require("node:test");
const assert = require("node:assert/strict");

const ombor = new Map();
let buzuq = false; // true bo'lsa — xotira ishlamaydi (maxfiy rejim)
const soxta = {
  getItem: (k) => { if (buzuq) throw new Error("yopiq"); return ombor.has(k) ? ombor.get(k) : null; },
  setItem: (k, v) => { if (buzuq) throw new Error("yopiq"); ombor.set(k, String(v)); },
};
Object.defineProperty(globalThis, "localStorage", { value: soxta, configurable: true, writable: true });

const H = require("../js/holat.js");
const B = require("../js/baho.js");

test("boshida hech narsa yo'q", () => {
  assert.deepEqual(H.biri("yigindi"), { foiz: 0, yechilgan: false, urinish: 0, ochilgan: [] });
  assert.deepEqual(H.hammasi(), {});
  assert.equal(H.filtrOqi(), null, "filtr hali tanlanmagan — ekran standart filtrni qo'yadi");
});

test("eng yaxshi foiz tushib ketmaydi, yechilgani saqlanadi, urinishlar sanaladi", () => {
  H.belgila("yigindi", 75, false);
  H.belgila("yigindi", 50, false);
  assert.deepEqual(H.biri("yigindi"), { foiz: 75, yechilgan: false, urinish: 2, ochilgan: [] });
  H.belgila("yigindi", 100, true);
  H.belgila("yigindi", 0, false);
  assert.equal(H.biri("yigindi").yechilgan, true);
  assert.equal(H.biri("yigindi").foiz, 100);
  assert.deepEqual(H.yechilganlar(), ["yigindi"]);
});

test("ochilgan yashirin testlar eslab qolinadi va kamaymaydi", () => {
  H.belgila("tubmi", 20, false, [2, 3]);
  assert.deepEqual(H.biri("tubmi").ochilgan, [2, 3]);
  // Keyingi urinishda ro'yxat berilmasa yoki bo'sh bo'lsa — eskisi qoladi
  H.belgila("tubmi", 40, false);
  H.belgila("tubmi", 40, false, []);
  assert.deepEqual(H.biri("tubmi").ochilgan, [2, 3]);
  // Saqlangan narsa satr (JSON) — sahifa qayta ochilganda ham o'qiladi
  assert.deepEqual(JSON.parse(ombor.get(H.KEY)).tubmi.ochilgan, [2, 3]);
});

test("baho + holat birga: qotirib yozilgan javoblar yangi testni ochmaydi", () => {
  const masala = {
    id: "ikki-barobar", type: "kod-yoz", solution: "n = int(input())\nprint(n * 2)",
    tests: [{ stdin: ["3"], out: ["6"] }, { stdin: ["10"] }, { stdin: ["0"] }, { stdin: ["7"] }, { stdin: ["-4"] }, { stdin: ["50"] }, { stdin: ["9"] }],
  };
  const urin = (kod) => {
    const b = B.baho(masala, kod, "python", H.biri(masala.id).ochilgan);
    H.belgila(masala.id, b.foiz, b.toliq, b.ochilgan);
    return b;
  };
  assert.deepEqual(urin("print(6)").ochiqYiqilgan.map((t) => t.n), [2, 3]);
  const qotirilgan = "n = int(input())\nif n == 10:\n    print(20)\nelif n == 0:\n    print(0)\nelse:\n    print(6)";
  for (let k = 0; k < 3; k++) {
    const b = urin(qotirilgan);
    assert.deepEqual(b.ochiqYiqilgan, [], (k + 2) + "-urinishda yangi test ochildi");
    assert.equal(b.yopiqYiqilgan.length, 4);
  }
  assert.deepEqual(H.biri(masala.id).ochilgan, [2, 3]);
  assert.equal(urin(masala.solution).toliq, true);
});

test("filtr tanlovi saqlanadi: «Tozalash» dan keyin bo'sh qiyinlik ham eslab qolinadi", () => {
  H.filtrYoz({ qidiruv: "tarvuz", daraja: "olimpiada", teg: "", qiyinlik: "800+", holat: "", sahifa: 3 });
  // Qidiruv matni va sahifa saqlanmaydi — faqat filtrlar
  assert.deepEqual(H.filtrOqi(), { daraja: "olimpiada", teg: "", qiyinlik: "800+", holat: "" });
  H.filtrYoz({ daraja: "", teg: "", qiyinlik: "", holat: "" });
  assert.deepEqual(H.filtrOqi(), { daraja: "", teg: "", qiyinlik: "", holat: "" });
  assert.notEqual(H.filtrOqi(), null, "bo'sh filtr — bu ham tanlov (standartga qaytmaydi)");
});

test("buzilgan yozuv yoki xotirasiz brauzer sahifani yiqitmaydi", () => {
  ombor.set(H.KEY, "{buzuq json");
  assert.doesNotThrow(() => H.biri("yigindi"));
  ombor.set(H.FILTR_KEY, JSON.stringify({ daraja: 5, qiyinlik: ["x"] }));
  assert.deepEqual(H.filtrOqi(), { daraja: "", teg: "", qiyinlik: "", holat: "" });
  // Xotira umuman ishlamasa — shu sessiya ichida baribir eslab qoladi (zaxira)
  buzuq = true;
  assert.doesNotThrow(() => H.belgila("ekub", 60, false, [4]));
  assert.deepEqual(H.biri("ekub").ochilgan, [4]);
  assert.equal(H.biri("ekub").foiz, 60);
  H.filtrYoz({ qiyinlik: "1000+" });
  assert.equal(H.filtrOqi().qiyinlik, "1000+");
  buzuq = false;
  H.tozala();
  assert.deepEqual(H.hammasi(), {});
});
