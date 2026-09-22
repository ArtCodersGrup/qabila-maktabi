// Robot o'yinchilar: o'yin qoidalarini sinfdan oldin sinash uchun (DIZAYN 6).
// Har robotning o'z tezligi (bitta savolga necha soniya) va xato ehtimoli bor.
const T = require("../js/tog.js");

// Urug'li tasodif (mulberry32) — natija har safar bir xil
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Bitta o'yin: n ta robot, har biri o'z tezligida javob beradi.
// Natija: o'yin necha soniya davom etdi, kim g'olib, nechta bola chiqib ketdi va qachon.
function simulate({ tog, n = 12, rng: r = Math.random, step = 250, opt = {} }) {
  const t = T.togById(tog);
  const players = Array.from({ length: n }, (_, k) => ({ id: "p" + k, qahramon: T.QAHRAMONLAR[k % 12].id }));
  // Tezlik: 6–20 soniya; xato ehtimoli: 5–40%. Qiyin savol sekinroq va xato ko'proq.
  const robots = players.map((p) => ({
    id: p.id,
    tezlik: 6000 + r() * 14000,
    xato: 0.05 + r() * 0.35,
    keyingi: 500 + r() * 3000,
  }));
  const s = T.create(Object.assign({ tog: t.id, players, now: 0 }, opt));
  let birinchiChiqish = null;
  let qolgan60 = n;

  for (let now = 0; !s.tugadi && now <= t.daqiqa * 60000; now += step) {
    for (const bot of robots) {
      const p = s.oyinchilar[bot.id];
      if (p.chiqdi || now < bot.keyingi) continue;
      if (!T.javobBeraOladi(s, bot.id, now)) continue;
      const daraja = T.daraja(t, p.pogona);
      const sekinlik = 1 + (daraja - 1) * 0.35; // qiyin savol sekinroq
      const xato = bot.xato * (1 + (daraja - 1) * 0.3);
      T.javob(s, bot.id, r() > xato, now);
      bot.keyingi = now + bot.tezlik * sekinlik * (0.8 + r() * 0.4);
      if (s.tugadi) break;
    }
    T.tekshir(s, now);
    const chiqqan = Object.values(s.oyinchilar).filter((p) => p.chiqdi).length;
    if (birinchiChiqish === null && chiqqan > 0) birinchiChiqish = now / 1000;
    if (now <= 60000) qolgan60 = n - chiqqan;
    if (s.tugadi) {
      const pogonalar = Object.values(s.oyinchilar).map((p) => p.pogona);
      return {
        sekund: Math.round(now / 1000),
        golib: s.golib,
        sabab: s.sabab,
        chiqqan,
        qolgan60,
        birinchiChiqish: birinchiChiqish === null ? Infinity : birinchiChiqish,
        engPastPogona: Math.min(...pogonalar),
        engBaland: Math.max(...pogonalar),
      };
    }
  }
  // Vaqt tugadi
  T.tekshir(s, t.daqiqa * 60000);
  const pogonalar = Object.values(s.oyinchilar).map((p) => p.pogona);
  return {
    sekund: t.daqiqa * 60,
    golib: s.golib,
    sabab: s.sabab,
    chiqqan: Object.values(s.oyinchilar).filter((p) => p.chiqdi).length,
    qolgan60,
    birinchiChiqish: birinchiChiqish === null ? Infinity : birinchiChiqish,
    engPastPogona: Math.min(...pogonalar),
    engBaland: Math.max(...pogonalar),
  };
}

module.exports = { simulate, rng };
