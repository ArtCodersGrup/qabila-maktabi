// Bankning C++ yechimlari HAQIQIY g++ da ham xuddi shu javobni beradimi.
// Yadroda ishlashi yetarli emas: bola bu kodni olimpiadada haqiqiy kompilyatorga beradi.
// Kompilyator yo'q mashinada test o'tkazib yuboriladi.
const test = require("node:test");
const assert = require("node:assert/strict");
const G = require("../../umumiy/tests/gpp.js");
const B = require("../js/baho.js");
const R = require("../js/royxat.js");
const { YECHIMLAR } = require("./cpp-yechimlar.js");

const bor = G.bormi();

test("g++ bo'lmasa, o'tkazib yuboriladi", () => {
  assert.ok(true, bor ? YECHIMLAR.length + " ta yechim tekshiriladi" : "g++ yo'q");
});

if (bor) {
  test("C++ yechimlari g++ da ham hamma testdan o'tadi", { timeout: 300000 }, async () => {
    // Har yechim uchun har bir test: (kod, kirish) juftligi
    const ishlar = [];
    for (const y of YECHIMLAR) {
      const task = R.vazifa(R.bittasi(y.id));
      for (const testCase of B.casesOf(task)) {
        ishlar.push({ id: y.id + " [" + (testCase.stdin || []).join(" ⏎ ") + "]", kod: y.kod,
          kirish: testCase.stdin || [], kutilgan: B.kutilgan(task, testCase) });
      }
    }
    const ust = G.ustaxona();
    try {
      for (const { t, r } of await G.hammasi(ust, ishlar, (x) => ({ kod: x.kod, kirish: x.kirish }))) {
        assert.ok(r.ok, t.id + ": " + r.xato);
        const chiqqan = r.out.replace(/\s+$/, "").split("\n");
        assert.deepEqual(chiqqan, t.kutilgan, t.id);
      }
    } finally {
      ust.tozala();
    }
  });
}
