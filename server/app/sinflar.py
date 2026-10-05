# /api/sinflar — o'qituvchi sinf ochadi, o'quvchi akkauntlarini yaratadi, so'rovlarni qabul qiladi, progressni ko'radi.
# O'quvchi sinf kodi bilan qo'shiladi. Har o'qituvchi faqat o'z sinfini ko'radi (admin — hammasini).
import re
import secrets
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import text
from starlette.concurrency import run_in_threadpool

from . import parol, sessiya
from .deps import db, faol
from .hisob import ism_toza

router = APIRouter(prefix="/api/sinflar")

KOD_ALIFBO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"  # 0/O va 1/I/L yo'q — doskadan o'qish oson
MAX_SINF, MAX_AZO, MAX_YARATISH = 30, 60, 40


def yangi_kod() -> str:
    return "".join(secrets.choice(KOD_ALIFBO) for _ in range(6))


def login_asos(ism: str) -> str:
    s = ism.lower()
    for a, b in (("oʻ", "o"), ("gʻ", "g"), ("o'", "o"), ("g'", "g"), ("o‘", "o"), ("g‘", "g")):
        s = s.replace(a, b)
    birinchi = re.split(r"[^a-zʻʼ'‘’`]+", s.strip())[0]
    harflar = re.sub(r"[^a-z]", "", birinchi)[:8]
    return harflar or "oquvchi"


def bir_martalik() -> str:
    return f"{secrets.randbelow(10 ** 6):06d}"


async def oqituvchi(u=Depends(faol)):
    if u["rol"] not in ("teacher", "admin"):
        raise HTTPException(403, "ruxsat-yoq")
    return u


async def _sinf(conn, sid: int, u) -> dict:
    r = (await conn.execute(text("select id, nom, kod, oqituvchi_id from sinflar where id = :s"), {"s": sid})).mappings().first()
    if r is None or (u["rol"] != "admin" and r["oqituvchi_id"] != u["id"]):
        raise HTTPException(404, "topilmadi")
    return dict(r)


class Nom(BaseModel):
    nom: str = Field(max_length=80)


class Ismlar(BaseModel):
    ismlar: list[str] = Field(max_length=MAX_YARATISH)


class Qaror(BaseModel):
    qaror: Literal["qabul", "rad"]


class Kod(BaseModel):
    kod: str = Field(max_length=20)


# ---------- O'quvchi ----------

@router.post("/qoshil")
async def qoshil(body: Kod, request: Request, u=Depends(faol), conn=Depends(db)):
    if not u["ism"]:
        raise HTTPException(400, "ism-kerak")
    cl, k = request.app.state.cheklov_login, f"kod:{u['id']}"
    if cl.bandmi(k):
        raise HTTPException(429, "kop-urinish")
    s = (await conn.execute(text("select id, nom from sinflar where kod = :k"), {"k": body.kod.strip().upper()})).mappings().first()
    if s is None:
        cl.xato(k)
        raise HTTPException(404, "kod-notogri")
    bor = (await conn.execute(text("select 1 from sinf_azolari where sinf_id = :s and user_id = :u"), {"s": s["id"], "u": u["id"]})).first()
    if bor:
        raise HTTPException(409, "allaqachon")
    soni = (await conn.execute(text("select count(*) from sinf_azolari where sinf_id = :s"), {"s": s["id"]})).scalar()
    if soni >= MAX_AZO:
        raise HTTPException(409, "sinf-toʻla")
    await conn.execute(text("insert into sinf_azolari(sinf_id, user_id, holat) values (:s, :u, 'sorov')"), {"s": s["id"], "u": u["id"]})
    await conn.commit()
    return {"sinf": {"nom": s["nom"]}}


@router.get("/meniki")
async def meniki(u=Depends(faol), conn=Depends(db)):
    rows = await conn.execute(text(
        "select s.nom, o.ism as oqituvchi, a.holat from sinf_azolari a join sinflar s on s.id = a.sinf_id "
        "join users o on o.id = s.oqituvchi_id where a.user_id = :u order by a.yaratilgan"), {"u": u["id"]})
    return {"sinflar": [dict(r) for r in rows.mappings()]}


# ---------- O'qituvchi ----------

@router.get("")
async def royxat(u=Depends(oqituvchi), conn=Depends(db)):
    rows = await conn.execute(text(
        "select s.id, s.nom, s.kod, "
        "count(a.user_id) filter (where a.holat = 'qabul') as soni, "
        "count(a.user_id) filter (where a.holat = 'sorov') as sorovlar "
        "from sinflar s left join sinf_azolari a on a.sinf_id = s.id "
        "where s.oqituvchi_id = :u group by s.id order by s.id"), {"u": u["id"]})
    return {"sinflar": [dict(r) for r in rows.mappings()]}


@router.post("")
async def yarat(body: Nom, u=Depends(oqituvchi), conn=Depends(db)):
    nom = " ".join(body.nom.split())
    if not 1 <= len(nom) <= 40:
        raise HTTPException(400, "nom-notogri")
    soni = (await conn.execute(text("select count(*) from sinflar where oqituvchi_id = :u"), {"u": u["id"]})).scalar()
    if soni >= MAX_SINF:
        raise HTTPException(409, "sinf-kop")
    for _ in range(20):
        kod = yangi_kod()
        if not (await conn.execute(text("select 1 from sinflar where kod = :k"), {"k": kod})).first():
            break
    sid = (await conn.execute(text("insert into sinflar(oqituvchi_id, nom, kod) values (:u, :n, :k) returning id"),
                              {"u": u["id"], "n": nom, "k": kod})).scalar()
    await conn.commit()
    return {"sinf": {"id": sid, "nom": nom, "kod": kod}}


@router.get("/{sid}")
async def sinf(sid: int, u=Depends(oqituvchi), conn=Depends(db)):
    s = await _sinf(conn, sid, u)
    rows = (await conn.execute(text(
        "select u.id, u.ism, u.login, u.email, u.oxirgi_kirish, (u.kim_yaratgan = :o) as meniki, a.holat "
        "from sinf_azolari a join users u on u.id = a.user_id where a.sinf_id = :s order by u.ism, u.id"),
        {"s": sid, "o": s["oqituvchi_id"]})).mappings().all()
    oquvchilar = [{"id": r["id"], "ism": r["ism"], "login": r["login"], "email": r["email"],
                   "oxirgi_kirish": r["oxirgi_kirish"].isoformat() if r["oxirgi_kirish"] else None, "meniki": bool(r["meniki"])}
                  for r in rows if r["holat"] == "qabul"]
    sorovlar = [{"id": r["id"], "ism": r["ism"], "email": r["email"]} for r in rows if r["holat"] == "sorov"]
    return {"sinf": {"id": s["id"], "nom": s["nom"], "kod": s["kod"]}, "oquvchilar": oquvchilar, "sorovlar": sorovlar}


async def _login_top(conn, asos: str) -> str:
    for _ in range(50):
        login = f"{asos}{secrets.randbelow(10 ** 4):04d}"
        if not (await conn.execute(text("select 1 from users where login = :l"), {"l": login})).first():
            return login
    raise HTTPException(500, "login-topilmadi")


@router.post("/{sid}/oquvchilar")
async def oquvchi_qosh(sid: int, body: Ismlar, u=Depends(oqituvchi), conn=Depends(db)):
    s = await _sinf(conn, sid, u)
    ismlar = [ism_toza(i) for i in body.ismlar]
    if not ismlar or any(i is None for i in ismlar):
        raise HTTPException(400, "ismlar-notogri")
    soni = (await conn.execute(text("select count(*) from sinf_azolari where sinf_id = :s"), {"s": sid})).scalar()
    if soni + len(ismlar) > MAX_AZO:
        raise HTTPException(409, "sinf-toʻla")
    yangi = []
    for ism in ismlar:
        login = await _login_top(conn, login_asos(ism))
        p = bir_martalik()
        xesh = await run_in_threadpool(parol.xeshla, p)
        uid = (await conn.execute(text(
            "insert into users(login, parol_xesh, ism, parol_almashtirsin, kim_yaratgan) values (:l, :x, :i, true, :k) returning id"),
            {"l": login, "x": xesh, "i": ism, "k": s["oqituvchi_id"]})).scalar()
        await conn.execute(text("insert into sinf_azolari(sinf_id, user_id, holat) values (:s, :u, 'qabul')"), {"s": sid, "u": uid})
        yangi.append({"id": uid, "ism": ism, "login": login, "parol": p})
    await conn.commit()
    return {"yangi": yangi}


@router.post("/{sid}/oquvchilar/{uid}/parol")
async def parol_tikla(sid: int, uid: int, u=Depends(oqituvchi), conn=Depends(db)):
    s = await _sinf(conn, sid, u)
    r = (await conn.execute(text(
        "select u.id, u.ism, u.login, u.kim_yaratgan from users u join sinf_azolari a on a.user_id = u.id "
        "where a.sinf_id = :s and u.id = :i and a.holat = 'qabul'"), {"s": sid, "i": uid})).mappings().first()
    if r is None:
        raise HTTPException(404, "topilmadi")
    if r["login"] is None or (u["rol"] != "admin" and r["kim_yaratgan"] != s["oqituvchi_id"]):
        raise HTTPException(403, "ruxsat-yoq")
    p = bir_martalik()
    xesh = await run_in_threadpool(parol.xeshla, p)
    await conn.execute(text("update users set parol_xesh = :x, parol_almashtirsin = true where id = :i"), {"x": xesh, "i": uid})
    await sessiya.boshqalarini_yop(conn, uid, "")  # hamma qurilmadagi kirish yopiladi
    await conn.commit()
    return {"id": r["id"], "ism": r["ism"], "login": r["login"], "parol": p}


@router.post("/{sid}/sorovlar/{uid}")
async def sorov_qaror(sid: int, uid: int, body: Qaror, u=Depends(oqituvchi), conn=Depends(db)):
    await _sinf(conn, sid, u)
    if body.qaror == "qabul":
        q = "update sinf_azolari set holat = 'qabul' where sinf_id = :s and user_id = :u and holat = 'sorov' returning user_id"
    else:
        q = "delete from sinf_azolari where sinf_id = :s and user_id = :u and holat = 'sorov' returning user_id"
    if (await conn.execute(text(q), {"s": sid, "u": uid})).scalar() is None:
        raise HTTPException(404, "topilmadi")
    await conn.commit()
    return {"ok": True}


@router.post("/{sid}/chiqar/{uid}")
async def chiqar(sid: int, uid: int, u=Depends(oqituvchi), conn=Depends(db)):
    await _sinf(conn, sid, u)
    if (await conn.execute(text("delete from sinf_azolari where sinf_id = :s and user_id = :u returning user_id"),
                           {"s": sid, "u": uid})).scalar() is None:
        raise HTTPException(404, "topilmadi")
    await conn.commit()
    return {"ok": True}


@router.get("/{sid}/progress")
async def sinf_progressi(sid: int, u=Depends(oqituvchi), conn=Depends(db)):
    await _sinf(conn, sid, u)
    rows = await conn.execute(text(
        "select p.user_id, p.kalit, p.qiymat from progress p join sinf_azolari a on a.user_id = p.user_id "
        "where a.sinf_id = :s and a.holat = 'qabul'"), {"s": sid})
    out: dict = {}
    for r in rows:
        out.setdefault(str(r.user_id), {})[r.kalit] = r.qiymat
    return {"oquvchilar": out}
