import * as THREE from 'three';

export function createMars(loader) {
  const marsTexture = loader.load('/textures/mars.jpg');
  const marsGeo = new THREE.SphereGeometry(0.53, 32, 32); // 화성 반지름은 지구의 절반 정도
  const marsMat = new THREE.MeshPhongMaterial({
    map: marsTexture,
    shininess: 30,
  });
  const mars = new THREE.Mesh(marsGeo, marsMat);
  mars.rotation.z = THREE.MathUtils.degToRad(25);

  const marsGroup = new THREE.Group();
  mars.position.set(9, 0, 0);
  marsGroup.add(mars);

  return { mars, marsGroup };
}
