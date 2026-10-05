# Sozlamalar muhit o'zgaruvchilaridan olinadi (serverda /srv/kelajagim/api.env, systemd EnvironmentFile).
import os

ORIGINLAR = "https://kelajagim.uz,https://www.kelajagim.uz,http://localhost:8199"


def database_url() -> str:
    url = os.environ.get("KELAJAGIM_DB")
    if not url:
        raise RuntimeError("KELAJAGIM_DB muhit o'zgaruvchisi berilmagan")
    return url


def originlar() -> set[str]:
    # POST so'rovlari faqat shu sahifalardan (CSRF himoyasi)
    return {o.strip() for o in os.environ.get("KELAJAGIM_ORIGINS", ORIGINLAR).split(",") if o.strip()}


def google():
    """(client_id, client_secret) yoki None — Google ulanmagan."""
    cid, sec = os.environ.get("GOOGLE_CLIENT_ID"), os.environ.get("GOOGLE_CLIENT_SECRET")
    return (cid, sec) if cid and sec else None


def google_qaytish() -> str:
    return os.environ.get("GOOGLE_REDIRECT", "https://kelajagim.uz/api/hisob/google/qaytish")
