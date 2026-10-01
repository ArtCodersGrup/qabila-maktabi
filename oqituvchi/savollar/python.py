# -*- coding: utf-8 -*-
"""Python bloki (27–34-oʻyinlar) — test savollari.

Har bir kod parchasining javobi `python3` da tekshirilgan (2026-10-01).
"""

BLOK = {"id": "python", "nom": "Python: dasturlash", "yosh": [12, 16]}


def savollar(q, M):
    K = lambda kod: '<span class="kod">%s</span>' % kod  # kodni monoshriftda koʻrsatish

    # ── Oʻrtacha ──
    q("orta", "%s nima chiqaradi?" % K("print(2 + 3)"),
      ["5", "2 + 3", "23", "xato beradi"], 0,
      "Qoʻshtirnoqsiz yozilgani — amal, Python uni hisoblaydi")
    q("orta", "%s nima chiqaradi?" % K('print("2 + 3")'),
      ["5", "2 + 3", "23", "xato beradi"], 1,
      "Qoʻshtirnoq ichidagi narsa — matn, u hisoblanmaydi")
    q("orta", "%s nechaga teng?" % K("17 // 5"),
      ["3", "3.4", "2", "85"], 0,
      "// — butun boʻlinma: 5 dan 3 marta tegdi")
    q("orta", "%s nechaga teng?" % K("17 % 5"),
      ["3", "2", "0", "3.4"], 1,
      "% — qoldiq: 17 = 5 × 3 + 2")
    q("orta", "%s nima chiqaradi?" % K("print(10 / 4)"),
      ["2", "2.5", "3", "2.0"], 1,
      "Bitta / har doim kasr beradi")
    q("orta", "%s boʻlsa, x nechaga teng?" % K("x = 5  ⏎  x = x + 1"),
      ["5", "6", "11", "xato"], 1,
      "Avval oʻng tomoni hisoblanadi (5 + 1), keyin x ga yoziladi")
    q("orta", "%s nima chiqaradi?" % K('print("5" + "3")'),
      ["8", "53", "5 3", "xato beradi"], 1,
      "Ikki matn qoʻshilsa — yonma-yon yopishadi")
    q("orta", "Foydalanuvchi kiritgan sonni qoʻshish uchun nima qilish kerak?",
      [K("input()") + " yetarli", K("int(input())") + " — matnni songa aylantirish kerak",
       "hech narsa, Python oʻzi biladi", K("str(input())")], 1,
      "input() doim MATN qaytaradi")
    q("orta", "%s qaysi sonlarni beradi?" % K("range(3)"),
      ["1, 2, 3", "0, 1, 2", "0, 1, 2, 3", "3, 2, 1"], 1,
      "range nol dan boshlaydi va 3 ga yetmaydi")
    q("orta", "%s nima chiqaradi?" % K('print(len("salom"))'),
      ["4", "5", "6", "salom"], 1,
      "len — belgilar soni")

    # ── Qiyin ──
    q("qiyin", "%s nima chiqaradi?" % K("s = 0  ⏎  for i in range(1, 5):  ⏎      s += i  ⏎  print(s)"),
      ["10", "15", "6", "4"], 0,
      "1 + 2 + 3 + 4 = 10 (5 ga yetmaydi)")
    q("qiyin", "%s nima chiqaradi?" % K('a = [1, 2, 3, 4]  ⏎  print(a[1:3])'),
      ["[1, 2]", "[2, 3]", "[2, 3, 4]", "[1, 2, 3]"], 1,
      "Kesishda 1-indeksdan boshlanadi, 3-indeksga yetmaydi")
    q("qiyin", "%s dan keyin roʻyxatda nechta element bor?" % K("a = [3, 1, 2]  ⏎  a.append(5)"),
      ["3", "4", "5", "2"], 1,
      "append oxiriga bitta qoʻshadi: [3, 1, 2, 5]")
    q("qiyin", "%s nima chiqaradi?" % K('print("qabila"[0])'),
      ["q", "a", "qabila", "xato"], 0,
      "Indeks 0 dan boshlanadi — birinchi harf")
    q("qiyin", "Shart bloki qayerdan boshlanib, qayerda tugaydi?",
      ["qavslar bilan", "otstup (boʻsh joy) bilan", "nuqta-vergul bilan", "begin va end soʻzlari bilan"], 1,
      "Pythonda blokni otstup belgilaydi")
    q("qiyin", "%s va %s farqi nimada?" % (K("="), K("==")),
      ["farqi yoʻq", "= qiymat beradi, == tenglikni soʻraydi",
       "= faqat sonlar uchun", "== eski yozuv"], 1,
      "x = 5 — yozish; x == 5 — tekshirish")
    q("qiyin", "%s nima chiqaradi?" % K("print(7 > 3 and 2 > 5)"),
      ["True", "False", "7", "xato"], 1,
      "and — ikkalasi ham rost boʻlishi kerak, 2 > 5 yolgʻon")
    q("qiyin", "Funksiyada %s bilan %s ning farqi nimada?" % (K("return"), K("print")),
      ["farqi yoʻq", "return qiymatni qaytaradi, print ekranga yozadi",
       "print tezroq", "return faqat sonlar uchun"], 1,
      "return natijani boshqa joyda ishlatish uchun qaytaradi")

    # ── Oʻta qiyin ──
    q("ota", "%s nima chiqaradi?" % K('print("ab" * 3)'),
      ["ab3", "ababab", "ab ab ab", "xato beradi"], 1,
      "Matnni songa koʻpaytirish — takrorlash")
    q("ota", "%s nima chiqaradi?" % K('print("salom dunyo".split())'),
      ["salom dunyo", "['salom', 'dunyo']", "['salom dunyo']", "xato beradi"], 1,
      "split boʻsh joy boʻyicha roʻyxatga ajratadi")
    q("ota", "Quyidagi sikl necha marta aylanadi? %s" % K("i = 1  ⏎  while i < 10:  ⏎      i = i * 2"),
      ["3 marta", "4 marta", "9 marta", "cheksiz"], 1,
      "1 → 2 → 4 → 8 → 16; shart 4 marta rost boʻladi")
    q("ota", "Nega bu sikl hech qachon toʻxtamaydi? %s" % K("i = 1  ⏎  while i < 10:  ⏎      print(i)"),
      ["shart notoʻgʻri", "i hech qachon oʻzgarmaydi", "print sekin", "while xato yozilgan"], 1,
      "Sikl ichida i oʻzgarmasa, shart doim rost qoladi")
