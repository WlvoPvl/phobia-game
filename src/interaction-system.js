// 交互系统 - 从main.js拆分
// 处理玩家与环境物体的交互

import * as THREE from 'three';

export class InteractionSystem {
  constructor(state) {
    this.state = state;
    this.interactRange = 2;
    this.currentTarget = null;
    this.dialogueActive = false;
  }
  
  interact() {
    if (!this.state.controls?.isLocked) return;
    
    switch (this.state.phase) {
      case 'office':
        this.interactWithOffice();
        break;
      case 'level':
        this.interactWithLevel();
        break;
      default:
        break;
    }
  }
  
  interactWithOffice() {
    const playerPos = this.state.camera.position;
    const cameraDirection = new THREE.Vector3();
    this.state.camera.getWorldDirection(cameraDirection);
    
    // 检查书本交互
    if (this.state.bookMesh) {
      const bookDist = playerPos.distanceTo(this.state.bookMesh.position);
      if (bookDist < this.interactRange) {
        this.showBookUI();
        return;
      }
    }
    
    // 检查咨询师对话
    if (this.state.counselorGroup) {
      const counselorPos = new THREE.Vector3(0, 0, -4);
      const dist = playerPos.distanceTo(counselorPos);
      if (dist < 3) {
        this.showCounselorDialogue();
        return;
      }
    }
  }
  
  interactWithLevel() {
    // 关卡中的交互逻辑可以在这里扩展
    // 例如：收集物品、触发机关等
  }
  
  showBookUI() {
    this.state.phase = 'book';
    this.state.controls.unlock();
    document.exitPointerLock();
    
    const overlay = document.getElementById('book-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      
      const chapters = document.getElementById('chapters');
      if (chapters) {
        chapters.innerHTML = '';
        
        const LEVELS = window.LEVELS || [];
        LEVELS.forEach((level, index) => {
          if (index > 8) return;
          
          const btn = document.createElement('button');
          btn.style.cssText = `
            padding: 15px 20px;
            background: ${level.unlocked ? 'linear-gradient(135deg, #2a1f14, #4a3020)' : '#1a1a1a'};
            border: 1px solid ${level.unlocked ? '#d4af37' : '#444'};
            color: ${level.unlocked ? '#f5deb3' : '#666'};
            cursor: ${level.unlocked ? 'pointer' : 'not-allowed'};
            border-radius: 4px;
            text-align: left;
            transition: all 0.2s;
          `;
          
          btn.innerHTML = `
            <div style="font-weight: bold;">${level.nameEn}</div>
            <div style="font-size: 12px; opacity: 0.7;">${level.name}</div>
          `;
          
          if (level.unlocked) {
            btn.onclick = () => this.selectLevel(index);
          }
          
          chapters.appendChild(btn);
        });
      }
    }
    
    const hud = document.getElementById('hud');
    if (hud) hud.style.display = 'none';
  }
  
  selectLevel(levelIndex) {
    const overlay = document.getElementById('book-overlay');
    if (overlay) overlay.style.display = 'none';
    
    window.startLevel?.(levelIndex);
  }
  
  closeBook() {
    this.state.phase = 'office';
    
    const overlay = document.getElementById('book-overlay');
    if (overlay) overlay.style.display = 'none';
    
    const hud = document.getElementById('hud');
    if (hud) hud.style.display = 'block';
    
    this.state.controls?.lock?.();
  }
  
  showCounselorDialogue() {
    if (this.dialogueActive) return;
    this.dialogueActive = true;
    this.state.dialogueActive = true;
    this.state.controls?.unlock?.();
    
    // 检查是否已存在对话框
    let dialogue = document.getElementById('counselor-dialogue');
    if (dialogue) {
      dialogue.style.display = 'block';
      return;
    }
    
    dialogue = document.createElement('div');
    dialogue.id = 'counselor-dialogue';
    dialogue.style.cssText = `
      position: fixed;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(20, 15, 10, 0.95);
      border: 2px solid #8b4513;
      border-radius: 12px;
      padding: 20px 30px;
      max-width: 500px;
      color: #f5deb3;
      font-family: 'Georgia', serif;
      z-index: 200;
    `;
    
    dialogue.innerHTML = `
      <div style="margin-bottom: 15px;">
        <strong style="color: #d4af37;">心理咨询师:</strong>
      </div>
      <div id="dialogue-text" style="line-height: 1.6;">
        你准备好了吗？这本书将带你进入各种恐惧的深处。记住，只有直面恐惧，才能战胜它。
      </div>
      <button id="dialogue-close" style="
        margin-top: 15px;
        padding: 8px 20px;
        background: #8b4513;
        border: 1px solid #d4af37;
        color: #f5deb3;
        cursor: pointer;
        border-radius: 4px;
      ">我准备好了</button>
    `;
    
    document.body.appendChild(dialogue);
    
    document.getElementById('dialogue-close').addEventListener('click', () => {
      this.hideCounselorDialogue();
    });
  }
  
  hideCounselorDialogue() {
    this.dialogueActive = false;
    this.state.dialogueActive = false;
    
    const dialogue = document.getElementById('counselor-dialogue');
    if (dialogue) dialogue.remove();
    
    this.state.controls?.lock?.();
  }
  
  checkProximity() {
    const playerPos = this.state.camera.position;
    
    if (this.state.bookMesh) {
      const dist = playerPos.distanceTo(this.state.bookMesh.position);
      this.updateInteractionPrompt(dist < this.interactRange, '按E阅读档案');
    }
  }
  
  updateInteractionPrompt(visible, text) {
    let prompt = document.getElementById('interaction-prompt');
    
    if (visible) {
      if (!prompt) {
        prompt = document.createElement('div');
        prompt.id = 'interaction-prompt';
        prompt.style.cssText = `
          position: fixed;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.8);
          color: #fff;
          padding: 10px 20px;
          border-radius: 20px;
          font-family: monospace;
          font-size: 14px;
          z-index: 150;
        `;
        document.body.appendChild(prompt);
      }
      prompt.textContent = text;
      prompt.style.display = 'block';
    } else if (prompt) {
      prompt.style.display = 'none';
    }
  }
  
  setCallbacks(callbacks) {
    // 可以设置外部回调
  }
}

export default InteractionSystem;