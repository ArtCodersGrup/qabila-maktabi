import os
import sys
from pathlib import Path

# server/ papkasi import yo'lida bo'lsin (app paketi)
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

TEST_DB = os.environ.get("KELAJAGIM_TEST_DB", "postgresql+psycopg://localhost/kelajagim_test")
