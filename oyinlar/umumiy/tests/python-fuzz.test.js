// Tasodifiy dasturlar yasab, python3 bilan solishtiradi.
// Maqsad: qo'lda yozilgan korpus o'tkazib yuborgan farqlarni tutish (amallar tartibi, manfiy qoldiq, kasr chiqarish).
// Dasturlar albatta tugaydi: sikl chegaralari kichik, bo'luvchi hech qachon nol emas.
const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const py = require("../js/python/python.js");

function pythonAvailable() {
  try {
    execFileSync("python3", ["-c", "pass"], { stdio: "ignore" });
    return true;
  } catch { return false; }
}
const SKIP = pythonAvailable() ? false : "python3 topilmadi — solishtirish o'tkazib yuborildi";

// Takrorlanadigan tasodif: test har safar bir xil dasturlarni yasaydi
function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

function makeProgram(rnd) {
  const pick = (list) => list[Math.floor(rnd() * list.length)];
  const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const names = ["a", "b", "c"];
  const lines = [];

  const expr = (depth) => {
    if (depth <= 0 || rnd() < 0.3) return rnd() < 0.5 ? String(int(-9, 20)) : pick(names);
    const op = pick(["+", "-", "*", "//", "%", "+", "-"]);
    const left = expr(depth - 1);
    // bo'luvchi hech qachon nol bo'lmasin: butun va musbat literal
    const right = op === "//" || op === "%" ? String(int(1, 7)) : expr(depth - 1);
    return "(" + left + " " + op + " " + right + ")";
  };

  const cond = () => expr(1) + " " + pick(["<", "<=", ">", ">=", "==", "!="]) + " " + expr(1);

  const body = (indent, depth) => {
    const out = [];
    const n = int(1, 2);
    for (let k = 0; k < n; k++) out.push(...statement(indent, depth));
    return out;
  };

  const statement = (indent, depth) => {
    const pad = " ".repeat(indent);
    const kind = depth <= 0 ? pick(["set", "print"]) : pick(["set", "print", "if", "for", "while"]);
    if (kind === "set") return [pad + pick(names) + " " + pick(["=", "+=", "-=", "*="]) + " " + expr(2)];
    if (kind === "print") return [pad + "print(" + expr(2) + (rnd() < 0.4 ? ", " + expr(1) : "") + ")"];
    if (kind === "if") {
      const out = [pad + "if " + cond() + ":", ...body(indent + 4, depth - 1)];
      if (rnd() < 0.5) out.push(pad + "else:", ...body(indent + 4, depth - 1));
      return out;
    }
    if (kind === "for") {
      const start = int(0, 3);
      return [pad + "for i in range(" + start + ", " + (start + int(1, 4)) + "):", ...body(indent + 4, depth - 1)];
    }
    const counter = "k" + int(1, 9);
    return [
      pad + counter + " = " + int(1, 5),
      pad + "while " + counter + " > 0:",
      ...body(indent + 4, depth - 1),
      " ".repeat(indent + 4) + counter + " -= 1",
    ];
  };

  for (const name of names) lines.push(name + " = " + int(-5, 15));
  const n = int(2, 4);
  for (let k = 0; k < n; k++) lines.push(...statement(0, 2));
  lines.push("print(a, b, c)");
  return lines.join("\n");
}

test("tasodifiy dasturlar python3 dagidek ishlaydi", { skip: SKIP }, () => {
  const rnd = rngFrom(20260929);
  for (let k = 0; k < 120; k++) {
    const code = makeProgram(rnd);
    const mine = py.run(code, { maxSteps: 500000 });
    let real;
    try {
      real = execFileSync("python3", ["-I", "-c", code], {
        encoding: "utf8", timeout: 10000, stdio: ["pipe", "pipe", "pipe"],
      });
    } catch (e) {
      // python3 ham xato bersa (masalan juda katta son), bu dastur solishtirishga yaramaydi
      continue;
    }
    assert.equal(mine.error, null, `${k}-dastur bizda xato berdi:\n${code}\n${mine.error && mine.error.text}`);
    assert.equal(mine.out, real, `${k}-dastur chiqishi farq qildi:\n${code}`);
  }
});
