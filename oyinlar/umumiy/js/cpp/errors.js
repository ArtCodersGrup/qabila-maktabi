// Kichik C++: xato turlari va bolaga tushunarli izohlar.
// Har xato: kind (compile/runtime/yoq/internal), cppMessage (kompilyator uslubidagi inglizcha xabar),
// line, col, hint (o'zbekcha izoh). Ekran kodi describe(err) bilan ko'rsatadi.
//
// Uch xil xato bor va ular bir xil emas:
//   compile — dastur ISHGA TUSHMAYDI (g++ ham shunday qiladi): ;, qavs, tanilmagan nom, tur mos emas
//   runtime — dastur ishlab turib to'xtadi (nolga bo'lish, qadam chegarasi)
//   yoq     — bu til imkoniyati yadroda yo'q (vector, sort, funksiya...). Yolg'on natija bermaymiz.
(function (root) {
  "use strict";

  class CppError extends Error {
    constructor(kind, cppMessage, extra) {
      super(kind + ": " + cppMessage);
      this.kind = kind;
      this.cppMessage = cppMessage;
      this.line = null;
      this.col = null;
      this.hint = "";
      Object.assign(this, extra || {});
    }
  }

  const err = (kind, message, extra) => new CppError(kind, message, extra);

  // — Kompilyatsiya xatolari (dastur umuman ishga tushmaydi) —

  const nuqtaliVergul = (extra) => err("compile", "expected ';' after expression", Object.assign({
    hint: "C++ da har buyruq nuqtali vergul bilan tugaydi.",
  }, extra));

  const kutilgan = (nima, extra) => err("compile", "expected '" + nima + "'", Object.assign({
    hint: "Shu yerda " + nima + " kutilgan edi.",
  }, extra));

  const tanilmagan = (nom, extra) => err("compile", "use of undeclared identifier '" + nom + "'", Object.assign({
    hint: "`" + nom + "` eʼlon qilinmagan. C++ da oʻzgaruvchi ishlatilishidan oldin turi bilan eʼlon qilinadi: int " + nom + " = 0;",
  }, extra));

  const qaytaElon = (nom, extra) => err("compile", "redefinition of '" + nom + "'", Object.assign({
    hint: "`" + nom + "` allaqachon eʼlon qilingan. Ikkinchi marta turini yozish shart emas.",
  }, extra));

  const turMos = (chap, ong, extra) => err("compile", "cannot assign '" + ong + "' to '" + chap + "'", Object.assign({
    hint: "Turlar mos emas: " + chap + " ga " + ong + " qiymati tushmaydi.",
  }, extra));

  const sintaksis = (message, extra) => err("compile", message, Object.assign({
    hint: "Satrni qayta oʻqi: qavslar yopilganmi, ; qoʻyilganmi?",
  }, extra));

  // — Ishlash vaqtidagi xatolar —

  const nolgaBolish = (extra) => err("runtime", "integer division by zero", Object.assign({
    hint: "Songa nolni boʻlib boʻlmaydi. Boʻluvchi nol emasligini oldin tekshir: if (b != 0).",
  }, extra));

  const qadamChegarasi = (steps, extra) => err("runtime", "too many steps (" + steps + ")", Object.assign({
    hint: "Dastur juda uzoq ishladi — sikl toʻxtamayotgan boʻlishi mumkin. Shartni tekshir.",
  }, extra));

  const kirishTugadi = (extra) => err("runtime", "no more input", Object.assign({
    hint: "cin oʻqimoqchi, lekin kiritiladigan maʼlumot tugadi. Nechta son berilganiga qara.",
  }, extra));

  const kirishSoni = (matn, extra) => err("runtime", "invalid input: '" + matn + "'", Object.assign({
    hint: "Son kutilgan edi, lekin «" + matn + "» keldi.",
  }, extra));

  // Massiv chegarasidan chiqish — C++ da ANIQLANMAGAN xatti-harakat.
  // Haqiqiy C++ xato bermaydi, buzuq javob chiqaradi. Buni taqlid qilish yolg'on bo'ladi,
  // shuning uchun ochiq aytamiz va to'xtaymiz.
  const chegaradanTashqari = (nom, i, boyi, extra) => err("runtime",
    "array index out of bounds: " + nom + "[" + i + "], size " + boyi, Object.assign({
      hint: "Massiv " + boyi + " ta katakdan iborat: " + nom + "[0] dan " + nom + "[" + (boyi - 1) + "] gacha. "
        + "Haqiqiy C++ da bu xato bermaydi — dastur ishlayveradi va javob buzuq chiqadi. "
        + "Shuning uchun bu yerda toʻxtatamiz.",
    }, extra));

  const qiymatsiz = (nom, extra) => err("runtime", "use of uninitialized variable '" + nom + "'", Object.assign({
    hint: "`" + nom + "` eʼlon qilingan, lekin qiymat berilmagan. Haqiqiy C++ da bu yerda tasodifiy son chiqadi — "
      + "shuning uchun avval qiymat ber: " + nom + " = 0;",
  }, extra));

  // Kasr sonni butunga aylantirish: inf, nan yoki turga sig'maydigan son — C++ da ANIQLANMAGAN
  // xatti-harakat (kompyuterga qarab har xil buzuq son chiqadi). Taqlid qilmaymiz, to'xtaymiz.
  const butungaSigmaydi = (qiymat, tur, extra) => err("runtime",
    "cannot convert " + qiymat + " to '" + tur + "'", Object.assign({
      hint: (qiymat === "inf" || qiymat === "-inf" || qiymat === "nan"
        ? "Kasr hisobning natijasi «" + qiymat + "» boʻldi (odatda 0.0 ga boʻlishdan chiqadi) — uni butun songa aylantirib boʻlmaydi. "
        : "Bu kasr son " + tur + " turiga sigʻmaydi. ")
        + "Haqiqiy C++ da bu yerda xato chiqmaydi — buzuq son chiqadi. Shuning uchun bu yerda toʻxtatamiz.",
    }, extra));

  // — Yadroda yo'q imkoniyat (o'qish qismida o'rganiladi) —

  const yoq = (nima, extra) => err("yoq", "not supported here: " + nima, Object.assign({
    hint: nima + " — bu yerda hali ishlamaydi. Oʻyinda uni oʻqiymiz, yozib ishga tushirish esa "
      + "haqiqiy kompilyatorda boʻladi.",
  }, extra));

  const ichki = (message) => err("internal", String(message), {
    hint: "Bu — saytning xatosi, sening kodingniki emas. Shu kodni oʻqituvchingga koʻrsat.",
  });

  // Ekran uchun: bitta joydan matn olinadi
  function describe(e) {
    const sarlavha = e.kind === "compile" ? "Kompilyatsiya xatosi"
      : e.kind === "yoq" ? "Bu yerda hali yoʻq"
        : e.kind === "internal" ? "Saytning xatosi" : "Ishlash vaqtidagi xato";
    const joy = e.line ? "a.cpp:" + e.line + (e.col ? ":" + e.col : "") + ": " : "";
    return {
      kind: e.kind,
      title: sarlavha,
      text: joy + "error: " + e.cppMessage,
      cppMessage: e.cppMessage,
      line: e.line || null,
      col: e.col || null,
      hint: e.hint || "",
    };
  }

  const api = {
    CppError, err, describe,
    nuqtaliVergul, kutilgan, tanilmagan, qaytaElon, turMos, sintaksis,
    nolgaBolish, qadamChegarasi, kirishTugadi, kirishSoni, chegaradanTashqari, qiymatsiz, butungaSigmaydi, yoq, ichki,
  };
  root.QK = root.QK || {};
  root.QK.cppEngine = Object.assign(root.QK.cppEngine || {}, { errors: api });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
