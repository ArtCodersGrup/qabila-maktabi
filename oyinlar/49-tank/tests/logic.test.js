// 49-o'yin: vazifalar — har birining yechimi bor va qoida buzilmaydi.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const J = require("../../umumiy/js/jang.js");
const py = require("../../umumiy/js/python/python.js");

const bajar = (m, satrlar) => {
  const natijalar = [];
  for (const s of satrlar) natijalar.push(L.satrniBajar(m, s, py));
  return natijalar;
};

test("boshqaruv vazifalari yechiladi", () => {
  const yechim = {
    togri: ["move(320)"],
    burilish: ["left(90)", "move(240)"],
    tosiq: ["left(90)", "move(100)", "right(90)", "move(400)", "right(90)", "move(100)"],
  };
  for (const v of L.VAZIFALAR.boshqaruv) {
    const m = v.maydon();
    const natijalar = bajar(m, yechim[v.id]);
    for (const n of natijalar) assert.equal(n.xato, null, v.id + ": " + (n.xato && n.xato.text));
    assert.equal(L.bajarildi("boshqaruv", m), true, v.id + ": belgiga yetmadi (" + m.tanklar[0].x + "," + m.tanklar[0].y + ")");
  }
});

test("nishon vazifalari yechiladi", () => {
  const yechim = {
    qarshida: ["fire()"],
    yonda: ["left(90)", "fire()"],
    "tosiq-orqasida": ["left(90)", "move(90)", "right(90)", "move(300)", "right(90)", "move(90)", "left(90)", "fire()"],
  };
  for (const v of L.VAZIFALAR.nishon) {
    const m = v.maydon();
    const natijalar = bajar(m, yechim[v.id]);
    for (const n of natijalar) assert.equal(n.xato, null, v.id + ": " + (n.xato && n.xato.text));
    assert.equal(L.bajarildi("nishon", m), true, v.id + ": nishon yiqilmadi");
  }
});

test("jang: oddiy strategiya bilan posbon yengiladi", () => {
  const v = L.VAZIFALAR.jang[0];
  const m = v.maydon();
  // Bola: dushmanga qarab turib, ko'rinsa otadi, o'qi tugasa to'ldiradi
  for (let navbat = 0; navbat < 20 && !m.tugadi; navbat++) {
    L.satrniBajar(m, "if ammo() == 0:\n    reload()\nelif scan() > 0:\n    fire()\nelse:\n    move(30)", py);
  }
  assert.equal(m.tugadi, "yutdi", "20 navbatda yengishi kerak edi");
  assert.equal(L.bajarildi("jang", m), true);
});

// Har jang vazifasi yechiladigan bo'lishi kerak — namunali strategiya bilan tekshiriladi
test("uchala jang ham namunali strategiya bilan yutiladi", () => {
  const strategiya = "left(radar())\nif ammo() == 0:\n    reload()\nelif scan() > 0:\n    fire()\nelse:\n    move(40)";
  for (let k = 0; k < L.VAZIFALAR.jang.length; k++) {
    const m = L.VAZIFALAR.jang[k].maydon();
    let navbat = 0;
    while (!m.tugadi && navbat < 30) {
      L.satrniBajar(m, strategiya, py);
      navbat++;
    }
    assert.equal(m.tugadi, "yutdi", L.VAZIFALAR.jang[k].id + ": " + navbat + " navbatda yutilmadi");
    assert.ok(m.tanklar[0].jon > 0, L.VAZIFALAR.jang[k].id);
  }
});

test("radar(): eng yaqin dushmanga burchak beradi", () => {
  const m = L.VAZIFALAR.jang[2].maydon();
  const bola = m.tanklar[0];
  const burchak = J.radarBurchagi(m, bola);
  assert.ok(burchak >= -180 && burchak <= 180);
  // Shu burchakka burilsa — radar nolga yaqin bo'ladi
  J.HARAKATLAR.left(m, bola, burchak);
  assert.ok(Math.abs(J.radarBurchagi(m, bola)) <= 1, "burilgandan keyin radar ≈ 0 boʻlishi kerak");
  // Dushman qolmasa — 0
  for (const t of m.tanklar.slice(1)) t.tirik = false;
  assert.equal(J.radarBurchagi(m, bola), 0);
});

test("jang: hech narsa qilmasa, robot bolani yiqitadi", () => {
  const m = L.VAZIFALAR.jang[0].maydon();
  m.tanklar[0].x = 440; // robot ko'radigan joyga qo'yamiz
  m.tanklar[0].y = 200;
  for (let k = 0; k < 10 && !m.tugadi; k++) L.satrniBajar(m, "reload()", py);
  assert.equal(m.tugadi, "yutqazdi");
  assert.equal(L.yutqazdi(m), true);
});

test("har vazifada matn, ishora va ruxsat etilgan buyruqlar bor", () => {
  for (const [bosqich, list] of Object.entries(L.VAZIFALAR)) {
    assert.ok(list.length >= 3, bosqich);
    for (const v of list) {
      assert.ok(v.matn.length > 15, v.id);
      assert.ok(v.ishora.length > 15, v.id);
      assert.ok(v.buyruqlar.length >= 2, v.id);
      const m = v.maydon();
      assert.ok(m.tanklar[0].id === "bola", v.id);
      assert.ok(J.bosh(m, m.tanklar[0].x, m.tanklar[0].y), v.id + ": tank toʻsiq ichida turibdi");
      for (const t of m.tanklar) assert.ok(J.ichida(m, t.x, t.y), v.id + ": " + t.id + " maydondan tashqarida");
      if (m.belgi) assert.ok(J.bosh(m, m.belgi.x, m.belgi.y), v.id + ": belgi toʻsiq ichida");
      if (m.nishon) assert.ok(J.ichida(m, m.nishon.x, m.nishon.y), v.id + ": nishon tashqarida");
    }
  }
});

test("xato kod maydonni buzmaydi", () => {
  const m = L.VAZIFALAR.boshqaruv[0].maydon();
  const oldin = { x: m.tanklar[0].x, y: m.tanklar[0].y };
  const r = L.satrniBajar(m, "move(", py);
  assert.ok(r.xato, "sintaksis xatosi tutilishi kerak");
  assert.deepEqual({ x: m.tanklar[0].x, y: m.tanklar[0].y }, oldin);
  const r2 = L.satrniBajar(m, "fly(10)", py);
  assert.equal(r2.xato.type, "NameError");
});

test("vazifa(): chegaradan oshsa oxirgisini beradi", () => {
  assert.equal(L.vazifa("jang", 0).id, "posbon");
  assert.equal(L.vazifa("jang", 99).id, "ikkita");
});

test("ko'rinadigan matnlarda to'g'ri tutuq belgisi", () => {
  for (const list of Object.values(L.VAZIFALAR)) {
    for (const v of list) {
      assert.ok(!/['’`´]/.test(v.matn), v.matn);
      assert.ok(!/['’`´]/.test(v.ishora), v.ishora);
    }
  }
});
