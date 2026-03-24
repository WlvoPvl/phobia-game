// 输入管理系统 - 统一处理键盘和鼠标输入
export class InputManager {
  constructor() {
    this.keys = {};
    this.mouse = { x: 0, y: 0, dx: 0, dy: 0, buttons: {} };
    this.gamepad = null;
    this.callbacks = {
      keydown: [],
      keyup: [],
      mousedown: [],
      mouseup: [],
      mousemove: [],
      gamepadconnected: [],
      gamepaddisconnected: []
    };
    this.enabled = true;
    this.setupListeners();
  }
  
  setupListeners() {
    document.addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      this.keys[e.code] = true;
      this.callbacks.keydown.forEach(cb => cb(e));
    });
    
    document.addEventListener('keyup', (e) => {
      if (!this.enabled) return;
      this.keys[e.code] = false;
      this.callbacks.keyup.forEach(cb => cb(e));
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!this.enabled) return;
      this.mouse.dx = e.movementX || 0;
      this.mouse.dy = e.movementY || 0;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.callbacks.mousemove.forEach(cb => cb(e));
    });
    
    document.addEventListener('mousedown', (e) => {
      if (!this.enabled) return;
      this.mouse.buttons[e.button] = true;
      this.callbacks.mousedown.forEach(cb => cb(e));
    });
    
    document.addEventListener('mouseup', (e) => {
      if (!this.enabled) return;
      this.mouse.buttons[e.button] = false;
      this.callbacks.mouseup.forEach(cb => cb(e));
    });
    
    window.addEventListener('gamepadconnected', (e) => {
      this.gamepad = e.gamepad;
      this.callbacks.gamepadconnected.forEach(cb => cb(e));
    });
    
    window.addEventListener('gamepaddisconnected', (e) => {
      this.gamepad = null;
      this.callbacks.gamepaddisconnected.forEach(cb => cb(e));
    });
  }
  
  isKeyDown(keyCode) {
    return this.keys[keyCode] || false;
  }
  
  isMouseButtonDown(button) {
    return this.mouse.buttons[button] || false;
  }
  
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }
  
  off(event, callback) {
    if (this.callbacks[event]) {
      const idx = this.callbacks[event].indexOf(callback);
      if (idx > -1) this.callbacks[event].splice(idx, 1);
    }
  }
  
  getGamepadState() {
    if (!this.gamepad) return null;
    
    const gamepads = navigator.getGamepads();
    const gp = gamepads[this.gamepad.index];
    if (!gp) return null;
    
    return {
      buttons: gp.buttons.map(b => b.pressed),
      axes: gp.axes
    };
  }
  
  enable() { this.enabled = true; }
  disable() { this.enabled = false; }
  
  reset() {
    this.keys = {};
    this.mouse.buttons = {};
    this.mouse.dx = 0;
    this.mouse.dy = 0;
  }
}

export const inputManager = new InputManager();
export default InputManager;