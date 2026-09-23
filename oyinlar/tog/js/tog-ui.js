// Tog'ga chiqish — ekran qismlari: tog' manzarasi va pog'onalar (8 pog'ona atrofi ko'rinadi),
// savol kartasi, pauza oynasi, reyting va natija. Savol bloklari va javob tugmalari — umumiy/js/savol-ui.js.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, art, tog: T, savolUi } = QK;
  const h = ui.h;

  const OYNA = 8; // bir vaqtda ko'rinadigan pog'onalar soni
  const KOR = 6; // bitta pog'onada ko'rinadigan qahramon (qolgani "+N")
  const DOSKA = 16; // o'qituvchi doskasida bir vaqtda ko'rinadigan eng ko'p pog'ona
  const qahramonById = (id) => T.QAHRAMONLAR.find((q) => q.id === id) || T.QAHRAMONLAR[0];

  // ---------- Tog' ----------
  // Muhim: har chizishda hamma narsa qaytadan yaratilmaydi. Pog'ona chiziqlari faqat oyna
  // o'zgarganda, qahramonlar esa bir marta yaratilib, keyin o'z joyiga suriladi (CSS transition).
  // Aks holda ekran sekundiga 4 marta qayta tug'ilib, pirpirab turadi.
  function scene(host, togId) {
    const t = T.togById(togId);
    const fon = h("div", { class: "manzara" });
    const rows = h("div", { class: "pogonalar" });
    const qatlam = h("div", { class: "chiquvchilar" });
    const el = h("div", { class: "tog-scene" }, fon, rows, qatlam);
    host.append(el);
    let oxirgiQism = -1;
    let oxirgiOyna = "";
    const kimlar = new Map(); // o'yinchi id → element
    const yanalar = new Map(); // pog'ona → "+N" belgisi

    // Pog'ona chiziqlari, raqamlari va qimirlamaydigan qahramonlar (oqsoqol, bayroq, shogird)
    function zina(past, yuqori) {
      rows.innerHTML = "";
      for (let step = yuqori; step >= past; step--) {
        const row = h("div", { class: "pogona" + (step === t.pogona ? " chogqi" : "") + (step === 0 ? " tub" : "") },
          h("span", { class: "pogona-raqam", text: String(step) }),
          h("span", { class: "pogona-chiziq" }));
        if (step === t.pogona || step === 0) {
          const ustida = h("span", { class: "pogona-kimlar" });
          if (step === t.pogona) ustida.append(h("span", { class: "chogqi-bayroq", html: art.chogqi() }), h("span", { class: "kichik-shogird", html: art.apprentice() }));
          else ustida.append(h("span", { class: "kichik-oqsoqol", html: art.elder() }));
          row.append(ustida);
        }
        rows.append(row);
      }
    }

    function render(state, meId) {
      const me = state.oyinchilar[meId];
      // Past ekranda kamroq pog'ona ko'rsatamiz — qahramonlar juda kichrayib ketmasin
      const oyna = Math.max(4, Math.floor(((el.clientHeight || 240) - 12) / 30));
      let yuqori;
      let past;
      if (me) {
        // Bolaning ekrani: o'zi markazda
        const oynam = Math.min(OYNA, oyna);
        yuqori = Math.min(t.pogona, Math.max(oynam - 1, me.pogona + 3));
        past = Math.max(0, yuqori - oynam + 1);
      } else {
        // O'qituvchi doskasi: iloji boricha hamma ko'rinsin (eng pastdagidan yetakchigacha)
        const tirik = Object.values(state.oyinchilar).filter((p) => !p.chiqdi).map((p) => p.pogona);
        const eng = tirik.length ? Math.min.apply(null, tirik) : 0;
        const top = tirik.length ? Math.max.apply(null, tirik) : 0;
        // Telefonda ham qahramon ko'rinsin: doskada eng ko'pi 16 qator
        const doska = Math.min(oyna, DOSKA);
        if (t.pogona + 1 <= doska) { past = 0; yuqori = t.pogona; }
        else {
          yuqori = Math.min(t.pogona, Math.max(top + 1, doska - 1));
          past = Math.max(0, Math.min(eng, yuqori - doska + 1));
          yuqori = Math.min(t.pogona, past + doska - 1);
        }
      }
      // Manzara qaysi balandlikni ko'rsatishi: bolada — o'zi, doskada — yetakchi. Sakrab turmasligi uchun choraklab
      const qism = Math.round(((me ? me.pogona : T.leader(state)) / t.pogona) * 4) / 4;
      if (qism !== oxirgiQism) {
        fon.innerHTML = art.manzara(t.id, qism);
        oxirgiQism = qism;
      }
      const imzo = past + ":" + yuqori;
      if (imzo !== oxirgiOyna) {
        zina(past, yuqori);
        oxirgiOyna = imzo;
      }

      const qatorlar = yuqori - past + 1;
      const kenglik = el.clientWidth || 260;
      const joy = Math.max(16, Math.min(38, (kenglik - 44) / KOR)); // yonma-yon turganlar orasi
      const now = Date.now();
      const korindi = new Set();
      const yanaKerak = new Set();

      for (let step = past; step <= yuqori; step++) {
        const bari = Object.values(state.oyinchilar).filter((p) => p.pogona === step);
        if (!bari.length) continue;
        // "Men" har doim ko'rinadi, qolganlari sig'gani qadar
        const korsat = bari.slice().sort((a, b) => (b.id === meId) - (a.id === meId)).slice(0, KOR);
        korsat.forEach((p, i) => {
          let node = kimlar.get(p.id);
          if (!node) {
            const q = qahramonById(p.qahramon);
            node = h("span", { class: "chiquvchi", title: q.nom },
              h("span", { class: "chiquvchi-rasm", html: art.hayvon(q.id, q.rang) }),
              h("span", { class: "chiquvchi-nom", text: p.id === meId ? "Sen" : q.nom }));
            kimlar.set(p.id, node);
            qatlam.append(node);
          }
          const sinf = "chiquvchi" + (p.id === meId ? " men" : "") + (p.chiqdi ? " chiqdi" : "") + (p.pauzaGacha > now ? " pauzada" : "");
          if (node.className !== sinf) node.className = sinf;
          node.style.display = "";
          node.style.bottom = (((step - past + 0.5) / qatorlar) * 100).toFixed(2) + "%";
          node.style.left = (34 + joy * (i + 0.5)).toFixed(0) + "px";
          korindi.add(p.id);
        });
        if (bari.length > korsat.length) {
          let yana = yanalar.get(step);
          if (!yana) {
            yana = h("span", { class: "pogona-yana" });
            yanalar.set(step, yana);
            qatlam.append(yana);
          }
          const matn = "+" + (bari.length - korsat.length);
          if (yana.textContent !== matn) yana.textContent = matn;
          yana.style.display = "";
          yana.style.bottom = (((step - past + 0.5) / qatorlar) * 100).toFixed(2) + "%";
          yana.style.left = (34 + joy * (korsat.length + 0.4)).toFixed(0) + "px";
          yanaKerak.add(step);
        }
      }
      // Oynadan chiqib ketganlar ko'rinmaydi (lekin elementi saqlanadi — qaytsa sakramaydi)
      kimlar.forEach((node, id) => { if (!korindi.has(id)) node.style.display = "none"; });
      yanalar.forEach((node, step) => { if (!yanaKerak.has(step)) node.style.display = "none"; });
    }
    return { el, render };
  }

  // ---------- Reyting (yon ro'yxat) ----------
  // Qatorlar qayta yaratilmaydi: mavjud element o'rnini almashtiradi va soni yangilanadi.
  function reyting(host) {
    const el = h("div", { class: "reyting" });
    host.append(el);
    const qatorlar = new Map(); // id → { el, orin, son }
    return {
      el,
      render(state, meId) {
        const tartib = T.reyting(state);
        tartib.forEach((p, k) => {
          let q = qatorlar.get(p.id);
          if (!q) {
            const hayvon = qahramonById(p.qahramon);
            const orin = h("span", { class: "reyting-orin" });
            const son = h("b");
            q = {
              el: h("div", { class: "reyting-qator" },
                orin,
                h("span", { class: "reyting-rasm", html: art.hayvon(hayvon.id, hayvon.rang) }),
                h("span", { class: "reyting-nom", text: p.id === meId ? "Sen" : hayvon.nom }),
                son),
              orin,
              son,
            };
            qatorlar.set(p.id, q);
          }
          const sinf = "reyting-qator" + (p.id === meId ? " men" : "") + (p.chiqdi ? " chiqdi" : "");
          if (q.el.className !== sinf) q.el.className = sinf;
          const orin = String(k + 1);
          if (q.orin.textContent !== orin) q.orin.textContent = orin;
          const son = p.chiqdi ? "✗" : String(p.pogona);
          if (q.son.textContent !== son) q.son.textContent = son;
          // O'rni o'zgargan bo'lsa — elementning o'zi ko'chadi (qayta tug'ilmaydi)
          if (el.children[k] !== q.el) el.insertBefore(q.el, el.children[k] || null);
        });
        // Ro'yxat uzun bo'lsa, o'zimning qatorim ko'rinib tursin
        const men = qatorlar.get(meId);
        if (men && el.scrollHeight > el.clientHeight + 1) men.el.scrollIntoView({ block: "nearest" });
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
      // Javob noma'lum bo'lishi mumkin: uzilib qayta kirgan bola pauzaning o'rtasiga tushadi
      javob ? h("div", { class: "pauza-javob", text: `Toʻgʻri javob: ${javob}` }) : null,
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
    const sabab = {
      chogqi: "Choʻqqiga chiqdi!",
      "uzib-ketdi": "Hammadan uzib ketdi!",
      vaqt: "Vaqt tugadi",
      toxtatildi: "Oʻyin toʻxtatildi",
      uzildi: "Oʻqituvchining aloqasi uzildi", // faqat bolaning ekranida, tarmoqqa yuborilmaydi
    }[state.sabab] || "";
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
