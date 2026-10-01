# -*- coding: utf-8 -*-
"""Klaviatura (23, 46-oʻyinlar) — test savollari."""

BLOK = {"id": "klaviatura", "nom": "Klaviatura", "yosh": [8, 16]}


def savollar(q, M):
    K = lambda kod: '<span class="kod">%s</span>' % kod

    q("orta", "Asosiy qatorda barmoqlar qaysi tugmalarda turadi?",
      ["Q W E R / U I O P", "A S D F / J K L ;", "Z X C V / N M , .", "istalgan joyda"], 1,
      "Koʻrsatkich barmoqlar F va J tugmalarida (ularda belgi bor)")
    q("orta", "Nusxa olish uchun qaysi tugmalar bosiladi?",
      [K("Ctrl + V"), K("Ctrl + C"), K("Ctrl + X"), K("Ctrl + Z")], 1,
      "C — copy (nusxa olish)")
    q("orta", "Xotiradagi matnni qoʻyish uchun?",
      [K("Ctrl + C"), K("Ctrl + V"), K("Ctrl + A"), K("Ctrl + S")], 1,
      "V — qoʻyish (paste)")
    q("orta", "Notoʻgʻri oʻchirib yubording. Qaysi tugmalar qaytaradi?",
      [K("Ctrl + Z"), K("Ctrl + Y"), K("Delete"), K("Esc")], 0,
      "Z — bekor qilish (undo)")
    q("orta", "Boʻsh joy (probel) qaysi barmoq bilan bosiladi?",
      ["koʻrsatkich", "jimjiloq", "bosh barmoq", "istalgan"], 2,
      "Bosh barmoq — faqat probel uchun")

    q("qiyin", "%s va %s farqi nimada?" % (K("Backspace"), K("Delete")),
      ["farqi yoʻq", "Backspace chapdagini, Delete oʻngdagini oʻchiradi",
       "Delete tezroq", "Backspace faqat raqamlarni oʻchiradi"], 1,
      "Kursorning qaysi tomonidagi belgi oʻchishi bilan farq qiladi")
    q("qiyin", "Kursorni qator boshiga olib borish uchun qaysi tugma?",
      [K("Home"), K("End"), K("Tab"), K("Enter")], 0,
      "Home — boshiga, End — oxiriga")
    q("qiyin", "Matnni oʻq tugmalari bilan belgilash uchun qaysi tugma bosib turiladi?",
      [K("Ctrl"), K("Shift"), K("Alt"), K("Tab")], 1,
      "Shift + ← yoki → — belgilaydi")
    q("qiyin", "Shaklda keyingi katakka oʻtish uchun eng qulay tugma?",
      [K("Enter"), K("Tab"), K("Space"), K("Shift")], 1,
      "Tab keyingi maydonga sakraydi")

    q("ota", "Tez yozishda eng muhimi nima?",
      ["eng tez yozish", "klaviaturaga qaramay, aniq yozish",
       "ikki barmoq bilan yozish", "katta harflarni koʻp ishlatish"], 1,
      "Avval aniqlik — tezlik mashq bilan oʻzi keladi")
