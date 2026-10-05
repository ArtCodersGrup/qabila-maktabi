# Google orqali kirish (OAuth 2.0 code oqimi, server tomonda). Kalitlar: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.
import secrets
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import text

from . import config, sessiya
from .deps import db

router = APIRouter(prefix="/api/hisob/google")
HOLAT = "kj_google"  # CSRF: Google'ga ketishdan oldingi tasodifiy qiymat
YOL = "/api/hisob/google"


async def foydalanuvchi(code: str) -> dict:
    """Google'dan kod evaziga {sub, email, email_verified} oladi."""
    cid, sec = config.google()
    async with httpx.AsyncClient(timeout=10) as c:
        t = await c.post("https://oauth2.googleapis.com/token", data={
            "code": code, "client_id": cid, "client_secret": sec,
            "redirect_uri": config.google_qaytish(), "grant_type": "authorization_code"})
        t.raise_for_status()
        i = await c.get("https://openidconnect.googleapis.com/v1/userinfo",
                        headers={"Authorization": "Bearer " + t.json()["access_token"]})
        i.raise_for_status()
        return i.json()


@router.get("")
async def boshla():
    g = config.google()
    if g is None:
        raise HTTPException(503, "google-yoq")
    holat = secrets.token_urlsafe(24)
    url = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode({
        "client_id": g[0], "redirect_uri": config.google_qaytish(), "response_type": "code",
        "scope": "openid email", "state": holat, "prompt": "select_account"})
    r = RedirectResponse(url, 302)
    r.set_cookie(HOLAT, holat, max_age=600, httponly=True, secure=True, samesite="lax", path=YOL)
    return r


@router.get("/qaytish")
async def qaytish(request: Request, code: str = "", state: str = "", conn=Depends(db)):
    xato = RedirectResponse("/kirish/?xato=google", 302)
    kutilgan = request.cookies.get(HOLAT) or ""
    if config.google() is None or not code or not kutilgan or not secrets.compare_digest(state, kutilgan):
        return xato
    try:
        info = await request.app.state.google(code)
    except Exception:
        return xato
    sub = str(info.get("sub") or "")
    email = str(info["email"]).lower() if info.get("email_verified") and info.get("email") else None
    if not sub:
        return xato
    uid = (await conn.execute(text("select id from users where google_sub = :s"), {"s": sub})).scalar()
    if uid is None and email:
        # admin CLI orqali email bilan oldindan yaratilgan yozuv — birinchi kirishda bog'lanadi
        uid = (await conn.execute(text(
            "update users set google_sub = :s where id = (select id from users where lower(email) = :e "
            "and google_sub is null and login is null order by id limit 1) returning id"), {"s": sub, "e": email})).scalar()
    if uid is None:
        uid = (await conn.execute(text("insert into users(google_sub, email) values (:s, :e) returning id"),
                                  {"s": sub, "e": email})).scalar()
    elif email:
        await conn.execute(text("update users set email = :e where id = :i"), {"e": email, "i": uid})
    token = await sessiya.och(conn, uid)
    await conn.commit()
    r = RedirectResponse("/kirish/", 302)
    sessiya.cookie_qoy(r, token)
    r.delete_cookie(HOLAT, path=YOL, httponly=True, secure=True, samesite="lax")
    return r
