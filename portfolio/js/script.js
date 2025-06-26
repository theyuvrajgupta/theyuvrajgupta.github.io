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

    // --- NEW: DYNAMIC PLEXUS BACKGROUND ---
    const bgCanvas = document.getElementById('background-canvas');
    if (bgCanvas) {
        const ctx = bgCanvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 150 };

        function resizeBgCanvas() {
            bgCanvas.width = window.innerWidth;
            bgCanvas.height = window.innerHeight;
        }

        function initBg() {
            resizeBgCanvas();
            particles = [];
            let numberOfParticles = (bgCanvas.width * bgCanvas.height) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                let size = Math.random() * 2 + 1;
                let x = Math.random() * (innerWidth - size * 2) + size;
                let y = Math.random() * (innerHeight - size * 2) + size;
                let directionX = (Math.random() * .4) - .2;
                let directionY = (Math.random() * .4) - .2;
                particles.push({ x, y, directionX, directionY, size });
            }
            animateBg();
        }

        function animateBg() {
            requestAnimationFrame(animateBg);
            ctx.clearRect(0, 0, innerWidth, innerHeight);

            particles.forEach(p => {
                p.x += p.directionX;
                p.y += p.directionY;
                if (p.x > innerWidth || p.x < 0) p.directionX = -p.directionX;
                if (p.y > innerHeight || p.y < 0) p.directionY = -p.directionY;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
                ctx.fillStyle = 'rgba(35, 42, 85, 0.8)';
                ctx.fill();
            });

            connect();
        }

        function connect() {
            let opacityValue = 1;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x)) +
                        ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
                    if (distance < (innerWidth / 7) * (innerHeight / 7)) {
                        opacityValue = 1 - (distance / 20000);
                        ctx.strokeStyle = `rgba(168, 178, 209, ${opacityValue})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }
        
        window.addEventListener('resize', resizeBgCanvas);
        initBg();
    }
    
    // --- GENERAL UI ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    const timelineItems = document.querySelectorAll('.timeline-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
    }, { threshold: 0.2 });
    timelineItems.forEach(item => observer.observe(item));

    const projectCards = document.querySelectorAll('.project-card');
    const modalContainer = document.getElementById('modal-container');
    
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetModalId = card.getAttribute('data-modal-target');
            const targetModal = document.getElementById(targetModalId);
            if (targetModal) {
                modalContainer.classList.remove('hidden');
                targetModal.classList.add('active');
            }
        });
    });

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
        let group, isMouseDown = false, lastMouseX = 0, lastMouseY = 0, targetRotationX = 0, targetRotationY = 0;
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

            expertiseContainer.addEventListener('mousedown', e => { isMouseDown = true; lastMouseX = e.clientX; lastMouseY = e.clientY; });
            expertiseContainer.addEventListener('mousemove', e => {
                if (isMouseDown) {
                    targetRotationY += (e.clientX - lastMouseX) * 0.005;
                    let newTargetX = targetRotationX + (e.clientY - lastMouseY) * 0.005;
                    targetRotationX = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, newTargetX)); // Clamp vertical rotation
                    lastMouseX = e.clientX; lastMouseY = e.clientY;
                }
            });
            expertiseContainer.addEventListener('mouseup', () => { isMouseDown = false; });
            expertiseContainer.addEventListener('mouseleave', () => { isMouseDown = false; });
            expertiseContainer.addEventListener('click', onNodeClick);
            resetButton.addEventListener('click', resetCamera);
            window.addEventListener('resize', onWindowResize);
        }

        function createGraph() {
            const mainNodesData = skillsData.nodes.filter(n => n.type === 'main');
            mainNodesData.forEach((data, i) => {
                const angle = (i / mainNodesData.length) * Math.PI * 2;
                const pos = new THREE.Vector3(Math.cos(angle) * 40, Math.sin(angle) * 40, 0);
                nodes.push(createNode(data, pos, 4, 0x00f5c3, 0.5));
            });

            skillsData.nodes.filter(n => n.type === 'skill').forEach(data => {
                const parentNode = nodes.find(n => n.userData.id === data.parent);
                const angle = Math.random() * Math.PI * 2;
                const dist = 20 + Math.random() * 5;
                const pos = parentNode.position.clone().add(new THREE.Vector3(Math.cos(angle) * dist, Math.sin(angle) * dist, (Math.random() - 0.5) * 15));
                const node = createNode(data, pos, 2, 0xe6f1ff, 0.1);
                nodes.push(node);
                lines.push(createLine(parentNode.position, node.position));
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
            return node;
        }

        function createLine(start, end) {
            const material = new THREE.LineBasicMaterial({ color: 0x232a55, transparent: true, opacity: 0.3 });
            const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
            const line = new THREE.Line(geometry, material);
            group.add(line);
            line.userData.start = start;
            line.userData.end = end;
            return line;
        }
        
        function createLabelSprite(text, parentNode) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const font = "Bold 36px Lexend";
            context.font = font;
            const width = context.measureText(text).width;
            canvas.width = width + 20;
            canvas.height = 50;
            context.font = font;
            context.fillStyle = "rgba(230, 241, 255, 1)";
            context.fillText(text, 10, 38);

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(canvas.width / 10, canvas.height / 10, 1.0);
            sprite.position.copy(parentNode.position.clone().add(new THREE.Vector3(0, 4, 0)));
            sprite.visible = false;
            sprite.userData.skillId = parentNode.userData.id;
            group.add(sprite);
            return sprite;
        }
        
        function addLights() {
            scene.add(new THREE.AmbientLight(0xffffff, 0.3));
            const pointLight = new THREE.PointLight(0xffffff, 0.7);
            camera.add(pointLight);
            scene.add(camera);
        }

        function onNodeClick(event) {
            if (event.clientX !== lastMouseX || event.clientY !== lastMouseY) return;
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(nodes);

            if (intersects.length > 0 && intersects[0].object.userData.type === 'main') {
                focusOnNode(intersects[0].object);
            }
        }

        function focusOnNode(node) {
            isFocused = true;
            targetNode = node;
            const targetPos = node.position.clone().add(new THREE.Vector3(0, 0, 65)); // Increased zoom-out distance
            gsap.to(camera.position, { x: targetPos.x, y: targetPos.y, z: targetPos.z, duration: 1.5, ease: 'power3.inOut' });
            resetButton.classList.remove('hidden');
        }

        function resetCamera() {
            isFocused = false;
            targetNode = null;
            gsap.to(camera.position, { x: initialCameraPos.x, y: initialCameraPos.y, z: initialCameraPos.z, duration: 1.5, ease: 'power3.inOut' });
            resetButton.classList.add('hidden');
        }

        function onWindowResize() {
            camera.aspect = expertiseContainer.clientWidth / expertiseContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(expertiseContainer.clientWidth, expertiseContainer.clientHeight);
        }

        function animateExpertise() {
            requestAnimationFrame(animateExpertise);
            if (!isMouseDown) targetRotationY += 0.001; // Increased rotation speed
            
            group.rotation.y += (targetRotationY - group.rotation.y) * 0.05;
            group.rotation.x += (targetRotationX - group.rotation.x) * 0.05;

            labels.forEach(label => {
                const skillNode = nodes.find(n => n.userData.id === label.userData.skillId);
                if(skillNode) label.visible = isFocused && skillNode.userData.parent === targetNode.userData.id;
            });

            if (isFocused) camera.lookAt(targetNode.position);
            else camera.lookAt(scene.position);
            
            renderer.render(scene, camera);
        }
        
        initExpertise();
        animateExpertise();
    }
    
    // --- VISION: 2D CONSTELLATION (ENHANCED) ---
    const visionCanvas = document.getElementById('vision-constellation');
    if(visionCanvas) {
        const ctx = visionCanvas.getContext('2d');
        let particles = [];
        const visionPillars = [
            { text: "AI-Powered Venture", x: 0.3, y: 0.25, connections: [1,2] },
            { text: "Democratized Detection", x: 0.7, y: 0.35, connections: [0,3] },
            { text: "Unified Platform", x: 0.2, y: 0.7, connections: [0,3] },
            { text: "Proactive Healthcare", x: 0.8, y: 0.8, connections: [1,2] }
        ];

        function resizeVisionCanvas() {
            visionCanvas.width = visionCanvas.parentElement.offsetWidth;
            visionCanvas.height = visionCanvas.parentElement.offsetHeight;
        }

        function initVision() {
            resizeVisionCanvas();
            particles = [];
            for (let i = 0; i < 80; i++) particles.push({ x: Math.random(), y: Math.random(), radius: Math.random() * 1.8 });
            visionPillars.forEach(p => particles.push({ isPillar: true, ...p, radius: 5, baseRadius: 5, pulseSpeed: Math.random()*0.05+0.01 }));
            animateVision();
        }

        function animateVision() {
            requestAnimationFrame(animateVision);
            ctx.clearRect(0, 0, visionCanvas.width, visionCanvas.height);
            const w = visionCanvas.width;
            const h = visionCanvas.height;

            const pillars = particles.filter(p => p.isPillar);
            pillars.forEach((p,i) => {
                p.connections.forEach(cIdx => {
                    ctx.beginPath();
                    ctx.moveTo(p.x*w, p.y*h);
                    ctx.lineTo(pillars[cIdx].x*w, pillars[cIdx].y*h);
                    ctx.strokeStyle = `rgba(35, 42, 85, 0.8)`;
                    ctx.stroke();
                });
            });

            particles.forEach(p => {
                ctx.beginPath();
                const xPos = p.x * w;
                const yPos = p.y * h;
                if (p.isPillar) {
                    p.radius = p.baseRadius + Math.sin(Date.now() * 0.002 + p.pulseSpeed * 10) * 2;
                    ctx.arc(xPos, yPos, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = '#00f5c3';
                    ctx.shadowColor = '#00f5c3';
                    ctx.shadowBlur = 15;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = '#e6f1ff';
                    ctx.font = `500 14px 'Lexend'`;
                    const textWidth = ctx.measureText(p.text).width;
                    const textX = p.x > 0.5 ? xPos - textWidth - 20 : xPos + 20;
                    ctx.fillText(p.text, textX, yPos + 5);
                } else {
                    ctx.arc(xPos, yPos, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(230, 241, 255, 0.4)';
                    ctx.fill();
                }
            });
        }
        
        window.addEventListener('resize', initVision);
        initVision();
    }
});
