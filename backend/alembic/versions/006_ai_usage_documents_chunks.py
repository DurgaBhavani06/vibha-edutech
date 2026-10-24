"""ai usage documents chunks

Revision ID: 006_ai_usage_documents_chunks
Revises: 005_college_training_requests
Create Date: 2026-10-23 15:20:00

"""
from alembic import op
import sqlalchemy as sa

revision = '006_ai_usage_documents_chunks'
down_revision = '005_college_training_requests'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. ai_usage table
    op.create_table(
        'ai_usage',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('feature', sa.String(length=50), nullable=False),
        sa.Column('model_name', sa.String(length=100), nullable=False),
        sa.Column('prompt_tokens', sa.Integer(), nullable=False),
        sa.Column('completion_tokens', sa.Integer(), nullable=False),
        sa.Column('total_tokens', sa.Integer(), nullable=False),
        sa.Column('estimated_cost_usd', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_ai_usage_id'), 'ai_usage', ['id'], unique=False)
    op.create_index(op.f('ix_ai_usage_user_id'), 'ai_usage', ['user_id'], unique=False)
    op.create_index(op.f('ix_ai_usage_feature'), 'ai_usage', ['feature'], unique=False)

    # 2. documents table
    op.create_table(
        'documents',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('course_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('source_filename', sa.String(length=255), nullable=False),
        sa.Column('file_type', sa.String(length=50), nullable=False),
        sa.Column('is_approved', sa.Boolean(), nullable=False),
        sa.Column('uploaded_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['uploaded_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_documents_id'), 'documents', ['id'], unique=False)
    op.create_index(op.f('ix_documents_course_id'), 'documents', ['course_id'], unique=False)

    # 3. document_chunks table
    op.create_table(
        'document_chunks',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('document_id', sa.Integer(), nullable=False),
        sa.Column('chunk_index', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('token_count', sa.Integer(), nullable=False),
        sa.Column('metadata_json', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_document_chunks_id'), 'document_chunks', ['id'], unique=False)
    op.create_index(op.f('ix_document_chunks_document_id'), 'document_chunks', ['document_id'], unique=False)


def downgrade() -> None:
    op.drop_table('document_chunks')
    op.drop_table('documents')
    op.drop_table('ai_usage')
