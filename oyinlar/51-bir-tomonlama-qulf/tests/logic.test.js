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

const tierEach = (make, tier, n, seed) => each((r, prev) => make(r, prev, tier), n, seed);

test("yig'indi savollari: javob raqamlar yig'indisiga teng; son tier bilan uzayadi (4 / 5 / 6 xona)", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of tierEach(L.yigindiTask, tier, 30, 3 + tier)) {
      assert.equal(t.javob, L.raqamYigindi(t.son));
      assert.equal(String(t.son).length, 4 + tier, String(t.son));
      assert.ok(t.javob >= 6 && t.javob <= 9 * (4 + tier), String(t.javob));
      assert.ok(t.hisob.includes("+"), t.hisob);
    }
  }
  assert.deepEqual(L.SON.map(([lo]) => String(lo).length), [4, 5, 6]);
});

test("to'qnashuv savollari: faqat bitta variant bir xil yig'indi beradi, chalg'ituvchilar yaqin", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of tierEach(L.toqnashTask, tier, 30, 7 + tier)) {
      assert.equal(t.variantlar.length, 4);
      assert.equal(new Set(t.variantlar).size, 4, "variantlar takrorlanmasin: " + t.variantlar);
      assert.ok(t.variantlar.includes(t.javob), t.id);
      const mos = t.variantlar.filter((v) => L.raqamYigindi(v) === t.yigindi);
      assert.deepEqual(mos, [t.javob], t.variantlar.join(","));
      assert.notEqual(t.javob, String(t.son), "savoldagi sonning o'zi javob bo'lmasin");
      for (const v of t.variantlar) {
        assert.equal(v.length, 4 + tier);
        assert.ok(Math.abs(L.raqamYigindi(v) - t.yigindi) <= 3, "yig'indi yaqin bo'lsin: " + v);
      }
    }
  }
  const joylar = new Set(each(L.toqnashTask, 20, 9).map((t) => t.variantlar.indexOf(t.javob)));
  assert.ok(joylar.size >= 3, "javob aralashtirilmayapti: " + [...joylar]);
});

test("qaytar savollari: 4 variant, to'g'ri xulosa — yig'indidan asl sonni topib bo'lmaydi", () => {
  for (const t of each(L.qaytarTask, 20, 11)) {
    assert.equal(t.variantlar.length, 4);
    assert.equal(new Set(t.variantlar).size, 4);
    assert.equal(t.javob, L.QAYTAR_JAVOB);
    assert.ok(t.variantlar.includes(t.javob), t.id);
    assert.equal(L.raqamYigindi(t.son), L.raqamYigindi(t.juft));
    assert.ok(t.ishora && !t.ishora.includes("Yoʻq"), "ishora javobni aytmaydi");
  }
  const joylar = new Set(each(L.qaytarTask, 20, 13).map((t) => t.variantlar.indexOf(t.javob)));
  assert.ok(joylar.size >= 2, "javob aralashtirilmayapti: " + [...joylar]);
});

test("iz savollari: javob parolning izi, ikki raqamli; parol tier bilan uzayadi", () => {
  const uzunlik = [[3, 3], [4, 4], [5, 5]];
  for (const tier of [0, 1, 2]) {
    let raqamli = 0;
    for (const t of tierEach(L.izTask, tier, 40, 17 + tier)) {
      assert.equal(t.javob, L.iz(t.parol));
      assert.ok(t.javob >= 10 && t.javob <= 99, t.parol + " → " + t.javob);
      assert.ok(t.parol.length >= uzunlik[tier][0] && t.parol.length <= uzunlik[tier][1], t.parol);
      assert.match(t.parol, /^[a-z]+[2-9]?$/, t.parol);
      if (/\d/.test(t.parol)) raqamli++;
      assert.equal(t.qadamlar.length, t.parol.length);
      assert.ok(t.hisob.includes("iz = " + t.javob), t.hisob);
    }
    if (tier === 0) assert.equal(raqamli, 0);
    else assert.ok(raqamli > 5, "tier " + tier + ": raqamli parollar ham bor");
  }
  assert.equal(L.izTask(rngFrom(1), null).parol.length, 3); // tier berilmasa — 0
});

test("«qaysi parolning izi ham shu?»: 4 variant, to'qnashuv haqiqiy, tier 1+ da «Hech biri» ham javob", () => {
  for (const tier of [0, 1, 2]) {
    const javoblar = new Set();
    for (const t of tierEach(L.tengTask, tier, 60, 19 + tier)) {
      assert.equal(t.iz, L.iz(t.parol));
      assert.equal(t.variantlar.length, 4, "4 variant");
      assert.equal(new Set(t.variantlar).size, 4);
      assert.ok(t.variantlar.includes(t.javob), t.id);
      assert.equal(t.variantlar.includes(L.HECH), tier > 0);
      // Mustaqil hisob: nomzodlardan izi teng bo'lganlari
      const mos = t.nomzodlar.filter((c) => L.iz(c) === t.iz);
      if (t.javob === L.HECH) assert.deepEqual(mos, []);
      else assert.deepEqual(mos, [t.javob], t.hisob);
      for (const c of t.nomzodlar) {
        assert.equal(c.length, tier ? 3 : 2, c);
        assert.notEqual(c, t.parol);
        for (const ch of c) assert.ok(L.UNDOSH.includes(ch), c);
      }
      assert.ok(t.matn.includes(String(t.iz)) && t.matn.includes(t.parol));
      assert.ok(!t.ishora.includes(t.javob), "ishora javobni aytmaydi");
      javoblar.add(t.javob === L.HECH ? "hech" : "soz");
    }
    assert.deepEqual([...javoblar].sort(), tier ? ["hech", "soz"] : ["soz"]);
  }
});

test("tuz savollari: javob tuzdan boshlangan iz va tuzsiz izdan farq qiladi", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of tierEach(L.tuzTask, tier, 30, 23 + tier)) {
      assert.equal(t.javob, L.iz(t.parol, t.sayt.tuz));
      assert.equal(t.tuzsiz, L.iz(t.parol));
      assert.notEqual(t.javob, t.tuzsiz, "tuz izni o'zgartirgani ko'rinsin: " + t.parol);
      assert.ok(t.javob >= 10 && t.javob <= 99, String(t.javob));
      assert.equal(t.qadamlar[0].oldin, t.sayt.tuz);
      assert.ok(t.matn.includes(String(t.sayt.tuz)), t.matn);
      assert.equal(t.parol.length, 3 + tier);
    }
  }
});

test("holat savollari: 4 variant, javob variantlar ichida, bank to'liq va takrorsiz", () => {
  for (const bank of [L.HOLATLAR2, L.HOLATLAR3]) {
    assert.ok(bank.length >= 4);
    assert.equal(new Set(bank.map((h) => h.id)).size, bank.length);
    for (const h of bank) {
      assert.equal(h.soxta.length, 3, h.id);
      assert.equal(new Set([h.javob, ...h.soxta]).size, 4, h.id);
      assert.ok(h.nega.length > 20, h.id);
      assert.ok(h.matn.length > 20, h.id);
    }
  }
  for (const t of each(L.holat2Task, 20, 29).concat(each(L.holat3Task, 20, 31))) {
    assert.equal(t.variantlar.length, 4);
    assert.ok(t.variantlar.includes(t.javob), t.id);
    assert.equal(new Set(t.variantlar).size, 4);
    assert.ok(t.ishora.length > 20 && t.ishora !== t.nega, "ishora — eslatma, tushuntirish emas");
  }
  const joylar = new Set(each(L.holat3Task, 30, 37).map((t) => t.variantlar.indexOf(t.javob)));
  assert.ok(joylar.size >= 3, "javob aralashtirilmayapti: " + [...joylar]);
});

test("qisqa so'zlar: faqat kichik lotin harflari, har uzunlikda yetarli", () => {
  assert.equal(new Set(L.QISQA).size, L.QISQA.length);
  for (const w of L.QISQA.concat(L.PAROLLAR)) assert.match(w, /^[a-z]+$/, w);
  for (const n of [3, 4, 5]) {
    assert.ok(L.QISQA.concat(L.PAROLLAR).filter((w) => w.length === n).length >= 5, n + " harfli so'zlar kam");
  }
});

test("bosqich navbati: har bosqichda uch xil mashq keladi", () => {
  const r = rngFrom(41);
  const turlar = (make, bank) => {
    const out = new Set();
    for (let n = 0; n < bank.length; n++) {
      out.add(make(r, null, n).tur);
      out.add(make(r, null, n, 2).tur); // tier bilan ham shu navbat
    }
    return out;
  };
  assert.deepEqual([...turlar(L.bosqich1Task, L.BOSQICH1)].sort(), ["qaytar", "toqnash", "yigindi"]);
  assert.deepEqual([...turlar(L.bosqich2Task, L.BOSQICH2)].sort(), ["holat", "iz", "teng"]);
  assert.deepEqual([...turlar(L.bosqich3Task, L.BOSQICH3)].sort(), ["holat", "tuz"]);
});

test("ketma-ket savollar takrorlanmaydi", () => {
  for (const make of [L.yigindiTask, L.toqnashTask, L.qaytarTask, L.izTask, L.tengTask, L.holat2Task, L.holat3Task, L.tuzTask]) {
    for (const tier of [0, 1, 2]) {
      const list = tierEach(make, tier, 12, 43 + tier);
      for (let k = 1; k < list.length; k++) assert.notEqual(list[k].id, list[k - 1].id);
    }
  }
});

test("ko'rinadigan matnlarda to'g'ri tutuq belgisi", () => {
  const matnlar = [];
  const r = rngFrom(47);
  for (const make of [L.yigindiTask, L.toqnashTask, L.qaytarTask, L.izTask, L.tengTask, L.holat2Task, L.holat3Task, L.tuzTask]) {
    for (let k = 0; k < 12; k++) {
      const t = make(r, null, k % 3);
      matnlar.push(t.matn, t.nega, t.hisob, t.ishora || "", ...(t.variantlar || []).map(String));
    }
  }
  for (const bank of [L.HOLATLAR2, L.HOLATLAR3]) {
    for (const h of bank) matnlar.push(h.matn, h.javob, h.nega, ...h.soxta);
  }
  for (const s of L.SAYTLAR) matnlar.push(s.nom);
  matnlar.push(L.HA, L.YOQ, L.HECH, L.QAYTAR_JAVOB, ...L.QAYTAR_SOXTA);
  for (const m of matnlar) assert.ok(!/['’`´]/.test(m), "notoʻgʻri belgi: " + m);
});
