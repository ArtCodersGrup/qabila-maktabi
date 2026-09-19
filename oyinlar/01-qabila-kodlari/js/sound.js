// Tovush effektlari — Web Audio bilan yasaladi, tayyor fayl kerak emas.
// Brauzer talabi: AudioContext bola birinchi marta bosgandan keyin yaratiladi (unlock).
(function (root) {
  "use strict";

  let ctx = null;
  let muted = false;

  function unlock() {
    if (ctx) {
      if (ctx.state === "suspended") ctx.resume();
      return;
    }
    const AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return;
    try {
      ctx = new AC();
    } catch (e) {
      ctx = null;
    }
  }

  // Bitta nota: chastota (Hz), boshlanishi va davomiyligi (soniya), to'lqin turi, balandligi
  function tone(freq, start, dur, type, vol) {
    const t0 = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  const SOUNDS = {
    tap: () => tone(660, 0, 0.06, "triangle", 0.15),
    correct: () => {
      tone(523, 0, 0.12, "triangle", 0.25);
      tone(784, 0.1, 0.2, "triangle", 0.25);
    },
    retry: () => {
      tone(392, 0, 0.12, "sine", 0.2);
      tone(330, 0.12, 0.18, "sine", 0.2);
    },
    win: () => [523, 659, 784, 1047].forEach((f, k) => tone(f, k * 0.12, 0.25, "triangle", 0.25)),
    tak: () => tone(420, 0, 0.08, "square", 0.12),
    dum: () => tone(110, 0, 0.25, "sine", 0.5),
  };

  function play(name) {
    if (muted || !ctx || !SOUNDS[name]) return;
    try {
      SOUNDS[name]();
    } catch (e) {
      // Ovoz chiqmasa ham o'yin davom etadi
    }
  }

  root.QK = root.QK || {};
  root.QK.sound = {
    unlock,
    play,
    setMuted: (m) => { muted = !!m; },
    isMuted: () => muted,
  };
})(window);
