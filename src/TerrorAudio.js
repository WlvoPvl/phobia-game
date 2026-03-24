// 恐怖音效增强 - 为直播效果优化的音效系统
// 增强版Jump Scare、更震撼的环境音、诡异低语
import * as THREE from 'three';

export class TerrorAudio {
  constructor(audioManager) {
    this.audioManager = audioManager;
    this.ambientSource = null;
    this.droneOscillators = [];
    this.heartbeatHandle = null;
    this.whisperActive = false;
  }

  // 超级Jump Scare音效 - 直播震撼效果
  playMegaJumpScare() {
    if (!this.audioManager || !this.audioManager.enabled) return;

    const ctx = this.audioManager.context;
    const sfx = this.audioManager.sfxGain;

    // 第一层：尖锐的锯齿波尖叫
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(800, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);
    gain1.gain.setValueAtTime(0.6, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc1.connect(gain1);
    gain1.connect(sfx);
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
    gain2.connect(sfx);
    osc2.start();
    osc2.stop(ctx.currentTime + 0.4);

    // 第三层：白噪声爆炸
    this.playNoise(0.8, 0.7);

    // 第四层：刺耳的高频
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'square';
    osc3.frequency.setValueAtTime(2000, ctx.currentTime);
    osc3.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.2);
    gain3.gain.setValueAtTime(0.3, ctx.currentTime);
    gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc3.connect(gain3);
    gain3.connect(sfx);
    osc3.start();
    osc3.stop(ctx.currentTime + 0.3);
  }

  // 普通Jump Scare
  playJumpScare() {
    if (!this.audioManager || !this.audioManager.enabled) return;

    const ctx = this.audioManager.context;
    const sfx = this.audioManager.sfxGain;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(sfx);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);

    this.playNoise(0.5, 0.4);
  }

  // 诡异的低语
  playWhisper(duration = 3) {
    if (!this.audioManager || !this.audioManager.enabled) return;
    this.whisperActive = true;

    const ctx = this.audioManager.context;
    const sfx = this.audioManager.sfxGain;

    // 多个频率模拟低语
    const frequencies = [250, 300, 350, 400, 500, 600];
    const oscillators = [];

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq + (Math.random() - 0.5) * 50;

      lfo.type = 'sine';
      lfo.frequency.value = 0.5 + Math.random() * 3;
      lfoGain.gain.value = 0.02 + Math.random() * 0.02;

      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      gain.gain.value = 0.015 + Math.random() * 0.01;

      osc.connect(gain);
      gain.connect(sfx);

      osc.start();
      lfo.start();
      oscillators.push({ osc, gain, lfo });
    });

    setTimeout(() => {
      oscillators.forEach(o => {
        o.gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        setTimeout(() => {
          o.osc.stop();
          o.lfo.stop();
        }, 600);
      });
      this.whisperActive = false;
    }, duration * 1000);
  }

  // 深处传来的声音
  playDeepVoice() {
    if (!this.audioManager || !this.audioManager.enabled) return;

    const ctx = this.audioManager.context;
    const sfx = this.audioManager.sfxGain;

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
    gain.connect(sfx);

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
  }

  // 诡异的笑声
  playCreepyLaugh() {
    if (!this.audioManager || !this.audioManager.enabled) return;

    const ctx = this.audioManager.context;
    const sfx = this.audioManager.sfxGain;

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
        gain.connect(sfx);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }, i * 300 + Math.random() * 100);
    }
  }

  // 环境氛围音效 - 根据理智值调整
  playAmbientBasedOnSanity(sanity, levelType) {
    if (!this.audioManager || !this.audioManager.enabled) return;

    // 低理智时增加诡异氛围
    if (sanity < 60) {
      this.playDrone(40 + (60 - sanity) * 0.5, 8, 0.08 + (60 - sanity) * 0.003);
    }

    // 临界理智时的特殊音效
    if (sanity < 30) {
      this.playDeepVoice();
    }
  }

  // 低频轰鸣
  playDrone(baseFreq = 60, duration = 2, volume = 0.15) {
    if (!this.audioManager || !this.audioManager.enabled) return;

    const ctx = this.audioManager.context;
    const sfx = this.audioManager.sfxGain;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.value = baseFreq;
    osc2.type = 'sine';
    osc2.frequency.value = baseFreq * 1.5;

    gain.gain.value = volume;

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(sfx);

    osc1.start();
    osc2.start();

    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    setTimeout(() => {
      osc1.stop();
      osc2.stop();
    }, duration * 1000);
  }

  // 白噪声
  playNoise(duration = 1, volume = 0.1) {
    if (!this.audioManager || !this.audioManager.enabled) return;

    const ctx = this.audioManager.context;
    const sfx = this.audioManager.sfxGain;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(sfx);
    source.start();

    setTimeout(() => {
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      setTimeout(() => source.stop(), 500);
    }, duration * 1000);
  }

  // 强力心跳
  playHeartbeat(rate = 1) {
    if (!this.audioManager || !this.audioManager.enabled) return;

    const ctx = this.audioManager.context;
    const sfx = this.audioManager.sfxGain;

    const playBeat = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = 50 + rate * 10;

      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(sfx);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);

      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.value = 40;
        gain2.gain.setValueAtTime(0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc2.connect(gain2);
        gain2.connect(sfx);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.15);
      }, 150);
    };

    playBeat();
    return { playBeat, rate };
  }

  // 停止所有恐怖音效
  stopAll() {
    if (this.heartbeatHandle) {
      clearInterval(this.heartbeatHandle);
      this.heartbeatHandle = null;
    }
    this.whisperActive = false;
  }
}

// 导出工厂函数
export function createTerrorAudio(audioManager) {
  return new TerrorAudio(audioManager);
}
