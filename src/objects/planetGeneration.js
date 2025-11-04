import * as THREE from 'three';

export function createPlanet(loader, options) {
  const { name, texture, size, distance, tilt, shininess } = options;
  
  const tex = loader.load(texture);
  const geo = new THREE.SphereGeometry(size, 64, 64);
  const mat = new THREE.MeshPhongMaterial({
    map: tex,
    shininess: shininess || 20,
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
    const cloudGeo = new THREE.SphereGeometry(size * 1.01, 64, 64);
    const cloudMat = new THREE.MeshPhongMaterial({
      map: loader.load('/textures/venus_atmosphere.jpg'),
      transparent: true,
      opacity: 0.8,
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    planet.add(clouds);
  }
  
  return { planet, group, tiltObj };
}