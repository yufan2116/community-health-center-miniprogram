var adminAuth = require("../../../utils/adminAuth.js");
var adminCloud = require("../../../utils/adminCloud.js");

Page({
  data: {
    filterOptions: ["全部", "门诊", "疫苗", "家庭医生"],
    filterIndex: 0,
    list: [],
    loading: true,
  },

  onShow: function () {
    if (!adminAuth.isLoggedIn()) {
      wx.redirectTo({ url: "/pages/admin/login/login" });
      return;
    }
    this.reload();
  },

  onFilterChange: function (e) {
    this.setData({ filterIndex: Number(e.detail.value) }, this.reload);
  },

  reload: function () {
    var that = this;
    var cat = this.data.filterOptions[this.data.filterIndex];
    var q = cat === "全部" ? "" : cat;
    this.setData({ loading: true });
    adminCloud
      .listAllAppointments(q)
      .then(function (res) {
        var rows = (res.data || []).slice();
        rows.sort(function (a, b) {
          return (b.createTime || 0) - (a.createTime || 0);
        });
        that.setData({ list: rows });
      })
      .catch(function () {
        that.setData({ list: [] });
        wx.showToast({ title: "加载失败（云权限/网络）", icon: "none" });
      })
      .then(function () {
        that.setData({ loading: false });
      });
  },
});
