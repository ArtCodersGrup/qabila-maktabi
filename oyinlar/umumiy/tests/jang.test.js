// 49-o'yin: jang qoidalari — maydon, yurish, otish, robot qarori.
const test = require("node:test");
const assert = require("node:assert/strict");
const J = require("../js/jang.js");
const py = require("../js/python/python.js");

const bolaMaydon = (opts) => J.maydon(Object.assign({
  tanklar: [J.tank({ id: "bola", x: 100, y: 200, burchak: 0 })],
}, opts));

test("yurish: masofa aniq, chekkada to'xtaydi", () => {
  const m = bolaMaydon();
  const t = m.tanklar[0];
  J.HARAKATLAR.move(m, t, 50);
  assert.deepEqual([t.x, t.y], [150, 200]);
  J.HARAKATLAR.left(m, t, 90);
  J.HARAKATLAR.move(m, t, 30);
  assert.deepEqual([t.x, t.y], [150, 170], "90° burilgandan keyin yuqoriga yuradi");
  // Chekkadan chiqib ketmaydi
  J.HARAKATLAR.move(m, t, 1000);
  assert.equal(t.y, J.R);
  assert.ok(J.ichida(m, t.x, t.y));
});

test("orqaga yurish va burilish burchagi 0–360 oralig'ida", () => {
  const m = bolaMaydon();
  const t = m.tanklar[0];
  J.HARAKATLAR.back(m, t, 40);
  assert.equal(t.x, 60);
  J.HARAKATLAR.right(m, t, 90);
  assert.equal(t.burchak, 270);
  J.HARAKATLAR.left(m, t, 450);
  assert.equal(t.burchak, 360 - 90 + 450 - 360 === 0 ? 0 : (270 + 450) % 360);
  assert.ok(t.burchak >= 0 && t.burchak < 360);
});

test("to'siq: tank ichiga kirmaydi, oldida to'xtaydi", () => {
  const m = bolaMaydon({ tosiqlar: [{ x: 200, y: 150, en: 40, bo: 100 }] });
  const t = m.tanklar[0];
  const r = J.HARAKATLAR.move(m, t, 200);
  assert.ok(r.toxtadi, "to'siqqa tegib to'xtashi kerak");
  assert.ok(t.x < 200 - J.R + 1, "to'siq ichiga kirib ketdi: " + t.x);
  assert.ok(!J.tosiqda(m, t.x, t.y));
});

test("otish: dushmanga tegadi va jon kamayadi", () => {
  const m = J.maydon({ tanklar: [
    J.tank({ id: "bola", x: 100, y: 200, burchak: 0 }),
    J.tank({ id: "robot", x: 300, y: 200, burchak: 180, tur: "robot" }),
  ] });
  const bola = m.tanklar[0];
  const robot = m.tanklar[1];
  // O'q tankning chetiga tegadi: markazlar orasi 200, radius ayiriladi
  assert.equal(J.korish(m, bola), 200 - J.R, "scan() dushmangacha masofani beradi");
  J.HARAKATLAR.fire(m, bola);
  assert.equal(robot.jon, J.JON - 1);
  assert.equal(bola.oq, J.OQ - 1);
  // Uch marta tegsa — yiqiladi
  J.HARAKATLAR.fire(m, bola);
  J.HARAKATLAR.fire(m, bola);
  assert.equal(robot.tirik, false);
  assert.equal(J.holatniTekshir(m), "yutdi");
});

test("o'q tugasa bo'sh bosiladi, reload to'ldiradi", () => {
  const m = bolaMaydon();
  const t = m.tanklar[0];
  for (let k = 0; k < J.OQ; k++) J.HARAKATLAR.fire(m, t);
  assert.equal(t.oq, 0);
  const r = J.HARAKATLAR.fire(m, t);
  assert.equal(r.otdi, false);
  assert.equal(m.yozuv[m.yozuv.length - 1].t, "bosh");
  J.HARAKATLAR.reload(m, t);
  assert.equal(t.oq, J.OQ);
});

test("to'siq o'qni to'xtatadi", () => {
  const m = J.maydon({ tanklar: [
    J.tank({ id: "bola", x: 100, y: 200, burchak: 0 }),
    J.tank({ id: "robot", x: 400, y: 200, tur: "robot" }),
  ], tosiqlar: [{ x: 250, y: 150, en: 20, bo: 100 }] });
  assert.equal(J.korish(m, m.tanklar[0]), -1, "to'siq ortidagi dushman ko'rinmasligi kerak");
  J.HARAKATLAR.fire(m, m.tanklar[0]);
  assert.equal(m.tanklar[1].jon, J.JON, "o'q to'siqda to'xtashi kerak");
});

test("scan(): qarshisida hech kim bo'lmasa −1", () => {
  const m = bolaMaydon();
  assert.equal(J.korish(m, m.tanklar[0]), -1);
});

// Robot qarori sof funksiya: bir xil holatda bir xil javob
test("robot: burilib, ko'rsa otadi; o'qi tugasa to'ldiradi", () => {
  const m = J.maydon({ tanklar: [
    J.tank({ id: "bola", x: 100, y: 200 }),
    J.tank({ id: "robot", x: 300, y: 200, burchak: 0, tur: "robot", aql: "posbon" }),
  ] });
  const robot = m.tanklar[1];
  const q1 = J.robotHarakati(m, robot);
  assert.ok(q1.nom === "left" || q1.nom === "right", "bolaga qarab burilishi kerak: " + JSON.stringify(q1));
  robot.burchak = 180; // endi bolaga qaragan
  assert.deepEqual(J.robotHarakati(m, robot), { nom: "fire" });
  robot.oq = 0;
  assert.deepEqual(J.robotHarakati(m, robot), { nom: "reload" });
  // Bir xil holat — bir xil qaror
  robot.oq = 2;
  assert.deepEqual(J.robotHarakati(m, robot), J.robotHarakati(m, robot));
});

test("ovchi robot yaqinlashadi, posbon joyida turadi", () => {
  const yasa = (aql) => J.maydon({ tanklar: [
    J.tank({ id: "bola", x: 100, y: 200 }),
    J.tank({ id: "robot", x: 500, y: 200, burchak: 180, tur: "robot", aql }),
  ], tosiqlar: [{ x: 280, y: 150, en: 20, bo: 100 }] });
  const ovchi = yasa("ovchi");
  assert.deepEqual(J.robotHarakati(ovchi, ovchi.tanklar[1]), { nom: "move", arg: 20 });
  const posbon = yasa("posbon");
  assert.deepEqual(J.robotHarakati(posbon, posbon.tanklar[1]), { nom: "reload" }, "posbon joyidan jilmaydi");
});

// O'yinning asosiy da'vosi: bola yozgan Python kodi jangni boshqaradi
test("Python kodi maydonni boshqaradi va yozuv qoladi", () => {
  const m = J.maydon({ tanklar: [
    J.tank({ id: "bola", x: 100, y: 200, burchak: 0 }),
    J.tank({ id: "robot", x: 300, y: 200, tur: "robot" }),
  ] });
  const { fn, holat } = J.tashqiFunksiyalar(m, "bola");
  const r = py.run("if scan() > 0:\n    fire()\n    fire()\nprint(ammo())", { tashqi: fn });
  assert.equal(r.error, null);
  assert.deepEqual(r.output, ["1"]);
  assert.equal(m.tanklar[1].jon, 1);
  assert.equal(holat.soni, 2);
  assert.equal(m.yozuv.filter((y) => y.t === "oq").length, 2);
});

test("bitta satrda harakatlar chegarasi bor", () => {
  const m = bolaMaydon();
  const { fn, holat } = J.tashqiFunksiyalar(m, "bola");
  const r = py.run("for i in range(50):\n    move(5)", { tashqi: fn });
  assert.equal(r.error, null);
  assert.equal(holat.chegaraOshdi, true);
  assert.equal(m.yozuv.filter((y) => y.t === "yur").length, J.MAX_HARAKAT, "chegaradan keyin bajarilmasligi kerak");
});

test("sikl va shart ishlaydi: kvadrat bo'ylab yurish", () => {
  const m = bolaMaydon();
  const { fn } = J.tashqiFunksiyalar(m, "bola", 20);
  const r = py.run("for i in range(4):\n    move(30)\n    right(90)", { tashqi: fn });
  assert.equal(r.error, null);
  const t = m.tanklar[0];
  assert.deepEqual([t.x, t.y], [100, 200], "kvadrat bo'ylab aylanib, boshlang'ich nuqtaga qaytadi");
  assert.equal(t.burchak, 0);
});

test("jang tugagach harakatlar bajarilmaydi", () => {
  const m = J.maydon({ tanklar: [
    J.tank({ id: "bola", x: 100, y: 200, burchak: 0 }),
    J.tank({ id: "robot", x: 300, y: 200, tur: "robot", jon: 1 }),
  ] });
  const { fn } = J.tashqiFunksiyalar(m, "bola");
  py.run("fire()\nmove(50)", { tashqi: fn });
  assert.equal(m.tugadi, "yutdi");
  assert.equal(m.tanklar[0].x, 100, "yutgandan keyin yurmasligi kerak");
});

test("robotlar navbati: bola yurgandan keyin ular ham harakat qiladi", () => {
  const m = J.maydon({ tanklar: [
    J.tank({ id: "bola", x: 100, y: 200 }),
    J.tank({ id: "robot", x: 300, y: 200, burchak: 180, tur: "robot", aql: "posbon" }),
  ] });
  J.robotlarYursin(m);
  assert.equal(m.tanklar[0].jon, J.JON - 1, "robot otishi kerak edi");
  assert.equal(m.yozuv.some((y) => y.t === "oq" && y.id === "robot"), true);
});
