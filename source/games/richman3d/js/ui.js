// ============ UI：设置界面 / HUD / 弹窗 / 结算 ============
import { CHARS, ITEMS, GROUPS, TILES, MAX_HOUSES } from './config.js';
import { avatarCanvas, cardFaceCanvas, cardBackCanvas, deedCanvas, moneyCanvas, itemIconCanvas } from './draw.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const ui = {
  game: null,
  sound: null,
  _startCb: null,
  _billImg: null,
  _cardBackImg: null,
  _cache: { avatar: {}, card: {}, deed: {}, item: {} },
  _modals: [],
  _moneyShown: {},
  _moneyAnim: new Map(),

  init(gameRef, soundRef) {
    this.game = gameRef;
    this.sound = soundRef;
    this._billImg = moneyCanvas(1000).toDataURL();
    this._cardBackImg = cardBackCanvas().toDataURL();
    $('#btn-cam').addEventListener('click', () => this.toggleCam());
    $('#btn-music').addEventListener('click', () => this.toggleMusic());
    $('#btn-sound').addEventListener('click', () => this.toggleSound());
    $('#btn-rules').addEventListener('click', () => this.rulesModal());
    $('#btn-new').addEventListener('click', () => {
      this.closeAllModals();
      this.showSetup(this._startCb);
    });
    $('#dice-btn').addEventListener('click', () => this.game.onRoll());
    // 快捷键：Esc 关闭弹窗；空格/回车 掷骰子
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && this._modals.length) {
        const rec = this._modals[this._modals.length - 1];
        rec.close(rec.onDismiss !== undefined ? rec.onDismiss : null);
        return;
      }
      if ((e.code === 'Space' || e.code === 'Enter') && this._modals.length === 0) {
        const t = e.target;
        if (t && (t.tagName === 'BUTTON' || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
        e.preventDefault();
        this.game.onRoll();
      }
    });
  },

  toggleSound() {
    const on = !this.sound.isEnabled();
    this.sound.setEnabled(on);
    $('#btn-sound').textContent = on ? '🔊' : '🔇';
    if (on) this.sound.click();
  },

  toggleMusic() {
    const on = !this.sound.isMusicEnabled();
    this.sound.setMusicEnabled(on);
    const b = $('#btn-music');
    b.classList.toggle('muted', !on);
    if (on) this.sound.unlock();
  },

  // 镜头模式：跟随 / 自由
  toggleCam() {
    const scene = this.game && this.game.hooks && this.game.hooks.scene;
    if (!scene) return;
    const on = !scene.followMode;
    scene.setFollowMode(on);
    const b = $('#btn-cam');
    b.textContent = on ? '🎥 跟随' : '🎥 自由';
    b.classList.toggle('muted', !on);
    this.toast(on ? '镜头已切换为「跟随」模式' : '镜头已切换为「自由」模式，可随意旋转缩放');
  },

  // ================= 缓存绘制 =================
  avatar(ch) {
    if (!this._cache.avatar[ch.id]) this._cache.avatar[ch.id] = avatarCanvas(ch).toDataURL();
    return this._cache.avatar[ch.id];
  },
  itemIcon(key) {
    if (!this._cache.item[key]) this._cache.item[key] = itemIconCanvas(key).toDataURL();
    return this._cache.item[key];
  },
  deed(tile) {
    if (!this._cache.deed[tile.idx]) this._cache.deed[tile.idx] = deedCanvas(tile).toDataURL();
    return this._cache.deed[tile.idx];
  },
  cardFace(card, kind, color) {
    const key = kind + '|' + card.text;
    if (!this._cache.card[key]) {
      const title = kind === 'chance' ? '机会' : '事件';
      this._cache.card[key] = cardFaceCanvas(kind, title, card.text, color).toDataURL();
    }
    return this._cache.card[key];
  },

  // ================= 开局设置 =================
  showSetup(cb) {
    this._startCb = cb;
    const root = $('#setup');
    root.classList.remove('hidden');
    const cfg = {
      n: 2,
      mode: { type: 'bankrupt' },
      money: 15000,
      slots: [0, 1, 2, 3].map(i => ({ name: CHARS[i].name, charIdx: i, ai: false })),
    };
    root.innerHTML = `
      <div class="setup-card">
        <div class="setup-title">大富翁 3D</div>
        <div class="setup-sub">RICHMAN · 掷骰买地盖房 · 多人同乐</div>
        <div class="player-count">
          玩家人数
          <button id="pc-minus" class="mini-btn">−</button>
          <span id="pc-n" style="min-width:30px;text-align:center">2</span>
          <button id="pc-plus" class="mini-btn">+</button>
        </div>
        <div class="player-slots"></div>
        <div class="setup-money-row">
          <span class="money-label">初始资金</span>
          <div class="money-opts">
            <div class="opt ${cfg.money === 10000 ? 'on' : ''}" data-m="10000">¥1万</div>
            <div class="opt ${cfg.money === 15000 ? 'on' : ''}" data-m="15000">¥1.5万</div>
            <div class="opt ${cfg.money === 20000 ? 'on' : ''}" data-m="20000">¥2万</div>
            <div class="opt ${cfg.money === 30000 ? 'on' : ''}" data-m="30000">¥3万</div>
            <div class="opt ${cfg.money === 50000 ? 'on' : ''}" data-m="50000">¥5万</div>
            <input type="number" class="money-input" id="money-input" value="${cfg.money}" min="500" max="200000" step="500">
          </div>
        </div>
        <div class="setup-foot">
          <div class="mode-select">
            <div class="opt on" data-mode="bankrupt">🏁 破产模式</div>
            <div class="opt" data-mode="turns30">⏱ 30 回合</div>
            <div class="opt" data-mode="turns50">⏱ 50 回合</div>
          </div>
          <button class="start-btn">开始游戏</button>
        </div>
        <div class="dev-credit">开发者：苏州李小木</div>
      </div>`;

    const slotsEl = root.querySelector('.player-slots');
    const render = () => {
      root.querySelector('#pc-n').textContent = cfg.n;
      slotsEl.innerHTML = cfg.slots.map((s, i) => `
        <div class="slot" data-i="${i}" ${i >= cfg.n ? 'style="display:none"' : ''}>
          <div class="slot-idx" style="background:${CHARS[s.charIdx].outfit}">${i + 1}</div>
          <input type="text" value="${esc(s.name)}" maxlength="8" data-name>
          <div class="char-row" data-chars>
            ${CHARS.map((c, ci) => `
              <div class="char-opt ${ci === s.charIdx ? 'sel' : ''}" data-char="${ci}" title="${c.name}">
                <img src="${this.avatar(c)}">
              </div>`).join('')}
          </div>
          <div class="type-toggle" data-type>
            <button class="${s.ai ? '' : 'on'}" data-v="0">🧑 玩家</button>
            <button class="${s.ai ? 'on' : ''}" data-v="1">🤖 电脑</button>
          </div>
        </div>`).join('');

      slotsEl.querySelectorAll('.slot').forEach(slotEl => {
        const i = +slotEl.dataset.i;
        slotEl.querySelector('input').addEventListener('input', e => { cfg.slots[i].name = e.target.value; });
        slotEl.querySelectorAll('[data-char]').forEach(c => {
          c.addEventListener('click', () => {
            cfg.slots[i].charIdx = +c.dataset.char;
            slotEl.querySelector('.slot-idx').style.background = CHARS[cfg.slots[i].charIdx].outfit;
            render();
          });
        });
        slotEl.querySelectorAll('[data-type] button').forEach(b => {
          b.addEventListener('click', () => {
            cfg.slots[i].ai = b.dataset.v === '1';
            render();
          });
        });
      });
    };
    render();

    root.querySelector('#pc-minus').addEventListener('click', () => { cfg.n = Math.max(2, cfg.n - 1); render(); });
    root.querySelector('#pc-plus').addEventListener('click', () => { cfg.n = Math.min(4, cfg.n + 1); render(); });
    // 初始资金设置
    const moneyInput = root.querySelector('#money-input');
    const moneyOpts = root.querySelectorAll('.money-opts .opt');
    moneyOpts.forEach(o => {
      o.addEventListener('click', () => {
        cfg.money = +o.dataset.m;
        moneyOpts.forEach(x => x.classList.toggle('on', x === o));
        moneyInput.value = cfg.money;
      });
    });
    moneyInput.addEventListener('input', () => {
      const v = parseInt(moneyInput.value, 10);
      if (Number.isFinite(v)) cfg.money = v;
      moneyOpts.forEach(x => x.classList.toggle('on', +x.dataset.m === cfg.money));
    });
    moneyInput.addEventListener('change', () => {   // 兼容回车/步进器等提交方式
      const v = parseInt(moneyInput.value, 10);
      if (Number.isFinite(v)) cfg.money = v;
      moneyOpts.forEach(x => x.classList.toggle('on', +x.dataset.m === cfg.money));
    });
    root.querySelectorAll('.mode-select .opt').forEach(o => {
      o.addEventListener('click', () => {
        root.querySelectorAll('.mode-select .opt').forEach(x => x.classList.remove('on'));
        o.classList.add('on');
        const m = o.dataset.mode;
        cfg.mode = m === 'bankrupt' ? { type: 'bankrupt' } : { type: 'turns', turns: m === 'turns30' ? 30 : 50 };
      });
    });
    root.querySelector('.start-btn').addEventListener('click', () => {
      this.sound.unlock();
      this.sound.click();
      this.sound.setMusicEnabled(this.sound.isMusicEnabled()); // 启动背景音乐
      const players = cfg.slots.slice(0, cfg.n).map(s => ({
        name: (s.name || '').trim() || CHARS[s.charIdx].name,
        charIdx: s.charIdx,
        ai: s.ai,
      }));
      if (!players.some(p => !p.ai)) {
        this.toast('至少需要一名真人玩家！');
        return;
      }
      const startMoney = Math.max(500, Math.min(200000, Number.isFinite(cfg.money) ? cfg.money : 15000));
      root.classList.add('hidden');
      cb({ players, mode: cfg.mode, startMoney });
    });
  },

  // ================= HUD =================
  enterGame(players) {
    $('#setup').classList.add('hidden');
    $('#hud').classList.remove('hidden');
    $('#players').innerHTML = players.map((p, i) => `
      <div class="pcard" id="pc-${i}" title="点击查看 ${esc(p.name)} 的地产清单">
        <img class="avatar" src="${this.avatar(CHARS[p.charIdx])}">
        <div class="pinfo">
          <div class="pname">${esc(p.name)} ${p.ai ? '<span class="tag">AI</span>' : ''}</div>
          <div class="pmoney"><img src="${this._billImg}"><span id="pm-${i}">0</span></div>
          <div class="pmeta" id="pmeta-${i}"></div>
        </div>
      </div>`).join('');
    // 点头像查看地产清单
    document.querySelectorAll('#players .pcard').forEach(card => {
      card.addEventListener('click', () => this.openPortfolio(this.game.state, +card.id.replace('pc-', '')));
    });
    $('#log').innerHTML = '';
    this._updateItemsBar(null);
  },

  // ================= 地产清单（点头像弹出） =================
  openPortfolio(st, i) {
    if (!st || !st.players || !st.players[i]) return;
    const p = st.players[i];
    const own = st.tiles.filter(td => td.owner === i);
    const groups = {}, others = [];
    own.forEach(td => {
      const t = TILES[td.idx];
      if (t.group) (groups[t.group] = groups[t.group] || []).push(td);
      else others.push(td);
    });
    // 用弹窗打开时的快照计算资产，避免中途状态变化
    let assets = p.money;
    st.tiles.forEach(td => {
      const t = TILES[td.idx];
      if (td.owner === i) {
        if (t.type === 'prop') assets += t.price + td.houses * (GROUPS[t.group] ? GROUPS[t.group].house : 0);
        else if (t.type === 'rail' || t.type === 'util') assets += t.price;
      }
    });
    const dots = (n) => [1, 2, 3, 4, 5].map(k => `<span class="hd ${k <= n ? 'filled' : ''}"></span>`).join('');
    const groupHtml = Object.keys(groups).map(g => {
      const gd = GROUPS[g];
      const full = st.tiles.filter(x => TILES[x.idx].group === g).every(x => x.owner === i);
      return `
        <div class="build-group">
          <div class="ghead">
            <span class="gswatch" style="background:${gd.color}"></span>
            ${gd.label} 色组
            <span style="font-size:12px;font-weight:700;color:var(--ink-soft)">${full ? '✔ 已集齐（租金翻倍）' : '未集齐'}</span>
          </div>
          ${groups[g].map(td => {
            const t = TILES[td.idx];
            const rentNow = td.houses > 0 ? t.rent[td.houses] : t.rent[0] * (full ? 2 : 1);
            return `
              <div class="build-row">
                <span class="tname">${t.name} <span style="color:var(--ink-soft);font-size:12px">¥${t.price.toLocaleString()}</span></span>
                <span class="house-dots">${dots(td.houses)}${td.houses >= 5 ? '<b style="font-size:12px">酒店</b>' : ''}</span>
                <span style="font-size:12px;font-weight:800;color:#b02418">租金 ¥${rentNow.toLocaleString()}</span>
              </div>`;
          }).join('')}
        </div>`;
    }).join('');
    const otherHtml = others.length ? `
      <div class="build-group">
        <div class="ghead">🚉 车站与公用事业</div>
        ${others.map(td => {
          const t = TILES[td.idx];
          return `<div class="build-row"><span class="tname">${t.name}</span><span style="font-size:12px;font-weight:800;color:var(--ink-soft)">¥${t.price.toLocaleString()}</span></div>`;
        }).join('')}
      </div>` : '';
    this._modal(`
      <div class="modal-title">
        <img src="${this.avatar(CHARS[p.charIdx])}" style="width:44px;height:44px;border-radius:12px;border:2px solid var(--ink);vertical-align:middle;margin-right:8px">
        ${esc(p.name)} 的地产清单${!p.alive ? '（已破产）' : ''}
      </div>
      <p style="text-align:center;font-weight:800;margin-bottom:8px">
        现金 <b style="color:#b45309">¥${p.money.toLocaleString()}</b>
        · 地产 ${own.length} 处
        · 总资产 <b style="color:#b02418">¥${assets.toLocaleString()}</b>
      </p>
      <div class="build-list">
        ${groupHtml || '<p style="text-align:center;font-weight:800;color:var(--ink-soft)">还没有购买任何地产~</p>'}
        ${otherHtml}
      </div>
      <div class="modal-btns"><button class="btn gold js-ok">关闭</button></div>
    `, {
      bind: (mask, close) => mask.querySelector('.js-ok').onclick = () => close(true),
      onDismiss: true,
    });
  },

  updateHUD(st) {
    if (!st) return;
    const cur = st.players[st.current];
    st.players.forEach((p, i) => {
      const card = $('#pc-' + i);
      if (!card) return;
      card.classList.toggle('active', i === st.current && !st.winner);
      card.classList.toggle('out', !p.alive);
      this._setMoney(i, p.money);
      const own = st.tiles.filter(t => t.owner === i);
      const houses = own.reduce((s, t) => s + (TILES[t.idx].type === 'prop' ? t.houses : 0), 0);
      const meta = [`🅿${own.length}`];
      if (houses > 0) meta.push(`🏠${houses}`);
      if (p.jail.in) meta.push('⛓');
      if (p.items.bail > 0) meta.push('🗝' + p.items.bail);
      $('#pmeta-' + i).textContent = meta.join(' · ');
    });

    const chip = $('#turn-chip');
    chip.style.background = cur ? cur.color : '#999';
    // 回合切换时重播横幅动画
    if (this._lastBanner !== st.current + '|' + !!st.winner) {
      this._lastBanner = st.current + '|' + !!st.winner;
      const tb = $('#turn-banner');
      tb.classList.remove('pulse');
      void tb.offsetWidth;
      tb.classList.add('pulse');
    }
    const phaseText = { rolling: '掷骰移动中…', gameover: '对局结束' }[st.phase] || '准备行动';
    $('#turn-text').textContent = st.winner ? `🏆 ${st.winner.name} 获胜！` : `${cur ? cur.name : ''}${cur && cur.ai ? '（电脑）' : ''}`;
    $('#turn-sub').textContent = st.winner ? '' : (cur && cur.jail.in ? '⛓ 在监狱中' : phaseText);

    const diceBtn = $('#dice-btn');
    const canRoll = !st.winner && st.phase === 'turn' && cur && !cur.ai && cur.alive && !cur.jail.in && !st.rolled;
    diceBtn.disabled = !canRoll;
    diceBtn.textContent = !cur ? '🎲 掷骰子' : cur.jail.in ? '⛓ 监狱中…' : cur.ai ? '🤖 电脑回合' : (canRoll ? '🎲 掷骰子' : '⏳ 请稍候…');

    const buildBtn = $('#btn-build');
    buildBtn.disabled = !(!st.winner && st.phase === 'turn' && cur && !cur.ai && cur.alive);
    buildBtn.onclick = () => this.buildPanel(st);

    this._updateItemsBar(st);
  },

  // 资金数字滚动动画 + 变化脉冲
  _setMoney(i, v) {
    const el = $('#pm-' + i);
    if (!el) return;
    const prev = this._moneyShown[i];
    if (prev === undefined) {
      this._moneyShown[i] = v;
      el.textContent = v.toLocaleString();
      return;
    }
    if (prev === v) return;
    const old = this._moneyAnim.get(i);
    if (old) cancelAnimationFrame(old.raf);
    const from = prev, to = v, t0 = performance.now(), dur = 420;
    const rec = { raf: 0 };
    this._moneyAnim.set(i, rec);
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e).toLocaleString();
      if (k < 1) rec.raf = requestAnimationFrame(step);
      else {
        this._moneyAnim.delete(i);
        this._pulseMoney(i);
      }
    };
    rec.raf = requestAnimationFrame(step);
    this._moneyShown[i] = v;
  },
  _pulseMoney(i) {
    const card = $('#pc-' + i);
    if (!card) return;
    card.classList.remove('money-pulse');
    void card.offsetWidth;
    card.classList.add('money-pulse');
    setTimeout(() => card.classList.remove('money-pulse'), 650);
  },

  // 点击棋盘格子：查看格子信息 / 地契
  showTileInfo(idx) {
    const st = this.game.state;
    if (!st) return;
    const t = TILES[idx];
    if (!t) return;
    const td = st.tiles[idx];
    let imgHtml = '', infoHtml = '';
    if (t.type === 'prop' || t.type === 'rail' || t.type === 'util') {
      imgHtml = `<img src="${this.deed(t)}" style="width:220px;border-radius:16px;box-shadow:0 12px 30px rgba(0,0,0,.25)">`;
      if (td.owner >= 0) {
        const o = st.players[td.owner];
        const houseTxt = t.type === 'prop' && td.houses > 0
          ? ` · 🏠 ${td.houses >= 5 ? '酒店' : td.houses + ' 间房'}`
          : '';
        infoHtml = `<p style="font-weight:600;color:var(--ink-soft)">👤 所有人：${esc(o.name)}${houseTxt}</p>`;
      } else {
        infoHtml = `<p style="font-weight:600;color:var(--ink-soft)">🏷 待售 · ¥${t.price.toLocaleString()}</p>`;
      }
    } else {
      const desc = {
        go: '途经 / 到达领取 ¥3,000 工资',
        chance: '抽一张机会卡（5 选 1）',
        event: '抽一张事件卡（5 选 1）',
        tax: `缴纳 ${t.name} ¥${t.amount}`,
        jail: '只是路过，不关你事~',
        parking: '停靠可领 ¥800 慰问金',
        gotojail: '直接送入监狱！',
      }[t.type] || '';
      infoHtml = `<p style="font-weight:600;color:var(--ink-soft)">${desc}</p>`;
    }
    this._modal(`
      <div class="modal-title">${esc(t.name)}</div>
      <div class="deed-wrap">
        ${imgHtml}
        <div class="deed-info" style="display:flex;flex-direction:column;gap:8px;justify-content:center">${infoHtml}</div>
      </div>
      <div class="modal-btns"><button class="btn gold js-ok">关闭</button></div>
    `, {
      bind: (mask, close) => mask.querySelector('.js-ok').onclick = () => close(true),
      onDismiss: true,
    });
  },

  _updateItemsBar(st) {
    const bar = $('#items');
    const cur = st ? st.players[st.current] : null;
    const canUse = st && !st.winner && st.phase === 'turn' && cur && !cur.ai && cur.alive && !cur.jail.in && !st.rolled;
    bar.innerHTML = Object.keys(ITEMS).map(key => {
      const it = ITEMS[key];
      const n = cur ? (cur.items[key] || 0) : 0;
      const active = ['remote', 'boost', 'steal', 'block'].includes(key);
      return `<button class="item-btn" data-key="${key}" title="${it.name}：${it.desc}" ${(n <= 0 || !canUse || !active) ? 'disabled' : ''}>
        <img src="${this.itemIcon(key)}">
        <span class="iname">${it.name}</span>
        <span class="icount">${n}</span>
      </button>`;
    }).join('');
    bar.querySelectorAll('.item-btn').forEach(b => {
      b.addEventListener('click', () => this.game.onUseItem(b.dataset.key));
    });
  },

  log(msg, color) {
    const el = $('#log');
    const d = document.createElement('div');
    d.className = 'lmsg';
    d.innerHTML = `<span style="color:${color || '#b02418'}">●</span> ${esc(msg)}`;
    el.appendChild(d);
    while (el.children.length > 80) el.removeChild(el.firstChild);
    el.scrollTop = el.scrollHeight;
  },

  toast(msg, ms = 2400) {
    const root = $('#toast-root');
    const d = document.createElement('div');
    d.className = 'toast';
    d.textContent = msg;
    root.appendChild(d);
    while (root.children.length > 3) root.removeChild(root.firstChild);
    setTimeout(() => {
      d.classList.add('fade');
      setTimeout(() => d.remove(), 340);
    }, ms);
  },

  // ================= 弹窗基础 =================
  _modal(inner, opts = {}) {
    return new Promise(resolve => {
      const root = $('#modal-root');
      const mask = document.createElement('div');
      mask.className = 'modal-mask';
      mask.innerHTML = `<div class="modal-card">${inner}</div>`;
      root.appendChild(mask);
      const rec = { mask, close: null, onDismiss: opts.onDismiss };
      const close = (v) => {
        const i = this._modals.indexOf(rec);
        if (i >= 0) this._modals.splice(i, 1);
        mask.remove();
        resolve(v);
      };
      rec.close = close;
      this._modals.push(rec);
      if (opts.dismissible !== false) {
        mask.addEventListener('click', e => {
          if (e.target === mask) close(opts.onDismiss !== undefined ? opts.onDismiss : null);
        });
      }
      if (opts.bind) opts.bind(mask, close);
    });
  },

  closeAllModals() {
    const mods = this._modals.slice();
    this._modals = [];
    $('#modal-root').innerHTML = '';
    mods.forEach(m => m.close(null));
  },

  // ================= 各类弹窗 =================
  showCard(card, deck, p) {
    const color = deck === 'chance' ? '#f7941e' : '#2f6fd6';
    const front = this.cardFace(card, deck, color);
    const title = deck === 'chance' ? '抽到「机会卡」！' : '抽到「事件卡」！';
    return this._modal(`
      <div class="modal-title" style="color:${color}">${esc(p.name)} ${title}</div>
      <div class="card-flip">
        <div class="card-flip-inner">
          <img src="${front}" class="card-front">
          <img src="${this._cardBackImg}" class="card-back">
        </div>
      </div>
      <div class="modal-btns"><button class="btn gold js-ok" style="min-width:140px">确定</button></div>
    `, {
      bind: (mask, close) => mask.querySelector('.js-ok').onclick = () => close(true),
      onDismiss: true,
    });
  },

  // 翻牌盲选：5 张背面朝上，玩家点一张翻开（返回选中的下标）
  pickCard(deck, p, pool) {
    const color = deck === 'chance' ? '#f7941e' : '#2f6fd6';
    const sub = deck === 'chance' ? '机会卡' : '事件卡';
    const faces = pool.map(card => this.cardFace(card, deck, color));
    const rot = (i) => (i - (pool.length - 1) / 2) * 6;
    return this._modal(`
      <div class="modal-title" style="color:${color}">✨ ${esc(p.name)}，凭手气翻一张${sub}吧！</div>
      <p style="text-align:center;font-weight:600;color:var(--ink-soft);margin-bottom:20px">5 张牌背面朝上 · 点击卡片翻开</p>
      <div class="card-pick-row">
        ${faces.map((f, i) => `
          <div class="pick-card" data-i="${i}" style="--r:${rot(i)}deg">
            <div class="pick-card-inner">
              <div class="pick-card-side pick-front"><img src="${this._cardBackImg}"></div>
              <div class="pick-card-side pick-back"><img src="${f}"></div>
            </div>
          </div>`).join('')}
      </div>
      <div class="modal-btns">
        <button class="btn gold js-ok" style="display:none">就选这张！</button>
      </div>
    `, {
      dismissible: false,
      onDismiss: -1,
      bind: (mask, close) => {
        let picked = -1;
        const cards = mask.querySelectorAll('.pick-card');
        const okBtn = mask.querySelector('.js-ok');
        cards.forEach((el, i) => {
          el.addEventListener('click', () => {
            if (picked >= 0) {
              // 已揭晓：再点大卡也可确认
              if (i === picked) close(picked);
              return;
            }
            picked = i;
            this.sound && this.sound.card();
            // 计算该卡飞到弹窗中央的位移
            const box = mask.querySelector('.modal-card');
            const br = box.getBoundingClientRect();
            const er = el.getBoundingClientRect();
            const dx = br.left + br.width / 2 - (er.left + er.width / 2);
            const dy = br.top + br.height / 2 - (er.top + er.height / 2) - 24;
            // 翻面 + 放大 + 飞向中央
            el.classList.add('picked');
            el.style.zIndex = '5';
            el.style.transition = 'transform .62s cubic-bezier(.3,1.05,.4,1), opacity .4s';
            el.style.transform = `translate(${dx}px, ${dy}px) scale(1.95)`;
            el.querySelector('.pick-card-inner').style.transform = 'rotateY(180deg)';
            cards.forEach((c2, j) => {
              if (j === i) return;
              c2.style.pointerEvents = 'none';
              c2.classList.add('dim');
            });
            // 放大动画结束后显示确认按钮
            setTimeout(() => { okBtn.style.display = ''; }, 660);
          });
        });
        okBtn.addEventListener('click', () => close(picked));
      },
    });
  },

  askBuy(p, tile, st) {
    const deed = this.deed(tile);
    let rentInfo = '';
    if (tile.type === 'prop') {
      rentInfo = `<p style="font-weight:700;font-size:14px;color:var(--ink-soft)">基础租金 ¥${tile.rent[0]} · 集齐色组翻倍 · 最高 ¥${tile.rent[5].toLocaleString()}</p>`;
    } else if (tile.type === 'rail') {
      rentInfo = `<p style="font-weight:700;font-size:14px;color:var(--ink-soft)">持有 1~4 座车站租金 ¥250 / ¥500 / ¥1,000 / ¥2,000</p>`;
    } else {
      rentInfo = `<p style="font-weight:700;font-size:14px;color:var(--ink-soft)">租金 = 掷骰点数 ×40（两座齐收 ×100）</p>`;
    }
    const ok = p.money >= tile.price;
    return this._modal(`
      <div class="modal-title">${esc(p.name)} 来到「${esc(tile.name)}」</div>
      <div class="deed-wrap">
        <img src="${deed}">
        <div class="deed-info">
          <p style="font-weight:900;font-size:18px">售价：<b style="color:#b02418;font-size:26px">¥${tile.price.toLocaleString()}</b></p>
          <p style="font-weight:700;font-size:14px;color:var(--ink-soft)">你的资金：¥${p.money.toLocaleString()}</p>
          ${tile.landmarkName ? `<p style="font-weight:700;font-size:14px;color:var(--ink-soft)">🏛 地标：${tile.landmarkName}</p>` : ''}
          ${rentInfo}
          <p style="font-weight:700;font-size:14px;color:var(--ink-soft);margin-top:10px">${ok ? '是否购入这块风水宝地？' : '资金不足，无法购买……'}</p>
        </div>
      </div>
      <div class="modal-btns">
        <button class="btn gold js-yes" ${ok ? '' : 'disabled'}>🛒 买下！</button>
        <button class="btn ghost js-no">跳过</button>
      </div>
    `, {
      bind: (mask, close) => {
        mask.querySelector('.js-yes').onclick = () => close(true);
        mask.querySelector('.js-no').onclick = () => close(false);
      },
      onDismiss: false,
    });
  },

  jailMenu(p, st) {
    const canPay = p.money >= 500;
    const hasCard = (p.items.bail || 0) > 0;
    return this._modal(`
      <div class="modal-title">⛓ ${esc(p.name)} 在监狱中（第 ${p.jail.turns} 次）</div>
      <p style="text-align:center;font-weight:700;color:var(--ink-soft)">缴纳保释金、使用出狱卡，或掷出对子即可出狱！</p>
      <div class="modal-btns">
        <button class="btn gold js-pay" ${canPay ? '' : 'disabled'}>💰 缴保释金 ¥500</button>
        <button class="btn green js-card" ${hasCard ? '' : 'disabled'}>🗝 出狱卡 ×${p.items.bail || 0}</button>
        <button class="btn red js-roll">🎲 掷骰子碰运气</button>
      </div>
    `, {
      bind: (mask, close) => {
        mask.querySelector('.js-pay').onclick = () => close('pay');
        mask.querySelector('.js-card').onclick = () => close('card');
        mask.querySelector('.js-roll').onclick = () => close('roll');
      },
      onDismiss: 'roll',
    });
  },

  askUseBail(p) {
    return this._modal(`
      <div class="modal-title">🗝 ${esc(p.name)} 将被逮捕！</div>
      <p style="text-align:center;font-weight:700;color:var(--ink-soft)">是否使用「出狱卡」免去牢狱之灾？（剩余 ${p.items.bail} 张）</p>
      <div class="modal-btns">
        <button class="btn green js-yes">🗝 使用出狱卡</button>
        <button class="btn ghost js-no">进监狱</button>
      </div>
    `, {
      bind: (mask, close) => {
        mask.querySelector('.js-yes').onclick = () => close(true);
        mask.querySelector('.js-no').onclick = () => close(false);
      },
      onDismiss: false,
    });
  },

  chooseRemote(p) {
    return this._modal(`
      <div class="modal-title">🎲 ${esc(p.name)} 使用遥控骰子</div>
      <p style="text-align:center;font-weight:700;color:var(--ink-soft)">选择本次掷出的总点数（2~12）</p>
      <div class="pick-grid">
        ${[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(v => `<button class="pk p-red" data-v="${v}">${v}</button>`).join('')}
      </div>
      <div class="modal-btns"><button class="btn ghost js-cancel">取消</button></div>
    `, {
      bind: (mask, close) => {
        mask.querySelectorAll('[data-v]').forEach(b => b.onclick = () => close(+b.dataset.v));
        mask.querySelector('.js-cancel').onclick = () => close(null);
      },
      onDismiss: null,
    });
  },

  chooseTarget(p, st) {
    const others = st.players.filter(o => o.alive && o.idx !== p.idx && o.money > 0);
    if (others.length === 0) return Promise.resolve(null);
    return this._modal(`
      <div class="modal-title">🦹 ${esc(p.name)} 使用劫富卡</div>
      <p style="text-align:center;font-weight:700;color:var(--ink-soft)">选择要下手的对手（抢走 ¥800）</p>
      <div class="target-row">
        ${others.map(o => `
          <div class="target-card" data-i="${o.idx}">
            <img src="${this.avatar(CHARS[o.charIdx])}">
            <div class="tname">${esc(o.name)}</div>
            <div class="tmoney">¥${o.money.toLocaleString()}</div>
          </div>`).join('')}
      </div>
      <div class="modal-btns"><button class="btn ghost js-cancel">算了</button></div>
    `, {
      bind: (mask, close) => {
        mask.querySelectorAll('.target-card').forEach(b => b.onclick = () => close(+b.dataset.i));
        mask.querySelector('.js-cancel').onclick = () => close(null);
      },
      onDismiss: null,
    });
  },

  chooseDistance(p) {
    return this._modal(`
      <div class="modal-title">🚧 ${esc(p.name)} 放置路障</div>
      <p style="text-align:center;font-weight:700;color:var(--ink-soft)">放在前方第几格？（1~9）</p>
      <div class="pick-grid">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => `<button class="pk" data-v="${v}">${v}</button>`).join('')}
      </div>
      <div class="modal-btns"><button class="btn ghost js-cancel">取消</button></div>
    `, {
      bind: (mask, close) => {
        mask.querySelectorAll('[data-v]').forEach(b => b.onclick = () => close(+b.dataset.v));
        mask.querySelector('.js-cancel').onclick = () => close(null);
      },
      onDismiss: null,
    });
  },

  buildPanel(st) {
    let render = null;
    this._modal(`
      <div class="modal-title">🏠 盖房管理</div>
      <div class="build-list"></div>
      <div class="modal-btns"><button class="btn ghost js-close">关闭</button></div>
    `, {
      dismissible: false,
      bind: (mask, close) => {
        mask.querySelector('.js-close').onclick = () => close(null);
        render = () => {
          const p = st.players[st.current];
          const listEl = mask.querySelector('.build-list');
          const myTiles = st.tiles.filter(t => t.owner === p.idx && TILES[t.idx].type === 'prop');
          if (myTiles.length === 0) {
            listEl.innerHTML = '<p style="text-align:center;font-weight:800;color:var(--ink-soft)">还没有地产，先去买地吧！</p>';
            return;
          }
          const byGroup = {};
          myTiles.forEach(td => {
            const t = TILES[td.idx];
            (byGroup[t.group] = byGroup[t.group] || []).push(td);
          });
          listEl.innerHTML = Object.keys(byGroup).map(g => {
            const gd = GROUPS[g];
            const list = byGroup[g];
            const full = st.tiles.filter(x => TILES[x.idx].group === g).every(x => x.owner === p.idx);
            const minH = Math.min(...list.map(x => x.houses));
            const maxH = Math.max(...list.map(x => x.houses));
            return `
              <div class="build-group">
                <div class="ghead">
                  <span class="gswatch" style="background:${gd.color}"></span>
                  ${gd.label} 色组
                  <span style="font-size:12px;font-weight:700;color:var(--ink-soft)">
                    ${full ? '✔ 已集齐（租金翻倍）' : '未集齐（不能盖房）'} · 盖房 ¥${gd.house.toLocaleString()}/间
                  </span>
                </div>
                ${list.map(td => {
                  const t = TILES[td.idx];
                  const canAdd = full && td.houses < MAX_HOUSES && td.houses <= minH;
                  const canSub = td.houses > 0 && td.houses >= maxH;
                  const dots = [1, 2, 3, 4, 5].map(i => `<span class="hd ${i <= td.houses ? 'filled' : ''}"></span>`).join('');
                  return `
                    <div class="build-row">
                      <span class="tname">${t.name}</span>
                      <span class="house-dots">${dots}${td.houses >= 5 ? '<b style="font-size:12px">酒店</b>' : ''}</span>
                      <span class="build-ops">
                        <button class="mini-btn js-sub" data-t="${td.idx}" ${canSub ? '' : 'disabled'}>−</button>
                        <button class="mini-btn js-add" data-t="${td.idx}" ${canAdd ? '' : 'disabled'}>+</button>
                      </span>
                    </div>`;
                }).join('')}
              </div>`;
          }).join('');
          listEl.querySelectorAll('.js-add').forEach(b => {
            b.onclick = () => this.game.onBuild(+b.dataset.t, 1).then(() => render());
          });
          listEl.querySelectorAll('.js-sub').forEach(b => {
            b.onclick = () => this.game.onBuild(+b.dataset.t, -1).then(() => render());
          });
        };
        render();
      },
    });
  },

  gameOver(winner, rankings, reason) {
    const rk = ['🥇', '🥈', '🥉', '🏅'];
    return this._modal(`
      <div class="win-head">
        <div class="trophy">🏆</div>
        <div class="win-name" style="color:${winner.color}">${esc(winner.name)} 获胜！</div>
        <div style="font-weight:700;color:var(--ink-soft)">${reason === 'turns' ? '回合结束 · 总资产最高' : '击破所有对手 · 地产大亨诞生'}</div>
      </div>
      <div class="rank-list">
        ${rankings.map((p, i) => `
          <div class="rank-row">
            <span class="rk">${rk[i] || (i + 1)}</span>
            <img src="${this.avatar(CHARS[p.charIdx])}">
            <span>${esc(p.name)}${p.ai ? '（电脑）' : ''}${!p.alive ? ' · 💸破产' : ''}</span>
            <span class="rm">¥${this.game.assets(p).toLocaleString()}</span>
          </div>`).join('')}
      </div>
      <div class="modal-btns">
        <button class="btn gold js-again">🎲 再来一局</button>
        <button class="btn ghost js-close">看看棋盘</button>
      </div>
    `, {
      bind: (mask, close) => {
        mask.querySelector('.js-again').onclick = () => { close(null); this.showSetup(this._startCb); };
        mask.querySelector('.js-close').onclick = () => close(null);
      },
    });
  },

  rulesModal() {
    this._modal(`
      <div class="modal-title">📖 游戏规则</div>
      <div class="rules-body">
        <h4>🎯 目标</h4>
        买地、盖房、收租，让其他玩家破产（或回合结束时资产最高）即获胜！
        <h4>🎲 回合</h4>
        轮流掷两颗骰子走格；掷出对子可再掷一次，连续三次对子进监狱；经过/到达起点领取 ¥3,000。
        <h4>🏠 地产</h4>
        每个色组 2 座城市：集齐同色两城后租金翻倍，并可加盖房屋（1~4 间）与酒店；必须均匀加盖；出售房屋返还半价。
        <h4>🚉 车站与公用事业</h4>
        车站按持有数收租（¥250/¥500/¥1,000/¥2,000）；国家电网/三峡水电按本次骰点 ×40（两座 ×100）收租。
        <h4>❓ 机会 / 事件</h4>
        抽卡触发奖励或惩罚；可能移动、缴税、进监狱，或获得道具！
        <h4>🧰 道具</h4>
        遥控骰子（自选点数）、加速卡（+2 步）、免租金牌（自动抵挡一次租金）、出狱卡、路障（拦停对手）、劫富卡（抢 ¥800）。
        <h4>⛓ 监狱</h4>
        缴保释金 ¥500、使用出狱卡，或掷出对子即可出狱。
        <h4>💸 破产</h4>
        现金不足时自动变卖房屋（半价），仍不足则破产出局。
      </div>
      <div class="modal-btns"><button class="btn gold js-ok">知道啦！</button></div>
    `, {
      bind: (mask, close) => mask.querySelector('.js-ok').onclick = () => close(true),
      onDismiss: true,
    });
  },
};
