// Kirish va 1-bosqich: nega 8 ta bit? (DIZAYN 4, 5-bo'limlar)
(function (root) {
  "use strict";

  const QK = root.QK;
  const { bytes, ui, sound, art, bytesUi, practice, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.computer() }));
    await ui.say("elder", "Qabilamizga kompyuter keldi!");
    await ui.say("apprentice", "U harflarni qanday eslab qoladi?");
    await ui.say("elder", "Kichik chiroqlar — bitlar bilan. Xuddi 4-oʻyindagi chiroqlar kabi!");
  }

  const QUESTIONS = [
    "Avval kichik harflar: 26 ta. Eng kamida nechta bit kerak?",
    "Endi katta harflar ham: jami 52 ta belgi. Nechta bit kerak?",
    "Raqamlar qoʻshildi: jami 62 ta. Nechta bit kerak?",
    "Tinish belgilari va boʻsh joy: jami 95 ta. Nechta bit kerak?",
  ];

  // 5.1: to'plamlar qo'shilib boradi, bola eng kamida nechta bit kerakligini tanlaydi
  async function countSets() {
    const el = common.box(true);
    const list = ui.h("div", { class: "setlist" });
    const bitsHost = ui.h("div", { class: "bits-host" });
    const info = common.line("");
    const need = common.line("", "need");
    el.append(list, bitsHost, info, need);

    let bits = 1;
    const showBits = (n) => {
      bitsHost.replaceChildren(bytesUi.bitDots(n));
      info.textContent = `${n} bit → ${bytes.pow2(n)} xil naqsh`;
    };

    for (let s = 0; s < bytes.SETS.length; s++) {
      const set = bytes.SETS[s];
      list.append(ui.h("div", { class: "set-chip" },
        ui.h("span", { class: "set-sample", text: set.sample }),
        ui.h("span", { class: "set-name", text: `${set.name}: ${set.add}` })));
      need.textContent = `Kerak: ${set.total} ta belgi`;
      ui.bubble("elder", QUESTIONS[s]);

      await ui.settle((done) => {
        // Hisoblagich va "Tayyor" bitta qatorda — yotiq ekranda ish maydoniga joy qolsin
        const row = ui.h("div", { class: "control-row" });
        ui.control().append(row);
        ui.counter(row, { start: bits, min: 1, max: 8, unit: "bit", onChange: (n) => { bits = n; showBits(n); } });
        row.append(ui.button("Tayyor", () => {
          const verdict = bytes.checkBits(bits, set.total);
          if (verdict === "ok") {
            sound.play("correct");
            ui.pose("apprentice", "happy", 900);
            ui.clearControl();
            done();
            return;
          }
          sound.play("retry");
          ui.pose("apprentice", "think", 1000);
          ui.bubble("elder", verdict === "few"
            ? `↻ Yetmaydi: ${bits} bit — ${bytes.pow2(bits)} xil naqsh, kerak ${set.total}.`
            : "↻ Yetadi, lekin kamroq bit bilan ham boʻladi. Eng kamida nechta?");
        }));
      });

      if (s === 0) {
        await ui.say("elder", `✓ ${bits} bit — ${bytes.pow2(bits)} xil naqsh. 26 ta harfga yetadi!`);
        await ui.say("elder", "Klaviaturada 26 ta harf tugmasi bor. Oʻ, sh kabi harflar ham shulardan yasaladi.");
      } else if (s === 2) {
        await ui.say("elder", "✓ Yana 6 bit! 64 xil naqsh 62 ta belgiga hali yetadi.");
      } else {
        await ui.say("elder", `✓ ${bits} bit — ${bytes.pow2(bits)} xil naqsh. Yetadi!`);
      }
    }

    await ui.say("elder", "Klaviaturadagi hamma belgiga 7 bit yetdi.");
    showBits(8);
    need.textContent = "";
    sound.play("correct");
    await ui.say("elder", "Lekin kompyuter yaratganlar yana 1 ta zaxira bit qoʻshib, 8 ni tanlashdi.");
    await ui.say("elder", "8 bit — 1 bayt. Unda 256 xil naqsh bor!");
  }

  // 5.3: ta'rif — sandiq va formula
  async function definition() {
    const el = common.box(false);
    el.append(bytesUi.chest(null, { bits: "01000010" }));
    common.formula(el, ["1 bayt = 8 bit", "2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 = 256"]);
    await ui.say("elder", "Bayt — xotiraning bitta «sandigʻi». Unga 8 ta bit sigʻadi.");
    await ui.say("elder", "Bu — odamlar kelishib olgan qoida. Qadimgi kompyuterlarda 6 va 7 bitli baytlar ham boʻlgan.");
    await ui.say("elder", "8 — kompyuterga qulay son: 2 × 2 × 2. Shuning uchun hamma 8 ni tanladi.");
  }

  // 5.4: mashq — bayt ↔ bit
  function bitTask(task) {
    const el = common.box(true);
    const view = ui.h("div", { class: "task-view" });
    el.append(view);
    if (task.type === "toBits") {
      view.append(bytesUi.chests(task.bytes));
      ui.bubble("elder", `Mana ${task.bytes} ta sandiq — ${task.bytes} bayt. Unda necha bit bor?`);
    } else {
      view.append(bytesUi.bitDots(task.bits));
      ui.bubble("elder", `Mana ${task.bits} ta bit. Necha bayt boʻladi?`);
    }
    return practice.numberTries({
      answer: task.answer,
      hint: () => {
        if (task.type === "toBits") {
          common.add(el, common.line(Array(task.bytes).fill("8").join(" + ") + " = ?"));
          ui.bubble("elder", "↻ Har sandiqda 8 bit. Hammasini qoʻsh.");
        } else {
          view.replaceChildren(bytesUi.chests(task.bytes));
          ui.bubble("elder", "↻ Bitlarni 8 tadan sandiqqa joyladim. Nechta sandiq boʻldi?");
        }
      },
      solution: () => {
        common.add(el, common.answerLine(task.type === "toBits"
          ? `${task.bytes} × 8 = ${task.bits} bit`
          : `${task.bits} : 8 = ${task.bytes} bayt`));
      },
    });
  }

  async function stage1() {
    await countSets();
    await definition();
    await ui.say("elder", "Endi oʻzing hisobla: bayt va bit. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => bytes.makeBitTask(prev),
      run: bitTask,
      praise: (task) => `${task.bytes} bayt = ${task.bits} bit.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
