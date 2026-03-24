// 直播增强系统 - 专门为直播效果优化
// 增强Jump Scare、声音氛围、随机事件、视觉降级
import * as THREE from 'three';

export class StreamingEnhancer {
  constructor() {
    this.enabled = true;
    this.jumpScareCooldown = 0;
    this.randomEventTimer = 0;
    this.whisperTimer = 0;
    this.heartbeatInterval = null;
    this.whisperActive = false;
    this.screenElements = {};
    this.originalFog = null;
    this.originalAmbient = null;
  }

  init(state) {
    if (this.enabled) {
      this.createScreenElements();
      this.startHeartbeatMonitor(state);
      console.log('[StreamingEnhancer] 直播增强已启用');
    }
  }

  createScreenElements() {
    // 血液边缘效果
    if (!document.getElementById('blood-edge')) {
      const bloodEdge = document.createElement('div');
      bloodEdge.id = 'blood-edge';
      bloodEdge.style.cssText = `
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 46;
        box-shadow: inset 0 0 100px rgba(139, 0, 0, 0);
        transition: box-shadow 0.5s;
      `;
      document.body.appendChild(bloodEdge);
      this.screenElements.bloodEdge = bloodEdge;
    }

    // 画面扭曲层
    if (!document.getElementById('distortion-overlay')) {
      const distortion = document.createElement('div');
      distortion.id = 'distortion-overlay';
      distortion.style.cssText = `
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 47;
        background: transparent;
        transition: all 0.1s;
      `;
      document.body.appendChild(distortion);
      this.screenElements.distortion = distortion;
    }

    // 诡异文字提示
    if (!document.getElementById('terror-text')) {
      const terrorText = document.createElement('div');
      terrorText.id = 'terror-text';
      terrorText.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 48px;
        color: #ff0000;
        text-shadow: 0 0 20px #ff0000;
        pointer-events: none;
        z-index: 100;
        opacity: 0;
        font-family: 'Georgia', serif;
        letter-spacing: 8px;
      `;
      document.body.appendChild(terrorText);
      this.screenElements.terrorText = terrorText;
    }
  }

  startHeartbeatMonitor(state) {
    setInterval(() => {
      if (state.levelActive && state.sanity < 50) {
        const intensity = (50 - state.sanity) / 50;
        this.updateHeartbeatEffects(intensity);
      }
    }, 100);
  }

  updateHeartbeatEffects(intensity) {
    const bloodEdge = this.screenElements.bloodEdge;
    if (bloodEdge) {
      const shadowIntensity = intensity * 80;
      const redIntensity = intensity * 0.4;
      bloodEdge.style.boxShadow = `inset 0 0 ${shadowIntensity}px rgba(139, 0, 0, ${redIntensity})`;
    }
  }

  triggerMegaJumpScare(state, audioManager, type = 'spider') {
    if (this.jumpScareCooldown > 0) return;
    this.jumpScareCooldown = 3;

    console.log('[StreamingEnhancer] MEGA JUMP SCARE!');

    const flash = document.getElementById('scare-flash');
    if (flash) {
      // 更长的闪光
      flash.style.background = '#ff0000';
      flash.style.display = 'block';
      flash.style.opacity = '1';
      
      // 多次闪烁
      let flickers = 0;
      const flicker = setInterval(() => {
        flash.style.opacity = flickers % 2 === 0 ? '0.8' : '0.3';
        flickers++;
        if (flickers > 6) {
          clearInterval(flicker);
          flash.style.opacity = '0';
          setTimeout(() => { flash.style.display = 'none'; }, 100);
        }
      }, 100);
    }

    // 屏幕震动
    if (state.camera) {
      const originalPos = state.camera.position.clone();
      const shakeDuration = 800;
      const shakeIntensity = 0.3;
      let shakeStart = Date.now();
      
      const shake = () => {
        const elapsed = Date.now() - shakeStart;
        if (elapsed < shakeDuration) {
          const decay = 1 - elapsed / shakeDuration;
          state.camera.position.x = originalPos.x + (Math.random() - 0.5) * shakeIntensity * decay;
          state.camera.position.y = originalPos.y + (Math.random() - 0.5) * shakeIntensity * decay;
          state.camera.rotation.z = (Math.random() - 0.5) * 0.1 * decay;
          requestAnimationFrame(shake);
        } else {
          state.camera.position.copy(originalPos);
          state.camera.rotation.z = 0;
        }
      };
      shake();
    }

    // 血液边缘效果
    const bloodEdge = this.screenElements.bloodEdge;
    if (bloodEdge) {
      bloodEdge.style.boxShadow = 'inset 0 0 150px rgba(139, 0, 0, 0.8)';
      setTimeout(() => {
        bloodEdge.style.boxShadow = 'inset 0 0 50px rgba(139, 0, 0, 0.3)';
      }, 1000);
    }

    // 诡异文字闪现
    this.showTerrorText(this.getRandomTerrorText());

    // 播放音效
    if (audioManager) {
      audioManager.playMegaJumpScare();
    }

    // 扣理智
    state.sanity = Math.max(0, state.sanity - 25);
  }

  getRandomTerrorText() {
    const texts = [
      '不要回头...',
      '它们来了',
      '快跑...',
      '逃不掉的',
      '看...在看你...',
      '救命...',
      '好黑...',
      '我听到声音了'
    ];
    return texts[Math.floor(Math.random() * texts.length)];
  }

  showTerrorText(text) {
    const terrorText = this.screenElements.terrorText;
    if (terrorText) {
      terrorText.textContent = text;
      terrorText.style.opacity = '1';
      terrorText.style.transform = 'translate(-50%, -50%) scale(1.2)';
      
      setTimeout(() => {
        terrorText.style.opacity = '0';
        terrorText.style.transform = 'translate(-50%, -50%) scale(1)';
      }, 800);
    }
  }

  update(state, audioManager, dt) {
    if (!this.enabled || !state.levelActive) return;

    // Jump Scare冷却
    if (this.jumpScareCooldown > 0) {
      this.jumpScareCooldown -= dt;
    }

    const sanity = state.sanity;
    const time = state.clock ? state.clock.getElapsedTime() : 0;

    // 低理智时的随机诡异效果
    if (sanity < 60) {
      this.randomEventTimer += dt;
      
      // 每3-8秒触发一次随机事件
      const eventInterval = 3 + Math.random() * 5;
      if (this.randomEventTimer > eventInterval) {
        this.randomEventTimer = 0;
        this.triggerRandomTerrorEvent(state, audioManager);
      }
    }

    // 低理智时的低语效果
    if (sanity < 40 && !this.whisperActive) {
      this.whisperTimer += dt;
      if (this.whisperTimer > 10 + Math.random() * 10) {
        this.whisperTimer = 0;
        this.playWhisper(audioManager);
      }
    }

    // 临界理智时的画面扭曲
    if (sanity < 25) {
      this.applyDistortionEffect();
    }

    // 更新血液边缘
    if (sanity < 50) {
      this.updateHeartbeatEffects((50 - sanity) / 50);
    }
  }

  triggerRandomTerrorEvent(state, audioManager) {
    const events = [
      () => this.showTerrorText(this.getRandomTerrorText()),
      () => this.flickerLights(state, 500),
      () => this.playCreepySound(audioManager),
      () => this.triggerMegaJumpScare(state, audioManager, 'random')
    ];
    
    const event = events[Math.floor(Math.random() * events.length)];
    event();
  }

  flickerLights(state, duration = 500) {
    if (!state.levelLights || state.levelLights.length === 0) return;
    
    const startTime = Date.now();
    const originalIntensities = state.levelLights.map(l => l.intensity);
    
    const flicker = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        state.levelLights.forEach(light => {
          light.intensity = Math.random() < 0.5 ? 0 : light.intensity * 0.3;
        });
        setTimeout(flicker, 50);
      } else {
        state.levelLights.forEach((light, i) => {
          light.intensity = originalIntensities[i];
        });
      }
    };
    flicker();
  }

  playCreepySound(audioManager) {
    if (!audioManager) return;
    const sounds = [
      () => audioManager.playWhisper(3),
      () => audioManager.playDeepVoice(),
      () => audioManager.playCreepyLaugh()
    ];
    const sound = sounds[Math.floor(Math.random() * sounds.length)];
    sound();
  }

  playWhisper(audioManager) {
    this.whisperActive = true;
    if (audioManager) {
      audioManager.playWhisper(4);
    }
    setTimeout(() => { this.whisperActive = false; }, 5000);
  }

  applyDistortionEffect() {
    const distortion = this.screenElements.distortion;
    if (distortion && Math.random() < 0.05) {
      distortion.style.background = `rgba(139, 0, 0, ${Math.random() * 0.1})`;
      distortion.style.transform = `translate(${(Math.random() - 0.5) * 5}px, ${(Math.random() - 0.5) * 5}px)`;
      
      setTimeout(() => {
        distortion.style.background = 'transparent';
        distortion.style.transform = 'translate(0, 0)';
      }, 100);
    }
  }

  // 用于关卡中的Jump Scare检测
  checkJumpScareTrigger(state, distance, minDist = 2, cooldown = 5) {
    if (distance < minDist && this.jumpScareCooldown <= 0) {
      return true;
    }
    return false;
  }

  cleanup() {
    Object.values(this.screenElements).forEach(el => {
      if (el && el.remove) el.remove();
    });
    this.screenElements = {};
  }
}

export const streamingEnhancer = new StreamingEnhancer();
export default StreamingEnhancer;
