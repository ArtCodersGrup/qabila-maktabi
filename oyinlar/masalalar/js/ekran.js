// Masalalar maydoni: ro'yxat (qidiruv, filtr, sahifalash) va bitta masala ekrani.
// Mantiq: royxat.js (filtr/sahifa), baho.js (testlar va foiz), holat.js (saqlash).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, kod: K, kodUI: U } = QK;
  const CU = QK.cppUI;
  const R = QK.masalaRoyxat;
  const B = QK.baho;
  const H = QK.masalaHolat;
  const h = ui.h;

  const work = () => root.document.getElementById("zone-work");
  const control = () => root.document.getElementById("zone-control");

  // Ro'yxat holati (sahifa, qidiruv, filtrlar) — ekranlar orasida saqlanadi.
  // Birinchi kirishda standart filtr "Qiyinlik: 500+" (oson masalalar birinchi sahifani to'ldirmasin);
  // bola filtrni o'zgartirsa yoki "Tozalash" ni bossa — tanlovi brauzerda saqlanadi (holat.js).
  const saqlangan = H.filtrOqi();
  const holat = Object.assign(R.standartFiltr(), saqlangan ? R.tozaFiltr(saqlangan) : {});
  const filtrSaqla = () => H.filtrYoz(holat);

  // Masalani Python yoki C++ da yechish mumkin. Kutilgan javob ikkalasida ham bir xil —
  // u bankdagi namunali yechimdan hisoblanadi. Tanlov brauzerda saqlanadi.
  const TIL_KALIT = "qabila:masala-til:v1";
  const TILLAR = [{ id: "python", nom: "Python" }, { id: "cpp", nom: "C++" }];
  const tilOqi = () => {
    try { return root.localStorage.getItem(TIL_KALIT) === "cpp" ? "cpp" : "python"; } catch (e) { return "python"; }
  };
  const tilYoz = (t) => {
    try { root.localStorage.setItem(TIL_KALIT, t); } catch (e) { /* maxfiy rejim — muhim emas */ }
  };

  function tozala() {
    ui.newRun();
    work().innerHTML = "";
    control().innerHTML = "";
  }

  const chip = (matn, cls) => h("span", { class: "chip " + (cls || ""), text: matn });

  // ---------- Ro'yxat ekrani ----------
  function royxatEkran() {
    tozala();
    root.location.hash = "";
    const box = h("div", { class: "mbox" });
    work().append(box);

    const qidiruv = h("input", {
      class: "m-qidiruv", type: "search", placeholder: "Masala qidirish: nom, teg yoki 4A",
      "aria-label": "Masala qidirish", value: holat.qidiruv,
    });
    const natijaSoni = h("span", { class: "m-soni" });
    box.append(h("div", { class: "m-tepa" }, qidiruv, natijaSoni));

    const tanlov = (nom, qiymat, variantlar, onChange) => {
      const sel = h("select", { class: "m-filtr", "aria-label": nom });
      sel.append(h("option", { value: "", text: nom }));
      for (const v of variantlar) {
        const opt = h("option", { value: String(v.id), text: v.nom });
        if (String(v.id) === String(qiymat)) opt.selected = true;
        sel.append(opt);
      }
      sel.addEventListener("change", () => onChange(sel.value));
      return sel;
    };

    const filtrlar = h("div", { class: "m-filtrlar" });
    box.append(filtrlar);
    const jadval = h("div", { class: "m-royxat" });
    box.append(jadval);
    const sahifalash = h("div", { class: "m-sahifalar" });
    box.append(sahifalash);

    function chiz() {
      const hammasi = R.hammasi();
      const hol = H.hammasi();
      const list = R.filtr(hammasi, holat, hol);
      const s = R.sahifa(list, holat.sahifa);
      holat.sahifa = s.sahifa;

      natijaSoni.textContent = list.length
        ? `${list.length} ta masala${list.length !== hammasi.length ? ` (jami ${hammasi.length})` : ""}`
        : "Masala topilmadi";

      filtrlar.innerHTML = "";
      filtrlar.append(
        tanlov("Daraja", holat.daraja, R.darajalar(), (v) => { holat.daraja = v; holat.sahifa = 1; filtrSaqla(); chiz(); }),
        tanlov("Mavzu", holat.teg, R.teglar().map((t) => ({ id: t, nom: t })), (v) => { holat.teg = v; holat.sahifa = 1; filtrSaqla(); chiz(); }),
        tanlov("Qiyinlik: hammasi", holat.qiyinlik, R.qiyinlikTanlovlari(), (v) => { holat.qiyinlik = v; holat.sahifa = 1; filtrSaqla(); chiz(); }),
        tanlov("Holati", holat.holat, [{ id: "yechilgan", nom: "Yechilgan" }, { id: "yechilmagan", nom: "Yechilmagan" }],
          (v) => { holat.holat = v; holat.sahifa = 1; filtrSaqla(); chiz(); }));
      if (holat.qidiruv || holat.daraja || holat.teg || holat.qiyinlik || holat.holat) {
        // "Tozalash" standart filtrni ham olib tashlaydi — bola bankdagi hamma masalani ko'radi
        filtrlar.append(h("button", {
          class: "m-tozala", type: "button", text: "Tozalash",
          onClick: () => {
            Object.assign(holat, { qidiruv: "", daraja: "", teg: "", qiyinlik: "", holat: "", sahifa: 1 });
            qidiruv.value = "";
            filtrSaqla();
            chiz();
          },
        }));
      }

      jadval.innerHTML = "";
      if (!s.items.length) {
        jadval.append(h("div", { class: "m-bosh", text: "Boshqacha qidirib koʻr yoki filtrlarni tozala." }));
      }
      s.items.forEach((p, k) => {
        const hp = hol[p.id] || {};
        const belgi = hp.yechilgan ? "✓" : hp.foiz ? `${hp.foiz}%` : "";
        jadval.append(h("button", {
          class: "m-qator" + (hp.yechilgan ? " yechilgan" : ""), type: "button",
          onClick: () => masalaEkran(p.id),
        },
        h("span", { class: "m-raqam", text: String(s.boshi + k + 1) }),
        h("span", { class: "m-nom" },
          h("span", { class: "m-nom-matn", text: p.title }),
          h("span", { class: "m-teglar" }, chip(p.darajaNom, "daraja"), ...(p.tags || []).map((t) => chip(t)))),
        h("span", { class: "m-qiyinlik" }, chip(String(p.rating), "reyting")),
        h("span", { class: "m-holat" + (hp.yechilgan ? " ok" : ""), text: belgi })));
      });

      sahifalash.innerHTML = "";
      if (s.sahifalar > 1) {
        const tugma = (matn, sahifa, cls) => h("button", {
          class: "m-sahifa " + (cls || ""), type: "button", text: matn,
          disabled: sahifa < 1 || sahifa > s.sahifalar || sahifa === s.sahifa,
          onClick: () => { holat.sahifa = sahifa; chiz(); },
        });
        sahifalash.append(tugma("◀︎", s.sahifa - 1));
        for (let n = 1; n <= s.sahifalar; n++) {
          sahifalash.append(tugma(String(n), n, n === s.sahifa ? "hozir" : ""));
        }
        sahifalash.append(tugma("▶︎", s.sahifa + 1));
      }
    }

    let kutish = null;
    qidiruv.addEventListener("input", () => {
      if (kutish) clearTimeout(kutish);
      kutish = setTimeout(() => { holat.qidiruv = qidiruv.value; holat.sahifa = 1; chiz(); }, 200);
    });
    ui.onCleanup(() => { if (kutish) clearTimeout(kutish); });
    chiz();
  }

  // ---------- Bitta masala ekrani ----------
  function masalaEkran(id) {
    const p = R.bittasi(id);
    if (!p) { royxatEkran(); return; }
    tozala();
    root.location.hash = "masala=" + p.id;
    const task = R.vazifa(p);
    const hp = H.biri(p.id);

    const box = h("div", { class: "mbox" });
    work().append(box);

    box.append(h("button", { class: "m-orqaga", type: "button", text: "◀︎ Masalalar", onClick: royxatEkran }));

    const belgilar = h("div", { class: "masala-belgi" }, chip("qiyinlik " + p.rating, "reyting"));
    (p.tags || []).forEach((t) => belgilar.append(chip(t)));
    belgilar.append(chip(p.darajaNom, "daraja"));
    if (hp.yechilgan) belgilar.append(chip("✓ yechilgan", "ok"));
    else if (hp.foiz) belgilar.append(chip(hp.foiz + "%", "qisman"));

    const karta = h("div", { class: "masala" },
      h("div", { class: "masala-nom", text: p.title }),
      belgilar,
      h("div", { class: "masala-shart", text: p.what }),
      h("div", { class: "masala-format" },
        h("div", {}, h("b", { text: "Kirish: " }), h("span", { text: p.kirish })),
        h("div", {}, h("b", { text: "Chiqish: " }), h("span", { text: p.chiqish }))));

    const namunaBox = (title, lines, cls) => {
      const body = h("pre", { class: "kod-natija" });
      for (const line of lines) body.append(h("span", { class: "kod-chiqsatr", text: line }));
      return h("div", { class: "kod-chiqish " + cls }, h("div", { class: "kod-sarlavha", text: title }), body);
    };
    karta.append(h("div", { class: "namuna" },
      namunaBox("Namunaviy kirish", p.namuna.stdin, "kod-kirish"),
      namunaBox("Namunaviy chiqish", p.namuna.out, "kutilgan")));
    if (p.manba) {
      karta.append(h("div", { class: "masala-manba" },
        h("span", { text: "Gʻoya manbasi: " }),
        h("a", { href: p.manba.url, target: "_blank", rel: "noopener", text: "Codeforces " + p.manba.kod + " — " + p.manba.nom })));
    }
    box.append(karta);

    let til = tilOqi();
    const tilJoy = h("div", { class: "m-tillar" });
    const stolJoy = h("div", { class: "m-stol" });
    const natijaJoy = h("div", { class: "m-natija" });
    box.append(tilJoy, stolJoy, natijaJoy);

    function chiz() {
      tilJoy.innerHTML = "";
      tilJoy.append(h("span", { class: "m-til-nom", text: "Til:" }));
      for (const t of TILLAR) {
        tilJoy.append(h("button", {
          class: "m-til" + (til === t.id ? " hozir" : ""),
          type: "button",
          text: t.nom,
          onClick: () => {
            if (til === t.id) return;
            til = t.id;
            tilYoz(t.id);
            natijaJoy.innerHTML = "";
            chiz();
          },
        }));
      }
      stolJoy.innerHTML = "";
      control().innerHTML = "";
      if (til === "cpp") cppStol();
      else pythonStol();
    }

    function pythonStol() {
      const w = U.workbench({
        rows: 7,
        stdin: p.namuna.stdin,
        saveKey: "masala:" + p.id,
        onRun: (r, code) => korsat(natijaJoy, task, code, "python"),
      });
      stolJoy.append(w.el);
      control().append(ui.button("▶︎ Tekshirish", () => w.run(), "big"));
      setTimeout(() => w.editor.focus(), 60);
    }

    function cppStol() {
      const kalit = "masala:" + p.id + ":cpp";
      const saqlangan = U.draft.read(kalit);
      const ed = CU.muharrir({
        kod: saqlangan != null ? saqlangan : QK.cpp.BOSH.replace("<iostream>\n", "<iostream>\n#include <algorithm>\n#include <string>\n") + "\n    \n" + QK.cpp.OXIR, // olimpiada qolipi: sort va string tayyor
        rows: 9,
        onRun: () => ishga(),
      });
      const chiqishJoy = h("div", { class: "cpp-natija" });
      stolJoy.append(CU.kirishPanel(p.namuna.stdin), ed.el, chiqishJoy);

      let kutish = null;
      ed.area.addEventListener("input", () => {
        if (kutish) clearTimeout(kutish);
        kutish = setTimeout(() => U.draft.write(kalit, ed.get()), 300);
      });
      ui.onCleanup(() => { if (kutish) clearTimeout(kutish); });

      function ishga() {
        const kod = ed.get();
        const r = QK.cpp.run(kod, { stdin: p.namuna.stdin });
        chiqishJoy.innerHTML = "";
        chiqishJoy.append(r.error
          ? CU.xatoPaneli(r.error)
          : CU.chiqishPanel(r.output.length ? r.output : [""], "Namunaviy kirishda chiqish"));
        korsat(natijaJoy, task, kod, "cpp");
      }

      control().append(ui.button("▶︎ Tekshirish", ishga, "big"));
      setTimeout(() => ed.focus(), 60);
    }

    chiz();
  }

  // Uzun kirish/chiqish (katta testlar — 1000 ta son) ekranni to'ldirib yubormasin
  const QISQA = 160;
  function qisqa(satrlar, bosh) {
    const matn = (satrlar || []).join(" ⏎ ");
    if (!matn) return bosh;
    return matn.length > QISQA ? matn.slice(0, QISQA) + "… (juda uzun — " + satrlar.length + " satr)" : matn;
  }

  const sonMatn = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  // Qadam chegarasiga urilgan test: masalada tezlik sinalsa, buni ochiq aytamiz —
  // bola "javobim noto'g'ri" deb emas, "usulim sekin" deb tushunsin
  const sekinIzoh = (task) => (task.qadam
    ? "Bu masalada tezlik ham sinaladi: dasturing shu testda " + sonMatn(task.qadam) + " qadamdan oshib ketdi. Javobing toʻgʻri boʻlishi mumkin — lekin tezroq usul kerak."
    : "Dastur juda uzoq ishladi — sikl toʻxtamayotgan boʻlishi mumkin.");

  // Ochiq yiqilgan test: kirish, kutilgan javob va bolaning chiqishi (yoki xato xabari)
  function ochiqTafsilot(task, bad) {
    const quti = h("div", { class: "m-yordam" },
      h("div", { class: "m-yordam-bosh", text: bad.n + "-test yiqildi" + (bad.namuna ? " (namuna)" : "") }));
    if (bad.error) {
      quti.append(h("div", { class: "m-solishtir" },
        h("div", {}, h("b", { text: "Kirish: " }), h("code", { text: qisqa(bad.kirish, "(yoʻq)") }))));
      quti.append(h("div", { class: "m-xato-matn", text: "↻ " + bad.error.text }));
      if (bad.sekin) quti.append(h("div", { class: "m-xato-izoh", text: sekinIzoh(task) }));
      else if (bad.error.hint) quti.append(h("div", { class: "m-xato-izoh", text: bad.error.hint }));
    } else {
      quti.append(h("div", { class: "m-solishtir" },
        h("div", {}, h("b", { text: "Kirish: " }), h("code", { text: qisqa(bad.kirish, "(yoʻq)") })),
        h("div", {}, h("b", { text: "Kutilgan: " }), h("code", { text: qisqa(bad.kutilgan, "(boʻsh)") })),
        h("div", {}, h("b", { text: "Sendan: " }), h("code", { text: qisqa(bad.chiqqan, "(hech narsa)") }))));
    }
    return quti;
  }

  // Yopiq yiqilgan testlar: kirish va javob ko'rsatilmaydi — faqat hukm (olimpiadadagi kabi)
  function yopiqTafsilot(task, yopiqlar) {
    const quti = h("div", { class: "m-yordam" },
      h("div", { class: "m-yordam-bosh", text: "Yopiq testlar" }));
    const royxat = h("div", { class: "m-yopiq" });
    for (const t of yopiqlar) royxat.append(h("div", { text: "✗ " + t.n + "-test — " + B.hukm(t) }));
    quti.append(royxat);
    if (yopiqlar.some((t) => t.sekin)) quti.append(h("div", { class: "m-xato-izoh", text: sekinIzoh(task) }));
    quti.append(h("div", {
      class: "m-yopiq-izoh",
      text: "Bu testlarning kirishi va javobi koʻrsatilmaydi: har masalada faqat " + B.OCHIQ_SONI
        + " ta yashirin test ochiladi. Chekka holatlarni oʻzing oʻylab koʻr: eng kichik va eng katta qiymat, nol, manfiy sonlar, takrorlar.",
    }));
    return quti;
  }

  // Testlar natijasi: har test raqami bilan ✓/✗ va foiz. Tafsilot faqat ochiq testlarda:
  // namuna va shu masalada bola birinchi yiqilgan 2 ta yashirin test (baho.js; holat.js eslab qoladi).
  function korsat(host, task, code, til) {
    const b = B.baho(task, code, til, H.biri(task.id).ochilgan);
    H.belgila(task.id, b.foiz, b.toliq, b.ochilgan);
    host.innerHTML = "";
    sound.play(b.toliq ? "correct" : "retry");

    const bar = h("div", { class: "m-bar" }, h("div", { class: "m-bar-ich" + (b.toliq ? " toliq" : ""), style: `width:${b.foiz}%` }));
    host.append(h("div", { class: "m-xulosa" + (b.toliq ? " ok" : "") }, h("span", { text: B.xulosa(b) })), bar);
    if (b.bosh) return;

    const qator = h("div", { class: "m-testlar" });
    b.testlar.forEach((t) => qator.append(h("span", {
      class: "m-test" + (t.ok ? " ok" : " xato"),
      title: (t.namuna ? "Namunaviy test" : "Yashirin test") + (t.ok ? "" : " — " + B.hukm(t)),
      text: (t.ok ? "✓ " : "✗ ") + t.n + "-test",
    })));
    host.append(qator);

    if (b.toliq) {
      host.append(h("div", { class: "m-yordam ok", text: "Barakalla! Masala yechildi." }));
      return;
    }
    const qutilar = b.ochiqYiqilgan.map((bad) => ochiqTafsilot(task, bad));
    if (b.yopiqYiqilgan.length) qutilar.push(yopiqTafsilot(task, b.yopiqYiqilgan));
    // Maslahat faqat ikkinchi urinishdan keyin — avval o'zi o'ylab ko'rsin
    if (qutilar.length && H.biri(task.id).urinish >= 2 && task.hint) {
      qutilar[qutilar.length - 1].append(h("div", { class: "m-maslahat", text: "Maslahat: " + task.hint }));
    }
    host.append(...qutilar);
  }

  QK.masalaEkran = { royxatEkran, masalaEkran, holat };
})(window);
