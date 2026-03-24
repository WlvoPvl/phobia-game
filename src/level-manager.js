// 关卡管理器 - 从 main.js 拆分
// 使用 index.html 中已存在的 UI 元素，不再创建重复 DOM

import * as THREE from 'three';
import { resourceManager } from './resource-manager.js';
import { ArachnophobiaLevel } from './levels/ArachnophobiaLevel.js';

export class LevelManager {
  constructor(state) {
    this.state = state;
    this.levelClasses = {};
  }

  registerLevels(levelClasses) {
    this.levelClasses = levelClasses;
  }

  cleanupCurrentLevel() {
    // 使用资源管理器统一清理关卡场景
    if (this.state.levelScene) {
      resourceManager.disposeScene(this.state.levelScene);
      this.state.scene.remove(this.state.levelScene);
      this.state.levelScene = null;
    }

    // 清理蜘蛛
    if (this.state.spiders) {
      this.state.spiders.forEach(sp => {
        if (sp.mesh?.parent) {
          sp.mesh.parent.remove(sp.mesh);
          resourceManager.disposeObject(sp.mesh);
        }
      });
      this.state.spiders = [];

      // 清理蜘蛛对象池
      if (typeof ArachnophobiaLevel !== 'undefined' && ArachnophobiaLevel.spiderPool) {
        ArachnophobiaLevel.spiderPool.clear();
        ArachnophobiaLevel.spiderPool = null;
      }
    }

    // 清理灯光
    if (this.state.levelLights) {
      this.state.levelLights.forEach(light => {
        if (light.parent) light.parent.remove(light);
        resourceManager.disposeObject(light);
      });
      this.state.levelLights = [];
    }

    // 清理手电筒
    if (this.state.playerFlashlight) {
      if (this.state.playerFlashlight.target?.parent === this.state.camera) {
        this.state.camera.remove(this.state.playerFlashlight.target);
      }
      if (this.state.playerFlashlight.parent === this.state.camera) {
        this.state.camera.remove(this.state.playerFlashlight);
      }
      resourceManager.disposeObject(this.state.playerFlashlight);
      this.state.playerFlashlight = null;
    }

    this.state.cosmicPlatforms = [];
    this.state.clownFigures = [];
    this.state.animatronicClowns = [];
    this.state.pigs = [];
    this.state.crabs = [];
    this.state.watermelons = [];
    this.state.flyingSeeds = [];
    this.state.snakes = [];
    this.state.needles = [];
    this.state.nycto = null;
    this.state.blackHole = null;
    this.state.portal = null;
    this.state.stars = null;
    this.state.oceanWater = null;
    this.state.scareTriggered = false;
    this.state.spiderWave = 0;
    this.state.spiderTimer = 0;
    this.state.cosmicTimer = 0;
    this.state.clownTimer = 0;
    this.state.pigAggression = 0;
    this.state.fallDeathTriggered = false;
    this.state.windWarning = false;
  }

  showEndScreen(success, message = '') {
    const title = document.getElementById('end-title');
    const msg = document.getElementById('end-message');
    const endScreen = document.getElementById('end-screen');

    if (title) {
      title.textContent = success ? '克服成功' : '任务失败';
      title.style.color = success ? '#4ecdc4' : '#e94560';
    }
    if (msg) msg.textContent = message || (success ? '恐惧已被征服！' : '恐惧占了上风...');
    if (endScreen) endScreen.style.display = 'flex';
  }

  hideEndScreen() {
    const endScreen = document.getElementById('end-screen');
    if (endScreen) endScreen.style.display = 'none';
  }
}

export default LevelManager;
