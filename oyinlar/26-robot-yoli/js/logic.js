// Robot yo'li — shu o'yin topshiriqlari: bosqich chegaralari, 2-bosqich ko'rsatuvi,
// 3-bosqich savollari (dasturni o'qish va izdan tiklash). Maydon mantiqi — umumiy/js/dastur.js.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const node = typeof module !== "undefined" && module.exports;
  const D = node ? require("../../umumiy/js/dastur.js") : root.QK.dastur;

  // Bosqich va qiyinlik zinasi (tier 0 / 1 / 2, QOIDALAR 4.3) bo'yicha maydon chegaralari:
  // tosh soni va eng qisqa yo'l uzunligi. needTurn — yo'l kamida bitta burilishli bo'lsin
  // (to'g'ri chiziqda tartib ko'rinmaydi). read — 3-bosqichda o'qiladigan dastur uzunligi.
  const LIMITS = {
    1: [
      { walls: 0, min: 2, max: 4, needTurn: true },
      { walls: 0, min: 3, max: 5, needTurn: true },
      { walls: 0, min: 4, max: 6, needTurn: true },
    ],
    2: [
      { walls: 3, min: 3, max: 6, needTurn: true },
      { walls: 4, min: 4, max: 7, needTurn: true },
      { walls: 4, min: 5, max: 8, needTurn: true },
    ],
    3: [
      { walls: 2, min: 3, max: 5, needTurn: true, read: [3, 5] },
      { walls: 3, min: 4, max: 6, needTurn: true, read: [4, 6] },
      { walls: 4, min: 4, max: 7, needTurn: true, read: [5, 7] },
    ],
  };
  // tier 0 chegaralari (eski nom bilan — sahnalar va testlar ishlatadi)
  const STAGE = { 1: LIMITS[1][0], 2: LIMITS[2][0], 3: LIMITS[3][0] };

  // 2-bosqich ko'rsatuvi: bir xil to'rt buyruq, ikki xil tartib.
  // ➡➡⬆⬆ — tosh (2,4) ga uriladi; ⬆⬆➡➡ — toshni aylanib o'tib, gulxanga yetadi.
  const DEMO = {
    field: { robot: { x: 0, y: 4 }, goal: { x: 2, y: 2 }, walls: [{ x: 2, y: 4 }] },
    bad: ["right", "right", "up", "up"],
    good: ["up", "up", "right", "right"],
  };

  // 3-bosqich, "qayerga boradi?" uchun tasodifiy dastur: gulxanga yetmaydi,
  // chekkaga urilmaydi va robot joyidan qimirlaydi (savol ma'noli bo'lishi uchun)
  function readProgram(field, rng, range) {
    const [lo, hi] = range || [3, 5];
    for (let k = 0; k < 120; k++) {
      const len = lo + Math.floor(rng() * (hi - lo + 1));
      const program = [];
      for (let i = 0; i < len; i++) program.push(D.ORDER[Math.floor(rng() * D.ORDER.length)]);
      const r = D.run(field, program);
      if (r.status === "goal" || r.status === "edge") continue;
      if (r.path.length < 2 || D.sameCell(r.at, field.robot)) continue;
      return program;
    }
    return null;
  }

  // 1–2-bosqich: dastur yozish; 3-bosqich: dasturni o'qish yoki izdan tiklash.
  // tier 2 da yozilgan dastur ENG QISQA bo'lishi shart (shortest — eng kam buyruqlar soni).
  function makeTask(stage, prev, rng, tier) {
    rng = rng || Math.random;
    tier = tier || 0;
    const lim = LIMITS[stage][tier];
    const prevField = prev && prev.field ? prev.field : null;
    let task = null;
    for (let guard = 0; guard < 50; guard++) {
      const field = D.randomField(lim, prevField, rng);
      if (stage < 3) {
        task = { type: "write", field, id: `write:${field.id}` };
        if (tier === 2) task.shortest = D.solve(field).length;
      } else {
        const program = rng() < 0.5 ? readProgram(field, rng, lim.read) : null;
        if (program) {
          task = { type: "read", field, program, answer: D.run(field, program).at, id: `read:${field.id}:${program.join("")}` };
        } else {
          const trace = D.solve(field);
          task = { type: "trace", field, program: trace, answer: trace, id: `trace:${field.id}` };
        }
      }
      if (!prev || prev.id !== task.id) return task;
    }
    return task;
  }

  // Javobni tekshirish: yozilgan dastur — gulxanga yetsa (tier 2 da — eng kam buyruq bilan);
  // o'qish — bosilgan katak; izdan tiklash — robot aynan shu yo'ldan yursa (ortiqcha buyruq gulxanda bajarilmaydi)
  function checkTask(task, value) {
    if (task.type === "read") return D.sameCell(value, task.answer);
    if (task.type === "trace") {
      const want = D.run(task.field, task.program).path;
      const got = D.run(task.field, value).path;
      return want.length === got.length && want.every((c, i) => D.sameCell(c, got[i]));
    }
    if (D.run(task.field, value).status !== "goal") return false;
    return !task.shortest || value.length <= task.shortest;
  }

  // Gulxanga yetdi, lekin yo'l uzun (faqat "eng qisqa yo'l" shartida)
  const tooLong = (task, value) => !!task.shortest && D.run(task.field, value).status === "goal" && value.length > task.shortest;

  const api = { STAGE, LIMITS, DEMO, makeTask, checkTask, tooLong, readProgram };

  if (node) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.logic = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
