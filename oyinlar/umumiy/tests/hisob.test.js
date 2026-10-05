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
