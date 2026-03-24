// UI管理系统 - 从main.js拆分
// 只管理index.html中已存在的UI元素，不再重复创建

export class UIManager {
  constructor(state) {
    this.state = state;
  }
  
  init() {
    // index.html已定义所有UI元素，只需确保初始状态正确
    const controlsHint = document.getElementById('controls-hint');
    if (controlsHint) controlsHint.style.display = 'none'; // 启动时隐藏控制提示
    
    const hud = document.getElementById('hud');
    if (hud) hud.style.display = 'none';
    
    const hint = document.getElementById('hint-text');
    if (hint) hint.style.display = 'none';
  }
  
  showHUD() {
    const hud = document.getElementById('hud');
    if (hud) hud.style.display = 'block';
    const hint = document.getElementById('hint-text');
    if (hint) hint.style.display = 'block';
    const controlsHint = document.getElementById('controls-hint');
    if (controlsHint) controlsHint.style.display = 'block';
  }
  
  hideHUD() {
    const hud = document.getElementById('hud');
    if (hud) hud.style.display = 'none';
    const hint = document.getElementById('hint-text');
    if (hint) hint.style.display = 'none';
    const controlsHint = document.getElementById('controls-hint');
    if (controlsHint) controlsHint.style.display = 'none';
  }
  
  showBook() {
    const overlay = document.getElementById('book-overlay');
    if (overlay) overlay.style.display = 'flex';
  }
  
  hideBook() {
    const overlay = document.getElementById('book-overlay');
    if (overlay) overlay.style.display = 'none';
  }
  
  showSettings() {
    const overlay = document.getElementById('settings-overlay');
    if (overlay) overlay.style.display = 'flex';
  }
  
  hideSettings() {
    const overlay = document.getElementById('settings-overlay');
    if (overlay) overlay.style.display = 'none';
  }
  
  updateSanity(value) {
    const bar = document.getElementById('sanity-bar');
    if (!bar) return;
    
    const percent = Math.max(0, Math.min(100, value));
    bar.style.width = percent + '%';
    
    if (percent > 50) {
      bar.style.background = 'linear-gradient(90deg, #e94560, #ff6b6b)';
    } else if (percent > 25) {
      bar.style.background = 'linear-gradient(90deg, #ff9800, #ffb74d)';
    } else {
      bar.style.background = 'linear-gradient(90deg, #f44336, #ef5350)';
    }
  }
  
  flashScreen(color = '#fff', duration = 0.2) {
    const flash = document.getElementById('scare-flash');
    if (!flash) return;
    
    flash.style.background = color;
    flash.style.display = 'block';
    flash.style.opacity = '0.5';
    
    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => {
        flash.style.display = 'none';
      }, duration * 1000);
    }, 50);
  }
  
  toggleControlsHint() {
    const hint = document.getElementById('controls-hint');
    if (hint) {
      hint.style.display = hint.style.display === 'none' ? 'block' : 'none';
    }
  }
}

export default UIManager;
