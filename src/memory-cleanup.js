// 内存清理工具 - 彻底清理场景中的对象，防止内存泄漏
import * as THREE from 'three';

export class MemoryCleanup {
  static disposeObject(obj) {
    if (!obj) return;
    
    if (obj.geometry) {
      if (obj.geometry.dispose) {
        obj.geometry.dispose();
      }
      if (obj.geometry.attributes) {
        for (const key in obj.geometry.attributes) {
          if (obj.geometry.attributes[key].array) {
            obj.geometry.attributes[key].array = null;
          }
        }
      }
    }
    
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(m => MemoryCleanup.disposeMaterial(m));
      } else {
        MemoryCleanup.disposeMaterial(obj.material);
      }
    }
    
    if (obj.children && obj.children.length > 0) {
      const children = [...obj.children];
      children.forEach(child => {
        MemoryCleanup.disposeObject(child);
        if (child.parent) {
          child.parent.remove(child);
        }
      });
    }
  }
  
  static disposeMaterial(material) {
    if (!material) return;
    
    if (material.dispose) {
      material.dispose();
    }
    
    if (material.map) {
      if (material.map.dispose) material.map.dispose();
    }
    if (material.alphaMap) {
      if (material.alphaMap.dispose) material.alphaMap.dispose();
    }
    if (material.roughnessMap) {
      if (material.roughnessMap.dispose) material.roughnessMap.dispose();
    }
    if (material.metalnessMap) {
      if (material.metalnessMap.dispose) material.metalnessMap.dispose();
    }
    if (material.emissiveMap) {
      if (material.emissiveMap.dispose) material.emissiveMap.dispose();
    }
    if (material.normalMap) {
      if (material.normalMap.dispose) material.normalMap.dispose();
    }
    if (material.bumpMap) {
      if (material.bumpMap.dispose) material.bumpMap.dispose();
    }
    if (material.gradientMap) {
      if (material.gradientMap.dispose) material.gradientMap.dispose();
    }
  }
  
  static cleanupLevel(state) {
    if (state.levelScene) {
      MemoryCleanup.disposeObject(state.levelScene);
      if (state.levelScene.parent) {
        state.levelScene.parent.remove(state.levelScene);
      }
      state.levelScene = null;
    }
    
    if (state.spiders && state.spiders.length > 0) {
      state.spiders.forEach(sp => {
        if (sp.mesh) {
          MemoryCleanup.disposeObject(sp.mesh);
          if (sp.mesh.parent) {
            sp.mesh.parent.remove(sp.mesh);
          }
        }
      });
      state.spiders = [];
    }
    
    state.cosmicPlatforms = [];
    state.clownFigures = [];
    state.animatronicClowns = [];
    state.pigs = [];
    state.crabs = [];
    state.watermelons = [];
    state.flyingSeeds = [];
    
    if (state.levelLights) {
      state.levelLights.forEach(light => {
        if (light.parent) light.parent.remove(light);
      });
      state.levelLights = [];
    }
    
    if (state.playerFlashlight) {
      state.playerFlashlight.target = null;
      if (state.playerFlashlight.parent) {
        state.playerFlashlight.parent.remove(state.playerFlashlight);
      }
      state.playerFlashlight = null;
    }
    
    state.scareTriggered = false;
    state.spiderWave = 0;
    state.spiderTimer = 0;
    state.cosmicTimer = 0;
    state.clownTimer = 0;
    state.pigAggression = 0;
    state.fallDeathTriggered = false;
    state.windWarning = false;
    
    state.nycto = null;
    state.blackHole = null;
    state.portal = null;
    state.stars = null;
    state.oceanWater = null;
  }
  
  static cleanupOffice(state) {
    if (state.officeGroup) {
      MemoryCleanup.disposeObject(state.officeGroup);
    }
  }
}

export default MemoryCleanup;