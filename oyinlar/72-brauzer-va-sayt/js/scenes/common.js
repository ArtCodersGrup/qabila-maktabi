// 72-o'yin: mashq ekranlari (brauzer oynasi ustida) va ko'rsatish qadami.
// Oyna — js/brauzer.js (QK.brauzer.yasa), tekshiruvlar — logic.js.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, practice, sound, brauzer } = QK;
  const h = ui.h;
  const KUTISH = 700; // yechim ko'rsatishda qadamlar orasi (ms)

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
  const ustJoy = () => h("div", { class: "br-ust", "aria-live": "polite" });

  // Ko'rsatish qadami: bola o'zi qiladi. qadam(holat, api, hodisa) → pufak matni (hali bajarilmadi) yoki null (bajarildi).
  // Matn holatga qarab o'zgaradi — bola boshqa narsani bosib qo'ysa ham, keyingi qadam doim to'g'ri aytiladi.
  function yolla(br, qadam) {
    return ui.settle((done) => {
      let oxirgi = null;
      const tekshir = (hodisa) => {
        const matn = qadam(br.holat(), br, hodisa || null);
        if (matn == null) {
          br.tingla(null);
          br.muzlat(true);
          done();
          return;
        }
        if (matn !== oxirgi) {
          oxirgi = matn;
          ui.bubble("elder", matn);
        }
      };
      ui.clearControl();
      br.muzlat(false);
      br.tingla(tekshir);
      tekshir(null);
    });
  }

  // Yechim: kerakli joy yoritiladi, keyin qadam bajariladi (bola ko'rib turadi). Oyna ekrandan ketsa — to'xtaydi.
  // Yurish vazifalarida (1–2-bosqich) avval boshlang'ich sahifaga qaytiladi — qadamlar shundan boshlab to'g'ri.
  async function yechimQadamlar(br, task) {
    br.muzlat(true);
    if (task.holat && task.tur !== "qalqib" && task.tur !== "soroq") br.ornat(task.holat);
    for (const q of task.qadamlar) {
      if (!br.el.isConnected) return;
      br.yorit(q.amal === "och" ? "manzil" : q.amal === "havola" ? "havola:" + q.id
        : q.amal === "natija" ? "natija:" + q.id : q.amal);
      await ui.sleep(KUTISH);
      if (!br.el.isConnected) return;
      br.bajar(q);
    }
    if (task.tur === "manzil" || task.tur === "yol") br.yorit("manzil");
    if (task.tur === "xazina" && task.gap >= 0) br.yorit("gap:" + task.gap);
  }

  const javoblar = (task, submit) => h("div", { class: "br-javoblar" },
    ...task.variantlar.map((v) => {
      const b = ui.button(v, () => submit(v), "wide");
      b.setAttribute("data-variant", v);
      return b;
    }));

  // ---------- 1-bosqich: manzil, havola, orqaga, yol — bolaning harakati kutilganga mos ----------
  // Betaraf harakatlar (manzil satrini bosish, chiplarni ko'rish, yangilash) hisobga olinmaydi.
  // 1-xatodan keyin holat saqlanadi — bola davom etadi.
  function navExercise(task) {
    let ust = null;
    let br = null;
    return practice.tries({
      setup(submit) {
        const host = box(true);
        ui.bubble("elder", task.matn);
        ust = ustJoy();
        host.append(ust);
        br = brauzer.yasa(host, { holat: task.holat });
        br.tingla((hodisa) => { if (L.tekshir1(task, hodisa) !== "betaraf") submit(hodisa); });
      },
      check: (hodisa) => L.tekshir1(task, hodisa) === "togri",
      hint(hodisa) {
        const p = hodisa.id ? L.SAHIFA[hodisa.id] : null;
        ust.replaceChildren(note((p ? `↻ Bu «${p.sarlavha}» edi. ` : "↻ Bunday sayt yoʻq. ") + task.ishora));
      },
      solution() {
        ust.replaceChildren(answer(task.tur === "manzil" ? `Manzil: ${task.javob}` : task.nega));
        yechimQadamlar(br, task);
      },
    }).then((ok) => {
      br.toxtat();
      return ok;
    });
  }

  // ---------- 2-bosqich: xazina ovi — qidiruv va yurish erkin, oxirida 4 variantdan javob ----------
  function xazinaExercise(task) {
    let ust = null;
    let br = null;
    return practice.tries({
      setup(submit) {
        const host = box(true);
        ui.bubble("elder", task.matn);
        ust = ustJoy();
        host.append(ust);
        br = brauzer.yasa(host, { holat: task.holat });
        ui.control().append(javoblar(task, submit));
      },
      check: (v) => L.tekshirXazina(task, v),
      // Maslahat joyni aytmaydi — usulni eslatadi
      hint() { ust.replaceChildren(note("↻ " + task.ishora)); },
      // Yechim: sahifa ochib beriladi, javob gapi yoritiladi
      solution() {
        ust.replaceChildren(answer(`Javob: ${task.javob}`), note(task.nega));
        yechimQadamlar(br, task);
      },
    }).then((ok) => {
      br.toxtat();
      return ok;
    });
  }

  // ---------- 3-bosqich ----------
  // Qalqib chiquvchi oyna: ✕ — to'g'ri, ichidagi tugma — xato; qolgani betaraf. Oyna 1-xatodan keyin ham turadi.
  function qalqibExercise(task) {
    let ust = null;
    let br = null;
    return practice.tries({
      setup(submit) {
        const host = box(true);
        ui.bubble("elder", task.matn);
        ust = ustJoy();
        host.append(ust);
        br = brauzer.yasa(host, { holat: task.holat });
        br.tingla((hodisa) => { if (L.tekshirQalqib(task, hodisa.amal) !== "betaraf") submit(hodisa.amal); });
        ui.sleep(600).then(() => { if (br.el.isConnected) br.qalqibKorsat(task.oyna); });
      },
      check: (amal) => L.tekshirQalqib(task, amal) === "togri",
      hint() { ust.replaceChildren(note("↻ " + task.ishora)); },
      solution() {
        ust.replaceChildren(answer(task.nega));
        yechimQadamlar(br, task);
      },
    }).then((ok) => {
      br.toxtat();
      return ok;
    });
  }

  // Parol / telefon so'rovi: «Chiqib ketaman» yoki «Orqaga» — to'g'ri; maydonga yozish yoki «Yuborish» — xato
  function soroqExercise(task) {
    let ust = null;
    let br = null;
    return practice.tries({
      setup(submit) {
        const host = box(true);
        ui.bubble("elder", task.matn);
        ust = ustJoy();
        host.append(ust);
        br = brauzer.yasa(host, { holat: task.holat, soroq: true });
        br.tingla((hodisa) => { if (L.tekshirSoroq(task, hodisa.amal) !== "betaraf") submit(hodisa.amal); });
      },
      check: (amal) => L.tekshirSoroq(task, amal) === "togri",
      hint() {
        br.soroqTozala();
        ust.replaceChildren(note("↻ " + task.ishora));
      },
      solution() {
        br.soroqTozala();
        ust.replaceChildren(answer(task.nega));
        yechimQadamlar(br, task);
      },
    }).then((ok) => {
      br.toxtat();
      return ok;
    });
  }

  // Vaziyat savoli: rasm kartasi va 4 variant
  function savolExercise(task) {
    let ust = null;
    return practice.tries({
      setup(submit) {
        const host = box(true);
        ui.bubble("elder", task.matn);
        ust = ustJoy();
        host.append(ust, h("div", { class: "br-karta" },
          h("div", { class: "br-karta-rasm", html: QK.gameArt.vaziyat(task.rasm) }),
          h("div", { class: "br-karta-matn", text: task.savol })));
        ui.control().append(javoblar(task, submit));
      },
      check: (v) => L.tekshirSavol(task, v),
      hint() { ust.replaceChildren(note("↻ " + task.ishora)); },
      solution() { ust.replaceChildren(answer(task.javob), note(task.nega)); },
    });
  }

  const EKRAN = {
    manzil: navExercise, havola: navExercise, orqaga: navExercise, yol: navExercise,
    xazina: xazinaExercise, qalqib: qalqibExercise, soroq: soroqExercise, savol: savolExercise,
  };
  const run = (task) => EKRAN[task.tur](task);

  // Mashq tugagach aytiladigan maqtov
  function praise(task) {
    if (task.tur === "manzil") return "Manzil toʻgʻri — sayt ochildi.";
    if (task.tur === "havola") return "Havola seni boshqa sahifaga olib bordi.";
    if (task.tur === "orqaga") return "«Orqaga» avvalgi sahifaga qaytaradi.";
    if (task.tur === "yol") return "Avval manzil, keyin havola — ikkala yoʻl ham ishlaydi.";
    if (task.tur === "xazina") return `Javob: ${task.javob}. Qidiruv topib berdi.`;
    if (task.tur === "qalqib") return "✕ qalqib chiqqan oynani yopadi.";
    if (task.tur === "soroq") return "Parol va telefon — sir. Saytga yozilmaydi.";
    return task.nega;
  }

  QK.common = { box, note, answer, ustJoy, yolla, yechimQadamlar, run, praise, brauzer: () => brauzer.joriy() };
})(window);
