document.addEventListener('DOMContentLoaded', () => {

    // Gate all JS-driven hiding/animation behind body.js so a script failure
    // leaves every element visible (no-JS users get the full static page).
    document.body.classList.add('js');
    // The gate must also survive RUNTIME throws: an uncaught exception at any
    // point (init or a later frame) drops every JS-gated state, returning the
    // page to the fully visible static composition. Without this, a throw
    // before the reveal observer registers leaves 28 .reveal elements at
    // opacity 0 and the page blank below the hero.
    window.addEventListener('error', () => {
        document.body.classList.remove('js', 'custom-cursor', 'sky-live');
    });

    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Safari <=13 / iOS <=13: MediaQueryList has no addEventListener (only
    // addListener). Alias it once on the prototype so every mq*.addEventListener
    // call below works there; a strict no-op wherever MediaQueryList already
    // inherits from EventTarget (all Chrome, Firefox, Safari 14+).
    if (!mqReduce.addEventListener && mqReduce.addListener) {
        const mqProto = Object.getPrototypeOf(mqReduce);
        mqProto.addEventListener = function (type, fn) {
            if (type === 'change') this.addListener(fn);
        };
    }
    // One-time setup (reveals, entrance) reads this snapshot; per-frame motion
    // gates read mqReduce.matches live so a mid-session OS toggle stops motion.
    const prefersReducedMotion = mqReduce.matches;
    // The one desktop breakpoint every engine gates on (sky, landings, field).
    const mqDesk = window.matchMedia('(min-width: 993px)');

    // Single master rAF loop for the whole site: cursor, hero parallax, and
    // the v14 field engine all register tasks here instead of running their
    // own loops.
    const rafTasks = [];

    // --- SIMPLIFIED CURSOR: dot that morphs to corner brackets on interactives ---
    if (window.matchMedia('(pointer: fine)').matches) {
        const cursor = document.querySelector('.cursor');
        if (cursor) {
            document.body.classList.add('custom-cursor');
            let cx = -100, cy = -100, tx = -100, ty = -100;

            window.addEventListener('mousemove', e => {
                tx = e.clientX;
                ty = e.clientY;
            });

            rafTasks.push(() => {
                const dx = tx - cx;
                const dy = ty - cy;
                if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return;
                cx += dx * 0.35;
                cy += dy * 0.35;
                cursor.style.transform = `translate(${cx}px, ${cy}px)`;
            });

            const interactiveSelector = 'a, button, [role="button"]';
            // mouseover is AUTHORITATIVE: every crossing re-derives the state
            // from where the pointer actually is, so the brackets can never
            // stick on after their target is covered (modal opens over a
            // hovered card) or removed. Self-healing beats add/remove pairs.
            document.addEventListener('mouseover', e => {
                cursor.classList.toggle('on-interactive', !!e.target.closest(interactiveSelector));
            });
            // mouseover can't fire when the pointer leaves the window
            // entirely — that one exit still needs the mouseout path.
            document.addEventListener('mouseout', e => {
                if (!e.relatedTarget) cursor.classList.remove('on-interactive');
            });
        }
    }

    // --- DEPTH FIELD: cursor parallax + ambient drift ---
    // Each [data-depth] layer translates against the cursor by its depth factor,
    // plus a slow sine drift so the field breathes when the cursor is still.
    // Layers are grouped by their hosting section (currently only the hero)
    // so off-screen groups are never written; the engine is host-agnostic.
    const layers = [...document.querySelectorAll('[data-depth]')];
    if (layers.length > 0) {
        let mx = 0, my = 0, sx = 0, sy = 0;
        const t0 = performance.now();
        const layerHost = layers.map(el => el.closest('section, footer'));
        // data-depth/data-drift are static; parse once, not per frame
        const layerDepth = layers.map(el => parseFloat(el.dataset.depth));
        const layerDrift = layers.map(el => parseFloat(el.dataset.drift || 0));
        const depthHosts = [...new Set(layerHost)];
        const nearHosts = new Set(depthHosts);

        window.addEventListener('mousemove', e => {
            mx = (e.clientX / window.innerWidth - 0.5);
            my = (e.clientY / window.innerHeight - 0.5);
        });

        const depthIO = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) nearHosts.add(e.target);
                else nearHosts.delete(e.target);
            });
        }, { rootMargin: '100px 0px' });
        depthHosts.forEach(h => depthIO.observe(h));

        mqReduce.addEventListener('change', () => {
            if (mqReduce.matches) layers.forEach(el => el.style.transform = '');
        });

        rafTasks.push((now) => {
            if (mqReduce.matches || nearHosts.size === 0) return;
            const t = (now - t0) / 1000;
            sx += (mx - sx) * 0.055;
            sy += (my - sy) * 0.055;
            layers.forEach((el, i) => {
                if (!nearHosts.has(layerHost[i])) return;
                const d = layerDepth[i];
                const a = layerDrift[i];
                const dx = Math.sin(t * 0.25 + i * 1.7) * a;
                const dy = Math.cos(t * 0.21 + i * 2.3) * a * 0.7;
                el.style.transform = `translate3d(${-sx * d * 260 + dx}px, ${-sy * d * 260 + dy}px, 0)`;
            });
        });

        // --- THE LIVING SKY ---
        // Canvas aurora above the CSS curtains: six light ribbons ride
        // layered drifting sine fields, drawn as vertical light columns
        // with additive blending along the duotone axis. Renders at low
        // internal resolution and upscales (the softening blur is static
        // CSS). Desktop + motion only; the CSS aurora is the rest state
        // everywhere else. Cursor steering (sx/sy) bends the sky; the
        // first 60vh of scroll CHARGES it — brighter, faster, sweeping
        // toward the fold — so the scroll gesture is rewarded instantly.
        // On entry the ribbons ignite from centre-sky and roll outward.
        const homeSection = document.getElementById('home');
        const skyCanvas = document.querySelector('.au-live');
        // Init whenever the canvas exists — setSkyOn and the frame task gate
        // rendering live, so a mobile-width load that later resizes to
        // desktop (or a reduced-motion toggle) still ignites the sky.
        if (homeSection && skyCanvas) {
            const ctx = skyCanvas.getContext('2d');
            const IW = 640;
            const STEP = 4;
            const NCOLS = IW / STEP;
            let IH = 300;
            let vh = window.innerHeight;
            let skyT0 = -1;

            // The duotone sampled across the sky: emerald → teal → blue → cobalt
            const AXIS = [[0, 232, 150], [21, 190, 187], [42, 150, 222], [62, 107, 255]];
            const colCache = [];
            for (let c = 0; c < NCOLS; c++) {
                const t = c / (NCOLS - 1) * (AXIS.length - 1);
                const i = Math.min(AXIS.length - 2, Math.floor(t));
                const f = t - i;
                const r = Math.round(AXIS[i][0] + (AXIS[i + 1][0] - AXIS[i][0]) * f);
                const g = Math.round(AXIS[i][1] + (AXIS[i + 1][1] - AXIS[i][1]) * f);
                const b = Math.round(AXIS[i][2] + (AXIS[i + 1][2] - AXIS[i][2]) * f);
                // One gradient per column, built ONCE over a unit-height
                // span; the draw loop maps it onto each column via
                // setTransform (scale y by L, translate to y − L) —
                // pixel-identical to a per-frame createLinearGradient
                // while dropping ~960 gradient allocations every frame.
                const gr = ctx.createLinearGradient(0, 0, 0, 1);
                gr.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
                gr.addColorStop(0.72, `rgba(${r}, ${g}, ${b}, 0.2)`);
                gr.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.6)`);
                colCache[c] = gr;
            }

            const skyMeasure = () => {
                const rc = homeSection.getBoundingClientRect();
                vh = window.innerHeight;
                IH = Math.max(240, Math.min(420, Math.round(IW * rc.height / Math.max(rc.width, 1))));
                skyCanvas.width = IW;
                skyCanvas.height = IH;
            };
            skyMeasure();
            window.addEventListener('load', skyMeasure);
            let skyResizeT;
            window.addEventListener('resize', () => {
                clearTimeout(skyResizeT);
                skyResizeT = setTimeout(skyMeasure, 200);
            });

            // Ribbon bases sit below the crown's glow — clear dark sky
            // separates the top arc from the living ribbons (his note:
            // the two must not mesh)
            // Two sets: the near ribbons carry the sky; the far set is
            // fainter, thinner, and slower — distance rendered as light
            const RIBBONS = [
                { y: 0.33, amp: 0.055, len: 0.42, k1: 0.011, k2: 0.023, k3: 0.005, s1: 0.00040, s2: -0.00058, s3: 0.00024, a: 0.42 },
                { y: 0.47, amp: 0.060, len: 0.34, k1: 0.009, k2: 0.019, k3: 0.004, s1: -0.00034, s2: 0.00050, s3: -0.00020, a: 0.30 },
                { y: 0.24, amp: 0.040, len: 0.26, k1: 0.013, k2: 0.027, k3: 0.006, s1: 0.00048, s2: 0.00031, s3: -0.00028, a: 0.22 },
                { y: 0.19, amp: 0.028, len: 0.18, k1: 0.016, k2: 0.033, k3: 0.007, s1: 0.00026, s2: -0.00037, s3: 0.00018, a: 0.13 },
                { y: 0.40, amp: 0.048, len: 0.28, k1: 0.010, k2: 0.021, k3: 0.0045, s1: -0.00022, s2: 0.00041, s3: -0.00015, a: 0.17 },
                { y: 0.56, amp: 0.044, len: 0.28, k1: 0.012, k2: 0.025, k3: 0.0055, s1: 0.00031, s2: 0.00024, s3: -0.00021, a: 0.15 }
            ];
            // Phases are ACCUMULATED per frame (dt · speed), never derived
            // from total elapsed time — deriving them meant a surge change
            // rescaled the whole accumulated timeline and the ribbons
            // whipped on fast scrolls back to the hero
            RIBBONS.forEach(rb => { rb.ph1 = 0; rb.ph2 = 0; rb.ph3 = 0; });
            let skyLastT = -1;

            const setSkyOn = () => {
                const on = mqDesk.matches && !mqReduce.matches;
                document.body.classList.toggle('sky-live', on);
                if (on) {
                    skyMeasure();
                    // Re-arm the dawn: without this, a return from mobile
                    // width or a reduced-motion toggle pops the sky on
                    // fully formed instead of igniting from centre-sky
                    skyT0 = -1;
                    skyLastT = -1;
                } else {
                    ctx.clearRect(0, 0, skyCanvas.width, skyCanvas.height);
                }
            };
            setSkyOn();
            mqDesk.addEventListener('change', setSkyOn);
            mqReduce.addEventListener('change', setSkyOn);

            rafTasks.push((now, scY) => {
                if (mqReduce.matches || !mqDesk.matches || !nearHosts.has(homeSection)) {
                    skyLastT = -1;
                    return;
                }
                if (skyT0 < 0) skyT0 = now;
                // Clamped time-step: waking from the off-screen pause can
                // never inject one giant phase leap
                const dt = skyLastT < 0 ? 16 : Math.min(64, now - skyLastT);
                skyLastT = now;
                const t = now - skyT0;
                const p = Math.min(1, Math.max(0, scY / (vh * 0.6)));
                const surge = p * (2 - p);
                const d = Math.min(1, Math.max(0, (t - 250) / 2100));
                const dawn = d * d * (3 - 2 * d);
                const reach = dawn * IW * 0.92;
                ctx.clearRect(0, 0, IW, IH);
                ctx.globalCompositeOperation = 'lighter';
                const xShift = -sx * 60;
                const speed = 1 + 1.6 * surge;
                for (const rb of RIBBONS) {
                    rb.ph1 += dt * rb.s1 * speed;
                    rb.ph2 += dt * rb.s2 * speed;
                    rb.ph3 += dt * rb.s3 * speed;
                    const p1 = rb.ph1;
                    const p2 = rb.ph2;
                    const p3 = rb.ph3;
                    const amp = IH * rb.amp * (1 + 0.5 * surge);
                    const base = IH * rb.y - sy * 14 + IH * 0.16 * surge;
                    const len0 = IH * rb.len;
                    const aBase = rb.a * (1 + 0.9 * surge);
                    for (let c = 0; c < NCOLS; c++) {
                        const x = c * STEP;
                        const env = dawn >= 1 ? 1 : Math.min(1, Math.max(0, (reach - Math.abs(x - IW * 0.5)) / 90));
                        if (env <= 0) continue;
                        const xs = x + xShift;
                        const y = base + amp * (Math.sin(xs * rb.k1 + p1) + 0.6 * Math.sin(xs * rb.k2 + p2)) + IH * 0.02 * Math.sin(xs * rb.k3 + p3);
                        const L = len0 * (0.75 + 0.25 * Math.sin(xs * rb.k2 * 0.7 + p3 * 1.3));
                        ctx.globalAlpha = Math.min(1, aBase * env);
                        ctx.setTransform(1, 0, 0, L, 0, y - L);
                        ctx.fillStyle = colCache[c];
                        ctx.fillRect(x, 0, STEP, 1);
                    }
                }
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.globalAlpha = 1;
                ctx.globalCompositeOperation = 'source-over';
            });
        }

        // --- THE LANDINGS (hero credentials) ---
        // The cursor steers the sky; the same smoothed value sweeps a
        // soft extra bloom across the three landing sites, so the
        // plate under the steered light catches it (beam brightens
        // too via the inherited --lit). Additive only (the base rim
        // is always fully lit). Geometry is cached on load and
        // debounced resize; the frame task does zero layout reads
        // and one epsilon-gated custom-property write per plate.
        const credPlates = [...document.querySelectorAll('.creds-field .cred')];
        if (homeSection && credPlates.length > 0) {
            const credLit = credPlates.map(() => -1);
            let credCenters = [];
            const credMeasure = () => {
                const w = window.innerWidth;
                credCenters = credPlates.map(el => {
                    const r = el.getBoundingClientRect();
                    return (r.left + r.width / 2) / w - 0.5;
                });
            };
            credMeasure();
            window.addEventListener('load', credMeasure);
            let credResizeT;
            window.addEventListener('resize', () => {
                clearTimeout(credResizeT);
                credResizeT = setTimeout(credMeasure, 200);
            });
            // Leaving desktop OR entering reduced motion stops the task
            // above from writing, so any nonzero --lit would freeze a
            // plate mid-bloom; clear it and reset the epsilon cache so a
            // return to the live state rewrites.
            const credClear = () => {
                if (mqDesk.matches && !mqReduce.matches) return;
                credPlates.forEach((el, i) => {
                    el.style.removeProperty('--lit');
                    credLit[i] = -1;
                });
            };
            mqDesk.addEventListener('change', credClear);
            mqReduce.addEventListener('change', credClear);
            rafTasks.push(() => {
                if (mqReduce.matches || !mqDesk.matches || !nearHosts.has(homeSection)) return;
                for (let i = 0; i < credPlates.length; i++) {
                    const lit = Math.max(0, 1 - Math.abs(sx - credCenters[i]) * 3.2);
                    if (Math.abs(lit - credLit[i]) < 0.01) continue;
                    credLit[i] = lit;
                    credPlates[i].style.setProperty('--lit', lit.toFixed(3));
                }
            });
        }
    }

    // --- FIELD ENGINE (v14 "Focal Plane") ---
    // Every [data-fz] layer is decorative (aria-hidden) and settles to rest
    // exactly when its section's center crosses the focal plane, the same
    // 40%-viewport band the scrollspy reads. The content plane never moves.
    const fieldEls = [...document.querySelectorAll('[data-fz]')];
    const projectsGrid = document.querySelector('.projects-grid');
    const timelineProgress = document.querySelector('.timeline-progress');
    const signaturePath = document.querySelector('.signature-path');
    const ruledOff = document.querySelector('.ruled-off');
    const roInks = ruledOff ? [...ruledOff.querySelectorAll('.ro-ink')] : [];
    const recognitionLedger = document.querySelector('.recognition-ledger');
    const recognitionItems = recognitionLedger ? [...recognitionLedger.querySelectorAll('.recognition-item')] : [];
    const aboutSection = document.getElementById('about');
    const projectsSection = document.getElementById('projects');
    const recognitionSection = document.getElementById('recognition');

    if (fieldEls.length > 0) {
        let fieldOn = false;
        let geom = [];
        let aboutGeom = null;
        let projectsCenter = 0;
        let projectsGeom = null;
        let recognitionGeom = null;
        let lastY = -1;
        const activeSecs = new Set();

        // Track which sections are near the viewport so off-screen layers
        // are never written.
        const fieldSections = [...new Set(fieldEls.map(el => el.closest('section')))];
        if (aboutSection && !fieldSections.includes(aboutSection)) fieldSections.push(aboutSection);
        if (projectsSection && !fieldSections.includes(projectsSection)) fieldSections.push(projectsSection);
        if (recognitionSection && !fieldSections.includes(recognitionSection)) fieldSections.push(recognitionSection);
        const nearObserver = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) activeSecs.add(e.target);
                else activeSecs.delete(e.target);
            });
            lastY = -1; // force a recompute pass on the next frame
        }, { rootMargin: '150px 0px' });
        fieldSections.forEach(s => nearObserver.observe(s));

        const computeGeom = () => {
            geom = fieldEls.map(el => {
                const sec = el.closest('section');
                return {
                    el,
                    sec,
                    fz: parseFloat(el.dataset.fz),
                    center: sec.offsetTop + sec.offsetHeight / 2,
                    last: Infinity
                };
            });
            if (aboutSection) aboutGeom = { top: aboutSection.offsetTop, height: aboutSection.offsetHeight };
            if (projectsSection) {
                projectsCenter = projectsSection.offsetTop + projectsSection.offsetHeight / 2;
                projectsGeom = { top: projectsSection.offsetTop, height: projectsSection.offsetHeight };
            }
            if (recognitionSection) {
                // The audit tracks the entries themselves, not the section box:
                // 0 as the first row enters the focal band, 1 as the last leaves.
                recognitionGeom = recognitionLedger
                    ? { top: recognitionLedger.getBoundingClientRect().top + window.scrollY, height: recognitionLedger.offsetHeight }
                    : { top: recognitionSection.offsetTop, height: recognitionSection.offsetHeight };
            }
            lastY = -1;
        };

        const setFieldOn = () => {
            fieldOn = !mqReduce.matches && mqDesk.matches;
            if (fieldOn) {
                computeGeom();
            } else {
                geom.forEach(g => {
                    g.el.style.transform = '';
                    g.last = Infinity;
                });
                if (timelineProgress) timelineProgress.style.transform = '';
                if (projectsGrid) projectsGrid.style.removeProperty('--fy');
                if (signaturePath) signaturePath.style.strokeDashoffset = '';
                roInks.forEach(ink => ink.style.transform = '');
                if (ruledOff) ruledOff.classList.remove('ro-done');
                recognitionItems.forEach(el => el.classList.remove('is-focal'));
            }
        };
        setFieldOn();

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(setFieldOn, 150);
        });
        // Late layout shifts (fonts, lazy images) move section centers.
        window.addEventListener('load', setFieldOn);
        mqReduce.addEventListener('change', setFieldOn);
        // Breakpoint crossings respond immediately, not after the 150ms
        // resize debounce (the sky and landings already gate this way)
        mqDesk.addEventListener('change', setFieldOn);

        rafTasks.push((now, y, vph) => {
            if (!fieldOn) return;
            if (Math.abs(y - lastY) < 0.5) return;
            lastY = y;
            const focal = y + vph * 0.425;
            geom.forEach(g => {
                if (!activeSecs.has(g.sec)) return;
                const off = (focal - g.center) * g.fz * 0.12;
                if (Math.abs(off - g.last) < 0.25) return;
                g.last = off;
                g.el.style.transform = `translate3d(0, ${off.toFixed(2)}px, 0)`;
            });
            if (timelineProgress && aboutGeom && activeSecs.has(aboutSection)) {
                const p = Math.min(1, Math.max(0, (focal - aboutGeom.top) / aboutGeom.height));
                timelineProgress.style.transform = `scaleY(${p.toFixed(4)})`;
            }
            if (projectsGrid && projectsSection && activeSecs.has(projectsSection)) {
                const fy = Math.max(-4, Math.min(4, (focal - projectsCenter) * 0.006));
                projectsGrid.style.setProperty('--fy', `${fy.toFixed(2)}px`);
            }
            // The scroll holds the pen: the signature's stroke progress is
            // scrubbed to how far the reader has traversed the section.
            if (signaturePath && projectsGeom && activeSecs.has(projectsSection)) {
                const p = Math.min(1, Math.max(0, (focal - projectsGeom.top) / projectsGeom.height));
                signaturePath.style.strokeDashoffset = (1 - p).toFixed(4);
            }
            // The audit: plates ink one by one in reading order as the
            // ledger passes the band, the double rule draws across with
            // them, and the dot lands when the account is closed.
            if (roInks.length && recognitionGeom && activeSecs.has(recognitionSection)) {
                const p = Math.min(1, Math.max(0, (focal - recognitionGeom.top) / recognitionGeom.height));
                roInks.forEach(ink => ink.style.transform = `scaleX(${p.toFixed(4)})`);
                ruledOff.classList.toggle('ro-done', p >= 0.985);
                recognitionItems.forEach((el, i) => el.classList.toggle('is-focal', p >= 0.15 + i * 0.2));
            }
        });
    }

    // Start the master loop once everything has registered.
    if (rafTasks.length > 0) {
        const loop = (now) => {
            // Reschedule FIRST so one throwing task can't stop every
            // animation on the site (with cursor: none active, a dead
            // loop would also leave the user with no pointer at all).
            requestAnimationFrame(loop);
            // One clean layout read per frame, BEFORE any task writes —
            // tasks reading scrollY themselves after earlier tasks had
            // dirtied style forced two synchronous layouts every frame.
            const y = window.scrollY;
            const vph = window.innerHeight;
            for (let i = 0; i < rafTasks.length; i++) {
                try {
                    rafTasks[i](now, y, vph);
                } catch (err) {
                    // Evict the broken task; the rest of the site keeps
                    // animating. The global error failsafe drops body.js.
                    rafTasks.splice(i, 1);
                    i--;
                    setTimeout(() => { throw err; }, 0);
                }
            }
        };
        requestAnimationFrame(loop);
    }

    // --- FOOTER: THE BASE IS IN MOTION ---
    // The coordinates line never settles: it departs from Singapore and
    // wanders the globe a few bearings per second. Static "recalculating"
    // for no-JS and reduced-motion; only ticks while the footer is near.
    const coordsLive = document.querySelector('.coords-live');
    const footerHost = document.querySelector('.footer');
    if (coordsLive && footerHost) {
        let footerNear = false;
        let lat = 1.3521, lon = 103.8198;
        new IntersectionObserver(entries => {
            footerNear = entries[entries.length - 1].isIntersecting;
        }, { rootMargin: '200px 0px' }).observe(footerHost);
        // A mid-wander reduced-motion toggle would otherwise freeze the
        // readout on a random bearing; return it to the static rest text
        mqReduce.addEventListener('change', () => {
            if (mqReduce.matches) coordsLive.textContent = 'recalculating';
        });
        setInterval(() => {
            if (!footerNear || mqReduce.matches) return;
            lat += (Math.random() - 0.5) * 7;
            lon += (Math.random() - 0.5) * 11;
            if (lat > 85) lat = 85;
            if (lat < -85) lat = -85;
            if (lon > 180) lon -= 360;
            if (lon < -180) lon += 360;
            const ns = lat >= 0 ? 'N' : 'S';
            const ew = lon >= 0 ? 'E' : 'W';
            coordsLive.textContent = `${Math.abs(lat).toFixed(4)}° ${ns} · ${Math.abs(lon).toFixed(4)}° ${ew}`;
        }, 140);
    }

    // --- SCROLL PROGRESS BAR + NAVBAR STATE + SCROLL INDICATOR + ATMOSPHERE ---
    const progressBar = document.getElementById('scroll-progress-bar');
    const navbar = document.querySelector('.navbar');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    // Ambient aurora drifts slowly against the scroll so the page keeps depth
    // the whole way down instead of going flat below the hero.
    const atmos = [...document.querySelectorAll('.atmo')];
    mqReduce.addEventListener('change', () => {
        if (mqReduce.matches) atmos.forEach(a => a.style.transform = '');
    });

    // scrollHeight is a hard layout read — cache it outside the scroll
    // handler (document height only changes on resize/load)
    let scrollMax = 0;
    const measureScrollMax = () => {
        scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    };
    measureScrollMax();
    window.addEventListener('load', measureScrollMax);
    let scrollMaxT;
    window.addEventListener('resize', () => {
        clearTimeout(scrollMaxT);
        scrollMaxT = setTimeout(measureScrollMax, 200);
    });

    const onScroll = () => {
        if (progressBar) progressBar.style.width = `${scrollMax > 0 ? (window.scrollY / scrollMax) * 100 : 0}%`;
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
        if (scrollIndicator) scrollIndicator.style.opacity = window.scrollY > 100 ? '0' : '1';
        if (!mqReduce.matches) {
            atmos.forEach((a, i) => {
                a.style.transform = `translate3d(0, ${window.scrollY * (0.05 + i * 0.035)}px, 0)`;
            });
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // --- SCROLLSPY NAVIGATION + FOCAL-PLANE STATE ---
    const navLinks = document.querySelectorAll('.nav-menu a');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');
    const allNavLinks = [...navLinks, ...mobileNavLinks];

    // Map every section id to the nav href that should be active when in that
    // section. Sections with no matching link (e.g. #featured-moment,
    // #expertise) fall back to the nearest preceding linked section so the
    // active state never goes blank. The footer (#contact) is included so
    // Contact activates at the bottom of the page.
    // The same observer also drives .is-focal on [data-focal] targets
    // (timeline items, ledger rows, the featured-moment section): whatever
    // crosses the reading band gains emphasis. Zero extra observers.
    const spyTargets = document.querySelectorAll('main section, body > footer, [data-focal]');
    const linkedIds = new Set(Array.from(navLinks).map(l => (l.getAttribute('href') || '').slice(1)));
    const sectionNavMap = {};
    let lastLinkedId = null;
    spyTargets.forEach(target => {
        if (!target.matches('section, footer')) return;
        if (linkedIds.has(target.id)) {
            lastLinkedId = target.id;
        }
        sectionNavMap[target.id] = lastLinkedId;
    });

    // A thin horizontal band ~40% down the viewport decides the active section.
    // (A ratio threshold breaks on sections taller than the viewport, which can
    // never reach it — e.g. Projects on a laptop screen.)
    // The About frame assembles corner by corner as the story's chapters
    // cross the reading band, and recedes when scrolling back up.
    const aboutFrame = document.getElementById('about-frame');
    const timelineItems = [...document.querySelectorAll('.timeline-item')];

    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const target = entry.target;
            if (target.hasAttribute('data-focal')) {
                target.classList.toggle('is-focal', entry.isIntersecting);
            }
            if (aboutFrame && entry.isIntersecting && target.classList.contains('timeline-item')) {
                const built = timelineItems.indexOf(target) + 1;
                for (let i = 1; i <= timelineItems.length; i++) {
                    aboutFrame.classList.toggle(`built-${i}`, i <= built);
                }
            }
            if (!entry.isIntersecting) return;
            if (target.id in sectionNavMap) {
                const targetId = sectionNavMap[target.id];
                allNavLinks.forEach(link => {
                    const on = !!targetId && link.getAttribute('href') === `#${targetId}`;
                    link.classList.toggle('active', on);
                    // Mirror the visual active state for assistive tech
                    // ('location' is the token for position-within-page)
                    if (on) {
                        link.setAttribute('aria-current', 'location');
                    } else {
                        link.removeAttribute('aria-current');
                    }
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    spyTargets.forEach(target => scrollSpyObserver.observe(target));

    // --- COMPETENCY → PUNCH CARD FOCUS PULL ---
    // Hovering (or keyboard-focusing into) a competency card lights every
    // project label that proves it and pushes light through its row of
    // apertures (block order = row-group order). Labels are matched by
    // data-ghost, not id: PRISM and Decade One punch twice, so the same
    // project name appears at more than one aperture.
    const punchcard = document.querySelector('.punchcard');
    document.querySelectorAll('.competency-block').forEach((block, i) => {
        const ghosts = [...block.querySelectorAll('.proof-chip')]
            .flatMap(chip => [...document.querySelectorAll(
                `[data-ghost="${CSS.escape(chip.getAttribute('data-modal-target'))}"]`)]);
        if (ghosts.length === 0) return;
        const setFocus = on => {
            ghosts.forEach(g => g.classList.toggle('ghost-focus', on));
            if (punchcard) punchcard.classList.toggle(`pc-on-${i + 1}`, on);
        };
        block.addEventListener('mouseenter', () => setFocus(true));
        block.addEventListener('mouseleave', () => setFocus(false));
        block.addEventListener('focusin', () => setFocus(true));
        block.addEventListener('focusout', () => setFocus(false));
    });

    // --- SCROLL REVEALS ---
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length > 0) {
        // Once an element has fully revealed, strip the reveal classes and the
        // inline stagger delay: the reveal rules pin `transform` and replace
        // each element's own transition list, which would otherwise suppress
        // hover lifts (cards, competency blocks) for the rest of the session.
        const finishReveal = (el) => {
            el.classList.remove('reveal', 'is-visible');
            el.style.transitionDelay = '';
        };

        if (prefersReducedMotion) {
            revealEls.forEach(el => el.classList.remove('reveal'));
        } else {
            // Cascade grouped reveals: each item waits a beat longer than the last
            // within its container, so sections arrive with rhythm instead of a flat fade.
            revealEls.forEach(el => {
                const group = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
                const idx = group.indexOf(el);
                if (idx > 0) el.style.transitionDelay = `${Math.min(idx, 6) * 0.08}s`;
            });
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        el.classList.add('is-visible');
                        revealObserver.unobserve(el);
                        const onEnd = (e) => {
                            if (e.target !== el) return;
                            el.removeEventListener('transitionend', onEnd);
                            finishReveal(el);
                        };
                        el.addEventListener('transitionend', onEnd);
                        // Fallback in case transitionend never fires
                        // (max stagger 0.48s + 0.6s transition < 1.5s).
                        setTimeout(() => finishReveal(el), 1500);
                    }
                });
            }, { threshold: 0.12 });
            revealEls.forEach(el => revealObserver.observe(el));
        }
    }

    // --- MODALS (cards + proof chips), WITH KEYBOARD SUPPORT ---
    const modalContainer = document.getElementById('modal-container');
    const openers = document.querySelectorAll('[data-modal-target]');
    let lastFocused = null;

    if (modalContainer && openers.length > 0) {
        // While a dialog is open, the background page is inert so neither
        // Tab nor AT can reach it (mirrors the mobile-nav inert pattern).
        // The mobile nav manages its own inert state and is left alone.
        const backgroundRegions = document.querySelectorAll('.navbar, main, body > footer');
        const setBackgroundInert = (state) => {
            backgroundRegions.forEach(el => { el.inert = state; });
        };

        const openModal = (id, trigger) => {
            const modal = document.getElementById(id);
            if (!modal) return;
            lastFocused = trigger || document.activeElement;
            document.body.classList.add('modal-open');
            modalContainer.classList.remove('hidden');
            modal.classList.add('active');
            setBackgroundInert(true);
            const closeBtn = modal.querySelector('.modal-close-btn');
            if (closeBtn) closeBtn.focus();
        };

        const closeAllModals = () => {
            document.body.classList.remove('modal-open');
            modalContainer.classList.add('hidden');
            document.querySelectorAll('.modal-content.active').forEach(m => m.classList.remove('active'));
            setBackgroundInert(false);
            if (lastFocused) {
                lastFocused.focus();
                // The opener may have left the layout (breakpoint change
                // while the dialog was open); don't strand focus on <body>
                if (document.activeElement === document.body) {
                    const main = document.getElementById('main-content');
                    if (main) main.focus();
                }
                lastFocused = null;
            }
        };

        openers.forEach(el => {
            el.addEventListener('click', () => openModal(el.getAttribute('data-modal-target'), el));
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal(el.getAttribute('data-modal-target'), el);
                }
            });
        });

        document.querySelectorAll('.modal-close-btn').forEach(btn => btn.addEventListener('click', closeAllModals));
        modalContainer.querySelector('.modal-backdrop').addEventListener('click', closeAllModals);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modalContainer.classList.contains('hidden')) {
                closeAllModals();
            }
            // Keep Tab inside the open modal
            if (e.key === 'Tab' && !modalContainer.classList.contains('hidden')) {
                const active = modalContainer.querySelector('.modal-content.active');
                if (!active) return;
                const focusables = active.querySelectorAll('button, a[href]');
                if (focusables.length === 0) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                // Focus can land outside the focusables (e.g. a click on the
                // modal's body text blurs to <body>); pull it back in.
                if (!active.contains(document.activeElement)) {
                    e.preventDefault();
                    first.focus();
                    return;
                }
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });
    }

    // --- HAMBURGER MENU ---
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const mobileNav = document.getElementById('mobile-nav');

    if (hamburgerBtn && mobileNav) {
        const openMenu = () => {
            mobileNav.classList.add('open');
            mobileNav.setAttribute('aria-hidden', 'false');
            mobileNav.inert = false;
            hamburgerBtn.classList.add('active');
            hamburgerBtn.setAttribute('aria-expanded', 'true');
        };

        const closeMenu = () => {
            // Rescue focus BEFORE inert strands it on <body> — the next
            // Tab would otherwise restart from the top of the document
            if (mobileNav.contains(document.activeElement)) hamburgerBtn.focus();
            mobileNav.classList.remove('open');
            mobileNav.setAttribute('aria-hidden', 'true');
            mobileNav.inert = true;
            hamburgerBtn.classList.remove('active');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        };

        // The closed menu is visually collapsed (max-height 0) but its links
        // would otherwise remain in the tab order.
        mobileNav.inert = true;

        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileNav.classList.contains('open') ? closeMenu() : openMenu();
        });

        document.querySelectorAll('.mobile-nav a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar') && !e.target.closest('.mobile-nav')) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileNav.classList.contains('open')) closeMenu();
        });
    }
});
