# Server buyruqlari (serverda api.env bilan):
#   python -m app.cli make-admin <email|login>  — mavjud foydalanuvchini admin qiladi (email bo'lsa, oldindan yozuv ochadi:
#                                                 shu Gmail bilan birinchi kirishda bog'lanadi)
#   python -m app.cli yangi-admin <login>        — login+parolli admin; bir martalik parol chiqariladi, birinchi kirishda almashtiriladi
import asyncio
import secrets
import sys

from sqlalchemy import text

from . import parol
from .config import database_url
from .db import make_engine


async def make_admin(url: str, kim: str) -> str:
    e = make_engine(url)
    try:
        async with e.connect() as c:
            if "@" in kim:
                email = kim.strip().lower()
                r = (await c.execute(text("update users set rol = 'admin', oqituvchi_sorov = null where lower(email) = :e returning id"),
                                     {"e": email})).scalar()
                if r is None:
                    await c.execute(text("insert into users(email, rol) values (:e, 'admin')"), {"e": email})
            else:
                r = (await c.execute(text("update users set rol = 'admin', oqituvchi_sorov = null where login = :l returning id"),
                                     {"l": kim.strip().lower()})).scalar()
                if r is None:
                    raise SystemExit(f"Bunday login yo'q: {kim}")
            await c.commit()
    finally:
        await e.dispose()
    return f"{kim} — endi admin"


async def yangi_admin(url: str, login: str) -> str:
    bir_martalik = secrets.token_urlsafe(9)
    e = make_engine(url)
    try:
        async with e.connect() as c:
            await c.execute(text("insert into users(login, parol_xesh, rol, ism, parol_almashtirsin) "
                                 "values (:l, :x, 'admin', 'Admin', true)"),
                            {"l": login.strip().lower(), "x": parol.xeshla(bir_martalik)})
            await c.commit()
    finally:
        await e.dispose()
    return bir_martalik


def main(argv: list[str]) -> None:
    if len(argv) == 2 and argv[0] == "make-admin":
        print(asyncio.run(make_admin(database_url(), argv[1])))
    elif len(argv) == 2 and argv[0] == "yangi-admin":
        p = asyncio.run(yangi_admin(database_url(), argv[1]))
        print(f"Admin yaratildi: login {argv[1]}, bir martalik parol: {p}  (birinchi kirishda almashtiriladi)")
    else:
        raise SystemExit("Ishlatish: python -m app.cli make-admin <email|login> | yangi-admin <login>")


if __name__ == "__main__":
    main(sys.argv[1:])
