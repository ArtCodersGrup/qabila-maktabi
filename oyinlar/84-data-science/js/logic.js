// «Data science»: metodologiya bosqichlari, oʻlchanadigan savol, maʼlumot turlari, jadval tuzilishi
// va tozalash (xatolari ekilgan jadval). Ekransiz sof mantiq; Node da test qilinadi: tests/logic.test.js
// Generatorlar: (prev, rng, tier) — prev bilan bir xil misol ketma-ket chiqmaydi, tier 0/1/2.
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
  const tanla = (list, n, r) => aralash(list, r).slice(0, n);

  // Ketma-ket bir xil misol chiqmasligi uchun (QOIDALAR 4.3). make null qaytarsa — qayta urinadi.
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

  // Manfiy son ekranda uzun minus bilan; boʻsh qiymat — boʻsh satr
  const korsat = (v) => (v === "" || v == null ? "" : typeof v === "number" && v < 0 ? "−" + Math.abs(v) : String(v));

  // ---------- 1-bosqich: metodologiya ----------
  const BOSQICHLAR = [
    { kalit: "savol", nom: "Savol qoʻyish", tarif: "nimani bilmoqchi ekanimiz aniq va oʻlchanadigan qilib yoziladi" },
    { kalit: "yigish", nom: "Maʼlumot yigʻish", tarif: "oʻlchash, soʻrovnoma yoki tayyor manbadan maʼlumot olinadi" },
    { kalit: "tozalash", nom: "Tozalash", tarif: "boʻsh, takror, imkonsiz va har xil yozilgan qiymatlar tuzatiladi" },
    { kalit: "tahlil", nom: "Tahlil", tarif: "hisoblanadi, solishtiriladi, diagramma chiziladi" },
    { kalit: "xulosa", nom: "Xulosa", tarif: "savolga javob beriladi va qaror taklif qilinadi" },
  ];

  // Har loyihada: 5 ta ish (bosqichlar tartibida), 2 ta oʻlchanadigan savol, 1 ta noaniq savol,
  // birinchi savolga kerakli maʼlumot va savolga javob bermaydigan 2 ta chalgʻituvchi maʼlumot.
  const LOYIHALAR = [
    {
      kalit: "oshxona", mavzu: "maktab oshxonasidagi navbat",
      ishlar: [
        "«Oʻquvchilar tushlik navbatida oʻrtacha necha daqiqa turadi?» deb aniq yozib olish",
        "Bir hafta davomida har tanaffusda navbat vaqtini sekundomer bilan oʻlchab, jadvalga yozish",
        "Jadvalda ikki marta yozilgan kunni va «−4 daqiqa» degan yozuvni topib tuzatish",
        "Har kun uchun navbat vaqtining oʻrtachasini hisoblab, ustunli diagramma chizish",
        "«Dushanba kuni navbat eng uzun, ikkinchi kassa kerak» deb direktorga taklif yozish",
      ],
      savollar: ["Oʻquvchilar tushlik navbatida oʻrtacha necha daqiqa turadi?", "Haftaning qaysi kunida oshxonada navbat eng uzun?"],
      noaniq: "Maktab oshxonasi yaxshi ishlayaptimi?",
      malumot: "Har kungi navbatda turish vaqti (daqiqa)",
      chalgi: ["Oshxona menyusidagi taomlar roʻyxati", "Oshpazlarning ish staji"],
    },
    {
      kalit: "uyqu", mavzu: "oʻquvchilarning uyqusi",
      ishlar: [
        "«9-sinf oʻquvchilari dars kunlari oʻrtacha necha soat uxlaydi?» degan savolni tanlash",
        "Sinfdoshlardan kecha soat nechada yotib, nechada turganini soʻrovnoma orqali soʻrash",
        "Soʻrovnomadagi «30 soat» degan javobni va boʻsh qolgan qatorlarni ajratib olish",
        "Uyqu vaqtining medianasini topib, dam olish kunidagi bilan solishtirish",
        "«Sinfning yarmi 7 soatdan kam uxlaydi» degan natijani sinf soatida aytish",
      ],
      savollar: ["9-sinf oʻquvchilari dars kunlari oʻrtacha necha soat uxlaydi?", "Sinfda necha foiz oʻquvchi 8 soatdan kam uxlaydi?"],
      noaniq: "Oʻquvchilar toʻgʻri uxlaydimi?",
      malumot: "Har oʻquvchining bir kecha uyqusi (soat)",
      chalgi: ["Oʻquvchilarning sevimli fanlari", "Sinf xonasidagi partalar soni"],
    },
    {
      kalit: "avtobus", mavzu: "avtobusning kechikishi",
      ishlar: [
        "«Avtobus bekatga jadvaldan oʻrtacha necha daqiqa kech keladi?» deb savolni aniqlashtirish",
        "Ikki hafta davomida avtobus bekatga kelgan vaqtni yozib borish",
        "Yozuvlardagi «8:75» kabi boʻlishi mumkin emas vaqtlarni topib, olib tashlash",
        "Kechikishlarni ertalab va kechqurun uchun alohida hisoblab, chiziqli diagramma chizish",
        "«Ertalab avtobus oʻrtacha 6 daqiqa kechikadi, uydan ertaroq chiqaman» deb qaror qilish",
      ],
      savollar: ["Avtobus bekatga jadvaldan oʻrtacha necha daqiqa kech keladi?", "Avtobus qachon koʻproq kechikadi: ertalabmi yoki kechqurunmi?"],
      noaniq: "Shahar transporti qulaymi?",
      malumot: "Avtobusning jadvaldagi va haqiqiy kelish vaqti",
      chalgi: ["Avtobusning rangi va rusumi", "Bekat yonidagi doʻkonlar soni"],
    },
    {
      kalit: "kutubxona", mavzu: "kutubxonadagi kitoblar",
      ishlar: [
        "«Kutubxonadan bir oyda qaysi janrdagi kitob eng koʻp olinadi?» deb savol qoʻyish",
        "Kutubxona daftaridan oxirgi uch oyda berilgan kitoblar roʻyxatini koʻchirib olish",
        "Roʻyxatda «badiiy», «Badiiy» va «BADIIY» deb yozilgan janrni bir xil koʻrinishga keltirish",
        "Har janr boʻyicha kitoblarni sanab, eng koʻp uchraganini (modani) topish",
        "«Sarguzasht kitoblari eng koʻp oʻqiladi, shulardan koʻproq olish kerak» deb kutubxonachiga aytish",
      ],
      savollar: ["Kutubxonadan bir oyda qaysi janrdagi kitob eng koʻp olinadi?", "Bir oʻquvchi kutubxonadan oyiga oʻrtacha nechta kitob oladi?"],
      noaniq: "Oʻquvchilar kitobni sevadimi?",
      malumot: "Berilgan har bir kitobning janri va sanasi",
      chalgi: ["Kutubxona binosining maydoni", "Kitob javonlarining rangi"],
    },
    {
      kalit: "telefon", mavzu: "telefondagi ekran vaqti",
      ishlar: [
        "«Sinfdoshlar kuniga oʻrtacha necha daqiqa telefondan foydalanadi?» degan savolni yozish",
        "Har kimdan telefonidagi «ekran vaqti» koʻrsatkichini soʻrab, jadvalga kiritish",
        "Bitta oʻquvchi ikki marta kiritilganini payqab, ortiqcha qatorni oʻchirish",
        "Ekran vaqti bilan uyqu vaqtini nuqtali diagrammada solishtirish",
        "«Ekran vaqti koʻp boʻlganlar kamroq uxlaydi, lekin sababi shu ekani isbotlanmadi» deb yozish",
      ],
      savollar: ["Sinfdoshlar kuniga oʻrtacha necha daqiqa telefondan foydalanadi?", "Dam olish kuni ekran vaqti dars kunidagidan necha daqiqa koʻp?"],
      noaniq: "Telefon zararlimi?",
      malumot: "Har oʻquvchining kunlik ekran vaqti (daqiqa)",
      chalgi: ["Telefonlarning narxi", "Sinfda eng koʻp uchraydigan telefon rusumi"],
    },
    {
      kalit: "obhavo", mavzu: "maktab hovlisidagi harorat",
      ishlar: [
        "«Tushdan keyin harorat ertalabkidan oʻrtacha necha daraja yuqori?» deb savol tuzish",
        "Har kuni soat 8:00 va 14:00 da termometr koʻrsatkichini yozib olish",
        "«250 °C» deb xato yozilgan kunni topib, asl daftardan tekshirish",
        "Ertalabki va tushdan keyingi haroratlar farqini har kun uchun hisoblash",
        "«Tushdan keyin oʻrtacha 9 daraja issiqroq» degan natijani devoriy gazetaga chiqarish",
      ],
      savollar: ["Tushdan keyin harorat ertalabkidan oʻrtacha necha daraja yuqori?", "Bir oyda necha kun yomgʻir yogʻdi?"],
      noaniq: "Bu yil ob-havo gʻalatimi?",
      malumot: "Har kungi ertalabki va tushki harorat (°C)",
      chalgi: ["Termometrning markasi", "Sinf xonasidagi derazalar soni"],
    },
    {
      kalit: "sport", mavzu: "sport toʻgaragi natijalari",
      ishlar: [
        "«Qatnashchilar bir daqiqada oʻrtacha necha marta arqonda sakraydi?» deb savol qoʻyish",
        "Mashgʻulotda har bir qatnashchining bir daqiqadagi sakrashlarini sanab yozish",
        "Natijalar jadvalidagi boʻsh kataklarni va «9000 marta» degan yozuvni belgilash",
        "Sentabr va oktabr natijalarining oʻrtachasini taqqoslash",
        "«Bir oyda natija oʻrtacha 12 taga oshdi» deb murabbiyga hisobot berish",
      ],
      savollar: ["Qatnashchilar bir daqiqada oʻrtacha necha marta arqonda sakraydi?", "Bir oyda sakrash natijasi oʻrtacha nechtaga oʻzgardi?"],
      noaniq: "Qaysi sport turi eng zoʻr?",
      malumot: "Har qatnashchining bir daqiqadagi sakrashlari soni",
      chalgi: ["Sport zalining devor rangi", "Murabbiyning yoshi"],
    },
    {
      kalit: "bufet", mavzu: "maktab bufetidagi sotuv",
      ishlar: [
        "«Bufetda bir haftada qaysi ichimlik eng koʻp sotiladi?» degan savolni aniqlab olish",
        "Bir hafta davomida sotilgan har bir ichimlikni cheklardan jadvalga koʻchirish",
        "«Suv», «suv» va «SUV» deb yozilgan mahsulotni bitta nomga keltirish",
        "Har ichimlik nechta sotilganini sanab, ustunli diagrammada koʻrsatish",
        "«Suv sharbatdan ikki baravar koʻp sotiladi, zaxirani shunga qarab olish kerak» deb tavsiya berish",
      ],
      savollar: ["Bufetda bir haftada qaysi ichimlik eng koʻp sotiladi?", "Bufetda bir kunda oʻrtacha nechta ichimlik sotiladi?"],
      noaniq: "Bufetdagi ichimliklar mazalimi?",
      malumot: "Har kuni sotilgan ichimlik nomi va soni",
      chalgi: ["Bufet sotuvchisining ismi", "Bufet eshigining oʻlchami"],
    },
  ];

  const NOANIQ_QOSHIMCHA = ["Qaysi oʻqituvchi eng yaxshi?", "Maktabimiz zoʻrmi?", "Internet foydalimi?", "Sinfimiz ahilmi?"];
  const NOANIQ = LOYIHALAR.map((l) => l.noaniq).concat(NOANIQ_QOSHIMCHA);
  const TARTIB = "savol → yigʻish → tozalash → tahlil → xulosa";

  // Ish → bosqich. tier 0 — oʻz bosqichi, tier 1 — keyingi bosqich, tier 2 — oldingi bosqich.
  function qadamTask(prev, rng, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((r) => {
      const loyiha = pick(LOYIHALAR, r);
      const k = t === 0 ? int(r, 0, 4) : t === 1 ? int(r, 0, 3) : int(r, 1, 4);
      const javobK = t === 0 ? k : t === 1 ? k + 1 : k - 1;
      const oz = BOSQICHLAR[k];
      const nomlar = BOSQICHLAR.map((b) => b.nom);
      return {
        tur: "qadam", id: `qadam:${t}:${loyiha.kalit}:${k}`, loyiha: loyiha.mavzu, ish: loyiha.ishlar[k], ishK: k, javobK,
        matn: t === 0 ? "Bu ish qaysi bosqichga tegishli?" : t === 1 ? "Bu ishdan keyin qaysi bosqich keladi?" : "Bu ishdan bevosita oldin qaysi bosqich bajariladi?",
        variantlar: t === 0 ? nomlar : aralash(nomlar, r), javob: BOSQICHLAR[javobK].nom,
        ishora: t === 0
          ? "Ish nima qilyapti: soʻrayaptimi, yigʻyaptimi, tuzatyaptimi, hisoblayaptimi yoki qaror chiqaryaptimi?"
          : `Avval ishning oʻz bosqichini aniqla, keyin tartibga qara: ${TARTIB}.`,
        nega: t === 0 ? `Bu — «${oz.nom}»: ${oz.tarif}.`
          : `Bu ish — «${oz.nom}». ${t === 1 ? "Undan keyin" : "Undan oldin"} — «${BOSQICHLAR[javobK].nom}».`,
        qisqa: t === 0 ? `Bu — «${oz.nom}» bosqichi.` : `«${oz.nom}» ${t === 1 ? "dan keyin" : "dan oldin"} — «${BOSQICHLAR[javobK].nom}».`,
      };
    }, prev, rng);
  }

  // Oʻlchanadigan savol. tier 0 — bitta oʻlchanadiganini top, tier 1 — bitta noaniqni top,
  // tier 2 — savolga qaysi maʼlumot javob beradi.
  function savolTask(prev, rng, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((r) => {
      const loyiha = pick(LOYIHALAR, r);
      if (t === 2) {
        const boshqa = pick(LOYIHALAR.filter((l) => l !== loyiha), r);
        return {
          tur: "savol", id: `savol:2:${loyiha.kalit}:${boshqa.kalit}`, savol: loyiha.savollar[0],
          matn: "Bu savolga javob berish uchun qaysi maʼlumot yigʻiladi?",
          variantlar: aralash([loyiha.malumot, loyiha.chalgi[0], loyiha.chalgi[1], boshqa.malumot], r), javob: loyiha.malumot,
          ishora: "Savolda nima oʻlchanishi yoki sanalishi kerakligini top — aynan shu yozib boriladi.",
          nega: "Maʼlumot savoldagi oʻlchovning oʻzini berishi kerak; mavzuga yaqin boʻlishi yetarli emas.",
          qisqa: "Maʼlumot savoldagi oʻlchovga mos.",
        };
      }
      if (t === 0) {
        const yaxshi = pick(loyiha.savollar, r);
        const yomon = tanla(NOANIQ, 3, r);
        return {
          tur: "savol", id: `savol:0:${yaxshi}:${yomon.slice().sort().join("|")}`,
          matn: "Qaysi savolga maʼlumot yigʻib, son yoki toifa bilan javob berish mumkin?",
          variantlar: aralash([yaxshi, ...yomon], r), javob: yaxshi,
          ishora: "Oʻlchanadigan savolda nima sanalishi aniq: necha, qancha, qaysi, necha foiz.",
          nega: "Qolgan savollardagi «yaxshi», «zoʻr», «toʻgʻri» kabi soʻzlarni har kim boshqacha tushunadi — ularni oʻlchab boʻlmaydi.",
          qisqa: "Bu savolda nima oʻlchanishi aniq.",
        };
      }
      const uchta = tanla(LOYIHALAR, 3, r).map((l) => pick(l.savollar, r));
      const yomon = pick(NOANIQ, r);
      return {
        tur: "savol", id: `savol:1:${yomon}:${uchta.slice().sort().join("|")}`,
        matn: "Qaysi savolni shu holicha oʻlchab boʻlmaydi?",
        variantlar: aralash([yomon, ...uchta], r), javob: yomon,
        ishora: "Har savol uchun oʻyla: jadvalga aynan nimani yozar eding? Yozadigan narsa topilmasa — savol noaniq.",
        nega: "Bu savolda nima sanalishi yoki oʻlchanishi aytilmagan — avval uni aniqlashtirish kerak.",
        qisqa: "Bu savol noaniq: oʻlchov yoʻq.",
      };
    }, prev, rng);
  }

  // ---------- Jadvallar ----------
  const ISMLAR = ["Aziz", "Dilnoza", "Bobur", "Malika", "Sardor", "Nigora", "Jasur", "Kamola", "Temur", "Zarina", "Otabek", "Sevara"];

  // Sonli ustun: [min, max] — yasaladigan qiymatlar; chegara — umuman boʻlishi mumkin boʻlgan oraliq;
  // imkonsiz — koʻzga tashlanadigan xato qiymatlar, nozik — diqqat talab qiladiganlari (hammasi chegaradan tashqarida).
  const son = (nom, min, max, qadam, imkonsiz, nozik, chegara) => ({ nom, tur: "sonli", min, max, qadam, imkonsiz, nozik, chegara });
  const toifa = (nom, qiymatlar) => ({ nom, tur: "toifali", qiymatlar });
  // Raqamdan iborat, lekin toifali belgi (qoʻshish maʼnosiz)
  const tuzoq = (nom, yasa) => ({ nom, tur: "toifali", tuzoq: true, yasa });
  const ikki = (n) => String(n).padStart(2, "0");

  const DATASETS = [
    {
      kalit: "oquvchi", nom: "Oʻquvchilar", obyekt: "oʻquvchi",
      asosiy: { nom: "Ism", tur: "toifali", asosiy: true, qiymatlar: ISMLAR },
      sonli: [
        son("Yosh", 14, 16, 1, [250, -3], [0, 1], [10, 20]),
        son("Boʻy (sm)", 150, 185, 1, [1750, -160], [17, 400], [100, 230]),
        son("Uyqu (soat/kun)", 5, 10, 1, [240, -8], [25, 30], [0, 24]),
        son("Baho (1–5)", 2, 5, 1, [50, -4], [6, 0], [1, 5]),
      ],
      toifali: [
        toifa("Sevimli fan", ["Matematika", "Fizika", "Tarix", "Biologiya", "Informatika"]),
        toifa("Shahar", ["Toshkent", "Samarqand", "Buxoro", "Andijon", "Nukus"]),
        toifa("Toʻgarak", ["Shaxmat", "Futbol", "Robototexnika", "Rasm"]),
      ],
      tuzoq: [
        tuzoq("Telefon raqami", (r) => `90 ${int(r, 100, 999)} ${ikki(int(r, 0, 99))} ${ikki(int(r, 0, 99))}`),
        tuzoq("Shkaf raqami", (r) => int(r, 1, 40)),
      ],
    },
    {
      kalit: "mahsulot", nom: "Mahsulotlar", obyekt: "mahsulot",
      asosiy: { nom: "Mahsulot", tur: "toifali", asosiy: true, qiymatlar: ["Non", "Sut", "Olma", "Guruch", "Choy", "Shakar", "Tuxum", "Qatiq", "Asal", "Makaron"] },
      sonli: [
        son("Narx (ming soʻm)", 3, 60, 1, [-12, -40], [-1, -3], [1, 500]),
        son("Vazn (g)", 100, 1000, 50, [-200, -900], [-50, 0], [1, 5000]),
        son("Sotildi (dona)", 5, 90, 1, [-7, -60], [-1, -2], [0, 10000]),
        son("Saqlash (kun)", 2, 60, 1, [-30, -5], [-1, 0], [1, 2000]),
      ],
      toifali: [
        toifa("Yetkazuvchi", ["Bogʻ", "Dala", "Chashma", "Tong"]),
        toifa("Sifat", ["Oliy", "Birinchi", "Ikkinchi"]),
        toifa("Chegirma", ["Bor", "Yoʻq", "Faqat yakshanba"]),
      ],
      tuzoq: [
        tuzoq("Shtrix-kod", (r) => int(r, 478000100, 478000999)),
        tuzoq("Javon raqami", (r) => int(r, 1, 20)),
      ],
    },
    {
      kalit: "kun", nom: "Ob-havo kuzatuvi", obyekt: "kun",
      asosiy: { nom: "Kun", tur: "toifali", asosiy: true, tartibli: true, qiymatlar: ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"] },
      sonli: [
        son("Harorat (°C)", 5, 35, 1, [250, 900], [75, 98], [-40, 55]),
        son("Namlik (%)", 20, 90, 1, [140, -20], [101, 104], [0, 100]),
        son("Shamol (m/s)", 1, 15, 1, [-4, 300], [-1, -2], [0, 60]),
        son("Yogʻin (mm)", 0, 30, 1, [-40, -15], [-2, -1], [0, 500]),
      ],
      toifali: [
        toifa("Oʻlchov joyi", ["Hovli", "Tom", "Bogʻ", "Maydon"]),
        toifa("Shamol yoʻnalishi", ["Shimol", "Janub", "Sharq", "Gʻarb"]),
        toifa("Kuzatuvchi", ["Aziz", "Malika", "Temur", "Zarina"]),
      ],
      tuzoq: [
        tuzoq("Stansiya kodi", (r) => int(r, 3801, 3809)),
        tuzoq("Daftar beti", (r) => int(r, 1, 96)),
      ],
    },
    {
      kalit: "sport", nom: "Toʻgarak qatnashchilari", obyekt: "qatnashchi",
      asosiy: { nom: "Ism", tur: "toifali", asosiy: true, qiymatlar: ISMLAR },
      sonli: [
        son("Yosh", 13, 17, 1, [170, -14], [0, 1], [8, 25]),
        son("Sakrash (marta)", 60, 150, 1, [9000, -20], [-1, -5], [0, 400]),
        son("100 m (s)", 12, 19, 1, [-15, 950], [2, 0], [9, 60]),
        son("Vazn (kg)", 45, 75, 1, [700, -50], [4, 0], [25, 150]),
      ],
      toifali: [
        toifa("Jamoa", ["Burgut", "Lochin", "Sher", "Yoʻlbars"]),
        toifa("Qoʻl", ["Oʻng", "Chap"]),
        toifa("Daraja", ["Boshlovchi", "Oʻrta", "Tajribali"]),
      ],
      tuzoq: [
        tuzoq("Futbolka raqami", (r) => int(r, 1, 30)),
        tuzoq("Guvohnoma raqami", (r) => int(r, 20100, 20999)),
      ],
    },
  ];

  function qiymat(u, r) {
    if (u.yasa) return u.yasa(r);
    if (u.tur === "sonli") return u.min + u.qadam * int(r, 0, Math.floor((u.max - u.min) / u.qadam));
    return pick(u.qiymatlar, r);
  }

  // R ta qator; asosiy ustun (ism, kun…) qiymatlari takrorlanmaydi
  function jadvalYasa(ds, ustunlar, R, r) {
    const a = ds.asosiy;
    let kalitlar;
    if (a.tartibli) {
      const bosh = int(r, 0, a.qiymatlar.length - R);
      kalitlar = a.qiymatlar.slice(bosh, bosh + R);
    } else kalitlar = tanla(a.qiymatlar, R, r);
    return kalitlar.map((k) => ustunlar.map((u) => (u.asosiy ? k : qiymat(u, r))));
  }

  // Ekran va test uchun ustun tavsifi (funksiyalarsiz)
  const ustunTavsif = (u) => ({ nom: u.nom, tur: u.tur, tuzoq: !!u.tuzoq, asosiy: !!u.asosiy, chegara: u.chegara || null, qiymatlar: u.qiymatlar || null });

  // ---------- 2-bosqich: maʼlumot turlari va jadval tuzilishi ----------
  // tier 0 — bitta toifali ustunni top; tier 1 — bitta sonlisini; tier 2 — raqamli tuzoqlar orasidan haqiqiy sonlisini.
  function turTask(prev, rng, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((r) => {
      const ds = pick(DATASETS, r);
      const toifalar = [ds.asosiy, ...ds.toifali];
      let javob, qolgan;
      if (t === 0) { javob = pick(toifalar, r); qolgan = tanla(ds.sonli, 3, r); }
      else if (t === 1) { javob = pick(ds.sonli, r); qolgan = tanla(toifalar, 3, r); }
      else { javob = pick(ds.sonli, r); qolgan = [ds.tuzoq[0], ds.tuzoq[1], pick(toifalar, r)]; }
      const ustunlar = aralash([javob, ...qolgan], r);
      const qatorlar = jadvalYasa(ds, ustunlar, 4, r);
      const nomlar = ustunlar.map((u) => u.nom);
      return {
        tur: "tur", id: `tur:${t}:${ds.kalit}:${javob.nom}:${nomlar.slice().sort().join("|")}`,
        jadvalNomi: ds.nom, ustunlar: ustunlar.map(ustunTavsif), qatorlar,
        matn: t === 0 ? "Qaysi ustun toifali (categorical) belgi?" : t === 1 ? "Qaysi ustun sonli (numerical) belgi?" : "Qaysi ustun uchun oʻrtacha qiymat hisoblash maʼnoli?",
        variantlar: nomlar, javob: javob.nom,
        ishora: "Oʻzingdan soʻra: shu ustundagi ikki qiymatni qoʻshsam, natija maʼno beradimi?",
        nega: t === 0 ? `«${javob.nom}» — nom yoki guruh: uni qoʻshib boʻlmaydi, faqat sanash va guruhlash mumkin. Qolganlari — oʻlchangan sonlar.`
          : t === 1 ? `«${javob.nom}» — oʻlchangan son: qoʻshish va oʻrtacha topish mumkin. Qolganlari — nom yoki guruh.`
            : `«${javob.nom}» — haqiqiy oʻlchov. «${ds.tuzoq[0].nom}» va «${ds.tuzoq[1].nom}» raqamdan iborat, lekin nom oʻrnida turadi: ularni qoʻshish maʼnosiz.`,
        qisqa: t === 0 ? `«${javob.nom}» — toifali belgi.` : `«${javob.nom}» — sonli belgi.`,
      };
    }, prev, rng);
  }

  // Jadval tuzilishi — javob son. tier 0 — qator/ustun; tier 1 — nechta sonli/toifali belgi;
  // tier 2 — jami qiymatlar soni yoki raqamli tuzoqlar bor jadvalda sonli belgilar soni.
  function jadvalTask(prev, rng, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((r) => {
      const ds = pick(DATASETS, r);
      const tur = t === 0 ? pick(["qator", "ustun"], r) : t === 1 ? pick(["sonli", "toifali"], r) : pick(["katak", "sonli"], r);
      const R = int(r, 3, 6);
      const nS = int(r, 1, 3);
      const nT = int(r, tur === "toifali" ? 1 : 0, 2);
      const tz = t === 2 && tur === "sonli" ? ds.tuzoq : [];
      const ustunlar = [ds.asosiy, ...aralash([...tanla(ds.sonli, nS, r), ...tanla(ds.toifali, nT, r), ...tz], r)];
      const C = ustunlar.length;
      if (C < 3 || C > 5) return null;
      if ((tur === "qator" || tur === "ustun") && R === C) return null; // qator va ustun soni chalkashmasin
      const qatorlar = jadvalYasa(ds, ustunlar, R, r);
      const sonlilar = ustunlar.filter((u) => u.tur === "sonli").map((u) => u.nom);
      const toifalilar = ustunlar.filter((u) => u.tur === "toifali").map((u) => u.nom);
      const sana = (list) => list.map((n) => `«${n}»`).join(", ");
      const S = {
        qator: {
          javob: R, matn: `Jadvalda nechta obyekt (${ds.obyekt}) tasvirlangan?`,
          nega: "Qator = bitta obyekt. Sarlavha qatori obyekt emas — uni sanama.",
          hisob: `${R} ta qator = ${R} ta obyekt (sarlavha sanalmaydi).`,
        },
        ustun: {
          javob: C, matn: `Har bir ${ds.obyekt} nechta belgi bilan tasvirlangan?`,
          nega: "Ustun = bitta belgi. Sarlavhalarni sanab chiq.",
          hisob: `${C} ta ustun = ${C} ta belgi.`,
        },
        sonli: {
          javob: sonlilar.length, matn: "Jadvalda nechta sonli belgi (ustun) bor?",
          nega: tz.length ? "Raqamdan iborat har ustun sonli emas: qoʻshish maʼno bersagina sonli." : "Sonli belgi — oʻlchangan son: uni qoʻshish, oʻrtachasini topish mumkin.",
          hisob: `Sonli: ${sana(sonlilar)} — ${sonlilar.length} ta.` + (tz.length ? ` ${sana(tz.map((u) => u.nom))} — raqamli, lekin toifali.` : ""),
        },
        toifali: {
          javob: toifalilar.length, matn: "Jadvalda nechta toifali belgi (ustun) bor?",
          nega: "Toifali belgi — nom yoki guruh. Obyektning nomi ham toifali belgi.",
          hisob: `Toifali: ${sana(toifalilar)} — ${toifalilar.length} ta.`,
        },
        katak: {
          javob: R * C, matn: "Jadvalda jami nechta qiymat bor? Sarlavha qatori sanalmaydi.",
          nega: "Har obyektda har belgining bitta qiymati bor: qatorlar soni × ustunlar soni.",
          hisob: `${R} qator × ${C} ustun = ${R * C} ta qiymat.`,
        },
      }[tur];
      return {
        tur: "jadval", savolTuri: tur, id: `jadval:${tur}:${ds.kalit}:${R}:${ustunlar.map((u) => u.nom).join("|")}`,
        jadvalNomi: ds.nom, ustunlar: ustunlar.map(ustunTavsif), qatorlar, R, C,
        javob: S.javob, matn: S.matn, nega: S.nega, hisob: S.hisob, qisqa: S.hisob,
      };
    }, prev, rng);
  }

  // ---------- 3-bosqich: tozalash ----------
  const XATO_NOMI = { bosh: "Boʻsh qiymat", takror: "Takror qator", imkonsiz: "Imkonsiz qiymat", yozuv: "Har xil yozuv" };
  const TUZATISH = {
    bosh: "Yetishmayotgan qiymatni manbadan topish; topilmasa — «nomaʼlum» deb belgilash",
    takror: "Bir xil qatorlardan bittasini qoldirib, ortiqchasini oʻchirish",
    imkonsiz: "Boʻlishi mumkin emas sonni manbadan tekshirib tuzatish yoki xato deb belgilash",
    yozuv: "Shu ustundagi hamma yozuvni bitta koʻrinishga keltirish",
  };
  const QATORLAR = [5, 6, 7]; // tier → toza qatorlar soni (takror qator ustiga qoʻshiladi)

  // Xatolari ekilgan jadval. turlar — qaysi xato turlari ekiladi (har biri bittadan, har xil qatorda).
  // Natija: { ds, ustunlar, qatorlar, xatolar } yoki null (joy yetmadi).
  // xatolar: { tur: "bosh" | "imkonsiz" | "yozuv", q, u, … } yoki { tur: "takror", q, asl } — q, asl, u 0 dan sanaladi.
  function xatoliJadval(r, t, turlar) {
    const ds = pick(DATASETS, r);
    const R = QATORLAR[t];
    const toif = pick(ds.toifali, r);
    const sonlar = tanla(ds.sonli, t === 2 ? 3 : 2, r);
    const ustunlar = [ds.asosiy, toif, ...sonlar];
    const qatorlar = jadvalYasa(ds, ustunlar, R, r);
    const xatolar = [];
    const band = new Set(); // xato ekilgan qatorlar
    const boshQator = () => {
      const erkin = qatorlar.map((_, k) => k).filter((k) => !band.has(k));
      const q = pick(erkin, r);
      band.add(q);
      return q;
    };

    if (turlar.includes("yozuv")) {
      // Toʻgʻri yozuv kamida ikki qatorda qoladi, shunda qaysi biri xato ekani aniq
      const V = pick(toif.qiymatlar, r);
      const uch = tanla(qatorlar.map((_, k) => k), 3, r);
      uch.forEach((q) => { qatorlar[q][1] = V; });
      const q = uch[0];
      band.add(q);
      const yomon = r() < 0.5 ? V.toLowerCase() : V.toUpperCase();
      qatorlar[q][1] = yomon;
      xatolar.push({ tur: "yozuv", q, u: 1, asl: V, yomon });
    }
    if (turlar.includes("imkonsiz")) {
      const q = boshQator();
      const u = 2 + int(r, 0, sonlar.length - 1);
      const v = pick(t === 2 ? ustunlar[u].nozik : ustunlar[u].imkonsiz, r);
      qatorlar[q][u] = v;
      xatolar.push({ tur: "imkonsiz", q, u, qiymat: v });
    }
    if (turlar.includes("bosh")) {
      const q = boshQator();
      // «yozuv» xatosi bor jadvalda toifali ustun boʻshatilmaydi (toʻgʻri yozuvlar kamayib qolmasin)
      const u = turlar.includes("yozuv") ? 2 + int(r, 0, sonlar.length - 1) : int(r, 1, ustunlar.length - 1);
      qatorlar[q][u] = "";
      xatolar.push({ tur: "bosh", q, u });
    }
    if (turlar.includes("takror")) {
      const toza = qatorlar.map((_, k) => k).filter((k) => !band.has(k));
      if (!toza.length) return null;
      const asl = pick(toza, r);
      const joy = t === 2 ? int(r, asl + 1, qatorlar.length) : asl + 1; // tier 2 da takror qator yonma-yon turmasligi mumkin
      qatorlar.splice(joy, 0, qatorlar[asl].slice());
      xatolar.forEach((x) => { if (x.q >= joy) x.q++; });
      xatolar.push({ tur: "takror", q: joy, asl });
    }
    xatolar.sort((a, b) => a.q - b.q);
    return { ds, ustunlar: ustunlar.map(ustunTavsif), qatorlar, xatolar };
  }

  function xatoIzoh(x, ustunlar) {
    const joy = `${x.q + 1}-qator`;
    if (x.tur === "takror") return `${joy} — ${x.asl + 1}-qatorning takrori`;
    const u = `«${ustunlar[x.u].nom}»`;
    if (x.tur === "bosh") return `${joy}, ${u}: qiymat yoʻq`;
    if (x.tur === "imkonsiz") return `${joy}, ${u}: ${korsat(x.qiymat)} boʻlishi mumkin emas`;
    return `${joy}, ${u}: «${x.yomon}» — boshqa qatorlarda «${x.asl}»`;
  }

  const jadvalId = (j) => j.qatorlar.map((q) => q.join(",")).join(";");

  // Jadvaldagi hamma xatoni belgilash. tier 0 — 2 xato, tier 1 — 3 (takror bilan), tier 2 — 4 (hamma turi, nozik qiymatlar).
  function tozalashTask(prev, rng, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((r) => {
      const uchta = ["bosh", "imkonsiz", "yozuv"];
      const turlar = t === 0 ? tanla(uchta, 2, r) : t === 1 ? ["takror", ...tanla(uchta, 2, r)] : ["takror", ...uchta];
      const j = xatoliJadval(r, t, turlar);
      if (!j) return null;
      const n = j.xatolar.length;
      return {
        tur: "tozalash", id: `tozalash:${t}:${j.ds.kalit}:${jadvalId(j)}`, jadvalNomi: j.ds.nom,
        ustunlar: j.ustunlar, qatorlar: j.qatorlar, xatolar: j.xatolar,
        matn: `Jadvalda ${n} ta xato bor. Xato katakni bos; takror qator boʻlsa — ortiqchasining raqamini (№) bos.`,
        ishora: "Har ustunni tepadan pastga oʻqi: boʻsh joy, boʻlishi mumkin emas son, boshqacha yozilgan soʻz. Keyin qatorlarni oʻzaro solishtir.",
        izohlar: j.xatolar.map((x) => xatoIzoh(x, j.ustunlar)),
        nega: "Tozalanmagan jadvalda oʻrtacha ham, sanoq ham notoʻgʻri chiqadi.",
        qisqa: `${n} ta xato topildi.`,
      };
    }, prev, rng);
  }

  // Belgilanganlarni tekshirish. belgilar: "k:q:u" — katak, "q:q" — butun qator (raqami bosilgan).
  // Takror juftlikdan aynan bittasi belgilanishi kerak (ikkalasi oʻchirilsa, obyekt yoʻqoladi).
  function tekshir(task, belgilar) {
    const set = new Set(belgilar);
    const mos = new Set();
    let ikkalasi = false;
    for (const x of task.xatolar) {
      if (x.tur === "takror") {
        const a = set.has(`q:${x.q}`);
        const b = set.has(`q:${x.asl}`);
        if (a && b) ikkalasi = true;
        else if (a) mos.add(`q:${x.q}`);
        else if (b) mos.add(`q:${x.asl}`);
      } else if (set.has(`k:${x.q}:${x.u}`)) mos.add(`k:${x.q}:${x.u}`);
    }
    const ortiqcha = set.size - mos.size;
    return { ok: mos.size === task.xatolar.length && ortiqcha === 0, topildi: mos.size, ortiqcha, jami: task.xatolar.length, ikkalasi };
  }

  // Bitta belgilangan xato: tier 0–1 — turini ayt, tier 2 — qanday tuzatiladi.
  function turiTask(prev, rng, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((r) => {
      const xatoTuri = pick(Object.keys(XATO_NOMI), r);
      const j = xatoliJadval(r, t, [xatoTuri]);
      if (!j) return null;
      const x = j.xatolar[0];
      const lugat = t === 2 ? TUZATISH : XATO_NOMI;
      return {
        tur: "turi", id: `turi:${t}:${xatoTuri}:${j.ds.kalit}:${jadvalId(j)}`, jadvalNomi: j.ds.nom,
        ustunlar: j.ustunlar, qatorlar: j.qatorlar, xatolar: j.xatolar, xato: x, xatoTuri,
        matn: t === 2 ? "Belgilangan joydagi xatoni qanday tuzatish toʻgʻri?" : "Belgilangan joyda qaysi turdagi xato bor?",
        variantlar: Object.values(lugat), javob: lugat[xatoTuri],
        ishora: t === 2
          ? "Avval xato turini aniqla. Keyin oʻyla: maʼlumotni yoʻqotmasdan uni qanday tuzatish mumkin?"
          : "Belgilangan joyni shu ustundagi boshqa qiymatlar va boshqa qatorlar bilan solishtir.",
        nega: `${xatoIzoh(x, j.ustunlar)}. Bu — ${XATO_NOMI[xatoTuri].toLowerCase()}.`,
        qisqa: `${XATO_NOMI[xatoTuri]}.`,
      };
    }, prev, rng);
  }

  const BOSQICH1 = [qadamTask, savolTask];
  const BOSQICH2 = [turTask, jadvalTask];
  const BOSQICH3 = [tozalashTask, turiTask, tozalashTask];

  // n — nechanchi toʻgʻri javob (mashq turi navbati)
  const navbat = (bank) => (prev, rng, tier, n) => bank[(n || 0) % bank.length](prev, rng, tier);

  const api = {
    BOSQICHLAR, LOYIHALAR, NOANIQ, DATASETS, XATO_NOMI, TUZATISH, QATORLAR, BOSQICH1, BOSQICH2, BOSQICH3,
    aralash, korsat, jadvalYasa, xatoliJadval, xatoIzoh, tekshir,
    qadamTask, savolTask, turTask, jadvalTask, tozalashTask, turiTask,
    bosqich1Task: navbat(BOSQICH1), bosqich2Task: navbat(BOSQICH2), bosqich3Task: navbat(BOSQICH3),
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
