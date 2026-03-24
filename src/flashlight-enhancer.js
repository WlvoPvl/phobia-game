// 手电筒系统增强 - 参考Janitor的手电筒机制
import * as THREE from 'three';

export class FlashlightEnhancer {
  constructor(camera, state) {
    this.camera = camera;
    this.state = state;
    this.flashlight = null;
    this.isOn = true;
    this.battery = 100;
    this.drainRate = 1;
    this.rechargeRate = 0.5;
    this.flickerEnabled = false;
    this.flickerTimer = 0;
    this.lowBatteryThreshold = 30;
    this.range = 8;
    this.angle = Math.PI / 6;
  }
  
  init(config = {}) {
    this.drainRate = config.drainRate || 1;
    this.rechargeRate = config.rechargeRate || 0.5;
    this.range = config.range || 8;
    this.angle = config.angle || Math.PI / 6;
    
    if (this.flashlight) {
      this.flashlight.remove();
    }
    
    this.flashlight = new THREE.SpotLight(0xffffee, 2, this.range, this.angle, 0.3, 1);
    this.flashlight.castShadow = true;
    this.flashlight.shadow.mapSize.width = 512;
    this.flashlight.shadow.mapSize.height = 512;
    this.flashlight.position.set(0, 0, 0);
    
    const target = new THREE.Object3D();
    target.position.set(0, 0, -1);
    this.camera.add(target);
    this.flashlight.target = target;
    
    this.camera.add(this.flashlight);
    
    this.createBatteryUI();
    return this.flashlight;
  }
  
  createBatteryUI() {
    const container = document.createElement('div');
    container.id = 'flashlight-ui';
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 100;
      display: flex;
      align-items: center;
      gap: 10px;
    `;
    
    const icon = document.createElement('div');
    icon.textContent = '🔦';
    icon.style.fontSize = '24px';
    
    const barContainer = document.createElement('div');
    barContainer.style.cssText = `
      width: 100px;
      height: 12px;
      background: rgba(0,0,0,0.5);
      border: 1px solid #666;
      border-radius: 6px;
      overflow: hidden;
    `;
    
    this.batteryBar = document.createElement('div');
    this.batteryBar.id = 'battery-bar';
    this.batteryBar.style.cssText = `
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, #4ade80, #22c55e);
      transition: width 0.3s, background 0.3s;
    `;
    
    barContainer.appendChild(this.batteryBar);
    container.appendChild(icon);
    container.appendChild(barContainer);
    document.body.appendChild(container);
  }
  
  update(dt) {
    if (!this.flashlight || !this.state.levelActive) return;
    
    if (this.isOn && this.battery > 0) {
      this.battery -= this.drainRate * dt;
      
      if (this.battery <= this.lowBatteryThreshold && !this.flickerEnabled) {
        this.enableFlicker();
      }
      
      if (this.battery <= 0) {
        this.battery = 0;
        this.turnOff();
      }
    } else if (!this.isOn && this.battery < 100) {
      this.battery += this.rechargeRate * dt;
    }
    
    if (this.flickerEnabled) {
      this.updateFlicker(dt);
    }
    
    this.updateBatteryUI();
  }
  
  enableFlicker() {
    this.flickerEnabled = true;
    this.flickerTimer = 0;
  }
  
  updateFlicker(dt) {
    this.flickerTimer += dt;
    
    const flickerChance = (this.lowBatteryThreshold - this.battery) / this.lowBatteryThreshold * 0.3;
    
    if (Math.random() < flickerChance) {
      this.flashlight.intensity = Math.random() * 0.5;
    } else {
      this.flashlight.intensity = 2;
    }
    
    if (this.battery > this.lowBatteryThreshold + 10) {
      this.flickerEnabled = false;
      this.flashlight.intensity = 2;
    }
  }
  
  updateBatteryUI() {
    if (!this.batteryBar) return;
    
    const percent = Math.max(0, Math.min(100, this.battery));
    this.batteryBar.style.width = percent + '%';
    
    if (percent > 50) {
      this.batteryBar.style.background = 'linear-gradient(90deg, #4ade80, #22c55e)';
    } else if (percent > 20) {
      this.batteryBar.style.background = 'linear-gradient(90deg, #fbbf24, #f59e0b)';
    } else {
      this.batteryBar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
    }
  }
  
  toggle() {
    this.isOn = !this.isOn;
    
    if (this.isOn && this.battery > 0) {
      this.flashlight.intensity = 2;
    } else {
      this.flashlight.intensity = 0;
    }
    
    return this.isOn;
  }
  
  turnOn() {
    if (this.battery > 0) {
      this.isOn = true;
      this.flashlight.intensity = 2;
    }
  }
  
  turnOff() {
    this.isOn = false;
    this.flashlight.intensity = 0;
  }
  
  setIntensity(value) {
    if (this.flashlight) {
      this.flashlight.intensity = value;
    }
  }
  
  setRange(value) {
    this.range = value;
    if (this.flashlight) {
      this.flashlight.distance = value;
    }
  }
  
  getBattery() {
    return this.battery;
  }
  
  isActive() {
    return this.isOn && this.battery > 0;
  }
  
  remove() {
    if (this.flashlight) {
      if (this.flashlight.target && this.camera) {
        this.camera.remove(this.flashlight.target);
      }
      if (this.camera) {
        this.camera.remove(this.flashlight);
      }
      this.flashlight = null;
    }
    
    const ui = document.getElementById('flashlight-ui');
    if (ui) ui.remove();
  }
}

export default FlashlightEnhancer;