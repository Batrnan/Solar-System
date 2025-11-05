import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createSun } from './objects/Sun.js';
import { createStars } from './utils/stars.js';
import { createOrbit } from './utils/orbits.js';
import { createPlanet } from './objects/planetGeneration.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 50, 100);

const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === SUN ===
const loader = new THREE.TextureLoader();
const { sun, sunUniforms } = createSun(loader);
scene.add(sun);

// === LIGHT ===
scene.add(new THREE.AmbientLight(0xffffff, 1.0));
const pointLight = new THREE.PointLight(0xffffff, 3.5, 1000);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// === STARS ===
createStars(scene, 2000);

// === PLANETS ===
const planets = [
  { name: 'Mercury', texture: '/textures/mercury.jpg', size: 0.4, distance: 10, tilt: 0.03, rotSpeed: 0.017, orbitSpeed: 0.0415, startAngle: 0 },
  { name: 'Venus', texture: '/textures/venus_surface.jpg', size: 0.9, distance: 15, tilt: 177, rotSpeed: -0.00004, orbitSpeed: 0.0162, startAngle: 45 },
  { name: 'Earth', texture: '/textures/earth.jpg', size: 1.0, distance: 20, tilt: 23.5, rotSpeed: 0.01, orbitSpeed: 0.01, startAngle: 90 },
  { name: 'Mars', texture: '/textures/mars.jpg', size: 0.53, distance: 26, tilt: 25, rotSpeed: 0.0097, orbitSpeed: 0.0053, startAngle: 135 },
  { name: 'Jupiter', texture: '/textures/jupiter.jpg', size: 3.5, distance: 40, tilt: 3, rotSpeed: 0.024, orbitSpeed: 0.00084, startAngle: 180 },
  { name: 'Saturn', texture: '/textures/saturn.jpg', size: 3.0, distance: 55, tilt: 26.7, rotSpeed: 0.0227, orbitSpeed: 0.00034, startAngle: 315 },
  { name: 'Uranus', texture: '/textures/uranus.jpg', size: 1.6, distance: 70, tilt: 98, rotSpeed: -0.0139, orbitSpeed: 0.00012, startAngle: 270 },
  { name: 'Neptune', texture: '/textures/neptune.jpg', size: 1.5, distance: 85, tilt: 28, rotSpeed: 0.015, orbitSpeed: 0.00006, startAngle: 45 },
];

const planetGroups = [];
const orbitLines = [];

planets.forEach(p => {
  const { planet, group, tiltObj } = createPlanet(loader, p);
  group.rotation.y = THREE.MathUtils.degToRad(p.startAngle);
  scene.add(group);
  const orbit = createOrbit(scene, p.distance);
  orbitLines.push(orbit);
  planetGroups.push({ ...p, planet, group, tiltObj });
});

// === CAMERA CONTROLS ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 5;
controls.maxDistance = 500;

let isUserInteracting = false;

canvas.addEventListener('mousedown', () => (isUserInteracting = true));
canvas.addEventListener('mouseup', () => setTimeout(() => (isUserInteracting = false), 100));
canvas.addEventListener('touchstart', () => (isUserInteracting = true));
canvas.addEventListener('touchend', () => setTimeout(() => (isUserInteracting = false), 100));

// === ANIMATION STATE ===
let animationState = {
  speedMultiplier: 1.0,
  autoRotate: false,
  autoRotateSpeed: 0.5,
  showOrbits: true,
  currentView: 'overview',
  followingPlanet: null,
  isUserInteracting: false,
  isCameraAnimating: false,
  targetCameraPos: new THREE.Vector3(),
  targetCameraLookAt: new THREE.Vector3(),
};

// === CONTROL PANEL ===
function createControlPanel() {
  const panel = document.createElement('div');
  panel.id = 'control-panel';
  document.body.appendChild(panel);

  const title = document.createElement('h2');
  title.innerText = 'Solar System Control';
  panel.appendChild(title);

  const speedLabel = document.createElement('label');
  speedLabel.textContent = 'Animation Speed:';
  panel.appendChild(speedLabel);

  const speedInput = document.createElement('input');
  speedInput.type = 'range';
  speedInput.min = '0';
  speedInput.max = '5';
  speedInput.step = '0.1';
  speedInput.value = '1';
  panel.appendChild(speedInput);

  const speedValue = document.createElement('span');
  speedValue.className = 'speed-value';
  speedValue.textContent = '1.0x';
  panel.appendChild(speedValue);

  speedInput.addEventListener('input', (e) => {
    animationState.speedMultiplier = parseFloat(e.target.value);
    speedValue.textContent = `${animationState.speedMultiplier.toFixed(1)}x`;
  });

  const autoRotateLabel = document.createElement('label');
  const autoRotateCheckbox = document.createElement('input');
  autoRotateCheckbox.type = 'checkbox';
  autoRotateLabel.appendChild(autoRotateCheckbox);
  autoRotateLabel.appendChild(document.createTextNode('Automatic Rotation'));
  panel.appendChild(autoRotateLabel);

  autoRotateCheckbox.addEventListener('change', (e) => {
    animationState.autoRotate = e.target.checked;
    controls.autoRotate = e.target.checked;
    controls.autoRotateSpeed = animationState.autoRotateSpeed;
  });

  const orbitsLabel = document.createElement('label');
  const orbitsCheckbox = document.createElement('input');
  orbitsCheckbox.type = 'checkbox';
  orbitsCheckbox.checked = true;
  orbitsLabel.appendChild(orbitsCheckbox);
  orbitsLabel.appendChild(document.createTextNode('Show Orbits'));
  panel.appendChild(orbitsLabel);

  orbitsCheckbox.addEventListener('change', (e) => {
    animationState.showOrbits = e.target.checked;
    orbitLines.forEach(orbit => {
      orbit.visible = e.target.checked;
    });
  });

  const viewLabel = document.createElement('label');
  viewLabel.textContent = 'Viewpoint:';
  panel.appendChild(viewLabel);

  const viewButtons = [
    { name: 'Solar System', view: 'overview' },
    { name: 'Sun', view: 'sun' },
    ...planets.map(p => ({ name: p.name, view: p.name }))
  ];

  viewButtons.forEach(btn => {
    const button = document.createElement('button');
    button.textContent = btn.name;
    button.addEventListener('click', () => {
      changeView(btn.view);
      Array.from(panel.querySelectorAll('button')).forEach(b => {
        b.style.background = 'linear-gradient(90deg, #8b5cf6, #6366f1)';
      });
      button.style.background = 'linear-gradient(90deg, #a78bfa, #818cf8)';
    });
    panel.appendChild(button);
  });
}

// === CAMERA VIEW CHANGE ===
function changeView(viewType) {
  animationState.currentView = viewType;
  animationState.followingPlanet = null;

  let targetPos = new THREE.Vector3();
  let targetLookAt = new THREE.Vector3();

  if (viewType === 'overview') {
    targetPos.set(0, 80, 120);
    targetLookAt.set(0, 0, 0);
  } else if (viewType === 'sun') {
    const cameraDistance = 15;
    targetPos.set(cameraDistance * 0.7, cameraDistance * 0.5, cameraDistance * 0.7);
    targetLookAt.set(0, 0, 0);
  } else {
    const planet = planetGroups.find(p => p.name === viewType);
    if (planet) {
      animationState.followingPlanet = planet;
      const planetPos = new THREE.Vector3();
      planet.tiltObj.getWorldPosition(planetPos);

      const cameraDistance = planet.size * 4 + 3;
      targetPos.set(
        planetPos.x + cameraDistance * 0.7,
        planetPos.y + cameraDistance * 0.5,
        planetPos.z + cameraDistance * 0.7
      );
      targetLookAt.copy(planetPos);
    }
  }

  animationState.targetCameraPos.copy(targetPos);
  animationState.targetCameraLookAt.copy(targetLookAt);
  animationState.isCameraAnimating = true;
}

// === ANIMATION LOOP ===
function animate() {
  const speed = animationState.speedMultiplier;
  sun.rotation.y += 0.0005 * speed;
  sunUniforms.time.value += 0.003 * speed;

  planetGroups.forEach(p => {
    p.group.rotation.y += p.orbitSpeed * speed;
    p.planet.rotation.y += p.rotSpeed * speed;
  });

  if (animationState.isCameraAnimating) {
    const currentPos = camera.position;
    const currentTarget = controls.target;
    const targetPos = animationState.targetCameraPos;
    const targetLookAt = animationState.targetCameraLookAt;

    const distance = currentPos.distanceTo(targetPos);
    const lerpSpeed = Math.min(0.08 + distance * 0.002, 0.2);

    currentPos.lerp(targetPos, lerpSpeed);
    currentTarget.lerp(targetLookAt, lerpSpeed);

    if (distance < 0.5) animationState.isCameraAnimating = false;
  }

  if (animationState.followingPlanet) {
    const planet = animationState.followingPlanet;
    const planetPos = new THREE.Vector3();
    planet.tiltObj.getWorldPosition(planetPos);
    const cameraDistance = planet.size * 4 + 3;
    const targetPos = new THREE.Vector3(
      planetPos.x + cameraDistance * 0.7,
      planetPos.y + cameraDistance * 0.5,
      planetPos.z + cameraDistance * 0.7
    );
    camera.position.lerp(targetPos, 0.1);
    controls.target.lerp(planetPos, 0.1);
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

createControlPanel();
animate();