// ============ 无头冒烟测试：桩掉 3D/UI，验证规则引擎能跑完一整局 ============
// 运行：node test/smoke.mjs
import { game } from '../js/game.js';
import { ai } from '../js/ai.js';
import { TILES, GROUPS } from '../js/config.js';

const hooks = {
  scene: {
    resetBoard() {}, setPlayers() {}, setActive() {},
    movePlayer: async () => {}, rollDice: async () => {},
    updateHouses() {}, setRoadblock() {}, coinBurst() {}, focus() {}, celebrate() {},
    floatText() {}, jump: async () => {}, bankruptAnim: async () => {},
    showStepGuides() {}, hideStepGuides() {},
  },
  ui: {
    closeAllModals() {}, enterGame() {}, updateHUD() {}, log() {}, toast() {},
    showCard: async () => true,
    pickCard: async () => 0,
    askBuy: async (p, t) => (p.money - t.price > 1500),
    jailMenu: async () => 'pay',
    askUseBail: async () => false,
    chooseRemote: async () => 7,
    chooseTarget: async () => null,
    chooseDistance: async () => 5,
    buildPanel() {},
    gameOver() {},
  },
  ai,
  sound: null,
};

const ROUNDS = +(process.argv[2] || 8);

game.init(hooks);
game.startGame({
  players: [
    { name: '测试甲', charIdx: 0, ai: true },
    { name: '测试乙', charIdx: 1, ai: true },
    { name: '测试丙', charIdx: 2, ai: true },
  ],
  mode: { type: 'turns', turns: ROUNDS },
});

const t0 = Date.now();
while (!game.state?.winner && Date.now() - t0 < 90000) {
  await new Promise(r => setTimeout(r, 100));
}

const st = game.state;
if (!st) throw new Error('游戏状态未创建');
console.log('✅ 游戏结束');
console.log('   胜者:', st.winner?.name, '| 回合数:', st.turnCount, '| 结束原因:', st.mode.type);

// ---- 一致性断言 ----
const assert = (cond, msg) => { if (!cond) { console.error('❌', msg); process.exit(1); } console.log('✅', msg); };

assert(st.winner !== undefined && st.winner !== null, '存在获胜者');
for (const td of st.tiles) {
  const t = TILES[td.idx];
  assert(td.owner >= -1 && td.owner < st.players.length, `格子 ${t.idx} 所有者合法`);
  assert(td.houses >= 0 && td.houses <= 5, `格子 ${t.idx} 房屋数合法 (${td.houses})`);
  if (td.owner === -1) assert(td.houses === 0, `格子 ${t.idx} 无主则无房`);
  if (t.type !== 'prop') assert(td.houses === 0, `格子 ${t.idx} 非地产无房`);
}
for (const p of st.players) {
  assert(p.money >= 0 || !p.alive, `${p.name} 资金合法 (${p.money})`);
  for (const k of Object.keys(p.items)) assert(p.items[k] >= 0, `${p.name} 道具数量合法`);
}
const totalHouses = st.tiles.reduce((s, td) => s + td.houses, 0);
console.log('   总房屋数:', totalHouses, '| 总资产排行:');
st.players.slice().sort((a, b) => game.assets(b) - game.assets(a))
  .forEach(p => console.log(`     ${p.name}: ¥${game.assets(p).toLocaleString()} (现金 ¥${p.money.toLocaleString()}, ${p.alive ? '存活' : '破产'})`));
// 调试：各玩家集齐的色组数
const GROUPS_DEBUG = {};
TILES.forEach(t => { if (t.group) GROUPS_DEBUG[t.group] = (GROUPS_DEBUG[t.group] || 0) + 1; });
st.players.forEach(p => {
  const sets = Object.keys(GROUPS_DEBUG).filter(g =>
    st.tiles.filter(x => TILES[x.idx].group === g).every(x => x.owner === p.idx)).length;
  console.log(`     [调试] ${p.name} 集齐色组数: ${sets}, 拥有地产: ${st.tiles.filter(x => x.owner === p.idx).length}`);
});

// ============ 破产路径专项测试（构造独立状态，不走任务链） ============
const mkPlayer = (idx, money, ai = true) => ({
  idx, name: 'P' + idx, charIdx: idx, ai, color: '#888',
  money, pos: 0, alive: true, jail: { in: false, turns: 0 }, doubles: 0,
  items: { remote: 0, shield: 0, bail: 0, boost: 0, block: 0, steal: 0 },
});
const mkState = (m0, m1) => ({
  players: [mkPlayer(0, m0), mkPlayer(1, m1)],
  tiles: TILES.map(t => ({ idx: t.idx, owner: -1, houses: 0, block: null })),
  mode: { type: 'bankrupt' }, current: 0, phase: 'turn', turnCount: 0,
  winner: null, lastDice: [0, 0], rolled: false, remote: false, boost: false,
  groupSize: g => TILES.filter(t => t.group === g).length,
  groupCost: g => GROUPS[g].house,
});

// 场景 A：负债且变卖房产后仍不足 → 破产，债权人只收到实际可付部分
game.state = mkState(300, 5000);
game.state.tiles[1].owner = 0;
game.state.tiles[1].houses = 2;
await game.pay(game.state.players[0], game.state.players[1], 5000, '测试租金');
assert(!game.state.players[0].alive, 'A: 偿债失败 → 破产');
assert(game.state.players[1].money === 5300, 'A: 债权人收到实际可付的 ¥300');
assert(game.state.tiles[1].owner === -1 && game.state.tiles[1].houses === 0, 'A: 破产后地产回归银行');
assert(game.state.winner && game.state.winner.idx === 1, 'A: 破产模式立即决出胜者');

// 场景 B：变卖房产后足以偿债 → 存活
game.state = mkState(100, 5000);
game.state.tiles[1].owner = 0;
game.state.tiles[1].houses = 4; // 褐屋半价 250/间
await game.pay(game.state.players[0], game.state.players[1], 600, '测试租金');
assert(game.state.players[0].alive, 'B: 变卖后还清 → 存活');
assert(game.state.players[0].money === 0, 'B: 清算后余款正确 (100-600+500)');
assert(game.state.tiles[1].houses === 2, 'B: 变卖 2 间房恰好偿清债务');

// 场景 C：自定义初始资金
game.startGame({
  players: [{ name: 'X', charIdx: 0, ai: true }, { name: 'Y', charIdx: 1, ai: true }],
  mode: { type: 'turns', turns: 1 },
  startMoney: 8000,
});
await new Promise(r => setTimeout(r, 80));
assert(game.state.startMoney === 8000, 'C: startMoney 已记录');
assert(game.state.players[0].money === 8000 && game.state.players[1].money === 8000, 'C: 自定义初始资金 ¥8,000 生效');

console.log('🎉 冒烟测试全部通过');
process.exit(0);
