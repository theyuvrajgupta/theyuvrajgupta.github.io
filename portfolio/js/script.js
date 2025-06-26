document.addEventListener('DOMContentLoaded', () => {

    // --- DATA ---
    const skillsData = {
        nodes: [
            // Main Nodes (Categories)
            { id: "HealthTech", type: "main", name: "HealthTech Strategy" },
            { id: "AI & ML", type: "main", name: "AI & ML Innovation" },
            { id: "Cloud Architecture", type: "main", name: "Cloud & Scalability" },
            { id: "Product Leadership", type: "main", name: "Product Leadership" },

            // Skill Nodes from Resume
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
            { id:g: "Product Thinking", type: "skill", parent: "Product Leadership", name: "Product Thinking" },
            { id: "Mentorship", type: "skill", parent: "Product Leadership", name: "Team Mentorship" },
            { id: "Stakeholder Mngmt", type: "skill", parent: "Product Leadership", name: "Stakeholder Management" },
        ]
    };
    
    // --- GENERAL UI ---
    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    // Animate-on-scroll for Journey Timeline
    const timelineItems = document.querySelectorAll('.timeline-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });
    timelineItems.forEach(item => observer.observe(item));

    // Project Modals Logic
    const projectCards = document.querySelectorAll('.project-card');
    const modalContainer = document.getElementById('modal-container');
    const modalBackdrop = document.querySelector('.modal-backdrop');
    
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetModalId = card.getAttribute('data-modal-target');
            const targetModal = document.getElementById(targetModalId);
            if(targetModal) {
                modalContainer.classList.remove('hidden');
                targetModal.classList.add('active');
            }
        });
    });

    const closeButtons = document.querySelectorAll('.modal-close-btn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
        });
    });
    
    modalBackdrop.addEventListener('click', closeAllModals);

    function closeAllModals() {
        modalContainer.classList.add('hidden');
        document.querySelectorAll('.modal-content.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    // --- EXPERTISE: THREE.JS NEURAL SYNAPSE ---
    const expertiseContainer = document.getElementById('expertise-visual');
    if (expertiseContainer) {
        let scene, camera, renderer, nodes = [], skillLabels = [];
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
            
            createGraph();
            addLights();

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
                const x = Math.cos(angle) * layoutRadius;
                const y = Math.sin(angle) * layoutRadius;
                const node = createNode(data, new THREE.Vector3(x, y, 0), 4, 0x00f5c3);
                nodes.push(node);
            });

            skillNodesData.forEach(data => {
                const parentNode = nodes.find(n => n.userData.id === data.parent);
                if (!parentNode) return;

                const angle = Math.random() * Math.PI * 2;
                const dist = 20 + Math.random() * 5;
                const x = parentNode.position.x + Math.cos(angle) * dist;
                const y = parentNode.position.y + Math.sin(angle) * dist;
                const z = (Math.random() - 0.5) * 15;

                const node = createNode(data, new THREE.Vector3(x, y, z), 2, 0xe6f1ff);
                nodes.push(node);

                createLine(parentNode.position, node.position);
                createSkillLabel(node);
            });
        }
        
        function createNode(data, position, size, color) {
            const geometry = new THREE.SphereGeometry(size, 32, 16);
            const material = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.2, shininess: 80 });
            const node = new THREE.Mesh(geometry, material);
            node.position.copy(position);
            node.userData = data;
            scene.add(node);
            return node;
        }

        function createLine(start, end) {
            const material = new THREE.LineBasicMaterial({ color: 0x232a55, transparent: true, opacity: 0.3 });
            const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
            const line = new THREE.Line(geometry, material);
            scene.add(line);
        }

        function createSkillLabel(node) {
            const labelDiv = document.createElement('div');
            labelDiv.className = 'skill-label';
            labelDiv.textContent = node.userData.name;
            expertiseContainer.appendChild(labelDiv);
            skillLabels.push({ div: labelDiv, node: node });
        }
        
        function addLights() {
            scene.add(new THREE.AmbientLight(0xffffff, 0.2));
            const pointLight = new THREE.PointLight(0xffffff, 0.8);
            pointLight.position.set(0, 0, 150);
            scene.add(pointLight);
        }

        function onNodeClick(event) {
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(nodes);

            if (intersects.length > 0) {
                const clickedNode = intersects[0].object;
                if (clickedNode.userData.type === 'main') {
                    focusOnNode(clickedNode);
                }
            }
        }

        function focusOnNode(node) {
            isFocused = true;
            targetNode = node;
            const targetPos = node.position.clone().add(new THREE.Vector3(0, 0, 50));
            gsap.to(camera.position, {
                x: targetPos.x, y: targetPos.y, z: targetPos.z,
                duration: 1.5, ease: 'power3.inOut'
            });
            resetButton.classList.remove('hidden');
        }

        function resetCamera() {
            isFocused = false;
            targetNode = null;
            gsap.to(camera.position, {
                x: initialCameraPos.x, y: initialCameraPos.y, z: initialCameraPos.z,
                duration: 1.5, ease: 'power3.inOut'
            });
            resetButton.classList.add('hidden');
        }

        function updateLabels() {
            skillLabels.forEach(label => {
                const isVisible = isFocused && label.node.userData.parent === targetNode.userData.id;
                label.div.classList.toggle('visible', isVisible);

                if (isVisible) {
                    const screenPos = toScreenPosition(label.node, camera);
                    label.div.style.left = `${screenPos.x}px`;
                    label.div.style.top = `${screenPos.y}px`;
                }
            });
        }
        
        function toScreenPosition(obj, camera) {
            const vector = new THREE.Vector3();
            obj.getWorldPosition(vector).project(camera);
            const rect = renderer.domElement.getBoundingClientRect();
            return {
                x: (vector.x * 0.5 + 0.5) * rect.width + rect.left,
                y: (-vector.y * 0.5 + 0.5) * rect.height + rect.top,
            };
        }

        function onWindowResize() {
            camera.aspect = expertiseContainer.clientWidth / expertiseContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(expertiseContainer.clientWidth, expertiseContainer.clientHeight);
        }

        function animateExpertise() {
            requestAnimationFrame(animateExpertise);
            const time = Date.now() * 0.0001;
            scene.rotation.y = time;
            scene.rotation.z = time * 0.5;
            if (isFocused) {
                camera.lookAt(targetNode.position);
            } else {
                 camera.lookAt(scene.position);
            }
            updateLabels();
            renderer.render(scene, camera);
        }
        
        initExpertise();
        animateExpertise();
    }
    
    // --- VISION: 2D CONSTELLATION ---
    const visionCanvas = document.getElementById('vision-constellation');
    if(visionCanvas) {
        const ctx = visionCanvas.getContext('2d');
        let particles = [];
        const visionPillars = [
            { text: "AI-Powered Venture", x: 0.3, y: 0.25 },
            { text: "Democratized Detection", x: 0.7, y: 0.35 },
            { text: "Unified Platform", x: 0.2, y: 0.7 },
            { text: "Proactive Healthcare", x: 0.8, y: 0.8 }
        ];

        function resizeCanvas() {
            visionCanvas.width = visionCanvas.offsetWidth;
            visionCanvas.height = visionCanvas.offsetHeight;
        }

        function initVision() {
            resizeCanvas();
            // Create background particles
            for (let i = 0; i < 50; i++) {
                particles.push({
                    x: Math.random() * visionCanvas.width,
                    y: Math.random() * visionCanvas.height,
                    radius: Math.random() * 1.5,
                    vx: (Math.random() - 0.5) * 0.2,
                    vy: (Math.random() - 0.5) * 0.2
                });
            }
            // Add vision pillars as larger particles
            visionPillars.forEach(pillar => {
                particles.push({
                    isPillar: true, text: pillar.text,
                    x: pillar.x * visionCanvas.width,
                    y: pillar.y * visionCanvas.height,
                    radius: 4,
                    baseRadius: 4,
                    vx: 0, vy: 0,
                });
            });
            animateVision();
        }

        function animateVision() {
            requestAnimationFrame(animateVision);
            ctx.clearRect(0, 0, visionCanvas.width, visionCanvas.height);

            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > visionCanvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > visionCanvas.height) p.vy *= -1;
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.isPillar ? '#00f5c3' : 'rgba(230, 241, 255, 0.5)';
                ctx.fill();
                
                if (p.isPillar) {
                    ctx.fillStyle = '#a8b2d1';
                    ctx.font = "14px 'Lexend'";
                    ctx.fillText(p.text, p.x + 10, p.y + 5);
                }
            });
            
            // Draw lines between pillars
            const pillars = particles.filter(p => p.isPillar);
            for(let i = 0; i < pillars.length; i++) {
                for(let j = i + 1; j < pillars.length; j++) {
                    ctx.beginPath();
                    ctx.moveTo(pillars[i].x, pillars[i].y);
                    ctx.lineTo(pillars[j].x, pillars[j].y);
                    ctx.strokeStyle = 'rgba(35, 42, 85, 0.8)';
                    ctx.stroke();
                }
            }
        }
        
        window.addEventListener('resize', resizeCanvas);
        initVision();
    }
});
