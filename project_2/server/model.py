import sqlalchemy
from sqlalchemy import Column, Integer, String, BigInteger, DateTime
from sqlalchemy.dialects.mysql import TINYINT
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session


Base = declarative_base()

class Config(Base):
    __tablename__ = 'ss_config'
    id = Column(BigInteger, primary_key=True)
    retain_data_max_days = Column(Integer)
    retain_logs_max_days = Column(Integer)
    report_receipients_colon_separated = Column(String(1000))
    created_on = Column(DateTime)
    created_by = Column(String(50))
    modified_on = Column(DateTime)
    modified_by = Column(String(50))

class User(Base):
    __tablename__ = 'ss_user_info'
    id = Column(BigInteger, primary_key=True)
    password = Column(String(50))
    email_id = Column(String(200))
    created_date = Column(DateTime)
    is_active = Column(TINYINT)
    is_admin = Column(TINYINT)
    first_name = Column(String(50))
    middle_name = Column(String(50))
    last_name = Column(String(50))
    emp_id = Column(String(50))
    contact_number = Column(String(50))
    is_deleted = Column(TINYINT)
    created_by = Column(String(50))
    updated_by = Column(String(50))
    updated_date = Column(DateTime)


class SyslogLogLevel(Base):
    __tablename__ = 'ss_syslog_error_logs'
    id = Column(BigInteger, primary_key=True)
    emergency = Column(Integer)
    alert = Column(Integer)
    critical = Column(Integer)
    error = Column(Integer)
    warning = Column(Integer)
    notice = Column(Integer)
    informational= Column(Integer)
    debug = Column(Integer)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    is_active = Column(TINYINT)
    created_by =  Column(String(50))
    created_on = Column(DateTime)
    log_type = Column(String(45))
    # password = Column(String(50))
    # email_id = Column(String(200))
    # created_date = Column(DateTime)
    # is_active = Column(TINYINT)
    # is_admin = Column(TINYINT)
    # first_name = Column(String(50))
    # middle_name = Column(String(50))
    # last_name = Column(String(50))
    # emp_id = Column(String(50))
    # contact_number = Column(String(50))
    # is_deleted = Column(TINYINT)
#
# def __repr__(self):
#     return "<User(name='%s', fullname='%s', password='%s')>" % (self.name, self.fullname, self.password)

#Uncomment only if need to create Schema in Database
#Base.metadata.create_all(engine)
