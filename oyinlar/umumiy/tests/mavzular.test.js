// Mavzu → bo'lim xaritasi, Tog' mavzu qulfi va mavzu statistikasi.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("./helpers.js");
const M = require("../js/mavzular.js");

const win = {};
loadScript(path.join(__dirname, "../../../bosh/js/bosh.js"), win);
const K = win.QK.bosh;
const S = require("../../musobaqa/js/savollar.js");
globalThis.QK = { savollar: S };
require("../../musobaqa/js/savollar-2.js");
const toifa = (id) => K.toifaById(id);

test("har savol mavzusi mavjud bo'limga bog'langan", () => {
  for (const t of S.TOPICS) {
    const b = M.bolimlari(t.id);
    assert.ok(b.length, "xaritada yo'q: " + t.id);
    for (const id of b) assert.ok(K.SECTIONS.some((s) => s.id === id), `${t.id} → ${id}`);
  }
});

test("qulf: bo'limdagi toifaga mos hamma o'yin tugagandagina ochiladi", () => {
  const hech = () => false;
  const hamma = () => true;
  const h = M.holat("sanoq", K, toifa("orta"), hech);
  assert.equal(h.holat, "yopiq");
  assert.deepEqual(h.bolimlar.map((b) => [b.id, b.tugagan]), [["ikkilik", 0]]);
  assert.equal(h.bolimlar[0].jami, K.GAMES.filter((g) => g.topic === "ikkilik" && g.toifa === "orta").length);
  assert.match(M.sabab(h), /«Sonlar va ikkilik kod» \(0\/\d+ oʻyin\)/);
  assert.equal(M.holat("sanoq", K, toifa("orta"), hamma).holat, "ochiq");
  // bitta o'yin qolsa — yopiq
  const bitta = K.GAMES.find((g) => g.topic === "ikkilik" && g.toifa === "orta");
  assert.equal(M.holat("ikkilik", K, toifa("orta"), (g) => g !== bitta).holat, "yopiq");
  // AI ikki bo'limga bog'langan — ikkalasi kerak
  const ai = M.holat("ai", K, toifa("orta"), (g) => g.topic === "ai");
  assert.equal(ai.holat, "yopiq");
  assert.match(M.sabab(ai), /Koʻrish, tarmoqlar/);
  // 1–4 da Python o'yini yo'q — mavzu ko'rsatilmaydi
  assert.equal(M.holat("python", K, toifa("boshlangich"), hamma).holat, "yoq");
  // 5–8 da «Algoritm va dasturlash» da faqat 5–8 o'yini hisoblanadi
  const d = M.holat("dastur", K, toifa("orta"), hech);
  assert.equal(d.bolimlar[0].jami, K.GAMES.filter((g) => g.topic === "dastur" && g.toifa === "orta").length);
  // «Hammasi» — barcha toifadagi o'yinlar
  assert.equal(M.holat("dastur", K, toifa("hammasi"), hech).bolimlar[0].jami, K.GAMES.filter((g) => g.topic === "dastur").length);
});

test("statistika: qo'shish, tozalash, zaif mavzu", () => {
  let s = {};
  for (let k = 0; k < 3; k++) s = M.qosh(s, "sanoq", false);
  s = M.qosh(s, "sanoq", true);
  assert.deepEqual(s, { sanoq: { t: 1, x: 3 } });
  assert.equal(M.zaifmi(s.sanoq), false, "4 ta javob — hali baholanmaydi");
  s = M.qosh(s, "sanoq", false);
  assert.equal(M.zaifmi(s.sanoq), true);
  s = M.qosh(s, "kod", true);
  assert.deepEqual(M.tozala({ "a b": { t: 1 }, kod: { t: -1, x: 2 }, bosh: { t: 0, x: 0 }, x: 5 }), { kod: { t: 0, x: 2 } });
  const j = M.jadval(s, S.TOPICS);
  assert.deepEqual(j.map((r) => [r.id, r.zaif, r.foiz]), [["sanoq", true, 80], ["kod", false, 0]]);
  assert.equal(j[0].title, "Sanoq tizimlari");
  assert.deepEqual(M.yigindi([s, { kod: { t: 2, x: 1 } }, null]), { sanoq: { t: 1, x: 4 }, kod: { t: 3, x: 1 } });
});
