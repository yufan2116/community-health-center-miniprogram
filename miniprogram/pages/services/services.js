var serviceItems = require("../../utils/serviceItems.js");

Page({
  data: {
    list: serviceItems.getListForPage(),
  },

  goAppointment: function () {
    wx.switchTab({ url: "/pages/appointment/appointment" });
  },

  openService: function (e) {
    var key = e.currentTarget.dataset.key;
    if (key == null || key === "") return;
    wx.navigateTo({
      url: "/pages/services/service-detail?key=" + encodeURIComponent(key),
    });
  },
});
