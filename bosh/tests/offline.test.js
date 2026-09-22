// Offline rejim: sw.js ro'yxati, manifest va sahifalar mosligini tekshiradi.
// Ishga tushirish (loyiha ildizida): node --test bosh/tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");

const ROOT = path.join(__dirname, "../..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const FILES = JSON.parse(read("sw.js").match(/const FILES = \[([\s\S]*?)\];/)[1].replace(/,\s*$/, "").replace(/^/, "[") + "]");
const manifest = JSON.parse(read("manifest.json"));
// Alohida sahifalar: o'yinlar (NN-nomi) va musobaqalar (savol-javob, tez yozish poygasi)
const pageDirs = () => fs.readdirSync(path.join(ROOT, "oyinlar")).filter((d) => /^\d\d-/.test(d) || d === "musobaqa" || d === "poyga");

// Saytga kerak bo'lgan fayllar (testlar va hujjatlar kirmaydi)
function siteFiles() {
  const out = ["index.html", "manifest.json", "bosh/style.css", "bosh/icon.svg", "bosh/icon-192.png", "bosh/icon-512.png"];
  for (const f of fs.readdirSync(path.join(ROOT, "bosh/js"))) out.push("bosh/js/" + f);
  for (const f of fs.readdirSync(path.join(ROOT, "oyinlar/umumiy/css"))) out.push("oyinlar/umumiy/css/" + f);
  out.push("oyinlar/umumiy/fonts/Nunito.woff2");
  for (const f of fs.readdirSync(path.join(ROOT, "oyinlar/umumiy/js"))) out.push("oyinlar/umumiy/js/" + f);
  for (const dir of pageDirs()) {
    out.push(`oyinlar/${dir}/index.html`, `oyinlar/${dir}/css/style.css`);
    const js = path.join(ROOT, "oyinlar", dir, "js");
    for (const f of fs.readdirSync(js)) {
      if (f.endsWith(".js")) out.push(`oyinlar/${dir}/js/${f}`);
      else for (const g of fs.readdirSync(path.join(js, f))) out.push(`oyinlar/${dir}/js/${f}/${g}`);
    }
  }
  return out;
}

test("sw.js ro'yxati: sayt fayllarining hammasi bor va ortiqchasi yo'q", () => {
  const listed = FILES.filter((f) => !f.endsWith("/"));
  const needed = siteFiles();
  const missing = needed.filter((f) => !listed.includes(f));
  const extra = listed.filter((f) => !needed.includes(f));
  assert.deepEqual(missing, [], "keshga qo'shilmagan fayllar");
  assert.deepEqual(extra, [], "ro'yxatda ortiqcha fayllar");
});

test("sw.js dagi har bir fayl mavjud", () => {
  for (const file of FILES) {
    if (file.endsWith("/")) continue;
    assert.ok(fs.existsSync(path.join(ROOT, file)), file);
  }
});

test("papka manzillari ham keshlanadi (o'yinga to'g'ridan-to'g'ri kirish uchun)", () => {
  assert.ok(FILES.includes("./"));
  for (const dir of pageDirs()) {
    assert.ok(FILES.includes(`oyinlar/${dir}/`), dir);
  }
});

test("manifest: nom, boshlanish manzili va ikonkalar", () => {
  assert.equal(manifest.name, "Qabila maktabi");
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.display, "standalone");
  assert.ok(manifest.icons.some((i) => i.sizes === "192x192"));
  assert.ok(manifest.icons.some((i) => i.purpose === "maskable"));
  for (const icon of manifest.icons) assert.ok(fs.existsSync(path.join(ROOT, icon.src)), icon.src);
});

test("har bir sahifa offline.js ni ulaydi", () => {
  assert.match(read("index.html"), /oyinlar\/umumiy\/js\/offline\.js/);
  assert.match(read("index.html"), /rel="manifest"/);
  for (const dir of pageDirs()) {
    assert.match(read(`oyinlar/${dir}/index.html`), /\.\.\/umumiy\/js\/offline\.js/, dir);
  }
});

test("yangi versiya serverdan olinadi va bosh sahifa o'zi yangilanadi", () => {
  const sw = read("sw.js");
  assert.match(sw, /new Request\(file, \{ cache: "reload" \}\)/, "o'rnatishda brauzer keshi chetlab o'tiladi");
  assert.match(sw, /fetch\(request, \{ cache: "no-cache" \}\)/, "orqa fonda serverdan tekshiriladi");
  const offline = read("oyinlar/umumiy/js/offline.js");
  assert.match(offline, /controllerchange/);
  assert.match(offline, /location\.reload\(\)/);
});
