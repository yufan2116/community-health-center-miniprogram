var educationService = require("../../utils/educationService.js");

Page({
  data: {
    list: [],
    loading: true,
    heroBg: "",
  },

  onShow: function () {
    var that = this;
    this.setData({ loading: true });
    Promise.all([
      educationService.listPublishedForResident(),
      educationService.getEducationPageStyle(),
    ])
      .then(function (out) {
        var rows = out[0];
        var style = out[1] || {};
        that.setData({
          list: rows || [],
          heroBg: String(style.heroImagePath || "").trim(),
        });
      })
      .catch(function () {
        that.setData({ list: [], heroBg: "" });
        wx.showToast({ title: "数据加载失败", icon: "none" });
      })
      .then(function () {
        that.setData({ loading: false });
      });
  },

  openDetail: function (e) {
    var id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({
      url: "/pages/education/detail?id=" + encodeURIComponent(id),
    });
  },
});
