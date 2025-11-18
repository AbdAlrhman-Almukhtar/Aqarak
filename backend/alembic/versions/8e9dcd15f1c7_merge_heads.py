"""merge heads

Revision ID: 8e9dcd15f1c7
Revises: bc8cd58d5755, d194efe5417a
Create Date: 2025-11-02 14:56:47.271308

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8e9dcd15f1c7'
down_revision: Union[str, Sequence[str], None] = ('bc8cd58d5755', 'd194efe5417a')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
