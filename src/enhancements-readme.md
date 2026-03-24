# 游戏增强工具包 (Enhancements)

本目录包含可选的增强功能模块，可根据需要选择性集成到主程序中。

## 文件说明

| 文件 | 功能 | 参考来源 |
|------|------|----------|
| `enhancements.js` | 整合所有增强功能的统一入口 | - |
| `lighting-helper.js` | 关卡光照增强 | - |
| `memory-cleanup.js` | 内存清理工具 | - |
| `performance-monitor.js` | 性能监控 | - |
| `jump-enhancement.js` | 跳跃功能增强 | - |
| `debug-enhancer.js` | 调试增强面板 | - |
| `visual-enhancer.js` | 视觉特效增强 | - |
| `level-helper.js` | 关卡创建辅助工具 | - |
| `save-manager.js` | 存档管理系统 | - |
| `achievement-system.js` | 成就与统计系统 | - |
| `input-manager.js` | 统一输入管理 | - |
| `game-state-machine.js` | 游戏状态机 | - |
| `monster-ai.js` | 怪物AI系统 | Floodead |
| `key-system.js` | 钥匙与收集系统 | Janitor, Phantomicus |
| `puzzle-system.js` | 门锁与谜题系统 | Floodead |
| `flashlight-enhancer.js` | 手电筒系统增强 | Janitor |
| `animation-system.js` | 动画系统 | - |
| `input-handler.js` | 输入处理（从main拆分） | - |
| `movement-physics.js` | 移动物理（从main拆分） | - |
| `ui-manager.js` | UI管理（从main拆分） | - |
| `level-manager.js` | 关卡管理（从main拆分） | - |
| `interaction-system.js` | 交互系统（从main拆分） | - |

## 🆕 直播增强模块（新增）

| 文件 | 功能 | 参考来源 |
|------|------|----------|
| `StreamingEnhancer.js` | 核心直播增强系统 | Content Warning, Nuclear Nightmare |
| `TerrorAudio.js` | 恐怖音效增强 | Floodead |
| `JumpScareSystem.js` | 增强版Jump Scare | Content Warning |
| `RandomEvents.js` | 随机事件系统 | Janitor |

## 新增恐惧症关卡

## 新增恐惧症关卡

| 文件 | 恐惧类型 |
|------|----------|
| `levels/AstraphobiaLevel.js` | 雷电恐惧症 |
| `levels/OphidiophobiaLevel.js` | 蛇恐惧症 |
| `levels/TrypanophobiaLevel.js` | 针头恐惧症 |
| `levels/NEW_LEVELS.js` | 新关卡配置 |

## 使用方法

### 方法1: 整体导入（推荐）

在 `main-modular.js` 顶部添加：
```javascript
import './enhancements.js';
```

然后初始化：
```javascript
// 游戏初始化时调用
initEnhancements();
```

### 方法2: 按需导入

只导入需要的模块：
```javascript
import { LightingHelper } from './lighting-helper.js';
import { MemoryCleanup } from './memory-cleanup.js';
```

## 功能详情

### 光照增强 (lighting-helper.js)
```javascript
import { LightingHelper } from './lighting-helper.js';

// 增强指定关卡的光照
LightingHelper.enhanceLevelVisibility(scene, levelIndex, levelScene);
```

### 内存清理 (memory-cleanup.js)
```javascript
import { MemoryCleanup } from './memory-cleanup.js';

// 清理关卡场景
MemoryCleanup.cleanupLevel(state);

// 清理办公室
MemoryCleanup.cleanupOffice(state);
```

### 性能监控 (performance-monitor.js)
```javascript
import { perfMonitor } from './performance-monitor.js';

// 开启/停止监控
perfMonitor.start();
perfMonitor.stop();

// 获取统计数据
const stats = perfMonitor.getStats();
console.log(stats.fps, stats.memoryMB);
```

### 怪物AI系统 (monster-ai.js)
```javascript
import { MonsterAI } from './monster-ai.js';

// 创建怪物AI实例
const spiderAI = new MonsterAI(spiderMesh, {
  speed: 2,
  detectionRange: 8,
  attackRange: 1.5,
  patrolPoints: [pos1, pos2, pos3]
});

// 在游戏循环中更新
spiderAI.update(dt, playerPosition);

// 创建蜘蛛模型
const spiderMesh = MonsterAI.createSpiderMesh();
```

### 钥匙收集系统 (key-system.js)
```javascript
import { KeySystem } from './key-system.js';

// 创建钥匙系统
const keySystem = new KeySystem(state);
keySystem.init(3); // 需要收集3把钥匙

// 添加钥匙
const key = keySystem.addKey(position, 'gold', 0xffd700);
levelScene.add(key);

// 在游戏循环中更新
keySystem.update(dt, time, playerPosition);

// 检查是否收集足够
if (keySystem.hasRequiredKeys()) {
  // 钥匙足够，可以开门
}
```

### 谜题与门锁系统 (puzzle-system.js)
```javascript
import { PuzzleSystem, DoorLock } from './puzzle-system.js';

// 创建谜题系统
const puzzleSystem = new PuzzleSystem(state);

// 创建密码门锁
const doorLock = new DoorLock(state, doorMesh, {
  password: '1532',
  onUnlock: () => console.log('门已打开'),
  onFail: () => console.log('密码错误')
});

// 尝试解锁
doorLock.tryUnlock('1532'); // true

// 创建键盘谜题
const keypad = puzzleSystem.createKeypadPuzzle(
  new THREE.Vector3(0, 1, -5),
  '1532',
  () => console.log('谜题已解开')
);
```

### 手电筒增强 (flashlight-enhancer.js)
```javascript
import { FlashlightEnhancer } from './flashlight-enhancer.js';

// 创建手电筒
const flashlight = new FlashlightEnhancer(camera, state);
flashlight.init({
  range: 8,
  drainRate: 1,
  rechargeRate: 0.5
});

// 在游戏循环中更新
flashlight.update(dt);

// 切换开关
flashlight.toggle();

// 获取电量
const battery = flashlight.getBattery(); // 0-100
```

### 动画系统 (animation-system.js)
```javascript
import { AnimationSystem } from './animation-system.js';

// 创建动画系统
const anim = new AnimationSystem();

// 创建上下浮动动画
anim.createBobAnimation(mesh, {
  amplitude: 0.1,
  frequency: 1,
  axis: 'y'
});

// 创建旋转动画
anim.createRotateAnimation(mesh, {
  speed: 1,
  axis: 'y',
  range: Math.PI / 4
});

// 创建路径动画
anim.createPathAnimation(mesh, [pos1, pos2, pos3], {
  speed: 0.5,
  loop: true
});

// 创建小丑动画
anim.createClownAnimation(clownMesh);

// 在游戏循环中更新
anim.update(dt, time);
```

### 存档管理 (save-manager.js)
```javascript
import { saveManager } from './save-manager.js';

// 保存游戏
saveManager.save({ sanity: 80, level: 2 });

// 加载游戏
const data = saveManager.load();

// 导出到文件
saveManager.exportToFile('my-save.json');

// 从文件导入
const fileInput = document.getElementById('file-input');
fileInput.onchange = (e) => {
  saveManager.importFromFile(e.target.files[0]);
};
```

### 成就系统 (achievement-system.js)
```javascript
import { achievements } from './achievement-system.js';

// 解锁成就
achievements.unlock('first_level');

// 检查成就
if (achievements.isUnlocked('all_levels')) {
  console.log('已完成所有关卡!');
}

// 显示成就面板
achievements.show();

// 更新统计
achievements.updateStat('levelsCompleted', 1);
achievements.updateStat('totalSanityLost', -20);
```

### 输入管理 (input-manager.js)
```javascript
import { inputManager } from './input-manager.js';

// 检查按键
if (inputManager.isKeyDown('KeyW')) {
  // 前进
}

// 检查鼠标按钮
if (inputManager.isMouseDown(0)) {
  // 鼠标左键按下
}

// 绑定事件
inputManager.on('keydown', (e) => {
  console.log('按键:', e.code);
});
```

### 游戏状态机 (game-state-machine.js)
```javascript
import { GameStateMachine, createDefaultStates } from './game-state-machine.js';

const sm = new GameStateMachine();
createDefaultStates(sm, state);

// 切换状态
sm.setState('office');

// 在游戏循环中更新
function update(dt) {
  sm.update(dt);
}
```

## 与主程序链接

在 `main-modular.js` 中导入后，可以使用以下方式调用：

```javascript
// 方式1: 在 animate() 函数中集成性能监控
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(state.clock.getDelta(), 0.1);
  
  // 添加性能监控
  perfMonitor.update();
  
  // ... 其他代码
}

// 方式2: 在 returnToOffice() 中集成内存清理
function returnToOffice() {
  // ... 现有代码
  
  // 添加内存清理
  MemoryCleanup.cleanupLevel(state);
}

// 方式3: 在关卡创建时增强光照
function startLevel(index) {
  // ... 现有代码
  
  // 增强光照
  LightingHelper.enhanceLevelVisibility(state.scene, index, state.levelScene);
}
```

## 注意事项

1. 这些模块是**可选的**，不导入也能正常运行游戏
2. 导入后会自动创建对应的DOM元素，需确保CSS不会冲突
3. 性能监控会创建额外的DOM元素，建议只在开发时启用
4. 内存清理模块可以在关卡切换时调用，防止内存泄漏

---

## 🆕 直播增强功能（重点）

### 概述

专为提升直播效果而设计，参考 Content Warning、Nuclear Nightmare 等游戏的震撼体验：

- **震撼Jump Scare** - 多层次音效+屏幕震动+血液边缘
- **随机事件系统** - 让游戏不可预测，每次游玩都不同
- **诡异声音氛围** - 低理智时自动播放低语、环境音效
- **视觉降级效果** - 画面随恐惧程度恶化

### 直播增强系统 (StreamingEnhancer.js)

```javascript
import { StreamingEnhancer, streamingEnhancer } from './StreamingEnhancer.js';

// 在关卡开始时初始化
streamingEnhancer.init(state);

// 在游戏循环中更新
streamingEnhancer.update(state, audioManager, dt);

// 触发Mega Jump Scare
streamingEnhancer.triggerMegaJumpScare(state, audioManager, 'spider');
```

**效果列表：**
- 屏幕多次闪烁（红-黑交替）
- 相机剧烈震动
- 血液边缘效果
- 诡异文字闪现
- 理智值扣除

### 恐怖音效系统 (TerrorAudio.js)

```javascript
import { TerrorAudio, createTerrorAudio } from './TerrorAudio.js';

// 创建恐怖音效系统
const terrorAudio = new TerrorAudio(audioManager);

// 超级Jump Scare音效
terrorAudio.playMegaJumpScare();

// 诡异的低语
terrorAudio.playWhisper(3);

// 深处传来的声音
terrorAudio.playDeepVoice();

// 诡异的笑声
terrorAudio.playCreepyLaugh();

// 根据理智值调整环境音
terrorAudio.playAmbientBasedOnSanity(sanity, levelType);
```

**音效层次：**
1. 尖锐锯齿波尖叫
2. 低频冲击
3. 白噪声爆炸
4. 高频刺耳音

### Jump Scare系统 (JumpScareSystem.js)

```javascript
import { JumpScareSystem, jumpScareSystem } from './JumpScareSystem.js';

// 初始化
jumpScareSystem.init();

// 各关卡专用Scare
jumpScareSystem.triggerSpiderScare(state, audioManager);  // 蜘蛛
jumpScareSystem.triggerClownScare(state, audioManager);    // 小丑
jumpScareSystem.triggerCrabScare(state, audioManager);      // 螃蟹
jumpScareSystem.triggerShadowScare(state, audioManager);    // 影子人

// 自定义Scare
jumpScareSystem.triggerJumpScare(state, audioManager, {
  type: 'custom',
  sanityDamage: 20,
  intensity: 1.5,
  duration: 0.8
});
```

### 随机事件系统 (RandomEvents.js)

```javascript
import { RandomEvents } from './RandomEvents.js';

// 创建事件系统
const randomEvents = new RandomEvents();
randomEvents.init(state);

// 注册事件
const events = RandomEvents.createEvents(streamingEnhancer, terrorAudio, audioManager);
events.forEach(e => randomEvents.registerEvent(e));

// 内置事件类型：
// - footsteps: 突然的脚步声
// - light_flicker: 灯光闪烁
// - whisper: 诡异低语
// - screen_shake: 画面震动
// - blood_flash: 血液边缘闪现
// - terror_text: 诡异文字
// - quiet_then_scare: 先安静后爆发
// - music_dropoct: 背景音乐突变
// - distant_sound: 远处传来声音
// - sanity_drain: 理智突降
```

### 集成示例

在 `main-modular.js` 中集成直播增强功能：

```javascript
// 导入增强模块
import './enhancements.js';
import { streamingEnhancer } from './StreamingEnhancer.js';
import { createTerrorAudio } from './TerrorAudio.js';
import { jumpScareSystem } from './JumpScareSystem.js';
import { RandomEvents } from './RandomEvents.js';

// 初始化
let terrorAudio = null;
let randomEventsSystem = null;

function initStreamingEnhancements() {
  streamingEnhancer.init(state);
  terrorAudio = createTerrorAudio(audioManager);
  jumpScareSystem.init();
  
  randomEventsSystem = new RandomEvents();
  randomEventsSystem.init(state);
  const events = RandomEvents.createEvents(streamingEnhancer, terrorAudio, audioManager);
  events.forEach(e => randomEventsSystem.registerEvent(e));
}

// 在 animate() 中更新
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(state.clock.getDelta(), 0.1);
  
  // 更新直播增强
  if (state.levelActive) {
    streamingEnhancer.update(state, audioManager, dt);
  }
  
  // ... 其他代码
}

// 在 startLevel() 中初始化
function startLevel(index) {
  // ... 现有代码
  
  // 初始化直播增强
  if (!terrorAudio) {
    initStreamingEnhancements();
  }
}

// 在 returnToOffice() 中清理
function returnToOffice() {
  // ... 现有代码
  
  streamingEnhancer.cleanup();
}
```

### 效果对比

| 原版 | 增强版 |
|------|--------|
| 0.2秒白色闪光 | 多次红-黑闪烁 + 血液边缘 |
| 单调锯齿波 | 多层音效（尖叫+低频+噪声+高频）|
| 无声音变化 | 低理智时自动播放诡异低语 |
| 固定事件 | 每8-20秒随机触发事件 |
| 仅晕影效果 | 血液边缘+画面扭曲+诡异文字 |

### 直播建议

1. **初始设置**: 游戏开始时自动启用增强效果
2. **可调节强度**: 在设置中添加"恐怖强度"滑块
3. **快捷键**: `Ctrl+Shift+H` 切换增强效果
4. **备用方案**: 提供"轻度模式"选项