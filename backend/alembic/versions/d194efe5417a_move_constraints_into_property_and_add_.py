"""move constraints into Property and add area check

Revision ID: d194efe5417a
Revises: 695c24f8a97a
Create Date: 2025-10-30 15:41:47.987523
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "d194efe5417a"
down_revision: Union[str, Sequence[str], None] = '695c24f8a97a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # No-op: constraints already in prior/next revisions.
    pass

def downgrade() -> None:
    # No-op
    pass