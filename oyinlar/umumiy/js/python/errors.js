// Kichik Python: xato turlari va bolaga tushunarli izohlar.
// Har bir xato: pyType (Pythondagi nomi), pyMessage (Pythonning xabari), line, col, hint (o'zbekcha izoh).
// Ekran kodi errors.describe(err) bilan ko'rsatadi. Test: umumiy/tests/python-errors.test.js
(function (root) {
  "use strict";

  class PyError extends Error {
    constructor(type, message, extra) {
      super(type + ": " + message);
      this.pyType = type;
      this.pyMessage = message;
      this.line = null;
      this.col = null;
      this.hint = "";
      Object.assign(this, extra || {});
    }
  }

  // Aniq izoh berilmagan xatolar ham izohsiz qolmasin
  const DEFAULT_HINTS = {
    TypeError: "Qiymatlarning turi mos emas: matn (str) va son (int) aralashib qolgan boʻlishi mumkin.",
    ValueError: "Qiymat bu amal uchun toʻgʻri kelmadi.",
    AttributeError: "Bu turda bunday metod yoʻq.",
    InternalError: "Bu — saytning xatosi, sening kodingniki emas.",
  };

  function err(type, message, extra) {
    const e = new PyError(type, message, extra);
    if (!e.hint && DEFAULT_HINTS[type]) e.hint = DEFAULT_HINTS[type];
    return e;
  }
  const at = (extra, more) => Object.assign({}, extra, more);

  // — Pythonning haqiqiy xatolari (xabar matni Python bilan bir xil) —

  const syntaxError = (message, extra) => err("SyntaxError", message, at(extra, {
    hint: (extra && extra.hint) || "Satrni qayta oʻqi: qavs yopilganmi, ikki nuqta qoʻyilganmi, qoʻshtirnoq juftmi?",
  }));

  const indentationError = (message, extra) => err("IndentationError", message, at(extra, {
    hint: (extra && extra.hint) || "Otstup — ichkariga surish — 4 boʻshliq boʻladi. Bir blokdagi satrlar bir xil surilishi kerak.",
  }));

  const nameError = (name, extra) => err("NameError", "name '" + name + "' is not defined", at(extra, {
    hint: "`" + name + "` nomli quti hali yoʻq. Uni yuqorida yaratdingmi? Matn boʻlsa, qoʻshtirnoq ichiga ol: \"" + name + "\".",
  }));

  const typeError = (message, extra) => err("TypeError", message, extra);

  const valueError = (message, extra) => err("ValueError", message, extra);

  const zeroDivisionError = (message, extra) => err("ZeroDivisionError", message, at(extra, {
    hint: "Nolga boʻlib boʻlmaydi. Boʻluvchi nolga aylanmasligini tekshir.",
  }));

  const indexError = (message, extra) => err("IndexError", message, at(extra, {
    hint: "Bunday oʻrin yoʻq. Indekslar 0 dan boshlanadi: oxirgisi — `len(a) - 1`.",
  }));

  const recursionError = (extra) => err("RecursionError", "maximum recursion depth exceeded", at(extra, {
    hint: "Funksiya oʻzini juda koʻp marta chaqirdi. Qachon toʻxtashini (`return`) tekshir.",
  }));

  const eofError = (extra) => err("EOFError", "EOF when reading a line", at(extra, {
    hint: "`input()` uchun maʼlumot qolmadi: kiritishda nechta satr boʻlsa, shunchaga `input()` yozish kerak.",
  }));

  // Matn va son qo'shilganda — eng ko'p uchraydigan xato, izohi ham eng muhimi
  const concatError = (type, otherType, extra) => typeError(
    "can only concatenate " + type + " (not \"" + otherType + "\") to " + type, at(extra, {
      hint: "Matn va sonni `+` bilan qoʻshib boʻlmaydi. Yo `str(...)` bilan sonni matnga oʻgir, yo `print(a, b)` bilan vergul orqali chiqar.",
    }));

  const operandError = (op, leftType, rightType, extra) => typeError(
    "unsupported operand type(s) for " + op + ": '" + leftType + "' and '" + rightType + "'", at(extra, {
      hint: "`" + leftType + "` va `" + rightType + "` ustida `" + op + "` amali ishlamaydi. Turlarni tekshir: `int(...)` yoki `str(...)` kerak boʻlishi mumkin.",
    }));

  const compareError = (op, leftType, rightType, extra) => typeError(
    "'" + op + "' not supported between instances of '" + leftType + "' and '" + rightType + "'", at(extra, {
      hint: "Matn bilan sonni solishtirib boʻlmaydi. `input()` matn qaytaradi — `int(input())` deb oʻgirish kerak.",
    }));

  // — Bizning xatolarimiz —

  // Qo'llanmagan sintaksis: bu "xato" emas, shuning uchun alohida turi va boshqa ohangi bor
  const notYet = (what, instead, extra) => err("NotYet", what, at(extra, {
    hint: instead
      ? "Haqiqiy Pythonda bu ishlaydi. Bu yerda shunday yozamiz: " + instead
      : "Haqiqiy Pythonda bu bor, lekin bu saytda hali yoʻq.",
  }));

  // Qadam, chuqurlik va chiqish chegaralari
  const limitError = (message, extra) => err("Limit", message, extra);

  // 200000 → "200 000": bolaga o'qilishi oson bo'lsin
  const spaced = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const stepLimit = (steps, extra) => limitError(
    spaced(steps) + " qadam bajarildi, dastur tugamadi", at(extra, {
      hint: "Sikl aylanishdan toʻxtamadi. Shart qachon yolgʻon boʻladi? Hisoblagich oʻzgaryaptimi?",
    }));

  const outputLimit = (lines, extra) => limitError(
    "chiqish " + spaced(lines) + " satrdan oshdi", at(extra, {
      hint: "Sikl ichida `print` juda koʻp marta ishladi. Sikl chegarasini tekshir.",
    }));

  // — Ko'rsatish —

  const TITLES = {
    NotYet: "Bu saytda hali yoʻq",
    Limit: "Toʻxtamadi",
  };

  // Chiqish panelida bir qatorda ko'rinadigan matn
  function format(e) {
    const place = e.line ? "  (" + e.line + "-satr)" : "";
    if (e.pyType === "NotYet") return "Bu saytda hali yoʻq: " + e.pyMessage + place;
    if (e.pyType === "Limit") return "Toʻxtamadi: " + e.pyMessage + place;
    return e.pyType + ": " + e.pyMessage + place;
  }

  function describe(e) {
    return {
      type: e.pyType,
      title: TITLES[e.pyType] || e.pyType,
      message: e.pyMessage,
      line: e.line || null,
      col: e.col || null,
      hint: e.hint || "",
      text: format(e),
    };
  }

  // Xato joyini ko'rsatuvchi o'q: kod satri ostiga qo'yiladi
  function pointer(srcLine, col) {
    if (!col || col < 1) return "";
    let out = "";
    for (let k = 0; k < col - 1; k++) out += srcLine && srcLine[k] === "\t" ? "\t" : " ";
    return out + "↑";
  }

  const api = {
    PyError, err, syntaxError, indentationError, nameError, typeError, valueError,
    zeroDivisionError, indexError, recursionError, eofError,
    concatError, operandError, compareError, notYet, limitError, stepLimit, outputLimit,
    format, describe, pointer,
  };

  root.QK = root.QK || {};
  root.QK.python = root.QK.python || {};
  root.QK.python.errors = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
