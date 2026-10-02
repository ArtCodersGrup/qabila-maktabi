// 3-bosqich: vector va sort — faqat o'qish (yadroda yo'q, haqiqiy kompilyatorda ishlaydi).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  const OGOH = "Bu bosqichdagi dasturlar oʻyin ichida ishga tushmaydi — ularni oʻqiymiz. "
    + "Haqiqiy kompilyatorda esa ishlaydi va aynan shu javobni beradi.";

  async function vector() {
    const el = common.box();
    el.append(ui.h("div", { class: "ms-oqish", text: OGOH }));
    el.append(common.note("vector — boʻyi oʻsadigan massiv:"));
    common.kodVaChiqish(el,
      L.vDastur(["vector<int> v;", "v.push_back(5);", "v.push_back(2);", "v.push_back(9);",
        'cout << v.size() << " " << v[0] << "\\n";']),
      ["3 5"]);
    await ui.say("elder", "push_back — Pythondagi append. Boʻyini oldindan aytish shart emas.");
    await ui.say("apprentice", "Unda nega massiv kerak?");
    await ui.say("elder", "Massiv soddaroq va biroz tezroq. Olimpiadada ikkalasi ham ishlatiladi.");
  }

  async function sort() {
    const el = common.box();
    el.append(common.note("Saralash tayyor — oʻzing yozishing shart emas:"));
    common.kodVaChiqish(el,
      L.vDastur(["vector<int> v = {5, 2, 9, 1};", "sort(v.begin(), v.end());",
        'for (int i = 0; i < v.size(); i++) cout << v[i] << " ";', 'cout << "\\n";']),
      ["1 2 5 9 "]);
    await ui.say("elder", "sort ga ikkita chegara beriladi: qayerdan (begin) va qayergacha (end).");
    const el2 = common.box();
    el2.append(common.note("Kamayish tartibida saralash uchun teskari chegaralar:"));
    common.kodVaChiqish(el2,
      L.vDastur(["vector<int> v = {5, 2, 9, 1};", "sort(v.rbegin(), v.rend());",
        'for (int i = 0; i < v.size(); i++) cout << v[i] << " ";', 'cout << "\\n";']),
      ["9 5 2 1 "]);
    await ui.say("elder", "«Saralab chiqar», «ikkinchi eng katta», «takrorlarni yoʻqot» — hammasi shundan boshlanadi.");
    await ui.say("elder", "Qoʻlda pufakchali saralash yozish shart emas: tayyor sort tezroq va xatosiz.");
  }

  async function stage3() {
    await vector();
    await sort();
    await ui.say("elder", "Oxirgi 3 ta savol — va blok tugaydi!");
    await practice.exercises({
      next: (prev, correct, tier) => L.bosqich3Task(prev, correct, tier),
      run: (task) => common.mashq(task),
      praise: (task) => (task.tur === "farq" ? "Esingda qoldi." : "Saralangan javobni topding."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
