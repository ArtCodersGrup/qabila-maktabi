// 27-o'yin: mashq savollarini yasash (sof mantiq, ekransiz).
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  // Ekranda ko'rinadigan matnlar: to'g'ri belgilar bilan, qo'shtirnoqsiz
  const TEXTS = [
    "Salom, qabila!", "Salom, dunyo!", "Men dasturchiman", "Python oʻrganamiz",
    "Bugun dars bor", "Kompyuter tayyor", "Kod yozamiz", "Birinchi buyruq",
  ];
  const NAMES = ["Anvar", "Dilnoza", "Sardor", "Malika", "Jasur", "Zilola", "Bekzod", "Nigora"];
  const WORDS = ["olma", "kitob", "quyosh", "daryo", "tosh", "qalam", "gulxan", "yoʻl"];

  const pick = (list, r) => list[Math.floor(r() * list.length)];

  // Bir xil savol ketma-ket ikki marta chiqmaydi (QOIDALAR 4.3)
  function pickNew(make, prev, r) {
    for (let k = 0; k < 20; k++) {
      const task = make(r);
      if (!prev || task.id !== prev.id) return task;
    }
    return make(r);
  }

  // Qiyinlik zinasi (QOIDALAR 4.3): 0 — birinchi javoblar, 1 — o'rta, 2 — oxirgi va qiyin rejim.
  // Zina berilmasa (testlar) — eng qiyini.
  const zina = (tier) => (tier == null ? 2 : Math.max(0, Math.min(2, tier)));

  // ---------- 1-bosqich: berilgan matnni chiqaradigan kodni terish ----------
  // Terish — ko'chirish mashqi: sahna 2 ta to'g'ri javob so'raydi (need: 2). Qiyin rejimda — ikki satr.
  function typeTask(r, prev, tier) {
    const t = tier == null ? 0 : zina(tier);
    return pickNew((rr) => {
      const text = pick(TEXTS.concat(NAMES.map((n) => "Salom, " + n + "!")), rr);
      let code = 'print("' + text + '")';
      if (t === 2) code += '\nprint("' + pick(WORDS, rr) + '", "' + pick(WORDS, rr) + '")';
      return { id: "ter:" + code, type: "ter", text, code };
    }, prev, r || Math.random);
  }

  // ---------- 2-bosqich: kod berilgan — chiqishini ayt ----------
  // 2026-10-02: ikki yangi tur — "uch" (uch print, biri vergul bilan sonlarni chiqaradi)
  // va "qoshish" ("a" + "b" yopishadi, "a", "b" orasiga bo'shliq tushadi). Ular oxirgi zinada keladi.
  const RESULT_KINDS = ["ikki", "bosh", "son", "vergul", "tirnoq", "uch", "qoshish"];
  const RESULT_ZINA = [["ikki", "bosh", "vergul"], ["ikki", "bosh", "vergul", "son", "tirnoq"], ["son", "tirnoq", "uch", "qoshish", "uch", "qoshish"]];

  function resultTask(r, prev, tier) {
    return pickNew((rr) => {
      const kind = pick(tier == null ? RESULT_KINDS : RESULT_ZINA[zina(tier)], rr);
      let code;
      if (kind === "uch") {
        const a = 2 + Math.floor(rr() * 8);
        const b = 2 + Math.floor(rr() * 8);
        code = 'print("' + pick(WORDS, rr) + '")\nprint(' + a + ", " + b + ")\nprint(" + a + " * " + b + ', "' + pick(WORDS, rr) + '")';
      } else if (kind === "qoshish") {
        const a = pick(WORDS, rr);
        const b = pick(WORDS, rr);
        code = 'print("' + a + '" + "' + b + '")\nprint("' + a + '", "' + b + '")';
      } else if (kind === "ikki") {
        const a = pick(TEXTS, rr);
        const b = pick(NAMES, rr);
        code = 'print("' + a + '")\nprint("' + b + '")';
      } else if (kind === "bosh") {
        const a = pick(WORDS, rr);
        const b = pick(WORDS, rr);
        code = 'print("' + a + '")\nprint()\nprint("' + b + '")';
      } else if (kind === "son") {
        const a = 2 + Math.floor(rr() * 8);
        const b = 2 + Math.floor(rr() * 8);
        code = "print(" + a + " + " + b + ')\nprint("' + a + " + " + b + '")';
      } else if (kind === "vergul") {
        const name = pick(NAMES, rr);
        code = 'print("Salom,", "' + name + '")';
      } else {
        const w = pick(WORDS, rr);
        code = "print('" + w + "')\nprint(\"" + w + "\")";
      }
      return { id: "natija:" + code, type: "natija", kind, code, solution: code };
    }, prev, r || Math.random);
  }

  // ---------- 3-bosqich: xatoni top / o'zing yoz ----------
  const BROKEN = [
    { kind: "qavs", break: (code) => code.slice(0, -1), why: "qavs yopilmagan" },
    { kind: "tirnoq", break: (code) => code.replace(/"([^"]*)"\)$/, '"$1)'), why: "qoʻshtirnoq yopilmagan" },
    { kind: "bosh-harf", break: (code) => code.replace(/^print/, "Print"), why: "buyruq katta harf bilan yozilgan" },
    { kind: "tirnoqsiz", break: (code) => code.replace(/"/g, ""), why: "matn qoʻshtirnoqsiz yozilgan" },
  ];

  // 2026-10-02: zina bilan dastur uzayadi (1 → 2 → 3 satr) va xato ULARNING BITTASIDA bo'ladi —
  // bola xato xabaridagi satr raqamini o'qib, aynan o'sha satrni tuzatishi kerak.
  function fixTask(r, prev, tier) {
    const satrlar = [1, 2, 3][zina(tier)];
    return pickNew((rr) => {
      const texts = [];
      while (texts.length < satrlar) {
        const text = pick(WORDS.concat(NAMES), rr);
        if (!texts.includes(text)) texts.push(text);
      }
      const good = texts.map((text) => 'print("' + text + '")');
      const broken = pick(BROKEN, rr);
      const line = Math.floor(rr() * satrlar); // buziladigan satr
      const bad = good.slice();
      bad[line] = broken.break(good[line]);
      return {
        id: "xato:" + broken.kind + ":" + texts.join("|") + ":" + line,
        type: "xato-top", kind: broken.kind, line: line + 1,
        why: (satrlar > 1 ? (line + 1) + "-satrda " : "") + broken.why,
        code: bad.join("\n"), solution: good.join("\n"),
      };
    }, prev, r || Math.random);
  }

  // 2026-10-02: satrlar soni zina bilan o'sadi: 1–2 → 2–3 → 3–4 (oldin doim 1–2 edi)
  const WRITE_LINES = [[1, 2], [2, 3], [3, 4]];

  function writeTask(r, prev, tier) {
    const [kam, kop] = WRITE_LINES[zina(tier)];
    return pickNew((rr) => {
      const count = kam + Math.floor(rr() * (kop - kam + 1));
      const lines = [];
      while (lines.length < count) {
        const line = rr() < 0.5 ? pick(NAMES, rr) : pick(WORDS, rr);
        if (!lines.includes(line)) lines.push(line);
      }
      return {
        id: "yoz:" + lines.join("|"),
        type: "kod-yoz", lines,
        solution: lines.map((line) => 'print("' + line + '")').join("\n"),
        tests: [{ stdin: [], out: lines }],
      };
    }, prev, r || Math.random);
  }

  // 3-bosqichda ikki xil savol navbat bilan keladi
  function stage3Task(r, prev, tier) {
    const rr = r || Math.random;
    const wantFix = prev ? prev.type !== "xato-top" : rr() < 0.5;
    return wantFix ? fixTask(rr, prev, tier) : writeTask(rr, prev, tier);
  }

  const api = { TEXTS, NAMES, WORDS, BROKEN, RESULT_KINDS, typeTask, resultTask, fixTask, writeTask, stage3Task, pickNew };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
