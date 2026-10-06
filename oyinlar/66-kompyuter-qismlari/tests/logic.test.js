// 66-o'yin: kompyuter qismlari — qismlar ro'yxati, mashq generatorlari (tier bilan), tekshirish, maslahat va rasmlar.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const L = require("../js/logic.js");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const art = loadScript(path.join(__dirname, "../js/game-art.js"), {}).QK.gameArt;

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
// make(r, prev, tier, …) dan ketma-ket vazifalar
function each(make, count, tier, seed, ...rest) {
  const r = rngFrom(seed || 66);
  const out = [];
  let prev = null;
  for (let k = 0; k < count; k++) {
    prev = make(r, prev, tier, ...rest);
    out.push(prev);
  }
  return out;
}
const TIERS = [0, 1, 2];
const IDS = L.QISMLAR.map((q) => q.id);
const guruh = (id) => L.qism(id).guruh;
const yon = (id) => L.qism(id).yonalish;
const xil = (list) => new Set(list).size === list.length;
const ketmaKetHarXil = (list) => {
  for (let i = 1; i < list.length; i++) assert.notEqual(list[i].id, list[i - 1].id, `${i}: ${list[i].id}`);
};

// ---------- Qismlar ----------
test("qismlar: 9 ta, har birida id, nom, vazifa (bitta qisqa gap), yo'nalish", () => {
  assert.equal(L.QISMLAR.length, 9);
  assert.ok(xil(IDS));
  assert.ok(xil(L.QISMLAR.map((q) => q.nom)));
  for (const q of L.QISMLAR) {
    assert.ok(q.id && q.nom && q.ish && q.vazifa && q.guruh, q.id);
    assert.match(q.vazifa, /^[^.!?]+\.$/, `${q.id}: vazifa — bitta gap`);
    assert.ok(q.vazifa.startsWith(q.nom + " "), q.id);
    assert.ok(q.vazifa.length <= 60, `${q.id}: vazifa qisqa`);
    assert.ok(["kiritish", "chiqarish", "markaz"].includes(q.yonalish), q.id);
    assert.equal(L.qism(q.id), q);
  }
  assert.deepEqual(IDS.filter((id) => yon(id) === "kiritish"), ["klaviatura", "sichqoncha", "mikrofon", "kamera"]);
  assert.deepEqual(IDS.filter((id) => yon(id) === "chiqarish"), ["monitor", "kolonka", "printer", "quloqchin"]);
  assert.deepEqual(IDS.filter((id) => yon(id) === "markaz"), ["blok"]);
  assert.equal(L.qism("yoq"), null);
  assert.equal(L.kichik("Tizim bloki"), "tizim bloki");
  assert.equal(L.nomlar(["blok", "monitor"]), "tizim bloki, monitor");
  assert.deepEqual(L.tartibda(["kamera", "monitor", "blok"]), ["monitor", "blok", "kamera"]);
});

test("vazifasi bir xil qurilmalar: faqat kolonka va quloqchin bitta guruhda", () => {
  const juftlar = [];
  for (let i = 0; i < IDS.length; i++) {
    for (let j = i + 1; j < IDS.length; j++) if (guruh(IDS[i]) === guruh(IDS[j])) juftlar.push([IDS[i], IDS[j]]);
  }
  assert.deepEqual(juftlar, [["kolonka", "quloqchin"]]);
  // 2-bosqich ko'rsatishi: kiritish va chiqarish qurilmalarining har birida "nima qayoqqa yuradi" gapi bor
  for (const q of L.QISMLAR) assert.equal(!!q.oqim, q.yonalish !== "markaz", q.id);
});

test("variantlar: 4 ta, takrorsiz, javob ichida; birXilYoq va emas qoidalari", () => {
  const r = rngFrom(7);
  for (let k = 0; k < 600; k++) {
    const javob = IDS[k % IDS.length];
    const oddiy = L.variantlar(r, javob);
    assert.equal(oddiy.length, 4);
    assert.ok(xil(oddiy) && oddiy.includes(javob) && oddiy.every((id) => IDS.includes(id)));
    const toza = L.variantlar(r, javob, { birXilYoq: true, emas: ["monitor", "printer"] });
    assert.equal(toza.length, 4);
    assert.ok(xil(toza) && toza.includes(javob));
    assert.ok(xil(toza.map(guruh)), `bir guruhdan ikkitasi: ${toza}`);
    for (const id of toza) if (id !== javob) assert.ok(!["monitor", "printer"].includes(id), String(toza));
  }
  // Qoida yoqilmasa kolonka va quloqchin birga chiqa oladi (nom so'ralganda bu to'g'ri — rasmlari boshqa)
  const birga = Array.from({ length: 300 }, () => L.variantlar(r, "kolonka")).some((v) => v.includes("quloqchin"));
  assert.ok(birga);
});

// ---------- 1- va 2-bosqich: bitta javobli, qurilma variantli savollar ----------
const qurilmali = (tasks, soni) => {
  for (const t of tasks) {
    assert.equal(t.variantlar.length, soni, t.id);
    assert.ok(xil(t.variantlar), `${t.id}: variantlar takrorlanmaydi`);
    assert.ok(t.variantlar.every((id) => IDS.includes(id)), t.id);
    assert.ok(t.variantlar.includes(t.javob), `${t.id}: javob variantlar ichida`);
    assert.ok(t.matn && t.nega && t.maqtov, t.id);
    assert.equal(t.javob, t.qism, t.id);
  }
};

test("nom, rasm, vazifa: 4 variant, javob ichida, ketma-ket takror yo'q, hamma qism so'raladi", () => {
  for (const make of [L.nomTask, L.rasmTask, L.vazifaTask]) {
    const korilgan = new Set();
    for (const tier of TIERS) {
      const list = each(make, 300, tier);
      qurilmali(list, 4);
      ketmaKetHarXil(list);
      for (let i = 1; i < list.length; i++) assert.notEqual(list[i].qism, list[i - 1].qism, "ketma-ket bitta qurilma");
      list.forEach((t) => korilgan.add(t.qism));
    }
    assert.equal(korilgan.size, 9, make.name);
  }
  const t = L.nomTask(rngFrom(1), null);
  assert.equal(t.matn, `Qaysi biri — ${L.kichik(L.qism(t.javob).nom)}?`);
  assert.equal(t.id, "nom:" + t.javob);
});

test("vazifa: savol qurilma ishidan yasaladi; vazifasi bir xil ikki qurilma birga chiqmaydi", () => {
  let kolonkaSoraldi = 0;
  for (const tier of TIERS) {
    for (const t of each(L.vazifaTask, 400, tier, 11 + tier)) {
      assert.equal(t.matn, `Qaysi qurilma ${L.qism(t.javob).ish}?`);
      assert.ok(xil(t.variantlar.map(guruh)), `${t.id}: ${t.variantlar}`);
      assert.ok(!(t.variantlar.includes("kolonka") && t.variantlar.includes("quloqchin")), t.id);
      // "Ovozni yozib oladi" savolida kamera chiqmaydi (u ham ovoz yozadi deb o'ylash mumkin); teskarisi mumkin
      if (t.javob === "mikrofon") assert.ok(!t.variantlar.includes("kamera"), t.id);
      if (t.javob === "kolonka" || t.javob === "quloqchin") kolonkaSoraldi++;
    }
  }
  assert.ok(kolonkaSoraldi > 50, "kolonka va quloqchin ham so'raladi");
});

test("kerak: vaziyat → qurilma; chalkash qurilmalar va bir xil vazifalilar variantga kirmaydi", () => {
  assert.ok(L.VAZIYATLAR.length >= 12);
  for (const v of L.VAZIYATLAR) {
    assert.ok(L.qism(v.qism) && yon(v.qism) !== "markaz", v.matn);
    assert.match(v.matn, /\?$/);
    for (const id of v.emas || []) assert.ok(L.qism(id) && id !== v.qism, v.matn);
  }
  // Har kiritish/chiqarish qurilmasiga kamida bitta vaziyat
  assert.equal(new Set(L.VAZIYATLAR.map((v) => v.qism)).size, 8);
  const korilgan = new Set();
  for (const tier of TIERS) {
    const list = each(L.kerakTask, 400, tier, 21 + tier);
    qurilmali(list, 4);
    ketmaKetHarXil(list);
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      const v = L.VAZIYATLAR[Number(t.id.split(":")[1])];
      assert.equal(t.matn, v.matn);
      assert.equal(t.javob, v.qism);
      assert.ok(xil(t.variantlar.map(guruh)), `${t.id}: ${t.variantlar}`);
      for (const id of v.emas || []) assert.ok(!t.variantlar.includes(id), `${t.id}: ${id} chiqmasligi kerak`);
      if (i) assert.notEqual(t.qism, list[i - 1].qism, "ketma-ket bitta qurilma");
      korilgan.add(t.id);
    }
  }
  assert.equal(korilgan.size, L.VAZIYATLAR.length, "hamma vaziyat chiqadi");
});

test("tanla: 6 qurilma, 2–4 tasi to'g'ri, javob — aynan shu yo'nalishdagilar; yo'nalish navbat bilan", () => {
  const hajm = { 2: 0, 3: 0, 4: 0 };
  for (const tier of TIERS) {
    const list = each(L.tanlaTask, 400, tier, 31 + tier);
    ketmaKetHarXil(list);
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      assert.equal(t.variantlar.length, 6, t.id);
      assert.ok(xil(t.variantlar) && t.variantlar.every((id) => IDS.includes(id)), t.id);
      assert.ok(["kiritish", "chiqarish"].includes(t.yonalish));
      assert.ok(t.javob.length >= 2 && t.javob.length <= 4, `${t.id}: ${t.javob.length} ta`);
      assert.deepEqual(t.javob, L.tartibda(t.variantlar.filter((id) => yon(id) === t.yonalish)), t.id);
      assert.ok(t.matn.startsWith(L.YONALISH[t.yonalish].nom + " "), t.matn);
      if (i) assert.notEqual(t.yonalish, list[i - 1].yonalish, "ketma-ket bitta yo'nalish");
      hajm[t.javob.length]++;
    }
  }
  for (const [n, soni] of Object.entries(hajm)) assert.ok(soni > 100, `${n} ta to'g'ri javobli holat ham chiqadi`);
});

test("ortiqcha: 4 qurilma, aynan bittasi boshqa yo'nalishda, tizim bloki qatnashmaydi", () => {
  for (const tier of TIERS) {
    const list = each(L.ortiqchaTask, 400, tier, 41 + tier);
    qurilmali(list, 4);
    ketmaKetHarXil(list);
    for (const t of list) {
      assert.ok(!t.variantlar.includes("blok"), t.id);
      const boshqa = t.variantlar.filter((id) => yon(id) !== t.yonalish);
      assert.deepEqual(boshqa, [t.javob], t.id);
      assert.equal(yon(t.javob), L.teskari(t.yonalish));
    }
  }
});

// ---------- 3-bosqich ----------
test("tartib to'plamlari: indekslar o'sadi, soni to'g'ri; o'chirishda doim avval saqlash, keyin «Oʻchirish»", () => {
  assert.deepEqual(Object.keys(L.TARTIBLAR), ["ochirish", "yoqish"]);
  assert.deepEqual(L.QADAM_SONI, [3, 4, 5]);
  for (const [kalit, T] of Object.entries(L.TARTIBLAR)) {
    assert.equal(T.qadamlar.length, 6, kalit);
    assert.ok(xil(T.qadamlar.map((q) => q.id)) && xil(T.qadamlar.map((q) => q.matn)), kalit);
    assert.ok(T.matn && T.ishora && T.nega && T.xulosa, kalit);
    for (const soni of L.QADAM_SONI) {
      assert.ok(T.toplam[soni].length >= 3, `${kalit}/${soni}: kamida 3 xil to'plam`);
      assert.ok(xil(T.toplam[soni].map(String)), `${kalit}/${soni}`);
      for (const tanlov of T.toplam[soni]) {
        assert.equal(tanlov.length, soni, `${kalit}: ${tanlov}`);
        for (let i = 0; i < tanlov.length; i++) {
          assert.ok(tanlov[i] >= 0 && tanlov[i] < 6);
          if (i) assert.ok(tanlov[i] > tanlov[i - 1], `${kalit}: ${tanlov} o'sish tartibida emas`);
        }
        const ids = tanlov.map((i) => T.qadamlar[i].id);
        if (kalit === "ochirish") assert.ok(ids[0] === "saqla" && ids.includes("tanla"), String(ids));
        if (kalit === "yoqish") {
          assert.ok(ids.includes("tugma") && ids.includes("yon"), String(ids));
          if (ids.includes("saqla")) assert.ok(ids.includes("chiz"), "chizilmagan rasm saqlanmaydi");
        }
      }
    }
  }
});

test("tartib: tier 0 — 3 qadam, 1 — 4, 2 — 5; kartalar aralash, javob — to'liq tartibning kesimi", () => {
  for (const tier of TIERS) {
    const list = each(L.tartibTask, 400, tier, 51 + tier);
    ketmaKetHarXil(list);
    const ketmalar = new Set();
    for (const t of list) {
      const T = L.TARTIBLAR[t.ketma];
      ketmalar.add(t.ketma);
      assert.equal(t.qadamlar.length, L.QADAM_SONI[tier], t.id);
      assert.equal(t.javob.length, L.QADAM_SONI[tier], t.id);
      const kartalar = t.qadamlar.map((q) => q.id);
      assert.ok(xil(kartalar), t.id);
      assert.deepEqual(kartalar.slice().sort(), t.javob.slice().sort(), "javob — kartalarning o'rin almashtirishi");
      assert.notDeepEqual(kartalar, t.javob, `${t.id}: kartalar tayyor tartibda turmaydi`);
      const tolik = T.qadamlar.map((q) => q.id);
      const orinlar = t.javob.map((id) => tolik.indexOf(id));
      assert.ok(orinlar.every((x, i) => x >= 0 && (i === 0 || x > orinlar[i - 1])), `${t.id}: ${orinlar}`);
      for (const q of t.qadamlar) assert.equal(q.matn, T.qadamlar[tolik.indexOf(q.id)].matn);
      assert.equal(t.matn, T.matn);
      assert.ok(L.tekshir(t, t.javob));
      assert.ok(!L.tekshir(t, kartalar));
    }
    assert.equal(ketmalar.size, 2, "yoqish ham, o'chirish ham chiqadi");
  }
  // Ketma-ketlik berilsa — aynan o'sha; chegaradan tashqari tier qisiladi
  for (const t of each(L.tartibTask, 50, 1, 5, "yoqish")) assert.equal(t.ketma, "yoqish");
  assert.equal(L.tartibTask(rngFrom(2), null, 9).qadamlar.length, 5);
  assert.equal(L.tartibTask(rngFrom(2), null, undefined).qadamlar.length, 3);
});

test("zarar: tier 0 va 1 — 4 variantdan bittasi zararli; tier 2 — 5 tadan 2–3 tasi (hammasini belgila)", () => {
  const zararli = new Set(L.ZARARLI.map((z) => z.id));
  assert.equal(L.ZARARLI.filter((z) => z.asos).length, 4);
  assert.ok(L.ZARARLI.length >= 6 && L.BEZARAR.length >= 6);
  assert.ok(xil(L.ZARARLI.concat(L.BEZARAR).map((x) => x.id)) && xil(L.ZARARLI.concat(L.BEZARAR).map((x) => x.matn)));
  for (const z of L.ZARARLI) assert.match(z.nega, /^[^.!?]+\.$/, `${z.id}: sabab — bitta gap`);

  for (const tier of [0, 1]) {
    const list = each(L.zararTask, 400, tier, 61 + tier);
    ketmaKetHarXil(list);
    const soralgan = new Set();
    for (const t of list) {
      assert.equal(t.kop, false);
      assert.equal(t.variantlar.length, 4, t.id);
      assert.ok(xil(t.variantlar.map((v) => v.id)) && xil(t.variantlar.map((v) => v.matn)), t.id);
      assert.deepEqual(t.variantlar.filter((v) => zararli.has(v.id)).map((v) => v.id), [t.javob], t.id);
      const z = L.ZARARLI.find((x) => x.id === t.javob);
      assert.equal(z.asos, tier === 0, `tier ${tier}: ${z.id}`);
      assert.equal(t.nega, z.nega);
      assert.ok(L.tekshir(t, t.javob));
      soralgan.add(t.javob);
    }
    assert.equal(soralgan.size, L.ZARARLI.filter((z) => z.asos === (tier === 0)).length, `tier ${tier}: hammasi so'raladi`);
  }

  const hajm = { 2: 0, 3: 0 };
  const list = each(L.zararTask, 400, 2, 63);
  ketmaKetHarXil(list);
  for (const t of list) {
    assert.equal(t.kop, true);
    assert.equal(t.variantlar.length, 5, t.id);
    assert.ok(xil(t.variantlar.map((v) => v.id)), t.id);
    assert.ok(t.javob.length === 2 || t.javob.length === 3, t.id);
    assert.deepEqual(t.javob.slice().sort(), t.variantlar.filter((v) => zararli.has(v.id)).map((v) => v.id).sort(), t.id);
    assert.match(t.matn, /hammasini belgila/);
    hajm[t.javob.length]++;
  }
  assert.ok(hajm[2] > 100 && hajm[3] > 100, "2 ta ham, 3 ta ham zararli holat chiqadi");
});

// ---------- Tekshirish va maslahat ----------
test("tekshir: bitta javob, to'plam (aynan teng) va tartib (aynan shu tartib)", () => {
  const bitta = L.nomTask(rngFrom(3), null);
  assert.ok(L.tekshir(bitta, bitta.javob));
  for (const id of bitta.variantlar) if (id !== bitta.javob) assert.ok(!L.tekshir(bitta, id));
  assert.ok(!L.tekshir(bitta, [bitta.javob]));

  for (const t of each(L.tanlaTask, 100, 1, 9).concat(each(L.zararTask, 100, 2, 9))) {
    const hammasi = t.variantlar.map((v) => (typeof v === "string" ? v : v.id));
    assert.ok(L.tekshir(t, t.javob));
    assert.ok(L.tekshir(t, t.javob.slice().reverse()), "to'plamda tartib ahamiyatsiz");
    assert.ok(!L.tekshir(t, t.javob.slice(1)), "bittasi yetishmaydi");
    const ortiqcha = hammasi.find((id) => !t.javob.includes(id));
    assert.ok(!L.tekshir(t, t.javob.concat(ortiqcha)), "bittasi ortiqcha");
    assert.ok(!L.tekshir(t, t.javob.slice(1).concat(ortiqcha)), "bittasi almashgan");
    assert.ok(!L.tekshir(t, t.javob.slice(1).concat(t.javob[1])), "takror bilan to'ldirilgan");
    assert.ok(!L.tekshir(t, hammasi) && !L.tekshir(t, []) && !L.tekshir(t, t.javob[0]) && !L.tekshir(t, undefined));
  }

  const tartib = L.tartibTask(rngFrom(4), null, 2);
  assert.ok(L.tekshir(tartib, tartib.javob.slice()));
  assert.ok(!L.tekshir(tartib, tartib.javob.slice().reverse()));
  assert.ok(!L.tekshir(tartib, tartib.javob.slice(0, 4)));
  assert.equal(L.orinda(tartib, tartib.javob), 5);
  assert.equal(L.orinda(tartib, tartib.javob.slice().reverse()), 1, "5 qadam teskari — faqat o'rtadagisi o'rnida");
  assert.equal(L.orinda(tartib, []), 0);
  assert.equal(L.orinda(tartib, undefined), 0);
});

test("maslahat javobni aytmaydi: to'g'ri qurilma nomi, zararli ish yoki tayyor tartib yozilmaydi", () => {
  const r = rngFrom(13);
  for (const make of [L.nomTask, L.rasmTask, L.vazifaTask, L.kerakTask, L.ortiqchaTask]) {
    for (const t of each(make, 200, 1, 71)) {
      const javob = L.qism(t.javob);
      for (const tanlangan of t.variantlar.filter((id) => id !== t.javob)) {
        const m = L.ishora(t, tanlangan);
        assert.ok(m.length > 10, t.id);
        assert.ok(!m.includes(javob.nom) && !m.includes(L.kichik(javob.nom)), `${t.id}: «${m}»`);
        assert.ok(!m.includes(javob.ish), `${t.id}: «${m}»`);
        if (t.tur !== "ortiqcha") assert.ok(m.includes(L.qism(tanlangan).ish), "tanlangan qurilma vazifasi aytiladi");
      }
    }
  }
  for (const t of each(L.tanlaTask, 200, 1, 72)) {
    const m = L.ishora(t, t.variantlar.slice(0, 2));
    for (const id of t.variantlar) assert.ok(!m.includes(L.qism(id).nom) && !m.includes(L.kichik(L.qism(id).nom)), m);
    assert.ok(m.includes(`${t.javob.length} ta`), m);
  }
  for (const tier of TIERS) {
    for (const t of each(L.zararTask, 200, tier, 73)) {
      const m = L.ishora(t, t.kop ? [] : t.variantlar.find((v) => v.id !== t.javob).id);
      for (const v of t.variantlar) assert.ok(!m.includes(v.matn), m);
      assert.ok(m.includes(L.EHTIYOT), m);
    }
    for (const t of each(L.tartibTask, 200, tier, 74)) {
      const urinish = L.aralash(t.javob, r);
      const m = L.ishora(t, urinish);
      for (const q of t.qadamlar) assert.ok(!m.includes(q.matn), m);
      const k = L.orinda(t, urinish);
      assert.ok(k ? m.startsWith(`${k} ta qadam`) : m.startsWith("Hech bir qadam"), m);
      assert.ok(m.endsWith(t.ishora), m);
    }
  }
  assert.equal(L.ishora({ tur: "boshqa" }, 1), "");
});

// ---------- Bosqich navbatlari ----------
// practice.js dagi kabi: 4 / 5 / 6 ta javob, tier 0, 0, 1, 1, 2, 2; qiyin rejimda 7 ta javob va doim tier 2
const zina = (togri) => (togri < 2 ? 0 : togri < 4 ? 1 : 2);
const turlar = (make, soni, qiyin) => {
  const r = rngFrom(81);
  let prev = null;
  return Array.from({ length: soni }, (_, n) => {
    prev = make(r, prev, n, qiyin ? 2 : zina(n));
    return prev;
  });
};

test("1-bosqich navbati: nom, nom, rasm, vazifa; qiyin rejimda vazifa va rasm almashadi", () => {
  assert.deepEqual(turlar(L.bosqich1Task, 4).map((t) => t.tur), ["nom", "nom", "rasm", "vazifa"]);
  assert.deepEqual(turlar(L.bosqich1Task, 7, true).map((t) => t.tur), ["vazifa", "rasm", "vazifa", "rasm", "vazifa", "rasm", "vazifa"]);
});

test("2-bosqich navbati: kerak, kerak, tanla, tanla, ortiqcha; qiyin rejimda uchala tur", () => {
  const oddiy = turlar(L.bosqich2Task, 5);
  assert.deepEqual(oddiy.map((t) => t.tur), ["kerak", "kerak", "tanla", "tanla", "ortiqcha"]);
  assert.notEqual(oddiy[2].yonalish, oddiy[3].yonalish, "kiritish ham, chiqarish ham so'raladi");
  assert.deepEqual(turlar(L.bosqich2Task, 7, true).map((t) => t.tur), ["ortiqcha", "tanla", "ortiqcha", "kerak", "ortiqcha", "tanla", "ortiqcha"]);
});

test("3-bosqich navbati: tartib va zarar almashadi; qadamlar 3 → 4 → 5; oxirgi zarar — ko'p tanlovli", () => {
  const oddiy = turlar(L.bosqich3Task, 6);
  assert.deepEqual(oddiy.map((t) => t.tur), ["tartib", "zarar", "tartib", "zarar", "tartib", "zarar"]);
  assert.deepEqual([0, 2, 4].map((n) => oddiy[n].qadamlar.length), [3, 4, 5]);
  assert.deepEqual([0, 2, 4].map((n) => oddiy[n].ketma), ["ochirish", "yoqish", "ochirish"]);
  assert.deepEqual([1, 3, 5].map((n) => oddiy[n].kop), [false, false, true]);
  const qiyin = turlar(L.bosqich3Task, 7, true);
  assert.deepEqual(qiyin.map((t) => t.tur), ["tartib", "zarar", "tartib", "zarar", "tartib", "zarar", "tartib"]);
  for (const t of qiyin) assert.ok(t.tur === "tartib" ? t.qadamlar.length === 5 : t.kop === true, t.id);
  assert.deepEqual([0, 2, 4, 6].map((n) => qiyin[n].ketma), ["ochirish", "yoqish", "ochirish", "yoqish"]);
});

test("bosqich o'yini: xato bilan ham ketma-ket bir xil vazifa chiqmaydi, har vazifaning javobi tekshiruvdan o'tadi", () => {
  const r = rngFrom(91);
  const bosqichlar = [[L.bosqich1Task, 4], [L.bosqich2Task, 5], [L.bosqich3Task, 6]];
  for (let oyin = 0; oyin < 150; oyin++) {
    for (const qiyin of [false, true]) {
      for (const [make, kerak] of bosqichlar) {
        let prev = null;
        let togri = 0;
        const jami = qiyin ? 7 : kerak;
        while (togri < jami) {
          const t = make(r, prev, togri, qiyin ? 2 : zina(togri));
          if (prev) assert.notEqual(t.id, prev.id, `${prev.id} ikki marta ketma-ket`);
          assert.ok(t.id && t.tur && t.matn && t.maqtov && t.nega, t.id);
          assert.ok(t.javob !== undefined && L.tekshir(t, t.javob), t.id);
          const variantlar = (t.variantlar || t.qadamlar).map((v) => (typeof v === "string" ? v : v.id));
          assert.ok(variantlar.length >= (t.tur === "tartib" ? 3 : 4), `${t.id}: kamida 4 variant`);
          assert.ok(xil(variantlar), t.id);
          for (const id of [].concat(t.javob)) assert.ok(variantlar.includes(id), `${t.id}: javob variantlar ichida`);
          prev = t;
          if (r() < 0.7) togri++; // 30% — bola adashdi: o'sha o'rinda yangi misol
        }
      }
    }
  }
});

// ---------- Matn ----------
// Vazifalardagi va ro'yxatlardagi hamma yozuvlar
function yozuvlar(x, out) {
  if (typeof x === "string") out.push(x);
  else if (Array.isArray(x)) x.forEach((y) => yozuvlar(y, out));
  else if (x && typeof x === "object") Object.values(x).forEach((y) => yozuvlar(y, out));
  return out;
}

test("matn: oʻ/gʻ to'g'ri belgi bilan, «Xato» so'zi yo'q, maqtov — bitta gap", () => {
  const hammasi = yozuvlar([L.QISMLAR, L.YONALISH, L.VAZIYATLAR, L.TARTIBLAR, L.ZARARLI, L.BEZARAR, L.EHTIYOT], []);
  const r = rngFrom(17);
  const generatorlar = [L.nomTask, L.rasmTask, L.vazifaTask, L.kerakTask, L.tanlaTask, L.ortiqchaTask, L.tartibTask, L.zararTask];
  for (const make of generatorlar) {
    for (const tier of TIERS) {
      for (const t of each(make, 60, tier, 5)) {
        yozuvlar([t.matn, t.nega, t.maqtov, t.ishora, t.variantlar, t.qadamlar], hammasi);
        const birinchi = (t.variantlar || t.qadamlar)[0];
        hammasi.push(L.ishora(t, t.tur === "tartib" ? L.aralash(t.javob, r) : typeof birinchi === "string" ? birinchi : birinchi.id));
        assert.match(t.maqtov, /^[^.!?]+[.!]$/, `${t.id}: maqtov bitta gap — «${t.maqtov}»`);
        assert.ok(t.matn.length <= 100, `${t.id}: savol qisqa`);
      }
    }
  }
  for (const s of hammasi) {
    assert.ok(!/['`‘’ʹ´]/.test(s), `notoʻgʻri apostrof: «${s}»`);
    assert.ok(!/xato/i.test(s), `«Xato» soʻzi: «${s}»`);
    assert.ok(!/[oOgG]ʼ/.test(s), `oʻ/gʻ tutuq belgisi bilan yozilgan: «${s}»`);
    assert.ok(!/undefined|null|NaN|\[object/.test(s), `buzuq yozuv: «${s}»`);
  }
  // Sahna fayllari: satrlarda oddiy apostrof va «Xato» bo'lmasin (izohlar hisobga olinmaydi)
  const papka = path.join(__dirname, "../js");
  const fayllar = ["main.js", "logic.js", "game-art.js"].concat(fs.readdirSync(path.join(papka, "scenes")).map((f) => "scenes/" + f));
  assert.equal(fayllar.length, 8);
  for (const f of fayllar) {
    const kod = fs.readFileSync(path.join(papka, f), "utf8").replace(/\/\/.*$/gm, "");
    assert.ok(!/['‘’]/.test(kod), `${f}: satrda oddiy apostrof bor`);
    assert.ok(!/xato/i.test(kod), `${f}: «Xato» soʻzi`);
  }
});

// ---------- Rasmlar ----------
test("rasmlar: har qismga alohida matnsiz SVG; noma'lum nom — bo'sh satr", () => {
  assert.deepEqual(art.IDS.slice().sort(), IDS.slice().sort());
  const korilgan = new Set();
  for (const id of IDS) {
    const svg = art.qism(id);
    assert.match(svg, /^<svg viewBox="0 0 \d+ \d+"/, id);
    assert.ok(svg.trim().endsWith("</svg>"), id);
    assert.ok(!/<text|<tspan|<title/.test(svg), `${id}: rasm ichida matn bo'lmaydi`);
    assert.ok(!korilgan.has(svg), `${id}: rasm boshqasidan farq qiladi`);
    korilgan.add(svg);
  }
  assert.equal(art.qism("yoq"), "");
  for (const svg of [art.stol(), art.rasmcha(), art.toplam()]) {
    assert.ok(svg.trim().startsWith("<svg") && svg.trim().endsWith("</svg>"));
    assert.ok(!/<text|<tspan/.test(svg));
    assert.ok(!/undefined|NaN/.test(svg));
  }
});

test("stol: har qism o'z joyida, eng tor ekranda ham ≥ 48×48 px, ustma-ust tushmaydi", () => {
  const [W, H] = art.STOL;
  const ENI = 360 - 2 * 16 - 2 * 2; // 360 px ekran − ish zonasi chetlari − rasm hoshiyasi
  const olchov = ENI / W;
  assert.deepEqual(Object.keys(art.JOY).sort(), IDS.slice().sort());
  for (const id of IDS) {
    const [x, y, w, h] = art.JOY[id];
    assert.ok(x >= 0 && y >= 0 && x + w <= W && y + h <= H, `${id}: rasm ichida`);
    assert.ok(w * olchov >= 48 && h * olchov >= 48, `${id}: ${(w * olchov).toFixed(1)}×${(h * olchov).toFixed(1)} px`);
    // Tugma nisbati rasm nisbatiga teng — rasm tugmani to'ldiradi
    const vb = art.qism(id).match(/viewBox="0 0 (\d+) (\d+)"/).slice(1).map(Number);
    assert.ok(Math.abs(w / h - vb[0] / vb[1]) < 0.03, `${id}: nisbat ${(w / h).toFixed(3)} ≠ ${(vb[0] / vb[1]).toFixed(3)}`);
  }
  // Faqat kamera monitor ustida turadi (ozgina ustma-ust) — qolganlari bir-biriga tegmaydi
  for (let i = 0; i < IDS.length; i++) {
    for (let j = i + 1; j < IDS.length; j++) {
      const [a, b] = [art.JOY[IDS[i]], art.JOY[IDS[j]]];
      const tegadi = a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
      const juft = [IDS[i], IDS[j]].sort().join("+");
      assert.equal(tegadi, juft === "kamera+monitor", juft);
    }
  }
  // CSS dagi nisbat (padding-top) STOL bilan bir xil
  const css = fs.readFileSync(path.join(__dirname, "../css/style.css"), "utf8");
  assert.ok(css.includes(`padding-top: ${(H / W) * 100}%`), "style.css: .kq-stol nisbati");
});

test("rang: rasm va uslublarda qizil yo'q (QOIDALAR 4.4)", () => {
  const manba = fs.readFileSync(path.join(__dirname, "../js/game-art.js"), "utf8") + fs.readFileSync(path.join(__dirname, "../css/style.css"), "utf8");
  const ranglar = [...new Set(manba.match(/#[0-9A-Fa-f]{6}\b/g))];
  assert.ok(ranglar.length >= 10);
  for (const rang of ranglar) {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(rang.slice(i, i + 2), 16) / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max === min) continue; // kulrang
    const d = max - min;
    const toyinish = d / (1 - Math.abs(max + min - 1));
    let tus = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    tus = (tus * 60 + 360) % 360;
    assert.ok(!((tus < 15 || tus > 335) && toyinish > 0.4), `${rang} — qizil (tus ${tus.toFixed(0)}°)`);
  }
});

test("index.html: toifa, fon rangi, skriptlar tartibi va fayllar mavjudligi", () => {
  const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
  assert.ok(html.includes('<html lang="uz" data-toifa="boshlangich">'));
  assert.ok(html.includes('<meta name="theme-color" content="#FFF6E5">'));
  const skriptlar = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
  // <head> dagi toifa.js (ko'rinish tanlovi) — bosh/tools/toifa-yoz.js qo'yadi
  assert.deepEqual(skriptlar, [
    "../umumiy/js/toifa.js",
    "js/logic.js", "../umumiy/js/storage.js", "../umumiy/js/sound.js", "../umumiy/js/art.js", "js/game-art.js",
    "../umumiy/js/ui.js", "../umumiy/js/app.js", "../umumiy/js/practice.js",
    "js/scenes/common.js", "js/scenes/stage1.js", "js/scenes/stage2.js", "js/scenes/stage3.js", "js/scenes/final.js",
    "../umumiy/js/offline.js", "js/main.js",
  ]);
  const manzillar = skriptlar.concat([...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map((m) => m[1]));
  for (const m of manzillar) assert.ok(fs.existsSync(path.join(__dirname, "..", m)), m);
  const main = fs.readFileSync(path.join(__dirname, "../js/main.js"), "utf8");
  assert.ok(main.includes('title: "Kompyuter qismlari"'));
  assert.ok(main.includes('storageKey: "kompyuter-qismlari:v1"'));
  assert.ok(main.includes('stageTitles: ["Qismlar va nomlari", "Kiritish va chiqarish", "Yoqish va ehtiyot qilish"]'));
});
