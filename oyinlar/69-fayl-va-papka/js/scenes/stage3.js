// 3-bosqich: nusxa (ikkita bo'ladi), o'chirish va savat (o'chirilgan fayl qaytariladi).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice, sound } = QK;

  // Bola o'zi qiladi: nusxa olib «Zaxira»ga qo'yadi → faylni o'chiradi → savatdan qaytaradi
  async function korsat() {
    const el = common.box(true);
    const holat = L.holatYasa([L.P("Zaxira"), "xat.txt", "gul.jpg"]);
    const zaxira = L.nomBilan(holat, "Zaxira").id;
    const xat = L.nomBilan(holat, "xat.txt").id;
    const gul = L.nomBilan(holat, "gul.jpg").id;
    // Bu qadamda kesish va o'chirish yo'q — fayl joyidan qo'zg'almaydi, faqat nusxasi paydo bo'ladi
    const oyna = common.fayllar(el, { holat, asboblar: ["orqaga", "nusxa", "qoy"], savat: true, tezkor: true });

    // Fayl hozir ko'z oldidami (savat ochiq yoki boshqa papkada turgan bo'lsa — avval qaytish kerak)
    const korinib = (h, o, id) => !o.savatda() && L.qayerda(h, id) === h.joriy;

    await common.yolla(oyna, (h, o) => {
      if (L.top(h, zaxira).ichi.some((t) => L.oila(t, xat))) return null;
      if (o.savatda()) return "Avval «Orqaga» qayt. Keyin «xat.txt»ni bir marta bos.";
      if (h.bufer && h.bufer.id === xat) return "Endi «Zaxira»ni ikki marta bosib och. Keyin «Qoʻyish»ni bos.";
      return korinib(h, o, xat) ? "«xat.txt»ni bir marta bos. Keyin «Nusxa»ni bos." : "Avval «Orqaga» qayt. Keyin «xat.txt»ni bir marta bos.";
    });
    sound.play("correct");
    await ui.say("elder", "✓ Endi xat ikkita: biri joyida, biri «Zaxira»da. Bu — nusxa.");

    // Keyingi qadam «Kompyuter»da boshlanadi — matn kam bo'lsin deb oqsoqol o'zi olib chiqadi (QOIDALAR §5)
    oyna.ornat(L.kir(oyna.holat(), L.ILDIZ));
    oyna.asboblar(["orqaga", "nusxa", "qoy", "ochir"]);
    await common.yolla(oyna, (h, o) => {
      if (L.qayerda(h, gul) === "savat") return null;
      return korinib(h, o, gul) ? "«gul.jpg» endi kerak emas. Uni tanla va «Oʻchirish»ni bos." : "Avval «Orqaga» qayt. Keyin «gul.jpg»ni tanla.";
    });

    // Bitta pufak — uchta harakat davomida ekranda turadi (savat ochilganda ham o'zgarmaydi)
    await common.yolla(oyna, (h) => (L.top(h, gul) ? null : "Fayl yoʻqolmadi — u savatda. Pastdagi savatni och, faylni tanla va «Qaytarish»ni bos."));
    oyna.korsat(gul); // savatdan chiqib, qaytgan faylni o'z papkasida ko'rsatadi
    sound.play("correct");
    await ui.say("elder", "✓ Fayl oʻz joyiga qaytdi! Adashib oʻchirsang — savatdan qaytarasan.");
    oyna.toxtat();
  }

  async function stage3() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich3Task(Math.random, prev, togri, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
