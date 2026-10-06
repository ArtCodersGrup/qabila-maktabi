// 3-bosqich: «Galereya» — ko'rsatish: ataylab noto'g'ri chizib, «Bekor» (Ctrl+Z) bilan qaytarish;
// keyin bola namunani o'zi tanlaydi (daraxt, quyosh, mashina, kema, robot) va qadam-qadam chizadi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice, sound } = QK;

  const TANLOV = ["daraxt", "quyosh", "mashina", "kema", "robot"];

  // Bola quyosh ustiga ataylab chizadi, keyin bekor qiladi — rasm qaytadi
  async function korsat() {
    const host = common.box(true);
    host.append(common.savol("Xato va «Bekor»"));
    const quyosh = L.namunaById("quyosh");
    let kutilgan = "chizish";
    let done = null;
    const t = common.taxtaQoy(host, {
      taxta: L.namunaTaxta(quyosh, 2),
      amallar: ["bekor", "qaytar"],
      onHarakat(hr) {
        if (kutilgan === "chizish" && !L.TARIX_AMAL.includes(hr.asbob)) { kutilgan = "bekor"; done(); return; }
        if (kutilgan === "bekor" && hr.asbob === "bekor") { kutilgan = null; done(); }
      },
    });
    const tezkor = !ui.touchOnly();
    const kut = () => ui.settle((d) => { done = d; });
    ui.bubble("elder", "Quyosh ustiga ataylab notoʻgʻri narsa chiz. Keyin uni qaytaramiz.");
    await kut();
    sound.play("tak");
    t.yorit("amal", "bekor");
    ui.bubble("elder", tezkor ? "Endi Ctrl+Z ni bos (yoki «Bekor» tugmasini)." : "Endi «Bekor» tugmasini bos.");
    await kut();
    sound.play("correct");
    t.qulfla(true);
    await ui.say("elder", tezkor
      ? "✓ Qaytdi! Ctrl+Z — bekor, Ctrl+Y — qaytar, Ctrl+S — saqlash."
      : "✓ Qaytdi! Xato — qoʻrqinchli emas, «Bekor» bor.");
    await ui.say("elder", "Endi oʻzing rasm tanla va qadam-qadam chiz.");
  }

  async function stage3() {
    await korsat();
    const id = await common.namunaTanla(TANLOV, "Qaysi rasmni chizamiz?");
    const namuna = L.namunaById(id);
    const qiyin = practice.isHard();
    const { savolEl, t } = common.darsTaxtasi();
    const dars = common.qadamDars(t, savolEl);
    await practice.exercises({
      need: namuna.qadamlar.length,
      next: (prev, togri) => L.qadamTask(namuna, togri, qiyin),
      run: (task) => dars.run(task),
      praise: (task) => dars.praise(task),
    });
    dars.yop();
    ui.bubble("elder", `✓ ${namuna.nom} tayyor! Zoʻr rassom ekansan.`);
    await ui.choice([{ label: "Davom ▶︎", value: "ok" }]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
