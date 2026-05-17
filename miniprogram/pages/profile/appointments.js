var cloudStore = require("../../utils/cloudStore.js");

Page({
  data: {
    list: [],
    loading: true,
    emptyText: "",
  },

  onShow: function () {
    this.load();
  },

  load: function () {
    var that = this;
    var bound = cloudStore.getCurrentResidentPhone();
    if (!bound) {
      this.setData({
        loading: false,
        list: [],
        emptyText: "请先提交预约或绑定手机号",
      });
      return;
    }
    this.setData({ loading: true });
    cloudStore
      .listMyAppointments()
      .then(function (rows) {
        that.setData({
          list: rows || [],
          emptyText:
            rows && rows.length
              ? ""
              : "暂无与您手机号相关的预约记录，可在「预约」页提交。",
        });
      })
      .catch(function () {
        that.setData({
          list: [],
          emptyText: "数据加载失败，请稍后再试或检查本地存储。",
        });
        wx.showToast({ title: "数据加载失败", icon: "none" });
      })
      .then(function () {
        that.setData({ loading: false });
      });
  },
});
