var adminAuth = require("../../../utils/adminAuth.js");
var adminCloud = require("../../../utils/adminCloud.js");

Page({
  data: {
    heroImagePath: "",
    uploading: false,
    clearing: false,
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
    adminCloud
      .getEducationPageStyle()
      .then(function (res) {
        var d = (res && res.data) || {};
        that.setData({
          heroImagePath: String(d.heroImagePath || "").trim(),
        });
      })
      .catch(function () {
        that.setData({ heroImagePath: "" });
        wx.showToast({ title: "数据加载失败", icon: "none" });
      });
  },

  pickImage: function () {
    var that = this;
    if (this.data.uploading) return;
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      success: function (res) {
        var files = res.tempFiles || [];
        if (!files.length) return;
        var temp = files[0].tempFilePath;
        that.setData({ uploading: true });
        wx.showLoading({ title: "保存中", mask: true });
        wx.getFileSystemManager().saveFile({
          tempFilePath: temp,
          success: function (s) {
            var saved = s.savedFilePath;
            adminCloud
              .setEducationPageHeroImage(saved)
              .then(function (res) {
                if (res && res.ok === false) {
                  wx.showToast({
                    title: res.message || "本地存储失败，请清理缓存后重试",
                    icon: "none",
                  });
                  return;
                }
                wx.showToast({ title: "已更新", icon: "success" });
                that.load();
              })
              .catch(function () {
                wx.showToast({ title: "写入失败", icon: "none" });
              })
              .then(function () {
                wx.hideLoading();
                that.setData({ uploading: false });
              });
          },
          fail: function () {
            wx.hideLoading();
            that.setData({ uploading: false });
            wx.showToast({ title: "图片保存失败", icon: "none" });
          },
        });
      },
      fail: function () {
        wx.showToast({ title: "已取消", icon: "none" });
      },
    });
  },

  clearImage: function () {
    var that = this;
    if (!this.data.heroImagePath || this.data.clearing) return;
    wx.showModal({
      title: "清除背景图",
      content: "居民端宣教页将恢复为默认顶栏样式。",
      success: function (r) {
        if (!r.confirm) return;
        that.setData({ clearing: true });
        wx.showLoading({ title: "处理中", mask: true });
        adminCloud
          .clearEducationPageHeroImage()
          .then(function (res) {
            if (res && res.ok === false) {
              wx.showToast({
                title: res.message || "本地存储失败，请清理缓存后重试",
                icon: "none",
              });
              return;
            }
            wx.showToast({ title: "已清除", icon: "success" });
            that.setData({ heroImagePath: "" });
          })
          .catch(function () {
            wx.showToast({ title: "清除失败", icon: "none" });
          })
          .then(function () {
            wx.hideLoading();
            that.setData({ clearing: false });
          });
      },
    });
  },
});
