// Onlayn tank xonasi: o'qituvchi qurilmasi — doska va hakam; bolalar kod bilan kirib, har raundda bitta satr yozadi.
// Bola satri o'z qurilmasida raund boshidagi holat nusxasida bajariladi — tarmoqqa faqat harakatlar ketadi.
// Mantiq — js/xona-mantiq.js, jang qoidalari — umumiy/js/jang.js, maydon — umumiy/js/jang-ui.js.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { storage, sound, art, ui, jangUi, tankXona: X, onlayn, python: py } = QK;
  const h = ui.h;
  const $ = (id) => root.document.getElementById(id);
  const SITE_HOME = "../../index.html";
  const KIND = "tank";
  const TYPES = ["lobbi", "holat", "natija", "kirdi", "harakat"];
  const BUYRUQLAR = ["move", "back", "left", "right", "fire", "reload", "scan", "radar", "hp", "ammo"];
  const HOST_JIM = 9000; // shuncha vaqt doskadan xabar kelmasa — uzildi

  // ---------- Sahifa: ovoz va bosh tugma ----------
  const store = storage.create("tank-onlayn:v1", 0);
  const sozlama = store.load();
  sound.setMuted(sozlama.muted);
  function ovozTugmasi() {
    $("btn-sound").innerHTML = art.icon(sozlama.muted ? "sound-off" : "sound-on");
    $("btn-sound").setAttribute("aria-label", sozlama.muted ? "Ovozni yoqish" : "Ovozni oʻchirish");
  }
  $("btn-sound").addEventListener("click", () => { sozlama.muted = !sozlama.muted; sound.setMuted(sozlama.muted); store.save(sozlama); ovozTugmasi(); });
  $("btn-home").innerHTML = art.icon("home");
  $("btn-home").addEventListener("click", () => { root.location.href = SITE_HOME; });
  ovozTugmasi();

  const joy = $("joy");
  let tozalash = null; // joriy ekranning taymerlari va xonasi
  function ekran() {
    if (tozalash) { tozalash(); tozalash = null; }
    joy.innerHTML = "";
    return joy;
  }
  // Xona ichida ekran almashishi: xona yopilmaydi (ekran() esa oldingi ekranning xonasini yopadi)
  function sahifa() {
    joy.innerHTML = "";
    return joy;
  }

  // Bolaning yashirin raqami: uzilib qolsa, qayta kirganda o'sha odam bo'ladi
  function kimlikim() {
    const yangi = () => Array.from({ length: 6 }, () => "abcdefghjkmnpqrstuvwxyz23456789"[Math.floor(Math.random() * 31)]).join("");
    try {
      const bor = root.localStorage.getItem("tank:men:v1");
      if (bor && /^[a-z2-9]{6}$/.test(bor)) return bor;
      const k = yangi();
      root.localStorage.setItem("tank:men:v1", k);
      return k;
    } catch (e) {
      return yangi();
    }
  }

  const tugmalar = (...list) => h("div", { class: "to-tugmalar" }, ...list.filter(Boolean));
  const izoh = (matn, cls) => h("p", { class: "to-izoh" + (cls ? " " + cls : ""), text: matn });

  // ---------- Menyu ----------
  function menyu() {
    const el = ekran();
    const bor = onlayn.available() && root.navigator.onLine !== false;
    el.append(
      h("a", { class: "back-link", href: SITE_HOME, text: "◀︎ Barcha oʻyinlar" }),
      h("h1", { class: "to-sarlavha", text: "Tank jangi — onlayn" }),
      izoh("Har raundda hamma bola 5 soniyada bitta satr yozadi, keyin doskada hammasi birga bajariladi. Oxirgi tirik qolgan — gʻolib."),
      h("div", { class: "to-buyruqlar" }, ...BUYRUQLAR.map((b) => h("span", { class: "td-buyruq", text: b + (["move", "back", "left", "right"].includes(b) ? "(n)" : "()") }))),
      tugmalar(
        bor ? ui.button("Xona ochish (oʻqituvchi)", () => hostBoshla(), "big") : null,
        bor ? ui.button("Kod bilan kirish", () => oyinchiBoshla(), "big") : null),
      bor ? null : izoh("Onlayn xona uchun internet kerak.", "yana"),
      izoh("Kod yoziladi — kompyuterda qulay. Telefonda ham boʻladi.", "kichik"));
  }

  // ================= DOSKA (o'qituvchi) =================
  async function hostBoshla() {
    // Kirgan o'qituvchi — natija qaysi sinfga yozilsin (umumiy sinf-tanlov.js)
    const E = {
      box() { const el = ekran(); const q = h("div", { class: "to-quti" }); el.append(q); return q; },
      buttons(list) { joy.append(tugmalar(...list.map((b) => ui.button(b.label, b.onClick, b.secondary ? "secondary" : "")))); },
    };
    const sinf = QK.sinfTanlov ? await QK.sinfTanlov(E) : null;
    hostLobbi(sinf);
  }

  function hostLobbi(sinf) {
    const el = ekran();
    const code = onlayn.makeCode();
    const odamlar = []; // [{ id, qah }] — "Yangi jang" da shu bolalar xonada qoladi
    let m = null; // jang ketyapti
    let harakatlar = {};
    let qoldi = 0;
    let bajarilyapti = false;
    let koz = null;
    let taymer = null;
    let room = null;

    const holati = h("div", { class: "net-status", text: "⏳ Xona ochilmoqda…" });
    const royxat = h("div", { class: "to-royxat" });
    const sinfIzoh = sinf ? izoh(`Natijalar «${sinf.nom}» sinfiga yoziladi.`) : null;
    const boshlaTugma = ui.button("Boshlash", () => jangBoshla(), "big");
    let tugaganKorsatildi = false;
    function lobbiEkrani() {
      el.innerHTML = "";
      el.append(h("h1", { class: "to-sarlavha", text: "Tank jangi — xona" }),
        h("div", { class: "code-lead", text: "Xona kodi:" }), h("div", { class: "code-big", text: code }),
        sinfIzoh, holati, royxat, tugmalar(boshlaTugma, ui.button("Xonani yopish", () => { yop(); menyu(); }, "secondary")));
    }
    lobbiEkrani();
    QK.probe = { rejim: "host", code, odamlar };

    function lobbiChiz() {
      royxat.innerHTML = "";
      for (const o of odamlar) royxat.append(h("span", { class: "to-bola", style: `--rang:${X.qahById(o.qah).rang}` }, h("i"), X.qahById(o.qah).nom));
      holati.textContent = odamlar.length ? `${odamlar.length} ta bola tayyor (${X.MAX_ODAM} tagacha)` : "Bolalar kodni kiritishini kutamiz…";
      boshlaTugma.disabled = odamlar.length < X.MIN_ODAM;
      boshlaTugma.textContent = `Boshlash (${odamlar.length})`;
    }
    const lobbiYubor = () => room.send("lobbi", { ids: odamlar.map((o) => o.id), qah: odamlar.map((o) => o.qah) });

    function yop() {
      clearInterval(taymer);
      if (room) room.leave();
    }
    tozalash = yop;

    room = onlayn.xona({
      kind: KIND, code, me: "host", role: "host", types: TYPES, sinf: sinf && sinf.id,
      on: {
        status(s) {
          QK.probe.status = s;
          if (s === "ready") { lobbiChiz(); lobbiYubor(); }
          else if (s === "error") { holati.textContent = "✗ Server bilan aloqa uzildi."; holati.classList.add("bad"); }
        },
        sinf(ok) { if (!ok && sinfIzoh) sinfIzoh.textContent = "⚠ Natijani sinfga yozib boʻlmadi (qayta kiring). Jang baribir ishlaydi."; },
        message(msg) {
          if (msg.type === "kirdi" && !m) {
            const qah = String(msg.data.qah || "");
            if (!X.QAHRAMONLAR.some((q) => q.id === qah)) return;
            if (odamlar.some((o) => o.qah === qah && o.id !== msg.from)) return; // rang band
            const bor = odamlar.find((o) => o.id === msg.from);
            if (bor) bor.qah = qah;
            else if (odamlar.length < X.MAX_ODAM) odamlar.push({ id: msg.from, qah });
            lobbiChiz();
            lobbiYubor();
          } else if (msg.type === "harakat" && m && !bajarilyapti && !m.tugadi) {
            const t = X.tank(m, msg.from);
            if (!t || !t.tirik || msg.data.r !== m.raund + 1) return;
            const toza = X.harakatlarToza(msg.data.h, msg.data.a);
            if (!toza) return;
            harakatlar[msg.from] = toza;
            jangChiz();
            if (X.tiriklar(m).every((id) => harakatlar[id])) raundYakuni();
          }
        },
      },
    });

    // Lobbida har 2 soniyada ro'yxat qayta yuboriladi (yangi kirganlar va yo'qolgan xabarlar uchun)
    taymer = setInterval(() => {
      if (!m) { lobbiYubor(); return; }
      if (bajarilyapti || m.tugadi) return;
      qoldi -= 1;
      room.send("holat", X.holatPaketi(m, qoldi));
      jangChiz();
      if (qoldi <= 0) raundYakuni();
    }, 1000);

    // ---------- Jang ----------
    let jangEl = null;
    let jadval = null;
    let sarlavha = null;
    function jangBoshla() {
      if (odamlar.length < X.MIN_ODAM) return;
      m = X.maydon(odamlar);
      tugaganKorsatildi = false;
      QK.probe.m = m;
      el.innerHTML = "";
      sarlavha = h("div", { class: "to-raund" });
      jangEl = h("div", { class: "to-jang" });
      const chap = h("div", { class: "to-maydon" });
      jadval = h("div", { class: "to-jadval" });
      jangEl.append(chap, jadval);
      el.append(h("div", { class: "to-kod-kichik", text: `Xona: ${code}` }), sarlavha, jangEl,
        tugmalar(ui.button("Toʻxtatish", () => { if (m && !m.tugadi) { m.tugadi = "tugadi"; jangTugadi(); } }, "secondary")));
      koz = jangUi.maydonKorinishi(chap, m);
      raundBoshla();
    }

    function raundBoshla() {
      harakatlar = {};
      qoldi = X.RAUND_SONIYA;
      bajarilyapti = false;
      room.send("holat", X.holatPaketi(m, qoldi));
      jangChiz();
    }

    function jangChiz() {
      if (!m || !jadval) return;
      sarlavha.textContent = m.tugadi ? "Jang tugadi" : bajarilyapti ? `${m.raund}-raund bajarilmoqda…` : `${m.raund + 1}-raund · ⏱ ${Math.max(0, qoldi)} s`;
      jadval.innerHTML = "";
      for (const t of m.tanklar) {
        const holat = !t.tirik ? "yiqildi" : harakatlar[t.id] ? "✓ yubordi" : "yozyapti…";
        jadval.append(h("div", { class: "to-qator" + (t.tirik ? "" : " olgan") },
          h("span", { class: "to-rang", style: `background:${t.rang}` }),
          h("span", { class: "to-nom", text: X.qahById(t.qah).nom }),
          h("span", { class: "to-jon", text: "♥".repeat(Math.max(0, t.jon)) || "—", "aria-label": `jon ${t.jon}` }),
          h("span", { class: "to-tg", text: `🎯 ${m.tg[t.id] || 0}` }),
          h("span", { class: "to-holat", text: holat })));
      }
    }

    async function raundYakuni() {
      if (bajarilyapti || !m || m.tugadi) return;
      bajarilyapti = true;
      const tartib = X.tartibYasa(m);
      room.send("natija", X.natijaPaketi(m, tartib, harakatlar));
      jangChiz();
      const yozuv = X.raundniBajar(m, tartib, harakatlar);
      await koz.oyna(yozuv);
      if (m.tugadi) jangTugadi();
      else raundBoshla();
    }

    function jangTugadi() {
      if (tugaganKorsatildi) return; // "To'xtatish" animatsiya paytida bosilgan bo'lsa — ikki marta chiqmasin
      tugaganKorsatildi = true;
      bajarilyapti = false;
      room.send("holat", X.holatPaketi(m, 0)); // tugadi=1: server natijani sinfga yozadi
      koz.chiz();
      jangChiz();
      sound.play("win");
      const g = X.golib(m);
      const reyting = X.reyting(m);
      const karta = h("div", { class: "to-natija" },
        h("div", { class: "to-natija-nom", text: g ? `${X.qahById(X.tank(m, g).qah).nom} tank yutdi! 🏆` : "Durang" }),
        h("ol", { class: "to-reyting" }, ...reyting.map((id) => {
          const t = X.tank(m, id);
          return h("li", {}, h("span", { class: "to-rang", style: `background:${t.rang}` }), `${X.qahById(t.qah).nom} — ${t.tirik ? "♥".repeat(t.jon) : "yiqildi"}, 🎯 ${m.tg[id] || 0}`);
        })),
        tugmalar(
          ui.button("Yangi jang", () => { m = null; QK.probe.m = null; lobbiEkrani(); lobbiChiz(); lobbiYubor(); }, "big"),
          ui.button("Xonani yopish", () => { yop(); menyu(); }, "secondary")));
      jangEl.after(karta);
      karta.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // ================= BOLA =================
  function oyinchiBoshla() {
    const el = ekran();
    const kod = h("input", { class: "to-kod-input", inputmode: "numeric", maxlength: "4", placeholder: "4 xonali kod", "aria-label": "Xona kodi", autocomplete: "off" });
    const xato = izoh("", "yana");
    const kir = () => {
      if (!onlayn.validCode(kod.value.trim())) { xato.textContent = "Kod 4 ta raqamdan iborat boʻladi."; return; }
      oyinchiKir(kod.value.trim());
    };
    kod.addEventListener("keydown", (e) => { if (e.key === "Enter") kir(); });
    el.append(h("h1", { class: "to-sarlavha", text: "Kod bilan kirish" }), izoh("Oʻqituvchi doskaga yozgan kodni kiriting."), kod, xato,
      tugmalar(ui.button("Kirish", kir, "big"), ui.button("Orqaga", menyu, "secondary")));
    setTimeout(() => kod.focus(), 60);
  }

  function oyinchiKir(code) {
    const el = ekran();
    const me = kimlikim();
    let qah = "";
    let band = [];
    let m = null;
    let koz = null;
    let rejim = "kutish"; // kutish | tanlash | lobbi | jang | tomosha | natija
    let raund = 0; // ko'rsatilayotgan raund (yozish uchun)
    let yuborildi = false;
    let oxirgi = Date.now();
    let navbat = Promise.resolve(); // natija animatsiyasi tugaguncha keyingi holat kutadi
    QK.probe = { rejim: "guest", code, me };

    const holati = h("div", { class: "net-status", text: "⏳ Xonaga kirilmoqda…" });
    el.append(h("h1", { class: "to-sarlavha", text: `Xona: ${code}` }), holati);
    let kuzat = null;

    const xato = (matn) => {
      const e = ekran();
      e.append(h("h1", { class: "to-sarlavha", text: "Onlayn xona" }), izoh(matn, "yana"), tugmalar(ui.button("Orqaga", menyu, "secondary")));
    };

    function rangTanlash() {
      rejim = "tanlash";
      const e = sahifa();
      e.append(h("h1", { class: "to-sarlavha", text: "Tanking rangini tanla" }), izoh("Xiralari boshqa bolalarniki."));
      const grid = h("div", { class: "to-ranglar" });
      for (const q of X.QAHRAMONLAR) {
        const olingan = band.includes(q.id) && q.id !== qah;
        const b = h("button", { class: "to-rang-btn", type: "button", style: `--rang:${q.rang}`, "aria-label": q.nom, disabled: olingan || null },
          h("span", { class: "to-rang-tank", html: tankRasm(olingan ? "#C9C4BA" : q.rang) }), h("span", { text: q.nom }));
        b.addEventListener("click", () => {
          qah = q.id;
          sound.play("tap");
          room.send("kirdi", { qah });
          kutishEkran("Oʻqituvchi boshlashini kutamiz…");
        });
        grid.append(b);
      }
      e.append(grid, tugmalar(ui.button("Chiqish", () => { yop(); menyu(); }, "secondary")));
    }

    function kutishEkran(matn) {
      rejim = "lobbi";
      m = null; // keyingi jang yangi maydondan boshlanadi
      raund = 0;
      const e = sahifa();
      e.append(h("h1", { class: "to-sarlavha", text: `Xona: ${code}` }),
        qah ? h("span", { class: "to-rang-tank katta", html: tankRasm(X.qahById(qah).rang) }) : null,
        izoh(matn), tugmalar(ui.button("Chiqish", () => { yop(); menyu(); }, "secondary")));
    }

    // Jang ekrani: maydon, raund va (tirik bo'lsa) buyruq satri
    let sarlavha = null;
    let panel = null;
    function jangEkrani() {
      rejim = "jang";
      const e = sahifa();
      sarlavha = h("div", { class: "to-raund" });
      const ikki = h("div", { class: "to-jang" });
      const chap = h("div", { class: "to-maydon" });
      const ong = h("div", { class: "to-panel" });
      ikki.append(chap, ong);
      e.append(sarlavha, ikki);
      for (const t of m.tanklar) t.men = t.id === me;
      koz = jangUi.maydonKorinishi(chap, m);
      const men = X.tank(m, me);
      ong.append(h("div", { class: "to-men" }, h("span", { class: "to-rang", style: `background:${men.rang}` }), "Sening tanking"));
      panel = jangUi.buyruqPaneli(ong, {
        buyruqlar: BUYRUQLAR,
        onSatr: async (kod, yoz) => {
          if (yuborildi) { yoz("Bu raundda satr yuborilgan. Keyingi raundni kut.", "izoh"); return; }
          if (!X.tank(m, me).tirik) return;
          const r = X.yozibOl(m, me, kod, py);
          if (r.xato) {
            yoz("↻ " + r.xato.text, "xato");
            if (r.xato.hint) yoz(r.xato.hint, "izoh");
            return; // xato — urinish sanalmaydi
          }
          for (const s of r.chiqish) yoz(s, "chiqish");
          if (r.chegaraOshdi) yoz("Bitta satrda 8 ta harakat bajariladi — qolgani hisobga olinmaydi.", "izoh");
          room.send("harakat", { r: raund, h: r.harakatlar.map((q) => q.h), a: r.harakatlar.map((q) => q.a) });
          yuborildi = true;
          yoz(`✓ ${raund}-raund uchun yuborildi (${r.harakatlar.length} ta harakat). Boshqalarni kutamiz…`, "izoh");
        },
      });
    }

    function natijaEkrani(p) {
      rejim = "natija";
      const g = p.golib;
      const orin = p.ids.indexOf(me) + 1;
      const karta = h("div", { class: "to-natija" },
        h("div", { class: "to-natija-nom", text: g === me ? "Sen yutding! 🏆" : g ? `${X.qahById(p.qah[p.ids.indexOf(g)]).nom} tank yutdi` : "Durang" }),
        orin ? izoh(`Sening oʻrning: ${orin} / ${p.ids.length}`) : null,
        tugmalar(ui.button("Keyingi jangni kutish", () => { m = null; kutishEkran("Oʻqituvchi yangi jang boshlashini kutamiz…"); }, "big"),
          ui.button("Chiqish", () => { yop(); menyu(); }, "secondary")));
      sound.play(g === me ? "win" : "dum");
      joy.prepend(karta);
    }

    const room = onlayn.xona({
      kind: KIND, code, me, role: "player", types: TYPES,
      on: {
        status(s) {
          QK.probe.status = s;
          if (s === "missing") { yop(); xato("Bunday xona topilmadi. Kodni tekshiring."); }
          else if (s === "full") { yop(); xato("Xona toʻla."); }
          else if (s === "error") { yop(); xato("Server bilan aloqa uzildi."); }
          else if (s === "ready") holati.textContent = "✓ Xonaga kirdik. Oʻqituvchi ekranini kutamiz…";
        },
        message(msg) {
          oxirgi = Date.now();
          if (msg.type === "lobbi") {
            band = Array.isArray(msg.data.qah) ? msg.data.qah : [];
            const ids = Array.isArray(msg.data.ids) ? msg.data.ids : [];
            QK.probe.lobbi = { band, menBor: ids.includes(me) };
            if (rejim === "jang" || rejim === "tomosha") return;
            if (ids.includes(me)) { qah = band[ids.indexOf(me)]; if (rejim !== "lobbi") kutishEkran("Oʻqituvchi boshlashini kutamiz…"); }
            else if (qah && !band.includes(qah)) room.send("kirdi", { qah }); // xabar yo'qolgan bo'lsa — qayta
            else if (rejim !== "tanlash" && rejim !== "natija") rangTanlash();
            return;
          }
          if (msg.type === "holat") navbat = navbat.then(() => holatKeldi(msg.data));
          else if (msg.type === "natija") navbat = navbat.then(() => natijaKeldi(msg.data));
        },
      },
    });

    async function holatKeldi(p) {
      if (!Array.isArray(p.ids)) return;
      if (!p.ids.includes(me)) {
        if (rejim !== "tomosha" && !p.tugadi) {
          rejim = "tomosha";
          const e = sahifa();
          e.append(h("h1", { class: "to-sarlavha", text: "Jang boshlangan" }), izoh("Bu jang allaqachon ketyapti. Keyingisini shu yerda kut."),
            tugmalar(ui.button("Chiqish", () => { yop(); menyu(); }, "secondary")));
        }
        return;
      }
      if (!m || rejim !== "jang") {
        if (rejim === "natija" && p.tugadi) return;
        m = X.maydon(p.ids.map((id, i) => ({ id, qah: p.qah[i] })));
        X.holatniQoy(m, p);
        QK.probe.m = m;
        jangEkrani();
      } else {
        X.holatniQoy(m, p);
        koz.chiz();
      }
      if (p.tugadi) { if (rejim !== "natija") natijaEkrani(p); return; }
      if (p.r + 1 !== raund) {
        raund = p.r + 1;
        yuborildi = false;
        const tirik = X.tank(m, me).tirik;
        panel.maydon.disabled = !tirik;
        panel.yoz(tirik ? `— ${raund}-raund: bitta satr yoz va Enter bos —` : "Tanking yiqildi — endi tomoshabinsan. Jangni kuzatib tur.", "izoh");
      }
      QK.probe.raund = raund;
      sarlavha.textContent = `${raund}-raund · ⏱ ${p.qoldi} s` + (X.tank(m, me).tirik ? (yuborildi ? " · ✓ yuborildi" : "") : " · tomoshabin");
    }

    async function natijaKeldi(p) {
      if (!m || p.r !== m.raund || rejim !== "jang") return;
      const { tartib, harakatlar } = X.natijaniOch(p);
      sarlavha.textContent = `${raund}-raund bajarilmoqda…`;
      const yozuv = X.raundniBajar(m, tartib, harakatlar);
      await koz.oyna(yozuv);
    }

    // Doska jim qolsa — uzilgan deb aytamiz
    kuzat = setInterval(() => {
      if (rejim === "jang" && Date.now() - oxirgi > HOST_JIM) { yop(); xato("Oʻqituvchining qurilmasi uzildi. Jang shu yerda tugadi."); }
    }, 1000);
    function yop() { clearInterval(kuzat); room.leave(); }
    tozalash = yop;
  }

  // Rang tanlash uchun kichik tank rasmi (matnsiz SVG)
  function tankRasm(rang) {
    return `<svg viewBox="-24 -24 48 48" aria-hidden="true"><rect x="-20" y="-20" width="40" height="5" rx="2" fill="#4A4636"/><rect x="-20" y="15" width="40" height="5" rx="2" fill="#4A4636"/><rect x="-18" y="-16" width="36" height="32" rx="4" fill="${rang}" stroke="#2B2B3A" stroke-width="3"/><rect x="0" y="-3" width="26" height="6" rx="2" fill="#2B2B3A"/><circle r="7" fill="#2B2B3A"/></svg>`;
  }

  menyu();
})(window);
