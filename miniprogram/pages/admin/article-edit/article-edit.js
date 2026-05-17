var adminAuth = require("../../../utils/adminAuth.js");
var adminCloud = require("../../../utils/adminCloud.js");
var educationArticleImages = require("../../../utils/educationArticleImages.js");
var educationArticlePresets = require("../../../utils/educationArticlePresets.js");

Page({
  data: {
    _id: "",
    title: "",
    summary: "",
    content: "",
    date: "",
    published: false,
    coverImage: "",
    saving: false,
    pickingCover: false,
    presetImageList: [],
    presetLabels: [],
    presetPickIndex: 0,
    presetPickLabel: "",
    loadMissing: false,
    loadFailed: false,
  },

  onLoad: function (options) {
    if (!adminAuth.isLoggedIn()) {
      wx.redirectTo({ url: "/pages/admin/login/login" });
      return;
    }
    var plist = educationArticlePresets.list();
    this.setData({
      presetImageList: plist,
      presetLabels: educationArticlePresets.labels(),
      presetPickIndex: 0,
      presetPickLabel: plist.length ? plist[0].label : "",
    });
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
      this.setData({ date: d, loadMissing: false, loadFailed: false });
      return;
    }
    var that = this;
    adminCloud
      .listArticles()
      .then(function (res) {
        var rows = res.data || [];
        var d = null;
        for (var i = 0; i < rows.length; i++) {
          var rid = rows[i]._id || rows[i].id;
          if (String(rid) === String(id)) {
            d = rows[i];
            break;
          }
        }
        if (!d) {
          that.setData({ loadMissing: true });
          wx.showToast({ title: "文章不存在", icon: "none" });
          return;
        }
        that.setData({
          loadMissing: false,
          loadFailed: false,
          _id: id,
          title: d.title || "",
          summary: d.summary || "",
          content: d.content || "",
          date: d.date || "",
          published: !!d.published,
          coverImage: String(d.coverImage || "").trim(),
        });
      })
      .catch(function () {
        that.setData({ loadMissing: false, loadFailed: true });
        wx.showToast({ title: "内容加载失败", icon: "none" });
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

  pickCover: function () {
    var that = this;
    if (this.data.pickingCover) return;
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      success: function (res) {
        var files = res.tempFiles || [];
        if (!files.length) return;
        var temp = files[0].tempFilePath;
        that.setData({ pickingCover: true });
        wx.showLoading({ title: "保存配图", mask: true });
        educationArticleImages
          .savePickedImageFromTemp(temp)
          .then(function (savedPath) {
            that.setData({ coverImage: String(savedPath || "").trim() });
            wx.showToast({ title: "已添加配图", icon: "success" });
          })
          .catch(function () {
            wx.showToast({ title: "配图保存失败", icon: "none" });
          })
          .then(function () {
            wx.hideLoading();
            that.setData({ pickingCover: false });
          });
      },
    });
  },

  clearCover: function () {
    this.setData({ coverImage: "" });
  },

  onPresetPickChange: function (e) {
    var i = Number(e.detail.value);
    var list = this.data.presetImageList || [];
    var item = list[i];
    this.setData({
      presetPickIndex: isNaN(i) ? 0 : i,
      presetPickLabel: item ? item.label : "",
    });
  },

  insertPresetImage: function () {
    var list = this.data.presetImageList || [];
    var i = this.data.presetPickIndex || 0;
    var item = list[i];
    if (!item) {
      wx.showToast({ title: "无可用预设图", icon: "none" });
      return;
    }
    var marker = educationArticlePresets.markerForPath(item.path);
    this.setData({ content: (this.data.content || "") + marker });
    wx.showToast({ title: "已插入正文末尾", icon: "none" });
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
      coverImage: String(this.data.coverImage || "").trim(),
    };
    adminCloud
      .saveArticle(doc)
      .then(function (res) {
        if (res && res.ok === false) {
          wx.showToast({
            title: res.message || "本地存储失败，请清理缓存后重试",
            icon: "none",
          });
          return;
        }
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
