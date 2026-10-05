// 67-o'yin: shu o'yinga xos ekran qismlari — maydon, terish, sandiqlar (o'z ikki marta bosishi va o'ng tugma menyusi),
// sudrash (Pointer Events), qurilma tekshiruvi va mashq ekranlari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, practice, sound } = QK;
  const art = QK.gameArt;
  const h = ui.h;

  const foiz = (v) => (v * 100).toFixed(2) + "%";
  const hozir = () => (root.performance && root.performance.now ? root.performance.now() : Date.now());

  // practice.tries javobdan keyin 400 ms band bo'ladi. Maydon noto'g'ri harakatdan keyin undan sal uzoqroq (450 ms)
  // hech narsa qabul qilmaydi — aks holda shu oraliqdagi to'g'ri harakat ekranda bajarilib, hisobga kirmay qolardi.
  const QULF_MS = 450;
  function qulfYasa() {
    let band = false;
    return {
      band: () => band,
      qoy() {
        band = true;
        setTimeout(() => { band = false; }, QULF_MS);
      },
    };
  }

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

  // Vazifa matni; qoshimcha — yonidagi kichik rasm (sandiq belgisi)
  const savol = (text, qoshimcha) => h("div", { class: "cs-savol" }, h("span", { text }), qoshimcha);
  const answer = (text) => h("div", { class: "answer", text });
  // Pufak uchun: matn va yonida kichik rasm (maslahat javobni aytmaydi — asbobni ko'rsatadi)
  const rasmliGap = (text, svg) => h("div", { class: "bubble-line" },
    h("span", { text }), h("span", { class: "cs-namuna", "aria-hidden": "true", html: svg }));

  // ---------- Qurilma tekshiruvi ----------
  // Bu o'yin sichqoncha uchun: barmoqli qurilmada bola ogohlantiriladi (ui.keyboardCheck namunasida).
  // Sahifa ochilgandan beri bir marta so'raladi — kirishda ham, ?bosqich=2 bilan to'g'ridan-to'g'ri kirilganda ham.
  let tekshirildi = false;
  async function qurilma() {
    if (tekshirildi || !ui.touchOnly()) return true;
    const el = box(false);
    el.append(h("div", { class: "story-art sichqon", html: art.sichqoncha("") }));
    ui.bubble("elder", "Bu oʻyin sichqoncha uchun. Uni kompyuterda och.");
    const tanlov = await ui.choice([
      { label: "Sichqoncham bor", value: "go" },
      { label: "Barcha oʻyinlar", value: "back", secondary: true },
    ]);
    if (tanlov === "back") {
      root.location.href = "../../index.html";
      await new Promise(() => {});
    }
    tekshirildi = true;
    return true;
  }

  // ---------- Maydon ----------
  // Nisbiy o'lchamli quti (4:3); ichidagi hamma narsa foizli koordinatada. yordam — chap tepa burchakdagi
  // sichqoncha rasmi ("chap" | "ong" | ""), faqat "ko'rsatish" qismlarida.
  function maydon(yordam) {
    const el = h("div", { class: "maydon" });
    // Maydon ichida brauzer menyusi chiqmaydi: o'ng tugma — o'yinning o'z menyusi uchun
    el.addEventListener("contextmenu", (e) => e.preventDefault());
    if (yordam != null) el.append(h("div", { class: "cs-yordam", "aria-hidden": "true", html: art.sichqoncha(yordam) }));
    return el;
  }

  function yordamQoy(el, tugma) {
    const y = el.querySelector(".cs-yordam");
    if (y) y.innerHTML = art.sichqoncha(tugma);
  }

  // Doira: markazi (x, y), radiusi r (r — en ulushi, shuning uchun bo'yi NISBAT ga ko'paytiriladi)
  function qoy(el, o) {
    el.style.left = foiz(o.x - o.r);
    el.style.top = foiz(o.y - o.r * L.NISBAT);
    el.style.width = foiz(o.r * 2);
    el.style.height = foiz(o.r * 2 * L.NISBAT);
  }

  // To'rtburchak (savat): markazi (x, y), eni w, bo'yi h
  function qoyTortburchak(el, s) {
    el.style.left = foiz(s.x - s.w / 2);
    el.style.top = foiz(s.y - s.h / 2);
    el.style.width = foiz(s.w);
    el.style.height = foiz(s.h);
  }

  // "Yana urin" belgisi: narsa silkinadi, atrofida to'q sariq halqa va ↻ (0,7 soniya)
  function silkit(el) {
    el.classList.remove("yana");
    void el.offsetWidth; // animatsiyani qaytadan boshlash
    el.classList.add("yana");
    setTimeout(() => el.classList.remove("yana"), 700);
  }

  // ---------- 1-bosqich maydoni: terish ----------
  // Nishon bosilsa — yo'qoladi va hodisa.terildi(narsa, qoldi); chalg'ituvchi bosilsa — hodisa.chalgituvchi(narsa).
  // Bo'sh joyga bosish — hech narsa (tinglovchi faqat narsalarda).
  function terMaydoni(task, hodisa, yordam) {
    const el = maydon(yordam);
    const qulf = qulfYasa();
    const tugmalar = {};
    let yopiq = false;
    let qoldi = task.javob.length;

    for (const n of task.narsalar) {
      const b = h("button", {
        class: "cs-narsa", type: "button", "data-id": n.id, "data-tur": n.tur,
        "aria-label": L.TUR[n.tur].nom, html: art.narsa(n.tur),
      });
      qoy(b, n);
      b.addEventListener("click", () => {
        if (yopiq || qulf.band() || b.disabled) return;
        if (!n.nishon) {
          silkit(b);
          hodisa.chalgituvchi(n);
          return;
        }
        sound.play("tap");
        b.disabled = true;
        b.classList.add("terildi");
        qoldi--;
        hodisa.terildi(n, qoldi);
      });
      tugmalar[n.id] = b;
      el.append(b);
    }

    return {
      el,
      yop() { yopiq = true; },
      qulfla: qulf.qoy,
      // Yechim: hali terilmagan nishonlar yoritiladi
      yorit() {
        for (const id of task.javob) if (!tugmalar[id].disabled) tugmalar[id].classList.add("yorit");
      },
    };
  }

  // ---------- 2-bosqich maydoni: sandiqlar ----------
  // Bitta bosish — sandiq tanlanadi (jarima yo'q). Shu sandiqqa 450 ms ichida ikkinchi bosish — hodisa.amal(id, "och");
  // brauzerning dblclick iga tayanilmaydi. O'ng tugma (contextmenu) — sandiq yonida o'z menyumiz;
  // menyudan tanlash — hodisa.amal(id, amal). Qo'shimcha: hodisa.menyu(id) — menyu ochildi,
  // hodisa.sekin(id) — ikki marta bosmoqchi bo'ldi, lekin sekin.
  // opts: { yordam, menyusiz } — menyusiz bo'lsa o'ng tugma hech narsa qilmaydi (menyuRuxsat(true) gacha).
  function sandiqMaydoni(task, hodisa, opts) {
    const o = opts || {};
    const el = maydon(o.yordam);
    const qulf = qulfYasa();
    const tugmalar = {};
    const holatlar = {};
    let yopiq = false;
    let menyusiz = !!o.menyusiz;
    let oldingi = null; // oxirgi bosish: { id, vaqt }
    let menyu = null;

    const sandiq = (id) => task.sandiqlar.find((s) => s.id === id);
    const chiz = (id) => { tugmalar[id].innerHTML = art.sandiq(sandiq(id).rang, holatlar[id] || ""); };
    const tanla = (id) => {
      for (const k of Object.keys(tugmalar)) tugmalar[k].classList.toggle("tanlangan", k === id);
    };

    function menyuYop() {
      if (!menyu) return;
      menyu.remove();
      menyu = null;
    }

    function menyuOch(id) {
      menyuYop();
      const s = sandiq(id);
      menyu = h("div", { class: "cs-menyu", role: "menu", "data-sandiq": id },
        ...task.amallar.map((a) => h("button", {
          class: "cs-amal", type: "button", role: "menuitem", "data-amal": a, text: L.amalById(a).nom,
          onClick: () => {
            if (yopiq || qulf.band()) return;
            menyuYop();
            sound.play("tap");
            hodisa.amal(id, a);
          },
        })));
      el.append(menyu);
      // Menyu sandiq yonida va maydon ichida turadi; joyi foizda — oyna o'lchami o'zgarsa ham siljimaydi
      const W = el.clientWidth;
      const H = el.clientHeight;
      if (W && H) {
        const joy = L.menyuJoyi({ x: s.x * W, y: s.y * H, r: s.r * W }, { w: W, h: H }, { w: menyu.offsetWidth, h: menyu.offsetHeight });
        menyu.style.left = foiz(joy.left / W);
        menyu.style.top = foiz(joy.top / H);
      }
      if (hodisa.menyu) hodisa.menyu(id);
    }

    for (const s of task.sandiqlar) {
      const b = h("button", {
        class: "cs-sandiq", type: "button", "data-id": s.id, "data-rang": s.rang,
        "aria-label": L.rangById(s.rang).nom + " sandiq",
      });
      qoy(b, s);
      b.addEventListener("click", (e) => {
        // Faqat chap tugma; Mac'da Ctrl + bosish — o'ng tugma o'rnida, u contextmenu orqali keladi
        if (yopiq || qulf.band() || e.button !== 0 || e.ctrlKey) return;
        const vaqt = hozir();
        if (L.ikkiBosish(oldingi, s.id, vaqt)) {
          oldingi = null; // uchinchi bosish yangi juftlikni boshlaydi
          hodisa.amal(s.id, L.OCH);
          return;
        }
        if (hodisa.sekin && L.sekinBosish(oldingi, s.id, vaqt)) hodisa.sekin(s.id);
        oldingi = { id: s.id, vaqt };
        sound.play("tap");
        tanla(s.id);
      });
      tugmalar[s.id] = b;
      el.append(b);
      chiz(s.id);
    }

    el.addEventListener("contextmenu", (e) => {
      if (yopiq || qulf.band() || menyusiz) return;
      const b = e.target && e.target.closest ? e.target.closest(".cs-sandiq") : null;
      if (!b) {
        menyuYop();
        return;
      }
      oldingi = null;
      tanla(b.dataset.id);
      menyuOch(b.dataset.id);
    });

    // Menyudan boshqa joy bosilsa yoki Esc — menyu yopiladi. Tinglovchilar hujjatda, shuning uchun
    // vazifa tugaganda (yop) va sahna tark etilganda (ui.onCleanup) olib tashlanadi.
    const tashqi = (e) => { if (menyu && !menyu.contains(e.target)) menyuYop(); };
    const esc = (e) => { if (e.key === "Escape") menyuYop(); };
    document.addEventListener("pointerdown", tashqi, true);
    document.addEventListener("keydown", esc);
    let tozalandi = false;
    function tozala() {
      if (tozalandi) return;
      tozalandi = true;
      document.removeEventListener("pointerdown", tashqi, true);
      document.removeEventListener("keydown", esc);
      menyuYop();
    }
    ui.onCleanup(tozala);

    return {
      el,
      tanla,
      menyuYop,
      // Sandiq ko'rinishi: "ochiq" yoki menyudagi ish nomi (boya, qulfla, tozala, bezat)
      holat(id, nom) {
        holatlar[id] = nom;
        chiz(id);
      },
      silkit(id) { silkit(tugmalar[id]); },
      yorit(id) { tugmalar[id].classList.add("yorit"); },
      menyuRuxsat(on) {
        menyusiz = !on;
        if (!on) menyuYop();
      },
      qulfla: qulf.qoy,
      yop() {
        yopiq = true;
        tozala();
      },
    };
  }

  // ---------- 3-bosqich maydoni: sudrash ----------
  // Pointer Events: pointerdown → setPointerCapture → pointermove → pointerup / pointercancel.
  // Narsa ko'rsatkich bilan birga yuradi. To'g'ri savat ustida qo'yib yuborilsa — joylashadi va
  // hodisa.joylandi(narsa, qoldi); noto'g'ri savat — narsa qaytadi va hodisa.notogri(narsa, savatId);
  // savatdan tashqarida — jarimasiz qaytadi (hodisa.tashqari — ixtiyoriy).
  function sudraMaydoni(task, hodisa, yordam) {
    const el = maydon(yordam);
    const qulf = qulfYasa();
    const savatEl = {};
    const narsaEl = {};
    const joyda = {}; // narsa id → savatga tushganmi
    const soni = {}; // savat id → hozircha nechta narsa tushdi
    const sigim = {}; // savat id → jami nechta narsa tushadi
    let yopiq = false;
    let qoldi = task.narsalar.length;

    for (const s of task.savatlar) {
      const d = h("div", {
        class: "cs-savat", "data-id": s.id, "data-tur": s.tur, role: "img",
        "aria-label": L.TUR[s.tur].nom + " savati", html: art.savat(s.tur),
      });
      qoyTortburchak(d, s);
      savatEl[s.id] = d;
      soni[s.id] = 0;
      sigim[s.id] = task.narsalar.filter((n) => task.javob[n.id] === s.id).length;
      el.append(d);
    }

    // Sudrash paytida narsa qaysi savat ustida tursa, o'sha savat belgilanadi (to'g'ri-noto'g'riligini aytmaydi)
    const ustida = (id) => {
      for (const k of Object.keys(savatEl)) savatEl[k].classList.toggle("ustida", k === id);
    };

    // Ko'rsatkichning maydondagi o'rni (ulushda); hoshiya qalinligi (clientLeft/Top) ayiriladi
    const nuqta = (e) => {
      const b = el.getBoundingClientRect();
      return {
        x: (e.clientX - b.left - el.clientLeft) / (el.clientWidth || 1),
        y: (e.clientY - b.top - el.clientTop) / (el.clientHeight || 1),
      };
    };

    // Narsani o'z savatidagi navbatdagi joyga qo'yadi (kichrayadi, savat chetining ortida turadi)
    function savatga(n) {
      const s = task.savatlar.find((x) => x.id === task.javob[n.id]);
      const joy = L.savatdagiJoy(s, soni[s.id], sigim[s.id]);
      soni[s.id]++;
      joyda[n.id] = true;
      qoldi--;
      narsaEl[n.id].classList.add("joylandi");
      qoy(narsaEl[n.id], { x: joy.x, y: joy.y, r: n.r * L.KICHRAYISH });
    }

    for (const n of task.narsalar) {
      const d = h("div", {
        class: "cs-narsa sudra", "data-id": n.id, "data-tur": n.tur, role: "img",
        "aria-label": L.TUR[n.tur].nom, html: art.narsa(n.tur),
      });
      qoy(d, n);
      let ushlash = null; // { pid, dx, dy } — qaysi ko'rsatkich ushlab turibdi va narsa markazidan qancha chetda
      let joy = { x: n.x, y: n.y };
      const uyga = () => {
        joy = { x: n.x, y: n.y };
        qoy(d, n);
      };

      d.addEventListener("pointerdown", (e) => {
        if (yopiq || qulf.band() || joyda[n.id] || ushlash || e.button !== 0) return;
        e.preventDefault();
        const p = nuqta(e);
        ushlash = { pid: e.pointerId, dx: joy.x - p.x, dy: joy.y - p.y };
        try {
          d.setPointerCapture(e.pointerId);
        } catch (err) {
          // ushlab bo'lmasa ham narsa ko'rsatkich ostida — hodisalar unga keladi
        }
        d.classList.add("sudralmoqda");
        sound.play("tap");
      });

      d.addEventListener("pointermove", (e) => {
        if (!ushlash || e.pointerId !== ushlash.pid) return;
        const p = nuqta(e);
        joy = L.maydonIchida({ x: p.x + ushlash.dx, y: p.y + ushlash.dy }, n.r);
        qoy(d, { x: joy.x, y: joy.y, r: n.r });
        ustida(L.savatUstida(joy, task.savatlar, L.SAVAT_CHET));
      });

      // bekor — pointercancel yoki ushlash yo'qoldi: narsa jarimasiz joyiga qaytadi
      const qoyibYubor = (e, bekor) => {
        if (!ushlash || e.pointerId !== ushlash.pid) return;
        ushlash = null;
        d.classList.remove("sudralmoqda");
        ustida(null);
        const sid = bekor || yopiq ? null : L.savatUstida(joy, task.savatlar, L.SAVAT_CHET);
        if (!sid) {
          uyga();
          if (!bekor && !yopiq && hodisa.tashqari) hodisa.tashqari(n);
          return;
        }
        if (sid === task.javob[n.id]) {
          sound.play("tap");
          savatga(n);
          hodisa.joylandi(n, qoldi);
          return;
        }
        uyga();
        silkit(d);
        hodisa.notogri(n, sid);
      };
      d.addEventListener("pointerup", (e) => qoyibYubor(e, false));
      d.addEventListener("pointercancel", (e) => qoyibYubor(e, true));
      d.addEventListener("lostpointercapture", (e) => qoyibYubor(e, true));

      narsaEl[n.id] = d;
      el.append(d);
    }

    return {
      el,
      yop() { yopiq = true; },
      qulfla: qulf.qoy,
      // Yechim: qolgan narsalar o'z savatiga o'zi boradi va yoritiladi
      yechim() {
        for (const n of task.narsalar) {
          if (joyda[n.id]) continue;
          savatga(n);
          narsaEl[n.id].classList.add("yorit");
        }
      },
    };
  }

  // ---------- Mashq ekranlari ----------
  // Uchalasida ham practice.tries: 1-xato — maslahat (maydon o'z holida qoladi, bola davom etadi),
  // 2-xato — yechim maydonda ko'rsatiladi.

  // "Hamma olmalarni bos": hammasi terilsa — to'g'ri, chalg'ituvchi bosilsa — xato
  function terExercise(task) {
    let m = null;
    return practice.tries({
      setup(submit) {
        const host = box(true);
        host.append(savol(task.matn));
        m = terMaydoni(task, {
          terildi(n, qoldi) {
            if (qoldi > 0) return;
            m.yop();
            submit(true);
          },
          chalgituvchi() {
            submit(false);
            m.qulfla();
          },
        });
        host.append(m.el);
      },
      check: (v) => v === true,
      // Maslahat qaysi narsani bosishni aytmaydi — nishon qanday ko'rinishini eslatadi
      hint() {
        ui.bubble("elder", rasmliGap(`↻ Bu boshqa narsa. ${L.TUR[task.nishon].nom} mana bunday:`, art.narsa(task.nishon)));
      },
      solution() {
        m.yop();
        m.yorit();
      },
    });
  }

  // Sandiq maslahati: nima noto'g'ri bo'lganiga qarab — kerakli tugma belgilangan sichqoncha yoki eslatma
  function sandiqMaslahat(task, v) {
    const xato = L.xatoTuri(task, v);
    if (xato === "tugma") {
      return task.tur === "ikki"
        ? rasmliGap("↻ Menyu kerak emas. Chap tugmani ikki marta tez bos.", art.sichqoncha("chap"))
        : rasmliGap("↻ Bu safar ochma. Oʻng tugmani bos.", art.sichqoncha("ong"));
    }
    if (xato === "sandiq") return "↻ Bu boshqa sandiq. Rangiga va belgisiga qara.";
    return "↻ Menyudan boshqa ish kerak. Vazifani yana oʻqi.";
  }

  // "Koʻk sandiqni och" yoki "Yashil sandiqda oʻng tugmani bos va «Boʻya»ni tanla"
  function sandiqExercise(task) {
    let m = null;
    let host = null;
    const rang = L.rangById(task.rang).nom;
    const natija = task.amal === L.OCH ? "ochiq" : task.amal;
    return practice.tries({
      setup(submit) {
        host = box(true);
        host.append(savol(task.matn, h("span", { class: "cs-belgi", "aria-hidden": "true", html: art.belgi(task.rang) })));
        m = sandiqMaydoni(task, {
          amal(id, amal) {
            const v = { id, amal };
            if (L.togriAmal(task, v)) {
              m.yop();
              m.holat(id, natija);
              submit(v);
              return;
            }
            m.silkit(id);
            submit(v);
            m.qulfla();
          },
          // Jarima emas — faqat eslatma: bola shu sandiqni chap tugma bilan ikki marta, lekin sekin bosdi
          sekin() {
            ui.bubble("elder", task.tur === "ikki" ? "↻ Tezroq bos: tiq-tiq!" : "↻ Bu chap tugma. Oʻng tugmani bos.");
          },
        });
        host.append(m.el);
      },
      check: (v) => L.togriAmal(task, v),
      hint(v) { ui.bubble("elder", sandiqMaslahat(task, v)); },
      solution() {
        m.yop();
        m.holat(task.nishon, natija);
        m.yorit(task.nishon);
        host.append(answer(task.tur === "ikki"
          ? `${rang} sandiq — ikki marta tez bosiladi.`
          : `${rang} sandiq → oʻng tugma → «${L.amalById(task.amal).nom}».`));
      },
    });
  }

  // "Har mevani oʻz savatiga olib bor": hammasi joylansa — to'g'ri, noto'g'ri savat — xato
  function sudraExercise(task) {
    let m = null;
    return practice.tries({
      setup(submit) {
        const host = box(true);
        host.append(savol(task.matn));
        m = sudraMaydoni(task, {
          joylandi(n, qoldi) {
            if (qoldi > 0) return;
            m.yop();
            submit(true);
          },
          notogri() {
            submit(false);
            m.qulfla();
          },
        });
        host.append(m.el);
      },
      check: (v) => v === true,
      hint() { ui.bubble("elder", "↻ Bu boshqa savat. Savatdagi rasmga qara."); },
      solution() {
        m.yop();
        m.yechim();
      },
    });
  }

  const EKRAN = { ter: terExercise, ikki: sandiqExercise, ong: sandiqExercise, sudra: sudraExercise };
  const run = (task) => EKRAN[task.tur](task);

  // Mashq tugagach aytiladigan maqtov ("✓ Barakalla!" dan keyin)
  function praise(task) {
    if (task.tur === "ter") return `Hamma ${L.TUR[task.nishon].kop} terding.`;
    if (task.tur === "ikki") return `${L.rangById(task.rang).nom} sandiq ochildi.`;
    if (task.tur === "ong") return `${L.rangById(task.rang).nom} sandiq ${L.amalById(task.amal).boldi}.`;
    return "Hamma meva oʻz savatida.";
  }

  QK.common = { box, savol, answer, rasmliGap, qurilma, yordamQoy, terMaydoni, sandiqMaydoni, sudraMaydoni, run, praise };
})(window);
