from alembic import op

revision = "795d82481d32"
down_revision = "41957dc49421"
branch_labels = None
depends_on = None

def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
    op.execute("CREATE INDEX IF NOT EXISTS ix_props_title_trgm ON properties USING gin (title gin_trgm_ops);")

def downgrade():
    op.execute("DROP INDEX IF EXISTS ix_props_title_trgm;")