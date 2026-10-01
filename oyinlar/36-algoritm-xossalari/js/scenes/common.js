// 36-o'yin: shu o'yinga xos sahna qismlari. Umumiylari — umumiy/js/kod-mashq.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const M = QK.kodMashq;
  const { ui, kodUI: U, logic: L, practice } = QK;
  const h = ui.h;

  // Kundalik algoritm qadamlari ro'yxat ko'rinishida
  function qadamlar(list, belgi) {
    const el = h("ol", { class: "alg-qadamlar" });
    list.forEach((matn, k) => {
      el.append(h("li", { class: belgi === k ? "buzuq" : "", text: matn }));
    });
    return el;
  }

  // Beshta xossadan bittasini tanlash
  function xossaTanlash(host, onPick) {
    const el = h("div", { class: "xossa-tanlov" });
    for (const x of L.XOSSALAR) {
      el.append(h("button", {
        class: "xossa-tugma", type: "button",
        onClick: () => onPick(x.id, el),
      },
      h("span", { class: "xossa-nom", text: x.nom }),
      h("span", { class: "xossa-izoh", text: x.izoh })));
    }
    host.append(el);
    return el;
  }

  const javobni = (el, xossa) => {
    [...el.children].forEach((b, k) => {
      b.disabled = true;
      if (L.XOSSALAR[k].id === xossa) b.classList.add("togri");
    });
  };

  // ---------- Kundalik algoritmda qaysi xossa buzilgan ----------
  function xossaExercise(task) {
    let host = null;
    let tanlov = null;
    return practice.tries({
      setup(submit) {
        host = M.box();
        host.append(M.note("«" + task.nom + "» algoritmida qaysi xossa buzilgan?"));
        host.append(qadamlar(task.qadamlar));
        tanlov = xossaTanlash(host, (id) => submit(id));
      },
      check: (value) => value === task.xossa,
      hint() {
        host.querySelector(".alg-qadamlar").replaceWith(qadamlar(task.qadamlar, task.buzuq));
        host.append(M.note("↻ Mana shu qator muammoli. Yana oʻylab koʻr."));
      },
      solution() {
        javobni(tanlov, task.xossa);
        host.append(M.answer(L.xossaById(task.xossa).nom + " buzilgan"),
          h("div", { class: "alg-nega", text: task.nega }),
          h("div", { class: "alg-tuzatilgan" }, h("b", { text: "Toʻgʻrisi: " }), h("span", { text: task.tuzatilgan })));
      },
    });
  }

  // O'lchov jadvali: ikki yechim yonma-yon (qadamlar soni talqinchidan olingan)
  const jadval = (task) => U.qadamJadval([
    { nom: task.a.nom, qadam: task.olchov.a, natija: task.natija, eng: task.javob === "a" },
    { nom: task.b.nom, qadam: task.olchov.b, natija: task.natija, eng: task.javob === "b" },
  ]);

  // ---------- Ikki yechimdan qaysi biri kamroq qadam bajaradi ----------
  function juftExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box();
        host.append(M.note(task.savol + " — ikki yechim. Qaysi biri kamroq qadam bajaradi?"));
        const juft = h("div", { class: "alg-juft" });
        for (const kalit of ["a", "b"]) {
          const yechim = task[kalit];
          juft.append(h("div", { class: "alg-yechim" },
            h("div", { class: "alg-yechim-nom", text: yechim.nom }),
            U.codeBlock(yechim.kod, { numbers: false })));
        }
        host.append(juft);
        ui.control().append(
          ui.button(task.a.nom, () => submit("a"), "big"),
          ui.button(task.b.nom, () => submit("b"), "big"));
      },
      check: (value) => value === task.javob,
      hint() {
        host.append(M.note("↻ Sikl nechta marta aylanishini sana. Formulada sikl bormi?"));
      },
      solution() {
        host.append(M.answer("Oʻlchab koʻramiz:"), jadval(task));
      },
    });
  }



  // ---------- Kodda qaysi xossa buzilgan ----------
  function kodXossaExercise(task) {
    let host = null;
    let tanlov = null;
    return practice.tries({
      setup(submit) {
        host = M.box();
        host.append(M.note("Bu kodda qaysi xossa buzilgan?"));
        host.append(U.codeBlock(task.kod));
        tanlov = xossaTanlash(host, (id) => submit(id));
      },
      check: (value) => value === task.xossa,
      hint() { host.append(M.note("↻ Kodni ishga tushirsak nima boʻladi? Toʻxtaydimi? Har qanday kirish uchun ishlaydimi?")); },
      solution() {
        javobni(tanlov, task.xossa);
        host.append(M.answer(L.xossaById(task.xossa).nom + " buzilgan"), h("div", { class: "alg-nega", text: task.nega }));
      },
    });
  }

  // Kodni tuzatish — umumiy mashq ekranidan foydalanadi
  const tuzatExercise = (task) => M.writeExercise({
    type: "kod-yoz",
    what: task.what,
    solution: task.yechim,
    tests: task.tests,
    hint: task.nega,
  });

  const stage3Exercise = (task) => (task.tur === "tuzat" ? tuzatExercise(task) : kodXossaExercise(task));

  QK.common = Object.assign({}, M, { qadamlar, xossaTanlash, xossaExercise, juftExercise, kodXossaExercise, tuzatExercise, stage3Exercise, jadval });
})(window);
