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
// 렌더러 품질 향상 설정
renderer.outputEncoding = THREE.sRGBEncoding;
// 텍스처를 더 밝게 보이도록 톤매핑 설정
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5; // 노출 값 더 증가로 색상 진하고 밝게

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 태양
const loader = new THREE.TextureLoader();
const { sun, sunUniforms } = createSun(loader);
scene.add(sun);

// 조명 - 텍스처를 더 밝게 보이도록 조명 강화
scene.add(new THREE.AmbientLight(0xffffff, 1.0)); // Ambient light 강도 더 증가
const pointLight = new THREE.PointLight(0xffffff, 3.5, 1000); // Point light 강도 더 증가
pointLight.position.set(0, 0, 0); // 태양 위치에 조명 배치
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
const orbitLines = []; // 궤도선 저장 (토글용)

planets.forEach(p => {
  const { planet, group, tiltObj } = createPlanet(loader, p);
  // 초기 공전 각도 설정
  group.rotation.y = THREE.MathUtils.degToRad(p.startAngle);
  scene.add(group);
  const orbit = createOrbit(scene, p.distance);
  orbitLines.push(orbit); // 궤도선 저장
  planetGroups.push({ ...p, planet, group, tiltObj });
});

// 카메라 컨트롤
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 5;
controls.maxDistance = 500;

// 사용자 인터랙션 감지 (마우스/터치)
let isUserInteracting = false;

canvas.addEventListener('mousedown', () => {
  isUserInteracting = true;
});
canvas.addEventListener('mousemove', () => {
  if (isUserInteracting) isUserInteracting = true;
});
canvas.addEventListener('mouseup', () => {
  setTimeout(() => { isUserInteracting = false; }, 100); // 약간의 지연 후 해제
});
canvas.addEventListener('touchstart', () => {
  isUserInteracting = true;
});
canvas.addEventListener('touchend', () => {
  setTimeout(() => { isUserInteracting = false; }, 100);
});

// 애니메이션 상태 관리
let animationState = {
  speedMultiplier: 1.0,
  autoRotate: false,
  autoRotateSpeed: 0.5,
  showOrbits: true,
  currentView: 'overview', // 'overview', 'sun', 또는 행성 이름
  followingPlanet: null,
  isUserInteracting: false, // 사용자가 마우스로 조작 중인지
  // 부드러운 카메라 이동을 위한 상태
  isCameraAnimating: false,
  targetCameraPos: new THREE.Vector3(),
  targetCameraLookAt: new THREE.Vector3(),
};

// UI 컨트롤 패널 생성
// === UI Control Panel (Refined English Version) ===
function createControlPanel() {
  const panel = document.createElement('div');
  panel.id = 'control-panel';

  const title = document.createElement('h2');
  title.textContent = '☀️ Solar System ☀️ Simulation';
  panel.appendChild(title);

  // === Animation Speed ===
  const speedContainer = document.createElement('div');
  speedContainer.style.marginBottom = '15px';

  const speedLabel = document.createElement('label');
  speedLabel.textContent = 'Animation Speed:';
  speedLabel.style.display = 'block';
  speedLabel.style.marginBottom = '5px';

  const speedInput = document.createElement('input');
  speedInput.type = 'range';
  speedInput.min = '0';
  speedInput.max = '5';
  speedInput.step = '0.1';
  speedInput.value = '1';
  speedInput.style.width = '100%';

  const speedValue = document.createElement('span');
  speedValue.className = 'speed-value';
  speedValue.textContent = '1.0x';

  speedInput.addEventListener('input', (e) => {
    animationState.speedMultiplier = parseFloat(e.target.value);
    speedValue.textContent = `${animationState.speedMultiplier.toFixed(1)}x`;
  });

  speedContainer.appendChild(speedLabel);
  speedContainer.appendChild(speedInput);
  speedContainer.appendChild(speedValue);

  // === Auto Orbit Rotation Toggle ===
  const autoRotateContainer = document.createElement('div');
  autoRotateContainer.style.marginBottom = '15px';

  const autoRotateLabel = document.createElement('label');
  autoRotateLabel.style.display = 'flex';
  autoRotateLabel.style.alignItems = 'center';
  autoRotateLabel.style.cursor = 'pointer';

  const autoRotateCheckbox = document.createElement('input');
  autoRotateCheckbox.type = 'checkbox';
  autoRotateCheckbox.style.marginRight = '8px';

  autoRotateCheckbox.addEventListener('change', (e) => {
    animationState.autoRotate = e.target.checked;
    controls.autoRotate = e.target.checked;
    controls.autoRotateSpeed = animationState.autoRotateSpeed;
  });

  autoRotateLabel.appendChild(autoRotateCheckbox);
  autoRotateLabel.appendChild(document.createTextNode('Auto Orbit Rotation'));
  autoRotateContainer.appendChild(autoRotateLabel);

  // === Orbit Display Toggle ===
  const orbitsContainer = document.createElement('div');
  orbitsContainer.style.marginBottom = '15px';

  const orbitsLabel = document.createElement('label');
  orbitsLabel.style.display = 'flex';
  orbitsLabel.style.alignItems = 'center';
  orbitsLabel.style.cursor = 'pointer';

  const orbitsCheckbox = document.createElement('input');
  orbitsCheckbox.type = 'checkbox';
  orbitsCheckbox.checked = true;
  orbitsCheckbox.style.marginRight = '8px';

  orbitsCheckbox.addEventListener('change', (e) => {
    animationState.showOrbits = e.target.checked;
    orbitLines.forEach(orbit => (orbit.visible = e.target.checked));
  });

  orbitsLabel.appendChild(orbitsCheckbox);
  orbitsLabel.appendChild(document.createTextNode('Show Orbits'));
  orbitsContainer.appendChild(orbitsLabel);

  // === Viewpoint Buttons ===
  const viewContainer = document.createElement('div');
  viewContainer.style.marginBottom = '15px';

  const viewLabel = document.createElement('div');
  viewLabel.textContent = 'Viewpoint:';
  viewLabel.style.marginBottom = '8px';
  viewContainer.appendChild(viewLabel);

  const viewButtons = [
    { name: 'Entire System', view: 'overview' },
    { name: 'Sun (Center)', view: 'sun' },
    ...planets.map((p) => ({ name: p.name, view: p.name })),
  ];

  viewButtons.forEach((btn) => {
    const button = document.createElement('button');
    button.textContent = btn.name;
    button.addEventListener('click', () => {
      changeView(btn.view);

      // Toggle active state
      Array.from(viewContainer.querySelectorAll('button')).forEach((b) => {
        b.style.background = 'linear-gradient(90deg, #8b5cf6, #6366f1)';
      });
      button.style.background = 'linear-gradient(90deg, #a78bfa, #818cf8)';
    });
    viewContainer.appendChild(button);
  });

  // === Assemble All Components ===
  panel.appendChild(speedContainer);
  panel.appendChild(autoRotateContainer);
  panel.appendChild(orbitsContainer);
  panel.appendChild(viewContainer);

  document.body.appendChild(panel);
}

// 시점 전환 함수 (부드러운 카메라 이동)
function changeView(viewType) {
  animationState.currentView = viewType;
  animationState.followingPlanet = null;
  
  // 목표 카메라 위치와 타겟 계산
  let targetPos = new THREE.Vector3();
  let targetLookAt = new THREE.Vector3();
  
  if (viewType === 'overview') {
    // 전체 보기 - 카메라를 높은 위치로
    targetPos.set(0, 80, 120);
    targetLookAt.set(0, 0, 0);
    controls.enabled = true;
  } else if (viewType === 'sun') {
    // 태양 중심 - 행성들처럼 가까이서 보기
    const sunSize = 3.0;
    const cameraDistance = sunSize * 4 + 3;
    targetPos.set(
      cameraDistance * 0.7,
      cameraDistance * 0.5,
      cameraDistance * 0.7
    );
    targetLookAt.set(0, 0, 0);
    controls.enabled = true;
    animationState.followingPlanet = null;
  } else {
    // 특정 행성 관찰
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
      controls.enabled = true;
    }
  }
  
  // 부드러운 카메라 이동 시작
  animationState.targetCameraPos.copy(targetPos);
  animationState.targetCameraLookAt.copy(targetLookAt);
  animationState.isCameraAnimating = true;
}

// 애니메이션
function animate() {
  const speed = animationState.speedMultiplier;
  
  sun.rotation.y += 0.0005 * speed;
  sunUniforms.time.value += 0.003 * speed;
  
  planetGroups.forEach(p => {
    p.group.rotation.y += p.orbitSpeed * speed; // 공전
    p.planet.rotation.y += p.rotSpeed * speed;  // 자전
  });
  
  // 부드러운 카메라 이동 애니메이션
  if (animationState.isCameraAnimating) {
    const currentPos = camera.position;
    const currentTarget = controls.target;
    
    // 행성을 따라가야 하는 경우, 목표 위치를 실시간으로 업데이트
    if (animationState.followingPlanet) {
      const planet = animationState.followingPlanet;
      const planetPos = new THREE.Vector3();
      planet.tiltObj.getWorldPosition(planetPos);
      
      const cameraDistance = planet.size * 4 + 3;
      animationState.targetCameraPos.set(
        planetPos.x + cameraDistance * 0.7,
        planetPos.y + cameraDistance * 0.5,
        planetPos.z + cameraDistance * 0.7
      );
      animationState.targetCameraLookAt.copy(planetPos);
    }
    
    const targetPos = animationState.targetCameraPos;
    const targetLookAt = animationState.targetCameraLookAt;
    
    // 거리 계산으로 이동 속도 조절 (멀리 있을수록 빠르게)
    const distance = currentPos.distanceTo(targetPos);
    const lerpSpeed = Math.min(0.08 + distance * 0.002, 0.2); // 최대 20%씩 이동 (더 빠르게)
    
    // 카메라 위치 부드럽게 이동
    currentPos.lerp(targetPos, lerpSpeed);
    currentTarget.lerp(targetLookAt, lerpSpeed);
    
    // 목표 위치에 충분히 가까워지면 애니메이션 종료
    if (distance < 0.5) { // 임계값을 높여서 더 빨리 따라가기 모드로 전환
      // 행성 따라가기 모드로 전환
      animationState.isCameraAnimating = false;
    }
  }
  
  // 행성 따라가기 모드 (카메라 애니메이션 종료 후 또는 애니메이션 중이지만 사용자가 조작 중일 때)
  if (animationState.followingPlanet && (!animationState.isCameraAnimating || isUserInteracting)) {
    const planet = animationState.followingPlanet;
    
    // 행성의 실제 위치 계산 (tiltObj의 월드 위치)
    const planetPos = new THREE.Vector3();
    planet.tiltObj.getWorldPosition(planetPos);
    
    // 행성 크기에 따라 카메라 거리 조정 (더 가까이서 보기)
    const cameraDistance = planet.size * 4 + 3;
    
    // 현재 카메라 위치에서 행성까지의 방향 벡터
    const currentCamPos = camera.position.clone();
    const currentDirection = new THREE.Vector3().subVectors(currentCamPos, planetPos);
    const currentDistance = currentDirection.length();
    
    // 카메라가 행성을 중심으로 일정 거리와 각도 유지하며 따라가기
    const targetPos = new THREE.Vector3(
      planetPos.x + cameraDistance * 0.7,
      planetPos.y + cameraDistance * 0.5,
      planetPos.z + cameraDistance * 0.7
    );
    
    // 사용자가 수동으로 조작하지 않을 때만 자동으로 따라가기
    if (currentDistance > cameraDistance * 2 || !isUserInteracting) {
      const lerpSpeed = isUserInteracting ? 0.02 : 0.15; // 따라가기 속도 증가 (0.1 -> 0.15)
      camera.position.lerp(targetPos, lerpSpeed);
      controls.target.lerp(planetPos, lerpSpeed);
    }
  }
  
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// UI 초기화
createControlPanel();
animate();