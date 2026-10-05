"""Xona natijalariga onlayn tank jangi qo'shildi.

Revision ID: 0006
Revises: 0005
"""
from alembic import op

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("alter table xona_natijalari drop constraint xona_natijalari_tur_check")
    op.execute("alter table xona_natijalari add constraint xona_natijalari_tur_check check (tur in ('tog', 'poyga', 'tank'))")


def downgrade() -> None:
    op.execute("delete from xona_natijalari where tur = 'tank'")
    op.execute("alter table xona_natijalari drop constraint xona_natijalari_tur_check")
    op.execute("alter table xona_natijalari add constraint xona_natijalari_tur_check check (tur in ('tog', 'poyga'))")
