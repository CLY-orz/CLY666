// ============ 音效：WebAudio 合成（无外部素材） ============
let ctx = null;
let master = null;
let enabled = true;
// ---- 背景音乐状态 ----
let musicOn = true;
let musicTimer = null;
let musicGain = null;
let musicStarted = false;

function ac() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export const sound = {
  unlock() { ac(); },
  setEnabled(v) { enabled = v; },
  isEnabled() { return enabled; },

  // ================= 背景音乐（原创 8-bit 芯片风循环，致敬经典平台跳跃游戏的欢快氛围） =================
  isMusicEnabled() { return musicOn; },
  setMusicEnabled(v) {
    musicOn = v;
    if (v) this.startMusic();
    else this.stopMusic();
  },
  startMusic() {
    const c = ac();
    if (!c || !musicOn || musicStarted) return;
    musicStarted = true;
    musicGain = c.createGain();
    musicGain.gain.setValueAtTime(0.0001, c.currentTime);
    musicGain.gain.linearRampToValueAtTime(0.24, c.currentTime + 1.2);
    musicGain.connect(master);

    const BPM = 150;
    const step = 60 / BPM / 2;                       // 8 分音符
    const M = (n) => 440 * Math.pow(2, (n - 69) / 12);
    // 原创欢快旋律：32 个 8 分音符 = 4 小节（C 大调，跳跃感音程）
    const melody = [
      76, null, 79, null, 81, 79, 76, null,
      74, null, 77, null, 79, 77, 74, null,
      72, 76, 79, 81, 83, 79, 76, 74,
      72, null, 67, null, 60, null, 64, null,
    ];
    const bass = [60, 62, 65, 67];                   // 每小节根音 C D F G

    const pluck = (type, freq, t, dur, vol) => {
      const o = c.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(musicGain);
      o.start(t); o.stop(t + dur + 0.05);
    };
    const kick = (t) => {
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(130, t);
      o.frequency.exponentialRampToValueAtTime(48, t + 0.11);
      const g = c.createGain();
      g.gain.setValueAtTime(0.4, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
      o.connect(g); g.connect(musicGain);
      o.start(t); o.stop(t + 0.15);
    };
    const snare = (t) => {
      const len = Math.floor(c.sampleRate * 0.09);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource(); src.buffer = buf;
      const f = c.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.value = 1900; f.Q.value = 0.9;
      const g = c.createGain();
      g.gain.setValueAtTime(0.24, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      src.connect(f); f.connect(g); g.connect(musicGain);
      src.start(t);
    };
    const hat = (t, vol) => {
      const len = Math.floor(c.sampleRate * 0.03);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource(); src.buffer = buf;
      const f = c.createBiquadFilter();
      f.type = 'highpass'; f.frequency.value = 7500;
      const g = c.createGain();
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
      src.connect(f); f.connect(g); g.connect(musicGain);
      src.start(t);
    };

    let stepIdx = 0;
    let next = c.currentTime + 0.15;
    const sched = (from, to) => {
      while (from < to) {
        const si = stepIdx % 32;
        const t = from;
        const n = melody[si];
        if (n != null) pluck('square', M(n), t, step * 0.88, 0.13);
        if (si % 4 === 0) pluck('triangle', M(bass[(si / 4) % 4] - 12), t, step * 3.4, 0.22);
        if (si % 8 === 0) kick(t);
        if (si % 8 === 4) snare(t);
        hat(t, si % 2 === 0 ? 0.05 : 0.028);
        stepIdx++;
        from += step;
      }
    };
    musicTimer = setInterval(() => {
      if (!musicOn || !ctx) {
        clearInterval(musicTimer);
        musicTimer = null;
        musicStarted = false;
        return;
      }
      const ahead = c.currentTime + 0.4;
      if (next < ahead) {
        sched(next, ahead);
        next = Math.max(next, ahead);
      }
    }, 130);
  },
  stopMusic() {
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
    if (musicGain && ctx) {
      const t = ctx.currentTime;
      musicGain.gain.cancelScheduledValues(t);
      musicGain.gain.setValueAtTime(Math.max(0.0001, musicGain.gain.value), t);
      musicGain.gain.linearRampToValueAtTime(0.0001, t + 0.8);
      const g = musicGain;
      setTimeout(() => { try { g.disconnect(); } catch (e) {} }, 1000);
    }
    musicGain = null;
    musicStarted = false;
  },

  tone(freq, dur, type = 'square', vol = 0.5, delay = 0, slide = 0) {
    const c = ac();
    if (!c || !enabled) return;
    const t0 = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur + 0.05);
  },

  noise(dur, vol = 0.3, delay = 0, freq = 1800) {
    const c = ac();
    if (!c || !enabled) return;
    const t0 = c.currentTime + delay;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 0.8;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t0);
  },

  click()   { this.tone(660, 0.06, 'square', 0.25); },
  dice()    { for (let i = 0; i < 5; i++) this.noise(0.06, 0.28, i * 0.08, 1600 + Math.random() * 1200); },
  step()    { this.tone(300, 0.05, 'triangle', 0.2); },
  coin()    { this.tone(920, 0.09, 'square', 0.35); this.tone(1380, 0.14, 'square', 0.3, 0.07); },
  card()    { this.noise(0.22, 0.3, 0, 2400); this.tone(520, 0.12, 'triangle', 0.25, 0.1, 260); },
  buy()     { this.tone(660, 0.08, 'square', 0.3); this.tone(880, 0.08, 'square', 0.3, 0.09); this.tone(1180, 0.16, 'square', 0.32, 0.18); },
  pay()     { this.tone(500, 0.12, 'sawtooth', 0.22); this.tone(340, 0.18, 'sawtooth', 0.22, 0.11); },
  rent()    { this.pay(); },
  jail()    { this.tone(220, 0.3, 'sawtooth', 0.3, 0, -80); this.tone(180, 0.35, 'sawtooth', 0.25, 0.15, -40); },
  fanfare() {
    const seq = [523, 659, 784, 1047, 784, 1047];
    seq.forEach((f, i) => this.tone(f, 0.16, 'square', 0.3, i * 0.13));
    this.tone(1319, 0.5, 'square', 0.3, seq.length * 0.13);
  },
  lose()    { this.tone(392, 0.25, 'sawtooth', 0.25); this.tone(311, 0.3, 'sawtooth', 0.25, 0.2); this.tone(233, 0.5, 'sawtooth', 0.25, 0.45); },
};
