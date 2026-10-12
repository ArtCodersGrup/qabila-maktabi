// 2-bosqich: holat qoidalari — koordinatalarni taqqoslab, holatni aniqlash.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  // Oʻquvchi skeletni oʻzi harakatlantiradi va jadvalda qaysi son oʻzgarishini kuzatadi
  async function korsat() {
    const el = common.box(true);
    const joy = h("div", { class: "ah-joy" });
    el.append(joy);
    let o = {};
    const chiz = (belgi) => {
      const p = L.poza(o);
      joy.innerHTML = "";
      joy.append(common.yonma(
        common.rasm(p, { kichik: true, chiziqlar: [p.ongYelka[1]] }),
        common.jadval(p, ["ongYelka", "ongBilak", "chapSon", "chapTizza"], belgi)));
      return p;
    };
    const tik = chiz([]);
    ui.bubble("elder", "Qoidani sinab koʻr: oʻng qoʻlni koʻtar va jadvalda bilak y ni kuzat. Punktir — yelka balandligi.");
    await ui.choice([{ label: "Oʻng qoʻlni koʻtarish", value: 1 }]);
    o = { ong: "tepa" };
    const p1 = chiz(["ongYelka", "ongBilak"]);
    await ui.say("elder", `✓ Bilak y ${tik.ongBilak[1]} dan ${p1.ongBilak[1]} ga kamaydi: ${p1.ongBilak[1]} < yelka y ${p1.ongYelka[1]}. Qoida: bilak y < yelka y → qoʻl koʻtarilgan.`);
    ui.bubble("elder", "Endi oʻtir va son y ni kuzat.");
    await ui.choice([{ label: "Oʻtirish", value: 1 }]);
    o = { otir: 15 };
    const p2 = chiz(["chapSon", "chapTizza"]);
    await ui.say("elder", `✓ Son y ${tik.chapSon[1]} dan ${p2.chapSon[1]} ga oʻsdi: tizza y − son y = ${p2.chapTizza[1]} − ${p2.chapSon[1]} = ${p2.chapTizza[1] - p2.chapSon[1]}. Qoida: farq ≤ 8 → oʻtirgan.`);

    const el2 = common.box(true);
    el2.append(common.qoidaKarta());
    await ui.say("elder", "Toʻrt qoida, har biri — koordinatalarni taqqoslash. Chegaralarni (5, 8, 10, 25) odam tanlaydi; chegaraga yaqin holatda qoida xato qilishi mumkin.");
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta holat. Koʻzga emas, sonlarga ishon.`);
  }

  async function stage2() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich2Task(prev, Math.random, tier, togri),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
