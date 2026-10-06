// 70-o'yin: galereya — saqlangan rasmlar (localStorage, 20 tagacha, kodlangan satr) va PNG yuklab olish.
// Xotira yopiq bo'lsa (maxfiy rejim) — o'yin baribir ishlaydi: ro'yxat bo'sh, saqlash jim o'tadi va false qaytaradi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const L = QK.logic;
  const KALIT = "kichik-rassom:galereya:v1";
  const CHEGARA = 20;
  const PNG_KATAK = 12; // 32 × 12 = 384, 24 × 12 = 288

  function oqi() {
    try {
      const raw = root.localStorage.getItem(KALIT);
      if (!raw) return { keyingi: 1, rasmlar: [] };
      const d = JSON.parse(raw);
      const rasmlar = Array.isArray(d.rasmlar) ? d.rasmlar.filter((r) => r && typeof r.kod === "string" && L.och(r.kod)) : [];
      const keyingi = Number.isInteger(d.keyingi) && d.keyingi > 0 ? d.keyingi : rasmlar.length + 1;
      return { keyingi, rasmlar: rasmlar.slice(0, CHEGARA) };
    } catch (e) {
      return { keyingi: 1, rasmlar: [] };
    }
  }

  function yoz(d) {
    try {
      root.localStorage.setItem(KALIT, JSON.stringify(d));
      return true;
    } catch (e) {
      return false;
    }
  }

  // Ro'yxat: { id, nom, kod, vaqt } — yangisi oldinda
  const royxat = () => oqi().rasmlar.slice();
  const toldimi = () => oqi().rasmlar.length >= CHEGARA;

  // Saqlash: nom avtomatik («Rasm 1», «Rasm 2»…). To'lgan bo'lsa yoki xotira yopiq bo'lsa — null
  function saqla(taxta) {
    const d = oqi();
    if (d.rasmlar.length >= CHEGARA) return null;
    const rasm = { id: `r${Date.now().toString(36)}${d.keyingi}`, nom: `Rasm ${d.keyingi}`, kod: L.kodla(taxta), vaqt: Date.now() };
    d.rasmlar.unshift(rasm);
    d.keyingi++;
    return yoz(d) ? rasm : null;
  }

  function ochir(id) {
    const d = oqi();
    d.rasmlar = d.rasmlar.filter((r) => r.id !== id);
    return yoz(d);
  }

  const taxtasi = (rasm) => L.och(rasm.kod);

  // PNG: canvas 384 × 288 → toBlob → <a download="rasm-1.png">
  function pngYukla(taxta, nom) {
    const c = root.document.createElement("canvas");
    c.width = L.W * PNG_KATAK;
    c.height = L.H * PNG_KATAK;
    const g = c.getContext("2d");
    g.fillStyle = "#FFFFFF";
    g.fillRect(0, 0, c.width, c.height);
    for (let y = 0; y < L.H; y++) {
      for (let x = 0; x < L.W; x++) {
        const v = taxta[L.indeks(x, y)];
        if (v === L.BOSH) continue;
        g.fillStyle = L.PALITRA[v].hex;
        g.fillRect(x * PNG_KATAK, y * PNG_KATAK, PNG_KATAK, PNG_KATAK);
      }
    }
    const fayl = String(nom || "rasm").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".png";
    const yukla = (href) => {
      const a = root.document.createElement("a");
      a.href = href;
      a.download = fayl;
      root.document.body.append(a);
      a.click();
      a.remove();
    };
    if (c.toBlob) {
      c.toBlob((blob) => {
        if (!blob) { yukla(c.toDataURL("image/png")); return; }
        const url = URL.createObjectURL(blob);
        yukla(url);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }, "image/png");
    } else yukla(c.toDataURL("image/png"));
  }

  QK.galereya = { KALIT, CHEGARA, royxat, toldimi, saqla, ochir, taxtasi, pngYukla };
})(window);
