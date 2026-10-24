"""initial schema for enquiries and courses

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-23 11:00:00

"""
from alembic import op
import sqlalchemy as sa

revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # enquiries table
    op.create_table(
        'enquiries',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('reference_code', sa.String(length=32), nullable=False),
        sa.Column('full_name', sa.String(length=120), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=24), nullable=False),
        sa.Column('enquiry_type', sa.Enum('STUDENT', 'COLLEGE_TRAINING', 'CORPORATE_TRAINING', 'GENERAL_CONTACT', name='enquirytype'), nullable=False),
        sa.Column('organization_or_college', sa.String(length=200), nullable=True),
        sa.Column('course_slug', sa.String(length=100), nullable=True),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('status', sa.Enum('NEW', 'IN_REVIEW', 'CONTACTED', 'RESOLVED', 'CLOSED', name='enquirystatus'), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_enquiries_id'), 'enquiries', ['id'], unique=False)
    op.create_index(op.f('ix_enquiries_reference_code'), 'enquiries', ['reference_code'], unique=True)
    op.create_index(op.f('ix_enquiries_email'), 'enquiries', ['email'], unique=False)
    op.create_index(op.f('ix_enquiries_enquiry_type'), 'enquiries', ['enquiry_type'], unique=False)
    op.create_index(op.f('ix_enquiries_status'), 'enquiries', ['status'], unique=False)

    # courses table
    op.create_table(
        'courses',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('slug', sa.String(length=120), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('tagline', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('level', sa.String(length=50), nullable=False),
        sa.Column('audience', sa.String(length=50), nullable=False),
        sa.Column('duration_weeks', sa.Integer(), nullable=False),
        sa.Column('hours_per_week', sa.Integer(), nullable=False),
        sa.Column('format', sa.String(length=100), nullable=False),
        sa.Column('prerequisites', sa.JSON(), nullable=False),
        sa.Column('key_skills', sa.JSON(), nullable=False),
        sa.Column('modules', sa.JSON(), nullable=False),
        sa.Column('projects', sa.JSON(), nullable=False),
        sa.Column('is_published', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_courses_id'), 'courses', ['id'], unique=False)
    op.create_index(op.f('ix_courses_slug'), 'courses', ['slug'], unique=True)
    op.create_index(op.f('ix_courses_category'), 'courses', ['category'], unique=False)
    op.create_index(op.f('ix_courses_audience'), 'courses', ['audience'], unique=False)
    op.create_index(op.f('ix_courses_is_published'), 'courses', ['is_published'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_courses_is_published'), table_name='courses')
    op.drop_index(op.f('ix_courses_audience'), table_name='courses')
    op.drop_index(op.f('ix_courses_category'), table_name='courses')
    op.drop_index(op.f('ix_courses_slug'), table_name='courses')
    op.drop_index(op.f('ix_courses_id'), table_name='courses')
    op.drop_table('courses')

    op.drop_index(op.f('ix_enquiries_status'), table_name='enquiries')
    op.drop_index(op.f('ix_enquiries_enquiry_type'), table_name='enquiries')
    op.drop_index(op.f('ix_enquiries_email'), table_name='enquiries')
    op.drop_index(op.f('ix_enquiries_reference_code'), table_name='enquiries')
    op.drop_index(op.f('ix_enquiries_id'), table_name='enquiries')
    op.drop_table('enquiries')
