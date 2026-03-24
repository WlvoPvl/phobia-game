// 关卡辅助工具 - 帮助创建和增强关卡
import * as THREE from 'three';

export class LevelHelper {
  static createFloor(size = 20, color = 0x333333, receiveShadow = true) {
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshStandardMaterial({ 
      color, 
      roughness: 0.9,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = receiveShadow;
    return floor;
  }
  
  static createWalls(width = 20, height = 4, depth = 20) {
    const walls = new THREE.Group();
    const wallMat = new THREE.MeshStandardMaterial({ 
      color: 0x444444, 
      roughness: 0.8,
      side: THREE.DoubleSide
    });
    
    // 前后墙
    const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMat);
    frontWall.position.set(0, height/2, depth/2);
    walls.add(frontWall);
    
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMat);
    backWall.position.set(0, height/2, -depth/2);
    backWall.rotation.y = Math.PI;
    walls.add(backWall);
    
    // 左右墙
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMat);
    leftWall.position.set(-width/2, height/2, 0);
    leftWall.rotation.y = Math.PI / 2;
    walls.add(leftWall);
    
    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMat);
    rightWall.position.set(width/2, height/2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    walls.add(rightWall);
    
    return walls;
  }
  
  static createLight(type = 'ambient', color = 0xffffff, intensity = 0.5, position = [0, 5, 0]) {
    let light;
    switch(type) {
      case 'point':
        light = new THREE.PointLight(color, intensity);
        break;
      case 'spot':
        light = new THREE.SpotLight(color, intensity);
        break;
      case 'directional':
        light = new THREE.DirectionalLight(color, intensity);
        break;
      case 'hemisphere':
        light = new THREE.HemisphereLight(color, 0x444444, intensity);
        break;
      case 'ambient':
      default:
        light = new THREE.AmbientLight(color, intensity);
        break;
    }
    
    if (position && light.position) {
      light.position.set(...position);
    }
    
    return light;
  }
  
  static createPlatform(width, height, depth, color = 0x666666) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ 
      color, 
      roughness: 0.7,
      metalness: 0.2
    });
    const platform = new THREE.Mesh(geometry, material);
    platform.castShadow = true;
    platform.receiveShadow = true;
    return platform;
  }
  
  static createBasicMonster(size = 1, color = 0xff0000) {
    const group = new THREE.Group();
    
    // 身体
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(size * 0.5, 8, 8),
      new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
    );
    body.position.y = size * 0.5;
    group.add(body);
    
    // 眼睛
    const eyeMat = new THREE.MeshStandardMaterial({ 
      color: 0xff0000, 
      emissive: 0xff0000, 
      emissiveIntensity: 1 
    });
    [-0.2, 0.2].forEach(x => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(size * 0.08, 6, 6), eyeMat);
      eye.position.set(x * size, size * 0.7, size * 0.4);
      group.add(eye);
    });
    
    return group;
  }
  
  static createFog(color = 0x000000, near = 10, far = 50) {
    return new THREE.Fog(color, near, far);
  }
  
  static setBackground(scene, color = 0x111111) {
    if (scene) {
      scene.background = new THREE.Color(color);
    }
  }
  
  static clampPosition(position, minX, maxX, minZ, maxZ, minY = -10, maxY = 20) {
    position.x = Math.max(minX, Math.min(maxX, position.x));
    position.y = Math.max(minY, Math.min(maxY, position.y));
    position.z = Math.max(minZ, Math.min(maxZ, position.z));
    return position;
  }
}

export default LevelHelper;