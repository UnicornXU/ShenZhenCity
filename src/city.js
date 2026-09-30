import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { landmarks, seededRandom } from './data.js';
import { buildLandmark } from './landmark-models.js';
import { shoreline, coast, isLand, overviewTarget, overviewOffset, sceneHalfWidth, bantianRoads } from './city-layout.js';

// The extruded terrain includes a 0.5-unit bevel above its 0.6-unit face.
const LAND_Y = 1.12;
function shapeFromXZ(points) {
  const shape = new THREE.Shape();
  points.forEach(([x, z], i) => i ? shape.lineTo(x, -z) : shape.moveTo(x, -z));
  shape.closePath();
  return shape;
}

function material(color, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.86, metalness: 0.05, ...extra });
}

export class ShenzhenCity {
  constructor(container, onSelect, onFrame) {
    this.container = container;
    this.onSelect = onSelect;
    this.onFrame = onFrame;
    this.random = seededRandom();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#e9efeb');
    this.scene.fog = new THREE.Fog('#e9efeb', 430, 850);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.domElement.setAttribute('aria-label', '深圳三维城市模型。拖动旋转，滚轮缩放，右键拖动平移。也可使用右侧视角按钮。');
    this.renderer.domElement.tabIndex = 0;
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.OrthographicCamera(-170, 170, 110, -110, 0.1, 1600);
    this.camera.position.set(...overviewTarget).add(new THREE.Vector3(...overviewOffset));
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(...overviewTarget);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.075;
    this.controls.minZoom = 0.62;
    this.controls.maxZoom = 5;
    this.controls.minPolarAngle = 0.12;
    this.controls.maxPolarAngle = Math.PI * 0.47;
    this.controls.autoRotateSpeed = 0.35;
    this.controls.screenSpacePanning = true;
    this.controls.listenToKeyEvents(this.renderer.domElement);
    this.controls.addEventListener('start', () => {
      this.flight = null;
      this.container.dispatchEvent(new CustomEvent('manualinteraction'));
    });

    this.model = new THREE.Group();
    this.model.name = 'Shenzhen_Artistic_City_Model';
    this.model.userData = { note: 'Artistic compressed city diorama; not geospatial or survey data.', seed: 518000 };
    this.scene.add(this.model);
    this.layers = {};
    for (const name of ['terrain', 'buildings', 'landmarks', 'roads', 'parks', 'traffic']) {
      this.layers[name] = new THREE.Group();
      this.layers[name].name = name;
      this.model.add(this.layers[name]);
    }
    this.facades = [];
    this.pickables = [];
    this.landmarkGroups = new Map();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.screenVector = new THREE.Vector3();
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.hemi = new THREE.HemisphereLight('#ecf5fa', '#8d9f87', 2.65);
    this.sun = new THREE.DirectionalLight('#fff2d9', 3.25);
    this.sun.position.set(-65, 130, 70);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    Object.assign(this.sun.shadow.camera, { left: -290, right: 290, top: 220, bottom: -220, near: 1, far: 500 });
    this.sun.shadow.normalBias = 0.5;
    this.sun.shadow.bias = -0.0003;
    this.scene.add(this.hemi, this.sun);

    this.makeTerrain();
    this.makeRoads();
    this.makeBuildings();
    this.makeLandmarks();
    this.makeParks();
    this.makeBridge();
    this.makeBoats();
    this.makeTraffic();
    this.makeSelection();
    this.bindPicking();
    this.setTime(14);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();
    this.lastTime = performance.now();
    this.renderer.setAnimationLoop(time => this.animate(time));
  }

  box(parent, x, y, z, w, h, d, mat, castShadow = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  curve(parent, points, radius, mat, tubularSegments = 40) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, tubularSegments, radius, 5, false), mat);
    parent.add(mesh);
    return mesh;
  }

  makeTerrain() {
    const g = this.layers.terrain;
    this.waterMaterial = material('#8fbbb8', { roughness: 0.5, metalness: 0.18 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(430, 5, 275), material('#739a91'));
    base.position.set(40, -4.6, -52.5);
    base.receiveShadow = true;
    g.add(base);
    this.box(g, 40, -1.9, -52.5, 430, 0.5, 275, this.waterMaterial, false);

    const landGeo = new THREE.ExtrudeGeometry(shapeFromXZ(coast), { depth: 2.6, bevelEnabled: true, bevelSize: 0.9, bevelThickness: 0.5, bevelSegments: 2, steps: 1 });
    landGeo.rotateX(-Math.PI / 2);
    const land = new THREE.Mesh(landGeo, material('#d2d6bc'));
    land.position.y = -2;
    land.receiveShadow = true;
    g.add(land);
    this.curve(g, shoreline.map(([x, z]) => [x, 0.1, z]), 0.58, material('#ebe4cd'), 140);
    this.curve(g, shoreline.map(([x, z]) => [x, -1.4, z + 2]), 0.22, material('#c3ded5'), 140);

    const bottom = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), material('#e9efeb'));
    bottom.rotation.x = -Math.PI / 2;
    bottom.position.y = -7.25;
    bottom.receiveShadow = true;
    this.scene.add(bottom);
    this.floorMaterial = bottom.material;

    this.hills = [
      { name: '凤凰山森林公园', x: -139, z: -78, sx: 17, sy: 11, sz: 19 },
      { name: '阳台山森林公园', x: -103, z: -68, sx: 23, sy: 16, sz: 22 },
      { name: '塘朗山郊野公园', x: -72, z: -54, sx: 17, sy: 13, sz: 17 },
      { name: '梅林山郊野公园', x: -40, z: -53, sx: 20, sy: 13, sz: 17 },
      { name: '银湖山郊野公园', x: -8, z: -62, sx: 21, sy: 14, sz: 18 },
      { name: '莲花山公园', x: 13, z: -28, sx: 12, sy: 7, sz: 11 },
      { name: '笔架山公园', x: 40, z: -37, sx: 14, sy: 8, sz: 13 },
      { name: '梧桐山风景区', x: 107, z: -67, sx: 24, sy: 21, sz: 24 },
      { name: '马峦山郊野公园', x: 151, z: -96, sx: 23, sy: 17, sz: 22 },
      { name: '七娘山地质公园', x: 192, z: -114, sx: 19, sy: 20, sz: 20 },
      { name: '大南山公园', x: -94, z: -27, sx: 13, sy: 11, sz: 12 },
    ];
    const hillMats = ['#718b68', '#849b72', '#94a77b', '#a4af83'].map(c => material(c, { flatShading: true }));
    this.hills.forEach((hillData, i) => {
      const { x, z, sx, sy, sz, name } = hillData;
      const group = new THREE.Group();
      group.name = `${name}_山体公园`;
      group.userData.feature = '山海连城山体与公园示意';
      const seed = i * 1.7;
      const base = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 9, 0, Math.PI * 2, 0, Math.PI / 2), hillMats[i % hillMats.length]);
      base.position.y = sy * 0.36;
      base.scale.set(sx, sy * 0.83, sz);
      base.rotation.y = seed;
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);
      // Layered foothills soften the old single-dome silhouette and read as ridgelines.
      for (let ridge = 0; ridge < 3; ridge++) {
        const angle = seed + ridge * Math.PI * 2 / 3;
        const spur = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), hillMats[(i + ridge + 1) % hillMats.length]);
        spur.position.set(Math.cos(angle) * sx * 0.39, sy * (0.1 + ridge * 0.025), Math.sin(angle) * sz * 0.37);
        spur.scale.set(sx * 0.53, sy * (0.49 + ridge * 0.035), sz * 0.52);
        spur.rotation.y = angle;
        spur.castShadow = true;
        group.add(spur);
      }
      group.position.set(x, LAND_Y, z);
      this.layers.parks.add(group);
    });
    this.makeGreenway();
    const grid = new THREE.GridHelper(1200, 80, '#bdcbc3', '#d8e1da');
    grid.position.y = -7.1;
    grid.material.transparent = true;
    grid.material.opacity = 0.25;
    this.scene.add(grid);
    this.grid = grid;

    // Long, quiet wave strokes keep the bay readable without a costly water pass.
    const waveGeo = [];
    for (let i = 0; i < 85; i++) {
      const x = this.random() * 278 - 139;
      const z = 16 + this.random() * 61;
      if (isLand(x, z - 4)) continue;
      const geo = new THREE.BoxGeometry(1.5 + this.random() * 4, 0.015, 0.12);
      geo.translate(x, -1.62, z);
      waveGeo.push(geo);
    }
    if (waveGeo.length) g.add(new THREE.Mesh(mergeGeometries(waveGeo), material('#bdd7ce')));
    waveGeo.forEach(geo => geo.dispose());
  }

  reserved(x, z, margin = 0) {
    if (margin > 0 && bantianRoads.some(([, rx, rz, w, d]) => Math.abs(x - rx) < w / 2 + margin && Math.abs(z - rz) < d / 2 + margin)) return true;
    if (landmarks.some(l => {
      const [rx, rz] = l.footprint ?? [l.kind === 'oval' || l.kind === 'wing' ? 13 : 8, l.kind === 'wing' ? 8 : 7];
      return Math.abs(x - l.x) < rx + margin && Math.abs(z - l.z) < rz + margin;
    })) return true;
    return this.hills.some(({ x: hx, z: hz, sx, sz }) => ((x - hx) / (sx + margin)) ** 2 + ((z - hz) / (sz + margin)) ** 2 < 0.9);
  }

  makeGreenway() {
    const parks = this.layers.parks;
    const route = [
      [-150, -84], [-130, -74], [-105, -68], [-82, -56], [-64, -53],
      [-42, -55], [-20, -64], [2, -62], [25, -49], [43, -39], [63, -48],
      [86, -60], [107, -69], [130, -83], [153, -97], [173, -107], [193, -115],
    ].map(([x, z]) => [x, LAND_Y + 0.35, z]);
    this.curve(parks, route, 0.42, material('#d5c99e'), 180).name = '鲲鹏径_山海连城步道示意';
    const secondary = [
      [[-104, -66], [-110, -48], [-105, -33], [-94, -27], [-77, -36]],
      [[-38, -54], [-30, -38], [-20, -28], [-3, -29], [12, -28]],
      [[84, -59], [91, -47], [105, -39], [123, -42], [137, -56]],
      [[147, -93], [161, -78], [178, -73], [195, -80]],
    ];
    secondary.forEach((points, i) => {
      this.curve(parks, points.map(([x, z]) => [x, LAND_Y + 0.26, z]), 0.22, material(i % 2 ? '#e0d5b0' : '#a7b98a'), 40).name = `山海连城_郊野绿道${i + 1}`;
    });
    const clearings = [
      ['深圳湾公园', -89, 17], ['人才公园', -75, 5], ['莲花山公园', 13, -28],
      ['深圳中心公园', 28, -15], ['东湖公园', 79, -43], ['仙湖植物园', 101, -52],
      ['大沙河公园', -70, -37], ['马峦山郊野公园', 151, -96],
    ];
    clearings.forEach(([name, x, z], i) => {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(i < 2 ? 5.8 : 3.3, i < 2 ? 6.6 : 3.8, 0.18, 12), material(i < 2 ? '#a9c18d' : '#b6c493'));
      pad.name = `${name}_公园绿地`;
      pad.position.set(x, LAND_Y + 0.12, z);
      pad.receiveShadow = true;
      parks.add(pad);
      const path = new THREE.Mesh(new THREE.TorusGeometry(i < 2 ? 4.6 : 2.5, 0.1, 4, 24), material('#ddd2aa'));
      path.name = `${name}_环园步道`;
      path.rotation.x = Math.PI / 2;
      path.position.set(x, LAND_Y + 0.24, z);
      parks.add(path);
    });
  }

  makeRoads() {
    const roads = [], markings = [], pavements = [];
    for (let z = -172; z <= 20; z += 16) {
      for (let x = -162; x <= 230; x += 2) {
        if (!isLand(x, z + 1.9) || this.reserved(x, z, -3)) continue;
        const geo = new THREE.BoxGeometry(2.03, 0.11, z === -12 ? 3.2 : 2.1);
        geo.translate(x, LAND_Y + 0.05, z);
        roads.push(geo);
        if (x % 6 === 0) {
          const line = new THREE.BoxGeometry(1.1, 0.015, 0.12);
          line.translate(x, LAND_Y + 0.12, z);
          markings.push(line);
        }
      }
    }
    for (let x = -156; x < 235; x += 16) {
      for (let z = -177; z < 29; z += 2) {
        if (!isLand(x + 2, z + 2) || this.reserved(x, z, -3)) continue;
        const geo = new THREE.BoxGeometry(2, 0.11, 2.03);
        geo.translate(x, LAND_Y + 0.05, z);
        roads.push(geo);
      }
    }
    for (let x = -148; x < 229; x += 16) {
      for (let z = -164; z < 26; z += 16) {
        if (!isLand(x, z + 5) || this.reserved(x, z, -1)) continue;
        const geo = new THREE.BoxGeometry(12.8, 0.12, 12.8);
        geo.translate(x, LAND_Y + 0.08, z);
        pavements.push(geo);
      }
    }
    for (const [geos, color] of [[pavements, '#e0dfcc'], [roads, '#929d94'], [markings, '#e9e6ce']]) {
      if (!geos.length) continue;
      const mesh = new THREE.Mesh(mergeGeometries(geos), material(color));
      mesh.receiveShadow = true;
      this.layers.roads.add(mesh);
      geos.forEach(geo => geo.dispose());
    }
    const promenade = shoreline.slice(1, -1).map(([x, z]) => [x, LAND_Y + 0.25, z - 2.2]);
    this.curve(this.layers.roads, promenade, 0.6, material('#dcc8a6'), 140);
    // A visible corridor passes between the hills into the new inland district.
    const connector = new THREE.CatmullRomCurve3([[34, -76], [29, -64], [28, -47], [28, -28]].map(([x, z]) => new THREE.Vector3(x, LAND_Y + 0.2, z)));
    const samples = connector.getPoints(40);
    const sides = [-1, 1].map(side => samples.map((p, i) => {
      const tangent = connector.getTangent(i / 40);
      return [p.x + tangent.z * 1.2 * side, p.z - tangent.x * 1.2 * side];
    }));
    const roadGeometry = new THREE.ShapeGeometry(shapeFromXZ([...sides[0], ...sides[1].reverse()]));
    roadGeometry.rotateX(-Math.PI / 2);
    const connectorRoad = new THREE.Mesh(roadGeometry, material('#929d94'));
    connectorRoad.name = '龙岗连接道路_示意';
    connectorRoad.position.y = LAND_Y + 0.2;
    connectorRoad.receiveShadow = true;
    this.layers.roads.add(connectorRoad);
    this.curve(this.layers.roads, samples.map(p => [p.x, p.y + 0.06, p.z]), 0.05, material('#e9e6ce'), 40);

    // Named schematic corridors frame both Bantian campuses without crossing them.
    for (const [name, x, z, width, depth] of bantianRoads) {
      const road = this.box(this.layers.roads, x, LAND_Y + 0.24, z, width, 0.12, depth, material('#8f9f9b'), false);
      road.name = name;
    }
  }

  facade(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#dce6e1';
    ctx.fillRect(0, 0, 64, 128);
    for (let y = 5; y < 125; y += 8) {
      for (let x = 4; x < 62; x += 10) {
        ctx.fillStyle = this.random() > 0.16 ? '#9cafa8' : '#c5d0c8';
        ctx.fillRect(x, y, 6, 4);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(this.renderer.capabilities.getMaxAnisotropy(), 4);
    const glow = document.createElement('canvas');
    glow.width = 64;
    glow.height = 128;
    const g = glow.getContext('2d');
    g.fillStyle = '#000';
    g.fillRect(0, 0, 64, 128);
    for (let y = 5; y < 125; y += 8) for (let x = 4; x < 62; x += 10) {
      if (this.random() > 0.45) { g.fillStyle = this.random() > 0.3 ? '#ffdf9a' : '#99cddd'; g.fillRect(x, y, 6, 4); }
    }
    const emissiveMap = new THREE.CanvasTexture(glow);
    emissiveMap.colorSpace = THREE.SRGBColorSpace;
    const mat = material(color, { map: texture, emissiveMap, emissive: '#ffe5b5', emissiveIntensity: 0, roughness: 0.58, metalness: 0.16 });
    this.facades.push(mat);
    return mat;
  }

  makeBuildings() {
    const colors = ['#d3ded2', '#b9cdc8', '#e1dccb', '#a5bdb8', '#c5d0c7'];
    const batches = colors.map(() => []);
    const roofs = [];
    for (let x = -148; x < 229; x += 16) {
      for (let z = -164; z < 25; z += 16) {
        for (const dx of [-3.5, 3.5]) for (const dz of [-3.5, 3.5]) {
          const bx = x + dx, bz = z + dz;
          if (!isLand(bx, bz + 4) || this.reserved(bx, bz, 2) || this.random() < 0.1) continue;
          const density = Math.max(Math.exp(-(((bx - 12) / 30) ** 2)), Math.exp(-(((bx - 76) / 26) ** 2)), Math.exp(-(((bx + 66) / 26) ** 2)));
          const contextScale = bx > 185 ? 0.32 : bx > 128 || bz < -75 ? 0.55 : 1;
          const h = 2.3 + this.random() * (6 + density * 11) * contextScale;
          const w = 2.6 + this.random() * 2.6, d = 2.5 + this.random() * 2.6;
          batches[Math.floor(this.random() * batches.length)].push([bx, LAND_Y + h / 2 + 0.15, bz, w, h, d]);
          if (this.random() < 0.5) roofs.push([bx, LAND_Y + h + 0.5, bz, w * 0.55, 0.7, d * 0.55]);
        }
      }
    }
    this.buildingCount = batches.reduce((n, list) => n + list.length, 0) + landmarks.length;
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const dummy = new THREE.Object3D();
    const addBatch = (list, mat) => {
      const mesh = new THREE.InstancedMesh(geometry, mat, list.length);
      list.forEach(([x, y, z, w, h, d], i) => {
        dummy.position.set(x, y, z);
        dummy.scale.set(w, h, d);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.layers.buildings.add(mesh);
    };
    batches.forEach((list, i) => addBatch(list, this.facade(colors[i])));
    addBatch(roofs, material('#d8d9c8'));
  }

  makeLandmarks() {
    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.landmarkEnvironment = pmrem.fromScene(room, 0.04);
    room.dispose();
    pmrem.dispose();
    for (const item of landmarks) {
      const { group, nightMaterials } = buildLandmark(item, { environment: this.landmarkEnvironment.texture, water: this.waterMaterial });
      group.position.set(item.x, LAND_Y, item.z);
      this.layers.landmarks.add(group);
      this.landmarkGroups.set(item.id, group);
      this.facades.push(...nightMaterials);
      group.traverse(obj => {
        if (obj.isMesh) {
          obj.userData.landmarkId = item.id;
          this.pickables.push(obj);
        }
      });
    }
  }
  makeParks() {
    const trees = [];
    // Keep the civic axis open, with a garden leading up to Lianhua Hill.
    this.box(this.layers.parks, 12, LAND_Y + 0.15, -31, 15, 0.2, 11, material('#afbc89'), false);
    this.box(this.layers.parks, 12, LAND_Y + 0.28, -31, 2.2, 0.06, 11, material('#e6dfbd'), false);
    for (let i = 0; i < 2400; i++) {
      const x = this.random() * 399 - 165;
      const z = this.random() * 210 - 178;
      if (!isLand(x, z + 2)) continue;
      const onHill = this.hills.some(({ x: hx, z: hz, sx, sz }) => ((x - hx) / sx) ** 2 + ((z - hz) / sz) ** 2 < 1.1);
      if (onHill || this.reserved(x, z, 1)) continue;
      const nearRoad = Math.abs(((x + 124) % 16 + 16) % 16 - 8) > 5.6;
      const onCoast = !isLand(x, z + 5);
      if (!nearRoad && !onCoast) continue;
      trees.push({ x, z, scale: 0.76 + this.random() * 0.62, species: Math.floor(this.random() * 4), yaw: this.random() * Math.PI * 2, color: this.random() });
    }
    const speciesNames = ['香樟阔叶', '木棉阔冠', '南方松', '海岸棕榈'];
    const foliageMats = ['#537b55', '#68895a', '#47745e', '#728c59'].map(c => material(c, { flatShading: true }));
    const trunkMats = ['#8d7458', '#92775d', '#776e57', '#a38d67'].map(c => material(c));
    const templates = [
      { trunk: 1.45, crown: 1.15, tiers: 3 }, { trunk: 2.05, crown: 1.35, tiers: 4 },
      { trunk: 1.6, crown: 0.8, tiers: 4 }, { trunk: 1.9, crown: 1.25, tiers: 5 },
    ];
    const dummy = new THREE.Object3D();
    for (let species = 0; species < templates.length; species++) {
      const data = templates[species];
      const leafGeometries = [], trunkGeometries = [];
      const stem = new THREE.CylinderGeometry(0.09, 0.15, data.trunk, 7);
      stem.translate(0, data.trunk / 2, 0);
      trunkGeometries.push(stem);
      if (species === 0 || species === 1) {
        for (let branch = 0; branch < 4; branch++) {
          const angle = branch * Math.PI / 2 + 0.3;
          const limb = new THREE.CylinderGeometry(0.045, 0.08, 0.9, 5);
          limb.rotateZ(-0.65);
          limb.rotateY(angle);
          limb.translate(Math.cos(angle) * 0.35, data.trunk * 0.73, Math.sin(angle) * 0.35);
          trunkGeometries.push(limb);
        }
      }
      for (let tier = 0; tier < data.tiers; tier++) {
        const t = tier / Math.max(1, data.tiers - 1);
        const y = data.trunk + 0.3 + t * (species === 1 ? 0.9 : 0.55);
        if (species === 2) {
          const cone = new THREE.ConeGeometry(data.crown * (1 - t * 0.17), 1.15, 9, 1);
          cone.translate(0, y + 0.48, 0);
          leafGeometries.push(cone);
        } else if (species === 3) {
          for (let frond = 0; frond < 5; frond++) {
            const angle = frond * Math.PI * 2 / 5;
            const leaf = new THREE.ConeGeometry(0.18, 1.65, 5, 1);
            leaf.rotateZ(-0.95);
            leaf.rotateY(angle);
            leaf.translate(Math.cos(angle) * 0.55, y + Math.sin(t * Math.PI) * 0.25, Math.sin(angle) * 0.55);
            leafGeometries.push(leaf);
          }
        } else {
          const crown = new THREE.IcosahedronGeometry(data.crown * (1 - t * 0.24), 1);
          crown.translate((tier % 2 ? 0.22 : -0.18), y, tier % 2 ? -0.12 : 0.16);
          leafGeometries.push(crown);
        }
      }
      const members = trees.map((tree, index) => ({ tree, index })).filter(item => item.tree.species === species);
      if (!members.length) continue;
      const leaves = new THREE.InstancedMesh(mergeGeometries(leafGeometries), foliageMats[species], members.length);
      const trunks = new THREE.InstancedMesh(mergeGeometries(trunkGeometries), trunkMats[species], members.length);
      leaves.name = `${speciesNames[species]}_树冠`;
      trunks.name = `${speciesNames[species]}_树干与枝杈`;
      members.forEach(({ tree }, index) => {
        dummy.position.set(tree.x, LAND_Y, tree.z);
        dummy.rotation.set(0, tree.yaw, 0);
        dummy.scale.setScalar(tree.scale);
        dummy.updateMatrix();
        leaves.setMatrixAt(index, dummy.matrix);
        trunks.setMatrixAt(index, dummy.matrix);
        leaves.setColorAt(index, new THREE.Color().setHSL(0.25 + tree.color * 0.09, 0.24, 0.34 + tree.color * 0.16));
      });
      leaves.instanceMatrix.needsUpdate = true;
      trunks.instanceMatrix.needsUpdate = true;
      leaves.castShadow = true;
      this.layers.parks.add(leaves, trunks);
    }
    this.treeCount = trees.length;
  }

  makeBridge() {
    const g = new THREE.Group();
    g.name = '深圳湾大桥_示意';
    g.position.set(-108, 0, 28);
    g.rotation.y = -0.42;
    this.layers.roads.add(g);
    const deck = material('#dddccb'), steel = material('#e8e7d9');
    this.box(g, 0, 1.5, 21, 4.5, 0.6, 46, deck);
    for (const x of [-2.1, 2.1]) this.box(g, x, 2.1, 21, 0.15, 0.7, 46, steel);
    for (const z of [8, 28]) {
      for (const x of [-1.65, 1.65]) this.box(g, x, 5.2, z, 0.45, 13.5, 0.6, steel);
      this.box(g, 0, 10, z, 3.6, 0.45, 0.7, steel);
      for (const side of [-1, 1]) for (let offset = 3; offset <= 10; offset += 2.5) for (const x of [-1.65, 1.65]) {
        this.curve(g, [[x, 11, z], [x, 2, z + side * offset]], 0.045, steel, 1);
      }
    }
    for (let z = 1; z < 45; z += 3) this.box(g, 0, 1.82, z, 0.08, 0.02, 1.4, steel, false);
  }

  makeBoats() {
    this.boats = [];
    const white = material('#f7eed6'), hullMat = material('#315b57');
    for (const [x, z, angle, size] of [[-25, 55, -0.6, 1], [51, 61, 0.7, 0.8], [111, 49, -0.4, 1.15]]) {
      const boat = new THREE.Group();
      const hull = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.75, 0.7, 5), hullMat);
      hull.scale.set(1.1, 1, 3.8);
      boat.add(hull);
      this.box(boat, 0, 0.8, 0.3, 1.5, 1.1, 3.5, white);
      this.box(boat, 0, 1.55, -0.5, 1.15, 0.5, 1.2, white);
      boat.position.set(x, -0.7, z);
      boat.rotation.y = angle;
      boat.scale.setScalar(size);
      this.layers.terrain.add(boat);
      this.boats.push({ boat, y: boat.position.y, phase: x });
    }
  }

  makeTraffic() {
    this.cars = [];
    const carPalette = ['#e9e3d3', '#ad7055', '#496f69', '#8d9fa2', '#d8b966', '#374650'];
    const mergeBoxes = boxes => {
      const geometries = boxes.map(([x, y, z, w, h, d]) => {
        const geo = new THREE.BoxGeometry(w, h, d);
        geo.translate(x, y, z);
        return geo;
      });
      const merged = mergeGeometries(geometries);
      geometries.forEach(geo => geo.dispose());
      return merged;
    };
    const bodyGeo = mergeBoxes([
      [0, 0.36, 0, 2.55, 0.48, 1.12], [0.82, 0.52, 0, 0.66, 0.2, 1.06],
      [-0.88, 0.51, 0, 0.54, 0.2, 1.06], [1.23, 0.28, 0, 0.13, 0.18, 0.96],
      [-1.23, 0.28, 0, 0.13, 0.18, 0.96],
    ]);
    const cabinGeo = mergeBoxes([[0, 0.79, 0, 1.36, 0.49, 0.91]]);
    const glassGeo = mergeBoxes([
      [0.16, 0.8, 0, 0.52, 0.32, 0.925], [-0.43, 0.8, 0, 0.43, 0.32, 0.925],
    ]);
    const wheelParts = [];
    for (const x of [-0.78, 0.78]) for (const z of [-0.59, 0.59]) {
      const tire = new THREE.CylinderGeometry(0.28, 0.28, 0.16, 12);
      tire.rotateX(Math.PI / 2);
      tire.translate(x, 0.3, z);
      wheelParts.push(tire);
    }
    const wheelGeo = mergeGeometries(wheelParts);
    wheelParts.forEach(geo => geo.dispose());
    const rimParts = [];
    for (const x of [-0.78, 0.78]) for (const z of [-0.68, 0.68]) {
      const rim = new THREE.CylinderGeometry(0.12, 0.12, 0.025, 10);
      rim.rotateX(Math.PI / 2);
      rim.translate(x, 0.3, z);
      rimParts.push(rim);
    }
    const rimGeo = mergeGeometries(rimParts);
    rimParts.forEach(geo => geo.dispose());
    const lampGeo = mergeBoxes([[1.29, 0.41, -0.36, 0.07, 0.13, 0.24], [1.29, 0.41, 0.36, 0.07, 0.13, 0.24]]);
    const tailGeo = mergeBoxes([[-1.29, 0.41, -0.36, 0.07, 0.13, 0.24], [-1.29, 0.41, 0.36, 0.07, 0.13, 0.24]]);
    const bodyMat = material('#ffffff', { roughness: 0.42, metalness: 0.12 });
    const cabinMat = material('#f4f1e6', { roughness: 0.45 });
    const glassMat = material('#536c71', { roughness: 0.28, metalness: 0.22 });
    const rubberMat = material('#313d3b', { roughness: 0.96 });
    const rimMat = material('#bbc2b9', { metalness: 0.55, roughness: 0.3 });
    const headMat = material('#fff1bf', { emissive: '#ffd887', emissiveIntensity: 0.25 });
    const tailMat = material('#b95348', { emissive: '#972b25', emissiveIntensity: 0.12 });
    this.carLightMats = [headMat, tailMat];
    const parts = [
      ['车身', bodyGeo, bodyMat], ['车顶', cabinGeo, cabinMat], ['车窗', glassGeo, glassMat],
      ['轮胎', wheelGeo, rubberMat], ['轮毂', rimGeo, rimMat], ['前灯', lampGeo, headMat], ['尾灯', tailGeo, tailMat],
    ];
    this.carMeshes = parts.map(([name, geometry, mat]) => {
      const mesh = new THREE.InstancedMesh(geometry, mat, 28);
      mesh.name = `道路车辆_${name}`;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.layers.traffic.add(mesh);
      return mesh;
    });
    for (let i = 0; i < 28; i++) {
      const x = -130 + this.random() * 260;
      const z = [-44, -28, -12, 4, 20][i % 5];
      const laneZ = z + (i % 2 ? 0.62 : -0.62);
      this.cars.push({ x, z: laneZ, dir: i % 2 ? 1 : -1, speed: 1.2 + this.random() * 1.4, color: i % carPalette.length, visible: isLand(x, laneZ + 2) && !this.reserved(x, laneZ, -3) });
    }
    this.carPalette = carPalette;
    this.updateTrafficMatrices();
  }

  updateTrafficMatrices() {
    const dummy = new THREE.Object3D();
    this.cars.forEach((car, index) => {
      dummy.position.set(car.x, LAND_Y, car.z);
      dummy.rotation.set(0, car.dir < 0 ? Math.PI : 0, 0);
      dummy.scale.setScalar(car.visible ? 0.72 : 0);
      dummy.updateMatrix();
      this.carMeshes.forEach((mesh, partIndex) => {
        mesh.setMatrixAt(index, dummy.matrix);
        if (partIndex === 0) mesh.setColorAt(index, new THREE.Color(this.carPalette[car.color]));
      });
    });
    for (const mesh of this.carMeshes) mesh.instanceMatrix.needsUpdate = true;
  }

  makeSelection() {
    this.selection = new THREE.Mesh(new THREE.RingGeometry(7, 7.35, 64), new THREE.MeshBasicMaterial({ color: '#326e59', transparent: true, opacity: 0.75, side: THREE.DoubleSide }));
    this.selection.rotation.x = -Math.PI / 2;
    this.selection.visible = false;
    this.scene.add(this.selection);
  }

  bindPicking() {
    let start = null;
    this.renderer.domElement.addEventListener('pointerdown', e => { start = { x: e.clientX, y: e.clientY }; });
    this.renderer.domElement.addEventListener('pointerup', e => {
      if (!start || Math.hypot(e.clientX - start.x, e.clientY - start.y) > 5 || e.button !== 0) return;
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1);
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hit = this.raycaster.intersectObjects(this.pickables, false)[0];
      if (hit && this.layers.landmarks.visible) this.onSelect(hit.object.userData.landmarkId);
      start = null;
    });
  }

  focus(id) {
    const item = landmarks.find(l => l.id === id);
    if (!item) return;
    this.selected = id;
    this.selection.position.set(item.x, LAND_Y + 0.45, item.z);
    const [ringX, ringZ] = item.footprint ?? [7, 7];
    this.selection.scale.set(ringX / 7, ringZ / 7, 1);
    this.selection.visible = true;
    const target = new THREE.Vector3(item.x, item.height * 0.33, item.z);
    const offset = new THREE.Vector3(...(item.focusOffset ?? [100, 104, 160]));
    this.flyTo(target, offset, item.focusZoom ?? 3.1);
  }

  flyTo(target, offset, zoom) {
    this.controls.autoRotate = false;
    this.flight = { start: performance.now(), duration: this.reducedMotion ? 1 : 1150, fromPos: this.camera.position.clone(), fromTarget: this.controls.target.clone(), fromZoom: this.camera.zoom, toPos: target.clone().add(offset), toTarget: target, toZoom: zoom };
  }

  home() {
    this.selected = null;
    this.selection.visible = false;
    this.flyTo(new THREE.Vector3(...overviewTarget), new THREE.Vector3(...overviewOffset), 1);
  }

  overhead() {
    this.selection.visible = false;
    this.flyTo(new THREE.Vector3(overviewTarget[0], 0, overviewTarget[2]), new THREE.Vector3(0, 360, 0.1), 1);
  }

  zoomBy(multiplier) {
    this.flight = null;
    this.camera.zoom = THREE.MathUtils.clamp(this.camera.zoom * multiplier, 0.62, 5);
    this.camera.updateProjectionMatrix();
  }

  rotateBy(angle) {
    this.flight = null;
    const offset = this.camera.position.clone().sub(this.controls.target);
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    this.camera.position.copy(this.controls.target).add(offset);
    this.controls.update();
  }

  setLayer(name, visible) {
    if (name === 'buildings') {
      this.layers.buildings.visible = visible;
      this.layers.landmarks.visible = visible;
      this.selection.visible = visible && !!this.selected;
    } else if (this.layers[name]) this.layers[name].visible = visible;
    if (name === 'roads') this.layers.traffic.visible = visible;
  }

  setTime(hour) {
    this.hour = hour;
    const night = THREE.MathUtils.smoothstep(hour, 17, 21);
    const dusk = Math.max(0, 1 - Math.abs(hour - 18) / 2.5);
    const bg = new THREE.Color('#e9efeb').lerp(new THREE.Color('#182e38'), night);
    this.scene.background.copy(bg);
    this.scene.fog.color.copy(bg);
    this.floorMaterial.color.copy(bg);
    this.grid.material.opacity = 0.25 - night * 0.2;
    this.waterMaterial.color.copy(new THREE.Color('#8fbbb8').lerp(new THREE.Color('#234b59'), night));
    this.hemi.intensity = 2.15 - night * 1.35;
    this.hemi.color.set(night > 0.5 ? '#819fca' : '#ecf5fa');
    this.sun.intensity = 2.6 - night * 2.05;
    this.sun.color.copy(new THREE.Color('#fff2d9').lerp(new THREE.Color('#ffbb7c'), dusk));
    this.sun.position.set(-65 + dusk * 70, 130 - dusk * 95, 70);
    this.renderer.toneMappingExposure = 1.1 + night * 0.12;
    this.facades.forEach(mat => { mat.emissiveIntensity = night * (mat.userData.nightGlow ?? 1.7); });
    this.carLightMats.forEach(mat => { mat.emissiveIntensity = night * 0.8; });
    this.selection.material.color.set(night > 0.5 ? '#cceeb7' : '#326e59');
  }

  project(x, y, z) {
    this.screenVector.set(x, y, z).project(this.camera);
    return { x: (this.screenVector.x + 1) / 2 * this.width, y: (-this.screenVector.y + 1) / 2 * this.height, visible: this.screenVector.z > -1 && this.screenVector.z < 1 };
  }

  resize() {
    this.width = Math.max(this.container.clientWidth, 1);
    this.height = Math.max(this.container.clientHeight, 1);
    const aspect = this.width / this.height;
    const halfW = Math.max(sceneHalfWidth, 145 * aspect);
    const halfH = halfW / aspect;
    Object.assign(this.camera, { left: -halfW, right: halfW, top: halfH, bottom: -halfH });
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  animate(time) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;
    if (this.flight) {
      const f = this.flight;
      const progress = Math.min((time - f.start) / f.duration, 1);
      const t = 1 - (1 - progress) ** 3;
      this.camera.position.lerpVectors(f.fromPos, f.toPos, t);
      this.controls.target.lerpVectors(f.fromTarget, f.toTarget, t);
      this.camera.zoom = THREE.MathUtils.lerp(f.fromZoom, f.toZoom, t);
      this.camera.updateProjectionMatrix();
      if (progress >= 1) this.flight = null;
    }
    this.controls.update(dt);
    if (!this.reducedMotion) {
      this.boats.forEach(({ boat, y, phase }) => { boat.position.y = y + Math.sin(time * 0.001 + phase) * 0.08; });
      this.cars.forEach(car => {
        car.x += car.dir * car.speed * dt;
        if (car.x > 133) car.x = -133;
        if (car.x < -133) car.x = 133;
        car.visible = isLand(car.x, car.z + 2) && !this.reserved(car.x, car.z, -3);
      });
      this.updateTrafficMatrices();
    }
    this.renderer.render(this.scene, this.camera);
    this.onFrame?.(this);
  }

  async exportModel() {
    const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
    // Clone the scene graph (geometry/materials remain shared) so export neither
    // changes the user's current layer state nor omits a hidden model layer.
    const exportRoot = this.model.clone(true);
    for (const layer of exportRoot.children) layer.visible = true;
    exportRoot.updateMatrixWorld(true);
    const geometries = new Map();
    const lineMaterials = [];
    exportRoot.traverse(obj => {
      if (obj.geometry?.getAttribute('normal')) {
        if (!geometries.has(obj.geometry)) {
          const geometry = obj.geometry.clone();
          geometry.normalizeNormals();
          geometries.set(obj.geometry, geometry);
        }
        obj.geometry = geometries.get(obj.geometry);
      }
      if (obj.isLineSegments) {
        const source = obj.material;
        obj.material = new THREE.MeshBasicMaterial({ color: source.color, opacity: source.opacity, transparent: source.transparent });
        lineMaterials.push(obj.material);
      }
    });
    try {
      return await new GLTFExporter().parseAsync(exportRoot, { binary: true, onlyVisible: true });
    } finally {
      geometries.forEach(geometry => geometry.dispose());
      lineMaterials.forEach(mat => mat.dispose());
    }
  }

  screenshot() {
    this.renderer.render(this.scene, this.camera);
    return new Promise((resolve, reject) => this.renderer.domElement.toBlob(blob => blob ? resolve(blob) : reject(new Error('截图生成失败')), 'image/png'));
  }
}
