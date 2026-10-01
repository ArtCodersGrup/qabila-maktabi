# -*- coding: utf-8 -*-
"""Kombinatorika (41–45-oʻyinlar) — test savollari."""

BLOK = {"id": "kombinatorika", "nom": "Kombinatorika", "yosh": [12, 16]}


def savollar(q, M):
    K = lambda kod: '<span class="kod">%s</span>' % kod

    q("orta", "3 ta koʻylak va 4 ta shim bor. Nechta xil kiyinish usuli bor?",
      ["7", "12", "34", "81"], 1,
      "Har qadamda tanlov — koʻpaytiriladi: 3 × 4 = 12")
    q("orta", "Maktabga 3 ta avtobus yoki 2 ta piyoda yoʻl bilan borish mumkin. Nechta yoʻl bor?",
      ["5", "6", "3", "2"], 0,
      "Faqat bittasi tanlanadi — qoʻshiladi: 3 + 2 = 5")
    q("orta", "4 ta bola qatorga tursa, nechta xil tartib boʻladi?",
      ["4", "12", "16", "24"], 3,
      "4! = 4 × 3 × 2 × 1 = 24")
    q("orta", "%s nechaga teng?" % K("5!"),
      ["25", "120", "60", "15"], 1,
      "1 × 2 × 3 × 4 × 5 = 120")
    q("orta", "Tanga 3 marta tashlandi. Nechta xil natija chiqishi mumkin?",
      ["3", "6", "8", "9"], 2,
      "Har tashlashda 2 xil: 2 × 2 × 2 = 8")

    q("qiyin", "5 ta yuguruvchidan oltin, kumush va bronza medal egalari nechta xil boʻlishi mumkin?",
      ["10", "15", "60", "120"], 2,
      "Tartib muhim: 5 × 4 × 3 = 60")
    q("qiyin", "5 boladan 3 kishilik jamoa nechta xil tuziladi?",
      ["10", "15", "60", "120"], 0,
      "Tartib muhim emas: 60 ÷ 3! = 10")
    q("qiyin", "«Tartib muhim» va «tartib muhim emas» holatlarini qanday ajratamiz?",
      ["sonlarning kattaligiga qarab", "ikki narsaning oʻrni almashsa, javob oʻzgaradimi deb soʻrab",
       "masalaning uzunligiga qarab", "har doim tartib muhim"], 1,
      "Oʻrin almashganda boshqa natija chiqsa — tartib muhim (A), chiqmasa — C")
    q("qiyin", "8 ta nuqtadan har ikkisini chiziq bilan tutashtirsak, nechta chiziq chiqadi?",
      ["16", "28", "56", "64"], 1,
      "C(8,2) = 8 × 7 ÷ 2 = 28")
    q("qiyin", "Paskal uchburchagida har bir son qanday topiladi?",
      ["oldingisiga 1 qoʻshib", "tepasidagi ikki sonni qoʻshib",
       "ikkiga koʻpaytirib", "qatordagi sonlarni koʻpaytirib"], 1,
      "Chekkalari 1, ichkarisi — tepasidagi ikkitaning yigʻindisi")

    q("ota", "Paskal uchburchagining 5-qatoridagi sonlar yigʻindisi nechaga teng?",
      ["10", "25", "32", "64"], 2,
      "Har qator yigʻindisi 2ⁿ: 2⁵ = 32")
    q("ota", "13 ta bola bor. Kamida nechtasi bir oyda tugʻilgan boʻlishi shart?",
      ["1", "2", "3", "aniqlab boʻlmaydi"], 1,
      "Dirixle: 12 ta oy, 13 ta bola — biror oyda kamida 2 ta")
    q("ota", "Qorongʻi xonada 4 xil rangdagi paypoqlar bor. Bir xil juft chiqishi uchun kamida nechta olish kerak?",
      ["2", "4", "5", "8"], 2,
      "Eng yomon holat: har rangdan bittadan (4 ta), beshinchisi albatta takrorlanadi")
    q("ota", "%s va %s — bu ikkisi nega teng?" % (K("C(10, 7)"), K("C(10, 3)")),
      ["tasodifan", "7 tani tanlash — 3 tasini qoldirish bilan bir xil",
       "ikkalasi ham 1 ga teng", "teng emas"], 1,
      "C(n,k) = C(n,n−k): tanlangan va qolgan toʻplam bir-birini belgilaydi")
