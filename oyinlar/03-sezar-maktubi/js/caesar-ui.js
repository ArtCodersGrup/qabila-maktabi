// Sezar ekran qismlari: harf kataklari, so'z kataklari, surish jadvali, kalit boshqaruvi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { caesar, ui, sound } = QK;

  // Bitta harf katagi (Sh, Oʻ ham bitta katak)
  const tile = (letter, cls) => ui.h("span", { class: "ctile" + (cls ? " " + cls : ""), text: letter });

  function tilesRow(tokens, cls) {
    const row = ui.h("div", { class: "ctiles" });
    tokens.forEach((t) => row.append(tile(t, cls)));
    return row;
  }

  // ---------- So'z: tepada ko'rsatilgan harflar, ostida bola to'ldiradigan kataklar ----------
  // Harf navbatdagi katakka tushadi; to'lgan katakni bosish — uni navbatdagi qiladi.
  function wordSlots(host, shown) {
    const letters = shown.map(() => "");
    const slots = [];
    let current = 0;
    let locked = false;
    const wrap = ui.h("div", { class: "cword" });
    shown.forEach((t, k) => {
      const slot = ui.h("button", {
        class: "cslot",
        type: "button",
        "aria-label": `${k + 1}-harf`,
        onClick: () => {
          if (locked) return;
          current = k;
          render();
        },
      });
      slots.push(slot);
      wrap.append(ui.h("div", { class: "ccol" }, tile(t, "shown"), slot));
    });
    host.append(wrap);

    function render() {
      slots.forEach((s, k) => {
        s.textContent = letters[k];
        s.classList.toggle("current", k === current);
      });
    }
    render();

    return {
      // Navbatdagi katakka harf; qulflangan yoki katak tanlanmagan bo'lsa — false
      fill(letter) {
        if (locked || current < 0) return false;
        letters[current] = letter;
        slots[current].classList.remove("wrong");
        const after = letters.findIndex((l, k) => k > current && !l);
        current = after !== -1 ? after : letters.findIndex((l) => !l);
        render();
        return true;
      },
      letters: () => letters.slice(),
      isFull: () => letters.every(Boolean),
      // Xato: noto'g'ri kataklar bo'shatiladi, ↻ bilan belgilanadi va silkinadi
      markWrong(indices) {
        for (const k of indices) {
          letters[k] = "";
          slots[k].classList.add("wrong");
          slots[k].classList.remove("shake");
          void slots[k].offsetWidth; // animatsiyani qaytadan boshlash
          slots[k].classList.add("shake");
        }
        current = indices.length ? indices[0] : -1;
        render();
      },
      // Jadval kaliti noto'g'ri bo'lganda: hamma katak bo'shatiladi
      clearAll() {
        letters.fill("");
        slots.forEach((s) => s.classList.remove("wrong"));
        current = 0;
        render();
      },
      // To'g'ri javobni ko'rsatish va qulflash
      showSolution(tokens) {
        tokens.forEach((t, k) => {
          letters[k] = t;
          slots[k].classList.remove("wrong");
          slots[k].classList.add("solution");
        });
        locked = true;
        current = -1;
        render();
      },
      lock() {
        locked = true;
        current = -1;
        render();
      },
    };
  }

  // ---------- Kalit saqlovchi (jadvalsiz — kalitsiz ochish uchun) ----------
  function keyState(key) {
    let k = caesar.wrapKey(key);
    return {
      getKey: () => k,
      setKey(next) { k = caesar.wrapKey(next); },
    };
  }

  // ---------- Surish jadvali (qo'llanma zonasida): tepada oddiy harf, pastda uning shifri ----------
  // Katak bosilganda pick(oddiy, shifr) chaqiriladi. Kalit o'zgarsa pastki qator yangilanadi.
  function table(key, onPick) {
    const zone = ui.openGuide();
    const state = keyState(key);
    let pick = onPick || null;
    const bottoms = [];
    const grid = ui.h("div", { class: "ctable" });
    caesar.ALPHABET.forEach((letter) => {
      const bottom = ui.h("span", { class: "ct-bottom" });
      bottoms.push(bottom);
      grid.append(ui.h("button", {
        class: "ct-cell",
        type: "button",
        "aria-label": `${letter} harfi`,
        onClick: () => {
          if (!pick) return;
          sound.play("tap");
          pick(letter, caesar.shift(letter, state.getKey()));
        },
      }, ui.h("span", { class: "ct-top", text: letter }), bottom));
    });
    zone.append(grid);
    const render = () => caesar.ALPHABET.forEach((l, i) => { bottoms[i].textContent = caesar.shift(l, state.getKey()); });
    render();
    return {
      getKey: state.getKey,
      setKey(next) {
        state.setKey(next);
        render();
      },
      setPick(fn) { pick = fn; },
    };
  }

  // ---------- Kalit boshqaruvi: [−] Jadval kaliti: k [+] (0–28, aylana) ----------
  // holder — table() yoki keyState(); onChange(k) — har o'zgarishda
  function keyControl(host, holder, onChange) {
    const val = ui.h("span", { class: "key-val", "aria-live": "polite" });
    const render = () => { val.textContent = `Jadval kaliti: ${holder.getKey()}`; };
    const step = (d) => {
      holder.setKey(holder.getKey() + d);
      sound.play("tap");
      render();
      if (onChange) onChange(holder.getKey());
    };
    host.append(ui.h("div", { class: "key-ctrl" },
      ui.h("button", { class: "key", type: "button", text: "−", "aria-label": "Kalitni kamaytirish", onClick: () => step(-1) }),
      val,
      ui.h("button", { class: "key", type: "button", text: "+", "aria-label": "Kalitni oshirish", onClick: () => step(1) })));
    render();
  }

  QK.caesarUi = { tile, tilesRow, wordSlots, keyState, table, keyControl };
})(window);
