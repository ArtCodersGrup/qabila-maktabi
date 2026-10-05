# Xat yuborish: Gmail SMTP (muallifning Gmail'i + "App password"). Sozlama: SMTP_USER, SMTP_PAROL (api.env).
import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formataddr

from starlette.concurrency import run_in_threadpool

from . import config


def _yubor(kimga: str, mavzu: str, matn: str) -> None:
    user, parol = config.pochta()
    m = EmailMessage()
    m["From"] = formataddr(("Qabila maktabi", user))
    m["To"] = kimga
    m["Subject"] = mavzu
    m.set_content(matn)
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ssl.create_default_context(), timeout=20) as s:
        s.login(user, parol.replace(" ", ""))  # App password bo'sh joylar bilan berilishi mumkin
        s.send_message(m)


async def yubor(kimga: str, mavzu: str, matn: str) -> None:
    await run_in_threadpool(_yubor, kimga, mavzu, matn)
