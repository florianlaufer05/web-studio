/* ============================================================
   Web-Studio – Portfolio
   Preise und Extras stehen in PRICES / EXTRAS: dort anpassen.
   ============================================================ */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const euro = (n) => n.toLocaleString("de-DE") + " €";

  /* ---------- Navigation ---------- */
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("menu");

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.setAttribute("aria-label", open ? "Menü öffnen" : "Menü schließen");
    menu.classList.toggle("is-open", !open);
  });
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Menü öffnen");
      menu.classList.remove("is-open");
    }
  });
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Wellenform im NØRD-Mockup ---------- */
  function waveBars(count, seed) {
    let s = seed;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    let html = "";
    for (let i = 0; i < count; i++) {
      const h = 20 + Math.round(Math.abs(Math.sin(i * 0.55)) * 55 + rnd() * 25);
      html += `<i style="height:${Math.min(h, 100)}%"></i>`;
    }
    return html;
  }
  document.querySelectorAll("[data-wave]").forEach((el) => {
    el.innerHTML = waveBars(Number(el.dataset.wave), 7);
  });

  /* ---------- Preise ---------- */
  const PRICES = {
    landing: { price: 149, days: 7 },
    website: { price: 349, days: 12, includedPages: 3, perPage: 40, perPageDays: 1 },
    expressFactor: 1.25
  };

  const EXTRAS = [
    { id: "player", name: "Musik-Player mit Hörproben", price: 59, days: 2, fit: ["musik"] },
    { id: "releases", name: "Releases mit Spotify & YouTube (Zwei-Klick)", price: 39, days: 1, fit: ["musik"] },
    { id: "booking", name: "Booking- oder Terminanfrage", price: 29, days: 1, fit: ["musik", "business"] },
    { id: "gallery", name: "Galerie mit Filter", price: 39, days: 1, fit: ["business", "other"] },
    { id: "calculator", name: "Preisrechner wie bei der Tischlerei", price: 89, days: 3, fit: ["business"] },
    { id: "texts", name: "Texte schreibe ich für dich", price: 49, days: 2, fit: [] },
    { id: "english", name: "Zweite Sprache (Englisch)", price: 79, days: 2, fit: [] },
    { id: "domain", name: "Eigene Domain verbinden", price: 19, days: 0, fit: [] },
    { id: "express", name: "Express: halbe Lieferzeit", price: null, days: 0, fit: [] }
  ];

  const AUDIENCES = {
    musik: {
      label: "Musik", theme: "dark", name: "Dein Name", url: "deinname.de",
      pages: ["Start", "Musik", "Beats", "Live", "Über mich", "Presse", "Shop"],
      anchors: ["Musik", "Live", "Kontakt"]
    },
    business: {
      label: "Selbstständig", theme: "warm", name: "Dein Betrieb", url: "dein-betrieb.de",
      pages: ["Start", "Leistungen", "Referenzen", "Über uns", "Preise", "FAQ", "Blog"],
      anchors: ["Leistungen", "Über uns", "Kontakt"]
    },
    other: {
      label: "Projekt", theme: "light", name: "Dein Projekt", url: "dein-projekt.de",
      pages: ["Start", "Angebot", "Über uns", "Termine", "Galerie", "FAQ", "Presse"],
      anchors: ["Angebot", "Termine", "Kontakt"]
    }
  };

  /* ---------- Live-Vorschau ---------- */
  function previewHTML(st) {
    const aud = AUDIENCES[st.aud];
    const name = st.name || aud.name;
    const has = (id) => st.extras.includes(id);

    let tabs;
    if (st.size === "landing") {
      tabs = aud.anchors.map((a) => `<span>${a}</span>`).join("") + `<span class="pv__chip">1 Seite</span>`;
    } else {
      const list = aud.pages.slice(0, st.pages - 1).concat("Kontakt");
      const shown = list.slice(0, 4);
      tabs = shown.map((p, i) => `<span${i === 0 ? ' class="is-active"' : ""}>${p}</span>`).join("");
      if (list.length > shown.length) tabs += `<span class="pv__chip">+${list.length - shown.length}</span>`;
    }

    const blocks = [];
    if (has("player")) {
      blocks.push(`<div class="pv__block"><span class="pv__label">Hörproben</span><div class="pv__player"><span class="pv__play"></span><span class="pv__wave">${waveBars(26, 3)}</span><span class="pv__time">1:24</span></div></div>`);
    }
    if (has("releases")) {
      blocks.push(`<div class="pv__block"><span class="pv__label">Releases</span><div class="pv__covers"><i></i><i></i><i></i><i></i></div></div>`);
    }
    if (has("gallery")) {
      blocks.push(`<div class="pv__block"><span class="pv__label">Galerie</span><div class="pv__gallery"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>`);
    }
    if (has("calculator")) {
      blocks.push(`<div class="pv__block"><span class="pv__label">Preisrechner</span><div class="pv__calc"><span class="pv__slider" style="--x:35%"></span><span class="pv__price">ab 1.200 €</span><span class="pv__slider" style="--x:70%"></span></div></div>`);
    }
    if (has("booking")) {
      blocks.push(`<div class="pv__block"><span class="pv__label">${st.aud === "musik" ? "Booking" : "Termin anfragen"}</span><div class="pv__form"><i></i><i></i><b></b></div></div>`);
    }
    if (!blocks.length) {
      const card = `<span><span class="pv__line"></span><span class="pv__line"></span><span class="pv__line" style="width:70%"></span></span>`;
      blocks.push(`<div class="pv__cards">${card}${card}${card}</div>`);
    }

    return `
      <div class="pv__bar"><i></i><i></i><i></i><span class="pv__url">${st.url || aud.url}</span></div>
      <div class="pv__page">
        <div class="pv__nav">
          <b class="pv__logo">${name}</b>
          <span class="pv__tabs">${tabs}</span>
          ${has("english") ? '<span class="pv__lang">DE | EN</span>' : ""}
        </div>
        <div class="pv__hero">
          <p class="pv__name">${name}</p>
          <span class="pv__line" style="width:78%"></span>
          <span class="pv__line" style="width:56%"></span>
          <div class="pv__btns"><span class="pv__btn"></span><span class="pv__btn pv__btn--ghost"></span></div>
        </div>
        ${blocks.slice(0, 3).join("")}
        <div class="pv__foot"><span>© ${name}</span><span>Impressum · Datenschutz</span></div>
      </div>`;
  }

  function renderPreview(host, st) {
    let pv = host.firstElementChild;
    if (!pv) {
      pv = document.createElement("div");
      pv.className = "pv";
      host.appendChild(pv);
    }
    pv.dataset.theme = AUDIENCES[st.aud].theme;
    pv.innerHTML = previewHTML(st);
    if (!reduceMotion) {
      pv.classList.remove("is-swapping");
      void pv.offsetWidth; // Animation neu starten
      pv.classList.add("is-swapping");
    }
  }

  /* ---------- Hero: wechselnde Beispiele ---------- */
  const heroHost = document.getElementById("hero-preview");
  const heroCaption = document.getElementById("hero-caption");
  const HERO_EXAMPLES = [
    { aud: "musik", size: "website", pages: 4, extras: ["player", "releases"], name: "MIRA VALE", url: "miravale.de", caption: "Beispiel: Sängerin · 4 Seiten · Player & Releases" },
    { aud: "business", size: "website", pages: 5, extras: ["gallery", "calculator"], name: "Gärtnerei Lind", url: "gaertnerei-lind.de", caption: "Beispiel: Gärtnerei · 5 Seiten · Galerie & Preisrechner" },
    { aud: "other", size: "landing", pages: 1, extras: ["booking"], name: "Laufgruppe Nord", url: "laufgruppe-nord.de", caption: "Beispiel: Verein · Landingpage · Anmeldung" }
  ];
  let heroIndex = 0;
  function showHero(i) {
    const ex = HERO_EXAMPLES[i];
    renderPreview(heroHost, ex);
    heroCaption.textContent = ex.caption;
  }
  showHero(0);
  if (!reduceMotion) {
    setInterval(() => {
      if (document.hidden) return;
      heroIndex = (heroIndex + 1) % HERO_EXAMPLES.length;
      showHero(heroIndex);
    }, 4200);
  }

  /* ---------- Preisrechner ---------- */
  const calc = document.getElementById("calc");
  const extrasBox = document.getElementById("extras");
  const pagesWrap = document.getElementById("pages-wrap");
  const pagesInput = document.getElementById("pages");
  const pagesOut = document.getElementById("pages-out");
  const calcHost = document.getElementById("calc-preview");
  const rPrice = document.getElementById("r-price");
  const rDays = document.getElementById("r-days");
  const rList = document.getElementById("r-list");

  extrasBox.innerHTML = EXTRAS.map((x) => `
    <label class="extra">
      <input type="checkbox" name="extra" value="${x.id}">
      <span><b>${x.name}<em class="fit" data-fit="${x.id}" hidden>passt</em></b>
      <small>${x.price === null ? "+25 % auf den Preis" : "+" + euro(x.price)}${x.days ? " · +" + x.days + (x.days === 1 ? " Tag" : " Tage") : ""}</small></span>
    </label>`).join("");

  function readState() {
    const fd = new FormData(calc);
    return {
      aud: fd.get("aud"),
      size: fd.get("size"),
      pages: fd.get("size") === "landing" ? 1 : Number(pagesInput.value),
      extras: fd.getAll("extra")
    };
  }

  function compute(st) {
    const lines = [];
    let price, days;
    if (st.size === "landing") {
      price = PRICES.landing.price;
      days = PRICES.landing.days;
      lines.push(["Landingpage (1 Seite)", price]);
    } else {
      const w = PRICES.website;
      const extraPages = Math.max(0, st.pages - w.includedPages);
      price = w.price;
      days = w.days + extraPages * w.perPageDays;
      lines.push([`Website (${w.includedPages} Seiten)`, w.price]);
      if (extraPages) {
        lines.push([`${extraPages} weitere ${extraPages === 1 ? "Seite" : "Seiten"}`, extraPages * w.perPage]);
        price += extraPages * w.perPage;
      }
    }
    EXTRAS.forEach((x) => {
      if (!st.extras.includes(x.id) || x.price === null) return;
      price += x.price;
      days += x.days;
      lines.push([x.name, x.price]);
    });
    if (st.extras.includes("express")) {
      const plus = Math.round((price * (PRICES.expressFactor - 1)) / 5) * 5;
      price += plus;
      days = Math.ceil(days / 2);
      lines.push(["Express (+25 %)", plus]);
    }
    return { price, days, lines };
  }

  let lastState = null;
  let lastResult = null;

  function updateCalc() {
    const st = readState();
    pagesWrap.hidden = st.size === "landing";
    pagesOut.textContent = pagesInput.value;

    extrasBox.querySelectorAll(".fit").forEach((el) => {
      const x = EXTRAS.find((e) => e.id === el.dataset.fit);
      el.hidden = !x.fit.includes(st.aud);
    });

    const res = compute(st);
    rPrice.textContent = euro(res.price);
    rDays.textContent = `ca. ${res.days} Tagen`;
    rList.innerHTML = res.lines.map(([n, p]) => `<li><span>${n}</span><span>${euro(p)}</span></li>`).join("");
    renderPreview(calcHost, st);

    lastState = st;
    lastResult = res;
  }

  calc.addEventListener("change", updateCalc);
  pagesInput.addEventListener("input", updateCalc);
  updateCalc();

  // Paket-Buttons stellen den Rechner vor
  document.querySelectorAll("[data-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const radio = calc.querySelector(`input[name="size"][value="${btn.dataset.preset}"]`);
      radio.checked = true;
      updateCalc();
    });
  });

  /* ---------- Auswahl ins Formular übernehmen ---------- */
  const picked = document.getElementById("picked");
  const pickedText = document.getElementById("picked-text");
  const pickedInput = document.getElementById("picked-input");
  const contact = document.getElementById("contact");

  document.getElementById("r-send").addEventListener("click", () => {
    const st = lastState;
    const parts = [
      AUDIENCES[st.aud].label,
      st.size === "landing" ? "Landingpage" : `Website mit ${st.pages} Seiten`
    ];
    EXTRAS.forEach((x) => { if (st.extras.includes(x.id)) parts.push(x.name); });
    const summary = `${parts.join(", ")} – Richtpreis ${euro(lastResult.price)}, ca. ${lastResult.days} Tage`;

    pickedText.textContent = summary;
    pickedInput.value = summary;
    picked.hidden = false;
    contact.elements.art.value = st.size === "landing" ? "Neue Landingpage" : "Neue Website";

    document.getElementById("anfrage").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    setTimeout(() => contact.elements.name.focus({ preventScroll: true }), reduceMotion ? 0 : 500);
  });

  /* ---------- Formular (noch ohne Versand) ---------- */
  const status = document.getElementById("form-status");

  contact.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    ["name", "email", "nachricht"].forEach((n) => {
      const el = contact.elements[n];
      const valid = el.value.trim() !== "" && (n !== "email" || el.checkValidity());
      el.closest(".field").classList.toggle("is-invalid", !valid);
      if (!valid) ok = false;
    });
    const consent = contact.elements.datenschutz;
    consent.closest(".check").classList.toggle("is-invalid", !consent.checked);
    if (!consent.checked) ok = false;

    if (!ok) {
      status.className = "form__status is-error";
      status.textContent = "Bitte füll die markierten Felder aus.";
      return;
    }
    // Platzhalter: Hier später Formspree o. Ä. anbinden.
    status.className = "form__status is-ok";
    status.textContent = "Danke! Das Formular ist noch nicht freigeschaltet, deine Anfrage wurde also nicht gesendet. Bald landet sie hier direkt bei mir.";
  });
})();
