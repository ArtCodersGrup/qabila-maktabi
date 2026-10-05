// 61-o'yin: qulfli yo'l — qulfsiz yo'lda tugunlar xabarni o'qiydi; qulf (HTTPS) o'qishni va manzil
// soxtaligini to'sadi, lekin saytning halolligini bildirmaydi. Manzilni oxiridan o'qish — egasini topish.
// Haqiqiy shifrlash yo'q: qulflangan matn — tasodifiy belgilar. Ekransiz sof mantiq; tests/logic.test.js
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

  // ---------- Xabar va qulf ----------
  const ISMLAR = ["ali", "malika", "jasur", "nodira", "sardor", "zarina", "bekzod", "dilnoza"];
  const SOZLAR = ["olma", "qovun", "anor", "tulki", "lochin", "bulut", "daryo", "yulduz"];

  // Kirish xabari: login, parol va (tier oshgani sari) boshqa maydonlar
  function xabar(r, tier) {
    const login = pick(ISMLAR, r) + int(r, 1000, 9999);
    const parol = pick(SOZLAR, r) + int(r, 10, 99);
    const maydonlar = [["login", login], ["parol", parol]];
    if (tier >= 1) maydonlar.push(["sinf", `${int(r, 5, 9)}-${pick(["A", "B", "V"], r)}`]);
    if (tier >= 2) maydonlar.push(["kod", String(int(r, 1000, 9999))]);
    const tartib = tier >= 2 ? aralash(maydonlar, r) : maydonlar;
    return { login, parol, maydonlar: tartib, matn: tartib.map(([k, v]) => `${k}: ${v}`).join("  ") };
  }

  // "Qulflash": bir xil uzunlikdagi tasodifiy belgilar (haqiqiy shifrlash emas — faqat g'oya)
  const BELGILAR = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789+/=";
  function qulfla(matn, r) {
    let out = "";
    for (let i = 0; i < matn.length; i++) out += matn[i] === " " ? pick(BELGILAR, r) : BELGILAR[Math.floor(r() * BELGILAR.length)];
    return out;
  }

  // ---------- 1-bosqich: ochiq yo'l ----------
  function parolTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      const x = xabar(rr, t);
      const boshqa = x.maydonlar.filter(([k]) => k !== "parol" && k !== "login").map(([, v]) => v);
      const ozgargan = x.parol.slice(0, -2) + String((Number(x.parol.slice(-2)) + int(rr, 1, 8)) % 90 + 10);
      const variantlar = [...new Set([x.parol, x.login, ozgargan, ...(boshqa.length ? [pick(boshqa, rr)] : [pick(SOZLAR, rr) + int(rr, 10, 99)])])];
      if (variantlar.length < 4) return null;
      return {
        tur: "parol", id: "parol:" + x.matn, xabar: x, javob: x.parol, variantlar: aralash(variantlar.slice(0, 4), rr),
        matn: "Sen yoʻldagi tugunsan. Oldingdan shu xabar oʻtdi. Undagi parol qaysi?",
        ishora: "Xabarni oxirigacha oʻqi: har maydon nomi va qiymati bor.",
        nega: `«parol:» dan keyin — ${x.parol}. Qulfsiz yoʻlda buni yoʻldagi har tugun oʻqiydi.`,
      };
    }, prev, r);
  }

  // Yo'ldagi tugunlar soni (sen va saytdan tashqari)
  const ORTA = [[2, 3], [4, 5], [5, 7]];
  function uzelTask(r, prev, tier) {
    return pickNew((rr) => {
      const [min, max] = ORTA[Math.min(tier || 0, 2)];
      const m = int(rr, min, max);
      return {
        tur: "uzel", id: "uzel:" + m, orta: m, javob: m,
        matn: "Xabaring qulfsiz yuborildi. Sen va saytdan tashqari, yoʻldagi nechta tugun uni oʻqiy oldi?",
        nega: "Yoʻldagi har tugun paketni qoʻlidan oʻtkazadi — demak oʻqiy oladi. Oʻrtadagilarni sana.",
        hisob: `Oʻrtada ${m} ta tugun — ${m} ta begona xabaringni koʻrdi.`,
      };
    }, prev, r);
  }

  // ---------- 2-bosqich: qulflangan yo'l ----------
  function korishTask(r, prev, tier) {
    return pickNew((rr) => {
      const x = xabar(rr, Math.min(tier || 0, 1));
      const qulf = qulfla(x.matn, rr);
      const variantlar = aralash([qulf, x.matn, "parol: " + x.parol, "Hech narsa — paket boʻsh"], rr);
      return {
        tur: "korish", id: "korish:" + x.matn, xabar: x, qulf, javob: qulf, variantlar,
        matn: "Shu xabar qulfli yoʻl bilan yuborildi (🔒). Yoʻldagi tugun nimani koʻrdi?",
        ishora: "Qulfli yoʻlda paket ham, uzunligi ham bor — lekin ichini oʻqib boʻladimi?",
        nega: "Tugun paketni uzatadi, lekin ichida faqat tushunarsiz belgilar. Ochish kaliti faqat sayt bilan senda.",
      };
    }, prev, r);
  }

  const KAFOLAT = {
    savol: [
      { id: "kafolat", matn: "Manzil satrida qulf (🔒) bor. U nimani kafolatlaydi?", javob: "Yoʻlda hech kim oʻqiy olmaydi va manzil haqiqiy",
        soxta: ["Sayt halol va aldamaydi", "Parolim kuchli boʻladi", "Kompyuterimda virus yoʻq"] },
      { id: "yoq", matn: "Qulf (🔒) nimani kafolatlaMAYDI?", javob: "Sayt halol ekanini",
        soxta: ["Yoʻlda xabarni oʻqib boʻlmasligini", "Manzil haqiqiy ekanini", "Xabar yoʻlda oʻzgartirilmasligini"] },
    ],
  };
  function kafolatTask(r, prev) {
    return pickNew((rr) => {
      const s = pick(KAFOLAT.savol, rr);
      return {
        tur: "kafolat", id: "kafolat:" + s.id, matn: s.matn, javob: s.javob, variantlar: aralash([s.javob, ...s.soxta], rr),
        ishora: "Qulf yoʻl haqida — sayt egasining niyati haqida emas.",
        nega: "Qulf yoʻlni himoyalaydi va manzil oʻsha sayt ekanini tasdiqlaydi. Firibgar ham qulfli sayt ochishi mumkin.",
      };
    }, prev, r);
  }

  // ---------- Manzillar ----------
  const ASL = ["kelajagim.uz", "qabila.uz"];
  const BEGONA = ["sovga-yutuq.com", "xavfsiz-kirish.net", "bepul-oyin.org", "tez-bonus.com"];
  // Harfi almashgan o'xshash domenlar (rn ≈ m, 1 ≈ l, y ≈ i, chiziqcha bilan)
  const OXSHASH = {
    "kelajagim.uz": ["kelajagirn.uz", "ke1ajagim.uz", "kelajagym.uz", "kelajagim-uz.com"],
    "qabila.uz": ["qabi1a.uz", "gabila.uz", "qobila.uz", "qabila-uz.net"],
  };

  // Manzilning haqiqiy egasi: host'ning oxirgi ikki bo'lagi (a.b.sovga.com → sovga.com)
  function egasi(url) {
    const s = String(url).replace(/^[a-z]+:\/\//i, "");
    const host = s.split(/[/?#]/)[0].toLowerCase();
    const q = host.split(".").filter(Boolean);
    return q.slice(-2).join(".");
  }
  const qulflimi = (url) => /^https:\/\//i.test(String(url));

  // Manzil turi: togri | qulfsiz | begona (qulfli, boshqa domen) | oxshash (qulfli, harf almashgan)
  function turi(url, asl) {
    const e = egasi(url);
    if (e !== asl) return Object.values(OXSHASH).some((l) => l.includes(e)) ? "oxshash" : "begona";
    return qulflimi(url) ? "togri" : "qulfsiz";
  }

  const YOL = ["/kirish", "/", "/hisob"]; // qisqa — telefonda manzil bir qatorga sig'sin
  function manzillar(r, tier, asl) {
    const yol = pick(YOL, r);
    const togri = `https://${asl}${yol}`;
    const qulfsiz = `http://${asl}${yol}`;
    const begona = tier === 0 ? `https://${pick(BEGONA, r)}/${asl.split(".")[0]}` : `https://${asl}.${pick(BEGONA, r)}${yol}`;
    const oxshash = `https://${pick(tier === 0 ? OXSHASH[asl].slice(-1) : OXSHASH[asl].slice(0, 3), r)}${yol}`;
    return { togri, qulfsiz, begona, oxshash };
  }

  // ---------- 2-bosqich (davomi) va 3-bosqich: manzil satri ----------
  function qulfTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      const asl = pick(ASL, rr);
      const javob = `https://${asl}${pick(YOL, rr)}`;
      const aldov = t < 2
        ? [`http://${asl}/`, `http://${pick(BEGONA, rr)}/`, `http://${asl}/kirish`]
        : [`http://https.${asl}/`, `http://${asl}/https`, `http://${asl}/kirish?https=1`];
      const variantlar = [...new Set([javob, ...aldov])];
      if (variantlar.length < 4) return null;
      return {
        tur: "qulf", id: "qulf:" + javob + t, javob, variantlar: aralash(variantlar, rr),
        matn: "Qaysi manzil qulfli yoʻl bilan ochiladi?",
        ishora: "Manzilning eng boshiga qara: qulfli yoʻl «https://» bilan boshlanadi — oʻrtasida emas.",
        nega: `${javob} — «https://» bilan boshlanadi, 🔒 shu. Qolganlari «http://» — qulfsiz, «https» soʻzi oʻrtada boʻlsa ham.`,
      };
    }, prev, r);
  }

  // Qaysi saytga parol yozish mumkin? — 4 manzil: to'g'ri, qulfsiz, qulfli-begona, qulfli-o'xshash
  function ishonchTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      const asl = pick(ASL, rr);
      const m = manzillar(rr, t, asl);
      return {
        tur: "ishonch", id: `ishonch:${m.togri}:${m.begona}:${m.oxshash}`, asl, javob: m.togri, turlar: m,
        variantlar: aralash([m.togri, m.qulfsiz, m.begona, m.oxshash], rr),
        matn: `Senga «${asl}» saytiga kirish kerak. Qaysi manzilga parol yozsa boʻladi?`,
        ishora: "Ikki narsani tekshir: boshida «https://» bormi va oxirgi nuqtadan oldingi qism aynan shu saytmi.",
        nega: `Faqat ${m.togri}: qulf bor va egasi — ${asl}. ${m.begona} da ham qulf bor, lekin egasi — ${egasi(m.begona)}.`,
      };
    }, prev, r);
  }

  const XATO = { qulfsiz: "Qulf yoʻq (http)", begona: "Bu boshqa sayt", oxshash: "Bitta harf almashtirilgan", togri: "Hammasi joyida" };
  function nimaXatoTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      const asl = pick(ASL, rr);
      const m = manzillar(rr, t, asl);
      const tur = pick(Object.keys(XATO), rr);
      const url = m[tur];
      return {
        tur: "nima-xato", id: `nima-xato:${url}`, asl, url, holat: tur, javob: XATO[tur],
        variantlar: aralash(Object.values(XATO), rr),
        matn: `«${asl}» ga kirmoqchisan. Bu manzilda nima xato?`,
        ishora: "Boshini (https), keyin oxirgi nuqtadan oldingi nomni harfma-harf tekshir.",
        nega: tur === "togri" ? `Qulf bor va egasi — ${asl}.` : tur === "qulfsiz" ? "«http://» — yoʻl qulfsiz, parolni yoʻlda oʻqishadi."
          : tur === "begona" ? `Manzil egasi — ${egasi(url)}. «${asl}» soʻzi faqat boshida turibdi — aldov.` : `${egasi(url)} — ${asl} emas: bitta harf boshqacha.`,
      };
    }, prev, r);
  }

  // Manzilning haqiqiy egasi kim? — uzun manzil, 4 variant
  function egasiTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      const asl = pick(ASL, rr);
      const beg = pick(BEGONA, rr);
      const url = t === 0 ? `https://${asl}/kirish` : t === 1 ? `https://${asl}.${beg}/kirish` : `https://kirish.${asl}.${beg}/${asl.split(".")[0]}`;
      const javob = egasi(url);
      const nom = asl.split(".")[0];
      const variantlar = [...new Set(t === 0 ? [javob, "kirish", "https", nom] : [javob, asl, "kirish", nom])];
      if (variantlar.length < 4) return null;
      return {
        tur: "egasi", id: "egasi:" + url, url, javob, variantlar: aralash(variantlar, rr),
        matn: "Bu manzilning haqiqiy egasi kim?",
        ishora: "«https://» dan keyin birinchi «/» gacha boʻlgan qismni ol va uni oxiridan oʻqi: oxirgi ikki boʻlak.",
        nega: `Birinchi «/» gacha: ${url.replace(/^https?:\/\//, "").split("/")[0]}. Oxirgi ikki boʻlak — ${javob}.`,
      };
    }, prev, r);
  }

  const BOSQICH1 = [parolTask, uzelTask];
  const BOSQICH2 = [korishTask, kafolatTask, qulfTask];
  const BOSQICH3 = [ishonchTask, nimaXatoTask, egasiTask];
  const navbat = (bank) => (r, prev, n, tier) => bank[(n || 0) % bank.length](r, prev, tier);

  const api = {
    ISMLAR, SOZLAR, BELGILAR, ORTA, KAFOLAT, ASL, BEGONA, OXSHASH, XATO, BOSQICH1, BOSQICH2, BOSQICH3,
    xabar, qulfla, egasi, qulflimi, turi, manzillar,
    parolTask, uzelTask, korishTask, kafolatTask, qulfTask, ishonchTask, nimaXatoTask, egasiTask,
    bosqich1Task: navbat(BOSQICH1), bosqich2Task: navbat(BOSQICH2), bosqich3Task: navbat(BOSQICH3),
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
