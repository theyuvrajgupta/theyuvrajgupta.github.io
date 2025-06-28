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
            { id: "Agile & Scrum", type: "skill", parent: "Product Leadership", name: "Agile & Scrum Mastery" },
            { id: "Product Thinking", type: "skill", parent: "Product Leadership", name: "Product Thinking" },
            { id: "Mentorship", type: "skill", parent: "Product Leadership", name: "Team Mentorship" },
            { id: "Stakeholder Mngmt", type: "skill", parent: "Product Leadership", name: "Stakeholder Management" },
        ]
    };

    // --- DYNAMIC PLEXUS & STARS BACKGROUND ---
    const bgCanvas = document.getElementById('background-canvas');
    if (bgCanvas) {
        const ctx = bgCanvas.getContext('2d');
        let particles = [], stars = [];
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
                particles.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, directionX: (Math.random() * .4) - .2, directionY: (Math.random() * .4) - .2, size: Math.random() * 2 + 1 });
            }
            for (let i = 0; i < numStars; i++) {
                stars.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, radius: Math.random() * 0.8, alpha: Math.random() * 0.3 + 0.1 });
            }
        };

        const animateBg = () => {
            requestAnimationFrame(animateBg);
            ctx.clearRect(0, 0, innerWidth, innerHeight);
            stars.forEach(star => { ctx.beginPath(); ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2); ctx.fillStyle = `rgba(230, 241, 255, ${star.alpha})`; ctx.fill(); });
            particles.forEach(p => { p.x += p.directionX; p.y += p.directionY; if (p.x > innerWidth || p.x < 0) p.directionX *= -1; if (p.y > innerHeight || p.y < 0) p.directionY *= -1; });
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


    // --- EXPERTISE: THREE.JS NEURAL SYNAPSE (STABLE V3.6 - CLICK FIXED) ---
    const expertiseContainer = document.getElementById('expertise-visual');
    if (expertiseContainer && typeof THREE !== 'undefined') {
        let scene, camera, renderer, nodes = [], labels = [], group;
        let isMouseDown = false, lastMousePos = { x: 0, y: 0 }, targetRotation = { x: 0.3, y: 0 };
        let isFocused = false, targetNode = null;
        const initialCameraPos = new THREE.Vector3(0, 0, 110);
        const resetButton = document.getElementById('reset-camera-btn');

        const initExpertise = () => {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, expertiseContainer.clientWidth / expertiseContainer.clientHeight, 0.1, 1000);
            camera.position.copy(initialCameraPos);
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(expertiseContainer.clientWidth, expertiseContainer.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            expertiseContainer.appendChild(renderer.domElement);
            group = new THREE.Group();
            scene.add(group);
            createGraph();
            addLights();
            setupEventListeners();
            animateExpertise();
        };

        const createGraph = () => {
            skillsData.nodes.filter(n => n.type === 'main').forEach((data, i) => {
                const angle = (i / 4) * Math.PI * 2;
                const pos = new THREE.Vector3(Math.cos(angle) * 40, Math.sin(angle) * 40, 0);
                nodes.push(createNode(data, pos, 4, 0x00f5c3, 0.5));
            });
            skillsData.nodes.filter(n => n.type === 'skill').forEach(data => {
                const parent = nodes.find(n => n.userData.id === data.parent);
                const pos = parent.position.clone().add(new THREE.Vector3().randomDirection().multiplyScalar(22));
                const node = createNode(data, pos, 2, 0xe6f1ff, 0.1);
                nodes.push(node);
                createLine(parent.position, node.position);
                labels.push(createLabelSprite(data.name, node));
            });
        };
        
        const createNode = (data, position, size, color, emissiveIntensity) => {
            const material = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity, shininess: 80 });
            const node = new THREE.Mesh(new THREE.SphereGeometry(size, 32, 16), material);
            node.position.copy(position);
            node.userData = data;
            group.add(node);
            if (data.type === 'main') node.add(new THREE.PointLight(color, 0.8, 30));
            return node;
        };

        const createLine = (start, end) => group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([start, end]), new THREE.LineBasicMaterial({ color: 0x232a55, transparent: true, opacity: 0.3 })));
        
        const createLabelSprite = (text, parentNode) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const font = "Bold 36px Lexend"; context.font = font;
            const width = context.measureText(text).width;
            canvas.width = width + 20; canvas.height = 50;
            context.font = font; context.fillStyle = "#c869ff"; context.fillText(text, 10, 38);
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: false, transparent: true, opacity: 0 }));
            sprite.scale.set(canvas.width / 12, canvas.height / 12, 1.0);
            sprite.position.copy(parentNode.position.clone().add(new THREE.Vector3(0, 5, 0)));
            sprite.userData = { skillId: parentNode.userData.id, parentId: parentNode.userData.parent };
            group.add(sprite);
            return sprite;
        };
        
        const addLights = () => { scene.add(new THREE.AmbientLight(0xffffff, 0.4)); camera.add(new THREE.PointLight(0xffffff, 0.6)); scene.add(camera); };
        
        const setupEventListeners = () => {
            expertiseContainer.addEventListener('mousedown', e => { isMouseDown = true; lastMousePos = { x: e.clientX, y: e.clientY }; });
            expertiseContainer.addEventListener('mousemove', e => { if (isMouseDown) { const dX = e.clientX - lastMousePos.x, dY = e.clientY - lastMousePos.y; targetRotation.y += dX * 0.005; targetRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotation.x + dY * 0.005)); lastMousePos = { x: e.clientX, y: e.clientY }; }});
            const onMouseUp = () => { isMouseDown = false; };
            expertiseContainer.addEventListener('mouseup', onMouseUp);
            expertiseContainer.addEventListener('mouseleave', onMouseUp);
            expertiseContainer.addEventListener('click', onNodeClick);
            resetButton.addEventListener('click', resetCamera);
            window.addEventListener('resize', onWindowResize);
        }

        const onNodeClick = (event) => {
            const dx = Math.abs(event.clientX - lastMousePos.x);
            const dy = Math.abs(event.clientY - lastMousePos.y);
            if(isMouseDown && (dx > 3 || dy > 3)) return; 
            
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();
            
            // *** CRITICAL FIX: Calculate mouse coordinates relative to the canvas element ***
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(nodes);
            if (intersects.length > 0 && intersects[0].object.userData.type === 'main') {
                focusOnNode(intersects[0].object);
            }
        };

        const focusOnNode = (node) => { isFocused = true; targetNode = node; gsap.to(camera.position, { ...node.position.clone().add(new THREE.Vector3(0, 0, 80)), duration: 1.5, ease: 'power3.inOut' }); resetButton.classList.remove('hidden'); };
        const resetCamera = () => { isFocused = false; targetNode = null; gsap.to(camera.position, { ...initialCameraPos, duration: 1.5, ease: 'power3.inOut' }); resetButton.classList.add('hidden'); };
        const onWindowResize = () => { camera.aspect = expertiseContainer.clientWidth / expertiseContainer.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(expertiseContainer.clientWidth, expertiseContainer.clientHeight); };

        const animateExpertise = () => {
            requestAnimationFrame(animateExpertise);
            const time = Date.now() * 0.00005;
            if (!isMouseDown && !isFocused) targetRotation.y = time * 0.5;
            
            group.rotation.y += (targetRotation.y - group.rotation.y) * 0.05;
            group.rotation.x += (targetRotation.x - group.rotation.x) * 0.05;

            labels.forEach(label => {
                const shouldBeVisible = isFocused && label.userData.parentId === targetNode.userData.id;
                gsap.to(label.material, { opacity: shouldBeVisible ? 1 : 0, duration: 0.5 });
            });

            if (isFocused) camera.lookAt(targetNode.position); else camera.lookAt(scene.position);
            renderer.render(scene, camera);
        };
        
        initExpertise();
    }
    
    // --- VISION SCROLL-DRIVEN SECTION ---
    const visionSection = document.querySelector('.vision-scroll-section');
    if (visionSection && typeof gsap !== 'undefined') {
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
