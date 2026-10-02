// Testlar uchun yordamchi: C++ dasturlarini HAQIQIY g++ bilan ishga tushirish.
//
// Tezlik haqida. macOS da har yangi ikkilik faylni birinchi marta ishga tushirish ~0.4 soniya
// oladi (tizim uni tekshiradi), kompilyatsiya esa ~0.1 soniya. Shuning uchun 40 ta dastur
// 40 marta kompilyatsiya qilinsa, test 20 soniya ketadi. Buning o'rniga hamma dastur
// BITTA faylga yig'iladi: har biri alohida funksiya bo'ladi, cin/cout vaqtincha matnga ulanadi.
// Natija: bitta kompilyatsiya, bitta ishga tushirish (~1 soniya).
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const { execFile, execFileSync } = require("node:child_process");

const AJRATGICH = "####QABILA####";

function bormi() {
  try {
    execFileSync("g++", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function ustaxona() {
  const uy = fs.mkdtempSync(path.join(os.tmpdir(), "qabila-gpp-"));
  const pch = path.join(uy, "bosh.h");
  fs.writeFileSync(pch, "#include <iostream>\n#include <string>\n#include <sstream>\n");
  let bayroqlar = [];
  try {
    execFileSync("g++", ["-std=c++17", "-O0", "-x", "c++-header", pch, "-o", pch + ".pch"], { stdio: "ignore" });
    bayroqlar = ["-include", pch];
  } catch {
    bayroqlar = []; // PCH ishlamasa ham testlar ishlaydi, faqat sekinroq
  }
  return { uy, bayroqlar, tozala: () => fs.rmSync(uy, { recursive: true, force: true }) };
}

function kompilyat(ust, kod, nom) {
  const papka = path.join(ust.uy, "n" + nom);
  fs.mkdirSync(papka, { recursive: true });
  const src = path.join(papka, "a.cpp");
  const bin = path.join(papka, "a.out");
  fs.writeFileSync(src, kod.endsWith("\n") ? kod : kod + "\n");
  return new Promise((resolve) => {
    execFile("g++", ["-std=c++17", "-O0", ...ust.bayroqlar, "-o", bin, src], (xato, _o, stderr) => {
      resolve(xato ? { ok: false, xato: "kompilyatsiya: " + String(stderr).split("\n")[0] } : { ok: true, bin });
    });
  });
}

function ishlat(bin, kirish) {
  return new Promise((resolve) => {
    const bola = execFile(bin, { timeout: 15000, maxBuffer: 8 * 1024 * 1024 }, (xato, stdout) => {
      resolve(xato ? { ok: false, xato: "ishga tushmadi: " + String(xato.message).split("\n")[0] } : { ok: true, out: stdout });
    });
    bola.stdin.end((kirish || []).join("\n") + (kirish && kirish.length ? "\n" : ""));
  });
}

// Bitta dastur: kompilyatsiya + ishga tushirish
async function ishga(ust, kod, kirish, nom) {
  const k = await kompilyat(ust, kod, nom);
  if (!k.ok) return k;
  return ishlat(k.bin, kirish);
}

// Dasturni funksiyaga aylantirish: #include va using olib tashlanadi, main → prog_k
const cFunksiya = (kod, k) => kod
  .replace(/^[ \t]*#include[^\n]*\n/gm, "")
  .replace(/^[ \t]*using\s+namespace\s+std\s*;[ \t]*\n?/gm, "")
  .replace(/\bint\s+main\s*\(\s*\)/, "int prog_" + k + "()");

const cMatn = (s) => '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n") + '"';

// Hamma dasturni bitta faylga yig'ib, bir marta ishga tushirish.
// olish(t) → { kod, kirish }. Natija: [{ t, r }], r — { ok, out } yoki { ok: false, xato }
async function hammasi(ust, royxat, olish) {
  const ishlar = royxat.map((t, k) => ({ t, k, ...olish(t) }));
  // Dasturlarning #include lari yig'ib olinadi: vector/algorithm kerak bo'lgan misollar ham ishlasin
  const sarlavhalar = new Set(["#include <iostream>", "#include <string>", "#include <sstream>"]);
  for (const x of ishlar) {
    for (const satr of String(x.kod).split("\n")) {
      const m = /^\s*(#include\s*<[^>]+>)/.exec(satr);
      if (m) sarlavhalar.add(m[1].replace(/\s+/g, " "));
    }
  }
  const qismlar = ishlar.map((x) => cFunksiya(x.kod, x.k));
  const chaqiruvlar = ishlar.map((x) => `  {
    istringstream in(${cMatn((x.kirish || []).join("\n") + ((x.kirish && x.kirish.length) ? "\n" : ""))});
    ostringstream out;
    streambuf* ci = cin.rdbuf(in.rdbuf());
    streambuf* co = cout.rdbuf(out.rdbuf());
    prog_${x.k}();
    cin.rdbuf(ci);
    cout.rdbuf(co);
    cout << ${cMatn(AJRATGICH)} << out.str();
  }`).join("\n");

  const birlashgan = [
    ...sarlavhalar, "using namespace std;", "",
    qismlar.join("\n\n"), "",
    "int main() {", chaqiruvlar, "  return 0;", "}", "",
  ].join("\n");

  const k = await kompilyat(ust, birlashgan, "birlashgan");
  if (k.ok) {
    const r = await ishlat(k.bin, []);
    if (r.ok) {
      const boloaklar = r.out.split(AJRATGICH);
      boloaklar.shift(); // birinchi ajratgichdan oldingi bo'sh qism
      if (boloaklar.length === ishlar.length) {
        return ishlar.map((x, i) => ({ t: x.t, r: { ok: true, out: boloaklar[i] } }));
      }
    }
  }
  // Birlashtirish ishlamadi (masalan bitta dastur kompilyatsiya bo'lmadi) —
  // har birini alohida ishga tushiramiz: xato qaysi dasturda ekani ko'rinadi
  const natija = [];
  for (let i = 0; i < ishlar.length; i += 8) {
    const bolak = ishlar.slice(i, i + 8);
    natija.push(...await Promise.all(bolak.map((x) => ishga(ust, x.kod, x.kirish, x.k).then((r) => ({ t: x.t, r })))));
  }
  return natija;
}

// Buzuq dastur: g++ ning birinchi xato satri — "satr:ustun: error: xabar"
// opts.sarlavhasiz — tayyor sarlavha (bosh.h: <iostream>, <string>) ULANMAYDI: dasturning o'zida
// #include bor-yo'qligini tekshiradigan sinovlar uchun (aks holda kompilyator cout ni baribir taniydi).
async function xatoMatni(ust, kod, nom, opts) {
  const bayroqlar = opts && opts.sarlavhasiz ? [] : ust.bayroqlar;
  const papka = path.join(ust.uy, "x" + nom);
  fs.mkdirSync(papka, { recursive: true });
  const src = path.join(papka, "a.cpp");
  fs.writeFileSync(src, kod.endsWith("\n") ? kod : kod + "\n");
  return new Promise((resolve) => {
    execFile("g++", ["-std=c++17", "-fsyntax-only", ...bayroqlar, src], (xato, _o, stderr) => {
      if (!xato) return resolve(null); // kompilyatsiya o'tdi — xato yo'q
      const satr = String(stderr).split("\n").find((x) => x.includes(": error: ")) || "";
      resolve(satr.replace(/^.*?a\.cpp:/, ""));
    });
  });
}

module.exports = { bormi, ustaxona, ishga, hammasi, xatoMatni, AJRATGICH };
