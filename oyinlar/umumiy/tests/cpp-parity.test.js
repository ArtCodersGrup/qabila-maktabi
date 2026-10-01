// C++ bloki: o'yin ichida yozib qo'yilgan chiqishlarni HAQIQIY kompilyator bilan solishtiradi.
//
// O'yinlarning o'qish qismida C++ kodi ishga tushmaydi — misolning chiqishi logic.js da
// hisoblanadi. Shu hisob rostligini faqat g++ tasdiqlay oladi. Kompilyator bo'lmagan
// mashinada test o'tkazib yuboriladi.
//
// Ishga tushirish (loyiha ildizida): node --test oyinlar/umumiy/tests/cpp-parity.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const G = require("./gpp.js");

const ROOT = path.join(__dirname, "../../..");
const NAMUNA_SONI = 20; // har o'yindan nechta misol tekshiriladi

// C++ o'yinlari: papka nomi 54-cpp-... ko'rinishida va logic.js da namunalar() bor
function cppOyinlar() {
  return fs.readdirSync(path.join(ROOT, "oyinlar"))
    .filter((d) => /^\d\d-cpp-/.test(d))
    .map((d) => ({ dir: d, logic: require(path.join(ROOT, "oyinlar", d, "js/logic.js")) }))
    .filter((g) => typeof g.logic.namunalar === "function");
}

const bor = G.bormi();

test("g++ bo'lmasa, parity testi o'tkazib yuboriladi", () => {
  assert.ok(true, bor ? "g++ bor — misollar tekshiriladi" : "g++ yo'q — tekshirilmadi");
});

for (const oyin of bor ? cppOyinlar() : []) {
  test(oyin.dir + ": misollarning chiqishi haqiqiy g++ bilan bir xil", { timeout: 120000 }, async () => {
    const namunalar = oyin.logic.namunalar(NAMUNA_SONI);
    assert.ok(namunalar.length >= 8, "namunalar kam: " + namunalar.length);
    const ust = G.ustaxona();
    try {
      for (const { t, r } of await G.hammasi(ust, namunalar, (n) => ({ kod: n.kod, kirish: n.kirish }))) {
        assert.ok(r.ok, t.id + ": " + r.xato + "\n" + t.kod);
        assert.equal(r.out, t.chiqish.join("\n") + "\n", t.id + " — g++ boshqa javob berdi\n" + t.kod);
      }
    } finally {
      ust.tozala();
    }
  });
}
