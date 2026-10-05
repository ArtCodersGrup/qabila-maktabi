import re
from pathlib import Path

from app import xona_qoidalari as Q

ok = {"type": "salom", "data": {"t0": 123}, "t": 1}


def test_kinds_js_bilan_bir_xil():
    js = (Path(__file__).resolve().parents[2] / "oyinlar/umumiy/js/onlayn.js").read_text(encoding="utf-8")
    m = re.search(r"const KINDS = \[([^\]]*)\]", js)
    assert tuple(re.findall(r'"([a-z]+)"', m.group(1))) == Q.KINDS


def test_payload_toʻgʻri():
    assert Q.valid_payload(ok)
    assert Q.valid_payload({"type": "javob", "t": 2})  # ma'lumotsiz
    assert Q.valid_payload({**ok, "data": {"pog": [0, 3, 7], "qah": ["tulki", "ayiq"]}})
    assert Q.valid_payload({**ok, "data": {"level": "proverb", "done": True, "pos": 12}})


def test_payload_notoʻgʻri():
    assert not Q.valid_payload(None)
    assert not Q.valid_payload([1])
    assert not Q.valid_payload({**ok, "type": "Salom, men Alisher"})
    assert not Q.valid_payload({**ok, "type": ""})
    assert not Q.valid_payload({**ok, "t": "1"})
    assert not Q.valid_payload({**ok, "t": True}), "mantiq son emas"
    assert not Q.valid_payload({**ok, "t": float("inf")})
    assert not Q.valid_payload({**ok, "t": 1e14})
    assert not Q.valid_payload({**ok, "data": {"text": "Salom, qalaysan?"}})
    assert not Q.valid_payload({**ok, "data": [1, 2]})
    assert not Q.valid_payload({**ok, "data": {"nom": ["Alisher Navoiy"]}})
    assert not Q.valid_payload({**ok, "data": {"pog": [1] * 33}})
    assert not Q.valid_payload({**ok, "data": {"deep": {"a": 1}}})
    assert not Q.valid_payload({**ok, "data": {f"k{i}": 1 for i in range(33)}})


def test_ulanish_xatosi():
    assert Q.ulanish_xatosi("sinov", "4827", "left", "left") is None
    assert Q.ulanish_xatosi("sinov", "4827", "right", "right") is None
    assert Q.ulanish_xatosi("tog", "1000", "host", "host") is None
    assert Q.ulanish_xatosi("tog", "9999", "k7f3a9", "player") is None
    for bad in [("chat", "4827", "left", "left"), ("sinov", "0123", "left", "left"), ("sinov", "12345", "left", "left"),
                ("sinov", "4827", "right", "left"), ("tog", "4827", "k7f3a9", "host"), ("tog", "4827", "host", "player"),
                ("tog", "4827", "Ali Valiyev", "player"), ("tog", "4827", "", "player"), ("tog", "4827", "x", "admin")]:
        assert Q.ulanish_xatosi(*bad) == "xato", bad
