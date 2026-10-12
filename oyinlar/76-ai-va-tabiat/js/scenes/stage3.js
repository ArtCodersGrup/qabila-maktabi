// 3-bosqich: noxolislik (bias) — o'quv to'plamida faqat butun idishlar; bola to'plamni tuzatadi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  const nomlar = (ids) => ids.map((id) => `«${L.buyum(id).nom}»`).join(", ");

  // Noxolis to'plam bilan o'qitilgan model testda
  async function sinash() {
    const d = L.demo3([]);
    const el = common.box(true);
    const joy = h("div", { class: "at-joy" });
    el.append(joy);
    joy.append(common.sarlavha("Oʻquv toʻplami"), common.jadval(d.oquv.map((x) => ({ buyum: x })), { nom: true, yorliq: true }));
    ui.bubble("elder", "Oʻquv toʻplamidagi plastiklarga qara: uchalasi ham butun, silindr idish. Shu model bilan testni oʻtkaz.");
    await ui.choice([{ label: "Testda tekshirish", value: "ok" }]);
    QK.sound.play("tap");
    joy.textContent = "";
    joy.append(common.sarlavha("Test toʻplami"), common.natijaJadvali(d.natija.natijalar, true), common.answer(common.aniqlikYoz(d.natija)));
    await ui.say("elder", `Umumiy natija — ${d.natija.togri}/${d.natija.jami}, lekin ezilgan plastik idishlarda ${d.ezilganTogri}/${d.ezilganJami}. Model bunday shaklni oʻquv toʻplamida koʻrmagan.`);
    await ui.say("elder", "Atama: noxolislik (bias). Oʻquv toʻplami hayotdagi holatlarning bir qisminigina qamrasa, model qolganlarida xato qiladi — sabab modelda emas, maʼlumotda.");
  }

  // Bola nomzodlarni qo'shib-olib, test natijasini kuzatadi; eng yuqori natijaga yetganda «Davom» chiqadi
  async function tuzatish() {
    const el = common.box(true);
    const eng = L.demo3Eng();
    const qoshilgan = new Set();
    const holat = h("div", { class: "answer", "aria-live": "polite" });
    const joy = h("div", { class: "at-joy" });
    const nomzodlar = L.demo3([]).nomzodlar;
    ui.bubble("elder", "Toʻplamni tuzat: nomzodlarni bosib, oʻquv toʻplamiga qoʻsh yoki olib tashla. Test natijasi qanday oʻzgaradi?");
    await ui.settle((done) => {
      let tugadi = false;
      const tugmalar = nomzodlar.map((x) => {
        const b = h("button", { class: "at-qator", type: "button", "aria-pressed": "false" },
          h("span", { class: "nom", text: x.nom }), common.yorliq(x.sinf), h("span", { class: "tavsif", text: L.belgiYoz(x) }));
        b.addEventListener("click", () => {
          QK.sound.play("tap");
          if (qoshilgan.has(x.id)) qoshilgan.delete(x.id);
          else qoshilgan.add(x.id);
          b.classList.toggle("tanlangan", qoshilgan.has(x.id));
          b.setAttribute("aria-pressed", qoshilgan.has(x.id) ? "true" : "false");
          yangila();
        });
        return b;
      });
      function yangila() {
        const d = L.demo3([...qoshilgan]);
        holat.textContent = `Oʻquv toʻplami: ${d.oquv.length} ta. ${common.aniqlikYoz(d.natija)}`;
        joy.textContent = "";
        joy.append(common.natijaJadvali(d.natija.natijalar, true));
        if (d.natija.togri === eng && !tugadi) {
          tugadi = true;
          QK.sound.play("correct");
          ui.control().append(ui.button("Davom ▶︎", () => done()));
        }
      }
      el.append(common.sarlavha("Nomzodlar (bosib qoʻsh)"), h("div", { class: "at-qatorlar" }, ...tugmalar), holat, joy);
      yangila();
    });
    ui.clearControl();
    const foydali = L.demo3Foydali();
    const foydasiz = L.DEMO3.nomzodlar.filter((id) => !foydali.includes(id));
    await ui.say("elder", `✓ Natijani ${nomlar(foydali)} yaxshiladi — model koʻrmagan turdagi buyumlar. ${nomlar(foydasiz)} qoʻshilganda aniqlik oshmadi.`);
  }

  async function korsat() {
    await sinash();
    await tuzatish();
    await ui.say("elder", `Hayotda ham shunday: yuzni tanish yoki tibbiy tashxis modeli oʻquv toʻplamida kam uchragan odamlarda koʻproq xato qiladi. Mashq: ${QK.practice.need()} ta savol.`);
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
