// Kichik C++: daraxtni bajarish. Generator — har buyruqdan keyin holat qaytaradi
// (qadam-baqadam panel uchun; Python dvigatelidagi naqsh takrorlanadi).
(function (root) {
  "use strict";

  const EN = (root.QK && root.QK.cppEngine) || {};
  const E = EN.errors || require("./errors.js");
  const V = EN.values || require("./values.js");

  const QADAM_CHEGARA = 3000000; // Python dvigateli bilan bir xil (kod.js LIMITS)
  const MASSIV_CHEGARA = 100000; // bitta massivdagi kataklar soni (brauzer xotirasi uchun)

  class Env {
    constructor(ota) {
      this.ota = ota;
      this.vars = new Map();
    }
    izla(nom) {
      for (let e = this; e; e = e.ota) if (e.vars.has(nom)) return e.vars.get(nom);
      return null;
    }
    bormi(nom) {
      return this.vars.has(nom);
    }
    qosh(nom, uya) {
      this.vars.set(nom, uya);
    }
  }

  function makeContext(opts) {
    const o = opts || {};
    const xom = (o.stdin || []).join("\n");
    return {
      out: "",
      steps: 0,
      maxSteps: o.maxSteps || QADAM_CHEGARA,
      kirish: xom,
      kirishOrin: 0,
    };
  }

  const qadam = (ctx, pos) => {
    ctx.steps++;
    if (ctx.steps > ctx.maxSteps) throw E.qadamChegarasi(ctx.maxSteps, pos);
  };

  // ---------- cin ----------
  const BUTUN_ANDOZA = /[-+]?\d+/y;
  const KASR_ANDOZA = /[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/y;
  function keyingiSoz(ctx, pos) {
    while (ctx.kirishOrin < ctx.kirish.length && /\s/.test(ctx.kirish[ctx.kirishOrin])) ctx.kirishOrin++;
    if (ctx.kirishOrin >= ctx.kirish.length) throw E.kirishTugadi(pos);
    let j = ctx.kirishOrin;
    while (j < ctx.kirish.length && !/\s/.test(ctx.kirish[j])) j++;
    const soz = ctx.kirish.slice(ctx.kirishOrin, j);
    ctx.kirishOrin = j;
    return soz;
  }

  function oqiQiymat(tur, ctx, pos) {
    if (tur === "char") {
      while (ctx.kirishOrin < ctx.kirish.length && /\s/.test(ctx.kirish[ctx.kirishOrin])) ctx.kirishOrin++;
      if (ctx.kirishOrin >= ctx.kirish.length) throw E.kirishTugadi(pos);
      return V.belgi(ctx.kirish[ctx.kirishOrin++]);
    }
    if (tur === "string") return V.matn(keyingiSoz(ctx, pos));
    // Son: cin so'zning songa o'xshagan BOSHINI oladi, qolgani keyingi o'qishga qoladi (g++ da ham shunday):
    // "3.7" dan int ga 3 tushadi, ".7" navbatda turadi; "12abc" dan 12 olinadi.
    while (ctx.kirishOrin < ctx.kirish.length && /\s/.test(ctx.kirish[ctx.kirishOrin])) ctx.kirishOrin++;
    if (ctx.kirishOrin >= ctx.kirish.length) throw E.kirishTugadi(pos);
    const andoza = tur === "double" ? KASR_ANDOZA : BUTUN_ANDOZA;
    andoza.lastIndex = ctx.kirishOrin;
    const m = andoza.exec(ctx.kirish);
    if (!m) {
      const soz = keyingiSoz(ctx, pos);
      throw E.kirishSoni(soz, /^\.\d/.test(soz) && tur !== "double" ? Object.assign({}, pos, {
        hint: "Butun son kutilgan edi, lekin «" + soz + "» keldi. Bu — oldingi sonning kasr qismi: cin butun songa "
          + "faqat nuqtagacha boʻlgan qismni oladi, qolgani navbatda qoladi (haqiqiy C++ da ham shunday). "
          + "Kasr son oʻqish uchun double ishlat.",
      }) : pos);
    }
    ctx.kirishOrin += m[0].length;
    if (tur === "double") return V.dbl(Number(m[0]));
    const x = BigInt(m[0]);
    const t = tur === "ll" ? "ll" : "int";
    // Turga sig'maydigan son: haqiqiy C++ da o'qish "yiqiladi" — qirqib, boshqa son qilib olmaymiz
    if (V.son(t, x).v !== x) {
      throw E.kirishSoni(m[0], Object.assign({}, pos, {
        hint: "Kiritilgan son «" + m[0] + "» " + (t === "int" ? "int ga sigʻmaydi (int — taxminan ±2 milliard). long long ishlat."
          : "long long ga ham sigʻmaydi."),
      }));
    }
    return V.son(t, x);
  }

  // ---------- Ifodalar ----------
  function uyaTopi(node, env, ctx) {
    if (node.k === "nom") {
      const uya = env.izla(node.nom);
      if (!uya) throw E.tanilmagan(node.nom, node);
      if (uya.massiv) throw E.sintaksis("array name used as a value", node);
      return uya;
    }
    if (node.k === "indeks") {
      if (node.obj.k !== "nom") throw E.sintaksis("expected array name", node);
      const uya = env.izla(node.obj.nom);
      if (!uya) throw E.tanilmagan(node.obj.nom, node);
      const i = Number(V.butun(baho(node.indeks, env, ctx), node, "int"));
      if (uya.massiv) {
        if (i < 0 || i >= uya.massiv.length) throw E.chegaradanTashqari(node.obj.nom, i, uya.massiv.length, node);
        return uya.massiv[i];
      }
      if (uya.q && uya.q.t === "string") {
        const boyi = uya.q.v.length;
        if (i < 0 || i >= boyi) throw E.chegaradanTashqari(node.obj.nom, i, boyi, node);
        // q — getter: har safar satrning HOZIRGI holatidan o'qiydi (++s[0] dan keyin yangi belgi ko'rinsin)
        return { tur: "char", get q() { return V.belgi(uya.q.v[i]); }, satrUya: uya, satrIndeks: i, berilgan: true };
      }
      throw E.sintaksis("subscripted value is not an array", node);
    }
    throw E.sintaksis("expression is not assignable", node);
  }

  function yoz(uya, qiymat, pos) {
    if (uya.satrUya) {
      const s = uya.satrUya.q.v;
      const belgi = V.turga("char", qiymat, pos);
      uya.satrUya.q = V.matn(s.slice(0, uya.satrIndeks) + belgi.v + s.slice(uya.satrIndeks + 1));
      return belgi; // (s[0] = 'x') ning qiymati — bitta belgi, butun satr emas
    }
    uya.q = V.turga(uya.tur, qiymat, pos);
    uya.berilgan = true;
    return uya.q;
  }

  function oqi(uya, nom, pos) {
    if (!uya.berilgan) throw E.qiymatsiz(nom, pos);
    return uya.q;
  }

  function baho(node, env, ctx) {
    qadam(ctx, node);
    switch (node.k) {
      // Juda katta butun son C++ da ham int emas, long long bo'ladi
      case "son": return node.tur === "double" ? V.dbl(node.v)
        : (node.tur !== "ll" && node.v >= -2147483648n && node.v <= 2147483647n ? V.int(node.v) : V.ll(node.v));
      case "matn": return V.matn(node.v);
      case "belgi": return V.belgi(node.v);
      case "bool": return V.bool(node.v);
      case "nom": {
        const uya = env.izla(node.nom);
        if (!uya) throw E.tanilmagan(node.nom, node);
        if (uya.massiv) throw E.sintaksis("array name used as a value", node);
        return oqi(uya, node.nom, node);
      }
      case "indeks": {
        const uya = uyaTopi(node, env, ctx);
        return oqi(uya, node.obj.nom, node);
      }
      case "uzunlik": {
        const q = baho(node.obj, env, ctx);
        if (q.t !== "string") throw E.yoq(".size()", node);
        return V.son("ll", BigInt(q.v.length));
      }
      case "keltir": return V.turga(node.tur, baho(node.ifoda, env, ctx), node);
      case "bir": {
        if (node.op === "!") return V.bool(!V.rostmi(baho(node.ifoda, env, ctx)));
        const q = baho(node.ifoda, env, ctx);
        // char va bool amalda int ga ko'tariladi: +'a' → 97, -true → -1
        if (q.t === "double") return node.op === "+" ? q : V.dbl(-q.v);
        const x = V.butun(q);
        return V.son(q.t === "ll" ? "ll" : "int", node.op === "+" ? x : -x);
      }
      case "oldin": case "keyin": {
        const uya = uyaTopi(node.maqsad, env, ctx);
        const nomi = node.maqsad.k === "nom" ? node.maqsad.nom : node.maqsad.obj.nom;
        const eski = oqi(uya, nomi, node);
        const yangi = V.amal(node.op === "++" ? "+" : "-", eski, V.int(1n), node);
        yoz(uya, yangi, node);
        return node.k === "oldin" ? uya.q : eski;
      }
      case "ikki": {
        if (node.op === "&&") {
          return V.bool(V.rostmi(baho(node.chap, env, ctx)) && V.rostmi(baho(node.ong, env, ctx)));
        }
        if (node.op === "||") {
          return V.bool(V.rostmi(baho(node.chap, env, ctx)) || V.rostmi(baho(node.ong, env, ctx)));
        }
        return V.amal(node.op, baho(node.chap, env, ctx), baho(node.ong, env, ctx), node);
      }
      case "royxat": throw E.sintaksis("initializer list is only allowed in a declaration", node);
      case "chaqiruv": return chaqiruv(node, env, ctx);
      case "tayinlash": {
        const uya = uyaTopi(node.maqsad, env, ctx);
        const nomi = node.maqsad.k === "nom" ? node.maqsad.nom : node.maqsad.obj.nom;
        const ong = baho(node.qiymat, env, ctx);
        if (node.op === "=") return yoz(uya, ong, node);
        const eski = oqi(uya, nomi, node);
        // s += 65 — C++ da songa mos BELGI qo'shiladi ("A")
        const qoshiladigan = eski.t === "string" && V.sonmi(ong) ? V.turga("char", ong, node) : ong;
        return yoz(uya, V.amal(node.op[0], eski, qoshiladigan, node), node);
      }
      default:
        throw E.ichki("nomaʼlum ifoda: " + node.k);
    }
  }


  // sort(a, a + n) uchun: "a" yoki "a + k" ifodasidan massiv va boshlanish o'rnini topamiz.
  // Haqiqiy C++ da bu ko'rsatkich bo'ladi; biz faqat shu ikki ko'rinishni bilamiz.
  function massivChegara(node, env, ctx) {
    let nomNode = node;
    let siljish = 0;
    if (node.k === "ikki" && (node.op === "+" || node.op === "-")) {
      nomNode = node.chap;
      const qiymat = Number(V.butun(baho(node.ong, env, ctx), node, "int"));
      siljish = node.op === "+" ? qiymat : -qiymat;
    }
    if (nomNode.k !== "nom") return null;
    const uya = env.izla(nomNode.nom);
    if (!uya || !uya.massiv) return null;
    return { uya, orin: siljish, nom: nomNode.nom };
  }

  // Tayyor funksiyalar: sort, swap, max, min, abs
  function chaqiruv(node, env, ctx) {
    const nom = node.nom;
    if (nom === "sort") {
      const bosh = massivChegara(node.args[0], env, ctx);
      const oxir = massivChegara(node.args[1], env, ctx);
      if (!bosh || !oxir || bosh.uya !== oxir.uya) {
        throw E.yoq("sort — faqat massiv uchun: sort(a, a + n)", node);
      }
      const n = bosh.uya.massiv.length;
      if (bosh.orin < 0 || oxir.orin > n || bosh.orin > oxir.orin) {
        throw E.chegaradanTashqari(bosh.nom, oxir.orin, n, node);
      }
      const bolak = bosh.uya.massiv.slice(bosh.orin, oxir.orin);
      for (const u of bolak) if (!u.berilgan) throw E.qiymatsiz(bosh.nom, node);
      const qiymatlar = bolak.map((u) => u.q);
      qiymatlar.sort((a, b) => {
        if (a.t === "string") return a.v < b.v ? -1 : a.v > b.v ? 1 : 0;
        const x = a.t === "double" ? a.v : V.butun(a);
        const y = b.t === "double" ? b.v : V.butun(b);
        return x < y ? -1 : x > y ? 1 : 0;
      });
      for (let k = 0; k < bolak.length; k++) bolak[k].q = qiymatlar[k];
      return V.int(0n);
    }
    if (nom === "swap") {
      const a = uyaTopi(node.args[0], env, ctx);
      const b = uyaTopi(node.args[1], env, ctx);
      const nomA = node.args[0].k === "nom" ? node.args[0].nom : node.args[0].obj.nom;
      const nomB = node.args[1].k === "nom" ? node.args[1].nom : node.args[1].obj.nom;
      const qa = oqi(a, nomA, node);
      const qb = oqi(b, nomB, node);
      yoz(a, qb, node);
      yoz(b, qa, node);
      return V.int(0n);
    }
    const qiymatlar = node.args.map((x) => baho(x, env, ctx));
    if (nom === "abs") {
      const q = qiymatlar[0];
      if (q.t === "double") return V.dbl(Math.abs(q.v));
      const x = V.butun(q);
      return V.son(q.t === "ll" ? "ll" : "int", x < 0n ? -x : x);
    }
    // max / min — haqiqiy C++ da ikkala argument BIR XIL turda bo'lishi shart
    const [a, b] = qiymatlar;
    if (a.t !== b.t) {
      throw E.sintaksis("no matching function for call to '" + nom + "'", Object.assign({}, node, {
        hint: "max va min ikkala sonni bir xil turda talab qiladi. " + nom + "(2.5, 2) ishlamaydi — "
          + nom + "(2.5, 2.0) deb yoz.",
      }));
    }
    const katta = V.rostmi(V.solishtir(">", a, b, node));
    // Ikkala argument bir xil turda — tanlangan qiymatning o'zi qaytadi (max("a"s, "b"s) ham shunday)
    return (nom === "max") === katta ? a : b;
  }

  // ---------- Buyruqlar ----------
  function* bajar(node, env, ctx) {
    qadam(ctx, node);
    yield { line: node.line, env };
    switch (node.k) {
      case "bosh": return null;
      case "blok": {
        const ich = new Env(env);
        for (const s of node.tana) {
          const sig = yield* bajar(s, ich, ctx);
          if (sig) return sig;
        }
        return null;
      }
      case "elon": {
        for (const e of node.elonlar) {
          if (env.bormi(e.nom)) throw E.qaytaElon(e.nom, node);
          const royxat = e.qiymat && e.qiymat.k === "royxat" ? e.qiymat.elementlar : null;
          if (royxat && !e.boyi && e.massiv) {
            // int a[] = {1, 2, 3}; — bo'yi ro'yxatdan olinadi
            const massiv = royxat.map((x) => ({ tur: node.tur, q: V.turga(node.tur, baho(x, env, ctx), node), berilgan: true }));
            env.qosh(e.nom, { tur: node.tur, massiv });
            continue;
          }
          if (e.boyi) {
            const n = Number(V.butun(baho(e.boyi, env, ctx), node, "int"));
            // Bo'yi ish paytida ma'lum bo'ladi (int a[n]) — shuning uchun bu kompilyatsiya xatosi emas
            if (!(n > 0)) {
              throw E.err("runtime", "invalid array size: " + n, Object.assign({ line: node.line, col: node.col }, {
                hint: "Massivning boʻyi kamida 1 boʻlishi kerak, bu yerda esa " + n + " chiqdi. "
                  + "Haqiqiy C++ da bunday massiv bilan dastur buzuq ishlaydi — shuning uchun toʻxtatamiz.",
              }));
            }
            if (n > MASSIV_CHEGARA) {
              throw E.yoq(MASSIV_CHEGARA + " katakdan katta massiv", Object.assign({ line: node.line, col: node.col }, {
                hint: "Bu saytda massiv eng koʻpi bilan " + MASSIV_CHEGARA + " katakli boʻladi (brauzer xotirasi uchun). "
                  + "Haqiqiy kompilyatorda kattaroq massiv ham ishlaydi.",
              }));
            }
            const massiv = [];
            // Ro'yxat berilgan bo'lsa, qolgan kataklar NOL bo'ladi (C++ shuni kafolatlaydi)
            for (let k = 0; k < n; k++) {
              const bor = royxat && k < royxat.length;
              massiv.push({
                tur: node.tur,
                q: bor ? V.turga(node.tur, baho(royxat[k], env, ctx), node) : V.boshlangich(node.tur),
                berilgan: !!royxat || node.tur === "string", // string s[3] — har biri "" (C++ kafolati)
              });
            }
            if (royxat && royxat.length > n) throw E.sintaksis("excess elements in array initializer", node);
            env.qosh(e.nom, { tur: node.tur, massiv });
            continue;
          }
          const uya = { tur: node.tur, q: V.boshlangich(node.tur), berilgan: false };
          // string o'zi bo'sh qiymat bilan boshlanadi — C++ da ham shunday
          if (node.tur === "string") uya.berilgan = true;
          env.qosh(e.nom, uya);
          if (e.qiymat) yoz(uya, baho(e.qiymat, env, ctx), node);
        }
        return null;
      }
      case "ifoda": baho(node.ifoda, env, ctx); return null;
      case "chiqar": {
        for (const q of node.qismlar) {
          ctx.out += q.k === "endl" ? "\n" : V.yoz(baho(q, env, ctx));
        }
        return null;
      }
      case "oqi": {
        for (const q of node.qismlar) {
          const uya = uyaTopi(q, env, ctx);
          yoz(uya, oqiQiymat(uya.tur, ctx, node), node);
        }
        return null;
      }
      case "agar": {
        if (V.rostmi(baho(node.shart, env, ctx))) return yield* bajar(node.tana, new Env(env), ctx);
        if (node.aks) return yield* bajar(node.aks, new Env(env), ctx);
        return null;
      }
      case "toki": {
        // while (cin >> x): o'qishga urinamiz; kirish tugasa — sikl tugaydi (C++ dagidek)
        const shartni = () => {
          if (!node.oqiShart) return V.rostmi(baho(node.shart, env, ctx));
          for (const q of node.oqiShart.qismlar) {
            const uya = uyaTopi(q, env, ctx);
            let qiymat;
            try {
              qiymat = oqiQiymat(uya.tur, ctx, node);
            } catch (e) {
              if (e && (e.kind === "runtime") && /no more input|invalid input/.test(e.cppMessage)) return false;
              throw e;
            }
            yoz(uya, qiymat, node);
          }
          return true;
        };
        while (shartni()) {
          qadam(ctx, node);
          const sig = yield* bajar(node.tana, new Env(env), ctx);
          if (sig && sig.sig === "uz") break;
          if (sig && sig.sig === "qaytar") return sig;
        }
        return null;
      }
      case "takror": {
        const ich = new Env(env);
        if (node.bosh) yield* bajar(node.bosh, ich, ctx);
        for (;;) {
          if (node.shart && !V.rostmi(baho(node.shart, ich, ctx))) break;
          qadam(ctx, node);
          const sig = yield* bajar(node.tana, new Env(ich), ctx);
          if (sig && sig.sig === "uz") break;
          if (sig && sig.sig === "qaytar") return sig;
          if (node.qadam) baho(node.qadam, ich, ctx);
        }
        return null;
      }
      case "uz": return { sig: "uz" };
      case "davom": return { sig: "davom" };
      case "qaytar": return { sig: "qaytar", v: node.ifoda ? baho(node.ifoda, env, ctx) : null };
      default:
        throw E.ichki("nomaʼlum buyruq: " + node.k);
    }
  }

  // main() ning tanasi berilgan muhitda bajariladi — shunda o'zgaruvchilar
  // tashqaridan ham ko'rinadi (qadam-baqadam panel va "vars" uchun)
  function* execProgram(dastur, env, ctx) {
    for (const s of dastur.tana.tana) {
      const sig = yield* bajar(s, env, ctx);
      // break/continue sikl tashqarisida — parser buni ishdan oldin ushlaydi; bu yerga yetib kelsa ham
      // dastur jim tugab qolmasin
      if (sig && sig.sig !== "qaytar") {
        throw E.sintaksis("'" + (sig.sig === "uz" ? "break" : "continue") + "' statement not in loop", s);
      }
      if (sig) return sig;
    }
    return null;
  }

  // Qadam-baqadam panel uchun: o'zgaruvchilarning hozirgi holati
  function snapshot(env) {
    const out = {};
    for (let e = env; e; e = e.ota) {
      for (const [nom, uya] of e.vars) {
        if (nom in out) continue;
        if (uya.massiv) out[nom] = "[" + uya.massiv.map((u) => (u.berilgan ? V.yoz(u.q) : "?")).join(", ") + "]";
        else out[nom] = uya.berilgan ? V.yoz(uya.q) : "?";
      }
    }
    return out;
  }

  const api = { Env, makeContext, execProgram, bajar, baho, snapshot, QADAM_CHEGARA };
  root.QK = root.QK || {};
  root.QK.cppEngine = Object.assign(root.QK.cppEngine || {}, { interpreter: api });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
