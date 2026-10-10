// Oʻyin ekranlarining sof qismlari: javob kodlari, narx hisobi, xat qismlari; matn qoidasi (oddiy ' yoʻq).
// oyin-ui.js brauzer fayli — soxta window bilan yuklanadi (DOM kerak boʻlgan ekranlar bu yerda chaqirilmaydi).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const P = require("../js/protokol.js");

const JS = path.join(__dirname, "..", "js");
const FAYLLAR = ["oyin-ui.js", "mashq.js", "protokol.js", "onlayn-qala.js"];

// Soxta QK.qala: faqat shu testlarga kerak boʻlgan qism
const Q = {
  BYUDJET: 10,
  KARTALAR: { soz: [{ id: "s1", matn: "olma" }], raqam: [{ id: "r1", matn: "7" }], belgi: [{ id: "b1", matn: "!" }] },
  karta: (id) => [{ id: "s1", matn: "olma", tur: "soz" }, { id: "r1", matn: "7", tur: "raqam" }].find((k) => k.id === id) || null,
  XAT_QISMLAR: { kimdan: [{ id: "k1", matn: "Bank" }], mavzu: [{ id: "m1", matn: "Hisob" }], havola: [{ id: "h1", matn: "qabilabank.uz" }], gap: [{ id: "g1", matn: "Salom" }], imzo: [{ id: "i1", matn: "Bank jamoasi" }] },
  himoyaNarxi: null,
};
function yukla() {
  const kod = fs.readFileSync(path.join(JS, "oyin-ui.js"), "utf8");
  const win = { QK: { ui: { h: () => { throw new Error("DOM yoʻq"); } }, sound: { play() {} }, qala: Q, qalaUi: {}, qalaProtokol: P } };
  new Function("window", "document", kod)(win, undefined);
  return win.QK.qalaOyinUi;
}

test("javob kodi: Q.hujum natijasi → qisqa kod → matn (✓ / ↻ bilan boshlanadi)", () => {
  const O = yukla();
  assert.equal(O.javobKodi("taxmin", { ok: true, natija: { togri: true } }), "1");
  assert.equal(O.javobKodi("taxmin", { ok: true, natija: { togri: false } }), "0");
  assert.equal(O.javobKodi("qopol", { ok: true, natija: { ochildi: true, soniya: 3 } }), "1");
  assert.equal(O.javobKodi("jadval", { ok: true, natija: { mumkin: false } }), "0");
  assert.equal(O.javobKodi("jadval", { ok: true, natija: { mumkin: true, ochildi: false } }), "2");
  assert.equal(O.javobKodi("jadval", { ok: true, natija: { mumkin: true, ochildi: true } }), "1");
  assert.equal(O.javobKodi("iz", { ok: true, natija: { hisobTogri: true, mos: true, ochildi: true } }), "h1m1o1");
  assert.equal(O.javobKodi("iz", { ok: true, natija: { hisobTogri: false } }), "h0m0o0");
  assert.equal(O.javobKodi("shifr", { ok: true, natija: { togri: false, ochiq: "notogrimatn", bayroq: null } }), "0"); // ochiq matn xato boʻlsa ham keladi
  assert.equal(O.javobKodi("shifr", { ok: true, natija: { togri: true, ochiq: "qalaustida", bayroq: "bayroq" } }), "1");
  assert.equal(O.javobKodi("kalit", { ok: true, natija: { togri: true, ochiq: "qalqon" } }), "1");
  assert.equal(O.javobKodi("qopol", { ok: true, natija: { ochildi: false, soniya: 1e9, matn: "yillar" } }), "0");
  assert.equal(O.javobKodi("fishing", { ok: true, natija: { nomer: 0 } }), "1");
  assert.equal(O.javobKodi("fishing", { ok: false, xato: "ilmoq" }), "x");
  assert.equal(O.javobKodi("shifr", { ok: false, xato: "jazo" }), "j");
  assert.equal(O.javobKodi("taxmin", { ok: false, xato: "urinish" }), "u");
  assert.equal(O.javobKodi("taxmin", { ok: false, xato: "yiqilgan" }), "y");
  assert.equal(O.javobKodi("taxmin", null), "x");
  for (const tur of P.AMALLAR.filter((t) => t !== "rol")) {
    for (const kod of ["0", "1", "2", "x", "j", "u", "y", "h0m0o0", "h1m0o0", "h1m1o1", "h1m1o0"]) {
      const m = O.javobMatni(tur, kod);
      assert.ok(m.startsWith("✓") || m.startsWith("↻"), `${tur}/${kod}: ${m}`);
    }
  }
  assert.ok(O.javobMatni("shifr", "0").includes("15"));
  // kod — tarmoq kaliti
  for (const kod of ["h1m1o1", "x", "2"]) assert.ok(P.token(`abc123:iz:${kod}:7`));
});

test("voqea kodi → matn: qala.js kodlari hammasi tarjima qilingan; boshlovchida toʻliq matn ustun", () => {
  const O = yukla();
  const KODLAR = ["qopol-ok", "qopol-yoq", "taxmin-ok", "taxmin-xato", "jadval-ok", "jadval-yoq", "jadval-tuz", "iz-ok", "iz-xato", "iz-mos-emas",
    "shifr-ok", "shifr-xato", "kalit-ok", "kalit-xato", "fishing-keldi", "fishing-ochildi", "fishing-ochirildi", "darvoza", "ikki-ok",
    "faza-himoya", "faza-hujum", "faza-tahlil", "tugadi"];
  for (const kod of KODLAR) assert.ok(O.VOQEA_MATNI[kod], kod);
  assert.equal(O.voqeaMatni({ kod: "jadval-ok" }), "Iz tayyor jadvaldan topildi");
  assert.equal(O.voqeaMatni({ kod: "jadval-ok", matn: "Toʻliq matn" }), "Toʻliq matn");
  assert.equal(O.voqeaMatni({ kod: "nomalum", devor: "parol", ok: false }), "Parol ✗");
});

test("narx: tuz 3, kalitli 4, ikki 2; byudjet 10", () => {
  const O = yukla();
  assert.deepEqual(O.NARX, { tuz: 3, kalitli: 4, ikki: 2 });
  assert.equal(O.narxi({ parol: ["s1"], tuz: 0, shifr: "sezar", ikki: false }), 0);
  assert.equal(O.narxi({ parol: ["s1"], tuz: 7, shifr: "kalitli", ikki: true }), 9);
  assert.ok(O.narxi({ tuz: 7, shifr: "kalitli", ikki: true }) <= Q.BYUDJET);
  Q.himoyaNarxi = () => 5;
  assert.equal(O.narxi({ tuz: 0 }), 5);
  Q.himoyaNarxi = null;
});

test("xat qismlari: id yoki obyekt → matn; id'lar qaytariladi (tarmoq uchun)", () => {
  const O = yukla();
  const q = O.xatQismlari({ kimdan: "k1", mavzu: "m1", havola: "h1", gap: "g1", imzo: "i1" });
  assert.equal(q.kimdan.matn, "Bank");
  assert.equal(q.havola.matn, "qabilabank.uz");
  const q2 = O.xatQismlari({ qismlar: { kimdan: { id: "k9", matn: "Doʻst" }, mavzu: "m1", havola: "h1", gap: "g1", imzo: "i1" } });
  assert.equal(q2.kimdan.matn, "Doʻst");
  assert.deepEqual(O.xatIdlari(q2), { kimdan: "k9", mavzu: "m1", havola: "h1", gap: "g1", imzo: "i1" });
  assert.equal(O.xatQismlari({}).gap.matn, "");
  assert.deepEqual(Object.keys(O.DEVOR_NOMI), P.DEVORLAR);
});

test("matn qoidasi: satr ichida oddiy ' yoʻq (oʻ gʻ ʼ ishlatiladi), kirill harfi faqat ruscha atamada", () => {
  for (const f of FAYLLAR) {
    const kod = fs.readFileSync(path.join(JS, f), "utf8").replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    const satrlar = kod.match(/"[^"\n]*"|`[^`]*`/g) || [];
    const yomon = satrlar.filter((s) => /'/.test(s) && !/^"[^"]*\[[^\]]*'[^\]]*\][^"]*"$/.test(s));
    assert.deepEqual(yomon, [], `${f}: oddiy ' bor`);
    const kirill = kod.match(/[А-Яа-яЁё]+/g) || [];
    assert.deepEqual(kirill, [], `${f}: kirill harflari`);
  }
});

test("fayl hajmi chegaralari (spec §6)", () => {
  const satr = (f) => fs.readFileSync(path.join(JS, f), "utf8").split("\n").length;
  assert.ok(satr("oyin-ui.js") <= 950, "oyin-ui.js " + satr("oyin-ui.js"));
  assert.ok(satr("onlayn-qala.js") <= 650, "onlayn-qala.js " + satr("onlayn-qala.js"));
  assert.ok(satr("mashq.js") <= 300, "mashq.js " + satr("mashq.js"));
  assert.ok(satr("protokol.js") <= 260, "protokol.js " + satr("protokol.js"));
});
