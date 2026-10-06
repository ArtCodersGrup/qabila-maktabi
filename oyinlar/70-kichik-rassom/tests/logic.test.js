// 70-o'yin: kichik rassom — rasterlash, chelak, tarix, kodlash, namunalar, qadam tekshiruvi,
// 1-bosqich generatorlari va harakat jurnali tekshiruvi.
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
  const r = rngFrom(seed || 70);
  const out = [];
  let prev = null;
  for (let k = 0; k < count; k++) {
    prev = make(r, prev, tier);
    out.push(prev);
  }
  return out;
}
const kalit = (p) => `${p[0]},${p[1]}`;
const toSet = (list) => new Set(list.map(kalit));
const tengKataklar = (a, b) => {
  const sa = toSet(a);
  const sb = toSet(b);
  return sa.size === sb.size && [...sa].every((k) => sb.has(k));
};
// Kataklar chegara ichida va takrorsiz
function toza(list) {
  assert.equal(toSet(list).size, list.length, "takror katak");
  for (const [x, y] of list) assert.ok(L.ichida(x, y), `chegaradan tashqari: ${x},${y}`);
}
// Taxta rasmini satrlar bilan solishtirish uchun (faqat bbox ichi)
function rasm(kataklar, w, h) {
  const set = toSet(kataklar);
  const rows = [];
  for (let y = 0; y < h; y++) {
    let s = "";
    for (let x = 0; x < w; x++) s += set.has(kalit([x, y])) ? "#" : ".";
    rows.push(s);
  }
  return rows;
}
// Gorizontal va vertikal ko'zgu simmetriyasi (bbox 0..w-1, 0..h-1)
function simmetrik(kataklar, w, h, faqatGorizontal) {
  const set = toSet(kataklar);
  for (const [x, y] of kataklar) {
    assert.ok(set.has(kalit([w - 1 - x, y])), `gorizontal simmetriya buzildi: ${x},${y}`);
    if (!faqatGorizontal) assert.ok(set.has(kalit([x, h - 1 - y])), `vertikal simmetriya buzildi: ${x},${y}`);
  }
}

// ---------- Rasterlash ----------
test("chiziq: Brezenxem — ikkala yo'nalishda bir xil kataklar, uzluksiz, uchlari joyida", () => {
  const juftlar = [[[0, 0], [10, 3]], [[3, 20], [30, 2]], [[5, 5], [5, 15]], [[2, 7], [25, 7]], [[0, 0], [0, 0]], [[31, 23], [0, 0]]];
  for (const [a, b] of juftlar) {
    const ab = L.chiziq(a, b);
    const ba = L.chiziq(b, a);
    toza(ab);
    assert.ok(tengKataklar(ab, ba), `${kalit(a)}→${kalit(b)}`);
    assert.ok(toSet(ab).has(kalit(a)) && toSet(ab).has(kalit(b)));
    assert.equal(ab.length, Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])) + 1);
    // 8-qo'shni uzluksizlik: ketma-ket kataklar orasidagi masofa ≤ 1
    for (let k = 1; k < ab.length; k++) {
      assert.ok(Math.abs(ab[k][0] - ab[k - 1][0]) <= 1 && Math.abs(ab[k][1] - ab[k - 1][1]) <= 1);
    }
  }
  assert.deepEqual(L.chiziq([0, 0], [3, 0]), [[0, 0], [1, 0], [2, 0], [3, 0]]);
});

test("to'rtburchak: chegarasi va ichi, burchaklar istalgan tartibda", () => {
  const b = L.tortburchak([2, 3], [6, 6], false);
  const t = L.tortburchak([6, 6], [2, 3], true);
  toza(b);
  toza(t);
  assert.equal(t.length, 5 * 4);
  assert.equal(b.length, 2 * 5 + 2 * 2);
  assert.ok(tengKataklar(b, L.tortburchak([6, 3], [2, 6], false)));
  // Chegara ichi: to'la minus bo'sh = (5-2)*(4-2)
  assert.equal(L.shaklIchi("tortburchak", [2, 3], [6, 6]).length, 3 * 2);
  assert.equal(L.tortburchak([4, 4], [4, 4], false).length, 1, "bitta katak");
  assert.equal(L.tortburchak([0, 0], [31, 23], true).length, L.N);
  // Chegaradan chiqqan kataklar tashlanadi
  assert.equal(L.tortburchak([30, 22], [40, 40], true).length, 2 * 2);
});

test("ellips: simmetrik, bbox chetlariga tegadi, ichi to'la ⊇ chegara, kichik o'lchamlar chiroyli", () => {
  for (const [w, h] of [[3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [10, 8], [9, 5], [12, 20], [20, 6]]) {
    const chegara = L.ellips([0, 0], [w - 1, h - 1], false);
    const toliq = L.ellips([0, 0], [w - 1, h - 1], true);
    toza(chegara);
    toza(toliq);
    simmetrik(chegara, w, h);
    simmetrik(toliq, w, h);
    const sc = toSet(chegara);
    for (const c of chegara) assert.ok(toSet(toliq).has(kalit(c)), "chegara to'la ichida");
    assert.ok(toliq.length > chegara.length, `${w}x${h}: ichi bor`);
    // Burchaklar istalgan tartibda — bir xil
    assert.ok(tengKataklar(chegara, L.ellips([w - 1, h - 1], [0, 0], false)));
    // To'rt chetga tegadi
    assert.ok(chegara.some(([x]) => x === 0) && chegara.some(([x]) => x === w - 1));
    assert.ok(chegara.some(([, y]) => y === 0) && chegara.some(([, y]) => y === h - 1));
    assert.ok(sc.size >= 4);
  }
  assert.deepEqual(rasm(L.ellips([0, 0], [2, 2], false), 3, 3), [".#.", "#.#", ".#."]);
  assert.deepEqual(rasm(L.ellips([0, 0], [4, 4], false), 5, 5), [".###.", "#...#", "#...#", "#...#", ".###."]);
  assert.deepEqual(rasm(L.ellips([0, 0], [5, 5], false), 6, 6), ["..##..", ".#..#.", "#....#", "#....#", ".#..#.", "..##.."]);
  // Eni 1 — chiziq
  assert.equal(L.ellips([3, 2], [3, 9], true).length, 8);
  assert.equal(L.ellips([3, 2], [9, 2], false).length, 7);
});

test("uchburchak: uchi tepada o'rtada, asosi pastda to'liq, chap-o'ng simmetrik", () => {
  for (const [w, h] of [[3, 3], [4, 4], [5, 5], [6, 6], [9, 5], [10, 8], [20, 7], [7, 12]]) {
    const chegara = L.uchburchak([0, 0], [w - 1, h - 1], false);
    const toliq = L.uchburchak([w - 1, 0], [0, h - 1], true);
    toza(chegara);
    toza(toliq);
    simmetrik(chegara, w, h, true);
    simmetrik(toliq, w, h, true);
    const r = rasm(chegara, w, h);
    assert.equal(r[h - 1], "#".repeat(w), `${w}x${h}: asos pastda to'liq`);
    const tepa = r[0].split("").filter((c) => c === "#").length;
    assert.ok(tepa === 1 || tepa === 2, `${w}x${h}: uchi 1–2 katak`);
    assert.equal(r[0][Math.floor((w - 1) / 2)], "#", "uchi o'rtada");
    assert.ok(toliq.length >= chegara.length);
    // To'la uchburchak: har qator chapdan o'ngga uzluksiz
    const rt = rasm(toliq, w, h);
    for (const row of rt) assert.ok(/^\.*#+\.*$/.test(row), `${w}x${h}: ${row}`);
    // Pastga qarab kengayadi
    for (let y = 1; y < h; y++) {
      const kenglik = (q) => rt[q].split("").filter((c) => c === "#").length;
      assert.ok(kenglik(y) >= kenglik(y - 1));
    }
  }
  assert.deepEqual(rasm(L.uchburchak([0, 0], [4, 4], true), 5, 5), ["..#..", ".###.", ".###.", "#####", "#####"]);
});

// ---------- Chelak ----------
test("chelak: 4-qo'shni, chegaradan o'tmaydi, bo'sh maydonni butunlay to'ldiradi", () => {
  let t = L.boshTaxta();
  const bosh = L.toldir(t, 5, 5);
  assert.equal(bosh.length, L.N, "bo'sh taxta — hammasi");
  // Bo'sh doira ichidan to'ldirish — aynan ichi
  const a = [5, 4];
  const b = [16, 13];
  t = L.qoy(t, L.ellips(a, b, false), "qora");
  const ichi = L.toldir(t, 10, 8);
  assert.ok(tengKataklar(ichi, L.shaklIchi("doira", a, b)));
  // Tashqaridan — chegara va ichidan tashqari hamma narsa
  const tashqi = L.toldir(t, 0, 0);
  assert.equal(tashqi.length, L.N - L.ellips(a, b, false).length - ichi.length);
  // Uchburchak ichi ham berk
  let u = L.qoy(L.boshTaxta(), L.uchburchak([4, 3], [15, 12], false), "kok");
  const uIchi = L.toldir(u, 9, 10);
  assert.ok(tengKataklar(uIchi, L.shaklIchi("uchburchak", [4, 3], [15, 12])));
  // Diagonal chiziq 4-qo'shni to'ldirishni to'xtatadi
  let d = L.qoy(L.boshTaxta(), L.chiziq([0, 23], [31, 0]), "qora");
  const chap = L.toldir(d, 0, 0);
  assert.ok(chap.length < L.N - 32 && chap.length > 100);
  assert.ok(!toSet(chap).has(kalit([31, 23])));
  // Bir xil rangga to'ldirish — o'zgarish yo'q (bajar orqali)
  const n = L.bajar(t, { asbob: "chelak", rang: "qora", a: [5, 8] });
  assert.equal(n.kataklar.length, 0);
  assert.ok(L.teng(n.taxta, t));
});

test("bajar: shakllar, qalam, o'chirg'ich va chelak taxtani to'g'ri o'zgartiradi, eski taxta o'zgarmaydi", () => {
  const t0 = L.boshTaxta();
  const r1 = L.bajar(t0, { asbob: "tortburchak", rang: "kok", toliq: true, a: [1, 1], b: [4, 3] });
  assert.ok(L.boshmi(t0), "eski taxta o'zgarmadi");
  assert.equal(r1.kataklar.length, 12);
  assert.equal(r1.taxta[L.indeks(2, 2)], L.rangIdx("kok"));
  const r2 = L.bajar(r1.taxta, { asbob: "ochirgich", kataklar: [[2, 2], [3, 3]] });
  assert.equal(r2.taxta[L.indeks(2, 2)], L.BOSH);
  assert.equal(r2.taxta[L.indeks(1, 1)], L.rangIdx("kok"));
  const r3 = L.bajar(r2.taxta, { asbob: "qalam", rang: "qizil", kataklar: [[2, 2], [40, 2]] });
  assert.equal(r3.kataklar.length, 1, "chegaradan tashqari katak tashlanadi");
  assert.equal(r3.taxta[L.indeks(2, 2)], L.rangIdx("qizil"));
  const r4 = L.bajar(r3.taxta, { asbob: "chelak", rang: "sariq", a: [10, 10] });
  assert.equal(r4.taxta[L.indeks(10, 10)], L.rangIdx("sariq"));
  // (3,3) to'rtburchak chetida o'chirilgan — tashqari bilan tutash, u ham sariq bo'ladi; (2,2) qizil qoladi
  assert.equal(r4.taxta[L.indeks(3, 3)], L.rangIdx("sariq"));
  assert.equal(r4.taxta[L.indeks(2, 2)], L.rangIdx("qizil"));
  assert.equal(r4.taxta[L.indeks(1, 1)], L.rangIdx("kok"));
});

// ---------- Tarix ----------
test("tarix: bekor/qaytar, yangi qadam kelgusini o'chiradi, 50 qadam chegarasi", () => {
  let t = L.tarixYasa();
  assert.ok(!L.bekorMumkin(t) && !L.qaytarMumkin(t));
  const t1 = L.qoy(L.boshTaxta(), [[0, 0]], "kok");
  const t2 = L.qoy(t1, [[1, 0]], "kok");
  t = L.tarixQoy(t, t1);
  t = L.tarixQoy(t, t2);
  assert.ok(L.bekorMumkin(t));
  t = L.tarixBekor(t);
  assert.ok(L.teng(t.hozir, t1) && L.qaytarMumkin(t));
  t = L.tarixQaytar(t);
  assert.ok(L.teng(t.hozir, t2) && !L.qaytarMumkin(t));
  t = L.tarixBekor(t);
  t = L.tarixQoy(t, L.qoy(t1, [[5, 5]], "qizil"));
  assert.ok(!L.qaytarMumkin(t), "yangi qadam — qaytarish yo'q");
  assert.equal(L.tarixBekor(L.tarixYasa()).otgan.length, 0, "bo'sh tarixda bekor — o'zgarmaydi");
  // 50 chegarasi: 60 qadamdan keyin faqat 50 tasi qaytariladi
  let h = L.tarixYasa();
  for (let k = 0; k < 60; k++) h = L.tarixQoy(h, L.qoy(h.hozir, [[k % L.W, Math.floor(k / L.W)]], "kok"));
  assert.equal(h.otgan.length, L.TARIX_CHEGARA);
  let n = 0;
  while (L.bekorMumkin(h)) { h = L.tarixBekor(h); n++; }
  assert.equal(n, 50);
  assert.equal(h.hozir.filter((v) => v !== L.BOSH).length, 10, "eng eski 10 qadam qoladi");
});

// ---------- Kodlash ----------
test("kodla/och: aylanma, bo'sh taxta qisqa, buzuq satr null", () => {
  const bosh = L.boshTaxta();
  assert.equal(L.kodla(bosh), "32x24:768.");
  assert.deepEqual(L.och(L.kodla(bosh)), bosh);
  const r = rngFrom(5);
  for (let k = 0; k < 20; k++) {
    let t = L.boshTaxta();
    for (let j = 0; j < 6; j++) {
      const a = [Math.floor(r() * L.W), Math.floor(r() * L.H)];
      const b = [Math.floor(r() * L.W), Math.floor(r() * L.H)];
      t = L.bajar(t, { asbob: L.SHAKL_ID[j % 4], rang: L.RANG_ID[Math.floor(r() * 12)], toliq: j % 2 === 0, a, b }).taxta;
    }
    const kod = L.kodla(t);
    assert.deepEqual(L.och(kod), t);
    assert.ok(kod.length < L.N, "run-length qisqaroq");
  }
  const toliq = L.namunaTaxta(L.namunaById("uy"));
  assert.deepEqual(L.och(L.kodla(toliq)), toliq);
  assert.equal(L.och("16x16:256."), null);
  assert.equal(L.och("32x24:767."), null);
  assert.equal(L.och("32x24:769."), null);
  assert.equal(L.och("32x24:700.x68."), null);
  assert.equal(L.och(null), null);
  assert.equal(L.och("32x24:768.."), null);
  // Rang belgisi harf, soni raqam: "2a" + "c" = 2 ta qora + 1 ta qizil — ikki xil o'qilmaydi
  const t = L.qoy(L.qoy(L.boshTaxta(), [[0, 0], [1, 0]], "qora"), [[2, 0]], "qizil");
  assert.equal(L.kodla(t), "32x24:2ac765.");
  assert.deepEqual(L.och("32x24:2ac765."), t);
});

// ---------- Namunalar ----------
test("namunalar: 6 ta, 5–6 qadam, hammasi 32×24 ichida, kataklari bo'sh emas, ranglar va asboblar mavjud", () => {
  assert.equal(L.NAMUNALAR.length, 6);
  assert.deepEqual(L.NAMUNALAR.map((n) => n.id), ["uy", "daraxt", "quyosh", "mashina", "kema", "robot"]);
  for (const n of L.NAMUNALAR) {
    assert.ok(n.qadamlar.length >= 5 && n.qadamlar.length <= 6, `${n.id}: ${n.qadamlar.length} qadam`);
    for (const q of n.qadamlar) {
      assert.ok(L.rangById(q.rang), `${n.id}/${q.matn}: rang`);
      assert.ok(L.CHIZISH.includes(q.asbob) && q.asbob !== "chelak" && q.asbob !== "ochirgich");
      const k = L.qadamKataklari(q);
      assert.ok(k.length >= 3, `${n.id}/${q.matn}: kamida 3 katak`);
      toza(k);
      if (q.asbob === "qalam") {
        assert.equal(k.length, q.kataklar.length, `${n.id}/${q.matn}: qalam kataklari chegarada`);
      } else {
        for (const p of [q.a, q.b]) assert.ok(L.ichida(p[0], p[1]), `${n.id}/${q.matn}: burchak ichida`);
        if (q.asbob !== "chiziq") assert.equal(typeof q.toliq, "boolean");
      }
      assert.ok(q.matn && !/[`'’]/.test(L.qadamMatni(q)), "matnda noto'g'ri tutuq belgisi yo'q");
    }
  }
});

test("namunalar: qadamlar bir-birini butunlay yopib yubormaydi (har qadamning kamida yarmi tayyor rasmda ko'rinadi)", () => {
  for (const n of L.NAMUNALAR) {
    const tayyor = L.namunaTaxta(n);
    assert.ok(!L.boshmi(tayyor));
    n.qadamlar.forEach((q, k) => {
      const kataklar = L.qadamKataklari(q);
      const qoldi = kataklar.filter(([x, y]) => tayyor[L.indeks(x, y)] === L.rangIdx(q.rang)).length;
      assert.ok(qoldi * 2 >= kataklar.length, `${n.id}/${q.matn} (${k}): ${qoldi}/${kataklar.length} qoldi`);
    });
    // Qadam-qadam taxta — ketma-ket qo'llansa, tayyor rasm chiqadi
    assert.ok(L.teng(L.namunaTaxta(n, n.qadamlar.length), tayyor));
    assert.ok(L.boshmi(L.namunaTaxta(n, 0)));
  }
});

test("qadam vazifasi: matn, kutilgan kataklar, javob to'liq, qiyin rejimda chegara 0.9 va soya yo'q", () => {
  const uy = L.namunaById("uy");
  const t0 = L.qadamTask(uy, 0, false);
  assert.equal(t0.tur, "qadam");
  assert.equal(t0.id, "uy:0");
  assert.equal(t0.matn, "Devor: koʻk toʻrtburchak chiz (ichi toʻla)");
  assert.equal(t0.kutilgan.length, 16 * 11);
  assert.equal(t0.chegara, L.CHEGARA);
  assert.ok(t0.soya);
  assert.deepEqual(t0.javob, { asbob: "tortburchak", rang: "kok", toliq: true, a: [8, 11], b: [23, 21] });
  const t5 = L.qadamTask(uy, 5, true);
  assert.equal(t5.matn, "Tutun: kulrang qalam bilan soyani boʻya");
  assert.equal(t5.chegara, L.QIYIN_CHEGARA);
  assert.ok(!t5.soya);
  assert.equal(t5.javob.asbob, "qalam");
  assert.equal(t5.javob.kataklar.length, 4);
  assert.equal(L.qadamTask(L.namunaById("quyosh"), 2).matn, "Nur tepaga: toʻq sariq chiziq tort");
  assert.equal(L.qadamTask(L.namunaById("quyosh"), 1).matn, "Halqa: toʻq sariq doira chiz (ichi boʻsh)");
  // Javobni bajarsa — tekshiruvdan o'tadi
  for (const n of L.NAMUNALAR) {
    let taxta = L.boshTaxta();
    n.qadamlar.forEach((q, k) => {
      const task = L.qadamTask(n, k, true);
      const keyin = L.bajar(taxta, task.javob).taxta;
      assert.ok(L.qadamTekshir(taxta, keyin, task.kutilgan, task.rang, task.chegara).ok, `${n.id}:${k}`);
      taxta = keyin;
    });
  }
});

// ---------- Qadam tekshiruvi ----------
test("qadam tekshiruvi: to'g'ri, 85 % chegarasi, ortiqcha kataklar, noto'g'ri rang, qiyin rejim 90 %", () => {
  const uy = L.namunaById("uy");
  const task = L.qadamTask(uy, 0);
  const oldin = L.boshTaxta();
  const n = task.kutilgan.length; // 176
  // Aynan — to'g'ri
  const aniq = L.qoy(oldin, task.kutilgan, "kok");
  assert.ok(L.qadamTekshir(oldin, aniq, task.kutilgan, "kok").ok);
  assert.ok(!L.qadamTekshir(oldin, oldin, task.kutilgan, "kok").ok, "hech narsa chizilmagan");
  assert.equal(L.qadamTekshir(oldin, oldin, task.kutilgan, "kok").sabab, "kam");
  // 85 %: 176 ta katakdan 150 tasi — yetarli (ceil(149.6) = 150), 149 — yetarli emas
  const qism = (k) => L.qoy(oldin, task.kutilgan.slice(0, k), "kok");
  assert.ok(L.qadamTekshir(oldin, qism(150), task.kutilgan, "kok").ok);
  assert.ok(!L.qadamTekshir(oldin, qism(149), task.kutilgan, "kok").ok);
  const r149 = L.qadamTekshir(oldin, qism(149), task.kutilgan, "kok");
  assert.equal(r149.togri, 149);
  assert.equal(r149.jami, n);
  assert.equal(r149.kerak, 150);
  // Ortiqcha: 15 % = floor(26.4) = 26 ta ruxsat, 27 — yo'q
  const tashqari = (k) => {
    const list = [];
    for (let y = 0; y < 5 && list.length < k; y++) for (let x = 0; x < L.W && list.length < k; x++) list.push([x, y]);
    return list;
  };
  assert.ok(L.qadamTekshir(oldin, L.qoy(aniq, tashqari(26), "qizil"), task.kutilgan, "kok").ok);
  const ortiq = L.qadamTekshir(oldin, L.qoy(aniq, tashqari(27), "qizil"), task.kutilgan, "kok");
  assert.ok(!ortiq.ok);
  assert.equal(ortiq.sabab, "ortiqcha");
  assert.equal(ortiq.ortiqcha, 27);
  // Noto'g'ri rang — "rang" sababi
  const rang = L.qadamTekshir(oldin, L.qoy(oldin, task.kutilgan, "qizil"), task.kutilgan, "kok");
  assert.ok(!rang.ok);
  assert.equal(rang.sabab, "rang");
  // Siljigan to'rtburchak (2 katak o'ngga): 14/16 ustun mos = 87.5 % to'g'ri, lekin ortiqcha 2 ustun = 22 > 26? yo'q, 22 ≤ 26 → o'tadi
  const siljigan = L.qoy(oldin, L.tortburchak([10, 11], [25, 21], true), "kok");
  assert.ok(L.qadamTekshir(oldin, siljigan, task.kutilgan, "kok").ok);
  // 3 katak siljigan: 13/16 = 81 % — o'tmaydi
  const kop = L.qoy(oldin, L.tortburchak([11, 11], [26, 21], true), "kok");
  assert.ok(!L.qadamTekshir(oldin, kop, task.kutilgan, "kok").ok);
  // Qiyin rejim 90 %: 2 katak siljigan (87.5 %) o'tmaydi, 1 katak (93.75 %) o'tadi
  assert.ok(!L.qadamTekshir(oldin, siljigan, task.kutilgan, "kok", L.QIYIN_CHEGARA).ok);
  const bir = L.qoy(oldin, L.tortburchak([9, 11], [24, 21], true), "kok");
  assert.ok(L.qadamTekshir(oldin, bir, task.kutilgan, "kok", L.QIYIN_CHEGARA).ok);
  // Oldingi qadamlar o'zgarmasligi: oldin tayyor bo'lgan kataklar hisobga kirmaydi
  const oldin2 = L.namunaTaxta(uy, 2);
  const t2 = L.qadamTask(uy, 2);
  assert.ok(L.qadamTekshir(oldin2, L.bajar(oldin2, t2.javob).taxta, t2.kutilgan, t2.rang).ok);
  assert.ok(!L.qadamTekshir(oldin2, oldin2, t2.kutilgan, t2.rang).ok);
});

// ---------- 1-bosqich generatorlari ----------
const RANG_NOM = L.PALITRA.map((p) => p.nom);
test("shakl vazifasi: har tierda yuzlab marta — asbob/rang mavjud, matn mos, javob tekshiruvdan o'tadi, takror yo'q", () => {
  for (const tier of [0, 1, 2]) {
    const list = each(L.shaklTask, 300, tier, 11 + tier);
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      assert.equal(t.tur, "asbob");
      assert.equal(t.amal, "shakl");
      assert.ok(L.SHAKL_ID.includes(t.asbob));
      assert.ok(L.RANG_ID.includes(t.rang));
      assert.ok(RANG_NOM.some((nom) => t.matn.toLowerCase().startsWith(nom)), t.matn);
      assert.ok(t.matn.includes(L.asbobById(t.asbob).nom), t.matn);
      if (tier === 0) assert.equal(t.toliq, null);
      if (tier === 1) {
        assert.notEqual(t.asbob, "chiziq");
        assert.equal(typeof t.toliq, "boolean");
        assert.match(t.matn, /ichi toʻla|ichi boʻsh/);
      }
      if (tier === 2) {
        assert.equal(t.min, t.asbob === "chiziq" ? 8 : 6);
        assert.match(t.matn, /kamida [68] katak/);
      } else assert.equal(t.min, 3);
      if (i > 0) assert.notEqual(t.id, list[i - 1].id);
      // javob — to'liq harakat va tekshiruvdan o'tadi
      const j = t.javob;
      assert.equal(j.asbob, t.asbob);
      assert.equal(j.rang, t.rang);
      assert.ok(L.ichida(j.a[0], j.a[1]) && L.ichida(j.b[0], j.b[1]));
      const h = { ...j, kataklar: L.rasterla(j) };
      assert.ok(L.harakatTekshir(t, [h], L.bajar(L.boshTaxta(), j).taxta).ok, t.id);
    }
    // Har tierda hamma shakl va ko'p rang chiqadi
    const asboblar = new Set(list.map((t) => t.asbob));
    assert.ok(asboblar.size >= (tier === 1 ? 3 : 4), `tier ${tier}: asboblar ${[...asboblar]}`);
    assert.ok(new Set(list.map((t) => t.rang)).size >= 10);
  }
});

test("to'ldirish vazifasi: shakl taxtada, ichi ≥ 6 katak, javob nuqtasi ichida, chelak bilan aynan ichi bo'yaladi", () => {
  for (const tier of [0, 1, 2]) {
    const list = each(L.toldirTask, 300, tier, 21 + tier);
    const shakllar = new Set();
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      assert.equal(t.amal, "toldir");
      assert.equal(t.asbob, "chelak");
      assert.equal(t.boshlangich.length, 1);
      assert.notEqual(t.boshlangich[0].rang, t.rang, "chegara rangi boshqa");
      assert.ok(!t.boshlangich[0].toliq);
      assert.ok(t.ichki.length >= 6);
      assert.ok(toSet(t.ichki).has(kalit(t.javob.a)), "nuqta ichida");
      assert.ok(t.matn.endsWith(" toʻldir") && t.matn.includes(L.rangById(t.rang).jonalish), t.matn);
      if (tier < 2) assert.notEqual(t.shakl, "uchburchak");
      shakllar.add(t.shakl);
      if (i > 0) assert.notEqual(t.id, list[i - 1].id);
      const taxta = L.harakatlarTaxta(t.boshlangich);
      const natija = L.bajar(taxta, t.javob);
      assert.ok(tengKataklar(natija.kataklar, t.ichki), t.id);
      assert.ok(L.harakatTekshir(t, [{ ...t.javob, kataklar: natija.kataklar }], natija.taxta).ok);
      // Tashqariga bosilsa — "joy"
      const tashqi = L.bajar(taxta, { asbob: "chelak", rang: t.rang, a: [0, 0] });
      assert.equal(L.harakatTekshir(t, [{ asbob: "chelak", rang: t.rang, a: [0, 0], kataklar: tashqi.kataklar }], tashqi.taxta).sabab, "joy");
    }
    assert.ok(shakllar.size >= (tier === 2 ? 3 : 2));
  }
});

test("bekor vazifasi: 3 ta tayyor shakl, tier 2 da 2 ta qaytariladi, kutilgan taxta to'g'ri, 'kop' va 'bekor' sabablari", () => {
  for (const tier of [0, 1, 2]) {
    const list = each(L.bekorTask, 200, tier, 31 + tier);
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      assert.equal(t.amal, "bekor");
      assert.equal(t.boshlangich.length, 3);
      assert.equal(t.soni, tier === 2 ? 2 : 1);
      assert.equal(t.javob.soni, t.soni);
      assert.equal(new Set(t.boshlangich.map((h) => h.rang)).size, 3, "uch xil rang");
      for (const h of t.boshlangich) {
        assert.ok(L.ichida(h.a[0], h.a[1]) && L.ichida(h.b[0], h.b[1]));
        assert.ok(h.b[0] - h.a[0] >= 4 && h.b[1] - h.a[1] >= 4);
      }
      // Shakllar ustma-ust tushmaydi
      const sets = t.boshlangich.map((h) => toSet(L.rasterla(h)));
      for (let p = 0; p < 3; p++) for (let q = p + 1; q < 3; q++) for (const k of sets[p]) assert.ok(!sets[q].has(k), "ustma-ust");
      assert.ok(L.teng(t.kutilganTaxta, L.harakatlarTaxta(t.boshlangich.slice(0, 3 - t.soni))));
      if (i > 0) assert.notEqual(t.id, list[i - 1].id);
      // Tarix orqali: soni marta bekor — to'g'ri
      let tarix = L.tarixYasa();
      let taxta = L.boshTaxta();
      for (const h of t.boshlangich) { taxta = L.bajar(taxta, h).taxta; tarix = L.tarixQoy(tarix, taxta); }
      const jurnal = [];
      for (let k = 0; k < t.soni; k++) { tarix = L.tarixBekor(tarix); jurnal.push({ asbob: "bekor" }); }
      assert.ok(L.harakatTekshir(t, jurnal, tarix.hozir).ok, t.id);
      // Yana bitta bekor — ko'p
      const kop = L.tarixBekor(tarix);
      assert.equal(L.harakatTekshir(t, jurnal.concat([{ asbob: "bekor" }]), kop.hozir).sabab, "kop");
      // Hech narsa qilmasdan chizish — "bekor"
      const chizdi = L.bajar(L.harakatlarTaxta(t.boshlangich), { asbob: "qalam", rang: "qora", kataklar: [[0, 0]] });
      assert.equal(L.harakatTekshir(t, [{ asbob: "qalam", rang: "qora", kataklar: [[0, 0]] }], chizdi.taxta).sabab, "bekor");
      // Tier 2: bitta bekor hali yetarli emas
      if (t.soni === 2) {
        let t1 = L.tarixYasa();
        let b1 = L.boshTaxta();
        for (const h of t.boshlangich) { b1 = L.bajar(b1, h).taxta; t1 = L.tarixQoy(t1, b1); }
        t1 = L.tarixBekor(t1);
        assert.equal(L.harakatTekshir(t, [{ asbob: "bekor" }], t1.hozir).sabab, "bekor");
      }
    }
  }
});

test("bosqich navbati: shakl, to'ldir, shakl, bekor — aylanadi; tier generatorga yetadi", () => {
  const r = rngFrom(9);
  assert.deepEqual([0, 1, 2, 3, 4, 5].map((n) => L.bosqich1Task(r, null, n, 0).amal), ["shakl", "toldir", "shakl", "bekor", "shakl", "toldir"]);
  for (let k = 0; k < 50; k++) {
    const t = L.bosqich1Task(r, null, k, 2);
    assert.equal(t.tier, 2);
    if (t.amal === "shakl") assert.ok(t.min === 6 || t.min === 8);
    if (t.amal === "bekor") assert.equal(t.soni, 2);
  }
  // Har vazifada avtomat o'ynovchi uchun javob va boshlang'ich holat bor
  for (let k = 0; k < 12; k++) {
    const t = L.bosqich1Task(r, null, k, k % 3);
    assert.ok(t.javob && t.javob.asbob, t.id);
    assert.ok(Array.isArray(t.boshlangich), t.id);
    assert.ok(t.matn.length > 5 && !/['’]/.test(t.matn), t.matn);
  }
});

// ---------- Harakat jurnali tekshiruvi ----------
test("harakat tekshiruvi (shakl): to'g'ri asbob/rang/ichi/o'lcham; noto'g'ri holatlarda sabab; bekor — kutish", () => {
  const task = { tur: "asbob", amal: "shakl", asbob: "tortburchak", rang: "kok", toliq: true, min: 3 };
  const togri = { asbob: "tortburchak", rang: "kok", toliq: true, a: [2, 2], b: [6, 5], kataklar: [] };
  const taxta = L.boshTaxta();
  assert.ok(L.harakatTekshir(task, [togri], taxta).ok);
  assert.equal(L.harakatTekshir(task, [], taxta).sabab, "kutish");
  assert.equal(L.harakatTekshir(task, [{ ...togri, asbob: "doira" }], taxta).sabab, "asbob");
  assert.equal(L.harakatTekshir(task, [{ ...togri, asbob: "qalam" }], taxta).sabab, "asbob");
  assert.equal(L.harakatTekshir(task, [{ ...togri, rang: "qizil" }], taxta).sabab, "rang");
  assert.equal(L.harakatTekshir(task, [{ ...togri, toliq: false }], taxta).sabab, "toliq");
  assert.equal(L.harakatTekshir(task, [{ ...togri, b: [3, 5] }], taxta).sabab, "olcham", "eni 2");
  assert.equal(L.harakatTekshir(task, [{ ...togri, b: [6, 3] }], taxta).sabab, "olcham", "bo'yi 2");
  assert.ok(L.harakatTekshir(task, [{ ...togri, a: [6, 5], b: [2, 2] }], taxta).ok, "teskari burchaklar");
  // Faqat oxirgi harakat qaraladi
  assert.ok(L.harakatTekshir(task, [{ ...togri, rang: "qizil" }, togri], taxta).ok);
  // Bekor / qaytar / tozalash — urinish emas
  for (const amal of ["bekor", "qaytar", "tozalash"]) assert.equal(L.harakatTekshir(task, [togri, { asbob: amal }], taxta).sabab, "kutish");
  // Ichi talab qilinmasa (tier 0) — ikkalasi ham to'g'ri
  const t0 = { ...task, toliq: null };
  assert.ok(L.harakatTekshir(t0, [{ ...togri, toliq: false }], taxta).ok);
  // O'lcham talabi (tier 2): eni kamida 6
  const t2 = { ...task, min: 6 };
  assert.equal(L.harakatTekshir(t2, [togri], taxta).sabab, "olcham");
  assert.ok(L.harakatTekshir(t2, [{ ...togri, b: [7, 5] }], taxta).ok);
  // Chiziq: uzunlik (ikkala yo'nalishda), ichi so'ralmaydi
  const ch = { tur: "asbob", amal: "shakl", asbob: "chiziq", rang: "yashil", toliq: null, min: 8 };
  assert.ok(L.harakatTekshir(ch, [{ asbob: "chiziq", rang: "yashil", toliq: false, a: [1, 1], b: [1, 8] }], taxta).ok);
  assert.ok(L.harakatTekshir(ch, [{ asbob: "chiziq", rang: "yashil", toliq: false, a: [9, 4], b: [1, 1] }], taxta).ok);
  assert.equal(L.harakatTekshir(ch, [{ asbob: "chiziq", rang: "yashil", toliq: false, a: [1, 1], b: [1, 7] }], taxta).sabab, "olcham");
  // Chelak vazifasida boshqa asbob yoki rang
  const td = { tur: "asbob", amal: "toldir", asbob: "chelak", rang: "qizil", ichki: [[5, 5], [6, 5]] };
  assert.equal(L.harakatTekshir(td, [{ asbob: "qalam", rang: "qizil", kataklar: [[5, 5]] }], taxta).sabab, "asbob");
  assert.equal(L.harakatTekshir(td, [{ asbob: "chelak", rang: "kok", a: [5, 5], kataklar: [[5, 5], [6, 5]] }], taxta).sabab, "rang");
  assert.equal(L.harakatTekshir(td, [{ asbob: "chelak", rang: "qizil", a: [5, 5], kataklar: [[5, 5]] }], taxta).sabab, "joy");
  assert.ok(L.harakatTekshir(td, [{ asbob: "chelak", rang: "qizil", a: [5, 5], kataklar: [[6, 5], [5, 5]] }], taxta).ok);
  assert.equal(L.harakatTekshir(td, [{ asbob: "bekor" }], taxta).sabab, "kutish");
});

test("yordamchilar: palitra 12 rang, asboblar 7 ta, nomlar to'g'ri belgili, o'lcham va bbox", () => {
  assert.equal(L.PALITRA.length, 12);
  assert.equal(new Set(L.PALITRA.map((p) => p.hex)).size, 12);
  assert.equal(L.ASBOBLAR.length, 7);
  assert.equal(L.rangNomi("kok"), "koʻk");
  assert.equal(L.asbobNomi("ochirgich"), "oʻchirgʻich");
  assert.equal(L.rangIdx("pushti"), 11);
  assert.equal(L.rangIdx(null), L.BOSH);
  assert.deepEqual(L.olcham([5, 9], [2, 3]), { eni: 4, boyi: 7 });
  assert.deepEqual(L.bbox([5, 9], [2, 3]), { x0: 2, y0: 3, x1: 5, y1: 9 });
  for (const p of L.PALITRA) assert.ok(!/['’]/.test(p.nom + p.jonalish), p.nom);
  for (const a of L.ASBOBLAR) assert.ok(!/['’]/.test(a.nom), a.nom);
});
