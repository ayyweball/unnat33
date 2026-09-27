"""create hces tables

Revision ID: c1f5a9b8e2d4
Revises: bf2fefb18fea
Create Date: 2026-09-27 11:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'c1f5a9b8e2d4'
down_revision: Union[str, None] = 'bf2fefb18fea'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. hces_state_mpce
    op.create_table(
        'hces_state_mpce',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('state_id', sa.Integer(), nullable=True),
        sa.Column('state_name', sa.String(length=100), nullable=False),
        sa.Column('geographic_level', sa.String(length=20), nullable=False),
        sa.Column('survey_year', sa.String(length=20), nullable=False, server_default='2022-23'),
        sa.Column('estimate_type', sa.String(length=30), nullable=False),
        sa.Column('rural_mpce', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('urban_mpce', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('rural_urban_difference_pct', sa.Numeric(precision=6, scale=2), nullable=True),
        sa.Column('sample_households_rural', sa.Integer(), nullable=True),
        sa.Column('sample_households_urban', sa.Integer(), nullable=True),
        sa.Column('sample_households_total', sa.Integer(), nullable=True),
        sa.Column('estimated_households_rural_hundreds', sa.BigInteger(), nullable=True),
        sa.Column('estimated_households_urban_hundreds', sa.BigInteger(), nullable=True),
        sa.Column('estimated_households_total_hundreds', sa.BigInteger(), nullable=True),
        sa.Column('source', sa.String(length=100), nullable=False, server_default='HCES 2022-23'),
        sa.Column('publisher', sa.String(length=150), nullable=False, server_default='Government of India / MoSPI'),
        sa.Column('survey_period', sa.String(length=50), nullable=False, server_default='August 2022 - July 2023'),
        sa.Column('methodology_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['state_id'], ['states.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('state_name', 'survey_year', 'estimate_type', name='uq_hces_state_year_estimate')
    )
    op.create_index(op.f('ix_hces_state_mpce_id'), 'hces_state_mpce', ['id'], unique=False)
    op.create_index(op.f('ix_hces_state_mpce_state_id'), 'hces_state_mpce', ['state_id'], unique=False)
    op.create_index(op.f('ix_hces_state_mpce_state_name'), 'hces_state_mpce', ['state_name'], unique=False)
    op.create_index(op.f('ix_hces_state_mpce_geographic_level'), 'hces_state_mpce', ['geographic_level'], unique=False)
    op.create_index(op.f('ix_hces_state_mpce_estimate_type'), 'hces_state_mpce', ['estimate_type'], unique=False)

    # 2. hces_consumption_category
    op.create_table(
        'hces_consumption_category',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('survey_year', sa.String(length=20), nullable=False, server_default='2022-23'),
        sa.Column('estimate_type', sa.String(length=30), nullable=False),
        sa.Column('sector', sa.String(length=10), nullable=False),
        sa.Column('category_type', sa.String(length=20), nullable=False),
        sa.Column('item_group', sa.String(length=100), nullable=False),
        sa.Column('item_code', sa.String(length=50), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('mpce_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('share_percentage', sa.Numeric(precision=6, scale=2), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('source', sa.String(length=100), nullable=False, server_default='HCES 2022-23'),
        sa.Column('publisher', sa.String(length=150), nullable=False, server_default='Government of India / MoSPI'),
        sa.Column('geographic_level', sa.String(length=20), nullable=False, server_default='national'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('survey_year', 'estimate_type', 'sector', 'item_group', name='uq_hces_category_item')
    )
    op.create_index(op.f('ix_hces_consumption_category_id'), 'hces_consumption_category', ['id'], unique=False)
    op.create_index(op.f('ix_hces_consumption_category_estimate_type'), 'hces_consumption_category', ['estimate_type'], unique=False)
    op.create_index(op.f('ix_hces_consumption_category_sector'), 'hces_consumption_category', ['sector'], unique=False)
    op.create_index(op.f('ix_hces_consumption_category_category_type'), 'hces_consumption_category', ['category_type'], unique=False)
    op.create_index(op.f('ix_hces_consumption_category_item_group'), 'hces_consumption_category', ['item_group'], unique=False)

    # 3. hces_fractile_mpce
    op.create_table(
        'hces_fractile_mpce',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('survey_year', sa.String(length=20), nullable=False, server_default='2022-23'),
        sa.Column('estimate_type', sa.String(length=30), nullable=False),
        sa.Column('sector', sa.String(length=10), nullable=False),
        sa.Column('fractile_class', sa.String(length=20), nullable=False),
        sa.Column('fractile_order', sa.Integer(), nullable=False),
        sa.Column('mpce_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('source', sa.String(length=100), nullable=False, server_default='HCES 2022-23'),
        sa.Column('publisher', sa.String(length=150), nullable=False, server_default='Government of India / MoSPI'),
        sa.Column('geographic_level', sa.String(length=20), nullable=False, server_default='national'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('survey_year', 'estimate_type', 'sector', 'fractile_class', name='uq_hces_fractile_class')
    )
    op.create_index(op.f('ix_hces_fractile_mpce_id'), 'hces_fractile_mpce', ['id'], unique=False)
    op.create_index(op.f('ix_hces_fractile_mpce_estimate_type'), 'hces_fractile_mpce', ['estimate_type'], unique=False)
    op.create_index(op.f('ix_hces_fractile_mpce_sector'), 'hces_fractile_mpce', ['sector'], unique=False)
    op.create_index(op.f('ix_hces_fractile_mpce_fractile_class'), 'hces_fractile_mpce', ['fractile_class'], unique=False)

    # 4. hces_demographic_mpce
    op.create_table(
        'hces_demographic_mpce',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('survey_year', sa.String(length=20), nullable=False, server_default='2022-23'),
        sa.Column('estimate_type', sa.String(length=30), nullable=False),
        sa.Column('demographic_type', sa.String(length=30), nullable=False),
        sa.Column('group_name', sa.String(length=100), nullable=False),
        sa.Column('sector', sa.String(length=10), nullable=False),
        sa.Column('mpce_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('source', sa.String(length=100), nullable=False, server_default='HCES 2022-23'),
        sa.Column('publisher', sa.String(length=150), nullable=False, server_default='Government of India / MoSPI'),
        sa.Column('geographic_level', sa.String(length=20), nullable=False, server_default='national'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('survey_year', 'estimate_type', 'demographic_type', 'group_name', 'sector', name='uq_hces_demo_group')
    )
    op.create_index(op.f('ix_hces_demographic_mpce_id'), 'hces_demographic_mpce', ['id'], unique=False)
    op.create_index(op.f('ix_hces_demographic_mpce_estimate_type'), 'hces_demographic_mpce', ['estimate_type'], unique=False)
    op.create_index(op.f('ix_hces_demographic_mpce_demographic_type'), 'hces_demographic_mpce', ['demographic_type'], unique=False)
    op.create_index(op.f('ix_hces_demographic_mpce_group_name'), 'hces_demographic_mpce', ['group_name'], unique=False)
    op.create_index(op.f('ix_hces_demographic_mpce_sector'), 'hces_demographic_mpce', ['sector'], unique=False)

    # 5. hces_survey_metadata
    op.create_table(
        'hces_survey_metadata',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('survey_name', sa.String(length=150), nullable=False),
        sa.Column('survey_year', sa.String(length=20), nullable=False),
        sa.Column('survey_period', sa.String(length=100), nullable=False),
        sa.Column('publisher', sa.String(length=150), nullable=False),
        sa.Column('coverage_summary', sa.Text(), nullable=True),
        sa.Column('total_villages', sa.Integer(), nullable=True),
        sa.Column('total_urban_blocks', sa.Integer(), nullable=True),
        sa.Column('total_sample_households', sa.Integer(), nullable=True),
        sa.Column('rural_sample_households', sa.Integer(), nullable=True),
        sa.Column('urban_sample_households', sa.Integer(), nullable=True),
        sa.Column('methodology', sa.Text(), nullable=True),
        sa.Column('imputation_methodology_notes', sa.Text(), nullable=True),
        sa.Column('questionnaires', sa.JSON(), nullable=True),
        sa.Column('metadata_info', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('survey_name')
    )
    op.create_index(op.f('ix_hces_survey_metadata_id'), 'hces_survey_metadata', ['id'], unique=False)


def downgrade() -> None:
    op.drop_table('hces_survey_metadata')
    op.drop_table('hces_demographic_mpce')
    op.drop_table('hces_fractile_mpce')
    op.drop_table('hces_consumption_category')
    op.drop_table('hces_state_mpce')

