// «Dipfeyk»: chizma yuz belgilari, lab-ovoz sxemasi, manbani tekshirish, etika va tarqalish hisobi.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const L = require("../js/logic.js");

// Urugʻli tasodifiy sonlar (mulberry32): har ishga tushirishda bir xil ketma-ketlik, davri 2³²
function rngFrom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// make(prev, rng, tier) dan ketma-ket vazifalar
function each(make, count, tier, seed) {
  const r = rngFrom(seed || 78);
  const out = [];
  let prev = null;
  for (let k = 0; k < count; k++) {
    prev = make(prev, r, tier);
    out.push(prev);
  }
  return out;
}

const GENERATORLAR = ["belgiTask", "juftTask", "labTask", "shubhaTask", "sanaTask", "zanjirTask", "muammoTask", "harakatTask", "tarqalishTask"];

// ---------- Mustaqil qayta hisoblash ----------
// Yuzdagi belgilar soni — maydonlardan
const belgiSoni = (y) => (y.chet ? 1 : 0) + (y.soya ? 1 : 0) + (y.koz ? 1 : 0) + (y.tish ? 1 : 0);
const BELGI_NOM = { chet: "Yuz cheti xira", soya: "Yorugʻlik va soya mos emas", koz: "Koʻzlar gʻalati", tish: "Tishlar gʻalati" };
const TASHQI = ["teri", "soch", "sochRang", "kiyim", "nur"];
// Shubhali satrlarni matnidan tanish (generatorning ichki bayrogʻiga ishonmasdan)
const SHUBHALI = /kun oldin ochilgan|Anonim kanal|asl manbasi nomaʼlum|hech qayerda topilmadi|shu postni koʻchirgan|rad etgan|dan beri internetda bor|Sana ham, joy ham koʻrsatilmagan|daraxtlar yam-yashil/;
const BUZILGAN = /ruxsat soʻralmagan|«yoʻq» degan|haqoratli gaplarni|pul soʻralyapti|uyatli ishni|hech qayerda aytilmagan|olib tashlangan/;
const KUNLAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const yilKuni = (d, oy) => KUNLAR.slice(0, oy).reduce((a, b) => a + b, 0) + d;

test("har generator har zinada 30 ta har xil toʻgʻri vazifa beradi, ketma-ket takrorlanmaydi", () => {
  for (const nom of GENERATORLAR) {
    for (const tier of [0, 1, 2]) {
      const list = each(L[nom], 150, tier, 11 + tier);
      for (let i = 1; i < list.length; i++) assert.notEqual(list[i].id, list[i - 1].id, `${nom} tier ${tier}`);
      const xil = new Set(list.map((t) => t.id));
      assert.ok(xil.size >= 30, `${nom} tier ${tier}: ${xil.size} ta har xil`);
      for (const t of list) {
        assert.ok(t.tur && t.matn, t.id);
        if (t.variantlar) {
          assert.ok(t.variantlar.length >= 4, `${t.id}: kamida 4 variant`);
          assert.equal(new Set(t.variantlar).size, t.variantlar.length, `${t.id}: variantlar takrorlanmaydi`);
          assert.ok(t.variantlar.includes(t.javob), `${t.id}: javob variantlar ichida`);
          assert.ok(t.ishora && !t.ishora.includes(String(t.javob)), `${t.id}: maslahat javobni aytmaydi`);
          assert.ok(t.nega, t.id);
        } else {
          assert.ok(Number.isInteger(t.javob) && t.javob >= 0 && t.javob <= 999, `${t.id}: son javob ${t.javob}`);
          assert.ok(t.nega && t.hisob, t.id);
        }
      }
    }
  }
});

test("1-bosqich: yuzdagi belgi — maydonlardan mustaqil hisob bilan", () => {
  const javoblar = new Set();
  for (const tier of [0, 1]) {
    for (const t of each(L.belgiTask, 200, tier)) {
      const n = belgiSoni(t.yuz);
      assert.ok(n <= 1, t.id);
      if (tier === 0) assert.equal(n, 1, "tier 0 da doim bitta belgi");
      const bor = Object.keys(BELGI_NOM).find((k) => t.yuz[k]);
      assert.equal(t.javob, bor ? BELGI_NOM[bor] : "Belgi yoʻq", t.id);
      assert.equal(t.variantlar.length, 5);
      if (tier === 0) {
        assert.notEqual(t.yuz.koz, "yaltiroq", "tier 0 da nozik belgi yoʻq");
        assert.notEqual(t.yuz.chet, "past");
      }
      javoblar.add(tier + ":" + t.javob);
    }
  }
  assert.equal(javoblar.size, 4 + 5, "hamma javob uchraydi");
  const sonlar = new Set();
  for (const t of each(L.belgiTask, 200, 2)) {
    assert.equal(t.tur, "belgiSoni");
    assert.equal(t.javob, belgiSoni(t.yuz), t.id);
    assert.ok(t.javob >= 0 && t.javob <= 3);
    sonlar.add(t.javob);
  }
  assert.deepEqual([...sonlar].sort(), [0, 1, 2, 3]);
});

test("1-bosqich: ikki tasvir — aynan bittasi oʻzgartirilgan, tashqi koʻrinishi bir xil", () => {
  for (const tier of [0, 1, 2]) {
    let nigoh = 0;
    for (const t of each(L.juftTask, 200, tier)) {
      const a = t.yuzlar.A;
      const b = t.yuzlar.B;
      assert.equal(belgiSoni(a) + belgiSoni(b), 1, t.id);
      const harf = belgiSoni(a) ? "A" : "B";
      const soxta = t.yuzlar[harf];
      const belgi = Object.keys(BELGI_NOM).find((k) => soxta[k]);
      assert.ok(t.javob.startsWith(harf + " — "), t.id);
      assert.equal(t.javob, `${harf} — ${L.BELGI[belgi].qisqa}`, t.id);
      for (const k of TASHQI) assert.equal(a[k], b[k], `${t.id}: ${k} bir xil`);
      if (a.qarash !== b.qarash) nigoh++;
      // Variantlar: ikki harf × ikki belgi
      assert.equal(t.variantlar.filter((v) => v.startsWith("A")).length, 2);
      assert.equal(t.variantlar.filter((v) => v.startsWith("B")).length, 2);
    }
    assert.equal(nigoh > 0, tier === 2, `tier ${tier}: tabiiy farq (nigoh)`);
  }
});

test("1-bosqich: lab-ovoz — mos kelmagan kadrlar soni", () => {
  for (const tier of [0, 1, 2]) {
    let nol = 0;
    let kech = 0;
    for (const t of each(L.labTask, 200, tier)) {
      assert.equal(t.ovoz.length, L.LAB_KADR[tier]);
      assert.equal(t.lab.length, t.ovoz.length);
      let n = 0;
      t.ovoz.forEach((x, i) => { if (x !== t.lab[i]) n++; });
      assert.equal(t.javob, n, t.id);
      assert.deepEqual(t.farqli, t.ovoz.map((x, i) => (x !== t.lab[i] ? i + 1 : 0)).filter(Boolean));
      assert.ok(t.ovoz.includes(0) && t.ovoz.includes(1), "ovoz ham, jimlik ham bor");
      if (n === 0) nol++;
      if (t.kech) {
        kech++;
        t.lab.forEach((x, i) => assert.equal(x, i === 0 ? 0 : t.ovoz[i - 1], `${t.id}: lab bir kadr kechikadi`));
      }
    }
    assert.equal(nol > 0, tier === 1, `tier ${tier}: «hammasi mos» holati`);
    assert.equal(kech > 0, tier === 2, `tier ${tier}: kechikish`);
  }
});

test("2-bosqich: post tekshiruvi — shubhali satrlar matnidan mustaqil aniqlanadi", () => {
  const nomlar = { kim: "Kim tarqatgani shubhali", boshqa: "Boshqa manbalarda tasdiq yoʻq", sana: "Sana mos emas" };
  const javoblar = new Set();
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.shubhaTask, 200, tier)) {
      assert.equal(t.post.qatorlar.length, 3);
      assert.deepEqual(t.post.qatorlar.map((q) => q.id), ["kim", "boshqa", "sana"]);
      const yomon = t.post.qatorlar.filter((q) => SHUBHALI.test(q.matn));
      for (const q of t.post.qatorlar) assert.equal(q.yomon, SHUBHALI.test(q.matn), `${q.matn}`);
      if (tier < 2) {
        assert.ok(yomon.length <= 1, t.id);
        if (tier === 0) assert.equal(yomon.length, 1);
        assert.equal(t.javob, yomon.length ? nomlar[yomon[0].id] : "Uch tekshiruvdan ham oʻtdi", t.id);
      } else {
        assert.equal(t.javob, `${yomon.length} ta`, t.id);
      }
      assert.ok(L.DAVOLAR.includes(t.post.davo));
      javoblar.add(tier + ":" + t.javob);
    }
  }
  assert.equal(javoblar.size, 3 + 4 + 4, "hamma javob uchraydi");
  // Sana satrlarida kun oy uzunligidan oshmaydi
  const r = rngFrom(4);
  for (let k = 0; k < 500; k++) {
    for (const q of L.postYasa(r, k % 2 ? ["sana"] : []).qatorlar) {
      for (const m of q.matn.matchAll(/(\d+)-(yanvar|fevral|mart|aprel|may|iyun|iyul|avgust|sentabr|oktabr|noyabr|dekabr)/g)) {
        assert.ok(Number(m[1]) >= 1 && Number(m[1]) <= KUNLAR[L.OYLAR.indexOf(m[2])], q.matn);
      }
    }
  }
});

test("2-bosqich: sana — kunlar farqi yil kunlari orqali mustaqil hisoblanadi", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.sanaTask, 200, tier)) {
      assert.ok(t.d1 >= 1 && t.d1 <= KUNLAR[t.oy1], t.id);
      assert.ok(t.d2 >= 1 && t.d2 <= KUNLAR[t.oy2], t.id);
      assert.equal(t.oy2 - t.oy1, tier, `${t.id}: oylar orasi`);
      assert.equal(t.javob, yilKuni(t.d2, t.oy2) - yilKuni(t.d1, t.oy1), t.id);
      assert.ok(t.javob >= 2, "video kamida 2 kun eski");
      assert.equal(t.post, `${t.d2}-${L.OYLAR[t.oy2]}`);
      assert.equal(t.eski, `${t.d1}-${L.OYLAR[t.oy1]}`);
      assert.ok(t.hisob.includes(`${t.javob} kun`), t.id);
    }
  }
});

test("2-bosqich: ulashish zanjiri — asl manba yagona va boshqalar undan olgan", () => {
  for (const tier of [0, 1, 2]) {
    let shox = 0;
    for (const t of each(L.zanjirTask, 200, tier)) {
      const n = L.ZANJIR_UZUNLIK[tier];
      assert.equal(t.boglar.length, n - 1);
      const olganlar = new Set(t.boglar.map((b) => b.kim));
      assert.equal(olganlar.size, n - 1, "har akkaunt bir marta olgan");
      const hamma = new Set(t.boglar.flatMap((b) => [b.kim, b.kimdan]));
      assert.equal(hamma.size, n);
      const ildiz = [...hamma].filter((a) => !olganlar.has(a));
      assert.deepEqual(ildiz, [t.javob], t.id);
      // Senga yuborgan akkauntdan orqaga yurib, asl manbaga yetiladi
      const kimdan = new Map(t.boglar.map((b) => [b.kim, b.kimdan]));
      let a = t.oxirgi;
      const yol = [a];
      while (kimdan.has(a)) {
        a = kimdan.get(a);
        yol.push(a);
        assert.ok(yol.length <= n, "zanjirda aylana yoʻq");
      }
      assert.equal(a, t.javob);
      assert.deepEqual(t.yol, yol);
      assert.ok(t.variantlar.includes(t.oxirgi));
      if (new Set(t.boglar.map((b) => b.kimdan)).size < n - 1) shox++;
      for (const v of t.variantlar) assert.ok(L.AKKAUNTLAR.includes(v));
    }
    if (tier < 2) assert.equal(shox, 0, "tier 0–1: toʻgʻri zanjir");
    else assert.ok(shox > 0, "tier 2: zanjir shoxlanadi");
  }
});

test("3-bosqich: uch shart — buzilgan satrlar matnidan mustaqil aniqlanadi", () => {
  const nomlar = { ruxsat: "Ruxsat olinmagan", zarar: "Odamga zarar yetkazadi", yorliq: "Yasama ekani yashirilgan" };
  const javoblar = new Set();
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.muammoTask, 200, tier)) {
      const v = t.vaziyat;
      assert.deepEqual(v.qatorlar.map((q) => q.id), ["ruxsat", "zarar", "yorliq"]);
      for (const q of v.qatorlar) assert.equal(q.yomon, BUZILGAN.test(q.matn), q.matn);
      const yomon = v.qatorlar.filter((q) => BUZILGAN.test(q.matn));
      if (tier < 2) {
        assert.ok(yomon.length <= 1);
        if (tier === 0) assert.equal(yomon.length, 1);
        assert.equal(t.javob, yomon.length ? nomlar[yomon[0].id] : "Uch shart ham bajarilgan", t.id);
      } else {
        assert.equal(t.javob, `${yomon.length} ta`, t.id);
      }
      assert.match(v.kirish, /^Oʻquvchi AI yordamida .+ yasadi\.$/);
      javoblar.add(tier + ":" + t.javob);
    }
  }
  assert.equal(javoblar.size, 3 + 4 + 4);
});

test("3-bosqich: toʻgʻri harakat — bitta toʻgʻri, qolganlari shu vaziyatning notoʻgʻri variantlari", () => {
  for (const tier of [0, 1, 2]) {
    const xillar = new Set();
    for (const t of each(L.harakatTask, 200, tier)) {
      const h = L.HARAKAT[t.xil];
      assert.equal(t.javob, h.togri);
      assert.equal(t.variantlar.length, 4);
      const yarim = t.variantlar.filter((v) => h.yarim.includes(v)).length;
      const yomon = t.variantlar.filter((v) => h.yomon.includes(v)).length;
      assert.equal(yarim, L.YARIM_SONI[tier], `${t.id}: yarim toʻgʻri variantlar soni`);
      assert.equal(yomon, 3 - yarim);
      assert.ok(t.vaziyat.length > 20);
      xillar.add(t.xil);
    }
    assert.equal(xillar.size, L.HARAKAT_ID.length);
  }
  // Toʻgʻri harakatlar: tarqatmaslik / pul yubormaslik va kattalarga yoki platformaga xabar berish
  for (const id of L.HARAKAT_ID) {
    const h = L.HARAKAT[id];
    assert.ok(h.yomon.length >= 3 && h.yarim.length >= 2, id);
    assert.ok(!/yuboraman|ulashaman|tashlayman|oʻtkazaman/.test(h.togri), `${id}: toʻgʻri javobda tarqatish yoki pul yuborish yoʻq`);
    assert.match(h.togri, /aytaman|shikoyat/, `${id}: xabar berish bor`);
  }
});

test("3-bosqich: tarqalish — qadamma-qadam modellash bilan mustaqil hisob", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.tarqalishTask, 200, tier)) {
      let olganlar = t.a - t.b; // yuboradiganlar
      let jami = 0;
      let oxirgi = 0;
      for (let q = 1; q <= t.n; q++) {
        olganlar *= t.k;
        jami += olganlar;
        oxirgi = olganlar;
      }
      assert.equal(t.javob, t.xil === "jami" ? jami : oxirgi, t.id);
      assert.equal(t.xil, ["qadam", "jami", "toxtatish"][tier]);
      assert.ok(t.javob >= 2 && t.javob <= 400, `${t.id}: ${t.javob}`);
      assert.ok(t.hisob.includes(String(t.javob)), t.id);
      if (tier === 2) assert.ok(t.b >= 1 && t.b < t.a);
    }
  }
});

test("bosqich navbati: mashq turlari aylanadi", () => {
  const r = rngFrom(9);
  // Oddiy oʻyin: n-toʻgʻri javobda zina 0, 1, 1, 2, 2, 2 (practice.js, kattalar koʻrinishi)
  const ZINA = [0, 1, 1, 2, 2, 2];
  const oqim = (make, soni) => Array.from({ length: soni }, (x, n) => make(null, r, ZINA[n], n).tur);
  assert.deepEqual(oqim(L.bosqich1Task, 4), ["juft", "belgi", "lab", "belgiSoni"]);
  assert.deepEqual(oqim(L.bosqich2Task, 5), ["shubha", "shubha", "zanjir", "sana", "shubhaSoni"]);
  assert.deepEqual(oqim(L.bosqich3Task, 6), ["harakat", "muammo", "tarqalish", "harakat", "muammoSoni", "tarqalish"]);
  // Qiyin rejim: 7 ta javob, zina doim 2 — hamma mashq turi uchraydi
  const qiyin = (make) => new Set(Array.from({ length: 7 }, (x, n) => make(null, r, 2, n).tur));
  assert.deepEqual([...qiyin(L.bosqich1Task)].sort(), ["belgiSoni", "juft", "lab"]);
  assert.deepEqual([...qiyin(L.bosqich2Task)].sort(), ["sana", "shubhaSoni", "zanjir"]);
  assert.deepEqual([...qiyin(L.bosqich3Task)].sort(), ["harakat", "muammoSoni", "tarqalish"]);
});

function jsFayllar() {
  const fayllar = [];
  (function yur(dir) {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      if (f.isDirectory()) yur(path.join(dir, f.name));
      else if (f.name.endsWith(".js")) fayllar.push(path.join(dir, f.name));
    }
  })(path.join(__dirname, "..", "js"));
  return fayllar;
}

test("js fayllarida toʻgʻri apostrof (U+0027) yoʻq; oʻ, gʻ — U+02BB bilan", () => {
  const fayllar = jsFayllar();
  assert.ok(fayllar.length >= 8, "hamma js fayl topildi");
  for (const f of fayllar) {
    const matn = fs.readFileSync(f, "utf8");
    assert.ok(!matn.includes("'"), `${path.basename(f)}: toʻgʻri apostrof bor`);
    assert.ok(!/[OoGg][‘’]/.test(matn), `${path.basename(f)}: oʻ/gʻ U+02BB bilan yozilsin`);
  }
});

test("faqat xabardorlik: yasash vositalari, brendlar va qadam-baqadam yoʻriqnoma yoʻq", () => {
  // Taqiqlangan soʻzlar: dastur va xizmat nomlari, "qanday yasash" yoʻriqnomasi belgilari
  const taqiq = /deepfacelab|faceswap\b|reface|midjourney|stable diffusion|elevenlabs|photoshop|telegram|instagram|tiktok|youtube|facebook|whatsapp|yuklab ol|oʻrnat(?!il)|1-qadam: .*(surat|video) yigʻ/i;
  for (const f of jsFayllar()) {
    const matn = fs.readFileSync(f, "utf8");
    const m = matn.match(taqiq);
    assert.ok(!m, `${path.basename(f)}: «${m && m[0]}»`);
  }
});
