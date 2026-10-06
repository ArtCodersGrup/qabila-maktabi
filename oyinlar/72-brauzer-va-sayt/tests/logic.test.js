// 72-o'yin: brauzer va sayt — bank butunligi, tarix (orqaga/oldinga), qidiruv, generatorlar va tekshiruvlar.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
// make(r, prev, tier) dan ketma-ket vazifalar
function each(make, count, tier, seed) {
  const r = rngFrom(seed || 72);
  const out = [];
  let prev = null;
  for (let k = 0; k < count; k++) {
    prev = make(r, prev, tier);
    out.push(prev);
  }
  return out;
}
const matni = (p) => L.norm(p.sarlavha + " " + p.matn.join(" "));

// ---------- Bank ----------
test("bank: 8–10 sayt, manzillar yagona, har sahifada sarlavha, matn, rasm; havolalar mavjud sahifaga", () => {
  const manzillar = L.SAHIFALAR.map((p) => p.manzil);
  assert.equal(new Set(manzillar).size, manzillar.length, "manzillar takrorlanmaydi");
  assert.equal(new Set(L.SAHIFALAR.map((p) => p.id)).size, L.SAHIFALAR.length, "id lar takrorlanmaydi");
  const saytlar = new Set(manzillar.map((m) => m.split("/")[0]));
  assert.ok(saytlar.size >= 8 && saytlar.size <= 10, `saytlar soni: ${saytlar.size}`);
  for (const p of L.SAHIFALAR) {
    assert.match(p.manzil, /^[a-z]+\.uz(\/[a-z]+)*$/, p.manzil);
    assert.ok(p.sarlavha && p.sarlavha.length > 2, p.id);
    assert.ok(Array.isArray(p.matn) && p.matn.length >= 1 && p.matn.every((g) => typeof g === "string" && g.length > 5), p.id);
    assert.ok(p.id === L.QIDIRUV || p.matn.length >= 2, `${p.id}: kamida 2 gap`);
    assert.ok(p.matn.length <= 4, `${p.id}: koʻpi bilan 4 gap`);
    assert.ok(typeof p.rasm === "string" && p.rasm, p.id);
    assert.ok([null, "parol", "telefon"].includes(p.soroq), p.id);
    assert.equal(typeof p.qulf, "boolean");
    for (const l of p.havolalar) {
      assert.ok(L.SAHIFA[l.sahifa], `${p.id} → ${l.sahifa} yoʻq`);
      assert.notEqual(l.sahifa, p.id, "sahifa oʻziga havola bermaydi");
      assert.ok(l.matn && l.matn.length > 1);
    }
    // Matnda faqat to'g'ri apostroflar (QOIDALAR §2)
    for (const s of [p.sarlavha].concat(p.matn, p.havolalar.map((l) => l.matn))) assert.ok(!/['`’]/.test(s), `apostrof: ${s}`);
  }
  assert.ok(L.SAHIFA[L.BOSH] && L.SAHIFA[L.QIDIRUV]);
  assert.ok(L.QALQIB_SAHIFALAR.length >= 2 && L.SOROQ_SAHIFALAR.length >= 2);
  assert.ok(L.SOROQ_SAHIFALAR.every((id) => !L.SAHIFA[id].qulf), "soʻrovchi saytda qulf yoʻq");
  // Telefon chiplari: so'rovchi saytlar yo'q, qolganlari bor
  assert.ok(!L.CHIP_MANZILLAR.some((m) => L.SOROQ_SAHIFALAR.includes(L.manzilTop(m).id)));
  assert.ok(L.CHIP_MANZILLAR.includes("qidiruv.uz") && L.CHIP_MANZILLAR.includes("hayvonlar.uz/tuyalar"));
});

test("manzil: katta harf, bo'sh joy, https://, www., oxirgi / farq qilmaydi; noma'lum — null", () => {
  assert.equal(L.manzilTop("hayvonlar.uz").id, "hayvonlar");
  assert.equal(L.manzilTop("  HAYVONLAR.uz/Tuyalar/ ").id, "tuyalar");
  assert.equal(L.manzilTop("https://www.qabila.uz").id, "qabila");
  assert.equal(L.manzilTop("hayvonlar"), null);
  assert.equal(L.manzilTop("hayvonlar.ru"), null);
  assert.equal(L.manzilTop(""), null);
});

// ---------- Tarix ----------
test("tarix: och qo'shadi, orqaga/oldinga yuradi, yangi sahifa oldinga yo'lini o'chiradi", () => {
  let h = L.yangi();
  assert.equal(L.joriyId(h), L.BOSH);
  assert.ok(!L.orqagaMumkin(h) && !L.oldingaMumkin(h));
  assert.equal(L.orqaga(h), h, "boshida orqaga — holat o'zgarmaydi");
  assert.equal(L.och(h, "   "), h, "bo'sh manzil — o'zgarmaydi");
  h = L.och(h, "Hayvonlar.uz");
  assert.equal(L.joriyId(h), "hayvonlar");
  h = L.havola(h, "tuyalar");
  assert.equal(L.joriyId(h), "tuyalar");
  assert.equal(L.havola(h, "mars"), h, "bunday havola yo'q — o'zgarmaydi");
  assert.equal(h.tarix.length, 3);
  const b = L.orqaga(h);
  assert.equal(L.joriyId(b), "hayvonlar");
  assert.ok(L.oldingaMumkin(b));
  assert.equal(L.joriyId(L.oldinga(b)), "tuyalar");
  assert.equal(L.oldinga(h), h, "oxirida oldinga — o'zgarmaydi");
  const y = L.och(b, "maktab.uz");
  assert.deepEqual(y.tarix.map((e) => e.id), ["qabila", "hayvonlar", "maktab"], "oldinga yo'li o'chdi");
  assert.ok(!L.oldingaMumkin(y));
  // Noma'lum sayt — tarixda id null, manzil saqlanadi
  const n = L.och(y, "hayvonlar.ru");
  assert.equal(L.joriyId(n), null);
  assert.equal(L.joriy(n).manzil, "hayvonlar.ru");
  assert.equal(L.sahifa(n), null);
  assert.equal(L.joriyId(L.orqaga(n)), "maktab");
  // Holat o'zgarmas: eski holatga tegilmagan
  assert.equal(L.joriyId(h), "tuyalar");
});

test("qidiruv tarixi, natija, chiq va takliflar", () => {
  let h = L.och(L.yangi(), "qidiruv.uz");
  assert.equal(L.joriy(h).soz, "");
  h = L.qidirOch(h, " tuya ");
  assert.equal(L.joriyId(h), "qidiruv");
  assert.equal(L.joriy(h).soz, "tuya");
  const n = L.natija(h, "tuyalar");
  assert.equal(L.joriyId(n), "tuyalar");
  assert.equal(L.natija(h, "yoq-sahifa"), h);
  assert.equal(L.joriy(L.orqaga(n)).soz, "tuya", "orqaga — natijalar qaytadi");
  // chiq: orqaga; tarix bo'lmasa — bosh sahifa
  assert.equal(L.joriyId(L.chiq(n)), "qidiruv");
  const s = L.yangi("sovga");
  assert.equal(L.joriyId(L.chiq(s)), L.BOSH);
  // takliflar: oxirgilari birinchi, joriy emas, takrorsiz, 3 tagacha, boshlanishi bo'yicha
  let t = L.yangi();
  for (const m of ["hayvonlar.uz", "maktab.uz", "hayvonlar.uz", "ertaklar.uz", "sayyoralar.uz", "obhavo.uz"]) t = L.och(t, m);
  assert.deepEqual(L.takliflar(t, ""), ["sayyoralar.uz", "ertaklar.uz", "hayvonlar.uz"]);
  assert.deepEqual(L.takliflar(t, "ma"), ["maktab.uz"]);
  assert.deepEqual(L.takliflar(t, "ob"), [], "joriy sahifa taklif qilinmaydi");
});

// ---------- Qidiruv ----------
test("qidir: katta-kichik harf va apostrof turi farq qilmaydi, bo'sh so'z — hech narsa, so'rovchi saytlar chiqmaydi", () => {
  const a = L.qidir("tuya").map((p) => p.id);
  assert.deepEqual(L.qidir("TUYA").map((p) => p.id), a);
  assert.deepEqual(L.qidir(" Tuya ").map((p) => p.id), a);
  assert.equal(a[0], "tuyalar");
  for (const s of ["oʻrmon", "o'rmon", "o`rmon", "ormon", "OʻRMON"]) assert.deepEqual(L.qidir(s).map((p) => p.id), ["zumrad"], s);
  for (const s of ["ob-havo", "obhavo", "Ob havo", "OB-HAVO"]) assert.equal(L.qidir(s)[0].id, "obhavo", s);
  assert.deepEqual(L.qidir(""), []);
  assert.deepEqual(L.qidir("a"), []);
  assert.deepEqual(L.qidir("zzzz"), []);
  assert.deepEqual(L.qidir("tuya suv").map((p) => p.id), ["tuyalar"], "ikki so'z — ikkalasi ham bor sahifa");
  for (const p of L.qidir("parol")) assert.ok(!p.soroq);
  assert.ok(!L.qidir("qidiruv").some((p) => p.id === L.QIDIRUV));
  assert.ok(L.QIDIRUV_SOZLAR.every((s) => L.qidir(s).length > 0), "har chip so'zi biror sahifani topadi");
});

test("xazina banki: javob sahifada bor, kalit bo'yicha natija o'rni tier ga mos, 4 variant, chip so'zlari kalitlarni qamraydi", () => {
  assert.ok(L.XAZINA.length >= 12);
  for (const t of [0, 1, 2]) assert.ok(L.XAZINA.filter((q) => q.tier === t).length >= 3, `tier ${t}`);
  for (const q of L.XAZINA) {
    const p = L.SAHIFA[q.sahifa];
    assert.ok(p, q.sahifa);
    assert.ok(matni(p).includes(L.norm(q.javob)), `${q.savol} → ${q.javob} sahifada yoʻq`);
    assert.ok(L.javobGapi(p, q.javob) >= 0 || L.norm(p.sarlavha).includes(L.norm(q.javob)));
    assert.equal(new Set([q.javob].concat(q.notogri)).size, 4, q.savol);
    assert.ok(L.QIDIRUV_SOZLAR.includes(q.kalit), `chiplarda «${q.kalit}» yoʻq`);
    const nat = L.qidir(q.kalit);
    const idx = nat.findIndex((p2) => p2.id === q.sahifa);
    if (q.tier === 0) assert.equal(idx, 0, `${q.savol}: birinchi natija boʻlishi kerak`);
    else if (q.tier === 1) assert.ok(idx === 1 || idx === 2, `${q.savol}: 2–3-natija boʻlishi kerak (${idx})`);
    else {
      assert.equal(idx, -1, `${q.savol}: natijalarda boʻlmasligi kerak`);
      assert.ok(nat.some((p2) => p2.havolalar.some((l) => l.sahifa === q.sahifa)), `${q.savol}: natija ichida havola yoʻq`);
    }
    // Avtomat o'ynovchi yo'li javob sahifasiga olib boradi
    let h = L.yangi(L.QIDIRUV);
    for (const s of L.xazinaYoli(q)) h = s.amal === "qidir" ? L.qidirOch(h, s.soz) : s.amal === "natija" ? L.natija(h, s.id) : L.havola(h, s.id);
    assert.equal(L.joriyId(h), q.sahifa, `${q.savol}: yoʻl`);
  }
});

// ---------- 1-bosqich generatorlari ----------
test("manzil: tier 0 — bosh sahifa, tier 1–2 — ichki sahifa; boshlang'ich sahifa nishon emas; so'rovchi sayt yo'q", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.manzilTask, 150, tier)) {
      const p = L.SAHIFA[t.nishon];
      assert.ok(p && !p.soroq && p.id !== L.QIDIRUV, t.id);
      assert.equal(t.javob, p.manzil);
      assert.equal(p.manzil.includes("/"), tier > 0, t.id);
      assert.notEqual(L.joriyId(t.holat), t.nishon);
      assert.ok(t.matn.includes(p.manzil) && t.ishora && !t.ishora.includes(p.manzil), "maslahat javobni aytmaydi");
      assert.deepEqual(t.qadamlar, [{ amal: "och", manzil: p.manzil }]);
      assert.equal(L.tekshir1(t, { amal: "och", id: t.nishon }), "togri");
      assert.equal(L.tekshir1(t, { amal: "och", id: null }), "xato", "bunday sayt yoʻq — xato");
      assert.equal(L.tekshir1(t, { amal: "manzil" }), "betaraf");
    }
  }
});

test("havola: boshlang'ich sahifada aynan shu havola bor; tier 0 da 3 havolali sahifa", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.havolaTask, 150, tier)) {
      const p = L.SAHIFA[t.bosh];
      assert.equal(L.joriyId(t.holat), t.bosh);
      assert.ok(p.havolalar.length >= (tier === 0 ? 3 : 2), t.id);
      assert.ok(p.havolalar.some((l) => l.sahifa === t.javob && l.matn === t.havolaMatn), t.id);
      assert.equal(t.javob, t.nishon);
      assert.equal(L.tekshir1(t, { amal: "havola", id: t.javob }), "togri");
      const boshqa = p.havolalar.find((l) => l.sahifa !== t.javob);
      assert.equal(L.tekshir1(t, { amal: "havola", id: boshqa.sahifa }), "xato");
      assert.equal(L.tekshir1(t, { amal: "yangila", id: t.bosh }), "betaraf");
    }
  }
});

test("orqaga: tarix havolalar bo'ylab, tier 0 — 1 qadam, tier 1–2 — 2 qadam; oraliq sahifa betaraf", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.orqagaTask, 150, tier)) {
      const ids = t.holat.tarix.map((e) => e.id);
      assert.equal(ids.length, 3);
      assert.equal(t.holat.korsatkich, 2);
      assert.notEqual(ids[0], ids[2], "a → b → a bo'lmaydi");
      for (let i = 0; i < 2; i++) assert.ok(L.SAHIFA[ids[i]].havolalar.some((l) => l.sahifa === ids[i + 1]), t.id);
      assert.equal(t.qadam, tier === 0 ? 1 : 2);
      assert.equal(t.javob, ids[2 - t.qadam]);
      assert.equal(t.qadamlar.length, t.qadam);
      let h = t.holat;
      for (let i = 1; i <= t.qadam; i++) {
        h = L.orqaga(h);
        assert.equal(L.tekshir1(t, { amal: "orqaga", id: L.joriyId(h) }), i === t.qadam ? "togri" : "betaraf");
      }
      assert.equal(L.tekshir1(t, { amal: "oldinga", id: ids[2] }), "betaraf", "boshlang'ich sahifaga qaytish betaraf");
      const chet = L.SAHIFALAR.find((p) => !ids.includes(p.id));
      assert.equal(L.tekshir1(t, { amal: "och", id: chet.id }), "xato");
    }
  }
});

test("yol (ikki qadam): tier 0 da manzil vazifasi; tier ≥ 1 — sayt + undagi havola", () => {
  assert.equal(L.yolTask(rngFrom(1), null, 0).tur, "manzil");
  for (const tier of [1, 2]) {
    for (const t of each(L.yolTask, 150, tier)) {
      assert.equal(t.tur, "yol");
      const s = L.SAHIFA[t.saytId];
      assert.equal(s.manzil, t.sayt);
      assert.ok(!s.manzil.includes("/") && s.havolalar.length >= 2);
      assert.ok(s.havolalar.some((l) => l.sahifa === t.javob && l.matn === t.havolaMatn), t.id);
      assert.notEqual(t.bosh, t.saytId);
      assert.deepEqual(t.qadamlar, [{ amal: "och", manzil: s.manzil }, { amal: "havola", id: t.javob }]);
      assert.equal(L.tekshir1(t, { amal: "och", id: t.saytId }), "betaraf", "saytga kirish — oraliq");
      assert.equal(L.tekshir1(t, { amal: "havola", id: t.javob }), "togri");
      const boshqa = s.havolalar.find((l) => l.sahifa !== t.javob);
      assert.equal(L.tekshir1(t, { amal: "havola", id: boshqa.sahifa }), "xato");
      assert.equal(L.tekshir1(t, { amal: "orqaga", id: t.bosh }), "betaraf");
    }
  }
});

// ---------- 2-bosqich ----------
test("xazina: tier bo'yicha savol, 4 ta har xil variant, javob ichida va sahifada, gap topiladi", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.xazinaTask, 150, tier)) {
      assert.equal(L.joriyId(t.holat), L.QIDIRUV);
      assert.equal(t.variantlar.length, 4);
      assert.equal(new Set(t.variantlar).size, 4, t.id);
      assert.ok(t.variantlar.includes(t.javob));
      const q = L.XAZINA.find((x) => x.savol === t.savol && x.javob === t.javob);
      assert.equal(q.tier, tier, t.id);
      assert.ok(t.gap >= 0 || L.norm(L.SAHIFA[t.sahifa].sarlavha).includes(L.norm(t.javob)));
      assert.ok(t.ishora && !t.ishora.includes(t.kalit) && !t.ishora.includes(t.javob), "maslahat so'zni va javobni aytmaydi");
      assert.ok(t.nega.includes(t.javob));
      assert.ok(L.tekshirXazina(t, t.javob));
      assert.ok(!L.tekshirXazina(t, t.variantlar.find((v) => v !== t.javob)));
      assert.equal(t.qadamlar[0].amal, "qidir");
    }
  }
});

// ---------- 3-bosqich ----------
test("qalqib: sahifa qalqib sahifalardan, oyna bankdan, tier 2 da aldamchi «Yopish»; tekshiruv", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.qalqibTask, 120, tier)) {
      assert.ok(L.SAHIFA[t.sahifa].qalqib, t.id);
      assert.equal(L.joriyId(t.holat), t.sahifa);
      assert.ok(L.orqagaMumkin(t.holat));
      assert.ok(L.QALQIB.some((o) => o.sarlavha === t.oyna.sarlavha));
      assert.equal(!!t.oyna.aldamchi, tier === 2);
      if (tier === 2) assert.equal(t.oyna.tugma, "Yopish");
      assert.equal(t.javob, "yop");
      assert.equal(L.tekshirQalqib(t, "yop"), "togri");
      assert.equal(L.tekshirQalqib(t, "bos"), "xato");
      assert.equal(L.tekshirQalqib(t, "orqaga"), "betaraf");
    }
  }
});

test("soroq: tier 0 — telefon, keyin parol ham; chiqish to'g'ri, yozish va yuborish xato", () => {
  for (const tier of [0, 1, 2]) {
    const list = each(L.soroqTask, 120, tier);
    for (const t of list) {
      const p = L.SAHIFA[t.sahifa];
      assert.ok(p.soroq, t.id);
      assert.equal(t.soroq, p.soroq);
      if (tier === 0) assert.equal(t.soroq, "telefon");
      assert.equal(L.joriyId(t.holat), t.sahifa);
      assert.ok(L.orqagaMumkin(t.holat), "orqaga bilan ham chiqib ketsa bo'ladi");
      for (const a of ["chiq", "orqaga", "och"]) assert.equal(L.tekshirSoroq(t, a), "togri", a);
      for (const a of ["yoz", "yubor"]) assert.equal(L.tekshirSoroq(t, a), "xato", a);
      assert.equal(L.tekshirSoroq(t, "manzil"), "betaraf");
    }
    if (tier > 0) assert.ok(list.some((t) => t.soroq === "parol") && list.some((t) => t.soroq === "telefon"));
  }
});

test("savol: 4 ta har xil variant, javob ichida, tier bilan savollar ko'payadi", () => {
  assert.ok(L.SAVOLLAR.length >= 8);
  for (const s of L.SAVOLLAR) {
    assert.equal(new Set(s.variantlar).size, 4, s.savol);
    assert.ok(!/['`’]/.test(s.savol + s.variantlar.join("") + s.nega), s.savol);
  }
  const turli = new Set();
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.savolTask, 150, tier)) {
      assert.equal(t.variantlar.length, 4);
      assert.equal(new Set(t.variantlar).size, 4);
      assert.ok(t.variantlar.includes(t.javob));
      const s = L.SAVOLLAR.find((x) => x.savol === t.savol);
      assert.ok(s.tier <= tier, t.id);
      assert.equal(t.javob, s.variantlar[0]);
      assert.ok(L.tekshirSavol(t, t.javob) && !L.tekshirSavol(t, t.variantlar.find((v) => v !== t.javob)));
      assert.ok(t.rasm);
      if (tier === 2) turli.add(t.id);
    }
  }
  assert.equal(turli.size, L.SAVOLLAR.length, "tier 2 da hamma savol chiqadi");
});

test("ketma-ket bir xil misol chiqmaydi va bosqich navbati aylanadi", () => {
  for (const make of [L.manzilTask, L.havolaTask, L.orqagaTask, L.xazinaTask, L.qalqibTask, L.soroqTask, L.savolTask]) {
    for (const tier of [0, 1, 2]) {
      const list = each(make, 80, tier, 5 + tier);
      for (let i = 1; i < list.length; i++) assert.notEqual(list[i].id, list[i - 1].id, make.name);
    }
  }
  const r = rngFrom(9);
  assert.deepEqual([0, 1, 2, 3].map((n) => L.bosqich1Task(r, null, n, 1).tur), ["manzil", "havola", "orqaga", "yol"]);
  assert.deepEqual([0, 1].map((n) => L.bosqich2Task(r, null, n, 0).tur), ["xazina", "xazina"]);
  assert.deepEqual([0, 1, 2, 3].map((n) => L.bosqich3Task(r, null, n, 0).tur), ["qalqib", "soroq", "savol", "qalqib"]);
});
