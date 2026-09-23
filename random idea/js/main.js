// Ekran: g'ildirak aylanishi va tugma. Sof mantiq data.js va generator.js'da (Node testlari bilan).
(function () {
  "use strict";

  const D = window.QK.data;
  const G = window.QK.generator;

  const serviceReelEl = document.getElementById("reel-service");
  const companyReelEl = document.getElementById("reel-company");
  const serviceWordEl = document.getElementById("reel-service-word");
  const companyWordEl = document.getElementById("reel-company-word");
  const spinBtn = document.getElementById("spin-btn");
  const resultEl = document.getElementById("result");

  const SERVICE_DURATION = 1700; // ms — xizmat g'ildiragi birinchi to'xtaydi (DIZAYN.md, 2-bo'lim)
  const COMPANY_DURATION = 2700; // ms — kompaniya g'ildiragi keyin to'xtaydi

  let prevService = null;
  let prevCompany = null;

  // G'ildirakni aylantiradi: har qadamda so'z tepadan kirib markazda to'xtaydi, eskisi
  // pastga tushib yo'qoladi (karasul uslubi), sekinlashib boradi, oxirida `finalValue`da to'xtaydi.
  function spinReel(reelEl, wordEl, list, durationMs, finalValue, onDone) {
    const startTime = performance.now();
    const baseHold = 70; // ms — so'z tinch turadigan boshlang'ich vaqt
    const transitionMs = 160; // css transition bilan bir xil (style.css)

    reelEl.classList.add("spinning");

    function step() {
      const elapsed = performance.now() - startTime;
      const isFinal = elapsed >= durationMs;
      const text = isFinal ? finalValue : list[Math.floor(Math.random() * list.length)];

      wordEl.classList.add("is-leaving");
      setTimeout(() => {
        wordEl.textContent = text;
        wordEl.classList.remove("is-leaving");
        wordEl.classList.add("is-entering");
        void wordEl.offsetWidth; // reflow majburlash — transition qaytadan ishga tushishi uchun
        wordEl.classList.remove("is-entering");

        if (isFinal) {
          reelEl.classList.remove("spinning");
          onDone();
          return;
        }
        const progress = elapsed / durationMs;
        const holdMs = baseHold + progress * 180; // sekinlashish
        setTimeout(step, holdMs);
      }, transitionMs);
    }

    step();
  }

  function onSpin() {
    spinBtn.disabled = true;
    resultEl.textContent = "";

    const nextService = G.pickService(prevService, Math.random);
    const nextCompany = G.pickCompany(prevCompany, Math.random);

    let doneCount = 0;
    function onReelDone() {
      doneCount += 1;
      if (doneCount < 2) return;
      prevService = nextService;
      prevCompany = nextCompany;
      resultEl.textContent = G.buildSentence(nextCompany, nextService);
      spinBtn.textContent = "Yana ayl";
      spinBtn.disabled = false;
    }

    spinReel(serviceReelEl, serviceWordEl, D.SERVICES, SERVICE_DURATION, nextService, onReelDone);
    spinReel(companyReelEl, companyWordEl, D.COMPANIES, COMPANY_DURATION, nextCompany, onReelDone);
  }

  spinBtn.addEventListener("click", onSpin);
})();
