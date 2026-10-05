import os
import subprocess
import sys
from pathlib import Path

import pytest
from sqlalchemy import create_engine, text

# server/ papkasi import yo'lida bo'lsin (app paketi)
SERVER = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVER))

TEST_DB = os.environ.get("KELAJAGIM_TEST_DB", "postgresql+psycopg://localhost/kelajagim_test")
_engine = create_engine(TEST_DB)


@pytest.fixture(scope="session")
def baza():
    env = {**os.environ, "KELAJAGIM_DB": TEST_DB}
    r = subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], cwd=SERVER, env=env, capture_output=True, text=True)
    assert r.returncode == 0, r.stderr


@pytest.fixture
def toza(baza):
    with _engine.begin() as conn:
        conn.execute(text("truncate users restart identity cascade"))


def sql(query, **params):
    with _engine.begin() as conn:
        res = conn.execute(text(query), params)
        return res.mappings().all() if res.returns_rows else None


def user_yarat(login=None, parol=None, rol="student", ism=None, email=None, google_sub=None, almashtirsin=False):
    from app import parol as P
    xesh = P.xeshla(parol) if parol else None
    return sql(
        "insert into users(login, parol_xesh, rol, ism, email, google_sub, parol_almashtirsin) "
        "values (:l, :x, :r, :i, :e, :g, :a) returning id",
        l=login, x=xesh, r=rol, i=ism, e=email, g=google_sub, a=almashtirsin)[0]["id"]
