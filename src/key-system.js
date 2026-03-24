// 钥匙与收集系统 - 参考Janitor和Phantomicus的收集机制
import * as THREE from 'three';

export class KeySystem {
  constructor(state) {
    this.state = state;
    this.keys = [];
    this.requiredKeys = 0;
    this.collectedKeys = 0;
  }
  
  init(requiredCount = 1) {
    this.requiredKeys = requiredCount;
    this.collectedKeys = 0;
    this.keys = [];
  }
  
  addKey(position, keyType = 'normal', color = 0xffd700) {
    const keyGroup = new THREE.Group();
    
    const keyHead = new THREE.Mesh(
      new THREE.TorusGeometry(0.1, 0.03, 8, 16),
      new THREE.MeshStandardMaterial({ 
        color, 
        metalness: 0.8, 
        roughness: 0.2,
        emissive: color,
        emissiveIntensity: 0.3
      })
    );
    keyGroup.add(keyHead);
    
    const keyShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8),
      new THREE.MeshStandardMaterial({ 
        color, 
        metalness: 0.8, 
        roughness: 0.2 
      })
    );
    keyShaft.position.y = -0.2;
    keyGroup.add(keyShaft);
    
    const keyTeeth = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.1, 0.02),
      new THREE.MeshStandardMaterial({ 
        color, 
        metalness: 0.8, 
        roughness: 0.2 
      })
    );
    keyTeeth.position.set(0.04, -0.3, 0);
    keyGroup.add(keyTeeth);
    
    keyGroup.position.copy(position);
    keyGroup.rotation.x = Math.PI / 2;
    keyGroup.userData = { 
      isKey: true, 
      keyType,
      collected: false,
      bobOffset: Math.random() * Math.PI * 2
    };
    
    this.keys.push(keyGroup);
    return keyGroup;
  }
  
  update(dt, time, playerPosition) {
    this.keys.forEach(key => {
      if (key.userData.collected) return;
      
      key.rotation.y += dt * 2;
      key.position.y += Math.sin(time * 2 + key.userData.bobOffset) * 0.002;
      
      const distance = key.position.distanceTo(playerPosition);
      if (distance < 1.2) {
        this.collectKey(key);
      }
    });
  }
  
  collectKey(key) {
    key.userData.collected = true;
    this.collectedKeys++;
    
    this.state.audioManager?.playCollect?.();
    
    this.createCollectEffect(key.position.clone());
    
    if (key.parent) {
      key.parent.remove(key);
    }
    
    const index = this.keys.indexOf(key);
    if (index > -1) this.keys.splice(index, 1);
    
    this.updateUI();
    
    return this.collectedKeys >= this.requiredKeys;
  }
  
  createCollectEffect(position) {
    if (!this.state.effectsSystem) return;
    
    this.state.effectsSystem.createParticleExplosion(
      position,
      0xffd700,
      20,
      3,
      0.5
    );
  }
  
  updateUI() {
    const keyCountEl = document.getElementById('key-count');
    if (keyCountEl) {
      keyCountEl.textContent = `${this.collectedKeys}/${this.requiredKeys}`;
    } else {
      this.createKeyUI();
    }
  }
  
  createKeyUI() {
    const keyDisplay = document.createElement('div');
    keyDisplay.id = 'key-count';
    keyDisplay.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: rgba(0,0,0,0.7);
      border: 2px solid #ffd700;
      border-radius: 8px;
      padding: 10px 16px;
      color: #ffd700;
      font-family: monospace;
      font-size: 18px;
      z-index: 100;
    `;
    keyDisplay.textContent = `${this.collectedKeys}/${this.requiredKeys}`;
    document.body.appendChild(keyDisplay);
  }
  
  removeUI() {
    const el = document.getElementById('key-count');
    if (el) el.remove();
  }
  
  hasRequiredKeys() {
    return this.collectedKeys >= this.requiredKeys;
  }
  
  getCollectedCount() {
    return this.collectedKeys;
  }
  
  reset() {
    this.keys.forEach(key => {
      if (key.parent) key.parent.remove(key);
    });
    this.keys = [];
    this.collectedKeys = 0;
    this.removeUI();
  }
  
  static createKeyMesh(color = 0xffd700) {
    const group = new THREE.Group();
    
    const mat = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.8,
      roughness: 0.2,
      emissive: color,
      emissiveIntensity: 0.3
    });
    
    const head = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.04, 8, 16), mat);
    group.add(head);
    
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), mat);
    shaft.position.y = -0.25;
    group.add(shaft);
    
    return group;
  }
}

export default KeySystem;