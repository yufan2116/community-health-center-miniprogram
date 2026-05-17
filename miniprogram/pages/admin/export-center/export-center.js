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
    tab: "appt",
    filterOptions: ["全部", "门诊", "疫苗", "家庭医生"],
    filterIndex: 0,
    apptList: [],
    apptLoading: true,
    recList: [],
    recLoading: true,
    dossierList: [],
    dossierLoading: true,
    exporting: false,
  },

  onShow: function () {
    if (!adminAuth.isLoggedIn()) {
      wx.redirectTo({ url: "/pages/admin/login/login" });
      return;
    }
    this.reloadAppt();
    this.reloadRec();
    this.reloadDossier();
  },

  onTab: function (e) {
    var t = e.currentTarget.dataset.tab;
    if (!t) return;
    this.setData({ tab: t });
  },

  onFilterChange: function (e) {
    this.setData({ filterIndex: Number(e.detail.value) }, this.reloadAppt);
  },

  reloadAppt: function () {
    var that = this;
    var cat = this.data.filterOptions[this.data.filterIndex];
    var q = cat === "全部" ? "" : cat;
    this.setData({ apptLoading: true });
    adminCloud
      .listAppointments(q)
      .then(function (res) {
        var rows = (res.data || []).slice();
        rows.sort(function (a, b) {
          return (b.createdAt || b.createTime || 0) - (a.createdAt || a.createTime || 0);
        });
        that.setData({ apptList: rows });
      })
      .catch(function () {
        that.setData({ apptList: [] });
        wx.showToast({ title: "数据加载失败", icon: "none" });
      })
      .then(function () {
        that.setData({ apptLoading: false });
      });
  },

  reloadRec: function () {
    var that = this;
    this.setData({ recLoading: true });
    adminCloud
      .listHealthRecords()
      .then(function (res) {
        that.setData({ recList: res.data || [] });
      })
      .catch(function () {
        that.setData({ recList: [] });
        wx.showToast({ title: "数据加载失败", icon: "none" });
      })
      .then(function () {
        that.setData({ recLoading: false });
      });
  },

  reloadDossier: function () {
    var that = this;
    this.setData({ dossierLoading: true });
    adminCloud
      .listResidentPersonalArchives()
      .then(function (res) {
        that.setData({ dossierList: res.data || [] });
      })
      .catch(function () {
        that.setData({ dossierList: [] });
        wx.showToast({ title: "数据加载失败", icon: "none" });
      })
      .then(function () {
        that.setData({ dossierLoading: false });
      });
  },

  openDossierDetail: function (e) {
    var phone = e.currentTarget.dataset.phone;
    if (!phone) return;
    wx.navigateTo({
      url:
        "/pages/admin/resident-archive-detail/resident-archive-detail?phone=" +
        encodeURIComponent(phone),
    });
  },

  exportAppointments: function () {
    var rows = this.data.apptList || [];
    if (!rows.length) {
      wx.showToast({ title: "无数据可导出", icon: "none" });
      return;
    }
    var that = this;
    var cat = this.data.filterOptions[this.data.filterIndex];
    var base = "预约记录_" + cat + "_" + todayTag();
    var csv = adminExcelExport.appointmentsToCsv(rows);
    this.setData({ exporting: true });
    adminExcelExport
      .writeAndDeliverCsv(base, csv)
      .catch(function (err) {
        console.warn("export appt", err);
        wx.showToast({ title: "导出失败", icon: "none" });
      })
      .then(function () {
        that.setData({ exporting: false });
      });
  },

  exportRecords: function () {
    var rows = this.data.recList || [];
    if (!rows.length) {
      wx.showToast({ title: "无数据可导出", icon: "none" });
      return;
    }
    var that = this;
    var base = "公卫演示档案_" + todayTag();
    var csv = adminExcelExport.healthRecordsToCsv(rows);
    this.setData({ exporting: true });
    adminExcelExport
      .writeAndDeliverCsv(base, csv)
      .catch(function (err) {
        console.warn("export rec", err);
        wx.showToast({ title: "导出失败", icon: "none" });
      })
      .then(function () {
        that.setData({ exporting: false });
      });
  },

  exportDossier: function () {
    var rows = this.data.dossierList || [];
    if (!rows.length) {
      wx.showToast({ title: "无数据可导出", icon: "none" });
      return;
    }
    var that = this;
    var base = "居民自填档案_" + todayTag();
    var csv = adminExcelExport.residentPersonalArchivesToCsv(rows);
    this.setData({ exporting: true });
    adminExcelExport
      .writeAndDeliverCsv(base, csv)
      .catch(function (err) {
        console.warn("export dossier", err);
        wx.showToast({ title: "导出失败", icon: "none" });
      })
      .then(function () {
        that.setData({ exporting: false });
      });
  },
});
