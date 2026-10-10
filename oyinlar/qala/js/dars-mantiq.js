// Qal'a darslari — 15 mashq generatori (QK.qalaDarsMantiq), sof. Har biri (prev, rng, tier) → task.
// Task: { tur, savol, javob, izoh (birinchi xatodagi maslahat), yechim?, matn?/korsat?, maslahatlar?, chastota?, jadval?,
//   qadamlar?, maxLen?, atamalar: [atama id], kalit (takrorni tekshirish uchun) }.
// tur: son (javob — son), tanlov / matn-tanlov (variantlar — satrlar, javob — to'g'ri satr), tartib (elementlar [{id, matn}],
// javob — id'lar tartibi), dialog (vaziyat, gaplar, javoblar [{matn, togri, izoh}], hiyla, hiylalar), byudjet (profil, devorlar, tekshir).
// Tasodif faqat rng orqali; prev bilan takrorlanmaydi (kalit bo'yicha). Node'da test qilinadi: tests/dars-mantiq.test.js
(function (root) {
  "use strict";

  const Q = (typeof module !== "undefined" && module.exports) ? require("./qala.js") : root.QK.qala;
  const P = Q.LIB.parol;
  const X = Q.LIB.xat;

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
  // Ketma-ket bir xil mashq chiqmasligi uchun (QOIDALAR 4.3): kalit bo'yicha
  function pickNew(make, prev, r) {
    for (let k = 0; k < 80; k++) {
      const task = make(r);
      if (task && (!prev || task.kalit !== prev.kalit)) return task;
    }
    return make(r);
  }
  const tierOf = (tier) => Math.max(0, Math.min(2, tier || 0));
  const gen = (make) => (prev, rng, tier) => pickNew((r) => make(r, tierOf(tier)), prev, rng || Math.random);
  const sozlar = (uz) => Q.KARTALAR.soz.filter((k) => uz.includes(k.matn.length));
  const kamSozlar = (uz) => sozlar(uz).filter((k) => Q.KAM.includes(k.matn));
  const lugatSozlar = (uz) => sozlar(uz).filter((k) => Q.LUGAT.includes(k.matn));
  const raqam = (r, uz) => pick(Q.KARTALAR.raqam.filter((k) => uz.includes(k.matn.length)), r);
  const belgi = (r) => pick(Q.KARTALAR.belgi, r);
  const chiroyli = (x) => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  // ---------- 1-dars: parol ----------
  // d1a: variantlar soni yoki topish vaqti (1 000 000 variant/s)
  const D1A = [
    { id: "pin3", t: 0, a: 10, n: 3, matn: "3 xonali raqamli kod", sora: "variant" },
    { id: "harf2", t: 0, a: 26, n: 2, matn: "2 ta kichik harf", sora: "variant" },
    { id: "tanga5", t: 0, a: 2, n: 5, matn: "5 ta katak, har biri 0 yoki 1", sora: "variant" },
    { id: "unli3", t: 0, a: 5, n: 3, matn: "3 ta harf, faqat a, e, i, o, u", sora: "variant" },
    { id: "pin4", t: 1, a: 10, n: 4, matn: "4 xonali PIN kod", sora: "variant" },
    { id: "harf3", t: 1, a: 26, n: 3, matn: "3 ta kichik harf", sora: "variant" },
    { id: "pin6", t: 1, a: 10, n: 6, matn: "6 xonali raqamli kod", sora: "soniya" },
    { id: "pin7", t: 1, a: 10, n: 7, matn: "7 xonali raqamli kod", sora: "soniya" },
    { id: "harf5", t: 2, a: 26, n: 5, matn: "5 ta kichik harf", sora: "soniya" },
    { id: "pin8", t: 2, a: 10, n: 8, matn: "8 xonali raqamli kod", sora: "soniya" },
    { id: "aralash5", t: 2, a: 36, n: 5, matn: "5 ta belgi: kichik harf yoki raqam (36 xil)", sora: "soniya" },
    { id: "harf6", t: 2, a: 26, n: 6, matn: "6 ta kichik harf", sora: "soniya" },
  ];
  const d1a = gen((r, t) => {
    const s = pick(D1A.filter((x) => x.t === t), r);
    const variant = BigInt(s.a) ** BigInt(s.n);
    const soniya = variant / 1000000n;
    const javob = Number(s.sora === "variant" ? variant : soniya);
    return { tur: "son", kalit: "d1a:" + s.id, atamalar: ["parol", "qopol"], matn: s.matn, javob, maxLen: String(javob).length,
      savol: s.sora === "variant" ? "Parol: " + s.matn + ". Qoʻpol kuch nechta variantni sinaydi?"
        : "Parol: " + s.matn + ". Kompyuter soniyasiga 1 000 000 variant sinaydi. Necha soniyada hammasini koʻrib chiqadi?",
      izoh: s.sora === "variant" ? "Har joyga " + s.a + " xil belgi qoʻyish mumkin, joylar " + s.n + " ta — koʻpaytir."
        : "Avval variantlar soni: " + s.a + " ni " + s.n + " marta koʻpaytir. Keyin 1 000 000 ga boʻl.",
      yechim: s.a + "^" + s.n + " = " + chiroyli(variant) + (s.sora === "soniya" ? " → ÷ 1 000 000 = " + javob + " soniya" : "") };
  });

  // d1b: 4 parolni topilish vaqti bo'yicha tartibla (tez topiladigani birinchi)
  const parolSatr = (kartalar) => kartalar.map((k) => k.matn).join("");
  const d1b = gen((r, t) => {
    const toplam = t === 0
      ? [[pick(lugatSozlar([4, 5, 6]), r)], [pick(kamSozlar([6]), r)], [pick(kamSozlar([6]), r), raqam(r, [2, 3])], [pick(kamSozlar([6, 7]), r), raqam(r, [1, 2]), belgi(r), pick(lugatSozlar([4, 5]), r)]]
      : t === 1
        ? [[pick(lugatSozlar([4, 5, 6]), r), raqam(r, [1, 2, 3, 4])], [pick(kamSozlar([7]), r)], [pick(kamSozlar([6]), r), raqam(r, [2])], [pick(kamSozlar([6]), r), belgi(r), raqam(r, [3, 4])]]
        : [[pick(kamSozlar([6]), r)], [pick(kamSozlar([7]), r)], [pick(kamSozlar([8]), r)], [pick(kamSozlar([6]), r), raqam(r, [1])]];
    const parollar = toplam.map((k) => parolSatr(k));
    const kuch = parollar.map((p) => Q.parolKuch(p));
    if (new Set(parollar).size < 4 || new Set(kuch.map((k) => k.soniya)).size < 4) return null;
    const elementlar = aralash(parollar.map((matn, i) => ({ id: "p" + (i + 1), matn, soniya: kuch[i].soniya, vaqt: kuch[i].matn })), r);
    const javob = elementlar.slice().sort((a, b) => a.soniya - b.soniya).map((e) => e.id);
    return { tur: "tartib", kalit: "d1b:" + parollar.join(","), atamalar: ["qopol", "lugat", "ibora"],
      savol: "Qoʻpol kuch (1 000 000 variant/s) qaysi parolni tez topadi? Eng tez topiladiganidan boshlab tartibla.",
      elementlar: elementlar.map((e) => ({ id: e.id, matn: e.matn })), javob,
      izoh: "Lugʻatdagi soʻz bir zumda topiladi. Qolganlarida uzunlikka va belgi turlariga qara: uzunroq — uzoqroq.",
      yechim: elementlar.slice().sort((a, b) => a.soniya - b.soniya).map((e) => e.matn + " — " + e.vaqt).join("; ") };
  });

  // d1c: 3 maslahatdan parolni top (hujumchi fikri). Nomzodlardan faqat bittasi uchala maslahatga mos
  function nomzodKartalar(r, t) {
    const n = t === 0 ? int(r, 1, 2) : int(r, 2, 3);
    const out = [pick(Q.KARTALAR.soz, r)];
    while (out.length < n) out.push(pick(r() < 0.6 ? Q.KARTALAR.raqam : Q.KARTALAR.belgi, r));
    return out;
  }
  // Satrning "imzosi": uzunlik | belgi turlari qatori (ketma-ket bir xili qo'shiladi) | lug'at. Chalg'ituvchi imzosi nishondan farq qiladi —
  // bola uchala maslahat bilan faqat bittasini qoldira oladi
  function satrImzo(p) {
    const runs = (p.match(/[a-z]+|[0-9]+|[^a-z0-9]+/g) || []).map((x) => (/[a-z]/.test(x) ? "soz" : /[0-9]/.test(x) ? "raqam" : "belgi"));
    const sozlar = p.match(/[a-z]+/g) || [];
    return p.length + "|" + runs.join("+") + "|" + (!sozlar.length ? 2 : sozlar.some((w) => Q.LUGAT.includes(w)) ? 1 : 0);
  }
  const d1c = gen((r, t) => {
    const nishon = nomzodKartalar(r, t);
    const ids = nishon.map((k) => k.id);
    const kod = Q.maslahatKod(ids);
    const nomzodlar = [parolSatr(nishon)];
    const nishonImzo = satrImzo(nomzodlar[0]);
    for (let k = 0; k < 400 && nomzodlar.length < 6; k++) {
      // tier 2: yaqinroq — karta turlari bir xil, faqat uzunlik yoki lug'at boshqa
      const p = parolSatr(t === 2 ? nishon.map((x) => pick(Q.KARTALAR[x.tur], r)) : nomzodKartalar(r, t));
      if (!nomzodlar.includes(p) && satrImzo(p) !== nishonImzo) nomzodlar.push(p);
    }
    if (nomzodlar.length < 6) return null;
    const javob = nomzodlar[0];
    return { tur: "tanlov", kalit: "d1c:" + javob, atamalar: ["parol", "lugat"], maslahatlar: Q.maslahatMatn(kod),
      savol: "Hujumchi qalʼa haqida uchta maslahat oldi. Parol qaysi?", variantlar: aralash(nomzodlar, r), javob,
      izoh: "Avval uzunlikni sana, keyin karta turlari tartibini tekshir, oxirida soʻz lugʻatda bormi — qara.",
      yechim: javob + ": " + Q.maslahatMatn(kod).join(", ").toLowerCase() };
  });

  // ---------- 2-dars: qulf (iz) ----------
  const qisqaSoz = (r, uz) => pick(Q.LIB.qulf.QISQA.concat(Q.KARTALAR.soz.map((k) => k.matn)).filter((w) => uz.includes(w.length)), r);
  const izParol = (r, t) => (t === 0 ? qisqaSoz(r, [3, 4]) : t === 1 ? qisqaSoz(r, [4, 5]) : qisqaSoz(r, [4, 5]) + raqam(r, [1, 2]).matn);
  const d2a = gen((r, t) => {
    const parol = izParol(r, t);
    const javob = Q.iz(parol, 0);
    return { tur: "son", kalit: "d2a:" + parol, atamalar: ["xesh"], matn: parol, javob, maxLen: 2,
      savol: "Shu parolning izini hisobla (tuz yoʻq).",
      izoh: "Qoida: izni 3 ga koʻpaytir, belgining sonini qoʻsh (a = 1 … z = 26, raqam — oʻzi), oxirgi ikki raqamni qoldir.",
      qadamlar: Q.izQadamlar(parol, 0).map((q) => q.belgi + ": " + q.oldin + " × 3 + " + q.qiymat + " = " + q.xom + (q.xom === q.iz ? "" : " → " + q.iz)),
      yechim: Q.izHisob(parol, 0) + "   →   iz = " + javob };
  });

  // d2b: tier 0 — 5 foydalanuvchi izi, ikkitasiniki bir xil; tier 1–2 — jadvaldan qaysi parol shu izni beradi
  const d2b = gen((r, t) => {
    if (t === 0) {
      const ismlar = aralash(P.ISMLAR, r).slice(0, 5).map((i) => i[0].toUpperCase() + i.slice(1));
      const parol = qisqaSoz(r, [3, 4, 5]);
      const juft = Q.LIB.qulf.toqnash(parol, 0) || parol;
      const nishon = Q.iz(parol, 0);
      const boshqa = [];
      for (let k = 0; k < 200 && boshqa.length < 3; k++) { const x = Q.iz(qisqaSoz(r, [3, 4, 5]) + int(r, 1, 9), 0); if (x !== nishon && !boshqa.includes(x)) boshqa.push(x); }
      if (boshqa.length < 3) return null;
      const izlar = aralash([nishon, nishon, ...boshqa], r);
      const jadval = ismlar.map((ism, i) => ({ ism, iz: izlar[i] }));
      const teng = jadval.filter((x) => x.iz === nishon).map((x) => x.ism);
      const javob = teng.join(" va ");
      const variantlar = [javob];
      while (variantlar.length < 4) { const v = aralash(ismlar, r).slice(0, 2).join(" va "); if (!variantlar.includes(v) && v !== teng.slice().reverse().join(" va ")) variantlar.push(v); }
      return { tur: "tanlov", kalit: "d2b:" + izlar.join(","), atamalar: ["xesh", "jadval"], jadval,
        savol: "Saytning bazasida parollar emas, izlar turibdi. Kimning paroli bir xil boʻlishi mumkin?", variantlar: aralash(variantlar, r), javob,
        izoh: "Bir xil parol — bir xil iz. Jadvalda teng izlarni qidir.",
        yechim: teng.join(" va ") + " — ikkalasining izi " + nishon + " (masalan, «" + parol + "» yoki «" + juft + "»)" };
    }
    const qatorlar = aralash(Q.jadval(0), r).slice(0, t === 1 ? 5 : 6);
    if (new Set(qatorlar.map((q) => q.iz)).size < qatorlar.length) return null;
    const nishon = pick(qatorlar, r);
    const variantlar = aralash(qatorlar.map((q) => q.parol), r).slice(0, 4);
    if (!variantlar.includes(nishon.parol)) variantlar[0] = nishon.parol;
    return { tur: "tanlov", kalit: "d2b:" + nishon.parol + ":" + nishon.iz, atamalar: ["jadval", "xesh"], jadval: qatorlar,
      savol: "Oʻgʻirlangan bazada iz " + nishon.iz + " turibdi. Tayyor jadvaldan parolni top.", variantlar: aralash(variantlar, r), javob: nishon.parol,
      izoh: "Jadval — parol va uning izi. Bazadagi izni jadvaldan qidir, parol yonida yozilgan.",
      yechim: "Jadvalda " + nishon.iz + " → «" + nishon.parol + "». Shuning uchun tuzsiz iz xavfli." };
  });

  // d2c: tuz bilan iz
  const d2c = gen((r, t) => {
    const parol = izParol(r, t);
    const tuz = t === 0 ? int(r, 1, 9) : int(r, 10, 99);
    const javob = Q.iz(parol, tuz);
    const tuzsiz = Q.iz(parol, 0);
    if (javob === tuzsiz) return null;
    return { tur: "son", kalit: "d2c:" + parol + ":" + tuz, atamalar: ["tuz", "jadval"], matn: parol, javob, maxLen: 2,
      savol: "Saytning tuzi — " + tuz + ". Shu parolning izi nechchi?",
      izoh: "Boshlangʻich iz — tuz (" + tuz + "), keyin oʻsha qoida: × 3, belgining soni, oxirgi ikki raqam.",
      qadamlar: Q.izQadamlar(parol, tuz).map((q) => q.belgi + ": " + q.oldin + " × 3 + " + q.qiymat + " = " + q.xom + (q.xom === q.iz ? "" : " → " + q.iz)),
      yechim: Q.izHisob(parol, tuz) + "   →   iz = " + javob + ". Tuzsiz izi " + tuzsiz + " edi — tayyor jadval endi ishlamaydi." };
  });

  // ---------- 3-dars: shifr ----------
  const SOZ_HAVZA = Q.BAYROQLAR.map((b) => b.soz).concat(Q.LUGAT, Q.KAM);
  const kRange = (r, t) => (t === 0 ? int(r, 1, 5) : t === 1 ? int(r, 6, 13) : int(r, 14, 25));
  // d3a: Sezar, k berilgan — ochilgan so'z 4 variantdan
  const d3a = gen((r, t) => {
    const soz = pick(SOZ_HAVZA, r);
    const k = kRange(r, t);
    const boshqa = aralash(SOZ_HAVZA.filter((w) => w !== soz && Math.abs(w.length - soz.length) <= 1), r).slice(0, 3);
    if (boshqa.length < 3) return null;
    const shifr = Q.sezar(soz, k);
    return { tur: "matn-tanlov", kalit: "d3a:" + soz + ":" + k, k, atamalar: ["shifr", "kalit"], matn: shifr,
      savol: "Sezar shifri, siljish k = " + k + ". Ochilgan soʻz qaysi?", variantlar: aralash([soz, ...boshqa], r), javob: soz,
      izoh: "Har harfni alifboda " + k + " ta orqaga sur: " + shifr[0] + " → " + soz[0] + ".",
      yechim: shifr + " → " + soz + " (har harf " + k + " ta orqaga)" };
  });

  // d3b: shifrlangan gap (≥ 25 harf) + chastota → k
  const d3b = gen((r, t) => {
    const b = pick(Q.BAYROQLAR, r);
    const k = kRange(r, t);
    const shifr = Q.sezar(b.gap, k);
    const ch = Q.chastota(shifr);
    return { tur: "son", kalit: "d3b:" + b.id + ":" + k, atamalar: ["chastota", "kalit"], matn: shifr, chastota: ch.slice(0, 8), javob: k, maxLen: 2,
      savol: "Shifrlangan gap va harflar chastotasi. Oʻzbek matnida eng koʻp uchraydigan harf — «a». Siljish k nechchi?",
      izoh: "Eng koʻp uchragan harf «" + ch[0].harf + "» — bu «a» ning oʻzi. a dan «" + ch[0].harf + "» gacha necha qadam?",
      yechim: "a → " + ch[0].harf + ": k = " + k + ". Ochilgan gap: " + b.gap };
  });

  // d3c: kalitli shifr — tier 0–1: so'z + kalit → shifrlangani 4 variantdan; tier 2: yarmi — kalit variantlari soni
  const d3c = gen((r, t) => {
    if (t === 2 && r() < 0.5) {
      return { tur: "son", kalit: "d3c:variant", atamalar: ["vijener", "kalit"], javob: Q.KALIT_VARIANT, maxLen: 5,
        savol: "Kalit — 3 ta kichik lotin harfi (a–z). Hujumchi nechta kalitni sinashi kerak?",
        izoh: "Har joyga 26 xil harf, joylar 3 ta — koʻpaytir.", yechim: "26 × 26 × 26 = 17 576" };
    }
    const soz = pick(t === 0 ? SOZ_HAVZA.filter((w) => w.length <= 5) : SOZ_HAVZA, r);
    const kalit = Q.ALIFBO[int(r, 0, t === 0 ? 4 : 25)] + Q.ALIFBO[int(r, 0, t === 0 ? 4 : 25)] + Q.ALIFBO[int(r, 0, t === 0 ? 4 : 25)];
    const javob = Q.vijener(soz, kalit);
    const boshqa = [];
    for (let k = 0; k < 60 && boshqa.length < 3; k++) {
      const yolgon = r() < 0.5 ? Q.sezar(soz, Q.ALIFBO.indexOf(kalit[int(r, 0, 2)]) || 1) : Q.vijener(soz, kalit.split("").reverse().join("") === kalit ? Q.sezar(kalit, 1) : kalit.split("").reverse().join(""));
      if (yolgon !== javob && !boshqa.includes(yolgon)) boshqa.push(yolgon);
      if (boshqa.length < 3 && k > 30) { const z = Q.vijener(soz, Q.sezar(kalit, int(r, 1, 25))); if (z !== javob && !boshqa.includes(z)) boshqa.push(z); }
    }
    if (boshqa.length < 3) return null;
    return { tur: "tanlov", kalit: "d3c:" + soz + ":" + kalit, shifrKalit: kalit, atamalar: ["vijener", "kalit"], matn: soz,
      savol: "Kalitli shifr, kalit «" + kalit + "» (a = 0, b = 1 …). Soʻz shifrlansa nima chiqadi?", variantlar: aralash([javob, ...boshqa], r), javob,
      izoh: "1-harf " + kalit[0] + " bilan (" + Q.ALIFBO.indexOf(kalit[0]) + " qadam), 2-harf " + kalit[1] + " bilan, 3-harf " + kalit[2] + " bilan siljiydi; 4-harfda kalit boshidan.",
      yechim: soz + " + " + kalit + " → " + javob };
  });

  // ---------- 4-dars: xat ----------
  // d4a: 4 manzil, bittasi soxta. Haqiqiylari — tashkilotning o'z bo'limlari (zonadan oldingi nom o'zgarmaydi)
  const SOXTA_TUR = [["zona", "qoshimcha"], ["harf", "qoshimcha"], ["harf", "kochgan"]];
  const d4a = gen((r, t) => {
    const org = pick(X.TASHKILOTLAR, r);
    const nom = X.ajrat(org.domen).nom;
    const tur = pick(SOXTA_TUR[t], r);
    const soxta = X.SOXTA_MANZIL[tur](nom, r);
    const haqiqiy = aralash([org.domen, "kirish." + org.domen, "www." + org.domen, org.domen + "/yordam", "xabar." + org.domen], r).slice(0, 3);
    const farq = tur === "zona" && X.gumonliZona(soxta) ? X.FARQ_IZOH.gumonli : X.domenFarqi(org.domen, soxta).izoh;
    return { tur: "tanlov", kalit: "d4a:" + soxta, asl: org.domen, atamalar: ["domen", "fishing"],
      savol: "«" + org.nom + "» ning haqiqiy manzili — " + org.domen + ". Toʻrt manzildan qaysi biri soxta?",
      variantlar: aralash([soxta, ...haqiqiy], r), javob: soxta,
      izoh: "Faqat zonadan oldingi nomni va zonani solishtir: «" + nom + "» va «" + X.ajrat(org.domen).zona + "». Oldidagi boʻlim yoki keyingi yoʻl farq qilmaydi.",
      yechim: soxta + " — " + farq };
  });

  // d4b: dialog — to'g'ri javob + hiyla nomi
  const d4b = gen((r) => {
    const d = pick(Q.DIALOGLAR, r);
    const togri = d.javoblar.find((j) => j.togri);
    const hiylalar = [d.hiyla, ...aralash(Q.BELGILAR.filter((b) => b.id !== d.hiyla && b.id !== "imlo"), r).slice(0, 2).map((b) => b.id)];
    return { tur: "dialog", kalit: "d4b:" + d.id, atamalar: ["ijtimoiy", "fishing"], vaziyat: d.vaziyat, gaplar: d.gaplar,
      savol: "Nima qilasan? Keyin hiylani nomla.", javoblar: aralash(d.javoblar, r), javob: togri.matn,
      hiyla: d.hiyla, hiylalar: aralash(hiylalar, r),
      izoh: "Soʻrovning oʻzi — belgi: parol, kod, pul yoki shoshilish. Tekshirish yoʻli — oʻzing bilgan raqam yoki odam.",
      yechim: togri.izoh + " Hiyla: " + (X.belgi(d.hiyla) || {}).nom + "." };
  });

  // d4c: 3 xatni shubha darajasiga qarab tartibla (eng shubhalisi birinchi — ishonch kam)
  const xatMatni = (x) => "Kimdan: " + x.qismlar.kimdan.matn + " · " + x.qismlar.mavzu.matn + " · " + x.qismlar.gap.matn + " · " + x.qismlar.havola.matn + " · " + x.qismlar.imzo.matn;
  // nozik — ishonch 70..95 (belgilar deyarli yo'q), oshkora — ≤ 60
  const soxtaXat = (r, nozik) => {
    const Xq = Q.XAT_QISMLAR;
    for (let k = 0; k < 40; k++) {
      const x = Q.xatYasa({ kimdan: pick(nozik ? ["k1", "k2", "k3", "k4", "k5"] : ["k4", "k5", "k6", "k1"], r), mavzu: pick(Xq.mavzu, r).id,
        havola: pick(nozik ? ["h3", "h5"] : ["h3", "h4", "h5", "h6"], r), gap: pick(nozik ? ["g3", "g4"] : ["g5", "g6", "g7", "g8"], r), imzo: pick(Xq.imzo, r).id });
      if (x && (nozik ? x.ishonch >= 70 && x.ishonch < 100 : x.ishonch <= 60)) return x;
    }
    return null;
  };
  const d4c = gen((r, t) => {
    const xatlar = t === 2 ? [soxtaXat(r, false), soxtaXat(r, true), soxtaXat(r, true)] : [Q.haqiqiyXat(r), soxtaXat(r, true), soxtaXat(r, false)];
    if (xatlar.some((x) => !x) || new Set(xatlar.map((x) => x.ishonch)).size < 3) return null;
    const elementlar = aralash(xatlar.map((x, i) => ({ id: "x" + (i + 1), matn: xatMatni(x), xat: x, ishonch: x.ishonch })), r);
    const javob = elementlar.slice().sort((a, b) => a.ishonch - b.ishonch).map((e) => e.id);
    return { tur: "tartib", kalit: "d4c:" + elementlar.map((e) => e.ishonch).join(","), atamalar: ["fishing", "domen"],
      savol: "Uch xat keldi. Eng shubhalisidan boshlab tartibla.", elementlar: elementlar.map((e) => ({ id: e.id, matn: e.matn, ishonch: e.ishonch })), javob,
      izoh: "Belgilarni sana: shoshiltirish, qoʻrqitish, sovrin, sir, shubhali manzil. Belgi koʻp — shubha koʻp.",
      yechim: elementlar.slice().sort((a, b) => a.ishonch - b.ishonch).map((e) => e.id + ": " + (Q.xatBelgilari(e.xat).map((b) => b.nom.toLowerCase()).join(", ") || "belgi yoʻq")).join("; ") };
  });

  // ---------- 5-dars: oq shlyapa ----------
  const D5A = [
    { id: "ruxsat-bor", savol: "Maktab sayti egasi yozma ruxsat berdi: «zaif joy bor-yoʻqligini tekshir». Sen zaif joy topding. Nima qilasan?",
      javob: "Egasiga xabar beraman, hech narsani oʻzgartirmayman", soxta: ["Doʻstlarimga koʻrsataman", "Zaif joydan foydalanib, saytga oʻz yozuvimni qoʻyaman", "Hech kimga aytmayman, keyin kerak boʻlib qolar"],
      izoh: "Oq shlyapa topganini egasiga aytadi va ruxsat berilgan chegaradan chiqmaydi." },
    { id: "ruxsat-yoq", savol: "Doʻsting: «tanish doʻkon saytida zaif joy bor, kel tekshiramiz» deydi. Egasi bilmaydi. Bu qonuniymi?",
      javob: "Yoʻq — ruxsatsiz tekshirish ham qonunbuzarlik", soxta: ["Ha — biz zarar qilmaymiz", "Ha — agar topganimizni keyin aytsak", "Ha — doʻkon kichik boʻlsa"],
      izoh: "Niyat yaxshi boʻlsa ham, ruxsatsiz kirish — begonaning uyiga eshigi ochiq deb kirish bilan bir xil." },
    { id: "topdi-parol", savol: "Sinfdoshingning parolini tasodifan koʻrib qolding. Nima qilasan?",
      javob: "Unga aytaman, parolni oʻzgartirsin; oʻzim kirmayman", soxta: ["Bir marta kirib koʻraman, zarari yoʻq", "Boshqa sinfdoshlarga aytaman", "Hech narsa qilmayman, lekin eslab qolaman"],
      izoh: "Begonaning hisobiga kirish — ruxsatsiz kirish; parolni bilish kirishga ruxsat emas." },
    { id: "sinov-xona", savol: "Oʻqituvchi sinfda Qalʼa oʻyinida raqib qalʼasiga hujum qilishni aytdi. Bu qonuniymi?",
      javob: "Ha — bu oʻyin, hamma rozi va qoidalar oldindan kelishilgan", soxta: ["Yoʻq — har qanday hujum taqiqlangan", "Ha — lekin faqat yutsak", "Yoʻq — oʻqituvchi ham ruxsat bera olmaydi"],
      izoh: "Ruxsat va kelishilgan qoida bor — bu mashq; haqiqiy tizimga ruxsatsiz hujum — qonunbuzarlik." },
    { id: "xabar-ber", savol: "Oʻyin ilovasida xato topding: boshqalarning hisobini koʻrsa boʻladi. Nima qilasan?",
      javob: "Ilova egasiga xabar beraman va boshqalarning hisobini ochmayman", soxta: ["Hammaning hisobini koʻrib chiqaman", "Internetga yozib tarqataman", "Doʻstimning hisobini tekshirib koʻraman"],
      izoh: "Xato topish — yaxshi; undan foydalanish — yomon. Oq shlyapa xabar beradi va toʻxtaydi." },
    { id: "wifi", savol: "Qoʻshnining Wi-Fi paroli oson ekan, sen uni topding. Ulanish mumkinmi?",
      javob: "Yoʻq — ruxsatsiz ulanish ham begona tarmoqqa kirish", soxta: ["Ha — faqat internet uchun", "Ha — parol zaif boʻlsa, oʻzi aybdor", "Ha — agar sezmasa"],
      izoh: "Zaif qulf — kirishga ruxsat emas. Ruxsat faqat egasining oʻzidan boʻladi." },
  ];
  const d5a = gen((r) => {
    const v = pick(D5A, r);
    return { tur: "tanlov", kalit: "d5a:" + v.id, atamalar: ["oqshlyapa", "ruxsat", "xaker"], savol: v.savol,
      variantlar: aralash([v.javob, ...v.soxta], r), javob: v.javob,
      izoh: "Ikki savol: egasining ruxsati bormi? Topganimdan foydalanyapmanmi yoki xabar beryapmanmi?", yechim: v.izoh };
  });

  // d5b: byudjet — robot hujumchi profiliga qarab devorlarni tanla. tekshir(tanlov) → Q.byudjetBaho
  const d5b = gen((r, t) => {
    const p = pick(Q.PROFILLAR, r);
    const javob = Q.byudjetTavsiya(p);
    const baho = Q.byudjetBaho(javob, p);
    return { tur: "byudjet", kalit: "d5b:" + p.id, atamalar: ["byudjet", "ikki"], byudjet: Q.BYUDJET, daqiqa: Q.HIMOYA_DAQIQA, devorlar: Q.DEVORLAR,
      profil: { id: p.id, nom: p.nom, izoh: t === 2 ? "Qurollari sir — nomidan taxmin qil." : p.izoh, qurollar: t === 2 ? [] : p.qurollar },
      savol: "Hujumchi: " + p.nom + ". " + Q.BYUDJET + " ochko va " + Q.HIMOYA_DAQIQA + " daqiqa bor. Qaysi devorlarni qurasan?",
      tekshir: (tanlov) => Q.byudjetBaho(tanlov, p), javob,
      izoh: "Hujumchi qaysi qurol bilan kelsa, oʻsha devorga pul sarfla. U tegmaydigan devorga sarflangan ochko — behuda.",
      yechim: "Tavsiya: " + Object.keys(javob).map((d) => d + " — " + javob[d]).join(", ") + " (narx " + baho.narx + ", " + baho.daqiqa + " daqiqa)." };
  });

  // d5c: o'yin qoidalari — faza, qurol → devor
  const D5C = [
    { id: "qopol-devor", savol: "Qoʻpol kuch qaysi devorga qarshi ishlaydi?", javob: "Parol", soxta: ["Qulf", "Shifr", "Xat"] },
    { id: "jadval-devor", savol: "Tayyor jadval qaysi devorga qarshi ishlaydi (tuz boʻlmasa)?", javob: "Qulf", soxta: ["Parol", "Shifr", "Ikki qadamli tekshiruv"] },
    { id: "chastota-devor", savol: "Chastota tahlili qaysi devorga qarshi ishlaydi?", javob: "Shifr (Sezar)", soxta: ["Shifr (kalitli)", "Qulf", "Xat"] },
    { id: "fishing-devor", savol: "Fishing xati qaysi devorga qarshi ishlaydi?", javob: "Xat", soxta: ["Parol", "Qulf", "Shifr"] },
    { id: "ikki-shart", savol: "Ikki qadamli tekshiruv devori qachon yiqiladi?", javob: "Parol ochilgan va kod xat orqali sizgan boʻlsa", soxta: ["Parol ochilgan zahoti", "Shifr ochilsa", "Hech qachon"] },
    { id: "faza-tartib", savol: "Bir raundda fazalar tartibi qanday?", javob: "Himoya → hujum → tahlil", soxta: ["Hujum → himoya → tahlil", "Tahlil → himoya → hujum", "Himoya → tahlil → hujum"] },
    { id: "bayroq", savol: "Qoʻshimcha 2 ochko (bayroq) qachon beriladi?", javob: "Shifr ochilsa — bayroq soʻzi topiladi", soxta: ["Parol ochilsa", "Xat ochilsa", "Har devor uchun"] },
    { id: "qorovul", savol: "Hujum fazasida qorovullar nima qiladi?", javob: "Oʻz qalʼasiga kelgan xatlarga «ochaman / oʻchiraman» deydi", soxta: ["Raqib paroliga taxmin qiladi", "Shifrni ochadi", "Himoyani qayta quradi"] },
  ];
  const d5c = gen((r) => {
    const v = pick(D5C, r);
    return { tur: "tanlov", kalit: "d5c:" + v.id, atamalar: ["qopol", "jadval", "chastota"], savol: v.savol,
      variantlar: aralash([v.javob, ...v.soxta], r), javob: v.javob,
      izoh: "Har qurol oʻz devoriga: parol — qoʻpol kuch va taxmin, qulf — jadval va iz, shifr — chastota, xat — fishing.",
      yechim: v.savol + " — " + v.javob };
  });

  const DARSLAR = [
    { id: 1, nom: "Parol", mashqlar: ["d1a", "d1b", "d1c"], atamalar: ["parol", "qopol", "lugat", "ibora"] },
    { id: 2, nom: "Qulf", mashqlar: ["d2a", "d2b", "d2c"], atamalar: ["xesh", "tuz", "jadval"] },
    { id: 3, nom: "Shifr", mashqlar: ["d3a", "d3b", "d3c"], atamalar: ["shifr", "kalit", "chastota", "vijener"] },
    { id: 4, nom: "Xat", mashqlar: ["d4a", "d4b", "d4c"], atamalar: ["fishing", "ijtimoiy", "domen"] },
    { id: 5, nom: "Oq shlyapa", mashqlar: ["d5a", "d5b", "d5c"], atamalar: ["ikki", "xaker", "oqshlyapa", "ruxsat", "byudjet"] },
  ];
  const api = { DARSLAR, D1A, D5A, D5C, d1a, d1b, d1c, d2a, d2b, d2c, d3a, d3b, d3c, d4a, d4b, d4c, d5a, d5b, d5c };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.qalaDarsMantiq = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
