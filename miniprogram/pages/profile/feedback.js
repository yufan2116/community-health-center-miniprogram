var cloudStore = require("../../utils/cloudStore.js");

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
    if (this.data.submitting) return;
    this.setData({ submitting: true });

    cloudStore
      .saveFeedback({
        content: content,
        contact: this.data.contact,
      })
      .then(function (res) {
        var msg = res.usedLocal
          ? "已提交（本地演示存储）"
          : "感谢您的反馈";
        if (res.fallback) msg = "云端不可用，已本地保存";
        wx.showToast({ title: msg, icon: "success" });
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
