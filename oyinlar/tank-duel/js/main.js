// Tank dueli sahifasi: ikki o'quvchi bitta ekranda navbat bilan kod yozadi.
// Jang qoidalari — umumiy/js/jang.js, maydon — umumiy/js/jang-ui.js, navbat — js/duel.js
(function (root) {
  "use strict";

  const { storage, sound, art, ui, jangUi, duel: D, python: py } = root.QK;
  const $ = (id) => document.getElementById(id);
  const SITE_HOME = "../../index.html";
  const store = storage.create("tank-duel:v1", 0); // faqat ovoz tanlovi
  const state = store.load();
  sound.setMuted(state.muted);

  const h = ui.h;
  let m = null;
  let koz = null;
  let holat = null;

  function ovozTugmasi() {
    const b = $("btn-sound");
    b.innerHTML = art.icon(state.muted ? "sound-off" : "sound-on");
    b.setAttribute("aria-label", state.muted ? "Ovozni yoqish" : "Ovozni oʻchirish");
  }
  $("btn-sound").addEventListener("click", () => {
    state.muted = !state.muted;
    sound.setMuted(state.muted);
    store.save(state);
    ovozTugmasi();
  });
  $("btn-home").innerHTML = art.icon("home");
  $("btn-home").addEventListener("click", () => { root.location.href = SITE_HOME; });
  ovozTugmasi();

  const joy = $("joy");
  const tozala = () => { joy.innerHTML = ""; };

  // ---------- Ismlar ----------
  function ismEkrani() {
    tozala();
    const forma = h("div", { class: "td-forma" });
    const a = h("input", { class: "td-ism", type: "text", maxlength: "14", placeholder: "Birinchi oʻyinchi", "aria-label": "Birinchi oʻyinchi ismi" });
    const b = h("input", { class: "td-ism", type: "text", maxlength: "14", placeholder: "Ikkinchi oʻyinchi", "aria-label": "Ikkinchi oʻyinchi ismi" });
    const boshla = ui.button("Boshlash", () => {
      jangBoshla({ a: a.value.trim() || "Birinchi", b: b.value.trim() || "Ikkinchi" });
    }, "big");
    forma.append(
      h("p", { class: "td-izoh", text: "Ikki oʻyinchi navbat bilan oʻz tankiga kod yozadi. Gʻolib — raqibning jonini tugatgan." }),
      h("div", { class: "td-ismlar" }, a, b),
      h("div", { class: "td-buyruqlar" },
        ...["move(50)", "back(30)", "left(90)", "right(90)", "fire()", "reload()", "scan()", "radar()", "hp()", "ammo()"]
          .map((x) => h("span", { class: "td-buyruq", text: x }))),
      boshla);
    joy.append(forma);
    setTimeout(() => a.focus(), 60);
  }

  // ---------- Jang ----------
  function jangBoshla(nomlar) {
    m = D.maydon(nomlar);
    tozala();
    const banner = h("div", { class: "td-navbat" });
    const ikki = h("div", { class: "td-ikki" });
    const chap = h("div", { class: "td-chap" });
    const ong = h("div", { class: "td-ong" });
    ikki.append(chap, ong);
    joy.append(banner, ikki);

    koz = jangUi.maydonKorinishi(chap, m);
    holat = jangUi.holatPaneli(chap, m);
    nomlarniYoz(chap);

    const panel = jangUi.buyruqPaneli(ong, {
      buyruqlar: ["move", "back", "left", "right", "fire", "reload", "scan", "radar", "hp", "ammo"],
      onSatr: async (kod, yoz) => {
        const kim = m.navbat;
        const r = D.satrniBajar(m, kod, py);
        if (r.tugagan) return;
        if (r.xato) {
          yoz("↻ " + r.xato.text, "xato");
          if (r.xato.hint) yoz(r.xato.hint, "izoh");
          return;
        }
        for (const satr of r.chiqish) yoz(satr, "chiqish");
        if (r.chegaraOshdi) yoz("Bitta satrda 8 ta harakat bajariladi — qolgani keyingi navbatda.", "izoh");
        await koz.oyna(r.yozuv);
        holat.chiz();
        if (m.tugadi) {
          natijaEkrani();
          return;
        }
        banner.textContent = "Navbat: " + D.kimNavbati(m);
        banner.className = "td-navbat " + m.navbat;
        yoz("— " + D.kimNavbati(m) + " navbati —", "izoh");
      },
    });
    banner.textContent = "Navbat: " + D.kimNavbati(m);
    banner.className = "td-navbat " + m.navbat;
    panel.yoz("Birinchi navbat: " + D.kimNavbati(m), "izoh");
  }

  function nomlarniYoz(host) {
    host.append(h("div", { class: "td-nomlar" },
      h("span", { class: "td-nom a" }, h("span", { class: "td-nuqta a" }), h("span", { text: m.nomlar.a })),
      h("span", { class: "td-nom b" }, h("span", { class: "td-nuqta b" }), h("span", { text: m.nomlar.b }))));
  }

  // ---------- Natija ----------
  function natijaEkrani() {
    sound.play("win");
    const golib = D.golibNomi(m);
    const karta = h("div", { class: "td-natija" },
      h("div", { class: "td-natija-nom", text: golib ? golib + " yutdi!" : "Durang" }),
      h("div", { class: "td-natija-izoh", text: golib
        ? "Raqibning joni tugadi. " + m.navbatSoni + " navbat ketdi."
        : "Navbatlar tugadi, ikkalasi ham tirik qoldi." }),
      h("div", { class: "td-tugmalar" },
        ui.button("Yana bir bor", () => jangBoshla(m.nomlar), "big"),
        ui.button("Ismlarni oʻzgartirish", () => ismEkrani(), "small"),
        ui.button("Barcha oʻyinlar", () => { root.location.href = SITE_HOME; }, "small")));
    joy.prepend(karta);
    karta.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  ismEkrani();
})(window);
