document.addEventListener('DOMContentLoaded', () => {

    // --- DATA FOR COMPETENCIES ---
    const competencies = {
        ai: {
            title: "AI & ML Innovation",
            skills: ["ML Engineering", "Deep Learning (CNN)", "TensorFlow & Python", "Data-Driven Decisions"]
        },
        healthtech: {
            title: "HealthTech Strategy",
            skills: ["Clinical Workflows", "Medical Imaging (PET-CT)", "DICOM Standards", "Product Innovation"]
        },
        cloud: {
            title: "Cloud & Scalability",
            skills: ["Serverless Architecture", "AWS (Lambda, SQS, S3)", "Process Optimization", "Infrastructure as Code"]
        },
        leadership: {
            title: "Product Leadership",
            skills: ["Agile & Scrum Mastery", "Product Thinking", "Team Mentorship", "Stakeholder Management"]
        }
    };

    // --- CUSTOM CURSOR ---
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    gsap.set(cursorFollower, { xPercent: -50, yPercent: -50 });
    
    window.addEventListener('mousemove', e => {
        gsap.to(cursor, 0.2, { x: e.clientX, y: e.clientY });
        gsap.to(cursorFollower, 0.6, { x: e.clientX, y: e.clientY });
    });

    // --- MAGNETIC ELEMENTS ---
    document.querySelectorAll('.magnetic').forEach(el => {
        el.addEventListener('mousemove', e => {
            const { left, top, width, height } = el.getBoundingClientRect();
            const x = e.clientX - (left + width / 2);
            const y = e.clientY - (top + height / 2);
            gsap.to(el, { x: x * 0.4, y: y * 0.4, duration: 0.8, ease: "elastic.out(1, 0.3)" });
            gsap.to([cursor, cursorFollower], { scale: 1.5, duration: 0.3 });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "power2.out" });
            gsap.to([cursor, cursorFollower], { scale: 1, duration: 0.3 });
        });
    });

    // --- NAVBAR SCROLL ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 50));

    // --- GSAP ANIMATIONS ---
    gsap.registerPlugin(ScrollTrigger);

    // Headline animation
    gsap.to(".main-headline span", {
        y: 0,
        opacity: 1,
        stagger: 0.2,
        duration: 1,
        ease: "power3.out",
        delay: 0.5
    });
    
    // General section fade-in
    gsap.utils.toArray('section').forEach(section => {
        gsap.from(section, {
            opacity: 0,
            y: 50,
            duration: 1,
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                toggleActions: "play none none none"
            }
        });
    });

    // --- INTERACTIVE COMPETENCIES MAP ---
    const competencyNodes = document.querySelectorAll('.competency-node');
    const competencyTitle = document.getElementById('competency-title');
    const competencySkills = document.getElementById('competency-skills');

    competencyNodes.forEach(node => {
        node.addEventListener('mouseenter', () => {
            const competencyKey = node.dataset.competency;
            const data = competencies[competencyKey];

            competencyTitle.textContent = data.title;
            
            // Clear old skills and animate new ones in
            gsap.to("#competency-skills li", {
                opacity: 0,
                y: -10,
                stagger: 0.05,
                duration: 0.2,
                onComplete: () => {
                    competencySkills.innerHTML = data.skills.map(skill => `<li>${skill}</li>`).join('');
                    gsap.fromTo("#competency-skills li", 
                        { opacity: 0, y: 10 },
                        { opacity: 1, y: 0, stagger: 0.1, duration: 0.3, delay: 0.1 }
                    );
                }
            });
        });
    });

    // --- MODAL LOGIC ---
    const projectCards = document.querySelectorAll('.project-card');
    const modalContainer = document.getElementById('modal-container');
    
    projectCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
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
            gsap.to(startValue, {
                val: endValue,
                duration: 1.5,
                ease: 'power2.out',
                onUpdate: () => { el.textContent = Math.ceil(startValue.val); }
            });
        });
    }

    function closeAllModals() {
        modalContainer.classList.add('hidden');
        document.querySelectorAll('.modal-content.active').forEach(modal => modal.classList.remove('active'));
    }
    document.querySelectorAll('.modal-close-btn').forEach(btn => btn.addEventListener('click', closeAllModals));
    document.querySelector('.modal-backdrop').addEventListener('click', closeAllModals);

});
