// 66-o'yin: kompyuter qismlari — 9 qism (nomi, vazifasi, yo'nalishi), kiritish va chiqarish qurilmalari,
// yoqish-o'chirish tartibi va ehtiyot qoidalari. Vazifa generatorlari tier (0/1/2) bilan qiyinlashadi.
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

  // Aralashgan, lekin boshlang'ich tartibda qolmagan (aks holda "aralash qadamlar" tayyor javob bo'lib qoladi)
  function aralashTartib(list, r) {
    for (let k = 0; k < 20; k++) {
      const out = aralash(list, r);
      if (out.some((x, i) => x !== list[i])) return out;
    }
    return list.slice(1).concat(list[0]);
  }

  // Ketma-ket bir xil misol chiqmasligi uchun (QOIDALAR 4.3). Generator null qaytarsa (shart bajarilmadi) — qayta urinadi.
  function pickNew(make, prev, r) {
    let zaxira = null;
    for (let k = 0; k < 400; k++) {
      const task = make(r);
      if (!task) continue;
      if (!prev || task.id !== prev.id) return task;
      zaxira = task;
    }
    if (zaxira) return zaxira;
    throw new Error("Misol yasab boʻlmadi");
  }

  // ---------- Qismlar ----------
  // ish — "U …" dan keyin o'qiladigan vazifa (savol ham shundan yasaladi: "Qaysi qurilma …?").
  // guruh — vazifasi bir xil qurilmalar bitta guruhda: kolonka ham, quloqchin ham ovoz chiqaradi,
  //   shuning uchun vazifa so'ralgan savolda ular birga chiqmaydi.
  // oqim — 2-bosqich ko'rsatishida aytiladigan gap (nima qayoqqa yuradi).
  // emas — shu qurilmaning vazifasi so'ralganda variantga qo'shilmaydiganlar: kamera ham ovoz yozadi deb o'ylash mumkin.
  const QISMLAR = [
    { id: "monitor", nom: "Monitor", ish: "rasm va yozuvni ekranda koʻrsatadi", yonalish: "chiqarish", guruh: "ekran", oqim: "Kompyuter rasmni monitorga chiqaradi." },
    { id: "klaviatura", nom: "Klaviatura", ish: "harf va sonlarni kompyuterga kiritadi", yonalish: "kiritish", guruh: "yozuv", oqim: "Klaviatura harflarni kompyuterga kiritadi." },
    { id: "sichqoncha", nom: "Sichqoncha", ish: "ekrandagi koʻrsatkichni yurgizadi", yonalish: "kiritish", guruh: "korsatkich", oqim: "Sichqoncha buyrugʻingni kompyuterga kiritadi." },
    { id: "blok", nom: "Tizim bloki", ish: "oʻylaydi va hamma qismni boshqaradi", yonalish: "markaz", guruh: "markaz", oqim: "" },
    { id: "kolonka", nom: "Kolonka", ish: "ovozni hammaga eshittiradi", yonalish: "chiqarish", guruh: "ovoz-chiqarish", oqim: "Kompyuter ovozni kolonkaga chiqaradi." },
    { id: "printer", nom: "Printer", ish: "rasm va yozuvni qogʻozga chiqaradi", yonalish: "chiqarish", guruh: "qogoz", oqim: "Kompyuter rasmni printerga chiqaradi." },
    { id: "mikrofon", nom: "Mikrofon", ish: "ovozni yozib oladi", yonalish: "kiritish", guruh: "ovoz-kiritish", oqim: "Mikrofon ovozingni kompyuterga kiritadi.", emas: ["kamera"] },
    { id: "kamera", nom: "Kamera", ish: "seni suratga va videoga oladi", yonalish: "kiritish", guruh: "surat", oqim: "Kamera suratingni kompyuterga kiritadi." },
    { id: "quloqchin", nom: "Quloqchin", ish: "ovozni faqat senga eshittiradi", yonalish: "chiqarish", guruh: "ovoz-chiqarish", oqim: "Kompyuter ovozni quloqchinga chiqaradi." },
  ].map((q) => ({ ...q, vazifa: `${q.nom} ${q.ish}.` })); // vazifa — bitta qisqa gap: "Monitor rasm va yozuvni ekranda koʻrsatadi."

  const YONALISH = {
    kiritish: { nom: "Kiritish", yol: "sendan kompyuterga", tarif: "sendan kompyuterga olib kiradi" },
    chiqarish: { nom: "Chiqarish", yol: "kompyuterdan senga", tarif: "kompyuterdan senga olib chiqadi" },
  };
  const teskari = (yon) => (yon === "kiritish" ? "chiqarish" : "kiritish");

  const qism = (id) => QISMLAR.find((q) => q.id === id) || null;
  const kichik = (s) => s.charAt(0).toLowerCase() + s.slice(1); // gap ichida: "Tizim bloki" → "tizim bloki"
  const nomlar = (ids) => ids.map((id) => kichik(qism(id).nom)).join(", ");
  // Qismlar ro'yxatidagi tartibda (javob to'plami doim bir xil ko'rinishda bo'lsin)
  const tartibda = (ids) => QISMLAR.map((q) => q.id).filter((id) => ids.includes(id));

  // Javob + chalg'ituvchilar (jami o.soni, odatda 4) — qurilma id lari, aralash tartibda.
  // o.birXilYoq — vazifasi bir xil ikki qurilma birga chiqmaydi; o.emas — bu savolda chalkashtiradigan qurilmalar.
  function variantlar(r, javobId, opts) {
    const o = opts || {};
    const tanlangan = [qism(javobId)];
    for (const q of aralash(QISMLAR, r)) {
      if (tanlangan.length >= (o.soni || 4)) break;
      if (q.id === javobId || (o.emas || []).includes(q.id)) continue;
      if (o.birXilYoq && tanlangan.some((x) => x.guruh === q.guruh)) continue;
      tanlangan.push(q);
    }
    return aralash(tanlangan.map((q) => q.id), r);
  }

  // Ketma-ket ikki savol bitta qurilma haqida bo'lmasin (savol turi boshqa bo'lsa ham)
  const takror = (prev, id) => !!prev && prev.qism === id;

  // ---------- 1-bosqich: qismlar va nomlari ----------
  // Nom → rasm: "Qaysi biri — klaviatura?" (4 ta rasm-tugma)
  function nomTask(r, prev) {
    return pickNew((rr) => {
      const q = pick(QISMLAR, rr);
      if (takror(prev, q.id)) return null;
      return {
        tur: "nom", id: "nom:" + q.id, qism: q.id,
        matn: `Qaysi biri — ${kichik(q.nom)}?`,
        variantlar: variantlar(rr, q.id), javob: q.id,
        nega: q.vazifa, maqtov: q.vazifa,
      };
    }, prev, r);
  }

  // Rasm → nom: qism rasmi, 4 ta nomdan tanlash
  function rasmTask(r, prev) {
    return pickNew((rr) => {
      const q = pick(QISMLAR, rr);
      if (takror(prev, q.id)) return null;
      return {
        tur: "rasm", id: "rasm:" + q.id, qism: q.id,
        matn: "Bu qurilmaning nomi nima?",
        variantlar: variantlar(rr, q.id), javob: q.id,
        nega: q.vazifa, maqtov: q.vazifa,
      };
    }, prev, r);
  }

  // Vazifa → rasm: "Qaysi qurilma ovozni yozib oladi?" — vazifasi bir xil ikki qurilma birga chiqmaydi
  function vazifaTask(r, prev) {
    return pickNew((rr) => {
      const q = pick(QISMLAR, rr);
      if (takror(prev, q.id)) return null;
      const v = variantlar(rr, q.id, { birXilYoq: true, emas: q.emas });
      if (v.length < 4) return null;
      return {
        tur: "vazifa", id: "vazifa:" + q.id, qism: q.id,
        matn: `Qaysi qurilma ${q.ish}?`,
        variantlar: v, javob: q.id,
        nega: q.vazifa, maqtov: q.vazifa,
      };
    }, prev, r);
  }

  // ---------- 2-bosqich: kiritish va chiqarish ----------
  // Vaziyat → qurilma. emas — shu vaziyatda ikkinchi to'g'ri javobdek ko'rinishi mumkin bo'lgan qurilmalar
  // (variantlarga qo'shilmaydi, savol ikki xil tushunilmasin — QOIDALAR 4.3).
  const VAZIYATLAR = [
    { qism: "mikrofon", matn: "Doʻstingga ovozli xabar yozmoqchisan. Nima kerak?", emas: ["klaviatura", "kamera"] },
    { qism: "mikrofon", matn: "Qoʻshiq aytib, ovozingni yozib olmoqchisan. Nima kerak?", emas: ["kamera"] },
    { qism: "klaviatura", matn: "Buvingga xat yozmoqchisan. Harflarni nima bilan terasan?" },
    { qism: "klaviatura", matn: "Kompyuterga ismingni yozmoqchisan. Nima kerak?" },
    { qism: "sichqoncha", matn: "Ekrandagi koʻrsatkichni rasm ustiga olib bormoqchisan. Nima kerak?" },
    { qism: "sichqoncha", matn: "Kompyuterda rasm chizmoqchisan. Chiziqni nima bilan chizasan?", emas: ["monitor", "printer"] },
    { qism: "kamera", matn: "Doʻsting seni ekranda koʻrmoqchi. Senga nima kerak?", emas: ["monitor"] },
    { qism: "kamera", matn: "Oʻzingni suratga olmoqchisan. Nima kerak?" },
    { qism: "monitor", matn: "Multfilm koʻrmoqchisan. Nimaga qaraysan?" },
    { qism: "monitor", matn: "Oʻyin oʻynayapsan. Oʻyin rasmi qayerda koʻrinadi?", emas: ["printer"] },
    { qism: "printer", matn: "Chizgan rasmingni qogʻozga chiqarmoqchisan. Nima kerak?" },
    { qism: "printer", matn: "Sheʼrni qogʻozga chop etmoqchisan. Nima kerak?" },
    { qism: "kolonka", matn: "Kompyuterdagi qoʻshiqni butun sinf eshitsin. Nima kerak?" },
    { qism: "kolonka", matn: "Multfilm ovozini xonadagi hamma eshitsin. Nima kerak?" },
    { qism: "quloqchin", matn: "Musiqani faqat oʻzing eshitmoqchisan. Nima kerak?" },
    { qism: "quloqchin", matn: "Ukang uxlayapti. Multfilm ovozi uni uygʻotmasligi uchun nima kerak?" },
  ];

  function kerakTask(r, prev) {
    return pickNew((rr) => {
      const k = int(rr, 0, VAZIYATLAR.length - 1);
      const v = VAZIYATLAR[k];
      if (takror(prev, v.qism)) return null;
      const q = qism(v.qism);
      const tanlov = variantlar(rr, q.id, { birXilYoq: true, emas: v.emas });
      if (tanlov.length < 4) return null;
      return {
        tur: "kerak", id: "kerak:" + k, qism: q.id,
        matn: v.matn,
        variantlar: tanlov, javob: q.id,
        nega: q.vazifa, maqtov: q.vazifa,
      };
    }, prev, r);
  }

  // "Kiritish qurilmalarining hammasini belgila": 6 ta qurilma, 2–4 tasi to'g'ri. Javob — id lar to'plami.
  // Ketma-ket ikki marta bitta yo'nalish so'ralmaydi.
  function tanlaTask(r, prev) {
    return pickNew((rr) => {
      const yon = pick(["kiritish", "chiqarish"], rr);
      if (prev && prev.tur === "tanla" && prev.yonalish === yon) return null;
      const togri = aralash(QISMLAR.filter((q) => q.yonalish === yon), rr).slice(0, int(rr, 2, 4));
      const boshqa = aralash(QISMLAR.filter((q) => q.yonalish !== yon), rr).slice(0, 6 - togri.length);
      const tanlov = aralash(togri.concat(boshqa).map((q) => q.id), rr);
      const javob = tartibda(togri.map((q) => q.id));
      const Y = YONALISH[yon];
      return {
        tur: "tanla", id: `tanla:${yon}:${tartibda(tanlov).join(",")}`, yonalish: yon,
        matn: `${Y.nom} qurilmalarining hammasini belgila.`,
        variantlar: tanlov, javob,
        nega: `${Y.nom} qurilmalari: ${nomlar(javob)}. Ular ${Y.tarif}.`,
        maqtov: `Hamma ${kichik(Y.nom)} qurilmasini topding.`,
      };
    }, prev, r);
  }

  // 4 qurilmadan bittasi boshqa yo'nalishda — o'shani top. Tizim bloki qatnashmaydi (u ikkalasi ham emas).
  function ortiqchaTask(r, prev) {
    return pickNew((rr) => {
      const kop = pick(["kiritish", "chiqarish"], rr);
      const oz = teskari(kop);
      const uch = aralash(QISMLAR.filter((q) => q.yonalish === kop), rr).slice(0, 3);
      const bir = pick(QISMLAR.filter((q) => q.yonalish === oz), rr);
      if (takror(prev, bir.id)) return null;
      const tanlov = aralash(uch.concat(bir).map((q) => q.id), rr);
      return {
        tur: "ortiqcha", id: `ortiqcha:${tartibda(tanlov).join(",")}`, qism: bir.id, yonalish: kop,
        matn: "Uchta qurilmaning yoʻnalishi bir xil: yo kiritish, yo chiqarish. Bittasi boshqacha — oʻshani top.",
        variantlar: tanlov, javob: bir.id,
        nega: `${bir.nom} — ${kichik(YONALISH[oz].nom)} qurilmasi. Qolgan uchtasi — ${kichik(YONALISH[kop].nom)} qurilmalari.`,
        maqtov: `${bir.nom} — ${kichik(YONALISH[oz].nom)} qurilmasi, qolganlari — ${kichik(YONALISH[kop].nom)}.`,
      };
    }, prev, r);
  }

  // ---------- 3-bosqich: yoqish va ehtiyot qilish ----------
  // Har ketma-ketlikda 6 qadam — to'liq tartib. toplam — qadamlar soni bo'yicha qo'lda tanlangan to'plamlar
  // (indekslar o'sish tartibida): tasodifiy kesim ma'nosiz chiqishi mumkin ("Rasmni saqla" bor, "Rasm chiz" yo'q).
  const TARTIBLAR = {
    ochirish: {
      matn: "Kompyuterni oʻchirmoqchisan. Qadamlarni tartib bilan bos.",
      ishora: "Oʻyla: oʻchgan kompyuterda ishni saqlab boʻladimi?",
      nega: "Avval ish saqlanadi, keyin kompyuter oʻchiriladi. Aks holda ish yoʻqoladi.",
      xulosa: "Avval saqla, keyin oʻchir.",
      qadamlar: [
        { id: "saqla", matn: "Ishingni saqla" },
        { id: "yop", matn: "Dasturlarni yop" },
        { id: "pusk", matn: "«Pusk» tugmasini bos" },
        { id: "tanla", matn: "«Oʻchirish»ni tanla" },
        { id: "kut", matn: "Ekran oʻchishini kut" },
        { id: "stul", matn: "Stulni joyiga sur" },
      ],
      toplam: {
        3: [[0, 1, 3], [0, 3, 4], [0, 2, 3]],
        4: [[0, 1, 3, 4], [0, 1, 2, 3], [0, 2, 3, 4], [0, 3, 4, 5]],
        5: [[0, 1, 2, 3, 4], [0, 1, 3, 4, 5], [0, 2, 3, 4, 5], [0, 1, 2, 3, 5]],
      },
    },
    yoqish: {
      matn: "Kompyuterni yoqib, rasm chizmoqchisan. Qadamlarni tartib bilan bos.",
      ishora: "Oʻyla: kompyuter yonmasdan oldin unda ishlab boʻladimi?",
      nega: "Avval kompyuter yoqiladi va ekran yonishi kutiladi. Shundan keyin ish boshlanadi.",
      xulosa: "Avval yoq va kut, keyin ishla.",
      qadamlar: [
        { id: "qol", matn: "Qoʻling quruqligini tekshir" },
        { id: "tugma", matn: "Tizim blokidagi tugmani bos" },
        { id: "yon", matn: "Ekran yonishini kut" },
        { id: "dastur", matn: "Rasm dasturini och" },
        { id: "chiz", matn: "Rasm chiz" },
        { id: "saqla", matn: "Rasmni saqla" },
      ],
      toplam: {
        3: [[1, 2, 3], [0, 1, 2], [1, 2, 4]],
        4: [[0, 1, 2, 3], [1, 2, 3, 4], [1, 2, 4, 5]],
        5: [[0, 1, 2, 3, 4], [1, 2, 3, 4, 5], [0, 1, 2, 4, 5]],
      },
    },
  };
  const QADAM_SONI = [3, 4, 5]; // tier → nechta qadam

  // Aralash qadamlarni to'g'ri tartibda bosish. ketma berilmasa — tasodifiy ketma-ketlik.
  // qadamlar — ekranda turgan (aralash) tartib; javob — to'g'ri tartibdagi id lar.
  function tartibTask(r, prev, tier, ketma) {
    const t = Math.max(0, Math.min(tier || 0, 2));
    return pickNew((rr) => {
      const kalit = ketma || pick(Object.keys(TARTIBLAR), rr);
      const T = TARTIBLAR[kalit];
      const tanlov = pick(T.toplam[QADAM_SONI[t]], rr);
      const togri = tanlov.map((i) => T.qadamlar[i]);
      const kartalar = aralashTartib(togri, rr);
      return {
        tur: "tartib", id: `tartib:${kalit}:${tanlov.join("")}:${kartalar.map((q) => q.id).join(",")}`, ketma: kalit,
        matn: T.matn,
        qadamlar: kartalar.map((q) => ({ id: q.id, matn: q.matn })), javob: togri.map((q) => q.id),
        ishora: T.ishora, nega: T.nega, maqtov: T.xulosa,
      };
    }, prev, r);
  }

  // Kompyuterga zarar qiladigan ishlar (asos — dizayndagi to'rttasi, eng oson zinada shular so'raladi)
  const ZARARLI = [
    { id: "z-hol", asos: true, matn: "Hoʻl qoʻl bilan klaviaturani bosish", nega: "Suv kompyuterni buzadi, tok urishi ham mumkin." },
    { id: "z-sim", asos: true, matn: "Kompyuterni simidan tortib oʻchirish", nega: "Simdan tortsang, sim uziladi va saqlanmagan ish yoʻqoladi." },
    { id: "z-ovqat", asos: true, matn: "Klaviatura ustida ovqat yeyish", nega: "Ushoq tugmalar orasiga kirib, ularni buzadi." },
    { id: "z-ekran", asos: true, matn: "Ekranni qalam uchi bilan bosish", nega: "Qattiq narsa ekranni tirnaydi va buzadi." },
    { id: "z-choy", asos: false, matn: "Klaviatura yoniga choy qoʻyish", nega: "Choy toʻkilsa, klaviatura ishlamay qoladi." },
    { id: "z-urish", asos: false, matn: "Tugmalarni qattiq urib bosish", nega: "Qattiq ursang, tugmalar sinadi." },
    { id: "z-silkit", asos: false, matn: "Sichqonchani simidan ushlab aylantirish", nega: "Sim uzilsa, sichqoncha ishlamay qoladi." },
  ];
  // Yaxshi odatlar — chalg'ituvchi variantlar
  const BEZARAR = [
    { id: "b-quruq", matn: "Quruq va toza qoʻl bilan ishlash" },
    { id: "b-yengil", matn: "Tugmalarni yengil bosish" },
    { id: "b-saqla", matn: "Ishni saqlab, keyin oʻchirish" },
    { id: "b-latta", matn: "Ekranni yumshoq latta bilan artish" },
    { id: "b-dam", matn: "20 daqiqadan keyin koʻzga dam berish" },
    { id: "b-uzoq", matn: "Ovqatni kompyuterdan uzoqda yeyish" },
    { id: "b-gilam", matn: "Sichqonchani gilamchada yurgizish" },
    { id: "b-tugma", matn: "Kompyuterni «Oʻchirish» orqali oʻchirish" },
  ];
  const EHTIYOT = "Kompyuterga suv, ushoq, zarba va simdan tortish yoqmaydi.";
  const nusxa = (x) => ({ id: x.id, matn: x.matn });

  // tier 0 — asosiy to'rttadan bittasi, tier 1 — qolganlaridan bittasi (4 variant, bittasi zararli);
  // tier 2 — "hammasini belgila": 5 variant, 2–3 tasi zararli (javob — id lar to'plami, kop: true).
  function zararTask(r, prev, tier) {
    const t = Math.max(0, Math.min(tier || 0, 2));
    return pickNew((rr) => {
      if (t < 2) {
        const z = pick(ZARARLI.filter((x) => x.asos === (t === 0)), rr);
        const tanlov = aralash([z].concat(aralash(BEZARAR, rr).slice(0, 3)), rr);
        return {
          tur: "zarar", id: "zarar:" + z.id, kop: false,
          matn: "Qaysi biri kompyuterga zarar qiladi?",
          variantlar: tanlov.map(nusxa), javob: z.id,
          nega: z.nega, maqtov: z.nega,
        };
      }
      const zararli = aralash(ZARARLI, rr).slice(0, int(rr, 2, 3));
      const tanlov = aralash(zararli.concat(aralash(BEZARAR, rr).slice(0, 5 - zararli.length)), rr);
      return {
        tur: "zarar", id: "zarar:kop:" + tanlov.map((x) => x.id).sort().join(","), kop: true,
        matn: "Kompyuterga zarar qiladiganlarning hammasini belgila.",
        variantlar: tanlov.map(nusxa), javob: ZARARLI.map((x) => x.id).filter((id) => zararli.some((z) => z.id === id)),
        nega: "Belgilanganlari kompyuterni buzadi. Qolganlari — yaxshi odat.",
        maqtov: "Hamma zararlisini topding.",
      };
    }, prev, r);
  }

  // ---------- Tekshirish va maslahat ----------
  // Bitta javob — qiymat teng; to'plam (tanla, zarar-kop) — aynan teng to'plam; tartib — aynan shu tartib
  function tekshir(task, qiymat) {
    if (!Array.isArray(task.javob)) return qiymat === task.javob;
    if (!Array.isArray(qiymat) || qiymat.length !== task.javob.length) return false;
    if (task.tur === "tartib") return task.javob.every((x, i) => qiymat[i] === x);
    // Uzunlik teng va javobdagi har id bor — demak to'plam aynan teng (javobda takror yo'q)
    return task.javob.every((x) => qiymat.includes(x));
  }

  // Tartib vazifasida nechta qadam o'z o'rnida turibdi
  function orinda(task, tartib) {
    const list = Array.isArray(tartib) ? tartib : [];
    return task.javob.filter((x, i) => list[i] === x).length;
  }

  // Maslahat (1-xato): javobni aytmaydi — bola tanlagan narsaning o'zini tushuntiradi yoki usulni eslatadi
  function ishora(task, qiymat) {
    if (task.tur === "nom" || task.tur === "vazifa" || task.tur === "kerak") {
      const q = qism(qiymat);
      return q ? `Bu — ${kichik(q.nom)}. U ${q.ish}.` : "Har bir rasmga qara: u nima ish qiladi?";
    }
    if (task.tur === "rasm") {
      const q = qism(qiymat);
      return q ? `${q.vazifa} Rasmdagi qurilma-chi?` : "Rasmdagi qurilma nima ish qiladi?";
    }
    if (task.tur === "tanla") {
      const Y = YONALISH[task.yonalish];
      return `${Y.nom} — ${Y.yol}. Bu yerda ular ${task.javob.length} ta.`;
    }
    if (task.tur === "ortiqcha") return "Har biriga qara: sendan kompyutergami yoki kompyuterdan sengami?";
    if (task.tur === "tartib") {
      const k = orinda(task, qiymat);
      return (k ? `${k} ta qadam oʻz oʻrnida.` : "Hech bir qadam oʻz oʻrnida emas.") + " " + task.ishora;
    }
    if (task.tur === "zarar") {
      return task.kop ? `Zararlisi bu yerda ${task.javob.length} ta. ${EHTIYOT}` : `Bu — yaxshi odat. ${EHTIYOT}`;
    }
    return "";
  }

  // ---------- Bosqich navbatlari ----------
  // n — nechanchi to'g'ri javob (0 dan), tier — qiyinlik zinasi (practice.js: 0, 0, 1, 1, 2, 2…; qiyin rejimda doim 2).
  // 1-bosqich (4 javob): nom, nom, rasm, vazifa. Bu bosqichda tier 2 ga yetilmaydi, shuning uchun "vazifa"
  // tier 1 ning ikkinchi misoli bo'lib ham chiqadi; qiyin rejimda (tier 2) — vazifa va rasm navbat bilan.
  function bosqich1Task(r, prev, n, tier) {
    const t = tier || 0;
    const juft = (n || 0) % 2 === 0;
    if (t === 0) return nomTask(r, prev, t);
    if (t === 1) return juft ? rasmTask(r, prev, t) : vazifaTask(r, prev, t);
    return juft ? vazifaTask(r, prev, t) : rasmTask(r, prev, t);
  }

  // 2-bosqich (5 javob): kerak, kerak, tanla, tanla, ortiqcha; qiyin rejimda uchala tur aralash
  const QIYIN2 = [ortiqchaTask, tanlaTask, ortiqchaTask, kerakTask];
  function bosqich2Task(r, prev, n, tier) {
    const t = tier || 0;
    if (t === 0) return kerakTask(r, prev, t);
    if (t === 1) return tanlaTask(r, prev, t);
    return QIYIN2[(n || 0) % QIYIN2.length](r, prev, t);
  }

  // 3-bosqich (6 javob): tartib va zarar navbat bilan; tartibda o'chirish va yoqish almashadi
  function bosqich3Task(r, prev, n, tier) {
    const k = n || 0;
    if (k % 2 === 1) return zararTask(r, prev, tier);
    return tartibTask(r, prev, tier, (k >> 1) % 2 === 0 ? "ochirish" : "yoqish");
  }

  const api = {
    QISMLAR, YONALISH, VAZIYATLAR, TARTIBLAR, QADAM_SONI, ZARARLI, BEZARAR, EHTIYOT,
    qism, kichik, nomlar, tartibda, teskari, variantlar, aralash, aralashTartib,
    nomTask, rasmTask, vazifaTask, kerakTask, tanlaTask, ortiqchaTask, tartibTask, zararTask,
    tekshir, orinda, ishora,
    bosqich1Task, bosqich2Task, bosqich3Task,
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
