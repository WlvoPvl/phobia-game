// 性能监控工具 - 监控FPS、内存使用等
export class PerformanceMonitor {
  constructor() {
    this.enabled = false;
    this.fps = 60;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsHistory = [];
    this.memoryUsage = 0;
    this.domElement = null;
  }
  
  start() {
    this.enabled = true;
    this.createUI();
  }
  
  stop() {
    this.enabled = false;
    this.removeUI();
  }
  
  createUI() {
    if (this.domElement) return;
    
    this.domElement = document.createElement('div');
    this.domElement.id = 'perf-monitor';
    this.domElement.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0,0,0,0.7);
      color: #0f0;
      padding: 8px 12px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      border: 1px solid #0f0;
      border-radius: 4px;
      min-width: 150px;
    `;
    document.body.appendChild(this.domElement);
  }
  
  removeUI() {
    if (this.domElement) {
      this.domElement.remove();
      this.domElement = null;
    }
  }
  
  update() {
    if (!this.enabled) return;
    
    this.frameCount++;
    const now = performance.now();
    
    if (now - this.lastTime >= 1000) {
      this.fps = Math.round(this.frameCount * 1000 / (now - this.lastTime));
      this.fpsHistory.push(this.fps);
      if (this.fpsHistory.length > 10) this.fpsHistory.shift();
      
      this.frameCount = 0;
      this.lastTime = now;
      
      if (performance.memory) {
        this.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576);
      }
      
      this.updateUI();
    }
  }
  
  updateUI() {
    if (!this.domElement) return;
    
    const avgFps = this.fpsHistory.length > 0 
      ? Math.round(this.fpsHistory.reduce((a,b) => a+b, 0) / this.fpsHistory.length)
      : this.fps;
    
    this.domElement.innerHTML = `
      <div>FPS: ${this.fps} (avg: ${avgFps})</div>
      ${this.memoryUsage > 0 ? `<div>Memory: ${this.memoryUsage} MB</div>` : ''}
      <div>Objects: ${this.getSceneObjectCount()}</div>
    `;
  }
  
  getSceneObjectCount() {
    if (typeof window !== 'undefined' && window.state && window.state.scene) {
      let count = 0;
      window.state.scene.traverse(() => count++);
      return count;
    }
    return 0;
  }
  
  getStats() {
    return {
      fps: this.fps,
      fpsAverage: this.fpsHistory.length > 0 
        ? Math.round(this.fpsHistory.reduce((a,b) => a+b, 0) / this.fpsHistory.length)
        : 0,
      memoryMB: this.memoryUsage
    };
  }
}

export const perfMonitor = new PerformanceMonitor();
export default PerformanceMonitor;