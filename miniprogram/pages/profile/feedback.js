var cloudStore = require("../../utils/cloudStore.js");
var phoneValidate = require("../../utils/phoneValidate.js");

Page({
  data: {
    content: "",
    contact: "",
    submitting: false,
  },

  onContent: function (e) {
    this.setData({ content: e.detail.value });
  },

  onContact: function (e) {
    this.setData({ contact: e.detail.value });
  },

  submit: function () {
    var that = this;
    var content = (this.data.content || "").trim();
    if (!content) {
      wx.showToast({ title: "请填写反馈内容", icon: "none" });
      return;
    }
    var contact = (this.data.contact || "").trim();
    if (!contact) {
      wx.showToast({ title: "请填写联系方式", icon: "none" });
      return;
    }
    var onlyDigits = /^\d+$/.test(contact.replace(/\s/g, ""));
    var contactOut = contact;
    if (onlyDigits) {
      var pv = phoneValidate.validatePhoneSubmit(contact);
      if (!pv.ok) {
        wx.showToast({ title: pv.message, icon: "none" });
        return;
      }
      contactOut = pv.normalized;
    }
    if (this.data.submitting) return;
    this.setData({ submitting: true });

    cloudStore
      .saveFeedback({
        content: content,
        contact: contactOut,
      })
      .then(function (res) {
        if (res && res.ok === false) {
          wx.showToast({
            title: res.message || "本地存储失败，请清理缓存后重试",
            icon: "none",
          });
          return;
        }
        wx.showToast({ title: "反馈已提交（本地演示）", icon: "success" });
        that.setData({ content: "", contact: "" });
      })
      .catch(function () {
        wx.showToast({ title: "提交失败", icon: "none" });
      })
      .then(function () {
        that.setData({ submitting: false });
      });
  },
});
