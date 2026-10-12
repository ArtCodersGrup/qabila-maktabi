// «Python: sintaksis» (IX sinf, 7-dars): savollarni yasash — sof mantiq, ekransiz.
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
  // Zina berilmasa (testlar) — hammasidan teng.
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

  // ---------- Ma'lumot: hammasi model va o'lchovlar haqida ----------
  const SINFLAR = ["mushuk", "it", "qush", "spam", "olma", "mashina"];
  const MODELLAR = ["spam filtri", "tarjimon", "tavsiya tizimi", "rasm tasniflagichi"];
  const OLCHOVLAR = ["Aniqlik", "Ishonch", "Ehtimol", "Xato"];
  const JAMI = [10, 20, 25, 50, 100, 200];
  // 0.51 … 0.99, oxiri 0 emas (0.50 → 0.5 chalkashligi bo'lmasin)
  const kasr = (rnd) => {
    let n = int(rnd, 51, 99);
    if (n % 10 === 0) n += 1;
    return "0." + n;
  };
  const ikkiSinf = (rnd) => {
    const a = pick(SINFLAR, rnd);
    let b = pick(SINFLAR, rnd);
    while (b === a) b = pick(SINFLAR, rnd);
    return [a, b];
  };
  const test = (rnd) => {
    const jami = pick(JAMI, rnd);
    const togri = int(rnd, Math.ceil(jami * 0.6), jami - 1);
    return { jami, togri };
  };

  // ---------- 1-bosqich: natijani ayt ----------
  const shakl = (id, tier, make) => ({ id, tier, make });
  const PRINT_SHAKLLAR = [
    shakl("olchov", 0, (rnd) => 'print("' + pick(OLCHOVLAR, rnd) + ':", ' + kasr(rnd) + ")"),
    shakl("ikki-satr", 0, (rnd) => 'print("Model:", "' + pick(MODELLAR, rnd) + '")\nprint("Sinf:", "' + pick(SINFLAR, rnd) + '")'),
    shakl("matn-son", 0, (rnd) => {
      const a = int(rnd, 12, 60), b = int(rnd, 2, 9);
      return 'print("' + a + " + " + b + '")\nprint(' + a + " + " + b + ")";
    }),
    shakl("izoh", 0, (rnd) => {
      const [a, b] = ikkiSinf(rnd);
      return '# print("Eski yorliq:", "' + a + '")\nprint("Yangi yorliq:", "' + b + '")  # ' + int(rnd, 2, 9) + "-versiya";
    }),
    shakl("ulash", 1, (rnd) => {
      const a = int(rnd, 2, 9), b = int(rnd, 2, 9);
      return 'print("' + a + '" + "' + b + '")\nprint(' + a + " + " + b + ")";
    }),
    shakl("kop-qiymat", 1, (rnd) => {
      const t = test(rnd);
      return 'print("Xato:", ' + (t.jami - t.togri) + ', "ta, jami:", ' + t.jami + ")";
    }),
    shakl("bolish", 1, (rnd) => {
      const t = test(rnd);
      return 'print("Xato:", ' + t.jami + " - " + t.togri + ')\nprint("Aniqlik:", ' + t.togri + " / " + t.jami + ")";
    }),
    shakl("takror", 1, (rnd) => {
      const n = int(rnd, 3, 6);
      return 'print("-" * ' + n + ')\nprint("' + pick(SINFLAR, rnd) + '", ' + n + ")";
    }),
    shakl("izoh-matnda", 1, (rnd) => {
      const [a, b] = ikkiSinf(rnd);
      return 'print("# ' + a + '")  # ' + b + '\n# print("' + b + '")\nprint(' + int(rnd, 10, 99) + ")";
    }),
    shakl("otstup", 2, (rnd) => {
      const x = pick(["0.04", "0.08", "0.12", "0.25"], rnd);
      const pad = rnd() < 0.5 ? "    " : "";
      return "xato = " + x + '\nif xato < 0.1:\n    print("Model yaxshi")\n' + pad + 'print("Xato:", xato)\nprint("Tamom")';
    }),
    shakl("uch-amal", 2, (rnd) => {
      const b = pick([2, 4, 5], rnd);
      const a = b * int(rnd, 2, 9) + (rnd() < 0.5 && b !== 5 ? b / 2 : 0);
      return "print(" + a + " / " + b + ")\nprint(" + a + " // " + b + ')\nprint("' + a + '" * 2)';
    }),
    shakl("foiz", 2, (rnd) => {
      const t = test(rnd);
      return "togri = " + t.togri + "\njami = " + t.jami + '\nprint("Aniqlik:", togri / jami * 100, "%")';
    }),
    shakl("izoh-blokda", 2, (rnd) => {
      const p = rnd() < 0.5 ? kasr(rnd) : "0." + int(rnd, 11, 49);
      return "ehtimol = " + p + '\nif ehtimol >= 0.5:\n    # print("oddiy")\n    print("spam")\nprint("Ehtimol:", ehtimol)';
    }),
    shakl("aralash", 2, (rnd) => {
      const a = int(rnd, 2, 9);
      return 'print("Sinf:", "' + pick(SINFLAR, rnd) + '", "| ishonch:", ' + kasr(rnd) + ")\nprint(" + a + ' * 2, "' + a + '" * 2)';
    }),
  ];

  function printTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const s = zinadan(PRINT_SHAKLLAR, tier, rnd);
      const code = s.make(rnd);
      if (!toza(code)) return null;
      return { id: "natija:" + code, type: "natija", code, solution: code, kind: s.id };
    }, prev, rr);
  }

  // ---------- 2-bosqich: xatoni tuzat ----------
  // Uch to'g'ri dastur (zina 0 / 1 / 2) va ularni buzish usullari.
  const DASTURLAR = [
    (rnd) => 'print("Model:", "' + pick(MODELLAR, rnd) + '")\nprint("Aniqlik:", ' + kasr(rnd) + ")",
    (rnd) => {
      const t = test(rnd);
      return "# Test natijasi\ntogri = " + t.togri + "\njami = " + t.jami + '\nprint("Jami:", jami)\nprint("Aniqlik:", togri / jami)';
    },
    (rnd) => "xato = " + pick(["0.04", "0.08", "0.12", "0.25"], rnd) + '\nif xato < 0.1:\n    print("Model yaxshi")\n    print("Xato:", xato)\nprint("Tamom")',
  ];

  // make(good) — buzilgan kod; mos kelmasa good ning o'zini qaytaradi (bunday juftlik tashlab yuboriladi).
  // why — maslahat: qoidani eslatadi, tayyor javobni emas.
  const BUZISHLAR = [
    { kind: "qoshtirnoq", why: "matn qaysi qoʻshtirnoq bilan ochilsa, shunisi bilan yopiladi",
      make: (g) => g.replace(':",', ":,") },
    { kind: "qavs", why: "har ochilgan qavs yopilishi kerak; xabar baʼzan keyingi satrni koʻrsatadi",
      make: (g) => g.replace(")\n", "\n") },
    { kind: "katta-harf", why: "Python katta va kichik harfni farqlaydi — buyruq nomlarini tekshir",
      make: (g) => g.replace("print(", "Print(") },
    { kind: "vergul", why: "print ichidagi qiymatlar vergul bilan ajratiladi",
      make: (g) => g.replace(':", ', ':" ') },
    { kind: "otstup", why: "otstup blokni bildiradi: if ichidagi satrlar 4 boʻshliq suriladi, boshqalari surilmaydi",
      make: (g) => (g.includes("if ") ? g.replace(":\n    ", ":\n") : g.replace(/\n(print\([^\n]*)$/, "\n    $1")) },
    { kind: "otstup-mos-emas", why: "bir blokdagi hamma satr bir xil — 4 boʻshliq — suriladi",
      make: (g) => g.replace('\n    print("Xato:"', '\n  print("Xato:"') },
    { kind: "izoh", why: "izoh # belgisi bilan boshlanadi; busiz Python uni buyruq deb oʻqiydi",
      make: (g) => g.replace(/^# /, "") },
    { kind: "ikki-nuqta", why: "if satri ikki nuqta bilan tugaydi",
      make: (g) => (g.includes("if ") ? g.replace(":\n", "\n") : g) },
    { kind: "onlik-vergul", why: "oʻnlik kasr nuqta bilan yoziladi; vergul qiymatlarni ajratadi — chiqishni kutilgani bilan solishtir",
      make: (g) => g.replace(/0\.(\d+)\)/, "0,$1)") },
    { kind: "satr-son", why: "qoʻshtirnoq ichidagi ifoda hisoblanmaydi — u matn boʻlib chiqadi",
      make: (g) => g.replace("togri / jami)", '"togri / jami")') },
    { kind: "nom", why: "oʻzgaruvchi nomi hamma joyda aynan bir xil yoziladi (harf kattaligi ham)",
      make: (g) => g.replace("togri / jami", "togri / Jami") },
  ];

  function fixTask(r, prev, tier) {
    const rr = r || Math.random;
    const nechta = tier == null ? DASTURLAR.length : zina(tier) + 1;
    return pickNew((rnd) => {
      const shablon = int(rnd, 0, nechta - 1);
      const good = DASTURLAR[shablon](rnd);
      const buz = pick(BUZISHLAR, rnd);
      const code = buz.make(good);
      if (code === good) return null;
      const kutilgan = toza(good, 5);
      if (!kutilgan) return null;
      // Buzilgan kod haqiqatan boshqacha ishlashi shart (masalan, shart yolg'on bo'lsa ham)
      const r2 = K.run(code);
      if (!r2.error && K.sameOutput(r2.output, kutilgan.output)) return null;
      return {
        id: "xato:" + buz.kind + ":" + good, type: "xato-top", kind: buz.kind, shablon, why: buz.why,
        code, solution: good, lines: K.normalize(kutilgan.output),
      };
    }, prev, rr);
  }

  // ---------- 3-bosqich: o'zing yoz ----------
  // sets — sinov qiymatlari: tekshiruv bolaning kodidagi "nom = …" satrini navbat bilan har to'plamga almashtirib
  // ishga tushiradi (input() hali o'tilmagan). Birinchi to'plam — muharrirda turgan boshlang'ich qiymatlar.
  // sets yo'q bo'lsa — chiqish aynan `lines` bo'lishi kerak. must — kodning o'zida bo'lishi shart narsa (izoh, * amali).
  const WRITE_KINDS = [
    {
      id: "hisobot", tier: 0,
      what: "Model hisobotini chiqar: ikki satr, aynan quyidagidek. Matnlar qoʻshtirnoqda, son qoʻshtirnoqsiz.",
      solution: 'print("Model: spam filtri")\nprint("Aniqlik:", 0.92)',
    },
    {
      id: "izoh", tier: 0,
      what: "Birinchi satrga izoh yoz (# bilan): natija qaysi maʼlumotdan olingan. Keyin ikki satrni chiqar.",
      must: [{ re: "^[ \\t]*#[ \\t]*\\S", hint: "Izoh yoʻq: bitta satrni # bilan boshla va maʼlumot manbaini yoz." }],
      solution: '# Test: 100 ta rasm\nprint("Sinf:", "mushuk")\nprint("Ishonch:", 0.87)',
    },
    {
      id: "chiziq", tier: 0,
      what: "Hisobot sarlavhasini chiqar. Chiziqni qoʻlda terma: \"=\" * 10 matnni 10 marta takrorlaydi.",
      must: [{ re: "\\*", hint: "Chiziqni * amali bilan yasa: \"=\" * 10." }],
      solution: 'print("=" * 10)\nprint("HISOBOT")\nprint("=" * 10)',
    },
    {
      id: "xato-soni", tier: 1,
      what: "Model jami ta savoldan togri tasini topdi. Xato javoblar sonini chiqar. Sonni oʻzing yozma — oʻzgaruvchilardan hisobla.",
      sets: [{ jami: "50", togri: "46" }, { jami: "200", togri: "171" }, { jami: "80", togri: "80" }],
      solution: 'jami = 50\ntogri = 46\nprint("Xato javoblar:", jami - togri)',
    },
    {
      id: "aniqlik", tier: 1,
      what: "Aniqlik = toʻgʻri javoblar / jami. Uni oʻzgaruvchilardan hisoblab, quyidagi koʻrinishda chiqar.",
      sets: [{ togri: "46", jami: "50" }, { togri: "171", jami: "200" }, { togri: "9", jami: "10" }],
      solution: 'togri = 46\njami = 50\nprint("Aniqlik:", togri / jami)',
    },
    {
      id: "ikki-qiymat", tier: 1,
      what: "Model javobini ikki satrda chiqar: sinf va ishonch. Qiymatlar oʻzgaruvchilardan olinsin (nom qoʻshtirnoqsiz yoziladi).",
      sets: [{ sinf: '"mushuk"', ishonch: "0.87" }, { sinf: '"it"', ishonch: "0.61" }, { sinf: '"qush"', ishonch: "0.99" }],
      solution: 'sinf = "mushuk"\nishonch = 0.87\nprint("Sinf:", sinf)\nprint("Ishonch:", ishonch)',
    },
    {
      id: "foiz", tier: 2,
      what: "Ikki satr chiqar: natija (togri / jami koʻrinishida) va aniqlik foizda: togri / jami * 100.",
      sets: [{ togri: "46", jami: "50" }, { togri: "9", jami: "10" }, { togri: "150", jami: "200" }],
      solution: 'togri = 46\njami = 50\nprint("Natija:", togri, "/", jami)\nprint("Aniqlik (%):", togri / jami * 100)',
    },
    {
      id: "qaror", tier: 2,
      what: "Agar xato 0.1 dan kichik boʻlsa, ikki satr chiqsin: Model yaxshi va Xato: (qiymati). Oxirida har doim Tamom chiqsin. Shart satri: if xato < 0.1:",
      sets: [{ xato: "0.08" }, { xato: "0.25" }, { xato: "0.1" }, { xato: "0.02" }],
      solution: 'xato = 0.08\nif xato < 0.1:\n    print("Model yaxshi")\n    print("Xato:", xato)\nprint("Tamom")',
    },
    {
      id: "ikki-model", tier: 2,
      what: "Ikki model bitta testda sinaldi. Har birining aniqligini (toʻgʻri / jami) va toʻgʻri javoblar farqini (A − B) chiqar.",
      sets: [
        { a_togri: "45", b_togri: "41", jami: "50" },
        { a_togri: "17", b_togri: "19", jami: "20" },
        { a_togri: "30", b_togri: "30", jami: "40" },
      ],
      solution: 'a_togri = 45\nb_togri = 41\njami = 50\nprint("A:", a_togri / jami)\nprint("B:", b_togri / jami)\nprint("Farq:", a_togri - b_togri)',
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
  const boshlangich = (kind) => (kind.sets ? Object.keys(kind.sets[0]).map((n) => n + " = " + kind.sets[0][n]).join("\n") + "\n" : "");

  function vazifa(kind) {
    return {
      id: "yoz:" + kind.id, type: "kod-yoz", kind: kind.id, what: kind.what, solution: kind.solution,
      sets: kind.sets || null, must: kind.must || null, starter: boshlangich(kind),
      lines: K.normalize(K.run(kind.solution).output),
    };
  }

  // Yozilgan kodni tekshirish: avval kodning o'zidagi talablar, keyin har sinov to'plami bilan ishga tushirish
  function checkWrite(task, code) {
    const text = String(code == null ? "" : code);
    if (!text.trim()) return { ok: false, kind: "bosh", hint: "Avval kodni yoz, keyin ishga tushir." };
    for (const m of task.must || []) {
      if (!new RegExp(m.re, "m").test(text)) return { ok: false, kind: "shart", hint: m.hint };
    }
    if (!task.sets) return K.check({ type: "kod-yoz", expected: task.lines, solution: task.solution }, text);
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

  // seen — shu mashqda allaqachon yechilgan masalalar (id lar to'plami): imkon bo'lsa, qayta berilmaydi
  function writeTask(r, prev, tier, seen) {
    const rr = r || Math.random;
    const yangi = WRITE_KINDS.filter((k) => !(seen && seen.has("yoz:" + k.id)));
    const bank = yangi.length > 1 ? yangi : WRITE_KINDS;
    return pickNew((rnd) => vazifa(zinadan(bank, tier, rnd)), prev, rr);
  }

  // ---------- Sahnalarda ko'rsatiladigan namunalar (test har birini ishga tushiradi) ----------
  const NAMUNALAR = {
    birinchi: '# Model natijasi\nprint("Model:", "spam filtri")\nprint("Aniqlik:", 0.92)',
    matnSon: 'print("46 + 4")\nprint(46 + 4)\nprint("46" + "4")',
    otstup: 'xato = 0.25\nif xato < 0.1:\n    print("Model yaxshi")\n    print("Saqlaymiz")\nprint("Tamom")',
    xatoXabar: 'print("Model: spam filtri")\nprint("Aniqlik:, 0.92)',
    jimXato: 'print("Aniqlik:", 0,92)',
    hisobot: '# Test toplami: 50 ta xat\ntogri = 46\njami = 50\nprint("Xato:", jami - togri)\nprint("Aniqlik:", togri / jami)',
  };

  const api = {
    SINFLAR, MODELLAR, PRINT_SHAKLLAR, DASTURLAR, BUZISHLAR, WRITE_KINDS, NAMUNALAR, UZUN_KASR,
    printTask, fixTask, writeTask, vazifa, checkWrite, qoy,
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
