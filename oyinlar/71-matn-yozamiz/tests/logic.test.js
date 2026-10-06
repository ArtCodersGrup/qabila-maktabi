// 71-o'yin: matn yozamiz — tenglik, farq turi, xato generatori, qator/belgi vazifalari, bezak tekshiruvi.
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
  const r = rngFrom(seed || 71);
  const out = [];
  let prev = null;
  for (let k = 0; k < count; k++) {
    prev = make(r, prev, tier);
    out.push(prev);
  }
  return out;
}

// ---------- Tenglik ----------
test("teng: oxirgi va qator oxiridagi bo'sh joylar e'tiborsiz, boshidagi — e'tiborli", () => {
  assert.ok(L.teng("Men maktabga boraman.", "Men maktabga boraman."));
  assert.ok(L.teng("Men maktabga boraman.   ", "Men maktabga boraman."));
  assert.ok(L.teng("Olma  \nNok \nUzum\n\n", "Olma\nNok\nUzum"));
  assert.ok(L.teng("a\r\nb", "a\nb"));
  assert.ok(L.teng("a b", "a b"), "nbsp — oddiy bo'sh joy");
  assert.ok(!L.teng(" Olma", "Olma"), "qator boshidagi bo'sh joy — farq");
  assert.ok(!L.teng("Olma Nok", "Olma\nNok"), "qator ajratilmagan — farq");
  assert.ok(!L.teng("olma", "Olma"), "katta-kichik harf — farq");
});

test("teng: oʻ/gʻ uchun apostrof variantlari qabul, qolgan apostrof — tutuq", () => {
  for (const a of ["'", "ʼ", "‘", "’", "ʻ", "`"]) {
    assert.ok(L.teng(`Ukam to${a}p o${a}ynaydi.`, "Ukam toʻp oʻynaydi."), `o${a}`);
    assert.ok(L.teng(`Dadam bog${a}da ishlaydi.`, "Dadam bogʻda ishlaydi."), `g${a}`);
    assert.ok(L.teng(`She${a}r`, "Sheʼr"), `tutuq ${a}`);
  }
  assert.ok(L.teng("Oʻchirgʻich", "O'chirg'ich"));
  assert.ok(!L.teng("Ukam top oʻynaydi.", "Ukam toʻp oʻynaydi."), "belgi tushib qolsa — teng emas");
});

// ---------- Farq ----------
test("farq: teng bo'lsa null, har xato turi aniqlanadi, joyi aytilmaydi", () => {
  assert.equal(L.farq("Men maktabga boraman.", "Men maktabga boraman. "), null);
  const k = "Men maktabga boraman.";
  assert.equal(L.farq("Men maktbga boraman.", k).tur, "yetishmaydi");
  assert.equal(L.farq("Men makktabga boraman.", k).tur, "ortiqcha");
  assert.equal(L.farq("Men maktabga bpraman.", k).tur, "notogri");
  assert.equal(L.farq("men maktabga boraman.", k).tur, "katta");
  assert.equal(L.farq("Men Maktabga boraman.", k).tur, "kichik");
  assert.equal(L.farq("Men maktabga boraman", k).tur, "nuqta");
  assert.equal(L.farq("Oppoq qor yogʻdi\nBolalar quvondi.", "Oppoq qor yogʻdi,\nBolalar quvondi.").tur, "vergul");
  assert.equal(L.farq("Men maktabgaboraman.", k).tur, "bosh-joy");
  assert.equal(L.farq("Men  maktabga boraman.", k).tur, "ortiqcha-bosh-joy");
  assert.equal(L.farq("Men maktabga boraman..", k).tur, "ortiqcha-belgi");
  assert.equal(L.farq("", k).tur, "bosh");
  assert.equal(L.farq("Olma Nok Uzum", "Olma\nNok\nUzum").tur, "qator");
  assert.equal(L.farq("Olma\nNok\nUzum\nNok", "Olma\nNok\nUzum").tur, "ortiqcha-qator");
  assert.equal(L.farq("Olma Nok\nUzum", "Olma\nNok\nUzum").tur, "qator");
  assert.equal(L.farq("Olma\nNok Uzum\nUzum", "Olma\nNok\nUzum\nUzum").tur, "qator");
  assert.equal(L.farq("Olma\n Nok\nUzum", "Olma\nNok\nUzum").tur, "ortiqcha-bosh-joy");
  assert.equal(L.farq("Olma Nok\nUzum\nNok", "Olma\nNok Uzum\nNok").tur, "qator-joyi");
  const ikki = L.farq("men maktabga bpraman.", k);
  assert.equal(ikki.tur, "boshqa");
  assert.match(ikki.matn, /^2 ta joy/);
  // Maslahat matnida qator raqami yoki so'z yo'q
  for (const f of [L.farq("Men maktbga boraman.", k), L.farq("Olma\nNok\nUzm", "Olma\nNok\nUzum")]) {
    assert.ok(!/\d-qator/.test(f.matn) && !f.matn.includes("maktab") && !f.matn.includes("Uzum"), f.matn);
  }
  // Ikki qatorda farq bo'lsa — aytiladi
  assert.match(L.farq("Olma\nNk\nUzm", "Olma\nNok\nUzum").matn, /Boshqa qatorda ham/);
});

test("farq: apostrof variantlari farq hisoblanmaydi", () => {
  assert.equal(L.farq("Ukam to'p o'ynaydi.", "Ukam toʻp oʻynaydi."), null);
  assert.equal(L.farq("Ukam top oʻynaydi.", "Ukam toʻp oʻynaydi.").tur, "yetishmaydi");
});

// ---------- Matnlar banki ----------
test("bank: gaplar katta harf va nuqta bilan, she'r qatorlari vergul/nuqta bilan, kamida 12 gap va 6 she'r/ro'yxat", () => {
  assert.ok(L.GAPLAR.length >= 12);
  assert.ok(L.MATNLAR.length >= 6);
  for (const g of L.GAPLAR) {
    assert.match(g, /^[A-Z]/, g);
    assert.match(g, /\.$/, g);
    assert.ok(!/['‘’]/.test(g), "bankda faqat ʻ va ʼ: " + g);
    const sozlar = L.sozlar(g).filter((t) => t.soz.length >= 3 && L.orinlar(t.soz).length);
    assert.ok(sozlar.length >= 2, "ikki xatoga yetarli so'z: " + g);
  }
  for (const m of L.MATNLAR) {
    assert.ok(m.qatorlar.length >= 2 && m.qatorlar.length <= 4, m.id);
    if (m.tur === "sher") {
      m.qatorlar.forEach((q, i) => assert.match(q, i === m.qatorlar.length - 1 ? /\.$/ : /,$/, `${m.id}: ${q}`));
    } else {
      for (const q of m.qatorlar) assert.equal(L.sozlar(q).length, 1, `${m.id}: ${q}`);
    }
    assert.ok(!/['‘’]/.test(m.qatorlar.join("")), m.id);
  }
  assert.equal(L.MATNLAR.filter((m) => m.tur === "sher").length >= 4, true);
  for (const n of [2, 3, 4]) assert.ok(L.nQatorli(n).length >= 3, `${n} qatorli matnlar`);
  for (const n of [2, 3, 4]) assert.ok(L.nQatorli(n, ["sher"]).length >= 2, `${n} qatorli she'rlar`);
});

// ---------- Xato generatori ----------
test("buz: har tur bitta so'zni bitta xato bilan buzadi, oʻ/gʻ butun qoladi", () => {
  const r = rngFrom(3);
  assert.equal(L.buz("Maktab", "kichik", r), "maktab");
  assert.equal(L.buz("maktab", "kichik", r), null);
  for (let k = 0; k < 200; k++) {
    const soz = ["maktabga", "toʻp", "bogʻda", "oʻynaydi", "Buvim"][k % 5];
    for (const tur of ["tushdi", "ortiqcha", "notogri"]) {
      const b = L.buz(soz, tur, r);
      assert.ok(b && b !== soz, `${soz} ${tur}`);
      assert.equal(b.length, soz.length + (tur === "tushdi" ? -1 : tur === "ortiqcha" ? 1 : 0), `${soz} ${tur} → ${b}`);
      // oʻ / gʻ juftligi buzilmaydi
      assert.equal((b.match(/[oOgG]ʻ/g) || []).length, (soz.match(/[oOgG]ʻ/g) || []).length, `${soz} ${tur} → ${b}`);
      assert.ok(!/(^|[^oOgG])ʻ/.test(b), `ʻ yolg'iz qolmaydi: ${b}`);
      assert.equal(L.farq(b, soz).tur, tur === "tushdi" ? "yetishmaydi" : tur === "ortiqcha" ? "ortiqcha" : "notogri", `${soz} ${tur} → ${b}`);
    }
  }
});

test("tuzat: har tierda aynan kerakli sondagi xato, so'z chegarasida, kutilgan — bankdagi asl, takror yo'q", () => {
  const turlar = { tushdi: 0, ortiqcha: 0, notogri: 0, kichik: 0 };
  for (const tier of [0, 1, 2]) {
    const list = each(L.tuzatTask, 300, tier, 10 + tier);
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      assert.equal(t.tur, "tuzat");
      assert.ok(L.GAPLAR.includes(t.kutilgan), "kutilgan bankdan");
      assert.equal(t.javob, t.kutilgan);
      assert.equal(t.xatolar.length, tier === 2 ? 2 : 1, t.id);
      assert.ok(!L.teng(t.boshlangich, t.kutilgan));
      // So'z chegarasi: so'zlar soni bir xil, faqat xato so'zlar farq qiladi; bo'sh joy va nuqta joyida
      const a = L.sozlar(t.boshlangich);
      const b = L.sozlar(t.kutilgan);
      assert.equal(a.length, b.length, t.boshlangich);
      const farqli = a.map((x, k) => k).filter((k) => a[k].soz !== b[k].soz);
      assert.deepEqual(farqli, t.xatolar.map((x) => x.soz).sort((p, q) => p - q), t.boshlangich);
      assert.equal(t.boshlangich.replace(/\p{L}+/gu, ""), t.kutilgan.replace(/\p{L}+/gu, ""), "harfdan boshqa belgilar o'zgarmaydi");
      for (const x of t.xatolar) {
        turlar[x.tur]++;
        assert.equal(b[x.soz].soz, x.asl);
        assert.equal(a[x.soz].soz, x.buzuq);
        assert.ok(x.buzuq.length >= 2);
        if (x.tur === "kichik") assert.equal(x.soz, 0, "kichik harf — faqat gap boshi");
      }
      if (tier === 2) {
        assert.notEqual(t.xatolar[0].soz, t.xatolar[1].soz, "ikki xato ikki so'zda");
        assert.notEqual(t.xatolar[0].tur, t.xatolar[1].tur, "ikki xato ikki xil");
        assert.equal(t.korsat, null);
      }
      if (tier === 0) assert.equal(t.korsat, t.xatolar[0].buzuq, "tier 0 da buzilgan so'z ko'rsatiladi");
      if (tier === 1) assert.equal(t.korsat, null);
      if (i) assert.notEqual(t.id, list[i - 1].id, "ketma-ket bir xil gap chiqmaydi");
      // Maslahat (farq) bitta xatoda aynan shu turni aytadi
      if (t.xatolar.length === 1) {
        const kutilganTur = { tushdi: "yetishmaydi", ortiqcha: "ortiqcha", notogri: "notogri", kichik: "katta" }[t.xatolar[0].tur];
        assert.equal(L.farq(t.boshlangich, t.kutilgan).tur, kutilganTur, t.boshlangich);
      }
    }
  }
  for (const [k, n] of Object.entries(turlar)) assert.ok(n > 40, `${k} turi ham chiqadi (${n})`);
});

// ---------- 2-bosqich ----------
test("qator: bitta qatorga yig'ilgan matn asliga teng, qatorlar soni tier bilan 2 → 3 → 4", () => {
  for (const tier of [0, 1, 2]) {
    const list = each(L.qatorTask, 200, tier, 20 + tier);
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      assert.equal(t.tur, "qator");
      assert.equal(t.kutilgan.split("\n").length, 2 + tier, t.id);
      assert.ok(!t.boshlangich.includes("\n"));
      assert.equal(t.kutilgan.split("\n").join(" "), t.boshlangich);
      assert.equal(L.farq(t.boshlangich, t.kutilgan).tur, "qator");
      assert.ok(t.namuna, "namuna ko'rsatiladi");
      const m = L.MATNLAR.find((x) => t.id.startsWith("qator:" + x.id + ":"));
      assert.ok(m, t.id);
      assert.deepEqual(t.kutilgan.split("\n"), m.qatorlar.slice(0, 2 + tier), "asl bankdagi qatorlar");
      if (i) assert.notEqual(t.id, list[i - 1].id);
    }
  }
});

test("sarlavha: faqat sarlavha yopishgan, qolgan qatorlar joyida", () => {
  for (const tier of [0, 1, 2]) {
    const list = each(L.sarlavhaTask, 150, tier, 30 + tier);
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      const kq = t.kutilgan.split("\n");
      const bq = t.boshlangich.split("\n");
      assert.equal(kq.length, 3 + tier, t.id);
      assert.equal(bq.length, kq.length - 1);
      assert.equal(kq[0], t.sarlavha);
      assert.equal(bq[0], kq[0] + " " + kq[1]);
      assert.deepEqual(bq.slice(1), kq.slice(2));
      assert.equal(L.farq(t.boshlangich, t.kutilgan).tur, "qator");
      assert.ok(t.matn.includes(`«${t.sarlavha}»`));
      if (i) assert.notEqual(t.id, list[i - 1].id);
    }
  }
});

test("belgi: faqat qator oxiridagi belgilar tushgan, soni tier bilan, harflar o'zgarmagan", () => {
  for (const tier of [0, 1, 2]) {
    const list = each(L.belgiTask, 200, tier, 40 + tier);
    let sher = 0;
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      const kq = t.kutilgan.split("\n");
      const bq = t.boshlangich.split("\n");
      assert.equal(kq.length, 2 + tier, t.id);
      assert.equal(bq.length, kq.length);
      assert.equal(t.tushgan, tier + 1);
      assert.equal(t.belgilar.length, t.tushgan);
      let tushdi = 0;
      kq.forEach((q, k) => {
        if (q === bq[k]) return;
        tushdi++;
        assert.equal(bq[k], q.slice(0, -1), "faqat oxirgi belgi tushgan");
        assert.ok(/[.,]/.test(q.slice(-1)));
      });
      assert.equal(tushdi, t.tushgan);
      assert.equal(t.boshlangich.replace(/[.,]/g, ""), t.kutilgan.replace(/[.,]/g, ""));
      if (!t.id.startsWith("belgi:gap:")) sher++;
      const f = L.farq(t.boshlangich, t.kutilgan);
      assert.ok(f.tur === "nuqta" || f.tur === "vergul", f.tur);
      if (i) assert.notEqual(t.id, list[i - 1].id);
    }
    assert.ok(sher > 40 && sher < 160, "she'r ham, gaplar ham chiqadi");
  }
});

test("2-bosqich navbati: qator, belgi, sarlavha, qator, belgi", () => {
  const r = rngFrom(9);
  assert.deepEqual([0, 1, 2, 3, 4].map((n) => L.bosqich2Task(r, null, n, 0).tur), ["qator", "belgi", "sarlavha", "qator", "belgi"]);
  assert.equal(L.bosqich1Task(r, null, 0, 1).tur, "tuzat");
  assert.equal(L.bosqich3Task(r, null, 3, 2).tur, "beza");
});

// ---------- HTML bo'laklari ----------
test("htmlBolaklar: teglar, &nbsp;, <br>, <div> qatorlari, <script> tashlanadi", () => {
  assert.equal(L.htmlMatn("a&nbsp;b<br>c"), "a b\nc");
  assert.equal(L.htmlMatn("<div>Olma</div><div>Nok</div>"), "Olma\nNok\n");
  assert.equal(L.htmlMatn("Olma<div>Nok</div><div><br></div><div>Uzum</div>"), "Olma\nNok\n\nUzum\n");
  assert.equal(L.htmlMatn("a &amp; b &lt;c&gt; &#39;d&#x27; &quot;e&quot;"), "a & b <c> 'd' \"e\"");
  assert.equal(L.htmlMatn("x<script>alert(1)</script>y<style>p{}</style>z<!-- izoh -->"), "xyz");
  const b = L.htmlBolaklar("<b>Ol<i>ma</i></b> <font color=\"#2F6FDE\">Nok</font> <span style=\"color: rgb(26, 158, 119); font-weight: bold\">Uzum</span>");
  assert.deepEqual(b.map((x) => [x.matn, x.qalin, x.kursiv, x.rang]), [
    ["Ol", true, false, null], ["ma", true, true, null], [" ", false, false, null],
    ["Nok", false, false, "#2f6fde"], [" ", false, false, null], ["Uzum", true, false, "#1a9e77"],
  ]);
  assert.equal(L.hexRang("#abc"), "#aabbcc");
  assert.equal(L.hexRang("rgb(47, 111, 222)"), "#2f6fde");
});

test("tozaHtml va matnHtml: faqat b, i, font color, br qoladi; qochirish", () => {
  assert.equal(L.tozaHtml("<span style=\"color: rgb(47, 111, 222); font-weight: bold\">Olma</span> <script>x</script><em>Nok</em>"),
    "<font color=\"#2f6fde\"><b>Olma</b></font> <i>Nok</i>");
  assert.equal(L.tozaHtml("<div>a</div><div>b</div>"), "a<br>b<br>");
  assert.equal(L.matnHtml("a < b & c\nd"), "a &lt; b &amp; c<br>d");
  assert.equal(L.htmlMatn(L.matnHtml("Oppoq qor,\nBolalar.")), "Oppoq qor,\nBolalar.");
  assert.equal(L.tozaHtml("<a href=\"x\" onclick=\"y()\">z</a><img src=x onerror=y>"), "z");
});

// ---------- Bezak tekshiruvi ----------
test("bezakTekshir: to'g'ri holatlar — b/strong, i/em, font/span rang, &nbsp;, br, div, ibora", () => {
  const m = "Oppoq qor yogʻdi,\nBolalar quvondi.";
  const ok = (html, k, matn) => assert.equal(L.bezakTekshir(html, k, matn === undefined ? m : matn).tur, "ok", html);
  ok("Oppoq <b>qor</b> yogʻdi,<br>Bolalar quvondi.", { soz: "qor", bezak: "qalin" });
  ok("Oppoq <strong>qor</strong> yogʻdi,<br>Bolalar quvondi.", { soz: "qor", bezak: "qalin" });
  ok("Oppoq&nbsp;<i>qor</i>&nbsp;yogʻdi,<br>Bolalar quvondi.", { soz: "qor", bezak: "kursiv" });
  ok("Oppoq <em>qor</em> yogʻdi,<br>Bolalar quvondi.", { soz: "qor", bezak: "kursiv" });
  ok("<div>Oppoq <font color=\"#2f6fde\">qor</font> yogʻdi,</div><div>Bolalar quvondi.</div>", { soz: "qor", bezak: "kok" });
  ok("Oppoq <span style=\"color: rgb(26, 158, 119);\">qor</span> yogʻdi,<br>Bolalar quvondi.", { soz: "qor", bezak: "yashil" });
  // Belgilash bo'sh joy bilan birga — so'z butun bo'lsa yetarli
  ok("Oppoq<b> qor </b>yogʻdi,<br>Bolalar quvondi.", { soz: "qor", bezak: "qalin" });
  // Ibora: so'zlar alohida teglarda ham bo'lishi mumkin
  ok("Oppoq qor yogʻdi,<br><b>Bolalar</b> <b>quvondi</b>.", { soz: "Bolalar quvondi", bezak: "qalin" });
  ok("Oppoq qor yogʻdi,<br><b>Bolalar quvondi.</b>", { soz: "Bolalar quvondi", bezak: "qalin" });
  // Ikki buyruq
  ok("Oppoq <b>qor</b> yogʻdi,<br>Bolalar <font color=\"#8e5bd0\">quvondi</font>.", [{ soz: "qor", bezak: "qalin" }, { soz: "quvondi", bezak: "binafsha" }]);
  // Boshqa turdagi bezak boshqa so'zda — xalaqit bermaydi
  ok("Oppoq <b>qor</b> <i>yogʻdi</i>,<br>Bolalar quvondi.", { soz: "qor", bezak: "qalin" });
  // Matn berilmasa — faqat bezak tekshiriladi
  ok("<b>qor</b>", { soz: "qor", bezak: "qalin" }, null);
});

test("bezakTekshir: noto'g'ri holatlar — bezalmagan, qisman, ortiqcha, boshqa bezak, matn o'zgargan, topilmadi", () => {
  const m = "Oppoq qor yogʻdi,\nBolalar quvondi.";
  const tur = (html, k, matn) => L.bezakTekshir(html, k, matn === undefined ? m : matn).tur;
  assert.equal(tur("Oppoq qor yogʻdi,<br>Bolalar quvondi.", { soz: "qor", bezak: "qalin" }), "yoq");
  assert.equal(tur("Oppoq <i>qor</i> yogʻdi,<br>Bolalar quvondi.", { soz: "qor", bezak: "qalin" }), "yoq", "kursiv — qalin emas");
  assert.equal(tur("Oppoq <font color=\"#1a9e77\">qor</font> yogʻdi,<br>Bolalar quvondi.", { soz: "qor", bezak: "kok" }), "yoq", "boshqa rang");
  assert.equal(tur("Oppoq <b>q</b>or yogʻdi,<br>Bolalar quvondi.", { soz: "qor", bezak: "qalin" }), "qisman");
  assert.equal(tur("Oppoq <b>qor yogʻdi</b>,<br>Bolalar quvondi.", { soz: "qor", bezak: "qalin" }), "ortiqcha");
  assert.equal(tur("<b>Oppoq qor yogʻdi,<br>Bolalar quvondi.</b>", { soz: "qor", bezak: "qalin" }), "ortiqcha");
  assert.equal(tur("Oppoq qor yogʻdi,<br><b>Bolalar</b> quvondi.", { soz: "Bolalar quvondi", bezak: "qalin" }), "yoq", "iboraning bir so'zi bezalmagan");
  assert.equal(tur("Oppoq <b>qor</b> yogdi,<br>Bolalar quvondi.", { soz: "qor", bezak: "qalin" }), "matn", "harf o'chgan");
  assert.equal(tur("Oppoq <b>qor</b> yogʻdi, Bolalar quvondi.", { soz: "qor", bezak: "qalin" }), "matn", "qator yo'qolgan");
  assert.equal(tur("Oppoq <b>qor</b> yog'di,<br>Bolalar quvondi.", { soz: "qor", bezak: "qalin" }), "ok", "apostrof varianti — matn o'zgarmagan");
  assert.equal(tur("Oppoq <b>qor</b> yogʻdi,<br>Bolalar quvondi.", { soz: "tuya", bezak: "qalin" }), "topilmadi");
  // Ikki buyruqdan biri bajarilmagan
  assert.equal(tur("Oppoq <b>qor</b> yogʻdi,<br>Bolalar quvondi.", [{ soz: "qor", bezak: "qalin" }, { soz: "quvondi", bezak: "binafsha" }]), "yoq");
  // Sabab maslahat — asbob nomi bor, lekin "xato" so'zi yo'q
  const s = L.bezakTekshir("Oppoq qor yogʻdi,<br>Bolalar quvondi.", { soz: "qor", bezak: "kok" }, m).sabab;
  assert.ok(s.includes("«Koʻk»") && !/xato/i.test(s), s);
});

test("beza: nishon so'z matnda bir marta, bezak turi ro'yxatdan, bezakHtml tekshiruvdan o'tadi, oddiy matn o'tmaydi", () => {
  const nimalar = { soz: 0, sarlavha: 0, gap: 0 };
  const bezaklar = {};
  for (const tier of [0, 1, 2]) {
    const list = each(L.bezaTask, 300, tier, 50 + tier);
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      assert.equal(t.tur, "beza");
      assert.equal(t.kutilgan.length, tier === 2 ? 2 : 1, t.id);
      assert.deepEqual(t.javob, tier === 2 ? t.kutilgan : t.kutilgan[0]);
      for (const k of t.kutilgan) {
        assert.ok(L.BEZAKLAR.includes(k.bezak), k.bezak);
        nimalar[k.nima]++;
        bezaklar[k.bezak] = (bezaklar[k.bezak] || 0) + 1;
        assert.ok(t.matn.includes(k.soz), `${k.soz} ∈ ${t.matn}`);
        // so'z (ibora) matnda bir marta
        const sozlar = L.sozlar(t.matn).map((x) => x.soz.toLowerCase());
        const nishon = L.sozlar(k.soz).map((x) => x.soz.toLowerCase());
        let n = 0;
        for (let p = 0; p + nishon.length <= sozlar.length; p++) if (nishon.every((w, j) => sozlar[p + j] === w)) n++;
        assert.equal(n, 1, `${k.soz} bir marta: ${t.matn}`);
        if (k.nima === "gap") assert.ok(!k.soz.endsWith("."), "gap nuqtasiz");
      }
      if (tier === 0) assert.equal(t.kutilgan[0].nima, "soz");
      if (tier === 1) assert.ok(t.kutilgan[0].nima !== "soz");
      if (tier === 2) {
        assert.notEqual(t.kutilgan[0].soz, t.kutilgan[1].soz);
        assert.notEqual(t.kutilgan[0].bezak, t.kutilgan[1].bezak);
      }
      assert.ok(t.buyruq.endsWith(" qil."), t.buyruq);
      const html = L.bezakHtml(t.matn, t.kutilgan);
      assert.equal(L.bezakTekshir(html, t.kutilgan, t.matn).tur, "ok", html);
      assert.equal(L.bezakTekshir(L.matnHtml(t.matn), t.kutilgan, t.matn).tur, "yoq");
      assert.equal(L.htmlMatn(html), t.matn, "bezak matnni o'zgartirmaydi");
      if (i) assert.notEqual(t.id, list[i - 1].id);
    }
  }
  assert.ok(nimalar.sarlavha > 40 && nimalar.gap > 40 && nimalar.soz > 100, JSON.stringify(nimalar));
  for (const b of L.BEZAKLAR) assert.ok(bezaklar[b] > 50, b);
});

test("buyruqYoz: so'z, sarlavha, gap, ikki buyruq", () => {
  assert.equal(L.buyruqYoz([{ soz: "Bahor", bezak: "qalin", nima: "soz" }]), "«Bahor» soʻzini qalin qil.");
  assert.equal(L.buyruqYoz([{ soz: "Mevalar", bezak: "kok", nima: "sarlavha" }]), "Sarlavhani koʻk qil.");
  assert.equal(L.buyruqYoz([{ soz: "Men boraman", bezak: "kursiv", nima: "gap", gap: 2 }]), "Ikkinchi gapni kursiv qil.");
  assert.equal(L.buyruqYoz([{ soz: "Olma", bezak: "qalin", nima: "soz" }, { soz: "Nok", bezak: "yashil", nima: "soz" }]), "«Olma» soʻzini qalin, «Nok» soʻzini yashil qil.");
});

// ---------- Hujjat nomi ----------
test("yangiNom va birinchiQator", () => {
  assert.equal(L.yangiNom("Xat", []), "Xat");
  assert.equal(L.yangiNom("Xat", ["Xat"]), "Xat 2");
  assert.equal(L.yangiNom("Xat", ["Xat", "Xat 2", "Sheʼr"]), "Xat 3");
  assert.equal(L.birinchiQator("\n  \nOppoq qor,\nBolalar."), "Oppoq qor,");
  assert.equal(L.birinchiQator(""), "");
  assert.equal(L.HUJJAT_CHEGARA, 10);
  assert.deepEqual(L.HUJJAT_NOMLARI, ["Sheʼr", "Xat", "Roʻyxat", "Hikoya"]);
});
