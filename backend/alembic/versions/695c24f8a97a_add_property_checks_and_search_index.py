from alembic import op
import sqlalchemy as sa
revision = "695c24f8a97a"
down_revision = "de593ba69beb"
branch_labels = None
depends_on = None

def upgrade():
    op.create_check_constraint(
        "ck_properties_price_nonneg", "properties", "price >= 0"
    )
    op.create_check_constraint(
        "ck_properties_bedrooms_nonneg", "properties", "bedrooms >= 0"
    )
    op.create_check_constraint(
        "ck_properties_bathrooms_nonneg", "properties", "bathrooms >= 0"
    )
    op.create_check_constraint(
        "ck_properties_area_nonneg", "properties", "area_sqm >= 0"
    )
    op.create_index(
        "ix_properties_search", "properties", ["city", "neighborhood"], unique=False
    )


def downgrade():
    op.drop_index("ix_properties_search", table_name="properties")
    op.drop_constraint("ck_properties_area_nonneg", "properties", type_="check")
    op.drop_constraint("ck_properties_bathrooms_nonneg", "properties", type_="check")
    op.drop_constraint("ck_properties_bedrooms_nonneg", "properties", type_="check")
    op.drop_constraint("ck_properties_price_nonneg", "properties", type_="check")