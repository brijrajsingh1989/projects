import logging
import redis
import simplejson

from functools import update_wrapper
from flask import jsonify
from Crypto.Cipher import AES

from lib.utils import *
from app_config import Config
from app_db import app_db


###
# Common functions used inside app_routes.py
###

###
# Application Custom Exception
###
class AppException(Exception): pass


###
#  Init cipher
###
app_cipher = AES.new(Config.aes_encrypt['key2'], AES.MODE_ECB)

###
# Constants for response
###
httpstatus = dotdict(dict(badrequest=400, ok=200, forbidden=401))


###
# API Common functions
###
def exception_handler():
    """
    A decorator that wraps the passed in function and logs
    exceptions should one occur
    """
    import traceback

    def decorator(func):
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except AppException:
                app_rollback()
            except Exception, e:
                logging.error("func=%s exc=%s trc=%s", func.__name__, str(e), traceback.format_exc())
                app_rollback()
            return app_response(httpstatus.badrequest, 'Internal Error')

        func.provide_automatic_options = False
        return update_wrapper(wrapper, func)

    return decorator


def app_rollback():
    try:
        app_db.session.rollback()
    except Exception:
        pass


def app_response(code, message='', **kwargs):
    if code == 200:
        resp = jsonify(dict(status='success', **kwargs))
    else:
        resp = jsonify(dict(status='failure', message=message, **kwargs))

    resp.status_code = code
    return resp


def decrypt_data(data):
    return app_cipher.decrypt(data).strip()


def encrypt_data(data, dlen=32):
    return app_cipher.encrypt(data.rjust(dlen))


def push_to_salesforce(case_id):
    try:
        rediscache = redis.StrictRedis(host=Config.redis_cache['host'],
                                       port=Config.redis_cache['port'],
                                       db=Config.redis_cache['db'])

        rediscache.lpush("TERM_Activity", simplejson.dumps({'type': 'send_sf', 'evolve_id': case_id}))
        logging.info('%s - Published to salesforce', case_id)
    except Exception, e:
        logging.error("Salesforce publish Exception exc=%s", str(e))
