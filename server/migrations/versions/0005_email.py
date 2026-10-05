"""Email bilan ro'yxatdan o'tish: tasdiqlash va parolni tiklash havolalari.

Revision ID: 0005
Revises: 0004
"""
from alembic import op

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("alter table users add column email_tasdiq boolean not null default false")
    op.execute("update users set email_tasdiq = true where google_sub is not null")  # Google emailni o'zi tasdiqlagan
    op.execute("create unique index users_email_uniq on users (lower(email)) where email is not null")
    op.execute("""
        create table email_tokenlar (
            token_xesh bytea primary key,
            user_id bigint not null references users(id) on delete cascade,
            maqsad text not null check (maqsad in ('tasdiq', 'tiklash')),
            tugaydi timestamptz not null
        )
    """)
    op.execute("create index email_tokenlar_user on email_tokenlar(user_id)")


def downgrade() -> None:
    op.execute("drop table email_tokenlar")
    op.execute("drop index users_email_uniq")
    op.execute("alter table users drop column email_tasdiq")
