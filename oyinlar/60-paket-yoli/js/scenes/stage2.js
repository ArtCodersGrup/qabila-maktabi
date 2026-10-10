// 2-bosqich: sim uzildi — internet to'xtamaydi, boshqa yo'l topiladi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function korsat() {
    let t; let j; let uzilgan; let yangi;
    for (;;) {
      t = L.tor(Math.random);
      j = L.juft(t, Math.random, 3, 4);
      if (!j) continue;
      const yol = L.bfs(t.simlar, j[0], j[1]).yol;
      uzilgan = L.sim(yol[1], yol[2]);
      yangi = L.bfs(t.simlar.filter((s) => s !== uzilgan), j[0], j[1]);
      if (yangi.masofa > 0) break;
    }
    const [a, b] = j;
    const eski = L.bfs(t.simlar, a, b);
    const host = common.box(true);
    host.append(common.tor(t, { a, b, yol: eski.yol }), common.izoh());
    await ui.say("elder", `Eng qisqa yoʻl — ${eski.masofa} qadam (yashil). Endi bitta sim uziladi.`);
    host.innerHTML = "";
    host.append(common.tor(t, { a, b, uzilgan: [uzilgan], yol: yangi.yol }), common.izoh());
    await ui.say("elder", `${L.simNomi(uzilgan)} simi uzildi, lekin paket toʻxtamadi: yangi marshrut — ${yangi.masofa} qadam.`);
    await ui.say("elder", `Tarmoqda yoʻllar zaxirasi bor, shuning uchun bitta uzilish aloqani toʻxtatmaydi. Mashq: ${QK.practice.need()} ta savol.`);
  }

  async function stage2() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich2Task(Math.random, prev, togri, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
