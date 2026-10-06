// Bosqich tugashi, tabrik ekrani; tabrikdan: erkin chizish (saqlash bilan) va «Mening rasmlarim» galereyasi
// (saqlangan rasmlar: ochish, PNG yuklab olish, o'chirish; namunalar: bahosiz qayta chizish).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, sound } = QK;
  const G = QK.galereya;
  const h = ui.h;

  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    ui.pose("apprentice", "happy", 1200);
    await ui.say("elder", goingOn
      ? `${s}-bosqich tugadi! Barakalla, keyingisiga oʻtamiz.`
      : `${s}-bosqich tugadi! Barakalla!`);
  }

  // ---------- Erkin chizish ----------
  // taxta — ochiladigan rasm (galereyadan), bo'lmasa bo'sh. Qaytadi: "home" | "galereya"
  async function erkinChizish(taxta) {
    ui.clearKeep();
    const host = common.box(true);
    host.append(common.savol("Erkin chizish"));
    const t = common.taxtaQoy(host, {
      taxta: taxta || null,
      amallar: ["bekor", "qaytar", "tozalash", "saqlash"],
      onSaqlash(rasm) {
        if (L.boshmi(rasm)) { ui.toast("Avval biror narsa chiz"); return; }
        const r = G.saqla(rasm);
        if (!r) { ui.toast(G.toldimi() ? "Galereya toʻldi (20 ta). Birini oʻchir." : "Saqlab boʻlmadi"); return; }
        sound.play("correct");
        ui.toast(`Saqlandi: ${r.nom}`);
      },
    });
    ui.bubble("elder", "Xohlagan narsangni chiz. «Saqlash» — rasm galereyaga tushadi.");
    const v = await ui.choice([
      { label: "Mening rasmlarim", value: "galereya", secondary: true },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
    common.taxtaOl(t);
    return v;
  }

  // ---------- Mening rasmlarim ----------
  // Qaytadi: { amal: "home" } | { amal: "erkin", taxta } | { amal: "menyu" }
  async function galereya() {
    ui.clearKeep();
    const host = common.box(false);
    host.append(common.savol("Mening rasmlarim"));
    const royxat = h("div", { class: "kr-galereya" });
    const namunalar = h("div", { class: "kr-kartalar" });
    host.append(royxat, h("div", { class: "kr-savol kichik", text: "Namunalar — qayta chizish" }), namunalar);

    return ui.settle((done) => {
      function chiz() {
        royxat.innerHTML = "";
        const list = G.royxat();
        if (!list.length) {
          royxat.append(h("div", { class: "kr-bosh", text: "Hali rasm yoʻq. Erkin chizishda «Saqlash»ni bos." }));
        }
        for (const r of list) {
          const taxta = G.taxtasi(r);
          if (!taxta) continue;
          let tasdiq = false; // «Oʻchirish» ikki bosqichli: avval tasdiq so'raladi (confirm() yo'q)
          const ochirBtn = h("button", { class: "btn sm secondary kr-ochir", type: "button", "data-amal": "ochir" },
            h("span", { class: "kr-belgi", html: QK.gameArt.icon("ochir") }), h("span", { text: "Oʻchirish" }));
          ochirBtn.addEventListener("click", () => {
            sound.play("tap");
            if (!tasdiq) {
              tasdiq = true;
              ochirBtn.classList.add("yana");
              ochirBtn.querySelector("span:last-child").textContent = "Haqiqatan oʻchiraymi?";
              setTimeout(() => {
                if (!tasdiq) return;
                tasdiq = false;
                ochirBtn.classList.remove("yana");
                ochirBtn.querySelector("span:last-child").textContent = "Oʻchirish";
              }, 4000);
              return;
            }
            G.ochir(r.id);
            chiz();
          });
          royxat.append(h("div", { class: "kr-rasm-karta", "data-rasm": r.id },
            QK.kichikRasm(taxta, 4),
            h("div", { class: "kr-rasm-nom", text: r.nom }),
            h("div", { class: "kr-rasm-amallar" },
              h("button", { class: "btn sm", type: "button", "data-amal": "och", onClick: () => { sound.play("tap"); done({ amal: "erkin", taxta }); } },
                h("span", { class: "kr-belgi", html: QK.gameArt.icon("ochish") }), h("span", { text: "Ochish" })),
              h("button", { class: "btn sm secondary", type: "button", "data-amal": "yukla", onClick: () => { sound.play("tap"); G.pngYukla(taxta, r.nom); } },
                h("span", { class: "kr-belgi", html: QK.gameArt.icon("yuklab") }), h("span", { text: "Yuklab olish" })),
              ochirBtn)));
        }
      }
      chiz();
      for (const n of L.NAMUNALAR) {
        namunalar.append(h("button", {
          class: "kr-karta", type: "button", "data-namuna": n.id, "aria-label": n.nom + " — qayta chizish",
          onClick: () => { sound.play("tap"); done({ amal: "namuna", namuna: n }); },
        }, QK.kichikRasm(L.namunaTaxta(n), 4), h("span", { class: "kr-karta-nom", text: n.nom })));
      }
      ui.bubble("elder", "Rasmni ochib davom ettirsang yoki yuklab olsang boʻladi.");
      ui.clearControl();
      ui.control().append(h("div", { class: "choice-row" },
        ui.button("Erkin chizish", () => done({ amal: "erkin", taxta: null })),
        ui.button("Bosh ekran", () => done({ amal: "home" }), "secondary")));
    });
  }

  // Namunani bahosiz chizish, oxirida saqlash taklifi
  async function namunaChizish(namuna) {
    ui.clearKeep();
    const natija = await common.bahosizChiz(namuna);
    if (!L.boshmi(natija.taxta)) {
      ui.bubble("elder", "Rasmni galereyaga saqlaymizmi?");
      const v = await ui.choice([
        { label: "Saqlash", value: "saqla" },
        { label: "Saqlamasdan", value: "yoq", secondary: true },
      ]);
      if (v === "saqla") {
        const r = G.saqla(natija.taxta);
        ui.toast(r ? `Saqlandi: ${r.nom}` : "Galereya toʻldi (20 ta). Birini oʻchir.");
      }
    }
    common.taxtaOl(natija.t);
  }

  function tabrikKarta() {
    ui.setCompact(false);
    ui.clearWork();
    ui.work().append(h("div", { class: "story" },
      h("div", { class: "story-art small", html: QK.gameArt.palitra() }),
      h("div", { class: "summary" },
        h("div", { text: "Qalam, shakllar, chelak va oʻchirgʻich — sening asboblaring" }),
        h("div", { text: "Rang — palitradan, xato — «Bekor» bilan qaytadi" }),
        h("div", { text: "Endi erkin chiz va rasmlaringni saqla" }))));
  }

  // Tabrik: «Erkin chizish» va «Mening rasmlarim» shu yerdan ochiladi (o'yin bosh ekranini qobiq chizadi).
  // app.js ga faqat "replay" yoki "home" qaytariladi.
  // Rejimlar sikli: erkin chizish ↔ galereya ↔ namuna; "replay" yoki "home" bilan tugaydi.
  // boshlanish — darhol ochiladigan rejim ("erkin" | "galereya") yoki null (tanlov so'raladi)
  async function rejimlar(boshlanish) {
    let keyingi = boshlanish || null;
    for (;;) {
      const v = keyingi || await ui.choice([
        { label: "Erkin chizish", value: "erkin" },
        { label: "Mening rasmlarim", value: "galereya", secondary: true },
        { label: "Qayta oʻynash", value: "replay", secondary: true },
        { label: "Bosh ekran", value: "home", secondary: true },
      ]);
      keyingi = null;
      if (v === "replay" || v === "home") return v;
      if (v === "erkin" || (v && v.amal === "erkin")) {
        const r = await erkinChizish(v.taxta || null);
        if (r === "home") return "home";
        keyingi = "galereya";
        continue;
      }
      if (v === "galereya") {
        const r = await galereya();
        if (r.amal === "home") return "home";
        if (r.amal === "erkin") { keyingi = { amal: "erkin", taxta: r.taxta }; continue; }
        if (r.amal === "namuna") { await namunaChizish(r.namuna); keyingi = "galereya"; continue; }
      }
      tabrikKarta();
      ui.bubble("elder", "Yana nima qilamiz?");
    }
  }

  async function congrats() {
    tabrikKarta();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tabriklayman! Endi sen — kichik rassomsan.");
    return rejimlar(null);
  }

  // O'yin bosh ekrani (qobiq chizadi): hamma bosqich tugagach — erkin chizish va galereya tugmalari
  function qoshimcha({ allDone, home }) {
    if (!allDone) return null;
    const och = (rejim) => async () => {
      sound.play("tap");
      ui.newRun();
      ui.clearKeep();
      ui.clearControl();
      await rejimlar(rejim); // "replay" ham bosh ekranga qaytaradi — u yerda «Qayta oʻynash» bor
      ui.clearKeep();
      home();
    };
    return h("div", { class: "hard-row" },
      ui.button("🎨 Erkin chizish", och("erkin")),
      ui.button("Mening rasmlarim", och("galereya"), "secondary"));
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats, qoshimcha });
})(window);
