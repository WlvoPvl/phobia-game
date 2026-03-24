// 主入口文件 - 模块化版本
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { LEVELS } from './levels.js';
import { AudioManager } from './audio.js';
import { EffectsSystem } from './effects.js';
import { CONFIG, DEFAULT_STATE } from './config.js';
import * as office from './office.js';
import { LightingHelper } from './lighting-helper.js';

// 导入新模块
import { UIManager } from './ui-manager.js';
import { InputHandler } from './input-handler.js';
import { EditorSystem } from './editor-system.js';
import { BookSystem } from './book-system.js';
import { DialogueSystem } from './dialogue-system.js';
import { SettingsSystem } from './settings-system.js';
import { DebugSystem } from './debug-system.js';
import { CollisionSystem } from './collision-system.js';
import { GameLoop } from './game-loop.js';
import { SaveManager } from './save-manager.js';
import { MovementPhysics } from './movement-physics.js';
import { InteractionSystem } from './interaction-system.js';
import { LevelManager } from './level-manager.js';
import { updateLevelsWithClasses, LEVEL_CLASSES } from './levels-updater.js';
import { initEnhancements } from './enhancements.js';
import { eventBus, GameEvents } from './event-system.js';
import { resourceManager } from './resource-manager.js';
import { performanceMonitorEnhanced } from './performance-monitor-enhanced.js';

// 游戏全局状态
const state = { ...DEFAULT_STATE };
state.moving = { forward: false, backward: false, left: false, right: false, sprint: false, jump: false };
state.debugMode = false;
state.godMode = false;
state.showMinimap = false;
state.editorMode = false;
state.velocity = new THREE.Vector3();
state.direction = new THREE.Vector3();
state._grounded = true;

// 系统实例
let audioManager = null;
let effectsSystem = null;
let uiManager = null;
let inputHandler = null;
let editorSystem = null;
let bookSystem = null;
let dialogueSystem = null;
let settingsSystem = null;
let debugSystem = null;
let collisionSystem = null;
let gameLoop = null;
let saveManager = null;
let movementPhysics = null;
let interactionSystem = null;
let levelManager = null;

// 初始化系统
function initSystems() {
  audioManager = new AudioManager();
  effectsSystem = new EffectsSystem(state.scene, state.camera, state.renderer);
  state.effectsSystem = effectsSystem;

  uiManager = new UIManager(state);
  inputHandler = new InputHandler(state);
  editorSystem = new EditorSystem(state);
  bookSystem = new BookSystem(state);
  dialogueSystem = new DialogueSystem(state);
  settingsSystem = new SettingsSystem(state, audioManager);
  debugSystem = new DebugSystem(state);
  collisionSystem = new CollisionSystem(state);
  saveManager = new SaveManager();
  movementPhysics = new MovementPhysics(state, CONFIG.movement);
  interactionSystem = new InteractionSystem(state);
  levelManager = new LevelManager(state);

  const { LEVEL_CLASSES } = updateLevelsWithClasses();
  levelManager.registerLevels(LEVEL_CLASSES);

  gameLoop = new GameLoop(state, {
    movementPhysics,
    dialogueSystem,
    debugSystem,
    effectsSystem,
    audioManager,
    bookSystem,
    saveManager
  });

  movementPhysics.setCollisionSystem(collisionSystem);

  inputHandler.setCallbacks({
    hideCounselorDialogue: () => dialogueSystem.hideCounselorDialogue(),
    hideEditorHelp: () => editorSystem.hideEditorHelp()
  });

  bookSystem.setStartLevelCallback(startLevel);

  interactionSystem.setCallbacks({
    showBookUI: () => bookSystem.openBook(),
    showCounselorDialogue: () => dialogueSystem.showCounselorDialogue(),
    selectLevel: (index) => startLevel(index)
  });

  // 设置全局事件错误处理器
  eventBus.setErrorHandler((event, error, callback) => {
    console.error(`[GlobalErrorHandler] Event "${event}" failed:`, error);
    if (debugSystem) {
      debugSystem.reportError('event-system', error.message);
    }
  });
}

// 环境编辑器功能
async function toggleEditorMode() {
  await editorSystem.toggleEditorMode();
}

// 书本控制
function buildBookUI() {
  bookSystem.buildBookUI();
}

function interact() {
  interactionSystem.interact();
}

// 对话系统
function showCounselorDialogue() {
  dialogueSystem.showCounselorDialogue();
}

function hideCounselorDialogue() {
  dialogueSystem.hideCounselorDialogue();
}

// 设置菜单
function openSettings() {
  settingsSystem.openSettings();
}

function closeSettings() {
  settingsSystem.closeSettings();
}

// 关卡管理
function startLevel(index) {
  window.closeBook();
  eventBus.emit(GameEvents.LEVEL_START, index);

  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) loadingOverlay.style.display = 'flex';

  setTimeout(() => {
    state.phase = "level";
    state.levelIndex = index;
    state.levelActive = true;
    state.sanity = CONFIG.sanity.start;
    state.levelTime = 0;
    state.levelComplete = false;
    state.levelLights = [];

    document.getElementById("hud").style.display = "block";
    document.getElementById("hint-text").style.display = "block";
    document.getElementById("hint-text").textContent = "保持冷静...面对你的恐惧...";
    document.getElementById("sanity-bar-container").style.display = "block";
    document.getElementById("sanity-label").style.display = "block";

    const titleEl = document.getElementById("level-title");
    titleEl.textContent = LEVELS[index].name;
    titleEl.style.display = "block";
    titleEl.style.opacity = '0';
    setTimeout(() => { titleEl.style.opacity = '1'; }, 100);
    setTimeout(() => { titleEl.style.opacity = '0'; }, 3000);
    setTimeout(() => { titleEl.style.display = 'none'; }, 4000);

    state.officeGroup.visible = false;
    state.levelScene = new THREE.Group();
    state.scene.add(state.levelScene);

    if (LEVELS[index].id.startsWith('placeholder')) {
      document.getElementById('hint-text').textContent = '此关卡尚未开放...';
      returnToOffice();
      return;
    }

    const LevelClass = LEVELS[index]?.levelClass;
    if (LevelClass) {
      LevelClass.create(state);
      // 更新碰撞系统缓存
      if (collisionSystem) {
        collisionSystem.invalidateCache();
      }
    } else {
      returnToOffice();
      return;
    }

    if (index === 3) {
      const flashlight = new THREE.SpotLight(0xffffee, 2, 15, Math.PI/4, 0.5, 1);
      flashlight.position.set(0, 0, 0);
      const flashlightTarget = new THREE.Object3D();
      flashlight.target = flashlightTarget;
      state.camera.add(flashlight);
      state.camera.add(flashlightTarget);
      state.playerFlashlight = flashlight;
    }

    LightingHelper.enhanceLevelVisibility(state.scene, index, state.levelScene);

    state.controls.lock();
    state.clock.start();
    if (audioManager && audioManager.enabled) {
      audioManager.playLevelStart();
      audioManager.playAmbient(LEVELS[index].id);
    }

    if (loadingOverlay) loadingOverlay.style.display = 'none';
  }, 100);
}

function returnToOffice() {
  document.getElementById("end-screen").style.display = "none";
  document.getElementById("hint-text").style.display = "none";
  document.getElementById("vignette").style.display = "none";
  document.getElementById("vignette").style.opacity = "0";

  // 清理动态创建的 DOM 元素
  const dialogue = document.getElementById("counselor-dialogue");
  if (dialogue) dialogue.remove();
  const endOverlay = document.getElementById("end-overlay");
  if (endOverlay) endOverlay.remove();
  const editorHint = document.getElementById("editor-hint");
  if (editorHint) editorHint.remove();
  const debugInfo = document.getElementById("debug-info");
  if (debugInfo) debugInfo.remove();

  // 使用资源管理器统一清理关卡场景
  if (state.levelScene) {
    resourceManager.disposeScene(state.levelScene);
    state.scene.remove(state.levelScene);
    state.levelScene = null;
  }

  // 清理蜘蛛
  if (state.spiders && state.spiders.length > 0) {
    state.spiders.forEach(sp => {
      if (sp.mesh && sp.mesh.parent) {
        sp.mesh.parent.remove(sp.mesh);
        resourceManager.disposeObject(sp.mesh);
      }
    });
  }
  state.spiders = [];
  state.spiderWave = 0;
  state.spiderTimer = 0;
  state.scareTriggered = false;

  // 清理灯光
  if (state.levelLights) {
    state.levelLights.forEach(light => {
      if (light.parent) light.parent.remove(light);
      resourceManager.disposeObject(light);
    });
  }
  state.levelLights = [];
  
  // 清理关卡特定对象
  state.cosmicPlatforms = [];
  state.clownFigures = [];
  state.animatronicClowns = [];
  state.pigs = [];
  state.nycto = null;
  state.crabs = [];
  state.watermelons = [];
  state.flyingSeeds = [];
  state.oceanWater = null;
  state.snakes = [];
  state.needles = [];
  state.cosmicTimer = 0;
  state.clownTimer = 0;
  state.pigAggression = 0;
  state.platforms = [];
  state.stars = null;
  state.portal = null;
  state.fallDeathTriggered = false;
  state.windWarning = false;
  if (state.velocity) state.velocity.y = 0;

  // 清理手电筒
  if (state.playerFlashlight) {
    if (state.playerFlashlight.target && state.playerFlashlight.target.parent === state.camera) {
      state.camera.remove(state.playerFlashlight.target);
    }
    state.camera.remove(state.playerFlashlight);
    resourceManager.disposeObject(state.playerFlashlight);
    state.playerFlashlight = null;
  }

  // 恢复办公室场景
  state.officeGroup.visible = true;
  state.scene.background = new THREE.Color(0x1a1410);
  state.scene.fog = new THREE.Fog(0x1a1410, 8, 25);
  state.camera.position.set(0, 1.6, 3);
  state.camera.rotation.set(0, 0, 0);
  state.camera.fov = 70;
  state.camera.updateProjectionMatrix();

  state.phase = "office";
  state.levelActive = false;
  state.levelComplete = false;
  state.levelTime = 0;
  state.sanity = CONFIG.sanity.start;

  document.getElementById("sanity-bar").style.width = "100%";
  state.controls.lock();
}

// 错误报告
function generateBugReport(description = '') {
  return debugSystem.generateBugReport(description);
}

// 存档系统
function saveGameProgress() {
  return saveManager.saveGameProgress(LEVELS);
}

function loadGameProgress() {
  return saveManager.loadGameProgress(LEVELS);
}

// 初始化函数
function init() {
  const canvas = document.getElementById('game-canvas');
  state.clock = new THREE.Clock();

  state.renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: CONFIG.renderer.antialias,
    powerPreference: CONFIG.renderer.powerPreference
  });
  state.renderer.setSize(window.innerWidth, window.innerHeight);
  state.renderer.setPixelRatio(CONFIG.renderer.pixelRatio);

  if (CONFIG.renderer.shadowMap) {
    state.renderer.shadowMap.enabled = true;
    state.renderer.shadowMap.type = CONFIG.renderer.shadowMapType;
  }

  state.renderer.toneMapping = CONFIG.renderer.toneMapping;
  state.renderer.toneMappingExposure = CONFIG.renderer.toneMappingExposure;

  state.camera = new THREE.PerspectiveCamera(
    CONFIG.camera.fov,
    window.innerWidth / window.innerHeight,
    CONFIG.camera.near,
    CONFIG.camera.far
  );
  state.camera.position.copy(CONFIG.camera.startPosition);

  state.scene = new THREE.Scene();
  state.scene.background = new THREE.Color(0x1a1a1a);
  state.scene.fog = new THREE.Fog(0x1a1a1a, 10, 50);

  state.controls = new PointerLockControls(state.camera, document.body);

  initSystems();
  initEnhancements();
  uiManager.init();
  inputHandler.setupListeners();

  window.addEventListener('resize', onResize);

  // WebGL 上下文丢失/恢复处理
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    console.warn('[WebGL] Context lost, attempting recovery...');
    if (audioManager) {
      audioManager.enabled = false;
    }
  });

  canvas.addEventListener('webglcontextrestored', () => {
    console.log('[WebGL] Context restored');
    if (audioManager) {
      audioManager.enabled = true;
    }
    onResize();
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && (state.phase === 'office' || state.phase === 'level') && !dialogueSystem.isDialogueActive() && state.phase !== 'book' && state.phase !== 'end') {
      setTimeout(() => {
        if (!state.controls.isLocked && (state.phase === 'office' || state.phase === 'level')) {
          try { state.controls.lock(); } catch(e) {}
        }
      }, 100);
    }
  });

  window.addEventListener('focus', () => {
    if ((state.phase === 'office' || state.phase === 'level') && !state.controls.isLocked && !dialogueSystem.isDialogueActive() && state.phase !== 'book') {
      setTimeout(() => {
        try { state.controls.lock(); } catch(e) {}
      }, 100);
    }
  });

  loadGameProgress();
  buildBookUI();
  gameLoop.animate();
}

function onResize() {
  state.camera.aspect = window.innerWidth / window.innerHeight;
  state.camera.updateProjectionMatrix();
  state.renderer.setSize(window.innerWidth, window.innerHeight);
}

// 导出给 test-bot 使用的函数和变量
window.state = state;
window.interact = interact;
window.startLevel = startLevel;
window.getAudioManager = () => audioManager;
window.getEffectsSystem = () => effectsSystem;
window.LEVELS = LEVELS;
window.buildBookUI = buildBookUI;

// 游戏启动
window.gameStart = async function() {
  if (!state.scene) {
    return false;
  }

  try {
    const startScreen = document.getElementById('start-screen');
    if (startScreen) startScreen.style.display = 'none';

    const hud = document.getElementById('hud');
    if (hud) hud.style.display = 'block';

    state.phase = 'office';
    state.levelActive = false;

    if (!state.officeGroup) {
      office.createOffice(state);
    }

    try {
      state.controls.lock();
    } catch (e) {
      // Ignore lock errors
    }

    if (audioManager && !audioManager.initialized) {
      await audioManager.init();
    }

    // 恢复音频上下文（浏览器自动播放策略需要用户交互）
    if (audioManager) {
      await audioManager.resume();
    }

    return true;
  } catch (error) {
    return false;
  }
};

// 其他窗口函数
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.hideCounselorDialogue = hideCounselorDialogue;
window.toggleEditorMode = toggleEditorMode;
window.generateBugReport = generateBugReport;
window.returnToOffice = returnToOffice;

Object.defineProperty(window, '_endLevel', {
  get() {
    return gameLoop ? gameLoop.endLevel.bind(gameLoop) : () => {};
  },
  configurable: true
});

window.openBook = () => bookSystem?.openBook?.();
window.closeBook = () => bookSystem?.closeBook?.();
window.bookPrevPage = () => bookSystem?.bookPrevPage?.();
window.bookNextPage = () => bookSystem?.bookNextPage?.();

window.newGame = function() {
  if (confirm('确定要开始新游戏吗？这将清除所有存档进度。')) {
    saveManager.resetGameProgress(LEVELS);
    buildBookUI();
  }
};

window.loadSavedGame = function() {
  const loaded = saveManager.loadGameProgress(LEVELS);
  if (loaded) {
    window.gameStart();
  }
};

window.returnToMainMenu = function() {
  closeSettings();
  if (state.phase === 'level') {
    returnToOffice();
  }
  document.getElementById('start-screen').style.display = 'flex';
  document.getElementById('hud').style.display = 'none';
  document.exitPointerLock();
  state.phase = 'start';
  state.levelActive = false;
};

window.exitGame = function() {
  if (confirm('确定要退出游戏吗？')) {
    window.close();
  }
};

window.togglePerformanceMonitor = function(show) {
  performanceMonitorEnhanced.setVisible(show);
};

// 启动游戏
init();
