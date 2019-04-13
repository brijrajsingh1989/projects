import logging
import requests

from app_config import Config
from lib.utils import dotdict, nvl, send_email


class Salesforce(object):

    def __init__(self):
        self.tokens = dotdict({})
        self.refresh_tokens()
        self.db_query = """
                SELECT
                    DATE_ADD(eqq.insert_date_time, INTERVAL - 4 HOUR) as insert_date_time
                   ,epi.evolve_id as evolve_id
                   ,epi.first_name as first_name
                   ,epi.last_name as last_name
                   ,epi.email_address as email_address
                   ,epi.customer_city as customer_city
                   ,eqq.zip_code as zip_code
                   ,eqq.state as state
                   ,CASE WHEN eqq.gender = 1 THEN 'Female' ELSE 'Male' END as gender
                   ,eqq.journeyId
                   ,DATE_FORMAT(NOW(), '%%Y') - DATE_FORMAT(eqq.customer_dob, '%%Y') - (DATE_FORMAT(NOW(), '%%m-%%d') < DATE_FORMAT(eqq.customer_dob, '%%m-%%d')) as age
                   ,eqq.customer_dob
                   ,cast(eqq.customer_height as signed) div 12 customer_height_feet
                   ,cast(eqq.customer_height as signed) mod 12 customer_height_inch
                   ,eqq.customer_weight as customer_weight
                   ,REPLACE(epi.mobile_number, '-', '') as mobile_number
                   ,REPLACE(epi.secondary_number, '-', '') as secondary_number
                   ,CASE WHEN eqq.tobacco_quit_option IS NULL THEN 'Never'
                         WHEN eqq.tobacco_quit_option = 1 THEN 'Used within 1 year'
                         WHEN eqq.tobacco_quit_option = 2 THEN 'Used more than 1 year ago'
                         WHEN eqq.tobacco_quit_option = 3 THEN 'Used more than 2 years ago'
                         WHEN eqq.tobacco_quit_option = 4 THEN 'Used more than 3 years ago'
                   END as tobacco_quit_option
                   ,CASE WHEN eqq.overallHeath = 1 THEN 'Super Fit'
                         WHEN eqq.overallHeath = 2 THEN 'Fit'
                         WHEN eqq.overallHeath = 3 THEN 'Average'
                         WHEN eqq.overallHeath = 4 THEN 'Im working on it'
                   END as overallHeath
                   ,eqi.policy_lasts as duration
                   ,eqi.coverage_amount as coverage_amount
                   ,eqq.planinsurance as planinsurance
                   ,eqi.premium
                   ,eqq.city_fullname
                   ,eqq.state_fullname
                   ,pst.first_source
                   ,pst.first_medium
                   ,pst.first_campaign
                   ,pst.first_term
                   ,pst.first_content
                   ,pst.first_gclid
                   ,pst.first_date
                   ,pst.last_source
                   ,pst.last_medium
                   ,pst.last_campaign
                   ,pst.last_term
                   ,pst.last_content
                   ,pst.last_gclid
                   ,pst.last_date
                   ,pst.id
                   ,pst.first_cid
                   ,pst.last_cid
                   ,pst.external_id
                FROM evolve_personal_info as epi
                   LEFT OUTER JOIN evolve_quotes_quote  as eqq on eqq.evolve_id = epi.evolve_id
                   LEFT OUTER JOIN evolve_quote_input   as eqi on eqi.evolve_id = epi.evolve_id
                   LEFT OUTER JOIN paid_search_tracking as pst on pst.evolveID  = epi.evolve_id
                WHERE epi.evolve_id = '%s'
                ORDER BY pst.id DESC
                LIMIT 1
        """

    @staticmethod
    def send_error_email(evolve_id, message):
        subject = "Salesforce API Error: {}".format(evolve_id)
        body = """
        <body>
            <p>Hi,</p>
            <p>This email is to alert that the lead with  evolve ID {} has faced an issue while being
              transferred to Salesforce.<br>
              Details: {}
            </p>
        </body>Thanks
        """
        body = body.format(evolve_id, message)

        try:
            send_email(Config.api_salesforce.notifyto, subject, body)
        except:
            pass

    def refresh_tokens(self):
        """
            Refresh Tokens..
            1. Call token API.
            2. Update class variables
        """

        payload = {'username': Config.api_salesforce.username,
                   'client_secret': Config.api_salesforce.client_secret,
                   'password': Config.api_salesforce.password,
                   'grant_type': 'password',
                   'client_id': Config.api_salesforce.client_id}

        try:
            resp = requests.post(Config.api_salesforce.auth_url, data=payload)

            if resp.status_code not in [200, 201]:
                logging.error('Failed to login. HTTP status : %s <%s>', resp.status_code, resp.text)
                return False

            # Login succeeded. Now start assigning the values..
            try:
                resp_json = resp.json()
            except ValueError:
                logging.error('Invalid Response json. %s', resp.text)
                return

            self.tokens = dotdict(dict(access_token=resp_json['access_token'],
                                       instance_url=resp_json['instance_url'],
                                       id=resp_json['id'],
                                       issued_at=resp_json['issued_at'],
                                       signature=resp_json['signature']))

        except Exception, e:
            logging.error('HTTP Error. exception=%s', str(e))

    def post_data(self, evolve_id, url_path, data, max_retry=3):
        resp = None

        for retries in xrange(max_retry):
            url = self.tokens.instance_url + url_path
            try:
                headers = {'Content-Type': 'application/json', 'authorization': 'Bearer ' + self.tokens.access_token}
                resp = requests.post(url, json=data, headers=headers)

                # UNAUTHORIZED. Fetch tokens again and send request.
                if resp.status_code == 401:
                    resp = None
                    self.refresh_tokens()
                    continue

                logging.debug('%s - url=%s - status_code=%s - content=%s retry=%d',
                              evolve_id, url, resp.status_code, resp.text, retries + 1)
                break

            except Exception, e:
                logging.error('%s - url=%s - exception=%s retry=%d', evolve_id, url, str(e), retries + 1)

        return resp

    def create_lead(self, evolve_id, data):

        leadid = None
        msgstr = None

        payload = {"Company": "LGA",
                   "birthdate__c": str(data['customer_dob']),
                   "Email": data['email_address'],
                   "evolve_id__c": evolve_id,
                   "FirstName": data['first_name'],
                   "LastName": data['last_name'],
                   "Gender__c": data['gender'],
                   "phone": data['mobile_number'],
                   "Product__c": "Term",
                   "Source_Category__c": "Website Lead",
                   "StateCode": data['state'],
                   "TCPA_Phone__c": True,
                   "TCPA_Phone_Secondary__c": False,
                   "PostalCode": data['zip_code'],
                   "City": data['city_fullname'],
                   "Source_Journey__c": data['journeyId'],
                   "Height_Feet__c": data['customer_height_feet'],
                   "Height_Inches__c": data['customer_height_inch'],
                   "Weight__c": data['customer_weight'],
                   "Source_First_Source__c": nvl(data['first_source'], ''),
                   "Source_First_Medium__c": nvl(data['first_medium'], ''),
                   "Source_First_Campaign__c": nvl(data['first_campaign'], ''),
                   "Source_First_Term__c": nvl(data['first_term'], ''),
                   "Source_First_Content__c": nvl(data['first_content'], ''),
                   "Source_First_GCLID__c": data['first_gclid'] if data['first_gclid'] else data['last_gclid'],
                   "Source_First_CID__c": nvl(data['first_cid'], ''),
                   "Source_Last_Source__c": nvl(data['last_source'], ''),
                   "Source_Last_Medium__c": nvl(data['last_medium'], ''),
                   "Source_Last_Campaign__c": nvl(data['last_campaign'], ''),
                   "Source_Last_Term__c": nvl(data['last_term'], ''),
                   "Source_Last_Content__c": nvl(data['last_content'], ''),
                   "Source_Last_GCLID__c": nvl(data['last_gclid'], ''),
                   "Source_Last_CID__c": nvl(data['last_cid'], ''),
                   "External_Lead_ID__c": nvl(data['external_id'],'')
                   }

        try:
            resp = self.post_data(evolve_id, url_path="/services/data/v41.0/sobjects/Lead", data=payload)
            msgstr = "Status Code {} {}".format(resp.status_code, resp.text)

            if resp.status_code in [200, 201]:
                resp_json = resp.json()
                leadid = resp_json.get("id")
            else:
                logging.error('%s - Response code: %s/%s', evolve_id, resp.status_code, resp.text)
        except ValueError, e:
            logging.error('%s - Invalid Response json. %s', evolve_id, str(e))
        except Exception, e:
            logging.error('%s - exception:%s', evolve_id, str(e))

        if leadid is None:
            self.send_error_email(evolve_id, msgstr)

        return leadid

    def create_web_quote(self, evolve_id, leadid, data):
        webquoteid = None
        msgstr = None

        payload = {"age__c": data['age'],
                   "date_of_birth__c": str(data['customer_dob']),
                   "face_amount__c": data['coverage_amount'],
                   "gender__c": data['gender'],
                   "height_feet__c": data['customer_height_feet'],
                   "height_inches__c": data['customer_height_inch'],
                   "lead__c": leadid,
                   "payment_mode__c": "Monthly",
                   "premium__c": data['premium'],
                   "product__c": "Term",
                   "quoted_uw_class__c": data['planinsurance'],
                   "self_health_assessment__c": data['overallHeath'],
                   "term_duration__c": str(data['duration']) + " Years",
                   "tobacco_use__c": data['tobacco_quit_option'],
                   "weight__c": data['customer_weight']}

        """
           Required keys for ref..
           keys = ["age__c", "date_of_birth__c", "gender__c", "height_feet__c",
                "height_inches__c", "lead__c", "payment_mode__c", "premium__c",
                "product__c", "quoted_uw_class__c", "self_health_assessment__c",
                "term_duration__c", "tobacco_use__c", "weight__c", "face_amount__c"]
        """

        try:
            resp = self.post_data(evolve_id, url_path="/services/data/v41.0/sobjects/Web_Quote__c", data=payload)
            msgstr = "Status Code {} {}".format(resp.status_code, resp.text)
            if resp.status_code in [200, 201]:
                resp_json = resp.json()
                webquoteid = resp_json.get("id")
            else:
                logging.error('%s - Response code: %s/%s', evolve_id, resp.status_code, resp.text)
        except ValueError, e:
            logging.error('%s - Invalid Response json. %s', evolve_id, str(e))
        except Exception, e:
            logging.error('%s - exception:%s', evolve_id, str(e))

        if webquoteid is None:
            self.send_error_email(evolve_id, msgstr)

        return webquoteid
