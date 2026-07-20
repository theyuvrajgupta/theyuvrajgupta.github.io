# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Deploy

No build step. This is a pure static site — edit files directly and push to `main`. GitHub Pages auto-deploys to `https://theyuvrajgupta.github.io` within 1–3 minutes of each push.

There are no package managers, bundlers, linters, or test suites. There are also no JS libraries: GSAP was removed in v13 — everything is vanilla JS + CSS.

## Architecture

Three files do all the work:

- `index.html` — all content, markup, and section structure
- `portfolio/css/style.css` — all styles; no preprocessor
- `portfolio/js/script.js` — all interactivity; single `DOMContentLoaded` block

Assets (images, resume PDF) live in `portfolio/assets/`.

## Theme & Design System

**"Aurora Field" (v13)** — near-black ground with an emerald→cobalt duotone gradient, defined via CSS custom properties in `:root`:

| Variable | Value | Role |
|---|---|---|
| `--background-color` | `#06090B` | Page background |
| `--surface-color` | `#0C1218` | Cards, panels |
| `--primary-accent` | `#00E896` | Emerald — gradient start |
| `--secondary-accent` | `#3E6BFF` | Cobalt — gradient end |
| `--grad` | emerald→cobalt `linear-gradient` | The signature duotone; used for text fills, ticks, buttons, markers |
| `--border-color` | `#17242A` | Borders throughout |
| `--font-heading` | Space Grotesk | Display/headings |
| `--font-mono` | Space Mono | Eyebrows, fragments, tags, ledger markers |
| `--font-body` | Inter | Body copy |

`.grad` utility applies the gradient as a text fill. Corner-bracket "anchor frame" grammar (emerald top-left, cobalt bottom-right) is the visual DNA on card anchors and the cursor.

**Signature element — the depth-field hero:** real proof points float as mono "fragments" on depth tiers (`.frag-near/-mid/-far` control size, opacity, and blur = depth-of-field). Each `[data-depth]` element gets cursor-steered parallax plus ambient sine drift from JS; `data-drift` sets drift amplitude. Fragments are hidden ≤992px and static without JS.

## Section Map

Sections in DOM order, with their nav link status:

| Section ID | Nav link | Notes |
|---|---|---|
| `#home` | — | Depth-field hero |
| `#about` | About | Timeline with mono markers |
| `#featured-moment` | → About | No nav link; scrollspy maps to #about |
| `#expertise` | → About | Proof-linked competency grid; no nav link |
| `#projects` | Work | 5 cards (PRISM, preCaution, Agent vs Agent, Kellogg, Foundation) + modals |
| `#recognition` | Recognition | "The Ledger" — 4 mono rows |
| `#vision` | Vision | Short statement only (orb/pillars removed in v13) |
| `#contact` | Contact | Footer |

Sections without a nav link are intentional — the scrollspy maps them to the nearest preceding linked section so the active state never goes blank.

Section headers use the `.section-head` pattern: a mono `.section-eyebrow` carrying TRUE metadata (e.g. "WORK · 2016–2026") above a modest left-aligned `.section-title`. No giant centered titles.

## Key JavaScript Patterns

**All code lives inside one `DOMContentLoaded` listener** in `script.js`. No modules, no libraries.

- **`body.js` gating** — JS adds `.js` to `<body>` first; all opacity-0 states (`.reveal`, hero entrance) only apply under `body.js`, so a script failure leaves the whole page visible.
- **Cursor** — single dot that morphs into corner brackets over `a, button, [role="button"]`; only on `pointer: fine`, opt-in via `body.custom-cursor` (never `cursor: none` in plain CSS).
- **Hero parallax** — one rAF loop transforms all `[data-depth]` layers; skipped entirely under `prefers-reduced-motion`.
- **Modal pattern** — any `[data-modal-target]` (project cards AND competency proof chips) opens the matching modal. Cards carry `tabindex="0" role="button"`; Enter/Space opens, Esc closes, Tab is trapped inside, focus returns to the trigger on close.
- **Scrollspy** — viewport-band `IntersectionObserver` (`rootMargin: '-40% 0px -55% 0px'`), not a ratio threshold (ratio thresholds break on sections taller than the viewport). Observes `main section, main footer` so `#contact` activates.
- **Reveals** — `.reveal` + IO adds `.is-visible`; under reduced motion everything is made visible immediately.

## Content Update Locations

| What to change | Where |
|---|---|
| Hero headline / name / status | `.hero-eyebrow`, `.hero-headline`, `.hero-status` in `index.html` |
| Hero floating fragments | `.hero-frags` block in `index.html` — keep the `value + context` grammar and depth-tier classes |
| Competency blocks + proof chips | `.competency-grid` in `index.html` — chips are `data-modal-target` buttons |
| Project cards & modals | Paired blocks in `index.html` — each card has `data-modal-target="projectN"` and a matching `id="projectN"` modal |
| Featured Moment strip | `#featured-moment` section in `index.html` |
| Recognition ledger rows | `.recognition-ledger` in `index.html` |
| Vision statement | `.vision-statement` in `index.html` |
| Resume file | Replace `portfolio/assets/Resume_YuvrajGupta.pdf` |
| Profile photo | `portfolio/assets/profile-pic.jpg` (renders at 140px) |
| OG/social preview image | Edit `portfolio/assets/og-preview.html`, then regenerate `og-preview.png` with headless Chrome at 1200×630 — STILL ON THE OLD (navy/teal) DESIGN, needs a v13 regen |

## Copy rules (binding)

- No em dashes anywhere in site copy — commas, periods, "·" separators, or restructure. En dashes for numeric ranges are fine.
- No AI tells; concrete over abstract; confident, not salesy.
- Site copy must stay consistent with `Resume_YuvrajGupta.pdf` (SLA percentages, cycle times, claims) — hiring managers cross-check.
- Accuracy guardrails live in the content briefing (see `.claude` memory): no win claims for preCaution/Kellogg/Summit, no Mohini mentions, PRISM is a "live product strategy engagement" (never "market analysis").

## Gotchas

- Hero content must remain visible without JS — all entrance hiding is gated behind `body.js`.
- The custom cursor is enabled by JS adding `body.custom-cursor`; never put `cursor: none` in plain CSS.
- `prefers-reduced-motion` support is comprehensive (global animation kill + JS checks) — keep it that way when adding motion.
- Card grid centering uses `:nth-child(4)/(5)` rules that assume exactly 5 cards.
