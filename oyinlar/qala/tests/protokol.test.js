// Qalʼa protokoli: jamoaga boʻlish, rollar, paketlar — hammasi umumiy/js/onlayn.js tekshiruvidan oʻtadi (sof, Node)
const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../js/protokol.js");
const onlayn = require("../../umumiy/js/onlayn.js");

const ids = (n, p) => Array.from({ length: n }, (_, k) => (p || "p") + String(k).padStart(2, "0"));
const xabar = (type, data) => ({ type, data, t: Date.now(), from: "host" });
const tarmoqdanOtadi = (type, data) => {
  assert.ok(onlayn.validMessage(xabar(type, data), P.TYPES), `${type} paketi onlayn.validMessage dan oʻtmadi: ${JSON.stringify(data).slice(0, 200)}`);
  assert.ok(JSON.stringify(xabar(type, data)).length < 4096, `${type} paketi 4096 baytdan katta`);
};

// Soxta oʻyin holati — qala.js shakli (create) boʻyicha, sirsiz tekshirish uchun
function soxtaHolat(now) {
  const jam = () => ({ himoya: null, devor: { parol: { holat: "turdi" }, qulf: { holat: "yiqildi" }, shifr: { holat: "turdi" }, xat: { holat: "turdi" }, ikki: { holat: "turdi" } }, ochko: 1, urinish: { taxmin: 4, iz: 5, shifr: 0 }, sizdi: ["kod"] });
  return { faza: "hujum", raund: 1, fazaTugaydi: now + 123456, jamoa: { oy: jam(), quyosh: jam() },
    voqealar: [{ t: now, jamoa: null, nishon: null, devor: null, kod: "faza-hujum", matn: "1-raund: hujum", ok: true },
      { t: now, jamoa: "oy", nishon: "quyosh", devor: "qulf", kod: "jadval-ok", matn: "Iz tayyor jadvaldan topildi", ok: true },
      { t: now, jamoa: "quyosh", nishon: "oy", devor: "xat", kod: "fishing-ochirildi", matn: "Qorovullar soxta xatni oʻchirdi", ok: false }] };
}
const korinish = { maslahat: ["Uzunligi 7", "Soʻz + raqam", "Soʻz lugʻatda bor"], kod: { uzunlik: 7, turlar: ["soz", "raqam"], lugat: 1 }, iz: 42, tuz: false, shifr: "sezar", shifrMatn: "xyzabcxyzabcxyzabcxyzabcxyzabcxyzabcxyzabc", ikki: true };

test("jamoagaBol: navbat bilan, jamoada ≤ 15", () => {
  const j = P.jamoagaBol(ids(4));
  assert.deepEqual(j, { oy: ["p00", "p02"], quyosh: ["p01", "p03"] });
  const katta = P.jamoagaBol(ids(40));
  assert.equal(katta.oy.length, 15);
  assert.equal(katta.quyosh.length, 15);
  assert.equal(P.jamoaTanla([{ id: "a", jam: "oy" }]), "quyosh");
  assert.equal(P.jamoaTanla([]), "oy");
});

test("rollar (himoya): har devorga quruvchi, kam odamda bir kishi bir nechta devor, koʻpda 1–3 kishi", () => {
  const ikki = P.rollar({ oy: ["a", "b"], quyosh: ["c", "d", "e"] }, 1, "himoya");
  const qoplangan = (jam) => Object.values(ikki).filter((r) => r.jam === jam).flatMap((r) => r.dev).sort();
  assert.deepEqual(qoplangan("oy"), [...P.DEVORLAR].sort());
  assert.deepEqual(qoplangan("quyosh"), [...P.DEVORLAR].sort());
  assert.ok(Object.values(ikki).every((r) => r.rol === "qur"));
  // 2-raundda devorlar suriladi — boshqa devor quradi
  const r2 = P.rollar({ oy: ["a", "b"], quyosh: ["c", "d", "e"] }, 2, "himoya");
  assert.notDeepEqual(r2.a.dev, ikki.a.dev);
  const katta = P.rollar({ oy: ids(15, "o"), quyosh: ids(15, "q") }, 1, "himoya");
  for (const d of P.DEVORLAR) {
    const n = Object.values(katta).filter((r) => r.jam === "oy" && r.dev.includes(d)).length;
    assert.ok(n >= 1 && n <= 3, `${d}: ${n} quruvchi`);
  }
});

test("rollar (hujum): yarmi hujumchi, yarmi qorovul; nishonlar 4 devorni qoplaydi; 2-raundda almashadi", () => {
  const j = { oy: ids(6, "o"), quyosh: ids(2, "q") };
  const r1 = P.rollar(j, 1, "hujum");
  const huj = Object.keys(r1).filter((id) => r1[id].jam === "oy" && r1[id].rol === "huj");
  const qor = Object.keys(r1).filter((id) => r1[id].jam === "oy" && r1[id].rol === "qor");
  assert.equal(huj.length, 3);
  assert.equal(qor.length, 3);
  assert.ok(qor.every((id) => r1[id].dev.length === 0));
  assert.deepEqual(huj.flatMap((id) => r1[id].dev).sort(), [...P.HUJUM_DEVORLARI].sort()); // 3 hujumchi — 4 devor, biri ikkita
  assert.equal(r1.q00.rol, "huj");
  assert.deepEqual(r1.q00.dev, P.HUJUM_DEVORLARI); // yolgʻiz hujumchi hammasiga
  assert.equal(r1.q01.rol, "qor");
  const r2 = P.rollar(j, 2, "hujum");
  assert.ok(huj.every((id) => r2[id].rol === "qor"));
  assert.ok(qor.every((id) => r2[id].rol === "huj"));
  const koplar = P.rollar({ oy: ids(14, "o"), quyosh: [] }, 1, "hujum");
  assert.ok(Object.values(koplar).filter((r) => r.rol === "huj").every((r) => r.dev.length === 1));
  assert.ok(P.DEVORLAR.indexOf("ikki") >= 0 && !P.HUJUM_DEVORLARI.includes("ikki"));
});

test("rol paketi: tarmoqdan oʻtadi, qaytib oʻqiladi, boʻsh rollar", () => {
  const rollar = P.rollar({ oy: ids(15, "o"), quyosh: ids(15, "q") }, 1, "hujum");
  const p = P.rolPaket(rollar, 1, "hujum", { o03: 1 });
  assert.ok(P.yaxshiRol(p));
  tarmoqdanOtadi("rol", p);
  assert.equal(Object.keys(p).length, 7);
  const men = P.rolOl(p, "o03");
  assert.deepEqual(men, { jam: "oy", rol: rollar.o03.rol, dev: rollar.o03.dev, bosh: true });
  assert.equal(P.rolOl(p, "yoq"), null);
  const bosh = P.boshRollar(p, "oy");
  assert.deepEqual(bosh.map((b) => b.id), ["o03"]);
  assert.deepEqual(P.boshRollar(p, "quyosh"), []);
  // buzilgan paketlar
  assert.ok(!P.yaxshiRol(Object.assign({}, p, { rol: p.rol.map(() => "x") })));
  assert.ok(!P.yaxshiRol(Object.assign({}, p, { dev: p.dev.map(() => "parol-yoq") })));
  assert.ok(!P.yaxshiRol(Object.assign({}, p, { jam: p.jam.slice(1) })));
  assert.ok(!P.yaxshiRol({}));
});

test("maslahat kodi (qala.korinish().kod) → kalit soʻzlar → matn (qala.maslahatMatn bilan bir xil)", () => {
  const kod = { uzunlik: 7, turlar: ["soz", "raqam"], lugat: 1 };
  const t = P.maslahatTokenlar(kod);
  assert.deepEqual(t, ["uz:7", "tr:soz-raqam", "lg:1"]);
  assert.ok(t.every(P.token));
  assert.deepEqual(P.maslahatKodOl(t), kod);
  assert.deepEqual(P.maslahatMatn(kod), ["Uzunligi 7", "Soʻz + raqam", "Soʻz lugʻatda bor"]);
  assert.deepEqual(P.maslahatMatn({ uzunlik: 3, turlar: ["raqam"], lugat: 2 }), ["Uzunligi 3", "Raqam", "Soʻz yoʻq"]);
  assert.deepEqual(P.maslahatMatn(P.maslahatKodOl(P.maslahatTokenlar({ uzunlik: 0, turlar: [], lugat: 0 }))), ["Uzunligi 0", "Karta yoʻq", "Soʻz lugʻatda yoʻq"]);
  assert.ok(P.token(P.maslahatTokenlar({ uzunlik: 20, turlar: ["soz", "raqam", "belgi", "soz"], lugat: 0 })[1]));
  assert.deepEqual(P.maslahatTokenlar(null), []);
  assert.deepEqual(P.bolak("abcdefghijklmnopqrstuvwxyzabcdefghij"), ["abcdefghijklmnopqrstuvwxyzabcdef", "ghij"]);
  assert.equal(P.birlashtir(P.bolak("qalqon")), "qalqon");
});

// qala.js bor boʻlsa — haqiqiy korinish bilan ham sinaymiz (mantiq agenti parallel yozadi)
test("qala.js bilan: korinish → paket → holat matnlari bir xil", (t) => {
  let Q = null;
  try { Q = require("../js/qala.js"); } catch (e) { t.skip("qala.js hali yoʻq"); return; }
  const h = Q.himoyaYasa({ parol: ["s1", "r1"], tuz: 7, shifr: "sezar", k: 3, bayroq: "f2", ikki: true, filtr: [] });
  assert.equal(h.xato, null);
  const kor = Q.korinish(h);
  const s = Q.create({ now: 1000 });
  Q.boshla(s, 1000);
  const p = P.paket(s, 1000, { kor: { oy: kor, quyosh: kor } });
  assert.ok(P.yaxshiPaket(p));
  tarmoqdanOtadi("holat", p);
  const hol = P.holat(p, 1000);
  assert.deepEqual(hol.jamoa.oy.korinish.maslahat, kor.maslahat);
  assert.equal(hol.jamoa.oy.korinish.shifrMatn, kor.shifrMatn);
  assert.equal(hol.jamoa.oy.korinish.iz, kor.iz);
  assert.equal(hol.jamoa.oy.korinish.tuz, true);
  // xat paketi — mantiq xatining id'lari bilan
  const xat = Q.haqiqiyXat(() => 0.3);
  const xp = P.xatPaket("oy", 1, [xat.ids, xat.ids, xat.ids, xat.ids]);
  assert.ok(P.yaxshiXat(xp));
  tarmoqdanOtadi("xat", xp);
});

test("holat paketi: yassi, ≤ 32 maydon, tarmoqdan oʻtadi, sirsiz, qaytib oʻqiladi", () => {
  const now = 1000000;
  const s = soxtaHolat(now);
  const jv = [{ id: "p01", tur: "taxmin", kod: "0", seq: 1 }, { id: "p02", tur: "iz", kod: "h1m1o1", seq: 2 }];
  const p = P.paket(s, now, { kor: { oy: korinish, quyosh: Object.assign({}, korinish, { tuz: true, shifr: "kalitli" }) }, hq: { oy: { parol: 1, shifr: 1 } }, jv, kalit: { quyosh: "abc" } });
  assert.ok(Object.keys(p).length <= 32);
  assert.ok(P.yaxshiPaket(p), "paket oʻzimizning tekshiruvdan oʻtmadi");
  tarmoqdanOtadi("holat", p);
  const matn = JSON.stringify(p);
  assert.ok(!/Uzunligi|lugʻat/.test(matn), "maslahat matni tarmoqqa chiqdi");
  const h = P.holat(p, now + 5000);
  assert.equal(h.faza, "hujum");
  assert.equal(h.raund, 1);
  assert.equal(Math.round((h.fazaTugaydi - (now + 5000)) / 1000), 124);
  assert.equal(h.jamoa.oy.devor.qulf.holat, "yiqildi");
  assert.equal(h.jamoa.oy.devor.parol.holat, "turdi");
  assert.equal(h.jamoa.oy.qoyildi.parol, true);
  assert.equal(h.jamoa.oy.qoyildi.qulf, false);
  assert.deepEqual(h.jamoa.oy.korinish.maslahat, ["Uzunligi 7", "Soʻz + raqam", "Soʻz lugʻatda bor"]);
  assert.equal(h.jamoa.oy.korinish.iz, 42);
  assert.equal(h.jamoa.oy.korinish.shifrMatn, korinish.shifrMatn);
  assert.equal(h.jamoa.quyosh.korinish.tuz, true);
  assert.equal(h.jamoa.quyosh.korinish.shifr, "kalitli");
  assert.equal(h.jamoa.quyosh.kalit, "abc");
  assert.equal(h.jamoa.oy.kalit, "");
  assert.deepEqual(h.jamoa.oy.urinish, { taxmin: 4, iz: 5, shifr: 0 });
  assert.deepEqual(h.jamoa.oy.sizdi, ["kod"]);
  assert.deepEqual(p.vq, ["-:-:-:faza-hujum", "0:1:qulf:jadval-ok", "1:0:xat:fishing-ochirildi"]);
  assert.ok(p.vq.every((v) => v.length <= 32) && !/tayyor|Qorovullar/.test(matn), "voqea matni tarmoqqa chiqdi");
  assert.deepEqual(h.voqealar, [
    { jamoa: null, nishon: null, devor: null, kod: "faza-hujum", ok: true },
    { jamoa: "oy", nishon: "quyosh", devor: "qulf", kod: "jadval-ok", ok: true },
    { jamoa: "quyosh", nishon: "oy", devor: "xat", kod: "fishing-ochirildi", ok: false }]);
  // eng uzun kod ham tokenga sigʻadi
  assert.ok(P.token(P.voqeaKod({ jamoa: "quyosh", nishon: "oy", devor: "shifr", kod: "fishing-ochirildi" })));
  assert.deepEqual(h.javoblar, jv);
  assert.equal(h.tugadi, false);
  assert.ok(h.tarmoq);
  // boʻsh koʻrinish (himoya fazasi) ham oʻtadi
  const p2 = P.paket(Object.assign(s, { faza: "himoya" }), now, {});
  assert.ok(P.yaxshiPaket(p2));
  tarmoqdanOtadi("holat", p2);
  assert.ok(!P.yaxshiPaket(Object.assign({}, p, { yq: [1, 2] })));
  assert.ok(!P.yaxshiPaket(Object.assign({}, p, { f: "yoq" })));
});

test("yakun paketi: ids/jam/och/dev/golib — gʻolib jamoa oldinda, 30 kishida ham 4 KB dan kichik", () => {
  const now = 1000000;
  const s = soxtaHolat(now);
  s.faza = "tugadi";
  s.jamoa.quyosh.ochko = 5;
  const rollar = P.rollar({ oy: ids(15, "o"), quyosh: ids(15, "q") }, 2, "hujum");
  const n = P.natijaPaket(s, rollar, { o02: 3, q05: 2 }, "quyosh");
  assert.equal(n.tugadi, 1);
  assert.equal(n.ids.length, 30);
  assert.ok(n.ids.slice(0, 15).every((id) => id.startsWith("q")));
  assert.equal(n.ids[0], "q05");
  assert.equal(n.ids[15], "o02");
  assert.deepEqual(n.jam.slice(0, 2), [1, 1]);
  assert.equal(n.och[0], 5);
  assert.equal(n.dev[0], 2);
  assert.equal(n.golib, "quyosh");
  const songgi = Object.assign(P.paket(s, now, { kor: { oy: korinish, quyosh: korinish } }), n);
  assert.ok(Object.keys(songgi).length <= 32);
  tarmoqdanOtadi("holat", songgi);
  assert.equal(songgi.tugadi, 1);
  assert.equal(P.natijaPaket(s, rollar, {}, null).golib, "durang");
});

test("oʻyinchi → boshlovchi: himoya, amal, ovoz tekshiruvi", () => {
  assert.ok(P.yaxshiHimoya({ dev: "parol", ids: ["s1", "r2"] }));
  assert.ok(!P.yaxshiHimoya({ dev: "parol", ids: [] }));
  assert.ok(P.yaxshiHimoya({ dev: "qulf", tuz: 0 }));
  assert.ok(!P.yaxshiHimoya({ dev: "qulf", tuz: 100 }));
  assert.ok(P.yaxshiHimoya({ dev: "shifr", tur: "sezar", k: 3, bayroq: "f1" }));
  assert.ok(P.yaxshiHimoya({ dev: "shifr", tur: "kalitli", kalit: "abc", bayroq: "f1" }));
  assert.ok(!P.yaxshiHimoya({ dev: "shifr", tur: "kalitli", kalit: "ab1", bayroq: "f1" }));
  assert.ok(P.yaxshiHimoya({ dev: "ikki", ikki: 1 }));
  assert.ok(P.yaxshiHimoya({ dev: "xat", filtr: ["x1", "x3"] }));
  assert.ok(!P.yaxshiHimoya({ dev: "yoq" }));
  for (const d of [{ dev: "parol", ids: ["s1", "r2"] }, { dev: "shifr", tur: "kalitli", kalit: "abc", bayroq: "f1" }]) tarmoqdanOtadi("himoya", d);

  assert.ok(P.yaxshiAmal({ tur: "qopol", dev: "parol" }));
  assert.ok(P.yaxshiAmal({ tur: "taxmin", dev: "parol", ids: ["s1"] }));
  assert.ok(P.yaxshiAmal({ tur: "iz", dev: "qulf", ids: ["s1"], hisob: 42 }));
  assert.ok(!P.yaxshiAmal({ tur: "iz", dev: "qulf", ids: ["s1"], hisob: 142 }));
  assert.ok(P.yaxshiAmal({ tur: "shifr", dev: "shifr", k: 25 }));
  assert.ok(!P.yaxshiAmal({ tur: "shifr", dev: "shifr", k: 26 }));
  assert.ok(P.yaxshiAmal({ tur: "kalit", dev: "shifr", kalit: "xyz" }));
  const f = P.fishingPaket("xat", { kimdan: "k1", mavzu: "m2", havola: "h3", gap: "g4", imzo: "i5" });
  assert.ok(P.yaxshiAmal(f));
  assert.deepEqual(P.fishingQismlar(f), { kimdan: "k1", mavzu: "m2", havola: "h3", gap: "g4", imzo: "i5" });
  assert.ok(!P.yaxshiAmal({ tur: "fishing", dev: "xat", k: "k1" }));
  assert.ok(!P.yaxshiAmal({ tur: "qopol", dev: "ikki" }));
  assert.ok(P.yaxshiAmal({ tur: "rol", kim: "abc123" }));
  assert.ok(!P.yaxshiAmal({ tur: "rol" }));
  tarmoqdanOtadi("amal", f);
  assert.ok(P.yaxshiOvoz({ n: 1, ov: [1, 0, 0, 1] }));
  assert.ok(!P.yaxshiOvoz({ n: 1, ov: [1, 0, 0] }));
  tarmoqdanOtadi("ovoz", { n: 1, ov: [1, 0, 0, 1] });
});

test("xat paketi: 4 xat qism id'lari bilan, soxtasining oʻrni yoʻq; javob paketi alohida", () => {
  const xatlar = [1, 2, 3, 4].map((i) => ({ kimdan: "k" + i, mavzu: "m" + i, havola: "h" + i, gap: "g" + i, imzo: "i" + i }));
  const p = P.xatPaket("quyosh", 1, xatlar);
  assert.ok(P.yaxshiXat(p));
  tarmoqdanOtadi("xat", p);
  assert.equal(p.s, undefined);
  assert.deepEqual(P.xatlarOl(p), xatlar);
  const j = P.xatJavobPaket("quyosh", 1, 2, true);
  assert.ok(P.yaxshiXat(j));
  tarmoqdanOtadi("xat", j);
  assert.equal(P.xatlarOl(j), null);
  assert.ok(!P.yaxshiXat({ jam: "oy", n: 1, k: ["a"] }));
});

test("kimlik: 6 belgi, tarmoq kaliti", () => {
  const k = P.kimlik(() => 0.5);
  assert.match(k, /^[a-z2-9]{6}$/);
  assert.ok(P.token(k));
});

// Brauzer sinovida topildi: birinchi fishing xatining raqami 0 (qala.hujum natija.nomer — indeks) — paket tashlanmasin
test("xat va ovoz paketi: raqam 0 ham to'g'ri", () => {
  const P = require("../js/protokol.js");
  const ids = { kimdan: "k1", mavzu: "m4", havola: "h3", gap: "g3", imzo: "i1" };
  assert.equal(P.yaxshiXat(P.xatPaket("oy", 0, [ids, ids, ids, ids])), true);
  assert.equal(P.yaxshiXat(P.xatJavobPaket("oy", 0, 2, true)), true);
  if (P.yaxshiOvoz) assert.equal(P.yaxshiOvoz({ n: 0, ov: [0, 1, 0, 0] }), true);
});
