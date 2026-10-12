// 73-o‘yin: shu o‘yinga xos ekran qismlari (holatlar jadvali, halqalar, katakli rasm) va mashq ekranlari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, practice } = QK;
  const h = ui.h;

  // ---------- Mashq qutisi ----------
  function box(compact) {
    ui.setCompact(compact !== false);
    ui.clearWork();
    ui.clearControl();
    const el = h("div", { class: "pbox" });
    ui.work().append(el);
    return el;
  }

  const note = (text) => h("div", { class: "note", text });
  const answer = (text) => h("div", { class: "answer", text });
  const savol = (text) => h("div", { class: "ao-savol", text });
  const matnKarta = (text) => h("div", { class: "ao-karta", text });

  // Ta‘riflar ro‘yxati (nomlash paneli)
  function formula(el, lines) {
    const f = h("div", { class: "ao-formula" });
    lines.forEach((line) => f.append(h("div", { text: line })));
    el.append(f);
    return f;
  }

  // ---------- Holatlar jadvali: qiymat + haqiqiy holat ----------
  // o.n berilsa — qoida hukmi ham ko‘rsatiladi: ✓ mos, ✗ mos emas
  function jadval(qatorlar, sohaKalit, opts) {
    const o = opts || {};
    const soha = L.SOHALAR.find((s) => s.k === sohaKalit);
    const el = h("div", { class: "ao-jadval", role: "list", "aria-label": `${soha.nom}: qiymat (${soha.ustun}) va haqiqiy holat` });
    qatorlar.forEach((q) => {
      const katak = h("div", { class: "ao-qator" + (q.asl ? " ha" : ""), role: "listitem" },
        h("span", { class: "ao-qiymat", text: `${q.qiymat} ${soha.ustun}` }),
        h("span", { class: "ao-asl", text: q.asl ? soha.ha : soha.yoq }));
      if (o.n != null) {
        const mos = (q.qiymat > o.n) === q.asl;
        katak.classList.add(mos ? "mos" : "nomos");
        katak.append(h("span", { class: "ao-hukm", text: mos ? "✓" : "✗", "aria-label": mos ? "qoida toʻgʻri" : "qoida xato" }));
      }
      el.append(katak);
    });
    return el;
  }

  // ---------- Ichma-ich halqalar: oddiy dastur ⊃ AI ⊃ ML ⊃ DL ----------
  // Halqa sarlavhasi — tugma; halqaning o‘z maydoni ham bosiladi. onPick(zona)
  const HALQA_NOMI = {
    oddiy: "Oddiy dastur — AI emas",
    ai: "AI — sunʼiy intellekt",
    ml: "ML — mashinali oʻrganish",
    dl: "DL — chuqur oʻrganish",
  };
  function halqalar(onPick) {
    let ichki = null;
    let tashqi = null;
    const qismlar = {};
    L.ZONALAR.slice().reverse().forEach((z) => {
      const qism = h("div", { class: "ao-ichida" });
      const halqa = h("div", { class: "ao-halqa z-" + z, "data-z": z },
        h("button", { class: "ao-halqa-nom", type: "button", text: HALQA_NOMI[z] }), qism, ichki);
      qismlar[z] = qism;
      ichki = halqa;
      tashqi = halqa;
    });
    tashqi.classList.add("ao-halqalar");
    if (onPick) {
      tashqi.addEventListener("click", (e) => {
        const z = e.target.closest("[data-z]");
        if (z) onPick(z.getAttribute("data-z"));
      });
    } else {
      tashqi.querySelectorAll("button").forEach((b) => { b.disabled = true; });
    }
    return {
      el: tashqi,
      // Halqa ichiga yorliq qo‘shish (ko‘rsatish sahnasi)
      qosh(z, text) { qismlar[z].append(h("span", { class: "ao-chip", text })); },
      belgila(z) { tashqi.querySelectorAll("[data-z]").forEach((x) => x.classList.toggle("togri", x.getAttribute("data-z") === z)); },
    };
  }

  // ---------- Katakli rasm ----------
  // o.maska — segmentatsiya ko‘rinishi; o.ramkalar — [{ ramka, sinf }]; o.kichik — variant ichida;
  // o.onCell(r, c, katak) — kataklar tugma bo‘ladi; o.yorliqsiz — ramka ustida yozuv yo‘q
  function rasm(rasmi, opts) {
    const o = opts || {};
    const n = rasmi.n;
    const sinf = {};
    rasmi.obyektlar.forEach((ob) => ob.kataklar.forEach((q) => { sinf[q[0] * n + q[1]] = ob.sinf; }));
    const tor = h("div", { class: "ao-tor" + (o.maska ? " maska" : ""), style: `grid-template-columns: repeat(${n}, 1fr)` });
    const kataklar = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const s = sinf[r * n + c];
        const katak = h(o.onCell ? "button" : "div", {
          class: "ao-katak" + (s ? " s-" + s : ""),
          type: o.onCell ? "button" : null,
          "aria-label": o.onCell ? `${r + 1}-qator, ${c + 1}-ustun` + (s ? `: ${s}` : "") : null,
          text: s && !o.maska ? L.belgi(s) : "",
        });
        if (o.onCell) katak.addEventListener("click", () => o.onCell(r, c, katak));
        kataklar.push(katak);
        tor.append(katak);
      }
    }
    const qobiq = h("div", { class: "ao-rasm" + (o.kichik ? " kichik" : "") }, tor);
    const chiz = (b, s, cls) => {
      const el = h("div", {
        class: "ao-ramka" + (s ? " s-" + s : "") + (cls ? " " + cls : ""),
        style: `left:${(b.c0 / n) * 100}%;top:${(b.r0 / n) * 100}%;width:${((b.c1 - b.c0 + 1) / n) * 100}%;height:${((b.r1 - b.r0 + 1) / n) * 100}%`,
      });
      if (s && !o.yorliqsiz) el.append(h("span", { class: "ao-yorliq", text: o.kichik ? L.belgi(s) : s }));
      tor.append(el);
      return el;
    };
    (o.ramkalar || []).forEach((x) => chiz(x.ramka, x.sinf));
    return { el: qobiq, katak: (r, c) => kataklar[r * n + c], chiz };
  }

  // Belgilar izohi: ● mashina ▲ odam ■ daraxt
  const izoh = (sinflar) => h("div", { class: "ao-izoh" },
    ...(sinflar || L.SINFLAR.map((s) => s.k)).map((k) => h("span", { class: "ao-izoh-bir s-" + k }, h("b", { text: L.belgi(k) }), h("span", { text: " " + k }))));

  // Natija ko‘rinishi (mosla savoli va ko‘rsatish): asl | tasnif | topish | segment
  function natija(rasmi, tur, kichik) {
    const ob = rasmi.obyektlar;
    const r = rasm(rasmi, {
      kichik,
      maska: tur === "segment",
      ramkalar: tur === "topish" ? ob.map((x) => ({ ramka: x.ramka, sinf: x.sinf })) : [],
    });
    const el = h("div", { class: "ao-natija" }, r.el);
    if (tur === "tasnif") el.append(h("span", { class: "ao-chip yorliq", text: ob[0].sinf }));
    return el;
  }

  // ---------- Mashq ekranlari ----------
  function sonExercise(task, opts) {
    const o = opts || {};
    const host = box(true);
    host.append(savol(task.matn));
    if (o.oldin) o.oldin(host);
    return practice.numberTries({
      answer: task.javob,
      maxLen: String(task.javob).length + 1,
      hint() { host.append(note("↻ " + task.nega)); },
      solution() {
        host.append(answer(task.hisob));
        if (o.yechim) o.yechim(host);
      },
    });
  }

  // Variantlardan tanlash; o.javoblar(submit) — o‘z javob maydoni (halqalar, kichik rasmlar)
  function tanlovExercise(task, opts) {
    const o = opts || {};
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        host.append(savol(task.matn));
        if (o.oldin) o.oldin(host);
        if (o.javoblar) ui.control().append(o.javoblar(submit));
        else ui.control().append(h("div", { class: "ao-javoblar" }, ...task.variantlar.map((v) => ui.button(String(v), () => submit(v), "wide"))));
      },
      check: (value) => value === task.javob,
      // Maslahat javobni aytmaydi — nimaga qarashni ko‘rsatadi
      hint() { host.append(note("↻ " + task.ishora)); },
      solution() {
        host.append(answer(o.javobMatni ? o.javobMatni(task) : String(task.javob)));
        if (o.yechim) o.yechim(host);
        host.append(note(task.nega));
      },
    });
  }

  // ---------- Har bir savol turi uchun ekran ----------
  const EKRAN = {
    tanla: (task) => tanlovExercise(task),
    qoida: (task) => {
      let jadvalEl = null;
      return sonExercise(task, {
        oldin: (host) => { jadvalEl = jadval(task.qatorlar, task.soha); host.append(jadvalEl); },
        yechim: () => jadvalEl.replaceWith(jadval(task.qatorlar, task.soha, { n: task.n })),
      });
    },
    chegara: (task) => tanlovExercise(task, {
      oldin: (host) => host.append(jadval(task.qatorlar, task.soha)),
    }),
    joyla: (task) => tanlovExercise(task, {
      oldin: (host) => host.append(matnKarta(task.texnologiya)),
      javoblar: (submit) => halqalar(submit).el,
      javobMatni: (t) => L.ZONA[t.javob],
    }),
    vazn: (task) => sonExercise(task, {
      oldin: (host) => host.append(h("div", { class: "ao-tarmoq", html: QK.gameArt.tarmoq(task.qatlamlar) })),
    }),
    fikr: (task) => tanlovExercise(task),
    mosla: (task) => tanlovExercise(task, {
      javoblar: (submit) => h("div", { class: "ao-javoblar tort" }, ...task.variantlar.map((v, k) => {
        const b = h("button", { class: "ao-variant", type: "button", "aria-label": `${k + 1}-koʻrinish` }, natija(task.rasm, v, true));
        b.addEventListener("click", () => { QK.sound.play("tap"); submit(v); });
        return b;
      })),
      javobMatni: (t) => L.VAZIFA[t.javob],
      yechim: (host) => host.append(natija(task.rasm, task.javob, true)),
    }),
    ramka: (task) => {
      let r = null;
      return sonExercise(task, {
        oldin: (host) => { r = rasm(task.rasm); host.append(r.el); },
        yechim: () => r.chiz(task.rasm.obyektlar[0].ramka, task.rasm.obyektlar[0].sinf),
      });
    },
    maska: (task) => sonExercise(task, {
      oldin: (host) => host.append(rasm(task.rasm).el, izoh(task.rasm.obyektlar.map((x) => x.sinf))),
    }),
    ortiqcha: (task) => {
      const ob = task.rasm.obyektlar.find((x) => x.sinf === task.sinf);
      return sonExercise(task, {
        oldin: (host) => host.append(rasm(task.rasm, { ramkalar: [{ ramka: ob.ramka, sinf: ob.sinf }] }).el, izoh(task.rasm.obyektlar.map((x) => x.sinf))),
      });
    },
    xato: (task) => tanlovExercise(task, {
      oldin: (host) => host.append(rasm(task.rasm, { ramkalar: task.natija }).el, izoh()),
    }),
    vaziyat: (task) => tanlovExercise(task, {
      oldin: (host) => host.append(matnKarta(task.vaziyat)),
    }),
  };
  const run = (task) => EKRAN[task.tur](task);

  // To‘g‘ri javobdan keyingi qisqa izoh (✓ dan keyin chiqadi)
  function praise(task) {
    // Pufak 1 soniyada almashadi — faqat qisqa gap
    if (task.hisob) return task.hisob.split(" — ")[0].replace(/\.$/, "") + ".";
    if (task.tur === "joyla") return L.ZONA[task.javob] + ".";
    if (task.tur === "vaziyat") return task.javob + ".";
    if (task.tur === "tanla") return task.izlanadi === "organgan" ? "Qoida misollardan chiqarilgan." : "Shartni odam yozgan.";
    if (task.tur === "chegara") return `${task.javob} — eng koʻp qatorga mos.`;
    if (task.tur === "fikr") return task.xatoIzlanadi ? "Xato fikr topildi." : "DL ⊂ ML ⊂ AI.";
    return task.nega;
  }

  QK.common = { box, note, answer, savol, matnKarta, formula, jadval, halqalar, rasm, izoh, natija, sonExercise, tanlovExercise, run, praise, HALQA_NOMI };
})(window);
