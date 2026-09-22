// Bosh sahifa: o'yinlar ro'yxati mavzular bo'yicha, har birida tugagan bosqichlar.
// YANGI O'YIN QO'SHILGANDA shu fayldagi GAMES ro'yxatiga qo'shiladi (bosh/tests/bosh.test.js tekshiradi).
// n — papka raqami (o'zgarmaydi); bosh sahifadagi raqam — number(game), bo'limlar tartibidagi o'rni.
// pc: true — o'yinga haqiqiy klaviatura kerak (kartada 💻 belgisi).
(function (root) {
  "use strict";

  const AGE = "8–12"; // o'yinning o'z yoshi bo'lsa (game.age) — o'sha ko'rsatiladi

  // Bo'limlar tartibi — o'rganish yo'li: osondan qiyinga, oldingi o'yinga tayanadiganlari keyin
  // (masalan, 25-papka 11- va 20-papkalarga tayanadi). Kartadagi raqam — shu tartibdagi o'rni (number).
  const SECTIONS = [
    { id: "klaviatura", title: "Klaviatura", note: "Tez va toʻgʻri yozishni oʻrganamiz" },
    { id: "kod", title: "Kodlash va shifrlash", note: "Maʼlumotni belgilarga aylantiramiz" },
    { id: "ikkilik", title: "Ikkilik kod", note: "Kompyuter tili: yoniq va oʻchiq" },
    { id: "olchov", title: "Axborot oʻlchovi", note: "Bit, bayt va fayllar hajmi" },
    { id: "ai", title: "Sunʼiy intellekt: qanday oʻrganadi", note: "Misol, soʻz va mukofot bilan" },
    { id: "ai2", title: "Koʻrish, tarmoqlar va xarita", note: "Rasm, neyronlar va AI turlari" },
    { id: "sanoq", title: "Sanoq tizimlari", note: "Sonlarni yozishning har xil usullari" },
    { id: "mantiq", title: "Mantiq", note: "Rost va yolgʻon: VA, YOKI, EMAS" },
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
    { n: 13, topic: "olchov", dir: "13-bayt-sandigi", title: "Bayt sandigʻi", desc: "Nega 8 bit — 1 bayt; matn va kilobayt", key: "bayt-sandigi:v1", stages: 3, icon: "sandiq" },
    { n: 14, topic: "olchov", dir: "14-piksel-ustaxonasi", title: "Piksel ustaxonasi", desc: "Rasm necha bayt: piksel, rang va megabayt", key: "piksel-ustaxonasi:v1", stages: 3, icon: "piksel" },
    { n: 15, topic: "olchov", dir: "15-multfilm-daftari", title: "Multfilm daftari", desc: "Video: kadrlar, gigabayt va siqish", key: "multfilm-daftari:v1", stages: 3, icon: "kadr" },
    { n: 16, topic: "olchov", dir: "16-xotira-ombori", title: "Xotira ombori", desc: "Bitdan terabaytgacha: solishtirish va nechta sigʻadi", key: "xotira-ombori:v1", stages: 3, icon: "ombor" },
    { n: 17, topic: "sanoq", dir: "17-qabila-choti", title: "Qabila choʻti", desc: "Asos, raqamlar va xona qiymatlari", key: "qabila-choti:v1", stages: 3, icon: "choti", age: "10–12" },
    { n: 18, topic: "sanoq", dir: "18-tangalar-bozori", title: "Tangalar bozori", desc: "Istalgan tizimdan oʻnlikka: raqam × xona qiymati", key: "tangalar-bozori:v1", stages: 3, icon: "tanga", age: "10–12" },
    { n: 19, topic: "sanoq", dir: "19-qoplarga-joylash", title: "Qoplarga joylash", desc: "Oʻnlikdan istalgan tizimga: boʻlib-boʻlib", key: "qoplarga-joylash:v1", stages: 3, icon: "qop", age: "10–12" },
    { n: 20, topic: "sanoq", dir: "20-ikkilik-hisobchi", title: "Ikkilik hisobchi", desc: "Ikkilikda qoʻshish, ayirish va koʻpaytirish", key: "ikkilik-hisobchi:v1", stages: 3, icon: "hisob2", age: "10–12" },
    { n: 21, topic: "sanoq", dir: "21-on-oltilik-ranglar", title: "Oʻn oltilik ranglar", desc: "A–F, 2 ↔ 16, rang kodlari va amallar", key: "on-oltilik-ranglar:v1", stages: 3, icon: "rang16", age: "10–12" },
    { n: 22, topic: "sanoq", dir: "22-sayyoralar-sanogi", title: "Sayyoralar sanogʻi", desc: "n-lik tizimda amallar va jumboqlar", key: "sayyoralar-sanogi:v1", stages: 3, icon: "sayyora", age: "10–12" },
    { n: 23, topic: "klaviatura", dir: "23-on-barmoq", title: "Oʻn barmoq", desc: "Klaviaturaga qaramay tez va toʻgʻri yozish", key: "on-barmoq:v1", stages: 3, icon: "klaviatura", pc: true },
    { n: 24, topic: "mantiq", dir: "24-mantiq-kalitlari", title: "Mantiq kalitlari", desc: "Kalitlar va chiroq: VA, YOKI, EMAS", key: "mantiq-kalitlari:v1", stages: 3, icon: "mantiq" },
    { n: 25, topic: "mantiq", dir: "25-zinapoya-chirogi", title: "Zinapoya chirogʻi", desc: "Faqat bittasi (XOR), sxemalar va kompyuter qanday qoʻshadi", key: "zinapoya-chirogi:v1", stages: 3, icon: "zinapoya", age: "10–12" },
  ];

  // Musobaqalar — o'yin emas (bosqichi yo'q), ro'yxat tepasida alohida bo'lim: savol-javob va tez yozish poygasi
  const CONTESTS = [
    { dir: "musobaqa", title: "Savol-javob", desc: "Ikki kishi bitta ekranda: savollar, soat va 3 ta yurak", icon: "musobaqa" },
    { dir: "poyga", title: "Tez yozish poygasi", desc: "Navbat bilan bir xil matnni yozasizlar: kim aniq va tez?", icon: "poyga", pc: true },
  ];

  // O'yinning bosh sahifadagi tartib raqami (1, 2, 3 …) — bo'limlar tartibida
  const ORDER = SECTIONS.flatMap((sec) => GAMES.filter((g) => g.topic === sec.id));
  const number = (game) => ORDER.indexOf(game) + 1;

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
        h("span", { class: "bosh-name", text: `${number(game)}. ${game.title}` }),
        h("span", { class: "bosh-desc", text: game.desc })),
      h("span", { class: "bosh-state" }, dots, h("span", { class: "bosh-age", text: game.age || AGE }),
        game.pc ? h("span", { class: "bosh-pc", title: "Klaviatura kerak", "aria-label": "Klaviatura kerak", text: "💻" }) : null));
  }

  function render() {
    root.document.getElementById("actor-elder").innerHTML = root.QK.art.elder();
    root.document.getElementById("actor-apprentice").innerHTML = root.QK.art.apprentice();
    const paper = root.document.querySelector("#actor-apprentice .paper");
    if (paper) paper.style.visibility = "hidden"; // bosh sahifada qog'oz kerak emas
    const list = root.document.getElementById("list");
    list.innerHTML = "";
    const contests = h("div", { class: "bosh-cards" });
    CONTESTS.forEach((c) => contests.append(
      h("a", { class: "bosh-card bosh-contest", href: `oyinlar/${c.dir}/index.html` },
        h("span", { class: "bosh-icon", html: root.QK.boshArt.icon(c.icon) }),
        h("span", { class: "bosh-text" },
          h("span", { class: "bosh-name", text: c.title }),
          h("span", { class: "bosh-desc", text: c.desc })),
        h("span", { class: "bosh-state" }, h("span", { class: "bosh-age", text: "2 kishi" }),
          c.pc ? h("span", { class: "bosh-pc", title: "Klaviatura kerak", "aria-label": "Klaviatura kerak", text: "💻" }) : null))));
    list.append(h("section", { class: "bosh-section" },
      h("h2", { class: "bosh-h2", text: "Musobaqalar" }),
      h("p", { class: "bosh-note", text: "Oʻrganganingni doʻsting bilan sinab koʻr" }),
      contests));
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
  root.QK.bosh = { AGE, SECTIONS, GAMES, CONTESTS, number, render };
  if (root.document) render();
})(window);
