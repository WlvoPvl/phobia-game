import * as THREE from 'three';

export class SpacePhobiaLevel {
  static create(state) {
    state.scene.background = new THREE.Color(0x000008);
    state.scene.fog = new THREE.FogExp2(0x000008, 0.0015);
    
    state.cosmicPlatforms = [];
    state.spaceJetpack = {
      velocity: new THREE.Vector3(),
      fuel: 100,
      maxFuel: 100,
      fuelRechargeRate: 5,
      thrustPower: 8,
      drag: 0.98,
      isZeroG: true
    };
    state.meteors = [];
    state.blackHole = null;
    state.spaceStation = null;

    // 星空背景 - 多层不同大小
    for (let layer = 0; layer < 3; layer++) {
      const starGeo = new THREE.BufferGeometry();
      const starCount = 2000 + layer * 1000;
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);
      
      for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 600;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 600;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 600;
        // 随机星色：白、蓝、黄、红
        const c = Math.random();
        if (c < 0.5) { colors[i*3]=0.9; colors[i*3+1]=0.9; colors[i*3+2]=1.0; }
        else if (c < 0.7) { colors[i*3]=0.6; colors[i*3+1]=0.7; colors[i*3+2]=1.0; }
        else if (c < 0.9) { colors[i*3]=1.0; colors[i*3+1]=0.9; colors[i*3+2]=0.6; }
        else { colors[i*3]=1.0; colors[i*3+1]=0.5; colors[i*3+2]=0.4; }
      }
      
      starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      state.levelScene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ 
        size: 1.5 + layer * 0.3, vertexColors: true 
      })));
    }

    // 星云 - 彩色半透明球体
    const nebulaColors = [0x4466ff, 0xff4488, 0x44ffaa, 0xffaa44];
    for (let i = 0; i < 6; i++) {
      const nebula = new THREE.Mesh(
        new THREE.SphereGeometry(15 + Math.random() * 20, 16, 16),
        new THREE.MeshBasicMaterial({
          color: nebulaColors[i % nebulaColors.length],
          transparent: true,
          opacity: 0.03 + Math.random() * 0.04,
          side: THREE.BackSide
        })
      );
       nebula.position.set(
         (Math.random() - 0.5) * 200,
         (Math.random() - 0.5) * 80,
         -250 - Math.random() * 300
       );
      state.levelScene.add(nebula);
    }

    // 太阳
    const sunGeo = new THREE.SphereGeometry(8, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(100, 50, -150);
    state.levelScene.add(sun);

    const sunLight = new THREE.PointLight(0xffcc66, 5.0, 200);
    sunLight.position.set(100, 50, -150);
    state.levelScene.add(sunLight);

    // 黑洞
    this.createBlackHole(state);

    // 漂浮陨石碎片（替代台阶）
    const fragMat = new THREE.MeshStandardMaterial({ 
      color: 0x889999, roughness: 0.7, metalness: 0.3
    });
    for (let i = 0; i < 15; i++) {
      const size = 1 + Math.random() * 1.5;
      const frag = new THREE.Mesh(
        new THREE.DodecahedronGeometry(size, 0),
        fragMat.clone()
      );
      frag.material.color.setHex([0x889999, 0x776655, 0x998877, 0x667788][Math.floor(Math.random()*4)]);
      frag.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 8,
        -8 - i * 8
      );
      frag.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
      frag.userData = { rotSpeed: 0.1 + Math.random() * 0.3, bobSpeed: 0.5 + Math.random() * 0.5 };
      state.levelScene.add(frag);
      state.cosmicPlatforms.push(frag);
      
      // 碎片指示灯
      const pl = new THREE.PointLight(0x6688ff, 0.4, 6);
      pl.position.copy(frag.position);
      state.levelScene.add(pl);
    }

    // 陨石路径
    this.createMeteors(state);

    // 空间站（终点）
    this.createSpaceStation(state);

    // 环境光 - 略微增强
    state.levelScene.add(new THREE.AmbientLight(0x334466, 0.3));

    // 远处恒星光芒
    const starLight = new THREE.PointLight(0xaaccff, 0.6, 150);
    starLight.position.set(60, 40, -60);
    state.levelScene.add(starLight);

    state.camera.position.set(0, 0, 0);
    state.camera.rotation.set(0, 0, 0);
    
    state._grounded = true;
    state.levelBounds = null;
    
    setTimeout(() => {
      const hint = document.getElementById('hint-text');
      if (hint && state.levelIndex === 4 && state.levelActive) {
        hint.textContent = '零重力 - Space喷射向上 | 跟随陨石光迹前进';
      }
    }, 2000);
  }

  static createBlackHole(state) {
    const group = new THREE.Group();
    
    // 黑洞核心（不旋转）
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(5, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    group.add(core);

    // 吸积盘（旋转）
    const disk = new THREE.Mesh(
      new THREE.RingGeometry(6, 18, 64),
      new THREE.MeshBasicMaterial({ 
        color: 0xff4400, transparent: true, opacity: 0.5, side: THREE.DoubleSide
      })
    );
    disk.rotation.x = Math.PI / 2;
    group.add(disk);

    // 外环光晕
    const outer = new THREE.Mesh(
      new THREE.RingGeometry(18, 25, 64),
      new THREE.MeshBasicMaterial({ 
        color: 0xff6600, transparent: true, opacity: 0.2, side: THREE.DoubleSide
      })
    );
    outer.rotation.x = Math.PI / 2;
    group.add(outer);

    group.position.set(-80, 10, -70);
    state.levelScene.add(group);
    state.blackHole = group;
  }

  static createMeteors(state) {
    const meteorMat = new THREE.MeshStandardMaterial({ 
      color: 0xaabbcc, roughness: 0.6, metalness: 0.4, emissive: 0x223344, emissiveIntensity: 0.3
    });

    for (let i = 0; i < 12; i++) {
      const meteor = new THREE.Group();
      
      const body = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.5, 0),
        meteorMat.clone()
      );
      meteor.add(body);

      // 发光尾迹
      const tail = new THREE.Mesh(
        new THREE.ConeGeometry(0.3, 3, 4),
        new THREE.MeshBasicMaterial({ 
          color: 0x66aaff, transparent: true, opacity: 0.6 
        })
      );
      tail.position.z = 1.5;
      tail.rotation.x = Math.PI / 2;
      meteor.add(tail);

      meteor.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 5,
        -15 - i * 10
      );
      meteor.userData = { 
        rotSpeed: 0.5 + Math.random() * 0.5,
        bobSpeed: 1 + Math.random()
      };
      
      state.levelScene.add(meteor);
      state.meteors.push(meteor);
    }
  }

  static createSpaceStation(state) {
    state.spaceStation = new THREE.Group();
    
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 6, 8),
      new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 })
    );
    body.rotation.z = Math.PI / 2;
    state.spaceStation.add(body);

    const panelMat = new THREE.MeshStandardMaterial({ color: 0x2244aa, metalness: 0.5 });
    [-1, 1].forEach(side => {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.1, 4, 2), panelMat);
      panel.position.set(0, side * 3, 0);
      state.spaceStation.add(panel);
    });

    state.spaceStation.add(new THREE.PointLight(0xffffff, 1, 15));
    const entryLight = new THREE.PointLight(0x00ff88, 2, 12);
    entryLight.position.set(3, 0, 0);
    state.spaceStation.add(entryLight);

    state.spaceStation.position.set(0, 0, -115);
    state.levelScene.add(state.spaceStation);
  }

  static update(state, dt) {
    if (!state.levelActive || state.levelIndex !== 4) return;
    state.levelTime += dt;
    const cp = state.camera.position;
    const jp = state.spaceJetpack;

    // 零重力移动
    const forward = state.moving.forward ? 1 : 0;
    const backward = state.moving.backward ? 1 : 0;
    const left = state.moving.left ? 1 : 0;
    const right = state.moving.right ? 1 : 0;
    const up = state.moving.jump ? 1 : 0;

    const cameraDir = new THREE.Vector3();
    state.camera.getWorldDirection(cameraDir);
    const rightDir = new THREE.Vector3();
    rightDir.crossVectors(cameraDir, state.camera.up).normalize();

    if (jp.fuel > 0) {
      const thrust = jp.thrustPower * dt;
      if (forward) jp.velocity.add(cameraDir.clone().multiplyScalar(thrust));
      if (backward) jp.velocity.add(cameraDir.clone().multiplyScalar(-thrust * 0.5));
      if (left) jp.velocity.add(rightDir.clone().multiplyScalar(-thrust));
      if (right) jp.velocity.add(rightDir.clone().multiplyScalar(thrust));
      if (up) {
        jp.velocity.y += thrust;
        jp.fuel -= dt * 15;
      }
    }

    // 燃料再生
    if (!up && jp.fuel < jp.maxFuel) {
      jp.fuel = Math.min(jp.maxFuel, jp.fuel + jp.fuelRechargeRate * dt);
    }

    // 微弱向下漂移
    jp.velocity.y -= 0.2 * dt;

    // 阻力
    jp.velocity.multiplyScalar(jp.drag);

    // 更新位置
    cp.add(jp.velocity.clone().multiplyScalar(dt));

    // 空间站检测
    if (state.spaceStation) {
      const distToStation = cp.distanceTo(state.spaceStation.position);
      if (distToStation < 8 && !state.levelComplete) {
        state.levelComplete = true;
        this.endLevelWrapper(state, true, '你成功抵达空间站！');
        return;
      }
    }

    // 太空迷失保护
    const distFromPath = Math.sqrt(cp.x * cp.x + cp.z * cp.z);
    if (distFromPath > 80 || cp.y < -30 || cp.y > 50) {
      cp.set((Math.random() - 0.5) * 10, 0, Math.max(-110, cp.z + 10));
      jp.velocity.set(0, 0, 0);
      state.sanity -= 10;
    }

    // 只有吸积盘旋转，黑洞核心不转
    if (state.blackHole && state.blackHole.children[1]) {
      state.blackHole.children[1].rotation.z += dt * 0.2;
    }

    // 陨石动画
    state.meteors.forEach(meteor => {
      meteor.rotation.x += meteor.userData.rotSpeed * dt;
      meteor.rotation.y += meteor.userData.rotSpeed * 0.5 * dt;
      meteor.position.y += Math.sin(state.levelTime * meteor.userData.bobSpeed) * 0.01;
    });

    // 碎片平台动画
    state.cosmicPlatforms.forEach(p => {
      if (p.userData.rotSpeed) {
        p.rotation.x += p.userData.rotSpeed * dt;
        p.rotation.y += p.userData.rotSpeed * 0.3 * dt;
      }
      if (p.userData.bobSpeed) {
        p.position.y += Math.sin(state.levelTime * p.userData.bobSpeed) * 0.005;
      }
    });

    // 理智下降
    state.sanity -= 0.08 * dt;
    document.getElementById('sanity-bar').style.width = Math.max(0, state.sanity) + '%';

    if (state.sanity <= 0) {
      this.endLevelWrapper(state, false, '在无尽的太空中迷失了...');
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
