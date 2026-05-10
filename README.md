# theyuvrajgupta.github.io

🌐 **Personal Portfolio Website of Yuvraj Gupta**

## ❓ Frequently Asked Questions (FAQs)

### **Q: What is this project?**
This is my animated, scroll-driven portfolio presenting my work as an **AI Strategist** — a decade of enterprise engineering, an MBA at Nanyang Business School, and a focus on operating at the intersection of technology strategy and business impact. Built for investors, recruiters, collaborators, and anyone who wants to understand the work.

### **Q: Where can I see it live?**
➡️ **[https://theyuvrajgupta.github.io](https://theyuvrajgupta.github.io)**

---

### **Q: What are the key features?**

*   **Rotating Hero Headline**: A TextScramble animation cycles through three positioning statements — AI Strategist, Enterprise Transformer, Tech-Fluent Leader.
*   **Animated Story Timeline**: Career progression (The Foundation → The Sharpening → The Edge → Beyond Work) rendered as a scroll-triggered timeline.
*   **Featured Moment Strip**: A highlighted callout for the most significant current recognition — presently the MBA World Summit 2026 selection.
*   **Interactive Competency Map**: A node-based SVG map. Clicking a core competency (AI Strategy, Enterprise Transformation, Technology Architecture, Commercial Strategy) reveals detailed skills.
*   **Signature Work Cards & Modals**: Five project cards (PRISM, Kellogg–Mekong Resilience Fund, VCIC, Mazda, Foundation) with 3D tilt on hover, ghost text overlays, animated corner brackets, and click-to-open glassmorphism modals presenting full case studies.
*   **Recognition List**: Staggered-in achievement items covering MBA World Summit, Kellogg–Morgan Stanley Global Finals, VCIC Asia Finals, and PGC Class Champion.
*   **Vision Section**: A pulsing orb with four strategic pillars connected by animated SVG lines.
*   **Mobile Hamburger Menu**: Full-width slide-down nav for screens below 768px, with smooth open/close animation and outside-click dismissal.
*   **"Synaptic Night" Aesthetic**: Dark space theme with a live Neural Dust particle canvas background, glassmorphism panels, teal (`#00f5c3`) and purple (`#c869ff`) accents, and a Space Mono / Satoshi / Inter font pairing.

---

### **Q: What technologies were used to build this?**

*   **HTML5 & CSS3**: CSS Grid, Flexbox, Custom Properties, `clamp()` fluid typography, `backdrop-filter` glassmorphism.
*   **JavaScript (ES6+)**: Single-file, no framework, all logic inside one `DOMContentLoaded` block.
*   **GSAP (GreenSock Animation Platform)**: ScrollTrigger, magnetic cursor effects, number counter animations, modal transitions.
*   **HTML5 Canvas**: Custom "Neural Dust" animated particle network background.
*   **Font Awesome**: Iconography.

---

### **Q: How is the project structured?**

```
/
├─ index.html              # All content, markup, and section structure
├─ CLAUDE.md               # Codebase guidance for Claude Code
├─ README.md
└─ portfolio/
   ├─ css/
   │  └─ style.css         # All styles — theme, layout, animations, responsive
   ├─ js/
   │  └─ script.js         # All interactivity — GSAP, canvas, modals, scrollspy
   └─ assets/              # Images and resume PDF
```

GSAP and ScrollTrigger are loaded from CDN — there is no build step, no package manager, and no bundler.

---

### **Q: How can I use or customize this template?**

1.  **Fork / Clone** this repository.
2.  **Customize Content**: Edit `index.html` to update bio, timeline, featured moment, projects, recognition, and vision.
3.  **Update Skills Data**: Modify the `competencies` object near the top of `portfolio/js/script.js`.
4.  **Update Headline Variants**: Edit the `headlines` array in `portfolio/js/script.js`.
5.  **Update Assets**: Replace images and the resume PDF in `portfolio/assets/`.
6.  **Deploy**: Push changes to your `main` branch. GitHub Pages will automatically host it at `https://yourusername.github.io`.

---

### **Q: Who created this?**

**Yuvraj Gupta**
📧 [mail.yuvrajgupta@gmail.com](mailto:mail.yuvrajgupta@gmail.com)
🔗 [LinkedIn – theyuvrajgupta](https://www.linkedin.com/in/theyuvrajgupta/)
📍 Singapore

---

### **Q: What is the license?**

This portfolio is licensed under the [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).

**You are free to:**
*   **Share** — copy and redistribute the material in any medium or format
*   **Adapt** — remix, transform, and build upon the material for any purpose

**Under the following terms:**
*   **Attribution** — You must give appropriate credit to **Yuvraj Gupta** and provide a link to the original repository.

> *Designed to inspire, inform, and invite collaboration.*
