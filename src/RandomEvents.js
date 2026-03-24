// 随机事件系统 - 增加游戏的不可预测性，提升直播效果
import * as THREE from 'three';

export class RandomEvents {
  constructor() {
    this.events = [];
    this.lastEventTime = 0;
    this.minEventInterval = 8;
    this.maxEventInterval = 20;
    this.eventCooldowns = {};
    this.enabled = true;
  }

  init(state) {
    this.state = state;
    this.scheduleNextEvent();
    console.log('[RandomEvents] 随机事件系统已启用');
  }

  // 注册事件
  registerEvent(event) {
    this.events.push(event);
  }

  // 调度下一个事件
  scheduleNextEvent() {
    const delay = this.minEventInterval + Math.random() * (this.maxEventInterval - this.minEventInterval);
    setTimeout(() => {
      if (this.enabled && this.state && this.state.levelActive) {
        this.triggerRandomEvent();
      }
      this.scheduleNextEvent();
    }, delay * 1000);
  }

  // 触发随机事件
  triggerRandomEvent() {
    if (!this.state || !this.state.levelActive) return;
    if (this.events.length === 0) return;

    // 过滤掉冷却中的事件
    const availableEvents = this.events.filter(e => {
      const cooldown = this.eventCooldowns[e.name] || 0;
      return Date.now() > cooldown;
    });

    if (availableEvents.length === 0) return;

    // 随机选择事件
    const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    
    console.log(`[RandomEvents] 触发事件: ${event.name}`);
    
    try {
      event.trigger(this.state);
    } catch (e) {
      console.warn(`[RandomEvents] 事件执行失败: ${e.message}`);
    }

    // 设置冷却
    if (event.cooldown) {
      this.eventCooldowns[event.name] = Date.now() + event.cooldown * 1000;
    }
  }

  // 创建预定义事件
  static createEvents(enhancer, terrorAudio, audioManager) {
    return [
      // 突然的脚步声
      {
        name: 'footsteps',
        cooldown: 15,
        trigger: (state) => {
          if (audioManager) {
            for (let i = 0; i < 3; i++) {
              setTimeout(() => {
                if (audioManager.enabled) audioManager.playFootstep();
              }, i * 400);
            }
          }
        }
      },

      // 灯光闪烁
      {
        name: 'light_flicker',
        cooldown: 12,
        trigger: (state) => {
          if (state.levelLights && state.levelLights.length > 0) {
            const original = state.levelLights.map(l => l.intensity);
            let flickers = 0;
            const interval = setInterval(() => {
              state.levelLights.forEach(l => l.intensity = Math.random() < 0.5 ? 0 : original[0] * 0.2);
              flickers++;
              if (flickers > 8) {
                clearInterval(interval);
                state.levelLights.forEach((l, i) => l.intensity = original[i]);
              }
            }, 80);
          }
        }
      },

      // 诡异的低语
      {
        name: 'whisper',
        cooldown: 25,
        trigger: (state) => {
          if (terrorAudio) {
            terrorAudio.playWhisper(3);
          }
        }
      },

      // 画面震动
      {
        name: 'screen_shake',
        cooldown: 10,
        trigger: (state) => {
          if (state.camera && enhancer) {
            enhancer.flickerLights(state, 600);
          }
        }
      },

      // 血液边缘闪现
      {
        name: 'blood_flash',
        cooldown: 15,
        trigger: (state) => {
          const bloodEdge = document.getElementById('blood-edge');
          if (bloodEdge) {
            bloodEdge.style.boxShadow = 'inset 0 0 100px rgba(139, 0, 0, 0.6)';
            setTimeout(() => {
              bloodEdge.style.boxShadow = 'inset 0 0 30px rgba(139, 0, 0, 0.2)';
            }, 500);
          }
        }
      },

      // 诡异文字
      {
        name: 'terror_text',
        cooldown: 20,
        trigger: (state) => {
          if (enhancer) {
            const texts = [
              '它们在看着你...',
              '不要回头',
              '快逃...',
              '逃不掉的',
              '听到了吗？',
              '别出声...',
              '它来了',
              '救救我...'
            ];
            enhancer.showTerrorText(texts[Math.floor(Math.random() * texts.length)]);
          }
        }
      },

      // 突然的安静（然后爆发）
      {
        name: 'quiet_then_scare',
        cooldown: 30,
        trigger: (state) => {
          // 先降低所有灯光
          if (state.levelLights) {
            const original = state.levelLights.map(l => l.intensity);
            state.levelLights.forEach(l => l.intensity *= 0.1);
            
            setTimeout(() => {
              // 然后突然全部恢复 + 闪光
              state.levelLights.forEach((l, i) => l.intensity = original[i] * 2);
              
              const flash = document.getElementById('scare-flash');
              if (flash) {
                flash.style.background = '#ff0000';
                flash.style.display = 'block';
                flash.style.opacity = '0.5';
                setTimeout(() => {
                  flash.style.opacity = '0';
                  setTimeout(() => { flash.style.display = 'none'; }, 200);
                }, 150);
              }
              
              if (terrorAudio) {
                terrorAudio.playNoise(0.5, 0.3);
              }
            }, 2000);
          }
        }
      },

      // 背景音乐突变
      {
        name: 'music_dropoct',
        cooldown: 18,
        trigger: (state) => {
          if (state.levelLights) {
            const original = state.levelLights.map(l => l.intensity);
            
            // 声音变小
            state.levelLights.forEach(l => l.intensity *= 0.05);
            
            // 播放低频
            if (terrorAudio) {
              terrorAudio.playDrone(30, 3, 0.1);
            }
            
            setTimeout(() => {
              state.levelLights.forEach((l, i) => l.intensity = original[i]);
            }, 3000);
          }
        }
      },

      // 远处传来声音
      {
        name: 'distant_sound',
        cooldown: 22,
        trigger: (state) => {
          const sounds = [
            (() => {
              if (terrorAudio) terrorAudio.playDeepVoice();
            }),
            (() => {
              if (terrorAudio) terrorAudio.playCreepyLaugh();
            }),
            (() => {
              if (audioManager) audioManager.playCreakyDoor();
            })
          ];
          sounds[Math.floor(Math.random() * sounds.length)]();
        }
      },

      // 理智突然下降
      {
        name: 'sanity_drain',
        cooldown: 20,
        trigger: (state) => {
          state.sanity = Math.max(0, state.sanity - 10);
          
          // 视觉反馈
          const bloodEdge = document.getElementById('blood-edge');
          if (bloodEdge) {
            bloodEdge.style.boxShadow = 'inset 0 0 80px rgba(139, 0, 0, 0.5)';
            setTimeout(() => {
              bloodEdge.style.boxShadow = 'inset 0 0 30px rgba(139, 0, 0, 0.15)';
            }, 800);
          }
        }
      }
    ];
  }

  // 禁用所有事件
  disable() {
    this.enabled = false;
  }

  // 启用所有事件
  enable() {
    this.enabled = true;
  }
}

export const randomEvents = new RandomEvents();
export default RandomEvents;
