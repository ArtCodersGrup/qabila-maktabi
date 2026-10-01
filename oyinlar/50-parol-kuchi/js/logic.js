// 50-o'yin: parol kuchi — nechta variant bor va kompyuter qancha vaqtda topadi.
// Hisob BigInt (variantlar soni juda katta bo'ladi). Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const S = (root.QK && root.QK.sanash) || require("../../umumiy/js/sanash.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  function pickNew(make, prev, r) {
    for (let k = 0; k < 40; k++) {
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
    if (MASHHUR.includes(sodda)) return "mashhur";
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

  // ---------- 1-bosqich: nechta variant ----------
  const VARIANT_SAVOL = [
    { id: "pin4", alifbo: 10, uzunlik: 4, matn: "4 xonali PIN kod (faqat raqamlar). Nechta variant bor?" },
    { id: "pin3", alifbo: 10, uzunlik: 3, matn: "3 xonali raqamli kod. Nechta variant bor?" },
    { id: "harf2", alifbo: 26, uzunlik: 2, matn: "2 ta kichik lotin harfi. Nechta variant bor?" },
    { id: "harf3", alifbo: 26, uzunlik: 3, matn: "3 ta kichik lotin harfi. Nechta variant bor?" },
    { id: "tanga5", alifbo: 2, uzunlik: 5, matn: "5 ta katak: har biri yoniq yoki oʻchiq. Nechta variant bor?" },
  ];

  function variantTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const s = pick(VARIANT_SAVOL, rnd);
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

  function vaqtTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const s = pick(VAQT_SAVOL, rnd);
      const tezlik = TEZLIK[0];
      const sek = vaqt(S.takrorli(s.alifbo, s.uzunlik), tezlik.soniyada);
      const togri = vaqtMatni(sek);
      // Soxta javoblar — vaqt narvonidan (0 ni ko'paytirish bir xil javob berib qolardi)
      const narvon = [5n, 90n, 7200n, 172800n, 2592000n, 31536000n * 3n, 31536000n * 5000n, 31536000n * 2000000n];
      const soxta = [];
      for (const x of narvon) {
        const matn = vaqtMatni(x);
        if (matn !== togri && !soxta.includes(matn)) soxta.push(matn);
      }
      for (let i = soxta.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [soxta[i], soxta[j]] = [soxta[j], soxta[i]];
      }
      const variantlar = [togri, ...soxta.slice(0, 3)];
      for (let i = variantlar.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [variantlar[i], variantlar[j]] = [variantlar[j], variantlar[i]];
      }
      return { id: "vaqt:" + s.id, tur: "vaqt", parol: s.parol, alifbo: s.alifbo, uzunlik: s.uzunlik,
        tezlik, variantlar, javob: togri, sek,
        matn: s.parol + ". Sekundiga 1 million urinadigan kompyuter qancha vaqtda topadi?",
        hisob: S.chiroyli(S.takrorli(s.alifbo, s.uzunlik)) + " ÷ 1 000 000 = " + togri,
        nega: "Avval variantlar sonini top, keyin tezlikka boʻl." };
    }, prev, rr);
  }

  // ---------- 2/3-bosqich: qaysi parol kuchli ----------
  const JUFTLAR = [
    { a: "Qq1!5z", b: "olmaolmaolma", nega: "Uzunlik murakkablikdan kuchliroq: 12 ta kichik harf 6 ta aralash belgidan koʻp variant beradi." },
    { a: "2007", b: "tunqushkecha", nega: "Tugʻilgan yil — 4 ta raqam, darhol topiladi." },
    { a: "P@ss1", b: "sariq fil uchadi", nega: "Uchta soʻzdan iborat ibora uzun va esda qoladi." },
    { a: "123456", b: "qizil chashma", nega: "Mashhur parol birinchi urinishdayoq topiladi." },
  ];

  function qiyosTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const j = pick(JUFTLAR, rnd);
      const ikki = rnd() < 0.5 ? [j.a, j.b] : [j.b, j.a];
      const kuchli = baho(j.b).daraja === "zaif" ? j.a : j.b;
      return { id: "qiyos:" + j.a + ":" + j.b, tur: "qiyos", variantlar: ikki, javob: kuchli, nega: j.nega,
        matn: "Qaysi parol kuchliroq?" };
    }, prev, rr);
  }

  // ---------- 3-bosqich: parolni baholash ----------
  const PAROLLAR = ["12345678", "Anvar2010", "qwerty", "oltin baliq suzadi", "a1b2c3", "kitobjavonstol",
    "P@rol1", "mening birinchi itim", "Qq1!5z", "tulkiquyosh"];

  function bahoTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const p = pick(PAROLLAR, rnd);
      const b = baho(p);
      return { id: "baho:" + p, tur: "baho", parol: p, javob: b.daraja, nega: b.sabab,
        matn: "Bu parol qanday?", tahlil: tahlil(p) };
    }, prev, rr);
  }

  const DARAJALAR = ["zaif", "oʻrtacha", "kuchli"];

  // Ibora yasash uchun so'zlar (3–4 so'z — uzun va esda qoladigan parol)
  const SOZLAR = ["olma", "chashma", "quyosh", "kitob", "tulki", "shamol", "qalam", "chaqmoq", "dengiz", "arqon", "gilos", "burgut"];

  const api = { TURLAR, TEZLIK, MASHHUR, ISMLAR, KOINOT, soddalashtir, lugatda, VARIANT_SAVOL, VAQT_SAVOL, JUFTLAR, PAROLLAR, DARAJALAR, SOZLAR,
    tahlil, vaqt, vaqtMatni, baho, variantTask, vaqtTask, qiyosTask, bahoTask };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
