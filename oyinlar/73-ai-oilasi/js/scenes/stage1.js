// Kirish va 1-bosqich: qoida qo‘lda yoziladimi yoki ma‘lumotdan topiladimi (spam filtri misolida).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  // Olti xat: havolalar soni va haqiqiy holat. Eng yaxshi chegara — N = 2 (6 tadan 6)
  const XATLAR = [
    { qiymat: 3, asl: true }, { qiymat: 0, asl: false }, { qiymat: 6, asl: true },
    { qiymat: 2, asl: false }, { qiymat: 1, asl: false }, { qiymat: 4, asl: true },
  ];

  async function intro() {
    const el = common.box(false);
    el.append(h("div", { class: "story-art wide", html: QK.gameArt.halqalar() }));
    await ui.say("elder", "Maqsad: sunʼiy intellekt (artificial intelligence, AI) oilasini ajratish — ML, DL va kompyuter koʻrishi.");
    await ui.say("elder", "Kalit gʻoya: oddiy dasturda qoidani odam yozadi, oʻrganadigan tizimda qoida maʼlumotdan topiladi.");
  }

  async function korsat() {
    let el = common.box(true);
    el.append(common.savol("Spam filtri qoidasi: «xatda N tadan koʻp havola boʻlsa — spam»."));
    ui.bubble("elder", "Qoidani qoʻlda yoz: N nechaga teng boʻlsin? Maʼlumotni hali koʻrmading.");
    const n = await ui.choice([1, 3, 5].map((v) => ({ label: `N = ${v}`, value: v })));
    let jadval = common.jadval(XATLAR, "spam", { n });
    el.append(jadval);
    await ui.say("elder", `Mana 6 ta haqiqiy xat. N = ${n} qoidasi 6 tadan ${L.togriSoni(XATLAR, n)} tasida toʻgʻri — chegara taxmin bilan yozilgan edi.`);

    ui.bubble("elder", "Endi chegarani dastur shu maʼlumotdan oʻzi tanlasin.");
    await ui.choice([{ label: "Maʼlumotdan oʻrgatish", value: "ok" }]);
    QK.sound.play("tap");
    const ballar = [0, 1, 2, 3, 4, 5].map((v) => ({ v, ball: L.togriSoni(XATLAR, v) }));
    const eng = ballar.reduce((a, b) => (b.ball > a.ball ? b : a));
    el.append(h("div", { class: "ao-sinov" }, ...ballar.map((b) => h("span", { class: "ao-chip" + (b === eng ? " eng" : ""), text: `N = ${b.v}: ${b.ball}/6` }))));
    const yangi = common.jadval(XATLAR, "spam", { n: eng.v });
    jadval.replaceWith(yangi);
    jadval = yangi;
    await ui.say("elder", `✓ Dastur har N ni sinab koʻrdi va eng yaxshisini tanladi: N = ${eng.v} da 6 tadan ${eng.ball} tasi toʻgʻri.`);

    el = common.box(true);
    common.formula(el, [
      "Qoidani odam yozgan → qoidaga asoslangan dastur",
      "Qoida maʼlumotdan topilgan → mashinali oʻrganish (machine learning, ML)",
    ]);
    await ui.say("elder", "Atama: qoidani maʼlumotdan topish — mashinali oʻrganish (machine learning, ML). Bugungi AI tizimlarining koʻpi shunday qurilgan.");
    await ui.say("elder", `Cheklov: maʼlumot kam yoki bir tomonlama boʻlsa, oʻrganilgan qoida ham xato chiqadi. Mashq: ${QK.practice.need()} ta savol.`);
  }

  async function stage1() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich1Task(prev, Math.random, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
