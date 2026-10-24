"""lms modules lessons enrollments

Revision ID: 003_lms_modules_lessons_enrollments
Revises: 002_auth_and_organizations
Create Date: 2026-10-23 14:20:00

"""
from alembic import op
import sqlalchemy as sa

revision = '003_lms_modules_lessons_enrollments'
down_revision = '002_auth_and_organizations'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add trainer_id to courses
    try:
        op.add_column('courses', sa.Column('trainer_id', sa.Integer(), nullable=True))
        op.create_foreign_key('fk_courses_trainer_id', 'courses', 'users', ['trainer_id'], ['id'], ondelete='SET NULL')
        op.create_index(op.f('ix_courses_trainer_id'), 'courses', ['trainer_id'], unique=False)
    except Exception:
        pass

    # modules table
    op.create_table(
        'modules',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('course_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('order_index', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_modules_id'), 'modules', ['id'], unique=False)
    op.create_index(op.f('ix_modules_course_id'), 'modules', ['course_id'], unique=False)

    # lessons table
    op.create_table(
        'lessons',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('module_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('slug', sa.String(length=120), nullable=False),
        sa.Column('lesson_type', sa.Enum('VIDEO', 'TEXT', 'LAB', 'RESOURCE', 'QUIZ', 'ASSIGNMENT', name='lessontype'), nullable=False),
        sa.Column('duration_min', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('video_url', sa.String(length=500), nullable=True),
        sa.Column('resource_url', sa.String(length=500), nullable=True),
        sa.Column('order_index', sa.Integer(), nullable=False),
        sa.Column('is_preview', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['module_id'], ['modules.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_lessons_id'), 'lessons', ['id'], unique=False)
    op.create_index(op.f('ix_lessons_module_id'), 'lessons', ['module_id'], unique=False)
    op.create_index(op.f('ix_lessons_slug'), 'lessons', ['slug'], unique=False)

    # enrollments table
    op.create_table(
        'enrollments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('course_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum('ACTIVE', 'COMPLETED', 'PAUSED', 'DROPPED', name='enrollmentstatus'), nullable=False),
        sa.Column('progress_percentage', sa.Float(), nullable=False),
        sa.Column('enrolled_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'course_id', name='uq_user_course_enrollment'),
    )
    op.create_index(op.f('ix_enrollments_id'), 'enrollments', ['id'], unique=False)
    op.create_index(op.f('ix_enrollments_course_id'), 'enrollments', ['course_id'], unique=False)
    op.create_index(op.f('ix_enrollments_user_id'), 'enrollments', ['user_id'], unique=False)
    op.create_index(op.f('ix_enrollments_status'), 'enrollments', ['status'], unique=False)

    # lesson_progress table
    op.create_table(
        'lesson_progress',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('lesson_id', sa.Integer(), nullable=False),
        sa.Column('enrollment_id', sa.Integer(), nullable=False),
        sa.Column('is_completed', sa.Boolean(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('last_accessed_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['enrollment_id'], ['enrollments.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['lesson_id'], ['lessons.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'lesson_id', name='uq_user_lesson_progress'),
    )
    op.create_index(op.f('ix_lesson_progress_id'), 'lesson_progress', ['id'], unique=False)
    op.create_index(op.f('ix_lesson_progress_enrollment_id'), 'lesson_progress', ['enrollment_id'], unique=False)
    op.create_index(op.f('ix_lesson_progress_lesson_id'), 'lesson_progress', ['lesson_id'], unique=False)
    op.create_index(op.f('ix_lesson_progress_user_id'), 'lesson_progress', ['user_id'], unique=False)
    op.create_index(op.f('ix_lesson_progress_is_completed'), 'lesson_progress', ['is_completed'], unique=False)


def downgrade() -> None:
    op.drop_table('lesson_progress')
    op.drop_table('enrollments')
    op.drop_table('lessons')
    op.drop_table('modules')
