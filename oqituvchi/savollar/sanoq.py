# -*- coding: utf-8 -*-
"""Sanoq tizimlari (05, 17–22-oʻyinlar) — test savollari."""

BLOK = {"id": "sanoq", "nom": "Sanoq tizimlari", "yosh": [10, 16]}


def savollar(q, M):
    K = lambda kod: '<span class="kod">%s</span>' % kod

    q("orta", "Sanoq tizimining «asosi» nima?",
      ["eng katta son", "nechta har xil raqam ishlatilishi", "xonalar soni", "sonning uzunligi"], 1,
      "10-likda 0–9 — oʻnta raqam, demak asos 10")
    q("orta", "2-lik tizimda nechta raqam ishlatiladi?",
      ["1 ta", "2 ta", "8 ta", "10 ta"], 1,
      "Faqat 0 va 1")
    q("orta", "%s ikkilik soni oʻnlikda nechaga teng?" % K("101"),
      ["3", "5", "6", "101"], 1,
      "4 + 0 + 1 = 5")
    q("orta", "%s ikkilik soni oʻnlikda nechaga teng?" % K("1000"),
      ["4", "8", "10", "16"], 1,
      "Xona qiymatlari 8-4-2-1: faqat 8 yoniq")
    q("orta", "Oʻnlikdagi 6 ikkilikda qanday yoziladi?",
      [K("101"), K("110"), K("011"), K("111")], 1,
      "4 + 2 = 6")
    q("orta", "16-lik tizimda 10 sonini qaysi belgi bildiradi?",
      ["X", "A", "10", "F"], 1,
      "A=10, B=11, … F=15")
    q("orta", "Rim raqamlari qaysi tizimga kiradi?",
      ["pozitsion", "nopozitsion", "ikkilik", "oʻn oltilik"], 1,
      "Rimda belgi qiymati oʻrniga bogʻliq emas: X har joyda 10")

    q("qiyin", "%s oʻn oltilik soni oʻnlikda nechaga teng?" % K("1F"),
      ["25", "31", "16", "115"], 1,
      "1 × 16 + 15 = 31")
    q("qiyin", "Ikkilikda %s nechaga teng?" % K("1011 + 1"),
      [K("1012"), K("1100"), K("1010"), K("1111")], 1,
      "1 + 1 = 10 — koʻchirish ketadi: 1011 + 1 = 1100")
    q("qiyin", "Qaysi tizimda %s ifodasi toʻgʻri boʻladi?" % K("3 + 4 = 10"),
      ["5-likda", "6-likda", "7-likda", "8-likda"], 2,
      "7-likda 7 soni «10» boʻlib yoziladi")
    q("qiyin", "Rang kodi %s nimani bildiradi?" % K("#FF0000"),
      ["qora", "toʻq qizil", "eng yorqin qizil", "oq"], 2,
      "Qizil 255 (FF), yashil va koʻk 0")
    q("qiyin", "Nega kompyuter aynan ikkilik tizimdan foydalanadi?",
      ["ikkilik tezroq", "elektrda ikki holat bor: bor va yoʻq",
       "odamlar shunday kelishgan", "ikkilikda sonlar kichik"], 1,
      "Yoniq/oʻchiq — eng ishonchli ikki holat")

    q("ota", "8 bit bilan eng katta qanday son yoziladi?",
      ["128", "255", "256", "512"], 1,
      "Hamma biti 1 boʻlsa: 2⁸ − 1 = 255")
    q("ota", "Oʻnlikdagi 100 ikkilikda nechta xonadan iborat?",
      ["6", "7", "8", "10"], 1,
      "1100100 — 7 xona (64 + 32 + 4)")
    q("ota", "Ikkilikdagi sonni 2 ga koʻpaytirish uchun nima qilish kerak?",
      ["hamma raqamni ikkiga koʻpaytirish", "oxiriga bitta 0 qoʻshish",
       "boshiga 1 qoʻshish", "teskari yozish"], 1,
      "Oʻnlikda 10 ga koʻpaytirgandek: xonalar bittaga suriladi")
