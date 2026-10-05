# /api/hisob — kirish, chiqish, men, parol, profil, o'qituvchi so'rovi.
import re

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field
from sqlalchemy import text
from starlette.concurrency import run_in_threadpool

from . import config, parol, sessiya
from .deps import db, faol, kirgan

router = APIRouter(prefix="/api/hisob")

# Ism: harf bilan boshlanadi; keyin harf, bo'sh joy va . ' ʻ ʼ ‘ ’ ` - (masalan "Ali K.", "Oʻgʻiloy T.")
_ISM = re.compile(r"[^\W\d_][^\W\d_ .'ʻʼ‘’`-]*(?:[ .'ʻʼ‘’`-]+[^\W\d_]*)*\.?")


def ism_toza(s: str):
    if any(ord(ch) < 32 for ch in s):  # yangi qator, tab — bitta qatorli ism emas
        return None
    s = " ".join(s.split())
    return s if 2 <= len(s) <= 40 and _ISM.fullmatch(s) else None


class KirishSorov(BaseModel):
    login: str = Field(max_length=40)
    parol: str = Field(max_length=200)


class ParolSorov(BaseModel):
    eski: str = Field("", max_length=200)
    yangi: str = Field(max_length=200)


class ProfilSorov(BaseModel):
    ism: str = Field(max_length=80)


async def _men(conn, request, token=None):
    return {"user": sessiya.korinish(await sessiya.kim(conn, token or request.cookies.get(sessiya.COOKIE)))}


@router.get("/sozlama")
async def sozlama():
    return {"google": config.google() is not None}


@router.get("/men")
async def men(u=Depends(kirgan)):
    return {"user": sessiya.korinish(u)}


@router.post("/kirish")
async def kirish(body: KirishSorov, request: Request, response: Response, conn=Depends(db)):
    login = body.login.strip().lower()
    kl = "login:" + login
    ip = "ip:" + (request.client.host if request.client else "?")
    cl, ci = request.app.state.cheklov_login, request.app.state.cheklov_ip
    if cl.bandmi(kl) or ci.bandmi(ip):
        raise HTTPException(429, "kop-urinish")
    r = (await conn.execute(text("select id, parol_xesh from users where login = :l"), {"l": login})).first()
    xesh = r.parol_xesh if r is not None and r.parol_xesh else parol.SOXTA
    ok = await run_in_threadpool(parol.tekshir, xesh, body.parol)
    if r is None or not r.parol_xesh or not ok:
        cl.xato(kl)
        ci.xato(ip)
        raise HTTPException(401, "notogri")
    cl.tozala(kl)
    token = await sessiya.och(conn, r.id)
    await conn.commit()
    sessiya.cookie_qoy(response, token)
    return await _men(conn, request, token)


@router.post("/chiqish")
async def chiqish(request: Request, response: Response, conn=Depends(db)):
    await sessiya.yop(conn, request.cookies.get(sessiya.COOKIE))
    await conn.commit()
    sessiya.cookie_ochir(response)
    return {"ok": True}


@router.post("/parol")
async def parol_almashtir(body: ParolSorov, request: Request, u=Depends(kirgan), conn=Depends(db)):
    if not parol.yaxshimi(body.yangi):
        raise HTTPException(400, "parol-qisqa")
    if not u["parol_almashtirsin"]:
        xesh = (await conn.execute(text("select parol_xesh from users where id = :i"), {"i": u["id"]})).scalar()
        if not xesh:
            raise HTTPException(400, "parol-yoq")
        cl, k = request.app.state.cheklov_login, f"parol:{u['id']}"
        if cl.bandmi(k):
            raise HTTPException(429, "kop-urinish")
        if not await run_in_threadpool(parol.tekshir, xesh, body.eski):
            cl.xato(k)
            raise HTTPException(400, "eski-notogri")
    yangi = await run_in_threadpool(parol.xeshla, body.yangi)
    await conn.execute(text("update users set parol_xesh = :x, parol_almashtirsin = false where id = :i"), {"x": yangi, "i": u["id"]})
    await sessiya.boshqalarini_yop(conn, u["id"], request.cookies.get(sessiya.COOKIE))
    await conn.commit()
    return await _men(conn, request)


@router.post("/profil")
async def profil(body: ProfilSorov, request: Request, u=Depends(faol), conn=Depends(db)):
    ism = ism_toza(body.ism)
    if ism is None:
        raise HTTPException(400, "ism-notogri")
    await conn.execute(text("update users set ism = :s where id = :i"), {"s": ism, "i": u["id"]})
    await conn.commit()
    return await _men(conn, request)


@router.post("/oqituvchi-sorov")
async def oqituvchi_sorov(request: Request, u=Depends(faol), conn=Depends(db)):
    # O'qituvchi yaratgan o'quvchi (login bilan) va allaqachon o'qituvchi/admin so'rov yubormaydi
    if u["rol"] != "student" or u["login"] is not None:
        raise HTTPException(400, "mumkin-emas")
    if not u["ism"]:
        raise HTTPException(400, "ism-kerak")
    await conn.execute(text("update users set oqituvchi_sorov = 'kutilmoqda' where id = :i"), {"i": u["id"]})
    await conn.commit()
    return await _men(conn, request)
