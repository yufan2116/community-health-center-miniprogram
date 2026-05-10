var adminAuth = require("../../../utils/adminAuth.js");
var seedDemoData = require("../../../utils/seedDemoData.js");

Page({
  data: {
    user: "",
    seeding: false,
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
        "将向空集合写入 admins、health_records、education_articles、recipes 等示例记录（已有数据的集合会跳过）。是否继续？",
      success: function (r) {
        if (!r.confirm) return;
        that.setData({ seeding: true });
        seedDemoData
          .runSeed()
          .then(function () {
            wx.showModal({
              title: "完成",
              content: "请刷新各管理页查看。管理员默认 admin / admin123",
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
});
