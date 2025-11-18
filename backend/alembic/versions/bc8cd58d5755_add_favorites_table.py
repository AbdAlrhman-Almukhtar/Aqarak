
from alembic import op
import sqlalchemy as sa

revision = "bc8cd58d5755"
down_revision = "795d82481d32"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "favorites",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("property_id", sa.Integer, sa.ForeignKey("properties.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("user_id", "property_id", name="uq_favorites_user_property"),
    )
    op.create_index("ix_favorites_user", "favorites", ["user_id"])
    op.create_index("ix_favorites_property", "favorites", ["property_id"])

def downgrade():
    op.drop_index("ix_favorites_property", table_name="favorites")
    op.drop_index("ix_favorites_user", table_name="favorites")
    op.drop_table("favorites")