import * as THREE from 'three';
import { resourceManager } from '../resource-manager.js';

export class WatermelonPhobiaLevel {
  // 共享几何体和材质，避免重复创建
  static seedGeometry = null;
  static seedMaterial = null;

  static create(state) {
    // 西瓜恐惧症 - 白天西瓜田
    state.scene.background = new THREE.Color(0x87CEEB); // 天蓝色
    state.scene.fog = new THREE.Fog(0xCCE5FF, 20, 60);
    
    state.watermelons = [];
    state.flyingSeeds = [];
    state.chasingWatermelons = [];
    state.wmTimer = 0;

    // 瓜田行距
    const rowMat = new THREE.MeshStandardMaterial({ color: 0x3a6a2a, roughness: 0.9 });
    for (let i = 0; i < 20; i++) {
      const row = new THREE.Mesh(new THREE.PlaneGeometry(50, 0.3), rowMat);
      row.rotation.x = -Math.PI / 2;
      row.position.set(0, 0.01, -5 - i * 5);
      state.levelScene.add(row);
    }

    // 围墙 - 防止玩家走出地面
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a4a2a, roughness: 0.9 });
    const lw = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 130), wallMat);
    lw.position.set(-30, 1.5, -60);
    state.levelScene.add(lw);
    const rw = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 130), wallMat);
    rw.position.set(30, 1.5, -60);
    state.levelScene.add(rw);
    const bw = new THREE.Mesh(new THREE.BoxGeometry(60, 3, 1), wallMat);
    bw.position.set(0, 1.5, -125);
    state.levelScene.add(bw);

    // 太阳
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(5, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffff44 })
    );
    sun.position.set(40, 50, -50);
    state.levelScene.add(sun);

     // 远处山脉 - 更多且更高，贴地放置
     const mountainCount = 20;
     for (let i = 0; i < mountainCount; i++) {
       const height = 25 + Math.random() * 30;
       const mtn = new THREE.Mesh(
         new THREE.ConeGeometry(10 + Math.random() * 15, height, 5),
         new THREE.MeshStandardMaterial({ color: 0x4a6a5a, roughness: 0.9 })
       );
       const angle = Math.random() * Math.PI * 2;
       const dist = 40 + Math.random() * 20;
       mtn.position.set(
         Math.cos(angle) * dist,
         height / 2,
         -80 - Math.random() * 40
       );
       state.levelScene.add(mtn);
     }

    // 地面 - 西瓜田（绿色）
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 130),
      new THREE.MeshStandardMaterial({ color: 0x4a7a3a, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -60;
    state.levelScene.add(ground);

    // 普通西瓜
    for (let i = 0; i < 15; i++) {
      const wm = this.createWatermelon(state, false);
      wm.position.set(
        (Math.random() - 0.5) * 40,
        0,
        -5 - i * 6
      );
      state.watermelons.push(wm);
    }

    // 追逐者西瓜（大的）
    for (let i = 0; i < 3; i++) {
      const chasingWm = this.createWatermelon(state, true);
      chasingWm.position.set(
        (Math.random() - 0.5) * 30,
        0,
        -25 - i * 25
      );
      chasingWm.userData.isChaser = true;
      chasingWm.userData.speed = 3 + Math.random() * 2;
      chasingWm.userData.wanderTimer = Math.random() * 5;
      state.chasingWatermelons.push(chasingWm);
      state.watermelons.push(chasingWm);
    }

    // 阳光
    const sunLight = new THREE.DirectionalLight(0xffffee, 1.2);
    sunLight.position.set(40, 50, 20);
    state.levelScene.add(sunLight);

    // 环境光
    state.levelScene.add(new THREE.AmbientLight(0x88aa88, 0.5));
    state.levelScene.add(new THREE.HemisphereLight(0x87CEEB, 0x4a7a3a, 0.3));

    // 出口标志
    const exitLight = new THREE.PointLight(0x00ff88, 1.5, 10);
    exitLight.position.set(0, 2, -93);
    state.levelScene.add(exitLight);

    state.camera.position.set(0, 1.6, 5);
    state.camera.rotation.set(0, 0, 0);
    
    state.levelBounds = { minX: -28, maxX: 28, minZ: -125, maxZ: 8 };

    // 初始化共享的种子几何体和材质
    if (!this.seedGeometry) {
      this.seedGeometry = new THREE.SphereGeometry(0.06, 4, 4);
    }
    if (!this.seedMaterial) {
      this.seedMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    }
  }

  static createWatermelon(state, isChaser) {
    const wm = new THREE.Group();
    const size = isChaser ? 1.0 + Math.random() * 0.3 : 0.6 + Math.random() * 0.6;

    // 西瓜主体（绿色球体）
    const rind = new THREE.Mesh(
      new THREE.SphereGeometry(size, 12, 8),
      new THREE.MeshStandardMaterial({ 
        color: 0x228B22, 
        roughness: 0.6 
      })
    );
    rind.position.y = size * 0.8;
    wm.add(rind);

    // 深色条纹
    for (let s = 0; s < 6; s++) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(size * 0.08, size * 1.5, size * 0.05),
        new THREE.MeshStandardMaterial({ color: 0x1a5a1a, roughness: 0.7 })
      );
      const angle = (s / 6) * Math.PI * 2;
      stripe.position.set(
        Math.cos(angle) * size * 0.45,
        size * 0.8,
        Math.sin(angle) * size * 0.45
      );
      stripe.rotation.y = angle;
      wm.add(stripe);
    }

    // 瓜蒂
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.05, 0.2, 4),
      new THREE.MeshStandardMaterial({ color: 0x3a5a3a })
    );
    stem.position.set(0, size * 1.6 + 0.1, 0);
    wm.add(stem);

     wm.userData = { 
       size,
       rotSpeed: 0.1 + Math.random() * 0.3,
       pulsePhase: Math.random() * Math.PI * 2,
       isChaser: isChaser,
       crunchPlayed: false
     };
    
    state.levelScene.add(wm);
    return wm;
  }

  static update(state, dt) {
    if (!state.levelActive || state.levelIndex !== 8) return;
    state.levelTime += dt;
    state.wmTimer += dt;
    const cp = state.camera.position;

    // 西瓜动画
    state.watermelons.forEach(wm => {
      // 轻微旋转
      wm.rotation.y += wm.userData.rotSpeed * dt;
      
      // 脉动效果
      const pulse = 1 + Math.sin(state.levelTime * 2 + wm.userData.pulsePhase) * 0.03;
      wm.scale.set(pulse, pulse, pulse);

      // 追逐者西瓜
      if (wm.userData.isChaser) {
        wm.userData.wanderTimer += dt;
        
        const toPlayer = new THREE.Vector3().subVectors(cp, wm.position);
        toPlayer.y = 0;
        const dist = toPlayer.length();
        
        if (dist < 20) {
          const dir = toPlayer.normalize();
          wm.position.add(dir.multiplyScalar(wm.userData.speed * dt));
          wm.lookAt(cp.x, wm.position.y, cp.z);
        }

        wm.position.x = Math.max(-22, Math.min(22, wm.position.x));
        wm.position.z = Math.max(-90, Math.min(-5, wm.position.z));

        // 接触伤害
        if (dist < wm.userData.size + 1) {
          state.sanity -= 25 * dt;
          const push = new THREE.Vector3().subVectors(wm.position, cp).normalize();
          push.y = 0;
          cp.add(push.multiplyScalar(0.12));
          
          const hint = document.getElementById('hint-text');
          if (hint) hint.textContent = '大西瓜追过来了！快跑！';
        }
       } else {
         // 普通西瓜的靠近伤害
         const dist = cp.distanceTo(wm.position);
         if (dist < wm.userData.size + 1) {
           if (!wm.userData.crunchPlayed) {
             window.getAudioManager()?.playWatermelonCrush?.();
             wm.userData.crunchPlayed = true;
           }
           state.sanity -= (wm.userData.size + 1 - dist) * dt * 1.5;
         } else {
           wm.userData.crunchPlayed = false;
         }
       }
    });

    // 飞行种子 - 使用共享几何体和材质
    if (state.wmTimer > 2) {
      state.wmTimer = 0;

      // 使用共享几何体和材质，避免内存泄漏
      const seed = new THREE.Mesh(this.seedGeometry, this.seedMaterial);

      const src = state.watermelons[Math.floor(Math.random() * Math.min(10, state.watermelons.length))];
      seed.position.copy(src.position);
      seed.position.y = src.userData.size * 0.8;

      seed.userData = {
        vel: new THREE.Vector3()
          .subVectors(cp, src.position)
          .normalize()
          .multiplyScalar(5 + Math.random() * 3),
        life: 4
      };

      state.levelScene.add(seed);
      state.flyingSeeds.push(seed);
    }

    // 更新飞行种子
    for (let i = state.flyingSeeds.length - 1; i >= 0; i--) {
      const seed = state.flyingSeeds[i];
      seed.position.add(seed.userData.vel.clone().multiplyScalar(dt));
      seed.userData.life -= dt;
      
      seed.rotation.x += dt * 8;
      
      if (seed.position.distanceTo(cp) < 0.5) {
        state.sanity -= 8;
        state.levelScene.remove(seed);
        state.flyingSeeds.splice(i, 1);
        
        const hint = document.getElementById('hint-text');
        if (hint) hint.textContent = '被西瓜种子击中！';
        continue;
      }
      
      if (seed.userData.life <= 0 || seed.position.y < -1) {
        state.levelScene.remove(seed);
        state.flyingSeeds.splice(i, 1);
      }
    }

    // 理智值下降
    let drain = 0.06;
    if (-cp.z > 25) drain += 0.04;
    if (-cp.z > 55) drain += 0.06;
    state.sanity -= drain * dt;

    document.getElementById('sanity-bar').style.width = Math.max(0, state.sanity) + '%';

    // 到达出口
    if (cp.z < -90 && !state.levelComplete) {
      state.levelComplete = true;
      this.endLevelWrapper(state, true, '你穿越了西瓜田！');
      return;
    }

    if (state.sanity <= 0) {
      this.endLevelWrapper(state, false, '被西瓜淹没...');
      return false;
    }

    return null;
  }

  static endLevelWrapper(state, success, msg) {
    if (typeof window !== 'undefined' && window._endLevel) {
      window._endLevel(success, msg);
    }
  }

  // 清理关卡资源
  static cleanup(state) {
    // 清理飞行种子（从场景移除，但不dispose共享几何体）
    if (state.flyingSeeds) {
      state.flyingSeeds.forEach(seed => {
        if (seed.parent) seed.parent.remove(seed);
      });
      state.flyingSeeds = [];
    }
  }
}
