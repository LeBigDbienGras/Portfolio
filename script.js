// Variables globales
let scene, camera, renderer;
let logoMesh;
let backgroundText;
let cursorX = 0, cursorY = 0;
let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

// Configuration des lumières et couleurs
const lightConfig = {
    ambientIntensity: 2.5,
    ambientColor: 0xffffff, // Blanc pour l'ambiante
    directionalIntensity: 5.0,
    directionalColor: 0xF55B6A, // Rouge vif
    fillIntensity: 2.5,
    fillColor: 0xF55B6A // Rouge vif
};

// Initialisation de la scène
function init() {
    // Scène
    scene = new THREE.Scene();
    scene.background = null; // Transparent au lieu de blanc

    // Caméra
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 5;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '10';
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.appendChild(renderer.domElement);
    } else {
        document.body.appendChild(renderer.domElement);
    }

    // Lumières
    const ambientLight = new THREE.AmbientLight(lightConfig.ambientColor, lightConfig.ambientIntensity);
    scene.add(ambientLight);

    // Lumière principale (face au modèle, légèrement en haut)
    const directionalLight = new THREE.DirectionalLight(lightConfig.directionalColor, lightConfig.directionalIntensity);
    directionalLight.position.set(0, 2, 5); // Face au modèle
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);

    // Lumière d'appoint (de côté)
    const fillLight = new THREE.DirectionalLight(lightConfig.fillColor, lightConfig.fillIntensity);
    fillLight.position.set(-3, 1, 2);
    scene.add(fillLight);

    // Plan pour recevoir l'ombre
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.02 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.z = -2;
    plane.receiveShadow = true;
    scene.add(plane);

    // ----- CHARGEMENT DU MODELE OBJ -----
    const objLoader = new THREE.OBJLoader();
    
    objLoader.load(
        'Darius typo3D.obj', // Ton fichier OBJ
        function (object) {
            // Appliquer un matériau au modèle
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x888888, // Gris mercure
                        metalness: 1.0,
                        roughness: 0.1
                    });
                }
            });
            
            // Mise à l'échelle
            const scale = 0.005;
            object.scale.set(scale, scale, scale);
            
            // Centrer l'objet
            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());
            object.position.sub(center);
            
            logoMesh = object;
            scene.add(logoMesh);
            console.log('Modèle 3D chargé avec succès');
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% chargé');
        },
        function (error) {
            console.error('Erreur de chargement du modèle OBJ:', error);
        }
    );

    // Événements
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);
    
    // Récupérer l'élément texte
    backgroundText = document.querySelector('.background-text');
    
    // Animation
    animate();
}

// Gérer le mouvement de la souris
function onMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
    targetRotationY = (mouseX / windowHalfX) * (Math.PI / 8);
    targetRotationX = (mouseY / windowHalfY) * (Math.PI / 16);
}

// Redimensionnement
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Boucle d'animation
function animate() {
    requestAnimationFrame(animate);
    
    if (logoMesh) {
        logoMesh.rotation.y += (targetRotationY - logoMesh.rotation.y) * 0.05;
        logoMesh.rotation.x += (targetRotationX - logoMesh.rotation.x) * 0.05;
    }
    
    renderer.render(scene, camera);
}

// Gestion du scroll pour déplacer le modèle 3D et diminuer l'opacité du texte
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const maxScroll = window.innerHeight;
    
    if (logoMesh) {
        logoMesh.position.y = scrollY * 0.005;
    }
    
    // Faire monter le PNG "aslo a project" avec le modèle 3D
    const asloProject = document.getElementById('aslo-project');
    if (asloProject) {
        asloProject.style.transform = `translateY(calc(-50% + ${scrollY * 0.005}px))`;
    }
    
    if (backgroundText) {
        const opacity = Math.max(0, 1 - (scrollY / maxScroll));
        backgroundText.style.opacity = opacity;
    }
    
    // Diminuer l'opacité et la taille du header sans le déplacer
    const header = document.querySelector('.header');
    const headerText = document.querySelector('.header-text');
    const headerMenu = document.querySelector('.header-menu');
    
    if (header) {
        const headerOpacity = Math.max(0.3, 1 - (scrollY / maxScroll) * 0.7);
        const scale = Math.max(0.7, 1 - (scrollY / maxScroll) * 0.3);
        header.style.opacity = headerOpacity;
    }
    
    if (headerText) {
        const scale = Math.max(0.7, 1 - (scrollY / maxScroll) * 0.3);
        headerText.style.transform = `scale(${scale})`;
    }
    
    if (headerMenu) {
        const scale = Math.max(0.7, 1 - (scrollY / maxScroll) * 0.3);
        headerMenu.style.transform = `scale(${scale})`;
    }
});

// Lancer au chargement
window.addEventListener('load', () => {
    init();
    window.scrollTo(0, 0);
});
