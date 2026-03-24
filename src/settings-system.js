// 设置系统模块 - 从main.js拆分
// 处理设置菜单和选项

import { CONFIG } from './config.js';

export class SettingsSystem {
  constructor(state, audioManager) {
    this.state = state;
    this.audioManager = audioManager;
    this.settingsTabsInitialized = false;
  }
  
  openSettings() {
    const overlay = document.getElementById('settings-overlay');
    if (overlay) overlay.style.display = 'flex';
    
    // 暂停游戏（如果在游戏中）
    if (this.state.levelActive) {
      this.state.levelActive = false;
    }
    
    // 加载当前设置到UI
    this.loadSettingsToUI();
    
    // 绑定选项卡事件（只绑定一次）
    if (!this.settingsTabsInitialized) {
      this.setupSettingsTabs();
      this.settingsTabsInitialized = true;
    }
  }
  
  closeSettings() {
    const overlay = document.getElementById('settings-overlay');
    if (overlay) overlay.style.display = 'none';
    
    // 保存设置
    this.saveSettingsFromUI();
    
    // 如果之前在游戏中，恢复游戏并重新锁定鼠标
    if (this.state.phase === 'level' && !this.state.levelActive) {
      this.state.levelActive = true;
    }
    
    // 重新锁定鼠标指针 - immediate user gesture
    if (this.state.phase === 'office' || this.state.phase === 'level') {
      try {
        this.state.controls.lock();
        console.log('[Settings] Mouse re-locked');
      } catch (e) {
        console.warn('[Settings] Lock failed, retrying:', e);
        setTimeout(() => {
          if (this.state.phase === 'office' || this.state.phase === 'level') {
            try { this.state.controls.lock(); } catch (e2) {}
          }
        }, 200);
      }
    }
  }
  
  loadSettingsToUI() {
    // 这里可以加载保存的设置，暂时用默认值
    const brightness = document.getElementById('setting-brightness');
    const shadows = document.getElementById('setting-shadows');
    const vsync = document.getElementById('setting-vsync');
    const master = document.getElementById('setting-master');
    const sfx = document.getElementById('setting-sfx');
    const music = document.getElementById('setting-music');
    
    if (brightness) brightness.value = CONFIG.renderer.toneMappingExposure || 1.0;
    if (shadows) shadows.value = 'medium';
    if (vsync) vsync.checked = true;
    
    if (master) master.value = this.audioManager ? this.audioManager.volume.master : 0.7;
    if (sfx) sfx.value = this.audioManager ? this.audioManager.volume.sfx : 0.8;
    if (music) music.value = this.audioManager ? this.audioManager.volume.music : 0.5;
  }
  
  saveSettingsFromUI() {
    const brightness = document.getElementById('setting-brightness');
    const shadows = document.getElementById('setting-shadows');
    const vsync = document.getElementById('setting-vsync');
    const master = document.getElementById('setting-master');
    const sfx = document.getElementById('setting-sfx');
    const music = document.getElementById('setting-music');
    
    if (brightness && this.state.renderer) {
      this.state.renderer.toneMappingExposure = parseFloat(brightness.value);
    }
    
    if (this.audioManager) {
      if (master) this.audioManager.setMasterVolume(parseFloat(master.value));
      if (sfx) this.audioManager.setSfxVolume(parseFloat(sfx.value));
      if (music) this.audioManager.setMusicVolume(parseFloat(music.value));
    }
  }
  
  setupSettingsTabs() {
    const tabs = document.querySelectorAll('.settings-tab');
    tabs.forEach(tab => {
      tab.onclick = () => {
        const target = tab.dataset.tab;
        
        // 隐藏所有内容
        document.querySelectorAll('.settings-tab-content').forEach(content => {
          content.style.display = 'none';
        });
        
        // 显示目标内容
        const targetContent = document.getElementById('tab-' + target);
        if (targetContent) targetContent.style.display = 'block';
        
        // 更新选项卡样式
        tabs.forEach(t => t.style.backgroundColor = 'transparent');
        tab.style.backgroundColor = 'rgba(233,69,96,0.2)';
      };
      
      // 初始样式
      tab.style.cssText = `
        padding: 8px 16px; background: transparent; border: 1px solid #666;
        color: #deb887; cursor: pointer; border-radius: 4px; font-size: 14px;
      `;
    });
    
    // 默认选择第一个
    if (tabs.length > 0) tabs[0].click();
  }
  
  setAudioManager(audioManager) {
    this.audioManager = audioManager;
  }
}

export default SettingsSystem;