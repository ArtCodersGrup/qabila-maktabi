// "Algoritm va dasturlash" bloki (26–29-o'yinlar) uchun umumiy sof mantiq:
// katakli maydon, buyruqlarni bajarish, eng qisqa yo'l (BFS) va tasodifiy maydon.
// Ekran bilan ishlamaydi, Node'da test qilinadi: umumiy/tests/dastur.test.js
(function (root) {
  "use strict";

  // Buyruqlar — absolut yo'nalishlar (26-o'yin: robot burilmaydi, siljiydi).
  // y pastga o'sadi: ⬆ — y − 1.
  const DIRS = {
    left: { dx: -1, dy: 0, arrow: "⬅", name: "chapga" },
    up: { dx: 0, dy: -1, arrow: "⬆", name: "yuqoriga" },
    down: { dx: 0, dy: 1, arrow: "⬇", name: "pastga" },
    right: { dx: 1, dy: 0, arrow: "➡", name: "oʻngga" },
  };
  // Ekrandagi tugmalar tartibi
  const ORDER = ["left", "up", "down", "right"];

  const sameCell = (a, b) => !!a && !!b && a.x === b.x && a.y === b.y;
  const cell = (c) => ({ x: c.x, y: c.y });
  const key = (c) => `${c.x},${c.y}`;
  const inside = (f, c) => c.x >= 0 && c.y >= 0 && c.x < f.w && c.y < f.h;
  const isWall = (f, c) => f.walls.some((w) => sameCell(w, c));

  // Maydon: robot, gulxan (maqsad) va toshlar. id — takrorlanmaslikni tekshirish uchun.
  function field({ w = 5, h = 5, robot, goal, walls = [] }) {
    const f = { w, h, robot: cell(robot), goal: cell(goal), walls: walls.map(cell) };
    f.id = `${w}x${h}:${key(f.robot)}>${key(f.goal)}:${f.walls.map(key).sort().join("|")}`;
    return f;
  }

  // Dasturni bajarish. status: "goal" — gulxanga yetdi (qolgan buyruqlar bajarilmaydi),
  // "wall" — toshga, "edge" — maydon chekkasiga urildi, "end" — buyruqlar tugadi.
  // used — bajarilgan (robotni siljitgan) buyruqlar soni; to'xtatgan buyruq shu indeksda turadi.
  function run(f, program) {
    const path = [cell(f.robot)];
    let at = path[0];
    const done = (status, used, blocked) => ({ path, status, at, used, blocked: blocked || null });
    if (sameCell(at, f.goal)) return done("goal", 0);
    for (let i = 0; i < program.length; i++) {
      const d = DIRS[program[i]];
      const next = { x: at.x + d.dx, y: at.y + d.dy };
      if (!inside(f, next)) return done("edge", i, next);
      if (isWall(f, next)) return done("wall", i, next);
      at = next;
      path.push(at);
      if (sameCell(at, f.goal)) return done("goal", i + 1);
    }
    return done("end", program.length);
  }

  // Eng qisqa yo'l (kenglik bo'yicha qidiruv). Yo'l yo'q bo'lsa — null.
  function solve(f) {
    if (sameCell(f.robot, f.goal)) return [];
    const seen = new Set([key(f.robot)]);
    let queue = [{ at: f.robot, program: [] }];
    while (queue.length) {
      const next = [];
      for (const node of queue) {
        for (const dir of ORDER) {
          const d = DIRS[dir];
          const to = { x: node.at.x + d.dx, y: node.at.y + d.dy };
          if (!inside(f, to) || isWall(f, to) || seen.has(key(to))) continue;
          const program = node.program.concat(dir);
          if (sameCell(to, f.goal)) return program;
          seen.add(key(to));
          next.push({ at: to, program });
        }
      }
      queue = next;
    }
    return null;
  }

  // Burilishlar soni: ketma-ket kelgan boshqa yo'nalish
  const turns = (program) => program.filter((d, i) => i > 0 && d !== program[i - 1]).length;

  // Robot bosib o'tgan kataklardan buyruqlarni tiklash
  function pathToProgram(path) {
    const out = [];
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      const dir = ORDER.find((k) => DIRS[k].dx === dx && DIRS[k].dy === dy);
      if (dir) out.push(dir);
    }
    return out;
  }

  const pickInt = (n, rng) => Math.floor(rng() * n);

  // Tasodifiy maydon: yechimi bor, uzunligi [min, max], kerak bo'lsa burilishli,
  // oldingisining aynan o'zi emas (QOIDALAR 4.3).
  function randomField(opts, prev, rng) {
    rng = rng || Math.random;
    const w = opts.w || 5;
    const h = opts.h || 5;
    const wallCount = opts.walls || 0;
    for (let attempt = 0; attempt < 400; attempt++) {
      const robot = { x: pickInt(w, rng), y: pickInt(h, rng) };
      const goal = { x: pickInt(w, rng), y: pickInt(h, rng) };
      if (sameCell(robot, goal)) continue;
      const walls = [];
      for (let k = 0; k < wallCount; k++) {
        const c = { x: pickInt(w, rng), y: pickInt(h, rng) };
        if (sameCell(c, robot) || sameCell(c, goal) || walls.some((x) => sameCell(x, c))) continue;
        walls.push(c);
      }
      if (walls.length !== wallCount) continue;
      const f = field({ w, h, robot, goal, walls });
      if (prev && f.id === prev.id) continue;
      const p = solve(f);
      if (!p || p.length < opts.min || p.length > opts.max) continue;
      if (opts.needTurn && turns(p) < 1) continue;
      return f;
    }
    return fallback(opts, prev);
  }

  // Tasodif omadsiz kelsa (amalda deyarli bo'lmaydi): burilishli, toshsiz tayyor maydon
  function fallback(opts, prev) {
    const w = opts.w || 5;
    const h = opts.h || 5;
    const len = Math.max(2, Math.min(opts.max || 4, 4));
    const dx = Math.max(1, Math.floor(len / 2));
    const dy = Math.max(1, len - dx);
    const make = (side) => field({
      w, h,
      robot: { x: side ? 0 : w - 1, y: h - 1 },
      goal: { x: side ? Math.min(w - 1, dx) : Math.max(0, w - 1 - dx), y: Math.max(0, h - 1 - dy) },
      walls: [],
    });
    const f = make(true);
    return prev && f.id === prev.id ? make(false) : f;
  }

  const api = { DIRS, ORDER, field, run, solve, turns, pathToProgram, randomField, sameCell, inside, isWall };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.dastur = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
