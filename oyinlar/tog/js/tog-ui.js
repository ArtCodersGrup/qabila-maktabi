// Tog'ga chiqish — ekran qismlari: tog' manzarasi va pog'onalar (8 pog'ona atrofi ko'rinadi),
// savol kartasi, pauza oynasi, reyting va natija. Savol bloklari va javob tugmalari — umumiy/js/savol-ui.js.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, art, tog: T, savolUi } = QK;
  const h = ui.h;

  const OYNA = 8; // bir vaqtda ko'rinadigan pog'onalar soni
  const KOR = 6; // bitta pog'onada ko'rinadigan qahramon (qolgani "+N")
  const qahramonById = (id) => T.QAHRAMONLAR.find((q) => q.id === id) || T.QAHRAMONLAR[0];

  // ---------- Tog' ----------
  function scene(host, togId) {
    const t = T.togById(togId);
    const fon = h("div", { class: "manzara" });
    const rows = h("div", { class: "pogonalar" });
    const el = h("div", { class: "tog-scene" }, fon, rows);
    host.append(el);
    let oxirgiQism = -1;

    function render(state, meId) {
      const me = state.oyinchilar[meId];
      const markaz = me ? me.pogona : T.leader(state);
      // Past ekranda kamroq pog'ona ko'rsatamiz — qahramonlar juda kichrayib ketmasin
      const oyna = Math.max(4, Math.min(OYNA, Math.round((el.clientHeight || 240) / 30)));
      const yuqori = Math.min(t.pogona, Math.max(oyna - 1, markaz + 3));
      const past = Math.max(0, yuqori - oyna + 1);
      const qism = Math.round((markaz / t.pogona) * 4) / 4; // manzara sakrab turmasin
      if (qism !== oxirgiQism) {
        fon.innerHTML = art.manzara(t.id, qism);
        oxirgiQism = qism;
      }
      rows.innerHTML = "";
      for (let step = yuqori; step >= past; step--) {
        const bari = Object.values(state.oyinchilar).filter((p) => p.pogona === step);
        // "Men" har doim ko'rinadi, qolganlari sig'gani qadar
        const kimlar = bari.slice().sort((a, b) => (b.id === meId) - (a.id === meId)).slice(0, KOR);
        const row = h("div", { class: "pogona" + (step === t.pogona ? " chogqi" : "") + (step === 0 ? " tub" : "") },
          h("span", { class: "pogona-raqam", text: String(step) }),
          h("span", { class: "pogona-chiziq" }));
        const ustida = h("span", { class: "pogona-kimlar" });
        if (step === t.pogona) ustida.append(h("span", { class: "chogqi-bayroq", html: art.chogqi() }), h("span", { class: "kichik-shogird", html: art.apprentice() }));
        if (step === 0) ustida.append(h("span", { class: "kichik-oqsoqol", html: art.elder() }));
        kimlar.forEach((p) => {
          const q = qahramonById(p.qahramon);
          ustida.append(h("span", {
            class: "chiquvchi" + (p.id === meId ? " men" : "") + (p.chiqdi ? " chiqdi" : "") + (p.pauzaGacha > Date.now() ? " pauzada" : ""),
            title: q.nom,
          }, h("span", { class: "chiquvchi-rasm", html: art.hayvon(q.id, q.rang) }), h("span", { class: "chiquvchi-nom", text: p.id === meId ? "Sen" : q.nom })));
        });
        if (bari.length > kimlar.length) ustida.append(h("span", { class: "pogona-yana", text: `+${bari.length - kimlar.length}` }));
        row.append(ustida);
        rows.append(row);
      }
    }
    return { el, render };
  }

  // ---------- Reyting (yon ro'yxat) ----------
  function reyting(host) {
    const el = h("div", { class: "reyting" });
    host.append(el);
    return {
      el,
      render(state, meId) {
        el.innerHTML = "";
        T.reyting(state).forEach((p, k) => {
          const q = qahramonById(p.qahramon);
          el.append(h("div", { class: "reyting-qator" + (p.id === meId ? " men" : "") + (p.chiqdi ? " chiqdi" : "") },
            h("span", { class: "reyting-orin", text: String(k + 1) }),
            h("span", { class: "reyting-rasm", html: art.hayvon(q.id, q.rang) }),
            h("span", { class: "reyting-nom", text: p.id === meId ? "Sen" : q.nom }),
            h("b", { text: p.chiqdi ? "✗" : String(p.pogona) })));
        });
        // Ro'yxat uzun bo'lsa, o'zimning qatorim ko'rinib tursin
        const men = el.querySelector(".reyting-qator.men");
        if (men && el.scrollHeight > el.clientHeight + 1) men.scrollIntoView({ block: "nearest" });
      },
    };
  }

  // ---------- Savol ----------
  function savol(host, q) {
    const el = h("div", { class: "savol-karta" }, h("div", { class: "q-text", text: q.text }));
    (q.blocks || []).forEach((b) => {
      const node = savolUi.block(b);
      if (node) el.append(node);
    });
    host.append(el);
    return el;
  }

  // Xato javobdan keyingi pauza: to'g'ri javob va orqaga sanoq (DIZAYN 2.3)
  function pauza(host, { javob, tugaydi }) {
    const sanoq = h("b", { class: "pauza-sanoq" });
    const el = h("div", { class: "pauza" },
      h("div", { class: "pauza-bosh", text: "↻ Xato. Tepaga chiqa olmading — kut" }),
      h("div", { class: "pauza-javob", text: `Toʻgʻri javob: ${javob}` }),
      sanoq);
    host.append(el);
    return {
      el,
      tick(now) {
        const qoldi = Math.max(0, Math.ceil((tugaydi - now) / 1000));
        sanoq.textContent = `0:${String(qoldi).padStart(2, "0")}`;
        return qoldi === 0;
      },
    };
  }

  // ---------- Natija ----------
  function natija(host, state, meId) {
    const r = T.reyting(state);
    const me = state.oyinchilar[meId];
    const sabab = { chogqi: "Choʻqqiga chiqdi!", "uzib-ketdi": "Hammadan uzib ketdi!", vaqt: "Vaqt tugadi" }[state.sabab] || "";
    const golib = state.golib ? qahramonById(state.oyinchilar[state.golib].qahramon) : null;
    const el = h("div", { class: "natija" },
      h("div", { class: "natija-golib" },
        golib ? h("span", { class: "natija-rasm", html: art.hayvon(golib.id, golib.rang) }) : null,
        h("h1", { text: state.golib === meId ? "Sen yutding!" : golib ? `${golib.nom} yutdi!` : "Oʻyin tugadi" })),
      h("p", { class: "natija-sabab", text: sabab }));
    const list = h("div", { class: "natija-royxat" });
    r.forEach((p, k) => {
      const q = qahramonById(p.qahramon);
      list.append(h("div", { class: "natija-qator" + (p.id === meId ? " men" : "") },
        h("span", { class: "reyting-orin", text: String(k + 1) }),
        h("span", { class: "reyting-rasm", html: art.hayvon(q.id, q.rang) }),
        h("span", { class: "reyting-nom", text: p.id === meId ? "Sen" : q.nom }),
        h("span", { class: "natija-hisob", text: `${p.pogona}-pogʻona · ✓ ${p.togri} · ↻ ${p.xato}` })));
    });
    el.append(list);
    if (me) el.append(h("p", { class: "natija-men", text: `Sen ${me.pogona}-pogʻonaga chiqding: ${me.togri} toʻgʻri, ${me.xato} xato javob.` }));
    host.append(el);
    return el;
  }

  QK.togUi = { OYNA, scene, reyting, savol, pauza, natija, qahramonById };
})(window);
