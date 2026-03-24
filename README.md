# Phobia - 3D恐惧症恐怖游戏

一款基于 Three.js 的第一人称恐怖游戏，玩家需要在心理咨询室中面对各种恐惧症挑战。

## 🎮 游戏特色

- **沉浸式3D体验** - WebGL渲染，第一人称视角
- **多种恐惧主题** - 蜘蛛、高度、黑暗、小丑等9个独特关卡
- **理智值系统** - 恐惧会影响你的理智，挑战生存极限
- **环境互动** - 办公室场景，神秘档案书
- **动态音效** - 程序化生成的音效，无需外部资源

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
访问 http://localhost:5173

### 生产构建
```bash
npm run build
npm run preview
```

## 🎯 操作指南

### 基础控制
- **WASD** - 移动
- **鼠标** - 视角
- **Shift** - 奔跑
- **E** - 交互
- **ESC** - 菜单/暂停
- **H** - 显示/隐藏控制提示

### 测试模式 (Ctrl+Shift+G)
- 无敌模式（理智锁定100）
- 解锁所有关卡
- 显示调试信息（位置、速度、FPS）
- 小地图（预留）

### 环境编辑器 (Ctrl+F) - 仅办公室阶段
- **WASD/方向键** - 批量移动所有家具
- **Q/E** - 升降调整
- **R** - 重置为默认位置
- **Ctrl+S** - 保存配置（下载 JSON）
- **Ctrl+F** - 退出编辑器

## 📁 项目结构

```
phobia-game/
├── src/
│   ├── main-modular.js      # 主入口（模块化版本）
│   ├── config.js            # 游戏配置
│   ├── game-loop.js         # 游戏循环
│   ├── audio.js             # 音效系统
│   ├── effects.js           # 特效系统
│   ├── office.js            # 办公室场景
│   ├── office-config.json   # 办公室家具配置
│   ├── levels/              # 各关卡实现
│   │   ├── LEVELS.js        # 关卡配置
│   │   ├── ArachnophobiaLevel.js  # 蜘蛛恐惧
│   │   ├── AcrophobiaLevel.js     # 恐高症
│   │   ├── NyctophobiaLevel.js    # 黑暗恐惧
│   │   └── ...                   # 更多恐惧症关卡
│   ├── enhancements/        # 增强功能包
│   └── [更多系统模块...]
├── index.html           # 主页面
├── vite.config.js       # Vite 构建配置
└── dist/                # 构建输出
```

## 🛠️ 技术栈

- **Three.js 0.160.0** - 3D渲染引擎
- **Vite 5** - 构建工具
- **Web Audio API** - 程序化音效
- **Vanilla JavaScript** - 无框架依赖

## 📝 开发指南

### 添加新关卡

1. 在 `src/levels/` 创建 `YourPhobiaLevel.js`
2. 实现 `create(state)` 和 `update(state, dt)` 静态方法
3. 在 `LEVELS.js` 注册关卡配置
4. 在 `main.js` 的 `levelClasses` 添加映射

```javascript
export class YourPhobiaLevel {
  static create(state) {
    // 初始化场景、灯光、怪物等
  }

  static update(state, dt) {
    // 返回 true 表示完成，false 表示失败
    return null; // 继续
  }
}
```

### 调整办公室布局

1. 进入办公室后按 `Ctrl+F` 开启编辑器
2. 使用 WASD 移动家具到理想位置
3. 按 `Ctrl+S` 保存配置
4. 下载 `office-config.json` 并替换原文件

### 音效系统

所有音效使用 Web Audio API 程序化生成，无需外部文件：
- `playFootstep()` - 脚步声
- `playJumpScare()` - 惊吓音效
- `playAmbient(type)` - 环境音
- `playHeartbeat()` - 心跳声

## 🐛 已知问题

- 第一关光照可能需要进一步调整以改善可见度
- 选择的交互提示可能需要更明显的视觉反馈
- 需要添加更多环境细节和互动元素

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发环境
- Node.js 18+
- npm 9+

### 代码规范
- 使用 ES6+ 语法
- 遵循现有代码风格
- 添加必要的注释

## 📄 许可证

MIT License - 可自由使用、修改和分发

## 🎨 游戏背景

你是一名心理咨询师的访客，在等待时发现了一本神秘的"恐惧症档案"。这本书将带你进入各种恐惧的挑战，只有直面恐惧才能逃脱。

---

**享受游戏，但别太害怕！** 😱
