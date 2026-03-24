// 怪物AI系统 - 参考Floodead的怪物行为模式
import * as THREE from 'three';

export class MonsterAI {
  constructor(mesh, config = {}) {
    this.mesh = mesh;
    this.state = 'idle';
    this.target = null;
    this.speed = config.speed || 2;
    this.detectionRange = config.detectionRange || 8;
    this.attackRange = config.attackRange || 1.5;
    this.patrolPoints = config.patrolPoints || [];
    this.patrolIndex = 0;
    this.waitTime = 0;
    this.maxWaitTime = config.waitTime || 2;
    this.scareTriggered = false;
    this.wanderAngle = 0;
  }
  
  setTarget(target) {
    this.target = target;
  }
  
  update(dt, playerPosition) {
    if (!this.mesh) return;
    
    const distance = playerPosition ? 
      this.mesh.position.distanceTo(playerPosition) : 999;
    
    switch(this.state) {
      case 'idle':
        this.updateIdle(dt, playerPosition, distance);
        break;
      case 'patrol':
        this.updatePatrol(dt, playerPosition, distance);
        break;
      case 'chase':
        this.updateChase(dt, playerPosition, distance);
        break;
      case 'attack':
        this.updateAttack(dt, playerPosition);
        break;
      case 'wander':
        this.updateWander(dt);
        break;
    }
  }
  
  updateIdle(dt, playerPosition, distance) {
    if (playerPosition && distance < this.detectionRange) {
      this.state = 'chase';
      this.mesh.userData.onDetect?.();
    } else if (this.patrolPoints.length > 0) {
      this.state = 'patrol';
    }
  }
  
  updatePatrol(dt, playerPosition, distance) {
    if (playerPosition && distance < this.detectionRange) {
      this.state = 'chase';
      this.mesh.userData.onDetect?.();
      return;
    }
    
    if (this.patrolPoints.length === 0) {
      this.state = 'wander';
      return;
    }
    
    const target = this.patrolPoints[this.patrolIndex];
    const direction = new THREE.Vector3().subVectors(target, this.mesh.position);
    const dist = direction.length();
    
    if (dist < 0.5) {
      this.waitTime += dt;
      if (this.waitTime >= this.maxWaitTime) {
        this.patrolIndex = (this.patrolIndex + 1) % this.patrolPoints.length;
        this.waitTime = 0;
      }
    } else {
      direction.normalize();
      this.mesh.position.add(direction.multiplyScalar(this.speed * dt * 0.5));
      this.lookAt(direction);
    }
  }
  
  updateChase(dt, playerPosition, distance) {
    if (!playerPosition) {
      this.state = 'patrol';
      return;
    }
    
    if (distance < this.attackRange) {
      this.state = 'attack';
      this.mesh.userData.onAttack?.();
      return;
    }
    
    if (distance > this.detectionRange * 1.5) {
      this.state = 'patrol';
      return;
    }
    
    const direction = new THREE.Vector3().subVectors(playerPosition, this.mesh.position);
    direction.normalize();
    this.mesh.position.add(direction.multiplyScalar(this.speed * dt));
    this.lookAt(direction);
  }
  
  updateAttack(dt, playerPosition) {
    this.mesh.userData.onAttack?.();
  }
  
  updateWander(dt) {
    this.wanderAngle += (Math.random() - 0.5) * 0.1;
    const direction = new THREE.Vector3(
      Math.sin(this.wanderAngle),
      0,
      Math.cos(this.wanderAngle)
    );
    this.mesh.position.add(direction.multiplyScalar(this.speed * dt * 0.3));
  }
  
  lookAt(direction) {
    if (direction.length() > 0.01) {
      const targetRotation = Math.atan2(direction.x, direction.z);
      this.mesh.rotation.y = THREE.MathUtils.lerp(
        this.mesh.rotation.y,
        targetRotation,
        0.1
      );
    }
  }
  
  triggerScare() {
    if (!this.scareTriggered) {
      this.scareTriggered = true;
      this.mesh.userData.onScare?.();
    }
  }
  
  reset() {
    this.state = 'idle';
    this.scareTriggered = false;
    this.waitTime = 0;
    this.target = null;
  }
  
  static createSpiderMesh(state) {
    const group = new THREE.Group();
    
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: 0x1a0a0a, 
      roughness: 0.9 
    });
    
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 8, 8),
      bodyMat
    );
    body.position.y = 0.3;
    group.add(body);
    
    const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5);
    for (let i = 0; i < 8; i++) {
      const leg = new THREE.Mesh(legGeo, bodyMat);
      const angle = (i / 8) * Math.PI * 2;
      leg.position.set(
        Math.cos(angle) * 0.2,
        0.2,
        Math.sin(angle) * 0.2
      );
      leg.rotation.z = Math.PI / 4;
      leg.rotation.y = angle;
      group.add(leg);
    }
    
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    [-0.1, 0.1].forEach(x => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), eyeMat);
      eye.position.set(x, 0.4, 0.2);
      group.add(eye);
    });
    
    return group;
  }
}

export default MonsterAI;