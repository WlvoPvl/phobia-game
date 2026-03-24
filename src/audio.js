// 音效管理系统
// 使用 Web Audio API 生成程序化音效，无需外部文件

export class AudioManager {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.initialized = false;
    this.enabled = true;
    this.volume = {
      master: 0.7,
      sfx: 0.8,
      music: 0.5
    };
  }

  async init() {
    if (this.initialized) return;

    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();

      // 主音量控制
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.volume.master;
      this.masterGain.connect(this.context.destination);

      // SFX 通道
      this.sfxGain = this.context.createGain();
      this.sfxGain.gain.value = this.volume.sfx;
      this.sfxGain.connect(this.masterGain);

      // 音乐通道
      this.musicGain = this.context.createGain();
      this.musicGain.gain.value = this.volume.music;
      this.musicGain.connect(this.masterGain);

      this.initialized = true;
    } catch (e) {
      this.enabled = false;
    }
  }

  // 确保音频上下文已启动（用户交互后调用）
  async resume() {
    if (this.context && this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  setMasterVolume(value) {
    this.volume.master = value;
    if (this.masterGain) this.masterGain.gain.value = value;
  }

  setSfxVolume(value) {
    this.volume.sfx = value;
    if (this.sfxGain) this.sfxGain.gain.value = value;
  }

  setMusicVolume(value) {
    this.volume.music = value;
    if (this.musicGain) this.musicGain.gain.value = value;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.masterGain) {
      this.masterGain.gain.value = this.enabled ? this.volume.master : 0;
    }
    return this.enabled;
  }

  // 播放白噪声（用于风吹、暗室环境）
  playNoise(duration = 1, volume = 0.1, type = 'white') {
    if (!this.enabled || !this.sfxGain) return;

    const bufferSize = this.context.sampleRate * duration;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = this.context.createGain();
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(this.sfxGain);
    source.start();

    setTimeout(() => {
      gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.5);
      setTimeout(() => source.stop(), 500);
    }, duration * 1000);

    return { source, gain };
  }

  // 播放低频轰鸣（恐怖氛围）
  playDrone(baseFreq = 60, duration = 2, volume = 0.15) {
    if (!this.enabled || !this.sfxGain) return;

    const osc1 = this.context.createOscillator();
    const osc2 = this.context.createOscillator();
    const gain = this.context.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.value = baseFreq;
    osc2.type = 'sine';
    osc2.frequency.value = baseFreq * 1.5;

    gain.gain.value = volume;

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start();
    osc2.start();

    const fadeOut = () => {
      gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 1);
      setTimeout(() => {
        osc1.stop();
        osc2.stop();
      }, 1000);
    };

    setTimeout(fadeOut, duration * 1000);

    return { osc1, osc2, gain };
  }

  // 播放超级惊吓音效 - 直播震撼版
  playMegaJumpScare() {
    if (!this.enabled || !this.sfxGain) return;

    const ctx = this.context;

    // 第一层：尖锐尖叫
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(800, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);
    gain1.gain.setValueAtTime(0.6, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.5);

    // 第二层：低频冲击
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(80, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.3);
    gain2.gain.setValueAtTime(0.8, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start();
    osc2.stop(ctx.currentTime + 0.4);

    // 第三层：白噪声
    this.playNoise(0.8, 0.7);

    // 第四层：高频刺耳
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'square';
    osc3.frequency.setValueAtTime(2000, ctx.currentTime);
    osc3.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.2);
    gain3.gain.setValueAtTime(0.3, ctx.currentTime);
    gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc3.connect(gain3);
    gain3.connect(this.sfxGain);
    osc3.start();
    osc3.stop(ctx.currentTime + 0.3);
  }

  // 播放突然惊吓音效 (原版)
  playJumpScare(type = 'default') {
    if (!this.enabled || !this.sfxGain) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.context.currentTime + 0.3);

    gain.gain.setValueAtTime(0.5, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.context.currentTime + 0.3);

    // 添加噪音爆炸
    this.playNoise(0.5, 0.3);
  }

  // 播放理智下降音效（低频脉冲）
  playSanityDrop(intensity = 1) {
    if (!this.enabled || !this.sfxGain) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'triangle';
    osc.frequency.value = 100 + intensity * 50;

    gain.gain.setValueAtTime(0.2 * intensity, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.context.currentTime + 0.2);
  }

  // 播放收集/成功音效
  playCollect() {
    if (!this.enabled || !this.sfxGain) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.context.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.context.currentTime + 0.3);
  }

  // 播放脚步声
  playFootstep() {
    if (!this.enabled || !this.sfxGain) return;

    const noise = this.context.createBufferSource();
    const bufferSize = this.context.sampleRate * 0.1;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    noise.buffer = buffer;

    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;

    const gain = this.context.createGain();
    gain.gain.value = 0.2;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start();
  }

  // 播放西瓜压碎音效
  playWatermelonCrush(volume = 0.3) {
    if (!this.enabled || !this.sfxGain) return;

    const duration = 0.15;
    const bufferSize = this.context.sampleRate * duration;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const source = this.context.createBufferSource();
    source.buffer = buffer;

    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    const gain = this.context.createGain();
    gain.gain.value = volume;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    source.start();
  }

  // 播放门吱呀声
  playCreakyDoor() {
    if (!this.enabled || !this.sfxGain) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.context.currentTime);
    osc.frequency.linearRampToValueAtTime(150, this.context.currentTime + 0.3);
    osc.frequency.linearRampToValueAtTime(80, this.context.currentTime + 0.6);

    gain.gain.setValueAtTime(0.15, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.context.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.context.currentTime + 0.8);
  }

  // 播放心跳声
  playHeartbeat(rate = 1) {
    if (!this.enabled || !this.sfxGain) return;

    const playBeat = () => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();

      osc.type = 'sine';
      osc.frequency.value = 60;

      gain.gain.setValueAtTime(0.3, this.context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.context.currentTime + 0.15);
    };

    playBeat();
    setTimeout(playBeat, 1000 / rate);

    return { playBeat, rate };
  }

  // 播放静态无线电声
  playStatic(duration = 1, volume = 0.2) {
    if (!this.enabled || !this.sfxGain) return;

    return this.playNoise(duration, volume);
  }

  // 播放低语声（使用多个振荡器模拟）
  playWhisper(duration = 2) {
    if (!this.enabled || !this.sfxGain) return;

    const oscillators = [];
    const frequencies = [250, 300, 350, 400, 500, 600];

    frequencies.forEach((freq, i) => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq + (Math.random() - 0.5) * 50;

      // 随机音量调制
      const lfo = this.context.createOscillator();
      const lfoGain = this.context.createGain();
      lfo.frequency.value = 0.5 + Math.random() * 3;
      lfoGain.gain.value = 0.015;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();

      gain.gain.value = 0.02;

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      oscillators.push({ osc, gain, lfo });
    });

    // 淡出
    setTimeout(() => {
      oscillators.forEach(o => {
        o.gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.5);
        setTimeout(() => {
          o.osc.stop();
          o.lfo.stop();
        }, 500);
      });
    }, duration * 1000);

    return oscillators;
  }

  // 深处传来的诡异声音
  playDeepVoice() {
    if (!this.enabled || !this.sfxGain) return;

    const ctx = this.context;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 80 + Math.random() * 40;

    lfo.type = 'sine';
    lfo.frequency.value = 0.3;
    lfoGain.gain.value = 30;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    gain.gain.value = 0;

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    lfo.start();

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 2);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4);

    setTimeout(() => {
      osc.stop();
      lfo.stop();
    }, 4500);

    return { osc, lfo, gain };
  }

  // 诡异的笑声
  playCreepyLaugh() {
    if (!this.enabled || !this.sfxGain) return;

    const ctx = this.context;

    // 多次短促的笑声
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150 + Math.random() * 100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }, i * 300 + Math.random() * 100);
    }
  }

  // 强力心跳
  playHeartbeatStrong(rate = 2) {
    if (!this.enabled || !this.sfxGain) return;

    const ctx = this.context;

    const playBeat = () => {
      // 第一拍
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 50 + rate * 10;
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);

      // 第二拍（稍弱）
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.value = 40;
        gain2.gain.setValueAtTime(0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc2.connect(gain2);
        gain2.connect(this.sfxGain);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.15);
      }, 150);
    };

    playBeat();
    return { playBeat, rate };
  }

  // 播放平台生成音效（上升音）
  playLevelStart() {
    if (!this.enabled || !this.sfxGain) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.context.currentTime + 0.5);

    gain.gain.setValueAtTime(0.2, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.context.currentTime + 0.5);
  }

  // 播放胜利音效
  playVictory() {
    if (!this.enabled || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = 'triangle';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.2, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start();
        osc.stop(this.context.currentTime + 0.3);
      }, i * 150);
    });
  }

  // 播放失败音效
  playFailure() {
    if (!this.enabled || !this.sfxGain) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.context.currentTime + 1);

    gain.gain.setValueAtTime(0.2, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.context.currentTime + 1);
  }

  // 播放环境音景（根据关卡类型）
  playAmbient(type) {
    if (!this.enabled || !this.musicGain) return;

    const ambientSounds = {
      office: () => this.playNoise(10, 0.02),
      arachnophobia: () => this.playDrone(40, 5, 0.1),
      acrophobia: () => this.playNoise(8, 0.01),
      claustrophobia: () => this.playDrone(30, 10, 0.08),
      nyctophobia: () => this.playStatic(5, 0.05),
      spacePhobia: () => this.playDrone(20, 15, 0.05),
      clownPhobia: () => this.playStatic(3, 0.03),
      pigPhobia: () => this.playNoise(6, 0.04)
    };

    return ambientSounds[type] ? ambientSounds[type]() : null;
  }

  stopAll() {
    if (this.context) {
      this.context.close();
      this.initialized = false;
    }
  }
}

// 全局音频管理器实例
export const audioManager = new AudioManager();
