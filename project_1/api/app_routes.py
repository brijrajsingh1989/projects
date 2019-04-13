import base64
import traceback
import urllib
import uuid
import requests
import re

from flask import Blueprint
from flask import request, g
from sqlalchemy.sql.functions import func
from requests.auth import HTTPBasicAuth
from evolve_idgen import EvolveIdGenerator
from data_model import *
from app_common import *

"""
Term Life Route functions
"""

api = Blueprint('api', __name__)

exclude_paths = {'/api/v1/step_movement':0, '/api/v1/sf_image_upload':0}
@api.before_request
def before_request():

    if request.path == "/api/v1/ping": return

    case_id = request.cookies.get('user_session')
    try:
        case_id = decrypt_data(base64.b64decode(case_id)).strip() if case_id is not None else None
    except Exception, e:
        case_id = None
        logging.error(str(e))

    cid = request.cookies.get('_ga')
    if cid is not None:
        cid = cid.split('.')
        cid = cid[2] + '.' + cid[3] if len(cid) >= 3 else None

    g.case_id = case_id
    g.cid = cid

    if request.path.lower() in exclude_paths:
        return

    request_queryparams = None if not request.args else request.args.to_dict()
    request_json = None

    try:
        request_json = request.json if request.is_json else None
    except Exception:
        request_json = request.get_data()

    try:
        logging.info("%s - %s %s - queryparms=(%s) - cookies=(%s) - json=(%s)",
                 g.case_id,
                 request.method,
                 request.path,
                 str(request_queryparams),
                 str(request.cookies),
                 str(request_json))
    except:
        pass

@api.teardown_request
def teardown_request(exception):
    if request.path == "/api/v1/ping": return
    try:
        if exception: app_rollback()
        app_db.session.remove()
    except Exception:
        pass


@api.route("/api/v1/ping", methods=["GET"])
def ping():
    return "pong"


@exception_handler()
@api.route("/api/v1/step_movement", methods=["POST"])
def step_movement():
    try:
        data = request.json
        step_id = data.get('step_id')

        if isempty(step_id) or g.case_id is None:
            logging.warn('%s - Missing case/step id(%s)', g.case_id, step_id)
            return app_response(httpstatus.badrequest, 'Missing data')

        dbrow = CustomerStepMovement()
        dbrow.evolve_id = g.case_id
        dbrow.Step_Id = step_id
        app_db.session.add(dbrow)
        app_db.session.commit()
        logging.debug('%s - evolve_steps.id=%d', g.case_id, dbrow.id)
    except Exception, e:
        logging.error('%s - exc={%s} trc={%s}', g.case_id, str(e), traceback.format_exc())
        app_rollback()

    return app_response(httpstatus.ok)


@api.route("/api/v1/generate_case_id", methods=["GET", "POST"])
@exception_handler()
def generate_case_id():
    case_id = ''

    try:
        case_id = EvolveIdGenerator().generate_case_id()
        if isempty(case_id):
            logging.error('%s - Cache get case id is empty', case_id)
            case_id = ''
            raise AppException

        # Save record in evolve_vistors
        digi_fp = None
        try:
            digi_fp = request.cookies.get('session_fp')
            digi_fp = base64.b64decode(urllib.unquote(digi_fp)).decode('utf8') if digi_fp is not None else None
        except:
            pass

        headers_list = request.headers.getlist("X-Forwarded-For")
        user_ip = headers_list[0] if headers_list else request.remote_addr

        dbrow = Visitors()
        dbrow.evolve_id = case_id
        dbrow.digital_signature = digi_fp
        dbrow.os = request.user_agent.platform
        dbrow.uas = request.user_agent.string
        dbrow.visiting_ip_address = user_ip
        dbrow.browser = request.user_agent.browser
        dbrow.cid = g.cid
        app_db.session.add(dbrow)

        app_db.session.commit()
        logging.info('%s - evolve_visitors.id=%d', case_id, dbrow.id)
    except Exception, e:
        logging.error('%s - exc={%s} trc={%s}', case_id, str(e), traceback.format_exc())
        app_rollback()

    # Get New Session ID
    response = jsonify(status='success', data=case_id)
    response.set_cookie('user_session', base64.b64encode(str(encrypt_data(case_id))))
    response.set_cookie('session_id', base64.b64encode(str(uuid.uuid4())))
    return response


@api.route('/api/v1/paid_search_tracking', methods=["GET"])
@exception_handler()
def paid_search_tracking():
    try:
        query_params = None if not request.args else request.args.to_dict()
        pst = save_search_tracking(g.case_id, query_params)

        if not pst: return app_response(httpstatus.ok)

        app_db.session.add(pst)
        app_db.session.commit()
        logging.info('%s - paid_search_tracking.id=%d', g.case_id, pst.id)
    except Exception, e:
        logging.error('%s - exc={%s} trc={%s}', g.case_id, str(e), traceback.format_exc())
        app_rollback()

    return app_response(httpstatus.ok)


def save_search_tracking(case_id, query_params):
    mapping = {'first_cid': None, 'first_campaign': None, 'first_content': None, 'first_date': None,
               'first_gclid': None, 'first_medium': None, 'first_source': None, 'first_term': None,
               'last_cid': None, 'last_campaign': None, 'last_content': None, 'last_date': None,
               'last_gclid': None, 'last_medium': None, 'last_source': None, 'last_term': None
               }

    if isempty(case_id):
        logging.warning('%s - Missing case id', case_id)
        raise AppException

    # Check if record already exists
    pst = app_db.session.query(PaidSearchTracking.id).filter(PaidSearchTracking.evolveID == case_id).first()
    if pst:
        logging.debug('%s - paid_search_tracking.id=%d exists', g.case_id, pst.id)
        return None

    def parse_gtm_cookie(name, cookie):

        if cookie is None: return
        decodedcookies = urllib.unquote(cookie).decode('utf8')

        for fc in decodedcookies.split('&'):
            k, v = fc.split("=")
            if k == "date":
                v = datetime.datetime.strptime(v, "%Y%m%d").date()

            nkey = name + '_' + k
            mapping[nkey] = v if nkey in mapping.keys() else None

    gtm_first_visit = request.cookies.get("gtm_first_visit")
    gtm_last_visit = request.cookies.get("gtm_last_visit")

    # No cookies or Query params
    if isempty(gtm_first_visit) and isempty(gtm_last_visit) and not query_params:
        return None

    cnt = 0
    src = None
    if g.cid is not None:
        # if case_id doest not have cid during intial load then update cid for latest case_id record
        dbrow = app_db.session.query(Visitors) \
            .filter(Visitors.evolve_id == case_id) \
            .order_by(Visitors.entry_timestamp.desc()).first()

        # Visitor is present then update
        if dbrow is not None and dbrow.cid is None:
            dbrow.cid = g.cid
            app_db.session.flush()

        cnt = app_db.session.query(func.count(Visitors.id)).filter(Visitors.cid == g.cid).limit(2).count()

    # Either of cookies present
    if not isempty(gtm_first_visit) or not isempty(gtm_last_visit):
        src = 'C'
        parse_gtm_cookie('first', gtm_first_visit)
        parse_gtm_cookie('last', gtm_last_visit)

    elif query_params:
        # Check query params
        src = 'Q'
        utm_key = {'utm_source': 'source', 'utm_medium': 'medium', 'utm_campaign': 'campaign', 'utm_term': 'term',
                   'utm_content': 'content', 'gclid': 'gclid', 'utm_cid': 'cid'}

        # Check if utm keys exists
        utm_exists = len(utm_key.viewkeys() & query_params.viewkeys()) > 0

        if not utm_exists:
            return None

        # If gclid comes in url then set to google
        # John request....
        if query_params.get('gclid') is not None and nvl(query_params.get('utm_source'), 'google') == 'google':
            query_params['utm_source'] = 'google'
            query_params['utm_medium'] = 'cpc'
            query_params['utm_campaign'] = '(not set)'
            query_params['utm_term'] = '(not set)'
            query_params['utm_content'] = '(not set)'

        query_params['utm_cid'] = g.cid

        # if cnt > 1 then push to last else first
        label = 'last' if cnt > 1 else 'first'

        for key in utm_key.keys():
            mapping[label + '_' + utm_key[key]] = query_params.get(key)
    # Add Partner ID from Query Params if available. Else keep NULL
    if query_params:
        if 'tracking-subid' in query_params:
            mapping['external_id'] = query_params['tracking-subid']

    pst = PaidSearchTracking()
    pst.evolveID = case_id
    pst.derived_flag = src
    for i in mapping.keys():
        setattr(pst, i, mapping[i])

    return pst


@api.route("/api/v1/dynamic_term_length", methods=["POST"])
@exception_handler()
def dynamic_term_length():
    data = request.json
    if data.get('dateOfBirth') is None or data.get('isTobaccoUser') is None or data.get('stateCode') is None:
        return app_response(httpstatus.badrequest, 'Missing data')

    payload = {'dateOfBirth': data.get('dateOfBirth'),
               'isTobaccoUser': str(data.get('isTobaccoUser')),
               'StateCode': str(data.get('stateCode'))}

    url = Config.api_lga.host + "/easypass/v1/request/term-lengths"
    logging.debug("%s - call url=%s", g.case_id, url)

    try:
        resp = requests.get(url, params=payload, auth=(Config.api_lga.user, Config.api_lga.password), verify=False)
        logging.info("%s - url=%s - status_code=%s", g.case_id, url, resp.status_code)

        resp_data = resp.json()
    except Exception, e:
        logging.error("%s - url=%s - exception=%s", g.case_id, url, str(e))
        return app_response(httpstatus.badrequest, message="Invalid server response (%s)" % type(e).__name__)

    return app_response(httpstatus.ok, data=resp_data)


@api.route("/api/v1/quote_data", methods=["POST"])
@exception_handler()
def quote_data():
    data = request.json
    if g.case_id is None:
        logging.error("Case id is null/empty")
        raise AppException

    data['id'] = g.case_id
    required_keys = ["id", "dateOfBirth", "gender", "height", "weight", "state",
                     "state_fullname", "city_fullname", "isTobaccoUser", "whenQuitTobacco",
                     "faceAmount", "product", "termDuration", "overallHealth",
                     "generatePremiumComparisonsByFace"]

    try:
        query_params = data.get('qp')
        pst = save_search_tracking(g.case_id, query_params)

        if pst:
            app_db.session.add(pst)
            app_db.session.commit()

    except Exception:
        app_rollback()

    missing_keys = set(required_keys) - set(data.keys())
    if len(missing_keys) > 0:
        err_str = ','.join(str(s) for s in missing_keys)
        logging.error("%s - Missing elements {%s}", g.case_id, err_str)
        raise AppException

    url = Config.api_lga.host + "/easypass/v1/request/quote"
    logging.debug("%s - call url=%s", g.case_id, url)

    try:
        resp = requests.post(url, auth=(Config.api_lga.user, Config.api_lga.password), data=data, verify=False)
        logging.info("%s - url=%s - status_code=%s", g.case_id, url, resp.status_code)

        resp_data = resp.json()
    except Exception, e:
        logging.error("%s - url=%s - exception=%s", g.case_id, url, str(e))
        return app_response(httpstatus.badrequest, message="Invalid server response (%s)" % type(e).__name__)

    # this method will insert/update data in evolve_quotes_quote table
    lga_status_code = 0
    if 'status' in resp_data:
        if 'success' in resp_data['status']:
            if resp_data['status']['success']:
                lga_status_code = 1

    modalpremium = ''
    if 'modalPremium' in resp_data:
        modalpremium = resp_data['modalPremium']

    insurance_plan = ''
    underwritingclassid = 0
    if 'underwritingClass' in resp_data:
        if resp_data['underwritingClass']:
            if 'name' in resp_data['underwritingClass']:
                insurance_plan = resp_data['underwritingClass']['name']
            if 'id' in resp_data['underwritingClass']:
                underwritingclassid = resp_data['underwritingClass']['id']

    if 'dateOfBirth' in data:
        data['dateOfBirth'] = datetime.datetime.strptime(data['dateOfBirth'], '%m-%d-%Y').date()

    """ Save the response to DB """
    dbrow = app_db.session.query(CustomerQuoteInfo).filter(CustomerQuoteInfo.evolve_id == g.case_id).first()
    if dbrow is None:
        """ Insert Record """
        dbrow = CustomerQuoteInfo()
        dbrow.evolve_id = g.case_id
        app_db.session.add(dbrow)

    dbrow.gender = data.get("gender")
    dbrow.customer_dob = data.get("dateOfBirth")
    dbrow.customer_height = data.get("height")
    dbrow.customer_weight = data.get("weight")
    dbrow.tobacco_user = int(data.get("isTobaccoUser"))
    dbrow.tobacco_quit_option = data.get("whenQuitTobacco")
    dbrow.overallHeath = data.get("overallHealth")
    dbrow.policy_lasts = data.get("termDuration")
    dbrow.coverage_amount = data.get("faceAmount")
    dbrow.state = data.get("state")
    dbrow.state_fullname = data.get("state_fullname")
    dbrow.city_fullname = data.get("city_fullname")
    dbrow.zip_code = data.get("zip_code")
    dbrow.journey = data.get("journey")
    dbrow.journeyId = data.get("journeyId")
    dbrow.planinsurance = insurance_plan
    dbrow.lga_response_code = lga_status_code
    dbrow.modalPremium = modalpremium
    dbrow.underwritingClassId = underwritingclassid
    app_db.session.commit()

    logging.info('%s - evolve_quotes_quote.id=%d', g.case_id, dbrow.id)

    return app_response(httpstatus.ok, data=resp_data)


@api.route("/api/v1/quote_data_info", methods=["POST"])
@exception_handler()
def quote_data_info():
    data = request.json
    if g.case_id is None:
        logging.error("Case id is null/empty")
        raise AppException

    dbrow = app_db.session.query(CustomerQuoteDataInfo).filter(CustomerQuoteDataInfo.evolve_id == g.case_id).first()
    if dbrow is None:
        dbrow = CustomerQuoteDataInfo()
        dbrow.evolve_id = g.case_id
        app_db.session.add(dbrow)

    dbrow.policy_lasts = nvl(data.get("tenure"), 0)
    dbrow.coverage_amount = data.get("amount")
    dbrow.lga_response_code = nvl(data.get("lga_response_code"), 0)
    dbrow.premium = data.get("premium")

    app_db.session.commit()
    logging.info('%s - evolve_quote_input.id=%d', g.case_id, dbrow.id)

    return app_response(httpstatus.ok)


@api.route("/api/v1/personal_info", methods=["POST"])
@exception_handler()
def personal_info():
    data = request.json
    if g.case_id is None:
        logging.error("Case id is null/empty")
        raise AppException

    dbrow = app_db.session.query(CustomerPersonalInfo).filter(CustomerPersonalInfo.evolve_id == g.case_id).first()
    if dbrow is None:
        dbrow = CustomerPersonalInfo()
        dbrow.evolve_id = g.case_id
        app_db.session.add(dbrow)

    dbrow.first_name = data.get("first_name")
    dbrow.last_name = data.get("last_name")

    dbrow.email_address = data.get("email_address")
    if dbrow.email_address is not None:
        dbrow.email_address = data.get("email_address").replace(' ', '')

    dbrow.mobile_number = data.get("mobile_number")
    if dbrow.mobile_number is not None:
        dbrow.mobile_number = re.sub('[^0-9\-]', '', dbrow.mobile_number)

    app_db.session.commit()
    logging.info('%s - evolve_personal_info.id=%d', g.case_id, dbrow.id)

    push_to_salesforce(g.case_id)

    return app_response(httpstatus.ok)


"""
Snoflake API Calls
"""


def sf_get_session():
    fp_id = request.cookies.get('session_num')
    try:
        fp_id = base64.b64decode(urllib.unquote(fp_id)).decode('utf8') if fp_id is not None else None
    except Exception, e:
        fp_id = None
        logging.error(str(e))

    auth_token = request.cookies.get('auth_token')
    try:
        auth_token = decrypt_data(base64.b64decode(auth_token)) if auth_token is not None else None
    except Exception, e:
        auth_token = None
        logging.error(str(e))

    lapteus_id = request.cookies.get('lap_num')
    try:
        lapteus_id = decrypt_data(base64.b64decode(lapteus_id)) if lapteus_id is not None else None
    except Exception, e:
        lapteus_id = None
        logging.error(str(e))

    return fp_id, auth_token, lapteus_id


@api.route("/api/v1/sf_eligible", methods=["GET", "POST"])
@exception_handler()
def sf_eligible():
    fp_id, auth_token, lapteus_id = sf_get_session()

    if fp_id is None:
        logging.error("%s - Missing fp_id=%s, auth_token=%s, lapteus_id=%s", g.case_id, fp_id, auth_token, lapteus_id)
        return app_response(httpstatus.badrequest, message="missing session params")

    """ First time user or User is logging on another new day """
    dbrow = app_db.session.query(SnoflakeAttempts).filter(SnoflakeAttempts.fingerprint == fp_id).first()
    if dbrow is None or dbrow.attempts < 10:
        return app_response(httpstatus.ok, eligible=True)

    return app_response(httpstatus.forbidden, 'Maxlimit Reached')


@api.route("/api/v1/sf_register", methods=["POST"])
@exception_handler()
def sf_register():
    fp_id, auth_token, lapteus_id = sf_get_session()

    if fp_id is None or g.case_id is None:
        logging.error("%s - Missing fp_id=%s, auth_token=%s, lapteus_id=%s", g.case_id, fp_id, auth_token, lapteus_id)
        return app_response(httpstatus.badrequest, message="missing session params")

    data = request.json

    url = "{}/{}/users?apikey={}".format(Config.api_lapetus.url, g.case_id, Config.api_lapetus.apikey)
    logging.debug("%s - call url=%s", g.case_id, url)

    try:
        data['appid'] = g.case_id
        resp = requests.post(url, headers={"Content-Type": "application/json"}, data=simplejson.dumps(data),
                             verify=False)
        logging.info("%s - url=%s - status_code=%s", g.case_id, url, resp.status_code)

        resp_data = resp.json()
    except Exception, e:
        logging.error("%s - url=%s - exception=%s", g.case_id, url, str(e))
        return app_response(httpstatus.badrequest, message="Invalid server response (%s)" % type(e).__name__)

    lap_num = resp_data.get('id')
    auth_token = resp_data.get('auth_token')
    if auth_token is None or lap_num is None:
        logging.error("%s - url=%s - status_code=%s missing id/auth_token", g.case_id, url, resp.status_code)
        return app_response(httpstatus.badrequest, message="missing_id_auth_token")

    response = jsonify(status='success')
    response.set_cookie('lap_num', base64.b64encode(str(encrypt_data(lap_num))))
    response.set_cookie('auth_token', base64.b64encode(str(encrypt_data(auth_token, dlen=64))))
    response.set_cookie('user_session', base64.b64encode(str(encrypt_data(g.case_id))))

    return response


@api.route("/api/v1/sf_image_upload", methods=["POST"])
@exception_handler()
def sf_image_upload():
    fp_id, auth_token, lapteus_id = sf_get_session()

    if auth_token is None or fp_id is None or lapteus_id is None or g.case_id is None:
        logging.error("%s - Missing fp_id=%s, auth_token=%s, lapteus_id=%s", g.case_id, fp_id, auth_token, lapteus_id)
        return app_response(httpstatus.badrequest, message="missing session params")

    data = request.json

    """ Check Visitor """
    dbrow = app_db.session.query(SnoflakeAttempts).filter(SnoflakeAttempts.fingerprint == fp_id).first()

    """ New visitor """
    if dbrow is None:
        dbrow = SnoflakeAttempts()
        dbrow.evolve_id = g.case_id
        dbrow.fingerprint = fp_id
        dbrow.attempts = 1
        app_db.session.add(dbrow)

    elif dbrow.attempt_date is not None and dbrow.attempt_date.date() == datetime.datetime.now().date():
        """ Existing visitor same date """
        if dbrow.attempts >= 10:
            return app_response(httpstatus.forbidden, 'Maxlimit Reached')
        else:
            dbrow.attempts += 1

    else:
        """ Existing visitor different date """
        dbrow.attempt_date = datetime.datetime.now()
        dbrow.attempts = 1

    """ save the attempt  """
    app_db.session.commit()

    logging.info('%s - snf_user_attempts.id=%d', g.case_id, dbrow.id)

    raw_img = None
    if 'userImageBinary' in data.keys():
        try:
            raw_img = base64.b64decode(data["userImageBinary"].split(',')[1])
        except:
            logging.error("%s - Image decode error", g.case_id)
            return app_response(httpstatus.badrequest, message="Image decode error")

    """ upload image """
    url = "{}/{}/u/{}/image?apikey={}&token={}".format(Config.api_lapetus.url, g.case_id,
                                                       lapteus_id, Config.api_lapetus.apikey, auth_token)
    logging.debug("%s - call url=%s", g.case_id, url)

    try:
        resp = requests.post(url, data=raw_img, headers={"Content-Type": "application/x-binary"})
        logging.info("%s - url=%s - status_code=%s", g.case_id, url, resp.status_code)

        resp_data = resp.json()
    except Exception, e:
        logging.error("%s - url=%s - exception=%s", g.case_id, url, str(e))
        return app_response(httpstatus.badrequest, message="Invalid server response (%s)" % type(e).__name__)

    try:
        dbrow = app_db.session.query(SnoflakeLapetusResponse) \
            .filter(SnoflakeLapetusResponse.evolve_id == g.case_id,
                    SnoflakeLapetusResponse.lapetus_id == lapteus_id).first()
        if dbrow is None:
            dbrow = SnoflakeLapetusResponse(evolve_id=g.case_id, lapetus_id=lapteus_id)
            app_db.session.add(dbrow)

        dbrow.response_data = simplejson.dumps(resp_data)
        dbrow.status_code = resp.status_code
        dbrow.oriented_image = data.get("userImageBinary")
        app_db.session.commit()
        logging.info('%s - snf_lapetus_response.id=%d', g.case_id, dbrow.id)
    except:
        pass

    return app_response(httpstatus.ok, data=resp_data)


@api.route("/api/v1/sf_get_image", methods=["GET"])
@exception_handler()
def sf_get_image():
    fp_id, auth_token, lapteus_id = sf_get_session()
    if auth_token is None or fp_id is None or lapteus_id is None or g.case_id is None:
        logging.error("%s - Missing fp_id=%s, auth_token=%s, lapteus_id=%s", g.case_id, fp_id, auth_token, lapteus_id)
        return app_response(httpstatus.badrequest, message="missing session params")

    dbrow = app_db.session.query(SnoflakeLapetusResponse.oriented_image) \
        .filter(SnoflakeLapetusResponse.evolve_id == g.case_id,
                SnoflakeLapetusResponse.lapetus_id == lapteus_id).first()

    return app_response(httpstatus.ok, image=dbrow.oriented_image)


@api.route("/api/v1/sf_estimate", methods=["POST"])
@exception_handler()
def sf_estimate():
    fp_id, auth_token, lapteus_id = sf_get_session()
    if auth_token is None or fp_id is None or lapteus_id is None or g.case_id is None:
        logging.error("%s - Missing fp_id=%s, auth_token=%s, lapteus_id=%s", g.case_id, fp_id, auth_token, lapteus_id)
        return app_response(httpstatus.badrequest, message="missing session params")

    url = "{}/{}/u/{}/image/face/estimations?apikey={}&token={}".format(Config.api_lapetus.url, g.case_id, lapteus_id,
                                                                        Config.api_lapetus.apikey, auth_token)
    try:
        resp = requests.get(url, verify=False)
        logging.info("%s - url=%s - status_code=%s", g.case_id, url, resp.status_code)

        resp_data = resp.json()
    except Exception, e:
        logging.error("%s - url=%s - exception=%s", g.case_id, url, str(e))
        return app_response(httpstatus.badrequest, message="Invalid server response (%s)" % type(e).__name__)

    return app_response(httpstatus.ok, data=resp_data)


@api.route("/api/v1/sf_save_result", methods=["POST"])
@exception_handler()
def sf_save_result():
    fp_id, auth_token, lapteus_id = sf_get_session()
    if auth_token is None or fp_id is None or lapteus_id is None or g.case_id is None:
        logging.error("%s - Missing fp_id=%s, auth_token=%s, lapteus_id=%s", g.case_id, fp_id, auth_token, lapteus_id)
        return app_response(httpstatus.badrequest, message="missing session params")

    data = request.json

    dbrow = app_db.session.query(SnoflakeLapetusResults) \
        .filter(SnoflakeLapetusResults.evolve_id == g.case_id, SnoflakeLapetusResults.lapetus_id == lapteus_id).first()

    if dbrow is None:
        dbrow = SnoflakeLapetusResults()
        dbrow.evolve_id = g.case_id
        dbrow.lapteus_id = lapteus_id
        app_db.session.add(dbrow)

    ageinfo = data["ageInfo"]["details"] if 'ageInfo' in data and "details" in data["ageInfo"] else {}
    bmiinfo = data["bmiInfo"]["details"] if 'bmiInfo' in data and "details" in data["bmiInfo"] else {}
    genderinfo = data["genderInfo"]["details"] if 'genderInfo' in data and "genderInfo" in data["genderInfo"] else {}

    dbrow.age = ageinfo["chronage"] if "chronage" in ageinfo else None
    dbrow.bmi = bmiinfo["bmi"] if "bmi" in bmiinfo else None
    dbrow.gender = genderinfo["gender"] if "gender" in genderinfo else None
    dbrow.gender_confidance = genderinfo["confidence"] if "confidence" in genderinfo else None
    dbrow.results_data = simplejson.dumps(data)
    app_db.session.commit()
    logging.info('%s - snf_lapetus_results.id=%d', g.case_id, dbrow.id)

    return app_response(httpstatus.ok)


@api.route("/api/v1/sf_quote_data", methods=["POST"])
@exception_handler()
def sf_quote_data():
    fp_id, auth_token, lapteus_id = sf_get_session()

    if g.case_id is None:
        logging.error("%s - Missing fp_id=%s, auth_token=%s, lapteus_id=%s", g.case_id, fp_id, auth_token, lapteus_id)
        return app_response(httpstatus.badrequest, message="missing session params")

    data = request.json
    data['id'] = g.case_id

    url = Config.api_lga.host + "/easypass/v1/request/quote"
    logging.debug("%s - call url=%s", g.case_id, url)

    try:
        resp = requests.post(url, auth=(Config.api_lga.user, Config.api_lga.password), data=data, verify=False)
        logging.info("%s - url=%s - status_code=%s", g.case_id, url, resp.status_code)

        resp_data = resp.json()
    except Exception, e:
        logging.error("%s - url=%s - exception=%s", g.case_id, url, str(e))
        return app_response(httpstatus.badrequest, message="Invalid server response (%s)" % type(e).__name__)

    return app_response(httpstatus.ok, data=resp_data)

@api.route("/api/v1/verify_phone_number", methods=["POST"])
@exception_handler()
def verify_phone_number():
    try:
        phone_number = request.json['phone_number']
        if phone_number is None:
            return app_response(httpstatus.badrequest, message="Phone number is None")
        url = Config.twilio.url + "/" + phone_number
        lookup_resp = requests.get(url, auth = HTTPBasicAuth(Config.twilio.account_sid, Config.twilio.auth_token))
        if lookup_resp.status_code in [200,201]:
            return app_response(httpstatus.ok, isValid=True)
        if lookup_resp.status_code == 404:
            return app_response(httpstatus.badrequest, message="Invalid Number ", isValid=False)
    except Exception as e:
        logging.error("%s  - exception=%s", g.case_id, str(e))
        return app_response(httpstatus.badrequest, message="Invalid server response")

