// 65-o'yin: uch xil mashq ekrani (O'qi, Tuzat, Tarjima qil) va Python lug'ati.
// Quruvchi, Python ko'rinishi, yurgizish — umumiy: umumiy/js/blok-ui.js
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, blok: B, blokUi: BU, dastur: D, dasturUi: DU, practice } = QK;
  const h = ui.h;

  // Bitta maydon (goal: false — gulxansiz, 1-bosqich)
  function maydon(host, f, goal) {
    const joy = h("div", { class: "bk-maydonlar" });
    const katak = h("div", { class: "bk-maydon" });
    joy.append(katak);
    host.append(joy);
    return { f, view: DU.fieldView(katak, f, { goal: goal !== false }), katak };
  }

  // Bloklar | Python yonma-yon (telefonda ustma-ust)
  const ikki = (host) => {
    const el = h("div", { class: "bk-ikki" });
    host.append(el);
    return el;
  };

  // Robotni yo'l bo'ylab yurgizish (gulxansiz maydonda ↻ qo'yilmaydi)
  async function yurKor(m, r, belgi) {
    m.view.set(m.f.robot, true);
    m.view.clearTrail();
    m.view.clearMarks();
    await m.view.walk(r.path);
    m.view.trail(r.path);
    if (belgi) m.view.mark(r.at, belgi);
  }

  // ---------- Python lug'ati ----------
  // Yordamchi jadval (QOIDALAR 4.3): kalit so'z 2 marta to'g'ri yechilgan vazifada uchragach yashiriladi,
  // maslahat uni qaytaradi.
  const LUGAT = [
    { kalit: "yur", bor: (m) => /ongga\(\)|chapga\(\)|yuqoriga\(\)|pastga\(\)/.test(m), kod: "ongga() chapga() yuqoriga() pastga()", mano: "→ ← ↑ ↓" },
    { kalit: "for", bor: (m) => /range\(\d/.test(m), kod: "for i in range(3):", mano: "3 marta takrorla" },
    { kalit: "if", bor: (m) => /\bif /.test(m), kod: "if ong_bosh():", mano: "agar → boʻsh boʻlsa" },
    { kalit: "else", bor: (m) => /else:/.test(m), kod: "else:", mano: "aks holda" },
    { kalit: "while", bor: (m) => /while \w+_bosh/.test(m), kod: "while ong_bosh():", mano: "→ boʻsh ekan takrorla" },
    { kalit: "def", bor: (m) => /\bdef /.test(m), kod: "def yulduz():", mano: "★ buyrugʻini yasash" },
    { kalit: "qadam", bor: (m) => /qadam = 0/.test(m), kod: "qadam = qadam + 1", mano: "qadam + 1" },
    { kalit: "range-qadam", bor: (m) => /range\(qadam\)/.test(m), kod: "for i in range(qadam):", mano: "takror qadam marta" },
  ];
  const korilgan = {}; // kalit → necha marta to'g'ri yechilgan vazifada uchradi

  function lugat(host, matn, hammasi) {
    const qatorlar = LUGAT.filter((x) => x.bor(matn) && (hammasi || (korilgan[x.kalit] || 0) < 2));
    if (!qatorlar.length) return null;
    const el = h("div", { class: "py-lugat", "aria-label": "Python lugʻati" },
      ...qatorlar.map((x) => h("div", { class: "py-lugat-qator" },
        h("code", { class: "py-lugat-kod", text: x.kod }), h("span", { class: "py-lugat-mano", text: x.mano }))));
    host.append(el);
    return el;
  }
  function lugatSana(matn) {
    for (const x of LUGAT) if (x.bor(matn)) korilgan[x.kalit] = (korilgan[x.kalit] || 0) + 1;
  }
  // Lug'atni (yashirilgan bo'lsa) to'liq qaytarish — maslahatda
  function lugatQaytar(host, joy, matn) {
    if (joy.el) joy.el.remove();
    joy.el = lugat(host, matn, true);
  }

  // ---------- 1-bosqich: O'qi ----------
  function oqiExercise(level) {
    const matn = B.pythonMatn(level.dastur, level.fn);
    const r = B.bajar(level.f, level.dastur, { fn: level.fn });
    let host = null;
    let m = null;
    let stop = null;
    let picked = null;
    const joy = {};
    return practice.tries({
      setup(submit) {
        host = BU.box(true);
        host.append(BU.note(level.matn));
        m = maydon(host, level.f, false);
        BU.pythonKod(host).chiz(level.dastur, level.fn);
        joy.el = lugat(host, matn);
        stop = m.view.pickCell((c) => { picked = c; });
        ui.control().append(ui.button("Tayyor ✓", () => {
          if (!picked) { ui.toast("Avval katakni bos."); return; }
          submit(picked);
        }, "big"));
      },
      check(c) {
        const ok = D.sameCell(c, level.javob);
        if (ok) lugatSana(matn);
        return ok;
      },
      hint() {
        lugatQaytar(host, joy, matn);
        host.append(BU.note("↻ Har qatorni navbat bilan oʻqi: for — necha marta, ichidagi qatorlar — nima qiladi."));
      },
      solution() {
        if (stop) stop();
        host.append(BU.answer("Robot shu katakda toʻxtaydi."));
        yurKor(m, r, "ok");
      },
    });
  }

  // ---------- 2-bosqich: Tuzat ----------
  // Python matni (tahrir tugmalari bilan) va yonida qulflangan bloklar — ikkalasi birga yangilanadi.
  // onRun(natija, ozgardi) — ▶︎ bosilib, robot yurib bo'lgach.
  function tuzatEkran(host, level, onRun) {
    const cur = B.nusxa(level.buzuq);
    const curFn = level.buzuqFn ? B.nusxa(level.buzuqFn) : undefined;
    const buzuqMatn = B.pythonMatn(level.buzuq, level.buzuqFn);
    const m = BU.maydonlar(host, [level.f]);
    const yon = ikki(host);
    let band = false; // robot yurayotganda yoki vazifa tugagach tahrir yo'q
    const kod = BU.pythonKod(yon, {
      tahrir(t) {
        if (band) return;
        BU.tahrirla(t);
        qayta();
      },
    });
    const qur = BU.quruvchi(yon, { fn: curFn, dastur: cur });
    qur.qulfla();
    function qayta() {
      kod.chiz(cur, curFn);
      qur.qoy(cur, curFn);
      m[0].view.set(level.f.robot, true);
      m[0].view.clearTrail();
      m[0].view.clearMarks();
    }
    kod.chiz(cur, curFn);
    const yurBtn = ui.button("▶︎ Ishga tushir", async () => {
      if (band) return;
      band = true;
      yurBtn.disabled = true;
      const [natija] = await BU.yurgiz(m, cur, curFn);
      yurBtn.disabled = false;
      band = false;
      onRun(natija, B.pythonMatn(cur, curFn) !== buzuqMatn);
    }, "big");
    ui.control().append(yurBtn);
    // Tekshirish uchun (avtomatik o'ynash skripti): QK.tuzat.qoy(QK.current.dastur, QK.current.fn), keyin ▶︎
    QK.tuzat = {
      qoy(d, fn) {
        cur.length = 0;
        cur.push(...B.nusxa(d));
        for (const nom of Object.keys(fn || {})) if (curFn && curFn[nom]) curFn[nom].splice(0, curFn[nom].length, ...B.nusxa(fn[nom]));
        qayta();
      },
    };
    return {
      m, kod, qur,
      tugat() { band = true; },
      // To'g'ri dasturni ko'rsatish: o'zgargan qator yoritiladi
      togrisi() {
        band = true;
        cur.length = 0;
        cur.push(...B.nusxa(level.dastur));
        kod.chiz(cur, level.fn);
        qur.qoy(cur, level.fn);
        kod.belgila(L.farqQator(buzuqMatn, level.togriMatn), "farq");
        return BU.yurgiz(m, cur, level.fn);
      },
    };
  }

  const TOXTADI = {
    wall: "Robot toshga urildi.",
    edge: "Robot maydon chekkasiga urildi.",
    end: "Buyruqlar tugadi, robot gulxanga yetmadi.",
    uzun: "Robot toʻxtamay yurib ketdi.",
  };

  function tuzatExercise(level) {
    let host = null;
    let ekran = null;
    const matn = level.togriMatn;
    const joy = {};
    return practice.tries({
      setup(submit) {
        host = BU.box(true);
        host.append(BU.note(level.matn));
        ekran = tuzatEkran(host, level, (natija, ozgardi) => {
          // Hali hech narsa almashtirilmagan: bu — xatoni koʻrish uchun yurgizish, urinish sanalmaydi
          if (!ozgardi) { ui.bubble("elder", "Robot qayerda adashganini koʻrding. Endi sariq qismni bosib tuzat."); return; }
          submit(natija);
        });
        joy.el = lugat(host, matn);
      },
      check(natija) {
        const ok = natija.status === "goal";
        if (ok) { ekran.tugat(); lugatSana(matn); }
        return ok;
      },
      hint(natija) {
        lugatQaytar(host, joy, matn);
        host.append(BU.note("↻ " + (TOXTADI[natija.status] || "") + " Robot qaysi qatorda yoʻldan chiqqanini kuzat — oʻsha qatordagi son yoki yoʻnalish xato."));
      },
      solution() {
        host.append(BU.answer("Toʻgʻri dastur — oʻzgargan qator belgilangan."));
        ekran.togrisi();
      },
    });
  }

  // ---------- 3-bosqich: Tarjima qil ----------
  function tarjimaEkran(host, level, qulf) {
    const m = BU.maydonlar(host, [level.f]);
    const yon = ikki(host);
    const kod = BU.pythonKod(yon);
    kod.chiz(level.yechim, level.yechimFn);
    const qur = BU.quruvchi(yon, { bloklar: level.bloklar, maxBlok: level.maxBlok, fn: level.fn });
    if (qulf) qur.qulfla();
    return { m, kod, qur };
  }

  function tarjimaExercise(level) {
    let host = null;
    let e = null;
    const matn = level.togriMatn;
    const joy = {};
    return practice.tries({
      setup(submit) {
        host = BU.box(true);
        host.append(BU.note(level.matn));
        e = tarjimaEkran(host, level);
        BU.pad(host, level.bloklar, (t) => e.qur.qosh(t));
        joy.el = lugat(host, matn);
        const yurBtn = ui.button("▶︎ Tekshir", async () => {
          if (!e.qur.dastur.length) { ui.toast("Avval bloklardan yigʻ."); return; }
          yurBtn.disabled = true;
          e.kod.belgila(-1, "farq");
          await BU.yurgiz(e.m, e.qur.dastur, e.qur.fn);
          yurBtn.disabled = false;
          submit(B.pythonMatn(e.qur.dastur, e.qur.fn));
        }, "big");
        ui.control().append(yurBtn, ui.button("Tozalash", () => e.qur.tozala(), "small"));
      },
      check(qurilgan) {
        const ok = qurilgan === matn;
        if (ok) lugatSana(matn);
        return ok;
      },
      hint(qurilgan) {
        const jami = matn.split("\n").length;
        e.kod.belgila(Math.min(L.farqQator(matn, qurilgan), jami - 1), "farq");
        lugatQaytar(host, joy, matn);
        host.append(BU.note("↻ Belgilangan qatorni yana bir solishtir."));
      },
      solution() {
        e.kod.belgila(-1, "farq");
        host.append(BU.answer("Namunali yechim:"));
        e.qur.qoy(level.yechim, level.yechimFn || {});
        BU.yurgiz(e.m, level.yechim, level.yechimFn);
      },
    });
  }

  QK.common = { maydon, ikki, yurKor, lugat, oqiExercise, tuzatEkran, tuzatExercise, tarjimaEkran, tarjimaExercise };
})(window);
