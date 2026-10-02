// Masalani baholash: HAR BIR testni alohida bajaradi va foiz beradi.
// 4 ta testdan 3 tasi o'tsa — 75%. Masala "yechilgan" faqat 100% da hisoblanadi.
// Ekran bilan ishlamaydi, Node'da test qilinadi: tests/baho.test.js
(function (root) {
  "use strict";

  const node = typeof module !== "undefined" && module.exports;
  const K = node ? require("../../umumiy/js/kod.js") : root.QK.kod;
  // C++ dvigateli: bola masalani ikki tilda yechishi mumkin. Kutilgan javob ikkalasida ham
  // bir xil — u bankdagi Python yechimidan hisoblanadi (yoki testda yozilgan bo'ladi).
  const CPP = () => (node ? require("../../umumiy/js/cpp/cpp-run.js") : root.QK.cpp);

  // Bitta masalada eng ko'pi bilan nechta YASHIRIN testning kirishi va kutilgan javobi ochiladi.
  // Ochilganlar eslab qolinadi (holat.js): bola ularni kodga qotirib yozsa ham, keyingi testlar ochilmaydi.
  const OCHIQ_SONI = 2;

  const casesOf = (task) => (task.tests && task.tests.length ? task.tests : [{ stdin: task.stdin || [] }]);

  // Bitta test: kutilgan javob bankda yozilgan bo'lsa o'sha, bo'lmasa namunali yechimdan hisoblanadi
  function kutilgan(task, testCase) {
    if (testCase && testCase.out) return K.normalize(testCase.out);
    return K.expectedFor(task, testCase);
  }

  // Xato qadam chegarasiga urilgani uchunmi (dastur to'g'ri bo'lishi mumkin, lekin sekin)
  const sekinmi = (error) => !!error && (
    (error.type === "Limit" && /qadam/.test(error.message || "")) || /too many steps/.test(error.cppMessage || ""));

  // Natija: har test uchun ✓/✗ va foiz.
  // Yiqilgan testning ma'lumoti (kirish, kutilgan, chiqqan) faqat "ochiq" testda bo'ladi:
  //   • namuna (1-test) — u masala shartida baribir ko'rinib turibdi;
  //   • bola yiqilgan dastlabki OCHIQ_SONI ta yashirin test — `ochilgan` ro'yxati bilan eslab qolinadi.
  // Qolgan yashirin testlar yopiq: faqat ✓/✗ va hukm (noto'g'ri javob / xato / sekin). Aks holda
  // har urinishda yangi testning javobi ochilib, hammasini `if` bilan kodga yozib qo'yish mumkin bo'lardi.
  //   ochilgan — shu masalada ilgari ochilgan test raqamlari (ixtiyoriy); natijada yangilangan ro'yxat qaytadi.
  function baho(task, code, til, ochilgan) {
    const matn = String(code == null ? "" : code);
    const cpp = til === "cpp";
    const eski = (Array.isArray(ochilgan) ? ochilgan : []).filter((n) => Number.isInteger(n) && n > 1).slice(0, OCHIQ_SONI);
    if (!matn.trim()) {
      return { bosh: true, testlar: [], otgan: 0, jami: casesOf(task).length, foiz: 0, toliq: false, ochilgan: eski };
    }
    const yangi = eski.slice();
    const testlar = casesOf(task).map((testCase, k) => {
      const kutilganlar = kutilgan(task, testCase);
      // task.qadam — masalaga xos qadam chegarasi (samaradorlik sinovi: O(n²) yechim shu chegaraga uriladi)
      const limits = task.qadam ? { maxSteps: task.qadam } : null;
      const r = cpp
        ? CPP().run(matn, Object.assign({ stdin: (testCase && testCase.stdin) || [] }, limits || {}))
        : K.run(K.withTail(matn, task), testCase, limits);
      const chiqqan = K.normalize(r.output);
      const ok = !r.error && K.sameOutput(kutilganlar, chiqqan);
      const n = k + 1;
      const namuna = k === 0;
      let ochiq = false;
      if (!ok) {
        if (namuna || yangi.includes(n)) ochiq = true;
        else if (yangi.length < OCHIQ_SONI) { yangi.push(n); ochiq = true; }
      }
      return {
        n,
        ok,
        namuna,
        ochiq,
        error: r.error || null,
        sekin: sekinmi(r.error),
        kirish: ochiq ? (testCase && testCase.stdin) || [] : null,
        kutilgan: ochiq ? kutilganlar : null,
        chiqqan: ochiq ? chiqqan : null,
      };
    });
    const otgan = testlar.filter((t) => t.ok).length;
    const jami = testlar.length;
    const yiqilgan = testlar.filter((t) => !t.ok);
    return {
      bosh: false,
      testlar,
      otgan,
      jami,
      foiz: jami ? Math.round((otgan / jami) * 100) : 0,
      toliq: jami > 0 && otgan === jami,
      birinchiYiqilgan: yiqilgan[0] || null,
      ochiqYiqilgan: yiqilgan.filter((t) => t.ochiq),
      yopiqYiqilgan: yiqilgan.filter((t) => !t.ochiq),
      ochilgan: yangi,
    };
  }

  // Ekranda ko'rinadigan qisqa xulosa
  function xulosa(b) {
    if (b.bosh) return "Avval kodni yoz, keyin ishga tushir.";
    if (b.toliq) return `Hamma test oʻtdi — ${b.foiz}%`;
    return `${b.jami} ta testdan ${b.otgan} tasi oʻtdi — ${b.foiz}%`;
  }

  // Yopiq testning hukmi: javob ochilmaydi, lekin NEGA yiqilgani aytiladi (olimpiadadagi kabi)
  function hukm(t) {
    if (t.ok) return "oʻtdi";
    if (t.sekin) return "juda sekin";
    if (t.error) return "xato berdi";
    return "javob notoʻgʻri";
  }

  const api = { OCHIQ_SONI, baho, xulosa, hukm, casesOf, kutilgan };

  if (node) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.baho = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
