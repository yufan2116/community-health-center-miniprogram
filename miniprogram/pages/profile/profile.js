Page({
  data: {
    cloudHint:
      "预约与反馈会优先提交至云数据库。若未开通云开发或请求失败，将自动使用本机存储演示。提交预约时的手机号会用于匹配食疗方案。",
  },

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

  goFeedback: function () {
    wx.navigateTo({ url: "/pages/profile/feedback" });
  },

  goDietPlan: function () {
    wx.navigateTo({ url: "/pages/profile/diet-plan" });
  },
});
