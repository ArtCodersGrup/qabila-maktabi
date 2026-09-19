// Tugagan bosqichlar va ovoz tanlovini brauzerda saqlash. Har bir o'yin o'z kaliti bilan:
// const store = QK.storage.create("qabila-kodlari:v1", 3). Xato bo'lsa jim o'tkazib yuboradi.
(function (root) {
  "use strict";

  function create(key, stageCount) {
    const defaults = () => ({ done: Array(stageCount).fill(false), muted: false });

    function load() {
      try {
        const raw = root.localStorage.getItem(key);
        if (!raw) return defaults();
        const data = JSON.parse(raw);
        const ok = Array.isArray(data.done) && data.done.length === stageCount && typeof data.muted === "boolean";
        return ok ? { done: data.done.map(Boolean), muted: data.muted } : defaults();
      } catch (e) {
        return defaults();
      }
    }

    function save(state) {
      try {
        root.localStorage.setItem(key, JSON.stringify(state));
      } catch (e) {
        // Saqlab bo'lmadi (maxfiy rejim va h.k.) — o'yin baribir ishlaydi
      }
    }

    return { load, save };
  }

  root.QK = root.QK || {};
  root.QK.storage = { create };
})(window);
