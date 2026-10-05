# /api/admin — o'qituvchi so'rovlarini tasdiqlash va umumiy statistika (faqat admin).
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text

from .deps import admin, db

router = APIRouter(prefix="/api/admin", dependencies=[Depends(admin)])


class Qaror(BaseModel):
    qaror: Literal["tasdiq", "rad"]


@router.get("/sorovlar")
async def sorovlar(conn=Depends(db)):
    rows = (await conn.execute(text("select id, ism, email, yaratilgan from users "
                                    "where oqituvchi_sorov = 'kutilmoqda' order by id"))).mappings().all()
    return {"sorovlar": [{**r, "yaratilgan": r["yaratilgan"].isoformat()} for r in rows]}


@router.post("/sorov/{uid}")
async def sorov(uid: int, body: Qaror, conn=Depends(db)):
    yangi = "rol = 'teacher', oqituvchi_sorov = null" if body.qaror == "tasdiq" else "oqituvchi_sorov = 'rad'"
    r = (await conn.execute(text(f"update users set {yangi} where id = :i and oqituvchi_sorov = 'kutilmoqda' returning id"),
                            {"i": uid})).scalar()
    if r is None:
        raise HTTPException(404, "topilmadi")
    await conn.commit()
    return {"ok": True}


@router.get("/statistika")
async def statistika(conn=Depends(db)):
    rollar = {r.rol: r.n for r in await conn.execute(text("select rol, count(*) as n from users group by rol"))}
    kut = (await conn.execute(text("select count(*) from users where oqituvchi_sorov = 'kutilmoqda'"))).scalar()
    return {"rollar": rollar, "kutilmoqda": kut}
