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
    # ── Tahlil (2026-10-02): algoritmni qoʻlda yurgizish va xatoni topish ──
    # Sonli javoblar python3 da va saytning oʻz talqinchisida tekshirilgan.
    q("ota", "Tartiblangan roʻyxat %s da ikkilik izlash 23 ni qidiradi. Nechta solishtirishdan keyin topadi?"
      % K("[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]"),
      ["1", "2", "3", "4"], 2,
      "Oʻrtalar: 16 (kichik) → 56 (katta) → 23 (topildi) — 3 ta solishtirish")
    q("ota", "Pufakcha saralash %s roʻyxatida bitta toʻliq oʻtishni bajardi. Roʻyxat qanday boʻldi?" % K("[5, 1, 4, 2, 8]"),
      [K("[1, 4, 2, 5, 8]"), K("[1, 2, 4, 5, 8]"), K("[5, 1, 4, 2, 8]"), K("[1, 5, 4, 2, 8]")], 0,
      "Qoʻshnilar: 5↔1, 5↔4, 5↔2, 5·8 — eng kattasi oxiriga chiqdi, qolgani hali tartibsiz")
    q("ota", "Dastur n = 1000 da 1 000 000 qadam, n = 2000 da 4 000 000 qadam qiladi. n = 8000 da taxminan nechta?",
      ["16 000 000", "32 000 000", "64 000 000", "8 000 000"], 2,
      "n ikki barobar → qadam toʻrt barobar (O(n²)). 2000 → 8000 — ikki marta ikkilanish: 4 000 000 × 4 × 4")
    q("ota", "Tartiblangan roʻyxat %s da ikkilik izlash 6 ni qidiradi. U qaysi sonlarga ketma-ket qaraydi?"
      % K("[3, 6, 9, 12, 15, 18, 21]"),
      ["12, keyin 6", "3, keyin 6", "12, 9, keyin 6", "faqat 6"], 0,
      "Avval oʻrtadagi 12 (katta) — oʻng yarmi tashlanadi; qolgan 3, 6, 9 ning oʻrtasi — 6")
    q("ota", "Pufakcha saralash %s roʻyxatini toʻliq saralaguncha jami nechta almashtirish qiladi?" % K("[4, 3, 2, 1]"),
      ["3", "4", "6", "12"], 2,
      "Teskari roʻyxatda har juftlik notoʻgʻri turibdi: 3 + 2 + 1 = 6 ta almashtirish")
    q("qiyin", "Chiziqli izlash %s roʻyxatida 4 ni nechanchi solishtirishda topadi?" % K("[7, 2, 9, 4, 5]"),
      ["3-solishtirishda", "4-solishtirishda", "5-solishtirishda", "1-solishtirishda"], 1,
      "Boshidan birma-bir: 7, 2, 9, 4 — toʻrtinchisida topildi")
    q("ota", "Bu ikkilik izlash baʼzan hech qachon toʻxtamaydi. Qaysi satr aybdor? %s"
      % K("while chap < ong:  ⏎      orta = (chap + ong) // 2  ⏎      if a[orta] < x:  ⏎          chap = orta  ⏎      else:  ⏎          ong = orta"),
      [K("chap = orta"), K("ong = orta"), K("orta = (chap + ong) // 2"), K("while chap < ong")], 0,
      "chap va ong qoʻshni boʻlganda orta = chap chiqadi: chap = orta oraliqni toraytirmaydi. chap = orta + 1 kerak")
    q("ota", "Tanlash saralashi %s roʻyxatida birinchi oʻtishni bajardi (eng kichigini topib, boshiga qoʻydi). Roʻyxat qanday boʻldi?"
      % K("[5, 1, 4, 2]"),
      [K("[1, 5, 4, 2]"), K("[1, 4, 2, 5]"), K("[1, 2, 4, 5]"), K("[5, 1, 4, 2]")], 0,
      "Eng kichigi (1) birinchi oʻrindagi 5 bilan joy almashadi; 4 va 2 joyida qoladi")
    q("qiyin", "Bu sikl necha marta aylanadi? %s" % K("i = 1  ⏎  while i < 1000:  ⏎      i = i * 2"),
      ["10 marta", "9 marta", "500 marta", "999 marta"], 0,
      "i har safar ikkilanadi: 2¹⁰ = 1024 — oʻninchi aylanishdan keyin shart yolgʻon. Bu — logarifmik oʻsish")
