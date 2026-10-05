// 60-o'yin: paket yo'li — tugunlar to'ri (4×3 dan oshmaydi), eng qisqa yo'l (kenglik bo'yicha qidiruv),
// sim uzilganda boshqa yo'l, mijoz–server so'rovlari va server navbati.
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

  // Ketma-ket bir xil misol chiqmasligi uchun (QOIDALAR 4.3). Generator null qaytarsa (shart bajarilmadi) — qayta urinadi.
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

  // ---------- To'r ----------
  const USTUN = 4;
  const QATOR = 3;
  const HARF = "ABCDEFGHIJKL";
  const harf = (i) => HARF[i];
  const joy = (i) => ({ c: i % USTUN, r: Math.floor(i / USTUN) });
  const sim = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  const simNomi = (s) => s.split("-").map((x) => harf(Number(x))).join("–");

  // Yonma-yon (gorizontal va vertikal) simlar
  function tolaSimlar() {
    const out = [];
    for (let i = 0; i < USTUN * QATOR; i++) {
      const { c, r } = joy(i);
      if (c < USTUN - 1) out.push(sim(i, i + 1));
      if (r < QATOR - 1) out.push(sim(i, i + USTUN));
    }
    return out;
  }
  // Qo'shimcha qiya simlar to'plamlari (to'r shakli har xil bo'lsin)
  const QIYA = [[], [sim(0, 5), sim(6, 11)], [sim(1, 4), sim(2, 7), sim(5, 10)], [sim(3, 6), sim(4, 9)]];

  function qoshnilar(simlar, i) {
    const out = [];
    for (const s of simlar) {
      const [a, b] = s.split("-").map(Number);
      if (a === i) out.push(b);
      else if (b === i) out.push(a);
    }
    return out.sort((x, y) => x - y);
  }

  // Kenglik bo'yicha qidiruv: masofa (qadamlar) va bitta eng qisqa yo'l; yetib bo'lmasa — masofa -1
  function bfs(simlar, a, b) {
    const oldingi = new Map([[a, null]]);
    const navbat = [a];
    while (navbat.length) {
      const x = navbat.shift();
      if (x === b) break;
      for (const y of qoshnilar(simlar, x)) {
        if (!oldingi.has(y)) {
          oldingi.set(y, x);
          navbat.push(y);
        }
      }
    }
    if (!oldingi.has(b)) return { masofa: -1, yol: [] };
    const yol = [];
    for (let x = b; x !== null; x = oldingi.get(x)) yol.unshift(x);
    return { masofa: yol.length - 1, yol };
  }
  const masofa = (simlar, a, b) => bfs(simlar, a, b).masofa;

  function boglanganmi(simlar, tugunlar) {
    const r = tugunlar[0];
    return tugunlar.every((t) => masofa(simlar, r, t) >= 0);
  }

  // Tasodifiy to'r: to'la simlar + qiya to'plam, keyin bog'langanlik saqlanib bir nechta sim olinadi
  function tor(r) {
    const tugunlar = Array.from({ length: USTUN * QATOR }, (_, i) => i);
    let simlar = tolaSimlar().concat(pick(QIYA, r));
    const olish = int(r, 3, 5);
    let olindi = 0;
    for (const s of aralash(simlar, r)) {
      if (olindi >= olish) break;
      const qoldi = simlar.filter((x) => x !== s);
      if (boglanganmi(qoldi, tugunlar)) {
        simlar = qoldi;
        olindi++;
      }
    }
    return { tugunlar, simlar: simlar.sort() };
  }

  // Masofasi oraliqda bo'lgan tasodifiy juftlik
  function juft(t, r, min, max) {
    const juftlar = [];
    for (const a of t.tugunlar) for (const b of t.tugunlar) {
      const d = masofa(t.simlar, a, b);
      if (a !== b && d >= min && d <= max) juftlar.push([a, b]);
    }
    return juftlar.length ? pick(juftlar, r) : null;
  }

  const ORALIQ = [[2, 3], [3, 4], [4, 6]];

  // ---------- 1-bosqich: qo'lda uzatish ----------
  function qadamTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = tor(rr);
      const [min, max] = ORALIQ[Math.min(tier || 0, 2)];
      const j = juft(t, rr, min, max);
      if (!j) return null;
      const [a, b] = j;
      const { masofa: d, yol } = bfs(t.simlar, a, b);
      return {
        tur: "qadam", id: `qadam:${t.simlar.join(",")}:${a}:${b}`, tor: t, a, b, javob: d, yol,
        matn: `Paket ${harf(a)} tugunida, manzil — ${harf(b)}. Eng kamida necha qadamda yetib boradi?`,
        nega: "Har qadamda faqat sim bilan ulangan qoʻshniga oʻtish mumkin. Barmogʻing bilan yoʻlni chizib, simlarni sana.",
        hisob: `Eng qisqa yoʻl: ${yol.map(harf).join(" → ")} — ${d} qadam.`,
      };
    }, prev, r);
  }

  // Keyingi qadam qaysi? — eng qisqa yo'ldagi qo'shni yagona bo'lgan holatlar
  function keyingiTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = tor(rr);
      const [min, max] = ORALIQ[Math.min(tier || 0, 2)];
      const j = juft(t, rr, Math.max(2, min), max);
      if (!j) return null;
      const [a, b] = j;
      const d = masofa(t.simlar, a, b);
      const qosh = qoshnilar(t.simlar, a);
      const yaxshi = qosh.filter((q) => masofa(t.simlar, q, b) === d - 1);
      if (yaxshi.length !== 1 || qosh.length < 2) return null;
      const yomonQoshni = qosh.filter((q) => q !== yaxshi[0]).slice(0, 2);
      const begona = aralash(t.tugunlar.filter((x) => x !== a && !qosh.includes(x)), rr);
      const variantlar = [yaxshi[0], ...yomonQoshni, ...begona].slice(0, 4).map(harf);
      return {
        tur: "keyingi", id: `keyingi:${t.simlar.join(",")}:${a}:${b}`, tor: t, a, b, javob: harf(yaxshi[0]),
        variantlar: aralash(variantlar, rr),
        matn: `Paket ${harf(a)} tugunida, manzil — ${harf(b)}. Eng qisqa yoʻl uchun keyingi qadam qaysi tugunga?`,
        ishora: `${harf(a)} ning faqat sim bilan ulangan qoʻshnilariga oʻtish mumkin. Qaysi biridan ${harf(b)} ga eng yaqin?`,
        nega: `${harf(yaxshi[0])} dan ${harf(b)} gacha ${d - 1} qadam qoladi — boshqa qoʻshnilardan uzoqroq.`,
      };
    }, prev, r);
  }

  // ---------- 2-bosqich: sim uzildi ----------
  // Eng qisqa yo'ldagi sim(lar) uziladi, lekin yo'l qoladi
  function uzildiTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = tor(rr);
      const [min, max] = ORALIQ[Math.min(tier || 0, 2)];
      const j = juft(t, rr, min, max);
      if (!j) return null;
      const [a, b] = j;
      const { masofa: d, yol } = bfs(t.simlar, a, b);
      const yolSimlari = yol.slice(1).map((x, i) => sim(yol[i], x));
      const nechta = (tier || 0) >= 2 ? 2 : 1;
      const uzilgan = aralash(yolSimlari, rr).slice(0, nechta);
      const qolgan = t.simlar.filter((s) => !uzilgan.includes(s));
      const yangi = bfs(qolgan, a, b);
      if (yangi.masofa < 0) return null;
      return {
        tur: "uzildi", id: `uzildi:${t.simlar.join(",")}:${a}:${b}:${uzilgan.join(",")}`, tor: t, a, b, uzilgan,
        eski: d, javob: yangi.masofa, yol: yangi.yol,
        matn: `${uzilgan.map(simNomi).join(" va ")} simi uzildi. Endi paket ${harf(a)} dan ${harf(b)} ga eng kamida necha qadamda yetadi?`,
        nega: "Uzilgan simdan oʻtib boʻlmaydi — uni chetlab oʻtadigan yoʻlni izla.",
        hisob: `Yangi yoʻl: ${yangi.yol.map(harf).join(" → ")} — ${yangi.masofa} qadam (oldin ${d} edi).`,
      };
    }, prev, r);
  }

  // Qaysi sim uzilsa, yo'l eng ko'p uzayadi? — 4 sim, javob yagona, hech biri yo'lni butunlay uzmaydi
  function qaysiTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = tor(rr);
      const [min, max] = ORALIQ[Math.min(tier || 0, 2)];
      const j = juft(t, rr, min, max);
      if (!j) return null;
      const [a, b] = j;
      const d = masofa(t.simlar, a, b);
      const baho = t.simlar.map((s) => ({ s, d: masofa(t.simlar.filter((x) => x !== s), a, b) })).filter((x) => x.d >= 0);
      const nomzod = aralash(baho, rr).slice(0, 4);
      if (nomzod.length < 4) return null;
      const eng = Math.max(...nomzod.map((x) => x.d));
      const engList = nomzod.filter((x) => x.d === eng);
      if (engList.length !== 1 || eng === d) return null; // javob yagona va yo'l haqiqatan uzayadi
      return {
        tur: "qaysi", id: `qaysi:${t.simlar.join(",")}:${a}:${b}:${nomzod.map((x) => x.s).join(",")}`, tor: t, a, b,
        variantlar: nomzod.map((x) => simNomi(x.s)), javob: simNomi(engList[0].s), baho: nomzod, eski: d,
        matn: `Paket ${harf(a)} dan ${harf(b)} ga ketyapti (${d} qadam). Qaysi sim uzilsa, yoʻl eng koʻp uzayadi?`,
        ishora: "Har simni hayolan uzib koʻr va yangi yoʻlni sana. Eng qisqa yoʻlda boʻlmagan sim uzilsa — hech narsa oʻzgarmaydi.",
        nega: nomzod.map((x) => `${simNomi(x.s)} uzilsa — ${x.d} qadam`).join("; ") + ".",
      };
    }, prev, r);
  }

  // Yetib boradimi? (tier 2) — ikki sim uziladi, yo'l qolishi ham, qolmasligi ham mumkin
  const YOQ = "Yoʻq, yetib bormaydi";
  function yetadimiTask(r, prev, tier) {
    if ((tier || 0) < 2) return uzildiTask(r, prev, tier);
    return pickNew((rr) => {
      const t = tor(rr);
      const j = juft(t, rr, 3, 5);
      if (!j) return null;
      const [a, b] = j;
      const d = masofa(t.simlar, a, b);
      // b (yoki a) ning qo'shnisi ikkita bo'lsa, ikkalasini uzish — yo'lni butunlay kesadi
      const chekka = [b, a].find((x) => qoshnilar(t.simlar, x).length === 2);
      const kesadi = chekka !== undefined && rr() < 0.5;
      const uzilgan = kesadi ? qoshnilar(t.simlar, chekka).map((q) => sim(chekka, q)) : aralash(t.simlar, rr).slice(0, 2);
      const qolgan = t.simlar.filter((s) => !uzilgan.includes(s));
      const yangi = masofa(qolgan, a, b);
      const asos = yangi >= 0 ? yangi : d;
      const sonlar = [asos - 1, asos, asos + 1, asos + 2].filter((x) => x >= 1);
      const raqamli = (yangi >= 0 ? [yangi] : []).concat(aralash(sonlar.filter((x) => x !== yangi), rr)).slice(0, 3);
      const variantlar = raqamli.sort((x, y) => x - y).map((x) => `Ha — ${x} qadam`).concat(YOQ);
      return {
        tur: "yetadimi", id: `yetadimi:${t.simlar.join(",")}:${a}:${b}:${uzilgan.join(",")}`, tor: t, a, b, uzilgan,
        variantlar, javob: yangi >= 0 ? `Ha — ${yangi} qadam` : YOQ,
        matn: `${uzilgan.map(simNomi).join(" va ")} simlari uzildi. Paket ${harf(a)} dan ${harf(b)} ga yetib boradimi?`,
        ishora: `Avval ${harf(b)} ga qaysi simlar kirishini tekshir: hammasi uzilmaganmi?`,
        nega: yangi >= 0 ? `Yoʻl bor: ${bfs(qolgan, a, b).yol.map(harf).join(" → ")}.` : `${harf(chekka)} ning hamma simi uzilgan — unga yoʻl qolmadi.`,
      };
    }, prev, r);
  }

  // ---------- 3-bosqich: so'rov va javob ----------
  const FAYLLAR = [
    { id: "rasm", nom: "rasm" }, { id: "rasm2", nom: "yana bir rasm" }, { id: "shrift", nom: "shrift (harflar)" },
    { id: "uslub", nom: "uslub (ranglar, joylashuv)" }, { id: "skript", nom: "skript (tugmalar ishlashi)" }, { id: "ovoz", nom: "ovoz" },
  ];
  const SAHIFA = { id: "sahifa", nom: "sahifaning oʻzi (matn)" };

  function sorovTask(r, prev, tier) {
    return pickNew((rr) => {
      const n = [int(rr, 1, 2), int(rr, 3, 4), int(rr, 5, 6)][Math.min(tier || 0, 2)];
      const fayllar = [SAHIFA, ...aralash(FAYLLAR, rr).slice(0, n)];
      return {
        tur: "sorov", id: `sorov:${fayllar.map((f) => f.id).join(",")}`, fayllar, javob: fayllar.length,
        matn: "Sahifa ochilishi uchun quyidagi fayllar kerak. Mijoz serverga nechta soʻrov yuboradi?",
        nega: "Har fayl alohida soʻraladi — sahifaning oʻzi ham.",
        hisob: `${fayllar.length} ta fayl → ${fayllar.length} ta soʻrov.`,
      };
    }, prev, r);
  }

  const KORINISH = {
    sahifa: "Sahifa umuman ochilmaydi",
    rasm: "Matn bor, rasm oʻrnida boʻsh ramka",
    shrift: "Matn bor, lekin harflar boshqacha (oddiy shriftda)",
    uslub: "Matn bor, lekin ranglarsiz va hammasi ustma-ust",
  };
  function kelmadiTask(r, prev) {
    return pickNew((rr) => {
      const qaysi = pick(Object.keys(KORINISH), rr);
      const nom = qaysi === "sahifa" ? SAHIFA.nom : FAYLLAR.find((f) => f.id === qaysi).nom;
      return {
        tur: "kelmadi", id: "kelmadi:" + qaysi, qaysi,
        matn: `Server hamma fayllarni yubordi, lekin «${nom}» yoʻlda yoʻqoldi. Sahifa qanday koʻrinadi?`,
        variantlar: aralash(Object.values(KORINISH), rr), javob: KORINISH[qaysi],
        ishora: "Har fayl sahifaning bitta qismini beradi. Yoʻqolgan fayl qaysi qismini berardi?",
        nega: qaysi === "sahifa" ? "Sahifaning oʻzi kelmasa, qolgan fayllarni qayerga qoʻyishni bilib boʻlmaydi." : `Qolgan hammasi bor — faqat «${nom}» bergan qism yoʻq.`,
      };
    }, prev, r);
  }

  // Server navbati: soniyasiga tezlik ta javob; K-bola javobni necha soniyadan keyin oladi
  const kutish = (k, tezlik) => Math.ceil(k / tezlik);
  function navbatTask(r, prev, tier) {
    return pickNew((rr) => {
      const t = Math.min(tier || 0, 2);
      const n = [int(rr, 3, 5), int(rr, 6, 9), int(rr, 8, 12)][t];
      const tezlik = t === 2 ? 2 : 1;
      const k = int(rr, 2, n);
      return {
        tur: "navbat", id: `navbat:${n}:${tezlik}:${k}`, n, tezlik, k, javob: kutish(k, tezlik),
        matn: `Server har soniyada ${tezlik} ta soʻrovga javob beradi. ${n} bola bir vaqtda soʻradi. Navbatda ${k}-boʻlib turgan bola javobni necha soniyadan keyin oladi?`,
        nega: `Har soniyada navbatdan ${tezlik} ta bola javob oladi. ${k}-bolagacha nechta soniya oʻtishini sana.`,
        hisob: tezlik === 1 ? `${k}-bola → ${k} soniya.` : `${k} : ${tezlik} → ${kutish(k, tezlik)} soniya (har soniyada 2 tadan).`,
      };
    }, prev, r);
  }

  const BOSQICH1 = [qadamTask, keyingiTask];
  const BOSQICH2 = [uzildiTask, qaysiTask, yetadimiTask];
  const BOSQICH3 = [sorovTask, kelmadiTask, navbatTask];
  const navbat = (bank) => (r, prev, n, tier) => bank[(n || 0) % bank.length](r, prev, tier);

  const api = {
    USTUN, QATOR, HARF, QIYA, ORALIQ, FAYLLAR, SAHIFA, KORINISH, YOQ, BOSQICH1, BOSQICH2, BOSQICH3,
    harf, joy, sim, simNomi, tolaSimlar, qoshnilar, bfs, masofa, boglanganmi, tor, juft, kutish,
    qadamTask, keyingiTask, uzildiTask, qaysiTask, yetadimiTask, sorovTask, kelmadiTask, navbatTask,
    bosqich1Task: navbat(BOSQICH1), bosqich2Task: navbat(BOSQICH2), bosqich3Task: navbat(BOSQICH3),
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
