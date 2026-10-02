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
    // 2026-10-02: qiyinroq ta'riflar (lvl 1–2) va "oddiy dastur" (faqat tier 1+ da, 4-variant)
    { text: "Dasturchi har holat uchun qoidani oldindan yozib qoʻygan, mashina faqat bajaradi.", circle: "plain", key: "oldindan", lvl: 1 },
    { text: "Xato qilsa ham oʻzgarmaydi: ertaga ham xuddi shunday ishlaydi.", circle: "plain", key: "oʻzgarmaydi", lvl: 2 },
    { text: "Rasmdagi chiziq, burchak, koʻz-burunni qatlamlar ketma-ket oʻzi ajratadi.", circle: "dl", key: "qatlamlar", lvl: 1 },
    { text: "Yaxshi javob berganda mukofot olib, yomonida jarima olib oʻrganadi.", circle: "ml", key: "mukofot", lvl: 1 },
    { text: "Barcha yurishlarni qidirib chiqib, eng yaxshisini tanlaydi — lekin oʻrganmaydi.", circle: "ai", key: "qidirib", lvl: 2 },
    { text: "Belgilangan misollar (bu mushuk, bu it) koʻrsatilsa, yangisini oʻzi ajratadi.", circle: "ml", key: "misollar", lvl: 2 },
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
    { text: "Robot-changyutgich xonani aylanib chiqishi", task: "harakat", lvl: 1 },
    { text: "Zavoddagi qoʻl-robot detalni olib qoʻyishi", task: "harakat", lvl: 1 },
    { text: "Rentgen suratidan kasallikni topish", task: "korish", lvl: 1 },
    { text: "Kamerada avtomobil raqamini oʻqish", task: "korish", lvl: 1 },
    { text: "Matndan qisqa xulosa yozish", task: "til", lvl: 1 },
    { text: "Kino sharhi yaxshimi-yomonmi ekanini aniqlash", task: "til", lvl: 2 },
    { text: "Ob-havoni ertaga uchun bashorat qilish", task: "hisob", lvl: 2 },
    { text: "Telefon klaviaturasining keyingi soʻzni taklif qilishi", task: "til", lvl: 2 },
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
    { text: "Mikrotoʻlqinli pechning taymeri", zone: "plain", task: "hisob", why: "Vaqt tugasa oʻchadi — oddiy qoida.", lvl: 1 },
    { text: "Lift: chaqirilgan qavatga borish", zone: "plain", task: "harakat", why: "Tugma bosilsa — oʻsha qavat. Oʻrganmaydi, qidirmaydi.", lvl: 2 },
    { text: "Robot-changyutgich: devorga tegsa burilish", zone: "plain", task: "harakat", why: "«Tegsa — buril» degan bitta qoida. Harakat bor, lekin aql yoʻq.", lvl: 2 },
    { text: "Avtomatik eshik: odam kelsa ochiladi", zone: "plain", task: "harakat", why: "Datchik + qoida. Oʻzgarmaydi, oʻrganmaydi.", lvl: 2 },
    { text: "Sudoku yechadigan dastur (variantlarni sinab chiqadi)", zone: "ai", task: "hisob", why: "Aqlli jumboq, lekin qidirib yechadi — misoldan oʻrganmaydi.", lvl: 2 },
    { text: "Labirintdan chiqish yoʻlini topadigan robot", zone: "ai", task: "harakat", why: "Hamma yoʻllarni qidiradi — oʻrganish shart emas.", lvl: 1 },
    { text: "Bankda shubhali toʻlovni sezish", zone: "ml", task: "hisob", why: "Minglab oddiy va firibgar toʻlov misolidan oʻrganadi.", lvl: 1 },
    { text: "Videoxizmatning «keyingi video» tavsiyasi", zone: "ml", task: "hisob", why: "Nimani koʻrganing misolidan oʻrganadi.", lvl: 1 },
    { text: "Taksi narxini talabga qarab bashorat qilish", zone: "ml", task: "hisob", why: "Oldingi kunlar misolidan oʻrganadi.", lvl: 2 },
    { text: "Oʻzi yuradigan avtomobil", zone: "dl", task: "harakat", why: "Kamera rasmini koʻp qatlamli tarmoq tushunadi, keyin rul buriladi.", lvl: 1 },
    { text: "Onlayn tarjimon", zone: "dl", task: "til", why: "Millionlab gap juftligidan oʻrgangan koʻp qatlamli tarmoq.", lvl: 1 },
    { text: "Rasmdan qoʻlda yozilgan matnni oʻqish", zone: "dl", task: "korish", why: "Harf shakllarini qatlamlar oʻzi ajratadi.", lvl: 2 },
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
  const lvl = (item) => item.lvl || 0;

  // Qiyinlik zinasi (QOIDALAR §4.3): tier 0 — oddiy (lvl 0), tier 1 — hammasi, tier 2 — qiyinlar (lvl ≥ 1).
  // tier berilmasa (eski chaqiruv, musobaqa) — butun ro'yxat.
  function byTier(list, tier) {
    if (tier === undefined || tier === null) return list;
    const out = tier === 0 ? list.filter((x) => lvl(x) === 0) : tier >= 2 ? list.filter((x) => lvl(x) >= 1) : list;
    return out.length >= 2 ? out : list;
  }

  function makeFrom(list, type, answerOf, options, prev, rng, extra) {
    rng = rng || Math.random;
    for (;;) {
      const item = pick(list, rng);
      if (prev && prev.text === item.text) continue;
      return Object.assign({ type, text: item.text, answer: answerOf(item), options }, extra ? extra(item) : {});
    }
  }

  // Ta'rif: tier 0 da 3 doira (AI, ML, DL); tier 1+ da "Oddiy dastur" ham — 4 variant
  function makeDefTask(prev, rng, tier) {
    const tort = tier !== undefined && tier !== null && tier >= 1;
    const list = byTier(DEFS.filter((d) => tort || d.circle !== "plain"), tier);
    return makeFrom(list, "def", (d) => d.circle, tort ? ORDER.slice() : ["ai", "ml", "dl"], prev, rng, (d) => ({ key: d.key }));
  }
  const makeJobTask = (prev, rng, tier) => makeFrom(byTier(JOBS, tier), "job", (j) => j.task, TASKS.map((t) => t.id), prev, rng);
  const makeExampleTask = (prev, rng, tier) => makeFrom(byTier(EXAMPLES, tier), "example", (e) => e.zone, ORDER.slice(), prev, rng, (e) => ({ why: e.why, task: e.task }));

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
