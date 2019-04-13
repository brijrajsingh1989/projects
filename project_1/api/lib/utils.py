import smtplib
import logging

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

class OneLineFormatter(logging.Formatter):
    def format(self, record):
        result = super(OneLineFormatter, self).format(record)
        if result:
            result = result.replace('\r', '\\r').replace('\n', "\\n")
        return result

def nvl(v, r):
    """ Handy function if null return replacement """
    if v is None:
        return r
    elif isinstance(v, basestring) and v.strip() == '':
        return r

    return v


def isempty(i):

    if i is None:
        return True
    if isinstance(i, basestring):
        return not (i and i.strip())
    elif isinstance(i, dict):
        return not i
    elif isinstance(i, list):
        return not i

    return None


class dotdict(dict):
    """dot.notation access to dictionary attributes"""
    __getattr__ = dict.get
    __setattr__ = dict.__setitem__
    __delattr__ = dict.__delitem__


def send_email(to, subject, message):
        msg = MIMEMultipart()
        msg['From'] = 'noreply@lgamerica.com'
        msg['To'] = ','.join(to) if isinstance(to, list) else to
        msg['Subject'] = subject
        msg.attach(MIMEText(message, 'html'))
        mailserver = smtplib.SMTP('smtp.lgamerica.com', 25)
        mailserver.ehlo()
        mailserver.starttls()
        mailserver.ehlo()
        mailserver.sendmail('No Reply <noreply@lgamerica.com>', to, msg.as_string())
        mailserver.quit()


def http_requests_debug(debug):

    if not debug:
        return

    try:
        import http.client as http_client
    except ImportError:
        # Python 2
        import httplib as http_client

    http_client.HTTPConnection.debuglevel = 1
 
    import logging
    # you need to initialize logging, otherwise you will not see
    # anything from requests
    logging.basicConfig()
    logging.getLogger().setLevel(logging.DEBUG)
 
    requests_log = logging.getLogger("requests.packages.urllib3")
    requests_log.setLevel(logging.DEBUG)
    requests_log.propagate = True
