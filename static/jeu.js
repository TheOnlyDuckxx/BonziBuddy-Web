// Initialisation de la scène Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("gameCanvas") });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Chargement des textures
const textureLoader = new THREE.TextureLoader();
const wallTexture = textureLoader.load("../static/wall.png");
const floorTexture = textureLoader.load("../static/floor.jpg");

// Appliquer la répétition de la texture
wallTexture.wrapS = THREE.RepeatWrapping;
wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.repeat.set(10, 1);

floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(10, 10);

// Configuration du tunnel
const tunnelWidth = 10;
const tunnelHeight = 7;
const tunnelLength = 50;
const numSegments = 5;

const tunnelSegments = [];
const segmentLights = [];

// Fonction pour créer un segment de tunnel
function createTunnelSegment(zPosition) {
    const wallGeometry = new THREE.BoxGeometry(tunnelWidth, tunnelHeight, tunnelLength);
    const wallMaterial = new THREE.MeshStandardMaterial({ map: wallTexture, side: THREE.DoubleSide });
    const tunnelSegment = new THREE.Mesh(wallGeometry, wallMaterial);
    tunnelSegment.position.set(0, tunnelHeight / 2, zPosition);
    scene.add(tunnelSegment);
    tunnelSegments.push(tunnelSegment);

    const floorGeometry = new THREE.PlaneGeometry(tunnelWidth, tunnelLength);
    const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTexture });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -5, zPosition);
    scene.add(floor);

    const light1 = new THREE.PointLight(0xff0000, 1, 10);
    light1.position.set(0, 2, zPosition - 10);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xfff4c2, 1, 10);
    light2.position.set(0, 2, zPosition + 10);
    scene.add(light2);

    segmentLights.push({ light1, light2 });
}

for (let i = 0; i < numSegments; i++) {
    createTunnelSegment(i * tunnelLength);
}

// Effet de lumières vacillantes
setInterval(() => {
    segmentLights.forEach(({ light1, light2 }) => {
        light1.intensity = Math.random() * 2;
        light2.intensity = Math.random() * 2;
    });
}, 300);

// Musique d'ambiance (joue uniquement si la touche Z est enfoncée)
const ambientSound = new Audio('../static/ambience.mp3');
ambientSound.loop = true;
let isMusicPlaying = false;

// Gestion des touches
let keys = {};
window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (e.code === "KeyZ" && !isMusicPlaying) {
        ambientSound.play();
        isMusicPlaying = true;
    }
});

window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
});

// Son du jump scare
const jumpScareSound = new Audio('../static/jumpscare.mp3');

// Fonction pour afficher le jump scare
let isJumpScareActive = false;
let passedJumpScare = false;
function triggerJumpScare() {
    if (!isJumpScareActive) {
        isJumpScareActive = true;
        document.getElementById('jumpscareImage').style.display = 'block';
        jumpScareSound.play();
        
        setTimeout(() => {
            document.getElementById('jumpscareImage').style.display = 'none';
            isJumpScareActive = false;

            // ✅ Maintenant on envoie bien la requête après le jumpscare
            fetch('/set-bonzi-game-finished', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
            .then(response => response.json())
            .then(data => console.log("Jeu de Bonzi terminé :", data))
            .catch(error => console.error("Erreur lors de la notification du jeu terminé :", error));
            
        }, 3000);

        // ✅ Marquer que le jumpscare a bien eu lieu
        passedJumpScare = true;
    }
}

// Fonction pour planifier le prochain jump scare aléatoirement entre 6 et 15 secondes
function scheduleJumpScare() {
    const randomDelay = 23000 + Math.random() * 30000; 
    if (!passedJumpScare) setTimeout(() => {
        triggerJumpScare();
        scheduleJumpScare(); // Planifier le prochain jump scare après celui-ci
    }, randomDelay);
}

// Démarrer le premier jump scare aléatoire après le chargement
scheduleJumpScare();

// Mouvements du joueur
camera.position.z = 0;
camera.position.y = 1;
function updatePlayerMovement() {
    if (keys["KeyW"]) {
        camera.position.z += 0.2;
    }
}

// Effet de distorsion aléatoire
function addGlitchEffect() {
    camera.position.x += (Math.random() - 0.5) * 0.1;
    camera.position.y += (Math.random() - 0.5) * 0.1;
}

// Mise à jour du tunnel
function updateTunnel() {
    if (camera.position.z > tunnelSegments[tunnelSegments.length - 1].position.z - tunnelLength) {
        createTunnelSegment(tunnelSegments[tunnelSegments.length - 1].position.z + tunnelLength);
    }

    if (camera.position.z < tunnelSegments[0].position.z - tunnelLength) {
        createTunnelSegment(tunnelSegments[0].position.z - tunnelLength);
        scene.remove(tunnelSegments.shift());
        const firstLights = segmentLights.shift();
        scene.remove(firstLights.light1);
        scene.remove(firstLights.light2);
    }
}

// Animation principale
function animate() {
    requestAnimationFrame(animate);
    updatePlayerMovement();
    updateTunnel();
    if (Math.random() < 0.02) {
        addGlitchEffect();
    }
    renderer.render(scene, camera);
}

animate();