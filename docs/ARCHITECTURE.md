# Aurora Field — Engineering Manual

This is the machine manual for `theyuvrajgupta.github.io`: how every system works and how to extend it without breaking the physics. It is the companion to `CLAUDE.md`, which is the constitution (client rulings, taboos, taste). Division of labour:

- **CLAUDE.md** answers *"may I?"* — what was decided, what is forbidden, and why.
- **This file** answers *"how?"* — how each engine, material, and motion system is built, and the recipes for extending them.

If the two ever disagree, CLAUDE.md wins and this file has rotted; fix it.

References here are by **selector and banner comment**, never line number (line numbers rot). Most CSS systems sit under a `/* ======== NAME ======== */` banner in `style.css` (a few sub-systems use plain prose or `/* --- Name --- */` comments: the Live Edge, the hero entrance, and the Timeline/Horizon/Footer field blocks); every JS system sits under a `// --- NAME ---` line-comment banner in `script.js` — grep `// ---` to list them.

---

## 1. System overview

Three files do everything. No build step, no packages, no JS libraries (GSAP was removed in v13; the site is pure vanilla). The only third-party dependencies are two CSS/font CDNs: Font Awesome 6.4.0 and Google Fonts (Space Grotesk, Space Mono, Inter).

```
index.html              all content, markup, section structure
portfolio/css/style.css all styles (~4,160 lines, banner-commented sections)
portfolio/js/script.js  all interactivity (~820 lines, one DOMContentLoaded block)
portfolio/assets/       images, resume PDF, OG preview source + PNG
```

Deploy = push to `main`; GitHub Pages serves it within minutes.

### The resilience ladder

The site is built to degrade in layers, and every feature must slot into this ladder:

1. **No JS** — `body.js` is added by the first line of script.js; every opacity-0 state (`.reveal`, hero entrance, rest-bare plates) is scoped under `body.js`, so without JS the full page renders fully formed and fully lit.
2. **JS throws at any point** — a `window` `error` listener strips `js`, `custom-cursor`, and `sky-live` from `<body>`, returning the page to the static composition. Additionally the master rAF loop wraps each task in try/catch and **evicts** a throwing task while the others keep running.
3. **Reduced motion** — a global animation kill in the `REDUCED MOTION` CSS banner plus live `mqReduce.matches` checks in every frame task. Rest states are always the *completed* composition (plates inked, card punched, sky as static CSS curtains), never the empty start state.
4. **Mobile (≤992px)** — the engines (sky, landings, field) gate on `mqDesk` = `min-width: 993px` and turn off entirely; layouts collapse to static stacks.

Rule of thumb: **the rest state of any animation is its finished frame.** Entrances animate *toward* what no-JS users already see.

---

## 2. Runtime anatomy (script.js)

Everything lives in one `DOMContentLoaded` closure. Two shared media queries: `mqReduce` (`prefers-reduced-motion: reduce`, with a Safari ≤13 `addListener` alias patched onto the prototype) and `mqDesk` (`min-width: 993px`). One-time setup reads the `prefersReducedMotion` snapshot; per-frame gates read `mqReduce.matches` live so a mid-session OS toggle stops motion.

### The master rAF loop

There is exactly **one** `requestAnimationFrame` loop. Systems register callbacks in the `rafTasks` array; the loop:

1. **Reschedules itself first** (a throwing task can never kill the loop).
2. Does **one layout read per frame** — `window.scrollY` and `window.innerHeight` — and passes them to every task as `(now, y, vph)`. Tasks must never read layout themselves mid-frame.
3. Runs each task in try/catch; a throwing task is **spliced out** and its error rethrown asynchronously.

**Never add a second rAF loop.** Register a task. Never read `scrollY`/`getBoundingClientRect` inside a task; cache geometry at init + on debounced resize (the site convention is a 150–200ms `setTimeout` debounce plus a `window` `load` re-measure for late layout shifts).

### Registered tasks, in registration order

| Task | Gates | Writes |
|---|---|---|
| Cursor follow | `pointer: fine` at init | `transform` on `.cursor`, lerp 0.35, epsilon 0.1px |
| Depth field | live: `mqReduce`, per-host IO (`nearHosts`) | `transform` on every `[data-depth]` |
| Living Sky | live: `mqReduce`, `mqDesk`, hero in `nearHosts` | the `.au-live` canvas |
| Landings light | same as sky | `--lit` per `.cred` plate, epsilon 0.01 |
| Field engine | `fieldOn` (= desktop AND motion), per-section IO, scroll epsilon 0.5px | `transform` on `[data-fz]` + the scroll-scrubbed heroes |

### The engines

**Cursor** (`SIMPLIFIED CURSOR`): dot follows via lerp; morphs to corner brackets over `a, button, [role="button"]`. The `mouseover` handler is *authoritative* — every crossing re-derives the state from `e.target.closest(...)`, so brackets can never stick when a modal covers a hovered card. `mouseout` only handles full window exit (`!e.relatedTarget`). Enabled by JS adding `body.custom-cursor`; **never** put `cursor: none` in plain CSS.

**Depth field** (`DEPTH FIELD`): every `[data-depth]` layer translates against the smoothed cursor (`sx/sy`, lerp 0.055) by `depth × 260px`, plus a per-layer sine drift (`data-drift`). Layers are grouped by `closest('section, footer')`; a per-host IntersectionObserver (`rootMargin: '100px 0px'`; the field engine's sibling uses `'150px 0px'`, the footer coords `'200px 0px'`) keeps off-screen groups unwritten. `data-depth`/`data-drift` are parsed once at init. The engine owns the wrapper's `transform` — if an interactive element ever needs depth, wrap it and style hover on the child. **Structural note:** the Living Sky and the Landings are declared *inside* this engine's block — they share its `sx/sy` closure and `nearHosts` gate. Remove every `[data-depth]` element and both silently stop initialising.

**The Living Sky** (`THE LIVING SKY`): canvas aurora on `.au-live`. Internal resolution 640 wide, 4px columns (160 columns), height clamped 240–420 by hero aspect; upscaled under a *static* CSS blur. Six ribbons (near set carries the sky, far set fainter/thinner/slower) ride three layered sine fields each; drawn as vertical light columns with `globalCompositeOperation: 'lighter'` along the emerald→teal→blue→cobalt axis. Per-column colours are interpolated once into `colCache` as **unit-height gradients** mapped per column via `ctx.setTransform(1,0,0,L,0,y−L)` — pixel-identical to per-frame gradients while dropping ~960 allocations/frame. Init runs regardless of breakpoint or motion state (it lives inside the depth-field block, see above); `setSkyOn()` gates *rendering* by toggling `body.sky-live` (desktop + motion), re-arms the dawn (`skyT0 = skyLastT = -1`) on every re-entry, and clears the canvas when off. The CSS curtains are the rest state everywhere the canvas is off. Drivers: dawn = smoothstep over ~2.1s spreading from centre-sky; surge — `p` is the raw scroll fraction over `0.6·vh` and `surge = p(2−p)` is the eased driver — scales brightness ×(1+0.9·surge), phase speed ×(1+1.6·surge), amplitude ×(1+0.5·surge), and sweeps the ribbons down by `IH·0.16·surge`; cursor bends via `xShift = −sx·60` and a `−sy·14` tilt. **Phases are accumulated per frame** (`ph += dt·s·speed`, dt clamped ≤64ms, reset marker on the gated early-return) — see trap T3.

**The Landings** (`THE LANDINGS`): plate centres (`.creds-field .cred`) are cached as viewport-fraction x positions; each frame maps the smoothed cursor to `--lit = max(0, 1 − |sx − center| × 3.2)` per plate, epsilon-gated at 0.01. The beam reads the inherited `--lit` so plate and beam brighten together. Additive only — rest is the always-lit rim, and `--lit` is cleared (plus epsilon cache reset) when leaving desktop or entering reduced motion.

**Field engine** (`FIELD ENGINE (v14 "Focal Plane")`): the page-wide depth physics. Each `[data-fz]` layer's offset is `(focal − sectionCenter) × fz × 0.12` where `focal = scrollY + 0.425·vph` — zero exactly when the section is centred in the reading band. The same task scrubs the scroll-driven heroes: About's timeline progress (`scaleY`), the Work grid's ghost drift (`--fy`, clamped ±4px), the Signature's `stroke-dashoffset` (the monogram inks over the section's scroll span), and Recognition's audit — `Ruled Off` hairlines `scaleX(p)`, `ro-done` at p ≥ 0.985, and the four plates' `is-focal` at p ≥ 0.15 + i·0.2 against the *ledger's* span (engine-owned, not scrollspy-owned: side-by-side plates share a Y). `setFieldOn()` resets every write when the engine turns off, so mobile/reduced-motion rest fully formed.

### Non-rAF systems

**Scroll handler** (passive listener, `SCROLL PROGRESS BAR + ...`): progress bar width (against a cached `scrollMax` — `scrollHeight` is only re-read on load/resize), navbar `.scrolled` past 40px, scroll-indicator fade past 100px, and the `.atmo` ambient layers' counter-scroll drift (motion-gated).

**Scrollspy + focal state** (`SCROLLSPY NAVIGATION + FOCAL-PLANE STATE`): **one** IntersectionObserver with `rootMargin: '-40% 0px -55% 0px'` (a band, not a ratio — ratios break on sections taller than the viewport) drives three things: nav highlighting via `sectionNavMap` (unlinked sections fall back to the nearest preceding linked section; keep the `matches('section, footer')` guard), `.is-focal` on `[data-focal]` targets, and the About frame's `built-1..4` corner assembly from timeline items. `aria-current="location"` mirrors the visual active state.

**Chip → punch card pull** (`COMPETENCY → PUNCH CARD FOCUS PULL`): per-block mouse/focus listeners map each chip's `data-modal-target` to every `[data-ghost="…"]` label (matched with `CSS.escape`; **attributes, not ids** — PRISM and Decade One punch twice) and toggle `pc-on-N` on `.punchcard`.

**Reveals** (`SCROLL REVEALS`): IO at threshold 0.12 adds `.is-visible`; siblings stagger by index (capped 6 × 0.08s). After the transition ends (or a 1.5s fallback), `finishReveal` **strips the reveal classes and inline delay** — the reveal rules pin `transform` and would otherwise suppress hover lifts forever. Consequence for testing: a card mid-session has *no* `.reveal` class left on it.

**Modals** (`MODALS`): any `[data-modal-target]` opens the matching modal id. Focus moves to `.modal-close-btn`; background landmarks (`.navbar, main, body > footer`) get `inert`; Esc closes; Tab is trapped (with a rescue if focus escapes to `<body>`); close returns focus to the trigger, falling back to `#main-content` if the trigger left the layout. Project cards are **plain containers** — the real control is the `.project-link` button stretched via its `::before` overlay (z-index 1). Never re-add `role="button"`/`tabindex` to the card.

**Hamburger** (`HAMBURGER MENU`): `inert` + `aria-hidden` + `aria-expanded` pattern, Esc and outside-click close, focus rescued to the button *before* inert strands it.

**Wandering coordinates** (`FOOTER: THE BASE IS IN MOTION`): `setInterval` 140ms walks a bearing from Singapore, IO-gated to the footer being near, silenced (and reset to "recalculating") under reduced motion.

---

## 3. The material system

Every major surface carries the **machined material**: the same fabrication, tinted by its pole. Read any of `.btn-primary`, `.project-card`, or `.recognition-item` and you will find the same background stack, top to bottom:

1. **Brushed highlight band** — a 116deg linear gradient, transparent → faint white band at 45–50% → transparent.
2. **Corner specular** — a radial from the site's light source (up and slightly left). Position is tuned per surface: buttons and plates sit above the frame (`16% -8%` to `16% -4%`), the raised card and competency surfaces sit on the top edge (`20% 0%` / `18% 0%`).
3. **Ground bounce** — a radial returning the pole colour into the lower edge: `50% 112%` on buttons, `50% 108%` on the card/plate/block family. The Featured strip omits this layer (its ground light is the dual pole blooms instead).
4. **Striations** — a 3px `repeating-linear-gradient` of alternating faint light/dark 1px lines.
5. **Pole body** — the surface's own near-black gradient.

And the same box-shadow grammar: **arris insets** (top light, left graze, right fall-off, bottom occlusion), then a **staged mount** (contact / mid / deep drops), closed by a **pole bloom**. Per-surface variations: the buttons carry the exact 4+3+1 list; cards and plates insert a face-vignette inset (`inset 0 0 30px …`) between arris and mount, and the Work card has only three arris insets — its top light lives in the lit `border-top-color` instead. Whatever the list, hover and active states restate it *layer-for-layer* with adjusted values — box-shadow lists only interpolate when their lengths match, so **never append a layer to one state without appending it to all of them**.

Pole assignments: Work cards + modals emerald-black, competency blocks emerald-teal, Featured strip neutral with dual pole blooms, Recognition plates anodised cobalt-steel, buttons = the duotone itself (primary) and cobalt-black (ghost), draft-card the duotone made surface.

**Plate-exclusive trio** (Recognition only, never on raised surfaces): the mask-composite chamfer ring (`::before` under `@supports`), the scored plaque frame (`::after` inset 12px), and the debossed carve with its gradient-ink `::before` duplicate (which needs `z-index: 1` — trap T5). The opposition is deliberate: plates are *recessed and non-interactive*, cards are *raised and pressable*.

**The anchor grammar**: emerald belongs to left corners/edges, cobalt to right. Carried by card anchor frames, the footer frame, modal codename bands, and the Live Edge ring. (The cursor brackets carry the same two hues split the other way — emerald top pair, cobalt bottom pair — so they read as the grammar without literally following it.)

---

## 4. The motion system

### The Live Edge (hover border-light)

The interactivity signature: **if it wakes under the cursor, you can press it.** Carriers: hero primary + ghost buttons, footer Calendly button, all five Work cards. Never on anything non-pressable.

Anatomy (all inside one `@supports ((mask-composite: exclude) or (-webkit-mask-composite: xor))` block under the `THE LIVE EDGE` banner):

- `.btn-edge` — a decorative `aria-hidden` span, `inset: -1px`, masked to a 2px border ring via the two-layer mask-composite trick, carrying the **static** duotone (`conic-gradient(from 90deg, cobalt, emerald 0.5turn, cobalt)` — emerald left, cobalt right, accents only). Opacity 0 at rest, fades in 0.3s on `:hover`/`:focus-visible`.
- `.btn-edge::before` — an oversized (340%, square) disc holding the **light**: a translucent mint glint arc plus a dim counter-arc opposite. It physically rotates (`edge-orbit`, 3s linear, `translate(-50%,-50%) rotate(360deg)`), `animation-play-state` paused at rest / running on hover, so laps *resume*, never restart. Sweeping over the static duotone beneath, the glint brightens the local hue.
- `.btn-live-edge::before` — the aura: dual-pole box-shadow glow on an **unmasked** pseudo (trap T2).
- `.btn-live-edge::after` — the ground pool: blurred dual-pole radial under the button (static blur).
- Variants: `.btn-primary.btn-live-edge .btn-edge` swaps the ring for lifted lit-edge tints (light on light); `.edge-cobalt` (footer) weights aura + pool toward cobalt; `.card-edge` (cards) sits at `inset: 0` (cards clip), radius 14px, 0.55-alpha accents, 5s lap, no pool, and the inward cast lives on the card's repurposed `::after` (full-face inset box-shadow, `pointer-events: none`, driven by the strip's existing rest-0/hover-1 opacity rules).

Rest state everywhere degraded (reduced motion, no `@property`, static): the lit ring appears on hover without rotation, glint parked on the top arris. No mask support: no ring at all, today's button.

### Entrances and focal states

- **Hero entrance**: `body.js .hero > *` rise staggered (headline 0.25s → status → intro → buttons 0.66s), then the Landings arrive site by site (0.9/1.1/1.3s: plate rises, beam draws down, pool spills, rim draws, catch flashes once then hands off to live `--lit`).
- **Reveals**: translateY + slight scale, deliberately **no blur** (blur-reveals read as template AI design; blur on this site is static per depth tier only, never animated).
- **Focal states** are additive only: whatever crosses the reading band *gains* emphasis. Never dim legible text as a non-focused state.
- **Per-section heroes** are each a distinct form (Assembling Frame, Convergence, Punch Card, Signature, Engraved Ledger + Ruled Off, Horizon, Arrival). Shared tokens only: the dot, drawn-line grammar, depth physics. Their choreography specifics live in CLAUDE.md.

---

## 5. Component inventory

| Section | Hero / signature | JS hooks | Notes |
|---|---|---|---|
| `#home` | Aurora sky + Living Sky canvas + the Landings | sky task, landings task, depth engine | facts are selection credentials only |
| `#about` | Assembling Frame + timeline progress | scrollspy `built-N`, field engine scaleY | four chapters, `[data-focal]` items |
| `#featured-moment` | the Convergence (SVG draw on `.is-focal`) | scrollspy | h2 is the short mono label by ruling |
| `#expertise` | the Punch Card | `pc-on-N`, `ghost-focus`, `[data-focal]` punch choreography | labels use `data-ghost`, never ids |
| `#projects` | the Signature (sticky monogram, scroll-inked) | field engine dashoffset + `--fy` | 5 cards; grid centering assumes exactly 5 |
| `#recognition` | Engraved Ledger + Ruled Off | field engine (`is-focal` engine-owned here) | plates non-interactive by ruling |
| `#vision` | the Horizon (CSS-3D vista) | none (CSS animation) | horizon anchored `--hzb` above section bottom |
| footer (`#contact`) | the Arrival + draft-card + coords | coords interval, `[data-focal]` frame flare | lives outside `<main>` (contentinfo) |

Modals pair `data-modal-target="projectN"` cards/chips with `id="projectN"` blocks. The OG preview is generated from `portfolio/assets/og-preview.html` via headless Chrome at 1200×630.

---

## 6. Extension recipes

**Add a Work card + modal.** Copy an existing card block (card container is *plain*; the `.project-link` button carries `data-modal-target` and a `.visually-hidden` project name) and its paired modal. Add the `.btn-edge card-edge` span as the card's first child. Then fix the grid: `.project-card:nth-child(4)/(5)` centering rules assume exactly five cards — a sixth needs those rules rethought. Check kicker length at 1707px (long kickers wrap and misalign row titles). Facts must exist in the resume or briefing.

**Add a Live Edge carrier.** Only if pressable. Add the `aria-hidden` span; give the host `position: relative` and the hover/focus trigger rules inside the `@supports` block (buttons key off `.btn-live-edge`, cards off `.project-card`). If the host clips (`overflow: hidden`), use the card pattern: ring at `inset: 0`, cast on an unmasked pseudo, no pool. Match ring radius = host radius (+1px when the ring sits outside at `inset: -1px`). Scale lap time with perimeter (buttons 3s, cards 5s).

**Add a Recognition plate.** The 2×2 grid becomes uneven — check the layout at all widths. The plate ink-in thresholds are `p ≥ 0.15 + i·0.2` over the ledger span; five plates need retuned spacing. Engraving text is real copy (screen readers read it); the gradient ink `::before` needs `z-index: 1`. Titles carry event + year and never duplicate the engraved result.

**Add a section.** DOM order in `<main>`; give it a `.section-head` (mono eyebrow with TRUE metadata + modest left title). If it gets no nav link, the scrollspy maps it to the nearest preceding linked section automatically. Give it a distinct hero form (never repeat an existing one, mirrored counts as repetition). Decorative layers go in an `aria-hidden` `.section-field` with `[data-fz]`; real content never transforms. Sections use `overflow: clip`.

**Add a hero credential.** Only selection credentials. Keep the `.k` value + `.v` context grammar, a station class (`cred-e/t/c`), and the beam/pool/catch spans. The Landings geometry is closed by ruling — do not re-stagger heights or touch the scroll-cue lane.

**Change an accent.** `--primary-accent`/`--secondary-accent` in `:root` feed `--grad`, but the codebase carries sanctioned literals (the teal/blue blend pair `rgba(21,190,187)`/`rgba(42,150,222)`, the sky's `AXIS` array in script.js, `--grad-ink`'s lifted cobalt, and many rgba alphas of the accents). Grep for the old values; a pure custom-property swap will miss most of the theme.

**Add motion anywhere.** Checklist: gated under `prefers-reduced-motion: no-preference` (or a live `mqReduce.matches` check per frame)? Rest state = finished frame? If per-frame JS: registered as a task in the master loop, geometry cached, writes epsilon-gated, IO-gated when off-screen? If it moves with scroll speed: phase accumulated, not derived (T3)?

---

## 7. Trap registry

Hard-won, each shipped broken once. Full history in CLAUDE.md; mechanisms here.

- **T1 — `@property` gradient angles don't repaint.** Chrome recalculates a keyframed registered custom property but never repaints a conic gradient consuming it on a pseudo (paint-invalidation gap): computed values advance, pixels freeze. Rotate a real element (compositor transform) instead.
- **T2 — masks erase shadow casts.** `filter: drop-shadow` and `box-shadow` ink on a masked element is clipped by the mask (filter runs before mask; the mask's painting area excludes the shadow). Casts go on unmasked carriers. A filter on the masked+animated span also forces Safari to flatten the composited animation.
- **T3 — integrate phase, never multiply elapsed time.** Any speed-modulated oscillation must accumulate `ph += dt·speed` per frame. Deriving `phase = totalElapsed × speed × modifier` rescales the entire accumulated timeline whenever the modifier changes (the sky whipped on fast scrolls back to the hero).
- **T4 — mask shorthand order is load-bearing in Firefox.** Wherever the `mask` shorthand and `mask-composite` share a rule (the plates' chamfer ring, the Live Edge ring), the shorthand must come first — a later shorthand resets `mask-composite` to its initial value, which breaks the ring in Firefox. The aurora curtains are longhand-only (`mask-image` + `mask-composite`) and are not affected.
- **T5 — a `::before` paints behind its element's text.** The ledger engraving's gradient ink duplicate needs `z-index: 1` or the opaque carve hides it.
- **T6 — reveal rules pin `transform`.** `.reveal` classes are stripped after completion by `finishReveal`; anything relying on `.reveal` being present mid-session is wrong, and any new transform-carrying state on revealed elements must tolerate the class disappearing.
- **T7 — box-shadow lists interpolate only at equal length.** Every machined surface's rest/hover/active lists mirror layer-for-layer. Append to all or none.
- **T8 — the engine owns wrapper transforms.** Never hand-set `transform` on `[data-depth]`/`[data-fz]` elements or style their hover via transform; use a child.
- **T9 — ratio thresholds break on tall sections.** The scrollspy uses a rootMargin band for this reason; keep it that way.
- **T10 — ids collide, attributes don't.** Punch-card labels repeat (PRISM, Decade One punch twice) and use `data-ghost` + `querySelectorAll`.

## 8. Testing playbook

- **Local server**: detached `python -m http.server 8123` from repo root, started via `Start-Process` (plain background shells get reaped). The user sometimes runs his own instance on another port — check `location.href` before same-origin fetch tricks.
- **Cache**: localhost caches hard. `fetch(url, {cache:'reload'})` for index/style/script before `location.reload()`, or Ctrl+Shift+R.
- **Occluded-tab freezes**: an unfocused/covered tab freezes rAF, IntersectionObservers, *and CSS animation clocks* — screenshots briefly wake rendering, so pixel readbacks after a screenshot can lie, and two identical frames do not prove an animation is broken (compositor transforms keep their own clock; property-driven paints do not). Verify by forcing classes/inline states and reading computed style or geometry programmatically.
- **Reveals in tests**: force `.is-visible` on `.reveal` elements (the IO won't fire in occluded tabs).
- **Headless Chrome**: `--screenshot` works for static states (pair with `--virtual-time-budget`); it intermittently fails silently (exit 0, no file) and does not reliably advance animations. `--blink-settings=scriptEnabled=false` captures the no-JS rest state when it cooperates.
- **Mobile**: test at 390px; watch `scrollWidth === clientWidth` at top/mid/footer (the footer's email string and shadow spills are the usual suspects).
- **After any change**: click a card (modal opens through the overlay), Esc (focus returns to trigger), console clean.
