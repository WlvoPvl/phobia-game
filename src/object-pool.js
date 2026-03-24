// 对象池模块 - 优化对象创建和销毁
// 借鉴游戏引擎的最佳实践，减少垃圾回收压力

export class ObjectPool {
  /**
   * @param {Function} createFn - 创建新对象的函数
   * @param {Function} resetFn - 重置对象的函数
   * @param {number} initialSize - 初始池大小
   */
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    this.activeCount = 0;
    
    // 预创建对象
    this.expand(initialSize);
  }
  
  /**
   * 从池中获取对象
   * @param {...*} args - 传递给重置函数的参数
   * @returns {Object} 池中的对象
   */
  acquire(...args) {
    let obj;
    
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.createFn();
      console.log('[ObjectPool] Pool exhausted, created new object');
    }
    
    this.activeCount++;
    
    // 重置对象状态
    if (this.resetFn) {
      this.resetFn(obj, ...args);
    }
    
    return obj;
  }
  
  /**
   * 将对象归还到池中
   * @param {Object} obj - 要归还的对象
   */
  release(obj) {
    if (obj && this.activeCount > 0) {
      this.pool.push(obj);
      this.activeCount--;
    }
  }
  
  /**
   * 扩展池大小
   * @param {number} count - 要创建的对象数量
   */
  expand(count) {
    for (let i = 0; i < count; i++) {
      this.pool.push(this.createFn());
    }
  }
  
  /**
   * 清空池
   */
  clear() {
    this.pool = [];
    this.activeCount = 0;
  }
  
  /**
   * 获取池统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      poolSize: this.pool.length,
      activeCount: this.activeCount,
      totalCreated: this.pool.length + this.activeCount
    };
  }
}

/**
 * 3D对象池 - 专门为Three.js对象设计
 */
export class GameObjectPool extends ObjectPool {
  /**
   * @param {Function} createFn - 创建函数
   * @param {Function|number} resetFnOrSize - 重置函数或初始大小
   * @param {number} initialSize - 初始大小（如果第二个参数是函数）
   */
  constructor(createFn, resetFnOrSize = 10, initialSize = 10) {
    let resetFn;
    let size;

    // 支持两种调用方式:
    // 1. new GameObjectPool(createFn, initialSize)
    // 2. new GameObjectPool(createFn, resetFn, initialSize)
    if (typeof resetFnOrSize === 'function') {
      resetFn = resetFnOrSize;
      size = initialSize;
    } else {
      resetFn = (obj, position, rotation, scale) => {
        if (position && obj.mesh) {
          obj.mesh.position.copy(position);
        } else if (position && obj.position) {
          obj.position.copy(position);
        }
        if (rotation && obj.rotation) obj.rotation.copy(rotation);
        if (scale) {
          if (obj.mesh) obj.mesh.scale.setScalar(scale);
          else if (obj.scale) obj.scale.setScalar(scale);
        }
        if (obj.mesh) obj.mesh.visible = true;
        if (obj.visible !== undefined) obj.visible = true;
      };
      size = resetFnOrSize;
    }

    super(createFn, resetFn, size);
  }
  
  /**
   * 获取并显示对象
   * @param {THREE.Vector3} position - 位置
   * @param {THREE.Euler} rotation - 旋转
   * @param {THREE.Vector3} scale - 缩放
   * @returns {THREE.Object3D} 3D对象
   */
  spawn(position, rotation, scale) {
    const obj = this.acquire(position, rotation, scale);
    obj.visible = true;
    return obj;
  }
  
  /**
   * 隐藏并归还对象
   * @param {THREE.Object3D} obj - 3D对象
   */
  despawn(obj) {
    obj.visible = false;
    this.release(obj);
  }
}

/**
 * 预定义的对象池工厂
 */
export const ObjectPoolFactory = {
  // 蜘蛛对象池
  createSpiderPool(scene, initialSize = 20) {
    // 这里需要根据实际的蜘蛛创建逻辑来实现
    // 示例实现
    const createFn = () => {
      // 创建蜘蛛几何体和材质
      const geometry = new THREE.BoxGeometry(0.3, 0.1, 0.4);
      const material = new THREE.MeshLambertMaterial({ color: 0x222222 });
      const spider = new THREE.Mesh(geometry, material);
      spider.visible = false;
      scene.add(spider);
      return spider;
    };
    
    return new GameObjectPool(createFn, initialSize);
  },
  
  // 粒子对象池
  createParticlePool(scene, initialSize = 100) {
    const createFn = () => {
      const geometry = new THREE.SphereGeometry(0.05, 4, 4);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const particle = new THREE.Mesh(geometry, material);
      particle.visible = false;
      scene.add(particle);
      return particle;
    };
    
    return new GameObjectPool(createFn, initialSize);
  },
  
  // 投射物对象池
  createProjectilePool(scene, initialSize = 30) {
    const createFn = () => {
      const geometry = new THREE.SphereGeometry(0.1, 8, 8);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const projectile = new THREE.Mesh(geometry, material);
      projectile.visible = false;
      projectile.userData.velocity = new THREE.Vector3();
      scene.add(projectile);
      return projectile;
    };
    
    const resetFn = (obj, position, velocity) => {
      if (position) obj.position.copy(position);
      if (velocity) obj.userData.velocity.copy(velocity);
      obj.visible = true;
    };
    
    return new GameObjectPool(createFn, resetFn, initialSize);
  }
};

export default ObjectPool;