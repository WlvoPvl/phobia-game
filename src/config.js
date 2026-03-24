// 游戏配置文件
import * as THREE from 'three';

export const CONFIG = {
  // 渲染设置
  renderer: {
    antialias: true,
    pixelRatio: Math.min(window.devicePixelRatio, 1.5), // 限制为1.5以提高性能
    shadowMap: true,
    shadowMapType: THREE.PCFSoftShadowMap,
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.0,
    powerPreference: 'high-performance' // 优先性能
  },

  // 相机设置
  camera: {
    fov: 70,
    near: 0.1,
    far: 200,
    height: 1.6,
    startPosition: new THREE.Vector3(0, 1.6, 3)
  },

  // 玩家移动
  movement: {
    speed: 4,
    acceleration: 10,
    friction: 8,
    maxVelocity: 10
  },

  // 理智系统
  sanity: {
    max: 100,
    start: 100,
    drainRate: 0.1,
    recoverRate: 0.05,
    lowThreshold: 50,
    criticalThreshold: 30,
    visualDistortion: true, // 低理智时视觉扭曲
    audioHallucination: true // 低理智时幻听
  },

  // 关卡距离边界
  bounds: {
    default: 18,
    office: 5
  },

  // 音效设置
  audio: {
    masterVolume: 0.7,
    sfxVolume: 0.8,
    musicVolume: 0.5
  },

  // 视觉效果
  graphics: {
    vignetteIntensity: 0.6,
    cameraShakeIntensity: 0.003,
    particleCount: 30
  },

  // 关卡特定配置
  levels: {
    arachnophobia: {
      spiderWaveInterval: 4,
      maxSpiders: 30,
      spiderSpawnRadius: 4,
      sanityDrainMultiplier: 1.0,
      duration: 28,
      roomSize: 14,
      roomHeight: 3.5
    },
    acrophobia: {
      platformCount: 50,
      platformWidthMin: 1.5,
      platformWidthMax: 3.5,
      platformSpacing: 4,
      heightDrainStart: 20,
      heightDrainMultiplier: 0.003,
      fallThreshold: -15,
      duration: 200
    },
    claustrophobia: {
      corridorLength: 60,
      corridorWidth: 1.5,
      sanityBaseDrain: 0.15,
      sanityDepthMultiplier: 0.001,
      duration: 120
    },
    nyctophobia: {
      corridorLength: 300,
      flashlightRange: 6,
      blackoutMaxCount: 3,
      blackoutDuration: 3,
      shadowActivationDistance: 4,
      sanityBaseDrain: 0.12,
      duration: 300
    },
    spacePhobia: {
      platformCount: 30,
      starCount: 3000,
      blackHoleDistance: 20,
      cosmicDrainBase: 0.05,
      cosmicDrainIsolation: 0.001,
      duration: 180
    },
    clownPhobia: {
      clownCount: 3,
      animatronicCount: 2,
      sanityDrainBase: 0.15,
      sanityDrainIncrease: 0.002,
      duration: 90
    },
    pigPhobia: {
      penCount: 3,
      pigsPerPenMin: 2,
      pigsPerPenMax: 4,
      aggressionSanityThreshold: 70,
      sanityDrainBase: 0.08,
      chargeChance: 0.005,
      chargeDuration: 2,
      duration: 90
    },
    carcinophobia: {
      crabCount: 20,
      crabSpeedMin: 0.5,
      crabSpeedMax: 1.5,
      crabAttackDistance: 1.2,
      sanityDrainBase: 0.1,
      scareFlashDuration: 200,
      duration: 90
    },
    watermelonPhobia: {
      watermelonCount: 12,
      seedInterval: 3,
      seedSpeed: 8,
      seedLifetime: 3,
      sanityDrainBase: 0.08,
      seedDamage: 15,
      duration: 120
    }
  }
};

// 颜色调色板
export const COLORS = {
  // 理智相关
  sanity: {
    high: new THREE.Color(0x4ade80),
    medium: new THREE.Color(0xfbbf24),
    low: new THREE.Color(0xef4444),
    critical: new THREE.Color(0x7c2d12)
  },

  // 恐惧主题色
  phobia: {
    arachnophobia: 0x1a0a0a,
    acrophobia: 0x87ceeb,
    claustrophobia: 0x000000,
    nyctophobia: 0x000000,
    spacePhobia: 0x000005,
    clownPhobia: 0x2a1a2a,
    pigPhobia: 0x4a3a2a,
    carcinophobia: 0x0a0a1a,
    watermelonPhobia: 0x2a0a0a
  },

  // UI 颜色
  ui: {
    primary: 0x6366f1,
    secondary: 0x8b5cf6,
    background: 0x1a1410,
    text: 0xf8fafc
  }
};

// 游戏状态默认值
export const DEFAULT_STATE = {
  phase: 'start',
  sanity: 100,
  levelIndex: -1,
  levelActive: false,
  levelTime: 0,
  levelComplete: false,
  officeGroup: null,
  counselorGroup: null,
  bookMesh: null,
  levelScene: null,
  levelLights: [],
  scareTriggered: false,
  // 特定关卡状态
  spiders: [],
  spiderWave: 0,
  spiderTimer: 0,
  // 幽闭恐惧
  // 黑暗恐惧
  nycto: null,
  // 深空恐惧
  cosmicPlatforms: [],
  cosmicTimer: 0,
  blackHole: null,
  // 小丑恐惧
  clownFigures: [],
  animatronicClowns: [],
  clownTimer: 0,
  // 猪恐惧
  pigs: [],
  pigAggression: 0,
  // 螃蟹恐惧
  crabs: [],
  // 西瓜恐惧
  watermelons: [],
  flyingSeeds: [],
  wmTimer: 0
};
