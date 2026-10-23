// ============ 入口：装配场景 / UI / 规则引擎 ============
import { scene } from './scene.js';
import { game } from './game.js';
import { ui } from './ui.js';
import { ai } from './ai.js';
import { sound } from './sound.js';

scene.sound = sound;

let ok = true;
try {
  scene.init(document.getElementById('c3d'));
} catch (e) {
  console.error('3D 初始化失败：', e);
  ok = false;
  const d = document.createElement('div');
  d.className = 'overlay';
  d.style.zIndex = '80';
  d.innerHTML = `
    <div class="setup-card" style="max-width:520px">
      <div class="setup-title" style="font-size:36px">无法启动 3D</div>
      <p style="font-weight:800;text-align:center;line-height:1.9;color:var(--ink-soft)">
        您的浏览器未能创建 WebGL 上下文。<br>
        请使用最新版 Chrome / Edge / Safari，并在浏览器设置中开启「硬件加速」后重试。
      </p>
      <div class="modal-btns"><button class="btn gold" onclick="location.reload()">🔄 重新加载</button></div>
    </div>`;
  document.body.appendChild(d);
}

if (ok) {
  game.init({ scene, ui, ai, sound });
  ui.init(game, sound);
  // 点击棋盘格子查看地契/信息
  scene.onTileClick = (idx) => ui.showTileInfo(idx);
  // 首次交互解锁音频
  document.addEventListener('pointerdown', () => sound.unlock(), { once: true });
  // 开场设置
  ui.showSetup((cfg) => game.startGame(cfg));
}
