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

  // Qiyinlik zinasi (QOIDALAR 4.3): chegaralar tier 0 / 1 / 2 bo'yicha
  const CONV = [[16, 255], [128, 255], [256, 4095]]; // 1-bosqich: tier 2 — 12 bit, 3 xonali 16-lik
  const ADDSUB = [[16, 240], [80, 240], [256, 2047]]; // 2-bosqich: tier 2 — 3 xonali sonlar
  const MUL_D = [[2, 9], [4, 9], [10, 15]]; // 3-bosqich: ko'paytuvchi; tier 2 — A…F

  // Yaqin ranglar (tier 1+): kanallar faqat 00, 88 yoki FF; chalg'ituvchilar bitta kanal bilan farq qiladi
  const LEVELS = ["00", "88", "FF"];
  const CHANNELS = ["qizil", "yashil", "koʻk"];
  const channelText = (code) => [1, 3, 5].map((k, i) => `${CHANNELS[i]} ${code.slice(k, k + 2)}`).join(", ");
  function nearColors(r) {
    const parts = [pick(LEVELS, r), pick(LEVELS, r), pick(LEVELS, r)];
    const code = "#" + parts.join("");
    const others = [];
    for (let ch = 0; ch < 3; ch++) {
      for (const lv of LEVELS) {
        if (lv === parts[ch]) continue;
        const p2 = parts.slice();
        p2[ch] = lv;
        others.push("#" + p2.join(""));
      }
    }
    const named = (c) => {
      const known = COLORS.find((x) => x.code === c);
      return color(c, known ? known.name : channelText(c));
    };
    return { answer: named(code), others: shuffle(others, r).slice(0, 3).map(named) };
  }

  // 1-bosqich: ikkilik → 16-lik, 16-lik → ikkilik, rang kodi (4 variant; tier 1+ da yaqin ranglar)
  const makeConvTask = (prev, rng, tier) => loop(prev, rng, (r) => {
    tier = tier || 0;
    const x = r();
    const [lo, hi] = CONV[tier];
    if (x < 0.4) {
      const v = randInt(lo, hi, r);
      const bits = S.toBase(v, 2);
      return { type: "bin2hex", bits: bits.padStart(Math.ceil(bits.length / 4) * 4, "0"), answer: S.toBase(v, 16) };
    }
    if (x < 0.75) {
      const v = randInt(lo, hi, r);
      return { type: "hex2bin", hex: S.toBase(v, 16), answer: S.toBase(v, 2) };
    }
    let options;
    let right;
    if (tier === 0) {
      options = shuffle(COLORS, r).slice(0, 4);
      right = options[randInt(0, 3, r)];
    } else {
      const near = nearColors(r);
      right = near.answer;
      options = shuffle([near.answer, ...near.others], r);
    }
    return { type: "color", code: right.code, options, answer: options.indexOf(right) };
  });

  // 2-bosqich: qo'shish yoki ayirish; 75% hollarda (tier 1+ da — doim) birlar ustunida ko'chish/qarz.
  // tier 0–1 — 2 xonali, tier 2 — 3 xonali sonlar (natija ≤ FFF)
  const makeAddSubTask = (prev, rng, tier) => loop(prev, rng, (r) => {
    tier = tier || 0;
    const [lo, hi] = ADDSUB[tier];
    const need = (has) => has || (tier === 0 && r() >= 0.75);
    if (r() < 0.5) {
      const x = randInt(lo, hi, r);
      const y = randInt(lo, hi, r);
      const a = S.toBase(x, 16);
      const b = S.toBase(y, 16);
      if (!need(S.addColumns(a, b, 16).cols[0].carryOut)) return null;
      return { op: "+", a, b, answer: S.toBase(x + y, 16) };
    }
    const x = randInt([40, 100, 512][tier], tier === 2 ? 4095 : 255, r);
    const y = randInt(lo, x - 1, r);
    const a = S.toBase(x, 16);
    const b = S.toBase(y, 16);
    if (b.length !== a.length || !need(S.subColumns(a, b, 16).cols[0].borrowOut)) return null;
    return { op: "−", a, b, answer: S.toBase(x - y, 16) };
  });

  // 3-bosqich: 2 xonali son × bir xonali son (natija ≤ FFF); tier 2 da ko'paytuvchi — A…F
  const makeMulTask = (prev, rng, tier) => loop(prev, rng, (r) => {
    tier = tier || 0;
    const d = randInt(MUL_D[tier][0], MUL_D[tier][1], r);
    const x = randInt(tier ? 32 : 16, Math.min(255, Math.floor(4095 / d)), r);
    return { a: S.toBase(x, 16), d, answer: S.toBase(x * d, 16) };
  });

  const api = { TETRADS, groups, COLORS, CONV, ADDSUB, MUL_D, LEVELS, channelText, nearColors, makeConvTask, makeAddSubTask, makeMulTask };

  if (node) module.exports = api;
  else root.QK.amal16 = api;
})(typeof window !== "undefined" ? window : globalThis);
