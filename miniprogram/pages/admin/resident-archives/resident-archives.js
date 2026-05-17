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

function formatTs(ts) {
  if (!ts) return "—";
  try {
    var d = new Date(Number(ts));
    if (isNaN(d.getTime())) return "—";
    var y = d.getFullYear();
    var mo = d.getMonth() + 1;
    var day = d.getDate();
    var h = d.getHours();
    var mi = d.getMinutes();
    function z(n) {
      return n < 10 ? "0" + n : "" + n;
    }
    return y + "-" + z(mo) + "-" + z(day) + " " + z(h) + ":" + z(mi);
  } catch (e) {
    return "—";
  }
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
    this.load();
  },

  load: function () {
    var that = this;
    this.setData({ loading: true });
    adminCloud
      .listResidentPersonalArchives()
      .then(function (res) {
        var rows = (res.data || []).map(function (r) {
          return Object.assign({}, r, {
            _updatedText: formatTs(r.updatedAt || r.createTime || r.createdAt),
          });
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

  openDetail: function (e) {
    var phone = e.currentTarget.dataset.phone;
    if (!phone) return;
    wx.navigateTo({
      url:
        "/pages/admin/resident-archive-detail/resident-archive-detail?phone=" +
        encodeURIComponent(phone),
    });
  },

  exportCsv: function () {
    var rows = this.data.list || [];
    if (!rows.length) {
      wx.showToast({ title: "无数据可导出", icon: "none" });
      return;
    }
    var that = this;
    this.setData({ exporting: true });
    adminExcelExport
      .writeAndDeliverCsv(
        "居民自填档案_" + todayTag(),
        adminExcelExport.residentPersonalArchivesToCsv(rows)
      )
      .catch(function () {
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
    var csv = "\uFEFF" + adminExcelExport.residentPersonalArchivesToCsv(rows);
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
