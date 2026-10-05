// 58-o'yin: xabar bo'laklari — uzun xabar raqamlangan konvertlarga (paketlarga) bo'linadi,
// yo'lda aralashadi yoki yo'qoladi, qabul qiluvchi raqam bo'yicha yig'adi va yo'qini qayta so'raydi.
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

  // Aralashgan, lekin boshlang'ich tartibda qolmagan (aks holda "aralashdi" deyish yolg'on bo'ladi)
  function aralashTartib(list, r) {
    for (let k = 0; k < 20; k++) {
      const out = aralash(list, r);
      if (out.some((x, i) => x !== list[i])) return out;
    }
    return list.slice(1).concat(list[0]);
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

  // ---------- Xabarlar ----------
  // Bosh harflar; Oʻ va Gʻ — bitta belgi (bitta katak). Bo'sh joy ham belgi.
  const SOZLAR = ["SALOM", "MAKTAB", "KITOBIM", "DOʻSTIM", "ERTAGA", "QALAMIM", "OʻYINCHI", "DARSLIK", "SAVOLIM", "BAYRAM", "QUYOSH", "TOGʻLAR"];
  const IBORALAR = [
    "SALOM DOʻSTIM", "ERTAGA MAKTABDA", "SOAT UCHDA KEL", "KITOBNI OLIB KEL", "OʻYIN BOSHLANDI",
    "BUGUN DARS BOR", "TOʻPNI OLIB CHIQ", "ONAM SALOM DEDI", "UYGA VAQTLI KEL", "BAYRAMGA TAYYORLAN",
    "MASALANI YECHDIM", "KUTUBXONADA KUTAMAN",
  ];

  // Xabar → belgilar ro'yxati (Oʻ / Gʻ — bitta belgi)
  function belgilar(xabar) {
    const out = [];
    const s = String(xabar);
    for (let i = 0; i < s.length; i++) {
      if ((s[i] === "O" || s[i] === "G") && s[i + 1] === "ʻ") {
        out.push(s[i] + "ʻ");
        i++;
      } else out.push(s[i]);
    }
    return out;
  }
  const uzunlik = (xabar) => belgilar(xabar).length;

  // Xabarni k belgidan bo'laklash → konvertlar: { raqam, jami, matn }
  function konvertlar(xabar, k) {
    const b = belgilar(xabar);
    const jami = Math.ceil(b.length / k);
    const out = [];
    for (let i = 0; i < jami; i++) out.push({ raqam: i + 1, jami, matn: b.slice(i * k, (i + 1) * k).join("") });
    return out;
  }
  const nechta = (xabar, k) => Math.ceil(uzunlik(xabar) / k);
  const yigish = (list) => list.map((x) => x.matn).join("");
  // Ekranda bo'sh joy ko'rinsin: "␣"
  const korinish = (matn) => String(matn).replace(/ /g, "␣");

  // Hisob yozuvi: "12 : 5 = 2, 2 ta ortadi → 3 ta konvert"
  function hisobYoz(L, k) {
    const q = Math.floor(L / k);
    const qol = L % k;
    return qol ? `${L} : ${k} = ${q}, yana ${qol} ta belgi ortadi → ${q + 1} ta konvert` : `${L} : ${k} = ${q} → ${q} ta konvert`;
  }

  // ---------- 1-bosqich: bo'laklash ----------
  // tier 0 — so'z, qoldiqsiz; tier 1 — qoldiq bor; tier 2 — ibora (bo'sh joyli), sig'im 4–6
  function nechtaTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = tier || 0;
      const xabar = t < 2 ? pick(SOZLAR, rr) : pick(IBORALAR, rr);
      const L = uzunlik(xabar);
      const sigimlar = (t < 2 ? [2, 3, 4] : [4, 5, 6]).filter((k) => (t === 0 ? L % k === 0 : t === 1 ? L % k !== 0 : true) && L / k > 1.5);
      if (!sigimlar.length) return null;
      const k = pick(sigimlar, rr);
      const javob = nechta(xabar, k);
      return {
        tur: "nechta", id: `nechta:${xabar}:${k}`, xabar, k, L, javob,
        matn: `Xabarda ${L} ta belgi${xabar.includes(" ") ? " (boʻsh joy ham belgi)" : ""}. Bitta konvertga ${k} ta belgi sigʻadi. Nechta konvert kerak?`,
        nega: `Xabarni ${k} tadan sanab boʻl. Oxirgi konvert toʻlmasa ham — u ham alohida konvert.`,
        hisob: hisobYoz(L, k),
      };
    }, prev, r);
  }

  // N-konvertda nima bor? — 4 variant: to'g'ri bo'lak, qo'shnilari, bir belgiga siljigani
  function ichidaTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = tier || 0;
      const xabar = t < 2 ? pick(SOZLAR.filter((s) => uzunlik(s) >= 6), rr) : pick(IBORALAR, rr);
      const k = t < 2 ? pick([2, 3], rr) : pick([3, 4], rr);
      const list = konvertlar(xabar, k);
      if (list.length < 3) return null;
      const n = int(rr, 2, list.length - 1); // o'rtadagi konvert — ikki qo'shnisi bor
      const b = belgilar(xabar);
      const togri = list[n - 1].matn;
      const siljigan = b.slice((n - 1) * k + 1, n * k + 1).join("");
      const nomzod = [togri, list[n - 2].matn, list[n].matn, siljigan].map(korinish);
      const variantlar = [...new Set(nomzod)];
      if (variantlar.length < 4) return null;
      return {
        tur: "ichida", id: `ichida:${xabar}:${k}:${n}`, xabar, k, n, jami: list.length,
        matn: `Xabar ${k} tadan boʻlindi. ${n}-konvertda qaysi belgilar bor?`,
        variantlar: aralash(variantlar, rr), javob: korinish(togri),
        ishora: `Boshidan ${k} tadan sanab bor: 1-konvert, 2-konvert…`,
        nega: `${n}-konvert — ${(n - 1) * k + 1}-belgidan ${Math.min(n * k, b.length)}-belgigacha: «${korinish(togri)}».`,
      };
    }, prev, r);
  }

  // ---------- 2-bosqich: yo'lda aralashdi ----------
  const BOLAK_SONI = [3, 4, 5]; // tier → nechta konvert (tier 2 da 5–6)

  // Xabarni aynan n ta konvertga bo'ladigan sig'im
  function sigimTop(xabar, n) {
    const L = uzunlik(xabar);
    for (let k = 1; k <= L; k++) if (Math.ceil(L / k) === n) return k;
    return null;
  }

  // Xabar nima deydi? — konvertlar kelgan tartibda; 4 variant
  function oqishTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = tier || 0;
      const n = t < 2 ? BOLAK_SONI[t] : pick([5, 6], rr);
      const xabar = pick(t === 0 ? SOZLAR : IBORALAR, rr);
      const k = sigimTop(xabar, n);
      if (!k) return null;
      const asl = konvertlar(xabar, k);
      const keldi = aralashTartib(asl, rr);
      const almash = asl.slice();
      const i = int(rr, 0, n - 2);
      [almash[i], almash[i + 1]] = [almash[i + 1], almash[i]];
      const variantlar = [...new Set([yigish(asl), yigish(keldi), yigish(asl.slice().reverse()), yigish(almash)].map(korinish))];
      if (variantlar.length < 4) return null;
      return {
        tur: "oqish", id: `oqish:${xabar}:${keldi.map((x) => x.raqam).join("")}`, xabar, k, keldi,
        matn: "Konvertlar shu tartibda yetib keldi. Xabar nima deydi?",
        variantlar: aralash(variantlar, rr), javob: korinish(xabar),
        ishora: "Kelgan tartibda emas — konvertdagi raqam tartibida oʻqi: 1, 2, 3…",
        nega: "Raqam boʻyicha: " + asl.map((x) => `${x.raqam}) ${korinish(x.matn)}`).join(" "),
      };
    }, prev, r);
  }

  // Qaysi konvert N-chi o'qiladi? — 4 ta konvert-tugma (qiymati — raqam)
  function nechanchiTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = tier || 0;
      const n = t < 2 ? 4 : 5;
      const xabar = pick(IBORALAR, rr);
      const k = sigimTop(xabar, n);
      if (!k) return null;
      const asl = konvertlar(xabar, k);
      const keldi = aralashTartib(asl, rr).slice(0, 4);
      const tanlov = keldi.map((x) => x.raqam);
      const soralgan = pick(tanlov, rr);
      const nomi = soralgan === 1 ? "birinchi" : soralgan === n ? "oxirgi" : `${soralgan}-chi`;
      return {
        tur: "nechanchi", id: `nechanchi:${xabar}:${soralgan}`, xabar, k, keldi, jami: n,
        matn: `Xabar ${n} ta konvertda. Qaysi konvert ${nomi} oʻqiladi?`,
        variantlar: tanlov, javob: soralgan,
        ishora: "Konvert burchagidagi raqamga qara: «3/5» — beshtadan uchinchisi.",
        nega: `«${soralgan}/${n}» yozilgan konvert — ${nomi}.`,
      };
    }, prev, r);
  }

  // ---------- 3-bosqich: bo'lak yo'qoldi ----------
  const JAMI = [[4, 5], [6, 8], [8, 10]]; // tier → jami konvertlar oralig'i

  // Qaysi raqamli konvert kelmadi? — javob son
  function yoqTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      const jami = int(rr, JAMI[t][0], JAMI[t][1]);
      const yoq = int(rr, 1, jami);
      let keldi = [];
      for (let i = 1; i <= jami; i++) if (i !== yoq) keldi.push(i);
      if (t > 0) keldi = aralashTartib(keldi, rr);
      return {
        tur: "yoq", id: `yoq:${jami}:${yoq}:${keldi.join(",")}`, jami, keldi, javob: yoq,
        matn: `Xabar ${jami} ta konvertda yuborildi. Qaysi raqamli konvert yetib kelmadi?`,
        nega: `1 dan ${jami} gacha sanab chiq va har raqamni konvertlar orasidan izla.`,
        hisob: `${yoq}-konvert yoʻq — faqat shu konvert qayta soʻraladi.`,
      };
    }, prev, r);
  }

  const HOLAT = {
    hammasi: "Ha, hammasi keldi",
    bitta: "Yoʻq, 1 ta konvert kelmadi",
    ikki: "Yoʻq, 2 ta konvert kelmadi",
    takror: "Bitta konvert ikki marta keldi",
  };

  // Hammasi keldimi? — to'rt holatdan biri, javob har xil
  function holatTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      const jami = int(rr, JAMI[t][0], JAMI[t][1]);
      const holat = pick(Object.keys(HOLAT), rr);
      const barcha = Array.from({ length: jami }, (_, i) => i + 1);
      let keldi = barcha.slice();
      if (holat === "bitta" || holat === "ikki") {
        const yoqlar = aralash(barcha, rr).slice(0, holat === "bitta" ? 1 : 2);
        keldi = barcha.filter((x) => !yoqlar.includes(x));
      } else if (holat === "takror") {
        keldi.push(pick(barcha, rr));
      }
      keldi = aralashTartib(keldi, rr);
      return {
        tur: "holat", id: `holat:${jami}:${holat}:${keldi.join(",")}`, jami, keldi, holat,
        matn: `Xabar ${jami} ta konvertda yuborildi. Hammasi toʻgʻri yetib keldimi?`,
        variantlar: Object.values(HOLAT), javob: HOLAT[holat],
        ishora: `Konvertlarni sana va 1 dan ${jami} gacha har raqamni izla.`,
        nega: holat === "hammasi" ? `1 dan ${jami} gacha hamma raqam bor.`
          : holat === "takror" ? "Hamma raqam bor, lekin bittasi ikki marta keldi — ortiqchasi tashlanadi."
            : `Raqamlardan ${holat === "bitta" ? "bittasi" : "ikkitasi"} yoʻq — ${holat === "bitta" ? "u" : "ular"} qayta soʻraladi.`,
      };
    }, prev, r);
  }

  // Nechta konvert qayta so'raladi? — ikkitasi yo'q, bittasi ikki marta keldi
  function qaytaTask(r, prev, tier) {
    if ((tier || 0) < 2) return yoqTask(r, prev, tier);
    return pickNew((rr) => {
      const jami = int(rr, 7, 10);
      const barcha = Array.from({ length: jami }, (_, i) => i + 1);
      const yoqlar = aralash(barcha, rr).slice(0, 2).sort((a, b) => a - b);
      const bor = barcha.filter((x) => !yoqlar.includes(x));
      const keldi = aralashTartib(bor.concat(pick(bor, rr)), rr);
      return {
        tur: "qayta", id: `qayta:${jami}:${keldi.join(",")}`, jami, keldi, yoqlar, javob: 2,
        matn: `Xabar ${jami} ta konvertda yuborildi. Nechta konvertni qayta soʻrash kerak?`,
        nega: "Ikki marta kelgan konvert qayta soʻralmaydi — faqat umuman kelmaganlar.",
        hisob: `${yoqlar.join(" va ")}-konvertlar yoʻq → 2 ta qayta soʻraladi.`,
      };
    }, prev, r);
  }

  const BOSQICH1 = [nechtaTask, ichidaTask];
  const BOSQICH2 = [oqishTask, nechanchiTask, oqishTask];
  const BOSQICH3 = [yoqTask, holatTask, qaytaTask];

  // n — nechanchi to'g'ri javob (mashq turi navbati), tier — qiyinlik zinasi
  const navbat = (bank) => (r, prev, n, tier) => bank[(n || 0) % bank.length](r, prev, tier);

  const api = {
    SOZLAR, IBORALAR, HOLAT, JAMI, BOSQICH1, BOSQICH2, BOSQICH3,
    belgilar, uzunlik, konvertlar, nechta, yigish, korinish, hisobYoz, sigimTop, aralash, aralashTartib,
    nechtaTask, ichidaTask, oqishTask, nechanchiTask, yoqTask, holatTask, qaytaTask,
    bosqich1Task: navbat(BOSQICH1), bosqich2Task: navbat(BOSQICH2), bosqich3Task: navbat(BOSQICH3),
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
