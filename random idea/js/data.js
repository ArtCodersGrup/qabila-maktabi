// Xizmat turi va kompaniya nomi ro'yxatlari. Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  // Har biri aniq vazifali (DIZAYN.md, 3-bo'lim) — "bot", "sayt" kabi umumiy nom yo'q.
  const SERVICES = [
    "Sotuvchi bot",
    "Buyurtma qabul qiluvchi bot",
    "CRM tizimi",
    "Landing sahifa",
    "Bron qilish tizimi",
    "Onlayn do'kon",
    "Fikr-mulohaza formasi",
    "Kredit kalkulyatori",
    "Vakansiya taxtasi",
    "Navbat olish tizimi",
    "Chipta sotish sahifasi",
    "Restoran menyu sahifasi",
    "Taksi chaqirish interfeysi",
    "Mashqlar rejasi ilovasi",
    "Til kartochkalari ilovasi",
    "Ovqat yetkazib berish sahifasi",
    "Ombor hisobi tizimi",
    "Xodimlar davomat tizimi",
    "Onlayn so'rovnoma tizimi",
    "To'y tashkilotchisi sahifasi",
    "Ko'chmas mulk e'lonlar sahifasi",
    "Avto e'lonlar sahifasi",
    "Fastfud buyurtma ekrani",
    "Shifokorga yozilish tizimi",
    "Repetitor topish platformasi",
    "Kitob ijarasi tizimi",
    "Kir yuvish buyurtma sahifasi",
    "Avtomobil yuvish navbat tizimi",
    "Sport zali a'zolik tizimi",
    "Onlayn viktorina platformasi",
    "Ovoz berish sahifasi",
    "Yetkazib berish kuzatuv tizimi",
    "Shartnoma generatori",
    "Hisob-faktura tizimi",
    "Loyiha boshqaruv taxtasi",
    "Nasiya daftari ilovasi",
    "Parking band qilish tizimi",
    "Tadbirga ro'yxatga olish sahifasi",
    "Amaliyot arizalarini qabul qilish sahifasi",
    "Onlayn kutubxona katalogi",
    "Bog'chaga yozilish tizimi",
    "Muzey chiptalari sotuvi",
    "Fikr-mulohaza chat-boti",
    "Suv yetkazib berish boti",
    "Gaz balloni buyurtma boti",
    "Uy hayvonlarini boqish xizmati sahifasi",
    "Avtomexanikka yozilish tizimi",
    "Konsert chiptalarini bron qilish sahifasi",
    "Til kurslariga yozilish sahifasi",
    "Frilanser portfolio sahifasi",
  ];

  // O'ylab topilgan nomlar — orqasida haqiqiy kompaniya yo'q (DIZAYN.md, 3-bo'lim).
  const COMPANIES = [
    "Red24", "NovaTech", "BlueWave", "Orbita", "Tezkor", "Vertex", "Nur Line",
    "Almaz Group", "SilverPeak", "Zumrad", "Chaqmoq", "GoldTrail", "Ravon",
    "Merid", "Quantum7", "Bricks", "Yashin", "NextGen", "Karvon", "Deltalab",
    "PinePoint", "Oq Yo'l", "Vega9", "Trend Line", "Fusion", "Kumush",
    "Rapido", "Optima", "Sirius", "Gulzor",
  ];

  const api = { SERVICES, COMPANIES };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.data = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
