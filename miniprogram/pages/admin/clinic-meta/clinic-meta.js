var adminAuth = require("../../../utils/adminAuth.js");
var adminCloud = require("../../../utils/adminCloud.js");

function deptNameMap(list) {
  var m = {};
  (list || []).forEach(function (d) {
    var id = String(d.id || d._id || "");
    if (id) m[id] = d.name || "";
  });
  return m;
}

Page({
  data: {
    loading: true,
    deptList: [],
    deptPickerNames: [],
    docDeptIndex: 0,
    docRows: [],
    deptName: "",
    editingDeptId: "",
    docName: "",
    editingDocId: "",
    savingDept: false,
    savingDoc: false,
  },

  onShow: function () {
    if (!adminAuth.isLoggedIn()) {
      wx.redirectTo({ url: "/pages/admin/login/login" });
      return;
    }
    this.loadAll();
  },

  loadAll: function () {
    var that = this;
    this.setData({ loading: true });
    adminCloud
      .listDepartments()
      .then(function (res) {
        var depts = (res.data || []).slice();
        var names = depts.map(function (d) {
          return d.name || "未命名";
        });
        var pickerNames = names.length ? names : ["（请先新增科室）"];
        var patch = {
          deptList: depts,
          deptPickerNames: pickerNames,
          docDeptIndex: depts.length ? Math.min(that.data.docDeptIndex, depts.length - 1) : 0,
        };
        if (!depts.length) {
          patch.docDeptIndex = 0;
        }
        that.setData(patch);
        return adminCloud.listDoctors();
      })
      .then(function (res) {
        var docs = (res.data || []).slice();
        var dm = deptNameMap(that.data.deptList);
        var rows = docs.map(function (x) {
          var did = String(x.departmentId || "");
          return Object.assign({}, x, {
            departmentName: dm[did] || did || "—",
          });
        });
        rows.sort(function (a, b) {
          return String(a.departmentName).localeCompare(String(b.departmentName));
        });
        that.setData({ docRows: rows });
      })
      .catch(function () {
        that.setData({ deptList: [], docRows: [], deptPickerNames: ["（请先新增科室）"] });
        wx.showToast({ title: "数据加载失败", icon: "none" });
      })
      .then(function () {
        that.setData({ loading: false });
      });
  },

  onDeptName: function (e) {
    this.setData({ deptName: e.detail.value });
  },

  onDocName: function (e) {
    this.setData({ docName: e.detail.value });
  },

  onDocDeptChange: function (e) {
    this.setData({ docDeptIndex: Number(e.detail.value) });
  },

  cancelDeptEdit: function () {
    this.setData({ editingDeptId: "", deptName: "" });
  },

  cancelDocEdit: function () {
    this.setData({ editingDocId: "", docName: "" });
  },

  editDept: function (e) {
    var id = e.currentTarget.dataset.id;
    var list = this.data.deptList || [];
    var row = null;
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].id || list[i]._id) === String(id)) {
        row = list[i];
        break;
      }
    }
    if (!row) return;
    this.setData({
      editingDeptId: String(row.id || row._id),
      deptName: row.name || "",
    });
  },

  saveDept: function () {
    var that = this;
    var name = (this.data.deptName || "").trim();
    if (!name) {
      wx.showToast({ title: "请填写科室名称", icon: "none" });
      return;
    }
    var payload = { name: name };
    if (this.data.editingDeptId) {
      payload.id = this.data.editingDeptId;
    }
    this.setData({ savingDept: true });
    adminCloud
      .saveDepartment(payload)
      .then(function (res) {
        if (res && res.ok === false) {
          wx.showToast({
            title: res.message || "本地存储失败，请清理缓存后重试",
            icon: "none",
          });
          return;
        }
        wx.showToast({ title: "已保存", icon: "success" });
        that.setData({ deptName: "", editingDeptId: "" });
        that.loadAll();
      })
      .catch(function (err) {
        wx.showToast({
          title: (err && err.message) || "保存失败",
          icon: "none",
        });
      })
      .then(function () {
        that.setData({ savingDept: false });
      });
  },

  deleteDept: function (e) {
    var id = e.currentTarget.dataset.id;
    var that = this;
    wx.showModal({
      title: "删除科室",
      content: "将同时删除该科室下的全部医生，确定吗？",
      success: function (r) {
        if (!r.confirm) return;
        adminCloud
          .deleteDepartment(id)
          .then(function (res) {
            if (res && res.ok === false) {
              wx.showToast({
                title: res.message || "本地存储失败，请清理缓存后重试",
                icon: "none",
              });
              return;
            }
            wx.showToast({ title: "已删除", icon: "success" });
            if (String(that.data.editingDeptId) === String(id)) {
              that.cancelDeptEdit();
            }
            that.loadAll();
          })
          .catch(function () {
            wx.showToast({ title: "删除失败", icon: "none" });
          });
      },
    });
  },

  editDoc: function (e) {
    var id = e.currentTarget.dataset.id;
    var rows = this.data.docRows || [];
    var row = null;
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i].id || rows[i]._id) === String(id)) {
        row = rows[i];
        break;
      }
    }
    if (!row) return;
    var depts = this.data.deptList || [];
    var depId = String(row.departmentId || "");
    var idx = 0;
    for (var j = 0; j < depts.length; j++) {
      if (String(depts[j].id || depts[j]._id) === depId) {
        idx = j;
        break;
      }
    }
    this.setData({
      editingDocId: String(row.id || row._id),
      docName: row.name || "",
      docDeptIndex: depts.length ? idx : 0,
    });
  },

  saveDoc: function () {
    var that = this;
    var name = (this.data.docName || "").trim();
    if (!name) {
      wx.showToast({ title: "请填写医生姓名", icon: "none" });
      return;
    }
    var depts = this.data.deptList || [];
    if (!depts.length) {
      wx.showToast({ title: "请先新增科室", icon: "none" });
      return;
    }
    var di = Math.min(this.data.docDeptIndex, depts.length - 1);
    var dep = depts[di];
    var depId = String(dep.id || dep._id);
    var payload = {
      name: name,
      departmentId: depId,
    };
    if (this.data.editingDocId) {
      payload.id = this.data.editingDocId;
    }
    this.setData({ savingDoc: true });
    adminCloud
      .saveDoctor(payload)
      .then(function (res) {
        if (res && res.ok === false) {
          wx.showToast({
            title: res.message || "本地存储失败，请清理缓存后重试",
            icon: "none",
          });
          return;
        }
        wx.showToast({ title: "已保存", icon: "success" });
        that.setData({ docName: "", editingDocId: "" });
        that.loadAll();
      })
      .catch(function (err) {
        var msg = "保存失败";
        if (err && err.message === "bad_department") msg = "科室无效，请刷新后重试";
        wx.showToast({ title: msg, icon: "none" });
      })
      .then(function () {
        that.setData({ savingDoc: false });
      });
  },

  deleteDoc: function (e) {
    var id = e.currentTarget.dataset.id;
    var that = this;
    wx.showModal({
      title: "删除医生",
      content: "确定删除该医生？",
      success: function (r) {
        if (!r.confirm) return;
        adminCloud
          .deleteDoctor(id)
          .then(function (res) {
            if (res && res.ok === false) {
              wx.showToast({
                title: res.message || "本地存储失败，请清理缓存后重试",
                icon: "none",
              });
              return;
            }
            wx.showToast({ title: "已删除", icon: "success" });
            if (String(that.data.editingDocId) === String(id)) {
              that.cancelDocEdit();
            }
            that.loadAll();
          })
          .catch(function () {
            wx.showToast({ title: "删除失败", icon: "none" });
          });
      },
    });
  },
});
