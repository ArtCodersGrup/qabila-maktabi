"""Sinf uchun ochilgan onlayn xonalar natijalari.

Revision ID: 0004
Revises: 0003
"""
from alembic import op

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        create table xona_natijalari (
            id bigserial primary key,
            sinf_id bigint not null references sinflar(id) on delete cascade,
            tur text not null check (tur in ('tog', 'poyga')),
            meta jsonb not null default '{}',
            oyinchilar jsonb not null,
            tugagan timestamptz not null default now()
        )
    """)
    op.execute("create index xona_natijalari_sinf on xona_natijalari(sinf_id, tugagan desc)")


def downgrade() -> None:
    op.execute("drop table xona_natijalari")
