// Bosh sahifa: o'yinlar ro'yxati mavzular bo'yicha, har birida tugagan bosqichlar.
// YANGI O'YIN QO'SHILGANDA shu fayldagi GAMES ro'yxatiga qo'shiladi (bosh/tests/bosh.test.js tekshiradi).
(function (root) {
  "use strict";

  const AGE = "8–12";

  const SECTIONS = [
    { id: "kod", title: "Kodlash va shifrlash", note: "Maʼlumotni belgilarga aylantiramiz" },
    { id: "ikkilik", title: "Ikkilik kod", note: "Kompyuter tili: yoniq va oʻchiq" },
    { id: "sanoq", title: "Sanoq tizimlari", note: "Sonlarni yozishning har xil usullari" },
    { id: "ai", title: "Sunʼiy intellekt: qanday oʻrganadi", note: "Misol, soʻz va mukofot bilan" },
    { id: "ai2", title: "Koʻrish, tarmoqlar va xarita", note: "Rasm, neyronlar va AI turlari" },
  ];

  const GAMES = [
    { n: 1, topic: "kod", dir: "01-qabila-kodlari", title: "Qabila kodlari", desc: "Nechta belgidan nechta soʻz yasaladi?", key: "qabila-kodlari:v1", stages: 3, icon: "kodlar" },
    { n: 2, topic: "kod", dir: "02-qabila-morzesi", title: "Qabila Morzesi", desc: "Nuqta va chiziq bilan xabar yuborish", key: "qabila-morzesi:v1", stages: 3, icon: "morze" },
    { n: 3, topic: "kod", dir: "03-sezar-maktubi", title: "Sezar maktubi", desc: "Harflarni surib yozilgan sirli xat", key: "sezar-maktubi:v1", stages: 3, icon: "sezar" },
    { n: 4, topic: "ikkilik", dir: "04-qabila-chiroqlari", title: "Qabila chiroqlari", desc: "Chiroqlar, bitlar va ikkilik sonlar", key: "qabila-chiroqlari:v1", stages: 3, icon: "chiroq" },
    { n: 5, topic: "sanoq", dir: "05-rim-toshi", title: "Rim toshi", desc: "Rim raqamlari va pozitsion tizim", key: "rim-toshi:v1", stages: 3, icon: "rim" },
    { n: 6, topic: "ai", dir: "06-robotni-orgatamiz", title: "Robotni oʻrgatamiz", desc: "Mashina misollardan qanday oʻrganadi", key: "robotni-orgatamiz:v1", stages: 3, icon: "robot" },
    { n: 7, topic: "ai", dir: "07-keyingi-soz", title: "Keyingi soʻz", desc: "Chatbot keyingi soʻzni qanday tanlaydi", key: "keyingi-soz:v1", stages: 3, icon: "gap" },
    { n: 8, topic: "ai", dir: "08-sehrli-qutilar", title: "Sehrli qutilar", desc: "Robot oʻynab, mukofot bilan oʻrganadi", key: "sehrli-qutilar:v1", stages: 3, icon: "qutilar" },
    { n: 9, topic: "ai", dir: "09-qoida-yoki-misol", title: "Qoida yoki misol?", desc: "Qachon qoida yozamiz, qachon misol koʻrsatamiz", key: "qoida-yoki-misol:v1", stages: 3, icon: "qoida" },
    { n: 10, topic: "ai2", dir: "10-robot-korishi", title: "Robot nimani koʻradi?", desc: "Rasm — kataklar va sonlar; tanish va belgilar", key: "robot-korishi:v1", stages: 3, icon: "koz" },
    { n: 11, topic: "ai2", dir: "11-kop-qatlamli-tarmoq", title: "Koʻp qatlamli tarmoq", desc: "Neyron, qatlamlar va chuqur oʻrganish", key: "kop-qatlamli-tarmoq:v1", stages: 3, icon: "tarmoq" },
    { n: 12, topic: "ai2", dir: "12-ai-xaritasi", title: "AI xaritasi", desc: "AI, ML, DL va koʻrish — farqlari va oʻrni", key: "ai-xaritasi:v1", stages: 3, icon: "xarita" },
  ];

  function h(tag, props, ...children) {
    const el = root.document.createElement(tag);
    for (const [key, value] of Object.entries(props || {})) {
      if (value === false || value == null) continue;
      if (key === "class") el.className = value;
      else if (key === "text") el.textContent = value;
      else if (key === "html") el.innerHTML = value;
      else el.setAttribute(key, value === true ? "" : value);
    }
    for (const child of children) if (child != null) el.append(child);
    return el;
  }

  // Tugagan bosqichlar soni; brauzer xotirasi o'qilmasa — 0 (sahifa baribir ishlaydi)
  const doneCount = (game) => root.QK.storage.create(game.key, game.stages).load().done.filter(Boolean).length;

  function card(game) {
    const done = doneCount(game);
    const dots = h("span", { class: "bosh-dots", "aria-label": `${done} bosqich tugagan` });
    for (let k = 0; k < game.stages; k++) dots.append(h("span", { class: "dot" + (k < done ? " on" : "") }));
    return h("a", { class: "bosh-card" + (done === game.stages ? " done" : ""), href: `oyinlar/${game.dir}/index.html` },
      h("span", { class: "bosh-icon", html: root.QK.boshArt.icon(game.icon) }),
      h("span", { class: "bosh-text" },
        h("span", { class: "bosh-name", text: `${game.n}. ${game.title}` }),
        h("span", { class: "bosh-desc", text: game.desc })),
      h("span", { class: "bosh-state" }, dots, h("span", { class: "bosh-age", text: AGE })));
  }

  function render() {
    root.document.getElementById("actor-elder").innerHTML = root.QK.art.elder();
    root.document.getElementById("actor-apprentice").innerHTML = root.QK.art.apprentice();
    const paper = root.document.querySelector("#actor-apprentice .paper");
    if (paper) paper.style.visibility = "hidden"; // bosh sahifada qog'oz kerak emas
    const list = root.document.getElementById("list");
    list.innerHTML = "";
    for (const section of SECTIONS) {
      const games = GAMES.filter((g) => g.topic === section.id);
      if (!games.length) continue;
      const cards = h("div", { class: "bosh-cards" });
      games.forEach((g) => cards.append(card(g)));
      list.append(h("section", { class: "bosh-section" },
        h("h2", { class: "bosh-h2", text: section.title }),
        h("p", { class: "bosh-note", text: section.note }),
        cards));
    }
  }

  root.QK = root.QK || {};
  root.QK.bosh = { AGE, SECTIONS, GAMES, render };
  if (root.document) render();
})(window);
