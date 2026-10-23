// ============ AI 决策（简单贪心 + 少量随机） ============
// 所有函数均为纯决策：输入状态，返回选择，供 game.js 调用。
import { TILES } from './config.js';

export const ai = {
  // 是否购买地产
  buyDecision(p, tile, st) {
    if (tile.type === 'rail') return p.money - tile.price > 1500;
    if (tile.type === 'util') return p.money - tile.price > 4500;
    const ratio = (p.money - tile.price) / (st.startMoney || 15000);
    return p.money - tile.price > 2000 && (tile.price <= 2000 ? ratio > -0.15 : ratio > 0.12);
  },

  // 监狱抉择：'pay' | 'card' | 'roll'
  jailChoice(p) {
    if ((p.items.bail || 0) > 0) return 'card';
    if (p.money > 10000) return 'pay';
    return 'roll';
  },

  // 遥控骰子选点：在狱中选对子（2/4/6/8/10/12），平时随机 6~12
  remoteTotal(p) {
    if (p.jail.in) return [2, 4, 6, 8, 10, 12][Math.floor(Math.random() * 6)];
    return 6 + Math.floor(Math.random() * 7);
  },

  // 劫富目标：最富有的存活对手
  stealTarget(p, st) {
    let best = -1, bestMoney = -1;
    st.players.forEach((o, i) => {
      if (o.alive && i !== p.idx && o.money > bestMoney) { bestMoney = o.money; best = i; }
    });
    return best;
  },

  // 路障距离
  roadblockDist() { return 5 + Math.floor(Math.random() * 5); },

  // 回合开始前是否使用道具：返回使用的道具 key 或 null
  useItemBeforeRoll(p, st) {
    const richest = ai.stealTarget(p, st);
    if ((p.items.steal || 0) > 0 && richest >= 0 && st.players[richest].money - p.money > 2500) return 'steal';
    if ((p.items.boost || 0) > 0 && Math.random() < 0.35) return 'boost';
    if ((p.items.block || 0) > 0 && Math.random() < 0.4 && ai.activeBlocks(p, st) < 2) return 'block';
    if ((p.items.remote || 0) > 0 && Math.random() < 0.25) return 'remote';
    return null;
  },

  activeBlocks(p, st) {
    return st.tiles.filter(t => t.block === p.idx).length;
  },

  // 是否盖房：返回 {tileIdx} 或 null（均匀加盖，买得起的组里最便宜优先）
  buildPlan(p, st) {
    const groups = {};
    st.tiles.forEach(td => {
      const t = TILES[td.idx];
      if (t.type === 'prop' && td.owner === p.idx) (groups[t.group] = groups[t.group] || []).push(td);
    });
    let best = null, bestCost = Infinity;
    for (const g in groups) {
      const list = groups[g];
      if (list.length !== st.groupSize(g)) continue;      // 未集齐
      const minH = Math.min(...list.map(td => td.houses));
      if (minH >= 5) continue;                            // 全酒店
      const cand = list.filter(td => td.houses === minH);
      const cost = st.groupCost(g);
      if (cost < bestCost && p.money - cost > 1200) { best = cand[0]; bestCost = cost; }
    }
    return best;
  },
};
