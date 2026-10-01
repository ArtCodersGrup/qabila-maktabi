// 2-bosqich: o'zgaruvchi, tur va kirish (cin).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, cpp: C, logic: L, common, practice } = QK;

  // Tur oldin aytiladi — Pythonda bunday emas
  async function turlar() {
    const el = common.box();
    el.append(common.note("Oʻzgaruvchi eʼlon qilinganda turi ham aytiladi:"));
    el.append(common.ikkiTil("x = 5\nnom = \"Anvar\"", 'int x = 5;\nstring nom = "Anvar";'));
    await ui.say("elder", "int — butun son, string — matn, double — kasr son.");
    await ui.say("apprentice", "Pythonda turni yozmas edim-ku.");
    await ui.say("elder", "Python turini oʻzi topadi. C++ esa turni oldindan bilib oladi — shuning uchun tez ishlaydi.");
    const el2 = common.box();
    el2.append(common.note("Hisob ham shunday:"));
    common.kodVaChiqish(el2,
      C.dastur(["int a = 8;", "int b = 5;", C.chiqar('a << " + " << b << " = " << a + b')]),
      ["8 + 5 = 13"]);
    await ui.say("elder", "Qoʻshtirnoq ichidagisi — matn, tashqarisidagisi — hisob. Bu Pythondagidek.");
  }

  // cin: tur ma'lum, shuning uchun int() kerak emas
  async function kirish() {
    const el = common.box();
    el.append(common.note("Maʼlumotni cin oʻqiydi:"));
    common.kodVaChiqish(el,
      C.dastur(["int a, b;", "cin >> a >> b;", C.chiqar("a + b")]),
      ["30"], ["12 18"]);
    await ui.say("elder", "Pythonda bu x = int(input()) edi — matnni songa aylantirish kerak boʻlardi.");
    await ui.say("elder", "C++ da esa a ning turi int ekani allaqachon aytilgan. cin oʻzi songa oʻgiradi.");
    const el2 = common.box(false);
    el2.append(common.karta(C.JADVAL.slice(0, 4)));
    await ui.say("elder", "Shu jadval — blokning kaliti. Chapda Python, oʻngda C++.");
  }

  async function stage2() {
    await turlar();
    await kirish();
    await ui.say("elder", "Endi kodni oʻzing yozasan: qolip tayyor, faqat oʻrtasini toʻldir.");
    await ui.say("elder", "Yozgach ▶︎ ni bos — dastur shu yerda ishga tushadi.");
    await practice.exercises({
      next: (prev, correct) => L.bosqich2Task(prev, correct),
      run: (task) => common.mashq(task),
      praise: (task) => (task.tur === "natija" ? "cin ni toʻgʻri oʻqiding."
        : task.tur === "yoz" ? "Dasturing ishladi!" : "Eʼlon shunday yoziladi."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
