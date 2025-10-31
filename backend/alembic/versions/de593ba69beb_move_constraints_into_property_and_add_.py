"""move constraints into Property and add area check

Revision ID: de593ba69beb
Revises: d194efe5417a
Create Date: 2025-10-30 15:41:51.559429

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'de593ba69beb'
down_revision: Union[str, Sequence[str], None] = 'd194efe5417a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
