// 68-o'yin: ekran va oynalar — o'yinchoq kompyuterdagi oynalar holati (ochish, yopish, kichraytirish, yoyish,
// paneldan qaytarish, oldinga chiqarish), bolaning amalini baholash va mashq vazifalari.
// Ekransiz sof mantiq; Node'da test qilinadi: tests/logic.test.js
// Holat amallari O'ZGARMAS uslubda: har biri YANGI holat qaytaradi, berilganiga tegmaydi.
(function (root) {
  "use strict";

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const zina = (tier) => Math.max(0, Math.min(2, tier || 0));

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

  // ---------- Dasturlar ----------
  // id — umumiy/js/stol-art.js dagi belgi nomi bilan bir xil; ish — dastur nima qilishi (bitta qisqa gap)
  const DASTURLAR = [
    { id: "rasm", nom: "Rasm", ish: "Bu dasturda rasm chiziladi." },
    { id: "matn", nom: "Matn", ish: "Bu dasturda matn yoziladi." },
    { id: "hisob", nom: "Hisoblagich", ish: "Bu dastur sonlarni hisoblaydi." },
    { id: "musiqa", nom: "Musiqa", ish: "Bu dasturda musiqa tinglanadi." },
    { id: "fayllar", nom: "Fayllar", ish: "Bu dasturda fayl va papkalar turadi." },
    { id: "internet", nom: "Internet", ish: "Bu dastur internetni ochadi." },
  ];
  const IDLAR = DASTURLAR.map((d) => d.id);
  const dastur = (id) => DASTURLAR.find((d) => d.id === id) || null;
  const nom = (id) => (dastur(id) ? dastur(id).nom : "");

  // ---------- Oynalar holati ----------
  // { oynalar: [{ id, dastur, holat: "oddiy" | "katta" | "kichik" }] }
  // Ro'yxat tartibi — ustma-ustlik: oxirgisi eng oldinda. Har dasturning ko'pi bilan bitta oynasi bor.
  const bosh = () => ({ oynalar: [] });

  // Tayyor holat: holatYasa(["rasm", "matn"], { rasm: "kichik" }) — «Matn» oldinda, «Rasm» panelda
  function holatYasa(dasturlar, holatlar) {
    const h = holatlar || {};
    return { oynalar: dasturlar.map((d, i) => ({ id: i + 1, dastur: d, holat: h[d] || "oddiy" })) };
  }

  const oyna = (holat, d) => holat.oynalar.find((w) => w.dastur === d) || null;

  // Faol oyna — eng oldindagi ko'rinib turgan (kichraytirilmagan) oyna; yo'q bo'lsa null
  function faol(holat) {
    for (let i = holat.oynalar.length - 1; i >= 0; i--) {
      if (holat.oynalar[i].holat !== "kichik") return holat.oynalar[i];
    }
    return null;
  }

  // Ikki holat bir xilmi (tartib, dastur va oyna holati bo'yicha)
  function bir(a, b) {
    return a.oynalar.length === b.oynalar.length
      && a.oynalar.every((w, i) => w.dastur === b.oynalar[i].dastur && w.holat === b.oynalar[i].holat);
  }

  // Oynani ro'yxat oxiriga (eng oldinga) ko'chiradi; ozgarish — yangi maydonlar ({ holat: "oddiy" })
  function ustiga(holat, d, ozgarish) {
    const w = oyna(holat, d);
    const qolgan = holat.oynalar.filter((x) => x !== w);
    return { oynalar: qolgan.concat([Object.assign({}, w, ozgarish || {})]) };
  }

  // Dasturni ochish. Allaqachon ochiq bo'lsa — yangi oyna ochilmaydi: o'sha oyna oldinga chiqadi
  // (kichraytirilgan bo'lsa — qaytadi).
  function och(holat, d) {
    const w = oyna(holat, d);
    if (w) {
      if (w.holat === "kichik") return ustiga(holat, d, { holat: "oddiy" });
      return faol(holat) === w ? holat : ustiga(holat, d);
    }
    if (!dastur(d)) return holat;
    const id = holat.oynalar.reduce((m, x) => Math.max(m, x.id), 0) + 1;
    return { oynalar: holat.oynalar.concat([{ id, dastur: d, holat: "oddiy" }]) };
  }

  // ✕ — oyna butunlay yopiladi
  function yop(holat, d) {
    return oyna(holat, d) ? { oynalar: holat.oynalar.filter((w) => w.dastur !== d) } : holat;
  }

  // — — oyna ko'rinmaydi, lekin ochiq: panelda qoladi
  function kichraytir(holat, d) {
    const w = oyna(holat, d);
    if (!w || w.holat === "kichik") return holat;
    return { oynalar: holat.oynalar.map((x) => (x === w ? Object.assign({}, w, { holat: "kichik" }) : x)) };
  }

  // □ — yoyish ↔ avvalgi o'lchamga qaytarish; oyna oldinga ham chiqadi
  function kattalashtir(holat, d) {
    const w = oyna(holat, d);
    if (!w || w.holat === "kichik") return holat;
    return ustiga(holat, d, { holat: w.holat === "katta" ? "oddiy" : "katta" });
  }

  // Kichraytirilgan oynani paneldan qaytarish: oddiy o'lchamda, eng oldinda
  function qaytar(holat, d) {
    const w = oyna(holat, d);
    if (!w || w.holat !== "kichik") return holat;
    return ustiga(holat, d, { holat: "oddiy" });
  }

  // Ko'rinib turgan oynani oldinga chiqarish (u faol oyna bo'ladi)
  function oldinga(holat, d) {
    const w = oyna(holat, d);
    if (!w || w.holat === "kichik" || faol(holat) === w) return holat;
    return ustiga(holat, d);
  }

  const AMALLAR = { och, yop, kichraytir, kattalashtir, qaytar, oldinga };

  // amal: { amal: "och" | "yop" | "kichraytir" | "kattalashtir" | "qaytar" | "oldinga", dastur }
  function bajar(holat, amal) {
    const f = amal && AMALLAR[amal.amal];
    return f ? f(holat, amal.dastur) : holat;
  }

  const teng = (a, b) => !!a && !!b && a.amal === b.amal && a.dastur === b.dastur;

  // ---------- Bola nimani bosdi → qaysi amal ----------
  // manba: "belgi" (ish stolidagi belgi, ikki marta), "menyu" («Pusk» ro'yxati), "panel" (paneldagi tugma),
  // "oyna" (oynaning o'zi). null — betaraf: holat o'zgarmaydi (masalan, allaqachon faol oynani bosish).
  // Oyna tugmalari (— □ ✕) bu yerdan o'tmaydi — ular to'g'ridan-to'g'ri { amal, dastur }.
  function niyat(holat, manba, d) {
    const w = oyna(holat, d);
    if (!w) return (manba === "belgi" || manba === "menyu") && dastur(d) ? { amal: "och", dastur: d } : null;
    if (w.holat === "kichik") return manba === "oyna" ? null : { amal: "qaytar", dastur: d };
    return faol(holat) === w ? null : { amal: "oldinga", dastur: d };
  }

  // Ikki marta bosish: bitta narsaga `oraliq` ms ichida ikkinchi bosish (brauzerning dblclick'iga tayanilmaydi)
  const IKKI_MARTA_MS = 450;
  function ikkiMarta(oldin, hozir, oraliq) {
    if (!oldin || !hozir || oldin.nishon !== hozir.nishon) return false;
    const farq = hozir.vaqt - oldin.vaqt;
    return farq >= 0 && farq <= (oraliq || IKKI_MARTA_MS);
  }

  // Sekin ikki marta bosish: o'sha narsaga ikkinchi bosish kech qoldi, lekin bola ochmoqchi bo'lgani aniq
  // (jarimasiz "tezroq bos" eslatmasi uchun). Bundan ham kech bosish — shunchaki yangi tanlash.
  const SEKIN_MS = 1500;
  function sekinBosish(oldin, hozir) {
    if (!oldin || !hozir || oldin.nishon !== hozir.nishon) return false;
    const farq = hozir.vaqt - oldin.vaqt;
    return farq > IKKI_MARTA_MS && farq <= SEKIN_MS;
  }

  // ---------- Amalni baholash ----------
  // Oyna tugmasini bosishdan oldin o'sha oynani oldinga chiqarish — tayyorgarlik, xato emas
  const TUGMA_AMALLARI = ["yop", "kattalashtir", "kichraytir"];

  // holat — amaldan OLDINGI holat. Natija:
  //   "togri" — vazifa bajarildi; "xato" — urinish sanaladi;
  //   "davom" — amal bajariladi, vazifa davom etadi (ko'p qadamli vazifa yoki tayyorgarlik).
  function baho(vazifa, holat, amal) {
    const k = vazifa.kutilgan;
    if (k.amal === "faqat") {
      // «Faqat … qolsin»: har yopish tekshiriladi; yangi dastur ochish — teskari ish
      if (amal.amal === "och") return "xato";
      if (amal.amal !== "yop") return "davom";
      if (amal.dastur === k.dastur) return "xato";
      const keyin = yop(holat, amal.dastur);
      return keyin.oynalar.length === 1 && keyin.oynalar[0].dastur === k.dastur ? "togri" : "davom";
    }
    if (teng(k, amal)) return "togri";
    if (amal.amal === "oldinga" && amal.dastur === k.dastur && TUGMA_AMALLARI.includes(k.amal)) return "davom";
    return "xato";
  }

  // «Faqat … qolsin»: ortiqcha oynalar yopilmagan, lekin hammasi kichraytirilgan — bola "bo'ldi" deb o'ylashi mumkin
  function yashirinQoldi(vazifa, holat) {
    if (vazifa.kutilgan.amal !== "faqat") return false;
    const ortiqcha = holat.oynalar.filter((w) => w.dastur !== vazifa.kutilgan.dastur);
    return ortiqcha.length > 0 && ortiqcha.every((w) => w.holat === "kichik");
  }

  // Vazifani yechadigan amallar ketma-ketligi (avtomat o'ynovchi va testlar uchun)
  function qadamlar(vazifa) {
    const k = vazifa.kutilgan;
    if (!k) return [];
    if (k.amal !== "faqat") return [{ amal: k.amal, dastur: k.dastur }];
    return vazifa.boshlangich.oynalar.filter((w) => w.dastur !== k.dastur).map((w) => ({ amal: "yop", dastur: w.dastur }));
  }

  // 1-xato maslahati: javobni aytmaydi — qayerga qarashni ko'rsatadi.
  // tur: "tugmalar" — ekranda oyna tugmalari sxemasi ham chiqadi.
  function ishora(vazifa, amal) {
    const k = vazifa.kutilgan;
    const a = amal || {};
    const boshqaOyna = a.dastur !== k.dastur && !!oyna(vazifa.boshlangich, a.dastur); // boshqa oynaga tegdi
    switch (vazifa.tur) {
      case "och":
        return { matn: "Bu boshqa dastur. Har belgining ostida nomi yozilgan." };
      case "pusk":
        return a.amal === "och"
          ? { matn: "Bu boshqa dastur. Keraklisi «Pusk» roʻyxatida turibdi." }
          : { matn: "«Pusk» tugmasi pastda, chap burchakda. Uni bos — roʻyxat chiqadi." };
      case "qaytar":
        return boshqaOyna && a.amal === "qaytar"
          ? { matn: "Bu boshqa oyna. Paneldagi belgilarga yaxshilab qara." }
          : { matn: "Kichraytirilgan oyna yoʻqolmagan. Uni pastdagi paneldan izla." };
      case "oldinga":
        return boshqaOyna && a.amal === "oldinga"
          ? { matn: "Bu boshqa oyna. Oynaning nomi sarlavhada yozilgan." }
          : { matn: "Hech narsani yopma va ochma. Oynaning oʻzini yoki paneldagi tugmasini bos." };
      case "faqat":
        return a.amal === "yop"
          ? { matn: "Bu oyna qolishi kerak edi. Nomlarni sarlavhadan oʻqi." }
          : { matn: "Yangi dastur kerak emas. Ortiqcha oynalarni yop." };
      default: // yop, kattalashtir, kichraytir
        return boshqaOyna
          ? { matn: "Bu boshqa oyna. Oynaning nomi sarlavhada yozilgan." }
          : { matn: "Oyna tugmalariga qara. Har birining oʻz ishi bor.", tur: "tugmalar" };
    }
  }

  // Yechimda (2-xato) yoritiladigan joylar:
  // { nima: "belgi" | "tugma" | "sarlavha" | "panel" | "pusk" | "menyu", dastur, amal }
  function nishonlar(vazifa) {
    const k = vazifa.kutilgan;
    if (!k) return [];
    const d = k.dastur;
    switch (vazifa.tur) {
      case "och": return [{ nima: "belgi", dastur: d }];
      case "pusk": return [{ nima: "pusk" }, { nima: "menyu", dastur: d }];
      case "qaytar": return [{ nima: "panel", dastur: d }];
      case "oldinga": return [{ nima: "sarlavha", dastur: d }, { nima: "panel", dastur: d }];
      case "faqat":
        return vazifa.boshlangich.oynalar.filter((w) => w.dastur !== d).map((w) => ({ nima: "tugma", dastur: w.dastur, amal: "yop" }));
      default: return [{ nima: "tugma", dastur: d, amal: k.amal }];
    }
  }

  // ---------- 1-bosqich: ish stoli va belgilar ----------
  const BELGI_SONI = [3, 5, 6]; // tier → ish stolidagi belgilar soni

  // «Musiqa» dasturini och — belgini ikki marta bosish (yoki «Pusk» ro'yxatidan)
  function ochTask(r, prev, tier) {
    const t = zina(tier);
    return pickNew((rr) => {
      const belgilar = aralash(IDLAR, rr).slice(0, BELGI_SONI[t]);
      const d = pick(belgilar, rr);
      const kutilgan = { amal: "och", dastur: d };
      return {
        tur: "och", id: `och:${d}`, belgilar, boshlangich: bosh(), kutilgan, javob: kutilgan,
        matn: `«${nom(d)}» dasturini och.`,
        nega: `«${nom(d)}» belgisi yonib turibdi. Uni ikki marta tez bosish kerak edi.`,
        maqtov: `«${nom(d)}» dasturi ochildi.`,
      };
    }, prev, r);
  }

  // Belgi rasmi → 4 nomdan tanlash
  function nomTask(r, prev) {
    return pickNew((rr) => {
      const d = pick(IDLAR, rr);
      const boshqalar = aralash(IDLAR.filter((x) => x !== d), rr).slice(0, 3);
      return {
        tur: "nom", id: `nom:${d}`, dastur: d,
        matn: "Bu qaysi dasturning belgisi?",
        variantlar: aralash([d].concat(boshqalar), rr).map(nom), javob: nom(d),
        ishora: "Dastur ochilsa, ichi mana bunday boʻladi. Unda nima qilinadi?",
        nega: `Bu — «${nom(d)}» belgisi. ${dastur(d).ish}`,
        maqtov: `Bu — «${nom(d)}» belgisi.`,
      };
    }, prev, r);
  }

  // ---------- 2-bosqich: oyna tugmalari ----------
  const OYNA_MATN = {
    yop: (n) => `«${n}» oynasini yop.`,
    kattalashtir: (n) => `«${n}» oynasini butun ekranga yoy.`,
    kichraytir: (n) => `«${n}» oynasini kichraytir. U panelga tushsin.`,
    qaytar: (n) => `«${n}» oynasi kichraytirilgan. Uni paneldan qaytar.`,
  };
  const OYNA_NEGA = {
    yop: "Yonib turgan tugma oynani yopadi.",
    kattalashtir: "Yonib turgan tugma oynani butun ekranga yoyadi.",
    kichraytir: "Yonib turgan tugma oynani kichraytiradi: u panelga tushadi.",
    qaytar: "Paneldagi yonib turgan tugma oynani qaytaradi.",
  };
  const OYNA_MAQTOV = {
    yop: "Yopilgan oyna butunlay ketadi.",
    kattalashtir: "Oyna butun ekranga yoyildi.",
    kichraytir: "Kichraytirilgan oyna panelda turadi.",
    qaytar: "Oyna paneldan qaytdi.",
  };
  // tier → shu zinada chiqadigan amallar (navbat bilan)
  const OYNA_NAVBAT = [["yop", "kattalashtir"], ["kichraytir", "qaytar"], ["yop", "kattalashtir", "kichraytir", "qaytar"]];

  // tier 0–1 — bitta oyna; tier 2 — ikki oyna, bittasi nomi bilan so'raladi (oldindagisi yoki orqadagisi).
  // amal berilmasa — shu zinaning amallaridan tasodifiy biri.
  function oynaTask(r, prev, tier, amal) {
    const t = zina(tier);
    const soni = t < 2 ? 1 : 2;
    return pickNew((rr) => {
      const a = amal || pick(OYNA_NAVBAT[t], rr);
      const ochiq = aralash(IDLAR, rr).slice(0, soni);
      const d = pick(ochiq, rr);
      const holatlar = {};
      if (a === "qaytar") {
        holatlar[d] = "kichik";
        // Ikkinchi oyna ham panelda bo'lishi mumkin — keraklisini belgisidan tanlash kerak
        for (const x of ochiq) if (x !== d && rr() < 0.5) holatlar[x] = "kichik";
      }
      const kutilgan = { amal: a, dastur: d };
      return {
        tur: a, id: `${a}:${d}:${soni}`, belgilar: IDLAR.slice(), boshlangich: holatYasa(ochiq, holatlar), kutilgan, javob: kutilgan,
        matn: OYNA_MATN[a](nom(d)), nega: OYNA_NEGA[a], maqtov: OYNA_MAQTOV[a],
      };
    }, prev, r);
  }

  // ---------- 3-bosqich: bir nechta oyna ----------
  const OYNA_SONI = [2, 3, 4]; // tier → ochiq oynalar soni (oldinga, faqat)

  // Orqadagi oynani oldinga chiqar: oynaning ko'rinib turgan joyini yoki paneldagi tugmasini bosish
  function oldingaTask(r, prev, tier) {
    const soni = OYNA_SONI[zina(tier)];
    return pickNew((rr) => {
      const ochiq = aralash(IDLAR, rr).slice(0, soni);
      const d = pick(ochiq.slice(0, soni - 1), rr); // oxirgisi — eng oldinda, u so'ralmaydi
      const kutilgan = { amal: "oldinga", dastur: d };
      return {
        tur: "oldinga", id: `oldinga:${d}:${soni}`, belgilar: IDLAR.slice(), boshlangich: holatYasa(ochiq), kutilgan, javob: kutilgan,
        matn: `Orqadagi «${nom(d)}» oynasini oldinga chiqar.`,
        nega: `«${nom(d)}» oynasining sarlavhasi yonib turibdi. Uni bossang, oyna oldinga chiqadi.`,
        maqtov: `Endi «${nom(d)}» — faol oyna.`,
      };
    }, prev, r);
  }

  // Faqat bitta oyna qolsin — ko'p qadamli: qolganlari yopilguncha. kutilgan.amal = "faqat".
  function faqatTask(r, prev, tier) {
    const soni = OYNA_SONI[zina(tier)];
    return pickNew((rr) => {
      const ochiq = aralash(IDLAR, rr).slice(0, soni);
      const d = pick(ochiq, rr);
      const kutilgan = { amal: "faqat", dastur: d };
      return {
        tur: "faqat", id: `faqat:${d}:${soni}`, belgilar: IDLAR.slice(), boshlangich: holatYasa(ochiq), kutilgan, javob: kutilgan,
        matn: `Faqat «${nom(d)}» oynasi qolsin. Qolganlarini yop.`,
        nega: `Yonib turgan tugmalar ortiqcha oynalarni yopadi. «${nom(d)}» qoladi.`,
        maqtov: `Faqat «${nom(d)}» qoldi.`,
      };
    }, prev, r);
  }

  // «Pusk» menyusidan och: bu dasturning belgisi ish stolida yo'q
  const PUSK_BELGI = [3, 4, 5]; // tier → ish stolidagi belgilar soni
  const PUSK_OYNA = [0, 1, 2]; // tier → allaqachon ochiq (boshqa) oynalar soni
  function puskTask(r, prev, tier) {
    const t = zina(tier);
    return pickNew((rr) => {
      const d = pick(IDLAR, rr);
      const boshqalar = IDLAR.filter((x) => x !== d);
      const kutilgan = { amal: "och", dastur: d };
      return {
        tur: "pusk", id: `pusk:${d}`, belgilar: aralash(boshqalar, rr).slice(0, PUSK_BELGI[t]),
        boshlangich: holatYasa(aralash(boshqalar, rr).slice(0, PUSK_OYNA[t])), kutilgan, javob: kutilgan,
        matn: `«Pusk» menyusidan «${nom(d)}»ni och.`,
        nega: `Avval «Pusk»ni bos. Keyin roʻyxatdan «${nom(d)}»ni tanla.`,
        maqtov: "«Pusk» menyusida hamma dastur bor.",
      };
    }, prev, r);
  }

  // ---------- Bosqich navbatlari ----------
  // n — nechanchi to'g'ri javob (mashq turi navbati), tier — qiyinlik zinasi
  function bosqich1Task(r, prev, n, tier) {
    return zina(tier) >= 1 && (n || 0) % 2 === 1 ? nomTask(r, prev, tier) : ochTask(r, prev, tier);
  }
  function bosqich2Task(r, prev, n, tier) {
    const amallar = OYNA_NAVBAT[zina(tier)];
    return oynaTask(r, prev, tier, amallar[(n || 0) % amallar.length]);
  }
  const BOSQICH3 = [oldingaTask, faqatTask, puskTask];
  const bosqich3Task = (r, prev, n, tier) => BOSQICH3[(n || 0) % BOSQICH3.length](r, prev, tier);

  const api = {
    DASTURLAR, IDLAR, BELGI_SONI, OYNA_SONI, OYNA_NAVBAT, PUSK_BELGI, PUSK_OYNA, IKKI_MARTA_MS, SEKIN_MS, TUGMA_AMALLARI, BOSQICH3,
    dastur, nom, aralash,
    bosh, holatYasa, oyna, faol, bir,
    och, yop, kichraytir, kattalashtir, qaytar, oldinga, bajar, teng,
    niyat, ikkiMarta, sekinBosish, baho, yashirinQoldi, qadamlar, ishora, nishonlar,
    ochTask, nomTask, oynaTask, oldingaTask, faqatTask, puskTask,
    bosqich1Task, bosqich2Task, bosqich3Task,
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
