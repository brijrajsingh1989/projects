#!/usr/bin/env python
import logging
import os
from lib.utils import dotdict
import logging

os.environ["logR_APP_ENV"] = "dev"
class dev:
    def __init__(self):
        pass

    db = dotdict({
    'host':'127.0.0.1',
    'user':'root',
    'password':'root',
    'dbname':'singtel_syslog'
    })

    es = dotdict({
    'ip':'127.0.0.1',
    'port':9200
    })

    logs = dotdict({
        'path':'D:/ELK_6.5_LM/logr/server/logs.log',
        'level':logging.DEBUG
    })

class QA:
    def __init__(self):
        pass

    db = dotdict({
    'host':'127.0.0.1',
    'user':'root',
    'password':'Aquarin8;',
    'dbname':'singtel_syslog'
    })

    es = dotdict({
    'ip':'127.0.0.1',
    'port':9200
    })

    logs = dotdict({
        'path':'/elk/ui/log/logs.log',
        'level':logging.DEBUG
    })

class Prod:
    def __init__(self):
        pass

    db = dotdict({
    'host':'127.0.0.1',
    'user':'root',
    'password':'Aquarin8;',
    'dbname':'singtel_syslog'
    })

    es = dotdict({
    'ip':'127.0.0.1',
    'port':9200
    })

    logs = dotdict({
        'path':'',
        'level':logging.WARNING
    })

Configuration = None
env = os.environ.get('logR_APP_ENV', None)
if env.lower() == 'dev':
    Configuration = dev
elif env.lower() == 'qa':
    Configuration = QA
elif env.lower() == 'prod':
    Configuration = Prod


if Configuration is None:
    raise RuntimeError(
        'Environment variable logR_APP_ENV not set correctly. Valid values [dev,qa,prod] found <{}>'.format(env))
