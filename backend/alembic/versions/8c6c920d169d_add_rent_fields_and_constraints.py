from alembic import op
import sqlalchemy as sa

revision = "8c6c920d169d"
down_revision = "821be5f41bcb"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column("properties", sa.Column("is_for_sale", sa.Boolean(), nullable=False, server_default=sa.text("true")))
    op.add_column("properties", sa.Column("is_for_rent", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    op.add_column("properties", sa.Column("rent_price", sa.Numeric(12, 2), nullable=True))
    op.execute("ALTER TABLE properties ALTER COLUMN is_for_sale DROP DEFAULT")
    op.execute("ALTER TABLE properties ALTER COLUMN is_for_rent DROP DEFAULT")
    op.create_check_constraint("ck_properties_any_offer", "properties", "(is_for_sale OR is_for_rent)")
    op.create_check_constraint("ck_properties_sale_has_price", "properties", "(NOT is_for_sale) OR price IS NOT NULL")
    op.create_check_constraint("ck_properties_rent_has_price", "properties", "(NOT is_for_rent) OR rent_price IS NOT NULL")
    op.create_index("ix_properties_sale_rent", "properties", ["is_for_sale", "is_for_rent"], unique=False)

def downgrade() -> None:
    op.drop_index("ix_properties_sale_rent", table_name="properties")
    op.drop_constraint("ck_properties_rent_has_price", "properties", type_="check")
    op.drop_constraint("ck_properties_sale_has_price", "properties", type_="check")
    op.drop_constraint("ck_properties_any_offer", "properties", type_="check")
    op.drop_column("properties", "rent_price")
    op.drop_column("properties", "is_for_rent")
    op.drop_column("properties", "is_for_sale")