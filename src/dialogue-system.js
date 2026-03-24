// 对话系统模块 - 从main.js拆分
// 处理咨询师对话系统

import * as THREE from 'three';

export class DialogueSystem {
  constructor(state) {
    this.state = state;
    this.counselorDialogues = [
      { text: "欢迎回来。今天感觉怎么样？", followUp: ["好多了", "还是老样子"] },
      { text: "记住，面对恐惧是治愈的第一步。", followUp: ["我会努力的", "这很难"] },
      { text: "每一个关卡都是一次成长的机会。", followUp: ["明白了"] },
      { text: "不要急，慢慢来。心理治疗需要时间。", followUp: ["好的"] },
      { text: "你的恐惧症档案记录了你的进步。", followUp: ["谢谢医生"] },
    ];
    
    this.currentDialogueIndex = 0;
    this.dialogueActive = false;
  }
  
  showCounselorDialogue() {
    if (this.dialogueActive) return;
    this.dialogueActive = true;
    this.state.dialogueActive = true;
    
    const dialogue = this.counselorDialogues[this.currentDialogueIndex % this.counselorDialogues.length];
    this.currentDialogueIndex++;
    
    // 创建对话框
    let dialogueBox = document.getElementById('counselor-dialogue');
    if (!dialogueBox) {
      dialogueBox = document.createElement('div');
      dialogueBox.id = 'counselor-dialogue';
      dialogueBox.style.cssText = `
        position: fixed; bottom: 150px; left: 50%; transform: translateX(-50%);
        background: rgba(0,0,0,0.85); border: 2px solid #4a3020;
        padding: 20px 30px; border-radius: 12px; max-width: 500px;
        color: #f5deb3; font-size: 16px; line-height: 1.6;
        z-index: 70; backdrop-filter: blur(8px);
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      `;
      document.body.appendChild(dialogueBox);
    }
    
    // 显示对话
    dialogueBox.innerHTML = `
      <div style="color: #8e44ad; font-size: 12px; margin-bottom: 8px; letter-spacing: 2px;">心理咨询师</div>
      <div style="margin-bottom: 15px;">${dialogue.text}</div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        ${dialogue.followUp.map((opt, i) => `
          <button class="dialogue-option" style="
            padding: 8px 16px; background: rgba(74,48,32,0.5);
            border: 1px solid #8b4513; color: #deb887; border-radius: 4px;
            cursor: pointer; font-size: 14px; transition: all 0.2s;
          ">${opt}</button>
        `).join('')}
      </div>
      <div style="margin-top: 12px; color: #666; font-size: 12px;">按 ESC 关闭</div>
    `;
    dialogueBox.style.display = 'block';
    
    // 绑定选项事件
    const options = dialogueBox.querySelectorAll('.dialogue-option');
    options.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        this.hideCounselorDialogue();
      });
      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(139,69,19,0.7)';
        btn.style.color = '#fff';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'rgba(74,48,32,0.5)';
        btn.style.color = '#deb887';
      });
    });
    
    // 暂停游戏，显示对话时退出指针锁定
    document.exitPointerLock();
  }
  
  hideCounselorDialogue() {
    const dialogueBox = document.getElementById('counselor-dialogue');
    if (dialogueBox) {
      dialogueBox.style.display = 'none';
    }
    this.dialogueActive = false;
    this.state.dialogueActive = false;
    
    // 重新锁定指针
    if (this.state.phase === 'office') {
      this.state.controls.lock();
    }
  }
  
  checkProximity() {
    const prompt = document.getElementById('interaction-prompt');
    if (!prompt) return;
    
    // 非办公室阶段始终隐藏提示
    if (this.state.phase !== 'office' || this.state.levelActive || this.dialogueActive) {
      prompt.style.display = 'none';
      return;
    }
    
    let showPrompt = false;
    let promptText = '';
    
    // 使用射线检测玩家是否正对目标
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.state.camera);
    raycaster.far = 3.5;
    
    // 检查书本
    if (this.state.bookMesh) {
      const bookPos = new THREE.Vector3();
      this.state.bookMesh.getWorldPosition(bookPos);
      const bookDist = this.state.camera.position.distanceTo(bookPos);
      
      // 检查是否靠近且正对
      if (bookDist < 2.5) {
        const hits = raycaster.intersectObject(this.state.bookMesh, true);
        if (hits.length > 0 || bookDist < 1.5) { // 非常近时不需要正对
          showPrompt = true;
          promptText = '按 <strong>E</strong> 对准并打开"恐惧症档案"';
        }
        // 靠近时书本发光增强
        this.state.bookMesh.material.emissiveIntensity = 0.5 + Math.sin(this.state.clock.getElapsedTime() * 4) * 0.2;
      } else {
        // 远离时恢复正常发光脉冲
        this.state.bookMesh.material.emissiveIntensity = 0.2 + Math.sin(this.state.clock.getElapsedTime() * 2) * 0.15;
      }
    }
    
    // 检查咨询师
    if (this.state.counselorGroup) {
      const counselorPos = new THREE.Vector3();
      this.state.counselorGroup.getWorldPosition(counselorPos);
      const counselorDist = this.state.camera.position.distanceTo(counselorPos);
      
      if (counselorDist < 3) {
        const hits = raycaster.intersectObject(this.state.counselorGroup, true);
        if (hits.length > 0 || counselorDist < 1.5) { // 非常近时不需要正对
          showPrompt = true;
          promptText = '按 <strong>E</strong> 对准并和咨询师交谈';
        }
      }
    }
    
    if (showPrompt) {
      prompt.innerHTML = promptText;
      prompt.style.display = 'block';
    } else {
      prompt.style.display = 'none';
    }
  }
  
  isDialogueActive() {
    return this.dialogueActive;
  }
}

export default DialogueSystem;