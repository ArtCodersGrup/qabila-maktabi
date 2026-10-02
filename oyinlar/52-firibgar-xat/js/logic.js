// 52-o'yin: firibgar xat — soxta xabarni tanish (belgilar, manzil tekshiruvi, to'g'ri harakat).
// Sof mantiq, ekran kodi yo'q. Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const pick = (list, r) => list[Math.floor(r() * list.length)];

  function aralash(list, r) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // Ketma-ket bir xil savol chiqmasligi uchun (QOIDALAR 4.3)
  function pickNew(make, prev, r) {
    for (let k = 0; k < 40; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  // ---------- Firibgar xatning belgilari ----------
  // Har belgi: nomi, nega shubhali va bitta misol. Hujum usuli emas — faqat tanish uchun.
  const BELGILAR = [
    { id: "shoshiltirish", nom: "Shoshiltirish",
      izoh: "Oʻylashga vaqt bermaydi: «1 soat ichida», «hoziroq», «kech boʻladi».",
      misol: "Faqat 1 soat vaqting bor, tezda bos!" },
    { id: "qorqitish", nom: "Qoʻrqitish",
      izoh: "Yomon narsa boʻlishi bilan qoʻrqitadi: hisob yopiladi, jarima yoziladi.",
      misol: "Hisobing butunlay yopiladi va jarima yoziladi." },
    { id: "parol", nom: "Parol yoki kod soʻrash",
      izoh: "Hech bir rasmiy tashkilot parolni yoki SMS kodini soʻramaydi.",
      misol: "Parolingni va SMS kodini shu yerga yoz." },
    { id: "manzil", nom: "Gʻalati manzil",
      izoh: "Manzil haqiqiysiga oʻxshaydi, lekin nomi yoki zonasi boshqa.",
      misol: "qabi1abank.uz — «l» harfi oʻrnida «1» raqami." },
    { id: "yutuq", nom: "Kutilmagan yutuq",
      izoh: "Qatnashmagan oʻyinda sovrin chiqmaydi, bepul sovgʻa oʻzi kelmaydi.",
      misol: "Tabriklaymiz! Sen yangi telefon yutding." },
    { id: "imlo", nom: "Imlo xatolari",
      izoh: "Rasmiy xat shoshma-shosharlik bilan, xato harflar bilan yozilmaydi.",
      misol: "Hurmatli foydalanuvchu, hisobingiz tasdiqlanmagan." },
    { id: "sir", nom: "Sir tutishni soʻrash",
      izoh: "«Hech kimga aytma» — firibgarning eng sevimli gapi. Yaxshi odam kattalardan yashirishni soʻramaydi.",
      misol: "Buni hech kimga, kattalarga ham aytma." },
    { id: "pul", nom: "Pul soʻrash",
      izoh: "Tanish odamning nomidan shoshilib pul soʻralsa, bu firibgar boʻlishi mumkin.",
      misol: "Menga hozir pul kerak, tez joʻnatib yubor." },
  ];

  const belgi = (id) => BELGILAR.find((b) => b.id === id) || null;

  // Matnda belgini tanitadigan so'zlar. Test shuni tekshiradi: e'lon qilingan belgi
  // haqiqatan xat matnida bor. "manzil" manzil tekshiruvi bilan, "imlo" ko'z bilan tekshiriladi.
  const KALIT = {
    shoshiltirish: ["soat", "daqiqa", "bugun", "hoziroq", "tez", "zudlik", "ichida"],
    qorqitish: ["yopiladi", "oʻchir", "oʻchib", "jarima", "bloklanadi"],
    parol: ["parol", "kod"],
    yutuq: ["yutuq", "yutding", "sovgʻa", "sovrin", "tabrik", "bonus", "tanga", "bepul"],
    sir: ["aytma", "koʻrsatma", "sir "],
    pul: ["pul", "soʻm", "toʻlov", "toʻla"],
    manzil: [],
    imlo: [],
  };

  // 1-bosqich mashqi uchun misollar: har belgiga kamida ikkita
  const BELGI_MISOL = [
    { id: "shosh-1", belgi: "shoshiltirish", matn: "Faqat 10 daqiqa vaqting bor, tezda bos!" },
    { id: "shosh-2", belgi: "shoshiltirish", matn: "Bugun kech soat sakkizgacha javob bermasang, kech boʻladi." },
    { id: "qorq-1", belgi: "qorqitish", matn: "Hisobing ertaga butunlay oʻchirib tashlanadi." },
    { id: "qorq-2", belgi: "qorqitish", matn: "Javob bermasang, ustingdan jarima yoziladi." },
    { id: "parol-1", belgi: "parol", matn: "Parolingni va SMS kodini shu yerga yozib yubor." },
    { id: "parol-2", belgi: "parol", matn: "Hisobni tasdiqlash uchun eski parolingni kirit." },
    { id: "manzil-1", belgi: "manzil", matn: "Havoladagi manzil: qabi1abank.uz — «l» oʻrnida «1» raqami." },
    { id: "manzil-2", belgi: "manzil", matn: "Havoladagi manzil: qabilabank-tekshiruv.xyz — nomga qoʻshimcha soʻz yopishtirilgan." },
    { id: "yutuq-1", belgi: "yutuq", matn: "Tabriklaymiz! Hech qatnashmagan oʻyinda telefon yutding." },
    { id: "yutuq-2", belgi: "yutuq", matn: "Sening raqaming million sovrin ichidan chiqdi." },
    { id: "imlo-1", belgi: "imlo", matn: "Hurmatli foydalanuvchu, hisobingiz tasdiqlanmagan holatda turadi." },
    { id: "imlo-2", belgi: "imlo", matn: "Xatni oqib chiqishingiz va javob berishingiz soʻralinadi." },
    { id: "sir-1", belgi: "sir", matn: "Buni hech kimga, kattalarga ham aytma." },
    { id: "sir-2", belgi: "sir", matn: "Bu taklif faqat senga. Hech kimga koʻrsatma." },
    { id: "pul-1", belgi: "pul", matn: "Menga hozir pul kerak, tez joʻnatib yubor." },
    { id: "pul-2", belgi: "pul", matn: "Hisobimga 50 ming soʻm tashlab yuborsang boʻladi." },
  ];

  // ---------- Manzil (domen) solishtirish ----------
  // Oʻylab topilgan tashkilotlar va ularning haqiqiy manzillari.
  const TASHKILOTLAR = [
    { id: "bank", nom: "Qabila bank", domen: "qabilabank.uz" },
    { id: "maktab", nom: "Maktab tizimi", domen: "qabilamaktab.uz" },
    { id: "dostlar", nom: "Doʻstlar ilovasi", domen: "dostlar.uz" },
    { id: "pochta", nom: "Qabila pochta", domen: "qabilapochta.uz" },
    { id: "dokon", nom: "Kitob doʻkoni", domen: "kitobuy.uz" },
    { id: "oyin", nom: "Oʻyin maydoni", domen: "oyinmaydon.uz" },
  ];

  const tashkilot = (id) => TASHKILOTLAR.find((t) => t.id === id) || null;

  // Ikki bo'lakli zonalar: "qabilabank.com.uz" da zona — "com.uz"
  const IKKI_ZONA = ["com.uz", "co.uz", "org.uz", "net.uz", "com.ru"];
  // Arzon, bir kunda olinadigan zonalar — rasmiy tashkilot bunday zonada turmaydi
  const GUMONLI_ZONA = ["xyz", "top", "site", "online", "shop", "biz", "cc", "icu"];
  // Ko'zga bir xil ko'rinadigan belgilar: 1 = l, 0 = o, 5 = s …
  const CHALKASH = { "0": "o", "1": "l", "3": "e", "4": "a", "5": "s", "6": "b", "7": "t", "8": "b", "9": "g", "@": "a", "$": "s", "!": "l", "|": "l" };

  // Manzilni bo'laklarga ajratish. Hal qiluvchi qism — zonadan oldingi nom.
  // "xavfsizlik@kirish.qabilabank.uz" → nom "qabilabank", zona "uz", oldi ["kirish"]
  function ajrat(manzil) {
    let s = String(manzil == null ? "" : manzil).trim().toLowerCase();
    s = s.replace(/^[a-z]+:\/\//, "").split("/")[0].split("?")[0];
    s = s.split("@").pop().replace(/^www\./, "").replace(/\.+$/, "");
    const bolak = s.split(".").filter(Boolean);
    let zona = bolak.length > 1 ? bolak[bolak.length - 1] : "";
    let nomlar = bolak.length > 1 ? bolak.slice(0, -1) : bolak;
    if (bolak.length > 2 && IKKI_ZONA.includes(bolak.slice(-2).join("."))) {
      zona = bolak.slice(-2).join(".");
      nomlar = bolak.slice(0, -2);
    }
    return { toliq: s, zona, nomlar, nom: nomlar.length ? nomlar[nomlar.length - 1] : "", oldi: nomlar.slice(0, -1) };
  }

  // Ko'zga o'xshash belgilarni bir xil ko'rinishga keltirish
  const sodda = (nom) => [...String(nom)].map((ch) => CHALKASH[ch] || ch).join("").replace(/rn/g, "m").replace(/vv/g, "w");

  // Ikki so'z orasidagi eng kichik tahrir soni (qo'shish, o'chirish, almashtirish)
  function tahrir(a, b) {
    const n = a.length;
    const m = b.length;
    let oldin = Array.from({ length: m + 1 }, (_, j) => j);
    for (let i = 1; i <= n; i++) {
      const hozir = [i];
      for (let j = 1; j <= m; j++) {
        hozir[j] = Math.min(oldin[j] + 1, hozir[j - 1] + 1, oldin[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      oldin = hozir;
    }
    return oldin[m];
  }

  const FARQ_IZOH = {
    harf: "Nomdagi harf almashtirilgan — koʻzga deyarli bir xil koʻrinadi.",
    qoshimcha: "Nomga qoʻshimcha soʻz yopishtirilgan. Zonadan oldingi nom boshqa boʻlib qolgan.",
    zona: "Nom toʻgʻri, lekin zona boshqa. Zonasi boshqa manzil — boshqa egasi.",
    boshqa: "Bu manzil tashkilotning haqiqiy manziliga umuman oʻxshamaydi.",
    gumonli: "Bunday arzon zonadagi manzilni xohlagan odam bir kunda olib qoʻyadi.",
  };

  // Qoida: haqiqiy manzilni soxtasidan farqlash. Faqat zonadan oldingi nom va zona solishtiriladi,
  // chunki "kirish.qabilabank.uz" — bankning oʻz boʻlimi, "qabilabank.kirish.uz" esa boshqa egasi.
  function domenFarqi(haqiqiy, berilgan) {
    const a = ajrat(haqiqiy);
    const b = ajrat(berilgan);
    const natija = (xil) => ({
      xil, izoh: xil ? FARQ_IZOH[xil] : "Nom va zona haqiqiysi bilan bir xil.",
      berilgan: b.toliq, nom: b.nom, zona: b.zona,
      kutilgan: a.toliq, kutilganNom: a.nom, kutilganZona: a.zona,
      zonaBoshqa: a.zona !== b.zona,
    });
    if (!b.nom || !b.zona) return natija("boshqa");
    if (a.nom === b.nom) return a.zona === b.zona ? natija(null) : natija("zona");
    // Haqiqiy nom manzil ichida bor, lekin hal qiluvchi joyda emas
    if (b.oldi.includes(a.nom) || b.nom.includes(a.nom) || (b.nom.length >= 4 && a.nom.includes(b.nom))) return natija("qoshimcha");
    const sa = sodda(a.nom);
    const sb = sodda(b.nom);
    const chek = Math.min(sa.length, sb.length) >= 6 ? 2 : 1;
    if (sa === sb || tahrir(sa, sb) <= chek) return natija("harf");
    return natija("boshqa");
  }

  const gumonliZona = (manzil) => GUMONLI_ZONA.includes(ajrat(manzil).zona);

  // Bitta manzilni baholash. Tashkilot maʼlum boʻlsa — uning manzili bilan solishtiriladi,
  // maʼlum boʻlmasa — faqat zonasi tekshiriladi.
  function birManzil(joy, domen) {
    if (domen) return domenFarqi(domen, joy);
    const z = ajrat(joy);
    if (GUMONLI_ZONA.includes(z.zona)) {
      return { xil: "gumonli", izoh: FARQ_IZOH.gumonli, berilgan: z.toliq, nom: z.nom, zona: z.zona };
    }
    return { xil: null, izoh: "Manzilda gʻalati narsa yoʻq.", berilgan: z.toliq, nom: z.nom, zona: z.zona };
  }

  // Xatdagi yuboruvchi manzili va havolasi — ikkisi ham tekshiriladi
  function manzilBahosi(xabar) {
    const t = tashkilot(xabar.tashkilot);
    const domen = t ? t.domen : null;
    const joylar = [xabar.manzil, xabar.havola].filter(Boolean);
    let oxirgi = { xil: null, izoh: "Manzilda gʻalati narsa yoʻq.", joy: "" };
    for (const joy of joylar) {
      const b = Object.assign({ joy }, birManzil(joy, domen));
      if (b.xil) return b;
      oxirgi = b;
    }
    return oxirgi;
  }

  const ishonchliManzil = (xabar) => manzilBahosi(xabar).xil === null;

  // ---------- Xabarlar ----------
  // Yarmi haqiqiy, yarmi soxta. Tashkilot nomlari oʻylab topilgan.
  const XABARLAR = [
    // --- Haqiqiy ---
    {
      id: "maktab-jadval", tashkilot: "maktab",
      kimdan: "Maktab tizimi", manzil: "xabar@qabilamaktab.uz",
      sarlavha: "Dushanba kuni dars jadvali oʻzgardi",
      matn: "Salom! Dushanba kuni uchinchi dars informatika boʻladi. Toʻliq jadval saytdagi «Jadval» boʻlimida turadi. Savoling boʻlsa, sinf rahbaringga ayt.",
      havola: "https://qabilamaktab.uz/jadval",
      soxta: false, belgilar: [],
    },
    {
      id: "bank-xarid", tashkilot: "bank",
      kimdan: "Qabila bank", manzil: "xabar@qabilabank.uz",
      sarlavha: "Kartadan xarid: 25 000 soʻm",
      matn: "Kitob doʻkonida 25 000 soʻm xarid qilindi. Agar bu sen boʻlmasang, ilovadagi «Yordam» boʻlimidan yoz. Biz hech qachon parol yoki SMS kod soʻramaymiz.",
      havola: "https://qabilabank.uz/tarix",
      soxta: false, belgilar: [],
    },
    {
      id: "dost-tugilgan", tashkilot: "dostlar",
      kimdan: "Doʻstim Sardor", manzil: "sardor@dostlar.uz",
      sarlavha: "Shanba kuni tugʻilgan kunim",
      matn: "Shanba kuni soat beshda tugʻilgan kunim boʻladi. Kelasanmi? Manzilni onamga yubordim, u sening onangga aytadi.",
      havola: "",
      soxta: false, belgilar: [],
    },
    {
      id: "dokon-buyurtma", tashkilot: "dokon",
      kimdan: "Kitob doʻkoni", manzil: "buyurtma@kitobuy.uz",
      sarlavha: "Buyurtmang doʻkonga keldi",
      matn: "Buyurtma qilgan kitobing doʻkonga keldi. Oʻzingga qulay kunda olib ketsang boʻladi — kitob bir oy saqlanadi. Hech narsa yozish kerak emas.",
      havola: "https://kitobuy.uz/buyurtma/8124",
      soxta: false, belgilar: [],
    },
    {
      id: "oyin-yangilik", tashkilot: "oyin",
      kimdan: "Oʻyin maydoni", manzil: "xabar@oyinmaydon.uz",
      sarlavha: "Oʻyinga yangi bosqich qoʻshildi",
      matn: "Oʻyinga yangi bosqich qoʻshildi. Istasang, oʻyinni ochib koʻrasan. Hech qanday maʼlumot yozish yoki haq toʻlash shart emas.",
      havola: "https://oyinmaydon.uz/yangilik",
      soxta: false, belgilar: [],
    },
    {
      id: "pochta-qurilma", tashkilot: "pochta",
      kimdan: "Qabila pochta", manzil: "xavfsizlik@qabilapochta.uz",
      sarlavha: "Hisobingga yangi qurilmadan kirildi",
      matn: "Hisobingga yangi telefondan kirildi. Bu sen boʻlsang, hech narsa qilish kerak emas. Sen boʻlmasang, parolni oʻzing ilovadan oʻzgartir. Biz havola yubormaymiz va parol soʻramaymiz.",
      havola: "https://kirish.qabilapochta.uz/qurilmalar",
      soxta: false, belgilar: [],
    },
    {
      id: "maktab-sport", tashkilot: "maktab",
      kimdan: "Sinf rahbari", manzil: "rahbar@qabilamaktab.uz",
      sarlavha: "Ertaga sport kuni",
      matn: "Ertaga sport kuni boʻladi, sport kiyimingni olib kel. Pul yoki boshqa hech qanday maʼlumot kerak emas.",
      havola: "",
      soxta: false, belgilar: [],
    },
    // --- Soxta ---
    {
      id: "bank-yopiladi", tashkilot: "bank",
      kimdan: "Qabila bank xavfsizlik boʻlimi", manzil: "xavfsizlik@qabilabank-tekshiruv.xyz",
      sarlavha: "DIQQAT! Hisobing 1 soat ichida yopiladi",
      matn: "Hisobingda gʻalati harakat sezildi. 1 soat ichida havolani bosib parolingni va SMS kodini kiritmasang, hisob butunlay yopiladi. Bu xatni hech kimga koʻrsatma.",
      havola: "https://qabilabank-tekshiruv.xyz/kirish",
      soxta: true, belgilar: ["manzil", "shoshiltirish", "qorqitish", "parol", "sir"],
    },
    {
      id: "yutuq-telefon", tashkilot: null,
      kimdan: "Sovgʻa xizmati", manzil: "sovga@yutuq-markaz.top",
      sarlavha: "Sen yangi telefon yutib olding!",
      matn: "Tabrikliymiz! Sening raqamingiz sovrin uchin tanlandi. Sovgʻani olish uchun 2 soat ichida ismingni va karta raqamingni javob xatida yubor.",
      havola: "https://yutuq-markaz.top/sovga",
      soxta: true, belgilar: ["yutuq", "manzil", "shoshiltirish", "imlo"],
    },
    {
      id: "dost-pul", tashkilot: "dostlar",
      kimdan: "Sardor", manzil: "sardor.dostlar@tez-pochta.site",
      sarlavha: "Zudlik bilan pul kerak",
      matn: "Salom, bu men, Sardor. Telefonim buzildi, shuning uchun boshqa manzildan yozdim. Menga hozir pul kerak, 20 daqiqa ichida tashlab yubor. Hech kimga aytma, keyin oʻzim tushuntiraman.",
      havola: "",
      soxta: true, belgilar: ["pul", "manzil", "shoshiltirish", "sir"],
    },
    {
      id: "maktab-parol", tashkilot: "maktab",
      kimdan: "Maktab tizimi", manzil: "admin@qabi1amaktab.uz",
      sarlavha: "Hisobingni tasdiqla",
      matn: "Baholaring oʻchib ketmasligi uchun bugun soat sakkizgacha havolani bos va parolingni kirit. Tasdiqlamagan oʻquvchilarning hisobi oʻchiriladi.",
      havola: "https://qabi1amaktab.uz/kirish",
      soxta: true, belgilar: ["manzil", "parol", "shoshiltirish", "qorqitish"],
    },
    {
      id: "oyin-tanga", tashkilot: "oyin",
      kimdan: "Oʻyin maydoni sovgʻa boʻlimi", manzil: "bonus@oyinmaydon.xyz",
      sarlavha: "Bepul 10 000 tanga",
      matn: "Doʻstingdan sovgʻa keldi: 10 000 tanga. Olish uchun oʻyindagi parolingni shu yerga yoz. Hech kimga aytmasang, tangalar ikki barobar boʻladi.",
      havola: "https://oyinmaydon.xyz/tanga",
      soxta: true, belgilar: ["yutuq", "manzil", "parol", "sir"],
    },
    {
      id: "pochta-jarima", tashkilot: "pochta",
      kimdan: "Qabila pochta boʻlimi", manzil: "xabar@qabilapochta.tekshir.uz",
      sarlavha: "Pochtang bugun bloklanadi",
      matn: "Hisobingda ortiqcha xat yigʻilib qolgan. Bugun kech soat oltigacha toʻlov qilmasang, hisob bloklanadi va jarima yoziladi.",
      havola: "https://qabilapochta.tekshir.uz/tolov",
      soxta: true, belgilar: ["manzil", "qorqitish", "shoshiltirish", "pul"],
    },
    {
      id: "dostlar-notanish", tashkilot: "dostlar",
      kimdan: "Notanish odam", manzil: "yangi.dost@dostlar.uz",
      sarlavha: "Oʻyin uchun parolingni ber",
      matn: "Salom! Men sening oʻyindagi doʻstingman. Hisobingga sovgʻa qoʻyib beraman, faqat parolingni yozib yubor. Buni hech kimga, kattalarga ham aytma.",
      havola: "",
      soxta: true, belgilar: ["parol", "sir", "yutuq"],
    },
  ];

  // ---------- Vaziyatlar: nima qilaman ----------
  const VAZIYATLAR = [
    {
      id: "ota-pul",
      matn: "Otangning nomidan xabar keldi: «Telefonim buzildi, hozir pul kerak, hech kimga aytma». Nima qilasan?",
      nega: "Firibgar tanish odamning nomidan yozadi. Oʻzingga maʼlum raqamga qoʻngʻiroq qilsang, hammasi darhol ayon boʻladi.",
      javoblar: [
        { matn: "Otamga oʻzim qoʻngʻiroq qilaman va onamga koʻrsataman.", togri: true },
        { matn: "Pulni tez joʻnatib yuboraman." },
        { matn: "Xabardagi havolani bosib koʻraman." },
        { matn: "Hech kimga aytmayman, oʻzim hal qilaman." },
      ],
    },
    {
      id: "bank-havola",
      matn: "«Qabila bank» nomidan xat keldi: havolani bosib parolni kirit, deydi. Nima qilasan?",
      nega: "Bank hech qachon parol soʻramaydi. Hisobni faqat oʻzing bilgan rasmiy ilovadan yoki oʻzing yozgan manzildan tekshir.",
      javoblar: [
        { matn: "Havolani bosmayman, bankning rasmiy ilovasidan oʻzim kiraman.", togri: true },
        { matn: "Havolani bosaman, keyin qaror qilaman." },
        { matn: "Parolni kiritaman, manzil oʻxshash ekan." },
        { matn: "Doʻstimga yuboraman, u tekshirib beradi." },
      ],
    },
    {
      id: "sms-kod",
      matn: "Telefoningga SMS kod keldi. Notanish odam: «oʻsha kodni menga aytib yubor», deydi. Nima qilasan?",
      nega: "SMS kod — bir martalik kalit. Uni soʻragan odam sening hisobingga kirmoqchi. Kod faqat senda qoladi.",
      javoblar: [
        { matn: "Kodni hech kimga aytmayman.", togri: true },
        { matn: "Bir marta aytaman, keyin kod oʻzgaradi." },
        { matn: "Aytaman, u bank xodimi boʻlsa kerak." },
        { matn: "Kodning yarmini aytaman." },
      ],
    },
    {
      id: "yutuq-soat",
      matn: "«2 soat ichida maʼlumotingni yubor — telefon yutding» degan xat keldi. Nima qilasan?",
      nega: "Qatnashmagan oʻyinda yutuq chiqmaydi. Shoshiltirish — oʻylashga vaqt bermaslik uchun qilinadi.",
      javoblar: [
        { matn: "Eʼtibor bermayman va xatni kattalarga koʻrsataman.", togri: true },
        { matn: "Maʼlumotimni yuboraman, yutuq qoʻldan ketmasin." },
        { matn: "Faqat ismimni yozaman, zarari yoʻq." },
        { matn: "Havolani bosib, qanday sovgʻa ekanini koʻraman." },
      ],
    },
    {
      id: "manzil-oxshash",
      matn: "Xatdagi manzil qabi1abank.uz — haqiqiysiga oʻxshaydi, lekin «l» oʻrnida «1» raqami turadi. Nima qilasan?",
      nega: "Zonadan oldingi nomni harfma-harf solishtir. Bitta belgi ham boshqa boʻlsa — bu butunlay boshqa sayt.",
      javoblar: [
        { matn: "Havolani bosmayman, manzilni kattalar bilan tekshiraman.", togri: true },
        { matn: "Bosaman, deyarli bir xil ekan." },
        { matn: "Bosaman, lekin hech narsa yozmayman." },
        { matn: "Doʻstlarimga ham tarqataman." },
      ],
    },
    {
      id: "sir-tut",
      matn: "Xatda: «Buni hech kimga, kattalarga ham aytma» deb yozilgan. Nima qilasan?",
      nega: "Sir tutishni soʻrash — eng aniq belgi. Yaxshi niyatli odam kattalardan yashirishni soʻramaydi.",
      javoblar: [
        { matn: "Aynan shuning uchun kattalarga aytaman.", togri: true },
        { matn: "Aytmayman, soʻz berganman." },
        { matn: "Faqat doʻstimga aytaman." },
        { matn: "Javob yozib, kim ekanini soʻrayman." },
      ],
    },
    {
      id: "xato-kiritdim",
      matn: "Shoshib, soxta saytga parolingni kiritib qoʻyding. Keyin xato qilganingni tushunding. Nima qilasan?",
      nega: "Xato har kimda boʻladi. Tez aytsang va parolni oʻzgartirsang, zarar boʻlmaydi. Yashirsang — kattalashadi.",
      javoblar: [
        { matn: "Darhol kattalarga aytaman va parolni oʻzgartiraman.", togri: true },
        { matn: "Hech kimga aytmayman, balki hech narsa boʻlmaydi." },
        { matn: "Ertaga esimga tushsa oʻzgartiraman." },
        { matn: "Oʻsha saytni yana ochib tekshiraman." },
      ],
    },
    {
      id: "dost-havola",
      matn: "Doʻstingning hisobidan xabar keldi: «bu havolani tez och, zoʻr narsa bor». Nima qilasan?",
      nega: "Doʻstingning hisobi oʻgʻirlangan boʻlishi mumkin. Havolani ochishdan avval doʻstingning oʻzidan soʻra.",
      javoblar: [
        { matn: "Ochmayman, avval doʻstimning oʻzidan soʻrayman.", togri: true },
        { matn: "Ochaman, doʻstim yuborgan ekan." },
        { matn: "Ochaman va parolimni kiritaman." },
        { matn: "Boshqa doʻstlarimga ham yuboraman." },
      ],
    },
  ];

  // ---------- 1-bosqich: qaysi belgi ----------
  function belgiTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const m = pick(BELGI_MISOL, rnd);
      const togri = belgi(m.belgi);
      const boshqalar = aralash(BELGILAR.filter((b) => b.id !== m.belgi), rnd).slice(0, 3);
      const variantlar = aralash([togri, ...boshqalar], rnd).map((b) => b.nom);
      return {
        id: "belgi:" + m.id, tur: "belgi", misol: m.matn, belgi: togri,
        matn: "Xatdagi shu gap qaysi belgiga ishora qiladi?",
        variantlar, javob: togri.nom, nega: togri.nom + " — " + togri.izoh,
      };
    }, prev, rr);
  }

  // ---------- Xat generatori (tier 1–2): tashkilot × manzil turi × belgi gaplari ----------
  // Har gap faqat o'z belgisining kalit so'zini saqlaydi (test tekshiradi) — "qaysi gap belgi?" aniq bo'lishi uchun.
  const SOXTA_GAP = {
    shoshiltirish: ["Javob berishga atigi 15 daqiqa vaqting bor.", "Buni hoziroq qilishing kerak, keyin kech boʻladi.", "Bugun kechgacha ulgurishing shart."],
    qorqitish: ["Javob bermasang, hisobing butunlay yopiladi.", "Javob bermasang, hisobing bloklanadi.", "Javob bermasang, ustingdan jarima yoziladi."],
    parol: ["Davom etish uchun parolingni shu xatga javoban yoz.", "Telefoningga kelgan SMS kodni bizga yubor.", "Hisobni tasdiqlash uchun parolingni havolaga kirit."],
    yutuq: ["Tabriklaymiz, sen maxsus sovrin egasi boʻlding!", "Senga maxsus sovgʻa ajratildi.", "Hisobingga 5000 bonus qoʻshib beramiz."],
    sir: ["Bu haqda hech kimga aytma.", "Bu xatni ota-onangga koʻrsatma."],
    pul: ["Hisobni saqlab qolish uchun 10 000 soʻm oʻtkazishing kerak.", "Xizmat haqi uchun ozgina pul joʻnat."],
  };
  // Belgisiz gaplar: tashkilot bo'yicha kirish gapi va sarlavha
  const KIRISH = {
    bank: { sarlavha: "Hisobing haqida xabar", gap: ["Hisobingda yangi harakat qayd etildi.", "Kartang boʻyicha maʼlumot yangilandi."] },
    maktab: { sarlavha: "Maktabdan xabar", gap: ["Kundalik tizimida yangilanish boʻldi.", "Sinfing uchun yangi eʼlon bor."] },
    dostlar: { sarlavha: "Yangi xabar", gap: ["Salom, bu men, sinfdoshingman.", "Senga yangi xabar keldi."] },
    pochta: { sarlavha: "Pochta xizmati xabari", gap: ["Pochta qutingda oʻzgarish boʻldi.", "Hisobing sozlamalari yangilandi."] },
    dokon: { sarlavha: "Buyurtma haqida", gap: ["Buyurtmang boʻyicha yangilik bor.", "Kitob doʻkonida hisobing yangilandi."] },
    oyin: { sarlavha: "Oʻyin yangiligi", gap: ["Oʻyindagi hisobingda yangilik bor.", "Oʻyinda yangi mavsum boshlandi."] },
  };
  const HAVOLA_GAP = ["Batafsil maʼlumot havolada.", "Tafsilotlarni havola orqali koʻrasan."];
  const HAQIQIY_GAP = ["Hech narsa yozish yoki yuborish shart emas.", "Savoling boʻlsa, kattalardan soʻra.", "Istasang, rasmiy ilovani oʻzing ochib koʻrasan."];
  const HAQIQIY_QOSHIMCHA = "Biz hech qachon parol soʻramaymiz."; // tier 2: "parol" so'zi bor, lekin xat haqiqiy
  // Soxta manzil turlari (domenFarqi bilan bir xil nomlar)
  const SOXTA_MANZIL = {
    harf: (nom) => (nom.includes("l") ? nom.replace("l", "1") : nom.replace("o", "0")) + ".uz",
    qoshimcha: (nom, r) => nom + pick(["-tekshiruv", "-xavfsizlik", "-yordam"], r) + ".uz",
    kochgan: (nom, r) => nom + "." + pick(["kirish", "tekshir", "xizmat"], r) + ".uz",
    zona: (nom, r) => nom + "." + pick(GUMONLI_ZONA, r),
  };

  // daraja 1: ikkita belgi; daraja 2: BITTA belgi (faqat manzil yoki faqat bitta gap) — eng qiyini
  function yasaXabar(r, soxta, daraja) {
    const t = pick(TASHKILOTLAR, r);
    const k = KIRISH[t.id];
    const nom = ajrat(t.domen).nom;
    if (!soxta) {
      const bolim = daraja >= 2 && r() < 0.5 ? "kirish." : ""; // tashkilotning o'z bo'limi — ishonchli
      const gaplar = [pick(k.gap, r), ...aralash(HAQIQIY_GAP, r).slice(0, daraja >= 2 ? 1 : 2)];
      if (daraja >= 2) gaplar.push(HAQIQIY_QOSHIMCHA);
      return {
        id: "gen:h:" + t.id + ":" + bolim + gaplar.join("|").length, tashkilot: t.id, kimdan: t.nom,
        manzil: "xabar@" + bolim + t.domen, sarlavha: k.sarlavha, matn: gaplar.join(" "),
        havola: "https://" + bolim + t.domen + "/xabar", soxta: false, belgilar: [],
      };
    }
    const matnBelgi = Object.keys(SOXTA_GAP);
    const manzilXato = daraja >= 2 ? r() < 0.5 : r() < 0.6;
    const nechta = daraja >= 2 ? (manzilXato ? 0 : 1) : manzilXato ? 1 : 2;
    const belgilar = aralash(matnBelgi, r).slice(0, nechta);
    const tur = manzilXato ? pick(Object.keys(SOXTA_MANZIL), r) : null;
    const domen = tur ? SOXTA_MANZIL[tur](nom, r) : t.domen;
    const gaplar = [pick(k.gap, r), ...belgilar.map((b) => pick(SOXTA_GAP[b], r))];
    if (!belgilar.length) gaplar.push(pick(HAVOLA_GAP, r));
    return {
      id: "gen:s:" + t.id + ":" + (tur || "-") + ":" + belgilar.join("+"), tashkilot: t.id, kimdan: t.nom,
      manzil: "xabar@" + domen, sarlavha: k.sarlavha, matn: gaplar.join(" "),
      havola: "https://" + domen + "/xabar", soxta: true, belgilar: (tur ? ["manzil"] : []).concat(belgilar),
    };
  }

  // ---------- Xat qismlari: "qaysi joyda belgi?" savoli uchun ----------
  // Manzil, sarlavha, matndagi har gap va havola — alohida bosiladigan qism
  function xatQismlari(x) {
    const gaplar = (String(x.matn).match(/[^.!?]+[.!?]*/g) || [x.matn]).map((g) => g.trim()).filter(Boolean);
    const out = [{ tur: "manzil", matn: x.manzil }, { tur: "sarlavha", matn: x.sarlavha }];
    gaplar.forEach((g) => out.push({ tur: "gap", matn: g }));
    if (x.havola) out.push({ tur: "havola", matn: x.havola });
    return out;
  }

  // Shu qismda shu belgi bormi: manzil/havola — domen qoidasi bilan, matn — kalit so'zlar bilan
  function qismdaBelgi(x, qism, belgiId) {
    if (belgiId === "manzil") {
      if (qism.tur !== "manzil" && qism.tur !== "havola") return false;
      const t = tashkilot(x.tashkilot);
      return birManzil(qism.matn, t ? t.domen : null).xil !== null;
    }
    if (qism.tur !== "sarlavha" && qism.tur !== "gap") return false;
    const past = qism.matn.toLowerCase() + " ";
    return (KALIT[belgiId] || []).some((k) => past.includes(k));
  }

  // So'raladigan belgilar: xatda e'lon qilingan, kamida bitta qismda bor va hamma qismda emas ("imlo" so'ralmaydi)
  function soraladiganBelgilar(x) {
    const qismlar = xatQismlari(x);
    return x.belgilar.filter((id) => {
      const n = qismlar.filter((q) => qismdaBelgi(x, q, id)).length;
      return id !== "imlo" && n >= 1 && n < qismlar.length;
    });
  }

  // "Zonadan oldingi nom qaysi?" — 4 variant: nom, @ dan oldingi so'z, zona, bo'lim yoki "https"
  function nomVariantlari(x, r) {
    const a = ajrat(x.manzil);
    const out = [a.nom];
    const push = (v) => { if (v && !out.includes(v) && out.length < 4) out.push(v); };
    push(String(x.manzil).split("@")[0].toLowerCase());
    push(a.zona);
    a.oldi.forEach(push);
    push("https");
    push("www");
    return { variantlar: aralash(out, r), javob: a.nom };
  }

  // ---------- 2-bosqich: xatni tekshir (ikki qadam) ----------
  // 1-qadam: Haqiqiy / Firibgar. 2-qadam: "Firibgar" desa — aytilgan belgi turgan joyni bosadi (5–7 qism),
  // "Haqiqiy" desa — zonadan oldingi nomni tanlaydi (4 variant). Ikkalasi to'g'ri bo'lsagina hisoblanadi.
  const JAVOB = { haqiqiy: "Haqiqiy", soxta: "Firibgar" };

  // tier 0 — qo'lda yozilgan xatlar (3–5 belgi); tier 1 — yasalgan, 2 belgi; tier 2 — yasalgan, bitta belgi
  function xabarTask(r, prev, soxta, tier) {
    const rr = r || Math.random;
    const royxat = typeof soxta === "boolean" ? XABARLAR.filter((x) => x.soxta === soxta) : XABARLAR;
    return pickNew((rnd) => {
      const yasama = tier >= 2 ? rnd() < 0.8 : tier === 1 ? rnd() < 0.6 : false;
      const x = yasama ? yasaXabar(rnd, typeof soxta === "boolean" ? soxta : rnd() < 0.5, tier) : pick(royxat, rnd);
      const belgilar = x.belgilar.map(belgi);
      const nomlar = belgilar.map((b) => b.nom.toLowerCase()).join(", ");
      const qismlar = xatQismlari(x);
      // Soxta xatda — haqiqatan bor belgi; haqiqiy xatda ham belgi nomi aytiladi (savol javobni oshkor qilmasin)
      const soraladigan = x.soxta ? soraladiganBelgilar(x) : ["shoshiltirish", "qorqitish", "parol", "sir", "pul", "manzil"];
      if (!soraladigan.length) return null;
      const sorov = belgi(pick(soraladigan, rnd));
      return {
        id: "xabar:" + x.id, tur: "xabar", xabar: x, belgilar, manzil: manzilBahosi(x),
        matn: "Bu xat haqiqiymi yoki firibgarmi?",
        variantlar: [JAVOB.haqiqiy, JAVOB.soxta],
        javob: x.soxta ? JAVOB.soxta : JAVOB.haqiqiy,
        joy: {
          belgi: sorov, matn: "«" + sorov.nom + "» belgisi xatning qayerida? Oʻsha joyni bos.",
          qismlar: qismlar.map((q) => ({ tur: q.tur, matn: q.matn, togri: x.soxta && qismdaBelgi(x, q, sorov.id) })),
        },
        nom: Object.assign({ matn: "Tekshir: manzilda zonadan oldingi nom qaysi?" }, nomVariantlari(x, rnd)),
        nega: x.soxta
          ? "Bu xatda " + belgilar.length + " ta belgi bor: " + nomlar + "."
          : "Bu xatda firibgarlik belgisi yoʻq: manzil toʻgʻri, parol soʻralmaydi, shoshiltirish ham yoʻq.",
      };
    }, prev, rr);
  }

  // Ikki qadamli javob: { javob, qism } (Firibgar) yoki { javob, nom } (Haqiqiy)
  function tekshirXabar(task, v) {
    if (!v || v.javob !== task.javob) return false;
    if (task.xabar.soxta) return !!(task.joy.qismlar[v.qism] && task.joy.qismlar[v.qism].togri);
    return v.nom === task.nom.javob;
  }

  // ---------- 3-bosqich: nima qilaman ----------
  function vaziyatTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const v = pick(VAZIYATLAR, rnd);
      const togri = v.javoblar.find((j) => j.togri);
      const yolgon = aralash(v.javoblar.filter((j) => !j.togri), rnd).slice(0, 3);
      const variantlar = aralash([togri, ...yolgon], rnd).map((j) => j.matn);
      return {
        id: "vaziyat:" + v.id, tur: "vaziyat", vaziyat: v, matn: v.matn,
        variantlar, javob: togri.matn, nega: v.nega,
      };
    }, prev, rr);
  }

  // Oxirgi qoida — tabrik ekranida ham ishlatiladi
  const QOIDALAR = [
    "Shoshiltirsa — toʻxta va oʻyla",
    "Parol va SMS kodni hech kimga aytmaysan",
    "Manzilni zonadan oldingi nomidan tekshir",
    "Havolani bosmay, rasmiy ilovadan oʻzing kir",
    "Shubha boʻlsa — kattalarga ayt",
  ];

  const api = {
    BELGILAR, BELGI_MISOL, KALIT, XABARLAR, VAZIYATLAR, TASHKILOTLAR, QOIDALAR, JAVOB,
    GUMONLI_ZONA, IKKI_ZONA, FARQ_IZOH,
    belgi, tashkilot, ajrat, sodda, tahrir, domenFarqi, gumonliZona, birManzil, manzilBahosi, ishonchliManzil,
    belgiTask, xabarTask, vaziyatTask,
    SOXTA_GAP, KIRISH, HAVOLA_GAP, HAQIQIY_GAP, HAQIQIY_QOSHIMCHA, SOXTA_MANZIL,
    yasaXabar, xatQismlari, qismdaBelgi, soraladiganBelgilar, nomVariantlari, tekshirXabar,
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
