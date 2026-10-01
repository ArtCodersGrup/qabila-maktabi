// 53-o'yin: xato ovi — tayyor dasturdagi xatoni topish va tuzatish (sof mantiq).
// Maydon va bajarish — umumiy/js/dastur.js. Node'da test: tests/logic.test.js
(function (root) {
  "use strict";

  const D = (root.QK && root.QK.dastur) || require("../../umumiy/js/dastur.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];

  function pickNew(make, prev, r) {
    for (let k = 0; k < 40; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  const maydon = (robot, goal, walls, w, h) => D.field({ w: w || 5, h: h || 5, robot, goal, walls: walls || [] });

  // Har vazifa: maydon, XATO dastur, to'g'ri dastur va xato qaysi buyruqda ekani.
  // "xatoIndeks" — birinchi noto'g'ri buyruq o'rni (0 dan).
  const VAZIFALAR = {
    top: [
      {
        id: "chekka",
        matn: "Robot gulxanga bormay, boshqa joyda toʻxtab qoldi. Qaysi buyruq xato?",
        maydon: () => maydon({ x: 0, y: 2 }, { x: 3, y: 2 }),
        dastur: ["right", "up", "right", "right"],
        togri: ["right", "right", "right"],
        xatoIndeks: 1,
        ishora: "Robot yuqoriga ketdi — lekin gulxan oʻsha qatorda edi.",
      },
      {
        id: "tosh",
        matn: "Robot toshga urildi. Qaysi buyruq xato?",
        maydon: () => maydon({ x: 0, y: 0 }, { x: 2, y: 2 }, [{ x: 1, y: 0 }]),
        dastur: ["right", "right", "down", "down"],
        togri: ["down", "down", "right", "right"],
        xatoIndeks: 0,
        ishora: "Birinchi qadamdayoq oldinda tosh bor edi.",
      },
      {
        id: "kalta",
        matn: "Robot toʻxtab qoldi — gulxanga yetmadi. Qaysi joyda buyruq yetishmaydi?",
        maydon: () => maydon({ x: 0, y: 1 }, { x: 3, y: 1 }),
        dastur: ["right", "right"],
        togri: ["right", "right", "right"],
        xatoIndeks: 2,
        ishora: "Buyruqlar tugadi, lekin yoʻl tugamadi.",
      },
    ],
    tuzat: [
      {
        id: "burilish",
        matn: "Dasturni tuzat: robot gulxanga yetsin.",
        maydon: () => maydon({ x: 0, y: 0 }, { x: 2, y: 2 }),
        dastur: ["right", "right", "up", "up"],
        togri: ["right", "right", "down", "down"],
        xatoIndeks: 2,
        ishora: "Gulxan pastda — yuqoriga emas, pastga yurish kerak.",
      },
      {
        id: "ortiqcha",
        matn: "Dastur ishlaydi, lekin ortiqcha qadamlar bor. Qisqaroq yoz.",
        maydon: () => maydon({ x: 1, y: 1 }, { x: 3, y: 1 }),
        dastur: ["up", "right", "down", "right"],
        togri: ["right", "right"],
        xatoIndeks: 0,
        qisqa: true,
        ishora: "Gulxan oʻsha qatorda — yuqoriga chiqib, qaytib tushish shart emas.",
      },
      {
        id: "aylanma",
        matn: "Toshni aylanib oʻtish kerak. Dasturni tuzat.",
        maydon: () => maydon({ x: 0, y: 2 }, { x: 2, y: 2 }, [{ x: 1, y: 2 }]),
        dastur: ["right", "right"],
        togri: ["up", "right", "right", "down"],
        xatoIndeks: 0,
        ishora: "Toʻgʻri yoʻlda tosh bor — tepadan yoki pastdan aylanib oʻt.",
      },
    ],
  };

  // Dasturning natijasi: "goal" — yetdi, "wall"/"edge" — urildi, "end" — buyruq tugadi
  const natija = (f, dastur) => D.run(f, dastur);
  const togrimi = (f, dastur) => D.run(f, dastur).status === "goal";

  // Qaysi buyruqda to'xtadi (xato indeksi) — "end" bo'lsa dastur oxiri
  function xatoJoyi(f, dastur) {
    const r = D.run(f, dastur);
    if (r.status === "goal") return -1;
    return r.status === "end" ? dastur.length : r.used;
  }

  // Bolaning dasturi: yetdimi va (kerak bo'lsa) qisqami
  const XATO_MATNI = {
    wall: "Toshga urildi.",
    edge: "Maydon chekkasiga urildi.",
    end: "Buyruqlar tugadi, gulxanga yetmadi.",
  };

  function tekshir(v, f, dastur) {
    const r = D.run(f, dastur);
    if (r.status !== "goal") return { ok: false, sabab: XATO_MATNI[r.status] || "Gulxanga yetmadi." };
    if (v.qisqa) {
      const eng = D.solve(f).length;
      if (dastur.length > eng) {
        return { ok: false, sabab: "Gulxanga yetdi, lekin ortiqcha qadam bor: " + eng + " ta buyruq yetarli." };
      }
    }
    return { ok: true };
  }

  function topTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => Object.assign({ tur: "top" }, pick(VAZIFALAR.top, rnd)), prev, rr);
  }

  function tuzatTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => Object.assign({ tur: "tuzat" }, pick(VAZIFALAR.tuzat, rnd)), prev, rr);
  }

  const api = { VAZIFALAR, XATO_MATNI, maydon, natija, togrimi, xatoJoyi, tekshir, topTask, tuzatTask };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
