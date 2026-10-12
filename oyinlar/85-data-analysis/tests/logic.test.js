// «Maʼlumot tahlili»: generatorlar — har tier da 30 ta har xil toʻgʻri misol, javoblar mustaqil qayta hisoblanadi.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const L = require("../js/logic.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

// Aynan `soni` ta HAR XIL misol yigʻilguncha (koʻpi bilan `chegara` urinish); ketma-ket ikki misol bir xil boʻlmasligi ham tekshiriladi.
function yigish(make, tier, soni, seed, chegara) {
  const r = rngFrom(seed || 85);
  const xil = new Map();
  let prev = null;
  for (let k = 0; k < (chegara || 600) && xil.size < soni; k++) {
    const t = make(prev, r, tier);
    if (prev) assert.notEqual(t.id, prev.id, "ketma-ket bir xil misol: " + t.id);
    xil.set(t.id, t);
    prev = t;
  }
  return [...xil.values()];
}
const TIERLAR = [0, 1, 2];

// ---------- Mustaqil hisob (logic.js funksiyalarisiz) ----------
const qosh = (a) => { let s = 0; for (const x of a) s += x; return s; };
const saralangan = (a) => [...a].sort((x, y) => x - y);
function med(a) {
  const s = saralangan(a);
  return s.length % 2 === 1 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function engKop(a) {
  const sanoq = {};
  for (const x of a) sanoq[x] = (sanoq[x] || 0) + 1;
  const eng = Math.max(...Object.values(sanoq));
  return Object.keys(sanoq).filter((k) => sanoq[k] === eng).map(Number);
}
function pirson(xs, ys) {
  const n = xs.length;
  const sx = qosh(xs), sy = qosh(ys);
  const sxy = qosh(xs.map((x, i) => x * ys[i]));
  const sxx = qosh(xs.map((x) => x * x)), syy = qosh(ys.map((y) => y * y));
  return (n * sxy - sx * sy) / Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy));
}

// Sonli javob: butun, manfiy emas, klaviaturaga sigʻadi; maslahat va yechim matni bor
function sonli(t) {
  assert.ok(Number.isInteger(t.javob) && t.javob >= 0 && t.javob <= 999, t.id + ": javob butun va 0…999");
  assert.ok(!t.variantlar, t.id);
  assert.ok(t.matn && t.nega && t.hisob && t.qisqa, t.id + ": matnlar bor");
  assert.ok(t.hisob.includes(String(t.javob)), t.id + ": yechimda javob bor");
}
function variantli(t) {
  assert.equal(t.variantlar.length, 4, t.id + ": 4 variant");
  assert.equal(new Set(t.variantlar).size, 4, t.id + ": variantlar takrorlanmaydi");
  assert.equal(t.variantlar.filter((v) => v === t.javob).length, 1, t.id + ": javob variantlar ichida");
  assert.ok(t.ishora && !t.ishora.includes(String(t.javob)), t.id + ": maslahat javobni aytmaydi");
  assert.ok(t.matn && t.nega && t.qisqa, t.id);
}

// ---------- 1-bosqich ----------
test("hisob funksiyalari", () => {
  assert.equal(L.ortacha([4, 5, 5, 5, 6]), 5);
  assert.equal(L.mediana([5, 4, 6, 5, 5]), 5);
  assert.equal(L.mediana([4, 5, 5, 5, 6, 35]), 5);
  assert.equal(L.mediana([1, 2, 3, 10]), 2.5);
  assert.deepEqual(L.modalar([3, 1, 3, 2, 2]), [2, 3]);
  assert.equal(L.oraliq([-5, 12, 0]), 17);
  assert.equal(L.ortacha([4, 5, 5, 5, 6, 35]), 10);
  assert.equal(L.son(-5), "−5");
  assert.equal(L.son("26.80"), "26,80");
  assert.equal(L.ulush(92, 90, 100), 0.2);
  assert.ok(Math.abs(L.korrelyatsiya([1, 2, 3], [2, 4, 6]) - 1) < 1e-9);
  assert.ok(Math.abs(L.korrelyatsiya([1, 2, 3, 4], [4, 1, 3, 2]) - pirson([1, 2, 3, 4], [4, 1, 3, 2])) < 1e-9);
});

test("oʻrtacha: har tier da 30 ta har xil misol; tier 0–1 butun, tier 2 — yaxlitlash aniq aytilgan", () => {
  for (const tier of TIERLAR) {
    const list = yigish(L.ortachaTask, tier, 30);
    assert.equal(list.length, 30, `tier ${tier}`);
    for (const t of list) {
      sonli(t);
      const aniq = qosh(t.toplam) / t.toplam.length;
      if (tier < 2) {
        assert.equal(aniq, t.javob, t.id);
        assert.doesNotMatch(t.matn, /yaxlitla/);
      } else {
        assert.ok(!Number.isInteger(aniq), t.id + ": butun chiqmaydi");
        const kasr = aniq - Math.floor(aniq);
        assert.ok(Math.abs(kasr - 0.5) > 0.01, t.id + ": aynan ,5 emas — yaxlitlash bir xil tushuniladi");
        assert.equal(t.javob, kasr < 0.5 ? Math.floor(aniq) : Math.floor(aniq) + 1, t.id);
        assert.match(t.matn, /eng yaqin butun songacha yaxlitla/);
        assert.ok(t.hisob.includes("≈"), t.id);
      }
      assert.ok(t.toplam.length >= 4 && t.toplam.length <= 7 && t.toplam.every((x) => Number.isInteger(x) && x > 0), t.id);
    }
  }
});

test("mediana: har tier da 30 ta har xil misol; javob butun, toʻplam tartiblanmagan", () => {
  for (const tier of TIERLAR) {
    const list = yigish(L.medianaTask, tier, 30);
    assert.equal(list.length, 30, `tier ${tier}`);
    for (const t of list) {
      sonli(t);
      assert.equal(t.javob, med(t.toplam), t.id);
      assert.notDeepEqual(t.toplam, saralangan(t.toplam), t.id + ": tayyor tartibda emas");
      assert.deepEqual(t.tartiblangan, saralangan(t.toplam));
      const n = t.toplam.length;
      assert.ok(tier === 0 ? n === 5 : tier === 1 ? n === 6 || n === 7 : n === 8, t.id);
    }
  }
});

test("moda: har tier da 30 ta har xil misol; moda yagona", () => {
  for (const tier of TIERLAR) {
    const list = yigish(L.modaTask, tier, 30);
    assert.equal(list.length, 30, `tier ${tier}`);
    for (const t of list) {
      sonli(t);
      assert.deepEqual(engKop(t.toplam), [t.javob], t.id + ": yagona moda");
      assert.equal(t.toplam.filter((x) => x === t.javob).length, t.marta, t.id);
      assert.equal(t.toplam.length, [6, 8, 10][tier], t.id);
    }
  }
});

test("oraliq: har tier da 30 ta har xil misol; tier 2 da manfiy sonlar bor, javob musbat", () => {
  for (const tier of TIERLAR) {
    const list = yigish(L.oraliqTask, tier, 30);
    assert.equal(list.length, 30, `tier ${tier}`);
    for (const t of list) {
      sonli(t);
      const s = saralangan(t.toplam);
      assert.equal(t.javob, s[s.length - 1] - s[0], t.id);
      assert.ok(t.javob >= 3, t.id);
      if (tier === 2) {
        assert.ok(s[0] < 0 && s[s.length - 1] > 0, t.id);
        assert.ok(t.hisob.includes("−"), t.id + ": manfiy son uzun minus bilan");
      } else assert.ok(s[0] > 0, t.id);
    }
  }
});

test("chetga chiqqan qiymat: har tier da 30 ta har xil misol; ikkala oʻrtacha ham butun", () => {
  for (const tier of TIERLAR) {
    const list = yigish(L.chetTask, tier, 30);
    assert.equal(list.length, 30, `tier ${tier}`);
    for (const t of list) {
      sonli(t);
      const s = saralangan(t.toplam);
      const chet = s[s.length - 1];
      const qolgan = s.slice(0, -1);
      assert.ok(chet >= 3 * qolgan[qolgan.length - 1], t.id + ": chet qiymat aniq ajralib turadi");
      const usiz = qosh(qolgan) / qolgan.length;
      const bilan = qosh(s) / s.length;
      assert.ok(Number.isInteger(usiz) && Number.isInteger(bilan), t.id);
      assert.equal(t.javob, [chet, usiz, bilan - usiz][tier], t.id);
      // Mediana chet qiymatdan deyarli oʻzgarmaydi — oʻrtacha esa kamida 5 ga oshadi
      assert.ok(bilan - usiz >= 5 && Math.abs(med(s) - med(qolgan)) <= 1, t.id);
    }
  }
});

// ---------- 2-bosqich ----------
function diagrammaToʻgʻri(t) {
  const d = t.diagramma;
  assert.ok(d.y1 > d.y0 && (d.y1 - d.y0) % d.qadam === 0, t.id + ": oʻq qadamga boʻlinadi");
  assert.ok((d.y1 - d.y0) / d.qadam <= 8, t.id + ": oʻq yozuvlari sigʻadi");
  assert.ok(d.oq, t.id + ": oʻq nomi bor");
  const ys = d.tur === "nuqta" ? d.nuqtalar.map((p) => p[1]) : d.qiymatlar;
  // Har qiymat oʻq ichida va chiziq ustida yoki ikki chiziqning aynan oʻrtasida — koʻz bilan oʻqib boʻladi
  for (const v of ys) {
    assert.ok(v >= d.y0 && v <= d.y1, t.id + ": qiymat oʻq ichida");
    assert.ok(Number.isInteger(((v - d.y0) * 2) / d.qadam), t.id + `: ${v} — chiziqda yoki yarim qadamda`);
  }
  if (d.tur !== "nuqta") {
    assert.equal(d.nomlar.length, d.qiymatlar.length, t.id);
    assert.equal(new Set(d.nomlar).size, d.nomlar.length, t.id);
    for (const n of d.nomlar) assert.ok(n.length <= 8, t.id + ": nom qisqa — 360 px ga sigʻadi");
  } else {
    assert.equal(new Set(d.nuqtalar.map((p) => p[0])).size, d.nuqtalar.length, t.id + ": har x da bitta nuqta");
    for (const p of d.nuqtalar) assert.ok(p[0] >= d.x0 && p[0] <= d.x1 && Number.isInteger((p[0] * 2) / d.xQadam), t.id);
  }
}

test("ustunli diagramma: har tier da 30 ta har xil misol; javob qiymatlardan qayta hisoblanadi", () => {
  for (const tier of TIERLAR) {
    const list = yigish(L.ustunTask, tier, 30);
    assert.equal(list.length, 30, `tier ${tier}`);
    for (const t of list) {
      sonli(t);
      diagrammaToʻgʻri(t);
      const d = t.diagramma;
      assert.equal(d.tur, "ustun");
      assert.equal(d.y0, 0, t.id + ": halol diagramma 0 dan boshlanadi");
      assert.equal(new Set(d.qiymatlar).size, d.qiymatlar.length, t.id + ": ustunlar har xil");
      if (tier === 0) {
        const nom = t.matn.match(/«([^»]+)»/)[1];
        assert.equal(t.javob, d.qiymatlar[d.nomlar.indexOf(nom)], t.id);
      } else if (tier === 1) {
        assert.equal(t.javob, Math.max(...d.qiymatlar) - Math.min(...d.qiymatlar), t.id);
      } else assert.equal(t.javob, qosh(d.qiymatlar) / d.qiymatlar.length, t.id);
    }
  }
});

test("chiziqli diagramma: har tier da 30 ta har xil misol; eng katta oʻsish va pasayish yagona", () => {
  for (const tier of TIERLAR) {
    const list = yigish(L.chiziqTask, tier, 30);
    assert.equal(list.length, 30, `tier ${tier}`);
    for (const t of list) {
      diagrammaToʻgʻri(t);
      const q = t.diagramma.qiymatlar;
      const farq = q.slice(1).map((v, i) => v - q[i]);
      assert.ok(farq.every((f) => f !== 0), t.id);
      if (tier === 0) {
        sonli(t);
        const i = Number(t.matn.match(/^(\d+)-nuqtada/)[1]);
        assert.equal(t.javob, q[i - 1], t.id);
      } else if (tier === 1) {
        variantli(t);
        const eng = Math.max(...farq);
        assert.equal(farq.filter((f) => f === eng).length, 1, t.id + ": eng katta oʻsish yagona");
        const i = farq.indexOf(eng);
        assert.equal(t.javob, `${i + 1} → ${i + 2}`, t.id);
      } else {
        sonli(t);
        const past = Math.min(...farq);
        assert.equal(farq.filter((f) => f === past).length, 1, t.id + ": eng katta pasayish yagona");
        assert.equal(t.javob, -past, t.id);
        assert.ok(t.javob > 0, t.id);
      }
    }
  }
});

// Mustaqil shakl aniqlash: Pirson koeffitsiyenti va "tepalik" shakliga oʻxshashlik
function shaklniTop(nuqtalar) {
  const xs = nuqtalar.map((p) => p[0]);
  const ys = nuqtalar.map((p) => p[1]);
  const r = pirson(xs, ys);
  if (r >= 0.6) return "musbat";
  if (r <= -0.6) return "manfiy";
  const tepa = pirson(xs.map((x) => -Math.pow(x - 5, 2)), ys);
  return tepa >= 0.85 ? "tepalik" : "yoq";
}

test("nuqtali diagramma: har tier da 30 ta har xil misol; bogʻliqlik turi Pirson koeffitsiyenti bilan tasdiqlanadi", () => {
  for (const tier of TIERLAR) {
    const list = yigish(L.nuqtaTask, tier, 30);
    assert.equal(list.length, 30, `tier ${tier}`);
    const uchragan = new Set();
    for (const t of list) {
      diagrammaToʻgʻri(t);
      const nuqtalar = t.diagramma.nuqtalar;
      if (tier === 0) {
        sonli(t);
        const x = Number(t.matn.match(/x = (\d+)/)[1]);
        assert.equal(t.javob, nuqtalar.find((p) => p[0] === x)[1], t.id);
      } else if (tier === 1) {
        sonli(t);
        const K = Number(t.matn.match(/qiymati (\d+) dan katta/)[1]);
        assert.ok(nuqtalar.every((p) => p[1] !== K), t.id + ": chegara ustida nuqta yoʻq");
        assert.equal(t.javob, nuqtalar.filter((p) => p[1] > K).length, t.id);
        assert.ok(t.javob >= 1, t.id);
      } else {
        variantli(t);
        assert.deepEqual(t.variantlar, Object.values(L.TREND));
        const shakl = shaklniTop(nuqtalar);
        uchragan.add(shakl);
        assert.equal(t.javob, L.TREND[shakl], t.id);
        const r = pirson(nuqtalar.map((p) => p[0]), nuqtalar.map((p) => p[1]));
        if (shakl === "musbat" || shakl === "manfiy") assert.ok(Math.abs(r) >= 0.8, t.id + ": bogʻliqlik kuchli");
        else assert.ok(Math.abs(r) <= 0.25, t.id + ": toʻgʻri chiziqli bogʻliqlik yoʻq");
      }
    }
    if (tier === 2) assert.equal(uchragan.size, 4, "toʻrt shakl ham uchraydi");
  }
});

test("aldamchi diagramma: har tier da 30 ta har xil misol; oʻq kesilgan, javob qiymatlardan qayta hisoblanadi", () => {
  for (const tier of TIERLAR) {
    const list = yigish(L.aldamchiTask, tier, 30);
    assert.equal(list.length, 30, `tier ${tier}`);
    for (const t of list) {
      sonli(t);
      diagrammaToʻgʻri(t);
      const d = t.diagramma;
      assert.ok(d.y0 > 0, t.id + ": oʻq 0 dan boshlanmagan");
      const [a, b] = d.qiymatlar;
      assert.ok(a > d.y0 && b > a && b <= d.y1, t.id);
      const korinish = (b - d.y0) / (a - d.y0);
      const haqiqiy = b / a;
      assert.ok(korinish >= 1.5 * haqiqiy, t.id + ": rasm haqiqatdan ancha kattaroq farq koʻrsatadi");
      if (tier === 0) assert.equal(t.javob, b - a, t.id);
      else if (tier === 1) assert.equal(t.javob, korinish, t.id);
      else assert.ok(Math.abs(t.javob - ((b - a) / a) * 100) < 1e-9, t.id);
      if (d.oq.includes("%")) assert.ok(b <= 100, t.id + ": foiz 100 dan oshmaydi");
      // Yechim oʻq qayerdan boshlanganini aytadi
      assert.ok(t.hisob.includes(String(d.y0)), t.id);
    }
  }
});

// ---------- 3-bosqich ----------
test("holatlar banki: toʻrt tushuntirish turi ham bor, har holatda izoh yoki omil", () => {
  const sanoq = {};
  for (const x of L.HOLATLAR) {
    sanoq[x.tur] = (sanoq[x.tur] || 0) + 1;
    assert.ok(L.TUSHUNTIRISH[x.tur], x.kalit);
    assert.ok(x.tur === "uchinchi" ? x.omil : x.izoh, x.kalit);
    if (x.tur === "sabab") assert.match(x.matn, /^Tajriba:/, x.kalit + ": sabab faqat tajriba bilan");
    if (x.tur === "teskari") assert.match(x.matn, /Daʼvo: «/, x.kalit);
  }
  assert.deepEqual(Object.keys(sanoq).sort(), ["sabab", "tasodif", "teskari", "uchinchi"]);
  for (const n of Object.values(sanoq)) assert.ok(n >= 4);
  assert.equal(new Set(L.HOLATLAR.map((x) => x.kalit)).size, L.HOLATLAR.length);
});

test("sabab: tier 0 da 30 ta har xil misol; tier 1–2 da bankdagi hamma holat chiqadi", () => {
  const bank = new Map(L.HOLATLAR.map((x) => [x.matn, x]));
  const list0 = yigish(L.sababTask, 0, 30);
  assert.equal(list0.length, 30);
  for (const t of list0) {
    variantli(t);
    const x = bank.get(t.holat);
    assert.equal(x.tur, "uchinchi", t.id);
    assert.equal(t.javob, x.omil, t.id);
    const omillar = new Set(L.HOLATLAR.filter((y) => y.tur === "uchinchi").map((y) => y.omil));
    assert.ok(t.variantlar.every((v) => omillar.has(v)), t.id);
  }
  for (const tier of [1, 2]) {
    // Qoʻlda yozilgan bank: har xil misollar soni = holatlar soni (18)
    const list = yigish(L.sababTask, tier, L.HOLATLAR.length, 85, 2000);
    assert.equal(list.length, L.HOLATLAR.length, `tier ${tier}`);
    for (const t of list) {
      variantli(t);
      assert.deepEqual(t.variantlar, Object.values(L.TUSHUNTIRISH));
      assert.equal(t.javob, L.TUSHUNTIRISH[bank.get(t.holat).tur], t.id);
    }
  }
});

test("xulosa: har tier da 30 ta har xil misol; javob — soʻralgan turdagi xulosa, sonlar matnga mos", () => {
  for (const tier of TIERLAR) {
    const list = yigish(L.xulosaTask, tier, 30);
    assert.equal(list.length, 30, `tier ${tier}`);
    const nishonlar = new Set();
    for (const t of list) {
      variantli(t);
      const s = L.SOROV.find((x) => x.kalit === t.sorov);
      assert.deepEqual(t.variantlar.slice().sort(), [s.togri, s.sabab, s.shaxs, s.umum].sort(), t.id);
      nishonlar.add(t.nishon);
      assert.equal(t.matn, L.XULOSA_SAVOL[t.nishon], t.id);
      // Soʻralgan tur — savol matnidan mustaqil aniqlanadi
      const tur = /haqiqatan kelib chiqadi/.test(t.matn) ? "togri" : /isbotsiz sabab/.test(t.matn) ? "sabab" : /har bir odamga/.test(t.matn) ? "shaxs" : "umum";
      assert.equal(t.javob, s[tur], t.id);
      // Sonlar matnda bor va «toʻgʻri» xulosadagi yoʻnalishga mos (a va b har xil)
      assert.notEqual(t.a, t.b, t.id);
      assert.ok(t.holat.includes(String(t.n)) && t.holat.includes(s.korsat(t.a)) && t.holat.includes(s.korsat(t.b)), t.id);
      const yuqori = /yuqoriroq|koʻproq vaqt/.test(s.togri); // birinchi guruh koʻrsatkichi kattaroq boʻlishi kerak
      assert.equal(t.a > t.b, yuqori, t.id + ": sonlar xulosa yoʻnalishiga mos");
      assert.match(s.sabab, /albatta/);
      assert.match(s.shaxs, /har bir/);
    }
    assert.deepEqual([...nishonlar].sort(), [["togri"], ["shaxs", "umum"], ["sabab", "shaxs", "togri", "umum"]][tier]);
  }
});

test("diagrammadan xulosa: har tier da 30 ta har xil misol; yoʻnalish Pirson koeffitsiyenti bilan tasdiqlanadi", () => {
  for (const tier of TIERLAR) {
    const list = yigish(L.diagXulosaTask, tier, 30);
    assert.equal(list.length, 30, `tier ${tier}`);
    const uchragan = new Set();
    for (const t of list) {
      variantli(t);
      diagrammaToʻgʻri(t);
      const p = t.diagramma.nuqtalar;
      const r = pirson(p.map((q) => q[0]), p.map((q) => q[1]));
      const shakl = r >= 0.6 ? "musbat" : r <= -0.6 ? "manfiy" : "yoq";
      uchragan.add(shakl);
      if (shakl === "yoq") assert.ok(Math.abs(r) <= 0.15, t.id + ": oraliq holat yoʻq (|r| ≤ 0,15 yoki ≥ 0,6)");
      const kalit = { musbat: /odatda (yuqoriroq|koʻproq)$/, manfiy: /odatda (pastroq|kamroq)$/, yoq: /bogʻliqlik koʻrinmaydi$/ }[shakl];
      assert.match(t.javob, kalit, t.id);
      assert.doesNotMatch(t.javob, /isbotlandi/, t.id + ": sabab daʼvosi hech qachon toʻgʻri javob emas");
      assert.equal(t.variantlar.filter((v) => /isbotlandi/.test(v)).length, 1, t.id);
      assert.match(t.holat, /Shartli maʼlumot/);
    }
    assert.equal(uchragan.size, 3, `tier ${tier}: uch yoʻnalish ham uchraydi`);
  }
});

// ---------- Bosqich navbati ----------
test("bosqich generatorlari: navbat aylanadi, har tier da 30 ta har xil misol", () => {
  const r = rngFrom(4);
  assert.deepEqual([0, 1, 3, 4].map((n) => L.bosqich1Task(null, r, 0, n).tur), ["ortacha", "mediana", "chet", "ortacha"]);
  assert.ok(["moda", "oraliq"].includes(L.bosqich1Task(null, r, 1, 2).tur));
  assert.deepEqual([0, 1, 2, 3, 4].map((n) => L.bosqich2Task(null, r, 1, n).tur), ["ustun", "chiziq", "aldamchi", "nuqta", "ustun"]);
  assert.deepEqual([0, 1, 2, 3].map((n) => L.bosqich3Task(null, r, 2, n).tur), ["sabab", "diagXulosa", "xulosa", "sabab"]);
  for (const make of [L.bosqich1Task, L.bosqich2Task, L.bosqich3Task]) {
    for (const tier of TIERLAR) {
      let n = 0;
      const list = yigish((prev, rng, t) => make(prev, rng, t, n++), tier, 30);
      assert.equal(list.length, 30);
      for (const t of list) {
        if (t.variantlar) variantli(t); else sonli(t);
      }
    }
  }
});

// ---------- Imlo va SVG ----------
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? walk(p) : e.name.endsWith(".js") ? [p] : [];
});

test("js fayllarida toʻgʻri apostrof (U+0027) yoʻq: oʻ gʻ — U+02BB, tutuq — U+02BC", () => {
  const TOGRI = String.fromCharCode(39);
  const fayllar = walk(path.join(__dirname, "..", "js")).concat(walk(__dirname));
  assert.ok(fayllar.length >= 8);
  for (const p of fayllar) {
    const src = fs.readFileSync(p, "utf8");
    const satr = src.split("\n").findIndex((s) => s.includes(TOGRI));
    assert.equal(satr, -1, `${path.basename(p)}: ${satr + 1}-satrda toʻgʻri apostrof`);
    assert.ok(!/[oOgG][‘’]/.test(src), path.basename(p) + ": oʻ/gʻ da U+2018/2019");
  }
});

test("SVG ichida matn yoʻq: diagramma va rasmlarda <text> ishlatilmaydi", () => {
  for (const p of walk(path.join(__dirname, "..", "js"))) {
    assert.ok(!/<text[\s>]|<tspan/.test(fs.readFileSync(p, "utf8")), path.basename(p));
  }
});
