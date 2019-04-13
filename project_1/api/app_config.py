import logging
import os
from lib.utils import dotdict
os.environ["TERM_APP_ENV"] = "qa"

class DevConfig:
    def __init__(self):
        pass


class QAConfig:
    def __init__(self):
        pass

    loglevel = logging.INFO

    log_files = dotdict({'subscriber': '../logs/term-subscriber.log'})

    db = dotdict(
        {'host': 'qa-evolve-db.lgamerica.vpc', 'user': 'lgaadmin', 'password': 'F9SsS9BM', 'dbname': 'easy_pass'})

    evolveidgenerator = dotdict(
        {'host': db.host, 'user': db.user, 'password': db.password, 'dbname': 'evolveid', 'lockname': '_idgenerator_',
         'limit': 50000, 'trigger_on': 10000, 'redis_key': 'evolveids'})

    redis_cache = dotdict({'host': 'qa-evolve-cache.lgamerica.vpc', 'port': 6379, 'db': 0})

    aes_encrypt = dotdict({'key1': 'bD!#In01A', 'key2': '#****bD!#In01A*#'})

    # External API calls
    api_lga = dotdict({'host': 'https://api-qa.lgamerica.com',
                       'user': '#######',
                       'password': '######'})

    api_lapetus = dotdict(
        {'url': '######',
         'apikey': '######'})

    api_salesforce = dotdict(
        {'username': '######',
        'password': '#######',
        'client_id': '#######',
        'client_secret': '#######',
        'auth_url': '#######',
        'endpoint': '#######',
        'notifyto': ['#######']})
    twilio = dotdict(
        {'account_sid': "#######",
        'auth_token': "#######",
        'url': "https://lookups.twilio.com/v1/PhoneNumbers"})
class ProdConfig:
    def __init__(self):
        pass

    

Config = None
env = os.environ.get('TERM_APP_ENV', None)
if env.lower() == 'dev':
    Config = DevConfig
elif env.lower() == 'qa':
    Config = QAConfig
elif env.lower() == 'prod':
    Config = ProdConfig

if Config is None:
    raise RuntimeError(
        'Environment variable TERM_APP_ENV not set correctly. Valid values [dev,qz,prod] found <{}>'.format(env))
