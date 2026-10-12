// 73-o‘yin: AI oilasi — qo‘lda yozilgan qoida va ma‘lumotdan o‘rganish, AI ⊃ ML ⊃ DL to‘plamlari,
// kompyuter ko‘rishi vazifalari (tasniflash, obyektni topish, segmentatsiya).
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

  // ================= 1-bosqich: qoida qo‘lda yozilganmi yoki ma‘lumotdan o‘rganilganmi =================
  // d — qiyinlik: 0 — manbasi ochiq aytilgan, 1 — nomi chalg‘itadi
  const QOIDALI = [
    { d: 0, matn: "Kalkulyator: dasturchi yozgan formula boʻyicha hisoblaydi" },
    { d: 0, matn: "Budilnik: belgilangan soat kelsa, jiringlaydi" },
    { d: 0, matn: "Parol tekshiruvi: 8 belgidan kam boʻlsa, rad etadi" },
    { d: 0, matn: "Lift: bosilgan tugmaga qarab qavatni tanlaydi — shartlarini muhandis yozgan" },
    { d: 0, matn: "Svetofor: har 60 soniyada rangni almashtiradi" },
    { d: 0, matn: "Kassa: narxlarni qoʻshadi va chegirma formulasini qoʻllaydi" },
    { d: 1, matn: "«Aqlli» chiroq: soat 19:00 da yonadi — vaqtni egasi kiritgan" },
    { d: 1, matn: "Termostat: harorat 20 °C dan past boʻlsa, isitishni yoqadi" },
    { d: 1, matn: "Chatbot: «narx» soʻzi uchrasa, xodim yozgan tayyor javobni chiqaradi" },
    { d: 1, matn: "Spam filtri: «yutuq» soʻzi boʻlsa, bloklaydi — soʻzni admin kiritgan" },
    { d: 1, matn: "Oʻyindagi raqib: oʻyinchi 5 qadamdan yaqin kelsa, hujum qiladi" },
    { d: 1, matn: "Bank: 10 mln soʻmdan katta toʻlovni toʻxtatadi — chegarani xodim qoʻygan" },
  ];
  const ORGANGAN = [
    { d: 0, matn: "Pochta: belgilangan minglab xatlardan spam belgilarini oʻzi topgan" },
    { d: 0, matn: "Kamera: minglab suratlardan yuzni tanishni oʻrgangan" },
    { d: 0, matn: "Tarjimon: millionlab tarjima juftliklaridan oʻrgangan" },
    { d: 0, matn: "Tavsiya tizimi: tomosha tarixidan senga yoqadigan videoni bashorat qiladi" },
    { d: 0, matn: "Ovozli yordamchi: yozib olingan nutqlardan soʻzlarni tanishni oʻrgangan" },
    { d: 0, matn: "Tibbiy dastur: belgilangan rentgen suratlaridan kasallik belgisini oʻrgangan" },
    { d: 1, matn: "Klaviatura: sen yozgan matnlarga qarab keyingi soʻzni taklif qiladi" },
    { d: 1, matn: "Bank: oldingi firibgarlik holatlaridan shubhali toʻlov belgisini oʻzi chiqargan" },
    { d: 1, matn: "Navigator: oʻtgan haftalar tirbandligidan yoʻl vaqtini bashorat qiladi" },
    { d: 1, matn: "Doʻkon: oʻtgan yillar savdosidan ertaga nechta non kerakligini bashorat qiladi" },
    { d: 1, matn: "Termostat: oilaning bir oylik odatidan qulay haroratni oʻzi moslagan" },
    { d: 1, matn: "Narx bashorati: sotilgan uylar jadvaliga toʻgʻri chiziq moslab hisoblaydi" },
  ];
  const mosDaraja = (t) => (x) => (t === 0 ? x.d === 0 : t === 2 ? x.d >= 1 : true);

  // To‘rt tizimdan bittasi boshqacha: yo o‘rgangan, yo qo‘lda yozilgan
  function tanlaYasa(r, t) {
    const izlanadi = r() < 0.5 ? "organgan" : "qoida";
    const bir = (izlanadi === "organgan" ? ORGANGAN : QOIDALI).filter(mosDaraja(t));
    const uch = (izlanadi === "organgan" ? QOIDALI : ORGANGAN).filter(mosDaraja(t));
    const togri = pick(bir, r);
    const boshqa = aralash(uch, r).slice(0, 3);
    const kalit = boshqa.map((x) => uch.indexOf(x)).sort((a, b) => a - b).join(",");
    return {
      tur: "tanla", id: `tanla:${t}:${izlanadi}:${bir.indexOf(togri)}:${kalit}`, izlanadi,
      matn: izlanadi === "organgan"
        ? "Toʻrt tizimdan qaysi biri xulqini maʼlumotdan oʻrgangan?"
        : "Toʻrt tizimdan qaysi birida qoidani odam qoʻlda yozgan?",
      variantlar: aralash([togri].concat(boshqa).map((x) => x.matn), r), javob: togri.matn,
      ishora: "Xulq qayerdan kelganiga qara: shartni odam oldindan yozganmi yoki u misollardan chiqarilganmi?",
      nega: izlanadi === "organgan"
        ? "Bu tizimda qoidani hech kim yozmagan — u misollardan chiqarilgan. Qolgan uchtasida shart qoʻlda berilgan."
        : "Bu tizimda shartni odam oldindan yozgan; yangi maʼlumot uni oʻzgartirmaydi. Qolgan uchtasi misollardan oʻrgangan.",
    };
  }

  // Qo‘lda yozilgan chegara qoidasi va haqiqiy holatlar jadvali
  const SOHALAR = [
    { k: "spam", nom: "Spam filtri", ustun: "havola", qoida: (n) => `xatda ${n} tadan koʻp havola boʻlsa — spam`, ha: "spam", yoq: "oddiy", min: 0, max: 9 },
    { k: "bank", nom: "Bank nazorati", ustun: "mln soʻm", qoida: (n) => `toʻlov ${n} mln soʻmdan katta boʻlsa — firibgarlik`, ha: "firibgarlik", yoq: "halol", min: 1, max: 20 },
    { k: "obuna", nom: "Obuna bashorati", ustun: "kun", qoida: (n) => `mijoz ${n} kundan koʻp kirmagan boʻlsa — ketadi`, ha: "ketdi", yoq: "qoldi", min: 1, max: 30 },
  ];

  // Qoida (qiymat > n) nechta qatorda haqiqiy holatga mos
  const togriSoni = (qatorlar, n) => qatorlar.filter((q) => (q.qiymat > n) === q.asl).length;

  // Jadval: qiymatlar har xil, haqiqiy chegara h atrofida; shovqin — bir qator teskari belgilangan
  function qatorlarYasa(r, soha, soni, shart) {
    for (let k = 0; k < 200; k++) {
      const h = int(r, soha.min + 2, soha.max - 3);
      const qiymatlar = new Set(shart && shart.ichida ? shart.ichida : []);
      while (qiymatlar.size < soni) qiymatlar.add(int(r, soha.min, soha.max));
      const qatorlar = aralash([...qiymatlar], r).map((qiymat) => ({ qiymat, asl: qiymat > h }));
      if (shart && shart.shovqin) {
        const q = pick(qatorlar, r);
        q.asl = !q.asl;
      }
      const ha = qatorlar.filter((q) => q.asl).length;
      if (ha >= 2 && soni - ha >= 2) return { qatorlar, h };
    }
    return null;
  }

  // Qoida nechta holatda to‘g‘ri? tier 0 — 5 qator tartibda, tier 1 — 6 qator aralash,
  // tier 2 — 8 qator, biri aynan chegarada («ko‘p» — qat‘iy katta)
  function qoidaYasa(r, t) {
    const soha = pick(SOHALAR, r);
    const soni = [5, 6, 8][t];
    const n = int(r, soha.min + 1, soha.max - 2);
    const tuzilma = qatorlarYasa(r, soha, soni, { shovqin: t >= 1, ichida: t === 2 ? [n] : [] });
    if (!tuzilma) return null;
    const qatorlar = t === 0 ? tuzilma.qatorlar.slice().sort((a, b) => a.qiymat - b.qiymat) : tuzilma.qatorlar;
    const javob = togriSoni(qatorlar, n);
    if (javob < 2 || javob >= soni) return null; // qoida mukammal emas — aks holda savol ma‘nosiz
    return {
      tur: "qoida", id: `qoida:${soha.k}:${n}:${qatorlar.map((q) => q.qiymat + (q.asl ? "+" : "-")).join("")}`,
      soha: soha.k, n, qatorlar, javob,
      matn: `Qoʻlda yozilgan qoida: «${soha.qoida(n)}». Jadvalda ${soni} ta haqiqiy holat. Qoida nechtasida toʻgʻri javob beradi?`,
      nega: "Har katakda ikki narsani solishtir: qoida nima deydi va aslida nima boʻlgan. «Koʻp» — qatʼiy katta degani.",
      hisob: `${javob} tasida toʻgʻri, ${soni - javob} tasida xato.`,
    };
  }

  // Chegarani ma‘lumotdan tanlash: to‘rt nomzoddan qaysi biri eng ko‘p qatorda to‘g‘ri (yagona eng yaxshi)
  function chegaraYasa(r, t) {
    const soha = pick(SOHALAR, r);
    const soni = t === 2 ? 7 : 6;
    const tuzilma = qatorlarYasa(r, soha, soni, { shovqin: t === 2 });
    if (!tuzilma) return null;
    const qatorlar = tuzilma.qatorlar;
    const nomzodlar = new Set([tuzilma.h]);
    while (nomzodlar.size < 4) nomzodlar.add(int(r, soha.min, soha.max - 1));
    const chegaralar = [...nomzodlar].sort((a, b) => a - b);
    const ballar = chegaralar.map((n) => togriSoni(qatorlar, n));
    const eng = Math.max(...ballar);
    if (ballar.filter((b) => b === eng).length !== 1) return null;
    const yorliq = (n) => `N = ${n}`;
    return {
      tur: "chegara", id: `chegara:${soha.k}:${chegaralar.join(",")}:${qatorlar.map((q) => q.qiymat + (q.asl ? "+" : "-")).join("")}`,
      soha: soha.k, qatorlar, chegaralar, eng: chegaralar[ballar.indexOf(eng)],
      matn: `Qoida: «${soha.qoida("N")}». Chegarani maʼlumotdan tanla: qaysi N da qoida eng koʻp qatorda toʻgʻri?`,
      variantlar: chegaralar.map(yorliq), javob: yorliq(chegaralar[ballar.indexOf(eng)]),
      ishora: "Har N uchun alohida sanab chiq: nechta katakda qoida haqiqiy holatga mos keladi?",
      nega: chegaralar.map((n, i) => `${yorliq(n)}: ${ballar[i]} ta`).join("; ") + ". Model ham chegarani shunday tanlaydi.",
    };
  }

  // ================= 2-bosqich: AI ⊃ ML ⊃ DL =================
  const ZONALAR = ["oddiy", "ai", "ml", "dl"];
  const ZONA = {
    oddiy: "Oddiy dastur — AI emas",
    ai: "AI, lekin ML emas",
    ml: "ML, lekin DL emas",
    dl: "DL",
  };
  const TEXNOLOGIYALAR = [
    { z: "oddiy", d: 0, matn: "Kalkulyator: sonlarni tayyor formula boʻyicha qoʻshadi va koʻpaytiradi.", nega: "Aqliy vazifa yoʻq, oʻrganish yoʻq — tayyor formula." },
    { z: "oddiy", d: 0, matn: "Budilnik ilovasi: belgilangan vaqtda signal beradi.", nega: "Bitta shart: vaqt keldimi. Bu oddiy dastur." },
    { z: "oddiy", d: 0, matn: "Fayl menejeri: fayllarni nomi boʻyicha alifbo tartibida saralaydi.", nega: "Saralash — aniq algoritm, aqliy qaror emas." },
    { z: "oddiy", d: 1, matn: "Elektron jadval: katakdagi formulani hisoblab, yigʻindini chiqaradi.", nega: "Formulani foydalanuvchi yozgan; dastur faqat hisoblaydi." },
    { z: "oddiy", d: 1, matn: "Sayt formasi: telefon raqamida 9 ta raqam borligini tekshiradi.", nega: "Bitta qatʼiy tekshiruv — oddiy dastur." },
    { z: "oddiy", d: 2, matn: "«Aqlli» deb sotiladigan chiroq: har kuni soat 19:00 da yonadi, vaqt qoʻlda kiritilgan.", nega: "Nomi «aqlli» boʻlsa ham, bu taymer: qaror ham, oʻrganish ham yoʻq." },
    { z: "oddiy", d: 2, matn: "Arxivator: faylni aniq algoritm boʻyicha siqadi va aynan qayta tiklaydi.", nega: "Qatʼiy algoritm; natija har doim bir xil." },

    { z: "ai", d: 0, matn: "Ekspert tizim: shifokorlar yozgan yuzlab «agar … boʻlsa» qoidalari bilan tashxis taklif qiladi.", nega: "Mutaxassis kabi qaror qiladi — AI; qoidalar qoʻlda yozilgan — ML emas." },
    { z: "ai", d: 0, matn: "Shaxmat dasturi: yurishlarni oldindan koʻrib chiqadi; baholash qoidalarini dasturchi yozgan.", nega: "Aqliy oʻyin — AI; hech narsadan oʻrganmagan — ML emas." },
    { z: "ai", d: 0, matn: "Oʻyindagi raqib: qoʻlda yozilgan qoidalar bilan qachon hujum, qachon chekinishni tanlaydi.", nega: "Vaziyatga qarab qaror qiladi — AI; qoidalar qoʻlda yozilgan." },
    { z: "ai", d: 1, matn: "Qoidali chatbot: savoldagi kalit soʻzlarga qarab suhbat olib boradi; javob qoidalarini xodim yozgan.", nega: "Suhbat — aqliy vazifa, lekin maʼlumotdan oʻrganish yoʻq." },
    { z: "ai", d: 1, matn: "Kredit ekspert tizimi: bank mutaxassislari yozgan qoidalar zanjiri bilan qaror taklif qiladi.", nega: "Mutaxassis bilimi qoidalarga yozilgan — AI, ML emas." },
    { z: "ai", d: 2, matn: "«X–O» oʻyinchisi: barcha yurishlarni oxirigacha hisoblab, hech qachon yutqazmaydi; maʼlumotdan oʻrganmagan.", nega: "Yurish qidirish — klassik AI usuli; oʻqitish boʻlmagan." },
    { z: "ai", d: 2, matn: "Nosozlik maslahatchisi: muhandislar yozgan savollar daraxti boʻyicha mashina nosozligini topadi.", nega: "Daraxtni odamlar yozgan — bu ekspert tizim, ML emas." },

    { z: "ml", d: 0, matn: "Spam filtri: belgilangan xatlarda soʻzlar necha marta uchrashini sanab oʻrgangan; neyron tarmoq emas.", nega: "Maʼlumotdan oʻrgangan — ML; neyron tarmoq yoʻq — DL emas." },
    { z: "ml", d: 0, matn: "Uy narxi bashorati: sotilgan uylar jadvaliga toʻgʻri chiziq moslaydi (chiziqli regressiya).", nega: "Chiziq maʼlumotdan topilgan — ML; qatlamlar yoʻq." },
    { z: "ml", d: 0, matn: "Qaror daraxti: bemorlar jadvalidan qaysi belgi boʻyicha ajratishni oʻzi tanlagan.", nega: "Daraxt maʼlumotdan qurilgan — ML, lekin neyron tarmoq emas." },
    { z: "ml", d: 1, matn: "Eng yaqin qoʻshni usuli: yangi gulni jadvaldagi eng oʻxshash gullarga qarab turga ajratadi.", nega: "Javob misollar jadvalidan olinadi — ML; tarmoq yoʻq." },
    { z: "ml", d: 1, matn: "Mijozlarni guruhlash: xaridlar jadvalidagi oʻxshash mijozlarni oʻzi toʻdalarga ajratadi; qatlamli tarmoq yoʻq.", nega: "Guruhlar maʼlumotdan topiladi — ML, DL emas." },
    { z: "ml", d: 2, matn: "Kredit bahosi: oldingi qarzdorlar jadvalidan har belgiga bitta koeffitsiyent topgan sodda formula.", nega: "Koeffitsiyentlar maʼlumotdan topilgan — ML; bir necha son, chuqur tarmoq emas." },
    { z: "ml", d: 2, matn: "Savdo bashorati: oʻtgan yillar jadvalidan muzqaymoq savdosi va harorat orasiga toʻgʻri chiziq moslaydi.", nega: "Toʻgʻri chiziq — eng sodda ML modeli." },

    { z: "dl", d: 0, matn: "Yuzni tanish: millionlab suratda oʻqitilgan koʻp qatlamli neyron tarmoq.", nega: "Koʻp qatlamli neyron tarmoq — DL." },
    { z: "dl", d: 0, matn: "Nutqni matnga oʻgirish: minglab soat yozuvda oʻqitilgan chuqur neyron tarmoq.", nega: "Chuqur neyron tarmoq — DL." },
    { z: "dl", d: 0, matn: "Zamonaviy mashina tarjimoni: millionlab gap juftligida oʻqitilgan koʻp qatlamli neyron tarmoq.", nega: "Koʻp qatlamli neyron tarmoq — DL." },
    { z: "dl", d: 1, matn: "Matn yozadigan chatbot (katta til modeli): milliardlab vaznli neyron tarmoq.", nega: "Milliardlab vazn — juda chuqur tarmoq, yaʼni DL." },
    { z: "dl", d: 1, matn: "Rasm chizadigan model: tavsif boʻyicha yangi rasm yaratadi; oʻnlab qatlamli tarmoq.", nega: "Oʻnlab qatlam — DL." },
    { z: "dl", d: 2, matn: "Oʻzi yuradigan mashina kamerasi: kadrdagi piyodalarni topadi; modelida millionlab vazn va oʻnlab qatlam bor.", nega: "Millionlab vazn va oʻnlab qatlam — DL." },
    { z: "dl", d: 2, matn: "Rentgen tahlili: belgilarni suratdan oʻzi ajratadigan, yuz minglab suratda oʻqitilgan koʻp qatlamli tarmoq.", nega: "Koʻp qatlamli tarmoq — DL." },
  ];

  // Texnologiyani eng ichki mos halqaga joylash
  function joylaYasa(r, t) {
    const x = pick(TEXNOLOGIYALAR.filter(mosDaraja(t)), r);
    return {
      tur: "joyla", id: `joyla:${TEXNOLOGIYALAR.indexOf(x)}`, texnologiya: x.matn,
      matn: "Bu texnologiya qaysi halqaga tegishli? Eng ichki mos halqani tanla.",
      variantlar: ZONALAR.slice(), javob: x.z,
      ishora: "Uch savol: aqliy vazifani bajaradimi? Maʼlumotdan oʻrganganmi? Koʻp qatlamli neyron tarmoqmi?",
      nega: x.nega,
    };
  }

  // To‘liq bog‘langan tarmoqdagi bog‘lanishlar (vaznlar) soni
  const boglanishlar = (qatlamlar) => qatlamlar.slice(1).reduce((s, n, i) => s + qatlamlar[i] * n, 0);
  const boglanishYoz = (qatlamlar) => qatlamlar.slice(1).map((n, i) => `${qatlamlar[i]}·${n}`).join(" + ");

  // tier 0 — 2 qatlam, tier 1 — 3 qatlam, tier 2 — 4 qatlam
  function vaznYasa(r, t) {
    const soni = t + 2;
    const eng = [7, 6, 8][t];
    const qatlamlar = Array.from({ length: soni }, () => int(r, 2, eng));
    const javob = boglanishlar(qatlamlar);
    return {
      tur: "vazn", id: `vazn:${qatlamlar.join("-")}`, qatlamlar, javob,
      matn: `Neyron tarmoq qatlamlari: ${qatlamlar.join(" → ")} neyron. Qoʻshni qatlamlarda har neyron har neyronga ulangan. Jami nechta bogʻlanish (vazn) bor?`,
      nega: "Har qoʻshni juft uchun: chapdagi neyronlar × oʻngdagi neyronlar. Keyin hammasini qoʻsh.",
      hisob: `${boglanishYoz(qatlamlar)} = ${javob} ta vazn — har biri maʼlumotdan topiladi.`,
    };
  }

  const FIKR_TOGRI = [
    "Har qanday DL tizimi — ML tizimi ham.",
    "Har qanday ML tizimi AI ga kiradi.",
    "ML boʻlmagan AI ham bor: qoidalari qoʻlda yozilgan ekspert tizim.",
    "DL boʻlmagan ML ham bor: masalan, qaror daraxti.",
    "DL — koʻp qatlamli neyron tarmoqlarga asoslangan ML.",
    "Tarmoqda vaznlar koʻpaysa, uni oʻqitishga odatda koʻproq misol kerak.",
  ];
  const FIKR_XATO = [
    { matn: "Har qanday AI tizimi — DL tizimi.", nega: "Aksincha: DL — AI ning ichidagi eng kichik toʻplam." },
    { matn: "AI va ML — aynan bir xil tushuncha.", nega: "ML — AI ning qismi; qoʻlda yozilgan qoidali AI ham bor." },
    { matn: "DL — ML dan tashqaridagi alohida soha.", nega: "DL toʻliq ML ichida joylashgan." },
    { matn: "Har qanday ML modeli — neyron tarmoq.", nega: "Qaror daraxti va chiziqli regressiya — ML, lekin neyron tarmoq emas." },
    { matn: "Maʼlumotdan oʻrganmaydigan tizim AI boʻla olmaydi.", nega: "Ekspert tizim oʻrganmaydi, lekin AI ga kiradi." },
    { matn: "Vaznlari koʻp tarmoqqa kamroq misol yetadi.", nega: "Aksincha: sozlanadigan vazn koʻp boʻlsa, misol ham koʻp kerak." },
    { matn: "Qoidalari qoʻlda yozilgan ekspert tizim — ML ga kiradi.", nega: "ML — maʼlumotdan oʻrganish; qoʻlda yozilgan qoida oʻrganish emas." },
    { matn: "ML ning hammasi DL ichida joylashgan.", nega: "Aksincha: DL — ML ning bir qismi." },
  ];

  // tier ≤ 1: to‘rt fikrdan bittasi to‘g‘ri; tier 2: bittasi xato (xato topish)
  function fikrYasa(r, t) {
    const xatoIzlanadi = t === 2;
    const togri = aralash(FIKR_TOGRI, r).slice(0, xatoIzlanadi ? 3 : 1);
    const xato = aralash(FIKR_XATO, r).slice(0, xatoIzlanadi ? 1 : 3);
    const javob = xatoIzlanadi ? xato[0].matn : togri[0];
    const kalit = togri.map((x) => FIKR_TOGRI.indexOf(x)).concat(xato.map((x) => 10 + FIKR_XATO.indexOf(x))).sort((a, b) => a - b).join(",");
    return {
      tur: "fikr", id: `fikr:${xatoIzlanadi ? "x" : "t"}:${kalit}`, xatoIzlanadi,
      matn: xatoIzlanadi ? "Toʻrt fikrdan qaysi biri xato?" : "Toʻrt fikrdan qaysi biri toʻgʻri?",
      variantlar: aralash(togri.concat(xato.map((x) => x.matn)), r), javob,
      ishora: "Ichma-ich halqalarni koʻz oldingga keltir: DL ichkarida, ML oʻrtada, AI tashqarida.",
      nega: xatoIzlanadi ? xato[0].nega : "Qolgan uchtasi halqalar tartibiga zid: DL ⊂ ML ⊂ AI.",
    };
  }

  // ================= 3-bosqich: kompyuter ko‘rishi (CV) =================
  const N = 6; // rasm — N×N katak
  const SINFLAR = [
    { k: "mashina", belgi: "●" },
    { k: "odam", belgi: "▲" },
    { k: "daraxt", belgi: "■" },
  ];
  const belgi = (k) => SINFLAR.find((s) => s.k === k).belgi;

  // Kataklarni to‘liq qamraydigan eng kichik ramka
  function ramka(kataklar) {
    const rs = kataklar.map((k) => k[0]);
    const cs = kataklar.map((k) => k[1]);
    return { r0: Math.min(...rs), c0: Math.min(...cs), r1: Math.max(...rs), c1: Math.max(...cs) };
  }
  const yuza = (b) => (b.r1 - b.r0 + 1) * (b.c1 - b.c0 + 1);
  const ichida = (b, k) => k[0] >= b.r0 && k[0] <= b.r1 && k[1] >= b.c0 && k[1] <= b.c1;
  const tengRamka = (a, b) => a.r0 === b.r0 && a.c0 === b.c0 && a.r1 === b.r1 && a.c1 === b.c1;

  // Kataklar yonma-yon (4 qo‘shni) bog‘langanmi
  function boglangan(kataklar) {
    const kalit = (k) => k[0] * 100 + k[1];
    const bor = new Set(kataklar.map(kalit));
    const korilgan = new Set([kalit(kataklar[0])]);
    const navbat = [kataklar[0]];
    while (navbat.length) {
      const [a, b] = navbat.pop();
      for (const q of [[a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]]) {
        if (bor.has(kalit(q)) && !korilgan.has(kalit(q))) {
          korilgan.add(kalit(q));
          navbat.push(q);
        }
      }
    }
    return korilgan.size === kataklar.length;
  }

  // Shakl: h×w to‘rtburchakdan `olib` ta burchak olib tashlanadi; ramka o‘zgarmaydi, shakl uzilmaydi
  function shaklYasa(r, eng, olib) {
    for (let k = 0; k < 100; k++) {
      const h = int(r, 2, eng);
      const w = int(r, 2, eng);
      const burchaklar = aralash([[0, 0], [0, w - 1], [h - 1, 0], [h - 1, w - 1]], r).slice(0, olib);
      const kataklar = [];
      for (let a = 0; a < h; a++) for (let b = 0; b < w; b++) if (!burchaklar.some((q) => q[0] === a && q[1] === b)) kataklar.push([a, b]);
      if (kataklar.length < 3) continue;
      const b = ramka(kataklar);
      if (b.r0 !== 0 || b.c0 !== 0 || b.r1 !== h - 1 || b.c1 !== w - 1) continue;
      if (!boglangan(kataklar)) continue;
      return { h, w, kataklar };
    }
    return null;
  }

  // Rasm: `soni` ta obyekt, sinflari har xil, ramkalari bir-biriga tegmaydi
  function rasmYasa(r, soni, eng, olib) {
    for (let k = 0; k < 200; k++) {
      const sinflar = aralash(SINFLAR, r).slice(0, soni);
      const obyektlar = [];
      for (const sinf of sinflar) {
        const shakl = shaklYasa(r, eng, typeof olib === "function" ? olib(r) : olib);
        if (!shakl) break;
        const dr = int(r, 0, N - shakl.h);
        const dc = int(r, 0, N - shakl.w);
        const kataklar = shakl.kataklar.map((q) => [q[0] + dr, q[1] + dc]);
        const b = ramka(kataklar);
        const tegadi = obyektlar.some((o) => !(b.r1 + 1 < o.ramka.r0 || o.ramka.r1 + 1 < b.r0 || b.c1 + 1 < o.ramka.c0 || o.ramka.c1 + 1 < b.c0));
        if (tegadi) break;
        obyektlar.push({ sinf: sinf.k, kataklar, ramka: b });
      }
      if (obyektlar.length === soni) return { n: N, obyektlar };
    }
    return null;
  }
  const rasmKalit = (rasm) => rasm.obyektlar.map((o) => o.sinf[0] + o.kataklar.map((q) => q[0] * N + q[1]).join(".")).join("/");

  const VAZIFA = {
    tasnif: "Tasniflash",
    topish: "Obyektni topish",
    segment: "Segmentatsiya",
    emas: "Bu kompyuter koʻrishi emas",
  };
  const NATIJA_TURI = ["asl", "tasnif", "topish", "segment"];

  // Vazifa berilgan — to‘rt ko‘rinishdan qaysi biri shu vazifaning natijasi (rasmda bitta obyekt)
  function moslaYasa(r) {
    const rasm = rasmYasa(r, 1, 3, (rr) => int(rr, 0, 1));
    if (!rasm) return null;
    const javob = pick(["tasnif", "topish", "segment"], r);
    const tarif = {
      tasnif: "butun rasmga bitta yorliq",
      topish: "obyekt atrofida ramka va yorliq",
      segment: "har katakka (pikselga) sinf",
    };
    return {
      tur: "mosla", id: `mosla:${javob}:${rasmKalit(rasm)}`, rasm,
      matn: `Vazifa: ${VAZIFA[javob].toLowerCase()}. Toʻrt koʻrinishdan qaysi biri shu vazifaning natijasi?`,
      variantlar: aralash(NATIJA_TURI, r), javob,
      ishora: "Natija nimaga berilganiga qara: butun rasmgami, ramkagami yoki har katakkami?",
      nega: `${VAZIFA[javob]} natijasi — ${tarif[javob]}.`,
    };
  }

  // Obyektni topish: eng kichik ramka nechta katakni egallaydi
  function ramkaYasa(r, t) {
    const rasm = rasmYasa(r, 1, t === 0 ? 3 : 4, (rr) => int(rr, 1, 2));
    if (!rasm) return null;
    const b = rasm.obyektlar[0].ramka;
    return {
      tur: "ramka", id: `ramka:${rasmKalit(rasm)}`, rasm, javob: yuza(b),
      matn: "Obyektni topish natijasi — obyektni toʻliq qamraydigan eng kichik toʻgʻri toʻrtburchak ramka. U nechta katakni egallaydi?",
      nega: "Obyektning eng chap, eng oʻng, eng yuqori va eng pastki katagini top. Ramka yuzasi = eni × boʻyi.",
      hisob: `Ramka: ${b.c1 - b.c0 + 1} × ${b.r1 - b.r0 + 1} = ${yuza(b)} katak.`,
    };
  }

  // Segmentatsiya: so‘ralgan sinfga nechta katak tegishli (rasmda ikki obyekt)
  function maskaYasa(r) {
    const rasm = rasmYasa(r, 2, 4, (rr) => int(rr, 1, 2));
    if (!rasm) return null;
    const o = pick(rasm.obyektlar, r);
    return {
      tur: "maska", id: `maska:${o.sinf}:${rasmKalit(rasm)}`, rasm, sinf: o.sinf, javob: o.kataklar.length,
      matn: `Segmentatsiya har katakka (pikselga) sinf beradi. «${o.sinf}» sinfiga nechta katak tegishli?`,
      nega: `Faqat ${belgi(o.sinf)} belgili kataklarni sana; boshqa obyekt va fon kirmaydi.`,
      hisob: `«${o.sinf}» maskasi: ${o.kataklar.length} katak.`,
    };
  }

  // Ramka va maska farqi: ramka ichidagi nechta katak obyektga tegishli emas
  function ortiqchaYasa(r) {
    const rasm = rasmYasa(r, 2, 4, (rr) => int(rr, 1, 3));
    if (!rasm) return null;
    const o = pick(rasm.obyektlar, r);
    const javob = yuza(o.ramka) - o.kataklar.length;
    if (javob < 1) return null;
    return {
      tur: "ortiqcha", id: `ortiqcha:${o.sinf}:${rasmKalit(rasm)}`, rasm, sinf: o.sinf, javob,
      matn: `«${o.sinf}» atrofiga eng kichik ramka chizildi. Ramka ichidagi nechta katak obyektga tegishli emas (fon)?`,
      nega: "Ramka yuzasidan obyekt kataklari sonini ayir. Segmentatsiya aynan shu ortiqcha kataklarni chiqarib tashlaydi.",
      hisob: `${yuza(o.ramka)} − ${o.kataklar.length} = ${javob} katak fon — ramka qoʻpolroq, maska aniqroq.`,
    };
  }

  const XATO = {
    togri: "Xato yoʻq: hamma obyekt toʻgʻri topilgan",
    ramka: "Ramka obyektni toʻliq qamramagan",
    yorliq: "Ramka joyida, lekin yorliq notoʻgʻri",
    yoq: "Bitta obyekt umuman topilmagan",
  };

  // Obyektni topish natijasidagi xatoni aniqlash (rasmda ikki obyekt)
  function xatoYasa(r) {
    const rasm = rasmYasa(r, 2, 4, (rr) => int(rr, 0, 2));
    if (!rasm) return null;
    const holat = pick(Object.keys(XATO), r);
    const i = int(r, 0, 1);
    let natija = rasm.obyektlar.map((o) => ({ sinf: o.sinf, ramka: Object.assign({}, o.ramka) }));
    if (holat === "ramka") {
      const b = natija[i].ramka;
      const tomonlar = [];
      if (b.r1 > b.r0) tomonlar.push("r0", "r1");
      if (b.c1 > b.c0) tomonlar.push("c0", "c1");
      const tomon = pick(tomonlar, r);
      b[tomon] += tomon.endsWith("0") ? 1 : -1; // bir qator yoki ustunga qisqaradi
    } else if (holat === "yorliq") {
      natija[i].sinf = pick(SINFLAR.filter((s) => s.k !== natija[i].sinf), r).k;
    } else if (holat === "yoq") {
      natija = natija.filter((_, k) => k !== i);
    }
    return {
      tur: "xato", id: `xato:${holat}:${i}:${rasmKalit(rasm)}:${natija.map((x) => x.sinf[0] + Object.values(x.ramka).join("")).join("/")}`,
      rasm, natija, holat,
      matn: "Model «obyektni topish» natijasini berdi: ramkalar va yorliqlar. Natijada qanday xato bor?",
      variantlar: Object.values(XATO), javob: XATO[holat],
      ishora: "Har obyekt uchun uch narsani tekshir: ramka bormi, obyekt toʻliq ichidami, yorliq belgiga mosmi.",
      nega: {
        togri: "Har obyekt toʻliq ramka ichida va yorligʻi belgisiga mos.",
        ramka: "Obyektning kamida bitta katagi ramkadan tashqarida qolgan.",
        yorliq: "Ramka toʻgʻri joyda, lekin yorliq obyekt belgisiga mos emas.",
        yoq: "Rasmda ikki obyekt bor, natijada esa bitta ramka.",
      }[holat],
    };
  }

  // Vaziyatga qaysi CV vazifasi kerak
  const VAZIYATLAR = [
    { j: "tasnif", d: 0, matn: "Galereya ilovasi har suratga bitta yorliq qoʻyadi: «taom», «tabiat» yoki «hujjat».", nega: "Butun rasmga bitta yorliq — tasniflash." },
    { j: "tasnif", d: 0, matn: "Dastur barg suratiga qarab bitta javob beradi: «sogʻlom» yoki «kasal».", nega: "Bitta surat — bitta javob: tasniflash." },
    { j: "tasnif", d: 1, matn: "Saralash liniyasi kamerasi har mevaga bitta baho beradi: «pishgan» yoki «xom».", nega: "Har surat uchun bitta sinf — tasniflash." },
    { j: "tasnif", d: 2, matn: "Dastur rentgen surati uchun faqat bitta xulosa chiqaradi: «oʻzgarish bor» yoki «yoʻq» — joyini koʻrsatmaydi.", nega: "Joyi koʻrsatilmaydi, faqat bitta yorliq — tasniflash." },
    { j: "topish", d: 0, matn: "Yoʻl kamerasi kadrdagi har bir mashinani ramkaga oladi va ularni sanaydi.", nega: "Har obyektga ramka — obyektni topish." },
    { j: "topish", d: 0, matn: "Telefon kamerasi suratga olishdan oldin har bir yuz atrofiga toʻrtburchak chizadi.", nega: "Toʻrtburchak ramka — obyektni topish." },
    { j: "topish", d: 1, matn: "Doʻkon kamerasi javondagi har bir mahsulot qayerda turganini ramka bilan belgilaydi.", nega: "Qayerda va nima — ramka bilan: obyektni topish." },
    { j: "topish", d: 2, matn: "Dron dalada nechta qoʻy borligini va har biri taxminan qayerdaligini aniqlaydi; aniq chegarasi kerak emas.", nega: "Soni va taxminiy joyi kerak, aniq chegara emas — ramka yetadi." },
    { j: "segment", d: 0, matn: "Video-qoʻngʻiroq ilovasi odamga tegishli har pikselni ajratib, fonni xiralashtiradi.", nega: "Har pikselga «odam» yoki «fon» — segmentatsiya." },
    { j: "segment", d: 0, matn: "Tibbiy dastur suratda oʻsma egallagan sohani piksel aniqligida boʻyab beradi.", nega: "Piksel aniqligidagi soha — segmentatsiya." },
    { j: "segment", d: 1, matn: "Oʻzi yuradigan mashina kadrning har pikselini belgilaydi: yoʻl, yoʻlak, osmon.", nega: "Har pikselga sinf — segmentatsiya." },
    { j: "segment", d: 2, matn: "Sunʼiy yoʻldosh suratidan ekin maydonini gektarda hisoblash uchun ekin egallagan aniq soha kerak.", nega: "Maydonni oʻlchash uchun ramka qoʻpol — aniq soha, yaʼni segmentatsiya kerak." },
    { j: "emas", d: 0, matn: "Tarjimon inglizcha matnni oʻzbekchaga oʻgiradi.", nega: "Kirish — matn, rasm emas." },
    { j: "emas", d: 0, matn: "Ovozli yordamchi aytilgan gapni matnga aylantiradi.", nega: "Kirish — ovoz, rasm emas." },
    { j: "emas", d: 1, matn: "Tavsiya tizimi tomosha tarixiga qarab keyingi videoni taklif qiladi.", nega: "U videoning ichiga qaramaydi — tomosha tarixi jadvali bilan ishlaydi." },
    { j: "emas", d: 2, matn: "Bank tizimi toʻlovlar jadvalidan shubhali oʻtkazmani topadi.", nega: "Kirish — sonlar jadvali, rasm emas." },
  ];

  function vaziyatYasa(r, t) {
    const x = pick(VAZIYATLAR.filter(mosDaraja(t)), r);
    return {
      tur: "vaziyat", id: `vaziyat:${VAZIYATLAR.indexOf(x)}`, vaziyat: x.matn,
      matn: "Bu vaziyatga qaysi vazifa mos?",
      variantlar: Object.values(VAZIFA), javob: VAZIFA[x.j],
      ishora: "Natija qanday boʻlishi kerak: bitta yorliqmi, ramkalarmi yoki har pikselga sinfmi? Kirish rasmmi oʻzi?",
      nega: x.nega,
    };
  }

  const BOSQICH1 = [[tanlaYasa, qoidaYasa], [tanlaYasa, qoidaYasa, chegaraYasa], [tanlaYasa, qoidaYasa, chegaraYasa]];
  const BOSQICH2 = [[joylaYasa, vaznYasa], [joylaYasa, vaznYasa, fikrYasa], [joylaYasa, vaznYasa, fikrYasa]];
  const BOSQICH3 = [[moslaYasa, ramkaYasa, vaziyatYasa], [xatoYasa, ramkaYasa, maskaYasa, vaziyatYasa], [xatoYasa, ortiqchaYasa, vaziyatYasa]];

  const api = {
    QOIDALI, ORGANGAN, SOHALAR, ZONALAR, ZONA, TEXNOLOGIYALAR, FIKR_TOGRI, FIKR_XATO,
    N, SINFLAR, VAZIFA, NATIJA_TURI, XATO, VAZIYATLAR,
    aralash, togriSoni, boglanishlar, boglanishYoz, belgi, ramka, yuza, ichida, tengRamka, boglangan, rasmYasa,
    tanlaTask: bitta(tanlaYasa), qoidaTask: bitta(qoidaYasa), chegaraTask: bitta(chegaraYasa),
    joylaTask: bitta(joylaYasa), vaznTask: bitta(vaznYasa), fikrTask: bitta(fikrYasa),
    moslaTask: bitta(moslaYasa), ramkaTask: bitta(ramkaYasa), maskaTask: bitta(maskaYasa),
    ortiqchaTask: bitta(ortiqchaYasa), xatoTask: bitta(xatoYasa), vaziyatTask: bitta(vaziyatYasa),
    bosqich1Task: generator(BOSQICH1), bosqich2Task: generator(BOSQICH2), bosqich3Task: generator(BOSQICH3),
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
