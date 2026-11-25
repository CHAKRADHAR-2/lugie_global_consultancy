"""add_phone_and_email_verification_to_users

Revision ID: b21295379627
Revises: 56bed27b83f0
Create Date: 2026-11-20 15:15:18.829759

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b21295379627'
down_revision: Union[str, None] = '56bed27b83f0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('is_phone_verified', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('users', sa.Column('email_otp', sa.String(length=10), nullable=True))
    op.add_column('users', sa.Column('email_otp_expires_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('phone_otp', sa.String(length=10), nullable=True))
    op.add_column('users', sa.Column('phone_otp_expires_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'phone_otp_expires_at')
    op.drop_column('users', 'phone_otp')
    op.drop_column('users', 'email_otp_expires_at')
    op.drop_column('users', 'email_otp')
    op.drop_column('users', 'is_phone_verified')
