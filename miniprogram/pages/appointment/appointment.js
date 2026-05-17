var cloudStore = require("../../utils/cloudStore.js");
var serviceItems = require("../../utils/serviceItems.js");
var phoneValidate = require("../../utils/phoneValidate.js");

var REG_TYPE = "挂号";

Page({
  data: {
    name: "",
    phone: "",
    date: "",
    serviceTypes: [
      "疫苗接种",
      "儿童保健",
      "慢病管理",
      "健康体检",
      "全科诊疗",
      REG_TYPE,
      "家庭医生签约",
      "中医药服务",
      "健康小屋与自助检测",
    ],
    serviceTypeIndex: 0,
    categories: ["门诊", "疫苗", "家庭医生"],
    categoryIndex: 0,
    submitting: false,
    isRegistration: false,
    departments: [],
    departmentNames: [],
    departmentIndex: 0,
    doctors: [],
    doctorNames: [],
    doctorIndex: 0,
  },

  onLoad: function () {
    this.syncRegistrationFlag();
  },

  onShow: function () {
    var app = getApp();
    if (!app || !app.globalData) return;
    var pending = app.globalData.pendingAppointmentServiceType;
    if (pending) {
      app.globalData.pendingAppointmentServiceType = "";
    }
    var types = this.data.serviceTypes;
    var idx = pending ? types.indexOf(pending) : -1;
    var catIdx = pending
      ? serviceItems.getCategoryIndexForServiceName(pending)
      : this.data.categoryIndex;
    var patch = {};
    if (pending) {
      patch.categoryIndex = catIdx;
      if (idx >= 0) {
        patch.serviceTypeIndex = idx;
      }
    }
    var that = this;
    this.setData(patch, function () {
      that.syncRegistrationFlag();
      if (that.data.isRegistration) {
        that.loadRegistrationMeta();
      }
    });
  },

  syncRegistrationFlag: function () {
    var st = this.data.serviceTypes[this.data.serviceTypeIndex];
    this.setData({ isRegistration: st === REG_TYPE });
  },

  loadRegistrationMeta: function () {
    var that = this;
    cloudStore
      .listDepartments()
      .then(function (deps) {
        var names = deps.map(function (d) {
          return d.name;
        });
        var patch = {
          departments: deps,
          departmentNames: names,
          departmentIndex: deps.length ? 0 : 0,
        };
        that.setData(patch, function () {
          if (deps.length) {
            that.refreshDoctorsForDepartment(0);
          } else {
            that.setData({ doctors: [], doctorNames: [], doctorIndex: 0 });
          }
        });
      })
      .catch(function () {
        that.setData({
          departments: [],
          departmentNames: [],
          departmentIndex: 0,
          doctors: [],
          doctorNames: [],
          doctorIndex: 0,
        });
        wx.showToast({ title: "数据加载失败", icon: "none" });
      });
  },

  refreshDoctorsForDepartment: function (depIdx) {
    var deps = this.data.departments || [];
    var d = deps[depIdx];
    var that = this;
    if (!d) {
      this.setData({ doctors: [], doctorNames: [], doctorIndex: 0 });
      return;
    }
    cloudStore
      .listDoctors(d.id)
      .then(function (docs) {
        var docNames = docs.map(function (x) {
          return x.name;
        });
        that.setData({
          doctors: docs,
          doctorNames: docNames,
          doctorIndex: docs.length ? 0 : 0,
        });
      })
      .catch(function () {
        that.setData({
          doctors: [],
          doctorNames: [],
          doctorIndex: 0,
        });
        wx.showToast({ title: "数据加载失败", icon: "none" });
      });
  },

  onNameInput: function (e) {
    this.setData({ name: e.detail.value });
  },

  onPhoneInput: function (e) {
    this.setData({ phone: e.detail.value });
  },

  onDateChange: function (e) {
    this.setData({ date: e.detail.value });
  },

  onServiceChange: function (e) {
    var idx = Number(e.detail.value);
    var patch = { serviceTypeIndex: idx };
    if (this.data.serviceTypes[idx] === REG_TYPE) {
      patch.categoryIndex = 0;
      patch.isRegistration = true;
    } else {
      patch.isRegistration = false;
    }
    var that = this;
    this.setData(patch, function () {
      if (that.data.isRegistration) {
        that.loadRegistrationMeta();
      }
    });
  },

  onCategoryChange: function (e) {
    this.setData({ categoryIndex: Number(e.detail.value) });
  },

  onDepartmentChange: function (e) {
    var i = Number(e.detail.value);
    this.setData({ departmentIndex: i });
    this.refreshDoctorsForDepartment(i);
  },

  onDoctorChange: function (e) {
    this.setData({ doctorIndex: Number(e.detail.value) });
  },

  validate: function () {
    var name = (this.data.name || "").trim();
    var phone = (this.data.phone || "").trim();
    var date = this.data.date || "";
    if (!name) {
      wx.showToast({ title: "请填写姓名", icon: "none" });
      return false;
    }
    var pv = phoneValidate.validatePhoneSubmit(phone);
    if (!pv.ok) {
      wx.showToast({ title: pv.message, icon: "none" });
      return false;
    }
    if (!date) {
      wx.showToast({ title: "请选择预约日期", icon: "none" });
      return false;
    }
    if (this.data.isRegistration) {
      var deps = this.data.departments || [];
      if (!deps.length) {
        wx.showToast({
          title: "暂无科室，请管理员在后台维护",
          icon: "none",
        });
        return false;
      }
      var docs = this.data.doctors || [];
      if (!docs.length) {
        wx.showToast({
          title: "该科室暂无医生，请更换科室或联系管理员",
          icon: "none",
        });
        return false;
      }
    }
    return true;
  },

  submit: function () {
    var that = this;
    if (!this.validate() || this.data.submitting) return;

    var serviceType = this.data.serviceTypes[this.data.serviceTypeIndex];
    var category = this.data.isRegistration
      ? "门诊"
      : this.data.categories[this.data.categoryIndex];
    var pvPhone = phoneValidate.validatePhoneSubmit(
      (this.data.phone || "").trim()
    );
    var payload = {
      name: (this.data.name || "").trim(),
      phone: pvPhone.ok ? pvPhone.normalized : this.data.phone,
      date: (this.data.date || "").trim(),
      serviceType: serviceType,
      category: category,
    };
    if (this.data.isRegistration) {
      var di = this.data.departmentIndex;
      var doci = this.data.doctorIndex;
      var dep = this.data.departments[di];
      var doc = this.data.doctors[doci];
      if (!dep || !doc) {
        wx.showToast({ title: "请选择科室与医生", icon: "none" });
        return;
      }
      payload.departmentId = dep.id;
      payload.departmentName = dep.name;
      payload.doctorId = doc.id;
      payload.doctorName = doc.name;
    }

    this.setData({ submitting: true });

    cloudStore
      .saveAppointment(payload)
      .then(function (res) {
        if (res && res.ok === false) {
          wx.showToast({
            title: res.message || "本地存储失败，请清理缓存后重试",
            icon: "none",
          });
          return;
        }
        wx.showToast({ title: "预约已保存（本地演示）", icon: "success" });
        that.setData({
          name: "",
          phone: "",
          date: "",
          serviceTypeIndex: 0,
          categoryIndex: 0,
          isRegistration: false,
          departments: [],
          departmentNames: [],
          departmentIndex: 0,
          doctors: [],
          doctorNames: [],
          doctorIndex: 0,
        });
      })
      .catch(function () {
        wx.showToast({ title: "保存失败", icon: "none" });
      })
      .then(function () {
        that.setData({ submitting: false });
      });
  },
});
