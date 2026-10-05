# O'yin oxirida boshlovchi yuborgan "holat" paketidan natija jadvali (sof funksiya).
# Paket reyting tartibida keladi: ids[0] — birinchi o'rin. O'yinchi kaliti — yashirin raqam; ism faqat
# shu sinf a'zosi bo'lgan kirgan bola uchun qo'yiladi (kimlar), qolganlar — mehmon (ism yo'q).
from .xona_qoidalari import kimlik

MAYDONLAR = {
    "tog": {"pog": "pogona", "tgr": "togri", "xat": "xato", "chiq": "chiqdi"},
    "poyga": {"orin": "orin", "cpm": "cpm", "aniq": "aniq", "ms": "ms"},
    "tank": {"jon": "jon", "tg": "tegdi", "tirik": "tirik"},
}
META = {"tog": "tog", "poyga": "tur", "tank": None}


def natija_ol(kind: str, data: dict, kimlar: dict):
    if kind not in MAYDONLAR or not isinstance(data, dict):
        return None
    ids = data.get("ids")
    if not isinstance(ids, list) or not 1 <= len(ids) <= 12 or not all(kimlik(k) for k in ids):
        return None
    n = len(ids)
    for k in MAYDONLAR[kind]:
        v = data.get(k)
        if not isinstance(v, list) or len(v) != n or not all(isinstance(x, (int, float)) and not isinstance(x, bool) for x in v):
            return None
    meta = {}
    m = data.get(META[kind]) if META[kind] else None
    if isinstance(m, str) and kimlik(m):
        meta[META[kind]] = m
    rows = []
    for i, key in enumerate(ids):
        kim = kimlar.get(key) or {}
        row = {"user_id": kim.get("user_id"), "ism": kim.get("ism"), "orin": i + 1}
        for k, nom in MAYDONLAR[kind].items():
            v = data[k][i]
            row[nom] = bool(v) if nom in ("chiqdi", "tirik") else (int(v) if nom == "orin" else round(v))
        rows.append(row)
    return meta, rows
