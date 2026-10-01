// 53-o'yin: ekran qismlari — dastur ro'yxati (bosiladigan) va tuzatish stoli.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, dastur: D, dasturUi: DU, practice, sound } = QK;
  const h = ui.h;

  const box = (compact) => {
    ui.setCompact(compact !== false);
    ui.clearWork();
    ui.clearControl();
    const el = h("div", { class: "xo-ekran" });
    ui.work().append(el);
    return el;
  };
  const note = (text) => h("div", { class: "xo-note", text });
  const answer = (text) => h("div", { class: "xo-answer", text });

  // Dastur ro'yxati: har buyruq bosiladi (1-bosqich — xatoni topish)
  function dasturRoyxat(host, dastur, onPick) {
    const el = h("div", { class: "xo-dastur" });
    dastur.forEach((dir, k) => {
      const btn = h("button", { class: "xo-buyruq", type: "button", text: D.DIRS[dir].arrow,
        "aria-label": (k + 1) + ": " + D.DIRS[dir].name });
      btn.addEventListener("click", () => onPick && onPick(k, btn));
      el.append(btn);
    });
    // Oxirgi "yetishmayapti" joyi ham tanlanadi
    const oxiri = h("button", { class: "xo-buyruq bosh", type: "button", text: "+",
      "aria-label": "Bu yerda buyruq yetishmaydi" });
    oxiri.addEventListener("click", () => onPick && onPick(dastur.length, oxiri));
    el.append(oxiri);
    host.append(el);
    return el;
  }

  // 1-bosqich: dasturni yurgizib ko'rsatamiz, keyin bola xato buyruqni bosadi
  function topExercise(task) {
    let host = null;
    let maydon = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        host.append(note(task.matn));
        const f = task.maydon();
        maydon = DU.fieldView(host, f);
        const royxat = dasturRoyxat(host, task.dastur, (k, btn) => {
          for (const b of host.querySelectorAll(".xo-buyruq")) b.classList.remove("tanlangan");
          btn.classList.add("tanlangan");
          submit(k);
        });
        ui.control().append(ui.button("▶︎ Yurgizib koʻr", async () => {
          const r = D.run(f, task.dastur);
          maydon.set(f.robot, true);
          maydon.clearTrail();
          await maydon.walk(r.path, (k) => royxat.children[k] && royxat.children[k].classList.add("yonmoqda"));
          maydon.trail(r.path);
          if (r.status !== "goal" && r.blocked) maydon.mark(r.blocked, "retry");
          else if (r.status !== "goal") maydon.mark(r.at, "retry");
        }, "big"));
      },
      check: (value) => value === task.xatoIndeks,
      hint() { host.append(note("↻ " + task.ishora)); },
      solution() {
        const btnlar = host.querySelectorAll(".xo-buyruq");
        if (btnlar[task.xatoIndeks]) btnlar[task.xatoIndeks].classList.add("xato");
        host.append(answer(task.xatoIndeks >= task.dastur.length
          ? "Oxirida buyruq yetishmaydi"
          : (task.xatoIndeks + 1) + "-buyruq xato"));
        host.append(note(task.ishora));
      },
    });
  }

  // 2-bosqich: dasturni tuzatish
  function tuzatExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        host.append(note(task.matn));
        const f = task.maydon();
        const maydon = DU.fieldView(host, f);
        const royxat = DU.programList(host, { max: 8 });
        royxat.set(task.dastur.slice());
        DU.commandPad(host, {
          onAdd: (dir) => royxat.add(dir),
          onBack: () => royxat.removeLast(),
        });
        ui.control().append(
          ui.button("▶︎ Ishga tushir", async () => {
            const dastur = royxat.get();
            const r = D.run(f, dastur);
            maydon.set(f.robot, true);
            maydon.clearTrail();
            await maydon.walk(r.path, (k) => royxat.highlight(k));
            royxat.highlight(-1);
            maydon.trail(r.path);
            if (r.status !== "goal") maydon.mark(r.blocked || r.at, "retry");
            submit(dastur);
          }, "big"),
          ui.button("Boshidan", () => { royxat.set(task.dastur.slice()); }, "small"));
      },
      check(value) {
        const natija = L.tekshir(task, task.maydon(), value);
        host.__sabab = natija.sabab;
        return natija.ok;
      },
      hint() {
        host.append(note("↻ " + (host.__sabab ? host.__sabab + " " : "") + task.ishora));
      },
      solution() {
        host.append(answer("Toʻgʻri dastur: " + task.togri.map((d) => D.DIRS[d].arrow).join(" ")));
      },
    });
  }

  QK.common = { box, note, answer, dasturRoyxat, topExercise, tuzatExercise };
})(window);
