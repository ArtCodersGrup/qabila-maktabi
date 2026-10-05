# Umumiy dependency'lar: baza ulanishi va joriy foydalanuvchi (rol tekshiruvi bilan).
# Ulanish engine.connect() — yozadigan endpoint javobdan oldin o'zi commit qiladi.
from fastapi import Depends, HTTPException, Request

from . import sessiya


async def db(request: Request):
    async with request.app.state.engine.connect() as conn:
        yield conn


async def joriy(request: Request, conn=Depends(db)):
    return await sessiya.kim(conn, request.cookies.get(sessiya.COOKIE))


async def kirgan(u=Depends(joriy)):
    if u is None:
        raise HTTPException(401, "kirilmagan")
    return u


async def faol(u=Depends(kirgan)):
    # Bir martalik parol bilan kirgan — avval o'z parolini qo'yadi
    if u["parol_almashtirsin"]:
        raise HTTPException(403, "parol-almashtir")
    return u


async def admin(u=Depends(faol)):
    if u["rol"] != "admin":
        raise HTTPException(403, "ruxsat-yoq")
    return u
