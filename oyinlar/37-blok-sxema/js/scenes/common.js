// 37-o'yin: shu o'yinga xos sahna qismlari. Umumiylari — umumiy/js/kod-mashq.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const M = QK.kodMashq;
  const { ui, kodUI: U, sxema: S, sxemaUi: SU, logic: L, practice } = QK;
  const h = ui.h;

  // ---------- 1-bosqich: belgi nima uchun ----------
  function belgiExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box();
        host.append(M.note(task.savol));
        host.append(h("div", { class: "sx-namuna" }, SU.chiz([{ tur: task.shakl, nom: "?" }], { tugat: false })));
        const tanlov = h("div", { class: "belgi-tanlov" });
        for (const j of task.variantlar) {
          tanlov.append(h("button", { class: "belgi-tugma", type: "button", text: j, onClick: () => submit(j) }));
        }
        host.append(tanlov);
      },
      check: (value) => value === task.javob,
      hint() { host.append(M.note("↻ Shaklga qara: oval, romb, toʻrtburchak yoki qiyshiq toʻrtburchakmi?")); },
      solution() { host.append(M.answer(task.javob)); },
    });
  }

  // ---------- 2- va 3-bosqich: sxemani yig'ish ----------
  function qurishExercise(task) {
    let host = null;
    let quruvchi = null;
    let natijaJoy = null;
    return practice.tries({
      setup(submit) {
        host = M.box(true);
        host.append(M.note(task.what));
        quruvchi = SU.quruvchi(host, { palitra: task.palitra });
        natijaJoy = h("div", { class: "sx-natija" });
        host.append(natijaJoy);
        ui.control().append(ui.button("▶︎ Ishga tushir", () => submit(quruvchi.bloklar), "big"));
      },
      check(bloklar) {
        const r = L.tekshir(bloklar, task.tests);
        natijaJoy.innerHTML = "";
        if (r.kod) {
          natijaJoy.append(h("div", { class: "sx-kod-bosh", text: "Sxemadan chiqqan kod:" }), U.codeBlock(r.kod, { numbers: false }));
        }
        if (!r.ok) natijaJoy.append(M.note("↻ " + r.sabab));
        return r.ok;
      },
      hint() { host.append(M.note("↻ Bloklar tartibiga qara. Shart ichiga blok qoʻyish uchun avval “ha” yoki “yoʻq” ni bos.")); },
      solution() { natijaJoy.append(M.answer("Bloklar tartibi notoʻgʻri. Keyingi masalada qayta urin.")); },
    });
  }

  // ---------- 3-bosqich: sxemani o'qish ----------
  function oqishExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box(true);
        host.append(M.note("Bu sxema nima chiqaradi? Har satrni alohida qatorga yoz."));
        host.append(h("div", { class: "sx-namuna" }, SU.chiz(task.sxema)));
        if (task.stdin && task.stdin.length) host.append(U.stdinPanel(task.stdin));
        const area = h("textarea", {
          class: "kod-javob", rows: "3", spellcheck: "false", autocapitalize: "off", "aria-label": "Chiqishni yoz",
        });
        area.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submit(area.value); }
        });
        host.append(area);
        ui.control().append(ui.button("Tekshir", () => submit(area.value), "big"));
        setTimeout(() => area.focus(), 50);
      },
      check(value) {
        const bergan = String(value).split("\n").map((s) => s.trim()).filter((s) => s !== "");
        return bergan.length === task.javob.length && bergan.every((s, k) => s === task.javob[k]);
      },
      hint() { host.append(M.note("↻ Sxemani yuqoridan pastga, blok-blok kuzat. Shartda qaysi tomonga ketadi?")); },
      solution() {
        const out = U.output({ title: "Toʻgʻri javob" });
        out.lines(task.javob);
        host.append(out.el);
        host.append(h("div", { class: "sx-kod-bosh", text: "Sxemaning kodi:" }), U.codeBlock(task.kod, { numbers: false }));
      },
    });
  }

  const stage3Exercise = (task) => (task.tur === "qur" ? qurishExercise(task) : oqishExercise(task));

  QK.common = Object.assign({}, M, { belgiExercise, qurishExercise, oqishExercise, stage3Exercise });
})(window);
