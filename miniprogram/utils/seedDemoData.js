/**
 * 演示数据种子入口
 *
 * 【当前为学生作业「本地演示版」】实际写入逻辑在 cloudStore.runSeed()，
 * 使用 Storage 键 local_*；后续接云开发时可改为调用云函数或云数据库初始化。
 */
var cloudStore = require("./cloudStore.js");

function runSeed() {
  return cloudStore.runSeed();
}

function clearLocalDemoStorage() {
  return cloudStore.clearLocalDemoStorage();
}

function runSeedForce() {
  return cloudStore.runSeedForce();
}

module.exports = {
  runSeed: runSeed,
  clearLocalDemoStorage: clearLocalDemoStorage,
  runSeedForce: runSeedForce,
};
