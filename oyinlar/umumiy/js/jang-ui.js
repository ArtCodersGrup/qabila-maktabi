// Tank maydoni va buyruq paneli — 49-o'yin, tank dueli va onlayn tank xonasi ishlatadi (QOIDALAR §8).
// SVG ichida matn yo'q (QOIDALAR §6): jon va o'q — yonidagi HTML belgilarda.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, jang: J, sound } = QK;
  const h = ui.h;

  // ---------- Maydon ----------
  // SVG ichida matn yo'q (QOIDALAR §6): jon va o'q — yonidagi HTML belgilarda.
  // 2026-10-06 yangi ko'rinish (muallif: "grafikani yaxshilash"): qumli maydon katakli to'r bilan, panalar soyali,
  // tank — soya, zanjir, gradientli tana, minora va quvur; o'q — izli chiziq va uchidan olov; tegish — halqa; yiqilgan tank — qora, tutun.
  function maydonKorinishi(host, m) {
    const svgNS = "http://www.w3.org/2000/svg";
    const el = (tag, attrs, ...kids) => {
      const n = root.document.createElementNS(svgNS, tag);
      for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, v);
      for (const k of kids) n.append(k);
      return n;
    };
    const wrap = h("div", { class: "tk-maydon" });
    const svg = el("svg", { viewBox: `0 0 ${m.en} ${m.bo}`, class: "tk-svg", "aria-hidden": "true" });
    wrap.append(svg);
    host.append(wrap);

    // defs: katak to'ri, zanjir chiziqlari, tana soyasi (har rangga mos — oq/qora yarim shaffof)
    const uid = "tk" + Math.random().toString(36).slice(2, 7); // sahifada bir nechta maydon bo'lsa id lar to'qnashmasin
    const defs = el("defs", {});
    defs.append(el("pattern", { id: uid + "-katak", width: 20, height: 20, patternUnits: "userSpaceOnUse" },
      el("path", { d: "M20 0H0V20", fill: "none", class: "tk-katak" })));
    defs.append(el("pattern", { id: uid + "-zanjir", width: 6, height: 6, patternUnits: "userSpaceOnUse" },
      el("rect", { x: 0, y: 0, width: 3, height: 6, class: "tk-zanjir-chiziq" })));
    const soya = el("linearGradient", { id: uid + "-soya", x1: 0, y1: 0, x2: 0, y2: 1 },
      el("stop", { offset: "0", "stop-color": "#FFFFFF", "stop-opacity": "0.35" }),
      el("stop", { offset: "0.5", "stop-color": "#FFFFFF", "stop-opacity": "0" }),
      el("stop", { offset: "1", "stop-color": "#000000", "stop-opacity": "0.28" }));
    defs.append(soya);
    svg.append(defs);

    // Fon: qum, katak to'ri, bir nechta och dog' (tekis emas — "maydon" his qilinsin)
    svg.append(el("rect", { x: 0, y: 0, width: m.en, height: m.bo, class: "tk-fon" }));
    svg.append(el("rect", { x: 0, y: 0, width: m.en, height: m.bo, fill: `url(#${uid}-katak)` }));
    const dogRng = (k) => ((Math.sin(k * 12.9898 + 78.233) * 43758.5453) % 1 + 1) % 1; // deterministik — har chizishda bir xil
    for (let k = 0; k < 7; k++) {
      svg.append(el("ellipse", { cx: Math.round(20 + dogRng(k) * (m.en - 40)), cy: Math.round(20 + dogRng(k + 10) * (m.bo - 40)), rx: 26 + Math.round(dogRng(k + 20) * 30), ry: 10 + Math.round(dogRng(k + 30) * 10), class: "tk-dog" }));
    }
    // Panalar: soya, tana, ustki yorug' qirra
    for (const t of m.tosiqlar) {
      svg.append(el("rect", { x: t.x + 4, y: t.y + 5, width: t.en, height: t.bo, rx: 6, class: "tk-tosiq-soya" }));
      svg.append(el("rect", { x: t.x, y: t.y, width: t.en, height: t.bo, rx: 6, class: "tk-tosiq" }));
      svg.append(el("rect", { x: t.x + 4, y: t.y + 4, width: t.en - 8, height: Math.max(4, t.bo / 3), rx: 3, class: "tk-tosiq-yoruq" }));
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

    const soyaQatlam = el("g", {}); // tank soyalari — tanklar ostida
    const oqQatlam = el("g", {});
    svg.append(soyaQatlam);

    const R = J.R;
    const tankEls = {};
    const soyaEls = {};
    for (const t of m.tanklar) {
      const g = el("g", { class: "tk-tank " + (t.tur === "bola" ? "bola" : "robot") });
      if (t.men) g.classList.add("men"); // bolaning o'z tanki ajralib tursin
      // Zanjirlar (chiziqli), tana (rang + yorug'-soya qatlami), minora, quvur, lyuk
      g.append(el("rect", { x: -R - 1, y: -R - 3, width: R * 2 + 2, height: 7, rx: 3, class: "tk-zanjir" }));
      g.append(el("rect", { x: -R - 1, y: R - 4, width: R * 2 + 2, height: 7, rx: 3, class: "tk-zanjir" }));
      g.append(el("rect", { x: -R - 1, y: -R - 3, width: R * 2 + 2, height: 7, rx: 3, fill: `url(#${uid}-zanjir)` }));
      g.append(el("rect", { x: -R - 1, y: R - 4, width: R * 2 + 2, height: 7, rx: 3, fill: `url(#${uid}-zanjir)` }));
      const tana = el("rect", { x: -R, y: -R + 3, width: R * 2, height: R * 2 - 6, rx: 5, class: "tk-tana" });
      if (t.rang) tana.style.fill = t.rang; // onlayn xona: har bolaning o'z rangi
      g.append(tana);
      g.append(el("rect", { x: -R, y: -R + 3, width: R * 2, height: R * 2 - 6, rx: 5, fill: `url(#${uid}-soya)`, class: "tk-tana-soya" }));
      g.append(el("rect", { x: 2, y: -3.5, width: R + 12, height: 7, rx: 2.5, class: "tk-quvur" }));
      g.append(el("rect", { x: R + 8, y: -4.5, width: 6, height: 9, rx: 2, class: "tk-quvur-uchi" }));
      g.append(el("circle", { cx: 0, cy: 0, r: 8, class: "tk-minora" }));
      g.append(el("circle", { cx: -2, cy: -2, r: 3, class: "tk-lyuk" }));
      // Tutun (yiqilganda ko'rinadi): uchta halqa yuqoriga suzadi (CSS animatsiya)
      const tutun = el("g", { class: "tk-tutun" });
      [[-6, 0.0], [4, 0.5], [-1, 1.0]].forEach(([dx, kech]) => {
        const c = el("circle", { cx: dx, cy: -4, r: 7, class: "tk-tutun-b" });
        c.style.animationDelay = kech + "s";
        tutun.append(c);
      });
      g.append(tutun);
      svg.append(g);
      tankEls[t.id] = g;
      const sg = el("ellipse", { cx: 0, cy: 0, rx: R + 5, ry: R + 2, class: "tk-tank-soya" });
      soyaQatlam.append(sg);
      soyaEls[t.id] = sg;
    }
    svg.append(oqQatlam); // o'q va portlash — hammasining ustida

    const joyla = (t, tez, x, y, burchak) => {
      const g = tankEls[t.id];
      const X = x != null ? x : t.x;
      const Y = y != null ? y : t.y;
      const B = burchak != null ? burchak : t.burchak;
      g.classList.toggle("tez", !!tez);
      g.setAttribute("transform", `translate(${X} ${Y}) rotate(${-B})`);
      const sg = soyaEls[t.id];
      sg.classList.toggle("tez", !!tez);
      sg.setAttribute("transform", `translate(${X + 3} ${Y + 4}) rotate(${-B})`);
    };
    for (const t of m.tanklar) joyla(t, true);

    // Qisqa vaqtlik element: qo'shiladi, ms dan keyin olib tashlanadi
    const vaqtincha = (node, ms) => { oqQatlam.append(node); setTimeout(() => node.remove(), ms); };

    const api = {
      el: wrap,
      chiz() {
        for (const t of m.tanklar) {
          joyla(t, true);
          tankEls[t.id].classList.toggle("olgan", !t.tirik);
          soyaEls[t.id].classList.toggle("olgan", !t.tirik);
        }
        if (nishonEl) nishonEl.classList.toggle("olgan", m.nishon.tirik === false);
      },
      // Yozuvni bosqichma-bosqich ko'rsatish
      async oyna(yozuv) {
        for (const y of yozuv) {
          const t = m.tanklar.find((x) => x.id === y.id);
          if (y.t === "yur" || y.t === "burul") {
            if (t) joyla(t, false, y.x, y.y, y.burchak);
            sound.play(y.t === "yur" ? "motor" : "tak");
            await ui.sleep(340);
          } else if (y.t === "oq") {
            const x0 = t ? t.x : 0;
            const y0 = t ? t.y : 0;
            // Olov quvur uchida, iz — keng xira + ingichka yorug' chiziq
            const burchak = Math.atan2(y.y - y0, y.x - x0);
            const ux = Math.cos(burchak);
            const uy = Math.sin(burchak);
            vaqtincha(el("circle", { cx: x0 + ux * (R + 12), cy: y0 + uy * (R + 12), r: 9, class: "tk-olov" }), 120);
            const iz = el("g", { class: "tk-oq-iz" },
              el("line", { x1: x0, y1: y0, x2: y.x, y2: y.y, class: "tk-oq-xira" }),
              el("line", { x1: x0, y1: y0, x2: y.x, y2: y.y, class: "tk-oq" }));
            oqQatlam.append(iz);
            sound.play("fire");
            await ui.sleep(220);
            iz.remove();
            if (y.tegdi) {
              sound.play("hit");
              vaqtincha(el("circle", { cx: y.x, cy: y.y, r: 14, class: "tk-portlash" }), 380);
              vaqtincha(el("circle", { cx: y.x, cy: y.y, r: 6, class: "tk-portlash-halqa" }), 380);
              const b = m.tanklar.find((x) => x.id === y.tegdi);
              if (b) { tankEls[b.id].classList.add("tegdi"); setTimeout(() => tankEls[b.id].classList.remove("tegdi"), 380); }
              await ui.sleep(320);
            } else {
              vaqtincha(el("circle", { cx: y.x, cy: y.y, r: 4, class: "tk-chang" }), 260);
              await ui.sleep(120);
            }
          } else if (y.t === "yiqildi" || y.t === "nishon-yiqildi") {
            api.chiz();
            sound.play("boom");
            const yiq = m.tanklar.find((x) => x.id === y.id);
            if (yiq) vaqtincha(el("circle", { cx: yiq.x, cy: yiq.y, r: 10, class: "tk-portlash-katta" }), 600);
            await ui.sleep(500);
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
  // guruhlar (ixtiyoriy): [{ nom, buyruqlar: [{ b, son, izoh }] }] — buyruqlar guruhlab ko'rsatiladi
  // va bosilganda satrga qo'shiladi (son belgilangan holda — ustidan yozish mumkin).
  function buyruqPaneli(host, { buyruqlar, guruhlar, onSatr }) {
    const el = h("div", { class: "tk-panel" });
    const tarix = h("div", { class: "tk-tarix" });
    const maydon = h("textarea", {
      class: "tk-kiritish", rows: "2", spellcheck: "false", autocapitalize: "off", autocorrect: "off",
      placeholder: "buyruq yozing va Enter bosing", "aria-label": "Buyruq",
    });
    const qosh = ({ b, son }) => {
      if (maydon.disabled) return;
      const oldin = maydon.value.replace(/\s+$/, "");
      const bosh = oldin ? oldin + "\n" : "";
      maydon.value = `${bosh}${b}(${son == null ? "" : son})`;
      maydon.focus();
      const n = maydon.value.length;
      if (son == null) maydon.setSelectionRange(n, n);
      else maydon.setSelectionRange(n - 1 - String(son).length, n - 1);
    };
    const yordam = guruhlar
      ? h("div", { class: "tk-guruhlar" }, ...guruhlar.map((g) => h("div", { class: "tk-guruh" },
        h("div", { class: "tk-guruh-nom", text: g.nom }),
        h("div", { class: "tk-guruh-royxat" }, ...g.buyruqlar.map((q) => {
          const tugma = h("button", { type: "button", class: "tk-amal", title: q.izoh },
            h("code", { text: `${q.b}(${q.son == null ? "" : "n"})` }), h("span", { text: q.izoh }));
          tugma.addEventListener("click", () => qosh(q));
          return tugma;
        })))))
      : h("div", { class: "tk-yordam" },
        ...buyruqlar.map((b) => h("span", { class: "tk-buyruq", text: b + (b === "fire" || b === "reload" || b === "scan" || b === "radar" || b === "hp" || b === "ammo" ? "()" : "(n)") })));
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

  QK.jangUi = { maydonKorinishi, holatPaneli, buyruqPaneli };
})(window);
