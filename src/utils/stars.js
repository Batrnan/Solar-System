//stars 부분
import * as THREE from 'three';

export function createStars(scene, count) {
  const geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const sizes = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 2000;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;

    phases[i] = Math.random() * Math.PI * 2;

    // ⭐ 크기를 더 키움 (기존 1~3 → 2~5)
    sizes[i] = Math.random() * 3 + 5;

    // ⭐ 색상 다양하게 (밝기 중심)
    const hue = 0.1 + Math.random() * 0.6;
    const color = new THREE.Color().setHSL(hue, 0.8, 0.9);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
    },
    vertexShader: `
      attribute float phase;
      attribute float size;
      attribute vec3 color;
      varying float vPhase;
      varying vec3 vColor;

      void main() {
        vPhase = phase;
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (400.0 / -mvPosition.z); // 별 크기 좀 더 큼
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float time;
      varying float vPhase;
      varying vec3 vColor;

      void main() {
        // 별의 원형 마스크
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;

        // 깜빡임 강도 조절
        float flicker = 0.6 + 0.5 * sin(time * 1.5 + vPhase * 8.0);
        vec3 color = vColor * flicker * 1.5; // ⭐ 전체 밝기 1.5배 증가

        // 중심 밝게, 가장자리 어둡게
        float intensity = smoothstep(0.5, 0.0, dist);
        gl_FragColor = vec4(color * intensity, 1.0 - dist * 1.8);
      }
    `,
    transparent: true,
    depthWrite: false, // 별끼리 z충돌 안나게
  });

  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
  return stars;
}
