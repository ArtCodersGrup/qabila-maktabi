// Tog'ga chiqish — onlayn xona. Boshlovchi (o'qituvchi qurilmasi) xona ochadi, o'zi o'ynamaydi:
// uning ekrani doska — tog', hamma bolalar va reyting. O'yin hisobini ham o'sha qurilma yuritadi.
// Bolalar kod bilan kiradi, qahramon tanlaydi va savolga javob beradi. Tarmoqqa faqat "to'g'ri/xato" ketadi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, art, tog: T, togEkran: E, togProtokol: P, onlayn } = QK;
  const h = ui.h;
  const KIND = "tog";
  const YUBORISH = 700; // boshlovchi holatni shuncha vaqtda bir tarqatadi
  const SANOQ = 3; // boshlashdan oldingi 3-2-1

  // Bolaning yashirin raqami alohida kalitda saqlanadi: uzilib qolsa, qayta kirganda o'sha odam bo'ladi.
  // (umumiy storage.js faqat "done" va "muted" ni saqlaydi — boshqa maydonlarni tashlab yuboradi.)
  const XOTIRA = "tog:men:v1";
  function kimlikim() {
    try {
      const bor = root.localStorage.getItem(XOTIRA);
      if (bor && /^[a-z2-9]{6}$/.test(bor)) return bor;
      const yangi = P.kimlik();
      root.localStorage.setItem(XOTIRA, yangi);
      return yangi;
    } catch (e) {
      return P.kimlik(); // maxfiy rejim: xona ishlaydi, faqat qayta kirish eslanmaydi
    }
  }

  function xato(matn, qayt) {
    const el = E.box(false);
    el.append(h("h1", { class: "game-title", text: "Onlayn xona" }), h("p", { class: "tog-note", text: matn }));
    sound.play("retry");
    E.buttons([{ label: "Orqaga", onClick: qayt, secondary: true }]);
  }

  // ================= BOSHLOVCHI (o'qituvchi) =================
  function host(qayt) {
    E.toglar({ sarlavha: "Qaysi togʻga chiqamiz?", onPick: (togId) => lobbi(togId, qayt) });
    ui.bubble("elder", "Togʻni tanlang — keyin bolalar kodni kiritadi.");
    E.buttons([{ label: "Orqaga", onClick: qayt, secondary: true }]);
  }

  function lobbi(togId, qayt) {
    const code = onlayn.makeCode();
    let odamlar = []; // [{ id, qahramon }]
    let state = null; // o'yin boshlangach — hisob shu yerda
    let javobKeldi = null; // o'yin ketayotganda: bolaning javobini qabul qilish
    let sanoq = 0;
    let room = null;
    let timer = null;
    const el = E.box(false);
    const royxat = h("div", { class: "lobbi-royxat" });
    const holati = h("div", { class: "net-status", text: "⏳ Xona ochilmoqda…" });
    el.append(
      h("h1", { class: "game-title", text: T.togById(togId).nom }),
      h("div", { class: "code-lead", text: "Xona kodi:" }),
      h("div", { class: "code-big", text: code }),
      holati, royxat);
    QK.probe = { rejim: "host", code, odamlar, tog: togId };

    const chiqish = () => { if (room) room.leave(); clearInterval(timer); qayt(); };

    function lobbiKorsat() {
      royxat.innerHTML = "";
      odamlar.forEach((o) => {
        const q = togUiQahramon(o.qahramon);
        royxat.append(h("div", { class: "lobbi-bola" },
          h("span", { class: "lobbi-rasm", html: art.nishon(q.rang) }),
          h("span", { class: "lobbi-nom", text: q.nom })));
      });
      holati.textContent = odamlar.length
        ? `${odamlar.length} ta bola tayyor (${T.MAX_PLAYERS} tagacha)`
        : "Bolalar kodni kiritishini kutamiz…";
      E.buttons([
        { label: sanoq ? `Boshlanmoqda… ${sanoq}` : `Boshlash (${odamlar.length})`, onClick: boshla, disabled: sanoq > 0 || odamlar.length < T.MIN_PLAYERS },
        { label: "Xonani yopish", onClick: chiqish, secondary: true },
      ]);
    }

    function boshla() {
      sanoq = SANOQ;
      sound.play("tap");
      lobbiKorsat();
      const sanash = setInterval(() => {
        sanoq--;
        if (sanoq > 0) { room.send("lobbi", Object.assign(P.lobbi(odamlar), { sanoq })); lobbiKorsat(); return; }
        clearInterval(sanash);
        oyin();
      }, 1000);
      room.send("lobbi", Object.assign(P.lobbi(odamlar), { sanoq }));
    }

    function oyin() {
      state = T.create({ tog: togId, players: odamlar, now: Date.now() });
      QK.probe.state = state;
      sound.play("win");
      const box = E.box(true, "tog-oyin");
      const ekran = E.oyin(box, { togId, meId: null, kuzatuvchi: true, holat: () => state });
      // Bolaning javobi: hisobni faqat shu qurilma yuritadi
      javobKeldi = (id, ok) => {
        if (state.tugadi) return;
        if (P.qabul(state, id, ok, Date.now())) yubor();
      };
      const chiqarish = h("div", { class: "host-chiqarish" });
      box.append(chiqarish);
      tugmalar();
      ui.bubble("elder", "Oʻyin ketyapti. Kerak boʻlsa bolani chiqarib yuborish yoki oʻyinni toʻxtatish mumkin.");

      function tugmalar() {
        E.buttons([
          { label: "Chiqarib yuborish", onClick: kimni, secondary: true },
          { label: "Toʻxtatish", onClick: toxtat, secondary: true },
        ]);
      }
      // O'qituvchi bitta bolani o'yindan chiqaradi (DIZAYN 2.9)
      function kimni() {
        chiqarish.innerHTML = "";
        const qatorlar = T.reyting(state).filter((p) => !p.chiqdi);
        if (!qatorlar.length) return;
        chiqarish.append(h("span", { class: "host-izoh", text: "Kimni chiqaramiz?" }));
        qatorlar.forEach((p) => {
          const q = togUiQahramon(p.qahramon);
          chiqarish.append(h("button", {
            class: "host-chip", type: "button", "aria-label": q.nom,
            onClick: () => { T.chiqar(state, p.id, Date.now()); chiqarish.innerHTML = ""; sound.play("retry"); yubor(); },
          }, h("span", { class: "host-chip-rasm", html: art.nishon(q.rang) }), h("span", { text: q.nom })));
        });
        E.buttons([{ label: "Bekor qilish", onClick: () => { chiqarish.innerHTML = ""; tugmalar(); }, secondary: true }]);
      }
      function toxtat() {
        state.tugadi = true;
        state.sabab = "toxtatildi";
        const r = T.reyting(state);
        state.golib = r.length ? r[0].id : null;
        yubor();
      }

      clearInterval(timer);
      let oxirgiYuborish = 0;
      timer = setInterval(() => {
        const now = Date.now();
        if (!state.tugadi) T.tekshir(state, now);
        ekran.render(now);
        if (now - oxirgiYuborish >= YUBORISH) yubor();
        if (state.tugadi) yakun();
      }, 250);

      function yubor() {
        oxirgiYuborish = Date.now();
        room.send("holat", P.paket(state, oxirgiYuborish));
      }

      function yakun() {
        javobKeldi = null;
        clearInterval(timer);
        // Oxirgi holat yo'qolmasin: bir necha marta takrorlaymiz
        let n = 0;
        timer = setInterval(() => { yubor(); if (++n >= 5) clearInterval(timer); }, 700);
        sound.play("win");
        E.natija(state, null, [
          { label: "Yangi oʻyin", onClick: () => { state = null; sanoq = 0; qaytaLobbi(); } },
          { label: "Xonani yopish", onClick: chiqish, secondary: true },
        ]);
        ui.bubble("elder", "Oʻyin tugadi. Yangi oʻyin boshlash mumkin — bolalar xonada qoladi.");
      }
    }

    function qaytaLobbi() {
      clearInterval(timer);
      const el2 = E.box(false);
      el2.append(
        h("h1", { class: "game-title", text: T.togById(togId).nom }),
        h("div", { class: "code-lead", text: "Xona kodi:" }),
        h("div", { class: "code-big", text: code }),
        holati, royxat);
      odamlar = odamlar.slice(); // qayta tanlash uchun bolalar xonada qoladi
      room.send("lobbi", P.lobbi(odamlar));
      lobbiKorsat();
      timer = setInterval(() => room.send("lobbi", Object.assign(P.lobbi(odamlar), sanoq ? { sanoq } : {})), 2000);
    }

    room = onlayn.xona({
      kind: KIND, code, me: "host", role: "host", types: P.TYPES,
      on: {
        status(s) {
          QK.probe.status = s;
          if (s === "ready") {
            holati.textContent = "Bolalar kodni kiritishini kutamiz…";
            ui.bubble("elder", `Kodni doskaga yozing: ${code}. Hamma kirgach «Boshlash»ni bosing.`);
            lobbiKorsat();
            clearInterval(timer);
            timer = setInterval(() => room.send("lobbi", P.lobbi(odamlar)), 2000);
          } else if (s === "error") {
            holati.textContent = "✗ Server bilan aloqa uzildi.";
            holati.classList.add("bad");
          }
        },
        message(msg) {
          if (msg.type === "javob") {
            if (javobKeldi && state && !state.tugadi) javobKeldi(msg.from, !!msg.data.ok);
            return;
          }
          if (msg.type !== "kirdi" || state) return; // o'yin ketayotganda yangi bola kutadi
          const qah = String(msg.data.qah || "");
          if (!T.QAHRAMONLAR.some((q) => q.id === qah)) return;
          if (odamlar.some((o) => o.qahramon === qah && o.id !== msg.from)) return; // band
          if (odamlar.length >= T.MAX_PLAYERS && !odamlar.some((o) => o.id === msg.from)) return;
          const bor = odamlar.find((o) => o.id === msg.from);
          if (bor) bor.qahramon = qah;
          else odamlar.push({ id: msg.from, qahramon: qah });
          QK.probe.odamlar = odamlar;
          sound.play("tap");
          room.send("lobbi", P.lobbi(odamlar));
          lobbiKorsat();
        },
      },
    });
    ui.onCleanup(() => { clearInterval(timer); if (room) room.leave(); });
  }

  const togUiQahramon = (id) => QK.togUi.qahramonById(id);

  // ================= BOLA =================
  async function guest(qayt) {
    const el = E.box(false);
    el.append(h("div", { class: "code-lead", text: "Xona kodini kiriting (4 ta raqam):" }));
    ui.bubble("elder", "Oʻqituvchi doskaga yozgan kodni kiriting.");
    const n = await ui.askNumber(4);
    const code = String(n);
    if (!onlayn.validCode(code)) return xato("Kod 4 ta raqamdan iborat boʻladi.", qayt);
    kir(code, qayt);
  }

  function kir(code, qayt) {
    const me = kimlikim();
    let paket = null; // oxirgi holat paketi
    let holatim = null; // ekran uchun holat
    let oxirgiXabar = Date.now();
    let rejim = "kutish"; // kutish | tanlash | lobbi | oyin | natija | kech
    let ekran = null;
    let room = null;
    let timer = null;
    let band = [];
    let qahramonim = ""; // qaysi qahramon ekanimizni boshlovchi paketi aytadi

    const el = E.box(false);
    const holati = h("div", { class: "net-status", text: "⏳ Xonaga kirilmoqda…" });
    el.append(h("h1", { class: "game-title", text: "Onlayn xona" }), h("div", { class: "code-small", text: `Xona: ${code}` }), holati);
    QK.probe = { rejim: "guest", code, me };

    const chiqish = () => { if (room) room.leave(); clearInterval(timer); qayt(); };

    // Kutish ekrani: o'zingning qahramoning, boshqa bolalar va holat.
    // Boshlovchi har 2 soniyada lobbi yuboradi — o'zgarmagan bo'lsa qayta chizmaymiz (ekran pirpiramasin).
    let lobbiImzo = "";
    function kutishEkran(matn) {
      const boshqalar = band.filter((id) => id !== qahramonim);
      const imzo = matn + "|" + boshqalar.join(",");
      if (rejim === "lobbi" && imzo === lobbiImzo) return;
      lobbiImzo = imzo;
      rejim = "lobbi";
      const el2 = E.box(false);
      const q = qahramonim ? togUiQahramon(qahramonim) : null;
      el2.append(
        h("h1", { class: "game-title", text: `Xona: ${code}` }),
        q ? h("span", { class: "lobbi-rasm katta", html: art.odam(q.rang) }) : null,
        h("p", { class: "tog-note", text: matn }));
      if (boshqalar.length) {
        const lst = h("div", { class: "lobbi-royxat" });
        boshqalar.forEach((id) => {
          const qq = togUiQahramon(id);
          lst.append(h("div", { class: "lobbi-bola" }, h("span", { class: "lobbi-rasm", html: art.nishon(qq.rang) })));
        });
        el2.append(h("p", { class: "tog-note", text: `Yana ${boshqalar.length} ta bola tayyor:` }), lst);
      }
      E.buttons([{ label: "Chiqish", onClick: chiqish, secondary: true }]);
      ui.bubble("elder", matn);
    }

    function tanlash() {
      rejim = "tanlash";
      E.qahramonlar({
        sarlavha: "Qaysi qahramon boʻlasan?",
        izoh: "Xiralari boshqa bolalarniki.",
        band,
        onPick: (id) => {
          qahramonim = id;
          room.send("kirdi", { qah: id });
          kutishEkran("Oʻqituvchi boshlashini kutamiz…");
        },
      });
      E.buttons([{ label: "Chiqish", onClick: chiqish, secondary: true }]);
      ui.bubble("elder", "Qahramoningni tanla — keyin oʻqituvchi boshlaydi.");
    }

    function oyinEkran() {
      rejim = "oyin";
      sound.play("win");
      const box = E.box(true, "tog-oyin");
      ekran = E.oyin(box, {
        togId: paket.tog,
        meId: me,
        holat: () => holatim,
        javob: (ok) => room.send("javob", { ok: ok ? 1 : 0 }),
      });
      E.buttons([{ label: "Chiqish", onClick: chiqish, secondary: true }]);
      ui.bubble("elder", "Boshladik! Toʻgʻri javob — bir pogʻona yuqoriga.");
    }

    function natijaEkran(uzilish) {
      rejim = "natija";
      ekran = null;
      if (uzilish && holatim && !holatim.tugadi) holatim.sabab = "uzildi";
      sound.play(holatim && holatim.golib === me ? "win" : "dum");
      E.natija(holatim, me, [
        { label: "Keyingi oʻyinni kutish", onClick: () => kutishEkran("Oʻqituvchi yangi oʻyin boshlashini kutamiz…") },
        { label: "Chiqish", onClick: chiqish, secondary: true },
      ]);
      if (uzilish) ui.bubble("elder", "Oʻqituvchining qurilmasi uzildi. Oʻyin shu yerda tugadi.");
    }

    room = onlayn.xona({
      kind: KIND, code, me, role: "player", types: P.TYPES,
      on: {
        status(s) {
          QK.probe.status = s;
          if (s === "missing") return xato("Bunday xona topilmadi. Kodni tekshiring.", qayt);
          if (s === "full") return xato("Xona toʻla — 12 bola oʻynayapti.", qayt);
          if (s === "error") return xato("Server bilan aloqa uzildi.", qayt);
          if (s === "ready") holati.textContent = "✓ Xonaga kirdik. Oʻqituvchi ekranini kutamiz…";
        },
        message(msg) {
          oxirgiXabar = Date.now();
          if (msg.type === "lobbi") {
            band = Array.isArray(msg.data.qah) ? msg.data.qah : [];
            const ids = Array.isArray(msg.data.ids) ? msg.data.ids : [];
            const menBor = ids.includes(me);
            if (menBor) qahramonim = band[ids.indexOf(me)] || qahramonim;
            QK.probe.lobbi = { band, menBor };
            if (msg.data.sanoq) {
              if (menBor) kutishEkran(`Boshlanmoqda… ${msg.data.sanoq}`);
              return;
            }
            // O'yindan yangi lobbiga qaytdik: ekranni qaytadan chizamiz (qahramon o'sha bo'lib qoladi)
            if (rejim === "oyin" || rejim === "natija" || rejim === "kech") lobbiImzo = "";
            if (menBor) kutishEkran("Oʻqituvchi boshlashini kutamiz…");
            else if (rejim !== "tanlash") tanlash();
            return;
          }
          if (msg.type !== "holat" || !P.yaxshiPaket(msg.data)) return;
          paket = msg.data;
          holatim = P.holat(paket, Date.now());
          const menIdx = paket.ids.indexOf(me);
          if (menIdx >= 0) qahramonim = paket.qah[menIdx] || qahramonim;
          QK.probe.holat = { pog: paket.pog, ids: paket.ids, tugadi: paket.tugadi };
          if (!paket.ids.includes(me)) {
            // O'yin boshlangan, biz kech qoldik — keyingisini kutamiz (DIZAYN 2.9)
            if (rejim !== "kech" && rejim !== "natija") {
              rejim = "kech";
              const el3 = E.box(false);
              el3.append(h("h1", { class: "game-title", text: "Oʻyin boshlangan" }),
                h("p", { class: "tog-note", text: "Bu oʻyin allaqachon boshlangan. Keyingisini shu yerda kutib tur." }));
              E.buttons([{ label: "Chiqish", onClick: chiqish, secondary: true }]);
            }
            return;
          }
          if (paket.tugadi) { if (rejim !== "natija") natijaEkran(false); return; }
          if (rejim !== "oyin") oyinEkran();
        },
      },
    });

    // Ekranni yangilab turish va boshlovchi jim bo'lib qolganini sezish
    timer = setInterval(() => {
      const now = Date.now();
      if (rejim === "oyin" && ekran) ekran.render(now);
      if (rejim === "oyin" && now - oxirgiXabar > P.HOST_JIM) natijaEkran(true);
    }, 250);
    ui.onCleanup(() => { clearInterval(timer); if (room) room.leave(); });
  }

  QK.togOnlayn = { host, guest };
})(window);
