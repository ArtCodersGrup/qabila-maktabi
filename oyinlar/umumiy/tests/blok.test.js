// Umumiy blok dvigateli (62–65-o'yinlar): bajarish, sanash, siqish narxi, Python ko'rinishi va tor yo'l.
const test = require("node:test");
const assert = require("node:assert/strict");
const B = require("../js/blok.js");
const D = require("../js/dastur.js");
const py = require("../js/python/python.js");

const { yur, takror, agar, toki, gulxangacha, chaqir, qoy, qosh, kop } = B;

test("yur, takror, agar — 47-o'yin bilan bir xil", () => {
  const f = B.maydon({ x: 0, y: 0 }, { x: 4, y: 0 });
  assert.equal(B.bajar(f, [takror(4, [yur("right")])]).status, "goal");
  assert.equal(B.bajar(f, [takror(3, [yur("right")])]).status, "end");
  assert.equal(B.bajar(f, [takror(2, [takror(2, [yur("right")])])]).status, "goal");
  assert.equal(B.bajar(f, [yur("up")]).status, "edge");
  const g = B.maydon({ x: 0, y: 1 }, { x: 2, y: 1 }, [{ x: 1, y: 1 }]);
  const aylan = [agar("right", kop("right", 2), [yur("down"), yur("right"), yur("right"), yur("up")])];
  assert.equal(B.bajar(g, aylan).status, "goal");
  assert.equal(B.bajar(g, [yur("right")]).status, "wall");
});

test("toki: shu yon bo'sh ekan yuradi; tanasi bo'sh bo'lsa — uzun", () => {
  for (const L of [3, 5, 6]) {
    const f = B.maydon({ x: 0, y: 0 }, { x: L - 1, y: 1 }, [{ x: L, y: 0 }], L + 1, 3);
    const r = B.bajar(f, [toki("right", [yur("right")]), yur("down")]);
    assert.equal(r.status, "goal", "L=" + L);
  }
  const f = B.maydon({ x: 0, y: 0 }, { x: 4, y: 4 });
  assert.equal(B.bajar(f, [toki("right", [])]).status, "uzun");
  assert.equal(B.bajar(f, [toki("right", [yur("left")])]).status, "edge");
});

test("gulxangacha: zinapoya, yetguncha", () => {
  const f = B.maydon({ x: 0, y: 0 }, { x: 3, y: 3 });
  const r = B.bajar(f, [gulxangacha([yur("right"), yur("down")])]);
  assert.equal(r.status, "goal");
  assert.equal(r.qadam, 6);
  assert.equal(B.bajar(f, [gulxangacha([])]).status, "uzun");
});

test("chaqir: funksiya tanasi bajariladi, soni tanani bir marta sanaydi", () => {
  const fn = { yulduz: [yur("up"), yur("right"), yur("right"), yur("down")] };
  const yol = [...fn.yulduz, "right", "right", ...fn.yulduz].map((b) => (typeof b === "string" ? b : b.yon));
  const f = B.yoldanMaydon(yol);
  const dastur = [chaqir("yulduz"), yur("right"), yur("right"), chaqir("yulduz")];
  assert.equal(B.bajar(f, dastur, { fn }).status, "goal");
  assert.equal(B.soni(dastur, fn), 8);
  assert.equal(B.bajar(f, dastur).status, "end", "funksiya yo'q — chaqiruv hech narsa qilmaydi");
  // O'zini chaqirsa — to'xtaydi
  assert.equal(B.bajar(f, [chaqir("doira")], { fn: { doira: [chaqir("doira")] } }).status, "uzun");
});

test("qadam: qoy, qosh, takror qadam marta; iz da qiymatlar", () => {
  const L = 4;
  const f = B.maydon({ x: 0, y: 0 }, { x: L, y: L }, [{ x: L + 1, y: 0 }], L + 2, L + 1);
  const dastur = [qoy(0), toki("right", [yur("right"), qosh()]), takror("qadam", [yur("down")])];
  const r = B.bajar(f, dastur);
  assert.equal(r.status, "goal");
  assert.equal(r.qiymat, L, "toshgacha L qadam");
  const g = B.maydon({ x: 0, y: 0 }, { x: L + 1, y: L + 1 }, [{ x: L + 2, y: 0 }], L + 3, L + 2);
  assert.equal(B.bajar(g, dastur).status, "goal", "boshqa uzunlikda ham ishlaydi");
  assert.deepEqual(r.iz.filter((e) => e.tur === "var").map((e) => e.qiymat), [0, 1, 2, 3, 4]);
});

test("ixchamNarx: takror bilan siqish", () => {
  assert.equal(B.ixchamNarx([]), 0);
  assert.equal(B.ixchamNarx(["right"]), 1);
  assert.equal(B.ixchamNarx(Array(4).fill("right")), 2);
  assert.equal(B.ixchamNarx(["right", "down", "right", "down", "right", "down"]), 3);
  // ★ →→ ★ → ★ (★ = ↑→→↓): takror bilan siqib bo'lmaydi
  const m = ["up", "right", "right", "down"];
  const yol = [...m, "right", "right", ...m, "right", ...m];
  assert.ok(B.ixchamNarx(yol) > 4 + 6, "funksiyali yechim 10 blok, funksiyasiz ko'proq");
  // Ichma-ich: (→→↓)×3 = takror3[takror2[→], ↓] = 4
  assert.equal(B.ixchamNarx(["right", "right", "down", "right", "right", "down", "right", "right", "down"]), 4);
});

test("pythonMatn: bloklar matnga", () => {
  const fn = { yulduz: [yur("up"), yur("right")] };
  const dastur = [
    qoy(0),
    takror(3, [chaqir("yulduz"), qosh()]),
    agar("right", [yur("right")], [yur("down")]),
    toki("down", []),
    gulxangacha([agar("left", [yur("left")])]),
    takror("qadam", [yur("up")]),
  ];
  assert.equal(B.pythonMatn(dastur, fn), [
    "def yulduz():",
    "    yuqoriga()",
    "    ongga()",
    "qadam = 0",
    "for i in range(3):",
    "    yulduz()",
    "    qadam = qadam + 1",
    "if ong_bosh():",
    "    ongga()",
    "else:",
    "    pastga()",
    "while past_bosh():",
    "    pass",
    "while not yetdi():",
    "    if chap_bosh():",
    "        chapga()",
    "for i in range(qadam):",
    "    yuqoriga()",
  ].join("\n"));
  assert.equal(B.pythonMatn([], { yulduz: [] }), "def yulduz():\n    pass");
  // Tahrir qismlari blokka bog'langan
  const q = B.pythonQatorlar([takror(4, [yur("left")])]);
  assert.equal(q[0].qismlar[1].tahrir.maydon, "n");
  assert.equal(q[1].qismlar[0].tahrir.maydon, "yon");
});

// Tasodifiy dastur (funksiya va hisoblagich bilan)
function tasodifiy(rng, chuqur, fnBor) {
  const n = 1 + Math.floor(rng() * 4);
  const out = [];
  for (let i = 0; i < n; i++) {
    const r = rng();
    const yon = B.pick(B.YONLAR, rng);
    if (chuqur > 1 || r < 0.35) out.push(yur(yon));
    else if (r < 0.5) out.push(takror(B.randInt(2, 4, rng), tasodifiy(rng, chuqur + 1, fnBor)));
    else if (r < 0.62) out.push(agar(yon, tasodifiy(rng, chuqur + 1, fnBor), rng() < 0.5 ? tasodifiy(rng, chuqur + 1, fnBor) : []));
    else if (r < 0.72) out.push(toki(yon, [yur(yon)]));
    else if (r < 0.78) out.push(gulxangacha([agar(yon, [yur(yon)], [yur(B.pick(B.YONLAR, rng))])]));
    else if (r < 0.86 && fnBor) out.push(chaqir("yulduz"));
    else if (r < 0.92) out.push(qosh());
    else out.push(takror("qadam", [yur(yon)]));
  }
  return out;
}

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test("bloklar va Python matni bir xil yo'l yuradi (300 tasodifiy dastur)", () => {
  const rng = mulberry(7);
  let tekshirildi = 0;
  for (let k = 0; k < 300; k++) {
    const f = D.randomField({ w: 6, h: 5, walls: 4, min: 3, max: 8 }, null, rng);
    const fn = { yulduz: tasodifiy(rng, 2, false) };
    const dastur = [qoy(0), ...tasodifiy(rng, 0, true)];
    const r = B.bajar(f, dastur, { fn });
    if (r.status === "uzun") continue; // cheksiz sikl — Python'da qadam chegarasi boshqacha
    const t = B.pyTashqi(f);
    const kod = B.pythonMatn(dastur, fn);
    const p = py.run(kod, { tashqi: t.tashqi, maxSteps: 200000 });
    const n = t.natija(false);
    assert.equal(n.status, r.status, kod);
    assert.deepEqual(n.path, r.path, kod);
    if (!p.error) assert.equal(r.status === "goal" || r.status === "wall" || r.status === "edge", false, "to'xtash Python'ni ham to'xtatadi");
    tekshirildi++;
  }
  assert.ok(tekshirildi > 200);
});

test("torYol: yo'ldan boshqa kataklar tosh, yorliq bo'lsa null", () => {
  const m = ["up", "right", "right", "down"];
  const f = B.torYol([...m, "right", "right", ...m]);
  assert.ok(f);
  assert.equal(D.solve(f).length, 10);
  // Bitta oraliq: ikki naqshning tepasi yonma-yon — yorliq
  assert.equal(B.torYol([...m, "right", ...m]), null);
  // U shakli: boshi va oxiri yonma-yon — yorliq bor
  assert.equal(B.torYol(["down", "right", "up"]), null);
  // O'zini kesadi
  assert.equal(B.torYol(["right", "down", "left", "up"]), null);
});
