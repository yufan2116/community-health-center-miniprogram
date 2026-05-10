var adminAuth = require("../../../utils/adminAuth.js");
var adminCloud = require("../../../utils/adminCloud.js");

Page({
  data: {
    _id: "",
    title: "",
    summary: "",
    content: "",
    date: "",
    published: false,
    saving: false,
  },

  onLoad: function (options) {
    if (!adminAuth.isLoggedIn()) {
      wx.redirectTo({ url: "/pages/admin/login/login" });
      return;
    }
    var id = options.id ? decodeURIComponent(options.id) : "";
    if (!id) {
      var today = new Date();
      var m = today.getMonth() + 1;
      var day = today.getDate();
      var d =
        today.getFullYear() +
        "-" +
        (m < 10 ? "0" : "") +
        m +
        "-" +
        (day < 10 ? "0" : "") +
        day;
      this.setData({ date: d });
      return;
    }
    var that = this;
    adminCloud
      .getEducationArticleById(id)
      .then(function (res) {
        var d = res.data;
        if (!d) {
          wx.showToast({ title: "记录不存在", icon: "none" });
          return;
        }
        that.setData({
          _id: id,
          title: d.title || "",
          summary: d.summary || "",
          content: d.content || "",
          date: d.date || "",
          published: !!d.published,
        });
      })
      .catch(function () {
        wx.showToast({ title: "加载失败", icon: "none" });
      });
  },

  onTitle: function (e) {
    this.setData({ title: e.detail.value });
  },
  onSummary: function (e) {
    this.setData({ summary: e.detail.value });
  },
  onContent: function (e) {
    this.setData({ content: e.detail.value });
  },
  onDatePick: function (e) {
    this.setData({ date: e.detail.value });
  },
  onPub: function (e) {
    this.setData({ published: e.detail.value });
  },

  save: function () {
    var that = this;
    if (!(this.data.title || "").trim()) {
      wx.showToast({ title: "请填写标题", icon: "none" });
      return;
    }
    this.setData({ saving: true });
    var doc = {
      _id: this.data._id || undefined,
      title: (this.data.title || "").trim(),
      summary: (this.data.summary || "").trim(),
      content: (this.data.content || "").trim(),
      date: (this.data.date || "").trim(),
      published: this.data.published,
    };
    adminCloud
      .saveEducationArticle(doc)
      .then(function () {
        wx.showToast({ title: "已保存", icon: "success" });
        setTimeout(function () {
          wx.navigateBack();
        }, 400);
      })
      .catch(function () {
        wx.showToast({ title: "保存失败", icon: "none" });
      })
      .then(function () {
        that.setData({ saving: false });
      });
  },

  remove: function () {
    var id = this.data._id;
    if (!id) return;
    var that = this;
    wx.showModal({
      title: "删除文章",
      content: "确定删除？居民端将不再展示。",
      success: function (r) {
        if (!r.confirm) return;
        adminCloud
          .deleteEducationArticle(id)
          .then(function () {
            wx.showToast({ title: "已删除", icon: "success" });
            setTimeout(function () {
              wx.navigateBack();
            }, 400);
          })
          .catch(function () {
            wx.showToast({ title: "删除失败", icon: "none" });
          });
      },
    });
  },
});
