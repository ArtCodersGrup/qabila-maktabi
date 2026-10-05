# Sozlamalar muhit o'zgaruvchilaridan olinadi (serverda /srv/kelajagim/api.env, systemd EnvironmentFile).
import os


def database_url() -> str:
    url = os.environ.get("KELAJAGIM_DB")
    if not url:
        raise RuntimeError("KELAJAGIM_DB muhit o'zgaruvchisi berilmagan")
    return url
