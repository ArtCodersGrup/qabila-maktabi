// Tugagan bosqichlar, yulduzlar, qiyin rejim va ovoz tanlovini brauzerda saqlash. Har bir o'yin o'z kaliti bilan:
// const store = QK.storage.create("qabila-kodlari:v1", 3). Xato bo'lsa jim o'tkazib yuboradi.
// Holat: { done: bool[], stars: 0..3[], hard: bool[], muted }. Eski yozuv (faqat done/muted) ham o'qiladi:
// tugagan bosqichga 2 yulduz beriladi (qancha xato bo'lgani noma'lum).
(function (root) {
  "use strict";

  function create(key, stageCount) {
    const defaults = () => ({
      done: Array(stageCount).fill(false),
      stars: Array(stageCount).fill(0),
      hard: Array(stageCount).fill(false),
      muted: false,
    });

    function load() {
      try {
        const raw = root.localStorage.getItem(key);
        if (!raw) return defaults();
        const data = JSON.parse(raw);
        const ok = data && Array.isArray(data.done) && data.done.length === stageCount && typeof data.muted === "boolean";
        if (!ok) return defaults();
        const done = data.done.map(Boolean);
        const stars = Array.isArray(data.stars) && data.stars.length === stageCount
          ? data.stars.map((x) => Math.min(3, Math.max(0, Math.round(Number(x) || 0))))
          : done.map((d) => (d ? 2 : 0));
        const hard = Array.isArray(data.hard) && data.hard.length === stageCount
          ? data.hard.map(Boolean)
          : Array(stageCount).fill(false);
        return { done, stars, hard, muted: data.muted };
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
