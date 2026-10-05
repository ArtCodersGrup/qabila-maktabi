// Kirish va 1-bosqich: "qadam" qutisini kuzatish — dastur tugaganda qutida qanday son?
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, blokUi: BU, practice } = QK;
  const h = ui.h;

  async function intro() {
    const el = BU.box(false);
    el.append(h("div", { class: "story-art wide", html: QK.gameArt.robot() }));
    await ui.say("elder", "Robotimiz endi sanashni oʻrganadi. Uning xotirasida bitta quti bor.");
    await ui.say("apprentice", "Qutiga son yozib qoʻyadimi? Keyin uni eslab qoladimi?");
  }

  // Quti yopiq: son o'rnida "?" — yurgizilganda ham yangilanmaydi (bola o'zi topadi)
  function yopiqQuti(host) {
    const q = BU.quti(host);
    q.el.classList.add("yopiq");
    q.el.querySelector(".bk-quti-son").textContent = "?";
    return q;
  }

  // Ko'rsatuv: quti ochiq, robot yurganda son o'zgaradi
  async function korsat() {
    const k = L.KORSATUV.kuzat;
    const host = BU.box(true);
    host.append(BU.note("Qara: robot yurganda qutidagi son oʻzgaradi."));
    const maydon = BU.maydonlar(host, [k.f]);
    const q = BU.quti(host);
    BU.quruvchi(host, { dastur: k.dastur }).qulfla();
    await ui.settle((done) => ui.control().append(ui.button("▶︎ Ishga tushir", async () => {
      ui.clearControl();
      await BU.yurgiz(maydon, k.dastur, {}, q);
      done();
    }, "big")));
    await ui.say("elder", "«qadam = 0» qutiga nol yozadi. «qadam + 1» undagi songa bitta qoʻshadi.");
    await ui.say("elder", "Endi quti yopiq. Dastur tugaganda unda qanday son boʻlishini sen top.");
  }

  // Mashq: tayyor dastur, quti yopiq. tier 0 — yurgizib kuzatish mumkin, keyin — faqat o'qib.
  function kuzatExercise(level) {
    const host = BU.box(true);
    host.append(BU.note(level.yurgiz
      ? "Dastur tugaganda qutida qanday son boʻladi? Yurgizib kuzatsang boʻladi."
      : "Dasturni oʻqib top: oxirida qutida qanday son boʻladi?"));
    const maydon = BU.maydonlar(host, [level.f]);
    const q = yopiqQuti(host);
    BU.quruvchi(host, { dastur: level.dastur }).qulfla();
    // Raqam klaviaturasi pastki zonani egallaydi — yurgizish tugmasi ish zonasida
    if (level.yurgiz) {
      const btn = ui.button("▶︎ Yurgizib koʻr", async () => {
        btn.disabled = true;
        await BU.yurgiz(maydon, level.dastur, {}, null);
        btn.disabled = false;
      }, "small");
      host.append(btn);
    }
    return practice.numberTries({
      answer: level.javob,
      maxLen: 2,
      hint() {
        host.append(BU.note("↻ Har «qadam + 1» qutiga bitta qoʻshadi. Takror ichidagisi necha marta bajariladi?"));
      },
      solution() {
        q.el.classList.remove("yopiq");
        host.append(BU.answer("Qutida: " + level.javob));
        BU.yurgiz(maydon, level.dastur, {}, q);
      },
    });
  }

  async function stage1() {
    await korsat();
    await practice.exercises({
      next: (prev, correct, tier) => L.yasa("kuzat", prev, undefined, tier),
      run: (level) => kuzatExercise(level),
      praise: () => "Qutidagi sonni toʻgʻri topding.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
