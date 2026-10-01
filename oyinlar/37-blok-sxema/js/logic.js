// 37-o'yin: savollarni yasash (sof mantiq, ekransiz).
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const S = (root.QK && root.QK.sxema) || require("./sxema.js");
  const py = (root.QK && root.QK.python) || require("../../umumiy/js/python/python.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];

  function pickNew(make, prev, r) {
    for (let k = 0; k < 40; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  // ---------- 1-bosqich: belgilar ----------
  // Shakl ko'rsatiladi, bola nima uchun ishlatilishini tanlaydi
  const BELGILAR = [
    { tur: "boshla", savol: "Oval shakl nima uchun?", javob: "Algoritmning boshi va oxiri" },
    { tur: "kirit", savol: "Qiyshiq toʻrtburchak (parallelogramm) nima uchun?", javob: "Maʼlumot kiritish yoki chiqarish" },
    { tur: "amal", savol: "Oddiy toʻrtburchak nima uchun?", javob: "Amal bajarish (hisoblash, qiymat berish)" },
    { tur: "shart", savol: "Romb nima uchun?", javob: "Shartni tekshirish: ha yoki yoʻq" },
    { tur: "sikl", savol: "Yon tomoni qoʻshaloq toʻrtburchak nima uchun?", javob: "Takrorlash (sikl)" },
  ];
  const JAVOBLAR = BELGILAR.map((b) => b.javob);

  function belgiTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const b = pick(BELGILAR, rnd);
      return { id: "belgi:" + b.tur, tur: "belgi", shakl: b.tur, savol: b.savol, javob: b.javob, variantlar: JAVOBLAR };
    }, prev, rr);
  }

  // ---------- 2-bosqich: sxemani yig'ish ----------
  const blok = (tur, nom, kod, qoshimcha) => Object.assign({ tur, nom, kod }, qoshimcha || {});

  const QURISH = [
    {
      id: "kvadrat",
      what: "Kiritilgan sonning kvadratini chiqaradigan sxemani yigʻ.",
      palitra: [
        blok("kirit", "n ni kiritish", "n = int(input())"),
        blok("amal", "s ← n × n", "s = n * n"),
        blok("chiqar", "s ni chiqarish", "print(s)"),
        blok("amal", "s ← n + n", "s = n + n"),
      ],
      tests: [{ stdin: ["5"], out: ["25"] }, { stdin: ["12"], out: ["144"] }, { stdin: ["0"], out: ["0"] }],
    },
    {
      id: "juft-toq",
      what: "Kiritilgan son juft boʻlsa “juft”, aks holda “toq” deb yozadigan sxemani yigʻ.",
      palitra: [
        blok("kirit", "n ni kiritish", "n = int(input())"),
        blok("shart", "n juftmi?", "n % 2 == 0", { ha: [], yoq: [] }),
        blok("chiqar", "“juft” deb yozish", 'print("juft")'),
        blok("chiqar", "“toq” deb yozish", 'print("toq")'),
      ],
      tests: [{ stdin: ["4"], out: ["juft"] }, { stdin: ["7"], out: ["toq"] }, { stdin: ["0"], out: ["juft"] }],
    },
    {
      id: "yigindi",
      what: "1 dan 5 gacha sonlar yigʻindisini chiqaradigan sxemani yigʻ.",
      palitra: [
        blok("amal", "s ← 0", "s = 0"),
        blok("sikl", "i = 1 dan 5 gacha", "for i in range(1, 6)", { tana: [] }),
        blok("amal", "s ← s + i", "s = s + i"),
        blok("chiqar", "s ni chiqarish", "print(s)"),
      ],
      tests: [{ stdin: [], out: ["15"] }],
    },
    {
      id: "kattasi",
      what: "Ikkita son kiritiladi. Kattasini chiqaradigan sxemani yigʻ.",
      palitra: [
        blok("kirit", "a ni kiritish", "a = int(input())"),
        blok("kirit", "b ni kiritish", "b = int(input())"),
        blok("shart", "a > b mi?", "a > b", { ha: [], yoq: [] }),
        blok("chiqar", "a ni chiqarish", "print(a)"),
        blok("chiqar", "b ni chiqarish", "print(b)"),
      ],
      tests: [{ stdin: ["3", "9"], out: ["9"] }, { stdin: ["10", "2"], out: ["10"] }, { stdin: ["5", "5"], out: ["5"] }],
    },
    {
      id: "salom",
      what: "“Salom” soʻzini uch marta yozadigan sxemani yigʻ.",
      palitra: [
        blok("sikl", "3 marta takrorlash", "for i in range(3)", { tana: [] }),
        blok("chiqar", "“Salom” deb yozish", 'print("Salom")'),
        blok("amal", "i ← i + 1", "i = i + 1"),
      ],
      tests: [{ stdin: [], out: ["Salom", "Salom", "Salom"] }],
    },
  ];

  function qurishTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const q = pick(QURISH, rnd);
      return {
        id: "qur:" + q.id, tur: "qur", what: q.what, tests: q.tests,
        // Palitra nusxasi: bola blok qo'shganda asl ro'yxat o'zgarmasin
        palitra: q.palitra.map((b) => JSON.parse(JSON.stringify(b))),
      };
    }, prev, rr);
  }

  // Yig'ilgan sxemani tekshirish: kod yasaladi va test holatlarida ishga tushiriladi
  function tekshir(bloklar, tests) {
    const holat = S.tekshir(bloklar);
    if (!holat.ok) return { ok: false, sabab: holat.sabab };
    const kod = S.kodYasa(bloklar);
    for (const t of tests) {
      const r = py.run(kod, { stdin: t.stdin || [], maxSteps: 200000 });
      if (r.error) return { ok: false, sabab: r.error.text, xato: r.error, kod };
      const chiqqan = r.output.join("\n").trim();
      const kutilgan = (t.out || []).join("\n").trim();
      if (chiqqan !== kutilgan) {
        return { ok: false, sabab: "Kirish: " + ((t.stdin || []).join(", ") || "yoʻq") + " → kutilgan: " + kutilgan + ", sendan: " + (chiqqan || "hech narsa"), kod };
      }
    }
    return { ok: true, kod };
  }

  // ---------- 3-bosqich: sxemani o'qish ----------
  const OQISH = [
    {
      id: "oqi-kvadrat",
      sxema: [
        blok("kirit", "n ni kiritish", "n = int(input())"),
        blok("amal", "n ← n × 3", "n = n * 3"),
        blok("chiqar", "n ni chiqarish", "print(n)"),
      ],
      stdin: ["4"],
    },
    {
      id: "oqi-shart",
      sxema: [
        blok("kirit", "n ni kiritish", "n = int(input())"),
        blok("shart", "n > 10 mi?", "n > 10", { ha: [blok("chiqar", "“katta”", 'print("katta")')], yoq: [blok("chiqar", "“kichik”", 'print("kichik")')] }),
      ],
      stdin: ["7"],
    },
    {
      id: "oqi-sikl",
      sxema: [
        blok("amal", "s ← 1", "s = 1"),
        blok("sikl", "3 marta takrorlash", "for i in range(3)", { tana: [blok("amal", "s ← s × 2", "s = s * 2")] }),
        blok("chiqar", "s ni chiqarish", "print(s)"),
      ],
      stdin: [],
    },
    {
      id: "oqi-sanoq",
      sxema: [
        blok("sikl", "i = 1 dan 4 gacha", "for i in range(1, 5)", { tana: [blok("chiqar", "i ni chiqarish", "print(i)")] }),
      ],
      stdin: [],
    },
  ];

  function oqishTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const o = pick(OQISH, rnd);
      const kod = S.kodYasa(o.sxema);
      const res = py.run(kod, { stdin: o.stdin });
      if (res.error) return null;
      return { id: o.id, tur: "oqi", sxema: o.sxema, stdin: o.stdin, kod, javob: res.output };
    }, prev, rr);
  }

  // 3-bosqichda navbat bilan: sxemani o'qish / sxemani yig'ish
  function stage3Task(r, prev) {
    const rr = r || Math.random;
    const wantQur = prev ? prev.tur !== "qur" : rr() < 0.5;
    return wantQur ? qurishTask(rr, prev) : oqishTask(rr, prev);
  }

  const api = { BELGILAR, JAVOBLAR, QURISH, OQISH, belgiTask, qurishTask, oqishTask, stage3Task, tekshir };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
