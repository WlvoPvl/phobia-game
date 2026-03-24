import * as THREE from 'three';

export class PigPhobiaLevel {
  static create(state) {
    // 猪恐惧症 - 明亮的农场场景
    state.scene.background = new THREE.Color(0x6B8E23); // 橄榄绿天空
    state.scene.fog = new THREE.Fog(0x8FBC8F, 5, 30);
    
    state.pigs = [];
    state.pigSounds = []; // 用于显示声音效果

    // 地面 - 草地
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 120),
      new THREE.MeshStandardMaterial({ color: 0x556B2F, roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -50;
    state.levelScene.add(ground);

    // 围栏
    this.createFences(state);

    // 猪圈
    this.createPigPens(state);

    // 谷仓（终点）
    this.createBarn(state);

    // 生成猪
    for (let i = 0; i < 20; i++) { // 增加猪数量
      this.createPig(state, (Math.random() - 0.5) * 40, -8 - Math.random() * 75);
    }

    // 阳光
    const sunLight = new THREE.DirectionalLight(0xffffcc, 1.0);
    sunLight.position.set(30, 50, 20);
    sunLight.castShadow = true;
    state.levelScene.add(sunLight);

    // 环境光
    state.levelScene.add(new THREE.AmbientLight(0x668866, 0.5));
    state.levelScene.add(new THREE.HemisphereLight(0x87CEEB, 0x556B2F, 0.3));

    // 谷仓灯光
    const barnLight = new THREE.PointLight(0xffaa66, 2, 15);
    barnLight.position.set(0, 3, -88);
    state.levelScene.add(barnLight);
    state.levelLights.push(barnLight);

    state.camera.position.set(0, 1.6, 3);
    state.camera.rotation.set(0, 0, 0);
    
    // 无边界
    state.levelBounds = null;
  }

  static createFences(state) {
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.8 });
    
    // 沿路径的围栏
    for (let z = 5; z > -95; z -= 4) {
      [-12, 12].forEach(x => {
        // 柱子
        const post = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 1.2, 0.15),
          fenceMat
        );
        post.position.set(x, 0.6, z);
        state.levelScene.add(post);

        // 横杆
        if (z > -90) {
          const rail = new THREE.Mesh(
            new THREE.BoxGeometry(4, 0.1, 0.08),
            fenceMat
          );
          rail.position.set(x, 0.9, z - 2);
          state.levelScene.add(rail);
        }
      });
    }
  }

  static createPigPens(state) {
    const penMat = new THREE.MeshStandardMaterial({ color: 0x6B5344, roughness: 0.9 });
    
    // 几个猪圈
    const penPositions = [
      { x: -15, z: -25 },
      { x: 15, z: -45 },
      { x: -10, z: -65 }
    ];

    penPositions.forEach(pen => {
      // 围栏
      const fenceSize = 6;
      const fenceHeight = 1;
      
      // 四边围栏
      for (let i = 0; i < 4; i++) {
        const isHorizontal = i < 2;
        const offset = i % 2 === 0 ? fenceSize / 2 : -fenceSize / 2;
        
        const fence = new THREE.Mesh(
          new THREE.BoxGeometry(
            isHorizontal ? fenceSize : 0.1,
            fenceHeight,
            isHorizontal ? 0.1 : fenceSize
          ),
          penMat
        );
        
        if (isHorizontal) {
          fence.position.set(pen.x, fenceHeight / 2, pen.z + offset);
        } else {
          fence.position.set(pen.x + offset, fenceHeight / 2, pen.z);
        }
        
        state.levelScene.add(fence);
      }

      // 猪食槽
      const trough = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.3, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x5a4a3a })
      );
      trough.position.set(pen.x, 0.15, pen.z - 2);
      state.levelScene.add(trough);
    });
  }

  static createBarn(state) {
    // 谷仓主体
    const barnMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.9 });
    
    // 墙壁
    const barn = new THREE.Mesh(
      new THREE.BoxGeometry(10, 5, 8),
      barnMat
    );
    barn.position.set(0, 2.5, -92);
    state.levelScene.add(barn);

    // 屋顶
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(7, 3, 4),
      roofMat
    );
    roof.position.set(0, 6.5, -92);
    roof.rotation.y = Math.PI / 4;
    state.levelScene.add(roof);

    // 门（出口）
    const door = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 4),
      new THREE.MeshBasicMaterial({ color: 0x00ff44, transparent: true, opacity: 0.5 })
    );
    door.position.set(0, 2, -88);
    state.levelScene.add(door);
  }

  static createPig(state, x, z) {
    const g = new THREE.Group();
    
    // 身体颜色（粉色系 - 更深的粉色）
    const bodyColor = new THREE.Color().setHSL(0.0, 0.5, 0.65 + Math.random() * 0.1);
    const sm = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.7 });
    
    // 身体
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.5, 0.55),
      sm
    );
    body.position.set(0, 0.4, 0);
    g.add(body);
    
    // 头
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 10, 10),
      sm
    );
    head.position.set(0.45, 0.5, 0);
    g.add(head);

    // 鼻子
    const snout = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.12, 0.15),
      new THREE.MeshStandardMaterial({ color: 0xd08080, roughness: 0.8 })
    );
    snout.position.set(0.7, 0.45, 0);
    g.add(snout);

    // 鼻孔
    const nostrilMat = new THREE.MeshBasicMaterial({ color: 0x3a2a2a });
    [-0.04, 0.04].forEach(dz => {
      const nostril = new THREE.Mesh(
        new THREE.CircleGeometry(0.02, 6),
        nostrilMat
      );
      nostril.position.set(0.79, 0.47, dz);
      nostril.rotation.y = Math.PI / 2;
      g.add(nostril);
    });

    // 眼睛
    [-0.15, 0.15].forEach(dz => {
      // 眼白
      const eyeWhite = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      eyeWhite.position.set(0.5, 0.6, dz);
      g.add(eyeWhite);

      // 黑眼珠
      const pupil = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
      );
      pupil.position.set(0.55, 0.6, dz);
      g.add(pupil);
    });

    // 耳朵
    [-0.18, 0.18].forEach(dz => {
      const ear = new THREE.Mesh(
        new THREE.ConeGeometry(0.1, 0.15, 4),
        sm
      );
      ear.position.set(0.35, 0.75, dz);
      ear.rotation.x = dz > 0 ? 0.3 : -0.3;
      g.add(ear);
    });

    // 腿
    for (let i = 0; i < 4; i++) {
      const dx = i < 2 ? 0.25 : -0.25;
      const dz = i % 2 === 0 ? 0.15 : -0.15;
      
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.05, 0.3, 6),
        sm
      );
      leg.position.set(dx, 0.15, dz);
      g.add(leg);
    }

    // 尾巴
    const tail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.015, 0.2, 4),
      sm
    );
    tail.position.set(-0.5, 0.5, 0);
    tail.rotation.z = 0.5;
    g.add(tail);

    g.position.set(x, 0, z);
    g.userData = { 
      speed: 0.4 + Math.random() * 0.4,
      wanderAngle: Math.random() * Math.PI * 2,
      aggressive: false,
      charging: false,
      chargeTimer: 0,
      gruntTimer: Math.random() * 5,
      wanderTimer: 0
    };
    
    state.levelScene.add(g);
    state.pigs.push(g);
  }

  static showSoundEffect(state, position, text) {
    // 在猪的位置显示文字提示
    const screenPos = position.clone().project(state.camera);
    if (screenPos.z < 1) {
      const div = document.createElement('div');
      div.style.cssText = `
        position: fixed;
        color: #ffaa00;
        font-size: 14px;
        font-weight: bold;
        text-shadow: 0 0 5px #000;
        pointer-events: none;
        z-index: 100;
        transition: opacity 0.5s;
      `;
      div.textContent = text;
      
      // 计算屏幕位置
      const x = (screenPos.x + 1) / 2 * window.innerWidth;
      const y = (-screenPos.y + 1) / 2 * window.innerHeight;
      div.style.left = x + 'px';
      div.style.top = y + 'px';
      
      document.body.appendChild(div);
      
      setTimeout(() => { div.style.opacity = '0'; }, 500);
      setTimeout(() => { div.remove(); }, 1000);
    }
  }

  static update(state, dt) {
    if (!state.levelActive || state.levelIndex !== 6) return;
    state.levelTime += dt;
    const cp = state.camera.position;

    state.pigs.forEach(pig => {
      const d = pig.userData;
      
      // 当理智低于85时猪变得攻击性
      if (state.sanity < 85 && !d.aggressive) {
        d.aggressive = true;
        d.speed *= 1.8;
        
        const hint = document.getElementById('hint-text');
        if (hint) hint.textContent = '猪群变得躁动不安...';
      }

      // 猪叫声提示
      d.gruntTimer -= dt;
      if (d.gruntTimer <= 0) {
        d.gruntTimer = 3 + Math.random() * 5;
        const dist = pig.position.distanceTo(cp);
        if (dist < 15) {
          this.showSoundEffect(state, pig.position, '哼哼~');
        }
      }

      // 冲刺逻辑
      if (d.charging) {
        d.chargeTimer -= dt;
        
        // 冲刺方向指向玩家
        const dir = new THREE.Vector3().subVectors(cp, pig.position);
        dir.y = 0;
        dir.normalize();
        
        // 快速移动
        pig.position.add(dir.multiplyScalar(d.speed * 3 * dt));
        pig.lookAt(cp.x, pig.position.y, cp.z);
        
        // 冲刺动画
        pig.position.y = Math.abs(Math.sin(state.levelTime * 15)) * 0.1;
        
        if (d.chargeTimer <= 0) {
          d.charging = false;
        }
      } else {
        // 巡逻移动
        d.wanderTimer += dt;
        if (d.wanderTimer > 2 + Math.random() * 3) {
          d.wanderTimer = 0;
          d.wanderAngle += (Math.random() - 0.5) * Math.PI * 0.5;
        }
        
        const moveX = Math.cos(d.wanderAngle) * d.speed * 0.6 * dt;
        const moveZ = Math.sin(d.wanderAngle) * d.speed * 0.6 * dt;
        pig.position.x += moveX;
        pig.position.z += moveZ;
        
        // 限制在场地内
        pig.position.x = Math.max(-25, Math.min(25, pig.position.x));
        pig.position.z = Math.max(-85, Math.min(-5, pig.position.z));
        
        pig.rotation.y = d.wanderAngle;
      }

      // 攻击性猪偶尔冲刺
      if (d.aggressive && !d.charging && Math.random() < 0.015) {
        const dist = pig.position.distanceTo(cp);
        if (dist < 20 && state.sanity < 70) {
          d.charging = true;
          d.chargeTimer = 2;
          
          const hint = document.getElementById('hint-text');
          if (hint) hint.textContent = '猪冲过来了！快跑！';
          
          this.showSoundEffect(state, pig.position, '冲啊！！');
        }
      }

      // 猪接触伤害
      const dist = pig.position.distanceTo(cp);
      if (dist < 1.5) {
        state.sanity -= 20 * dt;
        
        // 推开玩家
        const push = new THREE.Vector3().subVectors(pig.position, cp).normalize();
        push.y = 0;
        cp.add(push.multiplyScalar(0.08));
      }

      // 猪的身体摆动
      pig.scale.y = 1 + Math.sin(state.levelTime * 4 + d.wanderAngle) * 0.03;
    });

    // 基础理智下降
    state.sanity -= 0.06 * dt;

    document.getElementById('sanity-bar').style.width = Math.max(0, state.sanity) + '%';

    // 到达谷仓
    if (cp.z < -85 && Math.abs(cp.x) < 6 && !state.levelComplete) {
      state.levelComplete = true;
      this.endLevelWrapper(state, true, '你成功逃离了猪圈！');
      return;
    }

    // 理智耗尽
    if (state.sanity <= 0) {
      this.endLevelWrapper(state, false, '被猪群包围...');
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
