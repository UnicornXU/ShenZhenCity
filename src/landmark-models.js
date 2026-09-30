import * as THREE from 'three';
import { Part, mix, standard, lineMaterial, polygon, ring, loft, ellipse } from './landmark-geometry.js';
import { districtBuilders } from './district-models.js';

function addPitch(part, x, z, width, depth, y, mats, runningTrack = false) {
  if (runningTrack) {
    part.add(new THREE.CircleGeometry(1, 64), mats.track, [x, y, z], [-Math.PI / 2, 0, 0], [width * 0.78, depth * 0.9, 1]);
    for (let lane = 0; lane < 5; lane++) part.line(ellipse(width * (0.67 + lane * 0.023), depth * (0.73 + lane * 0.035), y + 0.01, 64, x, z), mats.paint, true);
  }
  part.box(x, y + 0.025, z, width, 0.035, depth, mats.grass);
  for (let i = 0; i < 8; i += 2) part.box(x - width / 2 + width / 8 * (i + 0.5), y + 0.047, z, width / 8, 0.012, depth, mats.grassLight);
  const w = width * 0.47, d = depth * 0.46, py = y + 0.06;
  part.line([[x - w, py, z - d], [x + w, py, z - d], [x + w, py, z + d], [x - w, py, z + d]], mats.paint, true);
  part.line([[x, py, z - d], [x, py, z + d]], mats.paint);
  part.line(ellipse(depth * 0.15, depth * 0.15, py, 32, x, z), mats.paint, true);
  for (const side of [-1, 1]) {
    part.line([[x + w * side, py, z - d * 0.55], [x + w * side * 0.72, py, z - d * 0.55], [x + w * side * 0.72, py, z + d * 0.55], [x + w * side, py, z + d * 0.55]], mats.paint);
    const gx = x + w * side;
    part.beam([gx, py, z - depth * 0.11], [gx, py + 0.35, z - depth * 0.11], 0.025, mats.steel);
    part.beam([gx, py + 0.35, z - depth * 0.11], [gx, py + 0.35, z + depth * 0.11], 0.025, mats.steel);
    part.beam([gx, py + 0.35, z + depth * 0.11], [gx, py, z + depth * 0.11], 0.025, mats.steel);
  }
}

function pingan(part, h, m) {
  const levels = [[0.6, 3], [h * 0.28, 2.94], [h * 0.67, 2.55], [h * 0.86, 2.07], [h * 0.94, 1.45], [h, 0.17]];
  const rings = levels.map(([y, r]) => ring(polygon(r, 0.32), y));
  part.add(loft(rings), m.glass);
  const section = y => {
    const i = Math.min(levels.findIndex(level => level[0] >= y), levels.length - 1);
    if (i <= 0) return rings[0];
    return rings[i - 1].map((p, j) => mix(p, rings[i][j], (y - levels[i - 1][0]) / (levels[i][0] - levels[i - 1][0])));
  };
  for (let i = 0; i < 8; i++) {
    for (let j = 1; j < rings.length; j++) part.beam(rings[j - 1][i], rings[j][i], 0.085, m.steel);
  }
  for (let y = 1; y < h - 1; y += 0.49) part.line(section(y), m.mullion, true);
  for (const face of [1, 3, 5, 7]) {
    const next = (face + 1) % 8;
    for (let k = 1; k < 10; k++) part.line(rings.map(points => mix(points[face], points[next], k / 10)), m.mullion);
    for (const t of [0.16, 0.84]) {
      const path = rings.map(points => mix(points[face], points[next], t));
      for (let i = 1; i < path.length; i++) part.beam(path[i - 1], path[i], 0.055, m.steel);
    }
  }
  for (const y of [h * 0.29, h * 0.53, h * 0.73, h * 0.86]) {
    part.line(section(y), m.darkLine, true);
    part.line(section(y + 0.25), m.darkLine, true);
  }
  for (let level = 0; level < 4; level++) part.box(0, 0.3 + level * 0.28, 0.6, 13 - level * 1.15, 0.28, 10 - level * 0.85, m.stone);
  part.box(5.05, 6.6, 0.9, 2.4, 12, 3.7, m.glass);
  part.box(5.05, 12.7, 0.9, 2.6, 0.22, 3.9, m.steel);
}

function spring(part, h, m) {
  const radius = y => { const t = y / h; return 2.7 * Math.sqrt(Math.max(0.0002, 1 - t ** 3.35)) * (1 + 0.1 * Math.sin(t * Math.PI)); };
  const profiles = Array.from({ length: 55 }, (_, i) => { const y = i / 54 * h; return new THREE.Vector2(radius(y), y + 0.4); });
  part.add(new THREE.LatheGeometry(profiles, 64), m.glass);
  for (let column = 0; column < 56; column++) {
    const a = column / 56 * Math.PI * 2;
    const points = Array.from({ length: 28 }, (_, i) => { const y = h * i / 27; const r = radius(y) + 0.025; return [Math.sin(a) * r, y + 0.4, Math.cos(a) * r]; });
    for (let i = 1; i < points.length; i++) part.beam(points[i - 1], points[i], 0.025, m.steel);
    for (const [start, end] of [[0.35, h * 0.16], [h * 0.79, h * 0.995]]) {
      const b = a + (column % 2 ? -1 : 1) * Math.PI / 28;
      part.line([[Math.sin(a) * radius(start), start + 0.4, Math.cos(a) * radius(start)], [Math.sin(b) * radius(end), end + 0.4, Math.cos(b) * radius(end)]], m.lightLine);
    }
  }
  for (let y = 1; y < h - 0.4; y += 0.42) part.line(ellipse(radius(y) + 0.02, radius(y) + 0.02, y + 0.4), m.mullion, true);
  part.add(new THREE.CylinderGeometry(4.4, 4.8, 0.5, 48), m.stone, [0, 0.25, 0]);
  part.box(-4, 0.45, 1.9, 3.5, 0.9, 5.5, m.glass);
}

function kk100(part, h, m) {
  const count = 40;
  const contour = y => {
    const t = y / h;
    const shrink = t > 0.81 ? Math.sqrt(Math.max(0.001, 1 - ((t - 0.81) / 0.19) ** 2)) : 1;
    return Array.from({ length: count }, (_, i) => {
      const a = i / count * Math.PI * 2;
      const c = Math.cos(a), s = Math.sin(a);
      return [Math.sign(c) * Math.abs(c) ** 0.52 * 2.35 * shrink, y + 0.5, Math.sign(s) * Math.abs(s) ** 0.52 * 3.1 * shrink - 0.9 * t ** 4];
    });
  };
  const rings = Array.from({ length: 38 }, (_, i) => contour(h * i / 37));
  part.add(loft(rings), m.glass);
  for (let y = 0.8; y < h - 0.4; y += 0.4) part.line(contour(y), m.mullion, true);
  for (let i = 0; i < count; i += 2) part.line(rings.map(points => points[i]), m.lightLine);
  for (const i of [3, 17, 23, 37]) for (let j = 1; j < rings.length; j++) part.beam(rings[j - 1][i], rings[j][i], 0.038, m.steel);
  for (const y of [h * 0.71, h * 0.82, h * 0.89]) part.line(contour(y), m.darkLine, true);
  for (let i = 0; i < 3; i++) part.box(0, 0.28 + i * 0.4, 0, 11 - i, 0.4, 9 - i, i === 2 ? m.glass : m.stone);
}

function shunhing(part, h, m) {
  const bodyH = h - 4.5;
  part.box(0, bodyH / 2 + 0.8, 0, 5.5, bodyH, 3.6, m.glass);
  for (const x of [-2.5, 2.5]) {
    part.add(new THREE.CylinderGeometry(1.18, 1.18, bodyH + 1, 24), m.glass, [x, bodyH / 2 + 1, 0]);
    for (let y = 1; y < bodyH + 1; y += 0.45) part.line(ellipse(1.2, 1.2, y, 28, x), m.mullion, true);
    for (let i = 0; i < 4; i++) part.add(new THREE.CylinderGeometry(1.26 - i * 0.07, 1.29 - i * 0.07, 0.25, 24), m.steel, [x, bodyH + 1.5 + i * 0.32, 0]);
    part.add(new THREE.CylinderGeometry(0.065, 0.15, 2.75, 8), m.steel, [x, h - 1.2, 0]);
  }
  for (let y = 1; y < bodyH + 1; y += 0.45) for (const z of [-1.82, 1.82]) part.line([[-2.5, y, z], [2.5, y, z]], m.mullion);
  for (const z of [-1.84, 1.84]) for (const x of [-2, -0.65, 0.65, 2]) part.beam([x, 1, z], [x, bodyH + 1, z], 0.04, m.steel);
  part.box(0, bodyH + 0.5, 0, 3.3, 1.6, 3.7, m.steel);
  part.box(0, 0.4, 0, 13.5, 0.8, 9, m.stone);
  part.box(5.15, 6.6, -1, 2.4, 12, 4.4, m.glass);
}

function civic(part, m) {
  const roof = standard('blue_wing_roof', '#346477', { metalness: 0.45, roughness: 0.5, side: THREE.DoubleSide });
  const underside = standard('warm_roof_soffit', '#c28b4b', { side: THREE.DoubleSide });
  const red = standard('red_square_tower', '#b74837');
  const yellow = standard('yellow_round_tower', '#daa843');
  for (const x of [-10, 10]) {
    part.box(x, 1.65, 0, 10, 3.3, 7.3, m.glass);
    for (let y = 0.7; y < 3.4; y += 0.52) part.box(x, y, 3.7, 10, 0.065, 0.08, m.stone);
    for (let offset = -4.5; offset <= 4.5; offset += 1.5) part.box(x + offset, 1.75, 3.85, 0.15, 3.5, 0.22, m.stone);
  }
  const height = (x, z) => 4.25 + 2.2 * (Math.abs(x) / 16.8) ** 2.3 + 0.26 * Math.cos(z / 4.5 * Math.PI);
  const rows = Array.from({ length: 13 }, (_, j) => Array.from({ length: 69 }, (_, i) => { const x = -16.8 + i / 68 * 33.6, z = -4.6 + j / 12 * 9.2; return [x, height(x, z), z]; }));
  const positions = [];
  for (let j = 0; j < rows.length - 1; j++) for (let i = 0; i < 68; i++) positions.push(...rows[j][i], ...rows[j + 1][i], ...rows[j][i + 1], ...rows[j][i + 1], ...rows[j + 1][i], ...rows[j + 1][i + 1]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  part.add(geo.clone(), roof);
  part.add(geo, underside, [0, -0.2, 0]);
  for (let x = -16; x <= 16; x += 1) part.line(Array.from({ length: 17 }, (_, i) => { const z = -4.6 + i / 16 * 9.2; return [x, height(x, z) + 0.025, z]; }), m.darkLine);
  for (const z of [-4.6, 4.6]) part.line(Array.from({ length: 69 }, (_, i) => { const x = -16.8 + i / 68 * 33.6; return [x, height(x, z), z]; }), m.lightLine);
  part.add(new THREE.CylinderGeometry(1.35, 1.35, 8.1, 40), yellow, [-2.9, 4.05, -0.4]);
  part.box(2.8, 4.2, -0.4, 2.6, 8.4, 2.6, red);
  for (let y = 1; y < 8; y += 0.6) {
    part.line(ellipse(1.36, 1.36, y, 40, -2.9, -0.4), m.darkLine, true);
    part.line([[1.49, y, 0.91], [4.11, y, 0.91]], m.darkLine);
  }
  for (let stair = 0; stair < 5; stair++) part.box(0, 0.06 + stair * 0.08, 8.3 - stair * 0.5, 16, 0.12, 2.8, m.stone);
  part.box(0, 0.1, 0, 34, 0.2, 10, m.stone);
}

function cocoon(part, m) {
  const rings = [];
  const divisions = 72, levels = 14;
  for (let level = 0; level <= levels; level++) {
    const t = level / levels;
    rings.push(Array.from({ length: divisions }, (_, i) => {
      const a = i / divisions * Math.PI * 2;
      const x = THREE.MathUtils.lerp(-4.6 + Math.cos(a) * 6.5, Math.cos(a) * 14.5, t);
      const z = Math.sin(a) * THREE.MathUtils.lerp(3.8, 6.4, t);
      const y = 0.85 + 4.7 * Math.sqrt(Math.max(0, 1 - (x / 14.55) ** 2 - (z / 6.45) ** 2));
      return [x, y, z];
    }));
  }
  const shell = loft(rings, false);
  part.add(shell, m.roof);
  part.line(rings[0], m.lightLine, true);
  part.line(rings.at(-1), m.lightLine, true);
  for (let j = 0; j < levels; j++) for (let i = 0; i < divisions; i++) {
    const p = rings[j][i].map((v, k) => k === 1 ? v + 0.04 : v);
    for (const delta of [-1, 1]) part.line([p, rings[j + 1][(i + delta + divisions) % divisions].map((v, k) => k === 1 ? v + 0.04 : v)], m.lightLine);
  }
  for (let i = 0; i < divisions; i += 3) part.beam([rings.at(-1)[i][0], 0.3, rings.at(-1)[i][2]], rings.at(-1)[i], 0.04, m.steel);
  for (let tier = 0; tier < 6; tier++) {
    part.add(new THREE.RingGeometry(0.89, 1, 64), m.seat, [-4.6, 0.55 + tier * 0.26, 0], [-Math.PI / 2, 0, 0], [5.3 + tier * 0.17, 2.7 + tier * 0.13, 1]);
  }
  addPitch(part, -4.6, 0, 8, 4, 0.35, m);
  part.add(new THREE.CylinderGeometry(1, 1, 0.32, 72), m.stone, [0, 0.16, 0], [0, 0, 0], [15.2, 1, 7]);
}

function triangularGrid(part, a, b, c, mat, divisions = 4) {
  for (let i = 1; i < divisions; i++) {
    const t = i / divisions;
    part.line([mix(a, b, t), mix(a, c, t)], mat);
    part.line([mix(b, a, t), mix(b, c, t)], mat);
    part.line([mix(c, a, t), mix(c, b, t)], mat);
  }
}

function crystalVenue(parent, name, x, z, rx, rz, h, type, m) {
  const part = new Part(name, parent, [x, 0.4, z]);
  const count = type === 'pool' ? 16 : 28;
  const point = (i, radius, y, stagger = 0) => {
    const a = (i + stagger) / count * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    const power = type === 'pool' ? 0.28 : 1;
    return [Math.sign(c) * Math.abs(c) ** power * rx * radius, y, Math.sign(s) * Math.abs(s) ** power * rz * radius];
  };
  const bottom = Array.from({ length: count }, (_, i) => point(i, 0.85, 0));
  const mid = Array.from({ length: count }, (_, i) => point(i, 1.025, h * 0.42, 0.5));
  const crest = Array.from({ length: count }, (_, i) => point(i, 0.88, h * (i % 2 ? 0.9 : 1.12)));
  const inner = Array.from({ length: count }, (_, i) => point(i, type === 'stadium' ? 0.59 : 0.17, h * (type === 'stadium' ? 0.73 : 0.85)));
  const meshes = [[], [], []];
  const addTriangle = (a, b, c, index) => {
    meshes[index % 3].push(...a, ...b, ...c);
    part.line([a, b, c], m.lightLine, true);
    triangularGrid(part, a, b, c, m.crystalGrid, 4);
  };
  for (const [j, rings] of [[0, [bottom, mid]], [1, [mid, crest]], [2, [crest, inner]]]) {
    for (let i = 0; i < count; i++) {
      const k = (i + 1) % count;
      addTriangle(rings[0][i], rings[1][i], rings[0][k], i + j);
      addTriangle(rings[0][k], rings[1][i], rings[1][k], i + j + 1);
    }
  }
  if (type !== 'stadium') for (let i = 0; i < count; i++) addTriangle(inner[i], [0, h * 0.9, 0], inner[(i + 1) % count], i);
  meshes.forEach((positions, i) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.computeVertexNormals();
    part.add(geo, m.crystal[i]);
  });
  if (type === 'stadium') {
    for (let tier = 0; tier < 8; tier++) part.add(new THREE.RingGeometry(0.91, 1, 64), m.seat, [0, 0.4 + tier * 0.32, 0], [-Math.PI / 2, 0, 0], [rx * (0.57 + tier * 0.022), rz * (0.55 + tier * 0.025), 1]);
    addPitch(part, 0, 0, rx * 0.87, rz * 0.78, 0.2, m, true);
  }
  part.finish();
}

function universiade(part, m) {
  crystalVenue(part.group, '大运中心主体育场', -8.2, 1, 10.7, 7.6, 6.6, 'stadium', m);
  crystalVenue(part.group, '大运中心体育馆', 10.7, -4.7, 6.5, 5.6, 6.6, 'arena', m);
  crystalVenue(part.group, '大运中心游泳馆', 11, 7.4, 5.7, 3.1, 4.1, 'pool', m);
  part.add(new THREE.CircleGeometry(1, 64), m.water, [-5, 0.32, -9.2], [-Math.PI / 2, 0, 0], [7.5, 2.4, 1]);
  part.box(-7.6, 0.42, -8.7, 1.6, 0.25, 5, m.stone);
}

function redcube(part, m) {
  // Four separate leaning volumes, continuous dark ribbon windows, red metal ribs.
  const red = standard('red_corrugated_cladding', '#8d2438', { metalness: 0.3, roughness: 0.48 });
  const redRib = lineMaterial('#bb6670');
  const concrete = standard('roof_terrace', '#b1b1aa');
  for (let building = 0; building < 4; building++) {
    const center = -13.2 + building * 8.7;
    const h = [5.7, 6.5, 6, 6.8][building];
    const contour = y => polygon(1, 0.11).map(([x, z]) => [center + x * (3.3 + y / h * 0.55) + y / h * (building % 2 ? -0.8 : 0.8), y, z * (2.7 + y / h * 0.3) - y / h * 1.15]);
    const rings = [0.9, 1.5, 2.6, 3.8, h].map(contour);
    part.add(loft(rings), red);
    part.box(center, 0.7, 0, 5.8, 1.4, 4.6, m.glass);
    for (const y of [1.65, 3.25, 4.65]) {
      if (y > h) continue;
      const stripe = [contour(y), contour(y + 0.12)].map(points => points.map(p => [center + (p[0] - center) * 1.004, p[1], p[2] * 1.008]));
      part.add(loft(stripe, false), m.ribbon);
      part.line(contour(y + 0.17), m.lightLine, true);
    }
    for (let side = 0; side < 8; side++) for (let i = 0; i <= 20; i++) {
      part.line(rings.map(points => mix(points[side], points[(side + 1) % 8], i / 20)), redRib);
    }
    part.add(loft([contour(h + 0.035), contour(h + 0.13)]), concrete);
    for (let i = 0; i < 4; i++) part.box(center - 1.5 + i * 0.85, h + 0.22, -1, 0.58, 0.2, 1.6, m.roof);
    part.box(center, 0.15, 4.7, 6.8, 0.2, 1.8, m.stone);
  }
}

export function buildLandmark(item, { environment = null, water }) {
  const nightMaterials = [];
  const glow = (mat, strength) => { mat.userData.nightGlow = strength; nightMaterials.push(mat); return mat; };
  const glassColor = item.id === 'shunhing' ? '#368d86' : item.id === 'kk100' ? '#507080' : '#76939e';
  const m = {
    glass: glow(standard('curtain_wall_glass', glassColor, { metalness: 0.62, roughness: 0.26, envMap: environment, envMapIntensity: 0.7, emissive: '#96c7d6' }), 0.12),
    steel: standard('silver_structure', '#c7d0d0', { metalness: 0.72, roughness: 0.32, envMap: environment, envMapIntensity: 0.5 }),
    stone: standard('plaza_stone', '#d9d8cc', { roughness: 0.92, metalness: 0 }),
    roof: standard('pearl_roof', '#d4dcde', { side: THREE.DoubleSide, metalness: 0.35, roughness: 0.54 }),
    seat: standard('stadium_seating', '#91aabd'),
    grass: standard('pitch_green', '#527f46', { metalness: 0, roughness: 1 }),
    grassLight: standard('pitch_mowing_stripe', '#709852', { metalness: 0, roughness: 1 }),
    track: standard('running_track', '#b87865', { metalness: 0, roughness: 1 }),
    ribbon: glow(standard('ribbon_windows', '#314a51', { metalness: 0.5, roughness: 0.3, emissive: '#edca8a' }), 0.6),
    lightLine: lineMaterial('#c6d3d5'),
    darkLine: lineMaterial('#52646a'),
    mullion: lineMaterial('#9caeb6'),
    crystalGrid: lineMaterial('#8cb2b8'),
    paint: lineMaterial('#f0efdb'),
    water,
  };
  m.crystal = ['#50868d', '#76a6ac', '#aec5c6'].map((color, i) => glow(standard(`crystal_panel_${i}`, color, { metalness: 0.48, roughness: 0.38, envMap: environment, envMapIntensity: 0.55, emissive: '#9cdae0', side: THREE.DoubleSide }), 0.24));
  const root = new Part(item.name);
  const footprint = item.footprint ?? [8, 7];
  root.box(0, 0.12, 0, footprint[0] * 2 - 1, 0.24, footprint[1] * 2 - 1, m.stone);
  const builders = { spire: () => pingan(root, item.height, m), bamboo: () => spring(root, item.height, m), arch: () => kk100(root, item.height, m), twin: () => shunhing(root, item.height, m), wing: () => civic(root, m), oval: () => cocoon(root, m), crystal: () => universiade(root, m), redcube: () => redcube(root, m), ...Object.fromEntries(Object.entries(districtBuilders).map(([kind, builder]) => [kind, () => builder(root, m)])) };
  if (!builders[item.kind]) throw new Error(`Unknown landmark geometry: ${item.kind}`);
  builders[item.kind]();
  const group = root.finish();
  group.userData = { landmarkId: item.id, modelVersion: 3, modeling: 'reference-informed procedural geometry' };
  return { group, nightMaterials };
}
