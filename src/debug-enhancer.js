// 调试增强工具 - 提供更丰富的调试功能
import * as THREE from 'three';

export class DebugEnhancer {
  constructor() {
    this.enabled = false;
    this.infoPanel = null;
  }
  
  start(state) {
    this.enabled = true;
    this.createDebugPanel(state);
    console.log('[DebugEnhancer] Debug mode started');
  }
  
  stop() {
    this.enabled = false;
    this.removeDebugPanel();
    console.log('[DebugEnhancer] Debug mode stopped');
  }
  
  createDebugPanel(state) {
    if (this.infoPanel) return;
    
    this.infoPanel = document.createElement('div');
    this.infoPanel.id = 'debug-enhancer-panel';
    this.infoPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: #0f0;
      padding: 12px;
      font-family: monospace;
      font-size: 11px;
      z-index: 10000;
      border: 1px solid #0f0;
      border-radius: 4px;
      min-width: 200px;
      max-height: 80vh;
      overflow-y: auto;
    `;
    document.body.appendChild(this.infoPanel);
  }
  
  removeDebugPanel() {
    if (this.infoPanel) {
      this.infoPanel.remove();
      this.infoPanel = null;
    }
  }
  
  update(state) {
    if (!this.enabled || !this.infoPanel || !state) return;
    
    const pos = state.camera ? state.camera.position : null;
    const rot = state.camera ? state.camera.rotation : null;
    
    this.infoPanel.innerHTML = `
      <div style="margin-bottom:8px;border-bottom:1px solid #0f0">
        <strong>DEBUG INFO</strong>
      </div>
      <div>Phase: ${state.phase || 'N/A'}</div>
      <div>Level: ${state.levelIndex >= 0 ? state.levelIndex + ' (' + (state.levelActive ? 'active' : 'inactive') + ')' : 'none'}</div>
      <div>Sanity: ${state.sanity !== undefined ? state.sanity.toFixed(1) : 'N/A'}</div>
      <div>Time: ${state.levelTime ? state.levelTime.toFixed(1) : '0'}s</div>
      <hr style="border-color:#0f0;opacity:0.3">
      <div>Position:</div>
      <div style="padding-left:10px">
        X: ${pos ? pos.x.toFixed(2) : 'N/A'}<br>
        Y: ${pos ? pos.y.toFixed(2) : 'N/A'}<br>
        Z: ${pos ? pos.z.toFixed(2) : 'N/A'}
      </div>
      <div>Rotation:</div>
      <div style="padding-left:10px">
        Y: ${rot ? rot.y.toFixed(2) : 'N/A'}
      </div>
      <hr style="border-color:#0f0;opacity:0.3">
      <div>Controls Locked: ${state.controls ? state.controls.isLocked : 'N/A'}</div>
      <div>God Mode: ${state.godMode || false}</div>
      ${state.levelActive ? `
      <hr style="border-color:#0f0;opacity:0.3">
      <div>Level Objects:</div>
      <div style="padding-left:10px">
        Spiders: ${state.spiders ? state.spiders.length : 0}<br>
        Platforms: ${state.cosmicPlatforms ? state.cosmicPlatforms.length : 0}<br>
        Clowns: ${state.clownFigures ? state.clownFigures.length : 0}<br>
        Pigs: ${state.pigs ? state.pigs.length : 0}
      </div>
      ` : ''}
      <hr style="border-color:#0f0;opacity:0.3">
      <div style="color:#888">Press keys in console:</div>
      <div style="padding-left:10px;color:#888">
        setPos(x,y,z)<br>
        setSanity(n)<br>
        nextLevel()<br>
        killPlayer()
      </div>
    `;
  }
  
  static createConsoleHelpers(state) {
    if (typeof window.setPos !== 'undefined') return;
    
    window.setPos = (x, y, z) => {
      if (state.camera) {
        state.camera.position.set(x, y, z);
        console.log(`Position set to: ${x}, ${y}, ${z}`);
      }
    };
    
    window.setSanity = (n) => {
      state.sanity = Math.max(0, Math.min(100, n));
      if (document.getElementById('sanity-bar')) {
        document.getElementById('sanity-bar').style.width = state.sanity + '%';
      }
      console.log(`Sanity set to: ${state.sanity}`);
    };
    
    window.nextLevel = () => {
      if (state.levelActive && window.startLevel) {
        window.returnToOffice();
        setTimeout(() => {
          window.startLevel(state.levelIndex + 1);
        }, 500);
      }
    };
    
    window.killPlayer = () => {
      state.sanity = 0;
      console.log('Player sanity depleted');
    };
    
    window.tp = window.setPos;
  }
}

export const debugEnhancer = new DebugEnhancer();
export default DebugEnhancer;