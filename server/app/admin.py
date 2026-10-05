# /api/admin — o'qituvchi so'rovlarini tasdiqlash va umumiy statistika (faqat admin).
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
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
    # O'quvchi — o'qituvchi bo'lishni kutayotganlarsiz (ular "so'rov" bo'lib alohida sanaladi)
    r = (await conn.execute(text(
        "select count(*) filter (where rol = 'student' and oqituvchi_sorov is distinct from 'kutilmoqda') as oquvchilar, "
        "count(*) filter (where rol = 'teacher') as oqituvchilar, "
        "count(*) filter (where oxirgi_kirish > now() - interval '7 days') as faol7, "
        "count(*) filter (where oqituvchi_sorov = 'kutilmoqda') as kutilmoqda, "
        "(select count(*) from sinflar) as sinflar from users"))).mappings().first()
    return {k: r[k] for k in ("oquvchilar", "oqituvchilar", "sinflar", "faol7", "kutilmoqda")}


def _sana(v):
    return v.isoformat() if v else None


@router.get("/oqituvchilar")
async def oqituvchilar(conn=Depends(db)):
    rows = (await conn.execute(text(
        "select u.id, u.ism, u.email, u.login, u.oxirgi_kirish, "
        "(select count(*) from sinflar s where s.oqituvchi_id = u.id) as sinflar, "
        "(select count(*) from sinf_azolari a join sinflar s on s.id = a.sinf_id "
        " where s.oqituvchi_id = u.id and a.holat = 'qabul') as oquvchilar "
        "from users u where u.rol = 'teacher' order by u.ism nulls last, u.id"))).mappings().all()
    return {"oqituvchilar": [{**r, "oxirgi_kirish": _sana(r["oxirgi_kirish"])} for r in rows]}


class Rol(BaseModel):
    rol: Literal["student", "teacher"]


@router.post("/rol/{uid}")
async def rol(uid: int, body: Rol, u=Depends(admin), conn=Depends(db)):
    if uid == u["id"]:
        raise HTTPException(400, "mumkin-emas")  # o'zini adminlikdan tushirib qo'ymasin
    r = (await conn.execute(text("update users set rol = :r, oqituvchi_sorov = null where id = :i and rol <> 'admin' returning id"),
                            {"r": body.rol, "i": uid})).scalar()
    if r is None:
        raise HTTPException(404, "topilmadi")
    await conn.commit()
    return {"ok": True}


@router.get("/foydalanuvchilar")
async def foydalanuvchilar(q: str = Query("", max_length=60), rol: str = Query("", pattern="^(|student|teacher|admin)$"),
                           sahifa: int = Query(0, ge=0, le=1000), conn=Depends(db)):
    # Qidiruv: ism, login yoki email ichida (% va _ oddiy harf sifatida)
    naqsh = "%" + q.strip().lower().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%"
    shart = ("(lower(coalesce(ism, '')) like :n or lower(coalesce(login, '')) like :n or lower(coalesce(email, '')) like :n) "
             "and (:r = '' or rol = :r)")
    p = {"n": naqsh, "r": rol}
    jami = (await conn.execute(text(f"select count(*) from users where {shart}"), p)).scalar()
    rows = (await conn.execute(text(
        f"select id, ism, login, email, rol, oxirgi_kirish, yaratilgan from users where {shart} "
        "order by oxirgi_kirish desc nulls last, id desc limit 50 offset :o"), {**p, "o": sahifa * 50})).mappings().all()
    return {"jami": jami, "foydalanuvchilar": [{**r, "oxirgi_kirish": _sana(r["oxirgi_kirish"]), "yaratilgan": _sana(r["yaratilgan"])} for r in rows]}
