// 8–11 yosh dasturlash bloki (62–65-o'yinlar) uchun umumiy ekran qismlari:
// blok quruvchi (funksiya maydonlari bilan), blok tugmalari, "qadam" qutisi, Python ko'rinishi, yurgizish va mashq.
// Mantiq: umumiy/js/blok.js. Maydon: umumiy/js/dastur-ui.js. Uslublar: umumiy/css/blok.css
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, blok: B, dasturUi: DU, practice } = QK;
  const h = ui.h;

  const TAKROR_SON = [2, 3, 4, 5, 6, 7, 8, 9];
  const QAMROV = { takror: 1, agar: 1, toki: 1, gulxangacha: 1, takrorQadam: 1 };
  // Funksiya tanasida ishlatilmaydi: chaqiruv (rekursiya bo'lmasin) va hisoblagich (Python'da lokal o'zgaruvchi)
  const FN_ICHIDA_YOQ = { yulduz: 1, doira: 1, qoy: 1, qosh: 1, takrorQadam: 1 };

  const PAD_NOM = {
    takror: "takror", agar: "agar", toki: "… boʻsh ekan", gulxangacha: "gulxangacha",
    yulduz: "★", doira: "●", qoy: "qadam = 0", qosh: "qadam + 1", takrorQadam: "takror qadam",
  };
  const PAD_ARIA = {
    takror: "takror", agar: "agar", toki: "boʻsh ekan takrorla", gulxangacha: "gulxanga yetguncha takrorla",
    yulduz: "yulduz buyrugʻi", doira: "doira buyrugʻi", qoy: "qadamni nolga qoʻy", qosh: "qadamga bir qoʻsh",
    takrorQadam: "qadam marta takrorla",
  };

  // ---------- Ish maydoni ----------
  const box = (compact) => {
    ui.setCompact(compact !== false);
    ui.clearWork();
    ui.clearControl();
    const el = h("div", { class: "bk-box" });
    ui.work().append(el);
    return el;
  };
  const note = (text) => h("div", { class: "bk-note", text });
  const answer = (text) => h("div", { class: "bk-answer", text });

  // Maydonlar yonma-yon (bir nechta bo'lsa — nomi bilan)
  function maydonlar(host, list) {
    const joy = h("div", { class: "bk-maydonlar" });
    host.append(joy);
    return list.map((f, k) => {
      const katak = h("div", { class: "bk-maydon" });
      if (list.length > 1) katak.append(h("div", { class: "bk-maydon-nom", text: (k + 1) + "-maydon" }));
      joy.append(katak);
      return { f, view: DU.fieldView(katak, f), katak };
    });
  }

  // ---------- "qadam" qutisi ----------
  function quti(host) {
    const son = h("span", { class: "bk-quti-son", text: "–" });
    const el = h("div", { class: "bk-quti", "aria-live": "polite" }, h("span", { class: "bk-quti-nom", text: "qadam" }), son);
    host.append(el);
    return {
      el,
      set(v) {
        son.textContent = v == null ? "–" : String(v);
        son.classList.remove("yangi");
        void son.offsetWidth; // animatsiya qaytadan boshlansin
        son.classList.add("yangi");
      },
    };
  }

  // ---------- Blok quruvchi ----------
  // opts: { bloklar, maxBlok, fn: { yulduz: [...] }, qulf: ["yulduz"], dastur, onChange(dastur, fn) }
  // Blok bosilsa — faol joyga qo'shiladi; qo'yilgan blok bosilsa — o'chadi (sudrash yo'q — QOIDALAR §3).
  function quruvchi(host, opts) {
    const o = opts || {};
    const dastur = o.dastur ? B.nusxa(o.dastur) : [];
    const fn = {};
    for (const nom of Object.keys(o.fn || {})) fn[nom] = B.nusxa(o.fn[nom]);
    const qulf = new Set(o.qulf || []);
    const yonlar = (o.bloklar || []).filter((x) => B.OQ[x]);
    const yonRoyxat = yonlar.length ? yonlar : B.YONLAR;
    let faol = dastur;
    let qulflangan = false;
    const el = h("div", { class: "bk-dastur" });
    host.append(el);

    const fnRoyxatmi = (list) => Object.keys(fn).some((nom) => fn[nom] === list);
    const qulfdami = (list) => qulflangan || Object.keys(fn).some((nom) => fn[nom] === list && qulf.has(nom));

    const zona = (list, nom) => {
      const z = h("button", { class: "bk-zona" + (list === faol ? " faol" : ""), type: "button",
        text: list === faol ? "shu yerga qoʻyiladi" : (nom || "ichiga qoʻyish") });
      z.addEventListener("click", () => { faol = list; chiz(); });
      return z;
    };

    const ochirBtn = (fnc) => {
      const b = h("button", { class: "bk-ochir", type: "button", text: "×", "aria-label": "blokni oʻchirish" });
      b.addEventListener("click", fnc);
      return b;
    };

    // Ro'yxat ichidagi biror qism faol bo'lsa (o'chirilgan blok ichida) — faolni asosiy joyga qaytarish
    function ichidami(b, list) {
      if (b.ichi === list || b.aks === list) return true;
      return (b.ichi || []).some((x) => ichidami(x, list)) || (b.aks || []).some((x) => ichidami(x, list));
    }

    function blokEl(b, list, k, yopiq) {
      const ochir = () => {
        if (yopiq) return;
        if (ichidami(b, faol)) faol = dastur;
        list.splice(k, 1);
        sound.play("tap");
        chiz();
      };
      const ichiEl = (bolalar) => h("div", { class: "bk-ichi" },
        ...bolalar.map((x, i) => blokEl(x, bolalar, i, yopiq)), yopiq ? null : zona(bolalar));
      if (b.t === "yur" || b.t === "chaqir" || b.t === "qoy" || b.t === "qosh") {
        const matn = b.t === "yur" ? B.OQ[b.yon] : b.t === "chaqir" ? B.FN_BELGI[b.nom] : b.t === "qoy" ? "qadam = 0" : "qadam + 1";
        const aria = b.t === "yur" ? B.YON_NOM[b.yon] + "ga yur" : PAD_ARIA[b.t === "chaqir" ? b.nom : b.t];
        const cls = b.t === "yur" ? "yur" : b.t === "chaqir" ? "chaqir " + b.nom : "hisob";
        const e = h("button", { class: "bk-blok " + cls, type: "button", text: matn, "aria-label": aria, disabled: yopiq || null });
        e.addEventListener("click", ochir);
        return e;
      }
      const sarlavha = h("div", { class: "bk-sarlavha" });
      const sonBtn = (text, aria, onClick) => {
        const s = h("button", { class: "bk-son", type: "button", text, "aria-label": aria, disabled: yopiq || null });
        s.addEventListener("click", () => { if (yopiq) return; sound.play("tap"); onClick(); chiz(); });
        return s;
      };
      const yonAlmashtir = () => { b.yon = yonRoyxat[(yonRoyxat.indexOf(b.yon) + 1) % yonRoyxat.length]; };
      if (b.t === "takror") {
        if (b.n === "qadam") sarlavha.append(h("span", { text: "takror" }), h("span", { class: "bk-qadam", text: "qadam" }), h("span", { text: "marta" }));
        else sarlavha.append(h("span", { text: "takror" }),
          sonBtn(String(b.n), "necha marta", () => { b.n = TAKROR_SON[(TAKROR_SON.indexOf(b.n) + 1) % TAKROR_SON.length]; }),
          h("span", { text: "marta" }));
      } else if (b.t === "agar") {
        sarlavha.append(h("span", { text: "agar" }), sonBtn(B.OQ[b.yon], "qaysi tomon", yonAlmashtir), h("span", { text: "boʻsh boʻlsa" }));
      } else if (b.t === "toki") {
        sarlavha.append(sonBtn(B.OQ[b.yon], "qaysi tomon", yonAlmashtir), h("span", { text: "boʻsh ekan takrorla" }));
      } else if (b.t === "gulxangacha") {
        sarlavha.append(h("span", { text: "gulxanga yetguncha takrorla" }));
      }
      if (!yopiq) sarlavha.append(ochirBtn(ochir));
      const qamrov = h("div", { class: "bk-qamrov " + b.t }, sarlavha);
      if (b.t === "agar") {
        qamrov.append(
          h("div", { class: "bk-shox" }, h("span", { class: "bk-shox-nom ha", text: "ha" }), ichiEl(b.ichi)),
          h("div", { class: "bk-shox" }, h("span", { class: "bk-shox-nom aks", text: "aks holda" }), ichiEl(b.aks)));
      } else qamrov.append(ichiEl(b.ichi));
      return qamrov;
    }

    function chiz() {
      el.innerHTML = "";
      const soni = B.soni(dastur, fn);
      for (const nom of B.FN_NOMLAR) {
        if (!fn[nom]) continue;
        const yopiq = qulfdami(fn[nom]);
        el.append(h("div", { class: "bk-fn " + nom + (yopiq ? " qulf" : "") },
          h("div", { class: "bk-fn-nom" }, h("span", { class: "bk-fn-belgi", text: B.FN_BELGI[nom] }),
            h("span", { text: yopiq ? "buyrugʻi (tayyor)" : "buyrugʻi — ichini yigʻ" })),
          h("div", { class: "bk-ichi asos" }, ...fn[nom].map((b, i) => blokEl(b, fn[nom], i, yopiq)),
            yopiq ? null : zona(fn[nom], "ichiga qoʻyish"))));
      }
      el.append(h("div", { class: "bk-dastur-nom", text: "Dastur" + (o.maxBlok ? " (" + soni + " / " + o.maxBlok + " blok)" : "") }));
      el.append(h("div", { class: "bk-ichi asos" }, ...dastur.map((b, i) => blokEl(b, dastur, i, qulflangan)),
        qulflangan ? null : zona(dastur, "asosiy joy")));
      if (o.onChange) o.onChange(dastur, fn);
    }

    chiz();
    const api = {
      el, dastur, fn,
      soni: () => B.soni(dastur, fn),
      qosh(turi) {
        if (qulflangan) return;
        if (o.maxBlok && B.soni(dastur, fn) >= o.maxBlok) { ui.toast("Bloklar chegarasiga yetding — ortiqchasini oʻchir."); return; }
        if (fnRoyxatmi(faol) && FN_ICHIDA_YOQ[turi]) { ui.toast("Bu blok buyruq ichiga qoʻyilmaydi — asosiy dasturga qoʻy."); return; }
        const yon = yonRoyxat[0];
        let b;
        if (B.OQ[turi]) b = B.yur(turi);
        else if (turi === "takror") b = B.takror(3, []);
        else if (turi === "takrorQadam") b = B.takror("qadam", []);
        else if (turi === "agar") b = B.agar(yon, [], []);
        else if (turi === "toki") b = B.toki(yon, []);
        else if (turi === "gulxangacha") b = B.gulxangacha([]);
        else if (turi === "yulduz" || turi === "doira") b = B.chaqir(turi);
        else if (turi === "qoy") b = B.qoy(0);
        else if (turi === "qosh") b = B.qosh();
        if (!b) return;
        faol.push(b);
        if (QAMROV[turi]) faol = b.ichi; // yangi qamrovning ichi faol bo'ladi — bola darrov ichiga qo'yadi
        sound.play("tap");
        chiz();
      },
      // Tayyor dastur qo'yish (ko'rsatuv, yechim)
      qoy(yangi, yangiFn) {
        dastur.length = 0;
        dastur.push(...B.nusxa(yangi));
        for (const nom of Object.keys(yangiFn || {})) {
          if (!fn[nom]) fn[nom] = [];
          fn[nom].length = 0;
          fn[nom].push(...B.nusxa(yangiFn[nom]));
        }
        faol = dastur;
        chiz();
      },
      tozala() {
        dastur.length = 0;
        for (const nom of Object.keys(fn)) if (!qulf.has(nom)) fn[nom].length = 0;
        faol = dastur;
        chiz();
      },
      qulfla(on) { qulflangan = on !== false; chiz(); },
      chiz,
    };
    QK.quruvchi = api; // tekshirish uchun (avtomatik o'ynash skripti yechimni shu orqali qo'yadi)
    return api;
  }

  // ---------- Blok tugmalari (pastki qator) ----------
  function pad(host, bloklar, onPick) {
    const el = h("div", { class: "bk-pad" });
    for (const b of bloklar) {
      const oq = !!B.OQ[b];
      const btn = h("button", {
        class: "bk-pad-btn" + (oq ? " oq" : b === "yulduz" || b === "doira" ? " fn " + b : " qamrov"),
        type: "button", text: oq ? B.OQ[b] : PAD_NOM[b], "aria-label": oq ? B.YON_NOM[b] + "ga yur" : PAD_ARIA[b],
      });
      btn.addEventListener("click", () => onPick(b));
      el.append(btn);
    }
    host.append(el);
    return el;
  }

  // ---------- Python ko'rinishi ----------
  // opts: { tahrir(t) } — tahrir qismlari tugma bo'ladi (t = { blok, maydon }); belgila(k) — qatorni yoritish
  function pythonKod(host, opts) {
    const o = opts || {};
    const el = h("div", { class: "bk-kod", role: "group", "aria-label": "Python matni" });
    host.append(el);
    let qatorlar = [];
    const api = {
      el,
      chiz(dastur, fn) {
        qatorlar = B.pythonQatorlar(dastur, fn);
        el.innerHTML = "";
        qatorlar.forEach((q, k) => {
          const row = h("div", { class: "bk-kod-qator", "data-k": String(k) },
            h("span", { class: "bk-kod-raqam", text: String(k + 1) }),
            h("span", { class: "bk-kod-otstup", text: "    ".repeat(q.chuqur) }));
          for (const qism of q.qismlar) {
            if (typeof qism === "string") { row.append(h("span", { text: qism })); continue; }
            if (o.tahrir && qism.tahrir) {
              const b = h("button", { class: "bk-kod-tahrir", type: "button", text: qism.m, "aria-label": "almashtirish: " + qism.m });
              b.addEventListener("click", () => { sound.play("tap"); o.tahrir(qism.tahrir); });
              row.append(b);
            } else row.append(h("span", { class: "bk-kod-soz", text: qism.m }));
          }
          el.append(row);
        });
        return qatorlar;
      },
      belgila(k, cls) {
        [...el.children].forEach((r, i) => r.classList.toggle(cls || "belgi", i === k));
      },
      qatorlar: () => qatorlar,
    };
    return api;
  }

  // Tahrir qismini keyingi qiymatga o'tkazish (65-o'yin): son 2..9, yo'nalish 4 tomonga aylanadi
  function tahrirla(t) {
    const b = t.blok;
    if (t.maydon === "n") b.n = TAKROR_SON[(TAKROR_SON.indexOf(b.n) + 1) % TAKROR_SON.length];
    else if (t.maydon === "yon") b.yon = B.YONLAR[(B.YONLAR.indexOf(b.yon) + 1) % B.YONLAR.length];
  }

  // ---------- Yurgizish ----------
  // Har maydonda navbat bilan: robot boshiga, iz bo'yicha yuradi, "qadam" qutisi yangilanadi; to'xtagan joyda ↻
  async function yurgiz(maydon, dastur, fn, qutiApi) {
    const natijalar = [];
    for (const m of maydon) {
      const r = B.bajar(m.f, dastur, { fn });
      m.view.set(m.f.robot, true);
      m.view.clearTrail();
      m.view.clearMarks();
      if (qutiApi) qutiApi.set(null);
      const tez = r.iz.length > 40 ? 110 : 300;
      for (const e of r.iz) {
        if (!m.view.el.isConnected) return natijalar; // keyingi vazifa ochildi — eski animatsiya to'xtaydi
        if (e.tur === "yur") {
          m.view.set(e.at);
          sound.play("tak");
          await ui.sleep(tez);
        } else if (qutiApi) {
          qutiApi.set(e.qiymat);
          await ui.sleep(tez === 300 ? 260 : 80);
        }
      }
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
    uzun: "takror toʻxtamadi — ichida yurish yoʻq yoki yoʻl tugamaydi",
  };

  // ---------- Asosiy mashq: dastur qur, ishga tushir, hamma maydonda ishlasin ----------
  // level: { matn, maydonlar, bloklar, maxBlok, yechim, fn?, qulf?, yechimFn?, quti?, maslahat? }
  function qurExercise(level) {
    let host = null;
    let qur = null;
    let maydon = null;
    let q = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        host.append(note(level.matn));
        maydon = maydonlar(host, level.maydonlar);
        if (level.quti) q = quti(host);
        qur = quruvchi(host, { bloklar: level.bloklar, maxBlok: level.maxBlok, fn: level.fn, qulf: level.qulf });
        pad(host, level.bloklar, (t) => qur.qosh(t));
        // Tugmalar o'z joyida qoladi: xatodan keyin bola tuzatib, yana bosadi
        const yurBtn = ui.button("▶︎ Ishga tushir", async () => {
          if (!qur.dastur.length) { ui.toast("Avval dastur yigʻ."); return; }
          yurBtn.disabled = true;
          const natijalar = await yurgiz(maydon, qur.dastur, qur.fn, q);
          yurBtn.disabled = false;
          submit({ dastur: B.nusxa(qur.dastur), fn: B.nusxa(qur.fn), natijalar });
        }, "big");
        ui.control().append(yurBtn, ui.button("Tozalash", () => qur.tozala(), "small"));
      },
      check: (value) => value.natijalar.every((n) => n.status === "goal"),
      hint(value) {
        const k = value.natijalar.findIndex((n) => n.status !== "goal");
        const r = value.natijalar[k];
        host.append(note("↻ " + (maydon.length > 1 ? (k + 1) + "-maydonda " : "") + XATO[r.status] + ". "
          + (level.maslahat || "Robot qayerda yoʻldan chiqqanini kuzat va oʻsha joyni tuzat.")));
      },
      solution() {
        host.append(answer("Namunali yechim:"));
        qur.qoy(level.yechim, level.yechimFn || {});
        yurgiz(maydon, level.yechim, level.yechimFn || level.fn, q);
      },
    });
  }

  QK.blokUi = { TAKROR_SON, PAD_NOM, box, note, answer, maydonlar, quti, quruvchi, pad, pythonKod, tahrirla, yurgiz, XATO, qurExercise };
})(window);
