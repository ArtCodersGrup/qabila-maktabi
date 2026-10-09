// Bosh sahifa: o'yinlar ro'yxati mavzular bo'yicha, har birida tugagan bosqichlar.
// YANGI O'YIN QO'SHILGANDA shu fayldagi GAMES ro'yxatiga qo'shiladi (bosh/tests/bosh.test.js tekshiradi).
// n — papka raqami (o'zgarmaydi); kartadagi raqam — number(game, toifa), TANLANGAN TOIFA ichidagi o'rni.
// toifa — o'yin qaysi sinf guruhiga tegishli: boshlangich (1–4), orta (5–8), yuqori (9–11).
// Har o'yin AYNAN BITTA toifada. Asbob va musobaqalarda toifalar: [...] — ular bir nechtasida ko'rinadi.
// O'yin toifasi o'zgarsa yoki yangi o'yin qo'shilsa: node bosh/tools/toifa-yoz.js (sahifadagi data-toifa ni yozadi).
// pc: true — o'yinga kompyuter kerak: haqiqiy klaviatura yoki sichqoncha (kartada 💻 belgisi).
(function (root) {
  "use strict";

  // O'quvchi kirishda sinfini tanlaydi; "hammasi" — o'qituvchi uchun (hech narsa yashirilmaydi).
  // id lar umumiy/js/toifa.js dagi IDS bilan bir xil. sarlavha — bosh sahifa tepasidagi nom.
  const TOIFALAR = [
    { id: "boshlangich", title: "1–4-sinf", qisqa: "1–4", sarlavha: "Qabila maktabi", note: "Klaviatura, robotga buyruq va sirli xabarlar" },
    // tartib — shu toifadagi o'rganish yo'li (muallif 2026-10-07): axborotni belgilashdan boshlab, kod yozish oxirida.
    // Berilmasa — SECTIONS tartibi. Ro'yxatda yo'q bo'lim (masalan "klaviatura") — SECTIONS dagi joyida, oxirida.
    { id: "orta", title: "5–8-sinf", qisqa: "5–8", sarlavha: "5–8-sinf informatikasi", note: "Kod, sonlar, internet, sunʼiy intellekt va Python",
      tartib: ["kod", "ikkilik", "olchov", "mantiq", "internet", "xavfsizlik", "ai", "ai2", "dastur", "python", "algoritm"] },
    { id: "yuqori", title: "9–11-sinf", qisqa: "9–11", sarlavha: "Olimpiada dasturlash", note: "Algoritmlar, kombinatorika, C++ va masalalar" },
    { id: "hammasi", title: "Hammasi", qisqa: "hammasi", sarlavha: "Qabila maktabi", note: "Oʻqituvchi uchun — barcha oʻyinlar" },
  ];

  // Bo'limlar tartibi — o'rganish yo'li: osondan qiyinga, oldingi o'yinga tayanadiganlari keyin
  // (masalan, 25-papka 11- va 20-papkalarga tayanadi). Kartadagi raqam — shu tartibdagi o'rni (number).
  const SECTIONS = [
    { id: "tanishuv", title: "Kompyuter bilan tanishuv", note: "Qismlar, sichqoncha, oynalar, fayl, rasm, matn va sayt" },
    { id: "klaviatura", title: "Klaviatura", note: "Tez va toʻgʻri yozishni oʻrganamiz" },
    { id: "dastur", title: "Algoritm va dasturlash", note: "Robotga buyruq beramiz: yoʻl va tartib" },
    { id: "python", title: "Python: dasturlash", note: "Haqiqiy kod yozamiz: printdan funksiyagacha" },
    { id: "algoritm", title: "Algoritmlar va samaradorlik", note: "Qaysi yechim tezroq va nega" },
    { id: "kombinatorika", title: "Kombinatorika", note: "Sanashni oʻrganamiz: nechta variant bor" },
    { id: "cpp", title: "C++ va olimpiada", note: "Olimpiada tili: qolip, tur va tezlik" },
    { id: "internet", title: "Internet qanday ishlaydi", note: "Xabar qanday yetib boradi: paket, manzil, yoʻl va qulf" },
    { id: "xavfsizlik", title: "Parol va xavfsizlik", note: "Parolingni kim va qancha vaqtda topadi" },
    { id: "kod", title: "Kodlash va shifrlash", note: "Maʼlumotni belgilarga aylantiramiz" },
    { id: "ikkilik", title: "Sonlar va ikkilik kod", note: "Yoniq-oʻchiq, xona qiymatlari va har xil sanoq tizimlari" },
    { id: "olchov", title: "Axborot oʻlchovi", note: "Bit, bayt va fayllar hajmi" },
    { id: "ai", title: "Sunʼiy intellekt: qanday oʻrganadi", note: "Misol, soʻz va mukofot bilan" },
    { id: "ai2", title: "Koʻrish, tarmoqlar va xarita", note: "Rasm, neyronlar va AI turlari" },
    { id: "mantiq", title: "Mantiq", note: "Rost va yolgʻon: VA, YOKI, EMAS" },
  ];

  const GAMES = [
    { n: 1, topic: "kod", dir: "01-qabila-kodlari", title: "Qabila kodlari", desc: "Nechta belgidan nechta soʻz yasaladi?", key: "qabila-kodlari:v1", stages: 3, toifa: "orta", icon: "kodlar" },
    { n: 2, topic: "kod", dir: "02-qabila-morzesi", title: "Qabila Morzesi", desc: "Nuqta va chiziq bilan xabar yuborish", key: "qabila-morzesi:v1", stages: 3, toifa: "boshlangich", icon: "morze" },
    { n: 3, topic: "kod", dir: "03-sezar-maktubi", title: "Sezar maktubi", desc: "Harflarni surib yozilgan sirli xat", key: "sezar-maktubi:v1", stages: 3, toifa: "orta", icon: "sezar" },
    { n: 4, topic: "ikkilik", dir: "04-qabila-chiroqlari", title: "Qabila chiroqlari", desc: "Chiroqlar, bitlar va ikkilik sonlar", key: "qabila-chiroqlari:v1", stages: 3, toifa: "orta", icon: "chiroq" },
    { n: 5, topic: "ikkilik", dir: "05-rim-toshi", title: "Rim toshi", desc: "Rim raqamlari va pozitsion tizim", key: "rim-toshi:v1", stages: 3, toifa: "orta", icon: "rim" },
    { n: 6, topic: "ai", dir: "06-robotni-orgatamiz", title: "Robotni oʻrgatamiz", desc: "Mashina misollardan qanday oʻrganadi", key: "robotni-orgatamiz:v1", stages: 3, toifa: "orta", icon: "robot" },
    { n: 7, topic: "ai", dir: "07-keyingi-soz", title: "Keyingi soʻz", desc: "Chatbot keyingi soʻzni qanday tanlaydi", key: "keyingi-soz:v1", stages: 3, toifa: "orta", icon: "gap" },
    { n: 8, topic: "ai", dir: "08-sehrli-qutilar", title: "Sehrli qutilar", desc: "Robot oʻynab, mukofot bilan oʻrganadi", key: "sehrli-qutilar:v1", stages: 3, toifa: "orta", icon: "qutilar" },
    { n: 9, topic: "ai", dir: "09-qoida-yoki-misol", title: "Qoida yoki misol?", desc: "Qachon qoida yozamiz, qachon misol koʻrsatamiz", key: "qoida-yoki-misol:v1", stages: 3, toifa: "orta", icon: "qoida" },
    { n: 10, topic: "ai2", dir: "10-robot-korishi", title: "Robot nimani koʻradi?", desc: "Rasm — kataklar va sonlar; tanish va belgilar", key: "robot-korishi:v1", stages: 3, toifa: "orta", icon: "koz" },
    { n: 11, topic: "ai2", dir: "11-kop-qatlamli-tarmoq", title: "Koʻp qatlamli tarmoq", desc: "Neyron, qatlamlar va chuqur oʻrganish", key: "kop-qatlamli-tarmoq:v1", stages: 3, toifa: "orta", icon: "tarmoq" },
    { n: 12, topic: "ai2", dir: "12-ai-xaritasi", title: "AI xaritasi", desc: "AI, ML, DL va koʻrish — farqlari va oʻrni", key: "ai-xaritasi:v1", stages: 3, toifa: "orta", icon: "xarita" },
    { n: 13, topic: "olchov", dir: "13-bayt-sandigi", title: "Bayt sandigʻi", desc: "Nega 8 bit — 1 bayt; matn va kilobayt", key: "bayt-sandigi:v1", stages: 3, toifa: "orta", icon: "sandiq" },
    { n: 14, topic: "olchov", dir: "14-piksel-ustaxonasi", title: "Piksel ustaxonasi", desc: "Rasm necha bayt: piksel, rang va megabayt", key: "piksel-ustaxonasi:v1", stages: 3, toifa: "orta", icon: "piksel" },
    { n: 15, topic: "olchov", dir: "15-multfilm-daftari", title: "Multfilm daftari", desc: "Video: kadrlar, gigabayt va siqish", key: "multfilm-daftari:v1", stages: 3, toifa: "orta", icon: "kadr" },
    { n: 16, topic: "olchov", dir: "16-xotira-ombori", title: "Xotira ombori", desc: "Bitdan terabaytgacha: solishtirish va nechta sigʻadi", key: "xotira-ombori:v1", stages: 3, toifa: "orta", icon: "ombor" },
    { n: 17, topic: "ikkilik", dir: "17-qabila-choti", title: "Qabila choʻti", desc: "Asos, raqamlar va xona qiymatlari", key: "qabila-choti:v1", stages: 3, toifa: "orta", icon: "choti" },
    { n: 18, topic: "ikkilik", dir: "18-tangalar-bozori", title: "Tangalar bozori", desc: "Istalgan tizimdan oʻnlikka: raqam × xona qiymati", key: "tangalar-bozori:v1", stages: 3, toifa: "orta", icon: "tanga" },
    { n: 19, topic: "ikkilik", dir: "19-qoplarga-joylash", title: "Qoplarga joylash", desc: "Oʻnlikdan istalgan tizimga: boʻlib-boʻlib", key: "qoplarga-joylash:v1", stages: 3, toifa: "orta", icon: "qop" },
    { n: 20, topic: "ikkilik", dir: "20-ikkilik-hisobchi", title: "Ikkilik hisobchi", desc: "Ikkilikda qoʻshish, ayirish va koʻpaytirish", key: "ikkilik-hisobchi:v1", stages: 3, toifa: "orta", icon: "hisob2" },
    { n: 21, topic: "ikkilik", dir: "21-on-oltilik-ranglar", title: "Oʻn oltilik ranglar", desc: "A–F, 2 ↔ 16, rang kodlari va amallar", key: "on-oltilik-ranglar:v1", stages: 3, toifa: "orta", icon: "rang16" },
    { n: 22, topic: "ikkilik", dir: "22-sayyoralar-sanogi", title: "Sayyoralar sanogʻi", desc: "n-lik tizimda amallar va jumboqlar", key: "sayyoralar-sanogi:v1", stages: 3, toifa: "orta", icon: "sayyora" },
    { n: 23, topic: "klaviatura", dir: "23-on-barmoq", title: "Oʻn barmoq", desc: "Klaviaturaga qaramay tez va toʻgʻri yozish", key: "on-barmoq:v1", stages: 3, toifa: "boshlangich", icon: "klaviatura", pc: true },
    { n: 46, topic: "klaviatura", dir: "46-tezkor-tugmalar", title: "Tezkor tugmalar", desc: "Ctrl + C, V, Z va boshqalar: sichqonchasiz ishlash", key: "tezkor-tugmalar:v1", stages: 3, toifa: "boshlangich", icon: "tezkor", pc: true },
    { n: 24, topic: "mantiq", dir: "24-mantiq-kalitlari", title: "Mantiq kalitlari", desc: "Kalitlar va chiroq: VA, YOKI, EMAS", key: "mantiq-kalitlari:v1", stages: 3, toifa: "orta", icon: "mantiq" },
    { n: 25, topic: "mantiq", dir: "25-zinapoya-chirogi", title: "Zinapoya chirogʻi", desc: "Faqat bittasi (XOR), sxemalar va kompyuter qanday qoʻshadi", key: "zinapoya-chirogi:v1", stages: 3, toifa: "orta", icon: "zinapoya" },
    { n: 48, topic: "mantiq", dir: "48-mantiq-kodda", title: "Mantiq kodda", desc: "True va False, and / or / not, shart yozish", key: "mantiq-kodda:v1", stages: 3, toifa: "orta", icon: "mantiqkod", pc: true },
    { n: 26, topic: "dastur", dir: "26-robot-yoli", title: "Robot yoʻli", desc: "Robotga buyruq beramiz: algoritm va tartib", key: "robot-yoli:v1", stages: 3, toifa: "boshlangich", icon: "yol" },
    { n: 47, topic: "dastur", dir: "47-robot-aqlli", title: "Robot aqlli boʻldi", desc: "Takror va agar: bitta dastur har xil maydonda ishlaydi", key: "robot-aqlli:v1", stages: 3, toifa: "boshlangich", icon: "robotaql" },
    { n: 53, topic: "dastur", dir: "53-xato-ovi", title: "Xato ovi", desc: "Tayyor dasturdagi xatoni topish va tuzatish", key: "xato-ovi:v1", stages: 3, toifa: "boshlangich", icon: "xatoovi" },
    { n: 62, topic: "dastur", dir: "62-oz-buyrugim", title: "Oʻz buyrugʻim", desc: "★ — oʻzing yasagan buyruq: bir marta yozasan, koʻp marta chaqirasan", key: "oz-buyrugim:v1", stages: 3, toifa: "boshlangich", icon: "yulduzbuy" },
    { n: 63, topic: "dastur", dir: "63-tosiqqacha", title: "Toʻsiqqacha", desc: "Boʻsh ekan takrorla: nechta marta ekanini robot oʻzi topadi", key: "tosiqqacha:v1", stages: 3, toifa: "boshlangich", icon: "tosiqqacha" },
    { n: 64, topic: "dastur", dir: "64-robot-sanaydi", title: "Robot sanaydi", desc: "Hisoblagich: robot qadamlarini sanaydi va sonni eslab qoladi", key: "robot-sanaydi:v1", stages: 3, toifa: "boshlangich", icon: "sanoq" },
    { n: 65, topic: "dastur", dir: "65-blokdan-pythonga", title: "Bloklardan Pythonga", desc: "Bir dastur — ikki yozuv: bloklar va Python matni", key: "blokdan-pythonga:v1", stages: 3, toifa: "orta", icon: "blokpy" },
    { n: 27, topic: "python", dir: "27-birinchi-buyruq", title: "Birinchi buyruq", desc: "print: birinchi kod, qoʻshtirnoq va xato xabari", key: "birinchi-buyruq:v1", stages: 3, toifa: "orta", icon: "buyruq", pc: true },
    { n: 28, topic: "python", dir: "28-sonlar-ustaxonasi", title: "Sonlar ustaxonasi", desc: "// va %, amallar tartibi, daraja", key: "sonlar-ustaxonasi:v1", stages: 3, toifa: "orta", icon: "bolish", pc: true },
    { n: 29, topic: "python", dir: "29-nomli-qutilar", title: "Nomli qutilar", desc: "Oʻzgaruvchi, kuzatuv jadvali, input() va turlar", key: "nomli-qutilar:v1", stages: 3, toifa: "orta", icon: "qutilar2", pc: true },
    { n: 30, topic: "python", dir: "30-ikki-yol", title: "Ikki yoʻl", desc: "Shart: if, elif, else, otstup va mantiq", key: "ikki-yol:v1", stages: 3, toifa: "orta", icon: "ayri", pc: true },
    { n: 31, topic: "python", dir: "31-takror-charxi", title: "Takror charxi", desc: "while sikli, yigʻindi va raqamlarni ajratish", key: "takror-charxi:v1", stages: 3, toifa: "orta", icon: "charx", pc: true },
    { n: 32, topic: "python", dir: "32-sanoqli-takror", title: "Sanoqli takror", desc: "for va range, chegaralar, ichma-ich sikl", key: "sanoqli-takror:v1", stages: 3, toifa: "orta", icon: "zina", pc: true },
    { n: 33, topic: "python", dir: "33-royxat-va-satr", title: "Roʻyxat va satr", desc: "Indeks, len, append, kesish va split", key: "royxat-va-satr:v1", stages: 3, toifa: "orta", icon: "qator", pc: true },
    { n: 34, topic: "python", dir: "34-funksiya-ustaxonasi", title: "Funksiya ustaxonasi", desc: "def, parametr, return va masalani boʻlaklash", key: "funksiya-ustaxonasi:v1", stages: 3, toifa: "orta", icon: "dastgoh", pc: true },
    { n: 49, topic: "python", dir: "49-tank", title: "Tank jangi", desc: "Tankni Python buyruqlari bilan boshqar: move, scan, fire", key: "tank-jangi:v1", stages: 3, toifa: "orta", icon: "tank", pc: true },
    { n: 36, topic: "algoritm", dir: "36-algoritm-xossalari", title: "Algoritm va xossalari", desc: "Beshta xossa va “ishlaydi ≠ yaxshi”", key: "algoritm-xossalari:v1", stages: 3, toifa: "orta", icon: "ikkiyol", pc: true },
    { n: 37, topic: "algoritm", dir: "37-blok-sxema", title: "Blok-sxema", desc: "Algoritmni chizish: belgilar, yigʻish va oʻqish", key: "blok-sxema:v1", stages: 3, toifa: "orta", icon: "sxema", pc: true },
    { n: 38, topic: "algoritm", dir: "38-izlash", title: "Izlash", desc: "Chiziqli va ikkilik izlash: 100 ta sondan 7 savolda", key: "izlash:v1", stages: 3, toifa: "yuqori", icon: "lupa", pc: true },
    { n: 39, topic: "algoritm", dir: "39-saralash", title: "Saralash", desc: "Pufakcha va tanlash: koʻz bilan koʻrinadigan almashinuv", key: "saralash:v1", stages: 3, toifa: "yuqori", icon: "saralash", pc: true },
    { n: 40, topic: "algoritm", dir: "40-qadamlar-soni", title: "Qadamlar soni", desc: "Oʻsishga nom beramiz: O(1), O(log n), O(n), O(n²)", key: "qadamlar-soni:v1", stages: 3, toifa: "yuqori", icon: "osish", pc: true },
    { n: 41, topic: "kombinatorika", dir: "41-tanlov-daraxti", title: "Tanlov daraxti", desc: "Koʻpaytirish va qoʻshish qoidasi: VA — ×, YOKI — +", key: "tanlov-daraxti:v1", stages: 3, toifa: "yuqori", icon: "daraxt", pc: true },
    { n: 42, topic: "kombinatorika", dir: "42-qatorga-terish", title: "Qatorga terish", desc: "Faktorial n! va A(n,k): tartib muhim boʻlgan sanash", key: "qatorga-terish:v1", stages: 3, toifa: "yuqori", icon: "qator3", pc: true },
    { n: 43, topic: "kombinatorika", dir: "43-jamoa-tanlash", title: "Jamoa tanlash", desc: "C(n,k): tartib muhim emas — takrorni topib, k! ga boʻlamiz", key: "jamoa-tanlash:v1", stages: 3, toifa: "yuqori", icon: "jamoa", pc: true },
    { n: 44, topic: "kombinatorika", dir: "44-paskal-uchburchagi", title: "Paskal uchburchagi", desc: "C(n,k) ni faqat qoʻshish bilan topish; qator yigʻindisi 2ⁿ", key: "paskal-uchburchagi:v1", stages: 3, toifa: "yuqori", icon: "paskal", pc: true },
    { n: 45, topic: "kombinatorika", dir: "45-kaptarxona", title: "Kaptarxona", desc: "Dirixle printsipi: sanamasdan isbotlash", key: "kaptarxona:v1", stages: 3, toifa: "yuqori", icon: "kaptar", pc: true },
    { n: 54, topic: "cpp", dir: "54-cpp-birinchi-dastur", title: "C++: birinchi dastur", desc: "Qolip, cout va cin: Pythondan farqi", key: "cpp-birinchi-dastur:v1", stages: 3, toifa: "yuqori", icon: "cpp", pc: true },
    { n: 55, topic: "cpp", dir: "55-cpp-tur-chegara", title: "C++: tur va chegara", desc: "int toshib ketadi, long long sigʻdiradi", key: "cpp-tur-chegara:v1", stages: 3, toifa: "yuqori", icon: "cpptur", pc: true },
    { n: 56, topic: "cpp", dir: "56-cpp-qavs-takror", title: "C++: qavs va takror", desc: "Blokni { } yasaydi, sikl uch qismdan iborat", key: "cpp-qavs-takror:v1", stages: 3, toifa: "yuqori", icon: "cppsikl", pc: true },
    { n: 57, topic: "cpp", dir: "57-cpp-massiv-saralash", title: "C++: massiv va saralash", desc: "Massiv, satr va tayyor sort", key: "cpp-massiv-saralash:v1", stages: 3, toifa: "yuqori", icon: "cppmassiv", pc: true },
    { n: 58, topic: "internet", dir: "58-xabar-bolaklari", title: "Xabar boʻlaklari", desc: "Xat raqamlangan konvertlarga boʻlinib yetib boradi", key: "xabar-bolaklari:v1", stages: 3, toifa: "orta", icon: "bolaklar" },
    { n: 59, topic: "internet", dir: "59-qabila-manzillari", title: "Qabila manzillari", desc: "IP manzil, nom daftari (DNS) va javondagi nusxa (kesh)", key: "qabila-manzillari:v1", stages: 3, toifa: "orta", icon: "manzil" },
    { n: 60, topic: "internet", dir: "60-paket-yoli", title: "Paket yoʻli", desc: "Tugundan tugunga: yoʻl, uzilgan sim va server", key: "paket-yoli:v1", stages: 3, toifa: "orta", icon: "tugunlar" },
    { n: 61, topic: "internet", dir: "61-qulfli-yol", title: "Qulfli yoʻl", desc: "Qulf (HTTPS) nimani himoyalaydi va firibgar saytni tanish", key: "qulfli-yol:v1", stages: 3, toifa: "orta", icon: "yolqulf" },
    { n: 50, topic: "xavfsizlik", dir: "50-parol-kuchi", title: "Parol kuchi", desc: "Nechta variant bor va kompyuter qancha vaqtda topadi", key: "parol-kuchi:v1", stages: 3, toifa: "orta", icon: "qulf" },
    { n: 51, topic: "xavfsizlik", dir: "51-bir-tomonlama-qulf", title: "Bir tomonlama qulf", desc: "Sayt parolni emas, uning izini saqlaydi", key: "bir-tomonlama-qulf:v1", stages: 3, toifa: "orta", icon: "izqulf" },
    { n: 52, topic: "xavfsizlik", dir: "52-firibgar-xat", title: "Firibgar xat", desc: "Soxta xatni belgilaridan va manzilidan tanish", key: "firibgar-xat:v1", stages: 3, toifa: "orta", icon: "qarmoq" },
    { n: 66, topic: "tanishuv", dir: "66-kompyuter-qismlari", title: "Kompyuter qismlari", desc: "Monitor, klaviatura, sichqoncha: nima kiritadi, nima chiqaradi", key: "kompyuter-qismlari:v1", stages: 3, toifa: "boshlangich", icon: "qismlar" },
    { n: 67, topic: "tanishuv", dir: "67-chaqqon-sichqoncha", title: "Chaqqon sichqoncha", desc: "Bosish, ikki marta bosish, oʻng tugma va sudrab olib borish", key: "chaqqon-sichqoncha:v1", stages: 3, toifa: "boshlangich", icon: "sichqoncha", pc: true },
    { n: 68, topic: "tanishuv", dir: "68-ekran-va-oynalar", title: "Ekran va oynalar", desc: "Ish stoli, belgilar va oyna tugmalari: ochish, yopish, yoyish", key: "ekran-va-oynalar:v1", stages: 3, toifa: "boshlangich", icon: "oynalar" },
    { n: 69, topic: "tanishuv", dir: "69-fayl-va-papka", title: "Fayl va papka", desc: "Faylni topish, papkaga joylash, nusxa olish va savat", key: "fayl-va-papka:v1", stages: 3, toifa: "boshlangich", icon: "papka" },
    { n: 70, topic: "tanishuv", dir: "70-kichik-rassom", title: "Kichik rassom", desc: "Katakli Paint: asboblar, namunani qadam-qadam chizish, galereya", key: "kichik-rassom:v1", stages: 3, toifa: "boshlangich", icon: "rassom" },
    { n: 71, topic: "tanishuv", dir: "71-matn-yozamiz", title: "Matn yozamiz", desc: "Matn muharriri: kursor, xatoni tuzatish, qatorlar, belgilash va bezash", key: "matn-yozamiz:v1", stages: 3, toifa: "boshlangich", icon: "muharrir", pc: true },
    { n: 72, topic: "tanishuv", dir: "72-brauzer-va-sayt", title: "Brauzer va sayt", desc: "Oʻyinchoq internet: manzil, havola, orqaga, qidiruv va xavfsiz yurish", key: "brauzer-va-sayt:v1", stages: 3, toifa: "boshlangich", icon: "brauzer" },
  ];

  // Mashqlar — o'yin emas: masalalar ro'yxati (qidiruv, filtr, sahifalash). Bosqichi yo'q,
  // har masala alohida yechiladi va foiz bilan baholanadi.
  const MASHQLAR = [
    { dir: "masalalar", title: "Masalalar", desc: "Olimpiada masalalari: qidiruv, filtr va testlar bilan tekshirish", icon: "minora", toifalar: ["orta", "yuqori"], pc: true },
    { dir: "cpp-shpargalka", title: "C++ shpargalkasi", desc: "Bitta sahifada: qolip, Python bilan farqlar va tuzoqlar", icon: "varaq", toifalar: ["yuqori"] },
  ];

  // Musobaqalar — o'yin emas (bosqichi yo'q), ro'yxat tepasida alohida bo'lim: savol-javob va tez yozish poygasi
  // mode: offline — bitta ekranda, internetsiz; online — har kim o'z qurilmasida (internet kerak)
  const CONTESTS = [
    { dir: "musobaqa", mode: "offline", toifalar: ["boshlangich", "orta"], title: "Savol-javob", desc: "Ikki kishi bitta ekranda: savollar, soat va 3 ta yurak", icon: "musobaqa" },
    { dir: "poyga", mode: "offline", toifalar: ["boshlangich", "orta", "yuqori"], title: "Tez yozish poygasi", desc: "Navbat bilan bir xil matnni yozasizlar: kim aniq va tez?", icon: "poyga", pc: true },
    { dir: "tank-duel", mode: "offline", title: "Tank dueli", desc: "Ikki oʻquvchi navbat bilan oʻz tankiga kod yozadi: kim gʻolib?", icon: "tankduel", toifalar: ["orta", "yuqori"], pc: true },
    { dir: "onlayn", mode: "online", toifalar: ["boshlangich", "orta", "yuqori"], title: "Aloqa sinovi", desc: "Ikki qurilmani ulab koʻramiz — onlayn musobaqalar uchun tayyorgarlik", icon: "onlayn" },
    { dir: "tog", mode: "online", toifalar: ["boshlangich", "orta"], title: "Togʻga chiqish", desc: "Savolga javob ber — pogʻona yuqoriga. Qolib ketsang, chiqib ketasan", icon: "tog", badge: "robotlar bilan" },
    { dir: "tank-onlayn", mode: "online", toifalar: ["orta", "yuqori"], title: "Tank jangi — onlayn", desc: "2–8 bola, har raundda bitta satr kod: oxirgi tirik qolgan yutadi", icon: "tankduel", pc: true },
    { dir: "yozuv-poygasi", mode: "online", toifalar: ["boshlangich", "orta", "yuqori"], title: "Yozuv poygasi", desc: "Hamma bir xil matnni yozadi — yozgan sari togʻga koʻtarilasan", icon: "yozuv", pc: true },
  ];
  const MODES = [
    { id: "offline", title: "Bitta ekranda", note: "Internet kerak emas" },
    { id: "online", title: "Onlayn", note: "Har kim oʻz qurilmasida, internet kerak" },
  ];

  // O'yin shu toifadami: "hammasi" — har doim; o'yinda bitta toifa, asbob va musobaqada ro'yxat
  const mos = (item, toifa) => toifa.id === "hammasi" || (item.toifa ? item.toifa === toifa.id : item.toifalar.includes(toifa.id));
  const toifaById = (id) => TOIFALAR.find((t) => t.id === id) || null;
  const toifaYorligi = (item) => (item.toifa ? toifaById(item.toifa).qisqa : "");

  // Toifadagi o'yinlar — bo'limlar tartibida. Raqam ham shu ro'yxat bo'yicha: har toifada 1 dan boshlanadi.
  // Toifaning bo'limlar tartibi: o'z "tartib"i bo'lsa — shu, qolganlari SECTIONS tartibida oxirida
  const bolimlar = (toifa) => {
    if (!toifa || !Array.isArray(toifa.tartib)) return SECTIONS;
    const oldin = toifa.tartib.map((id) => SECTIONS.find((s) => s.id === id)).filter(Boolean);
    return oldin.concat(SECTIONS.filter((s) => !toifa.tartib.includes(s.id)));
  };
  const oyinlar = (toifa) => bolimlar(toifa).flatMap((sec) => GAMES.filter((g) => g.topic === sec.id && mos(g, toifa)));
  const number = (game, toifa) => oyinlar(toifa).indexOf(game) + 1;

  // Tanlov umumiy/js/toifa.js da saqlanadi (bosh sahifa uni <head> da ulaydi); sahifa ko'rinishi ham o'sha yerda yangilanadi
  const saqlangan = () => toifaById(root.QK.toifa.oqi());
  function saqla(id) {
    root.QK.toifa.yoz(id);
    root.QK.toifa.qolla();
  }

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

  // O'yin holati (tugagan bosqichlar, yulduzlar); brauzer xotirasi o'qilmasa — bo'sh (sahifa baribir ishlaydi)
  const holat = (game) => root.QK.storage.create(game.key, game.stages).load();
  const doneCount = (game) => holat(game).done.filter(Boolean).length;
  const tugaganmi = (game) => doneCount(game) === game.stages;

  // Bo'lim ranglari — aylanma (c0..c3); karta ikonkasi foni va raqam nishoni shu rangda
  const RANGLAR = [
    { sec: "var(--c0)", och: "var(--asosiy-och)" },
    { sec: "var(--c1)", och: "var(--yana-och)" },
    { sec: "var(--c2)", och: "var(--togri-och)" },
    { sec: "var(--c3)", och: "#EEE6F8" },
  ];
  const pcBelgi = () => h("span", { class: "bosh-pc", title: "Kompyuter kerak", "aria-label": "Kompyuter kerak", text: "💻" });

  // davom — "Davom et" kartasi (ro'yxat tepasida, keyingi tugallanmagan o'yin)
  function card(game, toifa, davom) {
    const st = holat(game);
    const done = st.done.filter(Boolean).length;
    const full = done === game.stages;
    const jami = st.stars.reduce((a, b) => a + b, 0);
    let progress;
    if (full) {
      progress = h("span", { class: "bosh-state-row" },
        h("span", { class: "bosh-stars", text: `★ ${jami}/${game.stages * 3}` + (st.hard.some(Boolean) ? " 🔥" : "") }),
        h("span", { class: "bosh-ok", "aria-label": "tugagan", text: "✓" }));
    } else {
      progress = h("span", { class: "bosh-dots", "aria-label": `${done} bosqich tugagan` });
      for (let k = 0; k < game.stages; k++) progress.append(h("span", { class: "dot" + (k < done ? " on" : "") }));
    }
    return h("a", { class: "bosh-card" + (full ? " done" : "") + (davom ? " davom" : ""), href: `oyinlar/${game.dir}/index.html` },
      h("span", { class: "bosh-icon", html: root.QK.boshArt.icon(game.icon) }),
      h("span", { class: "bosh-text" },
        h("span", { class: "bosh-name" }, h("span", { class: "bosh-num", text: String(number(game, toifa)) }), h("span", { text: game.title })),
        h("span", { class: "bosh-desc", text: game.desc })),
      h("span", { class: "bosh-state" }, progress,
        toifa.id === "hammasi" ? h("span", { class: "bosh-age", text: toifaYorligi(game) }) : null, game.pc ? pcBelgi() : null));
  }

  const sarlavha = (matn) => {
    const el = root.document.querySelector(".bosh-title");
    if (el) el.textContent = matn;
  };
  const tanla = (id) => {
    saqla(id);
    render();
    root.scrollTo({ top: 0 });
  };

  // Kirish ekrani: o'quvchi sinfini tanlaydi. Tanlov saqlanadi; keyin almashtirgich bilan o'zgartiriladi.
  function sinfEkrani(list) {
    const bubble = root.document.querySelector(".bubble");
    if (bubble) bubble.textContent = "Salom! Nechanchi sinfda oʻqiysan?";
    sarlavha("Qabila maktabi");
    const sub = root.document.querySelector(".bosh-sub");
    if (sub) sub.textContent = "Informatika oʻyinlari";
    const top = root.document.querySelector(".bosh-top");
    if (top) top.classList.remove("royxat");
    const tanlov = h("div", { class: "bosh-sinf" });
    for (const t of TOIFALAR) {
      const b = h("button", { class: "bosh-sinf-btn" + (t.id === "hammasi" ? " kichik" : ""), type: "button" },
        h("span", { class: "bosh-sinf-nom", text: t.title }),
        h("span", { class: "bosh-sinf-izoh", text: t.note }),
        h("span", { class: "bosh-sinf-soni", text: oyinlar(t).length + " ta oʻyin" }));
      b.addEventListener("click", () => tanla(t.id));
      tanlov.append(b);
    }
    list.append(h("section", { class: "bosh-section" }, tanlov));
  }

  // Almashtirgich: sarlavha ostida doim ko'rinadi, bir bosishda boshqa toifaga o'tadi
  function almashtirgich(joriy) {
    const guruh = h("div", { class: "bosh-toifa", role: "group", "aria-label": "Sinf" });
    for (const t of TOIFALAR.filter((x) => x.id !== "hammasi")) {
      const b = h("button", { class: "bosh-toifa-btn", type: "button", "aria-pressed": String(t.id === joriy.id), text: t.title });
      b.addEventListener("click", () => tanla(t.id));
      guruh.append(b);
    }
    const hamma = h("button", { class: "bosh-toifa-hamma", type: "button", "aria-pressed": String(joriy.id === "hammasi"), text: "Hammasi" });
    hamma.addEventListener("click", () => tanla("hammasi"));
    return h("div", { class: "bosh-toifa-qator" }, guruh, hamma);
  }

  function royxat(list, toifa) {
    const bubble = root.document.querySelector(".bubble");
    if (bubble) bubble.textContent = "Salom! Qaysi oʻyinni oʻynaymiz?";
    sarlavha(toifa.sarlavha);
    const sub = root.document.querySelector(".bosh-sub");
    if (sub) {
      sub.innerHTML = "";
      sub.append(almashtirgich(toifa));
    }
    const top = root.document.querySelector(".bosh-top");
    if (top) top.classList.add("royxat");

    // Tepada: umumiy progress va "Davom et" — keyingi tugallanmagan o'yin
    const barcha = oyinlar(toifa);
    const tugagan = barcha.filter(tugaganmi).length;
    // "Davom et": avval boshlab qo'yilgan o'yin, bo'lmasa birinchi tugallanmagani.
    // Barmoqli qurilmada (telefon) klaviatura kerak bo'lgan o'yin taklif qilinmaydi.
    const barmoq = !!(root.matchMedia && root.matchMedia("(hover: none) and (pointer: coarse)").matches);
    const mosQurilma = (g) => !(barmoq && g.pc);
    const keyingi = barcha.find((g) => !tugaganmi(g) && doneCount(g) > 0 && mosQurilma(g))
      || barcha.find((g) => !tugaganmi(g) && mosQurilma(g))
      || barcha.find((g) => !tugaganmi(g));
    const foiz = barcha.length ? Math.round((100 * tugagan) / barcha.length) : 0;
    list.append(h("section", { class: "bosh-section first bosh-hero" },
      h("div", { class: "bosh-progress", "aria-label": `${tugagan} ta oʻyin tugagan` },
        h("div", { class: "bosh-progress-bar" }, h("span", { style: `width:${foiz}%` })),
        h("span", { class: "bosh-progress-txt", text: `Tugagan: ${tugagan} / ${barcha.length}` })),
      keyingi ? card(keyingi, toifa, true) : null));

    // Musobaqalar — o'rganganini sinash: bolaga ro'yxat oxirida, o'qituvchiga ("hammasi") tepada
    const musobaqalar = h("section", { class: "bosh-section" },
      h("h2", { class: "bosh-h2" }, h("span", { text: "Musobaqalar" })),
      h("p", { class: "bosh-note", text: "Oʻrganganingni doʻsting bilan sinab koʻr" }));
    for (const mode of MODES) {
      const cards = h("div", { class: "bosh-row" });
      CONTESTS.filter((c) => c.mode === mode.id && mos(c, toifa)).forEach((c) => cards.append(
        h("a", { class: "bosh-card bosh-contest", href: `oyinlar/${c.dir}/index.html` },
          h("span", { class: "bosh-icon", html: root.QK.boshArt.icon(c.icon) }),
          h("span", { class: "bosh-text" },
            h("span", { class: "bosh-name", text: c.title }),
            h("span", { class: "bosh-desc", text: c.desc })),
          h("span", { class: "bosh-state" }, h("span", { class: "bosh-age", text: c.badge || (mode.id === "online" ? "🌐 onlayn" : "2 kishi") }),
            c.pc ? pcBelgi() : null))));
      if (cards.children.length) musobaqalar.append(h("h3", { class: "bosh-h3", text: `${mode.title} · ${mode.note}` }), cards);
    }
    const musobaqaBor = !!musobaqalar.querySelector(".bosh-card");
    if (musobaqaBor && toifa.id === "hammasi") list.append(musobaqalar);

    // Bo'limlar — o'rganish yo'li, har biri o'z rangi va "tugagan/jami" hisobi bilan
    bolimlar(toifa).forEach((section, idx) => {
      const games = GAMES.filter((g) => g.topic === section.id && mos(g, toifa));
      if (!games.length) return; // bu toifada bo'sh bo'lim ko'rsatilmaydi
      const rang = RANGLAR[idx % RANGLAR.length];
      const tug = games.filter(tugaganmi).length;
      const cards = h("div", { class: "bosh-cards" });
      games.forEach((g) => cards.append(card(g, toifa)));
      list.append(h("section", { class: "bosh-section", id: "bolim-" + section.id, style: `--sec:${rang.sec};--sec-och:${rang.och}` },
        h("h2", { class: "bosh-h2" },
          h("span", { text: section.title }),
          h("span", { class: "bosh-h2-soni" + (tug === games.length ? " done" : ""), text: `${tug}/${games.length}` })),
        h("p", { class: "bosh-note", text: section.note }),
        cards));
    });

    const mashqlar = MASHQLAR.filter((m) => mos(m, toifa));
    if (mashqlar.length) {
      const mashq = h("section", { class: "bosh-section" },
        h("h2", { class: "bosh-h2" }, h("span", { text: "Mashqlar" })),
        h("p", { class: "bosh-note", text: "Masalalar va qoʻllanma — oʻzing tanlaysan" }));
      const mashqCards = h("div", { class: "bosh-row" });
      mashqlar.forEach((m) => mashqCards.append(
        h("a", { class: "bosh-card bosh-contest", href: `oyinlar/${m.dir}/index.html` },
          h("span", { class: "bosh-icon", html: root.QK.boshArt.icon(m.icon) }),
          h("span", { class: "bosh-text" },
            h("span", { class: "bosh-name", text: m.title }),
            h("span", { class: "bosh-desc", text: m.desc })),
          h("span", { class: "bosh-state" }, m.pc ? pcBelgi() : null))));
      mashq.append(mashqCards);
      list.append(mashq);
    }

    if (musobaqaBor && toifa.id !== "hammasi") list.append(musobaqalar);
  }

  function render() {
    root.document.getElementById("actor-elder").innerHTML = root.QK.art.elder();
    root.document.getElementById("actor-apprentice").innerHTML = root.QK.art.apprentice();
    const paper = root.document.querySelector("#actor-apprentice .paper");
    if (paper) paper.style.visibility = "hidden"; // bosh sahifada qog'oz kerak emas
    const list = root.document.getElementById("list");
    list.innerHTML = "";
    const toifa = saqlangan();
    if (toifa) royxat(list, toifa);
    else sinfEkrani(list);
    // Tog' maslahatidan kelgan havola: index.html#bolim-ikkilik — o'sha bo'limga tushadi
    const hash = root.location && root.location.hash;
    if (hash && /^#bolim-[a-z0-9]+$/.test(hash)) {
      const bolim = root.document.getElementById(hash.slice(1));
      if (bolim) setTimeout(() => bolim.scrollIntoView({ block: "start" }), 0);
    }
  }

  root.QK = root.QK || {};
  root.QK.bosh = { TOIFALAR, SECTIONS, GAMES, CONTESTS, MASHQLAR, MODES, mos, toifaById, bolimlar, oyinlar, toifaYorligi, number, render };
  if (root.document && root.document.getElementById("list")) render(); // o'qituvchi paneli faqat katalogni oladi
})(window);
