// C++ bloki: o'yin ichida yozib qo'yilgan chiqishlarni HAQIQIY kompilyator bilan solishtiradi.
//
// O'yinlarda C++ kodi ishga tushmaydi — misolning chiqishi logic.js da hisoblanadi.
// Shu hisob rostligini faqat g++ tasdiqlay oladi. Kompilyator bo'lmagan mashinada test
// o'tkazib yuboriladi (hamma mashinada g++ bo'lishi shart emas).
//
// Ishga tushirish (loyiha ildizida): node --test oyinlar/umumiy/tests/cpp-parity.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const { execFile, execFileSync } = require("node:child_process");

const ROOT = path.join(__dirname, "../../..");
const NAMUNA_SONI = 12; // har o'yindan nechta misol tekshiriladi

function kompilyatorBor() {
  try {
    execFileSync("g++", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// C++ o'yinlari: papka nomi 54-cpp-... ko'rinishida va logic.js da namunalar() bor
function cppOyinlar() {
  return fs.readdirSync(path.join(ROOT, "oyinlar"))
    .filter((d) => /^\d\d-cpp-/.test(d))
    .map((d) => {
      const logic = require(path.join(ROOT, "oyinlar", d, "js/logic.js"));
      return { dir: d, logic };
    })
    .filter((g) => typeof g.logic.namunalar === "function");
}

function ishga(kod, kirish, ish) {
  const src = path.join(ish, "a.cpp");
  const bin = path.join(ish, "a.out");
  fs.writeFileSync(src, kod + "\n");
  return new Promise((resolve) => {
    execFile("g++", ["-std=c++17", "-O0", "-o", bin, src], (xato, _o, stderr) => {
      if (xato) return resolve({ ok: false, xato: "kompilyatsiya: " + String(stderr).split("\n")[0] });
      const bola = execFile(bin, (xato2, stdout) => {
        if (xato2) return resolve({ ok: false, xato: "ishga tushmadi: " + xato2.message.split("\n")[0] });
        resolve({ ok: true, chiqish: stdout });
      });
      bola.stdin.end((kirish || []).join("\n") + (kirish && kirish.length ? "\n" : ""));
    });
  });
}

const bor = kompilyatorBor();

test("g++ bo'lmasa, parity testi o'tkazib yuboriladi", () => {
  assert.ok(true, bor ? "g++ bor — misollar tekshiriladi" : "g++ yo'q — tekshirilmadi");
});

for (const oyin of bor ? cppOyinlar() : []) {
  test(oyin.dir + ": misollarning chiqishi haqiqiy g++ bilan bir xil", { timeout: 120000 }, async () => {
    const ish = fs.mkdtempSync(path.join(os.tmpdir(), "qabila-cpp-"));
    const namunalar = oyin.logic.namunalar(NAMUNA_SONI);
    assert.ok(namunalar.length >= 8, "namunalar kam: " + namunalar.length);
    try {
      // Bir vaqtda 8 tadan: ketma-ket qilinsa, har misol ~0.6 soniya oladi
      for (let k = 0; k < namunalar.length; k += 8) {
        const bolak = namunalar.slice(k, k + 8);
        const natijalar = await Promise.all(bolak.map((n, i) => {
          const uy = path.join(ish, "n" + (k + i));
          fs.mkdirSync(uy, { recursive: true });
          return ishga(n.kod, n.kirish, uy).then((res) => ({ n, res }));
        }));
        for (const { n, res } of natijalar) {
          assert.ok(res.ok, n.id + ": " + res.xato + "\n" + n.kod);
          const kutilgan = n.chiqish.join("\n") + "\n";
          assert.equal(res.chiqish, kutilgan, n.id + " — g++ boshqa javob berdi\n" + n.kod);
        }
      }
    } finally {
      fs.rmSync(ish, { recursive: true, force: true });
    }
  });
}
