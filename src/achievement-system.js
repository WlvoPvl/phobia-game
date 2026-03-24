// 成就系统 - 游戏成就与统计
export class AchievementSystem {
  constructor() {
    this.achievements = {
      first_level: {
        id: 'first_level',
        name: '初次直面',
        description: '完成第一个关卡',
        icon: '🎯',
        unlocked: false,
        unlockedAt: null
      },
      all_levels: {
        id: 'all_levels',
        name: '无畏者',
        description: '完成所有关卡',
        icon: '🏆',
        unlocked: false,
        unlockedAt: null
      },
      no_damage: {
        id: 'no_damage',
        name: '完美主义者',
        description: '以100%理智完成一个关卡',
        icon: '💎',
        unlocked: false,
        unlockedAt: null
      },
      speedrunner: {
        id: 'speedrunner',
        name: '速通专家',
        description: '在30秒内完成第一关',
        icon: '⚡',
        unlocked: false,
        unlockedAt: null
      },
      brave_heart: {
        id: 'brave_heart',
        name: '勇敢的心',
        description: '在理智低于10%时完成关卡',
        icon: '❤️',
        unlocked: false,
        unlockedAt: null
      },
      collector: {
        id: 'collector',
        name: '收藏家',
        description: '体验所有关卡（不限成功失败）',
        icon: '📚',
        unlocked: false,
        unlockedAt: null
      },
      night_owl: {
        id: 'night_owl',
        name: '夜猫子',
        description: '完成黑暗恐惧关卡',
        icon: '🌙',
        unlocked: false,
        unlockedAt: null
      },
      arachnologist: {
        id: 'arachnologist',
        name: '蜘蛛学家',
        description: '完成蜘蛛恐惧关卡',
        icon: '🕷️',
        unlocked: false,
        unlockedAt: null
      },
      height_master: {
        id: 'height_master',
        name: '高空大师',
        description: '恐高症关卡不坠落一次',
        icon: '🗼',
        unlocked: false,
        unlockedAt: null
      }
    };
    
    this.stats = {
      totalPlayTime: 0,
      levelsPlayed: 0,
      levelsCompleted: 0,
      totalSanityLost: 0,
      highestLevel: 0,
      deaths: 0,
      jumpsScares: 0
    };
    
    this.load();
  }
  
  unlock(achievementId) {
    if (this.achievements[achievementId] && !this.achievements[achievementId].unlocked) {
      this.achievements[achievementId].unlocked = true;
      this.achievements[achievementId].unlockedAt = Date.now();
      this.save();
      this.showNotification(this.achievements[achievementId]);
      return true;
    }
    return false;
  }
  
  isUnlocked(achievementId) {
    return this.achievements[achievementId]?.unlocked || false;
  }
  
  getUnlockedCount() {
    return Object.values(this.achievements).filter(a => a.unlocked).length;
  }
  
  getTotalCount() {
    return Object.keys(this.achievements).length;
  }
  
  updateStat(statName, value) {
    if (this.stats.hasOwnProperty(statName)) {
      if (typeof value === 'number') {
        this.stats[statName] += value;
      } else {
        this.stats[statName] = value;
      }
      this.save();
    }
  }
  
  showNotification(achievement) {
    const notification = document.createElement('div');
    notification.id = 'achievement-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #2a1f14, #4a3020);
      border: 2px solid #d4af37;
      border-radius: 12px;
      padding: 16px 24px;
      color: #f5deb3;
      font-family: 'Segoe UI', sans-serif;
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      animation: slideIn 0.5s ease-out;
    `;
    
    notification.innerHTML = `
      <span style="font-size: 32px;">${achievement.icon}</span>
      <div>
        <div style="color: #d4af37; font-weight: bold;">成就解锁!</div>
        <div style="font-weight: bold;">${achievement.name}</div>
        <div style="font-size: 12px; opacity: 0.8;">${achievement.description}</div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s';
      setTimeout(() => notification.remove(), 500);
    }, 4000);
  }
  
  createUI() {
    const container = document.createElement('div');
    container.id = 'achievements-panel';
    container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(20, 15, 10, 0.95);
      border: 2px solid #8b4513;
      border-radius: 16px;
      padding: 24px;
      max-width: 500px;
      max-height: 70vh;
      overflow-y: auto;
      z-index: 1000;
      color: #f5deb3;
      font-family: 'Segoe UI', sans-serif;
      display: none;
    `;
    
    const unlockedCount = this.getUnlockedCount();
    const totalCount = this.getTotalCount();
    
    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid #8b4513; padding-bottom: 16px;">
        <h2 style="color: #d4af37; margin: 0 0 8px 0;">🏆 成就</h2>
        <div style="font-size: 14px; opacity: 0.8;">${unlockedCount} / ${totalCount}</div>
      </div>
      <div id="achievements-list"></div>
      <div style="text-align: center; margin-top: 20px;">
        <button id="close-achievements" style="
          background: #8b4513;
          color: #f5deb3;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        ">关闭</button>
      </div>
    `;
    
    document.body.appendChild(container);
    
    const list = container.querySelector('#achievements-list');
    Object.values(this.achievements).forEach(ach => {
      const item = document.createElement('div');
      item.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        margin-bottom: 8px;
        background: ${ach.unlocked ? 'rgba(212, 175, 55, 0.1)' : 'rgba(0,0,0,0.3)'};
        border-radius: 8px;
        opacity: ${ach.unlocked ? 1 : 0.5};
      `;
      item.innerHTML = `
        <span style="font-size: 24px;">${ach.icon}</span>
        <div>
          <div style="font-weight: bold;">${ach.name}</div>
          <div style="font-size: 12px; opacity: 0.7;">${ach.description}</div>
        </div>
      `;
      list.appendChild(item);
    });
    
    container.querySelector('#close-achievements').onclick = () => {
      container.style.display = 'none';
    };
    
    return container;
  }
  
  show() {
    let panel = document.getElementById('achievements-panel');
    if (!panel) {
      panel = this.createUI();
    }
    panel.style.display = 'block';
  }
  
  save() {
    try {
      const data = {
        achievements: this.achievements,
        stats: this.stats
      };
      localStorage.setItem('phobia_achievements', JSON.stringify(data));
    } catch (e) {
      console.warn('[Achievements] Save failed:', e);
    }
  }
  
  load() {
    try {
      const saved = localStorage.getItem('phobia_achievements');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.achievements) {
          this.achievements = { ...this.achievements, ...data.achievements };
        }
        if (data.stats) {
          this.stats = { ...this.stats, ...data.stats };
        }
      }
    } catch (e) {
      console.warn('[Achievements] Load failed:', e);
    }
  }
}

export const achievements = new AchievementSystem();
export default AchievementSystem;