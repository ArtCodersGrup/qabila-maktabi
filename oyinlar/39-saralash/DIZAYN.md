# 39 — Saralash: dizayn

**Mavzu:** pufakcha va tanlash saralashi; nega qadamlar toʻrt barobar oʻsadi
**Yosh:** 12–16 · **Qurilma:** kompyuter (💻) · **Taxminiy davomiyligi:** 30 daqiqa
**Holati:** kod yozildi, testlar yashil — muallif koʻrib chiqishini kutmoqda (2026-10-01)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Blok rejasi: [`../umumiy/ALGORITM-BLOK.md`](../umumiy/ALGORITM-BLOK.md).
Blokdagi oʻrni: `38` Izlash → **39** → `40` Qadamlar soni.

> Hammasini birdan tartibga solish shart emas. Faqat **qoʻshni ikkitasini** solishtirish yetadi —
> va butun roʻyxat oʻzi joyiga tushadi.

## 1. Oʻquv maqsadlari

1. Pufakcha saralash qoidasini aytadi: qoʻshnilarni solishtir, chapdagisi katta boʻlsa — almashtir.
2. Bir toʻliq oʻtishdan keyin **eng katta son oxiriga chiqishini** biladi va roʻyxatni oldindan aytadi.
3. Tanlash saralashini tushuntiradi: qolganidan eng kichigini topib oldinga qoʻyish.
4. Ikkala usulni Python'da yozadi (`sarala(a)` roʻyxatning oʻzini oʻzgartiradi).
5. Jadvalni oʻqiydi: roʻyxat ikki barobar uzaysa, qadamlar **toʻrt barobar** oshadi — sababi ikki qavat sikl.
6. Izlash bilan farqini aytadi: u yerda ikki barobar edi, bu yerda toʻrt barobar.

## 2. Men qabul qilgan qarorlar

1. **Bola oʻzi bir oʻtishni bajaradi.** 1-bosqichda har juftlik uchun "almashtiramizmi?" deb soʻraladi — qoida keyin aytiladi (QOIDALAR §4.1: avval qildir, keyin nomla).
2. **Ustunlar balandlik bilan.** Son ham yoziladi — faqat rangga tayanilmaydi (QOIDALAR §6: holat belgi bilan ham koʻrsatiladi).
3. **Oʻlchovda roʻyxat bitta satrda** (38-oʻyindagidek): shunda faqat saralash qadamlari oʻlchanadi.
4. **Eng yomon holat oʻlchanadi** — teskari tartibdagi roʻyxat. Shunda oʻsish qonuniyati aniq koʻrinadi.

## 3. Oʻlchangan natija (2026-10-01)

| Roʻyxat uzunligi | Pufakcha | Tanlash |
|---|---|---|
| 5 | 61 | 53 |
| 10 | 246 | 172 |
| 20 | 991 | 597 |
| 40 | 3 981 | 2 197 |

n ikki barobar → qadam **toʻrt barobar**. Ikkala usul ham bir xil tartibda oʻsadi; tanlash kamroq almashtiradi, shuning uchun biroz tejamli.

## 4. Oʻyin oqimi

```
Bosh ekran
   ├─► 1-bosqich: Pufakcha        [bola bir oʻtishni oʻzi bajaradi → qoida → mashq 3]
   ├─► 2-bosqich: Bir oʻtish      [kod → bir oʻtishdan keyingi roʻyxatni aytish → mashq 3]
   └─► 3-bosqich: Tanlash va oʻlchov [tanlash qadam-baqadam → jadval → ikkala kodni yozish] → tabrik
```

## 5. Kod tuzilishi

```
39-saralash/
├── js/logic.js    pufakQadamlar, tanlashQadamlar (har qadam yozib boriladi),
│                  o'lchov va jadval, savollar, ikkita kod yozish masalasi
├── js/game-art.js aralash ustunlar rasmi
├── js/scenes/…    kirish, uch bosqich, tabrik
└── tests/logic.test.js (12 ta)
```
