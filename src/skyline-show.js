import * as THREE from 'three';
import { landmarks } from './data.js';

// The facade program uses scene coordinates so the image crosses lot boundaries.
const choreography = `
  vec3 p = vShowPosition;
  float t = uShowSeconds;
  float x = p.x - 12.0;
  float side = abs(x);
  float coastal = smoothstep(-64.0, -30.0, p.z) * (1.0 - smoothstep(105.0, 140.0, side));
  // Slow diagonal silk bands travel through several facades at once.
  float beat = 6.2831853 * t / 36.0;
  float silk = sin(x * 0.082 + p.y * 0.28 - beat * 4.0 + 1.1 * sin(p.y * 0.18 + beat));
  float crest = smoothstep(0.34, 0.96, silk);
  float trailing = exp(-6.0 * abs(silk + 0.23));
  float hue = smoothstep(-0.5, 0.65, sin(x * 0.049 + beat * 2.0));
  vec3 sea = vec3(0.018, 0.035, 0.12)
           + mix(vec3(0.025, 0.49, 1.60), vec3(0.99, 0.035, 0.26), hue) * crest
           + vec3(0.21, 0.57, 0.82) * trailing;
  float spread = smoothstep(10.0, 21.0, t);
  float wingY = 3.0 + side * (0.09 + 0.17 * spread) + 2.0 * sin(side * 0.075 - beat * 3.0);
  float vane = p.y - wingY;
  float plume = exp(-0.70 * abs(vane)) + 0.45 * exp(-0.66 * abs(vane + 3.2));
  float pinions = smoothstep(-0.5, 0.85, cos(side * 0.55 - vane * 0.64 - beat * 3.0));
  vec3 wing = vec3(0.13, 0.016, 0.26) + plume * mix(vec3(0.87, 0.12, 0.33), vec3(2.1, 0.96, 0.27), pinions);
  float ribbon = 0.5 + 0.5 * sin(x * 0.08 - p.y * 0.22 - beat * 4.0);
  vec3 gold = mix(vec3(0.40, 0.012, 0.065), vec3(1.75, 0.69, 0.10), pow(ribbon, 2.0));
  vec3 pattern = mix(sea, wing, smoothstep(10.0, 14.0, t));
  pattern = mix(pattern, gold, smoothstep(22.0, 26.0, t));
  pattern = mix(pattern, sea, smoothstep(32.0, 36.0, t));
  float floorBand = 0.5 + 0.5 * cos(p.y * 5.1);
  float led = mix(0.63, 1.0, mix(floorBand, 0.5, smoothstep(0.2, 1.0, fwidth(p.y))));
  outgoingLight = mix(outgoingLight, outgoingLight * 0.15 + pattern * led, coastal);
`;

// Two additive draws: a photographic starburst at the crown and soft pools on the plaza.
function showAccents(city, clock) {
  const group = new THREE.Group();
  const crownMaterial = new THREE.ShaderMaterial({
    uniforms: { time: clock }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      varying vec2 v;
      void main() {
        v = uv * 2.0 - 1.0;
        vec4 center = modelViewMatrix * vec4(0., 0., 0., 1.);
        center.xy += position.xy;
        gl_Position = projectionMatrix * center;
      }`,
    fragmentShader: `
      varying vec2 v;
      uniform float time;
      void main() {
        float radius = length(v);
        float beat = time * 6.2831853 / 36.;
        float angle = atan(v.y, v.x + 0.00001) + 0.08 * sin(beat * 2.);
        float rays = pow(abs(cos(angle * 9.)), 13.) + 0.35 * pow(abs(sin(angle * 13.)), 9.);
        float fade = pow(max(0., 1. - radius), 2.);
        vec3 hue = mix(vec3(0.04, 0.32, 1.0), vec3(0.14, 0.95, 0.52), 0.5 + 0.5 * sin(angle * 5. + beat));
        vec3 light = hue * fade * (rays + 0.08) + vec3(0.78, 0.97, 1.) * exp(-radius * 40.);
        gl_FragColor = vec4(light, smoothstep(0., 0.15, fade) * (0.75 + 0.2 * cos(beat * 2.)));
        #include <colorspace_fragment>
      }`
  });
  const tower = landmarks.find(site => site.id === 'pingan');
  const crown = new THREE.Mesh(new THREE.PlaneGeometry(32, 32), crownMaterial);
  crown.position.copy(city.landmarkGroups.get(tower.id).position);
  crown.position.y += tower.height + 0.3;
  group.add(crown);

  const pools = new THREE.InstancedMesh(new THREE.PlaneGeometry(), new THREE.ShaderMaterial({
    uniforms: { time: clock }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      varying vec2 v;
      varying float lane;
      void main() {
        v = uv * 2. - 1.;
        lane = instanceMatrix[3].x;
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.);
      }`,
    fragmentShader: `
      varying vec2 v;
      varying float lane;
      uniform float time;
      void main() {
        float phase = lane * 0.21 - time * 6.2831853 / 12.;
        float halo = pow(max(0., 1. - dot(v,v)), 2.);
        vec3 tint = mix(vec3(1., 0.38, 0.04), vec3(0.85, 0.22, 0.53), 0.5 + 0.5 * sin(phase));
        gl_FragColor = vec4(tint, halo * (0.55 + 0.24 * cos(phase)));
        #include <colorspace_fragment>
      }`
  }), 10);
  const lamp = new THREE.Object3D();
  const plaza = city.landmarkGroups.get('civic').position;
  lamp.rotation.x = -Math.PI / 2;
  lamp.scale.set(3.5, 2.2, 1);
  for (let i = 0; i < pools.count; i++) {
    lamp.position.set(plaza.x - 12 + (i % 5) * 6, plaza.y + 0.36, plaza.z + 8.7 + Math.floor(i / 5) * 3.4);
    lamp.updateMatrix();
    pools.setMatrixAt(i, lamp.matrix);
  }
  group.add(pools);
  city.scene.add(group);
  return group;
}

export class SkylineShow {
  constructor(city) {
    this.seconds = { value: city.reducedMotion ? 18 : 0 };
    this.paused = city.reducedMotion;
    this.accents = showAccents(city, this.seconds);
    this.surfaces = new Map();
    this.materials = new Map();
    const attach = mesh => {
      const original = mesh.material;
      let lit = this.materials.get(original);
      if (!lit) {
        lit = original.clone();
        lit.onBeforeCompile = shader => {
          shader.uniforms.uShowSeconds = this.seconds;
          shader.vertexShader = 'varying vec3 vShowPosition;\n' + shader.vertexShader.replace('#include <project_vertex>', `
            vec4 showVertex = vec4(transformed, 1.0);
            #ifdef USE_INSTANCING
              showVertex = instanceMatrix * showVertex;
            #endif
            vShowPosition = (modelMatrix * showVertex).xyz;
            #include <project_vertex>
          `);
          shader.fragmentShader = 'varying vec3 vShowPosition;\nuniform float uShowSeconds;\n'
            + shader.fragmentShader.replace('#include <opaque_fragment>', choreography + '\n#include <opaque_fragment>');
        };
        this.materials.set(original, lit);
      }
      this.surfaces.set(mesh, original);
      mesh.material = lit;
    };
    for (const block of city.layers.buildings.children) if (block.material?.emissiveMap) attach(block);
    for (const id of ['spring', 'pingan', 'civic', 'kk100', 'shunhing']) {
      city.landmarkGroups.get(id)?.traverse(mesh => {
        if (mesh.isMesh && /glass|ribbon|roof/i.test(mesh.material.name)) attach(mesh);
      });
    }
  }

  advance(dt) {
    if (!this.paused) this.seconds.value = (this.seconds.value + dt) % 36;
  }

  dispose() {
    for (const [mesh, original] of this.surfaces) mesh.material = original;
    for (const material of this.materials.values()) material.dispose();
    this.accents.removeFromParent();
    for (const mesh of this.accents.children) {
      mesh.geometry.dispose();
      mesh.material.dispose();
      if (mesh.isInstancedMesh) mesh.dispose();
    }
  }
}
