// 增强版Jump Scare系统 - 各关卡专用
// 参考Content Warning等游戏的震撼效果
import * as THREE from 'three';

export class JumpScareSystem {
  constructor() {
    this.cooldowns = {};
    this.activeScares = [];
    this.screenElements = {};
  }

  init() {
    this.createScreenElements();
  }

  createScreenElements() {
    // 主闪光层
    if (!document.getElementById('scare-flash')) {
      const flash = document.createElement('div');
      flash.id = 'scare-flash';
      flash.style.cssText = `
        position: fixed;
        inset: 0;
        background: #fff;
        opacity: 0;
        pointer-events: none;
        z-index: 85;
      `;
      document.body.appendChild(flash);
      this.screenElements.flash = flash;
    }

    // 黑色快速闪过
    if (!document.getElementById('scare-black')) {
      const black = document.createElement('div');
      black.id = 'scare-black';
      black.style.cssText = `
        position: fixed;
        inset: 0;
        background: #000;
        opacity: 0;
        pointer-events: none;
        z-index: 84;
      `;
      document.body.appendChild(black);
      this.screenElements.black = black;
    }
  }

  // 通用Jump Scare
  triggerJumpScare(state, audioManager, options = {}) {
    const {
      type = 'default',
      sanityDamage = 15,
      duration = 0.5,
      intensity = 1
    } = options;

    // 检查冷却
    const cooldown = this.cooldowns[type] || 0;
    if (Date.now() < cooldown) return;
    this.cooldowns[type] = Date.now() + 3000;

    console.log(`[JumpScare] 触发 ${type}!`);

    // 扣理智
    state.sanity = Math.max(0, state.sanity - sanityDamage);

    // 播放音效
    if (audioManager && audioManager.playMegaJumpScare) {
      audioManager.playMegaJumpScare();
    } else if (audioManager) {
      audioManager.playJumpScare();
    }

    // 屏幕效果
    this.playScreenEffects(intensity, duration);

    // 相机震动
    this.shakeCamera(state.camera, duration * 1000, intensity * 0.2);

    // 血液边缘
    this.showBloodEdge(intensity);

    return true;
  }

  // 屏幕闪烁效果
  playScreenEffects(intensity, duration) {
    const flash = this.screenElements.flash;
    const black = this.screenElements.black;

    // 快速闪烁白-黑
    let count = 0;
    const maxCount = Math.floor(3 * intensity);
    
    const flicker = () => {
      if (count >= maxCount) {
        flash.style.opacity = '0';
        black.style.opacity = '0';
        return;
      }

      if (count % 2 === 0) {
        flash.style.background = '#ff0000';
        flash.style.opacity = String(0.7 * intensity);
        black.style.opacity = '0';
      } else {
        black.style.opacity = String(0.8 * intensity);
        flash.style.opacity = '0';
      }

      count++;
      setTimeout(flicker, 60 + Math.random() * 40);
    };

    flicker();
  }

  // 相机震动
  shakeCamera(camera, duration, intensity) {
    if (!camera) return;

    const originalPos = camera.position.clone();
    const startTime = Date.now();

    const shake = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        const decay = 1 - elapsed / duration;
        camera.position.x = originalPos.x + (Math.random() - 0.5) * intensity * decay;
        camera.position.y = originalPos.y + (Math.random() - 0.5) * intensity * 0.5 * decay;
        requestAnimationFrame(shake);
      } else {
        camera.position.copy(originalPos);
      }
    };

    shake();
  }

  // 血液边缘效果
  showBloodEdge(intensity) {
    let bloodEdge = document.getElementById('blood-edge');
    if (!bloodEdge) {
      bloodEdge = document.createElement('div');
      bloodEdge.id = 'blood-edge';
      bloodEdge.style.cssText = `
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 46;
        box-shadow: inset 0 0 0 rgba(139, 0, 0, 0);
        transition: box-shadow 0.3s;
      `;
      document.body.appendChild(bloodEdge);
    }

    bloodEdge.style.boxShadow = `inset 0 0 ${60 * intensity}px rgba(139, 0, 0, ${0.4 * intensity})`;
    
    setTimeout(() => {
      bloodEdge.style.boxShadow = 'inset 0 0 30px rgba(139, 0, 0, 0.15)';
    }, 500);
  }

  // 第一关 - 蜘蛛跳脸
  triggerSpiderScare(state, audioManager) {
    this.triggerJumpScare(state, audioManager, {
      type: 'spider',
      sanityDamage: 20,
      intensity: 1.2
    });
  }

  // 第三关 - 幽闭突然变窄
  triggerClaustrophobiaScare(state, audioManager) {
    // 不扣理智，只是视觉冲击
    const black = this.screenElements.black;
    if (black) {
      black.style.opacity = '0.7';
      setTimeout(() => {
        black.style.opacity = '0';
      }, 200);
    }
    
    this.shakeCamera(state.camera, 300, 0.1);
  }

  // 第四关 - 黑暗中的影子
  triggerShadowScare(state, audioManager) {
    this.triggerJumpScare(state, audioManager, {
      type: 'shadow',
      sanityDamage: 15,
      intensity: 0.8
    });
  }

  // 第五关 - 太空突然坠落
  triggerSpaceScare(state, audioManager) {
    this.triggerJumpScare(state, audioManager, {
      type: 'space',
      sanityDamage: 10,
      intensity: 1.0
    });
  }

  // 第六关 - 小丑突然靠近
  triggerClownScare(state, audioManager) {
    this.triggerJumpScare(state, audioManager, {
      type: 'clown',
      sanityDamage: 18,
      intensity: 1.3
    });
  }

  // 第七关 - 猪突然冲撞
  triggerPigScare(state, audioManager) {
    this.triggerJumpScare(state, audioManager, {
      type: 'pig',
      sanityDamage: 15,
      intensity: 1.1
    });
  }

  // 第八关 - 螃蟹跳起
  triggerCrabScare(state, audioManager) {
    this.triggerJumpScare(state, audioManager, {
      type: 'crab',
      sanityDamage: 12,
      intensity: 0.9
    });
  }

  // 第九关 - 西瓜爆炸
  triggerWatermelonScare(state, audioManager) {
    this.triggerJumpScare(state, audioManager, {
      type: 'watermelon',
      sanityDamage: 10,
      intensity: 0.8
    });

    // 额外的种子飞溅效果
    const flash = this.screenElements.flash;
    if (flash) {
      flash.style.background = '#ff4444';
      flash.style.opacity = '0.4';
      setTimeout(() => { flash.style.opacity = '0'; }, 300);
    }
  }
}

export const jumpScareSystem = new JumpScareSystem();
export default JumpScareSystem;
