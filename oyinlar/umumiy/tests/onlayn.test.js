// onlayn.js — sof qismlar: xona kodi, kanal nomi, xabar tekshiruvi, presence holati.
const test = require("node:test");
const assert = require("node:assert/strict");
const O = require("../js/onlayn.js");

test("xona kodi: 4 xonali, boshida 0 yo'q", () => {
  for (let k = 0; k < 500; k++) assert.ok(O.validCode(O.makeCode()), "kod");
  assert.equal(O.makeCode(() => 0), "1000");
  assert.equal(O.makeCode(() => 0.99999), "9999");
  for (const bad of ["0123", "123", "12345", "12a4", "", null]) assert.ok(!O.validCode(bad), String(bad));
  assert.equal(O.channelName("sinov", "4827"), "xona:sinov:4827");
});

test("xabar: faqat ruxsat etilgan tur, tomon va erkin matnsiz ma'lumot", () => {
  const types = ["salom", "javob"];
  const ok = { type: "salom", data: { t0: 123 }, t: 1, from: "left" };
  assert.ok(O.validMessage(ok, types));
  assert.ok(O.validMessage({ type: "javob", t: 2, from: "right" }, types), "ma'lumotsiz");
  assert.ok(!O.validMessage({ ...ok, type: "chat" }, types), "ro'yxatda yo'q tur");
  assert.ok(!O.validMessage({ ...ok, from: "boshqa" }, types), "noma'lum tomon");
  assert.ok(!O.validMessage({ ...ok, t: "1" }, types), "vaqt son emas");
  assert.ok(!O.validMessage({ ...ok, data: { text: "Salom, qalaysan?" } }, types), "erkin matn");
  assert.ok(!O.validMessage({ ...ok, data: [1, 2] }, types), "ro'yxat");
  assert.ok(!O.validMessage({ ...ok, data: { deep: { a: 1 } } }, types), "ichma-ich obyekt");
  assert.ok(O.validMessage({ ...ok, data: { level: "proverb", done: true, pos: 12 } }, types), "qisqa kalit so'z, mantiq, son");
  assert.ok(!O.validMessage(null, types));
});

test("presence: kim ulangan, xona to'lami, ochilgan vaqti", () => {
  assert.deepEqual(O.roomInfo({}), { sides: [], full: false, hostAt: null, extra: false });
  assert.deepEqual(O.roomInfo({ left: [{ side: "left", at: 5 }] }), { sides: ["left"], full: false, hostAt: 5, extra: false });
  const two = O.roomInfo({ left: [{ at: 5 }], right: [{ at: 9 }] });
  assert.equal(two.full, true);
  assert.deepEqual(two.sides, ["left", "right"]);
  assert.equal(O.roomInfo({ left: [{ at: 5 }], right: [{}, {}] }).extra, true, "bir tomonda ikki kishi");
  assert.equal(O.CODE_TTL, 600000);
  assert.deepEqual(O.KINDS, ["sinov", "poyga", "savol"]);
});

test("sozlama: faqat ommaviy kalit, maxfiy kalit yo'q", () => {
  assert.match(O.CONFIG.url, /^https:\/\/[a-z0-9]+\.supabase\.co$/);
  assert.ok(!/service_role|sb_secret_/.test(O.CONFIG.key), "maxfiy kalit saytga yozilmaydi");
  const src = require("node:fs").readFileSync(require("node:path").join(__dirname, "../js/onlayn.js"), "utf8");
  assert.ok(!/service_role|sb_secret_/.test(src));
});
