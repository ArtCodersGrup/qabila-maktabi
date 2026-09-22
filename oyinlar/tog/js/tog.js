// Tog'ga chiqish — sof hisob: tog'lar, qahramonlar, o'yin holati, pog'onalar, qolib ketish, g'olib.
// Ekran va tarmoq bilan ishlamaydi (ularni o'qituvchi qurilmasidagi sahna chaqiradi), Node'da test qilinadi.
(function (root) {
  "use strict";

  // Tog'lar: nomiga qarab balandlik va chegara (DIZAYN 2.11)
  const TOGLAR = [
    { id: "chimyon", nom: "Chimyon", metr: 3309, pogona: 15, chegara: 4, daqiqa: 10 },
    { id: "hazrati", nom: "Hazrati Sulton", metr: 4643, pogona: 20, chegara: 4, daqiqa: 10 },
    { id: "pomir", nom: "Pomir", metr: 7495, pogona: 25, chegara: 5, daqiqa: 15 },
    { id: "himolay", nom: "Himolay", metr: 8849, pogona: 30, chegara: 6, daqiqa: 15 },
  ];
  const DEFAULT_TOG = "hazrati";

  // 12 ta qahramon: bitta qahramon bitta bolaga (DIZAYN 2.7)
  const QAHRAMONLAR = [
    { id: "tulki", nom: "Tulki", rang: "#F08A24" },
    { id: "burgut", nom: "Burgut", rang: "#8A6A3B" },
    { id: "echki", nom: "Togʻ echkisi", rang: "#C98B5E" },
    { id: "ayiq", nom: "Ayiq", rang: "#7A4E2E" },
    { id: "irbis", nom: "Irbis", rang: "#9FB6D8" },
    { id: "bori", nom: "Boʻri", rang: "#6B7480" },
    { id: "quyon", nom: "Quyon", rang: "#D9D2C3" },
    { id: "boyqush", nom: "Boyqush", rang: "#8E5BD0" },
    { id: "kiyik", nom: "Kiyik", rang: "#E0B04A" },
    { id: "olmaxon", nom: "Olmaxon", rang: "#C8553D" },
    { id: "tipratikan", nom: "Tipratikan", rang: "#5C6570" },
    { id: "lochin", nom: "Lochin", rang: "#2F6FDE" },
  ];

  const MIN_PLAYERS = 2;
  const MAX_PLAYERS = 12;
  const PAUZA = [10000, 20000]; // 1-xato — 10 s, ketma-ket ikkinchisidan boshlab — 20 s (DIZAYN 2.3)
  const JIM = 60000; // shuncha vaqt javob bermasa, o'qituvchi ekranida belgilanadi

  const togById = (id) => TOGLAR.find((t) => t.id === id) || TOGLAR.find((t) => t.id === DEFAULT_TOG);
  // Qolib ketish qoidasi yetakchi yarim yo'lni bosgandan keyin ishlaydi (DIZAYN 2.1)
  const yarim = (tog) => Math.ceil(tog.pogona / 2);
  // Savol qiyinligi balandlikka qarab: pastki uchdan bir — oson, o'rtasi — o'rta, yuqorisi — qiyin (DIZAYN 2.2)
  function daraja(tog, step) {
    const bir = tog.pogona / 3;
    return step < bir ? 1 : step < 2 * bir ? 2 : 3;
  }

  // ---------- Holat ----------
  // players: [{ id, qahramon }]. now — vaqt (ms).
  // qoida: "chegara" — yetakchidan chegara pog'ona orqada qolgan chiqadi (muallif qoidasi);
  //        "oxirgi" — yetakchi har bekatdan o'tganda eng pastdagi bitta o'yinchi chiqadi.
  // boshlanish: qoida yetakchi tog'ning qaysi qismini bosgandan keyin ishlashi (0.5 — yarim yo'l).
  function create({ tog, players, now, daqiqa, qoida, boshlanish, bekat }) {
    const t = togById(tog);
    const minutes = daqiqa || t.daqiqa;
    const state = {
      tog: t.id,
      boshlandi: now,
      tugaydi: now + minutes * 60000,
      pogona: t.pogona,
      chegara: t.chegara,
      oyinchilar: {},
      tartib: players.map((p) => p.id),
      qoida: qoida || "chegara",
      boshlanish: boshlanish == null ? 0.5 : boshlanish,
      bekat: bekat || 2, // "oxirgi" qoidasida: yetakchi har necha pog'onada bittadan chiqarish
      oxirgiBekat: 0,
      tugadi: false,
      golib: null,
      sabab: null, // "chogqi" | "uzib-ketdi" | "vaqt"
    };
    players.forEach((p) => {
      state.oyinchilar[p.id] = {
        id: p.id,
        qahramon: p.qahramon,
        pogona: 0,
        chiqdi: false, // qolib ketgan (tomoshabin)
        pauzaGacha: 0,
        xatoKetma: 0,
        togri: 0,
        xato: 0,
        oxirgi: now, // oxirgi javob vaqti (jim turganini ko'rsatish uchun)
        vaqtlar: {}, // pog'ona → qachon chiqqani (teng holatda kim oldin chiqqani)
      };
    });
    return state;
  }

  const active = (s) => Object.values(s.oyinchilar).filter((p) => !p.chiqdi);
  const leader = (s) => active(s).reduce((m, p) => (p.pogona > m ? p.pogona : m), 0);
  const javobBeraOladi = (s, id, now) => {
    const p = s.oyinchilar[id];
    return !!p && !s.tugadi && !p.chiqdi && now >= p.pauzaGacha && now < s.tugaydi;
  };
  const jim = (s, id, now) => now - s.oyinchilar[id].oxirgi >= JIM;

  // Javob: ok — to'g'rimi. To'g'ri bo'lsa — bir pog'ona yuqoriga, xato bo'lsa — pauza (pastga tushish yo'q).
  function javob(s, id, ok, now) {
    if (!javobBeraOladi(s, id, now)) return null;
    const p = s.oyinchilar[id];
    p.oxirgi = now;
    if (ok) {
      p.togri++;
      p.xatoKetma = 0;
      p.pogona++;
      p.vaqtlar[p.pogona] = now;
    } else {
      p.xato++;
      p.xatoKetma++;
      p.pauzaGacha = now + PAUZA[Math.min(p.xatoKetma - 1, PAUZA.length - 1)];
    }
    tekshir(s, now);
    return p;
  }

  // Qoidalarni tekshirish: qolib ketganlar, cho'qqi, uzib ketish, vaqt (DIZAYN 1.6–1.8, 2.1)
  function tekshir(s, now) {
    if (s.tugadi) return s;
    const t = togById(s.tog);
    const top = leader(s);
    const boshland = top >= Math.ceil(t.pogona * s.boshlanish);
    if (boshland && s.qoida === "chegara") {
      active(s).forEach((p) => {
        if (top - p.pogona >= s.chegara) p.chiqdi = true;
      });
    } else if (boshland && s.qoida === "oxirgi") {
      // Yetakchi navbatdagi bekatdan o'tdi — eng pastdagi bitta o'yinchi chiqadi
      while (top >= s.oxirgiBekat + s.bekat && active(s).length > 1) {
        s.oxirgiBekat = Math.max(s.oxirgiBekat + s.bekat, Math.ceil(t.pogona * s.boshlanish));
        const pastki = reyting(s).filter((p) => !p.chiqdi).pop();
        if (pastki) pastki.chiqdi = true;
      }
    }
    const qolgan = active(s);
    const chogqida = qolgan.find((p) => p.pogona >= s.pogona);
    if (chogqida) return tugat(s, chogqida.id, "chogqi");
    if (qolgan.length === 1 && Object.keys(s.oyinchilar).length > 1) return tugat(s, qolgan[0].id, "uzib-ketdi");
    if (now >= s.tugaydi) {
      const r = reyting(s);
      return tugat(s, r.length ? r[0].id : null, "vaqt");
    }
    return s;
  }

  function tugat(s, golib, sabab) {
    s.tugadi = true;
    s.golib = golib;
    s.sabab = sabab;
    return s;
  }

  // Reyting: avval chiqib ketmaganlar, keyin balandlik, keyin o'sha pog'onaga kim oldin chiqqani (DIZAYN 2.8)
  function reyting(s) {
    return Object.values(s.oyinchilar).slice().sort((a, b) => {
      if (a.chiqdi !== b.chiqdi) return a.chiqdi ? 1 : -1;
      if (a.pogona !== b.pogona) return b.pogona - a.pogona;
      const ta = a.vaqtlar[a.pogona] || Infinity;
      const tb = b.vaqtlar[b.pogona] || Infinity;
      return ta - tb;
    });
  }

  // O'qituvchi o'yinchini chiqarib yuboradi (DIZAYN 2.9)
  function chiqar(s, id, now) {
    const p = s.oyinchilar[id];
    if (!p) return s;
    p.chiqdi = true;
    p.chiqarilgan = true;
    return tekshir(s, now);
  }

  const api = {
    TOGLAR, DEFAULT_TOG, QAHRAMONLAR, MIN_PLAYERS, MAX_PLAYERS, PAUZA, JIM,
    togById, yarim, daraja, create, javob, tekshir, reyting, chiqar, javobBeraOladi, jim, leader,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.tog = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
