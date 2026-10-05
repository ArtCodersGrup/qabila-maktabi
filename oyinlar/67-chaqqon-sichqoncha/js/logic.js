// 67-o'yin: chaqqon sichqoncha — maydonga joylash (ustma-ust tushmaydi, chetdan chiqmaydi), terish, sandiq va
// sudrash vazifalari, ikki marta bosishni aniqlash, "nuqta qaysi savat ustida".
// Ekransiz sof mantiq; Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const yaxlit = (v) => Math.round(v * 1000) / 1000;
  const qis = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

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

  // ---------- Maydon ----------
  // Maydon nisbati 4:3. Koordinatalar ulushda: x — maydon ENIDAN, y — BO'YIDAN, r (doira radiusi) — ENIDAN.
  // Shuning uchun bo'y bo'yicha masofa en birligiga o'tkaziladi: dy / NISBAT.
  const NISBAT = 4 / 3;
  const ORALIQ = 0.02; // ikki narsa orasidagi eng kichik bo'sh joy (en ulushi)
  const CHET = 0.01; // maydon chetidan eng kichik masofa (en ulushi)
  const BUTUN = { x0: 0, x1: 1, y0: 0, y1: 1 };

  // Ikki markaz orasidagi masofa — en birligida
  const masofa = (a, b) => Math.hypot(a.x - b.x, (a.y - b.y) / NISBAT);
  const ustmaUst = (a, b) => masofa(a, b) < a.r + b.r - 1e-9;

  // Doira sohadan (odatda butun maydondan) chiqmaganmi
  function sohada(o, soha) {
    const s = soha || BUTUN;
    const e = 1e-9;
    return o.x - o.r >= s.x0 - e && o.x + o.r <= s.x1 + e
      && o.y - o.r * NISBAT >= s.y0 - e && o.y + o.r * NISBAT <= s.y1 + e;
  }

  // Tasodifiy joylash: har doira uchun 60 ta nomzod nuqta; sig'masa — null (chaqiruvchi boshidan urinadi)
  function tasodifiyJoy(r, radiuslar, soha) {
    const s = soha || BUTUN;
    const out = [];
    for (const rad of radiuslar) {
      const rx = rad + CHET;
      const ry = (rad + CHET) * NISBAT;
      const eni = s.x1 - s.x0 - 2 * rx;
      const boyi = s.y1 - s.y0 - 2 * ry;
      if (eni < 0 || boyi < 0) return null;
      let topildi = null;
      for (let k = 0; k < 60 && !topildi; k++) {
        const nomzod = { x: yaxlit(s.x0 + rx + r() * eni), y: yaxlit(s.y0 + ry + r() * boyi), r: rad };
        if (out.every((o) => masofa(o, nomzod) >= o.r + rad + ORALIQ)) topildi = nomzod;
      }
      if (!topildi) return null;
      out.push(topildi);
    }
    return out;
  }

  // Zaxira: panjara. Katak eni eng katta doiraga yetadi, kataklar aralashtirib tanlanadi. Sig'masa — null.
  function panjaraJoy(r, radiuslar, soha) {
    const s = soha || BUTUN;
    const rad = Math.max(...radiuslar);
    const qadam = 2 * rad + ORALIQ;
    const eni = s.x1 - s.x0 - 2 * CHET; // en birligida
    const boyi = (s.y1 - s.y0) / NISBAT - 2 * CHET; // bo'y ham en birligida
    const ustun = Math.floor(eni / qadam + 1e-9);
    const qator = Math.floor(boyi / qadam + 1e-9);
    if (ustun < 1 || qator < 1 || ustun * qator < radiuslar.length) return null;
    const kataklar = [];
    for (let q = 0; q < qator; q++) for (let u = 0; u < ustun; u++) kataklar.push({ u, q });
    const dx = eni / ustun;
    const dy = boyi / qator;
    return aralash(kataklar, r).slice(0, radiuslar.length).map((k, i) => ({
      x: yaxlit(s.x0 + CHET + (k.u + 0.5) * dx),
      y: yaxlit(s.y0 + (CHET + (k.q + 0.5) * dy) * NISBAT),
      r: radiuslar[i],
    }));
  }

  // radiuslar[i] radiusli doiralarni joylaydi: ustma-ust tushmaydi (ORALIQ bilan), sohadan chiqmaydi.
  // 40 marta tasodifiy urinish, keyin panjara; shunda ham sig'masa — xato (cheksiz sikl yo'q).
  function joyla(r, radiuslar, soha) {
    const s = soha || BUTUN;
    for (let k = 0; k < 40; k++) {
      const out = tasodifiyJoy(r, radiuslar, s);
      if (out) return out;
    }
    const out = panjaraJoy(r, radiuslar, s);
    if (out) return out;
    throw new Error("Narsalar maydonga sigʻmadi");
  }

  // Vazifa id si uchun: narsaning joyi (yuzdan bir aniqlikda)
  const iz = (o) => Math.round(o.x * 100) + "." + Math.round(o.y * 100);

  // ---------- Narsalar ----------
  const TUR = {
    olma: { nom: "Olma", kop: "olmalarni" },
    nok: { nom: "Nok", kop: "noklarni" },
    tosh: { nom: "Tosh", kop: "toshlarni" },
    uzum: { nom: "Uzum", kop: "uzumlarni" },
    apelsin: { nom: "Apelsin", kop: "apelsinlarni" },
  };

  // ---------- 1-bosqich: bosish (ter) ----------
  const TERILADIGAN = ["olma", "nok", "tosh"];
  // tier → nechta nishon, nechta chalg'ituvchi, radius (kichraygan sari qiyinroq)
  const TER = [
    { nishon: 3, chalgituvchi: 2, r: 0.09 },
    { nishon: 4, chalgituvchi: 4, r: 0.07 },
    { nishon: 5, chalgituvchi: 5, r: 0.055 },
  ];

  // "Hamma olmalarni bos": nishon turi oldingi vazifadagidan boshqa; chalg'ituvchilar — qolgan ikki tur
  function terTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = qis(tier || 0, 0, 2);
      const c = TER[t];
      const nishon = pick(TERILADIGAN.filter((x) => !(prev && prev.tur === "ter" && prev.nishon === x)), rr);
      const boshqa = aralash(TERILADIGAN.filter((x) => x !== nishon), rr);
      const turlar = [];
      for (let k = 0; k < c.nishon; k++) turlar.push(nishon);
      for (let k = 0; k < c.chalgituvchi; k++) turlar.push(boshqa[k % boshqa.length]);
      const joylar = joyla(rr, turlar.map(() => c.r));
      // Tartib aralashadi: ro'yxatdagi o'rin javobni bildirmasin
      const narsalar = aralash(turlar.map((tur, k) => ({ tur, joy: joylar[k] })), rr)
        .map((n, k) => ({ id: "n" + k, tur: n.tur, nishon: n.tur === nishon, x: n.joy.x, y: n.joy.y, r: n.joy.r }));
      return {
        tur: "ter", id: "ter:" + nishon + ":" + narsalar.map((n) => n.tur[0] + iz(n)).join("|"), tier: t, nishon, narsalar,
        javob: narsalar.filter((n) => n.nishon).map((n) => n.id),
        matn: `Hamma ${TUR[nishon].kop} bos.`,
      };
    }, prev, r);
  }

  // ---------- 2-bosqich: ikki marta bosish va o'ng tugma ----------
  const IKKI_MS = 450; // ikki marta bosish: ikkinchi bosish shu vaqt ichida bo'lishi kerak
  const SEKIN_MS = 1500; // bundan ham kech bo'lsa — bu endi ikki marta bosishga urinish emas

  // oldingi = { id, vaqt } — oxirgi bosish. Aynan shu narsaga 450 ms ichida ikkinchi bosishmi?
  const ikkiBosish = (oldingi, id, vaqt) => !!oldingi && oldingi.id === id
    && vaqt - oldingi.vaqt >= 0 && vaqt - oldingi.vaqt <= IKKI_MS;
  // Ikki marta bosmoqchi bo'ldi, lekin sekin: shu narsaga 450 ms dan keyin, 1,5 soniya ichida
  const sekinBosish = (oldingi, id, vaqt) => !!oldingi && oldingi.id === id
    && vaqt - oldingi.vaqt > IKKI_MS && vaqt - oldingi.vaqt <= SEKIN_MS;

  // Sandiq ranglari — QOIDALAR §6 dagi to'rt belgi rangi; rasmda har rangning o'z belgisi ham bor (game-art.js)
  const RANGLAR = [
    { id: "kok", nom: "Koʻk" },
    { id: "sariq", nom: "Toʻq sariq" },
    { id: "yashil", nom: "Yashil" },
    { id: "binafsha", nom: "Binafsha" },
  ];
  const OCH = "och"; // ikki marta bosish amali (menyuda yo'q)
  // O'ng tugma menyusidagi ishlar (tartibi o'zgarmaydi — haqiqiy menyudagidek)
  const AMALLAR = [
    { id: "boya", nom: "Boʻya", boldi: "boʻyaldi" },
    { id: "qulfla", nom: "Qulfla", boldi: "qulflandi" },
    { id: "tozala", nom: "Tozala", boldi: "tozalandi" },
    { id: "bezat", nom: "Bezat", boldi: "bezatildi" },
  ];
  const rangById = (id) => RANGLAR.find((x) => x.id === id);
  const amalById = (id) => AMALLAR.find((x) => x.id === id);

  // tier → nechta sandiq, menyuda nechta ish, radius
  const SANDIQ = [
    { soni: 3, amal: 3, r: 0.11 },
    { soni: 3, amal: 3, r: 0.11 },
    { soni: 4, amal: 4, r: 0.095 },
  ];

  // tur: "ikki" — sandiqni ikki marta bosib ochish; "ong" — o'ng tugma menyusidan ish tanlash.
  // Javob — { id: sandiq, amal }. Nishon sandiq rangi oldingi vazifadagidan boshqa.
  function sandiqTask(tur, r, prev, tier) {
    return pickNew((rr) => {
      const t = qis(tier || 0, 0, 2);
      const c = SANDIQ[t];
      const ranglar = aralash(RANGLAR, rr).slice(0, c.soni);
      const joylar = joyla(rr, ranglar.map(() => c.r));
      const sandiqlar = ranglar.map((rang, k) => ({ id: "s" + k, rang: rang.id, x: joylar[k].x, y: joylar[k].y, r: joylar[k].r }));
      const nishon = pick(sandiqlar.filter((s) => !(prev && prev.rang === s.rang)), rr);
      const tanlangan = aralash(AMALLAR, rr).slice(0, c.amal).map((a) => a.id);
      const amallar = AMALLAR.map((a) => a.id).filter((id) => tanlangan.includes(id));
      const amal = tur === "ikki" ? OCH : pick(amallar, rr);
      const nom = rangById(nishon.rang).nom;
      return {
        tur, id: `${tur}:${nishon.rang}:${amal}:` + sandiqlar.map((s) => s.rang[0] + iz(s)).join("|"), tier: t,
        sandiqlar, amallar, nishon: nishon.id, rang: nishon.rang, amal,
        javob: { id: nishon.id, amal },
        matn: tur === "ikki"
          ? `${nom} sandiqni och — ikki marta tez bos.`
          : `${nom} sandiqda oʻng tugmani bos va «${amalById(amal).nom}»ni tanla.`,
      };
    }, prev, r);
  }
  const ikkiTask = (r, prev, tier) => sandiqTask("ikki", r, prev, tier);
  const ongTask = (r, prev, tier) => sandiqTask("ong", r, prev, tier);

  // Bola qilgan ish { id, amal } vazifadagiga tengmi
  const togriAmal = (task, v) => !!v && v.id === task.javob.id && v.amal === task.javob.amal;

  // Maslahat uchun: nima noto'g'ri bo'ldi?
  //   "tugma"  — boshqa usul (ochish kerak edi — menyu ishlatildi, yoki aksincha);
  //   "sandiq" — usul to'g'ri, sandiq boshqa;  "amal" — sandiq to'g'ri, menyudan boshqa ish tanlandi.
  function xatoTuri(task, v) {
    if (togriAmal(task, v)) return null;
    if ((task.amal === OCH) !== (v.amal === OCH)) return "tugma";
    if (v.id !== task.javob.id) return "sandiq";
    return "amal";
  }

  // Menyu joyi (hammasi px da): sandiq yonida, o'ngga sig'masa — chap tomonida; maydon chetidan `chet` px ichkarida.
  function menyuJoyi(sandiq, maydon, menyu, chet) {
    const c = chet == null ? 4 : chet;
    let left = sandiq.x + sandiq.r * 0.6;
    if (left + menyu.w > maydon.w - c) left = sandiq.x - sandiq.r * 0.6 - menyu.w;
    return {
      left: qis(left, c, Math.max(c, maydon.w - menyu.w - c)),
      top: qis(sandiq.y - menyu.h / 2, c, Math.max(c, maydon.h - menyu.h - c)),
    };
  }

  // ---------- 3-bosqich: sudrab olib borish ----------
  const MEVALAR = ["olma", "nok", "uzum", "apelsin"];
  // tier → nechta narsa, nechta savat, narsa radiusi
  const SUDRA = [
    { narsa: 3, savat: 2, r: 0.075 },
    { narsa: 4, savat: 3, r: 0.07 },
    { narsa: 6, savat: 3, r: 0.06 },
  ];
  // Savat — to'rtburchak: markazi (x, y), eni w (en ulushi), bo'yi h (bo'y ulushi). Hammasi pastki qatorda.
  const SAVAT = { y: 0.79, w: 0.28, h: 0.36 };
  const SAVAT_X = { 1: [0.5], 2: [0.28, 0.72], 3: [0.17, 0.5, 0.83] };
  const SAVAT_CHET = 0.015; // qo'yib yuborishda savat atrofidagi qo'shimcha hoshiya (en ulushi)
  const SAVAT_SIGIM = 3; // bitta savatga ko'pi bilan nechta narsa
  const KICHRAYISH = 0.75; // savatga tushgan narsa shuncha kichrayadi
  const NARSA_SOHA = { x0: 0, x1: 1, y0: 0, y1: 0.58 }; // narsalar boshida savatlardan tepada turadi

  // n ta narsani k ta savatga bo'lish: har savatga kamida 1, ko'pi bilan SAVAT_SIGIM
  function taqsim(r, n, k) {
    const out = Array(k).fill(1);
    let qoldi = n - k;
    for (let urinish = 0; qoldi > 0 && urinish < 200; urinish++) {
      const i = Math.floor(r() * k);
      if (out[i] < SAVAT_SIGIM) {
        out[i]++;
        qoldi--;
      }
    }
    for (let i = 0; i < k; i++) {
      while (qoldi > 0 && out[i] < SAVAT_SIGIM) {
        out[i]++;
        qoldi--;
      }
    }
    return out;
  }

  // "Har mevani o'z savatiga olib bor": har narsaning savati bor. Javob — { narsa id: savat id }.
  function sudraTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = qis(tier || 0, 0, 2);
      const c = SUDRA[t];
      const turlar = aralash(MEVALAR, rr).slice(0, c.savat);
      const savatlar = turlar.map((tur, k) => ({ id: "s" + k, tur, x: SAVAT_X[c.savat][k], y: SAVAT.y, w: SAVAT.w, h: SAVAT.h }));
      const sonlar = taqsim(rr, c.narsa, c.savat);
      const narsaTur = aralash(turlar.flatMap((tur, k) => Array(sonlar[k]).fill(tur)), rr);
      const joylar = joyla(rr, narsaTur.map(() => c.r), NARSA_SOHA);
      const narsalar = narsaTur.map((tur, k) => ({ id: "n" + k, tur, x: joylar[k].x, y: joylar[k].y, r: joylar[k].r }));
      const javob = {};
      for (const n of narsalar) javob[n.id] = savatlar.find((s) => s.tur === n.tur).id;
      return {
        tur: "sudra", id: "sudra:" + turlar.join(",") + ":" + narsalar.map((n) => n.tur[0] + iz(n)).join("|"), tier: t,
        savatlar, narsalar, javob,
        matn: "Har mevani oʻz savatiga olib bor.",
      };
    }, prev, r);
  }

  // Nuqta (x — en ulushi, y — bo'y ulushi) qaysi savat ustida? Savat id si yoki null.
  // chet — savat atrofidagi qo'shimcha hoshiya (en ulushi). Ikki savatga ham tushsa — markazi yaqinrog'i.
  function savatUstida(nuqta, savatlar, chet) {
    const c = chet || 0;
    let eng = null;
    let engYaqin = Infinity;
    for (const s of savatlar) {
      if (Math.abs(nuqta.x - s.x) > s.w / 2 + c || Math.abs(nuqta.y - s.y) > s.h / 2 + c * NISBAT) continue;
      const m = masofa(nuqta, s);
      if (m < engYaqin) {
        eng = s.id;
        engYaqin = m;
      }
    }
    return eng;
  }

  // Savatga tushgan k-narsaning joyi (0 dan); sigim — shu savatga jami nechta narsa tushadi
  const savatdagiJoy = (savat, k, sigim) => ({
    x: yaxlit(savat.x + (k - (sigim - 1) / 2) * savat.w * 0.27),
    y: yaxlit(savat.y - savat.h * 0.27),
  });

  // Sudralayotgan narsa (markazi nuqta, radiusi r) maydondan chiqmasin
  const maydonIchida = (nuqta, r) => ({
    x: qis(nuqta.x, r, 1 - r),
    y: qis(nuqta.y, r * NISBAT, 1 - r * NISBAT),
  });

  // ---------- "Ko'rsatish" qismlari uchun tayyor maydonlar (chap tepa burchak — sichqoncha rasmi uchun bo'sh) ----------
  const korsatTer = () => ({
    tur: "ter", id: "korsat:ter", tier: 0, nishon: "olma",
    narsalar: [{ id: "n0", tur: "olma", nishon: true, x: 0.6, y: 0.55, r: 0.1 }],
    javob: ["n0"],
  });
  const korsatSandiq = () => ({
    tur: "ikki", id: "korsat:sandiq", tier: 0,
    sandiqlar: [{ id: "s0", rang: "kok", x: 0.36, y: 0.62, r: 0.13 }, { id: "s1", rang: "yashil", x: 0.74, y: 0.62, r: 0.13 }],
    amallar: ["boya", "qulfla", "tozala"], nishon: "s0", rang: "kok", amal: OCH,
    javob: { id: "s0", amal: OCH },
  });
  const korsatSudra = () => ({
    tur: "sudra", id: "korsat:sudra", tier: 0,
    savatlar: [{ id: "s0", tur: "olma", x: 0.72, y: SAVAT.y, w: SAVAT.w, h: SAVAT.h }],
    narsalar: [{ id: "n0", tur: "olma", x: 0.46, y: 0.3, r: 0.08 }],
    javob: { n0: "s0" },
  });

  // ---------- Bosqich navbatlari: (r, prev, n, tier) ----------
  const bosqich1Task = (r, prev, n, tier) => terTask(r, prev, tier);

  // tier 0 — ikki marta bosish, tier 1 — o'ng tugma, tier 2 — aralash (ketma-ket kelsa, oldingisidan boshqa tur)
  function bosqich2Task(r, prev, n, tier) {
    const t = qis(tier || 0, 0, 2);
    if (t === 0) return ikkiTask(r, prev, t);
    if (t === 1) return ongTask(r, prev, t);
    const oldingi = prev && prev.tier === 2 ? prev.tur : null;
    const tur = oldingi === "ikki" ? "ong" : oldingi === "ong" ? "ikki" : r() < 0.5 ? "ikki" : "ong";
    return sandiqTask(tur, r, prev, t);
  }

  const bosqich3Task = (r, prev, n, tier) => sudraTask(r, prev, tier);

  const api = {
    NISBAT, ORALIQ, CHET, TUR, TERILADIGAN, TER, IKKI_MS, SEKIN_MS, RANGLAR, OCH, AMALLAR, SANDIQ,
    MEVALAR, SUDRA, SAVAT, SAVAT_X, SAVAT_CHET, SAVAT_SIGIM, KICHRAYISH, NARSA_SOHA,
    aralash, masofa, ustmaUst, sohada, tasodifiyJoy, panjaraJoy, joyla,
    terTask, ikkiBosish, sekinBosish, rangById, amalById, sandiqTask, ikkiTask, ongTask, togriAmal, xatoTuri, menyuJoyi,
    taqsim, sudraTask, savatUstida, savatdagiJoy, maydonIchida,
    korsatTer, korsatSandiq, korsatSudra,
    bosqich1Task, bosqich2Task, bosqich3Task,
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
