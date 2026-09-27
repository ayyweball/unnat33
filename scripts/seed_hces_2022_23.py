"""
scripts/seed_hces_2022_23.py

Transactional, idempotent ingestion script for official MoSPI Household Consumption
Expenditure Survey (HCES) 2022-23 Fact Sheet data.
"""

import os
import sys
from pathlib import Path
from decimal import Decimal
import json

backend_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_root))

from sqlalchemy import text
from app.db.database import engine
from scripts.hces_data import (
    STATE_NAME_ALIASES,
    STATE_MPCE_DATA,
    CONSUMPTION_CATEGORIES,
    FRACTILE_CLASSES,
    HOUSEHOLD_TYPES,
    SOCIAL_GROUPS,
)

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


def seed_hces_data():
    print('=' * 75)
    print('SEEDING HCES 2022-23 (HOUSEHOLD CONSUMPTION EXPENDITURE SURVEY)')
    print('Authoritative Source: MoSPI / NSSO Fact Sheet 2022-23')
    print('=' * 75)

    with engine.begin() as conn:
        # 1. Survey Metadata
        print('1. Seeding official survey metadata...')
        methodology_text = (
            'Multistage stratified sampling design considering villages/urban blocks '
            'as first stage units (FSUs) and households as ultimate stage units (USUs) '
            'using Simple Random Sampling Without Replacement (SRSWOR). Computer-Assisted '
            'Personal Interview (CAPI) method adopted covering 405 items across 3 questionnaires: '
            'FDQ (Food), CSQ (Consumables and Services), and DGQ (Durable Goods), along with HCQ '
            'canvassed in selected households in 3 separate monthly visits in a quarter.'
        )
        imputation_notes = (
            '(a) Without Imputation: Imputes values at collection for consumption out of home-grown '
            'stock, gifts, loans, free collection, and goods received in exchange of goods and services.\n'
            '(b) With Imputation: Extends (a) by additionally imputing the value figures of free social '
            'welfare transfers received free of cost (food items: Rice, Wheat/Atta, Jowar, Bajra, Maize, '
            'Ragi, Barley, Small Millets, Pulses, Gram, Salt, Sugar, Edible Oil; and non-food items: Laptop/PC, '
            'Tablet, Mobile Handset, Bicycle, Motor Cycle/Scooty, School uniform, Footwear). '
            'Values of free education and health services (e.g. PM-JAY) have NOT been imputed.'
        )

        conn.execute(
            text('''
                INSERT INTO hces_survey_metadata (
                    survey_name, survey_year, survey_period, publisher,
                    coverage_summary, total_villages, total_urban_blocks,
                    total_sample_households, rural_sample_households, urban_sample_households,
                    methodology, imputation_methodology_notes, questionnaires, metadata_info
                ) VALUES (
                    :survey_name, :survey_year, :survey_period, :publisher,
                    :coverage_summary, :total_villages, :total_urban_blocks,
                    :total_sample_households, :rural_sample_households, :urban_sample_households,
                    :methodology, :imputation_methodology_notes, :questionnaires, :metadata_info
                )
                ON CONFLICT (survey_name) DO UPDATE SET
                    survey_period = EXCLUDED.survey_period,
                    publisher = EXCLUDED.publisher,
                    total_villages = EXCLUDED.total_villages,
                    total_urban_blocks = EXCLUDED.total_urban_blocks,
                    total_sample_households = EXCLUDED.total_sample_households,
                    rural_sample_households = EXCLUDED.rural_sample_households,
                    urban_sample_households = EXCLUDED.urban_sample_households,
                    methodology = EXCLUDED.methodology,
                    imputation_methodology_notes = EXCLUDED.imputation_methodology_notes;
            '''),
            {
                'survey_name': 'Household Consumption Expenditure Survey: 2022-23',
                'survey_year': '2022-23',
                'survey_period': 'August, 2022 - July, 2023',
                'publisher': 'Government of India, Ministry of Statistics and Programme Implementation, NSSO',
                'coverage_summary': 'Whole of the Indian Union except a few inaccessible villages in Andaman and Nicobar Islands.',
                'total_villages': 8723,
                'total_urban_blocks': 6115,
                'total_sample_households': 261746,
                'rural_sample_households': 155014,
                'urban_sample_households': 106732,
                'methodology': methodology_text,
                'imputation_methodology_notes': imputation_notes,
                'questionnaires': json.dumps(['FDQ', 'CSQ', 'DGQ', 'HCQ']),
                'metadata_info': json.dumps({'mode': 'CAPI', 'item_count': 405, 'visit_count': 3})
            }
        )

        # 2. DataSource Catalog
        print('2. Registering DataSource catalog entry...')
        total_records_est = len(STATE_MPCE_DATA) * 2 + len(CONSUMPTION_CATEGORIES) * 4 + len(FRACTILE_CLASSES) * 4 + len(HOUSEHOLD_TYPES) * 2 + len(SOCIAL_GROUPS) * 4
        conn.execute(
            text('''
                INSERT INTO data_sources (
                    name, source_type, description, url, record_count, status, metadata_info, updated_at
                ) VALUES (
                    :name, :source_type, :description, :url, :record_count, :status, :metadata_info, NOW()
                )
                ON CONFLICT (name) DO UPDATE SET
                    description = EXCLUDED.description,
                    url = EXCLUDED.url,
                    record_count = EXCLUDED.record_count,
                    status = EXCLUDED.status,
                    metadata_info = EXCLUDED.metadata_info,
                    updated_at = NOW();
            '''),
            {
                'name': 'HCES 2022-23',
                'source_type': 'government_portal',
                'description': 'MoSPI NSSO Household Consumption Expenditure Survey 2022-23 Fact Sheet dataset detailing rural and urban MPCE, consumption item shares, fractiles, and demographic averages.',
                'url': 'https://www.mospi.gov.in',
                'record_count': total_records_est,
                'status': 'active',
                'metadata_info': json.dumps({'survey_period': 'August 2022 - July 2023', 'publisher': 'MoSPI NSSO'})
            }
        )

        # 3. State & National MPCE
        print('3. Seeding State & National MPCE (Statements 8, 18, and Page 25)...')
        db_states = conn.execute(text('SELECT id, state_name FROM states;')).fetchall()
        db_state_map = {r[1].upper(): r[0] for r in db_states}

        state_insert_sql = text('''
            INSERT INTO hces_state_mpce (
                state_id, state_name, geographic_level, survey_year, estimate_type,
                rural_mpce, urban_mpce, rural_urban_difference_pct,
                sample_households_rural, sample_households_urban, sample_households_total,
                estimated_households_rural_hundreds, estimated_households_urban_hundreds,
                estimated_households_total_hundreds,
                source, publisher, survey_period, methodology_notes
            ) VALUES (
                :state_id, :state_name, :geographic_level, :survey_year, :estimate_type,
                :rural_mpce, :urban_mpce, :diff_pct,
                :sample_r, :sample_u, :sample_tot,
                :est_r, :est_u, :est_tot,
                'HCES 2022-23', 'Government of India / MoSPI', 'August 2022 - July 2023', :method_notes
            )
            ON CONFLICT (state_name, survey_year, estimate_type) DO UPDATE SET
                state_id = EXCLUDED.state_id,
                rural_mpce = EXCLUDED.rural_mpce,
                urban_mpce = EXCLUDED.urban_mpce,
                rural_urban_difference_pct = EXCLUDED.rural_urban_difference_pct,
                sample_households_rural = EXCLUDED.sample_households_rural,
                sample_households_urban = EXCLUDED.sample_households_urban,
                sample_households_total = EXCLUDED.sample_households_total,
                estimated_households_rural_hundreds = EXCLUDED.estimated_households_rural_hundreds,
                estimated_households_urban_hundreds = EXCLUDED.estimated_households_urban_hundreds,
                estimated_households_total_hundreds = EXCLUDED.estimated_households_total_hundreds;
        ''')

        state_records_count = 0
        for entry in STATE_MPCE_DATA:
            hces_name, wout_r, wout_u, with_r, with_u, s_r, s_u, e_r, e_u = entry
            is_national = (hces_name.lower() == 'all-india')
            geo_level = 'national' if is_national else 'state'

            state_id = None
            if not is_national:
                lookup_key = STATE_NAME_ALIASES.get(hces_name.upper(), hces_name.upper())
                if lookup_key in db_state_map:
                    state_id = db_state_map[lookup_key]
                else:
                    raise ValueError(f"Could not map HCES state '{hces_name}' to existing states table!")

            s_tot = (s_r or 0) + (s_u or 0)
            e_tot = (e_r or 0) + (e_u or 0)

            # Record A: without_imputation
            diff_wout = round(((Decimal(wout_u) - Decimal(wout_r)) / Decimal(wout_r)) * Decimal(100), 2)
            conn.execute(state_insert_sql, {
                'state_id': state_id,
                'state_name': hces_name.upper(),
                'geographic_level': geo_level,
                'survey_year': '2022-23',
                'estimate_type': 'without_imputation',
                'rural_mpce': wout_r,
                'urban_mpce': wout_u,
                'diff_pct': diff_wout,
                'sample_r': s_r,
                'sample_u': s_u,
                'sample_tot': s_tot,
                'est_r': e_r,
                'est_u': e_u,
                'est_tot': e_tot,
                'method_notes': 'NSS standard practice: consumption out of home-grown stock, gifts, loans, etc. Without free social welfare transfers.',
            })
            state_records_count += 1

            # Record B: with_imputation
            diff_with = round(((Decimal(with_u) - Decimal(with_r)) / Decimal(with_r)) * Decimal(100), 2)
            conn.execute(state_insert_sql, {
                'state_id': state_id,
                'state_name': hces_name.upper(),
                'geographic_level': geo_level,
                'survey_year': '2022-23',
                'estimate_type': 'with_imputation',
                'rural_mpce': with_r,
                'urban_mpce': with_u,
                'diff_pct': diff_with,
                'sample_r': s_r,
                'sample_u': s_u,
                'sample_tot': s_tot,
                'est_r': e_r,
                'est_u': e_u,
                'est_tot': e_tot,
                'method_notes': 'Includes value of items received free of cost through social welfare programmes. Free health and education not imputed.',
            })
            state_records_count += 1

        print(f'   Inserted/Updated {state_records_count} state & national MPCE records (Expected: 74).')
        assert state_records_count == 74, f'Expected 74 state MPCE rows, got {state_records_count}'

        # 4. Consumption Categories
        print('4. Seeding Consumption Categories (Statements 5 & 15: 24 items x 2 sectors x 2 types = 96 rows)...')
        cat_insert_sql = text('''
            INSERT INTO hces_consumption_category (
                survey_year, estimate_type, sector, category_type,
                item_group, item_code, display_order, mpce_amount, share_percentage,
                notes, source, publisher, geographic_level
            ) VALUES (
                '2022-23', :estimate_type, :sector, :category_type,
                :item_group, :item_code, :display_order, :mpce_amount, :share_pct,
                :notes, 'HCES 2022-23', 'Government of India / MoSPI', 'national'
            )
            ON CONFLICT (survey_year, estimate_type, sector, item_group) DO UPDATE SET
                category_type = EXCLUDED.category_type,
                item_code = EXCLUDED.item_code,
                display_order = EXCLUDED.display_order,
                mpce_amount = EXCLUDED.mpce_amount,
                share_percentage = EXCLUDED.share_percentage,
                notes = EXCLUDED.notes;
        ''')

        cat_records_count = 0
        for item in CONSUMPTION_CATEGORIES:
            order, group, code, ctype, notes, wout_r_amt, wout_r_pct, wout_u_amt, wout_u_pct, with_r_amt, with_r_pct, with_u_amt, with_u_pct = item

            # 1. without_imputation - rural
            conn.execute(cat_insert_sql, {
                'estimate_type': 'without_imputation', 'sector': 'rural', 'category_type': ctype,
                'item_group': group, 'item_code': code, 'display_order': order,
                'mpce_amount': wout_r_amt, 'share_pct': wout_r_pct, 'notes': notes,
            })
            # 2. without_imputation - urban
            conn.execute(cat_insert_sql, {
                'estimate_type': 'without_imputation', 'sector': 'urban', 'category_type': ctype,
                'item_group': group, 'item_code': code, 'display_order': order,
                'mpce_amount': wout_u_amt, 'share_pct': wout_u_pct, 'notes': notes,
            })
            # 3. with_imputation - rural
            conn.execute(cat_insert_sql, {
                'estimate_type': 'with_imputation', 'sector': 'rural', 'category_type': ctype,
                'item_group': group, 'item_code': code, 'display_order': order,
                'mpce_amount': with_r_amt, 'share_pct': with_r_pct, 'notes': notes,
            })
            # 4. with_imputation - urban
            conn.execute(cat_insert_sql, {
                'estimate_type': 'with_imputation', 'sector': 'urban', 'category_type': ctype,
                'item_group': group, 'item_code': code, 'display_order': order,
                'mpce_amount': with_u_amt, 'share_pct': with_u_pct, 'notes': notes,
            })
            cat_records_count += 4

        print(f'   Inserted/Updated {cat_records_count} consumption category records (Expected: 96).')
        assert cat_records_count == 96, f'Expected 96 category rows, got {cat_records_count}'

        # 5. Fractile Classes
        print('5. Seeding Fractile Classes (Statements 4 & 14: 13 classes x 2 sectors x 2 types = 52 rows)...')
        fractile_insert_sql = text('''
            INSERT INTO hces_fractile_mpce (
                survey_year, estimate_type, sector, fractile_class, fractile_order,
                mpce_amount, source, publisher, geographic_level
            ) VALUES (
                '2022-23', :estimate_type, :sector, :fractile_class, :fractile_order,
                :mpce_amount, 'HCES 2022-23', 'Government of India / MoSPI', 'national'
            )
            ON CONFLICT (survey_year, estimate_type, sector, fractile_class) DO UPDATE SET
                fractile_order = EXCLUDED.fractile_order,
                mpce_amount = EXCLUDED.mpce_amount;
        ''')

        fractile_records_count = 0
        for f in FRACTILE_CLASSES:
            order, f_class, wout_r, wout_u, with_r, with_u = f

            # 1. without_imputation - rural
            conn.execute(fractile_insert_sql, {
                'estimate_type': 'without_imputation', 'sector': 'rural',
                'fractile_class': f_class, 'fractile_order': order, 'mpce_amount': wout_r
            })
            # 2. without_imputation - urban
            conn.execute(fractile_insert_sql, {
                'estimate_type': 'without_imputation', 'sector': 'urban',
                'fractile_class': f_class, 'fractile_order': order, 'mpce_amount': wout_u
            })
            # 3. with_imputation - rural
            conn.execute(fractile_insert_sql, {
                'estimate_type': 'with_imputation', 'sector': 'rural',
                'fractile_class': f_class, 'fractile_order': order, 'mpce_amount': with_r
            })
            # 4. with_imputation - urban
            conn.execute(fractile_insert_sql, {
                'estimate_type': 'with_imputation', 'sector': 'urban',
                'fractile_class': f_class, 'fractile_order': order, 'mpce_amount': with_u
            })
            fractile_records_count += 4

        print(f'   Inserted/Updated {fractile_records_count} fractile records (Expected: 52).')
        assert fractile_records_count == 52, f'Expected 52 fractile rows, got {fractile_records_count}'

        # 6. Demographic MPCE
        print('6. Seeding Demographic MPCE (Household Types & Social Groups: 46 rows)...')
        demo_insert_sql = text('''
            INSERT INTO hces_demographic_mpce (
                survey_year, estimate_type, demographic_type, group_name, sector,
                mpce_amount, source, publisher, geographic_level
            ) VALUES (
                '2022-23', :estimate_type, :demographic_type, :group_name, :sector,
                :mpce_amount, 'HCES 2022-23', 'Government of India / MoSPI', 'national'
            )
            ON CONFLICT (survey_year, estimate_type, demographic_type, group_name, sector) DO UPDATE SET
                mpce_amount = EXCLUDED.mpce_amount;
        ''')

        demo_records_count = 0
        for h in HOUSEHOLD_TYPES:
            sec, gname, wout_val, with_val = h
            conn.execute(demo_insert_sql, {
                'estimate_type': 'without_imputation', 'demographic_type': 'household_type',
                'group_name': gname, 'sector': sec, 'mpce_amount': wout_val
            })
            conn.execute(demo_insert_sql, {
                'estimate_type': 'with_imputation', 'demographic_type': 'household_type',
                'group_name': gname, 'sector': sec, 'mpce_amount': with_val
            })
            demo_records_count += 2

        for s in SOCIAL_GROUPS:
            gname, wout_r, wout_u, with_r, with_u = s
            conn.execute(demo_insert_sql, {
                'estimate_type': 'without_imputation', 'demographic_type': 'social_group',
                'group_name': gname, 'sector': 'rural', 'mpce_amount': wout_r
            })
            conn.execute(demo_insert_sql, {
                'estimate_type': 'without_imputation', 'demographic_type': 'social_group',
                'group_name': gname, 'sector': 'urban', 'mpce_amount': wout_u
            })
            conn.execute(demo_insert_sql, {
                'estimate_type': 'with_imputation', 'demographic_type': 'social_group',
                'group_name': gname, 'sector': 'rural', 'mpce_amount': with_r
            })
            conn.execute(demo_insert_sql, {
                'estimate_type': 'with_imputation', 'demographic_type': 'social_group',
                'group_name': gname, 'sector': 'urban', 'mpce_amount': with_u
            })
            demo_records_count += 4

        print(f'   Inserted/Updated {demo_records_count} demographic records (Expected: 46).')
        assert demo_records_count == 46, f'Expected 46 demographic rows, got {demo_records_count}'

    print('=' * 75)
    print('HCES 2022-23 SEEDING COMPLETED SUCCESSFULLY!')
    print('=' * 75)


if __name__ == '__main__':
    seed_hces_data()
