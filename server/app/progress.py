# Progress: o'yin bosqichlari, masalalar holati va rekordlar. Birlashtirish faqat shu yerda (sof funksiyalar):
# bosqich tugagani va qiyin rejim — YOKI, yulduz va rekord — eng kattasi. Hech narsa yo'qolmaydi.
import json
import re

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field
from sqlalchemy import text

from .deps import db, faol

router = APIRouter(prefix="/api/progress")

_OYIN = re.compile(r"[a-z0-9-]{1,40}:v\d{1,3}")
_MASALA_ID = re.compile(r"[a-z0-9_-]{1,40}")
MASALALAR = "masalalar:holat:v1"
REKORD = "on-barmoq:rekord"
MAVZULAR = "tog:mavzular:v1"  # Tog' savollari mavzu bo'yicha: { mavzu: { t: to'g'ri, x: xato } }


def _butun(v, lo, hi):
    return isinstance(v, int) and not isinstance(v, bool) and lo <= v <= hi


def _bosqichlar(q):
    if not isinstance(q, dict):
        return None
    done, stars, hard = q.get("done"), q.get("stars"), q.get("hard")
    if not all(isinstance(x, list) for x in (done, stars, hard)):
        return None
    n = len(done)
    if not 1 <= n <= 30 or len(stars) != n or len(hard) != n:
        return None
    if not all(isinstance(x, bool) for x in done + hard) or not all(_butun(s, 0, 3) for s in stars):
        return None
    return {"done": done, "stars": stars, "hard": hard}


def _masalalar(q):
    if not isinstance(q, dict) or len(q) > 500:
        return None
    out = {}
    for k, v in q.items():
        if not _MASALA_ID.fullmatch(str(k)) or not isinstance(v, dict):
            return None
        foiz, urinish, ochilgan = v.get("foiz", 0), v.get("urinish", 0), v.get("ochilgan", [])
        if not _butun(foiz, 0, 100) or not _butun(urinish, 0, 100000) or not isinstance(ochilgan, list):
            return None
        out[k] = {"foiz": foiz, "yechilgan": v.get("yechilgan") is True, "urinish": urinish,
                  "ochilgan": sorted({x for x in ochilgan if _butun(x, 1, 1000)})[:50]}
    return out


def _rekord(q):
    if isinstance(q, bool) or not isinstance(q, (int, float)) or not 1 <= q <= 3000:
        return None
    return round(q)


def _mavzular(q):
    if not isinstance(q, dict) or len(q) > 40:
        return None
    out = {}
    for k, v in q.items():
        if not _MASALA_ID.fullmatch(str(k)) or not isinstance(v, dict):
            return None
        t, x = v.get("t", 0), v.get("x", 0)
        if not _butun(t, 0, 10 ** 6) or not _butun(x, 0, 10 ** 6):
            return None
        out[k] = {"t": t, "x": x}
    return out


def tozala(kalit, q):
    if kalit == MAVZULAR:
        return _mavzular(q)
    if kalit == MASALALAR:
        return _masalalar(q)
    if kalit == REKORD:
        return _rekord(q)
    if _OYIN.fullmatch(kalit):
        return _bosqichlar(q)
    return None


def birlashtir(kalit, eski, yangi):
    y = tozala(kalit, yangi)
    if y is None:
        return None
    e = tozala(kalit, eski) if eski is not None else None
    if e is None:
        return y
    if kalit == REKORD:
        return max(e, y)
    if kalit == MAVZULAR:
        out = dict(e)
        for k, v in y.items():
            w = out.get(k)
            out[k] = v if w is None else {"t": max(w["t"], v["t"]), "x": max(w["x"], v["x"])}
        return out
    if kalit == MASALALAR:
        out = dict(e)
        for k, v in y.items():
            w = out.get(k)
            out[k] = v if w is None else {
                "foiz": max(w["foiz"], v["foiz"]), "yechilgan": w["yechilgan"] or v["yechilgan"],
                "urinish": max(w["urinish"], v["urinish"]), "ochilgan": sorted(set(w["ochilgan"]) | set(v["ochilgan"]))[:50]}
        return out
    if len(e["done"]) != len(y["done"]):
        return y  # o'yinning bosqichlari soni o'zgargan — yangisi
    return {"done": [a or b for a, b in zip(e["done"], y["done"])],
            "stars": [max(a, b) for a, b in zip(e["stars"], y["stars"])],
            "hard": [a or b for a, b in zip(e["hard"], y["hard"])]}


async def hammasi(conn, user_id: int) -> dict:
    rows = await conn.execute(text("select kalit, qiymat from progress where user_id = :u"), {"u": user_id})
    return {r.kalit: r.qiymat for r in rows}


class Sinxron(BaseModel):
    kalitlar: dict = Field(default_factory=dict, max_length=200)


@router.post("")
async def sinxron(body: Sinxron, request: Request, u=Depends(faol), conn=Depends(db)):
    if body.kalitlar:
        bor = await hammasi(conn, u["id"])
        for kalit, q in body.kalitlar.items():
            yangi = birlashtir(str(kalit), bor.get(kalit), q)
            if yangi is None or yangi == bor.get(kalit):
                continue
            await conn.execute(text(
                "insert into progress(user_id, kalit, qiymat) values (:u, :k, cast(:q as jsonb)) "
                "on conflict (user_id, kalit) do update set qiymat = excluded.qiymat, yangilangan = now()"),
                {"u": u["id"], "k": kalit, "q": json.dumps(yangi)})
        await conn.commit()
    return {"kalitlar": await hammasi(conn, u["id"])}
