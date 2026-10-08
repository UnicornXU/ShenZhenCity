import './style.css';
import { ShenzhenCity } from './city.js';
import { landmarks, districtLabels, subdistrictLabels, ecoLabels } from './data.js';

const districtFilters = ['全部', ...districtLabels.map(d => d.name), '坂田'];

const paths = {
  city: '<path d="M3 21V9h6v12M9 21V3h7v18M16 21V12h5v9M1 21h22M12 7h1m-1 4h1m-1 4h1M5 13h1m-1 4h1m12-1h1"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
  layers: '<path d="m12 3 10 6-10 6L2 9Zm-9 11 9 5 9-5M3 18l9 5 9-5"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l1.5 1.5m13 13L20 20M4 20l1.5-1.5m13-13L20 4"/>',
  moon: '<path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z"/>',
  sunset: '<path d="M3 17h18M4 21h16M7 17a5 5 0 0 1 10 0M12 3v6m-3-3 3 3 3-3M2 11l2 2m16 0 2-2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  home: '<path d="m3 10 9-7 9 7v11h-6v-8H9v8H3Z"/>',
  top: '<path d="m12 3 9 5-9 5-9-5Zm-9 5v9l9 5 9-5V8M12 13v9"/>',
  reset: '<path d="M3 10a9 9 0 1 1 1 8M3 3v7h7"/>',
  play: '<path d="m8 4 12 8-12 8Z"/>',
  pause: '<path d="M7 4h3v16H7zm7 0h3v16h-3z"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  camera: '<path d="M3 7h4l2-3h6l2 3h4v14H3Z"/><circle cx="12" cy="13" r="4"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
  mouse: '<rect x="6" y="2" width="12" height="20" rx="6"/><path d="M12 2v7"/>',
  tree: '<path d="m12 2 7 9h-3l5 7H3l5-7H5Zm0 16v4"/>',
  route: '<circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 5h9a4 4 0 0 1 0 8H8a3 3 0 0 0 0 6h9"/>',
};
const icon = (name, className = '') => `<svg class="icon ${className}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.city}</svg>`;

function silhouette(kind) {
  const drawings = {
    spire: '<path d="m29 5 5 11 5 45H19l5-45Z"/><path d="M24 16h10M23 25h12M22 35h14M21 46h16M29 7v53"/>',
    bamboo: '<path d="M29 7C22 18 15 37 20 61h18c5-24-2-43-9-54Z"/><path d="M29 8v53M29 8C22 25 22 43 25 61M29 8c7 17 7 35 4 53M20 42h18M21 30h16M19 52h20"/>',
    arch: '<path d="M20 61V21c0-17 18-17 18 0v40Z"/><path d="M25 17v44m8-44v44M20 29h18M20 40h18M20 51h18"/>',
    twin: '<path d="M18 60V26h23v34M18 26V17h7v9m8 0V17h8v9M21.5 17V8m15 9V8M18 34h23M18 43h23M18 52h23M29 26v34"/>',
    wing: '<path d="M8 31q21 17 43 0l-2 9H10Zm5 10v18h11V42m12 0v17h11V41M24 54h12M6 61h48"/>',
    oval: '<ellipse cx="30" cy="47" rx="24" ry="14"/><ellipse cx="30" cy="42" rx="13" ry="5"/><path d="m8 42 9 13 13 6 14-6 8-13M17 37l-1 17m27-17 2 17M23 46l-2 13m17-13 2 13"/>',
    crystal: '<path d="m4 39 8-12 18-4 10 13-4 20-19 4-12-10Zm8-12 5 33m13-37 6 33M4 39l36-3M12 27l24 29M5 50l25-27m12-5 9-3 7 11-2 13-13 3-3-12Zm0 0 1 24m8-27 5 24M40 30l18-4m-15 21 10-2 6 10-4 9-13-3-3-9Z"/>',
    redcube: '<path d="m6 34 13-5 12 5v24l-13 6-12-5Zm0 0 12 5 13-5M18 39v25m13-35 12-5 12 5v26l-12 5-12-5m0-26 12 5 12-5M43 34v26M9 40v15m4-13v14m9-15v16m4-18v16m9-21v15m4-14v16m8-16v16m4-17v16"/>',
    airport: '<path d="M26 61V40L6 35v-7l20 3V13q4-10 8 0v18l20-3v7l-20 5v21ZM26 46h8M26 24h8M17 30v8m26-8v8"/>',
    northstation: '<path d="M5 29h50L44 44H16ZM16 44v10h28V44M9 57h43M18 59l-4 9m13-9-1 9m9-9 1 9m9-9 4 9M12 31l8 11m0-11 5 11m5-11v11m7-11-4 11m13-11-9 11"/>',
    guangming: '<path d="M5 56V25h50v31H44q-14-31-28 0Zm5-30v26m5-26v14M45 26v14m5-14v26M20 25V15h25v10M5 60h50"/>',
    pingshan: '<path d="M8 58V25h44v33M8 25l8-9h29l7 9M8 37h44M19 37v21m0 0 29-15M13 20h29M15 27v9m6-9v9m6-9v9m6-9v9m6-9v9m6-9v9M16 16V9h20v7"/>',
    dapeng: '<path d="M5 61V40h50v21H37V50q-7-10-14 0v11ZM13 40V27h34v13M8 27l22-9 22 9ZM5 39v-6h7v6m36 0v-6h7v6M18 29v11m8-11v11m9-11v11m7-11v11"/>',
    yantian: '<path d="M12 56V30h25v26M8 30h45M20 30V13l28 17M20 13l-9 17M18 30l-6 26m18-26 7 26M44 31v15M4 56h51l-5 7H10ZM18 53v-9h7v9m2 0V42h8v11"/>',
    huawei: '<path d="M12 61V16q18 8 36 0v45ZM9 14q21 9 42 0M9 10q21 9 42 0M18 18v43m8-41v41m8-41v41m8-43v43M12 29q18 7 36 0M12 40q18 7 36 0M12 51q18 7 36 0"/>',
    yungu: '<path d="M8 61V14h18v47M34 61V27h18v34M11 14v-4h12v4M37 27v-4h12v4M8 24h18M8 34h18M8 44h18M8 54h18M34 36h18M34 46h18M34 56h18M26 53h8M14 14v47m26-34v34"/>',
    ganfeng: '<path d="M10 61V25h17v36M33 61V17h17v44M8 25h21M31 17h21M13 31v30m6-30v30m6-30v30m7-22h21m-15 0v22m7-22v22m7-22v22M5 64h50"/>',
    galaxyTwin: '<path d="M8 61V27q0-10 9-16 9 6 9 16v34M34 61V27q0-10 9-16 9 6 9 16v34M9 33q8 3 17 0m8 0q8 3 17 0M9 43q8 3 17 0m8 0q8 3 17 0M9 53q8 3 17 0m8 0q8 3 17 0M17 11v50m26-50v50M5 64h50"/>',
  };
  return `<svg viewBox="0 0 60 70" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" aria-hidden="true">${drawings[kind]}</svg>`;
}

document.querySelector('#app').innerHTML = `
  <header class="topbar">
    <a class="brand" href="#" aria-label="深圳城市模型首页"><span class="brand-mark">${icon('city')}</span><span class="brand-name">深圳<span class="brand-en">CITY ATLAS</span></span><span class="brand-divider"></span><span class="brand-caption">山海之城</span></a>
    <nav class="topnav" aria-label="主导航"><button class="nav-item active" id="explore-nav">${icon('compass')}城市漫游</button><button class="nav-item" id="layers-nav" aria-expanded="false" aria-controls="layers-panel">${icon('layers')}场景图层</button><button class="nav-item" id="about-nav">${icon('info')}关于模型</button></nav>
    <button class="export-button" id="export">${icon('download')}<span>导出模型</span><span class="filetype">GLB</span></button>
  </header>
  <main class="workspace">
    <aside class="sidebar" aria-label="深圳地标导航">
      <div class="sidebar-intro"><div class="eyebrow"><span></span> A CITY BETWEEN MOUNTAINS & SEA</div><h1>遇见，深圳<span>。</span></h1><p>从城市天际线，到蔚蓝海岸。<br>换一个视角，发现这座城。</p></div>
      <button class="overview-card" id="overview"><span class="overview-icon">${icon('top')}</span><span><strong>城市全景</strong><small>在山海之间自由探索</small></span>${icon('arrow')}</button>
      <div class="section-heading"><h2>标志性建筑</h2><span>LANDMARKS <b>${String(landmarks.length).padStart(2, '0')}</b></span></div>
      <div class="filters" role="group" aria-label="按城区筛选">${districtFilters.map((name, i) => `<button class="${i === 0 ? 'active' : ''}" data-filter="${name}" aria-pressed="${i === 0}">${name}</button>`).join('')}</div>
      <div class="landmark-list" id="landmark-list">${landmarks.map((l, i) => `<button class="landmark-card" data-landmark="${l.id}" aria-pressed="false"><span class="landmark-thumb thumb-${l.kind}">${silhouette(l.kind)}</span><span class="landmark-copy"><small>${String(i + 1).padStart(2, '0')}<span> / ${l.district}</span></small><strong>${l.name}</strong><span class="landmark-tag">${l.tag}</span></span><span class="landmark-arrow">${icon('arrow')}</span></button>`).join('')}</div>
      <div class="sidebar-footer"><span class="little-dot"></span><span>一座城市，无限可能</span><span class="footer-coord">22.54° N</span></div>
    </aside>
    <section class="scene-area" aria-label="城市三维浏览器">
      <div id="canvas-container"></div>
      <div class="scene-caption"><span class="scene-index">01 — EXPLORE</span><div>深圳 <span>SHENZHEN</span></div><p>广东 · 中国 <i></i> 艺术化城市模型</p></div>
      <div class="scene-badge"><span class="status-dot"></span><span id="scene-status">正在建立城市</span><span class="badge-divider">/</span><span>3D</span></div>
      <div class="map-labels" id="map-labels"></div>
      <div class="bay-label" id="bay-label">深圳湾<span>SHENZHEN BAY</span></div>
      <div class="compass" aria-label="场景方向"><span>N</span><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" stroke-opacity=".16"/><g id="compass-needle"><path d="m32 9 7 23-7-3-7 3Z" fill="currentColor"/><path d="m32 55 7-23-7 3-7-3Z" fill="currentColor" opacity=".2"/></g></svg></div>
      <div class="view-tools" role="group" aria-label="视角控制"><button id="zoom-in" title="放大" aria-label="放大">${icon('plus')}</button><button id="zoom-out" title="缩小" aria-label="缩小">${icon('minus')}</button><span></span><button id="rotate-view" title="旋转视角" aria-label="旋转视角">${icon('reset')}</button><button id="top-view" title="俯视城市" aria-label="俯视城市">${icon('top')}</button><button id="home-view" title="回到全景" aria-label="回到全景">${icon('home')}</button><span></span><button id="screenshot" title="保存场景截图" aria-label="保存场景截图">${icon('camera')}</button></div>
      <div class="layers-panel" id="layers-panel" hidden><div class="panel-heading"><strong>场景图层</strong><button id="close-layers" class="icon-button" aria-label="关闭图层面板">${icon('close')}</button></div>${[['buildings', 'city', '城市建筑'], ['roads', 'route', '道路与车流'], ['parks', 'tree', '山体与绿地'], ['labels', 'pin', '地标名称']].map(([id, name, label]) => `<label class="layer-row">${icon(name)}<span>${label}</span><input type="checkbox" data-layer="${id}" checked><span class="switch"></span></label>`).join('')}</div>
      <div class="landmark-detail" id="landmark-detail" hidden></div>
      <div class="scene-bottom"><div class="scene-legend"><span><i class="legend-building"></i>城市建筑</span><span><i class="legend-route"></i>鲲鹏径 · 山海连城主脊</span><span><i class="legend-park"></i>山体与公园</span><span><i class="legend-water"></i>海湾水域</span></div><span class="model-note">示意布局 · 非测绘数据</span></div>
      <div class="loading-screen" id="loading"><div class="loading-city">${icon('city')}</div><strong>让一座城市，慢慢浮现</strong><span>BUILDING SHENZHEN</span></div>
    </section>
  </main>
  <footer class="bottom-bar"><div class="view-hint">${icon('mouse')}<span>拖动旋转<span class="hint-divider">/</span>滚轮缩放<span class="hint-divider">/</span>右键平移</span></div><div class="time-controls"><div class="time-title">${icon('sun')}<span>城市时光</span><strong id="time-value">14:00</strong></div><input id="time-range" type="range" min="6" max="22" value="14" step="0.25" aria-label="城市时间"><div class="time-presets" role="group" aria-label="光照预设"><button data-time="14" class="active" aria-pressed="true" title="日间" aria-label="日间">${icon('sun')}</button><button data-time="18" aria-pressed="false" title="黄昏" aria-label="黄昏">${icon('sunset')}</button><button data-time="22" aria-pressed="false" title="夜景" aria-label="夜景">${icon('moon')}</button></div></div><button id="tour" class="tour-button" aria-pressed="false">${icon('play')}<span>开启城市漫游</span></button></footer>
  <div id="toast" class="toast" role="status" aria-live="polite"></div>
  <dialog id="about-dialog"><button class="dialog-close icon-button" aria-label="关闭关于模型">${icon('close')}</button><div class="eyebrow">SHENZHEN CITY ATLAS</div><h2>把深圳，放在眼前。</h2><p>以深圳地标、山体与海湾为灵感建立的可交互三维沙盘。${landmarks.length} 处标志性建筑与场馆群采用各自的几何造型，周围街区、海岸和山体经过压缩与艺术化处理。</p><div class="about-stats"><div><strong>${landmarks.length}</strong><span>城市地标</span></div><div><strong id="building-count">—</strong><span>模型建筑</span></div><div><strong id="tree-count">—</strong><span>场景树木</span></div></div><p class="about-note">本模型不代表真实建筑位置、尺寸、行政区边界或道路拓扑，不能用于测绘或导航。GLB 导出包含完整城市模型；截图保存当前三维画面。</p><p class="keyboard-note">键盘操作：Tab 切换控件；聚焦场景后用方向键平移。触屏操作：单指旋转，双指缩放和平移。</p><button id="about-done" class="export-button">开始探索 ${icon('arrow')}</button></dialog>
`;

let city;
let selectedId = null;
let labelsVisible = true;
let buildingsVisible = true;
let tourTimer = null;
let tourIndex = 0;
let toastTimer;
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3500);
}

function stopTour() {
  if (tourTimer) clearInterval(tourTimer);
  tourTimer = null;
  $('#tour').innerHTML = `${icon('play')}<span>开启城市漫游</span>`;
  $('#tour').setAttribute('aria-pressed', 'false');
}

function selectLandmark(id, fromTour = false) {
  if (!city) return;
  if (!fromTour) stopTour();
  const landmark = landmarks.find(item => item.id === id);
  if (!landmark) return;
  if (!buildingsVisible) {
    buildingsVisible = true;
    $('[data-layer="buildings"]').checked = true;
    city.setLayer('buildings', true);
  }
  selectedId = id;
  city.focus(id);
  $$('.landmark-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.landmark === id);
    card.setAttribute('aria-pressed', String(card.dataset.landmark === id));
  });
  $('#landmark-detail').innerHTML = `<div class="detail-topline"><span>${landmark.district} · ${landmark.tag}</span><button class="icon-button" id="close-detail" aria-label="关闭地标详情">${icon('close')}</button></div><h2>${landmark.name}</h2><div class="detail-en">${landmark.english}</div><p>${landmark.description}</p>${landmark.reference ? `<a class="reference-link" href="${landmark.reference.url}" target="_blank" rel="noopener noreferrer">外形参考 · ${landmark.reference.label} ↗</a>` : ''}<div class="detail-bottom"><span>${icon('pin')}地标特写</span><button id="detail-home">返回城市全景 ${icon('arrow')}</button></div>`;
  $('#landmark-detail').hidden = false;
  $('#close-detail').addEventListener('click', () => { $('#landmark-detail').hidden = true; });
  $('#detail-home').addEventListener('click', goHome);
}

function goHome() {
  if (!city) return;
  stopTour();
  selectedId = null;
  $('#landmark-detail').hidden = true;
  $$('.landmark-card').forEach(card => { card.classList.remove('selected'); card.setAttribute('aria-pressed', 'false'); });
  city.home();
}

const labelNodes = landmarks.map(l => {
  const node = document.createElement('button');
  node.className = 'map-label';
  node.innerHTML = `<span class="label-dot"></span>${l.name}`;
  node.setAttribute('aria-label', `定位${l.name}`);
  node.addEventListener('click', () => selectLandmark(l.id));
  $('#map-labels').appendChild(node);
  return { node, ...l };
});
const districts = [...districtLabels, ...subdistrictLabels].map(d => {
  const node = document.createElement('div');
  node.className = 'district-label';
  node.innerHTML = `${d.name}<span>${d.english}</span>`;
  $('#map-labels').appendChild(node);
  return { node, ...d };
});
const ecoNodes = ecoLabels.map(site => {
  const node = document.createElement('div');
  node.className = 'eco-label';
  node.innerHTML = `<span>${site.name}</span><small>${site.district} · 山海连城</small>`;
  node.setAttribute('aria-label', `${site.district}：${site.name}，山海连城生态节点`);
  $('#map-labels').appendChild(node);
  return { node, ...site };
});

function updateLabels(scene) {
  const occupied = [];
  // Selected labels get priority; bounding estimates avoid per-frame layout reads.
  const ordered = [...labelNodes].sort((a, b) => Number(b.id === selectedId) - Number(a.id === selectedId));
  for (const l of ordered) {
    const p = scene.project(l.x, l.height + 2, l.z);
    const width = l.name.length * 12 + 28;
    const left = p.x - width / 2;
    const top = p.y - 29;
    const visible = labelsVisible && buildingsVisible && p.visible && left > 4 && left + width < scene.width - 65 && top > 104 && top < scene.height - 75 && !occupied.some(r => left < r.x + r.w && left + width > r.x && top < r.y + 32 && top + 32 > r.y);
    l.node.hidden = !visible;
    if (visible) {
      l.node.style.transform = `translate(${left}px, ${top}px)`;
      l.node.classList.toggle('selected', l.id === selectedId);
      occupied.push({ x: left, y: top, w: width });
    }
  }
  const overviewOnly = scene.camera.zoom < 1.12;
  const ecoOccupied = [];
  for (const site of ecoNodes) {
    const p = scene.project(site.x, site.y, site.z);
    const width = site.name.length * 11 + site.district.length * 6 + 49;
    const left = p.x - width / 2;
    const top = p.y - 42;
    const showAtZoom = overviewOnly ? site.overview : true;
    const visible = labelsVisible && buildingsVisible && !selectedId && showAtZoom && p.visible
      && left > 4 && left + width < scene.width - 62 && top > 104 && top < scene.height - 78
      && !ecoOccupied.some(r => left < r.x + r.w && left + width > r.x && top < r.y + 38 && top + 38 > r.y);
    site.node.hidden = !visible;
    if (visible) {
      site.node.style.transform = `translate(${left}px, ${top}px)`;
      ecoOccupied.push({ x: left, y: top, w: width });
    }
  }
  for (const d of districts) {
    const p = scene.project(d.x, 1, d.z);
    d.node.hidden = !labelsVisible || !!selectedId || scene.camera.zoom > 1.45 || p.x < 40 || p.x > scene.width - 70 || p.y < 100 || p.y > scene.height - 70;
    d.node.style.transform = `translate(${p.x - 28}px, ${p.y}px)`;
  }
  const bay = scene.project(-10, -1, 60);
  $('#bay-label').hidden = !!selectedId || bay.x < 60 || bay.x > scene.width - 80 || bay.y > scene.height - 65;
  $('#bay-label').style.transform = `translate(${bay.x - 50}px, ${bay.y}px)`;
  const angle = Math.atan2(scene.camera.position.x - scene.controls.target.x, scene.camera.position.z - scene.controls.target.z) * 180 / Math.PI;
  $('#compass-needle').setAttribute('transform', `rotate(${-angle} 32 32)`);
}

function setTime(value) {
  if (!city) return;
  const hour = Number(value);
  city.setTime(hour);
  $('#time-range').value = String(hour);
  const hh = Math.floor(hour).toString().padStart(2, '0');
  const mm = Math.round(hour % 1 * 60).toString().padStart(2, '0');
  $('#time-value').textContent = `${hh}:${mm}`;
  document.body.classList.toggle('night', hour >= 19.5);
  const preset = hour < 17 ? 14 : hour < 20 ? 18 : 22;
  $$('[data-time]').forEach(button => { const active = Number(button.dataset.time) === preset; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

$$('.landmark-card').forEach(card => card.addEventListener('click', () => selectLandmark(card.dataset.landmark)));
$$('[data-filter]').forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  $$('[data-filter]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
  $$('.landmark-card').forEach(card => {
    const item = landmarks.find(l => l.id === card.dataset.landmark);
    card.hidden = filter !== '全部' && item.district !== filter && item.subdistrict !== filter;
  });
  $('.landmark-list').scrollTo({ top: 0, left: 0 });
}));
$('#overview').addEventListener('click', goHome);
$('.brand').addEventListener('click', event => { event.preventDefault(); goHome(); });
$('#explore-nav').addEventListener('click', () => { goHome(); toggleLayers(false); });
$('#home-view').addEventListener('click', goHome);
$('#zoom-in').addEventListener('click', () => { stopTour(); city?.zoomBy(1.22); });
$('#zoom-out').addEventListener('click', () => { stopTour(); city?.zoomBy(1 / 1.22); });
$('#rotate-view').addEventListener('click', () => { stopTour(); city?.rotateBy(Math.PI / 8); });
$('#top-view').addEventListener('click', () => { goHome(); city?.overhead(); });
$('#time-range').addEventListener('input', event => setTime(event.target.value));
$$('[data-time]').forEach(button => button.addEventListener('click', () => setTime(button.dataset.time)));
$('#tour').addEventListener('click', () => {
  if (!city) return;
  if (tourTimer) { stopTour(); return; }
  tourIndex = 0;
  const next = () => { selectLandmark(landmarks[tourIndex % landmarks.length].id, true); tourIndex++; };
  next();
  tourTimer = setInterval(next, 7000);
  $('#tour').innerHTML = `${icon('pause')}<span>暂停城市漫游</span>`;
  $('#tour').setAttribute('aria-pressed', 'true');
});
$('#canvas-container').addEventListener('manualinteraction', stopTour);
document.addEventListener('visibilitychange', () => { if (document.hidden) stopTour(); });

function toggleLayers(open) {
  $('#layers-panel').hidden = !open;
  $('#layers-nav').setAttribute('aria-expanded', String(open));
  $('#layers-nav').classList.toggle('active', open);
}
$('#layers-nav').addEventListener('click', () => toggleLayers($('#layers-panel').hidden));
$('#close-layers').addEventListener('click', () => toggleLayers(false));
$$('[data-layer]').forEach(input => input.addEventListener('change', () => {
  if (input.dataset.layer === 'labels') labelsVisible = input.checked;
  else {
    if (input.dataset.layer === 'buildings') { buildingsVisible = input.checked; if (!input.checked) { stopTour(); $('#landmark-detail').hidden = true; } }
    city?.setLayer(input.dataset.layer, input.checked);
  }
}));
$('#about-nav').addEventListener('click', () => $('#about-dialog').showModal());
$('.dialog-close').addEventListener('click', () => $('#about-dialog').close());
$('#about-done').addEventListener('click', () => $('#about-dialog').close());
document.addEventListener('keydown', e => { if (e.key === 'Escape') { toggleLayers(false); $('#landmark-detail').hidden = true; stopTour(); } });

$('#export').addEventListener('click', async () => {
  if (!city) return;
  const button = $('#export');
  button.disabled = true;
  button.innerHTML = `${icon('download')}<span>正在导出…</span>`;
  try {
    const model = await city.exportModel();
    download(new Blob([model], { type: 'model/gltf-binary' }), 'shenzhen-city.glb');
    toast('完整深圳城市模型已导出');
  } catch (error) {
    console.error('Model export failed:', error);
    toast('模型导出失败，请重试');
  } finally {
    button.disabled = false;
    button.innerHTML = `${icon('download')}<span>导出模型</span><span class="filetype">GLB</span>`;
  }
});
$('#screenshot').addEventListener('click', async () => {
  if (!city) return;
  try { download(await city.screenshot(), 'shenzhen-city.png'); toast('当前城市画面已保存'); }
  catch (error) { console.error(error); toast('截图保存失败，请重试'); }
});

// Allow the loading shell to paint before constructing geometry.
requestAnimationFrame(() => requestAnimationFrame(() => {
  try {
    city = new ShenzhenCity($('#canvas-container'), selectLandmark, updateLabels);
    $('#building-count').textContent = city.buildingCount;
    $('#tree-count').textContent = city.treeCount;
    $('#scene-status').textContent = '自由探索';
    $('#loading').remove();
    document.documentElement.dataset.ready = 'true';
    // Read-only counters make renderer health observable without exposing control APIs.
    window.getCityDiagnostics = () => ({ ready: true, transitioning: !!city.flight, buildings: city.buildingCount, trees: city.treeCount, landmarks: landmarks.length, selected: selectedId, zoom: city.camera.zoom, hour: city.hour, camera: city.camera.position.toArray(), target: city.controls.target.toArray(), tour: !!tourTimer, layers: Object.fromEntries(Object.entries(city.layers).map(([name, layer]) => [name, layer.visible])), render: { calls: city.renderer.info.render.calls, triangles: city.renderer.info.render.triangles } });
  } catch (error) {
    console.error('City initialization failed:', error);
    $('#scene-status').textContent = '场景不可用';
    $('#loading').innerHTML = `${icon('info')}<strong>暂时无法建立三维场景</strong><p>请使用支持 WebGL 2 的浏览器，并开启硬件加速。</p><button class="export-button" onclick="location.reload()">重新加载</button>`;
    for (const control of $$('.view-tools button, #export, #tour, #time-range, [data-time], [data-layer]')) control.disabled = true;
  }
}));
