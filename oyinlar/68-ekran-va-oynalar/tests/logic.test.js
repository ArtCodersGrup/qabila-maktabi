// 68-o'yin: ekran va oynalar — oynalar holati amallari, bolaning amalini baholash va mashq generatorlari.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const A = require("../js/game-art.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
// make(r, prev, tier) dan ketma-ket vazifalar
function each(make, count, tier, seed) {
  const r = rngFrom(seed || 68);
  const out = [];
  let prev = null;
  for (let k = 0; k < count; k++) {
    prev = make(r, prev, tier);
    out.push(prev);
  }
  return out;
}
// Holatni "muzlatish": amal berilgan holatni o'zgartirsa — strict rejimda xato chiqadi
function muzlat(x) {
  Object.freeze(x);
  for (const v of Object.values(x)) if (v && typeof v === "object") muzlat(v);
  return x;
}
const tartib = (h) => h.oynalar.map((w) => w.dastur);
const holatlar = (h) => h.oynalar.map((w) => w.holat);
const SONI = 300; // har tierda nechta vazifa tekshiriladi
const TIERLAR = [0, 1, 2];

// ---------- Holat amallari ----------
test("och: yangi oyna eng oldinda va faol, id takrorlanmaydi, berilgan holat o'zgarmaydi", () => {
  const a = muzlat(L.bosh());
  const b = muzlat(L.och(a, "rasm"));
  const c = muzlat(L.och(b, "matn"));
  assert.deepEqual(a, { oynalar: [] });
  assert.deepEqual(tartib(b), ["rasm"]);
  assert.deepEqual(tartib(c), ["rasm", "matn"]);
  assert.deepEqual(holatlar(c), ["oddiy", "oddiy"]);
  assert.equal(L.faol(c).dastur, "matn");
  assert.equal(new Set(c.oynalar.map((w) => w.id)).size, 2);
  // Yopilgandan keyin ochilgan oyna ham yangi id oladi
  const d = L.och(L.yop(c, "rasm"), "hisob");
  assert.equal(new Set(d.oynalar.map((w) => w.id)).size, 2);
  assert.equal(L.och(c, "yoq-dastur"), c, "noma'lum dastur ochilmaydi");
  assert.equal(L.faol(a), null);
});

test("och: allaqachon ochiq dastur — yangi oyna emas, o'sha oyna oldinga chiqadi", () => {
  const h = muzlat(L.holatYasa(["rasm", "matn", "hisob"]));
  const k = L.och(h, "rasm");
  assert.deepEqual(tartib(k), ["matn", "hisob", "rasm"]);
  assert.equal(k.oynalar.length, 3);
  assert.equal(L.faol(k).dastur, "rasm");
  assert.equal(L.och(h, "hisob"), h, "faol oynaning dasturi — hech narsa o'zgarmaydi");
  // Kichraytirilgan dasturni ochish — oynasi qaytadi
  const p = muzlat(L.holatYasa(["rasm", "matn"], { rasm: "kichik" }));
  const q = L.och(p, "rasm");
  assert.deepEqual(tartib(q), ["matn", "rasm"]);
  assert.deepEqual(holatlar(q), ["oddiy", "oddiy"]);
});

test("yop: oyna ro'yxatdan chiqadi, faol — qolganlarining eng oldindagisi", () => {
  const h = muzlat(L.holatYasa(["rasm", "matn", "hisob"]));
  const k = L.yop(h, "hisob");
  assert.deepEqual(tartib(k), ["rasm", "matn"]);
  assert.equal(L.faol(k).dastur, "matn");
  assert.deepEqual(tartib(L.yop(h, "rasm")), ["matn", "hisob"]);
  assert.equal(L.yop(h, "musiqa"), h, "ochiq bo'lmagan oyna yopilmaydi");
  assert.equal(L.faol(L.yop(L.holatYasa(["rasm"]), "rasm")), null);
});

test("kichraytir: oyna panelda qoladi, faol oyna o'zgaradi", () => {
  const h = muzlat(L.holatYasa(["rasm", "matn", "hisob"]));
  assert.equal(L.faol(h).dastur, "hisob");
  const k = muzlat(L.kichraytir(h, "hisob"));
  assert.equal(k.oynalar.length, 3, "oyna yopilmadi");
  assert.equal(L.oyna(k, "hisob").holat, "kichik");
  assert.equal(L.faol(k).dastur, "matn");
  assert.equal(L.kichraytir(k, "hisob"), k, "ikkinchi marta — o'zgarish yo'q");
  // Orqadagi oynani kichraytirish faol oynani o'zgartirmaydi
  assert.equal(L.faol(L.kichraytir(h, "rasm")).dastur, "hisob");
  // Hammasi kichraytirilsa — faol oyna yo'q
  const hammasi = ["rasm", "matn", "hisob"].reduce((s, d) => L.kichraytir(s, d), h);
  assert.equal(L.faol(hammasi), null);
});

test("qaytar: kichraytirilgan oyna oddiy o'lchamda, eng oldinda qaytadi", () => {
  const h = muzlat(L.holatYasa(["rasm", "matn", "hisob"], { rasm: "kichik" }));
  const k = L.qaytar(h, "rasm");
  assert.deepEqual(tartib(k), ["matn", "hisob", "rasm"]);
  assert.equal(L.oyna(k, "rasm").holat, "oddiy");
  assert.equal(L.faol(k).dastur, "rasm");
  assert.equal(L.qaytar(h, "matn"), h, "kichraytirilmagan oyna qaytarilmaydi");
  assert.equal(L.qaytar(h, "musiqa"), h);
});

test("kattalashtir: yoyish ↔ avvalgi o'lcham, oyna oldinga chiqadi", () => {
  const h = muzlat(L.holatYasa(["rasm", "matn"]));
  const k = muzlat(L.kattalashtir(h, "rasm"));
  assert.deepEqual(tartib(k), ["matn", "rasm"]);
  assert.equal(L.oyna(k, "rasm").holat, "katta");
  const q = L.kattalashtir(k, "rasm");
  assert.equal(L.oyna(q, "rasm").holat, "oddiy");
  assert.ok(L.bir(q, L.oldinga(h, "rasm")), "ikki marta bosish — faqat oldinga chiqqani qoladi");
  const p = muzlat(L.holatYasa(["rasm"], { rasm: "kichik" }));
  assert.equal(L.kattalashtir(p, "rasm"), p, "kichraytirilgan oynaning tugmasi bosilmaydi");
});

test("oldinga: orqadagi oyna faol bo'ladi; faol va kichraytirilgan oyna — o'zgarishsiz", () => {
  const h = muzlat(L.holatYasa(["rasm", "matn", "hisob"]));
  const k = L.oldinga(h, "rasm");
  assert.deepEqual(tartib(k), ["matn", "hisob", "rasm"]);
  assert.equal(L.faol(k).dastur, "rasm");
  assert.equal(L.oldinga(h, "hisob"), h);
  const p = muzlat(L.holatYasa(["rasm", "matn"], { rasm: "kichik" }));
  assert.equal(L.oldinga(p, "rasm"), p);
  // Oldindagi oyna kichraytirilgan bo'lsa, faol — undan keyingisi
  const q = muzlat(L.holatYasa(["rasm", "matn"], { matn: "kichik" }));
  assert.equal(L.faol(q).dastur, "rasm");
  assert.equal(L.oldinga(q, "rasm"), q);
});

test("bajar va bir: amal nomi bo'yicha, noma'lum amal — o'zgarishsiz", () => {
  const h = muzlat(L.holatYasa(["rasm", "matn"]));
  for (const amal of ["och", "yop", "kichraytir", "kattalashtir", "qaytar", "oldinga"]) {
    assert.deepEqual(L.bajar(h, { amal, dastur: "rasm" }), L[amal](h, "rasm"), amal);
  }
  assert.equal(L.bajar(h, { amal: "uch", dastur: "rasm" }), h);
  assert.equal(L.bajar(h, null), h);
  assert.ok(L.bir(h, L.holatYasa(["rasm", "matn"])));
  assert.ok(!L.bir(h, L.holatYasa(["matn", "rasm"])));
  assert.ok(!L.bir(h, L.holatYasa(["rasm", "matn"], { rasm: "katta" })));
  assert.ok(L.teng({ amal: "yop", dastur: "rasm" }, { amal: "yop", dastur: "rasm" }));
  assert.ok(!L.teng({ amal: "yop", dastur: "rasm" }, { amal: "yop", dastur: "matn" }));
  assert.ok(!L.teng(null, { amal: "yop", dastur: "rasm" }));
});

// ---------- Bosish → amal ----------
test("niyat: bosilgan joy va holatdan amal; faol oynani bosish — betaraf", () => {
  const h = L.holatYasa(["rasm", "matn", "hisob"], { rasm: "kichik" }); // hisob — faol, rasm — panelda
  for (const manba of ["belgi", "menyu"]) {
    assert.deepEqual(L.niyat(h, manba, "musiqa"), { amal: "och", dastur: "musiqa" });
    assert.deepEqual(L.niyat(h, manba, "rasm"), { amal: "qaytar", dastur: "rasm" });
    assert.deepEqual(L.niyat(h, manba, "matn"), { amal: "oldinga", dastur: "matn" });
    assert.equal(L.niyat(h, manba, "hisob"), null);
    assert.equal(L.niyat(h, manba, "yoq-dastur"), null);
  }
  assert.deepEqual(L.niyat(h, "panel", "rasm"), { amal: "qaytar", dastur: "rasm" });
  assert.deepEqual(L.niyat(h, "panel", "matn"), { amal: "oldinga", dastur: "matn" });
  assert.equal(L.niyat(h, "panel", "hisob"), null);
  assert.equal(L.niyat(h, "panel", "musiqa"), null, "panelda yo'q dastur");
  assert.deepEqual(L.niyat(h, "oyna", "matn"), { amal: "oldinga", dastur: "matn" });
  assert.equal(L.niyat(h, "oyna", "hisob"), null);
  // niyat bergan har amal holatni haqiqatan o'zgartiradi
  for (const manba of ["belgi", "menyu", "panel", "oyna"]) {
    for (const d of L.IDLAR) {
      const a = L.niyat(h, manba, d);
      if (a) assert.ok(!L.bir(h, L.bajar(h, a)), manba + ":" + d);
    }
  }
});

test("ikki marta bosish: bitta belgiga 450 ms ichida", () => {
  const b = (nishon, vaqt) => ({ nishon, vaqt });
  assert.equal(L.IKKI_MARTA_MS, 450);
  assert.ok(L.ikkiMarta(b("rasm", 1000), b("rasm", 1000)));
  assert.ok(L.ikkiMarta(b("rasm", 1000), b("rasm", 1450)));
  assert.ok(!L.ikkiMarta(b("rasm", 1000), b("rasm", 1451)), "kech bosildi");
  assert.ok(!L.ikkiMarta(b("rasm", 1000), b("matn", 1100)), "boshqa belgi");
  assert.ok(!L.ikkiMarta(null, b("rasm", 1100)), "birinchi bosish");
  assert.ok(!L.ikkiMarta(b("rasm", 1000), b("rasm", 900)), "soat orqaga surilgan");
  // Sekin ikki marta bosish: kech qoldi, lekin bola ochmoqchi edi — jarimasiz eslatma uchun
  assert.ok(!L.sekinBosish(b("rasm", 1000), b("rasm", 1450)), "bu hali haqiqiy ikki marta bosish");
  assert.ok(L.sekinBosish(b("rasm", 1000), b("rasm", 1451)));
  assert.ok(L.sekinBosish(b("rasm", 1000), b("rasm", 1000 + L.SEKIN_MS)));
  assert.ok(!L.sekinBosish(b("rasm", 1000), b("rasm", 1001 + L.SEKIN_MS)), "juda kech — yangi tanlash");
  assert.ok(!L.sekinBosish(b("rasm", 1000), b("matn", 1600)), "boshqa belgi");
  assert.ok(!L.sekinBosish(null, b("rasm", 1600)));
});

// ---------- Baholash ----------
const vazifa = (tur, kutilgan, boshlangich) => ({ tur, kutilgan, boshlangich });

test("baho: birinchi holatni o'zgartiruvchi amal kutilganga teng bo'lsa — to'g'ri, boshqasi — xato", () => {
  const h = L.holatYasa(["rasm", "matn"]);
  const v = vazifa("yop", { amal: "yop", dastur: "matn" }, h);
  assert.equal(L.baho(v, h, { amal: "yop", dastur: "matn" }), "togri");
  assert.equal(L.baho(v, h, { amal: "yop", dastur: "rasm" }), "xato", "boshqa oyna");
  assert.equal(L.baho(v, h, { amal: "kichraytir", dastur: "matn" }), "xato", "boshqa tugma");
  assert.equal(L.baho(v, h, { amal: "och", dastur: "musiqa" }), "xato");
  const o = vazifa("och", { amal: "och", dastur: "musiqa" }, L.bosh());
  assert.equal(L.baho(o, L.bosh(), { amal: "och", dastur: "musiqa" }), "togri");
  assert.equal(L.baho(o, L.bosh(), { amal: "och", dastur: "rasm" }), "xato");
});

test("baho: kerakli oynani avval oldinga chiqarish — tayyorgarlik, xato emas", () => {
  const h = L.holatYasa(["rasm", "matn"]); // rasm — orqada
  for (const amal of L.TUGMA_AMALLARI) {
    const v = vazifa(amal, { amal, dastur: "rasm" }, h);
    assert.equal(L.baho(v, h, { amal: "oldinga", dastur: "rasm" }), "davom", amal);
    const keyin = L.bajar(h, { amal: "oldinga", dastur: "rasm" });
    assert.equal(L.baho(v, keyin, { amal, dastur: "rasm" }), "togri", amal);
    assert.equal(L.baho(v, keyin, { amal: "oldinga", dastur: "matn" }), "xato", "boshqa oynani oldinga chiqarish");
  }
  // «Oldinga chiqar» vazifasida boshqa oynani oldinga chiqarish — xato
  const u = L.holatYasa(["rasm", "matn", "hisob"]);
  const w = vazifa("oldinga", { amal: "oldinga", dastur: "rasm" }, u);
  assert.equal(L.baho(w, u, { amal: "oldinga", dastur: "matn" }), "xato");
  assert.equal(L.baho(w, u, { amal: "oldinga", dastur: "rasm" }), "togri");
  // Paneldan qaytarish vazifasida ko'rinib turgan oynani bosish — xato
  const p = L.holatYasa(["rasm", "matn"], { rasm: "kichik" });
  const q = vazifa("qaytar", { amal: "qaytar", dastur: "rasm" }, p);
  assert.equal(L.baho(q, p, { amal: "kichraytir", dastur: "matn" }), "xato");
  assert.equal(L.baho(q, p, { amal: "qaytar", dastur: "rasm" }), "togri");
});

test("baho «faqat»: har yopish tekshiriladi, faqat kerakli oyna qolganda — to'g'ri", () => {
  let h = L.holatYasa(["rasm", "matn", "hisob"]);
  const v = vazifa("faqat", { amal: "faqat", dastur: "matn" }, h);
  assert.equal(L.baho(v, h, { amal: "yop", dastur: "matn" }), "xato", "kerakli oynani yopish");
  assert.equal(L.baho(v, h, { amal: "och", dastur: "musiqa" }), "xato", "yangi dastur ochish");
  // Oldinga chiqarish, kichraytirish, yoyish — tekshirilmaydi, vazifa davom etadi
  for (const amal of ["oldinga", "kichraytir", "kattalashtir", "qaytar"]) {
    assert.equal(L.baho(v, h, { amal, dastur: "rasm" }), "davom", amal);
  }
  assert.equal(L.baho(v, h, { amal: "yop", dastur: "hisob" }), "davom");
  h = L.yop(h, "hisob");
  assert.equal(L.baho(v, h, { amal: "yop", dastur: "rasm" }), "togri");
  // Ortiqcha oyna kichraytirilgan bo'lsa — hali tugamagan; bola qotib qolmasligi uchun eslatma
  const k = L.kichraytir(L.yop(L.holatYasa(["rasm", "matn", "hisob"]), "hisob"), "rasm");
  assert.equal(L.yashirinQoldi(v, k), true);
  assert.equal(L.yashirinQoldi(v, L.holatYasa(["rasm", "matn", "hisob"])), false);
  assert.equal(L.yashirinQoldi(v, L.holatYasa(["matn"])), false);
  assert.equal(L.yashirinQoldi(vazifa("yop", { amal: "yop", dastur: "matn" }, k), k), false);
  // Kerakli oynaning o'zi kichraytirilgan bo'lsa ham, yolg'iz qolgani — to'g'ri
  const m = L.holatYasa(["rasm", "matn"], { matn: "kichik" });
  assert.equal(L.baho(v, m, { amal: "yop", dastur: "rasm" }), "togri");
});

// ---------- Generatorlar ----------
const GENERATORLAR = { ochTask: L.ochTask, nomTask: L.nomTask, oynaTask: L.oynaTask, oldingaTask: L.oldingaTask, faqatTask: L.faqatTask, puskTask: L.puskTask };
const STOL = ["ochTask", "oynaTask", "oldingaTask", "faqatTask", "puskTask"]; // o'yinchoq kompyuterda bajariladigan vazifalar

// Holatni haqiqatan o'zgartiradigan hamma amallar (bola qila oladigan har narsa)
function hammaAmallar(holat) {
  const out = [];
  for (const amal of ["och", "yop", "kichraytir", "kattalashtir", "qaytar", "oldinga"]) {
    for (const d of L.IDLAR) {
      const a = { amal, dastur: d };
      // «Och» faqat yangi oyna uchun — ochiq dasturni ochish niyat() da oldinga/qaytar bo'lib keladi
      if (amal === "och" && L.oyna(holat, d)) continue;
      if (!L.bir(holat, L.bajar(holat, a))) out.push(a);
    }
  }
  return out;
}

test("1-bosqich «och»: belgilar soni 3 / 5 / 6, kutilgan dastur ish stolida bor, oynalar yo'q", () => {
  for (const tier of TIERLAR) {
    for (const t of each(L.ochTask, SONI, tier)) {
      assert.equal(t.tur, "och");
      assert.equal(t.belgilar.length, L.BELGI_SONI[tier], t.id);
      assert.deepEqual(L.BELGI_SONI, [3, 5, 6]);
      assert.equal(new Set(t.belgilar).size, t.belgilar.length, "belgi takrorlanmaydi");
      for (const d of t.belgilar) assert.ok(L.IDLAR.includes(d), d);
      assert.ok(t.belgilar.includes(t.kutilgan.dastur), t.id);
      assert.equal(t.kutilgan.amal, "och");
      assert.deepEqual(t.boshlangich, { oynalar: [] });
      assert.ok(t.matn.includes(`«${L.nom(t.kutilgan.dastur)}»`), t.matn);
    }
  }
});

test("1-bosqich «nom»: 4 variant, takrorlanmaydi, javob ichida, maslahat javobni aytmaydi", () => {
  const nomlar = L.DASTURLAR.map((d) => d.nom);
  const chiqdi = new Set();
  for (const tier of TIERLAR) {
    for (const t of each(L.nomTask, SONI, tier)) {
      assert.ok(t.variantlar.length >= 4, t.id);
      assert.equal(new Set(t.variantlar).size, t.variantlar.length, t.id);
      assert.ok(t.variantlar.includes(t.javob), t.id);
      for (const v of t.variantlar) assert.ok(nomlar.includes(v), v);
      assert.equal(t.javob, L.nom(t.dastur));
      assert.ok(!t.ishora.includes(t.javob), "maslahat javobni aytmaydi");
      assert.ok(t.nega.includes(t.javob));
      chiqdi.add(t.dastur);
    }
  }
  assert.equal(chiqdi.size, 6, "hamma dastur so'raladi");
});

test("2-bosqich: tier 0–1 — bitta oyna, tier 2 — ikki oyna; kutilgan oyna mavjud va amal bajarsa bo'ladi", () => {
  for (const tier of TIERLAR) {
    const turlar = new Set();
    for (const t of each(L.oynaTask, SONI, tier)) {
      turlar.add(t.tur);
      assert.ok(L.OYNA_NAVBAT[tier].includes(t.tur), `tier ${tier}: ${t.tur}`);
      assert.equal(t.kutilgan.amal, t.tur);
      assert.equal(t.boshlangich.oynalar.length, tier < 2 ? 1 : 2, t.id);
      const w = L.oyna(t.boshlangich, t.kutilgan.dastur);
      assert.ok(w, t.id + ": kutilgan oyna ochiq");
      assert.equal(w.holat, t.tur === "qaytar" ? "kichik" : "oddiy", t.id);
      // Tugmasi bosiladigan oyna ko'rinib turadi; boshqa oyna faqat «qaytar» da panelda bo'lishi mumkin
      if (t.tur !== "qaytar") assert.ok(t.boshlangich.oynalar.every((x) => x.holat === "oddiy"), t.id);
      assert.deepEqual(t.belgilar, L.IDLAR);
      assert.ok(t.matn.includes(`«${L.nom(t.kutilgan.dastur)}»`), t.matn);
    }
    assert.deepEqual([...turlar].sort(), L.OYNA_NAVBAT[tier].slice().sort(), `tier ${tier}: hamma tur chiqadi`);
  }
  // tier 2: so'ralgan oyna ba'zan oldinda, ba'zan orqada — "doim oldindagisi" degan qoida yo'q
  const joy = each(L.oynaTask, SONI, 2).filter((t) => t.tur !== "qaytar").map((t) => L.faol(t.boshlangich).dastur === t.kutilgan.dastur);
  assert.ok(joy.filter(Boolean).length > 30 && joy.filter((x) => !x).length > 30);
  // «qaytar» tier 2: ikkinchi oyna ba'zan ko'rinib turadi, ba'zan u ham panelda
  const qaytar = each((r, prev, tier) => L.oynaTask(r, prev, tier, "qaytar"), SONI, 2);
  const ikkalasi = qaytar.filter((t) => t.boshlangich.oynalar.every((w) => w.holat === "kichik")).length;
  assert.ok(ikkalasi > 30 && ikkalasi < SONI - 30, String(ikkalasi));
});

test("3-bosqich «oldinga»: oynalar 2 / 3 / 4, nishon haqiqatan orqada va ko'rinib turadi", () => {
  for (const tier of TIERLAR) {
    for (const t of each(L.oldingaTask, SONI, tier)) {
      assert.equal(t.boshlangich.oynalar.length, L.OYNA_SONI[tier], t.id);
      const w = L.oyna(t.boshlangich, t.kutilgan.dastur);
      assert.ok(w, t.id);
      assert.equal(w.holat, "oddiy");
      assert.notEqual(L.faol(t.boshlangich).dastur, t.kutilgan.dastur, t.id + ": nishon faol emas");
      assert.ok(t.boshlangich.oynalar.indexOf(w) < t.boshlangich.oynalar.length - 1, t.id + ": nishon orqada");
      assert.equal(t.kutilgan.amal, "oldinga");
      // Bajarilgach nishon faol bo'ladi
      assert.equal(L.faol(L.bajar(t.boshlangich, t.kutilgan)).dastur, t.kutilgan.dastur);
    }
  }
});

test("3-bosqich «faqat»: oynalar 2 / 3 / 4, qoladigan oyna ochiq; qadamlar hammasini yopadi", () => {
  for (const tier of TIERLAR) {
    for (const t of each(L.faqatTask, SONI, tier)) {
      assert.equal(t.boshlangich.oynalar.length, L.OYNA_SONI[tier], t.id);
      assert.equal(new Set(tartib(t.boshlangich)).size, L.OYNA_SONI[tier], "bir dastur — bitta oyna");
      assert.ok(L.oyna(t.boshlangich, t.kutilgan.dastur), t.id);
      assert.equal(t.kutilgan.amal, "faqat");
      assert.equal(L.qadamlar(t).length, L.OYNA_SONI[tier] - 1);
    }
  }
});

test("3-bosqich «pusk»: nishon ish stolida ham, ochiq oynalar orasida ham yo'q", () => {
  for (const tier of TIERLAR) {
    for (const t of each(L.puskTask, SONI, tier)) {
      const d = t.kutilgan.dastur;
      assert.equal(t.kutilgan.amal, "och");
      assert.ok(L.IDLAR.includes(d));
      assert.ok(!t.belgilar.includes(d), t.id + ": belgisi stolda yo'q");
      assert.equal(L.oyna(t.boshlangich, d), null, t.id + ": hali ochilmagan");
      assert.equal(t.belgilar.length, L.PUSK_BELGI[tier]);
      assert.equal(new Set(t.belgilar).size, t.belgilar.length);
      assert.equal(t.boshlangich.oynalar.length, L.PUSK_OYNA[tier]);
      assert.match(t.matn, /«Pusk»/);
    }
  }
});

test("har vazifa: javob maydoni bor, yechsa bo'ladi; bitta amalli vazifada boshqa har amal — xato", () => {
  for (const nomi of STOL) {
    for (const tier of TIERLAR) {
      for (const t of each(GENERATORLAR[nomi], SONI, tier, 7)) {
        assert.equal(t.javob, t.kutilgan, t.id + ": javob — kutilgan amal");
        assert.ok(t.boshlangich.oynalar.length <= 4, t.id + ": ko'pi bilan 4 oyna");
        // Namunali yechim: oxirgi qadamgacha "davom", oxirgisi "togri"
        const yol = L.qadamlar(t);
        assert.ok(yol.length >= 1, t.id);
        let holat = t.boshlangich;
        yol.forEach((a, i) => {
          assert.equal(L.baho(t, holat, a), i === yol.length - 1 ? "togri" : "davom", `${t.id}: ${i + 1}-qadam`);
          holat = L.bajar(holat, a);
        });
        if (t.kutilgan.amal === "faqat") {
          assert.deepEqual(tartib(holat), [t.kutilgan.dastur]);
          continue;
        }
        // Bitta amalli vazifa: kutilgan amal holatni o'zgartiradi, boshqa har amal — xato (tayyorgarlikdan tashqari)
        assert.ok(!L.bir(t.boshlangich, L.bajar(t.boshlangich, t.kutilgan)), t.id);
        for (const a of hammaAmallar(t.boshlangich)) {
          const b = L.baho(t, t.boshlangich, a);
          if (L.teng(a, t.kutilgan)) assert.equal(b, "togri");
          else if (a.amal === "oldinga" && a.dastur === t.kutilgan.dastur && L.TUGMA_AMALLARI.includes(t.kutilgan.amal)) assert.equal(b, "davom");
          else assert.equal(b, "xato", `${t.id}: ${a.amal} ${a.dastur}`);
        }
      }
    }
  }
  // Variantli vazifada javob — variant qiymati
  for (const t of each(L.nomTask, 50, 1)) assert.equal(typeof t.javob, "string");
});

test("ketma-ket bir xil id chiqmaydi", () => {
  for (const [nomi, make] of Object.entries(GENERATORLAR)) {
    for (const tier of TIERLAR) {
      const list = each(make, SONI, tier, 11);
      for (let i = 1; i < list.length; i++) assert.notEqual(list[i].id, list[i - 1].id, `${nomi}, tier ${tier}`);
    }
  }
  // Bosqich navbati bilan ham (xatodan keyin o'sha tur qayta beriladi: n o'zgarmaydi)
  for (const make of [L.bosqich1Task, L.bosqich2Task, L.bosqich3Task]) {
    for (const tier of TIERLAR) {
      const r = rngFrom(5);
      let prev = null;
      for (let k = 0; k < SONI; k++) {
        const t = make(r, prev, Math.floor(k / 3), tier);
        if (prev) assert.notEqual(t.id, prev.id);
        prev = t;
      }
    }
  }
});

test("bosqich navbati: tur n va tier bo'yicha almashadi", () => {
  const r = rngFrom(9);
  const turlar = (make, tier, soni) => Array.from({ length: soni }, (_, n) => make(r, null, n, tier).tur);
  // 1-bosqich: tier 0 — faqat ochish; tier 1+ — ochish va belgi nomi navbat bilan
  assert.deepEqual(turlar(L.bosqich1Task, 0, 4), ["och", "och", "och", "och"]);
  assert.deepEqual(turlar(L.bosqich1Task, 1, 4), ["och", "nom", "och", "nom"]);
  assert.deepEqual(turlar(L.bosqich1Task, 2, 4), ["och", "nom", "och", "nom"]);
  assert.equal(L.bosqich1Task(r, null, 2, 1).belgilar.length, 5);
  assert.equal(L.bosqich1Task(r, null, 0, 2).belgilar.length, 6);
  // 2-bosqich: yopish va yoyish → kichraytirish va qaytarish → ikki oyna bilan hammasi
  assert.deepEqual(turlar(L.bosqich2Task, 0, 2), ["yop", "kattalashtir"]);
  assert.deepEqual(turlar(L.bosqich2Task, 1, 4).slice(2), ["kichraytir", "qaytar"]);
  assert.deepEqual(turlar(L.bosqich2Task, 2, 7), ["yop", "kattalashtir", "kichraytir", "qaytar", "yop", "kattalashtir", "kichraytir"]);
  assert.equal(L.bosqich2Task(r, null, 4, 2).boshlangich.oynalar.length, 2);
  // 3-bosqich: oldinga → faqat → pusk
  assert.deepEqual(turlar(L.bosqich3Task, 0, 6), ["oldinga", "faqat", "pusk", "oldinga", "faqat", "pusk"]);
  // tier berilmasa yoki chegaradan chiqsa — yiqilmaydi
  assert.equal(L.ochTask(r, null).belgilar.length, 3);
  assert.equal(L.ochTask(r, null, 9).belgilar.length, 6);
});

// ---------- Maslahat, yechim va matn qoidalari ----------
const gaplar = (matn) => matn.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim()).length;

test("maslahat javobni aytmaydi, yechim kerakli joyni ko'rsatadi", () => {
  for (const nomi of STOL) {
    for (const tier of TIERLAR) {
      for (const t of each(GENERATORLAR[nomi], 60, tier, 3)) {
        const kerakli = `«${L.nom(t.kutilgan.dastur)}»`;
        for (const a of hammaAmallar(t.boshlangich)) {
          if (L.baho(t, t.boshlangich, a) !== "xato") continue;
          const i = L.ishora(t, a);
          assert.ok(i.matn && !i.matn.includes(kerakli), `${t.id}: ${i.matn}`);
          assert.ok(gaplar(i.matn) <= 2, i.matn);
          assert.ok(!/xato/i.test(i.matn), i.matn);
        }
        const n = L.nishonlar(t);
        assert.ok(n.length >= 1, t.id);
        if (t.tur === "och") assert.deepEqual(n, [{ nima: "belgi", dastur: t.kutilgan.dastur }]);
        if (t.tur === "pusk") assert.deepEqual(n, [{ nima: "pusk" }, { nima: "menyu", dastur: t.kutilgan.dastur }]);
        if (t.tur === "qaytar") assert.deepEqual(n, [{ nima: "panel", dastur: t.kutilgan.dastur }]);
        if (L.TUGMA_AMALLARI.includes(t.tur)) assert.deepEqual(n, [{ nima: "tugma", dastur: t.kutilgan.dastur, amal: t.tur }]);
        if (t.tur === "faqat") {
          assert.deepEqual(n.map((x) => x.dastur).sort(), tartib(t.boshlangich).filter((d) => d !== t.kutilgan.dastur).sort());
          assert.ok(n.every((x) => x.nima === "tugma" && x.amal === "yop"));
        }
      }
    }
  }
  // Oyna tugmasi adashtirilsa — tugmalar sxemasi; boshqa oyna tanlansa — "nomi sarlavhada"
  const h = L.holatYasa(["rasm", "matn"]);
  const v = { tur: "yop", kutilgan: { amal: "yop", dastur: "matn" }, boshlangich: h };
  assert.equal(L.ishora(v, { amal: "kichraytir", dastur: "matn" }).tur, "tugmalar");
  assert.match(L.ishora(v, { amal: "yop", dastur: "rasm" }).matn, /sarlavhada/);
  assert.equal(L.ishora(v, { amal: "yop", dastur: "rasm" }).tur, undefined);
});

test("matnlar: ko'pi bilan 2 qisqa gap, to'g'ri belgilar (oʻ, gʻ), «Xato» so'zi yo'q", () => {
  const matnlar = [];
  for (const [, make] of Object.entries(GENERATORLAR)) {
    for (const tier of TIERLAR) {
      for (const t of each(make, 40, tier, 21)) matnlar.push(t.matn, t.nega, t.maqtov, t.ishora || "");
    }
  }
  for (const d of L.DASTURLAR) matnlar.push(d.nom, d.ish);
  for (const m of matnlar) {
    assert.ok(gaplar(m) <= 2, m);
    assert.ok(m.length <= 90, m);
    assert.ok(!/['`‘’]/.test(m), "oʻ/gʻ uchun ʻ (U+02BB), tutuq uchun ʼ (U+02BC): " + m);
    assert.ok(!/xato/i.test(m), m);
  }
  // Har vazifa matni bor va bo'sh emas
  for (const nomi of Object.keys(GENERATORLAR)) {
    const t = GENERATORLAR[nomi](rngFrom(1), null, 1);
    assert.ok(t.matn && t.nega && t.maqtov && t.id && t.tur, nomi);
  }
});

test("dasturlar: oltita, belgi nomlari umumiy stol-art bilan bir xil", () => {
  assert.deepEqual(L.IDLAR, ["rasm", "matn", "hisob", "musiqa", "fayllar", "internet"]);
  assert.deepEqual(L.DASTURLAR.map((d) => d.nom), ["Rasm", "Matn", "Hisoblagich", "Musiqa", "Fayllar", "Internet"]);
  const stolArt = require("../../umumiy/js/stol-art.js");
  for (const id of L.IDLAR) assert.match(stolArt.icon(id), /^<svg/, id);
  assert.match(stolArt.icon("pusk"), /^<svg/);
  assert.equal(L.nom("hisob"), "Hisoblagich");
  assert.equal(L.nom("yoq"), "");
});

// ---------- Rasmlar ----------
test("oyna ichi rasmlari: har dastur uchun alohida SVG, ichida matn yo'q", () => {
  const rasmlar = L.IDLAR.map((id) => A.ichi(id));
  for (const s of rasmlar.concat([A.kompyuter(), A.kompyuter(true)])) {
    assert.match(s.trim(), /^<svg[\s\S]*<\/svg>$/);
    assert.ok(!s.includes("<text"), "rasm ichida matn bo'lmasin");
    assert.ok(!/undefined|NaN/.test(s));
  }
  assert.equal(new Set(rasmlar).size, 6, "har dasturning ichi boshqacha");
  assert.equal(A.ichi("yoq"), "");
  assert.notEqual(A.kompyuter(), A.kompyuter(true));
});
