// «AI va harakat» rasmlari: skelet koordinatalardan chiziladi (SVG, matnsiz — QOIDALAR §6).
// Nuqta nomlari va koordinatalar — HTML da (scenes/common.js).
(function (root) {
  "use strict";

  const L = root.QK.logic;
  const INK = "#2B2B3A";
  const RANG = { chap: "#2F6FDE", ong: "#F08A24", orta: "#2B2B3A" };

  // p — nuqtalar: { bosh: [x, y], … }. o: setka, tana (kulrang gavda), bor (chizilgan nuqtalar roʻyxati),
  // belgi (halqa bilan belgilangan nuqta), chiziqlar (gorizontal punktir: [y, …]), mini (kichik kadr), nom (aria-label)
  function skelet(p, o) {
    const q = o || {};
    const bor = (id) => !q.bor || q.bor.includes(id);
    const s = [];
    s.push(`<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${q.nom || "Skelet: tayanch nuqtalar va ularni tutashtiruvchi chiziqlar"}">`);
    s.push(`<rect x="0.5" y="0.5" width="99" height="119" rx="${q.mini ? 6 : 2}" fill="#FFFFFF" stroke="#D3DCE8" stroke-width="1"/>`);
    if (q.setka) {
      for (let v = 10; v < 100; v += 10) s.push(`<line x1="${v}" y1="0" x2="${v}" y2="120" stroke="${v % 20 ? "#E6EBF2" : "#C3CCDA"}" stroke-width="${v % 20 ? 0.4 : 0.7}"/>`);
      for (let v = 10; v < 120; v += 10) s.push(`<line x1="0" y1="${v}" x2="100" y2="${v}" stroke="${v % 20 ? "#E6EBF2" : "#C3CCDA"}" stroke-width="${v % 20 ? 0.4 : 0.7}"/>`);
    }
    if (q.tana !== false) {
      const eni = q.mini ? 11 : 9;
      for (const [a, b] of L.SUYAKLAR) {
        s.push(`<line x1="${p[a][0]}" y1="${p[a][1]}" x2="${p[b][0]}" y2="${p[b][1]}" stroke="#E4E8F0" stroke-width="${eni}" stroke-linecap="round"/>`);
      }
      s.push(`<circle cx="${p.bosh[0]}" cy="${p.bosh[1]}" r="${q.mini ? 11 : 9.5}" fill="#E4E8F0"/>`);
    }
    for (const y of q.chiziqlar || []) {
      s.push(`<line x1="2" y1="${y}" x2="98" y2="${y}" stroke="#8E5BD0" stroke-width="0.9" stroke-dasharray="3 2.5"/>`);
    }
    for (const [a, b] of L.SUYAKLAR) {
      if (!bor(a) || !bor(b)) continue;
      s.push(`<line x1="${p[a][0]}" y1="${p[a][1]}" x2="${p[b][0]}" y2="${p[b][1]}" stroke="${INK}" stroke-width="${q.mini ? 4 : 2.2}" stroke-linecap="round"/>`);
    }
    for (const n of L.NUQTALAR) {
      const xy = p[n.id];
      if (bor(n.id)) {
        s.push(`<circle cx="${xy[0]}" cy="${xy[1]}" r="${q.mini ? 4.2 : 3.2}" fill="${RANG[n.tomon]}" stroke="#FFFFFF" stroke-width="${q.mini ? 1 : 0.9}"/>`);
      } else if (q.belgi === n.id) {
        s.push(`<circle cx="${xy[0]}" cy="${xy[1]}" r="3.2" fill="#FFFFFF" stroke="${INK}" stroke-width="1.2"/>`);
      }
    }
    if (q.belgi && p[q.belgi]) {
      s.push(`<circle class="ah-halqa" cx="${p[q.belgi][0]}" cy="${p[q.belgi][1]}" r="7.5" fill="none" stroke="#8E5BD0" stroke-width="2.2"/>`);
    }
    s.push("</svg>");
    return s.join("");
  }

  root.QK = root.QK || {};
  root.QK.gameArt = { skelet, RANG };
})(window);
