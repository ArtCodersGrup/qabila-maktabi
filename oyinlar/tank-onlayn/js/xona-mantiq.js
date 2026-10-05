// Onlayn tank xonasi — sof mantiq (ekransiz, Node'da test qilinadi: tests/xona.test.js).
// Har raundda hamma bola bitta satr yozadi; bola qurilmasi satrni raund boshidagi holat NUSXASIDA
// ishga tushirib, harakatlarni yozib oladi va faqat ularni yuboradi (kod matni tarmoqdan o'tmaydi).
// Doska (o'qituvchi qurilmasi) harakatlarni navbatma-navbat qo'yadi: hammaning 1-harakati, keyin 2-si…
(function (root) {
  "use strict";

  const J = (root.QK && root.QK.jang) || require("../../umumiy/js/jang.js");

  const MAX_ODAM = 8;
  const MIN_ODAM = 2;
  const RAUND_SONIYA = 8;
  const JANG_DAQIQA = 5; // jang raundlar soni bilan emas, umumiy vaqt bilan tugaydi (muallif qarori)
  const JON = 3;
  const UZOQ = 300; // hammaga teng — bolalar orasida ustunlik bo'lmasin
  const HARAKAT_NOMLARI = ["move", "back", "left", "right", "fire", "reload"];

  // Bolalar ranglari (Tog'ga chiqish qahramonlaridan birinchi 8 tasi)
  const QAHRAMONLAR = [
    { id: "qizil", nom: "Qizil", rang: "#D8342C" },
    { id: "kok", nom: "Koʻk", rang: "#2F6FDE" },
    { id: "yashil", nom: "Yashil", rang: "#63B247" },
    { id: "toqsariq", nom: "Toʻq sariq", rang: "#F59110" },
    { id: "binafsha", nom: "Binafsha", rang: "#8E5BD0" },
    { id: "moviy", nom: "Moviy", rang: "#10BFC4" },
    { id: "pushti", nom: "Pushti", rang: "#EE7BA8" },
    { id: "qora", nom: "Qora", rang: "#35353D" },
  ];
  const qahById = (id) => QAHRAMONLAR.find((q) => q.id === id) || QAHRAMONLAR[0];

  // Tug'ilish joylari: chap, o'ng, tepa, past, so'ng burchaklar — n ta bola uchun birinchi n tasi (simmetrik)
  const JOYLAR = [[80, 200], [520, 200], [300, 50], [300, 350], [80, 50], [520, 350], [520, 50], [80, 350]];
  // Markazda bitta pana: to'g'ri qarama-qarshi tanklar orasini to'sadi, diagonal yo'llar ochiq qoladi
  // (jang.js o'qni ham tank kattaligida hisoblaydi — to'siq atrofida 18 birlik zona bor)
  const TOSIQLAR = [{ x: 280, y: 160, en: 40, bo: 80 }];
  // Markazga qaragan burchak (0° — o'ngga, soat strelkasiga teskari)
  const markazga = (x, y) => Math.round(((Math.atan2(y - 200, 300 - x) * 180) / Math.PI + 360) % 360);

  // oyinchilar: [{ id, qah }] — tartibi tug'ilish joyini belgilaydi
  function maydon(oyinchilar) {
    const tanklar = oyinchilar.slice(0, MAX_ODAM).map((o, i) => {
      const [x, y] = JOYLAR[i];
      const t = J.tank({ id: o.id, x, y, burchak: markazga(x, y), jon: JON, uzoq: UZOQ });
      t.rang = qahById(o.qah).rang;
      t.qah = o.qah;
      return t;
    });
    const m = J.maydon({ tanklar, tosiqlar: TOSIQLAR });
    m.raund = 0;
    m.tg = Object.fromEntries(tanklar.map((t) => [t.id, 0])); // tekkazishlar
    m.yiqildi = {}; // id → qaysi raundda yiqildi
    m.tugadi = null;
    return m;
  }

  const nusxa = (m) => JSON.parse(JSON.stringify(m));
  const tank = (m, id) => m.tanklar.find((t) => t.id === id);
  const tiriklar = (m) => m.tanklar.filter((t) => t.tirik).map((t) => t.id);

  // Argumentni jang.js dagi kabi songa keltirish (move/back — musbat, left/right — ishorali)
  function argument(nom, args) {
    if (nom === "fire" || nom === "reload") return 0;
    const v = Math.max(-J.EN, Math.min(J.EN, Math.round(Number(args.length ? args[0] : 0))));
    return nom === "move" || nom === "back" ? Math.abs(v) : v;
  }

  // Bola qurilmasida: satrni holat nusxasida bajarib, harakatlarni yozib olish.
  // Natija: { xato, chiqish, harakatlar: [{ h, a }], chegaraOshdi }
  function yozibOl(m, id, kod, py) {
    const k = nusxa(m);
    // jang.js ning bir kishilik "tugadimi" tekshiruvi birinchi "bola" ga qaraydi — nusxada faqat shu bola "bola"
    for (const t of k.tanklar) t.tur = t.id === id ? "bola" : "raqib";
    const { fn, holat } = J.tashqiFunksiyalar(k, id);
    const harakatlar = [];
    const yozuvchi = Object.assign({}, fn);
    for (const nom of HARAKAT_NOMLARI) {
      yozuvchi[nom] = (args, ctx, pos) => {
        const oldin = holat.soni;
        const r = fn[nom](args, ctx, pos); // xato bo'lsa (masalan move("abc")) — shu yerda chiqadi
        if (holat.soni > oldin && !holat.chegaraOshdi) harakatlar.push({ h: nom, a: argument(nom, args) });
        return r;
      };
    }
    const r = py.run(kod, { tashqi: yozuvchi, maxSteps: 50000 });
    return { xato: r.error || null, chiqish: r.output || [], harakatlar: r.error ? [] : harakatlar, chegaraOshdi: holat.chegaraOshdi };
  }

  // Doskada: kelgan harakatlar to'g'rimi (nom ro'yxatda, ko'pi bilan 8 ta, argument son)
  function harakatlarToza(h, a) {
    if (!Array.isArray(h) || !Array.isArray(a) || h.length !== a.length || h.length > J.MAX_HARAKAT) return null;
    const out = [];
    for (let i = 0; i < h.length; i++) {
      if (!HARAKAT_NOMLARI.includes(h[i]) || typeof a[i] !== "number" || !Number.isFinite(a[i])) return null;
      out.push({ h: h[i], a: argument(h[i], [a[i]]) });
    }
    return out;
  }

  // Raundni bajarish: tartib — bolalar id lari (tasodifiy), harakatlar — { id: [{h, a}] }.
  // Navbatma-navbat: k-qadamda tartib bo'yicha har bolaning k-harakati. Natija — shu raund yozuvi.
  function raundniBajar(m, tartib, harakatlar) {
    const bosh = m.yozuv.length;
    m.raund += 1;
    for (let k = 0; k < J.MAX_HARAKAT; k++) {
      for (const id of tartib) {
        const q = (harakatlar[id] || [])[k];
        const t = tank(m, id);
        if (!q || !t || !t.tirik || m.tugadi) continue;
        const r = J.HARAKATLAR[q.h](m, t, q.a);
        if (q.h === "fire" && r && r.tegdi && r.tegdi !== "nishon") {
          m.tg[id] = (m.tg[id] || 0) + 1;
          const b = tank(m, r.tegdi);
          if (b && !b.tirik && m.yiqildi[b.id] === undefined) m.yiqildi[b.id] = m.raund;
        }
      }
    }
    tekshir(m);
    return m.yozuv.slice(bosh);
  }

  // Jang tugadimi: bitta (yoki hech kim) qoldi. Vaqtni doska kuzatadi — tugasa vaqtTugadi() chaqiradi.
  function tekshir(m) {
    if (tiriklar(m).length <= 1) m.tugadi = "tugadi";
    return m.tugadi;
  }
  function vaqtTugadi(m) {
    if (!m.tugadi) m.tugadi = "tugadi";
    return m.tugadi;
  }

  // Reyting: tiriklar (joni, keyin tekkazishi bo'yicha), keyin yiqilganlar (kechroq yiqilgan yuqoriroq)
  const kalit = (m, t) => [t.tirik ? 1 : 0, t.tirik ? t.jon : (m.yiqildi[t.id] || 0), m.tg[t.id] || 0];
  function reyting(m) {
    return m.tanklar.slice().sort((a, b) => {
      const x = kalit(m, a);
      const y = kalit(m, b);
      for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return y[i] - x[i];
      return 0;
    }).map((t) => t.id);
  }

  // G'olib: reytingdagi birinchi, agar ikkinchisi bilan hamma ko'rsatkichi teng bo'lmasa (aks holda — durang)
  function golib(m) {
    if (!m.tugadi) return null;
    const r = reyting(m);
    if (r.length < 2) return r[0] || null;
    const a = kalit(m, tank(m, r[0]));
    const b = kalit(m, tank(m, r[1]));
    return a.every((x, i) => x === b[i]) ? null : r[0];
  }

  function aralash(list, r) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
  // Tartib: kim oldin yuborgan bo'lsa — o'sha oldin (tez bosgan yutadi; ikkovida bittadan jon qolib,
  // bir-biriga otsa, birinchi yuborgan otib yutadi). Yubormaganlar oxirida (ularda harakat yo'q).
  function tartibYasa(m, kelish, r) {
    const tirik = tiriklar(m);
    const oldin = (kelish || []).filter((id, i, a) => tirik.includes(id) && a.indexOf(id) === i);
    return oldin.concat(aralash(tirik.filter((id) => !oldin.includes(id)), r || Math.random));
  }

  // ---------- Tarmoq paketlari (faqat sonlar, mantiq va qisqa kalitlar) ----------
  // Holat: oxirida (tugadi) ids reyting tartibida — server natijani shundan yozadi
  // jq — jang tugashiga qolgan soniya
  function holatPaketi(m, qoldi, jq) {
    const ids = m.tugadi ? reyting(m) : m.tanklar.map((t) => t.id);
    const tk = ids.map((id) => tank(m, id));
    return {
      r: m.raund, qoldi: Math.max(0, Math.round(qoldi || 0)), jq: Math.max(0, Math.round(jq || 0)), tugadi: m.tugadi ? 1 : 0, golib: (m.tugadi && golib(m)) || "",
      ids, qah: tk.map((t) => t.qah), x: tk.map((t) => t.x), y: tk.map((t) => t.y), b: tk.map((t) => t.burchak),
      jon: tk.map((t) => t.jon), oq: tk.map((t) => t.oq), tirik: tk.map((t) => (t.tirik ? 1 : 0)), tg: tk.map((t) => m.tg[t.id] || 0),
    };
  }

  // Bola qurilmasida maydonni doska holatiga tenglashtirish
  function holatniQoy(m, p) {
    m.raund = p.r;
    p.ids.forEach((id, i) => {
      const t = tank(m, id);
      if (!t) return;
      Object.assign(t, { x: p.x[i], y: p.y[i], burchak: p.b[i], jon: p.jon[i], oq: p.oq[i], tirik: !!p.tirik[i] });
      m.tg[id] = p.tg[i];
    });
    m.tugadi = p.tugadi ? "tugadi" : null;
    return m;
  }

  // Raund natijasi: tartib va har bolaning harakatlari (h0/a0 — tartib[0] niki va h.k.)
  function natijaPaketi(m, tartib, harakatlar) {
    const p = { r: m.raund, tartib: tartib.slice() };
    tartib.forEach((id, i) => {
      const list = harakatlar[id] || [];
      p["h" + i] = list.map((q) => q.h);
      p["a" + i] = list.map((q) => q.a);
    });
    return p;
  }
  function natijaniOch(p) {
    const harakatlar = {};
    (p.tartib || []).forEach((id, i) => { harakatlar[id] = harakatlarToza(p["h" + i] || [], p["a" + i] || []) || []; });
    return { tartib: p.tartib || [], harakatlar };
  }

  const api = {
    MAX_ODAM, MIN_ODAM, RAUND_SONIYA, JANG_DAQIQA, JON, UZOQ, HARAKAT_NOMLARI, QAHRAMONLAR, JOYLAR, TOSIQLAR,
    qahById, markazga, maydon, nusxa, tank, tiriklar, argument, yozibOl, harakatlarToza, raundniBajar, tekshir, vaqtTugadi,
    reyting, golib, tartibYasa, holatPaketi, holatniQoy, natijaPaketi, natijaniOch,
  };

  root.QK = root.QK || {};
  root.QK.tankXona = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
