var homeNotices = require("../../utils/homeNotices.js");

Page({
  data: {
    notice: null,
    pageState: "",
  },

  onLoad: function (options) {
    var id = options.id;
    var notice = homeNotices.getById(id);
    var that = this;
    if (!notice) {
      that.setData({ notice: null, pageState: "missing" });
      wx.showToast({ title: "公告不存在", icon: "none" });
      return;
    }
    that.setData({ notice: notice, pageState: "ok" });
    var t = notice.title || "";
    var barTitle = t.length > 11 ? t.slice(0, 11) + "…" : t;
    wx.setNavigationBarTitle({ title: barTitle });
  },
});
