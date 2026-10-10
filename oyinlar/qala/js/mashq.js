// Qalʼa — robot jamoaga qarshi mashq (bitta qurilmada, internetsiz, onlayn qatlamga tegmaydi).
// 1) oʻyinchi qalʼa quradi (vaqtsiz) 2) robot qalʼasi — Q.robotHimoya 3) hujum 180 s: oʻyinchi raqib devorlariga,
// robot (Q.robotHujum) oʻyinchi qalʼasiga; robot fishing xati kelsa — oʻyinchi qorovul boʻlib javob beradi 4) tahlil.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, qala: Q, qalaUi: U, qalaOyinUi: O, qalaProtokol: P } = QK;
  const h = ui.h;
  const MEN = "oy";
  const ROBOT = "quyosh";
  const HUJUM_SONIYA = 180; // robot 8–15 soniyada bir amal qiladi — vaqtni Q.robotHujum oʻzi hisoblaydi
  const DARAJALAR = [
    { id: 1, nom: "Oson robot", izoh: "Lugʻatdagi parol, tuzsiz qulf, sezar. Xatlarni koʻp ochadi." },
    { id: 2, nom: "Oʻrta robot", izoh: "Soʻz + raqam, tuz bor. Xatlarga ehtiyot boʻladi." },
    { id: 3, nom: "Kuchli robot", izoh: "Kuchli parol, kalitli shifr, ikki qadam. Chastota bilan shifrni topadi." },
  ];
  const XATO = { byudjet: "Byudjet 10 ochkodan oshdi.", parol: "Parol kartalari kerak.", kalit: "Kalit 3 ta lotin harfi boʻlsin." };
  const rng = Math.random;
  const xatNomer = (r, zaxira) => { const n = r && r.natija && (r.natija.nomer ?? r.natija.xatNomer ?? r.natija.n); return Number.isInteger(n) ? n : zaxira; };
  const yiqilganlar = (s, jam) => P.DEVORLAR.filter((d) => s.jamoa[jam].devor && s.jamoa[jam].devor[d] && s.jamoa[jam].devor[d].holat === "yiqildi");
  // Q.robotHimoya tasodifiy karta topa olmay xato tashlashi mumkin (qala.js sozKarta) — bir necha marta urinamiz
  function robotHimoyasi(daraja) {
    for (let k = 0; k < 30; k++) { try { return Q.robotHimoya(rng, daraja); } catch (e) { /* yana */ } }
    return Q.himoyaYasa({ parol: ["s1", "r2"], tuz: 0, shifr: "sezar", k: 5, bayroq: "f1", ikki: false, filtr: [] });
  }

  function start(qayt) { darajaTanlash(qayt); }

  function darajaTanlash(qayt) {
    ui.newRun();
    const el = U.box(false);
    U.sarlavha(el, { nom: "Robot jamoaga qarshi", onOrqaga: qayt, izoh: "Avval qalʼangni qur (vaqtsiz). Keyin 3 daqiqa: sen robot qalʼasiga, robot senikiga hujum qiladi." });
    const menyu = h("div", { class: "qala-menyu" });
    DARAJALAR.forEach((d) => menyu.append(h("button", { class: "menyu-karta", type: "button", onClick: () => { sound.play("tap"); qurish(qayt, d.id, null); } },
      h("span", { class: "menyu-nom", text: d.nom }), h("span", { class: "menyu-izoh", text: d.izoh }))));
    el.append(menyu);
    U.buttons([{ label: "Orqaga", onClick: qayt, secondary: true }]);
    ui.bubble("elder", "Robot darajasini tanla.");
  }

  // ---------- 1. Qalʼa qurish ----------
  function qurish(qayt, daraja, qoralama) {
    ui.newRun();
    const el = U.box(true, "qala-oyin");
    O.devorlar(el, {
      himoya: qoralama, byudjet: Q.BYUDJET,
      tugmalar: [{ label: "Orqaga", onClick: () => darajaTanlash(qayt), secondary: true }],
      onTayyor: (d) => {
        const him = Q.himoyaYasa(d);
        if (!him || him.xato) { sound.play("retry"); ui.toast(XATO[him && him.xato] || "Himoya toʻliq emas."); return; }
        oyin(qayt, daraja, him, d);
      },
    });
    ui.bubble("elder", "Byudjet 10 ochko. Parol va bayroq shart, qolgani — tanlov. Har devor — bitta dars.");
  }

  // ---------- 2–3. Hujum ----------
  function oyin(qayt, daraja, himoya, qoralama) {
    ui.newRun();
    const now = Date.now();
    const s = Q.create({ jamoalar: [MEN, ROBOT], now, vaqt: { himoya: 0, hujum: HUJUM_SONIYA, tahlil: 90 }, raundlar: 1 });
    Q.boshla(s, now);
    Q.himoyaQoy(s, MEN, himoya);
    const robotHim = robotHimoyasi(daraja);
    Q.himoyaQoy(s, ROBOT, robotHim);
    // Solo: himoya vaqtsiz — ikkala qalʼa qoʻyilgach darhol hujumga
    if (s.faza === "himoya") s.fazaTugaydi = now;
    Q.tekshir(s, now);
    QK.probe = { rejim: "mashq", s, daraja };

    const el = U.box(true, "qala-oyin");
    const menQala = h("div", { class: "men-qala" });
    const lenta = h("ol", { class: "voqealar kichik", "aria-live": "polite" });
    const qorovulJoy = h("div", { class: "qorovul-modal" });
    qorovulJoy.hidden = true;
    const hujumJoy = h("div", { class: "hujum-joy" });
    el.append(h("div", { class: "men-qala-wrap" }, menQala, lenta), qorovulJoy, hujumJoy);

    let tugadi = false;
    let fishingYuborildi = false;
    let xatSanoq = 0;
    let qorovulOchiq = false;
    let voqeaSoni = 0;
    const tugmalar = [{ label: "Toʻxtatish", onClick: () => yakun(), secondary: true }];
    const sizganKalit = () => ((s.jamoa[ROBOT].sizdi || []).includes("kalit") && s.jamoa[ROBOT].himoya ? s.jamoa[ROBOT].himoya.kalit || "" : "");

    const ekran = O.hujum(hujumJoy, {
      korinish: Q.korinish(s.jamoa[ROBOT].himoya || robotHim), urinish: s.jamoa[ROBOT].urinish, tugaydi: s.fazaTugaydi, tugmalar, // urinishlar nishon qalʼasida sanaladi
      onAmal(amal) {
        if (tugadi || s.faza !== "hujum") return;
        let a = amal;
        if (amal.tur === "fishing") {
          const xat = Q.xatYasa(P.fishingQismlar(amal));
          if (!xat || fishingYuborildi) { ekran.javob("fishing", "0"); return; }
          a = { tur: "fishing", xat };
        }
        const r = Q.hujum(s, MEN, a, Date.now());
        ekran.javob(amal.tur, O.javobKodi(amal.tur, r));
        if (amal.tur === "fishing" && r && r.ok !== false) {
          fishingYuborildi = true;
          const nomer = xatNomer(r, ++xatSanoq);
          // Robot qorovullari (3 ta) 3–6 soniyada ovoz beradi
          setTimeout(() => {
            if (tugadi || s.faza !== "hujum") return;
            const ovozlar = [0, 1, 2].map(() => !!Q.robotQorovul(a.xat, rng, daraja));
            Q.qorovulOvoz(s, ROBOT, nomer, ovozlar, Date.now());
            sound.play(ovozlar.filter(Boolean).length >= 2 ? "boom" : "tak");
            yangila();
          }, 3000 + rng() * 3000);
        }
        yangila();
      },
    });
    U.buttons(tugmalar);

    function yangila() {
      ekran.yangila({ korinish: Q.korinish(s.jamoa[ROBOT].himoya || robotHim), urinish: s.jamoa[ROBOT].urinish, yiqilgan: yiqilganlar(s, ROBOT), sizdi: s.jamoa[ROBOT].sizdi || [], kalit: sizganKalit(), fishingYuborildi });
      menQala.innerHTML = "";
      menQala.append(h("span", { class: "men-qala-nom", text: `Sening qalʼang · ${s.jamoa[MEN].ochko | 0} : ${s.jamoa[ROBOT].ochko | 0} robot` }));
      P.DEVORLAR.forEach((d) => {
        const yiq = s.jamoa[MEN].devor[d].holat === "yiqildi";
        menQala.append(h("span", { class: "devor-yorliq" + (yiq ? " yiqildi" : "") }, h("b", { text: O.DEVOR_NOMI[d] }), h("i", { text: yiq ? "✗" : "✓" })));
      });
      const v = s.voqealar || [];
      if (v.length !== voqeaSoni) {
        voqeaSoni = v.length;
        lenta.innerHTML = "";
        v.slice(-4).reverse().forEach((x) => lenta.append(h("li", { class: x.ok ? "ok" : "" }, h("span", { class: "voqea-jamoa jam-" + x.jamoa, text: x.jamoa === MEN ? "Sen" : x.jamoa === ROBOT ? "Robot" : null }), h("span", { text: O.voqeaMatni(x) }))));
      }
    }

    // Robot fishing xati keldi: oʻyinchi qorovul — 3 haqiqiy + 1 soxta, aralash
    function qorovulPanel(xat, nomer) {
      qorovulOchiq = true;
      const xatlar = [Q.haqiqiyXat(rng), Q.haqiqiyXat(rng), Q.haqiqiyXat(rng)];
      const soxta = Math.floor(rng() * 4);
      xatlar.splice(soxta, 0, xat);
      qorovulJoy.innerHTML = "";
      qorovulJoy.hidden = false;
      sound.play("tak");
      const panel = O.qorovul(qorovulJoy, {
        xatlar,
        onOvoz(ov) {
          Q.qorovulOvoz(s, MEN, nomer, [ov[soxta] === 1], Date.now());
          const ochildi = s.jamoa[MEN].devor.xat.holat === "yiqildi";
          sound.play(ochildi ? "dum" : "correct");
          panel.natija(soxta, ochildi);
          qorovulJoy.append(h("div", { class: "tanlov-qator" }, ui.button("Davom", () => { qorovulJoy.hidden = true; qorovulJoy.innerHTML = ""; qorovulOchiq = false; }, "sm")));
          yangila();
        },
      });
      qorovulJoy.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const timer = setInterval(() => {
      if (tugadi) return;
      const t = Date.now();
      // Robot oʻz vaqtini oʻzi hisoblaydi (8–15 s, s.jamoa[ROBOT].robotKeyingi); qorovul paneli ochiq boʻlsa kutadi
      if (s.faza === "hujum" && !qorovulOchiq) {
        const amal = Q.robotHujum(s, ROBOT, t, rng, daraja);
        if (amal) {
          const r = Q.hujum(s, ROBOT, amal, t);
          if (amal.tur === "fishing" && r && r.ok !== false) {
            const nomer = xatNomer(r, ++xatSanoq);
            const x = s.jamoa[MEN].xatlar && s.jamoa[MEN].xatlar[nomer]; // mantiq yasagan xat (qismlar + belgilar)
            qorovulPanel((x && x.xat) || Q.xatYasa(amal.xat), nomer);
          } else if (r && r.ok !== false) sound.play("hit");
        }
      }
      Q.tekshir(s, t);
      ekran.render(t);
      yangila();
      if (s.faza !== "hujum") yakun();
    }, 250);
    ui.onCleanup(() => clearInterval(timer));

    // ---------- 4. Tahlil ----------
    function yakun() {
      if (tugadi) return;
      tugadi = true;
      clearInterval(timer);
      // Solo: tahlil fazasini kutmaymiz — yakuniy hisob darhol
      let n = Date.now();
      for (let k = 0; k < 3 && s.faza !== "tugadi"; k++) { s.fazaTugaydi = n; Q.tekshir(s, n); n += 1000; }
      const golib = Q.golib(s);
      sound.play(golib === MEN ? "win" : golib === ROBOT ? "dum" : "tak");
      const el2 = U.box(true, "qala-oyin");
      O.tahlil(el2, s, [
        { label: "Yana", onClick: () => qurish(qayt, daraja, qoralama) },
        { label: "Menyu", onClick: qayt, secondary: true },
      ]);
      ui.bubble("elder", golib === MEN ? "Qalʼang mustahkam chiqdi. Yiqilgan devor — qaysi darsni takrorlash kerakligini koʻrsatadi." : "Yiqilgan devorlarga qara: har biri — bitta dars.");
    }

    yangila();
    ekran.render(now);
    ui.bubble("elder", "3 daqiqa. Raqib devorini tanla va qurol ishlat. Robot ham senikiga hujum qiladi — xat kelsa, qorovul boʻl.");
  }

  QK.qalaMashq = { start, DARAJALAR };
})(window);
