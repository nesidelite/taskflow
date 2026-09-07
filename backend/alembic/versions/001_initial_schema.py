"""initial schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-05 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op # type: ignore
import sqlalchemy as sa # type: ignore

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create projects table
    op.create_table(
        'projects',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('color', sa.String(length=30), server_default='#3b82f6', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_projects_id'), 'projects', ['id'], unique=False)
    op.create_index(op.f('ix_projects_title'), 'projects', ['title'], unique=False)

    # 2. Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=20), server_default='PENDING', nullable=False),
        sa.Column('priority', sa.String(length=20), server_default='MEDIUM', nullable=False),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tasks_id'), 'tasks', ['id'], unique=False)
    op.create_index(op.f('ix_tasks_title'), 'tasks', ['title'], unique=False)
    op.create_index(op.f('ix_tasks_status'), 'tasks', ['status'], unique=False)
    op.create_index(op.f('ix_tasks_priority'), 'tasks', ['priority'], unique=False)
    op.create_index(op.f('ix_tasks_project_id'), 'tasks', ['project_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_tasks_project_id'), table_name='tasks')
    op.drop_index(op.f('ix_tasks_priority'), table_name='tasks')
    op.drop_index(op.f('ix_tasks_status'), table_name='tasks')
    op.drop_index(op.f('ix_tasks_title'), table_name='tasks')
    op.drop_index(op.f('ix_tasks_id'), table_name='tasks')
    op.drop_table('tasks')

    op.drop_index(op.f('ix_projects_title'), table_name='projects')
    op.drop_index(op.f('ix_projects_id'), table_name='projects')
    op.drop_table('projects')
