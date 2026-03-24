// 蛇恐惧症关卡 - OphidiophobiaLevel
// 恐惧对象：蛇、爬行动物
import * as THREE from 'three';

export class OphidiophobiaLevel {
  static create(state) {
    state.scene.background = new THREE.Color(0x0a2a0a);
    state.scene.fog = new THREE.Fog(0x0a2a0a, 15, 50);
    
    // 地面 - 丛林地面
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1a2a10,
      roughness: 0.95
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    state.levelScene.add(ground);
    
    // 岩石和植被
    for (let i = 0; i < 20; i++) {
      const rock = OphidiophobiaLevel.createRock();
      rock.position.set(
        (Math.random() - 0.5) * 25,
        0,
        (Math.random() - 0.5) * 25
      );
      state.levelScene.add(rock);
    }

    const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 3, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a });
    const foliageGeo = new THREE.ConeGeometry(1.5, 3, 6);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x1a4a1a });
    for (let i = 0; i < 20; i++) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.5;
      tree.add(trunk);
      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.y = 4;
      tree.add(foliage);
      tree.position.set(
        (Math.random() - 0.5) * 50,
        0,
        (Math.random() - 0.5) * 50
      );
      state.levelScene.add(tree);
    }

    // 终点安全屋
    const safeHouseMat = new THREE.MeshStandardMaterial({ color: 0x5a6a4a, roughness: 0.7 });
    const safeHouse = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 4), safeHouseMat);
    safeHouse.position.set(0, 1.5, -25);
    state.levelScene.add(safeHouse);
    
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x3a4a2a });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.5, 2, 4), roofMat);
    roof.position.set(0, 4, -25);
    roof.rotation.y = Math.PI / 4;
    state.levelScene.add(roof);
    
    // 安全屋灯光
    const safeLight = new THREE.PointLight(0xffaa44, 2, 8);
    safeLight.position.set(0, 2, -23);
    state.levelScene.add(safeLight);
    state.levelLights.push(safeLight);
    
    // 出口绿光
    const exitLight = new THREE.PointLight(0x00ff44, 1.5, 6);
    exitLight.position.set(0, 1.5, -23);
    state.levelScene.add(exitLight);
    
    // 蛇相关状态
    state.snakes = [];
    state.snakeSpawnTimer = 0;
    state.maxSnakes = 12;
    
    // 初始生成蛇
    for (let i = 0; i < 5; i++) {
      OphidiophobiaLevel.spawnSnake(state);
    }
    
    // 光照
    const ambient = new THREE.AmbientLight(0x446633, 0.5);
    state.levelScene.add(ambient);
    
    const sunLight = new THREE.DirectionalLight(0x88aa66, 0.5);
    sunLight.position.set(10, 20, 10);
    sunLight.castShadow = true;
    state.levelScene.add(sunLight);
    state.levelLights.push(sunLight);
    
    state.camera.position.set(0, 1.6, 5);
    state.camera.rotation.set(0, 0, 0);
    
    state.levelBounds = { minX: -25, maxX: 25, minZ: -30, maxZ: 25 };
    
    setTimeout(() => {
      const hint = document.getElementById('hint-text');
      if (hint && state.levelIndex === 10 && state.levelActive) {
        hint.textContent = '丛林中有蛇...找到安全屋！';
      }
    }, 2000);
  }
  
  static createRock() {
    const geo = new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.5, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.9
    });
    const rock = new THREE.Mesh(geo, mat);
    rock.position.y = 0.2;
    rock.rotation.set(
      Math.random() * 0.5,
      Math.random() * Math.PI,
      Math.random() * 0.5
    );
    return rock;
  }
  
  static createSnakeMesh() {
    const group = new THREE.Group();
    
    const segmentGeo = new THREE.SphereGeometry(0.1, 16, 12);
    const segmentMat = new THREE.MeshStandardMaterial({
      color: 0x3a7a30,
      roughness: 0.8
    });
    
    for (let i = 0; i < 8; i++) {
      const segment = new THREE.Mesh(segmentGeo, segmentMat);
      segment.position.x = -i * 0.2;
      const factor = 1 - i * 0.08; segment.scale.set(1.3 - i * 0.06, factor, factor);
      group.add(segment);
    }
    
    const headGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const head = new THREE.Mesh(headGeo, segmentMat);
    head.position.x = 0.3;
    group.add(head);
    
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x440000 });
    const eyeGeo = new THREE.SphereGeometry(0.04, 6, 6);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(0.35, 0.08, 0.1);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.35, 0.08, -0.1);
    group.add(rightEye);
    
    const tongueMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const tongue = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.01, 0.3, 4),
      tongueMat
    );
    tongue.rotation.z = -Math.PI / 2;
    tongue.position.set(0.5, 0, 0);
    group.add(tongue);
    
    return group;
  }
  
  static spawnSnake(state) {
    if (state.snakes.length >= state.maxSnakes) return;
    
    const snake = {
      mesh: this.createSnakeMesh(),
      direction: Math.random() * Math.PI * 2,
      speed: 1 + Math.random() * 1.5,
      hissTimer: 0
    };
    
    const angle = Math.random() * Math.PI * 2;
    const dist = 8 + Math.random() * 10;
    const playerPos = state.camera.position;
    snake.mesh.position.set(
      playerPos.x + Math.cos(angle) * dist,
      0.2,
      playerPos.z + Math.sin(angle) * dist
    );
    
    state.levelScene.add(snake.mesh);
    state.snakes.push(snake);
  }
  
  static update(state, dt) {
    if (!state.levelActive || state.levelIndex !== 10) return null;
    state.levelTime += dt;
    const cp = state.camera.position;
    
    // 更新每条蛇
    for (let i = state.snakes.length - 1; i >= 0; i--) {
      const snake = state.snakes[i];
      const toPlayer = new THREE.Vector3().subVectors(cp, snake.mesh.position);
      const distToPlayer = toPlayer.length();
      
      if (distToPlayer < 15) {
        toPlayer.normalize();
        snake.mesh.position.add(toPlayer.multiplyScalar(snake.speed * dt));
      } else {
        snake.direction += (Math.random() - 0.5) * 2 * dt;
        snake.mesh.position.x += Math.cos(snake.direction) * snake.speed * dt;
        snake.mesh.position.z += Math.sin(snake.direction) * snake.speed * dt;
      }
      
      snake.mesh.rotation.y = Math.atan2(
        cp.x - snake.mesh.position.x,
        cp.z - snake.mesh.position.z
      );
      
      // 蛇身跟随动画
      const segments = snake.mesh.children.slice(0, 8);
      for (let j = 1; j < segments.length; j++) {
        const prev = segments[j - 1].position;
        const curr = segments[j].position;
        curr.lerp(prev, 5 * dt);
      }
      
      // 距离过远回收
      if (distToPlayer > 30) {
        state.levelScene.remove(snake.mesh);
        snake.mesh.traverse(obj => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) obj.material.dispose();
        });
        state.snakes.splice(i, 1);
        continue;
      }
      
      // 靠近蛇时理智下降
      if (distToPlayer < 5) {
        state.sanity -= (5 - distToPlayer) * dt * 1.5;
      }
      
      // 蛇太靠近时推开或隐藏
      if (distToPlayer < 1) {
        const pushDir = new THREE.Vector3().subVectors(snake.mesh.position, cp).normalize();
        pushDir.y = 0;
        snake.mesh.position.add(pushDir.multiplyScalar(2 * dt));
        snake.mesh.visible = false;
        setTimeout(() => { snake.mesh.visible = true; }, 500);
      }
      
      // 蛇咬伤
      if (distToPlayer < 1.5) {
        state.sanity -= 3 * dt;
      }
    }
    
    // 生成新蛇
    state.snakeSpawnTimer += dt;
    if (state.snakeSpawnTimer > 5 && state.snakes.length < state.maxSnakes) {
      state.snakeSpawnTimer = 0;
      OphidiophobiaLevel.spawnSnake(state);
    }
    
    // 基础理智下降
    state.sanity -= 0.05 * dt;
    
    document.getElementById('sanity-bar').style.width = Math.max(0, state.sanity) + '%';
    
    // 到达安全屋
    if (cp.z < -22 && Math.abs(cp.x) < 3 && !state.levelComplete) {
      state.levelComplete = true;
      this.endLevelWrapper(state, true, '你安全到达了安全屋！');
      return;
    }
    
    // 理智耗尽
    if (state.sanity <= 0) {
      this.endLevelWrapper(state, false, '被蛇群包围，无法脱身...');
      return false;
    }

    return null;
  }

  static endLevelWrapper(state, success, msg) {
    // 清理所有蛇
    if (state.snakes) {
      state.snakes.forEach(snake => {
        if (snake.mesh && snake.mesh.parent) {
          snake.mesh.parent.remove(snake.mesh);
        }
      });
      state.snakes = [];
    }
    if (typeof window !== 'undefined' && window._endLevel) {
      window._endLevel(success, msg);
    }
  }
}

export default OphidiophobiaLevel;
