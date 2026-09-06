import * as THREE from 'three';
import { RESUME, ONE_LINERS, STAPLER_QUOTES } from './data.js';

// ── DOM refs ──
const overlay = document.getElementById('overlay');
const overlayContent = document.getElementById('overlay-content');
const tooltip = document.getElementById('tooltip');

// ── Scene ──
const scene = new THREE.Scene();
scene.background = new THREE.Color('#1a1410');
scene.fog = new THREE.Fog('#1a1410', 4, 14);

// ── Camera ──
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 30);
camera.position.set(0, 1.2, 3.8);
camera.lookAt(0, 0.3, 0);

// ── Renderer ──
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.body.prepend(renderer.domElement);

// ── Lighting ──
const ambient = new THREE.AmbientLight('#3a3028', 0.6);
scene.add(ambient);

const lamp = new THREE.SpotLight('#ffe0b0', 40, 8, Math.PI / 5, 0.3, 0.6);
lamp.position.set(0.6, 2.2, -0.3);
lamp.castShadow = true;
lamp.shadow.mapSize.set(1024, 1024);
lamp.shadow.bias = -0.0001;
scene.add(lamp);

const fill = new THREE.PointLight('#4a4038', 3, 6);
fill.position.set(-1.5, 1.8, 0.5);
scene.add(fill);

// ── Materials ──
const mat = {
  wall:    new THREE.MeshStandardMaterial({ color: '#3a322c', roughness: 0.9 }),
  baseboard: new THREE.MeshStandardMaterial({ color: '#1a1008', roughness: 0.8 }),
  floor:   new THREE.MeshStandardMaterial({ color: '#2a1f18', roughness: 0.7 }),
  desk:    new THREE.MeshStandardMaterial({ color: '#3d2818', roughness: 0.6 }),
  deskTop: new THREE.MeshStandardMaterial({ color: '#4a3220', roughness: 0.55 }),
  cabinet: new THREE.MeshStandardMaterial({ color: '#4a4238', roughness: 0.5, metalness: 0.2 }),
  cabFront: new THREE.MeshStandardMaterial({ color: '#3a3228', roughness: 0.45, metalness: 0.25 }),
  drawer:  new THREE.MeshStandardMaterial({ color: '#4a4238', roughness: 0.45, metalness: 0.15 }),
  handle:  new THREE.MeshStandardMaterial({ color: '#6a6258', roughness: 0.3, metalness: 0.5 }),
  monitor: new THREE.MeshStandardMaterial({ color: '#3a3228', roughness: 0.5 }),
  screen:  new THREE.MeshStandardMaterial({ color: '#0a0f0a', roughness: 0.3, emissive: '#002200', emissiveIntensity: 0.4 }),
  stapler: new THREE.MeshStandardMaterial({ color: '#cc2233', roughness: 0.3, metalness: 0.1 }),
  mug:     new THREE.MeshStandardMaterial({ color: '#f0ebe0', roughness: 0.4 }),
  cork:    new THREE.MeshStandardMaterial({ color: '#6a5a3a', roughness: 0.95 }),
  corkFrame: new THREE.MeshStandardMaterial({ color: '#3a2a1a', roughness: 0.6 }),
  photo:   new THREE.MeshStandardMaterial({ color: '#3d6fa0', roughness: 0.5 }),
  photoFrame: new THREE.MeshStandardMaterial({ color: '#3a2a1a', roughness: 0.6 }),
  calendar: new THREE.MeshStandardMaterial({ color: '#f5f0e8', roughness: 0.5 }),
  calHeader: new THREE.MeshStandardMaterial({ color: '#cc2233', roughness: 0.3 }),
  paper:   new THREE.MeshStandardMaterial({ color: '#f5f0d0', roughness: 0.8 }),
  pin:     new THREE.MeshStandardMaterial({ color: '#cc2233', roughness: 0.3, metalness: 0.2 }),
};

// ── Interactive objects map ──
const interactives = [];

// ── Helpers ──
function box(w, h, d, material, name) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (name) mesh.name = name;
  return mesh;
}

function plane(w, h, material) {
  const geo = new THREE.PlaneGeometry(w, h);
  const mesh = new THREE.Mesh(geo, material);
  mesh.receiveShadow = true;
  return mesh;
}

// ── Room ──
const wallGeo = new THREE.PlaneGeometry(16, 3.6);
const wall = new THREE.Mesh(wallGeo, mat.wall);
wall.position.set(0, 1.8, -4);
wall.receiveShadow = true;
scene.add(wall);

// Floor
const floorGeo = new THREE.PlaneGeometry(16, 10);
const floor = new THREE.Mesh(floorGeo, mat.floor);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.1;
scene.add(floor);

// Rug under desk
const rug = new THREE.Mesh(
  new THREE.PlaneGeometry(3.5, 2.8),
  new THREE.MeshStandardMaterial({ color: '#2a1a0e', roughness: 0.95 })
);
rug.rotation.x = -Math.PI / 2;
rug.position.set(0, -0.09, 0.5);
scene.add(rug);

// ── Desk ──
const deskBody = box(3, 0.85, 1.6, mat.desk, 'desk');
deskBody.position.set(0, -0.1 + 0.425, 1.3);
scene.add(deskBody);

const deskTop = box(3.2, 0.06, 1.8, mat.deskTop);
deskTop.position.set(0, -0.1 + 0.88, 1.3);
scene.add(deskTop);

// ── Filing Cabinet ──
const cabGroup = new THREE.Group();
cabGroup.position.set(-1.6, -0.1, 0.15);
scene.add(cabGroup);

const cabBody = box(0.55, 1.35, 0.6, mat.cabinet, 'cabinet');
cabBody.position.set(0, 0.675, 0);
cabGroup.add(cabBody);

// 3 drawers
const drawerData = [
  { y: 0.95, label: 'Experience', id: 'experience' },
  { y: 0.55, label: 'Projects',   id: 'projects' },
  { y: 0.15, label: 'Skills',     id: 'skills' },
];

const drawers = {};
drawerData.forEach(({ y, label, id }) => {
  const g = new THREE.Group();
  g.position.set(0.315, y, 0);
  g.name = `drawer-${id}`;

  const front = box(0.07, 0.33, 0.56, mat.drawer);
  front.position.set(0, 0, 0);
  g.add(front);

  const h = box(0.25, 0.04, 0.03, mat.handle);
  h.position.set(0.03, 0, 0.29);
  g.add(h);

  cabGroup.add(g);
  drawers[id] = g;
  interactives.push({ mesh: front, id: `drawer-${id}`, drawerGroup: g });
});

// ── Monitor ──
const monGroup = new THREE.Group();
monGroup.position.set(0, 0.9, 0.8);
monGroup.name = 'monitor';
scene.add(monGroup);

const screen = box(0.95, 0.72, 0.06, mat.screen);
screen.position.set(0, 0.15, 0);
screen.castShadow = false;
monGroup.add(screen);

const bezel = box(1.02, 0.78, 0.08, mat.monitor);
bezel.position.set(0, 0.15, -0.01);
bezel.castShadow = false;
monGroup.add(bezel);

const stand = box(0.12, 0.2, 0.12, mat.monitor);
stand.position.set(0, -0.3, 0);
monGroup.add(stand);

const base = box(0.35, 0.04, 0.25, mat.monitor);
base.position.set(0, -0.42, 0);
monGroup.add(base);

interactives.push({ mesh: screen, id: 'monitor' });

// ── Red Stapler ──
const stapler = new THREE.Group();
stapler.position.set(1.05, 0.85, 0.3);
stapler.rotation.y = -0.3;
stapler.name = 'stapler';
scene.add(stapler);

const staplerBody = box(0.14, 0.05, 0.06, mat.stapler);
staplerBody.position.set(0, 0, 0);
stapler.add(staplerBody);

const staplerTop = box(0.12, 0.03, 0.05, mat.stapler);
staplerTop.position.set(0, 0.04, 0.005);
stapler.add(staplerTop);

interactives.push({ mesh: staplerBody, id: 'stapler' });

// ── Coffee Mug ──
const mug = new THREE.Group();
mug.position.set(1.18, 0.86, 0.6);
mug.name = 'mug';
scene.add(mug);

const mugCyl = new THREE.Mesh(
  new THREE.CylinderGeometry(0.04, 0.045, 0.1, 16),
  mat.mug
);
mugCyl.position.y = 0.05;
mug.add(mugCyl);

const mugHandle = new THREE.Mesh(
  new THREE.TorusGeometry(0.025, 0.008, 8, 8, Math.PI),
  mat.mug
);
mugHandle.position.set(0.055, 0.05, 0);
mugHandle.rotation.z = Math.PI / 2;
mug.add(mugHandle);

interactives.push({ mesh: mugCyl, id: 'mug' });

// ── Corkboard ──
const corkGroup = new THREE.Group();
corkGroup.position.set(-1.6, 2.45, -3.95);
corkGroup.name = 'corkboard';
scene.add(corkGroup);

const corkBoard = plane(0.75, 0.52, mat.cork);
corkGroup.add(corkBoard);

const corkF = box(0.79, 0.56, 0.02, mat.corkFrame);
corkF.position.z = 0.01;
corkGroup.add(corkF);

// Sticky notes on corkboard
function note(text, x, y, rot, color) {
  const n = plane(0.22, 0.12, new THREE.MeshStandardMaterial({ color, roughness: 0.8 }));
  n.position.set(x, y, 0.015);
  n.rotation.z = rot;
  corkGroup.add(n);
}
note('', 0.12, 0.08, -0.05, '#f5f0d0');
note('', -0.18, -0.02, 0.03, '#d0f0d0');
note('', 0.05, -0.1, -0.02, '#f0d0d0');

interactives.push({ mesh: corkBoard, id: 'about' });

// ── Photo Frame ──
const photoGroup = new THREE.Group();
photoGroup.position.set(1.3, 2.5, -3.93);
photoGroup.name = 'photo';
scene.add(photoGroup);

const photoImg = plane(0.22, 0.16, mat.photo);
photoImg.position.z = 0.005;
photoGroup.add(photoImg);

const photoF = box(0.26, 0.2, 0.015, mat.photoFrame);
photoF.position.z = 0.008;
photoGroup.add(photoF);

interactives.push({ mesh: photoImg, id: 'about' });

// ── Calendar ──
const calGroup = new THREE.Group();
calGroup.position.set(0.7, 2.5, -3.93);
calGroup.name = 'calendar';
scene.add(calGroup);

const calBody = plane(0.16, 0.2, mat.calendar);
calGroup.add(calBody);

const calHdr = plane(0.16, 0.05, mat.calHeader);
calHdr.position.y = 0.075;
calHdr.position.z = 0.003;
calGroup.add(calHdr);

interactives.push({ mesh: calBody, id: 'contact' });

// ── Sticky notes on corkboard (redone as proper note shapes) ──
const noteTexts = [
  { text: 'DEA compliance\nis paperwork\nwith extra steps', x: 0.12, y: 0.08, rot: -0.05, col: '#f5f0d0' },
  { text: 'Python > Excel\nfight me', x: -0.18, y: -0.02, rot: 0.03, col: '#d0f0d0' },
  { text: 'Q4 2026 → STP', x: 0.05, y: -0.1, rot: -0.02, col: '#f0d0d0' },
];

// Remove old note planes and re-add properly
corkGroup.children.length = 0;
corkGroup.add(corkBoard);
corkGroup.add(corkF);

noteTexts.forEach(({ x, y, rot, col }) => {
  const n = plane(0.22, 0.12, new THREE.MeshStandardMaterial({ color: col, roughness: 0.8 }));
  n.position.set(x, y, 0.015);
  n.rotation.z = rot;
  corkGroup.add(n);
});

// Pushpin dots
for (let i = 0; i < 4; i++) {
  const pin = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), mat.pin);
  pin.position.set(
    (Math.random() - 0.5) * 0.6,
    (Math.random() - 0.5) * 0.4,
    0.025
  );
  corkGroup.add(pin);
}

// ── Raycaster ──
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const allMeshes = [];

scene.traverse((child) => {
  if (child.isMesh) allMeshes.push(child);
});

let hovered = null;
let openDrawer = null;
let staplerClicks = 0;

// ── Overlay ──
window.closeOverlay = () => {
  overlay.classList.remove('active');
};

overlay.addEventListener('click', (e) => {
  if (e.target === overlay) overlay.classList.remove('active');
});

function showOverlay(section) {
  const data = RESUME[section];
  if (!data) return;
  let html = `<h2>${data.title}</h2>`;
  data.sections.forEach(sec => {
    html += `<div class="section">${sec.label}</div>`;
    sec.items.forEach(item => {
      html += `<div class="bullet">${item}</div>`;
    });
  });
  if (section === 'projects') {
    html += '<a class="btn" href="gaming.html" style="margin-right:0.5rem;">🎮 Play Poker</a>';
    html += '<a class="btn" href="finance.html" style="margin-right:0.5rem;">📊 Quant Research</a>';
    html += '<a class="btn" href="labs.html">🔧 Hardware & Labs</a>';
  }
  if (section === 'contact') {
    html += '<a class="btn" href="finance.html" style="margin-right:0.5rem;">📊 Quant Research</a>';
  }
  overlayContent.innerHTML = html;
  overlay.classList.add('active');
}

// ── Tooltip ──
let tooltipTimeout;
function showTooltip(text) {
  tooltip.textContent = text;
  tooltip.classList.add('visible');
  clearTimeout(tooltipTimeout);
  tooltipTimeout = setTimeout(() => tooltip.classList.remove('visible'), 3000);
}

// ── Drawer animation ──
function toggleDrawer(id) {
  if (openDrawer === id) {
    // Close
    const g = drawers[id];
    if (g) g.position.x = 0.315;
    openDrawer = null;
    return;
  }
  // Close previous
  if (openDrawer && drawers[openDrawer]) {
    drawers[openDrawer].position.x = 0.315;
  }
  // Open new
  if (drawers[id]) {
    drawers[id].position.x = 0.55;
    openDrawer = id;
    showTooltip(`${id.charAt(0).toUpperCase() + id.slice(1)} section open. Click again to close.`);
  }
}

// ── Click handling ──
renderer.domElement.addEventListener('click', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(allMeshes);

  if (!intersects.length) {
    if (openDrawer) {
      toggleDrawer(openDrawer);
    }
    return;
  }

  const obj = intersects[0].object;
  const name = obj.name || '';

  // Walk up to find named parent
  let target = obj;
  while (target && !target.name) target = target.parent;
  const targetName = (target && target.name) || name;

  // Check interactives
  for (const iv of interactives) {
    if (obj === iv.mesh || obj.parent === iv.mesh || (iv.mesh.name && obj.name === iv.mesh.name)) {
      const id = iv.id;
      if (id.startsWith('drawer-')) {
        toggleDrawer(id.replace('drawer-', ''));
      } else if (id === 'monitor') {
        showOverlay('projects');
      } else if (id === 'stapler') {
        const q = STAPLER_QUOTES[staplerClicks % STAPLER_QUOTES.length];
        staplerClicks++;
        showTooltip(q);
      } else if (id === 'mug') {
        const q = ONE_LINERS[Math.floor(Math.random() * ONE_LINERS.length)];
        showTooltip(q);
      } else if (['about', 'contact', 'experience', 'skills', 'projects'].includes(id)) {
        showOverlay(id);
      }
      return;
    }
  }

  // Fallback: check parent chain
  let p = obj;
  while (p) {
    const pn = p.name || '';
    if (pn === 'corkboard') { showOverlay('about'); return; }
    if (pn === 'photo') { showOverlay('about'); return; }
    if (pn === 'calendar') { showOverlay('contact'); return; }
    if (pn === 'monitor') { showOverlay('projects'); return; }
    p = p.parent;
  }
});

// ── Hover ──
renderer.domElement.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(allMeshes);

  if (intersects.length) {
    const obj = intersects[0].object;
    let p = obj;
    while (p) {
      const pn = p.name || '';
      if (pn === 'corkboard' || pn === 'photo' || pn === 'calendar' || pn === 'monitor' ||
          pn === 'stapler' || pn === 'mug' || pn.startsWith('drawer-') || pn === 'cabinet') {
        renderer.domElement.style.cursor = 'pointer';
        return;
      }
      p = p.parent;
    }
  }
  renderer.domElement.style.cursor = 'default';
});

// ── Render ──
function animate() {
  requestAnimationFrame(animate);

  // Subtle lamp flicker
  lamp.intensity = 38 + Math.sin(Date.now() * 0.003) * 2 + Math.random() * 0.8;
  screen.material.emissiveIntensity = 0.35 + Math.sin(Date.now() * 0.002) * 0.08;

  renderer.render(scene, camera);
}
animate();

// ── Resize ──
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});