# Alembic: baza manzili KELAJAGIM_DB dan (ilova bilan bir xil). Modellar yo'q — migratsiyalar qo'lda yoziladi.
from alembic import context
from sqlalchemy import create_engine, pool

from app.config import database_url

engine = create_engine(database_url(), poolclass=pool.NullPool)
with engine.connect() as connection:
    context.configure(connection=connection, target_metadata=None)
    with context.begin_transaction():
        context.run_migrations()
