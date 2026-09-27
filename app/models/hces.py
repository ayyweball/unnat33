from sqlalchemy import (
    Column,
    Integer,
    BigInteger,
    String,
    Text,
    Numeric,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    JSON,
    func,
)
from sqlalchemy.orm import relationship
from app.db.database import Base


class HcesStateMpce(Base):
    """
    Monthly Per Capita Consumption Expenditure (MPCE) for States, Union Territories,
    and All-India from HCES 2022-23 (Statements 8, 18, and Page 25 sample stats).
    """
    __tablename__ = "hces_state_mpce"

    id = Column(Integer, primary_key=True, index=True)
    state_id = Column(
        Integer,
        ForeignKey("states.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    state_name = Column(String(100), nullable=False, index=True)
    geographic_level = Column(String(20), nullable=False, index=True)  # 'state', 'national'
    survey_year = Column(String(20), default="2022-23", nullable=False)
    estimate_type = Column(String(30), nullable=False, index=True)  # 'without_imputation', 'with_imputation'

    # MPCE in Indian Rupee (nominal values)
    rural_mpce = Column(Numeric(10, 2), nullable=False)
    urban_mpce = Column(Numeric(10, 2), nullable=False)
    rural_urban_difference_pct = Column(Numeric(6, 2), nullable=True)  # ((urban - rural) / rural) * 100

    # Survey Sample & Estimated Households from Page 25
    sample_households_rural = Column(Integer, nullable=True)
    sample_households_urban = Column(Integer, nullable=True)
    sample_households_total = Column(Integer, nullable=True)
    estimated_households_rural_hundreds = Column(BigInteger, nullable=True)
    estimated_households_urban_hundreds = Column(BigInteger, nullable=True)
    estimated_households_total_hundreds = Column(BigInteger, nullable=True)

    # Provenance
    source = Column(String(100), default="HCES 2022-23", nullable=False)
    publisher = Column(String(150), default="Government of India / MoSPI", nullable=False)
    survey_period = Column(String(50), default="August 2022 - July 2023", nullable=False)
    methodology_notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship to existing states table
    state = relationship("State", backref="hces_mpce_records")

    __table_args__ = (
        UniqueConstraint("state_name", "survey_year", "estimate_type", name="uq_hces_state_year_estimate"),
    )

    def __repr__(self) -> str:
        return f"<HcesStateMpce state='{self.state_name}' type='{self.estimate_type}' rural={self.rural_mpce} urban={self.urban_mpce}>"


class HcesConsumptionCategory(Base):
    """
    Absolute and percentage break-up of MPCE by item groups at All-India level
    from HCES 2022-23 (Statements 1, 5, 11, 15).
    Contains exactly 24 item groups/aggregates per (sector, estimate_type) combination:
    - 10 Food groups + food total
    - 11 Non-food groups + non-food total
    - all items overall total
    """
    __tablename__ = "hces_consumption_category"

    id = Column(Integer, primary_key=True, index=True)
    survey_year = Column(String(20), default="2022-23", nullable=False)
    estimate_type = Column(String(30), nullable=False, index=True)  # 'without_imputation', 'with_imputation'
    sector = Column(String(10), nullable=False, index=True)  # 'rural', 'urban'
    category_type = Column(String(20), nullable=False, index=True)  # 'food', 'non_food', 'total'
    item_group = Column(String(100), nullable=False, index=True)
    item_code = Column(String(50), nullable=True, index=True)
    display_order = Column(Integer, nullable=False, default=0)

    mpce_amount = Column(Numeric(10, 2), nullable=False)  # MPCE in Rs.
    share_percentage = Column(Numeric(6, 2), nullable=False)  # % share in total MPCE
    notes = Column(Text, nullable=True)  # e.g. '*includes gram', '#includes purchased cooked meals'

    # Provenance
    source = Column(String(100), default="HCES 2022-23", nullable=False)
    publisher = Column(String(150), default="Government of India / MoSPI", nullable=False)
    geographic_level = Column(String(20), default="national", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("survey_year", "estimate_type", "sector", "item_group", name="uq_hces_category_item"),
    )

    def __repr__(self) -> str:
        return f"<HcesConsumptionCategory item='{self.item_group}' sector='{self.sector}' type='{self.estimate_type}' amount={self.mpce_amount}>"


class HcesFractileMpce(Base):
    """
    Average MPCE across 12 fractile classes of MPCE and 'All Classes' at All-India level
    from HCES 2022-23 (Statements 4, 14).
    """
    __tablename__ = "hces_fractile_mpce"

    id = Column(Integer, primary_key=True, index=True)
    survey_year = Column(String(20), default="2022-23", nullable=False)
    estimate_type = Column(String(30), nullable=False, index=True)  # 'without_imputation', 'with_imputation'
    sector = Column(String(10), nullable=False, index=True)  # 'rural', 'urban'
    fractile_class = Column(String(20), nullable=False, index=True)  # e.g. '0-5%', '5-10%', ..., '95-100%', 'All Classes'
    fractile_order = Column(Integer, nullable=False)  # 1 to 13
    mpce_amount = Column(Numeric(10, 2), nullable=False)

    # Provenance
    source = Column(String(100), default="HCES 2022-23", nullable=False)
    publisher = Column(String(150), default="Government of India / MoSPI", nullable=False)
    geographic_level = Column(String(20), default="national", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("survey_year", "estimate_type", "sector", "fractile_class", name="uq_hces_fractile_class"),
    )

    def __repr__(self) -> str:
        return f"<HcesFractileMpce fractile='{self.fractile_class}' sector='{self.sector}' type='{self.estimate_type}' amount={self.mpce_amount}>"


class HcesDemographicMpce(Base):
    """
    Average MPCE by Household Type (Statements 9, 19) and Social Groups (Statements 10, 20)
    at All-India level from HCES 2022-23.
    """
    __tablename__ = "hces_demographic_mpce"

    id = Column(Integer, primary_key=True, index=True)
    survey_year = Column(String(20), default="2022-23", nullable=False)
    estimate_type = Column(String(30), nullable=False, index=True)  # 'without_imputation', 'with_imputation'
    demographic_type = Column(String(30), nullable=False, index=True)  # 'household_type', 'social_group'
    group_name = Column(String(100), nullable=False, index=True)
    sector = Column(String(10), nullable=False, index=True)  # 'rural', 'urban'
    mpce_amount = Column(Numeric(10, 2), nullable=False)

    # Provenance
    source = Column(String(100), default="HCES 2022-23", nullable=False)
    publisher = Column(String(150), default="Government of India / MoSPI", nullable=False)
    geographic_level = Column(String(20), default="national", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("survey_year", "estimate_type", "demographic_type", "group_name", "sector", name="uq_hces_demo_group"),
    )

    def __repr__(self) -> str:
        return f"<HcesDemographicMpce demo='{self.demographic_type}' group='{self.group_name}' sector='{self.sector}' amount={self.mpce_amount}>"


class HcesSurveyMetadata(Base):
    """
    Official survey documentation, sample design, questionnaire structures,
    and imputation methodology notes from HCES 2022-23 Fact Sheet.
    """
    __tablename__ = "hces_survey_metadata"

    id = Column(Integer, primary_key=True, index=True)
    survey_name = Column(String(150), unique=True, nullable=False)
    survey_year = Column(String(20), nullable=False)
    survey_period = Column(String(100), nullable=False)
    publisher = Column(String(150), nullable=False)
    coverage_summary = Column(Text, nullable=True)

    total_villages = Column(Integer, nullable=True)
    total_urban_blocks = Column(Integer, nullable=True)
    total_sample_households = Column(Integer, nullable=True)
    rural_sample_households = Column(Integer, nullable=True)
    urban_sample_households = Column(Integer, nullable=True)

    methodology = Column(Text, nullable=True)
    imputation_methodology_notes = Column(Text, nullable=True)
    questionnaires = Column(JSON, nullable=True)
    metadata_info = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<HcesSurveyMetadata survey='{self.survey_name}'>"

