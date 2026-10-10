// 2-bosqich: xatni to'rt joydan tekshirish va manzil qoidasi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  const NAMUNA = L.XABARLAR.find((x) => x.id === "bank-yopiladi");

  async function korsat() {
    const el = common.box(true);
    el.append(common.xabarKarta(NAMUNA));
    await ui.say("elder", "Xat toʻrt joydan tekshiriladi: kimdan, manzil, matn va havola.");
    await ui.say("elder", "Avval manzil. Bankning haqiqiy manzili — qabilabank.uz.");
    el.append(common.note(L.manzilBahosi(NAMUNA).izoh));
    el.append(common.belgiRoyxat(NAMUNA.belgilar.map(L.belgi)));
    await ui.say("elder", "Bu yerda nomga qoʻshimcha soʻz yopishtirilgan. Matnda yana 4 ta belgi bor.");
  }

  // Manzil qoidasi: faqat zonadan oldingi nom va zona solishtiriladi
  const MISOL = [
    { manzil: "qabilabank.uz", togri: true, izoh: "haqiqiy manzil" },
    { manzil: "kirish.qabilabank.uz", togri: true, izoh: "bankning oʻz boʻlimi — nom va zona oʻsha" },
    { manzil: "qabi1abank.uz", togri: false, izoh: "«l» oʻrnida «1» raqami" },
    { manzil: "qabilabank-uz.xyz", togri: false, izoh: "qoʻshimcha soʻz va boshqa zona" },
    { manzil: "qabilabank.kirish.uz", togri: false, izoh: "nom oldinga koʻchirilgan, egasi boshqa" },
  ];

  async function qoida() {
    const el = common.box(true);
    el.append(common.note("Hal qiluvchi joy — zonadan oldingi nom:"));
    el.append(h("div", { class: "fx-jadval" }, ...MISOL.map((m) => h("div", { class: "fx-qator-m " + (m.togri ? "ha" : "yoq") },
      h("span", { class: "fx-belgi-ha", text: m.togri ? "✓" : "↻" }),
      common.manzilSatr(m.manzil),
      h("span", { class: "fx-izoh", text: m.izoh })))));
    await ui.say("elder", "Qoida: nuqtalar soni muhim emas — zonadan (.uz, .com) oldingi nom harfma-harf solishtiriladi.");
    await ui.say("elder", "Nom va zona toʻgʻri boʻlsa, oldidagi qism (kirish.) — oʻsha tashkilotning oʻz boʻlimi.");
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta xat. Har birida ikki savol: haqiqiymi yoki firibgarmi — va isboti qayerda.`);
  }

  async function stage2() {
    await korsat();
    await qoida();
    await practice.exercises({
      // Soxta va haqiqiy xatlar navbatlashadi — bola ikkisini ham koʻradi
      // tier 0 — qoʻlda yozilgan xatlar, tier 1 — ikki belgili, tier 2 — bitta belgili (eng nozik) xatlar
      next: (prev, togri, tier) => L.xabarTask(Math.random, prev, togri % 2 === 0, tier),
      run: (task) => common.xabarExercise(task),
      praise: (task) => (task.xabar.soxta ? "Bu xat — fishing edi." : "Bu xat haqiqiy edi."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
