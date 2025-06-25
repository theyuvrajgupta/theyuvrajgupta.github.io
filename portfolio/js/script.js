document.addEventListener('DOMContentLoaded', () => {

    // --- Data for the Expertise Visualization ---
    // You can easily customize your skills here.
    const skillsData = {
        nodes: [
            // Main Nodes (Categories)
            { id: "HealthTech", type: "main", name: "HealthTech" },
            { id: "AI & ML", type: "main", name: "AI & ML" },
            { id: "Cloud Architecture", type: "main", name: "Cloud Architecture" },
            { id: "Product Leadership", type: "main", name: "Product Leadership" },

            // Skill Nodes
            { id: "Clinical Tools", type: "skill", parent: "HealthTech", name: "Clinical Tools" },
            { id: "Medical Imaging", type: "skill", parent: "HealthTech", name: "Medical Imaging (PET-CT)" },
            { id: "Patient Data", type: "skill", parent: "HealthTech", name: "Patient Data Platforms" },

            { id: "ML Engineering", type: "skill", parent: "AI & ML", name: "ML Engineering" },
            { id: "Deep Learning", type: "skill", parent: "AI & ML", name: "Deep Learning" },
            { id: "TensorFlow", type: "skill", parent: "AI & ML", name: "TensorFlow" },
            { id: "CNNs", type: "skill", parent: "AI & ML", name: "CNNs" },
            
            { id: "Serverless", type: "skill", parent: "Cloud Architecture", name: "Serverless" },
            { id: "AWS Lambda", type: "skill", parent: "Cloud Architecture", name: "AWS Lambda" },
            { id: "Microservices", type: "skill", parent: "Cloud Architecture", name: "Microservices" },
            { id: "DevOps", type: "skill", parent: "Cloud Architecture", name: "DevOps" },

            { id: "Agile & Scrum", type: "skill", parent: "Product Leadership", name: "Agile & Scrum" },
            { id: "Product Thinking", type: "skill", parent: "Product Leadership", name: "Product Thinking" },
            { id: "Mentorship", type: "skill", parent: "Product Leadership", name: "Team Mentorship" },
            { id: "Roadmapping", type: "skill", parent: "Product Leadership", name: "Product Roadmapping" },
        ]
    };

    // --- Navbar Scroll Effect ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Three.js Expertise Visualization ---
    const container = document.getElementById('expertise-visual');
    if (container) {
        let scene, camera, renderer, raycaster, mouse;
        let nodes = [], lines = [];
        let hoveredNode = null;
        const tooltip = document.getElementById('skill-tooltip');

        // --- Initialization ---
        function init() {
            // Scene
            scene = new THREE.Scene();
            scene.fog = new THREE.Fog(0x0f0f1a, 200, 400);

            // Camera
            camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
            camera.position.z = 100;

            // Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            container.appendChild(renderer.domElement);
            
            // Raycaster for mouse interaction
            raycaster = new THREE.Raycaster();
            mouse = new THREE.Vector2();

            // Create the graph
            createGraph();
            
            // Event Listeners
            container.addEventListener('mousemove', onMouseMove, false);
            window.addEventListener('resize', onWindowResize, false);
        }

        // --- Graph Creation ---
        function createGraph() {
            const mainNodes = skillsData.nodes.filter(n => n.type === 'main');
            const skillNodes = skillsData.nodes.filter(n => n.type === 'skill');

            const mainNodeRadius = 4;
            const skillNodeRadius = 2;
            const layoutRadius = 50;

            // Create Main Nodes
            mainNodes.forEach((nodeData, i) => {
                const angle = (i / mainNodes.length) * Math.PI * 2;
                const x = Math.cos(angle) * layoutRadius;
                const y = Math.sin(angle) * layoutRadius;
                
                const geometry = new THREE.SphereGeometry(mainNodeRadius, 32, 32);
                const material = new THREE.MeshPhongMaterial({ color: 0x4f46e5, shininess: 80 });
                const node = new THREE.Mesh(geometry, material);
                
                node.position.set(x, y, 0);
                node.userData = nodeData;
                scene.add(node);
                nodes.push(node);
            });

            // Create Skill Nodes and Lines
            skillNodes.forEach(nodeData => {
                const parentNode = nodes.find(n => n.userData.id === nodeData.parent);
                if (!parentNode) return;
                
                // Position skill nodes around their parent
                const skillCount = skillNodes.filter(s => s.parent === nodeData.parent).length;
                const skillIndex = skillNodes.filter(s => s.parent === nodeData.parent).indexOf(nodeData);

                const angle = (skillIndex / skillCount) * Math.PI * 2;
                const dist = 25;
                const x = parentNode.position.x + Math.cos(angle) * dist;
                const y = parentNode.position.y + Math.sin(angle) * dist;
                const z = (Math.random() - 0.5) * 10;
                
                const geometry = new THREE.SphereGeometry(skillNodeRadius, 16, 16);
                const material = new THREE.MeshPhongMaterial({ color: 0xe0e0e0, shininess: 50 });
                const node = new THREE.Mesh(geometry, material);

                node.position.set(x, y, z);
                node.userData = nodeData;
                scene.add(node);
                nodes.push(node);

                // Create line
                const lineMaterial = new THREE.LineBasicMaterial({ color: 0x2a2a3e, transparent: true, opacity: 0.5 });
                const points = [parentNode.position, node.position];
                const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(lineGeometry, lineMaterial);
                scene.add(line);
                lines.push({line, from: parentNode, to: node});
            });

            // Lights
            scene.add(new THREE.AmbientLight(0x404040, 2));
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(0, 0, 1);
            scene.add(directionalLight);
        }

        // --- Event Handlers ---
        function onWindowResize() {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
        
        function onMouseMove(event) {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        }

        // --- Animation Loop ---
        function animate() {
            requestAnimationFrame(animate);

            // Update raycaster
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(nodes);

            if (intersects.length > 0) {
                const intersectedObject = intersects[0].object;
                if (hoveredNode !== intersectedObject) {
                    hoveredNode = intersectedObject;
                    updateVisuals();
                    
                    // Tooltip logic
                    const screenPosition = toScreenPosition(hoveredNode, camera);
                    tooltip.style.opacity = '1';
                    tooltip.style.left = `${screenPosition.x}px`;
                    tooltip.style.top = `${screenPosition.y}px`;
                    tooltip.textContent = hoveredNode.userData.name;
                }
            } else {
                if (hoveredNode !== null) {
                    hoveredNode = null;
                    updateVisuals();
                    tooltip.style.opacity = '0';
                }
            }

            // Animate nodes
            const time = Date.now() * 0.0005;
            nodes.forEach(node => {
                if(node.userData.type === 'skill') {
                     node.position.z += Math.sin(time + node.id) * 0.01;
                }
            });
            
            // Rotate the whole scene
            scene.rotation.z += 0.0005;
            scene.rotation.x += 0.0001;

            renderer.render(scene, camera);
        }
        
        // --- Visual Update Logic ---
        function updateVisuals() {
            nodes.forEach(node => {
                const isHovered = (node === hoveredNode);
                const isRelated = isNodeRelated(node);
                const targetOpacity = (hoveredNode === null || isRelated) ? 1 : 0.2;
                const targetColor = new THREE.Color(getNodeColor(node, isHovered, isRelated));
                
                // Animate color and opacity
                node.material.color.lerp(targetColor, 0.1);
            });

            lines.forEach(l => {
                const isRelated = (hoveredNode && (l.from === hoveredNode || l.to === hoveredNode || (l.from.userData.parent === hoveredNode.userData.parent && hoveredNode.userData.type === 'skill')));
                l.line.material.opacity = (hoveredNode === null || isRelated) ? 0.5 : 0.1;
                l.line.material.color = new THREE.Color((isRelated) ? 0x7c3aed : 0x2a2a3e);
            });
        }

        // --- Helper Functions ---
        function isNodeRelated(node) {
            if (!hoveredNode) return false;
            if (node === hoveredNode) return true;
            if (hoveredNode.userData.type === 'main') {
                return node.userData.parent === hoveredNode.userData.id;
            }
            if (hoveredNode.userData.type === 'skill') {
                return node.userData.id === hoveredNode.userData.parent || node.userData.parent === hoveredNode.userData.parent;
            }
            return false;
        }

        function getNodeColor(node, isHovered, isRelated) {
             if(isHovered) return 0x7c3aed; // bright purple on hover
             if(node.userData.type === 'main') return 0x4f46e5; // primary blue for main
             if(isRelated) return 0xffffff; // white for related
             return 0xe0e0e0; // default grey for unrelated skills
        }

        function toScreenPosition(obj, camera) {
            const vector = new THREE.Vector3();
            obj.getWorldPosition(vector);
            vector.project(camera);

            const rect = renderer.domElement.getBoundingClientRect();
            const x = (vector.x * 0.5 + 0.5) * rect.width + rect.left;
            const y = (-vector.y * 0.5 + 0.5) * rect.height + rect.top;

            return { x, y };
        }

        init();
        animate();
    }
});
