// 50-o'yin: parol kuchi — nechta variant bor va kompyuter qancha vaqtda topadi.
// Hisob BigInt (variantlar soni juda katta bo'ladi). Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const S = (root.QK && root.QK.sanash) || require("../../umumiy/js/sanash.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  function pickNew(make, prev, r) {
    for (let k = 0; k < 400; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  // Belgi turlari va alifbo o'lchami
  const TURLAR = [
    { id: "raqam", nom: "raqamlar", misol: "0–9", soni: 10, test: (ch) => ch >= "0" && ch <= "9" },
    { id: "kichik", nom: "kichik harflar", misol: "a–z", soni: 26, test: (ch) => ch >= "a" && ch <= "z" },
    { id: "katta", nom: "katta harflar", misol: "A–Z", soni: 26, test: (ch) => ch >= "A" && ch <= "Z" },
    { id: "belgi", nom: "belgilar va boʻsh joy", misol: "! ? # $", soni: 32, test: (ch) => "!?#$%&*+-_=.,:;()[]{}<>/@^~| ".includes(ch) },
  ];

  const TEZLIK = [
    { id: "oddiy", nom: "oddiy kompyuter", soniyada: 1000000n },
    { id: "kuchli", nom: "kuchli uskuna", soniyada: 1000000000n },
  ];

  // Ko'p ishlatiladigan parollar — uzunligidan qat'i nazar zaif
  const MASHHUR = ["123456", "parol", "password", "qwerty", "111111", "iloveyou", "salom", "12345678", "admin"];
  // Ism va tug'ilgan yil — hujumchi birinchi navbatda shularni sinaydi
  const ISMLAR = ["anvar", "dilnoza", "sardor", "malika", "jasur", "aziza", "bekzod", "nilufar", "ali", "olim"];
  // "Hiyla" almashtirishlar hammaga ma'lum: @ = a, 1 = i, 0 = o, 3 = e, $ = s
  const HIYLA = { "@": "a", "1": "i", "0": "o", "3": "e", "$": "s", "!": "i", "5": "s", "7": "t" };

  // Parolni "asl so'ziga" qaytarish: kichik harf, hiyla belgilar va oxiridagi raqamlar olib tashlanadi
  function soddalashtir(parol) {
    const asos = String(parol).toLowerCase().replace(/[0-9]+$/, "");
    const almashgan = [...asos].map((ch) => HIYLA[ch] || ch).join("");
    return almashgan.replace(/[0-9]+$/, "").trim();
  }

  // Lug'atdagi so'z yoki ism (yil bilan bo'lsa ham)
  function lugatda(parol) {
    const sodda = soddalashtir(parol);
    // Avval aynan o'zi: "123456" kabi raqamli mashhur parollar soddalashtirilganda bo'sh qoladi
    if (MASHHUR.includes(String(parol).toLowerCase()) || MASHHUR.includes(sodda)) return "mashhur";
    if (ISMLAR.includes(sodda)) return "ism";
    if (/^(19|20)\d\d$/.test(String(parol).trim())) return "yil";
    return null;
  }

  // Parolni tahlil qilish: qaysi turlar bor, alifbo kattaligi, nechta variant
  function tahlil(parol) {
    const turlar = TURLAR.filter((t) => [...parol].some((ch) => t.test(ch)));
    const alifbo = turlar.reduce((a, t) => a + t.soni, 0);
    const variant = alifbo ? S.takrorli(alifbo, parol.length) : 0n;
    return { parol, uzunlik: parol.length, turlar, alifbo, variant, lugat: lugatda(parol) };
  }

  // Topish vaqti (soniyada). O'rtacha yarmi tekshiriladi — biz eng yomon holatni olamiz.
  const vaqt = (variant, soniyada) => variant / BigInt(soniyada);

  const BIRLIK = [
    { chek: 60n, bol: 1n, nom: "soniya" },
    { chek: 3600n, bol: 60n, nom: "daqiqa" },
    { chek: 86400n, bol: 3600n, nom: "soat" },
    { chek: 31536000n, bol: 86400n, nom: "kun" },
    { chek: 31536000n * 1000n, bol: 31536000n, nom: "yil" },
    { chek: 31536000n * 1000000n, bol: 31536000n * 1000n, nom: "ming yil" },
    { chek: 31536000n * 1000000000n, bol: 31536000n * 1000000n, nom: "million yil" },
    { chek: null, bol: 31536000n * 1000000000n, nom: "milliard yil" },
  ];
  const KOINOT = 31536000n * 13800000000n; // koinot yoshi — 13,8 milliard yil

  // Vaqtni odam tilida: "5 daqiqa", "4 yil", "12 million yil"
  function vaqtMatni(soniya) {
    if (soniya < 1n) return "bir soniyadan kam";
    if (soniya > KOINOT) return "koinot yoshidan ham koʻp";
    for (const b of BIRLIK) {
      if (b.chek === null || soniya < b.chek) return S.chiroyli(soniya / b.bol) + " " + b.nom;
    }
    return S.chiroyli(soniya) + " soniya";
  }

  // Baho: zaif / oʻrtacha / kuchli (oddiy kompyuter uchun topish vaqti bo'yicha)
  const LUGAT_SABAB = {
    mashhur: "Bu — eng koʻp ishlatiladigan parollardan biri. Belgi bilan yashirilsa ham (@ = a, 1 = i), hujumchi avval shularni sinaydi.",
    ism: "Ism — hujumchi birinchi navbatda sinaydigan narsa. Oxiriga yil qoʻshilsa ham yordam bermaydi.",
    yil: "Tugʻilgan yil — bor-yoʻgʻi 100 ga yaqin variant.",
  };

  function baho(parol, tezlik) {
    const t = tahlil(parol);
    if (t.lugat) return { daraja: "zaif", sabab: LUGAT_SABAB[t.lugat], lugat: t.lugat };
    const sek = vaqt(t.variant, (tezlik || TEZLIK[0]).soniyada);
    if (sek < 86400n) return { daraja: "zaif", sabab: "Bir kundan kam vaqtda topiladi.", sek };
    if (sek < 31536000n * 100n) return { daraja: "oʻrtacha", sabab: "Topish uchun vaqt kerak, lekin kuchli uskuna uddalaydi.", sek };
    return { daraja: "kuchli", sabab: "Hozirgi kompyuterlar uchun amalda topib boʻlmaydi.", sek };
  }

  function aralash(list, r) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // ---------- 1-bosqich: nechta variant ----------
  // daraja — qiyinlik zinasi (tier): 0 — javob ≤ 1 100, 1 — ≤ 20 000, 2 — ≤ 1 000 000 (koʻpi bilan ikkita uzun koʻpaytirish)
  const VARIANT_SAVOL = [
    { id: "pin3", daraja: 0, alifbo: 10, uzunlik: 3, matn: "3 xonali raqamli kod. Nechta variant bor?" },
    { id: "harf2", daraja: 0, alifbo: 26, uzunlik: 2, matn: "2 ta kichik lotin harfi. Nechta variant bor?" },
    { id: "tanga5", daraja: 0, alifbo: 2, uzunlik: 5, matn: "5 ta katak: har biri yoniq yoki oʻchiq. Nechta variant bor?" },
    { id: "rang3", daraja: 0, alifbo: 3, uzunlik: 4, matn: "4 ta chiroq, har biri uch xil rangda yonadi. Nechta variant bor?" },
    { id: "unli3", daraja: 0, alifbo: 5, uzunlik: 3, matn: "Kod — 3 ta harf, faqat a, e, i, o, u dan. Nechta variant bor?" },
    { id: "tanga8", daraja: 0, alifbo: 2, uzunlik: 8, matn: "8 ta katak: har biri yoniq yoki oʻchiq. Nechta variant bor?" },
    { id: "pin4", daraja: 1, alifbo: 10, uzunlik: 4, matn: "4 xonali PIN kod (faqat raqamlar). Nechta variant bor?" },
    { id: "harf3", daraja: 1, alifbo: 26, uzunlik: 3, matn: "3 ta kichik lotin harfi. Nechta variant bor?" },
    { id: "aralash2", daraja: 1, alifbo: 36, uzunlik: 2, matn: "2 ta belgi: kichik harf yoki raqam (36 xil). Nechta variant bor?" },
    { id: "katta2", daraja: 1, alifbo: 62, uzunlik: 2, matn: "2 ta belgi: katta harf, kichik harf yoki raqam (62 xil). Nechta variant bor?" },
    { id: "tanga10", daraja: 1, alifbo: 2, uzunlik: 10, matn: "10 ta katak: har biri yoniq yoki oʻchiq. Nechta variant bor?" },
    { id: "unli5", daraja: 1, alifbo: 5, uzunlik: 5, matn: "Kod — 5 ta harf, faqat a, e, i, o, u dan. Nechta variant bor?" },
    { id: "pin5", daraja: 2, alifbo: 10, uzunlik: 5, matn: "5 xonali raqamli kod. Nechta variant bor?" },
    { id: "pin6", daraja: 2, alifbo: 10, uzunlik: 6, matn: "6 xonali raqamli kod. Nechta variant bor?" },
    { id: "aralash3", daraja: 2, alifbo: 36, uzunlik: 3, matn: "3 ta belgi: kichik harf yoki raqam (36 xil). Nechta variant bor?" },
    { id: "rang8", daraja: 2, alifbo: 3, uzunlik: 8, matn: "8 ta chiroq, har biri uch xil rangda yonadi. Nechta variant bor?" },
    { id: "tanga12", daraja: 2, alifbo: 2, uzunlik: 12, matn: "12 ta katak: har biri yoniq yoki oʻchiq. Nechta variant bor?" },
    // 26⁴ (456 976) qogʻozda uchta uzun koʻpaytirish — ogʻir; oʻrniga 5⁶ (QOIDALAR 4.3: qogʻozda hisoblanadigan javob)
    { id: "unli6", daraja: 2, alifbo: 5, uzunlik: 6, matn: "Kod — 6 ta harf, faqat a, e, i, o, u dan. Nechta variant bor?" },
  ];

  function variantTask(r, prev, tier) {
    const rr = r || Math.random;
    const royxat = VARIANT_SAVOL.filter((x) => x.daraja === (tier || 0));
    return pickNew((rnd) => {
      const s = pick(royxat, rnd);
      const javob = S.takrorli(s.alifbo, s.uzunlik);
      return { id: "variant:" + s.id, tur: "variant", alifbo: s.alifbo, uzunlik: s.uzunlik, matn: s.matn, javob,
        hisob: s.alifbo + "^" + s.uzunlik + " = " + S.chiroyli(javob),
        nega: "Har joyga " + s.alifbo + " xil belgi qoʻyish mumkin, joylar " + s.uzunlik + " ta — koʻpaytiriladi." };
    }, prev, rr);
  }

  // ---------- 2-bosqich: qancha vaqt ketadi ----------
  const VAQT_SAVOL = [
    { id: "pin4", parol: "4 xonali PIN", alifbo: 10, uzunlik: 4 },
    { id: "harf6", parol: "6 ta kichik harf", alifbo: 26, uzunlik: 6 },
    { id: "harf8", parol: "8 ta kichik harf", alifbo: 26, uzunlik: 8 },
    { id: "harf10", parol: "10 ta kichik harf", alifbo: 26, uzunlik: 10 },
    { id: "aralash6", parol: "6 ta aralash belgi (harf, raqam, belgi)", alifbo: 94, uzunlik: 6 },
    { id: "aralash8", parol: "8 ta aralash belgi", alifbo: 94, uzunlik: 8 },
  ];
  // Generator uchun (tier 1+): alifbo turi × uzunlik
  const ALIFBO = [
    { soni: 10, nom: (n) => n + " xonali raqamli kod" },
    { soni: 26, nom: (n) => n + " ta kichik harf" },
    { soni: 36, nom: (n) => n + " ta kichik harf yoki raqam" },
    { soni: 62, nom: (n) => n + " ta katta-kichik harf yoki raqam" },
    { soni: 94, nom: (n) => n + " ta aralash belgi (harf, raqam, belgi)" },
  ];
  const VAQT_UZUNLIK = [[4, 8], [6, 10], [8, 12]];
  // Chalg'ituvchi vaqtlar: tier 0 — narvonning uzoq pog'onalari, tier 1+ — qo'shni birliklar (× 60, ÷ 60, × 24 …)
  const NARVON = [5n, 90n, 7200n, 172800n, 2592000n, 31536000n * 3n, 31536000n * 5000n, 31536000n * 2000000n];

  function vaqtTask(r, prev, tier) {
    const rr = r || Math.random;
    const t = tier || 0;
    return pickNew((rnd) => {
      let s;
      let tezlik = TEZLIK[0];
      if (t === 0) s = pick(VAQT_SAVOL, rnd);
      else {
        const a = pick(ALIFBO, rnd);
        const n = int(rnd, VAQT_UZUNLIK[t][0], VAQT_UZUNLIK[t][1]);
        s = { id: a.soni + "x" + n, parol: a.nom(n), alifbo: a.soni, uzunlik: n };
        if (t === 2 && rnd() < 0.5) tezlik = TEZLIK[1];
      }
      const sek = vaqt(S.takrorli(s.alifbo, s.uzunlik), tezlik.soniyada);
      const togri = vaqtMatni(sek);
      if (t > 0 && (sek < 1n || sek > KOINOT)) return null; // chegaradagi javoblar chalg'ituvchilardan ajralmaydi
      const yaqin = t === 0 ? NARVON : [sek / 3600n, sek / 60n, sek / 24n, sek * 24n, sek * 60n, sek * 3600n, sek * 1000n, sek / 1000n];
      const soxta = [];
      for (const x of aralash(yaqin, rnd)) {
        const matn = vaqtMatni(x);
        if (matn !== togri && !soxta.includes(matn)) soxta.push(matn);
      }
      if (soxta.length < 3) return null;
      const variantlar = aralash([togri, ...soxta.slice(0, 3)], rnd);
      const tezlikMatn = tezlik.id === "oddiy" ? "1 million" : "1 milliard";
      return { id: "vaqt:" + s.id + ":" + tezlik.id, tur: "vaqt", parol: s.parol, alifbo: s.alifbo, uzunlik: s.uzunlik,
        tezlik, variantlar, javob: togri, sek,
        matn: s.parol + ". Sekundiga " + tezlikMatn + " urinadigan kompyuter qancha vaqtda topadi?",
        hisob: S.chiroyli(S.takrorli(s.alifbo, s.uzunlik)) + " ÷ " + S.chiroyli(tezlik.soniyada) + " = " + togri,
        nega: "Variantlar sonini tezlikka boʻl — soniyalar chiqadi. Keyin soniyani daqiqa, soat, kun, yilga aylantir." };
    }, prev, rr);
  }

  // ---------- Parol yasovchi (qiyos va baho savollari uchun) ----------
  // Ibora yasash uchun so'zlar (3–4 so'z — uzun va esda qoladigan parol)
  const SOZLAR = ["olma", "chashma", "quyosh", "kitob", "tulki", "shamol", "qalam", "chaqmoq", "dengiz", "arqon", "gilos", "burgut"];
  // Mashhur so'zning "yashirilgan" ko'rinishlari — baribir lug'atda
  const MASHHUR_NIQOB = ["123456", "qwerty", "111111", "parol2024", "qwerty123", "p@r0l", "P@ssw0rd", "s@l0m", "adm1n", "iloveyou", "Salom2025", "@dmin"];
  // Tasodifiy parollar unlisiz — tasodifan biror so'z chiqib qolmasin
  const QISQA_BELGI = "bcdfghkmnprstvxz";
  const ARALASH_BELGI = "bcdfghkmnprstvxzBCDFGHKMNPRSTVXZ23456789!?#$%";
  const tasodifiy = (belgilar, n, r) => Array.from({ length: n }, () => belgilar[Math.floor(r() * belgilar.length)]).join("");
  const kattaBosh = (s) => s[0].toUpperCase() + s.slice(1);

  // Sabab turi — bahoning aniq sababi (5 xil): baho savolining variantlari
  const SABABLAR = [
    { id: "mashhur", daraja: "zaif", nom: "Zaif — mashhur soʻz (lugʻatda bor)" },
    { id: "ism", daraja: "zaif", nom: "Zaif — ism yoki yil" },
    { id: "qisqa", daraja: "zaif", nom: "Zaif — juda qisqa" },
    { id: "ortacha", daraja: "oʻrtacha", nom: "Oʻrtacha — kuchli uskuna topadi" },
    { id: "kuchli", daraja: "kuchli", nom: "Kuchli — uzun va lugʻatda yoʻq" },
  ];
  function sababi(parol) {
    const b = baho(parol);
    if (b.lugat === "mashhur") return "mashhur";
    if (b.lugat) return "ism";
    return b.daraja === "zaif" ? "qisqa" : b.daraja === "kuchli" ? "kuchli" : "ortacha";
  }

  // Berilgan sababga mos tasodifiy parol (baho() bilan tekshiriladi — yasovchi yolg'on gapirmaydi)
  function yasaParol(sabab, r, tier) {
    for (let k = 0; k < 200; k++) {
      let p;
      if (sabab === "mashhur") p = pick(tier ? MASHHUR_NIQOB : MASHHUR, r);
      else if (sabab === "ism") {
        const ism = pick(ISMLAR, r);
        const yil = String(int(r, 2007, 2016));
        p = pick(tier ? [kattaBosh(ism) + yil, ism + yil.slice(2), yil, kattaBosh(ism) + yil.slice(2)] : [ism + yil, yil, ism], r);
      } else if (sabab === "qisqa") {
        p = r() < 0.5 ? tasodifiy(QISQA_BELGI, int(r, 4, 7), r) : tasodifiy(ARALASH_BELGI, int(r, 4, 5), r);
      } else if (sabab === "ortacha") {
        p = r() < 0.5 ? tasodifiy(QISQA_BELGI, int(r, 8, 10), r) : tasodifiy(ARALASH_BELGI, int(r, 6, 7), r);
      } else {
        const sozlar = aralash(SOZLAR, r);
        p = r() < 0.6 ? sozlar.slice(0, int(r, 3, 4)).join(" ") : sozlar[0] + sozlar[1] + (sozlar[0].length + sozlar[1].length < 11 ? sozlar[2] : "");
      }
      if (sababi(p) === sabab) return p;
    }
    return null;
  }

  // Parol kuchi — solishtirish uchun son: lug'atdagisi 0, qolganlari variantlar soni
  const kuch = (parol) => (lugatda(parol) ? 0n : tahlil(parol).variant);

  // ---------- 2-bosqich: to'rt paroldan eng kuchlisi (4 variant) ----------
  const JUFTLAR = [
    { a: "Qq1!5z", b: "olmaolmaolma", nega: "Uzunlik murakkablikdan kuchliroq: 12 ta kichik harf 6 ta aralash belgidan koʻp variant beradi." },
    { a: "2007", b: "tunqushkecha", nega: "Tugʻilgan yil — 4 ta raqam, darhol topiladi." },
    { a: "P@ss1", b: "sariq fil uchadi", nega: "Uchta soʻzdan iborat ibora uzun va esda qoladi." },
    { a: "123456", b: "qizil chashma", nega: "Mashhur parol birinchi urinishdayoq topiladi." },
  ];
  // Qolgan uchtasi: tier 0 — ochiq-oydin zaiflar; tier 1 — bittasi "o'rtacha"; tier 2 — murakkab ko'rinadigan o'rtacha va niqoblangan lug'at so'zlari
  const QIYOS_QOLGAN = [["mashhur", "ism", "qisqa"], ["mashhur", "ism", "ortacha"], ["mashhur", "ortacha", "ortacha"]];

  function qiyosTask(r, prev, tier) {
    const rr = r || Math.random;
    const t = tier || 0;
    return pickNew((rnd) => {
      const kuchli = yasaParol("kuchli", rnd, t);
      const qolgan = QIYOS_QOLGAN[t].map((sabab) => yasaParol(sabab, rnd, t));
      if (!kuchli || qolgan.some((p) => !p) || new Set(qolgan).size < 3) return null;
      if (qolgan.some((p) => kuch(p) >= kuch(kuchli))) return null;
      return { id: "qiyos:" + kuchli + ":" + qolgan.join(":"), tur: "qiyos", variantlar: aralash([kuchli, ...qolgan], rnd), javob: kuchli,
        matn: "Toʻrtta parol. Qaysi biri ENG kuchli?",
        ishora: "Avval lugʻatdagilarini chiqarib tashla: ism, yil, mashhur soʻz (belgi bilan yashirilgan boʻlsa ham). Qolganlarida uzunlikka qara.",
        nega: "Eng kuchlisi — uzun va lugʻatda yoʻq parol: «" + kuchli + "» (" + kuchli.length + " ta belgi). Uzunlik murakkab belgilardan muhimroq." };
    }, prev, rr);
  }

  // ---------- 3-bosqich: parolni baholash (5 variant: baho + sababi) ----------
  const PAROLLAR = ["12345678", "Anvar2010", "qwerty", "oltin baliq suzadi", "a1b2c3", "kitobjavonstol",
    "P@rol1", "mening birinchi itim", "Qq1!5z", "tulkiquyosh"];
  const DARAJALAR = ["zaif", "oʻrtacha", "kuchli"];

  function bahoTask(r, prev, tier) {
    const rr = r || Math.random;
    const t = tier || 0;
    return pickNew((rnd) => {
      // tier 0 da qo'lda tanlangan parollar ham aralashadi
      const sabab = pick(SABABLAR, rnd).id;
      const p = t === 0 && rnd() < 0.4 ? pick(PAROLLAR, rnd) : yasaParol(sabab, rnd, t);
      if (!p) return null;
      const b = baho(p);
      const s = SABABLAR.find((x) => x.id === sababi(p));
      return { id: "baho:" + p, tur: "baho", parol: p, daraja: b.daraja, sabab: s.id, javob: s.nom, variantlar: SABABLAR.map((x) => x.nom),
        nega: b.sabab, matn: "Bu parol qanday va nega?", tahlil: tahlil(p),
        ishora: "Avval lugʻatni tekshir: ism, yil yoki mashhur soʻz emasmi (@ = a, 0 = o, 1 = i)? Keyin uzunligini sana." };
    }, prev, rr);
  }

  // ---------- 3-bosqich: parolni o'zing yasa ----------
  // Bola so'z kartalaridan ibora yig'adi. Shartlar: kamida minSoz ta so'z, takrorsiz, ism/yil/mashhur so'zsiz,
  // topish vaqti maqsaddan ko'p. tier 1+ da kartalar ichida "tuzoq" so'zlar bor.
  const TUZOQ = ["anvar", "2012", "parol", "qwerty", "malika", "123456"];
  const YASA_MAQSAD = [
    { minSoz: 3, minSek: 31536000n * 100n, tuzoq: 0, matn: "Kamida 3 ta soʻzdan kuchli parol yasa." },
    { minSoz: 3, minSek: 31536000n * 1000000n, tuzoq: 2, matn: "Parol yasa: topishga million yildan koʻp vaqt ketsin. Ism, yil va mashhur soʻz ishlatma!" },
    { minSoz: 4, minSek: KOINOT, tuzoq: 3, matn: "Parol yasa: topish vaqti koinot yoshidan ham koʻp boʻlsin. Ism, yil va mashhur soʻz ishlatma!" },
  ];

  function yasaTask(r, prev, tier) {
    const rr = r || Math.random;
    const t = tier || 0;
    return pickNew((rnd) => {
      const m = YASA_MAQSAD[t];
      const kartalar = aralash([...aralash(SOZLAR, rnd).slice(0, 8 - m.tuzoq), ...aralash(TUZOQ, rnd).slice(0, m.tuzoq)], rnd);
      return { id: "yasa:" + kartalar.join(","), tur: "yasa", kartalar, maqsad: m, matn: m.matn,
        ishora: "Soʻz koʻp boʻlsa — parol uzun, uzun boʻlsa — variantlar koʻp. Ism, yil va mashhur soʻzni hujumchi birinchi sinaydi." };
    }, prev, rr);
  }

  // Yig'ilgan iborani tekshirish: { ok, sabab, parol, sek }
  function yasaTekshir(task, sozlar) {
    const parol = sozlar.join(" ");
    const m = task.maqsad;
    if (sozlar.length < m.minSoz) return { ok: false, parol, sabab: "Soʻzlar kam: kamida " + m.minSoz + " ta kerak." };
    if (new Set(sozlar).size < sozlar.length) return { ok: false, parol, sabab: "Bir soʻz ikki marta ishlatilgan — takror parolni kuchsiz qiladi." };
    if (sozlar.some((x) => TUZOQ.includes(x))) return { ok: false, parol, sabab: "Ichida ism, yil yoki mashhur soʻz bor — hujumchi avval shularni sinaydi." };
    const sek = vaqt(tahlil(parol).variant, TEZLIK[0].soniyada);
    if (baho(parol).daraja !== "kuchli" || sek < m.minSek) return { ok: false, parol, sek, sabab: "Topish vaqti: " + vaqtMatni(sek) + " — bu kam. Parolni uzaytir." };
    return { ok: true, parol, sek };
  }

  const api = { TURLAR, TEZLIK, MASHHUR, ISMLAR, KOINOT, soddalashtir, lugatda, VARIANT_SAVOL, VAQT_SAVOL, JUFTLAR, PAROLLAR, DARAJALAR, SOZLAR,
    tahlil, vaqt, vaqtMatni, baho, variantTask, vaqtTask, qiyosTask, bahoTask,
    ALIFBO, VAQT_UZUNLIK, MASHHUR_NIQOB, SABABLAR, TUZOQ, YASA_MAQSAD, sababi, yasaParol, kuch, yasaTask, yasaTekshir };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
