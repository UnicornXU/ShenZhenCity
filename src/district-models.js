import * as THREE from 'three';
import { standard, lineMaterial, ring, loft } from './landmark-geometry.js';

// Public exterior references are listed in architecture-references.md.
// Dimensions and campus spacing are compressed to the city diorama scale.
function surface(part, point, nu, nv, mat) {
  const positions = [];
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const a = point(i / nu, j / nv), b = point((i + 1) / nu, j / nv);
    const c = point(i / nu, (j + 1) / nv), d = point((i + 1) / nu, (j + 1) / nv);
    positions.push(...a, ...b, ...c, ...b, ...d, ...c);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  part.add(geo, mat);
}

function tree(part, x, z, m, y = 0.3, scale = 1) {
  part.add(new THREE.CylinderGeometry(0.07, 0.11, 1.1, 5), m.stone, [x, y + 0.55 * scale, z], [0, 0, 0], [scale, scale, scale]);
  part.add(new THREE.IcosahedronGeometry(0.68, 1), m.grass, [x, y + 1.5 * scale, z], [0, x, 0], [scale, scale, scale]);
}

function facade(part, x, z, w, d, bottom, top, m, floor = 0.52) {
  part.box(x, (top + bottom) / 2, z, w, top - bottom, d, m.glass);
  for (let y = bottom; y <= top; y += floor) part.line([[x - w / 2, y, z - d / 2 - 0.01], [x + w / 2, y, z - d / 2 - 0.01], [x + w / 2 + 0.01, y, z + d / 2 + 0.01], [x - w / 2, y, z + d / 2 + 0.01]], m.lightLine, true);
  for (let dx = -w / 2; dx <= w / 2; dx += 0.46) for (const side of [-1, 1]) part.line([[x + dx, bottom, z + side * (d / 2 + 0.015)], [x + dx, top, z + side * (d / 2 + 0.015)]], m.mullion);
  for (let dz = -d / 2; dz <= d / 2; dz += 0.46) for (const side of [-1, 1]) part.line([[x + side * (w / 2 + 0.015), bottom, z + dz], [x + side * (w / 2 + 0.015), top, z + dz]], m.mullion);
}

function barrel(part, { x = 0, z = 0, length, width, height, axis = 'z' }, m) {
  const point = (u, v, lift = 0) => {
    const angle = u * Math.PI;
    const along = (v - 0.5) * length;
    const taper = 0.82 + 0.18 * Math.sin(v * Math.PI);
    const across = Math.cos(angle) * width * taper / 2;
    const y = 1.25 + Math.sin(angle) * (height + lift) * (0.9 + 0.1 * Math.sin(v * Math.PI));
    return axis === 'z' ? [x + across, y, z + along] : [x + along, y, z + across];
  };
  surface(part, point, 24, 36, m.roof);
  // Hexagonal panel network follows the curved double skin.
  for (let row = 0; row < 28; row++) for (let col = 0; col < 11; col++) {
    const u = (col + 0.5 + (row % 2) * 0.5) / 12;
    const v = (row + 0.6) / 29;
    const points = Array.from({ length: 6 }, (_, i) => {
      const a = i * Math.PI / 3;
      return point(u + Math.cos(a) * 0.042, v + Math.sin(a) * 0.019, 0.025);
    });
    part.line(points, m.crystalGrid, true);
  }
  for (const v of [0, 1]) {
    const outline = Array.from({ length: 25 }, (_, i) => point(i / 24, v));
    const center = axis === 'z' ? [x, 1.25, z + (v - 0.5) * length] : [x + (v - 0.5) * length, 1.25, z];
    const positions = [];
    for (let i = 1; i < outline.length; i++) positions.push(...center, ...outline[i - 1], ...outline[i]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.computeVertexNormals();
    const glazing = m.glass.clone(); glazing.side = THREE.DoubleSide;
    part.add(geo, glazing);
    part.line(outline, m.lightLine);
  }
}

function airport(part, m) {
  const apron = standard('airport_apron', '#a7b2af');
  part.box(0, 0.31, 0, 40, 0.12, 45, apron);
  barrel(part, { z: -1, length: 35, width: 6.2, height: 3.7 }, m);
  barrel(part, { z: -10, length: 33, width: 5.2, height: 3.5, axis: 'x' }, m);
  barrel(part, { z: 13, length: 12, width: 22, height: 4.1 }, m);
  for (const side of [-1, 1]) for (const z of [-17, -4, 3]) {
    part.box(side * 6, 1.2, z, 6.4, 0.9, 0.75, m.roof);
    part.box(side * 9.1, 0.9, z + 0.7, 0.85, 1.5, 2.2, m.roof);
    part.line([[side * 10.5, 0.4, z - 2], [side * 10.5, 0.4, z + 2]], m.paint);
  }
  for (let x = -12; x <= 12; x += 6) for (const z of [-13, -7]) part.box(x, 1.1, z + Math.sign(z + 10) * 2, 0.7, 0.9, 3.4, m.roof);
  part.box(0, 0.6, 21, 28, 0.55, 2.3, m.stone);
  for (let x = -17; x < 18; x += 2) part.line([[x, 0.4, 20], [x + 1, 0.4, 20]], m.paint);
}

function northStation(part, m) {
  const ballast = standard('railway_ballast', '#778480');
  const silver = standard('north_station_roof', '#d4dbd9', { side: THREE.DoubleSide });
  part.box(0, 0.3, 0, 34, 0.14, 42, ballast);
  for (let track = 0; track < 20; track++) {
    const x = (track - 9.5) * 1.45;
    for (const rail of [-0.21, 0.21]) part.line([[x + rail, 0.44, -21], [x + rail, 0.44, 21]], m.lightLine);
    for (let z = -20; z < 22; z += 1.2) part.line([[x - 0.4, 0.4, z], [x + 0.4, 0.4, z]], m.darkLine);
    if (track % 2 === 0) {
      part.box(x + 0.75, 0.55, 0, 0.55, 0.22, 39, m.stone);
      for (const z of [-15, 15]) part.box(x + 0.75, 2.2, z, 1.15, 0.15, 10, m.roof);
    }
  }
  facade(part, 0, 0, 27, 16, 1, 5.5, m);
  const point = (u, v) => {
    const x = (u - 0.5) * 34, z = (v - 0.5) * 21;
    return [x, 6.45 - 2.3 * (1 - Math.abs(x / 17) ** 1.7) * Math.abs(z / 10.5) ** 3, z];
  };
  surface(part, point, 40, 18, silver);
  part.box(0, 6.55, 0, 34, 0.18, 21, m.roof);
  for (let x = -17; x <= 17; x += 0.42) {
    part.line([[x, 6.66, -10.5], [x, 6.66, 10.5]], m.mullion);
    for (const side of [-1, 1]) part.line([[x, 6.55, side * 10.51], point((x + 17) / 34, side < 0 ? 0 : 1)], m.lightLine);
  }
  for (const side of [-1, 1]) {
    part.box(side * 19, 0.7, 0, 3, 1.1, 18, m.stone);
    for (let z = -7; z <= 7; z += 2) tree(part, side * 19, z, m, 1.3, 0.7);
  }
}

function archWall(part, width, height, depth, opening, mat, z = 0) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0); shape.lineTo(-width / 2, height); shape.lineTo(width / 2, height); shape.lineTo(width / 2, 0); shape.lineTo(opening, 0);
  for (let i = 0; i <= 36; i++) { const a = i / 36 * Math.PI; shape.lineTo(Math.cos(a) * opening, Math.sin(a) * opening * 0.84); }
  shape.lineTo(-width / 2, 0);
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, steps: 1 });
  part.add(geo, mat, [0, 0.35, z]);
}

function guangming(part, m) {
  const white = standard('guangming_white_stone', '#ecebe3');
  const warm = standard('eye_warm_lining', '#caa779', { side: THREE.DoubleSide });
  // Courtyard blocks leave open voids under the continuous white roof.
  for (const x of [-11.1, 11.1]) facade(part, x, -1.5, 5.7, 20, 0.4, 8.1, m);
  facade(part, 0, -9, 17, 5, 0.4, 8.1, m);
  facade(part, -3, -1.5, 6, 8, 0.4, 7, m);
  for (const x of [-11.1, 11.1]) part.box(x, 8.25, -1.5, 6.1, 0.3, 21, white);
  part.box(0, 8.25, -9, 17, 0.3, 5.4, white);
  part.box(-3, 7.15, -1.5, 6.3, 0.3, 8.3, white);
  archWall(part, 28, 8, 1.2, 6.1, white, 8.1);
  surface(part, (u, v) => { const a = u * Math.PI; return [Math.cos(a) * 6.07, 0.35 + Math.sin(a) * 5.08, 6.4 + v * 2.9]; }, 40, 3, warm);
  for (let i = 0; i <= 40; i++) {
    const a = i / 40 * Math.PI;
    part.line([[Math.cos(a) * 6.04, 0.35 + Math.sin(a) * 5.04, 6.4], [Math.cos(a) * 6.04, 0.35 + Math.sin(a) * 5.04, 9.4]], m.lightLine);
  }
  for (let x = -14; x <= 14; x += 0.6) for (const z of [-11.8, 9.32]) {
    const bottom = z > 0 && Math.abs(x) < 6.1 ? 0.4 + Math.sqrt(1 - (x / 6.1) ** 2) * 5.12 : 0.4;
    part.line([[x, bottom, z], [x, 8.3, z]], m.lightLine);
  }
  part.box(0, 0.3, 11.5, 27, 0.1, 3.5, m.water);
  for (let i = 0; i < 5; i++) part.box(-10, 0.35 + i * 0.11, 6 - i * 0.65, 6, 0.15, 0.65, m.stone);
  for (const [x, z] of [[5, -1], [-3, -1.5]]) { part.box(x, 7.35, z, 3, 0.15, 3, m.grass); tree(part, x, z, m, 7.4, 0.55); }
}

function pingshan(part, m) {
  const aluminium = standard('pingshan_perforated_aluminium', '#afbfc5');
  const theatre = standard('pingshan_dark_red_wood', '#793d35');
  facade(part, 0, 0, 22, 17, 0.5, 8.3, m);
  part.box(0, 5.4, -1, 10, 10, 10, theatre);
  // A porous drama box: a large cut-out foyer and an external ascending path.
  for (const x of [-10.65, 10.65]) part.box(x, 5.7, 0, 0.65, 5.5, 17.2, aluminium);
  part.box(0, 7.4, 8.7, 22, 2.6, 0.4, aluminium);
  part.box(-8.5, 3.8, 8.7, 5, 7.2, 0.4, aluminium);
  part.box(0, 8.8, 0, 22.5, 0.3, 17.6, aluminium);
  for (let x = -11; x <= 11; x += 0.23) {
    part.line([[x, 6.1, 8.94], [x, 8.75, 8.94]], m.lightLine);
    part.line([[x, 0.5, -8.72], [x, 8.75, -8.72]], m.lightLine);
  }
  for (let z = -8.5; z <= 8.5; z += 0.27) for (const side of [-1, 1]) part.line([[side * 11.02, 3, z], [side * 11.02, 8.8, z]], m.lightLine);
  for (let i = 0; i < 25; i++) part.box(-4.2 + i * 0.55, 0.45 + i * 0.105, 9.8, 0.56, 0.15, 2, m.stone);
  part.line([[-4.4, 1.1, 10.8], [9.3, 3.65, 10.8], [11.8, 3.65, 10.8], [11.8, 8.8, -6]], m.lightLine);
  for (let i = 0; i < 29; i++) part.box(11.5, 3.1 + i * 0.195, 9.5 - i * 0.54, 1.7, 0.15, 0.55, m.stone);
  for (const x of [-8, 8]) { part.box(x, 9, -1, 3.1, 0.15, 12, m.grass); for (const z of [-5, 1, 4]) tree(part, x, z, m, 9.1, 0.65); }
  for (let x = -4.8; x <= 5; x += 0.3) part.line([[x, 8.9, 4.02], [x, 10.4, 4.02]], m.darkLine);
}

function tiledRoof(part, x, y, z, w, d, rise, m) {
  const point = (u, v) => {
    const across = (v - 0.5) * 2;
    return [x + (u - 0.5) * w, y + rise * (1 - Math.abs(across)) + 0.24 * Math.abs(across) ** 6 + 0.25 * Math.abs(u * 2 - 1) ** 7, z + across * d / 2];
  };
  surface(part, point, 24, 12, m);
  const tile = lineMaterial('#999e91');
  for (let i = 0; i <= 32; i++) part.line(Array.from({ length: 13 }, (_, j) => point(i / 32, j / 12)), tile);
  part.line(Array.from({ length: 25 }, (_, i) => point(i / 24, 0.5)), tile);
}

function dapeng(part, m) {
  const brick = standard('dapeng_old_brick', '#9a8b78');
  const redBrick = standard('dapeng_restored_brick', '#a18269');
  const wood = standard('dapeng_gate_timber', '#664d3b');
  const tile = standard('dapeng_grey_tiles', '#626d66', { side: THREE.DoubleSide });
  // Open arched passage, layered masonry, parapets and the timber gate pavilion.
  archWall(part, 24, 3.8, 3.6, 1.55, brick, 4.5);
  for (const x of [-9.6, 9.6]) part.box(x, 2.7, 7.2, 4.5, 5, 4.5, redBrick);
  part.box(0, 4.4, 6.3, 15, 0.6, 3.9, redBrick);
  for (let x = -12; x <= 12; x += 1.55) part.box(x, Math.abs(x) > 7.5 ? 5.5 : 5.05, 8.25, 0.85, 0.85, 0.7, brick);
  for (let row = 0; row < 10; row++) {
    const y = 0.6 + row * 0.4;
    for (const side of [-1, 1]) part.line([[side * 1.8, y, 8.12], [side * 7.35, y, 8.12]], m.darkLine);
    for (let x = -11.5; x < 12; x += 1.3) if (Math.abs(x) > 2) part.line([[x + (row % 2) * 0.4, y, 8.14], [x + (row % 2) * 0.4, y + 0.4, 8.14]], m.darkLine);
  }
  part.box(0, 5.6, 6.3, 11.4, 1.9, 3.3, wood);
  for (let x = -5; x <= 5; x += 1.4) {
    part.box(x, 5.65, 8.02, 0.12, 1.9, 0.16, m.stone);
    if (Math.abs(x) > 1.4) part.box(x + 0.45, 5.7, 8.04, 0.7, 0.95, 0.06, m.ribbon);
  }
  tiledRoof(part, 0, 6.4, 6.3, 14.6, 5.3, 1.5, tile);
  for (const side of [-1, 1]) part.box(side * 15, 2.2, 6, 6, 4.1, 2.7, brick);
  for (const z of [-7, -1]) for (const x of [-12, -6, 6, 12]) {
    part.box(x, 1.55, z, 4.5, 2.6, 4.5, m.stone);
    tiledRoof(part, x, 2.8, z, 5, 5, 1, tile);
    part.box(x, 1.4, z + 2.26, 0.8, 1.8, 0.1, wood);
  }
  part.box(0, 0.3, -1, 3.1, 0.1, 15, m.stone);
}

function yantian(part, m) {
  const blue = standard('yantian_crane_blue', '#387f96', { metalness: 0.48 });
  const dock = standard('yantian_dock_concrete', '#9ca9a6');
  const boxes = ['#a25d46', '#608998', '#d4ba72', '#718e6d', '#a9b7b9'].map((c, i) => standard(`container_${i}`, c));
  part.box(0, 0.3, -4, 43, 0.3, 22, dock);
  part.box(0, 0.32, 10.7, 43, 0.12, 7.4, m.water);
  for (let x = -19; x < 20; x += 3.5) for (let z = -12; z < 0; z += 2) {
    const index = Math.round((x + 20) / 3.5 + z + 15);
    const h = 0.65 + index % 3 * 0.55;
    part.box(x, 0.5 + h / 2, z, 2.8, h, 1.15, boxes[index % boxes.length]);
    for (let dx = -1.2; dx < 1.3; dx += 0.3) part.line([[x + dx, 0.5, z + 0.585], [x + dx, 0.5 + h, z + 0.585]], m.darkLine);
  }
  for (const x of [-15, -5, 5, 15]) {
    for (const dx of [-1.6, 1.6]) for (const z of [1.2, 5.2]) {
      part.beam([x + dx, 0.5, z], [x + dx * 0.62, 8, z - 0.4], 0.14, blue);
      part.box(x + dx, 0.7, z, 0.6, 0.4, 1.2, dock);
    }
    for (const dx of [-1, 1]) {
      part.beam([x + dx, 7.9, -2.5], [x + dx, 7.9, 13.5], 0.15, blue);
      part.beam([x + dx, 7.9, 2.7], [x + dx, 12.5, 2.7], 0.13, blue);
      part.line([[x + dx, 12.5, 2.7], [x + dx, 7.9, 12.8]], m.lightLine);
      part.line([[x + dx, 12.5, 2.7], [x + dx, 7.9, -2.5]], m.lightLine);
    }
    for (const z of [-2, 1, 4, 7, 10, 13]) part.beam([x - 1, 7.9, z], [x + 1, 7.9, z], 0.09, blue);
    part.box(x, 7.45, 7.8, 1.4, 0.75, 1.3, m.roof);
    part.line([[x, 7.3, 8.2], [x, 3.7, 8.2]], m.darkLine);
  }
  const hull = standard('container_ship_hull', '#344e57');
  part.add(loft([ring([[-18, -2], [15, -2], [19, 0], [15, 2], [-18, 2]], 0.5), ring([[-19, -2.2], [15, -2.2], [20, 0], [15, 2.2], [-19, 2.2]], 1.9)]), hull, [0, 0, 10.8]);
  for (let x = -12; x < 15; x += 3.4) for (const z of [9.7, 11.8]) part.box(x, 2.65, z, 3.1, 1.45, 1.65, boxes[Math.abs(Math.round(x)) % 5]);
  part.box(-16.5, 3.4, 10.8, 2.2, 3.2, 3.7, m.roof);
  part.box(-16.5, 4.35, 10.8, 2.5, 0.65, 3.9, m.glass);
}

function huawei(part, m) {
  const darkGlass = standard('huawei_blue_glass', '#316f82', { metalness: 0.55, roughness: 0.25, envMap: m.glass.envMap, emissive: '#365967', emissiveIntensity: 0.12 });
  const edge = standard('huawei_silver_edge', '#aebec0', { metalness: 0.6 });
  // F1 has a gently concave broad elevation and projecting metal roof blades.
  const front = (u, y, back = false) => {
    const x = (u - 0.5) * 15;
    return [x, y, (back ? -2.4 : 2.4) - (1 - (x / 7.5) ** 2) * 1.7];
  };
  const contour = y => [...Array.from({ length: 25 }, (_, i) => front(i / 24, y, true)), ...Array.from({ length: 25 }, (_, i) => front(1 - i / 24, y))];
  part.add(loft([contour(0.8), contour(21)]), darkGlass);
  for (let y = 1; y < 21; y += 0.53) part.line(contour(y), m.mullion, true);
  for (let i = 0; i <= 42; i++) for (const back of [false, true]) part.line([front(i / 42, 0.8, back), front(i / 42, 21, back)], m.mullion);
  for (const x of [-7.65, 7.65]) part.box(x, 11, -0.8, 0.45, 21, 5.6, edge);
  for (const y of [21.05, 21.45, 21.85]) part.add(loft([contour(y), contour(y + 0.13)]), edge, [0, 0, 0], [0, 0, 0], [1.05, 1, 1.12]);
  for (const x of [-11.8, 11.8]) {
    facade(part, x, -4.5, 5.1, 9, 0.5, 5.3, m);
    part.box(x, 5.45, -4.5, 5.7, 0.25, 9.5, m.roof);
  }
  part.box(0, 0.3, 6.8, 13, 0.1, 3.2, m.water);
  part.box(0, 0.42, 6.8, 1.7, 0.15, 5, m.stone);
  for (const x of [-15.5, 15.5]) for (const z of [-9, -5, 0, 5, 9]) tree(part, x, z, m, 0.3, 1.1);
}

function yungu(part, m) {
  const blue = standard('yungu_blue_curtain_wall', '#516f8d', { metalness: 0.6, roughness: 0.28, envMap: m.glass.envMap });
  const towerMats = { ...m, glass: blue };
  for (const [x, z, w, d, h] of [[-6.5, -5, 6.2, 5.1, 24], [6.2, -4.8, 5.7, 5.1, 19.5], [-6.5, 5.4, 6.4, 5, 13], [6.3, 5.4, 5.7, 5.1, 15.5]]) {
    facade(part, x, z, w, d, 2.6, h, towerMats, 0.55);
    for (const side of [-1, 1]) part.box(x + side * (w / 2 + 0.08), (h + 2.5) / 2, z, 0.26, h - 2.5, d + 0.3, m.steel);
    // Horizontal projecting bands and a stepped crown distinguish the campus towers.
    for (let y = 3; y < h; y += 1.6) part.box(x, y, z + d / 2 + 0.12, w + 0.3, 0.11, 0.26, m.roof);
    for (let crown = 0; crown < 3; crown++) part.box(x + crown * 0.42, h + crown * 0.22, z, w - crown * 1.1, 0.18, d + 0.4, m.steel);
    part.box(x, 1.5, z, w + 1.1, 2.7, d + 1.2, m.glass);
    part.box(x, 2.93, z, w + 1.4, 0.22, d + 1.5, m.grass);
  }
  for (const x of [-6.5, 6.3]) { part.box(x, 3.1, 0.1, 2.4, 0.35, 5.2, m.stone); for (const z of [-1.4, 1.5]) tree(part, x, z, m, 3.3, 0.65); }
  part.box(0, 0.3, 0, 3.2, 0.13, 24, m.stone);
  part.box(0, 0.4, 3, 2.1, 0.1, 6, m.water);
  for (const x of [-11.4, 11.4]) for (const z of [-10, -5, 0, 5, 10]) tree(part, x, z, m, 0.3, 0.85);
}

function ganfeng(part, m) {
  const glass = standard('ganfeng_blue_green_curtain_wall', '#477b88', { metalness: 0.58, roughness: 0.3, envMap: m.glass.envMap, envMapIntensity: 0.55 });
  const metal = standard('ganfeng_silver_fins', '#afc2c2', { metalness: 0.64, roughness: 0.34 });
  const towerMaterial = { ...m, glass };
  // Two research-office towers sit above a broad shared podium.
  part.box(0, 1.1, 0, 22, 2.2, 15, m.stone);
  part.box(0, 1.65, 0.1, 21.4, 1.1, 14.5, glass);
  part.box(0, 2.35, 0, 22.4, 0.22, 15.4, m.roof);
  for (const [x, z, width, depth, height] of [[-4.8, -0.8, 7.4, 6.8, 15.1], [4.7, 0.5, 7.1, 6.5, 16.3]]) {
    facade(part, x, z, width, depth, 2.45, height, towerMaterial, 0.55);
    // Slightly recessed mechanical floors and a slim parapet give each block a real roofline.
    for (const y of [height - 1.15, height - 0.75]) part.box(x, y, z, width + 0.16, 0.12, depth + 0.16, metal);
    part.box(x, height + 0.14, z, width + 0.28, 0.24, depth + 0.28, metal);
    part.box(x, height + 0.33, z, width * 0.58, 0.14, depth * 0.62, m.roof);
  }
  // Recessed public forecourt and planted podium edges.
  part.box(0, 0.38, 8.35, 16, 0.1, 1.8, m.water);
  part.box(0, 0.48, 7.1, 3.5, 0.12, 3.6, m.stone);
  for (const x of [-10.2, 10.2]) {
    part.box(x, 2.63, 0, 1.25, 0.34, 14.8, m.grass);
    for (const z of [-5.2, -1.8, 2, 5.3]) tree(part, x, z, m, 2.82, 0.55);
  }
}

function galaxyTwin(part, m) {
  const glass = standard('galaxy_twin_blue_silver_glass', '#668a99', { metalness: 0.62, roughness: 0.24, envMap: m.glass.envMap, envMapIntensity: 0.72, emissive: '#294650', emissiveIntensity: 0.06 });
  const trim = standard('galaxy_twin_satin_metal', '#c0ccca', { metalness: 0.72, roughness: 0.28 });
  const podium = standard('galaxy_twin_podium_glass', '#8fa8a6', { metalness: 0.38, roughness: 0.34 });
  // A shallow, flowing podium ties the two towers into one campus-scale base.
  const podiumRing = (y, rx, rz, offset = 0) => Array.from({ length: 48 }, (_, i) => {
    const a = i / 48 * Math.PI * 2;
    const wave = 1 + 0.055 * Math.sin(a * 2 + y * 0.32);
    return [Math.cos(a) * rx * wave + offset * Math.sin(a), y, Math.sin(a) * rz * wave];
  });
  part.add(loft([podiumRing(0.3, 14.3, 7.2), podiumRing(2.15, 13.8, 6.9, 0.2), podiumRing(2.55, 12.8, 6.2, 0.7)]), podium);
  part.line(podiumRing(2.58, 12.9, 6.25, 0.7), trim, true);
  part.box(0, 0.24, 0, 26.5, 0.32, 13.2, m.stone);

  const count = 32;
  for (const [center, direction] of [[-5.25, 1], [5.25, -1]]) {
    const levels = 45;
    const profile = t => 1 + 0.035 * Math.sin(t * Math.PI * 2.2) - 0.13 * t ** 1.6;
    const contour = (t, y) => {
      const width = 3.25 * profile(t), depth = 2.8 * profile(t);
      const twist = direction * (0.38 * t + 0.035 * Math.sin(t * Math.PI * 2));
      return Array.from({ length: count }, (_, i) => {
        const a = i / count * Math.PI * 2 + twist;
        const ex = Math.sign(Math.cos(a)) * Math.abs(Math.cos(a)) ** 0.76 * width;
        const ez = Math.sign(Math.sin(a)) * Math.abs(Math.sin(a)) ** 0.76 * depth;
        return [center + ex, y, ez];
      });
    };
    const rings = Array.from({ length: levels }, (_, i) => {
      const t = i / (levels - 1);
      return contour(t, 2.5 + t * 38.2);
    });
    part.add(loft(rings), glass);
    // Continuous vertical fins make the subtle twist legible from the city overview.
    for (let i = 0; i < count; i += 2) {
      const path = rings.map(r => r[i]);
      for (let j = 1; j < path.length; j++) part.beam(path[j - 1], path[j], i % 8 === 0 ? 0.052 : 0.026, i % 8 === 0 ? trim : m.mullion);
    }
    for (let y = 4; y < 40; y += 1.05) {
      const t = (y - 2.5) / 38.2;
      part.line(contour(t, y), m.lightLine, true);
    }
    const crown = contour(1, 40.7);
    part.line(crown, trim, true);
    part.add(new THREE.CylinderGeometry(0.95, 1.18, 0.4, 32), trim, [center, 40.95, 0]);
  }
  // Fine shade canopies and recessed entries articulate the shared retail base.
  for (const z of [-5.3, 5.3]) part.box(0, 2.72, z, 21, 0.18, 0.36, trim);
  for (let x = -9; x <= 9; x += 1.5) part.box(x, 1.55, 6.63, 0.82, 1.8, 0.12, m.glass);
  part.box(0, 0.39, 8.2, 18, 0.1, 1.3, m.water);
}

export const districtBuilders = { airport, northstation: northStation, guangming, pingshan, dapeng, yantian, huawei, yungu, ganfeng, galaxyTwin };
