import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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
const sunGeo = new THREE.SphereGeometry(2.0, 32, 32);
const sunUniforms = {
  time: { value: 0.0 },
  sunTexture: { value: loader.load('/textures/sun.jpg') },
};

const sunMat = new THREE.ShaderMaterial({
  uniforms: sunUniforms,
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D sunTexture;
    uniform float time;
    varying vec2 vUv;
    void main() {
      float flicker = 0.5 * (sin(time*2.0) * 0.5 + 0.5); 
      vec2 uv = vUv;
      uv.x += sin(time + uv.y*5.0) * 0.02; 
      vec4 tex = texture2D(sunTexture, uv);
      gl_FragColor = vec4(tex.rgb * (1.0 + flicker), 1.0);
    }
  `,
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

// 지구 텍스처 & 메쉬
const earthTexture = loader.load('/textures/earth.jpg');
const earthGeo = new THREE.SphereGeometry(1, 32, 32);
const earthMat = new THREE.MeshPhongMaterial({
  map: earthTexture,
  shininess: 50,
});
const earth = new THREE.Mesh(earthGeo, earthMat);

// 지구 그룹 (공전 전용)
const earthGroup = new THREE.Group();
scene.add(earthGroup);

// 지구를 그룹에 넣고, 공전 반지름만큼 떨어뜨려 놓음
earth.position.set(6, 0, 0);
earthGroup.add(earth);

earth.rotation.z = THREE.MathUtils.degToRad(23.5);

// 화성 텍스처 & 메쉬
const marsTexture = loader.load('/textures/mars.jpg');
const marsGeo = new THREE.SphereGeometry(0.53, 32, 32); // 화성 반지름은 지구의 절반 정도
const marsMat = new THREE.MeshPhongMaterial({
  map: marsTexture,
  shininess: 30,
});
const mars = new THREE.Mesh(marsGeo, marsMat);

// 화성 그룹 (공전 전용)
const marsGroup = new THREE.Group();
scene.add(marsGroup);

mars.position.set(9, 0, 0);
marsGroup.add(mars);

mars.rotation.z = THREE.MathUtils.degToRad(25);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 조명
scene.add(new THREE.AmbientLight(0xffffff, 0.2)); // 전체 살짝 밝히기
const sunLight = new THREE.PointLight(0xffffff, 100, 1000); // 더 강하게
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// 중심 그룹(origin) - 태양만 포함
const origin = new THREE.Group();
origin.add(sun);
scene.add(origin);

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

// 보조선
function createOrbit(radius) {
  const curve = new THREE.EllipseCurve(
    0,
    0, // 중심 좌표
    radius,
    radius, // x, y 반지름 (원)
    0,
    2 * Math.PI, // 시작 각도, 끝 각도
    false,
    0
  );

  const points = curve.getPoints(100); // 곡선 포인트 100개
  const geometry = new THREE.BufferGeometry().setFromPoints(
    points.map((p) => new THREE.Vector3(p.x, 0, p.y)) // x,y → x,z
  );

  const material = new THREE.LineBasicMaterial({ color: 0x888888 });
  const orbit = new THREE.LineLoop(geometry, material);

  scene.add(orbit);
  return orbit;
}

function createStars(count) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    positions.push(x, y, z);
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1,
  });

  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
}

createStars(2000);
createOrbit(6);
createOrbit(9);
animate();
