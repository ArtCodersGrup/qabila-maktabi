# 86 — Amaliy: soʻrovnoma tahlili: dizayn

**Mavzu:** mini loyiha — sinf soʻrovnomasini tozalash, funksiyalar bilan hisoblash, xulosa · **Sinf:** IX (toifa `yuqori`), 14-dars (1-amaliy)
**Qurilma:** kompyuter (💻, `pc: true`) · **Reja:** `docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md`

## Oʻquv maqsadlari
Oʻyindan keyin oʻquvchi:
1. Roʻyxatdagi xato qiymatlarni `for` + `if` bilan olib tashlaydi (oraliq, boʻsh javob, har xil yozuv, takror, juft roʻyxatlar).
2. `ortacha`, `sanash`, `eng_kop` (moda) va shunga oʻxshash yordamchi funksiyalarni yozadi.
3. Tozalash → hisob → xulosa zanjirini bitta dasturda yigʻadi va qoʻyilgan savolga son bilan asoslangan javob chiqaradi.
4. Bitta xato qiymat oʻrtachani buzishini, kichik tanlanmadan keng xulosa chiqarib boʻlmasligini, maxfiylik qoidasini biladi.

## Bosqichlar
| № | Nom | Oʻquvchi nima qiladi | Bank |
|---|---|---|---|
| 1 | Tozalash | muharrirda `yoshlar = [...]` turadi; `for` + `if` bilan toza roʻyxat yigʻib chiqaradi | `CLEAN`, 8 tur (zina 0/1/2 — 2/3/3), maydonlar almashadi |
| 2 | Funksiyalar | funksiyani yozadi, sayt uni chaqiradi | `FUNCS`, 10 tur (3/3/4) |
| 3 | Xulosa | savol + maʼlumot + tayyor funksiyalar; tozalaydi, hisoblaydi, 3 satrli hisobot chiqaradi | `REPORT`, 9 tur (3/3/3) |

## Tekshiruv — yashirin maʼlumot toʻplamlari
- 1- va 3-bosqich: kod boshidagi `nom = [...]` satri 4–5 ta boshqa toʻplam bilan almashtiriladi (`swapData`), har safar
  chiqish namunali yechimniki bilan solishtiriladi. Satr raqamlari siljimaydi. Toʻplamlar: chegaradagi qiymatlar
  (`lo`, `hi`, `lo−1`, `hi+1`), hammasi xato, hammasi toʻgʻri, tasodifiy. 3-bosqichda xulosaning har ikki javobi uchraydi.
- 2-bosqich: `print(chaqiruv)` — 6–7 chaqiruv, ikkitasi koʻrinadi.
- Javobni qoʻlda yozish, tozalamaslik, `>`/`>=` chalkashligi — testlarda ushlanishi tekshirilgan.

## Talqinchi cheklovlari
`round`, `list.count`, `list.sort`, `list.remove`, `str.strip`, lugʻat, `import` yoʻq — shuning uchun `sanash` va `eng_kop`
qoʻlda yoziladi (bu oʻquv maqsadiga mos), oʻrtachalar esa uzun kasr chiqmasligi uchun 4/5/8 ta toʻgʻri javobli toʻplamlarda hisoblanadi.
