// ============ 3D 场景：棋盘 / 角色 / 房屋 / 骰子 / 动画 ============
import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { CHARS, GROUPS, tileWorld, TILE_COUNT, GRID } from './config.js';
import { boardCanvas, diceFaceCanvas, coinCanvas, buildingCanvas, canvas } from './draw.js';

export const scene = {
  sound: null,          // 由 main.js 注入
  _camera: null, _controls: null, _renderer: null,
  _board: null, _chars: [], _activeRing: null,
  _houseContainers: new Map(), _blockMeshes: new Map(),
  _dice: [], _diceGroup: null, _diceRolling: false,
  _tweens: [], _sprites: [],
  _guides: [],
  followMode: true, _userDragging: false,
  _ready: false,

  // ---------------- 初始化 ----------------
  init(canvas) {
    this._renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color('#8fd3ff');
    this._scene.fog = new THREE.Fog('#8fd3ff', 30, 90);

    this._camera = new THREE.PerspectiveCamera(36, 1, 0.1, 200);
    this._fitCamera();

    this._controls = new OrbitControls(this._camera, canvas);
    this._controls.enableDamping = true;
    this._controls.dampingFactor = 0.08;
    this._controls.target.set(0, 0, 0);
    this._controls.minPolarAngle = 0.12;
    this._controls.maxPolarAngle = 1.25;
    this._controls.minDistance = 8;
    this._controls.maxDistance = 55;
    this._controls.enablePan = false;
    this._controls.rotateSpeed = 0.7;
    this._controls.zoomSpeed = 0.8;
    // 用户拖动镜头时暂停自动跟随，松开后恢复
    this._controls.addEventListener('start', () => { this._userDragging = true; });
    this._controls.addEventListener('end', () => { this._userDragging = false; });

    // 棋盘格悬停高亮 / 点击查看信息
    this._raycaster = new THREE.Raycaster();
    this._pointerNDC = new THREE.Vector2();
    this._hoverIdx = -1;
    this._clickStart = null;
    this.onTileClick = null;
    const el = this._renderer.domElement;
    el.addEventListener('pointermove', (e) => {
      this._pointerNDC.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      this._raycaster.setFromCamera(this._pointerNDC, this._camera);
      const hits = this._raycaster.intersectObject(this._board, false);
      const idx = hits.length ? this._tileAt(hits[0].point.x, hits[0].point.z) : -1;
      if (idx !== this._hoverIdx) {
        this._hoverIdx = idx;
        this._updateHover();
      }
    });
    el.addEventListener('pointerdown', (e) => {
      this._clickStart = { x: e.clientX, y: e.clientY, t: performance.now() };
    });
    el.addEventListener('pointerup', (e) => {
      if (!this._clickStart) return;
      const dx = e.clientX - this._clickStart.x;
      const dy = e.clientY - this._clickStart.y;
      const dt = performance.now() - this._clickStart.t;
      this._clickStart = null;
      if (Math.hypot(dx, dy) < 7 && dt < 400 && this._hoverIdx >= 0 && this.onTileClick) {
        this.onTileClick(this._hoverIdx);
      }
    });

    // 灯光
    const hemi = new THREE.HemisphereLight(0xffffff, 0xd8b878, 1.0);
    this._scene.add(hemi);
    this._sun = new THREE.DirectionalLight(0xfff3d6, 1.6);
    this._sun.position.set(9, 22, 12);
    this._sun.castShadow = true;
    this._sun.shadow.mapSize.set(2048, 2048);
    this._sun.shadow.camera.left = -15; this._sun.shadow.camera.right = 15;
    this._sun.shadow.camera.top = 15; this._sun.shadow.camera.bottom = -15;
    this._sun.shadow.camera.near = 1; this._sun.shadow.camera.far = 70;
    this._sun.shadow.bias = -0.0005;
    this._scene.add(this._sun);

    // 地面
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(70, 48),
      new THREE.MeshStandardMaterial({ color: '#79cf55', roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.72;
    ground.receiveShadow = true;
    this._scene.add(ground);
    // 沙地边缘
    const sand = new THREE.Mesh(
      new THREE.CircleGeometry(72, 48),
      new THREE.MeshStandardMaterial({ color: '#e8d9a0', roughness: 1 })
    );
    sand.rotation.x = -Math.PI / 2;
    sand.position.y = -0.74;
    this._scene.add(sand);

    this._buildBoard();
    this._buildDice();
    this._resize();
    window.addEventListener('resize', () => this._resize());
    this._ready = true;
    this._loop();
  },

  _fitCamera() {
    // 根据屏幕宽高比自适应距离，保证棋盘完整可见（竖屏也能看全）
    const aspect = Math.max(0.3, window.innerWidth / Math.max(1, window.innerHeight));
    const fov = (36 * Math.PI) / 180;
    const need = 14.9;   // 棋盘几乎充满视野（格子更大）
    const d = Math.max(need / (2 * Math.tan(fov / 2)), need / (2 * Math.tan(fov / 2) * aspect));
    this._dist = d;
    if (this._camera) {
      const phi = 0.5; // 更俯视，棋盘显得更大
      this._camera.position.set(0, d * Math.sin(phi), d * Math.cos(phi));
      this._camera.lookAt(0, 0, 0);
    }
  },
  _resize() {
    if (!this._renderer) return;
    const w = window.innerWidth, h = window.innerHeight;
    this._aspect = w / h;
    this._renderer.setSize(w, h);
    this._camera.aspect = this._aspect;
    this._camera.updateProjectionMatrix();
    this._fitCamera();
    if (this._controls) this._controls.update();
  },

  // ---------------- 棋盘 ----------------
  _buildBoard() {
    const tex = new THREE.CanvasTexture(boardCanvas());
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, this._renderer.capabilities.getMaxAnisotropy());

    const sideMat = new THREE.MeshStandardMaterial({ color: '#a82818', roughness: 0.7 });
    const topMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75 });
    const board = new THREE.Mesh(new THREE.BoxGeometry(GRID, 0.55, GRID), [sideMat, sideMat, topMat, sideMat, sideMat, sideMat]);
    board.position.y = -0.275;
    board.receiveShadow = true;
    board.castShadow = true;
    this._scene.add(board);
    this._board = board;

    // 木桌
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(15.6, 0.36, 15.6),
      new THREE.MeshStandardMaterial({ color: '#c98a4b', roughness: 0.8 })
    );
    table.position.y = -0.63;
    table.receiveShadow = true;
    this._scene.add(table);

    // 中心小楼（装饰）
    const defs = [
      ['#ff8fb1', '#e8384f', 1.25, -4.2, -4.2],
      ['#8ecdf5', '#2f6fd6', 1.5, 4.2, -4.2],
      ['#b9e8a0', '#2f9e44', 1.1, -4.2, 4.2],
      ['#ffd9a0', '#f7941e', 1.4, 4.2, 4.2],
    ];
    defs.forEach(([base, accent, hgt, x, z]) => {
      const btex = new THREE.CanvasTexture(buildingCanvas(base, accent));
      btex.colorSpace = THREE.SRGBColorSpace;
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.92, hgt, 0.92),
        new THREE.MeshStandardMaterial({ map: btex, roughness: 0.7 })
      );
      body.position.set(x, hgt / 2, z);
      body.castShadow = true;
      this._scene.add(body);
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(0.68, 0.36, 4),
        new THREE.MeshStandardMaterial({ color: accent, roughness: 0.6 })
      );
      roof.rotation.y = Math.PI / 4;
      roof.position.set(x, hgt + 0.18, z);
      roof.castShadow = true;
      this._scene.add(roof);
    });
  },

  // ---------------- 角色 ----------------
  setPlayers(players) {
    this._chars.forEach(ch => this._scene.remove(ch));
    this._chars = [];
    players.forEach((p, i) => {
      const g = this._buildCharacter(CHARS[p.charIdx], i);
      const w = tileWorld(0);
      // 起点处按玩家编号轻微错开站位
      const off = (i - (players.length - 1) / 2) * 0.34;
      g.position.set(w.x + off, 0, w.z + 0.12);
      g.userData.pidx = i;
      this._scene.add(g);
      this._chars.push(g);
    });
    // 活动光圈
    if (!this._activeRing) {
      this._activeRing = new THREE.Mesh(
        new THREE.RingGeometry(0.3, 0.37, 28),
        new THREE.MeshBasicMaterial({ color: '#3bff6a', transparent: true, opacity: 0.85, side: THREE.DoubleSide })
      );
      this._activeRing.rotation.x = -Math.PI / 2;
      this._activeRing.position.y = 0.02;
      this._scene.add(this._activeRing);
    }
  },

  setActive(idx) {
    this._activeIdx = idx;
  },

  _mat(color, rough = 0.55) {
    return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0.04 });
  },
  _add(g, parent, mesh, x, y, z) {
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  },

  _buildCharacter(def, idx) {
    const g = new THREE.Group();
    const outfit = this._mat(def.outfit), outfit2 = this._mat(def.outfit2);
    const skin = this._mat(def.skin), hairM = this._mat(def.hair);

    // 腿 + 鞋
    const legGeo = new THREE.CapsuleGeometry(0.062, 0.13, 4, 10);
    const shoeGeo = new THREE.BoxGeometry(0.115, 0.065, 0.17);
    const shoeM = this._mat(def.style === 'atu' ? '#5b3a1a' : def.outfit2 === '#ffffff' ? '#e9c46a' : def.outfit2, 0.7);
    [[-0.085, 1], [0.085, -1]].forEach(([x, s]) => {
      this._add(g, g, new THREE.Mesh(legGeo, outfit2), x, 0.13, 0);
      const sh = this._add(g, g, new THREE.Mesh(shoeGeo, shoeM), x, 0.038, 0.025 * s);
      sh.castShadow = true;
    });
    // 身体
    this._add(g, g, new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.24, 6, 16), outfit), 0, 0.44, 0);
    // 手臂
    const armGeo = new THREE.CapsuleGeometry(0.055, 0.14, 4, 10);
    const armL = this._add(g, g, new THREE.Mesh(armGeo, outfit), -0.27, 0.47, 0);
    armL.rotation.z = 0.55;
    const armR = this._add(g, g, new THREE.Mesh(armGeo, outfit), 0.27, 0.47, 0);
    armR.rotation.z = -0.55;
    this._add(g, g, new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 10), skin), -0.345, 0.40, 0);
    this._add(g, g, new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 10), skin), 0.345, 0.40, 0);
    // 头
    const head = this._add(g, g, new THREE.Mesh(new THREE.SphereGeometry(0.2, 22, 18), skin), 0, 0.72, 0);
    // 五官
    const eyeM = this._mat('#241a12', 0.3), glintM = this._mat('#ffffff', 0.2);
    [[-0.075, 1], [0.075, -1]].forEach(([x, s]) => {
      const e = this._add(g, g, new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 8), eyeM), x, 0.755, 0.17);
      this._add(g, g, new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), glintM), x + 0.011 * s, 0.766, 0.201);
    });
    const cheekM = new THREE.MeshStandardMaterial({ color: '#ff9d9d', roughness: 0.7 });
    [[-0.115, 1], [0.115, -1]].forEach(([x, s]) => {
      const ck = this._add(g, g, new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 8), cheekM), x, 0.685, 0.135);
      ck.scale.set(1, 0.62, 0.55);
    });
    this._add(g, g, new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.022, 0.02), this._mat('#c2503a', 0.5)), 0, 0.652, 0.192);
    // 发型
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.205, 18, 12), hairM);
    hairCap.scale.set(1, 0.62, 1);
    this._add(g, g, hairCap, 0, 0.815, -0.01);
    let tails = null;
    switch (def.style) {
      case 'buns': {
        [[-0.155, 1], [0.155, -1]].forEach(([x, s]) => {
          this._add(g, g, new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), hairM), x, 0.845, 0);
          const rib = this._add(g, g, new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.018, 8, 12), this._mat('#e8384f')), x, 0.885, 0);
          rib.rotation.x = Math.PI / 2;
        });
        break;
      }
      case 'strawhat': {
        const cone = this._add(g, g, new THREE.Mesh(new THREE.ConeGeometry(0.29, 0.2, 16), this._mat('#f6c445', 0.7)), 0, 1.0, 0);
        const brim = this._add(g, g, new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.33, 0.035, 16), this._mat('#f6c445', 0.7)), 0, 0.895, 0);
        brim.castShadow = cone.castShadow = true;
        this._add(g, g, new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.035), hairM), 0, 0.665, 0.19);
        break;
      }
      case 'bun': {
        this._add(g, g, new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 10), hairM), 0, 0.9, -0.075);
        this._add(g, g, new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), this._mat('#ffd23e', 0.4)), 0, 0.955, -0.05);
        // 珠链
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2;
          this._add(g, g, new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), this._mat('#ffffff', 0.3)), Math.cos(a) * 0.115, 0.56 + Math.sin(a) * 0.03, Math.sin(a) * 0.115);
        }
        break;
      }
      case 'baby': {
        this._add(g, g, new THREE.Mesh(new THREE.SphereGeometry(0.072, 10, 8), hairM), -0.13, 0.9, 0.09);
        const bib = this._add(g, g, new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), this._mat('#ffffff', 0.6)), 0, 0.46, 0.175);
        bib.scale.set(1, 0.8, 0.35);
        break;
      }
      case 'turban': {
        const t = new THREE.Mesh(new THREE.SphereGeometry(0.212, 16, 12), this._mat('#f2f2f2', 0.7));
        t.scale.set(1, 0.78, 1);
        this._add(g, g, t, 0, 0.83, 0);
        this._add(g, g, new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), this._mat('#2f6fd6', 0.35)), 0, 0.855, 0.185);
        this._add(g, g, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.035), hairM), 0, 0.655, 0.19);
        break;
      }
      case 'band': {
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.195, 0.032, 8, 20), this._mat('#e8442e', 0.6));
        band.rotation.x = Math.PI / 2;
        this._add(g, g, band, 0, 0.79, 0);
        this._add(g, g, new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), this._mat('#e8442e')), 0, 0.79, -0.195);
        break;
      }
      case 'cat': {
        // 三角猫耳 + 粉色内耳
        const earGeo = new THREE.ConeGeometry(0.08, 0.19, 4);
        [[-0.135, -0.32], [0.135, 0.32]].forEach(([x, rz]) => {
          const ear = new THREE.Mesh(earGeo, hairM);
          ear.position.set(x, 0.965, -0.02);
          ear.rotation.z = rz;
          ear.castShadow = true;
          g.add(ear);
          const inner = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.1, 4), this._mat('#ffb3c8'));
          inner.position.set(x + (x > 0 ? -0.012 : 0.012), 0.97, 0.035);
          inner.rotation.z = rz;
          g.add(inner);
        });
        // 胡须
        const wGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 0.15, 4);
        [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sy]) => {
          const w = new THREE.Mesh(wGeo, this._mat('#3a2a1a', 0.6));
          w.position.set(sx * 0.135, 0.685, 0.15);
          w.rotation.y = sx * 0.55;
          w.rotation.x = sy * 0.2;
          g.add(w);
        });
        // 粉鼻
        this._add(g, g, new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.035, 3), this._mat('#ff8fb1')), 0, 0.71, 0.198);
        // 尾巴（轻摆）
        const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.2, 4, 8), hairM);
        tail.position.set(0, 0.5, -0.22);
        tail.rotation.x = -0.9;
        tail.castShadow = true;
        g.add(tail);
        tails = [tail];
        break;
      }
      case 'dog': {
        // 垂耳
        [[-0.2, -0.55], [0.2, 0.55]].forEach(([x, rz]) => {
          const ear = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 10), hairM);
          ear.scale.set(1, 1.5, 0.45);
          ear.position.set(x, 0.82, 0);
          ear.rotation.z = rz;
          ear.castShadow = true;
          g.add(ear);
        });
        // 黑鼻
        this._add(g, g, new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), this._mat('#241a12', 0.35)), 0, 0.715, 0.19);
        // 红项圈 + 金铃铛
        const collar = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.032, 8, 16), this._mat('#e8442e', 0.5));
        collar.rotation.x = Math.PI / 2;
        this._add(g, g, collar, 0, 0.585, 0);
        this._add(g, g, new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), this._mat('#ffd23e', 0.35)), 0, 0.6, 0.14);
        // 尾巴（欢快摇）
        const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.032, 0.18, 4, 8), hairM);
        tail.position.set(0, 0.48, -0.23);
        tail.rotation.x = -1.1;
        tail.castShadow = true;
        g.add(tail);
        tails = [tail];
        break;
      }
    }
    // 领饰
    if (def.style === 'buns') {
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.024, 8, 16), this._mat('#ffd23e', 0.4));
      collar.rotation.x = Math.PI / 2;
      this._add(g, g, collar, 0, 0.585, 0);
    }
    if (def.style === 'turban') {
      const belt = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 8, 18), this._mat('#1b1b1b', 0.6));
      belt.rotation.x = Math.PI / 2;
      this._add(g, g, belt, 0, 0.34, 0);
    }
    if (def.style === 'band') {
      const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 8, 14), this._mat('#e8442e', 0.6));
      scarf.rotation.x = Math.PI / 2;
      this._add(g, g, scarf, 0, 0.585, 0);
    }
    g.scale.setScalar(def.scale);
    g.userData = { def, charScale: def.scale, bob: Math.random() * 6, tails };
    return g;
  },

  // ---------------- 房屋 ----------------
  updateHouses(tileIdx, count, color) {
    let cont = this._houseContainers.get(tileIdx);
    if (!cont) {
      cont = new THREE.Group();
      this._scene.add(cont);
      this._houseContainers.set(tileIdx, cont);
    }
    while (cont.children.length) cont.remove(cont.children[0]);
    if (count <= 0) return;
    const w = tileWorld(tileIdx);
    const len = Math.hypot(w.x, w.z) || 1;
    const dir = { x: -w.x / len, z: -w.z / len };
    const yaw = Math.atan2(dir.x, dir.z);
    const perp = { x: dir.z, z: -dir.x };

    const houseM = (color, rough = 0.6) => new THREE.MeshStandardMaterial({ color, roughness: rough });

    if (count >= 5) {
      const hotel = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.3, 0.36), houseM('#fff6e0'));
      body.position.y = 0.15; body.castShadow = true;
      hotel.add(body);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.2, 4), houseM(color));
      roof.rotation.y = Math.PI / 4; roof.position.y = 0.4; roof.castShadow = true;
      hotel.add(roof);
      const sign = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.06), houseM('#ffd23e', 0.4));
      sign.position.y = 0.52; hotel.add(sign);
      hotel.position.set(w.x + dir.x * 0.36, 0, w.z + dir.z * 0.36);
      hotel.rotation.y = yaw;
      cont.add(hotel);
      hotel.scale.setScalar(0.05);
      this._animate(0.32, (kk) => { hotel.scale.setScalar(0.05 + 0.95 * (1 - Math.pow(1 - kk, 3))); });
      return;
    }
    for (let i = 0; i < count; i++) {
      const h = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.2, 0.24), houseM('#fff6e0'));
      body.position.y = 0.1; body.castShadow = true;
      h.add(body);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.15, 4), houseM(color));
      roof.rotation.y = Math.PI / 4; roof.position.y = 0.275; roof.castShadow = true;
      h.add(roof);
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.11, 0.02), houseM('#7a4a21'));
      door.position.set(0, 0.055, 0.121);
      h.add(door);
      const off = (i - (count - 1) / 2) * 0.26;
      h.position.set(w.x + dir.x * 0.36 + perp.x * off, 0, w.z + dir.z * 0.36 + perp.z * off);
      h.rotation.y = yaw;
      cont.add(h);
      h.scale.setScalar(0.05);
      const delay = i * 0.06;
      this._animate(0.32, (kk) => {
        const t = Math.max(0, (kk - delay / 0.32) / (1 - delay / 0.32));
        h.scale.setScalar(0.05 + 0.95 * (1 - Math.pow(1 - t, 3)));
      });
    }
  },

  setRoadblock(tileIdx, color) {
    let m = this._blockMeshes.get(tileIdx);
    if (!color) {
      if (m) { this._scene.remove(m); this._blockMeshes.delete(tileIdx); }
      return;
    }
    if (!m) {
      m = new THREE.Group();
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.24, 12), this._mat('#f08c00', 0.6));
      cone.position.y = 0.12; cone.castShadow = true;
      m.add(cone);
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.3), this._mat('#8a8a8a', 0.7));
      base.position.y = 0.025;
      m.add(base);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.09, 0.03), this._mat('#ffffff', 0.5));
      bar.position.y = 0.07;
      m.add(bar);
      this._scene.add(m);
      this._blockMeshes.set(tileIdx, m);
      m.scale.setScalar(0.05);
      this._animate(0.32, (kk) => { m.scale.setScalar(0.05 + 0.95 * (1 - Math.pow(1 - kk, 3))); });
    }
    const w = tileWorld(tileIdx);
    m.position.set(w.x, 0, w.z);
  },

  // ---------------- 骰子 ----------------
  _buildDice() {
    this._diceGroup = new THREE.Group();
    const geo = new THREE.BoxGeometry(0.66, 0.66, 0.66);
    const faces = (arr) => arr.map(v => {
      const t = new THREE.CanvasTexture(diceFaceCanvas(v, '#fff8ea', '#241a12'));
      t.colorSpace = THREE.SRGBColorSpace;
      return new THREE.MeshStandardMaterial({ map: t, roughness: 0.5 });
    });
    // 材质顺序 [+X,-X,+Y,-Y,+Z,-Z]，对子之和为 7
    const m1 = faces([3, 4, 1, 6, 5, 2]);
    const m2 = faces([2, 5, 6, 1, 3, 4]);
    const d1 = new THREE.Mesh(geo, m1);
    const d2 = new THREE.Mesh(geo, m2);
    d1.castShadow = d2.castShadow = true;
    d1.position.set(-0.42, 0.33, 0);
    d2.position.set(0.42, 0.33, 0);
    d1.rotation.set(0.3, 0.5, 0.1);
    d2.rotation.set(-0.4, -0.6, 0.2);
    this._diceGroup.add(d1, d2);
    this._diceGroup.position.set(0, 1.9, 1.35);
    this._scene.add(this._diceGroup);
    this._dice = [d1, d2];
    this._diceBaseY = 1.9;
  },

  async rollDice(a, b) {
    if (this._diceRolling) return;
    this._diceRolling = true;
    const d1 = this._dice[0], d2 = this._dice[1];
    const y0 = this._diceBaseY;
    await this._animate(0.95, (t) => {
      const tt = t < 0.7 ? t / 0.7 : 1;
      this._diceGroup.position.y = y0 + Math.sin(tt * Math.PI) * 2.1;
      if (t < 0.16) {
        // 出手前的快速抖动
        const j = (t / 0.16) * 0.16;
        d1.rotation.set(0.3 + Math.sin(t * 160) * j, 0.5 + Math.cos(t * 140) * j, 0.1 + Math.sin(t * 180) * j);
        d2.rotation.set(-0.4 + Math.sin(t * 150 + 2) * j, -0.6 + Math.cos(t * 170) * j, 0.2 + Math.sin(t * 190) * j);
      } else {
        d1.rotation.x = (t - 0.16) * 16 + 0.3;
        d1.rotation.y = (t - 0.16) * 11 + 0.5;
        d2.rotation.x = -(t - 0.16) * 13 - 0.4;
        d2.rotation.y = -(t - 0.16) * 17 - 0.6;
      }
      if (this.sound && t < 0.75 && Math.floor(t * 40) % 7 === 0) this.sound.dice();
    });
    d1.rotation.set(0, 0, 0);
    d2.rotation.set(0, 0, 0);
    this._diceRolling = false;
  },

  // ---------------- 角色移动 ----------------
  async movePlayer(idx, tiles, opts = {}) {
    const g = this._chars[idx];
    if (!g) return;
    const hopDur = opts.hopDur || 0.16;
    const cs = g.userData.charScale || 1;
    this._movingIdx = idx;
    for (const t of tiles) {
      const from = { x: g.position.x, z: g.position.z };
      const w = tileWorld(t);
      const dx = w.x - from.x, dz = w.z - from.z;
      const yaw = Math.atan2(dx, dz);
      await this._animate(hopDur, (k) => {
        g.position.x = from.x + dx * k;
        g.position.z = from.z + dz * k;
        g.position.y = Math.sin(k * Math.PI) * 0.42;
        g.rotation.y = yaw;
        const sq = 1 + Math.sin(k * Math.PI) * 0.14;
        g.scale.setScalar(cs * sq);
      });
      g.position.set(w.x, 0, w.z);
      g.scale.setScalar(cs);
      if (this.sound) this.sound.step();
      if (opts.onStep) opts.onStep(t);
    }
    this._movingIdx = null;
  },

  // ---------------- 特效 ----------------
  coinBurst(tileIdx, n = 8, color = '#ffd23e') {
    const w = tileWorld(tileIdx);
    const tex = new THREE.CanvasTexture(coinCanvas());
    tex.colorSpace = THREE.SRGBColorSpace;
    for (let i = 0; i < n; i++) {
      const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
      m.position.set(w.x + (Math.random() - 0.5) * 0.5, 0.45, w.z + (Math.random() - 0.5) * 0.5);
      m.scale.setScalar(0.26);
      this._scene.add(m);
      this._sprites.push({
        m, life: 0, dur: 0.9, up: 0.9 + Math.random() * 0.8, vy: 0.9 + Math.random() * 0.8,
        dx: (Math.random() - 0.5) * 0.8, dz: (Math.random() - 0.5) * 0.8,
        sx: 0.26, sy: 0.26, grav: false, spin: 0, color,
      });
    }
  },

  // 漂浮文字（+¥ / -¥ 等）
  floatText(tileIdx, txt, color = '#ffd23e') {
    const w = tileWorld(tileIdx);
    const c = canvas(256, 96);
    const g = c.getContext('2d');
    g.font = '900 52px "PingFang SC","Microsoft YaHei",sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineJoin = 'round';
    g.lineWidth = 10; g.strokeStyle = '#3a2a1a';
    g.strokeText(txt, 128, 48);
    g.fillStyle = color;
    g.fillText(txt, 128, 48);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    m.position.set(w.x, 1.15, w.z);
    m.scale.set(1.7, 0.64, 1);
    this._scene.add(m);
    this._sprites.push({
      m, life: 0, dur: 1.4, up: 0.85, vy: 0.85,
      dx: 0, dz: 0, sx: 1.7, sy: 0.64, grav: false, spin: 0,
    });
  },

  // 角色原地起跳（庆祝）
  jump(idx, h = 0.85) {
    const g = this._chars[idx];
    if (!g) return Promise.resolve();
    return this._animate(0.42, (k) => {
      g.position.y = Math.sin(k * Math.PI) * h;
    }, (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2));
  },

  // 破产：旋转倒下并缩小消失
  async bankruptAnim(idx) {
    const g = this._chars[idx];
    if (!g) return;
    const cs = g.userData.charScale || 1;
    await this._animate(0.95, (k) => {
      g.rotation.y += 0.3;
      g.rotation.x = k * Math.PI * 0.45;
      g.position.y = -k * 0.45;
      g.scale.setScalar(cs * (1 - k * 0.65));
    });
    g.visible = false;
    g.rotation.set(0, 0, 0);
    g.position.y = 0;
    g.scale.setScalar(cs);
  },

  celebrate() {
    for (let i = 0; i < TILE_COUNT; i += 2) this.coinBurst(i, 3);
    this.coinBurst(0, 20);
    // 漫天彩带
    const colors = ['#e8442e', '#ffd23e', '#2f9e44', '#2f6fd6', '#e4409a', '#f7941e'];
    const c = canvas(32, 32);
    const g = c.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 32, 32);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    for (let i = 0; i < 90; i++) {
      const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: colors[i % colors.length], transparent: true }));
      m.position.set((Math.random() - 0.5) * 16, 6 + Math.random() * 5, (Math.random() - 0.5) * 16);
      m.scale.set(0.22, 0.34, 1);
      this._scene.add(m);
      this._sprites.push({
        m, life: 0, dur: 2.6 + Math.random() * 1.4, up: 0,
        vy: 0.25 + Math.random() * 0.5, grav: true,
        dx: (Math.random() - 0.5) * 1.8, dz: (Math.random() - 0.5) * 1.8,
        sx: 0.22, sy: 0.34, spin: (Math.random() - 0.5) * 14,
      });
    }
  },

  // ---------------- 棋盘格悬停 / 点击 ----------------
  _tileAt(x, z) {
    const col = Math.round(x + 6.5);
    const row = Math.round(z + 6.5);
    if (col < 0 || col > GRID - 1 || row < 0 || row > GRID - 1) return -1;
    if (row === GRID - 1) return GRID - 1 - col;            // 下边（含两角）
    if (col === 0) return 2 * (GRID - 1) - row;             // 左边
    if (col === GRID - 1) return row + 3 * (GRID - 1);      // 右边（含直达监狱 39）
    if (row === 0) return col + 2 * (GRID - 1);             // 上边
    return -1;
  },
  _updateHover() {
    if (!this._hoverMesh) {
      const c = canvas(128, 128);
      const g = c.getContext('2d');
      g.shadowColor = 'rgba(255,255,255,.95)';
      g.shadowBlur = 22;
      g.fillStyle = 'rgba(255,255,255,.42)';
      g.fillRect(22, 22, 84, 84);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      this._hoverMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.94, 0.94),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
      );
      this._hoverMesh.rotation.x = -Math.PI / 2;
      this._hoverMesh.renderOrder = 5;
      this._scene.add(this._hoverMesh);
    }
    if (this._hoverIdx >= 0) {
      const w = tileWorld(this._hoverIdx);
      this._hoverMesh.position.set(w.x, 0.03, w.z);
      this._hoverMesh.visible = true;
      this._renderer.domElement.style.cursor = 'pointer';
    } else {
      this._hoverMesh.visible = false;
      this._renderer.domElement.style.cursor = 'default';
    }
  },

  // ---------------- 镜头模式 ----------------
  setFollowMode(v) {
    this.followMode = v;
    if (v) {
      const g = this._chars[this._activeIdx];
      this._focusTarget = { x: g ? g.position.x : 0, z: g ? g.position.z : 0, t: 0 };
    } else {
      this._focusTarget = null;
    }
  },

  focus(tileIdx) {
    if (!this.followMode) return;   // 自由镜头：不打扰用户操作
    const w = tileWorld(tileIdx);
    this._focusTarget = { x: w.x, z: w.z, t: 0 };
  },

  // ---------------- 步数引导（掷骰前显示前方 1~12 格） ----------------
  showStepGuides(tileIdx) {
    this.hideStepGuides();
    for (let d = 1; d <= 12; d++) {
      const cc = canvas(96, 96);
      const gg = cc.getContext('2d');
      gg.fillStyle = 'rgba(255,252,240,.94)';
      gg.beginPath(); gg.arc(48, 48, 40, 0, 7); gg.fill();
      gg.strokeStyle = 'rgba(58,42,26,.7)'; gg.lineWidth = 5; gg.stroke();
      gg.font = '900 44px "PingFang SC","Microsoft YaHei",sans-serif';
      gg.textAlign = 'center'; gg.textBaseline = 'middle';
      gg.fillStyle = '#3a2a1a';
      gg.fillText(String(d), 48, 51);
      const tex = new THREE.CanvasTexture(cc);
      tex.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.Sprite(new THREE.SpriteMaterial({
        map: tex, transparent: true, opacity: 0.55, depthWrite: false,
      }));
      const w = tileWorld((tileIdx + d) % TILE_COUNT);
      m.position.set(w.x + 0.27, 0.06, w.z - 0.27);   // 格子右上角，避开城市名
      m.scale.setScalar(0.4);
      this._scene.add(m);
      this._guides.push(m);
    }
  },
  hideStepGuides() {
    this._guides.forEach(m => {
      this._scene.remove(m);
      m.material.map?.dispose();
      m.material.dispose();
    });
    this._guides = [];
  },

  resetBoard() {
    this._houseContainers.forEach(c => this._scene.remove(c));
    this._houseContainers.clear();
    this._blockMeshes.forEach(m => this._scene.remove(m));
    this._blockMeshes.clear();
    this._sprites.forEach(s => { this._scene.remove(s.m); s.m.material.dispose(); });
    this._sprites = [];
    this.hideStepGuides();
    this._tweens = [];
    this._movingIdx = null;
    this._focusTarget = null;
    this._activeIdx = null;
    if (this._controls) this._controls.target.set(0, 0, 0);
  },

  // ---------------- 动画基础 ----------------
  _animate(dur, update, ease = (t) => t * (2 - t)) {
    return new Promise((res) => {
      this._tweens.push({ start: performance.now(), dur, update, ease, res });
    });
  },

  _loop() {
    requestAnimationFrame(() => this._loop());
    const now = performance.now();
    // 补间
    for (let i = this._tweens.length - 1; i >= 0; i--) {
      const tw = this._tweens[i];
      let t = (now - tw.start) / (tw.dur * 1000);
      if (t >= 1) {
        tw.update(1);
        this._tweens.splice(i, 1);
        tw.res();
      } else {
        tw.update(tw.ease(Math.max(0, t)));
      }
    }
    // 角色待机浮动 + 尾巴摇摆
    this._chars.forEach((g, i) => {
      if (i === this._movingIdx) return;
      g.position.y = Math.sin(now * 0.0028 + g.userData.bob) * 0.025;
      if (g.userData.tails) {
        const wag = Math.sin(now * 0.008 + i * 1.7);
        const amp = g.userData.def.style === 'dog' ? 0.65 : 0.3;
        g.userData.tails.forEach(t => { t.rotation.z = wag * amp; });
      }
    });
    // 光圈跟随
    if (this._activeRing && this._chars[this._activeIdx]) {
      const p = this._chars[this._activeIdx].position;
      this._activeRing.position.x = p.x;
      this._activeRing.position.z = p.z;
      this._activeRing.scale.setScalar(1 + Math.sin(now * 0.006) * 0.12);
    } else if (this._activeRing) {
      this._activeRing.scale.setScalar(0);
    }
    // 骰子待机浮动
    if (!this._diceRolling && this._diceGroup) {
      this._diceGroup.position.y = this._diceBaseY + Math.sin(now * 0.0022) * 0.07;
      this._diceGroup.rotation.y = Math.sin(now * 0.0006) * 0.3;
    }
    // 粒子（金币 / 飘字 / 彩带）
    for (let i = this._sprites.length - 1; i >= 0; i--) {
      const s = this._sprites[i];
      s.life += 0.016;
      const k = s.life / s.dur;
      if (k >= 1) {
        this._scene.remove(s.m);
        s.m.material.map?.dispose();
        s.m.material.dispose();
        this._sprites.splice(i, 1);
        continue;
      }
      if (s.grav) s.vy -= 1.5 * 0.016;
      s.m.position.y += (s.grav ? s.vy : s.up) * 0.016;
      if (s.grav && s.m.position.y <= 0.28) { s.m.position.y = 0.28; s.vy = 0; }
      s.m.position.x += s.dx * 0.016;
      s.m.position.z += s.dz * 0.016;
      if (s.spin) s.m.material.rotation += s.spin * 0.016;
      s.m.material.opacity = Math.max(0, 1 - k);
      const sc = 1 - k * 0.35;
      s.m.scale.set(s.sx * sc, s.sy * sc, 1);
    }
    // 跟随镜头：平滑追踪当前角色；有焦点时先看向焦点，随后回到角色；用户拖动旋转时暂停
    if (this.followMode && !this._userDragging) {
      const g = this._chars[this._activeIdx];
      const tx = this._focusTarget ? this._focusTarget.x : (g ? g.position.x : 0);
      const tz = this._focusTarget ? this._focusTarget.z : (g ? g.position.z : 0);
      const k = this._focusTarget ? 0.075 : 0.05;
      this._controls.target.x += (tx - this._controls.target.x) * k;
      this._controls.target.z += (tz - this._controls.target.z) * k;
      if (this._focusTarget) {
        this._focusTarget.t += 0.016;
        if (this._focusTarget.t > 1.5) this._focusTarget = null;
      }
    }
    this._controls.update();
    this._renderer.render(this._scene, this._camera);
  },
};
