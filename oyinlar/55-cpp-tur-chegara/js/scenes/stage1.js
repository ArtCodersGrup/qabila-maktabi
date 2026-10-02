// Kirish va 1-bosqich: son cheksiz emas (CPP-BLOK.md, mavzu 3).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, cpp: C, logic: L, common, practice } = QK;

  async function intro() {
    await ui.keyboardCheck("Bu oʻyinda kod oʻqiymiz va yozamiz — klaviatura kerak.");
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: QK.gameArt.chegara() }));
    await ui.say("elder", "Pythonda son cheksiz edi: 2 ** 100 ni ham bemalol hisoblardi.");
    await ui.say("apprentice", "C++ da ham shundaymi?");
    await ui.say("elder", "Yoʻq. C++ da har son oʻz qutisida yashaydi, quti esa chekli. Bugun shuni koʻramiz.");
  }

  // Toshib ketish: dastur xato bermaydi, javobni jim buzadi
  async function toshish() {
    const el = common.box();
    el.append(common.note("Ikki milliardni ikki marta qoʻshamiz:"));
    common.kodVaChiqish(el, C.dastur(["int a = 2000000000;", C.chiqar("a + a")]), ["-294967296"]);
    await ui.say("apprentice", "Toʻgʻri javob 4 milliard-ku! Bu manfiy son qayerdan chiqdi?");
    await ui.say("elder", "int ichiga 2 147 483 647 gacha son sigʻadi. Undan oshsa, sanoq boshidan — manfiy tomondan boshlanadi.");
    await ui.say("elder", "Eng muhimi: dastur xato bermadi, toʻxtamadi. Javob jim buzildi.");
    await ui.say("elder", "Olimpiadada eng koʻp uchraydigan xato — shu.");
  }

  // Yechim: kattaroq quti
  async function kattaQuti() {
    const el = common.box(false);
    el.append(common.turJadval());
    await ui.say("elder", "Yechim oddiy: kattaroq quti olamiz — long long.");
    const el2 = common.box();
    el2.append(common.note("Bir xil hisob, boshqa tur:"));
    common.kodVaChiqish(el2, C.dastur(["long long a = 2000000000;", C.chiqar("a + a")]), ["4000000000"]);
    await ui.say("elder", "Qoida: javob 2 milliarddan oshishi mumkin boʻlsa — long long yoz.");
    await ui.say("elder", "«Ehtimol oshmas» deb oʻylash — xatar. Oshsa, dastur buni aytmaydi.");
  }

  async function stage1() {
    await toshish();
    await kattaQuti();
    await ui.say("elder", `Endi oʻzing javob ber. ${QK.practice.need()} ta toʻgʻri javob — bosqich tugaydi!`);
    await practice.exercises({
      next: (prev, correct, tier) => L.bosqich1Task(prev, correct, tier),
      run: (task) => common.mashq(task),
      praise: (task) => (task.tur === "toshish" ? "Qirqilgan javobni topding." : "long long ishladi."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
