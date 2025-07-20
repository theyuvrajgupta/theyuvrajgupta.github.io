/* global Lenis, gsap, ScrollTrigger */

document.addEventListener('DOMContentLoaded', () => {

    // --- DATA FOR COMPETENCIES ---
    const competencies = {
        ai: { title: "AI & ML Innovation", skills: ["ML Engineering", "Deep Learning (CNN)", "TensorFlow & Python", "Data-Driven Decisions"] },
        healthtech: { title: "HealthTech Strategy", skills: ["Clinical Workflows", "Medical Imaging (PET-CT)", "DICOM Standards", "Product Innovation"] },
        cloud: { title: "Cloud & Scalability", skills: ["Serverless Architecture", "AWS (Lambda, SQS, S3)", "Process Optimization", "Infrastructure as Code"] },
        leadership: { title: "Product Leadership", skills: ["Agile & Scrum Mastery", "Product Thinking", "Team Mentorship", "Stakeholder Management"] }
    };

    // --- SMOOTH SCROLLING (NATIVE) ---

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

    // --- HEADLINE ANIMATION ---
    const headlineCanvas = document.getElementById('headline-canvas');
    if (headlineCanvas) {
        const ctx = headlineCanvas.getContext('2d');
        const headlines = ["Strategist.", "Innovator.", "Health-Tech Leader."];
        let particles = [];
        let currentHeadlineIndex = 0;
        let animationState = 'streaming';

        const resizeHeadlineCanvas = () => {
            const container = document.getElementById('headline-canvas-container');
            headlineCanvas.width = container.offsetWidth;
            headlineCanvas.height = container.offsetHeight;
        };

        class HeadlineParticle {
            constructor(x, y) {
                this.x = x; this.y = y; this.vx = 0; this.vy = Math.random() * 2 + 1;
                this.targetX = null; this.targetY = null;
                this.radius = Math.random() * 1.5 + 1;
                this.color = `rgba(0, 245, 195, ${Math.random() * 0.5 + 0.5})`;
            }
            update() {
                if (animationState === 'forming' && this.targetX !== null) {
                    this.vx += (this.targetX - this.x) * 0.03;
                    this.vy += (this.targetY - this.y) * 0.03;
                    this.vx *= 0.92; this.vy *= 0.92;
                } else {
                    this.y += this.vy;
                    if (this.y > headlineCanvas.height) { this.y = 0; this.x = Math.random() * headlineCanvas.width; }
                }
                this.x += this.vx; this.y += this.vy;
            }
            draw() {
                ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color; ctx.fill();
            }
        }

        const getTextPoints = (text1, text2 = null) => {
            // *** BUG FIX: Using a more conservative font size to prevent clipping ***
            const fontSize = Math.min(headlineCanvas.width / 9, 55);
            const font = `bold ${fontSize}px "Satoshi"`;
            ctx.font = font;
            const textMetrics1 = ctx.measureText(text1);
            let textWidth = textMetrics1.width;
            let textHeight = fontSize;
            if (text2) {
                const textMetrics2 = ctx.measureText(text2);
                textWidth = Math.max(textWidth, textMetrics2.width);
                textHeight *= 2.2;
            }
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = textWidth; tempCanvas.height = textHeight;
            tempCtx.font = font; tempCtx.fillStyle = '#fff'; tempCtx.textAlign = 'right';
            tempCtx.fillText(text1, textWidth, fontSize * 0.8);
            if (text2) tempCtx.fillText(text2, textWidth, fontSize * 1.8);

            const imageData = tempCtx.getImageData(0, 0, textWidth, textHeight);
            const points = []; const density = 4;
            for (let y = 0; y < imageData.height; y += density) {
                for (let x = 0; x < imageData.width; x += density) {
                    if (imageData.data[(y * imageData.width + x) * 4 + 3] > 128) {
                        points.push({ x: x + (headlineCanvas.width - textWidth), y: y + (headlineCanvas.height - textHeight) / 2 });
                    }
                }
            }
            return points;
        };

        const cycleHeadlines = () => {
            animationState = 'dissolving';
            particles.forEach(p => { p.targetX = null; p.targetY = null; p.vy = Math.random() * 2 + 1; });
            setTimeout(() => {
                currentHeadlineIndex = (currentHeadlineIndex + 1) % 3; // Cycle through 3 states
                let textPoints;
                if (currentHeadlineIndex === 0) textPoints = getTextPoints("Strategist.");
                else if (currentHeadlineIndex === 1) textPoints = getTextPoints("Innovator.");
                else textPoints = getTextPoints("Health-Tech", "Leader.");
                
                animationState = 'forming';
                particles.forEach((p, i) => {
                    const target = textPoints[i % textPoints.length];
                    p.targetX = target.x; p.targetY = target.y;
                });
                setTimeout(cycleHeadlines, 3500);
            }, 1000);
        };

        const initHeadline = () => {
            resizeHeadlineCanvas();
            particles = [];
            const count = window.innerWidth < 768 ? 200 : 400;
            for (let i = 0; i < count; i++) particles.push(new HeadlineParticle(Math.random() * headlineCanvas.width, Math.random() * headlineCanvas.height));
            animateHeadline();
            setTimeout(cycleHeadlines, 500);
        };

        const animateHeadline = () => {
            ctx.clearRect(0, 0, headlineCanvas.width, headlineCanvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animateHeadline);
        };
        window.addEventListener('resize', initHeadline);
        initHeadline();
    }
    
    gsap.to([".subtitle", ".home-buttons"], { opacity: 1, duration: 0.8, delay: 1.5 });

    // --- JOURNEY SECTION ANIMATION ---
    const timelineItems = document.querySelectorAll('.timeline-item');
    if(timelineItems.length > 0) {
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

    if (competencyNodes.length > 0 && competencyTitle && competencySkills) {
        competencyNodes.forEach(node => {
            node.addEventListener('mouseenter', () => {
                const competencyKey = node.dataset.competency;
                const data = competencies[competencyKey];
                competencyTitle.textContent = data.title;
                gsap.to("#competency-skills li", {
                    opacity: 0, y: -10, stagger: 0.05, duration: 0.2,
                    onComplete: () => {
                        competencySkills.innerHTML = data.skills.map(skill => `<li>${skill}</li>`).join('');
                        gsap.fromTo("#competency-skills li", { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.3, delay: 0.1 });
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
