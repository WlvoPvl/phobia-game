// 蜘蛛恐惧症关卡 - 夜晚森林场景
import * as THREE from 'three';
import { GameObjectPool } from '../object-pool.js';

export class ArachnophobiaLevel {
  static spiderPool = null;
  static poolInitialized = false;

  static create(state) {
    state.spiders = [];
    state.spiderWave = 0;
    state.spiderTimer = 0;
    state.scareTriggered = false;

    // 夜空背景 + 深蓝色雾
    state.scene.background = new THREE.Color(0x0a0a1a);
    state.scene.fog = new THREE.Fog(0x0a0a1a, 15, 60);

    // 地面 - 草地
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1a2a1a,
      roughness: 0.95,
      metalness: 0.0
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    state.levelScene.add(ground);

    // 月亮
    const moonGeo = new THREE.SphereGeometry(3, 16, 16);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(30, 40, -50);
    state.levelScene.add(moon);

    // 月晕光环
    const moonGlow = new THREE.Mesh(
      new THREE.SphereGeometry(5, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffcc, transparent: true, opacity: 0.15 })
    );
    moonGlow.position.copy(moon.position);
    state.levelScene.add(moonGlow);

    // 月光 - 方向光
    const moonLight = new THREE.DirectionalLight(0xccccff, 1.2);
    moonLight.position.set(30, 40, -50);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.camera.near = 0.5;
    moonLight.shadow.camera.far = 100;
    moonLight.shadow.camera.left = -40;
    moonLight.shadow.camera.right = 40;
    moonLight.shadow.camera.top = 40;
    moonLight.shadow.camera.bottom = -40;
    state.levelScene.add(moonLight);
    state.levelLights.push(moonLight);

    // 增强环境光
    state.levelScene.add(new THREE.AmbientLight(0x334466, 0.6));
    state.levelScene.add(new THREE.HemisphereLight(0x6688aa, 0x334433, 0.4));

    // 天空散射光
    const skyLight = new THREE.DirectionalLight(0x8888cc, 0.5);
    skyLight.position.set(0, 50, 0);
    state.levelScene.add(skyLight);

    // 生成树木、小路、蜘蛛网
    this.createForest(state);
    this.createPath(state);
    this.createCobwebs(state);

    // 玩家起始位置
    state.camera.position.set(0, 1.6, 5);
    state.camera.rotation.set(0, 0, 0);

    // 关卡边界
    state.levelBounds = { minX: -40, maxX: 40, minZ: -40, maxZ: 40 };

    // 初始化蜘蛛对象池 - 使用正确的池化模式
    this.initSpiderPool(state);
  }

  // 初始化蜘蛛对象池
  static initSpiderPool(state) {
    const createFn = () => {
      const spider = this.createSpiderBase(1.0); // 默认尺寸
      spider.mesh.visible = false;
      state.levelScene.add(spider.mesh);
      return spider;
    };

    const resetFn = (spider, position, size, speed) => {
      spider.mesh.position.copy(position);
      spider.mesh.scale.setScalar(size); // 通过缩放调整尺寸
      spider.mesh.visible = true;
      spider.speed = speed;
      spider.active = true;
    };

    this.spiderPool = new GameObjectPool(createFn, resetFn, 30);
    this.poolInitialized = true;
  }

  // 创建基础蜘蛛（不依赖尺寸参数）
  static createSpiderBase(baseSize) {
    const g = new THREE.Group();
    const bm = new THREE.MeshStandardMaterial({ color: 0x1a0a0a, roughness: 0.7 });
    const lm = new THREE.MeshStandardMaterial({ color: 0x220808, roughness: 0.8 });

    const abd = new THREE.Mesh(new THREE.SphereGeometry(baseSize * 0.5, 12, 12), bm);
    abd.position.y = baseSize * 0.4;
    g.add(abd);

    const cep = new THREE.Mesh(new THREE.SphereGeometry(baseSize * 0.35, 10, 10), bm);
    cep.position.set(0, baseSize * 0.38, baseSize * 0.3);
    g.add(cep);

    for (let i = 0; i < 8; i++) {
      const side = i < 4 ? 1 : -1;
      const legIndex = i % 4;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, baseSize * 0.9, 6), lm);
      leg.position.set(
        side * (0.25 + legIndex * 0.18),
        baseSize * 0.35,
        (legIndex - 1.5) * baseSize * 0.35
      );
      leg.rotation.z = side * 0.6;
      leg.rotation.x = (legIndex - 1.5) * 0.35;
      g.add(leg);
    }

    const eyeGeo = new THREE.SphereGeometry(0.05, 6, 6);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    for (let i = -1; i <= 1; i += 2) {
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(i * 0.12, baseSize * 0.42, baseSize * 0.55);
      g.add(eye);
    }

    const fangMat = new THREE.MeshStandardMaterial({ color: 0x332222 });
    for (let i = -1; i <= 1; i += 2) {
      const fang = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 4), fangMat);
      fang.position.set(i * 0.06, baseSize * 0.25, baseSize * 0.6);
      fang.rotation.x = 0.3;
      g.add(fang);
    }

    return { mesh: g, speed: 0.8, active: false };
  }

  // 保留旧方法兼容性
  static createSpider(size, pos) {
    const spider = this.createSpiderBase(size);
    spider.mesh.position.copy(pos);
    spider.speed = 0.6 + Math.random() * 0.4;
    return spider;
  }

  static createForest(state) {
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x0a2a0a, roughness: 0.9, side: THREE.DoubleSide });
    const deadLeafMat = new THREE.MeshStandardMaterial({ color: 0x1a1a0a, roughness: 0.9, side: THREE.DoubleSide });

    const rng = (seed) => {
      let s = seed;
      return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    };
    const random = rng(42);

    // 创建树木
    for (let i = 0; i < 60; i++) {
      const x = (random() - 0.5) * 80;
      const z = (random() - 0.5) * 80;
      if (Math.abs(x) < 3 && Math.abs(z) < 8) continue;

      const height = 4 + random() * 6;
      const radius = 0.15 + random() * 0.25;
      const isDead = random() > 0.7;

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.6, radius, height, 6),
        treeMat
      );
      trunk.position.set(x, height / 2, z);
      trunk.castShadow = true;
      state.levelScene.add(trunk);

      if (!isDead) {
        const leafColor = random() > 0.5 ? leafMat : deadLeafMat;
        for (let j = 0; j < 3; j++) {
          const coneRadius = (2.5 - j * 0.6) * (0.7 + random() * 0.3);
          const coneHeight = 2.5 - j * 0.5;
          const cone = new THREE.Mesh(
            new THREE.ConeGeometry(coneRadius, coneHeight, 8),
            leafColor
          );
          cone.position.set(x, height + j * 1.2, z);
          cone.castShadow = true;
          state.levelScene.add(cone);
        }
      } else {
        for (let b = 0; b < 3; b++) {
          const branch = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.06, 1.5, 4),
            treeMat
          );
          branch.position.set(
            x + (random() - 0.5) * 0.8,
            height * 0.5 + b * 0.8,
            z + (random() - 0.5) * 0.8
          );
          branch.rotation.z = (random() - 0.5) * 1.2;
          state.levelScene.add(branch);
        }
      }
    }

    // 创建灌木
    for (let i = 0; i < 30; i++) {
      const x = (random() - 0.5) * 70;
      const z = (random() - 0.5) * 70;
      if (Math.abs(x) < 3 && Math.abs(z) < 8) continue;

      const bushSize = 0.3 + random() * 0.5;
      const bush = new THREE.Mesh(
        new THREE.SphereGeometry(bushSize, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0x0a2a0a, roughness: 0.95 })
      );
      bush.position.set(x, bushSize * 0.6, z);
      bush.scale.y = 0.7;
      state.levelScene.add(bush);
    }

    // 创建岩石
    for (let i = 0; i < 15; i++) {
      const x = (random() - 0.5) * 60;
      const z = (random() - 0.5) * 60;
      const rockSize = 0.3 + random() * 0.8;
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(rockSize, 0),
        new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.9 })
      );
      rock.position.set(x, rockSize * 0.4, z);
      rock.rotation.set(random() * Math.PI, random() * Math.PI, 0);
      rock.castShadow = true;
      state.levelScene.add(rock);
    }
  }

  static createPath(state) {
    const pathMat = new THREE.MeshStandardMaterial({ color: 0x2a2a1a, roughness: 0.95 });
    const pathWidth = 1.5;

    for (let z = 5; z > -50; z -= 3) {
      const tile = new THREE.Mesh(
        new THREE.PlaneGeometry(pathWidth, 3),
        pathMat
      );
      tile.rotation.x = -Math.PI / 2;
      tile.position.set(Math.sin(z * 0.05) * 2, 0.01, z);
      state.levelScene.add(tile);
    }

    const torchPositions = [
      { x: -1, z: -5 },
      { x: 1.5, z: -12 },
      { x: -0.5, z: -20 },
      { x: 2, z: -28 },
      { x: -1, z: -35 },
      { x: 0.5, z: -42 },
    ];

    torchPositions.forEach(pos => {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 1.2, 4),
        new THREE.MeshStandardMaterial({ color: 0x3a2a1a })
      );
      pole.position.set(pos.x, 0.6, pos.z);
      state.levelScene.add(pole);

      const flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xff6622 })
      );
      flame.position.set(pos.x, 1.3, pos.z);
      state.levelScene.add(flame);

      const fireLight = new THREE.PointLight(0xff6622, 1.5, 12);
      fireLight.position.set(pos.x, 1.3, pos.z);
      state.levelScene.add(fireLight);
      state.levelLights.push(fireLight);
    });
  }

  static createCobwebs(state) {
    const webMat = new THREE.MeshStandardMaterial({
      color: 0x888888,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const webPositions = [
      { x: -2, y: 2, z: -8, ry: 0.3 },
      { x: 3, y: 3, z: -15, ry: -0.5 },
      { x: -1, y: 2.5, z: -25, ry: 0.8 },
      { x: 2, y: 2, z: -35, ry: -0.2 },
      { x: -3, y: 3.5, z: -40, ry: 0.6 },
    ];

    webPositions.forEach(pos => {
      const web = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), webMat);
      web.position.set(pos.x, pos.y, pos.z);
      web.rotation.y = pos.ry;
      web.rotation.x = Math.PI / 6;
      state.levelScene.add(web);
    });
  }

  static update(state, dt) {
    state.levelTime += dt;

    // 生成蜘蛛波
    if (state.levelTime > state.spiderTimer) {
      state.spiderWave++;
      state.spiderTimer = state.levelTime + 4;

      const playerPos = state.camera.position;
      const forward = new THREE.Vector3();
      state.camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      const right = new THREE.Vector3();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

      const directions = [forward, right.clone().multiplyScalar(-1), right];
      const spawnDir = directions[state.spiderWave % 3];

      const count = 4 + Math.min(state.spiderWave, 2);
      for (let i = 0; i < count; i++) {
        const offset = new THREE.Vector3();
        offset.copy(spawnDir);

        if (state.spiderWave % 3 === 0) {
          offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), (i - (count - 1) / 2) * 0.4);
        } else {
          offset.z += (i - (count - 1) / 2) * 2;
        }

        const dist = 8 + Math.random() * 7;
        const pos = new THREE.Vector3(
          playerPos.x + offset.x * dist,
          0.2,
          playerPos.z + offset.z * dist
        );

        // 使用对象池获取蜘蛛
        const size = 1.0 + Math.random() * 0.5;
        const speed = 0.6 + Math.random() * 0.4;
        const spider = this.spiderPool.acquire(pos, size, speed);
        state.spiders.push(spider);
      }
    }

    // 更新蜘蛛 AI
    const playerPos = state.camera.position;
    for (const spider of state.spiders) {
      if (!spider.active) continue;

      const dir = new THREE.Vector3().subVectors(playerPos, spider.mesh.position);
      dir.y = 0;
      const dist = dir.length();

      if (dist > 0.5) {
        dir.normalize();
        spider.mesh.position.add(dir.multiplyScalar(spider.speed * dt));
        spider.mesh.lookAt(playerPos.x, spider.mesh.position.y, playerPos.z);
      }

      // 触碰检测 - 只触发一次伤害
      if (dist < 1.0 && spider.active) {
        state.sanity -= 25;
        state.scareTriggered = true;
        spider.active = false; // 标记为已触碰

        if (state.effectsSystem) {
          state.effectsSystem.flashScreen('red', 0.5, 0.2);
        }
      }
    }

    // 清理过近的蜘蛛 - 归还到对象池
    state.spiders = state.spiders.filter(sp => {
      const dist = sp.mesh.position.distanceTo(playerPos);
      if (dist < 0.5 || !sp.active) {
        // 归还到池中
        sp.mesh.visible = false;
        sp.active = false;
        this.spiderPool.release(sp);
        return false;
      }
      return true;
    });

    // 关卡完成条件：存活 28 秒
    if (state.levelTime >= 28) {
      return true;
    }

    // 理智值耗尽失败
    if (state.sanity <= 0) {
      return false;
    }

    return null;
  }

  // 清理资源
  static cleanup() {
    if (this.spiderPool) {
      this.spiderPool.clear();
      this.spiderPool = null;
    }
    this.poolInitialized = false;
  }
}

export default ArachnophobiaLevel;
