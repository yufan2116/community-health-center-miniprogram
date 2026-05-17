var adminAuth = require("../../../utils/adminAuth.js");
var adminCloud = require("../../../utils/adminCloud.js");
var adminExcelExport = require("../../../utils/adminExcelExport.js");

function todayTag() {
  var t = new Date();
  var m = t.getMonth() + 1;
  var d = t.getDate();
  return (
    t.getFullYear() +
    (m < 10 ? "0" : "") +
    m +
    (d < 10 ? "0" : "") +
    d
  );
}

Page({
  data: {
    filterOptions: ["全部", "门诊", "疫苗", "家庭医生"],
    filterIndex: 0,
    list: [],
    loading: true,
    exporting: false,
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
      .listAppointments(q)
      .then(function (res) {
        var rows = (res.data || []).slice();
        rows.sort(function (a, b) {
          return (b.createdAt || b.createTime || 0) - (a.createdAt || a.createTime || 0);
        });
        that.setData({ list: rows });
      })
      .catch(function () {
        that.setData({ list: [] });
        wx.showToast({ title: "数据加载失败", icon: "none" });
      })
      .then(function () {
        that.setData({ loading: false });
      });
  },

  exportExcel: function () {
    var rows = this.data.list || [];
    if (!rows.length) {
      wx.showToast({ title: "无数据可导出", icon: "none" });
      return;
    }
    var that = this;
    var cat = this.data.filterOptions[this.data.filterIndex];
    var base = "预约记录_" + cat + "_" + todayTag();
    this.setData({ exporting: true });
    adminExcelExport
      .writeAndDeliverCsv(base, adminExcelExport.appointmentsToCsv(rows))
      .catch(function (err) {
        console.warn("export appt", err);
        wx.showToast({ title: "导出失败", icon: "none" });
      })
      .then(function () {
        that.setData({ exporting: false });
      });
  },

  copyCsv: function () {
    var rows = this.data.list || [];
    if (!rows.length) {
      wx.showToast({ title: "无数据可导出", icon: "none" });
      return;
    }
    var csv = "\uFEFF" + adminExcelExport.appointmentsToCsv(rows);
    wx.setClipboardData({
      data: csv,
      success: function () {
        wx.showModal({
          title: "已复制",
          content: "已复制为 UTF-8 CSV，可直接粘贴到 Excel。",
          showCancel: false,
        });
      },
    });
  },
});
