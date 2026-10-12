// 74-o‘yin: AI loyiha sikli — besh bosqich (muammoni belgilash, ma‘lumot yig‘ish, ma‘lumotni o‘rganish,
// modellash, baholash): tartib va natijalar, ishni bosqichga ajratish, muvaffaqiyatsiz loyiha tashxisi.
// Ekransiz sof mantiq; Node da test qilinadi: tests/logic.test.js
// Generatorlar: (prev, rng, tier) — prev.tarix orqali bir mashq ichida misol takrorlanmaydi.
(function (root) {
  "use strict";

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const daraja = (t) => Math.max(0, Math.min(2, t | 0));

  function aralash(list, r) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // Aralashgan, lekin boshlang‘ich tartibda qolmagan
  function aralashTartib(list, r) {
    for (let k = 0; k < 20; k++) {
      const out = aralash(list, r);
      if (out.some((x, i) => x !== list[i])) return out;
    }
    return list.slice(1).concat(list[0]);
  }

  // Tarixda yo‘q misol; yasab bo‘lmasa — null
  function yangi(make, tarix, r) {
    for (let k = 0; k < 300; k++) {
      const task = make(r);
      if (task && !tarix.includes(task.id)) return task;
    }
    return null;
  }

  // turlar[tier] — yasovchilar ro‘yxati (r, tier) → misol. Turlar navbat bilan keladi; biri tugasa — keyingisi.
  function generator(turlar) {
    return function (prev, rng, tier) {
      const r = rng || Math.random;
      const t = daraja(tier);
      const list = turlar[t];
      const boshi = prev && typeof prev.navbat === "number" ? prev.navbat + 1 : 0;
      let tarix = prev && prev.tarix ? prev.tarix : [];
      for (let urinish = 0; urinish < 2; urinish++) {
        for (let i = 0; i < list.length; i++) {
          const idx = (boshi + i) % list.length;
          const task = yangi((rr) => list[idx](rr, t), tarix, r);
          if (task) {
            task.navbat = idx;
            task.tarix = tarix.concat(task.id);
            return task;
          }
        }
        tarix = prev ? [prev.id] : []; // hamma misol ishlatildi — boshidan, lekin ketma-ket takrorsiz
      }
      throw new Error("Misol yasab boʻlmadi");
    };
  }
  const bitta = (yasa) => generator([[yasa], [yasa], [yasa]]);

  // ================= Besh bosqich =================
  const BOSQICHLAR = [
    { k: "muammo", nom: "Muammoni belgilash", en: "problem scoping", qisqa: "Muammo" },
    { k: "yigish", nom: "Maʼlumot yigʻish", en: "data acquisition", qisqa: "Yigʻish" },
    { k: "organish", nom: "Maʼlumotni oʻrganish", en: "data exploration", qisqa: "Oʻrganish" },
    { k: "model", nom: "Modellash", en: "modelling", qisqa: "Modellash" },
    { k: "baho", nom: "Baholash", en: "evaluation", qisqa: "Baholash" },
  ];
  const KALITLAR = BOSQICHLAR.map((b) => b.k);
  const NOMLAR = BOSQICHLAR.map((b) => b.nom);
  const nom = (k) => BOSQICHLAR[KALITLAR.indexOf(k)].nom;

  // Olti loyiha; har birida besh ish — har bosqichga bittadan (tartib BOSQICHLAR bilan bir xil)
  const LOYIHALAR = [
    { k: "oshxona", nom: "Oshxona: ertaga nechta tushlik kerak", ishlar: [
      "Savolni aniqlash: ertangi tushliklar sonini koʻpi bilan 10 ta xato bilan bashorat qilish",
      "Oʻtgan yil har kuni nechta tushlik sotilganini oshxona daftaridan koʻchirish",
      "Sotuv haftaning kuniga qarab qanday oʻzgarishini diagrammada koʻrish",
      "Sotuv jadvalida bashorat modelini oʻqitish",
      "Modelni oʻtgan oyning u koʻrmagan kunlarida sinab, xatosini oʻlchash",
    ] },
    { k: "barg", nom: "Barg suratidan oʻsimlik kasalligini aniqlash", ishlar: [
      "Kim foydalanishini yozish: fermer bargni suratga oladi, javob — «sogʻlom» yoki «kasal»",
      "Daladan sogʻlom va kasal barglarning 2 000 ta suratini olish va belgilash",
      "Suratlarni koʻzdan kechirish: har sinfdan nechta, xira yoki takror suratlar bormi",
      "Belgilangan suratlarda tasniflash modelini oʻqitish",
      "Modelni oʻqitishda qatnashmagan 400 ta suratda tekshirish",
    ] },
    { k: "kutubxona", nom: "Kutubxona: oʻquvchiga kitob tavsiya qilish", ishlar: [
      "Maqsadni kelishish: tavsiya qilingan har 10 kitobdan kamida 3 tasi olinsin",
      "Kutubxona jurnalidan kim qaysi kitobni olganini (ismsiz) jadvalga yigʻish",
      "Jadvaldan qaysi janrlar koʻp olinishini va boʻsh qatorlarni qidirish",
      "Oʻxshash oʻquvchilar olgan kitoblar asosida tavsiya modelini qurish",
      "Bir oy davomida tavsiyalarning nechtasi haqiqatan olinganini sanash",
    ] },
    { k: "spam", nom: "Maktab pochtasi uchun spam filtri", ishlar: [
      "Nima spam hisoblanishini va qaysi xato qimmatroqligini oʻqituvchilar bilan kelishish",
      "5 000 ta eski xatni toʻplab, har birini «spam» yoki «oddiy» deb belgilash",
      "Spam xatlarda qaysi soʻzlar koʻp uchrashini sanab koʻrish",
      "Belgilangan xatlarda spam tasniflagichini oʻqitish",
      "Filtrni yangi 500 ta xatda sinab, nechta oddiy xat spamga tushganini sanash",
    ] },
    { k: "chiqindi", nom: "Chiqindini saralash: plastik, qogʻoz, organik", ishlar: [
      "Vazifani toraytirish: kamera faqat uch turni ajratadi — plastik, qogʻoz, organik",
      "Har tur chiqindidan turli yorugʻlikda suratlar olish",
      "Suratlar orasida ezilgan va iflos buyumlar yetarlimi — koʻrib chiqish",
      "Suratlar toʻplamida uch sinfli modelni oʻqitish",
      "Modelni oshxonadagi haqiqiy chiqindi qutisi oldida sinash",
    ] },
    { k: "avtobus", nom: "Avtobus kelish vaqtini bashorat qilish", ishlar: [
      "Aniqlik talabini belgilash: bashorat 2 daqiqadan koʻp adashmasin",
      "Avtobuslarning GPS yozuvlarini uch oy davomida toʻplash",
      "Kechikishlar soat va ob-havoga bogʻliqligini grafikda koʻrish",
      "GPS yozuvlari asosida kelish vaqtini bashorat qiluvchi modelni oʻqitish",
      "Bashoratni keyingi haftadagi haqiqiy kelish vaqtlari bilan solishtirish",
    ] },
  ];

  // Qo‘shimcha ishlar — bosqichi kamroq ko‘zga tashlanadi (tier 2)
  const QOSHIMCHA = [
    { b: "muammo", matn: "Loyihadan kim foyda koʻrishini va kimga zarar yetishi mumkinligini oldindan yozib chiqish" },
    { b: "muammo", matn: "Muvaffaqiyat mezonini kelishish: aniqlik kamida 90 % boʻlsin" },
    { b: "yigish", matn: "Oʻquvchilar va ota-onalardan maʼlumotni ishlatishga rozilik olish" },
    { b: "yigish", matn: "Ochiq manbadagi tayyor toʻplamni yuklab, undan foydalanish shartlarini tekshirish" },
    { b: "yigish", matn: "Kam uchraydigan sinf uchun qoʻshimcha 300 ta misol toʻplash" },
    { b: "organish", matn: "Jadvalda nechta boʻsh katak va takror qator borligini sanash" },
    { b: "organish", matn: "Ikki ustun orasidagi bogʻliqlikni nuqtali diagrammada koʻrish" },
    { b: "organish", matn: "Har sinfda nechta misol borligini ustunli diagrammada solishtirish" },
    { b: "model", matn: "Ikki xil algoritmni oʻquv toʻplamida oʻqitib koʻrish" },
    { b: "model", matn: "Modelning sozlamalarini oʻzgartirib, uni qayta oʻqitish" },
    { b: "baho", matn: "Model qaysi guruh uchun koʻproq adashishini alohida hisoblash (noxolislikni tekshirish)" },
    { b: "baho", matn: "Model xatolarini turlarga ajratish: qaysi sinfni qaysi biri bilan adashtiradi" },
  ];

  // Hamma ishlar bitta ro‘yxatda: { matn, b, loyiha | null }
  const ISHLAR = [];
  LOYIHALAR.forEach((l) => l.ishlar.forEach((matn, i) => ISHLAR.push({ matn, b: KALITLAR[i], loyiha: l.k })));
  QOSHIMCHA.forEach((x) => ISHLAR.push({ matn: x.matn, b: x.b, loyiha: null }));

  // ================= 1-bosqich: tartib va natijalar =================
  const NATIJALAR = [
    { b: "muammo", matn: "Aniq savol va muvaffaqiyat mezoni" },
    { b: "muammo", matn: "Kimga, nima uchun va qayerda kerakligi yozilgan tavsif" },
    { b: "muammo", matn: "Loyiha chegarasi: nima qilinadi va nima qilinmaydi" },
    { b: "yigish", matn: "Belgilangan misollar toʻplami" },
    { b: "yigish", matn: "Manbalari yozib qoʻyilgan xom jadval" },
    { b: "yigish", matn: "Ruxsat bilan toʻplangan suratlar papkasi" },
    { b: "organish", matn: "Diagrammalar va topilgan boʻsh kataklar roʻyxati" },
    { b: "organish", matn: "Sinflar nomutanosibligi haqidagi xulosa" },
    { b: "organish", matn: "Qaysi belgilar foydali ekani haqidagi taxminlar" },
    { b: "model", matn: "Oʻqitilgan model" },
    { b: "model", matn: "Tanlangan algoritm va uning sozlamalari" },
    { b: "model", matn: "Oʻquv toʻplamidan topilgan qoida" },
    { b: "baho", matn: "Yangi misollardagi aniqlik koʻrsatkichi" },
    { b: "baho", matn: "Model qayerda adashishi haqidagi hisobot" },
    { b: "baho", matn: "Qaror: ishga tushirish yoki oldingi bosqichga qaytish" },
  ];

  // To‘g‘ri bosqich + uchta boshqasi, sikl tartibida
  function tortBosqich(r, togri) {
    const boshqa = aralash(KALITLAR.filter((k) => k !== togri), r).slice(0, 3);
    return KALITLAR.filter((k) => k === togri || boshqa.includes(k)).map(nom);
  }

  // Natija qaysi bosqichniki
  function natijaYasa(r) {
    const x = pick(NATIJALAR, r);
    return {
      tur: "natija", id: `natija:${NATIJALAR.indexOf(x)}`, natija: x.matn,
      matn: "Bu qaysi bosqichning natijasi?",
      variantlar: tortBosqich(r, x.b), javob: nom(x.b),
      ishora: "Natija nima: savolmi, xom maʼlumotmi, maʼlumot haqidagi xulosami, modelmi yoki model bahosimi?",
      nega: `«${x.matn}» — «${nom(x.b)}» bosqichida hosil boʻladi.`,
    };
  }

  // Qo‘shni bosqich: keyin yoki oldin
  function keyingiYasa(r) {
    const keyin = r() < 0.5;
    const i = keyin ? int(r, 0, 3) : int(r, 1, 4);
    const javob = NOMLAR[keyin ? i + 1 : i - 1];
    return {
      tur: "keyingi", id: `keyingi:${keyin ? "k" : "o"}:${i}`, bosqich: KALITLAR[i], keyin,
      matn: keyin ? `«${NOMLAR[i]}» tugadi. Bevosita keyingi bosqich qaysi?` : `«${NOMLAR[i]}» boshlanishi uchun bevosita undan oldin qaysi bosqich tugashi kerak?`,
      variantlar: NOMLAR.filter((_, k) => k !== i), javob,
      ishora: "Har bosqich oldingisining natijasiga tayanadi: savol → maʼlumot → xulosa → model → baho.",
      nega: `Tartib: ${NOMLAR.map((n) => n.toLowerCase()).join(" → ")}.`,
    };
  }

  const HARFLAR = ["A", "B", "C", "D", "E"];
  const yoz = (harflar) => harflar.join(" → ");

  // Loyiha ishlari aralash yozilgan — qaysi tartib siklga mos. tier 0 — 3 ish, 1 — 4 ish, 2 — 5 ish
  function tartibYasa(r, t) {
    const loyiha = pick(LOYIHALAR, r);
    const soni = t + 3;
    const tanlangan = aralash([0, 1, 2, 3, 4], r).slice(0, soni).sort((a, b) => a - b); // sikl tartibida
    const korinish = aralashTartib(tanlangan, r); // ekrandagi tartib: A, B, C…
    const ishlar = korinish.map((i, k) => ({ harf: HARFLAR[k], matn: loyiha.ishlar[i], b: KALITLAR[i] }));
    const togri = tanlangan.map((i) => HARFLAR[korinish.indexOf(i)]);
    const almash = togri.slice();
    const j = int(r, 0, soni - 2);
    [almash[j], almash[j + 1]] = [almash[j + 1], almash[j]];
    const nomzod = [yoz(togri), yoz(almash), yoz(togri.slice().reverse()), yoz(HARFLAR.slice(0, soni))];
    for (let k = 0; k < 20 && new Set(nomzod).size < 4; k++) nomzod.push(yoz(aralash(togri, r)));
    const variantlar = [...new Set(nomzod)].slice(0, 4);
    if (variantlar.length < 4) return null;
    return {
      tur: "tartib", id: `tartib:${loyiha.k}:${korinish.join("")}`, loyiha: loyiha.nom, ishlar,
      matn: `Loyiha: ${loyiha.nom}. Ishlar aralash yozilgan. Qaysi tartib loyiha sikliga mos?`,
      variantlar: aralash(variantlar, r), javob: yoz(togri),
      ishora: "Qaysi ish qaysi biriga tayanadi? Oʻqitishdan oldin maʼlumot, sinashdan oldin model tayyor boʻlishi shart.",
      nega: tanlangan.map((i) => `${HARFLAR[korinish.indexOf(i)]} — ${NOMLAR[i].toLowerCase()}`).join("; ") + ".",
    };
  }

  const USIZ = {
    muammo: "Aniq savol va mezon boʻlmasa, qolgan ishlar nimaga xizmat qilishi nomaʼlum.",
    yigish: "Maʼlumot yigʻilmasa, oʻrganadigan ham, oʻqitadigan ham narsa yoʻq.",
    organish: "Maʼlumot koʻrib chiqilmasa, undagi xato va nomutanosiblik modelga oʻtadi.",
    model: "Model qurilmagan — baholaydigan narsa yoʻq.",
    baho: "Sinovsiz model qanchalik adashishini hech kim bilmaydi.",
  };

  // Rejada to‘rt ish bor — qaysi bosqich tushib qolgan
  function etishmaydiYasa(r) {
    const loyiha = pick(LOYIHALAR, r);
    const yoq = int(r, 0, 4);
    const ishlar = loyiha.ishlar.map((matn, i) => ({ matn, b: KALITLAR[i] })).filter((_, i) => i !== yoq)
      .map((x, k) => ({ harf: String(k + 1), matn: x.matn, b: x.b }));
    return {
      tur: "etishmaydi", id: `etishmaydi:${loyiha.k}:${yoq}`, loyiha: loyiha.nom, ishlar,
      matn: `Loyiha rejasi: ${loyiha.nom}. Rejada toʻrt ish bor. Qaysi bosqich tushib qolgan?`,
      variantlar: NOMLAR.slice(), javob: NOMLAR[yoq],
      ishora: "Har ishning bosqichini aniqla va besh bosqichni sanab chiq: qaysi biriga ish yoʻq?",
      nega: USIZ[KALITLAR[yoq]],
    };
  }

  // ================= 2-bosqich: ish qaysi bosqichga tegishli =================
  // tier 0 — loyiha ishlari, tier 1 — hammasi, tier 2 — qo‘shimcha (kamroq ko‘zga tashlanadigan) ishlar
  function ishYasa(r, t) {
    const bank = ISHLAR.filter((x) => (t === 0 ? x.loyiha : t === 2 ? !x.loyiha : true));
    const x = pick(bank, r);
    return {
      tur: "ish", id: `ish:${ISHLAR.indexOf(x)}`, ish: x.matn,
      matn: "Bu ish loyiha siklining qaysi bosqichiga tegishli?",
      variantlar: NOMLAR.slice(), javob: nom(x.b),
      ishora: "Ishdan nima hosil boʻladi: savolmi, yangi maʼlumotmi, maʼlumot haqidagi xulosami, modelmi yoki model bahosimi?",
      nega: `Bu — «${nom(x.b)}» bosqichi.`,
    };
  }

  // Bosqich berilgan — to‘rt ishdan qaysi biri shu bosqichniki.
  // tier 0 — ishlar har xil loyihadan; tier 1, 2 — to‘rttasi ham bitta loyihadan
  function bosqichIshiYasa(r, t) {
    const b = pick(KALITLAR, r);
    let togri;
    let boshqa;
    if (t === 0) {
      togri = pick(ISHLAR.filter((x) => x.loyiha && x.b === b), r);
      boshqa = aralash(KALITLAR.filter((k) => k !== b), r).slice(0, 3).map((k) => pick(ISHLAR.filter((x) => x.loyiha && x.b === k), r));
    } else {
      const loyiha = pick(LOYIHALAR, r);
      const ozi = ISHLAR.filter((x) => x.loyiha === loyiha.k);
      togri = ozi.find((x) => x.b === b);
      boshqa = aralash(ozi.filter((x) => x.b !== b), r).slice(0, 3);
    }
    const kalit = boshqa.map((x) => ISHLAR.indexOf(x)).sort((a, c) => a - c).join(",");
    return {
      tur: "bosqichIshi", id: `bosqichIshi:${ISHLAR.indexOf(togri)}:${kalit}`, bosqich: b,
      matn: `Qaysi ish «${nom(b)}» bosqichiga tegishli?`,
      variantlar: aralash([togri].concat(boshqa).map((x) => x.matn), r), javob: togri.matn,
      ishora: {
        muammo: "Bu bosqichda hali maʼlumot ham, model ham yoʻq — faqat savol, maqsad va mezon.",
        yigish: "Bu bosqichda yangi maʼlumot paydo boʻladi: oʻlchanadi, yoziladi, suratga olinadi.",
        organish: "Bu bosqichda bor maʼlumotga qaraladi: sanaladi, diagramma chiziladi, xato qidiriladi.",
        model: "Bu bosqichda maʼlumotdan qoida chiqaradigan model tanlanadi va oʻqitiladi.",
        baho: "Bu bosqichda tayyor model u koʻrmagan misollarda sinaladi.",
      }[b],
      nega: `Qolgan uch ish — boshqa bosqichlar: ${boshqa.map((x) => nom(x.b).toLowerCase()).join(", ")}.`,
    };
  }

  // Ish daftari: besh qator, so‘ralgan bosqichga ikki qator to‘g‘ri keladi — soatlar yig‘indisi
  function soatYasa(r) {
    const loyiha = pick(LOYIHALAR, r);
    const b = pick(KALITLAR, r);
    const qoshimcha = pick(QOSHIMCHA.filter((x) => x.b === b), r);
    const tashlanadi = pick(KALITLAR.filter((k) => k !== b), r);
    const qatorlar = aralash(
      loyiha.ishlar.map((matn, i) => ({ matn, b: KALITLAR[i] })).filter((x) => x.b !== tashlanadi).concat([{ matn: qoshimcha.matn, b }]), r,
    ).map((x) => ({ matn: x.matn, b: x.b, soat: int(r, 2, 9) }));
    const mos = qatorlar.filter((x) => x.b === b);
    const javob = mos.reduce((s, x) => s + x.soat, 0);
    return {
      tur: "soat", id: `soat:${loyiha.k}:${b}:${QOSHIMCHA.indexOf(qoshimcha)}:${qatorlar.map((x) => x.b[0] + x.soat).join("")}`,
      loyiha: loyiha.nom, bosqich: b, qatorlar, javob,
      matn: `Jamoaning ish daftari (${loyiha.nom}). «${nom(b)}» bosqichiga jami necha soat ketgan?`,
      nega: "Avval har qatorning bosqichini aniqla. Shu bosqichga bir nechta qator toʻgʻri kelishi mumkin.",
      hisob: `${mos.map((x) => x.soat).join(" + ")} = ${javob} soat.`,
    };
  }

  // ================= 3-bosqich: muvaffaqiyatsiz loyiha tashxisi =================
  const TASHXISLAR = [
    { b: "muammo", d: 0, matn: "Jamoa «AI bilan maktabni yaxshilaymiz» deb ish boshladi. Uch oydan keyin ham model nimani bashorat qilishi kerakligi kelishilmagan.", nega: "Aniq savol va mezon yoʻq — xato eng birinchi bosqichda." },
    { b: "muammo", d: 1, matn: "Model darsga kechikishni 95 % aniqlik bilan bashorat qiladi. Maktabga esa kechikish emas, dars qoldirish sabablari kerak edi.", nega: "Model yaxshi ishlaydi, lekin notoʻgʻri savolga javob beradi." },
    { b: "muammo", d: 1, matn: "Ilova tayyor boʻlgach maʼlum boʻldi: fermerlar dalada internetsiz ishlaydi, ilova esa faqat internet bilan ochiladi.", nega: "Kim va qayerda foydalanishi boshida aniqlanmagan." },
    { b: "muammo", d: 2, matn: "Tavsiya tizimi eng koʻp bosiladigan videolarni chiqaradi va bosishlar soni oshdi. Maqsad esa oʻquvchilar foydali darslarni koʻproq koʻrishi edi.", nega: "Mezon notoʻgʻri tanlangan: «bosish» — «foyda» degani emas." },

    { b: "yigish", d: 0, matn: "Barg kasalligi modeli uchun atigi 30 ta surat toʻplandi. Model yangi suratlarda deyarli tasodifiy javob beradi.", nega: "Misollar juda kam." },
    { b: "yigish", d: 0, matn: "Yuzni tanish modeli uchun faqat bitta sinf oʻquvchilari suratga olindi. Boshqa yoshdagi odamlarda model koʻp adashadi.", nega: "Toʻplam bir tomonlama: boshqa guruhlar unda yoʻq. Bu noxolislik (bias) manbai." },
    { b: "yigish", d: 1, matn: "Chiqindi saralovchi uchun faqat toza va butun butilkalar suratga olingan. Ezilgan butilkani model tanimaydi.", nega: "Toʻplam haqiqiy hayotdagi holatlarni qamramagan." },
    { b: "yigish", d: 1, matn: "Jamoa oʻquvchilarning suratlarini ijtimoiy tarmoqdan ruxsatsiz koʻchirib oldi. Loyihani toʻxtatishga toʻgʻri keldi.", nega: "Maʼlumot rozilik bilan toʻplanishi shart — maxfiylik buzilgan." },
    { b: "yigish", d: 2, matn: "Ovozli yordamchi studiyadagi nutqni yaxshi tushunadi, shovqinli sinfda esa yoʻq. Yozuvlarning hammasi jim xonada olingan edi.", nega: "Maʼlumot foydalanish sharoitiga oʻxshamaydi." },

    { b: "organish", d: 0, matn: "Jadvalda oʻquvchi yoshi 250 deb yozilgan qatorlar bor edi. Jadvalni hech kim koʻrib chiqmadi, model shu xatolar bilan oʻqitildi.", nega: "Imkonsiz qiymatlar maʼlumotni oʻrganishda topiladi." },
    { b: "organish", d: 1, matn: "Maʼlumot toʻplandi va darhol oʻqitishga berildi. Keyin maʼlum boʻldi: 1 000 suratning 950 tasi «sogʻlom» — buni hech kim sanab koʻrmagan.", nega: "Sinflar nomutanosibligi oddiy sanoqda koʻrinardi — bu bosqich tashlab ketilgan." },
    { b: "organish", d: 1, matn: "Sana ustunida «05.03», «3-may» va «May 3» aralash yozilgan. Jadvalni hech kim tekshirmagani uchun model sanani tushunmadi.", nega: "Har xil yozuvlar maʼlumotni koʻzdan kechirishda topiladi." },
    { b: "organish", d: 2, matn: "Suratlarning yarmi ikki martadan takrorlangani oʻqitishdan keyin maʼlum boʻldi. Toʻplam yigʻilgan, lekin koʻzdan kechirilmagan edi.", nega: "Takrorlar maʼlumotni oʻrganishda topiladi." },

    { b: "model", d: 0, matn: "Uy narxini — sonni — bashorat qilish kerak edi. Jamoa esa faqat «ha» yoki «yoʻq» deb javob beradigan model tanladi.", nega: "Model turi vazifaga mos emas." },
    { b: "model", d: 1, matn: "Maʼlumot toza va yetarli. Jamoa oʻqitishni ikki daqiqada toʻxtatdi: model hatto oʻquv misollarining yarmida adashadi.", nega: "Model yetarlicha oʻqitilmagan." },
    { b: "model", d: 2, matn: "Maʼlumot toza va yetarli. Model oʻquv misollarini yodlab olgan: ularda 100 %, yangi misollarda 55 %.", nega: "Model qonuniyatni emas, misollarni yodlagan — uni soddalashtirib, qayta oʻqitish kerak." },
    { b: "model", d: 2, matn: "Suratda obyekt joyini topish kerak edi. Jamoa esa butun rasmga bitta yorliq beradigan tasniflash modelini oʻqitdi.", nega: "Tanlangan model turi vazifaga mos emas." },

    { b: "baho", d: 0, matn: "Model oʻqitildi va oʻsha kuni ishga tushirildi. Uni hech kim yangi misollarda sinamagan; foydalanuvchilar xatolardan shikoyat qilmoqda.", nega: "Sinov umuman oʻtkazilmagan." },
    { b: "baho", d: 0, matn: "Jamoa «aniqlik 100 %» deb eʼlon qildi. Model oʻzi oʻqitilgan misollarning aynan oʻzida tekshirilgan.", nega: "Model koʻrgan misollarda tekshirish — baholash emas." },
    { b: "baho", d: 1, matn: "Model atigi 10 ta misolda sinaldi, 9 tasi toʻgʻri chiqdi va «90 %» deb yozildi. Ishga tushgach aniqlik ancha past boʻldi.", nega: "Test toʻplami juda kichik — natija ishonchsiz." },
    { b: "baho", d: 2, matn: "Umumiy aniqlik 96 % chiqdi va jamoa toʻxtadi. Model kasal barglarning nechtasini topganini hech kim alohida hisoblamagan — u deyarli hammasini oʻtkazib yuboradi.", nega: "Bitta umumiy son yetarli emas: xatolar sinflar boʻyicha baholanmagan." },
  ];

  function tashxisYasa(r, t) {
    const x = pick(TASHXISLAR.filter((y) => (t === 0 ? y.d === 0 : t === 2 ? y.d >= 1 : true)), r);
    return {
      tur: "tashxis", id: `tashxis:${TASHXISLAR.indexOf(x)}`, vaziyat: x.matn,
      matn: "Loyiha muvaffaqiyatsiz chiqdi. Qaysi bosqich notoʻgʻri bajarilgan yoki tashlab ketilgan?",
      variantlar: NOMLAR.slice(), javob: nom(x.b),
      ishora: "Alomatga emas, sababga qara: savol notoʻgʻrimi, maʼlumot yetishmaydimi, u koʻrib chiqilmaganmi, model mos emasmi yoki sinov yoʻqmi?",
      nega: x.nega,
    };
  }

  // «Test yo‘q»: o‘quv misollaridagi 100 % emas, yangi misollardagi aniqlik hisoblanadi
  // tier 0 — 10 yoki 20 ta yangi misol; tier 1 — 25, 40, 50; tier 2 — ikki sinf alohida berilgan
  function testYasa(r, t) {
    const oquv = pick([60, 80, 120, 200, 300], r);
    if (t < 2) {
      const jami = pick(t === 0 ? [10, 20] : [25, 40, 50], r);
      const togri = int(r, Math.ceil(jami * 0.4), Math.floor(jami * 0.9));
      if ((togri * 100) % jami !== 0) return null;
      const javob = (togri * 100) / jami;
      return {
        tur: "test", id: `test:${oquv}:${jami}:${togri}`, oquv, jami, togri, javob,
        matn: `Model ${oquv} ta misolda oʻqitildi va oʻsha misollarda tekshirildi: 100 %. Keyin u koʻrmagan ${jami} ta yangi misol berildi: ${togri} tasida toʻgʻri javob. Haqiqiy aniqlik necha foiz?`,
        nega: "Aniqlik = toʻgʻri javoblar ÷ jami misollar × 100. Faqat model koʻrmagan misollar hisobga olinadi.",
        hisob: `${togri} ÷ ${jami} × 100 = ${javob} % — 100 % emas.`,
      };
    }
    const jami = pick([20, 25, 40, 50], r);
    const kam = int(r, Math.ceil(jami * 0.2), Math.floor(jami * 0.4));
    const kop = jami - kam;
    const kopTogri = kop - int(r, 0, 2);
    const kamTogri = int(r, 0, Math.floor(kam / 2));
    const togri = kopTogri + kamTogri;
    if ((togri * 100) % jami !== 0) return null;
    const javob = (togri * 100) / jami;
    return {
      tur: "test", id: `test:${oquv}:${kop}:${kopTogri}:${kam}:${kamTogri}`, oquv, jami, togri, javob,
      guruhlar: [{ nom: "sogʻlom", soni: kop, togri: kopTogri }, { nom: "kasal", soni: kam, togri: kamTogri }],
      matn: `Model oʻquv misollarida 100 % koʻrsatdi. Yangi suratlarda: ${kop} ta «sogʻlom» bargdan ${kopTogri} tasi, ${kam} ta «kasal» bargdan ${kamTogri} tasi toʻgʻri aniqlandi. Yangi suratlardagi umumiy aniqlik necha foiz?`,
      nega: "Ikki guruhdagi toʻgʻri javoblarni qoʻsh va jami yangi suratlar soniga boʻl, keyin × 100.",
      hisob: `(${kopTogri} + ${kamTogri}) ÷ ${jami} × 100 = ${javob} %. «Kasal» barglarda esa ${kam} tadan atigi ${kamTogri} tasi.`,
    };
  }

  // «Kam ma‘lumot»: nomutanosib to‘plamda hech narsa o‘rganmagan model aniqligi
  const TOPLAMLAR = [
    { k: "barg", narsa: "barg surati", kop: "sogʻlom", kam: "kasal" },
    { k: "xat", narsa: "xat", kop: "oddiy", kam: "spam" },
    { k: "tolov", narsa: "toʻlov", kop: "halol", kam: "firibgarlik" },
  ];

  function kamYasa(r, t) {
    const x = pick(TOPLAMLAR, r);
    const jami = pick(t === 2 ? [250, 400, 500] : [50, 100, 200], r);
    const kam = int(r, Math.ceil(jami * 0.04), Math.floor(jami * 0.2));
    if ((kam * 100) % jami !== 0) return null;
    const kop = jami - kam;
    const javob = (kop * 100) / jami;
    return {
      tur: "kam", id: `kam:${x.k}:${jami}:${kam}`, toplam: x.k, jami, kop, kam, javob,
      qatorlar: [{ nom: x.kop, soni: kop }, { nom: x.kam, soni: kam }],
      matn: `Toʻplamda ${jami} ta ${x.narsa}: ${kop} tasi «${x.kop}», ${kam} tasi «${x.kam}». Hech narsa oʻrganmagan model hammasiga «${x.kop}» deb javob bersa, aniqligi necha foiz?`,
      nega: `Bunday model faqat «${x.kop}» misollarida toʻgʻri boʻladi. Aniqlik = toʻgʻri ÷ jami × 100.`,
      hisob: `${kop} ÷ ${jami} × 100 = ${javob} % — lekin model bitta ham «${x.kam}»ni topmaydi. «${x.kam[0].toUpperCase() + x.kam.slice(1)}» misollari juda kam.`,
    };
  }

  const BOSQICH1 = [[natijaYasa, keyingiYasa, tartibYasa], [etishmaydiYasa, tartibYasa, natijaYasa], [tartibYasa, etishmaydiYasa]];
  const BOSQICH2 = [[ishYasa, bosqichIshiYasa], [ishYasa, bosqichIshiYasa], [ishYasa, soatYasa, bosqichIshiYasa]];
  const BOSQICH3 = [[tashxisYasa, testYasa], [tashxisYasa, kamYasa, testYasa], [tashxisYasa, testYasa, kamYasa]];

  const api = {
    BOSQICHLAR, KALITLAR, NOMLAR, LOYIHALAR, QOSHIMCHA, ISHLAR, NATIJALAR, TASHXISLAR, TOPLAMLAR, HARFLAR, USIZ,
    nom, aralash, aralashTartib,
    natijaTask: bitta(natijaYasa), keyingiTask: bitta(keyingiYasa), tartibTask: bitta(tartibYasa), etishmaydiTask: bitta(etishmaydiYasa),
    ishTask: bitta(ishYasa), bosqichIshiTask: bitta(bosqichIshiYasa), soatTask: bitta(soatYasa),
    tashxisTask: bitta(tashxisYasa), testTask: bitta(testYasa), kamTask: bitta(kamYasa),
    bosqich1Task: generator(BOSQICH1), bosqich2Task: generator(BOSQICH2), bosqich3Task: generator(BOSQICH3),
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
