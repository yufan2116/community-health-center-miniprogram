var cloudStore = require("../../utils/cloudStore.js");
var phoneValidate = require("../../utils/phoneValidate.js");

function toMobile11(v) {
  return phoneValidate.normalizeMainlandMobile(v);
}

/** 输入过程中只过滤数字、最多 11 位，不要用 toMobile11（未满 11 位会变成空） */
function digitsInput(v) {
  return phoneValidate.digitsInputSlice11(v);
}

Page({
  data: {
    phone: "",
    plan: null,
    loading: false,
    emptyHint: "",
  },

  onShow: function () {
    this.setData({
      phone: "",
      plan: null,
      emptyHint: "",
      loading: false,
    });
  },

  onPhoneInput: function (e) {
    this.setData({ phone: digitsInput(e.detail.value) });
  },

  loadPlan: function (phone) {
    var that = this;
    var p = toMobile11(phone);
    if (!p) {
      var pv = phoneValidate.validatePhoneSubmit(phone);
      wx.showToast({
        title: pv.ok === false ? pv.message : "手机号格式不正确",
        icon: "none",
      });
      this.setData({ loading: false });
      return;
    }
    this.setData({ loading: true, emptyHint: "", phone: p });
    cloudStore
      .getDietPlanByPhone(p)
      .then(function (doc) {
        if (doc) {
          that.setData({
            plan: {
              title: doc.title || "",
              advice: doc.advice || "",
              content: doc.content || "",
              residentName: doc.residentName || "",
              linkedRecipe: doc.linkedRecipe || "",
            },
            emptyHint: "",
          });
        } else {
          that.setData({
            plan: null,
            emptyHint:
              "暂无与您手机号关联的食疗方案。请确认管理后台「食疗方案」中该手机号的记录已保存，或在后台执行「初始化演示数据」。",
          });
        }
      })
      .catch(function () {
        that.setData({
          plan: null,
          emptyHint: "",
        });
        wx.showToast({ title: "内容加载失败", icon: "none" });
      })
      .then(function () {
        that.setData({ loading: false });
      });
  },

  onQuery: function () {
    var raw = this.data.phone;
    var pv = phoneValidate.validatePhoneSubmit(raw);
    if (!pv.ok) {
      wx.showToast({ title: pv.message, icon: "none" });
      return;
    }
    var p = pv.normalized;
    this.setData({ phone: p });
    var wr = cloudStore.setCurrentResidentPhone(p);
    if (!wr.ok) {
      wx.showToast({
        title: cloudStore.LOCAL_STORAGE_FAIL_MSG,
        icon: "none",
      });
      return;
    }
    this.loadPlan(p);
  },
});
