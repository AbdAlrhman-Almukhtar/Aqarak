"""enable pg_trgm and add trigram indexes"""

from alembic import op
import sqlalchemy as sa
revision = '41957dc49421'
down_revision = '695c24f8a97a'
branch_labels = None
depends_on = None

def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_props_city_trgm
        ON properties USING gin (city gin_trgm_ops);
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_props_neighborhood_trgm
        ON properties USING gin (neighborhood gin_trgm_ops);
    """)

def downgrade():
    op.execute("DROP INDEX IF EXISTS ix_props_neighborhood_trgm;")
    op.execute("DROP INDEX IF EXISTS ix_props_city_trgm;")