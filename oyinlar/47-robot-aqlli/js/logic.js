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

  // ---------- Daraja generatori (2026-10-02): har safar yangi maydon ----------
  // Avval har bosqichda 2–3 ta qotirilgan daraja bor edi — 3-javobda o'sha daraja qaytib kelardi.
  // Endi yasa(bosqich, prev, rng, tier) cheksiz daraja beradi; qotirilganlari ko'rsatuv uchun qoldi.
  const TESKARI = { right: "left", left: "right", up: "down", down: "up" };
  const YONLAR = ["right", "left", "down", "up"];
  const gorizontal = (yon) => yon === "right" || yon === "left";
  const randInt = (a, b, rng) => a + Math.floor(rng() * (b - a + 1));
  const pick = (list, rng) => list[Math.floor(rng() * list.length)];
  const kop = (yon, n) => Array.from({ length: n }, () => yur(yon));

  // Yurishlar ro'yxatidan maydon: yo'l maydonga aynan sig'adi (chetlarida qo'shimcha joy — pad)
  function yoldanMaydon(yurishlar, pad) {
    let x = 0;
    let y = 0;
    const iz = [{ x, y }];
    for (const yon of yurishlar) {
      x += D.DIRS[yon].dx;
      y += D.DIRS[yon].dy;
      iz.push({ x, y });
    }
    const minX = Math.min(...iz.map((c) => c.x));
    const minY = Math.min(...iz.map((c) => c.y));
    const w = Math.max(...iz.map((c) => c.x)) - minX + 1;
    const h = Math.max(...iz.map((c) => c.y)) - minY + 1;
    const px = w < 3 && pad ? 1 : 0;
    const py = h < 3 && pad ? 1 : 0;
    const joy = (c) => ({ x: c.x - minX + px, y: c.y - minY + py });
    return maydon(joy(iz[0]), joy(iz[iz.length - 1]), [], w + 2 * px, h + 2 * py);
  }

  // 1-bosqich: takror. Bloklar chegarasi (maxBlok) shunday tanlanganki, takrorsiz yozib bo'lmaydi.
  function yasaTakror(rng, tier) {
    const tur = tier === 0 ? pick(["yolak", "yolak", "burchak"], rng)
      : tier === 1 ? pick(["burchak", "zina", "zina"], rng) : pick(["zina", "uchlik", "uchlik"], rng);
    if (tur === "yolak") {
      const yon = pick(YONLAR, rng);
      const n = gorizontal(yon) ? randInt(4, 5, rng) : 4;
      return {
        id: `yolak:${yon}:${n}`, matn: "Robot gulxangacha toʻgʻri yuradi. Takror bilan yoz!",
        maydonlar: [yoldanMaydon(kop(yon, n).map((b) => b.yon), true)],
        bloklar: [yon, "takror"], yechim: [takror(n, [yur(yon)])], maxBlok: 3,
      };
    }
    const d1 = pick(["right", "left"], rng);
    const d2 = pick(["down", "up"], rng);
    const [birinchi, ikkinchi] = rng() < 0.5 ? [d1, d2] : [d2, d1];
    if (tur === "burchak") {
      const a = gorizontal(birinchi) ? randInt(2, 5, rng) : randInt(2, 4, rng);
      const b = gorizontal(ikkinchi) ? randInt(2, 5, rng) : randInt(2, 4, rng);
      if (a + b < 5) return null;
      return {
        id: `burchak:${birinchi}${a}:${ikkinchi}${b}`, matn: "Avval bir tomonga, keyin boshqa tomonga. Ikkita takror kerak.",
        maydonlar: [yoldanMaydon([...Array(a).fill(birinchi), ...Array(b).fill(ikkinchi)], false)],
        bloklar: [birinchi, ikkinchi, "takror"], yechim: [takror(a, [yur(birinchi)]), takror(b, [yur(ikkinchi)])], maxBlok: 4,
      };
    }
    if (tur === "zina") {
      const n = randInt(tier === 2 ? 3 : 2, 4, rng);
      const yurishlar = [];
      for (let k = 0; k < n; k++) yurishlar.push(birinchi, ikkinchi);
      return {
        id: `zina:${birinchi}:${ikkinchi}:${n}`, matn: "Zinapoya: bir qadam u yoqqa, bir qadam bu yoqqa — bir necha marta.",
        maydonlar: [yoldanMaydon(yurishlar, false)],
        bloklar: [birinchi, ikkinchi, "takror"], yechim: [takror(n, [yur(birinchi), yur(ikkinchi)])], maxBlok: 3,
      };
    }
    // uchlik: ikki qadam + bir qadam — ikki marta (takror ichida uchta buyruq)
    const yurishlar = [];
    for (let k = 0; k < 2; k++) yurishlar.push(birinchi, birinchi, ikkinchi);
    return {
      id: `uchlik:${birinchi}:${ikkinchi}`, matn: "Keng zinapoya: ikki qadam, keyin bir qadam — ikki marta.",
      maydonlar: [yoldanMaydon(yurishlar, false)],
      bloklar: [birinchi, ikkinchi, "takror"], yechim: [takror(2, [yur(birinchi), yur(birinchi), yur(ikkinchi)])], maxBlok: 4,
    };
  }

  // Ikki qatorli yo'lak: 0-qator — asosiy yo'l, 1-qator — aylanma yo'l. uzun — yo'lak uzunligi.
  // Natija: (qadam, qator) → maydondagi katak; yon — oldinga, chet — aylanma yo'l tomoni.
  function yolak(uzun, yon, chet) {
    const katak = (i, qator) => (gorizontal(yon)
      ? { x: yon === "right" ? i : uzun - 1 - i, y: chet === "down" ? qator : 1 - qator }
      : { y: yon === "down" ? i : uzun - 1 - i, x: chet === "right" ? qator : 1 - qator });
    const [w, h] = gorizontal(yon) ? [uzun, 2] : [2, uzun];
    return { katak, w, h, yasash: (toshlar) => maydon(katak(0, 0), katak(uzun - 1, 0), toshlar.map(([i, q]) => katak(i, q)), w, h) };
  }
  // Maydonlarning hamma toshlari bitta maydonda: shartsiz (agarsiz) yo'l qolmagan bo'lsin
  function shartsizYolYoq(maydonlar) {
    const f = maydonlar[0];
    const toshlar = [];
    for (const m of maydonlar) for (const c of m.walls) if (!toshlar.some((t) => D.sameCell(t, c))) toshlar.push(c);
    return D.solve(maydon(f.robot, f.goal, toshlar, f.w, f.h)) === null;
  }
  function yolakYonlari(rng, engUzun) {
    const yon = pick(engUzun > 5 ? ["right", "left"] : YONLAR, rng);
    const chet = pick(gorizontal(yon) ? ["down", "up"] : ["right", "left"], rng);
    return { yon, chet, orqa: TESKARI[chet] };
  }

  // 2-bosqich: agar. Bir maydonda yo'lda tosh, ikkinchisida aylanma yo'l yopiq — shartsiz dastur ikkalasidan o'tolmaydi.
  // oldin — agar dan oldingi qadamlar (tier bilan o'sadi), keyin — toshdan keyingi yo'l uzunligi.
  function yasaAgar(rng, tier) {
    const oldin = tier === 0 ? 0 : tier === 1 ? randInt(0, 1, rng) : randInt(1, 2, rng);
    const keyin = tier === 2 ? randInt(2, 3, rng) : 2;
    const { yon, chet, orqa } = yolakYonlari(rng, oldin + keyin + 1);
    const y = yolak(oldin + keyin + 1, yon, chet);
    const toshli = y.yasash([[oldin + 1, 0]]); // yo'lda tosh — aylanib o'tiladi
    const yopiq = y.yasash([[oldin + 1, 1]]); // aylanma yo'l yopiq — to'g'ri yuriladi
    return {
      id: `agar:${yon}:${chet}:${oldin}:${keyin}`,
      matn: "Ikki maydon: birida yoʻlda tosh, ikkinchisida aylanma yoʻl yopiq. Bitta dastur ikkalasida ham ishlasin.",
      maydonlar: rng() < 0.5 ? [toshli, yopiq] : [yopiq, toshli],
      bloklar: [yon, chet, orqa, "agar"],
      yechim: [...kop(yon, oldin), agar(yon, kop(yon, keyin), [yur(chet), ...kop(yon, keyin), yur(orqa)])],
      maxBlok: oldin + 2 * keyin + 4,
    };
  }

  // 3-bosqich: takror ichida agar. Toshlar joyi har maydonda boshqa; aylanma qatorda ham tosh bor —
  // "boshidan oxirigacha aylanma qatordan yur" degan shartsiz dastur o'tmaydi.
  function yasaBirga(rng, tier) {
    const uzun = tier === 0 ? 5 : 6;
    const { yon, chet, orqa } = yolakYonlari(rng, uzun);
    const y = yolak(uzun, yon, chet);
    const yechim = [takror(uzun - 1, [agar(yon, [yur(yon)], [yur(chet), yur(yon), yur(yon), yur(orqa)])])];
    const toshlar = (nechta) => {
      const s = new Set();
      while (s.size < nechta) s.add(randInt(1, uzun - 2, rng));
      return [...s].sort((p, q) => p - q);
    };
    const bitta = () => {
      const yolda = toshlar(tier === 0 ? 1 : randInt(1, 2, rng));
      const chetda = rng() < 0.7 ? [randInt(0, uzun - 1, rng)] : [];
      return { yolda, chetda, f: y.yasash([...yolda.map((i) => [i, 0]), ...chetda.map((i) => [i, 1])]) };
    };
    const a = bitta();
    const b = bitta();
    if (a.yolda.join() === b.yolda.join()) return null;
    if (tier === 2 && a.yolda.length + b.yolda.length < 3) return null;
    const maydonlar = [a.f, b.f];
    if (!yechdi(maydonlar, yechim) || !shartsizYolYoq(maydonlar)) return null;
    return {
      id: `birga:${yon}:${chet}:${a.yolda.join("")}-${a.chetda.join("")}:${b.yolda.join("")}-${b.chetda.join("")}`,
      matn: tier === 2 ? "Toshlar koʻp va joyi har maydonda boshqa. Takror ichida agar!" : "Uzun yoʻlak: takror bilan yoz, toshni agar bilan aylanib oʻt.",
      maydonlar, bloklar: [yon, chet, orqa, "takror", "agar"], yechim, maxBlok: 8,
    };
  }

  const YASOVCHI = { takror: yasaTakror, agar: yasaAgar, birga: yasaBirga };

  // Yangi daraja: oldingisining aynan o'zi emas (QOIDALAR 4.3). tier — qiyinlik zinasi (0 / 1 / 2).
  function yasa(bosqich, prev, rng, tier) {
    rng = rng || Math.random;
    tier = tier || 0;
    for (let k = 0; k < 500; k++) {
      const level = YASOVCHI[bosqich](rng, tier);
      if (level && (!prev || prev.id !== level.id)) return level;
    }
    const list = DARAJALAR[bosqich]; // tasodif omadsiz kelsa (amalda bo'lmaydi)
    return list.find((l) => !prev || l.id !== prev.id) || list[0];
  }

  // Bolaning dasturi: natija va nima bo'lgani
  function tekshir(level, dastur) {
    const natijalar = level.maydonlar.map((f) => bajar(f, dastur));
    const ok = natijalar.every((n) => n.status === "goal");
    const yiqilgan = natijalar.findIndex((n) => n.status !== "goal");
    return { ok, natijalar, yiqilgan, uzun: soni(dastur) > level.maxBlok };
  }

  const api = { QADAM_CHEGARA, yur, takror, agar, bosh, qoshni, bajar, soni, yechdi, maydon,
    TAKROR, AGAR, BIRGA, DARAJALAR, daraja, tekshir, yasa, yoldanMaydon, shartsizYolYoq, TESKARI };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
