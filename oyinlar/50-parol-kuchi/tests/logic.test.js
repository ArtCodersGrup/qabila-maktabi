// 50-o'yin: parol kuchi — variantlar soni, topish vaqti va baho.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const S = require("../../umumiy/js/sanash.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
const each = (make, n, seed) => {
  const r = rngFrom(seed || 50);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("tahlil: alifbo o'lchami ishlatilgan belgi turlaridan yig'iladi", () => {
  assert.equal(L.tahlil("1234").alifbo, 10);
  assert.equal(L.tahlil("abcd").alifbo, 26);
  assert.equal(L.tahlil("abc123").alifbo, 36);
  assert.equal(L.tahlil("Abc123").alifbo, 62);
  assert.equal(L.tahlil("Abc123!").alifbo, 94);
  assert.equal(L.tahlil("ikki soz").alifbo, 58, "boʻsh joy ham belgi hisoblanadi");
  assert.equal(L.tahlil("abcd").variant, S.takrorli(26, 4));
});

test("vaqt: variantlar soni tezlikka bo'linadi", () => {
  assert.equal(L.vaqt(1000000n, 1000000n), 1n);
  assert.equal(L.vaqt(S.takrorli(26, 6), 1000000n), 308n);
  // Kuchli uskuna ming marta tez
  assert.equal(L.vaqt(S.takrorli(26, 8), 1000000000n) * 1000n <= L.vaqt(S.takrorli(26, 8), 1000000n) * 1001n, true);
});

test("vaqtMatni: eng mos birlikni tanlaydi", () => {
  assert.equal(L.vaqtMatni(0n), "bir soniyadan kam");
  assert.equal(L.vaqtMatni(45n), "45 soniya");
  assert.equal(L.vaqtMatni(300n), "5 daqiqa");
  assert.equal(L.vaqtMatni(7200n), "2 soat");
  assert.equal(L.vaqtMatni(172800n), "2 kun");
  assert.equal(L.vaqtMatni(31536000n * 5n), "5 yil");
  assert.equal(L.vaqtMatni(31536000n * 5000n), "5 ming yil");
  assert.equal(L.vaqtMatni(31536000n * 5000000n), "5 million yil");
  assert.equal(L.vaqtMatni(L.KOINOT * 2n), "koinot yoshidan ham koʻp");
});

// O'yinning asosiy xabari: uzunlik murakkablikdan kuchliroq
test("uzun oddiy parol qisqa murakkabdan kuchli", () => {
  const qisqaMurakkab = L.baho("Qq1!5z");     // 6 ta belgi, 4 xil tur
  const uzunOddiy = L.baho("kitobjavonstol"); // 14 ta kichik harf
  assert.equal(qisqaMurakkab.daraja, "oʻrtacha");
  assert.equal(uzunOddiy.daraja, "kuchli");
  assert.ok(uzunOddiy.sek > qisqaMurakkab.sek * 1000000n, "uzun parol ancha koʻp vaqt talab qiladi");
});

test("lug'at: ism, mashhur so'z va yil — uzunligidan qat'i nazar zaif", () => {
  for (const p of ["Anvar2010", "salom123", "qwerty", "2007", "P@rol1", "iloveyou"]) {
    assert.equal(L.baho(p).daraja, "zaif", p);
  }
  assert.equal(L.lugatda("Anvar2010"), "ism");
  assert.equal(L.lugatda("2007"), "yil");
  assert.equal(L.lugatda("qizil chashma"), null);
  // Hiyla almashtirishlar yordam bermaydi
  assert.equal(L.soddalashtir("P@ss1"), "pass");
  assert.equal(L.soddalashtir("Anvar2010"), "anvar");
  assert.equal(L.soddalashtir("$al0m"), "salom");
});

const tierEach = (make, tier, n, seed) => each((r, prev) => make(r, prev, tier), n, seed);

test("variant savollari: javob a^i ga teng, chegara tier bilan o'sadi", () => {
  const chegara = [1100n, 20000n, 1000000n];
  for (const tier of [0, 1, 2]) {
    let eng = 0n;
    for (const t of tierEach(L.variantTask, tier, 40, 3 + tier)) {
      assert.equal(t.javob, S.takrorli(t.alifbo, t.uzunlik));
      assert.ok(t.javob <= chegara[tier], "javobni raqam klaviaturasida yozib boʻlishi kerak: " + t.javob);
      assert.ok(t.hisob.includes("^"), t.hisob);
      if (t.javob > eng) eng = t.javob;
    }
    if (tier) assert.ok(eng > chegara[tier - 1], "tier " + tier + ": katta javoblar ham chiqadi");
  }
  // Har tier da kamida 5 ta savol (takrorlanmaslik uchun)
  for (const d of [0, 1, 2]) assert.ok(L.VARIANT_SAVOL.filter((x) => x.daraja === d).length >= 5, "daraja " + d);
  assert.ok(L.VARIANT_SAVOL.length >= 12);
  assert.equal(new Set(L.VARIANT_SAVOL.map((x) => x.id)).size, L.VARIANT_SAVOL.length);
});

test("vaqt savollari: to'rtta variant, to'g'risi ichida va takrorsiz", () => {
  for (const tier of [0, 1, 2]) {
    const tezliklar = new Set();
    for (const t of tierEach(L.vaqtTask, tier, 40, 7 + tier)) {
      assert.equal(t.variantlar.length, 4, t.id);
      assert.equal(new Set(t.variantlar).size, 4, "variantlar takrorlanmasin: " + t.variantlar);
      assert.ok(t.variantlar.includes(t.javob), t.id);
      assert.equal(t.javob, L.vaqtMatni(t.sek));
      assert.equal(t.sek, L.vaqt(S.takrorli(t.alifbo, t.uzunlik), t.tezlik.soniyada));
      tezliklar.add(t.tezlik.id);
      if (tier) assert.ok(t.uzunlik >= L.VAQT_UZUNLIK[tier][0] && t.uzunlik <= L.VAQT_UZUNLIK[tier][1]);
    }
    assert.deepEqual([...tezliklar].sort(), tier === 2 ? ["kuchli", "oddiy"] : ["oddiy"]);
  }
  // To'g'ri javob har xil joylarda turadi
  const joylar = new Set(each(L.vaqtTask, 24, 11).map((t) => t.variantlar.indexOf(t.javob)));
  assert.ok(joylar.size >= 3, "javob aralashtirilmayapti: " + [...joylar]);
});

test("qiyos savollari: 4 parol, eng kuchlisi yagona va to'g'ri tanlangan", () => {
  const tartib = { zaif: 0, "oʻrtacha": 1, kuchli: 2 };
  for (const tier of [0, 1, 2]) {
    let ortacha = 0;
    for (const t of tierEach(L.qiyosTask, tier, 40, 13 + tier)) {
      assert.equal(t.variantlar.length, 4, "4 variant");
      assert.equal(new Set(t.variantlar).size, 4);
      assert.ok(t.variantlar.includes(t.javob), t.id);
      assert.equal(L.baho(t.javob).daraja, "kuchli", t.javob);
      for (const boshqa of t.variantlar.filter((p) => p !== t.javob)) {
        const a = L.baho(t.javob);
        const b = L.baho(boshqa);
        assert.ok(tartib[a.daraja] > tartib[b.daraja], t.javob + " (" + a.daraja + ") ↔ " + boshqa + " (" + b.daraja + ")");
        assert.ok(L.kuch(t.javob) > L.kuch(boshqa));
        if (b.daraja === "oʻrtacha") ortacha++;
      }
      assert.ok(t.nega.length > 20 && t.ishora.length > 20);
      // Maslahat javobni aytmaydi
      assert.ok(!t.ishora.includes(t.javob), "ishorada javob bor");
    }
    if (tier === 0) assert.equal(ortacha, 0, "tier 0: qolganlari ochiq-oydin zaif");
    else assert.ok(ortacha >= 40, "tier " + tier + ": oʻrtacha parollar ham bor");
  }
});

test("baho savollari: 5 variant (daraja + sababi), javob baho() ga mos", () => {
  assert.equal(L.SABABLAR.length, 5);
  for (const tier of [0, 1, 2]) {
    const sabablar = new Set();
    for (const t of tierEach(L.bahoTask, tier, 80, 17 + tier)) {
      assert.equal(t.variantlar.length, 5);
      assert.equal(new Set(t.variantlar).size, 5);
      assert.ok(t.variantlar.includes(t.javob), t.parol + " → " + t.javob);
      const b = L.baho(t.parol);
      assert.equal(t.daraja, b.daraja);
      assert.ok(L.DARAJALAR.includes(t.daraja));
      const s = L.SABABLAR.find((x) => x.nom === t.javob);
      assert.equal(s.daraja, b.daraja, t.parol + ": sabab darajaga mos emas");
      assert.equal(s.id, L.sababi(t.parol));
      if (s.id === "mashhur") assert.equal(b.lugat, "mashhur", t.parol);
      if (s.id === "ism") assert.ok(["ism", "yil"].includes(b.lugat), t.parol);
      if (s.id === "qisqa") assert.ok(!b.lugat && b.sek < 86400n, t.parol);
      assert.ok(t.nega.length > 20, t.parol);
      sabablar.add(s.id);
    }
    assert.equal(sabablar.size, 5, "tier " + tier + ": hamma sabab uchraydi — " + [...sabablar]);
  }
  // Har uch daraja ham uchraydi
  const darajalar = new Set(L.PAROLLAR.map((p) => L.baho(p).daraja));
  assert.equal(darajalar.size, 3, [...darajalar].join(","));
});

test("yasaParol: har sabab uchun parol baho() bilan tasdiqlanadi", () => {
  const r = rngFrom(31);
  for (const tier of [0, 1, 2]) {
    for (const s of L.SABABLAR) {
      for (let k = 0; k < 30; k++) {
        const p = L.yasaParol(s.id, r, tier);
        assert.ok(p, s.id);
        assert.equal(L.sababi(p), s.id, p);
        assert.equal(L.baho(p).daraja, s.daraja, p);
      }
    }
  }
  // Niqoblangan mashhur parollar — baribir lug'atda
  for (const p of L.MASHHUR_NIQOB) assert.equal(L.lugatda(p), "mashhur", p);
  assert.equal(L.lugatda("12345678"), "mashhur", "raqamli mashhur parol ham lug'atda");
});

test("parolni o'zing yasa: shartlar tekshiriladi", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of tierEach(L.yasaTask, tier, 30, 41 + tier)) {
      const m = L.YASA_MAQSAD[tier];
      assert.equal(t.kartalar.length, 8);
      assert.equal(new Set(t.kartalar).size, 8);
      const tuzoq = t.kartalar.filter((x) => L.TUZOQ.includes(x));
      const yaxshi = t.kartalar.filter((x) => !L.TUZOQ.includes(x));
      assert.equal(tuzoq.length, m.tuzoq);
      // Yaxshi so'zlardan yig'ilgan ibora qabul qilinadi — vazifa yechimli
      const namuna = yaxshi.slice(0, m.minSoz);
      assert.equal(L.yasaTekshir(t, namuna).ok, true, namuna.join(" ") + ": " + L.yasaTekshir(t, namuna).sabab);
      // Kam so'z, takror va tuzoq so'z — rad etiladi, sababi aytiladi
      assert.match(L.yasaTekshir(t, yaxshi.slice(0, m.minSoz - 1)).sabab, /kam/);
      assert.match(L.yasaTekshir(t, Array(m.minSoz).fill(yaxshi[0])).sabab, /ikki marta/);
      if (tuzoq.length) assert.match(L.yasaTekshir(t, [...yaxshi.slice(0, m.minSoz), tuzoq[0]]).sabab, /ism, yil yoki mashhur/);
      assert.equal(L.yasaTekshir(t, []).ok, false);
    }
  }
  assert.ok(L.YASA_MAQSAD[2].minSek > L.YASA_MAQSAD[0].minSek);
});

test("ibora so'zlari: kamida 10 ta, hammasi har xil", () => {
  assert.ok(L.SOZLAR.length >= 10);
  assert.equal(new Set(L.SOZLAR).size, L.SOZLAR.length);
  // To'rt so'zli ibora — kuchli parol
  const ibora = L.SOZLAR.slice(0, 4).join(" ");
  assert.equal(L.baho(ibora).daraja, "kuchli", ibora);
});

test("ketma-ket savollar takrorlanmaydi", () => {
  for (const make of [L.variantTask, L.vaqtTask, L.qiyosTask, L.bahoTask, L.yasaTask]) {
    for (const tier of [0, 1, 2]) {
      const list = tierEach(make, tier, 12, 23 + tier);
      for (let k = 1; k < list.length; k++) assert.notEqual(list[k].id, list[k - 1].id);
    }
  }
});

test("ko'rinadigan matnlarda to'g'ri tutuq belgisi", () => {
  const matnlar = [];
  const r = rngFrom(9);
  for (let k = 0; k < 15; k++) {
    matnlar.push(L.variantTask(r, null, k % 3).matn, L.vaqtTask(r, null, k % 3).matn, L.qiyosTask(r, null, k % 3).nega, L.bahoTask(r, null, k % 3).nega);
    matnlar.push(L.qiyosTask(r, null).ishora, L.bahoTask(r, null).ishora, L.yasaTask(r, null, k % 3).matn, L.yasaTask(r, null).ishora);
  }
  for (const t of L.TURLAR) matnlar.push(t.nom);
  for (const x of L.SABABLAR) matnlar.push(x.nom);
  for (const x of L.VARIANT_SAVOL) matnlar.push(x.matn);
  for (const m of matnlar) assert.ok(!/['’`´]/.test(m), "notoʻgʻri belgi: " + m);
});
