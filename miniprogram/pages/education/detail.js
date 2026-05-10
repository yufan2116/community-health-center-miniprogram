var educationService = require("../../utils/educationService.js");

Page({
  data: {
    article: null,
  },

  onLoad: function (options) {
    var id = options.id ? decodeURIComponent(options.id) : "";
    var that = this;
    if (!id) {
      wx.showToast({ title: "文章不存在", icon: "none" });
      return;
    }
    educationService.getArticleById(id).then(function (found) {
      if (found) {
        that.setData({ article: found });
        var t = found.title || "";
        var barTitle = t.length > 11 ? t.slice(0, 11) + "…" : t;
        wx.setNavigationBarTitle({ title: barTitle });
      } else {
        wx.showToast({ title: "文章不存在", icon: "none" });
      }
    });
  },
});
