// 2-bosqich: qidiruv — so'z yoziladi, natijalar chiqadi, kerakli sahifa ochiladi. Mashq — xazina ovi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice, sound, brauzer } = QK;

  // Bola o'zi qiladi: qidiruv.uz ni ochadi → «tuya» deb qidiradi → birinchi natijani ochadi
  async function korsat() {
    const el = common.box(true);
    const br = brauzer.yasa(el, { holat: L.yangi() });
    const touch = ui.touchOnly();
    const soz = (h) => L.norm(L.joriy(h).soz || "");

    await common.yolla(br, (h) => (L.joriyId(h) === L.QIDIRUV ? null
      : touch ? "Savol: tuya necha kun suvsiz yuradi? Buni qidiruv topadi — satrni bos, «qidiruv.uz»ni tanla."
        : "Savol: tuya necha kun suvsiz yuradi? Buni qidiruv topadi — manzilga «qidiruv.uz» yoz."));
    await common.yolla(br, (h) => (L.joriyId(h) === L.QIDIRUV && soz(h).includes("tuya") ? null
      : L.joriyId(h) !== L.QIDIRUV ? "Avval «qidiruv.uz»ga qayt."
        : touch ? "Qidiruv satrida «tuya» soʻzini tanla." : "Qidiruv satriga «tuya» deb yoz va «Qidir»ni bos."));
    sound.play("correct");
    await ui.say("elder", "✓ Natijalar chiqdi: har biri — bitta sahifa. Sarlavhasi va manzili yozilgan.");

    await common.yolla(br, (h) => (L.joriyId(h) === "tuyalar" ? null
      : L.joriyId(h) === L.QIDIRUV && soz(h).includes("tuya") ? "Birinchi natijani bos — «Tuyalar»."
        : "«Orqaga» qaytib, «Tuyalar» natijasini bos."));
    br.yorit("gap:1");
    sound.play("correct");
    await ui.say("elder", "✓ Javob shu yerda: 7 kun! Qidiruv — soʻz boʻyicha sahifa topadigan sayt.");
    br.toxtat();
  }

  async function stage2() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich2Task(Math.random, prev, togri, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
