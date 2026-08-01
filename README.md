# Aurora Field

**The portfolio of Yuvraj Gupta — Product & Platform Leader.**

Ten years of systems that could not fail, now leading what organisations build with AI. MBA (Dean's Honours List), Nanyang Business School.

➡️ **Live: [theyuvrajgupta.github.io](https://theyuvrajgupta.github.io)**

![Vanilla JS](https://img.shields.io/badge/JS-vanilla%2C%20zero%20libraries-00E896?style=flat-square)
![No build step](https://img.shields.io/badge/build-none-3E6BFF?style=flat-square)
![Hosted on GitHub Pages](https://img.shields.io/badge/hosted-GitHub%20Pages-0C1218?style=flat-square)

---

## The idea

The site is named after its sky. The hero holds an aurora — a living canvas of six duotone light ribbons riding drifting sine fields — and every machined surface below it carries that light's reflections: brushed metal cards, engraved plates, instrument spotlights, a border glint that wakes when something can be pressed.

One design physics runs the whole page: **light moves, material doesn't.** Real content never transforms; only decorative layers ride the depth field, and focus is always additive — nothing legible ever dims.

## Highlights

- **The Living Sky** — a canvas aurora rendered at low internal resolution and upscaled under a static blur. Cursor steering bends the ribbons; the first 60vh of scroll charges the sky so the scroll gesture is rewarded instantly. Phases are integrated per frame, so no scroll speed can whip the timeline.
- **The Landings** — three credential spotlights in the hero's lower volume: a cone of station-hued light from the sky, a machined instrument plate at its foot, a glow pool beneath, all pulled apart in space by cursor parallax.
- **The machined material system** — one fabrication (brushed highlight, corner specular, ground bounce, striations, staged mount shadows) tinted per surface: emerald for the work, cobalt steel for the honours, the full duotone for the controls.
- **Distinct section heroes** — an assembling frame, a converging trajectory, a punched record card, a signature that inks itself as you read, an engraved ledger that closes with bookkeeping's double rule, a CSS-3D horizon, and a dashed path that turns solid where it lands on the footer.
- **The Live Edge** — a border light on the site's primary pressable surfaces (the hero and Calendly buttons, the five work cards) that wakes on hover or keyboard focus: a static duotone ring whose travelling glint brightens whatever colour it passes. It is never on anything you cannot press.
- **One rAF loop** — cursor, parallax, canvas sky, spotlight tracking, and the scroll-scrubbed heroes all run as tasks in a single loop with one layout read per frame, IntersectionObserver gates for everything off-screen, and epsilon-gated writes.

## Built to degrade gracefully

- **No JavaScript?** The full page renders, fully formed and fully lit — all entrance hiding is gated behind a `body.js` class, and a runtime error failsafe strips it back off.
- **`prefers-reduced-motion`?** Comprehensive: global animation kill plus live per-frame checks. Every rest state is the finished composition, never an empty stage.
- **Mobile?** The spatial engines switch off below 993px and layouts collapse to static stacks; the sky remains as CSS light curtains.
- **Keyboard and screen readers?** Focus-trapped dialogs with `inert` backgrounds, focus return on close, a skip link, `aria-current` scrollspy, real text on every engraved surface, and decorative layers hidden from assistive tech.

## Stack

None, deliberately. Three hand-written files — `index.html`, one stylesheet, one script — plus Font Awesome icons and three Google Fonts (Space Grotesk, Space Mono, Inter). No frameworks, no animation libraries, no build step, no dependencies to rot.

```
/
├─ index.html               all content and structure
├─ CLAUDE.md                the design constitution (decisions and rules)
├─ docs/
│  └─ ARCHITECTURE.md       the engineering manual (how it works, how to extend it)
└─ portfolio/
   ├─ css/style.css         all styles
   ├─ js/script.js          all interactivity, one DOMContentLoaded block
   └─ assets/               images, resume, social preview
```

## Run it locally

Any static server from the repo root:

```
python -m http.server 8123
```

Then open `http://localhost:8123`. There is nothing to install and nothing to build. Pushing to `main` deploys to GitHub Pages automatically.

## Documentation

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — the machine manual: runtime anatomy, the material and motion systems, extension recipes, a registry of hard-won browser traps, and the testing playbook.
- **[CLAUDE.md](CLAUDE.md)** — the constitution: the design system's binding decisions and copy rules.

## Contact

**Yuvraj Gupta**
📧 [mail.yuvrajgupta@gmail.com](mailto:mail.yuvrajgupta@gmail.com)
🔗 [LinkedIn — theyuvrajgupta](https://www.linkedin.com/in/theyuvrajgupta/)
📅 [Book a conversation](https://calendly.com/theyuvrajgupta)

## License

Licensed under the [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/): share and adapt freely, with credit to **Yuvraj Gupta** and a link back to this repository.
