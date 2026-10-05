// hisob.js — akkaunt qatlami: qachon ishlaydi, sahifalar ulangan, service worker /api ni keshlamaydi.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const H = require("../js/hisob.js");
const ROOT = path.join(__dirname, "../../..");
const oqi = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const skriptlar = (f) => [...oqi(f).matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);

test("akkaunt faqat o'z serverimizda (fayldan ochilganda yo'q)", () => {
  assert.equal(H.mumkin({ protocol: "https:", hostname: "kelajagim.uz" }), true);
  assert.equal(H.mumkin({ protocol: "http:", hostname: "localhost" }), true);
  assert.equal(H.mumkin({ protocol: "file:", hostname: "" }), false);
  assert.equal(H.mumkin({ protocol: "http:", hostname: "192.168.1.5" }), false);
  assert.equal(H.mumkin(undefined), false);
  assert.deepEqual(Object.keys(H.ROLLAR).sort(), ["admin", "student", "teacher"]);
});

test("service worker /api/ ni keshlamaydi", () => {
  const sw = oqi("sw.js");
  assert.match(sw, /url\.pathname\.startsWith\("\/api\/"\)\) return;/);
  assert.ok(sw.indexOf('startsWith("/api/")') < sw.indexOf("event.respondWith"));
  const gen = oqi("bosh/sw-royxat.py");
  assert.ok(gen.includes('startsWith("/api/")') || !gen.includes("respondWith"), "generator ham shu qatorni saqlaydi");
});

test("sahifalar: kirish, admin, bosh sahifa tugmasi", () => {
  for (const [f, oxirgi] of [["kirish/index.html", "kirish.js"], ["admin/index.html", "admin.js"]]) {
    const s = skriptlar(f);
    assert.deepEqual(s, ["../oyinlar/umumiy/js/hisob.js", oxirgi], f);
    assert.match(oqi(f), /oyinlar\/umumiy\/css\/asos\.css/);
    assert.match(oqi(f), /oyinlar\/umumiy\/css\/hisob\.css/);
  }
  const bosh = skriptlar("index.html");
  assert.ok(bosh.indexOf("oyinlar/umumiy/js/hisob.js") >= 0);
  assert.ok(bosh.indexOf("oyinlar/umumiy/js/hisob.js") < bosh.indexOf("bosh/js/hisob-tugma.js"));
  assert.ok(bosh.indexOf("bosh/js/bosh.js") < bosh.indexOf("bosh/js/hisob-tugma.js"));
});

test("maxfiy narsa saqlanmaydi: localStorage da faqat ism va rol", () => {
  const src = oqi("oyinlar/umumiy/js/hisob.js");
  assert.ok(!/localStorage\.setItem\([^)]*parol/i.test(src));
  assert.match(src, /JSON\.stringify\(\{ ism: [^}]*rol: [^}]*\}\)/);
});

test("progress kalitlari: bosqichli o'yinlar, masalalar, rekord — sozlamalar emas", () => {
  const d = {
    "rim-toshi:v1": JSON.stringify({ done: [true, false], stars: [3, 0], hard: [false, false], muted: false }),
    "tog:v1": JSON.stringify({ done: [], stars: [], hard: [], muted: true }),
    "masalalar:holat:v1": JSON.stringify({ yigindi: { foiz: 50 } }),
    "on-barmoq:rekord": "120",
    "qabila:toifa:v1": "kichik",
    "qabila:hisob:v1": JSON.stringify({ ism: "Ali K.", rol: "student" }),
    "masalalar:filtr:v1": JSON.stringify({ daraja: "oson" }),
    "buzuq:v1": "{",
  };
  const keys = Object.keys(d);
  const store = { length: keys.length, key: (i) => keys[i], getItem: (k) => d[k] };
  assert.deepEqual(H.progressKalitlari(store).sort(), ["masalalar:holat:v1", "on-barmoq:rekord", "rim-toshi:v1"]);
});

test("storage.js: kirgan bo'lsa saqlanganini navbatga qo'yadi, masalalar va o'n barmoq ham", () => {
  const st = oqi("oyinlar/umumiy/js/storage.js");
  assert.match(st, /navbatga\(key\)/);
  assert.match(st, /keepalive: true/);
  assert.match(st, /\/api\/progress/);
  assert.match(oqi("oyinlar/masalalar/js/holat.js"), /navbatga\(kalit\)/);
  assert.match(oqi("oyinlar/23-on-barmoq/js/typing-ui.js"), /navbatga\(BEST_KEY\)/);
  assert.ok(skriptlar("oyinlar/masalalar/index.html").includes("../umumiy/js/storage.js"));
});
