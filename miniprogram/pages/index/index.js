// pages/index/index.js — 首页
var homeNotices = require("../../utils/homeNotices.js");

Page({
  data: {
    centerName: "XX卫生服务中心",
    intro:
      "本中心为社区居民提供基本医疗与公共卫生服务，涵盖预防接种、儿童保健、慢性病管理、健康体检等。坚持预防为主、便民惠民，守护居民健康。（演示版文案）",
    notices: homeNotices.getListForHome(),
  },

  onShow: function () {},

  goTab: function (e) {
    var url = e.currentTarget.dataset.url;
    if (url) wx.switchTab({ url: url });
  },

  goPage: function (e) {
    var url = e.currentTarget.dataset.url;
    if (url) wx.navigateTo({ url: url });
  },

  openNotice: function (e) {
    var id = e.currentTarget.dataset.id;
    if (id == null || id === "") return;
    wx.navigateTo({ url: "/pages/index/notice-detail?id=" + id });
  },
});
