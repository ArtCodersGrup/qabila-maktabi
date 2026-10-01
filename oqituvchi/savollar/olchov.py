# -*- coding: utf-8 -*-
"""Axborot oʻlchovi — test savollari.

Manba: muallifning `testlar/test-yasa.py` fayli (2026-09-29), oʻyinlarning
DIZAYN.md dagi "Oʻquv maqsadlari" roʻyxatidan tuzilgan. Oʻyinlar: 13-bayt-sandigi … 16-xotira-ombori.
Savol matni oʻzgartirilmagan.
"""

BLOK = {"id": "olchov", "nom": "Axborot oʻlchovi", "yosh": [8, 16]}


def savollar(q, M):
    q("orta", "1 bayt nechta bitdan iborat?",
      ["4", "8", "10", "16"], 1)
    q("orta", "1 baytda nechta har xil naqsh bor?",
      ["8", "64", "128", "256"], 3, "2<sup>8</sup> = 256")
    q("orta", "Klaviaturadagi ≈95 ta belgini kodlash uchun eng kamida nechta bit kerak?",
      ["5", "6", "7", "8"], 2, "2<sup>6</sup> = 64 — yetmaydi, 2<sup>7</sup> = 128 — yetadi")
    q("orta", "3 bayt necha bit?",
      ["12", "16", "24", "32"], 2, "3 × 8 = 24")
    q("orta", "40 bit necha bayt?",
      ["4", "5", "8", "320"], 1, "40 : 8 = 5")
    q("orta", "«Salom» soʻzi xotirada necha bayt joy oladi?",
      ["1", "4", "5", "8"], 2, "Har belgi — 1 bayt, 5 ta harf")
    q("orta", "«Non yeng.» yozuvi necha bayt joy oladi? (boʻsh joy va nuqta ham belgi)",
      ["7", "8", "9", "10"], 2, "N-o-n-‿-y-e-n-g-. = 9 ta belgi")
    q("orta", "1 Kbayt necha bayt?",
      ["100", "1000", "1024", "8192"], 2)
    q("orta", "1 Kbayt nega aynan 1024 bayt?",
      ["chiroyli son", "2 ni 10 marta koʻpaytirgandagi son, 1000 ga eng yaqini",
       "1000 ning yaxlitlangani", "tasodifan tanlangan"], 1, "2<sup>10</sup> = 1024")
    q("orta", "Oq-qora rasmda har bir piksel necha bit joy oladi?",
      ["1", "3", "8", "24"], 0, "Faqat ikki holat: oq yoki qora")
    q("orta", "8 × 8 katakli oq-qora rasm necha bit?",
      ["16", "32", "64", "128"], 2, "8 × 8 = 64 piksel, har biri 1 bit")
    q("orta", "8 × 8 katakli oq-qora rasm necha bayt?",
      ["4", "8", "16", "64"], 1, "64 bit : 8 = 8 bayt")
    q("orta", "Ekrandagi rangli piksel necha bayt joy oladi?",
      ["1", "2", "3", "8"], 2, "Qizil, yashil va koʻk uchun bittadan bayt")
    q("orta", "1 Mbayt necha Kbayt?",
      ["100", "1000", "1024", "2048"], 2)
    q("qiyin", "2 Kbayt necha bayt?",
      ["2000", "2024", "2048", "2096"], 2, "2 × 1024")
    q("qiyin", "5 Kbayt necha bayt?",
      ["5000", "5120", "5124", "5200"], 1, "5 × 1024")
    q("qiyin", "3072 bayt necha Kbayt?",
      ["2", "3", "3,5", "30"], 1, "3072 : 1024 = 3")
    q("qiyin", "Bir sahifada 2000 ta belgi bor. 10 sahifa taxminan necha Kbayt?",
      ["2 Kbayt", "20 Kbayt", "200 Kbayt", "2000 Kbayt"], 1, "20 000 bayt : 1024 ≈ 19,5")
    q("qiyin", "16 rangli rasmda har bir piksel necha bit joy oladi?",
      ["2", "3", "4", "8"], 2, "2<sup>4</sup> = 16")
    q("qiyin", "256 rangli rasmda har bir piksel necha bit joy oladi?",
      ["4", "6", "8", "16"], 2, "2<sup>8</sup> = 256")
    q("qiyin", "10 × 10 pikselli, 4 rangli rasm necha bit?",
      ["100", "200", "400", "800"], 1, "100 piksel × 2 bit")
    q("qiyin", "20 × 10 pikselli rangli rasm (har piksel 3 bayt) necha bayt?",
      ["200", "400", "600", "1200"], 2, "200 piksel × 3 bayt")
    q("qiyin", "1 Mbayt necha bayt?",
      ["1 000 000", "1 024 000", "1 048 576", "1 100 000"], 2, "1024 × 1024")
    q("qiyin", "Multfilmda 1 soniyada 24 kadr. 5 soniyada nechta kadr boʻladi?",
      ["29", "96", "120", "144"], 2, "24 × 5")
    q("qiyin", "Videoda 12 kadr/soniya. 150 ta kadr necha soniya davom etadi?",
      ["10", "12", "12,5", "15"], 2, "150 : 12 = 12,5")
    q("qiyin", "Videoning har bir kadri 2 Mbayt. 10 kadr necha Mbayt?",
      ["12", "20", "24", "200"], 1, "2 × 10")
    q("qiyin", "1 Gbayt necha Mbayt?",
      ["100", "1000", "1024", "1048"], 2)
    q("qiyin", "2048 Mbayt necha Gbayt?",
      ["1", "2", "4", "20"], 1, "2048 : 1024 = 2")
    q("qiyin", "Qaysi biri katta: 2000 Mbayt yoki 1 Gbayt?",
      ["2000 Mbayt", "1 Gbayt", "teng", "solishtirib boʻlmaydi"], 0, "1 Gbayt = 1024 Mbayt")
    q("ota", "100 × 100 pikselli rangli rasm (har piksel 3 bayt) taxminan necha Kbayt?",
      ["10 Kbayt", "29 Kbayt", "30 Kbayt", "300 Kbayt"], 1, "30 000 bayt : 1024 ≈ 29,3")
    q("ota", "640 × 480 pikselli, 256 rangli rasm necha Kbayt?",
      ["150 Kbayt", "300 Kbayt", "307 Kbayt", "600 Kbayt"], 1,
      "307 200 piksel × 1 bayt : 1024 = 300")
    q("ota", "25 kadr/soniyali 8 soniyalik video. Har kadri 128 Kbayt. Video necha Mbayt?",
      ["20 Mbayt", "25 Mbayt", "26 Mbayt", "200 Mbayt"], 1,
      "200 kadr × 128 Kbayt = 25 600 Kbayt : 1024 = 25")
    q("ota", "4 Gbayt xotiraga har biri 8 Mbayt boʻlgan nechta surat sigʻadi?",
      ["128", "256", "512", "1024"], 2, "4 × 1024 : 8 = 512")
    q("ota", "1 Tbayt necha Gbayt?",
      ["100", "1000", "1024", "1048"], 2)
    q("ota", "Doʻkondagi «1 Tbayt» disk kompyuterda nega 931 Gbayt koʻrinadi?",
      ["bir qismi buzuq boʻladi", "doʻkon 1000 bilan, kompyuter 1024 bilan sanaydi",
       "tizim qolganini egallaydi", "bu xato, aslida 1024 Gbayt"], 1,
      "1 000 000 000 000 : 1024 : 1024 : 1024 ≈ 931")
    q("ota", "Qaysi biri katta: 1 500 000 bayt yoki 1 Mbayt?",
      ["1 500 000 bayt", "1 Mbayt", "teng", "solishtirib boʻlmaydi"], 0, "1 Mbayt = 1 048 576 bayt")
    q("ota", "2 Mbaytlik xotiraga har biri 4 Kbayt boʻlgan nechta fayl sigʻadi?",
      ["128", "256", "512", "1024"], 2, "2 × 1024 : 4 = 512")
