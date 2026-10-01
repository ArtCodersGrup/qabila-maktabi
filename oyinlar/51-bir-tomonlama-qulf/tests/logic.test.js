// 51-o'yin: bir tomonlama qulf — iz (xesh) qoidasi, to'qnashuvlar, tuz va mashq savollari.
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
const each = (make, n, seed) => {
  const r = rngFrom(seed || 51);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("belgi qiymati: raqam — o'zi, harf — alifbodagi o'rni", () => {
  assert.equal(L.belgiQiymat("0"), 0);
  assert.equal(L.belgiQiymat("7"), 7);
  assert.equal(L.belgiQiymat("a"), 1);
  assert.equal(L.belgiQiymat("z"), 26);
  assert.equal(L.belgiQiymat("o"), 15);
  assert.equal(L.belgiQiymat("A"), 1, "katta harf ham xuddi shunday");
  assert.equal(L.belgiQiymat("ʻ"), 0, "tanimagan belgi — nol");
});

test("iz: qo'lda hisoblangan misolga to'g'ri keladi", () => {
  // olma: 0×3+15=15 → 15×3+12=57 → 57×3+13=184 → 84 → 84×3+1=253 → 53
  assert.equal(L.iz("olma"), 53);
  assert.equal(L.iz("a"), 1);
  assert.equal(L.iz("ab"), 5);
  assert.equal(L.iz(""), 0);
  // Iz har doim ikki raqamga sig'adi va bir xil parol uchun o'zgarmaydi
  for (const p of L.PAROLLAR.concat(L.QISQA)) {
    const x = L.iz(p);
    assert.ok(x >= 0 && x < L.CHEK, p + " → " + x);
    assert.equal(x, L.iz(p), "bir xil parol — bir xil iz");
  }
});

test("iz bir tomonlama: har parol uchun bir xil iz beradigan boshqa parol topiladi", () => {
  for (const p of L.PAROLLAR.concat(L.QISQA)) {
    const juft = L.toqnash(p, 0);
    assert.ok(juft, p + " uchun to'qnashuv topilmadi");
    assert.notEqual(juft, p);
    assert.equal(L.iz(juft), L.iz(p), p + " ↔ " + juft);
  }
  // Tuz bilan ham shunday
  assert.equal(L.iz(L.toqnash("kitob", 23), 23), L.iz("kitob", 23));
});

test("iz: belgilar tartibi muhim, bitta belgi o'zgarsa iz ham o'zgaradi", () => {
  assert.notEqual(L.iz("ab"), L.iz("ba"));
  assert.notEqual(L.iz("kitob"), L.iz("kitoq"));
  let farqli = 0;
  for (const p of L.QISQA) if (L.iz(p) !== L.iz(p.slice(0, -1) + "z")) farqli++;
  assert.equal(farqli, L.QISQA.length, "oxirgi harf o'zgarsa iz boshqa chiqishi kerak");
});

test("izQadamlar: zanjir uzluksiz, oxirgi qadam — izning o'zi", () => {
  const q = L.izQadamlar("soat", 7);
  assert.equal(q.length, 4);
  assert.equal(q[0].oldin, 7, "boshlang'ich iz — tuz");
  assert.equal(q[q.length - 1].iz, L.iz("soat", 7));
  for (let k = 0; k < q.length; k++) {
    assert.equal(q[k].xom, q[k].oldin * L.KOP + q[k].qiymat);
    assert.equal(q[k].iz, q[k].xom % L.CHEK);
    if (k > 0) assert.equal(q[k].oldin, q[k - 1].iz, "keyingi qadam oldingi izdan boshlanadi");
  }
  assert.ok(L.izHisob("soat", 7).includes("×3+"));
});

test("tuz: bir xil parol har saytda boshqa iz beradi", () => {
  const jadval = L.tuzJadval("kitob");
  assert.equal(jadval.length, L.SAYTLAR.length);
  assert.ok(new Set(jadval.map((x) => x.iz)).size >= 3, "izlar bir-biridan farq qilsin");
  for (const x of jadval) assert.equal(x.iz, L.iz("kitob", x.sayt.tuz));
  // Bitta saytda esa iz doim bir xil — shuning uchun sayt seni taniydi
  assert.equal(L.iz("kitob", 23), L.iz("kitob", 23));
  // Tuzlar har xil
  assert.equal(new Set(L.SAYTLAR.map((s) => s.tuz)).size, L.SAYTLAR.length);
});

test("raqamlar yig'indisi ham bir tomonlama: boshqa son bir xil yig'indi beradi", () => {
  assert.equal(L.raqamYigindi(3791), 20);
  assert.equal(L.yigindiHisob(3791), "3+7+9+1 = 20");
  const r = rngFrom(5);
  for (let k = 0; k < 50; k++) {
    const son = 1000 + Math.floor(r() * 9000);
    const juft = L.yigindiJuft(son, r);
    if (!juft) continue;
    assert.notEqual(juft, son);
    assert.equal(L.raqamYigindi(juft), L.raqamYigindi(son), son + " ↔ " + juft);
    assert.equal(String(juft).length, 4, "nol bilan boshlanmasin: " + juft);
  }
});

test("yig'indi savollari: javob raqamlar yig'indisiga teng", () => {
  for (const t of each(L.yigindiTask, 20, 3)) {
    assert.equal(t.javob, L.raqamYigindi(t.son));
    assert.ok(t.son >= 1000 && t.son <= 9999, String(t.son));
    assert.ok(t.javob >= 6 && t.javob <= 36, String(t.javob));
    assert.ok(t.hisob.includes("+"), t.hisob);
  }
});

test("to'qnashuv savollari: faqat bitta variant bir xil yig'indi beradi", () => {
  for (const t of each(L.toqnashTask, 20, 7)) {
    assert.equal(t.variantlar.length, 4);
    assert.equal(new Set(t.variantlar).size, 4, "variantlar takrorlanmasin: " + t.variantlar);
    assert.ok(t.variantlar.includes(t.javob), t.id);
    const mos = t.variantlar.filter((v) => L.raqamYigindi(v) === t.yigindi);
    assert.deepEqual(mos, [t.javob], t.variantlar.join(","));
    assert.notEqual(t.javob, String(t.son), "savoldagi sonning o'zi javob bo'lmasin");
  }
  const joylar = new Set(each(L.toqnashTask, 20, 9).map((t) => t.variantlar.indexOf(t.javob)));
  assert.ok(joylar.size >= 3, "javob aralashtirilmayapti: " + [...joylar]);
});

test("qaytar savollari: to'g'ri xulosa — yig'indidan asl sonni topib bo'lmaydi", () => {
  for (const t of each(L.qaytarTask, 20, 11)) {
    assert.equal(t.variantlar.length, 3);
    assert.equal(t.javob, L.QAYTAR_JAVOB);
    assert.ok(t.variantlar.includes(t.javob), t.id);
    assert.equal(L.raqamYigindi(t.son), L.raqamYigindi(t.juft));
  }
  const joylar = new Set(each(L.qaytarTask, 20, 13).map((t) => t.variantlar.indexOf(t.javob)));
  assert.ok(joylar.size >= 2, "javob aralashtirilmayapti: " + [...joylar]);
});

test("iz savollari: javob parolning izi, ikki raqamli", () => {
  for (const t of each(L.izTask, 20, 17)) {
    assert.equal(t.javob, L.iz(t.parol));
    assert.ok(t.javob >= 10 && t.javob <= 99, t.parol + " → " + t.javob);
    assert.ok(t.parol.length >= 3 && t.parol.length <= 4, t.parol);
    assert.equal(t.qadamlar.length, t.parol.length);
    assert.ok(t.hisob.includes("iz = " + t.javob), t.hisob);
  }
});

test("tengmi savollari: javob izlarning tengligiga mos, ikki holat ham uchraydi", () => {
  const list = each(L.tengTask, 30, 19);
  for (const t of list) {
    const [a, b] = t.ikki;
    assert.notEqual(a, b);
    assert.deepEqual(t.izlar, [L.iz(a), L.iz(b)]);
    assert.equal(t.javob, L.iz(a) === L.iz(b) ? L.HA : L.YOQ, a + " ↔ " + b);
    assert.deepEqual(t.variantlar, [L.HA, L.YOQ]);
  }
  const javoblar = new Set(list.map((t) => t.javob));
  assert.equal(javoblar.size, 2, "to'qnashuv ham, farqli iz ham chiqishi kerak");
});

test("tuz savollari: javob tuzdan boshlangan iz va tuzsiz izdan farq qiladi", () => {
  for (const t of each(L.tuzTask, 20, 23)) {
    assert.equal(t.javob, L.iz(t.parol, t.sayt.tuz));
    assert.equal(t.tuzsiz, L.iz(t.parol));
    assert.notEqual(t.javob, t.tuzsiz, "tuz izni o'zgartirgani ko'rinsin: " + t.parol);
    assert.ok(t.javob >= 10 && t.javob <= 99, String(t.javob));
    assert.equal(t.qadamlar[0].oldin, t.sayt.tuz);
    assert.ok(t.matn.includes(String(t.sayt.tuz)), t.matn);
  }
});

test("holat savollari: javob variantlar ichida, bank to'liq va takrorsiz", () => {
  for (const bank of [L.HOLATLAR2, L.HOLATLAR3]) {
    assert.ok(bank.length >= 4);
    assert.equal(new Set(bank.map((h) => h.id)).size, bank.length);
    for (const h of bank) {
      assert.equal(h.soxta.length, 2, h.id);
      assert.equal(new Set([h.javob, ...h.soxta]).size, 3, h.id);
      assert.ok(h.nega.length > 20, h.id);
      assert.ok(h.matn.length > 20, h.id);
    }
  }
  for (const t of each(L.holat2Task, 20, 29).concat(each(L.holat3Task, 20, 31))) {
    assert.equal(t.variantlar.length, 3);
    assert.ok(t.variantlar.includes(t.javob), t.id);
    assert.equal(new Set(t.variantlar).size, 3);
  }
  const joylar = new Set(each(L.holat3Task, 20, 37).map((t) => t.variantlar.indexOf(t.javob)));
  assert.ok(joylar.size === 3, "javob aralashtirilmayapti: " + [...joylar]);
});

test("bosqich navbati: har bosqichda uch xil mashq keladi", () => {
  const r = rngFrom(41);
  const turlar = (make, bank) => {
    const out = new Set();
    for (let n = 0; n < bank.length; n++) out.add(make(r, null, n).tur);
    return out;
  };
  assert.deepEqual([...turlar(L.bosqich1Task, L.BOSQICH1)].sort(), ["qaytar", "toqnash", "yigindi"]);
  assert.deepEqual([...turlar(L.bosqich2Task, L.BOSQICH2)].sort(), ["holat", "iz", "teng"]);
  assert.deepEqual([...turlar(L.bosqich3Task, L.BOSQICH3)].sort(), ["holat", "tuz"]);
});

test("ketma-ket savollar takrorlanmaydi", () => {
  for (const make of [L.yigindiTask, L.toqnashTask, L.qaytarTask, L.izTask, L.tengTask, L.holat2Task, L.holat3Task, L.tuzTask]) {
    const list = each(make, 12, 43);
    for (let k = 1; k < list.length; k++) assert.notEqual(list[k].id, list[k - 1].id);
  }
});

test("ko'rinadigan matnlarda to'g'ri tutuq belgisi", () => {
  const matnlar = [];
  const r = rngFrom(47);
  for (const make of [L.yigindiTask, L.toqnashTask, L.qaytarTask, L.izTask, L.tengTask, L.holat2Task, L.holat3Task, L.tuzTask]) {
    for (let k = 0; k < 12; k++) {
      const t = make(r, null);
      matnlar.push(t.matn, t.nega, t.hisob, ...(t.variantlar || []).map(String));
    }
  }
  for (const bank of [L.HOLATLAR2, L.HOLATLAR3]) {
    for (const h of bank) matnlar.push(h.matn, h.javob, h.nega, ...h.soxta);
  }
  for (const s of L.SAYTLAR) matnlar.push(s.nom);
  matnlar.push(L.HA, L.YOQ, L.QAYTAR_JAVOB, ...L.QAYTAR_SOXTA);
  for (const m of matnlar) assert.ok(!/['’`´]/.test(m), "notoʻgʻri belgi: " + m);
});
