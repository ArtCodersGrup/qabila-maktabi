// AI xaritasi — sof ma'lumot va topshiriqlar: zonalar, ta'riflar, vazifalar, real misollar.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  // Tashqaridan ichkariga: oddiy dastur ⊃ sun'iy intellekt ⊃ mashinali o'rganish ⊃ chuqur o'rganish
  const ZONES = [
    { id: "plain", name: "Oddiy dastur", short: "Dastur", def: "Qoidani bajaradi, aql talab qilmaydi." },
    { id: "ai", name: "Sunʼiy intellekt", short: "AI", def: "Aql talab qiladigan ishni bajaradi — qoida va qidiruv bilan ham, oʻrganib ham." },
    { id: "ml", name: "Mashinali oʻrganish", short: "ML", def: "Qoida yozilmaydi — misollardan oʻrganadi." },
    { id: "dl", name: "Chuqur oʻrganish", short: "DL", def: "Koʻp qatlamli neyron tarmoq bilan oʻrganadi." },
  ];
  const ORDER = ZONES.map((z) => z.id);

  // a zona b zonaning ichidami (o'zi ham hisoblanadi)
  const inside = (a, b) => ORDER.indexOf(a) >= ORDER.indexOf(b);

  // 1-bosqich: ta'rif → doira (kalit so'z matnda bor — maslahatda yoritiladi)
  const DEFS = [
    { text: "Qoida yozilmaydi — mashina misollardan oʻrganadi.", circle: "ml", key: "misollardan" },
    { text: "Koʻp misol koʻrib, xatosini kamaytirib boradi.", circle: "ml", key: "misol" },
    { text: "Koʻp qatlamli neyron tarmoq ishlatiladi.", circle: "dl", key: "qatlamli" },
    { text: "Tarmoq belgilarni qatlam-qatlam oʻzi topadi.", circle: "dl", key: "qatlam" },
    { text: "Mashina aql talab qiladigan ishni bajaradi — oʻrganmasa ham, qidirib topsa ham.", circle: "ai", key: "aql" },
    { text: "Eng katta doira: hamma aqlli dasturlar shu yerda.", circle: "ai", key: "katta" },
  ];

  const TASKS = [
    { id: "korish", name: "koʻrish" },
    { id: "til", name: "til" },
    { id: "harakat", name: "harakat" },
    { id: "hisob", name: "hisob" },
  ];

  // 2-bosqich: ish → vazifa turi
  const JOBS = [
    { text: "Rasmdan yuzni tanish", task: "korish" },
    { text: "Yoʻl belgisini oʻqish", task: "korish" },
    { text: "Qoʻlda yozilgan raqamni oʻqish", task: "korish" },
    { text: "Gapni boshqa tilga tarjima qilish", task: "til" },
    { text: "Savolga chatbot javob yozishi", task: "til" },
    { text: "Ovozni matnga aylantirish", task: "til" },
    { text: "Robotning yurishi", task: "harakat" },
    { text: "Oʻzi yuradigan mashinaning rulni burishi", task: "harakat" },
    { text: "Dronning muvozanat saqlab uchishi", task: "harakat" },
    { text: "Xaridlar narxini qoʻshish", task: "hisob" },
    { text: "Eng qisqa yoʻlni topish", task: "hisob" },
    { text: "Shaxmatda yurishlarni sanab chiqish", task: "hisob" },
  ];

  // 3-bosqich: real misol → xaritadagi joyi
  const EXAMPLES = [
    { text: "Kalkulyator", zone: "plain", task: "hisob", why: "Qoidani bajaradi xolos — aql ham, oʻrganish ham kerak emas." },
    { text: "Budilnik", zone: "plain", task: "hisob", why: "Soat kelsa jiringlaydi — oddiy qoida." },
    { text: "Svetofor taymeri", zone: "plain", task: "hisob", why: "Vaqt boʻyicha rang almashadi — oddiy qoida." },
    { text: "Shaxmat dasturi (yurishlarni sanab chiqadi)", zone: "ai", task: "hisob", why: "Aqlli ish, lekin oʻrganmaydi — yurishlarni qidirib, eng yaxshisini tanlaydi." },
    { text: "Navigator: eng qisqa yoʻlni topish", zone: "ai", task: "hisob", why: "Yoʻllarni qidirib, eng qisqasini topadi — oʻrganmasdan." },
    { text: "Oʻyindagi qoidali raqib-bot", zone: "ai", task: "hisob", why: "Oʻyinchini qoidalar bilan taqlid qiladi — oʻrganmaydi." },
    { text: "Spam xatlarni ajratish", zone: "ml", task: "til", why: "Minglab xat misolidan spamni tanishni oʻrganadi." },
    { text: "Doʻkondagi «sizga yoqishi mumkin» tavsiyalari", zone: "ml", task: "hisob", why: "Odamlarning xaridlari misolidan oʻrganadi." },
    { text: "Uy narxini oʻxshash uylarga qarab bashorat qilish", zone: "ml", task: "hisob", why: "Sotilgan uylar misolidan oʻrganadi." },
    { text: "Telefonning yuzni tanishi", zone: "dl", task: "korish", why: "Koʻp qatlamli tarmoq rasm belgilarini oʻzi topadi." },
    { text: "Chatbot", zone: "dl", task: "til", why: "Milliardlab ogʻirlikli koʻp qatlamli tarmoq." },
    { text: "Ovozni matnga aylantiruvchi dastur", zone: "dl", task: "til", why: "Ovoz belgilarini koʻp qatlamli tarmoq topadi." },
    { text: "Rasm chizadigan dastur", zone: "dl", task: "korish", why: "Juda chuqur neyron tarmoq rasm yasaydi." },
  ];

  // 6–11-o'yinlar xaritada
  const GAMES = [
    { n: 6, title: "Robotni oʻrgatamiz", zone: "ml", note: "misollardan oʻrgandi" },
    { n: 7, title: "Keyingi soʻz", zone: "ml", note: "soʻz juftliklarini sanab oʻrgandi" },
    { n: 8, title: "Sehrli qutilar", zone: "ml", note: "mukofot bilan oʻrgandi" },
    { n: 9, title: "Qoida yoki misol?", zone: "ml", note: "qoida — oddiy dastur, misol — ML" },
    { n: 10, title: "Robot nimani koʻradi?", zone: "ai", note: "shablon bilan solishtirdi — oʻrganmadi" },
    { n: 11, title: "Koʻp qatlamli tarmoq", zone: "dl", note: "neyronlar qatlam-qatlam oʻrgandi" },
  ];

  const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

  function makeFrom(list, type, answerOf, options, prev, rng, extra) {
    rng = rng || Math.random;
    for (;;) {
      const item = pick(list, rng);
      if (prev && prev.text === item.text) continue;
      return Object.assign({ type, text: item.text, answer: answerOf(item), options }, extra ? extra(item) : {});
    }
  }

  const makeDefTask = (prev, rng) => makeFrom(DEFS, "def", (d) => d.circle, ["ai", "ml", "dl"], prev, rng, (d) => ({ key: d.key }));
  const makeJobTask = (prev, rng) => makeFrom(JOBS, "job", (j) => j.task, TASKS.map((t) => t.id), prev, rng);
  const makeExampleTask = (prev, rng) => makeFrom(EXAMPLES, "example", (e) => e.zone, ORDER.slice(), prev, rng, (e) => ({ why: e.why, task: e.task }));

  const zoneName = (id) => (ZONES.find((z) => z.id === id) || {}).name;
  const taskName = (id) => (TASKS.find((t) => t.id === id) || {}).name;

  const api = {
    ZONES, ORDER, DEFS, TASKS, JOBS, EXAMPLES, GAMES,
    inside, zoneName, taskName, makeDefTask, makeJobTask, makeExampleTask,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.atlas = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
