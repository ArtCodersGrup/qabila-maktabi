# -*- coding: utf-8 -*-
"""Algoritmlar va samaradorlik (36–40-oʻyinlar) — test savollari."""

BLOK = {"id": "algoritm", "nom": "Algoritmlar va samaradorlik", "yosh": [12, 16]}


def savollar(q, M):
    K = lambda kod: '<span class="kod">%s</span>' % kod

    q("orta", "Algoritmning «natijaviylik» xossasi nimani bildiradi?",
      ["chiroyli yozilganini", "qancha kutsang ham tugashini",
       "har qanday son bilan ishlashini", "tushunarli ekanini"], 1,
      "Natijaviylik — algoritm chekli qadamda tugaydi va javob beradi")
    q("orta", "Algoritmning «ommaviylik» xossasi nima?",
      ["faqat bitta misolga yarashi", "oʻxshash masalalarning hammasiga yarashi",
       "hamma tushunishi", "tez ishlashi"], 1,
      "Ommaviylik — bir xil turdagi hamma masalani yechadi")
    q("orta", "Blok-sxemada romb (olmos) nimani bildiradi?",
      ["boshlanish", "amal", "shart (savol)", "tugash"], 2,
      "Rombdan ikki yoʻl chiqadi: ha va yoʻq")
    q("orta", "Chiziqli izlash nima qiladi?",
      ["roʻyxatni saralaydi", "birinchisidan boshlab birma-bir qaraydi",
       "oʻrtasidan boshlaydi", "eng kattasini oladi"], 1,
      "Har elementni navbat bilan tekshiradi")
    q("orta", "Ikkilik izlash qanday roʻyxatda ishlaydi?",
      ["har qanday roʻyxatda", "faqat tartiblangan roʻyxatda",
       "faqat sonlar roʻyxatida", "faqat qisqa roʻyxatda"], 1,
      "Oʻrtadagi sondan kattami-kichikmi deb boʻlish uchun tartib kerak")
    q("orta", "100 ta tartiblangan son ichidan bittasini ikkilik izlash bilan topish uchun koʻpi bilan nechta savol kerak?",
      ["7", "10", "50", "100"], 0,
      "Har savol yarmini tashlaydi: 2⁷ = 128 > 100")

    q("qiyin", "Pufakcha saralashda roʻyxat ikki barobar uzaysa, qadamlar soni taxminan qanday oʻzgaradi?",
      ["oʻzgarmaydi", "ikki barobar ortadi", "toʻrt barobar ortadi", "ikki barobar kamayadi"], 2,
      "Ikki qavat sikl: n² — n ikki barobar boʻlsa, qadam 4 barobar")
    q("qiyin", "%s — bu nimani bildiradi?" % K("O(n)"),
      ["dastur n soniya ishlaydi", "n oshsa, qadam ham shuncha barobar oshadi",
       "n ta xato bor", "n ta oʻzgaruvchi kerak"], 1,
      "O belgisi oʻsish tezligini aytadi, aniq sonni emas")
    q("qiyin", "Qaysi oʻsish eng tez (eng yomon)?",
      [K("O(1)"), K("O(log n)"), K("O(n)"), K("O(n²)")], 3,
      "n² eng tez oʻsadi — katta n da eng sekin ishlaydi")
    q("qiyin", "1 000 000 ta tartiblangan son ichidan bittasini topish kerak. Qaysi usul maʼqul?",
      ["chiziqli izlash", "ikkilik izlash", "pufakcha saralash", "farqi yoʻq"], 1,
      "Chiziqli — million qadam, ikkilik — 20 ta")
    q("qiyin", "1 dan 1 000 000 gacha yigʻindini topishning eng tez yoʻli qaysi?",
      ["sikl bilan qoʻshish", "formula bilan: n(n+1)/2", "roʻyxatga yigʻish", "saralash"], 1,
      "Formula bitta amalda javob beradi — O(1)")

    q("ota", "Bir xil masalaning ikki yechimi bor: biri 203 qadam, ikkinchisi 2 qadam qiladi. Bu nimani koʻrsatadi?",
      ["birinchisi notoʻgʻri", "ikkalasi toʻgʻri, lekin samaradorligi har xil",
       "ikkinchisi faqat kichik sonlarga ishlaydi", "qadamlar sonining ahamiyati yoʻq"], 1,
      "Toʻgʻri ishlash va yaxshi ishlash — boshqa-boshqa narsa")
    q("ota", "Nega dasturning tezligini soniyada emas, qadamda oʻlchaymiz?",
      ["soniyani oʻlchash qiyin", "kompyuterlar har xil tez — soniya har joyda boshqacha chiqadi",
       "qadam chiroyliroq", "soniya faqat kattalar uchun"], 1,
      "Qadam — qurilmaga bogʻliq emas")
    q("ota", "%s boʻlgan dastur n = 10 da 300 qadam qilsa, n = 20 da taxminan nechta qadam qiladi?" % K("O(n²)"),
      ["600", "900", "1200", "300"], 2,
      "n ikki barobar → qadam toʻrt barobar: 300 × 4 = 1200")
