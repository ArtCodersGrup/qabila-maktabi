// Bosqich tugashi, tabrik ekrani; tabrikdan: erkin yozish (saqlash bilan) va «Hujjatlar» ro'yxati (ochish, o'chirish).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, sound, muharrir, hujjatlar: H } = QK;
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

  // ---------- Erkin yozish ----------
  // hujjat — ochiladigan hujjat (ro'yxatdan), bo'lmasa bo'sh. Qaytadi: "home" | "hujjatlar"
  async function erkinYozish(hujjat) {
    ui.clearKeep();
    const host = common.box(true);
    host.append(common.savol(hujjat ? `Hujjat: ${hujjat.nom}` : "Erkin yozish"));
    const m = muharrir.yasa(host, {
      rejim: "bezak", html: hujjat ? hujjat.html : "", nom: hujjat ? hujjat.nom : null, nomsiz: !!hujjat,
      asboblar: common.BEZAK_ASBOBLAR.concat(["saqlash"]),
      onSaqlash(nom) {
        if (!L.norm(m.matn()).trim()) { ui.toast("Avval biror narsa yoz"); return; }
        const r = hujjat ? H.yangila(hujjat.id, m.matn(), m.html()) : H.saqla(nom, m.matn(), m.html());
        if (!r) { ui.toast(H.toldimi() ? "Hujjatlar toʻldi (10 ta). Birini oʻchir." : "Saqlab boʻlmadi"); return; }
        sound.play("correct");
        m.holat(`Saqlandi: «${r.nom}»`);
        ui.toast(`Saqlandi: ${r.nom}`);
      },
    });
    ui.bubble("elder", hujjat ? "Hujjat ochildi. Oʻzgartirib, «Saqlash»ni bossang — yangilanadi." : "Xohlagan narsangni yoz va bezat. «Saqlash» — hujjat roʻyxatga tushadi.");
    m.fokus();
    const v = await ui.choice([
      { label: "Hujjatlar", value: "hujjatlar", secondary: true },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
    m.toxtat();
    return v;
  }

  // ---------- Hujjatlar ----------
  // Qaytadi: { amal: "home" } | { amal: "erkin", hujjat }
  async function hujjatlar() {
    ui.clearKeep();
    const host = common.box(false);
    host.append(common.savol("Hujjatlar"));
    const royxat = h("div", { class: "my-hujjatlar" });
    host.append(royxat);

    return ui.settle((done) => {
      function chiz() {
        royxat.innerHTML = "";
        const list = H.royxat();
        if (!list.length) royxat.append(h("div", { class: "my-bosh", text: "Hali hujjat yoʻq. Erkin yozishda «Saqlash»ni bos." }));
        for (const r of list) {
          let tasdiq = false; // «Oʻchirish» ikki bosqichli: avval tasdiq so'raladi (confirm() yo'q)
          const ochirBtn = h("button", { class: "btn sm secondary", type: "button", "data-amal": "ochir" },
            h("span", { class: "my-belgi", html: QK.gameArt.asbob("ochir") }), h("span", { text: "Oʻchirish" }));
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
            H.ochir(r.id);
            chiz();
          });
          royxat.append(h("div", { class: "my-hujjat", "data-hujjat": r.id },
            h("div", { class: "my-hujjat-belgi", html: QK.stolArt.icon("f-matn") }),
            h("div", { class: "my-hujjat-matn" },
              h("div", { class: "my-hujjat-nom", text: r.nom }),
              h("div", { class: "my-hujjat-qator", text: L.birinchiQator(r.matn) || "(boʻsh)" })),
            h("div", { class: "my-hujjat-amallar" },
              h("button", { class: "btn sm", type: "button", "data-amal": "och", onClick: () => { sound.play("tap"); done({ amal: "erkin", hujjat: r }); } },
                h("span", { class: "my-belgi", html: QK.gameArt.asbob("ochish") }), h("span", { text: "Ochish" })),
              ochirBtn)));
        }
      }
      chiz();
      ui.bubble("elder", "Saqlangan hujjatlaring. Ochib davom ettirsang yoki oʻchirsang boʻladi.");
      ui.clearControl();
      ui.control().append(h("div", { class: "choice-row" },
        ui.button("Erkin yozish", () => done({ amal: "erkin", hujjat: null })),
        ui.button("Bosh ekran", () => done({ amal: "home" }), "secondary")));
    });
  }

  function tabrikKarta() {
    ui.setCompact(false);
    ui.clearWork();
    ui.work().append(h("div", { class: "story" },
      h("div", { class: "story-art small", html: QK.gameArt.saqlangan() }),
      h("div", { class: "summary" },
        h("div", { text: "Kursorni bosib qoʻyasan, Backspace va Delete bilan tuzatasan" }),
        h("div", { text: "Shift — katta harf, Enter — yangi qator" }),
        h("div", { text: "Belgilab bezatasan: qalin, kursiv, rang" }),
        h("div", { text: "Saqlangan hujjat yoʻqolmaydi" }))));
  }

  // Rejimlar sikli: erkin yozish ↔ hujjatlar; "replay" yoki "home" bilan tugaydi.
  // boshlanish — darhol ochiladigan rejim ("erkin" | "hujjatlar") yoki null (tanlov so'raladi)
  async function rejimlar(boshlanish) {
    let keyingi = boshlanish || null;
    for (;;) {
      const v = keyingi || await ui.choice([
        { label: "Erkin yozish", value: "erkin" },
        { label: "Hujjatlar", value: "hujjatlar", secondary: true },
        { label: "Qayta oʻynash", value: "replay", secondary: true },
        { label: "Bosh ekran", value: "home", secondary: true },
      ]);
      keyingi = null;
      if (v === "replay" || v === "home") return v;
      if (v === "erkin" || (v && v.amal === "erkin")) {
        const r = await erkinYozish(v.hujjat || null);
        if (r === "home") return "home";
        keyingi = "hujjatlar";
        continue;
      }
      const r = await hujjatlar();
      if (r.amal === "home") return "home";
      keyingi = { amal: "erkin", hujjat: r.hujjat };
    }
  }

  async function congrats() {
    tabrikKarta();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tabriklayman! Endi xatni oʻzing yozib, bezatib, saqlay olasan.");
    return rejimlar(null);
  }

  // O'yin bosh ekrani (qobiq chizadi): hamma bosqich tugagach — erkin yozish va hujjatlar tugmalari
  function qoshimcha({ allDone, home }) {
    if (!allDone) return null;
    const och = (rejim) => async () => {
      sound.play("tap");
      ui.newRun();
      ui.clearKeep();
      ui.clearControl();
      await common.klaviatura();
      await rejimlar(rejim); // "replay" ham bosh ekranga qaytaradi — u yerda «Qayta oʻynash» bor
      ui.clearKeep();
      home();
    };
    return h("div", { class: "hard-row" },
      ui.button("✍️ Erkin yozish", och("erkin")),
      ui.button("Hujjatlar", och("hujjatlar"), "secondary"));
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats, qoshimcha });
})(window);
