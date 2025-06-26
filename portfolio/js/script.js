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

    // --- DYNAMIC BACKGROUND ---
    const bgCanvas = document.getElementById('background-canvas');
    if (bgCanvas) {
        const ctx = bgCanvas.getContext('2d');
        let stars = [];
        const numStars = 100;

        function resizeBgCanvas() {
            bgCanvas.width = window.innerWidth;
            bgCanvas.height = window.innerHeight;
        }

        function initBg() {
            resizeBgCanvas();
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * bgCanvas.width,
                    y: Math.random() * bgCanvas.height,
                    radius: Math.random() * 1.2,
                    alpha: Math.random() * 0.5 + 0.2,
                    vx: (Math.random() - 0.5) * 0.1,
                    vy: (Math.random() - 0.5) * 0.1
                });
            }
            animateBg();
        }

        function animateBg() {
            requestAnimationFrame(animateBg);
            ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
            
            // Subtle gradient
            const gradient = ctx.createRadialGradient(bgCanvas.width / 2, bgCanvas.height / 2, 0, bgCanvas.width / 2, bgCanvas.height / 2, bgCanvas.width/1.5);
            gradient.addColorStop(0, '#12183c');
            gradient.addColorStop(1, '#0a0f2c');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

            // Draw stars
            stars.forEach(star => {
                star.x += star.vx;
                star.y += star.vy;
                if (star.x < 0 || star.x > bgCanvas.width) star.vx *= -1;
                if (star.y < 0 || star.y > bgCanvas.height) star.vy *= -1;
                
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(230, 241, 255, ${star.alpha})`;
                ctx.fill();
            });
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

    // --- PROJECT MODALS LOGIC (FIXED) ---
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
        document.querySelectorAll('.modal-content.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
    document.querySelectorAll('.modal-close-btn').forEach(btn => btn.addEventListener('click', closeAllModals));
    document.querySelector('.modal-backdrop').addEventListener('click', closeAllModals);


    // --- EXPERTISE: THREE.JS NEURAL SYNAPSE (OVERHAULED) ---
    const expertiseContainer = document.getElementById('expertise-visual');
    if (expertiseContainer) {
        let scene, camera, renderer, nodes = [], lines = [], labels = [];
        let group, isMouseDown = false, mouseX = 0, mouseY = 0, targetRotationX = 0, targetRotationY = 0;
        let isFocused = false, targetNode = null;
        const initialCameraPos = new THREE.Vector3(0, 0, 120);
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

            expertiseContainer.addEventListener('mousedown', onMouseDown);
            expertiseContainer.addEventListener('mousemove', onMouseMove);
            expertiseContainer.addEventListener('mouseup', onMouseUp);
            expertiseContainer.addEventListener('mouseleave', onMouseUp);
            expertiseContainer.addEventListener('click', onNodeClick);
            resetButton.addEventListener('click', resetCamera);
            window.addEventListener('resize', onWindowResize);
        }

        function createGraph() {
            const mainNodesData = skillsData.nodes.filter(n => n.type === 'main');
            const skillNodesData = skillsData.nodes.filter(n => n.type === 'skill');

            const layoutRadius = 40;
            mainNodesData.forEach((data, i) => {
                const angle = (i / mainNodesData.length) * Math.PI * 2;
                const node = createNode(data, new THREE.Vector3(Math.cos(angle) * layoutRadius, Math.sin(angle) * layoutRadius, 0), 4, 0x00f5c3, 0.5);
                nodes.push(node);
            });

            skillNodesData.forEach(data => {
                const parentNode = nodes.find(n => n.userData.id === data.parent);
                const angle = Math.random() * Math.PI * 2;
                const dist = 20 + Math.random() * 5;
                const pos = parentNode.position.clone().add(new THREE.Vector3(Math.cos(angle) * dist, Math.sin(angle) * dist, (Math.random() - 0.5) * 15));
                const node = createNode(data, pos, 2, 0xe6f1ff, 0.1);
                nodes.push(node);
                lines.push(createLine(parentNode.position, node.position));
                labels.push(createLabelSprite(data.name, pos));
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
            return line;
        }
        
        function createLabelSprite(text, position) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            context.font = "Bold 32px Lexend";
            const width = context.measureText(text).width;
            canvas.width = width + 20; // padding
            canvas.height = 48; // padding
            context.font = "Bold 32px Lexend";
            context.fillStyle = "rgba(230, 241, 255, 1)";
            context.fillText(text, 10, 34);

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(canvas.width / 10, canvas.height / 10, 1.0);
            sprite.position.copy(position.clone().add(new THREE.Vector3(0, 3, 0))); // Offset label
            sprite.visible = false;
            group.add(sprite);
            return sprite;
        }
        
        function addLights() {
            scene.add(new THREE.AmbientLight(0xffffff, 0.2));
            const pointLight = new THREE.PointLight(0xffffff, 0.8);
            camera.add(pointLight); // Attach light to camera
            scene.add(camera);
        }

        function onMouseDown(event) { isMouseDown = true; mouseX = event.clientX; mouseY = event.clientY; }
        function onMouseMove(event) {
            if (isMouseDown) {
                const deltaX = event.clientX - mouseX;
                const deltaY = event.clientY - mouseY;
                targetRotationY += deltaX * 0.005;
                targetRotationX += deltaY * 0.005;
                mouseX = event.clientX;
                mouseY = event.clientY;
            }
        }
        function onMouseUp() { isMouseDown = false; }
        
        function onNodeClick(event) {
            if (Math.abs(event.clientX - mouseX) > 2 || Math.abs(event.clientY - mouseY) > 2) return; // Prevent click on drag
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
            const targetPos = node.position.clone().add(new THREE.Vector3(0, 0, 50));
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
            
            if (!isMouseDown) {
                targetRotationY += 0.0005;
            }
            group.rotation.y += (targetRotationY - group.rotation.y) * 0.1;
            group.rotation.x += (targetRotationX - group.rotation.x) * 0.1;
            
            labels.forEach((label, i) => {
                const node = nodes.find(n => n.userData.name === label.material.map.image.getContext('2d').measureText(label.material.map.image.getContext('2d').font = "Bold 32px Lexend",label.material.map.image.getContext('2d').fillText(label.material.map.image.getContext('2d').font,0,0),label.material.map.image.getContext('2d').font= "Bold 32px Lexend",label.material.map.image.getContext('2d').fillText(label.material.map.image.getContext('2d').font,0,0)).input);
                if(node) label.visible = isFocused && node.userData.parent === targetNode.userData.id;
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
            for (let i = 0; i < 70; i++) particles.push({ x: Math.random(), y: Math.random(), radius: Math.random() * 1.5 });
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
                if (p.isPillar) {
                    p.radius = p.baseRadius + Math.sin(Date.now() * 0.001 + p.pulseSpeed) * 1.5;
                    ctx.arc(p.x * w, p.y * h, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = '#00f5c3';
                    ctx.shadowColor = '#00f5c3';
                    ctx.shadowBlur = 10;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = '#e6f1ff';
                    ctx.font = `500 14px 'Lexend'`;
                    const textX = p.x > 0.5 ? p.x * w - ctx.measureText(p.text).width - 15 : p.x * w + 15;
                    ctx.fillText(p.text, textX, p.y * h + 5);
                } else {
                    ctx.arc(p.x * w, p.y * h, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(230, 241, 255, 0.4)';
                    ctx.fill();
                }
            });
        }
        
        window.addEventListener('resize', resizeVisionCanvas);
        initVision();
    }
});
