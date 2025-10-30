import * as THREE from 'three';

export function createOrbit(scene, radius) {
  const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI);
  const points = curve.getPoints(100);
  const geometry = new THREE.BufferGeometry().setFromPoints(
    points.map((p) => new THREE.Vector3(p.x, 0, p.y))
  );
  const material = new THREE.LineBasicMaterial({ color: 0x888888 });
  const orbit = new THREE.LineLoop(geometry, material);
  scene.add(orbit);
  return orbit;
}
