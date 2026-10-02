// Bayt sandig'i — sof hisob: belgilar to'plamlari, eng kamida nechta bit, belgi kodi,
// xabarlar, ikkilantirish va topshiriqlar. Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const KB = 1024;

  // 1-bosqich: klaviatura belgilari qo'shilib boradi (DIZAYN 5.1)
  const SETS = [
    { name: "Kichik harflar", sample: "a b c … z", add: 26, total: 26 },
    { name: "Katta harflar", sample: "A B C … Z", add: 26, total: 52 },
    { name: "Raqamlar", sample: "0 1 2 … 9", add: 10, total: 62 },
    { name: "Tinish belgilari va boʻsh joy", sample: ". , ! ? + = …", add: 33, total: 95 },
  ];

  // 2-bosqich: xabarlar (faqat ASCII — o', g', ʻ yo'q; har belgi aynan 1 bayt)
  const DEMO = "SALOM, ALI!";
  const MESSAGES = [
    "SALOM!", "RAHMAT!", "YAXSHI!", "TEZ KEL!", "NON BOR.", "SUV ICH.",
    "ALI, KEL!", "KITOB OL.", "3 TA OLMA", "5 + 3 = 8", "OTA KELDI.", "KUN ISSIQ.",
    "DARS 8 DA.", "ONA, SALOM!", "MEN KELDIM.", "OLMA VA NOK", "OY VA QUYOSH",
    "BIZ BIRGAMIZ.", "BUGUN DARS BOR.", "MEN 10 YOSHDAMAN",
  ];

  const pow2 = (k) => 2 ** k;

  // N xil belgi uchun eng kamida nechta bit: 2^k >= N
  function minBits(n) {
    let k = 0;
    while (pow2(k) < n) k++;
    return k;
  }

  // Bola tanlagan bitlar: "few" — yetmaydi, "many" — ortiqcha, "ok" — aynan eng kami
  function checkBits(bits, need) {
    if (pow2(bits) < need) return "few";
    return bits > minBits(need) ? "many" : "ok";
  }

  // Belgining 8 bitli kodi: "A" → "01000001"
  const charBits = (ch) => ch.charCodeAt(0).toString(2).padStart(8, "0");

  // 3-bosqich: 1, 2, 4, … 1024 (10 marta ikkilantirish)
  const doublings = () => Array.from({ length: 11 }, (_, k) => pow2(k));

  const randInt = (a, b, rng) => a + Math.floor(rng() * (b - a + 1));
  const pick = (list, rng) => list[Math.floor(rng() * list.length)];
  const same = (a, b) => !!a && JSON.stringify(a) === JSON.stringify(b);

  // Qiyinlik zinasi (QOIDALAR 4.3): chegaralar tier 0 / 1 / 2 bo'yicha
  const BIT_BYTES = [[2, 6], [7, 12], [10, 15]]; // 1-bosqich: baytlar soni (tier 2 da faqat bit → bayt, javob ≤ 15)
  const TEXT_LEN = [[6, 9], [9, 12], [12, 16]]; // 2-bosqich: xabar uzunligi ("necha bit?" da ≤ 12 belgi — javob ≤ 96)
  const PAGES = [[2, 10], [8, 18], [15, 25]]; // 3-bosqich: sahifalar (javob ≤ 50 Kbayt)
  const TO_KB = [[2, 5], [4, 8], [6, 12]]; // 3-bosqich: bayt → Kbayt
  const CMP_KB = [[1, 3], [2, 6], [4, 9]]; // 3-bosqich: taqqoslashdagi Kbayt

  // 1-bosqich mashqi: bayt → bit yoki bit → bayt
  function makeBitTask(prev, rng, tier) {
    rng = rng || Math.random;
    tier = tier || 0;
    for (;;) {
      const type = tier === 2 ? "toBytes" : rng() < 0.5 ? "toBits" : "toBytes";
      const bytes = randInt(BIT_BYTES[tier][0], BIT_BYTES[tier][1], rng);
      const task = { type, bytes, bits: bytes * 8, answer: type === "toBits" ? bytes * 8 : bytes };
      if (!same(prev, task)) return task;
    }
  }

  // 2-bosqich mashqi: xabar necha bayt yoki necha bit (bitda javob ≤ 96)
  function makeTextTask(prev, rng, tier) {
    rng = rng || Math.random;
    tier = tier || 0;
    const [lo, hi] = TEXT_LEN[tier];
    for (;;) {
      const type = rng() < 0.5 ? "bytes" : "bits";
      const list = MESSAGES.filter((m) => (type === "bits"
        ? m.length >= Math.min(lo, 10) && m.length <= Math.min(hi, 12)
        : m.length >= lo && m.length <= hi));
      const message = pick(list, rng);
      const task = { type, message, answer: type === "bytes" ? message.length : message.length * 8 };
      if (!same(prev, task)) return task;
    }
  }

  // "Qaysi biri eng katta?" — uch karta (Kbayt, bayt, sahifa) va "Teng": 4 variant.
  // Baytdagi qiymatlar: Kbayt × 1024, bayt, sahifa × 2 × 1024. Yo bitta eng katta, yo uchalasi teng.
  const cmpSizes = (t) => ({ kb: t.kb * KB, bytes: t.bytes, pages: t.pages * 2 * KB });
  function cmpAnswer(t) {
    const v = cmpSizes(t);
    if (v.kb === v.bytes && v.kb === v.pages) return "teng";
    const max = Math.max(v.kb, v.bytes, v.pages);
    return ["kb", "bytes", "pages"].find((k) => v[k] === max);
  }
  const CMP_OPTIONS = ["kb", "bytes", "pages", "teng"];

  function makeCompareTask(rng, tier) {
    for (;;) {
      const kb = randInt(CMP_KB[tier][0], CMP_KB[tier][1], rng);
      let task;
      if (rng() < 0.2) {
        if (kb % 2) continue; // teng holat: k Kbayt = 1024·k bayt = k/2 sahifa
        task = { type: "compare", kb, bytes: kb * KB, pages: kb / 2 };
      } else {
        // 1000 ≠ 1024 tuzog'i: 1000·k bayt < k Kbayt < 1000·(k + 1) bayt
        const bytes = 1000 * (kb + (rng() < 0.5 ? 0 : 1));
        const pages = Math.floor((kb + pick([-2, -1, 1, 2], rng)) / 2);
        if (pages < 1) continue;
        task = { type: "compare", kb, bytes, pages };
      }
      const v = cmpSizes(task);
      const top = Math.max(v.kb, v.bytes, v.pages);
      const tops = [v.kb, v.bytes, v.pages].filter((x) => x === top).length;
      if (tops === 2) continue; // ikkitasi teng bo'lib eng katta — savol noaniq
      task.answer = cmpAnswer(task);
      return task;
    }
  }

  // 3-bosqich mashqi: sahifalar → Kbayt, bayt → Kbayt, "qaysi biri eng katta?"
  function makeKbTask(prev, rng, tier) {
    rng = rng || Math.random;
    tier = tier || 0;
    for (;;) {
      const r = rng();
      let task;
      if (r < 1 / 3) {
        const pages = randInt(PAGES[tier][0], PAGES[tier][1], rng);
        task = { type: "pages", pages, answer: pages * 2 };
      } else if (r < 2 / 3) {
        const kb = randInt(TO_KB[tier][0], TO_KB[tier][1], rng);
        task = { type: "toKb", bytes: kb * KB, answer: kb };
      } else {
        task = makeCompareTask(rng, tier);
      }
      if (!same(prev, task)) return task;
    }
  }

  const api = {
    KB, SETS, DEMO, MESSAGES,
    pow2, minBits, checkBits, charBits, doublings,
    makeBitTask, makeTextTask, makeKbTask,
    BIT_BYTES, TEXT_LEN, PAGES, TO_KB, CMP_KB, CMP_OPTIONS, cmpSizes, cmpAnswer,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.bytes = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
