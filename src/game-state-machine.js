// 游戏状态机 - 更好的状态管理
export class GameStateMachine {
  constructor() {
    this.states = {};
    this.currentState = null;
    this.previousState = null;
    this.stateData = {};
  }
  
  addState(name, enter, exit, update) {
    this.states[name] = { enter, exit, update };
  }
  
  setState(name, data = {}) {
    if (!this.states[name]) {
      console.warn(`[StateMachine] State "${name}" not found`);
      return;
    }
    
    if (this.currentState && this.states[this.currentState].exit) {
      this.states[this.currentState].exit(this.stateData);
    }
    
    this.previousState = this.currentState;
    this.currentState = name;
    this.stateData = data;
    
    if (this.states[name].enter) {
      this.states[name].enter(this.stateData);
    }
    
    console.log(`[StateMachine] ${this.previousState || 'none'} -> ${name}`);
  }
  
  update(dt) {
    if (this.currentState && this.states[this.currentState].update) {
      this.states[this.currentState].update(dt, this.stateData);
    }
  }
  
  getState() {
    return this.currentState;
  }
  
  isState(name) {
    return this.currentState === name;
  }
  
  goBack() {
    if (this.previousState) {
      this.setState(this.previousState);
    }
  }
}

export function createDefaultStates(stateMachine, state) {
  stateMachine.addState('start', 
    () => { console.log('Entered start'); },
    () => { console.log('Exited start'); },
    (dt) => { }
  );
  
  stateMachine.addState('office',
    () => {
      if (!state.officeGroup && typeof office !== 'undefined') {
        office.createOffice(state);
      }
      state.phase = 'office';
    },
    () => { console.log('Exited office'); },
    (dt, data) => {
      // Office update logic
    }
  );
  
  stateMachine.addState('book',
    () => {
      state.phase = 'book';
      document.exitPointerLock();
    },
    () => { console.log('Exited book'); },
    (dt) => { }
  );
  
  stateMachine.addState('level',
    (data) => {
      state.phase = 'level';
      state.levelIndex = data.levelIndex;
      state.levelActive = true;
      state.sanity = 100;
    },
    () => { 
      state.levelActive = false;
    },
    (dt) => {
      // Level update handled by level system
    }
  );
  
  stateMachine.addState('end',
    (data) => {
      state.phase = 'end';
      state.levelComplete = data.success || false;
    },
    () => { console.log('Exited end'); },
    (dt) => { }
  );
  
  stateMachine.addState('settings',
    () => {
      document.exitPointerLock();
    },
    () => { },
    (dt) => { }
  );
}

export default GameStateMachine;