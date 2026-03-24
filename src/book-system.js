// 书本系统模块 - 从main.js拆分
// 处理书本UI和关卡选择

import { LEVELS } from './levels.js';

export class BookSystem {
  constructor(state) {
    this.state = state;
    this.bookCurrentPage = 1;
    this.bookItemsPerPage = 6; // 每页显示6个关卡
  }
  
  buildBookUI() {
    const grid = document.getElementById('level-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // 显示所有关卡（包括未解锁）
    const totalPages = Math.max(1, Math.ceil(LEVELS.length / this.bookItemsPerPage));
    
    // 更新分页显示
    const currentPageEl = document.getElementById('book-current-page');
    const totalPagesEl = document.getElementById('book-total-pages');
    if (currentPageEl) currentPageEl.textContent = this.bookCurrentPage;
    if (totalPagesEl) totalPagesEl.textContent = totalPages;
    
    // 更新按钮状态
    const prevBtn = document.getElementById('book-prev');
    const nextBtn = document.getElementById('book-next');
    if (prevBtn) prevBtn.disabled = this.bookCurrentPage <= 1;
    if (nextBtn) nextBtn.disabled = this.bookCurrentPage >= totalPages;
    
    // 显示当前页的关卡
    const startIdx = (this.bookCurrentPage - 1) * this.bookItemsPerPage;
    const endIdx = startIdx + this.bookItemsPerPage;
    const pageLevels = LEVELS.slice(startIdx, endIdx);
    
    pageLevels.forEach((lv, index) => {
      const originalIndex = startIdx + index;
      const card = document.createElement('div');
      card.className = 'level-card' + (lv.unlocked ? '' : ' locked');
      
      // 关卡标题
      const titleDiv = document.createElement('div');
      titleDiv.className = 'level-num';
      titleDiv.textContent = `CHAPTER ${String(originalIndex+1).padStart(2,'0')}`;
      card.appendChild(titleDiv);
      
      const nameDiv = document.createElement('div');
      nameDiv.className = 'level-name';
      nameDiv.textContent = lv.name;
      card.appendChild(nameDiv);
      
      const nameEnDiv = document.createElement('div');
      nameEnDiv.className = 'level-name-en';
      nameEnDiv.textContent = lv.nameEn;
      card.appendChild(nameEnDiv);
      
      // 未解锁显示锁图标
      if (!lv.unlocked) {
        const lockIcon = document.createElement('div');
        lockIcon.className = 'lock-icon';
        lockIcon.textContent = '🔒';
        card.appendChild(lockIcon);
      }
      
      // 已解锁且非占位符关卡可点击
      if (lv.unlocked && !lv.id.startsWith('placeholder')) {
        card.addEventListener('click', () => this.startLevel(originalIndex));
        card.style.cursor = 'pointer';
      }
      
      grid.appendChild(card);
    });
    
    // 如果总关卡数不是6的倍数，填充空白保持页面高度
    const remaining = this.bookItemsPerPage - pageLevels.length;
    if (remaining > 0 && remaining < this.bookItemsPerPage) {
      for (let i = 0; i < remaining; i++) {
        const empty = document.createElement('div');
        empty.className = 'level-card';
        empty.style.opacity = '0.3';
        empty.style.cursor = 'default';
        grid.appendChild(empty);
      }
    }
  }
  
  bookPrevPage() {
    if (this.bookCurrentPage > 1) {
      this.bookCurrentPage--;
      this.buildBookUI();
    }
  }
  
  bookNextPage() {
    const totalPages = Math.max(1, Math.ceil(LEVELS.length / this.bookItemsPerPage));
    if (this.bookCurrentPage < totalPages) {
      this.bookCurrentPage++;
      this.buildBookUI();
    }
  }
  
  startLevel(levelIndex) {
    // 这个方法会被main.js中的startLevel函数覆盖
    // 这里提供一个默认实现
    console.log('开始关卡:', levelIndex);
  }
  
  openBook() {
    this.state.phase = 'book';
    const overlay = document.getElementById('book-overlay');
    if (overlay) overlay.style.display = 'flex';
    document.getElementById('hud').style.display = 'none';
    document.exitPointerLock();
    
    // 播放打开书本音效
    if (this.state.audioManager && this.state.audioManager.enabled) {
      this.state.audioManager.playCreakyDoor();
    }
    
    // 添加视觉效果
    if (this.state.effectsSystem) {
      this.state.effectsSystem.flashScreen(0x8b4513, 0.3, 0.5);
    }
  }
  
  closeBook() {
    const overlay = document.getElementById('book-overlay');
    if (overlay) overlay.style.display = 'none';
    
    this.state.phase = 'office';
    
    // 显示 HUD
    const hud = document.getElementById('hud');
    if (hud) hud.style.display = 'block';
    
    // 尝试锁定指针
    const tryLock = async () => {
      if (this.state.phase === 'office' && !this.state.controls.isLocked) {
        try {
          await this.state.controls.lock();
        } catch (error) {
          // 锁定失败，稍后重试
          setTimeout(tryLock, 200);
        }
      }
    };
    
    tryLock();
  }
  
  setStartLevelCallback(callback) {
    this.startLevel = callback;
  }
}

export default BookSystem;