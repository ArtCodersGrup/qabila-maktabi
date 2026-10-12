// «AI va harakat»: tana holatini aniqlash (pose estimation). Skelet — tayanch nuqtalar (keypoints) koordinatalari;
// holat qoidalari (qoʻl koʻtarilgan, oʻtirgan, T-holat, egilgan) shu koordinatalardan hisoblanadi;
// kadrlar ketma-ketligidan oʻtirib-turish sanaladi. Ekransiz sof mantiq; Node da test qilinadi: tests/logic.test.js
// Koordinatalar rasmdagidek: x chapdan oʻngga (0…100), y yuqoridan pastga (0…120). Odam orqasidan koʻrinadi:
// uning chap tomoni — rasmning chap tomoni.
(function (root) {
  "use strict";

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  function aralash(list, r) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // Ketma-ket bir xil misol chiqmaydi (QOIDALAR 4.3). make null qaytarsa — qayta urinadi.
  function pickNew(make, prev, r) {
    let zaxira = null;
    for (let k = 0; k < 600; k++) {
      const task = make(r);
      if (!task) continue;
      if (!prev || task.id !== prev.id) return task;
      zaxira = task;
    }
    if (zaxira) return zaxira;
    throw new Error("Misol yasab boʻlmadi");
  }

  // ---------- Tayanch nuqtalar va suyaklar ----------
  const NUQTALAR = [
    { id: "bosh", nom: "bosh", tomon: "orta" },
    { id: "boyin", nom: "boʻyin", tomon: "orta" },
    { id: "chapYelka", nom: "chap yelka", tomon: "chap", juft: "ongYelka" },
    { id: "ongYelka", nom: "oʻng yelka", tomon: "ong", juft: "chapYelka" },
    { id: "chapTirsak", nom: "chap tirsak", tomon: "chap", juft: "ongTirsak" },
    { id: "ongTirsak", nom: "oʻng tirsak", tomon: "ong", juft: "chapTirsak" },
    { id: "chapBilak", nom: "chap bilak", tomon: "chap", juft: "ongBilak" },
    { id: "ongBilak", nom: "oʻng bilak", tomon: "ong", juft: "chapBilak" },
    { id: "bel", nom: "bel", tomon: "orta" },
    { id: "chapSon", nom: "chap son", tomon: "chap", juft: "ongSon" },
    { id: "ongSon", nom: "oʻng son", tomon: "ong", juft: "chapSon" },
    { id: "chapTizza", nom: "chap tizza", tomon: "chap", juft: "ongTizza" },
    { id: "ongTizza", nom: "oʻng tizza", tomon: "ong", juft: "chapTizza" },
    { id: "chapTopiq", nom: "chap toʻpiq", tomon: "chap", juft: "ongTopiq" },
    { id: "ongTopiq", nom: "oʻng toʻpiq", tomon: "ong", juft: "chapTopiq" },
  ];
  const NOM = {};
  NUQTALAR.forEach((n) => { NOM[n.id] = n.nom; });
  const nuqta = (id) => NUQTALAR.find((n) => n.id === id);

  const SUYAKLAR = [
    ["bosh", "boyin"], ["boyin", "chapYelka"], ["boyin", "ongYelka"],
    ["chapYelka", "chapTirsak"], ["chapTirsak", "chapBilak"], ["ongYelka", "ongTirsak"], ["ongTirsak", "ongBilak"],
    ["boyin", "bel"], ["bel", "chapSon"], ["bel", "ongSon"],
    ["chapSon", "chapTizza"], ["chapTizza", "chapTopiq"], ["ongSon", "ongTizza"], ["ongTizza", "ongTopiq"],
  ];

  const bosh = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const yoz = (xy) => `(${xy[0]}, ${xy[1]})`;
  const koord = (p, id) => yoz(p[id]);

  // ---------- Skelet yasash ----------
  const SON_Y = 65; // tik turganda son balandligi
  const TIZZA_Y = 85; // tizza balandligi oʻzgarmaydi
  const sonY = (d) => SON_Y + d;
  const farq = (d) => TIZZA_Y - sonY(d); // tizza y − son y

  // Qoʻl: yelka nuqtasi, tomon ishorasi (chap −1, oʻng +1), turi va kichik oʻzgarish v = { a: 0…2, b: 0…3 }
  function qol(yelka, s, tur, v) {
    const sx = yelka[0];
    const sy = yelka[1];
    if (tur === "tepa") return { tirsak: [sx + 6 * s, sy - 12], bilak: [sx + (5 - v.a) * s, sy - 24 - v.b] };
    if (tur === "salom") return { tirsak: [sx + 10 * s, sy + 8], bilak: [sx + (14 + v.a) * s, sy - 4 - v.b] };
    if (tur === "bukik") return { tirsak: [sx + 6 * s, sy + 14], bilak: [sx + (10 + v.a) * s, sy + 2 + v.b] };
    if (tur === "yon") return { tirsak: [sx + 15 * s, sy + (v.a % 2)], bilak: [sx + (28 + v.a) * s, sy + v.b] };
    if (tur === "yarimYon") return { tirsak: [sx + 13 * s, sy + 8], bilak: [sx + (24 + v.a) * s, sy + 12 + v.b] };
    return { tirsak: [sx + 3 * s, sy + 15], bilak: [sx + (4 + v.a) * s, sy + 30 - v.b] }; // past
  }

  // o = { chap, ong — qoʻl turi; chapV, ongV; otir — son necha birlik pasaygan; egil — gavda necha birlik surilgan }
  function poza(o) {
    const q = o || {};
    const d = q.otir || 0;
    const e = q.egil || 0;
    const nol = { a: 0, b: 0 };
    const k = Math.round(d / 2);
    const p = {
      bosh: [50 + Math.round(e * 1.3), 15 + d],
      boyin: [50 + e, 30 + d],
      chapYelka: [40 + e, 30 + d],
      ongYelka: [60 + e, 30 + d],
      bel: [50, sonY(d)],
      chapSon: [43, sonY(d)],
      ongSon: [57, sonY(d)],
      chapTizza: [43 - k, TIZZA_Y],
      ongTizza: [57 + k, TIZZA_Y],
      chapTopiq: [43, 105],
      ongTopiq: [57, 105],
    };
    const c = qol(p.chapYelka, -1, q.chap || "past", q.chapV || nol);
    const g = qol(p.ongYelka, 1, q.ong || "past", q.ongV || nol);
    p.chapTirsak = c.tirsak;
    p.chapBilak = c.bilak;
    p.ongTirsak = g.tirsak;
    p.ongBilak = g.bilak;
    return p;
  }

  const kalit = (o) => {
    const v = (x) => (x ? `${x.a}${x.b}` : "00");
    return `${o.chap || "past"}${v(o.chapV)}|${o.ong || "past"}${v(o.ongV)}|${o.otir || 0}|${o.egil || 0}`;
  };

  // ---------- Holat qoidalari (hammasi koordinatalardan) ----------
  const CHEGARA = { otir: 8, egil: 10, tY: 5, tX: 25 };

  const kotarilgan = (p, tomon) => p[tomon + "Bilak"][1] < p[tomon + "Yelka"][1];
  const otirgan = (p) => p.chapTizza[1] - p.chapSon[1] <= CHEGARA.otir && p.ongTizza[1] - p.ongSon[1] <= CHEGARA.otir;
  // null — egilmagan; "chap" yoki "ong" — qaysi tomonga
  function egilish(p) {
    const f = p.boyin[0] - p.bel[0];
    if (Math.abs(f) < CHEGARA.egil) return null;
    return f < 0 ? "chap" : "ong";
  }
  const tHolat = (p) => ["chap", "ong"].every((t) =>
    Math.abs(p[t + "Bilak"][1] - p[t + "Yelka"][1]) <= CHEGARA.tY && Math.abs(p[t + "Bilak"][0] - p[t + "Yelka"][0]) >= CHEGARA.tX);

  function holat(p) {
    if (otirgan(p)) return "otirgan";
    if (egilish(p)) return "egilgan";
    if (tHolat(p)) return "t";
    if (kotarilgan(p, "chap") || kotarilgan(p, "ong")) return "qol";
    return "tik";
  }

  const HOLAT = { tik: "Tik turibdi", qol: "Qoʻl koʻtarilgan", t: "T-holat", otirgan: "Oʻtirgan", egilgan: "Yonga egilgan" };
  const QOIDALAR = [
    "Qoʻl koʻtarilgan: bilak y < yelka y",
    "T-holat: ikkala qoʻlda |bilak y − yelka y| ≤ 5 va |bilak x − yelka x| ≥ 25",
    "Oʻtirgan: tizza y − son y ≤ 8",
    "Yonga egilgan: |boʻyin x − bel x| ≥ 10",
  ];

  // Javob izohi: qaysi qoida qaysi sonlar bilan bajarildi
  function izoh(p) {
    const h = holat(p);
    const tf = p.chapTizza[1] - p.chapSon[1];
    const ef = Math.abs(p.boyin[0] - p.bel[0]);
    if (h === "otirgan") return `Tizza y − son y = ${p.chapTizza[1]} − ${p.chapSon[1]} = ${tf} ≤ 8 → oʻtirgan.`;
    if (h === "egilgan") return `|boʻyin x − bel x| = |${p.boyin[0]} − ${p.bel[0]}| = ${ef} ≥ 10 → ${egilish(p) === "chap" ? "chapga" : "oʻngga"} egilgan.`;
    if (h === "t") {
      return `Bilaklar yelka balandligida (y: ${p.chapBilak[1]} va ${p.ongBilak[1]}, yelka y ${p.chapYelka[1]}) va yelkadan `
        + `${p.chapYelka[0] - p.chapBilak[0]} va ${p.ongBilak[0] - p.ongYelka[0]} birlik uzoqda → T-holat.`;
    }
    if (h === "qol") {
      const qism = ["chap", "ong"].filter((t) => kotarilgan(p, t))
        .map((t) => `${t === "chap" ? "chap" : "oʻng"} bilak y ${p[t + "Bilak"][1]} < yelka y ${p[t + "Yelka"][1]}`);
      return bosh(qism.join(", ")) + " → qoʻl koʻtarilgan.";
    }
    return `Bilaklar yelkadan yuqori emas (y: ${p.chapBilak[1]} va ${p.ongBilak[1]}, yelka y ${p.chapYelka[1]}), `
      + `T-holat shartlari bajarilmadi, tizza y − son y = ${tf} > 8, |boʻyin x − bel x| = ${ef} < 10 → tik turibdi.`;
  }

  // ---------- Tasodifiy skelet ----------
  const V = (r) => ({ a: int(r, 0, 2), b: int(r, 0, 3) });
  const POZA_TURLARI = ["tik", "qolChap", "qolOng", "qolIkki", "t", "otirgan", "egilgan", "bukik", "yarimT", "yarimOtir", "sustEgil"];

  // oson — qoʻl faqat toʻliq koʻtariladi ("salom" yoʻq)
  function tasodifPoza(r, tur, oson) {
    const o = { chap: "past", ong: "past", chapV: V(r), ongV: V(r), otir: int(r, 0, 2), egil: 0 };
    const kotar = () => (oson ? "tepa" : pick(["tepa", "salom"], r));
    if (tur === "qolChap") o.chap = kotar();
    else if (tur === "qolOng") o.ong = kotar();
    else if (tur === "qolIkki") { o.chap = kotar(); o.ong = kotar(); }
    else if (tur === "t") { o.chap = "yon"; o.ong = "yon"; }
    else if (tur === "otirgan") o.otir = int(r, 12, 17);
    else if (tur === "egilgan") o.egil = pick([-1, 1], r) * int(r, 10, 15);
    else if (tur === "bukik") {
      const q = pick(["chap", "ong", "ikki"], r);
      if (q !== "ong") o.chap = "bukik";
      if (q !== "chap") o.ong = "bukik";
    } else if (tur === "yarimT") { o.chap = "yarimYon"; o.ong = "yarimYon"; }
    else if (tur === "yarimOtir") o.otir = int(r, 6, 9);
    else if (tur === "sustEgil") o.egil = pick([-1, 1], r) * int(r, 4, 8);
    return { o, p: poza(o), tur, kalit: kalit(o) };
  }

  // Asosiy sozlamalar + oʻzgartirish (qaysiTask uchun)
  function yasa(r, ozg) {
    const o = Object.assign({ chap: "past", ong: "past", chapV: V(r), ongV: V(r), otir: int(r, 0, 2), egil: 0 }, ozg || {});
    return { o, p: poza(o), kalit: kalit(o) };
  }

  // ---------- 1-bosqich: tayanch nuqtalar va koordinatalar ----------
  // Nuqta nomi uchun 4 variant: toʻgʻrisi, qarama-qarshi tomondagisi va boshqalar
  function nomVariantlar(id, r) {
    const n = nuqta(id);
    const boshqa = aralash(NUQTALAR.filter((x) => x.id !== n.id && x.id !== n.juft), r).slice(0, n.juft ? 2 : 3);
    return aralash([n.nom].concat(n.juft ? [NOM[n.juft]] : [], boshqa.map((x) => x.nom)), r);
  }

  const TOMON_ISHORA = "Chap tomon — koʻk, oʻng tomon — toʻq sariq. Yuqoridan pastga: yelka, tirsak, bilak; son, tizza, toʻpiq.";

  // tier 0 — nuqta nomi; tier 1 — belgilangan nuqtaning koordinatasi; tier 2 — koordinata boʻyicha nuqtani topish
  function nuqtaTask(prev, r, tier) {
    const t = tier || 0;
    return pickNew((rr) => {
      const z = tasodifPoza(rr, pick(t === 0 ? ["tik", "qolChap", "qolOng", "t"] : POZA_TURLARI, rr), t === 0);
      const n = pick(NUQTALAR, rr);
      const p = z.p;
      const xy = p[n.id];
      if (t === 0) {
        return {
          tur: "nuqta", id: `nuqta:${z.kalit}:${n.id}`, poza: p, belgi: n.id, setka: false, nuqta: n.id,
          matn: "Belgilangan tayanch nuqta qaysi?",
          variantlar: nomVariantlar(n.id, rr), javob: n.nom,
          ishora: TOMON_ISHORA,
          nega: `Bu — ${n.nom}, koordinatasi ${yoz(xy)}.`,
          qisqa: `${bosh(n.nom)}.`,
        };
      }
      if (t === 1) {
        const nomzod = [xy, [xy[1], xy[0]], [100 - xy[0], xy[1]], [xy[0], xy[1] + (xy[1] > 60 ? -20 : 20)]].map(yoz);
        const variantlar = [...new Set(nomzod)];
        if (variantlar.length < 4) return null;
        return {
          tur: "koordinata", id: `koordinata:${z.kalit}:${n.id}`, poza: p, belgi: n.id, setka: true, nuqta: n.id,
          matn: `Belgilangan nuqta — ${n.nom}. Uning koordinatasi (x, y) qaysi?`,
          variantlar: aralash(variantlar, rr), javob: yoz(xy),
          ishora: "Avval x — chapdan oʻngga, keyin y — yuqoridan pastga. Setka chiziqlari har 10 birlikda, sonlar har 20 da.",
          nega: `${bosh(n.nom)}: x = ${xy[0]} (chapdan), y = ${xy[1]} (yuqoridan) → ${yoz(xy)}.`,
          qisqa: `${bosh(n.nom)} ${yoz(xy)}.`,
        };
      }
      // Bir xil koordinatali ikki nuqta boʻlsa, savol noaniq — bunday skelet olinmaydi
      if (NUQTALAR.some((x) => x.id !== n.id && yoz(p[x.id]) === yoz(xy))) return null;
      return {
        tur: "qaysiNuqta", id: `qaysiNuqta:${z.kalit}:${n.id}`, poza: p, belgi: null, setka: true, nuqta: n.id,
        matn: `Koordinatasi ${yoz(xy)} boʻlgan tayanch nuqta qaysi?`,
        variantlar: nomVariantlar(n.id, rr), javob: n.nom,
        ishora: "Setkada avval x ni (chapdan oʻngga), keyin y ni (yuqoridan pastga) top. " + TOMON_ISHORA,
        nega: `${yoz(xy)} — ${n.nom}.`,
        qisqa: `${yoz(xy)} — ${n.nom}.`,
      };
    }, prev, r);
  }

  const YONALISH = [
    { id: "yuqori", soz: "eng yuqorida", oq: 1, min: true, izoh: "eng yuqoridagi nuqtada y eng kichik" },
    { id: "past", soz: "eng pastda", oq: 1, min: false, izoh: "eng pastdagi nuqtada y eng katta" },
    { id: "chap", soz: "eng chapda", oq: 0, min: true, izoh: "eng chapdagi nuqtada x eng kichik" },
    { id: "ong", soz: "eng oʻngda", oq: 0, min: false, izoh: "eng oʻngdagi nuqtada x eng katta" },
  ];

  // Toʻrt nuqtadan qaysi biri eng yuqorida / pastda / chapda / oʻngda — koordinatalar boʻyicha
  function chekkaTask(prev, r, tier) {
    const t = tier || 0;
    return pickNew((rr) => {
      const z = tasodifPoza(rr, pick(t === 0 ? ["tik", "qolChap", "qolOng"] : POZA_TURLARI, rr), t === 0);
      const y = pick(t < 2 ? YONALISH.slice(0, 2) : YONALISH, rr);
      const tanlov = aralash(NUQTALAR, rr).slice(0, 4);
      const qiymat = tanlov.map((n) => z.p[n.id][y.oq]);
      const chekka = y.min ? Math.min(...qiymat) : Math.max(...qiymat);
      if (qiymat.filter((v) => v === chekka).length !== 1) return null;
      const yorliq = (n) => `${bosh(n.nom)} ${koord(z.p, n.id)}`;
      const togri = tanlov[qiymat.indexOf(chekka)];
      return {
        tur: "chekka", id: `chekka:${z.kalit}:${y.id}:${tanlov.map((n) => n.id).join(",")}`, poza: z.p, rasm: t === 0,
        yonalish: y.id, nuqtalar: tanlov.map((n) => n.id),
        matn: `Toʻrt nuqtadan qaysi biri ${y.soz}?` + (t === 0 ? "" : " Rasm yoʻq — faqat koordinatalar."),
        variantlar: tanlov.map(yorliq), javob: yorliq(togri),
        ishora: "x oʻngga oʻsadi, y pastga oʻsadi. Yuqoridagi nuqtaning y si kichik, pastdagisiniki — katta.",
        nega: `${bosh(y.izoh)}: ${togri.nom} ${koord(z.p, togri.id)}.`,
        qisqa: `${bosh(y.izoh)}.`,
      };
    }, prev, r);
  }

  const FARQ_ISHORA = "Vertikal farq — y lar ayirmasi, gorizontal farq — x lar ayirmasi. Kattasidan kichigini ayir.";

  // Ikki nuqta orasidagi vertikal yoki gorizontal farq — javob son
  function farqTask(prev, r, tier) {
    const t = tier || 0;
    return pickNew((rr) => {
      const xil = pick(t === 0 ? ["qol", "oyoq"] : t === 1 ? ["qol", "oyoq", "egil"] : ["egil", "quloch", "boy"], rr);
      let z = null;
      let a = "";
      let b = "";
      let oq = 1;
      let savol = "";
      if (xil === "qol") {
        const tomon = pick(["chap", "ong"], rr);
        z = tasodifPoza(rr, pick(["tik", "qolIkki", "bukik", "yarimT"], rr), false);
        a = tomon + "Yelka";
        b = tomon + "Bilak";
        const yuqorida = z.p[b][1] < z.p[a][1];
        savol = `${bosh(NOM[a])} ${koord(z.p, a)}, ${NOM[b]} ${koord(z.p, b)}. Bilak yelkadan necha birlik ${yuqorida ? "yuqorida" : "pastda"}?`;
      } else if (xil === "oyoq") {
        z = tasodifPoza(rr, pick(["tik", "otirgan", "yarimOtir"], rr), true);
        a = "chapSon";
        b = "chapTizza";
        savol = `Chap son ${koord(z.p, a)}, chap tizza ${koord(z.p, b)}. Tizza sondan necha birlik pastda?`;
      } else if (xil === "egil") {
        z = tasodifPoza(rr, pick(["egilgan", "sustEgil"], rr), true);
        a = "boyin";
        b = "bel";
        oq = 0;
        savol = `Boʻyin ${koord(z.p, a)}, bel ${koord(z.p, b)}. Boʻyin beldan necha birlik ${z.p[a][0] < z.p[b][0] ? "chapda" : "oʻngda"}?`;
      } else if (xil === "quloch") {
        z = tasodifPoza(rr, pick(["tik", "t", "yarimT", "qolIkki", "bukik"], rr), false);
        a = "chapBilak";
        b = "ongBilak";
        oq = 0;
        savol = `Chap bilak ${koord(z.p, a)}, oʻng bilak ${koord(z.p, b)}. Bilaklar orasidagi gorizontal masofa necha birlik?`;
      } else {
        z = tasodifPoza(rr, pick(["tik", "otirgan", "yarimOtir"], rr), true);
        a = "bosh";
        b = "chapTopiq";
        savol = `Bosh ${koord(z.p, a)}, chap toʻpiq ${koord(z.p, b)}. Boshdan toʻpiqqacha vertikal masofa necha birlik?`;
      }
      const u = z.p[a][oq];
      const v = z.p[b][oq];
      const javob = Math.abs(u - v);
      if (javob === 0) return null;
      return {
        tur: "farq", id: `farq:${xil}:${a}:${z.kalit}`, poza: z.p, rasm: t < 2, xil, a, b, oq, javob,
        matn: savol + (t < 2 ? "" : " Rasm yoʻq — faqat koordinatalar."),
        nega: FARQ_ISHORA,
        hisob: `${oq ? "y" : "x"} lar ayirmasi: ${Math.max(u, v)} − ${Math.min(u, v)} = ${javob}`,
      };
    }, prev, r);
  }

  // ---------- 2-bosqich: qoidalar bilan holatni aniqlash ----------
  const HOLAT_QATOR = ["chapYelka", "chapBilak", "ongYelka", "ongBilak", "boyin", "bel", "chapSon", "chapTizza"];

  // tier 0 — aniq holatlar; tier 1 — chegaraga yaqin holatlar ham; tier 2 — rasm yoʻq, faqat jadval
  function holatTask(prev, r, tier) {
    const t = tier || 0;
    const havza = t === 0 ? ["tik", "qolChap", "qolOng", "qolIkki", "t", "otirgan", "egilgan"]
      : t === 1 ? ["qolChap", "qolOng", "t", "otirgan", "egilgan", "bukik", "yarimOtir", "sustEgil", "yarimT"]
        : ["qolIkki", "t", "otirgan", "egilgan", "bukik", "yarimOtir", "sustEgil", "yarimT", "bukik", "yarimOtir", "sustEgil"];
    return pickNew((rr) => {
      const z = tasodifPoza(rr, pick(havza, rr), t === 0);
      const h = holat(z.p);
      return {
        tur: "holat", id: `holat:${z.kalit}`, poza: z.p, rasm: t < 2, qoidalar: t < 2, qatorlar: HOLAT_QATOR, holat: h,
        matn: "Koordinatalar boʻyicha holatni aniqla." + (t < 2 ? "" : " Rasm yoʻq: model ham faqat sonlarni koʻradi."),
        variantlar: Object.values(HOLAT), javob: HOLAT[h],
        ishora: "Toʻrt qoidani navbat bilan tekshir: qoʻl, T shakli, oʻtirish, egilish. Koʻzga emas, sonlarga ishon.",
        nega: izoh(z.p),
        qisqa: `${HOLAT[h]}.`,
      };
    }, prev, r);
  }

  const QOL = { chap: "Faqat chap", ong: "Faqat oʻng", ikki: "Ikkalasi", hech: "Hech biri" };

  // Qaysi qoʻl koʻtarilgan? Qoida: bilak y < yelka y
  function qolTask(prev, r, tier) {
    const t = tier || 0;
    const ha = t === 0 ? ["tepa"] : ["tepa", "salom"];
    const yoq = t === 0 ? ["past"] : t === 1 ? ["past", "bukik"] : ["past", "bukik", "yon", "yarimYon"];
    return pickNew((rr) => {
      const jv = pick(Object.keys(QOL), rr);
      const o = {
        chap: pick(jv === "chap" || jv === "ikki" ? ha : yoq, rr),
        ong: pick(jv === "ong" || jv === "ikki" ? ha : yoq, rr),
        chapV: V(rr), ongV: V(rr), otir: t === 0 ? int(rr, 0, 2) : int(rr, 0, 17), egil: 0,
      };
      const p = poza(o);
      const satr = (tm, soz) => `${soz} bilak y ${p[tm + "Bilak"][1]} ${kotarilgan(p, tm) ? "<" : "≥"} yelka y ${p[tm + "Yelka"][1]} — ${kotarilgan(p, tm) ? "koʻtarilgan" : "koʻtarilmagan"}`;
      return {
        tur: "qol", id: `qol:${kalit(o)}`, poza: p, rasm: t < 2, qatorlar: ["chapYelka", "chapBilak", "ongYelka", "ongBilak"],
        matn: "Qaysi qoʻl koʻtarilgan? Qoida: bilak y < yelka y." + (t < 2 ? "" : " Rasm yoʻq — faqat koordinatalar."),
        variantlar: Object.values(QOL), javob: QOL[jv],
        ishora: "Har qoʻlda bilak y ni oʻsha tomondagi yelka y bilan taqqosla. y kichik boʻlsa — nuqta yuqorida.",
        nega: `${satr("chap", "Chap")}. ${satr("ong", "Oʻng")}.`,
        qisqa: `${QOL[jv]}.`,
      };
    }, prev, r);
  }

  const QAYSI = {
    otirgan: { soz: "oʻtirgan", qoida: "tizza y − son y ≤ 8", sonlar: (p) => [`son y ${p.chapSon[1]}`, `tizza y ${p.chapTizza[1]}`] },
    egilChap: { soz: "chapga egilgan", qoida: "bel x − boʻyin x ≥ 10", sonlar: (p) => [`boʻyin x ${p.boyin[0]}`, `bel x ${p.bel[0]}`] },
    egilOng: { soz: "oʻngga egilgan", qoida: "boʻyin x − bel x ≥ 10", sonlar: (p) => [`boʻyin x ${p.boyin[0]}`, `bel x ${p.bel[0]}`] },
    qolChap: { soz: "chap qoʻlini koʻtargan", qoida: "chap bilak y < chap yelka y", sonlar: (p) => [`bilak y ${p.chapBilak[1]}`, `yelka y ${p.chapYelka[1]}`] },
    qolOng: { soz: "oʻng qoʻlini koʻtargan", qoida: "oʻng bilak y < oʻng yelka y", sonlar: (p) => [`bilak y ${p.ongBilak[1]}`, `yelka y ${p.ongYelka[1]}`] },
  };
  const SHART = {
    otirgan: (p) => otirgan(p),
    egilChap: (p) => egilish(p) === "chap",
    egilOng: (p) => egilish(p) === "ong",
    qolChap: (p) => kotarilgan(p, "chap"),
    qolOng: (p) => kotarilgan(p, "ong"),
  };

  // Toʻrt skeletdan qaysi biri shartni bajaradi? Javob — skeletning oʻzini bosish (A, B, C, D)
  function qaysiTask(prev, r, tier) {
    const t = tier || 0;
    return pickNew((rr) => {
      const m = pick(Object.keys(QAYSI), rr);
      const ishora = (n) => pick([-1, 1], rr) * n;
      let ozg = [];
      if (m === "otirgan") {
        ozg = t === 0 ? [{ otir: int(rr, 12, 17) }, {}, { chap: "tepa", ong: "tepa" }, { egil: ishora(int(rr, 10, 15)) }]
          : [{ otir: int(rr, 12, 17) }, { otir: int(rr, 6, 7) }, { otir: int(rr, 8, 9) }, {}];
      } else if (m === "egilChap" || m === "egilOng") {
        const s = m === "egilChap" ? -1 : 1;
        ozg = t === 0 ? [{ egil: s * int(rr, 10, 15) }, {}, { egil: -s * int(rr, 10, 15) }, { otir: int(rr, 12, 17) }]
          : [{ egil: s * int(rr, 10, 15) }, { egil: s * int(rr, 4, 8) }, { egil: -s * int(rr, 10, 15) }, { egil: -s * int(rr, 4, 8) }];
      } else {
        const men = m === "qolChap" ? "chap" : "ong";
        const narigi = men === "chap" ? "ong" : "chap";
        const d = () => (t === 2 ? { otir: int(rr, 0, 9) } : {});
        ozg = t === 0 ? [{ [men]: "tepa" }, {}, { [narigi]: "tepa" }, { otir: int(rr, 12, 17) }]
          : [Object.assign({ [men]: pick(["tepa", "salom"], rr) }, d()), Object.assign({ [men]: "bukik" }, d()),
            Object.assign({ [narigi]: pick(["tepa", "salom"], rr) }, d()), Object.assign({ chap: "yarimYon", ong: "yarimYon" }, d())];
      }
      const list = ozg.map((x) => yasa(rr, x));
      if (new Set(list.map((x) => x.kalit)).size < 4) return null;
      if (list.filter((x) => SHART[m](x.p)).length !== 1 || !SHART[m](list[0].p)) return null;
      const tartib = aralash([0, 1, 2, 3], rr);
      const kartalar = tartib.map((k, i) => ({ harf: "ABCD"[i], poza: list[k].p, sonlar: QAYSI[m].sonlar(list[k].p), togri: k === 0 }));
      const togri = kartalar.find((k) => k.togri);
      return {
        tur: "qaysi", id: `qaysi:${m}:${tartib.map((k) => list[k].kalit).join(";")}`, maqsad: m, kartalar,
        matn: `Qaysi skelet ${QAYSI[m].soz}? Qoida: ${QAYSI[m].qoida}.`,
        variantlar: ["A", "B", "C", "D"], javob: togri.harf,
        ishora: `Har skelet yonidagi ikki sonni taqqosla: ${QAYSI[m].qoida}. Rasm aldashi mumkin — sonlar hal qiladi.`,
        nega: `${togri.harf}: ${togri.sonlar.join(", ")} — ${QAYSI[m].qoida} bajariladi.`,
        qisqa: `${togri.harf} — ${QAYSI[m].soz}.`,
      };
    }, prev, r);
  }

  // ---------- 3-bosqich: kadrlar ketma-ketligidan oʻtirib-turishni sanash ----------
  // Kadr — bitta son d: son necha birlik pasaygan. tizza y − son y = 20 − d.
  const D = { tik: [0, 2], yarim: [6, 9], otir: [12, 17] };
  const dOl = (r, tur) => int(r, D[tur][0], D[tur][1]);
  const otirganD = (d) => farq(d) <= CHEGARA.otir;

  // Sanoq oshadigan kadrlar raqami (1 dan): oldingi kadr — oʻtirgan, shu kadr — oʻtirmagan
  function oshishlar(kadrlar) {
    const out = [];
    for (let i = 1; i < kadrlar.length; i++) if (otirganD(kadrlar[i - 1]) && !otirganD(kadrlar[i])) out.push(i + 1);
    return out;
  }
  const sanoq = (kadrlar) => oshishlar(kadrlar).length;

  const UZUNLIK = [9, 12, 14]; // tier → eng koʻp kadrlar soni

  // tier 0 — toza takrorlar; tier 1 — yarim oʻtirish (sanalmaydi) va uzoqroq oʻtirish; tier 2 — oxirida tugallanmagan oʻtirish
  function ketma(r, t) {
    const takror = t === 0 ? int(r, 1, 3) : int(r, 2, 3);
    const soxta = t === 0 ? 0 : int(r, 1, 2);
    const bolak = aralash(Array(takror).fill("rep").concat(Array(soxta).fill("yarim")), r);
    const out = [dOl(r, "tik")];
    for (const b of bolak) {
      if (b === "rep") {
        if (t > 0 && r() < 0.35) out.push(dOl(r, "yarim"));
        const n = t === 0 ? 1 : int(r, 1, 2);
        for (let k = 0; k < n; k++) out.push(dOl(r, "otir"));
        if (t > 0 && r() < 0.35) out.push(dOl(r, "yarim"));
      } else out.push(dOl(r, "yarim"));
      out.push(dOl(r, "tik"));
    }
    if (t === 2 && r() < 0.5) out.push(dOl(r, "otir"));
    return out;
  }

  const korsat = (t) => (t === 0 ? "farq" : "son");
  const SANASH_ISHORA = "Har kadrda tizza y − son y ni top: ≤ 8 boʻlsa — oʻtirgan. Sanoq faqat «oʻtirgan → oʻtirmagan» almashuvida oshadi.";

  // Necha marta toʻliq oʻtirib-turdi? — javob son
  function sanashTask(prev, r, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((rr) => {
      const kadrlar = ketma(rr, t);
      if (kadrlar.length < 4 || kadrlar.length > UZUNLIK[t]) return null;
      const osh = oshishlar(kadrlar);
      const yarim = kadrlar.some((d) => !otirganD(d) && d >= D.yarim[0]);
      const chala = otirganD(kadrlar[kadrlar.length - 1]);
      return {
        tur: "sanash", id: `sanash:${kadrlar.join(",")}`, kadrlar, korsat: korsat(t), javob: osh.length,
        matn: `${kadrlar.length} ta kadr. Odam necha marta toʻliq oʻtirib-turdi?`,
        nega: SANASH_ISHORA,
        hisob: `Sanoq ${osh.join(", ")}-${osh.length > 1 ? "kadrlarda" : "kadrda"} oshadi → ${osh.length} marta.`
          + (yarim ? " Yarim oʻtirish chegaradan oʻtmaydi — sanalmaydi." : "")
          + (chala ? " Oxirgi oʻtirish tugallanmagan — hali sanalmaydi." : ""),
      };
    }, prev, r);
  }

  // Hisoblagich N ga qaysi kadrda yetadi? — 4 ta kadr raqami
  function nechanchiTask(prev, r, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((rr) => {
      const kadrlar = ketma(rr, t);
      if (kadrlar.length < 5 || kadrlar.length > UZUNLIK[t]) return null;
      const osh = oshishlar(kadrlar);
      const n = int(rr, 1, osh.length);
      const togri = osh[n - 1];
      // Chalgʻituvchilar: shu oʻtirishning oxirgi va birinchi kadri, yarim oʻtirish, boshqa kadrlar
      let bosh1 = togri - 1;
      while (bosh1 > 1 && otirganD(kadrlar[bosh1 - 2])) bosh1--;
      const yarimlar = kadrlar.map((d, i) => (!otirganD(d) && d >= D.yarim[0] ? i + 1 : 0)).filter(Boolean);
      const nomzod = [togri, togri - 1, bosh1].concat(yarimlar, aralash(kadrlar.map((d, i) => i + 1), rr));
      const tanlov = [...new Set(nomzod)].slice(0, 4).sort((a, b) => a - b);
      if (tanlov.length < 4) return null;
      const yorliq = (k) => `${k}-kadr`;
      return {
        tur: "nechanchi", id: `nechanchi:${kadrlar.join(",")}:${n}`, kadrlar, korsat: korsat(t), n, kadr: togri,
        matn: `Hisoblagich ${n} ga qaysi kadrda yetadi?`,
        variantlar: tanlov.map(yorliq), javob: yorliq(togri),
        ishora: "Sanoq oʻtirgan kadrda emas, undan keyingi birinchi «oʻtirmagan» kadrda oshadi. Chegara: tizza y − son y ≤ 8.",
        nega: `${togri - 1}-kadr — oʻtirgan, ${togri}-kadr — oʻtirmagan: shu almashuvda sanoq ${n} boʻladi.`,
        qisqa: `${togri}-kadrda sanoq ${n} boʻladi.`,
      };
    }, prev, r);
  }

  // Haqiqiy oʻtirish kamida 2 kadr davom etadi; bitta kadrlik sakrash — xato oʻlchov (shovqin)
  function shovqinKetma(r, t) {
    const takror = t === 0 ? 1 : int(r, 1, 2);
    const bolak = aralash(Array(takror).fill("rep").concat(["shovqin"], t === 2 ? ["yarim"] : []), r);
    const out = [dOl(r, "tik")];
    const boshlar = [];
    const oxirlar = [];
    let shovqin = 0;
    for (const b of bolak) {
      if (b === "rep") {
        if (t > 0 && r() < 0.35) out.push(dOl(r, "yarim"));
        const n = int(r, 2, 3);
        boshlar.push(out.length + 1);
        for (let k = 0; k < n; k++) out.push(dOl(r, "otir"));
        oxirlar.push(out.length);
        if (t > 0 && r() < 0.35) out.push(dOl(r, "yarim"));
      } else if (b === "shovqin") {
        out.push(dOl(r, "otir"));
        shovqin = out.length;
      } else out.push(dOl(r, "yarim"));
      out.push(dOl(r, "tik"));
      if (t > 0 && r() < 0.3) out.push(dOl(r, "tik"));
    }
    return { kadrlar: out, shovqin, boshlar, oxirlar };
  }

  function shovqinTask(prev, r, tier) {
    const t = Math.min(tier || 0, 2);
    return pickNew((rr) => {
      const z = shovqinKetma(rr, t);
      if (z.kadrlar.length > UZUNLIK[t]) return null;
      const nomzod = [z.shovqin, z.boshlar[0], z.oxirlar[z.oxirlar.length - 1]].concat(aralash(z.kadrlar.map((d, i) => i + 1), rr));
      const tanlov = [...new Set(nomzod)].slice(0, 4).sort((a, b) => a - b);
      if (tanlov.length < 4) return null;
      const yorliq = (k) => `${k}-kadr`;
      const n = sanoq(z.kadrlar);
      return {
        tur: "shovqin", id: `shovqin:${z.kadrlar.join(",")}`, kadrlar: z.kadrlar, korsat: korsat(t), kadr: z.shovqin,
        matn: "Odam bitta kadr ichida oʻtirib-turolmaydi. Qaysi kadr — xato oʻlchov (shovqin)?",
        variantlar: tanlov.map(yorliq), javob: yorliq(z.shovqin),
        ishora: "Haqiqiy oʻtirish kamida 2 kadr davom etadi. Yolgʻiz turgan «oʻtirgan» kadrni izla (tizza y − son y ≤ 8).",
        nega: `${z.shovqin}-kadrda qiymat bitta kadrga sakrab, darhol qaytgan. Oddiy hisoblagich uni ham sanaydi: ${n} chiqadi, aslida ${n - 1}.`,
        qisqa: `${z.shovqin}-kadr — shovqin.`,
      };
    }, prev, r);
  }

  // Navbat toʻgʻri javoblar soni boʻyicha yuradi, zina (tier) esa shu son bilan birga oʻsadi (0, 1, 1, 2, 2, 2).
  // Shuning uchun asosiy mashq turi ikki-uch marta turadi: har safar keyingi zinasi bilan chiqadi.
  const BOSQICH1 = [nuqtaTask, nuqtaTask, chekkaTask, farqTask];
  const BOSQICH2 = [holatTask, holatTask, qolTask, qaysiTask, holatTask];
  const BOSQICH3 = [sanashTask, sanashTask, nechanchiTask, shovqinTask, sanashTask, nechanchiTask];

  // n — nechanchi toʻgʻri javob (mashq turi navbati), tier — qiyinlik zinasi
  const navbat = (bank) => (prev, r, tier, n) => bank[(n || 0) % bank.length](prev, r, tier);

  const api = {
    NUQTALAR, NOM, SUYAKLAR, CHEGARA, HOLAT, QOIDALAR, QOL, QAYSI, YONALISH, HOLAT_QATOR, POZA_TURLARI, D, UZUNLIK,
    SON_Y, TIZZA_Y, BOSQICH1, BOSQICH2, BOSQICH3,
    aralash, bosh, yoz, koord, sonY, farq, poza, kalit, tasodifPoza, nomVariantlar,
    kotarilgan, otirgan, egilish, tHolat, holat, izoh, otirganD, oshishlar, sanoq, ketma, shovqinKetma,
    nuqtaTask, chekkaTask, farqTask, holatTask, qolTask, qaysiTask, sanashTask, nechanchiTask, shovqinTask,
    bosqich1Task: navbat(BOSQICH1), bosqich2Task: navbat(BOSQICH2), bosqich3Task: navbat(BOSQICH3),
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
