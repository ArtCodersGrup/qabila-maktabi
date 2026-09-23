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

  // Bitta so'zni CSS animatsiyasi bilan ko'rsatadi (uzluksiz harakat — style.css'dagi
  // word-sweep/word-settle), tugagach `onEnd` chaqiriladi.
  function playWord(wordEl, text, animName, durationMs, onEnd) {
    wordEl.textContent = text;
    wordEl.style.animation = "none";
    void wordEl.offsetWidth; // reflow majburlash — animatsiya qaytadan boshlanishi uchun
    wordEl.style.animation = `${animName} ${durationMs}ms ease-in-out 1`;
    wordEl.style.animationFillMode = animName === "word-settle" ? "forwards" : "none";
    wordEl.addEventListener("animationend", function handler() {
      wordEl.removeEventListener("animationend", handler);
      onEnd();
    }, { once: true });
  }

  // G'ildirakni aylantiradi: har so'z tepadan kirib, markazdan pastga uzluksiz o'tib ketadi
  // (karasul uslubi), sekinlashib boradi, oxirida `finalValue`da markazda to'xtaydi.
  function spinReel(reelEl, wordEl, list, durationMs, finalValue, onDone) {
    const startTime = performance.now();

    reelEl.classList.add("spinning");

    function step() {
      const elapsed = performance.now() - startTime;
      if (elapsed >= durationMs) {
        playWord(wordEl, finalValue, "word-settle", 260, () => {
          reelEl.classList.remove("spinning");
          onDone();
        });
        return;
      }
      const progress = elapsed / durationMs;
      const cycleMs = 220 + progress * 260; // sekinlashish: 220ms dan 480ms gacha
      const word = list[Math.floor(Math.random() * list.length)];
      playWord(wordEl, word, "word-sweep", cycleMs, step);
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
