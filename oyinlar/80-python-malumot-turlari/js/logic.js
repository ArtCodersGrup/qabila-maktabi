// «Oʻzgaruvchi va maʼlumot turlari» (IX sinf, 8-dars): savollarni yasash — sof mantiq, ekransiz.
// Node'da test qilinadi: tests/logic.test.js. Har kod o'z talqinchimizda bajarib tekshiriladi.
(function (root) {
  "use strict";

  const K = (root.QK && root.QK.kod) || require("../../umumiy/js/kod.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  function pickNew(make, prev, r) {
    for (let k = 0; k < 60; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  // Qiyinlik zinasi (QOIDALAR 4.3): 0 — birinchi javob, 1 — o'rta, 2 — oxirgilari va qiyin rejim.
  const zina = (tier) => (tier == null ? 2 : Math.max(0, Math.min(2, tier)));
  function zinadan(list, tier, rnd) {
    if (tier == null) return pick(list, rnd);
    const t = zina(tier);
    const mos = list.filter((x) => (x.tier || 0) <= t);
    const ayni = mos.filter((x) => (x.tier || 0) === t);
    return ayni.length && rnd() < 0.6 ? pick(ayni, rnd) : pick(mos, rnd);
  }

  // Kasr son chiqishda "uzun dum" bermasligi kerak (0.30000000000000004) — bunday misol chiqarilmaydi
  const UZUN_KASR = /\d\.\d{5,}/;
  function toza(code, maxLines) {
    const r = K.run(code);
    if (r.error) return null;
    if (r.output.length === 0 || r.output.length > (maxLines || 4)) return null;
    if (r.output.some((line) => UZUN_KASR.test(line))) return null;
    return r;
  }

  // ---------- Ma'lumot: belgi qiymatlari, yorliqlar, o'lchovlar ----------
  const SINFLAR = ["mushuk", "it", "qush", "spam", "olma", "mashina"];
  const JAMI = [10, 20, 25, 50, 100, 200];
  const kasr = (rnd) => {
    let n = int(rnd, 51, 99);
    if (n % 10 === 0) n += 1;
    return "0." + n;
  };
  const sinflar = (rnd, n) => {
    const out = [];
    while (out.length < n) {
      const s = pick(SINFLAR, rnd);
      if (!out.includes(s)) out.push(s);
    }
    return out;
  };
  const matnlar = (list) => "[" + list.map((s) => '"' + s + '"').join(", ") + "]";
  const sonlar = (list) => "[" + list.join(", ") + "]";
  const ballar = (rnd, n) => Array.from({ length: n }, () => int(rnd, 3, 5) * 10 + int(rnd, 0, 9));

  // ---------- 1-bosqich: turni aniqla ----------
  const TURLAR = ["int", "float", "str", "bool", "list"];

  // Qiymatning turi talqinchining o'zidan olinadi: print(type(nom)) → <class 'float'>
  const typeLine = (name) => "print(type(" + name + "))";
  function typeOf(code, name) {
    const r = K.run(code + "\n" + typeLine(name));
    if (r.error) return null;
    const m = /^<class '(\w+)'>$/.exec(r.output[r.output.length - 1]);
    return m && TURLAR.includes(m[1]) ? m[1] : null;
  }

  const ISHORA = [
    "Yozilishiga qara: qoʻshtirnoq, nuqta yoki kvadrat qavs bormi?",
    "Oxirgi amalga qara: / har doim float, // butun boʻlinma, solishtirish — bool, matnlarda + ulaydi.",
    "Eng tashqi amal yoki funksiya natija turini beradi: int(), float(), str(), bool(), len().",
  ];

  const shakl = (id, tier, make) => ({ id, tier, make });

  // make(rnd) → [kod, nom]; tur — kutilgan javob (test talqinchi bilan solishtiradi); why — yechim izohi
  const tur = (id, tier, turi, why, make) => ({ id, tier, tur: turi, why, make });
  const TUR_SHAKLLAR = [
    tur("butun", 0, "int", "Qoʻshtirnoqsiz, nuqtasiz butun son — int.", (r) => ["namunalar = " + int(r, 20, 900), "namunalar"]),
    tur("kasr", 0, "float", "Nuqtali son — float.", (r) => ["ehtimol = " + kasr(r), "ehtimol"]),
    tur("matn", 0, "str", "Qoʻshtirnoq ichidagi qiymat — str.", (r) => ['yorliq = "' + pick(SINFLAR, r) + '"', "yorliq"]),
    tur("mantiq", 0, "bool", "True va False — bool qiymatlari: qoʻshtirnoqsiz, bosh harf bilan.", (r) => ["spammi = " + pick(["True", "False"], r), "spammi"]),
    tur("royxat", 0, "list", "Kvadrat qavs ichidagi qiymatlar — list.", (r) => ["ballar = " + sonlar(ballar(r, 3)), "ballar"]),

    tur("matn-son", 1, "str", "Qoʻshtirnoq ichida boʻlgani uchun bu son emas — str.", (r) => ['harorat = "' + int(r, 35, 39) + "." + int(r, 1, 9) + '"', "harorat"]),
    tur("nuqta-nol", 1, "float", "Nuqta bor — float, qiymati butun boʻlsa ham.", (r) => ["jami = " + pick(JAMI, r) + ".0", "jami"]),
    tur("matn-mantiq", 1, "str", "Qoʻshtirnoq ichida — str; bool boʻlishi uchun qoʻshtirnoqsiz yoziladi.", (r) => ['tayyor = "' + pick(["True", "False"], r) + '"', "tayyor"]),
    tur("bitta-element", 1, "list", "Bitta elementli boʻlsa ham kvadrat qavs — list.", (r) => ["ehtimollar = [" + kasr(r) + "]", "ehtimollar"]),
    tur("bolish", 1, "float", "/ boʻlish har doim float beradi.", (r) => {
      const j = pick(JAMI, r);
      return ["x = " + int(r, 3, j - 1) + " / " + j, "x"];
    }),
    tur("butun-bolish", 1, "float", "/ har doim float beradi — natija butun chiqsa ham (masalan, 5.0).", (r) => {
      const b = int(r, 2, 9);
      return ["x = " + b * int(r, 2, 9) + " / " + b, "x"];
    }),
    tur("butun-bolinma", 1, "int", "// — butun boʻlinma: int va int dan int chiqadi.", (r) => ["x = " + int(r, 20, 99) + " // " + int(r, 2, 9), "x"]),
    tur("ulash", 1, "str", "Ikki matnda + ulaydi, natija — yana matn (str).", (r) => ['x = "' + int(r, 2, 9) + '" + "' + int(r, 2, 9) + '"', "x"]),
    tur("solishtirish", 1, "bool", "Solishtirish natijasi — True yoki False, yaʼni bool.", (r) => ["x = " + kasr(r) + " >= 0.5", "x"]),
    tur("uzunlik", 1, "int", "len() elementlar sonini qaytaradi — bu int.", (r) => ["yorliqlar = " + matnlar(sinflar(r, int(r, 2, 4))) + "\nx = len(yorliqlar)", "x"]),
    tur("element", 1, "str", "Indeks bitta elementni oladi; bu roʻyxatning elementlari — matn.", (r) => ["yorliqlar = " + matnlar(sinflar(r, 3)) + "\nx = yorliqlar[" + int(r, 0, 2) + "]", "x"]),
    tur("aralash", 1, "float", "int va float aralashsa, natija float boʻladi.", (r) => ["x = " + int(r, 2, 40) + " * 2.0", "x"]),

    tur("int-matn", 2, "int", "int() matndagi butun sonni int ga oʻgiradi.", (r) => ['x = int("' + int(r, 10, 99) + '")', "x"]),
    tur("float-matn", 2, "float", "float() matnni kasr songa oʻgiradi.", (r) => ['x = float("' + kasr(r) + '")', "x"]),
    tur("str-son", 2, "str", "str() har qanday qiymatni matnga aylantiradi.", (r) => ["x = str(" + kasr(r) + ")", "x"]),
    tur("int-kasr", 2, "int", "int() kasr qismini tashlab, int qaytaradi.", (r) => ["x = int(" + int(r, 2, 40) + "." + int(r, 1, 9) + ")", "x"]),
    tur("float-butun", 2, "float", "float() butun sonni ham float ga aylantiradi (5 → 5.0).", (r) => ["x = float(" + int(r, 2, 40) + ")", "x"]),
    tur("bool-son", 2, "bool", "bool() har doim bool qaytaradi: 0 — False, boshqa son — True.", (r) => ["x = bool(" + pick([0, int(r, 1, 9)], r) + ")", "x"]),
    tur("foiz-matn", 2, "str", "str(…) + matn — ikki matn ulanadi, natija str.", (r) => ["x = str(" + int(r, 51, 99) + ') + "%"', "x"]),
    tur("int-kop-float", 2, "float", "int(…) — int, lekin float ga koʻpaytirilgach natija float.", (r) => ['x = int("' + int(r, 2, 9) + '") * ' + int(r, 1, 4) + ".5", "x"]),
    tur("royxat-qoshish", 2, "list", "Ikki roʻyxatda + ularni ulaydi, natija — list.", (r) => ["x = [" + int(r, 1, 9) + ", " + int(r, 1, 9) + "] + [" + int(r, 1, 9) + "]", "x"]),
    tur("royxat-element", 2, "float", "Oxirgi amal — indeks: u roʻyxatdan bitta elementni oladi, element esa float.", (r) => ["x = [" + kasr(r) + ", " + kasr(r) + "][0]", "x"]),
    tur("uzunlik-shart", 2, "bool", "Oxirgi amal — solishtirish, demak bool.", (r) => ['x = len("' + pick(SINFLAR, r) + '") > ' + int(r, 2, 6), "x"]),
    tur("str-mantiq", 2, "str", "str() natijasi har doim matn — ichida True yozilgan boʻlsa ham.", (r) => ["x = str(" + int(r, 2, 9) + " > " + int(r, 2, 9) + ")", "x"]),
    tur("int-bolish", 2, "float", "int() lar int beradi, lekin oxirgi amal / — u har doim float.", (r) => ['x = int("' + int(r, 3, 9) + '") / int("' + pick([10, 20, 50], r) + '")', "x"]),
    tur("royxat-ichida", 2, "list", "Kvadrat qavs roʻyxat yasaydi — ichidagi element int boʻlsa ham.", (r) => ['x = [int("' + int(r, 10, 99) + '")]', "x"]),
    tur("uzunlik-bolish", 2, "float", "len() int beradi, lekin oxirgi amal / — natija float.", (r) => ["x = len(" + sonlar(ballar(r, int(r, 2, 4))) + ") / 2", "x"]),
  ];

  function typeTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const s = zinadan(TUR_SHAKLLAR, tier, rnd);
      const [code, name] = s.make(rnd);
      const answer = typeOf(code, name);
      if (!answer) return null;
      const qiymat = K.run(code + "\nprint(" + name + ")").output.pop();
      return {
        id: "tur:" + code, type: "tur", kind: s.id, code, name, answer, options: TURLAR,
        why: s.why, ishora: ISHORA[s.tier], qiymat,
        // yechim va tasdiq uchun: haqiqiy type() chiqishi
        tekshir: code + "\n" + typeLine(name), chiqish: "<class '" + answer + "'>",
      };
    }, prev, rr);
  }

  // type() chiqishini aytish: javob <class 'int'> ko'rinishida yoziladi
  const TYPE_SHAKLLAR = [
    shakl("ikki-qiymat", 0, (r) => 'yorliq = "' + pick(SINFLAR, r) + '"\nehtimol = ' + kasr(r) + "\nprint(type(yorliq))\nprint(type(ehtimol))"),
    shakl("son-va-matn", 0, (r) => {
      const n = int(r, 12, 99);
      return "print(type(" + n + '))\nprint(type("' + n + '"))';
    }),
    shakl("mantiq-royxat", 0, (r) => "spammi = " + pick(["True", "False"], r) + "\nballar = " + sonlar(ballar(r, 3)) + "\nprint(type(spammi))\nprint(type(ballar))"),
    shakl("bolish", 1, (r) => {
      const n = int(r, 2, 9);
      return "print(type(" + n + " / 1))\nprint(type(" + n + " // 1))";
    }),
    shakl("matn-ulash", 1, (r) => {
      const a = int(r, 2, 9);
      return 'print(type("' + a + '" + "' + a + '"))\nprint(type(' + a + " + " + a + "))";
    }),
    shakl("uzunlik", 1, (r) => "yorliqlar = " + matnlar(sinflar(r, int(r, 2, 4))) + "\nprint(type(len(yorliqlar)))\nprint(type(yorliqlar[0]))"),
    shakl("shart", 1, (r) => "ehtimol = " + kasr(r) + "\nprint(type(ehtimol >= 0.5))\nprint(type(ehtimol * 2))"),
    shakl("ogirish", 2, (r) => 'print(type(int("' + int(r, 2, 99) + '")))\nprint(type(str(' + kasr(r) + ")))\nprint(type(float(" + int(r, 2, 99) + ")))"),
    shakl("tur-taqqos", 2, (r) => {
      const n = int(r, 2, 9);
      return "print(type(" + n + ") == type(" + n + ".0))\nprint(type(" + n * 2 + " / 2) == type(0.5))";
    }),
    shakl("royxat-ichi", 2, (r) => 'x = [int("' + int(r, 10, 99) + '"), ' + kasr(r) + "]\nprint(type(x))\nprint(type(x[0]))\nprint(type(x[-1]))"),
    shakl("yaxlitlash", 2, (r) => {
      const p = kasr(r);
      return "aniqlik = " + p + "\nprint(type(round(aniqlik * 100)))\nprint(type(round(aniqlik, 1)))\nprint(type(int(aniqlik * 100) / 100))";
    }),
  ];

  function typePrintTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const s = zinadan(TYPE_SHAKLLAR, tier, rnd);
      const code = s.make(rnd);
      if (!toza(code)) return null;
      return { id: "natija:" + code, type: "natija", code, solution: code, kind: s.id };
    }, prev, rr);
  }

  // 1-bosqichda ikki xil savol navbat bilan keladi: turni tanlash va type() chiqishini yozish
  function stage1Task(r, prev, tier) {
    const rr = r || Math.random;
    const tanlov = prev ? prev.type !== "tur" : true;
    return tanlov ? typeTask(rr, prev, tier) : typePrintTask(rr, prev, tier);
  }

  // ---------- 2-bosqich: o'girish — natijani ayt va xatoni tuzat ----------
  const OGIRISH_SHAKLLAR = [
    shakl("ikki-marta", 0, (r) => 'matn = "' + int(r, 12, 49) + '"\nprint(matn + matn)\nprint(int(matn) + int(matn))'),
    shakl("int-float", 0, (r) => "print(int(" + int(r, 2, 40) + "." + int(r, 5, 9) + "))\nprint(float(" + int(r, 2, 40) + "))"),
    shakl("str-nol", 0, (r) => "soni = " + int(r, 12, 99) + '\nprint(str(soni) + "0")\nprint(soni * 10)'),
    shakl("float-ikki", 1, (r) => 'a = "' + int(r, 1, 9) + '.5"\nprint(float(a) * 2)\nprint(a * 2)'),
    shakl("foiz-uzunlik", 1, (r) => "print(str(" + int(r, 51, 99) + ') + "%")\nprint(len(str(' + pick([100, 1000, 25000, 365], r) + ")))"),
    shakl("yaxlitlash", 1, (r) => {
      const n = int(r, 2, 40), d = int(r, 6, 9);
      return "x = " + n + "." + d + "\nprint(int(x), round(x))\nprint(round(0." + int(r, 51, 94) + pick([1, 2, 3, 7, 8, 9], r) + ", 2))";
    }),
    shakl("bool", 1, (r) => "print(bool(0), bool(" + kasr(r) + '))\nprint(bool(""), bool("0"))'),
    shakl("ichma-ich", 2, (r) => {
      const n = int(r, 2, 20) * 2 + 1;
      return 'print(int("' + n + '") / 2)\nprint(int(' + n + " / 2))";
    }),
    shakl("zanjir", 2, (r) => 'print(int(float("' + int(r, 2, 40) + "." + int(r, 5, 9) + '")))\nprint(str(' + int(r, 1, 9) + ") + str(" + int(r, 1, 9) + "))"),
    shakl("matn-taqqos", 2, (r) => {
      const a = int(r, 2, 9), b = int(r, 10, 19);
      return 'print("' + a + '" > "' + b + '")\nprint(int("' + a + '") > int("' + b + '"))';
    }),
    shakl("bool-int", 2, (r) => {
      const a = int(r, 2, 9);
      return 'print(int(True) + int("' + a + '"))\nprint(str(True) + "' + a + '")';
    }),
  ];

  function convTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const s = zinadan(OGIRISH_SHAKLLAR, tier, rnd);
      const code = s.make(rnd);
      if (!toza(code)) return null;
      return { id: "natija:" + code, type: "natija", code, solution: code, kind: s.id };
    }, prev, rr);
  }

  // make(rnd) → [buzilgan kod, to'g'ri kod]; why — maslahat (qoida, tayyor javob emas)
  const xato = (kind, tier, why, make) => ({ kind, tier, why, make });
  const XATOLAR = [
    xato("matn-plyus-son", 0, "matnga sonni + bilan ulab boʻlmaydi: sonni str() bilan matnga oʻgir", (r) => {
      const n = int(r, 12, 99);
      return ["soni = " + n + '\nprint("Namunalar: " + soni)', "soni = " + n + '\nprint("Namunalar: " + str(soni))'];
    }),
    xato("matnlar-yigindisi", 0, "a va b — matn, + ularni ulaydi; qoʻshish uchun int() kerak", (r) => {
      const a = int(r, 12, 49), b = int(r, 12, 49);
      const bosh = 'a = "' + a + '"\nb = "' + b + '"\n';
      return [bosh + "print(a + b)", bosh + "print(int(a) + int(b))"];
    }),
    xato("matn-bolish", 1, "matnni boʻlib boʻlmaydi: ikkala qiymatni int() bilan songa oʻgir", (r) => {
      const j = pick(JAMI, r), t = int(r, Math.ceil(j * 0.6), j - 1);
      const bosh = 'togri = "' + t + '"\njami = "' + j + '"\n';
      return [bosh + "print(togri / jami)", bosh + "print(int(togri) / int(jami))"];
    }),
    xato("matn-kopaytma", 1, "matn * 2 — matnni ikki marta takrorlaydi; hisoblash uchun avval int()", (r) => {
      const n = int(r, 12, 17);
      return ['yosh = "' + n + '"\nprint(yosh * 2)', 'yosh = "' + n + '"\nprint(int(yosh) * 2)'];
    }),
    xato("int-kasr", 1, "int() kasr yozilgan matnni oʻgira olmaydi — kasr uchun boshqa funksiya bor", (r) => {
      const p = kasr(r);
      return ['ehtimol = int("' + p + '")\nprint(ehtimol * 100)', 'ehtimol = float("' + p + '")\nprint(ehtimol * 100)'];
    }),
    xato("vergulli-kasr", 2, "Pythonda oʻnlik ajratuvchi — nuqta; maʼlumotdagi vergulni tuzat", (r) => {
      const a = int(r, 35, 39), b = int(r, 1, 9);
      return ['harorat = float("' + a + "," + b + '")\nprint(harorat * 2)', 'harorat = float("' + a + "." + b + '")\nprint(harorat * 2)'];
    }),
    xato("son-uzunligi", 2, "len() sonda ishlamaydi: raqamlar sonini bilish uchun avval str() ga oʻgir", (r) => {
      const n = pick([int(r, 100, 999), int(r, 1000, 9999), int(r, 10000, 99999)], r);
      return ["aholi = " + n + "\nprint(len(aholi))", "aholi = " + n + "\nprint(len(str(aholi)))"];
    }),
    xato("birlik", 2, "int() faqat raqamlardan iborat matnni oʻgiradi: maʼlumotdagi ortiqcha yozuvni olib tashla", (r) => {
      const n = int(r, 40, 90);
      return ['vazn = int("' + n + ' kg")\nprint(vazn + 1)', 'vazn = int("' + n + '")\nprint(vazn + 1)'];
    }),
    xato("foiz-yozuvi", 2, "+ bilan faqat matnlar ulanadi: hisoblangan sonni str() ichiga ol", (r) => {
      const p = kasr(r);
      return ["aniqlik = " + p + '\nprint("Aniqlik: " + round(aniqlik * 100) + "%")', "aniqlik = " + p + '\nprint("Aniqlik: " + str(round(aniqlik * 100)) + "%")'];
    }),
  ];

  function convFixTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const x = zinadan(XATOLAR, tier, rnd);
      const [code, good] = x.make(rnd);
      const kutilgan = toza(good);
      if (!kutilgan) return null;
      const r2 = K.run(code);
      if (!r2.error && K.sameOutput(r2.output, kutilgan.output)) return null;
      return {
        id: "xato:" + code, type: "xato-top", kind: x.kind, why: x.why,
        code, solution: good, lines: K.normalize(kutilgan.output),
      };
    }, prev, rr);
  }

  // 2-bosqichda ikki xil savol navbat bilan keladi
  function stage2Task(r, prev, tier) {
    const rr = r || Math.random;
    const tuzat = prev ? prev.type !== "xato-top" : rr() < 0.5;
    return tuzat ? convFixTask(rr, prev, tier) : convTask(rr, prev, tier);
  }

  // ---------- 3-bosqich: ro'yxat — natijani ayt va o'zing yoz ----------
  const ROYXAT_SHAKLLAR = [
    shakl("birinchi-soni", 0, (r) => "yorliqlar = " + matnlar(sinflar(r, int(r, 3, 4))) + "\nprint(yorliqlar[0])\nprint(len(yorliqlar))"),
    shakl("indeks-oxirgi", 0, (r) => "ballar = " + sonlar(ballar(r, 4)) + "\nprint(ballar[" + int(r, 1, 2) + "], ballar[-1])"),
    shakl("almashtirish", 1, (r) => {
      const [a, b] = sinflar(r, 2);
      const i = int(r, 0, 2);
      return "yorliqlar = " + matnlar([a, b, a]) + "\nyorliqlar[" + i + '] = "' + (i === 1 ? a : b) + '"\nprint(yorliqlar)';
    }),
    shakl("qoshish", 1, (r) => "olchovlar = " + sonlar(ballar(r, int(r, 2, 3))) + "\nolchovlar.append(" + int(r, 30, 59) + ")\nprint(len(olchovlar))\nprint(olchovlar[len(olchovlar) - 1])"),
    shakl("yigindi", 1, (r) => "ballar = " + sonlar(ballar(r, 3)) + "\nprint(sum(ballar))\nprint(ballar[0] + ballar[-1])"),
    shakl("ortacha", 2, (r) => "ballar = " + sonlar(ballar(r, pick([2, 4, 5], r))) + "\nprint(sum(ballar) / len(ballar))"),
    shakl("kesim", 2, (r) => "ballar = " + sonlar(ballar(r, 4)) + "\nprint(ballar[1:3])\nprint(len(ballar[1:3]))"),
    shakl("ichki-indeks", 2, (r) => {
      const s = sinflar(r, 2);
      return "yorliqlar = " + matnlar(s) + "\nprint(yorliqlar[" + int(r, 0, 1) + "][0])\nprint(len(yorliqlar[0]))";
    }),
    shakl("qator", 2, (r) => 'qator = ["' + int(r, 101, 199) + '", "' + (r() < 0.5 ? kasr(r) : "0." + int(r, 11, 49)) + '", "' + pick(SINFLAR, r) + '"]\nprint(float(qator[1]) > 0.5)\nprint(int(qator[0]) + 1)'),
    shakl("ulash", 2, (r) => {
      const b = ballar(r, 3);
      return "a = " + sonlar(b.slice(0, 2)) + "\nb = a + [" + b[2] + "]\nprint(len(b), b[-1])\nprint(a)";
    }),
    shakl("aralash-turlar", 2, (r) => 'namuna = ["' + pick(SINFLAR, r) + '", ' + kasr(r) + ", " + pick(["True", "False"], r) + "]\nprint(namuna)\nprint(namuna[-1])"),
  ];

  function listTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const s = zinadan(ROYXAT_SHAKLLAR, tier, rnd);
      const code = s.make(rnd);
      if (!toza(code)) return null;
      return { id: "natija:" + code, type: "natija", code, solution: code, kind: s.id };
    }, prev, rr);
  }

  // sets — sinov qiymatlari: tekshiruv bolaning kodidagi "nom = …" satrini navbat bilan har to'plamga almashtirib
  // ishga tushiradi. Birinchi to'plam — muharrirda turgan boshlang'ich qiymatlar. Ro'yxat uzunligi to'plamdan
  // to'plamga o'zgaradi: qotirilgan indeks ([2]) o'rniga [-1] yoki len() kerak bo'ladi.
  const WRITE_KINDS = [
    {
      id: "chetlar", tier: 0,
      what: "yorliqlar roʻyxatining birinchi va oxirgi elementini alohida satrlarda chiqar. Roʻyxat uzunligi boshqa boʻlsa ham ishlasin.",
      sets: [{ yorliqlar: '["mushuk", "it", "qush"]' }, { yorliqlar: '["spam", "oddiy"]' }, { yorliqlar: '["olma", "nok", "anor", "uzum", "behi"]' }],
      solution: 'yorliqlar = ["mushuk", "it", "qush"]\nprint(yorliqlar[0])\nprint(yorliqlar[-1])',
    },
    {
      id: "soni", tier: 0,
      what: "Toʻplamda nechta oʻlchov borligini chiqar. Sonni qoʻlda yozma — len() dan foydalan.",
      sets: [{ olchovlar: "[36.6, 37.1, 38.0]" }, { olchovlar: "[36.6, 36.8, 37.0, 39.2, 36.5]" }, { olchovlar: "[40.1]" }],
      solution: 'olchovlar = [36.6, 37.1, 38.0]\nprint("Namunalar soni:", len(olchovlar))',
    },
    {
      id: "ortacha", tier: 1,
      what: "ballar roʻyxatining oʻrtacha qiymatini chiqar: yigʻindi / elementlar soni. sum() va len() bor.",
      sets: [{ ballar: "[80, 90, 100]" }, { ballar: "[70, 75]" }, { ballar: "[60, 80, 85, 95]" }, { ballar: "[50]" }],
      solution: "ballar = [80, 90, 100]\nprint(sum(ballar) / len(ballar))",
    },
    {
      id: "qoshish", tier: 1,
      what: "Yangi yorliqni roʻyxat oxiriga qoʻsh. Keyin roʻyxatni va uning uzunligini chiqar.",
      sets: [
        { yorliqlar: '["mushuk", "it"]', yangi: '"qush"' },
        { yorliqlar: '["spam"]', yangi: '"oddiy"' },
        { yorliqlar: '["olma", "nok", "anor"]', yangi: '"uzum"' },
      ],
      solution: 'yorliqlar = ["mushuk", "it"]\nyangi = "qush"\nyorliqlar.append(yangi)\nprint(yorliqlar)\nprint(len(yorliqlar))',
    },
    {
      id: "tuzatish", tier: 1,
      what: "Oxirgi yorliq xato yozilgan (mushk). Uni \"mushuk\" ga almashtir va roʻyxatni chiqar. Roʻyxat uzunligi har xil boʻlishi mumkin.",
      sets: [{ yorliqlar: '["mushuk", "it", "mushk"]' }, { yorliqlar: '["it", "mushk"]' }, { yorliqlar: '["qush", "it", "it", "mushk"]' }],
      solution: 'yorliqlar = ["mushuk", "it", "mushk"]\nyorliqlar[-1] = "mushuk"\nprint(yorliqlar)',
    },
    {
      id: "matndan", tier: 2,
      what: "Fayldan oʻqilgan qator — matnlar roʻyxati: [toʻgʻri javoblar, jami]. Aniqlikni (toʻgʻri / jami) hisoblab chiqar. Matnni avval songa oʻgir.",
      sets: [{ qator: '["46", "50"]' }, { qator: '["171", "200"]' }, { qator: '["9", "10"]' }],
      solution: 'qator = ["46", "50"]\nprint(int(qator[0]) / int(qator[1]))',
    },
    {
      id: "oraliq", tier: 2,
      what: "Yoshlar oraligʻini chiqar: eng katta − eng kichik. max() va min() bor; roʻyxat tartiblanmagan.",
      sets: [{ yoshlar: "[14, 15, 17, 15]" }, { yoshlar: "[20, 12, 16]" }, { yoshlar: "[9]" }, { yoshlar: "[13, 18, 15, 11, 14]" }],
      solution: 'yoshlar = [14, 15, 17, 15]\nprint("Oraliq:", max(yoshlar) - min(yoshlar))',
    },
    {
      id: "aniqlik", tier: 2,
      what: "natijalar roʻyxatida 1 — model toʻgʻri topdi, 0 — xato qildi. Aniqlikni chiqar: birlar yigʻindisi / jami soni.",
      sets: [{ natijalar: "[1, 0, 1, 1]" }, { natijalar: "[1, 1, 0, 0, 1, 1, 1, 1, 0, 1]" }, { natijalar: "[1, 1]" }, { natijalar: "[0, 1, 0, 0, 0]" }],
      solution: 'natijalar = [1, 0, 1, 1]\nprint("Aniqlik:", sum(natijalar) / len(natijalar))',
    },
    {
      id: "eng-yaxshi", tier: 2,
      what: "Ikki roʻyxat berilgan: model nomlari va ularning aniqligi (bir xil tartibda). Oxirgi modelning nomi va aniqligini bitta satrda chiqar, keyin eng yuqori aniqlikni chiqar.",
      sets: [
        { modellar: '["A", "B", "C"]', aniqliklar: "[0.81, 0.92, 0.88]" },
        { modellar: '["eski", "yangi"]', aniqliklar: "[0.75, 0.74]" },
        { modellar: '["v1", "v2", "v3", "v4"]', aniqliklar: "[0.6, 0.7, 0.65, 0.95]" },
      ],
      solution: 'modellar = ["A", "B", "C"]\naniqliklar = [0.81, 0.92, 0.88]\nprint(modellar[-1], aniqliklar[-1])\nprint("Eng yuqori:", max(aniqliklar))',
    },
  ];

  // Koddagi "nom = …" satrlarini to'plamdagi qiymatlarga almashtirish. yoq — topilmagan nom.
  function qoy(code, set) {
    let out = String(code);
    for (const name of Object.keys(set)) {
      const re = new RegExp("^" + name + "[ \\t]*=(?!=).*$", "m");
      if (!re.test(out)) return { code: out, yoq: name };
      out = out.replace(re, () => name + " = " + set[name]);
    }
    return { code: out, yoq: null };
  }

  const setMatni = (set) => Object.keys(set).map((n) => n + " = " + set[n]).join(", ");
  const boshlangich = (kind) => Object.keys(kind.sets[0]).map((n) => n + " = " + kind.sets[0][n]).join("\n") + "\n";

  function vazifa(kind) {
    return {
      id: "yoz:" + kind.id, type: "kod-yoz", kind: kind.id, what: kind.what, solution: kind.solution,
      sets: kind.sets, starter: boshlangich(kind), lines: K.normalize(K.run(kind.solution).output),
    };
  }

  // Yozilgan kodni tekshirish: har sinov to'plami bilan ishga tushirib, namunali yechim chiqishi bilan solishtirish
  function checkWrite(task, code) {
    const text = String(code == null ? "" : code);
    if (!text.trim()) return { ok: false, kind: "bosh", hint: "Avval kodni yoz, keyin ishga tushir." };
    for (const set of task.sets) {
      const q = qoy(text, set);
      if (q.yoq) {
        return { ok: false, kind: "ozgaruvchi", hint: "«" + q.yoq + " = …» satri joyida qolsin: tekshiruv unga boshqa qiymat qoʻyib koʻradi." };
      }
      const r = K.run(q.code);
      if (r.error) return { ok: false, kind: "xato", error: r.error, set, hint: setMatni(set) + " boʻlganda: " + r.error.text };
      const expected = K.normalize(K.run(qoy(task.solution, set).code).output);
      if (!K.sameOutput(expected, r.output)) {
        return {
          ok: false, kind: "chiqish", expected, got: K.normalize(r.output), set,
          hint: setMatni(set) + " boʻlganda kutilgan: " + expected.join(" / ") + "; sendan: " + (K.normalize(r.output).join(" / ") || "(boʻsh)"),
        };
      }
    }
    return { ok: true };
  }

  // seen — shu mashqda allaqachon berilgan masalalar (id lar to'plami): imkon bo'lsa, qayta berilmaydi
  function writeTask(r, prev, tier, seen) {
    const rr = r || Math.random;
    const yangi = WRITE_KINDS.filter((k) => !(seen && seen.has("yoz:" + k.id)));
    const bank = yangi.length > 1 ? yangi : WRITE_KINDS;
    return pickNew((rnd) => vazifa(zinadan(bank, tier, rnd)), prev, rr);
  }

  // 3-bosqichda ro'yxat kodini o'qish va o'zi yozish navbat bilan keladi
  function stage3Task(r, prev, tier, seen) {
    const rr = r || Math.random;
    const yoz = prev ? prev.type !== "kod-yoz" : rr() < 0.5;
    return yoz ? writeTask(rr, prev, tier, seen) : listTask(rr, prev, tier);
  }

  // ---------- Sahnalarda ko'rsatiladigan namunalar (test har birini ishga tushiradi) ----------
  const NAMUNALAR = {
    ozgaruvchilar: 'yosh = 15\nehtimol = 0.87\nyorliq = "spam"\nspammi = True\nballar = [4, 5, 3]\nprint(yorliq, ehtimol)',
    turlar: 'ehtimol = 0.87\nyorliq = "spam"\nprint(type(ehtimol))\nprint(type(yorliq))\nprint(type(15), type(True), type([4, 5, 3]))',
    amallar: 'print(46 / 50)\nprint(10 / 2, type(10 / 2))\nprint(7 // 2, type(7 // 2))\nprint(type(0.87 >= 0.5))\nprint("4" + "6", type("4" + "6"))',
    matnBolish: 'togri = "46"\njami = "50"\nprint(togri / jami)',
    ogirish: 'togri = int("46")\njami = int("50")\nprint(togri / jami)\nprint(str(46) + "%")\nprint(float("0.5") + 1)\nprint(int(3.99), round(3.99))',
    intKasr: 'print(int("0.87"))',
    jimXato: 'yosh = "15"\nprint(yosh * 2)',
    royxat: 'yorliqlar = ["mushuk", "it", "qush"]\nprint(yorliqlar[0])\nprint(yorliqlar[-1])\nprint(len(yorliqlar))\nyorliqlar.append("it")\nyorliqlar[1] = "mushuk"\nprint(yorliqlar)',
    indeksXato: "ballar = [80, 90, 100]\nprint(sum(ballar) / len(ballar))\nprint(ballar[3])",
  };

  const api = {
    SINFLAR, TURLAR, TUR_SHAKLLAR, TYPE_SHAKLLAR, OGIRISH_SHAKLLAR, XATOLAR, ROYXAT_SHAKLLAR, WRITE_KINDS, NAMUNALAR, UZUN_KASR,
    typeOf, typeTask, typePrintTask, stage1Task, convTask, convFixTask, stage2Task, listTask, writeTask, stage3Task, vazifa, checkWrite, qoy,
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
