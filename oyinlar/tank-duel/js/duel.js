// Tank dueli: bitta ekranda ikki o'quvchi navbat bilan kod yozadi (sof mantiq).
// Jang qoidalari — umumiy/js/jang.js da; bu yerda faqat navbat va g'olib.
(function (root) {
  "use strict";

  const J = (root.QK && root.QK.jang) || require("../../umumiy/js/jang.js");

  const JON = 5;
  const UZOQ = 300;      // ikkalasiga teng — duelda ustunlik bo'lmasligi kerak
  const MAX_NAVBAT = 40; // shundan keyin durang

  // Maydon simmetrik: ikkala tank bir xil sharoitda boshlaydi
  function maydon(nomlar) {
    const tanklar = [
      J.tank({ id: "a", x: 90, y: 200, burchak: 0, jon: JON, uzoq: UZOQ }),
      J.tank({ id: "b", x: 510, y: 200, burchak: 180, jon: JON, uzoq: UZOQ, tur: "ikkinchi" }),
    ];
    const m = J.maydon({
      tanklar,
      tosiqlar: [
        { x: 280, y: 60, en: 40, bo: 90 },
        { x: 280, y: 250, en: 40, bo: 90 },
      ],
    });
    m.nomlar = { a: (nomlar && nomlar.a) || "Birinchi", b: (nomlar && nomlar.b) || "Ikkinchi" };
    m.navbat = "a";
    m.navbatSoni = 0;
    m.tugadi = null;
    m.golib = null;
    return m;
  }

  const tank = (m, id) => m.tanklar.find((t) => t.id === id);
  const raqib = (id) => (id === "a" ? "b" : "a");

  // Duelda robotlar yo'q: navbat ikkinchi o'yinchiga o'tadi
  function holatniTekshir(m) {
    const a = tank(m, "a");
    const b = tank(m, "b");
    if (!a.tirik && !b.tirik) { m.tugadi = "durang"; m.golib = null; }
    else if (!a.tirik) { m.tugadi = "golib"; m.golib = "b"; }
    else if (!b.tirik) { m.tugadi = "golib"; m.golib = "a"; }
    else if (m.navbatSoni >= MAX_NAVBAT) { m.tugadi = "durang"; m.golib = null; }
    return m.tugadi;
  }

  // Bitta o'yinchining satrini bajarish
  function satrniBajar(m, kod, py) {
    if (m.tugadi) return { tugagan: true };
    const kim = m.navbat;
    const { fn, holat } = J.tashqiFunksiyalar(m, kim);
    const boshIndeks = m.yozuv.length;
    const r = py.run(kod, { tashqi: fn, maxSteps: 50000 });
    const natija = {
      kim,
      xato: r.error,
      chiqish: r.output,
      yozuv: m.yozuv.slice(boshIndeks),
      chegaraOshdi: holat.chegaraOshdi,
      harakat: holat.soni,
    };
    if (r.error) return natija;           // xato — navbat o'tmaydi, qayta yozadi
    m.navbatSoni += 1;
    holatniTekshir(m);
    if (!m.tugadi) m.navbat = raqib(kim);
    natija.tugadi = m.tugadi;
    natija.golib = m.golib;
    return natija;
  }

  const golibNomi = (m) => (m.golib ? m.nomlar[m.golib] : null);
  const kimNavbati = (m) => m.nomlar[m.navbat];

  const api = { JON, UZOQ, MAX_NAVBAT, maydon, tank, raqib, holatniTekshir, satrniBajar, golibNomi, kimNavbati };

  root.QK = root.QK || {};
  root.QK.duel = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
