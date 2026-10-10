// Qalʼa — oʻyin ekranlari: devor qurish, hujum, qorovul, doska, tahlil. Solo (robot) va onlayn bir xil ekran.
// Holatni tashqaridan oladi (QK.qala holati yoki paketdan tiklangan holat), oʻzi oʻzgartirmaydi — faqat chizadi
// va callback chaqiradi. Faqat bosish (QOIDALAR §3): kartalar, tugmalar, harf gʻildiragi, raqam klaviaturasi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, qala: Q, qalaUi: U, qalaProtokol: P } = QK;
  const h = ui.h;
  const DEVORLAR = P.DEVORLAR;
  const DEVOR_NOMI = { parol: "Parol", qulf: "Qulf", shifr: "Shifr", xat: "Xat", ikki: "Ikki qadam" };
  const DEVOR_IZOHI = {
    parol: "Kartalardan parol yigʻiladi (4 tagacha). Qoʻpol kuch va taxminga qarshi turadimi?",
    qulf: "Parolning izi saqlanadi. Tuz boʻlsa tayyor jadval ishlamaydi.",
    shifr: "Bayroq soʻzi shifrlanadi. Sezar bepul, kalitli shifr 4 ochko.",
    xat: "6 xatdan firibgarini belgila. Belgilanmagan firibgar — ochiq darvoza.",
    ikki: "Parol ochilsa ham kod kerak boʻladi. Kod faqat fishing orqali sizadi.",
  };
  const NARX = Q.NARX || { tuz: 3, kalitli: 4, ikki: 2 };
  // Voqea kodi (qala.js) → qisqa matn; boshlovchida toʻliq matn (v.matn) bor, telefonda faqat kod keladi
  const VOQEA_MATNI = {
    "qopol-ok": "Qoʻpol kuch parolni topdi", "qopol-yoq": "Qoʻpol kuchga vaqt yetmaydi",
    "taxmin-ok": "Parol maslahatdan topildi", "taxmin-xato": "Taxmin notoʻgʻri",
    "jadval-ok": "Iz tayyor jadvaldan topildi", "jadval-yoq": "Parol jadvalda yoʻq", "jadval-tuz": "Tuz bor — jadval ishlamaydi",
    "iz-ok": "Iz qoʻlda hisoblab topildi", "iz-xato": "Iz hisobi xato", "iz-mos-emas": "Hisob toʻgʻri, iz mos emas",
    "shifr-ok": "Shifr ochildi, bayroq olindi", "shifr-xato": "Siljish notoʻgʻri — jarima",
    "kalit-ok": "Kalit toʻgʻri, bayroq olindi", "kalit-xato": "Kalit notoʻgʻri — jarima",
    "fishing-keldi": "Qorovullarga xat keldi", "fishing-ochildi": "Qorovullar soxta xatni ochdi", "fishing-ochirildi": "Qorovullar soxta xatni oʻchirdi",
    darvoza: "Filtrda firibgar xat qoldi — darvoza ochiq", "ikki-ok": "Kod sizgan — ikki qadam ham yiqildi",
    "faza-himoya": "Himoya fazasi", "faza-hujum": "Hujum fazasi", "faza-tahlil": "Tahlil", tugadi: "Oʻyin tugadi",
  };
  const voqeaMatni = (v) => v.matn || VOQEA_MATNI[v.kod] || `${DEVOR_NOMI[v.devor] || v.devor || ""} ${v.ok ? "✓" : "✗"}`.trim();
  const FAZA_NOMI = { lobbi: "Kutish", himoya: "Himoya", hujum: "Hujum", tahlil: "Tahlil", tugadi: "Oʻyin tugadi" };
  const QISMLAR = ["kimdan", "mavzu", "havola", "gap", "imzo"];
  const QISM_NOMI = { kimdan: "Kimdan", mavzu: "Mavzu", havola: "Havola", gap: "Gap", imzo: "Imzo" };
  const ALIFBO = "abcdefghijklmnopqrstuvwxyz";
  const sek = (tugaydi, now) => Math.max(0, Math.ceil((tugaydi - now) / 1000));

  // ---------- Kichik yordamchilar ----------
  const chip = (matn, { tanlangan, onClick, cls, disabled, label } = {}) => {
    const b = h("button", { class: "tanlov-chip" + (tanlangan ? " tanlangan" : "") + (cls ? " " + cls : ""), type: "button",
      "aria-pressed": tanlangan ? "true" : "false", "aria-label": label || null, text: matn,
      onClick: () => { if (b.disabled) return; sound.play("tap"); onClick && onClick(); } });
    if (disabled) b.disabled = true;
    return b;
  };
  const izoh = (matn, cls) => h("p", { class: "oyin-izoh" + (cls ? " " + cls : ""), text: matn });
  const kichik = (matn) => h("div", { class: "oyin-kichik-sarlavha", text: matn });
  const kartaMatn = (id) => { const k = Q.karta(id); return k ? k.matn : String(id); };
  const parolMatni = (ids) => ids.map(kartaMatn).join("");

  // Xat qismi: id yoki obyekt → { id, matn, … } (XAT_QISMLAR dan)
  function qismObj(tur, q) {
    if (q && typeof q === "object") return q;
    const list = (Q.XAT_QISMLAR && Q.XAT_QISMLAR[tur]) || [];
    return list.find((x) => x.id === q) || { id: q, matn: q == null ? "" : String(q) };
  }
  const qismId = (q) => (q && typeof q === "object" ? q.id : q);
  // Mantiq xati yoki id'lar obyekti → { kimdan: obj, … }
  function xatQismlari(xat) {
    const src = xat && xat.qismlar ? xat.qismlar : xat || {};
    const out = {};
    QISMLAR.forEach((t) => { out[t] = qismObj(t, src[t]); });
    return out;
  }
  const xatIdlari = (xat) => { const q = xatQismlari(xat); const o = {}; QISMLAR.forEach((t) => { o[t] = qismId(q[t]); }); return o; };

  // Xat kartasi: kimdan, mavzu, gap, havola (bosilmaydigan matn), imzo
  function xatKarta(xat, cls) {
    const q = xatQismlari(xat);
    return h("div", { class: "xat-karta" + (cls ? " " + cls : "") },
      h("div", { class: "xat-qator" }, h("b", { text: "Kimdan: " }), h("span", { text: q.kimdan.matn })),
      h("div", { class: "xat-qator" }, h("b", { text: "Mavzu: " }), h("span", { text: q.mavzu.matn })),
      h("p", { class: "xat-gap", text: q.gap.matn }),
      h("div", { class: "xat-havola", text: q.havola.matn }),
      h("div", { class: "xat-imzo", text: q.imzo.matn }));
  }

  // Hujum javobi: Q.hujum natijasi → qisqa kod (tarmoqqa shu ketadi) → matn
  // Q.hujum rad etsa: xato kodi → "x" (umumiy), "j" (jarima), "u" (urinish tugadi), "y" (devor allaqachon yiqilgan)
  function javobKodi(tur, r) {
    if (!r || r.ok === false) return r && r.xato === "jazo" ? "j" : r && r.xato === "urinish" ? "u" : r && r.xato === "yiqilgan" ? "y" : "x";
    const n = r.natija || {};
    if (tur === "iz") return `h${n.hisobTogri ? 1 : 0}m${n.mos ? 1 : 0}o${n.ochildi ? 1 : 0}`;
    if (tur === "jadval") return n.ochildi ? "1" : n.mumkin ? "2" : "0";
    if (tur === "fishing") return "1";
    if (tur === "qopol") return n.ochildi ? "1" : "0";
    return n.togri ? "1" : "0"; // taxmin, shifr, kalit — ochiq matn xato boʻlsa ham keladi, faqat togri hisob
  }
  const RAD = { x: "↻ Hozir bu amal mumkin emas", j: "↻ Jarima — kutib tur", u: "↻ Urinishlar tugadi", y: "✓ Bu devor allaqachon yiqilgan" };
  const JAVOBLAR = {
    qopol: { 1: "✓ Qoʻpol kuch yetdi — parol devori yiqildi", 0: "↻ Qolgan vaqtga sigʻmaydi — parol kuchli" },
    taxmin: { 1: "✓ Parol topildi", 0: "↻ Notoʻgʻri parol" },
    jadval: { 1: "✓ Jadvaldan topildi — qulf yiqildi", 2: "↻ Parol jadvalda yoʻq", 0: "↻ Tuz bor — jadval ishlamaydi" },
    iz: { h0m0o0: "↻ Hisob notoʻgʻri — urinish kuydi", h0m1o0: "↻ Hisob notoʻgʻri — urinish kuydi", h1m0o0: "↻ Hisob toʻgʻri, lekin iz mos emas", h1m1o1: "✓ Iz mos — qulf yiqildi", h1m1o0: "↻ Iz mos, lekin devor turibdi" },
    shifr: { 1: "✓ Shifr ochildi — bayroq olindi", 0: "↻ Notoʻgʻri k — 15 soniya jarima" },
    kalit: { 1: "✓ Kalit toʻgʻri — shifr ochildi", 0: "↻ Kalit notoʻgʻri" },
    fishing: { 1: "✓ Xat yuborildi — raqib qorovullari hal qiladi", 0: "↻ Xat qabul qilinmadi" },
  };
  const javobMatni = (tur, kod) => RAD[kod] || (JAVOBLAR[tur] && JAVOBLAR[tur][kod]) || "↻ Natija yoʻq";

  // Parol kuchi: 4 boʻlakli oʻlchagich + bir gap (Q.parolKuch)
  function kuchMetr(ids) {
    const el = h("div", { class: "kuch" });
    if (!ids.length) { el.append(h("span", { class: "kuch-matn", text: "Parol tanlanmagan" })); return el; }
    const parol = Q.parolYasa(ids);
    const k = parol ? Q.parolKuch(parol) : null;
    const d = k ? Math.max(0, Math.min(3, k.daraja | 0)) : 0;
    const metr = h("div", { class: "kuch-metr d" + d, "aria-label": "kuch " + d + " / 3" });
    for (let i = 0; i < 4; i++) metr.append(h("i", { class: i <= d ? "on" : "" }));
    el.append(metr, h("span", { class: "kuch-matn", text: k ? k.matn || "" : "" }));
    return el;
  }

  // Karta tanlagich: tanlanganlar qatori (bosilsa — chiqadi) + soʻz / raqam / belgi guruhlari (bosilsa — qoʻshiladi)
  function kartaTanlagich(ids, onChange, maxKarta) {
    const el = h("div", { class: "karta-tanlagich" });
    const tanlanganlar = h("div", { class: "tanlangan-kartalar" });
    const yangila = () => {
      tanlanganlar.innerHTML = "";
      if (!ids.length) tanlanganlar.append(h("span", { class: "oyin-kichik", text: "Kartani bos — parolga qoʻshiladi" }));
      ids.forEach((id, k) => tanlanganlar.append(chip(kartaMatn(id), { tanlangan: true, label: kartaMatn(id) + " — olib tashlash",
        onClick: () => { ids.splice(k, 1); yangila(); onChange(ids); } })));
    };
    el.append(tanlanganlar);
    [["soz", "Soʻzlar"], ["raqam", "Raqamlar"], ["belgi", "Belgilar"]].forEach(([tur, nom]) => {
      const guruh = h("div", { class: "karta-guruh" }, kichik(nom));
      const qator = h("div", { class: "karta-qator" });
      ((Q.KARTALAR && Q.KARTALAR[tur]) || []).forEach((k) => qator.append(chip(k.matn, { cls: "karta " + tur,
        onClick: () => { if (ids.length >= (maxKarta || 4)) { ui.toast("Koʻpi bilan " + (maxKarta || 4) + " ta karta."); return; } ids.push(k.id); yangila(); onChange(ids); } })));
      guruh.append(qator);
      el.append(guruh);
    });
    yangila();
    return el;
  }

  // Uchta harf gʻildiragi (▲ harf ▼) — kalit uchun, klaviaturasiz
  function harfGildirak(qiymat, onChange) {
    const harflar = (qiymat || "aaa").split("").slice(0, 3);
    while (harflar.length < 3) harflar.push("a");
    const el = h("div", { class: "gildirak" });
    harflar.forEach((hf, i) => {
      const korsat = h("div", { class: "gildirak-harf", text: hf });
      const sur = (d) => { sound.play("tap"); harflar[i] = ALIFBO[(ALIFBO.indexOf(harflar[i]) + d + 26) % 26]; korsat.textContent = harflar[i]; onChange(harflar.join("")); };
      el.append(h("div", { class: "gildirak-ustun" },
        h("button", { class: "gildirak-btn", type: "button", text: "▲", "aria-label": (i + 1) + "-harf yuqoriga", onClick: () => sur(1) }),
        korsat,
        h("button", { class: "gildirak-btn", type: "button", text: "▼", "aria-label": (i + 1) + "-harf pastga", onClick: () => sur(-1) })));
    });
    return el;
  }

  // 1–25 tugmalar (Sezar siljishi)
  const kSonlar = (joriy, onPick) => {
    const el = h("div", { class: "k-sonlar" });
    for (let k = 1; k <= 25; k++) el.append(chip(String(k), { tanlangan: k === joriy, cls: "k-son", onClick: () => onPick(k) }));
    return el;
  };

  // Himoya qoralamasining narxi (Q.himoyaNarxi boʻlsa — undan)
  function narxi(d) {
    try { const n = Q.himoyaNarxi && Q.himoyaNarxi(d); if (typeof n === "number") return n; } catch (e) { /* oʻz hisobimiz */ }
    return (d.tuz ? NARX.tuz : 0) + (d.shifr === "kalitli" ? NARX.kalitli : 0) + (d.ikki ? NARX.ikki : 0);
  }

  // Xat filtri uchun 6 xat — Q.FILTR_XATLAR (id x1…x6, 3 tasi soxta; himoyaYasa filtr id'larini shundan tekshiradi)
  let FILTR = null;
  function filtrXatlari() {
    if (FILTR) return FILTR;
    const royxat = Array.isArray(Q.FILTR_XATLAR) && Q.FILTR_XATLAR.length ? Q.FILTR_XATLAR : [0, 1, 2, 3, 4, 5].map(() => Q.haqiqiyXat(Math.random));
    FILTR = royxat.slice(0, 6).map((x, i) => ({ id: x.id || "x" + (i + 1), qismlar: xatQismlari(x), xat: x, soxta: !!x.soxta }));
    return FILTR;
  }

  // ================= 1. Himoya qurish =================
  // { himoya (qoralama), byudjet, onChange(d), onTayyor(d) — solo, onYubor(dev, d) — onlayn (har devorda «Yuborish»),
  //   tugaydi (vaqt, ixtiyoriy), faqat: [devor…] (faqat shu devorlar), qoyildi: { devor: true } }
  function devorlar(el, { himoya, byudjet, onChange, onTayyor, onYubor, tugaydi, faqat, qoyildi, tugmalar }) {
    const d = Object.assign({ parol: [], tuz: 0, shifr: "sezar", k: 3, kalit: "abc", bayroq: (Q.BAYROQLAR && Q.BAYROQLAR[0] || {}).id, ikki: false, filtr: [] }, himoya || {});
    d.parol = (d.parol || []).slice();
    d.filtr = (d.filtr || []).slice();
    byudjet = byudjet == null ? Q.BYUDJET : byudjet;
    let qoyilgan = Object.assign({}, qoyildi || {});
    const royxat = faqat && faqat.length ? DEVORLAR.filter((x) => faqat.includes(x)) : DEVORLAR;
    const bosh = h("div", { class: "oyin-bosh" });
    const byudjetEl = h("div", { class: "byudjet", "aria-live": "polite" });
    bosh.append(h("div", { class: "oyin-sarlavha", text: "Himoya: qalʼani qur" }), byudjetEl);
    const taymer = tugaydi ? U.taymer(bosh) : null;
    const box = h("div", { class: "devorlar" });
    el.append(bosh, box);
    const kartalar = {};
    const yaroqli = {
      parol: () => d.parol.length >= 1,
      qulf: () => true,
      shifr: () => !!d.bayroq && (d.shifr === "sezar" ? d.k >= 1 && d.k <= 25 : /^[a-z]{3}$/.test(d.kalit)),
      xat: () => true,
      ikki: () => true,
    };
    const ozgardi = (dev) => { byudjetChiz(); kartalar[dev] && kartalar[dev].yangila(); onChange && onChange(Object.assign({}, d)); tayyorTugma(); };
    const oshadi = (qoshimcha) => narxi(d) + qoshimcha > byudjet;

    function byudjetChiz() {
      const n = narxi(d);
      byudjetEl.textContent = `Byudjet: ${n} / ${byudjet}`;
      byudjetEl.classList.toggle("tola", n >= byudjet);
    }
    const tayyorTugma = () => { if (onTayyor && tayyor) tayyor.disabled = !(yaroqli.parol() && yaroqli.shifr()); };
    let tayyor = null;

    function karta(dev) {
      const el2 = h("section", { class: "devor-karta devor-" + dev });
      const holat = h("span", { class: "devor-holat" });
      el2.append(h("div", { class: "devor-sarlavha" }, h("span", { class: "devor-nom", text: DEVOR_NOMI[dev] }), holat), izoh(DEVOR_IZOHI[dev]));
      const tana = h("div", { class: "devor-tana" });
      el2.append(tana);
      let yubor = null;
      if (onYubor) {
        yubor = ui.button("Yuborish", () => { if (!yaroqli[dev]()) return; onYubor(dev, Object.assign({}, d)); }, "sm");
        el2.append(h("div", { class: "devor-yubor" }, yubor));
      }
      function yangila() {
        tana.innerHTML = "";
        if (dev === "parol") {
          tana.append(kuchMetr(d.parol), kartaTanlagich(d.parol, () => ozgardi("parol"), 4));
        } else if (dev === "qulf") {
          tana.append(h("div", { class: "tanlov-qator" },
            chip("Tuzsiz (0)", { tanlangan: !d.tuz, onClick: () => { d.tuz = 0; ozgardi(dev); } }),
            chip(d.tuz ? `Tuz: ${d.tuz} (${NARX.tuz})` : `Tuz qoʻshish (${NARX.tuz})`, { tanlangan: !!d.tuz, disabled: !d.tuz && oshadi(NARX.tuz),
              onClick: () => { if (!d.tuz) d.tuz = 1 + Math.floor(Math.random() * 99); else d.tuz = 1 + Math.floor(Math.random() * 99); ozgardi(dev); } })),
            izoh(d.tuz ? "Iz tuz bilan hisoblanadi — tayyor jadval mos kelmaydi." : "Tuzsiz iz jadvalda bor — raqib bir bosishda topishi mumkin.", "kichik"));
        } else if (dev === "shifr") {
          const bayroqlar = h("div", { class: "tanlov-qator" });
          (Q.BAYROQLAR || []).forEach((b) => bayroqlar.append(chip(b.soz, { tanlangan: d.bayroq === b.id, onClick: () => { d.bayroq = b.id; ozgardi(dev); } })));
          tana.append(kichik("Bayroq soʻzi"), bayroqlar, kichik("Shifr turi"), h("div", { class: "tanlov-qator" },
            chip("Sezar (0)", { tanlangan: d.shifr === "sezar", onClick: () => { d.shifr = "sezar"; ozgardi(dev); } }),
            chip(`Kalitli (${NARX.kalitli})`, { tanlangan: d.shifr === "kalitli", disabled: d.shifr !== "kalitli" && oshadi(NARX.kalitli), onClick: () => { d.shifr = "kalitli"; ozgardi(dev); } })));
          if (d.shifr === "sezar") tana.append(kichik("Siljish k"), kSonlar(d.k, (k) => { d.k = k; ozgardi(dev); }));
          else tana.append(kichik("Kalit — 3 harf"), harfGildirak(d.kalit, (v) => { d.kalit = v; byudjetChiz(); onChange && onChange(Object.assign({}, d)); }));
          const b = (Q.BAYROQLAR || []).find((x) => x.id === d.bayroq);
          if (b) {
            let m = "";
            try { m = d.shifr === "sezar" ? Q.sezar(b.soz, d.k) : Q.vijener(b.soz, d.kalit); } catch (e) { m = ""; }
            if (m) tana.append(h("div", { class: "shifr-matn", "aria-label": "shifrlangan bayroq", text: m }));
          }
        } else if (dev === "xat") {
          const royxat2 = h("div", { class: "filtr-royxat" });
          filtrXatlari().forEach((x) => {
            const bor = d.filtr.includes(x.id);
            const k = xatKarta(x, "kichik" + (bor ? " belgilangan" : ""));
            k.append(h("div", { class: "filtr-belgi", text: bor ? "✓ Firibgar deb belgilandi" : "Haqiqiy deb qoldirildi" }));
            k.setAttribute("role", "button");
            k.setAttribute("tabindex", "0");
            const toggle = () => { sound.play("tap"); if (bor) d.filtr = d.filtr.filter((v) => v !== x.id); else d.filtr.push(x.id); ozgardi(dev); };
            k.addEventListener("click", toggle);
            k.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
            royxat2.append(k);
          });
          tana.append(izoh("Xatni bos — firibgar deb belgilanadi. Yana bossang — haqiqiy.", "kichik"), royxat2);
        } else if (dev === "ikki") {
          tana.append(h("div", { class: "tanlov-qator" },
            chip("Yoʻq (0)", { tanlangan: !d.ikki, onClick: () => { d.ikki = false; ozgardi(dev); } }),
            chip(`Ikki qadamli (${NARX.ikki})`, { tanlangan: !!d.ikki, disabled: !d.ikki && oshadi(NARX.ikki), onClick: () => { d.ikki = true; ozgardi(dev); } })));
        }
        holat.textContent = qoyilgan[dev] ? "✓ Yuborildi" : yaroqli[dev]() ? "" : "— toʻldirilmagan";
        holat.className = "devor-holat" + (qoyilgan[dev] ? " ok" : "");
        if (yubor) yubor.disabled = !yaroqli[dev]();
      }
      yangila();
      return { el: el2, yangila };
    }
    royxat.forEach((dev) => { kartalar[dev] = karta(dev); box.append(kartalar[dev].el); });
    byudjetChiz();
    if (onTayyor) {
      tayyor = ui.button("Tayyor — hujumga", () => { if (!tayyor.disabled) onTayyor(Object.assign({}, d)); });
      ui.clearControl();
      const row = h("div", { class: "choice-row" }, tayyor);
      (tugmalar || []).forEach((b) => row.append(ui.button(b.label, b.onClick, b.secondary ? "secondary" : "")));
      ui.control().append(row);
      tayyorTugma();
    }
    return {
      holat: () => Object.assign({}, d),
      render(now) { if (taymer) taymer(sek(tugaydi, now)); },
      yangila(q) { if (q && q.qoyildi) { qoyilgan = Object.assign({}, q.qoyildi); royxat.forEach((dev) => kartalar[dev].yangila()); } if (q && q.tugaydi) tugaydi = q.tugaydi; },
    };
  }

  // ================= 2. Hujum =================
  // { korinish (raqib qalʼasi — Q.korinish), urinish {taxmin, iz, shifr}, tugaydi, devorlar: [nishonlar], yiqilgan: [devor…],
  //   sizdi: ["kod"|"kalit"], kalit (sizgan boʻlsa), fishingYuborildi, onAmal(amal), tugmalar (klaviaturadan keyin qaytariladi) }
  function hujum(el, opts) {
    const st = Object.assign({ korinish: {}, urinish: {}, devorlar: P.HUJUM_DEVORLARI, yiqilgan: [], sizdi: [], kalit: "", fishingYuborildi: false }, opts);
    const nishonlar = st.devorlar.filter((x) => P.HUJUM_DEVORLARI.includes(x));
    const taxminIds = [];
    const izIds = [];
    const fsel = {};
    let kalitim = st.kalit || "aaa";
    let jarimaGacha = 0;
    let joriy = nishonlar.find((x) => !st.yiqilgan.includes(x)) || nishonlar[0];
    const bosh = h("div", { class: "oyin-bosh" });
    bosh.append(h("div", { class: "oyin-sarlavha", text: "Hujum: raqib qalʼasi" }));
    const taymer = st.tugaydi ? U.taymer(bosh) : null;
    const urinishEl = h("div", { class: "urinish" });
    const chips = h("div", { class: "hujum-chips" });
    const panel = h("div", { class: "hujum-panel" });
    const holatEl = h("div", { class: "oyin-holat", "aria-live": "polite" });
    el.append(bosh, urinishEl, chips, holatEl, panel);
    const yiqildi = (dev) => st.yiqilgan.includes(dev);
    const amal = (a) => { if (jarimaGacha > Date.now()) { ui.toast("Jarima — kutib tur."); return; } st.onAmal && st.onAmal(a); };

    function urinishChiz() {
      const u = st.urinish || {};
      urinishEl.textContent = `Urinishlar — taxmin: ${u.taxmin | 0} · iz: ${u.iz | 0}` + (jarimaGacha > Date.now() ? ` · jarima ${sek(jarimaGacha, Date.now())} s` : "");
    }
    function chipsChiz() {
      chips.innerHTML = "";
      nishonlar.forEach((dev) => chips.append(chip(DEVOR_NOMI[dev] + (yiqildi(dev) ? " ✓" : ""), { tanlangan: dev === joriy, cls: yiqildi(dev) ? "yiqildi" : "", onClick: () => { joriy = dev; chiz(); } })));
    }
    function maslahatlar() {
      const ul = h("ul", { class: "maslahatlar" });
      (st.korinish.maslahat || []).forEach((m) => ul.append(h("li", { text: m })));
      if (!ul.children.length) ul.append(h("li", { text: "Maslahat yoʻq" }));
      return ul;
    }
    function chiz() {
      chipsChiz();
      panel.innerHTML = "";
      const k = st.korinish || {};
      if (yiqildi(joriy)) { panel.append(izoh(`${DEVOR_NOMI[joriy]} devori yiqilgan. Boshqa devorni tanla.`)); return; }
      if (joriy === "parol") {
        panel.append(kichik("Maslahatlar"), maslahatlar(),
          kichik("Qoʻpol kuch"), izoh("Oʻyin tezligi: 1 000 000 variant/s. Qolgan vaqtga sigʻsa — devor yiqiladi.", "kichik"),
          h("div", { class: "tanlov-qator" }, ui.button("Qoʻpol kuch", () => amal({ tur: "qopol", dev: "parol" }), "sm")),
          kichik("Taxmin"), kartaTanlagich(taxminIds, () => {}, 4),
          h("div", { class: "tanlov-qator" }, ui.button("Taxmin qil", () => { if (!taxminIds.length) { ui.toast("Avval kartalardan parol yigʻ."); return; } amal({ tur: "taxmin", dev: "parol", ids: taxminIds.slice() }); }, "sm")));
      } else if (joriy === "qulf") {
        panel.append(h("div", { class: "nishon-iz" }, h("span", { text: "Nishon izi: " }), h("b", { text: String(k.iz | 0) }), h("span", { text: k.tuz ? " · tuz bor" : " · tuzsiz" })));
        panel.append(kichik("Tayyor jadval"));
        if (k.tuz) panel.append(izoh("Tuz bor — tayyor jadval ishlamaydi. Izni qoʻlda hisobla.", "kichik"));
        else {
          let nomzodlar = [];
          try { nomzodlar = Q.jadvaldan(k.iz | 0, 0) || []; } catch (e) { nomzodlar = []; }
          panel.append(izoh(nomzodlar.length ? `Jadvalda shu izli parollar: ${nomzodlar.length} ta` : "Jadvalda bu iz yoʻq", "kichik"),
            h("div", { class: "tanlov-qator nomzodlar" }, ...nomzodlar.slice(0, 12).map((p) => h("span", { class: "nomzod", text: String(p) }))),
            h("div", { class: "tanlov-qator" }, ui.button("Jadvaldan ol", () => amal({ tur: "jadval", dev: "qulf" }), "sm")));
        }
        panel.append(kichik("Izni qoʻlda hisobla"), izoh("Nomzod kartalarini tanla, izini oʻzing hisobla va kirit. Hisob notoʻgʻri — urinish kuyadi.", "kichik"),
          kartaTanlagich(izIds, () => {}, 4),
          h("div", { class: "tanlov-qator" }, ui.button("Izini kiritish", async () => {
            if (!izIds.length) { ui.toast("Avval nomzod kartalarini tanla."); return; }
            if (jarimaGacha > Date.now()) return;
            holatEl.textContent = `Nomzod: ${parolMatni(izIds)}${k.tuz ? " (tuz bilan)" : ""} — izini kirit (0–99)`;
            const n = await ui.askNumber(2);
            if (st.tugmalar) U.buttons(st.tugmalar);
            amal({ tur: "iz", dev: "qulf", ids: izIds.slice(), hisob: n });
          }, "sm")));
      } else if (joriy === "shifr") {
        const m = k.shifrMatn || "";
        panel.append(kichik("Shifrlangan matn"), h("div", { class: "shifr-matn", text: m || "—" }));
        let ch = [];
        try { ch = Q.chastota(m) || []; } catch (e) { ch = []; }
        const eng = ch.length ? ch[0].soni : 0;
        const bars = h("div", { class: "chastota", role: "img", "aria-label": "harflar chastotasi" });
        ch.slice(0, 13).forEach((c) => bars.append(h("div", { class: "chastota-ustun" },
          h("i", { style: `height:${eng ? Math.round((c.soni / eng) * 100) : 0}%`, "aria-label": `${c.harf}: ${c.soni}` }),
          h("span", { class: "chastota-harf", text: c.harf }), h("span", { class: "chastota-son", text: String(c.soni) }))));
        panel.append(kichik("Chastota"), bars);
        if (k.shifr === "kalitli") {
          const sizgan = st.kalit || (st.sizdi.includes("kalit") ? st.kalit : "");
          panel.append(kichik("Kalitli shifr"), izoh(sizgan ? `Kalit sizdi: ${sizgan}` : "Kalit 3 harf — 17 576 variant. Fishing orqali sizdirmasa, vaqt yetmaydi.", "kichik"));
          if (sizgan && kalitim === "aaa") kalitim = sizgan;
          panel.append(harfGildirak(kalitim, (v) => { kalitim = v; }),
            h("div", { class: "tanlov-qator" }, ui.button("Kalitni sinash", () => amal({ tur: "kalit", dev: "shifr", kalit: kalitim }), "sm")));
        } else {
          panel.append(kichik("Sezar: siljish k"), izoh("Eng koʻp uchragan harf — odatda a. Notoʻgʻri k — 15 soniya jarima.", "kichik"),
            kSonlar(0, (kk) => amal({ tur: "shifr", dev: "shifr", k: kk })));
        }
      } else if (joriy === "xat") {
        if (st.fishingYuborildi) { panel.append(izoh("Bu raundda xat yuborilgan. Raqib qorovullari hal qiladi.")); return; }
        const Xq = Q.XAT_QISMLAR || {};
        const koz = h("div", { class: "fishing-koz" });
        const yuborBtn = ui.button("Xatni yuborish", () => { const x = Q.xatYasa(fsel); if (!x) { ui.toast("Ilmoq yoʻq — soxta havola yoki kod soʻrash kerak."); return; } amal(P.fishingPaket("xat", fsel)); }, "sm");
        const kozChiz = () => {
          koz.innerHTML = "";
          const tola = QISMLAR.every((t) => fsel[t]);
          if (!tola) { koz.append(izoh("Har qismdan bittadan tanla.", "kichik")); yuborBtn.disabled = true; return; }
          const x = Q.xatYasa(fsel);
          koz.append(xatKarta(fsel, "kichik"));
          if (!x) { koz.append(izoh("Ilmoq yoʻq: soxta havola yoki kod soʻrash boʻlmasa, bu hujum emas.", "kichik yana")); yuborBtn.disabled = true; return; }
          const ishonch = Math.max(0, Math.min(100, x.ishonch | 0));
          koz.append(h("div", { class: "ishonch", "aria-label": `ishonch ${ishonch} %` }, h("i", { style: `width:${ishonch}%` })),
            izoh(`Ishonch: ${ishonch} %` + (x.ilmoq ? ` · ilmoq: ${x.ilmoq === "kod" ? "kod soʻrash" : "havola"}` : ""), "kichik"));
          yuborBtn.disabled = false;
        };
        QISMLAR.forEach((t) => {
          const qator = h("div", { class: "tanlov-qator" });
          (Xq[t] || []).forEach((q) => qator.append(chip(q.matn, { tanlangan: fsel[t] === q.id, onClick: () => { fsel[t] = q.id; chiz(); } })));
          panel.append(kichik(QISM_NOMI[t]), qator);
        });
        panel.append(kichik("Xat"), koz, h("div", { class: "tanlov-qator" }, yuborBtn));
        kozChiz();
      }
    }
    chiz();
    urinishChiz();
    return {
      render(now) { if (taymer) taymer(sek(st.tugaydi, now)); if (jarimaGacha && jarimaGacha > now - 1000) urinishChiz(); },
      yangila(q) {
        const oldin = st.yiqilgan.join(",") + "|" + st.fishingYuborildi + "|" + (st.korinish.iz | 0) + (st.korinish.shifrMatn || "") + "|" + (st.kalit || "");
        Object.assign(st, q || {});
        urinishChiz();
        const keyin = st.yiqilgan.join(",") + "|" + st.fishingYuborildi + "|" + (st.korinish.iz | 0) + (st.korinish.shifrMatn || "") + "|" + (st.kalit || "");
        if (oldin !== keyin) { if (yiqildi(joriy)) joriy = nishonlar.find((x) => !yiqildi(x)) || joriy; chiz(); }
      },
      javob(tur, kod) {
        const matn = javobMatni(tur, kod);
        holatEl.textContent = matn;
        holatEl.className = "oyin-holat " + (matn.startsWith("✓") ? "ok" : "yana");
        sound.play(matn.startsWith("✓") ? "boom" : "retry");
        if (tur === "shifr" && kod === "0") { jarimaGacha = Date.now() + 15000; urinishChiz(); }
        if (tur === "fishing" && kod === "1") { st.fishingYuborildi = true; if (joriy === "xat") chiz(); }
      },
      tanla(dev) { if (nishonlar.includes(dev)) { joriy = dev; chiz(); } },
    };
  }

  // ================= 3. Qorovul =================
  // { xatlar: [xat × 4] (mantiq xati yoki id'lar), onOvoz(ovozlar [0/1 × 4]) }. Keyin natija(soxta, ochildi) — belgilar izohi
  function qorovul(el, { xatlar, onOvoz }) {
    const ovozlar = [];
    let k = 0;
    const box = h("div", { class: "qorovul" });
    const sarlavha = h("div", { class: "oyin-sarlavha", text: "Qorovul: xatlar keldi" });
    const joy = h("div", { class: "qorovul-joy" });
    box.append(sarlavha, izoh("Har xatga javob ber: ochaman yoki oʻchiraman. Biri — raqibning firibgar xati.", "kichik"), joy);
    el.append(box);
    function chiz() {
      joy.innerHTML = "";
      if (k >= xatlar.length) { joy.append(izoh("Javoblar yuborildi. Natijani kutamiz…")); return; }
      sarlavha.textContent = `Qorovul: xat ${k + 1} / ${xatlar.length}`;
      joy.append(xatKarta(xatlar[k]), h("div", { class: "tanlov-qator" },
        ui.button("Ochaman", () => ovoz(1), "sm"),
        ui.button("Oʻchiraman", () => ovoz(0), "sm secondary")));
    }
    function ovoz(v) {
      ovozlar.push(v);
      k++;
      chiz();
      if (k >= xatlar.length) onOvoz && onOvoz(ovozlar.slice());
    }
    chiz();
    return {
      ovozlar: () => ovozlar.slice(),
      natija(soxta, ochildi) {
        joy.innerHTML = "";
        sarlavha.textContent = ochildi ? "Firibgar xat ochildi — devor yiqildi" : "Firibgar xat oʻchirildi — devor turdi";
        xatlar.forEach((x, i) => {
          const karta = xatKarta(x, "kichik" + (i === soxta ? " soxta" : ""));
          const ov = ovozlar[i];
          karta.append(h("div", { class: "filtr-belgi", text: (i === soxta ? "Firibgar xat · " : "Haqiqiy xat · ") + (ov === 1 ? "sen ochding" : ov === 0 ? "sen oʻchirding" : "javob yoʻq") }));
          let belgilar = [];
          try { const xo = x && x.belgilar ? x : Q.xatYasa(xatIdlari(x)); belgilar = xo ? Q.xatBelgilari(xo) : []; } catch (e) { belgilar = []; }
          if (i === soxta && belgilar.length) karta.append(h("ul", { class: "belgilar" }, ...belgilar.map((b) => h("li", {}, h("b", { text: b.nom + ": " }), h("span", { text: b.izoh })))));
          joy.append(karta);
        });
      },
    };
  }

  // ================= 4. Doska (boshlovchi ekrani / proyektor) =================
  // Ikki qalʼa (SVG, matnsiz), faza + taymer, ochko, voqealar lentasi. render(now, s) — har 250 ms
  function qalaSvg(jam) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 320 130");
    svg.setAttribute("class", "qala-svg jam-" + jam);
    svg.setAttribute("aria-hidden", "true");
    const mk = (tag, attrs) => { const e = document.createElementNS(ns, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };
    svg.append(mk("rect", { x: 0, y: 118, width: 320, height: 12, class: "yer" }));
    DEVORLAR.forEach((dev, i) => {
      const x = 8 + i * 62;
      const g = mk("g", { class: "devor", "data-devor": dev });
      g.append(mk("rect", { x, y: 46, width: 52, height: 72, rx: 3, class: "tosh" }));
      for (let t = 0; t < 3; t++) g.append(mk("rect", { x: x + 2 + t * 18, y: 36, width: 12, height: 12, class: "tosh" }));
      g.append(mk("line", { x1: x, y1: 70, x2: x + 52, y2: 70, class: "chok" }), mk("line", { x1: x, y1: 94, x2: x + 52, y2: 94, class: "chok" }));
      g.append(mk("polyline", { points: `${x + 26},46 ${x + 20},62 ${x + 32},74 ${x + 22},92 ${x + 30},118`, class: "yoriq" }));
      g.append(mk("path", { d: `M${x + 6},118 l6,-10 l8,6 l9,-8 l8,12 l9,-6 l6,6 z`, class: "uyum" }));
      svg.append(g);
    });
    svg.append(mk("line", { x1: 164, y1: 36, x2: 164, y2: 8, class: "bayroq-tayoq" }), mk("path", { d: "M164,8 l26,8 l-26,8 z", class: "bayroq" }));
    return svg;
  }

  function doska(el, s0) {
    const bosh = h("div", { class: "doska-bosh" });
    const faza = h("div", { class: "doska-faza" });
    const taymer = U.taymer(bosh);
    bosh.append(faza);
    const jamoalar = h("div", { class: "doska-jamoalar" });
    const q = {};
    P.JAMOALAR.forEach((jam) => {
      const ochko = h("span", { class: "doska-ochko", text: "0" });
      const svg = qalaSvg(jam);
      const yorliqlar = h("div", { class: "devor-yorliqlar" });
      const dlab = {};
      DEVORLAR.forEach((d) => { dlab[d] = h("span", { class: "devor-yorliq" }, h("b", { text: DEVOR_NOMI[d] }), h("i", { text: "" })); yorliqlar.append(dlab[d]); });
      const korinish = h("div", { class: "doska-korinish" });
      jamoalar.append(h("section", { class: "doska-qala jam-" + jam },
        h("div", { class: "doska-jamoa" }, h("span", { class: "jamoa-belgi", text: U.JAMOA[jam].belgi }), h("span", { class: "jamoa-nom", text: U.jamoaNomi(jam) + " qalʼasi" }), ochko),
        svg, yorliqlar, korinish));
      q[jam] = { ochko, svg, dlab, korinish };
    });
    const voqealar = h("ol", { class: "voqealar", "aria-live": "polite" });
    el.append(bosh, jamoalar, h("div", { class: "voqealar-wrap" }, kichik("Oxirgi voqealar"), voqealar));
    let imzo = "";
    function render(now, s) {
      s = s || s0;
      taymer(sek(s.fazaTugaydi || now, now));
      faza.textContent = `${s.raund ? s.raund + "-raund · " : ""}${FAZA_NOMI[s.faza] || s.faza}`;
      const yangiImzo = JSON.stringify([s.faza, P.JAMOALAR.map((j) => [s.jamoa[j].ochko, DEVORLAR.map((d) => s.jamoa[j].devor && s.jamoa[j].devor[d] && s.jamoa[j].devor[d].holat)]), (s.voqealar || []).length]);
      if (yangiImzo === imzo) return;
      const eskiImzo = imzo;
      imzo = yangiImzo;
      P.JAMOALAR.forEach((jam) => {
        const J = s.jamoa[jam];
        q[jam].ochko.textContent = String(J.ochko | 0);
        const k = J.korinish || (J.himoya && Q.korinish ? Q.korinish(J.himoya) : null);
        DEVORLAR.forEach((d) => {
          const yiq = !!(J.devor && J.devor[d] && J.devor[d].holat === "yiqildi");
          // Ikki qadamli tekshiruv qurilmagan bo'lsa — devor yo'q (tahlildagi "— qurilmagan" bilan bir xil)
          const yoq = d === "ikki" && !!k && !k.ikki;
          const g = q[jam].svg.querySelector(`[data-devor="${d}"]`);
          if (g.classList.contains("yiqildi") !== yiq) { g.classList.toggle("yiqildi", yiq); if (yiq && eskiImzo) sound.play("boom"); }
          g.classList.toggle("yoq", yoq);
          q[jam].dlab[d].querySelector("i").textContent = yiq ? "✗" : yoq ? "—" : "✓";
          q[jam].dlab[d].classList.toggle("yiqildi", yiq);
        });
        q[jam].korinish.innerHTML = "";
        if (k) [k.tuz ? "tuz bor" : "tuzsiz", k.shifr === "kalitli" ? "kalitli shifr" : "sezar", k.ikki ? "ikki qadam" : "bir qadam"].forEach((t) => q[jam].korinish.append(h("span", { class: "korinish-chip", text: t })));
      });
      voqealar.innerHTML = "";
      (s.voqealar || []).slice(-6).reverse().forEach((v) => voqealar.append(h("li", { class: v.ok ? "ok" : "" },
        h("span", { class: "voqea-jamoa jam-" + v.jamoa, text: U.jamoaNomi(v.jamoa) }),
        h("span", { text: voqeaMatni(v) }))));
    }
    render(Date.now(), s0);
    return { render };
  }

  // ================= 5. Tahlil =================
  // Ikki ustun: devor → turdi/yiqildi → sabab → «N-dars». Tarmoqdan kelgan holatda (s.tarmoq) sabab yoʻq — faqat holat.
  const DEVOR_DARSI = { parol: 1, qulf: 2, shifr: 3, xat: 4, ikki: 5 };
  function tahlilQatorlari(s, jam) {
    if (!s.tarmoq && Q.tahlil) { try { return Q.tahlil(s, jam) || []; } catch (e) { /* oddiy roʻyxat */ } }
    return DEVORLAR.map((d) => ({ devor: d, holat: s.jamoa[jam].devor[d].holat, sabab: "", dars: DEVOR_DARSI[d] }));
  }
  function tahlil(el, s, tugmalar) {
    const golib = s.golib || (s.faza === "tugadi" && Q.golib ? Q.golib(s) : null);
    const box = h("div", { class: "tahlil" });
    box.append(h("div", { class: "oyin-sarlavha", text: s.faza === "tugadi" ? "Oʻyin tugadi" : `${s.raund || 1}-raund tahlili` }),
      h("div", { class: "tahlil-hisob" },
        h("span", { class: "jam-oy", text: `${U.jamoaNomi("oy")} ${s.jamoa.oy.ochko | 0}` }), h("span", { text: " : " }), h("span", { class: "jam-quyosh", text: `${s.jamoa.quyosh.ochko | 0} ${U.jamoaNomi("quyosh")}` })));
    if (golib) box.append(izoh(golib === "durang" ? "Durang." : `Gʻolib — ${U.jamoaNomi(golib)} jamoasi.`));
    const ustunlar = h("div", { class: "tahlil-ustunlar" });
    P.JAMOALAR.forEach((jam) => {
      const ustun = h("section", { class: "tahlil-ustun jam-" + jam }, h("div", { class: "jamoa-nom", text: `${U.JAMOA[jam].belgi} ${U.jamoaNomi(jam)} qalʼasi` }));
      tahlilQatorlari(s, jam).forEach((r) => ustun.append(h("div", { class: "tahlil-qator " + (r.holat === "yiqildi" ? "yiqildi" : r.holat === "yoq" ? "yoq" : "turdi") },
        h("div", { class: "tahlil-devor" }, h("b", { text: DEVOR_NOMI[r.devor] || r.devor }), h("span", { class: "tahlil-holat", text: r.holat === "yiqildi" ? "✗ yiqildi" : r.holat === "yoq" ? "— qurilmagan" : "✓ turdi" })),
        r.sabab ? h("div", { class: "tahlil-sabab", text: r.sabab }) : null,
        r.dars ? h("span", { class: "dars-chip", text: `${r.dars}-dars` }) : null)));
      ustunlar.append(ustun);
    });
    box.append(ustunlar);
    el.append(box);
    if (tugmalar) U.buttons(tugmalar);
    return box;
  }

  // Kichik yakun kartasi (oʻyinchi telefoni): gʻolib va hisob
  function natijaKarta(el, s, menJam) {
    const golib = s.golib;
    const matn = golib === "durang" ? "Durang" : golib ? (golib === menJam ? "Jamoang yutdi" : "Raqib jamoa yutdi") : "Oʻyin tugadi";
    el.append(h("div", { class: "natija-karta" }, h("div", { class: "oyin-sarlavha", text: matn }),
      h("div", { class: "tahlil-hisob" }, h("span", { class: "jam-oy", text: `${U.jamoaNomi("oy")} ${s.jamoa.oy.ochko | 0}` }), h("span", { text: " : " }), h("span", { class: "jam-quyosh", text: `${s.jamoa.quyosh.ochko | 0} ${U.jamoaNomi("quyosh")}` }))));
  }

  QK.qalaOyinUi = { DEVOR_NOMI, FAZA_NOMI, NARX, VOQEA_MATNI, voqeaMatni, chip, izoh, kichik, xatKarta, xatQismlari, xatIdlari, javobKodi, javobMatni, kuchMetr, narxi, filtrXatlari, devorlar, hujum, qorovul, doska, tahlil, natijaKarta };
})(window);
