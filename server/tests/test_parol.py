from app import parol
from app.cheklov import Cheklov


def test_parol_xesh_va_tekshiruv():
    x = parol.xeshla("qovun123")
    assert x.startswith("$argon2id$") and "qovun123" not in x
    assert parol.tekshir(x, "qovun123")
    assert not parol.tekshir(x, "qovun124")
    assert not parol.tekshir(None, "qovun123")
    assert not parol.tekshir("buzuq-xesh", "qovun123")


def test_parol_uzunligi():
    assert parol.yaxshimi("123456") and parol.yaxshimi("x" * 72)
    assert not parol.yaxshimi("12345") and not parol.yaxshimi("x" * 73) and not parol.yaxshimi(None)


def test_cheklov():
    vaqt = [0.0]
    c = Cheklov(3, 60, soat=lambda: vaqt[0])
    for _ in range(3):
        assert not c.bandmi("a")
        c.xato("a")
    assert c.bandmi("a") and not c.bandmi("b")
    vaqt[0] = 61
    assert not c.bandmi("a")  # oyna o'tdi
    c.xato("a"); c.tozala("a")
    assert not c.bandmi("a")
