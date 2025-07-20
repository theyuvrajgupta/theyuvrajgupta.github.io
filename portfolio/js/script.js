/* global Lenis, gsap, ScrollTrigger */
document.addEventListener('DOMContentLoaded', () => {

    // --- DATA FOR COMPETENCIES ---
    const competencies = {
        ai: { title: "AI & ML Innovation", skills: ["ML Engineering", "Deep Learning (CNN)", "TensorFlow & Python", "Data-Driven Decisions"] },
        healthtech: { title: "HealthTech Strategy", skills: ["Clinical Workflows", "Medical Imaging (PET-CT)", "DICOM Standards", "Product Innovation"] },
        cloud: { title: "Cloud & Scalability", skills: ["Serverless Architecture", "AWS (Lambda, SQS, S3)", "Process Optimization", "Infrastructure as Code"] },
        leadership: { title: "Product Leadership", skills: ["Agile & Scrum Mastery", "Product Thinking", "Team Mentorship", "Stakeholder Management"] }
    };

    // --- SMOOTH SCROLLING (LENIS) - INTEGRATION WITH GSAP ---
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis();

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
    }

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
            const count = window.innerWidth < 768 ? 50 : 150;
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

    // Headline animation
    gsap.to(".main-headline span", { y: 0, opacity: 1, stagger: 0.2, duration: 1, ease: "power3.out", delay: 0.5 });
    
    // REMOVED: Old parallax animation that was causing errors.
    // The new "About" section has its own animation below.

    // Animate narrative cards
    gsap.from(".narrative-card", {
        scrollTrigger: {
            trigger: ".about-narrative-grid",
            start: "top 80%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        y: 50,
        stagger: 0.2,
        duration: 0.8,
        ease: "power3.out"
    });

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
            gsap.to(card, {
                duration: 0.5,
                rotationY: x * 15,
                rotationX: -y * 15,
                transformPerspective: 1000,
                ease: "power2.out"
            });
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
                if (lenis) lenis.stop(); // Stop Lenis scroll
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
            if (lenis) lenis.start(); // Start Lenis scroll
            document.body.classList.remove('modal-open');
            modalContainer.classList.add('hidden');
            document.querySelectorAll('.modal-content.active').forEach(modal => modal.classList.remove('active'));
        }
        document.querySelectorAll('.modal-close-btn').forEach(btn => btn.addEventListener('click', closeAllModals));
        document.querySelector('.modal-backdrop').addEventListener('click', closeAllModals);
    }
});
