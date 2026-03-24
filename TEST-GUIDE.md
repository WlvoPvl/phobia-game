# 🤖 自动化测试指南

## 快速测试步骤

### 1. 启动开发服务器
```bash
cd "C:\Users\Administrator\phobia-game"
npm run dev
```

### 2. 打开浏览器
访问 http://localhost:5173

### 3. 打开开发者工具
按 `F12` 或 `Ctrl+Shift+I`

### 4. 控制台测试

#### 方式一：快速检查
```javascript
// 在控制台输入
TestBot.quickTest()
```

#### 方式二：完整自动化测试
```javascript
// 在控制台输入
await TestBot.run()
```

#### 方式三：手动控制
```javascript
// 启动游戏
await gameStart()

// 测试书本
openBook()

// 进入第一关
startLevel(0)

// 设置无敌模式
TestAPI.toggleDebug()

// 设置位置
TestAPI.setPlayerPosition(0, 1.6, 0)

// 设置理智
TestAPI.setSanity(100)

// 结束关卡
TestAPI.endLevel(true, '测试通关')

// 返回办公室
returnToOffice()
```

## 常见问题排查

### 问题1: gameStart not available
**现象**: 点击按钮无反应，console显示"gameStart not available yet"
**原因**: 模块尚未加载完成
**解决**: 
1. 刷新页面
2. 等待2-3秒
3. 重新点击按钮

### 问题2: 黑屏
**现象**: 点击开始后全黑
**原因**: 三点定位问题，相机可能在物体内部
**解决**:
```javascript
// 在控制台执行
TestAPI.setPlayerPosition(0, 1.6, 3);
TestAPI.toggleDebug(); // 查看位置是否正确
```

### 问题3: 手电筒不亮
**现象**: 第一关仍然黑暗
**原因**: 手电筒未绑定到相机
**检查**:
```javascript
// 在控制台检查
console.log(state.playerFlashlight);
// 如果是null或undefined，说明手电筒未创建
```

### 问题4: 蜘蛛跟随
**现象**: 返回办公室后蜘蛛还在
**原因**: 场景清理不完全
**检查**:
```javascript
console.log('spiders:', state.spiders.length);
console.log('levelScene:', state.levelScene);
```

## TestAPI 完整文档

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getState()` | 无 | Object | 获取当前游戏状态 |
| `startLevel(n)` | 关卡索引(0-8) | 无 | 开始指定关卡 |
| `endLevel(success, msg)` | boolean, string | 无 | 结束当前关卡 |
| `setPlayerPosition(x,y,z)` | 坐标 | 无 | 设置玩家位置 |
| `setSanity(value)` | 0-100 | 无 | 设置理智值 |
| `toggleDebug()` | 无 | boolean | 切换调试模式 |
| `checkAssets()` | 无 | Object | 检查资源状态 |
| `simulateKeyPress(key)` | 按键名 | 无 | 模拟按键 |
| `runTestSuite()` | 无 | Array | 运行完整测试 |

## 自动化测试机器人

`TestBot` 提供高级测试功能：

```javascript
// 完整测试流程（启动→书本→关卡→游玩→通关→返回）
await TestBot.run();

// 快速状态检查
await TestBot.quickTest();

// 自定义游玩模拟
await TestBot.simulateGameplay();
```

## 手动测试清单

1. **基础流程**
   - [ ] 打开页面
   - [ ] 点击开始按钮
   - [ ] WASD移动确认
   - [ ] 鼠标视角确认
   - [ ] 靠近书本并按E
   - [ ] 书本UI显示
   - [ ] 选择CHAPTER 01
   - [ ] 关卡加载
   - [ ] 手电筒可见
   - [ ] 移动和视角工作
   - [ ] 完成或退出关卡
   - [ ] 返回办公室

2. **快捷键测试**
   - [ ] H - 显示/隐藏提示
   - [ ] Ctrl+Shift+G - 测试模式
   - [ ] Ctrl+F - 编辑器模式
   - [ ] ESC - 设置菜单

3. **进度保存**
   - [ ] 完成第一关
   - [ ] 刷新页面
   - [ ] CHAPTER 02 已解锁

## 截图/录屏

测试时建议：
1. 录制屏幕以复现问题
2. 截图console错误信息
3. 记录重现步骤

---

**Bug报告格式**:
```
问题描述: [简短描述]
重现步骤: [1. 2. 3.]
预期行为: [期望发生什么]
实际行为: [实际发生了什么]
Console错误: [如有]
浏览器版本: [Chrome 120 / Firefox 121]
```
