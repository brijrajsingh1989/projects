#Purge Logs
#Logging
#Responsive (P)
#Authentication/Authorization of User (C)
#Add Loading (Progress Bar) (C)
#Reports (C)
#Download Report (C)

#Show lagend
from config import Configuration
import sqlalchemy
from sqlalchemy import create_engine, update
from sqlalchemy.orm import sessionmaker, scoped_session
from model import *
from lib.utils import *
from flask import Flask, render_template
from flask import jsonify
from flask_cors import CORS, cross_origin
import sys
import logging
from flask import make_response, g, request, current_app
import json
import datetime
import pytz
from datetime import date, datetime, time, timedelta
from functools import update_wrapper
import psutil
from elasticsearch import Elasticsearch, helpers
import dateutil.parser as dp
from templates.template import *
import csv
import pandas as pd
import flask_csv
import io
import pdfkit
import os
from smtplib import SMTP
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
#import wkhtmltopdf
#from wkhtmltopdf import WKhtmlToPdf

#from wkhtmltopdf.views import PDFTemplateView
#logging.basicConfig(filename = Configuration.logs.path, level = logging.DEBUG, format = '%(asctime)s:%(lavelname)s:%(message)s')
logging.basicConfig(filename=Configuration.logs.path, filemode='w', format='%(asctime)s - %(message)s', level=logging.DEBUG)

es = Elasticsearch([{'host': Configuration.es.ip, 'port': Configuration.es.port}])

# engine = create_engine("mysql+pymysql://root:root@127.0.0.1/singtel_syslog", echo=True, pool_size=20, max_overflow=0)
engine = create_engine('mysql://{}:{}@{}/{}'.format(Configuration.db.user,
                                                                  Configuration.db.password,
                                                                  Configuration.db.host,
                                                                  Configuration.db.dbname), echo= False, pool_size= 20000, max_overflow= 0)
session_obj = sessionmaker(bind=engine)
session = scoped_session(session_obj)
app = Flask(__name__)
origin = '*'
cors = CORS(app, resources={r"/api/*": {"origins": origin}})
# CORS(app , supports_credentials=True)
#logging.getLogger('flask_cors').level = logging.DEBUG

def crossdomain(origin=None, methods=None, headers=None, max_age=21600, attach_to_all=True, automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, str):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, str):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers
            h["Content-type"] = 'application/json'
            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator

@app.route('/api/v1/login', methods=['GET', 'POST','OPTIONS'])
#@crossdomain(origin = origin)
def login():
    if request.method == 'POST':
        req_input = request.json
        q = session.query(User).filter(User.email_id == req_input["email_id"]).filter(User.password == req_input["password"]).first()
        if q  == None:
            return jsonify({'isUser':False, 'userDeleted':None, 'userInactive':None})
        elif q:
            if q.is_deleted == 1:
                return jsonify({'isUser':False,'isAdmin':None, 'userName': q.first_name, 'userDeleted':True, 'userInactive':False})
            elif q.is_active == 0:
                return jsonify({'isUser':False,'isAdmin':None, 'userName': q.first_name, 'userDeleted':False, 'userInactive':True})
            elif q.is_admin == 1:
                return jsonify({'isUser':True,'isAdmin':True, 'userName': q.first_name, 'userDeleted':None, 'userInactive':None})
            else:
                return jsonify({'isUser':True,'isAdmin':False, 'userName': q.first_name, 'userDeleted':None, 'userInactive':None})
        else:
            return jsonify({'isUser':False})
    return jsonify({'isUser':False})

@app.route('/api/v1/user', methods=['GET', 'POST', 'PUT', 'OPTIONS'])
#@crossdomain(origin = origin)
def user():
    resp = ({'alreadyExists':False,'createdSuccessFully':False, 'systemError':False, 'userDoesNotExists':False})

    if request.method == 'GET':
        q = session.query(User).filter(User.is_deleted == 0).all()
        rows = []
        for row in q:
            #print(row2dict(row))
            rows.append(row2dict(row))
        return jsonify(rows)



    if request.method == 'POST':
        data = (request.json)

        d = session.query(User).filter(User.email_id == data["emailId"]).filter(User.is_deleted == True).scalar()
        if d == None:
            q = session.query(User).filter(User.email_id == data["emailId"]).filter(User.is_active == True).scalar()
            if q == None:
                UserObj = User()
                UserObj.password = data["password"]
                UserObj.email_id = data["emailId"]
                UserObj.is_active = True
                UserObj.is_admin = data["isAdmin"]
                UserObj.first_name = data["firstName"]
                #UserObj.middle_name = data.middleName
                UserObj.last_name = data["lastName"]
                UserObj.emp_id = data["employeeId"]
                UserObj.contact_number = data["contactNumber"]
                UserObj.created_date = datetime.now(tz=pytz.utc)
                UserObj.created_by = 'Admin'
                UserObj.updated_by = ''
                UserObj.is_deleted = False
                UserObj.updated_date = datetime.now(tz=pytz.utc)
                session.add(UserObj)
                session.flush()
                session.commit()
                resp["createdSuccessFully"] = True
            elif q:
                resp["alreadyExists"] = True
            else:
                resp["userDoesNotExists"] = True
        else:
            resp["userDoesNotExists"] = True

        return jsonify(resp)

    if request.method == 'PUT':
        #print(request.json)
        data = (request.json)
        #check if user exists
        q = session.query(User).filter(User.id == data["userID"]).scalar()
        if q is not None:
            #q.email_id = data.emailId
            q.is_active = data["isActive"]
            q.is_admin = data["isAdmin"]
            q.first_name = data["firstName"]
            #UserObj.middle_name = data.middleName
            q.last_name = data["lastName"]
            q.emp_id = data["employeeId"]
            q.contact_number = data["contactNumber"]
            q.is_deleted = data["isDeleted"]
            q.updated_date = datetime.now(tz=pytz.utc)

            session.add(q)
            session.flush()
            session.commit()
            resp["createdSuccessFully"] = True
        else:
            resp["alreadyExists"] = True
        return jsonify(resp)
    return jsonify(resp)

@app.route('/api/v1/events', methods=['GET', 'POST', 'PUT', 'OPTIONS'])
#@crossdomain(origin = origin)
def events():
    keys = ['Emergency', 'Alert', 'Critical', 'Error', 'Warning', 'Notice', 'Informational', 'Debug']
    response = ({'Emergency':'', 'Alert':'', 'Critical':'', 'Error':'', 'Warning':'', 'Notice':'', 'Informational':'', 'Debug':''})
    if request.method == 'GET':
        for i in range(8):
            query = {"query": {"bool": {"must": [{"term": {"SYSLOG_LOG_LEVEL": str(i)}}]}}}
            res = es.search(index="syslog*", body= query)
            response[keys[i]] = res['hits']['total']
    print(response)
    return jsonify(response)

@app.route('/api/v1/cpuinfo', methods=['GET', 'POST', 'PUT', 'OPTIONS'])
#@crossdomain(origin = origin)
def cpuinfo():
    resp = {}#({'cpu_info':''})
    if request.method == 'GET':
        resp = psutil.cpu_percent()
    return jsonify(resp)

@app.route('/api/v1/freeSpaceinfo', methods=['GET', 'POST', 'PUT', 'OPTIONS'])
#@crossdomain(origin = origin)
def freeSpaceinfo():
    resp = {}#({'freeSpace':{}})
    if request.method == 'GET':
        resp = psutil.disk_usage(".")
    return jsonify(resp)

@app.route('/api/v1/elastic', methods=['GET', 'POST', 'PUT', 'OPTIONS', 'DELETE', 'PATCH'])
#@crossdomain(origin = origin)
def elastic():
    keys = ['Emergency', 'Alert', 'Critical', 'Error', 'Warning', 'Notice', 'Informational', 'Debug']
    response = ({'Emergency':'', 'Alert':'', 'Critical':'', 'Error':'', 'Warning':'', 'Notice':'', 'Informational':'', 'Debug':''})
    if request.method == 'GET':
        q = session.query(SyslogLogLevel).filter(SyslogLogLevel.is_active == True).order_by(SyslogLogLevel.id.desc()).all()
        rows = []
        for row in q:
            #print(row2dict(row))
            rows.append(row2dict(row))
        return jsonify(rows)

    if request.method == 'POST':
        print("Inside POST")
        data = (request.json)
        for i in range(8):
            #query = {"query": {"bool": {"filter":{"bool":{"must":[{"range":{"@timestamp":{"gte": "2016-02-28T22:08:49.000Z","lte": "2019-03-01T22:08:49.000Z", "time_zone": "+08:00"}}},{"query_string": {"query": "SYSLOG_LOG_LEVEL:"+ str(i)}}]}}}}}
            query = {"query": {"bool": {"filter":{"bool":{"must":[{"range":{"@timestamp":{"gte": str(data["startDate"]),"lte": str(data["endDate"]), "time_zone": "+08:00"}}},{"query_string": {"query": "SYSLOG_LOG_LEVEL:"+ str(i)}}]}}}}}
            res = es.search(index="syslog*", body= query)
            response[keys[i]] = res['hits']['total']
        if response:
            #print(json.dumps(response))
            SyslogLogLevelObj = SyslogLogLevel()
            SyslogLogLevelObj.emergency = response["Emergency"]
            SyslogLogLevelObj.alert = response["Alert"]
            SyslogLogLevelObj.critical = response["Critical"]
            SyslogLogLevelObj.error = response["Error"]
            SyslogLogLevelObj.warning = response["Warning"]
            SyslogLogLevelObj.notice = response["Notice"]
            SyslogLogLevelObj.informational = response["Informational"]
            SyslogLogLevelObj.debug = response["Debug"]
            SyslogLogLevelObj.start_date = dp.parse(data["startDate"])
            SyslogLogLevelObj.end_date = dp.parse(data["endDate"])
            SyslogLogLevelObj.is_active = True
            SyslogLogLevelObj.created_by = 'System'
            SyslogLogLevelObj.created_on = datetime.now(tz=pytz.utc)
            SyslogLogLevelObj.log_type = 'Custom'
            session.add(SyslogLogLevelObj)
            session.flush()
            session.commit()
    if request.method == 'PATCH':
        data = (request.json)
        d_row = session.query(SyslogLogLevel).filter(SyslogLogLevel.id==data["id"]).one()
        d_row.is_active = False
        #session.flush()
        session.commit()
        # session.add(d_row)
        # session.flush()
        # session.commit()

        # print(data.id)
        # update(SyslogLogLevel).where(SyslogLogLevel.id==data.id).values(is_active=False)
        return jsonify({'success':d_row.is_active})

    return jsonify(response)

@app.route('/api/v1/config', methods=['GET', 'POST', 'PUT', 'OPTIONS'])
#@crossdomain(origin = origin)
def config():

    rows = []
    resp = {'data':rows, 'success':False}#({'data':rows, 'success':False})

    if request.method == 'GET':
        q = session.query(Config).order_by(Config.id.desc()).all()
        for row in q:
            rows.append(row2dict(row))
        resp["success"] = True

    if request.method == 'PUT':
        data = request.json
        #check if user exists
        q = session.query(Config).filter(Config.id == data["configId"]).scalar()
        if q is not None:
            #q.email_id = data.emailId
            print(data)
            q.retain_data_max_days = data["retainDataMaxDays"]
            q.retain_logs_max_days = data["retainLogsMaxDays"]
            #q.report_receipients_colon_separated = data["reportReciepents"]
            q.modified_by = data["userName"]
            q.modified_on = datetime.now(tz=pytz.utc)

            session.add(q)
            session.flush()
            session.commit()
        resp["success"] = True
    return jsonify(resp)

@app.route('/api/v1/delete_es_records', methods=['GET', 'POST', 'PUT', 'OPTIONS'])
def delete_es_records():
    if request.method == 'POST':
        data = request.json
        dt_dd = datetime.utcnow() + timedelta(-int(data["retain_data_max_days"]))
        query = {"query": {"bool": {"filter":{"bool":{"must":[{"range":{"@timestamp":{"lte": str(dt_dd.strftime("%Y-%m-%dT%H:%M:%S.000Z")), "time_zone": "+08:00"}}}]}}}}}
        resp = es.delete_by_query(index="syslog", body= query)
    return jsonify(resp)

#

@app.route('/api/v1/download_csv_report', methods=['GET', 'POST', 'PUT', 'OPTIONS'])
def download_csv_report():
    data = request.json
    resp = {'csv':'', 'html':''}
    if request.method == 'POST':
        cdata = [
            ["Log Type", "Warning","Notice","Informational", "Error", "Emergency", "Debug", "Critical", "Alert"],
            [data["log_type"],data["warning"] ,data["notice"] ,data["informational"] ,data["error"] ,data["emergency"] ,data["debug"] ,data["critical"] ,data["alert"]]
        ]
        si = io.StringIO()
        cw = csv.writer(si)
        cw.writerows(cdata)
        output = make_response(si.getvalue())
        output.headers["Content-Disposition"] = "attachment; filename=export.csv"
        output.headers["Content-type"] = "text/csv"
        return output
    return jsonify(resp)

@app.route('/api/v1/download_html_report', methods=['GET', 'POST', 'PUT', 'OPTIONS'])
def download_reports():
    data = request.json
    resp = {'csv':'', 'html':''}
    if request.method == 'POST':
        si = io.StringIO()
        output = make_response(si.getvalue())
        output.headers["Content-Disposition"] = "attachment; filename=export.html"
        output.headers["Content-type"] = "text/html"
        return render_template('report_template.html', log_type=data["log_type"],warning=data["warning"],notice = data["notice"],informational= data["informational"], error=data["error"], emergency=data["emergency"], debug=data["debug"], critical=data["critical"], alert=data["alert"], report_name= "Syslog Level States (packet count) From Start Date - "+data["start_date"]+" to End Date - "+data["end_date"])
    return jsonify(resp)

@app.route('/api/v1/es_snapshot', methods=['GET', 'POST', 'PUT', 'OPTIONS'])
def es_snapshot():
    data = request.json
    resp = {'csv':'', 'html':''}
    if request.method == 'POST':
        #Create Snapshot
        # index_body = {
        #     "indices": "syslogs",
        #     "type":"fs"
        # }
        # es.snapshot.create(repository='Backup', snapshot="syslogs"+str(datetime.now().strftime("%Y-%m-%d")), body=index_body)
        # return jsonify(resp)
        #Re-Store Snapshot
        index_body = {
          "indices": "syslog*",
          "ignore_unavailable": True,
          "include_global_state": True,
          "rename_pattern": "syslog*",
          "rename_replacement": "syslog*"+str(datetime.now().strftime("%Y-%m-%d"))
        }
        es.snapshot.restore(repository='Backup', snapshot="syslog*"+str(datetime.now().strftime("%Y-%m-%d")), body=index_body)
        return jsonify(resp)
        #Delete Snapshot
        #es.snapshot.delete(repository='Backup', snapshot='snapshot_7')
        #return jsonify(resp)
    #if request.method == 'GET':
    return jsonify(resp)

@app.route('/api/v1/send_email', methods=['GET', 'POST', 'PUT', 'OPTIONS'])
def send_email():
    if request.method == 'POST':
        data = request.json
        print(data)
        email = 'sendingemail.demo@gmail.com'
        password = 'Focus@1234d'
        send_to_email = data["emailId"]
        subject = 'Report From - ' + data["startdate"] +' To -  '+ data["enddate"]

        messageHTML = """\
                        <html>
                            <style>
                            </style>
                            <body style="background-color: #f2f2f2;color:#000;font-family:'Palatino Linotype', 'Book Antiqua', Palatino, serif;">
                            	<p style="padding-top:30px;"><b>Hello, Mr {0}</b></p>
                            		<p>Below are the states for your enquiry for Syslog level count from {9} to {10}:</p>
                            	<p>

                            	<table style="margin-top:50px;width:75%;text-align:center;border:0px solid black;">
                            		<tr  style="background-color:#006087;color:#fff;opacity:0.8;">
                            			<td>Emergency</td>
                            			<td>Alert</td>
                            			<td>Critical</td>
                            			<td>Error</td>
                            			<td>Warning</td>
                            			<td>Notice</td>
                            			<td>Informational</td>
                            			<td>Debug</td>
                            		</tr>
                            		<tr style="background-color:#fff;color:#000;opacity:0.8;">
                            			<td>{1}*</td>
                            			<td>{2}*</td>
                            			<td>{3}*</td>
                            			<td>{4}</td>
                            			<td>{5}</td>
                            			<td>{6}</td>
                            			<td>{7}</td>
                            			<td>{8}</td>
                            		</tr>
                            	</table>
                            </p>
                            <p style="font-size:10px;">*- Need to assist earliest.</p>
                            <p style="margin-top:100px">Regards,<br/><a style="font-size:12px;" href="www.remego.com" target="_blank">Remego Pte. Ltd.</a></p>
                            </body>
                            </html>
        """.format(data["name"],data["emergency"],data["alert"],data["critical"],data["error"],data["warning"],data["notice"],data["informational"],data["debug"],data["startdate"],data["enddate"])
        #messagePlain = 'Visit nitratine.net for some great tutorials and projects!'

        msg = MIMEMultipart('alternative')
        msg['From'] = email
        msg['To'] = send_to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(messageHTML, 'html'))
        server = SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(email, password)
        text = msg.as_string()
        server.sendmail(email, send_to_email, text)
        server.quit()
    return jsonify({'status':'success'})


@app.route('/api/v1/analytics', methods=['GET', 'PUT', 'POST', 'OPTIONS'])
def analytics():
    keys = ['Emergency', 'Alert', 'Critical', 'Error', 'Warning', 'Notice', 'Informational', 'Debug']
    response = []#({'Emergency':'', 'Alert':'', 'Critical':'', 'Error':'', 'Warning':'', 'Notice':'', 'Informational':'', 'Debug':''})
    applicances = []

    if request.method == 'POST':
        data = request.json

        totao_count_query = {"query": {"bool": {"filter":{"bool":{"must":[{"range":{"@timestamp":{"gte": data["sDT"],"lte": data["eDT"], "time_zone": "+08:00"}}}]}}}}}
        totao_count_query_response = es.search(index="syslog*", body= totao_count_query)
        total_count = totao_count_query_response["hits"]["total"]
        print(total_count)
        for i in range(8):
            query = {"query": {"bool": {"filter":{"bool":{"must":[{"range":{"@timestamp":{"gte": data["sDT"],"lte": data["eDT"], "time_zone": "+08:00"}}},{"query_string": {"query": "SYSLOG_LOG_LEVEL:"+ str(i)}}]}}}}}
            res = es.search(index="syslog*", body= query)
            count = res["hits"]["total"]


            appliance_query = {"query":{"bool":{"must":[{"range":{"@timestamp":{"gte": data["sDT"],"lte": data["eDT"], "time_zone": "+08:00"}}},{"term":{"SYSLOG_LOG_LEVEL": i}}]}},"aggs":{"SYSLOG_HOSTNAME":{"terms":{"field" : "SYSLOG_HOSTNAME.keyword","size" : 10}}}}
            appliance_response = es.search(index="syslog*", body= appliance_query)
            top_applicances = appliance_response["aggregations"]
            response.append({'totalPackets':total_count, 'topApplicances':top_applicances,'packetsForLogLevel':count,'logLevel':i,'logLevelDescription':keys[i]})
    return jsonify({'data':response})

@app.route('/api/v1/appliances', methods=['GET', 'PUT', 'POST', 'OPTIONS'])
def appliances():
    data = request.json
    response = []
    if request.method == 'POST':
        query = {"query":{"bool":{"must":[{"range":{"@timestamp":{"gte": "2019-02-25T22:08:49.000Z","lte": "2019-03-01T22:08:49.000Z", "time_zone": "+08:00"}}},{"term":{"SYSLOG_LOG_LEVEL": data["SYSLOG_LOG_LEVEL"]}}]}},"aggs":{"SYSLOG_HOSTNAME":{"terms":{"field" : "SYSLOG_HOSTNAME.keyword","size" : 10}}}}
        response = es.search(index="syslog*", body= query)
        for doc in response['hits']['hits']:
            pass

    return jsonify(response["aggregations"])

@app.route('/api/v1/logs', methods=['GET', 'PUT', 'POST', 'OPTIONS'])
def logs():
    data = request.json
    response = []
    if request.method == 'POST':
        count = {"query":{"bool":{"must":[{"range":{"@timestamp":{"gte": data["sDT"],"lte": data["eDT"], "time_zone": "+08:00"}}},{"term":{"SYSLOG_LOG_LEVEL": data["SYSLOG_LOG_LEVEL"]}},{"term":{"SYSLOG_HOSTNAME.keyword": data["SYSLOG_HOSTNAME"]}}]}}}
        gc = es.search(index="syslog*", body= count)
        query = {"size":1000, "from":data["PAGE_NUMBER"], "sort": [{"@timestamp":"desc"}], "query":{"bool":{"must":[{"range":{"@timestamp":{"gte": data["sDT"],"lte": data["eDT"], "time_zone": "+08:00"}}},{"term":{"SYSLOG_LOG_LEVEL": data["SYSLOG_LOG_LEVEL"]}},{"term":{"SYSLOG_HOSTNAME.keyword": data["SYSLOG_HOSTNAME"]}}]}}}
        response = es.search(index="syslog*", body= query)

    return jsonify(response)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port = 3001, debug = True)
