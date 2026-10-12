// 3-bosqich: kompyuter ko‘rishi — bola bitta rasmga uch xil natija beradi: yorliq, ramka, maska.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  // 6×6 rasm: 3×3 ramkadagi mashina, yuqori ikki burchagi bo‘sh (7 katak)
  const KATAKLAR = [[2, 3], [3, 2], [3, 3], [3, 4], [4, 2], [4, 3], [4, 4]];
  const RASM = { n: L.N, obyektlar: [{ sinf: "mashina", kataklar: KATAKLAR, ramka: L.ramka(KATAKLAR) }] };
  const OBYEKT = RASM.obyektlar[0];

  // 1-vazifa: butun rasmga bitta yorliq
  async function tasnif() {
    const el = common.box(true);
    el.append(common.savol("1-vazifa: butun rasmga bitta yorliq ber."), common.rasm(RASM).el, common.izoh());
    for (;;) {
      ui.bubble("elder", "Rasmda nima bor? Belgilar izohi rasm ostida.");
      const javob = await ui.choice(L.SINFLAR.map((s) => ({ label: s.k, value: s.k })));
      if (javob === OBYEKT.sinf) break;
      QK.sound.play("retry");
      await ui.say("elder", "↻ Kataklardagi belgini izoh bilan solishtir.");
    }
    QK.sound.play("correct");
    el.append(h("span", { class: "ao-chip yorliq", text: OBYEKT.sinf }));
    await ui.say("elder", "✓ Tasniflash (classification): butun rasmga bitta yorliq. Obyekt qayerdaligi aytilmaydi.");
  }

  // 2-vazifa: ramkaning ikki qarama-qarshi burchagi
  async function topish() {
    const el = common.box(true);
    el.append(common.savol("2-vazifa: ramkaning ikki qarama-qarshi burchak katagini bos."));
    ui.bubble("elder", "Obyekt ramka ichida toʻliq qolsin, ortiqcha qator yoki ustun boʻlmasin.");
    await ui.settle((done) => {
      let birinchi = null;
      let eski = null;
      let tugadi = false;
      const r = common.rasm(RASM, {
        onCell(a, b, katak) {
          if (tugadi) return;
          QK.sound.play("tap");
          if (eski) { eski.remove(); eski = null; }
          if (!birinchi) {
            birinchi = { a, b, katak };
            katak.classList.add("tanlangan");
            return;
          }
          const ramka = { r0: Math.min(a, birinchi.a), c0: Math.min(b, birinchi.b), r1: Math.max(a, birinchi.a), c1: Math.max(b, birinchi.b) };
          birinchi.katak.classList.remove("tanlangan");
          birinchi = null;
          if (L.tengRamka(ramka, OBYEKT.ramka)) {
            tugadi = true;
            r.chiz(ramka, OBYEKT.sinf);
            done();
            return;
          }
          QK.sound.play("retry");
          eski = r.chiz(ramka, null, "sinov");
          ui.bubble("elder", "↻ Ramka obyektning eng chetki kataklariga tegib tursin. Qaytadan ikki burchakni bos.");
        },
      });
      el.append(r.el);
    });
    QK.sound.play("correct");
    await ui.say("elder", "✓ Obyektni topish (object detection): ramka va yorliq. Ramka ichiga fon kataklari ham tushadi.");
  }

  // 3-vazifa: obyektga tegishli har katak
  async function segment() {
    const el = common.box(true);
    el.append(common.savol("3-vazifa: obyektga tegishli har bir katakni boʻya, keyin «Tayyor»ni bos."));
    ui.bubble("elder", "Faqat obyekt kataklari boʻyalsin — fon emas.");
    const boyalgan = new Set();
    const kalit = (a, b) => a * L.N + b;
    const kerak = new Set(KATAKLAR.map((q) => kalit(q[0], q[1])));
    await ui.settle((done) => {
      const r = common.rasm(RASM, {
        onCell(a, b, katak) {
          QK.sound.play("tap");
          const k = kalit(a, b);
          if (boyalgan.has(k)) boyalgan.delete(k);
          else boyalgan.add(k);
          katak.classList.toggle("boyalgan", boyalgan.has(k));
        },
      });
      el.append(r.el);
      ui.control().append(ui.button("Tayyor", () => {
        let xato = 0;
        for (const k of kerak) if (!boyalgan.has(k)) xato++;
        for (const k of boyalgan) if (!kerak.has(k)) xato++;
        if (xato === 0) {
          ui.clearControl();
          done();
          return;
        }
        QK.sound.play("retry");
        ui.bubble("elder", `↻ ${xato} ta katak notoʻgʻri: belgili kataklarning hammasi va faqat ular boʻyalsin.`);
      }));
    });
    QK.sound.play("correct");
    const b = OBYEKT.ramka;
    await ui.say("elder", `✓ Segmentatsiya (segmentation): har katakka sinf. Ramkadagi ${L.yuza(b)} katakdan ${KATAKLAR.length} tasi — obyekt, ${L.yuza(b) - KATAKLAR.length} tasi — fon.`);
  }

  async function korsat() {
    await tasnif();
    await topish();
    await segment();
    const el = common.box(true);
    el.append(h("div", { class: "ao-uchlik" },
      ...["tasnif", "topish", "segment"].map((tur) => h("div", { class: "ao-uch" }, common.natija(RASM, tur, true), h("span", { class: "ao-uch-nom", text: L.VAZIFA[tur] })))));
    common.formula(el, [
      "Tasniflash — butun rasmga bitta yorliq",
      "Obyektni topish — har obyektga ramka va yorliq",
      "Segmentatsiya — har pikselga sinf",
    ]);
    await ui.say("elder", "Atama: kompyuter koʻrishi (computer vision, CV) — rasm va videodan maʼlumot chiqarish. Uch asosiy vazifasi ekranda.");
    await ui.say("elder", "Cheklov: model xato qiladi — obyektni oʻtkazib yuboradi yoki notoʻgʻri yorliq beradi. Odamni roziligisiz kuzatish — maxfiylikni buzish.");
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta savol — natijani tanish, kataklarni hisoblash, xatoni topish.`);
  }

  async function stage3() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich3Task(prev, Math.random, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
