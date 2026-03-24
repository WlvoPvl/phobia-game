import * as THREE from 'three';

export class NyctophobiaLevel {
  static create(state) {
    // 黑暗恐惧症 - 玩家有手电筒，但黑暗中有东西
    state.scene.background = new THREE.Color(0x000005);
    state.scene.fog = new THREE.FogExp2(0x000005, 0.08);
    
    const wallMat = new THREE.MeshStandardMaterial({ 
      color: 0x0a0a0a, 
      roughness: 1 
    });
    const rH = 3;

    // 地面
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 80),
      new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.95 })
    );
    floor.rotation.x = -Math.PI / 2;
    state.levelScene.add(floor);

    // 天花板
    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 80),
      new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.95 })
    );
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = rH;
    state.levelScene.add(ceil);

    // 创建房间和走廊
    function aw(x, z, w, h, ry) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
      m.position.set(x, h / 2, z);
      m.rotation.y = ry;
      state.levelScene.add(m);
    }
    
    // 入口房间
    aw(0, 10, 8, rH, 0);
    aw(-4, 7, 6, rH, Math.PI / 2);
    aw(4, 7, 6, rH, -Math.PI / 2);
    aw(-3, 4, 3, rH, 0);
    aw(3, 4, 3, rH, 0);

    // 第一个走廊
    aw(-1.5, -5, 16, rH, Math.PI / 2);
    aw(1.5, -5, 16, rH, -Math.PI / 2);
    aw(0, -14, 10, rH, Math.PI);
    aw(-5, -10, 8, rH, Math.PI / 2);
    aw(5, -10, 8, rH, -Math.PI / 2);

    // 第二个房间
    aw(-2, -22, 3, rH, 0);
    aw(2, -22, 3, rH, 0);
    aw(-1.5, -28, 18, rH, Math.PI / 2);
    aw(1.5, -28, 18, rH, -Math.PI / 2);
    aw(0, -38, 12, rH, Math.PI);

    // 第三个走廊
    aw(-1.5, -48, 22, rH, Math.PI / 2);
    aw(1.5, -48, 22, rH, -Math.PI / 2);
    aw(0, -60, 14, rH, Math.PI);

    // 出口区域
    aw(-3, -68, 6, rH, Math.PI / 2);
    aw(3, -68, 6, rH, -Math.PI / 2);
    aw(0, -72, 8, rH, Math.PI);

    // 微弱的环境光（让玩家能看到一点轮廓）
    state.levelScene.add(new THREE.AmbientLight(0x111122, 0.08));

    // 出口绿光
    const exitL = new THREE.PointLight(0x00ff44, 0.8, 8);
    exitL.position.set(0, 1.5, -70);
    state.levelScene.add(exitL);
    state.levelLights.push(exitL);

    // 玩家手电筒 - 绑定到相机（跟随视角）
    const flashlight = new THREE.SpotLight(0xffeecc, 5, 25, Math.PI / 4, 0.3, 1);
    flashlight.position.set(0, 0, 0);
    
    // 创建目标点并添加到相机
    const target = new THREE.Object3D();
    target.position.set(0, 0, -1);
    state.camera.add(target);
    flashlight.target = target;
    
    // 手电筒添加到相机（跟随相机移动和旋转）
    state.camera.add(flashlight);
    state.playerFlashlight = flashlight;
    
    // 同时也添加到关卡灯光列表
    state.levelLights.push(flashlight);

    // 影子人
    state.shadowFigures = [];
    const sm = new THREE.MeshStandardMaterial({ 
      color: 0x010101,
      emissive: 0x000000
    });
    
    [
      { x: -4, z: -13 },
      { x: 0, z: -6.5 },
      { x: 3.5, z: -30 },
      { x: -2, z: -42 },
      { x: 2, z: -55 }
    ].forEach(p => {
      const sg = new THREE.Group();
      
      // 身体
      const torso = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.18, 1.6, 6),
        sm
      );
      torso.position.set(0, 0.8, 0);
      sg.add(torso);
      
      // 头
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 6, 6),
        sm
      );
      head.position.set(0, 1.7, 0);
      sg.add(head);

      // 眼睛（微弱发光）
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x220000 });
      [-0.05, 0.05].forEach(dx => {
        const eye = new THREE.Mesh(
          new THREE.SphereGeometry(0.02, 4, 4),
          eyeMat
        );
        eye.position.set(dx, 1.75, 0.1);
        sg.add(eye);
      });
      
      sg.position.set(p.x, 0, p.z);
      sg.visible = false;
      sg.userData = { type: 'shadow', activated: false };
      state.levelScene.add(sg);
      state.shadowFigures.push(sg);
    });

    state.nycto = { 
      blackoutTimer: 0, 
      blackoutsTriggered: 0, 
      shadowsActivated: [false, false, false, false, false],
      flashlightFlicker: 0,
      hintShown: false
    };
    
    state.camera.position.set(0, 1.6, 8);
    state.camera.rotation.set(0, 0, 0);
    
    // 显示手电筒提示
    setTimeout(() => {
      const hint = document.getElementById('hint-text');
      if (hint && state.levelIndex === 3 && state.levelActive) {
        hint.textContent = '手电筒已开启！照向影子人可以驱散它们。';
        state.nycto.hintShown = true;
      }
    }, 2000);
  }

  static update(state, dt) {
    if (!state.levelActive || state.levelIndex !== 3) return;
    state.levelTime += dt;
    const cp = state.camera.position;

    // 手电筒闪烁效果（手电筒已绑定到相机，不需要更新位置）
    if (state.playerFlashlight) {
      state.nycto.flashlightFlicker += dt;
      if (state.nycto.flashlightFlicker > 0.3) {
        state.nycto.flashlightFlicker = 0;
        const flicker = Math.sin(state.levelTime * 20) * 0.15 + 0.85;
        const randomFlicker = Math.random() < 0.02 ? 0.3 : 1;
        state.playerFlashlight.intensity = 3 * flicker * randomFlicker;
      }
    }

    // 更新跟随玩家的点光源
    if (state.levelLights[1]) {
      state.levelLights[1].position.copy(cp);
    }

    // 黑暗事件 - 手电筒突然熄灭
    if (state.nycto) {
      state.nycto.blackoutTimer += dt;
      const blackoutInterval = 12 + state.nycto.blackoutsTriggered * 4;
      
      if (state.nycto.blackoutTimer > blackoutInterval && state.nycto.blackoutsTriggered < 4) {
        state.nycto.blackoutsTriggered++;
        state.nycto.blackoutTimer = 0;
        
        // 手电筒熄灭
        if (state.playerFlashlight) {
          state.playerFlashlight.intensity = 0;
        }
        
        const hint = document.getElementById('hint-text');
        if (hint) hint.textContent = '灯灭了...别动...';
        
        setTimeout(() => {
          if (state.levelActive && state.playerFlashlight) {
            state.playerFlashlight.intensity = 3;
            if (hint) hint.textContent = '继续前进...';
          }
        }, 3000);
      }

      // 影子人检测
      state.shadowFigures.forEach((fig, i) => {
        if (!fig.userData.activated) {
          const dist = cp.distanceTo(fig.position);
          
          // 手电筒照到时会消失
          if (dist < 6 && state.playerFlashlight && state.playerFlashlight.intensity > 1) {
            // 检查是否在手电筒范围内
            const dir = state.camera.getWorldDirection(new THREE.Vector3());
            const toFig = new THREE.Vector3().subVectors(fig.position, cp).normalize();
            const dot = dir.dot(toFig);
            
            if (dot > 0.7) {
              // 手电筒照到，影子人消失
              fig.visible = false;
            }
          }
          
          // 靠近时触发
          if (dist < 3 && !fig.userData.activated) {
            fig.visible = true;
            fig.userData.activated = true;
            state.sanity -= 15;
            
            const hint = document.getElementById('hint-text');
            if (hint) hint.textContent = '那里有人...';
            
            setTimeout(() => {
              fig.visible = false;
            }, 2000);
          }
        }
      });
    }

    // 理智值下降
    let drain = 0.1;
    if (cp.z < -15) drain += 0.05;
    if (cp.z < -35) drain += 0.08;
    if (cp.z < -55) drain += 0.1;
    
    // 手电筒熄灭时加速下降
    if (state.playerFlashlight && state.playerFlashlight.intensity < 0.5) {
      drain += 0.25;
    }
    
    state.sanity -= drain * dt;

    // 低理智视觉效果
    if (state.sanity < 50) {
      const shakeAmount = (50 - state.sanity) / 50 * 0.003;
      state.camera.rotation.z = Math.sin(state.levelTime * 8) * shakeAmount;
    }

    document.getElementById('sanity-bar').style.width = Math.max(0, state.sanity) + '%';

    // 到达出口
    if (cp.z < -68 && !state.levelComplete) {
      state.levelComplete = true;
      this.endLevelWrapper(state, true, '你战胜了对黑暗的恐惧！');
      return;
    }

    // 理智耗尽
    if (state.sanity <= 0) {
      this.endLevelWrapper(state, false, '被黑暗彻底吞噬...');
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
