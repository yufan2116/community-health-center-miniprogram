var cloudStore = require("../../utils/cloudStore.js");
var phoneValidate = require("../../utils/phoneValidate.js");

Page({
  data: {
    cloudHint:
      "当前为学生作业本地演示版：手机号作为居民身份（Storage 键 local_resident_bind_phone）。「我的预约」「食疗方案」均随绑定切换；接云开发后可改为 openid。",
    boundDisplay: "未绑定手机号",
    showSwitchDialog: false,
    switchInput: "",
  },

  onShow: function () {
    this.refreshIdentity();
  },

  refreshIdentity: function () {
    var p = cloudStore.getCurrentResidentPhone();
    this.setData({
      boundDisplay: p ? p : "未绑定手机号",
    });
  },

  openSwitchDialog: function () {
    var cur = cloudStore.getCurrentResidentPhone();
    this.setData({
      showSwitchDialog: true,
      switchInput: cur || "",
    });
  },

  onSwitchInput: function (e) {
    var v = (e.detail.value || "").replace(/\D/g, "").slice(0, 11);
    this.setData({ switchInput: v });
  },

  cancelSwitch: function () {
    this.setData({ showSwitchDialog: false, switchInput: "" });
  },

  confirmSwitch: function () {
    var raw = (this.data.switchInput || "").trim();
    var pv = phoneValidate.validatePhoneSubmit(raw);
    if (!pv.ok) {
      wx.showToast({ title: pv.message, icon: "none" });
      return;
    }
    var wr = cloudStore.setCurrentResidentPhone(pv.normalized);
    if (!wr.ok) {
      wx.showToast({
        title: cloudStore.LOCAL_STORAGE_FAIL_MSG,
        icon: "none",
      });
      return;
    }
    wx.showToast({ title: "身份已切换", icon: "success" });
    this.setData({ showSwitchDialog: false, switchInput: "" });
    this.refreshIdentity();
  },

  stopSwitchBubble: function () {},

  onAvatarTap: function () {
    var that = this;
    if (!this._adminTapCount) this._adminTapCount = 0;
    this._adminTapCount += 1;
    if (this._adminTapTimer) clearTimeout(this._adminTapTimer);
    if (this._adminTapCount >= 5) {
      this._adminTapCount = 0;
      wx.navigateTo({ url: "/pages/admin/login/login" });
      return;
    }
    this._adminTapTimer = setTimeout(function () {
      that._adminTapCount = 0;
    }, 2200);
  },

  goAppointments: function () {
    wx.navigateTo({ url: "/pages/profile/appointments" });
  },

  goPersonalArchive: function () {
    wx.navigateTo({ url: "/pages/profile/personal-archive" });
  },

  goFeedback: function () {
    wx.navigateTo({ url: "/pages/profile/feedback" });
  },

  goDietPlan: function () {
    wx.navigateTo({ url: "/pages/profile/diet-plan" });
  },
});
