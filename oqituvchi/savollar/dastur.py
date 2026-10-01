# -*- coding: utf-8 -*-
"""Algoritm va dasturlash — robot oʻyinlari (26, 47) — test savollari."""

BLOK = {"id": "dastur", "nom": "Algoritm va dasturlash", "yosh": [8, 11]}


def savollar(q, M):
    q("orta", "Algoritm nima?",
      ["chiroyli rasm", "ketma-ket bajariladigan aniq buyruqlar",
       "kompyuterning nomi", "oʻyinning qoidasi"], 1,
      "Algoritm — qadamma-qadam aniq koʻrsatma")
    q("orta", "Robotga berilgan buyruqlar tartibi oʻzgarsa nima boʻladi?",
      ["hech narsa", "robot boshqa joyga boradi", "robot toʻxtaydi", "buyruqlar oʻchadi"], 1,
      "Tartib — algoritmning eng muhim qismi")
    q("orta", "Robot toshga urilsa nima boʻladi?",
      ["toshni surib ketadi", "toʻxtaydi — bu xato", "ustidan oʻtadi", "orqaga qaytadi"], 1,
      "Toʻsiq — dastur xato ekanini bildiradi")
    q("orta", "«Takror 4 marta: oʻngga» buyrugʻi nima qiladi?",
      ["bir marta oʻngga yuradi", "toʻrt qadam oʻngga yuradi",
       "toʻrtta robot yasaydi", "4 ta katak sakraydi"], 1,
      "Takror ichidagi buyruq necha marta aytilgan boʻlsa, shuncha bajariladi")

    q("qiyin", "Nega «takror» bloki kerak?",
      ["dastur chiroyli boʻlsin", "bir xil buyruqni qayta-qayta yozmaslik uchun",
       "robot tezroq yursin", "xato kamroq boʻlsin"], 1,
      "Oʻn qadam uchun oʻnta buyruq emas, bitta takror yetadi")
    q("qiyin", "«Agar oʻng boʻsh boʻlsa» bloki nima uchun kerak?",
      ["robot chiroyli yursin", "robot joyida turib qaror qabul qilsin",
       "dastur qisqa boʻlsin", "tosh yoʻqolsin"], 1,
      "Shart — robot vaziyatga qarab yoʻl tanlaydi")
    q("qiyin", "Bitta dastur ikki xil maydonda ham ishlashi uchun nima kerak?",
      ["uzunroq dastur", "shart bloki (agar)", "koʻproq takror", "tezroq robot"], 1,
      "Shartsiz dastur faqat oʻzi yozilgan maydonga yarashi mumkin")

    q("ota", "«Algoritm» soʻzi qayerdan kelib chiqqan?",
      ["ingliz tilidan", "al-Xorazmiy nomidan", "yunon tilidan", "lotin tilidan"], 1,
      "Muhammad al-Xorazmiy — Xorazmlik buyuk olim")
