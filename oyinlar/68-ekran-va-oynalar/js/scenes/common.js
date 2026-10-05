// 68-o'yin: shu o'yinga xos ekran qismlari — o'yinchoq kompyuter (ish stoli, belgilar, oynalar, panel, «Pusk»)
// va mashq ekranlari. Ko'rinishi: umumiy/css/stol.css + css/style.css; belgilar: umumiy/js/stol-art.js.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, practice, sound } = QK;
  const h = ui.h;

  // 1-xatodan keyin bola o'z amalining natijasini shuncha ko'radi, so'ng stol vazifa boshidagi holatga qaytadi.
  // practice.tries dagi 400 ms lik "busy" oynasidan uzun — qulf ochilganda yangi javob qabul qilinadi.
  const QAYTISH_MS = 900;

  // ---------- Mashq qutisi ----------
  function box(compact) {
    ui.setCompact(compact !== false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    const el = h("div", { class: "eo-quti" });
    ui.work().append(el);
    return el;
  }

  const savol = (text) => h("div", { class: "eo-savol", text });
  const note = (text) => h("div", { class: "note", text });
  const answer = (text) => h("div", { class: "answer", text });

  // ---------- Oyna tugmalari ----------
  // Windows tartibida: — □ ✕
  const TUGMALAR = [
    { amal: "kichraytir", belgi: "—", nom: "Kichraytirish", ish: "kichraytiradi" },
    { amal: "kattalashtir", belgi: "□", nom: "Yoyish", ish: "yoyadi" },
    { amal: "yop", belgi: "✕", nom: "Yopish", ish: "yopadi" },
  ];

  // Matn ichidagi tugma belgisi: «—» chiziqcha bilan adashmasligi uchun tugmacha ko'rinishida
  const tb = (belgi) => h("b", { class: "eo-tb", text: belgi });
  // Pufak uchun matn + tugma belgilari: gap("Endi ", tb("□"), " tugmasini bos.")
  const gap = (...qismlar) => h("span", null, ...qismlar);

  // Sxema: — kichraytiradi · □ yoyadi · ✕ yopadi
  const sxema = () => h("div", { class: "eo-sxema" },
    ...TUGMALAR.map((t) => h("span", { class: "eo-sx" }, tb(t.belgi), h("span", { text: t.ish }))));

  // ---------- O'yinchoq kompyuter ----------
  // opts: belgilar — ish stolidagi belgilar (dastur id lari); holat — boshlang'ich oynalar;
  //       amal(amal, oldingiHolat) — bola holatni o'zgartirganda (amal allaqachon bajarilgan);
  //       sorov(amal, holat) — false qaytarsa, amal bajarilmaydi (ko'rsatish qadamlari uchun);
  //       sekin(dastur) — belgi ikki marta bosildi, lekin sekin (jarimasiz eslatma uchun).
  // Hamma tinglovchi shu elementning o'zida — ui.clearWork() elementni olib tashlasa, ular ham ketadi.
  function stol(opts) {
    const o = opts || {};
    let holat = o.holat || L.bosh();
    let tinglovchi = { amal: o.amal, sorov: o.sorov, sekin: o.sekin };
    let qulflangan = false;
    let menyuOchiq = false;
    let tanlangan = null; // tanlangan belgi (bitta bosish)
    let oxirgiBosish = null; // ikki marta bosishni o'zimiz aniqlaymiz: { nishon, vaqt }
    let tinchgacha = 0; // amaldan keyin shu vaqtgacha bosishlar inobatga olinmaydi (pastdagi izohga qara)
    let nishonlar = []; // yoritilgan joylar
    const oynaEl = new Map(); // dastur → .oyna elementi

    const belgilar = (o.belgilar || []).map((d) => h("button", {
      class: "stol-belgi", type: "button", "data-belgi": d, html: QK.stolArt.icon(d),
    }, h("span", { text: L.nom(d) })));
    const menyu = h("div", { class: "eo-menyu", role: "group", "aria-label": "«Pusk» menyusi", hidden: true },
      ...L.IDLAR.map((d) => h("button", {
        class: "eo-menyu-satr", type: "button", "data-menyu": d, html: QK.stolArt.icon(d),
      }, h("span", { text: L.nom(d) }))));
    const yuza = h("div", { class: "stol-yuza" }, ...belgilar, menyu);
    const pusk = h("button", {
      class: "stol-pusk", type: "button", "data-pusk": "1", "aria-expanded": "false", html: QK.stolArt.icon("pusk"),
    }, h("span", { text: "Pusk" }));
    const panel = h("div", { class: "stol-panel" }, pusk);
    const el = h("div", { class: "stol eo-stol" }, yuza, panel);

    function oynaYasa(d) {
      const sarlavha = h("div", { class: "oyna-sarlavha", html: QK.stolArt.icon(d) },
        h("span", { class: "oyna-nom", text: L.nom(d) }),
        h("span", { class: "oyna-tugmalar" }, ...TUGMALAR.map((t) => h("button", {
          class: "oyna-tugma", type: "button", "data-tugma": t.amal, "aria-label": t.nom, text: t.belgi,
        }))));
      return h("div", { class: "oyna", "data-oyna": d, role: "group", "aria-label": `«${L.nom(d)}» oynasi` },
        sarlavha,
        h("div", { class: "oyna-ichi", "data-dastur": d, html: QK.gameArt.ichi(d) }));
    }

    function nishonEl(n) {
      if (n.nima === "pusk") return pusk;
      if (n.nima === "belgi") return belgilar.find((b) => b.dataset.belgi === n.dastur) || null;
      if (n.nima === "menyu") return menyu.querySelector(`[data-menyu="${n.dastur}"]`);
      if (n.nima === "panel") return panel.querySelector(`[data-panel="${n.dastur}"]`);
      const x = oynaEl.get(n.dastur);
      if (!x) return null;
      return n.nima === "tugma" ? x.querySelector(`[data-tugma="${n.amal}"]`) : x.querySelector(".oyna-sarlavha");
    }

    function yoritQoy() {
      el.querySelectorAll(".eo-nishon").forEach((x) => x.classList.remove("eo-nishon"));
      nishonlar.forEach((n) => {
        const x = nishonEl(n);
        if (x) x.classList.add("eo-nishon");
      });
    }

    // Holatdan ekran: oynalar kaskad bo'lib turadi — ro'yxatdagi o'rni bo'yicha (oxirgisi eng oldinda va eng pastda),
    // shunda orqadagi har oynaning sarlavhasi to'liq ko'rinib turadi. O'lchamlar: css/style.css (--orin, --son).
    function chiz() {
      const f = L.faol(holat);
      const oddiylar = holat.oynalar.filter((w) => w.holat === "oddiy");
      yuza.style.setProperty("--son", String(Math.max(1, oddiylar.length)));
      holat.oynalar.forEach((w, i) => {
        let x = oynaEl.get(w.dastur);
        if (!x) {
          x = oynaYasa(w.dastur);
          oynaEl.set(w.dastur, x);
          yuza.insertBefore(x, menyu);
        }
        x.className = "oyna" + (w === f ? " faol" : "") + (w.holat === "oddiy" ? "" : " " + w.holat);
        x.style.zIndex = String(10 + i);
        x.style.setProperty("--orin", String(Math.max(0, oddiylar.indexOf(w))));
      });
      for (const [d, x] of [...oynaEl]) {
        if (!L.oyna(holat, d)) {
          x.remove();
          oynaEl.delete(d);
        }
      }
      // Panel: «Pusk» + har ochiq oyna uchun tugma. Tartib — ochilgan navbat (id), tugma joyidan qo'zg'almaydi.
      panel.querySelectorAll(".stol-panel-tugma").forEach((b) => b.remove());
      holat.oynalar.slice().sort((a, b) => a.id - b.id).forEach((w) => {
        panel.append(h("button", {
          class: "stol-panel-tugma" + (w === f ? " faol" : "") + (w.holat === "kichik" ? " kichik" : ""),
          type: "button", "data-panel": w.dastur,
          "aria-label": `«${L.nom(w.dastur)}» oynasi` + (w.holat === "kichik" ? " — kichraytirilgan" : ""),
          html: QK.stolArt.icon(w.dastur),
        }, h("span", { class: "eo-pnom", text: L.nom(w.dastur) })));
      });
      panel.classList.toggle("eo-zich", holat.oynalar.length >= 3); // tor ekranda nomlar sig'maydi — faqat belgi
      belgilar.forEach((b) => b.classList.toggle("tanlangan", b.dataset.belgi === tanlangan));
      menyu.hidden = !menyuOchiq;
      pusk.setAttribute("aria-expanded", menyuOchiq ? "true" : "false");
      yoritQoy();
    }

    // Bolaning amali: holatni o'zgartirmasa — betaraf; sorov rad etsa — bajarilmaydi
    function urin(amal) {
      if (!amal) return false;
      const oldin = holat;
      const keyin = L.bajar(holat, amal);
      if (L.bir(oldin, keyin)) return false;
      if (tinglovchi.sorov && tinglovchi.sorov(amal, oldin) === false) return false;
      holat = keyin;
      tanlangan = null;
      tinchla();
      chiz();
      if (tinglovchi.amal) tinglovchi.amal(amal, oldin);
      return true;
    }

    // Bola tugmani odat bo'yicha ikki marta bosib yuborsa, ikkinchi bosish yangi amal bo'lib ketmasin:
    // oyna yopilgach uning o'rniga boshqa oynaning ✕ tugmasi kelib qolishi mumkin. Shuning uchun har amaldan
    // (va «Pusk»ni ochib-yopishdan) keyin ikki marta bosish oralig'i davomida bosishlar inobatga olinmaydi.
    function tinchla() {
      tinchgacha = Date.now() + L.IKKI_MARTA_MS;
    }

    el.addEventListener("click", (e) => {
      if (qulflangan || Date.now() < tinchgacha) return;
      const t = e.target;
      const satr = t.closest("[data-menyu]");
      const puskBosildi = t.closest("[data-pusk]");
      // Menyu ochiq turganda boshqa joyga bosish — faqat menyuni yopadi (betaraf)
      if (menyuOchiq && !satr && !puskBosildi) {
        menyuOchiq = false;
        chiz();
        return;
      }
      if (puskBosildi) {
        sound.play("tap");
        menyuOchiq = !menyuOchiq;
        tinchla();
        chiz();
        return;
      }
      if (satr) {
        menyuOchiq = false;
        chiz();
        urin(L.niyat(holat, "menyu", satr.dataset.menyu));
        return;
      }
      const tugma = t.closest("[data-tugma]");
      if (tugma) {
        urin({ amal: tugma.dataset.tugma, dastur: tugma.closest("[data-oyna]").dataset.oyna });
        return;
      }
      const oyna = t.closest("[data-oyna]");
      if (oyna) {
        urin(L.niyat(holat, "oyna", oyna.dataset.oyna));
        return;
      }
      const panelTugma = t.closest("[data-panel]");
      if (panelTugma) {
        urin(L.niyat(holat, "panel", panelTugma.dataset.panel));
        return;
      }
      const belgi = t.closest("[data-belgi]");
      if (!belgi) { // bo'sh joy: tanlov olinadi
        if (tanlangan) {
          tanlangan = null;
          oxirgiBosish = null;
          chiz();
        }
        return;
      }
      // Belgi: bitta bosish — tanlash; 450 ms ichida ikkinchisi — ochish
      const d = belgi.dataset.belgi;
      const hozir = { nishon: d, vaqt: Date.now() };
      if (L.ikkiMarta(oxirgiBosish, hozir)) {
        oxirgiBosish = null;
        urin(L.niyat(holat, "belgi", d));
        return;
      }
      const sekin = L.sekinBosish(oxirgiBosish, hozir); // shu belgiga ikkinchi bosish, lekin kech
      oxirgiBosish = hozir;
      tanlangan = d;
      sound.play("tap");
      chiz();
      if (sekin && tinglovchi.sekin) tinglovchi.sekin(d);
    });

    chiz();
    const api = {
      el,
      holat: () => holat,
      // Holatni almashtirish (masalan, vazifa boshiga qaytarish): tanlov va menyu ham tozalanadi
      qoy(yangi) {
        holat = yangi;
        tanlangan = null;
        oxirgiBosish = null;
        tinchgacha = 0;
        menyuOchiq = false;
        chiz();
      },
      qulf(on) {
        qulflangan = !!on;
        el.classList.toggle("eo-qulf", qulflangan);
      },
      yorit(list) {
        nishonlar = list || [];
        yoritQoy();
      },
      menyu(on) {
        menyuOchiq = !!on;
        chiz();
      },
      tingla(t) { tinglovchi = t || {}; },
      // Sinov uchun: bolaning amalini kod bilan bajarish — QK.stol.qil({ amal: "yop", dastur: "rasm" })
      qil: (amal) => !qulflangan && urin(amal),
    };
    QK.stol = api; // sinov ilgagi: ekrandagi joriy o'yinchoq kompyuter
    return api;
  }

  // Ikki marta bosish sekin chiqdi — jarimasiz eslatma
  const sekinEslatma = () => ui.bubble("elder", "Juda sekin boʻldi. Ikki marta tez-tez bos.");

  // ---------- Ko'rsatish qadami ----------
  // Bola aynan `kutilgan` amalni qilguncha kutadi. Boshqa amal bajarilmaydi — jarima yo'q, oqsoqol eslatadi.
  // yorit — bosiladigan joy "yonib turadi"; eslat — satr yoki pufak mazmunini yasaydigan funksiya.
  function qildir(st, kutilgan, opts) {
    const o = opts || {};
    st.yorit(o.yorit || []);
    st.qulf(false);
    return ui.settle((done) => {
      st.tingla({
        sorov(amal) {
          if (L.teng(amal, kutilgan)) return true;
          sound.play("retry");
          ui.bubble("elder", typeof o.eslat === "function" ? o.eslat() : o.eslat);
          return false;
        },
        amal() {
          st.tingla(null);
          st.qulf(true);
          st.yorit([]);
          sound.play("correct");
          done();
        },
        sekin: sekinEslatma,
      });
    });
  }

  // ---------- Mashq ekranlari ----------
  // O'yinchoq kompyuterda bajariladigan vazifa. Bolaning birinchi holatni o'zgartiruvchi amali baholanadi
  // (L.baho): to'g'ri / xato / davom. 1-xato — maslahat, stol vazifa boshiga qaytadi; 2-xato — yechim yoritiladi.
  function stolExercise(task) {
    let st = null;
    let joy = null; // savol bilan stol orasidagi joy: sxema (maslahat) yoki izoh (yechim)
    let natija = null;
    return practice.tries({
      setup(submit) {
        const host = box(true);
        joy = h("div", { class: "eo-eslatma" });
        st = stol({
          belgilar: task.belgilar,
          holat: task.boshlangich,
          amal(amal, oldin) {
            natija = L.baho(task, oldin, amal);
            if (natija === "davom") { // ko'p qadamli vazifa yoki tayyorgarlik — hali baholanmaydi
              sound.play("tap");
              if (L.yashirinQoldi(task, st.holat())) ui.bubble("elder", "Kichraytirilgan oyna hali ochiq. Uni paneldan qaytar va yop.");
              return;
            }
            st.qulf(true);
            submit(amal);
          },
          sekin: sekinEslatma,
        });
        host.append(savol(task.matn), joy, st.el);
      },
      check: () => natija === "togri",
      // Maslahat javobni aytmaydi: qayerga qarashni ko'rsatadi
      hint(amal) {
        const i = L.ishora(task, amal);
        ui.bubble("elder", "↻ " + i.matn);
        joy.textContent = "";
        if (i.tur === "tugmalar") joy.append(sxema());
        const shu = st;
        setTimeout(() => {
          if (!shu.el.isConnected) return; // bola bosh ekranga qaytgan
          shu.qoy(task.boshlangich);
          shu.qulf(false);
        }, QAYTISH_MS);
      },
      solution() {
        st.qoy(task.boshlangich);
        if (task.tur === "pusk") st.menyu(true);
        st.yorit(L.nishonlar(task));
        joy.textContent = "";
        joy.append(answer(task.nega));
      },
    });
  }

  // Belgi rasmi → 4 nomdan tanlash
  function nomExercise(task) {
    let joy = null;
    return practice.tries({
      setup(submit) {
        const host = box(true);
        joy = h("div", { class: "eo-eslatma" });
        host.append(savol(task.matn),
          h("div", { class: "eo-belgi-katta", role: "img", "aria-label": "Dastur belgisi", html: QK.stolArt.icon(task.dastur) }),
          joy);
        ui.control().append(h("div", { class: "eo-javoblar" }, ...task.variantlar.map((v) => ui.button(v, () => submit(v)))));
      },
      check: (value) => value === task.javob,
      // Maslahat: nomini aytmaydi — dastur ochilganda ichi qanday bo'lishini ko'rsatadi
      hint() {
        ui.bubble("elder", "↻ " + task.ishora);
        joy.textContent = "";
        joy.append(h("div", { class: "eo-korinish", "data-dastur": task.dastur, html: QK.gameArt.ichi(task.dastur) }));
      },
      solution() {
        joy.textContent = "";
        joy.append(answer(task.javob), note(task.nega));
      },
    });
  }

  const run = (task) => (task.tur === "nom" ? nomExercise(task) : stolExercise(task));

  // Mashq tugagach aytiladigan maqtov
  const praise = (task) => task.maqtov;

  QK.common = { box, savol, note, answer, TUGMALAR, tb, gap, sxema, stol, qildir, stolExercise, nomExercise, run, praise };
})(window);
