import os
import aiosmtplib
from dotenv import load_dotenv
import random   

load_dotenv()

class EmailService:
    __instance = None

    @staticmethod
    def get_email_service():
        if EmailService.__instance == None:
            EmailService()
        return EmailService.__instance

    async def __authorize_client(self) -> None:
        await self.__SMTP.auth_login(username=self.__app_email_address, password=self.__email_app_password)
        self.__authorized = True

    def __init__(self):
        if not self.__instance:
            self.__app_email_address = os.getenv("APPLICATION_EMAIL_ADDRESS")
            self.__email_app_password = os.getenv("APPLICATION_EMAIL_PASSWORD")
            self.__smtp_host_url = os.getenv("smtp.gmail.com")

            self.__SMTP = aiosmtplib.SMTP(
                host=self.__smtp_host_url,
                port=587,
            )

            self.__authorized = False

            self.__instance = self

    def generate_confirmation_code(self) -> str:
        return str.join([random.randint(0, 9) for _ in range(6)])

    async def send_email(self, recipient_email: str, recipient_username: str, confirmation_code: str) -> None:
        if not self.__authorized:
            await self.__authorize_client()
        
        await self.__SMTP.sendmail(
            sender=self.__app_email_address,
            recipients=recipient_email,
            message=f"Hi {recipient_username}! \n Your email confirmation code is: {confirmation_code}"
        )