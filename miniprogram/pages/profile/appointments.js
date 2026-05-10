var cloudStore = require("../../utils/cloudStore.js");

Page({
  data: {
    list: [],
    loading: true,
    emptyText: "暂无预约记录",
  },

  onShow: function () {
    this.load();
  },

  load: function () {
    var that = this;
    this.setData({ loading: true });
    cloudStore
      .listAppointments()
      .then(function (rows) {
        that.setData({
          list: rows || [],
          emptyText:
            rows && rows.length
              ? ""
              : "暂无预约记录，可在「预约」页提交一条试试。",
        });
      })
      .catch(function () {
        that.setData({
          list: [],
          emptyText: "加载失败，请稍后重试",
        });
      })
      .then(function () {
        that.setData({ loading: false });
      });
  },
});
