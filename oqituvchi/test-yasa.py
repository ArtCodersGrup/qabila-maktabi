#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Qabila maktabi — oʻqituvchi uchun chop etiladigan test yasaydi.

Savollar `savollar/` papkasidagi blok fayllarida turadi (har blok — bitta fayl).
Hech qanday kutubxona kerak emas, internet ham shart emas: faqat python3.

    python3 oqituvchi/test-yasa.py                       # hamma blok, hamma daraja
    python3 oqituvchi/test-yasa.py --royxat              # qanday bloklar bor
    python3 oqituvchi/test-yasa.py --blok python,algoritm --daraja qiyin --soni 20
    python3 oqituvchi/test-yasa.py --variant 2           # ikki xil variant (nusxa koʻchirmasin)
    python3 oqituvchi/test-yasa.py --tekshir             # savollarni tekshiradi, HTML yasamaydi

Natija: `oqituvchi/test.html` (brauzerda ochib, Ctrl + P bilan PDF qilinadi yoki chop etiladi).
Javoblar kaliti va qisqa yechimlar oxirgi sahifada — uni oʻquvchiga bermaslik kerak.
"""
import argparse
import html as H
import importlib.util
import pathlib
import random
import sys

SAVOLLAR_YOLI = pathlib.Path(__file__).parent / "savollar"
DARAJA = [("orta", "Oʻrtacha"), ("qiyin", "Qiyin"), ("ota", "Oʻta qiyin")]
DARAJA_NOM = dict(DARAJA)
HARF = "ABCD"
NOTOGRI_BELGI = "'\u2019`\u00b4"  # ekranda ʻ (U+02BB) va ʼ (U+02BC) ishlatiladi — QOIDALAR §7


def morze(kod):
    """Morze kodi — monoshriftda, belgilari ajralib tursin."""
    return '<span class="morze">%s</span>' % kod


def bloklarni_oqi():
    """savollar/*.py fayllarini yuklaydi. Har faylda BLOK va savollar(q, M) boʻlishi kerak."""
    chiqdi = []
    for yol in sorted(SAVOLLAR_YOLI.glob("*.py")):
        if yol.name.startswith("_"):
            continue
        spec = importlib.util.spec_from_file_location("savollar_" + yol.stem, yol)
        modul = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(modul)
        blok = dict(modul.BLOK)
        royxat = []

        def q(daraja, savol, variantlar, togri, izoh="", _r=royxat, _b=blok):
            _r.append({"blok": _b["id"], "daraja": daraja, "savol": savol,
                       "variantlar": list(variantlar), "togri": togri, "izoh": izoh})

        modul.savollar(q, morze)
        blok["savollar"] = royxat
        chiqdi.append(blok)
    return chiqdi


def tekshir(bloklar):
    """Savollardagi xatolarni topadi. Boʻsh roʻyxat — hammasi joyida."""
    xatolar = []
    korilgan = {}
    for blok in bloklar:
        for k, s in enumerate(blok["savollar"], 1):
            joy = "%s/%d" % (blok["id"], k)
            if s["daraja"] not in DARAJA_NOM:
                xatolar.append("%s: notanish daraja «%s»" % (joy, s["daraja"]))
            if len(s["variantlar"]) != 4:
                xatolar.append("%s: %d ta variant (4 ta boʻlishi kerak)" % (joy, len(s["variantlar"])))
            if len(set(s["variantlar"])) != len(s["variantlar"]):
                xatolar.append("%s: variantlar takrorlangan" % joy)
            if not 0 <= s["togri"] < len(s["variantlar"]):
                xatolar.append("%s: toʻgʻri javob raqami notoʻgʻri (%s)" % (joy, s["togri"]))
            if len(s["savol"]) < 8:  # "1 bit nima?" — qisqa, lekin to'liq savol
                xatolar.append("%s: savol juda qisqa" % joy)
            for belgi in NOTOGRI_BELGI:
                if belgi in s["savol"] or belgi in s["izoh"]:
                    xatolar.append("%s: notoʻgʻri tutuq belgisi «%s» (ʻ yoki ʼ kerak)" % (joy, belgi))
                    break
            oldin = korilgan.get(s["savol"])
            if oldin:
                xatolar.append("%s: savol %s dagi bilan bir xil" % (joy, oldin))
            korilgan[s["savol"]] = joy
    return xatolar


def tanla(bloklar, kerakli_bloklar, kerakli_darajalar, soni, rnd):
    """Berilgan shart boʻyicha savollarni yigʻadi. soni — jami savollar soni (0 — hammasi)."""
    hamma = []
    for blok in bloklar:
        if kerakli_bloklar and blok["id"] not in kerakli_bloklar:
            continue
        for s in blok["savollar"]:
            if kerakli_darajalar and s["daraja"] not in kerakli_darajalar:
                continue
            hamma.append(s)
    if soni and soni < len(hamma):
        # Har blok va darajadan tengroq olish uchun guruhlab aralashtiramiz
        guruh = {}
        for s in hamma:
            guruh.setdefault((s["daraja"], s["blok"]), []).append(s)
        for lst in guruh.values():
            rnd.shuffle(lst)
        tanlangan, k = [], 0
        kalitlar = sorted(guruh)
        while len(tanlangan) < soni:
            bosh = True
            for key in kalitlar:
                if k < len(guruh[key]) and len(tanlangan) < soni:
                    tanlangan.append(guruh[key][k])
                    bosh = False
            if bosh:
                break
            k += 1
        hamma = tanlangan
    return hamma


def joylashtir(savollar, rnd):
    """Variantlarni aralashtiradi: toʻgʻri javob A, B, C, D boʻylab tengroq tarqaladi."""
    joylar = [k % 4 for k in range(len(savollar))]
    rnd.shuffle(joylar)
    chiqdi = []
    for k, s in enumerate(savollar):
        qolgan = [v for i, v in enumerate(s["variantlar"]) if i != s["togri"]]
        rnd.shuffle(qolgan)
        joy = joylar[k]
        yangi = qolgan[:joy] + [s["variantlar"][s["togri"]]] + qolgan[joy:]
        chiqdi.append(dict(s, variantlar=yangi, togri=joy))
    return chiqdi


USLUB = """@font-face { font-family: "Nunito"; src: url("../oyinlar/umumiy/fonts/Nunito.woff2") format("woff2"); font-weight: 200 1000; }
  @page { size: A4; margin: 14mm 13mm 16mm 13mm; }
  @page { @bottom-center { content: counter(page); } }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "Nunito", "Helvetica Neue", Arial, sans-serif;
         font-size: 10.2pt; line-height: 1.3; color: #1b1b24; }
  h1 { margin: 0 0 2mm; font-size: 19pt; }
  .bosh { border-bottom: 2px solid #2F6FDE; padding-bottom: 3mm; margin-bottom: 4mm; }
  .bosh p { margin: 1mm 0 0; font-size: 9.4pt; color: #55555f; }
  .qoida { background: #f4f7fd; border-left: 3px solid #2F6FDE; padding: 2.5mm 3mm;
            margin: 0 0 4mm; font-size: 9.4pt; }
  h2.daraja { font-size: 13.5pt; margin: 6mm 0 2mm; padding: 1.6mm 3mm; color: #fff;
               background: #2F6FDE; border-radius: 2mm; break-after: avoid; }
  h2.daraja .son { float: right; font-size: 9.5pt; font-weight: 600; opacity: .85; }
  h3.mavzu { font-size: 11pt; margin: 4mm 0 1.5mm; color: #2F6FDE;
              border-bottom: 1px solid #c9d8f2; padding-bottom: 1mm; break-after: avoid; }
  ol.savollar { margin: 0; padding-left: 7mm; }
  ol.savollar > li { margin-bottom: 2.6mm; break-inside: avoid; }
  .matn { font-weight: 700; }
  ul.variantlar { list-style: none; margin: 0.8mm 0 0; padding: 0;
                   display: grid; grid-template-columns: 1fr 1fr; gap: 0.4mm 4mm; }
  ul.variantlar li { font-size: 9.8pt; }
  .harf { display: inline-block; min-width: 4.6mm; font-weight: 800; color: #2F6FDE; }
  sup { font-size: 72%; }
  .morze { font-family: Menlo, "SF Mono", Consolas, monospace; letter-spacing: 0.14em;
            font-size: 10.6pt; white-space: nowrap; }
  .kod { font-family: Menlo, "SF Mono", Consolas, monospace; font-size: 9.6pt;
         background: #f4f7fd; padding: 0 0.6mm; border-radius: 0.8mm; }
  .kalit { break-before: page; }
  table.kalit-jadval { border-collapse: collapse; width: 100%; margin-top: 2mm; font-size: 10pt; }
  table.kalit-jadval td { border: 1px solid #c9d8f2; padding: 1.4mm 1mm; text-align: center; }
  table.kalit-jadval td b { color: #55555f; font-weight: 700; margin-right: 1mm; }
  ol.izohlar { columns: 2; column-gap: 7mm; margin: 2mm 0 0; padding: 0; list-style: none;
                font-size: 9pt; line-height: 1.35; }
  ol.izohlar li { break-inside: avoid; margin-bottom: 0.8mm; }
  .oyoq { margin-top: 5mm; font-size: 8.6pt; color: #77777f; }"""


def html_yasa(savollar, bloklar, variant_nomi):
    nomlar = {b["id"]: b["nom"] for b in bloklar}
    tartib = []
    for dkod, _ in DARAJA:
        for blok in bloklar:
            tartib += [s for s in savollar if s["daraja"] == dkod and s["blok"] == blok["id"]]
    nomer = {id(s): k + 1 for k, s in enumerate(tartib)}

    qismlar = []
    for dkod, dnom in DARAJA:
        dl = [s for s in tartib if s["daraja"] == dkod]
        if not dl:
            continue
        qismlar.append('<h2 class="daraja">%s <span class="son">%d ta savol</span></h2>' % (dnom, len(dl)))
        for blok in bloklar:
            ml = [s for s in dl if s["blok"] == blok["id"]]
            if not ml:
                continue
            qismlar.append('<h3 class="mavzu">%s</h3>' % nomlar[blok["id"]])
            qismlar.append('<ol class="savollar">')
            for s in ml:
                opts = "".join('<li><span class="harf">%s)</span> %s</li>' % (HARF[i], v)
                               for i, v in enumerate(s["variantlar"]))
                qismlar.append('<li value="%d"><div class="matn">%s</div><ul class="variantlar">%s</ul></li>'
                               % (nomer[id(s)], s["savol"], opts))
            qismlar.append("</ol>")

    kalit_qatorlar = []
    for k in range(0, len(tartib), 10):
        kataklar = "".join('<td><b>%d</b> %s</td>' % (nomer[id(s)], HARF[s["togri"]]) for s in tartib[k:k + 10])
        kalit_qatorlar.append("<tr>%s</tr>" % kataklar)

    izohlar = ['<li><b>%d.</b> %s — %s</li>' % (nomer[id(s)], HARF[s["togri"]], s["izoh"])
               for s in tartib if s["izoh"]]

    blok_nomlari = " · ".join(nomlar[b["id"]] for b in bloklar
                              if any(s["blok"] == b["id"] for s in tartib))
    sarlavha = "Qabila maktabi — test" + (" (%s variant)" % variant_nomi if variant_nomi else "")
    return """<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="utf-8">
<title>%s</title>
<style>
%s
</style>
</head>
<body>
  <div class="bosh">
    <h1>%s</h1>
    <p>%s — jami %d ta savol</p>
  </div>
  <div class="qoida">
    <b>Koʻrsatma.</b> Har bir savolda toʻrtta javob bor, ulardan faqat bittasi toʻgʻri.
    Toʻgʻri javob harfini (A, B, C yoki D) belgilang. Hisob-kitob talab qiladigan savollarda
    qoralama ishlatish mumkin, kalkulyator kerak emas.
  </div>
  %s

  <div class="kalit">
    <h2 class="daraja">Javoblar kaliti <span class="son">oʻqituvchi uchun</span></h2>
    <table class="kalit-jadval">%s</table>
    <h3 class="mavzu">Qisqa yechimlar</h3>
    <ol class="izohlar">%s</ol>
    <p class="oyoq">Savollar «Qabila maktabi» oʻyinlarining oʻquv maqsadlaridan tuzilgan. kelajagim.uz</p>
  </div>
</body>
</html>
""" % (H.escape(sarlavha), USLUB, H.escape(sarlavha), blok_nomlari, len(tartib),
       "".join(qismlar), "".join(kalit_qatorlar), "".join(izohlar))


def main(argv=None):
    p = argparse.ArgumentParser(description="Qabila maktabi — chop etiladigan test yasaydi")
    p.add_argument("--blok", default="", help="bloklar, vergul bilan (boʻsh — hammasi)")
    p.add_argument("--daraja", default="", help="orta, qiyin, ota (vergul bilan)")
    p.add_argument("--soni", type=int, default=0, help="savollar soni (0 — hammasi)")
    p.add_argument("--variant", type=int, default=1, help="nechta variant yasalsin")
    p.add_argument("--urug", type=int, default=20261001, help="tasodif urugʻi (bir xil urugʻ — bir xil test)")
    p.add_argument("--chiqish", default="oqituvchi/test.html", help="yasaladigan fayl")
    p.add_argument("--tekshir", action="store_true", help="faqat savollarni tekshiradi")
    p.add_argument("--royxat", action="store_true", help="bloklar va savollar sonini koʻrsatadi")
    a = p.parse_args(argv)

    bloklar = bloklarni_oqi()
    xatolar = tekshir(bloklar)
    if xatolar:
        print("Savollarda xato bor:", file=sys.stderr)
        for x in xatolar:
            print("  ✗ " + x, file=sys.stderr)
        return 1

    jami = sum(len(b["savollar"]) for b in bloklar)
    if a.tekshir:
        print("Tekshirildi: %d ta blok, %d ta savol — xato yoʻq." % (len(bloklar), jami))
        return 0

    if a.royxat:
        print("%-16s %-34s %s" % ("blok", "nom", "savollar (orta/qiyin/ota)"))
        for b in bloklar:
            sanoq = [sum(1 for s in b["savollar"] if s["daraja"] == d) for d, _ in DARAJA]
            print("%-16s %-34s %d  (%d/%d/%d)" % (b["id"], b["nom"], len(b["savollar"]), *sanoq))
        print("%-16s %-34s %d" % ("", "JAMI", jami))
        return 0

    kerakli_bloklar = [x.strip() for x in a.blok.split(",") if x.strip()]
    kerakli_darajalar = [x.strip() for x in a.daraja.split(",") if x.strip()]
    nomalum = [x for x in kerakli_bloklar if x not in {b["id"] for b in bloklar}]
    if nomalum:
        print("Bunday blok yoʻq: %s. --royxat bilan koʻring." % ", ".join(nomalum), file=sys.stderr)
        return 1

    yol = pathlib.Path(a.chiqish)
    for v in range(a.variant):
        rnd = random.Random(a.urug + v * 977)
        tanlangan = tanla(bloklar, kerakli_bloklar, kerakli_darajalar, a.soni, rnd)
        if not tanlangan:
            print("Bu shartga mos savol topilmadi.", file=sys.stderr)
            return 1
        tanlangan = joylashtir(tanlangan, rnd)
        nomi = HARF[v] if a.variant > 1 else ""
        fayl = yol if a.variant == 1 else yol.with_name(yol.stem + "-" + HARF[v] + yol.suffix)
        fayl.parent.mkdir(parents=True, exist_ok=True)
        fayl.write_text(html_yasa(tanlangan, bloklar, nomi), encoding="utf-8")
        print("Yasaldi: %s — %d ta savol%s" % (fayl, len(tanlangan), (" (variant %s)" % nomi) if nomi else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
