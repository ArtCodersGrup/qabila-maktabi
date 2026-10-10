// Qalʼa — onlayn xona (Togʻ naqshi). Boshlovchi (oʻqituvchi qurilmasi) xona ochadi, oʻzi oʻynamaydi: ekrani — doska,
// hisobni ham oʻsha qurilma yuritadi (QK.qala). Bolalar kod bilan kiradi, jamoaga navbat bilan boʻlinadi,
// har fazada roliga qarab ekran oladi: quruvchi / hujumchi / qorovul. Tarmoqqa erkin matn chiqmaydi (protokol.js).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, qala: Q, qalaUi: U, qalaOyinUi: O, qalaProtokol: P, onlayn } = QK;
  const h = ui.h;
  const KIND = "qala";
  const XOTIRA = "qala:men:v1";
  const SANOQ = 3;
  const SALOM_HAR = 8000; // oʻyinchi shuncha vaqtda bir «men shu yerdaman» yuboradi (boʻsh rol aniqlash uchun)
  const VAQTLAR = [
    { id: "standart", nom: "Standart", izoh: "Himoya 5 daqiqa · hujum 5 daqiqa · tahlil 1,5 daqiqa", vaqt: { himoya: 300, hujum: 300, tahlil: 90 } },
    { id: "qisqa", nom: "Qisqa", izoh: "Himoya 3 · hujum 3 · tahlil 1 daqiqa", vaqt: { himoya: 180, hujum: 180, tahlil: 60 } },
  ];
  const RAUNDLAR = [
    { id: 2, nom: "2 raund", izoh: "2-raundda hujumchi va qorovul almashadi" },
    { id: 1, nom: "1 raund", izoh: "Qisqa dars uchun" },
  ];
  const raqibi = (jam) => (jam === "oy" ? "quyosh" : "oy");
  const yiqilganlar = (s, jam) => P.DEVORLAR.filter((d) => s.jamoa[jam].devor[d] && s.jamoa[jam].devor[d].holat === "yiqildi");
  const xatNomer = (r, zaxira) => { const n = r && r.natija && (r.natija.nomer ?? r.natija.xatNomer ?? r.natija.n); return Number.isInteger(n) ? n : zaxira; };
  const devorNomlari = (list) => (list || []).map((d) => O.DEVOR_NOMI[d]).join(", ");
  // Q.robotHimoya tasodifiy karta topa olmay xato tashlashi mumkin (qala.js sozKarta) — bir necha marta urinamiz
  function zaifHimoya() {
    for (let k = 0; k < 30; k++) { try { return Q.robotHimoya(Math.random, 1); } catch (e) { /* yana */ } }
    return Q.himoyaYasa({ parol: ["s1"], tuz: 0, shifr: "sezar", k: 3, bayroq: "f1", ikki: false, filtr: [] });
  }

  // Bolaning yashirin raqami: uzilib qayta kirganda oʻsha odam (va oʻsha rol) boʻladi
  function kimlikim() {
    try {
      const bor = root.localStorage.getItem(XOTIRA);
      if (bor && /^[a-z2-9]{6}$/.test(bor)) return bor;
      const yangi = P.kimlik();
      root.localStorage.setItem(XOTIRA, yangi);
      return yangi;
    } catch (e) {
      return P.kimlik();
    }
  }

  function xato(matn, qayt) {
    const el = U.box(false);
    el.append(h("h1", { class: "game-title", text: "Onlayn xona" }), h("p", { class: "qala-note", text: matn }));
    sound.play("retry");
    U.buttons([{ label: "Orqaga", onClick: qayt, secondary: true }]);
  }

  // ================= BOSHLOVCHI (oʻqituvchi) =================
  function sozlamaTanlash() {
    const s = { vaqt: VAQTLAR[0], raundlar: 2 };
    return new Promise((resolve) => {
      function chiz() {
        const el = U.box(false);
        U.sarlavha(el, { nom: "Xona ochish", onOrqaga: () => resolve(null), izoh: "Doska — shu qurilma. Bolalar kod bilan kiradi va ikki jamoaga navbat bilan boʻlinadi." });
        const guruh = (nom, variantlar, joriy, ozgar) => h("div", { class: "qala-sozlama" }, h("div", { class: "qala-sozlama-nom", text: nom }),
          h("div", { class: "qala-menyu" }, ...variantlar.map((v) => h("button", { class: "menyu-karta" + (v.id === joriy ? " tanlangan" : ""), type: "button", "aria-pressed": String(v.id === joriy),
            onClick: () => { sound.play("tap"); ozgar(v.id); chiz(); } }, h("span", { class: "menyu-nom", text: (v.id === joriy ? "✓ " : "") + v.nom }), h("span", { class: "menyu-izoh", text: v.izoh })))));
        el.append(guruh("Vaqt", VAQTLAR, s.vaqt.id, (id) => { s.vaqt = VAQTLAR.find((v) => v.id === id); }),
          guruh("Raundlar", RAUNDLAR, s.raundlar, (id) => { s.raundlar = id; }));
        U.buttons([{ label: "Davom etish", onClick: () => resolve({ vaqt: s.vaqt.vaqt, raundlar: s.raundlar }) }, { label: "Orqaga", onClick: () => resolve(null), secondary: true }]);
        ui.bubble("elder", "Vaqt va raundlar sonini tanlang.");
      }
      chiz();
    });
  }

  async function host(qayt) {
    ui.newRun();
    const sozlama = await sozlamaTanlash();
    if (!sozlama) return qayt();
    const sinf = QK.sinfTanlov ? await QK.sinfTanlov(U) : null;
    lobbi(qayt, sozlama, sinf);
  }

  function lobbi(qayt, sozlama, sinf) {
    const code = onlayn.makeCode();
    const odamlar = []; // [{ id, jam }] kirish tartibida — oʻyin davomida ham shu roʻyxat (uzilgan qaytib keladi)
    const korildi = {}; // id → oxirgi xabar / koʻrinish vaqti (boʻsh rol: ROL_JIM dan koʻp jim)
    const ismlar = {}; // sinf xonasida server beradi — faqat oʻyindan keyingi roʻyxatda
    let s = null;
    let H = null; // oʻyin ichki holati (rollar, qoralama, …)
    let room = null;
    let timer = null;
    let yakunTimer = null;
    let sanoq = 0;
    const holati = h("div", { class: "net-status", text: "⏳ Xona ochilmoqda…" });
    const royxat = h("div", { class: "lobbi-jamoalar" });
    const sinfIzoh = h("p", { class: "qala-note", text: sinf ? `Natijalar «${sinf.nom}» sinfiga yoziladi.` : "" });
    QK.probe = { rejim: "host", code, odamlar };

    const chiqish = () => { clearInterval(timer); clearInterval(yakunTimer); if (room) room.leave(); qayt(); };
    const jamoalar = () => ({ oy: odamlar.filter((o) => o.jam === "oy").map((o) => o.id), quyosh: odamlar.filter((o) => o.jam === "quyosh").map((o) => o.id) });
    const lobbiYubor = () => { if (room) room.send("lobbi", Object.assign({ ids: odamlar.map((o) => o.id), jam: odamlar.map((o) => (o.jam === "quyosh" ? 1 : 0)), oyin: s ? 1 : 0 }, sanoq ? { sanoq } : {})); };

    function lobbiEkran() {
      const el = U.box(false);
      el.append(h("h1", { class: "game-title", text: "Qalʼa — xona" }), h("div", { class: "code-lead", text: "Xona kodi:" }), h("div", { class: "code-big", text: code }),
        ...[sinf ? sinfIzoh : null, holati, royxat].filter(Boolean));
      clearInterval(timer);
      timer = setInterval(lobbiYubor, 2000);
      lobbiChiz();
    }
    function lobbiChiz() {
      royxat.innerHTML = "";
      P.JAMOALAR.forEach((jam) => {
        const ustun = h("div", { class: "lobbi-jamoa jam-" + jam }, h("div", { class: "jamoa-nom", text: `${U.JAMOA[jam].belgi} ${U.jamoaNomi(jam)} (${odamlar.filter((o) => o.jam === jam).length})` }));
        odamlar.forEach((o, k) => {
          if (o.jam !== jam) return;
          ustun.append(h("button", { class: "jamoa-chip", type: "button", "aria-label": `${k + 1}-oʻyinchi — jamoasini almashtirish`, text: "№" + (k + 1),
            onClick: () => { if (s) return; sound.play("tap"); o.jam = raqibi(o.jam); lobbiChiz(); lobbiYubor(); } }));
        });
        royxat.append(ustun);
      });
      const j = jamoalar();
      const tayyor = j.oy.length >= P.MIN_JAMOA && j.quyosh.length >= P.MIN_JAMOA;
      holati.textContent = odamlar.length ? `${odamlar.length} ta oʻyinchi (${P.MAX_OYINCHI} tagacha). Chipni bosib jamoasini almashtiring.` : "Bolalar kodni kiritishini kutamiz…";
      U.buttons([
        { label: sanoq ? `Boshlanmoqda… ${sanoq}` : `Boshlash (${odamlar.length})`, onClick: boshla, disabled: sanoq > 0 || !tayyor },
        { label: "Xonani yopish", onClick: chiqish, secondary: true },
      ]);
    }
    function qoshil(id) {
      if (s || odamlar.some((o) => o.id === id) || odamlar.length >= P.MAX_OYINCHI) return;
      odamlar.push({ id, jam: P.jamoaTanla(odamlar) });
      sound.play("tap");
      lobbiChiz();
      lobbiYubor();
    }
    function boshla() {
      if (sanoq) return;
      sanoq = SANOQ;
      lobbiChiz();
      lobbiYubor();
      const sanash = setInterval(() => {
        sanoq--;
        if (sanoq > 0) { lobbiYubor(); lobbiChiz(); return; }
        clearInterval(sanash);
        oyin();
      }, 1000);
    }

    // ---------- Oʻyin: doska va hakam ----------
    function oyin() {
      const now = Date.now();
      s = Q.create({ jamoalar: P.JAMOALAR.slice(), now, vaqt: sozlama.vaqt, raundlar: sozlama.raundlar });
      Q.boshla(s, now);
      H = { rollar: {}, qoralama: { oy: {}, quyosh: {} }, hq: { oy: {}, quyosh: {} }, kor: {}, kalit: {}, kalitSir: {}, jv: [], seq: 0, yiqitdi: {},
        fishingRaund: { oy: 0, quyosh: 0 }, xat: { oy: null, quyosh: null }, xatJavob: { oy: null, quyosh: null }, xatSanoq: 0, qoyildiRaund: { oy: 0, quyosh: 0 } };
      QK.probe.s = s;
      QK.probe.H = H;
      sound.play("win");
      const box = U.box(true, "qala-oyin");
      box.append(h("div", { class: "code-small", text: `Xona: ${code}` }));
      const doska = O.doska(box, s);
      const tahlilJoy = h("div", { class: "doska-tahlil" });
      box.append(tahlilJoy);
      let korsatilganFaza = "";
      let oxirgiYuborish = 0;
      let oxirgiRol = 0;
      // Jim qolgan bola — roli bo'sh (rolYangila dan oldin e'lon qilinadi)
      const bosh = () => { const t = Date.now(); const out = {}; odamlar.forEach((o) => { if (t - (korildi[o.id] || 0) > P.ROL_JIM) out[o.id] = 1; }); return out; };
      rolYangila();
      U.buttons([
        { label: "Fazani tugatish", onClick: () => { if (s && s.faza !== "tugadi") s.fazaTugaydi = Date.now(); }, secondary: true },
        { label: "Toʻxtatish", onClick: () => { if (s && s.faza !== "tugadi") { s.faza = "tugadi"; s.golib = Q.golib(s) || "durang"; } }, secondary: true },
      ]);
      ui.bubble("elder", `Himoya fazasi: har jamoa qalʼasini quradi. Kod: ${code}.`);

      function rolYangila() { H.rollar = P.rollar(jamoalar(), s.raund, s.faza === "himoya" ? "himoya" : "hujum"); rolYubor(); }
      function rolYubor() { oxirgiRol = Date.now(); room.send("rol", P.rolPaket(H.rollar, s.raund, s.faza, bosh())); }
      function yubor() { oxirgiYuborish = Date.now(); room.send("holat", P.paket(s, oxirgiYuborish, { kor: H.kor, hq: H.hq, jv: H.jv, kalit: H.kalit })); }
      const javobQosh = (id, tur, kod) => { H.jv.push({ id, tur, kod, seq: ++H.seq }); H.jv = H.jv.slice(-P.JAVOB_SONI); };
      const hammasiQoyildi = () => P.JAMOALAR.every((jam) => P.DEVORLAR.every((d) => H.hq[jam][d]));

      // Himoya fazasi tugadi: kelgan devorlar + yetishmaganini zaif robot himoyasi toʻldiradi
      function himoyaniQoy() {
        P.JAMOALAR.forEach((jam) => {
          if (H.qoyildiRaund[jam] === s.raund) return;
          H.qoyildiRaund[jam] = s.raund;
          const robot = zaifHimoya();
          const d = Object.assign({}, H.qoralama[jam]);
          if (!Array.isArray(d.parol) || !d.parol.length) d.parol = robot.parol;
          if (!d.shifr) { d.shifr = robot.shifr || "sezar"; d.k = robot.k; d.kalit = robot.kalit; }
          if (!d.bayroq) d.bayroq = robot.bayroq;
          if (d.tuz == null) d.tuz = 0;
          if (d.ikki == null) d.ikki = false;
          if (!Array.isArray(d.filtr)) d.filtr = [];
          let him = null;
          try { him = Q.himoyaYasa(d); } catch (e) { him = null; }
          if (!him || him.xato) him = robot;
          let r = Q.himoyaQoy(s, jam, him);
          if (!r || r.ok === false) { him = robot; r = Q.himoyaQoy(s, jam, robot); }
          const h2 = s.jamoa[jam].himoya || him;
          H.kor[jam] = Q.korinish(h2);
          H.kalitSir[jam] = h2.kalit || d.kalit || "";
          H.kalit[jam] = "";
        });
      }
      // Kalit fishing orqali sizgan boʻlsa — raqib hujumchilariga holatda ketadi
      function kalitTekshir() { P.JAMOALAR.forEach((jam) => { if ((s.jamoa[jam].sizdi || []).includes("kalit") && /^[a-z]{3}$/.test(H.kalitSir[jam] || "")) H.kalit[jam] = H.kalitSir[jam]; }); }

      // Fishing xati raqib qorovullariga: 3 haqiqiy + 1 soxta, aralash; soxtasining oʻrni tarmoqqa chiqmaydi
      function xatJonat(jam, xat, n, hujumchi) {
        const xatlar = [Q.haqiqiyXat(Math.random), Q.haqiqiyXat(Math.random), Q.haqiqiyXat(Math.random)];
        const soxta = Math.floor(Math.random() * 4);
        xatlar.splice(soxta, 0, xat);
        H.xat[jam] = { n, xat, soxta, ovozlar: {}, tugaydi: Date.now() + P.OVOZ_KUTISH, hujumchi, paket: P.xatPaket(jam, n, xatlar.map(O.xatIdlari)), oxirgi: 0 };
        H.xatJavob[jam] = null;
      }
      const qorovullar = (jam) => { const b = bosh(); return Object.keys(H.rollar).filter((id) => H.rollar[id].jam === jam && H.rollar[id].rol === "qor" && !b[id]); };
      function xatYakunla(jam) {
        const x = H.xat[jam];
        if (!x) return;
        const ovozlar = Object.keys(x.ovozlar).filter((id) => H.rollar[id] && H.rollar[id].jam === jam).map((id) => x.ovozlar[id][x.soxta] === 1);
        Q.qorovulOvoz(s, jam, x.n, ovozlar, Date.now());
        const ochildi = s.jamoa[jam].devor.xat.holat === "yiqildi";
        if (ochildi) H.yiqitdi[x.hujumchi] = (H.yiqitdi[x.hujumchi] | 0) + 1;
        H.xatJavob[jam] = { paket: P.xatJavobPaket(jam, x.n, x.soxta, ochildi), gacha: Date.now() + 10000, oxirgi: 0 };
        H.xat[jam] = null;
        kalitTekshir();
        sound.play(ochildi ? "boom" : "tak");
        yubor();
      }
      // Kutilayotgan xatlar: hamma qorovul ovoz berdi / vaqt tugadi / faza tugadi — yakunlanadi; aks holda qayta yuboriladi
      function xatlarniTekshir(t, hammasi) {
        P.JAMOALAR.forEach((jam) => {
          const x = H.xat[jam];
          if (x) {
            const q = qorovullar(jam);
            if (hammasi || t >= x.tugaydi || (q.length && q.every((id) => x.ovozlar[id]))) xatYakunla(jam);
            else if (t - x.oxirgi > 3000) { x.oxirgi = t; room.send("xat", x.paket); }
          }
          const j = H.xatJavob[jam];
          if (j && t < j.gacha && t - j.oxirgi > 3000) { j.oxirgi = t; room.send("xat", j.paket); }
        });
      }

      function himoyaQabul(o, d) {
        if (d.dev === "parol" && !d.ids.every((id) => Q.karta(id))) return;
        if (d.dev === "shifr" && !(Q.BAYROQLAR || []).some((b) => b.id === d.bayroq)) return;
        const q = H.qoralama[o.jam];
        if (d.dev === "parol") q.parol = d.ids.slice();
        else if (d.dev === "qulf") q.tuz = d.tuz;
        else if (d.dev === "shifr") { q.shifr = d.tur; q.k = d.k; q.kalit = d.kalit; q.bayroq = d.bayroq; }
        else if (d.dev === "ikki") q.ikki = !!d.ikki;
        else q.filtr = d.filtr.slice();
        H.hq[o.jam][d.dev] = 1;
        sound.play("tak");
        yubor();
      }
      function amalQabul(o, d) {
        const raqib = raqibi(o.jam);
        let amal;
        if (d.tur === "fishing") {
          const xat = H.fishingRaund[o.jam] ? null : Q.xatYasa(P.fishingQismlar(d));
          if (!xat) { javobQosh(o.id, "fishing", "0"); yubor(); return; }
          amal = { tur: "fishing", xat };
        } else amal = { tur: d.tur, ids: d.ids, hisob: d.hisob, k: d.k, kalit: d.kalit };
        const oldin = yiqilganlar(s, raqib).length;
        let r = null;
        try { r = Q.hujum(s, o.jam, amal, Date.now()); } catch (e) { r = null; }
        javobQosh(o.id, d.tur, O.javobKodi(d.tur, r));
        const keyin = yiqilganlar(s, raqib).length;
        if (keyin > oldin) { H.yiqitdi[o.id] = (H.yiqitdi[o.id] | 0) + (keyin - oldin); sound.play("boom"); }
        if (d.tur === "fishing" && r && r.ok !== false) { H.fishingRaund[o.jam] = 1; xatJonat(raqib, amal.xat, xatNomer(r, ++H.xatSanoq), o.id); }
        kalitTekshir();
        yubor();
      }
      // Jamoadosh uzilgan oʻyinchining rolini oladi (rollar almashadi: qaytib kelsa — olganning eski roli)
      function rolOl(o, kim) {
        const b = bosh();
        const r1 = H.rollar[o.id];
        const r2 = H.rollar[kim];
        if (!r1 || !r2 || r2.jam !== o.jam || !b[kim] || kim === o.id) return;
        H.rollar[o.id] = r2;
        H.rollar[kim] = r1;
        sound.play("tap");
        rolYubor();
      }
      H.xabar = (msg) => {
        const o = odamlar.find((x) => x.id === msg.from);
        if (!o || !s) return;
        const d = msg.data || {};
        const rol = H.rollar[o.id];
        if (msg.type === "himoya") {
          if (s.faza === "himoya" && rol && rol.rol === "qur" && P.yaxshiHimoya(d) && rol.dev.includes(d.dev)) himoyaQabul(o, d);
        } else if (msg.type === "amal") {
          if (!P.yaxshiAmal(d)) return;
          if (d.tur === "rol") { rolOl(o, d.kim); return; }
          if (s.faza !== "hujum" || !rol || rol.rol !== "huj" || !rol.dev.includes(d.dev)) { javobQosh(o.id, d.tur, "x"); yubor(); return; }
          amalQabul(o, d);
        } else if (msg.type === "ovoz") {
          const x = H.xat[o.jam];
          if (!P.yaxshiOvoz(d) || !rol || rol.rol !== "qor" || !x || x.n !== d.n) return;
          x.ovozlar[o.id] = d.ov.slice();
        }
      };

      function fazaOzgardi() {
        if (s.faza === "himoya") {
          H.qoralama = { oy: {}, quyosh: {} }; H.hq = { oy: {}, quyosh: {} }; H.fishingRaund = { oy: 0, quyosh: 0 }; H.xat = { oy: null, quyosh: null };
          rolYangila();
          ui.bubble("elder", `${s.raund}-raund: himoya. Tahlildan xulosa qilib, qalʼani qayta quring.`);
        } else if (s.faza === "hujum") {
          H.fishingRaund = { oy: 0, quyosh: 0 };
          rolYangila();
          ui.bubble("elder", "Hujum fazasi: yarmi raqib qalʼasiga hujum qiladi, yarmi kelgan xatlarni tekshiradi.");
        } else if (s.faza === "tahlil") ui.bubble("elder", "Tahlil: qaysi devor nega yiqildi — doskada.");
        sound.play(s.faza === "tugadi" ? "win" : "tak");
      }
      function tahlilChiz() {
        const k = s.faza + ":" + s.raund;
        if (korsatilganFaza === k) return;
        korsatilganFaza = k;
        tahlilJoy.innerHTML = "";
        tahlilJoy.hidden = s.faza !== "tahlil";
        if (s.faza === "tahlil") O.tahlil(tahlilJoy, s, null);
      }

      clearInterval(timer);
      timer = setInterval(() => {
        if (!s) return;
        const t = Date.now();
        if (s.faza === "himoya" && (t >= s.fazaTugaydi || hammasiQoyildi())) { himoyaniQoy(); if (s.fazaTugaydi > t) s.fazaTugaydi = t; }
        if (s.faza === "hujum") xatlarniTekshir(t, t >= s.fazaTugaydi);
        const oldin = s.faza + ":" + s.raund;
        if (s.faza !== "tugadi") Q.tekshir(s, t);
        if (oldin !== s.faza + ":" + s.raund) fazaOzgardi();
        doska.render(t, s);
        tahlilChiz();
        if (t - oxirgiYuborish >= P.YUBORISH) yubor();
        if (t - oxirgiRol >= 2000) rolYubor();
        if (s.faza === "tugadi") yakun();
      }, 250);

      function yakun() {
        clearInterval(timer);
        const golib = Q.golib(s) || s.golib || "durang";
        // Oxirgi holat: tugadi=1 + ids/jam/och/dev/golib — server natijani sinfga yozadi; yoʻqolmasin deb 5 marta
        const songgi = Object.assign(P.paket(s, Date.now(), { kor: H.kor, hq: H.hq, jv: H.jv, kalit: H.kalit }), P.natijaPaket(s, H.rollar, H.yiqitdi, golib));
        let n = 0;
        clearInterval(yakunTimer);
        yakunTimer = setInterval(() => { room.send("holat", songgi); if (++n >= 5) clearInterval(yakunTimer); }, 700);
        timer = setInterval(lobbiYubor, 2000); // bolalar xonada qoladi
        sound.play("win");
        const el2 = U.box(true, "qala-oyin");
        O.tahlil(el2, Object.assign({}, s, { golib, faza: "tugadi" }), [
          { label: "Yangi oʻyin", onClick: () => { s = null; H = null; sanoq = 0; lobbiEkran(); lobbiYubor(); } },
          { label: "Xonani yopish", onClick: chiqish, secondary: true },
        ]);
        // Kim qaysi jamoada edi va nechta devor yiqitdi (ism — faqat sinf xonasida, oʻyindan keyin)
        const royxat2 = h("div", { class: "lobbi-jamoalar" });
        P.JAMOALAR.forEach((jam) => {
          const ustun = h("div", { class: "lobbi-jamoa jam-" + jam }, h("div", { class: "jamoa-nom", text: `${U.JAMOA[jam].belgi} ${U.jamoaNomi(jam)}` }));
          odamlar.forEach((o, k) => { if (o.jam === jam) ustun.append(h("span", { class: "jamoa-chip", text: `${ismlar[o.id] || "№" + (k + 1)} · ${H.yiqitdi[o.id] | 0} devor` })); });
          royxat2.append(ustun);
        });
        el2.append(royxat2);
        ui.bubble("elder", (golib === "durang" ? "Durang." : `Gʻolib — ${U.jamoaNomi(golib)}.`) + " Yangi oʻyin boshlash mumkin — bolalar xonada qoladi.");
      }
    }

    room = onlayn.xona({
      kind: KIND, code, me: "host", role: "host", types: P.TYPES, sinf: sinf && sinf.id,
      on: {
        sinf(ok) { if (!ok) sinfIzoh.textContent = "⚠ Natijalarni sinfga yozib boʻlmadi (qayta kiring). Oʻyin baribir ishlaydi."; },
        ismlar(d) { Object.assign(ismlar, d); },
        status(st) {
          QK.probe.status = st;
          if (st === "ready") {
            holati.classList.remove("bad");
            if (!s) { lobbiChiz(); lobbiYubor(); ui.bubble("elder", `Kodni doskaga yozing: ${code}. Ikkala jamoada kamida ${P.MIN_JAMOA} kishi boʻlgach — «Boshlash».`); }
          } else if (st === "reconnecting") { holati.textContent = "⚠ Aloqa uzildi — qayta ulanmoqda…"; holati.classList.add("bad"); }
          else if (st === "error") { holati.textContent = "✗ Server bilan aloqa uzildi. Sahifani yangilab, xonani qayta oching."; holati.classList.add("bad"); }
        },
        peers(ids) { const t = Date.now(); ids.forEach((id) => { korildi[id] = t; qoshil(id); }); },
        message(msg) {
          korildi[msg.from] = Date.now();
          if (msg.type === "lobbi") { qoshil(msg.from); return; }
          if (H) H.xabar(msg);
        },
      },
    });
    lobbiEkran();
    ui.onCleanup(() => { clearInterval(timer); clearInterval(yakunTimer); if (room) room.leave(); });
  }

  // ================= OʻYINCHI (bola telefoni) =================
  async function guest(qayt) {
    ui.newRun();
    const el = U.box(false);
    el.append(h("h1", { class: "game-title", text: "Kod bilan kirish" }), h("div", { class: "code-lead", text: "Xona kodini kirit (4 ta raqam):" }));
    ui.bubble("elder", "Oʻqituvchi doskaga yozgan kodni kirit.");
    const n = await ui.askNumber(4);
    const code = String(n);
    if (!onlayn.validCode(code)) return xato("Kod 4 ta raqamdan iborat boʻladi.", qayt);
    kir(code, qayt);
  }

  // Quruvchi telefonidan boshlovchiga faqat oʻz devori ketadi (sir — faqat shu yoʻl bilan)
  function himoyaPaketi(dev, d) {
    if (dev === "parol") return { dev, ids: d.parol.slice(0, 4) };
    if (dev === "qulf") return { dev, tuz: d.tuz | 0 };
    if (dev === "shifr") return { dev, tur: d.shifr, k: d.k | 0, kalit: d.kalit, bayroq: d.bayroq };
    if (dev === "ikki") return { dev, ikki: d.ikki ? 1 : 0 };
    return { dev, filtr: (d.filtr || []).slice(0, 6) };
  }
  const rolNomi = (r) => (r.rol === "qur" ? "quruvchi: " : r.rol === "huj" ? "hujumchi: " : "qorovul") + devorNomlari(r.dev);

  function kir(code, qayt) {
    const me = kimlikim();
    let rejim = "kutish"; // kutish | oyin | natija | uzildi
    let jamoam = null;
    let nomerim = 0;
    let rolPaketi = null;
    let rolim = null;
    let holatim = null;
    let oxirgiXabar = Date.now();
    let oxirgiSalom = 0;
    let ekran = null;
    let ekranKalit = "";
    let seqKorildi = 0;
    let xatPaketi = null;
    let ovozim = null;
    let qorovulEkran = null;
    let room = null;
    let timer = null;
    const holati = h("div", { class: "net-status", text: "⏳ Xonaga kirilmoqda…" });
    let el = U.box(false);
    el.append(h("h1", { class: "game-title", text: "Qalʼa — xona" }), h("div", { class: "code-small", text: `Xona: ${code}` }), holati);
    QK.probe = { rejim: "guest", code, me };
    const chiqish = () => { clearInterval(timer); if (room) room.leave(); qayt(); };
    const raqib = () => raqibi(jamoam);
    const tugmalar = () => [{ label: "Chiqish", onClick: chiqish, secondary: true }];

    function kutishEkran(matn) {
      const kalit = "kutish:" + matn + ":" + jamoam + ":" + nomerim;
      if (ekranKalit === kalit) return;
      ekranKalit = kalit;
      rejim = "kutish";
      ekran = null;
      el = U.box(false);
      el.append(h("h1", { class: "game-title", text: `Xona: ${code}` }));
      if (jamoam) el.append(h("div", { class: "jamoa-karta jam-" + jamoam }, h("span", { class: "jamoa-belgi", text: U.JAMOA[jamoam].belgi }),
        h("span", { class: "jamoa-nom", text: `${U.jamoaNomi(jamoam)} jamoasi` }), nomerim ? h("span", { class: "oyin-kichik", text: "№" + nomerim }) : null));
      el.append(h("p", { class: "qala-note", text: matn }));
      U.buttons(tugmalar());
      ui.bubble("elder", matn);
    }
    function uzildiEkran() {
      rejim = "uzildi";
      ekranKalit = "uzildi";
      ekran = null;
      el = U.box(false);
      el.append(h("h1", { class: "game-title", text: "Boshlovchi uzildi" }), h("p", { class: "qala-note", text: "Oʻqituvchi qurilmasidan xabar kelmayapti. Kutib tur yoki chiq." }));
      sound.play("dum");
      U.buttons([{ label: "Yana kutish", onClick: () => { oxirgiXabar = Date.now(); ekranKalit = ""; kutishEkran("Boshlovchini kutamiz…"); } }, { label: "Chiqish", onClick: chiqish, secondary: true }]);
    }
    function natijaEkran() {
      if (ekranKalit === "natija") return;
      ekranKalit = "natija";
      rejim = "natija";
      ekran = null;
      el = U.box(false);
      O.natijaKarta(el, holatim, jamoam);
      sound.play(holatim.golib === jamoam ? "win" : holatim.golib === "durang" ? "tak" : "dum");
      U.buttons([{ label: "Keyingi oʻyinni kutish", onClick: () => { ekranKalit = ""; kutishEkran("Oʻqituvchi yangi oʻyin boshlashini kutamiz…"); } }, { label: "Chiqish", onClick: chiqish, secondary: true }]);
    }

    // Boʻsh rollar (jamoadosh uzilgan): «Men olaman»
    function boshRollarChiz(el2) {
      if (!rolPaketi || !jamoam) return;
      const b = P.boshRollar(rolPaketi, jamoam).filter((x) => x.id !== me);
      if (!b.length) return;
      const wrap = h("div", { class: "bosh-rollar" }, O.kichik("Boʻsh rollar — jamoadosh uzildi"));
      b.forEach((x) => wrap.append(ui.button("Men olaman — " + rolNomi(x), () => room.send("amal", { tur: "rol", kim: x.id }), "sm secondary")));
      el2.append(wrap);
    }

    function ekranQ(f) {
      const J = holatim.jamoa;
      if (f === "himoya") return { qoyildi: J[jamoam].qoyildi, tugaydi: holatim.fazaTugaydi };
      // urinishlar nishon qalʼasida sanaladi (qala.hujum: s.jamoa[nishon].urinish)
      if (f === "hujum") return { korinish: J[raqib()].korinish, urinish: J[raqib()].urinish, yiqilgan: yiqilganlar(holatim, raqib()), sizdi: J[raqib()].sizdi, kalit: J[raqib()].kalit, tugaydi: holatim.fazaTugaydi };
      return {};
    }
    function ekranYangila() {
      if (!holatim) return;
      const f = holatim.faza;
      if (f === "lobbi") { kutishEkran("Oʻqituvchi boshlashini kutamiz…"); return; }
      if (f === "tugadi") { natijaEkran(); return; }
      if (!rolim) { kutishEkran("Bu oʻyin boshlangan. Keyingisini shu yerda kut."); return; }
      const kalit = [f, holatim.raund, rolim.rol, rolim.dev.join("-")].join(":");
      if (kalit !== ekranKalit) { ekranKalit = kalit; yangiEkran(f); }
      else if (ekran && ekran.yangila) ekran.yangila(ekranQ(f));
      holatim.javoblar.filter((j) => j.id === me && j.seq > seqKorildi).forEach((j) => { seqKorildi = j.seq; if (ekran && ekran.javob) ekran.javob(j.tur, j.kod); });
    }
    function yangiEkran(f) {
      rejim = "oyin";
      ekran = null;
      qorovulEkran = null;
      if (f === "himoya") { xatPaketi = null; ovozim = null; }
      el = U.box(true, "qala-oyin");
      if (f === "himoya") {
        if (rolim.rol === "qur") {
          ekran = O.devorlar(el, Object.assign({ faqat: rolim.dev, byudjet: Q.BYUDJET, onYubor: (dev, d) => { room.send("himoya", himoyaPaketi(dev, d)); sound.play("tak"); } }, ekranQ(f)));
          ui.bubble("elder", `Sen — quruvchi: ${devorNomlari(rolim.dev)}. Tayyor boʻlgach «Yuborish».`);
        } else el.append(O.izoh("Himoya fazasi — quruvchilar ishlayapti."));
      } else if (f === "hujum") {
        if (rolim.rol === "huj") {
          ekran = O.hujum(el, Object.assign({ devorlar: rolim.dev, tugmalar: tugmalar(), onAmal: (a) => room.send("amal", a) }, ekranQ(f)));
          ui.bubble("elder", `Sen — hujumchi. Nishon: ${devorNomlari(rolim.dev)}.`);
        } else qorovulKutish();
      } else if (f === "tahlil") {
        O.tahlil(el, holatim, null);
        ui.bubble("elder", "Tahlil — doskaga qara. Keyingi raundda rollar almashadi.");
      }
      boshRollarChiz(el);
      U.buttons(tugmalar());
    }
    function qorovulKutish() {
      const joy = h("div", { class: "qorovul-joy" });
      el.append(h("div", { class: "oyin-sarlavha", text: "Qorovul: oʻz qalʼang" }), joy);
      ekran = { yangila() { if (xatPaketi && xatPaketi.k && !qorovulEkran) qorovulChiz(joy); } };
      if (xatPaketi && xatPaketi.k) qorovulChiz(joy);
      else joy.append(O.izoh("Raqib xat yuborsa, shu yerda chiqadi. Hozircha kut."));
      ui.bubble("elder", "Sen — qorovul. Xat kelsa: ochish yoki oʻchirish. Belgilarga qara: shoshiltirish, soxta havola, kod soʻrash.");
    }
    function qorovulChiz(joy) {
      joy.innerHTML = "";
      sound.play("tak");
      const n = xatPaketi.n;
      qorovulEkran = O.qorovul(joy, { xatlar: P.xatlarOl(xatPaketi), onOvoz: (ov) => { ovozim = { n, ov }; room.send("ovoz", ovozim); } });
      if (ovozim && ovozim.n === n) room.send("ovoz", ovozim); // qayta ulanishdan keyin — ovoz allaqachon berilgan
    }

    room = onlayn.xona({
      kind: KIND, code, me, role: "player", types: P.TYPES,
      on: {
        status(st) {
          QK.probe.status = st;
          if (st === "missing") return xato("Bunday xona topilmadi. Kodni tekshir.", qayt);
          if (st === "full") return xato("Xona toʻla — 30 kishi oʻynayapti.", qayt);
          if (st === "error") return xato("Server bilan aloqa uzildi.", qayt);
          if (st === "ready") { holati.textContent = "✓ Xonaga kirdik. Oʻqituvchi ekranini kutamiz…"; oxirgiSalom = Date.now(); room.send("lobbi", {}); }
        },
        message(msg) {
          // Faqat boshlovchining xabari: boshqa telefonlarning "salom"i (lobbi {}) ham hammaga tarqaladi
          if (msg.from !== onlayn.HOST) return;
          oxirgiXabar = Date.now();
          const d = msg.data || {};
          if (msg.type === "lobbi") {
            const ids = Array.isArray(d.ids) ? d.ids : [];
            const k = ids.indexOf(me);
            if (k >= 0 && Array.isArray(d.jam)) { jamoam = P.JAMOALAR[d.jam[k] ? 1 : 0]; nomerim = k + 1; }
            QK.probe.lobbi = { jamoam, nomerim, oyin: !!d.oyin };
            if (d.oyin) return; // oʻyin ketyapti yoki tugagan — roʻyxat faqat eslatma
            if (rejim === "natija" || rejim === "oyin") { ekranKalit = ""; rolim = null; holatim = null; }
            if (d.sanoq) { kutishEkran(k >= 0 ? `Boshlanmoqda… ${d.sanoq}` : "Oʻyin boshlanmoqda — bu safar kuzatasan."); return; }
            kutishEkran(k >= 0 ? `Sen ${U.jamoaNomi(jamoam)} jamoasidasan. Oʻqituvchi boshlashini kutamiz…` : "Xonaga kirdik. Roʻyxatga qoʻshilishni kutamiz…");
            return;
          }
          if (msg.type === "rol") {
            if (!P.yaxshiRol(d)) return;
            rolPaketi = d;
            const r = P.rolOl(d, me);
            if (r) { jamoam = r.jam; rolim = r; } else rolim = null;
            QK.probe.rol = rolim;
            ekranYangila();
            return;
          }
          if (msg.type === "holat") {
            if (!P.yaxshiPaket(d)) return;
            holatim = P.holat(d, Date.now());
            QK.probe.holat = { faza: d.f, raund: d.r, tugadi: d.tugadi };
            ekranYangila();
            return;
          }
          if (msg.type === "xat") {
            if (!P.yaxshiXat(d) || d.jam !== jamoam) return;
            if (d.s !== undefined) { // javob: qaysi xat soxta edi
              if (qorovulEkran && xatPaketi && xatPaketi.n === d.n && !xatPaketi.javob) { xatPaketi.javob = 1; qorovulEkran.natija(d.s, !!d.och); sound.play(d.och ? "dum" : "correct"); }
              return;
            }
            if (xatPaketi && xatPaketi.n === d.n) { if (ovozim && ovozim.n === d.n) room.send("ovoz", ovozim); return; } // takror — ovoz yetib bormagan boʻlsa
            xatPaketi = d;
            if (ekran && ekran.yangila) ekran.yangila(ekranQ(holatim ? holatim.faza : ""));
          }
        },
      },
    });

    timer = setInterval(() => {
      const t = Date.now();
      if (ekran && ekran.render) ekran.render(t);
      if ((rejim === "oyin" || rejim === "kutish") && t - oxirgiXabar > P.HOST_JIM) uzildiEkran();
      if (rejim !== "uzildi" && t - oxirgiSalom > SALOM_HAR) { oxirgiSalom = t; room.send("lobbi", {}); }
    }, 250);
    ui.onCleanup(() => { clearInterval(timer); if (room) room.leave(); });
  }

  QK.qalaOnlayn = { host, guest, VAQTLAR, RAUNDLAR };
})(window);
