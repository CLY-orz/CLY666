// 视觉自检：直接搭建 3D 场景（不带 UI 遮罩），用于无头核对（外链模块，避免内联模块怪癖）
import * as THREE from 'three';
import { scene } from '../js/scene.js';
import { GROUPS, tileWorld } from '../js/config.js';

scene.init(document.getElementById('c'));
scene.setPlayers([0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ charIdx: i })));
// 把 8 个角色散布到棋盘各处
const spots = [0, 6, 13, 19, 26, 32, 39, 45];
spots.forEach((t, i) => {
  const g = scene._chars[i];
  const w = tileWorld(t);
  g.position.set(w.x + (i % 2 ? -0.16 : 0.16), 0, w.z + 0.12);
});
// 房屋 / 酒店 / 路障示例
scene.updateHouses(1, 2, GROUPS.lgreen.color);
scene.updateHouses(17, 3, GROUPS.pink.color);
scene.updateHouses(30, 4, GROUPS.red.color);
scene.updateHouses(47, 5, GROUPS.navy.color);
scene.updateHouses(23, 1, GROUPS.orange.color);
scene.setRoadblock(9, '#e8590c');
scene.setActive(0);
scene.showStepGuides(0);       // 步数引导 1~12
scene.floatText(0, '+¥2000', '#ffd23e');
scene.coinBurst(26, 6);

// 悬停/点击自检（同步）：投影保定(3)格子的屏幕坐标并派发指针事件
let clickedTile = -1;
scene.onTileClick = (i) => { clickedTile = i; };
try {
  const v = new THREE.Vector3(3.5, 0.2, 6.5).project(scene._camera);
  const sx = ((v.x + 1) / 2) * window.innerWidth;
  const sy = ((1 - v.y) / 2) * window.innerHeight;
  const cv = document.getElementById('c');
  cv.dispatchEvent(new PointerEvent('pointermove', { clientX: sx, clientY: sy }));
  cv.dispatchEvent(new PointerEvent('pointerdown', { clientX: sx, clientY: sy }));
  cv.dispatchEvent(new PointerEvent('pointerup', { clientX: sx, clientY: sy }));
  document.body.textContent = `SHOT-READY hover=${scene._hoverIdx} click=${clickedTile}`;
} catch (e) {
  document.body.textContent = 'SHOT-FAIL ' + (e && e.message);
}
