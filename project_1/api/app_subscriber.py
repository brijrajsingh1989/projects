#!/usr/bin/python
import logging
import os
import time
from logging.handlers import RotatingFileHandler

import redis
import simplejson
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session

from app_config import Config
from data_model import Base, EvolveSFResponse
from lib.utils import http_requests_debug
from sales_force import Salesforce


class Subscriber(object):

    def __init__(self):

        workdir = os.path.dirname(os.path.realpath(__file__))
        os.chdir(workdir)

        db_url = 'mysql://{}:{}@{}/{}'.format(Config.db.user, Config.db.password, Config.db.host, Config.db.dbname)
        db_engine = create_engine(db_url, convert_unicode=True, pool_recycle=3600, echo=False)

        self.DB_Session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=db_engine))
        Base.query = self.DB_Session.query_property()
    
        self.rediscache = redis.StrictRedis(host=Config.redis_cache['host'],
                                            port=Config.redis_cache['port'],
                                            db=Config.redis_cache['db'])
        self.salesforce = Salesforce()

    def init_log(self):

        # Initialize Log
        http_requests_debug(Config.loglevel == logging.DEBUG)
    
        # Create Logger
        logger = logging.getLogger()
        logger.setLevel(Config.loglevel)
        logger.propagate = False
        while logger.handlers:
            logger.handlers.pop()
    
        # Add formatter to ch
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(filename)s:%(lineno)d:%(funcName)s - %(message)s')
    
        # create rotating handler and set level
        logfile = os.path.realpath(Config.log_files.subscriber)
        handler = RotatingFileHandler(logfile, maxBytes=1024*1024*25, backupCount=14)
        handler.setFormatter(formatter)
        handler.setLevel(Config.loglevel)
    
        # add handler to logger
        logger.addHandler(handler)
        logging.info('Current log level is : %s', logging.getLevelName(logger.getEffectiveLevel()))

    def update_salesforce(self, evolve_id):
    
        session = self.DB_Session()
    
        # Add the evolve ID in the table evolve_sf_response
        esobj = EvolveSFResponse()
        esobj.evolve_id = evolve_id
    
        try:
            dbrow = session.execute(self.salesforce.db_query % evolve_id).first()
    
            if not dbrow:
                esobj.lead_resp_code = "EvolveID not found"
                esobj.webquote_resp_code = "EvolveID not found"
                self.salesforce.send_error_email(evolve_id,
                                                 'EvolveID record not found. Error detected before Salesforce API call')
                logging.error('%s - EvolveID not found check query', evolve_id)
                return
    
            # Do not call for name = test
            if dbrow['first_name'].lower() == "test" or dbrow['last_name'].lower() == "test":
                esobj.lead_resp_code = "Test User"
                esobj.webquote_resp_code = "Test User"
                logging.info('%s - Skip salesforce test case', evolve_id)
                return
    
            esobj.lead_resp_code = self.salesforce.create_lead(evolve_id, dbrow)
            if esobj.lead_resp_code is None:
                esobj.lead_resp_code = 'API Failed'
                esobj.webquote_resp_code = "API Not Called"
                return
    
            esobj.webquote_resp_code = self.salesforce.create_web_quote(evolve_id, esobj.lead_resp_code, dbrow)
            if esobj.webquote_resp_code is None:
                esobj.webquote_resp_code = 'API Failed'
                return

            logging.info('%s - Send to salesforce complete lead:%s - webquote:%s', evolve_id, esobj.lead_resp_code, esobj.webquote_resp_code)
    
        except Exception as e:
            logging.error(str(e))
        finally:
            session.add(esobj)
            session.commit()
            session.bind.dispose()
            self.DB_Session.remove()
    
    def run(self):
        self.init_log()
        logging.info("Redis subscribe Listen")
    
        while True:
            item = None
            try:
                item = self.rediscache.brpop('TERM_Activity')
                if item is None:
                    time.sleep(.003)
                    continue
    
                data = simplejson.loads(item[1])
    
                if data and 'type' in data and data['type'].lower() == 'send_sf':
                    self.update_salesforce(data['evolve_id'])
                else:
                    raise ValueError
    
            except ValueError:
                logging.error("Invalid record received %s", item)
            except Exception, e:
                logging.error("Unknown exception occured %s", str(e))
    
    
if __name__ == "__main__":
    Subscriber().run()
