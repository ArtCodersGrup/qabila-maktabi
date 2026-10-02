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

  // Qiyinlik zinasi (QOIDALAR 4.3): 0 — birinchi javoblar, 1 — o'rta, 2 — oxirgi va qiyin rejim.
  // Zina berilmasa (testlar) — butun oraliq. Qator raqami zina bilan pastga tushadi (sonlar kattalashadi).
  const QATOR_ZINA = [[2, 5], [4, 7], [6, QATOR_SONI - 1]];
  const qatorOraliq = (tier, eng) => {
    if (tier == null) return [eng, QATOR_SONI - 1];
    const [a, b] = QATOR_ZINA[Math.max(0, Math.min(2, tier))];
    return [Math.max(a, eng), b];
  };

  // ---------- 1-bosqich: katakni to'ldirish ----------
  function katakTask(r, prev, tier) {
    const rr = r || Math.random;
    const [kam, kop] = qatorOraliq(tier, 2);
    return pickNew((rnd) => {
      const n = int(rnd, kam, kop);
      const k = int(rnd, 1, n - 1); // chekka emas: ikkala tepasi ham bor
      const [chap, ong] = tepa(n, k);
      return { id: "katak:" + n + ":" + k, tur: "katak", n, k, chap, ong, javob: katak(n, k),
        hisob: chap + " + " + ong + " = " + katak(n, k),
        nega: "Har katak — tepasidagi ikki sonning yigʻindisi." };
    }, prev, rr);
  }

  // ---------- 2-bosqich: uchburchakdan C ni o'qish va qator yig'indisi ----------
  // 2026-10-02: oxirgi zinada "ikki qoʻshni son yigʻindisi" — javob uchburchakda YOʻQ qatorda (n = 9 ham boʻlishi mumkin):
  // C(n, k) + C(n, k + 1) = C(n + 1, k + 1) — qurilish qoidasining oʻzi
  function qoshniTask(rnd) {
    const n = int(rnd, 5, QATOR_SONI - 1);
    const k = int(rnd, 1, n - 2);
    const javob = katak(n, k) + katak(n, k + 1);
    return { id: "qoshni:" + n + ":" + k, tur: "oqish", qoshni: true, n, k, javob,
      matn: "C(" + n + ", " + k + ") + C(" + n + ", " + (k + 1) + ") nechaga teng? Bu yigʻindi — keyingi qatordagi qaysi son?",
      hisob: katak(n, k) + " + " + katak(n, k + 1) + " = " + javob + " = C(" + (n + 1) + ", " + (k + 1) + ")",
      nega: "Ikki qoʻshni sonning yigʻindisi — ularning ostidagi katak. Uchburchak aynan shunday quriladi." };
  }

  function oqishTask(r, prev, tier) {
    const rr = r || Math.random;
    const [kam, kop] = qatorOraliq(tier, 4);
    return pickNew((rnd) => {
      if ((tier == null || tier >= 2) && rnd() < 0.35) return qoshniTask(rnd);
      const n = int(rnd, kam, kop);
      const k = int(rnd, 0, n);
      return { id: "oqish:" + n + ":" + k, tur: "oqish", n, k, javob: katak(n, k),
        matn: "C(" + n + ", " + k + ") — " + n + "-qatorning " + k + "-soni (0 dan sanaymiz). Nechaga teng?",
        hisob: "C(" + n + ", " + k + ") = " + katak(n, k),
        nega: "Qatorlar ham, sonlar ham 0 dan sanaladi. Uchburchakdan topib qara." };
    }, prev, rr);
  }

  function yigindiTask(r, prev, tier) {
    const rr = r || Math.random;
    const [kam, kop] = qatorOraliq(tier, 3);
    return pickNew((rnd) => {
      const n = int(rnd, kam, kop);
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

  function kodTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const n = tier == null ? int(rnd, 3, 7) : int(rnd, [3, 4, 5][Math.max(0, Math.min(2, tier))], [5, 6, 7][Math.max(0, Math.min(2, tier))]);
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
    // ---- 2026-10-02: uch yangi masala (zina 1–2) ----
    {
      id: "eng-katta", tier: 1,
      what: "eng_katta(n) — Paskal uchburchagining n-qatoridagi eng katta sonni qaytar (qatorni qurib, ichidan top). eng_katta(0) = 1.",
      solution: "def eng_katta(n):\n    a = [1]\n    for i in range(n):\n        yangi = [1]\n        for j in range(len(a) - 1):\n            yangi.append(a[j] + a[j + 1])\n        yangi.append(1)\n        a = yangi\n    return max(a)",
      tail: "print(eng_katta(int(input())))",
      tests: [["4"], ["5"], ["0"], ["8"], ["1"], ["10"]],
    },
    {
      id: "qaysi-qator", tier: 2,
      what: "qaysi_qator(s) — Paskal uchburchagida biror qatordagi sonlar yigʻindisi s ga teng (s — 2 ning darajasi). Bu nechanchi qator ekanini qaytar: qaysi_qator(1) = 0, qaysi_qator(32) = 5.",
      solution: "def qaysi_qator(s):\n    n = 0\n    while s > 1:\n        s = s // 2\n        n += 1\n    return n",
      tail: "print(qaysi_qator(int(input())))",
      tests: [["32"], ["1"], ["256"], ["2"], ["1024"], ["1048576"]],
    },
    {
      id: "uchburchak", tier: 2,
      what: "uchburchak(n) — Paskal uchburchagining 0 dan n gacha boʻlgan hamma qatorini chiqar: har qator alohida satrda, roʻyxat koʻrinishida ([1], [1, 1], [1, 2, 1] …). Funksiya hech nima qaytarmaydi — oʻzi print qiladi.",
      solution: "def uchburchak(n):\n    a = [1]\n    print(a)\n    for i in range(n):\n        yangi = [1]\n        for j in range(len(a) - 1):\n            yangi.append(a[j] + a[j + 1])\n        yangi.append(1)\n        a = yangi\n        print(a)",
      tail: "uchburchak(int(input()))",
      tests: [["3"], ["0"], ["1"], ["5"]],
    },
  ];

  function writeTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const w = tier == null ? pick(WRITE, rnd) : (() => {
        const t = Math.max(0, Math.min(2, tier));
        const mos = WRITE.filter((x) => (x.tier || 0) <= t);
        const ayni = mos.filter((x) => (x.tier || 0) === t);
        return ayni.length && rnd() < 0.6 ? pick(ayni, rnd) : pick(mos, rnd);
      })();
      return { id: "yoz:" + w.id, tur: "yoz", type: "kod-yoz", what: w.what, solution: w.solution, tail: w.tail,
        tests: w.tests.map((stdin) => ({ stdin })) };
    }, prev, rr);
  }

  const api = { QATOR_SONI, QATOR_ZINA, JADVAL, katak, tepa, qatorYigindi, XOSSALAR, WRITE, qatorKod,
    katakTask, oqishTask, yigindiTask, kodTask, writeTask };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
