document.addEventListener('DOMContentLoaded', () => {

    // --- DATA ---
    const skillsData = {
        nodes: [
            { id: "HealthTech", type: "main", name: "HealthTech Strategy" },
            { id: "AI & ML", type: "main", name: "AI & ML Innovation" },
            { id: "Cloud Architecture", type: "main", name: "Cloud & Scalability" },
            { id: "Product Leadership", type: "main", name: "Product Leadership" },
            { id: "Clinical Workflows", type: "skill", parent: "HealthTech", name: "Clinical Workflows" },
            { id: "Medical Imaging", type: "skill", parent: "HealthTech", name: "Medical Imaging (PET-CT)" },
            { id: "DICOM", type: "skill", parent: "HealthTech", name: "DICOM Standards" },
            { id: "ML Engineering", type: "skill", parent: "AI & ML", name: "ML Engineering" },
            { id: "Deep Learning", type: "skill", parent: "AI & ML", name: "Deep Learning (CNN)" },
            { id: "TensorFlow", type: "skill", parent: "AI & ML", name: "TensorFlow & Python" },
            { id: "Data-driven decisions", type: "skill", parent: "AI & ML", name: "Data-Driven Decisions" },
            { id: "Serverless Arch", type: "skill", parent: "Cloud Architecture", name: "Serverless Architecture" },
            { id: "AWS", type: "skill", parent: "Cloud Architecture", name: "AWS (Lambda, SQS, S3)" },
            { id: "Process Optimization", type: "skill", parent: "Cloud Architecture", name: "Process Optimization" },
            { id: "Terraform", type: "skill", parent: "Cloud Architecture", name: "Infrastructure as Code" },
            { id: "Agile & Scrum", type: "skill", parent: "Product Leadership", name: "Agile & Scrum Master" },
            { id: "Product Thinking", type: "skill", parent: "Product Leadership", name: "Product Thinking" },
            { id: "Mentorship", type: "skill", parent: "Product Leadership", name: "Team Mentorship" },
            { id: "Stakeholder Mngmt", type: "skill", parent: "Product Leadership", name: "Stakeholder Management" },
        ]
    };

    // --- DYNAMIC PLEXUS & STARS BACKGROUND ---
    const bgCanvas = document.getElementById('background-canvas');
    if (bgCanvas) {
        const ctx = bgCanvas.getContext('2d');
        let particles = [],
            stars = [];
        const numStars = 50;

        const resizeBgCanvas = () => {
            bgCanvas.width = window.innerWidth;
            bgCanvas.height = window.innerHeight;
        };

        const initBg = () => {
            resizeBgCanvas();
            particles = [];
            stars = [];
            let numberOfParticles = (bgCanvas.width * bgCanvas.height) / 12000;
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push({
                    x: Math.random() * innerWidth,
                    y: Math.random() * innerHeight,
                    directionX: (Math.random() * .4) - .2,
                    directionY: (Math.random() * .4) - .2,
                    size: Math.random() * 2 + 1
                });
            }
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * innerWidth,
                    y: Math.random() * innerHeight,
                    radius: Math.random() * 0.8,
                    alpha: Math.random() * 0.3 + 0.1
                });
            }
        };

        const animateBg = () => {
            requestAnimationFrame(animateBg);
            ctx.clearRect(0, 0, innerWidth, innerHeight);
            stars.forEach(star => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(230, 241, 255, ${star.alpha})`;
                ctx.fill();
            });
            particles.forEach(p => {
                p.x += p.directionX;
                p.y += p.directionY;
                if (p.x > innerWidth || p.x < 0) p.directionX *= -1;
                if (p.y > innerHeight || p.y < 0) p.directionY *= -1;
            });
            connect();
        };

        const connect = () => {
            let opacityValue = 1;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let distance = ((particles[a].x - particles[b].x) ** 2) + ((particles[a].y - particles[b].y) ** 2);
                    if (distance < (innerWidth / 8) * (innerHeight / 8)) {
                        opacityValue = 1 - (distance / 20000);
                        ctx.strokeStyle = `rgba(35, 42, 85, ${opacityValue})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        };
        window.addEventListener('resize', initBg);
        initBg();
        animateBg();
    }

    // --- GENERAL UI ---
    gsap.from(".animate-on-load", { duration: 0.8, y: 30, opacity: 0, stagger: 0.2, ease: "power3.out", delay: 0.2 });
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 50));
    const timelineItems = document.querySelectorAll('.timeline-item');
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting)); }, { threshold: 0.2 });
    timelineItems.forEach(item => observer.observe(item));
    const projectCards = document.querySelectorAll('.project-card');
    const modalContainer = document.getElementById('modal-container');
    projectCards.forEach(card => card.addEventListener('click', () => { const targetModalId = card.getAttribute('data-modal-target'); const targetModal = document.getElementById(targetModalId); if (targetModal) { modalContainer.classList.remove('hidden'); targetModal.classList.add('active'); animateNumbers(targetModal); } }));
    function animateNumbers(modal) { modal.querySelectorAll('strong[data-number]').forEach(el => { const endValue = parseInt(el.dataset.number, 10); let startValue = { val: 0 }; gsap.to(startValue, { val: endValue, duration: 1.5, ease: 'power2.out', onUpdate: () => { el.textContent = Math.ceil(startValue.val); } }); }); }
    function closeAllModals() { modalContainer.classList.add('hidden'); document.querySelectorAll('.modal-content.active').forEach(modal => modal.classList.remove('active')); }
    document.querySelectorAll('.modal-close-btn').forEach(btn => btn.addEventListener('click', closeAllModals));
    document.querySelector('.modal-backdrop').addEventListener('click', closeAllModals);


    // --- EXPERTISE: PARTICLE-TO-TEXT REVEAL ---
    const skillRevealContainer = document.getElementById('skill-reveal-container');

    if (skillRevealContainer && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        skillRevealContainer.appendChild(canvas);

        let particlePool = [];
        let textPointsCache = {};
        let animationFrameId;

        const skillElements = document.querySelectorAll('[data-skill-text]');
        const skills = Array.from(skillElements).map(el => el.textContent);

        const PARTICLE_CONFIG = { friction: 0.96, ease: 0.1 };
        const setupParticleCount = () => {
            if (window.innerWidth < 768) return 200;
            if (window.innerWidth < 1024) return 350;
            return 500;
        };

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.originX = x;
                this.originY = y;
                this.vx = 0;
                this.vy = 0;
                this.radius = Math.random() * 1.5 + 0.5;
                this.target = null;
                this.color = `rgba(0, 245, 195, ${Math.random() * 0.5 + 0.5})`;
            }

            update() {
                if (this.target) {
                    this.vx += (this.target.x - this.x) * PARTICLE_CONFIG.ease;
                    this.vy += (this.target.y - this.y) * PARTICLE_CONFIG.ease;
                } else {
                    this.vx += (this.originX - this.x) * 0.01;
                    this.vy += (this.originY - this.y) * 0.01;
                }
                this.vx *= PARTICLE_CONFIG.friction;
                this.vy *= PARTICLE_CONFIG.friction;
                this.x += this.vx;
                this.y += this.vy;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        const getTextPoints = (text, fontSize) => {
            const cacheKey = `${text}-${fontSize}`;
            if (textPointsCache[cacheKey]) return textPointsCache[cacheKey];

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            const font = `bold ${fontSize}px "Space Grotesk"`;
            tempCtx.font = font;
            
            const textMetrics = tempCtx.measureText(text);
            const textWidth = textMetrics.width;
            const textHeight = fontSize * 1.2;

            tempCanvas.width = textWidth;
            tempCanvas.height = textHeight;
            
            tempCtx.font = font;
            tempCtx.fillStyle = '#fff';
            tempCtx.textAlign = 'left';
            tempCtx.textBaseline = 'top';
            tempCtx.fillText(text, 0, 0);

            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const points = [];
            const density = window.innerWidth < 768 ? 5 : 4;

            for (let y = 0; y < imageData.height; y += density) {
                for (let x = 0; x < imageData.width; x += density) {
                    if (imageData.data[(y * imageData.width + x) * 4 + 3] > 128) {
                        points.push({ x, y });
                    }
                }
            }
            textPointsCache[cacheKey] = { points, width: textWidth, height: textHeight };
            return textPointsCache[cacheKey];
        };

        const init = () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            
            canvas.width = skillRevealContainer.offsetWidth;
            canvas.height = skillRevealContainer.offsetHeight;

            particlePool = [];
            const numParticles = setupParticleCount();
            for (let i = 0; i < numParticles; i++) {
                particlePool.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
            }
            
            animate();
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particlePool.forEach(p => { p.update(); p.draw(); });
            animationFrameId = requestAnimationFrame(animate);
        };
        
        const createSkillAnimation = (skill, index, totalSkills) => {
            const fontSize = Math.min(canvas.width / 12, 60);
            const pointsData = getTextPoints(skill, fontSize);
            if (!pointsData || pointsData.points.length === 0) return;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: skillRevealContainer,
                    start: `top-=${index * 150} center`,
                    toggleActions: "play none none none",
                    once: true,
                }
            });
            
            const offsetX = (canvas.width - pointsData.width) / 2;
            const offsetY = (canvas.height - pointsData.height) / 2;

            tl.add(() => {
                particlePool.forEach((p, i) => {
                    const targetPoint = pointsData.points[i % pointsData.points.length];
                    if(targetPoint){
                        p.target = {
                            x: targetPoint.x + offsetX,
                            y: targetPoint.y + offsetY
                        };
                    }
                });
            })
            .to({}, { duration: 1.2, ease: "power3.inOut" })
            .add(() => {
                particlePool.forEach(p => {
                    // Make particles return to random positions instead of falling
                    p.target = {
                         x: Math.random() * canvas.width,
                         y: Math.random() * canvas.height
                    };
                });
            }, "+=0.8") // Hold the text form a bit longer
            .to({}, { duration: 1.5, ease: "power2.inOut" });
        };
        
        const masterTimeline = ScrollTrigger.create({
            trigger: skillRevealContainer,
            start: "top 80%",
            end: "bottom 20%",
            onEnter: () => {
                init();
                skills.forEach((skill, index) => createSkillAnimation(skill, index, skills.length));
            },
            onLeave: () => {
                cancelAnimationFrame(animationFrameId);
            },
            onEnterBack: () => {
                init();
                skills.forEach((skill, index) => createSkillAnimation(skill, index, skills.length));
            },
            onLeaveBack: () => {
                cancelAnimationFrame(animationFrameId);
            }
        });

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                masterTimeline.kill();
                textPointsCache = {}; 
                init();
                skills.forEach((skill, index) => createSkillAnimation(skill, index, skills.length));
            }, 250);
        });
    }

    // --- VISION SCROLL-DRIVEN SECTION ---
    const visionSection = document.querySelector('.vision-scroll-section');
    if (visionSection && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        const slides = gsap.utils.toArray(".vision-slide");
        const images = gsap.utils.toArray(".vision-bg-image");
        gsap.set(images, { autoAlpha: 0 });
        gsap.set(images[0], { autoAlpha: 0.2 });
        gsap.set(slides, { autoAlpha: 0, y: 30 });
        gsap.set(slides[0], { autoAlpha: 1, y: 0 });

        slides.forEach((slide, i) => {
            ScrollTrigger.create({
                trigger: visionSection,
                start: () => `top+=${i * window.innerHeight} top`,
                end: () => `top+=${(i + 1) * window.innerHeight} top`,
                onEnter: () => setActiveSlide(i),
                onEnterBack: () => setActiveSlide(i),
            });
        });
        
        const setActiveSlide = (index) => {
            gsap.to(slides, { autoAlpha: 0, y: 30, duration: 0.5, stagger: 0.1 });
            gsap.to(slides[index], { autoAlpha: 1, y: 0, duration: 0.8, delay: 0.2 });
            gsap.to(images, { autoAlpha: 0, scale: 1.1, duration: 1 });
            gsap.to(images[index], { autoAlpha: 0.2, scale: 1, duration: 1 });
        };
    }
});
