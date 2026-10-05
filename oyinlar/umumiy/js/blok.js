// 8–11 yosh dasturlash bloki (62–65-o'yinlar) uchun umumiy blok dvigateli (sof mantiq).
// Bloklar: yur, takror, agar, toki (while), gulxangacha, chaqir (★ / ● funksiya), qoy / qosh (qadam hisoblagichi).
// Har dastur ikki ko'rinishda: bloklar va Python matni (pythonQatorlar) — test ikkalasi bir xil yo'l yurishini tekshiradi.
// 47-o'yindagi bajar() shu yerga kengaytirib ko'chirildi; 47 o'z nusxasi bilan ishlayveradi.
// Node'da test qilinadi: umumiy/tests/blok.test.js
(function (root) {
  "use strict";

  const D = (root.QK && root.QK.dastur) || require("./dastur.js");

  const YURISH_CHEGARA = 200; // cheksiz takror / while'ni to'xtatadi
  const AMAL_CHEGARA = 1000; // ichida yurish yo'q while ham to'xtasin
  const CHUQUR_CHEGARA = 20;
  const FN_NOMLAR = ["yulduz", "doira"];
  const FN_BELGI = { yulduz: "★", doira: "●" };
  const OQ = { right: "→", left: "←", up: "↑", down: "↓" };
  const YON_NOM = { right: "oʻng", left: "chap", up: "yuqori", down: "past" };
  const PY_YUR = { right: "ongga", left: "chapga", up: "yuqoriga", down: "pastga" };
  const PY_YON = { right: "ong", left: "chap", up: "yuqori", down: "past" };
  const YONLAR = ["right", "left", "up", "down"];
  const TESKARI = { right: "left", left: "right", up: "down", down: "up" };

  // ---------- Bloklar ----------
  const yur = (yon) => ({ t: "yur", yon });
  const takror = (n, ichi) => ({ t: "takror", n, ichi: ichi || [] }); // n — son yoki "qadam"
  const agar = (yon, ichi, aks) => ({ t: "agar", yon, ichi: ichi || [], aks: aks || [] });
  const toki = (yon, ichi) => ({ t: "toki", yon, ichi: ichi || [] }); // shu yon bo'sh ekan
  const gulxangacha = (ichi) => ({ t: "gulxangacha", ichi: ichi || [] });
  const chaqir = (nom) => ({ t: "chaqir", nom });
  const qoy = (n) => ({ t: "qoy", n: n || 0 });
  const qosh = () => ({ t: "qosh" });
  const kop = (yon, n) => Array.from({ length: n }, () => yur(yon));
  const nusxa = (x) => JSON.parse(JSON.stringify(x));

  const qoshni = (at, yon) => ({ x: at.x + D.DIRS[yon].dx, y: at.y + D.DIRS[yon].dy });
  const bosh = (f, at, yon) => {
    const n = qoshni(at, yon);
    return D.inside(f, n) && !D.isWall(f, n);
  };
  const maydon = (robot, goal, walls, w, h) => D.field({ w: w || 5, h: h || 5, robot, goal, walls: walls || [] });

  // ---------- Bajarish ----------
  // status: goal — gulxanga yetdi (qolgani bajarilmaydi), wall / edge — urildi, end — dastur tugadi,
  // uzun — takror to'xtamadi (yurish yoki amal chegarasi). iz — animatsiya: {tur:"yur", at} | {tur:"var", qiymat}
  function bajar(f, dastur, opts) {
    const fn = (opts && opts.fn) || {};
    const h = { at: { x: f.robot.x, y: f.robot.y }, qadam: 0, amal: 0, status: null, qiymat: 0 };
    const path = [{ x: h.at.x, y: h.at.y }];
    const iz = [];
    if (D.sameCell(h.at, f.goal)) h.status = "goal";

    function amal() {
      h.amal++;
      if (h.amal > AMAL_CHEGARA) h.status = "uzun";
      return !h.status;
    }
    function qadamla(yon) {
      const next = qoshni(h.at, yon);
      h.qadam++;
      if (h.qadam > YURISH_CHEGARA) { h.status = "uzun"; return; }
      if (!D.inside(f, next)) { h.status = "edge"; return; }
      if (D.isWall(f, next)) { h.status = "wall"; return; }
      h.at = next;
      path.push(next);
      iz.push({ tur: "yur", at: next });
      if (D.sameCell(next, f.goal)) h.status = "goal";
    }
    function qiymat(v) {
      h.qiymat = v;
      iz.push({ tur: "var", qiymat: v });
    }

    function royxat(bloklar, chuqur) {
      for (const b of bloklar) {
        if (h.status || !amal()) return;
        if (b.t === "yur") qadamla(b.yon);
        else if (b.t === "takror") {
          const n = b.n === "qadam" ? h.qiymat : b.n; // Python range() kabi — bir marta hisoblanadi
          for (let k = 0; k < n; k++) {
            if (h.status) return;
            royxat(b.ichi, chuqur);
          }
        } else if (b.t === "agar") royxat(bosh(f, h.at, b.yon) ? b.ichi : b.aks, chuqur);
        else if (b.t === "toki") {
          while (!h.status && bosh(f, h.at, b.yon)) {
            if (!amal()) return;
            royxat(b.ichi, chuqur);
          }
        } else if (b.t === "gulxangacha") {
          while (!h.status && !D.sameCell(h.at, f.goal)) {
            if (!amal()) return;
            royxat(b.ichi, chuqur);
          }
        } else if (b.t === "chaqir") {
          if (chuqur >= CHUQUR_CHEGARA) { h.status = "uzun"; return; }
          royxat(fn[b.nom] || [], chuqur + 1);
        } else if (b.t === "qoy") qiymat(b.n || 0);
        else if (b.t === "qosh") qiymat(h.qiymat + 1);
      }
    }

    royxat(dastur, 0);
    return { path, status: h.status || "end", at: h.at, qadam: h.qadam, iz, qiymat: h.qiymat };
  }

  // Bloklar soni: ichkaridagilar va funksiya tanalari ham (har biri bir marta)
  function soni(dastur, fn) {
    let n = 0;
    for (const b of dastur) {
      n++;
      if (b.ichi) n += soni(b.ichi);
      if (b.aks) n += soni(b.aks);
    }
    if (fn) for (const nom of Object.keys(fn)) n += soni(fn[nom]);
    return n;
  }

  // Dastur hamma maydonda gulxanga yetadimi. uzun — bloklar chegarasidan oshgan.
  function tekshir(maydonlar, dastur, fn, maxBlok) {
    const natijalar = maydonlar.map((f) => bajar(f, dastur, { fn }));
    const yiqilgan = natijalar.findIndex((r) => r.status !== "goal");
    return { ok: yiqilgan < 0, natijalar, yiqilgan, uzun: maxBlok ? soni(dastur, fn) > maxBlok : false };
  }

  // Yurishlar ketma-ketligini faqat yur + takror (2..9 marta, ichma-ich ham) bilan yozishning eng kam bloklari.
  // c(s) = min( c(a) + c(b) bo'lish bo'yicha, 1 + c(u) agar s = u^k ). 62-o'yin: "funksiyasiz sig'maydi".
  function ixchamNarx(yurishlar) {
    const s = yurishlar.slice();
    const n = s.length;
    if (!n) return 0;
    const c = Array.from({ length: n }, () => new Array(n + 1).fill(0));
    const davriy = (i, j, p) => {
      for (let k = i + p; k < j; k++) if (s[k] !== s[k - p]) return false;
      return true;
    };
    for (let len = 1; len <= n; len++) {
      for (let i = 0; i + len <= n; i++) {
        const j = i + len;
        if (len === 1) { c[i][j] = 1; continue; }
        let best = Infinity;
        for (let k = i + 1; k < j; k++) best = Math.min(best, c[i][k] + c[k][j]);
        for (let p = 1; p <= len / 2; p++) {
          if (len % p || len / p > 9) continue;
          if (davriy(i, j, p)) best = Math.min(best, 1 + c[i][i + p]);
        }
        c[i][j] = best;
      }
    }
    return c[0][n];
  }

  // ---------- Python ko'rinishi ----------
  // Qatorlar: { chuqur, qismlar: [string | { m, tahrir: { blok, maydon } }] } — tahrir: 65-o'yinda bosib almashtiriladi
  function pythonQatorlar(dastur, fn) {
    const out = [];
    const qator = (chuqur, ...qismlar) => out.push({ chuqur, qismlar });
    function tana(bloklar, chuqur) {
      if (!bloklar.length) { qator(chuqur, "pass"); return; }
      for (const b of bloklar) blok(b, chuqur);
    }
    function blok(b, chuqur) {
      if (b.t === "yur") qator(chuqur, { m: PY_YUR[b.yon], tahrir: { blok: b, maydon: "yon" } }, "()");
      else if (b.t === "takror") {
        qator(chuqur, "for i in range(", b.n === "qadam" ? "qadam" : { m: String(b.n), tahrir: { blok: b, maydon: "n" } }, "):");
        tana(b.ichi, chuqur + 1);
      } else if (b.t === "agar") {
        qator(chuqur, "if ", { m: PY_YON[b.yon], tahrir: { blok: b, maydon: "yon" } }, "_bosh():");
        tana(b.ichi, chuqur + 1);
        if (b.aks.length) {
          qator(chuqur, "else:");
          tana(b.aks, chuqur + 1);
        }
      } else if (b.t === "toki") {
        qator(chuqur, "while ", { m: PY_YON[b.yon], tahrir: { blok: b, maydon: "yon" } }, "_bosh():");
        tana(b.ichi, chuqur + 1);
      } else if (b.t === "gulxangacha") {
        qator(chuqur, "while not yetdi():");
        tana(b.ichi, chuqur + 1);
      } else if (b.t === "chaqir") qator(chuqur, b.nom + "()");
      else if (b.t === "qoy") qator(chuqur, "qadam = " + (b.n || 0));
      else if (b.t === "qosh") qator(chuqur, "qadam = qadam + 1");
    }
    for (const nom of FN_NOMLAR) {
      if (!fn || !fn[nom]) continue;
      qator(0, "def " + nom + "():");
      tana(fn[nom], 1);
    }
    for (const b of dastur) blok(b, 0);
    return out;
  }

  const qatorMatni = (q) => "    ".repeat(q.chuqur) + q.qismlar.map((x) => (typeof x === "string" ? x : x.m)).join("");
  const pythonMatn = (dastur, fn) => pythonQatorlar(dastur, fn).map(qatorMatni).join("\n");

  // Talqinchimiz uchun tashqi funksiyalar: bloklar bilan bir xil qoida (urilsa yoki gulxanga yetsa — dastur to'xtaydi)
  const TOXTA = { toxta: true };
  function pyTashqi(f) {
    const h = { at: { x: f.robot.x, y: f.robot.y }, status: null, qadam: 0 };
    const path = [{ x: h.at.x, y: h.at.y }];
    if (D.sameCell(h.at, f.goal)) h.status = "goal";
    const tashqi = {};
    for (const yon of YONLAR) {
      tashqi[PY_YUR[yon]] = () => {
        if (h.status) throw TOXTA;
        const next = qoshni(h.at, yon);
        h.qadam++;
        if (h.qadam > YURISH_CHEGARA) h.status = "uzun";
        else if (!D.inside(f, next)) h.status = "edge";
        else if (D.isWall(f, next)) h.status = "wall";
        else {
          h.at = next;
          path.push(next);
          if (D.sameCell(next, f.goal)) h.status = "goal";
        }
        if (h.status) throw TOXTA;
        return null;
      };
      tashqi[PY_YON[yon] + "_bosh"] = () => bosh(f, h.at, yon);
    }
    tashqi.yetdi = () => D.sameCell(h.at, f.goal);
    return { tashqi, natija: (xato) => ({ path, at: h.at, status: h.status || (xato ? "uzun" : "end") }) };
  }

  // ---------- Maydon yasovchilar ----------
  function iz(yurishlar) {
    let x = 0;
    let y = 0;
    const out = [{ x, y }];
    for (const yon of yurishlar) {
      x += D.DIRS[yon].dx;
      y += D.DIRS[yon].dy;
      out.push({ x, y });
    }
    return out;
  }

  // Yurishlar ro'yxatidan maydon: yo'l maydonga aynan sig'adi (pad — tor bo'lsa chetiga joy)
  function yoldanMaydon(yurishlar, pad) {
    const k = iz(yurishlar);
    const minX = Math.min(...k.map((c) => c.x));
    const minY = Math.min(...k.map((c) => c.y));
    const w = Math.max(...k.map((c) => c.x)) - minX + 1;
    const h = Math.max(...k.map((c) => c.y)) - minY + 1;
    const px = w < 3 && pad ? 1 : 0;
    const py = h < 3 && pad ? 1 : 0;
    const joy = (c) => ({ x: c.x - minX + px, y: c.y - minY + py });
    return maydon(joy(k[0]), joy(k[k.length - 1]), [], w + 2 * px, h + 2 * py);
  }

  // Tor yo'l: yo'ldan boshqa hamma katak tosh. Yo'l o'zini kesmasa va yagona bo'lsa (yorliqsiz) — maydon, aks holda null.
  function torYol(yurishlar) {
    const k = iz(yurishlar);
    const kalit = (c) => c.x + "," + c.y;
    if (new Set(k.map(kalit)).size !== k.length) return null;
    const f0 = yoldanMaydon(yurishlar, false);
    const dx = f0.robot.x - k[0].x;
    const dy = f0.robot.y - k[0].y;
    const yol = new Set(k.map((c) => (c.x + dx) + "," + (c.y + dy)));
    const walls = [];
    for (let y = 0; y < f0.h; y++) for (let x = 0; x < f0.w; x++) if (!yol.has(x + "," + y)) walls.push({ x, y });
    const f = maydon(f0.robot, f0.goal, walls, f0.w, f0.h);
    const p = D.solve(f);
    return p && p.length === yurishlar.length ? f : null;
  }

  const randInt = (a, b, rng) => a + Math.floor(rng() * (b - a + 1));
  const pick = (list, rng) => list[Math.floor(rng() * list.length)];

  const api = {
    YURISH_CHEGARA, AMAL_CHEGARA, FN_NOMLAR, FN_BELGI, OQ, YON_NOM, PY_YUR, PY_YON, YONLAR, TESKARI,
    yur, takror, agar, toki, gulxangacha, chaqir, qoy, qosh, kop, nusxa, qoshni, bosh, maydon,
    bajar, soni, tekshir, ixchamNarx, pythonQatorlar, qatorMatni, pythonMatn, pyTashqi,
    iz, yoldanMaydon, torYol, randInt, pick,
  };

  root.QK = root.QK || {};
  root.QK.blok = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
