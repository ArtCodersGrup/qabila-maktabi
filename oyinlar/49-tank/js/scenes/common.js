// 49-o'yin: ekran qismlari — maydon, buyruq satri, animatsiya.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, jang: J, logic: L, sound } = QK;
  const h = ui.h;
  const py = QK.python;

  const box = (compact) => {
    ui.setCompact(compact !== false);
    ui.clearWork();
    ui.clearControl();
    const el = h("div", { class: "tk-ekran" });
    ui.work().append(el);
    return el;
  };
  const note = (text) => h("div", { class: "tk-note", text });

  // ---------- Maydon ----------
  // SVG ichida matn yo'q (QOIDALAR §6): jon va o'q — yonidagi HTML belgilarda
  function maydonKorinishi(host, m) {
    const svgNS = "http://www.w3.org/2000/svg";
    const el = (tag, attrs) => {
      const n = root.document.createElementNS(svgNS, tag);
      for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, v);
      return n;
    };
    const wrap = h("div", { class: "tk-maydon" });
    const svg = el("svg", { viewBox: `0 0 ${m.en} ${m.bo}`, class: "tk-svg", "aria-hidden": "true" });
    wrap.append(svg);
    host.append(wrap);

    svg.append(el("rect", { x: 0, y: 0, width: m.en, height: m.bo, class: "tk-fon" }));
    for (const t of m.tosiqlar) {
      svg.append(el("rect", { x: t.x, y: t.y, width: t.en, height: t.bo, rx: 6, class: "tk-tosiq" }));
    }
    if (m.belgi) {
      svg.append(el("circle", { cx: m.belgi.x, cy: m.belgi.y, r: 26, class: "tk-belgi" }));
      svg.append(el("circle", { cx: m.belgi.x, cy: m.belgi.y, r: 8, class: "tk-belgi-ich" }));
    }
    let nishonEl = null;
    if (m.nishon) {
      nishonEl = el("g", { class: "tk-nishon" });
      nishonEl.append(el("circle", { cx: m.nishon.x, cy: m.nishon.y, r: m.nishon.r || 18, class: "tk-nishon-tashqi" }));
      nishonEl.append(el("circle", { cx: m.nishon.x, cy: m.nishon.y, r: (m.nishon.r || 18) / 2, class: "tk-nishon-ich" }));
      svg.append(nishonEl);
    }

    const oqQatlam = el("g", {});
    svg.append(oqQatlam);

    const tankEls = {};
    for (const t of m.tanklar) {
      const g = el("g", { class: "tk-tank " + (t.tur === "bola" ? "bola" : "robot") });
      g.append(el("rect", { x: -J.R, y: -J.R + 2, width: J.R * 2, height: J.R * 2 - 4, rx: 4, class: "tk-tana" }));
      g.append(el("rect", { x: -J.R - 2, y: -J.R - 2, width: J.R * 2 + 4, height: 5, rx: 2, class: "tk-zanjir" }));
      g.append(el("rect", { x: -J.R - 2, y: J.R - 3, width: J.R * 2 + 4, height: 5, rx: 2, class: "tk-zanjir" }));
      g.append(el("rect", { x: 0, y: -3, width: J.R + 10, height: 6, rx: 2, class: "tk-quvur" }));
      g.append(el("circle", { cx: 0, cy: 0, r: 6, class: "tk-minora" }));
      svg.append(g);
      tankEls[t.id] = g;
    }

    const joyla = (t, tez) => {
      const g = tankEls[t.id];
      g.classList.toggle("tez", !!tez);
      g.setAttribute("transform", `translate(${t.x} ${t.y}) rotate(${-t.burchak})`);
    };
    for (const t of m.tanklar) joyla(t, true);

    const api = {
      el: wrap,
      chiz() {
        for (const t of m.tanklar) {
          joyla(t, true);
          tankEls[t.id].classList.toggle("olgan", !t.tirik);
        }
        if (nishonEl) nishonEl.classList.toggle("olgan", m.nishon.tirik === false);
      },
      // Yozuvni bosqichma-bosqich ko'rsatish
      async oyna(yozuv) {
        for (const y of yozuv) {
          const t = m.tanklar.find((x) => x.id === y.id);
          if (y.t === "yur" || y.t === "burul") {
            if (t) {
              const g = tankEls[t.id];
              g.classList.remove("tez");
              g.setAttribute("transform", `translate(${y.x != null ? y.x : t.x} ${y.y != null ? y.y : t.y}) rotate(${-(y.burchak != null ? y.burchak : t.burchak)})`);
            }
            sound.play("tak");
            await ui.sleep(340);
          } else if (y.t === "oq") {
            const chiziq = el("line", { x1: t ? t.x : 0, y1: t ? t.y : 0, x2: y.x, y2: y.y, class: "tk-oq" });
            oqQatlam.append(chiziq);
            sound.play(y.tegdi ? "correct" : "tap");
            await ui.sleep(260);
            chiziq.remove();
            if (y.tegdi) {
              const portlash = el("circle", { cx: y.x, cy: y.y, r: 20, class: "tk-portlash" });
              oqQatlam.append(portlash);
              await ui.sleep(300);
              portlash.remove();
            }
          } else if (y.t === "yiqildi" || y.t === "nishon-yiqildi") {
            api.chiz();
            sound.play("win");
            await ui.sleep(300);
          } else {
            await ui.sleep(120);
          }
        }
        api.chiz();
      },
    };
    return api;
  }

  // Jon va o'q ko'rsatkichi (HTML — SVG ichida matn yo'q)
  function holatPaneli(host, m) {
    const el = h("div", { class: "tk-holat" });
    host.append(el);
    const chiz = () => {
      el.innerHTML = "";
      for (const t of m.tanklar) {
        const qator = h("div", { class: "tk-holat-qator " + (t.tur === "bola" ? "bola" : "robot") + (t.tirik ? "" : " olgan") },
          h("span", { class: "tk-nuqta" }),
          h("span", { class: "tk-jon" }, ...Array.from({ length: Math.max(0, t.jon) }, () => h("span", { class: "yurak" }))));
        if (t.tur === "bola") {
          qator.append(h("span", { class: "tk-oqlar" }, ...Array.from({ length: Math.max(0, t.oq) }, () => h("span", { class: "oq" }))));
        }
        el.append(qator);
      }
    };
    chiz();
    return { el, chiz };
  }

  // ---------- Buyruq satri ----------
  function buyruqPaneli(host, { buyruqlar, onSatr }) {
    const el = h("div", { class: "tk-panel" });
    const tarix = h("div", { class: "tk-tarix" });
    const yordam = h("div", { class: "tk-yordam" },
      ...buyruqlar.map((b) => h("span", { class: "tk-buyruq", text: b + (b === "fire" || b === "reload" || b === "scan" || b === "radar" || b === "hp" || b === "ammo" ? "()" : "(n)") })));
    const maydon = h("textarea", {
      class: "tk-kiritish", rows: "2", spellcheck: "false", autocapitalize: "off", autocorrect: "off",
      placeholder: "buyruq yozing va Enter bosing", "aria-label": "Buyruq",
    });
    el.append(yordam, tarix, maydon);
    host.append(el);

    let bandmi = false;
    const yoz = (matn, klass) => {
      tarix.append(h("div", { class: "tk-satr " + (klass || ""), text: matn }));
      tarix.scrollTop = tarix.scrollHeight;
    };
    maydon.addEventListener("keydown", async (e) => {
      if (e.key !== "Enter" || e.shiftKey) return;
      e.preventDefault();
      const kod = maydon.value.trim();
      if (!kod || bandmi) return;
      bandmi = true;
      maydon.value = "";
      yoz("▶ " + kod.replace(/\n/g, " ⏎ "), "kiritilgan");
      await onSatr(kod, yoz);
      bandmi = false;
      maydon.focus();
    });
    setTimeout(() => maydon.focus(), 60);
    return { el, yoz, maydon };
  }

  // ---------- Vazifa ekrani ----------
  function vazifaEkrani(bosqich, v) {
    return ui.settle(async (done) => {
      const host = box(true);
      host.append(note(v.matn));
      const ikki = h("div", { class: "tk-ikki" });
      host.append(ikki);
      const chap = h("div", { class: "tk-chap" });
      const ong = h("div", { class: "tk-ong" });
      ikki.append(chap, ong);

      let m = v.maydon();
      let koz = maydonKorinishi(chap, m);
      let holat = holatPaneli(chap, m);
      let urinish = 0;

      const qaytaBoshla = () => {
        m = v.maydon();
        chap.innerHTML = "";
        koz = maydonKorinishi(chap, m);
        holat = holatPaneli(chap, m);
      };

      const panel = buyruqPaneli(ong, {
        buyruqlar: v.buyruqlar,
        onSatr: async (kod, yoz) => {
          const r = L.satrniBajar(m, kod, py);
          if (r.xato) {
            yoz("↻ " + r.xato.text, "xato");
            if (r.xato.hint) yoz(r.xato.hint, "izoh");
            return;
          }
          for (const satr of r.chiqish) yoz(satr, "chiqish");
          if (r.chegaraOshdi) yoz("Bitta satrda " + J.MAX_HARAKAT + " ta harakat bajariladi — qolgani keyingi safar.", "izoh");
          await koz.oyna(r.yozuv);
          holat.chiz();
          if (L.bajarildi(bosqich, m)) {
            sound.play("win");
            ui.pose("apprentice", "happy", 1200);
            done(true);
          } else if (L.yutqazdi(m)) {
            yoz("Tanking yiqildi. Maydon qaytadan tiklandi — yana urinib koʻr.", "izoh");
            urinish++;
            if (urinish === 1) yoz("↻ " + v.ishora, "izoh");
            await ui.sleep(600);
            qaytaBoshla();
          }
        },
      });

      ui.control().append(
        ui.button("Maydonni tiklash", () => { qaytaBoshla(); panel.yoz("Maydon tiklandi.", "izoh"); }, "small"),
        ui.button("Ishora", () => panel.yoz("↻ " + v.ishora, "izoh"), "small"));
    });
  }

  QK.common = { box, note, maydonKorinishi, holatPaneli, buyruqPaneli, vazifaEkrani };
})(window);
