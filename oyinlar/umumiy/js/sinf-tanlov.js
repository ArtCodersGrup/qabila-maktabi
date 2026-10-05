// Onlayn xona ochishdan oldin: kirgan o'qituvchi natijalar qaysi sinfga yozilishini tanlaydi.
// O'qituvchi bo'lmasa, kirmagan bo'lsa, sinfi yo'q bo'lsa yoki internet bo'lmasa — hech narsa so'ramaydi (null).
// E — o'yinning ekran yordamchisi ({ box, buttons }); natija: Promise<{ id, nom } | null>.
(function (root) {
  "use strict";

  const XOTIRA = "qabila:xona-sinf:v1"; // oxirgi tanlangan sinf — keyingi safar birinchi turadi

  async function sinfTanlov(E) {
    const QK = root.QK;
    const H = QK.hisob;
    if (!H || !H.mumkin(root.location)) return null;
    const s = H.saqlangan();
    if (!s || !["teacher", "admin"].includes(s.rol)) return null;
    const r = await H.sinf.royxat();
    if (!r.ok || !r.sinflar.length) return null;

    let oxirgi = null;
    try { oxirgi = Number(root.localStorage.getItem(XOTIRA)) || null; } catch (e) { /* yo'q */ }
    const sinflar = r.sinflar.slice().sort((a, b) => (b.id === oxirgi) - (a.id === oxirgi));
    const h = QK.ui.h;

    return new Promise((resolve) => {
      const tanla = (x) => {
        try { if (x) root.localStorage.setItem(XOTIRA, String(x.id)); } catch (e) { /* e'tiborsiz */ }
        resolve(x ? { id: x.id, nom: x.nom } : null);
      };
      const el = E.box(false);
      el.append(
        h("h1", { class: "game-title", text: "Qaysi sinf uchun?" }),
        h("p", { class: "tog-note", text: "Natijalar oʻqituvchi panelining «Xonalar» boʻlimiga yoziladi." }));
      const tugmalar = h("div", { class: "tog-menyu" });
      for (const x of sinflar) {
        const b = h("button", { class: "menyu-karta", type: "button" },
          h("span", { class: "menyu-nom", text: x.nom }),
          h("span", { class: "menyu-izoh", text: `${x.soni} oʻquvchi` }));
        b.addEventListener("click", () => { QK.sound.play("tap"); tanla(x); });
        tugmalar.append(b);
      }
      el.append(tugmalar);
      E.buttons([{ label: "Sinfsiz (natija saqlanmaydi)", onClick: () => tanla(null), secondary: true }]);
      QK.ui.bubble("elder", "Qaysi sinf oʻynaydi?");
    });
  }

  root.QK = root.QK || {};
  root.QK.sinfTanlov = sinfTanlov;
})(window);
