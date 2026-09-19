// Kirish va 1-bosqich: Morze xabarini o'qish (DIZAYN 3, 5-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { morse, ui, sound, art, morseUi, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "drum-box", html: art.drum() }));
    ui.pose("apprentice", "drum", 300);
    sound.play("tak");
    await ui.sleep(300);
    ui.pose("apprentice", "drum", 300);
    sound.play("dum");
    await ui.say("elder", "Esingdami, Shogird barabanda tak-dum chalgan edi?");
    await ui.say("elder", "Endi biz qisqa va uzun zarblar bilan gaplashamiz. Bu — Morze alifbosi.");
    await ui.say("apprentice", "Men xabar chalaman, sen oʻqiysan!");
  }

  // 5.1: bitta harf — Shogird barabanda chaladi, bola qo'llanmadan topadi
  async function demoLetter(letter, drumSound, text) {
    ui.pose("apprentice", "drum", 300);
    sound.play(drumSound);
    ui.bubble("elder", text);
    await common.readMessage(letter, morse.lettersUpTo(1), "demo");
  }

  // 5.2: ta'rif — namunalar ish maydonida, Oqsoqol tushuntiradi
  async function explain() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    morseUi.clearGuide();
    await ui.say("elder", "Har bir harfning oʻz kodi bor. Kod nuqta va chiziqlardan tuzilgan.");
    ui.work().append(morseUi.wordCodes("SALOM").el);
    await ui.say("elder", "Kodlar har xil uzunlikda. Shuning uchun harflar orasida pauza qoʻyamiz — 1-oʻyinda buni koʻrgan edik!");
    ui.clearWork();
    ui.work().append(morseUi.wordCodes("ET").el);
    await ui.say("elder", "E va T ning kodi eng qisqa. Nega? Buni hikoyada bilib olasan.");
    ui.clearWork();
    ui.work().append(morseUi.wordCodes("SALOM OTA").el);
    await ui.say("elder", "Soʻzlar orasida esa uzunroq pauza boʻladi. Biz uni / bilan belgilaymiz.");
  }

  async function stage1() {
    ui.paper("");
    await demoLetter("E", "tak", "Tingla: qisqa zarb! Qoʻllanmadan shu kodni top va harfini bos.");
    await ui.say("elder", "Toʻgʻri! Qisqa zarb — E harfi.");
    await demoLetter("T", "dum", "Endi uzun zarb! Qoʻllanmadan shu kodni top.");
    await ui.say("elder", "Barakalla! Uzun zarb — T harfi.");
    await explain();
    await ui.say("elder", "Endi qabila senga xabar yuboradi. 3 ta xabarni oʻqi!");
    await common.readExercises();
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
