// 跳跃功能增强 - 修复和改进跳跃系统
export class JumpEnhancement {
  static isGrounded(state) {
    return state._grounded === true;
  }
  
  static canJump(state) {
    if (!state.moving) return false;
    if (!state.moving.jump) return false;
    return JumpEnhancement.isGrounded(state);
  }
  
  static performJump(state, velocity = 6, gravity = 18) {
    if (!JumpEnhancement.canJump(state)) return false;
    
    state.velocity.y = velocity;
    state._grounded = false;
    
    return true;
  }
  
  static updatePhysics(state, dt) {
    if (typeof state.velocity.y !== 'number') {
      state.velocity.y = 0;
    }
    if (typeof state._grounded !== 'boolean') {
      state._grounded = true;
    }
    
    // 跳跃输入处理
    if (state.moving.jump && state._grounded) {
      state.velocity.y = 6;
      state._grounded = false;
      state.moving.jump = false;
    }
    
    // 应用重力
    state.velocity.y -= 18 * dt;
    state.camera.position.y += state.velocity.y * dt;
    
    // 地面检测
    const groundLevel = state.levelActive && state.levelIndex === 1 ? -10 : 1.6;
    
    if (state.camera.position.y <= groundLevel && state.velocity.y <= 0) {
      state.camera.position.y = groundLevel;
      state.velocity.y = 0;
      state._grounded = true;
    }
    
    // 恐高症关卡平台检测
    if (state.levelActive && state.levelIndex === 1) {
      if (state.camera.position.y >= groundLevel && state.velocity.y <= 0) {
        state._grounded = true;
      }
    }
  }
  
  static createJumpIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'jump-indicator';
    indicator.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      color: #0f0;
      font-family: monospace;
      font-size: 14px;
      padding: 8px 16px;
      background: rgba(0,0,0,0.5);
      border: 1px solid #0f0;
      border-radius: 4px;
      display: none;
      z-index: 100;
    `;
    indicator.textContent = 'SPACE - Jump';
    document.body.appendChild(indicator);
    return indicator;
  }
  
  static showJumpHint(show = true) {
    let indicator = document.getElementById('jump-indicator');
    if (!indicator && show) {
      indicator = JumpEnhancement.createJumpIndicator();
    }
    if (indicator) {
      indicator.style.display = show ? 'block' : 'none';
    }
  }
}

export default JumpEnhancement;