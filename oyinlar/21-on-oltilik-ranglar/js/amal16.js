// O'n oltilik ranglar — tetradalar (4 bit = 1 raqam), rang kodlari va topshiriqlar:
// 2 ↔ 16, rang, 16-likda qo'shish/ayirish va bir xonali songa ko'paytirish. Node'da test qilinadi.
(function (root) {
  "use strict";

  const node = typeof module !== "undefined" && module.exports;
  const S = node ? require("../../umumiy/js/sanoq.js") : root.QK.sanoq;

  const TETRADS = Array.from({ length: 16 }, (_, v) => ({ hex: S.digitChar(v), bits: S.toBase(v, 2).padStart(4, "0") }));

  // O'ngdan 4 tadan guruhlash (chapdagi guruh nollar bilan to'ldiriladi)
  function groups(bits) {
    const padded = bits.padStart(Math.ceil(bits.length / 4) * 4, "0");
    return padded.match(/.{4}/g);
  }

  const color = (code, name) => ({ code, name, rgb: [1, 3, 5].map((k) => S.fromBase(code.slice(k, k + 2), 16)) });
  const COLORS = [
    color("#FF0000", "qizil"), color("#00FF00", "yashil"), color("#0000FF", "koʻk"),
    color("#FFFF00", "sariq"), color("#FF8800", "toʻq sariq"), color("#FFFFFF", "oq"),
    color("#000000", "qora"), color("#00FFFF", "havorang"), color("#FF00FF", "pushti"),
  ];

  const randInt = (a, b, rng) => a + Math.floor(rng() * (b - a + 1));
  const pick = (list, rng) => list[Math.floor(rng() * list.length)];
  function shuffle(list, rng) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function loop(prev, rng, gen) {
    rng = rng || Math.random;
    for (;;) {
      const task = gen(rng);
      if (task && !(prev && JSON.stringify(prev) === JSON.stringify(task))) return task;
    }
  }

  // 1-bosqich: 8 bitli ikkilik → 16-lik, 2 xonali 16-lik → ikkilik, rang kodi
  const makeConvTask = (prev, rng) => loop(prev, rng, (r) => {
    const x = r();
    if (x < 0.4) {
      const v = randInt(16, 255, r);
      return { type: "bin2hex", bits: S.toBase(v, 2).padStart(8, "0"), answer: S.toBase(v, 16) };
    }
    if (x < 0.75) {
      const v = randInt(16, 255, r);
      return { type: "hex2bin", hex: S.toBase(v, 16), answer: S.toBase(v, 2) };
    }
    const options = shuffle(COLORS, r).slice(0, 3);
    const answer = randInt(0, 2, r);
    return { type: "color", code: options[answer].code, options, answer };
  });

  // 2-bosqich: 2 xonali sonlarni qo'shish yoki ayirish; 75% hollarda birlar ustunida ko'chish/qarz
  const makeAddSubTask = (prev, rng) => loop(prev, rng, (r) => {
    if (r() < 0.5) {
      const x = randInt(16, 240, r);
      const y = randInt(16, 240, r);
      const a = S.toBase(x, 16);
      const b = S.toBase(y, 16);
      if (!S.addColumns(a, b, 16).cols[0].carryOut && r() < 0.75) return null;
      return { op: "+", a, b, answer: S.toBase(x + y, 16) };
    }
    const x = randInt(40, 255, r);
    const y = randInt(16, x - 1, r);
    const a = S.toBase(x, 16);
    const b = S.toBase(y, 16);
    if (b.length !== 2 || (!S.subColumns(a, b, 16).cols[0].borrowOut && r() < 0.75)) return null;
    return { op: "−", a, b, answer: S.toBase(x - y, 16) };
  });

  // 3-bosqich: 2 xonali son × 2–9 (natija ≤ FFF)
  const makeMulTask = (prev, rng) => loop(prev, rng, (r) => {
    const d = randInt(2, 9, r);
    const x = randInt(16, Math.min(255, Math.floor(4095 / d)), r);
    return { a: S.toBase(x, 16), d, answer: S.toBase(x * d, 16) };
  });

  const api = { TETRADS, groups, COLORS, makeConvTask, makeAddSubTask, makeMulTask };

  if (node) module.exports = api;
  else root.QK.amal16 = api;
})(typeof window !== "undefined" ? window : globalThis);
