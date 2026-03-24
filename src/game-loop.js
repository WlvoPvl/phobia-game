// 游戏循环模块 - 从main.js拆分
// 处理动画循环和游戏更新

import * as THREE from 'three';
import { LEVELS } from './levels.js';
import { CONFIG } from './config.js';
import { performanceMonitorEnhanced } from './performance-monitor-enhanced.js';
import { eventBus, GameEvents } from './event-system.js';
import { Enhancements } from './enhancements.js';

export class GameLoop {
  constructor(state, systems) {
    this.state = state;
    this.systems = systems; // 包含其他系统实例的对象
    
    this.lastFootstepTime = 0;
    this.footstepInterval = 0.5; // 基础脚步间隔
    this.heartbeatHandle = null; // 心跳声控制
    this.lastSanity = state.sanity;
  }
  
  callLevelUpdate(state, dt) {
    const levelClass = LEVELS[state.levelIndex]?.levelClass;
    return levelClass ? levelClass.update(state, dt) : null;
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    // 性能监控：帧开始
    performanceMonitorEnhanced.beginFrame();
    
    const dt = Math.min(this.state.clock.getDelta(), 0.1);
    const time = this.state.clock.getElapsedTime();

    // 更新移动
    if (this.state.phase === 'office' || this.state.levelActive) {
      if (this.systems.movementPhysics) {
        this.systems.movementPhysics.update(dt);
      }
    }

    // 办公室逻辑
    if (this.state.phase === 'office') {
      if (this.systems.dialogueSystem) {
        this.systems.dialogueSystem.checkProximity();
      }
      // 咨询官空闲动画
      if (this.state.counselorGroup) {
        this.state.counselorGroup.children.forEach((child, i) => {
          if (child.position && child.position.y > 1.5) {
            child.position.y += Math.sin(time * 1.5 + i) * 0.0003;
          }
        });
      }
      // 书本发光脉冲
      if (this.state.bookMesh) {
        this.state.bookMesh.material.emissiveIntensity = 0.2 + Math.sin(time * 2) * 0.15;
      }
    }

    // 更新手电筒方向（跟随相机）- 只在手电筒不是相机子对象时更新
    if (this.state.playerFlashlight && this.state.levelActive && this.state.playerFlashlight.target.parent !== this.state.camera) {
      const dir = new THREE.Vector3();
      this.state.camera.getWorldDirection(dir);
      this.state.playerFlashlight.target.position.copy(this.state.camera.position).add(dir.multiplyScalar(10));
    }

    // 关卡更新
    if (this.state.levelActive) {
      const result = this.callLevelUpdate(this.state, dt);
      if (result === true) { this.endLevel(true); }
      else if (result === false) { this.endLevel(false); }

      // 测试模式：无敌
      if (this.state.godMode) {
        this.state.sanity = 100;
      }
      
      // 检查理智值变化并触发事件
      if (Math.abs(this.state.sanity - this.lastSanity) > 0.01) {
        eventBus.emit(GameEvents.PLAYER_SANITY_CHANGE, this.state.sanity, this.lastSanity);
        this.lastSanity = this.state.sanity;
      }

      // 低理智时播放心跳声 (不再使用rotation.z晃动以避免与PointerLockControls冲突)
      if (this.state.sanity < CONFIG.sanity.lowThreshold) {
        if (this.state.sanity < CONFIG.sanity.criticalThreshold && this.systems.audioManager && this.systems.audioManager.enabled) {
          if (!this.heartbeatHandle) {
            this.heartbeatHandle = this.systems.audioManager.playHeartbeat(2 + (100 - this.state.sanity) / 20);
          }
        } else if (this.heartbeatHandle) {
          this.heartbeatHandle = null;
        }
      }

      // 测试模式调试信息
      if (this.state.debugMode && this.state.levelActive) {
        if (this.systems.debugSystem) {
          this.systems.debugSystem.updateDebugInfo();
        }
      }
    }

    // 晕影效果
    if (this.state.levelActive) {
      if (this.systems.effectsSystem) {
        this.systems.effectsSystem.updateVignette((100 - this.state.sanity) / 100 * CONFIG.graphics.vignetteIntensity);
      }
    }

    // 更新粒子系统
    if (this.systems.effectsSystem) {
      this.systems.effectsSystem.update(dt);
    }

    // 渲染
    this.state.renderer.render(this.state.scene, this.state.camera);
    
    // 性能监控：帧结束
    performanceMonitorEnhanced.endFrame();
  }
  
  endLevel(success, customMessage = '') {
    // 触发关卡结束事件
    const eventName = success ? GameEvents.LEVEL_COMPLETE : GameEvents.LEVEL_FAILED;
    eventBus.emit(eventName, this.state.levelIndex, success, customMessage);
    
    this.state.levelActive = false;
    this.state.phase = "end";
    document.exitPointerLock();
    document.getElementById("hud").style.display = "none";

    const title = document.getElementById("end-title");
    const msg = document.getElementById("end-message");

    if (success) {
      title.textContent = "克服成功";
      title.style.color = "#4ecdc4";
      const level = LEVELS[this.state.levelIndex];
      const messages = {
        'arachnophobia': '你成功面对了蜘蛛恐惧！',
        'acrophobia': '你成功克服恐高症！',
        'claustrophobia': '你成功逃离了狭窄空间！',
        'nyctophobia': '你战胜了对黑暗的恐惧！',
        'spacePhobia': '你成功穿越了深空！',
        'clownPhobia': '你逃离了小丑的游乐场！',
        'pigPhobia': '你逃离了诡异的猪圈！',
        'carcinophobia': '你穿越了螃蟹海滩！',
        'watermelonPhobia': '你穿越了西瓜田！',
        'astraphobia': '你成功躲过了雷暴！',
        'ophidiophobia': '你安全逃离了蛇群！',
        'trypanophobia': '你成功逃离了医院！'
      };
      msg.textContent = customMessage || (messages[level.id] || '恐惧已被征服！');
      // 解锁下一个非placeholder关卡
      if (this.state.levelIndex + 1 < LEVELS.length) {
        for (let i = this.state.levelIndex + 1; i < LEVELS.length; i++) {
          if (!LEVELS[i].id.startsWith('placeholder')) {
            LEVELS[i].unlocked = true;
            break;
          }
        }
        if (this.systems.saveManager) {
          this.systems.saveManager.saveGameProgress();
        }
      }
      if (this.systems.bookSystem) {
        this.systems.bookSystem.buildBookUI();
      }
      if (this.systems.audioManager && this.systems.audioManager.enabled) {
        this.systems.audioManager.playVictory();
      }
      
      // 解锁成就
      const levelId = LEVELS[this.state.levelIndex]?.id;
      if (levelId) {
        const achievementId = `level_${levelId}_completed`;
        Enhancements.achievements.unlock(achievementId);
      }
    } else {
      title.textContent = "任务失败";
      title.style.color = "#e94560";
      msg.textContent = customMessage || '恐惧占了上风...再试一次吧。';
      if (this.systems.audioManager && this.systems.audioManager.enabled) {
        this.systems.audioManager.playFailure();
      }
    }
    document.getElementById("end-screen").style.display = "flex";
  }
}

export default GameLoop;