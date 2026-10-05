"""Akkauntlar: foydalanuvchilar va sessiyalar.

Revision ID: 0002
Revises: 0001
"""
from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        create table users (
            id bigserial primary key,
            rol text not null default 'student' check (rol in ('student', 'teacher', 'admin')),
            oqituvchi_sorov text check (oqituvchi_sorov in ('kutilmoqda', 'rad')),
            ism text check (char_length(ism) between 2 and 40),
            google_sub text unique,
            email text,
            login text unique check (login ~ '^[a-z0-9]{3,20}$'),
            parol_xesh text,
            parol_almashtirsin boolean not null default false,
            kim_yaratgan bigint references users(id) on delete set null,
            yaratilgan timestamptz not null default now(),
            oxirgi_kirish timestamptz
        )
    """)
    op.execute("create index users_sorov on users(oqituvchi_sorov) where oqituvchi_sorov is not null")
    op.execute("""
        create table sessiyalar (
            token_xesh bytea primary key,
            user_id bigint not null references users(id) on delete cascade,
            tugaydi timestamptz not null
        )
    """)
    op.execute("create index sessiyalar_user on sessiyalar(user_id)")


def downgrade() -> None:
    op.execute("drop table sessiyalar")
    op.execute("drop table users")
