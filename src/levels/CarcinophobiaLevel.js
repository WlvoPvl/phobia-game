import * as THREE from 'three';

export class CarcinophobiaLevel {
  static create(state) {
    // 螃蟹恐惧症 - 明亮的海滩场景
    state.scene.background = new THREE.Color(0x87CEEB); // 天蓝色
    state.scene.fog = new THREE.Fog(0x87CEEB, 30, 80);
    
    state.crabs = [];
    state.waveTime = 0;

    // 沙滩
    const sandMat = new THREE.MeshStandardMaterial({ 
      color: 0xF4D03F, // 金黄色沙子
      roughness: 0.95 
    });
    const sand = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 100),
      sandMat
    );
    sand.rotation.x = -Math.PI / 2;
    sand.receiveShadow = true;
    state.levelScene.add(sand);

    // 海洋 - 多层波浪效果
    const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x1E90FF, 
      transparent: true, 
      opacity: 0.75,
      roughness: 0.3
    });
    state.oceanParts = [];
    
    // 多个波浪层
    for (let i = 0; i < 8; i++) {
      const water = new THREE.Mesh(
        new THREE.PlaneGeometry(80, 6),
        waterMat.clone()
      );
      water.material.opacity = 0.6 - i * 0.05;
      water.rotation.x = -Math.PI / 2;
      water.position.set(0, 0.02 + i * 0.01, -35 - i * 4);
      state.levelScene.add(water);
      state.oceanParts.push(water);
    }

    // 岩石
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.9 });
    for (let i = 0; i < 20; i++) {
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.5, 0),
        rockMat
      );
      rock.position.set(
        (Math.random() - 0.5) * 60,
        0.15,
        -Math.random() * 70
      );
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      rock.scale.y = 0.5 + Math.random() * 0.3;
      state.levelScene.add(rock);
    }

    // 贝壳装饰
    const shellMat = new THREE.MeshStandardMaterial({ color: 0xfff0f0, roughness: 0.6 });
    for (let i = 0; i < 30; i++) {
      const shell = new THREE.Mesh(
        new THREE.SphereGeometry(0.08 + Math.random() * 0.08, 6, 4),
        shellMat
      );
      shell.position.set(
        (Math.random() - 0.5) * 50,
        0.03,
        -Math.random() * 60
      );
      shell.scale.y = 0.4;
      state.levelScene.add(shell);
    }

    // 生成螃蟹
    for (let i = 0; i < 25; i++) {
      this.createCrab(state, (Math.random() - 0.5) * 50, -5 - Math.random() * 60);
    }

    // 阳光
    const sunLight = new THREE.DirectionalLight(0xffffee, 1.2);
    sunLight.position.set(30, 50, 20);
    sunLight.castShadow = true;
    state.levelScene.add(sunLight);

    // 环境光
    state.levelScene.add(new THREE.AmbientLight(0x6699cc, 0.5));
    state.levelScene.add(new THREE.HemisphereLight(0x87CEEB, 0xF4D03F, 0.4));

    // 太阳
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(4, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );
    sun.position.set(60, 40, -80);
    state.levelScene.add(sun);

    // 终点灯塔
    this.createLighthouse(state);

    state.camera.position.set(0, 1.6, 5);
    state.camera.rotation.set(0, 0, 0);
  }

  static createLighthouse(state) {
    // 灯塔
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.6 });
    
    // 塔身（红白条纹）
    for (let i = 0; i < 8; i++) {
      const stripe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8 - i * 0.05, 0.9 - i * 0.05, 1.5, 12),
        i % 2 === 0 ? towerMat : stripeMat
      );
      stripe.position.set(0, 0.75 + i * 1.5, -65);
      state.levelScene.add(stripe);
    }

    // 灯室
    const lampRoom = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.2, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5 })
    );
    lampRoom.position.set(0, 13, -65);
    state.levelScene.add(lampRoom);

    // 灯光
    const lighthouseLight = new THREE.PointLight(0xffffaa, 2, 30);
    lighthouseLight.position.set(0, 13.5, -65);
    state.levelScene.add(lighthouseLight);
    state.levelLights.push(lighthouseLight);

    // 出口标志
    const exitLight = new THREE.PointLight(0x00ff88, 1.5, 10);
    exitLight.position.set(0, 2, -63);
    state.levelScene.add(exitLight);
  }

  static createCrab(state, x, z) {
    const g = new THREE.Group();
    
    // 蟹壳
    const shellMat = new THREE.MeshStandardMaterial({ 
      color: 0xff4422, 
      roughness: 0.6 
    });
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 8, 6),
      shellMat
    );
    body.position.set(0, 0.2, 0);
    body.scale.set(1.2, 0.5, 1);
    g.add(body);

    // 眼睛
    [-0.12, 0.12].forEach(dx => {
      const eyeStalk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.15, 4),
        new THREE.MeshStandardMaterial({ color: 0xcc3300 })
      );
      eyeStalk.position.set(dx, 0.35, 0.12);
      g.add(eyeStalk);
      
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
      );
      eye.position.set(dx, 0.43, 0.12);
      g.add(eye);

      // 眼睛高光
      const highlight = new THREE.Mesh(
        new THREE.SphereGeometry(0.015, 4, 4),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      highlight.position.set(dx + 0.01, 0.44, 0.14);
      g.add(highlight);
    });
    
    // 螃蟹钳子
    [-1, 1].forEach(side => {
      // 钳子手臂
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.02, 0.2, 4),
        new THREE.MeshStandardMaterial({ color: 0xcc3300 })
      );
      arm.position.set(side * 0.3, 0.2, 0.15);
      arm.rotation.z = side * 0.5;
      g.add(arm);
      
      // 钳子
      const claw = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 6, 4),
        shellMat
      );
      claw.position.set(side * 0.45, 0.22, 0.18);
      claw.scale.set(0.6, 1, 0.8);
      g.add(claw);

      // 钳子尖
      const clawTip = new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.08, 4),
        shellMat
      );
      clawTip.position.set(side * 0.45, 0.22, 0.25);
      clawTip.rotation.x = -Math.PI / 2;
      g.add(clawTip);
    });

    // 腿
    for (let i = 0; i < 4; i++) {
      [-1, 1].forEach(side => {
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.015, 0.01, 0.2, 4),
          new THREE.MeshStandardMaterial({ color: 0xcc3300 })
        );
        const angle = (i / 4) * Math.PI * 0.4 - Math.PI * 0.2;
        leg.position.set(side * (0.2 + i * 0.05), 0.1, -0.1 - i * 0.05);
        leg.rotation.z = side * (0.8 + i * 0.1);
        g.add(leg);
      });
    }
    
    g.position.set(x, 0, z);
    g.userData = { 
      speed: 0.6 + Math.random() * 1.2,
      scuttleTimer: Math.random() * 10,
      scuttleDir: Math.random() * Math.PI * 2
    };
    
    state.levelScene.add(g);
    state.crabs.push(g);
  }

  static update(state, dt) {
    if (!state.levelActive || state.levelIndex !== 7) return;
    state.levelTime += dt;
    const cp = state.camera.position;

    // 海浪动画 - 平滑的潮汐效果
    state.waveTime += dt;
    if (state.oceanParts) {
      state.oceanParts.forEach((water, i) => {
        // 每层波浪有不同的相位和振幅
        const phase = state.waveTime * 0.5 + i * 0.3;
        water.position.z = -35 - i * 4 + Math.sin(phase) * 1.5;
        water.position.y = 0.02 + i * 0.01 + Math.sin(phase * 0.8) * 0.02;
        water.material.opacity = (0.55 - i * 0.05) + Math.sin(phase * 1.2) * 0.05;
      });
    }

    // 灯塔灯光跟随玩家
    if (state.levelLights[0]) {
      state.levelLights[0].position.set(cp.x * 0.3, 13.5, -65);
    }

    // 螃蟹AI
    state.crabs.forEach(crab => {
      crab.userData.scuttleTimer += dt;
      
      const toPlayer = new THREE.Vector3().subVectors(cp, crab.position);
      toPlayer.y = 0;
      const dist = toPlayer.length();
      
      // 螃蟹横向移动
      const sideDir = new THREE.Vector3(-toPlayer.z, 0, toPlayer.x).normalize();
      const moveDir = toPlayer.normalize()
        .multiplyScalar(0.5)
        .add(sideDir.multiplyScalar(Math.sin(crab.userData.scuttleTimer * 8) * 0.6));
      
      // 远离时慢，靠近时快
      const speedMult = dist < 8 ? 1.5 : 0.5;
      crab.position.add(moveDir.multiplyScalar(crab.userData.speed * speedMult * dt));
      
      // 螃蟹上下晃动
      crab.position.y = Math.abs(Math.sin(crab.userData.scuttleTimer * 12)) * 0.03;
      
      // 朝向玩家
      crab.lookAt(new THREE.Vector3(cp.x, 0, cp.z));

      // 靠近时扣理智
      if (dist < 5) {
        state.sanity -= (5 - dist) * dt * 2;
      }

      // 极近距离触发惊吓
      if (dist < 1.5 && !state.scareTriggered) {
        state.scareTriggered = true;
        state.sanity -= 20;
        
        const flash = document.getElementById('scare-flash');
        if (flash) {
          flash.style.background = '#ff4422';
          flash.style.display = 'block';
          flash.style.opacity = '0.5';
          setTimeout(() => { flash.style.opacity = '0'; }, 200);
          setTimeout(() => { flash.style.display = 'none'; }, 400);
        }
        
        const hint = document.getElementById('hint-text');
        if (hint) hint.textContent = '螃蟹跳起来了！';
        
        setTimeout(() => { state.scareTriggered = false; }, 3000);
      }
    });

    // 理智值下降（在海滩上比较慢）
    let drain = 0.06;
    if (cp.z < -20) drain += 0.04;
    if (cp.z < -40) drain += 0.06;
    state.sanity -= drain * dt;

    document.getElementById('sanity-bar').style.width = Math.max(0, state.sanity) + '%';

    // 到达灯塔
    if (cp.z < -58 && !state.levelComplete) {
      state.levelComplete = true;
      this.endLevelWrapper(state, true, '你成功穿越了螃蟹海滩！');
      return;
    }

    // 理智耗尽
    if (state.sanity <= 0) {
      this.endLevelWrapper(state, false, '被螃蟹海洋吞没...');
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
