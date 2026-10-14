/* NØRD – Demo-Website (Web-Studio)
   1. Mobiles Menü  2. Scroll-Einblendung  3. Embed-Hinweis
   4. Beat-Vorschau (Web Audio, live erzeugt)  5. Kontaktformular (Demo) */

/* ---------- 1. Mobiles Menü ---------- */
const toggle = document.querySelector(".nav__toggle");
const menu = document.getElementById("menu");

toggle.addEventListener("click", () => {
  const open = menu.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", open);
  toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
});
menu.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

/* ---------- 2. Scroll-Einblendung ---------- */
const revealEls = document.querySelectorAll(".section__head, .release, .about__img, .about__text, .beat, .price, .service, .booking__intro, .form");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el) => { el.classList.add("reveal"); io.observe(el); });
}

/* ---------- 3. Embed-Hinweis (Zwei-Klick-Lösung) ---------- */
const embedNote = document.getElementById("embed-note");
document.querySelectorAll("[data-embed]").forEach((a) =>
  a.addEventListener("click", (e) => {
    e.preventDefault();
    embedNote.hidden = false;
    embedNote.scrollIntoView({ behavior: "smooth", block: "nearest" });
  })
);

/* ---------- 4. Beat-Vorschau ----------
   Erzeugt kurze Trap-Loops direkt im Browser, damit die Demo
   ohne Audiodateien auskommt. Auf Kundenseiten durch <audio> mit MP3 ersetzen. */

const BEATS = {
  // root = MIDI-Ton des 808, notes = Melodie (Halbtöne über root+24, null = Pause)
  eis: {
    bpm: 140, root: 29, // F
    kick: [0, 7, 10],
    snare: [8],
    hats: "x.x.x.xxx.x.x.x.",
    rolls: [6, 14],
    notes: [0, null, 3, null, 7, null, 8, 7, null, null, 3, null, 2, null, null, null],
    wave: "triangle",
  },
  block: {
    bpm: 150, root: 33, // A
    kick: [0, 3, 6, 11],
    snare: [8],
    hats: "xxxxxxxxxxxxxxxx",
    rolls: [15],
    notes: [12, null, 12, 10, null, 7, null, null, 12, null, 15, null, 14, 12, null, 10],
    wave: "square",
  },
  nebel: {
    bpm: 130, root: 26, // D
    kick: [0, 9],
    snare: [8],
    hats: "x...x.x.x...x.xx",
    rolls: [],
    notes: [7, null, null, 5, null, null, 3, null, 2, null, null, null, 0, null, null, null],
    wave: "sine",
  },
};

let ctx = null;
let master = null;
let noiseBuf = null;
let current = null;   // { id, row }
let timer = null;
let step = 0;
let nextTime = 0;

const midiToHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

function initAudio() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.ratio.value = 4;
  master = ctx.createGain();
  master.gain.value = 0.8;
  master.connect(comp).connect(ctx.destination);

  noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}

function env(gainNode, t, peak, decay) {
  gainNode.gain.setValueAtTime(0.0001, t);
  gainNode.gain.exponentialRampToValueAtTime(peak, t + 0.005);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, t + decay);
}

function play808(t, midi, len) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  const shape = ctx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) { const x = i / 128 - 1; curve[i] = Math.tanh(x * 2.2); }
  shape.curve = curve;
  osc.type = "sine";
  osc.frequency.setValueAtTime(midiToHz(midi) * 3, t);
  osc.frequency.exponentialRampToValueAtTime(midiToHz(midi), t + 0.06);
  env(g, t, 0.9, len);
  osc.connect(shape).connect(g).connect(master);
  osc.start(t);
  osc.stop(t + len + 0.05);
}

function playNoise(t, { type, freq, q = 1, peak, decay }) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  env(g, t, peak, decay);
  src.connect(f).connect(g).connect(master);
  src.start(t);
  src.stop(t + decay + 0.05);
}

function playSnare(t) {
  playNoise(t, { type: "bandpass", freq: 1800, q: 0.8, peak: 0.55, decay: 0.22 });
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(220, t);
  o.frequency.exponentialRampToValueAtTime(160, t + 0.08);
  env(g, t, 0.35, 0.1);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + 0.15);
}

function playHat(t, peak = 0.12) {
  playNoise(t, { type: "highpass", freq: 8000, peak, decay: 0.04 });
}

function playLead(t, midi, len, wave) {
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = wave === "square" ? 1600 : 3000;
  const g = ctx.createGain();
  env(g, t, wave === "square" ? 0.06 : 0.11, len);
  f.connect(g).connect(master);
  [-6, 6].forEach((detune) => {
    const o = ctx.createOscillator();
    o.type = wave;
    o.frequency.value = midiToHz(midi);
    o.detune.value = detune;
    o.connect(f);
    o.start(t);
    o.stop(t + len + 0.05);
  });
}

function scheduleStep(beat, s, t, sixteenth) {
  const bar = Math.floor(s / 16);
  const i = s % 16;

  if (beat.kick.includes(i)) {
    // 808-Länge bis zum nächsten Kick
    const next = beat.kick.find((k) => k > i) ?? 16;
    play808(t, beat.root + (bar % 4 === 3 && i > 8 ? 3 : 0), Math.min((next - i) * sixteenth, 0.9));
  }
  if (beat.snare.includes(i)) playSnare(t);
  if (beat.hats[i] === "x") {
    if (beat.rolls.includes(i) && bar % 2 === 1) {
      for (let r = 0; r < 3; r++) playHat(t + (r * sixteenth) / 3, 0.09);
    } else {
      playHat(t, i % 4 === 0 ? 0.14 : 0.09);
    }
  }
  const n = beat.notes[i];
  if (n !== null && n !== undefined) playLead(t, beat.root + 36 + n, sixteenth * 2.5, beat.wave);
}

function scheduler() {
  const beat = BEATS[current.id];
  const sixteenth = 60 / beat.bpm / 4;
  while (nextTime < ctx.currentTime + 0.12) {
    scheduleStep(beat, step, nextTime, sixteenth);
    nextTime += sixteenth;
    step++;
  }
}

function stopBeat() {
  clearInterval(timer);
  timer = null;
  if (current) {
    current.row.classList.remove("is-playing");
    current.row.querySelector(".beat__play").setAttribute("aria-label", current.row.querySelector("h3").textContent + " abspielen");
  }
  current = null;
}

function startBeat(row) {
  initAudio();
  if (ctx.state === "suspended") ctx.resume();
  stopBeat();
  current = { id: row.dataset.beat, row };
  row.classList.add("is-playing");
  row.querySelector(".beat__play").setAttribute("aria-label", row.querySelector("h3").textContent + " stoppen");
  step = 0;
  nextTime = ctx.currentTime + 0.05;
  timer = setInterval(scheduler, 25);
  scheduler();
}

document.querySelectorAll(".beat").forEach((row) => {
  row.querySelector(".beat__play").addEventListener("click", () => {
    if (current && current.row === row) stopBeat();
    else startBeat(row);
  });
});

/* ---------- 5. Kontaktformular (Demo) ----------
   Auf Kundenseiten: action="https://formspree.io/f/…" und method="POST" setzen
   und das preventDefault() unten entfernen. */

const form = document.getElementById("contact-form");
const status = form.querySelector(".form__status");
const topic = document.getElementById("topic");
const message = document.getElementById("message");

// Lizenz-Buttons füllen das Formular vor
document.querySelectorAll("[data-license]").forEach((a) =>
  a.addEventListener("click", () => {
    topic.value = "Beat-Lizenz";
    if (!message.value.trim()) message.value = `Hi NØRD, ich interessiere mich für: ${a.dataset.license}.\n\n`;
  })
);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let ok = true;
  form.querySelectorAll("[required]").forEach((el) => {
    const valid = el.type === "checkbox" ? el.checked : el.checkValidity() && el.value.trim() !== "";
    (el.type === "checkbox" ? el.closest(".check") : el).classList.toggle("is-invalid", !valid);
    if (!valid) ok = false;
  });

  status.className = "form__status";
  if (!ok) {
    status.textContent = "Bitte fülle alle Felder aus und bestätige den Datenschutz.";
    status.classList.add("is-error");
    return;
  }
  status.textContent = "Danke! (Demo: Es wurde nichts verschickt. Auf einer echten Seite landet die Nachricht direkt im Postfach.)";
  status.classList.add("is-ok");
  form.reset();
});
