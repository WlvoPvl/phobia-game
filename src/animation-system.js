// 动画系统 - 用于小丑、机械装置等动态物体
import * as THREE from 'three';

export class AnimationSystem {
  constructor() {
    this.animations = new Map();
    this.clips = {};
  }
  
  createBobAnimation(mesh, config = {}) {
    const amplitude = config.amplitude || 0.1;
    const frequency = config.frequency || 1;
    const phase = config.phase || 0;
    const axis = config.axis || 'y';
    
    const originalPosition = mesh.position.clone();
    
    const anim = {
      type: 'bob',
      mesh,
      originalPosition,
      amplitude,
      frequency,
      phase,
      axis,
      update: function(time) {
        const offset = Math.sin(time * this.frequency + this.phase) * this.amplitude;
        if (this.axis === 'y') {
          this.mesh.position.y = this.originalPosition.y + offset;
        } else if (this.axis === 'x') {
          this.mesh.position.x = this.originalPosition.x + offset;
        } else if (this.axis === 'z') {
          this.mesh.position.z = this.originalPosition.z + offset;
        }
      }
    };
    
    this.animations.set(mesh.uuid, anim);
    return anim;
  }
  
  createRotateAnimation(mesh, config = {}) {
    const speed = config.speed || 1;
    const axis = config.axis || 'y';
    const range = config.range || null;
    const centerAngle = config.centerAngle || 0;
    
    const anim = {
      type: 'rotate',
      mesh,
      speed,
      axis,
      range,
      centerAngle,
      time: 0,
      update: function(dt) {
        this.time += dt * this.speed;
        
        let angle = this.time;
        if (this.range) {
          angle = this.centerAngle + Math.sin(this.time) * this.range;
        }
        
        if (this.axis === 'y') {
          this.mesh.rotation.y = angle;
        } else if (this.axis === 'x') {
          this.mesh.rotation.x = angle;
        } else if (this.axis === 'z') {
          this.mesh.rotation.z = angle;
        }
      }
    };
    
    this.animations.set(mesh.uuid, anim);
    return anim;
  }
  
  createPathAnimation(mesh, pathPoints, config = {}) {
    const speed = config.speed || 1;
    const loop = config.loop !== false;
    const onComplete = config.onComplete || null;
    
    let t = 0;
    let completed = false;
    
    const anim = {
      type: 'path',
      mesh,
      pathPoints,
      speed,
      loop,
      t,
      completed,
      onComplete,
      update: function(dt) {
        if (this.completed) return;
        
        this.t += dt * this.speed;
        
        if (this.t >= 1) {
          if (this.loop) {
            this.t = this.t % 1;
          } else {
            this.t = 1;
            this.completed = true;
            this.onComplete?.();
          }
        }
        
        const index = Math.floor(this.t * (this.pathPoints.length - 1));
        const nextIndex = Math.min(index + 1, this.pathPoints.length - 1);
        const localT = (this.t * (this.pathPoints.length - 1)) % 1;
        
        this.mesh.position.lerpVectors(
          this.pathPoints[index],
          this.pathPoints[nextIndex],
          localT
        );
      }
    };
    
    this.animations.set(mesh.uuid, anim);
    return anim;
  }
  
  createScaleAnimation(mesh, config = {}) {
    const minScale = config.minScale || 0.8;
    const maxScale = config.maxScale || 1.2;
    const frequency = config.frequency || 1;
    const originalScale = mesh.scale.clone();
    
    const anim = {
      type: 'scale',
      mesh,
      originalScale,
      minScale,
      maxScale,
      frequency,
      update: function(time) {
        const s = this.minScale + (this.maxScale - this.minScale) * 
          (0.5 + 0.5 * Math.sin(time * this.frequency));
        this.mesh.scale.set(
          this.originalScale.x * s,
          this.originalScale.y * s,
          this.originalScale.z * s
        );
      }
    };
    
    this.animations.set(mesh.uuid, anim);
    return anim;
  }
  
  createShakeAnimation(mesh, config = {}) {
    const intensity = config.intensity || 0.1;
    const duration = config.duration || 1;
    const frequency = config.frequency || 20;
    const originalPosition = mesh.position.clone();
    
    let elapsed = 0;
    
    const anim = {
      type: 'shake',
      mesh,
      intensity,
      duration,
      frequency,
      originalPosition,
      elapsed,
      update: function(dt) {
        if (this.elapsed >= this.duration) {
          this.mesh.position.copy(this.originalPosition);
          return true;
        }
        
        this.elapsed += dt;
        
        const decay = 1 - (this.elapsed / this.duration);
        const shake = this.intensity * decay;
        
        this.mesh.position.set(
          this.originalPosition.x + (Math.random() - 0.5) * shake,
          this.originalPosition.y + (Math.random() - 0.5) * shake,
          this.originalPosition.z + (Math.random() - 0.5) * shake
        );
        
        return false;
      },
      stop: function() {
        this.mesh.position.copy(this.originalPosition);
      }
    };
    
    this.animations.set(mesh.uuid, anim);
    return anim;
  }
  
  createPulseAnimation(mesh, config = {}) {
    const minIntensity = config.minIntensity || 0.3;
    const maxIntensity = config.maxIntensity || 1;
    const frequency = config.frequency || 2;
    const material = mesh.material;
    
    const originalEmissive = material.emissive?.clone();
    const originalEmissiveIntensity = material.emissiveIntensity;
    
    const anim = {
      type: 'pulse',
      mesh,
      material,
      minIntensity,
      maxIntensity,
      frequency,
      originalEmissive,
      originalEmissiveIntensity,
      update: function(time) {
        if (!this.material.emissive) return;
        
        const intensity = this.minIntensity + 
          (this.maxIntensity - this.minIntensity) * 
          (0.5 + 0.5 * Math.sin(time * this.frequency));
        
        this.material.emissiveIntensity = intensity;
      }
    };
    
    this.animations.set(mesh.uuid, anim);
    return anim;
  }
  
  createClownAnimation(clownMesh) {
    const parts = {
      head: clownMesh.getObjectByName('head'),
      leftArm: clownMesh.getObjectByName('leftArm'),
      rightArm: clownMesh.getObjectByName('rightArm'),
      body: clownMesh.getObjectByName('body')
    };
    
    const time = { value: 0 };
    
    const anim = {
      type: 'clown',
      mesh: clownMesh,
      parts,
      time,
      state: 'idle',
      update: function(dt) {
        this.time.value += dt;
        
        const t = this.time.value;
        
        if (this.parts.head) {
          this.parts.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        }
        
        if (this.parts.leftArm) {
          this.parts.leftArm.rotation.z = Math.sin(t * 2) * 0.2;
        }
        
        if (this.parts.rightArm) {
          this.parts.rightArm.rotation.z = Math.sin(t * 2 + Math.PI) * 0.2;
        }
        
        if (this.parts.body) {
          this.parts.body.position.y = Math.sin(t) * 0.05;
        }
      },
      setState: function(newState) {
        this.state = newState;
      }
    };
    
    this.animations.set(clownMesh.uuid, anim);
    return anim;
  }
  
  update(dt, time = 0) {
    const toRemove = [];
    
    this.animations.forEach((anim, uuid) => {
      const finished = anim.update(dt, time);
      if (finished === true) {
        toRemove.push(uuid);
      }
    });
    
    toRemove.forEach(uuid => this.animations.delete(uuid));
  }
  
  stop(mesh) {
    const anim = this.animations.get(mesh?.uuid);
    if (anim && anim.stop) {
      anim.stop();
    }
    this.animations.delete(mesh?.uuid);
  }
  
  stopAll() {
    this.animations.forEach(anim => {
      if (anim.stop) anim.stop();
    });
    this.animations.clear();
  }
  
  getAnimation(mesh) {
    return this.animations.get(mesh?.uuid);
  }
  
  hasAnimation(mesh) {
    return this.animations.has(mesh?.uuid);
  }
}

export const animationSystem = new AnimationSystem();
export default AnimationSystem;