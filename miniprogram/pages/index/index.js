// pages/index/index.js — 首页
Page({
  data: {
    centerName: "南宁市青秀区南湖凤岭北社区卫生服务中心",
    intro:
      "本中心为社区居民提供基本医疗与公共卫生服务，涵盖预防接种、儿童保健、慢性病管理、健康体检等。坚持预防为主、便民惠民，守护居民健康。（演示版文案）",
    notices: [
      { id: 1, title: "五一假期门诊时间调整公告", date: "2026-04-28" },
      { id: 2, title: "儿童疫苗接种日安排（5月）", date: "2026-05-02" },
      { id: 3, title: "老年人免费体检开始预约", date: "2026-05-08" },
    ],
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
});
