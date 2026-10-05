// 66-o'yin: shu o'yinga xos ekran qismlari (qism rasmi, rasm-tugma, stol ustidagi kompyuter) va mashq ekranlari.
// Sinov ilgagi: har javob tugmasida data-id (qiymat), «Tayyor» tugmasida data-tayyor; to'g'ri javob — QK.current.javob.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, practice } = QK;
  const h = ui.h;
  const art = QK.gameArt;

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
  const savol = (text) => h("div", { class: "kq-savol", text });

  // ---------- Qismlar ----------
  // Qism rasmi (matnsiz SVG); nomi kerak bo'lsa — yonida HTML bilan yoziladi
  const surat = (id, cls) => h("div", { class: "kq-surat" + (cls ? " " + cls : ""), html: art.qism(id) });

  // Rasm-tugma. o.nomsiz — nom yozilmaydi (nomni so'raydigan savolda); o.yorliq — ekran o'quvchisi uchun yozuv
  function rasmTugma(id, opts) {
    const o = opts || {};
    const q = L.qism(id);
    const b = h("button", { class: "kq-rasm", type: "button", "data-id": id, "aria-label": o.yorliq || q.nom }, surat(id));
    if (!o.nomsiz) b.append(h("span", { class: "kq-nom", text: q.nom }));
    return b;
  }

  // «Tayyor» — ko'p tanlovli va tartiblash mashqlarida javobni yuboradi
  function tayyorTugma(onClick, cls) {
    const b = ui.button("Tayyor", onClick, cls || "");
    b.setAttribute("data-tayyor", "");
    return b;
  }

  // Yechimda: to'g'ri qurilma rasmi va nomi
  const yechimQism = (id) => h("div", { class: "kq-yechim" }, surat(id), answer("✓ " + L.qism(id).nom));

  const foiz = (qiymat, jami) => ((qiymat / jami) * 100).toFixed(3) + "%";

  // Stol ustidagi kompyuter: fon + 9 qism, har biri o'z joyida.
  // o.bosiladi — har qism alohida tugma (eng tor ekranda ham ≥ 48×48 px); aks holda oddiy rasm.
  function stol(opts) {
    const o = opts || {};
    const el = h("div", { class: "kq-stol" }, h("div", { class: "kq-stol-fon", html: art.stol() }));
    const joylar = {};
    for (const q of L.QISMLAR) {
      const [x, y, eni, boyi] = art.JOY[q.id];
      const joy = h(o.bosiladi ? "button" : "div", {
        class: "kq-joy",
        type: o.bosiladi ? "button" : null,
        "data-id": q.id,
        "aria-label": o.bosiladi ? "Kompyuter qismi" : null,
        style: `left:${foiz(x, art.STOL[0])};top:${foiz(y, art.STOL[1])};width:${foiz(eni, art.STOL[0])};height:${foiz(boyi, art.STOL[1])}`,
        html: art.qism(q.id),
      });
      joylar[q.id] = joy;
      el.append(joy);
    }
    if (!o.bosiladi) {
      el.setAttribute("role", "img");
      el.setAttribute("aria-label", "Stol ustidagi kompyuter va uning qismlari");
    }
    return { el, joylar };
  }

  // ---------- Mashq ekranlari ----------
  // Bitta javobli, javob — rasm: 4 ta rasm-tugma boshqaruv zonasida
  function rasmExercise(task, opts) {
    const o = opts || {};
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        host.append(savol(task.matn));
        const tugmalar = task.variantlar.map((id, k) => {
          const b = rasmTugma(id, o.nomsiz ? { nomsiz: true, yorliq: `${k + 1}-rasm` } : null);
          b.addEventListener("click", () => submit(id));
          return b;
        });
        ui.control().append(h("div", { class: "kq-variantlar n4" }, ...tugmalar));
      },
      check: (value) => L.tekshir(task, value),
      // Maslahat javobni aytmaydi — bola tanlagan qurilmaning o'zi nima qilishini aytadi
      hint(value) {
        const b = ui.control().querySelector(`[data-id="${value}"]`);
        if (b) b.classList.add("yana");
        host.append(note("↻ " + L.ishora(task, value)));
      },
      solution() {
        host.append(yechimQism(task.javob), note(task.nega));
      },
    });
  }

  // Bitta javobli, javob — yozuv. o.oldin(host) — savoldan oldingi rasm; o.yozuv(v) — tugma matni; o.qiymat(v) — yuboriladigan qiymat
  function matnExercise(task, opts) {
    const o = opts || {};
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        if (o.oldin) o.oldin(host);
        host.append(savol(task.matn));
        const tugmalar = task.variantlar.map((v) => {
          const b = ui.button(o.yozuv(v), () => submit(o.qiymat(v)), "wide");
          b.setAttribute("data-id", o.qiymat(v));
          return b;
        });
        ui.control().append(h("div", { class: "kq-javoblar" + (o.ikki ? " ikki" : "") }, ...tugmalar));
      },
      check: (value) => L.tekshir(task, value),
      hint(value) {
        const b = ui.control().querySelector(`[data-id="${value}"]`);
        if (b) b.classList.add("kq-yana");
        host.append(note("↻ " + L.ishora(task, value)));
      },
      solution() {
        host.append(answer("✓ " + o.javobYozuv(task)), note(task.nega));
      },
    });
  }

  // Ko'p tanlovli: variant bosilsa belgilanadi, yana bosilsa — olinadi; «Tayyor» to'plamni yuboradi.
  // Variantlar ish zonasida turadi (yechimda to'g'rilari shu yerning o'zida belgilanadi).
  // o.tugma(v) — variant tugmasi; o.qiymat(v) — uning qiymati; o.sinf — qator uslubi
  function kopExercise(task, opts) {
    const o = opts;
    let host = null;
    let tugmalar = [];
    const tanlov = new Set();
    const qulfla = () => tugmalar.forEach((b) => { b.disabled = true; });
    return practice.tries({
      setup(submit) {
        host = box(true);
        host.append(savol(task.matn));
        tugmalar = task.variantlar.map((v) => {
          const id = o.qiymat(v);
          const b = o.tugma(v);
          b.setAttribute("aria-pressed", "false");
          b.addEventListener("click", () => {
            if (b.disabled) return;
            QK.sound.play("tap");
            if (tanlov.has(id)) tanlov.delete(id);
            else tanlov.add(id);
            b.classList.toggle("belgilangan", tanlov.has(id));
            b.setAttribute("aria-pressed", String(tanlov.has(id)));
          });
          return b;
        });
        host.append(h("div", { class: o.sinf }, ...tugmalar));
        ui.control().append(tayyorTugma(() => {
          // Hech narsa belgilanmagan bo'lsa — bu urinish emas
          if (!tanlov.size) { ui.toast("Avval kamida bittasini belgila."); return; }
          submit(task.variantlar.map(o.qiymat).filter((id) => tanlov.has(id)));
        }, "big"));
      },
      check: (value) => L.tekshir(task, value),
      hint(value) { host.append(note("↻ " + L.ishora(task, value))); },
      solution() {
        tugmalar.forEach((b) => {
          b.classList.remove("belgilangan");
          b.classList.toggle("togri", task.javob.includes(b.getAttribute("data-id")));
        });
        host.append(note(task.nega));
      },
    }).then((ok) => {
      qulfla();
      if (ok) tugmalar.forEach((b) => { if (b.classList.contains("belgilangan")) b.classList.replace("belgilangan", "togri"); });
      return ok;
    });
  }

  // Yozuvli belgilash qatori: [katak] matn
  function belgiTugma(v) {
    return h("button", { class: "kq-belgi", type: "button", "data-id": v.id },
      h("span", { class: "kq-katak", "aria-hidden": "true" }), h("span", { text: v.matn }));
  }

  // Tartiblash: bosilgan karta navbatga qo'shiladi (raqami ko'rinadi), qayta bosilsa — navbatdan chiqadi.
  // Hamma karta tanlangach «Tayyor» yonadi.
  function tartibExercise(task) {
    let host = null;
    let qator = null;
    let kartalar = [];
    let tayyor = null;
    const navbat = []; // tanlangan qadamlar (id), bosilgan tartibda
    const yangila = () => {
      kartalar.forEach((b) => {
        const k = navbat.indexOf(b.getAttribute("data-id"));
        b.classList.toggle("tanlangan", k >= 0);
        b.querySelector(".kq-raqam").textContent = k >= 0 ? String(k + 1) : "";
        b.setAttribute("aria-pressed", String(k >= 0));
      });
      tayyor.disabled = navbat.length !== task.qadamlar.length;
    };
    return practice.tries({
      setup(submit) {
        host = box(true);
        host.append(savol(task.matn));
        kartalar = task.qadamlar.map((q) => {
          const b = h("button", { class: "kq-qadam", type: "button", "data-id": q.id, "aria-pressed": "false" },
            h("span", { class: "kq-raqam" }), h("span", { text: q.matn }));
          b.addEventListener("click", () => {
            if (b.disabled) return;
            QK.sound.play("tap");
            const k = navbat.indexOf(q.id);
            if (k >= 0) navbat.splice(k, 1);
            else navbat.push(q.id);
            yangila();
          });
          return b;
        });
        qator = h("div", { class: "kq-qadamlar" }, ...kartalar);
        host.append(qator);
        tayyor = tayyorTugma(() => submit(navbat.slice()));
        // «Tozalash» — navbatni bo'shatadi (bitta-bitta olib tashlamaslik uchun); urinish sanalmaydi
        const tozala = ui.button("Tozalash", () => { navbat.length = 0; yangila(); }, "secondary");
        ui.control().append(h("div", { class: "choice-row" }, tayyor, tozala));
        yangila();
      },
      check: (value) => L.tekshir(task, value),
      // Maslahat: nechta qadam o'z o'rnida + o'ylash uchun savol (tartibning o'zini aytmaydi)
      hint(value) { host.append(note("↻ " + L.ishora(task, value))); },
      // Yechim: kartalar to'g'ri tartibda qayta teriladi
      solution() {
        task.javob.forEach((id, k) => {
          const b = kartalar.find((x) => x.getAttribute("data-id") === id);
          b.className = "kq-qadam togri";
          b.querySelector(".kq-raqam").textContent = String(k + 1);
          qator.append(b);
        });
        host.append(note(task.nega));
      },
    }).then((ok) => {
      kartalar.forEach((b) => {
        b.disabled = true;
        if (ok) b.className = "kq-qadam togri";
      });
      return ok;
    });
  }

  // ---------- Har bir savol turi uchun ekran ----------
  const zararYozuv = (task) => task.variantlar.find((v) => v.id === task.javob).matn;

  const EKRAN = {
    // Nom → rasm va vazifa → rasm: tugmada nom yozilmaydi (aks holda javob tayyor bo'lib qoladi)
    nom: (task) => rasmExercise(task, { nomsiz: true }),
    vazifa: (task) => rasmExercise(task, { nomsiz: true }),
    // Rasm → nom: tepada katta rasm, pastda 4 ta nom
    rasm: (task) => matnExercise(task, {
      ikki: true,
      oldin: (host) => host.append(surat(task.qism, "katta")),
      yozuv: (id) => L.qism(id).nom,
      qiymat: (id) => id,
      javobYozuv: () => L.qism(task.javob).nom,
    }),
    kerak: (task) => rasmExercise(task),
    ortiqcha: (task) => rasmExercise(task),
    tanla: (task) => kopExercise(task, { sinf: "kq-variantlar n6", tugma: (id) => rasmTugma(id), qiymat: (id) => id }),
    tartib: tartibExercise,
    zarar: (task) => (task.kop
      ? kopExercise(task, { sinf: "kq-belgilar", tugma: belgiTugma, qiymat: (v) => v.id })
      : matnExercise(task, { yozuv: (v) => v.matn, qiymat: (v) => v.id, javobYozuv: zararYozuv })),
  };
  const run = (task) => EKRAN[task.tur](task);

  // Mashq tugagach aytiladigan maqtov ("✓ Barakalla!" dan keyin bitta qisqa gap)
  const praise = (task) => task.maqtov;

  QK.common = { box, note, answer, savol, surat, rasmTugma, tayyorTugma, stol, run, praise };
})(window);
