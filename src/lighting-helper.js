// 光照增强工具 - 可选导入以改善暗关卡的可见度
import * as THREE from 'three';

export class LightingHelper {
  static enhanceLevelVisibility(scene, levelIndex, levelScene) {
    if (!levelScene) return;
    
    const enhancements = {
      0: LightingHelper.enhanceArachnophobia,
      1: LightingHelper.enhanceAcrophobia,
      2: LightingHelper.enhanceClaustrophobia,
      3: LightingHelper.enhanceNyctophobia,
      4: LightingHelper.enhanceSpacePhobia,
      5: LightingHelper.enhanceClownPhobia,
      6: LightingHelper.enhancePigPhobia,
      7: LightingHelper.enhanceCarcinophobia,
      8: LightingHelper.enhanceWatermelonPhobia
    };
    
    if (enhancements[levelIndex]) {
      enhancements[levelIndex](levelScene);
    }
  }
  
  static enhanceArachnophobia(levelScene) {
    const ambient = new THREE.AmbientLight(0x334466, 0.8);
    levelScene.add(ambient);
    
    const hemi = new THREE.HemisphereLight(0x6688aa, 0x334433, 0.6);
    levelScene.add(hemi);
    
    const skyLight = new THREE.DirectionalLight(0x8888cc, 0.7);
    skyLight.position.set(0, 50, 0);
    levelScene.add(skyLight);
  }
  
  static enhanceAcrophobia(levelScene) {
    const ambient = new THREE.AmbientLight(0x87ceeb, 0.4);
    levelScene.add(ambient);
    
    const sun = new THREE.DirectionalLight(0xffffee, 0.8);
    sun.position.set(50, 100, 50);
    levelScene.add(sun);
  }
  
  static enhanceClaustrophobia(levelScene) {
    const faintLight = new THREE.PointLight(0xffaa88, 0.3, 15);
    faintLight.position.set(0, 2, 0);
    levelScene.add(faintLight);
  }
  
  static enhanceNyctophobia(levelScene) {
    // 黑暗关卡只加一点点环境光，让玩家不完全摸黑
    const ambient = new THREE.AmbientLight(0x111122, 0.15);
    levelScene.add(ambient);
  }
  
  static enhanceSpacePhobia(levelScene) {
    const ambient = new THREE.AmbientLight(0x222244, 0.2);
    levelScene.add(ambient);
    
    const starlight = new THREE.PointLight(0xffffff, 0.1, 50);
    starlight.position.set(0, 0, 0);
    levelScene.add(starlight);
  }
  
  static enhanceClownPhobia(levelScene) {
    const ambient = new THREE.AmbientLight(0x442244, 0.3);
    levelScene.add(ambient);
    
    const spot = new THREE.PointLight(0xff6644, 0.5, 20);
    spot.position.set(0, 5, 0);
    levelScene.add(spot);
  }
  
  static enhancePigPhobia(levelScene) {
    const ambient = new THREE.AmbientLight(0x665544, 0.4);
    levelScene.add(ambient);
    
    const moonLight = new THREE.DirectionalLight(0xaabbcc, 0.3);
    moonLight.position.set(-10, 20, 10);
    levelScene.add(moonLight);
  }
  
  static enhanceCarcinophobia(levelScene) {
    const ambient = new THREE.AmbientLight(0x88aacc, 0.4);
    levelScene.add(ambient);
  }
  
  static enhanceWatermelonPhobia(levelScene) {
    const ambient = new THREE.AmbientLight(0xccffcc, 0.5);
    levelScene.add(ambient);
  }
}

export default LightingHelper;