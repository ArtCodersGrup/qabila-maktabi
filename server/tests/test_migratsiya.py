import os
import subprocess
import sys
from pathlib import Path

from sqlalchemy import create_engine, text

from tests.conftest import TEST_DB

SERVER = Path(__file__).resolve().parents[1]


def test_upgrade_head():
    env = {**os.environ, "KELAJAGIM_DB": TEST_DB}
    r = subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], cwd=SERVER, env=env, capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
    eng = create_engine(TEST_DB)
    with eng.connect() as conn:
        assert conn.execute(text("select version_num from alembic_version")).scalar() == "0003"
    eng.dispose()
