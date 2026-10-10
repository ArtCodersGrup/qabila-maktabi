// Qalʼa — darslar ekrani: 5 dars × 3 mashq. Roʻyxat → dars (kirish → mashqlar → yakun).
// Mashq generatorlari QK.qalaDarsMantiq (dNx(prev, rng, tier) → task), atamalar va devorlar QK.qala dan keladi;
// bu fayl faqat ekranni chizadi. Mashq sikli — umumiy practice.js (kattalar qoidasi: tez zina, qisqa ✓).
// Vazifa turlari (task.tur): son, tanlov, matn-tanlov, tartib, dialog, byudjet.
// Sof yordamchilar QK.qalaDars.sof da — Node testlari uchun.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, practice, sound } = QK;
  const U = QK.qalaUi;
  const h = ui.h;
  const KALIT = "qala:dars:v1";
  const JAMI = 5;

  // ---------- Darslar matni (5–8 ohangi: maqsad → atama → mashq) ----------
  const DARSLAR = [
    {
      nom: "Parol", izoh: "Qoʻpol kuch, lugʻat hujumi, parol-ibora",
      atamalar: ["parol", "qopol", "lugat", "ibora"],
      maqsad: "Maqsad: parolni hujumchi koʻzi bilan baholash — nechta variant, necha soniya.",
      devor: "Oʻyinda bu 1-devor. Hujumchi soniyasiga 1 000 000 variant sinaydi; lugʻatdagi soʻz 1 soniyada ochiladi.",
      mashqlar: [
        { gen: "d1a", korsatma: "Variantlar soni: har oʻringa nechta belgi mumkin boʻlsa, shuni uzunlik marta koʻpaytir. Tezlik — 1 000 000 variant/s." },
        { gen: "d1b", korsatma: "Toʻrt parol. Qaysi biri tez ochiladi? Eng tezidan eng sekiniga tartibla." },
        { gen: "d1c", korsatma: "Hujumchi faqat 3 maslahat koʻradi. Oltita nomzoddan shu maslahatlarga mos parolni top." },
      ],
      qoidalar: [
        "Uzunlik va belgi turlari variantlarni koʻpaytiradi: 4 harf — 456 976, 8 harf — 200 milliarddan koʻp.",
        "Lugʻatdagi soʻz raqam bilan ham 1 soniyada ochiladi. Uch-toʻrt soʻzli parol-ibora kuchliroq.",
      ],
    },
    {
      nom: "Qulf", izoh: "Xesh (iz), tuz, tayyor jadval",
      atamalar: ["xesh", "tuz", "jadval"],
      maqsad: "Maqsad: paroldan izini (xeshni) hisoblash va tuz nega kerakligini koʻrish.",
      devor: "Oʻyinda 2-devor: sayt parolni emas, izini saqlaydi. Tuzsiz iz tayyor jadvaldan bir zumda topiladi.",
      mashqlar: [
        { gen: "d2a", korsatma: "Iz: 0 dan boshla, har belgida x = x × 3 + belgi qiymati, oxirgi ikki raqam qoladi. Harf qiymati — alifbodagi oʻrni (a = 1), raqam — oʻzi." },
        { gen: "d2b", korsatma: "Beshta foydalanuvchi, beshta iz. Bir xil iz — bir xil parol; tayyor jadvalda iz → parol yozilgan." },
        { gen: "d2c", korsatma: "Endi tuz bor: hisob tuzdan boshlanadi, 0 dan emas. Izni hisobla." },
      ],
      qoidalar: [
        "Izdan parolni qaytarib boʻlmaydi, lekin bir xil parol — bir xil iz. Shuning uchun tayyor jadval ishlaydi.",
        "Tuz izni oʻzgartiradi: tayyor jadval (rainbow table) foydasiz, hujumchi har parolni qaytadan hisoblaydi.",
      ],
    },
    {
      nom: "Shifr", izoh: "Sezar, chastota tahlili, kalitli shifr",
      atamalar: ["shifr", "kalit", "chastota", "vijener"],
      maqsad: "Maqsad: Sezar shifrini kalitsiz ochish va kalitli shifr nega mustahkamligini bilish.",
      devor: "Oʻyinda 3-devor — bayroq soʻzi shifrlangan. Sezarda 25 siljish bor, kalitli shifrda 17 576 kalit.",
      mashqlar: [
        { gen: "d3a", korsatma: "Sezar: har harf alifbo boʻylab k ga suriladi. Shifrlangan soʻz va k berilgan — ochiq soʻzni tanla." },
        { gen: "d3b", korsatma: "Kalit yoʻq. Eng koʻp uchragan harf — koʻpincha «a». Eng baland ustun qaysi harf boʻlsa, undan «a» gacha siljish — bu k." },
        { gen: "d3c", korsatma: "Kalitli shifr: kalit 3 harf, qaytarilib yoziladi. Har harf oʻz ostidagi kalit harfi qancha boʻlsa, shuncha suriladi (a = 0)." },
      ],
      qoidalar: [
        "Sezar: eng koʻp harfni «a» deb olib k topiladi — bu chastota tahlili, 25 variant yetarli.",
        "Kalitli shifrda chastota buziladi: 26 × 26 × 26 = 17 576 kalit — hujum vaqtida sinab boʻlmaydi.",
      ],
    },
    {
      nom: "Xat", izoh: "Soxta domen, fishing, ijtimoiy muhandislik",
      atamalar: ["fishing", "ijtimoiy", "domen"],
      maqsad: "Maqsad: soxta manzilni va fishing xatni belgilaridan tanish.",
      devor: "Oʻyinda 4-devor: raqib xat yuboradi. Qorovul ochsa — devor yiqiladi, kod yoki kalit sizadi.",
      mashqlar: [
        { gen: "d4a", korsatma: "Ikki manzil, biri soxta. Domen — zonadan («.uz») oldingi oxirgi soʻz: harfi, zonasi yoki qoʻshimchasi oʻzgargan boʻladi." },
        { gen: "d4b", korsatma: "Suhbat. Avval javobni tanla, keyin hiylani nomla — ikkalasi toʻgʻri boʻlsa hisoblanadi." },
        { gen: "d4c", korsatma: "Uch xat. Eng shubhalidan eng ishonchlisiga tartibla: shoshiltirish, parol soʻrash, soxta havola — belgilar." },
      ],
      qoidalar: [
        "Domen — zonadan oldingi oxirgi soʻz: qabilabank.uz va qabila-bank.uz.xyz — boshqa-boshqa egalar.",
        "Shoshiltirish, qoʻrqitish, parol yoki kod soʻrash — fishing belgilari. Havolani bosmay, rasmiy ilovadan oʻzing kir.",
      ],
    },
    {
      nom: "Oq shlyapa", izoh: "Ruxsat, ikki qadamli tekshiruv, himoya byudjeti",
      atamalar: ["ikki", "xaker", "oqshlyapa", "ruxsat", "byudjet"],
      maqsad: "Maqsad: qaysi tekshiruv qonuniy, byudjetni qanday boʻlish va oʻyin qoidalarini bilish.",
      devor: "Oʻyinda 5-devor — ikki qadamli tekshiruv: parol ochilsa ham kod kerak. Byudjet 10 ochko, har devor vaqt oladi.",
      mashqlar: [
        { gen: "d5a", korsatma: "Vaziyat berilgan. Ruxsat bormi, qonuniymi — javobni tanla." },
        { gen: "d5b", korsatma: "Robot hujumchi profili berilgan. 10 ochkoga shunday devorlar tanlaki, hammasi tursin." },
        { gen: "d5c", korsatma: "Oʻyin qoidalari: faza, qurol, devor. Uch savol — keyin qalʼaga tayyor." },
      ],
      qoidalar: [
        "Oq shlyapa faqat ruxsat bilan tekshiradi va topganini egasiga aytadi — bu qonuniy.",
        "Byudjet 10: raqib qurollariga qarab devor tanlanadi — hammasini qurishga vaqt yetmaydi.",
      ],
    },
  ];
  const NOMLAR = DARSLAR.map((d) => d.nom);

  // ---------- Sof yordamchilar ----------
  // Saqlangan holat: { done: [5 ta bool] } — buzuq yozuv ham shu shaklga keltiriladi
  function holatniTuzat(raw) {
    const done = raw && Array.isArray(raw.done) ? raw.done : [];
    return { done: Array.from({ length: JAMI }, (_, k) => done[k] === true) };
  }
  function holatHisobla(done) {
    const bajarildi = (done || []).filter(Boolean).length;
    return { bajarildi, jami: JAMI, tayyor: bajarildi >= JAMI };
  }

  // Variant: satr yoki { id, matn|nom }; qiymati — id (boʻlsa) yoki matni
  const variantMatn = (v) => {
    if (v && typeof v === "object") return String(v.matn != null ? v.matn : v.nom != null ? v.nom : v.id);
    return String(v);
  };
  const variantQiymat = (v) => (v && typeof v === "object" && v.id != null ? v.id : variantMatn(v));
  // Javob: variant id/matni, {togri: true} belgisi yoki indeks (son) — k-variant toʻgʻrimi
  function variantMos(javob, variantlar, k) {
    const v = variantlar[k];
    if (v && typeof v === "object") {
      if (v.togri === true) return true;
      if (javob != null && (v.id === javob || variantMatn(v) === String(javob))) return true;
    } else if (javob != null && String(v) === String(javob)) return true;
    return typeof javob === "number" && javob === k && !variantlar.some((x) => String(variantQiymat(x)) === String(javob));
  }
  function javobMatni(javob, variantlar) {
    const k = variantlar.findIndex((_, i) => variantMos(javob, variantlar, i));
    return k < 0 ? String(javob) : variantMatn(variantlar[k]);
  }

  // Tartib: ikki roʻyxat element-ma-element teng (1 va "1" bir xil)
  const tartibTogri = (javob, berilgan) => Array.isArray(javob) && Array.isArray(berilgan)
    && javob.length === berilgan.length && javob.every((x, k) => String(x) === String(berilgan[k]));

  // Byudjet: tanlov { devorId: tanlovId } boʻyicha narxlar yigʻindisi
  function byudjetNarx(tanlov, devorlar) {
    return (devorlar || []).reduce((s, d) => {
      const t = (d.tanlov || []).find((x) => x.id === tanlov[d.id]);
      return s + (t ? Number(t.narx) || 0 : 0);
    }, 0);
  }
  // Tekshiruv natijasini bir shaklga keltirish: { ok, narx, devorlar: { id: { turdi, sabab } } }
  // Qabul qilinadi: { ok?, narx?, devorlar|natija: [{ id|devor, turdi|holat, sabab }] } yoki { parol: {turdi, sabab}, … }
  function natijaNormal(xom, devorlar, narx, byudjet) {
    const out = { ok: false, narx, devorlar: {} };
    if (!xom || typeof xom !== "object") return out;
    const list = Array.isArray(xom) ? xom : xom.devorlar || xom.natija || xom.qatorlar;
    if (Array.isArray(list)) {
      list.forEach((q) => { out.devorlar[q.id || q.devor] = { turdi: q.turdi === true || q.holat === "turdi", sabab: q.sabab || "" }; });
    } else {
      devorlar.forEach((d) => { const q = xom[d.id]; if (q && typeof q === "object") out.devorlar[d.id] = { turdi: q.turdi === true || q.holat === "turdi", sabab: q.sabab || "" }; });
    }
    if (typeof xom.narx === "number") out.narx = xom.narx;
    const ids = Object.keys(out.devorlar);
    out.ok = typeof xom.ok === "boolean" ? xom.ok : ids.length > 0 && ids.every((id) => out.devorlar[id].turdi) && out.narx <= byudjet;
    return out;
  }
  const uzunlik = (javob) => Math.min(12, Math.max(3, String(javob).length + 1));

  // ---------- Saqlash (localStorage; shaxsiy rejimda ham yiqilmaydi) ----------
  function yukla() {
    try { return holatniTuzat(JSON.parse(root.localStorage.getItem(KALIT) || "null")); } catch (e) { return holatniTuzat(null); }
  }
  function saqla(holat) {
    try { root.localStorage.setItem(KALIT, JSON.stringify(holat)); } catch (e) { /* saqlab boʻlmadi — dars baribir ishlaydi */ }
  }
  function belgila(idx) {
    const holat = yukla();
    holat.done[idx] = true;
    saqla(holat);
  }
  const holat = () => holatHisobla(yukla().done);

  // ---------- Mantiq bilan bogʻlanish ----------
  const M = () => QK.qalaDarsMantiq || {};
  const generator = (nom) => (typeof M()[nom] === "function" ? M()[nom] : null);
  // Darsning atamalari: QK.qala.ATAMALAR dan (dars raqami boʻyicha), boʻlmasa oʻz roʻyxatimiz
  function atamaIds(idx) {
    const list = (QK.qala && QK.qala.ATAMALAR) || [];
    const ids = list.filter((a) => Number(a.dars) === idx + 1).map((a) => a.id);
    return ids.length ? ids : DARSLAR[idx].atamalar;
  }
  // Firibgar hiylasining nomi: mantiq, qala yoki 52-oʻyin BELGILAR roʻyxatidan
  function belgiNomi(id) {
    const banklar = [M().BELGILAR, QK.qala && QK.qala.BELGILAR, QK.qalaLib && QK.qalaLib.xat && QK.qalaLib.xat.BELGILAR];
    for (const b of banklar) {
      const x = Array.isArray(b) && b.find((y) => y.id === id);
      if (x) return x.nom;
    }
    return String(id);
  }
  function aralash(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  // ---------- Umumiy boʻlaklar ----------
  let qaytish = null; // menyuga qaytish
  let yorliq = ""; // "Parol · 2/3"

  function vazifaQutisi(compact) {
    const el = U.box(compact);
    el.append(h("div", { class: "dars-yorliq" },
      h("button", { class: "back-link", type: "button", text: "◀︎ Darslar", onClick: () => { sound.play("tap"); royxat(); } }),
      h("span", { class: "dars-yorliq-matn", text: yorliq })));
    return el;
  }
  function qosh(host, ...nodes) {
    host.append(...nodes.filter(Boolean));
    const last = nodes[nodes.length - 1];
    if (last && last.scrollIntoView) last.scrollIntoView({ block: "nearest" });
  }
  const savolBlok = (el, task) => { if (task.savol) el.append(h("div", { class: "dars-savol", text: task.savol })); };

  // Chastota ustunlari: [{harf, soni}] — faqat 0 dan katta, eng koʻpi 10 ta
  function chastotaUstunlari(list) {
    const korsat = list.filter((x) => x.soni > 0).slice(0, 10);
    const eng = Math.max(1, ...korsat.map((x) => x.soni));
    return h("div", { class: "dars-chastota", "aria-label": "Harflar chastotasi" },
      ...korsat.map((x) => h("div", { class: "dars-ustun" },
        h("span", { class: "dars-ustun-harf", text: x.harf }),
        h("span", { class: "dars-ustun-chiziq", style: `width:${Math.round((100 * x.soni) / eng)}%` }),
        h("span", { class: "dars-ustun-son", text: String(x.soni) }))));
  }
  function jadvalBlok(rows) {
    const t = h("table", { class: "dars-jadval" });
    rows.forEach((r) => {
      const vals = Array.isArray(r) ? r : r && typeof r === "object" ? Object.values(r) : [r];
      t.append(h("tr", null, ...vals.map((v) => h("td", { text: String(v) }))));
    });
    return h("div", { class: "dars-jadval-wrap" }, t);
  }
  // Vazifa maʼlumoti: vaziyat, katta matn (parol, shifr), qatorlar, maslahatlar, chastota, jadval
  function malumot(el, task) {
    if (task.vaziyat) el.append(h("div", { class: "dars-vaziyat", text: task.vaziyat }));
    const katta = task.korsat != null ? task.korsat : task.matn;
    if (Array.isArray(katta)) el.append(h("div", { class: "dars-qatorlar" }, ...katta.map((s) => h("div", { class: "dars-qator", text: String(s) }))));
    else if (katta != null && katta !== "") el.append(h("div", { class: "dars-katta", text: String(katta) }));
    const maslahatlar = Array.isArray(task.maslahatlar) ? task.maslahatlar : Array.isArray(task.maslahat) ? task.maslahat : null;
    if (maslahatlar) el.append(h("ul", { class: "dars-maslahatlar" }, ...maslahatlar.map((s) => h("li", { text: String(s) }))));
    if (Array.isArray(task.chastota) && task.chastota.length) el.append(chastotaUstunlari(task.chastota));
    if (Array.isArray(task.jadval) && task.jadval.length) el.append(jadvalBlok(task.jadval));
  }
  // 1-xato: maslahat (task.izoh) — javobni aytmaydi
  function maslahat(el, task) {
    ui.bubble("elder", "↻ " + (task.izoh || "Yana bir bor oʻyla."));
    if (typeof task.maslahat === "string") qosh(el, h("div", { class: "dars-maslahat", text: task.maslahat }));
  }
  // 2-xato: yechim ekranda (practice "Toʻgʻri javob ekranda" deydi)
  function yechimKorsat(el, task, javobMatn) {
    qosh(el, h("div", { class: "dars-yechim" },
      javobMatn ? h("div", { class: "dars-javob", text: javobMatn }) : null,
      task.yechim ? h("div", { class: "dars-yechim-izoh", text: String(task.yechim) }) : null,
      Array.isArray(task.qadamlar) ? h("div", { class: "dars-qadamlar", text: task.qadamlar.join("   ") }) : null));
  }
  function maqtov(task) {
    if (task.maqtov) return task.maqtov;
    switch (task.tur) {
      case "son": return `Javob: ${task.javob}.`;
      case "tanlov": case "matn-tanlov": return `${javobMatni(task.javob, task.variantlar || [])}.`;
      case "tartib": return "Tartib toʻgʻri.";
      case "dialog": return "Javob ham, hiyla ham toʻgʻri.";
      case "byudjet": return "Hamma devor turadi.";
      default: return "Toʻgʻri.";
    }
  }

  // Variant tugmalari (ish zonasida) + ikki urinish. check(k) → bool; hint(k), solution(k)
  function tanlovTries(el, variantlar, { check, hint, solution }) {
    const qator = h("div", { class: "dars-variantlar" });
    el.append(qator);
    let tugmalar = [];
    return practice.tries({
      setup: (submit) => {
        tugmalar = variantlar.map((v, k) => {
          const b = h("button", { class: "btn secondary dars-variant", type: "button", text: variantMatn(v) });
          b.addEventListener("click", () => { if (b.disabled) return; sound.play("tap"); if (check(k)) b.classList.add("togri"); submit(k); });
          return b;
        });
        qator.append(...tugmalar);
      },
      check,
      hint: (k) => { tugmalar[k].classList.add("notogri"); tugmalar[k].disabled = true; hint(k); },
      solution: (k) => {
        tugmalar.forEach((b, i) => { b.disabled = true; if (check(i)) b.classList.add("togri"); else if (i === k) b.classList.add("notogri"); });
        solution(k);
      },
    });
  }

  // ---------- Vazifa turlari ----------
  // son: savol + maʼlumot, raqam klaviaturasi
  function sonTask(task) {
    const el = vazifaQutisi(true);
    savolBlok(el, task);
    malumot(el, task);
    ui.bubble("elder", "Hisobla va yoz.");
    return practice.numberTries({
      answer: Number(task.javob),
      maxLen: task.maxLen || uzunlik(task.javob),
      hint: () => maslahat(el, task),
      solution: () => yechimKorsat(el, task, `Javob: ${task.javob}`),
    });
  }

  // tanlov / matn-tanlov: variantlar katta tugmalar
  function tanlovTask(task) {
    const el = vazifaQutisi(true);
    savolBlok(el, task);
    malumot(el, task);
    const variantlar = task.variantlar || [];
    ui.bubble("elder", "Birini tanla.");
    return tanlovTries(el, variantlar, {
      check: (k) => variantMos(task.javob, variantlar, k),
      hint: () => maslahat(el, task),
      solution: () => yechimKorsat(el, task, javobMatni(task.javob, variantlar)),
    });
  }

  // tartib: bosib tartiblash (sudrash yoʻq — QOIDALAR §3). Bosilgan element javob qatoriga tushadi.
  function tartibTask(task) {
    const el = vazifaQutisi(true);
    savolBlok(el, task);
    malumot(el, task);
    const elementlar = task.elementlar || task.variantlar || [];
    const manba = h("div", { class: "dars-manba" });
    const javobQator = h("div", { class: "dars-tartib" });
    el.append(manba, javobQator);
    ui.bubble("elder", "Tartib bilan bos, keyin «Tekshir».");
    let tanlangan = [];
    let tugmalar = [];
    let tekshirTugma = null;
    const chiz = () => {
      javobQator.innerHTML = "";
      elementlar.forEach((_, k) => {
        const i = tanlangan[k];
        javobQator.append(h("div", { class: "dars-tartib-katak" + (i == null ? "" : " toliq") },
          h("span", { class: "dars-tartib-raqam", text: String(k + 1) }),
          h("span", { class: "dars-tartib-matn", text: i == null ? "" : variantMatn(elementlar[i]) })));
      });
      tugmalar.forEach((b, i) => { b.disabled = tanlangan.includes(i); });
      if (tekshirTugma) tekshirTugma.disabled = tanlangan.length < elementlar.length;
    };
    const tozala = () => { tanlangan = []; chiz(); };
    const matni = (q) => variantMatn(elementlar.find((e) => String(variantQiymat(e)) === String(q)) || elementlar[q] || q);
    return practice.tries({
      setup: (submit) => {
        tugmalar = elementlar.map((e, i) => {
          const b = h("button", { class: "btn secondary dars-variant", type: "button", text: variantMatn(e) });
          b.addEventListener("click", () => { if (b.disabled) return; sound.play("tap"); tanlangan.push(i); chiz(); });
          return b;
        });
        manba.append(...tugmalar);
        ui.clearControl();
        tekshirTugma = ui.button("Tekshir", () => submit({ qiymatlar: tanlangan.map((i) => variantQiymat(elementlar[i])), indekslar: tanlangan.slice() }));
        ui.control().append(h("div", { class: "choice-row" }, tekshirTugma, ui.button("Qayta", tozala, "secondary")));
        chiz();
      },
      check: (v) => tartibTogri(task.javob, v.qiymatlar) || tartibTogri(task.javob, v.indekslar),
      hint: () => { maslahat(el, task); tozala(); },
      solution: () => {
        tugmalar.forEach((b) => { b.disabled = true; });
        yechimKorsat(el, task, "Toʻgʻri tartib: " + (task.javob || []).map(matni).join(" → "));
      },
    });
  }

  // dialog: vaziyat → suhbatdosh gaplari (birma-bir) → 3 javob → hiyla nomi. Ikkalasi toʻgʻri — hisoblanadi (QOIDALAR 4.3).
  function hiylaVariantlari(task) {
    const xom = task.hiylalar || task.variantlar || [task.hiyla].concat(task.chalgituvchi || []);
    const list = xom.map((x) => (x && typeof x === "object" ? { id: x.id, matn: x.nom || x.matn || belgiNomi(x.id) } : { id: x, matn: belgiNomi(x) }));
    if (!list.some((x) => x.id === task.hiyla)) list.push({ id: task.hiyla, matn: belgiNomi(task.hiyla) });
    return aralash(list);
  }
  async function dialogTask(task) {
    const el = vazifaQutisi(false);
    if (task.vaziyat) el.append(h("div", { class: "dars-vaziyat", text: task.vaziyat }));
    const lenta = h("div", { class: "dars-dialog" });
    el.append(lenta);
    for (const gap of task.gaplar || []) {
      qosh(lenta, h("div", { class: "dars-gap", text: gap }));
      await ui.say("elder", gap);
    }
    const javoblar = task.javoblar || [];
    qosh(el, h("div", { class: "dars-savol", text: task.savol || "Qanday javob berasan?" }));
    ui.bubble("elder", "Javobni tanla.");
    const togrisi = javoblar.find((j) => j.togri) || null;
    const javobOk = await tanlovTries(el, javoblar, {
      check: (k) => !!(javoblar[k] && javoblar[k].togri),
      hint: (k) => ui.bubble("elder", "↻ " + ((javoblar[k] && javoblar[k].izoh) || task.izoh || "Yana bir bor oʻyla.")),
      solution: () => yechimKorsat(el, { yechim: togrisi && togrisi.izoh }, togrisi ? "Toʻgʻri javob: " + variantMatn(togrisi) : ""),
    });
    await ui.say("elder", javobOk && togrisi && togrisi.izoh ? "✓ " + togrisi.izoh : "Endi hiylani nomla.");
    const hiylalar = hiylaVariantlari(task);
    qosh(el, h("div", { class: "dars-savol", text: "Qaysi hiyla?" }));
    ui.bubble("elder", "Suhbatdosh qaysi hiylani ishlatdi?");
    const hiylaOk = await tanlovTries(el, hiylalar, {
      check: (k) => hiylalar[k].id === task.hiyla,
      hint: () => maslahat(el, task),
      solution: () => yechimKorsat(el, task, "Hiyla: " + belgiNomi(task.hiyla)),
    });
    return javobOk && hiylaOk;
  }

  // byudjet: profil kartasi, 10 ochkolik chiziq, har devorga tanlov tugmalari, «Tekshir»
  function profilKarta(p) {
    const el = h("div", { class: "dars-profil" }, h("div", { class: "dars-profil-nom", text: p.nom || "Robot hujumchi" }));
    const izoh = p.izoh || p.tavsif;
    if (izoh) el.append(h("div", { class: "dars-profil-izoh", text: String(izoh) }));
    const royxat = p.qurollar || p.kuchli || p.belgilar;
    if (Array.isArray(royxat) && royxat.length) el.append(h("ul", { class: "dars-maslahatlar" }, ...royxat.map((x) => h("li", { text: variantMatn(x) }))));
    return el;
  }
  function byudjetTask(task) {
    const el = vazifaQutisi(false);
    savolBlok(el, task);
    const Q = QK.qala || {};
    const devorlar = task.devorlar || Q.DEVORLAR || [];
    const byudjet = Number(task.byudjet || Q.BYUDJET || 10);
    const profil = task.profil || {};
    el.append(profilKarta(profil));
    const chiziq = h("div", { class: "dars-byudjet" });
    const royxat = h("div", { class: "dars-devorlar" });
    el.append(chiziq, royxat);
    ui.bubble("elder", "Devorlarni tanla, keyin «Tekshir».");
    const tanlov = {};
    devorlar.forEach((d) => { const arzon = (d.tanlov || []).find((t) => !Number(t.narx)) || (d.tanlov || [])[0]; tanlov[d.id] = arzon ? arzon.id : null; });
    const qatorlar = {};
    let tekshirTugma = null;
    const chiz = () => {
      const narx = byudjetNarx(tanlov, devorlar);
      chiziq.innerHTML = "";
      const seg = h("div", { class: "dars-byudjet-chiziq" + (narx > byudjet ? " oshdi" : "") });
      for (let k = 0; k < byudjet; k++) seg.append(h("i", { class: k < narx ? "on" : "" }));
      chiziq.append(h("span", { class: "dars-byudjet-matn", text: `Byudjet: ${narx} / ${byudjet}` + (narx > byudjet ? " — oshib ketdi" : "") }), seg);
      devorlar.forEach((d) => qatorlar[d.id].tugmalar.forEach((b, i) => b.setAttribute("aria-pressed", String(d.tanlov[i].id === tanlov[d.id]))));
      if (tekshirTugma) tekshirTugma.disabled = narx > byudjet;
    };
    const natijaChiz = (n) => devorlar.forEach((d) => {
      const q = n.devorlar[d.id];
      const el2 = qatorlar[d.id].natija;
      el2.className = "dars-devor-natija" + (q ? (q.turdi ? " turdi" : " yiqildi") : "");
      el2.textContent = q ? (q.turdi ? "✓ turdi" : "✗ yiqildi") + (q.sabab ? " — " + q.sabab : "") : "";
    });
    const tekshir = () => {
      const t = Object.assign({}, tanlov);
      const xom = typeof task.tekshir === "function" ? task.tekshir(t) : typeof M().byudjetBaho === "function" ? M().byudjetBaho(t, profil) : null;
      return natijaNormal(xom, devorlar, byudjetNarx(tanlov, devorlar), byudjet);
    };
    const yechimMatni = () => {
      const j = task.javob;
      if (!j || typeof j !== "object") return j ? String(j) : "";
      return "Tavsiya: " + devorlar.filter((d) => j[d.id] != null).map((d) => {
        const t = (d.tanlov || []).find((x) => x.id === j[d.id]);
        return `${d.nom} — ${t ? t.nom : j[d.id]}`;
      }).join(", ");
    };
    return practice.tries({
      setup: (submit) => {
        devorlar.forEach((d) => {
          const tugmalar = (d.tanlov || []).map((t) => {
            const b = h("button", { class: "dars-devor-tugma", type: "button", "aria-pressed": "false" },
              h("span", { text: t.nom }), h("span", { class: "dars-narx", text: Number(t.narx) ? `+${t.narx}` : "0" }));
            b.addEventListener("click", () => { sound.play("tap"); tanlov[d.id] = t.id; chiz(); if (t.izoh) ui.toast(t.izoh); });
            return b;
          });
          const natija = h("div", { class: "dars-devor-natija" });
          qatorlar[d.id] = { tugmalar, natija };
          royxat.append(h("div", { class: "dars-devor" }, h("div", { class: "dars-devor-nom", text: d.nom }), h("div", { class: "dars-devor-tanlov" }, ...tugmalar), natija));
        });
        ui.clearControl();
        tekshirTugma = ui.button("Tekshir", () => submit(tekshir()));
        ui.control().append(h("div", { class: "choice-row" }, tekshirTugma));
        chiz();
      },
      check: (n) => { natijaChiz(n); return n.ok; },
      hint: () => maslahat(el, task),
      solution: () => {
        devorlar.forEach((d) => qatorlar[d.id].tugmalar.forEach((b) => { b.disabled = true; }));
        yechimKorsat(el, task, yechimMatni());
      },
    });
  }

  const RENDER = { son: sonTask, tanlov: tanlovTask, "matn-tanlov": tanlovTask, tartib: tartibTask, dialog: dialogTask, byudjet: byudjetTask };
  function bajar(task) {
    const fn = task && RENDER[task.tur];
    if (!fn) { ui.toast("Nomaʼlum vazifa turi: " + (task && task.tur)); return Promise.resolve(true); }
    return fn(task);
  }

  // ---------- Ekranlar ----------
  function royxat() {
    ui.newRun();
    ui.hideProgress();
    const done = yukla().done;
    const el = U.box(false);
    U.sarlavha(el, { nom: "Darslar", izoh: "Har dars — qalʼaning bitta devori. Beshta dars — qalʼaga tayyor.", onOrqaga: qaytish });
    const cards = h("div", { class: "cards dars-royxat" });
    DARSLAR.forEach((d, i) => {
      cards.append(h("button", { class: "card dars-karta" + (done[i] ? " done" : ""), type: "button", onClick: () => { sound.play("tap"); dars(i); } },
        h("span", { class: "card-num", text: String(i + 1) }),
        h("span", { class: "card-title" }, h("span", { class: "dars-nom", text: d.nom }), h("span", { class: "dars-izoh", text: d.izoh })),
        h("span", { class: "card-state", text: done[i] ? "✓" : "" })));
    });
    el.append(cards);
    const n = done.filter(Boolean).length;
    ui.bubble("elder", n >= JAMI ? "Beshala dars tugagan. Qalʼaga tayyor ✓" : n ? `${n} / ${JAMI} dars tugadi. Davom et.` : "Birinchi darsdan boshla: parol.");
    U.buttons([{ label: "Menyu", onClick: qaytish, secondary: true }]);
  }

  async function dars(idx) {
    ui.newRun();
    ui.hideProgress();
    const d = DARSLAR[idx];
    const el = U.box(false);
    U.sarlavha(el, { nom: `${idx + 1}-dars. ${d.nom}`, onOrqaga: royxat });
    el.append(U.atamaQator(atamaIds(idx)));
    await ui.say("elder", d.maqsad);
    await ui.say("elder", d.devor);
    for (let m = 0; m < d.mashqlar.length; m++) {
      const mq = d.mashqlar[m];
      const gen = generator(mq.gen);
      yorliq = `${d.nom} · ${m + 1}/${d.mashqlar.length}`;
      if (!gen) { await ui.say("elder", `${m + 1}-mashq hali tayyor emas — oʻtkazib yuboramiz.`); continue; }
      practice.setStage(1); // har mashq — practice.need() ta (kattalarda 4) toʻgʻri javob; statistika tozalanadi
      await ui.say("elder", mq.korsatma);
      await practice.exercises({
        next: (prev, correct, tier) => gen(prev, Math.random, tier),
        run: bajar,
        praise: maqtov,
      });
    }
    belgila(idx);
    yakun(idx);
  }

  function yakun(idx) {
    const d = DARSLAR[idx];
    const el = U.box(false);
    sound.play("win");
    el.append(h("div", { class: "dars-yakun" },
      h("div", { class: "dars-yakun-sarlavha", text: `${idx + 1}-dars tugadi ✓` }),
      U.atamaQator(atamaIds(idx)),
      h("ul", { class: "dars-qoidalar" }, ...d.qoidalar.map((q) => h("li", { text: q })))));
    const tayyor = holat().tayyor;
    ui.bubble("elder", tayyor ? "Beshala dars tugadi. Qalʼaga tayyor ✓" : "Ikki qoida kartada. Keyingi dars — keyingi devor.");
    U.buttons([
      idx + 1 < JAMI ? { label: "Keyingi dars", onClick: () => dars(idx + 1) } : { label: "Menyu", onClick: qaytish },
      { label: "Darslar", onClick: royxat, secondary: true },
    ]);
  }

  // start(qayt, darsId?) — darsId 1..5 berilsa toʻgʻri shu dars ochiladi
  function start(qayt, darsId) {
    qaytish = qayt || qaytish || (() => { root.location.href = U.SITE_HOME; });
    const n = Number(darsId);
    if (n >= 1 && n <= JAMI) dars(n - 1); else royxat();
  }

  QK.qalaDars = {
    start, holat, DARSLAR, NOMLAR, KALIT,
    sof: { holatniTuzat, holatHisobla, variantMatn, variantQiymat, variantMos, javobMatni, tartibTogri, byudjetNarx, natijaNormal, uzunlik, yukla, belgila },
  };
})(window);
