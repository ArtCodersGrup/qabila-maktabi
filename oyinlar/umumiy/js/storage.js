// Tugagan bosqichlar, yulduzlar, qiyin rejim va ovoz tanlovini brauzerda saqlash. Har bir o'yin o'z kaliti bilan:
// const store = QK.storage.create("qabila-kodlari:v1", 3). Xato bo'lsa jim o'tkazib yuboradi.
// Holat: { done: bool[], stars: 0..3[], hard: bool[], muted }. Eski yozuv (faqat done/muted) ham o'qiladi:
// tugagan bosqichga 2 yulduz beriladi (qancha xato bo'lgani noma'lum).
(function (root) {
  "use strict";

  // ---------- Akkaunt bilan sinxron ----------
  // Bola kirgan bo'lsa (hisob.js "qabila:hisob:v1" ni yozadi) va sayt o'z serverida ochilgan bo'lsa,
  // saqlangan kalit navbatga qo'yiladi va serverga yuboriladi. Internet bo'lmasa — navbatda qoladi.
  const KIRGAN = "qabila:hisob:v1";
  const NAVBAT = "qabila:navbat:v1";
  const OZIMIZ = ["kelajagim.uz", "www.kelajagim.uz", "localhost", "127.0.0.1"];
  let taymer = null;

  function kirganmi() {
    try {
      const loc = root.location;
      return !!loc && /^https?:$/.test(loc.protocol) && OZIMIZ.includes(loc.hostname) && !!root.localStorage.getItem(KIRGAN);
    } catch (e) {
      return false;
    }
  }

  function navbat() {
    try {
      const n = JSON.parse(root.localStorage.getItem(NAVBAT) || "[]");
      return Array.isArray(n) ? n.filter((k) => typeof k === "string").slice(0, 200) : [];
    } catch (e) {
      return [];
    }
  }

  function navbatga(key) {
    if (!kirganmi()) return;
    try {
      const n = navbat();
      if (!n.includes(key)) n.push(key);
      root.localStorage.setItem(NAVBAT, JSON.stringify(n.slice(-200)));
    } catch (e) {
      return;
    }
    clearTimeout(taymer);
    taymer = setTimeout(yubor, 1500);
  }

  function yubor() {
    if (!kirganmi() || typeof root.fetch !== "function") return;
    const n = navbat();
    if (!n.length) return;
    const kalitlar = {};
    for (const k of n) {
      try {
        const v = JSON.parse(root.localStorage.getItem(k));
        if (v && typeof v === "object" && !Array.isArray(v)) delete v.muted;
        if (v != null) kalitlar[k] = v;
      } catch (e) { /* buzuq yozuv — yuborilmaydi */ }
    }
    root.fetch("/api/progress", {
      method: "POST", credentials: "same-origin", keepalive: true,
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kalitlar }),
    }).then((r) => {
      if (!r.ok) return;
      // Yuborilganlari navbatdan chiqadi (shu orada qo'shilgan yangilari qoladi)
      try {
        root.localStorage.setItem(NAVBAT, JSON.stringify(navbat().filter((k) => !n.includes(k))));
      } catch (e) { /* e'tiborsiz */ }
    }, () => { /* internet yo'q — navbatda qoladi */ });
  }

  if (root.addEventListener) {
    root.addEventListener("online", yubor);
    setTimeout(yubor, 2000); // oldingi sahifadan qolgan navbat
  }

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
        navbatga(key);
      } catch (e) {
        // Saqlab bo'lmadi (maxfiy rejim va h.k.) — o'yin baribir ishlaydi
      }
    }

    return { load, save };
  }

  root.QK = root.QK || {};
  root.QK.storage = { create, navbatga, KIRGAN };
})(window);
