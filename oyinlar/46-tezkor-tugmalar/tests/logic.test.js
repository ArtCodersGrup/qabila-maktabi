// 46-o'yin mantiqi: tugmalar birikmasini tanish va tekshirish.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
const each = (make, n, seed) => {
  const r = rngFrom(seed || 46);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};
const ev = (key, mod) => Object.assign({ key, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false }, mod);

test("belgi(): hodisadan tugmalar birikmasi", () => {
  assert.equal(L.belgi(ev("c", { ctrlKey: true })), "Ctrl + C");
  assert.equal(L.belgi(ev("C", { ctrlKey: true, shiftKey: true })), "Ctrl + Shift + C");
  assert.equal(L.belgi(ev("Tab")), "Tab");
  assert.equal(L.belgi(ev("Backspace")), "Backspace");
  assert.equal(L.belgi(ev("ArrowLeft", { shiftKey: true })), "Shift + ←");
  assert.equal(L.belgi(ev("ArrowLeft", { ctrlKey: true })), "Ctrl + ←");
  // Faqat turgich bosilsa — hali birikma to'liq emas
  assert.equal(L.belgi(ev("Control", { ctrlKey: true })), "Ctrl");
  assert.equal(L.belgi(ev("Shift", { shiftKey: true })), "Shift");
});

// Mac'da Ctrl o'rniga ⌘ bosiladi — ikkalasi ham qabul qilinishi kerak
test("Mac'dagi ⌘ (metaKey) Ctrl bilan bir xil hisoblanadi", () => {
  const copy = L.amalById("copy");
  assert.ok(L.mos(copy, ev("c", { ctrlKey: true })));
  assert.ok(L.mos(copy, ev("c", { metaKey: true })));
  assert.ok(L.mos(copy, ev("C", { metaKey: true })), "katta harf ham mos kelishi kerak");
  assert.ok(!L.mos(copy, ev("c")), "turgichsiz C — nusxa olish emas");
  assert.ok(!L.mos(copy, ev("v", { ctrlKey: true })));
});

test("amallar ro'yxati butun: id va nom takrorlanmaydi, har mavzuda amal bor", () => {
  const ids = L.AMALLAR.map((a) => a.id);
  assert.equal(new Set(ids).size, ids.length);
  const nomlar = L.AMALLAR.map((a) => a.nom);
  assert.equal(new Set(nomlar).size, nomlar.length, "nomlar takrorlansa, savol ikki xil to'g'ri javobli bo'lib qoladi");
  for (const mavzu of ["nusxa", "harakat", "tahrir"]) {
    assert.ok(L.AMALLAR.filter((a) => a.mavzu === mavzu).length >= 3, mavzu);
  }
  for (const a of L.AMALLAR) {
    assert.ok(a.kombo.length >= 1 && a.kombo.length <= 2, a.id);
    assert.ok(a.izoh.length > 15, a.id);
  }
});

test("tanish savoli: 4 ta variant, to'g'ri javob ichida va takrorsiz", () => {
  for (const t of each(L.tanishTask, 30, 3)) {
    assert.equal(t.variantlar.length, 4);
    const ids = t.variantlar.map((v) => v.id);
    assert.equal(new Set(ids).size, 4, "variantlar takrorlanmaydi");
    assert.ok(ids.includes(t.javob));
    assert.ok(t.matn.includes(L.yozuv(t.amal)));
  }
  // To'g'ri javob doim bitta joyda turmasligi kerak
  const joylar = new Set(each(L.tanishTask, 30, 9).map((t) => t.variantlar.findIndex((v) => v.id === t.javob)));
  assert.ok(joylar.size >= 3, "javob aralashtirilmayapti: " + [...joylar]);
});

test("bosish savoli: javob — tugmalar yozuvi, hodisa bilan tekshiriladi", () => {
  for (const t of each(L.bosishTask, 20, 5)) {
    assert.equal(t.javob, L.yozuv(t.amal));
    assert.ok(t.matn.includes(t.amal.nom));
  }
  // Ctrl + C savoliga Ctrl + C hodisasi mos keladi
  const copy = L.amalById("copy");
  assert.equal(L.belgi(ev("c", { ctrlKey: true })), L.yozuv(copy));
});

test("farq savoli: 4 xil variant, ichida adashtiradigan juftlik ham, javob ham bor", () => {
  for (const t of each(L.farqTask, 40, 7)) {
    assert.equal(t.variantlar.length, 4);
    assert.equal(new Set(t.variantlar.map((v) => v.id)).size, 4);
    assert.ok(t.variantlar.some((v) => v.id === t.javob), t.matn);
    const j = L.JUFTLAR.find((x) => x.savol === t.matn);
    assert.ok(t.variantlar.some((v) => v.id === j.a) && t.variantlar.some((v) => v.id === j.b), t.matn);
    assert.ok(t.nega.length > 15);
  }
  // to'g'ri javob har xil o'rinda chiqadi
  const orinlar = new Set(each(L.farqTask, 60, 9).map((t) => t.variantlar.findIndex((v) => v.id === t.javob)));
  assert.ok(orinlar.size >= 3);
});

test("farq savoli bosish rejimida: variant yo'q, kerakli birikmani o'zi bosadi", () => {
  let prev = null;
  for (let k = 0; k < 30; k++) {
    const t = L.farqTask(Math.random, prev, true);
    assert.equal(t.tur, "bosish");
    const j = L.JUFTLAR.find((x) => t.matn.startsWith(x.savol));
    assert.equal(t.javob, L.yozuv(L.amalById(j.javob)));
    prev = t;
  }
});

test("maqsad zinasi: tier 0 — oddiylar, tier 2 — ko'p tugmalilar", () => {
  for (let k = 0; k < 50; k++) {
    assert.ok(!L.maqsadTask(Math.random, null, 0).lvl);
    const m = L.maqsadTask(Math.random, null, 2);
    assert.ok(m.lvl >= 1, m.id);
  }
  // har maqsadni haqiqatan bajarib bo'ladi: kerakli tugmalar bilan natija qabul qilinadi
  for (const m of L.MAQSADLAR) {
    const kerak = m.kerak.map((id) => L.yozuv(L.amalById(id)));
    assert.ok(L.bajarildi(m, m.maqsad, kerak), m.id);
  }
});

// 3-bosqichda bola matn ham teradi — faqat tezkor tugmalar yozib borilishi kerak
test("qaydEtiladi(): oddiy harf yozilmaydi, nomli tugma va birikmalar yoziladi", () => {
  for (const b of ["a", "A", "5", " "]) assert.equal(L.qaydEtiladi(b), false, b);
  for (const b of ["Home", "End", "Tab", "Enter", "Backspace", "Delete", "Ctrl + C", "Shift + ←", "Ctrl + ←"]) {
    assert.equal(L.qaydEtiladi(b), true, b);
  }
  // Har maqsadning kerakli tugmalari ham yoziladigan bo'lishi shart (aks holda hech qachon qabul qilinmaydi)
  for (const m of L.MAQSADLAR) {
    for (const id of m.kerak) assert.ok(L.qaydEtiladi(L.yozuv(L.amalById(id))), m.id + ": " + id);
  }
});

test("maqsad: natija ham, ishlatilgan tugmalar ham tekshiriladi", () => {
  const m = L.MAQSADLAR.find((x) => x.id === "ikki-marta");
  const kerak = m.kerak.map((id) => L.yozuv(L.amalById(id)));
  assert.ok(L.bajarildi(m, "qabila qabila", kerak), "to'g'ri natija + kerakli tugmalar");
  assert.ok(!L.bajarildi(m, "qabila qabila", []), "qo'lda terilgan — tezkor tugma ishlatilmagan");
  assert.ok(!L.bajarildi(m, "qabila", kerak), "natija noto'g'ri");
  // Oxiridagi bo'sh joy va bo'sh qator hisobga olinmaydi
  assert.ok(L.bajarildi(m, "qabila qabila   \n", kerak));
  assert.deepEqual(L.yetishmaydi(m, ["Ctrl + C"]).map((a) => a.id), ["paste"]);
});

test("har maqsadda boshlang'ich va natija har xil, ishora kerakli tugmani aytadi", () => {
  for (const m of L.MAQSADLAR) {
    assert.ok(m.kerak.length >= 1);
    for (const id of m.kerak) assert.ok(L.AMALLAR.some((a) => a.id === id), m.id + ": " + id);
    assert.ok(m.vazifa.length > 20 && m.ishora.length > 20, m.id);
    // "qaytar" maqsadida natija boshlang'ichga teng — bu ataylab (Ctrl+Z ni o'rgatadi)
    if (m.id !== "qaytar") assert.notEqual(L.tozala(m.maqsad), L.tozala(m.boshlangich), m.id);
    for (const id of m.kerak) assert.ok(m.ishora.includes(L.yozuv(L.amalById(id))) || m.ishora.includes(L.amalById(id).kombo[0]), m.id + ": ishorada " + id + " yo'q");
  }
});

// Ba'zi qurilmada brauzer nusxa olishni bloklashi mumkin — bola qolib ketmasligi uchun
// bufersiz bajariladigan maqsadlar ham bo'lishi kerak
test("maqsadlar orasida nusxa olishsiz bajariladigani ham bor", () => {
  const bufer = ["copy", "paste", "cut"];
  const bufersiz = L.MAQSADLAR.filter((m) => !m.kerak.some((id) => bufer.includes(id)));
  assert.ok(bufersiz.length >= 3, "bufersiz maqsadlar: " + bufersiz.length);
  assert.ok(L.MAQSADLAR.some((m) => m.kerak.some((id) => bufer.includes(id))), "nusxa olish mashqi ham bo'lishi kerak");
});

test("ketma-ket savollar takrorlanmaydi", () => {
  for (const make of [L.tanishTask, L.bosishTask, L.farqTask, L.maqsadTask]) {
    const list = each(make, 10, 23);
    for (let k = 1; k < list.length; k++) assert.notEqual(list[k].id, list[k - 1].id);
  }
});

test("ko'rinadigan matnlarda to'g'ri tutuq belgisi", () => {
  const matnlar = [];
  for (const a of L.AMALLAR) matnlar.push(a.nom, a.izoh);
  for (const j of L.JUFTLAR) matnlar.push(j.savol);
  for (const m of L.MAQSADLAR) matnlar.push(m.vazifa, m.ishora, m.boshlangich, m.maqsad);
  for (const m of matnlar) assert.ok(!/['’`´]/.test(m), "notoʻgʻri belgi: " + m);
});
