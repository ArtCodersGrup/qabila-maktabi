// Robot yozuvchilar: poyga qoidalarini sinfdan oldin tekshirish uchun.
// Har robot o'z tezligi (belgi/daqiqa) va xato ehtimoli bilan "yozadi"; xato belgini o'tkazmaydi,
// faqat vaqt oladi — haqiqiy o'yindagidek. Vaqt virtual, hech narsa kutilmaydi.
const P = require("../js/poyga.js");
const T = require("../../tog/js/tog.js");

const QADAM = 100; // simulyatsiya qadami (ms)

function robotlar(n, rng) {
  return Array.from({ length: n }, (_, k) => ({
    id: "r" + k,
    qahramon: T.QAHRAMONLAR[k % T.QAHRAMONLAR.length].id,
    cpm: 50 + Math.floor(rng() * 170), // 50–220 belgi/daqiqa
    xato: 0.02 + rng() * 0.13, // 2–15 % xato
  }));
}

// Bitta poygani boshidan oxirigacha o'ynab chiqadi
function poyga({ robots, jami, tur = "words", urug = 1, rng, chegara = 10 * 60000 }) {
  const s = P.holatYarat({ tur, urug, jami });
  robots.forEach((r) => P.qoshil(s, r.id, r.qahramon));
  P.boshla(s, 0);
  const holat = new Map(robots.map((r) => [r.id, { bel: 0, pog: 0, qoldiq: 0, urinish: 0 }]));
  let xabarlar = 0;
  let t = 0;

  while (!P.hammasiTugadi(s) && t < chegara) {
    t += QADAM;
    for (const r of robots) {
      const h = holat.get(r.id);
      if (h.bel >= jami) continue;
      h.qoldiq += (QADAM * r.cpm) / 60000;
      while (h.qoldiq >= 1 && h.bel < jami) {
        h.qoldiq -= 1;
        h.urinish++;
        if (rng() < r.xato) continue; // xato: belgi o'tmaydi, vaqt ketadi
        h.bel++;
      }
      const pog = P.pogonaOf(h.bel, jami, s.pogona);
      if (pog === h.pog) continue;
      h.pog = pog;
      const tugadi = h.bel >= jami;
      P.qadam(s, r.id, {
        bel: h.bel,
        ms: tugadi ? t : 0,
        cpm: tugadi ? Math.round((h.bel * 60000) / t) : 0,
        aniq: tugadi ? Math.floor((h.bel * 100) / h.urinish) : 0,
      }, t);
      xabarlar++;
    }
  }
  if (P.hammasiTugadi(s)) P.tugat(s, t);
  return { s, vaqt: t, xabarlar };
}

module.exports = { robotlar, poyga, QADAM };
