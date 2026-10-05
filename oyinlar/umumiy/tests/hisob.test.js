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
  assert.deepEqual(skriptlar("kirish/index.html"), ["../oyinlar/umumiy/js/hisob.js", "kirish.js"]);
  assert.match(oqi("kirish/index.html"), /oyinlar\/umumiy\/css\/hisob\.css/);
  // Boshqaruv sahifalari umumiy qobiqda (boshqaruv.js + boshqaruv.css)
  assert.deepEqual(skriptlar("admin/index.html"), ["../oyinlar/umumiy/js/hisob.js", "../oyinlar/umumiy/js/boshqaruv.js", "admin.js"]);
  for (const f of ["admin/index.html", "oqituvchi/panel/index.html"]) {
    assert.match(oqi(f), /oyinlar\/umumiy\/css\/asos\.css/, f);
    assert.match(oqi(f), /oyinlar\/umumiy\/css\/boshqaruv\.css/, f);
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

test("o'qituvchi paneli: skriptlar va sinf hisobi", () => {
  assert.deepEqual(skriptlar("oqituvchi/panel/index.html"), [
    "../../oyinlar/umumiy/js/storage.js", "../../bosh/js/bosh.js", "../../oyinlar/umumiy/js/hisob.js", "../../oyinlar/umumiy/js/boshqaruv.js", "panel.js"]);
  const P = require("../../../oqituvchi/panel/panel.js");
  const GAMES = [{ topic: "kod", key: "a:v1", stages: 3 }, { topic: "kod", key: "b:v1", stages: 2 }, { topic: "ai", key: "c:v1", stages: 3 }];
  const SECTIONS = [{ id: "kod", title: "Kodlash" }, { id: "ai", title: "AI" }, { id: "bosh", title: "Bo'sh" }];
  const h = P.hisobla({
    "a:v1": { done: [true, true, false], stars: [3, 2, 0], hard: [true, false, false] },
    "c:v1": { done: [true, true, true], stars: [1, 1, 1], hard: [false, false, false] },
    "on-barmoq:rekord": 140,
    "masalalar:holat:v1": { x: { yechilgan: true }, y: { yechilgan: false }, z: { yechilgan: true } },
  }, GAMES, SECTIONS);
  assert.deepEqual(h.bolimlar, [{ id: "kod", title: "Kodlash", tugagan: 2, jami: 5 }, { id: "ai", title: "AI", tugagan: 3, jami: 3 }]);
  assert.equal(h.yulduz, 8);
  assert.equal(h.qiyin, 1);
  assert.equal(h.rekord, 140);
  assert.equal(h.masalalar, 2);
  assert.equal(h.foiz, 63); // 5 / 8 bosqich
  assert.equal(h.tugagan, 5);
});
