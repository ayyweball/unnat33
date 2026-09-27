"""
scripts/seed_pwc_evidence.py

Idempotent ingestion of official PwC Voice of the Consumer 2025: India perspective
dataset into PostgreSQL 'data_sources' table.
"""

import os
import sys
from pathlib import Path
import json

backend_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_root))

from sqlalchemy import text
from app.db.database import engine

PWC_DATA = {
    "source": "PwC Voice of the Consumer 2025: India perspective",
    "subtitle": "A value recipe for the food industry",
    "publication_date": "September 2025",
    "survey_period": "January - February 2025",
    "publisher": "PricewaterhouseCoopers Private Limited (PwC India)",
    "geography": "India",
    "survey_year": 2025,
    "sample_size": 1031,
    "coverage": "21 states and 2 union territories across 29 cities",
    "methodology": "Online consumer survey of 1,031 adult respondents across 29 Indian cities and towns, covering grocery shopping, nutrition, health technology, climate, and spending behaviors.",
    "demographics": {
        "gender": {"male_pct": 55, "female_pct": 45},
        "generation": {"millennial_pct": 45, "gen_z_pct": 40, "gen_x_pct": 12, "older_generations_pct": 3},
        "location": {"large_city_pct": 67, "suburban_pct": 19, "small_city_pct": 9, "rural_pct": 5}
    },
    "domain_evidence": {
        "food": [
            "40% of surveyed consumers ranked taste among the top three factors when selecting food items, 39% ranked price, and 38% ranked high nutritional value.",
            "84% of surveyed consumers were extremely or very concerned about food safety, pesticide use, and chemical additives.",
            "Health benefits and higher nutritional value were cited as the primary driver for switching food brands (29% ranked 1-3, 21% ranked 1), ahead of better taste (28%) and value for money (26%).",
            "78% of surveyed consumers plan to increase their intake of fresh produce over the next six months.",
            "74% of surveyed consumers stated their food choices are rooted in cultural heritage and longstanding traditions.",
            "One in five snacks consumed is a healthy snack (low calorie, low fat, or gut health oriented)."
        ],
        "agriculture": [
            "53% of Indian respondents prefer locally produced food even if it is more expensive (compared to 44% globally).",
            "73% of surveyed consumers express willingness to pay more for food to support environmental sustainability and healthy land practices (compared to 44% globally).",
            "45% of surveyed consumers rank pesticide-free products as their most important sustainability priority when buying food.",
            "44% of surveyed consumers reported growing some of their own food (e.g. vegetable garden or herbs) to offset food costs.",
            "Consumer demand is driving agribusiness adoption of AI-driven precision agriculture to minimize chemical and pesticide usage."
        ],
        "retail": [
            "Indian grocery shoppers use multiple channels: 72% used supermarkets in the past year, 60% used local convenience retailers, and 55% used on-demand grocery delivery platforms.",
            "Cost-saving shopping tactics: 46% shop across different stores to maximize offers, 46% switch to discount/store-branded products, and 46% use coupons/promotions.",
            "46% of surveyed consumers buy ready-to-eat meals, 41% order takeout, and 38% eat out at least once a week.",
            "Convenience convergence: 34% gravitate toward discount retailers, while quick-commerce delivery adoption reaches 55%."
        ],
        "fmcg": [
            "With 39% of consumers identifying as financially coping or insecure, FMCG brands are introducing smaller, affordable access packs in premium categories.",
            "49% of surveyed consumers actively avoid products harmful to the environment, and 49% prefer sustainable packaging.",
            "80% of surveyed consumers use at least one healthcare app or wearable technology to track diet, exercise, or health.",
            "60% of surveyed consumers are open to using generative AI to create personalized diet and nutrition plans; 56% for meal planning.",
            "Traceability demand: Brands are upgrading packaging with QR codes enabling batch-level traceability to lab test reports confirming pesticide-free ingredients."
        ]
    }
}


def seed_pwc():
    print("Seeding PwC Voice of the Consumer 2025 into data_sources...")
    with engine.begin() as conn:
        conn.execute(
            text("""
                INSERT INTO data_sources (
                    name, source_type, description, url, record_count, status, metadata_info, updated_at
                ) VALUES (
                    :name, :source_type, :description, :url, :record_count, :status, :metadata_info, NOW()
                )
                ON CONFLICT (name) DO UPDATE SET
                    source_type = EXCLUDED.source_type,
                    description = EXCLUDED.description,
                    url = EXCLUDED.url,
                    record_count = EXCLUDED.record_count,
                    status = EXCLUDED.status,
                    metadata_info = EXCLUDED.metadata_info,
                    updated_at = NOW();
            """),
            {
                "name": "PwC Voice of the Consumer 2025: India perspective",
                "source_type": "industry_survey",
                "description": "PwC Voice of the Consumer 2025: India perspective. Survey of 1,031 Indian consumers across 21 states and 2 UTs covering food choices, nutrition, price sensitivity, retail channels, and sustainability.",
                "url": "https://www.pwc.in",
                "record_count": 1031,
                "status": "active",
                "metadata_info": json.dumps(PWC_DATA)
            }
        )
    print("PwC Voice of the Consumer 2025 seeded successfully!")


if __name__ == "__main__":
    seed_pwc()
