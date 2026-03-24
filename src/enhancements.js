// 游戏增强工具包 - 整合所有可选增强功能
// 在 main.js 中导入: import './enhancements.js';
// 然后根据需要调用各功能

import { LightingHelper } from './lighting-helper.js';
import { MemoryCleanup } from './memory-cleanup.js';
import { PerformanceMonitor, perfMonitor } from './performance-monitor.js';
import { JumpEnhancement } from './jump-enhancement.js';

// 开发模式才导入调试模块
let DebugEnhancer, debugEnhancer;

import { VisualEnhancer, visualEnhancer } from './visual-enhancer.js';
import { SaveManager, saveManager } from './save-manager.js';
import { AchievementSystem, achievements } from './achievement-system.js';
import { InputManager, inputManager } from './input-manager.js';
import { GameStateMachine, createDefaultStates } from './game-state-machine.js';
import { MonsterAI } from './monster-ai.js';
import { KeySystem } from './key-system.js';
import { DoorLock, PuzzleSystem } from './puzzle-system.js';
import { FlashlightEnhancer } from './flashlight-enhancer.js';
import { AnimationSystem, animationSystem } from './animation-system.js';
import { InputHandler } from './input-handler.js';
import { MovementPhysics } from './movement-physics.js';
import { UIManager } from './ui-manager.js';
import { LevelManager } from './level-manager.js';
import { InteractionSystem } from './interaction-system.js';

// ===== 直播增强模块 =====
import { StreamingEnhancer, streamingEnhancer } from './StreamingEnhancer.js';
import { TerrorAudio, createTerrorAudio } from './TerrorAudio.js';
import { JumpScareSystem, jumpScareSystem } from './JumpScareSystem.js';
import { RandomEvents, randomEvents } from './RandomEvents.js';

// ===== 新增性能优化模块 =====
import { PerformanceMonitorEnhanced, performanceMonitorEnhanced } from './performance-monitor-enhanced.js';
import { ObjectPool, GameObjectPool, ObjectPoolFactory } from './object-pool.js';
import { EventSystem, GameEvents, eventBus } from './event-system.js';

export const Enhancements = {
  // 光照增强
  lighting: {
    enhance: LightingHelper.enhanceLevelVisibility,
    helper: LightingHelper
  },
  
  // 内存清理
  memory: {
    cleanupLevel: MemoryCleanup.cleanupLevel,
    cleanupOffice: MemoryCleanup.cleanupOffice,
    dispose: MemoryCleanup.disposeObject,
    disposeMaterial: MemoryCleanup.disposeMaterial
  },
  
  // 性能监控
  performance: {
    start: () => perfMonitor.start(),
    stop: () => perfMonitor.stop(),
    update: () => perfMonitor.update(),
    getStats: () => perfMonitor.getStats()
  },
  
  // 跳跃增强
  jump: {
    canJump: JumpEnhancement.canJump,
    performJump: JumpEnhancement.performJump,
    updatePhysics: JumpEnhancement.updatePhysics,
    showHint: JumpEnhancement.showJumpHint
  },
  
  // 调试增强 (开发模式才启用) - 默认空实现
  debug: { start: () => {}, stop: () => {}, update: () => {}, createConsoleHelpers: () => {} },
  
  // 视觉增强
  visual: {
    init: () => visualEnhancer.init(),
    update: (state, camera, time) => visualEnhancer.update(state, camera, time),
    flash: (duration, color) => visualEnhancer.flashScreen(duration, color),
    reset: (camera) => visualEnhancer.reset(camera)
  },
  
  // 存档管理
  save: {
    save: (data) => saveManager.save(data),
    load: () => saveManager.load(),
    remove: () => saveManager.remove(),
    exportToFile: (filename) => saveManager.exportToFile(filename),
    importFromFile: (file) => saveManager.importFromFile(file)
  },
  
  // 成就系统
  achievements: {
    unlock: (id) => achievements.unlock(id),
    isUnlocked: (id) => achievements.isUnlocked(id),
    getCount: () => achievements.getUnlockedCount(),
    getTotal: () => achievements.getTotalCount(),
    show: () => achievements.show(),
    updateStat: (name, value) => achievements.updateStat(name, value),
    stats: () => achievements.stats
  },
  
  // 输入管理
  input: {
    isKeyDown: (key) => inputManager.isKeyDown(key),
    isMouseDown: (btn) => inputManager.isMouseButtonDown(btn),
    on: (event, cb) => inputManager.on(event, cb),
    enable: () => inputManager.enable(),
    disable: () => inputManager.disable()
  },
  
  // 状态机
  stateMachine: {
    create: () => new GameStateMachine(),
    createDefaults: (sm, state) => createDefaultStates(sm, state)
  },
  
  // 怪物AI
  monster: {
    createAI: (mesh, config) => new MonsterAI(mesh, config),
    createSpider: () => MonsterAI.createSpiderMesh()
  },
  
  // 钥匙系统
  keys: {
    create: (state) => new KeySystem(state),
    createMesh: () => KeySystem.createKeyMesh()
  },
  
  // 谜题系统
  puzzle: {
    createPuzzle: (state) => new PuzzleSystem(state),
    createDoorLock: (state, door, config) => new DoorLock(state, door, config)
  },
  
  // 手电筒增强
  flashlight: {
    create: (camera, state, config) => new FlashlightEnhancer(camera, state, config)
  },
  
  // 动画系统
  animation: {
    create: () => new AnimationSystem(),
    getGlobal: () => animationSystem
  },
  
  // 输入处理（从main拆分）
  inputHandler: {
    create: (state) => new InputHandler(state)
  },
  
  // 移动物理（从main拆分）
  movement: {
    create: (state, config) => new MovementPhysics(state, config)
  },
  
  // UI管理（从main拆分）
  ui: {
    create: (state) => new UIManager(state)
  },
  
  // 关卡管理（从main拆分）
  levelMgmt: {
    create: (state) => new LevelManager(state)
  },
  
  // 交互系统（从main拆分）
  interaction: {
    create: (state) => new InteractionSystem(state)
  },

  // ===== 新增性能优化系统 =====
  advancedPerformance: {
    monitor: performanceMonitorEnhanced,
    create: (options) => new PerformanceMonitorEnhanced(options),
    start: () => performanceMonitorEnhanced.start(),
    stop: () => performanceMonitorEnhanced.stop(),
    getReport: () => performanceMonitorEnhanced.getReport(),
    checkForIssues: () => performanceMonitorEnhanced.checkForIssues()
  },
  
  objectPool: {
    factory: ObjectPoolFactory,
    createPool: (createFn, resetFn, initialSize) => new ObjectPool(createFn, resetFn, initialSize),
    create3DPool: (createFn, initialSize) => new GameObjectPool(createFn, initialSize)
  },
  
  eventSystem: {
    bus: eventBus,
    events: GameEvents,
    create: () => new EventSystem()
  },

  // ===== 直播增强系统 =====
  streaming: {
    // 核心直播增强
    enhancer: streamingEnhancer,
    createEnhancer: () => new StreamingEnhancer(),

    // 恐怖音效
    terrorAudio: null,
    createTerrorAudio: (audioManager) => new TerrorAudio(audioManager),

    // Jump Scare系统
    jumpScare: jumpScareSystem,
    createJumpScare: () => new JumpScareSystem(),

    // 随机事件系统
    events: randomEvents,
    createEvents: (enhancer, terrorAudio, audioManager) => {
      const re = new RandomEvents();
      re.init(enhancer.state || {});
      const events = RandomEvents.createEvents(enhancer, terrorAudio, audioManager);
      events.forEach(e => re.registerEvent(e));
      return re;
    }
  }
};

// 初始化所有增强功能
export async function initEnhancements() {
  visualEnhancer.init();
  
  // 开发模式下初始化调试增强
  const isDev = typeof window !== 'undefined' && window.location && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  if (isDev) {
    try {
      const debugModule = await import('./debug-enhancer.js');
      debugModule.debugEnhancer.start(debugModule);
      Enhancements.debug = {
        start: (state) => debugModule.debugEnhancer.start(state),
        stop: () => debugModule.debugEnhancer.stop(),
        update: (state) => debugModule.debugEnhancer.update(state),
        createConsoleHelpers: (state) => debugModule.DebugEnhancer.createConsoleHelpers(state)
      };
    } catch (e) {
      // 开发模式加载失败，静默处理
    }
  }
  
  // 初始化性能监控
  performanceMonitorEnhanced.start();
  console.log('[Enhancements] All enhancements initialized');
}

export default Enhancements;