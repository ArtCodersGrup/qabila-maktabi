"""Sinflar, a'zolar va progress.

Revision ID: 0003
Revises: 0002
"""
from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        create table sinflar (
            id bigserial primary key,
            oqituvchi_id bigint not null references users(id) on delete cascade,
            nom text not null check (char_length(nom) between 1 and 40),
            kod text not null unique check (kod ~ '^[A-HJKMNP-Z2-9]{6}$'),
            yaratilgan timestamptz not null default now()
        )
    """)
    op.execute("create index sinflar_oqituvchi on sinflar(oqituvchi_id)")
    op.execute("""
        create table sinf_azolari (
            sinf_id bigint not null references sinflar(id) on delete cascade,
            user_id bigint not null references users(id) on delete cascade,
            holat text not null check (holat in ('sorov', 'qabul')),
            yaratilgan timestamptz not null default now(),
            primary key (sinf_id, user_id)
        )
    """)
    op.execute("create index sinf_azolari_user on sinf_azolari(user_id)")
    op.execute("""
        create table progress (
            user_id bigint not null references users(id) on delete cascade,
            kalit text not null,
            qiymat jsonb not null,
            yangilangan timestamptz not null default now(),
            primary key (user_id, kalit)
        )
    """)


def downgrade() -> None:
    op.execute("drop table progress")
    op.execute("drop table sinf_azolari")
    op.execute("drop table sinflar")
