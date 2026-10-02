// 52-o'yin: firibgar xat — belgilar, manzil (domen) qoidasi va savollar.
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

// Bir generatordan n ta savol: har safar oldingisi uzatiladi (takrorni tekshirish uchun)
const each = (make, n, seed) => {
  const r = rngFrom(seed || 52);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

const soxtalar = L.XABARLAR.filter((x) => x.soxta);
const haqiqiylar = L.XABARLAR.filter((x) => !x.soxta);

test("xabarlar: kamida 10 ta, yarmi soxta, id takrorlanmaydi", () => {
  assert.ok(L.XABARLAR.length >= 10, "xabarlar soni: " + L.XABARLAR.length);
  assert.equal(soxtalar.length, haqiqiylar.length, "yarmi soxta boʻlishi kerak");
  const idlar = L.XABARLAR.map((x) => x.id);
  assert.equal(new Set(idlar).size, idlar.length, "id takrorlangan");
  // Har bir xabarda bola koʻradigan hamma qism bor
  for (const x of L.XABARLAR) {
    for (const maydon of ["kimdan", "manzil", "sarlavha", "matn"]) {
      assert.ok(x[maydon] && x[maydon].length > 2, x.id + " → " + maydon);
    }
    assert.ok(Array.isArray(x.belgilar), x.id);
  }
});

test("soxta xabarda kamida bitta belgi bor, haqiqiyda — yoʻq", () => {
  for (const x of soxtalar) {
    assert.ok(x.belgilar.length >= 1, x.id + " — belgisiz soxta xat boʻlmaydi");
    for (const id of x.belgilar) assert.ok(L.belgi(id), x.id + " → notanish belgi: " + id);
    assert.equal(new Set(x.belgilar).size, x.belgilar.length, x.id + " — belgi takrorlangan");
  }
  for (const x of haqiqiylar) {
    assert.equal(x.belgilar.length, 0, x.id + " — haqiqiy xatda belgi boʻlmaydi");
  }
  // Har bir belgi kamida bitta xatda uchraydi — bola hammasini koʻradi
  const ishlatilgan = new Set(soxtalar.flatMap((x) => x.belgilar));
  for (const b of L.BELGILAR) {
    if (b.id === "imlo") continue; // imlo faqat matn uslubida koʻrinadi
    assert.ok(ishlatilgan.has(b.id), "hech bir xatda ishlatilmagan belgi: " + b.id);
  }
});

test("eʼlon qilingan belgi xat matnida haqiqatan bor", () => {
  for (const x of soxtalar) {
    const matn = (x.sarlavha + " " + x.matn).toLowerCase();
    for (const id of x.belgilar) {
      const kalitlar = L.KALIT[id];
      if (!kalitlar || !kalitlar.length) continue; // "manzil" va "imlo" boshqacha tekshiriladi
      assert.ok(kalitlar.some((k) => matn.includes(k)), x.id + " → " + id + " belgisi matnda koʻrinmaydi");
    }
  }
});

test("haqiqiy xabarning manzili toʻgʻri, gʻalati manzilli soxta xat tanilmay qolmaydi", () => {
  for (const x of haqiqiylar) {
    const b = L.manzilBahosi(x);
    assert.equal(b.xil, null, x.id + " → " + b.joy + ": " + b.izoh);
    assert.equal(L.ishonchliManzil(x), true, x.id);
  }
  for (const x of soxtalar) {
    const b = L.manzilBahosi(x);
    if (x.belgilar.includes("manzil")) {
      assert.ok(b.xil, x.id + " — gʻalati manzil tanilmadi: " + b.joy);
      assert.ok(b.izoh.length > 20, x.id);
    } else {
      // Manzil toʻgʻri boʻlsa ham xat soxta boʻlishi mumkin — buni bola matndan topadi
      assert.equal(b.xil, null, x.id + " — manzil belgisi eʼlon qilinmagan, lekin manzil gʻalati");
    }
  }
});

test("domen qoidasi: harf almashtirilgan", () => {
  const f = L.domenFarqi("qabilabank.uz", "qabi1abank.uz");
  assert.equal(f.xil, "harf");
  assert.equal(L.domenFarqi("qabilamaktab.uz", "qabilamaktab.uz").xil, null);
  assert.equal(L.domenFarqi("dostlar.uz", "d0stlar.uz").xil, "harf");
  assert.equal(L.domenFarqi("kitobuy.uz", "kitobny.uz").xil, "harf", "bitta harf farq qilsa ham — soxta");
  assert.equal(f.kutilgan, "qabilabank.uz");
  assert.equal(f.nom, "qabi1abank");
});

test("domen qoidasi: qoʻshimcha soʻz qoʻshilgan", () => {
  assert.equal(L.domenFarqi("qabilabank.uz", "qabilabank-tekshiruv.xyz").xil, "qoshimcha");
  assert.equal(L.domenFarqi("qabilabank.uz", "kirish-qabilabank.uz").xil, "qoshimcha");
  assert.equal(L.domenFarqi("qabilapochta.uz", "qabilapochta-xavfsizlik.uz").xil, "qoshimcha");
});

test("domen qoidasi: zona boshqa", () => {
  const f = L.domenFarqi("oyinmaydon.uz", "oyinmaydon.xyz");
  assert.equal(f.xil, "zona");
  assert.equal(f.zona, "xyz");
  assert.equal(L.domenFarqi("qabilabank.uz", "qabilabank.top").xil, "zona");
  assert.equal(L.gumonliZona("https://yutuq-markaz.top/sovga"), true);
  assert.equal(L.gumonliZona("https://qabilabank.uz/kirish"), false);
});

test("domen qoidasi: hal qiluvchi qism — zonadan oldingi nom", () => {
  // Tashkilotning oʻz boʻlimi (subdomen) — ishonchli
  assert.equal(L.domenFarqi("qabilapochta.uz", "https://kirish.qabilapochta.uz/qurilmalar").xil, null);
  assert.equal(L.ajrat("xavfsizlik@kirish.qabilapochta.uz").nom, "qabilapochta");
  // Haqiqiy nom oldinga koʻchirilgan — endi manzil egasi boshqa
  assert.equal(L.domenFarqi("qabilapochta.uz", "qabilapochta.tekshir.uz").xil, "qoshimcha");
  assert.equal(L.ajrat("qabilapochta.tekshir.uz").nom, "tekshir");
  // Umuman boshqa manzil
  assert.equal(L.domenFarqi("dostlar.uz", "tez-pochta.site").xil, "boshqa");
  // Pochta manzili va havola bir xil qoida bilan tekshiriladi
  assert.equal(L.ajrat("sovga@yutuq-markaz.top").toliq, "yutuq-markaz.top");
  assert.equal(L.ajrat("https://www.kitobuy.uz/buyurtma/8124").toliq, "kitobuy.uz");
});

test("belgi savollari: toʻrtta variant, javob ichida, takrorsiz", () => {
  for (const t of each(L.belgiTask, 25, 3)) {
    assert.equal(t.variantlar.length, 4, t.id);
    assert.equal(new Set(t.variantlar).size, 4, "variantlar takrorlanmasin: " + t.variantlar);
    assert.ok(t.variantlar.includes(t.javob), t.id);
    assert.equal(t.javob, t.belgi.nom);
    assert.ok(t.misol.length > 10 && t.nega.length > 20, t.id);
  }
  // Toʻgʻri javob har xil joylarda turadi
  const joylar = new Set(each(L.belgiTask, 25, 5).map((t) => t.variantlar.indexOf(t.javob)));
  assert.ok(joylar.size >= 3, "javob aralashtirilmayapti: " + [...joylar]);
});

test("belgi misollari: har belgiga kamida ikkita, id takrorlanmaydi", () => {
  assert.ok(L.BELGILAR.length >= 6, "belgilar soni: " + L.BELGILAR.length);
  const idlar = L.BELGI_MISOL.map((m) => m.id);
  assert.equal(new Set(idlar).size, idlar.length);
  for (const b of L.BELGILAR) {
    const n = L.BELGI_MISOL.filter((m) => m.belgi === b.id).length;
    assert.ok(n >= 2, b.id + " uchun misol soni: " + n);
    assert.ok(b.nom.length > 3 && b.izoh.length > 20 && b.misol.length > 10, b.id);
  }
});

test("xabar savollari: javob xatning turiga mos, filtr ishlaydi", () => {
  for (const t of each(L.xabarTask, 30, 7)) {
    assert.deepEqual(t.variantlar, [L.JAVOB.haqiqiy, L.JAVOB.soxta]);
    assert.equal(t.javob, t.xabar.soxta ? L.JAVOB.soxta : L.JAVOB.haqiqiy);
    assert.equal(t.belgilar.length, t.xabar.belgilar.length);
    assert.ok(t.nega.length > 20, t.id);
  }
  // Bosqich soxta va haqiqiy xatlarni navbatlashtiradi — filtr shu uchun
  const r = rngFrom(31);
  for (let k = 0; k < 12; k++) {
    assert.equal(L.xabarTask(r, null, true).xabar.soxta, true);
    assert.equal(L.xabarTask(r, null, false).xabar.soxta, false);
  }
});

test("xat qismlari: manzil, sarlavha, gaplar, havola — kamida 4 ta bosiladigan joy", () => {
  for (const x of L.XABARLAR) {
    const q = L.xatQismlari(x);
    assert.ok(q.length >= 4, x.id + " — qismlar: " + q.length);
    assert.equal(q[0].tur, "manzil");
    assert.equal(q[1].tur, "sarlavha");
    assert.equal(q.filter((p) => p.tur === "havola").length, x.havola ? 1 : 0, x.id);
    // Gaplar birga matnni beradi (hech narsa yoʻqolmaydi)
    assert.equal(q.filter((p) => p.tur === "gap").map((p) => p.matn).join(" "), x.matn, x.id);
  }
});

test("soxta xat: har birida soʻraladigan belgi bor, belgi turgan joy aniq", () => {
  for (const x of soxtalar) {
    const belgilar = L.soraladiganBelgilar(x);
    assert.ok(belgilar.length >= 1, x.id + " — soʻraladigan belgi yoʻq");
    assert.ok(!belgilar.includes("imlo"), x.id);
    const q = L.xatQismlari(x);
    for (const id of belgilar) {
      const n = q.filter((p) => L.qismdaBelgi(x, p, id)).length;
      assert.ok(n >= 1 && n < q.length, x.id + " → " + id + ": " + n + "/" + q.length);
      // Manzil belgisi faqat manzil/havolada, matn belgilari faqat sarlavha/gapda
      for (const p of q.filter((pp) => L.qismdaBelgi(x, pp, id))) {
        assert.equal(["manzil", "havola"].includes(p.tur), id === "manzil", x.id + " → " + id + " → " + p.tur);
      }
    }
  }
});

test("generator gaplari: har gap faqat oʻz belgisining kalit soʻzini saqlaydi", () => {
  const belgilar = Object.keys(L.SOXTA_GAP);
  const bor = (gap, id) => L.KALIT[id].some((k) => (gap.toLowerCase() + " ").includes(k));
  for (const id of belgilar) {
    assert.ok(L.SOXTA_GAP[id].length >= 2, id);
    for (const gap of L.SOXTA_GAP[id]) {
      assert.deepEqual(belgilar.filter((b) => bor(gap, b)), [id], gap);
    }
  }
  // Belgisiz gaplar va sarlavhalarda hech bir kalit soʻz yoʻq
  const toza = [...L.HAVOLA_GAP, ...L.HAQIQIY_GAP];
  for (const t of L.TASHKILOTLAR) toza.push(L.KIRISH[t.id].sarlavha, ...L.KIRISH[t.id].gap);
  for (const gap of toza) assert.deepEqual(belgilar.filter((b) => bor(gap, b)), [], gap);
  assert.deepEqual(belgilar.filter((b) => bor(L.HAQIQIY_QOSHIMCHA, b)), ["parol"], "tuzoq gap: parol soʻzi bor, lekin soʻralmaydi");
});

test("yasalgan xatlar: soxtasida aynan eʼlon qilingan belgilar, haqiqiysida manzil toʻgʻri", () => {
  const r = rngFrom(77);
  const turlar = new Set();
  for (const daraja of [1, 2]) {
    for (let k = 0; k < 200; k++) {
      const s = L.yasaXabar(r, true, daraja);
      assert.equal(s.soxta, true);
      assert.equal(s.belgilar.length, daraja === 2 ? 1 : 2, s.id + " — daraja " + daraja);
      assert.equal(new Set(s.belgilar).size, s.belgilar.length);
      const b = L.manzilBahosi(s);
      assert.equal(!!b.xil, s.belgilar.includes("manzil"), s.id + " → " + s.manzil);
      if (b.xil) turlar.add(b.xil);
      // Matndagi belgilar — aynan eʼlon qilinganlari
      const matn = (s.sarlavha + " " + s.matn).toLowerCase() + " ";
      for (const id of Object.keys(L.SOXTA_GAP)) {
        assert.equal(L.KALIT[id].some((w) => matn.includes(w)), s.belgilar.includes(id), s.id + " → " + id + ": " + s.matn);
      }
      assert.deepEqual(L.soraladiganBelgilar(s), s.belgilar, s.id);
      assert.ok(L.xatQismlari(s).length >= 4, s.id);

      const h = L.yasaXabar(r, false, daraja);
      assert.equal(h.soxta, false);
      assert.deepEqual(h.belgilar, []);
      assert.equal(L.manzilBahosi(h).xil, null, h.id + " → " + h.manzil);
      assert.ok(L.xatQismlari(h).length >= 4, h.id);
    }
  }
  assert.ok(turlar.size >= 3, "soxta manzil turlari: " + [...turlar]);
});

test("xabar savoli — ikki qadam: javob + (belgi turgan joy yoki zonadan oldingi nom)", () => {
  const r = rngFrom(19);
  for (const tier of [0, 1, 2]) {
    let prev = null;
    let yasama = 0;
    for (let k = 0; k < 120; k++) {
      const t = L.xabarTask(r, prev, k % 2 === 0, tier);
      assert.equal(t.xabar.soxta, k % 2 === 0);
      if (prev && prev.xabar.soxta === t.xabar.soxta) assert.notEqual(t.id, prev.id);
      if (t.id.startsWith("xabar:gen:")) yasama++;
      // 2-qadam variantlari: bosiladigan joylar ≥ 4, nom variantlari — 4 ta
      assert.ok(t.joy.qismlar.length >= 4, t.id);
      assert.equal(t.nom.variantlar.length, 4, t.id + ": " + t.nom.variantlar);
      assert.equal(new Set(t.nom.variantlar).size, 4, t.id);
      assert.equal(t.nom.javob, L.ajrat(t.xabar.manzil).nom);
      assert.ok(t.nom.variantlar.includes(t.nom.javob));
      assert.ok(t.joy.matn.includes(t.joy.belgi.nom));
      const togri = t.joy.qismlar.map((q, i) => (q.togri ? i : -1)).filter((i) => i >= 0);
      if (t.xabar.soxta) {
        assert.ok(togri.length >= 1 && togri.length < t.joy.qismlar.length, t.id);
        assert.ok(t.xabar.belgilar.includes(t.joy.belgi.id), t.id);
        // Ikkala qadam ham toʻgʻri boʻlsagina hisoblanadi
        assert.ok(L.tekshirXabar(t, { javob: L.JAVOB.soxta, qism: togri[0] }));
        const notogri = t.joy.qismlar.findIndex((q) => !q.togri);
        assert.ok(!L.tekshirXabar(t, { javob: L.JAVOB.soxta, qism: notogri }));
        assert.ok(!L.tekshirXabar(t, { javob: L.JAVOB.haqiqiy, nom: t.nom.javob }));
      } else {
        assert.deepEqual(togri, [], t.id + " — haqiqiy xatda belgi joyi yoʻq");
        assert.ok(L.tekshirXabar(t, { javob: L.JAVOB.haqiqiy, nom: t.nom.javob }));
        for (const v of t.nom.variantlar) if (v !== t.nom.javob) assert.ok(!L.tekshirXabar(t, { javob: L.JAVOB.haqiqiy, nom: v }));
        for (let i = 0; i < t.joy.qismlar.length; i++) assert.ok(!L.tekshirXabar(t, { javob: L.JAVOB.soxta, qism: i }));
      }
      assert.ok(!L.tekshirXabar(t, null));
      prev = t;
    }
    if (tier === 0) assert.equal(yasama, 0, "tier 0 — faqat qoʻlda yozilgan xatlar");
    else assert.ok(yasama > 40, "tier " + tier + " — yasalgan xatlar: " + yasama);
  }
});

test("vaziyat savollari: bitta toʻgʻri javob va toʻrtta variant", () => {
  assert.ok(L.VAZIYATLAR.length >= 6, "vaziyatlar soni: " + L.VAZIYATLAR.length);
  for (const v of L.VAZIYATLAR) {
    assert.equal(v.javoblar.filter((j) => j.togri).length, 1, v.id + " — aynan bitta toʻgʻri javob");
    assert.ok(v.javoblar.length >= 3, v.id);
    const matnlar = v.javoblar.map((j) => j.matn);
    assert.equal(new Set(matnlar).size, matnlar.length, v.id + " — javob takrorlangan");
  }
  for (const t of each(L.vaziyatTask, 25, 11)) {
    assert.equal(t.variantlar.length, 4, t.id);
    assert.equal(new Set(t.variantlar).size, 4, t.id);
    assert.ok(t.variantlar.includes(t.javob), t.id);
    assert.equal(t.javob, t.vaziyat.javoblar.find((j) => j.togri).matn);
    assert.ok(t.nega.length > 20, t.id);
  }
  const joylar = new Set(each(L.vaziyatTask, 25, 13).map((t) => t.variantlar.indexOf(t.javob)));
  assert.ok(joylar.size >= 3, "javob aralashtirilmayapti: " + [...joylar]);
});

test("ketma-ket savollar takrorlanmaydi", () => {
  for (const make of [L.belgiTask, L.xabarTask, L.vaziyatTask]) {
    const list = each(make, 12, 23);
    for (let k = 1; k < list.length; k++) assert.notEqual(list[k].id, list[k - 1].id);
  }
  // Navbatlashtirilgan (filtrlangan) xabarlar ham ketma-ket takrorlanmasin
  const r = rngFrom(29);
  let prev = null;
  for (let k = 0; k < 12; k++) {
    const t = L.xabarTask(r, prev, k % 2 === 0);
    if (prev && prev.xabar.soxta === t.xabar.soxta) assert.notEqual(t.id, prev.id);
    prev = t;
  }
});

// Bola ekranda koʻradigan barcha matn
function korinadiganMatnlar() {
  const out = [];
  for (const b of L.BELGILAR) out.push(b.nom, b.izoh, b.misol);
  for (const m of L.BELGI_MISOL) out.push(m.matn);
  for (const x of L.XABARLAR) out.push(x.kimdan, x.manzil, x.sarlavha, x.matn, x.havola);
  for (const v of L.VAZIYATLAR) {
    out.push(v.matn, v.nega);
    for (const j of v.javoblar) out.push(j.matn);
  }
  for (const t of L.TASHKILOTLAR) out.push(t.nom);
  out.push(...L.QOIDALAR, ...Object.values(L.FARQ_IZOH), ...Object.values(L.JAVOB));
  // Generator matnlari (2026-10-02)
  for (const list of Object.values(L.SOXTA_GAP)) out.push(...list);
  for (const k of Object.values(L.KIRISH)) out.push(k.sarlavha, ...k.gap);
  out.push(...L.HAVOLA_GAP, ...L.HAQIQIY_GAP, L.HAQIQIY_QOSHIMCHA);
  const rg = rngFrom(43);
  for (let k = 0; k < 40; k++) {
    const t = L.xabarTask(rg, null, k % 2 === 0, 1 + (k % 2));
    out.push(t.xabar.manzil, t.xabar.matn, t.xabar.havola, t.joy.matn, t.nom.matn);
  }
  const r = rngFrom(41);
  for (let k = 0; k < 20; k++) {
    for (const make of [L.belgiTask, L.xabarTask, L.vaziyatTask]) {
      const t = make(r, null);
      out.push(t.matn, t.nega);
    }
  }
  return out.filter(Boolean);
}

test("koʻrinadigan matnlarda toʻgʻri tutuq belgisi", () => {
  for (const m of korinadiganMatnlar()) {
    assert.ok(!/['’`´]/.test(m), "notoʻgʻri belgi: " + m);
  }
});

test("haqiqiy brend nomlari ishlatilmaydi — hammasi oʻylab topilgan", () => {
  const brendlar = ["telegram", "google", "facebook", "instagram", "whatsapp", "youtube", "tiktok",
    "yandex", "sberbank", "mastercard", "microsoft", "apple", "gmail", "viber", "twitter",
    "uzcard", "humo", "paynet", "payme", "mail.ru", "vk.com"];
  for (const m of korinadiganMatnlar()) {
    const past = m.toLowerCase();
    for (const brend of brendlar) {
      assert.ok(!past.includes(brend), "haqiqiy brend nomi: " + brend + " → " + m);
    }
  }
  // Barcha manzillar oʻyin uchun oʻylab topilgan tashkilotlar atrofida
  const nomlar = new Set(L.TASHKILOTLAR.map((t) => L.ajrat(t.domen).nom));
  assert.equal(nomlar.size, L.TASHKILOTLAR.length, "tashkilot domenlari takrorlanmasin");
});
