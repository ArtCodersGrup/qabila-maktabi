// 70-o'yin: shu o'yinga xos ekran qismlari — taxtani joylash, 1-bosqich vazifasi (harakat jurnali bo'yicha),
// namuna qadami (soya + avtomatik tekshiruv + «Tayyor»), namuna tanlash kartalari, bahosiz chizish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, practice, sound } = QK;
  const h = ui.h;
  const $play = () => root.document.getElementById("play");

  // ---------- Mashq qutisi ----------
  function box(compact) {
    ui.setCompact(compact !== false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    $play().classList.remove("kr-chizish"); // taxtasiz ekran — qahramonlar qaytadi; taxtaQoy yana qo'yadi
    const el = h("div", { class: "pbox" });
    ui.work().append(el);
    return el;
  }

  const savol = (text) => h("div", { class: "kr-savol", text });
  const answer = (text) => h("div", { class: "answer", text });
  const bosh = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // Taxtani ish zonasiga qo'yish: #play.kr-chizish — tik telefonda qahramonlar yashirinadi (joy taxtaga).
  // Sahna tark etilganda (ui.onCleanup) taxta yopiladi va sinf olinadi.
  function taxtaQoy(host, opts) {
    const t = QK.taxtaYasa(opts);
    host.append(t.el);
    $play().classList.add("kr-chizish");
    ui.onCleanup(() => {
      t.yop();
      $play().classList.remove("kr-chizish");
    });
    return t;
  }
  // Taxta bilan ish tugadi (sahna davom etadi): yopiladi, qahramonlar qaytadi
  function taxtaOl(t) {
    t.yop();
    $play().classList.remove("kr-chizish");
  }

  // Asbob/rang/ichi tavsifi: "toʻrtburchak, koʻk, ichi toʻla"
  function tavsif(hr) {
    const a = L.asbobById(hr.asbob);
    if (!a) return "";
    const qism = [a.nom];
    if (hr.rang) qism.push(L.rangNomi(hr.rang));
    if (hr.asbob !== "chiziq" && hr.asbob !== "qalam" && hr.asbob !== "ochirgich" && hr.asbob !== "chelak") qism.push(hr.toliq ? "ichi toʻla" : "ichi boʻsh");
    return qism.join(", ");
  }

  // ---------- 1-bosqich: asbob vazifasi ----------
  // Taxta har tugallangan harakatni jurnalga yozadi; tekshiruv — L.harakatTekshir (sof). "kutish" — urinish emas.
  function maslahat(task, v, t) {
    const s = v && v.sabab;
    if (s === "asbob") {
      t.yorit("asbob", task.asbob);
      return `↻ Asbob: ${L.asbobNomi(task.asbob)}. Uni asboblar qatoridan tanla.`;
    }
    if (s === "rang") {
      t.yorit("rang", task.rang);
      return `↻ Rang: ${L.rangNomi(task.rang)}. Uni palitradan tanla.`;
    }
    if (s === "toliq") {
      t.yorit("asbob", "toliq");
      return `↻ «Ichi toʻla» tugmasini ${task.toliq ? "yoq" : "oʻchir"}. Keyin yana chiz.`;
    }
    if (s === "olcham") return `↻ Kattaroq chiz: ${task.asbob === "chiziq" ? "uzunligi" : "eni"} kamida ${task.min} katak.`;
    if (s === "joy") return "↻ Chelak bilan shaklning ichini bos. Tashqarisini emas.";
    if (s === "kop") {
      t.yorit("amal", "qaytar");
      return "↻ Koʻp qaytarding. «Qaytar» tugmasini bos.";
    }
    t.yorit("amal", "bekor");
    return task.soni === 2 ? "↻ «Bekor» tugmasini 2 marta bos." : "↻ «Bekor» tugmasini bos.";
  }

  function asbobExercise(task) {
    let t = null;
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        host.append(savol(task.matn));
        t = taxtaQoy(host, {
          harakatlar: task.boshlangich,
          onHarakat(hr, holat) {
            const v = L.harakatTekshir(task, holat.jurnal, holat.taxta);
            if (v.sabab === "kutish") return;
            if (v.ok) t.qulfla(true);
            submit(v);
          },
        });
      },
      check: (v) => !!v.ok,
      hint(v) {
        ui.bubble("elder", maslahat(task, v, t));
      },
      async solution() {
        t.qulfla(true);
        const j = task.javob;
        if (task.amal === "bekor") {
          // Jurnal bo'yicha: taxta kutilgan holatga qaytariladi
          t.ornat(task.kutilganTaxta);
          host.append(answer(j.soni === 2 ? "«Bekor» 2 marta — oxirgi 2 ta shakl yoʻqoldi." : "«Bekor» — oxirgi shakl yoʻqoldi."));
          return;
        }
        if (task.amal === "toldir") {
          t.rangTanla(j.rang);
          t.asbobTanla("chelak");
          host.append(answer(`Chelak, ${L.rangNomi(j.rang)} — shaklning ichi bosiladi.`));
          await t.chiz(j, { animatsiya: true, jim: true });
          return;
        }
        t.asbobTanla(j.asbob);
        t.rangTanla(j.rang);
        if (j.asbob !== "chiziq") t.toliqQoy(!!j.toliq);
        host.append(answer(bosh(tavsif(j)) + "."));
        await t.chiz(j, { animatsiya: true, jim: true });
      },
    });
  }

  function asbobPraise(task) {
    if (task.amal === "toldir") return "Ichi boʻyaldi.";
    if (task.amal === "bekor") return task.soni === 2 ? "Ikkala ish qaytdi." : "Oxirgi ish qaytdi.";
    return `${bosh(L.asbobNomi(task.asbob))} tayyor.`;
  }

  // ---------- 2–3-bosqich: namuna qadami ----------
  // Taxta butun bosqich davomida bitta. Har qadam: soya + ko'rsatma; har chizishdan keyin tekshiruv:
  // mos bo'lsa — to'g'ri; shakl/chelak noto'g'ri tushsa — darhol maslahat; qalam/o'chirg'ich — bola davom etadi,
  // «Tayyor» bosilganda tekshiriladi. 1-xato — taxta holati saqlanadi, soya aniqroq; 2-xato — qadam o'zi chiziladi.
  // Takror qadam (yechimdan keyin): taxta qadam boshidagi holatga qaytariladi, bola o'zi chizadi.
  function qadamDars(t, savolEl) {
    const oldinlar = {}; // qadam → qadam boshidagi taxta
    let yopiq = false;

    function qadamExercise(task) {
      let oldin = null;
      const takror = !!oldinlar[task.k];
      return practice.tries({
        setup(submit) {
          if (takror) t.ornat(oldinlar[task.k]);
          else { t.tarixBosh(); oldinlar[task.k] = t.holat().taxta; }
          oldin = oldinlar[task.k];
          t.jurnalTozala();
          t.qulfla(false);
          savolEl.textContent = (takror ? "Endi oʻzing chiz. " : "") + task.matn;
          t.soya(task.soya ? task.kutilgan : null, task.rang, false);
          const tekshir = () => L.qadamTekshir(oldin, t.holat().taxta, task.kutilgan, task.rang, task.chegara);
          t.onHarakatQoy((hr) => {
            if (L.TARIX_AMAL.includes(hr.asbob)) return;
            const v = tekshir();
            if (v.ok) { t.qulfla(true); submit(v); return; }
            if (hr.asbob === "qalam" || hr.asbob === "ochirgich") return; // bola davom etadi
            submit(v);
          });
          ui.clearControl();
          ui.control().append(ui.button("Tayyor ✓", () => {
            if (yopiq) return;
            const v = tekshir();
            if (v.ok) t.qulfla(true);
            submit(v);
          }, "ok"));
        },
        check: (v) => !!v.ok,
        hint(v) {
          if (task.soya) t.soya(task.kutilgan, task.rang, true);
          const j = task.javob;
          const asbob = L.asbobNomi(j.asbob);
          const rang = L.rangNomi(j.rang);
          if (v.sabab === "ortiqcha") ui.bubble("elder", `↻ Soyadan tashqariga chiqib ketdi. «Bekor» bilan qaytar, keyin ${asbob} bilan ${rang} rangda chiz.`);
          else if (v.sabab === "rang") ui.bubble("elder", `↻ Rang: ${rang}. «Bekor» bilan qaytar va shu rangda chiz.`);
          else ui.bubble("elder", `↻ Asbob: ${asbob}, rang: ${rang}. Soya ustiga chiz.`);
          t.yorit("asbob", j.asbob);
          t.yorit("rang", j.rang);
        },
        async solution() {
          t.qulfla(true);
          t.ornat(oldin);
          t.soya(null);
          const j = task.javob;
          t.asbobTanla(j.asbob);
          t.rangTanla(j.rang);
          if (j.asbob !== "qalam" && j.asbob !== "chiziq") t.toliqQoy(!!j.toliq);
          // Pufakni practice.exercises gapiradi ("Toʻgʻri javob ekranda…"); tavsif — ko'rsatma qatorida
          savolEl.textContent = `Mana shunday: ${task.qadam.matn} — ${tavsif(j)}.`;
          await t.chiz(j, { animatsiya: true, jim: true });
        },
      });
    }

    return {
      run: qadamExercise,
      praise: (task) => `${task.qadam.matn} tayyor.`,
      yop() { yopiq = true; t.soya(null); t.qulfla(true); },
    };
  }

  // Taxta + ko'rsatma qatori (namuna darsi uchun): host.savol — matn elementi
  function darsTaxtasi(opts) {
    const host = box(true);
    const savolEl = savol("");
    host.append(savolEl);
    const t = taxtaQoy(host, Object.assign({ asboblar: L.ASBOB_ID.slice(), amallar: ["bekor", "qaytar"] }, opts || {}));
    return { host, savolEl, t };
  }

  // ---------- Namuna tanlash kartalari (rasmchalari bilan) ----------
  function namunaTanla(ids, matn) {
    const host = box(false);
    host.append(savol(matn || "Qaysi rasmni chizamiz?"));
    return ui.settle((done) => {
      const kartalar = h("div", { class: "kr-kartalar" });
      for (const id of ids) {
        const n = L.namunaById(id);
        kartalar.append(h("button", {
          class: "kr-karta", type: "button", "data-namuna": id, "aria-label": n.nom,
          onClick: () => { sound.play("tap"); done(id); },
        }, QK.kichikRasm(L.namunaTaxta(n), 4), h("span", { class: "kr-karta-nom", text: n.nom })));
      }
      host.append(kartalar);
    });
  }

  // ---------- Bahosiz chizish (galereyadagi namunalar): qadam-qadam, xato sanalmaydi ----------
  // Har qadamda soya; mos bo'lsa — keyingi qadam; «Oʻtkazib yuborish» — qadam o'zi chiziladi. Oxirida taxta qaytariladi.
  async function bahosizChiz(namuna) {
    const { host, savolEl, t } = darsTaxtasi();
    let oldin = L.boshTaxta();
    for (let k = 0; k < namuna.qadamlar.length; k++) {
      const task = L.qadamTask(namuna, k, false);
      t.tarixBosh();
      t.jurnalTozala();
      t.qulfla(false);
      oldin = t.holat().taxta;
      savolEl.textContent = `${k + 1}/${namuna.qadamlar.length}. ${task.matn}`;
      t.soya(task.kutilgan, task.rang, false);
      ui.bubble("elder", k === 0 ? "Soya ustiga chiz. Mos kelsa, keyingi qadamga oʻtamiz." : `${task.qadam.matn} — soyaga qara.`);
      const natija = await ui.settle((done) => {
        const tekshir = () => L.qadamTekshir(oldin, t.holat().taxta, task.kutilgan, task.rang, task.chegara);
        t.onHarakatQoy((hr) => {
          if (L.TARIX_AMAL.includes(hr.asbob)) return;
          if (tekshir().ok) done("ok");
        });
        ui.clearControl();
        ui.control().append(h("div", { class: "choice-row" },
          ui.button("Tayyor ✓", () => { if (tekshir().ok) done("ok"); else ui.bubble("elder", `↻ Hali mos emas. Asbob: ${L.asbobNomi(task.javob.asbob)}, rang: ${L.rangNomi(task.rang)}.`); }, "ok"),
          ui.button("Oʻtkazib yuborish", () => done("otkaz"), "secondary"),
          ui.button("Chiqish", () => done("chiqish"), "secondary")));
      });
      if (natija === "chiqish") break;
      t.qulfla(true);
      if (natija === "otkaz") {
        t.ornat(oldin);
        t.soya(null);
        await t.chiz(task.javob, { animatsiya: true, jim: true });
      } else sound.play("correct");
    }
    t.soya(null);
    t.qulfla(true);
    ui.clearControl();
    return { host, t, taxta: t.holat().taxta };
  }

  QK.common = { box, savol, answer, bosh, taxtaQoy, taxtaOl, tavsif, asbobExercise, asbobPraise, qadamDars, darsTaxtasi, namunaTanla, bahosizChiz };
})(window);
