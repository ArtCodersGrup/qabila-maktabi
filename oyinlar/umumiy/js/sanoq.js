// Sanoq tizimlari — sof hisob (17–22-o'yinlar uchun umumiy): tizimdan tizimga o'tish,
// xona qiymatlari, bo'lib-bo'lib o'tish qadamlari va ustunda qo'shish, ayirish, ko'paytirish.
// Sonlar satr ko'rinishida ("1011", "7E"). Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const DIGITS = "0123456789ABCDEF";
  const SUBS = "₀₁₂₃₄₅₆₇₈₉";

  const digitValue = (ch) => DIGITS.indexOf(String(ch).toUpperCase());
  const digitChar = (v) => DIGITS[v];

  function toBase(n, b) {
    if (n === 0) return "0";
    let s = "";
    for (let x = n; x > 0; x = Math.floor(x / b)) s = DIGITS[x % b] + s;
    return s;
  }

  const fromBase = (s, b) => [...s].reduce((acc, ch) => acc * b + digitValue(ch), 0);

  // Har bir raqam 0 … b−1 oralig'ida bo'lishi kerak
  const valid = (s, b) => s.length > 0 && [...s].every((ch) => {
    const v = digitValue(ch);
    return v >= 0 && v < b;
  });

  // Asos belgisi: 101₂, 7E₁₆
  const sub = (b) => [...String(b)].map((d) => SUBS[+d]).join("");
  const fmt = (s, b) => s + sub(b);

  // Bosh nollarsiz, katta harflar bilan: "00a" → "A"
  const clean = (s) => String(s).toUpperCase().replace(/^0+(?=.)/, "");

  // Xona qiymatlari o'ngdan chapga: 1, b, b², …
  const places = (b, k) => Array.from({ length: k }, (_, i) => b ** i);

  // Yoyib yozish: har raqam, uning qiymati va xona qiymati (chapdan o'ngga)
  const expand = (s, b) => [...s].map((ch, i) => ({ digit: ch, value: digitValue(ch), place: b ** (s.length - 1 - i) }));

  // Bo'lib-bo'lib o'tish: har qadamda n : b = q, qoldiq r (qoldiqlar pastdan yuqoriga o'qiladi)
  function divSteps(n, b) {
    const steps = [];
    let x = n;
    do {
      steps.push({ n: x, q: Math.floor(x / b), r: x % b });
      x = Math.floor(x / b);
    } while (x > 0);
    return steps;
  }

  // i-ustun raqami (o'ngdan, 0 — birlar); yo'q bo'lsa 0
  const digitAt = (s, i) => (i < s.length ? digitValue(s[s.length - 1 - i]) : 0);

  // Ustunda qo'shish. cols — o'ngdan chapga: {x, y, carryIn, total, digit, carryOut}
  function addColumns(a, c, b) {
    const cols = [];
    let carry = 0;
    const n = Math.max(a.length, c.length);
    for (let i = 0; i < n; i++) {
      const x = digitAt(a, i);
      const y = digitAt(c, i);
      const total = x + y + carry;
      cols.push({ x, y, carryIn: carry, total, digit: total % b, carryOut: total >= b ? 1 : 0 });
      carry = total >= b ? 1 : 0;
    }
    let result = cols.map((col) => DIGITS[col.digit]).reverse().join("");
    if (carry) result = "1" + result;
    return { result: clean(result), cols };
  }

  // Ustunda ayirish (a ≥ c). cols: {x, y, borrowIn, top, borrowOut, digit}; top — qarz bilan yuqoridagi raqam
  function subColumns(a, c, b) {
    const cols = [];
    let borrow = 0;
    for (let i = 0; i < a.length; i++) {
      const x = digitAt(a, i);
      const y = digitAt(c, i);
      let top = x - borrow;
      const borrowOut = top < y ? 1 : 0;
      if (borrowOut) top += b;
      cols.push({ x, y, borrowIn: borrow, top, borrowOut, digit: top - y });
      borrow = borrowOut;
    }
    return { result: clean(cols.map((col) => DIGITS[col.digit]).reverse().join("")), cols };
  }

  // Bir xonali songa ko'paytirish. cols: {x, carryIn, total, digit, carryOut}
  function mulDigit(a, d, b) {
    const cols = [];
    let carry = 0;
    for (let i = 0; i < a.length; i++) {
      const x = digitAt(a, i);
      const total = x * d + carry;
      cols.push({ x, carryIn: carry, total, digit: total % b, carryOut: Math.floor(total / b) });
      carry = Math.floor(total / b);
    }
    let result = cols.map((col) => DIGITS[col.digit]).reverse().join("");
    if (carry) result = toBase(carry, b) + result;
    return { result: clean(result), cols };
  }

  // Ikkilikda ko'paytirish: ko'paytuvchining har bir 1-biti uchun surilgan qator, keyin qo'shiladi
  function mulBinary(a, c) {
    const rows = [...c].reverse().map((bit, i) => (bit === "1" ? a + "0".repeat(i) : "0"));
    const total = rows.reduce((sum, row) => sum + fromBase(row, 2), 0);
    return { rows, result: toBase(total, 2) };
  }

  // ---------- Ustunda bosqichma-bosqich hisoblash qadamlari (20–22-o'yinlar) ----------
  // Har qadam: { i (o'ngdan ustun), digit (yoziladigan raqam), say (savol), hint (1-xatodan keyin),
  //   carry: { i, text } (ko'chish yoki qarz yozuvi), mark (qarz bergan ustun) }
  // Harfli raqam izohda qiymati bilan: "A(10)"
  const dv = (v) => (v >= 10 ? `${DIGITS[v]}(${v})` : String(v));

  function stepsAdd(a, c, b) {
    const { cols } = addColumns(a, c, b);
    const steps = cols.map((col, i) => {
      const expr = `${dv(col.x)} + ${dv(col.y)}${col.carryIn ? " + 1" : ""} = ${col.total}`;
      return {
        i,
        digit: DIGITS[col.digit],
        say: `${expr}. Qaysi raqamni yozamiz?`,
        hint: col.carryOut
          ? `${col.total} ≥ ${b}: ${col.total} − ${b} = ${col.digit} ni yoz, 1 ni koʻchir.`
          : `${col.total} < ${b}: shuni yoz — ${DIGITS[col.digit]}.`,
        carry: col.carryOut ? { i: i + 1, text: "1" } : null,
      };
    });
    const last = cols[cols.length - 1];
    if (last.carryOut) {
      steps.push({ i: cols.length, digit: "1", say: "Oxirgi koʻchgan 1 ni yangi xonaga yozamiz.", hint: "Koʻchgan 1 — yangi xonaga.", carry: null });
    }
    return steps;
  }

  function stepsSub(a, c, b) {
    const { cols, result } = subColumns(a, c, b);
    return cols.slice(0, result.length).map((col, i) => {
      const before = col.x - col.borrowIn;
      const gave = col.borrowIn ? `Bu xona qarz berdi: ${dv(col.x)} − 1 = ${before}. ` : "";
      const say = col.borrowOut
        ? `${gave}${before} dan ${dv(col.y)} ni ayirib boʻlmaydi — chapdan qarz: ${before} + ${b} = ${col.top}. ${col.top} − ${col.y} = ?`
        : `${gave}${before} − ${dv(col.y)} = ?`;
      return {
        i,
        digit: DIGITS[col.digit],
        say,
        hint: `${col.top} − ${col.y} = ${col.digit}${col.digit >= 10 ? ` — bu ${DIGITS[col.digit]}` : ""}.`,
        carry: col.borrowOut ? { i, text: `+${b}` } : null,
        mark: col.borrowOut ? i + 1 : null,
      };
    });
  }

  function stepsMul(a, d, b) {
    const { cols, result } = mulDigit(a, d, b);
    const steps = cols.map((col, i) => ({
      i,
      digit: DIGITS[col.digit],
      say: `${dv(col.x)} × ${d}${col.carryIn ? ` + ${col.carryIn}` : ""} = ${col.total}. Qaysi raqamni yozamiz?`,
      hint: col.carryOut
        ? `${col.total} = ${col.carryOut}·${b} + ${col.digit} → ${DIGITS[col.digit]} ni yoz, ${col.carryOut} ni koʻchir.`
        : `${col.total} < ${b}: shuni yoz — ${DIGITS[col.digit]}.`,
      carry: col.carryOut ? { i: i + 1, text: String(col.carryOut) } : null,
    }));
    // Oxirgi ko'chish — yangi xona(lar)
    for (let i = cols.length; i < result.length; i++) {
      const ch = result[result.length - 1 - i];
      steps.push({ i, digit: ch, say: "Oxirgi koʻchganni yangi xonaga yozamiz.", hint: `Koʻchgan son — ${ch}.`, carry: null });
    }
    return steps;
  }

  const api = {
    DIGITS, digitValue, digitChar, toBase, fromBase, valid, sub, fmt, clean,
    places, expand, divSteps, digitAt, addColumns, subColumns, mulDigit, mulBinary,
    dv, stepsAdd, stepsSub, stepsMul,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.sanoq = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
