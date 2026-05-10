var cloudStore = require("../../utils/cloudStore.js");

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
    ],
    serviceTypeIndex: 0,
    categories: ["门诊", "疫苗", "家庭医生"],
    categoryIndex: 0,
    submitting: false,
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
    this.setData({ serviceTypeIndex: Number(e.detail.value) });
  },

  onCategoryChange: function (e) {
    this.setData({ categoryIndex: Number(e.detail.value) });
  },

  validate: function () {
    var name = (this.data.name || "").trim();
    var phone = (this.data.phone || "").trim();
    var date = this.data.date || "";
    if (!name) {
      wx.showToast({ title: "请填写姓名", icon: "none" });
      return false;
    }
    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: "请填写11位手机号", icon: "none" });
      return false;
    }
    if (!date) {
      wx.showToast({ title: "请选择预约日期", icon: "none" });
      return false;
    }
    return true;
  },

  submit: function () {
    var that = this;
    if (!this.validate() || this.data.submitting) return;

    var serviceType = this.data.serviceTypes[this.data.serviceTypeIndex];
    var category = this.data.categories[this.data.categoryIndex];
    var phoneSaved = (this.data.phone || "").trim();
    this.setData({ submitting: true });

    cloudStore
      .saveAppointment({
        name: this.data.name,
        phone: this.data.phone,
        date: this.data.date,
        serviceType: serviceType,
        category: category,
      })
      .then(function (res) {
        var msg = res.usedLocal
          ? "已保存（当前为本地演示存储）"
          : "预约已提交";
        if (res.fallback) msg = "云端暂不可用，已改为本地保存";
        wx.showToast({ title: msg, icon: "success" });
        cloudStore.setResidentBindPhone(phoneSaved);
        that.setData({
          name: "",
          phone: "",
          date: "",
          serviceTypeIndex: 0,
          categoryIndex: 0,
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
