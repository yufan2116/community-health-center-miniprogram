var educationService = require("../../utils/educationService.js");

Page({
  data: {
    list: [],
    loading: true,
  },

  onShow: function () {
    var that = this;
    this.setData({ loading: true });
    educationService
      .listPublishedForResident()
      .then(function (rows) {
        that.setData({ list: rows || [] });
      })
      .catch(function () {
        that.setData({ list: [] });
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
