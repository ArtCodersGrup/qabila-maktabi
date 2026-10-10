# Onlayn xona qoidalari — oyinlar/umumiy/js/onlayn.js dagi tekshiruv bilan bir xil (sof funksiyalar).
# Ism, chat va erkin matn o'tmaydi: faqat sonlar, mantiq, qisqa kalit so'zlar va ularning ro'yxatlari.
import math
import re

KINDS = ("sinov", "poyga", "savol", "tog", "tank", "qala")
CODE_TTL_MS = 600_000  # ikki kishilik xona kodi 10 daqiqa amal qiladi
HOST = "host"
SIDES = ("left", "right")
MAX_ODAM = 13  # 12 o'yinchi + boshlovchi
MAX_ODAM_KIND = {"qala": 31}
FAQAT_HOSTGA = ("qala",)  # o'yinchi xabari faqat boshlovchiga (boshqa o'yinchilarga tarqalmaydi)  # Qal'a — butun sinf: 30 bola (ikki jamoa) + boshlovchi


def max_odam(kind) -> int:
    return MAX_ODAM_KIND.get(kind, MAX_ODAM)

MAX_KADR = 4096  # bitta xabar (bayt)
MAX_XONA = 300  # bir vaqtda ochiq xonalar
TEZLIK = 30  # bitta ulanishdan soniyasiga ko'pi bilan shuncha xabar

_KIMLIK = re.compile(r"[a-z0-9:_-]{1,32}", re.I)
_KALIT = re.compile(r"[a-z0-9:_-]{0,32}", re.I)
_KOD = re.compile(r"[1-9][0-9]{3}")


def kimlik(v) -> bool:
    return isinstance(v, str) and _KIMLIK.fullmatch(v) is not None


def _son(v) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v) and abs(v) <= 1e13


def _oddiy(v) -> bool:
    return _son(v) or isinstance(v, bool) or (isinstance(v, str) and _KALIT.fullmatch(v) is not None)


def _qiymat(v) -> bool:
    return _oddiy(v) or (isinstance(v, list) and len(v) <= 32 and all(_oddiy(x) for x in v))


def valid_payload(p) -> bool:
    if not isinstance(p, dict) or not kimlik(p.get("type")) or not _son(p.get("t")):
        return False
    data = p.get("data")
    if data is None:
        return True
    if not isinstance(data, dict) or len(data) > 32:
        return False
    return all(kimlik(k) and _qiymat(v) for k, v in data.items())


def ulanish_xatosi(kind, code, key, role):
    """None — ulanish so'rovi to'g'ri; aks holda "xato"."""
    if kind not in KINDS or not isinstance(code, str) or _KOD.fullmatch(code) is None or not kimlik(key):
        return "xato"
    if role in SIDES:
        return None if key == role else "xato"
    if role == "host":
        return None if key == HOST else "xato"
    if role == "player":
        return None if key != HOST else "xato"
    return "xato"
