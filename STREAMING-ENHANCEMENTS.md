# 直播增强功能说明

## 新增文件

| 文件 | 大小 | 功能 |
|------|------|------|
| `StreamingEnhancer.js` | 9.4KB | 核心直播增强系统 |
| `TerrorAudio.js` | 9.6KB | 恐怖音效增强 |
| `JumpScareSystem.js` | 6.4KB | Jump Scare系统 |
| `RandomEvents.js` | 7.4KB | 随机事件系统 |

## 修改的文件

| 文件 | 修改内容 |
|------|----------|
| `audio.js` | 添加playMegaJumpScare, playDeepVoice, playCreepyLaugh, playWhisper增强版, playHeartbeatStrong |
| `enhancements.js` | 添加直播增强模块导出 |
| `enhancements-readme.md` | 添加直播增强功能说明 |
| `levels/StreamReadyLevels.js` | 集成示例 |

## 功能亮点

### 1. 震撼Jump Scare
- **多层音效**: 尖叫+低频冲击+白噪声+高频刺耳
- **屏幕效果**: 红-黑快速闪烁
- **相机震动**: 持续0.5-1秒
- **血液边缘**: 屏幕四周泛红
- **理智扣除**: 15-25点

### 2. 随机事件系统
- **10种事件**: 脚步声、灯光闪烁、低语、画面震动、血液闪现、诡异文字、先静后爆、音乐突变、远处声音、理智突降
- **8-20秒间隔**: 不可预测
- **冷却机制**: 防止重复触发

### 3. 诡异声音
- **增强低语**: 更真实的随机低语效果
- **深处声音**: 仿佛从深渊传来
- **诡异笑声**: 短促、随机、令人不安
- **强力心跳**: 双拍结构，更震撼

### 4. 视觉降级
- **血液边缘**: 随理智下降而加重
- **画面扭曲**: 临界理智时随机发生
- **诡异文字**: 中文恐怖提示

## 使用方法

### 方法1: 直接导入（推荐）

在 `main.js` 开头添加：
```javascript
import { streamingEnhancer } from './StreamingEnhancer.js';
import { createTerrorAudio } from './TerrorAudio.js';
import { jumpScareSystem } from './JumpScareSystem.js';
import { RandomEvents } from './RandomEvents.js';
```

在游戏初始化时：
```javascript
function initStreaming() {
  streamingEnhancer.init(state);
  jumpScareSystem.init();
  
  const terrorAudio = createTerrorAudio(audioManager);
  
  const re = new RandomEvents();
  re.init(state);
  const events = RandomEvents.createEvents(streamingEnhancer, terrorAudio, audioManager);
  events.forEach(e => re.registerEvent(e));
}
```

在 animate() 中更新：
```javascript
if (state.levelActive) {
  streamingEnhancer.update(state, audioManager, dt);
}
```

### 方法2: 通过enhancements.js导入

```javascript
import './enhancements.js';
// 或按需导入
import { streamingEnhancer, jumpScareSystem } from './enhancements.js';
```

## 效果对比

| 特性 | 原版 | 增强版 |
|------|------|--------|
| Jump Scare时长 | 0.2秒 | 0.5-1秒 |
| 音效层次 | 1层 | 4层叠加 |
| 画面效果 | 单一闪白 | 红黑交替+血液边缘 |
| 相机震动 | 无 | 剧烈震动 |
| 随机事件 | 无 | 10种事件 |
| 低语效果 | 简单 | 真实随机调制 |

## 直播建议

1. **开启增强**: 默认启用直播增强模式
2. **强度调节**: 在设置中添加恐怖强度滑块（轻度/标准/极限）
3. **快捷键**: `Ctrl+Shift+H` 切换增强效果
4. **备用方案**: 提供"正常模式"给不想要恐怖效果的玩家

## 参考来源

- Content Warning - Jump Scare设计
- Nuclear Nightmare - 氛围营造
- Floodead - 声音和视觉效果
- Janitor - 随机事件机制

## 下一步

1. 将增强模块集成到 `main.js` 的 `startLevel()` 函数中
2. 在关卡结束时调用清理函数
3. 添加设置面板控制增强强度
4. 根据反馈调整各项参数
