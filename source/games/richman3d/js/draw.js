// ============ Canvas 卡通素材绘制（全部素材代码绘制，无外部图片） ============
import { TILES, GROUPS, ITEMS, CHARS, tileGrid, CELL, GRID, GO_BONUS } from './config.js';

export const INK = '#3a2a1a';
const FONT = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Heiti SC",sans-serif';

export function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}
function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
export function text(ctx, str, x, y, o = {}) {
  const size = o.size || 30, weight = o.weight || 800;
  ctx.save();
  ctx.translate(x, y);
  if (o.rotate) ctx.rotate(o.rotate);
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = o.baseline || 'middle';
  ctx.lineJoin = 'round';
  if (o.stroke) { ctx.lineWidth = o.sw || 6; ctx.strokeStyle = o.stroke; ctx.strokeText(str, 0, 0); }
  ctx.fillStyle = o.color || INK;
  ctx.fillText(str, 0, 0);
  ctx.restore();
}
// 带白色名牌底衬的文字（城市名专用，保证清晰可读）
function textChip(ctx, str, x, y, o = {}) {
  const size = o.size || 30, weight = o.weight || 800;
  ctx.save();
  ctx.translate(x, y);
  if (o.rotate) ctx.rotate(o.rotate);
  ctx.font = `${weight} ${size}px ${FONT}`;
  const w = ctx.measureText(str).width;
  ctx.fillStyle = 'rgba(255,250,235,.94)';
  rr(ctx, -w / 2 - 9, -size / 2 - 6, w + 18, size + 12, 11);
  ctx.fill();
  ctx.strokeStyle = 'rgba(58,42,26,.55)'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.fillStyle = o.color || INK;
  ctx.fillText(str, 0, 0);
  ctx.restore();
}
function wrapLines(ctx, str, maxW) {
  const out = [];
  let line = '';
  for (const ch of str) {
    if (ctx.measureText(line + ch).width > maxW && line) { out.push(line); line = ch; }
    else line += ch;
  }
  if (line) out.push(line);
  return out;
}
function gloss(ctx, x, y, w, h, r) {
  ctx.save();
  rr(ctx, x, y, w, h, r);
  ctx.clip();
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, 'rgba(255,255,255,.55)');
  g.addColorStop(0.45, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

// ================= 棋盘贴图 =================
export function boardCanvas() {
  const S = CELL * GRID, c = canvas(S, S), ctx = c.getContext('2d');
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, S, S);

  // ---- 中心区域（城市广场） ----
  ctx.fillStyle = '#fbe8bd';
  ctx.fillRect(CELL + 6, CELL + 6, CELL * (GRID - 2) - 12, CELL * (GRID - 2) - 12);
  ctx.strokeStyle = INK; ctx.lineWidth = 6;
  ctx.strokeRect(CELL + 10, CELL + 10, CELL * (GRID - 2) - 20, CELL * (GRID - 2) - 20);

  const cx = S / 2, cy = S / 2;
  // 十字大道
  ctx.fillStyle = '#f3dfae';
  ctx.fillRect(CELL + 20, cy - 68, CELL * (GRID - 2) - 40, 136);
  ctx.fillRect(cx - 68, CELL + 20, 136, CELL * (GRID - 2) - 40);
  ctx.strokeStyle = 'rgba(58,42,26,.35)'; ctx.lineWidth = 5; ctx.setLineDash([26, 22]);
  ctx.beginPath(); ctx.moveTo(CELL + 34, cy); ctx.lineTo(S - CELL - 34, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, CELL + 34); ctx.lineTo(cx, S - CELL - 34); ctx.stroke();
  ctx.setLineDash([]);

  // 四个街心公园
  const parks = [[cx - 480, cy - 480], [cx + 480, cy - 480], [cx - 480, cy + 480], [cx + 480, cy + 480]];
  parks.forEach(([px, py], i) => {
    ctx.fillStyle = '#a8df8b';
    ctx.beginPath(); ctx.ellipse(px, py, 150, 110, i * 0.3, 0, 7); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = '#6fbf4e';
    ctx.beginPath(); ctx.ellipse(px - 40, py + 20, 55, 40, 0.4, 0, 7); ctx.fill();
    ctx.stroke();
    drawTree(ctx, px + 62, py - 34, 46);
    drawTree(ctx, px - 58, py + 56, 38);
  });

  // 装饰角标
  drawDiceIcon(ctx, cx - 700, cy - 500, 110, INK);
  drawHouseIcon(ctx, cx + 620, cy - 520, 120, '#e8442e', '#f6c445');
  drawCoinIcon(ctx, cx - 710, cy + 440, 100);
  drawCardIcon(ctx, cx + 630, cy + 450, 110);

  // 中央徽章
  let g = ctx.createLinearGradient(cx - 480, cy - 170, cx + 480, cy + 170);
  g.addColorStop(0, '#ff6b57'); g.addColorStop(0.5, '#e8442e'); g.addColorStop(1, '#c22f1d');
  ctx.fillStyle = g;
  rr(ctx, cx - 480, cy - 180, 960, 360, 52); ctx.fill();
  ctx.lineWidth = 12; ctx.strokeStyle = INK; ctx.stroke();
  ctx.lineWidth = 6; ctx.strokeStyle = '#ffd94d';
  rr(ctx, cx - 462, cy - 162, 924, 324, 42); ctx.stroke();
  text(ctx, '大富翁', cx, cy - 26, { size: 178, weight: 900, color: '#ffd94d', stroke: INK, sw: 18 });
  text(ctx, 'RICHMAN · 3D', cx, cy + 112, { size: 44, weight: 900, color: '#fff', stroke: INK, sw: 8 });
  text(ctx, '掷骰子 · 买地 · 盖房 · 收租', cx, cy + 560, { size: 34, weight: 800, color: '#8a6a45' });

  // ---- 52 个格子 ----
  for (let i = 0; i < TILES.length; i++) drawTile(ctx, TILES[i], tileGrid(i));

  // ---- 外框 ----
  ctx.lineWidth = 14; ctx.strokeStyle = '#b02418';
  ctx.strokeRect(7, 7, S - 14, S - 14);
  return c;
}

function drawTree(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(-s * 0.12, -s * 0.05, s * 0.24, s * 0.5);
  ctx.fillStyle = '#2f9e44';
  ctx.beginPath(); ctx.arc(0, -s * 0.25, s * 0.42, 0, 7); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
  ctx.restore();
}

function drawTile(ctx, t, g) {
  const x = g.col * CELL, y = g.row * CELL;
  ctx.fillStyle = '#fdf3dc';
  ctx.fillRect(x + 3, y + 3, CELL - 6, CELL - 6);

  const isCorner = (g.col === 0 || g.col === GRID - 1) && (g.row === 0 || g.row === GRID - 1);
  const side = g.row === GRID - 1 ? 'bottom' : g.col === 0 ? 'left' : g.row === 0 ? 'top' : 'right';

  if (t.type === 'prop') drawProp(ctx, t, x, y, side, isCorner);
  else if (t.type === 'rail' || t.type === 'util') drawStation(ctx, t, x, y, side);
  else if (t.type === 'chance') drawSpecial(ctx, t, x, y, side, 'chance');
  else if (t.type === 'event') drawSpecial(ctx, t, x, y, side, 'event');
  else if (t.type === 'tax') drawTax(ctx, t, x, y, side);
  else if (t.type === 'go') drawGo(ctx, x, y);
  else if (t.type === 'jail') drawJail(ctx, x, y);
  else if (t.type === 'parking') drawParking(ctx, x, y);
  else if (t.type === 'gotojail') drawGoJail(ctx, x, y);
}

// 色带（外缘）+ 价格 + 名称
function drawBand(ctx, t, x, y, side, bandColor) {
  const B = 54, cx = x + CELL / 2, cy = y + CELL / 2;
  ctx.fillStyle = bandColor;
  if (side === 'bottom') { ctx.fillRect(x + 3, y + CELL - B, CELL - 6, B - 3); text(ctx, `¥${t.price}`, cx, y + CELL - B / 2, { size: 24, color: '#fff', stroke: INK, sw: 4 }); }
  else if (side === 'left') { ctx.fillRect(x + 3, y + 3, B - 3, CELL - 6); text(ctx, `¥${t.price}`, x + B / 2 + 3, cy, { size: 24, color: '#fff', stroke: INK, sw: 4, rotate: -Math.PI / 2 }); }
  else if (side === 'top') { ctx.fillRect(x + 3, y + 3, CELL - 6, B - 3); text(ctx, `¥${t.price}`, cx, y + B / 2 + 3, { size: 24, color: '#fff', stroke: INK, sw: 4, rotate: Math.PI }); }
  else { ctx.fillRect(x + CELL - B + 3, y + 3, B - 3, CELL - 6); text(ctx, `¥${t.price}`, x + CELL - B / 2 - 3, cy, { size: 24, color: '#fff', stroke: INK, sw: 4, rotate: Math.PI / 2 }); }
}
function drawProp(ctx, t, x, y, side) {
  drawBand(ctx, t, x, y, side, GROUPS[t.group].color);
  const rot = side === 'left' ? -Math.PI / 2 : side === 'top' ? Math.PI : side === 'right' ? Math.PI / 2 : 0;
  const cx = x + CELL / 2, cy = y + CELL / 2;
  // 小房子图标（上部）+ 城市名牌（中部），与底部价格带保持间距，互不遮挡
  drawHouseIcon(ctx, cx, cy - 44, 42, GROUPS[t.group].color, '#fff', rot);
  textChip(ctx, t.name, cx, cy + 26, { size: 32, color: INK, rotate: rot });
}
function drawStation(ctx, t, x, y, side) {
  const cx = x + CELL / 2, cy = y + CELL / 2;
  const rot = side === 'left' ? -Math.PI / 2 : side === 'top' ? Math.PI : side === 'right' ? Math.PI / 2 : 0;
  if (t.type === 'rail') {
    ctx.save(); ctx.translate(cx, cy - 26); ctx.rotate(rot);
    // 火车头
    ctx.fillStyle = '#e8442e'; rr(ctx, -40, -16, 56, 32, 10); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#f6c445'; rr(ctx, 0, -16, 40, 32, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffd23e'; ctx.beginPath(); ctx.rect(-26, -30, 20, 16); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#8ecdf5'; ctx.beginPath(); ctx.arc(-14, 20, 9, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(18, 20, 9, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-8, -8, 6, 0, 7); ctx.fill();
    ctx.restore();
  } else {
    ctx.save(); ctx.translate(cx, cy - 26); ctx.rotate(rot);
    if (t.name.includes('电网')) { // 灯泡
      ctx.fillStyle = '#ffd23e'; ctx.beginPath(); ctx.arc(0, 4, 22, 0, 7); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = '#8ecdf5'; rr(ctx, -12, -18, 24, 16, 6); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-8, 26); ctx.lineTo(8, 26); ctx.lineTo(8, 32); ctx.lineTo(-8, 32); ctx.closePath(); ctx.fillStyle = '#8a8a8a'; ctx.fill(); ctx.stroke();
    } else { // 水滴
      ctx.fillStyle = '#53b9ea'; ctx.beginPath();
      ctx.moveTo(0, -30); ctx.bezierCurveTo(24, -2, 24, 16, 0, 30); ctx.bezierCurveTo(-24, 16, -24, -2, 0, -30);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-6, 8, 5, 0, 7); ctx.fill();
    }
    ctx.restore();
  }
  textChip(ctx, t.name, cx, cy + 50, { size: 24, color: INK, rotate: rot });
  const B = 22;
  if (side === 'bottom') text(ctx, `¥${t.price}`, cx, y + CELL - B / 2, { size: 20, color: '#b02418', stroke: '#fff', sw: 4 });
  else if (side === 'left') text(ctx, `¥${t.price}`, x + B / 2 + 2, cy, { size: 20, color: '#b02418', stroke: '#fff', sw: 4, rotate: -Math.PI / 2 });
  else if (side === 'top') text(ctx, `¥${t.price}`, cx, y + B / 2 + 2, { size: 20, color: '#b02418', stroke: '#fff', sw: 4, rotate: Math.PI });
  else text(ctx, `¥${t.price}`, x + CELL - B / 2 - 2, cy, { size: 20, color: '#b02418', stroke: '#fff', sw: 4, rotate: Math.PI / 2 });
}
function drawSpecial(ctx, t, x, y, side, kind) {
  const cx = x + CELL / 2, cy = y + CELL / 2;
  const rot = side === 'left' ? -Math.PI / 2 : side === 'top' ? Math.PI : side === 'right' ? Math.PI / 2 : 0;
  if (kind === 'chance') {
    ctx.fillStyle = '#f9c46b'; ctx.fillRect(x + 3, y + 3, CELL - 6, CELL - 6);
    ctx.save(); ctx.translate(cx, cy - 16); ctx.rotate(rot);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 52, 0, 7); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke();
    text(ctx, '?', 0, 0, { size: 76, weight: 900, color: '#1e6fd9' });
    ctx.restore();
    text(ctx, '机会', cx, cy + 62, { size: 30, color: INK, rotate: rot });
  } else {
    ctx.fillStyle = '#a8d5ff'; ctx.fillRect(x + 3, y + 3, CELL - 6, CELL - 6);
    ctx.save(); ctx.translate(cx, cy - 16); ctx.rotate(rot);
    drawChest(ctx, 0, 0, 74);
    ctx.restore();
    text(ctx, '事件', cx, cy + 62, { size: 30, color: INK, rotate: rot });
  }
}
function drawTax(ctx, t, x, y, side) {
  const cx = x + CELL / 2, cy = y + CELL / 2;
  const rot = side === 'left' ? -Math.PI / 2 : side === 'top' ? Math.PI : side === 'right' ? Math.PI / 2 : 0;
  const isLux = t.name.includes('奢侈');
  ctx.save(); ctx.translate(cx, cy - 22); ctx.rotate(rot);
  if (isLux) { // 宝石
    ctx.fillStyle = '#e4409a';
    ctx.beginPath();
    ctx.moveTo(0, -44); ctx.lineTo(38, -14); ctx.lineTo(30, 10); ctx.lineTo(0, 40); ctx.lineTo(-30, 10); ctx.lineTo(-38, -14);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -44); ctx.lineTo(0, 40); ctx.stroke();
    ctx.fillStyle = '#ff9ccb'; ctx.beginPath(); ctx.moveTo(0, -44); ctx.lineTo(20, -18); ctx.lineTo(0, 10); ctx.closePath(); ctx.fill();
  } else {
    ctx.fillStyle = '#e8442e'; ctx.beginPath(); ctx.arc(0, 0, 40, 0, 7); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke();
    text(ctx, '¥', 0, 0, { size: 56, weight: 900, color: '#fff', stroke: INK, sw: 5 });
  }
  ctx.restore();
  text(ctx, t.name, cx, cy + 40, { size: 30, color: INK, rotate: rot });
  text(ctx, `¥${t.amount}`, cx, cy + 72, { size: 24, color: '#b02418', rotate: rot });
}
function drawGo(ctx, x, y) {
  ctx.fillStyle = '#e8442e'; ctx.fillRect(x + 3, y + 3, CELL - 6, CELL - 6);
  const cx = x + CELL / 2, cy = y + CELL / 2;
  // 左向箭头（行进方向）
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(cx + 40, cy + 2); ctx.lineTo(cx - 20, cy + 34); ctx.lineTo(cx - 20, cy - 30);
  ctx.closePath(); ctx.fill();
  ctx.fillRect(cx - 40, cy - 26, 24, 52);
  text(ctx, '起点', cx, cy - 52, { size: 62, weight: 900, color: '#fff', stroke: INK, sw: 8 });
  text(ctx, `过路工资 ¥${GO_BONUS.toLocaleString()}`, cx, cy + 62, { size: 24, color: '#ffd94d', stroke: INK, sw: 5 });
}
function drawJail(ctx, x, y) {
  ctx.fillStyle = '#f08c00'; ctx.fillRect(x + 3, y + 3, CELL - 6, CELL - 6);
  const cx = x + CELL / 2;
  ctx.fillStyle = INK;
  for (let i = -1; i <= 1; i++) ctx.fillRect(cx + i * 34 - 9, y + 22, 18, 90);
  text(ctx, '监狱', cx, y + 156, { size: 56, weight: 900, color: '#fff', stroke: INK, sw: 8 });
}
function drawParking(ctx, x, y) {
  ctx.fillStyle = '#2f9e44'; ctx.fillRect(x + 3, y + 3, CELL - 6, CELL - 6);
  const cx = x + CELL / 2, cy = y + CELL / 2;
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy - 24, 48, 0, 7); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke();
  text(ctx, 'P', cx, cy - 24, { size: 60, weight: 900, color: '#2f6fd6' });
  text(ctx, '免费停留', cx, cy + 42, { size: 32, color: '#fff', stroke: INK, sw: 6 });
  text(ctx, '领取 ¥800', cx, cy + 74, { size: 24, color: '#ffd94d', stroke: INK, sw: 5 });
}
function drawGoJail(ctx, x, y) {
  ctx.fillStyle = '#7ec8f7'; ctx.fillRect(x + 3, y + 3, CELL - 6, CELL - 6);
  const cx = x + CELL / 2, cy = y + CELL / 2;
  ctx.save(); ctx.translate(cx, cy - 30);
  ctx.fillStyle = INK;
  for (let i = -1; i <= 1; i++) ctx.fillRect(i * 26 - 8, -34, 16, 60);
  ctx.restore();
  text(ctx, '直达监狱', cx, cy + 36, { size: 40, weight: 900, color: '#fff', stroke: INK, sw: 7 });
  text(ctx, '进去反省!', cx, cy + 74, { size: 24, color: INK });
}

// ================= 小图标 =================
function drawHouseIcon(ctx, cx, cy, s, roof, wall, rot = 0) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
  ctx.fillStyle = wall || '#fff8ea';
  rr(ctx, -s * 0.42, -s * 0.05, s * 0.84, s * 0.56, 6); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = roof;
  ctx.beginPath();
  ctx.moveTo(-s * 0.52, -s * 0.02); ctx.lineTo(0, -s * 0.5); ctx.lineTo(s * 0.52, -s * 0.02);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#7a4a21'; ctx.fillRect(-s * 0.1, s * 0.18, s * 0.2, s * 0.34);
  ctx.restore();
}
function drawChest(ctx, cx, cy, s) {
  ctx.save(); ctx.translate(cx, cy);
  ctx.fillStyle = '#8a5a33'; rr(ctx, -s / 2, -s * 0.15, s, s * 0.6, 8); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#a06a3d';
  ctx.beginPath(); ctx.arc(0, -s * 0.15, s / 2, Math.PI, 0); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffd23e'; rr(ctx, -s * 0.16, -s * 0.16, s * 0.32, s * 0.24, 5); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function drawCoinIcon(ctx, cx, cy, s) {
  ctx.save(); ctx.translate(cx, cy);
  ctx.fillStyle = '#ffd23e'; ctx.beginPath(); ctx.arc(0, 0, s / 2, 0, 7); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, s / 2 - 12, 0, 7); ctx.stroke();
  text(ctx, '¥', 0, 2, { size: s * 0.5, weight: 900, color: '#b02418' });
  ctx.restore();
}
function drawCardIcon(ctx, cx, cy, s) {
  ctx.save(); ctx.translate(cx, cy);
  ctx.fillStyle = '#fff8ea'; rr(ctx, -s / 2, -s * 0.34, s, s * 0.68, 10); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#e8442e'; ctx.fillRect(-s / 2, -s * 0.34, s, s * 0.18);
  ctx.strokeRect(-s / 2, -s * 0.34, s, s * 0.18);
  text(ctx, '?', 0, 4, { size: s * 0.5, weight: 900, color: '#1e6fd9' });
  ctx.restore();
}
function drawDiceIcon(ctx, cx, cy, s, ink) {
  ctx.save(); ctx.translate(cx, cy);
  ctx.rotate(-0.18);
  ctx.fillStyle = '#fff8ea'; rr(ctx, -s / 2, -s / 2, s, s, 12); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 6; ctx.stroke();
  const p = s * 0.16;
  [[-p, -p], [p, p], [p, -p], [-p, p], [0, 0]].forEach(([dx, dy]) => {
    ctx.fillStyle = '#e8442e'; ctx.beginPath(); ctx.arc(dx, dy, s * 0.09, 0, 7); ctx.fill();
  });
  ctx.restore();
}

// ================= 骰子面 =================
export function diceFaceCanvas(v, bg, pip) {
  const c = canvas(256, 256), ctx = c.getContext('2d');
  rr(ctx, 10, 10, 236, 236, 40);
  ctx.fillStyle = bg; ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.stroke();
  const pos = {
    1: [[0, 0]],
    2: [[-1, -1], [1, 1]],
    3: [[-1, -1], [0, 0], [1, 1]],
    4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
    6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
  }[v];
  pos.forEach(([dx, dy]) => {
    ctx.fillStyle = pip;
    ctx.beginPath(); ctx.arc(128 + dx * 64, 128 + dy * 64, 30, 0, 7); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.beginPath(); ctx.arc(128 + dx * 64 - 9, 128 + dy * 64 - 10, 9, 0, 7); ctx.fill();
  });
  gloss(ctx, 16, 16, 224, 90, 34);
  return c;
}

// ================= 卡牌 =================
export function cardFaceCanvas(kind, title, body, color, iconKey) {
  const c = canvas(400, 560), ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 560);
  g.addColorStop(0, '#fffdf2'); g.addColorStop(1, '#fbecc8');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 400, 560);
  // 边框
  ctx.strokeStyle = INK; ctx.lineWidth = 8; rr(ctx, 8, 8, 384, 544, 26); ctx.stroke();
  ctx.strokeStyle = '#ffd94d'; ctx.lineWidth = 4; rr(ctx, 18, 18, 364, 524, 20); ctx.stroke();
  // 头带
  const hg = ctx.createLinearGradient(0, 24, 0, 130);
  hg.addColorStop(0, color); hg.addColorStop(1, shade(color, -18));
  ctx.fillStyle = hg;
  rr(ctx, 24, 24, 352, 106, 20); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 6; rr(ctx, 24, 24, 352, 106, 20); ctx.stroke();
  const kindLabel = { chance: '机会卡', event: '事件卡', item: '道具卡' }[kind];
  text(ctx, kindLabel, 200, 52, { size: 24, weight: 900, color: 'rgba(255,255,255,.85)' });
  text(ctx, title, 200, 94, { size: 46, weight: 900, color: '#fff', stroke: INK, sw: 7 });
  // 图标圆
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(200, 210, 74, 0, 7); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.stroke();
  if (kind === 'chance') text(ctx, '?', 200, 208, { size: 96, weight: 900, color: '#f7941e' });
  else if (kind === 'event') drawChest(ctx, 200, 210, 88);
  else text(ctx, ITEM_GLYPH[iconKey] || '★', 200, 210, { size: 80, weight: 900, color });
  // 正文
  ctx.font = `800 32px ${FONT}`;
  ctx.fillStyle = INK;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const lines = wrapLines(ctx, body, 316);
  let y0 = 320 - ((lines.length - 1) * 46) / 2;
  lines.forEach((ln, i) => ctx.fillText(ln, 200, y0 + i * 46));
  // 底部
  text(ctx, '· 大富翁 RICHMAN 3D ·', 200, 508, { size: 20, weight: 800, color: '#b02418' });
  drawCoinIcon(ctx, 52, 486, 40);
  drawCoinIcon(ctx, 348, 486, 40);
  return c;
}
export function cardBackCanvas() {
  const c = canvas(400, 560), ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 560);
  g.addColorStop(0, '#ff6b57'); g.addColorStop(1, '#c22f1d');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 400, 560);
  ctx.strokeStyle = INK; ctx.lineWidth = 8; rr(ctx, 8, 8, 384, 544, 26); ctx.stroke();
  ctx.strokeStyle = '#ffd94d'; ctx.lineWidth = 5; rr(ctx, 26, 26, 348, 508, 18); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  for (let i = 0; i < 5; i++) for (let j = 0; j < 7; j++) {
    if ((i + j) % 2 === 0) ctx.beginPath(), ctx.arc(46 + j * 54, 60 + i * 46, 9, 0, 7), ctx.fill();
  }
  ctx.fillStyle = '#ffd94d'; ctx.beginPath(); ctx.arc(200, 250, 130, 0, 7); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.stroke();
  text(ctx, '大', 200, 170, { size: 64, weight: 900, color: '#fff', stroke: INK, sw: 7 });
  text(ctx, '富', 200, 250, { size: 64, weight: 900, color: '#fff', stroke: INK, sw: 7 });
  text(ctx, '翁', 200, 330, { size: 64, weight: 900, color: '#fff', stroke: INK, sw: 7 });
  return c;
}
const ITEM_GLYPH = { remote: '🎲', boost: '⚡', shield: '🛡', bail: '🗝', block: '⚠', steal: '🦹' };

// ================= 城市地标剪影（100×100 基准坐标，中心原点） =================
function drawLandmark(ctx, key, cx, cy, s) {
  const u = s / 100;
  const X = (x) => cx + x * u;
  const Y = (y) => cy + y * u;
  const W = (w) => w * u;
  const R = (x, y, w, h) => { ctx.fillRect(X(x - w / 2), Y(y - h / 2), W(w), W(h)); };
  const C = (x, y, r) => { ctx.beginPath(); ctx.arc(X(x), Y(y), W(r), 0, 7); ctx.fill(); };
  const TRI = (x1, y1, x2, y2, x3, y3) => {
    ctx.beginPath(); ctx.moveTo(X(x1), Y(y1)); ctx.lineTo(X(x2), Y(y2)); ctx.lineTo(X(x3), Y(y3)); ctx.closePath(); ctx.fill();
  };
  const pagoda = (tiers, topY, step, halfW, botY) => {
    ctx.beginPath();
    ctx.moveTo(X(-halfW * 0.5), Y(botY));
    ctx.lineTo(X(-halfW * 0.42), Y(topY));
    ctx.lineTo(X(halfW * 0.42), Y(topY));
    ctx.lineTo(X(halfW * 0.5), Y(botY));
    ctx.closePath(); ctx.fill();
    for (let i = 0; i < tiers; i++) {
      const y = topY + i * step + 1;
      const w = halfW * (0.55 + 0.45 * (i / Math.max(1, tiers - 1)));
      TRI(-w, y, w, y, 0, y - step * 0.72);
    }
    ctx.lineWidth = W(3);
    ctx.beginPath(); ctx.moveTo(X(0), Y(topY - step * 0.7)); ctx.lineTo(X(0), Y(topY - step * 0.7 - 9)); ctx.stroke();
  };

  ctx.fillStyle = INK;
  ctx.strokeStyle = INK;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  switch (key) {
    case 'zhili': // 直隶总督署（牌楼大门）
      R(0, -16, 64, 9);
      R(-29, 8, 9, 42); R(29, 8, 9, 42);
      TRI(-38, -16, 38, -16, 0, -40);
      R(0, 30, 70, 5);
      break;
    case 'longmen': { // 龙门石窟
      ctx.lineWidth = W(7);
      rr(ctx, X(-32), Y(-36), W(64), W(62), W(18)); ctx.stroke();
      C(0, -8, 9);
      TRI(-16, 2, 16, 2, 19, 20); TRI(-16, 2, -19, 20, 19, 20); TRI(-19, 20, 19, 20, 0, 26);
      break;
    }
    case 'xiangyang': // 仲宣楼（城楼）
      R(0, 16, 72, 22);
      R(0, -8, 44, 28);
      TRI(-28, -22, 28, -22, 0, -42);
      for (let i = -3; i <= 3; i++) R(i * 8, 28, 5, 8);
      break;
    case 'xiangbi': { // 象鼻山
      C(0, 0, 27);
      ctx.lineWidth = W(9);
      ctx.beginPath(); ctx.moveTo(X(9), Y(8)); ctx.quadraticCurveTo(X(20), Y(20), X(9), Y(30)); ctx.stroke();
      C(17, -17, 9);
      ctx.lineWidth = W(2.5);
      ctx.beginPath(); ctx.moveTo(X(-30), Y(32)); ctx.lineTo(X(30), Y(32)); ctx.stroke();
      break;
    }
    case 'shell': { // 贝壳博物馆
      ctx.beginPath(); ctx.arc(X(0), Y(0), W(27), Math.PI, 0); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = W(2.5);
      for (let a = 1; a <= 5; a++) {
        const ang = Math.PI * (a / 6);
        ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(Math.cos(ang) * 27), Y(Math.sin(ang) * 27)); ctx.stroke();
      }
      ctx.strokeStyle = INK;
      R(0, 32, 42, 6);
      break;
    }
    case 'zhanqiao': // 栈桥回澜阁
      R(-14, 14, 62, 8);
      R(22, -2, 22, 18);
      TRI(14, -12, 30, -12, 22, -26);
      C(22, -31, 3);
      R(-34, -4, 4, 46); R(-24, -4, 4, 46);
      break;
    case 'tianyige': // 天一阁
      R(0, 8, 46, 28);
      R(0, -12, 40, 15);
      TRI(-28, -20, 28, -20, 0, -40);
      R(0, -44, 4, 9);
      break;
    case 'shuangzita': { // 双子塔
      ctx.beginPath(); ctx.moveTo(X(-34), Y(26)); ctx.lineTo(X(-34), Y(-32)); ctx.quadraticCurveTo(X(-20), Y(-44), X(-6), Y(-32)); ctx.lineTo(X(-6), Y(26)); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(X(6), Y(26)); ctx.lineTo(X(6), Y(-32)); ctx.quadraticCurveTo(X(20), Y(-44), X(34), Y(-32)); ctx.lineTo(X(34), Y(26)); ctx.closePath(); ctx.fill();
      break;
    }
    case 'dafo': // 灵山大佛
      C(0, -24, 10);
      TRI(-20, -12, 20, -12, 26, 18); TRI(-20, -12, -26, 18, 26, 18);
      R(0, 25, 46, 9); R(0, 33, 38, 7);
      break;
    case 'tianningta': // 天宁寺塔
      pagoda(3, -6, 13, 26, 26);
      R(0, 30, 46, 6);
      break;
    case 'dianshita': // 南通电视塔
      R(0, -4, 6, 72);
      C(0, -14, 13);
      R(0, 34, 32, 8);
      ctx.lineWidth = W(4);
      ctx.beginPath(); ctx.moveTo(X(0), Y(-40)); ctx.lineTo(X(0), Y(-48)); ctx.stroke();
      break;
    case 'hongchuan': { // 南湖红船
      ctx.beginPath(); ctx.moveTo(X(-28), Y(4)); ctx.quadraticCurveTo(X(0), Y(20), X(28), Y(4)); ctx.lineTo(X(24), Y(-3)); ctx.quadraticCurveTo(X(0), Y(7), X(-24), Y(-3)); ctx.closePath(); ctx.fill();
      R(0, -14, 20, 18);
      TRI(-15, -24, 15, -24, 0, -34);
      ctx.lineWidth = W(2.5);
      ctx.beginPath(); ctx.moveTo(X(0), Y(-34)); ctx.lineTo(X(0), Y(-47)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(-30), Y(24)); ctx.lineTo(X(30), Y(24)); ctx.stroke();
      break;
    }
    case 'dongfangzhimen': { // 东方之门
      ctx.lineWidth = W(14);
      ctx.beginPath(); ctx.moveTo(X(-30), Y(16)); ctx.quadraticCurveTo(X(0), Y(-40), X(30), Y(16)); ctx.stroke();
      R(-42, 4, 13, 40); R(42, 4, 13, 40);
      break;
    }
    case 'leifengta': // 雷峰塔
      pagoda(3, -8, 13, 27, 26);
      R(0, 30, 48, 6);
      break;
    case 'zhilun': { // 天津之眼
      ctx.lineWidth = W(5);
      ctx.beginPath(); ctx.arc(X(0), Y(-12), W(26), 0, 7); ctx.stroke();
      ctx.lineWidth = W(2.5);
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3;
        ctx.beginPath(); ctx.moveTo(X(0), Y(-12)); ctx.lineTo(X(Math.cos(a) * 26), Y(-12 + Math.sin(a) * 26)); ctx.stroke();
      }
      ctx.lineWidth = W(6);
      ctx.beginPath(); ctx.moveTo(X(-17), Y(12)); ctx.lineTo(X(-9), Y(32)); ctx.moveTo(X(17), Y(12)); ctx.lineTo(X(9), Y(32)); ctx.stroke();
      R(0, 36, 42, 6);
      C(0, -12, 5);
      break;
    }
    case 'aiwanting': // 爱晚亭
      R(0, 6, 30, 20);
      ctx.lineWidth = W(4);
      ctx.beginPath(); ctx.moveTo(X(-12), Y(-4)); ctx.lineTo(X(-12), Y(16)); ctx.moveTo(X(12), Y(-4)); ctx.lineTo(X(12), Y(16)); ctx.stroke();
      TRI(-34, -2, 34, -2, 0, -24);
      TRI(-21, -23, 21, -23, 0, -37);
      break;
    case 'zhongshanling': // 中山陵
      R(0, 26, 70, 9); R(0, 18, 56, 9); R(0, 10, 42, 9);
      R(0, -10, 40, 17);
      TRI(-26, -18, 26, -18, 0, -34);
      R(0, -39, 4, 10);
      break;
    case 'huanghelou': // 黄鹤楼
      pagoda(3, -16, 14, 30, 22);
      R(0, 28, 56, 8);
      break;
    case 'dayanta': { // 大雁塔
      ctx.beginPath(); ctx.moveTo(X(-20), Y(26)); ctx.lineTo(X(-15), Y(-36)); ctx.lineTo(X(15), Y(-36)); ctx.lineTo(X(20), Y(26)); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = W(2.5);
      for (let i = 0; i < 4; i++) {
        const y = -28 + i * 14;
        ctx.beginPath(); ctx.moveTo(X(-14), Y(y)); ctx.lineTo(X(14), Y(y)); ctx.stroke();
      }
      ctx.strokeStyle = INK;
      break;
    }
    case 'jiefangbei': // 解放碑
      R(0, 22, 44, 11);
      R(0, -5, 12, 46);
      R(0, -23, 22, 10);
      TRI(-8, -28, 8, -28, 0, -39);
      break;
    case 'erqita': // 二七纪念塔
      R(-12, -4, 20, 44); R(12, -4, 20, 44);
      TRI(-23, -26, -2, -26, -12, -43);
      TRI(2, -26, 23, -26, 12, -43);
      R(0, -10, 26, 6);
      C(-12, -47, 3); C(12, -47, 3);
      break;
    case 'qingfengge': // 清风阁
      R(0, 8, 42, 26);
      R(0, -10, 34, 13);
      TRI(-26, -16, 26, -16, 0, -36);
      R(0, -40, 4, 8);
      break;
    case 'baita': { // 福州白塔
      ctx.beginPath(); ctx.moveTo(X(-14), Y(22)); ctx.lineTo(X(-9), Y(-6)); ctx.lineTo(X(9), Y(-6)); ctx.lineTo(X(14), Y(22)); ctx.closePath(); ctx.fill();
      C(0, -10, 11);
      ctx.lineWidth = W(4);
      ctx.beginPath(); ctx.moveTo(X(0), Y(-20)); ctx.lineTo(X(0), Y(-34)); ctx.stroke();
      break;
    }
    case 'jinmafang': // 金马碧鸡坊
      R(-26, 6, 9, 44); R(26, 6, 9, 44);
      R(0, -12, 66, 9); R(0, -4, 56, 7);
      TRI(-38, -16, 38, -16, 0, -38);
      break;
    case 'chengduta': { // 天府熊猫塔
      R(0, -2, 5, 66);
      C(0, -20, 12);
      TRI(0, 8, -18, 32, 18, 32);
      ctx.lineWidth = W(3);
      ctx.beginPath(); ctx.moveTo(X(0), Y(-40)); ctx.lineTo(X(0), Y(-48)); ctx.stroke();
      break;
    }
    case 'guangzhouta': { // 广州塔（小蛮腰）
      ctx.beginPath(); ctx.moveTo(X(-12), Y(-46));
      ctx.bezierCurveTo(X(-18), Y(-26), X(-5), Y(-6), X(-9), Y(30));
      ctx.lineTo(X(9), Y(30));
      ctx.bezierCurveTo(X(5), Y(-6), X(18), Y(-26), X(12), Y(-46));
      ctx.closePath(); ctx.fill();
      ctx.lineWidth = W(2.5);
      ctx.beginPath(); ctx.moveTo(X(0), Y(-46)); ctx.lineTo(X(0), Y(-54)); ctx.stroke();
      break;
    }
    case 'pingan': { // 平安金融中心
      ctx.beginPath(); ctx.moveTo(X(-14), Y(-44)); ctx.lineTo(X(14), Y(-44)); ctx.lineTo(X(20), Y(28)); ctx.lineTo(X(-20), Y(28)); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = W(2.5);
      for (const px of [-7, 0, 7]) {
        ctx.beginPath(); ctx.moveTo(X(px), Y(-40)); ctx.lineTo(X(px * 1.2), Y(28)); ctx.stroke();
      }
      ctx.strokeStyle = INK;
      R(0, -50, 4, 10);
      break;
    }
    case 'shenyangpalace': // 沈阳故宫（大政殿）
      R(0, 4, 34, 22);
      ctx.lineWidth = W(3.5);
      ctx.beginPath(); ctx.moveTo(X(-12), Y(-4)); ctx.lineTo(X(-12), Y(15)); ctx.moveTo(X(12), Y(-4)); ctx.lineTo(X(12), Y(15)); ctx.stroke();
      TRI(-26, -6, 26, -6, 0, -36);
      C(0, -40, 4);
      break;
    case 'gugong': { // 故宫太和殿
      R(0, 2, 56, 26);
      ctx.lineWidth = W(3);
      for (const px of [-20, -8, 8, 20]) {
        ctx.beginPath(); ctx.moveTo(X(px), Y(2)); ctx.lineTo(X(px), Y(15)); ctx.stroke();
      }
      TRI(-36, -10, 36, -10, 30, -26); TRI(-36, -10, -30, -26, 30, -26);
      TRI(-25, -26, 25, -26, 0, -38);
      R(0, 17, 62, 7); R(0, 25, 50, 7);
      break;
    }
    case 'dongfangmingzhu': { // 东方明珠
      ctx.lineWidth = W(5);
      ctx.beginPath(); ctx.moveTo(X(0), Y(30)); ctx.lineTo(X(0), Y(-44)); ctx.stroke();
      C(0, -8, 16); C(0, -30, 9); C(0, -44, 5);
      ctx.lineWidth = W(4.5);
      ctx.beginPath(); ctx.moveTo(X(0), Y(6)); ctx.lineTo(X(-17), Y(26)); ctx.moveTo(X(0), Y(6)); ctx.lineTo(X(17), Y(26)); ctx.stroke();
      R(0, 33, 36, 7);
      break;
    }
    case 'zhongyin': { // 中银大厦
      ctx.beginPath(); ctx.moveTo(X(0), Y(-46)); ctx.lineTo(X(20), Y(28)); ctx.lineTo(X(-20), Y(28)); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = W(2.5);
      ctx.beginPath();
      ctx.moveTo(X(0), Y(-46)); ctx.lineTo(X(0), Y(28));
      ctx.moveTo(X(-10), Y(-16)); ctx.lineTo(X(10), Y(-16));
      ctx.moveTo(X(-10), Y(2)); ctx.lineTo(X(10), Y(2));
      ctx.stroke();
      ctx.strokeStyle = INK;
      break;
    }
    case 'dasanba': { // 大三巴牌坊
      R(0, 4, 46, 46);
      TRI(-26, -18, 26, -18, 0, -42);
      ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = W(2.5);
      for (const px of [-14, 0, 14]) {
        ctx.beginPath(); ctx.moveTo(X(px), Y(-16)); ctx.lineTo(X(px), Y(26)); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(X(0), Y(6), W(7), 0, 7); ctx.stroke();
      ctx.strokeStyle = INK;
      ctx.lineWidth = W(3);
      ctx.beginPath(); ctx.moveTo(X(0), Y(-42)); ctx.lineTo(X(0), Y(-48)); ctx.moveTo(X(-8), Y(-45)); ctx.lineTo(X(8), Y(-45)); ctx.stroke();
      break;
    }
    default:
      C(0, 0, 16);
      R(0, 22, 34, 8);
  }
}

// ================= 地契 =================
export function deedCanvas(t) {
  const c = canvas(380, 540), ctx = c.getContext('2d');
  ctx.fillStyle = '#fffdf2'; ctx.fillRect(0, 0, 380, 540);
  ctx.strokeStyle = INK; ctx.lineWidth = 7; rr(ctx, 7, 7, 366, 526, 20); ctx.stroke();
  const color = t.group ? GROUPS[t.group].color : '#1e6fd9';
  ctx.fillStyle = color; rr(ctx, 16, 16, 348, 118, 16); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 6; rr(ctx, 16, 16, 348, 118, 16); ctx.stroke();
  text(ctx, '地契 DEED', 165, 34, { size: 20, weight: 800, color: 'rgba(255,255,255,.9)' });
  text(ctx, t.name, 165, 64, { size: 40, weight: 900, color: '#fff', stroke: INK, sw: 6 });
  if (t.landmarkName) text(ctx, t.landmarkName, 165, 98, { size: 17, weight: 800, color: '#fff', stroke: INK, sw: 4 });
  if (t.landmark) {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(308, 66, 38, 0, 7); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
    drawLandmark(ctx, t.landmark, 308, 66, 56);
  }
  ctx.font = `800 27px ${FONT}`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const rows = [];
  if (t.type === 'prop') {
    rows.push(['购买价格', `¥${t.price}`], ['基础租金', `¥${t.rent[0]}`], ['成套双倍', `¥${t.rent[0] * 2}`]);
    for (let h = 1; h <= 4; h++) rows.push([`${h} 间房屋`, `¥${t.rent[h]}`]);
    rows.push(['酒店', `¥${t.rent[5]}`], ['盖房费用', `¥${GROUPS[t.group].house} / 间`]);
  } else if (t.type === 'rail') {
    rows.push(['购买价格', `¥${t.price}`]);
    t.rents.forEach((r, i) => rows.push([`${i + 1} 座车站`, `¥${r}`]));
  } else {
    rows.push(['购买价格', `¥${t.price}`], ['拥有 1 座', '掷骰点 ×40'], ['拥有 2 座', '掷骰点 ×100']);
  }
  let y = 172;
  rows.forEach(([k, v], i) => {
    if (i % 2 === 0) { ctx.fillStyle = '#fbecc8'; rr(ctx, 30, y - 20, 320, 40, 10); ctx.fill(); }
    ctx.fillStyle = INK;
    ctx.fillText(k, 46, y);
    ctx.fillStyle = '#b02418';
    ctx.font = `900 27px ${FONT}`;
    ctx.textAlign = 'right';
    ctx.fillText(v, 334, y);
    ctx.font = `800 27px ${FONT}`;
    ctx.textAlign = 'left';
    y += 40;
  });
  text(ctx, '· 大富翁银行发行 ·', 190, 520, { size: 18, weight: 800, color: '#8a6a45' });
  return c;
}

// ================= 纸币 =================
const BILL_COLORS = { 100: '#e8442e', 200: '#2f9e44', 500: '#8e4fd6', 800: '#f08c00', 1000: '#f7941e', 1500: '#e84393', 2000: '#2f6fd6', 5000: '#b45309' };
export function moneyCanvas(v) {
  const c = canvas(360, 160), ctx = c.getContext('2d');
  const color = BILL_COLORS[v] || '#e8442e';
  ctx.fillStyle = '#fdf3dc'; ctx.fillRect(0, 0, 360, 160);
  ctx.strokeStyle = INK; ctx.lineWidth = 6; rr(ctx, 6, 6, 348, 148, 18); ctx.stroke();
  ctx.fillStyle = color; rr(ctx, 14, 14, 332, 132, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 3; rr(ctx, 24, 24, 312, 112, 8); ctx.stroke();
  // 水印
  ctx.fillStyle = 'rgba(255,255,255,.22)';
  ctx.beginPath(); ctx.arc(84, 80, 44, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 3; ctx.stroke();
  text(ctx, '¥', 84, 80, { size: 46, weight: 900, color: 'rgba(255,255,255,.5)' });
  text(ctx, '大富翁银行', 34, 36, { size: 17, weight: 900, color: 'rgba(255,255,255,.95)' });
  text(ctx, `¥${v}`, 236, 80, { size: 54, weight: 900, color: '#fff', stroke: INK, sw: 6 });
  text(ctx, 'RICHMAN · 3D', 236, 116, { size: 16, weight: 800, color: 'rgba(255,255,255,.9)' });
  return c;
}

// ================= 角色头像（UI 用） =================
export function avatarCanvas(ch, s = 128) {
  const c = canvas(s, s), ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, s);
  g.addColorStop(0, '#fff3d6'); g.addColorStop(1, '#ffe1a8');
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = INK; ctx.lineWidth = 5; rr(ctx, 3, 3, s - 6, s - 6, 18); ctx.stroke();
  const u = s / 128, cx = s / 2;
  // 脸
  ctx.fillStyle = ch.skin; ctx.beginPath(); ctx.arc(cx, 76 * u, 44 * u, 0, 7); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
  // 眼睛
  const ey = 74 * u, ex = 18 * u;
  [[cx - ex, ey], [cx + ex, ey]].forEach(([x, y]) => {
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(x, y, 9 * u, 11 * u, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#241a12'; ctx.beginPath(); ctx.arc(x + 2 * u, y + 1 * u, 4.6 * u, 0, 7); ctx.fill();
  });
  // 腮红
  ctx.fillStyle = 'rgba(255,120,120,.55)';
  [[cx - 34 * u, 94 * u], [cx + 34 * u, 94 * u]].forEach(([x, y]) => {
    ctx.beginPath(); ctx.ellipse(x, y, 8 * u, 5 * u, 0, 0, 7); ctx.fill();
  });
  // 嘴
  ctx.strokeStyle = '#b02418'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(cx, 84 * u, 12 * u, 0.25, Math.PI - 0.25); ctx.stroke();
  // 发型
  ctx.fillStyle = ch.hair;
  switch (ch.style) {
    case 'buns':
      ctx.beginPath(); ctx.arc(cx - 30 * u, 26 * u, 17 * u, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 30 * u, 26 * u, 17 * u, 0, 7); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx - 30 * u, 26 * u, 17 * u, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx + 30 * u, 26 * u, 17 * u, 0, 7); ctx.stroke();
      ctx.fillStyle = '#e8442e';
      [[cx - 30 * u, 20 * u], [cx + 30 * u, 20 * u]].forEach(([x, y]) => {
        ctx.beginPath(); ctx.arc(x, y, 5 * u, 0, 7); ctx.fill();
      });
      ctx.beginPath(); ctx.arc(cx, 26 * u, 40 * u, Math.PI, 0); ctx.fill();
      break;
    case 'strawhat': {
      ctx.fillStyle = '#f6c445';
      ctx.beginPath(); ctx.moveTo(cx - 58 * u, 30 * u); ctx.lineTo(cx, -6 * u); ctx.lineTo(cx + 58 * u, 30 * u); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillRect(cx - 56 * u, 27 * u, 112 * u, 9 * u);
      ctx.fillStyle = '#e8b98a';
      ctx.beginPath(); ctx.ellipse(cx, 60 * u, 30 * u, 10 * u, 0, Math.PI, 0); ctx.fill();
      break;
    }
    case 'bun':
      ctx.beginPath(); ctx.arc(cx, 22 * u, 20 * u, 0, 7); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#ffd23e'; ctx.beginPath(); ctx.arc(cx, 18 * u, 5 * u, 0, 7); ctx.fill();
      ctx.fillStyle = ch.hair;
      ctx.beginPath(); ctx.arc(cx, 30 * u, 40 * u, Math.PI, 0); ctx.fill();
      break;
    case 'baby':
      ctx.beginPath(); ctx.arc(cx, 28 * u, 40 * u, Math.PI, 0); ctx.fill();
      ctx.beginPath(); ctx.arc(cx - 12 * u, 8 * u, 10 * u, 0, 7); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx - 12 * u, 8 * u, 10 * u, 0, 7); ctx.stroke();
      break;
    case 'turban': {
      ctx.beginPath(); ctx.arc(cx, 30 * u, 42 * u, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#f2f2f2';
      rr(ctx, cx - 34 * u, 18 * u, 68 * u, 22 * u, 10); ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#2f6fd6'; ctx.beginPath(); ctx.arc(cx, 29 * u, 7 * u, 0, 7); ctx.fill();
      break;
    }
    case 'band':
      ctx.beginPath(); ctx.arc(cx, 26 * u, 40 * u, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#e8442e';
      rr(ctx, cx - 40 * u, 30 * u, 80 * u, 13 * u, 6); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 3; rr(ctx, cx - 40 * u, 30 * u, 80 * u, 13 * u, 6); ctx.stroke();
      ctx.fillRect(cx + 34 * u, 32 * u, 16 * u, 10 * u);
      break;
    case 'cat': {
      // 头顶毛 + 三角猫耳
      ctx.fillStyle = ch.hair;
      ctx.beginPath(); ctx.arc(cx, 28 * u, 40 * u, Math.PI, 0); ctx.fill();
      const ear = (sx) => {
        ctx.fillStyle = ch.hair;
        ctx.beginPath();
        ctx.moveTo(cx + sx * 14 * u, 40 * u);
        ctx.lineTo(cx + sx * 40 * u, 2 * u);
        ctx.lineTo(cx + sx * 44 * u, 46 * u);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#ffb3c8';
        ctx.beginPath();
        ctx.moveTo(cx + sx * 23 * u, 34 * u);
        ctx.lineTo(cx + sx * 35 * u, 12 * u);
        ctx.lineTo(cx + sx * 36 * u, 39 * u);
        ctx.closePath(); ctx.fill();
      };
      ear(-1); ear(1);
      // 胡须
      ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.moveTo(cx + sx * 16 * u, 82 * u + sy * 3 * u);
        ctx.lineTo(cx + sx * 40 * u, 78 * u + sy * 9 * u);
        ctx.stroke();
      });
      // 粉鼻
      ctx.fillStyle = '#ff8fb1';
      ctx.beginPath(); ctx.arc(cx, 76 * u, 5.5 * u, 0, 7); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
      break;
    }
    case 'dog': {
      // 头顶毛 + 垂耳
      ctx.fillStyle = ch.hair;
      ctx.beginPath(); ctx.arc(cx, 28 * u, 40 * u, Math.PI, 0); ctx.fill();
      [[-1, -0.45], [1, 0.45]].forEach(([sx, rot]) => {
        ctx.save();
        ctx.translate(cx + sx * 34 * u, 42 * u);
        ctx.rotate(rot * 0.55);
        ctx.fillStyle = ch.hair;
        ctx.beginPath(); ctx.ellipse(0, 27 * u, 17 * u, 32 * u, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#ffe3c8';
        ctx.beginPath(); ctx.ellipse(0, 27 * u, 9 * u, 20 * u, 0, 0, 7); ctx.fill();
        ctx.restore();
      });
      // 黑鼻
      ctx.fillStyle = '#241a12';
      ctx.beginPath(); ctx.ellipse(cx, 73 * u, 7.5 * u, 6 * u, 0, 0, 7); ctx.fill();
      // 红项圈 + 金铃铛
      ctx.fillStyle = '#e8442e';
      rr(ctx, cx - 26 * u, 104 * u, 52 * u, 10 * u, 5); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 2.5; rr(ctx, cx - 26 * u, 104 * u, 52 * u, 10 * u, 5); ctx.stroke();
      ctx.fillStyle = '#ffd23e'; ctx.beginPath(); ctx.arc(cx, 109 * u, 5.5 * u, 0, 7); ctx.fill();
      break;
    }
  }
  // 特殊妆饰
  ctx.fillStyle = ch.hair;
  if (ch.style === 'strawhat' || ch.style === 'turban') {
    ctx.fillRect(cx - 14 * u, 90 * u, 28 * u, 7 * u); // 胡子
    ctx.fillStyle = '#fff';
  }
  if (ch.style === 'strawhat') ctx.fillStyle = '#e8b98a';
  return c;
}

// ================= 道具图标 =================
export function itemIconCanvas(key) {
  const c = canvas(96, 96), ctx = c.getContext('2d');
  const color = ITEMS[key] ? ITEMS[key].color : '#888';
  ctx.fillStyle = '#fff8ea'; rr(ctx, 4, 4, 88, 88, 18); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 5; rr(ctx, 4, 4, 88, 88, 18); ctx.stroke();
  ctx.save();
  switch (key) {
    case 'remote': { // 骰子+星光
      ctx.translate(48, 46);
      ctx.fillStyle = '#fff'; rr(ctx, -22, -22, 44, 44, 10); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
      [[-9, -9], [9, 9], [9, -9]].forEach(([dx, dy]) => {
        ctx.fillStyle = '#e8442e'; ctx.beginPath(); ctx.arc(dx, dy, 5.5, 0, 7); ctx.fill();
      });
      ctx.fillStyle = '#ffd23e';
      ctx.beginPath(); ctx.moveTo(18, -26); ctx.lineTo(26, -16); ctx.lineTo(20, -20); ctx.lineTo(30, -18); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
      break;
    }
    case 'boost': { // 火箭箭头
      ctx.translate(48, 48);
      const g = ctx.createLinearGradient(0, 26, 0, -26);
      g.addColorStop(0, '#ffd23e'); g.addColorStop(1, '#f7941e');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(16, 2); ctx.lineTo(6, 2); ctx.lineTo(6, 28); ctx.lineTo(-6, 28); ctx.lineTo(-6, 2); ctx.lineTo(-16, 2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
      break;
    }
    case 'shield': { // 盾牌+勾
      ctx.translate(48, 50);
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(26, -16); ctx.lineTo(26, 10); ctx.bezierCurveTo(26, 28, 12, 34, 0, 36); ctx.bezierCurveTo(-12, 34, -26, 28, -26, 10); ctx.lineTo(-26, -16); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-10, 2); ctx.lineTo(-2, 11); ctx.lineTo(13, -7); ctx.stroke();
      break;
    }
    case 'bail': { // 金钥匙
      ctx.translate(48, 48);
      ctx.strokeStyle = '#ffd23e'; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(-8, 0, 15, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(26, 0); ctx.stroke();
      ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = INK;
      ctx.fillRect(30, -3, 6, 6); ctx.fillRect(36, -1, 6, 6);
      break;
    }
    case 'block': { // 路障锥
      ctx.translate(48, 52);
      ctx.fillStyle = '#f08c00';
      ctx.beginPath(); ctx.moveTo(-18, -30); ctx.lineTo(18, -30); ctx.lineTo(10, 18); ctx.lineTo(-10, 18); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.moveTo(-7, -14); ctx.lineTo(7, -14); ctx.lineTo(4, 0); ctx.lineTo(-4, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8a8a8a';
      rr(ctx, -24, 20, 48, 12, 5); ctx.fill(); ctx.stroke();
      break;
    }
    case 'steal': { // 钱袋
      ctx.translate(48, 50);
      ctx.fillStyle = '#8a5a33';
      ctx.beginPath(); ctx.arc(0, 0, 24, Math.PI * 0.8, Math.PI * 2.2); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(0, -10); ctx.stroke();
      text(ctx, '¥', 0, 2, { size: 26, weight: 900, color: '#ffd23e' });
      break;
    }
  }
  ctx.restore();
  return c;
}

// ================= 金币（3D 粒子用） =================
export function coinCanvas() {
  const c = canvas(64, 64), ctx = c.getContext('2d');
  ctx.fillStyle = '#ffd23e'; ctx.beginPath(); ctx.arc(32, 32, 30, 0, 7); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke();
  ctx.beginPath(); ctx.arc(32, 32, 20, 0, 7); ctx.stroke();
  text(ctx, '¥', 32, 34, { size: 28, weight: 900, color: '#b02418' });
  return c;
}

// ================= 中心建筑（装饰楼） =================
export function buildingCanvas(base, accent) {
  const c = canvas(128, 160), ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, 128, 160);
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.strokeRect(3, 3, 122, 154);
  ctx.fillStyle = accent;
  for (let r = 0; r < 5; r++) for (let col = 0; col < 3; col++) {
    ctx.fillRect(18 + col * 34, 18 + r * 28, 22, 16);
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(18 + col * 34, 18 + r * 28, 22, 16);
  }
  ctx.fillStyle = '#7a4a21'; ctx.fillRect(52, 120, 24, 40);
  return c;
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return `rgb(${r},${g},${b})`;
}
