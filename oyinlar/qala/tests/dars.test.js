// Darslar va lugʻat ekranlarining sof qismlari: saqlash holati, variant/tartib tekshiruvi, byudjet narxi,
// tekshiruv natijasini bir shaklga keltirish, lugʻat filtri. Statik: fayllarda oddiy apostrof yoʻq.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const JS = path.join(__dirname, "../js");

// Brauzer skriptlarini yuklash uchun minimal oyna: ui.h chaqirilmaydi (ekran chizilmaydi), faqat sof qism tekshiriladi
function yasaOyna(storage) {
  const win = {
    QK: {
      ui: { h: () => { throw new Error("ekran testda chizilmaydi"); } },
      practice: {}, sound: {}, qalaUi: {},
      qala: { ATAMALAR: ATAMALAR },
      qalaDarsMantiq: {},
    },
    localStorage: storage,
  };
  loadScript(path.join(JS, "dars.js"), win);
  loadScript(path.join(JS, "lugat.js"), win);
  return win.QK;
}
// Xotira oʻrnida: oddiy obyekt yoki har chaqiruvda yiqiladigan (shaxsiy rejim)
function xotira() {
  const m = {};
  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, m };
}
const buzuqXotira = { getItem: () => { throw new Error("yoʻq"); }, setItem: () => { throw new Error("yoʻq"); } };

const ATAMALAR = [
  { id: "parol", uz: "parol", en: "password", ru: "пароль", izoh: "Kirish uchun sir soʻz.", dars: 1 },
  { id: "qopol", uz: "qoʻpol kuch", en: "brute force", ru: "перебор", izoh: "Hamma variantni sinash.", dars: 1 },
  { id: "xesh", uz: "xesh (iz)", en: "hash", ru: "хеш", izoh: "Paroldan hisoblanadigan son.", dars: 2 },
  { id: "shifr", uz: "shifr", en: "cipher", ru: "шифр", izoh: "Matnni oʻzgartirish qoidasi.", dars: 3 },
  { id: "oqshlyapa", uz: "oq shlyapa", en: "white hat", ru: "белая шляпа", izoh: "Ruxsat bilan tekshiruvchi.", dars: 5 },
];

// ---------- Holat (localStorage) ----------
test("holatniTuzat: har qanday yozuv 5 ta bool boʻladi", () => {
  const { sof } = yasaOyna(xotira()).qalaDars;
  assert.deepEqual(sof.holatniTuzat(null), { done: [false, false, false, false, false] });
  assert.deepEqual(sof.holatniTuzat({ done: [true] }), { done: [true, false, false, false, false] });
  assert.deepEqual(sof.holatniTuzat({ done: [1, "ha", true, false, true, true, true] }), { done: [false, false, true, false, true] });
  assert.deepEqual(sof.holatniTuzat("buzuq"), { done: [false, false, false, false, false] });
  assert.deepEqual(sof.holatHisobla([true, true, false, false, false]), { bajarildi: 2, jami: 5, tayyor: false });
  assert.deepEqual(sof.holatHisobla([true, true, true, true, true]), { bajarildi: 5, jami: 5, tayyor: true });
});

test("holat(): saqlangan darslar sanaladi, belgila() yozadi, kalit qala:dars:v1", () => {
  const st = xotira();
  const D = yasaOyna(st).qalaDars;
  assert.equal(D.KALIT, "qala:dars:v1");
  assert.deepEqual(D.holat(), { bajarildi: 0, jami: 5, tayyor: false });
  D.sof.belgila(0);
  D.sof.belgila(2);
  assert.deepEqual(JSON.parse(st.m["qala:dars:v1"]), { done: [true, false, true, false, false] });
  assert.deepEqual(D.holat(), { bajarildi: 2, jami: 5, tayyor: false });
  [1, 3, 4].forEach((k) => D.sof.belgila(k));
  assert.equal(D.holat().tayyor, true);
});

test("holat(): xotira yiqilsa (shaxsiy rejim) ham yiqilmaydi", () => {
  const D = yasaOyna(buzuqXotira).qalaDars;
  assert.deepEqual(D.holat(), { bajarildi: 0, jami: 5, tayyor: false });
  assert.doesNotThrow(() => D.sof.belgila(1));
  assert.deepEqual(D.sof.yukla(), { done: [false, false, false, false, false] });
});

test("holat(): xotirada buzuq JSON — boʻsh holat", () => {
  const st = xotira();
  st.setItem("qala:dars:v1", "{buzuq");
  assert.deepEqual(yasaOyna(st).qalaDars.holat(), { bajarildi: 0, jami: 5, tayyor: false });
});

// ---------- Darslar matni ----------
test("DARSLAR: 5 dars, har birida 3 mashq (d1a…d5c), 2 qoida, maqsad bilan boshlanadi", () => {
  const D = yasaOyna(xotira()).qalaDars;
  assert.equal(D.DARSLAR.length, 5);
  assert.deepEqual(D.NOMLAR, ["Parol", "Qulf", "Shifr", "Xat", "Oq shlyapa"]);
  D.DARSLAR.forEach((d, i) => {
    assert.deepEqual(d.mashqlar.map((m) => m.gen), ["a", "b", "c"].map((x) => `d${i + 1}${x}`), d.nom);
    assert.equal(d.qoidalar.length, 2, d.nom);
    assert.match(d.maqsad, /^Maqsad:/, d.nom);
    assert.ok(d.izoh && d.devor && d.atamalar.length >= 3, d.nom);
    d.mashqlar.forEach((m) => assert.ok(m.korsatma.length > 10, m.gen));
  });
  // Hamma matn: oddiy apostrof yoʻq, oʻ/gʻ tutuq belgisi bilan emas, «Barakalla» yoʻq (kattalar ohangi)
  const matnlar = [];
  D.DARSLAR.forEach((d) => { matnlar.push(d.nom, d.izoh, d.maqsad, d.devor, ...d.qoidalar, ...d.mashqlar.map((m) => m.korsatma)); });
  for (const s of matnlar) {
    assert.ok(!/['‘’`´]/.test(s), `notoʻgʻri apostrof: «${s}»`);
    assert.ok(!/[oOgG]ʼ/.test(s), `oʻ/gʻ tutuq belgisi bilan: «${s}»`);
    assert.ok(!/barakalla/i.test(s), `«Barakalla»: «${s}»`);
  }
});

// ---------- Variant va tartib ----------
test("variantMos: satr, {id}, {togri}, indeks — va boʻsh javob hech narsaga mos emas", () => {
  const { sof } = yasaOyna(xotira()).qalaDars;
  const satrlar = ["olma", "tosh", "17576", "qush"];
  assert.equal(sof.variantMos("tosh", satrlar, 1), true);
  assert.equal(sof.variantMos("tosh", satrlar, 0), false);
  assert.equal(sof.variantMos(17576, satrlar, 2), true, "son javob — matn bilan solishtiriladi");
  assert.equal(sof.variantMos(2, satrlar, 2), true, "indeks (variantlar orasida 2 yoʻq)");
  assert.equal(sof.variantMos(2, satrlar, 1), false);
  const obyektlar = [{ id: "a", matn: "Ha" }, { id: "b", matn: "Yoʻq" }];
  assert.equal(sof.variantMos("b", obyektlar, 1), true);
  assert.equal(sof.variantMos("Yoʻq", obyektlar, 1), true, "matn boʻyicha ham");
  assert.equal(sof.variantMos("b", obyektlar, 0), false);
  assert.equal(sof.variantMos(undefined, [{ matn: "x" }, { matn: "y" }], 0), false, "javob yoʻq — hech biri");
  assert.equal(sof.variantMos(undefined, [{ matn: "x" }, { matn: "y", togri: true }], 1), true, "togri belgisi");
  assert.equal(sof.javobMatni("b", obyektlar), "Yoʻq");
  assert.equal(sof.javobMatni("yoq", obyektlar), "yoq", "topilmasa — javobning oʻzi");
  assert.equal(sof.variantMatn({ id: "x", nom: "Nom" }), "Nom");
  assert.equal(sof.variantQiymat({ id: "x", nom: "Nom" }), "x");
  assert.equal(sof.variantQiymat("satr"), "satr");
});

test("tartibTogri: faqat bir xil tartib, uzunlik teng, 1 va \"1\" bir xil", () => {
  const { sof } = yasaOyna(xotira()).qalaDars;
  assert.equal(sof.tartibTogri(["p1", "p2", "p3"], ["p1", "p2", "p3"]), true);
  assert.equal(sof.tartibTogri(["p1", "p2", "p3"], ["p2", "p1", "p3"]), false);
  assert.equal(sof.tartibTogri(["p1", "p2", "p3"], ["p1", "p2"]), false);
  assert.equal(sof.tartibTogri([2, 0, 1], ["2", "0", "1"]), true);
  assert.equal(sof.tartibTogri(null, []), false);
});

test("uzunlik: raqam klaviaturasi javobdan bitta uzun, 3..12", () => {
  const { sof } = yasaOyna(xotira()).qalaDars;
  assert.equal(sof.uzunlik(7), 3);
  assert.equal(sof.uzunlik(456976), 7);
  assert.equal(sof.uzunlik("208827064576"), 12);
});

// ---------- Byudjet ----------
const DEVORLAR = [
  { id: "parol", nom: "Parol", tanlov: [{ id: "karta", nom: "Kartalardan", narx: 0 }] },
  { id: "qulf", nom: "Qulf", tanlov: [{ id: "tuzsiz", nom: "Tuzsiz", narx: 0 }, { id: "tuz", nom: "Tuz", narx: 3 }] },
  { id: "shifr", nom: "Shifr", tanlov: [{ id: "sezar", nom: "Sezar", narx: 0 }, { id: "kalitli", nom: "Kalitli", narx: 4 }] },
  { id: "ikki", nom: "Ikki qadam", tanlov: [{ id: "yoq", nom: "Yoʻq", narx: 0 }, { id: "bor", nom: "Bor", narx: 2 }] },
];

test("byudjetNarx: tanlangan variantlar narxi yigʻiladi, nomaʼlum tanlov — 0", () => {
  const { sof } = yasaOyna(xotira()).qalaDars;
  assert.equal(sof.byudjetNarx({ parol: "karta", qulf: "tuz", shifr: "kalitli", ikki: "bor" }, DEVORLAR), 9);
  assert.equal(sof.byudjetNarx({ parol: "karta", qulf: "tuzsiz", shifr: "sezar" }, DEVORLAR), 0);
  assert.equal(sof.byudjetNarx({ qulf: "yoq-bunday" }, DEVORLAR), 0);
  assert.equal(sof.byudjetNarx({}, []), 0);
});

test("natijaNormal: roʻyxat, devor boʻyicha obyekt, ok berilmasa — hammasi turdi va byudjetda", () => {
  const { sof } = yasaOyna(xotira()).qalaDars;
  const a = sof.natijaNormal({ ok: false, devorlar: [{ id: "parol", turdi: true, sabab: "kuchli" }, { id: "qulf", turdi: false, sabab: "tuz yoʻq" }] }, DEVORLAR, 3, 10);
  assert.equal(a.ok, false);
  assert.deepEqual(a.devorlar.qulf, { turdi: false, sabab: "tuz yoʻq" });
  assert.equal(a.narx, 3);
  const b = sof.natijaNormal({ parol: { holat: "turdi", sabab: "" }, qulf: { holat: "turdi" } }, DEVORLAR, 3, 10);
  assert.equal(b.ok, true, "ok berilmagan — hammasi turdi");
  const c = sof.natijaNormal([{ devor: "parol", turdi: true }], DEVORLAR, 11, 10);
  assert.equal(c.ok, false, "byudjetdan oshgan");
  const d = sof.natijaNormal({ ok: true, narx: 5, natija: [{ id: "parol", turdi: true }] }, DEVORLAR, 0, 10);
  assert.equal(d.ok, true);
  assert.equal(d.narx, 5, "mantiq bergan narx ustun");
  assert.deepEqual(sof.natijaNormal(null, DEVORLAR, 0, 10), { ok: false, narx: 0, devorlar: {} });
  assert.equal(sof.natijaNormal({}, DEVORLAR, 0, 10).ok, false, "devor yoʻq — toʻgʻri deb hisoblanmaydi");
});

// ---------- Lugʻat ----------
test("lugʻat filtri: uch tilda, katta-kichik harfsiz, apostrof turidan qatʼi nazar; boʻsh — hammasi", () => {
  const { sof } = yasaOyna(xotira()).qalaLugat;
  assert.equal(sof.filtrla(ATAMALAR, "").length, ATAMALAR.length);
  assert.deepEqual(sof.filtrla(ATAMALAR, "PASS").map((a) => a.id), ["parol"]);
  assert.deepEqual(sof.filtrla(ATAMALAR, "шифр").map((a) => a.id), ["shifr"]);
  assert.deepEqual(sof.filtrla(ATAMALAR, "qo'pol").map((a) => a.id), ["qopol"], "oddiy apostrof bilan yozilsa ham topadi");
  assert.deepEqual(sof.filtrla(ATAMALAR, "qopol").map((a) => a.id), ["qopol"], "apostrofsiz ham");
  assert.deepEqual(sof.filtrla(ATAMALAR, "Oq ").map((a) => a.id), ["oqshlyapa"]);
  assert.deepEqual(sof.filtrla(ATAMALAR, "yoq-bunday"), []);
  assert.ok(!sof.filtrla(ATAMALAR, "sir").some((a) => a.id === "parol"), "izoh boʻyicha qidirilmaydi — faqat uch til");
});

test("lugʻat guruhlari: dars boʻyicha, oʻsish tartibida, nomi bilan", () => {
  const { sof } = yasaOyna(xotira()).qalaLugat;
  const g = sof.guruhla(ATAMALAR.slice().reverse(), ["Parol", "Qulf", "Shifr", "Xat", "Oq shlyapa"]);
  assert.deepEqual(g.map((x) => [x.dars, x.nom, x.atamalar.length]), [[1, "Parol", 2], [2, "Qulf", 1], [3, "Shifr", 1], [5, "Oq shlyapa", 1]]);
  assert.deepEqual(sof.guruhla([], []), []);
});

// ---------- Statik: fayllarda oddiy apostrof yoʻq ----------
test("dars.js va lugat.js: satrlarda oddiy apostrof yoʻq (izohlar hisobga olinmaydi)", () => {
  for (const f of ["dars.js", "lugat.js"]) {
    const kod = fs.readFileSync(path.join(JS, f), "utf8").replace(/\/\/.*$/gm, "");
    assert.ok(!/['‘’]/.test(kod), `${f}: satrda oddiy apostrof bor`);
    assert.ok(!/apprentice/.test(kod), `${f}: shogird ishlatilmaydi`);
    assert.ok(!/[oOgG]ʼ/.test(kod), `${f}: oʻ/gʻ tutuq belgisi bilan yozilgan`);
  }
});
