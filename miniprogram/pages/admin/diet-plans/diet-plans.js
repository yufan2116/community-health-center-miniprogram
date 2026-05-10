var adminAuth = require("../../../utils/adminAuth.js");
var adminCloud = require("../../../utils/adminCloud.js");

Page({
  data: {
    list: [],
    loading: true,
    phone: "",
    residentName: "",
    title: "",
    advice: "",
    linkedRecipe: "",
    adding: false,
  },

  onShow: function () {
    if (!adminAuth.isLoggedIn()) {
      wx.redirectTo({ url: "/pages/admin/login/login" });
      return;
    }
    this.load();
  },

  load: function () {
    var that = this;
    this.setData({ loading: true });
    adminCloud
      .listDietPlans()
      .then(function (res) {
        var rows = (res.data || []).slice();
        rows.sort(function (a, b) {
          return (b.createTime || 0) - (a.createTime || 0);
        });
        that.setData({ list: rows });
      })
      .catch(function () {
        that.setData({ list: [] });
      })
      .then(function () {
        that.setData({ loading: false });
      });
  },

  onPhone: function (e) {
    this.setData({ phone: e.detail.value });
  },
  onName: function (e) {
    this.setData({ residentName: e.detail.value });
  },
  onTitle: function (e) {
    this.setData({ title: e.detail.value });
  },
  onAdvice: function (e) {
    this.setData({ advice: e.detail.value });
  },
  onLinked: function (e) {
    this.setData({ linkedRecipe: e.detail.value });
  },

  add: function () {
    var that = this;
    var phone = (this.data.phone || "").trim();
    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: "请填写居民11位手机", icon: "none" });
      return;
    }
    var title = (this.data.title || "").trim();
    if (!title) {
      wx.showToast({ title: "请填写方案标题", icon: "none" });
      return;
    }
    this.setData({ adding: true });
    adminCloud
      .addDietPlan({
        phone: phone,
        residentName: (this.data.residentName || "").trim(),
        title: title,
        advice: (this.data.advice || "").trim(),
        linkedRecipe: (this.data.linkedRecipe || "").trim(),
      })
      .then(function () {
        wx.showToast({ title: "已推送", icon: "success" });
        that.setData({
          phone: "",
          residentName: "",
          title: "",
          advice: "",
          linkedRecipe: "",
        });
        that.load();
      })
      .catch(function () {
        wx.showToast({ title: "保存失败", icon: "none" });
      })
      .then(function () {
        that.setData({ adding: false });
      });
  },

  remove: function (e) {
    var id = e.currentTarget.dataset.id;
    if (!id) return;
    var that = this;
    wx.showModal({
      title: "删除方案",
      content: "确定删除该记录？",
      success: function (r) {
        if (!r.confirm) return;
        adminCloud
          .deleteDietPlan(id)
          .then(function () {
            wx.showToast({ title: "已删除", icon: "success" });
            that.load();
          })
          .catch(function () {
            wx.showToast({ title: "删除失败", icon: "none" });
          });
      },
    });
  },
});
