"""add users and security
Revision ID: 002_add_users_and_security
Revises: 001_initial_schema
Create Date: 2026-09-07 14:00:00.000000
"""
from typing import Sequence, Union
from alembic import op # type: ignore
import sqlalchemy as sa # type: ignore

revision: str = '002_add_users_and_security'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=150), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # 2. Add user_id to projects
    op.add_column('projects', sa.Column('user_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_projects_user_id', 'projects', 'users', ['user_id'], ['id'], ondelete='SET NULL')
    op.create_index(op.f('ix_projects_user_id'), 'projects', ['user_id'], unique=False)

    # 3. Add user_id to tasks
    op.add_column('tasks', sa.Column('user_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_tasks_user_id', 'tasks', 'users', ['user_id'], ['id'], ondelete='SET NULL')
    op.create_index(op.f('ix_tasks_user_id'), 'tasks', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_constraint('fk_tasks_user_id', 'tasks', type_='foreignkey')
    op.drop_index(op.f('ix_tasks_user_id'), table_name='tasks')
    op.drop_column('tasks', 'user_id')

    op.drop_constraint('fk_projects_user_id', 'projects', type_='foreignkey')
    op.drop_index(op.f('ix_projects_user_id'), table_name='projects')
    op.drop_column('projects', 'user_id')

    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')
