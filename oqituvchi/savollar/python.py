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
    # ── Tahlil (2026-10-02): qadamlarni yurgizish va xatoni topish ──
    # Har kod javobi python3 da ham, saytning oʻz talqinchisida ham tekshirilgan.
    q("ota", "%s nima chiqaradi?" % K("s = 0  ⏎  for i in range(2, 10, 3):  ⏎      s += i  ⏎  print(s)"),
      ["15", "17", "12", "20"], 0,
      "range(2, 10, 3) → 2, 5, 8; yigʻindi 15 (10 kirmaydi)")
    q("ota", "%s nima chiqaradi?" % K("a = 3  ⏎  b = 5  ⏎  a, b = b, a + b  ⏎  a, b = b, a + b  ⏎  print(a)"),
      ["8", "5", "13", "3"], 0,
      "1-qadam: a=5, b=8; 2-qadam: a=8, b=13 — oʻng tomon avval toʻliq hisoblanadi")
    q("ota", "%s nima chiqaradi?" % K("a = [1, 2, 3]  ⏎  b = a  ⏎  b.append(4)  ⏎  print(len(a))"),
      ["3", "4", "xato beradi", "7"], 1,
      "b = a nusxa olmaydi — ikkala nom bitta roʻyxatga qaraydi")
    q("ota", "Bu kod roʻyxatdagi eng katta sonni topmoqchi, lekin %s uchun notoʻgʻri javob beradi. Qaysi satr aybdor? %s"
      % (K("[-5, -2, -9]"), K("best = 0  ⏎  for x in a:  ⏎      if x > best:  ⏎          best = x")),
      [K("best = 0"), K("for x in a"), K("if x > best"), K("best = x")], 0,
      "Boshlangʻich qiymat 0 — hamma son manfiy boʻlsa, hech biri 0 dan katta emas. a[0] dan boshlash kerak")
    q("qiyin", "Bu kod nechta yulduzcha chiqaradi? %s" % K('for i in range(3):  ⏎      for j in range(i):  ⏎          print("*")'),
      ["3", "6", "9", "2"], 0,
      "i = 0 → 0 ta, i = 1 → 1 ta, i = 2 → 2 ta: jami 3")
    q("ota", "Sikl tanasi necha marta bajariladi? %s" % K("n = 100  ⏎  while n > 1:  ⏎      n = n // 2"),
      ["6 marta", "7 marta", "50 marta", "99 marta"], 0,
      "100 → 50 → 25 → 12 → 6 → 3 → 1: olti marta yarimlanadi")
    q("ota", "Bu kod 1 dan n gacha sonlar yigʻindisini chiqarishi kerak, lekin javob har doim kichik chiqadi. Qaysi satr aybdor? %s"
      % K("s = 0  ⏎  for i in range(1, n):  ⏎      s += i  ⏎  print(s)"),
      [K("s = 0"), K("for i in range(1, n)"), K("s += i"), K("print(s)")], 1,
      "range(1, n) n ning oʻziga yetmaydi — range(1, n + 1) kerak")
    q("qiyin", "%s nima chiqaradi?" % K("a = 2  ⏎  b = 3  ⏎  a = a + b  ⏎  b = a - b  ⏎  a = a - b  ⏎  print(a, b)"),
      ["3 2", "2 3", "5 2", "5 3"], 0,
      "a=5; b=5−3=2; a=5−2=3 — ikki quti uchinchi qutisiz almashdi")
    q("ota", "%s nima chiqaradi?" % K("def qosh(r):  ⏎      r.append(0)  ⏎    ⏎  a = [1, 2]  ⏎  qosh(a)  ⏎  qosh(a)  ⏎  print(len(a))"),
      ["2", "3", "4", "xato beradi"], 2,
      "Roʻyxat funksiyaga nusxalanmaydi: har chaqiruv oʻsha roʻyxatga bitta element qoʻshadi")
    q("ota", "Bu kod roʻyxatda 7 bor-yoʻqligini aytishi kerak, lekin %s uchun False chiqaradi. Nega? %s"
      % (K("[3, 7, 5]"), K("for x in a:  ⏎      if x == 7:  ⏎          bor = True  ⏎      else:  ⏎          bor = False")),
      ["else har aylanishda javobni qayta False qilib yuboradi", "for notoʻgʻri yozilgan",
       "== oʻrniga = boʻlishi kerak", "True kichik harf bilan yoziladi"], 0,
      "7 topilgach ham keyingi element (5) else ga tushib, bor ni oʻchiradi. bor = False sikldan oldin bir marta yoziladi")
    q("qiyin", "%s nima chiqaradi?" % K('s = "python"  ⏎  print(s[1:4], s[-1])'),
      ["yth n", "pyt n", "ytho n", "yth o"], 0,
      "s[1:4] — 1, 2, 3-indekslar (y, t, h); s[-1] — oxirgi harf")
    q("ota", "%s nima chiqaradi?" % K("def f(n):  ⏎      if n == 0:  ⏎          return 0  ⏎      return n + f(n - 1)  ⏎    ⏎  print(f(4))"),
      ["10", "4", "24", "0"], 0,
      "f(4) = 4 + f(3) = 4 + 3 + 2 + 1 + 0 = 10 — funksiya oʻzini chaqiradi (rekursiya)")
