import * as THREE from 'three';

export class AcrophobiaLevel {
  static create(state) {
    // 恐高症 - 白天高山场景，阳光明媚但脚下是万丈深渊
    state.scene.background = new THREE.Color(0x87CEEB); // 天蓝色白天
    state.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
    state.platforms = [];
    state.fallDeathTriggered = false;
    state.windTime = 0;
    state.windForce = new THREE.Vector3();

    // 阳光明亮的环境
    const sunLight = new THREE.DirectionalLight(0xffffee, 1.5);
    sunLight.position.set(50, 100, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    state.levelScene.add(sunLight);

    // 增强环境光
    state.levelScene.add(new THREE.AmbientLight(0x6699cc, 0.6));
    state.levelScene.add(new THREE.HemisphereLight(0x87CEEB, 0x8B4513, 0.4));

    // 太阳
    const sunGeo = new THREE.SphereGeometry(5, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(80, 60, -100);
    state.levelScene.add(sun);

    // 添加少量云朵（远处）
    this.createClouds(state);

    // 深渊视觉效果 - 远处的云海
    this.createAbyss(state);

    // 创建平台路径 - 缩短到20个平台
    this.createPlatforms(state);

    // 终点传送门
    const portal = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.2, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.8 })
    );
    portal.position.set(0, 1.5, -85);
    portal.rotation.x = Math.PI / 2;
    state.levelScene.add(portal);
    state.portal = portal;

    // 终点平台 - 稍微大一些
    const endPlatform = new THREE.Mesh(
      new THREE.BoxGeometry(5, 0.5, 5),
      new THREE.MeshStandardMaterial({ color: 0x4a7a4a, roughness: 0.7 })
    );
    endPlatform.position.set(0, -0.25, -85);
    endPlatform.receiveShadow = true;
    state.levelScene.add(endPlatform);
    state.platforms.push({ mesh: endPlatform, width: 5, depth: 5, isStart: false, x: 0, z: -85 });

    state.camera.position.set(0, 1.6, 3);
    state.camera.rotation.set(0, 0, 0);

    // 无空气墙 - 无边界限制
    state.levelBounds = null;
  }

  static createClouds(state) {
    // 云朵 - 远处的白云
    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < 15; i++) {
      const cloud = new THREE.Group();
      const numPuffs = 3 + Math.floor(Math.random() * 3);
      
      for (let j = 0; j < numPuffs; j++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(3 + Math.random() * 4, 8, 8),
          cloudMat.clone()
        );
        puff.position.set(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 4
        );
        puff.scale.y = 0.5;
        cloud.add(puff);
      }
      
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 100;
      cloud.position.set(
        Math.cos(angle) * dist,
        -20 - Math.random() * 30,
        Math.sin(angle) * dist - 50
      );
      cloud.userData = { speed: 0.1 + Math.random() * 0.2, angle };
      state.levelScene.add(cloud);
    }
  }

  static createPlatforms(state) {
    const platformMat = new THREE.MeshStandardMaterial({ 
      color: 0x8B7355, 
      roughness: 0.7, 
      metalness: 0.1 
    });
    const startMat = new THREE.MeshStandardMaterial({ color: 0x6B8E23, roughness: 0.6 });

    // 起始平台 - 大而稳固
    this.createPlatform(state, 0, 0, 6, 6, true, startMat);

    // 生成20个平台，逐渐变小变远
    let prevX = 0, prevZ = 0;
    for (let i = 1; i <= 20; i++) {
      // 距离逐渐增加
      const zOffset = -(4 + Math.random() * 2 + i * 0.2);
      const xOffset = Math.sin(i * 0.6) * (2 + Math.random() * 2);
      const width = Math.max(1.5, 4 - i * 0.08);
      const depth = Math.max(2, 3.5 - i * 0.06);

      const x = prevX + xOffset;
      const z = prevZ + zOffset;

      // 随机轻微旋转平台
      const rotation = (Math.random() - 0.5) * 0.2;

      this.createPlatform(state, x, z, width, depth, false, platformMat, rotation);

      prevX = x;
      prevZ = z;
    }
  }

  static createPlatform(state, x, z, width, depth, isStart, material, rotation = 0) {
    const height = isStart ? 0.5 : 0.3;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      material || new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.7 })
    );
    mesh.position.set(x, -height / 2, z);
    mesh.rotation.y = rotation;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    state.levelScene.add(mesh);

    // 边缘标记 - 让平台更可见
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0xCD853F, transparent: true, opacity: 0.7 });
    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.05, 0.02, depth + 0.05),
      edgeMat
    );
    edge.position.set(x, -height + 0.01, z);
    edge.rotation.y = rotation;
    state.levelScene.add(edge);

    // 支撑柱 - 从平台向下延伸
    if (!isStart) {
      const pillarHeight = 15 + Math.random() * 15;
      const pillarWidth = 0.2 + Math.random() * 0.1;
      
      const pillarMat = new THREE.MeshStandardMaterial({ 
        color: 0x8B7355, 
        roughness: 0.8
      });
      
      // 主柱
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(pillarWidth, pillarHeight, pillarWidth),
        pillarMat
      );
      pillar.position.set(x, -height - pillarHeight / 2, z);
      pillar.castShadow = true;
      state.levelScene.add(pillar);
    }

    state.platforms.push({ mesh, width, depth, rotation, isStart, x, z });
  }

  static createAbyss(state) {
    // 云海 - 大片云层在下方
    const cloudSeaMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });

    // 多层云海
    for (let layer = 0; layer < 3; layer++) {
      const y = -20 - layer * 15;
      const cloudSea = new THREE.Mesh(
        new THREE.PlaneGeometry(400, 400),
        cloudSeaMat.clone()
      );
      cloudSea.material.opacity = 0.7 - layer * 0.15;
      cloudSea.rotation.x = -Math.PI / 2;
      cloudSea.position.y = y;
      state.levelScene.add(cloudSea);
    }

    // 远处的山峰剪影
    const mountainMat = new THREE.MeshStandardMaterial({ 
      color: 0x4a5568, 
      side: THREE.DoubleSide,
      roughness: 0.9
    });
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dist = 120 + Math.random() * 80;
      const height = 40 + Math.random() * 60;
      const mountain = new THREE.Mesh(
        new THREE.ConeGeometry(25 + Math.random() * 25, height, 6),
        mountainMat
      );
      mountain.position.set(
        Math.cos(angle) * dist,
        -10 + height / 2,
        Math.sin(angle) * dist - 30
      );
      state.levelScene.add(mountain);
    }
  }

  static update(state, dt) {
    if (!state.levelActive || state.levelIndex !== 1) return;
    state.levelTime += dt;
    const pp = state.camera.position;

    // 真实的坠落死亡 (y < -3 就死)
    if (pp.y < -3 && !state.fallDeathTriggered && !state.levelComplete) {
      state.fallDeathTriggered = true;
      this.endLevelWrapper(state, false, '坠入无尽的深渊...');
      return;
    }

    // 检测是否在平台上
    let onPlatform = false;
    const playerFootY = pp.y - 1.6;
    
    for (const p of state.platforms) {
      const pw = p.width / 2 + 0.3;
      const pd = p.depth / 2 + 0.3;
      const px = p.mesh ? p.mesh.position.x : p.x;
      const pz = p.mesh ? p.mesh.position.z : p.z;
      const rotation = p.rotation || 0;

      const dx = pp.x - px;
      const dz = pp.z - pz;
      const cos = Math.cos(-rotation);
      const sin = Math.sin(-rotation);
      const localX = dx * cos - dz * sin;
      const localZ = dx * sin + dz * cos;

      if (Math.abs(localX) < pw && Math.abs(localZ) < pd) {
        if (Math.abs(playerFootY) < 0.5 && pp.y > 0 && pp.y < 4) {
          onPlatform = true;
          break;
        }
      }
    }

    // 如果在平台上，固定高度
    if (onPlatform) {
      if (state.velocity.y <= 0) {
        state.velocity.y = 0;
        pp.y = 1.6;
        state._grounded = true;
      }
    } else if (!state.levelComplete) {
      // 不在平台上 - 应用重力
      if (state.velocity.y === undefined) state.velocity.y = 0;
      state.velocity.y -= 18 * dt;
      pp.y += state.velocity.y * dt;
      
      if (state.velocity.y < 0) {
        state._grounded = false;
      }
    }

    // 风力效果 - 轻微推动玩家
    state.windTime += dt;
    const windStrength = 0.3 + Math.sin(state.windTime * 0.5) * 0.2;
    const windDir = new THREE.Vector3(
      Math.sin(state.windTime * 0.3) * windStrength,
      0,
      Math.cos(state.windTime * 0.2) * windStrength * 0.5
    );
    
    // 只在空中时施加风力
    if (!onPlatform && pp.y > 2) {
      pp.x += windDir.x * dt;
      pp.z += windDir.z * dt;
    }

    // 风声提示
    if (-pp.z > 30 && !state.windWarning) {
      state.windWarning = true;
      const hint = document.getElementById('hint-text');
      if (hint) hint.textContent = '风越来越大了...小心！';
    }

    // 到达终点
    if (pp.z < -80 && !state.levelComplete) {
      state.levelComplete = true;
      this.endLevelWrapper(state, true, '你成功穿越了深渊！');
      return;
    }

    // 理智随距离下降
    state.sanity -= (0.04 + Math.max(0, (-pp.z - 15) * 0.003)) * dt;

    // 高度越低，理智下降越快
    if (pp.y < 0) {
      state.sanity -= Math.abs(pp.y) * 0.08 * dt;
    }

    // 传送门旋转动画
    if (state.portal) {
      state.portal.rotation.z += dt * 0.5;
    }

    document.getElementById('sanity-bar').style.width = Math.max(0, state.sanity) + '%';

    if (state.sanity <= 0) {
      this.endLevelWrapper(state, false, '因高度恐惧而崩溃...');
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
