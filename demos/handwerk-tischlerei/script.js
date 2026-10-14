/* Tischlerei Falk – Demo-Website (Web-Studio)
   1. Mobiles Menü  2. Scroll-Einblendung  3. Möbel-Zeichnungen (SVG)
   4. Preisrechner  5. Referenz-Filter  6. Kleinigkeiten (KW, Öffnungszeiten, Karte)
   7. Kontaktformular (Demo) */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const euro = (n) => n.toLocaleString("de-DE", { maximumFractionDigits: 0 }) + " €";

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
    toggle.setAttribute("aria-label", "Menü öffnen");
  })
);

/* ---------- 2. Scroll-Einblendung ---------- */
const revealEls = document.querySelectorAll(".section__head, .service, .calc__form, .ref, .about__img, .about__text, .step, .quote, .faq__head, .faq__list, .booking__intro, .form");
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-visible");
      io.unobserve(e.target);
      // Danach Klassen entfernen, damit Hover-Effekte wieder greifen
      e.target.addEventListener("transitionend", () => e.target.classList.remove("reveal", "is-visible"), { once: true });
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => { el.classList.add("reveal"); io.observe(el); });
}

/* ---------- 3. Möbel-Zeichnungen ----------
   Zeichnet Schrank, Regal, Sideboard, Tisch und Küche als SVG in Zentimetern.
   Wird für Hero, Referenzen und Preisrechner genutzt. Auf Kundenseiten durch Fotos ersetzen. */

const MATERIALS = {
  mdf:    { label: "weiß lackiert",   rate: 520,  weeks: 0, fill: "#efe9df", grain: null,      edge: "#bdb2a1", handle: "#4a4038" },
  eicheF: { label: "Eiche furniert",  rate: 690,  weeks: 1, fill: "#cfa269", grain: "#a87a45", edge: "#8a6237", handle: "#2f2822" },
  eiche:  { label: "Eiche massiv",    rate: 960,  weeks: 2, fill: "#c8965c", grain: "#9c6d3c", edge: "#7d5631", handle: "#2f2822" },
  nuss:   { label: "Nussbaum massiv", rate: 1180, weeks: 3, fill: "#7a5038", grain: "#55351f", edge: "#3f271a", handle: "#e2cfae" },
};

const VB_W = 400, VB_H = 290, FLOOR = 244;
const BOOKS = ["#7d8b6a", "#a24a24", "#3f4f63", "#c98a1b", "#e8dfcf", "#5b4636", "#9aa7ad", "#b86f4c"];
let uidCounter = 0;

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r = (x, y, w, h, fill, extra = "") =>
  `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0, w).toFixed(1)}" height="${Math.max(0, h).toFixed(1)}" fill="${fill}" ${extra}/>`;
const shade = (a) => (a > 0 ? `fill="#fff" opacity="${a}"` : `fill="#000" opacity="${-a}"`);

// Sichtbare Höhe in cm (beim Tisch ist "h" die Tiefe)
const visualH = (type, w, h) => (type === "tisch" ? 75 + h * 0.3 : h);

const DRAW = {
  schrank(o, c) {
    const W = o.w * c.s, H = o.h * c.s, x = 200 - W / 2, y = FLOOR - H;
    const plinth = 8 * c.s, doorH = H - plinth;
    let out = "";
    let outline = `M${x} ${y}H${x + W}V${FLOOR}H${x}Z`;

    if (o.slope) {
      const kx = x + W * 0.38, yR = y + H * 0.42, k = (yR - y) / (x + W - kx);
      outline = `M${x} ${y}H${kx}L${x + W} ${yR}V${FLOOR}H${x}Z`;
      // Dachschräge an der Wand
      out += `<path d="M${kx - y / k} 0H${VB_W}V${yR + k * (VB_W - x - W)}Z" fill="#000" opacity=".07"/>`;
      out += `<path d="M${kx - y / k} 0L${VB_W} ${yR + k * (VB_W - x - W)}" stroke="#000" stroke-opacity=".15"/>`;
    }

    out += `<defs><clipPath id="c-${c.uid}"><path d="${outline}"/></clipPath></defs><g clip-path="url(#c-${c.uid})">`;
    out += r(x, y, W, H, c.fv);

    if (o.slide) {
      const n = o.w > 260 ? 3 : 2, pw = W / n;
      for (let i = 0; i < n; i++) {
        const px = x + i * pw - (i % 2 ? 4 : 0);
        out += r(px, y + 2, pw + (i % 2 ? 8 : 0), doorH - 4, c.fv, `stroke="${c.m.edge}" stroke-width=".8"`);
        if (i % 2) out += r(px, y + 2, pw + 8, doorH - 4, "none", `stroke="#000" stroke-opacity=".18" stroke-width="2"`);
        else out += r(px, y + 2, pw, doorH - 4, "#000", `opacity=".06"`);
        out += r(px + (i % 2 ? 6 : pw - 8), y + doorH * 0.35, 2.5, doorH * 0.3, c.m.handle, `rx="1.2" opacity=".55"`);
      }
    } else {
      const n = Math.max(1, Math.round(o.w / 55)), dw = W / n;
      const drawerH = o.drawers ? doorH * 0.22 : 0;
      for (let i = 0; i < n; i++) {
        const dx = x + i * dw + 1;
        out += r(dx, y + 1, dw - 2, doorH - drawerH - 2, c.fv, `stroke="${c.m.edge}" stroke-width=".8"`);
        const leftSide = i % 2 === 1 || (i === n - 1 && n > 1 && n % 2 === 1);
        const hx = leftSide ? dx + 4 : dx + dw - 8;
        const hh = Math.max(12, 26 * c.s);
        out += r(hx, y + (doorH - drawerH) * 0.48 - hh / 2, 2.2, hh, c.m.handle, `rx="1.1"`);
        if (drawerH) {
          out += r(dx, FLOOR - plinth - drawerH, dw - 2, drawerH - 1, c.fv, `stroke="${c.m.edge}" stroke-width=".8"`);
          out += r(dx + dw / 2 - 9, FLOOR - plinth - drawerH / 2 - 1, 16, 2.2, c.m.handle, `rx="1.1"`);
        }
      }
    }
    if (o.led) out += r(x, y, W, Math.min(30, H * 0.18), `url(#led-${c.uid})`);
    out += r(x, FLOOR - plinth, W, plinth, c.m.edge, `opacity=".75"`);
    out += `</g><path d="${outline}" fill="none" stroke="${c.m.edge}" stroke-width="1.2"/>`;
    return { svg: out, box: { x, y, w: W, h: H } };
  },

  regal(o, c) {
    const W = o.w * c.s, H = o.h * c.s, x = 200 - W / 2, y = FLOOR - H;
    const t = Math.max(2.6 * c.s, 2.2), plinth = 6 * c.s;
    const ix = x + t, iy = y + t, iw = W - 2 * t, ih = H - 2 * t - plinth;
    const nc = Math.max(1, Math.round(o.w / 80)), nr = Math.max(1, Math.round((o.h - 8) / 36));
    const cw = (iw - (nc - 1) * t) / nc, ch = (ih - (nr - 1) * t) / nr;
    const rnd = mulberry32(o.seed || 1);
    let back = r(x, y, W, H, c.fv) + r(x, y, W, H, "#000", `opacity=".28"`);
    let glow = "", items = "", boards = "";

    for (let row = 0; row < nr; row++) {
      for (let col = 0; col < nc; col++) {
        const cx = ix + col * (cw + t), cy = iy + row * (ch + t);
        if (o.led) glow += r(cx, cy, cw, ch * 0.7, `url(#ledv-${c.uid})`);
        const roll = rnd();
        if (roll < 0.14 && cw > 24) {
          // Pflanze im Topf
          const px = cx + cw * (0.3 + rnd() * 0.4), ph = Math.min(ch * 0.35, 12);
          items += r(px - ph * 0.45, cy + ch - ph, ph * 0.9, ph, "#b86f4c", `rx="1.5"`);
          items += `<ellipse cx="${px}" cy="${cy + ch - ph - ph * 0.5}" rx="${ph * 0.9}" ry="${ph * 0.7}" fill="#6f8a5b"/>`;
        } else if (roll < 0.86) {
          let bx = cx + 1.5;
          const stop = cx + cw * (0.45 + rnd() * 0.5);
          while (bx < stop) {
            const bw = Math.max(1.8, (2.4 + rnd() * 3) * c.s);
            const bh = ch * (0.6 + rnd() * 0.32);
            if (bx + bw > cx + cw - 1) break;
            items += r(bx, cy + ch - bh, bw - 0.4, bh, BOOKS[Math.floor(rnd() * BOOKS.length)]);
            bx += bw;
          }
        }
        if (col > 0 && row === 0) boards += r(cx - t, iy, t, ih, c.fv);
      }
      if (row > 0) boards += r(ix, iy + row * (ch + t) - t, iw, t, c.fh, `stroke="${c.m.edge}" stroke-width=".4"`);
    }
    const frame =
      r(x, y, t, H, c.fv) + r(x + W - t, y, t, H, c.fv) + r(x, y, W, t, c.fh) +
      r(x, FLOOR - plinth - t, W, t, c.fh) + r(x, FLOOR - plinth, W, plinth, c.m.edge, `opacity=".8"`) +
      r(x, y, W, H, "none", `stroke="${c.m.edge}" stroke-width="1.2"`);
    return { svg: back + glow + items + boards + frame, box: { x, y, w: W, h: H } };
  },

  sideboard(o, c) {
    const W = o.w * c.s, H = o.h * c.s, x = 200 - W / 2, y = FLOOR - H;
    const legH = Math.min(18, o.h * 0.24) * c.s, bodyH = H - legH, top = 2.6 * c.s;
    let out = "";
    if (o.led) out += `<ellipse cx="200" cy="${y}" rx="${W * 0.55}" ry="${Math.min(70, H * 0.9)}" fill="url(#ledr-${c.uid})"/>`;
    [0.07, 0.93].forEach((p) => {
      const lx = x + W * p;
      out += `<path d="M${lx - 3.5} ${y + bodyH}L${lx + 3.5} ${y + bodyH}L${lx + 1.8} ${FLOOR}L${lx - 1.8} ${FLOOR}Z" fill="${c.m.edge}"/>`;
    });
    out += r(x, y, W, bodyH, c.fv, `stroke="${c.m.edge}" stroke-width="1"`);
    out += r(x - 1, y, W + 2, top, c.fh, `stroke="${c.m.edge}" stroke-width=".6"`);
    const n = Math.max(2, Math.round(o.w / 50)), dw = W / n, fy = y + top + 1.5, fh = bodyH - top - 3;
    const drawerCol = o.drawers ? Math.floor(n / 2) : -1;
    for (let i = 0; i < n; i++) {
      const dx = x + i * dw + 1.5;
      if (i === drawerCol) {
        const dh = fh / 3;
        for (let k = 0; k < 3; k++) {
          out += r(dx, fy + k * dh, dw - 3, dh - 1.5, c.fh, `stroke="${c.m.edge}" stroke-width=".7"`);
          out += r(dx + dw / 2 - 9, fy + k * dh + dh / 2 - 1.8, 15, 2.2, c.m.handle, `rx="1.1"`);
        }
      } else {
        out += r(dx, fy, dw - 3, fh, c.fv, `stroke="${c.m.edge}" stroke-width=".7"`);
        const hx = i < n / 2 ? dx + dw - 9 : dx + 4;
        out += r(hx, fy + fh * 0.3, 2.2, Math.max(10, fh * 0.3), c.m.handle, `rx="1.1"`);
      }
    }
    // Deko auf dem Sideboard
    out += r(x + W * 0.16, y - 26, 12, 26, "#3f4f63", `rx="5"`) + `<path d="M${x + W * 0.16 + 6} ${y - 26}q-6 -18 -14 -24M${x + W * 0.16 + 6} ${y - 26}q4 -20 12 -26" stroke="#6f8a5b" stroke-width="2" fill="none"/>`;
    out += r(x + W * 0.7, y - 7, 34, 7, "#e8dfcf") + r(x + W * 0.7 + 3, y - 13, 28, 6, "#a24a24");
    return { svg: out, box: { x, y, w: W, h: H } };
  },

  tisch(o, c) {
    // Vorderbeine stehen etwas vor der Wand auf dem Boden
    const base = FLOOR + 18, W = o.w * c.s, H = 75 * c.s, x = 200 - W / 2, y = base - H;
    const tt = 4.5 * c.s, d = o.h * c.s * 0.3, legW = 7 * c.s, inset = 6 * c.s;
    let out = `<ellipse cx="200" cy="${base - d * 0.3}" rx="${W * 0.5}" ry="${d * 0.45 + 4}" fill="#000" opacity=".1"/>`;
    // hintere Beine
    [x + d * 0.5 + inset, x + W - d * 0.5 - inset - legW].forEach((lx) => {
      out += r(lx, y - d, legW, base - d * 0.55 - (y - d), c.fv) + r(lx, y - d, legW, base - d * 0.55 - (y - d), "#000", `opacity=".35"`);
    });
    // Platte (perspektivisch)
    const topPath = `M${x + d * 0.5} ${y - d}H${x + W - d * 0.5}L${x + W} ${y}H${x}Z`;
    out += `<path d="${topPath}" fill="${c.fh}" stroke="${c.m.edge}" stroke-width=".8"/><path d="${topPath}" fill="#fff" opacity=".12"/>`;
    if (o.extend) {
      [-1, 1].forEach((side) => {
        const X = 200 + side * 24 * c.s, Xb = 200 + (X - 200) * ((W - d) / W);
        out += `<path d="M${X} ${y}L${Xb} ${y - d}" stroke="${c.m.edge}" stroke-dasharray="3 3"/>`;
      });
    }
    out += r(x, y, W, tt, c.fh, `stroke="${c.m.edge}" stroke-width=".8"`) + r(x, y, W, tt, "#000", `opacity=".12"`);
    out += r(x + inset, y + tt, W - inset * 2, 8 * c.s, c.fh) + r(x + inset, y + tt, W - inset * 2, 8 * c.s, "#000", `opacity=".25"`);
    // vordere Beine
    [x + inset, x + W - inset - legW].forEach((lx) => {
      out += r(lx, y + tt, legW, base - y - tt, c.fv, `stroke="${c.m.edge}" stroke-width=".8"`);
    });
    return { svg: out, box: { x, y: y - d, w: W, h: H + d } };
  },

  kueche(o, c) {
    const W = o.w * c.s, x = 200 - W / 2, s = c.s;
    const baseTop = FLOOR - 90 * s, counter = 4 * s, wallTop = FLOOR - o.h * s, wallH = 70 * s, plinth = 10 * s;
    const n = Math.max(2, Math.round(o.w / 60)), dw = W / n;
    let out = "";
    // Fliesenspiegel
    out += r(x, wallTop + wallH, W, baseTop - counter - wallTop - wallH, "#f4efe6");
    for (let tx = x + 14 * s; tx < x + W; tx += 14 * s) out += `<path d="M${tx} ${wallTop + wallH}V${baseTop - counter}" stroke="#000" stroke-opacity=".06"/>`;
    // Unterlicht
    out += r(x, wallTop + wallH, W, 26 * s, `url(#ledv-${c.uid})`);
    // Oberschränke
    for (let i = 0; i < n; i++) {
      out += r(x + i * dw + 0.8, wallTop, dw - 1.6, wallH, c.fv, `stroke="${c.m.edge}" stroke-width=".7"`);
      out += r(x + i * dw + 0.8, wallTop + wallH - 3, dw - 1.6, 3, "#000", `opacity=".25"`);
    }
    // Armatur
    const fx = x + W * 0.32;
    out += `<path d="M${fx} ${baseTop - counter}v${-20 * s}q0 ${-9 * s} ${9 * s} ${-9 * s}h${5 * s}" stroke="#8e969a" stroke-width="${Math.max(2, 2.4 * s)}" fill="none" stroke-linecap="round"/>`;
    // Arbeitsplatte + Unterschränke
    out += r(x - 2, baseTop - counter, W + 4, counter, "#4a4540");
    for (let i = 0; i < n; i++) {
      const dx = x + i * dw + 0.8;
      out += r(dx, baseTop + 1, dw - 1.6, FLOOR - plinth - baseTop - 2, c.fv, `stroke="${c.m.edge}" stroke-width=".7"`);
      out += r(dx, baseTop + 1, dw - 1.6, 3, "#000", `opacity=".3"`);
      if (i % 2 === 0 && i !== n - 1) out += `<path d="M${dx} ${baseTop + (FLOOR - plinth - baseTop) * 0.4}H${dx + dw - 1.6}" stroke="${c.m.edge}" stroke-width=".7"/>`;
    }
    out += r(x, FLOOR - plinth, W, plinth, "#3b3632");
    return { svg: out, box: { x, y: wallTop, w: W, h: FLOOR - wallTop } };
  },
};

function drawSVG(o) {
  const m = MATERIALS[o.mat] || MATERIALS.eiche;
  const uid = "d" + ++uidCounter;
  const vh = visualH(o.type, o.w, o.h);
  const refW = o.refW || o.w * 1.16;
  const refH = o.refH || vh * 1.12;
  const s = Math.min(340 / refW, (FLOOR - 20) / refH);
  const c = { s, m, uid, fv: `url(#gv-${uid})`, fh: `url(#gh-${uid})` };

  const grain = m.grain
    ? `<path d="M0 5Q20 2 40 5T80 5M0 13Q25 16 45 12T80 13" stroke="${m.grain}" stroke-width=".7" fill="none" opacity=".55"/>`
    : "";
  const defs = `<defs>
    <pattern id="gv-${uid}" width="80" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(90)"><rect width="80" height="18" fill="${m.fill}"/>${grain}</pattern>
    <pattern id="gh-${uid}" width="80" height="18" patternUnits="userSpaceOnUse"><rect width="80" height="18" fill="${m.fill}"/>${grain}</pattern>
    <linearGradient id="led-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd88a" stop-opacity=".8"/><stop offset="1" stop-color="#ffd88a" stop-opacity="0"/></linearGradient>
    <linearGradient id="ledv-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2a3" stop-opacity=".75"/><stop offset="1" stop-color="#ffe2a3" stop-opacity="0"/></linearGradient>
    <radialGradient id="ledr-${uid}"><stop offset="0" stop-color="#ffe2a3" stop-opacity=".8"/><stop offset="1" stop-color="#ffe2a3" stop-opacity="0"/></radialGradient>
  </defs>`;

  const room =
    r(0, 0, VB_W, VB_H, o.wall || "#e9dfcf") +
    r(0, FLOOR, VB_W, VB_H - FLOOR, "#d4bf9d") +
    `<path d="M0 ${FLOOR + 14}H${VB_W}M0 ${FLOOR + 30}H${VB_W}" stroke="#000" stroke-opacity=".05"/>` +
    r(0, FLOOR - 5, VB_W, 5, "#fbf7f0");

  const piece = DRAW[o.type](o, c);
  const b = piece.box;
  const shadow = o.type === "tisch" ? "" : `<ellipse cx="200" cy="${FLOOR + 2}" rx="${b.w * 0.56}" ry="5" fill="#000" opacity=".12"/>`;

  let dims = "";
  if (o.dims) {
    const dy = FLOOR + (o.type === "tisch" ? 34 : 24), lc = "#6b5f52";
    const label = o.type === "tisch" ? `${o.w} × ${o.h} cm` : `${o.w} cm`;
    dims += `<g stroke="${lc}" stroke-width="1"><path d="M${b.x} ${dy}H${b.x + b.w}M${b.x} ${dy - 5}v10M${b.x + b.w} ${dy - 5}v10"/></g>`;
    dims += `<rect x="${200 - label.length * 3.6 - 6}" y="${dy - 9}" width="${label.length * 7.2 + 12}" height="18" rx="9" fill="#d4bf9d"/>`;
    dims += `<text x="200" y="${dy + 4}" text-anchor="middle" font-size="12" font-weight="600" fill="${lc}" font-family="Segoe UI, system-ui, sans-serif">${label}</text>`;
    if (o.type !== "tisch") {
      const hx = b.x + b.w + 16 > VB_W - 8 ? b.x - 16 : b.x + b.w + 16;
      dims += `<g stroke="${lc}" stroke-width="1"><path d="M${hx} ${b.y}V${b.y + b.h}M${hx - 5} ${b.y}h10M${hx - 5} ${b.y + b.h}h10"/></g>`;
      dims += `<text transform="translate(${hx - 5} ${b.y + b.h / 2}) rotate(-90)" text-anchor="middle" font-size="12" font-weight="600" fill="${lc}" font-family="Segoe UI, system-ui, sans-serif">${o.h} cm</text>`;
    }
  }

  return `<svg viewBox="0 0 ${VB_W} ${VB_H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${defs}${room}${shadow}${piece.svg}${dims}</svg>`;
}

document.querySelectorAll(".drawing[data-draw]").forEach((el) => {
  const d = el.dataset;
  el.innerHTML = drawSVG({
    type: d.draw, w: +d.w, h: +d.h, mat: d.mat, wall: d.wall, seed: +d.seed || 1,
    slope: "slope" in d, slide: "slide" in d, led: "led" in d, drawers: "drawers" in d,
  });
});

/* ---------- 4. Preisrechner ----------
   Preis = Grundbetrag + Fläche (m²) × Materialpreis × Faktor je Möbelart, plus Extras.
   Für Kunden: Zahlen in TYPES, MATERIALS und EXTRAS anpassen. */

const TYPES = {
  schrank:   { label: "Einbauschrank", w: [80, 400, 240], h: [180, 280, 240], hLabel: "Höhe",  factor: 1,    base: 450, weeks: 6 },
  regal:     { label: "Bücherwand",    w: [80, 500, 280], h: [100, 280, 220], hLabel: "Höhe",  factor: 0.72, base: 300, weeks: 5 },
  sideboard: { label: "Sideboard",     w: [100, 300, 180], h: [50, 100, 80],  hLabel: "Höhe",  factor: 1.25, base: 350, weeks: 5 },
  tisch:     { label: "Esstisch",      w: [140, 300, 200], h: [80, 120, 90],  hLabel: "Tiefe", factor: 1.7,  base: 600, weeks: 6 },
};
const EXTRAS = {
  slide:   { label: "Schiebetüren", pct: 0.12 },
  led:     { label: "LED-Beleuchtung", add: 290 },
  drawers: { label: "Schubladen innen", add: 380 },
  extend:  { label: "Auszug + 2 Einlegeplatten", add: 520 },
};

const calc = document.getElementById("calc");
const wInput = document.getElementById("calc-w");
const hInput = document.getElementById("calc-h");
const outW = document.getElementById("out-w");
const outH = document.getElementById("out-h");
const labelH = document.getElementById("label-h");
const priceEl = document.getElementById("price");
const breakdownEl = document.getElementById("breakdown");
const leadEl = document.getElementById("leadtime");
const calcDrawing = document.getElementById("calc-drawing");
const round50 = (n) => Math.round(n / 50) * 50;

let shown = { low: 0, high: 0 };
let lastEstimate = null;
let animFrame = null;

function readCalc() {
  const f = new FormData(calc);
  return {
    type: f.get("type"), mat: f.get("mat"),
    w: +wInput.value, h: +hInput.value,
    slide: f.has("slide"), led: f.has("led"), drawers: f.has("drawers"), extend: f.has("extend"), mount: f.has("mount"),
  };
}

function setType(type) {
  const t = TYPES[type];
  [[wInput, t.w], [hInput, t.h]].forEach(([input, [min, max, def]]) => {
    input.min = min; input.max = max; input.value = def;
  });
  labelH.textContent = t.hLabel;
  calc.querySelectorAll(".extras .check").forEach((label) => {
    const on = label.dataset.types.split(" ").includes(type);
    const input = label.querySelector("input");
    label.hidden = !on;
    input.disabled = !on;
    if (!on && input.name !== "mount") input.checked = false;
  });
}

function animatePrice(low, high) {
  cancelAnimationFrame(animFrame);
  const from = { ...shown };
  const render = (l, h) => { priceEl.textContent = `ca. ${euro(l)} – ${euro(h)}`; };
  if (reduceMotion || !from.low) {
    shown = { low, high }; render(low, high); return;
  }
  const start = performance.now(), dur = 380;
  const tick = (now) => {
    const p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3);
    shown = { low: from.low + (low - from.low) * e, high: from.high + (high - from.high) * e };
    render(round50(shown.low), round50(shown.high));
    if (p < 1) animFrame = requestAnimationFrame(tick);
  };
  animFrame = requestAnimationFrame(tick);
}

function updateCalc() {
  const o = readCalc(), t = TYPES[o.type], m = MATERIALS[o.mat];
  outW.textContent = o.w + " cm";
  outH.textContent = o.h + " cm";

  const area = (o.w / 100) * (o.h / 100);
  const work = t.base + area * m.rate * t.factor;
  const items = [[`${t.label}, ${m.label}`, work]];
  Object.entries(EXTRAS).forEach(([key, ex]) => {
    if (o[key]) items.push([ex.label, ex.pct ? work * ex.pct : ex.add]);
  });
  const subtotal = items.reduce((sum, [, v]) => sum + v, 0);
  if (o.mount) items.push(["Lieferung & Montage", Math.max(180, subtotal * 0.08)]);
  const total = items.reduce((sum, [, v]) => sum + v, 0);
  const low = round50(total * 0.92), high = round50(total * 1.1);

  animatePrice(low, high);
  breakdownEl.innerHTML = items
    .map(([label, v]) => `<li><span>${label}</span><span>≈ ${euro(Math.round(v / 10) * 10)}</span></li>`)
    .join("");
  const weeks = t.weeks + m.weeks + (o.drawers || o.slide || o.extend ? 1 : 0);
  leadEl.textContent = `Fertig in ca. ${weeks}–${weeks + 2} Wochen nach Auftrag`;

  const tMax = TYPES[o.type];
  calcDrawing.innerHTML = drawSVG({
    ...o, dims: true, seed: 5, wall: "#ebe2d3",
    refW: tMax.w[1] * 1.02, refH: visualH(o.type, tMax.w[1], tMax.h[1]) * 1.02,
  });
  calcDrawing.setAttribute("aria-label", `Vorschau: ${t.label}, ${o.w} × ${o.h} cm, ${m.label}`);

  const extras = Object.keys(EXTRAS).filter((k) => o[k]).map((k) => EXTRAS[k].label);
  if (o.mount) extras.push("Lieferung & Montage");
  lastEstimate = {
    topic: t.label,
    text: `${t.label}, ca. ${o.w} × ${o.h} cm, ${m.label}${extras.length ? ", mit " + extras.join(", ") : ""}. Ihr Preisrechner schätzt ca. ${euro(low)} – ${euro(high)}.`,
  };
}

calc.addEventListener("change", (e) => {
  if (e.target.name === "type") setType(e.target.value);
  updateCalc();
});
calc.addEventListener("input", (e) => {
  if (e.target.type === "range") updateCalc();
});
setType("schrank");
updateCalc();

/* ---------- 5. Referenz-Filter ---------- */
const filterBtns = document.querySelectorAll(".filter__btn");
filterBtns.forEach((btn) =>
  btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    filterBtns.forEach((b) => b.setAttribute("aria-pressed", b === btn));
    document.querySelectorAll(".ref").forEach((ref) => {
      ref.hidden = f !== "alle" && ref.dataset.cat !== f;
    });
  })
);

/* ---------- 6. Kleinigkeiten ---------- */
// Nächste freie Aufmaß-Woche: aktuelle Kalenderwoche + 2
function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}
const weekEl = document.querySelector("[data-week]");
if (weekEl) weekEl.textContent = "KW " + isoWeek(new Date(Date.now() + 14 * 86400000));

// Jetzt geöffnet?
const HOURS = { 1: [7, 16.5], 2: [7, 16.5], 3: [7, 16.5], 4: [7, 16.5], 5: [7, 13] };
const badge = document.getElementById("open-badge");
if (badge) {
  const now = new Date(), slot = HOURS[now.getDay()], t = now.getHours() + now.getMinutes() / 60;
  const open = slot && t >= slot[0] && t < slot[1];
  badge.textContent = open ? "Jetzt geöffnet" : "Gerade geschlossen";
  badge.classList.toggle("is-closed", !open);
  badge.hidden = false;
}

// Karte (Zwei-Klick-Lösung)
const mapBtn = document.getElementById("map-btn");
const mapNote = document.getElementById("map-note");
mapBtn.addEventListener("click", () => {
  mapNote.hidden = false;
  mapBtn.hidden = true;
});

/* ---------- 7. Kontaktformular (Demo) ----------
   Auf Kundenseiten: action="https://formspree.io/f/…" und method="POST" setzen
   und das preventDefault() unten entfernen. */

const form = document.getElementById("contact-form");
const status = form.querySelector(".form__status");
const topic = document.getElementById("topic");
const message = document.getElementById("message");
let autoFilled = "";

// Preisrechner füllt das Formular vor
document.getElementById("calc-cta").addEventListener("click", () => {
  if (!lastEstimate) return;
  topic.value = lastEstimate.topic;
  if (!message.value.trim() || message.value === autoFilled) {
    autoFilled = `Hallo Frau Falk,\n\nich interessiere mich für: ${lastEstimate.text}\n\n`;
    message.value = autoFilled;
  }
});

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
    status.textContent = "Bitte füllen Sie alle Pflichtfelder aus und bestätigen Sie den Datenschutz.";
    status.classList.add("is-error");
    return;
  }
  status.textContent = "Danke! (Demo: Es wurde nichts verschickt. Auf einer echten Seite landet die Anfrage direkt im Postfach.)";
  status.classList.add("is-ok");
  form.reset();
  autoFilled = "";
});
