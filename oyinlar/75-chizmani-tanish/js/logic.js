// 75-o'yin: chizmani tanish — 8×8 katakli chizma sonlar jadvali sifatida, ikki chizma farqi (Hamming masofasi),
// eng yaqin namuna (nearest neighbour) bo'yicha tasniflash, aniqlik va chalkashlik jadvali.
// Ekransiz sof mantiq; Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const N = 8;
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

  // Urug'li tasodifiy sonlar (ko'rsatish qismidagi chizmalar har safar bir xil bo'lishi uchun)
  function lcg(seed) {
    let s = seed >>> 0;
    return () => {
      // mulberry32: 32 bitli butun arifmetika (oddiy LCG ko'paytmasi 2^53 dan oshib, qisqa siklga tushib qoladi)
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Bir xil misol qaytarilmaydi (QOIDALAR 4.3). make null qaytarsa (shart bajarilmadi) — qayta urinadi.
  function pickNew(make, prev, r) {
    // tarix — shu mashqda chiqqan vazifalar: ular ham qaytarilmaydi (prev orqali uzatiladi, generator sofligicha qoladi)
    const tarix = prev ? (prev.tarix || []).concat(prev.id).slice(-40) : [];
    let zaxira = null;
    for (let k = 0; k < 600; k++) {
      const task = make(r);
      if (!task) continue;
      task.tarix = tarix;
      if (!tarix.includes(task.id)) return task;
      if (!prev || task.id !== prev.id) zaxira = task;
    }
    if (zaxira) return zaxira;
    throw new Error("Misol yasab boʻlmadi");
  }

  // ---------- Sinflar va namunalar ----------
  const SINFLAR = ["doira", "kvadrat", "uchburchak", "xoch", "chiziq"];

  // "#" — bo'yalgan katak (1), "." — bo'sh (0)
  const parse = (rows) => rows.join("").split("").map((c) => (c === "#" ? 1 : 0));

  const RASMLAR = {
    doira: [
      ["..####..", ".#....#.", "#......#", "#......#", "#......#", "#......#", ".#....#.", "..####.."],
      ["........", "..####..", ".#....#.", ".#....#.", ".#....#.", ".#....#.", "..####..", "........"],
      ["...##...", ".##..##.", ".#....#.", "#......#", "#......#", ".#....#.", ".##..##.", "...##..."],
    ],
    kvadrat: [
      ["########", "#......#", "#......#", "#......#", "#......#", "#......#", "#......#", "########"],
      ["........", ".######.", ".#....#.", ".#....#.", ".#....#.", ".#....#.", ".######.", "........"],
      ["#####...", "#...#...", "#...#...", "#...#...", "#####...", "........", "........", "........"],
    ],
    uchburchak: [
      ["........", "...##...", "...##...", "..#..#..", "..#..#..", ".#....#.", ".#....#.", "########"],
      ["........", "........", "...#....", "..#.#...", ".#...#..", "#######.", "........", "........"],
      ["#.......", "##......", "#.#.....", "#..#....", "#...#...", "#....#..", "#.....#.", "########"],
    ],
    xoch: [
      ["...##...", "...##...", "...##...", "########", "########", "...##...", "...##...", "...##..."],
      ["#......#", ".#....#.", "..#..#..", "...##...", "...##...", "..#..#..", ".#....#.", "#......#"],
      ["...#....", "...#....", "...#....", "########", "...#....", "...#....", "...#....", "...#...."],
    ],
    chiziq: [
      ["........", "........", "........", "########", "........", "........", "........", "........"],
      ["....#...", "....#...", "....#...", "....#...", "....#...", "....#...", "....#...", "....#..."],
      ["#.......", ".#......", "..#.....", "...#....", "....#...", ".....#..", "......#.", ".......#"],
    ],
  };

  const NAMUNALAR = [];
  for (const sinf of SINFLAR) {
    RASMLAR[sinf].forEach((rows, k) => NAMUNALAR.push({ id: `${sinf}-${k + 1}`, sinf, tartib: k, katak: parse(rows) }));
  }
  const namuna = (id) => NAMUNALAR.find((n) => n.id === id);
  // Har sinfdan birinchi k ta namuna (k = 1…3); sinflar berilsa — faqat o'shalar
  const namunaToplam = (k, sinflar) => NAMUNALAR.filter((n) => n.tartib < k && (!sinflar || sinflar.includes(n.sinf)));

  // ---------- Chizma = sonlar jadvali ----------
  const kalit = (katak) => katak.join("");
  const qator = (katak, y) => katak.slice(y * N, (y + 1) * N);
  const boyalgan = (katak) => katak.reduce((s, v) => s + v, 0);

  // Mos kelmagan kataklar indekslari va ularning soni (Hamming masofasi)
  function farqlar(a, b) {
    const out = [];
    for (let i = 0; i < N * N; i++) if (a[i] !== b[i]) out.push(i);
    return out;
  }
  function hamming(a, b) {
    let d = 0;
    for (let i = 0; i < N * N; i++) if (a[i] !== b[i]) d++;
    return d;
  }
  // Har qatordagi farqlar soni: [0, 1, 0, 2, …]
  function qatorFarqlari(a, b) {
    const out = new Array(N).fill(0);
    for (const i of farqlar(a, b)) out[Math.floor(i / N)]++;
    return out;
  }

  // n ta har xil katakni teskarisiga o'zgartiradi
  function buz(katak, r, n) {
    const out = katak.slice();
    const joylar = aralash(out.map((_, i) => i), r).slice(0, n);
    for (const i of joylar) out[i] = 1 - out[i];
    return out;
  }

  // Chizmani (dx, dy) katakka suradi; chetdan chiqqani yo'qoladi
  function siljit(katak, dx, dy) {
    const out = new Array(N * N).fill(0);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const nx = x + dx;
        const ny = y + dy;
        if (katak[y * N + x] && nx >= 0 && nx < N && ny >= 0 && ny < N) out[ny * N + nx] = 1;
      }
    }
    return out;
  }

  // Namunaning "qo'lda chizilgan" nusxasi: ba'zan bir katak surilgan, bir necha katak adashgan
  function variant(n, r, o) {
    let katak = n.katak;
    if (o.siljish && r() < o.siljish) {
      const yonalish = pick([[1, 0], [-1, 0], [0, 1], [0, -1]], r);
      katak = siljit(katak, yonalish[0], yonalish[1]);
    }
    katak = buz(katak, r, int(r, o.buzMin, o.buzMax));
    return { sinf: n.sinf, asl: n.id, katak };
  }

  // ---------- Eng yaqin namuna ----------
  // Har namunagacha masofa, yaqinidan uzog'iga (teng bo'lsa — ro'yxatdagi tartib saqlanadi)
  function masofalar(savol, namunalar) {
    return namunalar
      .map((n, k) => ({ namuna: n, sinf: n.sinf, masofa: hamming(savol, n.katak), k }))
      .sort((a, b) => a.masofa - b.masofa || a.k - b.k);
  }

  // Har sinfning eng yaqin namunasigacha masofa, yaqinidan uzog'iga
  function sinfMasofalari(savol, namunalar) {
    const eng = new Map();
    for (const m of masofalar(savol, namunalar)) if (!eng.has(m.sinf)) eng.set(m.sinf, m);
    return [...eng.values()].map((m) => ({ sinf: m.sinf, masofa: m.masofa, namuna: m.namuna }));
  }

  // Model javobi: eng yaqin namunaning sinfi. durang — ikki sinf bir xil masofada; zaxira — ikkinchi sinfgacha farq
  function tasnif(savol, namunalar) {
    const sinflar = sinfMasofalari(savol, namunalar);
    const bir = sinflar[0];
    const ikki = sinflar[1] || null;
    return {
      sinf: bir.sinf, masofa: bir.masofa, namuna: bir.namuna, sinflar,
      durang: !!ikki && ikki.masofa === bir.masofa,
      zaxira: ikki ? ikki.masofa - bir.masofa : null,
    };
  }

  // ---------- Sinov to'plami va aniqlik ----------
  // Har sinfdan n ta chizma: uchala namunadan navbat bilan olinadi va buziladi
  function sinovToplam(r, n, o, sinflar) {
    const out = [];
    for (const sinf of sinflar || SINFLAR) {
      const asos = NAMUNALAR.filter((x) => x.sinf === sinf);
      for (let k = 0; k < n; k++) out.push(variant(asos[k % asos.length], r, o));
    }
    return out;
  }

  // Modelni sinov to'plamida tekshirish: to'g'ri javoblar, foiz, chalkashlik jadvali (asl → model → soni)
  function baho(namunalar, sinov) {
    const sinflar = SINFLAR.filter((s) => sinov.some((x) => x.sinf === s) || namunalar.some((x) => x.sinf === s));
    const jadval = {};
    for (const a of sinflar) {
      jadval[a] = {};
      for (const b of sinflar) jadval[a][b] = 0;
    }
    let togri = 0;
    const natijalar = sinov.map((x) => {
      const t = tasnif(x.katak, namunalar);
      jadval[x.sinf][t.sinf]++;
      if (t.sinf === x.sinf) togri++;
      return { asl: x.sinf, model: t.sinf, masofa: t.masofa, katak: x.katak };
    });
    const jami = sinov.length;
    return { natijalar, togri, jami, foiz: jami ? Math.round((togri * 100) / jami) : 0, jadval, sinflar };
  }

  // Chalkashgan juftliklar: ikkala yo'nalishdagi xatolar yig'indisi, ko'pidan kamiga
  function chalkashJuftlar(jadval, sinflar) {
    const out = [];
    for (let i = 0; i < sinflar.length; i++) {
      for (let j = i + 1; j < sinflar.length; j++) {
        const a = sinflar[i];
        const b = sinflar[j];
        out.push({ a, b, ab: jadval[a][b], ba: jadval[b][a], soni: jadval[a][b] + jadval[b][a] });
      }
    }
    return out.sort((x, y) => y.soni - x.soni);
  }

  // ---------- Ko'rsatish qismlari uchun tayyor ma'lumot (hisob bilan, qo'lda yozilmagan) ----------
  // 1-bosqich: kvadrat va uning 3 katagi o'zgargan nusxasi
  function demo1() {
    const a = namuna("kvadrat-2").katak;
    const b = buz(a, lcg(11), 3);
    return { a, b, farq: farqlar(a, b) };
  }

  // 2-bosqich: yangi chizma va uchta namuna (har biri boshqa sinfdan)
  function demo2() {
    const savol = buz(namuna("doira-3").katak, lcg(5), 3);
    const namunalar = [namuna("kvadrat-1"), namuna("doira-1"), namuna("xoch-2")];
    return { savol, namunalar, natija: tasnif(savol, namunalar) };
  }

  // 3-bosqich: 25 ta sinov chizmasi (har sinfdan 5 ta) — namunalar soni tajribasi uchun
  const SINOV = sinovToplam(lcg(77), 5, { buzMin: 2, buzMax: 6, siljish: 0.4 });
  const tajriba = (k) => baho(namunaToplam(k), SINOV);

  // ---------- 1-bosqich: rasm — sonlar jadvali ----------
  // Sonlar jadvali berilgan — qaysi chizma? tier 0 — boshqa sinflar; tier 1 — shu sinfning boshqa namunalari; tier 2 — 2–4 katak farqli nusxalar
  function jadvalTask(prev, r, tier) {
    return pickNew((rr) => {
      const t = tier || 0;
      const asos = pick(NAMUNALAR, rr);
      const togri = buz(asos.katak, rr, int(rr, 0, 2));
      let boshqa;
      if (t === 0) {
        boshqa = aralash(SINFLAR.filter((s) => s !== asos.sinf), rr).slice(0, 3).map((s) => pick(NAMUNALAR.filter((n) => n.sinf === s), rr).katak);
      } else if (t === 1) {
        const oz = NAMUNALAR.filter((n) => n.sinf === asos.sinf && n.id !== asos.id).map((n) => buz(n.katak, rr, int(rr, 0, 1)));
        boshqa = oz.concat([buz(asos.katak, rr, int(rr, 5, 7))]);
      } else {
        boshqa = [0, 1, 2].map(() => buz(togri, rr, int(rr, 2, 4)));
      }
      const hammasi = [togri].concat(boshqa);
      if (new Set(hammasi.map(kalit)).size !== 4) return null;
      const variantlar = aralash(hammasi, rr);
      const javob = variantlar.findIndex((v) => kalit(v) === kalit(togri));
      return {
        tur: "jadval", id: `jadval:${kalit(togri)}:${javob}`, jadval: togri, variantlar, javob,
        matn: "Kompyuter xotirasida rasm shu sonlar jadvali koʻrinishida turibdi. Bu qaysi chizma?",
        ishora: "Bitta qatorni tanla: undagi 1 lar oʻrnini har variantning shu qatori bilan solishtir.",
        nega: t === 2
          ? "Variantlar bir necha katak bilan farq qiladi — faqat qatorma-qator solishtirish aniq javob beradi."
          : "1 — boʻyalgan katak, 0 — boʻsh katak. Jadval va chizma — bitta maʼlumotning ikki koʻrinishi.",
      };
    }, prev, r);
  }

  // Ikki chizma nechta katakda farq qiladi? tier 0 — 2–4; tier 1 — 5–8; tier 2 — 7–11 va ikkalasi sonlar jadvali ko'rinishida
  function farqTask(prev, r, tier) {
    return pickNew((rr) => {
      const t = tier || 0;
      const asos = pick(NAMUNALAR, rr);
      const a = buz(asos.katak, rr, int(rr, 0, 2));
      const d = t === 0 ? int(rr, 2, 4) : t === 1 ? int(rr, 5, 8) : int(rr, 7, 11);
      const b = buz(a, rr, d);
      const satrlar = qatorFarqlari(a, b);
      return {
        tur: "farq", id: `farq:${kalit(a)}:${kalit(b)}`, a, b, javob: d, satrlar,
        korinish: t === 2 ? "son" : "rasm",
        matn: t === 2
          ? "Ikki sonlar jadvali nechta katakda farq qiladi (Hamming masofasi)?"
          : "A va B chizmalar nechta katakda farq qiladi?",
        nega: "Farq bor qatorlar belgilandi. Har birida mos kelmagan kataklarni sanab, qoʻsh.",
        hisob: `${satrlar.filter((x) => x > 0).join(" + ")} = ${d}`,
      };
    }, prev, r);
  }

  // ---------- 2-bosqich: eng yaqin namuna ----------
  // Yangi chizma va namunalar to'plami. tier 0 — 4 namuna (4 sinf); tier 1 — 6; tier 2 — 8. Asl namunaning o'zi to'plamga kirmaydi.
  function savolYasa(rr, t) {
    const asl = pick(NAMUNALAR, rr);
    const savol = variant(asl, rr, { buzMin: 1, buzMax: 3 + t, siljish: t ? 0.3 : 0 });
    const qolgan = NAMUNALAR.filter((n) => n.id !== asl.id);
    let toplam;
    if (t === 0) {
      const sinflar = [asl.sinf].concat(aralash(SINFLAR.filter((s) => s !== asl.sinf), rr).slice(0, 3));
      toplam = sinflar.map((s) => pick(qolgan.filter((n) => n.sinf === s), rr));
    } else {
      toplam = aralash(qolgan, rr).slice(0, t === 1 ? 6 : 8);
    }
    toplam = aralash(toplam, rr);
    const natija = tasnif(savol.katak, toplam);
    const qatorlar = toplam.map((n) => ({ id: n.id, sinf: n.sinf, katak: n.katak, masofa: hamming(savol.katak, n.katak) }));
    return { asl, savol: savol.katak, toplam, natija, qatorlar };
  }

  // Model qaysi sinfni aytadi? (masofalar yozilgan — solishtirish kerak)
  function sinfTask(prev, r, tier) {
    return pickNew((rr) => {
      const t = tier || 0;
      const s = savolYasa(rr, t);
      if (s.natija.durang) return null;
      // Qiyinroq zinada farq kichik: bir qarashda bilinmaydi
      if (t >= 1 && s.natija.zaxira > 4) return null;
      return {
        tur: "sinf", id: `sinf:${kalit(s.savol)}:${s.qatorlar.map((q) => q.id).join(",")}`,
        savol: s.savol, qatorlar: s.qatorlar, variantlar: SINFLAR.slice(), javob: s.natija.sinf, masofa: s.natija.masofa,
        matn: "Yangi chizma va namunalargacha masofalar. Eng yaqin namuna usulida model qaysi sinfni aytadi?",
        ishora: "Model faqat bitta narsaga qaraydi: qaysi namunagacha masofa eng kichik.",
        nega: `Eng kichik masofa — ${s.natija.masofa}, u «${s.natija.sinf}» namunasiga tegishli. Sinfdagi namunalar soni emas, eng yaqini hal qiladi.`,
      };
    }, prev, r);
  }

  // Model javobi bilan ikkinchi o'rindagi sinf orasidagi farq. tier 2 — eng yaqin ikki namuna bitta sinfdan (tuzoq)
  function zaxiraTask(prev, r, tier) {
    return pickNew((rr) => {
      const t = tier || 0;
      const s = savolYasa(rr, t);
      const z = s.natija.zaxira;
      if (s.natija.durang || z == null || z < 1 || z > 20) return null;
      const yaqin = masofalar(s.savol, s.toplam);
      if (t === 2 && yaqin[0].sinf !== yaqin[1].sinf) return null;
      const bir = s.natija.sinflar[0];
      const ikki = s.natija.sinflar[1];
      return {
        tur: "zaxira", id: `zaxira:${kalit(s.savol)}:${s.qatorlar.map((q) => q.id).join(",")}`,
        savol: s.savol, qatorlar: s.qatorlar, javob: z, birinchi: bir.sinf, ikkinchi: ikki.sinf,
        matn: "Model javobi bilan ikkinchi oʻrindagi sinf orasida masofa farqi nechta? Ikkinchi oʻrin — boshqa sinfning eng yaqin namunasi.",
        nega: "Avval har sinfning eng kichik masofasini top. Keyin ikkita eng kichigini ayir.",
        hisob: `«${bir.sinf}» — ${bir.masofa}, «${ikki.sinf}» — ${ikki.masofa}: ${ikki.masofa} − ${bir.masofa} = ${z}`,
      };
    }, prev, r);
  }

  // ---------- 3-bosqich: aniqlik va chalkash sinflar ----------
  const SHOVQIN = { buzMin: 3, buzMax: 7, siljish: 0.5 };

  // Aniqlik necha foiz? tier 0 — 5 ta natija ro'yxati; tier 1 — 10 ta; tier 2 — 20 ta chizmaning chalkashlik jadvali (3 sinf)
  function aniqlikTask(prev, r, tier) {
    return pickNew((rr) => {
      const t = tier || 0;
      const k = int(rr, 1, 3);
      let sinflar = SINFLAR.slice();
      let sinov;
      if (t === 2) {
        const tanlangan = aralash(SINFLAR, rr).slice(0, 3);
        sinflar = SINFLAR.filter((s) => tanlangan.includes(s));
        const sonlar = aralash([7, 7, 6], rr);
        sinov = [];
        sinflar.forEach((s, i) => sinov.push(...sinovToplam(rr, sonlar[i], SHOVQIN, [s])));
      } else {
        sinov = aralash(sinovToplam(rr, t === 0 ? 1 : 2, SHOVQIN), rr);
      }
      const b = baho(namunaToplam(k, sinflar), sinov);
      if (t > 0 && b.togri === b.jami) return null;
      if ((b.togri * 100) % b.jami !== 0) return null;
      return {
        tur: "aniqlik", id: `aniqlik:${t}:${k}:${b.natijalar.map((x) => kalit(x.katak).slice(0, 16) + x.model[0]).join("")}`,
        k, sinflar, natijalar: b.natijalar, jadval: b.jadval, togri: b.togri, jami: b.jami, javob: b.foiz,
        korinish: t === 2 ? "jadval" : "royxat",
        matn: t === 2
          ? "Chalkashlik jadvali: qator — asl sinf, ustun — model javobi. Modelning aniqligi necha foiz?"
          : "Har chizmaning asl sinfi va model javobi berilgan. Modelning aniqligi necha foiz?",
        nega: t === 2
          ? "Toʻgʻri javoblar diagonalda turadi (asl sinf = model javobi). Ularni qoʻshib, jami songa boʻl."
          : "Asl sinf va model javobi bir xil boʻlgan chizmalarni sana. Aniqlik = toʻgʻri ÷ jami.",
        hisob: `${b.togri} ÷ ${b.jami} = ${b.foiz}%`,
      };
    }, prev, r);
  }

  const juftKalit = (j) => `${j.a}|${j.b}`;

  // Model qaysi ikki sinfni eng ko'p chalkashtiradi? tier 0 — 4 sinf × 4; tier 1 — 4 sinf × 5; tier 2 — 5 sinf × 4
  function chalkashTask(prev, r, tier) {
    return pickNew((rr) => {
      const t = tier || 0;
      const tanlangan = aralash(SINFLAR, rr).slice(0, t === 2 ? 5 : 4);
      const sinflar = SINFLAR.filter((s) => tanlangan.includes(s));
      const k = int(rr, 1, 2);
      const sinov = sinovToplam(rr, t === 1 ? 5 : 4, SHOVQIN, sinflar);
      const b = baho(namunaToplam(k, sinflar), sinov);
      const juftlar = chalkashJuftlar(b.jadval, sinflar);
      if (juftlar[0].soni < 2 || juftlar[0].soni === juftlar[1].soni) return null;
      const eng = juftlar[0];
      const soni = t === 2 ? 5 : 4;
      const variantlar = aralash([eng].concat(aralash(juftlar.slice(1), rr).slice(0, soni - 1)), rr).map(juftKalit);
      return {
        tur: "chalkash", id: `chalkash:${k}:${sinflar.join(",")}:${sinflar.map((a) => sinflar.map((c) => b.jadval[a][c]).join("")).join("/")}`,
        k, sinflar, natijalar: b.natijalar, jadval: b.jadval, variantlar, javob: juftKalit(eng),
        matn: "Chalkashlik jadvali: qator — asl sinf, ustun — model javobi. Model qaysi ikki sinfni eng koʻp chalkashtiradi?",
        ishora: "Diagonaldan tashqaridagi sonlar — xatolar. Juftlik uchun ikkala yoʻnalishdagi xatolarni qoʻsh.",
        nega: `${eng.a} → ${eng.b}: ${eng.ab} ta, ${eng.b} → ${eng.a}: ${eng.ba} ta — jami ${eng.soni} ta xato.`,
      };
    }, prev, r);
  }

  const BOSQICH1 = [jadvalTask, farqTask];
  const BOSQICH2 = [sinfTask, zaxiraTask];
  const BOSQICH3 = [aniqlikTask, chalkashTask];
  const TUR = { jadval: jadvalTask, farq: farqTask, sinf: sinfTask, zaxira: zaxiraTask, aniqlik: aniqlikTask, chalkash: chalkashTask };

  // Mashq turlari navbat bilan: oldingi vazifa turidan keyingisi
  const navbat = (bank) => (prev, r, tier) => {
    const k = prev ? bank.indexOf(TUR[prev.tur]) : -1;
    return bank[(k + 1) % bank.length](prev, r, tier);
  };

  const api = {
    N, SINFLAR, NAMUNALAR, SINOV, BOSQICH1, BOSQICH2, BOSQICH3,
    lcg, parse, namuna, namunaToplam, kalit, qator, boyalgan, farqlar, hamming, qatorFarqlari, buz, siljit, variant,
    masofalar, sinfMasofalari, tasnif, sinovToplam, baho, chalkashJuftlar, juftKalit, demo1, demo2, tajriba,
    jadvalTask, farqTask, sinfTask, zaxiraTask, aniqlikTask, chalkashTask,
    bosqich1Task: navbat(BOSQICH1), bosqich2Task: navbat(BOSQICH2), bosqich3Task: navbat(BOSQICH3),
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
