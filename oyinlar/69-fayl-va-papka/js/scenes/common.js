// 69-o'yin: «Fayllar» oynasi (o'yinchoq kompyuter) va mashq ekranlari.
// Oyna ko'rinishi — umumiy/css/stol.css (.oyna, .stol-belgi) + o'z css/style.css (.fp-); daraxt mantig'i — logic.js.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, practice, sound } = QK;
  const h = ui.h;
  const belgi = (nom) => QK.stolArt.icon(nom);
  const turBelgi = (tur) => belgi(tur === "papka" ? "papka" : "f-" + tur);

  // Ikki marta bosish o'zimizcha aniqlanadi: bitta narsaga shu vaqt ichida ikki click.
  // Sichqonchada ham, barmoqda ham bir xil ishlaydi (brauzerning dblclick hodisasiga tayanilmaydi).
  const IKKI_MS = 450;

  // ---------- Mashq qutisi ----------
  function box(compact) {
    ui.setCompact(compact !== false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    const el = h("div", { class: "pbox" });
    ui.work().append(el);
    return el;
  }

  const note = (text) => h("div", { class: "note", text });
  const answer = (text) => h("div", { class: "answer", text });
  // Maslahat va yechim joyi — oynaning tepasida (telefonda oynaning pasti ekrandan chiqib ketishi mumkin)
  const ustJoy = () => h("div", { class: "fp-ust", "aria-live": "polite" });

  // Nom: asosi va oxiri alohida — satr sinsa ham «.jpg» butun qoladi va ko'zga tashlanadi
  function nomEl(nom, cls) {
    const k = L.turi(nom) ? L.kengaytma(nom) : "";
    const el = h("span", { class: cls || "fp-nom" }, h("span", { text: k ? nom.slice(0, -k.length) : nom }));
    if (k) el.append(root.document.createElement("wbr"), h("span", { class: "fp-kengaytma", text: k }));
    return el;
  }

  // ---------- «Fayllar» oynasi ----------
  const ASBOBLAR = [
    { nom: "orqaga", yozuv: "Orqaga" },
    { nom: "yangi", yozuv: "Yangi papka" },
    { nom: "nomla", yozuv: "Nomla" },
    { nom: "nusxa", yozuv: "Nusxa", tezkor: "Ctrl+C" },
    { nom: "kes", yozuv: "Kesish", tezkor: "Ctrl+X" },
    { nom: "qoy", yozuv: "Qoʻyish", tezkor: "Ctrl+V" },
    { nom: "ochir", yozuv: "Oʻchirish", tezkor: "Delete" },
    { nom: "qaytar", yozuv: "Qaytarish" }, // faqat savat ichida ko'rinadi
  ];
  const TUR_YOZUV = { papka: "Papka", rasm: "Rasm", matn: "Matn", musiqa: "Musiqa", video: "Video" };

  let joriyOyna = null; // sinov ilgagi: avtomat o'ynovchi oxirgi oynani shu yerdan oladi

  // opts: holat — boshlang'ich holat; asboblar — ko'rinadigan asboblar; savat — savat ko'rinadimi;
  //       tezkor — klaviatura tugmalari (faqat klaviaturali qurilmada); onOch(tugun) — fayl ochildi.
  function fayllar(host, opts) {
    const o = opts || {};
    let holat = o.holat;
    let korinadigan = (o.asboblar || ["orqaga"]).slice();
    let savatda = false;       // savat ichi ko'rinib turibdi
    let savatTanlangan = null;
    let nomRejim = null;       // "yangi" | "nomla" — nom chiplari ochiq
    let muz = false;           // vaqtincha: oqsoqol gapirayotganda bosib bo'lmaydi
    let toxtagan = false;      // butunlay: vazifa tugadi
    let tinglovchi = null;
    let ochilgan = null;       // oxirgi ochilgan fayl id si
    let bosish = { id: null, vaqt: 0 };
    let ochiqQat = null;
    let yechimId = null;
    const tezkor = !!o.tezkor && !ui.touchOnly();
    const tugmalar = {};
    const belgilar = new Map(); // id → ro'yxatdagi tugma

    const band = () => muz || toxtagan;
    const xabar = () => { if (tinglovchi) tinglovchi(); };

    // --- Qismlar ---
    const asbobQator = h("div", { class: "fp-asboblar", role: "toolbar", "aria-label": "Asboblar" });
    for (const a of ASBOBLAR) {
      const b = h("button", { class: "fp-asbob", type: "button", "data-amal": a.nom, html: QK.gameArt.asbob(a.nom) },
        h("span", { class: "fp-asbob-yozuv" },
          h("span", { text: a.yozuv }),
          tezkor && a.tezkor ? h("small", { class: "fp-tezkor", text: a.tezkor }) : null));
      b.addEventListener("click", () => {
        if (!yoniq(a.nom)) return;
        sound.play("tap");
        amal(a.nom);
      });
      tugmalar[a.nom] = b;
      asbobQator.append(b);
    }
    const nomlarEl = h("div", { class: "fp-nomlar", hidden: true });
    const yolEl = h("div", { class: "fp-yol", "aria-label": "Yoʻl" });
    const royxat = h("div", { class: "fp-royxat" });
    const ichi = h("div", { class: "oyna-ichi fp-ichi" }, royxat);
    const holatEl = h("div", { class: "fp-holat", "aria-live": "polite" });
    const savatBtn = h("button", { class: "fp-savat", type: "button", "data-amal": "savat" });
    const past = h("div", { class: "fp-past" }, holatEl, o.savat ? savatBtn : null);
    const el = h("div", { class: "oyna faol fp-oyna" },
      h("div", { class: "oyna-sarlavha", html: belgi("fayllar") }, h("span", { class: "oyna-nom", text: "Fayllar" })),
      asbobQator, nomlarEl, yolEl, ichi, past);
    host.append(el);

    // --- Qaysi asbob hozir ishlaydi ---
    function yoniq(nom) {
      if (band()) return false;
      if (savatda) return nom === "orqaga" || (nom === "qaytar" && savatTanlangan != null);
      const t = holat.tanlangan == null ? null : L.top(holat, holat.tanlangan);
      if (nom === "orqaga") return holat.joriy !== holat.ildiz.id;
      if (nom === "yangi") return true;
      if (nom === "nomla") return !!t && t.tur === "papka"; // bu o'yinda faqat papka nomlanadi
      if (nom === "qoy") return L.qoyMumkin(holat);
      if (nom === "nusxa" || nom === "kes" || nom === "ochir") return !!t;
      return false;
    }

    // --- Chizish ---
    function chizAsboblar() {
      for (const a of ASBOBLAR) {
        const b = tugmalar[a.nom];
        b.hidden = savatda ? !(a.nom === "orqaga" || a.nom === "qaytar") : !korinadigan.includes(a.nom);
        b.disabled = !yoniq(a.nom);
        b.classList.toggle("yoniq", nomRejim === a.nom);
      }
    }

    function chizNomlar() {
      nomlarEl.hidden = !nomRejim;
      nomlarEl.textContent = "";
      if (!nomRejim) return;
      nomlarEl.append(h("div", { class: "fp-nomlar-sarlavha", text: nomRejim === "yangi" ? "Yangi papkaga nom tanla:" : "Papkaga yangi nom tanla:" }));
      for (const nom of L.nomTakliflari(holat)) {
        nomlarEl.append(h("button", { class: "fp-chip", type: "button", "data-nom": nom, text: nom, onClick: () => nomTanlandi(nom) }));
      }
      nomlarEl.append(h("button", { class: "fp-chip bekor", type: "button", "data-nom": "", text: "Bekor", onClick: () => nomTanlandi(null) }));
    }

    function chizYol() {
      yolEl.textContent = "";
      const nomlar = savatda ? ["Savat"] : L.yol(holat, holat.joriy);
      nomlar.forEach((nom, k) => {
        if (k) yolEl.append(h("span", { class: "fp-yol-ajrat", text: " › " }));
        yolEl.append(h("span", { class: "fp-yol-nom" + (k === nomlar.length - 1 ? " joriy" : ""), text: nom }));
      });
    }

    function chizRoyxat() {
      royxat.textContent = "";
      belgilar.clear();
      const list = savatda ? holat.savat.map((s) => s.tugun) : L.korinadi(holat);
      if (!list.length) royxat.append(h("div", { class: "fp-bosh", text: savatda ? "Savat boʻsh" : "Bu papka boʻsh" }));
      for (const t of list) {
        const b = h("button", {
          class: "stol-belgi", type: "button", "data-id": t.id, "data-nom": t.nom,
          "aria-label": `${TUR_YOZUV[t.tur]}: ${t.nom}`, html: turBelgi(t.tur),
        }, nomEl(t.nom));
        b.addEventListener("click", (e) => {
          e.stopPropagation(); // bo'sh joyga bosish (tanlovni olib tashlash) bilan aralashmasin
          bosildi(t.id);
        });
        belgilar.set(t.id, b);
        royxat.append(b);
      }
      chizTanlov();
    }

    function chizTanlov() {
      const tanlangan = savatda ? savatTanlangan : holat.tanlangan;
      const kesilgan = !savatda && holat.bufer && holat.bufer.amal === "kesish" ? holat.bufer.id : null;
      for (const [id, b] of belgilar) {
        b.classList.toggle("tanlangan", id === tanlangan);
        b.setAttribute("aria-pressed", id === tanlangan ? "true" : "false");
        b.classList.toggle("fp-kesilgan", id === kesilgan);
        b.classList.toggle("fp-yechim", id === yechimId);
      }
    }

    function chizPast() {
      const t = holat.bufer ? L.top(holat, holat.bufer.id) : null;
      holatEl.textContent = t ? (holat.bufer.amal === "kesish" ? "Kesildi: " : "Nusxa olindi: ") + t.nom : "";
      if (o.savat) {
        const n = holat.savat.length;
        savatBtn.innerHTML = belgi(n ? "savat-tola" : "savat");
        savatBtn.append(h("span", { text: n ? `Savat (${n})` : "Savat" }));
        savatBtn.classList.toggle("faol", savatda);
        savatBtn.setAttribute("aria-pressed", savatda ? "true" : "false");
        savatBtn.disabled = band();
      }
      past.hidden = !o.savat && !korinadigan.some((a) => a === "kes" || a === "nusxa");
    }

    // Tanlov o'zgarganda ro'yxat qayta qurilmaydi — ikki marta bosishning ikkinchi bosishi o'sha tugmaga tushadi
    function yengilChiz() {
      if (nomRejim === "nomla" && !yoniq("nomla")) nomRejim = null;
      chizAsboblar();
      chizNomlar();
      chizTanlov();
    }

    function chiz() {
      if (nomRejim && (savatda || band() || (nomRejim === "nomla" && !yoniq("nomla")))) nomRejim = null;
      chizAsboblar();
      chizNomlar();
      chizYol();
      chizRoyxat();
      chizPast();
    }

    // --- Ochilgan fayl: oyna ichida qisqa ko'rsatiladi ---
    function ochiqYop() {
      if (ochiqQat) ochiqQat.remove();
      ochiqQat = null;
    }

    function ochiqKorsat(t) {
      ochiqYop();
      const qat = h("div", { class: "fp-ochiq", role: "status" },
        h("div", { class: "fp-ochiq-rasm", html: QK.gameArt.ochiq(t.tur) }),
        nomEl(t.nom, "fp-ochiq-nom"),
        h("div", { class: "fp-ochiq-izoh", text: TUR_YOZUV[t.tur] + " ochildi" }));
      qat.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!toxtagan) ochiqYop();
      });
      ochiqQat = qat;
      ichi.append(qat);
      // Vazifa shu fayl bilan tugagan bo'lsa (toxtagan) — ochiq holda qoladi
      setTimeout(() => { if (ochiqQat === qat && !toxtagan) ochiqYop(); }, 1400);
    }

    // --- Harakatlar ---
    function ozgar(yangi) {
      if (yangi === holat) return false;
      holat = yangi;
      ochiqYop();
      chiz();
      xabar();
      return true;
    }

    function och(id) {
      const t = L.top(holat, id);
      if (!t) return;
      if (t.tur === "papka") {
        sound.play("tap");
        nomRejim = null;
        ozgar(L.kir(holat, id));
        return;
      }
      ochilgan = id;
      ochiqKorsat(t);
      if (o.onOch) o.onOch(t);
      else sound.play("tap");
      xabar();
    }

    function bosildi(id) {
      if (band()) return;
      const hozir = Date.now();
      const ikki = bosish.id === id && hozir - bosish.vaqt <= IKKI_MS;
      bosish = ikki ? { id: null, vaqt: 0 } : { id, vaqt: hozir };
      if (savatda) { // savatdagi narsa ochilmaydi — faqat tanlanadi (avval qaytarish kerak)
        sound.play("tap");
        savatTanlangan = id;
        yengilChiz();
        xabar();
        return;
      }
      if (ikki) {
        och(id);
        return;
      }
      sound.play("tap");
      const y = L.tanla(holat, id);
      if (y === holat) return;
      holat = y;
      yengilChiz();
      xabar();
    }

    // Bo'sh joyga bosish — tanlovni olib tashlaydi
    ichi.addEventListener("click", () => {
      if (band()) return;
      if (savatda) savatTanlangan = null;
      else holat = L.tanla(holat, null);
      yengilChiz();
    });

    function amal(nom) {
      if (!yoniq(nom)) return;
      if (savatda) {
        if (nom === "orqaga") {
          savatda = false;
          savatTanlangan = null;
          chiz();
          xabar();
        } else {
          const id = savatTanlangan;
          savatTanlangan = null;
          ozgar(L.tikla(holat, id));
        }
        return;
      }
      if (nom === "yangi" || nom === "nomla") {
        nomRejim = nomRejim === nom ? null : nom;
        chiz();
        return;
      }
      nomRejim = null;
      const y = nom === "orqaga" ? L.orqaga(holat) : nom === "nusxa" ? L.nusxa(holat) : nom === "kes" ? L.kes(holat)
        : nom === "qoy" ? L.qoy(holat) : L.ochir(holat);
      if (!ozgar(y)) chiz();
    }

    function nomTanlandi(nom) {
      if (band() || !nomRejim) return;
      sound.play("tap");
      const rejim = nomRejim;
      nomRejim = null;
      const y = nom == null ? holat : rejim === "yangi" ? L.yangiPapka(holat, nom) : L.nomla(holat, nom);
      if (!ozgar(y)) chiz();
    }

    savatBtn.addEventListener("click", () => {
      if (band()) return;
      sound.play("tap");
      savatda = !savatda;
      savatTanlangan = null;
      ochiqYop();
      chiz();
      xabar();
    });

    // --- Tezkor tugmalar: Ctrl+C / Ctrl+X / Ctrl+V / Delete — asboblar tugmalari bilan bir xil ---
    // e.code — klaviatura tili (kirill) qanday bo'lmasin, o'sha tugma. Mac'da Ctrl o'rnida Cmd ham qabul qilinadi.
    function klaviatura(e) {
      if (band() || savatda || nomRejim || e.repeat || e.altKey || e.shiftKey) return;
      const harf = /^Key[A-Z]$/.test(e.code || "") ? e.code.slice(3).toLowerCase() : String(e.key || "").toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      const nom = mod && harf === "c" ? "nusxa" : mod && harf === "x" ? "kes" : mod && harf === "v" ? "qoy"
        : e.key === "Delete" || (e.metaKey && e.key === "Backspace") ? "ochir" : null;
      if (!nom || !korinadigan.includes(nom)) return;
      e.preventDefault();
      if (!yoniq(nom)) return;
      sound.play("tap");
      amal(nom);
    }
    const klaviaturaniOl = () => root.document.removeEventListener("keydown", klaviatura);
    if (tezkor) {
      root.document.addEventListener("keydown", klaviatura);
      ui.onCleanup(klaviaturaniOl); // bosh ekranga qaytilsa ham tinglovchi qolib ketmaydi
    }

    const api = {
      el,
      holat: () => holat,
      // Holatni tashqaridan qo'yish (yechimni ko'rsatish, avtomat o'ynovchi)
      ornat(y) {
        holat = y;
        savatda = false;
        savatTanlangan = null;
        nomRejim = null;
        ochiqYop();
        chiz();
      },
      asboblar(list) {
        korinadigan = list.slice();
        chiz();
      },
      tingla(fn) { tinglovchi = fn; },
      ochilgan: () => ochilgan,
      savatda: () => savatda,
      muzlat(on) {
        muz = !!on;
        chiz();
      },
      // Yechim: narsa turgan papkani ochib, uni belgilab ko'rsatadi
      korsat(id) {
        const o2 = L.otasi(holat, id);
        if (!o2) return;
        yechimId = id;
        api.ornat(L.tanla(L.kir(holat, o2.id), null));
      },
      toxtat() {
        toxtagan = true;
        klaviaturaniOl();
        el.classList.add("fp-toxtagan");
        chiz();
      },
    };
    joriyOyna = api;
    chiz();
    return api;
  }

  // Ko'rsatish qadami: bola o'zi qiladi. qadam(holat, oyna) → pufak matni (hali bajarilmadi) yoki null (bajarildi).
  // Matn holatga qarab o'zgaradi — bola boshqa narsani bosib qo'ysa ham, keyingi qadam doim to'g'ri aytiladi.
  function yolla(oyna, qadam) {
    return ui.settle((done) => {
      let oxirgi = null;
      const tekshir = () => {
        const matn = qadam(oyna.holat(), oyna);
        if (matn == null) {
          oyna.tingla(null);
          oyna.muzlat(true);
          done();
          return;
        }
        if (matn !== oxirgi) {
          oxirgi = matn;
          ui.bubble("elder", matn);
        }
      };
      ui.clearControl();
      oyna.muzlat(false);
      oyna.tingla(tekshir);
      tekshir();
    });
  }

  // ---------- Mashq ekranlari ----------
  // Fayl kartasi: belgi (yoki bo'sh varaq) va nom
  const faylKarta = (task) => h("div", { class: "fp-karta" },
    h("div", { class: "fp-karta-rasm", html: task.belgi ? turBelgi(task.faylTuri) : QK.gameArt.varaq() }),
    nomEl(task.fayl, "fp-karta-nom"));

  // Maslahat jadvali: har tur belgisi va nom oxiri (so'zsiz — javobni aytmaydi, asbobni beradi)
  const turJadval = () => h("div", { class: "fp-jadval" },
    ...L.TURLAR.map((tur) => h("div", { class: "fp-jadval-katak", html: turBelgi(tur) }, h("span", { text: L.KENGAYTMA[tur] }))));

  // Yechim ro'yxati: papka (yoki savat) va ichidagi fayllar
  const yechimRoyxat = (task) => h("div", { class: "fp-yechim-royxat" },
    ...L.yechimXulosa(task).map((q) => h("div", { class: "fp-qator" },
      h("span", { class: "fp-qator-nom", html: belgi(q.belgi) }, h("span", { text: q.nom + ":" })),
      ...(q.ichi.length ? q.ichi.map((f) => h("span", { class: "fp-fayl", html: turBelgi(f.tur) }, nomEl(f.nom)))
        : [h("span", { class: "fp-fayl bosh", text: "boʻsh" })]))));

  const javoblar = (task, submit, cls) => h("div", { class: "fp-javoblar " + cls },
    ...task.variantlar.map((v) => ui.button(v, () => submit(v), "wide")));

  // 1-bosqich: faylni top va och. Papkalarda yurish erkin; boshqa FAYL ochilsa — urinish sanaladi
  function topExercise(task) {
    let ust = null;
    let oyna = null;
    return practice.tries({
      setup(submit) {
        const host = box(true);
        ui.bubble("elder", task.matn);
        ust = ustJoy();
        host.append(ust);
        oyna = fayllar(host, { holat: task.holat, asboblar: ["orqaga"], onOch: (t) => submit(t.id) });
      },
      check: (id) => id === task.javob,
      // Maslahat javobni aytmaydi — usulni eslatadi
      hint(id) {
        const t = L.top(task.holat, id);
        ust.replaceChildren(note((t ? `↻ Bu «${t.nom}» edi. ` : "↻ ") + task.ishora));
      },
      solution() {
        oyna.korsat(task.javob);
        ust.replaceChildren(answer(task.nega));
      },
    }).then((ok) => {
      oyna.toxtat();
      return ok;
    });
  }

  // 1-bosqich: bu fayl nima? — 4 variant
  function turExercise(task) {
    let ust = null;
    return practice.tries({
      setup(submit) {
        const host = box(true);
        ui.bubble("elder", task.matn);
        ust = ustJoy();
        host.append(ust, faylKarta(task));
        ui.control().append(javoblar(task, submit, "ikki"));
      },
      check: (v) => v === task.javob,
      hint() { ust.replaceChildren(note("↻ " + task.ishora), turJadval()); },
      solution() { ust.replaceChildren(answer(task.javob), note(task.nega)); },
    });
  }

  // 1-bosqich (qiyin): fayl yo'lini 4 variantdan tanlash; oynada yurish erkin
  function yolExercise(task) {
    let ust = null;
    let oyna = null;
    return practice.tries({
      setup(submit) {
        const host = box(true);
        ui.bubble("elder", task.matn);
        ust = ustJoy();
        host.append(ust);
        oyna = fayllar(host, { holat: task.holat, asboblar: ["orqaga"] });
        ui.control().append(javoblar(task, submit, "yol"));
      },
      check: (v) => v === task.javob,
      hint() { ust.replaceChildren(note("↻ " + task.ishora)); },
      solution() {
        oyna.korsat(task.faylId);
        ust.replaceChildren(answer(task.javob), note(task.nega));
      },
    }).then((ok) => {
      oyna.toxtat();
      return ok;
    });
  }

  // 2- va 3-bosqich: bola oynada o'zi ishlaydi va «Tekshir»ni bosadi — oxirgi holat tekshiriladi.
  // 1-xatodan keyin holat saqlanadi (bola davom ettiradi); maslahat nechta narsa joyida emasligini aytadi.
  function holatExercise(task) {
    let ust = null;
    let oyna = null;
    return practice.tries({
      setup(submit) {
        const host = box(true);
        ui.bubble("elder", task.matn);
        ust = ustJoy();
        host.append(ust);
        oyna = fayllar(host, { holat: task.holat, asboblar: task.asboblar, savat: task.savat, tezkor: task.tezkor });
        ui.control().append(ui.button("Tekshir", () => submit(oyna.holat()), "big"));
      },
      check: (holat) => L.maqsad(holat, task).ok,
      hint(holat) { ust.replaceChildren(note("↻ " + L.maslahat(task, L.maqsad(holat, task)))); },
      // Yechim: to'g'ri yakuniy holat — ro'yxatda ham, oynaning o'zida ham
      solution() {
        oyna.ornat(L.bajar(task.holat, task.yechim));
        ust.replaceChildren(yechimRoyxat(task));
      },
    }).then((ok) => {
      oyna.toxtat();
      return ok;
    });
  }

  const EKRAN = {
    top: topExercise, tur: turExercise, yol: yolExercise,
    tartibla: holatExercise, nusxa: holatExercise, ochir: holatExercise, tikla: holatExercise,
  };
  const run = (task) => EKRAN[task.tur](task);

  // Mashq tugagach aytiladigan maqtov
  function praise(task) {
    if (task.tur === "top") return `«${task.fayl}» topildi va ochildi.`;
    if (task.tur === "tur") return task.nega;
    if (task.tur === "yol") return "Yoʻl fayl qayerda turganini aytadi.";
    if (task.tur === "tartibla") return "Har fayl oʻz papkasida.";
    if (task.tur === "nusxa") return "Fayl ikkita boʻldi: asli joyida, nusxasi «Zaxira»da.";
    if (task.tur === "ochir") return "Keraksiz fayllar savatga tushdi.";
    return "Fayl savatdan oʻz joyiga qaytdi.";
  }

  QK.common = { box, note, answer, nomEl, fayllar, yolla, run, praise, oyna: () => joriyOyna, IKKI_MS };
})(window);
