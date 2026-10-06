// 72-o'yin: o'yinchoq brauzer oynasi — asboblar (← Orqaga, → Oldinga, ↻ Yangilash, manzil satri, ⭐ xatcho'p),
// sahifa (sarlavha, rasm, matn, havolalar), «Bunday sayt yo'q», qidiruv sahifasi, qalqib chiquvchi oyna, so'rov shakli.
// Ko'rinish: umumiy/css/stol.css (.oyna) + css/style.css (.br-); holat va tarix — logic.js (o'zgarmas uslub).
// Manzil: kompyuterda <input> (Enter bilan ochiladi, tarixdan 3 tagacha taklif), telefonda — chiplar (bankdagi saytlar).
// Har harakatdan keyin tinglovchiga hodisa yuboriladi: { amal, id, soz } — mashq tekshiruvi shundan foydalanadi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, sound } = QK;
  const h = ui.h;
  const TAKLIF_SONI = 3;

  let joriy = null; // sinov ilgagi: oxirgi yasalgan oyna

  // opts: holat — boshlang'ich holat; soroq — so'rov shakli ko'rsatiladimi (3-bosqich); onQidir — ixtiyoriy
  function yasa(host, opts) {
    const o = Object.assign({ soroq: false }, opts || {});
    let holat = o.holat || L.yangi();
    let muz = false;       // vaqtincha: oqsoqol gapirayotganda bosib bo'lmaydi
    let toxtagan = false;  // butunlay: vazifa tugadi
    let tinglovchi = null;
    let chiplarOchiq = false;
    let qalqib = null;     // ochiq qalqib oyna elementi
    let yoritilgan = null; // yechimda yoritilgan element
    const xatchoplar = new Set();
    const touch = ui.touchOnly();
    const band = () => muz || toxtagan;
    const xabar = (hodisa) => { if (tinglovchi) tinglovchi(hodisa, api); };

    // ---------- Asboblar qatori ----------
    const asbob = (amal, belgi, yozuv) => h("button", { class: "br-asbob", type: "button", "data-amal": amal, "aria-label": yozuv },
      h("span", { class: "br-asbob-belgi", "aria-hidden": "true", text: belgi }),
      h("span", { class: "br-asbob-yozuv", text: yozuv }));
    const orqagaBtn = asbob("orqaga", "←", "Orqaga");
    const oldingaBtn = asbob("oldinga", "→", "Oldinga");
    const yangilaBtn = asbob("yangila", "↻", "Yangilash");
    const xatchopBtn = h("button", { class: "br-xatchop", type: "button", "data-amal": "xatchop", "aria-label": "Xatchoʻp", "aria-pressed": "false", text: "☆" });
    const qulfEl = h("span", { class: "br-qulf", "aria-hidden": "true" });
    const takliflarEl = h("div", { class: "br-takliflar", hidden: true });
    let manzilInput = null;
    let manzilBtn = null;
    if (touch) {
      manzilBtn = h("button", { class: "br-manzil-tugma", type: "button", "data-amal": "manzil", "aria-label": "Manzil satri", "aria-expanded": "false" });
    } else {
      manzilInput = h("input", {
        class: "br-manzil-input", type: "text", "data-amal": "manzil", autocomplete: "off", autocapitalize: "off",
        autocorrect: "off", spellcheck: "false", "aria-label": "Manzil satri", placeholder: "manzil",
      });
    }
    const manzilSatr = h("div", { class: "br-manzil" }, qulfEl, manzilInput || manzilBtn, takliflarEl);
    const asboblar = h("div", { class: "br-asboblar", role: "toolbar", "aria-label": "Brauzer asboblari" },
      orqagaBtn, oldingaBtn, yangilaBtn, manzilSatr, xatchopBtn);
    const chiplarEl = h("div", { class: "br-chiplar", hidden: true });
    const sahifaEl = h("div", { class: "br-sahifa" });
    const ichi = h("div", { class: "oyna-ichi br-ichi" }, sahifaEl);
    const ichiWrap = h("div", { class: "br-ichi-wrap" }, ichi);
    const el = h("div", { class: "oyna faol br-oyna" },
      h("div", { class: "oyna-sarlavha", html: QK.stolArt.icon("internet") }, h("span", { class: "oyna-nom", text: "Internet" })),
      asboblar, chiplarEl, ichiWrap);
    host.append(el);

    // Telefon chiplari: bankdagi saytlar manzillari (bir marta chiziladi)
    if (touch) {
      chiplarEl.append(h("div", { class: "br-chiplar-sarlavha", text: "Qaysi saytni ochamiz?" }));
      for (const m of L.CHIP_MANZILLAR) {
        chiplarEl.append(h("button", { class: "br-chip", type: "button", "data-chip": m, text: m, onClick: () => { if (band()) return; chiplarYop(); och(m); } }));
      }
      chiplarEl.append(h("button", { class: "br-chip bekor", type: "button", "data-chip": "", text: "Bekor", onClick: () => { sound.play("tap"); chiplarYop(); } }));
    }

    // ---------- Chizish ----------
    function chizAsboblar() {
      const e = L.joriy(holat);
      const p = L.sahifa(holat);
      orqagaBtn.disabled = band() || !L.orqagaMumkin(holat);
      oldingaBtn.disabled = band() || !L.oldingaMumkin(holat);
      yangilaBtn.disabled = band();
      xatchopBtn.disabled = band() || !p;
      const yoqilgan = !!p && xatchoplar.has(e.manzil);
      xatchopBtn.textContent = yoqilgan ? "★" : "☆";
      xatchopBtn.classList.toggle("yoqilgan", yoqilgan);
      xatchopBtn.setAttribute("aria-pressed", yoqilgan ? "true" : "false");
      qulfEl.innerHTML = p ? QK.gameArt.qulf(p.qulf) : "";
      qulfEl.classList.toggle("yoq", !p);
      if (manzilInput) {
        manzilInput.disabled = band();
        if (root.document.activeElement !== manzilInput) manzilInput.value = e.manzil;
      }
      if (manzilBtn) {
        manzilBtn.disabled = band();
        manzilBtn.textContent = e.manzil || "manzil";
        manzilBtn.setAttribute("aria-expanded", chiplarOchiq ? "true" : "false");
      }
      chiplarEl.hidden = !chiplarOchiq;
      el.classList.toggle("br-band", band());
    }

    const havolaTugma = (l) => h("button", { class: "br-havola", type: "button", "data-havola": l.sahifa, text: l.matn,
      onClick: () => { if (band()) return; havola(l.sahifa); } });

    // Oddiy sahifa: sarlavha, rasm, gaplar, havolalar (+ so'rov shakli)
    function chizOddiy(p) {
      sahifaEl.append(
        h("h2", { class: "br-sarlavha", text: p.sarlavha }),
        h("div", { class: "br-rasm", html: QK.gameArt.sahifa(p.rasm) }),
        ...p.matn.map((g, k) => h("p", { class: "br-gap", "data-gap": k, text: g })));
      if (o.soroq && p.soroq) sahifaEl.append(soroqShakli(p.soroq));
      if (p.havolalar.length) sahifaEl.append(h("div", { class: "br-havolalar" }, ...p.havolalar.map(havolaTugma)));
    }

    // Parol / telefon so'rovi: maydon, «Yuborish» (xato), «Chiqib ketaman» (to'g'ri)
    function soroqShakli(tur) {
      const telefon = tur === "telefon";
      const maydon = h("input", {
        class: "br-soroq-maydon", type: "text", inputmode: telefon ? "numeric" : "text", autocomplete: "off",
        "aria-label": telefon ? "Telefon raqami" : "Parol", placeholder: telefon ? "+998 __ ___ __ __" : "parol",
      });
      maydon.addEventListener("input", () => {
        if (band()) { maydon.value = ""; return; }
        xabar({ amal: "yoz", id: L.joriyId(holat) });
      });
      return h("div", { class: "br-soroq" },
        h("label", { class: "br-soroq-yozuv" }, h("span", { text: telefon ? "Telefon raqamingiz:" : "Parolingiz:" }), maydon),
        h("div", { class: "br-soroq-tugmalar" },
          h("button", { class: "br-soroq-yubor", type: "button", "data-amal": "yubor", text: "Yuborish", onClick: () => { if (band()) return; sound.play("tap"); xabar({ amal: "yubor", id: L.joriyId(holat) }); } }),
          h("button", { class: "br-soroq-chiq", type: "button", "data-amal": "chiq", text: "Chiqib ketaman", onClick: () => { if (band()) return; chiq(); } })));
    }

    // Qidiruv sahifasi: satr (kompyuter — input + «Qidir», telefon — so'z chiplari) va natijalar
    function chizQidiruv(p, soz) {
      sahifaEl.append(h("h2", { class: "br-sarlavha", text: p.sarlavha }));
      if (touch) {
        sahifaEl.append(h("div", { class: "br-qidir-chiplar" },
          ...L.QIDIRUV_SOZLAR.map((s) => h("button", { class: "br-chip" + (s === soz ? " faol" : ""), type: "button", "data-soz": s, text: s,
            onClick: () => { if (band()) return; qidir(s); } }))));
      } else {
        const inp = h("input", { class: "br-qidir-input", type: "search", value: soz || "", autocomplete: "off", autocapitalize: "off", spellcheck: "false", "aria-label": "Qidiruv satri", placeholder: "soʻz" });
        const btn = h("button", { class: "btn sm br-qidir-tugma", type: "button", "data-amal": "qidir", text: "Qidir", onClick: () => { if (band()) return; qidir(inp.value); } });
        inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); if (!band()) qidir(inp.value); } });
        sahifaEl.append(h("div", { class: "br-qidir" }, h("span", { class: "br-qidir-belgi", html: QK.gameArt.sahifa("qidiruv") }), inp, btn));
      }
      if (!soz) {
        sahifaEl.append(h("p", { class: "br-gap br-qidir-izoh", text: p.matn[0] }));
        return;
      }
      const nat = L.qidir(soz);
      if (!nat.length) {
        sahifaEl.append(h("p", { class: "br-gap br-qidir-izoh", text: `«${soz}» boʻyicha hech narsa topilmadi. Qisqaroq, asosiy soʻzni yoz.` }));
        return;
      }
      sahifaEl.append(h("div", { class: "br-natijalar" }, ...nat.map((q) => h("button", { class: "br-natija", type: "button", "data-natija": q.id,
        onClick: () => { if (band()) return; natija(q.id); } },
      h("span", { class: "br-natija-sarlavha", text: q.sarlavha }),
      h("span", { class: "br-natija-manzil", text: q.manzil }),
      h("span", { class: "br-natija-gap", text: q.matn[0] })))));
    }

    function chizSahifa() {
      yoritYop();
      sahifaEl.textContent = "";
      const e = L.joriy(holat);
      const p = L.sahifa(holat);
      if (!p) {
        sahifaEl.append(h("div", { class: "br-yoq" },
          h("div", { class: "br-rasm", html: QK.gameArt.sahifa("yoq") }),
          h("h2", { class: "br-sarlavha", text: "Bunday sayt yoʻq" }),
          h("p", { class: "br-gap", text: `«${e.manzil}» topilmadi. Manzilni tekshirib, qayta yoz.` })));
      } else if (p.id === L.QIDIRUV) {
        chizQidiruv(p, e.soz);
      } else {
        chizOddiy(p);
      }
      ichi.scrollTop = 0;
    }

    function chiz() {
      chizAsboblar();
      chizSahifa();
    }

    // ---------- Manzil satri ----------
    function takliflarChiz() {
      takliflarEl.textContent = "";
      const list = manzilInput ? L.takliflar(holat, manzilInput.value, TAKLIF_SONI) : [];
      takliflarEl.hidden = !list.length;
      for (const m of list) {
        const b = h("button", { class: "br-taklif", type: "button", "data-taklif": m, text: m });
        b.addEventListener("pointerdown", (e) => e.preventDefault()); // input fokusi yo'qolmasin
        b.addEventListener("click", () => { if (band()) return; takliflarYop(); och(m); });
        takliflarEl.append(b);
      }
    }
    const takliflarYop = () => { takliflarEl.hidden = true; takliflarEl.textContent = ""; };
    function chiplarYop() {
      chiplarOchiq = false;
      chizAsboblar();
    }

    if (manzilInput) {
      manzilInput.addEventListener("focus", () => {
        if (band()) return;
        manzilInput.select();
        takliflarChiz();
        xabar({ amal: "manzil", id: L.joriyId(holat) });
      });
      manzilInput.addEventListener("input", takliflarChiz);
      manzilInput.addEventListener("blur", () => setTimeout(takliflarYop, 150));
      manzilInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { manzilInput.value = L.joriy(holat).manzil; manzilInput.blur(); return; }
        if (e.key !== "Enter") return;
        e.preventDefault();
        if (band()) return;
        takliflarYop();
        manzilInput.blur();
        och(manzilInput.value);
      });
    }
    if (manzilBtn) {
      manzilBtn.addEventListener("click", () => {
        if (band()) return;
        sound.play("tap");
        chiplarOchiq = !chiplarOchiq;
        chizAsboblar();
        xabar({ amal: chiplarOchiq ? "manzil" : "chiplar", id: L.joriyId(holat) });
      });
    }

    // ---------- Harakatlar ----------
    // Holatni o'zgartirib chizish; o'zgarmasa — false
    function ozgar(yangi, hodisa) {
      if (yangi === holat) {
        if (hodisa.amal === "och") sound.play("retry");
        return false;
      }
      holat = yangi;
      chiz();
      sound.play("tap");
      xabar(Object.assign({ id: L.joriyId(holat) }, hodisa));
      return true;
    }
    const och = (manzil) => ozgar(L.och(holat, manzil), { amal: "och", manzil: L.manzilTozala(manzil) });
    const havola = (id) => ozgar(L.havola(holat, id), { amal: "havola" });
    const orqaga = () => ozgar(L.orqaga(holat), { amal: "orqaga" });
    const oldinga = () => ozgar(L.oldinga(holat), { amal: "oldinga" });
    const natija = (id) => ozgar(L.natija(holat, id), { amal: "natija" });
    const chiq = () => ozgar(L.chiq(holat), { amal: "chiq" });
    function qidir(soz) {
      const s = String(soz || "").trim();
      if (!s) return false;
      return ozgar(L.qidirOch(holat, s), { amal: "qidir", soz: s });
    }
    function yangila() {
      sound.play("tap");
      chizSahifa();
      xabar({ amal: "yangila", id: L.joriyId(holat) });
    }
    function xatchop() {
      const m = L.joriy(holat).manzil;
      if (!L.sahifa(holat)) return;
      sound.play("tap");
      if (xatchoplar.has(m)) xatchoplar.delete(m);
      else xatchoplar.add(m);
      chizAsboblar();
      xabar({ amal: "xatchop", id: L.joriyId(holat), yoqilgan: xatchoplar.has(m) });
    }
    orqagaBtn.addEventListener("click", () => { if (!band()) orqaga(); });
    oldingaBtn.addEventListener("click", () => { if (!band()) oldinga(); });
    yangilaBtn.addEventListener("click", () => { if (!band()) yangila(); });
    xatchopBtn.addEventListener("click", () => { if (!band()) xatchop(); });

    // ---------- Qalqib chiquvchi oyna ----------
    // Sahifa ustida sariq-to'q sariq oyna: burchakda ✕ (yop — to'g'ri), ichida katta tugma (bos — aldaydi)
    function qalqibKorsat(oyna) {
      yop(true);
      const yopBtn = h("button", { class: "br-qalqib-yop", type: "button", "data-amal": "yop", "aria-label": "Yopish", text: "✕" });
      const bosBtn = h("button", { class: "br-qalqib-tugma", type: "button", "data-amal": "bos", text: oyna.tugma });
      yopBtn.addEventListener("click", () => { if (band()) return; yop(); xabar({ amal: "yop", id: L.joriyId(holat) }); });
      bosBtn.addEventListener("click", () => { if (band()) return; sound.play("retry"); xabar({ amal: "bos", id: L.joriyId(holat) }); });
      qalqib = h("div", { class: "br-parda" },
        h("div", { class: "br-qalqib", role: "dialog", "aria-label": oyna.sarlavha },
          h("div", { class: "br-qalqib-ust" }, h("span", { class: "br-qalqib-sarlavha", text: oyna.sarlavha }), yopBtn),
          h("div", { class: "br-qalqib-matn", text: oyna.matn }),
          bosBtn));
      ichiWrap.append(qalqib);
    }
    function yop(jim) {
      if (!qalqib) return;
      qalqib.remove();
      qalqib = null;
      if (!jim) sound.play("tap");
    }

    // ---------- Yechimni ko'rsatish: yoritish ----------
    function yoritYop() {
      if (yoritilgan) yoritilgan.classList.remove("br-yorit");
      yoritilgan = null;
    }
    // nom: manzil | orqaga | oldinga | xatchop | yop | chiq | qidir | havola:ID | natija:ID | gap:N
    function yorit(nom) {
      yoritYop();
      const [tur, qiymat] = String(nom).split(":");
      const target = tur === "manzil" ? manzilSatr : tur === "orqaga" ? orqagaBtn : tur === "oldinga" ? oldingaBtn
        : tur === "xatchop" ? xatchopBtn : tur === "yop" ? el.querySelector("[data-amal=yop]") : tur === "chiq" ? el.querySelector("[data-amal=chiq]")
          : tur === "havola" ? el.querySelector(`[data-havola="${qiymat}"]`) : tur === "natija" ? el.querySelector(`[data-natija="${qiymat}"]`)
            : tur === "gap" ? el.querySelector(`[data-gap="${qiymat}"]`)
              : tur === "qidir" ? el.querySelector(".br-qidir, .br-qidir-chiplar") : null;
      if (!target) return;
      target.classList.add("br-yorit");
      yoritilgan = target;
      if (ichi.contains(target)) target.scrollIntoView({ block: "nearest" });
    }

    // Qadamni tashqaridan bajarish (yechim ko'rsatish, avtomat o'ynovchi): band bo'lsa ham ishlaydi, hodisa yubormaydi
    function bajar(q) {
      const eski = tinglovchi;
      tinglovchi = null;
      if (q.amal === "och") holat = L.och(holat, q.manzil);
      else if (q.amal === "havola") holat = L.havola(holat, q.id);
      else if (q.amal === "orqaga") holat = L.orqaga(holat);
      else if (q.amal === "oldinga") holat = L.oldinga(holat);
      else if (q.amal === "qidir") holat = L.qidirOch(holat, q.soz);
      else if (q.amal === "natija") holat = L.natija(holat, q.id);
      else if (q.amal === "chiq") holat = L.chiq(holat);
      else if (q.amal === "yop") yop(true);
      if (q.amal !== "yop") chiz();
      tinglovchi = eski;
    }

    const api = {
      el,
      holat: () => holat,
      sahifa: () => L.sahifa(holat),
      ornat(y) {
        holat = y;
        chiplarOchiq = false;
        yop(true);
        chiz();
      },
      sozla(o2) { Object.assign(o, o2); chizSahifa(); },
      tingla(fn) { tinglovchi = fn; },
      muzlat(on) { muz = !!on; chizAsboblar(); },
      toxtat() {
        toxtagan = true;
        takliflarYop();
        chiplarOchiq = false;
        el.classList.add("br-toxtagan");
        chizAsboblar();
      },
      och, havola, orqaga, oldinga, yangila, qidir, natija, chiq, xatchop,
      qalqibKorsat, yop, qalqibOchiq: () => !!qalqib,
      yorit, yoritYop, bajar,
      // So'rov maydonini tozalash (1-xatodan keyin)
      soroqTozala() {
        const m = el.querySelector(".br-soroq-maydon");
        if (m) { m.value = ""; m.blur(); }
      },
    };
    joriy = api;
    chiz();
    return api;
  }

  // Sinov ilgagi: QK.brauzer.holat() / och(manzil) / havola(id) / orqaga() / qidir(soz) — oxirgi oynaga
  const ulagich = (nom) => (...a) => (joriy ? joriy[nom](...a) : undefined);
  QK.brauzer = {
    yasa, joriy: () => joriy,
    holat: ulagich("holat"), sahifa: ulagich("sahifa"), och: ulagich("och"), havola: ulagich("havola"), orqaga: ulagich("orqaga"),
    oldinga: ulagich("oldinga"), qidir: ulagich("qidir"), natija: ulagich("natija"), chiq: ulagich("chiq"), yop: ulagich("yop"), bajar: ulagich("bajar"),
  };
})(window);
