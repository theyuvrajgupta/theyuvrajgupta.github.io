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

    // --- NEW: DYNAMIC PLEXUS & STARS BACKGROUND ---
    const bgCanvas = document.getElementById('background-canvas');
    if (bgCanvas) {
        const ctx = bgCanvas.getContext('2d');
        let particles = [], stars = [];
        const numStars = 60;
        
        function resizeBgCanvas() {
            bgCanvas.width = window.innerWidth;
            bgCanvas.height = window.innerHeight;
        }

        function initBg() {
            resizeBgCanvas();
            particles = [];
            stars = [];
            let numberOfParticles = (bgCanvas.width * bgCanvas.height) / 12000;
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push({
                    x: Math.random() * innerWidth, y: Math.random() * innerHeight,
                    directionX: (Math.random() * .4) - .2, directionY: (Math.random() * .4) - .2,
                    size: Math.random() * 2 + 1
                });
            }
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * innerWidth, y: Math.random() * innerHeight,
                    radius: Math.random() * 0.8, alpha: Math.random() * 0.3 + 0.1
                });
            }
            animateBg();
        }

        function animateBg() {
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
        }

        function connect() {
            let opacityValue = 1;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let distance = ((particles[a].x - particles[b].x) ** 2) + ((particles[a].y - particles[b].y) ** 2);
                    if (distance < (innerWidth / 8) * (innerHeight / 8)) {
                        opacityValue = 1 - (distance / 20000);
                        ctx.strokeStyle = `rgba(35, 42, 85, ${opacityValue})`; // Subtle plexus color
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }
        
        window.addEventListener('resize', initBg);
        initBg();
    }
    
    // --- GENERAL UI ---
    // On-load animations for Home section
    document.querySelectorAll('.animate-on-load').forEach((el, index) => {
        gsap.to(el, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
            delay: 0.2 + (index * 0.15)
        });
    });

    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 50));

    const timelineItems = document.querySelectorAll('.timeline-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
    }, { threshold: 0.2 });
    timelineItems.forEach(item => observer.observe(item));

    // Project Modals Logic
    const projectCards = document.querySelectorAll('.project-card');
    const modalContainer = document.getElementById('modal-container');
    
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
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
                onUpdate: () => {
                    el.textContent = Math.ceil(startValue.val);
                }
            });
        });
    }

    function closeAllModals() {
        modalContainer.classList.add('hidden');
        document.querySelectorAll('.modal-content.active').forEach(modal => modal.classList.remove('active'));
    }
    document.querySelectorAll('.modal-close-btn').forEach(btn => btn.addEventListener('click', closeAllModals));
    document.querySelector('.modal-backdrop').addEventListener('click', closeAllModals);


    // --- EXPERTISE: THREE.JS NEURAL SYNAPSE (OVERHAULED V3.2) ---
    const expertiseContainer = document.getElementById('expertise-visual');
    if (expertiseContainer) {
        let scene, camera, renderer, nodes = [], lines = [], labels = [];
        let group, isMouseDown = false, lastMousePos = { x: 0, y: 0 }, targetRotation = { x: 0.3, y: 0 };
        let isFocused = false, targetNode = null;
        const initialCameraPos = new THREE.Vector3(0, 0, 110);
        const resetButton = document.getElementById('reset-camera-btn');

        function initExpertise() {
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
            
            expertiseContainer.addEventListener('mousedown', e => { isMouseDown = true; lastMousePos = { x: e.clientX, y: e.clientY }; });
            expertiseContainer.addEventListener('mousemove', e => {
                if (isMouseDown) {
                    const deltaX = e.clientX - lastMousePos.x;
                    const deltaY = e.clientY - lastMousePos.y;
                    targetRotation.y += deltaX * 0.005;
                    targetRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotation.x + deltaY * 0.005));
                    lastMousePos = { x: e.clientX, y: e.clientY };
                }
            });
            expertiseContainer.addEventListener('mouseup', () => { isMouseDown = false; });
            expertiseContainer.addEventListener('mouseleave', () => { isMouseDown = false; });
            expertiseContainer.addEventListener('click', onNodeClick);
            resetButton.addEventListener('click', resetCamera);
            window.addEventListener('resize', onWindowResize);
        }

        function createGraph() {
            skillsData.nodes.filter(n => n.type === 'main').forEach((data, i) => {
                const angle = (i / 4) * Math.PI * 2;
                nodes.push(createNode(data, new THREE.Vector3(Math.cos(angle) * 40, Math.sin(angle) * 40, 0), 4, 0x00f5c3, 0.5));
            });
            skillsData.nodes.filter(n => n.type === 'skill').forEach(data => {
                const parent = nodes.find(n => n.userData.id === data.parent);
                const pos = parent.position.clone().add(new THREE.Vector3().randomDirection().multiplyScalar(22));
                const node = createNode(data, pos, 2, 0xe6f1ff, 0.1);
                nodes.push(node);
                lines.push(createLine(parent.position, node.position));
                labels.push(createLabelSprite(data.name, node));
            });
        }
        
        function createNode(data, position, size, color, emissiveIntensity) {
            const geometry = new THREE.SphereGeometry(size, 32, 16);
            const material = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity, shininess: 80 });
            const node = new THREE.Mesh(geometry, material);
            node.position.copy(position);
            node.userData = data;
            group.add(node);

            // Add a point light to main nodes for a nice glow effect
            if (data.type === 'main') {
                const light = new THREE.PointLight(color, 0.8, 30);
                node.add(light);
            }
            return node;
        }

        function createLine(start, end) { /* As before */ return null; }
        
        function createLabelSprite(text, parentNode) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const font = "Bold 36px Lexend";
            context.font = font;
            const width = context.measureText(text).width;
            canvas.width = width + 20; canvas.height = 50;
            context.font = font;
            context.fillStyle = "#c869ff"; // New label color
            context.fillText(text, 10, 38);
            const texture = new THREE.CanvasTexture(canvas);
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true, opacity: 0 }));
            sprite.scale.set(canvas.width / 12, canvas.height / 12, 1.0);
            sprite.position.copy(parentNode.position.clone().add(new THREE.Vector3(0, 5, 0))); // Adjusted offset
            sprite.userData = { skillId: parentNode.userData.id, parentId: parentNode.userData.parent };
            group.add(sprite);
            return sprite;
        }
        
        function addLights() { scene.add(new THREE.AmbientLight(0xffffff, 0.4)); camera.add(new THREE.PointLight(0xffffff, 0.6)); scene.add(camera); }

        function onNodeClick(event) {
            const dx = Math.abs(event.clientX - lastMousePos.x);
            const dy = Math.abs(event.clientY - lastMousePos.y);
            if(isMouseDown && (dx > 2 || dy > 2)) return; // Prevents click on drag end
            
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2((event.clientX / innerWidth) * 2 - 1, -(event.clientY / innerHeight) * 2 + 1);
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(nodes);
            if (intersects.length > 0 && intersects[0].object.userData.type === 'main') focusOnNode(intersects[0].object);
        }

        function focusOnNode(node) {
            isFocused = true;
            targetNode = node;
            gsap.to(camera.position, { ...node.position.clone().add(new THREE.Vector3(0, 0, 70)), duration: 1.5, ease: 'power3.inOut' });
            resetButton.classList.remove('hidden');
        }

        function resetCamera() {
            isFocused = false;
            targetNode = null;
            gsap.to(camera.position, { ...initialCameraPos, duration: 1.5, ease: 'power3.inOut' });
            resetButton.classList.add('hidden');
        }
        
        function onWindowResize() { /* As before */ }

        function animateExpertise() {
            requestAnimationFrame(animateExpertise);
            const time = Date.now() * 0.00005;
            if (!isMouseDown && !isFocused) targetRotation.y = time;
            
            group.rotation.y += (targetRotation.y - group.rotation.y) * 0.05;
            group.rotation.x += (targetRotation.x - group.rotation.x) * 0.05;

            labels.forEach(label => {
                const shouldBeVisible = isFocused && label.userData.parentId === targetNode.userData.id;
                gsap.to(label.material, { opacity: shouldBeVisible ? 1 : 0, duration: 0.5 });
            });

            if (isFocused) camera.lookAt(targetNode.position);
            else camera.lookAt(scene.position);
            
            renderer.render(scene, camera);
        }
        
        initExpertise();
        animateExpertise();
    }
    
    // --- VISION: 2D CONSTELLATION ---
    const visionCanvas = document.getElementById('vision-constellation');
    if(visionCanvas) {
        const ctx = visionCanvas.getContext('2d'); let particles = [];
        const visionPillars = [
            { text: "AI-Powered Venture", x: 0.3, y: 0.25, connections: [1,2] },
            { text: "Democratized Detection", x: 0.7, y: 0.35, connections: [0,3] },
            { text: "Unified Platform", x: 0.2, y: 0.7, connections: [0,3] },
            { text: "Proactive Healthcare", x: 0.8, y: 0.8, connections: [1,2] }
        ];

        function resizeVisionCanvas() { visionCanvas.width = visionCanvas.parentElement.offsetWidth; visionCanvas.height = visionCanvas.parentElement.offsetHeight; }
        function initVision() {
            resizeVisionCanvas(); particles = [];
            for (let i = 0; i < 80; i++) particles.push({ x: Math.random(), y: Math.random(), radius: Math.random() * 1.8 });
            visionPillars.forEach(p => particles.push({ isPillar: true, ...p, radius: 5, baseRadius: 5, pulseSpeed: Math.random()*0.05+0.01 }));
            animateVision();
        }
        function animateVision() {
            requestAnimationFrame(animateVision); ctx.clearRect(0, 0, visionCanvas.width, visionCanvas.height);
            const w = visionCanvas.width; const h = visionCanvas.height;
            const pillars = particles.filter(p => p.isPillar);
            pillars.forEach((p,i) => p.connections.forEach(cIdx => { ctx.beginPath(); ctx.moveTo(p.x*w, p.y*h); ctx.lineTo(pillars[cIdx].x*w, pillars[cIdx].y*h); ctx.strokeStyle = `rgba(35, 42, 85, 0.8)`; ctx.stroke(); }));
            particles.forEach(p => {
                ctx.beginPath(); const xPos = p.x * w; const yPos = p.y * h;
                if (p.isPillar) {
                    p.radius = p.baseRadius + Math.sin(Date.now() * 0.002 + p.pulseSpeed * 10) * 2;
                    ctx.arc(xPos, yPos, p.radius, 0, Math.PI * 2); ctx.fillStyle = '#00f5c3'; ctx.shadowColor = '#00f5c3'; ctx.shadowBlur = 15; ctx.fill(); ctx.shadowBlur = 0;
                    ctx.fillStyle = '#e6f1ff'; ctx.font = `500 14px 'Lexend'`; const textWidth = ctx.measureText(p.text).width;
                    const textX = p.x > 0.5 ? xPos - textWidth - 20 : xPos + 20; ctx.fillText(p.text, textX, yPos + 5);
                } else { ctx.arc(xPos, yPos, p.radius, 0, Math.PI * 2); ctx.fillStyle = 'rgba(230, 241, 255, 0.4)'; ctx.fill(); }
            });
        }
        window.addEventListener('resize', initVision);
        initVision();
    }
});
