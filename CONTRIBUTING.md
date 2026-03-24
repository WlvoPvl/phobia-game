# 贡献指南

感谢您对 Phobia 项目的关注！本文档将帮助您快速上手贡献代码。

## 🚦 开发前准备

### 环境要求
- Node.js 18+
- npm 9+

### 初始设置
```bash
git clone <your-repo-url>
cd phobia-game
npm install
```

### 运行开发服务器
```bash
npm run dev
```
访问 http://localhost:5173 查看游戏。

## 🔧 开发流程

### 1. 创建分支
```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/issue-number
```

### 2. 代码规范

- 使用 **ES6+** 语法
- 遵循 **Two Spaces** 缩进
- 类名使用 **PascalCase**
- 函数/变量使用 **camelCase**
- 常量使用 **UPPER_SNAKE_CASE**
- 添加必要的注释（特别是复杂逻辑）

### 3. 测试修改

**手动测试清单：**
- [ ] 游戏可以正常启动
- [ ] 办公室场景完整显示
- [ ] 书本交互正常（靠近按 E）
- [ ] 第一关可以进入并通关
- [ ] 返回办公室后场景正常
- [ ] 无控制台错误

**使用测试模式：**
按 `Ctrl+Shift+G` 开启：
- 验证无敌模式
- 检查调试信息显示
- 确认所有关卡解锁

### 4. 编辑器模式测试

在办公室按 `Ctrl+F`：
- 批量移动家具
- 重置位置（R）
- 保存配置（Ctrl+S）

### 5. 提交更改
```bash
git add .
git commit -m "feat: add new enemy type"  # 使用约定式提交
# 或
git commit -m "fix: resolve flashlight visibility"
```

**提交类型：**
- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 代码格式（不影响功能）
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具变更

### 6. 推送并创建 PR
```bash
git push origin feature/your-feature-name
```

在 GitHub 上创建 Pull Request，详细描述：
- 修改内容
- 测试情况
- 截图/视频（如适用）

## 📐 项目架构

### 核心文件说明

| 文件 | 职责 |
|------|------|
| `src/main.js` | 游戏主循环、状态管理、事件处理 |
| `src/config.js` | 游戏配置（移动、理智、关卡参数） |
| `src/audio.js` | Web Audio API 音效生成 |
| `src/effects.js` | 粒子、闪光、晕影等特效 |
| `src/office.js` | 办公室场景构建 |
| `src/levels/*.js` | 各关卡特定逻辑 |

### 状态管理

游戏全局状态存储在 `state` 对象中：
```javascript
{
  phase: 'office' | 'level' | 'book' | 'end',
  sanity: 0-100,
  levelIndex: number,
  levelActive: boolean,
  officeGroup: THREE.Group,
  levelScene: THREE.Group,
  // ... 更多
}
```

### 关卡开发模板

```javascript
import * as THREE from 'three';

export class YourPhobiaLevel {
  static create(state) {
    // 1. 设置背景和雾
    state.scene.background = new THREE.Color(...);
    state.scene.fog = new THREE.Fog(...);

    // 2. 创建地板、墙壁、天花板

    // 3. 添加灯光
    state.levelLights.push(light);

    // 4. 放置怪物/道具
    // state.monsters = [];

    // 5. 设置相机初始位置
    state.camera.position.set(...);
  }

  static update(state, dt) {
    // 每帧调用
    // 返回 true = 完成, false = 失败, null = 继续

    const time = state.levelTime;

    // 更新怪物AI
    // 检查胜利条件
    // 更新理智值

    if (state.sanity <= 0) return false;
    return null;
  }
}
```

## 🎨 美术资源

当前项目**无外部美术资源**，全部使用 Three.js 原生几何体。如需添加模型：

1. 建议格式：GLTF/GLB
2. 放入 `public/models/`
3. 使用 `GLTFLoader` 加载
4. 注意性能优化（网格合并、LOD）

## 🔊 音效扩展

当前使用 Web Audio API 合成。添加新音效：

```javascript
// 在 audio.js 中添加方法
playYourSound() {
  if (!this.enabled || !this.sfxGain) return;

  const osc = this.context.createOscillator();
  // ... 配置
}
```

## 🐛 调试技巧

### 开启调试模式
`Ctrl+Shift+G` 显示：
- 玩家坐标
- 速度向量
- 当前理智
- FPS

### 查看 Three.js 对象
```javascript
// 在控制台
state.scene.children.forEach(c => console.log(c));
```

### 性能分析
使用 Chrome DevTools Performance 面板记录游戏帧。

## 📏 性能优化

- 限制 `draw calls` - 合并几何体
- 使用 `InstancedMesh` 批量相同物体
- 控制粒子数量（<100）
- 阴影贴图分辨率 512-1024
- 禁用不必要的 lights.castShadow

## 🧪 测试建议

### 功能测试
- [ ] 所有关卡可进入
- [ ] 胜利/失败条件正确触发
- [ ] 进度保存（localStorage）
- [ ] 设置菜单各选项生效
- [ ] 编辑器保存的配置正确加载

### 兼容性
- [ ] Chrome (推荐)
- [ ] Firefox
- [ ] Edge
- [ ] Safari (已知问题：某些音效API)

### 输入设备
- [ ] 鼠标+键盘
- [ ] 指针锁定 API 正常工作

## ❓ 常见问题

**Q: 指针锁定不工作？**
A: 浏览器要求用户手势触发，确保点击才开始游戏。

**Q: 音效无声？**
A: 检查浏览器是否自动播放限制，首次交互后音频上下文激活。

**Q: 性能差？**
A: 尝试降低阴影质量，关闭特效，或更新显卡驱动。

## 📚 参考资料

- [Three.js 官方文档](https://threejs.org/docs/)
- [PointerLockControls](https://threejs.org/docs/#examples/en/controls/PointerLockControls)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Vite 指南](https://vitejs.dev/guide/)

## 💬 交流

- 提交 Issue 报告问题
- 加入 Discussions 讨论想法
- 查看 CONTRIBUTING.md 了解详情

---

**Happy Coding!** 让我们一起打造更恐怖的体验 🎃
