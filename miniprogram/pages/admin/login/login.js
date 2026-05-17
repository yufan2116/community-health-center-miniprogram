var adminAuth = require("../../../utils/adminAuth.js");
var cloudStore = require("../../../utils/cloudStore.js");

var FIXED_USER = "admin";
var FIXED_PASS = "admin123";

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

    if (u !== FIXED_USER || p !== FIXED_PASS) {
      wx.showToast({ title: "账号或密码错误", icon: "none" });
      return;
    }

    var that = this;
    this.setData({ loading: true });

    var wr = adminAuth.setLoggedIn(true);
    if (!wr || wr.ok === false) {
      wx.showToast({
        title: cloudStore.LOCAL_STORAGE_FAIL_MSG,
        icon: "none",
      });
      that.setData({ loading: false });
      return;
    }
    wx.showToast({ title: "登录成功", icon: "success" });
    setTimeout(function () {
      that.setData({ loading: false });
      wx.redirectTo({ url: "/pages/admin/dashboard/dashboard" });
    }, 350);

  },
});
