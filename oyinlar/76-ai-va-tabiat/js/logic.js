// 76-o'yin: AI va tabiat — chiqindi saralovchi model. Ma'lumot — belgilar jadvali (rang, shakl, yaltiroqlik) va yorliq;
// model — eng o'xshash qatorlar ovozi; aniqlik = to'g'ri ÷ jami; noxolis o'quv to'plami ta'siri ham shu yerda hisoblanadi.
// Ekransiz sof mantiq; Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  function aralash(list, r) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // Bir xil misol qaytarilmaydi (QOIDALAR 4.3): tarix prev orqali uzatiladi, generator sofligicha qoladi.
  // make null qaytarsa (shart bajarilmadi) — qayta urinadi.
  function pickNew(make, prev, r) {
    const tarix = prev ? (prev.tarix || []).concat(prev.id).slice(-40) : [];
    let zaxira = null;
    for (let k = 0; k < 800; k++) {
      const task = make(r);
      if (!task) continue;
      task.tarix = tarix;
      if (!tarix.includes(task.id)) return task;
      if (!prev || task.id !== prev.id) zaxira = task;
    }
    if (zaxira) return zaxira;
    throw new Error("Misol yasab boʻlmadi");
  }

  // ---------- Ma'lumot: buyumlar jadvali ----------
  const SINFLAR = ["plastik", "qogʻoz", "organik"];
  const BELGILAR = [
    { id: "rang", nom: "rang", qiymatlar: ["shaffof", "oq", "jigarrang", "rangli"] },
    { id: "shakl", nom: "shakl", qiymatlar: ["silindr", "yassi", "notekis"] },
    { id: "yaltiroq", nom: "yaltiroqlik", qiymatlar: ["yaltiroq", "xira"] },
  ];
  const BELGI_ID = BELGILAR.map((b) => b.id);
  // Modelga foydasi yo'q ustun (1-bosqich: belgi tanlash)
  const JOY = { id: "joy", nom: "topilgan joy", qiymatlar: ["hovli", "oshxona", "koʻcha"] };
  const DURANG = "ikkilanadi";

  // [id, nom, sinf, rang, shakl, yaltiroq, holat, chalkash (adashib qo'yilishi mumkin bo'lgan yorliq)]
  const KATALOG = [
    ["suv", "suv butilkasi", "plastik", "shaffof", "silindr", "yaltiroq", "butun"],
    ["shampun", "shampun idishi", "plastik", "rangli", "silindr", "yaltiroq", "butun"],
    ["qatiq", "qatiq stakani", "plastik", "oq", "silindr", "yaltiroq", "butun"],
    ["selofan", "selofan paket", "plastik", "shaffof", "yassi", "yaltiroq", "butun"],
    ["paket", "plastik paket", "plastik", "rangli", "yassi", "yaltiroq", "butun", "qogʻoz"],
    ["ezilgan-suv", "ezilgan suv butilkasi", "plastik", "shaffof", "notekis", "yaltiroq", "ezilgan"],
    ["ezilgan-shampun", "ezilgan shampun idishi", "plastik", "rangli", "notekis", "yaltiroq", "ezilgan"],
    ["ezilgan-qatiq", "ezilgan qatiq stakani", "plastik", "oq", "notekis", "yaltiroq", "ezilgan"],
    ["ezilgan-idish", "ezilgan moy idishi", "plastik", "shaffof", "notekis", "xira", "ezilgan"],
    ["gazeta", "gazeta", "qogʻoz", "oq", "yassi", "xira", "butun"],
    ["varaq", "daftar varagʻi", "qogʻoz", "oq", "yassi", "xira", "butun"],
    ["karton", "karton boʻlagi", "qogʻoz", "jigarrang", "yassi", "xira", "butun"],
    ["xalta", "qogʻoz xalta", "qogʻoz", "jigarrang", "yassi", "xira", "butun"],
    ["gijim", "gʻijimlangan qogʻoz", "qogʻoz", "oq", "notekis", "xira", "ezilgan", "organik"],
    ["jurnal", "jurnal muqovasi", "qogʻoz", "rangli", "yassi", "yaltiroq", "butun", "plastik"],
    ["qstakan", "qogʻoz stakan", "qogʻoz", "oq", "silindr", "xira", "butun", "plastik"],
    ["naycha", "karton naycha", "qogʻoz", "jigarrang", "silindr", "xira", "butun", "plastik"],
    ["banan", "banan poʻsti", "organik", "rangli", "notekis", "xira", "butun"],
    ["olma", "olma qoldigʻi", "organik", "rangli", "notekis", "xira", "butun"],
    ["choy", "choy shamasi", "organik", "jigarrang", "notekis", "xira", "butun"],
    ["non", "non boʻlagi", "organik", "jigarrang", "notekis", "xira", "butun"],
    ["barg", "daraxt bargi", "organik", "rangli", "yassi", "xira", "butun", "qogʻoz"],
    ["sabzi", "sabzi poʻchogʻi", "organik", "rangli", "yassi", "xira", "butun"],
    ["tuxum", "tuxum poʻchogʻi", "organik", "oq", "notekis", "xira", "butun", "plastik"],
    ["kartoshka", "kartoshka poʻchogʻi", "organik", "jigarrang", "notekis", "xira", "butun"],
  ].map(([id, nom, sinf, rang, shakl, yaltiroq, holat, chalkash]) => ({ id, nom, sinf, rang, shakl, yaltiroq, holat, chalkash: chalkash || null }));

  const buyum = (id) => KATALOG.find((x) => x.id === id);
  const buyumlar = (ids) => ids.map(buyum);
  const belgiYoz = (x) => BELGI_ID.map((b) => x[b]).join(", ");

  // ---------- Model ----------
  // Ikki buyum nechta belgida farq qiladi (0…3)
  function masofa(a, b, belgilar) {
    let d = 0;
    for (const k of belgilar || BELGI_ID) if (a[k] !== b[k]) d++;
    return d;
  }

  // Model javobi: eng o'xshash (eng kam farqli) qatorlar ovoz beradi; ovozlar teng bo'lsa — model ikkilanadi (sinf = null)
  function bashorat(x, toplam, belgilar) {
    const farqlar = toplam.map((q) => masofa(x, q, belgilar));
    const eng = Math.min(...farqlar);
    const yaqinlar = [];
    const ovozlar = {};
    farqlar.forEach((d, k) => {
      if (d !== eng) return;
      yaqinlar.push(k);
      ovozlar[toplam[k].sinf] = (ovozlar[toplam[k].sinf] || 0) + 1;
    });
    const tartib = Object.entries(ovozlar).sort((a, b) => b[1] - a[1]);
    const sinf = tartib.length === 1 || tartib[0][1] > tartib[1][1] ? tartib[0][0] : null;
    return { sinf, masofa: eng, farqlar, yaqinlar, ovozlar };
  }
  const javobYoz = (sinf) => sinf || DURANG;

  // Modelni sinov to'plamida tekshirish: natijalar, aniqlik, chalkashlik jadvali (asl → model javobi → soni)
  function baho(toplam, sinov, belgilar) {
    const jadval = {};
    for (const a of SINFLAR) {
      jadval[a] = {};
      for (const b of SINFLAR.concat(DURANG)) jadval[a][b] = 0;
    }
    let togri = 0;
    const natijalar = sinov.map((x) => {
      const model = javobYoz(bashorat(x, toplam, belgilar).sinf);
      jadval[x.sinf][model]++;
      if (model === x.sinf) togri++;
      return { buyum: x, asl: x.sinf, model, togri: model === x.sinf };
    });
    const jami = sinov.length;
    return { natijalar, togri, jami, foiz: jami ? Math.round((togri * 100) / jami) : 0, jadval };
  }

  // Natijalarni bitta belgi (masalan, shakl) qiymatlari bo'yicha guruhlash
  function guruhBaho(natijalar, belgi) {
    const b = BELGILAR.find((x) => x.id === belgi);
    return b.qiymatlar
      .map((qiymat) => {
        const g = natijalar.filter((n) => n.buyum[belgi] === qiymat);
        const togri = g.filter((n) => n.togri).length;
        return { qiymat, jami: g.length, togri, foiz: g.length ? Math.round((togri * 100) / g.length) : 0 };
      })
      .filter((g) => g.jami > 0);
  }

  // Bitta belgi yorliqni qanchalik ajratadi: qiymat bo'yicha guruhlab, har guruhdan eng ko'p uchragan yorliq olinadi
  function birBelgi(qatorlar, belgi) {
    const guruh = {};
    for (const q of qatorlar) {
      guruh[q[belgi]] = guruh[q[belgi]] || {};
      guruh[q[belgi]][q.sinf] = (guruh[q[belgi]][q.sinf] || 0) + 1;
    }
    return Object.values(guruh).reduce((s, g) => s + Math.max(...Object.values(g)), 0);
  }

  // ---------- Ko'rsatish qismlari uchun tayyor ma'lumot (natijalar hisob bilan chiqadi) ----------
  // 1-bosqich: bola yorliq qo'yadigan buyumlar
  const DEMO1 = ["suv", "gazeta", "banan", "jurnal", "ezilgan-suv"];

  // 2-bosqich: 10 ta belgilangan buyum — 6 tasi o'qitishga, 4 tasi testga
  const DEMO2 = { oquv: ["suv", "shampun", "gazeta", "karton", "banan", "choy"], test: ["qatiq", "varaq", "non", "jurnal"] };
  function demo2() {
    const oquv = buyumlar(DEMO2.oquv);
    const test = buyumlar(DEMO2.test);
    return { oquv, test, natija: baho(oquv, test), ozida: baho(oquv, oquv) };
  }

  // 3-bosqich: o'quv to'plamida plastik — faqat butun, silindr idishlar (organik — faqat notekis); testda ezilgan idishlar va barg ham bor
  const DEMO3 = {
    oquv: ["suv", "shampun", "qatiq", "gazeta", "varaq", "karton", "banan", "choy", "tuxum"],
    test: ["ezilgan-shampun", "ezilgan-qatiq", "xalta", "qstakan", "olma", "non", "kartoshka", "barg"],
    nomzodlar: ["selofan", "ezilgan-suv", "naycha", "sabzi"],
  };
  // qoshilgan — o'quv to'plamiga qo'shilgan nomzodlar id ro'yxati
  function demo3(qoshilgan) {
    const oquv = buyumlar(DEMO3.oquv.concat(qoshilgan || []));
    const test = buyumlar(DEMO3.test);
    const b = baho(oquv, test);
    const ezilgan = b.natijalar.filter((n) => n.buyum.holat === "ezilgan");
    return { oquv, test, nomzodlar: buyumlar(DEMO3.nomzodlar), natija: b, ezilganTogri: ezilgan.filter((n) => n.togri).length, ezilganJami: ezilgan.length };
  }
  // Nomzodlarning barcha to'plamlari ichida erishsa bo'ladigan eng yuqori aniqlik (to'g'ri javoblar soni)
  // Yakka o'zi qo'shilganda natijani yaxshilaydigan nomzodlar
  function demo3Foydali() {
    const asos = demo3([]).natija.togri;
    return DEMO3.nomzodlar.filter((id) => demo3([id]).natija.togri > asos);
  }
  function demo3Eng() {
    let eng = 0;
    const n = DEMO3.nomzodlar.length;
    for (let m = 0; m < 1 << n; m++) {
      const t = demo3(DEMO3.nomzodlar.filter((_, k) => m & (1 << k))).natija.togri;
      if (t > eng) eng = t;
    }
    return eng;
  }

  // ---------- 1-bosqich: belgilash va belgi tanlash ----------
  // Bitta qatorning yorlig'i xato. tier 0 — 4 qator; tier 1 — 6; tier 2 — 8 va xato "ishonarli" (yaltiroq qog'oz → plastik)
  function yorliqTask(prev, r, tier) {
    return pickNew((rr) => {
      const t = tier || 0;
      const soni = [4, 6, 8][t];
      const xatoBuyum = t === 2 ? pick(KATALOG.filter((x) => x.chalkash), rr) : pick(KATALOG, rr);
      const xatoYorliq = t === 2 ? xatoBuyum.chalkash : pick(SINFLAR.filter((s) => s !== xatoBuyum.sinf), rr);
      const qolgan = aralash(KATALOG.filter((x) => x.id !== xatoBuyum.id), rr).slice(0, soni - 1);
      const qatorlar = aralash([xatoBuyum].concat(qolgan), rr).map((x) => ({ buyum: x, yorliq: x.id === xatoBuyum.id ? xatoYorliq : x.sinf }));
      const javob = qatorlar.findIndex((q) => q.buyum.id === xatoBuyum.id);
      return {
        tur: "yorliq", id: `yorliq:${qatorlar.map((q) => q.buyum.id).join(",")}:${javob}:${xatoYorliq}`,
        qatorlar, variantlar: qatorlar.map((_, k) => k), javob,
        matn: "Jadvalni odam belgilagan, bitta qatorda yorliq xato. Qaysi qator?",
        ishora: "Har qatorda buyum nomi va belgilariga qara: u aslida qaysi materialdan?",
        nega: `«${xatoBuyum.nom}» — ${xatoBuyum.sinf}, ${xatoYorliq} emas. Xato yorliq modelni ham xatoga oʻrgatadi.`,
      };
    }, prev, r);
  }

  // Qaysi bitta belgi yorliqni eng yaxshi ajratadi? tier 0 — 6 qator, bitta belgi to'liq ajratadi; tier 1 — 8 qator; tier 2 — 8 qator, farq 1 ta
  function belgiTask(prev, r, tier) {
    return pickNew((rr) => {
      const t = tier || 0;
      const soni = t === 0 ? 6 : 8;
      const qatorlar = aralash(KATALOG, rr).slice(0, soni).map((x) => Object.assign({}, x, { joy: pick(JOY.qiymatlar, rr) }));
      if (new Set(qatorlar.map((q) => q.sinf)).size < 3) return null;
      const ustunlar = BELGILAR.concat([JOY]);
      const ballar = ustunlar.map((b) => ({ id: b.id, nom: b.nom, ball: birBelgi(qatorlar, b.id) }));
      const tartib = ballar.slice().sort((a, b) => b.ball - a.ball);
      const farq = tartib[0].ball - tartib[1].ball;
      if (farq < 1 || tartib[0].id === JOY.id) return null;
      if (t === 0 && (tartib[0].ball !== soni || farq < 2)) return null;
      if (t === 1 && farq < 2) return null;
      if (t === 2 && farq !== 1) return null;
      return {
        tur: "belgi", id: `belgi:${qatorlar.map((q) => q.id + q.joy[0]).join(",")}`,
        qatorlar, ballar, variantlar: ustunlar.map((b) => b.id), javob: tartib[0].id,
        matn: "Model faqat bitta ustunga qaray olsa, qaysi belgi yorliqni eng yaxshi ajratadi?",
        ishora: "Har ustun uchun tekshir: qiymati bir xil qatorlarning yorligʻi ham bir xilmi?",
        nega: "Toʻgʻri ajratilgan qatorlar: " + ballar.map((b) => `${b.nom} — ${b.ball}/${soni}`).join(", ") + ".",
      };
    }, prev, r);
  }

  // ---------- 2-bosqich: o'qitish, test, aniqlik ----------
  // Model yangi buyumga nima deydi? 4 variant: uch sinf va «ikkilanadi».
  // tier 0 — 5 qator, aynan o'xshash qator bor; tier 1 — 6 qator, eng yaqini 1 belgida farq qiladi; tier 2 — 7 qator, bir necha yaqin qator ovoz beradi
  function bashoratTask(prev, r, tier) {
    return pickNew((rr) => {
      const t = tier || 0;
      const hammasi = aralash(KATALOG, rr);
      const oquv = hammasi.slice(0, 5 + t);
      const yangi = hammasi[7];
      if (new Set(oquv.map((q) => q.sinf)).size < 3) return null;
      const b = bashorat(yangi, oquv);
      if (t === 0 && (b.masofa !== 0 || !b.sinf)) return null;
      if (t === 1 && (b.masofa !== 1 || !b.sinf)) return null;
      if (t === 2) {
        if (b.masofa === 0 || b.yaqinlar.length < 2 || Object.keys(b.ovozlar).length < 2) return null;
        // javoblar muvozanati: yarmi «ikkilanadi», yarmi ko'pchilik ovozi
        if ((rr() < 0.5) !== !b.sinf) return null;
      }
      const yorliqlar = b.yaqinlar.map((k) => oquv[k].sinf);
      return {
        tur: "bashorat", id: `bashorat:${oquv.map((q) => q.id).join(",")}:${belgiYoz(yangi)}`,
        oquv, yangi, variantlar: SINFLAR.concat(DURANG), javob: javobYoz(b.sinf), farqlar: b.farqlar, yaqinlar: b.yaqinlar, masofa: b.masofa,
        matn: "Oʻquv toʻplami va yangi buyum berilgan. Model eng oʻxshash qatorlarning yorligʻini aytadi. Javobi qanday?",
        ishora: "Har qator yangi buyumdan nechta belgida farq qilishini sana. Eng kam farqli qatorlar ovoz beradi; ovozlar teng boʻlsa — model ikkilanadi.",
        nega: `Eng kam farq — ${b.masofa} ta belgi: ${b.yaqinlar.map((k) => k + 1).join(", ")}-qator (${yorliqlar.join(", ")}). Model javobi: ${javobYoz(b.sinf)}.`,
      };
    }, prev, r);
  }

  // Tasodifiy o'quv to'plami bilan model va sinov natijalari
  function sinovYasa(rr, oquvSoni, testSoni, takror) {
    const hammasi = aralash(KATALOG, rr);
    const oquv = hammasi.slice(0, oquvSoni);
    const qolgan = hammasi.slice(oquvSoni);
    const test = takror ? Array.from({ length: testSoni }, () => pick(qolgan, rr)) : qolgan.slice(0, testSoni);
    return { oquv, test, b: baho(oquv, test) };
  }
  const natijaKalit = (b) => b.natijalar.map((n) => n.buyum.id.slice(0, 3) + n.model[0]).join("");

  // Aniqlik necha foiz? tier 0 — 4 yoki 5 ta natija; tier 1 — 10 ta; tier 2 — 20 ta buyumning chalkashlik jadvali
  function aniqlikTask(prev, r, tier) {
    return pickNew((rr) => {
      const t = tier || 0;
      const jami = t === 0 ? pick([4, 5], rr) : t === 1 ? 10 : 20;
      const s = sinovYasa(rr, int(rr, 6, 9), jami, t === 2);
      if (new Set(s.oquv.map((q) => q.sinf)).size < 3) return null;
      const b = s.b;
      if (b.togri === 0 || (t > 0 && b.togri === b.jami)) return null;
      return {
        tur: "aniqlik", id: `aniqlik:${t}:${natijaKalit(b)}`,
        oquv: s.oquv, natijalar: b.natijalar, jadval: b.jadval, togri: b.togri, jami: b.jami, javob: b.foiz,
        korinish: t === 2 ? "jadval" : "royxat",
        matn: t === 2
          ? `Model ${b.jami} ta buyumda sinaldi. Qator — asl yorliq, ustun — model javobi. Aniqlik necha foiz?`
          : "Test toʻplami: har buyumning asl yorligʻi va model javobi. Aniqlik necha foiz?",
        nega: t === 2
          ? "Toʻgʻri javoblar — asl yorliq va model javobi bir xil boʻlgan kataklar (diagonal). Ularni qoʻshib, jamiga boʻl."
          : "Asl yorliq va model javobi bir xil qatorlarni sana. Aniqlik = toʻgʻri ÷ jami. «Ikkilanadi» — toʻgʻri javob emas.",
        hisob: `${b.togri} ÷ ${b.jami} = ${b.foiz}%`,
      };
    }, prev, r);
  }

  // ---------- 3-bosqich: noxolis o'quv to'plami ----------
  // Noxolis to'plam: bitta sinfning bitta shakldagi buyumlari o'quv to'plamiga umuman kirmagan
  function noxolisToplam(rr, oquvSoni) {
    const sinf = pick(SINFLAR, rr);
    const shakllar = [...new Set(KATALOG.filter((x) => x.sinf === sinf).map((x) => x.shakl))];
    if (shakllar.length < 2) return null;
    const shakl = pick(shakllar, rr);
    const yoq = (x) => x.sinf === sinf && x.shakl === shakl;
    const mumkin = aralash(KATALOG.filter((x) => !yoq(x)), rr);
    // har sinfdan kamida ikkitadan
    const oquv = [];
    for (const s of SINFLAR) oquv.push(...mumkin.filter((x) => x.sinf === s).slice(0, 2));
    for (const x of mumkin) if (oquv.length < oquvSoni && !oquv.includes(x)) oquv.push(x);
    return { sinf, shakl, yoq, oquv: aralash(oquv, rr) };
  }

  // Natijalar shakl bo'yicha guruhlangan (5 + 5 + 10 = 20 ta buyum).
  // tier 0 — umumiy aniqlik; tier 1 — eng zaif guruh aniqligi; tier 2 — umumiy va eng zaif guruh orasidagi farq (foiz punkt)
  function guruhTask(prev, r, tier) {
    return pickNew((rr) => {
      const t = tier || 0;
      const n = noxolisToplam(rr, int(rr, 7, 9));
      if (!n) return null;
      const shakllar = BELGILAR[1].qiymatlar;
      const sonlar = aralash([5, 5, 10], rr);
      const test = [];
      shakllar.forEach((sh, k) => {
        const bor = KATALOG.filter((x) => x.shakl === sh && !n.oquv.includes(x));
        for (let i = 0; i < sonlar[k] && bor.length; i++) test.push(pick(bor, rr));
      });
      if (test.length !== 20) return null;
      const b = baho(n.oquv, test);
      const guruhlar = guruhBaho(b.natijalar, "shakl");
      const tartib = guruhlar.slice().sort((x, y) => x.foiz - y.foiz);
      if (tartib[0].foiz === tartib[1].foiz || b.togri === 0) return null;
      const zaif = tartib[0];
      const farq = b.foiz - zaif.foiz;
      if (farq < 10) return null;
      const yigindi = guruhlar.map((g) => g.togri).join(" + ");
      const javob = [b.foiz, zaif.foiz, farq][t];
      return {
        tur: "guruh", id: `guruh:${t}:${guruhlar.map((g) => `${g.qiymat[0]}${g.togri}/${g.jami}`).join(",")}`,
        oquv: n.oquv, natijalar: b.natijalar, guruhlar, zaif: zaif.qiymat, togri: b.togri, jami: b.jami, javob,
        matn: [
          "Model 20 ta buyumda sinaldi, natijalar shakl boʻyicha guruhlangan. Umumiy aniqlik necha foiz?",
          "Model 20 ta buyumda sinaldi, natijalar shakl boʻyicha guruhlangan. Eng zaif guruhda aniqlik necha foiz?",
          "Model 20 ta buyumda sinaldi. Umumiy aniqlik eng zaif guruh aniqligidan necha foiz punkt yuqori?",
        ][t],
        nega: [
          "Uchala guruhdagi toʻgʻri javoblarni qoʻsh va jami 20 ga boʻl.",
          "Har guruh uchun toʻgʻri ÷ jami ni alohida hisobla va eng kichigini ol.",
          "Avval umumiy aniqlikni (toʻgʻri ÷ 20), keyin eng zaif guruh aniqligini top; ayirmasi — javob.",
        ][t],
        hisob: [
          `(${yigindi}) ÷ ${b.jami} = ${b.foiz}%`,
          `«${zaif.qiymat}»: ${zaif.togri} ÷ ${zaif.jami} = ${zaif.foiz}%`,
          `Umumiy ${b.foiz}%, «${zaif.qiymat}» — ${zaif.foiz}%: ${b.foiz} − ${zaif.foiz} = ${farq}`,
        ][t],
        xulosa: `Umumiy son «${zaif.qiymat}» guruhidagi muammoni yashiradi.`,
      };
    }, prev, r);
  }

  // Qaysi buyumni o'quv to'plamiga qo'shsak, test aniqligi eng ko'p oshadi? 4 nomzod.
  // tier 0 — 6 o'quv / 6 test; tier 1 — 7 / 8; tier 2 — 8 / 10
  function tuzatTask(prev, r, tier) {
    return pickNew((rr) => {
      const t = tier || 0;
      const n = noxolisToplam(rr, 6 + t);
      if (!n) return null;
      const qolgan = aralash(KATALOG.filter((x) => !n.oquv.includes(x)), rr);
      const kam = qolgan.filter(n.yoq);
      if (kam.length < 2) return null;
      // yetishmayotgan guruhdan bittasi — nomzod, qolgani — testga
      const nomzodlar = aralash([kam[0]].concat(qolgan.filter((x) => !n.yoq(x)).slice(0, 3)), rr);
      const testSoni = [6, 8, 10][t];
      const test = aralash(kam.slice(1).concat(qolgan.filter((x) => !nomzodlar.includes(x) && !kam.includes(x))).slice(0, testSoni), rr);
      if (test.length < testSoni) return null;
      const asos = baho(n.oquv, test);
      const natijalar = nomzodlar.map((x) => baho(n.oquv.concat([x]), test).togri);
      const eng = Math.max(...natijalar);
      if (eng <= asos.togri || natijalar.filter((v) => v === eng).length !== 1) return null;
      const javob = natijalar.indexOf(eng);
      return {
        tur: "tuzat", id: `tuzat:${n.oquv.map((x) => x.id).join(",")}:${nomzodlar.map((x) => x.id).join(",")}`,
        oquv: n.oquv, test, nomzodlar, asos: asos.togri, jami: asos.jami, natijalar, xatolar: asos.natijalar.filter((x) => !x.togri),
        variantlar: nomzodlar.map((_, k) => k), javob,
        matn: `Model testda ${asos.togri}/${asos.jami} toʻgʻri topdi. Oʻquv toʻplamiga qaysi bitta buyumni qoʻshsak, aniqlik eng koʻp oshadi?`,
        ishora: "Xato chiqqan buyumlarning belgilariga qara: oʻquv toʻplamida shunday belgili va shu yorliqli qator bormi?",
        nega: `«${nomzodlar[javob].nom}» qoʻshilsa: ${asos.togri}/${asos.jami} → ${eng}/${asos.jami}. Model koʻrmagan turdagi buyum oʻquv toʻplamiga kirishi kerak.`,
      };
    }, prev, r);
  }

  const BOSQICH1 = [yorliqTask, belgiTask];
  const BOSQICH2 = [aniqlikTask, bashoratTask];
  const BOSQICH3 = [guruhTask, tuzatTask];
  const TUR = { yorliq: yorliqTask, belgi: belgiTask, aniqlik: aniqlikTask, bashorat: bashoratTask, guruh: guruhTask, tuzat: tuzatTask };

  // Mashq turlari navbat bilan: oldingi vazifa turidan keyingisi
  const navbat = (bank) => (prev, r, tier) => {
    const k = prev ? bank.indexOf(TUR[prev.tur]) : -1;
    return bank[(k + 1) % bank.length](prev, r, tier);
  };

  const api = {
    SINFLAR, BELGILAR, BELGI_ID, JOY, DURANG, KATALOG, DEMO1, DEMO2, DEMO3, BOSQICH1, BOSQICH2, BOSQICH3,
    buyum, buyumlar, belgiYoz, masofa, bashorat, javobYoz, baho, guruhBaho, birBelgi, demo2, demo3, demo3Eng, demo3Foydali, aralash,
    yorliqTask, belgiTask, aniqlikTask, bashoratTask, guruhTask, tuzatTask,
    bosqich1Task: navbat(BOSQICH1), bosqich2Task: navbat(BOSQICH2), bosqich3Task: navbat(BOSQICH3),
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
