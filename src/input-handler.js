// 输入处理模块 - 从 main.js 拆分
// 处理键盘和鼠标事件
// 借鉴 Unity InputSystem 的 Enable/Disable 模式

export class InputHandler {
  constructor(state) {
    this.state = state;
    this.gameKeys = ['KeyW','KeyA','KeyS','KeyD','KeyE','KeyH','KeyF','KeyG','ShiftLeft','ShiftRight','Escape','Space'];
    this._listeners = []; // 跟踪事件监听器以便清理
    this._enabled = false;
  }

  setupListeners() {
    if (this._enabled) return; // 防止重复设置

    const keyDownHandler = (e) => this.onKeyDown(e);
    const keyUpHandler = (e) => this.onKeyUp(e);
    const mouseDownHandler = (e) => this.onMouseDown(e);
    const mouseUpHandler = (e) => this.onMouseUp(e);

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    document.addEventListener('mousedown', mouseDownHandler);
    document.addEventListener('mouseup', mouseUpHandler);

    // 跟踪监听器以便清理
    this._listeners = [
      { event: 'keydown', handler: keyDownHandler },
      { event: 'keyup', handler: keyUpHandler },
      { event: 'mousedown', handler: mouseDownHandler },
      { event: 'mouseup', handler: mouseUpHandler }
    ];

    this._enabled = true;
  }

  /**
   * 禁用输入处理器 - 移除所有监听器
   * 借鉴 Unity InputAction.Disable()
   */
  dispose() {
    if (!this._enabled) return;

    for (const { event, handler } of this._listeners) {
      document.removeEventListener(event, handler);
    }

    this._listeners = [];
    this._enabled = false;
  }

  /**
   * 重新启用输入处理器
   * 借鉴 Unity InputAction.Enable()
   */
  enable() {
    if (!this._enabled) {
      this.setupListeners();
    }
  }

  shouldPreventDefault(code, ctrlKey) {
    if (this.gameKeys.includes(code) || (ctrlKey && this.gameKeys.includes(code))) {
      return true;
    }
    if (ctrlKey && (code === 'KeyS' || code === 'KeyR')) return true;
    if (code === 'F5' || code === 'F11' || code === 'F12') return true;
    return false;
  }

  onKeyDown(e) {
    if (this.state.phase === 'start') return;

    if (this.shouldPreventDefault(e.code, e.ctrlKey)) {
      e.preventDefault();
    }

    // Ctrl+Shift+E - 错误报告
    if (e.code === 'KeyE' && e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      window.generateBugReport?.();
      return;
    }

    // ESC - 关闭对话框
    if (e.code === 'Escape' && this.state.dialogueActive) {
      this.hideCounselorDialogue?.();
      return;
    }

    // ESC - 打开设置
    if (e.code === 'Escape' && this.state.phase !== 'book' &&
        this.state.phase !== 'level' && !this.state.editorMode) {
      window.openSettings?.();
      return;
    }

    // H 键 - 显示/隐藏按键提示
    if (e.code === 'KeyH') {
      const hint = document.getElementById('controls-hint');
      if (hint) {
        hint.style.display = hint.style.display === 'none' ? 'block' : 'none';
      }
      return;
    }

    // Ctrl+Shift+G - 测试模式
    if (e.code === 'KeyG' && e.ctrlKey && e.shiftKey) {
      this.toggleDebugMode();
      return;
    }

    // Ctrl+F - 编辑器模式 (仅办公室阶段)
    if (e.code === 'KeyF' && e.ctrlKey && this.state.phase === 'office') {
      window.toggleEditorMode?.();
      return;
    }

    // 编辑器模式下的快捷键
    if (this.state.editorMode) {
      this.handleEditorKeys(e);
      return;
    }

    // ESC 关闭编辑器帮助
    if (e.code === 'Escape' && this.state.editorHelpDiv &&
        this.state.editorHelpDiv.style.display !== 'none') {
      this.hideEditorHelp?.();
      return;
    }

    // 常规游戏按键
    this.handleGameKeys(e.code, true);
  }

  onKeyUp(e) {
    this.handleGameKeys(e.code, false);
  }

  handleGameKeys(code, pressed) {
    switch (code) {
      case 'KeyW': this.state.moving.forward = pressed; break;
      case 'KeyS': this.state.moving.backward = pressed; break;
      case 'KeyA': this.state.moving.left = pressed; break;
      case 'KeyD': this.state.moving.right = pressed; break;
      case 'ShiftLeft':
      case 'ShiftRight': this.state.moving.sprint = pressed; break;
      case 'Space': this.state.moving.jump = pressed; break;
      case 'KeyE':
        if (pressed) window.interact?.();
        break;
      case 'KeyF':
        if (pressed && this.state.levelIndex === 3 && this.state.phase === 'level') {
          if (this.state.playerFlashlight) {
            this.state.playerFlashlight.intensity = this.state.playerFlashlight.intensity > 0.5 ? 0 : 3;
            const hint = document.getElementById('hint-text');
            if (hint) hint.textContent = this.state.playerFlashlight.intensity > 0.5 ? '手电筒已开启' : '手电筒已关闭';
          }
        }
        break;
      case 'Escape':
        if (pressed) {
          if (this.state.phase === 'book') window.closeBook?.();
          if (this.state.phase === 'level') window.returnToOffice?.();
        }
        break;
    }
  }

  onMouseDown(e) {
    if (this.state.phase === 'book' || this.state.phase === 'start' || this.state.phase === 'end') return;
    if (this.state.phase !== 'office' && this.state.phase !== 'level') return;

    if (!this.state.controls.isLocked) {
      this.state.controls.lock();
    }
  }

  onMouseUp(e) {
    // 可扩展
  }

  toggleDebugMode() {
    this.state.debugMode = !this.state.debugMode;
    this.state.godMode = this.state.debugMode;
    this.state.showMinimap = this.state.debugMode;

    if (this.state.debugMode) {
      console.log('测试模式开启 - 无敌 + 小地图');
      window.LEVELS?.forEach(lv => lv.unlocked = true);
      window.buildBookUI?.();
    } else {
      console.log('测试模式关闭');
    }
  }

  handleEditorKeys(e) {
    if (!window.handleEditorKeys) return;

    // 编辑器快捷键处理
    if (e.code === 'KeyS' && e.ctrlKey) {
      e.preventDefault();
      window.saveFurniturePositions?.();
      window.showEditorHint?.('配置已保存并下载');
      return;
    }
    if (e.code === 'KeyF' && e.ctrlKey) {
      window.toggleEditorMode?.();
      return;
    }
    if (e.code === 'Escape') {
      if (window.editorHelpDiv && window.editorHelpDiv.style.display !== 'none') {
        window.hideEditorHelp?.();
      } else if (window.editorState?.selectedObject) {
        window.deselectObject?.();
      } else {
        window.toggleEditorMode?.();
      }
      return;
    }
    if (e.code === 'KeyT') {
      window.handleObjectSelection?.();
      return;
    }
    if (e.code === 'KeyF' && !e.ctrlKey && window.editorState?.selectedObject) {
      window.confirmMove?.();
      return;
    }

    window.handleEditorKeys(e);
  }

  setCallbacks(callbacks) {
    this.hideCounselorDialogue = callbacks.hideCounselorDialogue;
    this.hideEditorHelp = callbacks.hideEditorHelp;
  }
}

export default InputHandler;
