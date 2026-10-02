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
    # ── Tahlil (2026-10-02): ikki qoida birga, «kamida bitta», cheklovli terish, xatoni topish ──
    # Sonli javoblar python3 da sanab tekshirilgan.
    q("ota", "4 xonali kod: raqamlar takrorlanmaydi va 0 bilan boshlanmaydi. Nechta kod bor?",
      ["4536", "5040", "9000", "10000"], 0,
      "1-xona 9 xil (0 siz), 2-xona 9 xil (0 ham mumkin, lekin birinchisi emas), keyin 8 va 7: 9 × 9 × 8 × 7")
    q("ota", "Toʻrdagi (0, 0) nuqtadan (3, 4) nuqtaga faqat oʻngga yoki yuqoriga bir katak yurib boriladi. Nechta yoʻl bor?",
      ["35", "12", "21", "7"], 0,
      "7 qadamdan 3 tasi «oʻngga» — qaysilari? C(7, 3) = 35")
    q("ota", "10 ta har xil butun son berilgan. Ularning orasida ayirmasi 9 ga boʻlinadigan ikkita son albatta topiladimi?",
      ["ha — qoldiq 9 xil, son esa 10 ta", "yoʻq — bu sonlarga bogʻliq",
       "faqat sonlar ketma-ket kelsa", "faqat ichida 9 ga boʻlinadigan son boʻlsa"], 0,
      "Dirixle: 9 ga boʻlgandagi qoldiq 9 xil, son 10 ta — ikkitasining qoldigʻi bir xil, ayirmasi 9 ga boʻlinadi")
    q("ota", "5 ta bola qatorga turadi, lekin Anvar va Dilnoza doim yonma-yon turishi shart. Nechta tartib bor?",
      ["48", "24", "120", "60"], 0,
      "Ikkalasini bitta «juft» deb olamiz: 4 ta narsa — 4! = 24 tartib; juft ichida ikki xil turish: 24 × 2 = 48")
    q("ota", "3 xonali kodlarning (har xonada 0 dan 9 gacha) nechtasida kamida bitta 7 raqami bor?",
      ["271", "300", "729", "100"], 0,
      "Hammasi 1000 ta; ichida 7 umuman yoʻqlari 9 × 9 × 9 = 729 ta. 1000 − 729 = 271")
    q("qiyin", "Toʻgarakda 4 ta qiz va 3 ta oʻgʻil bor. 2 ta qiz va 1 ta oʻgʻildan iborat jamoa nechta xil tuziladi?",
      ["18", "35", "12", "9"], 0,
      "Qizlar: C(4, 2) = 6; oʻgʻil: 3 xil. Ikkalasi ham kerak (VA): 6 × 3 = 18")
    q("ota", "Oʻquvchi «6 boladan 2 kishilik jamoa nechta?» masalasini 6 × 5 = 30 deb yechdi. Xatosi nimada?",
      ["har jamoani ikki marta sanadi — tartib muhim emas", "6 × 6 deb koʻpaytirishi kerak edi",
       "qoʻshishi kerak edi: 6 + 5", "xato yoʻq, javob 30"], 0,
      "Anvar–Dilnoza va Dilnoza–Anvar — bitta jamoa: 30 ÷ 2 = 15")
    q("ota", "%s nima chiqaradi?" % K("soni = 0  ⏎  for i in range(5):  ⏎      for j in range(i + 1, 5):  ⏎          soni += 1  ⏎  print(soni)"),
      ["10", "20", "25", "15"], 0,
      "j har doim i dan katta — har juftlik bir marta sanaladi: C(5, 2) = 10")
    q("qiyin", "Paskal uchburchagining 6-qatori: 1, 6, 15, 20, 15, 6, 1. 7-qatorning uchinchi soni nechaga teng?",
      ["21", "35", "20", "30"], 0,
      "Har son — tepasidagi ikkitaning yigʻindisi: 6 + 15 = 21 (bu C(7, 2))")
