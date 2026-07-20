document.addEventListener('DOMContentLoaded', () => {

    // Gate all JS-driven hiding/animation behind body.js so a script failure
    // leaves every element visible (no-JS users get the full static page).
    document.body.classList.add('js');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

            const tick = () => {
                cx += (tx - cx) * 0.35;
                cy += (ty - cy) * 0.35;
                cursor.style.transform = `translate(${cx}px, ${cy}px)`;
                requestAnimationFrame(tick);
            };
            tick();

            const interactiveSelector = 'a, button, [role="button"]';
            document.addEventListener('mouseover', e => {
                if (e.target.closest(interactiveSelector)) cursor.classList.add('on-interactive');
            });
            document.addEventListener('mouseout', e => {
                if (e.target.closest(interactiveSelector)) cursor.classList.remove('on-interactive');
            });
        }
    }

    // --- HERO DEPTH FIELD: cursor parallax + ambient drift ---
    // Each [data-depth] layer translates against the cursor by its depth factor,
    // plus a slow sine drift so the field breathes when the cursor is still.
    const heroSection = document.querySelector('.home-section');
    const layers = heroSection ? [...heroSection.querySelectorAll('[data-depth]')] : [];
    if (layers.length > 0 && !prefersReducedMotion) {
        let mx = 0, my = 0, sx = 0, sy = 0;
        const t0 = performance.now();

        window.addEventListener('mousemove', e => {
            mx = (e.clientX / window.innerWidth - 0.5);
            my = (e.clientY / window.innerHeight - 0.5);
        });

        const raf = (now) => {
            const t = (now - t0) / 1000;
            sx += (mx - sx) * 0.055;
            sy += (my - sy) * 0.055;
            layers.forEach((el, i) => {
                const d = parseFloat(el.dataset.depth);
                const a = parseFloat(el.dataset.drift || 0);
                const dx = Math.sin(t * 0.25 + i * 1.7) * a;
                const dy = Math.cos(t * 0.21 + i * 2.3) * a * 0.7;
                el.style.transform = `translate3d(${-sx * d * 260 + dx}px, ${-sy * d * 260 + dy}px, 0)`;
            });
            requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
    }

    // --- SCROLL PROGRESS BAR + NAVBAR STATE + SCROLL INDICATOR + ATMOSPHERE ---
    const progressBar = document.getElementById('scroll-progress-bar');
    const navbar = document.querySelector('.navbar');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    // Ambient aurora drifts slowly against the scroll so the page keeps depth
    // the whole way down instead of going flat below the hero.
    const atmos = prefersReducedMotion ? [] : [...document.querySelectorAll('.atmo')];

    const onScroll = () => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        if (progressBar) progressBar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
        if (scrollIndicator) scrollIndicator.style.opacity = window.scrollY > 100 ? '0' : '1';
        atmos.forEach((a, i) => {
            a.style.transform = `translate3d(0, ${window.scrollY * (0.05 + i * 0.035)}px, 0)`;
        });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // --- SCROLLSPY NAVIGATION ---
    const navLinks = document.querySelectorAll('.nav-menu a');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');
    const allNavLinks = [...navLinks, ...mobileNavLinks];

    // Map every section id to the nav href that should be active when in that section.
    // Sections with no matching link (e.g. #featured-moment, #expertise) fall back to
    // the nearest preceding linked section so the active state never goes blank.
    // The footer (#contact) is included so Contact activates at the bottom of the page.
    const spyTargets = document.querySelectorAll('main section, main footer');
    const linkedIds = new Set(Array.from(navLinks).map(l => l.getAttribute('href').slice(1)));
    const sectionNavMap = {};
    let lastLinkedId = null;
    spyTargets.forEach(section => {
        if (linkedIds.has(section.id)) {
            lastLinkedId = section.id;
        }
        sectionNavMap[section.id] = lastLinkedId;
    });

    // A thin horizontal band ~40% down the viewport decides the active section.
    // (A ratio threshold breaks on sections taller than the viewport, which can
    // never reach it — e.g. Projects on a laptop screen.)
    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = sectionNavMap[entry.target.id];
                allNavLinks.forEach(link => {
                    link.classList.toggle('active', !!targetId && link.getAttribute('href') === `#${targetId}`);
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    spyTargets.forEach(section => scrollSpyObserver.observe(section));

    // --- SCROLL REVEALS ---
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length > 0) {
        if (prefersReducedMotion) {
            revealEls.forEach(el => el.classList.add('is-visible'));
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
                        entry.target.classList.add('is-visible');
                        revealObserver.unobserve(entry.target);
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
        const openModal = (id, trigger) => {
            const modal = document.getElementById(id);
            if (!modal) return;
            lastFocused = trigger || document.activeElement;
            document.body.classList.add('modal-open');
            modalContainer.classList.remove('hidden');
            modal.classList.add('active');
            const closeBtn = modal.querySelector('.modal-close-btn');
            if (closeBtn) closeBtn.focus();
        };

        const closeAllModals = () => {
            document.body.classList.remove('modal-open');
            modalContainer.classList.add('hidden');
            document.querySelectorAll('.modal-content.active').forEach(m => m.classList.remove('active'));
            if (lastFocused) {
                lastFocused.focus();
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
            hamburgerBtn.classList.add('active');
            hamburgerBtn.setAttribute('aria-expanded', 'true');
        };

        const closeMenu = () => {
            mobileNav.classList.remove('open');
            mobileNav.setAttribute('aria-hidden', 'true');
            hamburgerBtn.classList.remove('active');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        };

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
    }
});
