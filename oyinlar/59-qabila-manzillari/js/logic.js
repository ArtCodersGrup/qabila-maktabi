// 59-o'yin: qabila manzillari — IP manzil (to'rtta 0–255 son), DNS daftarlari (nom → manzil,
// kichigida yo'q bo'lsa kattarog'idan) va kesh (javondagi nusxa: tez, lekin eskirishi mumkin).
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

  // Ketma-ket bir xil misol chiqmasligi uchun (QOIDALAR 4.3). Generator null qaytarsa (shart bajarilmadi) — qayta urinadi.
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

  // ---------- Manzil ----------
  // To'g'ri manzil: 4 bo'lak, har biri 0–255, oldida ortiqcha 0 yo'q. Natija: { ok, sabab }
  function tekshir(manzil) {
    const s = String(manzil);
    const q = s.split(".");
    if (q.length !== 4) return { ok: false, sabab: `${q.length} ta boʻlak — 4 ta boʻlishi kerak` };
    for (const b of q) {
      if (b === "") return { ok: false, sabab: "ikki nuqta orasi yoki oxiri boʻsh" };
      if (!/^\d+$/.test(b)) return { ok: false, sabab: `«${b}» — son emas` };
      if (Number(b) > 255) return { ok: false, sabab: `${b} — 255 dan katta` };
      if (b.length > 1 && b[0] === "0") return { ok: false, sabab: `«${b}» — oldida ortiqcha 0` };
    }
    return { ok: true, sabab: "" };
  }
  const togrimi = (m) => tekshir(m).ok;

  // Ichki tarmoq manzillari (haqiqiy saytlarniki emas)
  const BOSHI = ["10.0", "10.1", "192.168"];
  function manzil(r) {
    return `${pick(BOSHI, r)}.${int(r, 0, 20)}.${int(r, 2, 250)}`;
  }

  // Xato manzil: tier 0 — bitta son 255 dan katta; tier 1 — bo'laklar soni xato; tier 2 — nozik xatolar
  function xatoManzil(r, tier) {
    const [a, b, c, d] = manzil(r).split(".").map(Number);
    if (tier === 0) {
      const katta = int(r, 260, 399);
      const q = [a, b, c, d];
      q[int(r, 2, 3)] = katta;
      return q.join(".");
    }
    if (tier === 1) return pick([`${a}.${b}.${c}`, `${a}.${b}.${c}.${d}.${int(r, 1, 9)}`], r);
    return pick([`${a}.${b}.256.${d}`, `${a}.${b}.${c}.`, `${a}.${b}.${c}a.${d}`, `${a}.-${b}.${c}.${d}`], r);
  }

  // ---------- 1-bosqich: manzil ----------
  // Qaysi manzil xato? — 3 to'g'ri + 1 xato
  function xatoTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = tier || 0;
      const xato = xatoManzil(rr, t);
      const togrilar = new Set();
      while (togrilar.size < 3) togrilar.add(manzil(rr));
      const variantlar = aralash([xato, ...togrilar], rr);
      return {
        tur: "xato", id: `xato:${xato}`, javob: xato, variantlar,
        matn: "Qaysi manzil xato?",
        ishora: "Har manzilda nechta son borligini va har son 0 dan 255 gacha ekanini tekshir.",
        nega: `${xato} — ${tekshir(xato).sabab}.`,
      };
    }, prev, r);
  }

  // Konvert qaysi uyga? — 4 uy, manzillari o'xshash (tier oshgani sari faqat bitta raqam farq qiladi)
  function uyTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = tier || 0;
      const asos = manzil(rr).split(".").map(Number);
      const uylar = new Set([asos.join(".")]);
      for (let urinish = 0; uylar.size < 4; urinish++) {
        if (urinish > 40) return null; // chegarada yetarli farqli uy chiqmadi — boshqa asos olinadi
        const q = asos.slice();
        if (t === 0) q[3] = int(rr, 2, 250);
        else if (t === 1) q[3] = Math.min(250, Math.max(2, q[3] + pick([-11, -10, -1, 1, 10, 11], rr)));
        else {
          // nozik farq: uchinchi son bittaga yoki to'rtinchisining raqamlari teskari (14 ↔ 41)
          const teskari = Number(String(q[3]).split("").reverse().join(""));
          if (rr() < 0.5 || teskari === q[3] || teskari < 2 || teskari > 250) q[2] = Math.min(20, Math.max(0, q[2] + pick([-1, 1], rr)));
          else q[3] = teskari;
        }
        uylar.add(q.join("."));
      }
      const list = aralash([...uylar], rr);
      const javob = asos.join("."); // qolgan uylar aynan shundan bitta son bilan farq qiladi
      return {
        tur: "uy", id: `uy:${javob}:${list.join(",")}`, javob, variantlar: list,
        matn: `Konvertda manzil: ${javob}. Qaysi uyga eltasan?`,
        ishora: "Manzilni chapdan oʻngga, son-ma-son solishtir.",
        nega: `Toʻrtta son ham bir xil boʻlgan uy — ${javob}.`,
      };
    }, prev, r);
  }

  const CHEGARA = [
    { id: "eng-katta", matn: "Manzildagi bitta son eng koʻpi bilan nechaga teng boʻladi?", javob: 255, hisob: "Bitta son — 1 bayt (8 bit). Eng kattasi — 255." },
    { id: "eng-kichik", matn: "Manzildagi bitta son eng kamida nechaga teng boʻladi?", javob: 0, hisob: "Eng kichigi — 0. Shuning uchun 0 dan 255 gacha." },
    { id: "nechta-xil", matn: "Manzildagi bitta son nechta xil qiymat oladi (0 dan 255 gacha)?", javob: 256, hisob: "0 dan 255 gacha — 256 ta xil son. Bu 1 bayt: 2⁸ = 256." },
  ];
  function chegaraTask(r, prev) {
    return pickNew((rr) => {
      const c = pick(CHEGARA, rr);
      return { tur: "chegara", id: "chegara:" + c.id, matn: c.matn, javob: c.javob, hisob: c.hisob,
        nega: "«Bayt sandigʻi»ni esla: 1 bayt = 8 bit." };
    }, prev, r);
  }

  // ---------- 2-bosqich: daftar (DNS) ----------
  const NOMLAR = ["qabila.uz", "ovchi.uz", "maktab.uz", "kitob.uz", "toglar.uz", "ruchka.uz", "oyin.uz", "bayroq.uz",
    "daryo.uz", "lagan.uz", "chiroq.uz", "sandiq.uz", "qalam.uz", "yulduz.uz"];

  // Nomlar → manzillar jadvali (manzillar takrorlanmaydi)
  function daftar(r, n) {
    const nomlar = aralash(NOMLAR, r).slice(0, n);
    const band = new Set();
    return nomlar.map((nom) => {
      let m;
      do m = manzil(r); while (band.has(m));
      band.add(m);
      return { nom, manzil: m };
    });
  }

  // Manzilni top — daftar jadvalidan; 4 variant (boshqa qatorlar manzillari + bitta raqami almashgani)
  function topTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = tier || 0;
      const jadval = daftar(rr, [6, 8, 10][t]);
      const qator = pick(jadval, rr);
      const q = qator.manzil.split(".");
      const almash = q.slice(0, 3).concat(String(Number(q[3]) === 250 ? 249 : Number(q[3]) + 1)).join(".");
      const boshqa = aralash(jadval.filter((x) => x !== qator).map((x) => x.manzil), rr).slice(0, 2);
      const variantlar = [...new Set([qator.manzil, almash, ...boshqa])];
      if (variantlar.length < 4) return null;
      return {
        tur: "top", id: `top:${qator.nom}:${qator.manzil}`, jadval, nom: qator.nom, javob: qator.manzil,
        variantlar: aralash(variantlar, rr),
        matn: `Daftardan «${qator.nom}» manzilini top.`,
        ishora: "Avval chap ustundan nomni top, keyin oʻsha qatordagi manzilni oʻqi.",
        nega: `«${qator.nom}» qatorida: ${qator.manzil}.`,
      };
    }, prev, r);
  }

  const DAFTARLAR = ["Mahalla daftari", "Shahar daftari", ".uz daftari"];

  // Nechta daftardan so'raldi? — nom birinchi topilgan daftargacha (tier 2 — hech qayerda yo'q bo'lishi mumkin)
  function zanjirTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = tier || 0;
      const hammasi = daftar(rr, 12);
      const mahalla = hammasi.slice(0, 3);
      const shahar = hammasi.slice(3, 7);
      const uz = hammasi.slice(7, 11);
      const yoqNom = hammasi[11].nom; // hech bir daftarda yo'q
      const qayer = t === 0 ? int(rr, 1, 2) : t === 1 ? int(rr, 1, 3) : int(rr, 2, 4);
      const nom = qayer === 4 ? yoqNom : pick([mahalla, shahar, uz][qayer - 1], rr).nom;
      const javob = Math.min(qayer, 3);
      return {
        tur: "zanjir", id: `zanjir:${nom}:${qayer}`, daftarlar: [mahalla, shahar, uz], nom, topildi: qayer <= 3, javob,
        matn: `Kompyuter «${nom}» manzilini qidiryapti. Avval mahalla daftaridan soʻraydi, topmasa — kattarogʻidan. Nechta daftardan soʻraydi?`,
        nega: "Daftarlarni chapdan oʻngga tekshir: nom qaysi birida birinchi chiqsa — oʻshagacha sana.",
        hisob: qayer <= 3 ? `«${nom}» — ${DAFTARLAR[qayer - 1]}da. ${javob} ta daftardan soʻraldi.`
          : `«${nom}» hech bir daftarda yoʻq: 3 ta daftardan soʻraldi va «Sayt topilmadi» chiqdi.`,
      };
    }, prev, r);
  }

  // ---------- 3-bosqich: kesh (javon) ----------
  // Nechta so'rov ketadi? — har yangi nom uchun narx ta so'rov, javonda bori — 0
  function soniHisob(ketma, narx, javon) {
    const bor = new Set(javon || []);
    let jami = 0;
    for (const nom of ketma) {
      if (!bor.has(nom)) {
        jami += narx;
        bor.add(nom);
      }
    }
    return jami;
  }

  function keshTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = tier || 0;
      const nomlar = aralash(NOMLAR, rr).slice(0, [3, 4, 5][t]);
      const uzun = [4, 6, 8][t];
      const ketma = [];
      for (let i = 0; i < uzun; i++) ketma.push(pick(nomlar, rr));
      if (new Set(ketma).size === ketma.length) return null; // takror bo'lmasa kesh ko'rinmaydi
      const narx = t === 0 ? 1 : pick([2, 3], rr);
      const javon = t === 2 ? [pick(nomlar, rr)] : [];
      const javob = soniHisob(ketma, narx, javon);
      return {
        tur: "kesh", id: `kesh:${ketma.join(",")}:${narx}:${javon.join(",")}`, ketma, narx, javon, javob,
        matn: `Har yangi nomni topish uchun ${narx} ta soʻrov ketadi. Topilgan manzil javonga qoʻyiladi va keyingi safar soʻralmaydi.` +
          (javon.length ? ` Javonda boshidan «${javon[0]}» bor.` : "") + " Jami nechta soʻrov ketadi?",
        nega: "Har nomni birinchi marta uchratganda sana. Ikkinchi marta — javondan, soʻrov yoʻq.",
        hisob: `Yangi nomlar: ${new Set(ketma.filter((n) => !javon.includes(n))).size} ta × ${narx} = ${javob} ta soʻrov.`,
      };
    }, prev, r);
  }

  // Manzil o'zgardi, javonda eskisi — konvert qayerga boradi?
  function eskiTask(r, prev) {
    return pickNew((rr) => {
      const nom = pick(NOMLAR, rr);
      const eski = manzil(rr);
      let yangi;
      do yangi = manzil(rr); while (yangi === eski);
      const variantlar = aralash([`${eski} — eski uyga`, `${yangi} — yangi uyga`, "Hech qayerga — qaytib keladi", "Avval daftarga, keyin yangi uyga"], rr);
      return {
        tur: "eski", id: `eski:${nom}:${eski}`, nom, eski, yangi, variantlar, javob: `${eski} — eski uyga`,
        matn: `«${nom}» manzili ${eski} edi va javonga yozildi. Keyin sayt ${yangi} ga koʻchdi. Kompyuter javonga qarab yuborsa, konvert qayerga boradi?`,
        ishora: "Kompyuter daftarga emas, avval javonga qaraydi. Javonda qaysi manzil yozilgan?",
        nega: "Javonda eski manzil turibdi — konvert eski uyga ketadi. Shuning uchun eski sahifa yoki xato chiqadi.",
      };
    }, prev, r);
  }

  const NIMA = {
    javob: "Javondagi eski yozuvni oʻchirib, daftardan qayta soʻrash",
    soxta: ["Sahifani yopib, ertaga qayta ochish", "Boshqa saytga kirish", "Kompyuterni almashtirish"],
  };
  function nimaTask(r, prev) {
    return pickNew((rr) => {
      const vaziyat = pick([
        "Doʻsting saytini yangiladi, sen esa hali ham eski sahifani koʻryapsan.",
        "Sayt yangi uyga koʻchdi, lekin senda «sahifa topilmadi» chiqyapti.",
        "Oʻqituvchi yangi rasm qoʻydi, sening ekraningda eski rasm turibdi.",
      ], rr);
      return {
        tur: "nima", id: "nima:" + vaziyat, matn: vaziyat + " Nima qilish kerak?",
        variantlar: aralash([NIMA.javob, ...NIMA.soxta], rr), javob: NIMA.javob,
        ishora: "Eski narsa qayerda saqlanib qolgan? Oʻsha joyni yangilash kerak.",
        nega: "Javondagi (keshdagi) nusxa eskirgan. Uni oʻchirib, qaytadan soʻrash — «yangilash».",
      };
    }, prev, r);
  }

  const BOSQICH1 = [xatoTask, uyTask, xatoTask, chegaraTask];
  const BOSQICH2 = [topTask, zanjirTask];
  const BOSQICH3 = [keshTask, eskiTask, keshTask, nimaTask];
  const navbat = (bank) => (r, prev, n, tier) => bank[(n || 0) % bank.length](r, prev, tier);

  const api = {
    NOMLAR, DAFTARLAR, CHEGARA, NIMA, BOSQICH1, BOSQICH2, BOSQICH3,
    tekshir, togrimi, manzil, xatoManzil, daftar, soniHisob,
    xatoTask, uyTask, chegaraTask, topTask, zanjirTask, keshTask, eskiTask, nimaTask,
    bosqich1Task: navbat(BOSQICH1), bosqich2Task: navbat(BOSQICH2), bosqich3Task: navbat(BOSQICH3),
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
