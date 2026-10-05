# Xato urinishlarni sanash (xotirada): oyna ichida `soni` ta xato bo'lsa — kalit band.
import time


class Cheklov:
    def __init__(self, soni: int, oyna: float, soat=time.monotonic):
        self.soni = soni
        self.oyna = oyna
        self.soat = soat
        self.yozuv: dict[str, list[float]] = {}

    def _yangila(self, k: str) -> list[float]:
        chegara = self.soat() - self.oyna
        qolgan = [t for t in self.yozuv.get(k, []) if t > chegara]
        if qolgan:
            self.yozuv[k] = qolgan
        else:
            self.yozuv.pop(k, None)
        return qolgan

    def bandmi(self, k: str) -> bool:
        return len(self._yangila(k)) >= self.soni

    def xato(self, k: str) -> None:
        if len(self.yozuv) > 10_000:  # hujumda xotira o'smasin
            self.yozuv.clear()
        self._yangila(k)
        self.yozuv.setdefault(k, []).append(self.soat())

    def tozala(self, k: str) -> None:
        self.yozuv.pop(k, None)
