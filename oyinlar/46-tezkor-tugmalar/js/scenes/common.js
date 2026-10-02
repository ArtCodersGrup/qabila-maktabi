// 46-o'yin: shu o'yinga xos sahna qismlari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, practice, sound } = QK;
  const h = ui.h;

  // Tugma qopqog'i: [Ctrl] + [C]
  function kombo(amal, klass) {
    const el = h("span", { class: "tt-kombo" + (klass ? " " + klass : "") });
    amal.kombo.forEach((k, i) => {
      if (i) el.append(h("span", { class: "tt-plus", text: "+" }));
      el.append(h("span", { class: "tt-tugma", text: k }));
    });
    return el;
  }

  const karta = (amal) => h("div", { class: "tt-karta" },
    kombo(amal),
    h("div", { class: "tt-nom", text: amal.nom }),
    h("div", { class: "tt-izoh", text: amal.izoh }));

  const kartalar = (list) => h("div", { class: "tt-kartalar" }, ...list.map(karta));

  const box = (compact) => {
    ui.setCompact(compact !== false);
    ui.clearWork();
    ui.clearControl();
    const el = h("div", { class: "pbox" });
    ui.work().append(el);
    return el;
  };
  const note = (text) => h("div", { class: "tt-note", text });
  const answer = (text) => h("div", { class: "tt-answer", text });

  // Klaviaturani tinglash. preventDefault — Ctrl+S saqlash oynasini ochmasin.
  // oqim: har bosilganda chaqiriladi; "to'xtat" funksiyasini qaytaradi.
  function tingla(oqim, { toxtat } = {}) {
    const onKey = (e) => {
      if (["Control", "Meta", "Shift", "Alt"].includes(e.key)) return;
      if (toxtat !== false) e.preventDefault();
      oqim(L.belgi(e), e);
    };
    root.document.addEventListener("keydown", onKey, true);
    return () => root.document.removeEventListener("keydown", onKey, true);
  }

  // 1-bosqich: bu birikma nima qiladi?
  function tanishExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        host.append(h("div", { class: "tt-savol" }, kombo(task.amal, "katta")));
        host.append(note("Bu birikma nima qiladi?"));
        ui.control().append(...task.variantlar.map((v) => ui.button(v.nom, () => submit(v.id), "big")));
      },
      check: (value) => value === task.javob,
      hint() { host.append(note("↻ Harfga qara: " + task.amal.kombo[task.amal.kombo.length - 1] + " — qaysi soʻzning birinchi harfi? (copy, paste, cut, undo, all, save, find)")); },
      solution() {
        host.append(answer(task.amal.nom));
        host.append(note(task.amal.izoh));
      },
    });
  }

  // 2-bosqich: tugmalarni o'zing bos
  function bosishExercise(task) {
    let host = null;
    let ocher = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        host.append(h("div", { class: "tt-savol", text: task.matn }));
        const koringan = h("div", { class: "tt-bosilgan", text: "—" });
        host.append(koringan);
        host.append(note("Tugmalarni klaviaturada bos (bu yerda koʻrinadi)."));
        ocher = tingla((belgi) => {
          koringan.textContent = belgi;
          koringan.classList.add("yondi");
          setTimeout(() => koringan.classList.remove("yondi"), 200);
          submit(belgi);
        });
        ui.onCleanup(ocher);
      },
      check(value) {
        const ok = value === task.javob;
        if (ok && ocher) ocher(); // to'g'ri bosildi — klaviaturani tinglashni to'xtatamiz
        return ok;
      },
      hint() { host.append(note("↻ " + task.amal.izoh + ". Turgich tugmani (Ctrl, Shift) bosib turib, keyin ikkinchisini bos.")); },
      solution() {
        if (ocher) ocher();
        host.append(answer(L.yozuv(task.amal)));
        host.append(kombo(task.amal, "katta"));
      },
    });
  }

  // 2-bosqich: ikki o'xshash birikmaning farqi
  function farqExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        host.append(h("div", { class: "tt-savol", text: task.matn }));
        const joy = h("div", { class: "tt-tanlov" });
        for (const v of task.variantlar) {
          // Nomi yozilmaydi — "Oʻngdagini oʻchirish" kabi nom javobni aytib qoʻyardi; nom yechimda chiqadi
          const btn = h("button", { class: "tt-tanlov-btn", type: "button", "aria-label": v.nom }, kombo(v));
          btn.addEventListener("click", () => {
            for (const b of joy.querySelectorAll("button")) b.disabled = true;
            btn.classList.add("tanlangan");
            submit(v.id);
          });
          joy.append(btn);
        }
        host.append(joy);
      },
      check: (value) => value === task.javob,
      hint() {
        host.append(note("↻ Savoldagi asosiy soʻzga qara (chap/oʻng, belgilash/sakrash, joyida qoladi/oʻchadi) va har variantning vazifasini solishtir."));
        for (const b of host.querySelectorAll(".tt-tanlov-btn")) b.disabled = false;
      },
      solution() {
        const togri = L.amalById(task.javob);
        host.append(answer(L.yozuv(togri) + " — " + togri.nom));
        host.append(note(task.nega));
      },
    });
  }

  // 3-bosqich: haqiqiy matn maydonida ish
  function maqsadExercise(task) {
    let host = null;
    let ocher = null;
    const bosilgan = [];
    return practice.tries({
      setup(submit) {
        host = box(true);
        host.append(h("div", { class: "tt-savol", text: task.vazifa }));
        host.append(h("div", { class: "tt-maqsad" },
          h("span", { class: "tt-maqsad-nom", text: "Natija shunday boʻlsin:" }),
          h("pre", { class: "tt-maqsad-matn", text: task.maqsad })));
        const maydon = h("textarea", { class: "tt-maydon", rows: "3", spellcheck: "false",
          autocapitalize: "off", autocorrect: "off", "aria-label": "Matn maydoni" });
        maydon.value = task.boshlangich;
        host.append(maydon);
        const roy = h("div", { class: "tt-bosilganlar" });
        host.append(roy);
        // Bu yerda preventDefault QILINMAYDI: nusxa olish, qo'yish va bekor qilish
        // brauzerning o'zi bajaradi — biz faqat qaysi tugma bosilganini yozib boramiz
        ocher = tingla((belgi) => {
          if (!L.qaydEtiladi(belgi)) return; // oddiy harf terish — yozilmaydi
          if (bosilgan[bosilgan.length - 1] !== belgi) bosilgan.push(belgi);
          roy.innerHTML = "";
          for (const b of bosilgan.slice(-6)) roy.append(h("span", { class: "tt-bosilgan-chip", text: b }));
        }, { toxtat: false });
        ui.onCleanup(ocher);
        ui.control().append(ui.button("Tayyor", () => submit(maydon.value), "big"));
        setTimeout(() => maydon.focus(), 50);
      },
      check(value) {
        const ok = L.bajarildi(task, value, bosilgan);
        if (ok && ocher) ocher();
        return ok;
      },
      hint(value) {
        const qolgan = L.yetishmaydi(task, bosilgan);
        if (L.tozala(value) !== L.tozala(task.maqsad)) host.append(note("↻ Natija hali boshqacha. " + task.ishora));
        else host.append(note("↻ Natija toʻgʻri, lekin tezkor tugmasiz. Kerak: " + qolgan.map(L.yozuv).join(", ") + ". " + task.ishora));
      },
      solution() {
        if (ocher) ocher();
        host.append(answer("Yoʻli: " + task.ishora));
      },
    });
  }

  QK.common = { box, note, answer, kombo, karta, kartalar, tingla, tanishExercise, bosishExercise, farqExercise, maqsadExercise };
})(window);
