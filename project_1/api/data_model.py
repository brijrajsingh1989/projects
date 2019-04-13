import datetime

import sqlalchemy
from sqlalchemy.dialects.mysql import TINYINT, MEDIUMTEXT, BINARY
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
Meta = Base.metadata

class Visitors(Base):
    __tablename__ = "evolve_visitors"
    id = sqlalchemy.Column(sqlalchemy.BigInteger, primary_key=True)
    evolve_id = sqlalchemy.Column(sqlalchemy.String(15))
    digital_signature = sqlalchemy.Column(sqlalchemy.String(100))
    os = sqlalchemy.Column(sqlalchemy.String(100))
    uas = sqlalchemy.Column(sqlalchemy.String(1000))
    visiting_ip_address = sqlalchemy.Column(sqlalchemy.String(30))
    browser = sqlalchemy.Column(sqlalchemy.String(50))
    cid = sqlalchemy.Column(sqlalchemy.String(50))
    last_visit_datetime = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.utcnow(), onupdate=datetime.datetime.utcnow())
    entry_timestamp = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.utcnow())


class PaidSearchTracking(Base):
    __tablename__ = "paid_search_tracking"
    id = sqlalchemy.Column(sqlalchemy.BigInteger, primary_key=True)
    evolveID = sqlalchemy.Column(sqlalchemy.String(15))
    first_source = sqlalchemy.Column(sqlalchemy.String(100))
    first_medium = sqlalchemy.Column(sqlalchemy.String(100))
    first_campaign = sqlalchemy.Column(sqlalchemy.String(100))
    first_term = sqlalchemy.Column(sqlalchemy.String(100))
    first_content = sqlalchemy.Column(sqlalchemy.String(100))
    first_gclid = sqlalchemy.Column(sqlalchemy.String(100))
    first_date = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.utcnow)
    last_source = sqlalchemy.Column(sqlalchemy.String(100))
    last_medium = sqlalchemy.Column(sqlalchemy.String(100))
    last_campaign = sqlalchemy.Column(sqlalchemy.String(100))
    last_term = sqlalchemy.Column(sqlalchemy.String(100))
    last_content = sqlalchemy.Column(sqlalchemy.String(100))
    last_gclid = sqlalchemy.Column(sqlalchemy.String(100))
    last_date = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.utcnow)
    first_cid = sqlalchemy.Column(sqlalchemy.String(100))
    last_cid = sqlalchemy.Column(sqlalchemy.String(100))
    external_id = sqlalchemy.Column(sqlalchemy.String(50))
    derived_flag = sqlalchemy.Column(sqlalchemy.String(1))
    insert_date_time = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.utcnow())

class CustomerStepMovement(Base):
    __tablename__ = "evolve_steps"
    id = sqlalchemy.Column(sqlalchemy.BigInteger, primary_key=True)
    evolve_id = sqlalchemy.Column(sqlalchemy.String(15))
    Step_Id = sqlalchemy.Column(sqlalchemy.SmallInteger)
    insert_date_time = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.utcnow())


class CustomerQuoteInfo(Base):
    __tablename__ = "evolve_quotes_quote"
    id = sqlalchemy.Column(sqlalchemy.BigInteger, primary_key=True)
    evolve_id = sqlalchemy.Column(sqlalchemy.String(15))
    gender = sqlalchemy.Column(sqlalchemy.SmallInteger)
    customer_dob = sqlalchemy.Column(sqlalchemy.Date)
    customer_height = sqlalchemy.Column(sqlalchemy.String(10))
    customer_weight = sqlalchemy.Column(sqlalchemy.Float)
    tobacco_user = sqlalchemy.Column(BINARY)
    tobacco_quit_option = sqlalchemy.Column(sqlalchemy.SmallInteger)
    # Alcohol details
    alcohol_user = sqlalchemy.Column(BINARY)
    alcohol_per_week = sqlalchemy.Column(sqlalchemy.SmallInteger)
    zip_code = sqlalchemy.Column(sqlalchemy.Integer)
    overallHeath = sqlalchemy.Column(sqlalchemy.SmallInteger)
    policy_lasts = sqlalchemy.Column(sqlalchemy.SmallInteger)
    coverage_amount = sqlalchemy.Column(sqlalchemy.String(10))
    state = sqlalchemy.Column(sqlalchemy.String(45))
    state_fullname = sqlalchemy.Column(sqlalchemy.String(45))
    city_fullname = sqlalchemy.Column(sqlalchemy.String(45))
    planinsurance = sqlalchemy.Column(sqlalchemy.String(45))
    lga_response_code = sqlalchemy.Column(TINYINT)
    modalPremium = sqlalchemy.Column(sqlalchemy.String(10))
    underwritingClassId = sqlalchemy.Column(sqlalchemy.SmallInteger)
    premium = sqlalchemy.Column(sqlalchemy.Float)
    journey = sqlalchemy.Column(sqlalchemy.String(50))
    journeyId = sqlalchemy.Column(sqlalchemy.String(50))
    insert_date_time = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.utcnow)
    update_date_time = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class CustomerQuoteDataInfo(Base):
    __tablename__ = "evolve_quote_input"
    id = sqlalchemy.Column(sqlalchemy.BigInteger, primary_key=True)
    evolve_id = sqlalchemy.Column(sqlalchemy.String(15))
    policy_lasts = sqlalchemy.Column(sqlalchemy.SmallInteger)
    coverage_amount = sqlalchemy.Column(sqlalchemy.String(10))
    lga_response_code = sqlalchemy.Column(TINYINT)
    premium = sqlalchemy.Column(sqlalchemy.Float)
    insert_date_time = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.utcnow)
    update_date_time = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class CustomerPersonalInfo(Base):
    __tablename__ = "evolve_personal_info"
    id = sqlalchemy.Column(sqlalchemy.BigInteger, primary_key=True)
    evolve_id = sqlalchemy.Column(sqlalchemy.String(10))
    first_name = sqlalchemy.Column(sqlalchemy.String(45))
    last_name = sqlalchemy.Column(sqlalchemy.String(45))
    maiden_last_name = sqlalchemy.Column(sqlalchemy.String(45))
    gender = sqlalchemy.Column(TINYINT)
    customer_dob = sqlalchemy.Column(sqlalchemy.Date)
    customer_height = sqlalchemy.Column(sqlalchemy.String(10))
    customer_weight = sqlalchemy.Column(sqlalchemy.Float)
    mobile_number = sqlalchemy.Column(sqlalchemy.String(20))
    secondary_number = sqlalchemy.Column(sqlalchemy.String(20))
    email_address = sqlalchemy.Column(sqlalchemy.String(45))
    customer_address = sqlalchemy.Column(sqlalchemy.String(200))
    customer_state = sqlalchemy.Column(sqlalchemy.String(45))
    customer_state_short = sqlalchemy.Column(sqlalchemy.String(10))
    customer_city = sqlalchemy.Column(sqlalchemy.String(45))
    zip_code = sqlalchemy.Column(sqlalchemy.Integer)
    permanent_resident = sqlalchemy.Column(BINARY)
    beneficiaryType = sqlalchemy.Column(sqlalchemy.String(45))
    contactType = sqlalchemy.Column(sqlalchemy.String(45))
    optionalContactType = sqlalchemy.Column(sqlalchemy.String(45))
    customer_ssn = sqlalchemy.Column(sqlalchemy.String(20))
    insert_date_time = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.utcnow)
    update_date_time = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


"""
Selfi-Quote
"""


class SnoflakeAttempts(Base):
    __tablename__ = "snf_user_attempts"
    id = sqlalchemy.Column(sqlalchemy.BigInteger, primary_key=True)
    evolve_id = sqlalchemy.Column(sqlalchemy.String(15))
    fingerprint = sqlalchemy.Column(sqlalchemy.String(50))
    attempts = sqlalchemy.Column(sqlalchemy.Integer)
    attempt_date = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.utcnow)


class SnoflakeLapetusResponse(Base):
    __tablename__ = "snf_lapetus_response"
    id = sqlalchemy.Column(sqlalchemy.BigInteger, primary_key=True)
    evolve_id = sqlalchemy.Column(sqlalchemy.String(15))
    lapetus_id = sqlalchemy.Column(sqlalchemy.String(45))
    response_data = sqlalchemy.Column(MEDIUMTEXT)
    status_code = sqlalchemy.Column(sqlalchemy.Integer)
    insert_date_time = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.utcnow)
    update_date_time = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    oriented_image = sqlalchemy.Column(sqlalchemy.LargeBinary)


class SnoflakeLapetusResults(Base):
    __tablename__ = "snf_lapetus_results"
    id = sqlalchemy.Column(sqlalchemy.BigInteger, primary_key=True)
    evolve_id = sqlalchemy.Column(sqlalchemy.String(15))
    lapetus_id = sqlalchemy.Column(sqlalchemy.String(45))
    results_data = sqlalchemy.Column(MEDIUMTEXT)
    gender_confidance = sqlalchemy.Column(sqlalchemy.String(45))
    gender = sqlalchemy.Column(sqlalchemy.String(45))
    bmi = sqlalchemy.Column(sqlalchemy.String(45))
    age = sqlalchemy.Column(sqlalchemy.String(45))
    insert_date_time = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.utcnow)
    update_date_time = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class EvolveSFResponse(Base):
    __tablename__ = "evolve_sf_response"
    id = sqlalchemy.Column(sqlalchemy.BigInteger, primary_key=True)
    evolve_id = sqlalchemy.Column(sqlalchemy.String(15))
    lead_resp_code = sqlalchemy.Column(sqlalchemy.String(50))
    webquote_resp_code = sqlalchemy.Column(sqlalchemy.String(50))
    time_stamp = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.utcnow)
