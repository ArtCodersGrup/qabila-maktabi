// Tog'ga chiqish — robotlar bilan mashq (bitta qurilmada, internetsiz).
// Onlayn xona bilan bir xil ekranlardan foydalanadi (ekran.js); farqi: holat shu qurilmada hisoblanadi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, tog: T, togEkran: E } = QK;
  const MEN = "men";
  const XOTIRA = "tog:mavzu:v1";
  const QIY_XOTIRA = "tog:qiyinlik:v1";

  // Tanlangan mavzular eslab qolinadi (umumiy storage.js faqat done/muted ni saqlaydi)
  function mavzulariniOl() {
    try {
      // Eski yozuv — ro'yxat, yangisi — { tanlangan, bilgan }; keyin qo'shilgan mavzular yoqib qo'yiladi
      const bor = JSON.parse(root.localStorage.getItem(XOTIRA) || "null");
      const tanlangan = Array.isArray(bor) ? bor : bor && bor.tanlangan;
      return QK.savollar2.tanlovniTikla(tanlangan, bor && bor.bilgan, QK.savollar.TOPICS);
    } catch (e) {
      return null;
    }
  }
  function mavzulariniSaqla(list) {
    try {
      root.localStorage.setItem(XOTIRA, JSON.stringify({ tanlangan: list, bilgan: QK.savollar.TOPICS.map((t) => t.id) }));
    } catch (e) {
      // saqlab boʻlmadi — oʻyin baribir ishlaydi
    }
  }

  function qiyinlikOl() {
    try { const v = Number(root.localStorage.getItem(QIY_XOTIRA)); return [1, 2, 3].includes(v) ? v : 0; } catch (e) { return 0; }
  }
  function qiyinlikSaqla(v) {
    try { root.localStorage.setItem(QIY_XOTIRA, String(v)); } catch (e) { /* saqlab bo'lmadi */ }
  }

  function qahramonTanlash() {
    E.qahramonlar({
      sarlavha: "Togʻga chiqish",
      izoh: "Robotlar bilan mashq: savolga toʻgʻri javob — bir pogʻona yuqoriga. Qolib ketsang — chiqib ketasan.",
      orqaga: true,
      onPick: mavzuTanlash,
    });
    ui.bubble("elder", "Qaysi rangda chiqasan?");
  }

  // Bola o'zi o'ynaganda mavzu faqat bosh sahifadagi bo'limini o'qib tugatgach ochiladi (tanlangan sinf toifasida).
  // Kirgan o'qituvchi/admin uchun qulf yo'q; o'qituvchi ochgan onlayn xonada ham qulf yo'q.
  function qulfHisobla() {
    const M = QK.mavzular;
    const K = QK.bosh;
    if (!M || !K) return null;
    const kim = QK.hisob && QK.hisob.saqlangan();
    if (kim && ["teacher", "admin"].includes(kim.rol)) return null;
    const toifa = K.toifaById(QK.toifa && QK.toifa.oqi()) || K.toifaById("hammasi");
    const tugadimi = (g) => QK.storage.create(g.key, g.stages).load().done.every(Boolean);
    const out = {};
    for (const t of QK.savollar.TOPICS) {
      const x = M.holat(t.id, K, toifa, tugadimi);
      out[t.id] = { holat: x.holat, matn: x.holat === "yopiq" ? M.sabab(x) : "" };
    }
    return out;
  }

  function mavzuTanlash(qahramon) {
    E.mavzular({
      qulf: qulfHisobla(),
      izoh: "Savollar shu mavzulardan keladi. Qiyinlikni tanla — yoki balandlikka qarab oshib borsin.",
      tanlangan: mavzulariniOl(),
      qiyinlik: qiyinlikOl(),
      orqaga: qahramonTanlash,
      onDavom: (mavzular, qiyinlik) => {
        mavzulariniSaqla(mavzular);
        qiyinlikSaqla(qiyinlik);
        togTanlash(qahramon, mavzular, qiyinlik);
      },
    });
    ui.bubble("elder", "Qaysi mavzudan savol beray?");
  }

  function togTanlash(qahramon, mavzular, qiyinlik) {
    E.toglar({ onPick: (togId) => oyin(qahramon, togId, mavzular, qiyinlik) });
    ui.bubble("elder", "Toʻgʻri javob — bir pogʻona yuqoriga. Baland togʻ — koʻproq savol va koʻproq vaqt.");
    E.buttons([{ label: "Orqaga", onClick: () => mavzuTanlash(qahramon), secondary: true }]);
  }

  function oyin(qahramon, togId, mavzular, qiyinlik) {
    const t = T.togById(togId);
    // Robotlar: bitta savolga 6–20 soniya, 5–40 % xato; tepaga chiqqan sari sekinlashadi
    const botlar = T.QAHRAMONLAR.filter((q) => q.id !== qahramon).slice(0, 11).map((q, k) => ({
      id: "bot" + k,
      qahramon: q.id,
      tezlik: 6000 + Math.random() * 14000,
      xato: 0.05 + Math.random() * 0.35,
      keyingi: 1500 + Math.random() * 4000,
    }));
    const players = [{ id: MEN, qahramon }].concat(botlar.map((b) => ({ id: b.id, qahramon: b.qahramon })));
    const state = T.create({ tog: togId, players, now: Date.now(), mavzular, qiyinlik });
    QK.probe = { state, tog: togId, rejim: "mashq" };

    const el = E.box(true, "tog-oyin");
    const ekran = E.oyin(el, {
      togId,
      meId: MEN,
      holat: () => state,
      mavzular,
      javob: (ok) => T.javob(state, MEN, ok, Date.now()),
    });

    let tugadi = false;
    function yakun() {
      if (tugadi) return;
      tugadi = true;
      clearInterval(timer);
      sound.play("win");
      E.natija(state, MEN, [
        { label: "Yana oʻynash", onClick: qahramonTanlash },
        { label: "Barcha oʻyinlar", onClick: () => { root.location.href = E.SITE_HOME; }, secondary: true },
      ], { xatolar: ekran.xatolar });
      ui.bubble("elder", state.golib === MEN ? "Barakalla! Choʻqqi seniki." : "Yaxshi chiqding. Yana sinab koʻramizmi?");
    }

    const timer = setInterval(() => {
      if (tugadi) return;
      const now = Date.now();
      for (const bot of botlar) {
        if (now < bot.keyingi) continue;
        if (!T.javobBeraOladi(state, bot.id, now)) continue;
        const daraja = state.qiyinlik || T.daraja(t, state.oyinchilar[bot.id].pogona);
        const sekinlik = 1 + (daraja - 1) * 0.35;
        T.javob(state, bot.id, Math.random() > bot.xato * (1 + (daraja - 1) * 0.3), now);
        bot.keyingi = now + bot.tezlik * sekinlik * (0.8 + Math.random() * 0.4);
      }
      T.tekshir(state, now);
      ekran.render(now);
      if (state.tugadi) yakun();
    }, 250);
    ui.onCleanup(() => clearInterval(timer));

    ui.bubble("elder", `${t.nom}! Toʻgʻri javob — bir pogʻona yuqoriga. Yarim yoʻldan keyin qolib ketgan chiqib ketadi.`);
    ekran.render(Date.now());
  }

  QK.togMashq = { start: qahramonTanlash };
})(window);
