"""add rent fields

Revision ID: 821be5f41bcb
Revises: 8e9dcd15f1c7
Create Date: 2025-11-04 13:00:53.248976

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '821be5f41bcb'
down_revision: Union[str, Sequence[str], None] = '8e9dcd15f1c7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
