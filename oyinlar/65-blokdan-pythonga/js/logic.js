// 65-o'yin «Bloklardan Pythonga»: bitta dastur — ikki ko'rinish (bloklar va Python matni). Sof mantiq.
// Bloklar, bajarish va Python matni — umumiy dvigateldan: umumiy/js/blok.js
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const B = (root.QK && root.QK.blok) || require("../../umumiy/js/blok.js");
  const D = (root.QK && root.QK.dastur) || require("../../umumiy/js/dastur.js");
  const { yur, takror, agar, toki, chaqir, qoy, qosh, kop, nusxa, randInt, pick, TESKARI } = B;

  const MAX_W = 8;
  const MAX_H = 6;
  const SONLAR = [2, 3, 4, 5, 6, 7, 8, 9]; // takror soni — blokUi.tahrirla bilan bir xil oraliq

  const tik = (yon) => yon === "up" || yon === "down";
  const kesma = (yon) => (tik(yon) ? ["right", "left"] : ["up", "down"]);
  const oldi = (c, yon) => ({ x: c.x + D.DIRS[yon].dx, y: c.y + D.DIRS[yon].dy });
  const kalit = (c) => c.x + "," + c.y;

  // ---------- Dastur generatori ----------
  // Dastur bo'laklardan (segment) yig'iladi va shu bilan birga robot yo'li "xayoliy" katakli joyda chiziladi.
  // Shart bloklari (agar, toki) kerakli joyga tosh qo'yadi. Oxirida yo'l + toshlardan maydon yasaladi.
  function holat() {
    return { at: { x: 0, y: 0 }, yol: [{ x: 0, y: 0 }], walls: [], dastur: [], fn: null, oxirgi: null };
  }
  function yurV(s, yon, n) {
    for (let k = 0; k < (n || 1); k++) {
      s.at = oldi(s.at, yon);
      s.yol.push(s.at);
      s.oxirgi = yon;
    }
  }
  // Yangi bo'lak oldingi harakatga ko'ndalang boshlanadi (bir yo'nalishdagi ikki bo'lak qo'shilib ketmasin)
  const yangiYon = (s, rng) => (s.oxirgi ? pick(kesma(s.oxirgi), rng) : pick(B.YONLAR, rng));

  const SEG = {
    // bitta qadam
    bir(s, rng) {
      const d = yangiYon(s, rng);
      s.dastur.push(yur(d));
      yurV(s, d);
    },
    // takror n [d]
    tekis(s, rng) {
      const d = yangiYon(s, rng);
      const n = randInt(2, tik(d) ? 3 : 4, rng);
      s.dastur.push(takror(n, [yur(d)]));
      yurV(s, d, n);
    },
    // takror n [a, b] — zinapoya
    zina(s, rng) {
      const a = yangiYon(s, rng);
      const b = pick(kesma(a), rng);
      const n = randInt(2, 3, rng);
      s.dastur.push(takror(n, [yur(a), yur(b)]));
      for (let k = 0; k < n; k++) { yurV(s, a); yurV(s, b); }
    },
    // while d_bosh(): d() — oxirida tosh
    toki(s, rng) {
      const d = yangiYon(s, rng);
      const L = randInt(2, tik(d) ? 3 : 4, rng);
      s.dastur.push(toki(d, [yur(d)]));
      yurV(s, d, L);
      s.walls.push(oldi(s.at, d));
    },
    // if d_bosh(): d… else: e… — tosh bor-yo'qligi tasodifiy
    agar(s, rng) {
      const d = yangiYon(s, rng);
      const e = pick(kesma(d), rng);
      const k1 = randInt(1, 2, rng);
      const k2 = randInt(1, 2, rng);
      s.dastur.push(agar(d, kop(d, k1), kop(e, k2)));
      if (rng() < 0.5) {
        s.walls.push(oldi(s.at, d));
        yurV(s, e, k2);
      } else yurV(s, d, k1);
    },
    // def yulduz(): naqsh — 2–3 marta chaqiriladi
    yulduz(s, rng) {
      const a = yangiYon(s, rng);
      const b = pick(kesma(a), rng);
      const naqsh = pick([[a, b], [a, a, b], [b, a, TESKARI[b], a]], rng);
      s.fn = { yulduz: naqsh.map((y) => yur(y)) };
      const chiz = () => naqsh.forEach((y) => yurV(s, y));
      if (rng() < 0.5) {
        const k = randInt(2, 3, rng);
        s.dastur.push(takror(k, [chaqir("yulduz")]));
        for (let i = 0; i < k; i++) chiz();
      } else {
        s.dastur.push(chaqir("yulduz"));
        chiz();
        const g = pick(kesma(s.oxirgi), rng);
        const gn = randInt(1, 2, rng);
        s.dastur.push(gn === 1 ? yur(g) : takror(gn, [yur(g)]));
        yurV(s, g, gn);
        s.dastur.push(chaqir("yulduz"));
        chiz();
      }
    },
    // qadam = 0; while d_bosh(): d(); qadam += 1; for i in range(qadam): e()
    qadam(s, rng) {
      const d = yangiYon(s, rng);
      const e = pick(kesma(d), rng);
      const L = randInt(2, 3, rng);
      s.dastur.push(qoy(0), toki(d, [yur(d), qosh()]), takror("qadam", [yur(e)]));
      yurV(s, d, L);
      s.walls.push(oldi(s.at, d));
      yurV(s, e, L);
    },
  };

  // Bo'laklar rejasi: tier 0 — yur va takror; tier 1 — + agar / toki; tier 2 — + ★ funksiya yoki qadam
  function reja(tier, rng) {
    if (tier === 0) {
      return pick([["tekis", "tekis"], ["tekis", "bir", "tekis"], ["zina", "tekis"], ["tekis", "zina"],
        ["bir", "zina"], ["tekis", "tekis", "tekis"], ["zina", "bir"]], rng);
    }
    if (tier === 1) {
      const shart = pick(["toki", "agar"], rng);
      const boshqa = pick(["tekis", "zina", "bir"], rng);
      return pick([[shart, boshqa], [boshqa, shart], [boshqa, shart, pick(["tekis", "bir"], rng)]], rng);
    }
    const asos = pick(["yulduz", "qadam"], rng);
    const qoshimcha = pick(["toki", "agar", "tekis", "bir"], rng);
    return rng() < 0.5 ? [asos, qoshimcha] : [qoshimcha, asos];
  }

  // Dastur + uning yo'li va toshlari (maydonga joylangan). Yo'l o'zini kesmaydi, toshlar yo'lda emas.
  function yasaDastur(tier, rng) {
    const s = holat();
    for (const nom of reja(tier, rng)) SEG[nom](s, rng);
    const yolSet = new Set(s.yol.map(kalit));
    if (yolSet.size !== s.yol.length) return null;
    if (s.walls.some((c) => yolSet.has(kalit(c)))) return null;
    const hamma = [...s.yol, ...s.walls];
    const minX = Math.min(...hamma.map((c) => c.x));
    const minY = Math.min(...hamma.map((c) => c.y));
    let w = Math.max(...hamma.map((c) => c.x)) - minX + 1;
    let h = Math.max(...hamma.map((c) => c.y)) - minY + 1;
    // Juda tor bo'lsa — chetiga bo'sh qator (bola "robot chiqib ketadimi" deb o'ylasin)
    const px = w < 3 ? 1 : 0;
    const py = h < 3 ? 1 : 0;
    w += 2 * px;
    h += 2 * py;
    if (w > MAX_W || h > MAX_H) return null;
    const joy = (c) => ({ x: c.x - minX + px, y: c.y - minY + py });
    return { dastur: s.dastur, fn: s.fn, yol: s.yol.map(joy), walls: s.walls.map(joy), w, h };
  }

  // Bezak toshlar (tier 1+): yo'lda emas — to'g'ri dastur yo'liga ta'sir qilmaydi (bajar baribir tekshiradi)
  function bezak(p, band, nechta, rng) {
    const out = [];
    for (let k = 0; k < 30 && out.length < nechta; k++) {
      const c = { x: randInt(0, p.w - 1, rng), y: randInt(0, p.h - 1, rng) };
      if (band.has(kalit(c))) continue;
      band.add(kalit(c));
      out.push(c);
    }
    return out;
  }

  const fnOpt = (fn) => ({ fn: fn || undefined });
  const matnOf = (dastur, fn) => B.pythonMatn(dastur, fn || undefined);

  // Maydon: robot yo'l boshida, gulxan — yo'l oxirida (yoki berilgan katakda), toshlar
  function maydonQur(p, rng, tier, goal) {
    const band = new Set([...p.yol, ...p.walls].map(kalit));
    if (goal) band.add(kalit(goal));
    const bez = tier >= 1 ? bezak(p, band, randInt(0, 2, rng), rng) : [];
    return B.maydon(p.yol[0], goal || p.yol[p.yol.length - 1], [...p.walls, ...bez], p.w, p.h);
  }

  const birXilYol = (a, b) => a.length === b.length && a.every((c, i) => D.sameCell(c, b[i]));

  // ---------- 1-bosqich: O'qi — robot qayerda to'xtaydi ----------
  // Maydon gulxansiz ko'rsatiladi; gulxan (ichki) yo'lda bo'lmagan katakka qo'yiladi — status "end".
  function yasaOqi(rng, tier) {
    const p = yasaDastur(tier, rng);
    if (!p) return null;
    const yolSet = new Set([...p.yol, ...p.walls].map(kalit));
    const bosh = [];
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (!yolSet.has(kalit({ x, y }))) bosh.push({ x, y });
    if (!bosh.length) return null;
    const f = maydonQur(p, rng, tier, pick(bosh, rng));
    const r = B.bajar(f, p.dastur, fnOpt(p.fn));
    if (r.status !== "end" || !birXilYol(r.path, p.yol) || D.sameCell(r.at, f.robot)) return null;
    const matn = matnOf(p.dastur, p.fn);
    return {
      id: "oqi|" + matn + "|" + f.w + "x" + f.h + ":" + f.robot.x + "," + f.robot.y,
      bosqich: "oqi", matn: "Robot qaysi katakda toʻxtaydi? Katakni bos.",
      f, maydonlar: [f], dastur: p.dastur, fn: p.fn || undefined, javob: r.at,
    };
  }

  // ---------- 2-bosqich: Tuzat — bitta son yoki yo'nalish xato ----------
  // Tahrir qismlari (65-o'yinda bosib almashtiriladi) — pythonQatorlar tartibida
  function qismlar(dastur, fn) {
    const out = [];
    for (const q of B.pythonQatorlar(dastur, fn || undefined)) {
      for (const x of q.qismlar) if (typeof x !== "string" && x.tahrir) out.push(x);
    }
    return out;
  }

  function yasaTuzat(rng, tier) {
    const p = yasaDastur(tier, rng);
    if (!p) return null;
    const f = maydonQur(p, rng, tier);
    const r = B.bajar(f, p.dastur, fnOpt(p.fn));
    if (r.status !== "goal" || !birXilYol(r.path, p.yol)) return null;
    // Bitta qismni buzamiz: son — yaqin boshqa son, yo'nalish — boshqa tomon
    for (let urinish = 0; urinish < 12; urinish++) {
      const buzuq = nusxa(p.dastur);
      const buzuqFn = p.fn ? nusxa(p.fn) : undefined;
      const list = qismlar(buzuq, buzuqFn);
      const t = pick(list, rng).tahrir;
      if (t.maydon === "n") {
        const yaqin = SONLAR.filter((n) => n !== t.blok.n && Math.abs(n - t.blok.n) <= 2);
        t.blok.n = pick(yaqin, rng);
      } else {
        t.blok.yon = pick(B.YONLAR.filter((y) => y !== t.blok.yon), rng);
      }
      const rb = B.bajar(f, buzuq, fnOpt(buzuqFn));
      if (rb.status === "goal" || rb.status === "uzun") continue; // cheksiz yurish bolaga foydasiz
      const matn = matnOf(p.dastur, p.fn);
      const buzuqMatn = matnOf(buzuq, buzuqFn);
      return {
        id: "tuzat|" + buzuqMatn + "|" + f.id,
        bosqich: "tuzat", matn: "Robot gulxanga yetmayapti. Xato qismni bosib almashtir.",
        f, maydonlar: [f], dastur: p.dastur, fn: p.fn || undefined, buzuq, buzuqFn,
        yechim: p.dastur, yechimFn: p.fn || undefined, togriMatn: matn,
      };
    }
    return null;
  }

  // ---------- 3-bosqich: Tarjima qil — Python matnidan bloklar ----------
  const TUR_TARTIB = ["takror", "agar", "toki", "yulduz", "qoy", "qosh", "takrorQadam"];
  // Quruvchi uchun kerakli tugmalar: ishlatilgan yo'nalishlar (yur va shartlar) va blok turlari
  function kerakliBloklar(dastur, fn) {
    const yon = new Set();
    const tur = new Set();
    const aylan = (list) => {
      for (const b of list) {
        if (b.yon) yon.add(b.yon);
        if (b.t === "takror") tur.add(b.n === "qadam" ? "takrorQadam" : "takror");
        else if (b.t === "agar" || b.t === "toki" || b.t === "qoy" || b.t === "qosh") tur.add(b.t);
        else if (b.t === "chaqir") tur.add(b.nom);
        if (b.ichi) aylan(b.ichi);
        if (b.aks) aylan(b.aks);
      }
    };
    aylan(dastur);
    if (fn) for (const nom of Object.keys(fn)) aylan(fn[nom]);
    return [...B.YONLAR.filter((y) => yon.has(y)), ...TUR_TARTIB.filter((t) => tur.has(t))];
  }

  function yasaTarjima(rng, tier) {
    const p = yasaDastur(tier, rng);
    if (!p) return null;
    const f = maydonQur(p, rng, tier);
    const r = B.bajar(f, p.dastur, fnOpt(p.fn));
    if (r.status !== "goal" || !birXilYol(r.path, p.yol)) return null;
    const matn = matnOf(p.dastur, p.fn);
    const bosh = p.fn ? { yulduz: [] } : undefined;
    return {
      id: "tarjima|" + matn + "|" + f.id,
      bosqich: "tarjima", matn: "Shu Python dasturini bloklardan yigʻ.",
      f, maydonlar: [f], yechim: p.dastur, yechimFn: p.fn || undefined, fn: bosh,
      bloklar: kerakliBloklar(p.dastur, p.fn), maxBlok: B.soni(p.dastur, p.fn || undefined) + 2, togriMatn: matn,
    };
  }

  // ---------- Ko'rsatuv va zaxira (qotirilgan) ----------
  const KORSATUV = {
    // 1-bosqich: bloklar va Python yonma-yon
    oqi: (() => {
      const f = B.maydon({ x: 0, y: 0 }, { x: 0, y: 2 }, [], 5, 3);
      const dastur = [takror(3, [yur("right")]), yur("down")];
      return { id: "k-oqi", bosqich: "oqi", f, maydonlar: [f], dastur, javob: { x: 3, y: 1 } };
    })(),
    // 2-bosqich: son xato — robot gulxanga yetmaydi
    tuzat: (() => {
      const f = B.maydon({ x: 0, y: 1 }, { x: 4, y: 2 }, [], 5, 3);
      const dastur = [takror(4, [yur("right")]), yur("down")];
      const buzuq = [takror(3, [yur("right")]), yur("down")];
      return { id: "k-tuzat", bosqich: "tuzat", f, maydonlar: [f], dastur, buzuq, yechim: dastur, togriMatn: matnOf(dastur) };
    })(),
    // 3-bosqich: matn → bloklar
    tarjima: (() => {
      const f = B.maydon({ x: 0, y: 0 }, { x: 3, y: 3 }, [], 4, 4);
      const yechim = [takror(3, [yur("right"), yur("down")])];
      return { id: "k-tarjima", bosqich: "tarjima", f, maydonlar: [f], yechim, bloklar: ["right", "down", "takror"],
        maxBlok: 5, togriMatn: matnOf(yechim), matn: "Shu Python dasturini bloklardan yigʻ." };
    })(),
  };

  // Zaxira: generator omadsiz kelsa (amalda bo'lmaydi). Ikki xil — ketma-ket takror bo'lmasin.
  function zaxira(bosqich, prev) {
    const f1 = B.maydon({ x: 0, y: 0 }, { x: 4, y: 3 }, [], 5, 4);
    const d1 = [takror(4, [yur("right")]), takror(3, [yur("down")])];
    const f2 = B.maydon({ x: 0, y: 3 }, { x: 3, y: 0 }, [], 5, 4);
    const d2 = [takror(3, [yur("up"), yur("right")])];
    const variant = [[f1, d1], [f2, d2]].map(([f, d], k) => {
      if (bosqich === "oqi") {
        const g = B.maydon(f.robot, { x: f.w - 1, y: 0 }, [], f.w, f.h);
        const fg = k === 0 ? B.maydon(f.robot, { x: 0, y: 3 }, [], f.w, f.h) : g;
        const r = B.bajar(fg, d);
        return { id: "z-oqi-" + k, bosqich, matn: "Robot qaysi katakda toʻxtaydi? Katakni bos.", f: fg, maydonlar: [fg], dastur: d, javob: r.at };
      }
      if (bosqich === "tuzat") {
        const buzuq = nusxa(d);
        buzuq[0].n = buzuq[0].n === 3 ? 2 : 3;
        return { id: "z-tuzat-" + k, bosqich, matn: "Robot gulxanga yetmayapti. Xato qismni bosib almashtir.",
          f, maydonlar: [f], dastur: d, buzuq, yechim: d, togriMatn: matnOf(d) };
      }
      return { id: "z-tarjima-" + k, bosqich, matn: "Shu Python dasturini bloklardan yigʻ.", f, maydonlar: [f], yechim: d,
        bloklar: kerakliBloklar(d), maxBlok: B.soni(d) + 2, togriMatn: matnOf(d) };
    });
    return variant.find((l) => !prev || l.id !== prev.id) || variant[0];
  }

  const YASOVCHI = { oqi: yasaOqi, tuzat: yasaTuzat, tarjima: yasaTarjima };
  const BOSQICHLAR = ["oqi", "tuzat", "tarjima"];

  // Yangi vazifa: oldingisining aynan o'zi emas (QOIDALAR 4.3). bosqich — 1/2/3 yoki nomi; tier — 0 / 1 / 2.
  function yasa(bosqich, prev, rng, tier) {
    const nom = typeof bosqich === "number" ? BOSQICHLAR[bosqich - 1] : bosqich;
    rng = rng || Math.random;
    tier = tier || 0;
    for (let k = 0; k < 500; k++) {
      const level = YASOVCHI[nom](rng, tier);
      if (level && (!prev || prev.id !== level.id)) return level;
    }
    return zaxira(nom, prev);
  }

  // Ikki matnning birinchi farq qilgan qatori (-1 — bir xil). Maslahatda shu qator yoritiladi.
  function farqQator(a, b) {
    const x = a.split("\n");
    const y = b.split("\n");
    const n = Math.max(x.length, y.length);
    for (let k = 0; k < n; k++) if (x[k] !== y[k]) return k;
    return -1;
  }

  const api = { MAX_W, MAX_H, SONLAR, SEG, reja, yasaDastur, qismlar, kerakliBloklar, KORSATUV, zaxira, yasa, farqQator, matnOf };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
