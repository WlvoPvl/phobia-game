import * as THREE from 'three';

export class ClownPhobiaLevel {
  static create(state) {
    state.scene.background = new THREE.Color(0x8899aa); // 白天背景
    state.scene.fog = new THREE.FogExp2(0x8899aa, 0.003); // 减少雾气
    
    state.clownFigures = [];
    state.clownLights = [];

    // 地面 - 覆盖到终点
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 120),
       new THREE.MeshStandardMaterial({ color: 0x5a9a5a, roughness: 0.8 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -55;
    ground.receiveShadow = true;
    state.levelScene.add(ground);

    // 围墙 - 防止玩家走出地面
     const wallMat = new THREE.MeshStandardMaterial({ color: 0x8a6a5a, roughness: 0.9 });
    const lw = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 120), wallMat);
    lw.position.set(-30, 1.5, -55);
    state.levelScene.add(lw);
    const rw = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 120), wallMat);
    rw.position.set(30, 1.5, -55);
    state.levelScene.add(rw);
    const bw = new THREE.Mesh(new THREE.BoxGeometry(60, 3, 1), wallMat);
    bw.position.set(0, 1.5, -115);
    state.levelScene.add(bw);

    // 彩色灯光
    const lightColors = [0xff00ff, 0x00ffff, 0xffff00, 0xff6600, 0x00ff66];
    for (let i = 0; i < 10; i++) {
      const color = lightColors[i % lightColors.length];
      const light = new THREE.SpotLight(color, 2, 25, Math.PI / 4, 0.5);
      light.position.set((Math.random() - 0.5) * 40, 8, -5 - i * 11);
      light.target.position.set(light.position.x, 0, light.position.z);
      state.levelScene.add(light);
      state.levelScene.add(light.target);
      state.clownLights.push(light);
    }

     state.levelScene.add(new THREE.AmbientLight(0xffffff, 0.8)); // 强环境光

     const sun = new THREE.DirectionalLight(0xffffff, 1.5);
     sun.position.set(0, 10, -5);
     state.levelScene.add(sun);

    // 游乐设施装饰
    this.createDecorations(state);

    // 小丑 - 带追踪AI
    const clownPositions = [
      { x: -6, z: -12 }, { x: 5, z: -22 }, { x: -4, z: -40 },
      { x: 6, z: -55 }, { x: 0, z: -70 }, { x: -8, z: -85 }
    ];
    clownPositions.forEach((pos, idx) => {
      this.createSimpleClown(state, pos.x, pos.z, idx);
    });

    // 终点大门
    const gateMat = new THREE.MeshStandardMaterial({ color: 0xff4488 });
    const gateL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4, 0.5), gateMat);
    gateL.position.set(-3, 2, -108);
    state.levelScene.add(gateL);
    const gateR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4, 0.5), gateMat);
    gateR.position.set(3, 2, -108);
    state.levelScene.add(gateR);
    const gateTop = new THREE.Mesh(new THREE.BoxGeometry(7, 0.5, 0.5), gateMat);
    gateTop.position.set(0, 4, -108);
    state.levelScene.add(gateTop);

    const exitLight = new THREE.PointLight(0x00ff88, 2, 12);
    exitLight.position.set(0, 2, -106);
    state.levelScene.add(exitLight);

    state.camera.position.set(0, 1.6, 5);
    state.camera.rotation.set(0, 0, 0);
    
    state.levelBounds = { minX: -28, maxX: 28, minZ: -112, maxZ: 8 };
  }

  static createDecorations(state) {
    // 旋转木马（圆柱+锥顶）
    for (let i = 0; i < 3; i++) {
      const ride = new THREE.Group();
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 2, 0.3, 12),
        new THREE.MeshStandardMaterial({ color: 0x884488 })
      );
      ride.add(base);
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 3, 6),
        new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.5 })
      );
      pole.position.y = 1.5;
      ride.add(pole);
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(2.5, 1.5, 12),
        new THREE.MeshStandardMaterial({ color: [0xff4444, 0x44ff44, 0x4444ff][i] })
      );
      roof.position.y = 3.5;
      ride.add(roof);
      ride.position.set(-12 + i * 12, 0, -20 - i * 25);
      state.levelScene.add(ride);
    }

    // 帐篷
    for (let i = 0; i < 4; i++) {
      const tent = new THREE.Mesh(
        new THREE.ConeGeometry(2, 3, 6),
        new THREE.MeshStandardMaterial({ color: [0xff6644, 0x44ff66, 0xffff44, 0xff44ff][i] })
      );
      tent.position.set(
        (Math.random() > 0.5 ? 1 : -1) * (8 + Math.random() * 10),
        1.5,
        -15 - i * 22
      );
      state.levelScene.add(tent);
    }

    // 路灯
    for (let z = -10; z > -105; z -= 15) {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 3, 4),
        new THREE.MeshStandardMaterial({ color: 0x444444 })
      );
      pole.position.set((Math.random() > 0.5 ? 1 : -1) * 15, 1.5, z);
      state.levelScene.add(pole);
      const bulb = new THREE.PointLight(0xffaa44, 0.8, 8);
      bulb.position.set(pole.position.x, 3.2, z);
      state.levelScene.add(bulb);
    }
  }

  static createSimpleClown(state, x, z, index) {
    const g = new THREE.Group();
    const bodyColors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 0xff44ff, 0xff8800];
    const cm = new THREE.MeshStandardMaterial({ color: bodyColors[index % 6] });
    
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.4, 8), cm);
    body.position.y = 0.7; g.add(body);
    
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffccaa });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), headMat);
    head.position.y = 1.6; g.add(head);

    const nose = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0x440000 })
    );
    nose.position.set(0, 1.6, 0.3); g.add(nose);

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    [-0.1, 0.1].forEach(dx => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), eyeMat);
      eye.position.set(dx, 1.7, 0.25); g.add(eye);
    });

    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.35, 6), cm);
    hat.position.y = 2.0; g.add(hat);
    
    g.position.set(x, 0, z);
    g.userData = { type: 'clown', index, scared: false, chaseSpeed: 1.5 + Math.random() * 0.5 };
    
    state.levelScene.add(g);
    state.clownFigures.push(g);
  }

  static update(state, dt) {
    if (!state.levelActive || state.levelIndex !== 5) return;
    state.levelTime += dt;
    const cp = state.camera.position;

    // 小丑动画 + 追踪AI
    state.clownFigures.forEach((fig, idx) => {
      // 摆动动画
      fig.rotation.y += Math.sin(state.levelTime * 0.5 + idx) * 0.01;
      fig.position.y = Math.abs(Math.sin(state.levelTime * 2 + idx)) * 0.05;

      // 灯光闪烁
      if (state.clownLights[idx]) {
        state.clownLights[idx].intensity = 1.5 + Math.sin(state.levelTime * 3 + idx) * 0.8;
      }

      const dist = cp.distanceTo(fig.position);

      // 追踪玩家 - 距离小于15时开始追踪
      if (dist < 15 && dist > 2) {
        const dir = new THREE.Vector3().subVectors(cp, fig.position);
        dir.y = 0;
        dir.normalize();
        fig.position.add(dir.multiplyScalar(fig.userData.chaseSpeed * dt));
        fig.lookAt(cp.x, fig.position.y, cp.z);
      }

      // 靠近惊吓
      if (dist < 3 && !fig.userData.scared) {
        fig.userData.scared = true;
        state.sanity -= 15;
        
        const flash = document.getElementById('scare-flash');
        if (flash) {
          flash.style.background = '#ff00ff';
          flash.style.display = 'block';
          flash.style.opacity = '0.3';
          setTimeout(() => { flash.style.opacity = '0'; }, 150);
          setTimeout(() => { flash.style.display = 'none'; }, 300);
        }
        
        const hint = document.getElementById('hint-text');
        if (hint) hint.textContent = '它在看着你...快跑！';
        
        setTimeout(() => { fig.userData.scared = false; }, 5000);
      }
    });

    // 理智值下降
    let drain = 0.1;
    if (-cp.z > 30) drain += 0.05;
    if (-cp.z > 60) drain += 0.08;
    state.sanity -= drain * dt;

    document.getElementById('sanity-bar').style.width = Math.max(0, state.sanity) + '%';

    // 到达出口
    if (cp.z < -105 && !state.levelComplete) {
      state.levelComplete = true;
      this.endLevelWrapper(state, true, '你逃离了小丑的游乐场！');
      return;
    }

    if (state.sanity <= 0) {
      this.endLevelWrapper(state, false, '小丑的微笑让你崩溃...');
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
