// 46-o'yin: tezkor tugmalar (Ctrl+C, Tab, Home …) — sof mantiq, ekransiz.
// Hodisa ob'ekti: { key, ctrlKey, metaKey, shiftKey, altKey } — brauzernikiga mos,
// shuning uchun Node'da ham test qilsa bo'ladi: tests/logic.test.js
(function (root) {
  "use strict";

  const pick = (list, r) => list[Math.floor(r() * list.length)];

  function pickNew(make, prev, r) {
    for (let k = 0; k < 40; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  // Ko'rinadigan nom: Mac'da Ctrl o'rniga ⌘, lekin mantiq ikkalasini ham qabul qiladi
  const OQLAR = { ArrowLeft: "←", ArrowRight: "→", ArrowUp: "↑", ArrowDown: "↓" };

  const AMALLAR = [
    { id: "copy", kombo: ["Ctrl", "C"], nom: "Nusxa olish", izoh: "Belgilangan matn xotiraga olinadi — oʻzi joyida qoladi", mavzu: "nusxa" },
    { id: "paste", kombo: ["Ctrl", "V"], nom: "Qoʻyish", izoh: "Xotiradagi matn kursor turgan joyga qoʻyiladi", mavzu: "nusxa" },
    { id: "cut", kombo: ["Ctrl", "X"], nom: "Kesib olish", izoh: "Matn xotiraga olinadi va joyidan oʻchadi", mavzu: "nusxa" },
    { id: "undo", kombo: ["Ctrl", "Z"], nom: "Bekor qilish", izoh: "Oxirgi qilgan ishingni orqaga qaytaradi", mavzu: "nusxa" },
    { id: "all", kombo: ["Ctrl", "A"], nom: "Hammasini belgilash", izoh: "Butun matnni belgilaydi", mavzu: "nusxa" },
    { id: "save", kombo: ["Ctrl", "S"], nom: "Saqlash", izoh: "Faylni diskka yozadi", mavzu: "nusxa" },
    { id: "find", kombo: ["Ctrl", "F"], nom: "Qidirish", izoh: "Matn ichidan soʻz qidiradi", mavzu: "nusxa" },
    { id: "tab", kombo: ["Tab"], nom: "Keyingi maydonga oʻtish", izoh: "Shaklda keyingi katakka sakraydi", mavzu: "harakat" },
    { id: "enter", kombo: ["Enter"], nom: "Yangi qator", izoh: "Kursorni keyingi qatorga tushiradi", mavzu: "harakat" },
    { id: "home", kombo: ["Home"], nom: "Qator boshiga", izoh: "Kursor shu qatorning boshiga oʻtadi", mavzu: "harakat" },
    { id: "end", kombo: ["End"], nom: "Qator oxiriga", izoh: "Kursor shu qatorning oxiriga oʻtadi", mavzu: "harakat" },
    { id: "backspace", kombo: ["Backspace"], nom: "Chapdagini oʻchirish", izoh: "Kursordan CHAPdagi belgini oʻchiradi", mavzu: "tahrir" },
    { id: "delete", kombo: ["Delete"], nom: "Oʻngdagini oʻchirish", izoh: "Kursordan OʻNGdagi belgini oʻchiradi", mavzu: "tahrir" },
    { id: "shift-left", kombo: ["Shift", "←"], nom: "Chapga belgilash", izoh: "Oʻqlar bilan matn belgilanadi", mavzu: "tahrir" },
    { id: "shift-right", kombo: ["Shift", "→"], nom: "Oʻngga belgilash", izoh: "Oʻqlar bilan matn belgilanadi", mavzu: "tahrir" },
    { id: "ctrl-left", kombo: ["Ctrl", "←"], nom: "Soʻz boshiga sakrash", izoh: "Harf-harf emas, soʻz-soʻz yuradi", mavzu: "tahrir" },
  ];
  const amalById = (id) => AMALLAR.find((a) => a.id === id) || AMALLAR[0];
  const yozuv = (amal) => amal.kombo.join(" + ");

  // Bosilgan tugmalar birikmasi: "Ctrl + C", "Shift + ←", "Tab" …
  // Mac'dagi ⌘ (metaKey) ham Ctrl deb qabul qilinadi.
  function belgi(e) {
    const qismlar = [];
    if (e.ctrlKey || e.metaKey) qismlar.push("Ctrl");
    if (e.altKey) qismlar.push("Alt");
    if (e.shiftKey) qismlar.push("Shift");
    const key = e.key;
    if (["Control", "Meta", "Shift", "Alt"].includes(key)) return qismlar.join(" + ");
    const nom = OQLAR[key] || (key.length === 1 ? key.toUpperCase() : key);
    qismlar.push(nom);
    return qismlar.join(" + ");
  }

  const mos = (amal, e) => belgi(e) === yozuv(amal);

  // Qaysi bosish "tezkor tugma" deb yoziladi: oddiy harf terish emas, qolgani hammasi.
  // 3-bosqichda bola haqiqiy matn terishi mumkin — ular ro'yxatga tushmasin.
  const qaydEtiladi = (b) => b.includes(" + ") || b.length > 1;

  // ---------- 1-bosqich: bu tugmalar nima qiladi ----------
  function tanishTask(r, prev, mavzu) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const list = mavzu ? AMALLAR.filter((a) => a.mavzu === mavzu) : AMALLAR;
      const togri = pick(list, rnd);
      const boshqalar = AMALLAR.filter((a) => a.id !== togri.id && a.nom !== togri.nom);
      const variantlar = [togri];
      while (variantlar.length < 4 && boshqalar.length) {
        const x = pick(boshqalar, rnd);
        if (!variantlar.some((v) => v.id === x.id)) variantlar.push(x);
      }
      // Tartibni aralashtiramiz (to'g'ri javob doim birinchi bo'lib qolmasin)
      for (let i = variantlar.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [variantlar[i], variantlar[j]] = [variantlar[j], variantlar[i]];
      }
      return { id: "tanish:" + togri.id, tur: "tanish", amal: togri, variantlar, javob: togri.id,
        matn: yozuv(togri) + " — nima qiladi?" };
    }, prev, rr);
  }

  // ---------- 2-bosqich: tugmalarni o'zi bosadi ----------
  function bosishTask(r, prev, mavzu) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const list = mavzu ? AMALLAR.filter((a) => a.mavzu === mavzu) : AMALLAR;
      const amal = pick(list, rnd);
      return { id: "bosish:" + amal.id, tur: "bosish", amal, javob: yozuv(amal),
        matn: amal.nom + " uchun qaysi tugmalarni bosasan?" };
    }, prev, rr);
  }

  // Ko'p adashtiradigan juftliklar
  const JUFTLAR = [
    { a: "backspace", b: "delete", savol: "Kursordan OʻNGdagi belgini qaysi tugma oʻchiradi?", javob: "delete" },
    { a: "copy", b: "cut", savol: "Matn joyidan oʻchib, xotiraga olinishi uchun qaysi birini bosasan?", javob: "cut" },
    { a: "home", b: "end", savol: "Kursorni qator boshiga qaysi tugma olib boradi?", javob: "home" },
    { a: "copy", b: "paste", savol: "Xotiradagi matnni qoʻyish uchun qaysi biri?", javob: "paste" },
    { a: "undo", b: "all", savol: "Notoʻgʻri oʻchirib yubording. Qaysi biri qaytaradi?", javob: "undo" },
    { a: "tab", b: "enter", savol: "Shaklda keyingi katakka oʻtish uchun qaysi biri?", javob: "tab" },
  ];

  function farqTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const j = pick(JUFTLAR, rnd);
      const variantlar = [amalById(j.a), amalById(j.b)];
      if (rnd() < 0.5) variantlar.reverse();
      return { id: "farq:" + j.a + ":" + j.b, tur: "farq", variantlar, javob: j.javob, matn: j.savol,
        nega: amalById(j.javob).izoh };
    }, prev, rr);
  }

  // ---------- 3-bosqich: haqiqiy matn ustida ----------
  // Bola haqiqiy maydonda ishlaydi; natija ham, ishlatilgan tugmalar ham tekshiriladi
  const MAQSADLAR = [
    {
      id: "ikki-marta",
      boshlangich: "qabila",
      maqsad: "qabila qabila",
      vazifa: "Soʻzni ikki marta yoz — lekin qayta termasdan, nusxa olib qoʻy.",
      kerak: ["copy", "paste"],
      ishora: "Ctrl + A bilan hammasini belgila, Ctrl + C bilan nusxa ol, End bilan oxiriga oʻt, boʻsh joy qoʻyib Ctrl + V bos.",
    },
    {
      id: "ikki-qator",
      boshlangich: "men maktabga boraman",
      maqsad: "men maktabga boraman\nmen maktabga boraman",
      vazifa: "Shu gapni pastiga yana bir marta qoʻy (ikki qator boʻlsin).",
      kerak: ["copy", "paste"],
      ishora: "Hammasini belgilab nusxa ol, oxiriga oʻt, Enter bos va Ctrl + V qil.",
    },
    {
      id: "qaytar",
      boshlangich: "bu matnni oʻchirma",
      maqsad: "bu matnni oʻchirma",
      vazifa: "Hammasini belgilab oʻchir, keyin bekor qilib qaytar.",
      kerak: ["all", "undo"],
      ishora: "Ctrl + A, keyin Backspace. Endi Ctrl + Z — matn qaytadi.",
    },
    {
      id: "boshiga",
      boshlangich: "maktabga boraman",
      maqsad: "men maktabga boraman",
      vazifa: "Gap boshiga «men » soʻzini qoʻsh — kursorni oʻq bilan emas, bitta tugma bilan olib bor.",
      kerak: ["home"],
      ishora: "Home bosilsa, kursor qator boshiga sakraydi. Keyin «men » deb yoz.",
    },
    {
      id: "belgila",
      boshlangich: "qabilaxx",
      maqsad: "qabila",
      vazifa: "Oxiridagi ikki harfni belgilab oʻchir (bittalab emas).",
      kerak: ["shift-left"],
      ishora: "End bilan oxiriga oʻt, Shift + ← ni ikki marta bos — ikki harf belgilanadi, keyin Backspace.",
    },
  ];

  function maqsadTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => Object.assign({ tur: "maqsad" }, pick(MAQSADLAR, rnd)), prev, rr);
  }

  // Matnni solishtirish: qator oxiridagi bo'sh joylar va oxirgi bo'sh qatorlar hisobga olinmaydi
  const tozala = (matn) => String(matn == null ? "" : matn).split("\n").map((s) => s.replace(/[ \t]+$/, "")).join("\n").replace(/\n+$/, "");
  const bajarildi = (maqsad, matn, bosilgan) => tozala(matn) === tozala(maqsad.maqsad)
    && maqsad.kerak.every((id) => bosilgan.includes(yozuv(amalById(id))));
  const yetishmaydi = (maqsad, bosilgan) => maqsad.kerak.filter((id) => !bosilgan.includes(yozuv(amalById(id)))).map(amalById);

  const api = { AMALLAR, amalById, yozuv, belgi, mos, qaydEtiladi, JUFTLAR, MAQSADLAR, OQLAR,
    tanishTask, bosishTask, farqTask, maqsadTask, tozala, bajarildi, yetishmaydi };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
