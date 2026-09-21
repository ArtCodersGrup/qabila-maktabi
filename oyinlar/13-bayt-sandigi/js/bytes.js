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

  // 1-bosqich mashqi: bayt → bit yoki bit → bayt
  function makeBitTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const type = rng() < 0.5 ? "toBits" : "toBytes";
      const bytes = randInt(2, 9, rng);
      const task = { type, bytes, bits: bytes * 8, answer: type === "toBits" ? bytes * 8 : bytes };
      if (!same(prev, task)) return task;
    }
  }

  // 2-bosqich mashqi: xabar necha bayt yoki necha bit (bitda javob ≤ 96)
  function makeTextTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const type = rng() < 0.5 ? "bytes" : "bits";
      const list = type === "bits" ? MESSAGES.filter((m) => m.length <= 12) : MESSAGES;
      const message = pick(list, rng);
      const task = { type, message, answer: type === "bytes" ? message.length : message.length * 8 };
      if (!same(prev, task)) return task;
    }
  }

  // 3-bosqich mashqi: sahifalar → Kbayt, bayt → Kbayt, "qaysi katta?"
  function makeKbTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const r = rng();
      let task;
      if (r < 1 / 3) {
        const pages = randInt(2, 10, rng);
        task = { type: "pages", pages, answer: pages * 2 };
      } else if (r < 2 / 3) {
        const kb = randInt(2, 6, rng);
        task = { type: "toKb", bytes: kb * KB, answer: kb };
      } else {
        const kb = randInt(1, 5, rng);
        const bytes = 1000 * (kb + (rng() < 0.5 ? 0 : 1));
        task = { type: "compare", kb, bytes, answer: kb * KB > bytes ? "kb" : "bytes" };
      }
      if (!same(prev, task)) return task;
    }
  }

  const api = {
    KB, SETS, DEMO, MESSAGES,
    pow2, minBits, checkBits, charBits, doublings,
    makeBitTask, makeTextTask, makeKbTask,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.bytes = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
