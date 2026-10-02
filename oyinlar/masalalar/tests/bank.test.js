// Masalalar banki. Har masalaning namunali yechimi barcha testlardan o'tishi shart
// (QOIDALAR §4.3 dagi masala banki istisnosi shuni talab qiladi).
const test = require("node:test");
const assert = require("node:assert/strict");
const B = require("../js/bank.js");
const R = require("../js/royxat.js");
const K = require("../../umumiy/js/kod.js");
const py = require("../../umumiy/js/python/python.js");
const BAHO = require("../js/baho.js");

const allProblems = B.LEVELS.flatMap((level) => level.problems.map((p) => [level, p]));

test("beshta daraja bor va har birida kamida 6 ta masala", () => {
  assert.equal(B.LEVELS.length, 5);
  assert.deepEqual(B.LEVELS.map((l) => l.id), ["oson", "orta", "qiyin", "cf", "olimpiada"]);
  for (const level of B.LEVELS) {
    assert.ok(level.problems.length >= 6, level.id + ": " + level.problems.length + " ta masala");
  }
});

test("har masalada qiyinlik (rating) va teglar bor, teglar lug'atdan", () => {
  for (const [level, p] of allProblems) {
    const where = level.id + "/" + p.id;
    assert.ok(Number.isInteger(p.rating) && p.rating > 0, where + ": rating");
    assert.ok(Array.isArray(p.tags) && p.tags.length >= 1, where + ": teg yo'q");
    for (const tag of p.tags) assert.ok(B.TAGS.includes(tag), where + ": notanish teg «" + tag + "»");
  }
});


test("Codeforces masalalari: manba havolasi va haqiqiy reyting", () => {
  assert.ok(B.CF.length >= 10);
  for (const p of B.CF) {
    assert.ok(p.rating >= 800 && p.rating <= 1200, p.id + ": Codeforces reytingi " + p.rating);
    assert.ok(p.manba && p.manba.kod && p.manba.nom, p.id + ": manba");
    assert.match(p.manba.url, /^https:\/\/codeforces\.com\/problemset\/problem\/\d+\/[A-Z]\d*$/, p.id + ": havola");
    assert.ok(Array.isArray(p.manba.cfTags) && p.manba.cfTags.length, p.id + ": cfTags");
    assert.ok(Number.isInteger(p.tartib), p.id + ": tartib");
    // Animatsiya uchun joy ajratilgan (keyin to'ldiriladi)
    assert.ok("animatsiya" in p, p.id + ": animatsiya maydoni yo'q");
  }
  const tartiblar = B.CF.map((p) => p.tartib).sort((a, b) => a - b);
  assert.deepEqual(tartiblar, B.CF.map((_, k) => k + 1), "tartib raqamlari 1 dan ketma-ket");
  // Narvon: tartib bo'yicha reyting kamaymasligi kerak (muallif talabi — qiyinlik bo'yicha tartib)
  const narvon = [...B.CF].sort((a, b) => a.tartib - b.tartib).map((p) => p.rating);
  for (let k = 1; k < narvon.length; k++) {
    assert.ok(narvon[k] >= narvon[k - 1], "reyting kamaydi: " + narvon.join(" → "));
  }
});

test("Codeforces shartlari o'zimizniki: matn o'zbekcha va uzun", () => {
  for (const p of B.CF) {
    assert.ok(p.what.length > 60, p.id + ": shart juda qisqa");
    assert.ok(/[a-z]/.test(p.what), p.id);
    // Asl inglizcha nom shart matnida takrorlanmaydi
    assert.ok(!p.what.includes(p.manba.nom), p.id + ": asl nom shartda");
  }
});

test("Olimpiada darajasi: 20 masala, reyting 700–1400, narvon va manba", () => {
  assert.equal(B.OLIMPIADA.length, 20);
  B.OLIMPIADA.forEach((p, k) => {
    assert.ok(p.rating >= 700 && p.rating <= 1400, p.id + ": reyting " + p.rating);
    // Narvon: tartib 1 dan ketma-ket, reyting kamaymaydi
    assert.equal(p.tartib, k + 1, p.id + ": tartib");
    if (k > 0) assert.ok(p.rating >= B.OLIMPIADA[k - 1].rating, p.id + ": reyting kamaydi");
    assert.ok("animatsiya" in p, p.id + ": animatsiya maydoni yo'q");
    assert.ok(p.what.length > 60, p.id + ": shart juda qisqa");
    // Manba ixtiyoriy (8 tasi asl masala), lekin bo'lsa — to'liq va shartda asl nom yo'q
    if (p.manba) {
      assert.ok(p.manba.kod && p.manba.nom, p.id + ": manba");
      assert.match(p.manba.url, /^https:\/\/codeforces\.com\/problemset\/problem\/\d+\/[A-Z]\d*$/, p.id + ": havola");
      assert.ok(Array.isArray(p.manba.cfTags) && p.manba.cfTags.length, p.id + ": cfTags");
      assert.ok(!p.what.includes(p.manba.nom), p.id + ": asl nom shartda");
    }
  });
  assert.ok(B.OLIMPIADA.filter((p) => !p.manba).length >= 8, "asl masalalar");
});

test("har masalada shart, format, namuna, testlar, yechim va maslahat bor", () => {
  for (const [level, p] of allProblems) {
    const where = level.id + "/" + p.id;
    for (const field of ["title", "what", "kirish", "chiqish", "solution", "hint"]) {
      assert.ok(p[field] && String(p[field]).length > 5, where + ": " + field);
    }
    assert.ok(p.namuna && p.namuna.stdin && p.namuna.out, where + ": namuna");
    // 6 ta: javobi ochiladigan 2 ta testni kodga qotirib yozgan yechim baribir yiqilsin (baho.js OCHIQ_SONI)
    assert.ok(p.tests.length >= 6, where + ": kamida 6 ta yashirin test, bor: " + p.tests.length);
    assert.equal(new Set(p.tests.map((x) => JSON.stringify(x))).size, p.tests.length, where + ": takror test");
    assert.ok(!p.tests.some((x) => JSON.stringify(x) === JSON.stringify(p.namuna.stdin)), where + ": namuna yashirin testlarda takrorlangan");
  }
});

test("shart matnida markdown belgilari yo'q (ekranda xom ko'rinadi)", () => {
  for (const [level, p] of allProblems) {
    for (const field of ["what", "kirish", "chiqish", "hint"]) {
      // ** dan keyin darrov harf kelsa — bu markdown (Pythonning darajasi doim bo'shliq bilan yoziladi)
      assert.ok(!/\*\*\S/.test(p[field]), level.id + "/" + p.id + ": " + field + " da markdown qalin matn bor");
      assert.ok(!/\[[^\]]*\]\(/.test(p[field]), level.id + "/" + p.id + ": " + field + " da havola bor");
    }
  }
});

test("matnlarda tutuq belgisi toʻgʻri: oʻ va gʻ — U+02BB bilan", () => {
  for (const [level, p] of allProblems) {
    for (const field of ["title", "what", "kirish", "chiqish", "hint"]) {
      assert.ok(!/['’‘`´]/.test(p[field]), level.id + "/" + p.id + ": " + field + " da notoʻgʻri tutuq belgisi");
    }
  }
});

test("masala nomlari takrorlanmaydi", () => {
  const ids = allProblems.map(([, p]) => p.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("namunali yechim namunadagi javobni aynan beradi", () => {
  for (const [level, p] of allProblems) {
    const r = py.run(p.solution, { stdin: p.namuna.stdin, maxSteps: 200000 });
    assert.equal(r.error, null, level.id + "/" + p.id + ": " + (r.error && r.error.text));
    assert.deepEqual(r.output, p.namuna.out, level.id + "/" + p.id);
  }
});

test("namunali yechim barcha yashirin testlarda ham xatosiz ishlaydi", () => {
  for (const [level, p] of allProblems) {
    const task = R.vazifa(p);
    assert.deepEqual(K.validate(task), [], level.id + "/" + p.id);
    assert.equal(K.check(task, p.solution).ok, true, level.id + "/" + p.id);
  }
});

test("bo'sh yoki soxta yechim o'tmaydi", () => {
  for (const [level, p] of allProblems) {
    const task = R.vazifa(p);
    assert.equal(K.check(task, "   ").ok, false, level.id + "/" + p.id);
    // Faqat namunadagi javobni yozib qo'ygan yechim yashirin testda yiqiladi
    const cheat = p.namuna.out.map((line) => "print(" + JSON.stringify(line) + ")").join("\n");
    assert.equal(K.check(task, cheat).ok, false, level.id + "/" + p.id + ": namunani ko'chirgan yechim o'tdi");
  }
});

test("yashirin testlarning javoblari xilma-xil (bitta javobni qotirib yozish o'tmaydi)", () => {
  for (const [level, p] of allProblems) {
    const task = R.vazifa(p);
    const soni = {};
    for (const stdin of p.tests) {
      const javob = K.expectedFor(task, { stdin }).join("\n");
      soni[javob] = (soni[javob] || 0) + 1;
    }
    const xil = Object.keys(soni).length;
    // "ha/yo'q" masalalarida ikki xil javob tabiiy — lekin har biri kamida 2 marta uchrasin
    const kuchli = xil >= 3 || (xil === 2 && Object.values(soni).every((c) => c >= 2));
    assert.ok(kuchli, level.id + "/" + p.id + ": javoblar taqsimoti kuchsiz: " + JSON.stringify(soni).slice(0, 200));
    // Eng ko'p uchraydigan javobni yozib qo'ygan yechim 70% dan oshmasin (namuna bilan birga)
    const engKop = Math.max(...Object.values(soni));
    assert.ok(engKop / p.tests.length <= 0.7, level.id + "/" + p.id + ": bitta javob " + engKop + "/" + p.tests.length + " testda");
  }
});

test("qayta yozilgan masalalar: usulning o'zi tekshiriladi, dublikat yo'q", () => {
  const masala = (id) => R.vazifa(R.bittasi(id));
  // ikkilik-izlash: javob to'g'ri (bor/yo'q) bo'lsa ham, qaralgan o'rinlarsiz yoki chiziqli tartibda — o'tmaydi
  const oqi = "n = int(input())\na = []\nfor s in input().split():\n    a.append(int(s))\nx = int(input())\n";
  const iz = masala("ikkilik-izlash");
  assert.equal(K.check(iz, oqi + 'if x in a:\n    print("bor")\nelse:\n    print("yoʻq")').ok, false, "x in a o'tdi");
  const chiziqli = oqi + 'q = ""\ntopildi = False\nfor i in range(n):\n    if not topildi:\n        q = q + str(i + 1) + " "\n        if a[i] == x:\n            topildi = True\nprint(q)\nif topildi:\n    print("bor")\nelse:\n    print("yoʻq")';
  assert.equal(K.check(iz, chiziqli).ok, false, "chiziqli izlash o'tdi");
  // (bir-ikki kichik testda ikkilik izlash ham 1, 2, … tartibida qaraydi — tasodifiy mos kelish mumkin)
  const chiziqliBaho = BAHO.baho(iz, chiziqli);
  assert.ok(chiziqliBaho.otgan < chiziqliBaho.jami / 2, "chiziqli izlash " + chiziqliBaho.otgan + "/" + chiziqliBaho.jami + " testdan o'tdi");
  // k-kichik: sorted(a)[k - 1] endi yetmaydi — takrorlar bir marta sanaladi
  const kk = masala("k-kichik");
  assert.equal(K.check(kk, oqi.replace("x = int", "k = int") + "print(sorted(a)[k - 1])").ok, false, "sorted(a)[k - 1] o'tdi");
  // tanga-gerb: "aynan k" (jamoa-soni yechimi) endi o'tmaydi — masala "kamida k" ni so'raydi
  assert.equal(K.check(masala("tanga-gerb"), R.bittasi("jamoa-soni").solution).ok, false, "jamoa-soni yechimi tanga-gerb dan o'tdi");
  assert.notEqual(R.bittasi("tanga-gerb").solution, R.bittasi("jamoa-soni").solution);
});

test("maslahatlar yechimning o'zini aytib qo'ymaydi", () => {
  assert.ok(!R.bittasi("kaptarxona").hint.includes("// k"), "kaptarxona: formula maslahatda");
  assert.ok(!R.bittasi("unlilar").hint.includes('in "aeiou"'), "unlilar: yechim satri maslahatda");
  assert.ok(!/Evklid/.test(R.bittasi("ekub").hint), "ekub: usul nomi maslahatda");
  assert.ok(!R.bittasi("tubmi").hint.includes("d * d"), "tubmi: chegara maslahatda");
});

test("yechimlar faqat o'rgatilgan qismdan foydalanadi", () => {
  const taqiq = [/\bimport\b/, /\bclass\b/, /\blambda\b/, /f"/, /\.format\(/, /\bdict\b/, /\bset\(/, /\bmap\(/, /\bzip\(/, /\benumerate\(/];
  for (const [level, p] of allProblems) {
    for (const re of taqiq) {
      assert.ok(!re.test(p.solution), level.id + "/" + p.id + ": " + re);
    }
  }
});

// ---------- Samaradorlik sinovi ----------
// Umumiy qadam chegarasi 3 000 000 — unda O(n²) yechim ham o'tib ketadi. Shuning uchun samaradorlikni
// sinaydigan masalada `qadam: 200000` yoziladi: katta testda samarasiz yechim shu chegaraga uriladi.
// Bu yerdagi yechimlar TO'G'RI, faqat sekin — bola birinchi bo'lib aynan shunday yozadi.
const SAMARASIZ = {
  // har so'rovda oraliqni qaytadan qo'shadi: O(n·q)
  "oraliq-sorovlar": "n = int(input())\na = []\nfor t in input().split():\n    a.append(int(t))\nq = int(input())\nfor i in range(q):\n    t = input().split()\n    l = int(t[0])\n    r = int(t[1])\n    s = 0\n    for j in range(l - 1, r):\n        s += a[j]\n    print(s)",
  // har kuni hamma do'konni sanaydi: O(n·q)
  "ichimlik": "n = int(input())\na = []\nfor t in input().split():\n    a.append(int(t))\nq = int(input())\nfor i in range(q):\n    m = int(input())\n    soni = 0\n    for x in a:\n        if x <= m:\n            soni += 1\n    print(soni)",
  // har o'rin uchun ikki tomonni qaytadan qo'shadi: O(n²)
  "balans-nuqtasi": "n = int(input())\na = []\nfor t in input().split():\n    a.append(int(t))\njavob = -1\nfor i in range(n):\n    chap = 0\n    for j in range(i):\n        chap += a[j]\n    ong = 0\n    for j in range(i + 1, n):\n        ong += a[j]\n    if chap == ong and javob == -1:\n        javob = i + 1\nprint(javob)",
  // 1 dan boshlab sanab chiqadi: O(√n), n = 10¹⁸ da milliard qadam
  "kvadrat-ildiz": "n = int(input())\nx = 0\nwhile (x + 1) * (x + 1) <= n:\n    x += 1\nprint(x)",
  // har savol uchun uyumlarni boshidan sanaydi (chiziqli izlash): O(n·m)
  "cf-qurtlar": "n = int(input())\na = []\nfor s in input().split():\n    a.append(int(s))\nm = int(input())\nsavol = []\nfor s in input().split():\n    savol.append(int(s))\nfor q in savol:\n    jami = 0\n    i = 0\n    while jami < q:\n        jami += a[i]\n        i += 1\n    print(i)",
  // qatorni rostdan yasaydi: O(n), n = 10¹² da sig'maydi
  "juft-toq-orin": "s = input().split()\nn = int(s[0])\nk = int(s[1])\nqator = []\nfor i in range(1, n + 1):\n    if i % 2 == 1:\n        qator.append(i)\nfor i in range(1, n + 1):\n    if i % 2 == 0:\n        qator.append(i)\nprint(qator[k - 1])",
};

test("qadam chegarasi bor masalalar: namunali yechim sig'adi, samarasiz yechim yiqiladi", () => {
  const qadamli = allProblems.filter(([, p]) => p.qadam);
  assert.deepEqual(qadamli.map(([, p]) => p.id).sort(), Object.keys(SAMARASIZ).sort(),
    "qadam yozilgan har masala uchun samarasiz yechim sinovi bo'lishi kerak");
  for (const [level, p] of qadamli) {
    const where = level.id + "/" + p.id;
    assert.equal(p.qadam, 200000, where + ": qadam");
    const task = R.vazifa(p);
    assert.equal(task.qadam, p.qadam, where + ": vazifa() qadamni uzatmadi");
    // Namunali yechim tor chegarada ham hamma testdan o'tadi (baho.js xuddi shunday tekshiradi)
    const yaxshi = BAHO.baho(task, p.solution);
    assert.equal(yaxshi.toliq, true, where + ": namunali yechim " + yaxshi.foiz + "%");
    // Samarasiz yechim kichik testlardan o'tadi, katta testda esa qadam chegarasiga uriladi
    const yomon = BAHO.baho(task, SAMARASIZ[p.id]);
    assert.equal(yomon.toliq, false, where + ": samarasiz yechim o'tib ketdi (katta test kuchsiz)");
    const yiqilgan = yomon.testlar.filter((t) => !t.ok);
    assert.ok(yiqilgan.every((t) => t.error && t.error.type === "Limit"),
      where + ": samarasiz yechim noto'g'ri javob berdi — u faqat sekin bo'lishi kerak");
    assert.ok(yomon.otgan >= 1, where + ": samarasiz yechim kichik testlardan o'tishi kerak");
  }
});
