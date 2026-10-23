// ============ 游戏规则引擎（回合 / 掷骰 / 买卖 / 收租 / 盖房 / 监狱 / 卡牌 / 道具 / 破产） ============
import {
  TILES, GROUPS, ITEMS, CHARS, CHANCE_CARDS, EVENT_CARDS,
  START_ITEMS, START_MONEY, GO_BONUS, JAIL_BAIL, JAIL_TILE,
  FREE_PARKING_BONUS, ROADBLOCK_MAX, STEAL_AMOUNT, MAX_HOUSES,
} from './config.js';

export const game = {
  hooks: null,
  state: null,
  _chain: Promise.resolve(),

  init(hooks) { this.hooks = hooks; this.gen = 0; },
  sleep(ms) { return new Promise(r => setTimeout(r, ms)); },
  run(fn) {
    const gen = this.gen;
    this._chain = this._chain.then(async () => {
      if (gen !== this.gen) return; // 旧对局的过期任务直接跳过
      await fn();
    }).catch(e => {
      console.error(e);
      this.hooks?.ui?.toast('发生错误：' + (e && e.message ? e.message : e));
    });
    return this._chain;
  },

  // ================= 开局 =================
  startGame(cfg) {
    this.gen++;
    this.hooks.ui.closeAllModals();
    this.run(async () => {
      const st = this.state = {
        startMoney: cfg.startMoney || START_MONEY,
        players: cfg.players.map((c, i) => ({
          idx: i, name: c.name, charIdx: c.charIdx, ai: !!c.ai,
          color: CHARS[c.charIdx].outfit,
          money: cfg.startMoney || START_MONEY, pos: 0, alive: true,
          jail: { in: false, turns: 0 }, doubles: 0,
          items: { ...START_ITEMS },
        })),
        tiles: TILES.map(t => ({ idx: t.idx, owner: -1, houses: 0, block: null })),
        mode: cfg.mode || { type: 'bankrupt' },
        current: 0, phase: 'turn', turnCount: 0, winner: null,
        lastDice: [0, 0], rolled: false, remote: false, boost: false,
        groupSize: (g) => TILES.filter(t => t.group === g).length,
        groupCost: (g) => GROUPS[g].house,
      };
      this.hooks.scene.resetBoard();
      this.hooks.scene.setPlayers(st.players);
      this.hooks.scene.setActive(0);
      this.hooks.ui.enterGame(st.players);
      this.hooks.ui.updateHUD(st);
      this.hooks.ui.log(`🎲 游戏开始！每人资金 ¥${(cfg.startMoney || START_MONEY).toLocaleString()}，途经起点领取 ¥${GO_BONUS.toLocaleString()}！`);
      if (st.mode.type === 'turns') this.hooks.ui.log(`⏱ 本局为回合制：共 ${st.mode.turns} 轮，结束后资产最高者获胜！`);
      await this.sleep(400);
      this.run(() => this.startTurn(st.players[0]));
    });
  },

  // ================= 回合流转 =================
  async startTurn(p) {
    const st = this.state;
    if (st.winner) return;
    st.current = p.idx;
    st.phase = 'turn';
    st.rolled = false;
    st.remote = false;
    st.boost = false;
    this.hooks.scene.setActive(p.idx);
    this.hooks.scene.focus(p.pos);
    this.hooks.ui.updateHUD(st);
    this.hooks.ui.log(`—— ${p.name} 的回合 ——`, p.color);
    // 掷骰前：显示前方 1~12 格步数引导
    this.hooks.scene.hideStepGuides();
    if (!p.jail.in) this.hooks.scene.showStepGuides(p.pos);
    if (p.jail.in) {
      p.jail.turns++;
      if (p.jail.turns > 3) {
        this.hooks.ui.log(`${p.name} 已滞留监狱太久，强制缴纳保释金！`);
        await this.pay(p, null, JAIL_BAIL, '缴纳保释金');
        p.jail.in = false; p.jail.turns = 0;
        this.hooks.ui.toast(`${p.name} 缴纳 ¥${JAIL_BAIL} 保释金出狱！`);
        this.hooks.ui.updateHUD(st);
      } else {
        const choice = p.ai
          ? this.hooks.ai.jailChoice(p)
          : await this.hooks.ui.jailMenu(p, st);
        await this.jailResolve(p, choice);
      }
      if (st.winner || !p.alive) return;
      if (!p.jail.in) {
        // 出狱成功后继续行动（掷对子出狱的场合 rolled=true，自动跳过）
        if (p.ai) await this.aiTurn(p);
        else this.hooks.ui.updateHUD(st);
      }
    } else if (p.ai) {
      await this.sleep(450);
      await this.aiTurn(p);
    }
  },

  async aiTurn(p) {
    const st = this.state;
    if (st.winner || !p.alive) return;
    const use = this.hooks.ai.useItemBeforeRoll(p, st);
    if (use) await this.useItemFlow(use, p);
    if (st.winner || !p.alive) return;
    // 盖房
    for (let i = 0; i < 3; i++) {
      const plan = this.hooks.ai.buildPlan(p, st);
      if (!plan) break;
      await this._build(p, plan.idx, 1);
    }
    if (st.winner || !p.alive) return;
    if (st.phase !== 'turn' || st.rolled) return;
    await this.doRoll(p, st.remote ? this.hooks.ai.remoteTotal(p) : null);
  },

  async jailResolve(p, choice) {
    const st = this.state;
    if (choice === 'pay') {
      await this.pay(p, null, JAIL_BAIL, '缴纳保释金');
      p.jail.in = false; p.jail.turns = 0;
      this.hooks.ui.toast(`${p.name} 缴纳 ¥${JAIL_BAIL} 保释金出狱！`);
    } else if (choice === 'card') {
      p.items.bail--;
      p.jail.in = false; p.jail.turns = 0;
      this.hooks.ui.log(`${p.name} 使用出狱卡，重获自由！`);
      this.hooks.ui.toast(`${p.name} 出狱！`);
      this.hooks.sound?.card?.();
    } else {
      const a = 1 + Math.floor(Math.random() * 6), b = 1 + Math.floor(Math.random() * 6);
      st.lastDice = [a, b];
      await this.hooks.scene.rollDice(a, b);
      this.hooks.ui.log(`${p.name} 狱中掷骰：${a} + ${b}`);
      if (a === b) {
        p.jail.in = false; p.jail.turns = 0;
        this.hooks.ui.toast(`${p.name} 掷出对子，出狱！`);
        st.rolled = true;
        await this.moveForward(p, a + b);
        if (st.winner) return;
        await this.land(p);
        if (st.winner) return;
        st.turnCount++;
        this.endTurnCheck();
      } else {
        this.hooks.ui.toast(`${p.name} 没有掷出对子，继续蹲监狱……`);
        st.turnCount++;
        this.endTurnCheck();
      }
    }
    this.hooks.ui.updateHUD(st);
  },

  async nextTurn() {
    const st = this.state;
    if (st.winner) return;
    let next = (st.current + 1) % st.players.length;
    let guard = 0;
    while (!st.players[next].alive && guard++ < st.players.length) next = (next + 1) % st.players.length;
    st.current = next;
    st.rolled = false;
    this.hooks.ui.updateHUD(st);
    await this.sleep(260);
    this.run(() => this.startTurn(st.players[next]));
  },

  endTurnCheck() {
    const st = this.state;
    if (st.winner) return;
    if (st.mode.type === 'turns' && st.turnCount >= st.mode.turns * st.players.length) {
      this.run(() => this.endGame(null, 'turns'));
      return;
    }
    this.nextTurn();
  },

  // ================= 掷骰与移动 =================
  onRoll() {
    this.run(async () => {
      const st = this.state, p = st.players[st.current];
      if (st.winner || !p || p.ai || !p.alive || st.phase !== 'turn' || st.rolled || p.jail.in) return;
      await this.doRoll(p, null);
    });
  },

  async doRoll(p, forcedTotal) {
    const st = this.state;
    st.phase = 'rolling';
    st.rolled = true;
    st.remote = false;
    this.hooks.scene.hideStepGuides();
    this.hooks.ui.updateHUD(st);
    let a, b;
    if (forcedTotal != null) {
      a = Math.min(6, Math.ceil(forcedTotal / 2));
      b = forcedTotal - a;
    } else {
      a = 1 + Math.floor(Math.random() * 6);
      b = 1 + Math.floor(Math.random() * 6);
    }
    st.lastDice = [a, b];
    await this.hooks.scene.rollDice(a, b);
    let steps = a + b;
    let msg = `${p.name} 掷出 ${a} + ${b} = ${steps} 点`;
    if (st.boost) { steps += 2; msg += `，加速卡生效 → 共 ${steps} 步`; st.boost = false; }
    this.hooks.ui.log(msg);
    const isDoubles = forcedTotal == null && a === b;
    if (!isDoubles) p.doubles = 0;
    await this.moveForward(p, steps);
    if (st.winner || !p.alive) return;
    await this.land(p);
    if (st.winner) return;
    await this.postLand(p, isDoubles);
  },

  pathTiles(from, to, steps) {
    const out = [];
    for (let s = 1; s <= steps; s++) out.push((from + s) % TILES.length);
    return out;
  },

  async moveForward(p, steps, opts = {}) {
    const st = this.state;
    const tiles = [];
    let blocked = null;
    for (let s = 1; s <= steps; s++) {
      const t = (p.pos + s) % TILES.length;
      tiles.push(t);
      if (opts.checkBlock !== false && st.tiles[t].block != null && st.tiles[t].block !== p.idx) {
        blocked = t;
        break;
      }
    }
    await this.hooks.scene.movePlayer(p.idx, tiles, {
      onStep: (t) => {
        if (t === 0 && opts.collectGO !== false) {
          p.money += GO_BONUS;
          this.hooks.ui.log(`${p.name} 经过起点，领取 ¥${GO_BONUS.toLocaleString()}！`);
          this.hooks.scene.coinBurst(0, 6);
          this.hooks.scene.floatText(0, `+¥${GO_BONUS.toLocaleString()}`, '#ffd23e');
          this.hooks.scene.jump(p.idx);
          this.hooks.sound?.coin?.();
          this.hooks.ui.updateHUD(this.state);
        }
      },
    });
    p.pos = (p.pos + tiles.length) % TILES.length;
    if (blocked != null) {
      st.tiles[blocked].block = null;
      this.hooks.scene.setRoadblock(blocked, null);
      this.hooks.ui.log(`🚧 ${p.name} 撞上了路障，被迫停在「${TILES[blocked].name}」！`);
      this.hooks.ui.toast(`🚧 ${p.name} 被路障拦停！`);
      this.hooks.sound?.jail?.();
    }
  },

  async moveBackward(p, steps) {
    const tiles = [];
    for (let s = 1; s <= steps; s++) tiles.push((p.pos - s + TILES.length) % TILES.length);
    await this.hooks.scene.movePlayer(p.idx, tiles);
    p.pos = (p.pos - steps + TILES.length) % TILES.length;
    this.hooks.ui.log(`${p.name} 后退了 ${steps} 格。`);
  },

  // ================= 落地结算 =================
  async land(p) {
    const st = this.state;
    const t = TILES[p.pos];
    this.hooks.scene.focus(p.pos);
    switch (t.type) {
      case 'go':
        this.hooks.ui.log(`${p.name} 回到了起点！`);
        break;
      case 'prop':
      case 'rail':
      case 'util': {
        const td = st.tiles[p.pos];
        if (td.owner === -1) {
          const buy = p.ai
            ? this.hooks.ai.buyDecision(p, t, st)
            : await this.hooks.ui.askBuy(p, t, st);
          if (buy) {
            p.money -= t.price;
            td.owner = p.idx;
            this.hooks.ui.log(`${p.name} 买下「${t.name}」！`);
            this.hooks.sound?.buy?.();
            this.hooks.scene.coinBurst(p.pos, 5);
            this.hooks.ui.toast(`${p.name} 购入「${t.name}」（¥${t.price.toLocaleString()}）`);
            this.hooks.ui.updateHUD(st);
          } else {
            this.hooks.ui.log(`${p.name} 放弃了「${t.name}」。`);
          }
        } else if (td.owner !== p.idx) {
          const owner = st.players[td.owner];
          const amount = this.rentOf(t, td.owner, st.lastDice[0] + st.lastDice[1]);
          if ((p.items.shield || 0) > 0) {
            p.items.shield--;
            this.hooks.ui.log(`🛡 ${p.name} 使用免租金牌，免付「${t.name}」租金 ¥${amount.toLocaleString()}！`);
            this.hooks.sound?.card?.();
            this.hooks.ui.updateHUD(st);
          } else {
            await this.pay(p, owner, amount, `支付「${t.name}」租金`);
          }
        } else {
          this.hooks.ui.log(`${p.name} 回到自己的地盘「${t.name}」，歇歇脚~`);
        }
        break;
      }
      case 'tax': {
        await this.pay(p, null, t.amount, `缴纳${t.name}`);
        break;
      }
      case 'chance':
      case 'event': {
        await this.drawCard(t.type);
        break;
      }
      case 'jail':
        this.hooks.ui.log(`${p.name} 路过监狱，只是探望一下。`);
        break;
      case 'parking':
        p.money += FREE_PARKING_BONUS;
        this.hooks.ui.log(`🅿 ${p.name} 免费停留，领取慰问金 ¥${FREE_PARKING_BONUS}！`);
        this.hooks.scene.coinBurst(p.pos, 6);
        this.hooks.scene.floatText(p.pos, `+¥${FREE_PARKING_BONUS}`, '#ffd23e');
        this.hooks.sound?.coin?.();
        this.hooks.ui.updateHUD(st);
        break;
      case 'gotojail': {
        const went = await this.sendToJail(p, '被警察请去喝茶');
        if (went) this.hooks.sound?.jail?.();
        break;
      }
    }
  },

  rentOf(t, ownerIdx, diceTotal) {
    const st = this.state;
    if (t.type === 'rail') {
      const n = st.tiles.filter(x => TILES[x.idx].type === 'rail' && x.owner === ownerIdx).length;
      return t.rents[n - 1];
    }
    if (t.type === 'util') {
      const n = st.tiles.filter(x => TILES[x.idx].type === 'util' && x.owner === ownerIdx).length;
      return diceTotal * (n >= 2 ? 100 : 40);
    }
    const td = st.tiles[t.idx];
    if (td.houses > 0) return t.rent[td.houses];
    return t.rent[0] * (this.ownsSet(ownerIdx, t.group) ? 2 : 1);
  },

  ownsSet(ownerIdx, group) {
    const st = this.state;
    const list = st.tiles.filter(x => TILES[x.idx].group === group);
    return list.length > 0 && list.every(x => x.owner === ownerIdx);
  },

  groupCost(group) { return GROUPS[group].house; },

  async pay(p, to, amount, reason) {
    if (amount <= 0) return;
    const st = this.state;
    const payAmt = Math.max(0, Math.min(p.money, amount));
    p.money -= amount;            // 全额记账：现金不足时出现负债，触发清算/破产
    if (to) to.money += payAmt;   // 债权人收到实际可付部分
    this.hooks.scene.coinBurst(p.pos, 4);
    this.hooks.scene.floatText(p.pos, `-¥${amount.toLocaleString()}`, '#ff6b57');
    this.hooks.sound?.pay?.();
    this.hooks.ui.log(
      `${p.name} ${reason} ¥${amount.toLocaleString()}${to ? ' → ' + to.name : ''}` +
      (payAmt < amount ? `（现金不足，仅支付 ¥${payAmt.toLocaleString()}）` : '')
    );
    if (to && amount > 0) this.hooks.ui.toast(`${p.name} 支付 ¥${amount.toLocaleString()} 给 ${to.name}`);
    this.hooks.ui.updateHUD(st);
    if (p.money < 0) {
      await this.liquidate(p);
      if (p.money < 0) await this.bankrupt(p, to);
    }
  },

  gain(p, amount, reason) {
    p.money += amount;
    this.hooks.scene.coinBurst(p.pos, 5);
    this.hooks.scene.floatText(p.pos, `+¥${amount.toLocaleString()}`, '#ffd23e');
    this.hooks.sound?.coin?.();
    this.hooks.ui.log(`${p.name} ${reason} ¥${amount.toLocaleString()}！`);
    this.hooks.ui.updateHUD(this.state);
  },

  async liquidate(p) {
    const st = this.state;
    while (p.money < 0) {
      let best = null, bestH = 0;
      st.tiles.forEach(td => {
        const t = TILES[td.idx];
        if (td.owner === p.idx && t.type === 'prop' && td.houses > bestH) { bestH = td.houses; best = td; }
      });
      if (!best) break;
      const refund = Math.floor(this.groupCost(TILES[best.idx].group) / 2);
      best.houses--;
      p.money += refund;
      this.hooks.scene.updateHouses(best.idx, best.houses, GROUPS[TILES[best.idx].group].color);
      this.hooks.ui.log(`${p.name} 变卖「${TILES[best.idx].name}」房屋一间，回款 ¥${refund}。`);
      await this.sleep(130);
    }
    this.hooks.ui.updateHUD(st);
  },

  async bankrupt(p, creditor) {
    const st = this.state;
    if (!p.alive) return;
    p.alive = false;
    p.jail.in = false;
    st.tiles.forEach(td => {
      if (td.owner === p.idx) {
        td.owner = -1; td.houses = 0;
        const t = TILES[td.idx];
        this.hooks.scene.updateHouses(td.idx, 0, t.group ? GROUPS[t.group].color : '#fff');
      }
      if (td.block === p.idx) {
        td.block = null;
        this.hooks.scene.setRoadblock(td.idx, null);
      }
    });
    this.hooks.sound?.lose?.();
    this.hooks.scene.bankruptAnim(p.idx);
    this.hooks.ui.log(`💸 ${p.name} 破产出局！`);
    this.hooks.ui.toast(`💸 ${p.name} 破产了……`);
    this.hooks.ui.updateHUD(st);
    const alive = st.players.filter(x => x.alive);
    if (alive.length === 1) await this.endGame(alive[0], 'bankrupt');
  },

  // ================= 卡牌（翻牌盲选） =================
  async drawCard(deck) {
    const st = this.state, p = st.players[st.current];
    const arr = deck === 'chance' ? CHANCE_CARDS : EVENT_CARDS;
    // 洗出 5 张，背面朝上供玩家挑选
    const pool = arr.slice().sort(() => Math.random() - 0.5).slice(0, 5);
    this.hooks.sound?.card?.();
    const pick = p.ai
      ? Math.floor(Math.random() * pool.length)
      : await this.hooks.ui.pickCard(deck, p, pool);
    const card = pool[Math.max(0, Math.min(pool.length - 1, pick))];
    this.hooks.ui.log(`[${deck === 'chance' ? '机会卡' : '事件卡'}] ${card.text}`);
    await this.applyCard(p, card);
  },

  async applyCard(p, card) {
    const st = this.state;
    switch (card.kind) {
      case 'money':
        if (card.v > 0) this.gain(p, card.v, '获得意外之财');
        else await this.pay(p, null, -card.v, '破财消灾，支付');
        break;
      case 'perPlayer': {
        const others = st.players.filter(o => o.alive && o.idx !== p.idx);
        if (card.v > 0) {
          for (const o of others) await this.pay(o, p, card.v, `送给 ${p.name} 红包，支付`);
          this.hooks.ui.log(`${p.name} 收到每人 ¥${card.v} 的红包！`);
        } else {
          for (const o of others) await this.pay(p, o, -card.v, `请 ${o.name} 吃大餐，支付`);
        }
        break;
      }
      case 'perHouse': {
        const n = st.tiles.reduce((s, td) => s + (td.owner === p.idx && TILES[td.idx].type === 'prop' ? td.houses : 0), 0);
        if (n > 0) await this.pay(p, null, -card.v * n, `房屋维修费（${n} 栋），支付`);
        else this.hooks.ui.log('没有房屋，无需缴费。');
        break;
      }
      case 'move':
        if (card.v > 0) await this.moveForward(p, card.v);
        else await this.moveBackward(p, -card.v);
        if (st.winner || !p.alive) return;
        await this.land(p);
        break;
      case 'moveTo': {
        const to = card.to;
        let steps = (to - p.pos + TILES.length) % TILES.length;
        if (steps > 0) {
          await this.moveForward(p, steps);
          if (st.winner || !p.alive) return;
          await this.land(p);
        }
        break;
      }
      case 'moveToNearestRail': {
        const rails = TILES.filter(t => t.type === 'rail').map(t => t.idx);
        let best = null;
        rails.forEach(r => {
          const steps = (r - p.pos + TILES.length) % TILES.length;
          if (steps > 0 && (best === null || steps < best)) best = steps;
        });
        if (best != null) {
          await this.moveForward(p, best);
          if (st.winner || !p.alive) return;
          await this.land(p);
        }
        break;
      }
      case 'gotoJail':
        await this.sendToJail(p, '抽到霉运卡');
        break;
      case 'item': {
        p.items[card.item] = (p.items[card.item] || 0) + 1;
        this.hooks.ui.toast(`${p.name} 获得「${ITEMS[card.item].name}」！`);
        this.hooks.ui.updateHUD(st);
        break;
      }
    }
  },

  async sendToJail(p, reason) {
    const st = this.state;
    if ((p.items.bail || 0) > 0) {
      const use = p.ai ? true : await this.hooks.ui.askUseBail(p);
      if (use) {
        p.items.bail--;
        this.hooks.ui.log(`${p.name} 使用出狱卡，免去牢狱之灾！`);
        this.hooks.ui.toast(`${p.name} 用出狱卡逃过一劫！`);
        this.hooks.sound?.card?.();
        this.hooks.ui.updateHUD(st);
        return false;
      }
    }
    p.jail.in = true;
    p.jail.turns = 0;
    p.doubles = 0;
    const steps = (JAIL_TILE - p.pos + TILES.length) % TILES.length;
    const tiles = steps > 0 ? this.pathTiles(p.pos, JAIL_TILE, steps) : [];
    await this.hooks.scene.movePlayer(p.idx, tiles);
    p.pos = JAIL_TILE;
    this.hooks.ui.log(`⛓ ${p.name} ${reason}，送入监狱！`);
    this.hooks.ui.toast(`⛓ ${p.name} 进监狱了！`);
    this.hooks.ui.updateHUD(st);
    return true;
  },

  // ================= 道具 =================
  onUseItem(key) {
    this.run(async () => {
      const st = this.state, p = st.players[st.current];
      if (st.winner || !p || p.ai || !p.alive || st.phase !== 'turn' || st.rolled || p.jail.in) {
        this.hooks.ui.toast('现在还不能使用道具哦~');
        return;
      }
      await this.useItemFlow(key, p);
    });
  },

  async useItemFlow(key, p) {
    const st = this.state;
    if (!(p.items[key] > 0)) return;
    switch (key) {
      case 'remote': {
        p.items[key]--;
        st.remote = true;
        this.hooks.ui.updateHUD(st);
        if (p.ai) {
          await this.doRoll(p, this.hooks.ai.remoteTotal(p));
        } else {
          const total = await this.hooks.ui.chooseRemote(p);
          if (total == null) { p.items[key]++; st.remote = false; this.hooks.ui.updateHUD(st); return; }
          await this.doRoll(p, total);
        }
        break;
      }
      case 'boost':
        p.items[key]--;
        st.boost = true;
        this.hooks.ui.log(`${p.name} 使用加速卡，下一步 +2！`);
        this.hooks.ui.updateHUD(st);
        break;
      case 'steal':
        p.items[key]--;
        await this.stealFlow(p);
        break;
      case 'block':
        p.items[key]--;
        await this.blockFlow(p);
        break;
      default:
        this.hooks.ui.toast(`「${ITEMS[key].name}」会自动生效，无需手动使用。`);
    }
  },

  async stealFlow(p) {
    const st = this.state;
    const target = p.ai
      ? this.hooks.ai.stealTarget(p, st)
      : await this.hooks.ui.chooseTarget(p, st);
    if (target == null) { p.items.steal++; return; }
    const t = st.players[target];
    const amt = Math.min(STEAL_AMOUNT, Math.max(0, t.money));
    t.money -= amt;
    p.money += amt;
    this.hooks.sound?.coin?.();
    this.hooks.scene.coinBurst(t.pos, 6);
    this.hooks.ui.log(`🦹 ${p.name} 使用劫富卡，从 ${t.name} 处抢走 ¥${amt.toLocaleString()}！`);
    this.hooks.ui.toast(`${p.name} 抢走 ${t.name} ¥${amt.toLocaleString()}！`);
    this.hooks.ui.updateHUD(st);
    if (t.money < 0) await this.bankrupt(t, p);
  },

  async blockFlow(p) {
    const st = this.state;
    const d = p.ai
      ? this.hooks.ai.roadblockDist()
      : await this.hooks.ui.chooseDistance(p);
    if (d == null) { p.items.block++; return; }
    const ti = (p.pos + d) % TILES.length;
    const active = st.tiles.filter(t => t.block === p.idx).length;
    if (active >= ROADBLOCK_MAX || st.tiles[ti].block != null || TILES[ti].idx === p.pos) {
      this.hooks.ui.toast('这里放不了路障~');
      p.items.block++;
      return;
    }
    st.tiles[ti].block = p.idx;
    this.hooks.scene.setRoadblock(ti, p.color);
    this.hooks.ui.log(`🚧 ${p.name} 在「${TILES[ti].name}」放置了路障！`);
    this.hooks.ui.updateHUD(st);
  },

  // ================= 盖房 =================
  onBuild(tileIdx, delta) {
    this.run(async () => {
      const st = this.state, p = st.players[st.current];
      if (st.winner || !p || !p.alive) return;
      const td = st.tiles[tileIdx], t = TILES[tileIdx];
      if (!t || td.owner !== p.idx || t.type !== 'prop') return;
      await this._build(p, tileIdx, delta);
    });
    return this._chain;
  },

  async _build(p, tileIdx, delta) {
    const st = this.state;
    const td = st.tiles[tileIdx], t = TILES[tileIdx];
    if (delta > 0) {
      if (!this.ownsSet(p.idx, t.group)) return this.hooks.ui.toast('集齐该色组才能盖房！');
      if (td.houses >= MAX_HOUSES) return this.hooks.ui.toast('已经是最豪华的酒店啦！');
      const group = st.tiles.filter(x => TILES[x.idx].group === t.group && x.owner === p.idx);
      const minH = Math.min(...group.map(x => x.houses));
      if (td.houses > minH) return this.hooks.ui.toast('请均匀加盖房屋！');
      const cost = this.groupCost(t.group);
      if (p.money < cost) return this.hooks.ui.toast('资金不足！');
      p.money -= cost;
      td.houses++;
      this.hooks.sound?.buy?.();
      this.hooks.ui.log(`${p.name} 在「${t.name}」加盖${td.houses >= 5 ? '酒店' : `第 ${td.houses} 间房屋`}（¥${cost.toLocaleString()}）。`);
    } else {
      if (td.houses <= 0) return;
      const group = st.tiles.filter(x => TILES[x.idx].group === t.group && x.owner === p.idx);
      const maxH = Math.max(...group.map(x => x.houses));
      if (td.houses < maxH) return this.hooks.ui.toast('请均匀拆除房屋！');
      const refund = Math.floor(this.groupCost(t.group) / 2);
      p.money += refund;
      td.houses--;
      this.hooks.sound?.pay?.();
      this.hooks.ui.log(`${p.name} 出售「${t.name}」房屋，回款 ¥${refund.toLocaleString()}。`);
    }
    this.hooks.scene.updateHouses(tileIdx, td.houses, GROUPS[t.group].color);
    this.hooks.ui.updateHUD(st);
  },

  // ================= 资产与胜负 =================
  assets(p) {
    const st = this.state;
    let v = p.money;
    st.tiles.forEach(td => {
      const t = TILES[td.idx];
      if (td.owner === p.idx) {
        if (t.type === 'prop') v += t.price + td.houses * this.groupCost(t.group);
        else if (t.type === 'rail' || t.type === 'util') v += t.price;
      }
    });
    return v;
  },

  async postLand(p, isDoubles) {
    const st = this.state;
    st.turnCount++;
    if (st.winner) return;
    if (!p.alive) { this.nextTurn(); return; }
    if (p.jail.in) { this.nextTurn(); return; }
    if (isDoubles) {
      p.doubles++;
      if (p.doubles >= 3) {
        this.hooks.ui.log(`${p.name} 连续三次掷出对子，乐极生悲！`);
        const went = await this.sendToJail(p, '连续三次对子');
        if (went) this.nextTurn();
        else this.endTurnCheck();
        return;
      }
      st.phase = 'turn';
      st.rolled = false;
      this.hooks.ui.toast(`🎉 ${p.name} 掷出对子，再掷一次！`);
      this.hooks.ui.updateHUD(st);
      if (!p.jail.in) this.hooks.scene.showStepGuides(p.pos);
      if (p.ai) await this.aiTurn(p);
      return;
    }
    this.endTurnCheck();
  },

  async endGame(winner, reason) {
    const st = this.state;
    if (st.winner) return;
    if (!winner) {
      winner = st.players.filter(p => p.alive).reduce((a, b) => this.assets(b) > this.assets(a) ? b : a);
    }
    st.winner = winner;
    st.phase = 'gameover';
    this.hooks.scene.hideStepGuides();
    this.hooks.sound?.fanfare?.();
    this.hooks.scene.celebrate();
    this.hooks.ui.updateHUD(st);
    this.hooks.ui.log(`🏆 ${winner.name} 获胜！恭喜！`);
    this.hooks.ui.toast(`🏆 ${winner.name} 赢得本局游戏！`);
    await this.sleep(900);
    const rankings = st.players.slice().sort((a, b) => this.assets(b) - this.assets(a));
    this.hooks.ui.gameOver(winner, rankings, reason, this);
  },
};
