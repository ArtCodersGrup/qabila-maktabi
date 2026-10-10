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
  // Kim yuborgani — qisqa kalit (ikki kishilik xonada "left"/"right", tog'da yashirin raqam).
  // Tomonni tekshirish ikki kishilik xonaning o'zida (join) qilinadi.
  assert.ok(O.validMessage({ ...ok, from: "k7f3a9" }, types), "ko'p kishilik xona raqami");
  assert.ok(!O.validMessage({ ...ok, from: "Salom, men Alisher" }, types), "ism yoki gap");
  assert.ok(!O.validMessage({ ...ok, from: "" }, types), "bo'sh");
  assert.ok(!O.validMessage({ ...ok, t: "1" }, types), "vaqt son emas");
  assert.ok(!O.validMessage({ ...ok, data: { text: "Salom, qalaysan?" } }, types), "erkin matn");
  assert.ok(!O.validMessage({ ...ok, data: [1, 2] }, types), "ma'lumotning o'zi ro'yxat");
  assert.ok(O.validMessage({ ...ok, data: { pog: [0, 3, 7], qah: ["tulki", "ayiq"] } }, types), "sonlar va kalitlar ro'yxati");
  assert.ok(!O.validMessage({ ...ok, data: { nom: ["Alisher Navoiy"] } }, types), "ro'yxat ichida erkin matn");
  assert.ok(!O.validMessage({ ...ok, data: { pog: new Array(33).fill(1) } }, types), "juda uzun ro'yxat");
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
  // server/app/xona_qoidalari.py dagi KINDS bilan bir xil (pytest tekshiradi)
  assert.deepEqual(O.KINDS, ["sinov", "poyga", "savol", "tog", "tank", "qala"]);
  assert.ok(O.HOST_WAIT >= 3000, "sekin tarmoqda server javobi kech keladi");
});

test("server manzili: o'z domenimiz va lokal sinovda — o'sha server, fayldan/LAN dan — kelajagim.uz", () => {
  assert.equal(O.serverUrl({ protocol: "https:", hostname: "kelajagim.uz", host: "kelajagim.uz" }), "wss://kelajagim.uz");
  assert.equal(O.serverUrl({ protocol: "https:", hostname: "www.kelajagim.uz", host: "www.kelajagim.uz" }), "wss://www.kelajagim.uz");
  assert.equal(O.serverUrl({ protocol: "http:", hostname: "localhost", host: "localhost:8199" }), "ws://localhost:8199");
  assert.equal(O.serverUrl({ protocol: "file:", hostname: "", host: "" }), "wss://kelajagim.uz");
  assert.equal(O.serverUrl({ protocol: "http:", hostname: "192.168.1.5", host: "192.168.1.5:8000" }), "wss://kelajagim.uz");
  assert.equal(O.serverUrl(undefined), "wss://kelajagim.uz");
  assert.equal(O.xonaUrl("wss://kelajagim.uz", "tog", "4827", "k7f3a9", "player"), "wss://kelajagim.uz/api/ws/xona/tog/4827?key=k7f3a9&role=player");
  assert.equal(O.xonaUrl("wss://kelajagim.uz", "tog", "4827", "host", "host", 12), "wss://kelajagim.uz/api/ws/xona/tog/4827?key=host&role=host&sinf=12");
  assert.equal(O.xonaUrl("wss://kelajagim.uz", "tog", "4827", "host", "host", "1&x=2"), "wss://kelajagim.uz/api/ws/xona/tog/4827?key=host&role=host");
  const src = require("node:fs").readFileSync(require("node:path").join(__dirname, "../js/onlayn.js"), "utf8");
  assert.ok(!/supabase|sb_publishable_|service_role|sb_secret_/.test(src), "Supabase qoldig'i yo'q");
});

test("ikki kishilik xona holati server ro'yxatidan", () => {
  assert.deepEqual(O.juftHolat(["left"], 5), { sides: ["left"], full: false, hostAt: 5, extra: false });
  assert.deepEqual(O.juftHolat(["left", "right"], 5), { sides: ["left", "right"], full: true, hostAt: 5, extra: false });
  assert.deepEqual(O.juftHolat(["right"], 5), { sides: ["right"], full: false, hostAt: null, extra: false });
  assert.deepEqual(O.juftHolat(["left", "begona"], 5).sides, ["left"]);
});

test("ismlar: faqat kalit → qisqa ism, boshqasi tashlanadi", () => {
  assert.deepEqual(O.ismlarToza({ k1: "Ali K.", "k 2": "X", k3: 5, k4: "a".repeat(41), k5: "" }), { k1: "Ali K." });
  assert.deepEqual(O.ismlarToza(null), {});
  assert.deepEqual(O.ismlarToza(["Ali"]), {});
});
