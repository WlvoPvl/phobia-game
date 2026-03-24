// 办公室场景模块 - 温馨心理咨询室
import * as THREE from 'three';

export function createOffice(state) {
  // 清理旧办公室场景
  if (state.officeGroup) {
    state.scene.remove(state.officeGroup);
    state.officeGroup.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m.dispose());
        } else {
          if (object.material.dispose) object.material.dispose();
        }
      }
    });
  }
  state.officeGroup = new THREE.Group();
  state.scene.add(state.officeGroup);

  state.scene.background = new THREE.Color(0x2a1f14);
  state.scene.fog = new THREE.Fog(0x2a1f14, 20, 50); // 减少雾效浓度，提高可见度

  const roomW = 10, roomD = 12, roomH = 3.2;

  // === 地板 (木地板纹理色) ===
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x8B6914, roughness: 0.6 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomD), floorMat);
  floor.rotation.x = -Math.PI/2; floor.receiveShadow = true;
  state.officeGroup.add(floor);
  // 地板花纹条
  for(let i=0;i<8;i++){
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(roomW,0.005,0.02), new THREE.MeshStandardMaterial({color:0x6B4F10}));
    stripe.position.set(0,0.001,-roomD/2+0.8+i*1.5);
    state.officeGroup.add(stripe);
  }

  // === 天花板 ===
  const ceilMat = new THREE.MeshStandardMaterial({ color: 0xf5efe0, roughness: 0.95 });
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomD), ceilMat);
  ceil.rotation.x = Math.PI/2; ceil.position.y = roomH;
  state.officeGroup.add(ceil);

  // === 墙壁 (暖米色) ===
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.85 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xc4a882, roughness: 0.8 });
  [
    { p:[0,roomH/2,-roomD/2], r:[0,0,0], w:roomW, h:roomH },
    { p:[0,roomH/2,roomD/2], r:[0,Math.PI,0], w:roomW, h:roomH },
    { p:[-roomW/2,roomH/2,0], r:[0,Math.PI/2,0], w:roomD, h:roomH },
    { p:[roomW/2,roomH/2,0], r:[0,-Math.PI/2,0], w:roomD, h:roomH },
  ].forEach(w => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w.w, w.h), wallMat);
    m.position.set(...w.p); m.rotation.set(...w.r);
    state.officeGroup.add(m);
    // 踢脚线
    const baseboard = new THREE.Mesh(new THREE.BoxGeometry(w.w, 0.1, 0.02), accentMat);
    baseboard.position.set(w.p[0], 0.05, w.p[2]);
    baseboard.rotation.set(...w.r);
    if(w.r[1]===Math.PI/2||w.r[1]===-Math.PI/2){
      baseboard.position.z = w.p[2];
    }
    state.officeGroup.add(baseboard);
  });

  // === 窗户 (右侧墙, 带窗帘) ===
  const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.0, 2.8), new THREE.MeshStandardMaterial({color:0x87ceeb, emissive:0x87ceeb, emissiveIntensity:0.4}));
  winFrame.position.set(roomW/2-0.04, 2.0, -1);
  state.officeGroup.add(winFrame);
  // 窗框
  const wfMat = new THREE.MeshStandardMaterial({color:0xf5f0e0,roughness:0.5});
  [[-1.4,0],[1.4,0],[0,1],[0,-1]].forEach(([dx,dy]) => {
    const isH = dy!==0;
    const bar = new THREE.Mesh(isH?new THREE.BoxGeometry(2.9,0.06,0.1):new THREE.BoxGeometry(0.06,2.0,0.1), wfMat);
    bar.position.set(roomW/2-0.03, 2.0+dy, -1+dx);
    state.officeGroup.add(bar);
  });
  // 窗帘
  const curtainMat = new THREE.MeshStandardMaterial({color:0x8B4513, roughness:0.9, side:THREE.DoubleSide});
  [-1.6,1.6].forEach(dx => {
    const curtain = new THREE.Mesh(new THREE.PlaneGeometry(0.6,2.6), curtainMat);
    curtain.position.set(roomW/2-0.06, 1.9, -1+dx);
    curtain.rotation.y = Math.PI/2;
    state.officeGroup.add(curtain);
  });

  // === 家具 ===
  createDesk(state, 0, 0, -2);
  createCounselor(state, 0, 0, -4.5);
  createChair(state, 0, 0, 0.8, true);
  createBookshelf(state, -4.2, 0, -3);
  createCouch(state, 3.5, 0, 2);
  createCoffeeTable(state, 2, 0, 0);
  createPlant(state, 4.2, 0, -5);
  createPlant(state, -4.2, 0, 4);
  createWallDecorations(state, roomW, roomD, roomH);

  // === 地毯 (大圆形) ===
  const rug = new THREE.Mesh(new THREE.CircleGeometry(2.8, 32), new THREE.MeshStandardMaterial({color:0x8b2500, roughness:1}));
  rug.rotation.x = -Math.PI/2; rug.position.y = 0.005;
  state.officeGroup.add(rug);
  const rugInner = new THREE.Mesh(new THREE.CircleGeometry(2.2, 32), new THREE.MeshStandardMaterial({color:0xa03020, roughness:1}));
  rugInner.rotation.x = -Math.PI/2; rugInner.position.y = 0.008;
  state.officeGroup.add(rugInner);

  // === 灯光系统 ===
  // 主环境光 (暖白) - 增强亮度
  state.officeGroup.add(new THREE.AmbientLight(0xfff0d0, 1.2));

  // 吊灯 - 主光源
  const ceilLight = new THREE.PointLight(0xffe8c0, 3.0, 25);
  ceilLight.position.set(0, roomH-0.3, 0);
  ceilLight.castShadow = true;
  ceilLight.shadow.mapSize.width = 1024;
  ceilLight.shadow.mapSize.height = 1024;
  ceilLight.shadow.bias = -0.0001;
  state.officeGroup.add(ceilLight);
  // 注意: 不添加到state.levelLights，因为该数组在returnToOffice中会被清空
  // office灯应该随officeGroup一起管理

  // 吊灯罩
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.55,0.25,16), new THREE.MeshStandardMaterial({color:0xffcc66, emissive:0xffaa00, emissiveIntensity:0.8}));
  shade.position.set(0, roomH-0.12, 0);
  state.officeGroup.add(shade);

  // 灯绳
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.01,0.01,0.4,4), new THREE.MeshStandardMaterial({color:0x333333}));
  cord.position.set(0,roomH-0.35,0);
  state.officeGroup.add(cord);

  // 台灯 (桌面) - 增强
  const deskLamp = new THREE.PointLight(0xffa500, 2.0, 10);
  deskLamp.position.set(1.3, 1.5, -2.3);
  deskLamp.castShadow = false; // 优化：不投射阴影
  state.officeGroup.add(deskLamp);

  // 窗光 - 模拟自然光
  const winLight = new THREE.DirectionalLight(0xfff8e8, 1.2);
  winLight.position.set(8, 6, -1);
  winLight.castShadow = false;
  state.officeGroup.add(winLight);

  // 补光 - 顶部微弱蓝色光模拟天空
  const skyLight = new THREE.HemisphereLight(0x87ceeb, 0x2a1f14, 0.6);
  state.officeGroup.add(skyLight);

  // 角落落地灯 - 增强
  const floorLamp = new THREE.PointLight(0xffeedd, 1.5, 10);
  floorLamp.position.set(-4, 1.5, 4);
  floorLamp.castShadow = false;
  state.officeGroup.add(floorLamp);

  // 沙发灯 - 氛围光
  const flShade = new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.18,0.3,8), new THREE.MeshStandardMaterial({color:0xddaa44,emissive:0xaa8800,emissiveIntensity:0.6}));
  flShade.position.set(-4,1.7,4);
  state.officeGroup.add(flShade);
  const flPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,1.5,4), new THREE.MeshStandardMaterial({color:0x444444}));
  flPole.position.set(-4,0.75,4);
  state.officeGroup.add(flPole);
  const flBase = new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,0.03,12), new THREE.MeshStandardMaterial({color:0x444444}));
  flBase.position.set(-4,0.015,4); state.officeGroup.add(flBase);

  // === 环境粒子系统 (灰尘微粒) ===
  if (state.effectsSystem) {
    state.effectsSystem.createAmbientParticles(40, { x: roomW, y: roomH, z: roomD });
  }
}

function createDesk(state, x, y, z) {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({color:0x6B4226, roughness:0.5, metalness:0.1});
  const darkWood = new THREE.MeshStandardMaterial({color:0x4a2c0a, roughness:0.6});

  // 桌面
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.06, 1.3), wood);
  top.position.y = 0.78; top.castShadow = true; top.receiveShadow = true; g.add(top);
  // 桌面边缘
  const edge = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.03, 1.32), darkWood);
  edge.position.y = 0.75; g.add(edge);
  // 桌腿
  for(const dx of [-1.2, 1.2]) for(const dz of [-0.55, 0.55]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.72, 0.06), darkWood);
    leg.position.set(dx, 0.36, dz); g.add(leg);
  }
  // 抽屉
  const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.4), darkWood);
  drawer.position.set(-0.8, 0.63, 0); g.add(drawer);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.01,0.01,0.15,6), new THREE.MeshStandardMaterial({color:0xccaa44,metalness:0.8}));
  handle.position.set(-0.8, 0.63, 0.21); handle.rotation.x = Math.PI/2; g.add(handle);

  // 书本 (交互物)
  const bookMat = new THREE.MeshStandardMaterial({color:0x8b0000, emissive:0x4a0000, emissiveIntensity:0.3, roughness:0.4});
  state.bookMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.25), bookMat);
  state.bookMesh.position.set(0.2, 0.84, 0); state.bookMesh.rotation.y = 0.15;
  state.bookMesh.userData.type = 'book'; g.add(state.bookMesh);
   const bookLight = new THREE.PointLight(0xff4444, 0.5, 2);
   bookLight.position.set(0.2, 1.0, 0);
   g.add(bookLight);

  // 电脑显示器
  const screenMat = new THREE.MeshStandardMaterial({color:0x111122, emissive:0x2233aa, emissiveIntensity:0.15});
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.03), screenMat);
  screen.position.set(-0.6, 1.1, -0.3); screen.rotation.y = 0.1; g.add(screen);
  // 显示器底座
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.3, 0.15), new THREE.MeshStandardMaterial({color:0x222222}));
  stand.position.set(-0.6, 0.88, -0.3); g.add(stand);
  // 键盘
  const kb = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.02, 0.15), new THREE.MeshStandardMaterial({color:0x333333}));
  kb.position.set(-0.6, 0.82, 0.05); g.add(kb);
  // 鼠标
  const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.1), new THREE.MeshStandardMaterial({color:0x333333}));
  mouse.position.set(-0.25, 0.82, 0.05); g.add(mouse);

  // 笔筒
  const holder = new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.035,0.12,8), new THREE.MeshStandardMaterial({color:0x2a2a2a}));
  holder.position.set(0.9, 0.86, -0.3); g.add(holder);
  // 笔
  for(let i=0;i<3;i++){
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.008,0.14,4), new THREE.MeshStandardMaterial({color:[0x0000aa,0xaa0000,0x00aa00][i]}));
    pen.position.set(0.9+0.01*i, 0.93, -0.3); pen.rotation.z = 0.1*(i-1); g.add(pen);
  }

  // 台灯 (绿色银行家灯)
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,0.04,12), new THREE.MeshStandardMaterial({color:0x887744,metalness:0.6}));
  lampBase.position.set(1.2, 0.81, -0.4); g.add(lampBase);
  const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.45,6), new THREE.MeshStandardMaterial({color:0x887744,metalness:0.6}));
  lampArm.position.set(1.2, 1.05, -0.4); g.add(lampArm);
  const lampHead = new THREE.Mesh(new THREE.SphereGeometry(0.1,12,8,0,Math.PI*2,0,Math.PI/2), new THREE.MeshStandardMaterial({color:0x228833,emissive:0x115522,emissiveIntensity:0.5}));
  lampHead.position.set(1.2, 1.35, -0.4); g.add(lampHead);

  // 咖啡杯
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.025,0.08,8), new THREE.MeshStandardMaterial({color:0xeeeeee}));
  cup.position.set(0.7, 0.84, 0.2); g.add(cup);
  const coffee = new THREE.Mesh(new THREE.CylinderGeometry(0.027,0.027,0.01,8), new THREE.MeshStandardMaterial({color:0x3a1a0a}));
  coffee.position.set(0.7, 0.88, 0.2); g.add(coffee);

  g.position.set(x, y, z); state.officeGroup.add(g);
}

function createCounselor(state, x, y, z) {
  const g = new THREE.Group();

  // 材质
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5deb3, roughness: 0.5 });
  const suitMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.7 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0xecf0f1, roughness: 0.6 });
  const tieMat = new THREE.MeshStandardMaterial({ color: 0x8e44ad, roughness: 0.4 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.9 });

  // === 座椅 ===
  const chairGroup = new THREE.Group();
  const woodChair = new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.7 });
  
  // 椅座
  const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.5), woodChair);
  chairSeat.position.y = 0.5;
  chairGroup.add(chairSeat);
  
  // 椅背
  const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.06), woodChair);
  chairBack.position.set(0, 0.85, -0.22);
  chairGroup.add(chairBack);
  
  // 椅腿
  for (const dx of [-0.2, 0.2]) {
    for (const dz of [-0.2, 0.2]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.5, 6), woodChair);
      leg.position.set(dx, 0.25, dz);
      chairGroup.add(leg);
    }
  }
  
  chairGroup.position.set(0, 0, 0.3); // 椅子稍微前移
  g.add(chairGroup);

  // === 咨询师身体（坐姿）===
  
  // 腿部（坐着，短一些）
  [-0.08, 0.08].forEach(dx => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.4, 6), suitMat);
    leg.position.set(dx, 0.55, 0.1);
    leg.rotation.z = dx > 0 ? -0.2 : 0.2;
    g.add(leg);
    
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.14), shoeMat);
    shoe.position.set(dx + (dx > 0 ? 0.04 : -0.04), 0.22, 0.18);
    g.add(shoe);
  });

  // 躯干（西装）
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.15, 0.7, 8), suitMat);
  torso.position.y = 0.9;
  torso.rotation.x = -0.1; // 稍微前倾
  g.add(torso);

  // 衬衫领
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.18, 8), shirtMat);
  collar.position.y = 1.1;
  g.add(collar);

  // 脖子
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.12, 6), skinMat);
  neck.position.y = 1.22;
  g.add(neck);

  // 头（更高）
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), skinMat);
  head.position.y = 1.38;
  head.scale.set(1, 1.1, 1); // 稍长脸
  g.add(head);

  // 头发
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), hairMat);
  hair.position.y = 1.42;
  hair.scale.set(1.05, 0.8, 1.05);
  g.add(hair);

  // 领带
  const tie = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.35, 4), tieMat);
  tie.position.set(0, 1.05, 0.12);
  tie.rotation.x = Math.PI + 0.1;
  g.add(tie);

  // 手臂（放在桌面上方）
  // 左臂
  const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.3, 6), suitMat);
  leftUpperArm.position.set(-0.22, 1.0, 0.1);
  leftUpperArm.rotation.z = 0.3;
  leftUpperArm.rotation.x = -0.2;
  g.add(leftUpperArm);

  const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.25, 6), shirtMat);
  leftForearm.position.set(-0.35, 0.88, 0.25);
  leftForearm.rotation.z = 0.1;
  leftForearm.rotation.x = -0.5;
  g.add(leftForearm);

  const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), skinMat);
  leftHand.position.set(-0.38, 0.72, 0.32);
  g.add(leftHand);

  // 右臂
  const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.3, 6), suitMat);
  rightUpperArm.position.set(0.22, 1.0, 0.1);
  rightUpperArm.rotation.z = -0.3;
  rightUpperArm.rotation.x = -0.2;
  g.add(rightUpperArm);

  const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.25, 6), shirtMat);
  rightForearm.position.set(0.35, 0.88, 0.25);
  rightForearm.rotation.z = -0.1;
  rightForearm.rotation.x = -0.5;
  g.add(rightForearm);

  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), skinMat);
  rightHand.position.set(0.38, 0.72, 0.32);
  g.add(rightHand);

  // 桌子上的文件夹
  const folder = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 0.2), new THREE.MeshStandardMaterial({color:0x8B4513}));
  folder.position.set(0, 0.95, -0.2);
  folder.rotation.x = 0.1;
  g.add(folder);

  // 咖啡杯
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.08, 8), new THREE.MeshStandardMaterial({color:0xeeeeee}));
  cup.position.set(0.35, 0.93, -0.15);
  g.add(cup);
  
  const coffee = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.015, 8), new THREE.MeshStandardMaterial({color:0x3a1a0a}));
  coffee.position.set(0.35, 0.97, -0.15);
  g.add(coffee);

  // 整体高度提升，位置调整
  g.position.set(x, y + 0.3, z + 0.8); // 抬高并靠近桌子

  // 添加交互数据
  g.userData.type = 'counselor';
  g.userData.interactive = true;

  state.counselorGroup = g;
  state.officeGroup.add(g);
}

function createChair(state, x, y, z, isPlayer) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({color:isPlayer?0x2f2f2f:0x5c3a1e, roughness:0.7});
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.05,0.5), mat);
  seat.position.y = 0.48; g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.55,0.05), mat);
  back.position.set(0,0.78,-0.22); g.add(back);
  for(const dx of [-0.2,0.2]) for(const dz of [-0.2,0.2]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.45,6), new THREE.MeshStandardMaterial({color:0x333333,metalness:0.5}));
    leg.position.set(dx,0.225,dz); g.add(leg);
  }
  g.position.set(x,y,z); state.officeGroup.add(g);
}

function createBookshelf(state, x, y, z) {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({color:0x5c3a1e, roughness:0.7});
  const darkWood = new THREE.MeshStandardMaterial({color:0x4a2c0a, roughness:0.8});
  
  // 书架主体
  const sides = new THREE.Group();
  
  // 侧板
  const leftSide = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.8, 0.45), wood);
  leftSide.position.set(-0.96, 1.4, 0);
  sides.add(leftSide);
  
  const rightSide = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.8, 0.45), wood);
  rightSide.position.set(0.96, 1.4, 0);
  sides.add(rightSide);
  
  // 背板
  const back = new THREE.Mesh(new THREE.BoxGeometry(2, 2.8, 0.02), darkWood);
  back.position.set(0, 1.4, -0.22);
  sides.add(back);
  
  g.add(sides);
  
  // 隔板（4层）
  for(let i=0;i<4;i++){
    const shelfBoard = new THREE.Mesh(new THREE.BoxGeometry(1.92,0.04,0.4), darkWood);
    shelfBoard.position.set(0, 0.3+i*0.7, 0);
    g.add(shelfBoard);
  }
  
  // 顶部装饰线
  const topMolding = new THREE.Mesh(new THREE.BoxGeometry(2.04, 0.06, 0.06), 
    new THREE.MeshStandardMaterial({color:0x6b4226}));
  topMolding.position.set(0, 2.77, 0.18);
  g.add(topMolding);
  
  // 书籍 - 更多样化，包括不同方向和大小
  const bookColors = [
    0x8b0000, 0x006400, 0x00008b, 0x8b8b00, 0x4b0082, 0x8b4513, 
    0xa52a2a, 0x2f4f4f, 0x696969, 0x800000, 0x008b8b
  ];
  
  for(let row=0;row<4;row++){
    let bx = -0.9;
    let layerHeight = 0.35 + row * 0.7;
    
    // 每层随机数量，但不超过7本
    const bookCount = 5 + Math.floor(Math.random() * 3);
    
    for(let b=0; b<bookCount; b++){
      const bw = 0.04 + Math.random() * 0.1;
      const bh = 0.25 + Math.random() * 0.2;
      const bd = 0.25 + Math.random() * 0.1;
      
      const bookMat = new THREE.MeshStandardMaterial({ 
        color: bookColors[Math.floor(Math.random() * bookColors.length)],
        roughness: 0.8
      });
      
      const book = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), bookMat);
      
      // 随机堆叠和旋转
      const rotY = Math.random() * 0.2 - 0.1;
      const posY = layerHeight + bh/2 + (Math.random() - 0.5) * 0.05;
      
      book.position.set(bx + bw/2, posY, (Math.random() - 0.5) * 0.1);
      book.rotation.y = rotY;
      
      g.add(book);
      bx += bw + 0.01;
      
      if(bx > 0.9) break;
    }
  }
  
  // 一个小摆件放在顶层
  const ornament = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), 
    new THREE.MeshStandardMaterial({color:0xd4af37, metalness:0.6, roughness:0.3}));
  ornament.position.set(0.7, 2.0, 0.1);
  g.add(ornament);
  
  g.position.set(x,y,z);
  state.officeGroup.add(g);
}

function createCouch(state, x, y, z) {
  const g = new THREE.Group();
  const fabric = new THREE.MeshStandardMaterial({color:0x6b4423, roughness:0.9});
  
  const seat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.3, 0.9), fabric);
  seat.position.set(0, 0.35, 0);
  g.add(seat);
  
  const back = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 0.15), fabric);
  back.position.set(0, 0.7, -0.38);
  g.add(back);
  
  [-1.15,1.15].forEach(dx => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.4, 0.9), fabric);
    arm.position.set(dx, 0.5, 0);
    g.add(arm);
  });
  
  [-0.4,0.4].forEach(dx => {
    const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.4,0.08), new THREE.MeshStandardMaterial({color:0xcc8844}));
    cushion.position.set(dx, 0.65, -0.32);
    g.add(cushion);
  });
  
  g.position.set(x,y,z);
  g.rotation.y = -Math.PI/2;
  state.officeGroup.add(g);
}

function createCoffeeTable(state, x, y, z) {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({color:0x5c3a1e, roughness:0.6});
  const glassMat = new THREE.MeshStandardMaterial({ 
    color: 0xadd8e6, 
    transparent: true, 
    opacity: 0.3,
    roughness: 0.1,
    metalness: 0.1
  });
  
  // 桌面
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.04, 0.5), wood);
  top.position.y = 0.4;
  top.receiveShadow = true;
  g.add(top);
  
  // 桌面下的玻璃层
  const glassLayer = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.01, 0.4), glassMat);
  glassLayer.position.set(0, 0.2, 0);
  g.add(glassLayer);
  
  // 桌腿
  for(const dx of [-0.3, 0.3]) {
    for(const dz of [-0.18, 0.18]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.38,6), wood);
      leg.position.set(dx, 0.19, dz);
      g.add(leg);
    }
  }
  
  // 杂志
  const magazineColors = [0x4466aa, 0xaa4444, 0x44aa44];
  const magazine = new THREE.Mesh(new THREE.BoxGeometry(0.25,0.01,0.18), 
    new THREE.MeshStandardMaterial({color:magazineColors[0]}));
  magazine.position.set(-0.15, 0.43, 0.05);
  magazine.rotation.x = 0.1;
  g.add(magazine);
  
  // 第二本杂志（稍微错开）
  const magazine2 = new THREE.Mesh(new THREE.BoxGeometry(0.22,0.008,0.16), 
    new THREE.MeshStandardMaterial({color:magazineColors[1]}));
  magazine2.position.set(-0.08, 0.44, 0.08);
  magazine2.rotation.x = 0.15;
  magazine2.rotation.z = 0.1;
  g.add(magazine2);
  
  // 遥控器
  const remote = new THREE.Mesh(new THREE.BoxGeometry(0.06,0.02,0.18), 
    new THREE.MeshStandardMaterial({color:0x333333}));
  remote.position.set(0.2, 0.42, -0.1);
  remote.rotation.z = 0.2;
  g.add(remote);
  
  // 小装饰品
  const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.02,0.08,6),
    new THREE.MeshStandardMaterial({color:0x8b4513, roughness:0.8}));
  vase.position.set(0.25, 0.44, 0.1);
  g.add(vase);
  
  g.position.set(x,y,z);
  state.officeGroup.add(g);
}

function createPlant(state, x, y, z) {
  const g = new THREE.Group();
  
  // 花盆 - 陶土质感
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.3, 8), 
    new THREE.MeshStandardMaterial({ color: 0xb87333, roughness: 0.9 }));
  pot.position.y = 0.15;
  g.add(pot);
  
  // 盆沿
  const potRim = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 6, 16), 
    new THREE.MeshStandardMaterial({ color: 0x8b5a2b }));
  potRim.position.y = 0.3;
  g.add(potRim);
  
  // 土壤
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.05, 8),
    new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 1 }));
  soil.position.y = 0.05;
  g.add(soil);
  
  // 植物叶子 - 更多叶子，更自然的分布
  const leafColors = [0x228b22, 0x2e8b57, 0x3cb371, 0x006400, 0x1a7a1a];
  for (let i = 0; i < 10; i++) {
    const leafMat = new THREE.MeshStandardMaterial({ 
      color: leafColors[Math.floor(Math.random() * leafColors.length)],
      roughness: 0.6,
      metalness: 0.1
    });
    
    // 主茎
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.015, 0.4 + Math.random() * 0.3, 4),
      new THREE.MeshStandardMaterial({ color: 0x2e8b57 }));
    const angle = (i / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
    const radius = 0.08 + Math.random() * 0.08;
    stem.position.set(
      Math.cos(angle) * radius,
      0.35 + Math.random() * 0.3,
      Math.sin(angle) * radius
    );
    stem.rotation.x = (Math.random() - 0.5) * 0.3;
    stem.rotation.z = (Math.random() - 0.5) * 0.3;
    g.add(stem);
    
    // 叶子
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.1 + Math.random() * 0.08, 6, 6), leafMat);
    leaf.position.set(
      stem.position.x + Math.cos(angle) * (0.2 + Math.random() * 0.15),
      stem.position.y + 0.1,
      stem.position.z + Math.sin(angle) * (0.2 + Math.random() * 0.15)
    );
    leaf.scale.set(1, 0.5 + Math.random() * 0.5, 1);
    g.add(leaf);
  }
  
  g.position.set(x, y, z);
  state.officeGroup.add(g);
}

function createWallDecorations(state, roomW, roomD, roomH) {
  const frameMat = new THREE.MeshStandardMaterial({color:0xaa8844, roughness:0.5});
  
  // === 画作 ===
  const paintings = [
    { x: -2.5, w: 1.2, h: 0.8, c: 0x1a3a5f, name: 'sea' }, // 海景
    { x: 2, w: 0.8, h: 1.0, c: 0x4a3520, name: 'landscape' }, // 风景
    { x: -4.5, w: 0.6, h: 0.7, c: 0x2a4a2a, name: 'plant' } // 植物画
  ];
  
  paintings.forEach(p => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(p.w+0.06,p.h+0.06,0.03), frameMat);
    frame.position.set(p.x, 2.0, -roomD/2+0.02);
    state.officeGroup.add(frame);
    
    const painting = new THREE.Mesh(new THREE.PlaneGeometry(p.w,p.h), 
      new THREE.MeshStandardMaterial({color:p.c, roughness:0.9}));
    painting.position.set(p.x, 2.0, -roomD/2+0.03);
    state.officeGroup.add(painting);
  });
  
  // === 时钟 ===
  const clockFace = new THREE.Mesh(new THREE.CircleGeometry(0.25,24), 
    new THREE.MeshStandardMaterial({color:0xfffff0, roughness:0.3}));
  clockFace.position.set(0,2.5,-roomD/2+0.02);
  state.officeGroup.add(clockFace);
  
  // 时钟刻度
  for(let i=0; i<12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const mark = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.005),
      new THREE.MeshStandardMaterial({color:0x333333}));
    mark.position.set(
      Math.sin(angle) * 0.18,
      2.5,
      -roomD/2+0.025 + Math.cos(angle) * 0.18
    );
    mark.rotation.x = Math.PI/2;
    mark.rotation.z = angle + Math.PI/2;
    state.officeGroup.add(mark);
  }
  
  const clockFrame = new THREE.Mesh(new THREE.TorusGeometry(0.26,0.02,8,24), frameMat);
  clockFrame.position.set(0,2.5,-roomD/2+0.02);
  state.officeGroup.add(clockFrame);
  
  const clockHands = new THREE.Group();
  const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.12, 0.005), 
    new THREE.MeshStandardMaterial({color:0x333333}));
  hourHand.position.set(0, 0.06, 0);
  clockHands.add(hourHand);
  
  const minuteHand = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.18, 0.005), 
    new THREE.MeshStandardMaterial({color:0x333333}));
  minuteHand.position.set(0, 0.09, 0);
  clockHands.add(minuteHand);
  
  clockHands.position.set(0,2.5,-roomD/2+0.025);
  clockHands.rotation.z = Math.PI/4;
  state.officeGroup.add(clockHands);
  
  // === 门 ===
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.0,2.2,0.08), 
    new THREE.MeshStandardMaterial({color:0x5c3a1e, roughness:0.7}));
  door.position.set(-2,1.1,roomD/2-0.04);
  state.officeGroup.add(door);
  
  // 门把手
  const doorknob = new THREE.Mesh(new THREE.SphereGeometry(0.03,8,8), 
    new THREE.MeshStandardMaterial({color:0xccaa44,metalness:0.8, roughness:0.2}));
  doorknob.position.set(-1.6,1.1,roomD/2);
  state.officeGroup.add(doorknob);
  
  // 门板装饰
  const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.6, 0.03),
    new THREE.MeshStandardMaterial({color:0x4a2c0a}));
  doorPanel.position.set(-2, 1.1, roomD/2+0.02);
  state.officeGroup.add(doorPanel);
  
  // === 壁灯 ===
  [-1,1].forEach(dz => {
    // 灯座
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.08,0.15,8),
      new THREE.MeshStandardMaterial({color:0x2a2a2a}));
    base.position.set(-roomW/2+0.15, 2.1, dz*2);
    state.officeGroup.add(base);
    
    // 灯臂
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.3,4),
      new THREE.MeshStandardMaterial({color:0x2a2a2a}));
    arm.position.set(-roomW/2+0.15, 2.25, dz*2);
    arm.rotation.z = dz > 0 ? 0.4 : -0.4;
    state.officeGroup.add(arm);
    
    // 灯罩
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.12,0.1,8,1,true),
      new THREE.MeshStandardMaterial({color:0xdeb887, side:THREE.DoubleSide, roughness:0.8}));
    shade.position.set(-roomW/2+0.22, 2.35, dz*2);
    state.officeGroup.add(shade);
    
    const sconceLight = new THREE.PointLight(0xffddaa, 0.4, 4);
    sconceLight.position.set(-roomW/2+0.15, 2.28, dz*2);
    state.officeGroup.add(sconceLight);
  });
  
  // === 小摆件：书架上的地球仪 ===
  const globeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.05,12),
    new THREE.MeshStandardMaterial({color:0x4a3020}));
  globeBase.position.set(4.1, 1.45, -2.8);
  state.officeGroup.add(globeBase);
  
  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8),
    new THREE.MeshStandardMaterial({color:0x2244aa}));
  globe.position.set(4.1, 1.55, -2.8);
  state.officeGroup.add(globe);
}