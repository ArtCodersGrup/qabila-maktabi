// 3-bosqich: Morze qayerlarda ishlatiladi — hikoya va SOS (DIZAYN 7-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { morse, ui, art, morseUi, common } = QK;

  // art — rasm nomi (QK.art.story) yoki null; lines — Oqsoqol gaplari (har biri alohida pufak);
  // extra — rasm ostida: "codes" (E, T, Q kodlari), "sos" (SOS + Tinglash), "lamp" (SOS mayoq chirog'i bilan)
  const SCENES = [
    { art: "telegraph", lines: ["Taxminan 180 yil oldin Samuel Morze telegraf uchun shu alifboni oʻylab topdi.", "Xabar sim orqali boshqa shaharga bir zumda yetib borardi."] },
    { art: null, extra: "codes", lines: ["Eng koʻp ishlatiladigan harfga eng qisqa kod berildi. Ingliz tilida bu — E.", "Shunda xabar tezroq yuboriladi. Buni siqish deyishadi."] },
    { art: "ship", extra: "sos", lines: ["Kema xavfda qolsa, SOS signalini yuboradi.", "SOS — uch nuqta, uch chiziq, uch nuqta. Uni hamma taniydi."] },
    { art: "lighthouse", extra: "lamp", lines: ["Kemalar Morzeni chiroq bilan ham yuboradi: qisqa va uzun yorugʻlik."] },
    { art: "radio", lines: ["Bugun ham radio havaskorlari Morzeda gaplashadi.", "Samolyotlarga yoʻl koʻrsatadigan radiomayoqlar oʻz nomini Morze bilan aytadi."] },
    { art: "eye", lines: ["Gapira olmaydigan odamlar koʻz qisib yoki barmoq bilan urib Morzeda gaplasha oladi."] },
  ];

  // Rasm ostidagi qo'shimcha element
  function extraEl(kind, box) {
    if (kind === "codes") return morseUi.wordCodes("ETQ").el;
    const sos = morseUi.wordCodes("SOS");
    const codes = morse.encodeWord("SOS");
    const onLight = kind === "lamp"
      ? (on) => {
        const lamp = box.querySelector(".lamp");
        if (lamp) lamp.classList.toggle("on", on);
      }
      : null;
    const listen = ui.button("Tinglash", () => morseUi.play(codes, sos.groups, onLight), "secondary");
    return ui.h("div", { class: "story" }, sos.el, listen);
  }

  async function showScene(sc) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    morseUi.clearGuide();
    morseUi.stopPlaying();
    const box = ui.h("div", { class: "story" });
    if (sc.art) box.append(ui.h("div", { class: "story-art", html: art.story(sc.art) }));
    ui.work().append(box);
    if (sc.extra) box.append(extraEl(sc.extra, box));
    for (const line of sc.lines) await ui.say("elder", line);
  }

  async function stage3() {
    ui.paper("");
    await ui.say("elder", "Endi senga Morze haqida hikoya aytib beraman.");
    for (const sc of SCENES) await showScene(sc);
    morseUi.stopPlaying();
    ui.bubble("elder", "Endi sen ham SOS ni yoza olasan. Ter!");
    const ok = await common.writeWord("SOS", morse.lettersUpTo(3));
    await ui.say("apprentice", ok ? "Men oʻqidim: SOS! Yordamga shoshilamiz!" : "Mana SOS kodi. Uni eslab qol!");
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
