var adminAuth = require("../../../utils/adminAuth.js");
var adminCloud = require("../../../utils/adminCloud.js");

Page({
  data: {
    list: [],
    loading: true,
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
      .listEducationArticlesAdmin()
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

  add: function () {
    wx.navigateTo({ url: "/pages/admin/article-edit/article-edit" });
  },

  edit: function (e) {
    var id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({
      url:
        "/pages/admin/article-edit/article-edit?id=" + encodeURIComponent(id),
    });
  },
});
