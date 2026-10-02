// 3-bosqich: sikldagi xatolar va o'z dasturini yozish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, cpp: C, logic: L, common, practice } = QK;

  async function uchXato() {
    const el = common.box();
    el.append(common.note("Siklning uchta mashhur xatosi bor. Birinchisi:"));
    common.kodVaChiqish(el, C.dastur(["int i = 1;", "while (i <= 3) {", '    cout << i << " ";', "}"]), []);
    await ui.say("elder", "Bu dastur hech qachon tugamaydi: i oʻzgarmayapti, shart doim rost.");
    await ui.say("elder", "Saytda uni qadam chegarasi toʻxtatadi. Haqiqiy olimpiadada esa — vaqt tugaydi.");
    const el2 = common.box();
    el2.append(common.note("Ikkinchisi — bitta ortiqcha nuqtali vergul:"));
    el2.append(common.kodBlok(C.dastur(["for (int i = 1; i <= 3; i++);", '    cout << i << " ";']), { mark: 5 }));
    await ui.say("elder", "for dan keyingi ; — bu «tanasi boʻsh» degani. Sikl aylanadi, lekin hech narsa qilmaydi.");
    await ui.say("elder", "Uchinchisi — i < n va i <= n ni adashtirish: bir marta kam yoki koʻp aylanadi.");
  }

  async function stage3() {
    await uchXato();
    await ui.say("elder", "Endi xatoni oʻzing topasan va oʻz dasturingni yozasan.");
    await practice.exercises({
      next: (prev, correct, tier) => L.bosqich3Task(prev, correct, tier),
      run: (task) => common.mashq(task),
      praise: (task) => (task.tur === "xato" ? "Xatoni topding." : "Dasturing ishladi!"),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
