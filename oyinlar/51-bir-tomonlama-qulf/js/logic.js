// 51-o'yin: bir tomonlama qulf — sayt parolni emas, uning "izini" (xesh) saqlaydi.
// Bu yerdagi iz qoidasi haqiqiy SHA emas: u atayin kichik va qo'lda hisoblanadigan qilib yozilgan.
//   1) har belgi songa aylanadi: harf — alifbodagi o'rni (a=1 … z=26), raqam — o'zi;
//   2) chapdan boshlab: iz = iz × 3 + belgining soni;
//   3) faqat oxirgi ikki raqam qoladi (107 → 7). Boshlang'ich iz — tuz (sayt uchun xos son).
// Orqaga qaytarib bo'lmaydi va to'qnashuvlar bor — o'yinning asosiy g'oyasi shu.
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

  // Ketma-ket bir xil misol chiqmasligi uchun (QOIDALAR 4.3)
  function pickNew(make, prev, r) {
    for (let k = 0; k < 60; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  // ---------- Iz (xesh) ----------
  const ALIFBO = "abcdefghijklmnopqrstuvwxyz";
  const KOP = 3;    // har qadamda uchga ko'paytiramiz
  const CHEK = 100; // oxirgi ikki raqam qoladi

  // Belgining soni: raqam — o'zi, harf — alifbodagi o'rni, boshqasi — 0
  function belgiQiymat(ch) {
    const s = String(ch);
    if (s >= "0" && s <= "9") return Number(s);
    const k = ALIFBO.indexOf(s.toLowerCase());
    return k < 0 ? 0 : k + 1;
  }

  const tuzNorm = (tuz) => ((Number(tuz) || 0) % CHEK + CHEK) % CHEK;

  // Parolning izi: 0 dan 99 gacha son
  function iz(parol, tuz) {
    let x = tuzNorm(tuz);
    for (const ch of String(parol)) x = (x * KOP + belgiQiymat(ch)) % CHEK;
    return x;
  }

  // Hisobning har qadami — ekranda jadval qilib ko'rsatish uchun
  function izQadamlar(parol, tuz) {
    let x = tuzNorm(tuz);
    const out = [];
    for (const ch of String(parol)) {
      const qiymat = belgiQiymat(ch);
      const oldin = x;
      const xom = oldin * KOP + qiymat;
      x = xom % CHEK;
      out.push({ belgi: ch, qiymat, oldin, xom, iz: x });
    }
    return out;
  }

  // "7×3+15 = 36 → 36×3+12 = 48" — qadamlarning bir qatorli yozuvi
  const izHisob = (parol, tuz) => izQadamlar(parol, tuz)
    .map((q) => q.oldin + "×3+" + q.qiymat + " = " + (q.xom === q.iz ? q.iz : q.xom + " → " + q.iz))
    .join("   ");

  // ---------- So'zlar va saytlar ----------
  // Qo'lda hisoblash uchun qisqa parollar (3–4 belgi)
  const QISQA = ["olma", "tosh", "soat", "qush", "asal", "oyna", "bosh", "qora", "kuch", "gul", "tol", "non"];
  // Solishtirish uchun uzunroq parollar
  const PAROLLAR = ["kitob", "quyosh", "daftar", "shamol", "chaqmoq", "burgut", "gilos", "dengiz", "tulki", "qalam", "chashma", "arqon"];
  // Har saytning o'z "tuzi" bor: boshlang'ich iz shu sondan boshlanadi
  const SAYTLAR = [
    { id: "maktab", nom: "Maktab daftari", tuz: 7 },
    { id: "oyin", nom: "Oʻyin mamlakati", tuz: 23 },
    { id: "kitob", nom: "Kitob javoni", tuz: 58 },
    { id: "xabar", nom: "Xabarlar uyi", tuz: 41 },
  ];

  const NOMZOD = PAROLLAR.concat(QISQA);
  // To'qnashuv juftini izlashda avval "so'z + son" ko'rinishi sinaladi — bu haqiqiy parolga o'xshaydi
  const QOSHIMCHA = [""]
    .concat(Array.from({ length: 9 }, (_, i) => String(i + 1)))
    .concat(Array.from({ length: 90 }, (_, i) => String(i + 10)))
    .concat([...ALIFBO]);

  // Bir xil iz beradigan ikkinchi parolni topish (to'qnashuv). Topilmasa — null.
  function toqnash(parol, tuz) {
    const nishon = iz(parol, tuz);
    for (const q of QOSHIMCHA) {
      for (const soz of NOMZOD) {
        const nomzod = soz + q;
        if (nomzod !== String(parol) && iz(nomzod, tuz) === nishon) return nomzod;
      }
    }
    return null;
  }

  // ---------- Raqamlar yig'indisi (1-bosqich: eng oddiy bir tomonlama amal) ----------
  const raqamYigindi = (son) => String(son).split("").reduce((a, ch) => a + Number(ch), 0);
  const yigindiHisob = (son) => String(son).split("").join("+") + " = " + raqamYigindi(son);

  // Yig'indisi bir xil, o'zi boshqa son: bitta raqamdan bir dona olib, boshqasiga qo'shamiz
  function yigindiJuft(son, r) {
    const d = String(son).split("").map(Number);
    const joylar = [];
    for (let i = 0; i < d.length; i++) {
      for (let j = 0; j < d.length; j++) {
        if (i === j || d[i] <= 0 || d[j] >= 9) continue;
        if (i === 0 && d[i] - 1 === 0) continue; // son nol bilan boshlanmasin
        joylar.push([i, j]);
      }
    }
    if (!joylar.length) return null;
    const [i, j] = pick(joylar, r);
    const y = d.slice();
    y[i] -= 1;
    y[j] += 1;
    return Number(y.join(""));
  }

  // ---------- 1-bosqich: bir tomonlama amal ----------
  function yigindiTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const son = int(rnd, 1000, 9999);
      const javob = raqamYigindi(son);
      if (javob < 6) return null; // juda oson bo'lmasin
      return { id: "yigindi:" + son, tur: "yigindi", son, javob,
        matn: "Shu sonning raqamlarini qoʻshib chiq. Yigʻindi nechchi?",
        hisob: yigindiHisob(son),
        nega: "Raqamlarni chapdan oʻngga birma-bir qoʻshib boraver." };
    }, prev, rr);
  }

  function toqnashTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const son = int(rnd, 1000, 9999);
      const yigindi = raqamYigindi(son);
      const juft = yigindiJuft(son, rnd);
      if (!juft || yigindi < 6) return null;
      const soxta = [];
      for (let k = 0; k < 200 && soxta.length < 3; k++) {
        const x = int(rnd, 1000, 9999);
        if (raqamYigindi(x) === yigindi || x === son || soxta.includes(x)) continue;
        soxta.push(x);
      }
      if (soxta.length < 3) return null;
      return { id: "toqnash:" + son + ":" + juft, tur: "toqnash", son, yigindi, javob: String(juft),
        variantlar: aralash([juft, ...soxta], rnd).map(String),
        matn: "Shu sonning yigʻindisi — " + yigindi + ". Qaysi son ham " + yigindi + " beradi?",
        hisob: String(juft).split("").join("+") + " = " + yigindi,
        nega: "Har variantning raqamlarini qoʻshib koʻr: qaysi biri " + yigindi + " beradi?" };
    }, prev, rr);
  }

  const QAYTAR_SOXTA = ["Ha, yigʻindini teskari hisoblasam boʻladi", "Ha, faqat bitta son mos keladi"];
  const QAYTAR_JAVOB = "Yoʻq, koʻp son shu yigʻindini beradi";

  function qaytarTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const son = int(rnd, 1000, 9999);
      const yigindi = raqamYigindi(son);
      const juft = yigindiJuft(son, rnd);
      if (!juft || yigindi < 6) return null;
      return { id: "qaytar:" + son, tur: "qaytar", son, juft, yigindi, javob: QAYTAR_JAVOB,
        variantlar: aralash([QAYTAR_JAVOB, ...QAYTAR_SOXTA], rnd),
        matn: "Yigʻindi " + yigindi + " ekanini bilsang, asl sonni aniq topa olasanmi?",
        hisob: son + " ham, " + juft + " ham " + yigindi + " beradi",
        nega: "Yigʻindi orqaga yoʻl koʻrsatmaydi: " + son + " va " + juft + " — ikkisining yigʻindisi bir xil." };
    }, prev, rr);
  }

  // ---------- 2-bosqich: barmoq izi ----------
  function izTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const parol = pick(QISQA, rnd);
      const javob = iz(parol);
      if (javob < 10) return null; // iz ikki raqamli bo'lsin — nol bilan boshlanmaydi
      return { id: "iz:" + parol, tur: "iz", parol, tuz: 0, javob,
        qadamlar: izQadamlar(parol, 0),
        matn: "Shu parolning izini hisobla.",
        hisob: izHisob(parol, 0) + "   →   iz = " + javob,
        nega: "Qoida: izni 3 ga koʻpaytir, belgining sonini qoʻsh, oxirgi ikki raqamni qoldir." };
    }, prev, rr);
  }

  const HA = "Ha";
  const YOQ = "Yoʻq";

  function tengTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const a = pick(PAROLLAR, rnd);
      // Yarmida atayin to'qnashuv juftligi, yarmida izlari boshqa parol
      const boshqalar = PAROLLAR.concat(QISQA).filter((p) => p !== a && iz(p) !== iz(a));
      const b = rnd() < 0.5 ? toqnash(a, 0) : pick(boshqalar, rnd);
      if (!b) return null;
      const teng = iz(a) === iz(b);
      return { id: "teng:" + a + ":" + b, tur: "teng", ikki: [a, b], izlar: [iz(a), iz(b)],
        javob: teng ? HA : YOQ, variantlar: [HA, YOQ],
        matn: "Bu ikki parolning izi bir xilmi?",
        hisob: a + " → " + iz(a) + ",  " + b + " → " + iz(b),
        nega: teng
          ? "Ikkalasining izi " + iz(a) + ". Bir xil iz beradigan parollar bor — bu toʻqnashuv."
          : "Izlari boshqa: " + iz(a) + " va " + iz(b) + ". Bitta belgi oʻzgarsa ham iz oʻzgaradi." };
    }, prev, rr);
  }

  // ---------- Holat savollari: to'g'ri xulosani tanlash ----------
  const HOLATLAR2 = [
    { id: "baza",
      matn: "Oʻgʻri saytning bazasini oʻgʻirladi. Bazada faqat izlar bor. U sening parolingni bila oladimi?",
      javob: "Yoʻq — izdan parol chiqmaydi",
      soxta: ["Ha — iz parolning oʻzi", "Ha — izni teskari hisoblaydi"],
      nega: "Iz bir tomonlama: oldinga hisoblash oson, orqaga yoʻl yoʻq." },
    { id: "kirish",
      matn: "Sen parolni yozib, «Kirish» ni bosding. Sayt nima qiladi?",
      javob: "Izini qayta hisoblab, saqlangan iz bilan solishtiradi",
      soxta: ["Saqlangan parolni oʻqib solishtiradi", "Parolni senga koʻrsatadi"],
      nega: "Sayt izni har safar qaytadan hisoblaydi — parolning oʻzini saqlashga hojat yoʻq." },
    { id: "xat",
      matn: "Parolingni esdan chiqarding. Sayt eski parolingni xat bilan yuborib berdi. Bu nimani koʻrsatadi?",
      javob: "Sayt parolni ochiq saqlayapti — bu xavfli",
      soxta: ["Sayt gʻamxoʻr — bu yaxshi belgi", "Sayt izni teskari hisobladi"],
      nega: "Iz saqlaydigan sayt eski parolni qaytarib bera olmaydi — u faqat yangisini yasashni taklif qiladi." },
    { id: "xato",
      matn: "Sen parolni bitta harf xato yozding. Sayt nima qiladi?",
      javob: "Kiritmaydi — izlar mos kelmaydi",
      soxta: ["Kiritadi — parol juda yaqin edi", "Izni oʻzi toʻgʻrilab qoʻyadi"],
      nega: "Bitta belgi oʻzgarsa, iz butunlay boshqa chiqadi. Sayt «yaqin» parolni tanimaydi." },
    { id: "toqnashuv",
      matn: "Ikki xil parolning izi bir xil chiqdi. Bu nima degani?",
      javob: "Toʻqnashuv — bir xil iz beradigan parollar bor",
      soxta: ["Ikki parol aslida bir xil", "Hisobda xato bor"],
      nega: "Bizning iz qisqa, parollar esa koʻp. Haqiqiy saytlarda iz juda uzun — toʻqnashuv deyarli uchramaydi." },
  ];

  const HOLATLAR3 = [
    { id: "bir-parol",
      matn: "Hamma saytda bir xil parol ishlatasan. Bitta sayt buzildi. Nima boʻladi?",
      javob: "Oʻgʻri oʻsha parol bilan boshqa saytlarga ham kiradi",
      soxta: ["Hech narsa — har sayt oʻzicha ishlaydi", "Faqat oʻsha saytdagi iz yoʻqoladi"],
      nega: "Bir parol — bitta kalit hamma qulfga. Har saytga boshqa parol kerak." },
    { id: "tuz",
      matn: "Ikki saytda parolim bir xil, lekin izlari boshqa. Nega?",
      javob: "Har saytning oʻz tuzi bor",
      soxta: ["Izlar tasodifiy chiqadi", "Saytlar parolni oʻzgartirib qoʻyadi"],
      nega: "Tuz — saytga xos son. Boshlangʻich iz tuzdan boshlanadi, shuning uchun natija ham boshqa chiqadi." },
    { id: "ogirlangan-iz",
      matn: "Oʻgʻri bir saytdan izni oldi. Shu iz boshqa saytda ishlaydimi?",
      javob: "Yoʻq — u saytda tuz boshqa, iz ham boshqa",
      soxta: ["Ha — iz hamma joyda bir xil", "Ha, lekin sekinroq ishlaydi"],
      nega: "Tuz izlarni saytga bogʻlaydi: bitta roʻyxat hamma saytga yaramaydi." },
    { id: "qisqa-iz",
      matn: "Iz qisqa boʻlsa nimasi yomon?",
      javob: "Toʻqnashuv koʻp boʻladi",
      soxta: ["Hisoblash qiyin boʻladi", "Parol uzun boʻlib qoladi"],
      nega: "Shuning uchun haqiqiy izlar juda uzun — oʻnlab belgidan iborat." },
    { id: "oson-parol",
      matn: "Parolim — «12345». Sayt izni saqlaydi. Parolim xavfsizmi?",
      javob: "Yoʻq — mashhur parollarning izi oldindan hisoblangan",
      soxta: ["Ha — iz uni yashiradi", "Ha — izdan parol chiqmaydi"],
      nega: "Iz sirni saqlaydi, lekin zaif parolni kuchli qilmaydi. «Parol kuchi» oʻyinini esla." },
  ];

  function holatTask(bank, r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const h = pick(bank, rnd);
      return { id: "holat:" + h.id, tur: "holat", matn: h.matn, javob: h.javob, nega: h.nega,
        variantlar: aralash([h.javob, ...h.soxta], rnd) };
    }, prev, rr);
  }

  const holat2Task = (r, prev) => holatTask(HOLATLAR2, r, prev);
  const holat3Task = (r, prev) => holatTask(HOLATLAR3, r, prev);

  // ---------- 3-bosqich: tuz ----------
  function tuzTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const sayt = pick(SAYTLAR, rnd);
      const parol = pick(QISQA, rnd);
      const javob = iz(parol, sayt.tuz);
      const tuzsiz = iz(parol, 0);
      if (javob < 10 || javob === tuzsiz) return null; // tuz izni oʻzgartirgani koʻrinsin
      return { id: "tuz:" + sayt.id + ":" + parol, tur: "tuz", sayt, parol, javob, tuzsiz,
        qadamlar: izQadamlar(parol, sayt.tuz),
        matn: "«" + sayt.nom + "» saytining tuzi — " + sayt.tuz + ". Shu parolning izi nechchi?",
        hisob: izHisob(parol, sayt.tuz) + "   →   iz = " + javob,
        nega: "Boshlangʻich iz — tuz (" + sayt.tuz + "), keyin oʻsha qoida: ×3 va belgining soni." };
    }, prev, rr);
  }

  // Bitta parol har saytda qanday iz beradi — 3-bosqichdagi jadval uchun
  const tuzJadval = (parol) => SAYTLAR.map((s) => ({ sayt: s, iz: iz(parol, s.tuz) }));

  // ---------- Bosqichlar: mashq navbati ----------
  const BOSQICH1 = [yigindiTask, toqnashTask, qaytarTask];
  const BOSQICH2 = [izTask, tengTask, holat2Task];
  const BOSQICH3 = [tuzTask, holat3Task, holat3Task];

  const navbat = (bank) => (r, prev, n) => bank[(n || 0) % bank.length](r, prev);

  const api = {
    ALIFBO, KOP, CHEK, QISQA, PAROLLAR, SAYTLAR, HOLATLAR2, HOLATLAR3, HA, YOQ,
    QAYTAR_JAVOB, QAYTAR_SOXTA, BOSQICH1, BOSQICH2, BOSQICH3,
    belgiQiymat, iz, izQadamlar, izHisob, toqnash, tuzJadval,
    raqamYigindi, yigindiHisob, yigindiJuft,
    yigindiTask, toqnashTask, qaytarTask, izTask, tengTask, holatTask, holat2Task, holat3Task, tuzTask,
    bosqich1Task: navbat(BOSQICH1), bosqich2Task: navbat(BOSQICH2), bosqich3Task: navbat(BOSQICH3),
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
