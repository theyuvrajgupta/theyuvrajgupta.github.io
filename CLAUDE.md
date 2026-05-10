# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Deploy

No build step. This is a pure static site — edit files directly and push to `main`. GitHub Pages auto-deploys to `https://theyuvrajgupta.github.io` within 1–3 minutes of each push.

There are no package managers, bundlers, linters, or test suites.

## Architecture

Three files do all the work:

- `index.html` — all content, markup, and section structure
- `portfolio/css/style.css` — all styles; no preprocessor
- `portfolio/js/script.js` — all interactivity; single `DOMContentLoaded` block

Assets (images, resume PDF) live in `portfolio/assets/`.

GSAP and ScrollTrigger are loaded from CDN at the bottom of `index.html`, not via npm. `script.js` references them as globals.

## Theme & Design System

**"Synaptic Night"** — dark space aesthetic defined entirely via CSS custom properties in `:root`:

| Variable | Value | Role |
|---|---|---|
| `--background-color` | `#0a0f2c` | Page background |
| `--surface-color` | `#10182c` | Cards, panels |
| `--primary-accent` | `#00f5c3` | Teal — interactive highlights |
| `--secondary-accent` | `#c869ff` | Purple — secondary accents |
| `--border-color` | `#232a55` | Borders throughout |
| `--font-heading` | Satoshi | All headings |
| `--font-body` | Inter | Body copy |

Space Mono (monospace) is used for the hero headline scramble animation and `.card-visual-anchor` stat text.

`.glass` utility class applies the glassmorphism treatment (backdrop-filter blur + semi-transparent background).

## Section Map

Sections in DOM order, with their nav link status:

| Section ID | Nav link | Notes |
|---|---|---|
| `#home` | — | Hero with TextScramble headline canvas |
| `#about` | About | Scroll-animated timeline |
| `#featured-moment` | → About | No nav link; scrollspy maps to #about |
| `#expertise` | → About | No nav link; scrollspy maps to #about |
| `#projects` | Work | 5 project cards with 3D tilt + modals |
| `#recognition` | Recognition | Staggered-in list items |
| `#vision` | Vision | SVG orb + 4 pillars |
| `#contact` | Contact | Footer |

Sections without a nav link (`#featured-moment`, `#expertise`) are intentional — the scrollspy logic in `script.js` maps them to their nearest preceding linked section so the active state never goes blank.

## Key JavaScript Patterns

**All code lives inside one `DOMContentLoaded` listener** in `script.js`. Modules are not used.

**Competency data** — the only structured content in JS is the `competencies` object near the top of `script.js`. Update it there when changing the Core Competencies section.

**Scroll animations** use two mechanisms:
- GSAP + `ScrollTrigger` for the scroll progress bar and entrance tweens
- `IntersectionObserver` for `.timeline-item.is-visible`, `.recognition-item.is-visible`, and the SVG line draw animations

**Modal pattern** — project cards carry `data-modal-target="projectN"`. Clicking opens `#modal-container`, activates the matching `#projectN.modal-content`, and adds `body.modal-open` to lock scroll. Close triggers: `.modal-close-btn`, `.modal-backdrop` click.

**Custom cursor** — `.cursor` + `.cursor-follower` elements, GSAP-driven, only active on `pointer: fine` devices. Add `.magnetic` to any element to trigger the cursor scale-up on hover.

**Mobile breakpoints**:
- `≤992px` — collapses home grid, single-column projects, stacked vision section
- `≤768px` — hides `.nav-menu`, shows `.hamburger-btn`, switches navbar to `position: fixed`, disables custom cursor

## Content Update Locations

| What to change | Where |
|---|---|
| Hero rotating headlines | `headlines` array in `script.js` (~line 212) |
| Competency node skills | `competencies` object in `script.js` (~line 6) |
| Project cards & modals | Paired blocks in `index.html` — each card has `data-modal-target="projectN"` and a matching `id="projectN"` modal |
| Featured Moment strip | `#featured-moment` section in `index.html` |
| Recognition items | `.recognition-list` in `index.html` |
| Vision pillars | `#pillar-1` through `#pillar-4` in `index.html` |
| Resume file | Replace `portfolio/assets/Resume_YuvrajGupta.pdf` |
