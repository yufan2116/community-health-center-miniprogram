var adminAuth = require("../../../utils/adminAuth.js");
var adminCloud = require("../../../utils/adminCloud.js");

function escapeCsv(s) {
  s = String(s == null ? "" : s);
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function toCsv(rows) {
  var header = "姓名,手机,性别,年龄,血压,慢病,最近就诊,备注";
  var lines = [header];
  (rows || []).forEach(function (r) {
    lines.push(
      [
        r.name,
        r.phone,
        r.gender,
        r.age,
        r.bloodPressure,
        r.chronic,
        r.lastVisit,
        r.note,
      ]
        .map(escapeCsv)
        .join(",")
    );
  });
  return lines.join("\n");
}

Page({
  data: {
    list: [],
    loading: true,
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
        wx.showToast({ title: "加载失败", icon: "none" });
      })
      .then(function () {
        that.setData({ loading: false });
      });
  },

  exportCsv: function () {
    var rows = this.data.list || [];
    if (!rows.length) {
      wx.showToast({ title: "无数据可导出", icon: "none" });
      return;
    }
    var csv = toCsv(rows);
    wx.setClipboardData({
      data: csv,
      success: function () {
        wx.showModal({
          title: "已复制",
          content: "CSV 已复制到剪贴板，可粘贴到 Excel 或记事本（演示）。",
          showCancel: false,
        });
      },
    });
  },
});
