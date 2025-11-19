/* global Lenis, gsap, ScrollTrigger */

document.addEventListener('DOMContentLoaded', () => {

    // --- DATA FOR COMPETENCIES ---
    const competencies = {
        ai: { title: "Strategic AI Innovation", skills: ["Market Analysis", "Product Vision", "Data Strategy", "Ethical AI Implementation"] },
        tech: { title: "Digital Transformation", skills: ["Legacy Modernization", "Process Automation", "Tech Stack Strategy", "Scalable Architecture"] },
        cloud: { title: "Cloud & Operations", skills: ["Serverless Architecture", "Cost Optimization", "DevOps Culture", "AWS Ecosystem"] },
        leadership: { title: "Strategic Leadership", skills: ["Crisis Management", "Cross-Functional Teams", "Stakeholder Mgmt", "Agile Transformation"] }
    };

    // --- CUSTOM CURSOR & MAGNETIC ELEMENTS ---
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    if (cursor && cursorFollower) {
        gsap.set(cursor, { xPercent: -50, yPercent: -50 });
        gsap.set(cursorFollower, { xPercent: -50, yPercent: -50 });

        window.addEventListener('mousemove', e => {
            gsap.to(cursor, { duration: 0.2, x: e.clientX, y: e.clientY });
            gsap.to(cursorFollower, { duration: 0.6, x: e.clientX, y: e.clientY });
        });

        document.querySelectorAll('.magnetic').forEach(el => {
            el.addEventListener('mouseenter', () => gsap.to(cursorFollower, { scale: 2, background: 'rgba(0, 245, 195, 0.4)' }));
            el.addEventListener('mouseleave', () => gsap.to(cursorFollower, { scale: 1, background: 'rgba(0, 245, 195, 0.2)' }));
        });
    }

    // --- DYNAMIC "NEURAL DUST" BACKGROUND ---
    const bgCanvas = document.getElementById('background-canvas');
    if (bgCanvas) {
        const ctx = bgCanvas.getContext('2d');
        let particles = [];
        const resize = () => { bgCanvas.width = window.innerWidth; bgCanvas.height = window.innerHeight; };
        const createParticles = () => {
            particles = [];
            const count = window.innerWidth < 768 ? 80 : 250;
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * bgCanvas.width,
                    y: Math.random() * bgCanvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    radius: Math.random() * 1.5,
                    alpha: Math.random() * 0.5 + 0.1
                });
            }
        };
        const animateBg = () => {
            ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > bgCanvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > bgCanvas.height) p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(230, 241, 255, ${p.alpha})`;
                ctx.fill();
            });
            requestAnimationFrame(animateBg);
        };
        window.addEventListener('resize', () => { resize(); createParticles(); });
        resize(); createParticles(); animateBg();
    }

    // --- GSAP ANIMATIONS ---
    gsap.registerPlugin(ScrollTrigger);

    // Scroll Progress Bar
    gsap.to("#scroll-progress-bar", {
        width: "100%",
        ease: "none",
        scrollTrigger: { scrub: true }
    });

    // --- FINAL HEADLINE ANIMATION: TEXT SCRAMBLE EFFECT ---
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.update = this.update.bind(this);
        }
        setText(newText) {
            const oldText = this.el.innerHTML.replace(/<br>/g, '\n');
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
            this.queue = [];
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                this.queue.push({ from, to, start, end });
            }
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }
        update() {
            let output = '';
            let complete = 0;
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.randomChar();
                        this.queue[i].char = char;
                    }
                    output += `<span class="dud">${char}</span>`;
                } else {
                    output += from;
                }
            }
            this.el.innerHTML = output.replace(/\n/g, '<br>');
            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(this.update);
                this.frame++;
            }
        }
        randomChar() {
            return this.chars[Math.floor(Math.random() * this.chars.length)];
        }
    }

    const headlineContainer = document.getElementById('headline-canvas-container');
    if (headlineContainer) {
        headlineContainer.innerHTML = '';
        const headlineEl = document.createElement('h1');
        headlineContainer.appendChild(headlineEl);

        headlineEl.style.fontSize = 'clamp(2.5rem, 6vw, 4.5rem)';
        headlineEl.style.fontFamily = "'Space Mono', monospace";
        headlineEl.style.color = 'var(--text-color)';
        headlineEl.style.lineHeight = '1.2'; /* Increased line height for better spacing */
        headlineEl.style.textAlign = 'left';
        headlineEl.style.minHeight = '14rem';
        headlineEl.style.display = 'block'; /* Changed from flex to block for proper <br> support */
        headlineEl.style.padding = '1rem 0';
        headlineEl.style.width = '100%';

        // ** FINAL BUG FIX: Multi-line text to prevent width jitter **
        const headlines = [
            'Digital<br>Leader.',
            'Tech<br>Entrepreneur.',
            'Innovator.'
        ];
        const fx = new TextScramble(headlineEl);
        let counter = 0;
        let timeoutId;

        const next = () => {
            clearTimeout(timeoutId);
            fx.setText(headlines[counter]).then(() => {
                timeoutId = setTimeout(next, 2800);
            });
            counter = (counter + 1) % headlines.length;
        };

        next();
    }

    gsap.to([".subtitle", ".home-buttons"], { opacity: 1, duration: 0.8, delay: 1.5 });

    // --- JOURNEY SECTION ANIMATION ---
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length > 0) {
        const journeyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.2 });
        timelineItems.forEach(item => journeyObserver.observe(item));
    }

    // --- INTERACTIVE COMPETENCIES MAP ---
    const competencyNodes = document.querySelectorAll('.competency-node');
    const competencyTitle = document.getElementById('competency-title');
    const competencySkills = document.getElementById('competency-skills');
    const competencyDetailsPanel = document.querySelector('.competency-details-panel');

    if (competencyNodes.length > 0 && competencyTitle && competencySkills) {
        competencyNodes.forEach(node => {
            node.addEventListener('click', () => {
                const competencyKey = node.dataset.competency;
                const data = competencies[competencyKey];
                competencyTitle.textContent = data.title;

                gsap.to("#competency-skills li", {
                    opacity: 0, y: -10, stagger: 0.05, duration: 0.2,
                    onComplete: () => {
                        competencySkills.innerHTML = data.skills.map(skill => `<li>${skill}</li>`).join('');
                        gsap.fromTo("#competency-skills li", { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.3, delay: 0.1 });

                        if (window.innerWidth <= 992 && competencyDetailsPanel) {
                            competencyDetailsPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                });
            });
        });
    }

    // --- 3D TILT FOR PROJECT CARDS ---
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const { left, top, width, height } = card.getBoundingClientRect();
            const x = (e.clientX - left) / width - 0.5;
            const y = (e.clientY - top) / height - 0.5;
            gsap.to(card, { duration: 0.5, rotationY: x * 15, rotationX: -y * 15, transformPerspective: 1000, ease: "power2.out" });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { duration: 0.8, rotationY: 0, rotationX: 0, ease: "elastic.out(1, 0.3)" });
        });
    });

    // --- MODAL LOGIC WITH SCROLL LOCK ---
    const projectCards = document.querySelectorAll('.project-card');
    const modalContainer = document.getElementById('modal-container');

    if (projectCards.length > 0 && modalContainer) {
        projectCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                document.body.classList.add('modal-open');
                const targetModalId = card.getAttribute('data-modal-target');
                const targetModal = document.getElementById(targetModalId);
                if (targetModal) {
                    modalContainer.classList.remove('hidden');
                    targetModal.classList.add('active');
                    animateNumbers(targetModal);
                }
            });
        });

        function animateNumbers(modal) {
            modal.querySelectorAll('strong[data-number]').forEach(el => {
                const endValue = parseInt(el.dataset.number, 10);
                let startValue = { val: 0 };
                gsap.to(startValue, { val: endValue, duration: 1.5, ease: 'power2.out', onUpdate: () => { el.textContent = Math.ceil(startValue.val); } });
            });
        }

        function closeAllModals() {
            document.body.classList.remove('modal-open');
            modalContainer.classList.add('hidden');
            document.querySelectorAll('.modal-content.active').forEach(modal => modal.classList.remove('active'));
        }
        document.querySelectorAll('.modal-close-btn').forEach(btn => btn.addEventListener('click', closeAllModals));
        document.querySelector('.modal-backdrop').addEventListener('click', closeAllModals);
    }
});
