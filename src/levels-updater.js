// 关卡更新器模块
// 为LEVELS数组添加levelClass属性

import { LEVELS } from './levels/index.js';
import {
  ArachnophobiaLevel,
  AcrophobiaLevel,
  ClaustrophobiaLevel,
  NyctophobiaLevel,
  SpacePhobiaLevel,
  ClownPhobiaLevel,
  PigPhobiaLevel,
  CarcinophobiaLevel,
  WatermelonPhobiaLevel,
  AstraphobiaLevel,
  OphidiophobiaLevel,
  TrypanophobiaLevel
} from './levels/index.js';

// 关卡类映射（唯一数据源）
const LEVEL_CLASSES = {
  arachnophobia: ArachnophobiaLevel,
  acrophobia: AcrophobiaLevel,
  claustrophobia: ClaustrophobiaLevel,
  nyctophobia: NyctophobiaLevel,
  spacePhobia: SpacePhobiaLevel,
  clownPhobia: ClownPhobiaLevel,
  pigPhobia: PigPhobiaLevel,
  carcinophobia: CarcinophobiaLevel,
  watermelonPhobia: WatermelonPhobiaLevel,
  astraphobia: AstraphobiaLevel,
  ophidiophobia: OphidiophobiaLevel,
  trypanophobia: TrypanophobiaLevel
};

// 更新LEVELS数组以添加levelClass属性
export function updateLevelsWithClasses() {
  LEVELS.forEach(level => {
    if (LEVEL_CLASSES[level.id]) {
      level.levelClass = LEVEL_CLASSES[level.id];
    }
  });
  
  return LEVELS;
}

// 获取关卡类
export function getLevelClass(levelId) {
  return LEVEL_CLASSES[levelId] || null;
}

// 获取关卡索引对应的类
export function getLevelClassByIndex(index) {
  if (index < 0 || index >= LEVELS.length) return null;
  return LEVEL_CLASSES[LEVELS[index].id] || null;
}

export { LEVEL_CLASSES };

export default {
  updateLevelsWithClasses,
  getLevelClass,
  getLevelClassByIndex,
  LEVEL_CLASSES
};