// Yozuv poygasi — onlayn xona. O'qituvchi xona ochadi va o'zi yozmaydi: ekrani doska
// (tog', hamma bola va tartib). Hisobni ham o'sha qurilma yuritadi.
// Bolalar kod bilan kiradi, rang tanlaydi va yozadi. Tarmoqqa matn emas, faqat urug' va sonlar ketadi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, art, tog: T, yozuvEkran: E, yozuvPoyga: P, yozuvProtokol: PR, typingPlay, onlayn } = QK;
  const h = ui.h;
  const KIND = "poyga";
  const YUBORISH = 700; // boshlovchi holatni shuncha vaqtda bir tarqatadi
  const TAKROR = 2000; // bola o'z qadamini shuncha vaqtda bir takrorlaydi (xabar yo'qolsa ham yetib boradi)
  const SANOQ = 3;
  const XOTIRA = "yozuv:men:v1";

  // Bolaning yashirin raqami: uzilib qolsa, qayta kirganda o'sha odam bo'ladi
  function kimlikim() {
    try {
      const bor = root.localStorage.getItem(XOTIRA);
      if (bor && /^[a-z2-9]{6}$/.test(bor)) return bor;
      const yangi = PR.kimlik();
      root.localStorage.setItem(XOTIRA, yangi);
      return yangi;
    } catch (e) {
      return PR.kimlik();
    }
  }

  // ================= O'QITUVCHI =================
  function host(qayt) {
    E.turTanlash({ onPick: (tur) => lobbi(tur, qayt), orqaga: qayt });
    ui.bubble("elder", "Matnni tanlang — keyin xona kodi chiqadi.");
  }

  function lobbi(tur, qayt) {
    const code = onlayn.makeCode();
    const turi = P.turById(tur);
    let odamlar = []; // [{ id, qahramon }]
    let hozir = new Set(); // ayni paytda xonada turganlar (presence)
    let eskilar = new Set(); // saytning eski nusxasi ochilgan qurilmalar — poygaga kiritilmaydi
    let state = null; // poyga ketayotganda — hisob shu yerda
    let sanoq = 0;
    let room = null;
    let timer = null;

    const holati = h("div", { class: "net-status", text: "⏳ Xona ochilmoqda…" });
    const royxat = h("div", { class: "lobbi-royxat" });
    QK.probe = { rejim: "host", code, odamlar, tur };
    const chiqish = () => { if (room) room.leave(); clearInterval(timer); qayt(); };
    kutishEkran();

    function kutishEkran() {
      const el = E.box(false);
      el.append(
        h("h1", { class: "game-title", text: "Yozuv poygasi" }),
        h("p", { class: "tog-note", text: `${turi.nom} — ${T.togById(turi.tog).nom}` }),
        h("div", { class: "code-lead", text: "Xona kodi:" }),
        h("div", { class: "code-big", text: code }),
        holati, royxat);
      lobbiKorsat();
    }

    function lobbiKorsat() {
      royxat.innerHTML = "";
      odamlar.forEach((o) => {
        const q = E.qahramonById(o.qahramon);
        royxat.append(h("div", { class: "lobbi-bola" },
          h("span", { class: "lobbi-rasm", html: art.nishon(q.rang) }),
          h("span", { class: "lobbi-nom", text: q.nom })));
      });
      holati.textContent = odamlar.length
        ? `${odamlar.length} ta bola tayyor (${P.MAX_ODAM} tagacha)`
        : "Bolalar kodni kiritishini kutamiz…";
      if (eskilar.size) {
        royxat.append(h("div", { class: "lobbi-eski", text: eskilar.size === 1
          ? "Bitta bolada saytning eski nusxasi ochilgan — u sahifani yangilasin."
          : `${eskilar.size} ta bolada saytning eski nusxasi ochilgan — ular sahifani yangilashsin.` }));
      }
      E.buttons([
        { label: sanoq ? `Boshlanmoqda… ${sanoq}` : `Boshlash (${odamlar.length})`, onClick: boshla, disabled: sanoq > 0 || odamlar.length < P.MIN_ODAM },
        { label: "Xonani yopish", onClick: chiqish, secondary: true },
      ]);
    }

    function boshla() {
      sanoq = SANOQ;
      sound.play("tap");
      lobbiKorsat();
      const sanash = setInterval(() => {
        sanoq--;
        if (sanoq > 0) {
          room.send("lobbi", Object.assign(PR.lobbi(holatcha()), { sanoq }));
          lobbiKorsat();
          return;
        }
        clearInterval(sanash);
        oyin();
      }, 1000);
      room.send("lobbi", Object.assign(PR.lobbi(holatcha()), { sanoq }));
    }

    // Lobbi ro'yxatini yuborish uchun vaqtinchalik holat
    function holatcha() {
      const s = P.holatYarat({ tur, urug: 0, jami: 0 });
      odamlar.forEach((o) => P.qoshil(s, o.id, o.qahramon));
      return s;
    }

    // ---------- Poyga ----------
    function oyin() {
      const urug = PR.urugYasa();
      const matn = PR.matnYasa(tur, urug);
      state = P.holatYarat({ tur, urug, jami: [...matn].length });
      odamlar.forEach((o) => P.qoshil(state, o.id, o.qahramon));
      P.boshla(state, Date.now());
      QK.probe.state = state;
      sound.play("win");

      const box = E.box(true, "poyga-oyin");
      const keldi = h("span", { class: "keldi-son" });
      box.append(h("div", { class: "host-bosh" }, h("span", { class: "code-small", text: `Kod: ${code}` }), keldi));
      const maydon = h("div", { class: "tog-maydon" });
      box.append(maydon);
      const sahna = E.sahna(maydon, state.tog);
      const lst = E.royxat(maydon);
      const chiqarish = h("div", { class: "host-chiqarish" });
      box.append(chiqarish);
      tugmalar();
      ui.bubble("elder", "Poyga ketyapti. Hamma choʻqqiga chiqquncha davom etadi.");

      function tugmalar() {
        E.buttons([
          { label: "Chiqarib yuborish", onClick: kimni, secondary: true },
          { label: "Tugatish", onClick: toxtat, secondary: true },
        ]);
      }

      function kimni() {
        chiqarish.innerHTML = "";
        const qatorlar = P.tartib(state);
        if (!qatorlar.length) return;
        chiqarish.append(h("span", { class: "host-izoh", text: "Kimni chiqaramiz?" }));
        qatorlar.forEach((p) => {
          const q = E.qahramonById(p.qahramon);
          chiqarish.append(h("button", {
            class: "host-chip", type: "button", "aria-label": q.nom,
            onClick: () => {
              P.chiqar(state, p.id);
              odamlar = odamlar.filter((o) => o.id !== p.id);
              QK.probe.odamlar = odamlar;
              chiqarish.innerHTML = "";
              sound.play("retry");
              tugmalar();
              yubor();
            },
          }, h("span", { class: "host-chip-rasm", html: art.nishon(q.rang) }), h("span", { text: q.nom })));
        });
        E.buttons([{ label: "Bekor qilish", onClick: () => { chiqarish.innerHTML = ""; tugmalar(); }, secondary: true }]);
      }

      function toxtat() {
        P.tugat(state, Date.now());
        yubor();
        yakun();
      }

      clearInterval(timer);
      let oxirgiYuborish = 0;
      timer = setInterval(() => {
        const now = Date.now();
        sahna.render(state, null);
        lst.render(state, null);
        keldi.textContent = `Choʻqqida: ${state.keldi}/${Object.keys(state.oyinchilar).length}`;
        if (now - oxirgiYuborish >= YUBORISH) yubor();
        // Hamma cho'qqiga chiqqanda tugaydi; xonadan chiqib ketgan bola kutilmaydi (poyga.js)
        if (!state.tugadi && P.hammasiTugadi(state, hozir)) {
          P.tugat(state, now);
          yubor();
          yakun();
        }
      }, 250);

      function yubor() {
        oxirgiYuborish = Date.now();
        room.send("holat", PR.paket(state));
      }

      function yakun() {
        clearInterval(timer);
        let n = 0;
        timer = setInterval(() => { yubor(); if (++n >= 5) clearInterval(timer); }, 700); // oxirgi holat yo'qolmasin
        sound.play("win");
        const el = E.box(false);
        el.append(h("h1", { class: "game-title", text: "Poyga tugadi" }));
        E.natija(el, state, null);
        E.buttons([
          { label: "Yangi poyga", onClick: () => { state = null; sanoq = 0; QK.probe.state = null; qaytaLobbi(); } },
          { label: "Xonani yopish", onClick: chiqish, secondary: true },
        ]);
        ui.bubble("elder", "Yangi poyga boshlash mumkin — bolalar xonada qoladi.");
      }
    }

    function qaytaLobbi() {
      clearInterval(timer);
      kutishEkran();
      room.send("lobbi", PR.lobbi(holatcha()));
      timer = setInterval(() => room.send("lobbi", PR.lobbi(holatcha())), 2000);
    }

    room = onlayn.xona({
      kind: KIND, code, me: "host", role: "host", types: PR.TYPES,
      on: {
        status(s) {
          QK.probe.status = s;
          if (s === "ready") {
            holati.textContent = "Bolalar kodni kiritishini kutamiz…";
            ui.bubble("elder", `Kodni doskaga yozing: ${code}. Hamma kirgach «Boshlash»ni bosing.`);
            lobbiKorsat();
            clearInterval(timer);
            timer = setInterval(() => room.send("lobbi", PR.lobbi(holatcha())), 2000);
          } else if (s === "error") {
            holati.textContent = "✗ Server bilan aloqa uzildi.";
            holati.classList.add("bad");
          }
        },
        // Kim xonada turibdi: chiqib ketgan bola lobbi ro'yxatidan olinadi va
        // poygani to'xtatib qo'ymaydi (uni kutib o'tirmaymiz)
        peers(ids) {
          hozir = new Set(ids);
          if (state) return; // poyga ketayotganda ro'yxatga tegmaymiz — natijada ko'rinib tursin
          const oldin = odamlar.length;
          odamlar = odamlar.filter((o) => hozir.has(o.id));
          if (odamlar.length === oldin) return;
          QK.probe.odamlar = odamlar;
          room.send("lobbi", PR.lobbi(holatcha()));
          lobbiKorsat();
        },
        message(msg) {
          if (msg.type === "qadam") {
            if (state && !state.tugadi) {
              if (P.qadam(state, msg.from, msg.data || {}, Date.now())) {
                sound.play("tak");
                yuborTez();
              }
            }
            return;
          }
          if (msg.type !== "kirdi" || state) return; // poyga ketayotganda yangi bola keyingisini kutadi
          // Eski nusxadagi qurilma: matni boshqacha bo'ladi, shuning uchun poygaga kiritilmaydi
          if (!PR.versiyaMos(msg.data)) {
            if (!eskilar.has(msg.from)) {
              eskilar.add(msg.from);
              QK.probe.eskilar = [...eskilar];
              lobbiKorsat();
            }
            return;
          }
          eskilar.delete(msg.from);
          const qah = String((msg.data && msg.data.qah) || "");
          if (!T.QAHRAMONLAR.some((q) => q.id === qah)) return;
          if (odamlar.some((o) => o.qahramon === qah && o.id !== msg.from)) return; // rang band
          if (odamlar.length >= P.MAX_ODAM && !odamlar.some((o) => o.id === msg.from)) return;
          const bor = odamlar.find((o) => o.id === msg.from);
          if (bor) bor.qahramon = qah;
          else odamlar.push({ id: msg.from, qahramon: qah });
          QK.probe.odamlar = odamlar;
          sound.play("tap");
          room.send("lobbi", PR.lobbi(holatcha()));
          lobbiKorsat();
        },
      },
    });

    function yuborTez() {
      if (state) room.send("holat", PR.paket(state));
    }

    ui.onCleanup(() => { clearInterval(timer); if (room) room.leave(); });
  }

  // ================= BOLA =================
  async function guest(qayt) {
    await typingPlay.keyboardCheck({ askKey: false });
    const el = E.box(false);
    el.append(h("div", { class: "code-lead", text: "Xona kodini kiriting (4 ta raqam):" }));
    ui.bubble("elder", "Oʻqituvchi doskaga yozgan kodni kiriting.");
    const n = await ui.askNumber(4);
    const code = String(n);
    if (!onlayn.validCode(code)) return E.xato("Kod 4 ta raqamdan iborat boʻladi.", qayt);
    kir(code, qayt);
  }

  function kir(code, qayt) {
    const me = kimlikim();
    let room = null;
    let timer = null;
    let takror = null;
    let band = []; // band ranglar
    let qahramonim = "";
    let rejim = "kutish"; // kutish | tanlash | lobbi | poyga | natija | kech
    let urugim = null; // ayni paytdagi poyga urug'i
    let jami = 0;
    let oxirgiPog = 0;
    let oxirgiBel = 0;
    let tugatdim = null; // { bel, ms, cpm, aniq }
    let yubordim = 0; // "kirdi" yuborilgan vaqt
    let oxirgiXabar = Date.now();
    let sahna = null;
    let lst = null;
    let natijaJoyi = null;

    const holati = h("div", { class: "net-status", text: "⏳ Xonaga kirilmoqda…" });
    const el = E.box(false);
    el.append(h("h1", { class: "game-title", text: "Yozuv poygasi" }), h("div", { class: "code-small", text: `Xona: ${code}` }), holati);
    QK.probe = { rejim: "guest", code, me };

    const chiqish = () => {
      if (room) room.leave();
      clearInterval(timer);
      clearInterval(takror);
      qayt();
    };

    // ---------- Kutish / rang tanlash ----------
    let lobbiImzo = "";
    function kutishEkran(matn, sanoq) {
      const imzo = matn + "|" + band.join(",") + "|" + (sanoq || 0);
      if (rejim === "lobbi" && imzo === lobbiImzo) return;
      lobbiImzo = imzo;
      rejim = "lobbi";
      const el2 = E.box(false);
      const q = qahramonim ? E.qahramonById(qahramonim) : null;
      el2.append(
        h("h1", { class: "game-title", text: `Xona: ${code}` }),
        q ? h("span", { class: "lobbi-rasm katta", html: art.odam(q.rang) }) : null,
        h("p", { class: "tog-note", text: sanoq ? `Boshlanmoqda… ${sanoq}` : matn }));
      E.buttons([
        { label: "Rangni almashtirish", onClick: rangEkran, secondary: true, disabled: !!sanoq },
        { label: "Chiqish", onClick: chiqish, secondary: true },
      ]);
      ui.bubble("elder", sanoq ? "Barmoqlarni asosiy qatorga qoʻy!" : "Oʻqituvchi boshlashini kutamiz.");
    }

    // Band ranglar lobbi xabari bilan keladi — ro'yxat o'zgarsa ekran yangilanadi (bekorga qayta chizilmaydi)
    let tanlashImzo = null;
    function rangEkran() {
      const imzo = band.join(",");
      if (rejim === "tanlash" && imzo === tanlashImzo) return;
      rejim = "tanlash";
      tanlashImzo = imzo;
      lobbiImzo = "";
      E.rangTanlash({
        band: band.filter((x) => x !== qahramonim),
        izoh: "Togʻda shu rang bilan koʻrinasan. Band ranglar xira.",
        onPick: (id) => {
          qahramonim = id;
          yubordim = Date.now();
          room.send("kirdi", { qah: id, v: PR.MATN_V });
          kutishEkran("Oʻqituvchi boshlashini kutamiz…");
        },
        orqaga: chiqish,
      });
      ui.bubble("elder", "Oʻzingga rang tanla.");
    }

    // ---------- Poyga ----------
    function poygaBoshla(s) {
      rejim = "poyga";
      urugim = s.urug;
      jami = s.jami;
      oxirgiPog = 0;
      oxirgiBel = 0;
      tugatdim = null;
      const matn = PR.matnYasa(s.tur, s.urug);
      const box = E.box(true, "poyga-oyin");
      const maydon = h("div", { class: "tog-maydon" });
      box.append(maydon);
      sahna = E.sahna(maydon, s.tog);
      lst = E.royxat(maydon);
      natijaJoyi = h("div", { class: "race-yoz-joy" });
      box.append(natijaJoyi);
      E.buttons([{ label: "Chiqish", onClick: chiqish, secondary: true }]);
      ui.bubble("elder", "Boshla! Xato tugma oʻtkazmaydi — shoshilmay yoz.");
      sound.play("win");

      E.yozuv(natijaJoyi, matn, {
        onStep: (bel) => {
          oxirgiBel = bel;
          const pog = P.pogonaOf(bel, jami, s.pogona);
          if (pog === oxirgiPog) return;
          oxirgiPog = pog;
          room.send("qadam", { bel, ms: 0, cpm: 0, aniq: 0 });
        },
        onDone: (st) => {
          oxirgiBel = st.bel;
          tugatdim = st;
          room.send("qadam", st);
          natijaJoyi.innerHTML = "";
          natijaJoyi.append(h("div", { class: "men-natija" },
            h("div", { class: "men-orin", text: "Choʻqqidasan! ✓" }),
            h("div", { class: "men-son", text: `${typingUiComma(st.ms)} s · ${st.cpm} belgi/daqiqa · aniqlik ${st.aniq}%` })));
          ui.bubble("elder", "Zoʻr! Endi doʻstlaringni kuzatamiz.");
        },
      });

      clearInterval(takror);
      // Xabar yo'qolsa ham holat yetib borsin
      takror = setInterval(() => {
        if (rejim !== "poyga") return;
        if (tugatdim) room.send("qadam", tugatdim);
        else if (oxirgiBel > 0) room.send("qadam", { bel: oxirgiBel, ms: 0, cpm: 0, aniq: 0 });
      }, TAKROR);
    }

    const typingUiComma = (ms) => QK.typingUi.comma(Math.round(ms / 100) / 10);

    function poygaYangila(s) {
      if (sahna) sahna.render(s, me);
      if (lst) lst.render(s, me);
      const men = s.oyinchilar[me];
      if (men && men.orin && tugatdim && natijaJoyi) {
        const orin = natijaJoyi.querySelector(".men-orin");
        if (orin && orin.textContent.indexOf("oʻrin") === -1) orin.textContent = `${men.orin}-oʻrin!`;
      }
    }

    function natijaEkran(s) {
      rejim = "natija";
      clearInterval(takror);
      const el2 = E.box(false);
      const men = s.oyinchilar[me];
      el2.append(h("h1", { class: "game-title", text: men && men.orin === 1 ? "Sen birinchisan! 🏆" : "Poyga tugadi" }));
      E.natija(el2, s, me);
      E.buttons([{ label: "Chiqish", onClick: chiqish, secondary: true }]);
      sound.play(men && men.orin === 1 ? "win" : "correct");
      ui.bubble("elder", "Oʻqituvchi yangi poyga boshlashi mumkin — kutib turamiz.");
    }

    // ---------- Xabarlar ----------
    room = onlayn.xona({
      kind: KIND, code, me, role: "player", types: PR.TYPES,
      on: {
        status(s) {
          QK.probe.status = s;
          if (s === "missing") E.xato("Bunday xona topilmadi. Kodni tekshiring.", qayt);
          else if (s === "full") E.xato("Xona toʻlgan — 12 kishidan koʻp boʻlmaydi.", qayt);
          else if (s === "error") E.xato("Server bilan aloqa yoʻq. Internetni tekshiring.", qayt);
          else if (s === "ready" && rejim === "kutish") rangEkran();
        },
        message(msg) {
          oxirgiXabar = Date.now();
          // Boshlovchidagi matn qoidasi boshqacha bo'lsa, bu qurilmada eski nusxa ochilgan:
          // matn har xil bo'lib, poyga jimgina buziladi (kam so'z yozgan yutib ketadi).
          if ((msg.type === "lobbi" || msg.type === "holat") && !PR.versiyaMos(msg.data)) {
            if (rejim !== "eski") {
              rejim = "eski";
              clearInterval(takror);
              clearInterval(timer);
              if (room) room.leave();
              E.eskiNusxa(qayt);
            }
            return;
          }
          if (rejim === "eski") return;
          if (msg.type === "lobbi") {
            band = Array.isArray(msg.data.qah) ? msg.data.qah.slice() : [];
            const ids = Array.isArray(msg.data.ids) ? msg.data.ids : [];
            const meniki = ids.indexOf(me);
            if (qahramonim && meniki >= 0) qahramonim = band[meniki] || qahramonim;
            if (rejim === "natija" || rejim === "poyga") { // o'qituvchi yangi poygaga qaytdi
              rejim = "lobbi";
              lobbiImzo = "";
            }
            // Rangim band chiqdi (boshqa bola oldinroq tanlagan) — boshqasini tanlaymiz
            if (qahramonim && meniki < 0 && Date.now() - yubordim > 1500) {
              qahramonim = "";
              tanlashImzo = null;
              ui.toast("Bu rang band — boshqasini tanla.");
              rangEkran();
              return;
            }
            if (rejim === "tanlash") { rangEkran(); return; }
            if (rejim === "lobbi" || rejim === "kutish") {
              if (!qahramonim) rangEkran();
              else kutishEkran("Oʻqituvchi boshlashini kutamiz…", msg.data.sanoq);
            }
            return;
          }
          if (msg.type !== "holat" || !PR.yaxshiPaket(msg.data)) return;
          const s = PR.holat(msg.data, Date.now());
          QK.probe.holat = s;
          const men = s.oyinchilar[me];
          if (!men) { // chiqarib yuborilgan yoki poyga boshlangandan keyin kirgan
            if (rejim === "poyga" || rejim === "natija") {
              clearInterval(takror);
              E.xato("Oʻqituvchi seni poygadan chiqardi.", qayt);
              rejim = "kech";
            } else if (s.boshlandi && !s.tugadi && rejim !== "kech") {
              rejim = "kech";
              const el2 = E.box(false);
              el2.append(h("h1", { class: "game-title", text: "Poyga ketyapti" }),
                h("p", { class: "tog-note", text: "Keyingi poygani kutamiz — oʻqituvchi yangisini boshlaydi." }));
              E.buttons([{ label: "Chiqish", onClick: chiqish, secondary: true }]);
            }
            return;
          }
          if (s.boshlandi && !s.tugadi && (rejim !== "poyga" || urugim !== s.urug)) {
            // Versiya bir xil, lekin matn baribir boshqacha bo'lsa (so'z ro'yxati o'zgargan) — o'ynamaymiz
            if (!PR.matnMos(msg.data)) {
              rejim = "eski";
              clearInterval(takror);
              clearInterval(timer);
              if (room) room.leave();
              E.eskiNusxa(qayt);
              return;
            }
            poygaBoshla(s);
          }
          if (rejim === "poyga") poygaYangila(s);
          if (s.tugadi && rejim === "poyga") natijaEkran(s);
        },
      },
    });

    // Boshlovchi jim qolsa — o'yin osilib qolmasin
    timer = setInterval(() => {
      if (rejim !== "poyga") return;
      if (Date.now() - oxirgiXabar < PR.HOST_JIM) return;
      clearInterval(takror);
      rejim = "natija";
      E.xato("Oʻqituvchi qurilmasi bilan aloqa uzildi.", qayt);
    }, 1000);

    ui.onCleanup(() => { clearInterval(timer); clearInterval(takror); if (room) room.leave(); });
  }

  QK.yozuvOnlayn = { host, guest };
})(window);
