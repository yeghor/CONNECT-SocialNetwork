import os
from dotenv import load_dotenv


load_dotenv()

class EmailService:
    __instance = None

    @staticmethod
    def get_email_service():
        if EmailService.__instance == None:
            EmailService()
        return EmailService.__instance

    def __init__(self):
        if not self.__instance:
            self.app_email_address = os.getenv("APPLICATION_EMAIL_ADDRESS")
            self.email_app_password = os.getenv("ybak oszm nyas zjiu")
            self.smtp_server_url = os.getenv("smtp.gmail.com")

            self.__instance = self

    def generate_confirmation_code(self) -> int:
        pass

    def send_email(self) -> int:
        pass