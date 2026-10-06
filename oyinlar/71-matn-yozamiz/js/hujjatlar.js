// 71-o'yin: «Hujjatlar» — saqlangan matnlar (localStorage, 10 tagacha, faqat shu qurilmada).
// Xotira yopiq bo'lsa (maxfiy rejim) — o'yin baribir ishlaydi: ro'yxat bo'sh, saqlash null qaytaradi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const L = QK.logic;
  const KALIT = "matn-yozamiz:hujjatlar:v1";
  const CHEGARA = L.HUJJAT_CHEGARA;

  function oqi() {
    try {
      const raw = root.localStorage.getItem(KALIT);
      if (!raw) return { keyingi: 1, hujjatlar: [] };
      const d = JSON.parse(raw);
      const hujjatlar = Array.isArray(d.hujjatlar)
        ? d.hujjatlar.filter((x) => x && typeof x.id === "string" && typeof x.nom === "string" && typeof x.matn === "string")
          .map((x) => ({ id: x.id, nom: x.nom, matn: x.matn, html: typeof x.html === "string" ? x.html : L.matnHtml(x.matn), vaqt: Number(x.vaqt) || 0 }))
        : [];
      const keyingi = Number.isInteger(d.keyingi) && d.keyingi > 0 ? d.keyingi : hujjatlar.length + 1;
      return { keyingi, hujjatlar: hujjatlar.slice(0, CHEGARA) };
    } catch (e) {
      return { keyingi: 1, hujjatlar: [] };
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

  // Ro'yxat: { id, nom, matn, html, vaqt } — yangisi oldinda
  const royxat = () => oqi().hujjatlar.slice();
  const toldimi = () => oqi().hujjatlar.length >= CHEGARA;
  const top = (id) => oqi().hujjatlar.find((x) => x.id === id) || null;

  // Yangi hujjat: nom chipdan («Xat»), band bo'lsa — «Xat 2». To'lgan yoki xotira yopiq — null
  function saqla(nom, matn, html) {
    const d = oqi();
    if (d.hujjatlar.length >= CHEGARA) return null;
    const hujjat = {
      id: `h${Date.now().toString(36)}${d.keyingi}`,
      nom: L.yangiNom(String(nom || "Hujjat"), d.hujjatlar.map((x) => x.nom)),
      matn: String(matn == null ? "" : matn),
      html: L.tozaHtml(html == null ? L.matnHtml(matn) : html),
      vaqt: Date.now(),
    };
    d.hujjatlar.unshift(hujjat);
    d.keyingi++;
    return yoz(d) ? hujjat : null;
  }

  // Mavjud hujjatni yangilash (nomi qoladi); topilmasa — null
  function yangila(id, matn, html) {
    const d = oqi();
    const x = d.hujjatlar.find((q) => q.id === id);
    if (!x) return null;
    x.matn = String(matn == null ? "" : matn);
    x.html = L.tozaHtml(html == null ? L.matnHtml(matn) : html);
    x.vaqt = Date.now();
    return yoz(d) ? x : null;
  }

  function ochir(id) {
    const d = oqi();
    d.hujjatlar = d.hujjatlar.filter((x) => x.id !== id);
    return yoz(d);
  }

  QK.hujjatlar = { KALIT, CHEGARA, royxat, toldimi, top, saqla, yangila, ochir };
})(window);
