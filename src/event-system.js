// 事件系统模块 - 借鉴游戏引擎的最佳实践
// 提供模块间的解耦通信机制

export class EventSystem {
  constructor() {
    this.listeners = new Map();
    this.oneTimeListeners = new Map();
    this.errorHandler = null; // 全局错误处理器
  }

  /**
   * 设置全局错误处理器
   * @param {Function} handler - 错误处理函数
   */
  setErrorHandler(handler) {
    this.errorHandler = handler;
  }

  /**
   * 注册事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {Object} context - 上下文（可选）
   */
  on(event, callback, context = null) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event).push({ callback, context });
  }

  /**
   * 注册一次性事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {Object} context - 上下文（可选）
   */
  once(event, callback, context = null) {
    if (!this.oneTimeListeners.has(event)) {
      this.oneTimeListeners.set(event, []);
    }

    this.oneTimeListeners.get(event).push({ callback, context });
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数（可选，不传则移除所有）
   */
  off(event, callback = null) {
    if (callback === null) {
      this.listeners.delete(event);
      this.oneTimeListeners.delete(event);
    } else {
      if (this.listeners.has(event)) {
        const listeners = this.listeners.get(event);
        const index = listeners.findIndex(l => l.callback === callback);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }

      if (this.oneTimeListeners.has(event)) {
        const listeners = this.oneTimeListeners.get(event);
        const index = listeners.findIndex(l => l.callback === callback);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }
    }
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {...*} args - 事件参数
   * @returns {boolean} 事件是否成功触发
   */
  emit(event, ...args) {
    let success = true;
    
    // 触发常规监听器
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event).slice(); // 复制数组避免修改
      for (const { callback, context } of listeners) {
        try {
          if (context) {
            callback.call(context, ...args);
          } else {
            callback(...args);
          }
        } catch (error) {
          console.error(`[EventSystem] Error in event "${event}":`, error);
          success = false;
          // 调用全局错误处理器
          if (this.errorHandler) {
            this.errorHandler(event, error, callback);
          }
        }
      }
    }

    // 触发一次性监听器
    if (this.oneTimeListeners.has(event)) {
      const listeners = this.oneTimeListeners.get(event);
      for (const { callback, context } of listeners) {
        try {
          if (context) {
            callback.call(context, ...args);
          } else {
            callback(...args);
          }
        } catch (error) {
          console.error(`[EventSystem] Error in one-time event "${event}":`, error);
          success = false;
          // 调用全局错误处理器
          if (this.errorHandler) {
            this.errorHandler(event, error, callback);
          }
        }
      }
      this.oneTimeListeners.delete(event);
    }
    
    return success;
  }

  /**
   * 清除所有事件监听器
   */
  clear() {
    this.listeners.clear();
    this.oneTimeListeners.clear();
  }

  /**
   * 获取特定事件的监听器数量
   * @param {string} event - 事件名称
   * @returns {number} 监听器数量
   */
  listenerCount(event) {
    const regular = this.listeners.has(event) ? this.listeners.get(event).length : 0;
    const once = this.oneTimeListeners.has(event) ? this.oneTimeListeners.get(event).length : 0;
    return regular + once;
  }

  /**
   * 获取所有注册的事件名称
   * @returns {string[]} 事件名称数组
   */
  getAllEvents() {
    return [...this.listeners.keys(), ...this.oneTimeListeners.keys()];
  }
}

// 预定义的事件名称常量
export const GameEvents = {
  // 游戏状态事件
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  GAME_EXIT: 'game:exit',
  
  // 关卡事件
  LEVEL_START: 'level:start',
  LEVEL_COMPLETE: 'level:complete',
  LEVEL_FAILED: 'level:failed',
  LEVEL_EXIT: 'level:exit',
  
  // 玩家事件
  PLAYER_MOVE: 'player:move',
  PLAYER_JUMP: 'player:jump',
  PLAYER_INTERACT: 'player:interact',
  PLAYER_SANITY_CHANGE: 'player:sanity:change',
  PLAYER_DEATH: 'player:death',
  
  // UI事件
  UI_DIALOGUE_START: 'ui:dialogue:start',
  UI_DIALOGUE_END: 'ui:dialogue:end',
  UI_BOOK_OPEN: 'ui:book:open',
  UI_BOOK_CLOSE: 'ui:book:close',
  UI_SETTINGS_OPEN: 'ui:settings:open',
  UI_SETTINGS_CLOSE: 'ui:settings:close',
  
  // 系统事件
  SYSTEM_ERROR: 'system:error',
  SYSTEM_WARNING: 'system:warning',
  SYSTEM_PERFORMANCE: 'system:performance',
  
  // 编辑器事件
  EDITOR_MODE_TOGGLE: 'editor:mode:toggle',
  EDITOR_OBJECT_SELECT: 'editor:object:select',
  EDITOR_OBJECT_MOVE: 'editor:object:move',
  EDITOR_SAVE: 'editor:save'
};

// 全局事件总线实例
export const eventBus = new EventSystem();

export default EventSystem;