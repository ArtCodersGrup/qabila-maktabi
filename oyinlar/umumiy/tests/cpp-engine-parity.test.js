// Kichik C++ dvigateli HAQIQIY g++ bilan bir xil javob beradimi.
// Bu — blokning eng muhim testi: dvigatel yarim ishlasa, bola yolg'on natija ko'radi va
// olimpiadada boshqa javob oladi. Shuning uchun har dastur ikki marta ishga tushadi:
// bizning dvigatelda va haqiqiy kompilyatorda. Kompilyator yo'q mashinada test o'tkazib yuboriladi.
//
// Ishga tushirish: node --test oyinlar/umumiy/tests/cpp-engine-parity.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { CORPUS } = require("./cpp-corpus.js");
const G = require("./gpp.js");
const C = require("../js/cpp/cpp-run.js");

const bor = G.bormi();

test("g++ bo'lmasa, parity o'tkazib yuboriladi", () => {
  assert.ok(true, bor ? "g++ bor — " + CORPUS.length + " dastur solishtiriladi" : "g++ yo'q");
});

if (bor) {
  test("dvigatel va g++ bir xil chiqish beradi", { timeout: 300000 }, async () => {
    const ust = G.ustaxona();
    const farqlar = [];
    try {
      for (const { t, r } of await G.hammasi(ust, CORPUS, (x) => ({ kod: x.kod, kirish: x.kirish }))) {
        assert.ok(r.ok, t.id + ": g++ ishlamadi — " + r.xato + "\n" + t.kod);
        const bizniki = C.run(t.kod, { stdin: t.kirish || [] });
        assert.equal(bizniki.error, null, t.id + ": dvigatel xato berdi — " + JSON.stringify(bizniki.error));
        if (bizniki.out !== r.out) {
          farqlar.push(t.id + "\n  g++:      " + JSON.stringify(r.out) + "\n  dvigatel: " + JSON.stringify(bizniki.out));
        }
      }
    } finally {
      ust.tozala();
    }
    assert.deepEqual(farqlar, [], "g++ bilan farq qiladigan dasturlar:\n" + farqlar.join("\n"));
  });
}
