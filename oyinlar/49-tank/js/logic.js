// 49-o'yin: bosqichlar va vazifalar (sof mantiq). Jang qoidalari — js/jang.js da.
(function (root) {
  "use strict";

  const J = (root.QK && root.QK.jang) || require("../../umumiy/js/jang.js");

  const tank = (o) => J.tank(o);

  // Har vazifa: maydonni yasaydi, maqsadni tekshiradi va ruxsat etilgan buyruqlarni aytadi
  const VAZIFALAR = {
    boshqaruv: [
      {
        id: "togri",
        matn: "Tankni koʻk belgigacha olib bor.",
        buyruqlar: ["move", "back"],
        maydon: () => Object.assign(J.maydon({ tanklar: [tank({ id: "bola", x: 100, y: 200, burchak: 0 })] }),
          { belgi: { x: 420, y: 200 } }),
        ishora: "Belgi oʻngda, tank ham oʻngga qaragan: move(320) yetarli.",
      },
      {
        id: "burilish",
        matn: "Belgi yuqorida — avval burilish kerak.",
        buyruqlar: ["move", "left", "right"],
        maydon: () => Object.assign(J.maydon({ tanklar: [tank({ id: "bola", x: 150, y: 330, burchak: 0 })] }),
          { belgi: { x: 150, y: 90 } }),
        ishora: "left(90) tankni yuqoriga qaratadi, keyin move(240).",
      },
      {
        id: "tosiq",
        matn: "Toʻsiqni aylanib oʻtib, belgiga yet.",
        buyruqlar: ["move", "left", "right"],
        maydon: () => Object.assign(J.maydon({
          tanklar: [tank({ id: "bola", x: 80, y: 200, burchak: 0 })],
          tosiqlar: [{ x: 250, y: 120, en: 60, bo: 160 }],
        }), { belgi: { x: 480, y: 200 } }),
        ishora: "Toʻsiq oʻrtada: yuqoridan yoki pastdan aylanib oʻt — bir necha satr yoz.",
      },
    ],
    nishon: [
      {
        id: "qarshida",
        matn: "Nishon qarshingda. Avval scan() bilan masofani oʻlchab koʻr, keyin ot.",
        buyruqlar: ["move", "fire", "scan"],
        maydon: () => J.maydon({
          tanklar: [tank({ id: "bola", x: 100, y: 200, burchak: 0 })],
          nishon: { x: 380, y: 200, r: 18, tirik: true },
        }),
        ishora: "scan() masofani beradi. Nishon koʻrinsa — fire().",
      },
      {
        id: "yonda",
        matn: "Nishon yon tomonda — burilib ot.",
        buyruqlar: ["move", "left", "right", "fire", "scan"],
        maydon: () => J.maydon({
          tanklar: [tank({ id: "bola", x: 300, y: 330, burchak: 0 })],
          nishon: { x: 300, y: 100, r: 18, tirik: true },
        }),
        ishora: "Nishon tepada: left(90) dan keyin scan() manfiy boʻlmasligi kerak.",
      },
      {
        id: "tosiq-orqasida",
        matn: "Nishon toʻsiq ortida. Oʻrin almashtirmasdan urolmaysan.",
        buyruqlar: ["move", "left", "right", "fire", "scan"],
        maydon: () => J.maydon({
          tanklar: [tank({ id: "bola", x: 100, y: 200, burchak: 0 })],
          tosiqlar: [{ x: 250, y: 160, en: 50, bo: 80 }],
          nishon: { x: 450, y: 200, r: 18, tirik: true },
        }),
        ishora: "Avval yuqoriga yoki pastga sur, keyin nishonga qarab burilib ot.",
      },
    ],
    jang: [
      {
        id: "posbon",
        matn: "Qarshingda posbon tank: joyidan jilmaydi, lekin koʻrsa otadi.",
        buyruqlar: ["move", "back", "left", "right", "fire", "reload", "scan", "radar", "hp", "ammo"],
        maydon: () => J.maydon({
          tanklar: [
            tank({ id: "bola", x: 100, y: 200, burchak: 0, jon: 5 }),
            tank({ id: "robot", x: 450, y: 200, burchak: 180, tur: "robot", aql: "posbon", uzoq: 220 }),
          ],
          tosiqlar: [{ x: 280, y: 60, en: 40, bo: 90 }],
        }),
        ishora: "U 220 birlikdan uzoqni koʻrmaydi, sen esa 300 ni koʻrasan — uzoqdan tur va ot. Oʻq tugasa reload().",
      },
      {
        id: "ovchi",
        matn: "Bu robot yaqinlashib keladi. Masofani oʻzing boshqar.",
        buyruqlar: ["move", "back", "left", "right", "fire", "reload", "scan", "radar", "hp", "ammo"],
        maydon: () => J.maydon({
          tanklar: [
            tank({ id: "bola", x: 100, y: 200, burchak: 0, jon: 5 }),
            tank({ id: "robot", x: 500, y: 200, burchak: 180, tur: "robot", aql: "ovchi", uzoq: 220 }),
          ],
          tosiqlar: [{ x: 300, y: 250, en: 80, bo: 40 }],
        }),
        ishora: "radar() dushmanga burchakni beradi: left(radar()) uni nishonga qaratadi. Keyin scan() tekshiradi.",
      },
      {
        id: "ikkita",
        matn: "Ikkita robot: biri posbon, biri ovchi. Ikkalasini ham yiq.",
        buyruqlar: ["move", "back", "left", "right", "fire", "reload", "scan", "radar", "hp", "ammo"],
        maydon: () => J.maydon({
          tanklar: [
            tank({ id: "bola", x: 90, y: 330, burchak: 0, jon: 5 }),
            tank({ id: "posbon", x: 500, y: 330, burchak: 180, tur: "robot", aql: "posbon", uzoq: 220 }),
            tank({ id: "ovchi", x: 500, y: 90, burchak: 180, tur: "robot", aql: "ovchi", uzoq: 220 }),
          ],
          tosiqlar: [{ x: 300, y: 120, en: 60, bo: 60 }],
        }),
        ishora: "left(radar()) eng yaqin dushmanga qaratadi. Oʻqing tugasa, uzoqlashib reload() qil.",
      },
    ],
  };

  // Maqsadga yetdimi
  function bajarildi(bosqich, m) {
    if (bosqich === "boshqaruv") {
      const t = m.tanklar[0];
      return m.belgi ? J.masofa(t, m.belgi) <= 30 : false;
    }
    if (bosqich === "nishon") return !!(m.nishon && m.nishon.tirik === false);
    return m.tugadi === "yutdi";
  }

  const yutqazdi = (m) => m.tugadi === "yutqazdi";

  const vazifa = (bosqich, k) => {
    const list = VAZIFALAR[bosqich];
    return list[Math.min(k, list.length - 1)];
  };

  // Bir satrni bajarish: bolaning kodi → harakatlar, keyin robotlar navbati
  function satrniBajar(m, kod, py) {
    const { fn, holat } = J.tashqiFunksiyalar(m, "bola");
    const boshIndeks = m.yozuv.length;
    const r = py.run(kod, { tashqi: fn, maxSteps: 50000 });
    if (!r.error && !m.tugadi) J.robotlarYursin(m);
    return {
      xato: r.error,
      chiqish: r.output,
      yozuv: m.yozuv.slice(boshIndeks),
      chegaraOshdi: holat.chegaraOshdi,
      harakat: holat.soni,
    };
  }

  const api = { VAZIFALAR, vazifa, bajarildi, yutqazdi, satrniBajar };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
