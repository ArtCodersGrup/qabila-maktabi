# -*- coding: utf-8 -*-
"""Ikkilik kod — test savollari.

Manba: muallifning `testlar/test-yasa.py` fayli (2026-09-29), oʻyinlarning
DIZAYN.md dagi "Oʻquv maqsadlari" roʻyxatidan tuzilgan. Oʻyinlar: 04-qabila-chiroqlari.
Savol matni oʻzgartirilmagan.
"""

BLOK = {"id": "ikkilik", "nom": "Ikkilik kod", "yosh": [8, 16]}


def savollar(q, M):
    q("orta", "3 ta chiroq (har biri yoniq yoki oʻchiq) bilan nechta har xil naqsh yasaladi?",
      ["3", "6", "8", "9"], 2, "2<sup>3</sup> = 8")
    q("orta", "5 ta chiroq bilan nechta har xil naqsh yasaladi?",
      ["10", "16", "25", "32"], 3, "2<sup>5</sup> = 32")
    q("orta", "Ikkilik 101 soni oʻnlikda nechaga teng?",
      ["3", "5", "6", "101"], 1, "4 + 0 + 1 = 5")
    q("orta", "Ikkilik 1101 soni oʻnlikda nechaga teng?",
      ["11", "12", "13", "14"], 2, "8 + 4 + 0 + 1 = 13")
    q("orta", "Oʻnlik 6 soni ikkilikda qanday yoziladi?",
      ["101", "110", "011", "111"], 1, "4 + 2 = 6")
    q("orta", "Oʻnlik 10 soni ikkilikda qanday yoziladi?",
      ["1001", "1010", "1100", "1110"], 1, "8 + 2 = 10")
    q("orta", "Ikkilik sonda 8-4-2-1 sonlari nimani bildiradi?",
      ["chiroqlar soni", "har bir xonaning qiymati", "kalitni", "rangni"], 1)
    q("orta", "4 ta narsaning har biriga alohida kod berish uchun eng kamida nechta chiroq kerak?",
      ["1", "2", "3", "4"], 1, "2<sup>2</sup> = 4")
    q("orta", "10 ta narsa uchun eng kamida nechta chiroq kerak?",
      ["3", "4", "5", "10"], 1, "2<sup>3</sup> = 8 — yetmaydi, 2<sup>4</sup> = 16 — yetadi")
    q("orta", "Har bir chiroq 3 xil rangda yona olsa, 2 ta chiroq bilan nechta naqsh yasaladi?",
      ["4", "6", "8", "9"], 3, "3<sup>2</sup> = 9")
    q("orta", "1 bit nima?",
      ["8 ta chiroq", "bitta yoniq/oʻchiq holat", "bitta harf", "1024 bayt"], 1)
    q("orta", "Ikkilikda eng katta 4 xonali son (1111) oʻnlikda nechaga teng?",
      ["8", "14", "15", "16"], 2, "8 + 4 + 2 + 1 = 15")
    q("qiyin", "7 ta chiroq bilan nechta har xil naqsh yasaladi?",
      ["49", "64", "128", "256"], 2, "2<sup>7</sup> = 128")
    q("qiyin", "Ikkilik 11011 soni oʻnlikda nechaga teng?",
      ["25", "26", "27", "29"], 2, "16 + 8 + 0 + 2 + 1 = 27")
    q("qiyin", "Oʻnlik 25 soni ikkilikda qanday yoziladi?",
      ["10101", "11001", "11010", "10011"], 1, "16 + 8 + 1 = 25")
    q("qiyin", "Oʻnlik 100 soni ikkilikda qanday yoziladi?",
      ["1010100", "1100100", "1110100", "1100010"], 1, "64 + 32 + 4 = 100")
    q("qiyin", "4 ta chiroqning har biri 3 xil holatda boʻlsa (oʻchiq, qizil, koʻk), nechta naqsh yasaladi?",
      ["12", "27", "64", "81"], 3, "3<sup>4</sup> = 81")
    q("qiyin", "200 ta narsani kodlash uchun eng kamida nechta bit kerak?",
      ["7", "8", "9", "100"], 1, "2<sup>7</sup> = 128 &lt; 200, 2<sup>8</sup> = 256 ≥ 200")
    q("qiyin", "Ikkilik 10000 soni oʻnlikda nechaga teng?",
      ["8", "10", "16", "32"], 2)
    q("qiyin", "Chiroqlar soniga yana bitta chiroq qoʻshilsa, naqshlar soni qanday oʻzgaradi?",
      ["1 taga ortadi", "2 taga ortadi", "2 barobar ortadi", "oʻzgarmaydi"], 2)
    q("qiyin", "Ikkilik 111111 (oltita bir) oʻnlikda nechaga teng?",
      ["36", "48", "63", "64"], 2, "64 − 1 = 63")
    q("qiyin", "Oʻnlik 63 sonini ikkilikda yozish uchun nechta xona kerak?",
      ["5", "6", "7", "8"], 1, "111111 — 6 ta xona")
    q("qiyin", "Har biri 4 holatli 2 ta chiroq nechta ikkilik chiroqqa teng?",
      ["2", "3", "4", "8"], 2, "4<sup>2</sup> = 16 = 2<sup>4</sup>")
    q("qiyin", "Bir baytdagi eng katta son oʻnlikda nechaga teng?",
      ["128", "254", "255", "256"], 2, "11111111 = 256 − 1")
    q("ota", "Ikkilik 10110101 soni oʻnlikda nechaga teng?",
      ["165", "173", "181", "191"], 2, "128 + 32 + 16 + 4 + 1")
    q("ota", "Oʻnlik 200 soni ikkilikda qanday yoziladi?",
      ["10101000", "11000100", "11001000", "11010000"], 2, "128 + 64 + 8 = 200")
    q("ota", "Har biri 4 holatli 3 ta chiroq nechta naqsh beradi va bu necha bitga teng?",
      ["12 naqsh, 4 bit", "64 naqsh, 6 bit", "64 naqsh, 8 bit", "81 naqsh, 6 bit"], 1,
      "4<sup>3</sup> = 64 = 2<sup>6</sup>")
    q("ota", "1000 ta narsani kodlash uchun eng kamida nechta bit kerak?",
      ["8", "9", "10", "16"], 2, "2<sup>9</sup> = 512 &lt; 1000, 2<sup>10</sup> = 1024 ≥ 1000")
    q("ota", "n ta chiroq 1024 ta naqsh bersa, n nechaga teng?",
      ["8", "9", "10", "12"], 2, "2<sup>10</sup> = 1024")
    q("ota", "Ikkilik sonning oxirgi raqami 0 boʻlsa, bu son qanday boʻladi?",
      ["juft", "toq", "manfiy", "aniqlab boʻlmaydi"], 0, "Oxirgi xona qiymati 1; u 0 boʻlsa qolgani juft")
