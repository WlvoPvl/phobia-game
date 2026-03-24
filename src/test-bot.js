// 测试机器人 - 简化版本
// 在浏览器控制台运行：await TestBot.run()

window.TestBot = {
  async run() {
    const results = [];

    const checks = {
      'Game Initialized': !!window.state,
      'Office Created': !!window.state?.officeGroup,
      'Book Exists': !!window.state?.bookMesh
    };

    results.push({
      test: 'Assets Loaded',
      passed: Object.values(checks).every(v => v),
      details: checks
    });

    try {
      await window.gameStart();
      results.push({ test: 'Game Start', passed: true });
    } catch (e) {
      results.push({ test: 'Game Start', passed: false, error: e.message });
    }

    return results;
  },

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};
