# Parol xeshi: argon2id. Server kichik (1 CPU, 300 MB) — OWASP minimal sozlamasi: 19 MiB, 2 o'tish.
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

_ph = PasswordHasher(time_cost=2, memory_cost=19456, parallelism=1)
MIN, MAX = 6, 72


def yaxshimi(p) -> bool:
    return isinstance(p, str) and MIN <= len(p) <= MAX


def xeshla(p: str) -> str:
    return _ph.hash(p)


def tekshir(xesh, p) -> bool:
    if not xesh or not isinstance(p, str):
        return False
    try:
        return _ph.verify(xesh, p)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


# Login topilmasa ham xuddi shuncha vaqt ketsin (login bor-yo'qligi vaqtdan bilinmasin)
SOXTA = xeshla("soxta-parol-vaqt-uchun")
