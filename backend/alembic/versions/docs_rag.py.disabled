from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

revision = "20251019_docs_rag"
down_revision = "f312965db154"
branch_labels = None
depends_on = None

DIM = 1536 

def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.create_table(
        "docs",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("title", sa.String, nullable=False),
    )
    op.create_table(
        "doc_chunks",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("doc_id", sa.Integer, sa.ForeignKey("docs.id", ondelete="CASCADE"), index=True),
        sa.Column("ord", sa.Integer, nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("embedding", Vector(dim=DIM), nullable=False),
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_doc_chunks_embedding "
        "ON doc_chunks USING ivfflat (embedding vector_l2_ops) WITH (lists = 100)"
    )

def downgrade():
    op.execute("DROP INDEX IF EXISTS idx_doc_chunks_embedding")
    op.drop_table("doc_chunks")
    op.drop_table("docs")