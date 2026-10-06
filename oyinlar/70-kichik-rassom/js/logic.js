// 70-o'yin: kichik rassom — katakli Paint. Rasterlash (chiziq, to'rtburchak, ellips, uchburchak), chelak (flood),
// tarix (bekor/qaytar), kodlash (galereya uchun run-length satr), namunalar (qadam-qadam rasmlar), qadam tekshiruvi,
// 1-bosqich vazifalari (asbob, to'ldirish, bekor) va harakat jurnali tekshiruvi.
// Ekransiz sof mantiq; Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const W = 32;
  const H = 24;
  const N = W * H;
  const BOSH = -1; // bo'sh katak (oq)
  const TARIX_CHEGARA = 50;
  const CHEGARA = 0.85; // qadam tekshiruvi: to'g'ri kataklar ulushi (oddiy rejim)
  const QIYIN_CHEGARA = 0.9;

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  // Ketma-ket bir xil misol chiqmasligi uchun (QOIDALAR 4.3). Generator null qaytarsa — qayta urinadi.
  function pickNew(make, prev, r) {
    let zaxira = null;
    for (let k = 0; k < 400; k++) {
      const task = make(r);
      if (!task) continue;
      if (!prev || task.id !== prev.id) return task;
      zaxira = task;
    }
    if (zaxira) return zaxira;
    throw new Error("Misol yasab boʻlmadi");
  }

  // ---------- Palitra va asboblar ----------
  // jonalish — "qizilga", "koʻkka": "Doirani qizilga toʻldir" matni uchun
  const PALITRA = [
    { id: "qora", nom: "qora", jonalish: "qoraga", hex: "#2B2B3A" },
    { id: "kulrang", nom: "kulrang", jonalish: "kulrangga", hex: "#978B76" },
    { id: "qizil", nom: "qizil", jonalish: "qizilga", hex: "#C0392B" },
    { id: "toqsariq", nom: "toʻq sariq", jonalish: "toʻq sariqqa", hex: "#F08A24" },
    { id: "sariq", nom: "sariq", jonalish: "sariqqa", hex: "#F0C040" },
    { id: "yashil", nom: "yashil", jonalish: "yashilga", hex: "#1A9E77" },
    { id: "ochyashil", nom: "och yashil", jonalish: "och yashilga", hex: "#8FD3A8" },
    { id: "kok", nom: "koʻk", jonalish: "koʻkka", hex: "#2F6FDE" },
    { id: "ochkok", nom: "och koʻk", jonalish: "och koʻkka", hex: "#8DB4F2" },
    { id: "binafsha", nom: "binafsha", jonalish: "binafshaga", hex: "#8E5BD0" },
    { id: "jigarrang", nom: "jigarrang", jonalish: "jigarrangga", hex: "#8A5A10" },
    { id: "pushti", nom: "pushti", jonalish: "pushtiga", hex: "#F4A7C0" },
  ];
  const RANG_ID = PALITRA.map((p) => p.id);
  const rangById = (id) => PALITRA.find((p) => p.id === id) || null;
  const rangIdx = (id) => (id == null ? BOSH : RANG_ID.indexOf(id));
  const rangNomi = (id) => (rangById(id) ? rangById(id).nom : "");

  // Chizish asboblari: feʼl — "chiz" / "tort"; shakl — bosib sudrab chiziladi (a → b)
  const ASBOBLAR = [
    { id: "qalam", nom: "qalam", fel: "", shakl: false },
    { id: "ochirgich", nom: "oʻchirgʻich", fel: "", shakl: false },
    { id: "chiziq", nom: "chiziq", fel: "tort", shakl: true },
    { id: "tortburchak", nom: "toʻrtburchak", fel: "chiz", shakl: true },
    { id: "doira", nom: "doira", fel: "chiz", shakl: true },
    { id: "uchburchak", nom: "uchburchak", fel: "chiz", shakl: true },
    { id: "chelak", nom: "chelak", fel: "", shakl: false },
  ];
  const ASBOB_ID = ASBOBLAR.map((a) => a.id);
  const SHAKL_ID = ASBOBLAR.filter((a) => a.shakl).map((a) => a.id);
  const asbobById = (id) => ASBOBLAR.find((a) => a.id === id) || null;
  const asbobNomi = (id) => (asbobById(id) ? asbobById(id).nom : id === "bekor" ? "bekor" : id === "qaytar" ? "qaytar" : "");
  const CHIZISH = ["qalam", "ochirgich", "chiziq", "tortburchak", "doira", "uchburchak", "chelak"];
  const TARIX_AMAL = ["bekor", "qaytar", "tozalash"];

  // ---------- Taxta ----------
  const ichida = (x, y) => x >= 0 && x < W && y >= 0 && y < H;
  const indeks = (x, y) => y * W + x;
  const boshTaxta = () => new Array(N).fill(BOSH);
  const nusxa = (taxta) => taxta.slice();
  const teng = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
  const boshmi = (taxta) => taxta.every((v) => v === BOSH);

  // Kataklar ro'yxati: [[x, y], ...] — takrorsiz va chegara ichida
  function tozalaKataklar(list) {
    const set = new Set();
    const out = [];
    for (const [x, y] of list) {
      if (!ichida(x, y)) continue;
      const i = indeks(x, y);
      if (set.has(i)) continue;
      set.add(i);
      out.push([x, y]);
    }
    return out;
  }
  const kataklarTeng = (a, b) => {
    const sa = new Set(a.map(([x, y]) => indeks(x, y)));
    const sb = new Set(b.map(([x, y]) => indeks(x, y)));
    if (sa.size !== sb.size) return false;
    for (const i of sa) if (!sb.has(i)) return false;
    return true;
  };

  // Kataklarni rangga bo'yash — yangi taxta qaytaradi (eski o'zgarmaydi)
  function qoy(taxta, kataklar, rang) {
    const out = nusxa(taxta);
    const v = typeof rang === "number" ? rang : rangIdx(rang);
    for (const [x, y] of kataklar) if (ichida(x, y)) out[indeks(x, y)] = v;
    return out;
  }

  // ---------- Rasterlash ----------
  // Bbox: a va b burchaklari qanday bo'lmasin — chap-tepa (x0, y0) va o'ng-past (x1, y1)
  function bbox(a, b) {
    return {
      x0: Math.min(a[0], b[0]), y0: Math.min(a[1], b[1]),
      x1: Math.max(a[0], b[0]), y1: Math.max(a[1], b[1]),
    };
  }
  const olcham = (a, b) => {
    const r = bbox(a, b);
    return { eni: r.x1 - r.x0 + 1, boyi: r.y1 - r.y0 + 1 };
  };

  // Chiziq — Brezenxem (8-qo'shni). Doim chapdagi (teng bo'lsa — tepadagi) uchdan chiziladi,
  // shunda a → b va b → a bir xil kataklarni beradi.
  function chiziq(a, b) {
    if (a[0] > b[0] || (a[0] === b[0] && a[1] > b[1])) [a, b] = [b, a];
    return brezenxem(a, b);
  }
  // a dan b ga (yo'nalish saqlanadi — uchburchak qirrasi uchidan boshlanadi)
  function brezenxem(a, b) {
    let [x0, y0] = a;
    const [x1, y1] = b;
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    const out = [];
    for (let k = 0; k < 4 * (W + H); k++) {
      out.push([x0, y0]);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
    return tozalaKataklar(out);
  }

  function tortburchak(a, b, toliq) {
    const r = bbox(a, b);
    const out = [];
    for (let y = r.y0; y <= r.y1; y++) {
      for (let x = r.x0; x <= r.x1; x++) {
        if (toliq || x === r.x0 || x === r.x1 || y === r.y0 || y === r.y1) out.push([x, y]);
      }
    }
    return tozalaKataklar(out);
  }

  // Qatorlar bo'yicha to'ldirish: har qatorda chetki kataklar orasi (qavariq shakllar uchun)
  function qatorToldir(chegara) {
    const qator = new Map();
    for (const [x, y] of chegara) {
      const q = qator.get(y);
      if (!q) qator.set(y, [x, x]);
      else { q[0] = Math.min(q[0], x); q[1] = Math.max(q[1], x); }
    }
    const out = [];
    for (const [y, [xa, xb]] of qator) for (let x = xa; x <= xb; x++) out.push([x, y]);
    return out;
  }

  // Ellips — bbox ichiga chizilgan (A. Zingl algoritmi, juft o'lchamlarda ham ishlaydi, simmetrik).
  // Eni yoki bo'yi 1 bo'lsa — chiziq (to'rtburchak bilan bir xil).
  function ellipsChegara(a, b) {
    const r = bbox(a, b);
    if (r.x1 === r.x0 || r.y1 === r.y0) return tortburchak(a, b, true);
    let x0 = r.x0;
    let y0 = r.y0;
    let x1 = r.x1;
    let y1 = r.y1;
    let aa = x1 - x0;
    const bb = y1 - y0;
    let b1 = bb & 1;
    let dx = 4 * (1 - aa) * bb * bb;
    let dy = 4 * (b1 + 1) * aa * aa;
    let err = dx + dy + b1 * aa * aa;
    y0 += Math.floor((bb + 1) / 2);
    y1 = y0 - b1;
    aa = 8 * aa * aa;
    b1 = 8 * bb * bb;
    const out = [];
    do {
      out.push([x1, y0], [x0, y0], [x0, y1], [x1, y1]);
      const e2 = 2 * err;
      if (e2 <= dy) { y0++; y1--; dy += aa; err += dy; }
      if (e2 >= dx || 2 * err > dy) { x0++; x1--; dx += b1; err += dx; }
    } while (x0 <= x1);
    while (y0 - y1 < bb) {
      out.push([x0 - 1, y0], [x1 + 1, y0]);
      y0++;
      out.push([x0 - 1, y1], [x1 + 1, y1]);
      y1--;
    }
    return tozalaKataklar(out);
  }
  function ellips(a, b, toliq) {
    const chegara = ellipsChegara(a, b);
    return toliq ? tozalaKataklar(qatorToldir(chegara)) : chegara;
  }

  // Uchburchak — uchi tepada (o'rtada), asosi pastda, bbox ichida. O'ng qirra chap qirraning ko'zgusi — simmetrik.
  function uchburchakChegara(a, b) {
    const r = bbox(a, b);
    const chapUch = Math.floor((r.x0 + r.x1) / 2);
    const chap = brezenxem([chapUch, r.y0], [r.x0, r.y1]);
    const ong = chap.map(([x, y]) => [r.x0 + r.x1 - x, y]);
    const asos = tortburchak([r.x0, r.y1], [r.x1, r.y1], true);
    return tozalaKataklar(chap.concat(ong, asos));
  }
  function uchburchak(a, b, toliq) {
    const chegara = uchburchakChegara(a, b);
    return toliq ? tozalaKataklar(qatorToldir(chegara)) : chegara;
  }

  // Shaklning ichi — to'la va bo'sh variantlari farqi (chelak vazifasida "aynan ichi" shu)
  function shaklIchi(asbob, a, b) {
    const hammasi = rasterla({ asbob, a, b, toliq: true });
    const chegara = rasterla({ asbob, a, b, toliq: false });
    const set = new Set(chegara.map(([x, y]) => indeks(x, y)));
    return hammasi.filter(([x, y]) => !set.has(indeks(x, y)));
  }

  // Chelak: 4-qo'shni to'ldirish — bosilgan katak rangidagi tutash sohani topadi (bo'yash alohida: qoy)
  function toldir(taxta, x, y) {
    if (!ichida(x, y)) return [];
    const bosh = taxta[indeks(x, y)];
    const korildi = new Uint8Array(N);
    const navbat = [[x, y]];
    korildi[indeks(x, y)] = 1;
    const out = [];
    while (navbat.length) {
      const [cx, cy] = navbat.pop();
      out.push([cx, cy]);
      for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
        if (!ichida(nx, ny)) continue;
        const i = indeks(nx, ny);
        if (korildi[i] || taxta[i] !== bosh) continue;
        korildi[i] = 1;
        navbat.push([nx, ny]);
      }
    }
    return out;
  }

  // Harakat → kataklar (taxtaga bog'liq emas; chelak uchun bajar() kerak)
  // Harakat: { asbob, rang, toliq, a: [x, y], b: [x, y] } yoki qalam/o'chirg'ich: { asbob, rang, kataklar }
  function rasterla(h) {
    switch (h.asbob) {
      case "chiziq": return chiziq(h.a, h.b);
      case "tortburchak": return tortburchak(h.a, h.b, !!h.toliq);
      case "doira": return ellips(h.a, h.b, !!h.toliq);
      case "uchburchak": return uchburchak(h.a, h.b, !!h.toliq);
      case "qalam": case "ochirgich": return tozalaKataklar(h.kataklar || (h.a ? [h.a] : []));
      default: return [];
    }
  }

  // Harakatni taxtada bajarish → { taxta, kataklar } (chelak — bosilgan sohani to'ldiradi)
  function bajar(taxta, h) {
    if (h.asbob === "chelak") {
      const rang = rangIdx(h.rang);
      const kataklar = taxta[indeks(h.a[0], h.a[1])] === rang ? [] : toldir(taxta, h.a[0], h.a[1]);
      return { taxta: qoy(taxta, kataklar, rang), kataklar };
    }
    const kataklar = rasterla(h);
    const rang = h.asbob === "ochirgich" ? BOSH : rangIdx(h.rang);
    return { taxta: qoy(taxta, kataklar, rang), kataklar };
  }

  // Harakatlar ro'yxatini bo'sh taxtada ketma-ket bajarish
  function harakatlarTaxta(harakatlar, bosh) {
    let t = bosh ? nusxa(bosh) : boshTaxta();
    for (const h of harakatlar) t = bajar(t, h).taxta;
    return t;
  }

  // ---------- Tarix: bekor / qaytar (o'zgarmas uslub) ----------
  const tarixYasa = (taxta) => ({ otgan: [], hozir: taxta || boshTaxta(), kelgusi: [] });
  function tarixQoy(t, taxta) {
    const otgan = t.otgan.concat([t.hozir]);
    return { otgan: otgan.slice(-TARIX_CHEGARA), hozir: taxta, kelgusi: [] };
  }
  function tarixBekor(t) {
    if (!t.otgan.length) return t;
    return { otgan: t.otgan.slice(0, -1), hozir: t.otgan[t.otgan.length - 1], kelgusi: [t.hozir].concat(t.kelgusi) };
  }
  function tarixQaytar(t) {
    if (!t.kelgusi.length) return t;
    return { otgan: t.otgan.concat([t.hozir]), hozir: t.kelgusi[0], kelgusi: t.kelgusi.slice(1) };
  }
  const bekorMumkin = (t) => t.otgan.length > 0;
  const qaytarMumkin = (t) => t.kelgusi.length > 0;

  // ---------- Kodlash: galereya uchun qisqa satr ----------
  // "32x24:" + run-length: son (1 bo'lsa yozilmaydi) + belgi; belgi: "." — bo'sh, a–l — palitra indeksi
  // (rang belgisi harf, soni raqam — shunda "213" kabi satr ikki xil o'qilmaydi)
  const BELGI = "abcdefghijkl";
  const belgiOf = (v) => (v === BOSH ? "." : BELGI[v]);
  function kodla(taxta) {
    let out = `${W}x${H}:`;
    let i = 0;
    while (i < taxta.length) {
      let j = i;
      while (j < taxta.length && taxta[j] === taxta[i]) j++;
      const n = j - i;
      out += (n > 1 ? String(n) : "") + belgiOf(taxta[i]);
      i = j;
    }
    return out;
  }
  function och(satr) {
    if (typeof satr !== "string") return null;
    const bosh = `${W}x${H}:`;
    if (!satr.startsWith(bosh)) return null;
    const out = [];
    const re = /(\d*)([.a-l])/g;
    const tana = satr.slice(bosh.length);
    let pos = 0;
    let m;
    while ((m = re.exec(tana))) {
      if (m.index !== pos) return null;
      pos = re.lastIndex;
      const n = m[1] ? Number(m[1]) : 1;
      const v = m[2] === "." ? BOSH : BELGI.indexOf(m[2]);
      for (let k = 0; k < n; k++) out.push(v);
      if (out.length > N) return null;
    }
    if (pos !== tana.length || out.length !== N) return null;
    return out;
  }

  // ---------- Namunalar (darslar) ----------
  // Har qadam bitta shakl { matn, asbob, rang, toliq, a, b } yoki qalam { matn, asbob: "qalam", rang, kataklar }.
  // Kutilgan kataklar qadamdan rasterlanadi. Hammasi 32 × 24 ga sig'adi (test tekshiradi).
  const Q = (matn, asbob, rang, toliq, a, b) => ({ matn, asbob, rang, toliq, a, b });
  const QALAM = (matn, rang, kataklar) => ({ matn, asbob: "qalam", rang, kataklar });

  const NAMUNALAR = [
    {
      id: "uy", nom: "Uy",
      qadamlar: [
        Q("Devor", "tortburchak", "kok", true, [8, 11], [23, 21]),
        Q("Tom", "uchburchak", "qizil", true, [6, 4], [25, 10]),
        Q("Eshik", "tortburchak", "jigarrang", true, [10, 16], [13, 21]),
        Q("Deraza", "tortburchak", "sariq", true, [16, 13], [20, 16]),
        Q("Moʻri", "tortburchak", "jigarrang", true, [19, 2], [20, 6]),
        QALAM("Tutun", "kulrang", [[21, 1], [22, 0], [23, 0], [24, 1]]),
      ],
    },
    {
      id: "daraxt", nom: "Daraxt",
      qadamlar: [
        Q("Tana", "tortburchak", "jigarrang", true, [14, 13], [17, 21]),
        Q("Barglar", "doira", "yashil", true, [7, 2], [24, 15]),
        Q("Oʻt", "tortburchak", "ochyashil", true, [2, 22], [29, 23]),
        Q("Olma", "doira", "qizil", true, [10, 6], [13, 9]),
        Q("Yana olma", "doira", "qizil", true, [18, 8], [21, 11]),
      ],
    },
    {
      id: "quyosh", nom: "Quyosh",
      qadamlar: [
        Q("Quyosh", "doira", "sariq", true, [11, 7], [19, 15]),
        Q("Halqa", "doira", "toqsariq", false, [9, 5], [21, 17]),
        Q("Nur tepaga", "chiziq", "toqsariq", null, [15, 0], [15, 3]),
        Q("Nur pastga", "chiziq", "toqsariq", null, [15, 19], [15, 22]),
        Q("Nur chapga", "chiziq", "toqsariq", null, [3, 11], [7, 11]),
        Q("Nur oʻngga", "chiziq", "toqsariq", null, [23, 11], [27, 11]),
      ],
    },
    {
      id: "mashina", nom: "Mashina",
      qadamlar: [
        Q("Kuzov", "tortburchak", "qizil", true, [4, 12], [27, 17]),
        Q("Kabina", "tortburchak", "qizil", true, [10, 7], [21, 11]),
        Q("Deraza", "tortburchak", "ochkok", true, [13, 8], [18, 10]),
        Q("Gʻildirak", "doira", "qora", true, [7, 16], [11, 20]),
        Q("Yana gʻildirak", "doira", "qora", true, [20, 16], [24, 20]),
        Q("Chiroq", "tortburchak", "sariq", true, [26, 13], [27, 14]),
      ],
    },
    {
      id: "kema", nom: "Kema",
      qadamlar: [
        Q("Suv", "tortburchak", "kok", true, [0, 18], [31, 23]),
        Q("Korpus", "tortburchak", "jigarrang", true, [5, 13], [26, 15]),
        Q("Korpus pasti", "tortburchak", "jigarrang", true, [8, 16], [23, 17]),
        Q("Yelkan", "tortburchak", "sariq", true, [9, 4], [21, 11]),
        Q("Machta", "chiziq", "qora", null, [15, 1], [15, 12]),
        Q("Bayroq", "tortburchak", "qizil", true, [16, 1], [19, 2]),
      ],
    },
    {
      id: "robot", nom: "Robot",
      qadamlar: [
        Q("Tana", "tortburchak", "kok", true, [10, 10], [21, 18]),
        Q("Bosh", "tortburchak", "kulrang", true, [12, 2], [19, 9]),
        QALAM("Koʻzlar", "sariq", [[13, 4], [14, 4], [13, 5], [14, 5], [17, 4], [18, 4], [17, 5], [18, 5]]),
        Q("Ogʻiz", "chiziq", "qizil", null, [14, 7], [17, 7]),
        QALAM("Oyoqlar", "kulrang", [[12, 19], [12, 20], [12, 21], [12, 22], [19, 19], [19, 20], [19, 21], [19, 22]]),
        QALAM("Qoʻllar", "kulrang", [[7, 12], [8, 12], [9, 12], [22, 12], [23, 12], [24, 12]]),
      ],
    },
  ];
  const namunaById = (id) => NAMUNALAR.find((n) => n.id === id) || null;
  const qadamKataklari = (qadam) => rasterla(qadam);
  // Namuna taxtasi: birinchi k qadamdan keyin (k berilmasa — tayyor rasm)
  const namunaTaxta = (namuna, k) => harakatlarTaxta(namuna.qadamlar.slice(0, k == null ? namuna.qadamlar.length : k));

  // Qadam ko'rsatmasi: "Devor: koʻk toʻrtburchak chiz (ichi toʻla)" / "Tutun: kulrang qalam bilan soyani boʻya"
  function qadamMatni(qadam) {
    const rang = rangNomi(qadam.rang);
    if (qadam.asbob === "qalam") return `${qadam.matn}: ${rang} qalam bilan soyani boʻya`;
    const asbob = asbobById(qadam.asbob);
    const toliq = qadam.asbob === "chiziq" ? "" : qadam.toliq ? " (ichi toʻla)" : " (ichi boʻsh)";
    return `${qadam.matn}: ${rang} ${asbob.nom} ${asbob.fel}${toliq}`;
  }

  // Qadam vazifasi (2–3-bosqich): k — qadam raqami (0 dan)
  function qadamTask(namuna, k, qiyin) {
    const qadam = namuna.qadamlar[k];
    const kutilgan = qadamKataklari(qadam);
    const javob = qadam.asbob === "qalam"
      ? { asbob: "qalam", rang: qadam.rang, kataklar: qadam.kataklar }
      : { asbob: qadam.asbob, rang: qadam.rang, toliq: !!qadam.toliq, a: qadam.a, b: qadam.b };
    return {
      tur: "qadam", id: `${namuna.id}:${k}`, namuna: namuna.id, k, jami: namuna.qadamlar.length,
      qadam, matn: qadamMatni(qadam), kutilgan, rang: qadam.rang,
      chegara: qiyin ? QIYIN_CHEGARA : CHEGARA, soya: !qiyin, javob,
    };
  }

  // Qadam tekshiruvi: kutilgan kataklarning ≥ chegara ulushi to'g'ri rangda VA qadam tashqarisida
  // o'zgargan kataklar kutilganning ≤ (1 − chegara) ulushi. oldin — qadam boshidagi taxta.
  function qadamTekshir(oldin, hozir, kutilgan, rang, chegara) {
    const c = chegara || CHEGARA;
    const v = typeof rang === "number" ? rang : rangIdx(rang);
    const set = new Set(kutilgan.map(([x, y]) => indeks(x, y)));
    let togri = 0;
    let boyalgan = 0; // kutilgan kataklardan bo'yalgani (rangidan qat'i nazar) — maslahat uchun
    for (const i of set) {
      if (hozir[i] === v) togri++;
      if (hozir[i] !== oldin[i]) boyalgan++;
    }
    let ortiqcha = 0;
    for (let i = 0; i < N; i++) if (!set.has(i) && hozir[i] !== oldin[i]) ortiqcha++;
    const jami = set.size;
    const kerak = Math.ceil(c * jami - 1e-9);
    const ruxsat = Math.floor((1 - c) * jami + 1e-9);
    const ok = togri >= kerak && ortiqcha <= ruxsat;
    const sabab = ok ? null : ortiqcha > ruxsat ? "ortiqcha" : boyalgan >= kerak ? "rang" : "kam";
    return { ok, togri, jami, kerak, ortiqcha, ruxsat, ulush: jami ? togri / jami : 0, sabab };
  }

  // ---------- 1-bosqich: asbob vazifalari ----------
  const bosh = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const kalit = (p) => `${p[0]},${p[1]}`;

  // "Koʻk toʻrtburchak chiz" — tier 0: asbob + rang; 1: + ichi to'la / bo'sh; 2: + o'lcham
  function shaklTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      const asbob = t === 1 ? pick(["tortburchak", "doira", "uchburchak"], rr) : pick(SHAKL_ID, rr);
      const rang = pick(RANG_ID, rr);
      const chiziqmi = asbob === "chiziq";
      const toliq = t >= 1 && !chiziqmi ? pick([true, false], rr) : null;
      const min = t === 2 ? (chiziqmi ? 8 : 6) : 3;
      const a = asbobById(asbob);
      let matn = `${bosh(rangNomi(rang))} ${a.nom} ${a.fel}`;
      if (toliq != null) matn += toliq ? " (ichi toʻla)" : " (ichi boʻsh)";
      if (t === 2) matn += `, ${chiziqmi ? "uzunligi" : "eni"} kamida ${min} katak`;
      const eni = Math.max(min, 6);
      const javob = chiziqmi
        ? { asbob, rang, toliq: false, min, a: [6, 10], b: [6 + eni + 1, 10] }
        : { asbob, rang, toliq: !!toliq, min, a: [10, 6], b: [10 + eni - 1, 6 + 5] };
      return {
        tur: "asbob", amal: "shakl", id: `shakl:${asbob}:${rang}:${toliq}:${min}`, tier: t,
        asbob, rang, toliq, min, matn, boshlangich: [], javob,
      };
    }, prev, r);
  }

  // "Doirani qizilga toʻldir" — maydonda tayyor bo'sh shakl bor, ichi aynan shu rangga o'zgarishi kerak
  function toldirTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      const shakl = pick(t === 2 ? ["doira", "tortburchak", "uchburchak"] : ["doira", "tortburchak"], rr);
      const chegaraRang = pick(RANG_ID, rr);
      const rang = pick(RANG_ID.filter((id) => id !== chegaraRang), rr);
      const eni = int(rr, 10, 14);
      const boyi = int(rr, 8, 12);
      const x0 = int(rr, 2, W - 2 - eni);
      const y0 = int(rr, 2, H - 2 - boyi);
      const a = [x0, y0];
      const b = [x0 + eni - 1, y0 + boyi - 1];
      const ichki = shaklIchi(shakl, a, b);
      if (ichki.length < 6) return null;
      // Chelak uchun ichki nuqta: markazga eng yaqin ichki katak
      const cx = (a[0] + b[0]) / 2;
      const cy = (a[1] + b[1]) / 2;
      const nuqta = ichki.slice().sort((p, q) => Math.hypot(p[0] - cx, p[1] - cy) - Math.hypot(q[0] - cx, q[1] - cy))[0];
      const s = asbobById(shakl);
      return {
        tur: "asbob", amal: "toldir", id: `toldir:${shakl}:${rang}:${kalit(a)}:${kalit(b)}`, tier: t,
        asbob: "chelak", rang, shakl, ichki,
        matn: `${bosh(s.nom)}ni ${rangById(rang).jonalish} toʻldir`,
        boshlangich: [{ asbob: shakl, rang: chegaraRang, toliq: false, a, b }],
        javob: { asbob: "chelak", rang, a: nuqta },
      };
    }, prev, r);
  }

  // "Oxirgi ishni bekor qil" — taxtada 3 ta tayyor shakl (tarixda), tier 2 da oxirgi 2 tasi qaytariladi
  function bekorTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      const soni = t === 2 ? 2 : 1;
      const harakatlar = [];
      const ranglar = [];
      for (let k = 0; k < 3; k++) {
        const shakl = pick(["tortburchak", "doira", "uchburchak"], rr);
        const rang = pick(RANG_ID.filter((id) => !ranglar.includes(id)), rr);
        ranglar.push(rang);
        const eni = int(rr, 5, 9);
        const boyi = int(rr, 5, 8);
        const x0 = int(rr, 1 + k * 10, 1 + k * 10 + (10 - eni)); // uchta shakl uch ustunda — ustma-ust tushmaydi
        const y0 = int(rr, 2, H - 2 - boyi);
        harakatlar.push({ asbob: shakl, rang, toliq: true, a: [x0, y0], b: [x0 + eni - 1, y0 + boyi - 1] });
      }
      const kutilganTaxta = harakatlarTaxta(harakatlar.slice(0, 3 - soni));
      return {
        tur: "asbob", amal: "bekor", id: `bekor:${soni}:${harakatlar.map((h) => h.asbob + kalit(h.a)).join(":")}`, tier: t,
        asbob: "bekor", soni, matn: soni === 1 ? "Oxirgi ishni bekor qil" : "Oxirgi 2 ta ishni bekor qil",
        boshlangich: harakatlar, kutilganTaxta,
        javob: { asbob: "bekor", soni },
      };
    }, prev, r);
  }

  const BOSQICH1 = [shaklTask, toldirTask, shaklTask, bekorTask];
  // n — nechanchi to'g'ri javob (vazifa turi navbati), tier — qiyinlik zinasi
  const bosqich1Task = (r, prev, n, tier) => BOSQICH1[(n || 0) % BOSQICH1.length](r, prev, tier);

  // Harakat jurnali bo'yicha tekshiruv (1-bosqich). jurnal — tugallangan harakatlar (oxirgisi — oxirida):
  // chizish: { asbob, rang, toliq, a, b, kataklar }; tarix: { asbob: "bekor" | "qaytar" | "tozalash" }.
  // Natija: { ok, sabab } — sabab: asbob | rang | toliq | olcham | joy | bekor | kop | kutish.
  // "kutish" — bu harakat urinish emas (masalan, shakl vazifasida bekor bosildi) — ekran e'tibor bermaydi.
  function harakatTekshir(task, jurnal, taxta) {
    const h = jurnal[jurnal.length - 1];
    if (!h) return { ok: false, sabab: "kutish" };
    if (task.amal === "bekor") {
      if (teng(taxta, task.kutilganTaxta)) return { ok: true, sabab: null };
      // Kerakligidan ko'p qaytarilgan: taxta yanada oldingi holatlardan biriga teng
      const kerak = task.boshlangich.length - task.soni;
      for (let j = 0; j < kerak; j++) {
        if (teng(taxta, harakatlarTaxta(task.boshlangich.slice(0, j)))) return { ok: false, sabab: "kop" };
      }
      return { ok: false, sabab: "bekor" };
    }
    if (TARIX_AMAL.includes(h.asbob)) return { ok: false, sabab: "kutish" };
    if (task.amal === "toldir") {
      if (h.asbob !== "chelak") return { ok: false, sabab: "asbob" };
      if (h.rang !== task.rang) return { ok: false, sabab: "rang" };
      if (!kataklarTeng(h.kataklar || [], task.ichki)) return { ok: false, sabab: "joy" };
      return { ok: true, sabab: null };
    }
    // shakl
    if (h.asbob !== task.asbob) return { ok: false, sabab: "asbob" };
    if (h.rang !== task.rang) return { ok: false, sabab: "rang" };
    if (task.toliq != null && !!h.toliq !== task.toliq) return { ok: false, sabab: "toliq" };
    const o = olcham(h.a, h.b);
    const min = task.min || 3;
    if (task.asbob === "chiziq") {
      if (Math.max(o.eni, o.boyi) < min) return { ok: false, sabab: "olcham" };
    } else if (o.eni < min || o.boyi < 3) {
      return { ok: false, sabab: "olcham" };
    }
    return { ok: true, sabab: null };
  }

  const api = {
    W, H, N, BOSH, TARIX_CHEGARA, CHEGARA, QIYIN_CHEGARA,
    PALITRA, RANG_ID, rangById, rangIdx, rangNomi, ASBOBLAR, ASBOB_ID, SHAKL_ID, asbobById, asbobNomi, CHIZISH, TARIX_AMAL,
    ichida, indeks, boshTaxta, nusxa, teng, boshmi, tozalaKataklar, kataklarTeng, qoy,
    bbox, olcham, chiziq, tortburchak, ellips, uchburchak, shaklIchi, toldir, rasterla, bajar, harakatlarTaxta,
    tarixYasa, tarixQoy, tarixBekor, tarixQaytar, bekorMumkin, qaytarMumkin,
    kodla, och,
    NAMUNALAR, namunaById, qadamKataklari, namunaTaxta, qadamMatni, qadamTask, qadamTekshir,
    shaklTask, toldirTask, bekorTask, BOSQICH1, bosqich1Task, harakatTekshir,
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
