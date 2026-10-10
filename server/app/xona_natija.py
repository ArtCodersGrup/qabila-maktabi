# O'yin oxirida boshlovchi yuborgan "holat" paketidan natija jadvali (sof funksiya).
# Paket reyting tartibida keladi: ids[0] — birinchi o'rin. O'yinchi kaliti — yashirin raqam; ism faqat
# shu sinf a'zosi bo'lgan kirgan bola uchun qo'yiladi (kimlar), qolganlar — mehmon (ism yo'q).
from .xona_qoidalari import kimlik

MAX_MAVZU = 24


def mavzu_ol(data):
    """Boshlovchining "mavzu" xabari: bitta o'yinchining shu o'yindagi mavzu bo'yicha hisobi.
    {id, m: [mavzu], t: [to'g'ri], x: [xato]} → (kalit, {mavzu: [t, x]}) yoki None."""
    if not isinstance(data, dict) or not kimlik(data.get("id")):
        return None
    m, t, x = data.get("m"), data.get("t"), data.get("x")
    if not all(isinstance(v, list) for v in (m, t, x)) or not len(m) == len(t) == len(x) <= MAX_MAVZU:
        return None
    if not all(kimlik(v) for v in m):
        return None
    if not all(isinstance(v, int) and not isinstance(v, bool) and 0 <= v <= 10000 for v in t + x):
        return None
    return data["id"], {k: [a, b] for k, a, b in zip(m, t, x)}


MAYDONLAR = {
    "tog": {"pog": "pogona", "tgr": "togri", "xat": "xato", "chiq": "chiqdi"},
    "poyga": {"orin": "orin", "cpm": "cpm", "aniq": "aniq", "ms": "ms"},
    "tank": {"jon": "jon", "tg": "tegdi", "tirik": "tirik"},
    # Qal'a: jamoa (0 — Oy, 1 — Quyosh), jamoa ochkosi, bola yiqitgan devorlar soni
    "qala": {"jam": "jamoa", "och": "ochko", "dev": "devor"},
}
META = {"tog": "tog", "poyga": "tur", "tank": None, "qala": "golib"}
MAX_IDS = {"qala": 30}  # qolganlarida 12


def natija_ol(kind: str, data: dict, kimlar: dict, mavzular: dict | None = None):
    if kind not in MAYDONLAR or not isinstance(data, dict):
        return None
    ids = data.get("ids")
    if not isinstance(ids, list) or not 1 <= len(ids) <= MAX_IDS.get(kind, 12) or not all(kimlik(k) for k in ids):
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
    qah = data.get("qah")
    if not (isinstance(qah, list) and len(qah) == n and all(kimlik(v) for v in qah)):
        qah = None  # qahramon rangi — ixtiyoriy (o'qituvchi ro'yxatida ism yonida)
    rows = []
    for i, key in enumerate(ids):
        kim = kimlar.get(key) or {}
        row = {"user_id": kim.get("user_id"), "ism": kim.get("ism"), "orin": i + 1}
        for k, nom in MAYDONLAR[kind].items():
            v = data[k][i]
            row[nom] = bool(v) if nom in ("chiqdi", "tirik") else (int(v) if nom == "orin" else round(v))
        if qah:
            row["rang"] = qah[i]
        if mavzular and key in mavzular:
            row["mavzular"] = mavzular[key]
        rows.append(row)
    return meta, rows
