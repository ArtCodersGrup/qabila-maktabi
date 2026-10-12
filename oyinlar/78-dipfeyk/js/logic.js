// «Dipfeyk»: AI yasagan soxta video, rasm va ovozni belgilaridan tanish, manbani tekshirish va toʻgʻri harakat.
// Yuzlar — sxematik chizma (maʼlumotdan chiziladi), haqiqiy odamlar va nomlar yoʻq. Yasash yoʻriqnomasi yoʻq — faqat xabardorlik.
// Ekransiz sof mantiq; Node da test qilinadi: tests/logic.test.js
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

  // Ketma-ket bir xil misol chiqmaydi (QOIDALAR 4.3). make null qaytarsa — qayta urinadi.
  function pickNew(make, prev, r) {
    let zaxira = null;
    for (let k = 0; k < 600; k++) {
      const task = make(r);
      if (!task) continue;
      if (!prev || task.id !== prev.id) return task;
      zaxira = task;
    }
    if (zaxira) return zaxira;
    throw new Error("Misol yasab boʻlmadi");
  }

  // ---------- 1-bosqich: chizma yuz va dipfeyk belgilari ----------
  const BELGI_ID = ["chet", "soya", "koz", "tish"];
  const BELGI = {
    chet: { nom: "Yuz cheti xira", qisqa: "yuz cheti" },
    soya: { nom: "Yorugʻlik va soya mos emas", qisqa: "yorugʻlik va soya" },
    koz: { nom: "Koʻzlar gʻalati", qisqa: "koʻzlar" },
    tish: { nom: "Tishlar gʻalati", qisqa: "tishlar" },
  };
  const YOQ = "Belgi yoʻq";
  const CHET = { chap: "chap yonoq cheti surkalgan va ikkilangan", ong: "oʻng yonoq cheti surkalgan va ikkilangan", past: "iyak cheti surkalgan va ikkilangan" };
  const KOZ = {
    yonalish: "qorachiqlar har xil tomonga qaragan",
    olcham: "koʻzlarning oʻlchami har xil",
    yaltiroq: "koʻzdagi yaltiroq nuqtalar har xil tomonda — yorugʻlik bitta boʻlsa, bunday boʻlmaydi",
  };
  const TISH = { yaxlit: "tishlar orasida chiziq yoʻq — bitta oq tasma", kop: "tishlar juda mayda va haddan ortiq koʻp" };

  // Yuz: tashqi koʻrinish (belgiga aloqasi yoʻq) + toʻrt belgi (null / false — tabiiy)
  function yuzYasa(r) {
    return {
      teri: int(r, 0, 3), soch: int(r, 0, 3), sochRang: int(r, 0, 3), kiyim: int(r, 0, 3),
      nur: pick(["chap", "ong"], r), qarash: pick([-1, 0, 1], r),
      chet: null, soya: false, koz: null, tish: null,
    };
  }
  const yuzKalit = (y) => [y.teri, y.soch, y.sochRang, y.kiyim, y.nur, y.qarash, y.chet || "-", y.soya ? 1 : 0, y.koz || "-", y.tish || "-"].join("");
  const belgilari = (y) => BELGI_ID.filter((k) => !!y[k]);

  // Yuzga bitta belgini qoʻshadi; tier 0 da faqat yaqqol koʻrinishlari
  function buz(y, b, r, tier) {
    if (b === "chet") y.chet = pick(tier ? ["chap", "ong", "past"] : ["chap", "ong"], r);
    else if (b === "soya") y.soya = true;
    else if (b === "koz") y.koz = pick(tier ? ["yonalish", "olcham", "yaltiroq"] : ["yonalish", "olcham"], r);
    else y.tish = pick(["yaxlit", "kop"], r);
    return y;
  }

  function belgiIzoh(y, b) {
    if (b === "chet") return `Chet: ${CHET[y.chet]}.`;
    if (b === "soya") return `Yorugʻlik: chiroq ${y.nur === "chap" ? "chapda" : "oʻngda"}, yuzdagi soya ham oʻsha tomonda — yelkadagi soyaga teskari.`;
    if (b === "koz") return `Koʻz: ${KOZ[y.koz]}.`;
    return `Tish: ${TISH[y.tish]}.`;
  }

  const TEKSHIR_ISHORA = "Toʻrt joyni navbat bilan tekshir: yuz cheti, chiroq va soya tomoni, koʻzlar, tishlar.";
  const TABIIY = "Chet aniq, soya chiroqqa teskari tomonda, koʻzlar bir xil, tishlar alohida — belgi topilmadi. Bu hali haqiqiylik kafolati emas.";

  // tier 0 — bitta yaqqol belgi; tier 1 — belgi yoʻq boʻlishi ham mumkin; tier 2 — nechta belgi bor (0…3)
  function belgiTask(prev, r, tier) {
    const t = tier || 0;
    return pickNew((rr) => {
      const y = yuzYasa(rr);
      if (t < 2) {
        const b = t === 0 || rr() < 0.75 ? pick(BELGI_ID, rr) : null;
        if (b) buz(y, b, rr, t);
        return {
          tur: "belgi", id: "belgi:" + yuzKalit(y), yuz: y,
          matn: "Bu chizma yuzda dipfeykning qaysi belgisi bor?",
          variantlar: BELGI_ID.map((k) => BELGI[k].nom).concat(YOQ), javob: b ? BELGI[b].nom : YOQ,
          ishora: TEKSHIR_ISHORA,
          nega: b ? belgiIzoh(y, b) : TABIIY,
          qisqa: b ? belgiIzoh(y, b) : "Belgi topilmadi.",
        };
      }
      const n = pick([0, 1, 1, 2, 2, 2, 3, 3], rr);
      aralash(BELGI_ID, rr).slice(0, n).forEach((b) => buz(y, b, rr, 2));
      const bor = belgilari(y);
      return {
        tur: "belgiSoni", id: "soni:" + yuzKalit(y), yuz: y, javob: n,
        matn: "Toʻrt joyni tekshir: chet, yorugʻlik, koʻz, tish. Bu yuzda dipfeykning nechta belgisi bor?",
        nega: TEKSHIR_ISHORA,
        hisob: n ? `${n} ta belgi. ` + bor.map((b) => belgiIzoh(y, b)).join(" ") : TABIIY,
      };
    }, prev, r);
  }

  // A va B — bitta odamning ikki tasviri; bittasi oʻzgartirilgan. Qaysi biri va nimasi?
  function juftTask(prev, r, tier) {
    const t = tier || 0;
    return pickNew((rr) => {
      const asl = yuzYasa(rr);
      const soxta = Object.assign({}, asl);
      const b = pick(BELGI_ID, rr);
      buz(soxta, b, rr, t);
      // tier 2: tabiiy farq ham bor (nigoh yoʻnalishi) — u belgi emas
      if (t === 2) asl.qarash = pick([-1, 0, 1].filter((q) => q !== soxta.qarash), rr);
      const harf = pick(["A", "B"], rr);
      const narigi = harf === "A" ? "B" : "A";
      const b2 = pick(BELGI_ID.filter((k) => k !== b), rr);
      const yorliq = (h, k) => `${h} — ${BELGI[k].qisqa}`;
      return {
        tur: "juft", id: `juft:${harf}:${yuzKalit(soxta)}:${asl.qarash}`, belgi: b, harf,
        yuzlar: { [harf]: soxta, [narigi]: asl },
        matn: "A va B — bitta chizma odamning ikki tasviri. Qaysi biri oʻzgartirilgan va nimasi?"
          + (t === 2 ? " Nigoh yoʻnalishi tabiiy holda ham oʻzgaradi." : ""),
        variantlar: aralash([yorliq(harf, b), yorliq(narigi, b), yorliq(harf, b2), yorliq(narigi, b2)], rr),
        javob: yorliq(harf, b),
        ishora: "Ikki tasvirda bir xil joylarni solishtir: chet aniqmi, soya chiroqqa teskarimi, ikki koʻz bir xilmi, tishlar alohidami.",
        nega: `${harf} tasvirda — ${belgiIzoh(soxta, b)}`,
        qisqa: belgiIzoh(soxta, b),
      };
    }, prev, r);
  }

  // Lab va ovoz mosligi: har kadrda ovoz bor/yoʻq va ogʻiz ochiq/yopiq. Nechta kadrda mos emas?
  const LAB_KADR = [6, 8, 10];

  function labTask(prev, r, tier) {
    const t = Math.min(tier || 0, 2);
    const n = LAB_KADR[t];
    return pickNew((rr) => {
      const ovoz = [];
      let v = rr() < 0.5 ? 1 : 0;
      for (let i = 0; i < n; i++) {
        if (i && rr() < 0.4) v = 1 - v;
        ovoz.push(v);
      }
      if (!ovoz.includes(0) || !ovoz.includes(1)) return null;
      let lab = ovoz.slice();
      let kech = false;
      if (t === 2 && rr() < 0.4) {
        kech = true;
        lab = ovoz.map((x, i) => (i === 0 ? 0 : ovoz[i - 1])); // lab ovozdan bir kadr kechikadi
      } else {
        const m = t === 0 ? int(rr, 1, 2) : t === 1 ? int(rr, 0, 3) : int(rr, 2, 4);
        aralash(ovoz.map((x, i) => i), rr).slice(0, m).forEach((i) => { lab[i] = 1 - lab[i]; });
      }
      const farqli = ovoz.map((x, i) => (x !== lab[i] ? i + 1 : 0)).filter(Boolean);
      if (kech && farqli.length < 2) return null;
      return {
        tur: "lab", id: `lab:${ovoz.join("")}:${lab.join("")}`, ovoz, lab, kech, farqli, javob: farqli.length,
        matn: `${n} ta kadr sxemasi: yuqorida — ovoz bor yoki yoʻq, pastda — ogʻiz ochiq yoki yopiq. Nechta kadrda lab va ovoz mos emas?`,
        nega: "Har ustunni alohida tekshir: ovoz bor — ogʻiz ochiq, jimlik — ogʻiz yopiq boʻlishi kerak.",
        hisob: farqli.length
          ? `Mos emas: ${farqli.join(", ")}-${farqli.length > 1 ? "kadrlar" : "kadr"} → ${farqli.length} ta.` + (kech ? " Lab ovozdan bir kadr kechikyapti." : "")
          : "Hamma kadrda mos — bu belgi yoʻq.",
      };
    }, prev, r);
  }

  // ---------- 2-bosqich: manbani tekshirish ----------
  const DAVOLAR = [
    "Maktab direktori taʼtil bir oyga uzaytirilganini eʼlon qildi",
    "Taniqli sportchi musobaqadan chetlatilganini aytdi",
    "Mashhur qoʻshiqchi yangi ilovani hammaga tavsiya qildi",
    "Shifokor bitta dori hamma kasallikni davolashini aytdi",
    "Telekanal boshlovchisi ertaga shaharda suv boʻlmasligini aytdi",
    "Futbol murabbiyi jamoadan ketishini eʼlon qildi",
    "Olim bu yil imtihonlar bekor qilinganini aytdi",
    "Bank xodimi kartani saqlab qolish uchun kod yuborishni soʻradi",
    "Taniqli bloger pul yutib olish yoʻlini koʻrsatdi",
    "Shahar transport xizmati yoʻl haqi bekor qilinganini aytdi",
  ];
  const OYLAR = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
  const KUN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // kabisa boʻlmagan yil
  const sanaYoz = (d, oy) => `${d}-${OYLAR[oy]}`;

  const TEKSHIRUV = { kim: "Kim tarqatgani shubhali", boshqa: "Boshqa manbalarda tasdiq yoʻq", sana: "Sana mos emas" };
  const TEKSHIRUV_ID = Object.keys(TEKSHIRUV);
  const OTDI = "Uch tekshiruvdan ham oʻtdi";
  const NECHTA = ["0 ta", "1 ta", "2 ta", "3 ta"];
  const SARLAVHA = { kim: "Kim tarqatdi", boshqa: "Boshqa manbalar", sana: "Sana" };

  // Har tekshiruv uchun toʻgʻri (ok) va shubhali satrlar; n — satrga qoʻyiladigan son
  const SATR = {
    kim: {
      ok: [
        (n) => `Tashkilotning rasmiy sahifasi: ${n + 3} yildan beri ishlaydi, tasdiq belgisi bor`,
        (n) => `Taniqli nashr sahifasi: ${n + 3} yillik arxivi va tahririyat manzili bor`,
        (n) => `Voqea ishtirokchisining oʻz sahifasi: ${n + 3} yildan beri yuritiladi`,
      ],
      yomon: [
        (n) => `Akkaunt ${n} kun oldin ochilgan, boshqa posti yoʻq`,
        () => "Anonim kanal: muallifi ham, aloqa manzili ham koʻrsatilmagan",
        () => "«Tanishim yubordi» deb tarqatilgan — asl manbasi nomaʼlum",
        (n) => `Nomi rasmiy sahifaga oʻxshaydi, lekin bitta harfi boshqa va ${n} kun oldin ochilgan`,
      ],
    },
    boshqa: {
      ok: [
        (n) => `${n + 2} ta mustaqil nashr ham shu xabarni bergan`,
        () => "Tashkilotning rasmiy saytida ham shu eʼlon turibdi",
        (n) => `Voqea joyidan ${n + 1} xil odam olgan boshqa videolar ham bor`,
      ],
      yomon: [
        () => "Qidiruvda boshqa hech qayerda topilmadi",
        (n) => `${n + 2} ta kanalda bor, lekin hammasi aynan shu postni koʻchirgan`,
        () => "Rasmiy sahifa bu xabarni rad etgan",
      ],
    },
    sana: {
      ok: [
        (n, d, oy) => `Post sanasi — ${sanaYoz(d, oy)}; videoning eng eski nusxasi ham ${sanaYoz(d, oy)}`,
        (n, d, oy) => `Videodagi sana va joy post matniga mos: ${sanaYoz(d, oy)}`,
      ],
      yomon: [
        (n, d, oy) => `Post «bugun» deydi (${sanaYoz(d + n, oy)}), lekin shu video ${sanaYoz(d, oy)}dan beri internetda bor`,
        () => "Sana ham, joy ham koʻrsatilmagan",
        (n) => `Post «bugun, ${pickQish(n)}da» deydi, lekin videoda daraxtlar yam-yashil, odamlar yengil kiyimda`,
      ],
    },
  };
  function pickQish(n) { return ["dekabr", "yanvar", "fevral"][n % 3]; }

  // xatolar — shubhali boʻladigan tekshiruvlar roʻyxati
  function postYasa(r, xatolar) {
    const post = { davo: pick(DAVOLAR, r), qatorlar: [] };
    for (const id of TEKSHIRUV_ID) {
      const yomon = xatolar.includes(id);
      const havza = SATR[id][yomon ? "yomon" : "ok"];
      const k = int(r, 0, havza.length - 1);
      const n = int(r, 1, 9);
      const oy = int(r, 0, 11);
      const d = int(r, 1, 18);
      post.qatorlar.push({ id, sarlavha: SARLAVHA[id], matn: havza[k](n, d, oy), yomon });
    }
    // Kalit — ekranda koʻrinadigan matnlardan: ikki vazifa faqat koʻrinmas sonlar bilan farq qilmaydi
    post.kalit = [DAVOLAR.indexOf(post.davo)].concat(post.qatorlar.map((q) => q.matn)).join("|");
    return post;
  }

  const SHUBHA_ISHORA = "Uch savol: kim tarqatdi, boshqa mustaqil manbada bormi, sana va joy mosmi. Har satrni alohida bahola.";
  const shubhaIzoh = (post) => {
    const y = post.qatorlar.filter((q) => q.yomon);
    if (!y.length) return "Manba aniq, mustaqil tasdiq bor, sana mos — ishonchliroq. Baribir bu 100 % kafolat emas.";
    return y.map((q) => `${q.sarlavha}: «${q.matn}» — shubhali.`).join(" ");
  };

  // tier 0 — aynan bitta shubha; tier 1 — shubha boʻlmasligi ham mumkin; tier 2 — nechta tekshiruvdan oʻtmadi (0…3)
  function shubhaTask(prev, r, tier) {
    const t = tier || 0;
    return pickNew((rr) => {
      if (t < 2) {
        const x = t === 0 || rr() < 0.75 ? pick(TEKSHIRUV_ID, rr) : null;
        const post = postYasa(rr, x ? [x] : []);
        return {
          tur: "shubha", id: "shubha:" + post.kalit, post,
          matn: "Postni uch savol bilan tekshir. Shubha qayerda?",
          variantlar: TEKSHIRUV_ID.map((k) => TEKSHIRUV[k]).concat(OTDI), javob: x ? TEKSHIRUV[x] : OTDI,
          ishora: SHUBHA_ISHORA, nega: shubhaIzoh(post),
          qisqa: x ? `${SARLAVHA[x]} — shubhali.` : "Uch tekshiruvdan oʻtdi.",
        };
      }
      const n = pick([0, 1, 2, 2, 3, 3], rr);
      const post = postYasa(rr, aralash(TEKSHIRUV_ID, rr).slice(0, n));
      return {
        tur: "shubhaSoni", id: "shubhaSoni:" + post.kalit, post,
        matn: "Post nechta tekshiruvdan oʻtmadi?",
        variantlar: NECHTA.slice(), javob: NECHTA[n],
        ishora: SHUBHA_ISHORA, nega: shubhaIzoh(post),
        qisqa: `${n} ta tekshiruvdan oʻtmadi.`,
      };
    }, prev, r);
  }

  // Video «bugun» deb berilgan, lekin eng eski nusxasi oldinroq paydo boʻlgan. Necha kun oldin? — javob son
  function sanaTask(prev, r, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((rr) => {
      const oy1 = int(rr, 0, 11 - t);
      const oy2 = oy1 + t;
      let d1 = 0;
      let d2 = 0;
      let javob = 0;
      let hisob = "";
      let ishora = "";
      if (t === 0) {
        d1 = int(rr, 1, KUN[oy1] - 3);
        d2 = d1 + int(rr, 2, Math.min(15, KUN[oy1] - d1));
        javob = d2 - d1;
        hisob = `${d2} − ${d1} = ${javob} kun.`;
        ishora = "Ikkala sana bir oyda: kunlar ayirmasini top.";
      } else if (t === 1) {
        d1 = int(rr, KUN[oy1] - 9, KUN[oy1] - 1);
        d2 = int(rr, 1, 12);
        javob = KUN[oy1] - d1 + d2;
        hisob = `${OYLAR[oy1]}da ${KUN[oy1]} − ${d1} = ${KUN[oy1] - d1} kun, ${OYLAR[oy2]}da yana ${d2} kun → ${javob} kun.`;
        ishora = `Oy chegarasidan oʻt: ${OYLAR[oy1]} — ${KUN[oy1]} kun. Avval oy oxirigacha, keyin yangi oydagi kunlarni qoʻsh.`;
      } else {
        const orta = oy1 + 1;
        d1 = int(rr, 12, KUN[oy1] - 1);
        d2 = int(rr, 1, 20);
        javob = KUN[oy1] - d1 + KUN[orta] + d2;
        hisob = `${OYLAR[oy1]}da ${KUN[oy1] - d1} kun + ${OYLAR[orta]} ${KUN[orta]} kun + ${OYLAR[oy2]}da ${d2} kun = ${javob} kun.`;
        ishora = `Uch qismga boʻl: ${OYLAR[oy1]} (${KUN[oy1]} kun) oxirigacha, butun ${OYLAR[orta]} (${KUN[orta]} kun), keyin ${OYLAR[oy2]}dagi kunlar.`;
      }
      const davo = pick(DAVOLAR, rr);
      const fevral = oy1 <= 1 && oy2 >= 1 && t > 0;
      return {
        tur: "sana", id: `sana:${d1}.${oy1}:${d2}.${oy2}:${DAVOLAR.indexOf(davo)}`, d1, oy1, d2, oy2, davo, javob,
        post: sanaYoz(d2, oy2), eski: sanaYoz(d1, oy1),
        matn: `Post «bugun» deb yozilgan. Qidiruv esa shu videoning ancha eski nusxasini topdi. Video postdan necha kun oldin paydo boʻlgan?`
          + (fevral ? " (Fevral — 28 kun.)" : ""),
        nega: ishora,
        hisob: hisob + " Video «bugungi» emas — eski video yangi deb berilgan.",
      };
    }, prev, r);
  }

  const AKKAUNTLAR = [
    "@shahar_xabar", "@kulgi_olami", "@sinf_9b", "@sport_yangilik", "@tezkor_24", "@mahalla_chat",
    "@video_toplam", "@qiziq_faktlar", "@yoshlar_ovozi", "@bugun_nima", "@hazil_kanal", "@maktab_hayoti",
  ];
  const ZANJIR_UZUNLIK = [4, 5, 6];

  // Ulashish zanjiri: kim kimdan olgani aralash tartibda berilgan. Asl manba — hech kimdan olmagan akkaunt.
  function zanjirTask(prev, r, tier) {
    const t = Math.min(tier || 0, 2);
    const n = ZANJIR_UZUNLIK[t];
    return pickNew((rr) => {
      const nomlar = aralash(AKKAUNTLAR, rr).slice(0, n);
      // ota[i] — i-akkaunt kimdan olgan; 0 — asl manba. tier 2 da zanjir shoxlanadi
      const ota = nomlar.map((x, i) => (i === 0 ? -1 : t < 2 || i === n - 1 ? i - 1 : int(rr, Math.max(0, i - 2), i - 1)));
      const boglar = aralash(nomlar.slice(1).map((nom, k) => ({ kim: nom, kimdan: nomlar[ota[k + 1]] })), rr);
      const oxirgi = nomlar[n - 1];
      const orta = aralash(nomlar.slice(1, n - 1), rr).slice(0, 2);
      const yol = [];
      for (let i = n - 1; i >= 0; i = ota[i]) yol.push(nomlar[i]);
      return {
        tur: "zanjir", id: `zanjir:${nomlar.join(",")}:${ota.join("")}:${boglar.map((b) => b.kim).join(",")}`, boglar, oxirgi, yol,
        matn: `Video senga ${oxirgi} kanalidan keldi. Uni birinchi boʻlib kim joylagan (asl manba)?`,
        variantlar: aralash([nomlar[0], oxirgi].concat(orta), rr), javob: nomlar[0],
        ishora: "Har akkaunt videoni kimdandir olgan. Hech kimdan olmagan, faqat boshqalar undan olgan akkauntni izla.",
        nega: `${yol.join(" ← ")}. Zanjir boshida ${nomlar[0]} turibdi — ishonchlilik aynan shu manbadan tekshiriladi.`,
        qisqa: `Asl manba — ${nomlar[0]}.`,
      };
    }, prev, r);
  }

  // ---------- 3-bosqich: etika va harakat ----------
  const KIM = [
    { id: "sinfdosh", kimning: "sinfdoshining", u: "Sinfdoshi", undan: "Sinfdoshidan", sen: "sinfdoshingning" },
    { id: "oqituvchi", kimning: "oʻqituvchisining", u: "Oʻqituvchisi", undan: "Oʻqituvchisidan", sen: "oʻqituvchingning" },
    { id: "dost", kimning: "doʻstining", u: "Doʻsti", undan: "Doʻstidan", sen: "doʻstingning" },
    { id: "qoshni", kimning: "qoʻshnisining", u: "Qoʻshnisi", undan: "Qoʻshnisidan", sen: "qoʻshningning" },
    { id: "aka", kimning: "akasining", u: "Akasi", undan: "Akasidan", sen: "akangning" },
    { id: "murabbiy", kimning: "murabbiyining", u: "Murabbiyi", undan: "Murabbiyidan", sen: "murabbiyingning" },
  ];
  const ISH = [
    "yuzi qoʻyilgan kino sahnasi videosini",
    "ovoziga oʻxshatilgan tabrik xabarini",
    "rasmi multfilm qahramoniga aylantirilgan videoni",
    "yuzi qoʻyilgan raqs videosini",
    "ovozi bilan sheʼr oʻqilgan audioni",
  ];

  const MUAMMO = { ruxsat: "Ruxsat olinmagan", zarar: "Odamga zarar yetkazadi", yorliq: "Yasama ekani yashirilgan" };
  const MUAMMO_ID = Object.keys(MUAMMO);
  const HAMMASI = "Uch shart ham bajarilgan";
  const SHART_NOM = { ruxsat: "Ruxsat", zarar: "Zarar", yorliq: "Ochiqlik" };
  const SHART = {
    ruxsat: {
      ok: [(k) => `${k.u} oldindan rozi boʻlgan va tayyor ishni koʻrib chiqqan.`, (k) => `${k.u}ning oʻzi shuni soʻragan.`],
      yomon: [(k) => `${k.undan} ruxsat soʻralmagan — u buni tasodifan koʻrib qolgan.`, (k) => `${k.u} «yoʻq» degan, lekin baribir yasalgan.`],
    },
    zarar: {
      ok: [() => "Mazmuni beozor: hech kim kamsitilmaydi, pul yoki yolgʻon vaʼda yoʻq.", () => "Mazmunida haqorat ham, yolgʻon xabar ham, pul soʻrash ham yoʻq."],
      yomon: [
        () => "Unda u aytmagan haqoratli gaplarni aytayotgandek koʻrsatilgan.",
        () => "U orqali tanishlardan pul soʻralyapti.",
        () => "Unda u qilmagan uyatli ishni qilayotgandek koʻrsatilgan.",
      ],
    },
    yorliq: {
      ok: [() => "Ostida «AI bilan yasalgan» deb aniq yozilgan.", () => "Boshida «bu yasama» degan yozuv turadi."],
      yomon: [() => "Yasama ekani hech qayerda aytilmagan — haqiqiydek koʻrsatilgan.", () => "«AI bilan yasalgan» yozuvi ataylab olib tashlangan."],
    },
  };

  function vaziyatYasa(r, xatolar) {
    const k = pick(KIM, r);
    const ish = int(r, 0, ISH.length - 1);
    const v = { kirish: `Oʻquvchi AI yordamida ${k.kimning} ${ISH[ish]} yasadi.`, qatorlar: [] };
    const kalit = [k.id, ish];
    for (const id of MUAMMO_ID) {
      const yomon = xatolar.includes(id);
      const havza = SHART[id][yomon ? "yomon" : "ok"];
      const n = int(r, 0, havza.length - 1);
      v.qatorlar.push({ id, sarlavha: SHART_NOM[id], matn: havza[n](k), yomon });
      kalit.push((yomon ? "y" : "o") + n);
    }
    v.kalit = kalit.join("|");
    return v;
  }

  const MUAMMO_ISHORA = "Uch shart: tasvirlangan odam rozimi, mazmun kimgadir zarar qiladimi, yasama ekani ochiq aytilganmi. Har satrni alohida bahola.";
  const muammoIzoh = (v) => {
    const y = v.qatorlar.filter((q) => q.yomon);
    if (!y.length) return "Rozilik bor, zarar yoʻq, yasama ekani ochiq aytilgan — AI bunday ishlatilsa, muammo yoʻq.";
    return y.map((q) => `${q.sarlavha}: «${q.matn}»`).join(" ") + " Bitta shart buzilsa ham — bunday ish tarqatilmaydi.";
  };

  // tier 0 — aynan bitta shart buzilgan; tier 1 — hammasi joyida boʻlishi ham mumkin; tier 2 — nechta shart buzilgan
  function muammoTask(prev, r, tier) {
    const t = tier || 0;
    return pickNew((rr) => {
      if (t < 2) {
        const x = t === 0 || rr() < 0.75 ? pick(MUAMMO_ID, rr) : null;
        const v = vaziyatYasa(rr, x ? [x] : []);
        return {
          tur: "muammo", id: "muammo:" + v.kalit, vaziyat: v,
          matn: "Bu ishda asosiy muammo nima?",
          variantlar: MUAMMO_ID.map((k) => MUAMMO[k]).concat(HAMMASI), javob: x ? MUAMMO[x] : HAMMASI,
          ishora: MUAMMO_ISHORA, nega: muammoIzoh(v),
          qisqa: x ? `${MUAMMO[x]}.` : "Uch shart ham joyida.",
        };
      }
      const n = pick([0, 1, 2, 2, 3, 3], rr);
      const v = vaziyatYasa(rr, aralash(MUAMMO_ID, rr).slice(0, n));
      return {
        tur: "muammoSoni", id: "muammoSoni:" + v.kalit, vaziyat: v,
        matn: "Uch shartdan nechtasi buzilgan?",
        variantlar: NECHTA.slice(), javob: NECHTA[n],
        ishora: MUAMMO_ISHORA, nega: muammoIzoh(v),
        qisqa: `${n} ta shart buzilgan.`,
      };
    }, prev, r);
  }

  const JOY = [
    { id: "sinf", da: "Sinf guruhida", ga: "sinf guruhiga" },
    { id: "maktab", da: "Maktab kanalida", ga: "maktab kanaliga" },
    { id: "mahalla", da: "Mahalla guruhida", ga: "mahalla guruhiga" },
    { id: "ochiq", da: "Ochiq kanalda", ga: "ochiq kanalga" },
  ];
  const KASB = ["shifokor", "sportchi", "olim", "boshlovchi"];
  const NARSA = ["dori", "ilova", "kurs", "ichimlik"];

  // Har vaziyat: toʻgʻri harakat, aniq notoʻgʻri (yomon) va yarim toʻgʻri (yarim) variantlar
  const HARAKAT = {
    kelgan: {
      matn: (k, j) => `${j.da} ${k.sen} yuzi qoʻyilgan uyatli soxta video paydo boʻldi. Hamma kulib, bir-biriga yuboryapti.`,
      togri: "Tarqatmayman; uning oʻziga va kattalarga aytaman, platformaga shikoyat qilaman",
      yomon: [
        "Doʻstlarimga yuboraman — ular ham kulsin",
        "Izohda kulgili stiker qoldiraman",
        "Men ham shunga oʻxshash video topib tashlayman",
        "Kim yasaganini topib, uning ustidan soxta gap tarqataman",
      ],
      yarim: [
        "Tarqatmayman, lekin hech kimga aytmayman — oʻzi unutiladi",
        "Faqat eng yaqin doʻstimga yuboraman, boshqaga emas",
        "Guruhda «bu soxta» deb yozaman va videoni qayta ulashaman",
      ],
      nega: "Har ulashish zararni koʻpaytiradi. Jabrlanuvchi bundan xabardor boʻlishi kerak; kattalar va platforma videoni oʻchirtira oladi.",
    },
    ovoz: {
      matn: (k) => `Notanish raqamdan ovozli xabar keldi: ovoz ${k.sen} ovoziga juda oʻxshaydi va zudlik bilan pul oʻtkazishni soʻrayapti.`,
      togri: "Pul yubormayman; oʻzim bilgan raqamiga qoʻngʻiroq qilib tekshiraman va kattalarga aytaman",
      yomon: [
        "Darhol pul oʻtkazaman — ovoz aniq oʻziniki",
        "Soʻralgan karta raqami va kodni yuboraman",
        "Xabarni guruhga tashlab, kim pul yuborishini soʻrayman",
        "Oʻsha raqamga oʻz parolimni yuboraman",
      ],
      yarim: [
        "Oʻsha notanish raqamning oʻziga yozib, «rostdan senmisan?» deb soʻrayman",
        "Sinash uchun ozroq pul yuborib koʻraman",
        "Javob bermayman va hech kimga aytmayman",
      ],
      nega: "Ovozni klonlash mumkin, shuning uchun ovozning oʻxshashligi dalil emas. Tekshiruv — boshqa, oʻzing bilgan aloqa yoʻli orqali.",
    },
    ozim: {
      matn: (k, j, n) => `${j.da} sening yuzing qoʻyilgan soxta video tarqalyapti. Uni ${n} kishi koʻrib ulgurdi.`,
      togri: "Skrinshot va havolani saqlayman, kattalarga aytaman, platformaga shikoyat qilaman",
      yomon: [
        "Yasagan odam haqida men ham soxta gap tarqataman",
        "Hammaga javoban haqorat yozaman",
        "«Oʻchirib beraman» degan notanishga akkauntim parolini beraman",
        "Yasagan odamga pul toʻlab, oʻchirishini soʻrayman",
      ],
      yarim: [
        "Hech kimga aytmayman — uyat, oʻzi oʻtib ketar",
        "Faqat oʻz akkauntimni oʻchirib tashlayman",
        "Dalil saqlamay, darhol hamma yozishmani oʻchiraman",
      ],
      nega: "Bu sening aybing emas. Dalil (skrinshot, havola) shikoyat uchun kerak; kattalar va platforma videoni oʻchirtira oladi.",
    },
    taklif: {
      matn: (k, j) => `Doʻsting ${k.sen} yuzini kulgili videoga qoʻyib, ${j.ga} tashlashni taklif qilyapti. Undan ruxsat soʻralmagan.`,
      togri: "Qatnashmayman va ruxsatsiz bunday qilish mumkin emasligini aytaman",
      yomon: [
        "Yordam beraman — bu shunchaki hazil",
        "Videoni birinchi boʻlib oʻzim tashlayman",
        "Qilamiz, lekin kim qilganini yashiramiz",
      ],
      yarim: [
        "Men qatnashmayman, lekin tayyor boʻlsa, ulashaman",
        "Avval tashlaymiz, keyin ruxsat soʻraymiz",
        "Indamayman — bu mening ishim emas",
      ],
      nega: "Birovning yuzi yoki ovozidan foydalanishga avval uning roziligi kerak. «Hazil» tasvirlangan odam uchun hazil boʻlmasligi mumkin.",
    },
    reklama: {
      matn: (k, j, n) => `${j.da} reklama: taniqli ${KASB[n % 4]} «bu ${NARSA[Math.floor(n / 4) % 4]} bir haftada natija beradi» deyapti. Lab harakati ovozga mos emas.`,
      togri: "Ishonmayman; uning rasmiy sahifasidan tekshiraman va reklamaga shikoyat qilaman",
      yomon: [
        "Darhol buyurtma beraman — taniqli odam aldamaydi",
        "Yaqinlarimga tavsiya qilib yuboraman",
        "Karta maʼlumotlarimni kiritib, sinab koʻraman",
      ],
      yarim: [
        "Sotib olmayman, lekin doʻstlarimga «qiziq ekan» deb ulashaman",
        "Izohlardagi maqtovlarga qarab qaror qilaman",
        "Lab mos emasligiga eʼtibor bermayman — sifat yomon boʻlsa kerak",
      ],
      nega: "Taniqli odamning yuzi va ovozi ruxsatsiz reklamada ishlatilishi mumkin. Lab-ovoz nomuvofiqligi — ogohlantiruvchi belgi; tekshiruv — rasmiy manbadan.",
    },
  };
  const HARAKAT_ID = Object.keys(HARAKAT);
  const YARIM_SONI = [0, 1, 2]; // tier → nechta yarim toʻgʻri variant

  function harakatTask(prev, r, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((rr) => {
      const xil = pick(HARAKAT_ID, rr);
      const h = HARAKAT[xil];
      const k = pick(KIM, rr);
      const j = pick(JOY, rr);
      const n = int(rr, 16, 95);
      const yarim = aralash(h.yarim, rr).slice(0, YARIM_SONI[t]);
      const yomon = aralash(h.yomon, rr).slice(0, 3 - yarim.length);
      const vaziyat = h.matn(k, j, n);
      const variantlar = aralash([h.togri].concat(yomon, yarim), rr);
      return {
        // Kalit — ekranda koʻrinadigan matndan (vaziyat va variantlar toʻplami)
        tur: "harakat", id: `harakat:${vaziyat}|${variantlar.slice().sort().join("|")}`, xil, yarimSoni: yarim.length,
        vaziyat,
        matn: "Eng toʻgʻri harakat qaysi?",
        variantlar, javob: h.togri,
        ishora: "Toʻrt qadamni esla: tarqatma, tekshir yoki dalilni saqla, kattalarga ayt, platformaga xabar ber. Qaysi variant hech biriga zid emas?",
        nega: h.nega,
        qisqa: "Toʻgʻri harakat.",
      };
    }, prev, r);
  }

  const NARSALAR = ["video", "rasm", "ovozli xabar"];
  // n-qadamda nechta yangi odam oladi: a kishi boshlaydi, har kim k ta yangi odamga yuboradi
  const qadam = (a, k, n) => a * Math.pow(k, n);

  // Tarqalish hisobi — javob son. tier 0: bitta qadam; tier 1: jami; tier 2: bir nechta kishi tarqatmasa
  function tarqalishTask(prev, r, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((rr) => {
      const narsa = pick(NARSALAR, rr);
      const j = pick(JOY, rr);
      const bosh = `${j.da} soxta ${narsa} dastlab`;
      const qadamlar = (a, k, n) => Array.from({ length: n }, (x, i) => `${i + 1}-qadam: ${qadam(a, k, i)} × ${k} = ${qadam(a, k, i + 1)}`).join("; ");
      const ishora = "Har qadamda oldingi qadamda olganlar soni k ga koʻpayadi. Qadamma-qadam yoz.";
      if (t === 0) {
        const a = int(rr, 1, 4);
        const k = int(rr, 2, 5);
        return {
          tur: "tarqalish", id: `tarqalish:0:${narsa}:${j.id}:${a}:${k}`, xil: "qadam", a, b: 0, k, n: 2, javob: qadam(a, k, 2),
          matn: `${bosh} ${a} kishiga yuborildi. Uni olgan har bir kishi ${k} ta yangi odamga yuboradi. 2-qadamda uni nechta yangi odam oladi?`,
          nega: ishora, hisob: qadamlar(a, k, 2) + ".",
        };
      }
      if (t === 1) {
        const a = int(rr, 1, 3);
        const k = int(rr, 2, 4);
        const jami = qadam(a, k, 1) + qadam(a, k, 2) + qadam(a, k, 3);
        return {
          tur: "tarqalish", id: `tarqalish:1:${narsa}:${j.id}:${a}:${k}`, xil: "jami", a, b: 0, k, n: 3, javob: jami,
          matn: `${bosh} ${a} kishiga yuborildi. Uni olgan har bir kishi ${k} ta yangi odamga yuboradi. 3 qadam ichida uni jami nechta yangi odam oladi (dastlabki ${a} kishini hisoblamay)?`,
          nega: ishora + " Keyin uch qadamni qoʻsh.",
          hisob: `${qadamlar(a, k, 3)}. Jami: ${qadam(a, k, 1)} + ${qadam(a, k, 2)} + ${qadam(a, k, 3)} = ${jami}.`,
        };
      }
      const a = int(rr, 3, 6);
      const b = int(rr, 1, a - 1);
      const k = int(rr, 2, 4);
      const n = int(rr, 2, 3);
      return {
        tur: "tarqalish", id: `tarqalish:2:${narsa}:${j.id}:${a}:${b}:${k}:${n}`, xil: "toxtatish", a, b, k, n, javob: qadam(a - b, k, n),
        matn: `${bosh} ${a} kishiga yuborildi. Ulardan ${b} tasi tarqatmaslikka qaror qildi; qolganlari va keyingi har bir kishi ${k} ta yangi odamga yuboradi. ${n}-qadamda uni nechta yangi odam oladi?`,
        nega: "Avval nechta kishi yuborishini top (tarqatmaganlarni ayir). " + ishora,
        hisob: `Yuboradiganlar: ${a} − ${b} = ${a - b}. ${qadamlar(a - b, k, n)}. ${b} kishi toʻxtatgani uchun ${n}-qadamda ${qadam(b, k, n)} kishi kam oldi.`,
      };
    }, prev, r);
  }

  // Navbat toʻgʻri javoblar soni boʻyicha yuradi, zina (tier) esa shu son bilan birga oʻsadi (0, 1, 1, 2, 2, 2).
  // Shuning uchun asosiy mashq turi ikki-uch marta turadi: har safar keyingi zinasi bilan chiqadi.
  const BOSQICH1 = [juftTask, belgiTask, labTask, belgiTask];
  const BOSQICH2 = [shubhaTask, shubhaTask, zanjirTask, sanaTask, shubhaTask];
  const BOSQICH3 = [harakatTask, muammoTask, tarqalishTask];

  // n — nechanchi toʻgʻri javob (mashq turi navbati), tier — qiyinlik zinasi
  const navbat = (bank) => (prev, r, tier, n) => bank[(n || 0) % bank.length](prev, r, tier);

  const api = {
    BELGI_ID, BELGI, YOQ, CHET, KOZ, TISH, LAB_KADR, DAVOLAR, OYLAR, KUN, TEKSHIRUV, TEKSHIRUV_ID, OTDI, NECHTA, SARLAVHA, SATR,
    AKKAUNTLAR, ZANJIR_UZUNLIK, KIM, ISH, MUAMMO, MUAMMO_ID, HAMMASI, SHART, SHART_NOM, JOY, HARAKAT, HARAKAT_ID, YARIM_SONI, NARSALAR,
    BOSQICH1, BOSQICH2, BOSQICH3,
    aralash, yuzYasa, yuzKalit, belgilari, buz, belgiIzoh, sanaYoz, postYasa, vaziyatYasa, qadam,
    belgiTask, juftTask, labTask, shubhaTask, sanaTask, zanjirTask, muammoTask, harakatTask, tarqalishTask,
    bosqich1Task: navbat(BOSQICH1), bosqich2Task: navbat(BOSQICH2), bosqich3Task: navbat(BOSQICH3),
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
