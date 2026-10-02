// 49-o'yin: tank jangi — sof mantiq (ekransiz). Node'da test qilinadi: tests/jang.test.js
// Maydon tekis: 600 × 400 birlik, 0° — o'ngga, burchak soat strelkasiga TESKARI o'sadi.
// Dastur bajarilganda har harakat "yozuv" ga tushadi; ekran keyin shuni animatsiya qiladi.
(function (root) {
  "use strict";

  const EN = 600, BO = 400;       // maydon o'lchami
  const R = 18;                   // tank radiusi (ekranda aniq ko'rinishi uchun)
  const OQ_UZOQ = 300;            // o'q uchadigan masofa
  const JON = 3, OQ = 3;          // boshlang'ich jon va o'q
  const MAX_HARAKAT = 8;          // bitta satrda nechta harakat bajariladi

  const rad = (gradus) => (gradus * Math.PI) / 180;
  const yaxlit = (x) => Math.round(x * 100) / 100;

  function tank({ id, x, y, burchak = 0, jon = JON, oq = OQ, tur = "bola", aql = null, uzoq = OQ_UZOQ }) {
    return { id, x, y, burchak, jon, oq, tur, aql, uzoq, tirik: true };
  }

  function maydon({ tanklar, tosiqlar = [], nishon = null }) {
    return { en: EN, bo: BO, tanklar: tanklar.map((t) => Object.assign({}, t)), tosiqlar, nishon, yozuv: [], tugadi: null };
  }

  // ---------- geometriya ----------
  const ichida = (m, x, y) => x >= R && x <= m.en - R && y >= R && y <= m.bo - R;
  const tosiqda = (m, x, y) => m.tosiqlar.some((t) =>
    x > t.x - R && x < t.x + t.en + R && y > t.y - R && y < t.y + t.bo + R);
  const bosh = (m, x, y) => ichida(m, x, y) && !tosiqda(m, x, y);
  const masofa = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  // Qadam-baqadam yurish: to'siqqa tegsa — oldingi bo'sh nuqtada to'xtaydi
  function yur(m, t, uzunlik) {
    const yonalish = uzunlik >= 0 ? 1 : -1;
    const qadam = Math.abs(uzunlik);
    // Boshlang'ich nuqta eslab qolinadi: aks holda har qadam yangilangan joydan hisoblanib,
    // tank kerakligidan uzoqqa ketib qoladi
    const x0 = t.x, y0 = t.y;
    let bosib = 0;
    for (let k = 1; k <= qadam; k++) {
      const x = x0 + Math.cos(rad(t.burchak)) * k * yonalish;
      const y = y0 - Math.sin(rad(t.burchak)) * k * yonalish;
      const boshqaTank = m.tanklar.some((x2) => x2.id !== t.id && x2.tirik && Math.hypot(x2.x - x, x2.y - y) < R * 2);
      if (!bosh(m, x, y) || boshqaTank) break;
      t.x = yaxlit(x);
      t.y = yaxlit(y);
      bosib = k;
    }
    return { bosib, toxtadi: bosib < qadam };
  }

  // O'q yo'li: qarshisidagi birinchi tank yoki to'siq
  function otish(m, t) {
    const uzoq = t.uzoq || OQ_UZOQ;
    for (let d = R; d <= uzoq; d += 2) {
      const x = t.x + Math.cos(rad(t.burchak)) * d;
      const y = t.y - Math.sin(rad(t.burchak)) * d;
      if (!ichida(m, x, y) || tosiqda(m, x, y)) return { tegdi: null, x: yaxlit(x), y: yaxlit(y), uzoq: d };
      for (const b of m.tanklar) {
        if (b.id === t.id || !b.tirik) continue;
        if (Math.hypot(b.x - x, b.y - y) <= R) return { tegdi: b.id, x: yaxlit(b.x), y: yaxlit(b.y), uzoq: d };
      }
      if (m.nishon && m.nishon.tirik !== false && Math.hypot(m.nishon.x - x, m.nishon.y - y) <= (m.nishon.r || R)) {
        return { tegdi: "nishon", x: yaxlit(m.nishon.x), y: yaxlit(m.nishon.y), uzoq: d };
      }
    }
    const x = t.x + Math.cos(rad(t.burchak)) * uzoq;
    const y = t.y - Math.sin(rad(t.burchak)) * uzoq;
    return { tegdi: null, x: yaxlit(x), y: yaxlit(y), uzoq };
  }

  // Qarshida nima bor: dushmangacha masofa, bo'lmasa −1
  function korish(m, t) {
    const o = otish(m, t);
    return o.tegdi ? Math.round(o.uzoq) : -1;
  }

  // Eng yaqin tirik dushmanga nisbiy burchak: left(radar()) tankni unga qaratadi.
  // Dushman qolmasa — 0.
  function radarBurchagi(m, t) {
    const dushmanlar = m.tanklar.filter((x) => x.id !== t.id && x.tirik);
    if (m.nishon && m.nishon.tirik !== false) dushmanlar.push(m.nishon);
    if (!dushmanlar.length) return 0;
    let eng = dushmanlar[0];
    for (const d of dushmanlar) if (masofa(t, d) < masofa(t, eng)) eng = d;
    const kerak = (Math.atan2(t.y - eng.y, eng.x - t.x) * 180) / Math.PI;
    return Math.round(((kerak - t.burchak + 540) % 360) - 180);
  }

  // ---------- harakatlar ----------
  // Har biri maydonni o'zgartiradi va yozuvga tushadi
  const HARAKATLAR = {
    move(m, t, n) {
      const r = yur(m, t, n);
      m.yozuv.push({ t: "yur", id: t.id, x: t.x, y: t.y, toxtadi: r.toxtadi });
      return r;
    },
    back(m, t, n) {
      const r = yur(m, t, -n);
      m.yozuv.push({ t: "yur", id: t.id, x: t.x, y: t.y, toxtadi: r.toxtadi });
      return r;
    },
    left(m, t, g) {
      t.burchak = ((t.burchak + g) % 360 + 360) % 360;
      m.yozuv.push({ t: "burul", id: t.id, burchak: t.burchak });
      return { burchak: t.burchak };
    },
    right(m, t, g) {
      return HARAKATLAR.left(m, t, -g);
    },
    fire(m, t) {
      if (t.oq <= 0) {
        m.yozuv.push({ t: "bosh", id: t.id });
        return { otdi: false, sabab: "oq yoq" };
      }
      t.oq -= 1;
      const o = otish(m, t);
      m.yozuv.push({ t: "oq", id: t.id, x: o.x, y: o.y, tegdi: o.tegdi });
      if (o.tegdi === "nishon") {
        m.nishon.tirik = false;
        m.yozuv.push({ t: "nishon-yiqildi" });
      } else if (o.tegdi) {
        const b = m.tanklar.find((x) => x.id === o.tegdi);
        b.jon -= 1;
        if (b.jon <= 0) {
          b.tirik = false;
          m.yozuv.push({ t: "yiqildi", id: b.id });
        }
      }
      return { otdi: true, tegdi: o.tegdi };
    },
    reload(m, t) {
      t.oq = OQ;
      m.yozuv.push({ t: "oqlandi", id: t.id });
      return { oq: t.oq };
    },
  };

  // ---------- robot tanklar ----------
  // Qaror — sof funksiya: bir xil holatda doim bir xil harakat
  function robotHarakati(m, t) {
    const bola = m.tanklar.find((x) => x.tur === "bola" && x.tirik);
    if (!bola) return null;
    const burchakKerak = (Math.atan2(t.y - bola.y, bola.x - t.x) * 180) / Math.PI;
    const farq = ((burchakKerak - t.burchak + 540) % 360) - 180;
    if (t.oq <= 0) return { nom: "reload" };
    // Nishonga aniq qaratish kerak: 200 birlik masofada 8° xato 28 birlikni beradi,
    // tank radiusi esa 14 — ya'ni o'q yonidan o'tib ketadi
    if (Math.abs(farq) > 2) return { nom: Math.sign(farq) > 0 ? "left" : "right", arg: Math.max(1, Math.min(Math.abs(Math.round(farq)), 45)) };
    if (korish(m, t) > 0) return { nom: "fire" };
    if (t.aql === "ovchi" && masofa(t, bola) > 120) return { nom: "move", arg: 20 };
    return { nom: "reload" };
  }

  function robotlarYursin(m) {
    for (const t of m.tanklar) {
      if (t.tur === "bola" || !t.tirik || m.tugadi) continue;
      const q = robotHarakati(m, t);
      if (!q) continue;
      const natija = HARAKATLAR[q.nom](m, t, q.arg);
      // To'siqqa tiralib qolsa, burilib ko'radi — aks holda abadiy devorga suyanib turadi
      if (q.nom === "move" && natija && natija.bosib === 0) HARAKATLAR.left(m, t, 40);
      holatniTekshir(m);
    }
  }

  function holatniTekshir(m) {
    const bola = m.tanklar.find((t) => t.tur === "bola");
    const dushman = m.tanklar.filter((t) => t.tur !== "bola");
    if (bola && !bola.tirik) m.tugadi = "yutqazdi";
    else if (dushman.length && dushman.every((t) => !t.tirik)) m.tugadi = "yutdi";
    else if (m.nishon && m.nishon.tirik === false && !dushman.length) m.tugadi = "yutdi";
    return m.tugadi;
  }

  // ---------- Python uchun tashqi funksiyalar ----------
  // Bitta satr bajarilganda: harakatlar shu yerda maydonni o'zgartiradi va yozuvga tushadi.
  // Python xatolari (brauzerda python/errors.js jang.js dan oldin ulanadi)
  const pyXato = () => (root.QK && root.QK.python && root.QK.python.errors)
    || (typeof module !== "undefined" && module.exports ? require("./python/errors.js") : null);
  const pyTuri = (v) => (typeof v === "string" ? "str" : typeof v === "boolean" ? "bool" : Array.isArray(v) ? "list"
    : v === null || v === undefined ? "NoneType" : typeof v === "number" ? "float" : typeof v === "bigint" ? "int" : "object");

  function tashqiFunksiyalar(m, bolaId, chegara) {
    const t = () => m.tanklar.find((x) => x.id === bolaId);
    const holat = { soni: 0, chegaraOshdi: false };
    const son = (args, nom, pos) => {
      const a = args.length ? args[0] : 0;
      // move("abc") — bolaning xatosi (TypeError), saytniki emas: Python uslubidagi xato tashlanadi
      const sonmi = typeof a === "bigint" || typeof a === "boolean" || (typeof a === "number" && Number.isFinite(a));
      if (!sonmi) {
        const E = pyXato();
        const matn = nom + "() argument must be a number, not '" + pyTuri(a) + "'";
        if (!E) throw new Error(matn);
        throw E.typeError(matn, Object.assign({}, pos || {}, {
          hint: nom + "() ga son berish kerak: " + nom + (nom === "left" || nom === "right" ? "(90)." : "(50).")
            + (typeof a === "string" ? " Qoʻshtirnoq ichidagi «" + a + "» — matn, son emas." : ""),
        }));
      }
      const v = Number(a);
      // Chegara maydon o'lchamiga bog'liq: move(999999) sikl bo'lib qolmasin,
      // lekin maydonning bir chetidan ikkinchisiga yurish mumkin bo'lsin
      return Math.max(-EN, Math.min(EN, Math.round(v)));
    };
    const harakat = (nom, fn) => (args, ctx, pos) => {
      if (m.tugadi) return null;
      holat.soni += 1;
      if (holat.soni > (chegara || MAX_HARAKAT)) {
        holat.chegaraOshdi = true;
        return null;
      }
      const natija = fn(args, pos);
      holatniTekshir(m);
      return natija;
    };
    return {
      holat,
      fn: {
        move: harakat("move", (a, pos) => { HARAKATLAR.move(m, t(), Math.abs(son(a, "move", pos))); return null; }),
        back: harakat("back", (a, pos) => { HARAKATLAR.back(m, t(), Math.abs(son(a, "back", pos))); return null; }),
        left: harakat("left", (a, pos) => { HARAKATLAR.left(m, t(), son(a, "left", pos)); return null; }),
        right: harakat("right", (a, pos) => { HARAKATLAR.right(m, t(), son(a, "right", pos)); return null; }),
        fire: harakat("fire", () => { HARAKATLAR.fire(m, t()); return null; }),
        reload: harakat("reload", () => { HARAKATLAR.reload(m, t()); return null; }),
        scan: () => BigInt(korish(m, t())),
        radar: () => BigInt(radarBurchagi(m, t())),
        hp: () => BigInt(t().jon),
        ammo: () => BigInt(t().oq),
      },
    };
  }

  const api = { EN, BO, R, OQ_UZOQ, JON, OQ, MAX_HARAKAT, rad, tank, maydon, bosh, ichida, tosiqda,
    masofa, yur, otish, korish, radarBurchagi, HARAKATLAR, robotHarakati, robotlarYursin, holatniTekshir, tashqiFunksiyalar };

  root.QK = root.QK || {};
  root.QK.jang = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
