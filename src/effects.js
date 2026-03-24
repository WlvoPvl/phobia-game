// 视觉特效系统
import * as THREE from 'three';

export class EffectsSystem {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.particles = [];
    this.activeEffects = [];
    this.time = 0;
    this.envParticles = [];
    this.envParticleSystem = null;
  }

  // 创建环境粒子系统（灰尘、漂浮物）
  createAmbientParticles(count = 50, bounds = { x: 10, y: 3, z: 12 }) {
    if (this.envParticleSystem) {
      this.scene.remove(this.envParticleSystem);
    }

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * bounds.x;
      positions[i3 + 1] = Math.random() * bounds.y;
      positions[i3 + 2] = (Math.random() - 0.5) * bounds.z;

      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = Math.random() * 0.01 + 0.005;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 0.02,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.envParticleSystem = new THREE.Points(geometry, material);
    this.envParticleSystem.userData.velocities = velocities;
    this.envParticleSystem.userData.bounds = bounds;
    this.scene.add(this.envParticleSystem);
  }

  updateAmbientParticles(dt) {
    if (!this.envParticleSystem) return;

    const positions = this.envParticleSystem.geometry.attributes.position.array;
    const velocities = this.envParticleSystem.userData.velocities;
    const bounds = this.envParticleSystem.userData.bounds;

    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3;

      // 更新位置
      positions[i3] += velocities[i3] * dt * 60;
      positions[i3 + 1] += velocities[i3 + 1] * dt * 60;
      positions[i3 + 2] += velocities[i3 + 2] * dt * 60;

      // 循环边界
      if (positions[i3] > bounds.x / 2) positions[i3] = -bounds.x / 2;
      if (positions[i3] < -bounds.x / 2) positions[i3] = bounds.x / 2;
      if (positions[i3 + 1] > bounds.y) positions[i3 + 1] = 0;
      if (positions[i3 + 1] < 0) positions[i3 + 1] = bounds.y;
      if (positions[i3 + 2] > bounds.z / 2) positions[i3 + 2] = -bounds.z / 2;
      if (positions[i3 + 2] < -bounds.z / 2) positions[i3 + 2] = bounds.z / 2;
    }

    this.envParticleSystem.geometry.attributes.position.needsUpdate = true;
  }

  update(dt) {
    this.time += dt;
    this.updateParticles(dt);
    this.updateActiveEffects(dt);
    this.updateAmbientParticles(dt);
  }

  // 粒子系统
  createParticleExplosion(position, color = 0xffffff, count = 30, speed = 2, lifetime = 1) {
    const particleGroup = new THREE.Group();
    const geometry = new THREE.SphereGeometry(0.05, 4, 4);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 1
    });

    for (let i = 0; i < count; i++) {
      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(position);

      // 随机速度方向
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * speed,
        (Math.random() - 0.5) * speed + speed * 0.5,
        (Math.random() - 0.5) * speed
      );

      particle.userData = {
        velocity,
        lifetime,
        age: 0,
        startScale: 0.05 + Math.random() * 0.05
      };
      particle.scale.setScalar(particle.userData.startScale);
      particleGroup.add(particle);
      this.particles.push(particle);
    }

    this.scene.add(particleGroup);
    return particleGroup;
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.userData.age += dt;

      if (p.userData.age >= p.userData.lifetime) {
        p.parent.remove(p);
        this.particles.splice(i, 1);
        continue;
      }

      // 重力
      p.userData.velocity.y -= 9.8 * dt;
      p.position.add(p.userData.velocity.clone().multiplyScalar(dt));

      // 空气阻力
      p.userData.velocity.multiplyScalar(0.98);

      // 缩小和淡出
      const lifeProgress = p.userData.age / p.userData.lifetime;
      const scale = p.userData.startScale * (1 - lifeProgress * 0.5);
      p.scale.setScalar(scale);
      p.material.opacity = 1 - lifeProgress;
    }
  }

  // 屏幕闪光效果
  flashScreen(color = 0xffffff, intensity = 0.5, duration = 0.2) {
    const overlay = document.getElementById('scare-flash');
    if (overlay) {
      overlay.style.background = '#' + new THREE.Color(color).getHexString();
      overlay.style.display = 'block';
      overlay.style.transition = `opacity ${duration}s`;
      overlay.style.opacity = intensity;

      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.style.display = 'none';
        }, duration * 1000);
      }, 50);
    }
  }

  // 晕影效果
  updateVignette(intensity = 0.6) {
    const vignette = document.getElementById('vignette');
    if (vignette) {
      vignette.style.display = 'block';
      vignette.style.opacity = intensity;
    }
  }

  hideVignette() {
    const vignette = document.getElementById('vignette');
    if (vignette) {
      vignette.style.opacity = '0';
      setTimeout(() => {
        vignette.style.display = 'none';
      }, 500);
    }
  }

  // 镜头晃动
  startCameraShake(intensity = 0.01, duration = 1) {
    const effect = {
      type: 'shake',
      intensity,
      duration,
      elapsed: 0,
      originalRotation: this.camera.rotation.clone()
    };
    this.activeEffects.push(effect);
    return effect;
  }

  updateCameraShake(effect, dt) {
    effect.elapsed += dt;
    const progress = effect.elapsed / effect.duration;
    const currentIntensity = effect.intensity * (1 - progress);

    this.camera.rotation.x = effect.originalRotation.x + (Math.random() - 0.5) * currentIntensity;
    this.camera.rotation.y = effect.originalRotation.y + (Math.random() - 0.5) * currentIntensity;
    this.camera.rotation.z = effect.originalRotation.z + (Math.random() - 0.5) * currentIntensity;

    if (effect.elapsed >= effect.duration) {
      this.camera.rotation.copy(effect.originalRotation);
      const idx = this.activeEffects.indexOf(effect);
      if (idx > -1) this.activeEffects.splice(idx, 1);
    }
  }

  // 镜头扭曲效果（用于空间恐惧关卡）
  startLensDistortion(intensity = 0.1) {
    this.camera.fov = 70 + intensity * 10;
    this.camera.updateProjectionMatrix();
    return () => {
      this.camera.fov = 70;
      this.camera.updateProjectionMatrix();
    };
  }

  // 颜色滤镜
  setColorTint(color = new THREE.Color(0, 0, 0), intensity = 0.3) {
    // 在现有渲染器上添加后处理太复杂，这里使用简单的div叠加
    const tint = document.getElementById('color-tint') || document.createElement('div');
    tint.id = 'color-tint';
    tint.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 44;
      background: ${color.getStyle()};
      opacity: ${intensity};
      transition: opacity 0.5s;
    `;
    document.body.appendChild(tint);
    return () => {
      tint.style.opacity = '0';
      setTimeout(() => tint.remove(), 500);
    };
  }

  // 创建轨迹（用于幽灵出现/消失）
  createGhostTrail(startPos, endPos, color = 0xff0000, duration = 2) {
    const trail = [];
    const steps = 20;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const pos = new THREE.Vector3().lerpVectors(startPos, endPos, t);

      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          color: color,
          transparent: true,
          opacity: 1 - t,
          blending: THREE.AdditiveBlending
        })
      );
      sprite.position.copy(pos);
      sprite.scale.set(0.5, 0.5, 1);
      this.scene.add(sprite);
      trail.push({ sprite, age: 0, maxAge: duration * (1 - t * 0.5) });
    }

    this.activeEffects.push({
      type: 'trail',
      trail,
      elapsed: 0,
      duration
    });
  }

  // 创建漂浮文字（+10, -20等）
  createFloatingText(text, position, color = '#ffffff', duration = 2) {
    const div = document.createElement('div');
    div.textContent = text;
    div.style.cssText = `
      position: fixed;
      left: 50%;
      top: 40%;
      transform: translate(-50%, -50%);
      color: ${color};
      font-size: 36px;
      font-weight: bold;
      text-shadow: 2px 2px 8px rgba(0,0,0,0.9);
      pointer-events: none;
      z-index: 1000;
      opacity: 1;
      transition: all 0.3s ease-out;
      font-family: 'Segoe UI', sans-serif;
      letter-spacing: 2px;
    `;
    document.body.appendChild(div);

    const vector = position.clone();
    vector.project(this.camera);

    const x = (vector.x * .5 + .5) * window.innerWidth;
    const y = (-(vector.y * .5) + .5) * window.innerHeight;

    div.style.left = x + 'px';
    div.style.top = y + 'px';

    // 动画
    setTimeout(() => {
      div.style.opacity = '0';
      div.style.transform = `translate(-50%, -100%) scale(1.2)`;
    }, 100);

    setTimeout(() => div.remove(), duration * 1000);
  }

  // 创建灵魂上升效果（死亡/失败）
  createSoulAscend(position, color = 0xffffff) {
    const soul = new THREE.Sprite(
      new THREE.SpriteMaterial({
        color: color,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending
      })
    );
    soul.position.copy(position);
    soul.scale.set(0.3, 0.3, 1);
    this.scene.add(soul);

    this.activeEffects.push({
      type: 'ascend',
      sprite: soul,
      elapsed: 0,
      duration: 3,
      startY: position.y
    });
  }

  // 雾效变化 (支持 THREE.Fog 线性雾和 THREE.FogExp2 指数雾)
  fadeFog(color, nearOrDensity, duration = 2, far = null) {
    const targetColor = new THREE.Color(color);
    const startColor = this.scene.fog.color.clone();
    const elapsed = { value: 0 };

    // 检测雾类型
    const isExp2Fog = this.scene.fog instanceof THREE.FogExp2;
    
    let startNear, startFar, startDensity, targetNear, targetFar, targetDensity;
    
    if (isExp2Fog) {
      // FogExp2 使用 density
      startDensity = this.scene.fog.density;
      targetDensity = nearOrDensity;
    } else {
      // THREE.Fog 使用 near, far
      startNear = this.scene.fog.near;
      startFar = this.scene.fog.far;
      targetNear = nearOrDensity;
      targetFar = far !== null ? far : startFar;
    }

    const animate = () => {
      elapsed.value += 0.016;
      const t = Math.min(elapsed.value / duration, 1);
      const eased = this.easeInOutCubic(t);

      this.scene.fog.color.lerpColors(startColor, targetColor, eased);
      
      if (isExp2Fog) {
        this.scene.fog.density = startDensity + (targetDensity - startDensity) * eased;
      } else {
        this.scene.fog.near = startNear + (targetNear - startNear) * eased;
        this.scene.fog.far = startFar + (targetFar - startFar) * eased;
      }

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }

  // 闪烁效果
  createFlicker(intensity = 0.1, frequency = 10, duration = 2) {
    const effect = {
      type: 'flicker',
      intensity,
      frequency,
      duration,
      elapsed: 0,
      onFlicker: null
    };
    this.activeEffects.push(effect);
    return effect;
  }

  // 血液滴落效果
  createBloodDrip(position, count = 5) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const drip = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 4, 4),
          new THREE.MeshBasicMaterial({ color: 0x8b0000 })
        );
        drip.position.copy(position);
        drip.position.x += (Math.random() - 0.5) * 0.2;
        drip.position.z += (Math.random() - 0.5) * 0.2;
        drip.userData = {
          velocity: 0,
          gravity: -9.8,
          splashed: false
        };
        this.scene.add(drip);
        this.activeEffects.push({ type: 'drip', mesh: drip, elapsed: 0, duration: 2 });
      }, i * 200);
    }
  }

  updateActiveEffects(dt) {
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i];
      effect.elapsed += dt;

      switch (effect.type) {
        case 'shake':
          this.updateCameraShake(effect, dt);
          break;

        case 'trail':
          // Trail already handled during creation
          if (effect.elapsed >= effect.duration) {
            this.activeEffects.splice(i, 1);
          }
          break;

        case 'ascend':
          const ascendProgress = effect.elapsed / effect.duration;
          effect.sprite.position.y = effect.startY + ascendProgress * 2;
          effect.sprite.material.opacity = 1 - ascendProgress;
          effect.sprite.scale.multiplyScalar(1.01);
          if (ascendProgress >= 1) {
            effect.sprite.parent.remove(effect.sprite);
            this.activeEffects.splice(i, 1);
          }
          break;

        case 'flicker':
          if (effect.elapsed < effect.duration) {
            if (Math.random() < effect.frequency * dt) {
              const intensity = Math.random() < 0.3 ? 0 : effect.intensity;
              this.renderer.shadowMap.enabled = intensity > 0;
            }
          } else {
            this.activeEffects.splice(i, 1);
          }
          break;

        case 'drip':
          const dripProgress = effect.elapsed / effect.duration;
          if (!effect.mesh.userData.splashed) {
            effect.mesh.userData.velocity += effect.mesh.userData.gravity * dt;
            effect.mesh.position.y += effect.mesh.userData.velocity * dt;

            if (effect.mesh.position.y <= 0) {
              effect.mesh.userData.splashed = true;
              effect.mesh.material.opacity = 0;
            }
          }
          if (dripProgress >= 1) {
            effect.mesh.parent.remove(effect.mesh);
            this.activeEffects.splice(i, 1);
          }
          break;
      }
    }
  }

  // 清理所有特效
  clearAll() {
    this.particles.forEach(p => p.parent.remove(p));
    this.particles = [];
    this.activeEffects = [];
    this.hideVignette();
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}

// 简易特效函数（无需实例）
export function simpleFlash(element, color, duration = 200) {
  const originalBg = element.style.backgroundColor;
  element.style.backgroundColor = color;
  element.style.transition = `background-color ${duration}ms`;
  setTimeout(() => {
    element.style.backgroundColor = originalBg;
  }, duration);
}

export function shakeElement(element, intensity = 5, duration = 500) {
  const startX = element.offsetLeft;
  let elapsed = 0;
  const interval = setInterval(() => {
    elapsed += 16;
    const x = startX + (Math.random() - 0.5) * intensity;
    element.style.transform = `translateX(${x - startX}px)`;
    if (elapsed >= duration) {
      clearInterval(interval);
      element.style.transform = '';
    }
  }, 16);
}
