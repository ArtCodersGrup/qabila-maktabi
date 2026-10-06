// 70-o'yin: chizish taxtasi — 32 × 24 katak, ikki canvas (rasm + ustki soya/preview qatlami), Pointer Events,
// asboblar paneli (asboblar, palitra, amallar), tarix, harakat jurnali va tezkor tugmalar.
// QK.taxtaYasa(opts) → taxta; oxirgi yasalgan taxta QK.taxta da (sinov uchun: holat(), chiz(harakat)).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, sound } = QK;
  const art = QK.gameArt;
  const h = ui.h;

  const K = 24; // canvas ichidagi katak o'lchami (px) — ekranda CSS bilan kichrayadi
  const CHIZIQ_RANG = "#E3DCCB"; // katak chiziqlari
  const OQ = "#FFFFFF";
  const AMAL_NOM = { bekor: "Bekor", qaytar: "Qaytar", tozalash: "Tozalash", saqlash: "Saqlash" };
  // Ctrl+N yo'q: brauzer uni sahifaga bermaydi (yangi oyna ochadi) — tozalash faqat tugma bilan
  const TEZKOR = { bekor: "Ctrl+Z", qaytar: "Ctrl+Y", saqlash: "Ctrl+S" };
  const SHAKL = L.SHAKL_ID;

  const hex = (rang) => (L.rangById(rang) ? L.rangById(rang).hex : OQ);
  const macmi = () => /Mac|iPhone|iPad/.test((root.navigator && root.navigator.platform) || "");

  function taxtaYasa(opts) {
    // Bir vaqtda bitta taxta: oldingisi (ekrandan allaqachon olib tashlangan) yopiladi — tinglovchilari qolib ketmaydi
    if (QK.taxta && typeof QK.taxta.yop === "function") QK.taxta.yop();
    const o = opts || {};
    const asboblar = o.asboblar || L.ASBOB_ID.slice();
    const amallar = o.amallar || ["bekor", "qaytar", "tozalash"];
    const tezkor = !ui.touchOnly();
    let onHarakat = o.onHarakat || (() => {}); // onHarakatQoy bilan almashtiriladi (bitta taxta — ko'p qadam)

    // ---------- Holat ----------
    let tarix = L.tarixYasa(o.taxta ? L.nusxa(o.taxta) : L.boshTaxta());
    if (o.harakatlar) for (const hr of o.harakatlar) tarix = L.tarixQoy(tarix, L.bajar(tarix.hozir, hr).taxta);
    let ish = L.nusxa(tarix.hozir); // sudrash paytidagi ishchi nusxa
    let asbob = o.asbob || "qalam";
    let rang = o.rang || "qora";
    let toliq = !!o.toliq;
    let jurnal = [];
    let soyaKataklar = null;
    let soyaRang = null;
    let soyaKuchli = false;
    let preview = null; // { kataklar, rang } — sudrash paytidagi shakl
    let qulf = !!o.qulf;
    let yopiq = false;
    let sudrash = null; // { pid, a, b, kataklar(Set) } — faol ko'rsatkich
    let animatsiya = null;

    // ---------- DOM ----------
    const rasm = h("canvas", { class: "kr-rasm", width: L.W * K, height: L.H * K, "aria-hidden": "true" });
    const ustki = h("canvas", { class: "kr-ustki", width: L.W * K, height: L.H * K, role: "img", "aria-label": "Chizish taxtasi, 32 × 24 katak" });
    const taxtaEl = h("div", { class: "kr-taxta" }, rasm, ustki);
    const holatEl = h("div", { class: "kr-holat", "aria-live": "polite" });
    const asbobEl = h("div", { class: "kr-asboblar", role: "group", "aria-label": "Asboblar" });
    const palitraEl = h("div", { class: "kr-palitra", role: "group", "aria-label": "Ranglar" });
    const amalEl = h("div", { class: "kr-amallar", role: "group", "aria-label": "Amallar" });
    const panel = h("div", { class: "kr-panel" }, asbobEl, palitraEl, amalEl, holatEl);
    const el = h("div", { class: "kr-ish" }, taxtaEl, panel);

    const tugma = {}; // id → button (asboblar, toliq, amallar)
    const rangTugma = {};
    const gRasm = rasm.getContext("2d");
    const gUstki = ustki.getContext("2d");

    for (const id of asboblar) {
      const a = L.asbobById(id);
      const b = h("button", {
        class: "kr-asbob", type: "button", "data-asbob": id, "aria-label": a.nom, "aria-pressed": "false",
        onClick: () => { if (!qulf) { sound.play("tap"); asbobTanla(id); } },
      }, h("span", { class: "kr-belgi", html: art.icon(id) }), h("span", { class: "kr-nom", text: a.nom }));
      tugma[id] = b;
      asbobEl.append(b);
    }
    if (asboblar.some((id) => SHAKL.includes(id) && id !== "chiziq")) {
      const b = h("button", {
        class: "kr-asbob kr-toliq", type: "button", "data-asbob": "toliq", "aria-label": "Ichi toʻla", "aria-pressed": "false",
        onClick: () => { if (!qulf) { sound.play("tap"); toliqQoy(!toliq); } },
      }, h("span", { class: "kr-belgi" }), h("span", { class: "kr-nom", text: "ichi toʻla" }));
      tugma.toliq = b;
      asbobEl.append(b);
    }
    for (const p of L.PALITRA) {
      const b = h("button", {
        class: "kr-rang", type: "button", "data-rang": p.id, "aria-label": p.nom, "aria-pressed": "false",
        style: `--rang:${p.hex}`,
        onClick: () => { if (!qulf) { sound.play("tap"); rangTanla(p.id); } },
      });
      rangTugma[p.id] = b;
      palitraEl.append(b);
    }
    for (const id of amallar) {
      const b = h("button", {
        class: "kr-amal", type: "button", "data-amal": id, "aria-label": AMAL_NOM[id],
        onClick: () => { if (!qulf) { sound.play("tap"); amal(id); } },
      }, h("span", { class: "kr-belgi", html: art.icon(id) }), h("span", { class: "kr-nom", text: AMAL_NOM[id] }),
      tezkor && TEZKOR[id] ? h("span", { class: "kr-tez", "aria-hidden": "true", text: macmi() ? TEZKOR[id].replace("Ctrl", "⌘") : TEZKOR[id] }) : null);
      tugma[id] = b;
      amalEl.append(b);
    }

    // ---------- Chizish ----------
    function chizRasm() {
      gRasm.fillStyle = OQ;
      gRasm.fillRect(0, 0, rasm.width, rasm.height);
      for (let y = 0; y < L.H; y++) {
        for (let x = 0; x < L.W; x++) {
          const v = ish[L.indeks(x, y)];
          if (v === L.BOSH) continue;
          gRasm.fillStyle = L.PALITRA[v].hex;
          gRasm.fillRect(x * K, y * K, K, K);
        }
      }
      // Katak chiziqlari — bola kataklarni ko'rsin
      gRasm.strokeStyle = CHIZIQ_RANG;
      gRasm.lineWidth = 1.5;
      gRasm.beginPath();
      for (let x = 0; x <= L.W; x++) { gRasm.moveTo(x * K + 0.5, 0); gRasm.lineTo(x * K + 0.5, rasm.height); }
      for (let y = 0; y <= L.H; y++) { gRasm.moveTo(0, y * K + 0.5); gRasm.lineTo(rasm.width, y * K + 0.5); }
      gRasm.stroke();
    }

    function chizUstki() {
      gUstki.clearRect(0, 0, ustki.width, ustki.height);
      if (soyaKataklar) {
        const c = hex(soyaRang);
        gUstki.globalAlpha = soyaKuchli ? 0.5 : 0.28;
        gUstki.fillStyle = c;
        for (const [x, y] of soyaKataklar) gUstki.fillRect(x * K, y * K, K, K);
        if (soyaKuchli) {
          gUstki.globalAlpha = 0.9;
          gUstki.strokeStyle = c;
          gUstki.lineWidth = 3;
          for (const [x, y] of soyaKataklar) gUstki.strokeRect(x * K + 1.5, y * K + 1.5, K - 3, K - 3);
        }
        gUstki.globalAlpha = 1;
      }
      if (preview) {
        gUstki.globalAlpha = 0.5;
        gUstki.fillStyle = hex(preview.rang);
        for (const [x, y] of preview.kataklar) gUstki.fillRect(x * K, y * K, K, K);
        gUstki.globalAlpha = 1;
      }
    }

    function holatYoz() {
      for (const id of asboblar) tugma[id].setAttribute("aria-pressed", String(id === asbob));
      if (tugma.toliq) {
        tugma.toliq.setAttribute("aria-pressed", String(toliq));
        tugma.toliq.querySelector(".kr-belgi").innerHTML = art.icon(toliq ? "toliq-on" : "toliq-off");
      }
      for (const p of L.PALITRA) rangTugma[p.id].setAttribute("aria-pressed", String(p.id === rang));
      if (tugma.bekor) tugma.bekor.disabled = !L.bekorMumkin(tarix);
      if (tugma.qaytar) tugma.qaytar.disabled = !L.qaytarMumkin(tarix);
      const a = L.asbobById(asbob);
      const shaklmi = SHAKL.includes(asbob) && asbob !== "chiziq";
      holatEl.textContent = asbob === "ochirgich" ? a.nom
        : `${a.nom} · ${L.rangNomi(rang)}` + (shaklmi ? (toliq ? " · ichi toʻla" : " · ichi boʻsh") : "");
    }

    function hammasiniChiz() {
      chizRasm();
      chizUstki();
      holatYoz();
    }

    // ---------- Katak koordinatasi ----------
    function katak(e) {
      const r = ustki.getBoundingClientRect();
      const x = Math.floor(((e.clientX - r.left) / (r.width || 1)) * L.W);
      const y = Math.floor(((e.clientY - r.top) / (r.height || 1)) * L.H);
      return [Math.min(L.W - 1, Math.max(0, x)), Math.min(L.H - 1, Math.max(0, y))];
    }

    // ---------- Harakatni tugallash ----------
    // Tarixga faqat taxta o'zgarsa yoziladi; jurnalga — har tugallangan chizish (qalam/o'chirg'ich/chelak — o'zgargan bo'lsa)
    function tugalla(hr, yangi, ozgargan) {
      const ozgardi = !L.teng(yangi, tarix.hozir);
      if (ozgardi) tarix = L.tarixQoy(tarix, yangi);
      ish = L.nusxa(tarix.hozir);
      preview = null;
      hammasiniChiz();
      if (!ozgardi && (hr.asbob === "qalam" || hr.asbob === "ochirgich" || hr.asbob === "chelak")) return;
      if (hr.asbob !== "chelak" && !SHAKL.includes(hr.asbob) && !ozgargan.length) return;
      jurnal.push(hr);
      onHarakat(hr, holat());
    }

    function tarixAmal(id) {
      if (id === "bekor") {
        if (!L.bekorMumkin(tarix)) return;
        tarix = L.tarixBekor(tarix);
      } else if (id === "qaytar") {
        if (!L.qaytarMumkin(tarix)) return;
        tarix = L.tarixQaytar(tarix);
      } else if (id === "tozalash") {
        if (L.boshmi(tarix.hozir)) return;
        tarix = L.tarixQoy(tarix, L.boshTaxta());
      }
      ish = L.nusxa(tarix.hozir);
      hammasiniChiz();
      const hr = { asbob: id };
      jurnal.push(hr);
      onHarakat(hr, holat());
    }

    function amal(id) {
      if (id === "saqlash") {
        if (o.onSaqlash) o.onSaqlash(L.nusxa(tarix.hozir));
        return;
      }
      tarixAmal(id);
    }

    // ---------- Pointer ----------
    function boshla(e) {
      if (qulf || yopiq || sudrash || e.button !== 0) return;
      e.preventDefault();
      const a = katak(e);
      // Asbob va rang boshlanishda qotiriladi: sudrash paytida (ikkinchi barmoq bilan) tugma bosilsa ham o'zgarmaydi
      sudrash = { pid: e.pointerId, a, b: a, kataklar: new Set(), oxirgi: a, asbob, rang, toliq };
      try { ustki.setPointerCapture(e.pointerId); } catch (err) { /* ushlab bo'lmasa ham hodisalar canvas'ga keladi */ }
      if (asbob === "chelak") {
        const natija = L.bajar(ish, { asbob: "chelak", rang, a });
        const hr = { asbob: "chelak", rang, toliq: false, a, b: a, kataklar: natija.kataklar };
        sudrash = null;
        try { ustki.releasePointerCapture(e.pointerId); } catch (err) { /* e'tiborsiz */ }
        if (natija.kataklar.length) sound.play("tak");
        tugalla(hr, natija.taxta, natija.kataklar);
        return;
      }
      if (asbob === "qalam" || asbob === "ochirgich") {
        qalamQoy([a]);
        chizRasm();
        return;
      }
      preview = { kataklar: L.rasterla({ asbob, a, b: a, toliq }), rang };
      chizUstki();
    }

    // Qalam/o'chirg'ich: kataklar ishchi nusxaga darhol tushadi
    function qalamQoy(kataklar) {
      const v = sudrash.asbob === "ochirgich" ? L.BOSH : L.rangIdx(sudrash.rang);
      for (const [x, y] of kataklar) {
        sudrash.kataklar.add(L.indeks(x, y));
        ish[L.indeks(x, y)] = v;
      }
    }

    function sur(e) {
      if (!sudrash || e.pointerId !== sudrash.pid) return;
      const b = katak(e);
      if (b[0] === sudrash.oxirgi[0] && b[1] === sudrash.oxirgi[1]) return;
      const s = sudrash;
      if (s.asbob === "qalam" || s.asbob === "ochirgich") {
        qalamQoy(L.chiziq(s.oxirgi, b)); // tez surilganda kataklar orasida bo'shliq qolmasin
        s.oxirgi = b;
        s.b = b;
        chizRasm();
        return;
      }
      s.oxirgi = b;
      s.b = b;
      preview = { kataklar: L.rasterla({ asbob: s.asbob, a: s.a, b, toliq: s.toliq }), rang: s.rang };
      chizUstki();
    }

    function qoyibYubor(e, bekor) {
      if (!sudrash || e.pointerId !== sudrash.pid) return;
      const s = sudrash;
      sudrash = null;
      if (bekor || yopiq) {
        ish = L.nusxa(tarix.hozir);
        preview = null;
        hammasiniChiz();
        return;
      }
      if (s.asbob === "qalam" || s.asbob === "ochirgich") {
        const kataklar = [...s.kataklar].map((i) => [i % L.W, Math.floor(i / L.W)]);
        const ozgargan = kataklar.filter(([x, y]) => ish[L.indeks(x, y)] !== tarix.hozir[L.indeks(x, y)]);
        const hr = { asbob: s.asbob, rang: s.asbob === "ochirgich" ? null : s.rang, toliq: false, a: s.a, b: s.b, kataklar };
        if (ozgargan.length) sound.play("tak");
        tugalla(hr, ish, ozgargan);
        return;
      }
      const hr = { asbob: s.asbob, rang: s.rang, toliq: s.asbob === "chiziq" ? false : s.toliq, a: s.a, b: s.b };
      const natija = L.bajar(tarix.hozir, hr);
      hr.kataklar = natija.kataklar;
      sound.play("tak");
      tugalla(hr, natija.taxta, natija.kataklar);
    }

    ustki.addEventListener("pointerdown", boshla);
    ustki.addEventListener("pointermove", sur);
    ustki.addEventListener("pointerup", (e) => qoyibYubor(e, false));
    ustki.addEventListener("pointercancel", (e) => qoyibYubor(e, true));
    ustki.addEventListener("lostpointercapture", (e) => qoyibYubor(e, true));
    taxtaEl.addEventListener("contextmenu", (e) => e.preventDefault());

    // ---------- Tezkor tugmalar (faqat klaviaturali qurilmada) ----------
    // e.code — klaviatura tili qanday bo'lmasin, o'sha tugma. Mac'da Ctrl o'rnida Cmd ham qabul qilinadi.
    function klaviatura(e) {
      if (yopiq || e.repeat || e.altKey) return;
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const harf = /^Key[A-Z]$/.test(e.code || "") ? e.code.slice(3).toLowerCase() : String(e.key || "").toLowerCase();
      const id = harf === "z" ? (e.shiftKey ? "qaytar" : "bekor") : harf === "y" ? "qaytar" : harf === "s" ? "saqlash" : null;
      if (!id) return;
      e.preventDefault(); // Ctrl+S — brauzer "saqlash" oynasini ochmasin
      if (qulf || !amallar.includes(id)) return;
      sound.play("tap");
      amal(id);
    }
    const klaviaturaniOl = () => root.document.removeEventListener("keydown", klaviatura);
    if (tezkor) {
      root.document.addEventListener("keydown", klaviatura);
      ui.onCleanup(klaviaturaniOl); // bosh ekranga qaytilsa ham tinglovchi qolib ketmaydi
    }

    // ---------- Tanlash ----------
    function asbobTanla(id) {
      if (!asboblar.includes(id)) return;
      asbob = id;
      holatYoz();
    }
    function rangTanla(id) {
      if (!L.rangById(id)) return;
      rang = id;
      holatYoz();
    }
    function toliqQoy(on) {
      toliq = !!on;
      holatYoz();
    }

    // Maslahat: kerakli tugma yonib-o'chadi (javobni aytmaydi — asbobni ko'rsatadi)
    function yorit(turi, id) {
      const b = turi === "rang" ? rangTugma[id] : tugma[id];
      if (!b) return;
      b.classList.remove("yorit");
      void b.offsetWidth;
      b.classList.add("yorit");
      setTimeout(() => b.classList.remove("yorit"), 1800);
    }

    function holat() {
      return {
        taxta: L.nusxa(tarix.hozir), asbob, rang, toliq, jurnal: jurnal.slice(),
        bekor: L.bekorMumkin(tarix), qaytar: L.qaytarMumkin(tarix),
      };
    }

    // Harakatni dasturdan bajarish (yechim ko'rsatish, avtomat o'ynovchi). { animatsiya: true } — kataklar
    // ketma-ket bo'yaladi (≈ 0,5 s); { jim: true } — jurnalga yozilmaydi va onHarakat chaqirilmaydi.
    function chiz(hr, sozlama) {
      const s = sozlama || {};
      if (L.TARIX_AMAL.includes(hr.asbob)) {
        for (let k = 0; k < (hr.soni || 1); k++) tarixAmal(hr.asbob);
        return Promise.resolve();
      }
      const natija = L.bajar(tarix.hozir, hr);
      const toliqHr = { asbob: hr.asbob, rang: hr.rang == null ? null : hr.rang, toliq: !!hr.toliq, a: hr.a || (hr.kataklar && hr.kataklar[0]) || [0, 0], b: hr.b || (hr.kataklar && hr.kataklar[hr.kataklar.length - 1]) || [0, 0], kataklar: natija.kataklar };
      const yakun = () => {
        animatsiya = null;
        if (s.jim) {
          if (!L.teng(natija.taxta, tarix.hozir)) tarix = L.tarixQoy(tarix, natija.taxta);
          ish = L.nusxa(tarix.hozir);
          preview = null;
          hammasiniChiz();
        } else tugalla(toliqHr, natija.taxta, natija.kataklar);
      };
      if (!s.animatsiya || !natija.kataklar.length || root.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        yakun();
        return Promise.resolve();
      }
      const v = hr.asbob === "ochirgich" ? L.BOSH : L.rangIdx(hr.rang);
      const kataklar = natija.kataklar.slice().sort((p, q) => p[1] - q[1] || p[0] - q[0]);
      const qadamlar = Math.min(12, kataklar.length);
      const ulush = Math.ceil(kataklar.length / qadamlar);
      let k = 0;
      return ui.settle((done) => {
        const tik = () => {
          for (let j = 0; j < ulush && k < kataklar.length; j++, k++) ish[L.indeks(kataklar[k][0], kataklar[k][1])] = v;
          chizRasm();
          if (k < kataklar.length) animatsiya = setTimeout(tik, 500 / qadamlar);
          else { yakun(); done(); }
        };
        tik();
      });
    }

    function ornat(taxta) {
      if (animatsiya) { clearTimeout(animatsiya); animatsiya = null; }
      tarix = L.tarixYasa(L.nusxa(taxta));
      ish = L.nusxa(tarix.hozir);
      preview = null;
      hammasiniChiz();
    }

    function soya(kataklar, rangId, kuchli) {
      soyaKataklar = kataklar ? kataklar.slice() : null;
      soyaRang = rangId || null;
      soyaKuchli = !!kuchli;
      chizUstki();
    }

    function qulfla(on) {
      qulf = !!on;
      el.classList.toggle("qulf", qulf);
    }

    function yop() {
      yopiq = true;
      qulfla(true);
      klaviaturaniOl();
      if (animatsiya) { clearTimeout(animatsiya); animatsiya = null; }
    }

    hammasiniChiz();
    const api = {
      el, holat, chiz, ornat, soya, qulfla, yop, yorit, asbobTanla, rangTanla, toliqQoy,
      tarixBosh: () => ornat(tarix.hozir),
      bekor: () => tarixAmal("bekor"), qaytar: () => tarixAmal("qaytar"), tozala: () => tarixAmal("tozalash"),
      jurnalTozala: () => { jurnal = []; },
      onHarakatQoy: (fn) => { onHarakat = fn || (() => {}); },
    };
    QK.taxta = api;
    return api;
  }

  // Kichik rasmcha (galereya, namuna kartalari): canvas, katak 4 px
  function kichikRasm(taxta, katak) {
    const k = katak || 4;
    const c = h("canvas", { class: "kr-rasmcha", width: L.W * k, height: L.H * k, "aria-hidden": "true" });
    const g = c.getContext("2d");
    g.fillStyle = OQ;
    g.fillRect(0, 0, c.width, c.height);
    for (let y = 0; y < L.H; y++) {
      for (let x = 0; x < L.W; x++) {
        const v = taxta[L.indeks(x, y)];
        if (v === L.BOSH) continue;
        g.fillStyle = L.PALITRA[v].hex;
        g.fillRect(x * k, y * k, k, k);
      }
    }
    return c;
  }

  QK.taxtaYasa = taxtaYasa;
  QK.kichikRasm = kichikRasm;
})(window);
