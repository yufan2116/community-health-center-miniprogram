// app.js
var envCfg = require("./envList.js");

App({
  onLaunch: function () {
    var envId = "";
    if (envCfg.envList && envCfg.envList.length > 0 && envCfg.envList[0].envId) {
      envId = envCfg.envList[0].envId;
    }

    this.globalData = {
      env: envId,
      useDynamicCurrentEnv: !envId,
    };

    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      try {
        wx.cloud.init({
          env: envId ? envId : wx.cloud.DYNAMIC_CURRENT_ENV,
          traceUser: false,
        });
      } catch (e) {
        console.warn("wx.cloud.init 异常，将使用本地存储兜底", e);
      }
    }
  },
});
