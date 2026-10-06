// 71-o'yin: matn yozamiz — o'yinchoq matn muharriri uchun sof mantiq: matnlar banki, xato generatori,
// matn tengligi va farq turi (maslahat uchun), qator/belgi vazifalari, bezak tekshiruvi (HTML satri bo'yicha).
// Ekransiz; Node'da test qilinadi: tests/logic.test.js. Tasodif faqat `r` dan.
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

  // ---------- Belgilar ----------
  const OKINA = "ʻ"; // U+02BB — oʻ, gʻ ichidagi belgi
  const TUTUQ = "ʼ"; // U+02BC — tutuq belgisi
  const HARF = /\p{L}/u; // ʻ va ʼ ham harf (Lm) — so'z ichida qoladi
  const SOZ_RE = /\p{L}+/gu;

  const RANGLAR = {
    kok: { nom: "koʻk", yozuv: "Koʻk", hex: "#2f6fde" },
    yashil: { nom: "yashil", yozuv: "Yashil", hex: "#1a9e77" },
    binafsha: { nom: "binafsha", yozuv: "Binafsha", hex: "#8e5bd0" },
  };
  const BEZAKLAR = ["qalin", "kursiv", "kok", "yashil", "binafsha"];
  const BEZAK_NOMI = { qalin: "qalin", kursiv: "kursiv", kok: "koʻk", yashil: "yashil", binafsha: "binafsha" };
  const ASBOB_NOMI = { qalin: "Qalin", kursiv: "Kursiv", kok: "Koʻk", yashil: "Yashil", binafsha: "Binafsha" };
  const HUJJAT_NOMLARI = ["Sheʼr", "Xat", "Roʻyxat", "Hikoya"];
  const HUJJAT_CHEGARA = 10;

  // ---------- Matnlar banki (2–4-sinf) ----------
  // Har gap katta harf bilan boshlanadi va nuqta bilan tugaydi; oʻ/gʻ — U+02BB, tutuq — U+02BC.
  const GAPLAR = [
    "Bahorda gullar ochiladi.",
    "Mushuk sutni yaxshi koʻradi.",
    "Men maktabga boraman.",
    "Oyim nonni tandirda yopdi.",
    "Quyosh ertalab chiqadi.",
    "Bizning sinfimiz katta.",
    "Dadam bogʻda ishlaydi.",
    "Qush daraxtda sayraydi.",
    "Ukam toʻp oʻynaydi.",
    "Kitobni sekin oʻqiyman.",
    "Tuya choʻlda yashaydi.",
    "Opam rasm chizadi.",
    "Qishda qor yogʻadi.",
    "Bugun havo iliq.",
    "Kuzda barglar sargʻayadi.",
    "Buvim ertak aytadi.",
    "Baliq suvda suzadi.",
    "Doʻstim bilan oʻynayman.",
  ];

  // She'rlar: qator oxirida vergul, oxirgi qatorda nuqta (belgi vazifasi shunga tayanadi). Ro'yxat: har qator bitta so'z.
  const MATNLAR = [
    { id: "qor", tur: "sher", nom: "Qor", qatorlar: ["Oppoq qor yogʻdi,", "Bolalar quvondi."] },
    { id: "quyosh", tur: "sher", nom: "Quyosh", qatorlar: ["Quyosh chiqdi, kun boʻldi,", "Hamma yoq nurga toʻldi."] },
    { id: "mushuk", tur: "sher", nom: "Mushukcha", qatorlar: ["Mushukchamning dumi bor,", "Yumshoqqina momiq u."] },
    { id: "yomgir", tur: "sher", nom: "Yomgʻir", qatorlar: ["Yomgʻir yogʻar shitirlab,", "Gullar ichar simirib,", "Bogʻlar turar yashnab."] },
    { id: "kuz", tur: "sher", nom: "Kuz", qatorlar: ["Kuz keldi, barg sargʻaydi,", "Shamol esdi, barg uchdi,", "Qushlar issiq yurtga ketdi."] },
    { id: "maktab", tur: "sher", nom: "Maktab", qatorlar: ["Ertalab turaman,", "Yuzimni yuvaman,", "Sumkamni olaman,", "Maktabga boraman."] },
    { id: "bahor", tur: "sher", nom: "Bahor", qatorlar: ["Bahor keldi, gul ochdi,", "Qushlar qoʻshiq boshladi,", "Qor erib, suv oqdi,", "Bolalar koʻchaga chiqdi."] },
    { id: "mevalar", tur: "royxat", nom: "Mevalar", qatorlar: ["Olma", "Nok", "Uzum"] },
    { id: "sumka", tur: "royxat", nom: "Sumkamda", qatorlar: ["Daftar", "Qalam", "Kitob", "Oʻchirgʻich"] },
    { id: "ranglar", tur: "royxat", nom: "Ranglar", qatorlar: ["Qizil", "Koʻk", "Sariq", "Yashil"] },
    { id: "hayvonlar", tur: "royxat", nom: "Hayvonlar", qatorlar: ["Mushuk", "It", "Tuya"] },
    { id: "oila", tur: "royxat", nom: "Oilam", qatorlar: ["Dadam", "Oyim"] },
    { id: "kunlar", tur: "royxat", nom: "Dam olish", qatorlar: ["Shanba", "Yakshanba"] },
  ];

  // ---------- Matn tengligi ----------
  // Qator oxiridagi bo'sh joylar va oxirgi bo'sh qatorlar e'tiborsiz; oʻ/gʻ uchun ' ʼ ‘ ’ ` ham qabul (ataylab yumshoq);
  // qolgan apostroflar — tutuq belgisi. Bo'linmas bo'sh joy (nbsp) — oddiy bo'sh joy.
  function norm(s) {
    return String(s == null ? "" : s)
      .replace(/\r\n?/g, "\n")
      .replace(/ /g, " ")
      .replace(/([oOgG])[ʻʼ'‘’`´]/g, "$1" + OKINA)
      .replace(/[ʻʼ'‘’`´]/g, TUTUQ)
      .split("\n").map((q) => q.replace(/[ \t]+$/g, "")).join("\n")
      .replace(/\n+$/g, "");
  }
  const teng = (a, b) => norm(a) === norm(b);

  // So'zlar: { soz, bosh, oxir } (harflar ketma-ketligi; tinish belgilari va bo'sh joy so'zga kirmaydi)
  function sozlar(matn) {
    const out = [];
    const s = String(matn);
    SOZ_RE.lastIndex = 0;
    let m;
    while ((m = SOZ_RE.exec(s))) out.push({ soz: m[0], bosh: m.index, oxir: m.index + m[0].length });
    return out;
  }

  // Levenshtein masofasi (qisqa satrlar uchun) — "nechta joy boshqacha"
  function masofa(a, b) {
    const n = a.length;
    const m = b.length;
    let prev = Array.from({ length: m + 1 }, (_, j) => j);
    for (let i = 1; i <= n; i++) {
      const cur = [i];
      for (let j = 1; j <= m; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[m];
  }

  // Bitta qatorning farqi: turi va bolaga aytiladigan maslahat (joyini aytmaydi)
  function qatorFarq(x, y) {
    if (x.toLowerCase() === y.toLowerCase()) {
      let k = 0;
      while (k < x.length && x[k] === y[k]) k++;
      return y[k] === y[k].toUpperCase()
        ? { tur: "katta", matn: "Katta harf kerak: harfni oʻchirib, Shift bilan birga qayta bos." }
        : { tur: "kichik", matn: "Bu yerda kichik harf kerak." };
    }
    let p = 0;
    while (p < x.length && p < y.length && x[p] === y[p]) p++;
    let s = 0;
    while (s < x.length - p && s < y.length - p && x[x.length - 1 - s] === y[y.length - 1 - s]) s++;
    const dx = x.length - p - s;
    const dy = y.length - p - s;
    if (dx === 0 && dy === 1) {
      const ch = y[p];
      if (ch === ".") return { tur: "nuqta", matn: "Nuqta yoʻq. Gap oxiriga bos va nuqtani ter." };
      if (ch === ",") return { tur: "vergul", matn: "Vergul yoʻq. Kerakli joyga bos va vergulni ter." };
      if (ch === " ") return { tur: "bosh-joy", matn: "Boʻsh joy yetishmaydi: soʻzlar orasiga bos va boʻsh joy tugmasini bos." };
      return { tur: "yetishmaydi", matn: "Bir harf yetishmaydi. Kursorni kerakli joyga qoʻyib, harfni ter." };
    }
    if (dx === 1 && dy === 0) {
      const ch = x[p];
      if (ch === " ") return { tur: "ortiqcha-bosh-joy", matn: "Ortiqcha boʻsh joy bor. Uning oʻng tomoniga bos va Backspace ni bos." };
      if (!HARF.test(ch)) return { tur: "ortiqcha-belgi", matn: "Ortiqcha belgi bor. Uni oʻchir." };
      return { tur: "ortiqcha", matn: "Ortiqcha harf bor. Uning oʻng tomoniga bos va Backspace ni bos." };
    }
    if (dx === 1 && dy === 1) {
      if (x[p].toLowerCase() === y[p].toLowerCase()) {
        return y[p] === y[p].toUpperCase()
          ? { tur: "katta", matn: "Katta harf kerak: harfni oʻchirib, Shift bilan birga qayta bos." }
          : { tur: "kichik", matn: "Bu yerda kichik harf kerak." };
      }
      return { tur: "notogri", matn: "Bir harf notoʻgʻri. Uni oʻchirib, toʻgʻrisini ter." };
    }
    const d = masofa(x, y);
    return { tur: "boshqa", matn: `${d} ta joy boshqacha. Soʻzma-soʻz solishtirib chiq.` };
  }

  // Joriy va kutilgan matn farqi: null — teng; aks holda { tur, matn } (maslahat, joyini aytmaydi)
  function farq(joriy, kutilgan) {
    const a = norm(joriy);
    const b = norm(kutilgan);
    if (a === b) return null;
    if (!a.trim()) return { tur: "bosh", matn: "Matn boʻsh. Kutilgan matnni yoz." };
    const al = a.split("\n");
    const bl = b.split("\n");
    // Qatorlar bitta satrga yig'ilganda teng bo'lsa — faqat qator bo'linishi boshqa (bo'sh joylar o'zgarmaydi)
    const yigma = (list) => list.join(" ");
    if (al.length !== bl.length) {
      if (yigma(al) === yigma(bl)) {
        return al.length < bl.length
          ? { tur: "qator", matn: `Qator ajratilmagan: ${bl.length} ta qator kerak, hozir ${al.length} ta. Enter bilan yangi qator och.` }
          : { tur: "ortiqcha-qator", matn: `Ortiqcha qator bor: ${bl.length} ta qator kerak, hozir ${al.length} ta.` };
      }
      return al.length < bl.length
        ? { tur: "qator", matn: `Qatorlar soni boshqa: ${bl.length} ta kerak, hozir ${al.length} ta.` }
        : { tur: "ortiqcha-qator", matn: `Qatorlar soni boshqa: ${bl.length} ta kerak, hozir ${al.length} ta.` };
    }
    if (yigma(al) === yigma(bl)) return { tur: "qator-joyi", matn: "Qator notoʻgʻri joydan boshlangan. Qaysi soʻzdan yangi qator boshlanishini tekshir." };
    const farqli = al.map((q, i) => i).filter((i) => al[i] !== bl[i]);
    const f = qatorFarq(al[farqli[0]], bl[farqli[0]]);
    if (farqli.length > 1) f.matn += " Boshqa qatorda ham farq bor.";
    return f;
  }

  // ---------- 1-bosqich: xato generatori ----------
  const XATO_TURLARI = ["tushdi", "ortiqcha", "notogri", "kichik"];
  // Klaviaturadagi qo'shni harflar (QWERTY) — "noto'g'ri harf" shulardan
  const QOSHNI = {
    a: "sq", b: "vn", c: "xv", d: "sf", e: "wr", f: "dg", g: "fh", h: "gj", i: "uo", j: "hk", k: "jl", l: "k", m: "n",
    n: "bm", o: "ip", p: "o", q: "wa", r: "et", s: "ad", t: "ry", u: "yi", v: "cb", w: "qe", x: "zc", y: "tu", z: "x",
  };
  const KICHIK_HARF = /^[a-z]$/;

  // So'z ichida buzish mumkin bo'lgan o'rinlar: kichik lotin harfi, keyin ʻ kelmaydi (oʻ/gʻ butun qoladi)
  function orinlar(soz) {
    const out = [];
    for (let i = 0; i < soz.length; i++) if (KICHIK_HARF.test(soz[i]) && soz[i + 1] !== OKINA) out.push(i);
    return out;
  }

  // Bitta so'zni bitta xato bilan buzish; bo'lmasa — null
  function buz(soz, tur, r) {
    if (tur === "kichik") return /^[A-Z]/.test(soz) ? soz[0].toLowerCase() + soz.slice(1) : null;
    const o = orinlar(soz);
    if (!o.length) return null;
    const i = pick(o, r);
    if (tur === "tushdi") return soz.slice(0, i) + soz.slice(i + 1);
    if (tur === "ortiqcha") return soz.slice(0, i + 1) + soz[i] + soz.slice(i + 1);
    if (tur === "notogri") {
      const q = QOSHNI[soz[i]];
      return q ? soz.slice(0, i) + pick(q.split(""), r) + soz.slice(i + 1) : null;
    }
    return null;
  }

  // Gapga n ta xato kiritish: har xato alohida so'zda, turlari har xil. { matn, xatolar } yoki null
  function xatoKirit(gap, n, r) {
    const toks = sozlar(gap);
    const xatolar = [];
    const band = new Set();
    for (const tur of aralash(XATO_TURLARI, r)) {
      if (xatolar.length === n) break;
      const nomzod = toks.map((t, k) => k).filter((k) => !band.has(k) && (tur === "kichik" ? k === 0 : toks[k].soz.length >= 3 && orinlar(toks[k].soz).length > 0));
      if (!nomzod.length) continue;
      const k = pick(nomzod, r);
      const buzuq = buz(toks[k].soz, tur, r);
      if (!buzuq || buzuq === toks[k].soz) continue;
      xatolar.push({ tur, soz: k, asl: toks[k].soz, buzuq });
      band.add(k);
    }
    if (xatolar.length < n) return null;
    let matn = gap;
    for (const x of xatolar.slice().sort((a, b) => b.soz - a.soz)) {
      const t = toks[x.soz];
      matn = matn.slice(0, t.bosh) + x.buzuq + matn.slice(t.oxir);
    }
    return { matn, xatolar };
  }

  // tier 0 — bitta xato, buzilgan so'z ko'rsatiladi; tier 1 — ko'rsatilmaydi; tier 2 — ikki xato
  function tuzatTask(r, prev, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((rr) => {
      const gi = Math.floor(rr() * GAPLAR.length);
      const gap = GAPLAR[gi];
      const x = xatoKirit(gap, t === 2 ? 2 : 1, rr);
      if (!x) return null;
      return {
        tur: "tuzat", id: `tuzat:${gi}`, tier: t,
        boshlangich: x.matn, kutilgan: gap, javob: gap, xatolar: x.xatolar,
        korsat: t === 0 ? x.xatolar[0].buzuq : null,
        matn: t === 2 ? "Gapda ikki joy notoʻgʻri yozilgan. Ikkalasini ham tuzat." : t === 0 ? "Bir soʻz notoʻgʻri yozilgan. Uni tuzat." : "Gapda bir joy notoʻgʻri yozilgan. Top va tuzat.",
      };
    }, prev, r);
  }

  // ---------- 2-bosqich: qatorlar va belgilar ----------
  // n qatorli matn: she'r — aynan n qator; ro'yxat — birinchi n qator (kamida n ta bo'lsa)
  function nQatorli(n, turlar) {
    return MATNLAR.filter((m) => (!turlar || turlar.includes(m.tur)) && (m.tur === "royxat" ? m.qatorlar.length >= n : m.qatorlar.length === n))
      .map((m) => ({ ...m, qatorlar: m.qatorlar.slice(0, n) }));
  }
  const turYozuv = (tur) => (tur === "sher" ? "sheʼr" : "roʻyxat");

  // Bir qatorda yozilgan she'r/ro'yxatni qatorlarga ajratish (namuna ko'rsatiladi)
  function qatorTask(r, prev, tier) {
    const n = 2 + Math.min(tier || 0, 2);
    return pickNew((rr) => {
      const m = pick(nQatorli(n), rr);
      const kutilgan = m.qatorlar.join("\n");
      return {
        tur: "qator", id: `qator:${m.id}:${n}`, tier: Math.min(tier || 0, 2), qatorlar: n, namuna: true,
        boshlangich: m.qatorlar.join(" "), kutilgan, javob: kutilgan,
        matn: `Bu ${turYozuv(m.tur)} bitta qatorda yozilib qolgan. Namunadagidek ${n} ta qator qil.`,
        maqtov: `${n} ta qator — har biri alohida.`,
      };
    }, prev, r);
  }

  // Sarlavha birinchi qatorga yopishib qolgan — alohida qatorga ajratish
  function sarlavhaTask(r, prev, tier) {
    const n = 2 + Math.min(tier || 0, 2);
    return pickNew((rr) => {
      const m = pick(nQatorli(n), rr);
      const kutilgan = [m.nom].concat(m.qatorlar).join("\n");
      const boshlangich = [m.nom + " " + m.qatorlar[0]].concat(m.qatorlar.slice(1)).join("\n");
      return {
        tur: "sarlavha", id: `sarlavha:${m.id}:${n}`, tier: Math.min(tier || 0, 2), qatorlar: n + 1,
        boshlangich, kutilgan, javob: kutilgan, sarlavha: m.nom,
        matn: `Sarlavha «${m.nom}» birinchi qatorga yopishib qolgan. Uni alohida qatorga ajrat.`,
        maqtov: "Sarlavha — alohida, eng tepadagi qator.",
      };
    }, prev, r);
  }

  // Qator oxiridagi tushib qolgan belgilar soni: tier 0 — 1, tier 1 — 2, tier 2 — 3 (qatorlar sonidan oshmaydi)
  function belgiTask(r, prev, tier) {
    const t = Math.min(tier || 0, 2);
    const n = 2 + t;
    return pickNew((rr) => {
      // She'r (vergul + nuqta) yoki n ta gap (har biri nuqta bilan)
      const sher = rr() < 0.5;
      let qatorlar;
      let id;
      if (sher) {
        const m = pick(nQatorli(n, ["sher"]), rr);
        qatorlar = m.qatorlar;
        id = `belgi:${m.id}`;
      } else {
        const idx = aralash(GAPLAR.map((_, i) => i), rr).slice(0, n);
        qatorlar = idx.map((i) => GAPLAR[i]);
        id = `belgi:gap:${idx.join(",")}`;
      }
      const k = Math.min(t + 1, qatorlar.length);
      const tushgan = aralash(qatorlar.map((_, i) => i), rr).slice(0, k).sort((a, b) => a - b);
      const buzuq = qatorlar.map((q, i) => (tushgan.includes(i) ? q.slice(0, -1) : q));
      const belgilar = tushgan.map((i) => qatorlar[i].slice(-1));
      const kutilgan = qatorlar.join("\n");
      return {
        tur: "belgi", id, tier: t, qatorlar: n, tushgan: k,
        boshlangich: buzuq.join("\n"), kutilgan, javob: kutilgan, belgilar,
        matn: k === 1
          ? "Bir qator oxirida belgi tushib qolgan. Uni qoʻy."
          : `${k} ta qator oxirida belgi tushib qolgan. Hammasini qoʻy.`,
        ishora: sher ? "Sheʼrda qator oxirida vergul, oxirgi qatorda nuqta boʻladi." : "Har gap nuqta bilan tugaydi.",
        maqtov: sher ? "Qator oxirida vergul, oxirida nuqta." : "Har gap nuqta bilan tugadi.",
      };
    }, prev, r);
  }

  // ---------- 3-bosqich: belgilash va bezash ----------
  const bezakNomi = (b) => BEZAK_NOMI[b] || b;
  const asbobNomi = (b) => ASBOB_NOMI[b] || b;
  const kichikla = (s) => norm(s).toLowerCase();

  // Matnda bir marta uchraydigan, kamida 3 harfli so'zlar (indekslari)
  function yagonaSozlar(matn) {
    const toks = sozlar(matn);
    const sanoq = {};
    for (const t of toks) sanoq[kichikla(t.soz)] = (sanoq[kichikla(t.soz)] || 0) + 1;
    return toks.map((t, k) => k).filter((k) => toks[k].soz.length >= 3 && sanoq[kichikla(toks[k].soz)] === 1);
  }

  // Buyruq matni: «Bahor» soʻzini qalin qil. / Sarlavhani koʻk qil. / Ikkinchi gapni kursiv qil.
  function buyruqYoz(list) {
    const bir = (k) => {
      const nima = k.nima === "sarlavha" ? "Sarlavhani" : k.nima === "gap" ? `${k.gap === 1 ? "Birinchi" : "Ikkinchi"} gapni` : `«${k.soz}» soʻzini`;
      return `${nima} ${bezakNomi(k.bezak)}`;
    };
    if (list.length === 1) return bir(list[0]) + " qil.";
    return list.map(bir).join(", ") + " qil.";
  }

  function bezaTask(r, prev, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((rr) => {
      let matn;
      let id;
      let kutilgan;
      if (t === 1 && rr() < 0.5) {
        // Sarlavha: nom + qatorlar
        const m = pick(nQatorli(2 + Math.floor(rr() * 2)), rr);
        matn = [m.nom].concat(m.qatorlar).join("\n");
        id = `beza:sarlavha:${m.id}`;
        // Sarlavha so'zi matn ichida yana uchramasin (masalan, «Mushukcha» ↔ «Mushukchamning» — boshqa so'z, lekin «Bahor» ↔ «Bahor keldi»)
        const toks = sozlar(matn);
        const nomSozlari = sozlar(m.nom).map((x) => kichikla(x.soz));
        const takror = toks.filter((x) => nomSozlari.includes(kichikla(x.soz))).length > nomSozlari.length;
        if (takror) return null;
        kutilgan = [{ soz: m.nom, bezak: pick(BEZAKLAR, rr), nima: "sarlavha" }];
      } else if (t === 1) {
        // Ikki gap bitta xatboshida: birinchi yoki ikkinchi gapni bezash
        const idx = aralash(GAPLAR.map((_, i) => i), rr).slice(0, 2);
        const g = idx.map((i) => GAPLAR[i]);
        matn = g.join(" ");
        id = `beza:gap:${idx.join(",")}`;
        const gap = 1 + Math.floor(rr() * 2);
        kutilgan = [{ soz: g[gap - 1].replace(/[.,!?]+$/, ""), bezak: pick(BEZAKLAR, rr), nima: "gap", gap }];
      } else {
        // Bitta gap yoki 2 qatorli she'r; tier 0 — bitta so'z, tier 2 — ikki so'z, ikki xil bezak
        const sher = rr() < 0.4;
        if (sher) {
          const m = pick(nQatorli(2, ["sher"]), rr);
          matn = m.qatorlar.join("\n");
          id = `beza:sher:${m.id}`;
        } else {
          const gi = Math.floor(rr() * GAPLAR.length);
          matn = GAPLAR[gi];
          id = `beza:${gi}`;
        }
        const toks = sozlar(matn);
        const nomzod = aralash(yagonaSozlar(matn), rr);
        const n = t === 2 ? 2 : 1;
        if (nomzod.length < n) return null;
        const bezaklar = aralash(BEZAKLAR, rr).slice(0, n);
        kutilgan = nomzod.slice(0, n).map((k, i) => ({ soz: toks[k].soz, bezak: bezaklar[i], nima: "soz" }));
      }
      return {
        tur: "beza", id, tier: t, matn, kutilgan,
        javob: kutilgan.length === 1 ? kutilgan[0] : kutilgan,
        buyruq: buyruqYoz(kutilgan),
        maqtov: kutilgan.map((k) => `«${k.soz}» endi ${bezakNomi(k.bezak)}`).join(", ") + ".",
      };
    }, prev, r);
  }

  // ---------- HTML satri → bo'laklar (bezak tekshiruvi, tozalash) ----------
  const ENT = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
  function entity(s) {
    return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (m, k) => {
      if (k[0] === "#") {
        const code = k[1] === "x" || k[1] === "X" ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : m;
      }
      return k in ENT ? ENT[k] : m;
    });
  }

  // Rang: color="…" yoki style="color: …" → #rrggbb (kichik harf) yoki null
  function rangOl(attrs) {
    let v = null;
    const c = /\bcolor\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs);
    if (c) v = c[2] != null ? c[2] : c[3] != null ? c[3] : c[4];
    const st = /\bstyle\s*=\s*("([^"]*)"|'([^']*)')/i.exec(attrs);
    if (st) {
      const style = st[2] != null ? st[2] : st[3];
      const sc = /(?:^|;)\s*color\s*:\s*([^;]+)/i.exec(style);
      if (sc) v = sc[1].trim();
    }
    return v ? hexRang(v) : null;
  }
  function hexRang(v) {
    const s = String(v).trim().toLowerCase();
    let m = /^#([0-9a-f]{3})$/.exec(s);
    if (m) return "#" + m[1].split("").map((ch) => ch + ch).join("");
    m = /^#([0-9a-f]{6})$/.exec(s);
    if (m) return "#" + m[1];
    m = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(s);
    if (m) return "#" + [m[1], m[2], m[3]].map((x) => Math.min(255, Number(x)).toString(16).padStart(2, "0")).join("");
    return s;
  }
  function styleQalin(attrs) {
    const st = /\bstyle\s*=\s*("([^"]*)"|'([^']*)')/i.exec(attrs);
    const style = st ? (st[2] != null ? st[2] : st[3]) : "";
    return { qalin: /font-weight\s*:\s*(bold|bolder|[6-9]00)/i.test(style), kursiv: /font-style\s*:\s*(italic|oblique)/i.test(style) };
  }

  const BLOK_RE = /^(div|p|li|h[1-6]|tr|ul|ol|blockquote|pre)$/;
  // HTML satri → [{ matn, qalin, kursiv, rang }]; <br> va blok teglar — "\n"; <script>/<style> ichi tashlanadi
  function htmlBolaklar(html) {
    const out = [];
    const stack = [];
    let holat = { qalin: false, kursiv: false, rang: null };
    const oxirgi = () => (out.length ? out[out.length - 1].matn.slice(-1) : "\n");
    const qosh = (matn) => out.push({ matn, qalin: holat.qalin, kursiv: holat.kursiv, rang: holat.rang });
    const yangiQator = () => { if (oxirgi() !== "\n") qosh("\n"); };
    const hisobla = () => {
      holat = { qalin: stack.some((s) => s.qalin), kursiv: stack.some((s) => s.kursiv), rang: null };
      for (const s of stack) if (s.rang) holat.rang = s.rang;
    };
    const re = /<!--[\s\S]*?-->|<\/?([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^'">])*)>|([^<]+)/g;
    const s = String(html == null ? "" : html);
    let m;
    while ((m = re.exec(s))) {
      if (m[0].startsWith("<!--")) continue;
      if (m[3] != null) { if (m[3]) qosh(entity(m[3])); continue; }
      const teg = m[1].toLowerCase();
      const attrs = m[2] || "";
      const yopuvchi = m[0][1] === "/";
      if (teg === "br") { qosh("\n"); continue; }
      if (!yopuvchi && (teg === "script" || teg === "style")) {
        const end = s.toLowerCase().indexOf("</" + teg, re.lastIndex);
        re.lastIndex = end < 0 ? s.length : end;
        continue;
      }
      if (yopuvchi) {
        for (let i = stack.length - 1; i >= 0; i--) if (stack[i].teg === teg) { stack.length = i; break; }
        hisobla();
        if (BLOK_RE.test(teg)) yangiQator();
        continue;
      }
      if (BLOK_RE.test(teg)) yangiQator();
      if (/\/\s*$/.test(attrs)) continue; // o'z-o'zini yopuvchi
      const st = styleQalin(attrs);
      stack.push({ teg, qalin: teg === "b" || teg === "strong" || st.qalin, kursiv: teg === "i" || teg === "em" || st.kursiv, rang: rangOl(attrs) });
      hisobla();
    }
    return out;
  }
  const bolaklarMatn = (bolaklar) => bolaklar.map((b) => b.matn).join("");
  const htmlMatn = (html) => bolaklarMatn(htmlBolaklar(html));

  const qoch = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Bo'laklar → toza HTML: faqat <b>, <i>, <font color>, <br>
  function bolaklarHtml(bolaklar) {
    const out = [];
    for (const b of bolaklar) {
      const p = out[out.length - 1];
      if (p && p.qalin === b.qalin && p.kursiv === b.kursiv && p.rang === b.rang) p.matn += b.matn;
      else out.push({ ...b });
    }
    return out.map((b) => {
      let s = qoch(b.matn).replace(/\n/g, "<br>");
      if (b.kursiv) s = `<i>${s}</i>`;
      if (b.qalin) s = `<b>${s}</b>`;
      if (b.rang) s = `<font color="${b.rang}">${s}</font>`;
      return s;
    }).join("");
  }
  const tozaHtml = (html) => bolaklarHtml(htmlBolaklar(html));
  const matnHtml = (matn) => bolaklarHtml([{ matn: String(matn == null ? "" : matn), qalin: false, kursiv: false, rang: null }]);

  // Kutilgan bezak bilan HTML: matn + [{ soz, bezak }] (so'z/ibora birinchi uchrashi)
  function bezakHtml(matn, kutilgan) {
    const list = Array.isArray(kutilgan) ? kutilgan : [kutilgan];
    const s = String(matn);
    const harflar = Array.from(s, (ch) => ({ matn: ch, qalin: false, kursiv: false, rang: null }));
    for (const k of list) {
      const i = s.indexOf(k.soz);
      if (i < 0) continue;
      for (let j = i; j < i + k.soz.length; j++) {
        if (k.bezak === "qalin") harflar[j].qalin = true;
        else if (k.bezak === "kursiv") harflar[j].kursiv = true;
        else if (RANGLAR[k.bezak]) harflar[j].rang = RANGLAR[k.bezak].hex;
      }
    }
    return bolaklarHtml(harflar);
  }

  // Bo'laklardan so'zlar: har so'z uchun harflarining bezak holati
  function sozlarBezak(bolaklar) {
    const harflar = [];
    for (const b of bolaklar) for (const ch of b.matn) harflar.push({ ch, qalin: b.qalin, kursiv: b.kursiv, rang: b.rang });
    const out = [];
    let cur = null;
    for (const hh of harflar) {
      if (HARF.test(hh.ch)) {
        if (!cur) { cur = { soz: "", harflar: [] }; out.push(cur); }
        cur.soz += hh.ch;
        cur.harflar.push(hh);
      } else cur = null;
    }
    return out;
  }
  // So'zda bezak holati: "toliq" | "qisman" | "yoq"
  function bezakHolat(soz, bezak) {
    const bor = (hh) => (bezak === "qalin" ? hh.qalin : bezak === "kursiv" ? hh.kursiv : !!hh.rang && hh.rang === (RANGLAR[bezak] ? RANGLAR[bezak].hex : bezak));
    const n = soz.harflar.filter(bor).length;
    return n === soz.harflar.length ? "toliq" : n ? "qisman" : "yoq";
  }

  // Bezak tekshiruvi: html — muharrir ichi; kutilgan — { soz, bezak } yoki ro'yxat; matn — asl matn (berilsa, o'zgarmaganini tekshiradi)
  // → { ok, tur, sabab } ; tur: ok | matn | topilmadi | yoq | qisman | ortiqcha
  function bezakTekshir(html, kutilgan, matn) {
    const list = Array.isArray(kutilgan) ? kutilgan : [kutilgan];
    const bolaklar = htmlBolaklar(html);
    if (matn != null && !teng(bolaklarMatn(bolaklar), matn)) {
      return { ok: false, tur: "matn", sabab: "Matn oʻzgarib ketdi. Harflarni oʻchirma — faqat belgilab bezat. Ctrl + Z oxirgi ishni qaytaradi." };
    }
    const sozlarR = sozlarBezak(bolaklar);
    for (const k of list) {
      const nishon = sozlar(k.soz).map((x) => kichikla(x.soz));
      let pos = -1;
      for (let i = 0; i + nishon.length <= sozlarR.length && pos < 0; i++) {
        if (nishon.every((w, j) => kichikla(sozlarR[i + j].soz) === w)) pos = i;
      }
      if (pos < 0) return { ok: false, tur: "topilmadi", sabab: `«${k.soz}» matnda topilmadi. Matn oʻzgarib ketgan boʻlsa, Ctrl + Z bilan qaytar.` };
      const nomi = bezakNomi(k.bezak);
      for (let i = 0; i < sozlarR.length; i++) {
        const holat = bezakHolat(sozlarR[i], k.bezak);
        const ichida = i >= pos && i < pos + nishon.length;
        if (ichida && holat === "yoq") {
          return { ok: false, tur: "yoq", sabab: `«${k.soz}» hali ${nomi} emas. Avval uni belgila (ikki marta bos yoki sudra), keyin «${asbobNomi(k.bezak)}» tugmasini bos.` };
        }
        if (ichida && holat === "qisman") {
          return { ok: false, tur: "qisman", sabab: `«${sozlarR[i].soz}» soʻzining faqat bir qismi ${nomi}. Butun soʻzni belgilab, tugmani yana bos.` };
        }
        if (!ichida && holat !== "yoq") {
          return { ok: false, tur: "ortiqcha", sabab: `«${sozlarR[i].soz}» ham ${nomi} boʻlib qoldi. Faqat ${nishon.length > 1 ? "kerakli soʻzlar" : `«${k.soz}»`} boʻlsin — Ctrl + Z oxirgi ishni qaytaradi.` };
        }
      }
    }
    return { ok: true, tur: "ok", sabab: "" };
  }

  // ---------- Hujjat nomi ----------
  // Band nom bo'lsa — «Xat 2», «Xat 3»
  function yangiNom(nom, mavjud) {
    const bor = new Set((mavjud || []).map((x) => String(x)));
    if (!bor.has(nom)) return nom;
    for (let k = 2; k < 1000; k++) if (!bor.has(`${nom} ${k}`)) return `${nom} ${k}`;
    return nom;
  }
  const birinchiQator = (matn) => norm(matn).split("\n").map((q) => q.trim()).find((q) => q) || "";

  const BOSQICH1 = [tuzatTask];
  const BOSQICH2 = [qatorTask, belgiTask, sarlavhaTask, qatorTask, belgiTask];
  const BOSQICH3 = [bezaTask];
  // n — nechanchi to'g'ri javob (mashq turi navbati), tier — qiyinlik zinasi
  const navbat = (bank) => (r, prev, n, tier) => bank[(n || 0) % bank.length](r, prev, tier);

  const api = {
    OKINA, TUTUQ, RANGLAR, BEZAKLAR, BEZAK_NOMI, ASBOB_NOMI, HUJJAT_NOMLARI, HUJJAT_CHEGARA, GAPLAR, MATNLAR, XATO_TURLARI, QOSHNI,
    BOSQICH1, BOSQICH2, BOSQICH3,
    norm, teng, sozlar, masofa, farq, orinlar, buz, xatoKirit, nQatorli, yagonaSozlar, buyruqYoz,
    tuzatTask, qatorTask, sarlavhaTask, belgiTask, bezaTask,
    bosqich1Task: navbat(BOSQICH1), bosqich2Task: navbat(BOSQICH2), bosqich3Task: navbat(BOSQICH3),
    entity, hexRang, htmlBolaklar, htmlMatn, bolaklarHtml, tozaHtml, matnHtml, bezakHtml, sozlarBezak, bezakTekshir,
    bezakNomi, asbobNomi, yangiNom, birinchiQator, aralash,
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
