// 工具函数模块
import * as THREE from 'three';

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

export function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

export function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}

export function distance2D(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

export function distance3D(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function normalizeAngle(angle) {
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
}

export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function smootherstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

export function radToDeg(radians) {
  return radians * (180 / Math.PI);
}

export function isPointInBounds(point, bounds) {
  return point.x >= bounds.min.x && point.x <= bounds.max.x &&
         point.y >= bounds.min.y && point.y <= bounds.max.y &&
         point.z >= bounds.min.z && point.z <= bounds.max.z;
}

export function createBounds(center, halfSize) {
  return {
    min: { x: center.x - halfSize.x, y: center.y - halfSize.y, z: center.z - halfSize.z },
    max: { x: center.x + halfSize.x, y: center.y + halfSize.y, z: center.z + halfSize.z }
  };
}

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeInQuad(t) {
  return t * t;
}

export function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

export function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function waveForm(t, frequency = 1, amplitude = 1, offset = 0) {
  return Math.sin(t * frequency * Math.PI * 2 + offset) * amplitude;
}

export function pingPong(t) {
  return 1 - Math.abs(2 * t - 1);
}

export function repeat(t, count = 1) {
  return (t * count) % 1;
}

export function triangleWave(t) {
  return 1 - Math.abs(2 * t - 1) * 2;
}

export function smoothNoise(t, seed = Math.random()) {
  const i = Math.floor(t);
  const f = t - i;
  const a = seed * (Math.sin(i * 12.9898 + 78.233) * 43758.5453 % 1);
  const b = seed * (Math.sin((i + 1) * 12.9898 + 78.233) * 43758.5453 % 1);
  return lerp(a, b, smoothstep(0, 1, f));
}

export function fractSin(t, seed = 0.5) {
  return Math.sin(t * Math.PI * 2 + seed) * 0.5 + 0.5;
}

export function hashVec3(x, y, z) {
  let h = x * 374761393 + y * 668265263 + z * 1103515245 + 12345;
  h = h * h;
  h = (h >> 16) ^ h;
  return h;
}

export function randomFromHash(hash) {
  return (hash % 1000000) / 1000000;
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function once(func) {
  let ran = false;
  return function (...args) {
    if (ran) return;
    ran = true;
    return func(...args);
  };
}

export function memoize(func) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatScore(score) {
  return score.toString().padStart(5, '0');
}

export function clampAngle(angle, min, max) {
  return Math.max(min, Math.min(max, angle));
}

export function getAngleToTarget(from, to) {
  return Math.atan2(to.z - from.z, to.x - from.x);
}

export function lookAtSmooth(object, target, dt, speed = 5) {
  const direction = new THREE.Vector3().subVectors(target, object.position).normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), direction);
  object.quaternion.slerp(quaternion, speed * dt);
}

export function moveTowards(current, target, maxDelta) {
  const delta = target - current;
  if (Math.abs(delta) <= maxDelta) {
    return target;
  }
  return current + Math.sign(delta) * maxDelta;
}

export function vector3MoveTowards(current, target, maxDelta) {
  const direction = new THREE.Vector3().subVectors(target, current);
  const length = direction.length();
  if (length <= maxDelta) {
    return target.clone();
  }
  direction.normalize().multiplyScalar(maxDelta);
  return current.clone().add(direction);
}

export function sphericalToCartesian(radius, phi, theta) {
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

export function cartesianToSpherical(x, y, z) {
  const radius = Math.sqrt(x * x + y * y + z * z);
  const phi = Math.acos(y / radius);
  const theta = Math.atan2(z, x);
  return { radius, phi, theta };
}

export function bezierPoint(t, p0, p1, p2, p3) {
  const c = 3 * (p1 - p0);
  const b = 3 * (p2 - p1) - c;
  const a = p3 - p0 - c - b;
  return a * t * t * t + b * t * t + c * t + p0;
}

export function quadraticBezierPoint(t, p0, p1, p2) {
  const oneMinusT = 1 - t;
  return oneMinusT * oneMinusT * p0 + 2 * oneMinusT * t * p1 + t * t * p2;
}

export function normalize(value, min, max) {
  return (value - min) / (max - min);
}

export function denormalize(value, min, max) {
  return value * (max - min) + min;
}

export function arrayRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function arrayShuffle(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function weightedRandom(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    if (random < weights[i]) return i;
    random -= weights[i];
  }
  return weights.length - 1;
}

export function lerpColor(color1, color2, t) {
  const c1 = new THREE.Color(color1);
  const c2 = new THREE.Color(color2);
  c1.lerp(c2, t);
  return c1;
}

export function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  return new THREE.Color(r + m, g + m, b + m);
}

export function rgbToHsv(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const h = 0, s = 0, v = max;

  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s, v };
}
