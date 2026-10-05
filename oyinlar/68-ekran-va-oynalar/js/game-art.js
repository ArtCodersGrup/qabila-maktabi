// 68-o'yinga xos rasmlar (SVG, matnsiz — QOIDALAR §6): kirish rasmi va har dastur oynasining ichi.
// Dastur BELGILARI bu yerda emas — umumiy/js/stol-art.js da (QK.stolArt.icon).
// DOM bilan ishlamaydi, faqat SVG satr qaytaradi — Node'da ham yuklanadi (tests/logic.test.js).
(function (root) {
  "use strict";

  const Q = "#2B2B3A"; // qora chiziq

  // Kompyuter: ekranida ish stoli — belgilar, bitta oyna va panel. ok — oynada ✓ (tabrik ekrani uchun)
  const kompyuter = (ok) => `
<svg viewBox="0 0 220 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kompyuter: ekranida belgilar va oyna">
  <rect x="98" y="110" width="24" height="16" fill="#978B76" stroke="${Q}" stroke-width="3"/>
  <rect x="72" y="124" width="76" height="8" rx="4" fill="#978B76" stroke="${Q}" stroke-width="3"/>
  <rect x="22" y="6" width="176" height="108" rx="10" fill="${Q}"/>
  <rect x="30" y="14" width="160" height="92" rx="4" fill="#CFE6F5"/>
  <rect x="38" y="22" width="14" height="14" rx="3" fill="#F08A24"/>
  <rect x="38" y="42" width="14" height="14" rx="3" fill="#1A9E77"/>
  <rect x="38" y="62" width="14" height="14" rx="3" fill="#8E5BD0"/>
  <rect x="74" y="24" width="104" height="60" rx="4" fill="#FFFFFF" stroke="${Q}" stroke-width="2.5"/>
  <path d="M74 38v-10a4 4 0 0 1 4-4h96a4 4 0 0 1 4 4v10z" fill="#2F6FDE" stroke="${Q}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M82 31h26" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <g fill="#FFFFFF"><circle cx="150" cy="31" r="2.6"/><circle cx="160" cy="31" r="2.6"/><circle cx="170" cy="31" r="2.6"/></g>
  ${ok
    ? `<circle cx="126" cy="61" r="15" fill="#1A9E77" stroke="${Q}" stroke-width="2.5"/>
  <path d="M118 61l6 6 11-13" fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="M84 50h56M84 61h84M84 72h40" stroke="#C9D3E3" stroke-width="5" stroke-linecap="round"/>`}
  <path d="M30 94h160v8a4 4 0 0 1-4 4h-152a4 4 0 0 1-4-4z" fill="${Q}"/>
  <rect x="35" y="96.5" width="7" height="7" rx="1.5" fill="#F0C040"/>
  <rect x="48" y="96.5" width="16" height="7" rx="1.5" fill="#6C7A96"/>
  <rect x="44" y="140" width="92" height="16" rx="4" fill="#FFFFFF" stroke="${Q}" stroke-width="3"/>
  <path d="M52 146h76M52 151h76" stroke="#C9D3E3" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="5 4"/>
  <rect x="158" y="136" width="20" height="22" rx="10" fill="#FFFFFF" stroke="${Q}" stroke-width="3"/>
  <path d="M168 137v8" stroke="${Q}" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;

  // ---------- Oyna ichi: har dasturga mos oddiy rasm ----------
  const ichki = (shakllar) => `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${shakllar}</svg>`;

  // «Fayllar» ichidagi papka va varaq
  const papka = (x, y) => `<path d="M${x} ${y + 5}a3 3 0 0 1 3-3h9l4 4h15a3 3 0 0 1 3 3v15a3 3 0 0 1-3 3h-28a3 3 0 0 1-3-3z" fill="#F0C040" stroke="${Q}" stroke-width="2" stroke-linejoin="round"/>`;
  const varaq = (x, y, rang) => `<path d="M${x + 5} ${y}h14l7 7v20h-21z" fill="#FFFFFF" stroke="${Q}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M${x + 10} ${y + 13}h11M${x + 10} ${y + 20}h11" stroke="${rang}" stroke-width="3" stroke-linecap="round"/>`;

  // «Hisoblagich» tugmachalari: 4 × 4, oxirgi ustun — amallar (boshqa rangda)
  const tugmachalar = [0, 1, 2, 3].map((q) => [0, 1, 2, 3].map((u) =>
    `<rect x="${60 + u * 21}" y="${38 + q * 14}" width="17" height="10" rx="2.5" fill="${u === 3 ? "#F08A24" : Q}"/>`).join("")).join("");

  // Musiqa to'lqini ustunlari
  const ustunlar = [30, 52, 40, 60, 24].map((b, k) =>
    `<rect x="${100 + k * 17}" y="${74 - b}" width="11" height="${b}" rx="3" fill="${k % 2 ? "#2F6FDE" : "#8E5BD0"}"/>`).join("");

  const ICHI = {
    // Rasm chizish: chapda bo'yoqlar, o'ngda qog'oz — quyosh, tepalik va uycha
    rasm: ichki(`
  <rect x="6" y="6" width="28" height="88" rx="6" fill="#F7EFDF" stroke="${Q}" stroke-width="2"/>
  <circle cx="20" cy="20" r="7" fill="#2F6FDE"/><circle cx="20" cy="40" r="7" fill="#F08A24"/>
  <circle cx="20" cy="60" r="7" fill="#1A9E77"/><circle cx="20" cy="80" r="7" fill="#8E5BD0"/>
  <rect x="42" y="6" width="152" height="88" rx="4" fill="#FFFFFF"/>
  <circle cx="166" cy="28" r="11" fill="#F0C040" stroke="${Q}" stroke-width="2"/>
  <path d="M42 94V74q30-22 62 0q34-18 90 4v16z" fill="#1A9E77"/>
  <rect x="84" y="56" width="30" height="24" fill="#FFE9C7" stroke="${Q}" stroke-width="2"/>
  <path d="M80 58l19-16 19 16z" fill="#F08A24" stroke="${Q}" stroke-width="2" stroke-linejoin="round"/>
  <rect x="95" y="66" width="8" height="14" fill="#2F6FDE"/>
  <rect x="42" y="6" width="152" height="88" rx="4" fill="none" stroke="${Q}" stroke-width="2.5"/>`),
    // Matn yozish: varaq, sarlavha satri, satrlar va yozish chizig'i
    matn: ichki(`
  <rect x="38" y="5" width="124" height="90" rx="4" fill="#FFFFFF" stroke="${Q}" stroke-width="2.5"/>
  <path d="M52 22h60" stroke="#F08A24" stroke-width="6" stroke-linecap="round"/>
  <path d="M52 40h96M52 54h96M52 68h70" stroke="#2F6FDE" stroke-width="5" stroke-linecap="round"/>
  <rect x="129" y="60" width="3.5" height="16" rx="1.5" fill="${Q}"/>`),
    // Hisoblagich: ekrancha va tugmachalar
    hisob: ichki(`
  <rect x="52" y="4" width="96" height="92" rx="8" fill="#F0C040" stroke="${Q}" stroke-width="2.5"/>
  <rect x="60" y="11" width="80" height="20" rx="4" fill="#FFFFFF" stroke="${Q}" stroke-width="2"/>
  <path d="M112 21h20" stroke="${Q}" stroke-width="4" stroke-linecap="round"/>
  ${tugmachalar}`),
    // Musiqa: nota, tovush ustunlari va qo'shiq chizig'i
    musiqa: ichki(`
  <circle cx="52" cy="44" r="30" fill="#E7DBF7" stroke="${Q}" stroke-width="2.5"/>
  <path d="M47 56V32l18-5v22" fill="none" stroke="${Q}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>
  <ellipse cx="41.5" cy="56" rx="6" ry="4.6" fill="${Q}"/><ellipse cx="59.5" cy="49" rx="6" ry="4.6" fill="${Q}"/>
  ${ustunlar}
  <path d="M22 90h156" stroke="#CFC5B2" stroke-width="5" stroke-linecap="round"/>
  <path d="M22 90h64" stroke="#8E5BD0" stroke-width="5" stroke-linecap="round"/>
  <circle cx="86" cy="90" r="6.5" fill="#FFFFFF" stroke="${Q}" stroke-width="2.5"/>`),
    // Fayllar: yo'l satri, papkalar va varaqlar
    fayllar: ichki(`
  <rect x="8" y="5" width="184" height="14" rx="7" fill="#FFFFFF" stroke="${Q}" stroke-width="2"/>
  <path d="M18 12h46" stroke="#978B76" stroke-width="3" stroke-linecap="round"/>
  ${papka(14, 28)}${papka(62, 28)}${varaq(110, 27, "#2F6FDE")}${varaq(156, 27, "#1A9E77")}
  ${papka(14, 64)}${varaq(62, 63, "#8E5BD0")}${varaq(110, 63, "#F08A24")}`),
    // Internet: manzil satri, sahifadagi rasm (yer shari) va satrlar
    internet: ichki(`
  <rect x="8" y="5" width="184" height="16" rx="8" fill="#FFFFFF" stroke="${Q}" stroke-width="2"/>
  <circle cx="19" cy="13" r="4" fill="#1A9E77"/>
  <path d="M30 13h80" stroke="#978B76" stroke-width="3" stroke-linecap="round"/>
  <rect x="8" y="29" width="80" height="64" rx="5" fill="#D8E6FB" stroke="${Q}" stroke-width="2"/>
  <circle cx="48" cy="61" r="22" fill="#FFFFFF" stroke="#2F6FDE" stroke-width="2.5"/>
  <ellipse cx="48" cy="61" rx="10" ry="22" fill="none" stroke="#2F6FDE" stroke-width="2.5"/>
  <path d="M26 61h44M30 49h36M30 73h36" fill="none" stroke="#2F6FDE" stroke-width="2.5"/>
  <path d="M100 37h70" stroke="#F08A24" stroke-width="6" stroke-linecap="round"/>
  <path d="M100 53h90M100 67h90M100 81h56" stroke="#2F6FDE" stroke-width="5" stroke-linecap="round"/>`),
  };

  // Oyna ichi; noma'lum dastur — bo'sh satr
  const ichi = (dastur) => ICHI[dastur] || "";

  const api = { kompyuter, ichi };
  root.QK = root.QK || {};
  root.QK.gameArt = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
