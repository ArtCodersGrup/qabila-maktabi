// Tugagan bosqichlar va ovoz tanlovini brauzerda saqlash. Xato bo'lsa jim o'tkazib yuboradi.
(function (root) {
  "use strict";

  const KEY = "qabila-kodlari:v1";
  const defaults = () => ({ done: [false, false, false], muted: false });

  function load() {
    try {
      const raw = root.localStorage.getItem(KEY);
      if (!raw) return defaults();
      const data = JSON.parse(raw);
      const ok = Array.isArray(data.done) && data.done.length === 3 && typeof data.muted === "boolean";
      return ok ? { done: data.done.map(Boolean), muted: data.muted } : defaults();
    } catch (e) {
      return defaults();
    }
  }

  function save(state) {
    try {
      root.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      // Saqlab bo'lmadi (maxfiy rejim va h.k.) — o'yin baribir ishlaydi
    }
  }

  root.QK = root.QK || {};
  root.QK.storage = { load, save };
})(window);
