// 调试系统模块
// 处理调试功能和错误报告

export class DebugSystem {
  constructor(state) {
    this.state = state;
    this.debugDiv = null;
  }

  generateBugReport(description = '') {
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: window.screen.width + 'x' + window.screen.height,
      devicePixelRatio: window.devicePixelRatio,
      url: window.location.href,
      game: {
        phase: this.state.phase,
        levelIndex: this.state.levelIndex,
        levelActive: this.state.levelActive,
        levelTime: this.state.levelTime,
        sanity: this.state.sanity,
        position: {
          x: this.state.camera.position.x.toFixed(2),
          y: this.state.camera.position.y.toFixed(2),
          z: this.state.camera.position.z.toFixed(2)
        },
        mouseLocked: this.state.controls ? this.state.controls.isLocked : false,
        debugMode: this.state.debugMode,
        godMode: this.state.godMode,
        description: description || '(无描述)'
      }
    };

    const dataStr = JSON.stringify(report, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bug-report-' + Date.now() + '.json';
    a.click();
    URL.revokeObjectURL(url);

    this.showEditorHint('错误报告已生成并下载');
    setTimeout(() => this.hideEditorHint(), 3000);

    return report;
  }

  updateDebugInfo() {
    if (!this.debugDiv) {
      this.debugDiv = document.createElement('div');
      this.debugDiv.id = 'debug-info';
      this.debugDiv.style.cssText = 'position:fixed;top:10px;left:10px;background:rgba(0,0,0,0.7);color:#0f0;padding:10px;font-family:monospace;font-size:12px;border:1px solid #0f0;border-radius:4px;z-index:1000;pointer-events:none;';
      document.body.appendChild(this.debugDiv);
    }

    const pos = this.state.camera.position;
    const info = 'POS: ' + pos.x.toFixed(2) + ', ' + pos.y.toFixed(2) + ', ' + pos.z.toFixed(2) +
      ' SANITY: ' + this.state.sanity.toFixed(1) +
      ' LEVEL: ' + this.state.levelIndex +
      ' FPS: ' + (1 / Math.max(0.016, this.state.clock.getDelta())).toFixed(0);
    this.debugDiv.textContent = info;
  }

  showEditorHint(text) {
    let hintDiv = document.getElementById('editor-hint');
    if (!hintDiv) {
      hintDiv = document.createElement('div');
      hintDiv.id = 'editor-hint';
      hintDiv.style.cssText = 'position:fixed;top:60px;right:20px;background:rgba(0,0,0,0.7);color:#0f0;padding:12px;font-family:monospace;font-size:12px;border:1px solid #0f0;border-radius:4px;z-index:1000;max-width:300px;';
      document.body.appendChild(hintDiv);
    }
    hintDiv.textContent = text;
    hintDiv.style.display = 'block';
  }

  hideEditorHint() {
    const hintDiv = document.getElementById('editor-hint');
    if (hintDiv) {
      hintDiv.style.display = 'none';
    }
  }
}

export default DebugSystem;
