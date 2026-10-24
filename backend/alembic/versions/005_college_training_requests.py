"""college training requests

Revision ID: 005_college_training_requests
Revises: 004_assessments_submissions_attendance_certificates
Create Date: 2026-10-23 15:10:00

"""
from alembic import op
import sqlalchemy as sa

revision = '005_college_training_requests'
down_revision = '004_assessments_submissions_attendance_certificates'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'training_requests',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('organization_id', sa.Integer(), nullable=False),
        sa.Column('requester_id', sa.Integer(), nullable=True),
        sa.Column('course_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('target_audience', sa.String(length=100), nullable=False),
        sa.Column('estimated_students', sa.Integer(), nullable=False),
        sa.Column('preferred_start_date', sa.Date(), nullable=True),
        sa.Column('training_mode', sa.String(length=50), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('PENDING', 'APPROVED', 'SCHEDULED', 'COMPLETED', 'REJECTED', name='trainingrequeststatus'), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['requester_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_training_requests_id'), 'training_requests', ['id'], unique=False)
    op.create_index(op.f('ix_training_requests_organization_id'), 'training_requests', ['organization_id'], unique=False)
    op.create_index(op.f('ix_training_requests_status'), 'training_requests', ['status'], unique=False)


def downgrade() -> None:
    op.drop_table('training_requests')
