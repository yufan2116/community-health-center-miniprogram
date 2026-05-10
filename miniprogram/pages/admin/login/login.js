var adminAuth = require("../../../utils/adminAuth.js");
var adminCloud = require("../../../utils/adminCloud.js");

Page({
  data: {
    username: "",
    password: "",
    loading: false,
  },

  onLoad: function () {
    if (adminAuth.isLoggedIn()) {
      wx.redirectTo({ url: "/pages/admin/dashboard/dashboard" });
    }
  },

  onUser: function (e) {
    this.setData({ username: e.detail.value });
  },

  onPass: function (e) {
    this.setData({ password: e.detail.value });
  },

  submit: function () {
    var u = (this.data.username || "").trim();
    var p = (this.data.password || "").trim();
    if (!u || !p) {
      wx.showToast({ title: "请输入账号和密码", icon: "none" });
      return;
    }
    var that = this;
    this.setData({ loading: true });
    adminCloud
      .verifyAdmin(u, p)
      .then(function (res) {
        if (res.data && res.data.length) {
          adminAuth.setSession(u);
          wx.showToast({ title: "登录成功", icon: "success" });
          setTimeout(function () {
            wx.redirectTo({ url: "/pages/admin/dashboard/dashboard" });
          }, 400);
        } else {
          wx.showToast({ title: "账号或密码错误", icon: "none" });
        }
      })
      .catch(function (err) {
        wx.showModal({
          title: "登录失败",
          content:
            (err && err.message) ||
            "请确认已开通云开发、已创建集合 admins，并写入演示账号（可用后台「初始化演示数据」）。",
          showCancel: false,
        });
      })
      .then(function () {
        that.setData({ loading: false });
      });
  },
});
