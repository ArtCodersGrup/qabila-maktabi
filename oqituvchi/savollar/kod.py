# -*- coding: utf-8 -*-
"""Kodlash va shifrlash — test savollari.

Manba: muallifning `testlar/test-yasa.py` fayli (2026-09-29), oʻyinlarning
DIZAYN.md dagi "Oʻquv maqsadlari" roʻyxatidan tuzilgan. Oʻyinlar: 01-qabila-kodlari, 02-qabila-morzesi, 03-sezar-maktubi.
Savol matni oʻzgartirilmagan.
"""

BLOK = {"id": "kod", "nom": "Kodlash va shifrlash", "yosh": [8, 16]}


def savollar(q, M):
    q("orta", "Qabilada 3 xil belgi bor. Shu belgilardan aynan 2 belgili nechta har xil soʻz yasash mumkin?",
      ["6", "8", "9", "12"], 2, "3<sup>2</sup> = 9")
    q("orta", "2 xil belgidan aynan 4 belgili nechta soʻz yasaladi?",
      ["8", "16", "24", "32"], 1, "2<sup>4</sup> = 16")
    q("orta", "4 xil belgidan aynan 2 belgili nechta soʻz yasaladi?",
      ["8", "12", "16", "20"], 2, "4<sup>2</sup> = 16")
    q("orta", "2 xil belgi bilan 1 va 2 belgili soʻzlar jami nechta?",
      ["4", "6", "8", "10"], 1, "2 + 4 = 6")
    q("orta", "Qaysi biri koʻp: «aynan 3 harfli soʻzlar» yoki «3 harfgacha boʻlgan soʻzlar»?",
      ["aynan 3 harfli", "3 harfgacha", "teng", "aniqlab boʻlmaydi"], 1,
      "3 harfgacha = 1 + 2 + 3 harflilar yigʻindisi, ichida aynan 3 harflilar ham bor")
    q("orta", "Kompyuter nechta belgidan foydalanadi?",
      ["1 ta", "2 ta", "8 ta", "10 ta"], 1, "Faqat 0 va 1")
    q("orta", "Morze alifbosida har bir harf nimadan tuziladi?",
      ["faqat nuqtadan", "nuqta va chiziqdan", "raqamlardan", "ranglardan"], 1, "· va —")
    q("orta", "Morzeda E harfiga eng qisqa kod (bitta nuqta) berilgan. Nega?",
      ["alifboda birinchi", "matnda eng koʻp uchraydi", "aytish oson", "tasodifan"], 1,
      "Koʻp ishlatiladigan harfga qisqa kod — xabar tezroq yuboriladi")
    q("orta", "Morzeda harflar orasiga pauza nega qoʻyiladi?",
      ["chiroyli boʻlishi uchun", "kodlar har xil uzunlikda, aks holda chalkashadi",
       "qoʻl dam olishi uchun", "pauza shart emas"], 1, "Pauzasiz ·−·− ni ikki xil oʻqish mumkin")
    q("orta", "SOS xabari Morzeda qanday yoziladi?",
      [M("··· −−− ···"), M("−−− ··· −−−"), M("·−· ··· ·−·"), M("·· ·· ··")], 0,
      f"S = {M('···')}, O = {M('−−−')}")
    q("orta", "Sezar shifrida kalit nima?",
      ["maxfiy harf", "harflar necha qadam surilishi", "shifrlangan soʻz", "alifboning nomi"], 1)
    q("orta", "Sezar shifrida kalit 1 boʻlsa, A harfi qaysi harfga aylanadi? "
      "(alifbo: A, B, D, E, F, G, H, I, …)",
      ["«B»", "«D»", "«E»", "«A»"], 0, "A dan keyingi harf — B")
    q("orta", "Sezar shifrida surish paytida alifbo tugasa nima boʻladi?",
      ["shifrlash toʻxtaydi", "yana boshidan — A dan davom etadi", "harf oʻzgarmay qoladi", "xato beradi"], 1,
      "Alifbo aylana: Ng dan keyin yana A")
    q("orta", "Kodlash bilan shifrlashning asosiy farqi nimada?",
      ["farqi yoʻq", "shifrlashda kalit sir saqlanadi", "kodlash qiyinroq", "shifr faqat sonlar uchun"], 1,
      "Kod — hamma bilishi mumkin (Morze), shifr — kalitni bilgan oʻqiydi")
    q("qiyin", "3 xil belgidan 1, 2 va 3 belgili soʻzlar jami nechta?",
      ["27", "33", "39", "81"], 2, "3 + 9 + 27 = 39")
    q("qiyin", "2 xil belgidan 4 belgigacha boʻlgan soʻzlar jami nechta?",
      ["16", "24", "30", "32"], 2, "2 + 4 + 8 + 16 = 30")
    q("qiyin", "20 ta narsaga 2 xil belgidan iborat, bir xil uzunlikdagi kod berilmoqchi. "
      "Kod eng kamida necha belgili boʻlsin?",
      ["4", "5", "6", "10"], 1, "2<sup>4</sup> = 16 &lt; 20, 2<sup>5</sup> = 32 ≥ 20")
    q("qiyin", "100 ta narsaga 3 xil belgidan iborat, bir xil uzunlikdagi kod kerak. "
      "Kod eng kamida necha belgili?",
      ["4", "5", "6", "34"], 1, "3<sup>4</sup> = 81 &lt; 100, 3<sup>5</sup> = 243 ≥ 100")
    q("qiyin", "Alifboda 5 ta harf bor. Aynan 3 harfli soʻzlar aynan 2 harflilardan necha marta koʻp?",
      ["2", "3", "5", "25"], 2, "5<sup>3</sup> : 5<sup>2</sup> = 125 : 25 = 5")
    q("qiyin", f"Morzeda MEN soʻzi qanday yoziladi? (M = {M('−−')}, E = {M('·')}, N = {M('−·')})",
      [M("−− · −·"), M("· −− −·"), M("−· −− ·"), M("−−− · ··")], 0)
    q("qiyin", f"Morzeda {M('−·−  ··−  −·')} qaysi soʻz? "
      f"(K = {M('−·−')}, U = {M('··−')}, N = {M('−·')}, T = {M('−')}, R = {M('·−·')}, L = {M('·−··')})",
      ["KUN", "TUN", "NUR", "KUL"], 0)
    q("qiyin", "Morzeda aynan 3 ta belgidan (nuqta yoki chiziq) iborat nechta har xil kod bor?",
      ["3", "6", "8", "9"], 2, "2<sup>3</sup> = 8")
    q("qiyin", "Morzeda 1, 2 va 3 belgili kodlar jami nechta?",
      ["8", "12", "14", "16"], 2, "2 + 4 + 8 = 14")
    q("qiyin", "Sezar shifri, kalit 3. A harfi qaysi harfga aylanadi? "
      "(alifbo: A, B, D, E, F, G, H, I, …)",
      ["«D»", "«E»", "«F»", "«G»"], 1, "A → B → D → E (uch qadam)")
    q("qiyin", "Sezar shifri, kalit 2. «OT» soʻzi qanday shifrlanadi? "
      "(… N, O, P, Q, R, S, T, U, V, …)",
      ["«PU»", "«QV»", "«QU»", "«PV»"], 1, "O → P → Q, T → U → V")
    q("qiyin", "Oʻzbek alifbosida 29 ta harf bor. Sezar shifrida nechta har xil foydali kalit bor?",
      ["26", "28", "29", "30"], 1, "1 dan 28 gacha; 0 va 29 harfni oʻzgartirmaydi")
    q("qiyin", "Nega kalitlar soni kam boʻlsa shifr zaif hisoblanadi?",
      ["kalit tez unutiladi", "hamma kalitni birma-bir sinab koʻrish mumkin",
       "harflar chalkashadi", "alifbo kichik boʻladi"], 1)
    q("ota", "Qabilada 4 xil belgi bor. Uzunligi 1 dan 3 gacha boʻlgan kodlar bilan "
      "eng koʻpi bilan nechta narsaga alohida nom berish mumkin?",
      ["64", "80", "84", "128"], 2, "4 + 16 + 64 = 84")
    q("ota", "2 xil belgidan iborat kodlar bilan 500 ta narsaga nom berilmoqchi. "
      "Kodlar uzunligi 1 dan n gacha boʻlsa, n eng kamida nechaga teng?",
      ["7", "8", "9", "10"], 1, "2 + 4 + … + 2<sup>8</sup> = 510 ≥ 500, 2<sup>1</sup>…2<sup>7</sup> = 254 &lt; 500")
    q("ota", "Sezar shifri, kalit 5. Alifboning oxirgi harfi Ng qaysi harfga aylanadi? "
      "(29 harf: A, B, D, E, F, …, Sh, Ch, Ng)",
      ["«D»", "«E»", "«F»", "«G»"], 2, "Ng — 29-harf; 5 qadam surilsa, aylanib A, B, D, E, F ga yetadi")
    q("ota", "Sezar shifri bilan kalit 4 da «SY» yozilgan. Asl soʻz qaysi? "
      "(… N, O, P, Q, R, S, T, U, V, X, Y, …)",
      ["«OT»", "«OQ»", "«PU»", "«NX»"], 0, "S dan 4 qadam orqaga — O, Y dan 4 qadam orqaga — T")
    q("ota", "Morzeda eng koʻpi bilan 4 belgidan iborat nechta har xil kod yasash mumkin?",
      ["16", "24", "30", "32"], 2, "2 + 4 + 8 + 16 = 30")
    q("ota", "Nega Morzeda 26 ta harfga 4 belgigacha boʻlgan kodlar yetadi?",
      ["harflar kam ishlatiladi", "4 belgigacha 30 xil kod bor, bu 26 dan koʻp",
       "har harf 4 belgidan iborat", "pauza qoʻshimcha kod beradi"], 1)
