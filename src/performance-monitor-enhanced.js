// 增强版性能监控模块 - 借鉴游戏引擎的性能分析工具
// 监控FPS、内存使用、渲染时间等

export class PerformanceMonitorEnhanced {
  constructor(options = {}) {
    this.options = {
      sampleSize: options.sampleSize || 60,
      updateInterval: options.updateInterval || 1000,
      showOverlay: options.showOverlay || false,
      ...options
    };
    
    this.fps = 0;
    this.frameTime = 0;
    this.minFPS = Infinity;
    this.maxFPS = 0;
    this.avgFPS = 0;
    
    this.frameTimes = [];
    this.fpsSamples = [];
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.totalFrames = 0;
    
    this.memoryUsage = null;
    
    this.overlay = null;
    this.updateTimer = null;
    this.frameStartTime = 0;
    
    if (this.options.showOverlay) {
      this.createOverlay();
    }
  }
  
  start() {
    this.lastTime = performance.now();
    this.startUpdateTimer();
  }
  
  stop() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }
  
  beginFrame() {
    this.frameStartTime = performance.now();
  }
  
  endFrame() {
    const now = performance.now();
    const frameTime = now - this.frameStartTime;
    
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.options.sampleSize) {
      this.frameTimes.shift();
    }
    
    this.frameCount++;
    this.totalFrames++;
    
    // 计算FPS
    const elapsed = now - this.lastTime;
    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.fpsSamples.push(this.fps);
      
      if (this.fpsSamples.length > this.options.sampleSize) {
        this.fpsSamples.shift();
      }
      
      this.minFPS = Math.min(this.minFPS, this.fps);
      this.maxFPS = Math.max(this.maxFPS, this.fps);
      this.avgFPS = Math.round(this.fpsSamples.reduce((a, b) => a + b, 0) / this.fpsSamples.length);
      
      this.frameCount = 0;
      this.lastTime = now;
      
      // 更新内存信息
      this.updateMemoryInfo();
    }
  }
  
  updateMemoryInfo() {
    if (performance.memory) {
      this.memoryUsage = {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
  }
  
  startUpdateTimer() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    
    this.updateTimer = setInterval(() => {
      this.updateOverlay();
    }, this.options.updateInterval);
  }
  
  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'performance-monitor-enhanced';
    this.overlay.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #0f0;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      border: 1px solid #0f0;
      border-radius: 4px;
      z-index: 10000;
      pointer-events: none;
      min-width: 200px;
    `;
    document.body.appendChild(this.overlay);
  }
  
  updateOverlay() {
    if (!this.overlay) return;
    
    const fpsColor = this.fps >= 55 ? '#0f0' : (this.fps >= 30 ? '#ff0' : '#f00');
    
    let html = `
      <div style="color: ${fpsColor}; font-weight: bold;">FPS: ${this.fps}</div>
      <div>Frame Time: ${this.getAverageFrameTime().toFixed(2)}ms</div>
      <div>Min FPS: ${this.minFPS}</div>
      <div>Max FPS: ${this.maxFPS}</div>
      <div>Avg FPS: ${this.avgFPS}</div>
    `;
    
    if (this.memoryUsage) {
      const usedMB = (this.memoryUsage.usedJSHeapSize / 1048576).toFixed(1);
      const totalMB = (this.memoryUsage.totalJSHeapSize / 1048576).toFixed(1);
      html += `
        <div style="margin-top: 5px; border-top: 1px solid #333; padding-top: 5px;">
          <div>Memory: ${usedMB}MB / ${totalMB}MB</div>
        </div>
      `;
    }
    
    html += `
      <div style="margin-top: 5px; border-top: 1px solid #333; padding-top: 5px;">
        <div>Frames: ${this.totalFrames}</div>
      </div>
    `;
    
    this.overlay.innerHTML = html;
  }
  
  getAverageFrameTime() {
    if (this.frameTimes.length === 0) return 0;
    return this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
  }
  
  getReport() {
    return {
      fps: {
        current: this.fps,
        min: this.minFPS,
        max: this.maxFPS,
        average: this.avgFPS
      },
      frameTime: {
        current: this.frameTimes[this.frameTimes.length - 1] || 0,
        average: this.getAverageFrameTime()
      },
      memory: this.memoryUsage,
      totalFrames: this.totalFrames
    };
  }
  
  checkForIssues() {
    const issues = [];
    
    if (this.fps < 30) {
      issues.push({
        type: 'critical',
        message: `FPS is critically low: ${this.fps}`,
        suggestion: 'Consider reducing graphics quality or disabling effects'
      });
    } else if (this.fps < 50) {
      issues.push({
        type: 'warning',
        message: `FPS is below optimal: ${this.fps}`,
        suggestion: 'Monitor for further drops'
      });
    }
    
    const avgFrameTime = this.getAverageFrameTime();
    if (avgFrameTime > 33.33) { // Less than 30 FPS
      issues.push({
        type: 'warning',
        message: `Frame time is high: ${avgFrameTime.toFixed(2)}ms`,
        suggestion: 'Optimize game loop or reduce object count'
      });
    }
    
    return issues;
  }
  
  setVisible(visible) {
    if (this.overlay) {
      this.overlay.style.display = visible ? 'block' : 'none';
    }
  }
  
  destroy() {
    this.stop();
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}

// 全局性能监控实例
export const performanceMonitorEnhanced = new PerformanceMonitorEnhanced({ showOverlay: false });

export default PerformanceMonitorEnhanced;