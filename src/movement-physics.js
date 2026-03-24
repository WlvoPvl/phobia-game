// 移动与物理模块
import * as THREE from 'three';

export class MovementPhysics {
  constructor(state, config) {
    this.state = state;
    this.config = config || {};
    
    // 移动速度提升
    this.speed = this.config.speed || 10; // 4 -> 6 -> 10
    this.acceleration = this.config.acceleration || 15;
    this.friction = this.config.friction || 10;
    this.maxVelocity = this.config.maxVelocity || 15;
    this.jumpVelocity = 5; // 跳跃提升 7 -> 5 (防止天花板碰撞)
    this.gravity = 12; // 重力稍微降低
    this.levelGravityOverrides = {1: 9};
    
    this.bounds = this.config.bounds || 18;
  }
  
  update(dt) {
    if (!this.state.controls?.isLocked) return;
    if (this.state.phase !== 'office' && this.state.phase !== 'level') return;
    
    // 太空关卡由关卡自己的update处理移动
    if (this.state.levelActive && this.state.levelIndex === 4) return;
    
    this.applyInput(dt);
    this.applyPhysics(dt);
    this.applyBounds();
  }
  
  applyInput(dt) {
    const moving = this.state.moving;
    const velocity = this.state.velocity;
    
    // 获取相机朝向（忽略Y轴）
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    this.state.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    
    const currentSpeed = moving.sprint ? this.speed * 1.8 : this.speed;
    
    // 计算输入方向
    const inputDir = new THREE.Vector3();
    if (moving.forward) inputDir.add(forward);
    if (moving.backward) inputDir.sub(forward);
    if (moving.right) inputDir.add(right);
    if (moving.left) inputDir.sub(right);
    
    if (inputDir.lengthSq() > 0) {
      inputDir.normalize();
      velocity.x += inputDir.x * this.acceleration * dt;
      velocity.z += inputDir.z * this.acceleration * dt;
    }
    
    // 摩擦力
    velocity.x -= velocity.x * this.friction * dt;
    velocity.z -= velocity.z * this.friction * dt;
    
    // 限速
    const horizontalSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
    if (horizontalSpeed > currentSpeed) {
      const scale = currentSpeed / horizontalSpeed;
      velocity.x *= scale;
      velocity.z *= scale;
    }
    
    // 极小速度归零
    if (horizontalSpeed < 0.01) {
      velocity.x = 0;
      velocity.z = 0;
    }
  }
  
  applyPhysics(dt) {
    const velocity = this.state.velocity;
    const camera = this.state.camera;
    
    // 跳跃
    if (this.state.moving.jump && this.state._grounded) {
      velocity.y = this.jumpVelocity;
      this.state._grounded = false;
    }
    
    // 重力
    const g = this.levelGravityOverrides[this.state.levelIndex] || this.gravity;
    velocity.y -= g * dt;
    
    // 应用速度
    camera.position.x += velocity.x * dt;
    camera.position.y += velocity.y * dt;
    camera.position.z += velocity.z * dt;
    
    // 地面检测（恐高关无地面，让关卡处理坠落）
    if (!(this.state.levelActive && this.state.levelIndex === 1)) {
      const groundLevel = this.getGroundLevel();
      if (camera.position.y <= groundLevel) {
        camera.position.y = groundLevel;
        velocity.y = 0;
        this.state._grounded = true;
      }
    }
    
    // 恐高关卡的平台碰撞
    if (this.state.levelActive && this.state.levelIndex === 1) {
      this.checkPlatformCollision(dt);
    }
  }
  
  getGroundLevel() {
    if (this.state.levelActive && this.state.levelIndex === 1) {
      return -100;
    }
    return 1.6;
  }
  
  checkPlatformCollision(dt) {
    if (!this.state.platforms) return;
    
    const playerPos = this.state.camera.position;
    
    for (const platform of this.state.platforms) {
      const px = platform.mesh ? platform.mesh.position.x : platform.x;
      const py = platform.mesh ? platform.mesh.position.y : platform.y;
      const pz = platform.mesh ? platform.mesh.position.z : platform.z;
      const halfW = (platform.width || 3) / 2 + 0.3;
      const halfD = (platform.depth || 4) / 2 + 0.3;
      const rotation = platform.rotation || 0;
      
      const dx = playerPos.x - px;
      const dz = playerPos.z - pz;
      const cos = Math.cos(-rotation);
      const sin = Math.sin(-rotation);
      const localX = dx * cos - dz * sin;
      const localZ = dx * sin + dz * cos;
      
      if (Math.abs(localX) < halfW && Math.abs(localZ) < halfD) {
        const platformTop = py + 0.15;
        if (playerPos.y <= platformTop + 0.5 && playerPos.y > platformTop - 1) {
          playerPos.y = platformTop;
          this.state.velocity.y = 0;
          this.state._grounded = true;
          return;
        }
      }
    }
  }
  
  applyBounds() {
    const pos = this.state.camera.position;
    
    if (this.state.levelActive) {
      if (this.collisionSystem) {
        this.collisionSystem.checkWallCollision(pos);
      }
      
      if (this.state.levelBounds) {
        const bounds = this.state.levelBounds;
        if (pos.x > bounds.maxX) { pos.x = bounds.maxX; this.state.velocity.x = 0; }
        if (pos.x < bounds.minX) { pos.x = bounds.minX; this.state.velocity.x = 0; }
        if (pos.z > bounds.maxZ) { pos.z = bounds.maxZ; this.state.velocity.z = 0; }
        if (pos.z < bounds.minZ) { pos.z = bounds.minZ; this.state.velocity.z = 0; }
      }
    }
    
    if (this.state.phase === 'office') {
      const lim = 5;
      if (pos.x > lim) pos.x = lim;
      if (pos.x < -lim) pos.x = -lim;
      if (pos.z > lim) pos.z = lim;
      if (pos.z < -lim) pos.z = -lim;
    }
  }
  
  setCollisionSystem(collisionSystem) {
    this.collisionSystem = collisionSystem;
  }
  
  resetVelocity() {
    this.state.velocity.set(0, 0, 0);
  }
}

export default MovementPhysics;
