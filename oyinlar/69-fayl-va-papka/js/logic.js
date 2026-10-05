// 69-o'yin: fayl va papka — o'yinchoq kompyuterning «Fayllar» oynasi ortidagi daraxt:
// papkaga kirish, yo'l, yangi papka, nomlash, kesish / nusxa / qo'yish, o'chirish va savat.
// Holat amallari O'ZGARMAS uslubda: har amal YANGI holat qaytaradi, berilgan holatga tegmaydi.
// Amal bajarilmasa (bo'sh buferda «qo'yish», ildizda «orqaga»…) — o'sha holatning O'ZI qaytadi (y === h).
// Ekransiz sof mantiq; Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  function aralash(list, r) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // Ketma-ket bir xil misol chiqmasligi uchun (QOIDALAR 4.3). Generator null qaytarsa — qayta urinadi.
  function pickNew(make, prev, r) {
    let zaxira = null;
    for (let k = 0; k < 400; k++) {
      const task = make(r);
      if (!task) continue;
      if (!prev || task.id !== prev.id) return task;
      zaxira = task;
    }
    if (zaxira) return zaxira;
    throw new Error("Misol yasab boʻlmadi");
  }

  // ---------- Fayl turlari va nomlar ----------
  const TURLAR = ["rasm", "matn", "musiqa", "video"];
  const KENGAYTMA = { rasm: ".jpg", matn: ".txt", musiqa: ".mp3", video: ".mp4" };
  const TUR_NOMI = { rasm: "Rasm", matn: "Matn", musiqa: "Musiqa", video: "Video" };
  const PAPKA_NOMI = { rasm: "Rasmlar", matn: "Matnlar", musiqa: "Musiqa", video: "Videolar" };
  const TUSHUM = { rasm: "rasmini", matn: "matnini", musiqa: "musiqasini", video: "videosini" };

  // Bolaga tanish, qisqa so'zlar (asosi ≤ 9 harf — belgi ostiga sig'adi). Hamma tur bo'yicha takrorlanmaydi.
  const NOMLAR = {
    rasm: ["olma", "gul", "mushuk", "quyosh", "togʻ", "uy", "kapalak", "daraxt", "koʻl", "bayroq", "ot", "qush"],
    matn: ["xat", "ertak", "sheʼr", "roʻyxat", "dars", "tabrik", "topishmoq", "kundalik", "reja", "maqol", "hikoya", "insho"],
    musiqa: ["qoʻshiq", "kuy", "alla", "madhiya", "doira", "nagʻma", "rubob", "marsh", "karnay", "yalla", "dutor", "nay"],
    video: ["multfilm", "kino", "sayohat", "bayram", "konsert", "futbol", "raqs", "sirk", "toʻy", "parad", "poyga", "kulgi"],
  };
  // Qiyin savol: so'z bir turni eslatadi, lekin nom oxiri boshqasini aytadi — nom oxiri hal qiladi
  const CHALGITUVCHI = [
    { nom: "qoʻshiq.txt", tur: "matn" }, { nom: "kino.txt", tur: "matn" }, { nom: "futbol.txt", tur: "matn" },
    { nom: "xat.jpg", tur: "rasm" }, { nom: "multfilm.jpg", tur: "rasm" }, { nom: "ertak.jpg", tur: "rasm" },
    { nom: "raqs.mp3", tur: "musiqa" }, { nom: "bayram.mp3", tur: "musiqa" }, { nom: "toʻy.mp3", tur: "musiqa" },
    { nom: "gul.mp4", tur: "video" }, { nom: "dars.mp4", tur: "video" }, { nom: "qoʻshiq.mp4", tur: "video" },
  ];
  const USTKI = ["Hujjatlar", "Maktab", "Oila", "Doʻstlar"]; // ustki papkalar (chuqurlik uchun)
  const FASL = ["Bahor", "Yoz", "Kuz", "Qish"];
  const ZAXIRA = "Zaxira";
  // Nom berish — tayyor nomlardan tanlash (harf terilmaydi)
  const PAPKA_TAKLIF = ["Rasmlar", "Matnlar", "Musiqa", "Videolar", "Oʻyinlar", "Har xil"];
  const ILDIZ = "ildiz";

  const kengaytma = (nom) => {
    const i = nom.lastIndexOf(".");
    return i > 0 ? nom.slice(i) : "";
  };
  // Fayl turi nom oxiridan; papka yoki notanish nom — null
  const turi = (nom) => TURLAR.find((t) => KENGAYTMA[t] === kengaytma(nom)) || null;

  // ---------- Daraxt va holat ----------
  // Tugun: { id, nom, tur: "papka" | "rasm" | "matn" | "musiqa" | "video", ichi: [] } (faylda ichi doim bo'sh;
  //         nusxada yana asl — asl faylning id si).
  // Holat: { ildiz, joriy, tanlangan, bufer: { id, amal: "nusxa" | "kesish" } | null,
  //          savat: [{ tugun, ota }], keyingi } — keyingi: yangi tugunlar uchun sanoq (id tasodifsiz chiqadi).

  // Daraxtni qo'lda yozish: P("Rasmlar", "olma.jpg", P("Eski")) — satr fayl bo'ladi
  const P = (nom, ...ichi) => ({ nom, tur: "papka", ichi });

  function holatYasa(ichi) {
    let n = 0;
    const yasa = (x) => {
      const id = "t" + (++n);
      if (typeof x !== "string") return { id, nom: x.nom, tur: "papka", ichi: x.ichi.map(yasa) };
      if (!turi(x)) throw new Error("Nomaʼlum fayl turi: " + x);
      return { id, nom: x, tur: turi(x), ichi: [] };
    };
    return {
      ildiz: { id: ILDIZ, nom: "Kompyuter", tur: "papka", ichi: ichi.map(yasa) },
      joriy: ILDIZ, tanlangan: null, bufer: null, savat: [], keyingi: 1,
    };
  }

  function kez(tugun, fn) {
    fn(tugun);
    for (const b of tugun.ichi) kez(b, fn);
  }
  // Ildizdan tugungacha zanjir: [ildiz, …, tugun]; topilmasa — null
  function zanjirTop(tugun, id) {
    if (tugun.id === id) return [tugun];
    for (const b of tugun.ichi) {
      const z = zanjirTop(b, id);
      if (z) return [tugun].concat(z);
    }
    return null;
  }
  const zanjir = (h, id) => zanjirTop(h.ildiz, id) || [];
  const top = (h, id) => zanjir(h, id).slice(-1)[0] || null;
  const otasi = (h, id) => zanjir(h, id).slice(-2, -1)[0] || null;
  function hammasi(h) {
    const out = [];
    kez(h.ildiz, (t) => out.push(t));
    return out;
  }
  const fayllari = (h) => hammasi(h).filter((t) => t.tur !== "papka");
  const nomBilan = (h, nom) => hammasi(h).find((t) => t.nom === nom) || null;
  const ichidami = (tugun, id) => !!zanjirTop(tugun, id);
  // Joriy papkada ko'rinadiganlar: avval papkalar, keyin fayllar (kompyuterdagidek)
  function korinadi(h) {
    const ichi = top(h, h.joriy).ichi;
    return ichi.filter((t) => t.tur === "papka").concat(ichi.filter((t) => t.tur !== "papka"));
  }

  // ---------- So'rovlar ----------
  // Yo'l: ildizdan boshlab nomlar — ["Kompyuter", "Hujjatlar", "Rasmlar"]; daraxtda yo'q narsa — []
  const yol = (h, id) => zanjir(h, id).map((t) => t.nom);
  const yolMatn = (h, id) => yol(h, id).join(" › ");
  // Faylgacha ochiladigan papkalar (ildizsiz) — id lar
  const papkaYoli = (h, id) => zanjir(h, id).slice(1, -1).map((t) => t.id);
  // Fayl ildizdan nechta papka ichkarida: ildizning o'zida — 0
  const chuqurlik = (h, id) => Math.max(0, zanjir(h, id).length - 2);
  // Narsa qayerda: turgan papkasining id si, "savat" yoki null (yo'q; ildizning o'zi ham null)
  function qayerda(h, id) {
    const o = otasi(h, id);
    if (o) return o.id;
    return h.savat.some((s) => ichidami(s.tugun, id)) ? "savat" : null;
  }
  // Tugun — shu faylning o'zi yoki nusxasi
  const oila = (t, id) => t.id === id || t.asl === id;
  // Nom chiplari: joriy papkada hali band bo'lmagan tayyor nomlar
  function nomTakliflari(h) {
    const band = new Set(top(h, h.joriy).ichi.map((t) => t.nom));
    return PAPKA_TAKLIF.filter((n) => !band.has(n));
  }

  // ---------- Amallar (yangi holat qaytaradi) ----------
  const tugunNusxa = (t) => ({ ...t, ichi: t.ichi.map(tugunNusxa) });
  const klon = (h) => ({
    ...h,
    ildiz: tugunNusxa(h.ildiz),
    bufer: h.bufer ? { ...h.bufer } : null,
    savat: h.savat.map((s) => ({ ota: s.ota, tugun: tugunNusxa(s.tugun) })),
  });

  // Papkada bir xil nom ikki marta bo'lmaydi: "xat.txt" → "xat (2).txt", "Rasmlar" → "Rasmlar (2)"
  function boshNom(papka, nom) {
    const band = new Set(papka.ichi.map((t) => t.nom));
    if (!band.has(nom)) return nom;
    const k = turi(nom) ? kengaytma(nom) : "";
    const asos = (k ? nom.slice(0, -k.length) : nom).replace(/ \(\d+\)$/, "");
    for (let n = 2; ; n++) {
      const yangi = `${asos} (${n})${k}`;
      if (!band.has(yangi)) return yangi;
    }
  }

  // Papkaga kirish (ikki marta bosish)
  function kir(h, id) {
    const t = top(h, id);
    if (!t || t.tur !== "papka" || id === h.joriy) return h;
    return { ...h, joriy: id, tanlangan: null };
  }

  function orqaga(h) {
    const o = otasi(h, h.joriy);
    return o ? { ...h, joriy: o.id, tanlangan: null } : h;
  }

  // Bitta bosish — tanlash; faqat joriy papkadagi narsa tanlanadi. null — tanlovni olib tashlash
  function tanla(h, id) {
    if (id == null) return h.tanlangan == null ? h : { ...h, tanlangan: null };
    if (h.tanlangan === id || !top(h, h.joriy).ichi.some((t) => t.id === id)) return h;
    return { ...h, tanlangan: id };
  }

  function yangiPapka(h, nom) {
    if (!nom) return h;
    const y = klon(h);
    const joy = top(y, y.joriy);
    const t = { id: "n" + y.keyingi++, nom: boshNom(joy, nom), tur: "papka", ichi: [] };
    joy.ichi.push(t);
    y.tanlangan = t.id;
    return y;
  }

  // id berilmasa — tanlangan narsa. Yonida shu nomli narsa bo'lsa, nom o'zgarmaydi
  function nomla(h, nom, id) {
    const kim = id == null ? h.tanlangan : id;
    const t = kim == null ? null : top(h, kim);
    const o = t ? otasi(h, kim) : null;
    if (!o || !nom || t.nom === nom || o.ichi.some((x) => x.nom === nom)) return h;
    const y = klon(h);
    top(y, kim).nom = nom;
    return y;
  }

  function buferga(h, id, amal) {
    const kim = id == null ? h.tanlangan : id;
    if (kim == null || !otasi(h, kim)) return h; // yo'q narsa yoki ildiz
    if (h.bufer && h.bufer.id === kim && h.bufer.amal === amal) return h;
    return { ...h, bufer: { id: kim, amal } };
  }
  const nusxa = (h, id) => buferga(h, id, "nusxa");
  const kes = (h, id) => buferga(h, id, "kesish");

  // Qo'yib bo'ladimi: buferda narsa bor va papka o'zining ichiga qo'yilmayapti
  function qoyMumkin(h) {
    const manba = h.bufer ? top(h, h.bufer.id) : null;
    return !!manba && !ichidami(manba, h.joriy);
  }

  function yangiNusxa(y, t) {
    const id = "n" + y.keyingi++;
    return { ...t, id, asl: t.asl || t.id, ichi: t.ichi.map((b) => yangiNusxa(y, b)) };
  }

  // Joriy papkaga qo'yish. Kesilgan narsa ko'chadi (bitta qoladi, bufer bo'shaydi);
  // nusxa — yangi tugun (ikkita bo'ladi, yana qo'yish mumkin). Nom to'qnashsa — " (2)".
  function qoy(h) {
    if (!qoyMumkin(h)) return h;
    const y = klon(h);
    const nishon = top(y, y.joriy);
    let tugun = top(y, y.bufer.id);
    if (y.bufer.amal === "kesish") {
      const eski = otasi(y, tugun.id);
      if (eski.id !== nishon.id) {
        eski.ichi = eski.ichi.filter((t) => t.id !== tugun.id);
        tugun.nom = boshNom(nishon, tugun.nom);
        nishon.ichi.push(tugun);
      }
      y.bufer = null;
    } else {
      tugun = yangiNusxa(y, tugun);
      tugun.nom = boshNom(nishon, tugun.nom);
      nishon.ichi.push(tugun);
    }
    y.tanlangan = tugun.id;
    return y;
  }

  // O'chirilgan narsa yo'qolmaydi — savatga tushadi (qaysi papkadan olingani bilan)
  function ochir(h, id) {
    const kim = id == null ? h.tanlangan : id;
    if (kim == null || !otasi(h, kim)) return h;
    const y = klon(h);
    const tugun = top(y, kim);
    const o = otasi(y, kim);
    o.ichi = o.ichi.filter((t) => t.id !== kim);
    y.savat.push({ tugun, ota: o.id });
    if (y.bufer && ichidami(tugun, y.bufer.id)) y.bufer = null;
    if (ichidami(tugun, y.joriy)) y.joriy = o.id;
    if (y.tanlangan != null && !top(y, y.joriy).ichi.some((t) => t.id === y.tanlangan)) y.tanlangan = null;
    return y;
  }

  // Savatdan qaytarish: narsa o'chirilgan papkasiga qaytadi (u papka endi yo'q bo'lsa — «Kompyuter»ga)
  function tikla(h, id) {
    const k = h.savat.findIndex((s) => s.tugun.id === id);
    if (k < 0) return h;
    const y = klon(h);
    const s = y.savat.splice(k, 1)[0];
    const o = top(y, s.ota);
    const joy = o && o.tur === "papka" ? o : y.ildiz;
    s.tugun.nom = boshNom(joy, s.tugun.nom);
    joy.ichi.push(s.tugun);
    return y;
  }

  // Amallar ketma-ketligini bajarish (namunali yechim, avtomat o'ynovchi).
  // Qadam: { amal, id } yoki { amal, nomi } — nomi: joriy papkadagi narsaning nomi
  // (yangi yaratilgan papkaning id si oldindan ma'lum emas); yangiPapka va nomla da nom — beriladigan nom.
  function bajar(h, qadamlar) {
    let y = h;
    for (const q of qadamlar) {
      const id = q.nomi != null ? (top(y, y.joriy).ichi.find((t) => t.nom === q.nomi) || {}).id : q.id;
      if (q.amal === "kir") y = kir(y, id);
      else if (q.amal === "orqaga") y = orqaga(y);
      else if (q.amal === "tanla") y = tanla(y, id);
      else if (q.amal === "yangiPapka") y = yangiPapka(y, q.nom);
      else if (q.amal === "nomla") y = nomla(y, q.nom, id);
      else if (q.amal === "nusxa") y = nusxa(y, id);
      else if (q.amal === "kes") y = kes(y, id);
      else if (q.amal === "qoy") y = qoy(y);
      else if (q.amal === "ochir") y = ochir(y, id);
      else if (q.amal === "tikla") y = tikla(y, id);
      else throw new Error("Nomaʼlum amal: " + q.amal);
    }
    return y;
  }

  // ---------- Maqsad tekshiruvlari: { ok, qolgan } — qolgan: nechta narsa hali joyida emas ----------
  const natija = (qolgan) => ({ ok: qolgan === 0, qolgan });

  // Har fayl o'z turiga mos nomli papkada (savatga tushgan yoki sochilib yotgan fayl — joyida emas)
  function tartibTekshir(h, task) {
    let qolgan = 0;
    for (const id of task.fayllar) {
      const t = top(h, id);
      const o = otasi(h, id);
      if (!t || !o || o.nom !== PAPKA_NOMI[t.tur]) qolgan++;
    }
    return natija(qolgan);
  }

  // Fayl ikkita: biri (o'zi yoki nusxasi) asl papkasida, biri nishon papkada
  function nusxaTekshir(h, task) {
    const bor = (papkaId) => {
      const p = top(h, papkaId);
      return !!p && p.ichi.some((t) => oila(t, task.fayl));
    };
    return natija((bor(task.asliJoy) ? 0 : 1) + (bor(task.nishon) ? 0 : 1));
  }

  // Aynan aytilgan fayllar (va nusxalari) savatda; boshqa hech narsa o'chirilmagan
  function ochirTekshir(h, task) {
    const kerak = (t) => task.fayllar.some((id) => oila(t, id));
    let qolgan = 0;
    kez(h.ildiz, (t) => { if (kerak(t)) qolgan++; });
    for (const s of h.savat) kez(s.tugun, (t) => { if (!kerak(t)) qolgan++; });
    return natija(qolgan);
  }

  // Aytilgan fayllar asl papkasiga qaytgan; savatda qolishi kerak bo'lganlari — savatda
  function tiklaTekshir(h, task) {
    let qolgan = 0;
    for (const id of task.fayllar) if (qayerda(h, id) !== task.joylar[id]) qolgan++;
    for (const id of task.qolsin) if (qayerda(h, id) !== "savat") qolgan++;
    return natija(qolgan);
  }

  const TEKSHIR = { tartibla: tartibTekshir, nusxa: nusxaTekshir, ochir: ochirTekshir, tikla: tiklaTekshir };
  const maqsad = (h, task) => TEKSHIR[task.tur](h, task);

  // 1-xatodagi maslahat: nechta narsa joyida emasligini aytadi — qaysiligini emas
  function maslahat(task, n) {
    if (task.tur === "tartibla") return `${n.qolgan} ta fayl hali oʻz joyida emas. Fayl turiga va papka nomiga qara.`;
    const bosh = `${n.qolgan} ta narsa hali joyida emas. `;
    if (task.tur === "nusxa") return bosh + "Nusxada fayl ikkita boʻladi: biri eski joyida, biri yangi joyda.";
    if (task.tur === "ochir") return bosh + "Savatni ochib koʻr: u yerda faqat keraksizlari yotsin.";
    return bosh + "Savatni och, faylni tanla va «Qaytarish»ni bos.";
  }

  // 2-xatodagi yechim: to'g'ri yakuniy holat — papkalar (yoki savat) va ichidagi fayllar ro'yxati
  function yechimXulosa(task) {
    const h = bajar(task.holat, task.yechim);
    const fayl = (t) => ({ nom: t.nom, tur: t.tur });
    const qator = (p) => ({ nom: p.nom, belgi: "papka", ichi: p.ichi.filter((t) => t.tur !== "papka").map(fayl) });
    const savat = () => ({ nom: "Savat", belgi: h.savat.length ? "savat-tola" : "savat", ichi: h.savat.map((s) => fayl(s.tugun)) });
    if (task.tur === "tartibla") return h.ildiz.ichi.filter((t) => t.tur === "papka").map(qator);
    if (task.tur === "nusxa") return [task.asliJoy, task.nishon].map((id) => qator(top(h, id)));
    if (task.tur === "ochir") return [savat()];
    const joylar = [...new Set(task.fayllar.map((id) => task.joylar[id]))];
    return joylar.map((id) => qator(top(h, id))).concat(task.qolsin.length ? [savat()] : []);
  }

  // ---------- Generatorlar uchun yordamchilar ----------
  // Shu turdagi, hali ishlatilmagan `soni` ta fayl nomi (bitta daraxtda nom takrorlanmaydi)
  function nomlar(tur, soni, band, r) {
    const out = [];
    for (let k = 0; k < soni; k++) {
      const nom = pick(NOMLAR[tur].map((n) => n + KENGAYTMA[tur]).filter((n) => !band.has(n)), r);
      band.add(nom);
      out.push(nom);
    }
    return out;
  }

  // `soni` ta har xil turdagi papka, har birida shu turdagi fayllar
  const turPapkalar = (soni, nechta, band, r) => aralash(TURLAR, r).slice(0, soni)
    .map((tur) => P(PAPKA_NOMI[tur], ...nomlar(tur, nechta(), band, r)));

  // 1-bosqich daraxti. Chuqurlik tier bilan o'sadi: fayl ildizdan 1 → 2 → 3 papka ichkarida
  function daraxt(t, r) {
    const band = new Set();
    if (t <= 0) return turPapkalar(3, () => int(r, 2, 3), band, r);
    const ustki = aralash(USTKI, r).slice(0, 2);
    if (t === 1) return ustki.map((nom) => P(nom, ...turPapkalar(2, () => int(r, 2, 3), band, r)));
    return ustki.map((nom) => P(nom, ...aralash(FASL, r).slice(0, 2).map((f) => P(f, ...turPapkalar(2, () => 2, band, r)))));
  }

  // «a», «b» va «c»
  function sanab(list) {
    const q = list.map((n) => `«${n}»`);
    return q.length < 2 ? q[0] : q.slice(0, -1).join(", ") + " va " + q[q.length - 1];
  }

  // Faylgacha borib, ustida amal qilib, qaytib chiqish (namunali yechim bo'lagi)
  const boribQil = (h, id, ...amallar) => {
    const yoli = papkaYoli(h, id);
    return yoli.map((p) => ({ amal: "kir", id: p })).concat([{ amal: "tanla", id }], amallar, yoli.map(() => ({ amal: "orqaga" })));
  };

  // ---------- 1-bosqich: fayl, papka va yo'l ----------
  // Faylni top va och. javob — fayl id si; papkalar — unga olib boradigan papkalar (avtomat o'ynovchi uchun)
  function topTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      const holat = holatYasa(daraxt(t, rr));
      const f = pick(fayllari(holat), rr);
      const joy = yolMatn(holat, otasi(holat, f.id).id);
      return {
        tur: "top", id: `top:${joy}:${f.nom}`, holat, fayl: f.nom, javob: f.id, joy,
        papkalar: papkaYoli(holat, f.id),
        // Bitta qavatda papka nomi fayl turini aytadi; chuqurroqda yo'l beriladi (bir xil nomli papkalar bor)
        matn: `«${f.nom}» ${TUSHUM[f.tur]} top va och.` + (t > 0 ? ` Yoʻli: ${joy}.` : ""),
        ishora: t > 0 ? "Yoʻlni chapdan oʻngga oʻqi: har soʻz — bitta papka."
          : "Nom oxiri fayl turini aytadi: shu turdagi papkani och.",
        nega: `«${f.nom}» shu yerda: ${joy}.`,
      };
    }, prev, r);
  }

  // Bu fayl nima? — 4 variant. tier 0: belgisi ham ko'rinadi; tier 1: faqat nom; tier 2: chalg'ituvchi nom
  function turTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      let x;
      if (t === 2) {
        x = pick(CHALGITUVCHI, rr);
      } else {
        const tur = pick(TURLAR, rr);
        x = { nom: pick(NOMLAR[tur], rr) + KENGAYTMA[tur], tur };
      }
      return {
        tur: "tur", id: `tur:${x.nom}`, fayl: x.nom, faylTuri: x.tur, belgi: t === 0,
        matn: `«${x.nom}» — bu nima?`,
        variantlar: TURLAR.map((k) => TUR_NOMI[k]), javob: TUR_NOMI[x.tur],
        ishora: "Nom oxiriga qara: nuqtadan keyingi harflar fayl turini aytadi.",
        nega: `Nom oxiri «${KENGAYTMA[x.tur]}» — bu ${TUR_NOMI[x.tur].toLowerCase()}.`,
      };
    }, prev, r);
  }

  // Fayl yo'lini 4 variantdan tanlash (faqat tier 2). Variantlar — daraxtdagi to'rtta haqiqiy papka yo'li
  function yolTask(r, prev, tier) {
    if ((tier || 0) < 2) return topTask(r, prev, tier);
    return pickNew((rr) => {
      const holat = holatYasa(daraxt(1, rr));
      const f = pick(fayllari(holat), rr);
      const javob = yolMatn(holat, otasi(holat, f.id).id);
      const fayllilar = hammasi(holat).filter((p) => p.ichi.some((b) => b.tur !== "papka"));
      return {
        tur: "yol", id: `yol:${javob}:${f.nom}`, holat, fayl: f.nom, faylId: f.id,
        papkalar: papkaYoli(holat, f.id),
        matn: `«${f.nom}» qaysi papkada turibdi? Yoʻlini tanla.`,
        variantlar: aralash(fayllilar.map((p) => yolMatn(holat, p.id)), rr), javob,
        ishora: "Faylni oynada oʻzing top. Topgach, yoʻl satrini oʻqi.",
        nega: `«${f.nom}» yoʻli: ${javob}.`,
      };
    }, prev, r);
  }

  // ---------- 2-bosqich: tartibga solamiz ----------
  const ASBOB2 = [["orqaga", "kes", "qoy"], ["orqaga", "yangi", "nomla", "kes", "qoy"], ["orqaga", "yangi", "nomla", "kes", "qoy"]];
  const TARTIB_MATN = [
    "Fayllar sochilib yotibdi. Har birini oʻz turidagi papkaga koʻchir.",
    "Fayllarni turiga mos papkaga koʻchir. Bitta papka yoʻq — uni oʻzing yarat.",
    "Fayllarni turiga mos papkaga koʻchir. Bitta papkaning nomi ichidagiga mos emas — uni oʻzgartir.",
  ];

  // Sochilgan fayllarni turiga mos papkaga ko'chirish. tier 0 — papkalar tayyor, 2 tur; tier 1 — bitta papkani
  // bola o'zi yaratadi; tier 2 — 3 tur, bitta papka (ichida fayllari bilan) boshqa turning nomi bilan turibdi.
  function tartiblaTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      const band = new Set();
      const tartib = aralash(TURLAR, rr);
      const turlar = tartib.slice(0, t === 2 ? 3 : 2);
      const boshqa = PAPKA_NOMI[tartib[3]]; // ishlatilmagan turning papka nomi — tier 2 da "mos emas" nom
      const yoq = t === 1 ? pick(turlar, rr) : null;
      const almash = t === 2 ? pick(turlar, rr) : null;
      const sochilgan = [];
      turlar.forEach((tur, k) => sochilgan.push(...nomlar(tur, t < 2 && k === 0 ? 2 : 1, band, rr)));
      const papkalar = turlar.filter((tur) => tur !== yoq)
        .map((tur) => (tur === almash ? P(boshqa, ...nomlar(tur, 2, band, rr)) : P(PAPKA_NOMI[tur])));
      const holat = holatYasa(papkalar.concat(aralash(sochilgan, rr)));

      const yechim = [];
      if (yoq) yechim.push({ amal: "yangiPapka", nom: PAPKA_NOMI[yoq] });
      if (almash) yechim.push({ amal: "tanla", nomi: boshqa }, { amal: "nomla", nom: PAPKA_NOMI[almash] });
      for (const f of holat.ildiz.ichi.filter((x) => x.tur !== "papka")) {
        yechim.push({ amal: "tanla", id: f.id }, { amal: "kes" }, { amal: "kir", nomi: PAPKA_NOMI[f.tur] }, { amal: "qoy" }, { amal: "orqaga" });
      }
      return {
        tur: "tartibla", id: `tartibla:${t}:${holat.ildiz.ichi.map((x) => x.nom).join(",")}`, holat,
        turlar, fayllar: fayllari(holat).map((f) => f.id), yoq, almash,
        asboblar: ASBOB2[t], savat: false, tezkor: false,
        matn: TARTIB_MATN[t], javob: yechim, yechim,
      };
    }, prev, r);
  }

  // ---------- 3-bosqich: nusxa, o'chirish va savat ----------
  const ASBOB3 = ["orqaga", "nusxa", "kes", "qoy", "ochir"];

  // Fayldan nusxa olib «Zaxira»ga qo'yish. tier 0 — fayl va «Zaxira» yonma-yon; tier 1 — fayl papka ichida;
  // tier 2 — fayl ikki papka ichkarida, «Zaxira»da boshqa fayl ham bor.
  function nusxaTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      const band = new Set();
      const [a, b, c] = aralash(TURLAR, rr);
      const nom = nomlar(a, 1, band, rr)[0];
      let ichi;
      if (t === 0) {
        ichi = [P(ZAXIRA)].concat(aralash([nom].concat(nomlar(b, 1, band, rr), nomlar(c, 1, band, rr)), rr));
      } else {
        const turli = aralash([
          P(PAPKA_NOMI[a], ...aralash([nom].concat(nomlar(a, 1, band, rr)), rr)),
          P(PAPKA_NOMI[b], ...nomlar(b, 2, band, rr)),
        ], rr);
        ichi = t === 1 ? turli.concat([P(ZAXIRA)]) : [P(pick(USTKI, rr), ...turli), P(ZAXIRA, ...nomlar(c, 1, band, rr))];
      }
      const holat = holatYasa(ichi);
      const f = nomBilan(holat, nom);
      const nishon = nomBilan(holat, ZAXIRA).id;
      const yechim = boribQil(holat, f.id, { amal: "nusxa" }).concat([{ amal: "kir", id: nishon }, { amal: "qoy" }]);
      return {
        tur: "nusxa", id: `nusxa:${t}:${nom}`, holat, fayl: f.id, faylNomi: nom,
        asliJoy: otasi(holat, f.id).id, nishon,
        asboblar: ASBOB3, savat: true, tezkor: true,
        matn: `«${nom}»dan nusxa ol va «${ZAXIRA}» papkasiga qoʻy. Asli oʻz joyida qolsin.`,
        javob: yechim, yechim,
      };
    }, prev, r);
  }

  // 3-bosqich daraxti: tur papkalari (ichida fayllar) va yonida sochma fayllar
  function aralashDaraxt(t, r) {
    const band = new Set();
    const [a, b, c] = aralash(TURLAR, r);
    const papkalar = [P(PAPKA_NOMI[a], ...nomlar(a, t === 0 ? 2 : 3, band, r))];
    if (t > 0) papkalar.push(P(PAPKA_NOMI[b], ...nomlar(b, t === 1 ? 2 : 3, band, r)));
    const sochma = nomlar(c, 1, band, r).concat(nomlar(t === 0 ? b : c, 1, band, r));
    return holatYasa(papkalar.concat(aralash(sochma, r)));
  }

  // Aytilgan fayllarni o'chirish: tier 0 — bitta (ko'rinib turibdi); tier 1 — ikkita (biri papka ichida);
  // tier 2 — uchta (ikkitasi ikki xil papka ichida).
  function ochirTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      const holat = aralashDaraxt(t, rr);
      const papkalar = holat.ildiz.ichi.filter((x) => x.tur === "papka");
      let nishonlar = [pick(holat.ildiz.ichi.filter((x) => x.tur !== "papka"), rr)];
      if (t === 1) nishonlar.push(pick(pick(papkalar, rr).ichi, rr));
      if (t === 2) nishonlar.push(...papkalar.map((p) => pick(p.ichi, rr)));
      nishonlar = aralash(nishonlar, rr);
      const nomi = nishonlar.map((f) => f.nom);
      const yechim = [].concat(...nishonlar.map((f) => boribQil(holat, f.id, { amal: "ochir" })));
      return {
        tur: "ochir", id: `ochir:${t}:${nomi.join(",")}`, holat, fayllar: nishonlar.map((f) => f.id), faylNomlari: nomi,
        asboblar: ASBOB3, savat: true, tezkor: true,
        matn: nomi.length === 1 ? `«${nomi[0]}» endi kerak emas. Uni oʻchir.`
          : `Bu fayllar endi kerak emas: ${sanab(nomi)}. Ularni oʻchir.`,
        javob: yechim, yechim,
      };
    }, prev, r);
  }

  // Savatdan qaytarish: tier 0 — savatda bitta fayl; tier 1 — ikkita, faqat bittasi kerak;
  // tier 2 — uchta, ikkitasi kerak. Qolgani savatda qolishi shart ("faqat").
  function tiklaTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      const asl = aralashDaraxt(t, rr);
      const ochgan = aralash(fayllari(asl), rr).slice(0, t + 1);
      const joylar = {};
      let holat = asl;
      for (const f of ochgan) {
        joylar[f.id] = qayerda(asl, f.id);
        holat = ochir(holat, f.id);
      }
      const kerak = ochgan.slice(0, t === 2 ? 2 : 1);
      const nomi = kerak.map((f) => f.nom);
      const yechim = kerak.map((f) => ({ amal: "tikla", id: f.id }));
      return {
        tur: "tikla", id: `tikla:${t}:${ochgan.map((f) => f.nom).join(",")}`, holat,
        fayllar: kerak.map((f) => f.id), faylNomlari: nomi, joylar, qolsin: ochgan.slice(kerak.length).map((f) => f.id),
        asboblar: ASBOB3, savat: true, tezkor: true,
        matn: t === 0 ? `«${nomi[0]}» adashib oʻchirilgan. Uni savatdan qaytar.`
          : t === 1 ? `«${nomi[0]}» adashib oʻchirilgan. Savatdan faqat shuni qaytar.`
            : `Savatdan faqat ${sanab(nomi)}ni qaytar. Qolgani savatda qolsin.`,
        javob: yechim, yechim,
      };
    }, prev, r);
  }

  const BOSQICH1 = [topTask, turTask, yolTask, turTask];
  const BOSQICH2 = [tartiblaTask];
  const BOSQICH3 = [nusxaTask, ochirTask, tiklaTask];

  // n — nechanchi to'g'ri javob (mashq turi navbati), tier — qiyinlik zinasi
  const navbat = (bank) => (r, prev, n, tier) => bank[(n || 0) % bank.length](r, prev, tier);

  const api = {
    TURLAR, KENGAYTMA, TUR_NOMI, PAPKA_NOMI, NOMLAR, CHALGITUVCHI, USTKI, FASL, ZAXIRA, PAPKA_TAKLIF, ILDIZ,
    ASBOB2, ASBOB3, BOSQICH1, BOSQICH2, BOSQICH3,
    aralash, kengaytma, turi, P, holatYasa,
    top, otasi, hammasi, fayllari, nomBilan, ichidami, korinadi,
    yol, yolMatn, papkaYoli, chuqurlik, qayerda, oila, nomTakliflari,
    kir, orqaga, tanla, yangiPapka, nomla, nusxa, kes, qoyMumkin, qoy, ochir, tikla, bajar,
    tartibTekshir, nusxaTekshir, ochirTekshir, tiklaTekshir, maqsad, maslahat, yechimXulosa, sanab,
    topTask, turTask, yolTask, tartiblaTask, nusxaTask, ochirTask, tiklaTask,
    bosqich1Task: navbat(BOSQICH1), bosqich2Task: navbat(BOSQICH2), bosqich3Task: navbat(BOSQICH3),
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
