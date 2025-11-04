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

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 태양
const loader = new THREE.TextureLoader();
const { sun, sunUniforms } = createSun(loader);
scene.add(sun);

// 조명
scene.add(new THREE.AmbientLight(0xffffff, 0.25));
const pointLight = new THREE.PointLight(0xffffff, 2.5, 0);
scene.add(pointLight);

// 배경 별
createStars(scene, 2000);

// 행성 데이터 (실제 자전/공전 주기 기반)
// 자전 속도: 지구 1일 기준, 공전 속도: 지구 1년 기준으로 상대 비율 계산
// startAngle: 초기 공전 위치 (도 단위)
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
planets.forEach(p => {
  const { planet, group, tiltObj } = createPlanet(loader, p);
  // 초기 공전 각도 설정
  group.rotation.y = THREE.MathUtils.degToRad(p.startAngle);
  scene.add(group);
  createOrbit(scene, p.distance);
  planetGroups.push({ ...p, planet, group, tiltObj });
});

// 카메라 컨트롤
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 애니메이션
function animate() {
  sun.rotation.y += 0.0005;
  sunUniforms.time.value += 0.003;
  
  planetGroups.forEach(p => {
    p.group.rotation.y += p.orbitSpeed; // 공전
    p.planet.rotation.y += p.rotSpeed;  // 자전 (자전축 돌아가지 않도록 tiltObj는 고정)
  });
  
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();