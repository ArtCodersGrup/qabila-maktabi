// 47-o'yin: robotga TAKROR va AGAR blokli dastur yozish (sof mantiq).
// Maydon va to'siq tekshiruvi umumiy dvigateldan: umumiy/js/dastur.js
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const D = (root.QK && root.QK.dastur) || require("../../umumiy/js/dastur.js");

  const QADAM_CHEGARA = 200; // cheksiz takrorni to'xtatadi

  // Dastur bloklari:
  //   { t: "yur",    yon }                 — bitta qadam
  //   { t: "takror", n, ichi: [...] }      — ichidagini n marta
  //   { t: "agar",   yon, ichi, aks }      — shu yonda yo'l bo'sh bo'lsa "ichi", aks holda "aks"
  const yur = (yon) => ({ t: "yur", yon });
  const takror = (n, ichi) => ({ t: "takror", n, ichi: ichi || [] });
  const agar = (yon, ichi, aks) => ({ t: "agar", yon, ichi: ichi || [], aks: aks || [] });

  const qoshni = (at, yon) => ({ x: at.x + D.DIRS[yon].dx, y: at.y + D.DIRS[yon].dy });
  // Shu yonda yurish mumkinmi (maydon ichida va tosh emas)
  const bosh = (f, at, yon) => {
    const n = qoshni(at, yon);
    return D.inside(f, n) && !D.isWall(f, n);
  };

  // Dasturni bajarish. status: goal — gulxanga yetdi, wall — toshga urildi,
  // edge — chekkaga, end — dastur tugadi, uzun — qadam chegarasidan oshdi.
  function bajar(f, dastur) {
    const holat = { at: { x: f.robot.x, y: f.robot.y }, path: [{ x: f.robot.x, y: f.robot.y }], qadam: 0, status: null };
    if (D.sameCell(holat.at, f.goal)) holat.status = "goal";

    function qadamla(yon) {
      const next = qoshni(holat.at, yon);
      holat.qadam++;
      if (holat.qadam > QADAM_CHEGARA) { holat.status = "uzun"; return; }
      if (!D.inside(f, next)) { holat.status = "edge"; return; }
      if (D.isWall(f, next)) { holat.status = "wall"; return; }
      holat.at = next;
      holat.path.push(next);
      if (D.sameCell(next, f.goal)) holat.status = "goal";
    }

    function royxat(bloklar) {
      for (const b of bloklar) {
        if (holat.status) return;
        if (b.t === "yur") qadamla(b.yon);
        else if (b.t === "takror") {
          for (let k = 0; k < b.n; k++) {
            if (holat.status) return;
            royxat(b.ichi);
          }
        } else if (b.t === "agar") {
          royxat(bosh(f, holat.at, b.yon) ? b.ichi : b.aks);
        }
      }
    }

    royxat(dastur);
    return { path: holat.path, status: holat.status || "end", at: holat.at, qadam: holat.qadam };
  }

  // Dasturdagi bloklar soni (ichkaridagilar ham) — "qisqaroq yoz" mashqlari uchun
  function soni(dastur) {
    let n = 0;
    for (const b of dastur) {
      n++;
      if (b.t === "takror") n += soni(b.ichi);
      if (b.t === "agar") n += soni(b.ichi) + soni(b.aks);
    }
    return n;
  }

  // Dastur maydonlarning HAMMASIDA gulxanga yetadimi
  const yechdi = (maydonlar, dastur) => maydonlar.every((f) => bajar(f, dastur).status === "goal");

  const maydon = (robot, goal, walls, w, h) => D.field({ w: w || 5, h: h || 5, robot, goal, walls: walls || [] });

  // ---------- 1-bosqich: takror ----------
  const TAKROR = [
    {
      id: "yolak",
      matn: "Robot gulxangacha toʻgʻri yuradi.",
      maydonlar: [maydon({ x: 0, y: 2 }, { x: 4, y: 2 })],
      bloklar: ["right", "takror"],
      yechim: [takror(4, [yur("right")])],
      maxBlok: 3,
    },
    {
      id: "burchak",
      matn: "Avval oʻngga, keyin pastga.",
      maydonlar: [maydon({ x: 0, y: 0 }, { x: 3, y: 3 })],
      bloklar: ["right", "down", "takror"],
      yechim: [takror(3, [yur("right")]), takror(3, [yur("down")])],
      maxBlok: 6,
    },
    {
      id: "zina",
      matn: "Zinapoya: bir oʻngga, bir pastga — uch marta.",
      maydonlar: [maydon({ x: 0, y: 0 }, { x: 3, y: 3 })],
      bloklar: ["right", "down", "takror"],
      yechim: [takror(3, [yur("right"), yur("down")])],
      maxBlok: 4,
    },
  ];

  // ---------- 2-bosqich: agar ----------
  // Ikki maydon: tosh joyi har xil. Bitta dastur ikkalasida ham ishlashi kerak.
  const AGAR = [
    {
      id: "tosh-ongda",
      matn: "Ikki maydon: birida yoʻlda tosh bor. Bitta dastur ikkalasida ham ishlasin.",
      maydonlar: [
        maydon({ x: 0, y: 1 }, { x: 2, y: 1 }, [{ x: 1, y: 1 }]),
        maydon({ x: 0, y: 1 }, { x: 2, y: 1 }),
      ],
      bloklar: ["right", "down", "up", "agar"],
      yechim: [agar("right", [yur("right"), yur("right")], [yur("down"), yur("right"), yur("right"), yur("up")])],
      maxBlok: 9,
    },
    {
      id: "qaysi-yol",
      matn: "Qaysi tomon boʻsh boʻlsa, oʻsha tomonga yur.",
      maydonlar: [
        maydon({ x: 1, y: 0 }, { x: 1, y: 2 }, [{ x: 1, y: 1 }]),
        maydon({ x: 1, y: 0 }, { x: 1, y: 2 }),
      ],
      bloklar: ["down", "right", "left", "agar"],
      yechim: [agar("down", [yur("down"), yur("down")], [yur("right"), yur("down"), yur("down"), yur("left")])],
      maxBlok: 9,
    },
  ];

  // ---------- 3-bosqich: ikkisi birga ----------
  const BIRGA = [
    {
      id: "uzun-yolak",
      matn: "Uzun yoʻlak: takror bilan yoz, toshni agar bilan aylanib oʻt.",
      maydonlar: [
        maydon({ x: 0, y: 2 }, { x: 5, y: 2 }, [{ x: 3, y: 2 }], 6, 5),
        maydon({ x: 0, y: 2 }, { x: 5, y: 2 }, [{ x: 2, y: 2 }], 6, 5),
      ],
      bloklar: ["right", "up", "down", "takror", "agar"],
      yechim: [takror(5, [agar("right", [yur("right")], [yur("up"), yur("right"), yur("right"), yur("down")])])],
      maxBlok: 8,
    },
    {
      id: "ikki-tosh",
      matn: "Ikkita tosh bor, lekin joyi har maydonda boshqa.",
      maydonlar: [
        maydon({ x: 0, y: 1 }, { x: 4, y: 1 }, [{ x: 2, y: 1 }]),
        maydon({ x: 0, y: 1 }, { x: 4, y: 1 }, [{ x: 1, y: 1 }, { x: 3, y: 1 }]),
      ],
      bloklar: ["right", "up", "down", "takror", "agar"],
      yechim: [takror(4, [agar("right", [yur("right")], [yur("up"), yur("right"), yur("right"), yur("down")])])],
      maxBlok: 8,
    },
  ];

  const DARAJALAR = { takror: TAKROR, agar: AGAR, birga: BIRGA };

  function daraja(bosqich, k) {
    const list = DARAJALAR[bosqich];
    return list[Math.min(k, list.length - 1)];
  }

  // Bolaning dasturi: natija va nima bo'lgani
  function tekshir(level, dastur) {
    const natijalar = level.maydonlar.map((f) => bajar(f, dastur));
    const ok = natijalar.every((n) => n.status === "goal");
    const yiqilgan = natijalar.findIndex((n) => n.status !== "goal");
    return { ok, natijalar, yiqilgan, uzun: soni(dastur) > level.maxBlok };
  }

  const api = { QADAM_CHEGARA, yur, takror, agar, bosh, qoshni, bajar, soni, yechdi, maydon,
    TAKROR, AGAR, BIRGA, DARAJALAR, daraja, tekshir };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
