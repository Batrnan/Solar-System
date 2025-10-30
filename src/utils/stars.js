import * as THREE from 'three';

export function createStars(scene, count) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < count; i++) {
    positions.push(
      (Math.random() - 0.5) * 2000,
      (Math.random() - 0.5) * 2000,
      (Math.random() - 0.5) * 2000
    );
  }
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
  return stars;
}
