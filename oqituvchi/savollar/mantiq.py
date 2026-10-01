# -*- coding: utf-8 -*-
"""Mantiq (24, 25, 48-oʻyinlar) — test savollari."""

BLOK = {"id": "mantiq", "nom": "Mantiq", "yosh": [8, 16]}


def savollar(q, M):
    K = lambda kod: '<span class="kod">%s</span>' % kod

    q("orta", "Ikki kalit ketma-ket ulangan. Chiroq qachon yonadi?",
      ["bittasi yoqilsa", "ikkalasi ham yoqilsa", "hech qachon", "har doim"], 1,
      "Ketma-ket ulanish — VA (and)")
    q("orta", "Ikki kalit parallel ulangan. Chiroq qachon yonadi?",
      ["ikkalasi yoqilsa", "kamida bittasi yoqilsa", "hech qachon", "ikkalasi oʻchiq boʻlsa"], 1,
      "Parallel ulanish — YOKI (or)")
    q("orta", "EMAS (not) amali nima qiladi?",
      ["ikki qiymatni qoʻshadi", "rostni yolgʻonga, yolgʻonni rostga aylantiradi",
       "hech narsa qilmaydi", "ikkita kalit kerak"], 1,
      "not — teskarisi")
    q("orta", "«Yomgʻir yogʻmasa, sayrga chiqamiz» — qaysi amal?",
      ["and", "or", "not", "hech qaysi"], 2,
      "«...masa» — inkor, yaʼni not")
    q("orta", "Rostlik jadvali nima uchun kerak?",
      ["chiroyli koʻrinish uchun", "hamma holatni tekshirib chiqish uchun",
       "sonlarni qoʻshish uchun", "kalitlarni sanash uchun"], 1,
      "Jadval barcha kirish holatlarini qamrab oladi")

    q("qiyin", "%s nechaga teng (a = True, b = False)?" % K("a and b"),
      ["True", "False", "a", "xato"], 1,
      "and — ikkalasi ham rost boʻlishi kerak")
    q("qiyin", "%s nechaga teng (a = True, b = False)?" % K("a or b"),
      ["True", "False", "b", "xato"], 0,
      "or — kamida bittasi rost boʻlsa yetadi")
    q("qiyin", "XOR («faqat bittasi») qachon rost boʻladi?",
      ["ikkalasi rost boʻlsa", "faqat bittasi rost boʻlsa",
       "ikkalasi yolgʻon boʻlsa", "har doim"], 1,
      "Zinapoya chirogʻi shunday ishlaydi")
    q("qiyin", "Pythonda «yosh 12 dan kichik emas» sharti qanday yoziladi?",
      [K("yosh > 12"), K("yosh >= 12"), K("yosh < 12"), K("yosh == 12")], 1,
      "«Kichik emas» — katta yoki teng")

    q("ota", "%s bilan bir xil natija beradigan ifoda qaysi?" % K("not (a and b)"),
      [K("not a and not b"), K("not a or not b"), K("a or b"), K("a and b")], 1,
      "De Morgan qoidasi: inkor qavs ichiga kirsa, and → or boʻladi")
    q("ota", "Yarim qoʻshuvchida ikkilik 1 + 1 nima beradi?",
      ["yigʻindi 1, koʻchirish 0", "yigʻindi 0, koʻchirish 1",
       "yigʻindi 1, koʻchirish 1", "xato"], 1,
      "1 + 1 = 10: oʻngda 0, chapga 1 koʻchadi")
