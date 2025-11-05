import * as THREE from 'three';

export function createPlanet(loader, options) {
  const { name, texture, size, distance, tilt, shininess } = options;
  
  const tex = loader.load(texture);
  // 텍스처 필터링 설정으로 선명도 향상
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 16; // 최대 이방성 필터링으로 선명도 향상
  tex.colorSpace = THREE.SRGBColorSpace; // 색상 공간 설정으로 더 선명하게
  
  const geo = new THREE.SphereGeometry(size, 64, 64);
  const mat = new THREE.MeshPhongMaterial({
    map: tex,
    shininess: shininess || 20,
    emissive: 0x000000, // 기본 emissive는 검정
    emissiveIntensity: 0.3, // 자체 발광 효과 증가로 색상 진하게
    // 텍스처 색상을 더 밝고 진하게 표시하기 위한 설정
    color: 0xffffff, // 색상 보정을 위해 흰색으로 설정
  });
  
  const planet = new THREE.Mesh(geo, mat);
  
  // 자전축 기울기를 별도 오브젝트로 관리
  const tiltObj = new THREE.Object3D();
  tiltObj.rotation.z = THREE.MathUtils.degToRad(tilt);
  tiltObj.add(planet);
  
  const group = new THREE.Group();
  tiltObj.position.set(distance, 0, 0);
  group.add(tiltObj);
  
  // Saturn ring
  if (name === 'Saturn') {
    const ringTex = loader.load('/textures/saturn_ring.png');
    ringTex.minFilter = THREE.LinearMipmapLinearFilter;
    ringTex.magFilter = THREE.LinearFilter;
    ringTex.generateMipmaps = true;
    ringTex.anisotropy = 16;
    const ringGeo = new THREE.RingGeometry(size * 1.4, size * 2.4, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      map: ringTex,
      side: THREE.DoubleSide,
      transparent: true,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    planet.add(ring);
  }
  
  // Venus atmosphere
  if (name === 'Venus') {
    const cloudTex = loader.load('/textures/venus_atmosphere.jpg');
    cloudTex.minFilter = THREE.LinearMipmapLinearFilter;
    cloudTex.magFilter = THREE.LinearFilter;
    cloudTex.generateMipmaps = true;
    cloudTex.anisotropy = 16;
    const cloudGeo = new THREE.SphereGeometry(size * 1.01, 64, 64);
    const cloudMat = new THREE.MeshPhongMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.8,
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    planet.add(clouds);
  }
  
  return { planet, group, tiltObj };
}