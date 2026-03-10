from exceptions.custom_exceptions import ValidationExc
import re


def validate_password(password: str) -> None:
    """Raises ValidationErrorExc on failed validation"""

    if not re.match(r"^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])", password):
        raise ValidationExc(
            detail="validate_password: Password validation failed.",
            client_safe_detail="Password is not secure enough",
        )


def validate_email(email: str) -> None:
    """Raises ValidationErrorExc on failed validation"""

    if not re.match(
        r"^(?!\.)(?!.*\.\.)[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+"
        r"@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$",
        email,
    ):
        raise ValidationExc(
            detail="validate_email: Email validation failed.",
            client_safe_detail="Email is not Valid",
        )


def validate_username(username: str) -> None:
    """Raises ValidationErrorExc on failed validation"""

    if not re.match(r"^[\w._\-!'`*]{3,32}$", username):
        raise ValidationExc(
            detail="validate_username: Username validation failed.",
            client_safe_detail="Username is not valid",
        )


def validate_post_text_content(title: str, text: str) -> None:
    if not re.match(r"^[^\n]{3,256}$", title):
        raise ValidationExc(
            detail="validate_post_text_content: Post title validation failed",
            client_safe_detail="Post title length must be in range from 3 to 256",
        )
    elif not re.match(r"^[\s\S]{0,4000}$", text):
        raise ValidationExc(
            detail="validate_post_text_content: Post text validation failed",
            client_safe_detail="Post text length mustn't be larger than 4000 characters",
        )
