// Qal'a — sof mantiq testlari: atamalar, kartalar, parol kuchi, iz va jadval, shifrlar, xat, dialoglar, byudjet,
// himoya/hujum qurollari, o'yin holati (fazalar, ochko, g'olib), robotlar.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Q = require("../js/qala.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
const now0 = 1_700_000_000_000;

// Satr literallarida oddiy apostrof yo'q (QOIDALAR §5): izohlar olib tashlanadi, qolgani tekshiriladi
function satrlar(fayl) {
  const src = fs.readFileSync(path.join(__dirname, "..", "js", fayl), "utf8");
  return src.split("\n").map((qator) => qator.replace(/^\s*\/\/.*$/, "").replace(/\s\/\/.*$/, ""));
}
test("qala.js va dars-mantiq.js: ekranga chiqadigan matnda oddiy ' yo'q (faqat ʻ va ʼ)", () => {
  for (const fayl of ["qala.js", "dars-mantiq.js"]) {
    satrlar(fayl).forEach((q, i) => assert.ok(!/['`‘’]/.test(q), fayl + ":" + (i + 1) + " → " + q.trim()));
  }
});

// ---------- Atamalar ----------
test("ATAMALAR: 19 ta, id'lar spec bo'yicha, uch til, bir gapli izoh, dars 1–5", () => {
  const ids = ["parol", "qopol", "lugat", "ibora", "xesh", "tuz", "jadval", "shifr", "kalit", "chastota", "vijener", "fishing", "ijtimoiy", "domen", "ikki", "xaker", "oqshlyapa", "ruxsat", "byudjet"];
  assert.deepEqual(Q.ATAMALAR.map((a) => a.id), ids);
  for (const a of Q.ATAMALAR) {
    assert.ok(a.uz && a.en && a.ru && a.izoh, a.id);
    assert.ok(a.dars >= 1 && a.dars <= 5);
    assert.ok(!/!/.test(a.izoh) && a.izoh.length > 30 && a.izoh.length < 160, a.id + " izoh");
    assert.equal((a.izoh.match(/[.?]/g) || []).length, 1, a.id + " — bir gap");
  }
  assert.equal(Q.atama("xesh").en, "hash");
  assert.equal(Q.atama("yoq"), null);
});

// ---------- Kartalar va parol ----------
test("KARTALAR: 16 so'z (10 lug'atda, 6 kam), 8 raqam, 6 belgi; faqat a–z; karta(id)", () => {
  assert.equal(Q.KARTALAR.soz.length, 16);
  assert.equal(Q.KARTALAR.raqam.length, 8);
  assert.equal(Q.KARTALAR.belgi.length, 6);
  for (const s of Q.KARTALAR.soz) assert.match(s.matn, /^[a-z]{3,10}$/, s.id);
  assert.equal(Q.KARTALAR.soz.filter((s) => Q.lugatda(s.matn)).length, 10);
  assert.equal(Q.KARTALAR.soz.filter((s) => !Q.lugatda(s.matn)).length, 6);
  assert.deepEqual(Q.KARTALAR.raqam.map((r) => r.matn), ["1", "7", "12", "99", "123", "2010", "2024", "0"]);
  assert.deepEqual(Q.KARTALAR.belgi.map((b) => b.matn), ["!", "?", "#", "_", "-", "@"]);
  assert.equal(Q.karta("s1").tur, "soz");
  assert.equal(Q.karta("r2").matn, "7");
  assert.equal(Q.karta("b6").tur, "belgi");
  assert.equal(Q.karta("z9"), null);
});

test("parolYasa: tartib bilan ≤ 4 karta; bo'sh, 5 ta yoki noto'g'ri id → null", () => {
  assert.equal(Q.parolYasa(["s1", "r2"]), "olma7");
  assert.equal(Q.parolYasa(["r2", "s1"]), "7olma");
  assert.equal(Q.parolYasa(["s11", "r3", "b1", "s2"]), "zumrad12!kitob");
  assert.equal(Q.parolYasa([]), null);
  assert.equal(Q.parolYasa(["s1", "s2", "s3", "s4", "s5"]), null);
  assert.equal(Q.parolYasa(["s1", "x1"]), null);
  assert.equal(Q.parolYasa(null), null);
});

test("parolKuch: lug'atdagi so'z (raqam bilan ham) — daraja 0; kam so'z — vaqt bo'yicha 1/2/3; BigInt variant", () => {
  for (const p of ["olma", "olma7", "salom", "2010", "parol123", "kitob!"]) assert.equal(Q.parolKuch(p).daraja, 0, p);
  assert.equal(Q.parolKuch("olma").lugatda, true);
  const z = Q.parolKuch("zumrad");
  assert.equal(z.lugatda, false);
  assert.equal(typeof z.variant, "bigint");
  assert.equal(z.soniya, 308); // 26^6 / 1e6
  assert.equal(z.daraja, 2);
  assert.equal(Q.parolKuch("tuyaqush").daraja, 3); // 26^8 / 1e6 > 1 kun
  assert.equal(Q.parolKuch("gul").daraja, 0); // 26^3 — bir soniyadan kam
  assert.equal(Q.parolKuch("sirtlon").daraja, 2); // 8031 s
  assert.ok(Q.parolKuch("zumrad12!kitob").matn.length > 3);
  assert.equal(Q.parolKuch("olmakitob").lugatda, false, "ikki so'z — lug'atda emas");
});

test("parolMaslahat: uzunlik, turlar tartibi, lug'at; maslahatKod tarmoqqa yaroqli", () => {
  assert.deepEqual(Q.parolMaslahat(["s1", "r2"]), ["Uzunligi 5", "Soʻz + raqam", "Soʻz lugʻatda bor"]);
  assert.deepEqual(Q.parolMaslahat(["s11", "r3", "b1"]), ["Uzunligi 9", "Soʻz + raqam + belgi", "Soʻz lugʻatda yoʻq"]);
  assert.deepEqual(Q.parolMaslahat(["r1", "b2"]), ["Uzunligi 2", "Raqam + belgi", "Soʻz yoʻq"]);
  const kod = Q.maslahatKod(["r2", "s1"]);
  assert.deepEqual(kod, { uzunlik: 5, turlar: ["raqam", "soz"], lugat: 1 });
  assert.deepEqual(Q.maslahatMatn(kod), ["Uzunligi 5", "Raqam + soʻz", "Soʻz lugʻatda bor"]);
});

// ---------- Iz va jadval ----------
test("iz/izQadamlar/izHisob — 51-logic bilan bir xil; jadval 144 ta; jadvaldan", () => {
  assert.equal(Q.iz("olma", 0), Q.LIB.qulf.iz("olma", 0));
  assert.equal(Q.iz("olma", 7), Q.LIB.qulf.iz("olma", 7));
  assert.equal(Q.iz("olma"), Q.iz("olma", 0));
  assert.equal(Q.izQadamlar("gul", 0).length, 3);
  assert.equal(typeof Q.izHisob("gul", 5), "string");
  const j = Q.jadval(0);
  assert.equal(j.length, 144);
  assert.equal(new Set(j.map((x) => x.parol)).size, 144);
  for (const x of j) assert.equal(x.iz, Q.iz(x.parol, 0));
  const nishon = Q.iz("olma7", 0);
  assert.ok(Q.jadvaldan(nishon, 0).includes("olma7"));
  assert.ok(!Q.jadvaldan(Q.iz("olma7", 0), 23).includes("olma7") || Q.iz("olma7", 23) === nishon, "tuz bilan jadval boshqa");
  for (const p of Q.jadvaldan(42, 0)) assert.equal(Q.iz(p, 0), 42);
});

// ---------- Shifrlar ----------
test("BAYROQLAR: 12 ta, a–z, 5–8 harf; gap ≤ 32 harf, so'zni o'z ichiga oladi, «a» yagona eng ko'p harf", () => {
  assert.equal(Q.BAYROQLAR.length, 12);
  assert.equal(new Set(Q.BAYROQLAR.map((b) => b.id)).size, 12);
  for (const b of Q.BAYROQLAR) {
    assert.match(b.soz, /^[a-z]{5,8}$/, b.id);
    assert.match(b.gap, /^[a-z]{25,32}$/, b.id + " gap");
    assert.ok(b.gap.includes(b.soz), b.id);
    const c = Q.chastota(b.gap);
    assert.equal(c[0].harf, "a", b.id);
    assert.ok(c[0].soni > c[1].soni, b.id + " — a yagona eng ko'p");
  }
  assert.equal(Q.bayroq("f3").soz, "minora");
});

test("sezar/sezarOch: 26 harfli alifbo, aylanadi; vijener/vijenerOch: kalit 3 harf, qaytadi; KALIT_VARIANT", () => {
  assert.equal(Q.ALIFBO.length, 26);
  assert.equal(Q.sezar("abcxyz", 3), "defabc");
  assert.equal(Q.sezarOch("defabc", 3), "abcxyz");
  assert.equal(Q.sezar("Qal qon!", 1), "rbmrpo", "faqat a–z qoladi");
  for (let k = 1; k <= 25; k++) assert.equal(Q.sezarOch(Q.sezar("qalqon", k), k), "qalqon");
  assert.equal(Q.vijener("aaa", "abc"), "abc");
  assert.equal(Q.vijener("abcd", "bbb"), "bcde");
  for (const kalit of ["abc", "zzz", "qkl"]) assert.equal(Q.vijenerOch(Q.vijener("minoradanqalakorinadi", kalit), kalit), "minoradanqalakorinadi");
  assert.equal(Q.vijener("abc", "ab"), null);
  assert.equal(Q.vijener("abc", "ABC"), null);
  assert.equal(Q.kalitTogri("abc"), true);
  assert.equal(Q.kalitTogri("ab1"), false);
  assert.equal(Q.KALIT_VARIANT, 17576);
});

test("chastota: 26 ta, soni kamayish tartibida, teng bo'lsa alifbo bo'yicha; sezarTaxmin har bayroq va har k uchun to'g'ri", () => {
  const c = Q.chastota("baaac");
  assert.equal(c.length, 26);
  assert.deepEqual(c.slice(0, 3), [{ harf: "a", soni: 3 }, { harf: "b", soni: 1 }, { harf: "c", soni: 1 }]);
  assert.equal(c[25].soni, 0);
  for (let i = 1; i < 26; i++) assert.ok(c[i - 1].soni > c[i].soni || (c[i - 1].soni === c[i].soni && c[i - 1].harf < c[i].harf));
  for (const b of Q.BAYROQLAR) for (let k = 0; k < 26; k++) assert.equal(Q.sezarTaxmin(Q.sezar(b.gap, k)), k, b.id + " k=" + k);
});

// ---------- Xat ----------
test("XAT_QISMLAR: 6/6/6/8/4; havola soxta/nozik 52-logic qoidasiga mos; kamida 2 gap kod so'raydi; BELGILAR = 52 BELGILAR", () => {
  const X = Q.XAT_QISMLAR;
  assert.equal(X.kimdan.length, 6);
  assert.equal(X.kimdan.filter((k) => k.shubhali).length, 3);
  assert.equal(X.mavzu.length, 6);
  assert.equal(X.havola.length, 6);
  assert.equal(X.havola.filter((h) => !h.soxta).length, 2);
  assert.equal(X.gap.length, 8);
  assert.ok(X.gap.filter((g) => g.belgi === "parol").length >= 2);
  assert.ok(X.gap.filter((g) => g.belgi === null).length >= 2);
  assert.equal(X.imzo.length, 4);
  assert.equal(X.imzo.filter((i) => i.shubhali).length, 2);
  assert.equal(Q.BELGILAR, Q.LIB.xat.BELGILAR);
  for (const g of X.gap) assert.ok(g.belgi === null || Q.LIB.xat.belgi(g.belgi), g.id);
  for (const h of X.havola) {
    const f = Q.LIB.xat.domenFarqi(h.asl, h.matn);
    const oshkora = f.xil === "zona" || Q.LIB.xat.gumonliZona(h.matn);
    if (!h.soxta) assert.equal(f.xil, null, h.id);
    else assert.ok(f.xil !== null, h.id + " soxta");
    if (h.soxta) assert.equal(h.nozik, !oshkora, h.id + " nozik");
  }
});

test("xatYasa: ilmoqsiz → null; ilmoq kod/havola; ishonch formulasi (oshkora 25, shubhali 10, oshkora soxta havola 15, nozik 0)", () => {
  assert.equal(Q.xatYasa({ kimdan: "k1", mavzu: "m1", havola: "h1", gap: "g1", imzo: "i1" }), null, "haqiqiy havola, oddiy gap — hujum emas");
  assert.equal(Q.xatYasa({ kimdan: "k4", mavzu: "m5", havola: "h1", gap: "g6", imzo: "i3" }), null, "qo'rqitish bor, lekin ilmoq yo'q");
  assert.equal(Q.xatYasa({ kimdan: "k1", mavzu: "m1", havola: "h9", gap: "g1", imzo: "i1" }), null);
  const nozik = Q.xatYasa({ kimdan: "k1", mavzu: "m4", havola: "h3", gap: "g3", imzo: "i1" });
  assert.equal(nozik.ilmoq, "kod");
  assert.equal(nozik.ishonch, 100, "nozik havola va kod so'rash ishonchni tushirmaydi");
  assert.deepEqual(nozik.belgilar, ["parol", "manzil"]);
  const havola = Q.xatYasa({ kimdan: "k1", mavzu: "m1", havola: "h3", gap: "g1", imzo: "i1" });
  assert.equal(havola.ilmoq, "havola");
  assert.deepEqual(havola.belgilar, ["manzil"]);
  const oshkora = Q.xatYasa({ kimdan: "k4", mavzu: "m5", havola: "h4", gap: "g6", imzo: "i3" });
  assert.equal(oshkora.ishonch, 100 - 25 - 10 - 10 - 15);
  assert.equal(Q.xatYasa({ kimdan: "k1", mavzu: "m5", havola: "h6", gap: "g5", imzo: "i1" }).ishonch, 60);
  assert.equal(Q.xatYasa({ kimdan: "k6", mavzu: "m6", havola: "h4", gap: "g7", imzo: "i4" }).ishonch, 40);
  assert.deepEqual(oshkora.ids, { kimdan: "k4", mavzu: "m5", havola: "h4", gap: "g6", imzo: "i3" });
});

test("haqiqiyXat: belgisiz, ilmoqsiz, haqiqiy havola; xatBelgilari nom + izoh; FILTR_XATLAR 6 ta, 3 soxta", () => {
  const r = rngFrom(3);
  for (let k = 0; k < 20; k++) {
    const x = Q.haqiqiyXat(r);
    assert.deepEqual(x.belgilar, []);
    assert.equal(x.ilmoq, null);
    assert.equal(x.qismlar.havola.soxta, false);
    assert.equal(x.qismlar.gap.belgi, null);
    assert.equal(x.qismlar.kimdan.shubhali, false);
    assert.equal(x.ishonch, 100);
  }
  const b = Q.xatBelgilari(Q.xatYasa({ kimdan: "k1", mavzu: "m4", havola: "h4", gap: "g5", imzo: "i1" }));
  assert.deepEqual(b.map((x) => x.id), ["shoshiltirish", "manzil"]);
  assert.ok(b[0].nom && b[0].izoh);
  assert.ok(b[1].izoh.includes("qabila-bank.uz.xyz"));
  assert.deepEqual(Q.xatBelgilari(null), []);
  assert.equal(Q.FILTR_XATLAR.length, 6);
  assert.equal(Q.FILTR_XATLAR.filter((x) => x.soxta).length, 3);
  assert.deepEqual(Q.FILTR_XATLAR.map((x) => x.id), ["x1", "x2", "x3", "x4", "x5", "x6"]);
  for (const x of Q.FILTR_XATLAR) assert.ok(x.qismlar && x.qismlar.kimdan && x.qismlar.havola, x.id);
});

test("DIALOGLAR: ≥ 8 ta, 3 javob, aynan bittasi to'g'ri, hiyla — 52 belgisi, har javobda izoh", () => {
  assert.ok(Q.DIALOGLAR.length >= 8);
  assert.equal(new Set(Q.DIALOGLAR.map((d) => d.id)).size, Q.DIALOGLAR.length);
  for (const d of Q.DIALOGLAR) {
    assert.ok(d.vaziyat && d.gaplar.length >= 1, d.id);
    assert.equal(d.javoblar.length, 3, d.id);
    assert.equal(d.javoblar.filter((j) => j.togri).length, 1, d.id);
    assert.ok(d.javoblar.every((j) => j.matn && j.izoh), d.id);
    assert.ok(Q.LIB.xat.belgi(d.hiyla), d.id + " hiyla: " + d.hiyla);
  }
});

// ---------- Byudjet ----------
test("DEVORLAR/BYUDJET/PROFILLAR; byudjetBaho: tavsiya har profilda turadi, bo'sh tanlov yiqiladi, hammasi — vaqt yetmaydi", () => {
  assert.equal(Q.BYUDJET, 10);
  assert.deepEqual(Q.DEVORLAR.map((d) => d.id), ["parol", "qulf", "shifr", "xat", "ikki"]);
  for (const d of Q.DEVORLAR) for (const t of d.tanlov) assert.ok(t.id && t.nom && t.izoh && typeof t.narx === "number", d.id);
  assert.equal(Q.PROFILLAR.length, 3);
  for (const p of Q.PROFILLAR) {
    const tavsiya = Q.byudjetTavsiya(p);
    const b = Q.byudjetBaho(tavsiya, p);
    assert.equal(b.ok, true, p.id + " " + JSON.stringify(b));
    assert.ok(b.narx <= Q.BYUDJET && b.daqiqa <= Q.HIMOYA_DAQIQA);
    assert.ok(b.devorlar.every((d) => d.turdi && d.sabab));
    const bosh = Q.byudjetBaho({}, p.id);
    assert.equal(bosh.ok, false, p.id + " bo'sh");
    assert.ok(bosh.devorlar.some((d) => !d.turdi));
  }
  const hammasi = Q.byudjetBaho({ parol: "kuchli", qulf: "tuz", shifr: "kalitli", xat: "filtr", ikki: "ikki" }, "chastota");
  assert.equal(hammasi.narx, 9);
  assert.equal(hammasi.xato, "vaqt");
  assert.equal(hammasi.ok, false);
  // ikki: parol ham, xat ham yiqilsa — kod sizadi
  const l = Q.byudjetBaho({ parol: "oddiy", xat: "filtrsiz", ikki: "ikki" }, "lugat");
  assert.equal(l.devorlar.find((d) => d.id === "ikki").turdi, false);
  const l2 = Q.byudjetBaho({ parol: "oddiy", xat: "filtr", ikki: "ikki" }, "lugat");
  assert.equal(l2.devorlar.find((d) => d.id === "ikki").turdi, true);
  assert.equal(Q.profil("jadval").nom, "Jadvalchi");
});

// ---------- Himoya va hujum qurollari ----------
const KUCHLI = { parol: ["s11", "r3", "b1", "s2"], tuz: 23, shifr: "kalitli", kalit: "qkl", bayroq: "f2", ikki: true, filtr: ["x2", "x4", "x6"] };
const ZAIF = { parol: ["s1"], tuz: 0, shifr: "sezar", k: 5, bayroq: "f1", ikki: false, filtr: ["x2", "x4", "x6"] };

test("himoyaYasa: narx, iz, shifrMatn, darvoza; xato: parol / kalit; hammasi 9 ≤ 10", () => {
  const h = Q.himoyaYasa(KUCHLI);
  assert.equal(h.xato, null);
  assert.equal(h.narx, 9);
  assert.equal(h.parolMatn, "zumrad12!kitob");
  assert.equal(h.iz, Q.iz("zumrad12!kitob", 23));
  assert.equal(h.shifrMatn, Q.vijener(Q.bayroq("f2").gap, "qkl"));
  assert.equal(h.darvoza, 0);
  const z = Q.himoyaYasa(ZAIF);
  assert.equal(z.xato, null);
  assert.equal(z.narx, 0);
  assert.equal(z.shifrMatn, Q.sezar(Q.bayroq("f1").gap, 5));
  assert.equal(Q.himoyaNarxi(z), 0);
  assert.equal(Q.himoyaYasa(Object.assign({}, ZAIF, { parol: [] })).xato, "parol");
  assert.equal(Q.himoyaYasa(Object.assign({}, ZAIF, { parol: ["s1", "s2", "s3", "s4", "s5"] })).xato, "parol");
  assert.equal(Q.himoyaYasa(Object.assign({}, ZAIF, { k: 26 })).xato, "kalit");
  assert.equal(Q.himoyaYasa(Object.assign({}, ZAIF, { k: 0 })).xato, "kalit");
  assert.equal(Q.himoyaYasa(Object.assign({}, KUCHLI, { kalit: "ab" })).xato, "kalit");
  assert.equal(Q.himoyaYasa(Object.assign({}, ZAIF, { tuz: 100 })).xato, "parol");
  assert.equal(Q.himoyaYasa(Object.assign({}, ZAIF, { filtr: ["x2"] })).darvoza, 2);
  assert.equal(Q.himoyaYasa(Object.assign({}, ZAIF, { filtr: ["x1", "x3", "x5"] })).darvoza, 3, "haqiqiylarini belgilash yordam bermaydi");
});

test("korinish: raqibga maslahat, iz, tuz bor/yo'q, shifr turi va matni, ikki — parol va kalit chiqmaydi", () => {
  const k = Q.korinish(Q.himoyaYasa(KUCHLI));
  assert.deepEqual(Object.keys(k).sort(), ["darvoza", "ikki", "iz", "kod", "maslahat", "shifr", "shifrMatn", "tuz"]);
  assert.equal(k.maslahat.length, 3);
  assert.equal(k.tuz, true);
  assert.equal(k.shifr, "kalitli");
  assert.match(k.shifrMatn, /^[a-z]{25,32}$/);
  assert.equal(k.ikki, true);
  assert.ok(!JSON.stringify(k).includes("qkl") && !JSON.stringify(k).includes("zumrad"));
});

test("qopolKuch / taxmin / jadvalHujumi / izTaxmin / shifrTaxmin / kalitTaxmin / fishingNatija", () => {
  const z = Q.himoyaYasa(ZAIF);
  const k = Q.himoyaYasa(KUCHLI);
  assert.deepEqual(Q.qopolKuch(z, 300).ochildi, true);
  assert.equal(Q.qopolKuch(k, 300).ochildi, false);
  assert.ok(Q.qopolKuch(k, 300).soniya > 300);
  assert.equal(Q.taxmin(z, ["s1"]).togri, true);
  assert.equal(Q.taxmin(z, ["s2"]).togri, false);
  assert.equal(Q.taxmin(k, ["s11", "r3", "b1", "s2"]).togri, true);
  const j = Q.jadvalHujumi(z);
  assert.deepEqual([j.mumkin, j.ochildi], [true, true]);
  assert.ok(j.parollar.includes("olma"));
  assert.deepEqual(Q.jadvalHujumi(k), { mumkin: false, ochildi: false, parollar: [] });
  const uch = Q.himoyaYasa(Object.assign({}, ZAIF, { parol: ["s11", "r3", "b1"] }));
  assert.equal(Q.jadvalHujumi(uch).ochildi, false, "3 karta jadvalda yo'q");
  assert.deepEqual(Q.izTaxmin(z, ["s1"], Q.iz("olma", 0)), { hisobTogri: true, mos: true, ochildi: true });
  assert.deepEqual(Q.izTaxmin(z, ["s1"], (Q.iz("olma", 0) + 1) % 100), { hisobTogri: false, mos: true, ochildi: false });
  assert.equal(Q.izTaxmin(z, ["s2"], Q.iz("kitob", 0)).ochildi, Q.iz("kitob", 0) === z.iz);
  assert.equal(Q.izTaxmin(k, ["zzz"], 5).ochildi, false);
  assert.deepEqual(Q.shifrTaxmin(z, 5), { togri: true, ochiq: Q.bayroq("f1").gap, bayroq: "qalqon" });
  assert.equal(Q.shifrTaxmin(z, 6).togri, false);
  assert.equal(Q.shifrTaxmin(z, 6).ochiq, Q.sezarOch(z.shifrMatn, 6));
  assert.equal(Q.shifrTaxmin(k, 5).togri, false, "kalitli shifrga siljish yaramaydi");
  assert.equal(Q.kalitTaxmin(k, "qkl").togri, true);
  assert.equal(Q.kalitTaxmin(k, "qkl").bayroq, "bayroq");
  assert.equal(Q.kalitTaxmin(k, "abc").togri, false);
  assert.equal(Q.kalitTaxmin(z, "abc").togri, false);
  const kod = Q.xatYasa({ kimdan: "k1", mavzu: "m4", havola: "h3", gap: "g3", imzo: "i1" });
  assert.deepEqual(Q.fishingNatija(z, kod, [true, true, false]), { ochildi: true, sizdi: ["kod"] });
  assert.deepEqual(Q.fishingNatija(z, kod, [true, false, false]), { ochildi: false, sizdi: [] });
  assert.deepEqual(Q.fishingNatija(z, kod, [true, false]), { ochildi: false, sizdi: [] }, "teng — ochilmaydi");
  assert.deepEqual(Q.fishingNatija(k, kod, [true, true]), { ochildi: true, sizdi: ["kod", "kalit"] }, "kalitli shifr + soxta havola → kalit ham sizadi");
  assert.deepEqual(Q.fishingNatija(z, null, [true]), { ochildi: false, sizdi: [] });
  const darvoza = Q.himoyaYasa(Object.assign({}, ZAIF, { filtr: [] }));
  assert.equal(Q.fishingNatija(darvoza, kod, [true, false, false]).ochildi, true, "darvoza ochiq — bittasi ochsa ham");
});

// ---------- O'yin holati ----------
const yangiOyin = (vaqt) => {
  const s = Q.create({ jamoalar: ["oy", "quyosh"], now: now0, vaqt: vaqt || { himoya: 300, hujum: 300, tahlil: 90 }, raundlar: 2 });
  Q.boshla(s, now0);
  return s;
};
test("create/boshla/himoyaQoy: lobbi → himoya; ikki jamoa himoya qo'ysa hujum boshlanadi; xato himoya qabul qilinmaydi", () => {
  const s = Q.create({ jamoalar: ["oy", "quyosh"], now: now0, raundlar: 2 });
  assert.equal(s.faza, "lobbi");
  assert.deepEqual(Object.keys(s.jamoa), ["oy", "quyosh"]);
  assert.deepEqual(s.jamoa.oy.urinish, { taxmin: 5, iz: 5, shifr: 0 });
  assert.equal(Q.himoyaQoy(s, "oy", ZAIF).ok, false, "lobbida himoya qo'yilmaydi");
  Q.boshla(s, now0);
  assert.equal(s.faza, "himoya");
  assert.equal(s.raund, 1);
  assert.equal(s.fazaTugaydi, now0 + 300000);
  assert.deepEqual(Q.himoyaQoy(s, "oy", Object.assign({}, ZAIF, { k: 30 })), { ok: false, xato: "kalit" });
  assert.deepEqual(Q.himoyaQoy(s, "oy", ZAIF), { ok: true, xato: null });
  assert.deepEqual(Q.tekshir(s, now0 + 1000), []);
  assert.equal(s.faza, "himoya");
  assert.equal(Q.himoyaQoy(s, "quyosh", Q.himoyaYasa(KUCHLI)).ok, true);
  const v = Q.tekshir(s, now0 + 2000);
  assert.equal(s.faza, "hujum");
  assert.equal(s.fazaTugaydi, now0 + 2000 + 300000);
  assert.ok(v.some((x) => x.kod === "faza-hujum"));
  assert.equal(Q.golib(s), null);
});

test("himoya vaqti tugasa, himoyasiz jamoaga eng oddiy himoya qo'yiladi; solo (himoya 0) — ikkalasi qo'ygach boshlanadi", () => {
  const s = yangiOyin();
  Q.himoyaQoy(s, "oy", KUCHLI);
  Q.tekshir(s, now0 + 300000);
  assert.equal(s.faza, "hujum");
  assert.equal(s.jamoa.quyosh.himoya.parolMatn, "olma");
  const solo = yangiOyin({ himoya: 0, hujum: 180, tahlil: 60 });
  assert.equal(solo.fazaTugaydi, null);
  Q.tekshir(solo, now0 + 10_000_000);
  assert.equal(solo.faza, "himoya", "vaqtsiz himoya o'zi tugamaydi");
  Q.himoyaQoy(solo, "oy", ZAIF);
  Q.himoyaQoy(solo, "quyosh", KUCHLI);
  Q.tekshir(solo, now0 + 5000);
  assert.equal(solo.faza, "hujum");
  assert.equal(solo.fazaTugaydi, now0 + 5000 + 180000);
});

test("to'liq raund: hujum qurollari, urinish chegarasi, jarima, bayroq, fishing → kod sizdi → ikki yiqildi; tahlil; 2-raund; tugadi, g'olib", () => {
  const s = yangiOyin();
  Q.himoyaQoy(s, "oy", KUCHLI);
  Q.himoyaQoy(s, "quyosh", ZAIF);
  Q.tekshir(s, now0 + 1000);
  let t = now0 + 2000;
  // oy → quyosh (zaif): qo'pol kuch darhol
  let n = Q.hujum(s, "oy", { tur: "qopol" }, t);
  assert.equal(n.ok, true);
  assert.equal(n.natija.ochildi, true);
  assert.equal(s.jamoa.quyosh.devor.parol.holat, "yiqildi");
  assert.equal(s.jamoa.oy.ochko, 1);
  assert.equal(n.voqea.kod, "qopol-ok");
  assert.equal(Q.hujum(s, "oy", { tur: "qopol" }, t).xato, "yiqilgan");
  // quyosh → oy (kuchli): qo'pol kuch — vaqt yetmaydi; 5 ta taxmin — keyin "urinish"
  n = Q.hujum(s, "quyosh", { tur: "qopol" }, t);
  assert.equal(n.natija.ochildi, false);
  assert.equal(s.jamoa.oy.devor.parol.holat, "turdi");
  for (let k = 0; k < 5; k++) assert.equal(Q.hujum(s, "quyosh", { tur: "taxmin", ids: ["s1"] }, t).ok, true);
  assert.equal(s.jamoa.oy.urinish.taxmin, 0);
  assert.equal(Q.hujum(s, "quyosh", { tur: "taxmin", ids: ["s11", "r3", "b1", "s2"] }, t).xato, "urinish");
  // jadval: oy tuzli — mumkin emas; quyosh tuzsiz, bitta so'z — yiqiladi
  n = Q.hujum(s, "quyosh", { tur: "jadval" }, t);
  assert.equal(n.natija.mumkin, false);
  assert.equal(n.voqea.kod, "jadval-tuz");
  n = Q.hujum(s, "oy", { tur: "jadval" }, t);
  assert.equal(n.natija.ochildi, true);
  assert.equal(s.jamoa.quyosh.devor.qulf.holat, "yiqildi");
  // iz: quyosh oy qulfiga hisob bilan
  n = Q.hujum(s, "quyosh", { tur: "iz", ids: ["s11", "r3", "b1", "s2"], hisob: Q.iz("zumrad12!kitob", 23) }, t);
  assert.equal(n.natija.ochildi, true);
  assert.equal(s.jamoa.oy.devor.qulf.holat, "yiqildi");
  assert.equal(s.jamoa.quyosh.ochko, 1);
  // shifr: xato → 15 s jarima; jarimada hujum rad etiladi; to'g'ri → +3 (devor 1 + bayroq 2)
  n = Q.hujum(s, "oy", { tur: "shifr", k: 6 }, t);
  assert.equal(n.natija.togri, false);
  assert.equal(s.jamoa.quyosh.jazoGacha, t + 15000);
  assert.equal(Q.hujum(s, "oy", { tur: "shifr", k: 5 }, t + 14000).xato, "jazo");
  n = Q.hujum(s, "oy", { tur: "shifr", k: 5 }, t + 15000);
  assert.equal(n.natija.bayroq, "qalqon");
  assert.equal(s.jamoa.oy.ochko, 1 + 1 + 3);
  assert.equal(s.jamoa.quyosh.urinish.shifr, 2);
  // kalitli shifr: kalit sizmagan — taxmin xato, jarima
  n = Q.hujum(s, "quyosh", { tur: "kalit", kalit: "abc" }, t);
  assert.equal(n.natija.togri, false);
  assert.equal(n.voqea.kod, "kalit-xato");
  // fishing: quyosh oyga kod so'raydigan xat yuboradi; ilmoqsiz xat rad etiladi; raundda bitta
  assert.equal(Q.hujum(s, "quyosh", { tur: "fishing", xat: { kimdan: "k1", mavzu: "m1", havola: "h1", gap: "g1", imzo: "i1" } }, t).xato, "ilmoq");
  n = Q.hujum(s, "quyosh", { tur: "fishing", xat: { kimdan: "k1", mavzu: "m4", havola: "h3", gap: "g3", imzo: "i1" } }, t);
  assert.equal(n.ok, true);
  assert.equal(n.natija.nomer, 0);
  assert.equal(Q.hujum(s, "quyosh", { tur: "fishing", xat: { kimdan: "k1", mavzu: "m4", havola: "h3", gap: "g3", imzo: "i1" } }, t).xato, "xat");
  // oy qorovullari ochdi → xat yiqildi, kod va kalit sizdi; parol hali turibdi — ikki turibdi
  n = Q.qorovulOvoz(s, "oy", 0, [true, true, false], t + 20000);
  assert.equal(n.ok, true);
  assert.deepEqual(n.natija, { ochildi: true, sizdi: ["kod", "kalit"] });
  assert.deepEqual(s.jamoa.oy.sizdi, ["kod", "kalit"]);
  assert.equal(s.jamoa.oy.devor.xat.holat, "yiqildi");
  assert.equal(s.jamoa.oy.devor.ikki.holat, "turdi");
  assert.equal(Q.qorovulOvoz(s, "oy", 0, [true], t + 21000).xato, "ovoz", "ikki marta ovoz berilmaydi");
  // sizgan kalit bilan shifr ochiladi
  n = Q.hujum(s, "quyosh", { tur: "kalit", kalit: "qkl" }, t + 20000);
  assert.equal(n.natija.togri, true);
  assert.equal(s.jamoa.quyosh.ochko, 1 + 1 + 3);
  // parol yiqilsa (taxmin tugagan — faza oxirida qo'pol kuch ham yetmaydi) ikki turadi; sun'iy: zaif parolli oyni tekshirish alohida testda
  const oldin = s.voqealar.length;
  const v = Q.tekshir(s, t + 300000);
  assert.equal(s.faza, "tahlil");
  assert.ok(v.length >= 1 && s.voqealar.length > oldin);
  assert.equal(s.jamoa.oy.devor.parol.holat, "turdi", "kuchli parol faza oxirida ham turadi");
  assert.ok(s.jamoa.oy.devor.parol.sabab.includes("vaqt yetmadi"));
  assert.equal(Q.hujum(s, "oy", { tur: "qopol" }, t + 300001).xato, "faza");
  // tahlil doskasi
  const th = Q.tahlil(s, "oy");
  assert.deepEqual(th.map((x) => x.devor), ["parol", "qulf", "shifr", "xat", "ikki"]);
  assert.deepEqual(th.map((x) => x.dars), [1, 2, 3, 4, 1]);
  assert.deepEqual(th.map((x) => x.holat), ["turdi", "yiqildi", "yiqildi", "yiqildi", "turdi"]);
  assert.ok(th.every((x) => typeof x.sabab === "string" && x.sabab.length > 5));
  const tq = Q.tahlil(s, "quyosh");
  assert.equal(tq[4].holat, "yoq");
  assert.equal(tq[4].dars, 5);
  assert.deepEqual(Q.hisob(s), { oy: 5, quyosh: 5 });
  // 2-raund: devorlar yangi, ochko saqlanadi
  Q.tekshir(s, t + 300000 + 90000);
  assert.equal(s.faza, "himoya");
  assert.equal(s.raund, 2);
  assert.equal(s.jamoa.oy.devor.qulf.holat, "turdi");
  assert.deepEqual(s.jamoa.oy.sizdi, []);
  assert.deepEqual(Q.hisob(s), { oy: 5, quyosh: 5 });
  t = t + 300000 + 90000 + 1000;
  Q.himoyaQoy(s, "oy", ZAIF);
  Q.himoyaQoy(s, "quyosh", ZAIF);
  Q.tekshir(s, t);
  assert.equal(s.faza, "hujum");
  Q.hujum(s, "oy", { tur: "shifr", k: 5 }, t + 100);
  Q.tekshir(s, t + 300000);
  assert.equal(s.faza, "tahlil");
  assert.equal(s.jamoa.oy.devor.parol.holat, "yiqildi", "zaif parol faza oxirida qo'pol kuchdan yiqiladi");
  assert.equal(s.jamoa.quyosh.devor.parol.holat, "yiqildi");
  Q.tekshir(s, t + 300000 + 90000);
  assert.equal(s.faza, "tugadi");
  assert.equal(s.fazaTugaydi, null);
  assert.deepEqual(Q.hisob(s), { oy: 5 + 3 + 1, quyosh: 5 + 1 });
  assert.equal(Q.golib(s), "oy");
  assert.equal(s.golib, "oy");
  assert.equal(s.voqealar[s.voqealar.length - 1].kod, "tugadi");
  assert.equal(Q.tekshir(s, t + 10_000_000).length, 0);
});

test("ikki: parol yiqilgan va kod sizgan — ikkalasi ham bo'lsagina yiqiladi (tartibdan qat'i nazar)", () => {
  const ikkiZaif = Object.assign({}, ZAIF, { ikki: true });
  // 1) avval parol, keyin kod
  let s = yangiOyin();
  Q.himoyaQoy(s, "oy", ikkiZaif);
  Q.himoyaQoy(s, "quyosh", KUCHLI);
  Q.tekshir(s, now0 + 1000);
  Q.hujum(s, "quyosh", { tur: "qopol" }, now0 + 2000);
  assert.equal(s.jamoa.oy.devor.parol.holat, "yiqildi");
  assert.equal(s.jamoa.oy.devor.ikki.holat, "turdi");
  Q.hujum(s, "quyosh", { tur: "fishing", xat: { kimdan: "k1", mavzu: "m4", havola: "h1", gap: "g4", imzo: "i1" } }, now0 + 3000);
  Q.qorovulOvoz(s, "oy", 0, [false, false], now0 + 4000);
  assert.equal(s.jamoa.oy.devor.xat.holat, "turdi");
  assert.equal(s.jamoa.oy.devor.ikki.holat, "turdi", "qorovullar o'chirdi — kod sizmadi");
  assert.equal(Q.hujum(s, "quyosh", { tur: "fishing", xat: { kimdan: "k1", mavzu: "m4", havola: "h1", gap: "g4", imzo: "i1" } }, now0 + 5000).xato, "xat");
  // 2) avval kod, keyin parol
  s = yangiOyin();
  Q.himoyaQoy(s, "oy", ikkiZaif);
  Q.himoyaQoy(s, "quyosh", KUCHLI);
  Q.tekshir(s, now0 + 1000);
  Q.hujum(s, "quyosh", { tur: "fishing", xat: { kimdan: "k1", mavzu: "m4", havola: "h1", gap: "g4", imzo: "i1" } }, now0 + 3000);
  const o = Q.qorovulOvoz(s, "oy", 0, [true, true, true], now0 + 4000);
  assert.deepEqual(o.natija.sizdi, ["kod"]);
  assert.equal(s.jamoa.oy.devor.ikki.holat, "turdi", "parol hali turibdi");
  Q.hujum(s, "quyosh", { tur: "taxmin", ids: ["s1"] }, now0 + 5000);
  assert.equal(s.jamoa.oy.devor.parol.holat, "yiqildi");
  assert.equal(s.jamoa.oy.devor.ikki.holat, "yiqildi");
  assert.equal(s.jamoa.quyosh.ochko, 3);
  assert.equal(Q.tahlil(s, "oy")[4].dars, 1);
  // 3) faza oxiridagi qo'pol kuch ham ikkini tekshiradi
  s = yangiOyin();
  Q.himoyaQoy(s, "oy", ikkiZaif);
  Q.himoyaQoy(s, "quyosh", KUCHLI);
  Q.tekshir(s, now0 + 1000);
  Q.hujum(s, "quyosh", { tur: "fishing", xat: { kimdan: "k1", mavzu: "m4", havola: "h1", gap: "g4", imzo: "i1" } }, now0 + 3000);
  Q.qorovulOvoz(s, "oy", 0, [true], now0 + 4000);
  Q.tekshir(s, now0 + 1000 + 300000);
  assert.equal(s.faza, "tahlil");
  assert.equal(s.jamoa.oy.devor.parol.holat, "yiqildi");
  assert.equal(s.jamoa.oy.devor.ikki.holat, "yiqildi");
});

test("darvoza: filtrda belgilanmagan firibgar xat — hujum boshlanishida xat devori yiqiladi, kod sizadi", () => {
  const s = yangiOyin();
  Q.himoyaQoy(s, "oy", Object.assign({}, KUCHLI, { filtr: ["x4"] })); // x2 va x6 (kod so'raydi) belgilanmadi
  Q.himoyaQoy(s, "quyosh", KUCHLI);
  const v = Q.tekshir(s, now0 + 1000);
  assert.equal(s.faza, "hujum");
  assert.equal(s.jamoa.oy.devor.xat.holat, "yiqildi");
  assert.ok(s.jamoa.oy.sizdi.includes("kod"));
  assert.ok(s.jamoa.oy.sizdi.includes("kalit"), "x6 soxta havola + kalitli shifr");
  assert.equal(s.jamoa.quyosh.ochko, 1);
  assert.equal(s.jamoa.quyosh.devor.xat.holat, "turdi");
  assert.ok(v.some((x) => x.kod === "darvoza" && x.jamoa === "quyosh" && x.nishon === "oy"));
  assert.equal(Q.hujum(s, "quyosh", { tur: "fishing", xat: { kimdan: "k1", mavzu: "m4", havola: "h3", gap: "g3", imzo: "i1" } }, now0 + 2000).xato, "yiqilgan");
});

test("voqealar: t, jamoa, nishon, devor, kod (qisqa kalit so'z), matn, ok", () => {
  const s = yangiOyin();
  Q.himoyaQoy(s, "oy", ZAIF);
  Q.himoyaQoy(s, "quyosh", ZAIF);
  Q.tekshir(s, now0 + 1000);
  Q.hujum(s, "oy", { tur: "taxmin", ids: ["s2"] }, now0 + 2000);
  for (const v of s.voqealar) {
    assert.ok(typeof v.t === "number" && typeof v.matn === "string" && typeof v.ok === "boolean");
    assert.match(v.kod, /^[a-z0-9-]{1,32}$/);
    assert.ok(v.jamoa === null || ["oy", "quyosh"].includes(v.jamoa));
  }
  const oxirgi = s.voqealar[s.voqealar.length - 1];
  assert.deepEqual([oxirgi.jamoa, oxirgi.nishon, oxirgi.devor, oxirgi.kod, oxirgi.ok], ["oy", "quyosh", "parol", "taxmin-xato", false]);
});

// ---------- Robotlar ----------
test("robotHimoya: 1 — lug'at paroli, tuzsiz, Sezar; 2 — o'rtacha; 3 — kuchli (4 karta, tuz, kalitli, ikki, narx 9); hammasi xatosiz", () => {
  const r = rngFrom(11);
  for (let k = 0; k < 30; k++) {
    const h1 = Q.robotHimoya(r, 1);
    assert.equal(h1.xato, null);
    assert.equal(Q.parolKuch(h1.parolMatn).lugatda, true);
    assert.equal(h1.tuz, 0);
    assert.equal(h1.shifr, "sezar");
    assert.equal(h1.ikki, false);
    assert.equal(h1.narx, 0);
    const h2 = Q.robotHimoya(r, 2);
    assert.equal(h2.xato, null);
    assert.equal(h2.parol.length, 2);
    assert.ok(h2.tuz >= 1 && h2.tuz <= 99);
    assert.equal(h2.darvoza, 0);
    const h3 = Q.robotHimoya(r, 3);
    assert.equal(h3.xato, null);
    assert.equal(h3.parol.length, 4);
    assert.equal(h3.shifr, "kalitli");
    assert.match(h3.kalit, /^[a-z]{3}$/);
    assert.equal(h3.ikki, true);
    assert.equal(h3.narx, 9);
    assert.equal(Q.parolKuch(h3.parolMatn).daraja, 3);
  }
});

test("robotHujum: 8–15 s da bir amal, har amal hujum() qabul qiladi; daraja 3 Sezarni chastota bilan ochadi, kalitni faqat sizganda ishlatadi", () => {
  for (const d of [1, 2, 3]) {
    const r = rngFrom(100 + d);
    const s = yangiOyin({ himoya: 0, hujum: 180, tahlil: 60 });
    Q.himoyaQoy(s, "oy", Q.himoyaYasa(Object.assign({}, ZAIF, { filtr: ["x2", "x4", "x6"] })));
    Q.himoyaQoy(s, "quyosh", Q.robotHimoya(r, d));
    Q.tekshir(s, now0 + 1000);
    // Birinchi chaqiriq faqat vaqtni belgilaydi: o'yinchi ekranni ko'rib ulgursin (5–10 s)
    assert.equal(Q.robotHujum(s, "quyosh", now0 + 1000, r, d), null, "birinchi amal darhol emas");
    const birinchi = s.jamoa.quyosh.robotKeyingi;
    assert.ok(birinchi >= now0 + 6000 && birinchi <= now0 + 11000, "birinchi amal 5–10 s da");
    let amallar = 0;
    let oxirgi = now0 + 1000;
    for (let t = now0 + 1000; t < now0 + 1000 + 180000; t += 500) {
      const amal = Q.robotHujum(s, "quyosh", t, r, d);
      if (!amal) continue;
      if (amallar > 0) assert.ok(t - oxirgi >= 8000 && t - oxirgi <= 15500, "oraliq " + (t - oxirgi));
      oxirgi = t;
      amallar++;
      const n = Q.hujum(s, "quyosh", amal, t);
      assert.ok(n.ok || ["urinish", "yiqilgan", "jazo"].includes(n.xato), d + ": " + JSON.stringify(amal) + " → " + n.xato);
      if (amal.tur === "fishing" && n.ok) {
        const xat = s.jamoa.oy.xatlar[n.natija.nomer].xat;
        assert.ok(xat.ilmoq, "robot xati ilmoqli");
        Q.qorovulOvoz(s, "oy", n.natija.nomer, [Q.robotQorovul(xat, r, 2)], t);
      }
    }
    // kuchli robot zaif qal'ani bir necha amalda yiqitadi, keyin qiladigan ishi qolmaydi — shuning uchun ≥ 4
    assert.ok(amallar >= 4, d + ": amallar " + amallar);
    if (d === 3) {
      assert.equal(s.jamoa.oy.devor.shifr.holat, "yiqildi", "daraja 3 chastota bilan topadi");
      assert.equal(s.jamoa.oy.devor.parol.holat, "yiqildi", "zaif parol qo'pol kuchdan");
      assert.equal(s.jamoa.oy.devor.qulf.holat, "yiqildi", "tuzsiz iz jadvaldan");
    }
    assert.equal(Q.robotHujum(s, "quyosh", now0 + 1000 + 180000, r, d), null, "faza tugagach amal yo'q");
  }
  // kalit sizmagan — robot kalitli shifrga tegmaydi
  const r = rngFrom(9);
  const s = yangiOyin({ himoya: 0, hujum: 180, tahlil: 60 });
  Q.himoyaQoy(s, "oy", KUCHLI);
  Q.himoyaQoy(s, "quyosh", KUCHLI);
  Q.tekshir(s, now0 + 1000);
  for (let t = now0 + 1000; t < now0 + 100000; t += 1000) {
    const amal = Q.robotHujum(s, "quyosh", t, r, 3);
    if (amal) assert.notEqual(amal.tur, "kalit");
  }
});

test("robotQorovul: bool; haqiqiy xatni ochadi, oshkora soxtani kam ochadi; daraja 3 kod so'ragan xatni ochmaydi", () => {
  const r = rngFrom(5);
  const haqiqiy = Q.haqiqiyXat(r);
  const oshkora = Q.xatYasa({ kimdan: "k6", mavzu: "m6", havola: "h4", gap: "g7", imzo: "i4" });
  const kod = Q.xatYasa({ kimdan: "k1", mavzu: "m4", havola: "h1", gap: "g3", imzo: "i1" });
  let h = 0;
  let o = 0;
  let k1 = 0;
  for (let i = 0; i < 300; i++) {
    const a = Q.robotQorovul(haqiqiy, r, 2);
    assert.equal(typeof a, "boolean");
    if (a) h++;
    if (Q.robotQorovul(oshkora, r, 2)) o++;
    if (Q.robotQorovul(kod, r, 1)) k1++;
    assert.equal(Q.robotQorovul(kod, r, 3), false);
  }
  assert.equal(h, 300);
  assert.ok(o < 60, "oshkora (kutilgan ~30): " + o);
  assert.ok(k1 > 150, "daraja 1 ko'pincha ochadi: " + k1);
  assert.equal(Q.robotQorovul(null, r, 1), false);
});
