# Baza bilan ulanish: bitta async engine (ilova ishga tushganda yaratiladi).
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine


def make_engine(url: str) -> AsyncEngine:
    # Server kichik (1 CPU) — kichik pul; connect_timeout baza o'chiq bo'lsa so'rovni osiltirmaydi
    return create_async_engine(url, pool_size=5, max_overflow=5, pool_pre_ping=True, connect_args={"connect_timeout": 3})


async def baza_tirikmi(engine: AsyncEngine) -> bool:
    try:
        async with engine.connect() as conn:
            await conn.execute(text("select 1"))
        return True
    except Exception:
        return False
