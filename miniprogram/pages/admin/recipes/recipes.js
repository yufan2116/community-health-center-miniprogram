var adminAuth = require("../../../utils/adminAuth.js");
var adminCloud = require("../../../utils/adminCloud.js");

Page({
  data: {
    list: [],
    loading: true,
    title: "",
    tags: "",
    ingredients: "",
    steps: "",
    adding: false,
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
      .listRecipes()
      .then(function (res) {
        var rows = (res.data || []).slice();
        rows.sort(function (a, b) {
          return (b.createTime || 0) - (a.createTime || 0);
        });
        that.setData({ list: rows });
      })
      .catch(function () {
        that.setData({ list: [] });
      })
      .then(function () {
        that.setData({ loading: false });
      });
  },

  onTitle: function (e) {
    this.setData({ title: e.detail.value });
  },
  onTags: function (e) {
    this.setData({ tags: e.detail.value });
  },
  onIng: function (e) {
    this.setData({ ingredients: e.detail.value });
  },
  onSteps: function (e) {
    this.setData({ steps: e.detail.value });
  },

  add: function () {
    var that = this;
    var title = (this.data.title || "").trim();
    if (!title) {
      wx.showToast({ title: "请填写菜谱名称", icon: "none" });
      return;
    }
    this.setData({ adding: true });
    adminCloud
      .addRecipe({
        title: title,
        tags: (this.data.tags || "").trim(),
        ingredients: (this.data.ingredients || "").trim(),
        steps: (this.data.steps || "").trim(),
      })
      .then(function () {
        wx.showToast({ title: "已添加", icon: "success" });
        that.setData({
          title: "",
          tags: "",
          ingredients: "",
          steps: "",
        });
        that.load();
      })
      .catch(function () {
        wx.showToast({ title: "添加失败", icon: "none" });
      })
      .then(function () {
        that.setData({ adding: false });
      });
  },
});
