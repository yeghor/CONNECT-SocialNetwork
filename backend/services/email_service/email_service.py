import os
import aiosmtplib
from email.message import EmailMessage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv
import random

load_dotenv()


def generate_confirmation_email_html(confirmation_code: str, username: str):
    return f"""
        <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Confirm Your Email</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #121212; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #121212; padding: 40px 20px;">
                    <tr>
                        <td align="center">
                            <table width="100%" max-width="450px" border="0" cellspacing="0" cellpadding="0" 
                                style="max-width: 450px; background-color: #1e1e1e; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
                                
                                <tr>
                                    <td style="padding: 16px 24px; background-color: rgba(255, 255, 255, 0.03); border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                                        <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: rgba(255, 255, 255, 0.9);">
                                            CONNECT Email Verification
                                        </h2>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding: 24px;">
                                        <div style="margin-bottom: 24px;">
                                            <p style="font-size: 15px; font-weight: bold; color: rgba(255, 255, 255, 0.9); line-height: 1.5; margin: 0 0 20px 0;">
                                                Hello {username}!
                                            </p>
                                            <p style="font-size: 15px; color: rgba(255, 255, 255, 0.9); line-height: 1.5; margin: 0 0 20px 0;">
                                                Please use the following code to confirm your identity. This code will expire shortly.
                                            </p>
                                            
                                            <div style="background-color: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; text-align: center;">
                                                <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #ffffff;">
                                                    {confirmation_code}
                                                </span>
                                            </div>
                                        </div>

                                        <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 24px 0;">

                                        <div style="margin-top: 24px;">
                                            <label style="display: block; font-size: 14px; font-weight: 500; color: rgba(255, 255, 255, 0.7); margin-bottom: 8px;">
                                                Didn't request this?
                                            </label>
                                            <p style="font-size: 13px; color: rgba(255, 255, 255, 0.4); margin: 0;">
                                                If you didn't attempt to manage your profile or sign up, you can safely ignore this email.
                                            </p>
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding: 16px 24px; text-align: center; background-color: rgba(255, 255, 255, 0.03); border-top: 1px solid rgba(255, 255, 255, 0.1);">
                                        <p style="margin: 0; font-size: 13px; color: rgba(255, 255, 255, 0.3);">
                                            CONNECT
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        </html>
    """


class EmailService:
    __instance = None

    @staticmethod
    def __get_email_service():
        if EmailService.__instance == None:
            EmailService()
        return EmailService.__instance

    async def __connect_and_authorize_client(self) -> None:
        await self.__SMTP.connect()
        await self.__SMTP.auth_login(
            self.__app_email_address, self.__email_app_password
        )
        self.__authorized = True

    def __init__(self):
        if not self.__instance:
            self.__app_email_address = os.getenv("APPLICATION_EMAIL_ADDRESS")
            self.__email_app_password = os.getenv("APPLICATION_EMAIL_PASSWORD")
            self.__smtp_host_url = os.getenv("SMTP_SERVER")

            self.__SMTP = aiosmtplib.SMTP(
                hostname=self.__smtp_host_url,
                port=587,
            )

            self.__authorized = False

            self.__instance = self

    def generate_confirmation_code(self) -> str:
        return "".join([str(random.randint(0, 9)) for _ in range(6)])

    async def send_second_factor_email(
        self, recipient_email: str, recipient_username: str, confirmation_code: str
    ) -> None:
        if not self.__authorized:
            await self.__connect_and_authorize_client()

        email_message = MIMEMultipart()
        email_message["From"] = os.getenv("APPLICATION_EMAIL_ADDRESS")
        email_message["To"] = recipient_email
        email_message["Subject"] = "CONNECT Email Confirmation Code"
        email_message.attach(
            MIMEText(
                generate_confirmation_email_html(
                    confirmation_code=confirmation_code,
                    username=recipient_username
                ),
                "html",
            )
        )

        await self.__SMTP.sendmail(
            self.__app_email_address, recipient_email, email_message.as_bytes()
        )
