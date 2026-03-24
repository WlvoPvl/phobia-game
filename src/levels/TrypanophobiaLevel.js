// 针头恐惧症关卡 - TrypanophobiaLevel
// 恐惧对象：针头、注射器、医疗机构
import * as THREE from 'three';

export class TrypanophobiaLevel {
  static create(state) {
    state.scene.background = new THREE.Color(0xeeeeee);
    state.scene.fog = new THREE.Fog(0xffffff, 20, 60);
    
    // 地面 - 医院地板
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.5,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 80), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -15;
    ground.receiveShadow = true;
    state.levelScene.add(ground);
    
    // 墙壁
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      roughness: 0.7
    });
    
    // 左墙
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(80, 6), wallMat);
    leftWall.position.set(-20, 3, -15);
    leftWall.rotation.y = Math.PI / 2;
    state.levelScene.add(leftWall);
    
    // 右墙
    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(80, 6), wallMat);
    rightWall.position.set(20, 3, -15);
    rightWall.rotation.y = -Math.PI / 2;
    state.levelScene.add(rightWall);
    
    // 后墙
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(40, 6), wallMat);
    backWall.position.set(0, 3, -50);
    state.levelScene.add(backWall);
    
    // 天花板
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 80),
      new THREE.MeshStandardMaterial({ color: 0xe8e8e8 })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 6, -15);
    state.levelScene.add(ceiling);
    
    // 医院柜台
    const counter = TrypanophobiaLevel.createCounter();
    counter.position.set(0, 0, -8);
    state.levelScene.add(counter);
    
    // 医疗设备托盘
    const tray = TrypanophobiaLevel.createTray();
    tray.position.set(2, 1, -8);
    state.levelScene.add(tray);
    
    // 终点出口门
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x44aa44, roughness: 0.5 });
    const door = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 0.2), doorMat);
    door.position.set(0, 1.5, -48);
    state.levelScene.add(door);
    
    // 出口灯光
    const exitLight = new THREE.PointLight(0x00ff44, 2, 8);
    exitLight.position.set(0, 2, -46);
    state.levelScene.add(exitLight);
    state.levelLights.push(exitLight);
    
    // 针头相关状态
    state.needles = [];
    state.needleSpawnTimer = 0;
    state.floatingNeedles = [];
    
    state.camera.position.set(0, 1.6, 3);
    state.camera.rotation.set(0, 0, 0);
    
    // 初始化漂浮针
    for (let i = 0; i < 10; i++) {
      TrypanophobiaLevel.spawnNeedle(state, state.camera.position);
    }
    
    // 灯光 - 刺眼医院灯
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    state.levelScene.add(ambient);
    
    for (let i = 0; i < 4; i++) {
      const spot = new THREE.SpotLight(0xffffff, 0.8, 20, Math.PI / 6, 0.5, 1);
      spot.position.set(0, 5.5, -5 - i * 12);
      spot.target.position.set(0, 0, -5 - i * 12);
      state.levelScene.add(spot);
      state.levelScene.add(spot.target);
    }
    
    
    state.levelBounds = { minX: -18, maxX: 18, minZ: -48, maxZ: 8 };
    
    setTimeout(() => {
      const hint = document.getElementById('hint-text');
      if (hint && state.levelIndex === 11 && state.levelActive) {
        hint.textContent = '躲避漂浮的针头...找到出口！';
      }
    }, 2000);
  }
  
  static createCounter() {
    const group = new THREE.Group();
    
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.1, 1),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    top.position.y = 1;
    group.add(top);
    
    const leg1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 1, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x888888 })
    );
    leg1.position.set(-3.8, 0.5, 0);
    group.add(leg1);
    
    const leg2 = leg1.clone();
    leg2.position.x = 3.8;
    group.add(leg2);
    
    return group;
  }
  
  static createTray() {
    const group = new THREE.Group();
    
    const tray = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.6, 0.1, 16),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.5, roughness: 0.3 })
    );
    tray.position.y = 0.05;
    group.add(tray);
    
    return group;
  }
  
  static createNeedleMesh() {
  const group = new THREE.Group();

  const needleMat = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa,
    metalness: 0.8,
    roughness: 0.2
  });

  // Needle (cone) pointing along -Z (forward)
  const needle = new THREE.Mesh(
    new THREE.ConeGeometry(0.02, 0.3, 8),
    needleMat
  );
  needle.rotation.x = -Math.PI / 2;
  group.add(needle);

  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.5, 12),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      roughness: 0.2
    })
  );
  barrel.rotation.x = -Math.PI / 2;
  barrel.position.z = 0.25;
  group.add(barrel);

  const plunger = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8),
    new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  plunger.rotation.x = -Math.PI / 2;
  plunger.position.z = 0.4;
  group.add(plunger);

  return group;
}
  
  static spawnNeedle(state, cp) {
    const needle = {
      mesh: TrypanophobiaLevel.createNeedleMesh(),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        0,
        (Math.random() - 0.5) * 0.5
      ),
      rotationSpeed: (Math.random() - 0.5) * 2,
      bobOffset: Math.random() * Math.PI * 2
    };
    
    const spawnZ = cp.z - (5 + Math.random() * 10);
    const spawnX = cp.x + (Math.random() - 0.5) * 15;
    const spawnY = 1 + Math.random() * 2;
    needle.mesh.position.set(spawnX, spawnY, spawnZ);
    
    state.needles.push(needle);
    state.levelScene.add(needle.mesh);
  }
  
  static update(state, dt) {
    if (!state.levelActive || state.levelIndex !== 11) return null;
    state.levelTime += dt;
    const cp = state.camera.position;
    const time = state.clock?.getElapsedTime() || 0;
    
    // 更新每根针
    for (let i = state.needles.length - 1; i >= 0; i--) {
      const needle = state.needles[i];
      
      // 漂浮效果
      needle.mesh.position.y = 1 + Math.sin(time * 2 + needle.bobOffset) * 0.3;
      needle.mesh.rotation.y += needle.rotationSpeed * dt;
      needle.mesh.lookAt(cp.x, needle.mesh.position.y, cp.z);

      // 向玩家缓慢移动
      const toPlayer = new THREE.Vector3().subVectors(cp, needle.mesh.position);
      toPlayer.y = 0;
      const dist = toPlayer.length();
      
      if (dist < 15) {
        toPlayer.normalize();
        needle.mesh.position.add(toPlayer.multiplyScalar(1.5 * dt));
      }
      
      // 靠近时恐惧
      if (dist < 2) {
        state.sanity -= 0.8 * dt;
        
        // 轻微刺痛效果
        if (Math.random() < 0.03) {
          const flash = document.getElementById('scare-flash');
          if (flash) {
            flash.style.background = 'red';
            flash.style.display = 'block';
            flash.style.opacity = '0.2';
            setTimeout(() => {
              flash.style.opacity = '0';
              setTimeout(() => { flash.style.display = 'none'; }, 100);
            }, 30);
          }
        }
      }
      
      // 针头接触伤害
      if (dist < 1) {
        state.sanity -= 2 * dt;
      }
    }
    
    // 定时生成新针
    state.needleSpawnTimer += dt;
    if (state.needleSpawnTimer > 3 && state.needles.length < 20) {
      state.needleSpawnTimer = 0;
      TrypanophobiaLevel.spawnNeedle(state, state.camera.position);
    }
    
    // 基础理智下降
    state.sanity -= 0.08 * dt;
    
    document.getElementById('sanity-bar').style.width = Math.max(0, state.sanity) + '%';
    
    // 到达出口
    if (cp.z < -45 && !state.levelComplete) {
      state.levelComplete = true;
      this.endLevelWrapper(state, true, '你成功逃离了医院！');
      return;
    }
    
    // 理智耗尽
    if (state.sanity <= 0) {
      this.endLevelWrapper(state, false, '被无尽的针头淹没...');
      return false;
    }

    return null;
  }

  static endLevelWrapper(state, success, msg) {
    // 清理针头
    if (state.needles) {
      state.needles.forEach(needle => {
        if (needle.mesh && needle.mesh.parent) {
          needle.mesh.parent.remove(needle.mesh);
          needle.mesh.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
          });
        }
      });
      state.needles = [];
    }
    if (typeof window !== 'undefined' && window._endLevel) {
      window._endLevel(success, msg);
    }
  }
}

export default TrypanophobiaLevel;
