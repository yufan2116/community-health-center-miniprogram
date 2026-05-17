// app.js
/**
 * 【当前为学生作业「本地演示版」】已关闭 wx.cloud.init，不依赖云开发即可运行。
 * 全部业务数据经 cloudStore.js / adminCloud.js 读写本地 Storage。
 * 后续开通云开发并接库时，可恢复下方初始化逻辑，并替换两数据层实现。
 */
var envCfg = require("./envList.js");
var cloudStore = require("./utils/cloudStore.js");

App({
  globalData: {
    env: "",
    useDynamicCurrentEnv: true,
    cloudInitialized: false,
    cloudInitTried: false,
    cloudInitScheduled: false,
    /** 从服务详情「立即预约」跳转时写入，预约页 onShow 消费后清空 */
    pendingAppointmentServiceType: "",
  },

  onLaunch: function () {
    var envId = "";
    if (envCfg.envList && envCfg.envList.length > 0 && envCfg.envList[0].envId) {
      envId = envCfg.envList[0].envId;
    }
    this.globalData.env = envId;
    this.globalData.useDynamicCurrentEnv = !envId;

    // 延后写入演示食疗，避免与首屏路由/webview 挂载竞态（Windows 模拟器偶发 routeDone / timeout）
    var runEnsure = function () {
      try {
        if (cloudStore.ensureDemoDietPlans) {
          cloudStore.ensureDemoDietPlans();
        }
      } catch (e) {}
    };
    if (typeof wx.nextTick === "function") {
      wx.nextTick(runEnsure);
    } else {
      setTimeout(runEnsure, 48);
    }

    // 本地演示版：不调用 wx.cloud.init，避免未开通云开发时报错。
    // if (wx.cloud) { this.scheduleCloudInitDeferred(); }
  },

  onShow: function () {
    // 本地演示版：跳过云初始化
  },

  scheduleCloudInitDeferred: function () {
    if (this.globalData.cloudInitScheduled || this.globalData.cloudInitTried) return;
    this.globalData.cloudInitScheduled = true;
    var app = this;
    setTimeout(function () {
      app.initCloudOnce();
    }, 480);
  },

  initCloudOnce: function () {
    if (!wx.cloud || this.globalData.cloudInitTried) return;
    this.globalData.cloudInitTried = true;
    var envId = this.globalData.env;
    try {
      wx.cloud.init({
        env: envId ? envId : wx.cloud.DYNAMIC_CURRENT_ENV,
        traceUser: false,
      });
      this.globalData.cloudInitialized = true;
    } catch (e) {
      console.warn("wx.cloud.init 异常", e);
    }
  },
});
