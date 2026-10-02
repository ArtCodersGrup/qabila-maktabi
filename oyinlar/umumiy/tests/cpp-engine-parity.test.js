// Kichik C++ dvigateli HAQIQIY g++ bilan bir xil javob beradimi.
// Bu — blokning eng muhim testi: dvigatel yarim ishlasa, bola yolg'on natija ko'radi va
// olimpiadada boshqa javob oladi. Shuning uchun har dastur ikki marta ishga tushadi:
// bizning dvigatelda va haqiqiy kompilyatorda. Kompilyator yo'q mashinada test o'tkazib yuboriladi.
//
// Ishga tushirish: node --test oyinlar/umumiy/tests/cpp-engine-parity.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { CORPUS, d } = require("./cpp-corpus.js");
const G = require("./gpp.js");
const C = require("../js/cpp/cpp-run.js");

const bor = G.bormi();
// gppsiz: bu mashinadagi kompilyatorda yo'q narsa (masalan macOS da <bits/stdc++.h>) — faqat dvigatelda sinaladi
const SOLISHTIRILADI = CORPUS.filter((t) => !t.gppsiz);

test("g++ bo'lmasa, parity o'tkazib yuboriladi", () => {
  assert.ok(true, bor ? "g++ bor — " + SOLISHTIRILADI.length + " dastur solishtiriladi" : "g++ yo'q");
});

if (bor) {
  test("dvigatel va g++ bir xil chiqish beradi", { timeout: 300000 }, async () => {
    const ust = G.ustaxona();
    const farqlar = [];
    try {
      for (const { t, r } of await G.hammasi(ust, SOLISHTIRILADI, (x) => ({ kod: x.kod, kirish: x.kirish }))) {
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

// Xato xabarlari ham g++ ga mos bo'lsin: bola saytda ko'rgan satr:ustun haqiqiy kompilyatorda
// ham o'sha joyni ko'rsatishi kerak — aks holda "xatoni topish" ko'nikmasi yolg'on bo'ladi.
const XATOLAR = [
  { id: "nuqtali-vergul", kod: d('cout << 5 << "\\n"') },
  { id: "tanilmagan-nom", kod: d('cout << x << "\\n";') },
  { id: "qayta-elon", kod: d("int a = 1;\nint a = 2;") },
  { id: "sikl-nomi-tashqarida", kod: d("for (int i = 0; i < 3; i++) cout << i;\ncout << i;") },
  { id: "qavs-yopilmagan", kod: "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << 1;\n" },
];

if (bor) {
  test("kompilyatsiya xatolari g++ bilan bir xil satr va ustunni ko'rsatadi", { timeout: 120000 }, async () => {
    const ust = G.ustaxona();
    try {
      for (const t of XATOLAR) {
        const gpp = await G.xatoMatni(ust, t.kod, t.id);
        const biz = C.check(t.kod);
        assert.ok(gpp, t.id + ": g++ xato bermadi — sinov dasturi buzuq emas");
        assert.ok(biz, t.id + ": bizning dvigatel xato bermadi");
        assert.equal(biz.text.replace("a.cpp:", ""), gpp, t.id);
      }
    } finally {
      ust.tozala();
    }
  });
}
