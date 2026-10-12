// 3-bosqich: tozalash — boʻsh qiymat, takror qator, imkonsiz qiymat, har xil yozuv.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  const USTUNLAR = [{ nom: "Ism" }, { nom: "Yosh" }, { nom: "Shahar" }, { nom: "Baho (1–5)" }];
  const QATORLAR = [
    ["Aziz", 15, "Toshkent", 4],
    ["Dilnoza", 250, "Samarqand", 5],
    ["Bobur", 14, "toshkent", 3],
    ["Malika", 15, "Toshkent", ""],
    ["Aziz", 15, "Toshkent", 4],
    ["Sardor", 16, "Buxoro", 4],
  ];
  // Yoʻl-yoʻriq bilan topiladigan toʻrt xato (q, u — 0 dan)
  const QADAMLAR = [
    { topshiriq: "Soʻrovnoma jadvalida 4 ta xato bor. Birinchisi: qiymati yoʻq katakni bos.", kalit: ["k:3:3"], x: { tur: "bosh", q: 3, u: 3 }, ishora: "↻ Bu katakda qiymat bor. Ichi boʻsh katakni qidir." },
    { topshiriq: "✓ Boʻsh qiymat. Endi boʻlishi mumkin emas sonni top.", kalit: ["k:1:1"], x: { tur: "imkonsiz", q: 1, u: 1 }, ishora: "↻ Bu qiymat boʻlishi mumkin. Har sonni oʻz ustuni bilan solishtir: odam shuncha yashaydimi?" },
    { topshiriq: "✓ Imkonsiz qiymat. Endi bitta shahar boshqacha yozilgan — uni top.", kalit: ["k:2:2"], x: { tur: "yozuv", q: 2, u: 2 }, ishora: "↻ «Shahar» ustunini harfma-harf oʻqi: bosh harflarga qara." },
    { topshiriq: "✓ Har xil yozuv. Oxirgisi: ikki qator bir xil. Ortiqchasining raqamini (№) bos.", kalit: ["q:4", "q:0"], x: { tur: "takror", q: 4, asl: 0 }, ishora: "↻ Hamma kataklari bir xil boʻlgan ikki qatorni top va bittasining raqamini bos." },
  ];

  async function korsat() {
    const el = common.box(true);
    let n = 0;
    let j = null;
    ui.bubble("elder", QADAMLAR[0].topshiriq);
    await ui.settle((done) => {
      const bos = (kalit) => {
        if (n >= QADAMLAR.length) return;
        const q = QADAMLAR[n];
        if (!q.kalit.includes(kalit)) {
          QK.sound.play("retry");
          ui.bubble("elder", q.ishora);
          return;
        }
        QK.sound.play("correct");
        common.xatoBelgila(j, q.x, "xato");
        n++;
        if (n === QADAMLAR.length) done();
        else ui.bubble("elder", QADAMLAR[n].topshiriq);
      };
      j = common.jadval({
        nom: "Soʻrovnoma", ustunlar: USTUNLAR, qatorlar: QATORLAR, raqam: true,
        onKatak: (q, u) => bos(`k:${q}:${u}`),
        onQator: (q) => bos(`q:${q}`),
      });
      el.append(j.el);
    });
    j.qulfla();
    el.append(common.formula([
      `${L.XATO_NOMI.bosh} (missing value) · ${L.XATO_NOMI.takror} (duplicate)`,
      `${L.XATO_NOMI.imkonsiz} · ${L.XATO_NOMI.yozuv}`,
    ]));
    await ui.say("elder", "✓ Takror qator. Tozalanmagan jadvalda oʻrtacha yosh 54 dan oshib ketardi va «toshkent» alohida shahar boʻlib sanalardi.");
    await ui.say("elder", `Tozalash — xatoni tuzatish. Natijaga yoqmagan toʻgʻri qatorni oʻchirish esa soxtalashtirishdir. Mashq: ${practice.need()} ta jadval.`);
  }

  async function stage3() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich3Task(prev, Math.random, tier, togri),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
