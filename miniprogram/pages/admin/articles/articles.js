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
      .listArticles()
      .then(function (res) {
        var rows = (res.data || []).slice();
        rows.sort(function (a, b) {
          return (b.createdAt || b.createTime || 0) - (a.createdAt || a.createTime || 0);
        });
        that.setData({ list: rows });
      })
      .catch(function () {
        that.setData({ list: [] });
        wx.showToast({ title: "数据加载失败", icon: "none" });
      })
      .then(function () {
        that.setData({ loading: false });
      });
  },

  add: function () {
    wx.navigateTo({ url: "/pages/admin/article-edit/article-edit" });
  },

  openTheme: function () {
    wx.navigateTo({ url: "/pages/admin/education-theme/education-theme" });
  },

  edit: function (e) {
    var id = e.currentTarget.dataset.id;
    if (id == null || id === "") {
      wx.showToast({ title: "无法打开编辑", icon: "none" });
      return;
    }
    wx.navigateTo({
      url:
        "/pages/admin/article-edit/article-edit?id=" + encodeURIComponent(String(id)),
    });
  },

  findArticle: function (id) {
    var list = this.data.list || [];
    for (var i = 0; i < list.length; i++) {
      if (String(list[i]._id || list[i].id || "") === String(id)) return list[i];
    }
    return null;
  },

  togglePublish: function (e) {
    var id = e.currentTarget.dataset.id;
    if (!id) return;
    var item = this.findArticle(id);
    if (!item) return;
    var that = this;
    var next = !item.published;
    wx.showLoading({ title: "保存中", mask: true });
    adminCloud
      .publishArticle(id, next)
      .then(function (res) {
        if (res && res.ok === false) {
          wx.showToast({
            title: res.message || "本地存储失败，请清理缓存后重试",
            icon: "none",
          });
          return;
        }
        wx.showToast({
          title: next ? "已发布" : "已撤下",
          icon: "success",
        });
        that.load();
      })
      .catch(function () {
        wx.showToast({ title: "操作失败", icon: "none" });
      })
      .then(function () {
        wx.hideLoading();
      });
  },

  removeArticle: function (e) {
    var id = e.currentTarget.dataset.id;
    if (!id) return;
    var that = this;
    wx.showModal({
      title: "删除文章",
      content: "删除后不可恢复，居民端将不再展示该文。",
      success: function (r) {
        if (!r.confirm) return;
        wx.showLoading({ title: "删除中", mask: true });
        adminCloud
          .deleteArticle(id)
          .then(function (res) {
            if (res && res.ok === false) {
              wx.showToast({
                title: res.message || "本地存储失败，请清理缓存后重试",
                icon: "none",
              });
              return;
            }
            wx.showToast({ title: "已删除", icon: "success" });
            that.load();
          })
          .catch(function () {
            wx.showToast({ title: "删除失败", icon: "none" });
          })
          .then(function () {
            wx.hideLoading();
          });
      },
    });
  },
});
