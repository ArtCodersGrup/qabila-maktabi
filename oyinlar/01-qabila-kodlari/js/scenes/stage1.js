// Kirish sahnasi va 1-bosqich: aynan i harfli so'zlar (DIZAYN.md, 4-bo'lim).
// 2026-10-10: 5–8 ohangi (docs/superpowers/specs/2026-10-10-orta-ohang.md); shogird qog'ozi o'rniga ish zonasida shart kartasi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { logic, ui, sound, common } = QK;
  const AU = ["A", "U"];
  const AUF = ["A", "U", "F"];

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    await ui.say("elder", "Maqsad: a ta harfli alifbodan i uzunlikdagi nechta turli soʻz (kod) yasash mumkinligini hisoblash.");
    await ui.say("elder", "Bu — kombinatorika: har bir oʻringa nechta variant borligini sanaymiz.");
  }

  // 4.2: kataklar → ko'paytma → daraja → ta'rif → umumiy formula
  async function formulaExact(a, i) {
    ui.setCompact(false);
    ui.clearWork();
    const n = logic.countExact(a, i);
    const box = ui.h("div", { class: "formula-box" }, common.variantSlots(a, i));
    ui.work().append(box);
    await ui.say("elder", `${i} ta oʻrin, har oʻringa ${a} ta variant. Oʻrinlar bir-biriga bogʻliq emas.`);
    box.append(ui.h("div", { class: "formula", text: `${logic.productText(a, i)} = ${n}` }));
    await ui.say("elder", "Koʻpaytirish qoidasi: mustaqil tanlovlarning variantlari soni koʻpaytiriladi.");
    box.append(ui.h("div", { class: "formula", html: `Qisqacha: ${a}<sup>${i}</sup> = ${n}` }));
    await ui.say("elder", `${i} ta bir xil koʻpaytuvchi — daraja: ${a}${ui.sup(i)}.`);
    box.append(
      ui.h("div", { class: "formula big", html: "N = a<sup>i</sup>" }),
      ui.h("div", { class: "legend", text: "a — alifbodagi harflar soni, i — soʻz uzunligi, N — soʻzlar soni" }));
    await ui.say("elder", "Formula: a harfli alifbodan aynan i harfli soʻzlar soni N = aⁱ.");
  }

  async function stage1() {
    // 1.1 — qo'lda yasash: A, U, aynan 2 harfli
    ui.setCompact(false);
    ui.clearWork();
    ui.work().append(common.condCard({ letters: AU, len: common.lenText("exact", 2) }));
    await ui.say("elder", ui.lettersLine("Alifbo (a = 2):", AU, "Soʻz uzunligi — aynan 2 (i = 2)."));
    ui.bubble("elder", "Harflarni bosib, barcha 2 harfli soʻzlarni yasa.");
    await common.manualWall(AU, 2, false);
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    await ui.say("elder", "a = 2, i = 2: hammasi 4 ta soʻz.");

    // 1.2 — qo'lda yasash + daraxt: A, U, F
    await ui.say("elder", ui.lettersLine("Alifbo (a = 3):", AUF, "Uzunlik yana aynan 2."));
    ui.bubble("elder", "Barcha soʻzlarni yasa. Har soʻz — daraxtda ildizdan bargacha bitta yoʻl.");
    await common.manualTree(AUF, 2);
    sound.play("win");
    await ui.say("elder", "a = 3, i = 2: 9 ta soʻz. Har tugundan 3 ta shox chiqadi — har oʻringa 3 ta variant.");

    // 1.3 — daraxt o'sadi: aynan 3 harfli
    ui.bubble("elder", "Endi uzunlik aynan 3. Daraxtga yangi qavat qoʻshiladi.");
    ui.pose("elder", "point", 2000);
    await common.growTree(AUF, 3);
    ui.bubble("elder", "a = 3, i = 3. Nechta soʻz?");
    const ok = await common.askUntilCorrect(27, () => {
      ui.bubble("elder", "↻ 2-qavatdagi 9 ta tugunning har biridan 3 ta shox chiqdi.");
    });
    if (ok) await ui.say("elder", "9 · 3 = 27.");

    await formulaExact(3, 3);

    await ui.say("elder", `Mashq: ${QK.practice.need()} ta misol. N = aⁱ ni qoʻlla.`);
    await common.exercises(1, common.stage12Spec("exact"));
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
