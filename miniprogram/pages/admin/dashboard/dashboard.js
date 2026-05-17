var adminAuth = require("../../../utils/adminAuth.js");
var seedDemoData = require("../../../utils/seedDemoData.js");

Page({
  data: {
    user: "",
    seeding: false,
    clearing: false,
    reseeding: false,
  },

  onLoad: function () {
    if (!adminAuth.requireLogin()) return;
    var s = adminAuth.getSession();
    this.setData({ user: (s && s.username) || "" });
  },

  go: function (e) {
    var url = e.currentTarget.dataset.url;
    if (url) wx.navigateTo({ url: url });
  },

  logout: function () {
    adminAuth.clearSession();
    wx.redirectTo({ url: "/pages/admin/login/login" });
  },

  seed: function () {
    var that = this;
    wx.showModal({
      title: "初始化演示数据",
      content:
        "若本地尚无数据，将向 Storage 键 local_* 写入预约、科室、医生、公卫演示健康档案、居民自填健康档案、宣教文章、菜谱、食疗方案等演示记录（已有数据的类型会跳过）。是否继续？",
      success: function (r) {
        if (!r.confirm) return;
        that.setData({ seeding: true });
        seedDemoData
          .runSeed()
          .then(function (r) {
            if (!r || r.ok === false) {
              wx.showToast({
                title: (r && r.message) || "本地存储失败，请清理缓存后重试",
                icon: "none",
              });
              return;
            }
            var msg =
              (r.filled && r.filled.length
                ? "已写入：" + r.filled.join("、")
                : "各项已有数据，未写入新记录") +
              "。请刷新各管理页查看。管理员默认 admin / admin123";
            wx.showModal({
              title: "完成",
              content: msg,
              showCancel: false,
            });
          })
          .catch(function (err) {
            wx.showToast({
              title: (err && err.message) || "初始化失败",
              icon: "none",
            });
          })
          .then(function () {
            that.setData({ seeding: false });
          });
      },
    });
  },

  clearLocal: function () {
    var that = this;
    wx.showModal({
      title: "清空本地数据",
      content:
        "将删除本演示项目使用的业务数据（预约、反馈、宣教文章、公卫/自填档案、菜谱、食疗、科室医生、宣教顶栏样式等 local_* 键），并清除居民绑定手机号。不会退出当前管理员登录。是否继续？",
      confirmText: "清空",
      confirmColor: "#b45309",
      success: function (r) {
        if (!r.confirm) return;
        that.setData({ clearing: true });
        seedDemoData
          .clearLocalDemoStorage()
          .then(function (res) {
            if (!res || res.ok === false) {
              wx.showToast({
                title: (res && res.message) || "操作失败",
                icon: "none",
              });
              return;
            }
            wx.showToast({ title: "已清空", icon: "success" });
          })
          .catch(function () {
            wx.showToast({ title: "操作失败", icon: "none" });
          })
          .then(function () {
            that.setData({ clearing: false });
          });
      },
    });
  },

  reseedDemo: function () {
    var that = this;
    wx.showModal({
      title: "重新初始化演示数据",
      content:
        "将先清空上述业务本地数据，再重新写入全套演示记录（等同全新演示环境）。不会退出管理员登录。是否继续？",
      confirmText: "重新初始化",
      confirmColor: "#b45309",
      success: function (r) {
        if (!r.confirm) return;
        that.setData({ reseeding: true });
        seedDemoData
          .runSeedForce()
          .then(function (res) {
            if (!res || res.ok === false) {
              wx.showToast({
                title: (res && res.message) || "本地存储失败，请清理缓存后重试",
                icon: "none",
              });
              return;
            }
            var msg =
              "已重新写入：" +
              (res.filled && res.filled.length
                ? res.filled.join("、")
                : "（无）") +
              "。请刷新各管理页与居民端查看。";
            wx.showModal({
              title: "完成",
              content: msg,
              showCancel: false,
            });
          })
          .catch(function (err) {
            wx.showToast({
              title: (err && err.message) || "初始化失败",
              icon: "none",
            });
          })
          .then(function () {
            that.setData({ reseeding: false });
          });
      },
    });
  },
});
