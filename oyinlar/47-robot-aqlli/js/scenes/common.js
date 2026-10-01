// 47-o'yin: blok quruvchi va maydonlar (shu o'yinga xos).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, dastur: D, dasturUi: DU, practice, sound } = QK;
  const h = ui.h;

  const OQ = { right: "→", left: "←", up: "↑", down: "↓" };
  const YON_NOM = { right: "oʻng", left: "chap", up: "yuqori", down: "past" };
  const TAKROR_SON = [2, 3, 4, 5, 6];

  const box = (compact) => {
    ui.setCompact(compact !== false);
    ui.clearWork();
    ui.clearControl();
    const el = h("div", { class: "pbox" });
    ui.work().append(el);
    return el;
  };
  const note = (text) => h("div", { class: "rb-note", text });
  const answer = (text) => h("div", { class: "rb-answer", text });

  // Maydonlar yonma-yon: har biriga alohida robot boshqaruvi
  function maydonlar(host, level) {
    const joy = h("div", { class: "rb-maydonlar" });
    host.append(joy);
    return level.maydonlar.map((f, k) => {
      const katak = h("div", { class: "rb-maydon" });
      if (level.maydonlar.length > 1) katak.append(h("div", { class: "rb-maydon-nom", text: (k + 1) + "-maydon" }));
      joy.append(katak);
      return { f, view: DU.fieldView(katak, f), katak };
    });
  }

  // Blok quruvchi: bosish bilan qo'yiladi, bosish bilan o'chadi (sudrash yo'q — QOIDALAR §3)
  function quruvchi(host, level, onChange) {
    const dastur = [];
    let faol = dastur; // qaysi joyga qo'yiladi
    const el = h("div", { class: "rb-dastur" });
    host.append(el);

    const zona = (list, nom) => {
      const z = h("button", { class: "rb-zona" + (list === faol ? " faol" : ""), type: "button",
        text: list === faol ? "shu yerga qoʻyiladi" : (nom || "ichiga qoʻyish") });
      z.addEventListener("click", () => { faol = list; chiz(); });
      return z;
    };

    function blokEl(b, list, k) {
      if (b.t === "yur") {
        const el2 = h("button", { class: "rb-blok yur", type: "button", text: OQ[b.yon], "aria-label": YON_NOM[b.yon] + "ga yur" });
        el2.addEventListener("click", () => { list.splice(k, 1); chiz(); });
        return el2;
      }
      if (b.t === "takror") {
        const son = h("button", { class: "rb-son", type: "button", text: String(b.n), "aria-label": "necha marta" });
        son.addEventListener("click", () => {
          b.n = TAKROR_SON[(TAKROR_SON.indexOf(b.n) + 1) % TAKROR_SON.length];
          chiz();
        });
        const ochir = h("button", { class: "rb-ochir", type: "button", text: "×", "aria-label": "blokni oʻchirish" });
        ochir.addEventListener("click", () => { list.splice(k, 1); if (faol === b.ichi) faol = dastur; chiz(); });
        return h("div", { class: "rb-qamrov takror" },
          h("div", { class: "rb-sarlavha" }, h("span", { text: "takror" }), son, h("span", { text: "marta" }), ochir),
          h("div", { class: "rb-ichi" }, ...b.ichi.map((x, i) => blokEl(x, b.ichi, i)), zona(b.ichi)));
      }
      // agar
      const ochir = h("button", { class: "rb-ochir", type: "button", text: "×", "aria-label": "blokni oʻchirish" });
      ochir.addEventListener("click", () => {
        list.splice(k, 1);
        if (faol === b.ichi || faol === b.aks) faol = dastur;
        chiz();
      });
      const yonBtn = h("button", { class: "rb-son", type: "button", text: OQ[b.yon], "aria-label": "qaysi tomon" });
      yonBtn.addEventListener("click", () => {
        const bor = level.bloklar.filter((x) => OQ[x]);
        b.yon = bor[(bor.indexOf(b.yon) + 1) % bor.length];
        chiz();
      });
      return h("div", { class: "rb-qamrov agar" },
        h("div", { class: "rb-sarlavha" }, h("span", { text: "agar" }), yonBtn, h("span", { text: "boʻsh boʻlsa" }), ochir),
        h("div", { class: "rb-shox" },
          h("span", { class: "rb-shox-nom ha", text: "ha" }),
          h("div", { class: "rb-ichi" }, ...b.ichi.map((x, i) => blokEl(x, b.ichi, i)), zona(b.ichi))),
        h("div", { class: "rb-shox" },
          h("span", { class: "rb-shox-nom aks", text: "aks holda" }),
          h("div", { class: "rb-ichi" }, ...b.aks.map((x, i) => blokEl(x, b.aks, i)), zona(b.aks))));
    }

    function chiz() {
      el.innerHTML = "";
      el.append(h("div", { class: "rb-dastur-nom", text: "Dastur (" + L.soni(dastur) + " / " + level.maxBlok + " blok)" }));
      const asos = h("div", { class: "rb-ichi asos" }, ...dastur.map((b, i) => blokEl(b, dastur, i)), zona(dastur, "asosiy joy"));
      el.append(asos);
      if (onChange) onChange(dastur);
    }

    chiz();
    return {
      dastur,
      qosh(turi) {
        if (L.soni(dastur) >= level.maxBlok) { ui.toast("Bloklar chegarasiga yetding — ortiqchasini oʻchir."); return; }
        if (turi === "takror") faol.push(L.takror(3, []));
        else if (turi === "agar") faol.push(L.agar(level.bloklar.find((x) => OQ[x]) || "right", [], []));
        else faol.push(L.yur(turi));
        sound.play("tap");
        chiz();
      },
      tozala() { dastur.length = 0; faol = dastur; chiz(); },
      chiz,
    };
  }

  // Blok tugmalari (pastki qator)
  function pad(host, level, onPick) {
    const el = h("div", { class: "rb-pad" });
    for (const b of level.bloklar) {
      const nom = OQ[b] ? OQ[b] : b === "takror" ? "takror" : "agar";
      const btn = h("button", { class: "rb-pad-btn" + (OQ[b] ? " oq" : " qamrov"), type: "button", text: nom,
        "aria-label": OQ[b] ? YON_NOM[b] + "ga yur" : nom });
      btn.addEventListener("click", () => onPick(b));
      el.append(btn);
    }
    host.append(el);
    return el;
  }

  // Dasturni hamma maydonda ko'rsatib chiqish
  async function yurgiz(maydon, dastur) {
    const natijalar = [];
    for (const m of maydon) {
      const r = L.bajar(m.f, dastur);
      m.view.set(m.f.robot, true);
      m.view.clearTrail();
      await m.view.walk(r.path);
      m.view.trail(r.path);
      if (r.status !== "goal") m.view.mark(r.at, "retry");
      natijalar.push(r);
    }
    return natijalar;
  }

  const XATO = {
    wall: "toshga urildi",
    edge: "maydon chekkasiga urildi",
    end: "buyruqlar tugadi, gulxanga yetmadi",
    uzun: "juda uzoq yurdi — takror toʻxtamadi",
  };

  // Asosiy mashq: dastur qur, ishga tushir, hamma maydonda ishlasin
  function qurExercise(level) {
    let host = null;
    let qur = null;
    let maydon = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        host.append(note(level.matn));
        maydon = maydonlar(host, level);
        qur = quruvchi(host, level);
        pad(host, level, (t) => qur.qosh(t));
        // Tugmalar o'z joyida qoladi: xatodan keyin bola tuzatib, yana bosadi
        const yurBtn = ui.button("▶︎ Ishga tushir", async () => {
          if (!qur.dastur.length) { ui.toast("Avval dastur yigʻ."); return; }
          yurBtn.disabled = true;
          const natijalar = await yurgiz(maydon, qur.dastur);
          yurBtn.disabled = false;
          submit({ dastur: qur.dastur.slice(), natijalar });
        }, "big");
        ui.control().append(yurBtn, ui.button("Tozalash", () => qur.tozala(), "small"));
      },
      check: (value) => value.natijalar.every((n) => n.status === "goal"),
      hint(value) {
        const k = value.natijalar.findIndex((n) => n.status !== "goal");
        const r = value.natijalar[k];
        host.append(note("↻ " + (maydon.length > 1 ? (k + 1) + "-maydonda " : "") + XATO[r.status] + ". "
          + (maydon.length > 1 ? "Ikkala maydonda ham ishlashi uchun «agar» kerak." : "Yoʻlni qaytadan oʻyla.")));
      },
      solution() {
        host.append(answer("Namunali yechim:"));
        qur.tozala();
        for (const b of level.yechim) qur.dastur.push(JSON.parse(JSON.stringify(b)));
        qur.chiz();
        yurgiz(maydon, level.yechim);
      },
    });
  }

  QK.common = { box, note, answer, OQ, YON_NOM, maydonlar, quruvchi, pad, yurgiz, qurExercise, XATO };
})(window);
