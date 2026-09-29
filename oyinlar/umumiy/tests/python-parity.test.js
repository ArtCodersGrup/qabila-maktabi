// Kichik Python haqiqiy python3 bilan bir xil ishlashini tekshiradi.
// Korpusdagi har bir dastur ikkalasida bajariladi va chiqish belgi-belgi solishtiriladi.
// python3 topilmasa, testlar o'tkazib yuboriladi (qolgan testlar baribir ishlaydi).
const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const py = require("../js/python/python.js");
const { PROGRAMS, ERRORS } = require("./python-corpus.js");

function pythonAvailable() {
  try {
    execFileSync("python3", ["-c", "pass"], { stdio: "ignore" });
    return true;
  } catch { return false; }
}

const SKIP = pythonAvailable() ? false : "python3 topilmadi — solishtirish o'tkazib yuborildi";

// python3 da bajarish: chiqish va (xato bo'lsa) xato turi
function runPython3(code, stdin) {
  const input = (stdin || []).map((s) => s + "\n").join("");
  try {
    const out = execFileSync("python3", ["-I", "-c", code], { input, encoding: "utf8", timeout: 10000, stdio: ["pipe", "pipe", "pipe"] });
    return { out, type: null };
  } catch (e) {
    const stderr = String(e.stderr || "");
    const last = stderr.trim().split("\n").filter(Boolean).pop() || "";
    const m = /^([A-Za-z_]+Error)\b/.exec(last);
    return { out: String(e.stdout || ""), type: m ? m[1] : "?" + last };
  }
}

test("korpusdagi dasturlar python3 dagidek chiqish beradi", { skip: SKIP }, () => {
  for (const p of PROGRAMS) {
    const mine = py.run(p.code, { stdin: p.stdin });
    const real = runPython3(p.code, p.stdin);
    assert.equal(real.type, null, `${p.name}: python3 da xato — korpus noto'g'ri`);
    assert.equal(mine.error, null, `${p.name}: bizda xato — ${mine.error && mine.error.text}`);
    assert.equal(mine.out, real.out, `${p.name}: chiqish farq qildi`);
  }
});

test("xato holatlarida xato turi python3 dagidek", { skip: SKIP }, () => {
  for (const p of ERRORS) {
    const mine = py.run(p.code, { stdin: p.stdin });
    const real = runPython3(p.code, p.stdin);
    assert.ok(mine.error, `${p.name}: bizda xato bo'lmadi`);
    assert.equal(real.type, p.type, `${p.name}: korpusdagi kutilgan tur python3 ga mos emas`);
    assert.equal(mine.error.type, real.type, `${p.name}: xato turi farq qildi`);
    assert.equal(mine.out, real.out, `${p.name}: xatogacha chiqqan matn farq qildi`);
  }
});
