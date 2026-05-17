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
    list: [],
    loading: true,
    exporting: false,
  },

  onShow: function () {
    if (!adminAuth.isLoggedIn()) {
      wx.redirectTo({ url: "/pages/admin/login/login" });
      return;
    }
    var that = this;
    this.setData({ loading: true });
    adminCloud
      .listHealthRecords()
      .then(function (res) {
        that.setData({ list: res.data || [] });
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
    this.setData({ exporting: true });
    adminExcelExport
      .writeAndDeliverCsv("公卫演示档案_" + todayTag(), adminExcelExport.healthRecordsToCsv(rows))
      .catch(function (err) {
        console.warn("export records", err);
        wx.showToast({ title: "导出失败", icon: "none" });
      })
      .then(function () {
        that.setData({ exporting: false });
      });
  },

  exportCsv: function () {
    var rows = this.data.list || [];
    if (!rows.length) {
      wx.showToast({ title: "无数据可导出", icon: "none" });
      return;
    }
    var csv = "\uFEFF" + adminExcelExport.healthRecordsToCsv(rows);
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
