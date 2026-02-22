import authorization as authorization_utils
from services.core_services import MainServiceBase
from services.postgres_service import User
from pydantic_schemas.pydantic_schemas_auth import *

# Somehow, * import doesn't work if object name begins with underscore
from pydantic_schemas.pydantic_schemas_auth import _2FAConfirmationBody

from services_types import JWTTypes

from uuid import uuid4

from exceptions.exceptions_handler import web_exceptions_raiser, endpoint_exception_handler
from exceptions.custom_exceptions import *

class MainServiceAuth(MainServiceBase):
    async def __generate_set_of_tokens(self, user_id: str, email_confirmation_required: bool = False, check_tokens_exist: bool = True) -> RefreshAccessTokens:
        potential_refresh_token = await self._RedisService.get_token_by_user_id(user_id=user_id, token_type="refresh")
        potential_access_token = await self._RedisService.get_token_by_user_id(user_id=user_id, token_type="acces")

        if check_tokens_exist:
            if potential_access_token:
                await self._RedisService.delete_jwt(jwt_token=potential_access_token, token_type="acces")
            if potential_refresh_token:
                await self._RedisService.delete_jwt(jwt_token=potential_refresh_token, token_type="refresh")
            
        return await self._JWT.generate_save_set_of_refresh_access_tokens(
            user_id=user_id,
            email_confirmation_required=email_confirmation_required,
            redis=self._RedisService
        )

    async def __create_2fa(self, email: str, username: str) -> None:
            confirmation_code = self._EmailService.generate_confirmation_code()

            await self._EmailService.send_second_factor_email(
                recipient_email=email,
                recipient_username=username,
                confirmation_code=confirmation_code
            )
            await self._RedisService.assign_second_factor(email=email, code=confirmation_code)

    @web_exceptions_raiser
    async def authorize_request(self, token: str, token_type: JWTTypes, return_user: bool = True) -> User | None:
        """Can be used in fastAPI Depends() \n Prepares and authorizes token"""
        
        prepared_token = self._JWT.prepare_token(jwt_token=token)

        if not await self._RedisService.check_jwt_existence(jwt_token=prepared_token, token_type=token_type):
            raise Unauthorized(detail=f"AuthService: User tried to authorize request by expired token: {token} token type: {token_type}", client_safe_detail="Invalid or expired token")
         
        if return_user:
            payload = self._JWT.extract_jwt_payload(jwt_token=prepared_token)
            user = await self._PostgresService.get_user_by_id(payload.user_id)
            if not user:
                raise Unauthorized(detail=f"AuthService: User tried to authorize request by token: {token} token type: {token_type}, but specified user id does not exist.", client_safe_detail="Invalid or expired token")
            return user

        return None

    @endpoint_exception_handler
    async def authorize_chat_token(self, token: str) -> str:
        """Returns original token"""

        if not await self._RedisService.check_chat_token_existense(chat_token=token):
            raise UnauthorizedInWebsocket(dev_log_detail=f"AuthService: User tried to connected to th ws chat by expired chat token: {token}", client_safe_detail="Invalid or expired token")
        
        return token

    @web_exceptions_raiser
    async def register(self, credentials: RegisterBody) -> EmailProvided:
        authorization_utils.validate_email(credentials.email)
        authorization_utils.validate_password(credentials.password)

        if await self._PostgresService.get_user_by_username_or_email(username=credentials.username, email=credentials.email):
            raise Collision(detail=f"AuthService: User tried to register with credentials: {credentials.username}, {credentials.email} that already exist.", client_safe_detail="Registered user with these credentials already exist")

        new_user = User(
            user_id=str(uuid4()),
            username=credentials.username, 
            email=credentials.email,
            password_hash=authorization_utils.hash_password(credentials.password),
            email_confirmed=False
        )

        await self._PostgresService.insert_models_and_flush(new_user)

        await self.__create_2fa(email=credentials.email, username=credentials.username)

        return EmailProvided(email=credentials.email)

    @web_exceptions_raiser
    async def login(self, credentials: LoginBody) -> RefreshAccessTokens:
        potential_user = await self._PostgresService.get_user_by_username_or_email(username=credentials.username, email=None)
        if not potential_user:
            raise InvalidResourceProvided(detail=f"AuthService: User tried to login to not existing account with credentials: {credentials.username}", client_safe_detail="Account with these credentials does not exist. You may need to sign up first")

        if not authorization_utils.check_password(credentials.password, potential_user.password_hash):
            raise Unauthorized(detail=f"AuthService: User with: {credentials.username} username tried to login with wrong password.", client_safe_detail="Password didn't match")
        
        if not potential_user.email_confirmed:
            # Returning null tokens with email confirmation required flag set to True
            await self.__create_2fa(email=potential_user.email, username=potential_user.username)
            return RefreshAccessTokens(email_to_confirm=potential_user.email)        

        return await self.__generate_set_of_tokens(user_id=potential_user.user_id)
    

    @web_exceptions_raiser
    async def confirm_email_2fa(self, credentials: _2FAConfirmationBody) -> RefreshAccessTokens:
        if not await self._RedisService.check_2fa(email=credentials.email, code=credentials.confirmation_code):
            raise InvalidResourceProvided(detail=f"AuthService: User with email: {credentials.email} tried to perform 2fa using wrong code.", client_safe_detail="Second factor authentication failed")
        
        await self._RedisService.deactivate_second_factor(email=credentials.email)

        confirmed_user = await self._PostgresService.get_user_by_username_or_email(email=credentials.email)

        if not confirmed_user:
            raise InvalidResourceProvided(detail=f"AuthService: user with email: {credentials.email} tried to confirm email, but such user doesn't exist yet", client_safe_detail=f"Email that you provided doesn't exist in our system")

        confirmed_user.email_confirmed = True

        return await self.__generate_set_of_tokens(user_id=confirmed_user.user_id)

    @web_exceptions_raiser
    async def recover_password_2fa(self, credentials: _2FAConfirmationBody) -> PasswordRecoveryToken:
        """Returns change password token"""

        if not await self._RedisService.check_2fa(email=credentials.email, code=credentials.confirmation_code):
            raise InvalidResourceProvided(detail=f"AuthService: User with email: {credentials.email} tried to perform 2fa using wrong code.", client_safe_detail="Second factor authentication failed")

        await self._RedisService.deactivate_second_factor(email=credentials.email)

        user = await self._PostgresService.get_user_by_username_or_email(email=credentials.email)

        if not user:
            raise InvalidResourceProvided(detail=f"AuthService: user with email: {credentials.email} tried to get password recovery token, but such user doesn't exist yet", client_safe_detail=f"Email that you provided doesn't exist in our system")
        elif not user.email_confirmed:
            raise InvalidAction(detail=f"AuthService: User: {user.user_id} with email: {user.email} tried to confir 2fa password recovery, while his email wasn't confirmed", client_safe_detail="You must confirm your email first!")

        return await self._JWT.generate_save_token(user_id=user.user_id, redis=self._RedisService, token_type="password-recovery")

    @web_exceptions_raiser
    async def recover_password(self, user: User, credentials: PasswordRecoveryBody) -> RefreshAccessTokens:
        """Actually changes password via token"""
        
        authorization_utils.validate_password(credentials.new_password)

        new_password_hash = authorization_utils.hash_password(credentials.new_password)
        user.password_hash = new_password_hash

        await self._RedisService.deactivate_tokens_by_user_id(user_id=user.user_id)

        return await self.__generate_set_of_tokens(user_id=user.user_id, email_confirmation_required=False)

    @web_exceptions_raiser
    async def request_password_recovery(self, email: str) -> EmailProvided:
        """Requests password change, issues change password 2fa"""
        potential_user = await self._PostgresService.get_user_by_username_or_email(email=email)

        # We won't tell user whether such email exists or not in our system
        if not potential_user:
            return EmailProvided(email=email)

        await self.__create_2fa(email=potential_user.email, username=potential_user.username)

        return EmailProvided(email=potential_user.email)

    @web_exceptions_raiser
    async def change_password(self, user: User, credentials: ChangePasswordBody) -> RefreshAccessTokens:
        authorization_utils.validate_password(credentials.new_password)

        if not authorization_utils.check_password(credentials.old_password, user.password_hash):
            raise InvalidResourceProvided(detail=f"AuthService: User: {user.user_id} tried to change password using wrong old password.", client_safe_detail="Old password didn't match")

        user.password_hash = authorization_utils.hash_password(credentials.new_password)

        await self._RedisService.deactivate_tokens_by_user_id(user.user_id)
        return await self.__generate_set_of_tokens(user.user_id, email_confirmation_required=False, check_tokens_exist=False)
    
    @web_exceptions_raiser
    async def issue_new_second_factor(self, email: str) -> EmailProvided:
        user = await self._PostgresService.get_user_by_username_or_email(email=email)

        if not user:
            raise InvalidResourceProvided(detail=f"AuthService: User with email: {email} tried to issue new second factor authentication with email that does not exists in the database.", client_safe_detail="User with this email doesn't exist")

        await self.__create_2fa(email=email, username=user.username)

        return EmailProvided(email=email)

    @web_exceptions_raiser
    async def logout_on_this_device(self, tokens: RefreshAccessTokens) -> None:
        await self._RedisService.delete_jwt(jwt_token=tokens.access_token, token_type="acces")
        await self._RedisService.delete_jwt(jwt_token=tokens.refresh_token, token_type="refresh")

    @web_exceptions_raiser
    async def logout_on_every_device(self, user: User) -> None:
        await self._RedisService.deactivate_tokens_by_user_id(user_id=user.user_id)

    @web_exceptions_raiser
    async def refresh_token(self, refresh_token: str) -> AccessTokenSchema:
        prepared_token = self._JWT.prepare_token(jwt_token=refresh_token)
        if not await self._RedisService.check_jwt_existence(jwt_token=prepared_token, token_type="refresh"):
            raise Unauthorized(detail=F"AuthService: User with refresh token: {refresh_token} that does not exist tried to refresh tokens.", client_safe_detail="Invalid or expired token")
        
        payload = self._JWT.extract_jwt_payload(jwt_token=prepared_token)
        user_id = payload.user_id

        # Raising Unauthorized to not reveal server data
        if not await self._PostgresService.get_user_by_id(user_id=user_id):
            await self._RedisService.deactivate_tokens_by_user_id(user_id=user_id)
            raise Unauthorized(detail=f"AuthService: user: {user_id} tried to refresh access token, while his profile instance was deleted.", client_safe_detail="Invalid or expired token")

        old_access_token = await self._RedisService.get_token_by_user_id(user_id=user_id, token_type="acces")
        new_access_token = await self._JWT.generate_save_token(user_id=user_id, redis=self._RedisService, token_type="acces")

        await self._RedisService.refresh_access_token(old_token=old_access_token, new_token=new_access_token.access_token, user_id=user_id)
        return new_access_token
    
    @web_exceptions_raiser
    async def change_username(self, user: User, credentials: NewUsernameBody) -> EmailProvided:
        new_username = credentials.new_username

        if user.username == credentials.new_username:
            raise InvalidResourceProvided(detail=f"AuthService: User: {user.user_id} tried to change username to identical to his old one.", client_safe_detail="New username can't the same as old one")

        await self._PostgresService.change_field_and_flush(model=user, username=new_username)

    @web_exceptions_raiser
    async def delete_user(self, password: str, user: User) -> None:
        if not authorization_utils.check_password(entered_pass=password, hashed_pass=user.password_hash):
            raise InvalidResourceProvided(detail=f"AuthService: User: {user.user_id} tried to delete his profile, but password didn't match.", client_safe_detail="Password didn't match")
        
        await self._PostgresService.delete_models_and_flush(user)
        await self._RedisService.deactivate_tokens_by_user_id(user_id=user.user_id)
        await self._ImageStorage.delete_avatar_user(user_id=user.user_id)
    