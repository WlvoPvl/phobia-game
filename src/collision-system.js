// 碰撞系统模块 - 从main.js拆分
// 处理墙壁碰撞检测

import * as THREE from 'three';

export class CollisionSystem {
  constructor(state) {
    this.state = state;
    this.playerRadius = 0.4; // 玩家碰撞半径
  }
  
  checkWallCollision(playerPos) {
    if (!this.state.levelScene) return;
    
    // 遍历关卡场景中的所有网格
    this.state.levelScene.traverse((object) => {
      if (!object.isMesh) return;
      
      // 只检测墙壁类型的对象（根据几何体形状判断）
      const geometry = object.geometry;
      if (!geometry || !geometry.parameters) return;
      
      const params = geometry.parameters;
      // 检测墙壁：宽度或深度很薄（<0.5）但高度较高的对象
      const isWall = (params.width && params.width < 0.5 && params.height > 1) ||
                     (params.width && params.depth && params.width > 1 && params.depth < 0.5 && params.height > 1);
      
      if (!isWall) return;
      
      // 获取墙壁的世界边界
      const wallBox = new THREE.Box3().setFromObject(object);
      
      // 检查玩家是否在墙壁范围内
      const playerSphere = new THREE.Sphere(playerPos.clone(), this.playerRadius);
      
      if (wallBox.intersectsSphere(playerSphere)) {
        // 计算推离方向
        const wallCenter = new THREE.Vector3();
        wallBox.getCenter(wallCenter);
        
        const pushDir = new THREE.Vector3().subVectors(playerPos, wallCenter);
        pushDir.y = 0; // 只在水平方向推离
        
        if (pushDir.length() > 0) {
          pushDir.normalize();
          
          // 计算需要推离的距离
          const overlap = this.playerRadius + 0.1;
          const closestPoint = new THREE.Vector3().copy(playerPos);
          closestPoint.x = Math.max(wallBox.min.x, Math.min(wallBox.max.x, closestPoint.x));
          closestPoint.y = Math.max(wallBox.min.y, Math.min(wallBox.max.y, closestPoint.y));
          closestPoint.z = Math.max(wallBox.min.z, Math.min(wallBox.max.z, closestPoint.z));
          
          const dist = playerPos.distanceTo(closestPoint);
          if (dist < this.playerRadius) {
            const pushAmount = this.playerRadius - dist + 0.05;
            playerPos.add(pushDir.multiplyScalar(pushAmount));
            
            // 阻止朝墙壁方向的移动速度
            const velDotPush = this.state.velocity.x * pushDir.x + this.state.velocity.z * pushDir.z;
            if (velDotPush < 0) {
              this.state.velocity.x -= velDotPush * pushDir.x;
              this.state.velocity.z -= velDotPush * pushDir.z;
            }
          }
        }
      }
    });
  }
  
  checkBounds() {
    const pos = this.state.camera.position;
    
    if (this.state.levelActive) {
      // 检查关卡边界
      if (this.state.levelBounds) {
        const bounds = this.state.levelBounds;
        if (pos.x > bounds.maxX) { pos.x = bounds.maxX; this.state.velocity.x = Math.min(0, this.state.velocity.x); }
        if (pos.x < bounds.minX) { pos.x = bounds.minX; this.state.velocity.x = Math.max(0, this.state.velocity.x); }
        if (pos.z > bounds.maxZ) { pos.z = bounds.maxZ; this.state.velocity.z = Math.min(0, this.state.velocity.z); }
        if (pos.z < bounds.minZ) { pos.z = bounds.minZ; this.state.velocity.z = Math.max(0, this.state.velocity.z); }
      }
    }
    
    if (this.state.phase === 'office') {
      const lim = 5; // CONFIG.bounds.office
      if (pos.x > lim) pos.x = lim;
      if (pos.x < -lim) pos.x = -lim;
      if (pos.z > lim) pos.z = lim;
      if (pos.z < -lim) pos.z = -lim;
    }
  }
}

export default CollisionSystem;