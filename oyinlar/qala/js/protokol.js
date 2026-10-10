// Qalʼa — onlayn xona protokoli: qurilmalar oʻrtasida nima yuboriladi (sof, Node'da test).
// Qoida (umumiy/js/onlayn.js): erkin matn yoʻq — faqat sonlar, 0/1, qisqa kalit soʻzlar [a-z0-9:_-]{0,32}
// va ularning ≤32 ta roʻyxati; data da ≤32 maydon, ichma-ich obyekt yoʻq. Shuning uchun holat paketi yassi.
// Himoya sirlari faqat quruvchi telefonidan boshlovchiga "himoya" bilan boradi; hammaga faqat korinish(h) tarqatiladi (holatda sir yoʻq).
(function (root) {
  "use strict";

  const TYPES = ["lobbi", "rol", "holat", "himoya", "amal", "ovoz", "xat"];
  const JAMOALAR = ["oy", "quyosh"];
  const DEVORLAR = ["parol", "qulf", "shifr", "xat", "ikki"];
  const HUJUM_DEVORLARI = ["parol", "qulf", "shifr", "xat"]; // ikki devoriga qurol yoʻq — parol + sizgan kod bilan yiqiladi
  const FAZALAR = ["lobbi", "himoya", "hujum", "tahlil", "tugadi"];
  const ROLLAR = ["qur", "huj", "qor"]; // quruvchi, hujumchi, qorovul
  const AMALLAR = ["qopol", "taxmin", "jadval", "iz", "shifr", "kalit", "fishing", "rol"];
  const SHIFRLAR = ["sezar", "kalitli"];
  const MAX_JAMOA = 15;
  const MAX_OYINCHI = 30;
  const MIN_JAMOA = 2;
  const HOST_JIM = 25000; // boshlovchidan shuncha vaqt xabar kelmasa — u uzilgan
  const ROL_JIM = 20000; // oʻyinchidan shuncha vaqt xabar kelmasa — roli boʻsh, jamoadoshi oladi
  const YUBORISH = 700; // boshlovchi holatni shuncha vaqtda bir tarqatadi
  const OVOZ_KUTISH = 60000; // qorovullar ovozini shuncha kutamiz, keyin kelganlari bilan hisoblanadi
  const VOQEA_SONI = 6, JAVOB_SONI = 8; // holatda oxirgi voqealar va hujumchilarga javoblar soni
  const TOKEN = /^[a-z0-9:_-]{0,32}$/i;
  const token = (v) => typeof v === "string" && TOKEN.test(v);
  const tokenlar = (a, n) => Array.isArray(a) && a.length <= n && a.every(token);
  const bit = (v) => v === 0 || v === 1;
  const bitlar = (a, n) => Array.isArray(a) && a.length === n && a.every(bit);
  const sonlar = (a, n) => Array.isArray(a) && a.length === n && a.every((v) => typeof v === "number" && v >= 0 && v < 1e9);
  const butun = (v, a, b) => Number.isInteger(v) && v >= a && v <= b;

  // Oʻyinchining yashirin raqami: ism emas, qurilmani tanish uchun (uzilsa — oʻsha roli bilan qaytadi)
  const kimlik = (rng) => Array.from({ length: 6 }, () => "abcdefghjkmnpqrstuvwxyz23456789"[Math.floor((rng || Math.random)() * 31)]).join("");

  // ---------- Jamoalar va rollar ----------
  // Kirish tartibi boʻyicha navbat bilan: 1-kirgan — Oy, 2-kirgan — Quyosh … Jamoada ≤ 15 kishi.
  function jamoagaBol(ids) {
    const out = { oy: [], quyosh: [] };
    ids.forEach((id, k) => { const j = out[JAMOALAR[k % 2]]; if (j.length < MAX_JAMOA) j.push(id); });
    return out;
  }
  // Yangi kirgan qaysi jamoaga: kichigiga, teng boʻlsa — Oy
  const jamoaTanla = (odamlar) => (odamlar.filter((o) => o.jam === "oy").length <= odamlar.filter((o) => o.jam === "quyosh").length ? "oy" : "quyosh");

  // Rollar: himoya fazasida har devorga 1–3 quruvchi (kam odam boʻlsa — bir kishi bir nechta devor);
  // hujum fazasida yarmi hujumchi (nishon devorlari navbat bilan), yarmi qorovul; 2-raundda almashadi.
  // jamoalar = { oy: [id…], quyosh: [id…] } (kirish tartibida). Natija: { id: { jam, rol, dev: [devor…] } }
  function rollar(jamoalar, raund, faza) {
    const out = {};
    const r = Math.max(1, raund | 0);
    for (const jam of JAMOALAR) {
      const m = (jamoalar[jam] || []).slice(0, MAX_JAMOA);
      const n = m.length;
      if (!n) continue;
      if (faza === "himoya") {
        m.forEach((id, i) => {
          const dev = n > DEVORLAR.length ? [DEVORLAR[(i + r - 1) % DEVORLAR.length]] : DEVORLAR.filter((d, w) => (w + r - 1) % n === i);
          out[id] = { jam, rol: "qur", dev };
        });
      } else {
        const yarim = Math.ceil(n / 2);
        const huj = m.filter((id, i) => (i < yarim) === (r % 2 === 1));
        const qor = m.filter((id) => !huj.includes(id));
        huj.forEach((id, j) => {
          const dev = huj.length >= HUJUM_DEVORLARI.length ? [HUJUM_DEVORLARI[j % HUJUM_DEVORLARI.length]] : HUJUM_DEVORLARI.filter((d, w) => w % huj.length === j);
          out[id] = { jam, rol: "huj", dev };
        });
        qor.forEach((id) => { out[id] = { jam, rol: "qor", dev: [] }; });
      }
    }
    return out;
  }

  // Boshlovchi → hamma: kim qaysi jamoada va roli (sir yoʻq). bosh — roli boʻsh (oʻyinchi jim) boʻlganlar
  function rolPaket(rollar_, raund, faza, bosh) {
    const ids = Object.keys(rollar_).slice(0, MAX_OYINCHI);
    return {
      r: raund | 0, f: faza, ids,
      jam: ids.map((id) => (rollar_[id].jam === "quyosh" ? 1 : 0)),
      rol: ids.map((id) => rollar_[id].rol),
      dev: ids.map((id) => rollar_[id].dev.join("-")),
      bosh: ids.map((id) => (bosh && bosh[id] ? 1 : 0)),
    };
  }
  function yaxshiRol(p) {
    if (!p || typeof p !== "object" || !Array.isArray(p.ids) || !p.ids.length || p.ids.length > MAX_OYINCHI) return false;
    const n = p.ids.length;
    if (!p.ids.every(token) || !bitlar(p.jam, n) || !bitlar(p.bosh, n)) return false;
    if (!Array.isArray(p.rol) || p.rol.length !== n || !p.rol.every((r) => ROLLAR.includes(r))) return false;
    if (!Array.isArray(p.dev) || p.dev.length !== n || !p.dev.every((d) => d === "" || d.split("-").every((x) => DEVORLAR.includes(x)))) return false;
    return butun(p.r, 1, 9) && FAZALAR.includes(p.f);
  }
  // Paketdan oʻz rolim: { jam, rol, dev: [devor…], bosh } | null
  function rolOl(p, me) {
    const k = p.ids.indexOf(me);
    if (k < 0) return null;
    return { jam: JAMOALAR[p.jam[k]], rol: p.rol[k], dev: p.dev[k] ? p.dev[k].split("-") : [], bosh: !!p.bosh[k] };
  }
  // Jamoadagi boʻsh rollar (uzilgan oʻyinchilarniki) — «Men olaman» uchun
  const boshRollar = (p, jam) => p.ids.map((id, k) => ({ id, rol: p.rol[k], dev: p.dev[k] ? p.dev[k].split("-") : [] }))
    .filter((x, k) => p.bosh[k] && JAMOALAR[p.jam[k]] === jam);

  // ---------- Parol maslahati ----------
  // qala.korinish(h).kod = { uzunlik, turlar: [soz|raqam|belgi…], lugat: 0|1|2 } → 3 kalit soʻz → matn (qala.maslahatMatn bilan bir xil)
  const TUR_NOMI = { soz: "soʻz", raqam: "raqam", belgi: "belgi" };
  const maslahatTokenlar = (kod) => (kod ? ["uz:" + (kod.uzunlik | 0), "tr:" + (kod.turlar || []).slice(0, 4).join("-"), "lg:" + (kod.lugat | 0)] : []);
  function maslahatKodOl(tokens) {
    const kod = { uzunlik: 0, turlar: [], lugat: 2 };
    (tokens || []).forEach((t) => {
      const [k, v] = String(t).split(":");
      if (k === "uz") kod.uzunlik = Number(v) || 0; else if (k === "tr") kod.turlar = v ? v.split("-") : []; else if (k === "lg") kod.lugat = Number(v) || 0;
    });
    return kod;
  }
  function maslahatMatn(kod) {
    const turlar = (kod.turlar || []).map((t) => TUR_NOMI[t] || t).join(" + ");
    return ["Uzunligi " + kod.uzunlik, turlar ? turlar[0].toUpperCase() + turlar.slice(1) : "Karta yoʻq",
      kod.lugat === 2 ? "Soʻz yoʻq" : kod.lugat === 1 ? "Soʻz lugʻatda bor" : "Soʻz lugʻatda yoʻq"];
  }
  // Shifrlangan matn: faqat a–z, 32 talik boʻlaklar (≤ 32 boʻlak)
  const bolak = (m) => (String(m || "").toLowerCase().replace(/[^a-z]/g, "").match(/.{1,32}/g) || []).slice(0, 32);
  const birlashtir = (a) => (Array.isArray(a) ? a.join("") : "");

  // ---------- Boshlovchi → hamma: holat ----------
  // q: { kor: { oy, quyosh } — Q.korinish(h) (boshlovchi hisoblab qoʻyadi), hq: { oy: {devor: 1}, … } — qoʻyilgan devorlar,
  //     jv: [{ id, tur, kod, seq }] — hujumchilarga javoblar, kalit: { oy: "abc" } — sizgan kalit }
  // Voqea: "jamoa:nishon:devor:kod" — jamoa/nishon 0 (oy) | 1 (quyosh) | "-"; kod — qala.js qisqa kodi (≤ 17 belgi, jami ≤ 27)
  const jIdx = (j) => (j === "oy" ? "0" : j === "quyosh" ? "1" : "-");
  const YOQ_KOD = /-(xato|yoq|tuz|mos-emas|ochirildi)$/; // shu kodlar — muvaffaqiyatsiz amal
  const voqeaKod = (v) => `${jIdx(v.jamoa)}:${jIdx(v.nishon)}:${v.devor || "-"}:${v.kod || (v.ok ? "ok" : "yoq")}`;
  const voqeaOch = (t) => { const [j, n, d, k] = String(t).split(":"); return { jamoa: JAMOALAR[j] || null, nishon: JAMOALAR[n] || null, devor: d === "-" ? null : d, kod: k || "", ok: !YOQ_KOD.test(k || "") }; };
  const javobKod = (j) => `${j.id}:${j.tur}:${j.kod}:${j.seq}`;
  function paket(s, now, q) {
    q = q || {};
    const kor = (t) => (q.kor && q.kor[t]) || {};
    const J = (t) => s.jamoa[t] || {};
    const ur = (t) => J(t).urinish || {};
    return {
      f: s.faza, r: s.raund | 0, q: Math.max(0, Math.ceil(((s.fazaTugaydi || now) - now) / 1000)),
      oc: JAMOALAR.map((t) => J(t).ochko | 0),
      yq: JAMOALAR.flatMap((t) => DEVORLAR.map((d) => (J(t).devor && J(t).devor[d] && J(t).devor[d].holat === "yiqildi" ? 1 : 0))),
      hq: JAMOALAR.flatMap((t) => DEVORLAR.map((d) => (q.hq && q.hq[t] && q.hq[t][d] ? 1 : 0))),
      ur: JAMOALAR.flatMap((t) => [ur(t).taxmin | 0, ur(t).iz | 0, ur(t).shifr | 0]),
      ms0: maslahatTokenlar(kor("oy").kod), ms1: maslahatTokenlar(kor("quyosh").kod),
      iz0: kor("oy").iz | 0, iz1: kor("quyosh").iz | 0,
      tz: JAMOALAR.map((t) => (kor(t).tuz ? 1 : 0)),
      sh: JAMOALAR.map((t) => (SHIFRLAR.includes(kor(t).shifr) ? kor(t).shifr : "sezar")),
      sm0: bolak(kor("oy").shifrMatn), sm1: bolak(kor("quyosh").shifrMatn),
      ik: JAMOALAR.map((t) => (kor(t).ikki ? 1 : 0)),
      sz0: (J("oy").sizdi || []).filter(token).slice(0, 4), sz1: (J("quyosh").sizdi || []).filter(token).slice(0, 4),
      kl: JAMOALAR.map((t) => (q.kalit && token(q.kalit[t]) ? q.kalit[t] : "")),
      vq: (s.voqealar || []).slice(-VOQEA_SONI).map(voqeaKod),
      jv: (q.jv || []).slice(-JAVOB_SONI).map(javobKod),
      tugadi: s.faza === "tugadi" ? 1 : 0,
      golib: s.faza === "tugadi" && s.golib ? s.golib : "",
    };
  }
  function yaxshiPaket(p) {
    if (!p || typeof p !== "object" || !FAZALAR.includes(p.f) || !butun(p.r, 0, 9)) return false;
    if (typeof p.q !== "number" || p.q < 0 || !sonlar(p.oc, 2) || !bitlar(p.yq, 10) || !bitlar(p.hq, 10) || !sonlar(p.ur, 6)) return false;
    if (!tokenlar(p.ms0, 3) || !tokenlar(p.ms1, 3) || !butun(p.iz0, 0, 99999) || !butun(p.iz1, 0, 99999)) return false;
    if (!bitlar(p.tz, 2) || !bitlar(p.ik, 2) || !Array.isArray(p.sh) || p.sh.length !== 2 || !p.sh.every((x) => SHIFRLAR.includes(x))) return false;
    if (!tokenlar(p.sm0, 32) || !tokenlar(p.sm1, 32) || !tokenlar(p.sz0, 4) || !tokenlar(p.sz1, 4) || !tokenlar(p.kl, 2) || p.kl.length !== 2) return false;
    if (!tokenlar(p.vq, VOQEA_SONI) || !tokenlar(p.jv, JAVOB_SONI) || !bit(p.tugadi)) return false;
    return p.golib === "" || p.golib === "durang" || JAMOALAR.includes(p.golib);
  }
  // Paketdan ekran holati (oʻyinchi telefoni): qala.create() holatiga oʻxshash, lekin sirsiz (tarmoq: true)
  function holat(p, now) {
    const s = { tarmoq: true, faza: p.f, raund: p.r, fazaTugaydi: now + p.q * 1000, tugadi: !!p.tugadi, golib: p.golib || null, jamoa: {}, voqealar: [], javoblar: [] };
    JAMOALAR.forEach((t, k) => {
      const devor = {};
      const qoyildi = {};
      DEVORLAR.forEach((d, w) => { devor[d] = { holat: p.yq[k * 5 + w] ? "yiqildi" : "turdi" }; qoyildi[d] = !!p.hq[k * 5 + w]; });
      const kod = maslahatKodOl(k ? p.ms1 : p.ms0);
      s.jamoa[t] = {
        ochko: p.oc[k], devor, qoyildi,
        korinish: { maslahat: (k ? p.ms1 : p.ms0).length ? maslahatMatn(kod) : [], kod, iz: k ? p.iz1 : p.iz0, tuz: !!p.tz[k], shifr: p.sh[k], shifrMatn: birlashtir(k ? p.sm1 : p.sm0), ikki: !!p.ik[k] },
        urinish: { taxmin: p.ur[k * 3], iz: p.ur[k * 3 + 1], shifr: p.ur[k * 3 + 2] },
        sizdi: (k ? p.sz1 : p.sz0).slice(), kalit: p.kl[k] || "",
      };
    });
    s.voqealar = p.vq.map(voqeaOch);
    s.javoblar = p.jv.map((v) => { const [id, tur, kod, seq] = v.split(":"); return { id, tur, kod, seq: Number(seq) || 0 }; });
    return s;
  }

  // ---------- Oʻyinchi → boshlovchi ----------
  // himoya: { dev, ids? (parol kartalari), tuz?, tur?, k?, kalit?, bayroq?, ikki?, filtr? } — faqat oʻz devori
  function yaxshiHimoya(d) {
    if (!d || !DEVORLAR.includes(d.dev)) return false;
    if (d.dev === "parol") return tokenlar(d.ids, 4) && d.ids.length >= 1;
    if (d.dev === "qulf") return butun(d.tuz, 0, 99);
    if (d.dev === "shifr") return SHIFRLAR.includes(d.tur) && token(d.bayroq) && (d.tur === "sezar" ? butun(d.k, 1, 25) : /^[a-z]{3}$/.test(String(d.kalit)));
    if (d.dev === "ikki") return bit(d.ikki);
    return tokenlar(d.filtr, 6);
  }
  // amal: { tur, dev?, ids?, hisob?, k?, kalit?, k/m/hv/g/im (fishing qismlari), kim? (rol olish) }
  function yaxshiAmal(d) {
    if (!d || !AMALLAR.includes(d.tur)) return false;
    if (d.tur === "rol") return token(d.kim) && d.kim.length > 0;
    if (!HUJUM_DEVORLARI.includes(d.dev)) return false;
    if (d.tur === "taxmin") return tokenlar(d.ids, 4) && d.ids.length >= 1;
    if (d.tur === "iz") return tokenlar(d.ids, 4) && d.ids.length >= 1 && butun(d.hisob, 0, 99);
    if (d.tur === "shifr") return butun(d.k, 1, 25);
    if (d.tur === "kalit") return /^[a-z]{3}$/.test(String(d.kalit));
    if (d.tur === "fishing") return ["k", "m", "hv", "g", "im"].every((x) => token(d[x]) && d[x].length > 0);
    return true; // qopol, jadval — qoʻshimcha maydon yoʻq
  }
  const fishingQismlar = (d) => ({ kimdan: d.k, mavzu: d.m, havola: d.hv, gap: d.g, imzo: d.im });
  const fishingPaket = (dev, q) => ({ tur: "fishing", dev, k: q.kimdan, m: q.mavzu, hv: q.havola, g: q.gap, im: q.imzo });
  // ovoz: { n: xat nomeri, ov: [0/1 × 4] } — 1 = ochaman
  const yaxshiOvoz = (d) => !!d && butun(d.n, 0, 99) && bitlar(d.ov, 4);

  // ---------- Boshlovchi → qorovullar: 4 xat (qism id'lari) va keyin javob (qaysi biri soxta edi) ----------
  function xatPaket(jam, n, xatlar) {
    const q = (x, k) => xatlar.map((xt) => String(xt[k]));
    return { jam, n, k: q(xatlar, "kimdan"), m: q(xatlar, "mavzu"), hv: q(xatlar, "havola"), g: q(xatlar, "gap"), im: q(xatlar, "imzo") };
  }
  const xatJavobPaket = (jam, n, soxta, ochildi) => ({ jam, n, s: soxta, och: ochildi ? 1 : 0 });
  function yaxshiXat(p) {
    if (!p || !JAMOALAR.includes(p.jam) || !butun(p.n, 0, 99)) return false;
    if (p.s !== undefined) return butun(p.s, 0, 3) && bit(p.och);
    return ["k", "m", "hv", "g", "im"].every((x) => tokenlar(p[x], 4) && p[x].length === 4);
  }
  const xatlarOl = (p) => (p.k ? [0, 1, 2, 3].map((i) => ({ kimdan: p.k[i], mavzu: p.m[i], havola: p.hv[i], gap: p.g[i], imzo: p.im[i] })) : null);

  // ---------- Yakun: server natijani sinfga yozadi (xona_natija.MAYDONLAR["qala"]) ----------
  // yiqitdi — { id: devor soni }; gʻolib jamoa birinchi, ichida koʻp yiqitgan oldinda
  function natijaPaket(s, rollar_, yiqitdi, golib) {
    const och = (t) => (s.jamoa[t] && s.jamoa[t].ochko) | 0;
    const ids = Object.keys(rollar_).slice(0, MAX_OYINCHI).sort((a, b) => {
      const ja = rollar_[a].jam, jb = rollar_[b].jam;
      if (ja !== jb) return (jb === golib) - (ja === golib) || och(jb) - och(ja);
      return ((yiqitdi && yiqitdi[b]) | 0) - ((yiqitdi && yiqitdi[a]) | 0);
    });
    return {
      tugadi: 1, ids,
      jam: ids.map((id) => (rollar_[id].jam === "quyosh" ? 1 : 0)),
      och: ids.map((id) => och(rollar_[id].jam)),
      dev: ids.map((id) => (yiqitdi && yiqitdi[id]) | 0),
      golib: golib || "durang",
    };
  }

  const api = {
    TYPES, JAMOALAR, DEVORLAR, HUJUM_DEVORLARI, FAZALAR, ROLLAR, AMALLAR, SHIFRLAR, MAX_JAMOA, MAX_OYINCHI, MIN_JAMOA,
    HOST_JIM, ROL_JIM, YUBORISH, OVOZ_KUTISH, VOQEA_SONI, JAVOB_SONI,
    kimlik, token, jamoagaBol, jamoaTanla, rollar, rolPaket, yaxshiRol, rolOl, boshRollar,
    maslahatTokenlar, maslahatKodOl, maslahatMatn, bolak, birlashtir, voqeaKod, voqeaOch, javobKod, paket, yaxshiPaket, holat,
    yaxshiHimoya, yaxshiAmal, fishingQismlar, fishingPaket, yaxshiOvoz, xatPaket, xatJavobPaket, yaxshiXat, xatlarOl, natijaPaket,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.qalaProtokol = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
