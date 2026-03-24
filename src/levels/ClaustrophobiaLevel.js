import * as THREE from 'three';

export class ClaustrophobiaLevel {
  static create(state) {
    state.scene.background = new THREE.Color(0x0a0a15);
    state.scene.fog = new THREE.Fog(0x0a0a15, 8, 35);
    
    state.corridorWidth = 4;
    state.wallSegments = [];
    
    const wallMat = new THREE.MeshStandardMaterial({ 
      color: 0x2a2a3a, roughness: 0.85 
    });
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.9 });
    
    const corridorLength = 80;
    const segmentLength = 2;
    const numSegments = Math.floor(corridorLength / segmentLength);
    
    // 地面
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(6, corridorLength),
      new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = -corridorLength / 2;
    state.levelScene.add(floor);
    
    // 墙壁和天花板 - 逐段创建，宽度逐渐变窄，天花板逐渐压低
    for (let i = 0; i < numSegments; i++) {
      const z = -i * segmentLength;
      const progress = i / numSegments;
      const width = 2.2 - progress * 1.4; // 从2.2逐渐变窄到0.8
      const ceilingH = 3 - progress * 1.5; // 从3.0逐渐压低到1.5
      
      // 左墙
      const lw = new THREE.Mesh(new THREE.BoxGeometry(0.2, ceilingH, segmentLength + 0.1), wallMat.clone());
      lw.position.set(-width / 2 - 0.1, ceilingH / 2, z - segmentLength / 2);
      state.levelScene.add(lw);
      
      // 右墙
      const rw = new THREE.Mesh(new THREE.BoxGeometry(0.2, ceilingH, segmentLength + 0.1), wallMat.clone());
      rw.position.set(width / 2 + 0.1, ceilingH / 2, z - segmentLength / 2);
      state.levelScene.add(rw);
      
      // 天花板
      const ce = new THREE.Mesh(new THREE.PlaneGeometry(width + 0.4, segmentLength + 0.1), ceilMat.clone());
      ce.rotation.x = Math.PI / 2;
      ce.position.set(0, ceilingH, z - segmentLength / 2);
      state.levelScene.add(ce);
      
      state.wallSegments.push({ left: lw, right: rw, ceiling: ce, z, width, ceilingH });
    }
    
    // 起点灯光（跟随玩家）
     const startLight = new THREE.PointLight(0xffffcc, 2.5, 8);
    startLight.position.set(0, 2, 0);
    state.levelScene.add(startLight);
    state.levelLights.push(startLight);
    
    // 出口绿光
    const exitLight = new THREE.PointLight(0x00ff44, 1.5, 10);
    exitLight.position.set(0, 1.5, -78);
    state.levelScene.add(exitLight);
    state.levelLights.push(exitLight);
    
    // 环境光
     state.levelScene.add(new THREE.AmbientLight(0xaaaaaa, 1.0));
    
    state.camera.position.set(0, 1.6, 0);
    state.camera.rotation.set(0, 0, 0);
    state.levelBounds = null;
  }

  static update(state, dt) {
    if (!state.levelActive || state.levelIndex !== 2) return;
    state.levelTime += dt;
    const cp = state.camera.position;
    const progress = Math.max(0, Math.min(1, -cp.z / 80));
    
    // 更新墙壁和天花板位置
    state.wallSegments.forEach(seg => {
      const segProgress = Math.max(0, Math.min(1, -seg.z / 80));
      const currentWidth = 2.2 - segProgress * 1.4;
      const currentCeilingH = 3 - segProgress * 1.5;
      
      seg.left.position.x = -currentWidth / 2 - 0.1;
      seg.left.position.y = currentCeilingH / 2;
      seg.left.scale.y = currentCeilingH / 3;
      
      seg.right.position.x = currentWidth / 2 + 0.1;
      seg.right.position.y = currentCeilingH / 2;
      seg.right.scale.y = currentCeilingH / 3;
      
      seg.ceiling.position.y = currentCeilingH;
    });

    // 灯光跟随玩家
    if (state.levelLights[0]) {
      state.levelLights[0].position.copy(cp);
      state.levelLights[0].position.y = 2;
    }

    // 灯光闪烁
    state.levelLights.forEach((light, i) => {
      if (i === 0) {
        light.intensity = 1.2 + Math.random() * 0.6;
      }
    });

    // 雾随进度加重
    state.scene.fog.near = 3 - progress * 1.5;
    state.scene.fog.far = 15 - progress * 8;
    
    // 天花板压迫感 - 理智随进度加速下降
    const drain = 0.15 + progress * 0.3;
    state.sanity -= drain * dt;
    
    // 低理智时屏幕抖动
    if (state.sanity < 40) {
      const shake = (40 - state.sanity) / 40 * 0.003;
      state.camera.rotation.z = Math.sin(state.levelTime * 8) * shake;
    }

    document.getElementById('sanity-bar').style.width = Math.max(0, state.sanity) + '%';

    // 到达出口
    if (cp.z < -77 && !state.levelComplete) {
      state.levelComplete = true;
      this.endLevelWrapper(state, true, '你成功逃出了越来越窄的空间！');
      return;
    }

    if (state.sanity <= 0) {
      this.endLevelWrapper(state, false, '被压垮在无尽的狭窄中...');
      return false;
    }

    return null;
  }

  static endLevelWrapper(state, success, msg) {
    if (typeof window !== 'undefined' && window._endLevel) {
      window._endLevel(success, msg);
    }
  }
}
