var cloudStore = require("../../utils/cloudStore.js");
var phoneValidate = require("../../utils/phoneValidate.js");

function emptyForm(phone) {
  return {
    phone: phone || "",
    residentName: "",
    gender: "",
    birthDate: "",
    nation: "",
    idNumber: "",
    address: "",
    occupation: "",
    emergencyName: "",
    emergencyPhone: "",
    bloodType: "",
    heightCm: "",
    weightKg: "",
    healthNote: "",
    allergies: "",
    exposureHistory: "",
    pastHistory: "",
    familyHistory: "",
    geneticHistory: "",
    disabilityStatus: "",
  };
}

Page({
  data: {
    hasPhone: false,
    phoneDisplay: "",
    form: emptyForm(""),
    saving: false,
  },

  onShow: function () {
    this.reload();
  },

  reload: function () {
    var phone = cloudStore.getCurrentResidentPhone();
    if (!phone) {
      this.setData({ hasPhone: false, form: emptyForm("") });
      return;
    }
    var that = this;
    this.setData({ hasPhone: true, phoneDisplay: phone });
    cloudStore
      .getResidentPersonalArchiveByPhone(phone)
      .then(function (row) {
        that.setData({ form: row || emptyForm(phone) });
      })
      .catch(function () {
        that.setData({ form: emptyForm(phone) });
        wx.showToast({ title: "内容加载失败", icon: "none" });
      });
  },

  goProfile: function () {
    wx.switchTab({ url: "/pages/profile/profile" });
  },

  onField: function (e) {
    var k = e.currentTarget.dataset.k;
    if (!k) return;
    var o = {};
    o["form." + k] = e.detail.value;
    this.setData(o);
  },

  onBirthPick: function (e) {
    this.setData({ "form.birthDate": e.detail.value || "" });
  },

  /** 居民端保存前必填（演示作业口径） */
  validateForm: function (f) {
    f = f || {};
    if (!String(f.residentName || "").trim()) {
      wx.showToast({ title: "请填写姓名", icon: "none" });
      return false;
    }
    if (!String(f.gender || "").trim()) {
      wx.showToast({ title: "请填写性别", icon: "none" });
      return false;
    }
    if (!String(f.birthDate || "").trim()) {
      wx.showToast({ title: "请选择出生日期", icon: "none" });
      return false;
    }
    if (!String(f.address || "").trim()) {
      wx.showToast({ title: "请填写常住地址", icon: "none" });
      return false;
    }
    var needText = [
      { k: "allergies", label: "过敏史" },
      { k: "exposureHistory", label: "暴露史" },
      { k: "pastHistory", label: "既往史" },
      { k: "familyHistory", label: "家族史" },
      { k: "geneticHistory", label: "遗传病史" },
      { k: "disabilityStatus", label: "残疾状况" },
    ];
    for (var i = 0; i < needText.length; i++) {
      var item = needText[i];
      if (!String(f[item.k] || "").trim()) {
        wx.showToast({
          title: "请填写" + item.label + "（无则填「无」）",
          icon: "none",
        });
        return false;
      }
    }
    var en = String(f.emergencyName || "").trim();
    var ep = String(f.emergencyPhone || "").replace(/\D/g, "");
    if (en && !ep) {
      wx.showToast({ title: "请填写紧急联系电话", icon: "none" });
      return false;
    }
    if (ep && !en) {
      wx.showToast({ title: "请填写紧急联系人姓名", icon: "none" });
      return false;
    }
    if (ep && !phoneValidate.CN_MOBILE.test(ep)) {
      wx.showToast({ title: "紧急联系电话格式不正确", icon: "none" });
      return false;
    }
    return true;
  },

  save: function () {
    var that = this;
    var phone = cloudStore.getCurrentResidentPhone();
    if (!phone) {
      wx.showToast({ title: "请先绑定手机号", icon: "none" });
      return;
    }
    var f = this.data.form || {};
    if (!this.validateForm(f)) return;
    this.setData({ saving: true });
    var payload = Object.assign({}, f, { phone: phone });
    cloudStore
      .saveResidentPersonalArchive(payload)
      .then(function (res) {
        if (res && res.ok === false) {
          wx.showToast({
            title: res.message || "本地存储失败，请清理缓存后重试",
            icon: "none",
          });
          return;
        }
        wx.showToast({ title: "已保存", icon: "success" });
        that.reload();
      })
      .catch(function (err) {
        var msg = "保存失败";
        if (err && err.message === "no_phone") msg = "手机号无效";
        wx.showToast({ title: msg, icon: "none" });
      })
      .then(function () {
        that.setData({ saving: false });
      });
  },
});
