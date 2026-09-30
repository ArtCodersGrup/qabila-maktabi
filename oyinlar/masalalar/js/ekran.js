// Masalalar maydoni: ro'yxat (qidiruv, filtr, sahifalash) va bitta masala ekrani.
// Mantiq: royxat.js (filtr/sahifa), baho.js (testlar va foiz), holat.js (saqlash).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, kod: K, kodUI: U } = QK;
  const R = QK.masalaRoyxat;
  const B = QK.baho;
  const H = QK.masalaHolat;
  const h = ui.h;

  const work = () => root.document.getElementById("zone-work");
  const control = () => root.document.getElementById("zone-control");

  // Ro'yxat holati (sahifa, qidiruv, filtrlar) — ekranlar orasida saqlanadi
  const holat = { qidiruv: "", daraja: "", teg: "", qiyinlik: "", holat: "", sahifa: 1 };

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
        tanlov("Daraja", holat.daraja, R.darajalar(), (v) => { holat.daraja = v; holat.sahifa = 1; chiz(); }),
        tanlov("Mavzu", holat.teg, R.teglar().map((t) => ({ id: t, nom: t })), (v) => { holat.teg = v; holat.sahifa = 1; chiz(); }),
        tanlov("Qiyinlik", holat.qiyinlik, R.qiyinliklar().map((q) => ({ id: q, nom: String(q) })), (v) => { holat.qiyinlik = v; holat.sahifa = 1; chiz(); }),
        tanlov("Holati", holat.holat, [{ id: "yechilgan", nom: "Yechilgan" }, { id: "yechilmagan", nom: "Yechilmagan" }],
          (v) => { holat.holat = v; holat.sahifa = 1; chiz(); }));
      if (holat.qidiruv || holat.daraja || holat.teg || holat.qiyinlik || holat.holat) {
        filtrlar.append(h("button", {
          class: "m-tozala", type: "button", text: "Tozalash",
          onClick: () => { Object.assign(holat, { qidiruv: "", daraja: "", teg: "", qiyinlik: "", holat: "", sahifa: 1 }); qidiruv.value = ""; chiz(); },
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
          h("span", { class: "m-teglar" }, ...(p.tags || []).map((t) => chip(t)))),
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

    const natijaJoy = h("div", { class: "m-natija" });
    const w = U.workbench({
      rows: 7,
      stdin: p.namuna.stdin,
      saveKey: "masala:" + p.id,
      onRun: (r, code) => korsat(natijaJoy, task, code),
    });
    box.append(w.el, natijaJoy);
    control().append(ui.button("▶︎ Tekshirish", () => w.run(), "big"));
    setTimeout(() => w.editor.focus(), 60);
  }

  // Testlar natijasi: har test raqami bilan, foiz va birinchi yiqilganining tafsiloti
  function korsat(host, task, code) {
    const b = B.baho(task, code);
    H.belgila(task.id, b.foiz, b.toliq);
    host.innerHTML = "";
    sound.play(b.toliq ? "correct" : "retry");

    const bar = h("div", { class: "m-bar" }, h("div", { class: "m-bar-ich" + (b.toliq ? " toliq" : ""), style: `width:${b.foiz}%` }));
    host.append(h("div", { class: "m-xulosa" + (b.toliq ? " ok" : "") }, h("span", { text: B.xulosa(b) })), bar);
    if (b.bosh) return;

    const qator = h("div", { class: "m-testlar" });
    b.testlar.forEach((t) => qator.append(h("span", {
      class: "m-test" + (t.ok ? " ok" : " xato"),
      title: t.namuna ? "Namunaviy test" : "Yashirin test",
      text: (t.ok ? "✓ " : "✗ ") + t.n + "-test",
    })));
    host.append(qator);

    const bad = b.birinchiYiqilgan;
    if (!bad) {
      host.append(h("div", { class: "m-yordam ok", text: "Barakalla! Masala yechildi." }));
      return;
    }
    const tafsilot = h("div", { class: "m-yordam" },
      h("div", { class: "m-yordam-bosh", text: bad.n + "-test yiqildi" }));
    if (bad.error) {
      tafsilot.append(h("div", { class: "m-xato-matn", text: "↻ " + bad.error.text }));
      if (bad.error.hint) tafsilot.append(h("div", { class: "m-xato-izoh", text: bad.error.hint }));
    } else {
      tafsilot.append(h("div", { class: "m-solishtir" },
        h("div", {}, h("b", { text: "Kirish: " }), h("code", { text: bad.kirish.join(" ⏎ ") || "(yoʻq)" })),
        h("div", {}, h("b", { text: "Kutilgan: " }), h("code", { text: bad.kutilgan.join(" ⏎ ") })),
        h("div", {}, h("b", { text: "Sendan: " }), h("code", { text: bad.chiqqan.join(" ⏎ ") || "(hech narsa)" }))));
    }
    // Maslahat faqat ikkinchi urinishdan keyin — avval o'zi o'ylab ko'rsin
    if (H.biri(task.id).urinish >= 2 && task.hint) {
      tafsilot.append(h("div", { class: "m-maslahat", text: "Maslahat: " + task.hint }));
    }
    host.append(tafsilot);
  }

  QK.masalaEkran = { royxatEkran, masalaEkran, holat };
})(window);
