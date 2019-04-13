import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from os.path import basename
import io
import csv
from flask import make_response

def send_email():
    email = 'sendingemail.demo@gmail.com'
    password = 'Focus@1234d'
    send_to_email = 'brij.singh@remego.com;brij.ece07@gmail.com'
    subject = 'Report'

    messageHTML = """
                    <body style="background-color: #f2f2f2;color:#000;font-family:'Palatino Linotype', 'Book Antiqua', Palatino, serif;background-image:url('2.jpg')">
                        <p><b>Hello, Mr {0}</b></p>
                        <p>Below are the states for your enquiry for Syslog level count from {9} to {10}:</p>
                        <p>
                            <table style="margin-top:20px;padding:5px;border:1px solid black; width:50%;text-align:center;">
                                <tr  style="border:1px solid black;background-color:#006087;color:#fff;opacity:0.8;">
                                    <td>Emergency</td>
                                    <td>Alert</td>
                                    <td>Critical</td>
                                    <td>Error</td>
                                    <td>Warning</td>
                                    <td>Notice</td>
                                    <td>Informational</td>
                                    <td>Debug</td>
                                </tr>
                                <tr  style="border:1px solid black;">
                                    <td>{1}</td>
                                    <td>{2}</td>
                                    <td style="color:red;">{3}</td>
                                    <td>{4}</td>
                                    <td>{5}</td>
                                    <td>{6}</td>
                                    <td>{7}</td>
                                    <td>{8}</td>
                                </tr>
                            </table>
                        </p>
                        <p style="margin-top:100px">Regards,<br/><a style="font-size:12px;" href="www.remego.com" target="_blank">Remego Pte. Ltd.</a></p>
                    </body>
    """.format('See Kok Sin','10002','100210','100022','102200','100430','1001','10110','1202','08-11-1989','08-11-1992')
    #messagePlain = 'Visit nitratine.net for some great tutorials and projects!'

    msg = MIMEMultipart('alternative')
    msg['From'] = email
    msg['To'] = send_to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(messageHTML, 'html'))
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(email, password)
    text = msg.as_string()
    server.sendmail(email, send_to_email.split(';'), text)
    server.quit()


if __name__ == "__main__":
    send_email()
