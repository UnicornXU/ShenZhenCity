import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Reference-informed geometry, not surveyed architectural/BIM data.
// Each part batches its materials so facade detail does not add a draw call per rib.
class Part {
  constructor(name, parent, position = [0, 0, 0]) {
    this.group = new THREE.Group();
    this.group.name = name;
    this.group.position.set(...position);
    parent?.add(this.group);
    this.meshes = new Map();
    this.lines = new Map();
  }

  add(geometry, mat, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
    const transform = new THREE.Matrix4().compose(new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)), new THREE.Vector3(...scale));
    geometry.applyMatrix4(transform);
    if (geometry.index) { const flat = geometry.toNonIndexed(); geometry.dispose(); geometry = flat; }
    for (const key of Object.keys(geometry.attributes)) if (!['position', 'normal', 'uv'].includes(key)) geometry.deleteAttribute(key);
    if (!geometry.getAttribute('normal')) geometry.computeVertexNormals();
    if (!geometry.getAttribute('uv')) geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(geometry.getAttribute('position').count * 2), 2));
    if (!this.meshes.has(mat)) this.meshes.set(mat, []);
    this.meshes.get(mat).push(geometry);
  }

  box(x, y, z, w, h, d, mat) { this.add(new THREE.BoxGeometry(w, h, d), mat, [x, y, z]); }

  beam(a, b, radius, mat) {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
    const delta = end.clone().sub(start);
    if (delta.length() < 0.00001) return;
    const geo = new THREE.CylinderGeometry(radius, radius, delta.length(), 5);
    geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()));
    this.add(geo, mat, start.add(end).multiplyScalar(0.5).toArray());
  }

  line(points, mat, closed = false) {
    if (!this.lines.has(mat)) this.lines.set(mat, []);
    const buffer = this.lines.get(mat);
    for (let i = 1; i < points.length; i++) buffer.push(...points[i - 1], ...points[i]);
    if (closed) buffer.push(...points.at(-1), ...points[0]);
  }

  finish() {
    this.meshes.forEach((geos, mat) => {
      const mesh = new THREE.Mesh(mergeGeometries(geos), mat);
      mesh.name = `${this.group.name}_${mat.name || 'surface'}`;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.group.add(mesh);
      geos.forEach(geo => geo.dispose());
    });
    this.lines.forEach((positions, mat) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      const lines = new THREE.LineSegments(geo, mat);
      lines.name = `${this.group.name}_structure`;
      this.group.add(lines);
    });
    this.meshes.clear();
    this.lines.clear();
    return this.group;
  }
}

const mix = (a, b, t) => a.map((value, i) => THREE.MathUtils.lerp(value, b[i], t));
const standard = (name, color, extras = {}) => { const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.58, metalness: 0.18, ...extras }); mat.name = name; return mat; };
const lineMaterial = color => new THREE.LineBasicMaterial({ color });

function polygon(r, bevel = 0.2) {
  const c = r * (1 - bevel);
  return [[-r, -c], [-c, -r], [c, -r], [r, -c], [r, c], [c, r], [-c, r], [-r, c]];
}

function ring(points, y) { return points.map(([x, z]) => [x, y, z]); }

function loft(rings, cap = true) {
  const positions = [], uvs = [];
  const triangle = (a, b, c, uv) => { positions.push(...a, ...b, ...c); uvs.push(...uv); };
  const sides = rings[0].length;
  const maxY = Math.max(...rings.flat().map(p => p[1]));
  for (let j = 0; j < rings.length - 1; j++) for (let i = 0; i < sides; i++) {
    const next = (i + 1) % sides;
    const a = rings[j][i], b = rings[j + 1][i], c = rings[j][next], d = rings[j + 1][next];
    const u = i / sides, v = (i + 1) / sides;
    triangle(a, b, c, [u, a[1] / maxY, u, b[1] / maxY, v, c[1] / maxY]);
    triangle(c, b, d, [v, c[1] / maxY, u, b[1] / maxY, v, d[1] / maxY]);
  }
  if (cap) {
    for (const [which, flip] of [[0, true], [rings.length - 1, false]]) {
      const vertices = rings[which];
      const center = vertices.reduce((sum, p) => sum.map((v, i) => v + p[i] / sides), [0, 0, 0]);
      for (let i = 0; i < sides; i++) {
        const a = vertices[i], b = vertices[(i + 1) % sides];
        triangle(...(flip ? [a, b, center] : [a, center, b]), [0, 0, 1, 0, 0.5, 1]);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}

function ellipse(rx, rz, y, count = 64, cx = 0, cz = 0) {
  return Array.from({ length: count }, (_, i) => { const a = i / count * Math.PI * 2; return [cx + rx * Math.cos(a), y, cz + rz * Math.sin(a)]; });
}


export { Part, mix, standard, lineMaterial, polygon, ring, loft, ellipse };
