// «Maʼlumot tahlili»: oʻrtacha, mediana, moda, oraliq, chetga chiqqan qiymat; diagramma oʻqish
// (ustunli, chiziqli, nuqtali, kesilgan oʻq); bogʻliqlik va sabab. Ekransiz sof mantiq; test: tests/logic.test.js
// Generatorlar: (prev, rng, tier) — prev bilan bir xil misol ketma-ket chiqmaydi, tier 0/1/2.
// Sonli javoblar doim butun va manfiy emas (ekrandagi raqam klaviaturasi uchun).
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

  // ---------- Hisob ----------
  const yigindi = (a) => a.reduce((s, x) => s + x, 0);
  const ortacha = (a) => yigindi(a) / a.length;
  const tartib = (a) => a.slice().sort((x, y) => x - y);
  function mediana(a) {
    const s = tartib(a);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }
  // Eng koʻp uchragan qiymat(lar)
  function modalar(a) {
    const sanoq = new Map();
    a.forEach((x) => sanoq.set(x, (sanoq.get(x) || 0) + 1));
    const eng = Math.max(...sanoq.values());
    return [...sanoq.keys()].filter((x) => sanoq.get(x) === eng).sort((x, y) => x - y);
  }
  const oraliq = (a) => Math.max(...a) - Math.min(...a);
  // Pirson korrelyatsiya koeffitsiyenti
  function korrelyatsiya(xs, ys) {
    const mx = ortacha(xs);
    const my = ortacha(ys);
    let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < xs.length; i++) {
      sxy += (xs[i] - mx) * (ys[i] - my);
      sxx += (xs[i] - mx) ** 2;
      syy += (ys[i] - my) ** 2;
    }
    return sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0;
  }

  // Ekranda: manfiy son uzun minus bilan, kasr vergul bilan
  const son = (v) => String(v).replace("-", "−").replace(".", ",");
  const qavs = (v) => (v < 0 ? `(${son(v)})` : son(v));
  const royxat = (a) => a.map(son).join(", ");
  // Oʻqdagi oʻrni: 0 — pastda (lo), 1 — tepada (hi)
  const ulush = (v, lo, hi) => (v - lo) / (hi - lo);

  // Aralashgan, lekin tartiblanib qolmagan roʻyxat (tartiblash — oʻquvchining ishi)
  function tartibsiz(a, r) {
    for (let k = 0; k < 30; k++) {
      const out = aralash(a, r);
      const s = tartib(out);
      if (out.some((x, i) => x !== s[i])) return out;
    }
    return a.slice().reverse();
  }

  // ---------- 1-bosqich: toʻplam koʻrsatkichlari ----------
  const KONTEKST = [
    "Nazorat ishi ballari", "Bir kunda oʻqilgan betlar", "Mashqqa ketgan vaqt (daqiqa)",
    "Bir haftadagi xabarlar soni", "Sinovdagi toʻgʻri javoblar", "Doʻkondagi kunlik xaridorlar",
  ];
  const sonlar = (r, n, a, b) => Array.from({ length: n }, () => int(r, a, b));

  // Oʻrtacha. tier 0–1 — butun chiqadi; tier 2 — butun chiqmaydi, eng yaqin butun songacha yaxlitlanadi (aynan ,5 boʻlmaydi).
  function ortachaTask(prev, rng, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((r) => {
      const n = t === 0 ? int(r, 4, 5) : t === 1 ? int(r, 5, 6) : int(r, 5, 7);
      const a = t === 0 ? sonlar(r, n, 1, 10) : t === 1 ? sonlar(r, n, 10, 40) : sonlar(r, n, 10, 60);
      const S = yigindi(a);
      const qoldiq = S % n;
      if (t < 2 && qoldiq !== 0) return null;
      if (t === 2 && (qoldiq === 0 || qoldiq * 2 === n)) return null;
      if (oraliq(a) < 3) return null;
      const javob = Math.round(S / n);
      const aniq = son((S / n).toFixed(2));
      return {
        tur: "ortacha", id: `ortacha:${t}:${a.join(",")}`, nom: pick(KONTEKST, r), toplam: a, javob,
        matn: t === 2 ? "Oʻrtacha qiymat nechaga teng? Javobni eng yaqin butun songacha yaxlitla." : "Oʻrtacha qiymat nechaga teng?",
        nega: `Oʻrtacha = yigʻindi ÷ qiymatlar soni. Bu yerda ${n} ta qiymat bor — avval hammasini qoʻsh.`,
        hisob: `(${a.map(qavs).join(" + ")}) ÷ ${n} = ${S} ÷ ${n} ` + (t === 2 ? `≈ ${aniq} ≈ ${javob}` : `= ${javob}`),
        qisqa: t === 2 ? `${S} ÷ ${n} ≈ ${javob}` : `${S} ÷ ${n} = ${javob}`,
      };
    }, prev, rng);
  }

  // Mediana. tier 0 — 5 ta qiymat; tier 1 — 6 yoki 7 ta; tier 2 — 8 ta. Juft sonda oʻrtadagi ikki qiymat yigʻindisi juft (javob butun).
  function medianaTask(prev, rng, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((r) => {
      const n = t === 0 ? 5 : t === 1 ? int(r, 6, 7) : 8;
      const a = tartibsiz(t === 0 ? sonlar(r, n, 1, 12) : t === 1 ? sonlar(r, n, 5, 40) : sonlar(r, n, 10, 90), r);
      const s = tartib(a);
      const m = mediana(a);
      if (!Number.isInteger(m) || oraliq(a) < 4) return null;
      const juft = n % 2 === 0;
      if (juft && s[n / 2 - 1] === s[n / 2] && t === 2) return null; // tier 2 da oʻrtadagi ikki qiymat har xil — hisoblash kerak
      return {
        tur: "mediana", id: `mediana:${t}:${a.join(",")}`, nom: pick(KONTEKST, r), toplam: a, tartiblangan: s, javob: m,
        matn: "Mediana nechaga teng?",
        nega: "Avval qiymatlarni oʻsish tartibida yoz. Soni toq boʻlsa — oʻrtadagisi, juft boʻlsa — oʻrtadagi ikkitasining oʻrtachasi.",
        hisob: `Tartibda: ${royxat(s)}. ` + (juft ? `Oʻrtada ${s[n / 2 - 1]} va ${s[n / 2]}: (${s[n / 2 - 1]} + ${s[n / 2]}) ÷ 2 = ${m}.` : `Oʻrtadagi (${(n + 1) / 2}-) qiymat — ${m}.`),
        qisqa: `Mediana = ${m}`,
      };
    }, prev, rng);
  }

  // Moda — yagona. tier 2 da ikkinchi oʻrindagi qiymat modadan faqat bitta kam uchraydi.
  function modaTask(prev, rng, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((r) => {
      const n = [6, 8, 10][t];
      const havza = t === 0 ? tanla([1, 2, 3, 4, 5, 6, 7, 8, 9], 4, r) : t === 1 ? tanla(sonlar(r, 12, 10, 30), 5, r) : tanla(sonlar(r, 12, 10, 60), 4, r);
      if (new Set(havza).size !== havza.length) return null;
      const a = Array.from({ length: n }, () => pick(havza, r));
      const m = modalar(a);
      if (m.length !== 1) return null;
      const sanoq = (x) => a.filter((y) => y === x).length;
      const marta = sanoq(m[0]);
      const ikkinchi = Math.max(...havza.filter((x) => x !== m[0]).map(sanoq));
      if (marta < 2 || new Set(a).size < 3) return null;
      if (t === 2 && ikkinchi !== marta - 1) return null;
      return {
        tur: "moda", id: `moda:${t}:${a.join(",")}`, nom: pick(KONTEKST, r), toplam: a, javob: m[0], marta,
        matn: "Moda nechaga teng?",
        nega: "Har qiymat necha marta uchrashini sanab chiq. Eng koʻp uchragani — moda.",
        hisob: `${m[0]} — ${marta} marta uchraydi, boshqa qiymatlar kamroq. Moda = ${m[0]}.`,
        qisqa: `Moda = ${m[0]} (${marta} marta)`,
      };
    }, prev, rng);
  }

  // Oraliq = max − min. tier 2 — manfiy haroratlar bilan.
  function oraliqTask(prev, rng, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((r) => {
      const n = t === 0 ? 5 : int(r, 6, 7);
      const a = t === 0 ? sonlar(r, n, 1, 20) : t === 1 ? sonlar(r, n, 10, 99) : sonlar(r, n, -15, 25);
      const mx = Math.max(...a);
      const mn = Math.min(...a);
      if (mx - mn < 3) return null;
      if (t === 2 && !(mn < 0 && mx > 0)) return null;
      if (a[0] === mn && a[n - 1] === mx) return null; // chetlari tayyor turmasin
      return {
        tur: "oraliq", id: `oraliq:${t}:${a.join(",")}`, nom: t === 2 ? "Bir haftalik harorat (°C)" : pick(KONTEKST, r), toplam: a, javob: mx - mn,
        matn: "Oraliq (range) nechaga teng?",
        nega: "Oraliq = eng katta qiymat − eng kichik qiymat. Ikkalasini top." + (t === 2 ? " Manfiy sonni ayirish — qoʻshish demak." : ""),
        hisob: `Eng katta — ${son(mx)}, eng kichik — ${son(mn)}. Oraliq = ${son(mx)} − ${qavs(mn)} = ${mx - mn}.`,
        qisqa: `${son(mx)} − ${qavs(mn)} = ${mx - mn}`,
      };
    }, prev, rng);
  }

  // Chetga chiqqan qiymat (outlier). Asosiy toʻplam oʻrtachasi m (butun), chet qiymat = m + k·(n + 1) — u bilan oʻrtacha m + k.
  // tier 0 — qaysi qiymat chetga chiqqan; tier 1 — usiz oʻrtacha; tier 2 — u oʻrtachani nechaga oshirdi.
  function chetTask(prev, rng, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((r) => {
      const n = int(r, 4, 5);
      const asos = sonlar(r, n, 3, 12);
      const S = yigindi(asos);
      if (S % n !== 0 || oraliq(asos) < 2) return null;
      const m = S / n;
      const k = int(r, 5, 9);
      const chet = m + k * (n + 1);
      if (chet < 3 * Math.max(...asos)) return null;
      if (Math.abs(mediana(asos.concat(chet)) - mediana(asos)) > 1) return null; // mediana deyarli oʻzgarmasligi kerak
      const a = aralash(asos.concat(chet), r);
      const bilan = `(${S} + ${chet}) ÷ ${n + 1} = ${m + k}`;
      const usiz = `${S} ÷ ${n} = ${m}`;
      const V = [
        {
          javob: chet, matn: "Qaysi qiymat chetga chiqqan (outlier)?",
          nega: "Qiymatlarni tartibla: bittasi qolganlaridan juda uzoqda turadi.",
          hisob: `${chet} qolgan qiymatlardan (${royxat(tartib(asos))}) juda uzoq.`, qisqa: `Chetga chiqqan qiymat — ${chet}`,
        },
        {
          javob: m, matn: "Chetga chiqqan qiymat olib tashlansa, qolganlarining oʻrtachasi nechaga teng?",
          nega: "Avval qolganlaridan juda uzoq turgan qiymatni top va uni hisobga qoʻshma.",
          hisob: `${chet} siz: ${usiz}. U bilan esa: ${bilan}.`, qisqa: usiz,
        },
        {
          javob: k, matn: "Chetga chiqqan qiymat oʻrtachani nechaga oshirgan? (U bilan oʻrtacha − usiz oʻrtacha.)",
          nega: "Ikki oʻrtachani hisobla: hamma qiymat bilan va chetga chiqqanisiz. Keyin ayir.",
          hisob: `U bilan: ${bilan}. Usiz: ${usiz}. Farq = ${m + k} − ${m} = ${k}. Mediana esa deyarli oʻzgarmaydi.`, qisqa: `${m + k} − ${m} = ${k}`,
        },
      ][t];
      return { tur: "chet", id: `chet:${t}:${a.join(",")}`, nom: pick(KONTEKST, r), toplam: a, chet, asos, ...V };
    }, prev, rng);
  }

  // ---------- 2-bosqich: diagramma oʻqish ----------
  const KUNLAR = ["Du", "Se", "Chor", "Pay", "Ju"];
  const USTUN_KONTEKST = [
    { oq: "Kutubxonadan olingan kitoblar (dona)", nomlar: KUNLAR },
    { oq: "Toʻgarak aʼzolari (kishi)", nomlar: ["Shaxmat", "Futbol", "Rasm", "Robot", "Xor"] },
    { oq: "Sotilgan ichimliklar (dona)", nomlar: ["Suv", "Choy", "Sharbat", "Sut", "Kompot"] },
    { oq: "Saytga kirganlar (kishi)", nomlar: KUNLAR },
  ];

  // Ustunli diagramma. tier 0 — bitta ustun qiymati (chiziq ustida); tier 1 — eng baland va eng past farqi (yarim qadamlar bor);
  // tier 2 — ustunlar oʻrtachasi.
  function ustunTask(prev, rng, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((r) => {
      const k = pick(USTUN_KONTEKST, r);
      const n = t === 0 ? 4 : 5;
      const qadam = t === 2 ? 20 : 10;
      const y1 = t === 0 ? 50 : t === 1 ? 60 : 100;
      const birlik = t === 0 ? 10 : t === 1 ? 5 : 10;
      const q = tanla(Array.from({ length: y1 / birlik }, (_, i) => (i + 1) * birlik), n, r);
      const nomlar = k.nomlar.slice(0, n);
      const d = { tur: "ustun", nomlar, qiymatlar: q, y0: 0, y1, qadam, oq: k.oq };
      const sanab = nomlar.map((x, i) => `${x} — ${q[i]}`).join(", ");
      if (t === 0) {
        const i = int(r, 0, n - 1);
        return {
          tur: "ustun", id: `ustun:0:${q.join(",")}:${i}`, diagramma: d, javob: q[i],
          matn: `«${nomlar[i]}» ustunining qiymati nechaga teng?`,
          nega: "Ustun tepasidan chapga — oʻq yozuvlariga qara.", hisob: `«${nomlar[i]}» ustuni ${q[i]} chizigʻigacha yetadi.`, qisqa: `${nomlar[i]} = ${q[i]}`,
        };
      }
      if (t === 1) {
        const mx = Math.max(...q);
        const mn = Math.min(...q);
        if (q.every((v) => v % 10 === 0)) return null; // kamida bitta ustun ikki chiziq orasida tugaydi
        return {
          tur: "ustun", id: `ustun:1:${q.join(",")}`, diagramma: d, javob: mx - mn,
          matn: "Eng baland va eng past ustun qiymatlari farqi nechaga teng?",
          nega: "Ikkala ustun qiymatini oʻqdan oʻqi. Ikki chiziq oʻrtasida tugagan ustun — yarim qadam (5).",
          hisob: `${sanab}. Farq = ${mx} − ${mn} = ${mx - mn}.`, qisqa: `${mx} − ${mn} = ${mx - mn}`,
        };
      }
      const S = yigindi(q);
      if (S % n !== 0) return null;
      return {
        tur: "ustun", id: `ustun:2:${q.join(",")}`, diagramma: d, javob: S / n,
        matn: "Besh ustun qiymatlarining oʻrtachasi nechaga teng?",
        nega: "Har ustun qiymatini oʻqdan oʻqi (ikki chiziq oʻrtasi — 10), qoʻsh va 5 ga boʻl.",
        hisob: `${sanab}. ${S} ÷ ${n} = ${S / n}.`, qisqa: `${S} ÷ ${n} = ${S / n}`,
      };
    }, prev, rng);
  }

  const CHIZIQ_KONTEKST = [
    { oq: "Sotilgan chiptalar (dona)", x: "Kun" },
    { oq: "Saytga tashriflar (kishi)", x: "Hafta" },
    { oq: "Kutubxonaga kelganlar (kishi)", x: "Kun" },
    { oq: "Yuborilgan xabarlar (dona)", x: "Soat" },
  ];

  // Chiziqli diagramma. tier 0 — nuqta qiymati; tier 1 — eng katta oʻsish qaysi oraliqda (4 variant); tier 2 — eng katta pasayish nechaga teng.
  function chiziqTask(prev, rng, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((r) => {
      const k = pick(CHIZIQ_KONTEKST, r);
      const n = t === 0 ? 6 : 7;
      const q = Array.from({ length: n }, () => 5 * int(r, 1, 12));
      for (let i = 1; i < n; i++) if (q[i] === q[i - 1]) return null;
      const nomlar = q.map((_, i) => String(i + 1));
      const d = { tur: "chiziq", nomlar, qiymatlar: q, y0: 0, y1: 60, qadam: 10, oq: k.oq, xNomi: k.x };
      const farq = q.slice(1).map((v, i) => v - q[i]);
      if (t === 0) {
        const i = int(r, 0, n - 1);
        return {
          tur: "chiziq", id: `chiziq:0:${q.join(",")}:${i}`, diagramma: d, javob: q[i],
          matn: `${i + 1}-nuqtada (${k.x.toLowerCase()} = ${i + 1}) qiymat nechaga teng?`,
          nega: "Pastdagi raqamdan tepaga — nuqtagacha, nuqtadan chapga — oʻq yozuviga qara.",
          hisob: `${i + 1}-nuqta ${q[i]} balandligida turibdi.`, qisqa: `${i + 1}-nuqta = ${q[i]}`,
        };
      }
      if (t === 1) {
        const eng = Math.max(...farq);
        if (eng <= 0 || farq.filter((f) => f === eng).length !== 1) return null;
        const i = farq.indexOf(eng);
        const nom = (j) => `${j + 1} → ${j + 2}`;
        const boshqa = tanla(farq.map((_, j) => j).filter((j) => j !== i), 3, r);
        return {
          tur: "chiziq", id: `chiziq:1:${q.join(",")}`, diagramma: d, javob: nom(i),
          matn: "Qaysi oraliqda qiymat eng koʻp oʻsgan?",
          variantlar: boshqa.concat(i).sort((a, b) => a - b).map(nom),
          ishora: "Eng tik koʻtarilgan kesmani qidir va uchlarining qiymatlarini oʻqdan oʻqi.",
          nega: `${nom(i)} oraligʻida: ${q[i]} dan ${q[i + 1]} ga, yaʼni +${eng}. Boshqa oraliqlarda oʻsish kamroq.`, qisqa: `${nom(i)}: +${eng}`,
        };
      }
      const past = Math.min(...farq);
      if (past >= 0 || farq.filter((f) => f === past).length !== 1) return null;
      const i = farq.indexOf(past);
      return {
        tur: "chiziq", id: `chiziq:2:${q.join(",")}`, diagramma: d, javob: -past,
        matn: "Eng katta pasayish nechaga teng? (Ikki qoʻshni nuqta orasida.)",
        nega: "Eng tik pastga tushgan kesmani top va uchlarining qiymatlarini ayir.",
        hisob: `${i + 1} → ${i + 2} oraligʻida: ${q[i]} − ${q[i + 1]} = ${-past}.`, qisqa: `${q[i]} − ${q[i + 1]} = ${-past}`,
      };
    }, prev, rng);
  }

  const TREND = {
    musbat: "Musbat: x oshsa, y ham oshadi",
    manfiy: "Manfiy: x oshsa, y kamayadi",
    yoq: "Bogʻliqlik yoʻq: nuqtalar tarqoq",
    tepalik: "Egri: y avval oshadi, keyin kamayadi",
  };
  const qis = (v) => Math.max(0, Math.min(10, v));
  const tepaShakli = (xs) => xs.map((x) => -((x - 5) ** 2));

  // Berilgan shakldagi nuqtalar (x = 1…9, y = 0…10). kuch: 0 — aniq, 1 — biroz tarqoq. Shart bajarilmasa — null.
  function nuqtalarYasa(shakl, r, kuch) {
    const xs = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const shovqin = () => int(r, -1 - (kuch || 0), 1 + (kuch || 0));
    let ys;
    if (shakl === "musbat") ys = xs.map((x) => qis(x + shovqin()));
    else if (shakl === "manfiy") ys = xs.map((x) => qis(10 - x + shovqin()));
    else if (shakl === "tepalik") ys = xs.map((x) => qis(9 - Math.round(((x - 5) ** 2) / 2) + int(r, -1, 0)));
    else ys = xs.map(() => int(r, 1, 9));
    const k = korrelyatsiya(xs, ys);
    const tepa = korrelyatsiya(tepaShakli(xs), ys);
    const chegara = kuch ? 0.6 : 0.8;
    if (shakl === "musbat" && k < chegara) return null;
    if (shakl === "manfiy" && k > -chegara) return null;
    if (shakl === "tepalik" && (Math.abs(k) > 0.25 || tepa < 0.85)) return null;
    if (shakl === "yoq" && (Math.abs(k) > 0.15 || Math.abs(tepa) > 0.3 || oraliq(ys) < 5)) return null;
    return xs.map((x, i) => [x, ys[i]]);
  }
  const nuqtaDiagramma = (nuqtalar, xNomi, yNomi) => ({ tur: "nuqta", nuqtalar, x0: 0, x1: 10, xQadam: 2, y0: 0, y1: 10, qadam: 2, xNomi, oq: yNomi });

  // Nuqtali diagramma. tier 0 — x boʻyicha y ni oʻqi; tier 1 — y chegaradan yuqori nuqtalarni sana; tier 2 — bogʻliqlik turi (4 variant).
  function nuqtaTask(prev, rng, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((r) => {
      if (t === 2) {
        const shakl = pick(Object.keys(TREND), r);
        const nuqtalar = nuqtalarYasa(shakl, r, 0);
        if (!nuqtalar) return null;
        return {
          tur: "nuqta", id: `nuqta:2:${shakl}:${nuqtalar.map((p) => p[1]).join(",")}`, diagramma: nuqtaDiagramma(nuqtalar, "x", "y"), shakl,
          matn: "Nuqtalar qanday bogʻliqlikni koʻrsatadi?",
          variantlar: Object.values(TREND), javob: TREND[shakl],
          ishora: "Nuqtalar ustidan chapdan oʻngga xayolan chiziq oʻtkaz: u koʻtariladimi, tushadimi, bukiladimi yoki umuman chizib boʻlmaydimi?",
          nega: { musbat: "Chapdan oʻngga nuqtalar koʻtarilib boradi.", manfiy: "Chapdan oʻngga nuqtalar pastlab boradi.", yoq: "Nuqtalar orasidan aniq yoʻnalishli chiziq oʻtkazib boʻlmaydi.", tepalik: "Nuqtalar oʻrtada eng baland, ikki chetda past — toʻgʻri chiziq bunga mos kelmaydi." }[shakl],
          qisqa: { musbat: "Musbat bogʻliqlik.", manfiy: "Manfiy bogʻliqlik.", yoq: "Bogʻliqlik yoʻq.", tepalik: "Egri bogʻliqlik." }[shakl],
        };
      }
      const xs = tanla([1, 2, 3, 4, 5, 6, 7, 8, 9], t === 0 ? 6 : 8, r).sort((a, b) => a - b);
      const nuqtalar = xs.map((x) => [x, int(r, 1, 9)]);
      const d = nuqtaDiagramma(nuqtalar, "x", "y");
      if (t === 0) {
        const p = pick(nuqtalar, r);
        return {
          tur: "nuqta", id: `nuqta:0:${nuqtalar.map((q) => q.join("-")).join(",")}:${p[0]}`, diagramma: d, javob: p[1],
          matn: `x = ${p[0]} boʻlgan nuqtaning y qiymati nechaga teng?`,
          nega: "Pastki oʻqda x ni top, tepaga — nuqtagacha chiq, keyin chapga — y oʻqiga qara. Chiziqlar orasi 2 ga teng.",
          hisob: `Nuqta: (x = ${p[0]}; y = ${p[1]}).`, qisqa: `(${p[0]}; ${p[1]})`,
        };
      }
      const K = pick([4, 6], r);
      const soni = nuqtalar.filter((p) => p[1] > K).length;
      if (nuqtalar.some((p) => p[1] === K) || soni < 1 || soni > 6) return null;
      return {
        tur: "nuqta", id: `nuqta:1:${nuqtalar.map((q) => q.join("-")).join(",")}:${K}`, diagramma: d, javob: soni, chegara: K,
        matn: `y qiymati ${K} dan katta boʻlgan nechta nuqta bor?`,
        nega: `y oʻqida ${K} chizigʻini top: undan yuqorida turgan nuqtalarni sana.`,
        hisob: `${K} chizigʻidan yuqorida ${soni} ta nuqta: ` + nuqtalar.filter((p) => p[1] > K).map((p) => `(${p[0]}; ${p[1]})`).join(", ") + ".",
        qisqa: `${soni} ta nuqta`,
      };
    }, prev, rng);
  }

  // Aldamchi diagramma: oʻq 0 dan emas, y0 dan boshlangan — kichik farq katta koʻrinadi.
  // tier 0 — haqiqiy farq; tier 1 — ustun balandliklari necha marta farq qilib koʻrinadi; tier 2 — haqiqatda necha foiz katta.
  const FOIZ = [
    { a: 20, y0: 18, qadam: 2, y1: 28, foizlar: [5, 10, 15, 20, 25, 30] },
    { a: 25, y0: 24, qadam: 2, y1: 32, foizlar: [4, 8, 12, 16, 20] },
    { a: 40, y0: 38, qadam: 2, y1: 50, foizlar: [5, 10, 15, 20] },
    { a: 50, y0: 48, qadam: 2, y1: 58, foizlar: [4, 6, 8, 10, 12] },
    { a: 80, y0: 76, qadam: 4, y1: 96, foizlar: [5, 10, 15] },
    { a: 100, y0: 98, qadam: 2, y1: 114, foizlar: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  ];
  const nisbat = (b, a) => son(String(Number((b / a).toFixed(2))));

  function aldamchiTask(prev, rng, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((r) => {
      if (t === 2) {
        const f = pick(FOIZ, r);
        const p = pick(f.foizlar, r);
        const b = f.a + (f.a * p) / 100;
        const nomlar = ["Yanvar", "Fevral"];
        const marta = nisbat(b - f.y0, f.a - f.y0);
        return {
          tur: "aldamchi", id: `aldamchi:2:${f.a}:${p}`, javob: p, a: f.a, b,
          diagramma: { tur: "ustun", nomlar, qiymatlar: [f.a, b], y0: f.y0, y1: f.y1, qadam: f.qadam, oq: "Oylik sotuv (ming dona)", ikkiRang: true },
          matn: `«${nomlar[1]}» qiymati «${nomlar[0]}» qiymatidan haqiqatda necha foiz katta?`,
          nega: "Ustun balandligiga emas, oʻqdagi sonlarga qara: oʻq 0 dan boshlanmagan. Foiz = farq ÷ boshlangʻich qiymat × 100.",
          hisob: `Qiymatlar: ${f.a} va ${son(b)}. (${son(b)} − ${f.a}) ÷ ${f.a} × 100 = ${p} %. Ustun esa ${marta} marta baland koʻrinadi — oʻq ${f.y0} dan boshlangan.`,
          qisqa: `Haqiqatda ${p} % katta.`,
        };
      }
      const y0 = 10 * int(r, 4, 9);
      const nomlar = ["1-model", "2-model"];
      const oq = "Aniqlik (%)";
      if (t === 0) {
        const qadam = 2;
        const a = y0 + int(r, 1, 3);
        const b = a + int(r, 2, 6);
        if (b > y0 + 9) return null;
        return {
          tur: "aldamchi", id: `aldamchi:0:${y0}:${a}:${b}`, javob: b - a, a, b,
          diagramma: { tur: "ustun", nomlar, qiymatlar: [a, b], y0, y1: y0 + 10, qadam, oq, ikkiRang: true },
          matn: `«${nomlar[0]}» va «${nomlar[1]}» aniqliklarining haqiqiy farqi nechaga teng?`,
          nega: "Ustun balandligiga emas, chapdagi oʻq sonlariga qara: har ustun qiymatini oʻqi va ayir. Chiziqlar orasi 2 ga teng.",
          hisob: `${nomlar[0]} — ${a} %, ${nomlar[1]} — ${b} %. Farq = ${b} − ${a} = ${b - a}. Oʻq ${y0} dan boshlangani uchun farq katta koʻrinadi.`,
          qisqa: `${b} − ${a} = ${b - a}; oʻq ${y0} dan boshlangan.`,
        };
      }
      const birlik = int(r, 1, 3);
      const K = int(r, 2, 5);
      const a = y0 + birlik;
      const b = y0 + K * birlik;
      if (b > y0 + 10 || b > 100) return null;
      return {
        tur: "aldamchi", id: `aldamchi:1:${y0}:${a}:${b}`, javob: K, a, b,
        diagramma: { tur: "ustun", nomlar, qiymatlar: [a, b], y0, y1: y0 + 10, qadam: 2, oq, ikkiRang: true },
        matn: `Rasmda «${nomlar[1]}» ustuni «${nomlar[0]}» ustunidan necha marta baland chizilgan?`,
        nega: `Ustun balandligi oʻqning pastki chizigʻidan (${y0}) sanaladi: har ustun undan necha birlik koʻtarilgan?`,
        hisob: `Balandliklar: ${b} − ${y0} = ${b - y0} va ${a} − ${y0} = ${a - y0}; ${b - y0} ÷ ${a - y0} = ${K} marta. Haqiqiy qiymatlar esa ${b} ÷ ${a} ≈ ${nisbat(b, a)} marta farq qiladi.`,
        qisqa: `Rasmda ${K} marta, haqiqatda ≈ ${nisbat(b, a)} marta.`,
      };
    }, prev, rng);
  }

  // ---------- 3-bosqich: bogʻliqlik ≠ sabab ----------
  const TUSHUNTIRISH = {
    sabab: "Sabab-oqibat: buni nazoratli tajriba koʻrsatdi",
    teskari: "Teskari sabab: yoʻnalish daʼvodagining aksi",
    uchinchi: "Uchinchi omil: ikkalasiga boshqa narsa taʼsir qiladi",
    tasodif: "Tasodifiy mos kelish: oʻzaro aloqasi yoʻq",
  };

  // Hamma holatlar — shartli (oʻylab topilgan) kuzatuvlar; real statistika emas.
  const HOLATLAR = [
    { kalit: "muzqaymoq", tur: "uchinchi", matn: "Muzqaymoq koʻp sotilgan kunlarda suvda choʻkish hodisalari ham koʻp boʻladi.", omil: "Issiq havo: odamlar ham muzqaymoq oladi, ham koʻproq choʻmiladi" },
    { kalit: "oyoq", tur: "uchinchi", matn: "Boshlangʻich sinflarda oyoq kiyimi oʻlchami katta oʻquvchilar matnni tezroq oʻqiydi.", omil: "Yosh: katta bolaning oyogʻi ham katta, oʻqishi ham tez" },
    { kalit: "yongin", tur: "uchinchi", matn: "Oʻt oʻchirish mashinalari koʻp kelgan yongʻinlarda zarar ham katta boʻladi.", omil: "Yongʻin kattaligi: katta yongʻinga koʻp mashina keladi, zarari ham koʻp" },
    { kalit: "soyabon", tur: "uchinchi", matn: "Soyabon koʻp sotilgan kunlarda yoʻl-transport hodisalari ham koʻp boʻladi.", omil: "Yomgʻir: soyabon ham olinadi, yoʻl ham sirpanchiq boʻladi" },
    { kalit: "javon", tur: "uchinchi", matn: "Uyida kitob javoni koʻp boʻlgan oʻquvchilarning baholari oʻrtacha yuqoriroq.", omil: "Oiladagi oʻqish muhiti: kitob ham koʻp, oʻqishga eʼtibor ham koʻp" },
    { kalit: "konditsioner", tur: "uchinchi", matn: "Konditsionerlar koʻp ishlagan oylarda sovuq ichimliklar ham koʻp sotiladi.", omil: "Issiq mavsum: konditsioner ham yoqiladi, chanqoq ham kuchayadi" },
    { kalit: "repetitor", tur: "teskari", matn: "Repetitorga qatnaydigan oʻquvchilarning baholari oʻrtacha pastroq. Daʼvo: «Repetitor bahoni tushiradi».", izoh: "Aksincha: bahosi past boʻlgani uchun repetitorga boradi." },
    { kalit: "shifokor", tur: "teskari", matn: "Shifokorga tez-tez boradigan odamlar koʻproq kasal boʻladi. Daʼvo: «Shifokorga borish kasal qiladi».", izoh: "Aksincha: kasal boʻlgani uchun shifokorga boradi." },
    { kalit: "yomgir", tur: "teskari", matn: "Koʻchada soyabon ochganlar koʻp boʻlsa, yomgʻir yogʻayotgan boʻladi. Daʼvo: «Soyabon ochilsa, yomgʻir yogʻadi».", izoh: "Aksincha: yomgʻir yoqqani uchun soyabon ochiladi." },
    { kalit: "chiroq", tur: "teskari", matn: "Koʻcha chiroqlari yongan paytda atrof qorongʻi boʻladi. Daʼvo: «Chiroq yonsa, qorongʻi tushadi».", izoh: "Aksincha: qorongʻi tushgani uchun chiroq yoqiladi." },
    { kalit: "qor", tur: "tasodif", matn: "Uch yil ketma-ket birinchi qor yoqqan kuni sinfda matematikadan nazorat ishi boʻldi.", izoh: "Uchta holat — juda kam; qor va nazorat ishi jadvali bir-biriga bogʻliq emas." },
    { kalit: "paypoq", tur: "tasodif", matn: "Jamoa oxirgi toʻrt oʻyinda sardor koʻk paypoq kiyganida yutdi.", izoh: "Toʻrtta oʻyin — juda kam; paypoq rangi oʻyin natijasiga taʼsir qila olmaydi." },
    { kalit: "kino", tur: "tasodif", matn: "Shaharda yangi kinoteatr ochilgan yili olma hosili ham oshdi.", izoh: "Bitta yil — bitta kuzatuv; kinoteatr bilan hosil orasida aloqa yoʻq." },
    { kalit: "raqam", tur: "tasodif", matn: "Aziz uch marta ketma-ket 7-raqamli partada oʻtirganida nazorat ishidan 5 oldi.", izoh: "Uchta holat — juda kam; parta raqami bilimga taʼsir qilmaydi." },
    { kalit: "osimlik", tur: "sabab", matn: "Tajriba: bir xil ikki guruh oʻsimlikdan biriga suv quyildi, ikkinchisiga yoʻq. Suv quyilgani oʻsdi, ikkinchisi qurib qoldi.", izoh: "Guruhlar faqat suv bilan farq qilgan — demak, farqning sababi suv." },
    { kalit: "takror", tur: "sabab", matn: "Tajriba: sinf tasodifiy ikki guruhga boʻlindi. Biri soʻzlarni har kuni 10 daqiqa takrorladi, ikkinchisi yoʻq. Birinchi guruh diktantda kamroq xato qildi.", izoh: "Guruhlar tasodifiy boʻlingan va faqat takrorlash bilan farq qilgan." },
    { kalit: "batareya", tur: "sabab", matn: "Tajriba: bir xil ikki fonardan biriga yangi batareya, ikkinchisiga eski batareya qoʻyildi. Yangi batareyali fonar uzoqroq yondi.", izoh: "Fonarlar bir xil, farq faqat batareyada — demak, sababi batareya." },
    { kalit: "ogit", tur: "sabab", matn: "Tajriba: bir xil ikki paykaldan biriga oʻgʻit solindi, ikkinchisiga yoʻq; qolgan hamma sharoit bir xil. Oʻgʻitlangan paykal koʻproq hosil berdi.", izoh: "Faqat bitta sharoit oʻzgartirilgan — farqning sababi oʻsha." },
  ];
  const UCHINCHI = HOLATLAR.filter((x) => x.tur === "uchinchi");

  // tier 0 — bogʻliqlikni qaysi uchinchi omil tushuntiradi; tier 1–2 — toʻrt tushuntirishdan qaysi biri toʻgʻri.
  function sababTask(prev, rng, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((r) => {
      if (t === 0) {
        const x = pick(UCHINCHI, r);
        const boshqa = tanla(UCHINCHI.filter((y) => y !== x), 3, r).map((y) => y.omil);
        return {
          tur: "sabab", id: `sabab:0:${x.kalit}:${boshqa.slice().sort().join("|")}`, holat: x.matn, holatTuri: x.tur,
          matn: "Bu bogʻliqlikni qaysi uchinchi omil tushuntiradi?",
          variantlar: aralash([x.omil, ...boshqa], r), javob: x.omil,
          ishora: "Ikkala hodisani ham bir vaqtda oʻzgartira oladigan narsani qidir.",
          nega: "Ikki hodisa birga oʻzgaradi, lekin biri ikkinchisiga sabab emas — ikkalasini uchinchi omil boshqaradi.",
          qisqa: "Uchinchi omil ikkalasini ham oʻzgartiradi.",
        };
      }
      const x = pick(HOLATLAR, r);
      return {
        tur: "sabab", id: `sabab:1:${x.kalit}`, holat: x.matn, holatTuri: x.tur,
        matn: "Bu holatning eng toʻgʻri tushuntirishi qaysi?",
        variantlar: Object.values(TUSHUNTIRISH), javob: TUSHUNTIRISH[x.tur],
        ishora: "Uch savol: tajriba oʻtkazilganmi? Yoʻnalish teskari boʻlishi mumkinmi? Ikkalasiga taʼsir qiladigan boshqa narsa bormi?",
        nega: x.tur === "uchinchi" ? x.omil + "." : x.izoh,
        qisqa: TUSHUNTIRISH[x.tur].split(":")[0] + ".",
      };
    }, prev, rng);
  }

  // Soʻrovnoma natijasi (sonlar yasaladi) va toʻrt xulosa: toʻgʻri, sabab daʼvosi, har bir odamga yoyish, soʻralmaganlarga yoyish.
  const kasr = (n) => son((n / 10).toFixed(1));
  const SOROV = [
    {
      kalit: "uyqu", yasa: (r) => { const b = int(r, 35, 39); return { a: b + int(r, 3, 8), b }; }, korsat: kasr,
      matn: (n, a, b) => `Soʻrovnoma (${n} oʻquvchi): kuniga 8 soatdan koʻp uxlaydiganlarning oʻrtacha bahosi ${a}, kam uxlaydiganlarniki ${b}.`,
      togri: "Bu guruhda koʻp uxlaydiganlarning oʻrtacha bahosi yuqoriroq",
      sabab: "Uyquni koʻpaytirish bahoni albatta oshiradi",
      shaxs: "Koʻp uxlaydigan har bir oʻquvchi kam uxlaydigandan yaxshi oʻqiydi",
      umum: "Mamlakatdagi barcha oʻquvchilarda ham aynan shunday",
    },
    {
      kalit: "nonushta", yasa: (r) => { const b = int(r, 55, 70); return { a: b + int(r, 4, 12), b }; }, korsat: String,
      matn: (n, a, b) => `Soʻrovnoma (${n} oʻquvchi): nonushta qiladiganlar testdan oʻrtacha ${a} ball, qilmaydiganlar ${b} ball olgan.`,
      togri: "Bu guruhda nonushta qiladiganlarning oʻrtacha bali yuqoriroq",
      sabab: "Nonushta qilish test balini albatta oshiradi",
      shaxs: "Nonushta qiladigan har bir oʻquvchi qilmaydigandan koʻp ball oladi",
      umum: "Boshqa barcha maktablarda ham natija aynan shunday",
    },
    {
      kalit: "sport", yasa: (r) => { const a = int(r, 3, 7); return { a, b: a + int(r, 2, 6) }; }, korsat: String,
      matn: (n, a, b) => `Soʻrovnoma (${n} oʻquvchi): sport toʻgaragiga qatnaydiganlar yiliga oʻrtacha ${a} kun, qatnamaydiganlar ${b} kun dars qoldirgan.`,
      togri: "Bu guruhda toʻgarakka qatnaydiganlar oʻrtacha kamroq dars qoldirgan",
      sabab: "Sport toʻgaragi dars qoldirishni albatta kamaytiradi",
      shaxs: "Toʻgarakka qatnaydigan har bir oʻquvchi qatnamaydigandan kam dars qoldiradi",
      umum: "Barcha yoshdagi odamlarda ham aynan shunday",
    },
    {
      kalit: "ekran", yasa: (r) => { const a = int(r, 1, 3); return { a, b: a + int(r, 1, 3) }; }, korsat: String,
      matn: (n, a, b) => `Soʻrovnoma (${n} oʻquvchi): kuniga 3 soatdan koʻp telefon ishlatadiganlar oyiga oʻrtacha ${a} ta, kam ishlatadiganlar ${b} ta kitob oʻqigan.`,
      togri: "Bu guruhda telefonni kam ishlatadiganlar oʻrtacha koʻproq kitob oʻqigan",
      sabab: "Telefon kitob oʻqishni albatta kamaytiradi",
      shaxs: "Telefonni kam ishlatadigan har bir oʻquvchi koʻproq kitob oʻqiydi",
      umum: "Butun dunyodagi oʻquvchilarda ham aynan shunday",
    },
    {
      kalit: "musiqa", yasa: (r) => { const b = int(r, 40, 60); return { a: b + int(r, 5, 20), b }; }, korsat: String,
      matn: (n, a, b) => `Soʻrovnoma (${n} oʻquvchi): musiqa tinglab dars qiladiganlar uy vazifasiga oʻrtacha ${a} daqiqa, tinglamaydiganlar ${b} daqiqa sarflagan.`,
      togri: "Bu guruhda musiqa tinglaydiganlar uy vazifasiga oʻrtacha koʻproq vaqt sarflagan",
      sabab: "Musiqa uy vazifasini albatta sekinlashtiradi",
      shaxs: "Musiqa tinglaydigan har bir oʻquvchi sekinroq ishlaydi",
      umum: "Barcha sinflarda va barcha maktablarda ham aynan shunday",
    },
  ];
  const XULOSA_SAVOL = {
    togri: "Qaysi xulosa maʼlumotdan haqiqatan kelib chiqadi?",
    sabab: "Qaysi xulosa bogʻliqlikni isbotsiz sabab deb ataydi?",
    shaxs: "Qaysi xulosa guruhning oʻrtacha natijasini har bir odamga yoyadi?",
    umum: "Qaysi xulosa soʻralmagan odamlarga ham yoyilgan?",
  };
  const XULOSA_NEGA = {
    togri: "Maʼlumot faqat shu guruhdagi ikki oʻrtachani solishtiradi — bundan ortigʻini aytmaydi.",
    sabab: "Soʻrovnoma faqat bogʻliqlikni koʻrsatadi. Sababni isbotlash uchun tajriba kerak: uchinchi omil boʻlishi mumkin.",
    shaxs: "Oʻrtacha — guruh haqida. Alohida odam oʻrtachadan yuqori ham, past ham boʻlishi mumkin.",
    umum: "Soʻralganlar — bitta kichik guruh. Boshqalar haqida xulosa qilish uchun ulardan ham maʼlumot kerak.",
  };

  // tier 0 — toʻgʻri xulosa; tier 1 — ortiqcha umumlashtirilgan xulosa (shaxs / umum); tier 2 — toʻrt turdan istalgani.
  function xulosaTask(prev, rng, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((r) => {
      const s = pick(SOROV, r);
      const n = 10 * int(r, 3, 9);
      const q = s.yasa(r);
      const nishon = t === 0 ? "togri" : t === 1 ? pick(["shaxs", "umum"], r) : pick(["togri", "sabab", "shaxs", "umum"], r);
      return {
        tur: "xulosa", id: `xulosa:${nishon}:${s.kalit}:${n}:${q.a}:${q.b}`, nishon, sorov: s.kalit, n, a: q.a, b: q.b,
        holat: s.matn(n, s.korsat(q.a), s.korsat(q.b)),
        matn: XULOSA_SAVOL[nishon],
        variantlar: aralash([s.togri, s.sabab, s.shaxs, s.umum], r), javob: s[nishon],
        ishora: "Har xulosani maʼlumot bilan solishtir: unda «albatta», «har bir», «barcha» kabi maʼlumotda yoʻq narsa bormi?",
        nega: XULOSA_NEGA[nishon],
        qisqa: { togri: "Maʼlumot aynan shuni aytadi.", sabab: "Bogʻliqlik — hali sabab emas.", shaxs: "Oʻrtacha — har bir odam emas.", umum: "Guruh — hamma emas." }[nishon],
      };
    }, prev, rng);
  }

  // Nuqtali diagramma + xulosa tanlash: bogʻliqlik yoʻnalishi toʻgʻri oʻqiladi, lekin sabab daʼvo qilinmaydi.
  const JUFTLIK = [
    { x: "Mashq (soat/hafta)", y: "Test bali (10 ballik)", X: "Mashq vaqti", Y: "test bali", kop: "yuqoriroq", kam: "pastroq" },
    { x: "Ekran vaqti (soat/kun)", y: "Uyqu (soat/kun)", X: "Ekran vaqti", Y: "uyqu", kop: "koʻproq", kam: "kamroq" },
    { x: "Oʻqilgan kitoblar (oyiga)", y: "Insho bali (10 ballik)", X: "Oʻqilgan kitoblar soni", Y: "insho bali", kop: "yuqoriroq", kam: "pastroq" },
    { x: "Yoʻlga ketgan vaqt (soat/kun)", y: "Kayfiyat bahosi (10 ballik)", X: "Yoʻlga ketgan vaqt", Y: "kayfiyat bahosi", kop: "yuqoriroq", kam: "pastroq" },
  ];

  function diagXulosaTask(prev, rng, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((r) => {
      const j = pick(JUFTLIK, r);
      const shakl = pick(["musbat", "manfiy", "yoq"], r);
      const nuqtalar = nuqtalarYasa(shakl, r, t === 0 ? 0 : 1);
      if (!nuqtalar) return null;
      const V = {
        musbat: `${j.X} koʻp boʻlganda ${j.Y} odatda ${j.kop}`,
        manfiy: `${j.X} koʻp boʻlganda ${j.Y} odatda ${j.kam}`,
        yoq: `${j.X} bilan ${j.Y} orasida bogʻliqlik koʻrinmaydi`,
        sabab: `${j.X} oʻzgarsa, ${j.Y} albatta oʻzgaradi — sababi isbotlandi`,
      };
      return {
        tur: "diagXulosa", id: `diagXulosa:${t}:${shakl}:${j.x}:${nuqtalar.map((p) => p[1]).join(",")}`, shakl,
        diagramma: nuqtaDiagramma(nuqtalar, j.x, j.y),
        holat: "Shartli maʼlumot: har nuqta — bir oʻquvchi.",
        matn: "Diagrammadan qaysi xulosa kelib chiqadi?",
        variantlar: aralash(Object.values(V), r), javob: V[shakl],
        ishora: "Avval yoʻnalishni aniqla: nuqtalar chapdan oʻngga koʻtariladimi, tushadimi yoki tarqoqmi? Keyin oʻyla: diagramma sababni koʻrsata oladimi?",
        nega: { musbat: "Nuqtalar chapdan oʻngga koʻtariladi — bogʻliqlik musbat.", manfiy: "Nuqtalar chapdan oʻngga pastlaydi — bogʻliqlik manfiy.", yoq: "Nuqtalar tarqoq — aniq yoʻnalish yoʻq." }[shakl]
          + " Nuqtali diagramma bogʻliqlikni koʻrsatadi, sababni emas.",
        qisqa: { musbat: "Musbat bogʻliqlik — sabab isbotlanmagan.", manfiy: "Manfiy bogʻliqlik — sabab isbotlanmagan.", yoq: "Bogʻliqlik koʻrinmaydi." }[shakl],
      };
    }, prev, rng);
  }

  // Moda va oraliq — navbatdagi bitta oʻrinda tasodifiy almashadi
  const modaOraliqTask = (prev, rng, tier) => (rng() < 0.5 ? modaTask : oraliqTask)(prev, rng, tier);

  const BOSQICH1 = [ortachaTask, medianaTask, modaOraliqTask, chetTask];
  const BOSQICH2 = [ustunTask, chiziqTask, aldamchiTask, nuqtaTask];
  const BOSQICH3 = [sababTask, diagXulosaTask, xulosaTask];

  // n — nechanchi toʻgʻri javob (mashq turi navbati)
  const navbat = (bank) => (prev, rng, tier, n) => bank[(n || 0) % bank.length](prev, rng, tier);

  const api = {
    KONTEKST, TREND, TUSHUNTIRISH, HOLATLAR, SOROV, FOIZ, JUFTLIK, XULOSA_SAVOL, BOSQICH1, BOSQICH2, BOSQICH3,
    yigindi, ortacha, tartib, mediana, modalar, oraliq, korrelyatsiya, son, royxat, ulush, aralash, nuqtalarYasa, nuqtaDiagramma,
    ortachaTask, medianaTask, modaTask, oraliqTask, chetTask, modaOraliqTask,
    ustunTask, chiziqTask, nuqtaTask, aldamchiTask,
    sababTask, xulosaTask, diagXulosaTask,
    bosqich1Task: navbat(BOSQICH1), bosqich2Task: navbat(BOSQICH2), bosqich3Task: navbat(BOSQICH3),
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
