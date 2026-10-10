// Qalʼa — lugʻat ekrani: QK.qala.ATAMALAR dars boʻyicha guruhlangan, har qator uz · en · ru + izoh.
// Tepada qidiruv: uch tilning istalganida, katta-kichik harf va apostrof turidan qatʼi nazar.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui } = QK;
  const U = QK.qalaUi;
  const h = ui.h;
  const NOMLAR_ZAXIRA = ["Parol", "Qulf", "Shifr", "Xat", "Oq shlyapa"];

  // Solishtirish uchun: kichik harf, apostroflarning hamma turi (U+02BB, U+02BC, U+2018, U+2019, U+0060, U+00B4 va oddiysi U+0027) olib tashlanadi
  const APOSTROFLAR = new RegExp("[\\u02BB\\u02BC\\u0027\\u2018\\u2019\\u0060\\u00B4]", "g");
  const sodda = (s) => String(s || "").toLowerCase().replace(APOSTROFLAR, "");

  function filtrla(atamalar, matn) {
    const q = sodda(matn).trim();
    if (!q) return atamalar.slice();
    return atamalar.filter((a) => [a.uz, a.en, a.ru].some((s) => sodda(s).includes(q)));
  }

  // Dars raqami boʻyicha guruhlar: [{ dars, nom, atamalar }] oʻsish tartibida
  function guruhla(atamalar, nomlar) {
    const map = new Map();
    atamalar.forEach((a) => {
      const d = Number(a.dars) || 0;
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(a);
    });
    return [...map.keys()].sort((a, b) => a - b).map((d) => ({ dars: d, nom: (nomlar || [])[d - 1] || "", atamalar: map.get(d) }));
  }

  function qator(a) {
    return h("div", { class: "lugat-qator" },
      h("div", { class: "lugat-sozlar" },
        h("span", { class: "lugat-uz", text: a.uz }), h("span", { class: "lugat-nuqta", text: "·" }),
        h("span", { class: "lugat-en", text: a.en }), h("span", { class: "lugat-nuqta", text: "·" }),
        h("span", { class: "lugat-ru", text: a.ru })),
      a.izoh ? h("div", { class: "lugat-izoh", text: a.izoh }) : null);
  }

  function start(qayt) {
    ui.newRun();
    ui.hideProgress();
    const nomlar = (QK.qalaDars && QK.qalaDars.NOMLAR) || NOMLAR_ZAXIRA;
    const hammasi = (QK.qala && QK.qala.ATAMALAR) || [];
    const el = U.box(false);
    U.sarlavha(el, { nom: "Lugʻat", izoh: "Atamalar uch tilda: oʻzbek · english · русский.", onOrqaga: qayt });
    const input = h("input", { class: "lugat-qidiruv", type: "search", placeholder: "Qidirish: parol, hash, шифр…", "aria-label": "Atama qidirish", autocomplete: "off" });
    const royxat = h("div", { class: "lugat" });
    el.append(input, royxat);
    const chiz = () => {
      royxat.innerHTML = "";
      const guruhlar = guruhla(filtrla(hammasi, input.value), nomlar);
      if (!guruhlar.length) { royxat.append(h("p", { class: "lugat-bosh", text: hammasi.length ? "Topilmadi." : "Atamalar hali yuklanmagan." })); return; }
      guruhlar.forEach((g) => {
        royxat.append(h("section", { class: "lugat-guruh" },
          h("h2", { text: g.nom ? `${g.dars}-dars · ${g.nom}` : "Boshqa" }),
          ...g.atamalar.map(qator)));
      });
    };
    input.addEventListener("input", chiz);
    chiz();
    ui.bubble("elder", `${hammasi.length} ta atama. Yozib qidir — uch tilda ham topadi.`);
    U.buttons([{ label: "Menyu", onClick: qayt, secondary: true }]);
  }

  QK.qalaLugat = { start, sof: { sodda, filtrla, guruhla } };
})(window);
