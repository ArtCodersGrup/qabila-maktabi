// Yozuv poygasi — sof mantiq: xona holati, yozilgan belgilardan pog'ona, tartib va natija.
// Tog' o'yinidan faqat tog'lar va 12 rangli qahramon olinadi (ko'rinish uchun),
// qoidalari boshqa: pauza, qolib ketish va vaqt chegarasi YO'Q — hamma cho'qqiga chiqadi.
// Ekran bilan ishlamaydi, Node'da test qilinadi: tests/poyga.test.js
(function (root) {
  "use strict";

  const node = typeof module !== "undefined" && module.exports;
  const T = node ? require("../../tog/js/tog.js") : root.QK.tog;
  const TY = node ? require("../../23-on-barmoq/js/typing.js") : root.QK.typing;

  const MIN_ODAM = 2;
  const MAX_ODAM = T.MAX_PLAYERS;

  // Matn turi → tog' (faqat ko'rinish): uzunroq matn — balandroq tog'
  const TOG_TURI = { home: "chimyon", words: "hazrati", proverb: "pomir" };
  const TURLAR = TY.RACE_LEVELS.map((l) => {
    const t = T.togById(TOG_TURI[l.id]);
    return { id: l.id, nom: l.title, tog: t.id, pogona: t.pogona };
  });
  const turById = (id) => TURLAR.find((t) => t.id === id) || TURLAR[0];

  const odamlar = (s) => Object.values(s.oyinchilar);
  const band = (s, qah, id) => odamlar(s).some((p) => p.qahramon === qah && p.id !== id);
  const boshRanglar = (s) => T.QAHRAMONLAR.filter((q) => !band(s, q.id, null)).map((q) => q.id);
  const reset = (p) => Object.assign(p, { bel: 0, pogona: 0, orin: 0, ms: 0, cpm: 0, aniq: 0, oxirgi: 0 });

  function holatYarat({ tur, urug, jami }) {
    const t = turById(tur);
    return {
      tur: t.id, urug: urug || 0, tog: t.tog, pogona: t.pogona, jami: jami || 0,
      boshlandi: false, boshlangan: 0, tugadi: false, keldi: 0, oyinchilar: {},
    };
  }

  // Bitta rang — bitta bolaga. Qayta kirgan bola (o'sha id) joyini va yozganini yo'qotmaydi.
  function qoshil(s, id, qahramon) {
    const bor = s.oyinchilar[id];
    if (bor) {
      if (qahramon && !band(s, qahramon, id)) bor.qahramon = qahramon;
      return true;
    }
    if (odamlar(s).length >= MAX_ODAM) return false;
    if (!T.QAHRAMONLAR.find((q) => q.id === qahramon) || band(s, qahramon, id)) return false;
    s.oyinchilar[id] = reset({ id, qahramon });
    return true;
  }

  function chiqar(s, id) {
    if (!s.oyinchilar[id]) return false;
    delete s.oyinchilar[id];
    return true;
  }

  function boshla(s, now) {
    s.boshlandi = true;
    s.boshlangan = now;
    s.tugadi = false;
    s.keldi = 0;
    odamlar(s).forEach(reset);
    return true;
  }

  // Yangi poyga: bolalar xonada qoladi, matn yangilanadi, yo'l boshidan
  function qayta(s, { tur, urug, jami }, now) {
    const t = turById(tur);
    Object.assign(s, { tur: t.id, urug: urug || 0, tog: t.tog, pogona: t.pogona, jami: jami || 0 });
    return boshla(s, now) && s;
  }

  // Yozilgan ulush — pog'ona. Cho'qqi faqat matn to'liq yozilganda.
  function pogonaOf(bel, jami, pogona) {
    if (!jami || bel <= 0) return 0;
    if (bel >= jami) return pogona;
    return Math.min(pogona - 1, Math.floor((bel / jami) * pogona));
  }

  // Bolaning qadami. Orqaga qaytmaydi: kechikib kelgan xabar hisobga olinmaydi.
  function qadam(s, id, d, now) {
    const p = s.oyinchilar[id];
    if (!p || !s.boshlandi || s.tugadi) return false;
    const bel = Math.max(0, Math.min(s.jami, Math.floor(d.bel || 0)));
    if (bel <= p.bel && p.bel > 0) return false;
    p.bel = bel;
    p.pogona = pogonaOf(bel, s.jami, s.pogona);
    p.oxirgi = now;
    if (bel >= s.jami && !p.orin) {
      p.orin = ++s.keldi;
      p.ms = Math.max(0, Math.floor(d.ms || 0));
      p.cpm = Math.max(0, Math.floor(d.cpm || 0));
      p.aniq = Math.max(0, Math.min(100, Math.floor(d.aniq || 0)));
    }
    return true;
  }

  // Avval cho'qqiga chiqqanlar (kelish tartibida), keyin yo'ldagilar (yozgani bo'yicha)
  function tartib(s) {
    return odamlar(s).sort((a, b) => {
      if (a.orin && b.orin) return a.orin - b.orin;
      if (a.orin !== b.orin) return a.orin ? -1 : 1;
      if (b.bel !== a.bel) return b.bel - a.bel;
      return a.id < b.id ? -1 : 1;
    });
  }

  // Hamma cho'qqiga chiqdimi. hozir — xonada turganlar (ixtiyoriy): chiqib ketgan bola kutilmaydi,
  // lekin bunda kamida bittasi yetib borgan bo'lishi kerak (bo'sh poyga tugagan hisoblanmaydi).
  function hammasiTugadi(s, hozir) {
    if (!s.boshlandi) return false;
    const list = odamlar(s);
    if (!list.length) return false;
    const bor = hozir == null ? null : (Array.isArray(hozir) ? new Set(hozir) : hozir);
    if (list.some((p) => !p.orin && (!bor || bor.has(p.id)))) return false;
    return bor ? list.some((p) => p.orin > 0) : true;
  }

  function tugat(s, now) {
    s.tugadi = true;
    s.tugagan = now;
    return s;
  }

  const natija = (s) => tartib(s).map((p) => ({
    id: p.id, qahramon: p.qahramon, orin: p.orin, bel: p.bel,
    ms: p.ms, cpm: p.cpm, aniq: p.aniq, tugadi: p.orin > 0,
  }));

  const api = {
    TURLAR, MIN_ODAM, MAX_ODAM, turById, holatYarat, qoshil, chiqar, boshRanglar,
    boshla, qayta, qadam, pogonaOf, tartib, hammasiTugadi, tugat, natija,
  };

  if (node) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.yozuvPoyga = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
