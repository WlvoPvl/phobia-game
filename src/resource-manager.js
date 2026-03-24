// 资源管理器 - 统一 Three.js 资源清理
// 借鉴 Unity 的 IDisposable 模式和 Godot 的 _notification 机制

import * as THREE from 'three';

export class ResourceManager {
  constructor() {
    // 跟踪所有可清理资源
    this.disposables = new Map(); // id -> disposable object
    this.resourceCounter = 0;
  }

  /**
   * 注册可清理资源
   * @param {Object} resource - 包含 dispose() 方法的对象
   * @param {string} name - 资源名称（用于调试）
   * @returns {number} 资源 ID
   */
  register(resource, name = 'anonymous') {
    if (!resource || typeof resource.dispose !== 'function') {
      console.warn('[ResourceManager] Resource has no dispose method:', name);
      return -1;
    }

    const id = ++this.resourceCounter;
    this.disposables.set(id, { resource, name, createdAt: Date.now() });
    return id;
  }

  /**
   * 注销资源（不调用 dispose）
   * @param {number} id - 资源 ID
   */
  unregister(id) {
    this.disposables.delete(id);
  }

  /**
   * 清理单个资源
   * @param {number} id - 资源 ID
   * @returns {boolean} 是否清理成功
   */
  dispose(id) {
    const item = this.disposables.get(id);
    if (!item) return false;

    try {
      this._disposeObject(item.resource);
      this.disposables.delete(id);
      return true;
    } catch (e) {
      console.error('[ResourceManager] Dispose failed:', item.name, e);
      return false;
    }
  }

  /**
   * 清理 Three.js 对象及其子资源
   * @param {THREE.Object3D} object - 要清理的对象
   */
  disposeObject(object) {
    if (!object) return;

    object.traverse((child) => {
      this._disposeObject(child);
    });

    this._disposeObject(object);
  }

  /**
   * 内部清理方法
   */
  _disposeObject(obj) {
    if (!obj) return;

    // 清理几何体
    if (obj.geometry) {
      obj.geometry.dispose();
      obj.geometry = null;
    }

    // 清理材质
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(m => this._disposeMaterial(m));
      } else {
        this._disposeMaterial(obj.material);
      }
      obj.material = null;
    }

    // 清理纹理
    if (obj.texture) {
      this._disposeTexture(obj.texture);
      obj.texture = null;
    }

    // 清理 userData 中可能持有的资源
    if (obj.userData) {
      Object.values(obj.userData).forEach(value => {
        if (value && typeof value.dispose === 'function') {
          value.dispose();
        }
      });
    }
  }

  /**
   * 清理材质
   */
  _disposeMaterial(material) {
    if (!material) return;

    // 清理材质上的纹理
    for (const key in material) {
      const value = material[key];
      if (value && value.isTexture) {
        this._disposeTexture(value);
      }
    }

    material.dispose();
  }

  /**
   * 清理纹理
   */
  _disposeTexture(texture) {
    if (!texture) return;

    texture.dispose();

    // 清理纹理的 image
    if (texture.image && typeof texture.image.dispose === 'function') {
      texture.image.dispose();
    }
  }

  /**
   * 批量清理所有资源
   * @param {string} filter - 可选的过滤器函数
   */
  disposeAll(filter = null) {
    const toDispose = [];

    for (const [id, item] of this.disposables) {
      if (!filter || filter(item)) {
        toDispose.push(id);
      }
    }

    const results = { success: 0, failed: 0, errors: [] };

    for (const id of toDispose) {
      if (this.dispose(id)) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push(id);
      }
    }

    return results;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalResources: this.disposables.size,
      resources: Array.from(this.disposables.values()).map(item => ({
        id: item.id,
        name: item.name,
        age: Date.now() - item.createdAt
      }))
    };
  }

  /**
   * 清理渲染目标
   */
  disposeRenderTarget(renderTarget) {
    if (!renderTarget) return;

    if (renderTarget.dispose) {
      renderTarget.dispose();
    }

    if (renderTarget.texture) {
      this._disposeTexture(renderTarget.texture);
    }
  }

  /**
   * 清理渲染器
   */
  disposeRenderer(renderer) {
    if (!renderer) return;

    // 清理渲染器的内部资源
    if (renderer.dispose) {
      renderer.dispose();
    }

    // 清理 DOM 元素
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }

  /**
   * 清理场景
   */
  disposeScene(scene) {
    if (!scene) return;

    this.disposeObject(scene);

    // 清理场景本身
    if (scene.dispose) {
      scene.dispose();
    }
  }
}

// 全局资源管理器实例
export const resourceManager = new ResourceManager();

// 工具函数：安全的 dispose
export function safeDispose(obj) {
  if (!obj) return;

  try {
    if (typeof obj.dispose === 'function') {
      obj.dispose();
    }
  } catch (e) {
    console.warn('[safeDispose] Failed to dispose:', e);
  }
}

// 工具函数：批量清理数组
export function disposeArray(array) {
  if (!Array.isArray(array)) return;

  for (let i = array.length - 1; i >= 0; i--) {
    safeDispose(array[i]);
    array[i] = null;
  }
  array.length = 0;
}

export default ResourceManager;
