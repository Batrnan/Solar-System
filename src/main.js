import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createSun } from './objects/Sun.js';
import { createEarth } from './objects/Earth.js';
import { createStars } from './utils/stars.js';
import { createOrbit } from './utils/orbits.js';
import { createMars } from './objects/Mars.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 15;
camera.position.y = 5;

const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

const loader = new THREE.TextureLoader();

// 태양
const { sun, sunUniforms } = createSun(loader);
scene.add(sun);

// 중심 그룹(origin) - 태양만 포함
const origin = new THREE.Group();
origin.add(sun);
scene.add(origin);

// 지구
const { earth, earthGroup } = createEarth(loader);
scene.add(earthGroup);

const { mars, marsGroup } = createMars(loader);
scene.add(marsGroup);

createStars(scene, 2000);
createOrbit(scene, 9);
createOrbit(scene, 12);

// 조명
scene.add(new THREE.AmbientLight(0xffffff, 0.2)); // 전체 살짝 밝히기
const sunLight = new THREE.PointLight(0xffffff, 100, 1000); // 더 강하게
scene.add(sunLight);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 애니메이션
let t = 0; // 시간 변수

function animate() {
  t += 0.01; // 시간이 지남 (속도)

  // 지구 공전 + 자전
  earthGroup.rotation.y = t;
  earth.rotation.y += 0.05;

  // 화성 공전 + 자전
  marsGroup.rotation.y = t * 0.53;
  mars.rotation.y += 0.03;

  // 태양 자전
  sun.rotation.y += 0.001;

  sunUniforms.time.value += 0.003;
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
