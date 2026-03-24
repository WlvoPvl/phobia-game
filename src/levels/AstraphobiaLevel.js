// 雷电恐惧症关卡 - AstraphobiaLevel
// 恐惧对象：雷电、暴雨、闪电
import * as THREE from 'three';

export class AstraphobiaLevel {
  static create(state) {
    state.scene.background = new THREE.Color(0x0a0a15);
    state.scene.fog = new THREE.FogExp2(0x0a0a15, 0.03);
    
    // 地面 - 暴雨泥地
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1a1510,
      roughness: 1,
      metalness: 0
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    state.levelScene.add(ground);
    
    // 暴风雨树木
    for (let i = 0; i < 30; i++) {
      const tree = AstraphobiaLevel.createTree();
      tree.position.set(
        (Math.random() - 0.5) * 40,
        0,
        (Math.random() - 0.5) * 40
      );
      state.levelScene.add(tree);
    }
    
    // 终点庇护所
    const shelterMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.8 });
    const shelter = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 1), shelterMat);
    shelter.position.set(0, 1.5, -70);
    state.levelScene.add(shelter);
    
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 2), roofMat);
    roof.position.set(0, 3.15, -55);
    state.levelScene.add(roof);
    
    // 庇护所灯光
    const shelterLight = new THREE.PointLight(0xffaa44, 2, 8);
    shelterLight.position.set(0, 2, -68);
    state.levelScene.add(shelterLight);
    state.levelLights.push(shelterLight);
    
    // 出口标记
    const exitLight = new THREE.PointLight(0x00ff44, 1.5, 6);
    exitLight.position.set(0, 1.5, -68);
    state.levelScene.add(exitLight);
    state.levelLights.push(exitLight);
    
    // 闪电相关状态
    state.lightningTimer = 0;
    state.lightningCooldown = 2;
    state.thunderIntensity = 0;
    state.rainParticles = null;
    
    // 创建雨滴粒子
    state.rainParticles = AstraphobiaLevel.createRain(state.levelScene);
    
    // 闪电光源
    state.lightningLight = new THREE.PointLight(0xffffff, 0, 100);
    state.lightningLight.position.set(0, 30, 0);
    state.levelScene.add(state.lightningLight);
    state.levelLights.push(state.lightningLight);
    
    // 环境光 - 昏暗
    const ambient = new THREE.AmbientLight(0x222233, 0.2);
    state.levelScene.add(ambient);
    
    state.camera.position.set(0, 1.6, 5);
    state.camera.rotation.set(0, 0, 0);
    
    state.levelBounds = { minX: -45, maxX: 45, minZ: -45, maxZ: 45 };
    
    setTimeout(() => {
      const hint = document.getElementById('hint-text');
      if (hint && state.levelIndex === 9 && state.levelActive) {
        hint.textContent = '暴风雨来了...找到庇护所！';
      }
    }, 2000);
  }
  
  static createTree() {
    const group = new THREE.Group();
    
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.3, 3, 6),
      new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 1 })
    );
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    group.add(trunk);
    
    const foliage = new THREE.Mesh(
      new THREE.ConeGeometry(1.5, 3, 6),
      new THREE.MeshStandardMaterial({ color: 0x0a1a0a, roughness: 0.9 })
    );
    foliage.position.y = 4;
    foliage.castShadow = true;
    group.add(foliage);
    
    return group;
  }
  
  static createRain(scene) {
    const rainCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);
    
    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = Math.random() * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0xaaaaff,
      size: 0.1,
      transparent: true,
      opacity: 0.6
    });
    
    const rain = new THREE.Points(geometry, material);
    scene.add(rain);
    
    return rain;
  }
  
  static update(state, dt) {
    if (!state.levelActive || state.levelIndex !== 9) return null;
    state.levelTime += dt;
    const cp = state.camera.position;
    
    // 更新雨滴（跟随玩家）
    if (state.rainParticles) {
      const positions = state.rainParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 15 * dt;
        if (positions[i + 1] < 0) {
          positions[i + 1] = 30;
          positions[i * 3] = cp.x + (Math.random() - 0.5) * 50;
          positions[i * 3 + 2] = cp.z + (Math.random() - 0.5) * 50;
        }
      }
      state.rainParticles.geometry.attributes.position.needsUpdate = true;
    }
    
    // 闪电逻辑
    state.lightningCooldown -= dt;
    if (state.lightningCooldown <= 0) {
      if (Math.random() < 0.03) {
        AstraphobiaLevel.triggerLightning(state);
      }
    }
    
    // 闪电衰减
    if (state.lightningLight) {
      state.lightningLight.intensity *= 0.92;
    }
    
    // 理智值下降 - 暴风雨中持续消耗
    let drain = 0.15;
    if (state.lightningLight && state.lightningLight.intensity > 30) {
      drain += 0.3;
    }
    state.sanity -= drain * dt;
    
    // 低理智时摄像机抖动
    if (state.sanity < 40) {
      const shake = (40 - state.sanity) / 40 * 0.005;
      state.camera.rotation.z = Math.sin(state.levelTime * 10) * shake;
    }
    
    document.getElementById('sanity-bar').style.width = Math.max(0, state.sanity) + '%';
    
    // 到达庇护所
    if (cp.z < -51 && Math.abs(cp.x) < 3 && !state.levelComplete) {
      state.levelComplete = true;
      this.endLevelWrapper(state, true, '你成功躲过了雷暴！');
      return;
    }
    
    // 理智耗尽
    if (state.sanity <= 0) {
      this.endLevelWrapper(state, false, '被雷电击中，迷失在暴风雨中...');
      return false;
    }

    return null;
  }

  static triggerLightning(state) {
    if (!state.lightningLight) return;
    
    const x = (Math.random() - 0.5) * 30;
    const z = (Math.random() - 0.5) * 30;
    state.lightningLight.position.set(x, 20, z);
    state.lightningLight.intensity = 100 + Math.random() * 50;
    state.lightningCooldown = 2 + Math.random() * 3;
    
    // 屏幕闪烁 - 多次闪烁效果
    const flash = document.getElementById('scare-flash');
    if (flash) {
      const doFlash = (opacity, duration) => {
        flash.style.background = 'white';
        flash.style.display = 'block';
        flash.style.opacity = String(opacity);
        setTimeout(() => {
          flash.style.opacity = '0';
          setTimeout(() => { flash.style.display = 'none'; }, 100);
        }, duration);
      };

      const firstOpacity = 0.6 + Math.random() * 0.2;
      doFlash(firstOpacity, 50);
      setTimeout(() => doFlash(0.7 + Math.random() * 0.1, 40), 150);
      setTimeout(() => doFlash(0.6 + Math.random() * 0.2, 30), 300);
    }
  }
  
  static endLevelWrapper(state, success, msg) {
    if (typeof window !== 'undefined' && window._endLevel) {
      window._endLevel(success, msg);
    }
  }
}

export default AstraphobiaLevel;
