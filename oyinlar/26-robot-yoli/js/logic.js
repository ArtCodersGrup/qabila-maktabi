// Robot yo'li — shu o'yin topshiriqlari: bosqich chegaralari, 2-bosqich ko'rsatuvi,
// 3-bosqich savollari (dasturni o'qish va izdan tiklash). Maydon mantiqi — umumiy/js/dastur.js.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const node = typeof module !== "undefined" && module.exports;
  const D = node ? require("../../umumiy/js/dastur.js") : root.QK.dastur;

  // Bosqich bo'yicha maydon chegaralari: tosh soni va eng qisqa yo'l uzunligi.
  // needTurn — yo'l kamida bitta burilishli bo'lsin (to'g'ri chiziqda tartib ko'rinmaydi).
  const STAGE = {
    1: { walls: 0, min: 2, max: 4, needTurn: true },
    2: { walls: 3, min: 3, max: 6, needTurn: true },
    3: { walls: 2, min: 3, max: 5, needTurn: true },
  };

  // 2-bosqich ko'rsatuvi: bir xil to'rt buyruq, ikki xil tartib.
  // ➡➡⬆⬆ — tosh (2,4) ga uriladi; ⬆⬆➡➡ — toshni aylanib o'tib, gulxanga yetadi.
  const DEMO = {
    field: { robot: { x: 0, y: 4 }, goal: { x: 2, y: 2 }, walls: [{ x: 2, y: 4 }] },
    bad: ["right", "right", "up", "up"],
    good: ["up", "up", "right", "right"],
  };

  // 3-bosqich, "qayerga boradi?" uchun tasodifiy dastur: gulxanga yetmaydi,
  // chekkaga urilmaydi va robot joyidan qimirlaydi (savol ma'noli bo'lishi uchun)
  function readProgram(field, rng) {
    for (let k = 0; k < 120; k++) {
      const len = 3 + Math.floor(rng() * 3);
      const program = [];
      for (let i = 0; i < len; i++) program.push(D.ORDER[Math.floor(rng() * D.ORDER.length)]);
      const r = D.run(field, program);
      if (r.status === "goal" || r.status === "edge") continue;
      if (r.path.length < 2 || D.sameCell(r.at, field.robot)) continue;
      return program;
    }
    return null;
  }

  // 1–2-bosqich: dastur yozish; 3-bosqich: dasturni o'qish yoki izdan tiklash
  function makeTask(stage, prev, rng) {
    rng = rng || Math.random;
    const prevField = prev && prev.field ? prev.field : null;
    let task = null;
    for (let guard = 0; guard < 50; guard++) {
      const field = D.randomField(STAGE[stage], prevField, rng);
      if (stage < 3) {
        task = { type: "write", field, id: `write:${field.id}` };
      } else {
        const program = rng() < 0.5 ? readProgram(field, rng) : null;
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

  // Javobni tekshirish: yozilgan dastur — gulxanga yetsa; o'qish — bosilgan katak;
  // izdan tiklash — robot aynan shu yo'ldan yursa (ortiqcha buyruq gulxanda bajarilmaydi)
  function checkTask(task, value) {
    if (task.type === "read") return D.sameCell(value, task.answer);
    if (task.type === "trace") {
      const want = D.run(task.field, task.program).path;
      const got = D.run(task.field, value).path;
      return want.length === got.length && want.every((c, i) => D.sameCell(c, got[i]));
    }
    return D.run(task.field, value).status === "goal";
  }

  const api = { STAGE, DEMO, makeTask, checkTask, readProgram };

  if (node) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.logic = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
