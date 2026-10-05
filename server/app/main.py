# kelajagim.uz API. Hamma yo'llar /api ostida (nginx /api/ ni shu yerga uzatadi).
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Response
from fastapi.staticfiles import StaticFiles

from . import config
from .db import baza_tirikmi, make_engine
from .xonalar import Boshqaruvchi, router as xonalar_router


def create_app(db_url: str | None = None) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.engine = make_engine(db_url or config.database_url())
        yield
        await app.state.engine.dispose()

    # Avtomatik hujjat sahifalari yopiq — ochiq saytda API tuzilishi ko'rinmasin
    app = FastAPI(title="kelajagim", docs_url=None, redoc_url=None, openapi_url=None, lifespan=lifespan)
    app.state.xonalar = Boshqaruvchi()
    app.include_router(xonalar_router)

    @app.get("/api/salomat")
    async def salomat(response: Response):
        ok = await baza_tirikmi(app.state.engine)
        if not ok:
            response.status_code = 503
        return {"ok": ok, "baza": ok}

    # Faqat lokal sinov: sayt fayllari ham shu serverdan (serverda statikni nginx beradi)
    statik = os.environ.get("KELAJAGIM_STATIK")
    if statik:
        app.mount("/", StaticFiles(directory=statik, html=True), name="sayt")

    return app


app = create_app()
