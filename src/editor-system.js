// 编辑器系统模块 - 从main.js拆分
// 处理环境编辑器功能

import * as THREE from 'three';

export class EditorSystem {
  constructor(state) {
    this.state = state;
    this.editorState = {
      selectedObject: null,
      isDragging: false,
      dragPlane: null,
      ghostObject: null,
      originalPosition: null,
      furnitureData: null,
      flyMode: false,
      noclip: false
    };
    
    this.highlightedObject = null;
    this.editorHintDiv = null;
    this.editorHelpDiv = null;
    this.mouseMoveHandler = null;
  }
  
  async toggleEditorMode() {
    if (!this.state.officeGroup) return;
    
    this.state.editorMode = !this.state.editorMode;
    
    if (this.state.editorMode) {
      console.log('编辑器模式开启 - 鼠标靠近元素高亮 | T选择 | WASD移动 | F确认 | Ctrl+S保存 | ESC退出');
      
      // 加载家具配置
      try {
        const response = await fetch('src/office-config.json');
        this.editorState.furnitureData = await response.json();
        console.log('配置文件已加载');
      } catch (e) {
        console.warn('未找到配置文件，使用默认位置');
        this.editorState.furnitureData = { version: '1.0', furniture: [] };
      }
      
      // 添加鼠标移动监听
      this.mouseMoveHandler = (event) => this.handleEditorMouseMove(event);
      document.addEventListener('mousemove', this.mouseMoveHandler);
      
      // 显示提示
      this.showEditorHint('编辑器模式: 鼠标靠近元素高亮 | T选择 | WASD移动 | F确认 | Ctrl+S保存 | ESC退出');
    } else {
      console.log('编辑器模式关闭');
      this.hideEditorHint();
      this.hideEditorHelp();
      
      // 移除鼠标移动监听
      if (this.mouseMoveHandler) {
        document.removeEventListener('mousemove', this.mouseMoveHandler);
        this.mouseMoveHandler = null;
      }
      
      // 清除选择和高亮
      this.deselectObject();
      this.clearAllHighlights();
    }
  }
  
  handleEditorKeys(e) {
    // 如果有选中的物体，移动该物体
    if (this.editorState.selectedObject) {
      const moveAmount = 0.1;
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.moveSelectedObject(0, 0, -moveAmount);
          break;
        case 'KeyS':
        case 'ArrowDown':
          if (!e.ctrlKey) {
            this.moveSelectedObject(0, 0, moveAmount);
          }
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.moveSelectedObject(-moveAmount, 0, 0);
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.moveSelectedObject(moveAmount, 0, 0);
          break;
        case 'KeyQ':
          this.moveSelectedObject(0, -moveAmount, 0);
          break;
        case 'KeyE':
          this.moveSelectedObject(0, moveAmount, 0);
          break;
      }
    } else {
      // 没有选中物体时，批量移动所有家具
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.moveAllFurniture(0, 0, -0.1);
          break;
        case 'KeyS':
        case 'ArrowDown':
          if (!e.ctrlKey) {
            this.moveAllFurniture(0, 0, 0.1);
          }
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.moveAllFurniture(-0.1, 0, 0);
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.moveAllFurniture(0.1, 0, 0);
          break;
        case 'KeyQ':
          this.moveAllFurniture(0, -0.1, 0);
          break;
        case 'KeyE':
          this.moveAllFurniture(0, 0.1, 0);
          break;
        case 'KeyR':
          this.resetFurniturePositions();
          break;
      }
    }
  }
  
  // 物体选择和高亮系统
  handleEditorMouseMove(event) {
    if (!this.state.editorMode || !this.state.controls.isLocked) return;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.state.camera);
    raycaster.far = 5;
    
    const targets = this.getSelectableObjects();
    const intersects = raycaster.intersectObjects(targets, true);
    
    // 清除之前的高亮
    if (this.highlightedObject && (!intersects.length || this.getParentObject(intersects[0].object) !== this.highlightedObject)) {
      this.unhighlightObject(this.highlightedObject);
      this.highlightedObject = null;
    }
    
    // 高亮新的物体
    if (intersects.length > 0) {
      const target = this.getParentObject(intersects[0].object);
      if (target && target !== this.highlightedObject) {
        this.highlightObject(target);
        this.highlightedObject = target;
      }
    }
  }
  
  getSelectableObjects() {
    const objects = [];
    if (this.state.bookMesh) objects.push(this.state.bookMesh);
    if (this.state.counselorGroup) objects.push(this.state.counselorGroup);
    
    // 查找办公室中的家具
    if (this.state.officeGroup) {
      this.state.officeGroup.children.forEach(child => {
        if (child.userData && child.userData.selectable !== false) {
          objects.push(child);
        }
      });
    }
    return objects;
  }
  
  getParentObject(obj) {
    let current = obj;
    while (current) {
      if (current.parent === this.state.officeGroup || current === this.state.bookMesh || current === this.state.counselorGroup) {
        return current;
      }
      current = current.parent;
    }
    return obj;
  }
  
  highlightObject(obj) {
    if (!obj) return;
    obj.traverse(child => {
      if (child.isMesh && child.material) {
        child.userData.originalEmissive = child.material.emissive ? child.material.emissive.getHex() : 0;
        if (child.material.emissive) {
          child.material.emissive.setHex(0x00ff00);
          child.material.emissiveIntensity = 0.3;
        }
      }
    });
  }
  
  unhighlightObject(obj) {
    if (!obj) return;
    obj.traverse(child => {
      if (child.isMesh && child.material && child.material.emissive) {
        child.material.emissive.setHex(child.userData.originalEmissive || 0);
        child.material.emissiveIntensity = child.userData.originalEmissive ? 0.2 : 0;
      }
    });
  }
  
  clearAllHighlights() {
    this.getSelectableObjects().forEach(obj => this.unhighlightObject(obj));
    this.highlightedObject = null;
  }
  
  handleObjectSelection() {
    if (this.highlightedObject) {
      if (this.editorState.selectedObject === this.highlightedObject) {
        // 取消选择
        this.deselectObject();
      } else {
        // 选择新物体
        this.selectObject(this.highlightedObject);
      }
    }
  }
  
  selectObject(obj) {
    if (!obj) return;
    
    // 取消之前的选择
    if (this.editorState.selectedObject) {
      this.deselectObject();
    }
    
    this.editorState.selectedObject = obj;
    this.editorState.originalPosition = obj.position.clone();
    
    // 高亮为黄色（选中状态）
    obj.traverse(child => {
      if (child.isMesh && child.material && child.material.emissive) {
        child.material.emissive.setHex(0xffff00);
        child.material.emissiveIntensity = 0.5;
      }
    });
    
    this.showEditorHint(`已选择元素 - WASD移动 | F确认 | ESC取消`);
  }
  
  deselectObject() {
    if (this.editorState.selectedObject) {
      this.unhighlightObject(this.editorState.selectedObject);
    }
    this.editorState.selectedObject = null;
    this.editorState.originalPosition = null;
    this.showEditorHint('已取消选择');
  }
  
  confirmMove() {
    if (this.editorState.selectedObject) {
      this.showEditorHint(`位置已确认: (${this.editorState.selectedObject.position.x.toFixed(2)}, ${this.editorState.selectedObject.position.y.toFixed(2)}, ${this.editorState.selectedObject.position.z.toFixed(2)})`);
      this.editorState.originalPosition = this.editorState.selectedObject.position.clone();
    }
  }
  
  cancelMove() {
    if (this.editorState.selectedObject && this.editorState.originalPosition) {
      this.editorState.selectedObject.position.copy(this.editorState.originalPosition);
      this.showEditorHint('位置已恢复');
    }
    this.deselectObject();
  }
  
  // 批量移动所有主要家具
  moveAllFurniture(dx, dy, dz) {
    if (!this.state.officeGroup) return;
    
    const targets = [
      this.findFurnitureByName('desk'),
      this.findFurnitureByName('counselor'),
      this.findFurnitureByName('bookshelf'),
      this.findFurnitureByName('couch'),
      this.findFurnitureByName('coffee_table'),
      this.state.bookMesh,
      this.state.counselorGroup
    ].filter(obj => obj !== null);
    
    targets.forEach(obj => {
      obj.position.x += dx;
      obj.position.y += dy;
      obj.position.z += dz;
    });
    
    // 更新提示
    this.showEditorHint(`批量移动: ${dx.toFixed(2)}, ${dy.toFixed(2)}, ${dz.toFixed(2)}`);
  }
  
  moveSelectedObject(dx, dy, dz) {
    if (!this.editorState.selectedObject) return;
    
    this.editorState.selectedObject.position.x += dx;
    this.editorState.selectedObject.position.y += dy;
    this.editorState.selectedObject.position.z += dz;
    
    // 更新高亮框位置
    if (this.editorState.ghostObject) {
      this.editorState.ghostObject.position.copy(this.editorState.selectedObject.position);
    }
  }
  
  resetFurniturePositions() {
    if (!this.editorState.furnitureData) {
      console.log('没有可重置的配置');
      return;
    }
    
    this.editorState.furnitureData.furniture.forEach(item => {
      const obj = this.findFurnitureByName(item.name);
      if (obj) {
        obj.position.set(item.position.x, item.position.y, item.position.z);
        obj.rotation.set(item.rotation.x, item.rotation.y, item.rotation.z);
      }
    });
    
    console.log('家具位置已重置');
  }
  
  findFurnitureByName(name) {
    switch (name) {
      case 'desk': 
        // 桌子包含bookMesh，找到它所在的group
        if (this.state.bookMesh && this.state.bookMesh.parent) {
          return this.state.bookMesh.parent;
        }
        return this.findObjectByPosition(this.state.officeGroup, 0, 0, -2);
      case 'chair_player':
        return this.findObjectByPosition(this.state.officeGroup, 0, 0, 0.8);
      case 'counselor':
        return this.state.counselorGroup;
      case 'bookshelf':
        return this.findObjectByPosition(this.state.officeGroup, -4.2, 0, -3);
      case 'couch':
        return this.findObjectByPosition(this.state.officeGroup, 3.5, 0, 2);
      case 'coffee_table':
        return this.findObjectByPosition(this.state.officeGroup, 2, 0, 0);
      case 'plant_1':
        return this.findObjectByPosition(this.state.officeGroup, 4.2, 0, -5);
      case 'plant_2':
        return this.findObjectByPosition(this.state.officeGroup, -4.2, 0, 4);
      case 'book_mesh':
        return this.state.bookMesh;
      default:
        return null;
    }
  }
  
  findNestedMesh(parent, propName) {
    // 简化：根据特征查找
    return null;
  }
  
  findObjectByPosition(parent, x, y, z, tolerance = 0.5) {
    if (!parent || !parent.children) return null;
    
    for (const child of parent.children) {
      if (child.position && 
          Math.abs(child.position.x - x) < tolerance &&
          Math.abs(child.position.y - y) < tolerance &&
          Math.abs(child.position.z - z) < tolerance) {
        return child;
      }
      if (child.children && child.children.length > 0) {
        const found = this.findObjectByPosition(child, x, y, z, tolerance);
        if (found) return found;
      }
    }
    return null;
  }
  
  saveFurniturePositions() {
    if (!this.editorState.furnitureData) {
      this.editorState.furnitureData = { version: '1.0', furniture: [] };
    }
    
    // 收集所有重要家具的位置
    const positions = [];
    
    // 映射家具名称到目标位置
    const furnitureNames = [
      'desk', 'chair_player', 'counselor', 'bookshelf', 'couch', 
      'coffee_table', 'plant_1', 'plant_2'
    ];
    
    furnitureNames.forEach(name => {
      const obj = this.findFurnitureByName(name);
      if (obj) {
        positions.push({
          name,
          position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
          rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z }
        });
      }
    });
    
    // 添加书本
    if (this.state.bookMesh) {
      positions.push({
        name: 'book_mesh',
        position: { 
          x: this.state.bookMesh.position.x, 
          y: this.state.bookMesh.position.y, 
          z: this.state.bookMesh.position.z 
        },
        rotation: { 
          x: this.state.bookMesh.rotation.x, 
          y: this.state.bookMesh.rotation.y, 
          z: this.state.bookMesh.rotation.z 
        }
      });
    }
    
    this.editorState.furnitureData.furniture = positions;
    
    // 这里应该实际保存到文件，但在浏览器中只能下载
    const dataStr = JSON.stringify(this.editorState.furnitureData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'office-config.json';
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('配置已保存，请替换 src/office-config.json');
    this.showEditorHint('配置已下载，请手动覆盖文件');
  }
  
  // 编辑器UI提示
  showEditorHint(text) {
    if (!this.editorHintDiv) {
      this.editorHintDiv = document.createElement('div');
      this.editorHintDiv.id = 'editor-hint';
      this.editorHintDiv.style.cssText = `
        position: fixed; top: 60px; right: 20px;
        background: rgba(0,0,0,0.7); color: #0f0;
        padding: 12px; font-family: monospace; font-size: 12px;
        border: 1px solid #0f0; border-radius: 4px;
        z-index: 1000; max-width: 300px;
      `;
      document.body.appendChild(this.editorHintDiv);
    }
    this.editorHintDiv.textContent = text;
    this.editorHintDiv.style.display = 'block';
  }
  
  hideEditorHint() {
    if (this.editorHintDiv) {
      this.editorHintDiv.style.display = 'none';
    }
  }
  
  // 编辑器帮助面板
  showEditorHelp() {
    if (!this.editorHelpDiv) {
      this.editorHelpDiv = document.createElement('div');
      this.editorHelpDiv.id = 'editor-help';
      this.editorHelpDiv.innerHTML = `
        <div id="editor-help-overlay" style="position:fixed; inset:0; z-index:1000; pointer-events:auto;">
          <div id="editor-help-content" style="position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
            background:rgba(0,0,0,0.9); border:2px solid #0f0; border-radius:8px;
            padding:20px 30px; color:#fff; font-family:monospace; min-width:350px;">
            <h3 style="color:#0f0; margin:0 0 15px 0; text-align:center;">编辑器模式 - 操作说明</h3>
            <div style="color:#ccc; line-height:1.8; font-size:13px;">
              <p><strong style="color:#0f0;">鼠标悬停</strong> - 高亮可选择的元素</p>
              <p><strong style="color:#0f0;">T 键</strong> - 选择/取消选择元素</p>
              <p><strong style="color:#0f0;">WASD</strong> - 移动选中元素</p>
              <p><strong style="color:#0f0;">Q / E</strong> - 上下移动元素</p>
              <p><strong style="color:#0f0;">F 键</strong> - 确认移动位置</p>
              <p><strong style="color:#0f0;">ESC</strong> - 取消移动/退出编辑器</p>
              <p><strong style="color:#0f0;">Ctrl + S</strong> - 保存配置 (下载JSON)</p>
              <p><strong style="color:#0f0;">R</strong> - 重置所有位置</p>
              <p style="color:#ff6; margin-top:15px; font-size:11px;">
                提示: 鼠标靠近元素时会高亮显示，按T选择后可移动。保存后需手动替换 src/office-config.json。
              </p>
            </div>
            <p style="text-align:center; color:#666; margin:15px 0 0 0; font-size:11px;">按ESC或点击关闭</p>
          </div>
        </div>
      `;
      this.editorHelpDiv.style.cssText = 'display:none;';
      
      // 点击遮罩层关闭
      this.editorHelpDiv.querySelector('#editor-help-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'editor-help-overlay') {
          this.hideEditorHelp();
        }
      });
      
      // 内容区域阻止事件传播
      this.editorHelpDiv.querySelector('#editor-help-content').addEventListener('click', (e) => {
        e.stopPropagation();
      });
      
      document.body.appendChild(this.editorHelpDiv);
    }
    this.editorHelpDiv.style.display = 'block';
  }
  
  hideEditorHelp() {
    if (this.editorHelpDiv) {
      this.editorHelpDiv.style.display = 'none';
    }
  }
  
  getEditorHelpDiv() {
    return this.editorHelpDiv;
  }
}

export default EditorSystem;