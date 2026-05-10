var cloudStore = require("../../utils/cloudStore.js");
var adminCloud = require("../../utils/adminCloud.js");

Page({
  data: {
    phone: "",
    plan: null,
    loading: false,
    emptyHint: "",
  },

  onShow: function () {
    var phone = cloudStore.getResidentBindPhone();
    this.setData({ phone: phone || "" });
    if (phone) {
      this.loadPlan(phone);
    } else {
      this.setData({
        plan: null,
        emptyHint: "请先在「预约」页提交一次预约，或下方填写预约时使用的手机号。",
      });
    }
  },

  onPhoneInput: function (e) {
    this.setData({ phone: e.detail.value });
  },

  loadPlan: function (phone) {
    var that = this;
    var p = (phone || "").trim();
    if (!/^1\d{10}$/.test(p)) {
      wx.showToast({ title: "请输入11位手机号", icon: "none" });
      return;
    }
    this.setData({ loading: true, emptyHint: "" });
    adminCloud
      .getDietPlanByPhone(p)
      .then(function (doc) {
        if (doc) {
          that.setData({
            plan: doc,
            emptyHint: "",
          });
        } else {
          that.setData({
            plan: null,
            emptyHint: "暂无与您手机号关联的食疗方案（演示数据由管理后台推送）。",
          });
        }
      })
      .catch(function () {
        that.setData({
          plan: null,
          emptyHint: "云开发不可用或未创建集合 diet_plans。",
        });
      })
      .then(function () {
        that.setData({ loading: false });
      });
  },

  onQuery: function () {
    var p = (this.data.phone || "").trim();
    cloudStore.setResidentBindPhone(p);
    this.loadPlan(p);
  },
});
