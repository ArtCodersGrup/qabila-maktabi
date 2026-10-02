# Oʻqituvchi uchun: chop etiladigan test

`test-yasa.py` savollar bankidan **A4 ga chop etiladigan test** yasaydi: savollar daraja va blok
boʻyicha tartiblanadi, oxirgi sahifada **javoblar kaliti va qisqa yechimlar** boʻladi.

Faqat `python3` kerak — kutubxona ham, internet ham shart emas.

## Ishlatish

```bash
python3 oqituvchi/test-yasa.py --royxat          # qanday bloklar bor, nechta savol
python3 oqituvchi/test-yasa.py                   # hamma blok → oqituvchi/test.html
python3 oqituvchi/test-yasa.py --blok python,algoritm --soni 20
python3 oqituvchi/test-yasa.py --daraja orta --soni 15
python3 oqituvchi/test-yasa.py --variant 2       # test-A.html va test-B.html (nusxa koʻchirishga qarshi)
python3 oqituvchi/test-yasa.py --tekshir         # savollarni tekshiradi, HTML yasamaydi
```

Yasalgan faylni brauzerda ochib, **Ctrl + P** (Mac: ⌘P) bilan chop etasiz yoki PDF qilib saqlaysiz.
Yasalgan `test*.html` fayllari git ga kirmaydi — ular har safar qaytadan yasaladi.

| Bayroq | Nima qiladi |
| --- | --- |
| `--blok` | qaysi bloklar (vergul bilan); boʻsh — hammasi |
| `--daraja` | `orta`, `qiyin`, `ota` |
| `--soni` | jami nechta savol (bloklar va darajalardan tengroq olinadi) |
| `--variant` | nechta variant; har birining savollari boshqa tartibda va javoblari boshqa harfda |
| `--urug` | tasodif urugʻi: bir xil urugʻ — bir xil test (qayta chop etish uchun) |
| `--chiqish` | fayl nomi (sukut: `oqituvchi/test.html`) |

## Savol qoʻshish

Har blokning savollari `savollar/<blok>.py` faylida:

```python
BLOK = {"id": "python", "nom": "Python: dasturlash", "yosh": [12, 16]}

def savollar(q, M):
    q("orta", "Savol matni?", ["A varianti", "B", "C", "D"], 1, "qisqa izoh")
    #   daraja   savol          toʻrtta variant         ↑ toʻgʻri javob raqami (0 dan)
```

- **Daraja:** `orta`, `qiyin`, `ota`.
- **Toʻgʻri javob** — roʻyxatdagi oʻrni (0 dan sanaladi). Chop etishda variantlar aralashtiriladi,
  shuning uchun toʻgʻri javob har doim bir joyda turmaydi.
- **Izoh** — javoblar kalitidagi qisqa yechim (ixtiyoriy, lekin tavsiya qilinadi).
- `M("···")` — Morze kodi uchun; kod parchasi uchun `'<span class="kod">…</span>'`.
- Tutuq belgisi **ʻ** (U+02BB) va **ʼ** (U+02BC) boʻlishi kerak — `--tekshir` buni ushlaydi.

Yangi blok qoʻshish: `savollar/` ga yangi fayl qoʻying — generator uni oʻzi topadi.
`node --test oqituvchi/tests/` tekshiradi.

## Savollar qayerdan olingan

Dastlabki 100 ta savol — muallifning `testlar/test-yasa.py` fayli (2026-09-29), oʻyinlarning
`DIZAYN.md` dagi «Oʻquv maqsadlari» roʻyxatidan tuzilgan. Qolganlari shu uslubda yozildi:
Python kod savollarining javoblari `python3` da tekshirilgan.

**Tahlil qatlami (2026-10-02).** 12–16 yosh bloklariga (python, algoritm, kombinatorika) 30 ta savol qoʻshildi —
jami 194 → 224. Ular bitta amalni eslashni emas, **qadamlarni yurgizish** va **xatoni topish** ni soʻraydi:
ikki oʻzgaruvchili kuzatuv, `b = a` (ikki nom — bitta roʻyxat), «qaysi satr aybdor?», ikkilik izlash va pufakcha
saralashni qoʻlda bajarish, ikki qoida birga keladigan sanash masalalari. Kod javoblari `python3` da ham, saytning
oʻz talqinchisida ham tekshirilgan. Hozirgi sonlar: `python3 oqituvchi/test-yasa.py --royxat`.
