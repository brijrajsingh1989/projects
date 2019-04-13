import logging
import flask
import requests

from app_config import Config
from app_db import app_db
from app_routes import api

from evolve_idgen import EvolveIdGenerator
from lib.utils import http_requests_debug, OneLineFormatter

def create_app():
    requests.packages.urllib3.disable_warnings()

    flaskapp = flask.Flask(__name__)
    flaskapp.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://{}:{}@{}/{}'.format(Config.db.user,
                                                                              Config.db.password,
                                                                              Config.db.host,
                                                                              Config.db.dbname)
    flaskapp.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    flaskapp.config['SQLALCHEMY_POOL_SIZE'] = 10
    flaskapp.config['SQLALCHEMY_POOL_RECYCLE'] = 60
    flaskapp.register_blueprint(api)
    flaskapp.debug = False

    # Init DB
    app_db.init_app(flaskapp)

    # Create Logger
    logger = logging.getLogger()
    logger.setLevel(Config.loglevel)
    logger.propagate = False
    while logger.handlers: logger.handlers.pop()

    # Add formatter to ch
    formatter = OneLineFormatter('%(asctime)s - %(levelname)s - %(filename)s:%(lineno)d:%(funcName)s - %(message)s')

    # create stdout handler and set level to debug
    handler = logging.StreamHandler()
    handler.setFormatter(formatter)
    handler.setLevel(Config.loglevel)

    # add handler to logger
    logger.addHandler(handler)
    logging.info('Current log level is : %s', logging.getLevelName(logger.getEffectiveLevel()))

    # Initialize the ID Cache
    EvolveIdGenerator().generate()

    ##
    # To debug the requests made to external sites this
    # this will print the headers and data for easiness
    ##
    http_requests_debug(Config.loglevel == logging.DEBUG)

    return flaskapp


app = create_app()

if __name__ == '__main__':
    app.run(port=9090)
