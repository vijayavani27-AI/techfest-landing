/* =========================================================
   TECHFEST · An Aetherial Renaissance: interactions
   Vanilla JS, no libraries, no 3D.
   ========================================================= */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const SVGNS = "http://www.w3.org/2000/svg";

  /* ---------- 1. Build the astrolabe details ---------- */
  (function buildAstrolabe() {
    const ticks = $("#ticks");
    for (let i = 0; i < 120; i++) {
      const a = (i / 120) * Math.PI * 2, major = i % 10 === 0;
      const r1 = 284, r2 = major ? 262 : 274;
      const l = document.createElementNS(SVGNS, "line");
      l.setAttribute("x1", 300 + Math.cos(a) * r1); l.setAttribute("y1", 300 + Math.sin(a) * r1);
      l.setAttribute("x2", 300 + Math.cos(a) * r2); l.setAttribute("y2", 300 + Math.sin(a) * r2);
      l.setAttribute("class", "tick" + (major ? " tick--major" : ""));
      ticks.appendChild(l);
    }
    const numerals = $("#numerals");
    ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"].forEach((n, i) => {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const t = document.createElementNS(SVGNS, "text");
      t.setAttribute("x", 300 + Math.cos(a) * 240); t.setAttribute("y", 300 + Math.sin(a) * 240);
      t.setAttribute("class", "numeral");
      t.setAttribute("transform", `rotate(${(i / 12) * 360} ${300 + Math.cos(a) * 240} ${300 + Math.sin(a) * 240})`);
      t.textContent = n;
      numerals.appendChild(t);
    });
    // 12-point star
    const pts = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 98 : 150;
      pts.push(`${(300 + Math.cos(a) * r).toFixed(1)},${(300 + Math.sin(a) * r).toFixed(1)}`);
    }
    $("#star").setAttribute("points", pts.join(" "));
  })();

  /* ---------- 2. Aether dust (2D canvas) ---------- */
  const canvas = $("#aether"), ctx = canvas.getContext("2d");
  let W, H, dpr, motes = [];
  const pointer = { x: -999, y: -999, tx: -999, ty: -999 };
  function resizeCanvas() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(clamp((W * H) / 14000, 40, 120));
    motes = Array.from({ length: count }, () => newMote(true));
  }
  function newMote(anywhere) {
    return {
      x: Math.random() * W, y: anywhere ? Math.random() * H : H + 10,
      r: Math.random() * 1.8 + 0.4, vy: -(Math.random() * 0.35 + 0.08), vx: (Math.random() - 0.5) * 0.15,
      tw: Math.random() * Math.PI * 2, hue: Math.random() < 0.8 ? "232,183,90" : "95,209,201",
    };
  }
  function drawAether(t) {
    ctx.clearRect(0, 0, W, H);
    for (const m of motes) {
      m.y += m.vy; m.x += m.vx + Math.sin(t * 0.0005 + m.tw) * 0.08;
      const dx = m.x - pointer.x, dy = m.y - pointer.y, d = Math.hypot(dx, dy);
      if (d < 140 && d > 0) { m.x += (dx / d) * 0.9; m.y += (dy / d) * 0.9; }
      if (m.y < -10) Object.assign(m, newMote(false));
      const a = 0.35 + Math.sin(t * 0.002 + m.tw) * 0.3;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${m.hue},${a.toFixed(2)})`;
      ctx.shadowColor = `rgba(${m.hue},.9)`; ctx.shadowBlur = 8;
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
  addEventListener("resize", resizeCanvas);
  resizeCanvas();

  /* ---------- 3. Pointer: glow cursor + astrolabe parallax ---------- */
  const glow = $("#glowCursor"), astro = $("#astrolabe");
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener("pointermove", (e) => {
    pointer.x = e.clientX; pointer.y = e.clientY;
    mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5;
    if (finePointer) glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  }, { passive: true });

  /* ---------- 4. Nav: hide on scroll down, menu, active link ---------- */
  const nav = $("#nav"), toggle = $("#navToggle"), links = $("#navLinks");
  let lastY = scrollY;
  function setMenu(open) {
    links.classList.toggle("is-open", open);
    nav.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", () => setMenu(!links.classList.contains("is-open")));
  $$("a", links).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  const navMap = new Map($$('a[href^="#"]', links).map((a) => [a.getAttribute("href").slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navMap.forEach((a) => a.classList.remove("is-active"));
      const a = navMap.get(en.target.id); if (a) a.classList.add("is-active");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navMap.forEach((_, id) => { const el = document.getElementById(id); if (el) spy.observe(el); });

  /* ---------- 5. Manifesto: words light up as you scroll ---------- */
  const manifesto = $("#manifestoText");
  manifesto.innerHTML = manifesto.textContent.trim().split(/\s+/).map((w) => {
    const em = /^\*.*\*[.,]?$/.test(w);
    const clean = w.replace(/\*/g, "");
    return `<span class="w${em ? " em" : ""}">${clean}</span>`;
  }).join(" ");
  const words = $$(".w", manifesto);

  /* ---------- 6. Main loop ---------- */
  const bar = $("#scrollBar");
  function loop(t) {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";

    // nav
    nav.classList.toggle("is-scrolled", y > 40);
    if (!links.classList.contains("is-open")) nav.classList.toggle("is-hidden", y > lastY + 2 && y > 400);
    if (y < lastY - 2) nav.classList.remove("is-hidden");
    lastY = y;

    // astrolabe: follows the mouse and turns as you scroll
    mouse.sx = lerp(mouse.sx, mouse.x, 0.05); mouse.sy = lerp(mouse.sy, mouse.y, 0.05);
    if (!reduceMotion && y < innerHeight * 1.3) {
      astro.style.transform = `translate(calc(-50% + ${(mouse.sx * -40).toFixed(1)}px), calc(-50% + ${(mouse.sy * -40 + y * 0.25).toFixed(1)}px)) rotate(${(y * 0.04).toFixed(2)}deg) scale(${(1 + y * 0.0003).toFixed(3)})`;
      astro.style.opacity = clamp(0.55 - y / (innerHeight * 1.6), 0, 0.55).toFixed(3);
    }

    // manifesto words
    const r = manifesto.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) {
      const p = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35), 0, 1);
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle("on", reduceMotion || i < lit));
    }

    if (!reduceMotion) drawAether(t);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ---------- 7. Countdown to 16 Dec 2026, 00:00 IST ---------- */
  const START = new Date("2026-12-16T00:00:00+05:30").getTime();
  const END = new Date("2026-12-19T00:00:00+05:30").getTime();
  const units = { d: $('[data-unit="d"]'), h: $('[data-unit="h"]'), m: $('[data-unit="m"]'), s: $('[data-unit="s"]') };
  const cdLabel = $("#countdownLabel");
  function tick() {
    const now = Date.now();
    let diff = START - now;
    if (diff <= 0) {
      diff = 0;
      cdLabel.textContent = now < END ? "Techfest is live right now!" : "Thank you for an unforgettable 30th edition";
    }
    const vals = {
      d: Math.floor(diff / 864e5), h: Math.floor((diff / 36e5) % 24),
      m: Math.floor((diff / 6e4) % 60), s: Math.floor((diff / 1e3) % 60),
    };
    for (const k in vals) {
      const txt = String(vals[k]).padStart(2, "0");
      if (units[k].textContent !== txt) {
        units[k].textContent = txt;
        units[k].classList.remove("tick"); void units[k].offsetWidth; units[k].classList.add("tick");
      }
    }
  }
  tick(); setInterval(tick, 1000);

  /* ---------- 8. Reveal + counters ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const sibs = $$(".reveal", el.parentElement);
      el.style.transitionDelay = Math.min(sibs.indexOf(el), 6) * 80 + "ms";
      el.classList.add("is-in");
      const num = el.querySelector("[data-count]");
      if (num) countUp(num);
      io.unobserve(el);
    });
  }, { threshold: 0.15 });
  $$(".reveal").forEach((el) => io.observe(el));
  function countUp(el) {
    const end = +el.dataset.count, dec = +(el.dataset.decimals || 0);
    const pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
    const dur = reduceMotion ? 1 : 1600, t0 = performance.now();
    (function f(now) {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + (end * e).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(f);
    })(t0);
  }

  /* ---------- 9. Path cards: spotlight follows the cursor ---------- */
  $$(".path").forEach((card) => {
    const spot = document.createElement("span"); spot.className = "spot"; card.prepend(spot);
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* ---------- 10. Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    $$(".magnetic").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      b.addEventListener("pointerleave", () => { b.style.transform = ""; });
    });
  }

  /* ---------- 11. Competitions: filter + drag + arrows ---------- */
  const rail = $("#rail"), cards = $$(".comp", rail);
  $$(".chip").forEach((chip) => chip.addEventListener("click", () => {
    $$(".chip").forEach((c) => { c.classList.toggle("is-on", c === chip); c.setAttribute("aria-pressed", String(c === chip)); });
    const f = chip.dataset.filter;
    cards.forEach((c, i) => {
      const show = f === "all" || c.dataset.cat.split(" ").includes(f);
      c.classList.toggle("is-hidden", !show);
      c.classList.remove("is-entering");
      if (show) { void c.offsetWidth; c.style.animationDelay = i * 40 + "ms"; c.classList.add("is-entering"); }
    });
    rail.scrollTo({ left: 0, behavior: "smooth" });
  }));
  const step = () => (cards.find((c) => !c.classList.contains("is-hidden"))?.offsetWidth || 320) + 20;
  $("#prevBtn").addEventListener("click", () => rail.scrollBy({ left: -step(), behavior: "smooth" }));
  $("#nextBtn").addEventListener("click", () => rail.scrollBy({ left: step(), behavior: "smooth" }));
  let drag = null;
  rail.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    drag = { x: e.clientX, left: rail.scrollLeft, moved: false };
  });
  addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) { drag.moved = true; rail.classList.add("is-dragging"); }
    if (drag.moved) rail.scrollLeft = drag.left - dx;
  });
  addEventListener("pointerup", () => { drag = null; rail.classList.remove("is-dragging"); });
  rail.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); rail.scrollBy({ left: step(), behavior: "smooth" }); }
    if (e.key === "ArrowLeft") { e.preventDefault(); rail.scrollBy({ left: -step(), behavior: "smooth" }); }
  });

  /* ---------- 12. Workshops tabs (names from techfest.org/workshops) ---------- */
  const WORKSHOPS = {
    ai: [
      ["Agentic AI", "Build autonomous agents that plan, decide and act, with multi-agent frameworks and guardrails."],
      ["Artificial Intelligence", "Two days on campus covering deep learning, vision, GenAI, RAG and agent workflows."],
      ["Machine Learning", "End-to-end ML pipelines, from statistics to ensembles, neural nets and deployment."],
      ["LLMs using Python", "Vector search, advanced RAG and cloud deployment for production AI systems."],
      ["Prompt Engineering", "Reasoning patterns, generative engine optimisation and prompt security."],
      ["Data Science", "The full data lifecycle with Python, SQL, predictive ML and AI analytics."],
    ],
    tech: [
      ["Full Stack Development", "Responsive interfaces, Node.js and databases to ship real web products."],
      ["Ethical Hacking", "Network exploitation, web and API vulnerabilities and hands-on CTF challenges."],
      ["Cybersecurity", "Threat detection, SIEM triage and a live SOC war-room breach simulation."],
      ["Cloud Computing", "Core AWS services, Infrastructure as Code and a hosted capstone project."],
      ["Game Development", "Build a fully playable game in Unity in an intensive two-day sprint."],
      ["Electric Vehicles", "EV architectures, battery tech, charging systems and smart vehicle intelligence."],
    ],
    biz: [
      ["Entrepreneurship", "Validate a startup idea, design the business model and pitch to investors."],
      ["Algorithmic Trading", "From market data to a fully backtested algorithm in one intensive day."],
      ["Business Analytics", "Excel, SQL and Power BI to build a complete dashboard, no coding needed."],
      ["Product Management", "Customer research, prioritisation and go-to-market in an end-to-end challenge."],
      ["Stock Market & Equity Research", "Fundamental and technical analysis with a live mock-trading simulation."],
      ["Personal Finance & Real Estate", "Budgeting, valuation and portfolio construction for smart investing."],
    ],
    design: [
      ["Animation", "Motion design, kinetic typography and 2.5D parallax in DaVinci Resolve Fusion."],
      ["UI/UX Design", "From user research to high-fidelity Figma prototypes and usability testing."],
    ],
    eng: [
      ["Robotics", "Design, build and program an autonomous robot, from sensors to ROS 2 navigation."],
      ["IoT using Arduino or Raspberry Pi", "Sensors, connectivity, cloud dashboards and edge AI for real systems."],
      ["Drone Technology", "Design, build and fly your own quadcopter, from frame to flight controller."],
    ],
  };
  const wsList = $("#wsList");
  function showTrack(key) {
    wsList.innerHTML = WORKSHOPS[key].map(([name, desc], i) =>
      `<li class="ws__item" style="animation-delay:${i * 60}ms"><h4>${name}</h4><p>${desc}</p></li>`).join("");
  }
  $$(".tab").forEach((tab) => tab.addEventListener("click", () => {
    $$(".tab").forEach((t) => { t.classList.toggle("is-on", t === tab); t.setAttribute("aria-selected", String(t === tab)); });
    showTrack(tab.dataset.track);
  }));
  showTrack("ai");
})();
