// 44-o'yin: Paskal uchburchagi — C(n,k) ni formulasiz topish.
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const S = (root.QK && root.QK.sanash) || require("../../umumiy/js/sanash.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  function pickNew(make, prev, r) {
    for (let k = 0; k < 40; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  const QATOR_SONI = 9; // 0 … 8-qator: ekranga sig'adi va sonlari 4 xonadan oshmaydi
  const JADVAL = S.paskal(QATOR_SONI);
  const katak = (n, k) => JADVAL[n][k];
  // Katakning tepasidagi ikki son (chekkada bittasi yo'q — null)
  const tepa = (n, k) => [k > 0 ? JADVAL[n - 1][k - 1] : null, k < n ? JADVAL[n - 1][k] : null];
  const qatorYigindi = (n) => JADVAL[n].reduce((a, b) => a + b, 0n);

  // ---------- 1-bosqich: katakni to'ldirish ----------
  function katakTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const n = int(rnd, 2, QATOR_SONI - 1);
      const k = int(rnd, 1, n - 1); // chekka emas: ikkala tepasi ham bor
      const [chap, ong] = tepa(n, k);
      return { id: "katak:" + n + ":" + k, tur: "katak", n, k, chap, ong, javob: katak(n, k),
        hisob: chap + " + " + ong + " = " + katak(n, k),
        nega: "Har katak — tepasidagi ikki sonning yigʻindisi." };
    }, prev, rr);
  }

  // ---------- 2-bosqich: uchburchakdan C ni o'qish va qator yig'indisi ----------
  function oqishTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const n = int(rnd, 4, QATOR_SONI - 1);
      const k = int(rnd, 0, n);
      return { id: "oqish:" + n + ":" + k, tur: "oqish", n, k, javob: katak(n, k),
        matn: "C(" + n + ", " + k + ") — " + n + "-qatorning " + k + "-soni (0 dan sanaymiz). Nechaga teng?",
        hisob: "C(" + n + ", " + k + ") = " + katak(n, k),
        nega: "Qatorlar ham, sonlar ham 0 dan sanaladi. Uchburchakdan topib qara." };
    }, prev, rr);
  }

  function yigindiTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const n = int(rnd, 3, QATOR_SONI - 1);
      return { id: "yigindi:" + n, tur: "yigindi", n, javob: qatorYigindi(n),
        matn: n + "-qatordagi hamma sonning yigʻindisi nechaga teng?",
        hisob: "2^" + n + " = " + qatorYigindi(n),
        nega: "Har qator yigʻindisi — 2 ning darajasi: " + n + " ta narsadan nechta toʻplam tuzish mumkin boʻlsa, shuncha." };
    }, prev, rr);
  }

  // ---------- Xossalar (2-bosqichda ko'rsatiladi) ----------
  const XOSSALAR = [
    { id: "chekka", nom: "Chekkalari — 1", izoh: "C(n, 0) = C(n, n) = 1" },
    { id: "simmetriya", nom: "Oyna kabi simmetrik", izoh: "C(n, k) = C(n, n−k)" },
    { id: "yigindi", nom: "Qator yigʻindisi — 2ⁿ", izoh: "n ta narsadan nechta toʻplam tuziladi" },
    { id: "diagonal", nom: "Ikkinchi qiyshiq qator — 1, 2, 3, 4 …", izoh: "C(n, 1) = n" },
    { id: "juftlik", nom: "Uchinchi qiyshiq qator — 1, 3, 6, 10 …", izoh: "C(n, 2) — nechta juftlik (qoʻl berib koʻrishish)" },
  ];

  // ---------- 3-bosqich: kod ----------
  const qatorKod = (n) => "a = [1]\nfor i in range(" + n + "):\n    yangi = [1]\n    for j in range(len(a) - 1):\n        yangi.append(a[j] + a[j + 1])\n    yangi.append(1)\n    a = yangi\nprint(a)";

  function kodTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const n = int(rnd, 3, 7);
      const kod = qatorKod(n);
      // Bu masalada javob son emas — ro'yxat satri; shuning uchun "javob" maydoni yo'q
      return { id: "kod:qator:" + n, tur: "natija", type: "natija", code: kod, solution: kod,
        n, kutilgan: "[" + JADVAL[n].join(", ") + "]",
        hisob: n + "-qator: " + JADVAL[n].join(", ") };
    }, prev, rr);
  }

  const WRITE = [
    {
      id: "qator",
      what: "qator(n) — Paskal uchburchagining n-qatorini roʻyxat qilib qaytar. qator(0) = [1].",
      solution: "def qator(n):\n    a = [1]\n    for i in range(n):\n        yangi = [1]\n        for j in range(len(a) - 1):\n            yangi.append(a[j] + a[j + 1])\n        yangi.append(1)\n        a = yangi\n    return a",
      tail: "print(qator(int(input())))",
      tests: [["0"], ["1"], ["5"], ["8"]],
    },
    {
      id: "cuch",
      what: "c(n, k) — Paskal uchburchagidan foydalanib C(n, k) ni qaytar (qatorni qurib, k-sonini ol).",
      solution: "def c(n, k):\n    a = [1]\n    for i in range(n):\n        yangi = [1]\n        for j in range(len(a) - 1):\n            yangi.append(a[j] + a[j + 1])\n        yangi.append(1)\n        a = yangi\n    return a[k]",
      tail: "print(c(int(input()), int(input())))",
      tests: [["5", "2"], ["8", "0"], ["10", "5"], ["6", "6"]],
    },
  ];

  function writeTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const w = pick(WRITE, rnd);
      return { id: "yoz:" + w.id, tur: "yoz", type: "kod-yoz", what: w.what, solution: w.solution, tail: w.tail,
        tests: w.tests.map((stdin) => ({ stdin })) };
    }, prev, rr);
  }

  const api = { QATOR_SONI, JADVAL, katak, tepa, qatorYigindi, XOSSALAR, WRITE, qatorKod,
    katakTask, oqishTask, yigindiTask, kodTask, writeTask };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
