// Masalani baholash: HAR BIR testni alohida bajaradi va foiz beradi.
// 4 ta testdan 3 tasi o'tsa — 75%. Masala "yechilgan" faqat 100% da hisoblanadi.
// Ekran bilan ishlamaydi, Node'da test qilinadi: tests/baho.test.js
(function (root) {
  "use strict";

  const node = typeof module !== "undefined" && module.exports;
  const K = node ? require("../../umumiy/js/kod.js") : root.QK.kod;

  const casesOf = (task) => (task.tests && task.tests.length ? task.tests : [{ stdin: task.stdin || [] }]);

  // Bitta test: kutilgan javob bankda yozilgan bo'lsa o'sha, bo'lmasa namunali yechimdan hisoblanadi
  function kutilgan(task, testCase) {
    if (testCase && testCase.out) return K.normalize(testCase.out);
    return K.expectedFor(task, testCase);
  }

  // Natija: har test uchun ✓/✗, qaysi biri yiqilgani va foiz.
  // Birinchi yiqilgan testning ma'lumoti ochiladi (bolaga yo'l ko'rsatish uchun),
  // qolganlari yopiq qoladi — aks holda javoblarni kodga yozib qo'yish mumkin bo'lardi.
  function baho(task, code) {
    const matn = String(code == null ? "" : code);
    if (!matn.trim()) {
      return { bosh: true, testlar: [], otgan: 0, jami: casesOf(task).length, foiz: 0, toliq: false };
    }
    const testlar = casesOf(task).map((testCase, k) => {
      const kutilganlar = kutilgan(task, testCase);
      const r = K.run(K.withTail(matn, task), testCase);
      const chiqqan = K.normalize(r.output);
      const ok = !r.error && K.sameOutput(kutilganlar, chiqqan);
      return {
        n: k + 1,
        ok,
        namuna: k === 0,
        error: r.error || null,
        kirish: (testCase && testCase.stdin) || [],
        kutilgan: kutilganlar,
        chiqqan,
      };
    });
    const otgan = testlar.filter((t) => t.ok).length;
    const jami = testlar.length;
    const birinchiYiqilgan = testlar.find((t) => !t.ok) || null;
    return {
      bosh: false,
      testlar,
      otgan,
      jami,
      foiz: jami ? Math.round((otgan / jami) * 100) : 0,
      toliq: jami > 0 && otgan === jami,
      birinchiYiqilgan,
    };
  }

  // Ekranda ko'rinadigan qisqa xulosa
  function xulosa(b) {
    if (b.bosh) return "Avval kodni yoz, keyin ishga tushir.";
    if (b.toliq) return `Hamma test oʻtdi — ${b.foiz}%`;
    return `${b.jami} ta testdan ${b.otgan} tasi oʻtdi — ${b.foiz}%`;
  }

  const api = { baho, xulosa, casesOf, kutilgan };

  if (node) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.baho = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
