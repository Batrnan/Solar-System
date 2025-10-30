import * as THREE from 'three';

export function createSun(loader) {
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
  return { sun, sunUniforms };
}
