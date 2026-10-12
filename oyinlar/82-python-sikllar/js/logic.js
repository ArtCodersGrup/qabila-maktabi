// «for va while» (IX sinf): topshiriqlarni yasash — sof mantiq, ekransiz.
// Node'da test qilinadi: tests/logic.test.js
//   1-bosqich — belgilangan satr necha marta bajariladi (sanoq: son bilan javob),
//   2-bosqich — hisoblagich va yig'indi naqshi: natijani ayt (natija) va naqshni to'ldir (bosh-joy),
//   3-bosqich — siklni tuzat (xato-top, mantiqiy xato) va o'zing yoz (kod-yoz).
// Hamma misol ma'lumot va model haqida: yorliqlarni sanash, o'rtacha, aniqlik, xato kamayguncha o'qitish.
(function (root) {
  "use strict";

  const py = (root.QK && root.QK.python) || require("../../umumiy/js/python/python.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const d2 = (n) => String(n / 100);
  const royxat = (list) => "[" + list.map((x) => (typeof x === "string" && !/^-?[\d.]+$/.test(x) ? '"' + x + '"' : x)).join(", ") + "]";
  const nta = (rnd, n, make) => Array.from({ length: n }, () => make(rnd));

  function pickNew(make, prev, r) {
    for (let k = 0; k < 80; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  // Qiyinlik zinasi (QOIDALAR 4.3): 0 — birinchi javob, 1 — o'rta, 2 — oxirgilar va qiyin rejim.
  const zina = (tier) => (tier == null ? 2 : Math.max(0, Math.min(2, tier)));
  function zinadan(list, tier, rnd) {
    if (tier == null) return pick(list, rnd);
    const t = zina(tier);
    const mos = list.filter((x) => (x.tier || 0) <= t);
    const ayni = mos.filter((x) => (x.tier || 0) === t);
    return ayni.length && rnd() < 0.6 ? pick(ayni, rnd) : pick(mos, rnd);
  }

  const BLANK = "___";
  function fill(template, answers) {
    const parts = String(template).split(BLANK);
    let out = parts[0];
    for (let k = 1; k < parts.length; k++) out += answers[k - 1] + parts[k];
    return out;
  }

  const SINFLAR = [["spam", "oddiy"], ["mushuk", "it"], ["ijobiy", "salbiy"]];
  // Ikkala sinf ham uchraydigan yorliqlar ro'yxati
  function yorliqlar(rnd, n) {
    const [a, b] = pick(SINFLAR, rnd);
    for (let k = 0; k < 20; k++) {
      const list = nta(rnd, n, (r) => (r() < 0.5 ? a : b));
      if (list.includes(a) && list.includes(b)) return { a, b, list };
    }
    return { a, b, list: [a, b].concat(nta(rnd, n - 2, () => a)) };
  }

  // ---------- 1-bosqich: belgilangan satr necha marta bajariladi ----------
  // Har shakl: lines — kod satrlari, mark — belgilangan satr (0 dan), track — o'sha satr oldidan kuzatiladigan qiymat.
  const S1 = [
    {
      id: "range", tier: 0,
      why: "range(n) 0 dan n − 1 gacha sonlarni beradi. Ular nechta?",
      make(rnd) {
        const n = int(rnd, 3, 9);
        return { lines: ["jami = 0", "for davr in range(" + n + "):", "    jami += 10", "print(jami)"], mark: 2, track: "davr" };
      },
    },
    {
      id: "royxat", tier: 0,
      why: "Roʻyxat boʻylab for har element uchun bir marta aylanadi.",
      make(rnd) {
        const y = yorliqlar(rnd, int(rnd, 3, 6));
        return { lines: ["yorliqlar = " + royxat(y.list), "soni = 0", "for y in yorliqlar:", "    soni += 1", "print(soni)"], mark: 3, track: "y" };
      },
    },
    {
      id: "oraliq", tier: 0,
      why: "range(a, b): a kiradi, b kirmaydi.",
      make(rnd) {
        const a = int(rnd, 1, 6), b = a + int(rnd, 2, 7);
        return { lines: ["jami = 0", "for i in range(" + a + ", " + b + "):", "    jami += i", "print(jami)"], mark: 2, track: "i" };
      },
    },
    {
      id: "len", tier: 0,
      why: "len(roʻyxat) — elementlar soni; range(len(…)) indekslarni beradi.",
      make(rnd) {
        const list = nta(rnd, int(rnd, 3, 6), (r) => int(r, 50, 99));
        return { lines: ["ballar = " + royxat(list), "jami = 0", "for i in range(len(ballar)):", "    jami += ballar[i]", "print(jami)"], mark: 3, track: "i" };
      },
    },
    {
      id: "qadam", tier: 1,
      why: "range(a, b, qadam): a dan boshlab qadam bilan, b ga yetmasdan toʻxtaydi. Qiymatlarni yozib chiq.",
      make(rnd) {
        const a = int(rnd, 0, 4), step = int(rnd, 2, 4);
        const b = a + step * int(rnd, 2, 4) + int(rnd, 0, step - 1);
        return { lines: ["for i in range(" + a + ", " + b + ", " + step + "):", "    tekshir = i"], mark: 1, track: "i" };
      },
    },
    {
      id: "kamayish", tier: 1,
      why: "Qadam manfiy: sanoq kamayadi va oxirgi chegaraga yetmasdan toʻxtaydi.",
      make(rnd) {
        const step = int(rnd, 2, 3), b = int(rnd, 0, 3);
        const a = b + step * int(rnd, 2, 4) + int(rnd, 0, step - 1);
        return { lines: ["for i in range(" + a + ", " + b + ", -" + step + "):", "    qoldi = i"], mark: 1, track: "i" };
      },
    },
    {
      id: "while-sanoq", tier: 1,
      why: "while har aylanish oldidan shartni tekshiradi. davr qiymatlarini ketma-ket yoz.",
      make(rnd) {
        const step = int(rnd, 2, 3), n = int(rnd, 5, 12);
        return { lines: ["davr = 0", "while davr < " + n + ":", "    davr += " + step, "print(davr)"], mark: 2, track: "davr" };
      },
    },
    {
      id: "while-aniqlik", tier: 1,
      why: "Har aylanishdan keyin aniqlik qancha boʻlishini yoz va shartni qayta tekshir.",
      make(rnd) {
        const a = int(rnd, 50, 70), d = int(rnd, 4, 9), t = pick([85, 90, 95], rnd);
        return { lines: ["aniqlik = " + a, "while aniqlik < " + t + ":", "    aniqlik += " + d, "print(aniqlik)"], mark: 2, track: "aniqlik" };
      },
    },
    {
      id: "nol", tier: 1,
      why: "Shart birinchi tekshiruvdayoq yolgʻon boʻlsa, tana biror marta ham bajarilmaydi.",
      make(rnd) {
        if (rnd() < 0.5) {
          const a = int(rnd, 4, 9), b = a - int(rnd, 0, 3);
          return { lines: ["soni = 0", "for i in range(" + a + ", " + b + "):", "    soni += 1", "print(soni)"], mark: 2, track: "i" };
        }
        const t = pick([85, 90], rnd), a = t + int(rnd, 0, 8);
        return { lines: ["aniqlik = " + a, "davr = 0", "while aniqlik < " + t + ":", "    aniqlik += 5", "    davr += 1", "print(davr)"], mark: 3, track: "aniqlik" };
      },
    },
    {
      id: "yarimlash", tier: 2,
      why: "xato qiymatlarini ketma-ket yoz: har davrda ikki barobar kamayadi. Chegaraning oʻzida shart rostmi?",
      make(rnd) {
        const start = pick(["0.8", "1.6", "3.2", "0.4"], rnd), lim = pick(["0.1", "0.05", "0.2"], rnd), op = pick([">", ">="], rnd);
        return { lines: ["xato = " + start, "davr = 0", "while xato " + op + " " + lim + ":", "    xato = xato / 2", "    davr += 1", "print(davr)"], mark: 3, track: "xato" };
      },
    },
    {
      id: "break", tier: 2,
      why: "break siklni darhol toʻxtatadi — undan keyingi satrlar ham, qolgan elementlar ham oʻtkazib yuboriladi.",
      make(rnd) {
        let x = int(rnd, 40, 60);
        const list = [x];
        for (let k = 0; k < 5; k++) { x -= int(rnd, 4, 11); list.push(x); }
        const lim = list[int(rnd, 2, 4)] + int(rnd, 0, 2);
        list.push(lim + int(rnd, 2, 9)); // oxirida xato yana ko'tariladi: break bo'lmasa, u ham sanalardi
        return { lines: ["xatolar = " + royxat(list), "davr = 0", "for x in xatolar:", "    if x < " + lim + ":", "        break", "    davr += 1", "print(davr)"], mark: 5, track: "x" };
      },
    },
    {
      id: "ichma-ich", tier: 2,
      why: "Ichki sikl tashqi siklning har aylanishida boshidan aylanadi. Juftliklarni (i, j) sanab chiq.",
      make(rnd) {
        const n = int(rnd, 2, 4);
        if (rnd() < 0.5) {
          const m = int(rnd, 2, 4);
          return { lines: ["soni = 0", "for i in range(" + n + "):", "    for j in range(" + m + "):", "        soni += 1", "print(soni)"], mark: 3, track: "i, j" };
        }
        return { lines: ["soni = 0", "for i in range(" + (n + 1) + "):", "    for j in range(i):", "        soni += 1", "print(soni)"], mark: 3, track: "i, j" };
      },
    },
    {
      id: "ikki-shart", tier: 2,
      why: "Sikl ikkala shart ham rost boʻlgandagina davom etadi: xato kichraysa ham, davrlar tugasa ham toʻxtaydi.",
      make(rnd) {
        const start = pick([40, 64, 80, 100], rnd), lim = pick([3, 5, 10], rnd), max = int(rnd, 2, 6);
        return { lines: ["xato = " + start, "davr = 0", "while xato > " + lim + " and davr < " + max + ":", "    xato = xato // 2", "    davr += 1", "print(davr, xato)"], mark: 3, track: "xato" };
      },
    },
    {
      id: "continue", tier: 2,
      why: "continue shu aylanishning qolgan satrlarini tashlab, keyingi elementga oʻtadi.",
      make(rnd) {
        const y = yorliqlar(rnd, int(rnd, 4, 6));
        const list = y.list.map((v) => (rnd() < 0.3 ? "bosh" : v));
        if (!list.includes("bosh")) list[int(rnd, 0, list.length - 1)] = "bosh";
        return { lines: ["yorliqlar = " + royxat(list), "soni = 0", "for y in yorliqlar:", '    if y == "bosh":', "        continue", "    soni += 1", "print(soni)"], mark: 5, track: "y" };
      },
    },
  ];

  // Sanoq kodi: belgilangan satr oldiga kuzatuv satri qo'shiladi, yuqori darajadagi print lar olib tashlanadi
  function probe(t) {
    const pad = /^ */.exec(t.lines[t.mark])[0];
    const out = [];
    t.lines.forEach((line, k) => {
      if (k === t.mark) out.push(pad + "print(" + t.track + ")");
      if (!/^print\(/.test(line)) out.push(line);
    });
    return out.join("\n");
  }

  function sanoqTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const shape = zinadan(S1, tier, rnd);
      const t = shape.make(rnd);
      const code = t.lines.join("\n");
      const real = py.run(code, { maxSteps: 20000 });
      const kuzatuv = py.run(probe(t), { maxSteps: 20000 });
      if (real.error || kuzatuv.error || kuzatuv.output.length > 16) return null;
      const n = kuzatuv.output.length;
      if (n === 0 && shape.id !== "nol") return null;
      const izoh = n === 0
        ? "0 marta: shart birinchi tekshiruvdayoq yolgʻon."
        : "Belgilangan satr oldidan " + t.track + ": " + kuzatuv.output.join(t.track.includes(",") ? "; " : ", ") + " — " + n + " marta.";
      return { id: "sanoq:" + code, type: "sanoq", shakl: shape.id, code, mark: t.mark + 1, answer: n, why: shape.why, izoh, qiymatlar: kuzatuv.output };
    }, prev, rr);
  }

  // ---------- 2-bosqich (a): hisoblagich va yig'indi — natijani ayt ----------
  const HISOB = [
    {
      id: "sanash", tier: 0,
      make(rnd) {
        const y = yorliqlar(rnd, int(rnd, 5, 7));
        return "yorliqlar = " + royxat(y.list) + "\nsoni = 0\nfor y in yorliqlar:\n    if y == \"" + pick([y.a, y.b], rnd) + "\":\n        soni += 1\nprint(soni)";
      },
    },
    {
      id: "yigindi", tier: 0,
      make(rnd) {
        const list = nta(rnd, int(rnd, 4, 5), (r) => int(r, 2, 15));
        return "ballar = " + royxat(list) + "\njami = 0\nfor b in ballar:\n    jami += b\nprint(jami)";
      },
    },
    {
      id: "chegara-sanash", tier: 0,
      make(rnd) {
        const lim = pick([50, 60, 70], rnd);
        const list = nta(rnd, int(rnd, 4, 6), (r) => (r() < 0.3 ? lim : int(r, 1, 19) * 5)).map(d2);
        return "ehtimollar = " + royxat(list) + "\nsoni = 0\nfor p in ehtimollar:\n    if p >= " + d2(lim) + ":\n        soni += 1\nprint(soni)";
      },
    },
    {
      // O'rtacha: / har doim kasr son beradi (7.0 ham)
      id: "ortacha", tier: 1,
      make(rnd) {
        const n = pick([4, 5], rnd);
        const list = nta(rnd, n, (r) => int(r, 3, 12));
        return "ballar = " + royxat(list) + "\njami = 0\nfor b in ballar:\n    jami += b\nprint(jami / len(ballar))";
      },
    },
    {
      id: "aniqlik", tier: 1,
      make(rnd) {
        const n = pick([4, 5], rnd);
        const h = nta(rnd, n, (r) => int(r, 0, 1));
        const b = h.map((v) => (rnd() < 0.3 ? 1 - v : v));
        return "haqiqiy = " + royxat(h) + "\nbashorat = " + royxat(b) + "\ntogri = 0\nfor i in range(len(haqiqiy)):\n    if haqiqiy[i] == bashorat[i]:\n        togri += 1\nprint(togri, togri / len(haqiqiy))";
      },
    },
    {
      id: "eng-katta", tier: 1,
      make(rnd) {
        const list = nta(rnd, int(rnd, 4, 6), (r) => int(r, 55, 98));
        return "aniqliklar = " + royxat(list) + "\neng = aniqliklar[0]\nfor a in aniqliklar:\n    if a > eng:\n        eng = a\nprint(eng)";
      },
    },
    {
      id: "ikki-hisoblagich", tier: 1,
      make(rnd) {
        const y = yorliqlar(rnd, int(rnd, 5, 7));
        return "yorliqlar = " + royxat(y.list) + "\nbir = 0\nikki = 0\nfor y in yorliqlar:\n    if y == \"" + y.a + "\":\n        bir += 1\n    else:\n        ikki += 1\nprint(bir, ikki)";
      },
    },
    {
      id: "while-davr", tier: 2,
      make(rnd) {
        const start = pick([48, 64, 80, 96, 120], rnd), lim = pick([4, 5, 10], rnd);
        return "xato = " + start + "\ndavr = 0\nwhile xato > " + lim + ":\n    xato = xato // 2\n    davr += 1\nprint(davr, xato)";
      },
    },
    {
      // Kvadratik xatolar yig'indisi
      id: "kvadrat-xato", tier: 2,
      make(rnd) {
        const n = pick([3, 4], rnd);
        const h = nta(rnd, n, (r) => int(r, 2, 9));
        const b = h.map((v) => v + int(rnd, -2, 2));
        return "haqiqiy = " + royxat(h) + "\nbashorat = " + royxat(b) + "\njami = 0\nfor i in range(len(haqiqiy)):\n    farq = haqiqiy[i] - bashorat[i]\n    jami += farq * farq\nprint(jami)";
      },
    },
    {
      id: "eng-indeks", tier: 2,
      make(rnd) {
        const list = nta(rnd, int(rnd, 4, 6), (r) => int(r, 60, 95));
        return "aniqliklar = " + royxat(list) + "\neng = 0\nfor i in range(len(aniqliklar)):\n    if aniqliklar[i] > aniqliklar[eng]:\n        eng = i\nprint(eng, aniqliklar[eng])";
      },
    },
    {
      // Nosoz o'lchovlar (manfiy) tashlab ketiladi
      id: "filtr-ortacha", tier: 2,
      make(rnd) {
        const list = nta(rnd, int(rnd, 5, 6), (r) => (r() < 0.3 ? -1 : int(r, 2, 12)));
        return "olchovlar = " + royxat(list) + "\njami = 0\nsoni = 0\nfor x in olchovlar:\n    if x < 0:\n        continue\n    jami += x\n    soni += 1\nprint(soni, jami / soni)";
      },
    },
    {
      id: "erta-toxtash", tier: 2,
      make(rnd) {
        let x = int(rnd, 30, 50);
        const list = [x];
        for (let k = 0; k < 5; k++) { x += rnd() < 0.3 ? int(rnd, 1, 4) : -int(rnd, 2, 8); list.push(x); }
        return "xatolar = " + royxat(list) + "\ndavr = 0\nfor i in range(1, len(xatolar)):\n    if xatolar[i] > xatolar[i - 1]:\n        break\n    davr += 1\nprint(davr, xatolar[davr])";
      },
    },
  ];

  // Javobni bola teradi: 1–2 satr, kasr qismi ko'pi bilan 2 raqam
  function toza(code) {
    const r = py.run(code, { maxSteps: 20000 });
    if (r.error || r.output.length < 1 || r.output.length > 2) return null;
    if (r.output.some((line) => /\.\d{3,}|e-/.test(line) || line.length > 14)) return null;
    return r;
  }

  function hisobTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const shape = zinadan(HISOB, tier, rnd);
      const code = shape.make(rnd);
      return toza(code) ? { id: "natija:" + code, type: "natija", kind: "hisob", shakl: shape.id, code, solution: code } : null;
    }, prev, rr);
  }

  // ---------- 2-bosqich (b): naqshni to'ldir ----------
  const NAQSH = [
    {
      id: "hisoblagich", tier: 0,
      make(rnd) {
        const y = yorliqlar(rnd, int(rnd, 5, 7));
        return {
          what: "Dastur roʻyxatda nechta «" + y.a + "» yorligʻi borligini sanaydi. Hisoblagich naqshini toʻldir: boshlangʻich qiymat va oʻsish.",
          template: "yorliqlar = " + royxat(y.list) + "\nsoni = ___\nfor y in yorliqlar:\n    if y == \"" + y.a + "\":\n        soni += ___\nprint(soni)",
          answers: ["0", "1"],
          why: "Hisoblagich noldan boshlanadi va har mos elementda bittaga oshadi.",
        };
      },
    },
    {
      id: "shart", tier: 0,
      make(rnd) {
        const lim = pick([50, 60, 70], rnd);
        const list = nta(rnd, int(rnd, 5, 6), (r) => (r() < 0.3 ? lim : int(r, 1, 19) * 5)).map(d2);
        return {
          what: "Dastur ehtimoli " + d2(lim) + " yoki undan katta boʻlgan xatlar sonini chiqaradi. Shartni yoz.",
          template: "ehtimollar = " + royxat(list) + "\nsoni = 0\nfor p in ehtimollar:\n    if ___:\n        soni += 1\nprint(soni)",
          answers: ["p >= " + d2(lim)],
          why: "Sikl oʻzgaruvchisi — p. Chegaraning oʻzi ham sanaladi.",
        };
      },
    },
    {
      id: "ortacha", tier: 1,
      make(rnd) {
        const list = nta(rnd, pick([4, 5], rnd), (r) => int(r, 3, 12));
        return {
          what: "Dastur ballarning oʻrtacha qiymatini chiqaradi: yigʻindi boʻlinadi elementlar soniga. Ikkala boʻsh joyni toʻldir.",
          template: "ballar = " + royxat(list) + "\njami = 0\nfor b in ballar:\n    jami += ___\nprint(jami / ___)",
          answers: ["b", "len(ballar)"],
          why: "Yigʻindiga har aylanishda joriy element qoʻshiladi; boʻluvchi — elementlar soni.",
        };
      },
    },
    {
      id: "aniqlik", tier: 1,
      make(rnd) {
        const n = pick([5, 6], rnd);
        const h = nta(rnd, n, (r) => int(r, 0, 1));
        const b = h.map((v) => (rnd() < 0.35 ? 1 - v : v));
        return {
          what: "Dastur nechta bashorat haqiqiy yorliqqa mos kelganini sanaydi. Indekslar oraligʻini va solishtiriladigan qiymatni yoz.",
          template: "haqiqiy = " + royxat(h) + "\nbashorat = " + royxat(b) + "\ntogri = 0\nfor i in range(___):\n    if haqiqiy[i] == ___:\n        togri += 1\nprint(togri)",
          answers: ["len(haqiqiy)", "bashorat[i]"],
          why: "i — indeks: ikkala roʻyxatning bir xil oʻrnidagi elementlari solishtiriladi.",
        };
      },
    },
    {
      id: "while-shart", tier: 1,
      make(rnd) {
        const start = pick([48, 64, 80, 96], rnd), lim = pick([4, 5, 10], rnd);
        return {
          what: "Har davrda xato ikki barobar kamayadi (butun boʻlish). Oʻqitish xato " + lim + " dan katta ekan davom etadi. while shartini yoz.",
          template: "xato = " + start + "\ndavr = 0\nwhile ___:\n    xato = xato // 2\n    davr += 1\nprint(davr, xato)",
          answers: ["xato > " + lim],
          why: "while da toʻxtash sharti emas, DAVOM ETISH sharti yoziladi.",
        };
      },
    },
    {
      id: "eng-katta", tier: 2,
      make(rnd) {
        const list = nta(rnd, int(rnd, 5, 6), (r) => int(r, 55, 98));
        return {
          what: "Dastur eng yuqori aniqlikni topadi (max ishlatilmaydi). Boshlangʻich qiymatni va solishtirish belgisini yoz.",
          template: "aniqliklar = " + royxat(list) + "\neng = ___\nfor a in aniqliklar:\n    if a ___ eng:\n        eng = a\nprint(eng)",
          answers: ["aniqliklar[0]", ">"],
          why: "Nomzod birinchi elementdan boshlanadi; kattarogʻi uchrasa — almashtiriladi.",
        };
      },
    },
    {
      id: "break", tier: 2,
      make(rnd) {
        let x = int(rnd, 40, 60);
        const list = [x];
        for (let k = 0; k < 5; k++) { x -= int(rnd, 4, 11); list.push(x); }
        const lim = list[int(rnd, 2, 4)] + int(rnd, 0, 2);
        list.push(lim + int(rnd, 2, 9)); // oxirida xato yana ko'tariladi: continue bilan natija boshqa chiqadi
        return {
          what: "Dastur xato birinchi marta " + lim + " dan kichik boʻlgunga qadar nechta davr oʻtganini sanaydi va shu zahoti siklni toʻxtatadi. Shartni va buyruqni yoz.",
          template: "xatolar = " + royxat(list) + "\ndavr = 0\nfor x in xatolar:\n    if ___:\n        ___\n    davr += 1\nprint(davr)",
          answers: ["x < " + lim, "break"],
          why: "Siklni muddatidan oldin toʻxtatadigan buyruq bor; continue esa faqat bitta aylanishni tashlaydi.",
        };
      },
    },
    {
      id: "indeks", tier: 2,
      make(rnd) {
        // Qiymatlar har xil bo'lsin: eng kattasi bitta
        let list = nta(rnd, int(rnd, 4, 6), (r) => int(r, 60, 95));
        for (let k = 0; k < 20 && new Set(list).size !== list.length; k++) list = nta(rnd, list.length, (r) => int(r, 60, 95));
        return {
          what: "Dastur eng aniq model nechanchi oʻrinda turganini (indeksini) va uning aniqligini chiqaradi. Ikkala boʻsh joyni toʻldir.",
          template: "aniqliklar = " + royxat(list) + "\neng = 0\nfor i in range(len(aniqliklar)):\n    if aniqliklar[i] > aniqliklar[___]:\n        eng = ___\nprint(eng, aniqliklar[eng])",
          answers: ["eng", "i"],
          why: "eng — qiymat emas, eng yaxshi elementning indeksi.",
        };
      },
    },
  ];

  function naqshTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const shape = zinadan(NAQSH, tier, rnd);
      const t = shape.make(rnd);
      const solution = fill(t.template, t.answers);
      const res = toza(solution);
      if (!res) return null;
      return {
        id: "naqsh:" + shape.id + ":" + t.template, type: "bosh-joy", kind: "naqsh", shakl: shape.id,
        what: t.what, template: t.template, answers: t.answers, solution, lines: res.output, why: t.why,
      };
    }, prev, rr);
  }

  // 2-bosqichda natijani aytish va naqshni to'ldirish navbat bilan keladi
  function stage2Task(r, prev, tier) {
    const rr = r || Math.random;
    const wantFill = prev ? prev.kind !== "naqsh" : rr() < 0.5;
    return wantFill ? naqshTask(rr, prev, tier) : hisobTask(rr, prev, tier);
  }

  // ---------- 3-bosqich: siklni tuzat (mantiqiy xato) ----------
  // Kirish: avval n, keyin n ta qiymat — har biri alohida satrda.
  const FIX = [
    {
      id: "hisoblagich-ichida", tier: 0,
      what: "Kirish: n, keyin n ta yorliq. Dastur nechta spam borligini chiqarishi kerak.",
      why: "hisoblagich qayerda nolga tenglanayotganiga qara",
      code: 'n = int(input())\nfor i in range(n):\n    soni = 0\n    y = input()\n    if y == "spam":\n        soni += 1\nprint(soni)',
      solution: 'n = int(input())\nsoni = 0\nfor i in range(n):\n    y = input()\n    if y == "spam":\n        soni += 1\nprint(soni)',
      tests: [["3", "spam", "oddiy", "spam"], ["2", "spam", "oddiy"], ["1", "oddiy"], ["4", "spam", "spam", "spam", "spam"]],
    },
    {
      id: "tenglash", tier: 0,
      what: "Kirish: n, keyin n ta ball. Dastur ballar yigʻindisini chiqarishi kerak.",
      why: "= eski qiymatni oʻchirib yuboradi; yigʻindi naqshida qiymat QOʻSHILADI",
      code: "n = int(input())\njami = 0\nfor i in range(n):\n    x = int(input())\n    jami = x\nprint(jami)",
      solution: "n = int(input())\njami = 0\nfor i in range(n):\n    x = int(input())\n    jami += x\nprint(jami)",
      tests: [["3", "5", "7", "2"], ["1", "9"], ["4", "10", "20", "30", "40"], ["2", "0", "0"]],
    },
    {
      id: "kam-aylanish", tier: 0,
      what: "Kirish: n, keyin n ta ehtimol. Dastur 0.5 yoki undan katta ehtimollar sonini chiqarishi kerak.",
      why: "sikl necha marta aylanadi — n ta qiymatning hammasi oʻqilyaptimi?",
      code: "n = int(input())\nsoni = 0\nfor i in range(n - 1):\n    p = float(input())\n    if p >= 0.5:\n        soni += 1\nprint(soni)",
      solution: "n = int(input())\nsoni = 0\nfor i in range(n):\n    p = float(input())\n    if p >= 0.5:\n        soni += 1\nprint(soni)",
      tests: [["3", "0.2", "0.4", "0.9"], ["1", "0.5"], ["4", "0.9", "0.8", "0.7", "0.6"], ["2", "0.1", "0.2"]],
    },
    {
      id: "cheksiz", tier: 1,
      what: "Kirish: boshlangʻich xato. Har davrda xato ikki barobar kamayadi. Dastur xato 0.1 dan katta boʻlmay qolguncha necha davr oʻtishini chiqarishi kerak.",
      why: "sikl ichida shartga taʼsir qiladigan qiymat oʻzgaryaptimi?",
      code: "xato = float(input())\ndavr = 0\nwhile xato > 0.1:\n    davr += 1\nprint(davr)",
      solution: "xato = float(input())\ndavr = 0\nwhile xato > 0.1:\n    xato = xato / 2\n    davr += 1\nprint(davr)",
      tests: [["0.8"], ["0.05"], ["1.6"], ["0.3"]],
    },
    {
      id: "print-ichida", tier: 1,
      what: "Kirish: n, keyin n ta ball. Dastur oʻrtacha ballni chiqarishi kerak — bitta son.",
      why: "otstupga qara: qaysi satr sikl ichida, qaysi biri sikldan keyin turishi kerak?",
      code: "n = int(input())\njami = 0\nfor i in range(n):\n    jami += int(input())\n    print(jami / n)",
      solution: "n = int(input())\njami = 0\nfor i in range(n):\n    jami += int(input())\nprint(jami / n)",
      tests: [["4", "8", "6", "7", "9"], ["2", "5", "5"], ["5", "1", "2", "3", "4", "10"], ["3", "3", "3", "6"]],
    },
    {
      id: "nolga-bolish", tier: 1,
      what: "Kirish: n, keyin n ta sensor oʻlchovi. Manfiy qiymat — nosoz oʻlchov, u hisobga kirmaydi. Dastur yaroqli oʻlchovlarning oʻrtachasini chiqarishi kerak (kamida bittasi yaroqli).",
      why: "ikkita naqsh birga ishlaydi: yigʻindi va hisoblagich. Ikkalasi ham yangilanyaptimi?",
      code: "n = int(input())\njami = 0\nsoni = 0\nfor i in range(n):\n    x = int(input())\n    if x >= 0:\n        jami += x\nprint(jami / soni)",
      solution: "n = int(input())\njami = 0\nsoni = 0\nfor i in range(n):\n    x = int(input())\n    if x >= 0:\n        jami += x\n        soni += 1\nprint(jami / soni)",
      tests: [["4", "10", "-1", "20", "30"], ["2", "5", "6"], ["3", "-5", "-5", "8"], ["3", "0", "4", "-2"]],
    },
    {
      id: "shart-teskari", tier: 2,
      what: "Kirish: boshlangʻich aniqlik (foiz). Har davrda aniqlik 5 ga oshadi. Dastur aniqlik 90 ga yetguncha (90 yoki undan katta boʻlguncha) necha davr kerakligini chiqarishi kerak.",
      why: "while da DAVOM ETISH sharti yoziladi — maqsadga yetilmagan paytda rost boʻlishi kerak",
      code: "aniqlik = int(input())\ndavr = 0\nwhile aniqlik > 90:\n    aniqlik += 5\n    davr += 1\nprint(davr)",
      solution: "aniqlik = int(input())\ndavr = 0\nwhile aniqlik < 90:\n    aniqlik += 5\n    davr += 1\nprint(davr)",
      tests: [["70"], ["90"], ["88"], ["61"]],
    },
    {
      id: "indeks", tier: 2,
      what: "Kirish: n, keyin n ta aniqlik. Dastur eng yuqori aniqlik turgan oʻrinni (indeks, 0 dan boshlab; teng boʻlsa — birinchisi) chiqarishi kerak.",
      why: "n elementli roʻyxatda oxirgi indeks — n − 1",
      code: "n = int(input())\nballar = []\nfor i in range(n):\n    ballar.append(int(input()))\neng = 0\nfor i in range(n + 1):\n    if ballar[i] > ballar[eng]:\n        eng = i\nprint(eng)",
      solution: "n = int(input())\nballar = []\nfor i in range(n):\n    ballar.append(int(input()))\neng = 0\nfor i in range(n):\n    if ballar[i] > ballar[eng]:\n        eng = i\nprint(eng)",
      tests: [["4", "70", "85", "85", "60"], ["1", "50"], ["3", "90", "80", "70"], ["3", "10", "20", "30"]],
    },
    {
      id: "eng-katta-nol", tier: 2,
      what: "Kirish: n, keyin n ta harorat oʻlchovi — manfiy boʻlishi ham mumkin. Dastur eng katta oʻlchovni chiqarishi kerak.",
      why: "boshlangʻich nomzod maʼlumotning oʻzidan olinishi kerak — hamma qiymat undan kichik boʻlsa nima chiqadi?",
      code: "n = int(input())\neng = 0\nfor i in range(n):\n    x = int(input())\n    if x > eng:\n        eng = x\nprint(eng)",
      solution: "n = int(input())\neng = int(input())\nfor i in range(n - 1):\n    x = int(input())\n    if x > eng:\n        eng = x\nprint(eng)",
      tests: [["3", "-5", "-2", "-9"], ["2", "4", "7"], ["1", "-1"], ["3", "0", "-3", "2"]],
    },
  ];

  // ---------- 3-bosqich: o'zing yoz ----------
  // wrong — tipik xato yechimlar: test ularning o'tmasligini tekshiradi.
  const WRITE = [
    {
      id: "yigindi", tier: 0,
      what: "Kirish: birinchi satrda n, keyin n ta butun son (har biri alohida satrda) — modelning n ta sinovdagi ballari. Ballar yigʻindisini chiqar.",
      solution: "n = int(input())\njami = 0\nfor i in range(n):\n    jami += int(input())\nprint(jami)",
      tests: [["3", "5", "7", "2"], ["1", "9"], ["5", "0", "0", "0", "0", "0"], ["4", "10", "20", "30", "40"]],
      wrong: ["n = int(input())\njami = 0\nfor i in range(n):\n    jami += int(input())\n    print(jami)", "n = int(input())\njami = 0\nfor i in range(n):\n    jami = int(input())\nprint(jami)"],
    },
    {
      id: "spam-soni", tier: 0,
      what: "Kirish: birinchi satrda n, keyin n ta yorliq (spam yoki oddiy, har biri alohida satrda). Nechta spam borligini chiqar.",
      solution: 'n = int(input())\nsoni = 0\nfor i in range(n):\n    if input() == "spam":\n        soni += 1\nprint(soni)',
      tests: [["4", "spam", "oddiy", "spam", "spam"], ["2", "oddiy", "oddiy"], ["1", "spam"], ["5", "oddiy", "spam", "oddiy", "oddiy", "spam"]],
      wrong: ["n = int(input())\nsoni = 0\nfor i in range(n):\n    y = input()\n    soni += 1\nprint(soni)"],
    },
    {
      id: "chegara-soni", tier: 0,
      what: "Kirish: birinchi satrda n, keyin n ta spam ehtimoli (kasr son, har biri alohida satrda). 0.5 yoki undan katta ehtimollar sonini chiqar.",
      solution: "n = int(input())\nsoni = 0\nfor i in range(n):\n    if float(input()) >= 0.5:\n        soni += 1\nprint(soni)",
      tests: [["4", "0.9", "0.5", "0.49", "0.1"], ["2", "0.5", "0.5"], ["3", "0.1", "0.2", "0.3"], ["1", "0.75"]],
      wrong: ["n = int(input())\nsoni = 0\nfor i in range(n):\n    if float(input()) > 0.5:\n        soni += 1\nprint(soni)"],
    },
    {
      id: "ortacha", tier: 1,
      what: "Kirish: birinchi satrda n, keyin n ta butun ball. Oʻrtacha ballni chiqar (yigʻindini / bilan n ga boʻl).",
      solution: "n = int(input())\njami = 0\nfor i in range(n):\n    jami += int(input())\nprint(jami / n)",
      tests: [["4", "8", "6", "7", "9"], ["2", "5", "5"], ["1", "3"], ["5", "1", "2", "3", "4", "10"]],
      wrong: ["n = int(input())\njami = 0\nfor i in range(n):\n    jami += int(input())\nprint(jami // n)", "n = int(input())\njami = 0\nfor i in range(n):\n    jami += int(input())\nprint(jami)"],
    },
    {
      id: "aniqlik", tier: 1,
      what: "Kirish: birinchi satrda n, keyin n ta juftlik — haqiqiy yorliq va model bashorati (1 yoki 0; har son alohida satrda). "
        + "Ikki satr chiqar: toʻgʻri bashoratlar soni va aniqlik foizda (togri * 100 // n).",
      solution: "n = int(input())\ntogri = 0\nfor i in range(n):\n    h = int(input())\n    b = int(input())\n    if h == b:\n        togri += 1\nprint(togri)\nprint(togri * 100 // n)",
      tests: [["4", "1", "1", "0", "1", "1", "0", "0", "0"], ["2", "1", "1", "0", "0"], ["3", "1", "0", "0", "1", "1", "0"], ["3", "1", "1", "0", "0", "1", "0"]],
      wrong: ["n = int(input())\ntogri = 0\nfor i in range(n):\n    h = int(input())\n    b = int(input())\n    if b == 1:\n        togri += 1\nprint(togri)\nprint(togri * 100 // n)"],
    },
    {
      id: "eng-yaxshi", tier: 1,
      what: "Kirish: birinchi satrda n, keyin n ta modelning aniqligi (butun son, foiz). Bitta satrda ikki son chiqar: eng yuqori aniqlik va u nechanchi model ekani "
        + "(1 dan sanaladi; bir nechta boʻlsa — birinchisi).",
      solution: "n = int(input())\neng = -1\nqaysi = 0\nfor i in range(n):\n    a = int(input())\n    if a > eng:\n        eng = a\n        qaysi = i + 1\nprint(eng, qaysi)",
      tests: [["4", "70", "85", "85", "60"], ["1", "50"], ["3", "90", "80", "70"], ["3", "10", "20", "30"]],
      wrong: ["n = int(input())\neng = -1\nqaysi = 0\nfor i in range(n):\n    a = int(input())\n    if a >= eng:\n        eng = a\n        qaysi = i + 1\nprint(eng, qaysi)",
        "n = int(input())\neng = -1\nqaysi = 0\nfor i in range(n):\n    a = int(input())\n    if a > eng:\n        eng = a\n        qaysi = i\nprint(eng, qaysi)"],
    },
    {
      id: "yarimlash", tier: 1,
      what: "Kirish: ikki kasr son — boshlangʻich xato va chegara. Har oʻqitish davrida xato ikki barobar kamayadi. "
        + "Xato chegaradan KICHIK boʻlishi uchun necha davr kerakligini chiqar (takrorlar soni oldindan maʼlum emas — while).",
      solution: "xato = float(input())\nchegara = float(input())\ndavr = 0\nwhile xato >= chegara:\n    xato = xato / 2\n    davr += 1\nprint(davr)",
      tests: [["0.8", "0.1"], ["1", "0.3"], ["0.05", "0.1"], ["0.4", "0.4"], ["64", "1"]],
      wrong: ["xato = float(input())\nchegara = float(input())\ndavr = 0\nwhile xato > chegara:\n    xato = xato / 2\n    davr += 1\nprint(davr)"],
    },
    {
      id: "toxtash-belgisi", tier: 2,
      what: "Kirish: butun sonlar ketma-ket keladi, oxirida -1 turadi — bu toʻxtash belgisi, u hisobga kirmaydi. Nechta son kelishi oldindan maʼlum emas. "
        + "Bitta satrda oʻlchovlar sonini va yigʻindisini chiqar.",
      solution: "soni = 0\njami = 0\nx = int(input())\nwhile x != -1:\n    soni += 1\n    jami += x\n    x = int(input())\nprint(soni, jami)",
      tests: [["5", "7", "-1"], ["-1"], ["0", "0", "0", "-1"], ["10", "-1"], ["1", "2", "3", "4", "5", "-1"]],
      wrong: ["soni = 0\njami = 0\nx = 0\nwhile x != -1:\n    x = int(input())\n    soni += 1\n    jami += x\nprint(soni, jami)"],
    },
    {
      id: "erta-toxtash", tier: 2,
      what: "Kirish: birinchi satrda n, keyin n ta davrdagi xato qiymati (butun son). Xato birinchi marta oldingi davrdagidan KATTA chiqqan davr raqamini chiqar "
        + "(davrlar 1 dan sanaladi) — oʻqitish shu yerda toʻxtatiladi (erta toʻxtatish, early stopping). Bunday davr boʻlmasa, 0 chiqar.",
      solution: "n = int(input())\noldingi = int(input())\njavob = 0\nfor i in range(2, n + 1):\n    x = int(input())\n    if x > oldingi and javob == 0:\n        javob = i\n    oldingi = x\nprint(javob)",
      tests: [["5", "40", "30", "25", "27", "20"], ["3", "9", "8", "7"], ["4", "5", "6", "4", "7"], ["1", "5"], ["4", "5", "5", "5", "6"], ["5", "9", "7", "8", "6", "9"]],
      wrong: ["n = int(input())\noldingi = int(input())\njavob = 0\nfor i in range(2, n + 1):\n    x = int(input())\n    if x > oldingi:\n        javob = i\n    oldingi = x\nprint(javob)",
        "n = int(input())\noldingi = int(input())\njavob = 0\nfor i in range(2, n + 1):\n    x = int(input())\n    if x >= oldingi and javob == 0:\n        javob = i\n    oldingi = x\nprint(javob)"],
    },
    {
      id: "kopchilik", tier: 2,
      what: "Kirish: birinchi satrda n, keyin n ta yorliq — mushuk yoki it. Qaysi yorliq koʻproq uchraganini chiqar; sonlari teng boʻlsa teng deb yoz.",
      solution: 'n = int(input())\nmushuk = 0\nit = 0\nfor i in range(n):\n    if input() == "mushuk":\n        mushuk += 1\n    else:\n        it += 1\nif mushuk > it:\n    print("mushuk")\nelif it > mushuk:\n    print("it")\nelse:\n    print("teng")',
      tests: [["3", "mushuk", "it", "mushuk"], ["3", "it", "it", "mushuk"], ["2", "mushuk", "it"], ["1", "it"], ["4", "it", "mushuk", "mushuk", "it"]],
      wrong: ['n = int(input())\nmushuk = 0\nit = 0\nfor i in range(n):\n    if input() == "mushuk":\n        mushuk += 1\n    else:\n        it += 1\nif mushuk > it:\n    print("mushuk")\nelse:\n    print("it")'],
    },
  ];

  const sinovlar = (tests) => tests.map((stdin) => ({ stdin }));

  function tuzatTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const f = zinadan(FIX, tier, rnd);
      return { id: "tuzat:" + f.id, type: "xato-top", kind: f.id, what: f.what, why: f.why, code: f.code, solution: f.solution, tests: sinovlar(f.tests) };
    }, prev, rr);
  }

  function yozTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const w = zinadan(WRITE, tier, rnd);
      return { id: "yoz:" + w.id, type: "kod-yoz", kind: w.id, what: w.what, solution: w.solution, tests: sinovlar(w.tests) };
    }, prev, rr);
  }

  // 3-bosqichda tuzatish va yozish navbat bilan keladi
  function stage3Task(r, prev, tier) {
    const rr = r || Math.random;
    const wantWrite = prev ? prev.type !== "kod-yoz" : rr() < 0.5;
    return wantWrite ? yozTask(rr, prev, tier) : tuzatTask(rr, prev, tier);
  }

  const api = { BLANK, S1, HISOB, NAQSH, FIX, WRITE, fill, probe, sanoqTask, hisobTask, naqshTask, stage2Task, tuzatTask, yozTask, stage3Task };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
