"""assessments submissions attendance certificates

Revision ID: 004_assessments_submissions_attendance_certificates
Revises: 003_lms_modules_lessons_enrollments
Create Date: 2026-10-23 14:45:00

"""
from alembic import op
import sqlalchemy as sa

revision = '004_assessments_submissions_attendance_certificates'
down_revision = '003_lms_modules_lessons_enrollments'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. batches table
    op.create_table(
        'batches',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=120), nullable=False),
        sa.Column('code', sa.String(length=60), nullable=False),
        sa.Column('course_id', sa.Integer(), nullable=False),
        sa.Column('trainer_id', sa.Integer(), nullable=True),
        sa.Column('organization_id', sa.Integer(), nullable=True),
        sa.Column('max_students', sa.Integer(), nullable=False),
        sa.Column('start_date', sa.DateTime(), nullable=True),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['trainer_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_batches_id'), 'batches', ['id'], unique=False)
    op.create_index(op.f('ix_batches_code'), 'batches', ['code'], unique=True)
    op.create_index(op.f('ix_batches_course_id'), 'batches', ['course_id'], unique=False)

    # 2. batch_memberships table
    op.create_table(
        'batch_memberships',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('batch_id', sa.Integer(), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('enrolled_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['batch_id'], ['batches.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('batch_id', 'student_id', name='uq_batch_student_membership'),
    )
    op.create_index(op.f('ix_batch_memberships_id'), 'batch_memberships', ['id'], unique=False)
    op.create_index(op.f('ix_batch_memberships_batch_id'), 'batch_memberships', ['batch_id'], unique=False)
    op.create_index(op.f('ix_batch_memberships_student_id'), 'batch_memberships', ['student_id'], unique=False)

    # 3. attendance table
    op.create_table(
        'attendance',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('batch_id', sa.Integer(), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('session_date', sa.Date(), nullable=False),
        sa.Column('status', sa.Enum('PRESENT', 'ABSENT', 'LATE', 'EXCUSED', name='attendancestatus'), nullable=False),
        sa.Column('marked_by', sa.Integer(), nullable=True),
        sa.Column('remarks', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['batch_id'], ['batches.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['marked_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('batch_id', 'student_id', 'session_date', name='uq_batch_student_date_attendance'),
    )
    op.create_index(op.f('ix_attendance_id'), 'attendance', ['id'], unique=False)
    op.create_index(op.f('ix_attendance_batch_id'), 'attendance', ['batch_id'], unique=False)
    op.create_index(op.f('ix_attendance_student_id'), 'attendance', ['student_id'], unique=False)
    op.create_index(op.f('ix_attendance_session_date'), 'attendance', ['session_date'], unique=False)

    # 4. assessments table
    op.create_table(
        'assessments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('course_id', sa.Integer(), nullable=False),
        sa.Column('module_id', sa.Integer(), nullable=True),
        sa.Column('lesson_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('assessment_type', sa.Enum('QUIZ', 'EXAM', 'ASSIGNMENT', name='assessmenttype'), nullable=False),
        sa.Column('passing_score', sa.Integer(), nullable=False),
        sa.Column('time_limit_minutes', sa.Integer(), nullable=False),
        sa.Column('is_published', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['module_id'], ['modules.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['lesson_id'], ['lessons.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_assessments_id'), 'assessments', ['id'], unique=False)
    op.create_index(op.f('ix_assessments_course_id'), 'assessments', ['course_id'], unique=False)

    # 5. questions table
    op.create_table(
        'questions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('assessment_id', sa.Integer(), nullable=False),
        sa.Column('question_text', sa.Text(), nullable=False),
        sa.Column('question_type', sa.Enum('MCQ', 'CODING', 'SHORT_ANSWER', name='questiontype'), nullable=False),
        sa.Column('options', sa.JSON(), nullable=False),
        sa.Column('correct_answer', sa.String(length=100), nullable=False),
        sa.Column('points', sa.Integer(), nullable=False),
        sa.Column('explanation', sa.Text(), nullable=True),
        sa.Column('order_index', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_questions_id'), 'questions', ['id'], unique=False)
    op.create_index(op.f('ix_questions_assessment_id'), 'questions', ['assessment_id'], unique=False)

    # 6. assessment_attempts table
    op.create_table(
        'assessment_attempts',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('assessment_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('score', sa.Float(), nullable=False),
        sa.Column('total_points', sa.Integer(), nullable=False),
        sa.Column('percentage', sa.Float(), nullable=False),
        sa.Column('passed', sa.Boolean(), nullable=False),
        sa.Column('user_answers', sa.JSON(), nullable=False),
        sa.Column('detailed_results', sa.JSON(), nullable=True),
        sa.Column('is_completed', sa.Boolean(), nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=False),
        sa.Column('submitted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_assessment_attempts_id'), 'assessment_attempts', ['id'], unique=False)
    op.create_index(op.f('ix_assessment_attempts_assessment_id'), 'assessment_attempts', ['assessment_id'], unique=False)
    op.create_index(op.f('ix_assessment_attempts_user_id'), 'assessment_attempts', ['user_id'], unique=False)

    # 7. submissions table
    op.create_table(
        'submissions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('course_id', sa.Integer(), nullable=False),
        sa.Column('lesson_id', sa.Integer(), nullable=True),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('github_url', sa.String(length=500), nullable=True),
        sa.Column('submission_url', sa.String(length=500), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('PENDING', 'UNDER_REVIEW', 'GRADED', 'REJECTED', name='submissionstatus'), nullable=False),
        sa.Column('grade', sa.Float(), nullable=True),
        sa.Column('trainer_feedback', sa.Text(), nullable=True),
        sa.Column('graded_by', sa.Integer(), nullable=True),
        sa.Column('graded_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['lesson_id'], ['lessons.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['graded_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_submissions_id'), 'submissions', ['id'], unique=False)
    op.create_index(op.f('ix_submissions_course_id'), 'submissions', ['course_id'], unique=False)
    op.create_index(op.f('ix_submissions_student_id'), 'submissions', ['student_id'], unique=False)

    # 8. certificates table
    op.create_table(
        'certificates',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('certificate_code', sa.String(length=64), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('course_id', sa.Integer(), nullable=False),
        sa.Column('issued_at', sa.DateTime(), nullable=False),
        sa.Column('is_revoked', sa.Boolean(), nullable=False),
        sa.Column('revocation_reason', sa.String(length=255), nullable=True),
        sa.Column('revoked_at', sa.DateTime(), nullable=True),
        sa.Column('grade_percentage', sa.Float(), nullable=True),
        sa.Column('metadata_json', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'course_id', name='uq_user_course_certificate'),
    )
    op.create_index(op.f('ix_certificates_id'), 'certificates', ['id'], unique=False)
    op.create_index(op.f('ix_certificates_certificate_code'), 'certificates', ['certificate_code'], unique=True)
    op.create_index(op.f('ix_certificates_user_id'), 'certificates', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_table('certificates')
    op.drop_table('submissions')
    op.drop_table('assessment_attempts')
    op.drop_table('questions')
    op.drop_table('assessments')
    op.drop_table('attendance')
    op.drop_table('batch_memberships')
    op.drop_table('batches')
