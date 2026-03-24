// 存档管理系统 - 增强的存档功能
// 支持版本迁移和向后兼容

export class SaveManager {
  constructor(saveKey = 'phobia_game_save') {
    this.saveKey = saveKey;
    this.version = '1.0.0';
    this.supportedVersions = ['1.0.0', '1.0.1', '1.1.0']; // 支持的版本列表
  }

  /**
   * 检查版本是否兼容
   * @param {string} version - 版本号
   * @returns {boolean} 是否兼容
   */
  isCompatibleVersion(version) {
    if (!version) return false;
    const [major] = version.split('.').map(Number);
    const [currentMajor] = this.version.split('.').map(Number);
    // 主版本号相同则兼容
    return major === currentMajor;
  }

  /**
   * 迁移存档数据到当前版本
   * @param {Object} data - 原始存档数据
   * @param {string} fromVersion - 原始版本
   * @returns {Object} 迁移后的数据
   */
  migrateSaveData(data, fromVersion) {
    const migrated = { ...data };
    const [fromMajor, fromMinor] = fromVersion.split('.').map(Number);
    const [toMajor, toMinor] = this.version.split('.').map(Number);

    // 版本迁移逻辑
    if (fromMajor === 1 && fromMinor === 0) {
      // 1.0.x -> 1.1.0 迁移
      if (toMinor >= 1) {
        // 添加新字段
        if (!migrated.settings) {
          migrated.settings = {
            brightness: 1.0,
            shadows: 'medium',
            vsync: true,
            masterVolume: 0.7,
            sfxVolume: 0.8,
            musicVolume: 0.5
          };
        }
        if (!migrated.achievements) {
          migrated.achievements = [];
        }
      }
    }

    migrated.version = this.version;
    migrated.migratedAt = Date.now();
    return migrated;
  }

  save(data) {
    try {
      const saveData = {
        version: this.version,
        timestamp: Date.now(),
        ...data
      };
      localStorage.setItem(this.saveKey, JSON.stringify(saveData));
      return true;
    } catch (e) {
      console.error('[SaveManager] Save failed:', e);
      return false;
    }
  }

  load() {
    try {
      const saved = localStorage.getItem(this.saveKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (!data.version) {
          console.warn('[SaveManager] Save has no version, treating as incompatible');
          return null;
        }
        
        if (!this.isCompatibleVersion(data.version)) {
          console.warn(`[SaveManager] Incompatible version: ${data.version}, expected ${this.version}`);
          return null;
        }

        // 如果需要迁移
        if (data.version !== this.version) {
          console.log(`[SaveManager] Migrating from ${data.version} to ${this.version}`);
          return this.migrateSaveData(data, data.version);
        }

        return data;
      }
      return null;
    } catch (e) {
      console.error('[SaveManager] Load failed:', e);
      return null;
    }
  }

  remove() {
    localStorage.removeItem(this.saveKey);
  }

  exists() {
    return localStorage.getItem(this.saveKey) !== null;
  }

  exportToFile(filename = 'phobia-save.json') {
    const data = this.load();
    if (!data) return false;

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }

  importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (!data.version) {
            reject(new Error('Save file has no version'));
            return;
          }
          if (!this.isCompatibleVersion(data.version)) {
            reject(new Error(`Incompatible version: ${data.version}`));
            return;
          }
          // 迁移数据
          const migrated = data.version !== this.version 
            ? this.migrateSaveData(data, data.version) 
            : data;
          this.save(migrated);
          resolve(migrated);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // 游戏进度管理方法
  saveGameProgress(LEVELS) {
    try {
      const saveData = {
        version: this.version,
        timestamp: Date.now(),
        unlockedLevels: LEVELS.map(lv => lv.unlocked),
        highestLevelCompleted: LEVELS.findIndex(lv => !lv.unlocked) - 1
      };
      localStorage.setItem(this.saveKey, JSON.stringify(saveData));
      return true;
    } catch (e) {
      console.warn('保存失败:', e);
      return false;
    }
  }

  loadGameProgress(LEVELS) {
    try {
      const saved = localStorage.getItem(this.saveKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.unlockedLevels && Array.isArray(data.unlockedLevels)) {
          // 兼容不同长度的关卡数组
          data.unlockedLevels.forEach((unlocked, i) => {
            if (i < LEVELS.length && unlocked) {
              LEVELS[i].unlocked = true;
            }
          });
          return true;
        }
      }
      return false;
    } catch (e) {
      console.warn('加载存档失败:', e);
      return false;
    }
  }

  resetGameProgress(LEVELS) {
    try {
      localStorage.removeItem(this.saveKey);
      LEVELS.forEach((lv, i) => {
        lv.unlocked = i === 0; // 只解锁第一关
      });
      return true;
    } catch (e) {
      console.warn('重置失败:', e);
      return false;
    }
  }

  /**
   * 获取存档元数据（不加载完整数据）
   * @returns {Object|null} 元数据
   */
  getSaveMeta() {
    try {
      const saved = localStorage.getItem(this.saveKey);
      if (saved) {
        const data = JSON.parse(saved);
        return {
          version: data.version,
          timestamp: data.timestamp,
          migratedAt: data.migratedAt,
          hasUnlockedLevels: !!data.unlockedLevels,
          highestLevelCompleted: data.highestLevelCompleted
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}

export const saveManager = new SaveManager();
export default SaveManager;