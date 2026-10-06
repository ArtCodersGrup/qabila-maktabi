// 3-bosqich: xavfsiz yurish — qalqib chiquvchi oyna ✕ bilan yopiladi; parol va telefon saytga yozilmaydi; qulf belgisi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice, sound, brauzer } = QK;

  // Bola o'zi qiladi: qalqib oynani ✕ bilan yopadi → so'rovchi saytdan «Chiqib ketaman» bilan chiqadi
  async function korsat() {
    const el = common.box(true);
    const br = brauzer.yasa(el, { holat: L.ochiqHolat("oyinlar"), soroq: true });

    br.qalqibKorsat(L.QALQIB[0]);
    await common.yolla(br, (h, api, hodisa) => (hodisa && hodisa.amal === "yop" ? null
      : hodisa && hodisa.amal === "bos" ? "↻ Bu tugma aldaydi — sovgʻa yoʻq. Burchakdagi ✕ ni bos."
        : "Toʻsatdan oyna chiqdi! Ichidagi tugmani bosma — burchakdagi ✕ ni bos."));
    sound.play("correct");
    await ui.say("elder", "✓ Yopding! Bunday oynalar aldaydi: «yutdingiz», «bosing» — ishonma.");

    br.ornat(L.ochiqHolat("sovga"));
    await common.yolla(br, (h, api, hodisa) => (hodisa && (hodisa.amal === "chiq" || hodisa.amal === "orqaga" || hodisa.amal === "och") ? null
      : hodisa && (hodisa.amal === "yoz" || hodisa.amal === "yubor") ? "↻ Yozma! Telefon raqami — sir. «Chiqib ketaman»ni bos."
        : "Bu sayt telefon raqamini soʻrayapti. Hech narsa yozma — «Chiqib ketaman»ni bos."));
    sound.play("correct");
    await ui.say("elder", "✓ Parol va telefonni saytga yozmaymiz. Bunday boʻlsa — kattaga ayt.");
    br.yorit("manzil");
    await ui.say("elder", "Manzil yonidagi qulfga qara: qulf bor — sayt yaxshi. Qulf yoʻq — ehtiyot boʻl.");
    br.toxtat();
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
