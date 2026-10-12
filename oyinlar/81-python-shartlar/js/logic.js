// «Shartlar va tarmoqlanish» (IX sinf): topshiriqlarni yasash — sof mantiq, ekransiz.
// Node'da test qilinadi: tests/logic.test.js
//   1-bosqich — natijani ayt (natija), 2-bosqich — shartni to'ldir (bosh-joy),
//   3-bosqich — tasniflagichni tuzat (xato-top, mantiqiy xato) va o'zing yoz (kod-yoz).
// Hamma misol ma'lumot va model haqida: chegara bo'yicha qaror, toifalar, qoidali tasniflagich.
(function (root) {
  "use strict";

  const py = (root.QK && root.QK.python) || require("../../umumiy/js/python/python.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  // Yuzdan bir ulushlar bilan ishlaymiz (55 → "0.55"): kasr sonlar ekranda toza chiqadi
  const d2 = (n) => String(n / 100);

  function pickNew(make, prev, r) {
    for (let k = 0; k < 60; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  // Qiyinlik zinasi (QOIDALAR 4.3): 0 — birinchi javob, 1 — o'rta, 2 — oxirgilar va qiyin rejim.
  // Zina berilmasa (testlar) — hammasidan teng.
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

  // Model chiqishi (0…1) va chegara bo'yicha qaror — to'rt xil vaziyat
  const KONTEKST = [
    { v: "ehtimol", nom: "spam ehtimoli", hi: "spam", lo: "oddiy" },
    { v: "ishonch", nom: "model ishonchi", hi: "avtomat", lo: "odamga" },
    { v: "xavf", nom: "xavf bahosi", hi: "shifokorga", lo: "kuzatuv" },
    { v: "oxshashlik", nom: "oʻxshashlik", hi: "tavsiya", lo: "yashir" },
  ];
  const CHEGARALAR = [40, 50, 60, 70, 80];
  const OPLAR = [">=", ">", "<", "<="];

  // Yuqori zinada qiymat ko'pincha chegaraning o'zida yoki yonida: >= va > farqi shu yerda ko'rinadi
  const yaqin = (rnd, t, limit, qadam, min, max) => (t > 0 && rnd() < 0.6
    ? limit + pick([-qadam, 0, 0, qadam], rnd)
    : int(rnd, min / qadam, max / qadam) * qadam);

  // ---------- 1-bosqich: natijani ayt ----------
  const S1 = [
    {
      id: "chegara", tier: 0,
      make(rnd, t) {
        const c = pick(KONTEKST, rnd);
        const limit = pick(CHEGARALAR, rnd);
        const value = yaqin(rnd, t, limit, 5, 5, 95);
        const op = pick(OPLAR, rnd);
        const tail = rnd() < 0.4 ? '\nprint("tekshirildi")' : "";
        // Ma'no saqlanadi: katta qiymat — hi sinfi. "<" va "<=" da tarmoqlar o'rni almashadi.
        const yuqoriRost = op === ">=" || op === ">";
        return c.v + " = " + d2(value) + "\nif " + c.v + " " + op + " " + d2(limit) + ':\n    print("' + (yuqoriRost ? c.hi : c.lo)
          + '")\nelse:\n    print("' + (yuqoriRost ? c.lo : c.hi) + '")' + tail;
      },
    },
    {
      id: "yorliq", tier: 0,
      make(rnd) {
        const y = pick(["spam", "oddiy", "reklama"], rnd);
        const teng = rnd() < 0.5;
        return 'yorliq = "' + y + '"\nif yorliq ' + (teng ? "==" : "!=") + ' "spam":\n    print("' + (teng ? "savatga" : "kiruvchi")
          + '")\nelse:\n    print("' + (teng ? "kiruvchi" : "savatga") + '")';
      },
    },
    {
      id: "zanjir", tier: 1,
      make(rnd, t) {
        const a = int(rnd, 86, 95), b = int(rnd, 66, 78), c = int(rnd, 45, 58);
        const value = t > 0 && rnd() < 0.6 ? pick([a, b, c], rnd) - int(rnd, 0, 1) : int(rnd, 30, 99);
        return "aniqlik = " + value + "\nif aniqlik >= " + a + ':\n    print("tayyor")\nelif aniqlik >= ' + b
          + ':\n    print("sinov")\nelif aniqlik >= ' + c + ':\n    print("qayta")\nelse:\n    print("rad")';
      },
    },
    {
      id: "va", tier: 1,
      make(rnd, t) {
        const limit = pick([50, 60, 70], rnd);
        const k = int(rnd, 1, 3);
        const p = yaqin(rnd, t, limit, 5, 20, 95);
        const h = k + int(rnd, -1, 2);
        return "ehtimol = " + d2(p) + "\nhavolalar = " + h + "\nif ehtimol >= " + d2(limit) + " and havolalar > " + k
          + ':\n    print("spam")\nelse:\n    print("oddiy")';
      },
    },
    {
      id: "yoki", tier: 1,
      make(rnd) {
        const harorat = pick(["36.6", "37.2", "37.9", "38", "38.4", "39.1"], rnd);
        const chegara = pick([90, 100, 110], rnd);
        const puls = chegara + pick([-20, -5, 0, 5, 15], rnd);
        return "harorat = " + harorat + "\npuls = " + puls + "\nif harorat >= 38 or puls > " + chegara
          + ':\n    print("shifokorga")\nelse:\n    print("kuzatuv")';
      },
    },
    {
      id: "zona", tier: 1,
      make(rnd, t) {
        const past = pick([20, 30], rnd), yuqori = pick([70, 80], rnd);
        const p = yaqin(rnd, t, pick([past, yuqori], rnd), 5, 5, 95);
        return "ehtimol = " + d2(p) + "\nif ehtimol >= " + d2(yuqori) + ':\n    print("spam")\nelif ehtimol <= ' + d2(past)
          + ':\n    print("oddiy")\nelse:\n    print("odamga")';
      },
    },
    {
      // Qaror daraxti: ichma-ich shart
      id: "daraxt", tier: 2,
      make(rnd) {
        const uzunlik = pick(["1.4", "2.4", "2.5", "4.5", "5.1", "6"], rnd);
        const kenglik = pick(["0.2", "1.3", "1.7", "1.8", "2.1"], rnd);
        return "uzunlik = " + uzunlik + "\nkenglik = " + kenglik + '\nif uzunlik < 2.5:\n    print("setosa")\nelse:\n'
          + '    if kenglik < 1.8:\n        print("versicolor")\n    else:\n        print("virginica")';
      },
    },
    {
      // Tuzoq: zanjir o'sish tartibida yozilgan — birinchi rost shart "yutadi"
      id: "tartib", tier: 2,
      make(rnd) {
        const a = int(rnd, 86, 92), b = int(rnd, 66, 78), c = int(rnd, 45, 58);
        const value = pick([a + int(rnd, 0, 5), b + int(rnd, 0, 6), c + int(rnd, 0, 6), c - int(rnd, 1, 9)], rnd);
        return "aniqlik = " + value + "\nif aniqlik >= " + c + ':\n    print("qayta")\nelif aniqlik >= ' + b
          + ':\n    print("sinov")\nelif aniqlik >= ' + a + ':\n    print("tayyor")\nelse:\n    print("rad")';
      },
    },
    {
      // Ikki alohida if: ikkalasi ham bajarilishi mumkin
      id: "ikki-if", tier: 2,
      make(rnd, t) {
        const past = pick([50, 60], rnd), yuqori = pick([80, 90], rnd);
        const p = yaqin(rnd, t, pick([past, yuqori], rnd), 5, 10, 95);
        return "ehtimol = " + d2(p) + "\nif ehtimol >= " + d2(past) + ':\n    print("spam")\nif ehtimol >= ' + d2(yuqori)
          + ':\n    print("bloklash")\nelse:\n    print("saqlash")';
      },
    },
    {
      id: "emas", tier: 2,
      make(rnd, t) {
        const limit = pick([50, 60, 70], rnd);
        const p = yaqin(rnd, t, limit, 5, 20, 95);
        const tanish = pick(["True", "False"], rnd);
        return "tanish = " + tanish + "\nehtimol = " + d2(p) + "\nif not tanish and ehtimol >= " + d2(limit)
          + ':\n    print("spam")\nelse:\n    print("oddiy")';
      },
    },
  ];

  function natijaTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const shape = zinadan(S1, tier, rnd);
      const code = shape.make(rnd, zina(tier));
      const res = py.run(code);
      if (res.error || res.output.length < 1 || res.output.length > 3) return null;
      return { id: "natija:" + code, type: "natija", shakl: shape.id, code, solution: code };
    }, prev, rr);
  }

  // ---------- 2-bosqich: shartni to'ldir ----------
  const SOZ = {
    ">=": (x) => x + " yoki undan katta boʻlsa",
    ">": (x) => x + " dan katta boʻlsa (" + x + " ning oʻzi kirmaydi)",
    "<": (x) => x + " dan kichik boʻlsa (" + x + " ning oʻzi kirmaydi)",
    "<=": (x) => x + " yoki undan kichik boʻlsa",
  };
  const kes = (n) => Math.max(5, Math.min(95, n));

  const S2 = [
    {
      id: "chegara", tier: 0,
      make(rnd) {
        const c = pick(KONTEKST, rnd);
        const limit = pick(CHEGARALAR, rnd);
        const op = pick(OPLAR, rnd);
        const yuqoriRost = op === ">=" || op === ">";
        return {
          what: "Qoida: " + c.nom + " (" + c.v + ") " + SOZ[op](d2(limit)) + " — «" + (yuqoriRost ? c.hi : c.lo) + "», aks holda «"
            + (yuqoriRost ? c.lo : c.hi) + "». Shartni yoz.",
          template: c.v + " = float(input())\nif ___:\n    print(\"" + (yuqoriRost ? c.hi : c.lo) + "\")\nelse:\n    print(\""
            + (yuqoriRost ? c.lo : c.hi) + "\")",
          answers: [c.v + " " + op + " " + d2(limit)],
          tests: [[d2(limit)], [d2(limit - 5)], [d2(limit + 5)], ["0.05"], ["0.95"]],
          why: "Chegaraning oʻzi qaysi tarmoqqa tushishi kerak?",
        };
      },
    },
    {
      id: "yorliq", tier: 0,
      make(rnd) {
        const teng = rnd() < 0.5;
        return {
          what: teng
            ? "Qoida: model yorligʻi «spam» boʻlsa — «savatga», aks holda «kiruvchi». Shartni yoz."
            : "Qoida: model yorligʻi «spam» dan boshqa boʻlsa — «kiruvchi», aks holda «savatga». Shartni yoz.",
          template: "yorliq = input()\nif ___:\n    print(\"" + (teng ? "savatga" : "kiruvchi") + "\")\nelse:\n    print(\""
            + (teng ? "kiruvchi" : "savatga") + "\")",
          answers: ["yorliq " + (teng ? "==" : "!=") + ' "spam"'],
          tests: [["spam"], ["oddiy"], ["reklama"]],
          why: "Tenglik == bilan, tengsizlik != bilan yoziladi; matn qoʻshtirnoqda turadi.",
        };
      },
    },
    {
      id: "va", tier: 1,
      make(rnd) {
        const limit = pick([50, 60, 70], rnd);
        const k = int(rnd, 1, 4);
        return {
          what: "Qoida: ehtimol " + d2(limit) + " yoki undan katta VA havolalar soni " + k + " tadan koʻp boʻlsa — «spam». Shartni yoz.",
          template: "ehtimol = float(input())\nhavolalar = int(input())\nif ___:\n    print(\"spam\")\nelse:\n    print(\"oddiy\")",
          answers: ["ehtimol >= " + d2(limit) + " and havolalar > " + k],
          tests: [[d2(limit), String(k + 1)], [d2(limit), String(k)], [d2(limit - 5), String(k + 1)],
            ["0.95", String(k + 4)], ["0.1", "0"], ["0.95", "0"], ["0.1", String(k + 5)]],
          why: "Ikki shart ham bir vaqtda bajarilishi kerak. Chegaralarning oʻzini tekshir.",
        };
      },
    },
    {
      id: "yoki", tier: 1,
      make(rnd) {
        const puls = pick([90, 100, 110], rnd);
        return {
          what: "Qoida: harorat 38 yoki undan yuqori YOKI puls " + puls + " dan katta boʻlsa — «shifokorga». Shartni yoz.",
          template: "harorat = float(input())\npuls = int(input())\nif ___:\n    print(\"shifokorga\")\nelse:\n    print(\"kuzatuv\")",
          answers: ["harorat >= 38 or puls > " + puls],
          tests: [["38", "70"], ["37.9", "70"], ["36.6", String(puls + 1)], ["36.6", String(puls)], ["39.2", String(puls + 10)]],
          why: "Bitta belgi yetarli. Har belgining chegarasini alohida tekshir.",
        };
      },
    },
    {
      id: "oraliq", tier: 1,
      make(rnd) {
        const a = pick([40, 50, 60], rnd);
        const b = a + pick([20, 30], rnd);
        return {
          what: "Qoida: ishonch (foizda) " + a + " dan " + b + " gacha boʻlsa (" + a + " kiradi, " + b
            + " kirmaydi) — «odamga»: bunday javobni inson tekshiradi. Shartni yoz.",
          template: "ishonch = int(input())\nif ___:\n    print(\"odamga\")\nelse:\n    print(\"avtomat\")",
          answers: [a + " <= ishonch < " + b],
          tests: [[String(a)], [String(a - 1)], [String(b)], [String(b - 1)], ["0"], ["100"]],
          why: "Oraliqning ikki chetini alohida tekshir: biri kiradi, ikkinchisi kirmaydi.",
        };
      },
    },
    {
      id: "zanjir", tier: 1,
      make(rnd) {
        const a = int(rnd, 86, 95), b = int(rnd, 62, 78);
        return {
          what: "Qoida: aniqlik " + a + " dan boshlab — «tayyor», " + b + " dan boshlab (" + a
            + " gacha) — «sinov», qolgani — «qayta». Ikkala shartni yoz.",
          template: "aniqlik = int(input())\nif ___:\n    print(\"tayyor\")\nelif ___:\n    print(\"sinov\")\nelse:\n    print(\"qayta\")",
          answers: ["aniqlik >= " + a, "aniqlik >= " + b],
          tests: [[String(a)], [String(a - 1)], [String(b)], [String(b - 1)], ["100"], ["0"]],
          why: "elif faqat yuqoridagi shart yolgʻon boʻlganda tekshiriladi. «…dan boshlab» — chegaraning oʻzi ham kiradi.",
        };
      },
    },
    {
      id: "emas", tier: 2,
      make(rnd) {
        const limit = pick([50, 60, 70], rnd);
        return {
          what: "Qoida: yuboruvchi tanish EMAS (tanish = 0) va ehtimol " + d2(limit) + " yoki undan katta boʻlsa — «spam». Shartni yoz.",
          template: "tanish = int(input())\nehtimol = float(input())\nif ___:\n    print(\"spam\")\nelse:\n    print(\"oddiy\")",
          answers: ["tanish == 0 and ehtimol >= " + d2(limit)],
          tests: [["0", d2(limit)], ["1", d2(limit)], ["0", d2(limit - 5)], ["1", "0.95"], ["0", "0.95"], ["1", "0.1"]],
          why: "Tanish yuboruvchining xati ehtimol qancha boʻlsa ham «oddiy» chiqadi.",
        };
      },
    },
    {
      id: "qavs", tier: 2,
      make(rnd) {
        const yosh = pick([60, 65, 70], rnd);
        return {
          what: "Qoida: (harorat 38 yoki undan yuqori YOKI yoʻtal bor, yaʼni yotal = 1) VA yosh " + yosh
            + " yoki undan katta boʻlsa — «shoshilinch». Shartni yoz.",
          template: "harorat = float(input())\nyotal = int(input())\nyosh = int(input())\nif ___:\n    print(\"shoshilinch\")\nelse:\n    print(\"navbat\")",
          answers: ["(harorat >= 38 or yotal == 1) and yosh >= " + yosh],
          tests: [["38.5", "0", String(yosh + 5)], ["36.6", "1", String(yosh)], ["36.6", "0", String(yosh + 10)],
            ["39", "0", String(yosh - 1)], ["36.6", "1", String(yosh - 20)], ["38", "1", String(yosh)], ["37.9", "0", String(yosh)]],
          why: "and amali or dan oldin bajariladi. Tartibni oʻzgartirish uchun qavs kerak.",
        };
      },
    },
    {
      id: "zona", tier: 2,
      make(rnd) {
        const past = pick([20, 30], rnd), yuqori = pick([70, 80], rnd);
        return {
          what: "Qoida: ehtimol " + d2(yuqori) + " yoki undan katta — «spam»; " + d2(past)
            + " yoki undan kichik — «oddiy»; oraligʻida model ishonchsiz — «odamga». Ikkala shartni yoz.",
          template: "ehtimol = float(input())\nif ___:\n    print(\"spam\")\nelif ___:\n    print(\"oddiy\")\nelse:\n    print(\"odamga\")",
          answers: ["ehtimol >= " + d2(yuqori), "ehtimol <= " + d2(past)],
          tests: [[d2(yuqori)], [d2(yuqori - 5)], [d2(past)], [d2(past + 5)], ["0.5"], ["0.95"], ["0.05"]],
          why: "Ikkala chegaraning oʻzi qaysi sinfga tushishini tekshir.",
        };
      },
    },
    {
      // Xato turlari: ortiqcha signal (false positive) va payqalmagan holat (false negative)
      id: "matritsa", tier: 2,
      make() {
        return {
          what: "haqiqiy — asl yorliq, bashorat — model javobi (1 yoki 0). Teng boʻlsa — «mos»; model 1 dedi, aslida 0 — «ortiqcha signal»; "
            + "model 0 dedi, aslida 1 — «payqalmadi». Ikkala shartni yoz.",
          template: "haqiqiy = int(input())\nbashorat = int(input())\nif ___:\n    print(\"mos\")\nelif ___:\n    print(\"ortiqcha signal\")\nelse:\n    print(\"payqalmadi\")",
          answers: ["haqiqiy == bashorat", "bashorat == 1"],
          tests: [["1", "1"], ["0", "0"], ["0", "1"], ["1", "0"]],
          why: "elif ga yetib kelganda ikki qiymat teng emasligi allaqachon maʼlum.",
        };
      },
    },
  ];

  function toldirTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const shape = zinadan(S2, tier, rnd);
      const t = shape.make(rnd);
      return {
        id: "toldir:" + shape.id + ":" + t.answers.join("|") + ":" + t.template.length,
        type: "bosh-joy", shakl: shape.id, what: t.what, template: t.template, answers: t.answers,
        solution: fill(t.template, t.answers), tests: t.tests.map((stdin) => ({ stdin })), why: t.why,
      };
    }, prev, rr);
  }

  // ---------- 3-bosqich: tasniflagichni tuzat (mantiqiy xato) ----------
  // Kod ishga tushadi, lekin qoidani ba'zi kirishlarda buzadi: sinovlar jadvali shuni ko'rsatadi.
  const FIX = [
    {
      id: "chegara-qatiy", tier: 0,
      what: "Qoida: ehtimol 0.5 yoki undan katta boʻlsa — spam, aks holda oddiy.",
      why: "Chegaraning oʻzi (0.5) qaysi sinfga tushyapti?",
      code: 'ehtimol = float(input())\nif ehtimol > 0.5:\n    print("spam")\nelse:\n    print("oddiy")',
      solution: 'ehtimol = float(input())\nif ehtimol >= 0.5:\n    print("spam")\nelse:\n    print("oddiy")',
      tests: [["0.5"], ["0.4"], ["0.9"], ["0.1"]],
    },
    {
      id: "matn-son", tier: 0,
      what: "Qoida: model ishonchi (foizda) 80 dan past boʻlsa — odamga, aks holda avtomat.",
      why: "input() matn qaytaradi — matnni son bilan solishtirib boʻlmaydi",
      code: 'ishonch = input()\nif ishonch < 80:\n    print("odamga")\nelse:\n    print("avtomat")',
      solution: 'ishonch = int(input())\nif ishonch < 80:\n    print("odamga")\nelse:\n    print("avtomat")',
      tests: [["79"], ["80"], ["95"], ["5"]],
    },
    {
      id: "teskari", tier: 0,
      what: "Qoida: xavf bahosi 0.7 yoki undan katta boʻlsa — shifokorga, aks holda kuzatuv.",
      why: "Qaysi tarmoq qaysi javobni chiqaryapti? Sinovlar jadvali bilan solishtir.",
      code: 'xavf = float(input())\nif xavf <= 0.7:\n    print("shifokorga")\nelse:\n    print("kuzatuv")',
      solution: 'xavf = float(input())\nif xavf >= 0.7:\n    print("shifokorga")\nelse:\n    print("kuzatuv")',
      tests: [["0.7"], ["0.9"], ["0.2"], ["0.65"]],
    },
    {
      id: "elif-tartib", tier: 1,
      what: "Qoida: aniqlik 90 dan boshlab — tayyor, 70 dan boshlab — sinov, qolgani — qayta.",
      why: "elif zanjiri yuqoridan pastga tekshiriladi va birinchi rost shartda toʻxtaydi",
      code: 'aniqlik = int(input())\nif aniqlik >= 70:\n    print("sinov")\nelif aniqlik >= 90:\n    print("tayyor")\nelse:\n    print("qayta")',
      solution: 'aniqlik = int(input())\nif aniqlik >= 90:\n    print("tayyor")\nelif aniqlik >= 70:\n    print("sinov")\nelse:\n    print("qayta")',
      tests: [["95"], ["90"], ["75"], ["70"], ["40"]],
    },
    {
      id: "ikki-if", tier: 1,
      what: "Qoida: aniqlik 90 dan boshlab — tayyor, 70 dan boshlab — sinov, qolgani — qayta. Har doim bitta satr chiqadi.",
      why: "ikki alohida if bir-biriga bogʻliq emas — ikkalasi ham bajarilishi mumkin",
      code: 'aniqlik = int(input())\nif aniqlik >= 90:\n    print("tayyor")\nif aniqlik >= 70:\n    print("sinov")\nelse:\n    print("qayta")',
      solution: 'aniqlik = int(input())\nif aniqlik >= 90:\n    print("tayyor")\nelif aniqlik >= 70:\n    print("sinov")\nelse:\n    print("qayta")',
      tests: [["95"], ["90"], ["75"], ["40"]],
    },
    {
      id: "va-yoki", tier: 1,
      what: "Qoida: ehtimol 0.6 yoki undan katta VA havolalar soni 2 tadan koʻp boʻlsa — spam. Ikkala belgi ham kerak.",
      why: "or — bittasi yetarli, and — ikkalasi ham kerak",
      code: 'ehtimol = float(input())\nhavolalar = int(input())\nif ehtimol >= 0.6 or havolalar > 2:\n    print("spam")\nelse:\n    print("oddiy")',
      solution: 'ehtimol = float(input())\nhavolalar = int(input())\nif ehtimol >= 0.6 and havolalar > 2:\n    print("spam")\nelse:\n    print("oddiy")',
      tests: [["0.9", "5"], ["0.9", "0"], ["0.1", "5"], ["0.6", "3"], ["0.1", "0"]],
    },
    {
      id: "qavs", tier: 2,
      what: "Qoida: (harorat 38 yoki undan yuqori YOKI yoʻtal bor) VA yosh 60 yoki undan katta boʻlsa — shoshilinch.",
      why: "and amali or dan oldin bajariladi — tartibni qavs belgilaydi",
      code: 'harorat = float(input())\nyotal = int(input())\nyosh = int(input())\nif harorat >= 38 or yotal == 1 and yosh >= 60:\n    print("shoshilinch")\nelse:\n    print("navbat")',
      solution: 'harorat = float(input())\nyotal = int(input())\nyosh = int(input())\nif (harorat >= 38 or yotal == 1) and yosh >= 60:\n    print("shoshilinch")\nelse:\n    print("navbat")',
      tests: [["39", "0", "30"], ["38.5", "0", "70"], ["36.6", "1", "65"], ["36.6", "1", "20"], ["36.6", "0", "80"]],
    },
    {
      id: "zona-chegara", tier: 2,
      what: "Qoida: ehtimol 0.8 yoki undan katta — spam; 0.2 yoki undan kichik — oddiy; oraligʻida — odamga.",
      why: "ikkala chegaraning oʻzi (0.8 va 0.2) qaysi sinfga tushyapti?",
      code: 'ehtimol = float(input())\nif ehtimol > 0.8:\n    print("spam")\nelif ehtimol < 0.2:\n    print("oddiy")\nelse:\n    print("odamga")',
      solution: 'ehtimol = float(input())\nif ehtimol >= 0.8:\n    print("spam")\nelif ehtimol <= 0.2:\n    print("oddiy")\nelse:\n    print("odamga")',
      tests: [["0.8"], ["0.2"], ["0.5"], ["0.95"], ["0.05"]],
    },
    {
      id: "daraxt-otstup", tier: 2,
      what: "Qoida daraxti: uzunlik 2.5 dan kichik — setosa; aks holda kenglik 1.8 dan kichik — versicolor, qolgani — virginica.",
      why: "otstup blokni belgilaydi: ikkinchi savol (kenglik) qaysi tarmoq ichida turishi kerak?",
      code: 'uzunlik = float(input())\nkenglik = float(input())\nif uzunlik < 2.5:\n    print("setosa")\n    if kenglik < 1.8:\n        print("versicolor")\nelse:\n    print("virginica")',
      solution: 'uzunlik = float(input())\nkenglik = float(input())\nif uzunlik < 2.5:\n    print("setosa")\nelse:\n    if kenglik < 1.8:\n        print("versicolor")\n    else:\n        print("virginica")',
      tests: [["1.4", "0.2"], ["4.7", "1.4"], ["5.5", "2.1"], ["2.5", "1.8"], ["2.4", "2"]],
    },
  ];

  // ---------- 3-bosqich: qoidali tasniflagichni o'zing yoz ----------
  // wrong — tipik xato yechimlar: test ularning o'tmasligini tekshiradi.
  const WRITE = [
    {
      id: "spam-chegara", tier: 0,
      what: "Model xatning spam boʻlish ehtimolini beradi: 0 dan 1 gacha bitta son kiritiladi. 0.5 yoki undan katta boʻlsa spam, aks holda oddiy deb chiqar.",
      solution: 'ehtimol = float(input())\nif ehtimol >= 0.5:\n    print("spam")\nelse:\n    print("oddiy")',
      tests: [["0.5"], ["0.49"], ["0.9"], ["0.1"], ["0.51"]],
      wrong: ['p = float(input())\nif p > 0.5:\n    print("spam")\nelse:\n    print("oddiy")'],
    },
    {
      id: "ishonch", tier: 0,
      what: "Model javobiga ishonchi kiritiladi (foizda, butun son). 80 dan past boʻlsa odamga (javobni inson tekshiradi), aks holda avtomat deb chiqar.",
      solution: 'ishonch = int(input())\nif ishonch < 80:\n    print("odamga")\nelse:\n    print("avtomat")',
      tests: [["80"], ["79"], ["100"], ["0"], ["81"]],
      wrong: ['i = int(input())\nif i <= 80:\n    print("odamga")\nelse:\n    print("avtomat")'],
    },
    {
      id: "yorliq-mos", tier: 0,
      what: "Ikki satr kiritiladi: haqiqiy yorliq va model bashorati. Ular bir xil boʻlsa mos, aks holda xato deb chiqar.",
      solution: 'haqiqiy = input()\nbashorat = input()\nif haqiqiy == bashorat:\n    print("mos")\nelse:\n    print("xato")',
      tests: [["spam", "spam"], ["spam", "oddiy"], ["oddiy", "oddiy"], ["oddiy", "spam"]],
      wrong: ['h = input()\nb = input()\nif h == "spam":\n    print("mos")\nelse:\n    print("xato")'],
    },
    {
      id: "aniqlik-toifa", tier: 1,
      what: "Modelning aniqligi kiritiladi (foizda, butun son). 90 dan boshlab tayyor, 70 dan boshlab sinov, qolgan holda qayta deb chiqar.",
      solution: 'aniqlik = int(input())\nif aniqlik >= 90:\n    print("tayyor")\nelif aniqlik >= 70:\n    print("sinov")\nelse:\n    print("qayta")',
      tests: [["90"], ["89"], ["70"], ["69"], ["100"], ["0"]],
      wrong: [
        'a = int(input())\nif a >= 70:\n    print("sinov")\nelif a >= 90:\n    print("tayyor")\nelse:\n    print("qayta")',
        'a = int(input())\nif a > 90:\n    print("tayyor")\nelif a > 70:\n    print("sinov")\nelse:\n    print("qayta")',
      ],
    },
    {
      id: "uch-zona", tier: 1,
      what: "Spam ehtimoli kiritiladi. 0.8 yoki undan katta boʻlsa spam, 0.2 yoki undan kichik boʻlsa oddiy, oraligʻida odamga deb chiqar (model ishonchsiz — inson qaror qiladi).",
      solution: 'p = float(input())\nif p >= 0.8:\n    print("spam")\nelif p <= 0.2:\n    print("oddiy")\nelse:\n    print("odamga")',
      tests: [["0.8"], ["0.79"], ["0.2"], ["0.21"], ["0.5"], ["1"], ["0"]],
      wrong: ['p = float(input())\nif p > 0.8:\n    print("spam")\nelif p < 0.2:\n    print("oddiy")\nelse:\n    print("odamga")'],
    },
    {
      id: "ikki-belgi", tier: 1,
      what: "Ikki son kiritiladi: spam ehtimoli va xatdagi havolalar soni. Ehtimol 0.6 yoki undan katta VA havolalar 3 tadan koʻp boʻlsa spam, aks holda oddiy deb chiqar.",
      solution: 'p = float(input())\nh = int(input())\nif p >= 0.6 and h > 3:\n    print("spam")\nelse:\n    print("oddiy")',
      tests: [["0.6", "4"], ["0.6", "3"], ["0.59", "4"], ["0.9", "0"], ["0.1", "9"], ["0.95", "10"]],
      wrong: [
        'p = float(input())\nh = int(input())\nif p >= 0.6 or h > 3:\n    print("spam")\nelse:\n    print("oddiy")',
        'p = float(input())\nh = int(input())\nif p >= 0.6 and h >= 3:\n    print("spam")\nelse:\n    print("oddiy")',
      ],
    },
    {
      id: "kopchilik", tier: 1,
      what: "Uchta modelning javobi kiritiladi (har biri 1 yoki 0, alohida satrda). Koʻpchilik ovozi bilan qaror chiqar: kamida ikkitasi 1 boʻlsa 1, aks holda 0.",
      solution: "a = int(input())\nb = int(input())\nc = int(input())\nif a + b + c >= 2:\n    print(1)\nelse:\n    print(0)",
      tests: [["1", "1", "1"], ["1", "1", "0"], ["1", "0", "1"], ["0", "1", "1"], ["1", "0", "0"], ["0", "0", "1"], ["0", "0", "0"]],
      wrong: [
        "a = int(input())\nb = int(input())\nc = int(input())\nif a == 1 and b == 1 and c == 1:\n    print(1)\nelse:\n    print(0)",
        "a = int(input())\nb = int(input())\nc = int(input())\nif a == 1 or b == 1 or c == 1:\n    print(1)\nelse:\n    print(0)",
      ],
    },
    {
      id: "matritsa", tier: 2,
      what: "Ikki son kiritiladi: haqiqiy yorliq va model bashorati (1 yoki 0). Natija turini chiqar: ikkalasi 1 — TP, ikkalasi 0 — TN, "
        + "model 1 dedi, aslida 0 — FP, model 0 dedi, aslida 1 — FN.",
      solution: 'h = int(input())\nb = int(input())\nif h == 1 and b == 1:\n    print("TP")\nelif h == 0 and b == 0:\n    print("TN")\nelif b == 1:\n    print("FP")\nelse:\n    print("FN")',
      tests: [["1", "1"], ["0", "0"], ["0", "1"], ["1", "0"]],
      wrong: ['h = int(input())\nb = int(input())\nif h == 1 and b == 1:\n    print("TP")\nelif h == 0 and b == 0:\n    print("TN")\nelif h == 1:\n    print("FP")\nelse:\n    print("FN")'],
    },
    {
      id: "gul", tier: 2,
      what: "Gul bargining uzunligi va kengligi kiritiladi (sm, ikki satr). Qoida daraxti: uzunlik 2.5 dan kichik — setosa; aks holda kenglik 1.8 dan kichik — versicolor; qolgani — virginica.",
      solution: 'uzunlik = float(input())\nkenglik = float(input())\nif uzunlik < 2.5:\n    print("setosa")\nelif kenglik < 1.8:\n    print("versicolor")\nelse:\n    print("virginica")',
      tests: [["1.4", "0.2"], ["4.7", "1.4"], ["5.5", "2.1"], ["2.5", "1.8"], ["2.4", "2"], ["2.5", "1.7"]],
      wrong: ['u = float(input())\nk = float(input())\nif k < 1.8:\n    print("versicolor")\nelif u < 2.5:\n    print("setosa")\nelse:\n    print("virginica")'],
    },
    {
      id: "triaj", tier: 2,
      what: "Uch son kiritiladi: harorat, yoʻtal (1 — bor, 0 — yoʻq) va yosh. Belgi bor deymiz, agar harorat 38 yoki undan yuqori YOKI yoʻtal bor boʻlsa. "
        + "Belgi bor va yosh 60 yoki undan katta — shoshilinch; belgi bor, yosh kichikroq — shifokorga; belgi yoʻq — kuzatuv.",
      solution: 'harorat = float(input())\nyotal = int(input())\nyosh = int(input())\nif (harorat >= 38 or yotal == 1) and yosh >= 60:\n    print("shoshilinch")\nelif harorat >= 38 or yotal == 1:\n    print("shifokorga")\nelse:\n    print("kuzatuv")',
      tests: [["38.5", "0", "70"], ["36.6", "1", "60"], ["39", "0", "30"], ["36.6", "1", "59"], ["36.6", "0", "80"], ["37.9", "0", "20"], ["38", "1", "60"]],
      wrong: ['t = float(input())\ny = int(input())\nyosh = int(input())\nif t >= 38 or y == 1 and yosh >= 60:\n    print("shoshilinch")\nelif t >= 38 or y == 1:\n    print("shifokorga")\nelse:\n    print("kuzatuv")'],
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

  const api = { BLANK, KONTEKST, S1, S2, FIX, WRITE, fill, natijaTask, toldirTask, tuzatTask, yozTask, stage3Task };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
