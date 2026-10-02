// 2-bosqich: for va while (CPP-BLOK.md, mavzu 6).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, cpp: C, logic: L, common, practice } = QK;

  async function uchQism() {
    const el = common.box(false);
    el.append(common.ikkiTil("for i in range(1, 6):\n    print(i)", 'for (int i = 1; i <= 5; i++) {\n    cout << i;\n}'));
    await ui.say("elder", "C++ dagi for — uch qismdan iborat: boshi, sharti va qadami.");
    el.append(ui.h("div", { class: "cpp-qolip" },
      ui.h("div", { class: "cpp-qolip-qator" },
        ui.h("code", { class: "cpp-kod", html: common.paint("int i = 1") }), ui.h("span", { class: "cpp-izoh", text: "boshi — bir marta bajariladi" })),
      ui.h("div", { class: "cpp-qolip-qator" },
        ui.h("code", { class: "cpp-kod", html: common.paint("i <= 5") }), ui.h("span", { class: "cpp-izoh", text: "sharti — har aylanishdan oldin tekshiriladi" })),
      ui.h("div", { class: "cpp-qolip-qator" },
        ui.h("code", { class: "cpp-kod", html: common.paint("i++") }), ui.h("span", { class: "cpp-izoh", text: "qadami — har aylanishdan keyin bajariladi" }))));
    await ui.say("elder", "Uchalasi ham oʻz joyida boʻlishi kerak. Qadamni unutsang, sikl toʻxtamaydi.");
  }

  async function namoyish() {
    const el = common.box();
    el.append(common.note("Teskari ham yurish mumkin:"));
    common.kodVaChiqish(el,
      C.dastur(["for (int i = 5; i >= 1; i--) {", '    cout << i << " ";', "}", 'cout << "\\n";']),
      ["5 4 3 2 1 "]);
    await ui.say("elder", "i-- — har qadamda bittaga kamayadi. Shart i >= 1 boʻlgani uchun birgacha boradi.");
    const el2 = common.box();
    el2.append(common.note("Sikl ichida yigʻib borish — olimpiadadagi eng koʻp uchraydigan naqsh:"));
    common.kodVaChiqish(el2,
      C.dastur(["int s = 0;", "for (int i = 1; i <= 100; i++) {", "    s += i;", "}", C.chiqar("s")]),
      ["5050"]);
    await ui.say("elder", "Yigʻindi noldan boshlanadi va har qadamda oʻsadi. Koʻpaytma esa birdan boshlanadi.");
  }

  async function stage2() {
    await uchQism();
    await namoyish();
    await ui.say("elder", "Endi oʻzing hisobla — sikl nima chiqaradi?");
    await practice.exercises({
      next: (prev, correct, tier) => L.bosqich2Task(prev, correct, tier),
      run: (task) => common.mashq(task),
      praise: () => "Siklni toʻgʻri aylantirding.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
