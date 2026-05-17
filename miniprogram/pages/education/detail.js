var educationService = require("../../utils/educationService.js");
var educationArticlePresets = require("../../utils/educationArticlePresets.js");

Page({
  data: {
    article: null,
    bodyBlocks: [],
    pageState: "loading",
  },

  onLoad: function (options) {
    var id = options.id ? decodeURIComponent(options.id) : "";
    var that = this;
    if (!id) {
      that.setData({ pageState: "missing", article: null, bodyBlocks: [] });
      wx.showToast({ title: "文章不存在", icon: "none" });
      return;
    }
    that.setData({ pageState: "loading", article: null, bodyBlocks: [] });
    educationService
      .getArticleById(id)
      .then(function (found) {
        if (found) {
          that.setData({
            article: found,
            bodyBlocks: educationArticlePresets.parseBodyToBlocks(found.content || ""),
            pageState: "ok",
          });
          var t = found.title || "";
          var barTitle = t.length > 11 ? t.slice(0, 11) + "…" : t;
          wx.setNavigationBarTitle({ title: barTitle });
        } else {
          that.setData({ article: null, bodyBlocks: [], pageState: "missing" });
          wx.showToast({ title: "文章不存在", icon: "none" });
        }
      })
      .catch(function () {
        that.setData({ article: null, bodyBlocks: [], pageState: "error" });
        wx.showToast({ title: "内容加载失败", icon: "none" });
      });
  },
});
