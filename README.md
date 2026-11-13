# Techfest 2026: An Aetherial Renaissance (Landing Page Concept)

A landing page concept for **Techfest, IIT Bombay** ([techfest.org](https://techfest.org)), built for the 30th edition (16–18 December 2026) and its theme, **"An Aetherial Renaissance"**.

🔗 **Live demo:** https://vijayavani27-ai.github.io/techfest-landing/

Built for the **Techfest Campus Ambassador task: "Make a cool landing page for Techfest's official website"** (no 3D assets).

---

## 🔍 Research: what I found on techfest.org
| Observation | How this design responds |
|---|---|
| The dates, edition and theme are part of the hero **image**, so they can't be selected, searched or read by screen readers | Everything is **real text**: the title, theme, dates, venue and tagline |
| The home page has very little content, and the key info lives on inner pages | One scroll gives the whole picture: theme, stats, paths, competitions, workshops, CA program |
| Prize pools (up to ₹25.5 lakh!) are buried in long lists | **Featured competitions** with prize pools up front and category filters |
| 25+ workshops across 5 tracks are in one long list | **Tabbed workshop tracks** plus a clear "what you get" panel |
| There's no sense of urgency | A **live countdown** to 16 December |
| Strong fantasy / renaissance art direction (gold frames, dusk sky, gothic type) | Kept the mood (dusk palette, gold, Cinzel serif, ornate frames) but made it cleaner and easier to scan |

## 💡 Concept: "The Astrolabe"
The astrolabe was a renaissance instrument for reading the heavens. Here it's rebuilt as a **hand-drawn SVG tech dial** with rotating rings, Roman numerals, orbiting "planets" and a sweeping needle. It ties the *Renaissance* (art and science) to the *Aether* (code, circuits, AI). Golden "aether" dust drifts through the page and moves away from your cursor.

**No 3D assets**: everything is SVG, CSS and a 2D canvas.

## ✨ Features
- **Animated SVG astrolabe hero**: 8 layers rotating at different speeds, which follows the mouse and turns as you scroll
- **Gold sheen title** with a shimmering gradient
- **Live countdown** to 16 Dec 2026 (IST), which switches to "live now" during the fest
- **Aether particles**: a 2D canvas of drifting golden and teal dust that reacts to the cursor
- **Manifesto** whose words light up one by one as you scroll
- **Animated stats**: 30th edition, 3 days, ₹25.5 L top prize pool, 25+ workshops
- **"Choose your path" cards** with ornate corner frames, a cursor spotlight and hover lift
- **Competition carousel**: filter chips (Hackathons, AI, Robotics, Drones), drag to scroll, arrow buttons and keyboard arrows
- **Workshop tracks**: 5 tabs with animated cards for each workshop
- **CA Program** section with four steps in Roman numerals
- **Magnetic buttons**, a nav that hides on scroll, an active-section highlight, a scroll progress bar and a gold glow that follows the cursor
- Fully **responsive**, with a full-screen mobile menu
- **Accessible**: skip link, ARIA labels, keyboard support and `prefers-reduced-motion`

## 🛠 Tech
HTML5 · CSS3 (custom properties, grid, scroll-snap, keyframes) · Vanilla JavaScript (Canvas 2D, IntersectionObserver, requestAnimationFrame) · Google Fonts (Cinzel, Cormorant Garamond, Manrope).
No frameworks, no build step and no 3D libraries.

## 🚀 Run locally
Double-click `index.html`, or:
```bash
python -m http.server 5176
```

## 📁 Structure
```
techfest-landing/
├── index.html   # page structure + SVG astrolabe
├── style.css    # theme, layout, animations, responsive rules
├── script.js    # astrolabe, particles, countdown, carousel, tabs, interactions
└── README.md
```

---
*Concept by Vijayavani K. Event names, dates and prize pools come from techfest.org (November 2026). Not the official website: always check techfest.org for the latest details.*
