// 视觉增强系统 - 改善低理智时的视觉体验
import * as THREE from 'three';

export class VisualEnhancer {
  constructor() {
    this.shakeOffset = new THREE.Vector3();
    this.shakeIntensity = 0;
    this.vignetteEl = null;
    this.screenFlashEl = null;
  }
  
  init() {
    this.createVignetteElement();
    this.createScreenFlashElement();
  }
  
  createVignetteElement() {
    this.vignetteEl = document.getElementById('vignette');
    if (!this.vignetteEl) {
      this.vignetteEl = document.createElement('div');
      this.vignetteEl.id = 'vignette';
      this.vignetteEl.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 50;
        background: radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 100%);
        opacity: 0.3;
      `;
      document.body.appendChild(this.vignetteEl);
    }
  }
  
  createScreenFlashElement() {
    this.screenFlashEl = document.getElementById('scare-flash');
    if (!this.screenFlashEl) {
      this.screenFlashEl = document.createElement('div');
      this.screenFlashEl.id = 'scare-flash';
      this.screenFlashEl.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 51;
        background: white;
        opacity: 0;
      `;
      document.body.appendChild(this.screenFlashEl);
    }
  }
  
  update(state, camera, time) {
    if (!state || !camera) return;
    
    const sanity = state.sanity !== undefined ? state.sanity : 100;
    const lowThreshold = state.config?.sanity?.lowThreshold || 50;
    const criticalThreshold = state.config?.sanity?.criticalThreshold || 30;
    
    // 晕影效果
    if (this.vignetteEl) {
      if (state.levelActive) {
        const intensity = Math.max(0, (100 - sanity) / 100 * 0.8);
        this.vignetteEl.style.opacity = intensity;
      } else {
        this.vignetteEl.style.opacity = 0.3;
      }
    }
    
    // 低理智时镜头晃动
    if (sanity < lowThreshold && state.levelActive) {
      const intensity = (lowThreshold - sanity) / lowThreshold * 0.003;
      this.shakeIntensity = intensity;
      
      this.shakeOffset.x = Math.sin(time * 15) * intensity;
      this.shakeOffset.y = Math.cos(time * 12) * intensity * 0.5;
      
      camera.position.add(this.shakeOffset);
    } else {
      this.shakeOffset.set(0, 0, 0);
      this.shakeIntensity = 0;
    }
    
    // 临界理智时的额外效果
    if (sanity < criticalThreshold && state.levelActive) {
      // 随机画面扭曲
      if (Math.random() < 0.02) {
        this.flashScreen(0.05);
      }
    }
  }
  
  flashScreen(duration = 0.3, color = 'white') {
    if (!this.screenFlashEl) return;
    
    this.screenFlashEl.style.background = color;
    this.screenFlashEl.style.opacity = '0.3';
    
    setTimeout(() => {
      this.screenFlashEl.style.opacity = '0';
    }, duration * 1000);
  }
  
  reset(camera) {
    if (camera) {
      camera.position.x -= this.shakeOffset.x;
      camera.position.y -= this.shakeOffset.y;
      camera.position.z -= this.shakeOffset.z;
    }
    this.shakeOffset.set(0, 0, 0);
    this.shakeIntensity = 0;
    
    if (this.vignetteEl) {
      this.vignetteEl.style.opacity = 0.3;
    }
  }
}

export const visualEnhancer = new VisualEnhancer();
export default VisualEnhancer;