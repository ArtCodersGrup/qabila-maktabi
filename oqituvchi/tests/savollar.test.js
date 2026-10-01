// O'qituvchi testlari: savollar banki buzuq bo'lsa, generator o'zi aytadi.
// Bu test shu tekshiruvni ishga tushiradi (python3 bo'lmasa — o'tkazib yuboriladi).
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");

const ROOT = path.join(__dirname, "../..");
const YASOVCHI = path.join(ROOT, "oqituvchi/test-yasa.py");

function pythonBormi() {
  try {
    execFileSync("python3", ["-c", "pass"], { stdio: "ignore" });
    return true;
  } catch (e) {
    return false;
  }
}
const SKIP = pythonBormi() ? false : "python3 topilmadi — o'qituvchi testlari o'tkazib yuborildi";
const ishga = (args) => execFileSync("python3", [YASOVCHI, ...args], { cwd: ROOT, encoding: "utf8" });

test("savollar banki tekshiruvdan o'tadi", { skip: SKIP }, () => {
  const chiqish = ishga(["--tekshir"]);
  assert.match(chiqish, /xato yoʻq/, chiqish);
  const m = /(\d+) ta blok, (\d+) ta savol/.exec(chiqish);
  assert.ok(m, chiqish);
  assert.ok(Number(m[1]) >= 10, "bloklar: " + m[1]);
  assert.ok(Number(m[2]) >= 150, "savollar: " + m[2]);
});

test("har blok fayli BLOK va savollar(q, M) beradi", () => {
  const dir = path.join(ROOT, "oqituvchi/savollar");
  const fayllar = fs.readdirSync(dir).filter((f) => f.endsWith(".py") && !f.startsWith("_"));
  assert.ok(fayllar.length >= 10, "blok fayllari: " + fayllar.length);
  for (const f of fayllar) {
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    assert.match(src, /^BLOK = \{/m, f + ": BLOK yo'q");
    assert.match(src, /^def savollar\(q, M\):/m, f + ": savollar(q, M) yo'q");
    assert.match(src, /"id": "([a-z]+)"/, f);
  }
});

test("blok nomlari bosh sahifadagi bo'limlarga mos", () => {
  const { loadScript } = require("../../oyinlar/umumiy/tests/helpers.js");
  const win = {};
  loadScript(path.join(ROOT, "bosh/js/bosh-art.js"), win);
  loadScript(path.join(ROOT, "bosh/js/bosh.js"), win);
  const bolimlar = new Set(win.QK.bosh.SECTIONS.map((s) => s.id));
  const dir = path.join(ROOT, "oqituvchi/savollar");
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".py"))) {
    const id = /"id": "([a-z]+)"/.exec(fs.readFileSync(path.join(dir, f), "utf8"))[1];
    // "ikkilik" va "sanoq" bosh sahifada birlashgan — ikkalasi ham bo'lim sifatida qabul qilinadi
    assert.ok(bolimlar.has(id) || ["sanoq", "ikkilik"].includes(id), f + ": «" + id + "» bo'lim yo'q");
  }
});

test("test yasaladi: savollar, kalit va izohlar bir xil sonda", { skip: SKIP }, () => {
  const vaqtli = path.join(ROOT, "oqituvchi/.sinov.html");
  ishga(["--blok", "python", "--soni", "8", "--chiqish", "oqituvchi/.sinov.html"]);
  const html = fs.readFileSync(vaqtli, "utf8");
  fs.unlinkSync(vaqtli);
  const savollar = html.match(/<div class="matn">/g) || [];
  const kalit = html.match(/<td><b>\d+<\/b>/g) || [];
  assert.equal(savollar.length, 8, "savollar soni");
  assert.equal(kalit.length, 8, "kalitdagi javoblar soni");
  // Har savolda to'rtta variant
  const variantlar = html.match(/<span class="harf">/g) || [];
  assert.equal(variantlar.length, 32);
});

test("ikki variant har xil bo'ladi", { skip: SKIP }, () => {
  const yol = (h) => path.join(ROOT, "oqituvchi/.sinov-" + h + ".html");
  ishga(["--blok", "kombinatorika", "--soni", "10", "--variant", "2", "--chiqish", "oqituvchi/.sinov.html"]);
  const a = fs.readFileSync(yol("A"), "utf8");
  const b = fs.readFileSync(yol("B"), "utf8");
  for (const h of ["A", "B"]) fs.unlinkSync(yol(h));
  const kalit = (s) => (s.match(/<td><b>\d+<\/b> ([ABCD])<\/td>/g) || []).join("");
  assert.notEqual(kalit(a), kalit(b), "ikki variantning javoblar kaliti bir xil chiqdi");
});
