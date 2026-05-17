var serviceItems = require("../../utils/serviceItems.js");

Page({
  data: {
    service: null,
    pageState: "loading",
  },

  onLoad: function (options) {
    var key = options.key ? decodeURIComponent(options.key) : "";
    var svc = serviceItems.getByKey(key);
    var that = this;
    if (!svc) {
      that.setData({ service: null, pageState: "missing" });
      wx.showToast({ title: "服务不存在", icon: "none" });
      return;
    }
    that.setData({ service: svc, pageState: "ok" });
    var t = svc.name || "";
    var barTitle = t.length > 11 ? t.slice(0, 11) + "…" : t;
    wx.setNavigationBarTitle({ title: barTitle });
  },

  goPersonalArchive: function () {
    wx.navigateTo({ url: "/pages/profile/personal-archive" });
  },

  goAppointment: function () {
    var svc = this.data.service;
    if (!svc) return;
    var app = getApp();
    if (app && app.globalData) {
      app.globalData.pendingAppointmentServiceType = svc.name || "";
    }
    wx.switchTab({ url: "/pages/appointment/appointment" });
  },
});
