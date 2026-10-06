// Tovush effektlari — Web Audio bilan yasaladi, tayyor fayl kerak emas.
// Brauzer talabi: AudioContext bola birinchi marta bosgandan keyin yaratiladi (unlock).
(function (root) {
  "use strict";

  let ctx = null;
  let muted = false;
  let beepNodes = [];
  let beepMaster = null;

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

  // Shovqin bo'lagi (otish, portlash): oq shovqin + past o'tkazuvchi filtr, balandligi so'nib boradi
  function shovqin(start, dur, vol, kesish, kesishOxiri) {
    const t0 = ctx.currentTime + start;
    const n = Math.floor(ctx.sampleRate * (dur + 0.05));
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filtr = ctx.createBiquadFilter();
    filtr.type = "lowpass";
    filtr.frequency.setValueAtTime(kesish, t0);
    filtr.frequency.exponentialRampToValueAtTime(kesishOxiri || 200, t0 + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filtr);
    filtr.connect(gain);
    gain.connect(ctx.destination);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  }
  // Pastga sirpanadigan nota (tegish, portlash tanasi)
  function sirpan(f0, f1, start, dur, type, vol) {
    const t0 = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t0);
    osc.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  const SOUNDS = {
    tap: () => tone(660, 0, 0.06, "triangle", 0.15),
    // Tank jangi: o'q uzish (qisqa "puf"), tegish (metall "dang"), portlash (uzun gumburlash), yurish (motor "g'ir")
    fire: () => { shovqin(0, 0.18, 0.5, 2400, 300); sirpan(180, 60, 0, 0.15, "square", 0.25); },
    hit: () => { shovqin(0, 0.1, 0.35, 5000, 800); tone(1100, 0, 0.08, "square", 0.18); sirpan(900, 300, 0.02, 0.18, "triangle", 0.22); },
    boom: () => { shovqin(0, 0.6, 0.7, 900, 80); sirpan(120, 35, 0, 0.6, "sine", 0.6); },
    motor: () => { shovqin(0, 0.3, 0.12, 500, 250); },
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

  // Morze signallarini to'xtatish (bosh ekranga qaytganda, yangi signal boshlanganda yoki ovoz o'chirilganda).
  // Barcha ossillatorlar bitta gain tuguni orqali ulangan — uni uzish darrov jim qiladi,
  // ossillator.stop() ishlamay qolsa ham (masalan, ikkinchi marta chaqirilsa).
  function stopBeeps() {
    beepNodes.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        // allaqachon to'xtagan
      }
    });
    beepNodes = [];
    if (beepMaster) {
      try {
        beepMaster.disconnect();
      } catch (e) {
        // allaqachon uzilgan
      }
      beepMaster = null;
    }
  }

  // Morze signallari: plan = [{ on, off }] millisekundda. Tekis ovoz, boshi va oxiri silliq.
  function beeps(plan) {
    stopBeeps();
    if (muted || !ctx) return;
    try {
      beepMaster = ctx.createGain();
      beepMaster.gain.setValueAtTime(1, ctx.currentTime);
      beepMaster.connect(ctx.destination);
      let t = ctx.currentTime;
      for (const b of plan) {
        const on = b.on / 1000;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.005);
        gain.gain.setValueAtTime(0.3, t + on - 0.005);
        gain.gain.linearRampToValueAtTime(0, t + on);
        osc.connect(gain);
        gain.connect(beepMaster);
        osc.start(t);
        osc.stop(t + on + 0.01);
        beepNodes.push(osc);
        t += on + b.off / 1000;
      }
    } catch (e) {
      // Ovoz chiqmasa ham o'yin davom etadi
    }
  }

  root.QK = root.QK || {};
  root.QK.sound = {
    unlock,
    play,
    beeps,
    stopBeeps,
    setMuted: (m) => { muted = !!m; if (muted) stopBeeps(); },
    isMuted: () => muted,
  };
})(window);
