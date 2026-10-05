# /api/hisob — kirish, chiqish, men, parol, profil, o'qituvchi so'rovi.
import hashlib
import logging
import re
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field
from sqlalchemy import text
from starlette.concurrency import run_in_threadpool

from . import config, parol, sessiya
from .deps import db, faol, kirgan

router = APIRouter(prefix="/api/hisob")
log = logging.getLogger("kelajagim.hisob")
_EMAIL = re.compile(r"[^@\s]{1,64}@[^@\s]+\.[a-z]{2,}")


def email_toza(s: str):
    s = s.strip().lower()
    return s if len(s) <= 254 and _EMAIL.fullmatch(s) else None

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
    return {"google": config.google() is not None, "email": config.pochta() is not None}


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
    # "@" bo'lsa — email bilan, aks holda login bilan
    ustun = "lower(email)" if "@" in login else "login"
    r = (await conn.execute(text(f"select id, parol_xesh, email_tasdiq, login from users where {ustun} = :l"), {"l": login})).first()
    xesh = r.parol_xesh if r is not None and r.parol_xesh else parol.SOXTA
    ok = await run_in_threadpool(parol.tekshir, xesh, body.parol)
    if r is None or not r.parol_xesh or not ok:
        cl.xato(kl)
        ci.xato(ip)
        raise HTTPException(401, "notogri")
    cl.tozala(kl)
    if r.login is None and not r.email_tasdiq:
        raise HTTPException(403, "tasdiqlanmagan")  # faqat to'g'ri paroldan keyin aytiladi
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


# ---------- Email bilan ro'yxatdan o'tish va parolni tiklash ----------
# Havola tokeni bir martalik; bazada faqat sha256 xeshi. Javoblar email bor-yo'qligini oshkor qilmaydi.

class Royxat(BaseModel):
    email: str = Field(max_length=300)
    parol: str = Field(max_length=200)
    ism: str = Field(max_length=80)


class Email(BaseModel):
    email: str = Field(max_length=300)


class Tiklash(BaseModel):
    token: str = Field(max_length=100)
    yangi: str = Field(max_length=200)


def _xesh(t: str) -> bytes:
    return hashlib.sha256(t.encode()).digest()


async def _token_yarat(conn, uid: int, maqsad: str, muddat: timedelta) -> str:
    t = secrets.token_urlsafe(32)
    await conn.execute(text("delete from email_tokenlar where user_id = :u and maqsad = :m"), {"u": uid, "m": maqsad})
    await conn.execute(text("insert into email_tokenlar(token_xesh, user_id, maqsad, tugaydi) values (:x, :u, :m, :t)"),
                       {"x": _xesh(t), "u": uid, "m": maqsad, "t": datetime.now(timezone.utc) + muddat})
    return t


async def _token_ol(conn, t: str, maqsad: str):
    if not t or len(t) > 100:
        return None
    return (await conn.execute(text("delete from email_tokenlar where token_xesh = :x and maqsad = :m and tugaydi > now() returning user_id"),
                               {"x": _xesh(t), "m": maqsad})).scalar()


XATLAR = {
    "tasdiq": ("Qabila maktabi — emailingizni tasdiqlang",
               "Salom, {ism}!\n\nQabila maktabi saytida ro'yxatdan o'tdingiz. Emailingizni tasdiqlash uchun havolani bosing:\n\n"
               "{havola}\n\nHavola 24 soat amal qiladi. Agar siz ro'yxatdan o'tmagan bo'lsangiz, bu xatga e'tibor bermang.\n"),
    "tiklash": ("Qabila maktabi — parolni tiklash",
                "Salom, {ism}!\n\nParolni tiklash so'raldi. Yangi parol qo'yish uchun havolani bosing:\n\n"
                "{havola}\n\nHavola 30 daqiqa amal qiladi va bir marta ishlaydi. Agar siz so'ramagan bo'lsangiz, "
                "bu xatga e'tibor bermang — parolingiz o'zgarmaydi.\n"),
}


async def _xat(request: Request, email: str, tur: str, token: str, ism) -> bool:
    """Xat yuboradi; bitta emailga 15 daqiqada ko'pi bilan 3 ta. Yuborilmasa False."""
    cx = request.app.state.cheklov_xat
    if cx.bandmi(email):
        return False
    cx.xato(email)
    havola = config.sayt() + ("/api/hisob/tasdiq?t=" if tur == "tasdiq" else "/kirish/?tiklash=") + token
    mavzu, shablon = XATLAR[tur]
    try:
        await request.app.state.pochta(email, mavzu, shablon.format(ism=ism or "do'stim", havola=havola))
        return True
    except Exception:
        log.exception("xat yuborilmadi")
        return False


def _pochta_kerak():
    if config.pochta() is None:
        raise HTTPException(503, "pochta-yoq")


@router.post("/royxat")
async def royxat(body: Royxat, request: Request, conn=Depends(db)):
    _pochta_kerak()
    email = email_toza(body.email)
    if email is None:
        raise HTTPException(400, "email-notogri")
    if not parol.yaxshimi(body.parol):
        raise HTTPException(400, "parol-qisqa")
    ism = ism_toza(body.ism)
    if ism is None:
        raise HTTPException(400, "ism-notogri")
    ci, ip = request.app.state.cheklov_ip, "royxat:" + (request.client.host if request.client else "?")
    if ci.bandmi(ip):
        raise HTTPException(429, "kop-urinish")
    ci.xato(ip)
    r = (await conn.execute(text("select id, email_tasdiq, google_sub, login from users where lower(email) = :e"), {"e": email})).first()
    if r is not None and (r.email_tasdiq or r.google_sub or r.login):
        raise HTTPException(409, "email-band")
    xesh = await run_in_threadpool(parol.xeshla, body.parol)
    if r is not None:
        # tasdiqlanmagan eski urinish — yangilanadi, ikkinchi akkaunt ochilmaydi
        uid = r.id
        await conn.execute(text("update users set parol_xesh = :x, ism = :i where id = :u"), {"x": xesh, "i": ism, "u": uid})
    else:
        uid = (await conn.execute(text("insert into users(email, parol_xesh, ism) values (:e, :x, :i) returning id"),
                                  {"e": email, "x": xesh, "i": ism})).scalar()
    token = await _token_yarat(conn, uid, "tasdiq", timedelta(hours=24))
    await conn.commit()
    await _xat(request, email, "tasdiq", token, ism)
    return {"ok": True, "email": email}


@router.get("/tasdiq")
async def tasdiq(t: str = "", conn=Depends(db)):
    uid = await _token_ol(conn, t, "tasdiq")
    if uid is None:
        await conn.commit()
        return RedirectResponse("/kirish/?xato=havola", 302)
    await conn.execute(text("update users set email_tasdiq = true where id = :u"), {"u": uid})
    token = await sessiya.och(conn, uid)
    await conn.commit()
    r = RedirectResponse("/kirish/?tasdiq=1", 302)
    sessiya.cookie_qoy(r, token)
    return r


@router.post("/tasdiq-qayta")
async def tasdiq_qayta(body: Email, request: Request, conn=Depends(db)):
    _pochta_kerak()
    email = email_toza(body.email)
    if email:
        r = (await conn.execute(text("select id, ism from users where lower(email) = :e and not email_tasdiq "
                                     "and parol_xesh is not null and login is null"), {"e": email})).first()
        if r is not None and not request.app.state.cheklov_xat.bandmi(email):
            token = await _token_yarat(conn, r.id, "tasdiq", timedelta(hours=24))
            await conn.commit()
            await _xat(request, email, "tasdiq", token, r.ism)
    return {"ok": True}


@router.post("/unutdim")
async def unutdim(body: Email, request: Request, conn=Depends(db)):
    _pochta_kerak()
    email = email_toza(body.email)
    if email:
        r = (await conn.execute(text("select id, ism from users where lower(email) = :e"), {"e": email})).first()
        if r is not None and not request.app.state.cheklov_xat.bandmi(email):
            token = await _token_yarat(conn, r.id, "tiklash", timedelta(minutes=30))
            await conn.commit()
            await _xat(request, email, "tiklash", token, r.ism)
    return {"ok": True}


@router.post("/tiklash")
async def tiklash(body: Tiklash, request: Request, response: Response, conn=Depends(db)):
    if not parol.yaxshimi(body.yangi):
        raise HTTPException(400, "parol-qisqa")  # token sarflanmaydi — qayta urinsa bo'ladi
    uid = await _token_ol(conn, body.token, "tiklash")
    if uid is None:
        await conn.commit()
        raise HTTPException(400, "havola")
    xesh = await run_in_threadpool(parol.xeshla, body.yangi)
    await conn.execute(text("update users set parol_xesh = :x, parol_almashtirsin = false, email_tasdiq = true where id = :u"),
                       {"x": xesh, "u": uid})
    await conn.execute(text("delete from sessiyalar where user_id = :u"), {"u": uid})  # hamma eski kirishlar yopiladi
    token = await sessiya.och(conn, uid)
    await conn.commit()
    sessiya.cookie_qoy(response, token)
    return await _men(conn, request, token)
