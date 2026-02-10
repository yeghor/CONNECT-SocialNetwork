import os
import aiosmtplib
from dotenv import load_dotenv
import random   

load_dotenv()

class EmailService:
    __instance = None

    @staticmethod
    def __get_email_service():
        if EmailService.__instance == None:
            EmailService()
        return EmailService.__instance

    async def __connect_and_authorize_client(self) -> None:
        await self.__SMTP.connect()
        await self.__SMTP.auth_login(self.__app_email_address, self.__email_app_password)
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

    async def send_second_factor_email(self, recipient_email: str, recipient_username: str, confirmation_code: str) -> None:
        if not self.__authorized:
            await self.__connect_and_authorize_client()
        
        await self.__SMTP.sendmail(
            self.__app_email_address,
            recipient_email,
            f"Hi {recipient_username.title()}! \n Your email confirmation code is: {confirmation_code}"
        )