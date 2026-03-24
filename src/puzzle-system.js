// 门锁与谜题系统 - 参考Floodead的门锁密码机制
import * as THREE from 'three';

export class DoorLock {
  constructor(state, doorMesh, config = {}) {
    this.state = state;
    this.doorMesh = doorMesh;
    this.isLocked = config.locked !== false;
    this.password = config.password || '1234';
    this.requiredKeys = config.requiredKeys || 0;
    this.isOpen = false;
    this.isOpening = false;
    this.openAngle = config.openAngle || Math.PI / 2;
    this.openSpeed = config.openSpeed || 2;
    
    this.onUnlock = config.onUnlock || null;
    this.onFail = config.onFail || null;
  }
  
  tryUnlock(input) {
    if (!this.isLocked) return true;
    
    if (this.requiredKeys > 0) {
      const keySystem = this.state.keySystem;
      if (keySystem && !keySystem.hasRequiredKeys()) {
        this.onFail?.();
        return false;
      }
    }
    
    if (input === this.password) {
      this.unlock();
      return true;
    }
    
    this.onFail?.();
    return false;
  }
  
  unlock() {
    this.isLocked = false;
    this.isOpening = true;
    this.onUnlock?.();
    
    if (this.state.audioManager) {
      this.state.audioManager.playDoorOpen?.();
    }
  }
  
  update(dt) {
    if (!this.isOpening) return;
    
    if (this.doorMesh) {
      this.doorMesh.rotation.y += this.openSpeed * dt;
      
      if (this.doorMesh.rotation.y >= this.openAngle) {
        this.doorMesh.rotation.y = this.openAngle;
        this.isOpening = false;
        this.isOpen = true;
      }
    }
  }
  
  reset() {
    this.isLocked = true;
    this.isOpen = false;
    this.isOpening = false;
    if (this.doorMesh) {
      this.doorMesh.rotation.y = 0;
    }
  }
}

export class PuzzleSystem {
  constructor(state) {
    this.state = state;
    this.puzzles = [];
    this.activePuzzle = null;
  }
  
  addPuzzle(puzzle) {
    this.puzzles.push(puzzle);
    return puzzle;
  }
  
  createKeypadPuzzle(position, password, onSolve) {
    const keypadGroup = new THREE.Group();
    
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.6, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5 })
    );
    keypadGroup.add(base);
    
    const display = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, 0.1),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    display.position.z = 0.03;
    display.position.y = 0.2;
    display.name = 'display';
    keypadGroup.add(display);
    
    const buttonColors = [0x666666, 0x666666, 0x666666, 0x666666, 0x666666, 0x666666];
    const buttonPositions = [
      [-0.1, 0.05, 0.03], [0, 0.05, 0.03], [0.1, 0.05, 0.03],
      [-0.1, -0.1, 0.03], [0, -0.1, 0.03], [0.1, -0.1, 0.03]
    ];
    
    buttonPositions.forEach((pos, i) => {
      const btn = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16),
        new THREE.MeshStandardMaterial({ 
          color: buttonColors[i],
          emissive: buttonColors[i],
          emissiveIntensity: 0.1
        })
      );
      btn.position.set(...pos);
      btn.rotation.x = Math.PI / 2;
      btn.userData = { isButton: true, index: i };
      keypadGroup.add(btn);
    });
    
    keypadGroup.position.copy(position);
    keypadGroup.userData = {
      isPuzzle: true,
      type: 'keypad',
      password,
      onSolve,
      inputBuffer: '',
      doorLock: null
    };
    
    return this.addPuzzle(keypadGroup);
  }
  
  createSwitchPuzzle(position, onActivate) {
    const switchGroup = new THREE.Group();
    
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.3, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    switchGroup.add(base);
    
    const lever = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.2, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xff4444 })
    );
    lever.position.y = 0.1;
    lever.name = 'lever';
    switchGroup.add(lever);
    
    switchGroup.position.copy(position);
    switchGroup.userData = {
      isPuzzle: true,
      type: 'switch',
      onActivate,
      activated: false
    };
    
    return this.addPuzzle(switchGroup);
  }
  
  interact(puzzleMesh) {
    if (!puzzleMesh?.userData?.isPuzzle) return;
    
    switch(puzzleMesh.userData.type) {
      case 'keypad':
        this.showKeypadUI(puzzleMesh);
        break;
      case 'switch':
        this.activateSwitch(puzzleMesh);
        break;
    }
  }
  
  showKeypadUI(puzzleMesh) {
    const existing = document.getElementById('puzzle-overlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'puzzle-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;
    
    const keypad = document.createElement('div');
    keypad.style.cssText = `
      background: #222;
      padding: 20px;
      border-radius: 10px;
      border: 2px solid #444;
      text-align: center;
    `;
    
    const display = document.createElement('div');
    display.id = 'puzzle-display';
    display.style.cssText = `
      background: #000;
      color: #0f0;
      font-family: monospace;
      font-size: 24px;
      padding: 10px;
      margin-bottom: 15px;
      min-width: 120px;
      border: 1px solid #333;
    `;
    display.textContent = '____';
    
    const buttons = document.createElement('div');
    buttons.style.cssText = 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;';
    
    const btnLabels = ['1','2','3','4','5','6','7','8','9','*','0','#'];
    btnLabels.forEach(label => {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.style.cssText = `
        padding: 15px;
        font-size: 18px;
        background: #444;
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      `;
      btn.onclick = () => this.handleKeypadInput(puzzleMesh, label, display);
      buttons.appendChild(btn);
    });
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.style.cssText = `
      margin-top: 15px;
      padding: 10px 30px;
      background: #666;
      color: #fff;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    `;
    closeBtn.onclick = () => overlay.remove();
    
    keypad.appendChild(display);
    keypad.appendChild(buttons);
    keypad.appendChild(closeBtn);
    overlay.appendChild(keypad);
    document.body.appendChild(overlay);
  }
  
  handleKeypadInput(puzzleMesh, key, display) {
    if (key === '*') {
      puzzleMesh.userData.inputBuffer = '';
      display.textContent = '____';
      return;
    }
    
    if (key === '#') {
      if (puzzleMesh.userData.inputBuffer === puzzleMesh.userData.password) {
        puzzleMesh.userData.onSolve?.();
        document.getElementById('puzzle-overlay')?.remove();
      } else {
        puzzleMesh.userData.inputBuffer = '';
        display.textContent = 'ERR';
        setTimeout(() => display.textContent = '____', 500);
      }
      return;
    }
    
    puzzleMesh.userData.inputBuffer += key;
    display.textContent = puzzleMesh.userData.inputBuffer.padEnd(4, '_');
  }
  
  activateSwitch(puzzleMesh) {
    if (puzzleMesh.userData.activated) return;
    
    puzzleMesh.userData.activated = true;
    const lever = puzzleMesh.getObjectByName('lever');
    if (lever) {
      lever.rotation.z = -Math.PI / 4;
    }
    puzzleMesh.userData.onActivate?.();
  }
  
  update(dt) {
    this.puzzles.forEach(puzzle => {
      if (puzzle.userData.type === 'keypad') {
        const doorLock = puzzle.userData.doorLock;
        if (doorLock) {
          doorLock.update(dt);
        }
      }
    });
  }
  
  reset() {
    this.puzzles.forEach(puzzle => {
      if (puzzle.userData.type === 'keypad') {
        puzzle.userData.inputBuffer = '';
        const doorLock = puzzle.userData.doorLock;
        if (doorLock) doorLock.reset();
      }
      if (puzzle.userData.type === 'switch') {
        puzzle.userData.activated = false;
        const lever = puzzle.getObjectByName('lever');
        if (lever) lever.rotation.z = 0;
      }
    });
  }
}

export default DoorLock;