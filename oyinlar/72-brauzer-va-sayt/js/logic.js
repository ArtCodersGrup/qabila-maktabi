// 72-o'yin: brauzer va sayt — o'yinchoq internet (saytlar banki), brauzer holati (tarix: orqaga/oldinga),
// qidiruv (so'z bo'yicha sahifa topish), uch bosqich vazifa generatorlari va tekshiruvlar.
// Holat amallari O'ZGARMAS uslubda: har amal YANGI holat qaytaradi; bajarilmasa — o'sha holatning O'ZI (y === h).
// Ekransiz sof mantiq; Node'da test qilinadi: tests/logic.test.js
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

  // Ketma-ket bir xil misol chiqmasligi uchun (QOIDALAR 4.3). Generator null qaytarsa — qayta urinadi.
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

  // ---------- Matnni solishtirish ----------
  // Katta-kichik harf, apostrof turi (oʻ / o' / o`) va chiziqcha (ob-havo / obhavo) farq qilmaydi
  const norm = (s) => String(s || "").toLowerCase().replace(/[ʻʼ'`’‘´]/g, "").replace(/-/g, "").replace(/\s+/g, " ").trim();
  // Matnda so'z necha marta uchraydi (qism sifatida: «tuya» — «Tuyaning» ichida ham)
  function sanoq(matn, soz) {
    if (!soz) return 0;
    let n = 0;
    for (let i = matn.indexOf(soz); i !== -1; i = matn.indexOf(soz, i + soz.length)) n++;
    return n;
  }

  // ---------- Saytlar banki ----------
  // Sahifa: { id, manzil, sarlavha, matn: [gaplar], rasm (game-art nomi), havolalar: [{ matn, sahifa }],
  //           qulf (manzil yonidagi qulf), soroq: "parol" | "telefon" | null, qalqib (shu sahifada qalqib oyna chiqishi mumkin) }
  const S = (id, manzil, sarlavha, matn, rasm, havolalar, opts) =>
    Object.assign({ id, manzil, sarlavha, matn, rasm, havolalar: havolalar || [], qulf: true, soroq: null, qalqib: false }, opts || {});
  const H = (matn, sahifa) => ({ matn, sahifa });

  const SAHIFALAR = [
    S("qabila", "qabila.uz", "Bizning qabila", [
      "Qabilamiz togʻ etagida yashaydi.",
      "Bizda maktab, bozor va katta chinor bor.",
      "Endi qabilaga internet ham keldi!",
    ], "qabila", [H("Maktabimiz", "maktab"), H("Bugungi ob-havo", "obhavo"), H("Ertaklar", "ertaklar")]),
    S("maktab", "maktab.uz", "Maktabimiz", [
      "Qabila maktabida darslar soat 8 da boshlanadi.",
      "Kutubxonada 500 ta kitob bor.",
      "Juma kuni sport musobaqasi boʻladi.",
    ], "maktab", [H("Bizning qabila", "qabila"), H("Ertaklar oʻqish", "ertaklar")]),
    S("obhavo", "obhavo.uz", "Ob-havo", [
      "Qabilada bugun havo ochiq, 25 daraja issiq.",
      "Ertaga yomgʻir yogʻadi — soyabon ol.",
      "Shamol kuchsiz.",
    ], "obhavo", [H("Bizning qabila", "qabila")], { qalqib: true }),
    S("hayvonlar", "hayvonlar.uz", "Hayvonlar dunyosi", [
      "Bu saytda hayvonlar haqida qiziq faktlar bor.",
      "Havolani bosib, hayvonni tanla.",
    ], "hayvonlar", [H("Tuyalar", "tuyalar"), H("Fillar", "fillar"), H("Qushlar", "qushlar")]),
    S("tuyalar", "hayvonlar.uz/tuyalar", "Tuyalar", [
      "Tuya choʻlda yashaydi.",
      "Tuya 7 kun suvsiz yura oladi.",
      "Tuyaning oʻrkachida suv emas, yogʻ saqlanadi.",
    ], "tuya", [H("Hayvonlar", "hayvonlar"), H("Fillar", "fillar")]),
    S("fillar", "hayvonlar.uz/fillar", "Fillar", [
      "Fil — quruqlikdagi eng katta hayvon.",
      "Fil xartumi bilan suv ichadi.",
      "Fil kuniga 100 kilogramm oʻt yeydi.",
    ], "fil", [H("Hayvonlar", "hayvonlar"), H("Tuyalar", "tuyalar")]),
    S("qushlar", "hayvonlar.uz/qushlar", "Qushlar", [
      "Tuyaqush — eng katta qush, lekin ucha olmaydi.",
      "Kolibri — eng kichik qush.",
      "Qushlarning suyagi ichi boʻsh, shuning uchun ular yengil.",
    ], "qush", [H("Hayvonlar", "hayvonlar"), H("Tuyaqush", "tuyaqush")]),
    S("tuyaqush", "hayvonlar.uz/qushlar/tuyaqush", "Tuyaqush", [
      "Tuyaqush — eng katta qush.",
      "U ucha olmaydi, lekin soatiga 70 kilometr yuguradi.",
      "Tuyaqush tuxumi — eng katta tuxum.",
    ], "tuyaqush", [H("Qushlar", "qushlar")]),
    S("sayyoralar", "sayyoralar.uz", "Sayyoralar", [
      "Quyosh atrofida 8 ta sayyora aylanadi.",
      "Eng kattasi — Yupiter.",
      "Qizil sayyora — Mars.",
      "Biz Yer sayyorasida yashaymiz.",
    ], "sayyoralar", [H("Mars", "mars")]),
    S("mars", "sayyoralar.uz/mars", "Mars", [
      "Mars qizil rangda koʻrinadi.",
      "Marsda 2 ta yoʻldosh bor.",
      "Mars Yerdan kichik.",
    ], "mars", [H("Sayyoralar", "sayyoralar")]),
    S("ertaklar", "ertaklar.uz", "Ertaklar", [
      "Bu yerda oʻzbek xalq ertaklari bor.",
      "Oʻqish uchun ertakni tanla.",
    ], "ertaklar", [H("Zumrad va Qimmat", "zumrad"), H("Susambil", "susambil")]),
    S("zumrad", "ertaklar.uz/zumrad", "Zumrad va Qimmat", [
      "Zumrad — mehnatkash va mehribon qiz.",
      "Oʻgay onasi uni oʻrmonga haydab yuboradi.",
      "Oʻrmonda u chol bilan uchrashadi va sandiq oladi.",
    ], "zumrad", [H("Ertaklar", "ertaklar"), H("Susambil", "susambil")]),
    S("susambil", "ertaklar.uz/susambil", "Susambil", [
      "Susambil — hayvonlar izlagan baxtli oʻlka.",
      "Hoʻkiz va eshak zolim boydan qochib ketadi.",
      "Yoʻlda ularga xoʻroz qoʻshiladi.",
    ], "susambil", [H("Ertaklar", "ertaklar"), H("Zumrad va Qimmat", "zumrad")]),
    S("qidiruv", "qidiruv.uz", "Qidiruv", [
      "Soʻz yoz — sahifalarni topib beraman.",
    ], "qidiruv", []),
    S("oyinlar", "oyinlar.uz", "Bepul oʻyinlar", [
      "Bu yerda yuzlab oʻyin bor.",
      "Oʻyinni tanla va oʻyna.",
    ], "oyin", [H("Bizning qabila", "qabila")], { qulf: false, qalqib: true }),
    S("sovga", "sovga.uz", "Sovgʻa", [
      "Siz sovgʻa yutib oldingiz!",
      "Olish uchun telefon raqamingizni yozing.",
    ], "sovga", [], { qulf: false, soroq: "telefon" }),
    S("kino", "kino.uz", "Bepul kino", [
      "Hamma kinolar bepul!",
      "Koʻrish uchun kompyuter parolini yozing.",
    ], "kino", [], { qulf: false, soroq: "parol" }),
    S("yutuq", "oyinlar.uz/yutuq", "Yutuq", [
      "Siz 1000 soʻm yutdingiz!",
      "Olish uchun telefon raqamingizni yozing.",
    ], "sovga", [], { qulf: false, soroq: "telefon" }),
  ];
  const SAHIFA = {};
  for (const p of SAHIFALAR) SAHIFA[p.id] = p;
  const BOSH = "qabila"; // brauzer ochilganda turadigan sahifa
  const QIDIRUV = "qidiruv";

  const sahifaTop = (id) => SAHIFA[id] || null;
  const xavfsiz = (p) => !p.soroq; // parol/telefon so'raydigan sayt oddiy vazifada chiqmaydi
  const ustki = (p) => !p.manzil.includes("/");
  // Telefonda manzil satri o'rniga chiqadigan chiplar: bankdagi oddiy saytlar
  const CHIP_MANZILLAR = SAHIFALAR.filter(xavfsiz).map((p) => p.manzil);

  // Manzilni tozalash: bo'sh joy, katta harf, «https://», «www.», oxirgi «/»
  const manzilTozala = (s) => String(s || "").trim().toLowerCase().replace(/\s+/g, "").replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");
  const manzilTop = (s) => SAHIFALAR.find((p) => p.manzil === manzilTozala(s)) || null;

  // ---------- Brauzer holati: tarix va ko'rsatkich ----------
  // Yozuv: { id (sahifa yoki null — bunday sayt yo'q), manzil, soz (qidiruv sahifasida yozilgan so'z) }
  const yozuv = (p, soz) => ({ id: p.id, manzil: p.manzil, soz: soz == null ? "" : soz });

  function yangi(id) {
    const p = sahifaTop(id || BOSH);
    return { tarix: [yozuv(p)], korsatkich: 0 };
  }
  const joriy = (h) => h.tarix[h.korsatkich];
  const joriyId = (h) => joriy(h).id;
  const sahifa = (h) => sahifaTop(joriyId(h));
  const orqagaMumkin = (h) => h.korsatkich > 0;
  const oldingaMumkin = (h) => h.korsatkich < h.tarix.length - 1;

  // Yangi sahifaga o'tish: oldinga yo'li o'chadi (haqiqiy brauzerdagidek)
  const qoshish = (h, y) => ({ tarix: h.tarix.slice(0, h.korsatkich + 1).concat([y]), korsatkich: h.korsatkich + 1 });

  // Manzil satriga yozib ochish. Noma'lum manzil — «Bunday sayt yo'q» sahifasi (id: null)
  function och(h, manzil) {
    const toza = manzilTozala(manzil);
    if (!toza) return h;
    const p = manzilTop(toza);
    return qoshish(h, p ? yozuv(p) : { id: null, manzil: toza, soz: "" });
  }
  // Joriy sahifadagi havolani bosish; bunday havola bo'lmasa — holat o'zgarmaydi
  function havola(h, id) {
    const p = sahifa(h);
    if (!p || !p.havolalar.some((l) => l.sahifa === id)) return h;
    return qoshish(h, yozuv(sahifaTop(id)));
  }
  const orqaga = (h) => (orqagaMumkin(h) ? { tarix: h.tarix, korsatkich: h.korsatkich - 1 } : h);
  const oldinga = (h) => (oldingaMumkin(h) ? { tarix: h.tarix, korsatkich: h.korsatkich + 1 } : h);
  // Qidiruv: so'z yozildi — natijalar sahifasi tarixga yoziladi (orqaga bossa — bo'sh qidiruv)
  const qidirOch = (h, soz) => qoshish(h, yozuv(sahifaTop(QIDIRUV), String(soz || "").trim()));
  // Qidiruv natijasini ochish
  const natija = (h, id) => (sahifaTop(id) ? qoshish(h, yozuv(sahifaTop(id))) : h);
  // «Chiqib ketaman»: orqaga; tarix bo'lmasa — bosh sahifa
  const chiq = (h) => (orqagaMumkin(h) ? orqaga(h) : och(h, SAHIFA[BOSH].manzil));
  // Manzil satri takliflari: tarixdan, oxirgilari birinchi, takrorsiz, joriy sahifa emas, yozilgan harflar bilan boshlanadigan
  function takliflar(h, boshi, soni) {
    const b = manzilTozala(boshi);
    const out = [];
    for (let i = h.tarix.length - 1; i >= 0 && out.length < (soni || 3); i--) {
      const m = h.tarix[i].manzil;
      if (!m || i === h.korsatkich || out.includes(m) || !m.startsWith(b)) continue;
      out.push(m);
    }
    return out;
  }

  // ---------- Qidiruv ----------
  // So'z sarlavhada — +3, matnda har uchrashi — +1. Hamma so'z topilgan sahifalar; ball bo'yicha, teng bo'lsa bank tartibida.
  function qidir(soz) {
    const sozlar = norm(soz).split(" ").filter((w) => w.length >= 2);
    if (!sozlar.length) return [];
    const out = [];
    SAHIFALAR.forEach((p, k) => {
      if (p.id === QIDIRUV || !xavfsiz(p)) return;
      const sarlavha = norm(p.sarlavha);
      const matn = norm(p.matn.join(" "));
      let ball = 0;
      for (const w of sozlar) {
        const b = (sarlavha.includes(w) ? 3 : 0) + sanoq(matn, w);
        if (!b) return;
        ball += b;
      }
      out.push({ p, ball, k });
    });
    return out.sort((a, b) => b.ball - a.ball || a.k - b.k).map((x) => x.p);
  }
  // Telefonda qidiruv satri o'rniga chiqadigan so'zlar
  const QIDIRUV_SOZLAR = ["tuya", "fil", "qush", "sayyora", "ertak", "ob-havo", "maktab", "qabila", "hayvon", "quyosh"];

  // ---------- 1-bosqich: manzil, havola, orqaga ----------
  // Hodisa: { amal, id } — amal: och | havola | orqaga | oldinga | natija | chiq (sahifa o'zgardi, id — yangi sahifa),
  // manzil | chiplar | yangila | xatchop | qidir (betaraf). Natija: "togri" | "xato" | "betaraf".
  const OZGARTIRADI = ["och", "havola", "orqaga", "oldinga", "natija", "chiq"];
  function tekshir1(task, hodisa) {
    if (!hodisa || !OZGARTIRADI.includes(hodisa.amal)) return "betaraf";
    if (hodisa.id === task.nishon) return "togri";
    if (hodisa.id != null && task.yol.includes(hodisa.id)) return "betaraf";
    return "xato";
  }

  // Boshlang'ich sahifa: vazifadagi sahifalardan farqli
  const boshqaBosh = (...ids) => [BOSH, "hayvonlar", "sayyoralar"].find((id) => !ids.includes(id));

  // Saytni manzil bilan och. tier 0 — bosh sahifa (qabila.uz), tier 1–2 — ichki sahifa (hayvonlar.uz/tuyalar)
  function manzilTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      const nomzod = SAHIFALAR.filter((p) => xavfsiz(p) && p.id !== QIDIRUV && (t === 0 ? ustki(p) : !ustki(p)));
      const p = pick(nomzod, rr);
      const bosh = boshqaBosh(p.id);
      return {
        tur: "manzil", id: `manzil:${p.id}`, bosh, holat: yangi(bosh), nishon: p.id, javob: p.manzil, yol: [bosh],
        qadamlar: [{ amal: "och", manzil: p.manzil }],
        matn: `«${p.manzil}» ${t === 0 ? "saytini" : "sahifasini"} och.`,
        ishora: "Manzil satri — yuqorida, qulf belgisi yonida. Manzilni harfma-harf tekshir.",
        nega: `Manzil satriga «${p.manzil}» yoziladi — sahifa ochiladi.`,
      };
    }, prev, r);
  }

  // Shu sahifadagi havolani bos. tier 0 — 3 havolali sahifa; tier 1–2 — kamida 2 havolali istalgan sahifa
  function havolaTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      const nomzod = SAHIFALAR.filter((p) => xavfsiz(p) && p.havolalar.length >= (t === 0 ? 3 : 2));
      const p = pick(nomzod, rr);
      const l = pick(p.havolalar, rr);
      return {
        tur: "havola", id: `havola:${p.id}:${l.sahifa}`, bosh: p.id, holat: yangi(p.id), nishon: l.sahifa, javob: l.sahifa,
        havolaMatn: l.matn, yol: [p.id], qadamlar: [{ amal: "havola", id: l.sahifa }],
        matn: `Shu sahifadagi «${l.matn}» havolasini bos.`,
        ishora: `Havola — koʻk, tagiga chizilgan soʻz. Sahifadan «${l.matn}»ni top.`,
        nega: `«${l.matn}» — havola. Bosilsa, «${SAHIFA[l.sahifa].sarlavha}» sahifasi ochiladi.`,
      };
    }, prev, r);
  }

  // Havolalar bo'ylab 3 sahifalik yo'l: a → b → c (c ≠ a)
  function zanjir(r) {
    for (let k = 0; k < 50; k++) {
      const a = pick(SAHIFALAR.filter((p) => xavfsiz(p) && p.havolalar.length), r);
      const b = SAHIFA[pick(a.havolalar, r).sahifa];
      const c = b.havolalar.length ? SAHIFA[pick(b.havolalar, r).sahifa] : null;
      if (c && c.id !== a.id) return [a, b, c];
    }
    return null;
  }

  // Avvalgi sahifaga qayt. tier 0 — 1 qadam, tier 1–2 — 2 qadam (sahifa nomi aytiladi)
  function orqagaTask(r, prev, tier) {
    return pickNew((rr) => {
      const z = zanjir(rr);
      if (!z) return null;
      const n = (tier || 0) < 1 ? 1 : 2;
      const holat = { tarix: z.map((p) => yozuv(p)), korsatkich: 2 };
      const nishon = z[2 - n].id;
      return {
        tur: "orqaga", id: `orqaga:${z.map((p) => p.id).join(">")}:${n}`, holat, nishon, javob: nishon, qadam: n,
        yol: n === 1 ? [z[2].id] : [z[2].id, z[1].id],
        qadamlar: Array.from({ length: n }, () => ({ amal: "orqaga" })),
        matn: n === 1 ? "Avvalgi sahifaga qayt." : `«Orqaga» bilan «${z[0].sarlavha}» sahifasiga qayt.`,
        ishora: n === 1 ? "«← Orqaga» tugmasi — yuqorida, chapda." : "«← Orqaga» tugmasi — yuqorida, chapda. Ikki marta bos.",
        nega: n === 1 ? "«Orqaga» avvalgi sahifaga qaytaradi." : "Har «Orqaga» bir sahifa qaytaradi: ikki marta — ikki sahifa.",
      };
    }, prev, r);
  }

  // Ikki qadam: saytga kir, undagi havolani och (tier ≥ 1; tier 0 da — oddiy manzil vazifasi)
  function yolTask(r, prev, tier) {
    if ((tier || 0) < 1) return manzilTask(r, prev, tier);
    return pickNew((rr) => {
      const s = pick(SAHIFALAR.filter((p) => xavfsiz(p) && ustki(p) && p.id !== QIDIRUV && p.havolalar.length >= 2), rr);
      const l = pick(s.havolalar, rr);
      // Boshlang'ich sahifa saytning havolalari orasida bo'lmasin — noto'g'ri havola doim xato bo'ladi
      const bosh = boshqaBosh(s.id, ...s.havolalar.map((x) => x.sahifa));
      return {
        tur: "yol", id: `yol:${s.id}:${l.sahifa}`, bosh, holat: yangi(bosh), sayt: s.manzil, saytId: s.id,
        nishon: l.sahifa, javob: l.sahifa, havolaMatn: l.matn, yol: [bosh, s.id],
        qadamlar: [{ amal: "och", manzil: s.manzil }, { amal: "havola", id: l.sahifa }],
        matn: `«${s.manzil}» saytiga kir. Undagi «${l.matn}» havolasini och.`,
        ishora: "Avval manzil satriga saytni yoz. Keyin sahifadagi koʻk havolani bos.",
        nega: `Avval «${s.manzil}», keyin «${l.matn}» havolasi — «${SAHIFA[l.sahifa].sarlavha}» ochiladi.`,
      };
    }, prev, r);
  }

  // ---------- 2-bosqich: xazina ovi (qidiruv) ----------
  // kalit — savoldagi asosiy so'z; tier shu so'z bo'yicha qidirilganda javob sahifasi qayerda turishidan:
  // 0 — birinchi natija, 1 — ikkinchi-uchinchi, 2 — natijalarda yo'q, natija ichidagi havola ortida
  const X = (sahifa, savol, javob, kalit, tier, notogri) => ({ sahifa, savol, javob, kalit, tier, notogri });
  const XAZINA = [
    X("tuyalar", "Tuya necha kun suvsiz yura oladi?", "7 kun", "tuya", 0, ["1 kun", "3 kun", "30 kun"]),
    X("tuyalar", "Tuyaning oʻrkachida nima saqlanadi?", "Yogʻ", "tuya", 0, ["Suv", "Qum", "Ovqat"]),
    X("fillar", "Fil nima bilan suv ichadi?", "Xartumi bilan", "fil", 0, ["Qulogʻi bilan", "Dumi bilan", "Oyogʻi bilan"]),
    X("sayyoralar", "Quyosh atrofida nechta sayyora aylanadi?", "8 ta", "sayyora", 0, ["5 ta", "9 ta", "12 ta"]),
    X("sayyoralar", "Eng katta sayyora qaysi?", "Yupiter", "sayyora", 0, ["Mars", "Yer", "Venera"]),
    X("qushlar", "Eng kichik qush qaysi?", "Kolibri", "qush", 0, ["Chumchuq", "Tuyaqush", "Qaldirgʻoch"]),
    X("obhavo", "Ertaga ob-havo qanday boʻladi?", "Yomgʻir yogʻadi", "ob-havo", 0, ["Qor yogʻadi", "Havo ochiq boʻladi", "Kuchli shamol boʻladi"]),
    X("maktab", "Maktab kutubxonasida nechta kitob bor?", "500 ta", "maktab", 0, ["50 ta", "100 ta", "1000 ta"]),
    X("tuyaqush", "Eng katta qush soatiga necha kilometr yuguradi?", "70 kilometr", "qush", 1, ["7 kilometr", "20 kilometr", "200 kilometr"]),
    X("maktab", "Qabila maktabida darslar soat nechada boshlanadi?", "Soat 8 da", "qabila", 1, ["Soat 7 da", "Soat 9 da", "Soat 10 da"]),
    X("obhavo", "Qabilada bugun havo necha daraja?", "25 daraja", "qabila", 1, ["15 daraja", "20 daraja", "35 daraja"]),
    X("fillar", "Quruqlikdagi eng katta hayvon nima bilan suv ichadi?", "Xartumi bilan", "hayvon", 1, ["Qulogʻi bilan", "Dumi bilan", "Oyogʻi bilan"]),
    X("mars", "Qizil sayyorada nechta yoʻldosh bor?", "2 ta", "sayyora", 2, ["1 ta", "5 ta", "8 ta"]),
    X("zumrad", "Zumrad oʻrmonda kim bilan uchrashadi?", "Chol bilan", "ertak", 2, ["Boʻri bilan", "Qimmat bilan", "Podshoh bilan"]),
    X("susambil", "Qaysi ertakda hoʻkiz va eshak boydan qochadi?", "Susambil", "ertak", 2, ["Zumrad va Qimmat", "Boʻri va tulki", "Uch ogʻayni botirlar"]),
  ];

  // Javob sahifaning qaysi gapida (yechimda shu gap yoritiladi); sarlavhada bo'lsa — -1
  const javobGapi = (p, javob) => p.matn.findIndex((g) => norm(g).includes(norm(javob)));

  // Avtomat o'ynovchi uchun yo'l: qidir → natijani och (→ havola)
  function xazinaYoli(q) {
    const nat = qidir(q.kalit);
    const yol = [{ amal: "qidir", soz: q.kalit }];
    if (nat.some((p) => p.id === q.sahifa)) return yol.concat([{ amal: "natija", id: q.sahifa }]);
    const hub = nat.find((p) => p.havolalar.some((l) => l.sahifa === q.sahifa));
    return hub ? yol.concat([{ amal: "natija", id: hub.id }, { amal: "havola", id: q.sahifa }]) : yol;
  }

  function xazinaTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      const k = XAZINA.indexOf(pick(XAZINA.filter((q) => q.tier === t), rr));
      const q = XAZINA[k];
      const p = SAHIFA[q.sahifa];
      return {
        tur: "xazina", id: `xazina:${k}`, holat: yangi(QIDIRUV), savol: q.savol, javob: q.javob, sahifa: q.sahifa, kalit: q.kalit,
        variantlar: aralash([q.javob].concat(q.notogri), rr), gap: javobGapi(p, q.javob), qadamlar: xazinaYoli(q),
        matn: q.savol,
        ishora: "Qidiruvga asosiy soʻzni yoz — qisqa, bitta soʻz. Natijani ochib, javobni sahifadan oʻqi.",
        nega: `Javob «${q.javob}» — «${p.sarlavha}» sahifasida (${p.manzil}).`,
      };
    }, prev, r);
  }
  const tekshirXazina = (task, variant) => variant === task.javob;

  // ---------- 3-bosqich: xavfsiz yurish ----------
  // Qalqib chiquvchi oynalar (sariq-to'q sariq, qo'rqitmaydi). tier 2 da ichidagi tugma «Yopish» deb aldaydi — ✕ baribir burchakda
  const QALQIB = [
    { sarlavha: "Siz yutdingiz!", matn: "Sovgʻani olish uchun bosing!", tugma: "Olish" },
    { sarlavha: "Telefoningiz sekin!", matn: "Tezlashtirish uchun bosing!", tugma: "Tezlashtirish" },
    { sarlavha: "Bepul oʻyin!", matn: "Yuklab olish uchun bosing!", tugma: "Yuklash" },
    { sarlavha: "Siz millioninchi mehmonsiz!", matn: "Mukofotni oling!", tugma: "Olish" },
  ];
  const QALQIB_SAHIFALAR = SAHIFALAR.filter((p) => p.qalqib).map((p) => p.id);
  const SOROQ_SAHIFALAR = SAHIFALAR.filter((p) => p.soroq).map((p) => p.id);

  // Sahifa ochiq holat: bosh → sahifa (orqaga bosish mumkin)
  const ochiqHolat = (id) => och(yangi(BOSH), SAHIFA[id].manzil);

  function qalqibTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      const sahifaId = pick(QALQIB_SAHIFALAR, rr);
      const k = Math.floor(rr() * QALQIB.length);
      const oyna = Object.assign({}, QALQIB[k], t === 2 ? { tugma: "Yopish", aldamchi: true } : {});
      return {
        tur: "qalqib", id: `qalqib:${sahifaId}:${k}:${t === 2 ? 1 : 0}`, holat: ochiqHolat(sahifaId), sahifa: sahifaId, oyna, javob: "yop",
        qadamlar: [{ amal: "yop" }],
        matn: "Sahifa ochildi. Diqqat: toʻgʻri ish qil.",
        ishora: oyna.aldamchi ? "Oyna ichidagi tugma aldaydi — «Yopish» deb yozilgan boʻlsa ham. ✕ — oynaning yuqori burchagida."
          : "Oyna ichidagi tugmani bosma — u aldaydi. ✕ — oynaning yuqori burchagida.",
        nega: "Qalqib chiqqan oyna burchakdagi ✕ bilan yopiladi. Ichidagi tugma bosilmaydi.",
      };
    }, prev, r);
  }
  // Oyna ichidagi tugma (bos) — xato; ✕ (yop) — to'g'ri; qolgani betaraf
  const tekshirQalqib = (task, amal) => (amal === "yop" ? "togri" : amal === "bos" ? "xato" : "betaraf");

  function soroqTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      const nomzod = t === 0 ? SOROQ_SAHIFALAR.filter((id) => SAHIFA[id].soroq === "telefon") : SOROQ_SAHIFALAR;
      const sahifaId = pick(nomzod, rr);
      const p = SAHIFA[sahifaId];
      return {
        tur: "soroq", id: `soroq:${sahifaId}`, holat: ochiqHolat(sahifaId), sahifa: sahifaId, soroq: p.soroq, javob: "chiq",
        qadamlar: [{ amal: "chiq" }],
        matn: "Sayt nimadir soʻrayapti. Toʻgʻri ish qil.",
        ishora: `${p.soroq === "parol" ? "Parol" : "Telefon raqami"} saytga yozilmaydi. «Chiqib ketaman»ni bos yoki «Orqaga» qayt.`,
        nega: "Sayt parol yoki telefon soʻrasa — yozmaymiz, chiqib ketamiz va kattaga aytamiz.",
      };
    }, prev, r);
  }
  // Yozish (yoz) yoki «Yuborish» (yubor) — xato; chiqib ketish (chiq, orqaga, boshqa sayt och) — to'g'ri; qolgani betaraf
  const tekshirSoroq = (task, amal) => (amal === "yoz" || amal === "yubor" ? "xato" : amal === "chiq" || amal === "orqaga" || amal === "och" ? "togri" : "betaraf");

  // Vaziyat savollari: 4 variant, birinchisi — to'g'ri (ekranda aralashtiriladi)
  const V = (savol, variantlar, tier, rasm, nega) => ({ savol, variantlar, tier, rasm, nega });
  const SAVOLLAR = [
    V("Notanish odam chatda uy manzilingni soʻradi. Nima qilasan?",
      ["Aytmayman, kattaga aytaman", "Manzilni yozaman", "Faqat koʻcha nomini aytaman", "Uyimning rasmini yuboraman"],
      0, "chat", "Manzil, telefon, maktab — sir. Notanishga aytilmaydi."),
    V("Sayt: «Sovgʻa olish uchun parolingni yoz». Nima qilasan?",
      ["Yozmayman, saytdan chiqaman", "Parolni yozaman", "Eski parolimni yozaman", "Doʻstimning parolini yozaman"],
      0, "ogoh", "Parol hech qanday saytga yozilmaydi — sovgʻa vaʼda qilsa ham."),
    V("Ekranda «Siz yutdingiz! Bosing!» oynasi chiqdi. Nima qilasan?",
      ["✕ bilan yopaman", "«Bosing»ni bosaman", "Telefon raqamimni yozaman", "Doʻstlarimga yuboraman"],
      0, "ogoh", "Bunday oyna aldaydi. U faqat ✕ bilan yopiladi."),
    V("Sayt telefon raqamingni soʻrayapti. Nima qilasan?",
      ["Yozmayman, kattaga aytaman", "Raqamni yozaman", "Onamning raqamini yozaman", "Faqat yarmini yozaman"],
      1, "ogoh", "Telefon raqami — sir. Sayt soʻrasa, kattaga aytamiz."),
    V("Manzil yonida qulf yoʻq, sayt parol soʻrayapti. Nima qilasan?",
      ["Chiqib ketaman", "Parolni yozaman", "Parolni yozib, keyin oʻchiraman", "Parolni ikki marta yozaman"],
      1, "qulfsiz", "Qulf yoʻq — sayt ishonchsiz. Parol yozilmaydi, chiqib ketamiz."),
    V("Notanish odam «rasmingni yubor» dedi. Nima qilasan?",
      ["Yubormayman, kattaga aytaman", "Rasmimni yuboraman", "Doʻstimning rasmini yuboraman", "Faqat bitta rasm yuboraman"],
      1, "chat", "Rasm ham shaxsiy narsa. Notanishga yuborilmaydi."),
    V("Sayt «dasturni yukla» deb qistayapti. Nima qilasan?",
      ["Yuklamayman, kattadan soʻrayman", "Darrov yuklayman", "Ikki marta yuklayman", "Parolni yozib yuklayman"],
      2, "ogoh", "Notanish dastur kompyuterni buzishi mumkin. Avval kattadan soʻraymiz."),
    V("Internetda kimdir seni xafa qildi. Nima qilasan?",
      ["Kattaga aytaman", "Javoban xafa qilaman", "Hech kimga aytmayman", "Manzilimni yozaman"],
      2, "chat", "Xafa qilsa — javob qaytarmaymiz, kattaga aytamiz."),
    V("Doʻsting parolingni soʻradi. Nima qilasan?",
      ["Aytmayman — parol faqat meniki", "Aytaman, u doʻstim-ku", "Yarmini aytaman", "Qogʻozga yozib beraman"],
      2, "chat", "Parol faqat egasiniki. Doʻstga ham aytilmaydi."),
  ];

  function savolTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      const nomzod = SAVOLLAR.filter((s) => s.tier <= t);
      const k = SAVOLLAR.indexOf(pick(nomzod, rr));
      const s = SAVOLLAR[k];
      return {
        tur: "savol", id: `savol:${k}`, savol: s.savol, rasm: s.rasm, variantlar: aralash(s.variantlar, rr), javob: s.variantlar[0],
        matn: s.savol,
        ishora: "Oʻzing haqingdagi narsa — manzil, telefon, parol, rasm — sir. Notanishga berilmaydi, saytga yozilmaydi.",
        nega: s.nega,
      };
    }, prev, r);
  }
  const tekshirSavol = (task, variant) => variant === task.javob;

  const BOSQICH1 = [manzilTask, havolaTask, orqagaTask, yolTask];
  const BOSQICH2 = [xazinaTask];
  const BOSQICH3 = [qalqibTask, soroqTask, savolTask];

  // n — nechanchi to'g'ri javob (mashq turi navbati), tier — qiyinlik zinasi
  const navbat = (bank) => (r, prev, n, tier) => bank[(n || 0) % bank.length](r, prev, tier);

  const api = {
    SAHIFALAR, SAHIFA, BOSH, QIDIRUV, CHIP_MANZILLAR, QIDIRUV_SOZLAR, XAZINA, QALQIB, QALQIB_SAHIFALAR, SOROQ_SAHIFALAR, SAVOLLAR,
    BOSQICH1, BOSQICH2, BOSQICH3,
    norm, sanoq, aralash, sahifaTop, manzilTozala, manzilTop,
    yangi, joriy, joriyId, sahifa, orqagaMumkin, oldingaMumkin, och, havola, orqaga, oldinga, qidirOch, natija, chiq, takliflar,
    qidir, javobGapi, xazinaYoli, ochiqHolat,
    tekshir1, tekshirXazina, tekshirQalqib, tekshirSoroq, tekshirSavol,
    manzilTask, havolaTask, orqagaTask, yolTask, xazinaTask, qalqibTask, soroqTask, savolTask,
    bosqich1Task: navbat(BOSQICH1), bosqich2Task: navbat(BOSQICH2), bosqich3Task: navbat(BOSQICH3),
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
