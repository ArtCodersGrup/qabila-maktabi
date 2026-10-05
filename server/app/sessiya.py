# Sessiya: tasodifiy token cookie'da, bazada faqat uning sha256 xeshi (baza o'g'irlansa ham token bilinmaydi).
import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import text

COOKIE = "kj_sessiya"
MUDDAT = timedelta(days=60)
USTUNLAR = ("u.id, u.rol, u.ism, u.login, u.email, u.parol_almashtirsin, u.oqituvchi_sorov, "
            "(u.parol_xesh is not null) as parol_bor")


def _xesh(token: str) -> bytes:
    return hashlib.sha256(token.encode()).digest()


async def och(conn, user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    await conn.execute(text("insert into sessiyalar(token_xesh, user_id, tugaydi) values (:x, :u, :t)"),
                       {"x": _xesh(token), "u": user_id, "t": datetime.now(timezone.utc) + MUDDAT})
    await conn.execute(text("update users set oxirgi_kirish = now() where id = :u"), {"u": user_id})
    await conn.execute(text("delete from sessiyalar where tugaydi < now()"))  # eskilari tozalanadi
    return token


async def kim(conn, token):
    if not token or len(token) > 100:
        return None
    r = (await conn.execute(text(f"select {USTUNLAR} from sessiyalar s join users u on u.id = s.user_id "
                                 "where s.token_xesh = :x and s.tugaydi > now()"), {"x": _xesh(token)})).mappings().first()
    return dict(r) if r else None


async def yop(conn, token) -> None:
    if token:
        await conn.execute(text("delete from sessiyalar where token_xesh = :x"), {"x": _xesh(token)})


async def boshqalarini_yop(conn, user_id: int, token: str) -> None:
    await conn.execute(text("delete from sessiyalar where user_id = :u and token_xesh <> :x"),
                       {"u": user_id, "x": _xesh(token or "")})


def korinish(u: dict) -> dict:
    keys = ("id", "rol", "ism", "login", "email", "parol_almashtirsin", "oqituvchi_sorov", "parol_bor")
    return {k: u[k] for k in keys}


def cookie_qoy(response, token: str) -> None:
    response.set_cookie(COOKIE, token, max_age=int(MUDDAT.total_seconds()), httponly=True, secure=True, samesite="lax", path="/")


def cookie_ochir(response) -> None:
    response.delete_cookie(COOKIE, path="/", httponly=True, secure=True, samesite="lax")
