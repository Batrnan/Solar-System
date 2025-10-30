import * as THREE from 'three';

export function createEarth(loader) {
  const earthTexture = loader.load('/textures/earth.jpg');
  const earthGeo = new THREE.SphereGeometry(1, 32, 32);
  const earthMat = new THREE.MeshPhongMaterial({
    map: earthTexture,
    shininess: 50,
  });
  const earth = new THREE.Mesh(earthGeo, earthMat);
  earth.rotation.z = THREE.MathUtils.degToRad(23.5);

  const earthGroup = new THREE.Group();
  earth.position.set(6, 0, 0);
  earthGroup.add(earth);

  return { earth, earthGroup };
}
