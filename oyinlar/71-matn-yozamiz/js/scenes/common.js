// 71-o'yin: mashq ekranlari va ko'rsatish qadami. Muharrir oynasi — js/muharrir.js, mantiq — js/logic.js.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, practice, sound, muharrir } = QK;
  const h = ui.h;

  // ---------- Mashq qutisi ----------
  function box(compact) {
    ui.setCompact(compact !== false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    const el = h("div", { class: "pbox" });
    ui.work().append(el);
    return el;
  }

  const note = (text) => h("div", { class: "note", text });
  const answer = (text) => h("div", { class: "answer", text });
  // Maslahat, namuna va yechim joyi — oynaning tepasida
  const ustJoy = () => h("div", { class: "my-ust", "aria-live": "polite" });
  const savol = (text) => h("div", { class: "my-savol", text });

  // Klaviatura tekshiruvi — sahifada bir marta (telefonda ogohlantiradi, kompyuterda jim o'tadi)
  let klaviaturaSoraldi = false;
  async function klaviatura() {
    if (klaviaturaSoraldi) return;
    klaviaturaSoraldi = true;
    await ui.keyboardCheck("Bu oʻyinda matn teriladi — klaviatura kerak. Uni kompyuterda och.");
  }

  // Namuna: kutilgan matn (oddiy) yoki bezakli HTML
  function namunaEl(sarlavha, matn, html) {
    const el = h("div", { class: "my-namuna" }, h("div", { class: "my-namuna-sarlavha", text: sarlavha }));
    if (html != null) el.append(h("div", { class: "my-namuna-matn", html: L.tozaHtml(html) }));
    else el.append(h("div", { class: "my-namuna-matn", text: matn }));
    return el;
  }
  // tier 0: buzilgan so'z ko'rsatiladi (joyi aytilmaydi — bola gapdan topadi)
  const ishora = (soz) => h("div", { class: "my-ishora" }, h("span", { text: "Shu soʻzni tuzat: " }), h("b", { text: `«${soz}»` }));

  const tayyorBtn = (fn) => {
    const b = ui.button("Tayyor", fn, "big");
    b.setAttribute("data-amal", "tayyor");
    return b;
  };

  // Ko'rsatish qadami: bola o'zi teradi. qadam(muharrir) → pufak matni (hali bajarilmadi) yoki null (bajarildi).
  // Matn holatga qarab o'zgaradi — bola boshqa narsa qilib qo'ysa ham, keyingi qadam doim to'g'ri aytiladi.
  function kut(m, qadam) {
    return ui.settle((done) => {
      let oxirgi = null;
      const tekshir = () => {
        const matn = qadam(m);
        if (matn == null) {
          m.tingla(null);
          m.muzlat(true);
          done();
          return;
        }
        if (matn !== oxirgi) {
          oxirgi = matn;
          ui.bubble("elder", matn);
        }
      };
      ui.clearControl();
      m.muzlat(false);
      m.tingla(tekshir);
      tekshir();
      m.fokus();
    });
  }

  // Yechim ko'rsatilgach bola uni ko'chiradi (urinish sanalmaydi): matn kutilganga teng bo'lganda o'zi tugaydi;
  // «Tayyor» — farq turini aytadi; «Oʻtkazib yuborish» — qotib qolmaslik uchun.
  async function kochir(m, tekshir, maslahat) {
    const ok = await ui.settle((done) => {
      const tugat = (natija) => {
        m.tingla(null);
        ui.clearControl();
        done(natija);
      };
      const sinov = () => {
        if (!tekshir()) return false;
        tugat(true);
        return true;
      };
      m.muzlat(false);
      m.tingla(sinov);
      ui.clearControl();
      ui.control().append(
        tayyorBtn(() => { if (!sinov()) { sound.play("retry"); ui.bubble("elder", "↻ " + maslahat()); } }),
        ui.button("Oʻtkazib yuborish", () => tugat(false), "secondary"));
      m.fokus();
    });
    if (ok) {
      sound.play("correct");
      ui.pose("apprentice", "happy", 900);
      await ui.say("elder", "✓ Aynan shunday! Koʻchirishni ham oʻrganding.");
    }
  }

  // ---------- 1–2-bosqich: matnni tuzatish (textarea) ----------
  // 1-xato: matn saqlanadi, maslahat — farq turi (joyini aytmaydi). 2-xato: kutilgan matn ko'rsatiladi, bola ko'chiradi.
  function matnExercise(task, opts) {
    const o = opts || {};
    let m = null;
    let ust = null;
    let maslahatEl = null;
    return practice.tries({
      setup(submit) {
        const host = box(true);
        ui.bubble("elder", task.matn);
        ust = ustJoy();
        host.append(ust);
        if (task.korsat) ust.append(ishora(task.korsat));
        if (task.namuna) ust.append(namunaEl("Shunday boʻlsin:", task.kutilgan));
        maslahatEl = h("div", { class: "my-maslahat" });
        ust.append(maslahatEl);
        m = muharrir.yasa(host, { rejim: "oddiy", matn: task.boshlangich, onTayyor: o.ctrlEnter ? () => submit(m.matn()) : null });
        ui.control().append(tayyorBtn(() => submit(m.matn())));
        m.fokus();
      },
      check: (v) => L.teng(v, task.kutilgan),
      hint(v) {
        const f = L.farq(v, task.kutilgan);
        maslahatEl.replaceChildren(note("↻ " + (f ? f.matn : "Yana bir tekshir.") + (task.ishora ? " " + task.ishora : "")));
        m.fokus();
      },
      solution() {
        // Namuna allaqachon turgan bo'lsa (qator vazifasi) — ikkinchi marta chizilmaydi
        maslahatEl.replaceChildren(answer(task.namuna ? "Namunaga qara va aynan shunday yoz." : "Toʻgʻri matn mana:"));
        if (!task.namuna) maslahatEl.append(namunaEl("", task.kutilgan));
      },
    }).then(async (ok) => {
      if (!ok) {
        ui.bubble("elder", "Toʻgʻri matn tepada. Endi uni aynan shunday yoz.");
        await kochir(m, () => L.teng(m.matn(), task.kutilgan), () => { const f = L.farq(m.matn(), task.kutilgan); return f ? f.matn : "Yana bir tekshir."; });
      }
      m.toxtat();
      return ok;
    });
  }

  // ---------- 3-bosqich: belgilash va bezash (contenteditable) ----------
  const BEZAK_ASBOBLAR = ["qalin", "kursiv", "kok", "yashil", "binafsha"];

  function bezaExercise(task) {
    let m = null;
    let maslahatEl = null;
    const tekshir = () => L.bezakTekshir(m.html(), task.kutilgan, task.matn);
    return practice.tries({
      setup(submit) {
        const host = box(true);
        ui.bubble("elder", task.buyruq);
        const ust = ustJoy();
        maslahatEl = h("div", { class: "my-maslahat" });
        ust.append(maslahatEl);
        host.append(ust);
        m = muharrir.yasa(host, { rejim: "bezak", matn: task.matn, asboblar: BEZAK_ASBOBLAR, onTayyor: () => submit(m.html()) });
        ui.control().append(tayyorBtn(() => submit(m.html())));
        m.fokus();
      },
      check: (html) => L.bezakTekshir(html, task.kutilgan, task.matn).ok,
      hint(html) {
        maslahatEl.replaceChildren(note("↻ " + L.bezakTekshir(html, task.kutilgan, task.matn).sabab));
        m.fokus();
      },
      solution() {
        maslahatEl.replaceChildren(answer("Shunday boʻlishi kerak:"), namunaEl("", null, L.bezakHtml(task.matn, task.kutilgan)));
        m.yoz(task.matn); // matn buzilgan bo'lsa — asliga qaytadi, faqat bezash qoladi
      },
    }).then(async (ok) => {
      if (!ok) {
        ui.bubble("elder", "Namuna tepada. Endi sen ham shunday bezat.");
        await kochir(m, () => tekshir().ok, () => tekshir().sabab);
      }
      m.toxtat();
      return ok;
    });
  }

  const EKRAN = {
    tuzat: (task) => matnExercise(task, { ctrlEnter: false }), // Enter matnga kiradi — 1-bosqichda Ctrl+Enter yo'q
    qator: (task) => matnExercise(task, { ctrlEnter: true }),
    sarlavha: (task) => matnExercise(task, { ctrlEnter: true }),
    belgi: (task) => matnExercise(task, { ctrlEnter: true }),
    beza: bezaExercise,
  };
  const run = (task) => EKRAN[task.tur](task);

  // Mashq tugagach aytiladigan maqtov
  const XATO_YOZUV = { tushdi: "harf qoʻshding", ortiqcha: "ortiqcha harfni oʻchirding", notogri: "harfni almashtirding", kichik: "katta harf qoʻyding" };
  function praise(task) {
    if (task.tur === "tuzat") {
      const t = task.xatolar.map((x) => `«${x.asl}»`).join(" va ");
      return task.xatolar.length > 1 ? `${t} tuzatildi.` : `${t} tuzatildi — ${XATO_YOZUV[task.xatolar[0].tur]}.`;
    }
    return task.maqtov || "";
  }

  QK.common = { box, note, answer, ustJoy, savol, klaviatura, namunaEl, ishora, tayyorBtn, kut, kochir, matnExercise, bezaExercise, run, praise, BEZAK_ASBOBLAR };
})(window);
