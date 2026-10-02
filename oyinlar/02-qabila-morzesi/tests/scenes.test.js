// O'qish va yozish sahnalari (scenes/common.js) testi: soxta DOM, haqiqiy morse-ui.js va umumiy practice.js.
// Tekshiradi: yashirin kodlar (yoddan o'qish), maslahat kodlarni qaytarishi (javobni emas), ko'rsatish
// qismidagi xatolar statistikaga kirmasligi, mashq sikli (4 ta xabar, tezlashish), qiyin rejim.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");
const morse = require("../js/morse.js");

globalThis.document = { getElementById: () => null, querySelectorAll: () => [] }; // morse-ui.js stopPlaying() uchun

function fakeNode(tag, props, children) {
  const classes = new Set(String((props && props.class) || "").split(" ").filter(Boolean));
  const node = {
    tag, children: [], textContent: (props && props.text) || "", offsetWidth: 0, disabled: false, innerHTML: "",
    label: props && props.text,
    click: props && props.onClick,
    classList: {
      add: (...c) => c.forEach((x) => classes.add(x)),
      remove: (...c) => c.forEach((x) => classes.delete(x)),
      toggle: (c, on) => ((on === undefined ? !classes.has(c) : on) ? classes.add(c) : classes.delete(c)),
      contains: (c) => classes.has(c),
    },
    append: (...c) => node.children.push(...c.filter(Boolean)),
    setAttribute: () => {},
    scrollIntoView: () => {},
  };
  node.append(...children);
  return node;
}

// Daraxtdan matni bo'yicha tugmani topish
function find(node, label) {
  if (node.label === label && node.click) return node;
  for (const child of node.children || []) {
    const hit = find(child, label);
    if (hit) return hit;
  }
  return null;
}

function makeWindow() {
  const log = { bubbles: [], said: [], progress: [], units: [] };
  const guide = fakeNode("div", null, []);
  const work = fakeNode("div", null, []);
  const control = fakeNode("div", null, []);
  const h = (tag, props, ...children) => fakeNode(tag, props, children);
  const ui = {
    h,
    button: (label, onClick, cls) => h("button", { class: "btn " + (cls || ""), text: label, onClick }),
    settle: (executor) => new Promise((resolve) => executor(resolve)),
    openGuide: () => { guide.children.length = 0; return guide; },
    closeGuide: () => { guide.children.length = 0; },
    onCleanup: () => {},
    work: () => work,
    control: () => control,
    setCompact: () => {},
    clearWork: () => { work.children.length = 0; },
    clearControl: () => { control.children.length = 0; },
    pose: () => {}, toast: () => {},
    bubble: (who, text) => log.bubbles.push(text),
    say: (who, text) => { log.said.push(text); return Promise.resolve(); },
    setProgress: (total, filled) => log.progress.push([total, filled]),
    hideProgress: () => {},
  };
  const sound = { play: () => {}, stopBeeps: () => {}, beeps: (plan) => log.units.push(plan[0].on) };
  const win = { QK: { morse, ui, sound } };
  loadScript(path.join(__dirname, "../../umumiy/js/practice.js"), win);
  loadScript(path.join(__dirname, "../js/morse-ui.js"), win);
  loadScript(path.join(__dirname, "../js/scenes/common.js"), win);
  const cell = (letter) => guide.children[0].children.find((c) => c.children[0].textContent === letter);
  return {
    win, log, control, work,
    tapLetter: (letter) => cell(letter).click(),
    codeHidden: (letter) => cell(letter).classList.contains("nocode"),
    press: (label) => find(control, label).click(),
    has: (label) => !!(find(control, label) || find(work, label)),
  };
}

const pause = (ms) => new Promise((r) => setTimeout(r, ms || 450));
const typeMorse = (w, word) => {
  [...morse.encodeWord(word).join(" ")].forEach((sym) => w.press(sym === "." ? "·" : sym === "-" ? "—" : "harf oraligʻi"));
  w.press("Yuborish");
};

test("readMessage graded: kodlar ko'rinib tursa — «Qoʻllanmaga qarash» tugmasi yo'q; to'g'ri o'qilsa hisoblanadi", async () => {
  const w = makeWindow();
  const result = w.win.QK.common.readMessage("OTA", morse.lettersUpTo(1), "graded", {});
  assert.equal(w.has("Qoʻllanmaga qarash"), false);
  assert.equal(w.codeHidden("O"), false);
  [..."OTA"].forEach(w.tapLetter);
  w.press("Tekshir");
  assert.equal(await result, true);
  assert.equal(w.win.QK.practice.stats().mistakes, 0);
});

test("readMessage graded: yashirin kodlar — xato bo'lsa maslahat kodlarni ochadi, javobni aytmaydi", async () => {
  const w = makeWindow();
  const letters = morse.lettersUpTo(2);
  const hidden = morse.lettersUpTo(1);
  const result = w.win.QK.common.readMessage("KUN", letters, "graded", { hidden, unit: 90 });
  assert.equal(w.codeHidden("N"), true, "1-to'plam kodi yashirin");
  assert.equal(w.codeHidden("K"), false, "yangi ochilgan to'plam kodi ko'rinadi");
  assert.equal(w.has("Qoʻllanmaga qarash"), true);
  w.press("Tinglash");
  assert.deepEqual(w.log.units, [3 * 90], "«Tinglash» berilgan tezlikda chaladi (K: chiziq = 3 birlik)");
  [..."KUM"].forEach(w.tapLetter);
  w.press("Tekshir");
  assert.equal(w.codeHidden("N"), false, "maslahat yashirin kodlarni ochadi");
  assert.ok(w.log.bubbles[w.log.bubbles.length - 1].includes("kodlarni ochdim"));
  assert.ok(!w.log.bubbles[w.log.bubbles.length - 1].includes("KUN"), "maslahat javobni aytmasligi kerak");
  await pause();
  w.tapLetter("N"); // faqat belgilangan (xato) katak bo'shatilgan
  w.press("Tekshir");
  assert.equal(await result, true);
  assert.deepEqual([w.win.QK.practice.stats().mistakes, w.win.QK.practice.stats().solutions], [1, 0]);
});

test("readMessage: qarab olish kodlarni vaqtincha ochadi", () => {
  const w = makeWindow();
  w.win.QK.common.readMessage("NON", morse.lettersUpTo(1), "graded", { hidden: morse.lettersUpTo(1) });
  assert.equal(w.codeHidden("N"), true);
  w.press("Qoʻllanmaga qarash");
  assert.equal(w.codeHidden("N"), false);
});

test("readMessage demo va free: xatolar statistikaga kirmaydi", async () => {
  const w = makeWindow();
  const demo = w.win.QK.common.readMessage("E", morse.lettersUpTo(1), "demo");
  w.tapLetter("T"); // xato — qayta urinadi
  w.tapLetter("E");
  assert.equal(await demo, true);
  const free = w.win.QK.common.readMessage("XAYR", morse.lettersUpTo(3), "free");
  [..."XAYB"].forEach(w.tapLetter);
  w.press("Tekshir");
  assert.equal(await free, false, "baholanmaydigan xabar: 1-xatodayoq yechim");
  assert.deepEqual(w.win.QK.practice.stats(), { mistakes: 0, solutions: 0, streak: 0, bestStreak: 0 });
});

test("writeWord: ko'rsatishdagi xato sanalmaydi; mashqdagi (graded) xato sanaladi va maslahat qo'llanmani ochadi", async () => {
  const w = makeWindow();
  const letters = morse.lettersUpTo(3);
  const demo = w.win.QK.common.writeWord("ET", letters);
  typeMorse(w, "TE");
  typeMorse(w, "TE");
  assert.equal(await demo, false);
  assert.equal(w.win.QK.practice.stats().mistakes, 0);

  const graded = w.win.QK.common.writeWord("OY", letters, { graded: true, hide: true });
  assert.equal(w.codeHidden("O"), true, "qo'llanma kodlari yashirin");
  assert.equal(w.has("Qoʻllanmaga qarash"), true);
  typeMorse(w, "HA");
  assert.equal(w.codeHidden("O"), false, "maslahat qo'llanmani qaytaradi");
  await pause();
  // Terilgani o'chmaydi: 9 belgini o'chirib, to'g'risini teramiz
  for (let k = 0; k < 9; k++) w.press("⌫");
  typeMorse(w, "OY");
  assert.equal(await graded, true);
  assert.equal(w.win.QK.practice.stats().mistakes, 1);
});

test("readExercises: 4 ta xabar — SALOM, keyin to'plamlar ochiladi, kodlar yashirinadi, signal tezlashadi", async () => {
  const w = makeWindow();
  w.win.QK.practice.setStage(1, false);
  const words = [];
  const done = w.win.QK.common.readExercises();
  for (let k = 0; k < 4; k++) {
    await pause(20);
    const word = w.win.QK.current.answer;
    words.push(word);
    if (k === 2) {
      assert.equal(w.codeHidden("A"), true, "3-xabarda eski to'plam kodlari yashirin");
      assert.equal(w.codeHidden("K"), false, "3-xabarda yangi to'plam kodlari ko'rinadi");
    }
    if (k === 3) assert.equal(w.codeHidden("K"), true, "4-xabarda hamma kod yashirin");
    w.press("Tinglash");
    [...word].forEach(w.tapLetter);
    w.press("Tekshir");
    await pause(420);
  }
  await done;
  assert.equal(words[0], "SALOM");
  assert.ok(morse.WORDS[0].includes(words[1]) && morse.WORDS[1].includes(words[2]) && morse.WORDS[1].includes(words[3]));
  assert.deepEqual(w.log.progress[0], [4, 0]);
  assert.deepEqual(w.log.progress[w.log.progress.length - 1], [4, 4]);
  // Birinchi signal davomiyligi birlikka karrali: birlik 120 → 105 → 90 → 75
  const first = (word) => (morse.encodeWord(word)[0][0] === "." ? 1 : 3);
  assert.deepEqual(w.log.units, words.map((word, k) => first(word) * [120, 105, 90, 75][k]));
  assert.ok(w.log.said.some((t) => t.includes("yangi harflarni")), "yangi to'plam e'lon qilinadi");
  assert.equal(w.win.QK.practice.stars(), 3);
});

test("writeExercises: qiyin rejim — 7 ta javob, hammasi uzun (5–6 harf), bitta urinish", async () => {
  const w = makeWindow();
  w.win.QK.practice.setStage(2, true);
  const answers = [];
  const done = w.win.QK.common.writeExercises();
  for (let k = 0; k < 8; k++) {
    await pause(20);
    const word = w.win.QK.current.answer;
    answers.push(word);
    typeMorse(w, k === 0 ? "E" : word); // birinchisida ataylab xato — qiyin rejimda darhol yechim
    await pause(420);
  }
  await done;
  assert.ok(answers.every((a) => a.length >= 5 && a.length <= 6), answers.join());
  assert.deepEqual(w.log.progress[w.log.progress.length - 1], [7, 7]);
  assert.equal(w.win.QK.practice.stats().solutions, 1);
});
