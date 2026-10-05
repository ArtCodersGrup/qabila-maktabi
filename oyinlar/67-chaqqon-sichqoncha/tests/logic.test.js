// 67-o'yin: chaqqon sichqoncha — joylash, terish, sandiq va sudrash vazifalari, ikki marta bosish, savat ustidami.
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
  const r = rngFrom(seed || 67);
  const out = [];
  let prev = null;
  for (let k = 0; k < count; k++) {
    prev = make(r, prev, tier);
    out.push(prev);
  }
  return out;
}

// Doiralar: juft-juft ustma-ust tushmaydi va sohadan chiqmaydi
function joyiToza(doiralar, soha, izoh) {
  for (let i = 0; i < doiralar.length; i++) {
    assert.ok(L.sohada(doiralar[i], soha), `${izoh}: ${JSON.stringify(doiralar[i])} chetdan chiqdi`);
    for (let j = i + 1; j < doiralar.length; j++) {
      assert.ok(!L.ustmaUst(doiralar[i], doiralar[j]), `${izoh}: ${i} va ${j} ustma-ust`);
    }
  }
}

test("masofa: bo'y bo'yicha 4:3 nisbat hisobga olinadi", () => {
  assert.equal(L.NISBAT, 4 / 3);
  assert.ok(Math.abs(L.masofa({ x: 0, y: 0 }, { x: 0.3, y: 0 }) - 0.3) < 1e-12);
  // bo'yning 0.4 ulushi = enning 0.3 ulushi
  assert.ok(Math.abs(L.masofa({ x: 0, y: 0 }, { x: 0, y: 0.4 }) - 0.3) < 1e-12);
  assert.ok(L.ustmaUst({ x: 0.5, y: 0.5, r: 0.1 }, { x: 0.5, y: 0.7, r: 0.1 }), "bo'yda 0.2 = enda 0.15 < 0.2");
  assert.ok(!L.ustmaUst({ x: 0.5, y: 0.5, r: 0.1 }, { x: 0.71, y: 0.5, r: 0.1 }));
  assert.ok(L.sohada({ x: 0.1, y: 0.5, r: 0.1 }));
  assert.ok(!L.sohada({ x: 0.09, y: 0.5, r: 0.1 }), "chapdan chiqdi");
  assert.ok(!L.sohada({ x: 0.5, y: 0.12, r: 0.1 }), "tepadan chiqdi: radius bo'yda 0.133");
  assert.ok(L.sohada({ x: 0.5, y: 0.14, r: 0.1 }));
});

test("joylash: tasodifiy o'lcham va sonlarda ustma-ust tushmaydi, chetdan chiqmaydi", () => {
  const r = rngFrom(1);
  for (let k = 0; k < 400; k++) {
    const soni = 1 + Math.floor(r() * 10);
    const rad = [0.055, 0.07, 0.09, 0.11][k % 4];
    const joylar = L.joyla(r, Array(soni).fill(rad));
    assert.equal(joylar.length, soni);
    joyiToza(joylar, null, `k=${k}`);
    for (const j of joylar) assert.equal(j.r, rad);
  }
});

test("joylash: tor sohada ham ichida qoladi", () => {
  const r = rngFrom(2);
  const soha = { x0: 0.2, x1: 0.9, y0: 0.1, y1: 0.6 };
  for (let k = 0; k < 200; k++) joyiToza(L.joyla(r, [0.06, 0.06, 0.06, 0.06], soha), soha, `k=${k}`);
});

test("joylash: zich holatda panjaraga o'tadi, sig'masa — xato (cheksiz sikl yo'q)", () => {
  const r = rngFrom(3);
  // 12 ta r=0.1 doira: tasodifiy joylash deyarli o'xshamaydi, panjara (4 × 3) sig'diradi
  for (let k = 0; k < 20; k++) joyiToza(L.joyla(r, Array(12).fill(0.1)), null, `zich ${k}`);
  const panjara = L.panjaraJoy(r, Array(12).fill(0.1));
  assert.equal(panjara.length, 12);
  joyiToza(panjara, null, "panjara");
  assert.equal(L.panjaraJoy(r, Array(13).fill(0.1)), null, "13-chisi sig'maydi");
  assert.equal(L.tasodifiyJoy(r, [0.6]), null, "maydondan katta doira");
  assert.throws(() => L.joyla(r, Array(50).fill(0.2)), /sigʻmadi/);
  // O'yindagi har sozlama panjaraga ham sig'adi — demak joyla() hech qachon xato bermaydi
  for (const c of L.TER) joyiToza(L.panjaraJoy(r, Array(c.nishon + c.chalgituvchi).fill(c.r)), null, "ter panjara");
  for (const c of L.SANDIQ) joyiToza(L.panjaraJoy(r, Array(c.soni).fill(c.r)), null, "sandiq panjara");
  for (const c of L.SUDRA) joyiToza(L.panjaraJoy(r, Array(c.narsa).fill(c.r), L.NARSA_SOHA), L.NARSA_SOHA, "sudra panjara");
});

test("terish: sonlar va o'lcham dizayndagidek, ustma-ust tushmaydi, javob — nishonlar", () => {
  const kutilgan = [[3, 2, 0.09], [4, 4, 0.07], [5, 5, 0.055]];
  for (const tier of [0, 1, 2]) {
    const [nishon, chalgituvchi, rad] = kutilgan[tier];
    for (const t of each(L.terTask, 300, tier, 10 + tier)) {
      assert.equal(t.tur, "ter");
      assert.equal(t.tier, tier);
      assert.equal(t.narsalar.length, nishon + chalgituvchi, t.id);
      assert.equal(t.javob.length, nishon, t.id);
      joyiToza(t.narsalar, null, t.id);
      assert.equal(new Set(t.narsalar.map((n) => n.id)).size, t.narsalar.length, "id lar takrorlanmaydi");
      for (const n of t.narsalar) {
        assert.equal(n.r, rad);
        assert.equal(n.nishon, n.tur === t.nishon);
        assert.equal(t.javob.includes(n.id), n.nishon);
        assert.ok(L.TERILADIGAN.includes(n.tur));
      }
      // Chalg'ituvchilar — qolgan ikki turning ikkalasidan ham
      const boshqa = new Set(t.narsalar.filter((n) => !n.nishon).map((n) => n.tur));
      assert.equal(boshqa.size, 2, t.id);
      assert.ok(t.matn.includes(L.TUR[t.nishon].kop), t.matn);
    }
  }
});

test("terish: ketma-ket vazifada nishon turi almashadi", () => {
  const list = each(L.terTask, 200, 1);
  for (let i = 1; i < list.length; i++) assert.notEqual(list[i].nishon, list[i - 1].nishon);
  const turlar = new Set(list.map((t) => t.nishon));
  assert.deepEqual([...turlar].sort(), L.TERILADIGAN.slice().sort(), "uch tur ham nishon bo'ladi");
});

test("ikki marta bosish: aynan shu narsaga 450 ms ichida", () => {
  assert.equal(L.IKKI_MS, 450);
  assert.equal(L.ikkiBosish(null, "s0", 1000), false, "birinchi bosish");
  assert.equal(L.ikkiBosish({ id: "s0", vaqt: 1000 }, "s0", 1200), true);
  assert.equal(L.ikkiBosish({ id: "s0", vaqt: 1000 }, "s0", 1450), true, "chegara ham kiradi");
  assert.equal(L.ikkiBosish({ id: "s0", vaqt: 1000 }, "s0", 1451), false, "kech");
  assert.equal(L.ikkiBosish({ id: "s0", vaqt: 1000 }, "s1", 1100), false, "boshqa sandiq");
  assert.equal(L.ikkiBosish({ id: "s0", vaqt: 1000 }, "s0", 900), false, "vaqt orqaga ketmaydi");
  assert.equal(L.sekinBosish({ id: "s0", vaqt: 1000 }, "s0", 1451), true);
  assert.equal(L.sekinBosish({ id: "s0", vaqt: 1000 }, "s0", 2500), true);
  assert.equal(L.sekinBosish({ id: "s0", vaqt: 1000 }, "s0", 2501), false, "bu endi alohida bosish");
  assert.equal(L.sekinBosish({ id: "s0", vaqt: 1000 }, "s0", 1200), false, "tez — bu ikki marta bosish");
  assert.equal(L.sekinBosish({ id: "s0", vaqt: 1000 }, "s1", 1600), false);
  assert.equal(L.sekinBosish(null, "s0", 1600), false);
});

test("sandiqlar: nishon mavjud, ranglar takrorlanmaydi, menyu ishlari soni dizayndagidek", () => {
  const kutilgan = [[3, 3], [3, 3], [4, 4]];
  const rangIds = L.RANGLAR.map((x) => x.id);
  const amalIds = L.AMALLAR.map((x) => x.id);
  for (const make of [L.ikkiTask, L.ongTask]) {
    for (const tier of [0, 1, 2]) {
      const [soni, amal] = kutilgan[tier];
      for (const t of each(make, 200, tier, 20 + tier)) {
        assert.equal(t.sandiqlar.length, soni, t.id);
        assert.equal(new Set(t.sandiqlar.map((s) => s.rang)).size, soni, "ranglar takrorlanmaydi: " + t.id);
        assert.equal(new Set(t.sandiqlar.map((s) => s.id)).size, soni);
        for (const s of t.sandiqlar) assert.ok(rangIds.includes(s.rang));
        joyiToza(t.sandiqlar, null, t.id);
        const nishon = t.sandiqlar.find((s) => s.id === t.nishon);
        assert.ok(nishon, "nishon sandiq maydonda bor: " + t.id);
        assert.equal(nishon.rang, t.rang);
        assert.deepEqual(t.javob, { id: t.nishon, amal: t.amal });
        assert.equal(t.amallar.length, amal, t.id);
        assert.equal(new Set(t.amallar).size, amal);
        for (const a of t.amallar) assert.ok(amalIds.includes(a));
        assert.deepEqual(t.amallar, amalIds.filter((a) => t.amallar.includes(a)), "menyu tartibi o'zgarmaydi");
        assert.ok(!t.amallar.includes(L.OCH), "ochish menyuda yo'q");
        assert.ok(t.matn.startsWith(L.rangById(t.rang).nom + " sandiq"), t.matn);
        if (t.tur === "ikki") {
          assert.equal(t.amal, L.OCH);
          assert.match(t.matn, /ikki marta tez bos/);
        } else {
          assert.ok(t.amallar.includes(t.amal), "so'ralgan ish menyuda bor: " + t.id);
          assert.ok(t.matn.includes(`«${L.amalById(t.amal).nom}»ni tanla`), t.matn);
          assert.match(t.matn, /oʻng tugmani bos/);
        }
      }
    }
  }
});

test("sandiqlar: ketma-ket vazifada nishon rangi almashadi, hamma rang va ish uchraydi", () => {
  const list = each(L.ongTask, 300, 2);
  for (let i = 1; i < list.length; i++) assert.notEqual(list[i].rang, list[i - 1].rang);
  assert.equal(new Set(list.map((t) => t.rang)).size, 4);
  assert.equal(new Set(list.map((t) => t.amal)).size, 4);
});

test("sandiq javobi: to'g'ri ish va xato turi (maslahat uchun)", () => {
  const ikki = L.ikkiTask(rngFrom(5), null, 0);
  const boshqa = ikki.sandiqlar.find((s) => s.id !== ikki.nishon).id;
  assert.equal(L.togriAmal(ikki, { id: ikki.nishon, amal: L.OCH }), true);
  assert.equal(L.togriAmal(ikki, { id: boshqa, amal: L.OCH }), false);
  assert.equal(L.togriAmal(ikki, null), false);
  assert.equal(L.xatoTuri(ikki, { id: ikki.nishon, amal: L.OCH }), null);
  assert.equal(L.xatoTuri(ikki, { id: boshqa, amal: L.OCH }), "sandiq");
  assert.equal(L.xatoTuri(ikki, { id: ikki.nishon, amal: ikki.amallar[0] }), "tugma", "ochish o'rniga menyu");

  const ong = L.ongTask(rngFrom(6), null, 1);
  const boshqaSandiq = ong.sandiqlar.find((s) => s.id !== ong.nishon).id;
  const boshqaAmal = ong.amallar.find((a) => a !== ong.amal);
  assert.equal(L.togriAmal(ong, { id: ong.nishon, amal: ong.amal }), true);
  assert.equal(L.xatoTuri(ong, { id: ong.nishon, amal: L.OCH }), "tugma", "menyu o'rniga ikki marta bosish");
  assert.equal(L.xatoTuri(ong, { id: boshqaSandiq, amal: ong.amal }), "sandiq");
  assert.equal(L.xatoTuri(ong, { id: boshqaSandiq, amal: boshqaAmal }), "sandiq");
  assert.equal(L.xatoTuri(ong, { id: ong.nishon, amal: boshqaAmal }), "amal");
});

test("menyu joyi: sandiq yonida va doim maydon ichida", () => {
  const maydon = { w: 640, h: 480 };
  const menyu = { w: 150, h: 210 };
  const ongda = L.menyuJoyi({ x: 100, y: 240, r: 60 }, maydon, menyu);
  assert.deepEqual(ongda, { left: 136, top: 135 });
  const chapda = L.menyuJoyi({ x: 560, y: 240, r: 60 }, maydon, menyu);
  assert.equal(chapda.left, 560 - 36 - 150, "o'ngga sig'masa — chap tomonida");
  const r = rngFrom(7);
  for (let k = 0; k < 300; k++) {
    const m = { w: 328 + r() * 312, h: 0 };
    m.h = m.w * 0.75;
    const s = { x: r() * m.w, y: r() * m.h, r: 0.1 * m.w };
    const j = L.menyuJoyi(s, m, menyu);
    assert.ok(j.left >= 4 && j.left + menyu.w <= m.w - 4 + 1e-9, `chap-o'ng: ${JSON.stringify(j)}`);
    assert.ok(j.top >= 4 && j.top + menyu.h <= m.h - 4 + 1e-9, `tepa-past: ${JSON.stringify(j)}`);
  }
  // Menyu maydondan katta bo'lsa ham manfiy joy chiqmaydi
  assert.deepEqual(L.menyuJoyi({ x: 50, y: 50, r: 20 }, { w: 100, h: 100 }, { w: 200, h: 200 }), { left: 4, top: 4 });
});

test("sudrash: sonlar dizayndagidek, har narsaning savati bor", () => {
  const kutilgan = [[3, 2, 0.075], [4, 3, 0.07], [6, 3, 0.06]];
  for (const tier of [0, 1, 2]) {
    const [narsa, savat, rad] = kutilgan[tier];
    for (const t of each(L.sudraTask, 300, tier, 30 + tier)) {
      assert.equal(t.tur, "sudra");
      assert.equal(t.narsalar.length, narsa, t.id);
      assert.equal(t.savatlar.length, savat, t.id);
      assert.equal(new Set(t.savatlar.map((s) => s.tur)).size, savat, "savat turlari takrorlanmaydi");
      assert.equal(new Set(t.narsalar.map((n) => n.id)).size, narsa);
      joyiToza(t.narsalar, L.NARSA_SOHA, t.id);
      assert.deepEqual(Object.keys(t.javob).sort(), t.narsalar.map((n) => n.id).sort());
      for (const n of t.narsalar) {
        assert.equal(n.r, rad);
        assert.ok(L.MEVALAR.includes(n.tur));
        const s = t.savatlar.find((x) => x.id === t.javob[n.id]);
        assert.ok(s, "narsaning savati bor: " + n.id);
        assert.equal(s.tur, n.tur, "savat narsaning turiga mos");
        // Boshida hech narsa savat ustida turmaydi, hatto cheti bilan ham
        assert.equal(L.savatUstida(n, t.savatlar, L.SAVAT_CHET), null, t.id);
        for (const x of t.savatlar) assert.ok(n.y + n.r * L.NISBAT < x.y - x.h / 2, "narsa savatdan tepada");
      }
      for (const s of t.savatlar) {
        const soni = t.narsalar.filter((n) => t.javob[n.id] === s.id).length;
        assert.ok(soni >= 1 && soni <= L.SAVAT_SIGIM, `savatda ${soni} ta narsa`);
        // Savat maydon ichida
        assert.ok(s.x - s.w / 2 >= 0 && s.x + s.w / 2 <= 1 && s.y - s.h / 2 >= 0 && s.y + s.h / 2 <= 1, t.id);
      }
      // Savatlar bir-biriga tegmaydi (hoshiyasi bilan ham)
      const xs = t.savatlar.map((s) => s.x).sort((a, b) => a - b);
      for (let i = 1; i < xs.length; i++) assert.ok(xs[i] - xs[i - 1] >= L.SAVAT.w + 2 * L.SAVAT_CHET);
    }
  }
});

test("taqsim: har savatga kamida 1, ko'pi bilan sig'imicha, jami to'g'ri", () => {
  const r = rngFrom(8);
  for (let k = 0; k < 300; k++) {
    for (const [n, s] of [[3, 2], [4, 3], [6, 3], [9, 3], [1, 1]]) {
      const out = L.taqsim(r, n, s);
      assert.equal(out.length, s);
      assert.equal(out.reduce((a, b) => a + b, 0), n);
      for (const x of out) assert.ok(x >= 1 && x <= L.SAVAT_SIGIM);
    }
  }
});

test("nuqta qaysi savat ustida", () => {
  const savatlar = [
    { id: "a", tur: "olma", x: 0.25, y: 0.75, w: 0.25, h: 0.25 },
    { id: "b", tur: "nok", x: 0.75, y: 0.75, w: 0.25, h: 0.25 },
  ];
  assert.equal(L.savatUstida({ x: 0.25, y: 0.75 }, savatlar), "a", "markazi");
  assert.equal(L.savatUstida({ x: 0.75, y: 0.75 }, savatlar), "b");
  assert.equal(L.savatUstida({ x: 0.125, y: 0.625 }, savatlar), "a", "burchagi ham ichida");
  assert.equal(L.savatUstida({ x: 0.375, y: 0.875 }, savatlar), "a");
  assert.equal(L.savatUstida({ x: 0.5, y: 0.75 }, savatlar), null, "ikki savat orasi");
  assert.equal(L.savatUstida({ x: 0.25, y: 0.5 }, savatlar), null, "savatdan tepada");
  assert.equal(L.savatUstida({ x: 0.1, y: 0.75 }, savatlar), null, "chapda");
  assert.equal(L.savatUstida({ x: 0.25, y: 0.99 }, savatlar), null, "pastda");
  assert.equal(L.savatUstida({ x: 0.25, y: 0.75 }, []), null, "savat yo'q");
  // Hoshiya: en bo'yicha chet, bo'y bo'yicha chet × 4/3
  assert.equal(L.savatUstida({ x: 0.11, y: 0.75 }, savatlar, 0.02), "a");
  assert.equal(L.savatUstida({ x: 0.1, y: 0.75 }, savatlar, 0.02), null);
  assert.equal(L.savatUstida({ x: 0.25, y: 0.6 }, savatlar, 0.03), "a", "0.625 − 0.04 = 0.585 dan past");
  assert.equal(L.savatUstida({ x: 0.25, y: 0.58 }, savatlar, 0.03), null);
  // Ikkalasiga ham tushsa (keng hoshiya) — markazi yaqinrog'i
  assert.equal(L.savatUstida({ x: 0.48, y: 0.75 }, savatlar, 0.2), "a");
  assert.equal(L.savatUstida({ x: 0.52, y: 0.75 }, savatlar, 0.2), "b");
});

test("savat ustidami: har narsa o'z savatining markazida va ichidagi joyida — o'sha savat", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.sudraTask, 100, tier, 40 + tier)) {
      const tushgan = {};
      for (const n of t.narsalar) {
        const s = t.savatlar.find((x) => x.id === t.javob[n.id]);
        assert.equal(L.savatUstida({ x: s.x, y: s.y }, t.savatlar, L.SAVAT_CHET), s.id);
        const sigim = t.narsalar.filter((x) => t.javob[x.id] === s.id).length;
        const k = tushgan[s.id] || 0;
        tushgan[s.id] = k + 1;
        const joy = L.savatdagiJoy(s, k, sigim);
        assert.equal(L.savatUstida(joy, t.savatlar), s.id, "ichidagi joy shu savatda");
        assert.ok(L.sohada({ x: joy.x, y: joy.y, r: n.r * L.KICHRAYISH }), "joylangan narsa maydon ichida");
      }
    }
  }
  const s = { id: "s", x: 0.5, y: 0.79, w: 0.28, h: 0.36 };
  const joylar = [0, 1, 2].map((k) => L.savatdagiJoy(s, k, 3));
  assert.equal(new Set(joylar.map((j) => j.x)).size, 3, "uch narsa uch joyda");
  assert.equal(joylar[1].x, 0.5, "o'rtadagisi savat markazida");
  assert.equal(L.savatdagiJoy(s, 0, 1).x, 0.5, "bitta narsa — o'rtada");
});

test("sudralayotgan narsa maydondan chiqmaydi", () => {
  assert.deepEqual(L.maydonIchida({ x: 0.5, y: 0.5 }, 0.06), { x: 0.5, y: 0.5 });
  assert.deepEqual(L.maydonIchida({ x: -0.3, y: 2 }, 0.06), { x: 0.06, y: 1 - 0.06 * L.NISBAT });
  assert.deepEqual(L.maydonIchida({ x: 1.4, y: -1 }, 0.075), { x: 1 - 0.075, y: 0.075 * L.NISBAT });
  const r = rngFrom(9);
  for (let k = 0; k < 200; k++) {
    const p = L.maydonIchida({ x: r() * 3 - 1, y: r() * 3 - 1 }, 0.07);
    assert.ok(L.sohada({ x: p.x, y: p.y, r: 0.07 }));
  }
});

test("ko'rsatish maydonlari: joyi toza, javobi bor", () => {
  const ter = L.korsatTer();
  joyiToza(ter.narsalar, null, "korsatTer");
  assert.deepEqual(ter.javob, ["n0"]);
  const sandiq = L.korsatSandiq();
  joyiToza(sandiq.sandiqlar, null, "korsatSandiq");
  assert.deepEqual(sandiq.sandiqlar.map((s) => s.rang), ["kok", "yashil"]);
  assert.ok(sandiq.amallar.includes("boya"));
  const sudra = L.korsatSudra();
  joyiToza(sudra.narsalar, L.NARSA_SOHA, "korsatSudra");
  assert.equal(L.savatUstida(sudra.narsalar[0], sudra.savatlar, L.SAVAT_CHET), null);
  assert.equal(sudra.savatlar.find((s) => s.id === sudra.javob.n0).tur, sudra.narsalar[0].tur);
  // Chap tepa burchak (sichqoncha rasmi) bo'sh
  for (const o of [...ter.narsalar, ...sandiq.sandiqlar, ...sudra.narsalar]) assert.ok(o.x - o.r > 0.2 || o.y - o.r * L.NISBAT > 0.36);
});

test("ketma-ket bir xil vazifa chiqmaydi va bosqich navbati", () => {
  for (const make of [L.terTask, L.ikkiTask, L.ongTask, L.sudraTask]) {
    for (const tier of [0, 1, 2]) {
      const list = each(make, 150, tier);
      for (let i = 1; i < list.length; i++) assert.notEqual(list[i].id, list[i - 1].id);
    }
  }
  const r = rngFrom(11);
  assert.deepEqual([0, 1, 2].map((tier) => L.bosqich1Task(r, null, 0, tier).tur), ["ter", "ter", "ter"]);
  assert.deepEqual([0, 1, 2].map((tier) => L.bosqich3Task(r, null, 0, tier).tur), ["sudra", "sudra", "sudra"]);
  for (let k = 0; k < 30; k++) {
    assert.equal(L.bosqich2Task(r, null, k, 0).tur, "ikki", "tier 0 — ikki marta bosish");
    assert.equal(L.bosqich2Task(r, null, k, 1).tur, "ong", "tier 1 — o'ng tugma");
  }
  // tier 2 — aralash: birinchisi tasodifiy (ikkala tur ham uchraydi), keyin navbat bilan almashadi
  const birinchi = new Set();
  for (let k = 0; k < 60; k++) birinchi.add(L.bosqich2Task(r, L.ongTask(r, null, 1), 4, 2).tur);
  assert.deepEqual([...birinchi].sort(), ["ikki", "ong"]);
  let prev = null;
  for (let k = 0; k < 40; k++) {
    const t = L.bosqich2Task(r, prev, k, 2);
    assert.equal(t.sandiqlar.length, 4);
    assert.equal(t.amallar.length, 4);
    if (prev) assert.notEqual(t.tur, prev.tur, "qiyin rejimda turlar almashib keladi");
    prev = t;
  }
});

test("matn: to'g'ri belgilar, «xato» so'zi yo'q, vazifa bitta qisqa gap", () => {
  const r = rngFrom(12);
  const matnlar = [];
  for (const tier of [0, 1, 2]) {
    for (let k = 0; k < 40; k++) {
      matnlar.push(L.terTask(r, null, tier).matn, L.ikkiTask(r, null, tier).matn, L.ongTask(r, null, tier).matn, L.sudraTask(r, null, tier).matn);
    }
  }
  for (const x of [...L.RANGLAR, ...L.AMALLAR, ...Object.values(L.TUR)]) matnlar.push(...Object.values(x));
  for (const m of matnlar) {
    assert.ok(!/['`‘’]/.test(m), "oʻ/gʻ uchun ʻ (U+02BB) ishlatiladi: " + m);
    assert.ok(!/xato/i.test(m), m);
  }
  for (const m of matnlar.filter((x) => x.endsWith("."))) {
    assert.equal(m.split(". ").length, 1, "bitta gap: " + m);
    assert.ok(m.length <= 70, "qisqa: " + m);
  }
});
