// Tog'ga chiqish — ekran qismlari: tog' manzarasi va pog'onalar (8 pog'ona atrofi ko'rinadi),
// savol kartasi, pauza oynasi, reyting va natija. Savol bloklari va javob tugmalari — umumiy/js/savol-ui.js.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, art, tog: T, savolUi } = QK;
  const h = ui.h;

  const OYNA = 8; // bir vaqtda ko'rinadigan pog'onalar soni
  const KOR = 4; // bitta pog'onada ko'rinadigan qahramon (qolgani "+N")
  const YOL = 2.6; // soʻqmoq kengligining yarmi: qahramon yoʻlka ustida turadi (%)
  const DOSKA = 16; // o'qituvchi doskasida bir vaqtda ko'rinadigan eng ko'p pog'ona
  const qahramonById = (id) => T.QAHRAMONLAR.find((q) => q.id === id) || T.QAHRAMONLAR[0];

  // ---------- Tog' ----------
  // Tog'ni yon tomondan ko'ramiz: chapda osmon, o'ngda tog' tanasi, orasida qiya bag'ir.
  // Qahramonlar shu bag'ir bo'ylab ko'tariladi. Har chizishda hamma narsa qaytadan yaratilmaydi:
  // manzara va pog'ona belgilari faqat oyna o'zgarganda, qahramonlar esa bir marta yaratilib suriladi.
  function scene(host, togId) {
    const t = T.togById(togId);
    const fon = h("div", { class: "manzara" });
    const osmon = h("div", { class: "osmon" },
      h("span", { class: "quyosh", html: art.quyosh() }),
      h("span", { class: "bulut bulut-1", html: art.bulut() }),
      h("span", { class: "bulut bulut-2", html: art.bulut() }));
    const belgilar = h("div", { class: "pogonalar" });
    const bezaklar = h("div", { class: "bezaklar" });
    const qatlam = h("div", { class: "chiquvchilar" });
    const el = h("div", { class: "tog-scene" }, fon, osmon, bezaklar, belgilar, qatlam);
    host.append(el);
    let oxirgiOyna = "";
    let geo = null;
    const kimlar = new Map(); // o'yinchi id → element
    const yanalar = new Map(); // pog'ona → "+N" belgisi

    const chap = (x) => x.toFixed(2) + "%";
    const bal = (y) => (100 - y).toFixed(2) + "%"; // y (tepadan) → bottom

    // Manzara, pog'ona belgilari va bag'ir bezaklari — faqat oyna o'zgarganda
    function oynaniChiz(past, yuqori) {
      // Bag'ir burchagi: taxminan 60°. Tor qutida kengaytira olmaymiz, shuning uchun chegara bor.
      const w = el.clientWidth || 260;
      const hh = el.clientHeight || 240;
      const n = yuqori - past + 1;
      const kerak = ((hh * (n - 1)) / n) * 0.58 / w * 100;
      const ken = Math.max(28, Math.min(62, kerak));
      const oyna = { past, yuqori, pogona: t.pogona, X0: Math.max(7, 46 - ken / 2), X1: Math.max(7, 46 - ken / 2) + ken };
      geo = art.geometriya(oyna);
      fon.innerHTML = art.manzara(t.id, oyna);

      belgilar.innerHTML = "";
      for (let step = past; step <= yuqori; step++) {
        // Raqamlar siyrak: har 5-pogʻona, tub va choʻqqi — aks holda qahramonni toʻsib ketadi
        const raqamli = step % 5 === 0 || step === t.pogona || step === 0;
        if (!raqamli) continue; // zinaning oʻzi manzarada chizilgan, belgi faqat raqam uchun
        const belgi = h("span", { class: "pogona-belgi" + (step === t.pogona ? " chogqi" : "") + (step === 0 ? " tub" : "") },
          h("b", { class: "pogona-raqam", text: String(step) }));
        belgi.style.left = chap(geo.xOf(step));
        belgi.style.bottom = bal(geo.yOf(step));
        belgilar.append(belgi);
      }
      // Cho'qqida bayroq va shogird, eng pastda oqsoqol
      if (geo.chogqi) {
        const bayroq = h("span", { class: "chogqi-bayroq", html: art.chogqi() });
        bayroq.style.left = chap(geo.peakX + 3);
        bayroq.style.bottom = bal(geo.peakY);
        const shogird = h("span", { class: "kichik-shogird", html: art.apprentice() });
        shogird.style.left = chap(geo.peakX - 4);
        shogird.style.bottom = bal(geo.peakY);
        belgilar.append(bayroq, shogird);
      }
      if (past === 0) {
        const oqsoqol = h("span", { class: "kichik-oqsoqol", html: art.elder() });
        oqsoqol.style.left = chap(Math.max(5, geo.xOf(0) - 11));
        oqsoqol.style.bottom = bal(geo.yOf(0));
        belgilar.append(oqsoqol);
      }

      // Bag'irdagi bezaklar: chiziqdan o'ngda, qahramonlarni to'smaydi
      bezaklar.innerHTML = "";
      [[0.22, 15], [0.55, 26], [0.84, 19]].forEach(([ulush, masofa]) => {
        const step = past + (yuqori - past) * ulush;
        const y = geo.yOf(step);
        const tur = art.bezakTuri(t.id, step / t.pogona);
        const b = h("span", { class: "bezak bezak-" + tur, html: art.bezak(tur) });
        b.style.left = chap(geo.xAtY(y) + masofa);
        b.style.bottom = bal(y);
        bezaklar.append(b);
      });
    }

    function render(state, meId) {
      const me = state.oyinchilar[meId];
      // Past ekranda kamroq pog'ona ko'rsatamiz — qahramonlar juda kichrayib ketmasin
      const oyna = Math.max(4, Math.floor(((el.clientHeight || 240) - 12) / 34));
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
        const doska = Math.min(oyna, DOSKA);
        if (t.pogona + 1 <= doska) { past = 0; yuqori = t.pogona; }
        else {
          yuqori = Math.min(t.pogona, Math.max(top + 1, doska - 1));
          past = Math.max(0, Math.min(eng, yuqori - doska + 1));
          yuqori = Math.min(t.pogona, past + doska - 1);
        }
      }
      const imzo = past + ":" + yuqori;
      if (imzo !== oxirgiOyna) {
        oynaniChiz(past, yuqori);
        oxirgiOyna = imzo;
      }

      // Bir pog'onada bir nechta bo'lsa — soʻqmoq boʻylab pastga navbat turadi (yoʻlkadan chiqmaydi)
      const dx = (geo.xOf(past + 1) - geo.xOf(past)) * 0.32;
      const dy = (geo.yOf(past) - geo.yOf(past + 1)) * 0.32;
      const navbatX = (x, i) => Math.max(2, x + YOL - dx * i);
      const navbatY = (y, i) => Math.min(96, y + dy * i);
      const now = Date.now();
      const korindi = new Set();
      const yanaKerak = new Set();

      for (let step = past; step <= yuqori; step++) {
        const bari = Object.values(state.oyinchilar).filter((p) => p.pogona === step);
        if (!bari.length) continue;
        // "Men" har doim ko'rinadi, qolganlari sig'gani qadar; ortiqchasi "+N" bo'ladi
        const korsat = bari.slice().sort((a, b) => (b.id === meId) - (a.id === meId)).slice(0, KOR);
        const x = geo.xOf(step);
        const y = geo.yOf(step);
        korsat.forEach((p, i) => {
          let node = kimlar.get(p.id);
          if (!node) {
            const q = qahramonById(p.qahramon);
            node = h("span", { class: "chiquvchi", title: q.nom },
              h("span", { class: "chiquvchi-rasm", html: art.qahramon(q.id, q.rang) }),
              h("span", { class: "chiquvchi-nom", text: p.id === meId ? "Sen" : q.nom }));
            kimlar.set(p.id, node);
            qatlam.append(node);
          }
          node.classList.toggle("men", p.id === meId);
          node.classList.toggle("chiqdi", !!p.chiqdi);
          node.classList.toggle("pauzada", p.pauzaGacha > now);
          // Pog'ona o'zgarsa — qadam tashlab ko'tariladi (oyoqlari harakatlanadi)
          if (node.dataset.pogona !== String(step)) {
            node.dataset.pogona = String(step);
            node.classList.add("yuradi");
            clearTimeout(node.yurishTimer);
            node.yurishTimer = setTimeout(() => node.classList.remove("yuradi"), 700);
          }
          node.style.display = "";
          // Bir pog'onada bir nechta bo'lsa — bag'ir bo'ylab pastga navbat
          node.style.left = chap(navbatX(x, i));
          node.style.bottom = bal(navbatY(y, i));
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
          yana.style.left = chap(navbatX(x, korsat.length));
          yana.style.bottom = bal(navbatY(y, korsat.length));
          yanaKerak.add(step);
        }
      }
      // Oynadan chiqib ketganlar ko'rinmaydi (elementi saqlanadi — qaytsa sakramaydi)
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
