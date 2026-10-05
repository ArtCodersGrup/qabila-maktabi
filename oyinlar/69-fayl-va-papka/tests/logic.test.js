// 69-o'yin: fayl va papka — daraxt amallari, yo'l, maqsad tekshiruvlari va mashq generatorlari.
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
// make(r, prev, tier) dan ketma-ket vazifalar
function each(make, count, tier, seed) {
  const r = rngFrom(seed || 69);
  const out = [];
  let prev = null;
  for (let k = 0; k < count; k++) {
    prev = make(r, prev, tier);
    out.push(prev);
  }
  return out;
}

// Holatni muzlatish: amal berilgan holatga yozsa (o'zgarmas uslub buzilsa) — strict rejimda xato chiqadi
function muz(x) {
  if (x && typeof x === "object" && !Object.isFrozen(x)) {
    Object.freeze(x);
    Object.values(x).forEach(muz);
  }
  return x;
}

// Kompyuter: Rasmlar (olma.jpg, gul.jpg), Hujjatlar (Matnlar (xat.txt)), kuy.mp3
const namuna = () => muz(L.holatYasa([L.P("Rasmlar", "olma.jpg", "gul.jpg"), L.P("Hujjatlar", L.P("Matnlar", "xat.txt")), "kuy.mp3"]));
const id = (h, nom) => L.nomBilan(h, nom).id;
const nomlari = (h, papkaNomi) => L.nomBilan(h, papkaNomi).ichi.map((t) => t.nom);

// Bitta papkada bir xil nom ikki marta bo'lmasin (savat bundan mustasno — u papka emas)
function takrorsiz(h, izoh) {
  for (const p of L.hammasi(h).filter((t) => t.tur === "papka")) {
    const nomlar = p.ichi.map((t) => t.nom);
    assert.equal(new Set(nomlar).size, nomlar.length, `${izoh}: «${p.nom}» ichida takror nom`);
  }
}

test("holat: id lar tartib bilan, fayl turi nom oxiridan, boshida ildizda turamiz", () => {
  const h = namuna();
  assert.equal(h.ildiz.nom, "Kompyuter");
  assert.equal(h.joriy, L.ILDIZ);
  assert.deepEqual([h.tanlangan, h.bufer, h.savat], [null, null, []]);
  assert.deepEqual(L.hammasi(h).map((t) => t.id), ["ildiz", "t1", "t2", "t3", "t4", "t5", "t6", "t7"]);
  assert.equal(L.nomBilan(h, "olma.jpg").tur, "rasm");
  assert.equal(L.nomBilan(h, "xat.txt").tur, "matn");
  assert.equal(L.nomBilan(h, "kuy.mp3").tur, "musiqa");
  assert.equal(L.nomBilan(h, "Rasmlar").tur, "papka");
  assert.equal(L.turi("multfilm.mp4"), "video");
  assert.equal(L.turi("Rasmlar"), null);
  assert.throws(() => L.holatYasa(["oʻyin.exe"]), /fayl turi/);
  // Ko'rinish tartibi: avval papkalar, keyin fayllar
  assert.deepEqual(L.korinadi(L.holatYasa(["a.txt", L.P("Rasmlar"), "olma.jpg", L.P("Musiqa")])).map((t) => t.nom), ["Rasmlar", "Musiqa", "a.txt", "olma.jpg"]);
});

test("kir va orqaga: papkaga kiradi, faylga kirmaydi, ildizdan orqaga yo'q", () => {
  const h = namuna();
  const a = L.kir(h, id(h, "Hujjatlar"));
  assert.equal(a.joriy, id(h, "Hujjatlar"));
  const b = L.kir(a, id(h, "Matnlar"));
  assert.equal(b.joriy, id(h, "Matnlar"));
  assert.equal(L.orqaga(b).joriy, id(h, "Hujjatlar"));
  assert.equal(L.orqaga(L.orqaga(b)).joriy, L.ILDIZ);
  assert.equal(L.orqaga(h), h, "ildizda orqaga — hech narsa");
  assert.equal(L.kir(h, id(h, "kuy.mp3")), h, "faylga kirib bo'lmaydi");
  assert.equal(L.kir(h, "yoq"), h);
  // Papka almashganda tanlov tozalanadi
  assert.equal(L.kir(L.tanla(h, id(h, "kuy.mp3")), id(h, "Rasmlar")).tanlangan, null);
});

test("tanla: faqat joriy papkadagi narsa", () => {
  const h = namuna();
  assert.equal(L.tanla(h, id(h, "kuy.mp3")).tanlangan, id(h, "kuy.mp3"));
  assert.equal(L.tanla(h, id(h, "olma.jpg")), h, "boshqa papkadagi fayl tanlanmaydi");
  const t = L.tanla(h, id(h, "Rasmlar"));
  assert.equal(L.tanla(t, null).tanlangan, null);
  assert.equal(L.tanla(h, null), h);
});

test("yo'l, qayerda va chuqurlik", () => {
  const h = namuna();
  assert.deepEqual(L.yol(h, L.ILDIZ), ["Kompyuter"]);
  assert.deepEqual(L.yol(h, id(h, "Matnlar")), ["Kompyuter", "Hujjatlar", "Matnlar"]);
  assert.equal(L.yolMatn(h, id(h, "Matnlar")), "Kompyuter › Hujjatlar › Matnlar");
  assert.equal(L.yolMatn(h, id(h, "xat.txt")), "Kompyuter › Hujjatlar › Matnlar › xat.txt");
  assert.deepEqual(L.yol(h, "yoq"), []);
  assert.deepEqual(L.papkaYoli(h, id(h, "xat.txt")), [id(h, "Hujjatlar"), id(h, "Matnlar")]);
  assert.deepEqual(L.papkaYoli(h, id(h, "kuy.mp3")), []);
  assert.equal(L.qayerda(h, id(h, "olma.jpg")), id(h, "Rasmlar"));
  assert.equal(L.qayerda(h, id(h, "kuy.mp3")), L.ILDIZ);
  assert.equal(L.qayerda(h, L.ILDIZ), null);
  assert.equal(L.qayerda(h, "yoq"), null);
  assert.deepEqual(["kuy.mp3", "olma.jpg", "xat.txt"].map((n) => L.chuqurlik(h, id(h, n))), [0, 1, 2]);
});

test("yangi papka: joriy papkada paydo bo'ladi, tanlanadi; nom band bo'lsa — (2)", () => {
  const h = namuna();
  const a = L.yangiPapka(h, "Musiqa");
  const yangi = L.nomBilan(a, "Musiqa");
  assert.equal(yangi.tur, "papka");
  assert.equal(L.qayerda(a, yangi.id), L.ILDIZ);
  assert.equal(a.tanlangan, yangi.id);
  const b = L.yangiPapka(a, "Musiqa");
  assert.deepEqual(b.ildiz.ichi.map((t) => t.nom), ["Rasmlar", "Hujjatlar", "kuy.mp3", "Musiqa", "Musiqa (2)"]);
  assert.notEqual(L.nomBilan(b, "Musiqa (2)").id, yangi.id);
  // Ichkaridagi papkada yaratish
  const c = L.yangiPapka(L.kir(h, id(h, "Hujjatlar")), "Rasmlar");
  assert.deepEqual(nomlari(c, "Hujjatlar"), ["Matnlar", "Rasmlar"]);
  assert.equal(L.yangiPapka(h, ""), h);
});

test("nomla: nom o'zgaradi; yonida shu nom bo'lsa — o'zgarmaydi", () => {
  const h = namuna();
  const a = L.nomla(L.tanla(h, id(h, "Hujjatlar")), "Maktab");
  assert.equal(L.top(a, id(h, "Hujjatlar")).nom, "Maktab");
  assert.deepEqual(L.yol(a, id(h, "xat.txt")), ["Kompyuter", "Maktab", "Matnlar", "xat.txt"]);
  assert.equal(L.nomla(h, "Maktab", id(h, "Matnlar")).ildiz.ichi[1].ichi[0].nom, "Maktab", "id bilan ham ishlaydi");
  const t = L.tanla(h, id(h, "Hujjatlar"));
  assert.equal(L.nomla(t, "Rasmlar"), t, "bu nom band");
  assert.equal(L.nomla(t, "Hujjatlar"), t, "o'sha nomning o'zi");
  assert.equal(L.nomla(h, "Maktab"), h, "hech narsa tanlanmagan");
  assert.equal(L.nomla(h, "Uy", L.ILDIZ), h, "ildiz nomlanmaydi");
});

test("kesish + qo'yish: fayl bitta qoladi va yangi joyda", () => {
  const h = namuna();
  const kuy = id(h, "kuy.mp3");
  const kesilgan = L.kes(L.tanla(h, kuy));
  assert.deepEqual(kesilgan.bufer, { id: kuy, amal: "kesish" });
  assert.equal(L.qayerda(kesilgan, kuy), L.ILDIZ, "qo'yilguncha joyida turadi");
  const y = L.qoy(L.kir(kesilgan, id(h, "Rasmlar")));
  assert.equal(L.qayerda(y, kuy), id(h, "Rasmlar"));
  assert.deepEqual(nomlari(y, "Rasmlar"), ["olma.jpg", "gul.jpg", "kuy.mp3"]);
  assert.deepEqual(y.ildiz.ichi.map((t) => t.nom), ["Rasmlar", "Hujjatlar"]);
  assert.equal(L.hammasi(y).filter((t) => t.nom === "kuy.mp3").length, 1, "bitta qoldi");
  assert.equal(L.hammasi(y).length, L.hammasi(h).length);
  assert.equal(y.bufer, null, "kesilgan narsa bir marta qo'yiladi");
  assert.equal(y.tanlangan, kuy);
  assert.equal(L.qoy(y), y);
  // O'z papkasiga qo'yilsa — joyida qoladi, nomi o'zgarmaydi
  const joyida = L.qoy(kesilgan);
  assert.deepEqual(joyida.ildiz.ichi.map((t) => t.nom), ["Rasmlar", "Hujjatlar", "kuy.mp3"]);
  assert.equal(joyida.bufer, null);
  // Papka ham ko'chadi — ichidagilari bilan
  const p = L.qoy(L.kir(L.kes(h, id(h, "Rasmlar")), id(h, "Hujjatlar")));
  assert.equal(L.yolMatn(p, id(h, "olma.jpg")), "Kompyuter › Hujjatlar › Rasmlar › olma.jpg");
});

test("nusxa + qo'yish: ikkita bo'ladi; nom to'qnashsa — (2), (3)", () => {
  const h = namuna();
  const olma = id(h, "olma.jpg");
  const b = L.nusxa(L.tanla(L.kir(h, id(h, "Rasmlar")), olma));
  assert.deepEqual(b.bufer, { id: olma, amal: "nusxa" });
  // Boshqa papkaga: nomi o'zgarmaydi, asli joyida
  const y = L.qoy(L.kir(b, id(h, "Hujjatlar")));
  const nus = y.ildiz.ichi[1].ichi[1];
  assert.equal(nus.nom, "olma.jpg");
  assert.equal(nus.tur, "rasm");
  assert.notEqual(nus.id, olma);
  assert.equal(nus.asl, olma);
  assert.ok(L.oila(nus, olma) && L.oila(L.top(y, olma), olma) && !L.oila(L.nomBilan(y, "gul.jpg"), olma));
  assert.equal(L.qayerda(y, olma), id(h, "Rasmlar"), "asli joyida qoldi");
  assert.equal(L.hammasi(y).filter((t) => t.nom === "olma.jpg").length, 2, "ikkita bo'ldi");
  assert.equal(y.tanlangan, nus.id);
  assert.deepEqual(y.bufer, { id: olma, amal: "nusxa" }, "nusxani yana qo'yish mumkin");
  // O'sha papkaning o'ziga: (2), keyin (3) — kengaytma oxirida qoladi
  const ikki = L.qoy(b);
  assert.deepEqual(nomlari(ikki, "Rasmlar"), ["olma.jpg", "gul.jpg", "olma (2).jpg"]);
  const uch = L.qoy(ikki);
  assert.deepEqual(nomlari(uch, "Rasmlar"), ["olma.jpg", "gul.jpg", "olma (2).jpg", "olma (3).jpg"]);
  assert.equal(new Set(L.hammasi(uch).map((t) => t.id)).size, L.hammasi(uch).length, "id lar takrorlanmaydi");
  // Nusxaning nusxasi ham asl faylga bog'lanadi
  const nn = L.qoy(L.nusxa(ikki, L.nomBilan(ikki, "olma (2).jpg").id));
  assert.equal(L.nomBilan(nn, "olma (3).jpg").asl, olma);
  // Papka nusxasi: ichidagilari ham yangi id bilan ko'chiriladi
  const pp = L.qoy(L.nusxa(h, id(h, "Rasmlar")));
  const nusPapka = L.nomBilan(pp, "Rasmlar (2)");
  assert.deepEqual(nusPapka.ichi.map((t) => t.nom), ["olma.jpg", "gul.jpg"]);
  assert.ok(nusPapka.ichi.every((t) => t.id !== olma && t.id !== id(h, "gul.jpg")));
  takrorsiz(pp, "papka nusxasi");
});

test("qo'yish: bo'sh buferda hech narsa qilmaydi; papkani o'z ichiga qo'yib bo'lmaydi", () => {
  const h = namuna();
  assert.equal(L.qoyMumkin(h), false);
  assert.equal(L.qoy(h), h, "bufer bo'sh — o'sha holatning o'zi");
  const hujjat = id(h, "Hujjatlar");
  for (const ol of [L.kes, L.nusxa]) {
    const b = ol(L.tanla(h, hujjat));
    const ichida = L.kir(b, hujjat);
    assert.equal(L.qoyMumkin(ichida), false);
    assert.equal(L.qoy(ichida), ichida, "o'zining ichiga");
    const chuqur = L.kir(ichida, id(h, "Matnlar"));
    assert.equal(L.qoy(chuqur), chuqur, "ichidagi papkaning ichiga");
    assert.equal(L.qoyMumkin(L.kir(b, id(h, "Rasmlar"))), true, "boshqa papkaga — mumkin");
  }
  assert.equal(L.kes(h), h, "tanlanmagan narsa kesilmaydi");
  assert.equal(L.nusxa(h, L.ILDIZ), h, "ildizdan nusxa olinmaydi");
});

test("o'chirish → savatda; qaytarish → asl papkasida", () => {
  const h = namuna();
  const olma = id(h, "olma.jpg");
  const rasmlar = id(h, "Rasmlar");
  const o = L.ochir(L.tanla(L.kir(h, rasmlar), olma));
  assert.equal(L.top(o, olma), null);
  assert.equal(L.qayerda(o, olma), "savat");
  assert.deepEqual(o.savat.map((s) => [s.tugun.nom, s.ota]), [["olma.jpg", rasmlar]]);
  assert.equal(o.tanlangan, null);
  assert.deepEqual(nomlari(o, "Rasmlar"), ["gul.jpg"]);
  // Qaytarish: qayerdan o'chirilgan bo'lsa — o'sha papkaga (hozir qaysi papkada turishimizdan qat'i nazar)
  const q = L.tikla(L.orqaga(o), olma);
  assert.equal(L.qayerda(q, olma), rasmlar);
  assert.deepEqual(q.savat, []);
  assert.deepEqual(nomlari(q, "Rasmlar"), ["gul.jpg", "olma.jpg"]);
  assert.equal(L.tikla(q, olma), q, "savatda yo'q narsa qaytmaydi");
  assert.equal(L.ochir(h), h, "tanlanmagan narsa o'chirilmaydi");
  assert.equal(L.ochir(h, L.ILDIZ), h, "ildiz o'chirilmaydi");
});

test("o'chirish va savat: chekka holatlar", () => {
  const h = namuna();
  const hujjat = id(h, "Hujjatlar");
  const xat = id(h, "xat.txt");
  // Papka ichidagilari bilan savatga tushadi
  const o = L.ochir(h, hujjat);
  assert.equal(L.qayerda(o, xat), "savat");
  assert.equal(L.qayerda(o, id(h, "Matnlar")), "savat");
  assert.equal(L.tikla(o, xat), o, "savatdagi papkaning ichidan bittasini qaytarib bo'lmaydi");
  assert.equal(L.yolMatn(L.tikla(o, hujjat), xat), "Kompyuter › Hujjatlar › Matnlar › xat.txt");
  // Buferdagi narsa o'chirilsa — bufer bo'shaydi
  assert.equal(L.ochir(L.nusxa(h, xat), hujjat).bufer, null);
  assert.deepEqual(L.ochir(L.nusxa(h, xat), id(h, "kuy.mp3")).bufer, { id: xat, amal: "nusxa" });
  // Ichida turgan papkamiz o'chirilsa — tashqariga chiqamiz
  assert.equal(L.ochir(L.kir(h, id(h, "Matnlar")), hujjat).joriy, L.ILDIZ);
  // Asl papkasi ham o'chirilgan bo'lsa — fayl «Kompyuter»ga qaytadi
  const ikkisi = L.ochir(L.ochir(h, xat), hujjat);
  assert.equal(L.qayerda(L.tikla(ikkisi, xat), xat), L.ILDIZ);
  // Qaytganda nom band bo'lsa — (2)
  const band = L.qoy(L.kir(L.kes(L.ochir(h, id(h, "olma.jpg")), id(h, "kuy.mp3")), id(h, "Rasmlar")));
  const yangi = L.qoy(L.nusxa(band, id(h, "gul.jpg")));
  assert.deepEqual(nomlari(L.tikla(L.nomla(yangi, "olma.jpg", L.nomBilan(yangi, "gul (2).jpg").id), id(h, "olma.jpg")), "Rasmlar"),
    ["gul.jpg", "kuy.mp3", "olma.jpg", "olma (2).jpg"]);
});

test("o'zgarmas uslub: amallar berilgan holatga tegmaydi", () => {
  const h = namuna(); // muzlatilgan — yozishga urinish xato beradi
  const surat = JSON.stringify(h);
  const kuy = id(h, "kuy.mp3");
  const rasmlar = id(h, "Rasmlar");
  let y = L.tanla(h, kuy);
  for (const amal of [(x) => L.kes(x), (x) => L.kir(x, rasmlar), (x) => L.qoy(x), (x) => L.nusxa(x), (x) => L.qoy(x),
    (x) => L.yangiPapka(x, "Eski"), (x) => L.nomla(x, "Yangi"), (x) => L.ochir(x), (x) => L.orqaga(x),
    (x) => L.ochir(x, rasmlar), (x) => L.tikla(x, rasmlar), (x) => L.tikla(x, x.savat[0].tugun.id)]) {
    const oldingi = JSON.stringify(y);
    const keyingi = amal(muz(y));
    assert.equal(JSON.stringify(y), oldingi);
    assert.notEqual(keyingi, y, "har qadam yangi holat beradi");
    y = keyingi;
  }
  assert.equal(JSON.stringify(h), surat);
  assert.deepEqual(y.savat, []);
  takrorsiz(y, "amallar zanjiri");
});

test("bajar: qadamlar ketma-ketligi; nomi — joriy papkadagi nom bo'yicha", () => {
  const h = namuna();
  const y = L.bajar(h, [
    { amal: "yangiPapka", nom: "Musiqa" }, { amal: "tanla", nomi: "kuy.mp3" }, { amal: "kes" },
    { amal: "kir", nomi: "Musiqa" }, { amal: "qoy" }, { amal: "orqaga" },
    { amal: "tanla", nomi: "Hujjatlar" }, { amal: "nomla", nom: "Maktab" },
  ]);
  assert.equal(L.yolMatn(y, id(h, "kuy.mp3")), "Kompyuter › Musiqa › kuy.mp3");
  assert.equal(L.top(y, id(h, "Hujjatlar")).nom, "Maktab");
  assert.equal(y.joriy, L.ILDIZ);
  assert.throws(() => L.bajar(h, [{ amal: "uch" }]), /amal/);
});

test("nom chiplari: joriy papkada band bo'lmagan tayyor nomlar", () => {
  const h = namuna();
  assert.deepEqual(L.nomTakliflari(h), ["Matnlar", "Musiqa", "Videolar", "Oʻyinlar", "Har xil"]);
  assert.deepEqual(L.nomTakliflari(L.kir(h, id(h, "Hujjatlar"))), ["Rasmlar", "Musiqa", "Videolar", "Oʻyinlar", "Har xil"]);
  for (const tur of L.TURLAR) assert.ok(L.PAPKA_TAKLIF.includes(L.PAPKA_NOMI[tur]), tur);
});

// ---------- Maqsad tekshiruvlari ----------
test("tartibla tekshiruvi: har fayl o'z turidagi papkada; yo'qolgan fayl ham sanaladi", () => {
  const h = L.holatYasa([L.P("Rasmlar"), L.P("Videolar", "kuy.mp3"), "olma.jpg", "alla.mp3"]);
  const task = { tur: "tartibla", fayllar: L.fayllari(h).map((f) => f.id) };
  assert.deepEqual(L.maqsad(h, task), { ok: false, qolgan: 3 });
  const kochir = (x, nom, papka) => L.bajar(x, [{ amal: "tanla", nomi: nom }, { amal: "kes" }, { amal: "kir", nomi: papka }, { amal: "qoy" }, { amal: "orqaga" }]);
  const a = kochir(h, "olma.jpg", "Rasmlar");
  assert.deepEqual(L.maqsad(a, task), { ok: false, qolgan: 2 });
  // Noto'g'ri papkaga ko'chirish yordam bermaydi
  assert.equal(L.maqsad(kochir(a, "alla.mp3", "Rasmlar"), task).qolgan, 2);
  // Papka nomi to'g'rilanmaguncha ichidagi fayl ham joyida emas
  const b = kochir(a, "alla.mp3", "Videolar");
  assert.deepEqual(L.maqsad(b, task), { ok: false, qolgan: 2 });
  const c = L.nomla(b, "Musiqa", id(h, "Videolar"));
  assert.deepEqual(L.maqsad(c, task), { ok: true, qolgan: 0 });
  // Yangi papka yaratib ko'chirish ham to'g'ri
  const d = L.bajar(a, [{ amal: "yangiPapka", nom: "Musiqa" }, { amal: "tanla", nomi: "alla.mp3" }, { amal: "kes" }, { amal: "kir", nomi: "Musiqa" }, { amal: "qoy" },
    { amal: "orqaga" }, { amal: "kir", nomi: "Videolar" }, { amal: "tanla", nomi: "kuy.mp3" }, { amal: "kes" }, { amal: "orqaga" }, { amal: "kir", nomi: "Musiqa" }, { amal: "qoy" }]);
  assert.equal(L.maqsad(d, task).ok, true);
  // Hech narsa yo'qolmasin: savatdagi fayl joyida emas
  assert.deepEqual(L.maqsad(L.ochir(c, id(h, "olma.jpg")), task), { ok: false, qolgan: 1 });
  assert.match(L.maslahat(task, { qolgan: 2 }), /^2 ta fayl hali oʻz joyida emas/);
});

test("nusxa tekshiruvi: asli joyida VA nusxasi nishon papkada", () => {
  const h = L.holatYasa([L.P("Matnlar", "xat.txt", "reja.txt"), L.P("Zaxira")]);
  const xat = id(h, "xat.txt");
  const task = { tur: "nusxa", fayl: xat, asliJoy: id(h, "Matnlar"), nishon: id(h, "Zaxira") };
  assert.deepEqual(L.maqsad(h, task), { ok: false, qolgan: 1 });
  const borib = (amal) => L.bajar(h, [{ amal: "kir", nomi: "Matnlar" }, { amal: "tanla", id: xat }, { amal }, { amal: "orqaga" }, { amal: "kir", nomi: "Zaxira" }, { amal: "qoy" }]);
  assert.deepEqual(L.maqsad(borib("nusxa"), task), { ok: true, qolgan: 0 });
  // Kesib ko'chirilsa — fayl bitta: asl joyi bo'sh
  const kesilgan = borib("kes");
  assert.deepEqual(L.maqsad(kesilgan, task), { ok: false, qolgan: 1 });
  // Bola davom ettirib tuzatadi: nusxasini asl joyiga qaytaradi — ikkita bo'ldi
  const tuzatilgan = L.bajar(kesilgan, [{ amal: "tanla", id: xat }, { amal: "nusxa" }, { amal: "orqaga" }, { amal: "kir", nomi: "Matnlar" }, { amal: "qoy" }]);
  assert.deepEqual(L.maqsad(tuzatilgan, task), { ok: true, qolgan: 0 });
  // Boshqa fayldan nusxa — hisobga o'tmaydi; nusxa o'z papkasida qolsa ham
  const boshqa = L.bajar(h, [{ amal: "kir", nomi: "Matnlar" }, { amal: "tanla", nomi: "reja.txt" }, { amal: "nusxa" }, { amal: "orqaga" }, { amal: "kir", nomi: "Zaxira" }, { amal: "qoy" }]);
  assert.equal(L.maqsad(boshqa, task).ok, false);
  assert.equal(L.maqsad(L.qoy(L.nusxa(L.kir(h, id(h, "Matnlar")), xat)), task).ok, false);
  // Asli o'chirilsa — ikkalasi ham joyida emas
  assert.deepEqual(L.maqsad(L.ochir(h, xat), task), { ok: false, qolgan: 2 });
});

test("o'chirish tekshiruvi: aynan aytilgan fayllar savatda, boshqasi emas", () => {
  const h = L.holatYasa([L.P("Rasmlar", "olma.jpg", "gul.jpg"), "xat.txt", "kuy.mp3"]);
  const task = { tur: "ochir", fayllar: [id(h, "gul.jpg"), id(h, "xat.txt")] };
  assert.deepEqual(L.maqsad(h, task), { ok: false, qolgan: 2 });
  const bitta = L.ochir(h, id(h, "xat.txt"));
  assert.deepEqual(L.maqsad(bitta, task), { ok: false, qolgan: 1 });
  const ikkisi = L.ochir(bitta, id(h, "gul.jpg"));
  assert.deepEqual(L.maqsad(ikkisi, task), { ok: true, qolgan: 0 });
  // Ortiqcha o'chirilgan fayl — joyida emas; qaytarilsa — yana to'g'ri
  const ortiqcha = L.ochir(ikkisi, id(h, "kuy.mp3"));
  assert.deepEqual(L.maqsad(ortiqcha, task), { ok: false, qolgan: 1 });
  assert.equal(L.maqsad(L.tikla(ortiqcha, id(h, "kuy.mp3")), task).ok, true);
  // Papkani butunlay o'chirish: papka va ichidagi kerakli fayl ortiqcha ketdi
  assert.deepEqual(L.maqsad(L.ochir(bitta, id(h, "Rasmlar")), task), { ok: false, qolgan: 2 });
  // Nusxasi qolgan bo'lsa — fayl hali bor
  const nusxali = L.ochir(L.ochir(L.qoy(L.nusxa(h, id(h, "xat.txt"))), id(h, "xat.txt")), id(h, "gul.jpg"));
  assert.deepEqual(L.maqsad(nusxali, task), { ok: false, qolgan: 1 });
  assert.equal(L.maqsad(L.ochir(nusxali, L.nomBilan(nusxali, "xat (2).txt").id), task).ok, true);
});

test("qaytarish tekshiruvi: fayl asl joyida, qolgani savatda", () => {
  const asl = L.holatYasa([L.P("Rasmlar", "olma.jpg", "gul.jpg"), "xat.txt"]);
  const olma = id(asl, "olma.jpg");
  const xat = id(asl, "xat.txt");
  const h = L.ochir(L.ochir(asl, olma), xat);
  const task = { tur: "tikla", fayllar: [olma], joylar: { [olma]: id(asl, "Rasmlar") }, qolsin: [xat] };
  assert.deepEqual(L.maqsad(h, task), { ok: false, qolgan: 1 });
  const q = L.tikla(h, olma);
  assert.deepEqual(L.maqsad(q, task), { ok: true, qolgan: 0 });
  // "Faqat" — ortiqchasi ham qaytarilsa, joyida emas; qayta o'chirilsa — to'g'ri
  const hammasi = L.tikla(q, xat);
  assert.deepEqual(L.maqsad(hammasi, task), { ok: false, qolgan: 1 });
  assert.equal(L.maqsad(L.ochir(hammasi, xat), task).ok, true);
  // Boshqasi qaytarildi, keraklisi savatda qoldi
  assert.deepEqual(L.maqsad(L.tikla(h, xat), task), { ok: false, qolgan: 2 });
  // Qaytarilgach boshqa papkaga ko'chirib yuborilsa — asl joyida emas
  const kochgan = L.qoy(L.kes(q, olma));
  assert.deepEqual(L.maqsad(kochgan, task), { ok: false, qolgan: 1 });
  for (const tur of ["nusxa", "ochir", "tikla"]) assert.match(L.maslahat({ tur }, { qolgan: 1 }), /^1 ta narsa hali joyida emas\. /);
});

// ---------- Generatorlar ----------
const TIERLAR = [0, 1, 2];
const SONI = 250;

// Ekranga chiqadigan matn: to'g'ri belgilar (oʻ, gʻ, ʼ), "xato" so'zi yo'q, ko'pi bilan ikki gap
function matnToza(matn, izoh) {
  assert.ok(matn && typeof matn === "string", izoh);
  assert.ok(!/['`‘’]/.test(matn), `${izoh}: notoʻgʻri tutuq belgisi — ${matn}`);
  assert.ok(!/xato/i.test(matn), `${izoh}: ${matn}`);
  assert.ok(!matn.includes("undefined") && !matn.includes("null"), `${izoh}: ${matn}`);
}

test("nomlar banki: har turda yetarli, takrorsiz, qisqa va to'g'ri belgilar bilan", () => {
  const barcha = [];
  for (const tur of L.TURLAR) {
    assert.ok(L.NOMLAR[tur].length >= 10, tur);
    for (const nom of L.NOMLAR[tur]) {
      assert.ok(nom.length <= 9, nom);
      matnToza(nom, tur);
      assert.equal(L.turi(nom + L.KENGAYTMA[tur]), tur);
      barcha.push(nom);
    }
  }
  assert.equal(new Set(barcha).size, barcha.length, "so'z ikki turda takrorlanmaydi");
  assert.deepEqual(Object.values(L.KENGAYTMA), [".jpg", ".txt", ".mp3", ".mp4"]);
  for (const x of L.CHALGITUVCHI) assert.equal(L.turi(x.nom), x.tur, x.nom);
  for (const tur of L.TURLAR) assert.ok(L.CHALGITUVCHI.filter((x) => x.tur === tur).length >= 2, tur);
});

test("top: chuqurlik 1 / 2 / 3, nishon fayl mavjud va yagona, papkalar unga olib boradi", () => {
  for (const tier of TIERLAR) {
    for (const t of each(L.topTask, SONI, tier)) {
      const f = L.top(t.holat, t.javob);
      assert.ok(f && f.tur !== "papka", t.id);
      assert.equal(f.nom, t.fayl);
      assert.equal(L.chuqurlik(t.holat, t.javob), tier + 1, t.id);
      assert.equal(L.hammasi(t.holat).filter((x) => x.nom === t.fayl).length, 1, "nishon yagona: " + t.id);
      // Avtomat o'ynovchi yo'li: papkalarga ketma-ket kirilsa, fayl ko'rinadi
      const borgan = L.bajar(t.holat, t.papkalar.map((p) => ({ amal: "kir", id: p })));
      assert.ok(L.korinadi(borgan).some((x) => x.id === t.javob), t.id);
      assert.equal(L.yolMatn(borgan, borgan.joriy), t.joy);
      // Adashtiradigan boshqa fayllar ham bor (aks holda "top" emas)
      assert.ok(L.fayllari(t.holat).length >= 6, t.id);
      assert.ok(L.korinadi(borgan).length >= 2 && L.korinadi(borgan).length <= 3, t.id);
      assert.ok(L.korinadi(t.holat).length <= 3, "ildizda ko'pi bilan 3 ta narsa");
      takrorsiz(t.holat, t.id);
      assert.ok(t.matn.includes(`«${t.fayl}»`));
      assert.equal(t.matn.includes(t.joy), tier > 0, "yo'l faqat chuqur daraxtda beriladi");
      assert.ok(!t.ishora.includes(t.fayl) && !t.ishora.includes(t.joy), "maslahat javobni aytmaydi");
      assert.ok(t.nega.includes(t.joy));
      for (const m of [t.matn, t.ishora, t.nega]) matnToza(m, t.id);
    }
  }
});

test("top: daraxtdagi hamma fayl nomi yagona, papka nomi faylga mos", () => {
  for (const tier of TIERLAR) {
    for (const t of each(L.topTask, 80, tier, 7)) {
      const fayllar = L.fayllari(t.holat);
      assert.equal(new Set(fayllar.map((f) => f.nom)).size, fayllar.length, t.id);
      for (const f of fayllar) assert.equal(L.otasi(t.holat, f.id).nom, L.PAPKA_NOMI[f.tur], t.id);
    }
  }
});

test("tur: 4 variant, takrorlanmaydi, javob ichida va nom oxiriga mos", () => {
  for (const tier of TIERLAR) {
    const chiqqan = new Set();
    for (const t of each(L.turTask, SONI, tier)) {
      assert.ok(t.variantlar.length >= 4, t.id);
      assert.equal(new Set(t.variantlar).size, t.variantlar.length, t.id);
      assert.ok(t.variantlar.includes(t.javob), t.id);
      assert.equal(t.javob, L.TUR_NOMI[L.turi(t.fayl)], t.id);
      assert.equal(t.faylTuri, L.turi(t.fayl));
      assert.equal(t.belgi, tier === 0, "belgi faqat birinchi savollarda ko'rinadi");
      assert.ok(!t.ishora.includes(t.javob), "maslahat javobni aytmaydi");
      if (tier === 2) assert.ok(L.CHALGITUVCHI.some((x) => x.nom === t.fayl), t.id);
      for (const m of [t.matn, t.ishora, t.nega]) matnToza(m, t.id);
      chiqqan.add(t.javob);
    }
    assert.equal(chiqqan.size, 4, "hamma tur chiqadi");
  }
});

test("yo'l: 4 ta haqiqiy papka yo'li, javob — fayl turgan papka; tier < 2 da — «top»", () => {
  for (const t of each(L.yolTask, SONI, 2)) {
    assert.equal(t.tur, "yol");
    assert.ok(t.variantlar.length >= 4, t.id);
    assert.equal(new Set(t.variantlar).size, t.variantlar.length, t.id);
    assert.ok(t.variantlar.includes(t.javob), t.id);
    assert.equal(t.javob, L.yolMatn(t.holat, L.otasi(t.holat, t.faylId).id));
    assert.equal(L.hammasi(t.holat).filter((x) => x.nom === t.fayl).length, 1, t.id);
    const yollar = L.hammasi(t.holat).filter((x) => x.tur === "papka").map((p) => L.yolMatn(t.holat, p.id));
    for (const v of t.variantlar) assert.ok(yollar.includes(v), "variant — daraxtdagi haqiqiy yo'l: " + v);
    assert.ok(!t.matn.includes(t.javob) && !t.ishora.includes(t.javob));
    assert.deepEqual(t.papkalar, L.papkaYoli(t.holat, t.faylId));
    for (const m of [t.matn, t.ishora, t.nega]) matnToza(m, t.id);
  }
  assert.equal(L.yolTask(rngFrom(1), null, 0).tur, "top");
  assert.equal(L.yolTask(rngFrom(1), null, 1).tur, "top");
});

test("tartibla: har turga papka nomi bor, boshida yechilmagan, namunali yechim maqsaddan o'tadi", () => {
  for (const tier of TIERLAR) {
    for (const t of each(L.tartiblaTask, SONI, tier)) {
      assert.equal(t.turlar.length, tier === 2 ? 3 : 2, t.id);
      assert.equal(new Set(t.turlar).size, t.turlar.length);
      for (const tur of t.turlar) assert.ok(L.PAPKA_NOMI[tur], tur);
      const ildiz = t.holat.ildiz.ichi;
      const sochilgan = ildiz.filter((x) => x.tur !== "papka");
      const papkalar = ildiz.filter((x) => x.tur === "papka").map((p) => p.nom);
      assert.equal(sochilgan.length, 3, t.id);
      assert.ok(ildiz.length <= 6, "ildizda ko'pi bilan 6 ta narsa (telefonda ikki qator)");
      // Har turdan kamida bitta fayl sochilib yotibdi
      assert.deepEqual([...new Set(sochilgan.map((f) => f.tur))].sort(), t.turlar.slice().sort(), t.id);
      assert.deepEqual(t.fayllar, L.fayllari(t.holat).map((f) => f.id));
      takrorsiz(t.holat, t.id);

      const kerakli = t.turlar.map((tur) => L.PAPKA_NOMI[tur]);
      if (tier === 0) {
        assert.deepEqual(papkalar.slice().sort(), kerakli.slice().sort(), "papkalar tayyor");
        assert.deepEqual(t.asboblar, ["orqaga", "kes", "qoy"]);
      } else if (tier === 1) {
        assert.equal(papkalar.length, 1);
        assert.ok(!papkalar.includes(L.PAPKA_NOMI[t.yoq]), "bitta papka yo'q");
        assert.ok(L.nomTakliflari(t.holat).includes(L.PAPKA_NOMI[t.yoq]), "yo'q papkaning nomi chiplarda bor");
        assert.ok(t.asboblar.includes("yangi") && t.asboblar.includes("nomla"));
      } else {
        assert.equal(papkalar.length, 3);
        const begona = papkalar.filter((n) => !kerakli.includes(n));
        assert.equal(begona.length, 1, "bitta papka boshqa nom bilan: " + t.id);
        assert.ok(Object.values(L.PAPKA_NOMI).includes(begona[0]));
        const ichi = L.nomBilan(t.holat, begona[0]).ichi;
        assert.ok(ichi.length === 2 && ichi.every((f) => f.tur === t.almash), "ichidagi fayllar nomiga mos emas");
        assert.ok(L.nomTakliflari(t.holat).includes(L.PAPKA_NOMI[t.almash]), "to'g'ri nom chiplarda bor");
        assert.ok(t.asboblar.includes("nomla"));
      }
      assert.ok(!t.asboblar.includes("ochir") && !t.asboblar.includes("nusxa") && !t.savat && !t.tezkor, "2-bosqichda savat va tezkor tugmalar yo'q");

      // Boshida yechilmagan; yechim qadamlari maqsadga olib boradi
      const bosh = L.maqsad(t.holat, t);
      assert.equal(bosh.ok, false, t.id);
      assert.equal(bosh.qolgan, tier === 2 ? 5 : 3, t.id);
      assert.equal(t.javob, t.yechim);
      const oxiri = L.bajar(muz(t.holat), t.yechim);
      assert.deepEqual(L.maqsad(oxiri, t), { ok: true, qolgan: 0 }, t.id);
      assert.equal(L.fayllari(oxiri).length, t.fayllar.length, "hech narsa yo'qolmadi");
      assert.deepEqual(oxiri.savat, []);
      takrorsiz(oxiri, t.id);
      // Yechim faqat ko'rinadigan asboblardan foydalanadi
      const amalAsbob = { yangiPapka: "yangi", nomla: "nomla", kes: "kes", qoy: "qoy", orqaga: "orqaga" };
      for (const q of t.yechim) if (amalAsbob[q.amal]) assert.ok(t.asboblar.includes(amalAsbob[q.amal]), `${t.id}: ${q.amal}`);
      // Yechim ro'yxati: har papka o'z turidagi fayllar bilan, hamma fayl ko'rsatilgan
      const xulosa = L.yechimXulosa(t);
      assert.deepEqual(xulosa.map((q) => q.nom).sort(), kerakli.slice().sort(), t.id);
      for (const q of xulosa) for (const f of q.ichi) assert.equal(L.PAPKA_NOMI[f.tur], q.nom);
      assert.equal(xulosa.reduce((a, q) => a + q.ichi.length, 0), t.fayllar.length);
      matnToza(t.matn, t.id);
      matnToza(L.maslahat(t, bosh), t.id);
    }
  }
});

test("nusxa: fayl va «Zaxira» bor, boshida yechilmagan, yechim maqsaddan o'tadi", () => {
  for (const tier of TIERLAR) {
    for (const t of each(L.nusxaTask, SONI, tier)) {
      const f = L.top(t.holat, t.fayl);
      assert.equal(f.nom, t.faylNomi);
      assert.equal(L.hammasi(t.holat).filter((x) => x.nom === t.faylNomi).length, 1, t.id);
      assert.equal(L.chuqurlik(t.holat, t.fayl), tier, t.id);
      assert.equal(L.qayerda(t.holat, t.fayl), t.asliJoy);
      assert.equal(L.top(t.holat, t.nishon).nom, L.ZAXIRA);
      assert.equal(L.qayerda(t.holat, t.nishon), L.ILDIZ);
      assert.notEqual(t.asliJoy, t.nishon);
      assert.ok(t.matn.includes(`«${t.faylNomi}»`) && t.matn.includes(`«${L.ZAXIRA}»`));
      assert.deepEqual(t.asboblar, L.ASBOB3);
      assert.ok(t.savat && t.tezkor);
      takrorsiz(t.holat, t.id);
      assert.deepEqual(L.maqsad(t.holat, t), { ok: false, qolgan: 1 }, t.id);
      const oxiri = L.bajar(muz(t.holat), t.yechim);
      assert.deepEqual(L.maqsad(oxiri, t), { ok: true, qolgan: 0 }, t.id);
      assert.equal(L.hammasi(oxiri).filter((x) => x.nom === t.faylNomi).length, 2, "ikkita bo'ldi");
      // «Kesish» bilan qilingan o'sha yo'l — to'g'ri emas
      const kesib = L.bajar(t.holat, t.yechim.map((q) => (q.amal === "nusxa" ? { amal: "kes" } : q)));
      assert.equal(L.maqsad(kesib, t).ok, false, t.id);
      const xulosa = L.yechimXulosa(t);
      assert.equal(xulosa.length, 2);
      assert.equal(xulosa[1].nom, L.ZAXIRA);
      for (const q of xulosa) assert.ok(q.ichi.some((x) => x.nom === t.faylNomi), t.id);
      matnToza(t.matn, t.id);
    }
  }
});

test("o'chirish: 1 / 2 / 3 ta fayl, boshida yechilmagan, yechim maqsaddan o'tadi", () => {
  for (const tier of TIERLAR) {
    for (const t of each(L.ochirTask, SONI, tier)) {
      assert.equal(t.fayllar.length, tier + 1, t.id);
      assert.equal(new Set(t.fayllar).size, t.fayllar.length);
      t.fayllar.forEach((fid, k) => {
        const f = L.top(t.holat, fid);
        assert.ok(f && f.tur !== "papka", t.id);
        assert.equal(f.nom, t.faylNomlari[k]);
        assert.ok(t.matn.includes(`«${f.nom}»`), t.id);
        assert.equal(L.hammasi(t.holat).filter((x) => x.nom === f.nom).length, 1, t.id);
      });
      // Har papkada o'chirilgandan keyin ham fayl qoladi (bo'sh papka chalg'itmasin)
      assert.ok(L.fayllari(t.holat).length - t.fayllar.length >= 2, t.id);
      assert.ok(t.holat.ildiz.ichi.length <= 4);
      takrorsiz(t.holat, t.id);
      assert.deepEqual(L.maqsad(t.holat, t), { ok: false, qolgan: tier + 1 }, t.id);
      const oxiri = L.bajar(muz(t.holat), t.yechim);
      assert.deepEqual(L.maqsad(oxiri, t), { ok: true, qolgan: 0 }, t.id);
      assert.deepEqual(oxiri.savat.map((s) => s.tugun.id).sort(), t.fayllar.slice().sort());
      assert.equal(oxiri.joriy, L.ILDIZ);
      assert.deepEqual(L.yechimXulosa(t), [{ nom: "Savat", belgi: "savat-tola", ichi: oxiri.savat.map((s) => ({ nom: s.tugun.nom, tur: s.tugun.tur })) }]);
      matnToza(t.matn, t.id);
    }
  }
});

test("qaytarish: savatda 1 / 2 / 3 ta fayl, kerakligi qaytadi, qolgani savatda", () => {
  for (const tier of TIERLAR) {
    for (const t of each(L.tiklaTask, SONI, tier)) {
      assert.equal(t.holat.savat.length, tier + 1, t.id);
      assert.equal(t.fayllar.length, tier === 2 ? 2 : 1, t.id);
      assert.equal(t.qolsin.length, tier === 0 ? 0 : 1, t.id);
      assert.deepEqual(t.holat.savat.map((s) => s.tugun.id).sort(), t.fayllar.concat(t.qolsin).sort());
      assert.equal(t.holat.joriy, L.ILDIZ);
      assert.deepEqual([t.holat.tanlangan, t.holat.bufer], [null, null]);
      t.fayllar.forEach((fid, k) => {
        assert.equal(L.qayerda(t.holat, fid), "savat");
        assert.ok(t.matn.includes(`«${t.faylNomlari[k]}»`), t.id);
        assert.ok(L.top(t.holat, t.joylar[fid]), "asl papkasi joyida");
      });
      assert.equal(t.matn.includes("faqat"), tier > 0, "ortiqchasi bor bo'lsa — «faqat» deb aytiladi");
      takrorsiz(t.holat, t.id);
      assert.deepEqual(L.maqsad(t.holat, t), { ok: false, qolgan: t.fayllar.length }, t.id);
      const oxiri = L.bajar(muz(t.holat), t.yechim);
      assert.deepEqual(L.maqsad(oxiri, t), { ok: true, qolgan: 0 }, t.id);
      for (const fid of t.fayllar) assert.equal(L.qayerda(oxiri, fid), t.joylar[fid]);
      assert.deepEqual(oxiri.savat.map((s) => s.tugun.id), t.qolsin);
      // Hammasini qaytarib yuborish — ortiqchasi bor bo'lsa, to'g'ri emas
      const hammasi = L.bajar(t.holat, t.holat.savat.map((s) => ({ amal: "tikla", id: s.tugun.id })));
      assert.equal(L.maqsad(hammasi, t).ok, tier === 0, t.id);
      const xulosa = L.yechimXulosa(t);
      assert.equal(xulosa[xulosa.length - 1].nom === "Savat", tier > 0);
      for (const nom of t.faylNomlari) assert.ok(xulosa.some((q) => q.belgi === "papka" && q.ichi.some((x) => x.nom === nom)), t.id);
      matnToza(t.matn, t.id);
    }
  }
});

test("sanab: «a», «b» va «c»", () => {
  assert.equal(L.sanab(["a.jpg"]), "«a.jpg»");
  assert.equal(L.sanab(["a.jpg", "b.txt"]), "«a.jpg» va «b.txt»");
  assert.equal(L.sanab(["a.jpg", "b.txt", "c.mp3"]), "«a.jpg», «b.txt» va «c.mp3»");
});

test("ketma-ket bir xil misol chiqmaydi; har vazifada javob bor; bosqich navbati aylanadi", () => {
  for (const make of [L.topTask, L.turTask, L.yolTask, L.tartiblaTask, L.nusxaTask, L.ochirTask, L.tiklaTask]) {
    for (const tier of TIERLAR) {
      const list = each(make, SONI, tier, 11);
      for (let i = 1; i < list.length; i++) assert.notEqual(list[i].id, list[i - 1].id);
      for (const t of list) assert.ok(t.javob != null && t.id && t.matn, t.id);
    }
  }
  const r = rngFrom(9);
  assert.deepEqual([0, 1, 2, 3, 4].map((n) => L.bosqich1Task(r, null, n, 0).tur), ["top", "tur", "top", "tur", "top"]);
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map((n) => L.bosqich1Task(r, null, n, 2).tur), ["top", "tur", "yol", "tur", "top", "tur", "yol"]);
  assert.deepEqual([0, 1, 2].map((n) => L.bosqich2Task(r, null, n, n).tur), ["tartibla", "tartibla", "tartibla"]);
  assert.deepEqual([0, 1, 2, 3].map((n) => L.bosqich3Task(r, null, n, 1).tur), ["nusxa", "ochir", "tikla", "nusxa"]);
});
